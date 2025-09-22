"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSecureQrToken = generateSecureQrToken;
exports.validateQrToken = validateQrToken;
exports.getActiveQrTokens = getActiveQrTokens;
exports.deleteQrToken = deleteQrToken;
exports.getQrTokenCounts = getQrTokenCounts;
const client_1 = require("../prisma/client");
const crypto_1 = __importDefault(require("crypto"));
async function generateSecureQrToken(recipeId) {
    // Check if recipe exists and get recipe info in one query
    const recipe = await client_1.prisma.recipe.findUnique({
        where: { id: recipeId },
        select: { id: true, title: true, slug: true }
    });
    if (!recipe) {
        throw new Error("Recipe not found");
    }
    // Generate secure random token
    const token = crypto_1.default.randomBytes(32).toString('hex');
    // Set expiration to 1 year from now (QR codes should be long-lived for physical menus)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    // Store token in database
    const qrToken = await client_1.prisma.qrToken.create({
        data: {
            token,
            recipeId,
            expiresAt,
        },
    });
    return { id: qrToken.id, token, expiresAt, recipeId, recipe };
}
async function validateQrToken(token) {
    try {
        const qrToken = await client_1.prisma.qrToken.findUnique({
            where: { token },
            include: { recipe: true },
        });
        if (!qrToken) {
            return { valid: false };
        }
        // Check if token is expired
        if (new Date() > qrToken.expiresAt) {
            return { valid: false };
        }
        // Check if recipe still exists
        if (!qrToken.recipe) {
            return { valid: false };
        }
        return { valid: true, recipeId: qrToken.recipeId };
    }
    catch (error) {
        console.error("Error validating QR token:", error);
        return { valid: false };
    }
}
async function getActiveQrTokens(recipeId) {
    const where = recipeId ? { recipeId } : {};
    return client_1.prisma.qrToken.findMany({
        where: {
            ...where,
            expiresAt: { gt: new Date() }, // Only active tokens
        },
        include: {
            recipe: {
                select: { id: true, title: true, slug: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });
}
async function deleteQrToken(tokenId) {
    const qrToken = await client_1.prisma.qrToken.findUnique({
        where: { id: tokenId },
    });
    if (!qrToken) {
        throw new Error("QR token not found");
    }
    await client_1.prisma.qrToken.delete({
        where: { id: tokenId },
    });
}
async function getQrTokenCounts() {
    const counts = await client_1.prisma.qrToken.groupBy({
        by: ['recipeId'],
        where: {
            expiresAt: { gt: new Date() }, // Only count active tokens
        },
        _count: {
            id: true,
        },
    });
    const result = {};
    counts.forEach((count) => {
        result[count.recipeId] = count._count.id;
    });
    return result;
}
