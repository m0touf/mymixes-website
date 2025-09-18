import { prisma } from "../prisma/client";
import type { CreateReviewDTO } from "../validators/reviews.schema";

export async function listReviews(recipeId: number) {
    return prisma.review.findMany({ where: { recipeId }, orderBy: { createdAt: "desc" } });
}

export async function createReview(recipeId: number, userId: number | null, data: CreateReviewDTO & { name?: string }) {
    const review = await prisma.review.create({
        data: { 
            recipeId, 
            userId: userId ?? undefined, 
            rating: data.rating, 
            comment: data.comment,
            name: data.name ?? undefined
        },
    });
    const { _avg } = await prisma.review.aggregate({ where: { recipeId }, _avg: { rating: true } });
    await prisma.recipe.update({ where: { id: recipeId }, data: { avgRating: _avg.rating ?? 0 } });
    return review;
}
