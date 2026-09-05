import type { Response } from "express";
import { env } from "../config/env.js";

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: env.REFRESH_COOKIE_MAX_AGE_MS,
  path: "/api/auth",
};

export function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie(env.REFRESH_COOKIE_NAME, token, cookieOptions);
}

export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(env.REFRESH_COOKIE_NAME, {
    httpOnly: cookieOptions.httpOnly,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    path: cookieOptions.path,
  });
}