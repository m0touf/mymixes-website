import type { Request, Response } from "express";
import { z } from "zod";
import { createReview } from "../services/reviews.service";

// Schema for anonymous reviews (includes name field)
const AnonymousReviewInput = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z.string().min(1, "Comment is required").max(500, "Comment must be less than 500 characters")
});

export async function postAnonymousReview(req: Request, res: Response) {
  // Use the recipe ID from QR token validation (more secure)
  const recipeId = req.qrRecipeId!;
  const token = req.query.token as string;
  
  // Parse and validate input
  const parsed = AnonymousReviewInput.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues });
  }

  try {
    // Create review with null userId (anonymous)
    const review = await createReview(recipeId, null, {
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      name: parsed.data.name
    });

    res.status(201).json(review);
  } catch (error) {
    console.error("Error creating anonymous review:", error);
    res.status(500).json({ error: "Failed to create review" });
  }
}
