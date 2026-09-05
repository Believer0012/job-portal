import { Role } from "@prisma/client";
import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/stats", requireAuth, requireRole(Role.ADMIN), dashboardController.stats);

export default router;