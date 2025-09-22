"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listReviews = listReviews;
exports.createReview = createReview;
const client_1 = require("../prisma/client");
async function listReviews(recipeId) {
    return client_1.prisma.review.findMany({ where: { recipeId }, orderBy: { createdAt: "desc" } });
}
async function createReview(recipeId, data) {
    const review = await client_1.prisma.review.create({
        data: {
            recipeId,
            rating: data.rating,
            comment: data.comment,
            name: data.name ?? undefined
        },
    });
    const { _avg } = await client_1.prisma.review.aggregate({ where: { recipeId }, _avg: { rating: true } });
    await client_1.prisma.recipe.update({ where: { id: recipeId }, data: { avgRating: _avg.rating ?? 0 } });
    return review;
}
