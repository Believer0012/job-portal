import { ApplicationStatus, JobStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

const recentJobInclude = {
  category: { select: { name: true } },
  experienceLevel: { select: { name: true } },
} satisfies Prisma.JobInclude;

export const dashboardRepository = {
  getStatistics() {
    return prisma.$transaction([
      prisma.job.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.application.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.user.count(),
      prisma.job.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          companyName: true,
          status: true,
          createdAt: true,
          category: { select: { name: true } },
          experienceLevel: { select: { name: true } },
        },
      }),
    ]);
  },
};

export type JobStatusCounts = Record<JobStatus, number>;
export type ApplicationStatusCounts = Record<ApplicationStatus, number>;