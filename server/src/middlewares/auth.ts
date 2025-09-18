import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: {
    role: string;
    iat: number;
    exp: number;
  };
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "Access token required" });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: "Access token required" });
    }

    // Verify the token
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      console.error("JWT_SECRET not set in environment variables");
      return res.status(500).json({ error: "Server configuration error" });
    }

    const decoded = jwt.verify(token, jwtSecret) as any;
    
    // Check if token is expired
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return res.status(401).json({ error: "Token expired" });
    }

    // Attach user info to request
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: "Invalid token" });
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: "Token expired" });
    }

    console.error("Auth middleware error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    // First check if user is authenticated
    await new Promise<void>((resolve, reject) => {
      requireAuth(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    next();
  } catch (error) {
    // Error already handled by requireAuth
    return;
  }
}
