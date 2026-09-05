import type { NextFunction, Request, RequestHandler, Response } from "express";
import { Role } from "@prisma/client";
import { verifyAccessToken } from "../utils/tokens.js";
import { AppError } from "../utils/api-response.js";

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    next(new AppError(401, "Authentication required"));
    return;
  }

  try {
    req.auth = verifyAccessToken(token);
    next();
  } catch {
    next(new AppError(401, "Invalid or expired access token"));
  }
}

export function requireRole(...roles: Role[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      next(new AppError(403, "You do not have permission to access this resource"));
      return;
    }

    next();
  };
}
