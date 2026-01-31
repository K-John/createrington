import { BadRequestError, NotFoundError } from "@/app/middleware";
import { getIdType } from "@/app/utils/helpers";
import { Q } from "@/db";
import {
  GetPlayerResponse,
  GetPlayersResponse,
} from "@createrington/shared/api";
import { Request, Response } from "express";

/**
 * Player controller
 *
 * Handles player data retrieval with filtering and querying
 */
export class PlayerController {
  /**
   * GET /api/players/:id
   *
   * Retrieves a single player by Discord ID o Minecraft UUID
   *
   * Path Parameters:
   * - id: Discord ID (17-20 digits) or Minecraft UUID (UUID format)
   *
   * @example
   * GET /api/players/123456789012345678
   * GET /api/players/550e8400-e29b-41d4-a716-446655440000
   */
  static async getPlayer(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    if (Array.isArray(id)) {
      throw new BadRequestError("Invalid player ID");
    }

    const idType = getIdType(id);
    if (idType === "invalid") {
      throw new BadRequestError(
        "Invalid player ID. Must be a Discord ID or Minecraft UUID.",
      );
    }

    try {
      const identifier =
        idType === "discord" ? { discordId: id } : { minecraftUuid: id };

      const player = await Q.player.find(identifier);

      if (!player) {
        throw new NotFoundError(`Player with ID ${id} not found`);
      }

      const response: GetPlayerResponse = {
        success: true,
        data: player as any,
      };

      res.json(response);
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        throw error;
      }
      logger.error("Failed to fetch player:", error);
      throw new BadRequestError("Failed to fetch player data");
    }
  }

  /**
   * GET /api/players
   *
   * Retrieves a list of players with filtering and pagination
   *
   * Query Parameters:
   * Filtering:
   * - discord_id: Filter by Discord ID
   * - minecraft_uuid: Filter by Minecraft UUID
   * - minecraft_username: Filter by Minecraft username (case-insensitive partial match)
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
   * @example
   * GET /api/players?limit=10&page=0
   * GET /api/players?minecraft_username=Steve
   * GET /api/players?is_active=true&sort_by=minecraftUsername&sort_order=asc
   */
  static async getPlayers(req: Request, res: Response): Promise<void> {
    const page = Math.max(0, parseInt(req.query.page as string) || 0);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limti as string)),
    );

    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder =
      (req.query.sortOrder as string)?.toLowerCase() === "ASC" ? "ASC" : "DESC";

    const filters: any = {};

    if (req.query.discordId) {
      filters.discordId = req.query.discordId as string;
    }

    if (req.query.minecraftUuid) {
      filters.minecraftUuid = req.query.minecraftUuid as string;
    }

    if (req.query.minecraftUsername) {
      filters.minecraftUsername = {
        $ilike: `%${req.query.minecraftUsername}%`,
      };
    }

    if (req.query.isActive !== undefined) {
      filters.isActive = req.query.isActive === "true";
    }

    const validSortFields = ["createdAt", "minecraftUsername", "updatedAt"];
    const orderBy = validSortFields.includes(sortBy)
      ? (sortBy as any)
      : "createdAt";

    try {
      const players = await Q.player.findAll(filters, {
        orderBy,
        orderDirection: sortOrder,
        limit,
        offset: page * limit,
      });

      const total = await Q.player.count(filters);

      const response: GetPlayersResponse = {
        success: true,
        data: {
          players: players as any,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      };

      res.json(response);
    } catch (error) {
      logger.error("Failed to fetch players:", error);
      throw new BadRequestError("Failed to fetch players");
    }
  }
}
