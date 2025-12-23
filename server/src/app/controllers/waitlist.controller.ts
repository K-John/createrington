import { waitlist } from "@/db";
import { Request, Response } from "express";
import { BadRequestError } from "../middleware";
import { success } from "zod";

/**
 * Waitlist controller
 *
 * Handles all waitlist related business logic
 */
export class WaitlistController {
  /**
   * Get all waitlist entries
   *
   * GET /api/waitlist
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    const entries = await waitlist.getAll({
      orderBy: "submittedAt",
      orderDirection: "DESC",
    });

    res.json({
      success: true,
      data: entries,
      count: entries.length,
    });
  }

  /**
   * Get a single waitlist entry by ID
   *
   * GET /api/waitlist/:id
   */
  static async get(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new BadRequestError("Invalid entry ID");
    }

    const entry = await waitlist.get({ id });

    res.json({
      success: true,
      data: entry,
    });
  }

  /**
   * Create a new waitlist entry
   *
   * POST /api/waitlist
   * Body: { email: string, discordName: string }
   */
  static async create(req: Request, res: Response): Promise<void> {
    const { email, discordName } = req.body;

    if (!email || !discordName) {
      throw new BadRequestError("Email and Discord name are required");
    }

    const existing = await waitlist.find({ email });
    if (existing) {
      throw new BadRequestError("Email already registered on whitelist");
    }

    const entry = await waitlist.createAndReturn({
      email,
      discordName,
    });

    res.status(201).json({
      success: true,
      data: entry,
      message: "Successfully added to waitlist",
    });
  }

  /**
   * Deletes a waitlist entry
   *
   * DELETE /api/waitlist/:id
   */
  static async delete(req: Request, res: Response): Promise<void> {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new BadRequestError("Invalid entry ID");
    }

    await waitlist.delete({ id });

    res.json({
      success: true,
      message: "Waitlist entry deleted",
    });
  }

  /**
   * Get waitlist statistics
   *
   * GET /api/waitlist/stats
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    const total = await waitlist.count();

    res.json({
      success: true,
      data: {
        total,
      },
    });
  }
}
