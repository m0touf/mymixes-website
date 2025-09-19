import { Router } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { getRecipeReviews, postRecipeReview } from "../controllers/reviews.controller";

const router = Router({ mergeParams: true });

router.get("/:id/reviews", asyncHandler(getRecipeReviews));
router.post("/:id/reviews", asyncHandler(postRecipeReview));

export default router;