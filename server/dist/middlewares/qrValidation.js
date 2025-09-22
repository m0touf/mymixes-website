"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQrTokenMiddleware = validateQrTokenMiddleware;
const qr_service_1 = require("../services/qr.service");
async function validateQrTokenMiddleware(req, res, next) {
    const token = req.query.token;
    if (!token) {
        return res.status(400).json({ error: "QR token is required" });
    }
    try {
        const validation = await (0, qr_service_1.validateQrToken)(token);
        if (!validation.valid) {
            return res.status(403).json({ error: "Invalid or expired QR token" });
        }
        // Attach recipe ID to request for use in controllers
        req.qrRecipeId = validation.recipeId;
        next();
    }
    catch (error) {
        console.error("Error validating QR token:", error);
        res.status(500).json({ error: "Failed to validate QR token" });
    }
}
