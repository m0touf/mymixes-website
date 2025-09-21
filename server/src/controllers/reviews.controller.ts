import type { Request, Response } from "express";
import { CreateReviewInput } from "../validators/reviews.schema";
import { createReview, listReviews } from "../services/reviews.service";

export async function getRecipeReviews(req: Request, res: Response) {
  const recipeId = Number(req.params.id);
  const reviews = await listReviews(recipeId);
  res.json(reviews);
}

export async function postRecipeReview(req: Request, res: Response) {
  const recipeId = Number(req.params.id);
  const parsed = CreateReviewInput.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });
  const review = await createReview(recipeId, parsed.data);
  res.status(201).json(review);
}