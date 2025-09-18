import { Router } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { requireAdmin } from "../middlewares/auth";
import { getRecipes, getRecipe, postRecipe, putRecipe } from "../controllers/recipes.controller";

const router = Router();

// Public routes
router.get("/", asyncHandler(getRecipes));
router.get("/:slug", asyncHandler(getRecipe));

// Admin-only routes
router.post("/", requireAdmin, asyncHandler(postRecipe)); 
router.put("/:id", requireAdmin, asyncHandler(putRecipe));

export default router;