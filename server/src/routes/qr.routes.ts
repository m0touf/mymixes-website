import { Router } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { requireAdmin } from "../middlewares/auth";
import { generateQrToken, getQrTokens } from "../controllers/qr.controller";

const router = Router();

// Admin-only routes for QR token management
router.post("/generate", requireAdmin, asyncHandler(generateQrToken));
router.get("/", requireAdmin, asyncHandler(getQrTokens));

export default router;
