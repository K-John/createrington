import { AuthRole, discordOAuth } from "@/services/discord/oauth/oauth.service";
import { Request, Response } from "express";
import { BadRequestError, UnauthorizedError } from "@/app/middleware";
import { jwtService } from "@/services/auth/jwt/jwt.service";

/**
 * Authentication controller
 *
 * Handles Discord OAuth flow and JWT token management
 */
export class AuthController {
  /**
   * GET /api/auth/discord
   *
   * Returns Discord OAuth authorization URL
   * Client should redirect user to this URL to begin OAuth flow
   */
  static async getAuthUrl(req: Request, res: Response): Promise<void> {
    const state = Math.random().toString(36).substring(7);
    const authUrl = discordOAuth.generateAuthUrl(state);

    res.json({
      success: true,
      data: {
        url: authUrl,
        state,
      },
    });
  }

  /**
   * POST /api/auth/discord/callback
   * Body: { code: string, state?: string }
   *
   * Handles Discord OAuth callback
   * Exchanges code for user data and returns JWT token
   */
  static async handleDiscordCallback(
    req: Request,
    res: Response
  ): Promise<void> {
    const { code, state } = req.body;

    if (!code) {
      throw new BadRequestError("Authorization code is required");
    }

    try {
      const user = await discordOAuth.authenticate(code);

      if (user.role === AuthRole.UNVERIFIED) {
        logger.warn(
          `Unverified user ${user.username} (${user.discordId}) attempted to login`
        );
        throw new UnauthorizedError(
          "You are not registered. Please contact an administrator."
        );
      }

      const token = jwtService.generate(user);

      logger.info(
        `User ${user.username} (${user.discordId}) logged in successfully`
      );

      res.json({
        success: true,
        data: {
          token,
          user: {
            discordId: user.discordId,
            username: user.username,
            avatar: user.avatar,
            role: user.role,
            isAdmin: user.isAdmin,
            uuid: user.uuid,
            name: user.name,
          },
        },
        message: "Authentication successful",
      });
    } catch (error) {
      logger.error("Discord OAuth callback failed:", error);

      if (error instanceof UnauthorizedError) {
        throw error;
      }

      throw new UnauthorizedError("Authentication failed");
    }
  }

  /**
   * POST /api/auth/refresh
   * Headers: { Authorization: Bearer <token> }
   *
   * Refreshes an existing JWT token
   * Returns a new token with extended expiration
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : authHeader;

    if (!token) {
      throw new BadRequestError("Token is required");
    }

    try {
      const newToken = jwtService.refresh(token);

      res.json({
        success: true,
        data: {
          token: newToken,
        },
        message: "Token refreshed successfully",
      });
    } catch (error) {
      throw new UnauthorizedError("Failed to refresh token");
    }
  }

  /**
   * GET /api/auth/me
   * Headers: { Authorization: Bearer <token> }
   *
   * Returns current user information from JWT
   * Required authentication
   */
  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    res.json({
      success: true,
      data: {
        user: req.user,
      },
    });
  }

  /**
   * POST /api/auth/logout
   *
   * Logout endpoint (client should delete token)
   * Could be extended to maintain token blacklist
   */
  static async logout(req: Request, res: Response): Promise<void> {
    logger.info(`User ${req.user?.username || "Unknown"} logged out`);

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  }

  /**
   * GET /api/auth/status
   *
   * Check authentication status
   * Optional authentication - returns user if authenticated
   */
  static async checkStatus(req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      data: {
        authenticated: !!req.user,
        user: req.user || null,
      },
    });
  }
}
