import { Prisma, JobStatus } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { jobRepository } from "../repositories/job.repository.js";
import { AppError } from "../utils/api-response.js";
import { createSlug } from "../utils/slug.js";
import type { JobFieldsInput, JobListQuery, JobStatusInput, PublicJobListQuery } from "../validators/job.js";

function statusTimestamps(status: JobStatus) {
  return {
    publishedAt: status === JobStatus.PUBLISHED ? new Date() : null,
    closedAt: status === JobStatus.CLOSED ? new Date() : null,
  };
}

async function uniqueSlug(title: string, currentId?: string): Promise<string> {
  const base = createSlug(title);
  let slug = base;
  let suffix = 2;

  while (true) {
    const existing = await jobRepository.findBySlug(slug);
    if (!existing || existing.id === currentId) return slug;
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
}

function mapJobData(input: JobFieldsInput, authorId: string, slug: string): Prisma.JobUncheckedCreateInput {
  return {
    slug,
    title: input.title,
    companyName: input.company,
    location: input.location,
    categoryId: input.categoryId,
    experienceLevelId: input.experienceLevelId,
    employmentType: input.employmentType,
    salaryMin: input.salaryMin,
    salaryMax: input.salaryMax,
    description: input.description,
    requirements: input.requirements,
    benefits: input.benefits,
    status: input.status,
    authorId,
    ...statusTimestamps(input.status),
  };
}

function mapJobUpdateData(input: JobFieldsInput, slug: string): Prisma.JobUncheckedUpdateInput {
  const data = mapJobData(input, "", slug);
  const { authorId: _authorId, ...updateData } = data;
  return updateData;
}

type JobWhereFilters = {
  search?: string;
  status?: JobStatus;
  employmentType?: JobFieldsInput["employmentType"];
  category?: string;
  experience?: string;
  location?: string;
};

function buildJobWhere(filters: JobWhereFilters): Prisma.JobWhereInput {
  const where: Prisma.JobWhereInput = {};
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { companyName: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  if (filters.status) where.status = filters.status;
  if (filters.employmentType) where.employmentType = filters.employmentType;
  if (filters.category) where.category = { is: { name: { equals: filters.category, mode: "insensitive" } } };
  if (filters.experience) where.experienceLevel = { is: { name: { equals: filters.experience, mode: "insensitive" } } };
  if (filters.location) where.location = { contains: filters.location, mode: "insensitive" };
  return where;
}

async function assertRelations(input: JobFieldsInput): Promise<void> {
  const [category, experienceLevel] = await Promise.all([
    prisma.category.findUnique({ where: { id: input.categoryId }, select: { id: true } }),
    prisma.experienceLevel.findUnique({ where: { id: input.experienceLevelId }, select: { id: true } }),
  ]);

  if (!category) throw new AppError(400, "Category not found");
  if (!experienceLevel) throw new AppError(400, "Experience level not found");
}

export const jobService = {
  async list(query: JobListQuery) {
    const where = buildJobWhere({
      search: query.search,
      status: query.status,
      employmentType: query.employmentType,
      category: query.category,
      experience: query.experience,
    });

    const [items, total] = await jobRepository.list(
      where,
      (query.page - 1) * query.limit,
      query.limit,
      { [query.sortBy]: query.sortOrder },
    );

    return {
      items,
      pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) },
    };
  },

  async listPublic(query: PublicJobListQuery) {
    const where = buildJobWhere({
      search: query.search,
      status: JobStatus.PUBLISHED,
      employmentType: query.employmentType,
      category: query.category,
      experience: query.experience,
      location: query.location,
    });

    const [items, total] = await jobRepository.listPublic(
      where,
      (query.page - 1) * query.limit,
      query.limit,
      { [query.sortBy]: query.sortOrder },
    );

    return {
      items,
      pagination: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) },
    };
  },

  async getPublishedById(id: string) {
    const job = await jobRepository.findPublishedById(id);
    if (!job) throw new AppError(404, "Job not found");
    return job;
  },

  async getById(id: string) {
    const job = await jobRepository.findById(id);
    if (!job) throw new AppError(404, "Job not found");
    return job;
  },

  async create(input: JobFieldsInput, authorId: string) {
    await assertRelations(input);
    return jobRepository.create(mapJobData(input, authorId, await uniqueSlug(input.title)));
  },

  async update(id: string, input: JobFieldsInput) {
    await this.getById(id);
    await assertRelations(input);
    return jobRepository.update(id, mapJobUpdateData(input, await uniqueSlug(input.title, id)));
  },

  async remove(id: string) {
    await this.getById(id);
    await jobRepository.delete(id);
  },

  async updateStatus(id: string, input: JobStatusInput) {
    await this.getById(id);
    return jobRepository.updateStatus(id, input.status, statusTimestamps(input.status));
  },
};