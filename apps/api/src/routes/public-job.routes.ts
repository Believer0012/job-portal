import { Role } from "@prisma/client";
import { Router } from "express";
import { applicationController } from "../controllers/application.controller.js";
import { publicJobController } from "../controllers/public-job.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validateParams, validateQuery } from "../middleware/validate-request.js";
import { jobIdParamsSchema, publicJobListQuerySchema } from "../validators/job.js";

const router = Router();

router.get("/", validateQuery(publicJobListQuerySchema), publicJobController.list);
router.get("/:id", validateParams(jobIdParamsSchema), publicJobController.get);
router.post(
  "/:id/apply",
  requireAuth,
  requireRole(Role.USER),
  validateParams(jobIdParamsSchema),
  applicationController.apply,
);

export default router;
