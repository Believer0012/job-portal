import type { Prisma, Role } from "@prisma/client";
import { prisma } from "../config/prisma.js";

const safeUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type SafeUser = Prisma.UserGetPayload<{ select: typeof safeUserSelect }>;

export const authRepository = {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  findSafeUserById(id: string) {
    return prisma.user.findUnique({ where: { id }, select: safeUserSelect });
  },

  createUser(data: { name: string; email: string; passwordHash: string; role: Role }) {
    return prisma.user.create({ data, select: safeUserSelect });
  },

  findRefreshTokenByHash(tokenHash: string) {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: { select: safeUserSelect } },
    });
  },

  createRefreshToken(data: { tokenHash: string; userId: string; expiresAt: Date }) {
    return prisma.refreshToken.create({ data });
  },

  revokeRefreshTokenByHash(tokenHash: string) {
    return prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  rotateRefreshToken(tokenId: string, userId: string, tokenHash: string, expiresAt: Date) {
    return prisma.$transaction(async (transaction) => {
      const revoked = await transaction.refreshToken.updateMany({
        where: { id: tokenId, userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      if (revoked.count !== 1) {
        return false;
      }

      await transaction.refreshToken.create({ data: { tokenHash, userId, expiresAt } });
      return true;
    });
  },
};