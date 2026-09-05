import { createHash, randomBytes } from "node:crypto";
import jwt, { type SignOptions } from "jsonwebtoken";
import type { Role } from "@prisma/client";
import { env } from "../config/env.js";
import type { AuthPayload } from "../types/auth.js";

export function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function createRefreshToken(): string {
  return randomBytes(48).toString("base64url");
}

export function createAccessToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): AuthPayload {
  const payload = jwt.verify(token, env.JWT_SECRET);

  if (typeof payload !== "object" || typeof payload.userId !== "string" || !isRole(payload.role)) {
    throw new Error("Invalid access token payload");
  }

  return { userId: payload.userId, role: payload.role };
}

function isRole(value: unknown): value is Role {
  return value === "ADMIN" || value === "USER";
}