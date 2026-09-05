import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { authService } from "../services/auth.service.js";
import { clearRefreshTokenCookie, setRefreshTokenCookie } from "../utils/cookies.js";
import { sendSuccess } from "../utils/api-response.js";
import type { LoginInput, RefreshInput, RegisterInput } from "../validators/auth.js";

function respondWithAuth(res: Response, result: { user: unknown; accessToken: string; refreshToken: string }, status = 200) {
  setRefreshTokenCookie(res, result.refreshToken);
  return sendSuccess(res, { user: result.user, accessToken: result.accessToken }, status);
}

export const authController = {
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body as RegisterInput);
    return respondWithAuth(res, result, 201);
  },

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body as LoginInput);
    return respondWithAuth(res, result);
  },

  async refresh(req: Request, res: Response) {
    const result = await authService.refresh(
      req.body as RefreshInput,
      req.cookies[env.REFRESH_COOKIE_NAME] as string | undefined,
    );
    return respondWithAuth(res, result);
  },

  async logout(req: Request, res: Response) {
    await authService.logout(req.cookies[env.REFRESH_COOKIE_NAME] as string | undefined);
    clearRefreshTokenCookie(res);
    return sendSuccess(res, { message: "Logged out successfully" });
  },

  async me(req: Request, res: Response) {
    const user = await authService.getCurrentUser(req.auth!.userId);
    return sendSuccess(res, { user });
  },
};