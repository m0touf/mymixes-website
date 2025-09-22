"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQrToken = generateQrToken;
exports.getQrTokens = getQrTokens;
exports.deleteQrTokenController = deleteQrTokenController;
exports.getQrTokenCountsController = getQrTokenCountsController;
const zod_1 = require("zod");
const qr_service_1 = require("../services/qr.service");
// Schema for generating QR tokens
const GenerateQrInput = zod_1.z.object({
    recipeId: zod_1.z.number().int().positive("Recipe ID must be a positive integer"),
});
async function generateQrToken(req, res) {
    const parsed = GenerateQrInput.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues });
    }
    try {
        const qrData = await (0, qr_service_1.generateSecureQrToken)(parsed.data.recipeId);
        // Generate the QR URL
        const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const qrUrl = `${baseUrl}/#/review/${qrData.recipeId}?token=${qrData.token}`;
        res.json({
            id: qrData.id, // Use the actual database ID
            token: qrData.token,
            qrUrl,
            expiresAt: qrData.expiresAt,
            recipeId: qrData.recipeId,
            recipe: qrData.recipe, // Recipe info is now included from the service
            used: false,
        });
    }
    catch (error) {
        console.error("Error generating QR token:", error);
        res.status(500).json({ error: "Failed to generate QR token" });
    }
}
async function getQrTokens(req, res) {
    try {
        const recipeId = req.query.recipeId ? Number(req.query.recipeId) : undefined;
        const tokens = await (0, qr_service_1.getActiveQrTokens)(recipeId);
        // Generate QR URLs for each token
        const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const tokensWithUrls = tokens.map((token) => ({
            ...token,
            qrUrl: `${baseUrl}/#/review/${token.recipeId}?token=${token.token}`,
        }));
        res.json(tokensWithUrls);
    }
    catch (error) {
        console.error("Error fetching QR tokens:", error);
        res.status(500).json({ error: "Failed to fetch QR tokens" });
    }
}
async function deleteQrTokenController(req, res) {
    try {
        const tokenId = req.params.id;
        if (!tokenId) {
            return res.status(400).json({ error: "Token ID is required" });
        }
        await (0, qr_service_1.deleteQrToken)(tokenId);
        res.json({ success: true, message: "QR token deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting QR token:", error);
        if (error instanceof Error && error.message === "QR token not found") {
            return res.status(404).json({ error: "QR token not found" });
        }
        res.status(500).json({ error: "Failed to delete QR token" });
    }
}
async function getQrTokenCountsController(req, res) {
    try {
        const counts = await (0, qr_service_1.getQrTokenCounts)();
        res.json(counts);
    }
    catch (error) {
        console.error("Error fetching QR token counts:", error);
        res.status(500).json({ error: "Failed to fetch QR token counts" });
    }
}
