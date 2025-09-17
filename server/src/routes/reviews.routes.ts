import { Router } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { getRecipeReviews, postRecipeReview } from "../controllers/reviews.controller";
// import { requireAuth } from "../middlewares/requireAuth";

const router = Router({ mergeParams: true });

router.get("/:id/reviews", asyncHandler(getRecipeReviews));
router.post("/:id/reviews", /* requireAuth, */ asyncHandler(postRecipeReview));

export default router;