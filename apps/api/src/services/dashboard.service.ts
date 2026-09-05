import { ApplicationStatus, JobStatus } from "@prisma/client";
import { dashboardRepository } from "../repositories/dashboard.repository.js";
import type { ApplicationStatusCounts, JobStatusCounts } from "../repositories/dashboard.repository.js";

function emptyJobStatusCounts(): JobStatusCounts {
  return {
    [JobStatus.DRAFT]: 0,
    [JobStatus.PUBLISHED]: 0,
    [JobStatus.CLOSED]: 0,
  };
}

function emptyApplicationStatusCounts(): ApplicationStatusCounts {
  return {
    [ApplicationStatus.APPLIED]: 0,
    [ApplicationStatus.REVIEWING]: 0,
    [ApplicationStatus.SHORTLISTED]: 0,
    [ApplicationStatus.INTERVIEW]: 0,
    [ApplicationStatus.REJECTED]: 0,
    [ApplicationStatus.HIRED]: 0,
  };
}

export const dashboardService = {
  async getStatistics() {
    const [jobGroups, applicationGroups, totalUsers, recentJobs] = await dashboardRepository.getStatistics();
    const jobStatusDistribution = emptyJobStatusCounts();
    const applicationStatusDistribution = emptyApplicationStatusCounts();

    for (const group of jobGroups) {
      jobStatusDistribution[group.status] = group._count._all;
    }

    for (const group of applicationGroups) {
      applicationStatusDistribution[group.status] = group._count._all;
    }

    return {
      totalJobs: jobGroups.reduce((total, group) => total + group._count._all, 0),
      publishedJobs: jobStatusDistribution[JobStatus.PUBLISHED],
      draftJobs: jobStatusDistribution[JobStatus.DRAFT],
      closedJobs: jobStatusDistribution[JobStatus.CLOSED],
      totalApplications: applicationGroups.reduce((total, group) => total + group._count._all, 0),
      totalUsers,
      recentJobs: recentJobs.map((job) => ({
        id: job.id,
        title: job.title,
        company: job.companyName,
        status: job.status,
        createdAt: job.createdAt,
        category: job.category,
        experienceLevel: job.experienceLevel,
      })),
      jobStatusDistribution,
      applicationStatusDistribution,
    };
  },
};