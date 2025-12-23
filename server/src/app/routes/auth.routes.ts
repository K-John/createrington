import { Router } from "express";
import { asyncHandler } from "../middleware";
import { AuthController } from "../controllers";

const router = Router();

/**
 * Auth routes
 * Base path: /api/auth
 */
// GET /api/auth/discord - Get redirect URI for user
router.get("/discord", asyncHandler(AuthController.getAuthUrl));

// POST /api/auth/discord/callback - Code exchange with Discord API
router.post("/discord/callback", asyncHandler(AuthController.handleCallback));

// POST /api/auth/refresh - Refreshes an existing token
router.post("/refresh", asyncHandler(AuthController.refresh));

// GET /api/auth/me - Returns current user information from JWT
router.get("/me", asyncHandler(AuthController.getCurrentUser));

// POST /api/auth/logout - Logs out a user
router.post("/logout", asyncHandler(AuthController.logout));

// GET /api/auth/status - Check authentication status
router.get("/status", asyncHandler(AuthController.checkStatus));

export default router;
