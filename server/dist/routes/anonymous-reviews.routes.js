"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../middlewares/asyncHandler");
const qrValidation_1 = require("../middlewares/qrValidation");
const anonymous_reviews_controller_1 = require("../controllers/anonymous-reviews.controller");
const router = (0, express_1.Router)();
// Anonymous review route (requires valid QR token)
router.post("/:id/anonymous-reviews", qrValidation_1.validateQrTokenMiddleware, (0, asyncHandler_1.asyncHandler)(anonymous_reviews_controller_1.postAnonymousReview));
exports.default = router;
