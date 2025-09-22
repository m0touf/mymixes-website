"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.verifyToken = verifyToken;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
async function login(req, res) {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ error: "Password is required" });
        }
        // Get the hashed password from environment variables
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
        if (!adminPasswordHash) {
            console.error("ADMIN_PASSWORD_HASH not set in environment variables");
            return res.status(500).json({ error: "Server configuration error" });
        }
        // Compare the provided password with the stored hash
        const isValidPassword = await bcrypt_1.default.compare(password, adminPasswordHash);
        if (!isValidPassword) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        // Create JWT token
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error("JWT_SECRET not set in environment variables");
            return res.status(500).json({ error: "Server configuration error" });
        }
        const token = jsonwebtoken_1.default.sign({
            role: 'admin',
            iat: Math.floor(Date.now() / 1000)
        }, jwtSecret, { expiresIn: '24h' });
        res.json({
            token,
            user: { role: 'admin' }
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
async function verifyToken(req, res) {
    try {
        // This endpoint is protected by the auth middleware
        // If we reach here, the token is valid
        res.json({
            valid: true,
            user: req.user
        });
    }
    catch (error) {
        console.error("Token verification error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
