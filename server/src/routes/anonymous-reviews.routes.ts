import { Router } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { validateQrTokenMiddleware } from "../middlewares/qrValidation";
import { postAnonymousReview } from "../controllers/anonymous-reviews.controller";

const router = Router();

// Anonymous review route (requires valid QR token)
router.post("/:id/anonymous-reviews", validateQrTokenMiddleware, asyncHandler(postAnonymousReview));

export default router;
