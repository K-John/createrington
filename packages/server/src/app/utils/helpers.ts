/**
 * Function to detect ID type
 * Properly detects between discordId and minecraftUuid
 *
 * @param id - The ID to extract
 * @returns Type of ID
 */
export function getIdType(id: string): "minecraft" | "discord" | "invalid" {
  const isMinecraftUUID =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (isMinecraftUUID) return "minecraft";

  const isDiscordID = /^\d{17,20}$/.test(id);
  if (isDiscordID) return "discord";

  return "invalid";
}
