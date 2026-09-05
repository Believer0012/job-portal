import type { Request, Response } from "express";
import { sendSuccess } from "../utils/api-response.js";
import { jobService } from "../services/job.service.js";
import type { JobFieldsInput, JobListQuery, JobStatusInput } from "../validators/job.js";

export const jobController = {
  async list(_req: Request, res: Response) {
    return sendSuccess(res, await jobService.list(res.locals.validatedQuery as JobListQuery));
  },
  async get(_req: Request, res: Response) {
    return sendSuccess(res, { job: await jobService.getById(res.locals.validatedParams.id) });
  },
  async create(req: Request, res: Response) {
    return sendSuccess(res, { job: await jobService.create(req.body as JobFieldsInput, req.auth!.userId) }, 201);
  },
  async update(req: Request, res: Response) {
    return sendSuccess(res, { job: await jobService.update(res.locals.validatedParams.id, req.body as JobFieldsInput) });
  },
  async remove(_req: Request, res: Response) {
    await jobService.remove(res.locals.validatedParams.id);
    return sendSuccess(res, { message: "Job deleted successfully" });
  },
  async updateStatus(req: Request, res: Response) {
    return sendSuccess(res, { job: await jobService.updateStatus(res.locals.validatedParams.id, req.body as JobStatusInput) });
  },
};