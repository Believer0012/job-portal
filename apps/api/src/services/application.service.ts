import { JobStatus, Prisma } from "@prisma/client";
import { applicationRepository } from "../repositories/application.repository.js";
import { jobRepository } from "../repositories/job.repository.js";
import { AppError } from "../utils/api-response.js";

export const applicationService = {
  async apply(userId: string, jobId: string) {
    const job = await jobRepository.findStatusById(jobId);
    if (!job) {
      throw new AppError(404, "Job not found");
    }
    if (job.status !== JobStatus.PUBLISHED) {
      throw new AppError(400, "This job is not currently accepting applications");
    }

    const existing = await applicationRepository.findByUserAndJob(userId, jobId);
    if (existing) {
      throw new AppError(409, "You have already applied for this job");
    }

    try {
      return await applicationRepository.create(userId, jobId);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new AppError(409, "You have already applied for this job");
      }
      throw error;
    }
  },
};
