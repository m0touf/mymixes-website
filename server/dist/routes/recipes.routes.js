"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../middlewares/asyncHandler");
const auth_1 = require("../middlewares/auth");
const recipes_controller_1 = require("../controllers/recipes.controller");
const router = (0, express_1.Router)();
// Public routes
router.get("/", (0, asyncHandler_1.asyncHandler)(recipes_controller_1.getRecipes));
router.get("/:slug", (0, asyncHandler_1.asyncHandler)(recipes_controller_1.getRecipe));
// Admin-only routes
router.post("/", auth_1.requireAdmin, (0, asyncHandler_1.asyncHandler)(recipes_controller_1.postRecipe));
router.put("/:id", auth_1.requireAdmin, (0, asyncHandler_1.asyncHandler)(recipes_controller_1.putRecipe));
router.delete("/:id", auth_1.requireAdmin, (0, asyncHandler_1.asyncHandler)(recipes_controller_1.deleteRecipeController));
exports.default = router;
