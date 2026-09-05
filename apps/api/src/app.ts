import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
// @ts-ignore: helmet may not have type declarations in this environment
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import adminJobRoutes from "./routes/admin-job.routes.js";
import adminDashboardRoutes from "./routes/admin-dashboard.routes.js";
import publicJobRoutes from "./routes/public-job.routes.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Job Portal API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminJobRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/jobs", publicJobRoutes);

app.use(errorHandler);

export default app;