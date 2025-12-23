import config from "@/config";

const categories = config.discord.guild.categories;

/**
 * Discord category IDs mapped with uppercase keys for consistent access
 * Transforms the original category configuration keys to uppercase for standardized reference
 */
export const DiscordCategories = Object.fromEntries(
  Object.entries(categories).map(([key, value]) => [key.toUpperCase(), value])
) as Record<Uppercase<keyof typeof categories>, string>;

/**
 * Type representing any valid Discord category ID from the configuration
 * Ensures type safety when working with category IDs throughout the application
 */
export type DiscordCategoryId =
  (typeof DiscordCategories)[keyof typeof DiscordCategories];

/**
 * Validates whether a given string is configured Discord category ID
 *
 * @param id - The category ID string to validate
 * @returns True if the ID exists in the category configuration, false otherwise
 */
export function isValidCategory(id: string): id is DiscordCategoryId {
  return Object.values(DiscordCategories).includes(id as DiscordCategoryId);
}

/**
 * Retrieves the human-readable name for a given Discord category ID
 *
 * @param id - The Discord category ID to look up
 * @returns The uppercase key name of the category, or "Unknown category" if not found
 */
export function getCategoryName(id: DiscordCategoryId): string {
  const entry = Object.entries(DiscordCategories).find(
    ([_, categoryId]) => categoryId === id
  );
  return entry ? entry[0] : "Unknown category";
}
