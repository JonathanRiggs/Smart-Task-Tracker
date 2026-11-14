import "server-only";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

/** Parse a JSON request body, throwing a 400 if it isn't valid JSON. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new HttpError(400, "Request body must be valid JSON");
  }
}

/**
 * Turn URLSearchParams into a plain object. Keys that appear more than once
 * become arrays (e.g. `?status=TODO&status=DONE`).
 */
export function searchParamsToObject(params: URLSearchParams) {
  const out: Record<string, string | string[]> = {};
  for (const key of new Set(params.keys())) {
    const values = params.getAll(key);
    out[key] = values.length > 1 ? values : values[0];
  }
  return out;
}

/** Convert any thrown error into a JSON error response. */
export function errorResponse(error: unknown): Response {
  if (error instanceof HttpError) {
    return Response.json(
      { error: error.message, details: error.details },
      { status: error.status },
    );
  }
  if (error instanceof z.ZodError) {
    return Response.json(
      { error: "Validation failed", details: z.flattenError(error) },
      { status: 400 },
    );
  }
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  ) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  console.error(error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}

/**
 * Wrap a route handler so any thrown error becomes a consistent JSON error
 * response via `errorResponse`. Use this for every API route handler.
 */
export function withErrorHandling<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response>,
) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      return errorResponse(error);
    }
  };
}
