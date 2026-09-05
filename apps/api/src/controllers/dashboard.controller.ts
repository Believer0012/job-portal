import type { Request, Response } from "express";
import { sendSuccess } from "../utils/api-response.js";
import { dashboardService } from "../services/dashboard.service.js";

export const dashboardController = {
  async stats(_req: Request, res: Response) {
    return sendSuccess(res, await dashboardService.getStatistics());
  },
};