import { AuthController } from "./auth.controller";
import { AuthLevel, route } from "@/app/middleware";
import { Router } from "express";

const router = Router();

/**
 * Auth routes
 * Base path: /api/auth
 */
// ============================================================================
// PUBLIC ROUTES
// ============================================================================
// GET /api/auth/discord - Get redirect URI for user
router.get("/discord", ...route(AuthLevel.PUBLIC, AuthController.getAuthUrl));
// POST /api/auth/discord/callback - Code exchange with Discord API
router.post(
  "/discord/callback",
  ...route(AuthLevel.PUBLIC, AuthController.handleDiscordCallback),
);

// ============================================================================
// USER ROUTES
// ============================================================================
// POST /api/auth/refresh - Refreshes an existing token
router.post("/token", ...route(AuthLevel.USER, AuthController.refreshToken));

// GET /api/auth/me - Returns current user information from JWT
router.get("/me", ...route(AuthLevel.USER, AuthController.getCurrentUser));

// POST /api/auth/logout - Logs out a user
router.post("/logout", ...route(AuthLevel.USER, AuthController.logout));

// GET /api/auth/status - Check authentication status
router.get("/status", ...route(AuthLevel.USER, AuthController.checkStatus));

export default router;
