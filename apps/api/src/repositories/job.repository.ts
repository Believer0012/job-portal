import { JobStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

const safeAuthor = {
  id: true,
  name: true,
  email: true,
  role: true,
} satisfies Prisma.UserSelect;

const jobInclude = {
  category: true,
  experienceLevel: true,
  author: { select: safeAuthor },
} satisfies Prisma.JobInclude;

const publicJobSelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  requirements: true,
  benefits: true,
  companyName: true,
  location: true,
  salaryMin: true,
  salaryMax: true,
  employmentType: true,
  status: true,
  publishedAt: true,
  categoryId: true,
  experienceLevelId: true,
  createdAt: true,
  updatedAt: true,
  category: true,
  experienceLevel: true,
} satisfies Prisma.JobSelect;

export const jobRepository = {
  list(where: Prisma.JobWhereInput, skip: number, take: number, orderBy: Prisma.JobOrderByWithRelationInput) {
    return prisma.$transaction([
      prisma.job.findMany({ where, skip, take, orderBy, include: jobInclude }),
      prisma.job.count({ where }),
    ]);
  },

  findById(id: string) {
    return prisma.job.findUnique({ where: { id }, include: jobInclude });
  },

  create(data: Prisma.JobUncheckedCreateInput) {
    return prisma.job.create({ data, include: jobInclude });
  },

  update(id: string, data: Prisma.JobUncheckedUpdateInput) {
    return prisma.job.update({ where: { id }, data, include: jobInclude });
  },

  delete(id: string) {
    return prisma.job.delete({ where: { id } });
  },

  findBySlug(slug: string) {
    return prisma.job.findUnique({ where: { slug }, select: { id: true } });
  },

  findStatusById(id: string) {
    return prisma.job.findUnique({ where: { id }, select: { id: true, status: true } });
  },

  async updateStatus(id: string, status: JobStatus, timestamps: { publishedAt: Date | null; closedAt: Date | null }) {
    return prisma.job.update({
      where: { id },
      data: { status, ...timestamps },
      include: jobInclude,
    });
  },

  listPublic(where: Prisma.JobWhereInput, skip: number, take: number, orderBy: Prisma.JobOrderByWithRelationInput) {
    return prisma.$transaction([
      prisma.job.findMany({ where, skip, take, orderBy, select: publicJobSelect }),
      prisma.job.count({ where }),
    ]);
  },

  findPublishedById(id: string) {
    return prisma.job.findFirst({ where: { id, status: JobStatus.PUBLISHED }, select: publicJobSelect });
  },
};