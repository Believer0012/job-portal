import type { ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/api-response.js";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      errors: error.errors,
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    res.status(409).json({
      success: false,
      message: "A record with the same unique value already exists",
      errors: [],
    });
    return;
  }

  console.error(error);
  res.status(500).json({
    success: false,
    message: "An unexpected error occurred",
    errors: [],
  });
};