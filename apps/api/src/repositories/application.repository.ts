import { prisma } from "../config/prisma.js";

export const applicationRepository = {
  findByUserAndJob(userId: string, jobId: string) {
    return prisma.application.findUnique({ where: { userId_jobId: { userId, jobId } } });
  },

  create(userId: string, jobId: string) {
    return prisma.application.create({ data: { userId, jobId } });
  },
};
