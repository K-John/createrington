import { Router } from "express";
import { asyncHandler } from "../middleware";
import { WaitlistController } from "../controllers/waitlist.controller";

const router = Router();

/**
 * Waitlist routes
 * Base path: /api/waitlist
 */

// GET /api/waitlist/stats - Get statistics (specific route before :id)
router.get("/stats", asyncHandler(WaitlistController.getStats));

// GET /api/waitlist - Get all entries
router.get("/", asyncHandler(WaitlistController.getAll));

// GET /api/waitlist/:id - Get single entry
router.get("/:id", asyncHandler(WaitlistController.get));

// POST /api/waitlist - Create new entry
router.post("/", asyncHandler(WaitlistController.create));

// DELETE /api/waitlist/:id - Delete entry
router.delete("/:id", asyncHandler(WaitlistController.delete));

export default router;
