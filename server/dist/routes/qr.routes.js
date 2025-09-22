"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../middlewares/asyncHandler");
const auth_1 = require("../middlewares/auth");
const qr_controller_1 = require("../controllers/qr.controller");
const router = (0, express_1.Router)();
// Admin-only routes for QR token management
router.post("/generate", auth_1.requireAdmin, (0, asyncHandler_1.asyncHandler)(qr_controller_1.generateQrToken));
router.get("/", auth_1.requireAdmin, (0, asyncHandler_1.asyncHandler)(qr_controller_1.getQrTokens));
router.get("/counts", auth_1.requireAdmin, (0, asyncHandler_1.asyncHandler)(qr_controller_1.getQrTokenCountsController));
router.delete("/:id", auth_1.requireAdmin, (0, asyncHandler_1.asyncHandler)(qr_controller_1.deleteQrTokenController));
exports.default = router;
