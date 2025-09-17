// server/src/middlewares/attachUser.ts
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

type JwtPayload = {
  uid: number;
  role: "OWNER" | "USER";
  email: string;
  iat?: number;
  exp?: number;
};

export function attachUser(req: Request, _res: Response, next: NextFunction) {
  const bearer = req.header("authorization");
  const cookie = (req as any).cookies?.auth as string | undefined; // cookie-parser adds req.cookies

  const token =
    cookie ||
    (bearer?.startsWith("Bearer ") ? bearer.slice("Bearer ".length) : undefined);

  if (!token) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = { id: payload.uid, role: payload.role, email: payload.email };
  } catch {
    // invalid/expired token → act as unauthenticated
  }
  next();
}
