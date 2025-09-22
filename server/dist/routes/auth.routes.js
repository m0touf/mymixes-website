"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const asyncHandler_1 = require("../middlewares/asyncHandler");
const auth_1 = require("../middlewares/auth");
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
// Public routes
router.post("/login", (0, asyncHandler_1.asyncHandler)(auth_controller_1.login));
// Protected routes
router.get("/verify", auth_1.requireAuth, (0, asyncHandler_1.asyncHandler)(auth_controller_1.verifyToken));
exports.default = router;
