import { AuthLevel, route } from "@/app/middleware";
import { Router } from "express";
import { PlayerController } from "./player.controller";

const router = Router();

/**
 * Player routes
 * Base path: /api/players
 *
 * Provides a player data access with filtering
 */

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

/**
 * GET /api/players
 *
 * Get a list of players with filtering and pagination
 *
 * Query Parameters:
 *
 * Filtering:
 * - discord_id: Filter by Discord ID
 * - minecraft_uuid: Filter by Minecraft UUID
 * - minecraft_username: Filter by username (case-insensitive partial match)
 * - is_active: Filter by active status (true/false)
 *
 * Pagination:
 * - page: Page number (0-indexed, default: 0)
 * - limit: Results per page (1-100, default: 20)
 *
 * Sorting:
 * - sort_by: Field to sort by (createdAt, minecraftUsername, updatedAt)
 * - sort_order: Sort direction (asc/desc, default: desc)
 *
 * Examples:
 * - /api/players?limit=10
 * - /api/players?minecraft_username=Steve
 * - /api/players?is_active=true&sort_by=minecraftUsername&sort_order=asc
 *
 * Response: GetPlayersResponse
 */
router.get("/", ...route(AuthLevel.PUBLIC, PlayerController.getPlayers));

/**
 * GET /api/players/:id
 *
 * Get information about a specific player
 *
 * Path Parameters:
 * - id: Discord ID (17-20 digits) or Minecraft UUID (UUID format)
 *
 * Examples:
 * - /api/players/123456789012345678
 * - /api/players/550e8400-e29b-41d4-a716-446655440000
 *
 * Response: GetPlayerResponse
 * Errors: 400 (invalid ID format), 404 (player not found)
 */
router.get("/:id", ...route(AuthLevel.PUBLIC, PlayerController.getPlayer));

export default router;
