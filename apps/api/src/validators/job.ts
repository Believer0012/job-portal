import { EmploymentType, JobStatus } from "@prisma/client";
import { z } from "zod";

const uuid = z.string().uuid();
const salary = z.number().int().nonnegative().optional();

export const jobIdParamsSchema = z.object({ id: uuid });

export const jobFieldsSchema = z
  .object({
    title: z.string().trim().min(2).max(200),
    company: z.string().trim().min(2).max(200),
    location: z.string().trim().min(2).max(200),
    categoryId: uuid,
    experienceLevelId: uuid,
    employmentType: z.nativeEnum(EmploymentType),
    salaryMin: salary,
    salaryMax: salary,
    description: z.string().trim().min(20).max(10000),
    requirements: z.string().trim().min(10).max(10000),
    benefits: z.string().trim().min(10).max(10000),
    status: z.nativeEnum(JobStatus).default(JobStatus.DRAFT),
  })
  .refine(
    (value) => value.salaryMin === undefined || value.salaryMax === undefined || value.salaryMin <= value.salaryMax,
    { path: ["salaryMin"], message: "salaryMin must not be greater than salaryMax" },
  );

export const jobListQuerySchema = z.object({
  search: z.string().trim().max(200).optional(),
  category: z.string().trim().max(200).optional(),
  experience: z.string().trim().max(200).optional(),
  status: z.nativeEnum(JobStatus).optional(),
  employmentType: z.nativeEnum(EmploymentType).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["createdAt", "updatedAt", "title", "companyName", "status"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const jobStatusSchema = z.object({
  status: z.nativeEnum(JobStatus),
});

export const publicJobListQuerySchema = z.object({
  search: z.string().trim().max(200).optional(),
  category: z.string().trim().max(200).optional(),
  experience: z.string().trim().max(200).optional(),
  employmentType: z.nativeEnum(EmploymentType).optional(),
  location: z.string().trim().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["createdAt", "title", "companyName"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type JobFieldsInput = z.infer<typeof jobFieldsSchema>;
export type JobListQuery = z.infer<typeof jobListQuerySchema>;
export type JobStatusInput = z.infer<typeof jobStatusSchema>;
export type PublicJobListQuery = z.infer<typeof publicJobListQuerySchema>;