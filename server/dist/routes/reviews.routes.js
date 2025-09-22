"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../middlewares/asyncHandler");
const reviews_controller_1 = require("../controllers/reviews.controller");
const router = (0, express_1.Router)({ mergeParams: true });
router.get("/:id/reviews", (0, asyncHandler_1.asyncHandler)(reviews_controller_1.getRecipeReviews));
router.post("/:id/reviews", (0, asyncHandler_1.asyncHandler)(reviews_controller_1.postRecipeReview));
exports.default = router;
