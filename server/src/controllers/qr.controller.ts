import type { Request, Response } from "express";
import { z } from "zod";
import { generateSecureQrToken, getActiveQrTokens } from "../services/qr.service";

// Schema for generating QR tokens
const GenerateQrInput = z.object({
  recipeId: z.number().int().positive("Recipe ID must be a positive integer"),
});

export async function generateQrToken(req: Request, res: Response) {
  const parsed = GenerateQrInput.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues });
  }

  try {
    const qrData = await generateSecureQrToken(parsed.data.recipeId);
    
    // Generate the QR URL
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const qrUrl = `${baseUrl}/#/review/${qrData.recipeId}?token=${qrData.token}`;
    
    res.json({
      token: qrData.token,
      qrUrl,
      expiresAt: qrData.expiresAt,
      recipeId: qrData.recipeId,
    });
  } catch (error) {
    console.error("Error generating QR token:", error);
    res.status(500).json({ error: "Failed to generate QR token" });
  }
}

export async function getQrTokens(req: Request, res: Response) {
  try {
    const recipeId = req.query.recipeId ? Number(req.query.recipeId) : undefined;
    const tokens = await getActiveQrTokens(recipeId);
    
    // Generate QR URLs for each token
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const tokensWithUrls = tokens.map(token => ({
      ...token,
      qrUrl: `${baseUrl}/#/review/${token.recipeId}?token=${token.token}`,
    }));
    
    res.json(tokensWithUrls);
  } catch (error) {
    console.error("Error fetching QR tokens:", error);
    res.status(500).json({ error: "Failed to fetch QR tokens" });
  }
}
