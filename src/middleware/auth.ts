import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  userName?: string;
}

interface AuthTokenPayload extends JwtPayload {
  userName: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "reset-dev-secret";

export const createAuthToken = (userName: string): string => {
  return jwt.sign({ userName }, JWT_SECRET, { expiresIn: "7d" });
};

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

  if (!token) {
    return res.status(401).json({ message: "Authentication token required" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    req.userName = payload.userName;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired authentication token" });
  }
};
