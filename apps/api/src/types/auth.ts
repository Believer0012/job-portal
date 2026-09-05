import type { Role } from "@prisma/client";

export type AuthPayload = {
  userId: string;
  role: Role;
};

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

export {};