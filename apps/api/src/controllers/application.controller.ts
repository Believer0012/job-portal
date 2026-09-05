import type { Request, Response } from "express";
import { sendSuccess } from "../utils/api-response.js";
import { applicationService } from "../services/application.service.js";

export const applicationController = {
  async apply(req: Request, res: Response) {
    const application = await applicationService.apply(req.auth!.userId, res.locals.validatedParams.id);
    return sendSuccess(res, { application }, 201);
  },
};
