import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

interface JwtPayload {
  userId: number;
}

declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export function middleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(authHeader, JWT_SECRET) as JwtPayload;
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(403).json({ message: "Invalid token" });
  }
}
