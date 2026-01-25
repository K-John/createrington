import { Player } from "@/generated/db";
import { Q } from "..";

export * from "./errors";
export * from "./query-helpers";
export * from "./transactions";

/**
 * Checks if a user is a registered Admin in the Database
 *
 * @param discordId - Discord ID of the user
 * @returns Promise resolving to True if user is an admin, false otherwise
 */
export async function isAdminDb(user: string | Player): Promise<boolean> {
  const discordId = typeof user === "string" ? user : user.discordId;
  return await Q.admin.exists({ discordId });
}
