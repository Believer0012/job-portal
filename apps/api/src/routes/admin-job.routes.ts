import { Role } from "@prisma/client";
import { Router } from "express";
import { jobController } from "../controllers/job.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { validateParams, validateQuery } from "../middleware/validate-request.js";
import { jobFieldsSchema, jobIdParamsSchema, jobListQuerySchema, jobStatusSchema } from "../validators/job.js";

const router = Router();
const adminOnly = [requireAuth, requireRole(Role.ADMIN)];

router.get("/jobs", ...adminOnly, validateQuery(jobListQuerySchema), jobController.list);
router.get("/jobs/:id", ...adminOnly, validateParams(jobIdParamsSchema), jobController.get);
router.post("/jobs", ...adminOnly, validate(jobFieldsSchema), jobController.create);
router.put("/jobs/:id", ...adminOnly, validateParams(jobIdParamsSchema), validate(jobFieldsSchema), jobController.update);
router.delete("/jobs/:id", ...adminOnly, validateParams(jobIdParamsSchema), jobController.remove);
router.patch("/jobs/:id/status", ...adminOnly, validateParams(jobIdParamsSchema), validate(jobStatusSchema), jobController.updateStatus);

export default router;