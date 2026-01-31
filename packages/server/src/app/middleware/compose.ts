import type { RequestHandler } from "express";
import { authenticate, requireAdmin, requireUser } from "./auth.middleware";
import { asyncHandler } from "./async-handler";

/**
 * Authentication levels for route protection
 */
export enum AuthLevel {
  PUBLIC = "public",
  USER = "user",
  ADMIN = "admin",
}

/**
 * Middleware chains for each auth level
 */
export const authMiddleware: Record<AuthLevel, RequestHandler[]> = {
  [AuthLevel.PUBLIC]: [],
  [AuthLevel.USER]: [authenticate, requireUser],
  [AuthLevel.ADMIN]: [authenticate, requireAdmin],
};

/**
 * Wraps handler with auth middleware and async handling
 *
 * @param auth - Authentication level required
 * @param handler - Route handler function
 * @returns Array of middleware including auth and async wrapper
 */
export function route(
  auth: AuthLevel,
  handler: RequestHandler,
): RequestHandler[] {
  return [...authMiddleware[auth], asyncHandler(handler)];
}

/**
 * Custom middleware chains
 */
export function customRoute(
  middleware: RequestHandler[],
  handler: RequestHandler,
): RequestHandler[] {
  return [...middleware.map((m) => asyncHandler(m)), asyncHandler(handler)];
}
