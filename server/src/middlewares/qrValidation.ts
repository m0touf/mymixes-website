import { Request, Response, NextFunction } from "express";
import { validateQrToken } from "../services/qr.service";

export async function validateQrTokenMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.query.token as string;
  
  if (!token) {
    return res.status(400).json({ error: "QR token is required" });
  }

  try {
    const validation = await validateQrToken(token);
    
    if (!validation.valid) {
      return res.status(403).json({ error: "Invalid or expired QR token" });
    }

    // Attach recipe ID to request for use in controllers
    req.qrRecipeId = validation.recipeId;
    next();
  } catch (error) {
    console.error("Error validating QR token:", error);
    res.status(500).json({ error: "Failed to validate QR token" });
  }
}

// Extend Request interface to include qrRecipeId
declare global {
  namespace Express {
    interface Request {
      qrRecipeId?: number;
    }
  }
}
