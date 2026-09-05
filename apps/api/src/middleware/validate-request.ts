import type { RequestHandler } from "express";
import { z } from "zod";
import { AppError } from "../utils/api-response.js";

function applyValidation(schema: z.ZodType, value: unknown, assign: (data: unknown) => void, next: Parameters<RequestHandler>[2]) {
  const result = schema.safeParse(value);

  if (!result.success) {
    next(
      new AppError(
        400,
        "Validation failed",
        result.error.issues.map((issue) => ({ path: issue.path, message: issue.message })),
      ),
    );
    return;
  }

  assign(result.data);
  next();
}

export function validateQuery(schema: z.ZodType): RequestHandler {
  return (req, res, next) => applyValidation(schema, req.query, (data) => {
    res.locals.validatedQuery = data;
  }, next);
}

export function validateParams(schema: z.ZodType): RequestHandler {
  return (req, res, next) => applyValidation(schema, req.params, (data) => {
    res.locals.validatedParams = data;
  }, next);
}