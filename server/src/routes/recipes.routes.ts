import { Router } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { getRecipes, getRecipe, postRecipe, putRecipe } from "../controllers/recipes.controller";
//import { requireAuth, requireOwner } from "../middlewares/requireOwner"; // swap to actual requireAuth/Owner as needed

const router = Router();

router.get("/", asyncHandler(getRecipes));
router.get("/:slug", asyncHandler(getRecipe));
router.post("/", asyncHandler(postRecipe)); 
router.put("/:id", asyncHandler(putRecipe));
// router.post("/", /* requireAuth, requireOwner, */ asyncHandler(postRecipe));

export default router;