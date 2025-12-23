import { AuthRole } from "@/services/discord/oauth/oauth.service";

/**
 * JWT payload structure
 */
export interface JWTPayload {
  discordId: string;
  username: string;
  role: AuthRole;
  isAdmin: boolean;
  uuid: string;
  name: string;
  iat?: number;
  exp?: number;
}
