"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecipeReviews = getRecipeReviews;
exports.postRecipeReview = postRecipeReview;
const reviews_schema_1 = require("../validators/reviews.schema");
const reviews_service_1 = require("../services/reviews.service");
async function getRecipeReviews(req, res) {
    const recipeId = Number(req.params.id);
    const reviews = await (0, reviews_service_1.listReviews)(recipeId);
    res.json(reviews);
}
async function postRecipeReview(req, res) {
    const recipeId = Number(req.params.id);
    const parsed = reviews_schema_1.CreateReviewInput.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.issues });
    const review = await (0, reviews_service_1.createReview)(recipeId, parsed.data);
    res.status(201).json(review);
}
