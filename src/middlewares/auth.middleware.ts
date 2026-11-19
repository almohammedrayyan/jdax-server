import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
  userId?: string;
}

const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) {
    return res.status(401).send({ success: false, message: "Authentication required.", data: null });
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    if (!payload.userId || typeof payload.userId !== "string") throw new Error("Invalid token payload.");
    req.userId = payload.userId;
    return next();
  } catch {
    return res.status(401).send({ success: false, message: "Invalid or expired token.", data: null });
  }
};

export = { authenticate };
