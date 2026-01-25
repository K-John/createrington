import { Router } from "express";
import { AuthLevel, route } from "@/app/middleware";
import { WaitlistController } from "./waitlist.controller";

const router = Router();

/**
 * Waitlist routes
 * Base path: /api/waitlist
 */

// ============================================================================
// PUBLIC ROUTES
// ============================================================================
// POST /api/waitlist - Create new entry
router.post("/", ...route(AuthLevel.PUBLIC, WaitlistController.create));

// ============================================================================
// ADMIN ROUTES
// ============================================================================
// GET /api/waitlist - Get all entries
router.get("/", ...route(AuthLevel.ADMIN, WaitlistController.getAll));

// GET /api/waitlist/stats - Get statistics (specific route before :id)
router.get("/stats", ...route(AuthLevel.ADMIN, WaitlistController.getStats));

// GET /api/waitlist/:id - Get single entry
router.get("/:id", ...route(AuthLevel.ADMIN, WaitlistController.get));

// DELETE /api/waitlist/:id - Delete entry
router.delete("/:id", ...route(AuthLevel.ADMIN, WaitlistController.delete));

export default router;
