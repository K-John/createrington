import type { AuthRole } from "@/services/discord/oauth/oauth.service";

/**
 * JWT payload structure
 */
export interface JWTPayload {
  discordId: string;
  username: string;
  role: AuthRole;
  isAdmin: boolean;
  minecraftUuid: string;
  minecraftUsername: string;
  iat?: number;
  exp?: number;
}
