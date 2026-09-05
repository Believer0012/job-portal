import type { RequestHandler } from "express";
import { z } from "zod";
import { AppError } from "../utils/api-response.js";

export function validate(schema: z.ZodType): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(
        new AppError(
          400,
          "Validation failed",
          result.error.issues.map((issue) => ({
            path: issue.path,
            message: issue.message,
          })),
        ),
      );
      return;
    }

    req.body = result.data;
    next();
  };
}