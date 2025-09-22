"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const client_1 = require("@prisma/client");
function errorHandler(err, _req, res, _next) {
    // Log everything to your console for debugging
    console.error("[ERROR]", err);
    // Prisma known errors → return helpful status codes
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        // Unique constraint (e.g., slug already exists OR IngredientType.name duplicate)
        if (err.code === "P2002") {
            return res.status(409).json({ error: "Unique constraint failed", meta: err.meta });
        }
        // Foreign key / relation errors
        if (err.code === "P2003") {
            return res.status(400).json({ error: "Invalid relation reference", meta: err.meta });
        }
        // Record not found (if you use update/delete)
        if (err.code === "P2025") {
            return res.status(404).json({ error: "Record not found", meta: err.meta });
        }
    }
    // Prisma validation (wrong shape sent to Prisma)
    if (err instanceof client_1.Prisma.PrismaClientValidationError) {
        return res.status(400).json({ error: "Invalid data for Prisma query" });
    }
    // Zod validation (from your controllers)
    if (err?.name === "ZodError") {
        return res.status(400).json({ error: "Validation failed", details: err.flatten?.() ?? err.errors });
    }
    // Fallback
    res.status(500).json({ error: "Server error" });
}
