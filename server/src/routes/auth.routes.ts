import { Router } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { requireAuth } from "../middlewares/auth";
import { login, verifyToken } from "../controllers/auth.controller";

const router = Router();

// Public routes
router.post("/login", asyncHandler(login));

// Protected routes
router.get("/verify", requireAuth, asyncHandler(verifyToken));

export default router;
