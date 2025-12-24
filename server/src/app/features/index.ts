import type { Express } from "express";
import waitlistRoutes from "./waitlist/waitlist.routes";
import authRoutes from "./auth/auth.routes";

/**
 * Register all API routes
 *
 * @param app - Express application instance
 */
export function registerRoutes(app: Express): void {
  // API prefix
  const API_PREFIX = "/api";

  // Register route modules
  app.use(`${API_PREFIX}/waitlist`, waitlistRoutes);
  app.use(`${API_PREFIX}/auth`, authRoutes);

  logger.info("API routes registered");
}
