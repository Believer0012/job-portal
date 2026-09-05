import bcrypt from "bcrypt";
import { Role } from "@prisma/client";
import { env } from "../config/env.js";
import { authRepository, type SafeUser } from "../repositories/auth.repository.js";
import { AppError } from "../utils/api-response.js";
import {
  createAccessToken,
  createRefreshToken,
  hashRefreshToken,
} from "../utils/tokens.js";
import type { LoginInput, RefreshInput, RegisterInput } from "../validators/auth.js";

type AuthResult = { user: SafeUser; accessToken: string; refreshToken: string };

function getRefreshExpiry(): Date {
  return new Date(Date.now() + env.REFRESH_COOKIE_MAX_AGE_MS);
}

function toAuthResult(user: SafeUser, refreshToken: string): AuthResult {
  return {
    user,
    accessToken: createAccessToken({ userId: user.id, role: user.role }),
    refreshToken,
  };
}

export const authService = {
  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await authRepository.findUserByEmail(input.email);
    if (existing) {
      throw new AppError(409, "An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await authRepository.createUser({
      name: input.name,
      email: input.email,
      passwordHash,
      role: Role.USER,
    });

    const refreshToken = createRefreshToken();
    await authRepository.createRefreshToken({
      tokenHash: hashRefreshToken(refreshToken),
      userId: user.id,
      expiresAt: getRefreshExpiry(),
    });

    return toAuthResult(user, refreshToken);
  },

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await authRepository.findUserByEmail(input.email);
    const validPassword = user ? await bcrypt.compare(input.password, user.passwordHash) : false;

    if (!user || !validPassword) {
      throw new AppError(401, "Invalid email or password");
    }

    const safeUser = await authRepository.findSafeUserById(user.id);
    if (!safeUser) {
      throw new AppError(401, "Invalid email or password");
    }

    const refreshToken = createRefreshToken();
    await authRepository.createRefreshToken({
      tokenHash: hashRefreshToken(refreshToken),
      userId: user.id,
      expiresAt: getRefreshExpiry(),
    });

    return toAuthResult(safeUser, refreshToken);
  },

  async refresh(input: RefreshInput, cookieToken?: string): Promise<AuthResult> {
    const rawToken = cookieToken ?? input.refreshToken;
    if (!rawToken) {
      throw new AppError(401, "Refresh token is required");
    }

    const storedToken = await authRepository.findRefreshTokenByHash(hashRefreshToken(rawToken));
    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt <= new Date()) {
      throw new AppError(401, "Invalid or expired refresh token");
    }

    const nextRefreshToken = createRefreshToken();
    const rotated = await authRepository.rotateRefreshToken(
      storedToken.id,
      storedToken.userId,
      hashRefreshToken(nextRefreshToken),
      getRefreshExpiry(),
    );

    if (!rotated) {
      throw new AppError(401, "Invalid or expired refresh token");
    }

    return toAuthResult(storedToken.user, nextRefreshToken);
  },

  async logout(rawToken?: string): Promise<void> {
    if (rawToken) {
      await authRepository.revokeRefreshTokenByHash(hashRefreshToken(rawToken));
    }
  },

  async getCurrentUser(userId: string): Promise<SafeUser> {
    const user = await authRepository.findSafeUserById(userId);
    if (!user) {
      throw new AppError(404, "User not found");
    }

    return user;
  },
};