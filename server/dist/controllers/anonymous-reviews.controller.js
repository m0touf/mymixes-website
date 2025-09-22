"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postAnonymousReview = postAnonymousReview;
const zod_1 = require("zod");
const reviews_service_1 = require("../services/reviews.service");
// Schema for anonymous reviews (includes name field)
const AnonymousReviewInput = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
    rating: zod_1.z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
    comment: zod_1.z.string().min(1, "Comment is required").max(500, "Comment must be less than 500 characters")
});
async function postAnonymousReview(req, res) {
    // Use the recipe ID from QR token validation (more secure)
    const recipeId = req.qrRecipeId;
    const token = req.query.token;
    // Parse and validate input
    const parsed = AnonymousReviewInput.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues });
    }
    try {
        // Create anonymous review
        const review = await (0, reviews_service_1.createReview)(recipeId, {
            rating: parsed.data.rating,
            comment: parsed.data.comment,
            name: parsed.data.name
        });
        res.status(201).json(review);
    }
    catch (error) {
        console.error("Error creating anonymous review:", error);
        res.status(500).json({ error: "Failed to create review" });
    }
}
