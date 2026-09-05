import type { Request, Response } from "express";
import { sendSuccess } from "../utils/api-response.js";
import { jobService } from "../services/job.service.js";
import type { PublicJobListQuery } from "../validators/job.js";

export const publicJobController = {
  async list(_req: Request, res: Response) {
    return sendSuccess(res, await jobService.listPublic(res.locals.validatedQuery as PublicJobListQuery));
  },
  async get(_req: Request, res: Response) {
    return sendSuccess(res, { job: await jobService.getPublishedById(res.locals.validatedParams.id) });
  },
};
