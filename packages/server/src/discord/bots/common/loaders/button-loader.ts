import config from "@/config";
import fs from "node:fs";
import { ButtonInteraction, Collection } from "discord.js";
import path from "node:path";
import { pathToFileURL } from "node:url";

const isDev = config.envMode.isDev;

/**
 * Button handler function type
 *
 * Defines the signature for functions that handle Discord button interactions
 *
 * @param interaction - The button interaction from Discord
 * @returns Promise resolving when the interaction is handled
 */
export type ButtonHandler = (interaction: ButtonInteraction) => Promise<void>;

/**
 * Button module structure with pattern matching support
 *
 * Defines the structure of button handler modules. Supports exact matches,
 * wildcard patterns, and regex patterns for flexible customId matching
 */
export interface ButtonModule {
  /**
   * Pattern to match button customIds
   * Can be:
   * - Exact string: "help-button"
   * - Prefix pattern: "waitlist:*"
   * - Regex: /^ticket-(\d+)$/
   */
  pattern: string | RegExp;
  /**
   * Handler function for this button
   *
   * Called when a button interaction's customId matches the pattern
   */
  execute: ButtonHandler;
  /**
   * Whether this button should only work in production
   *
   * If set to true, the button handler will not be loaded in development mode
   *
   * @default false
   */
  prodOnly: boolean;
  /**
   * Permission check
   *
   * Optional function to verify if the user has permission to use this button
   * Return true to allow, false to deny
   *
   * @param interaction - The button interaction to check permissions for
   * @returns Promise resolving to true if allowed, false if denied
   */
  checkPermission?: (Interaction: ButtonInteraction) => Promise<boolean>;
  /**
   * Message to display when permission check fails
   *
   * Shown to users who attempt to use the button without proper permissions
   *
   * @default "You don't have permission to use this button"
   */
  permissionDeniedMessage?: string;
}

/**
 * Checks if a customId matches a pattern
 *
 * Supports exact string matching, wildcard patterns (using *), and regex patterns
 *
 * @param customId - The button's customId to checl
 * @param pattern - Pattern to match against (string with optional wildcards or RegExp)
 * @returns True if the customId matches the pattern, false otherwise
 * @private
 */
function matchesPattern(customId: string, pattern: string | RegExp): boolean {
  if (typeof pattern === "string") {
    if (!pattern.includes("*")) {
      return customId === pattern;
    }

    const regexPattern = pattern
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace(/\\\*/g, ".*");

    return new RegExp(`^${regexPattern}$`).test(customId);
  }

  return pattern.test(customId);
}

/**
 * Loads button handlers
 *
 * Scans the buttons directory, imports all button handler modules, validates them,
 * and returns a collection of loaded handlers. Automatically filters out production
 * buttons in development mode
 *
 * @returns Promise resolving to a Collection of button handlers, keyed by filename
 *
 * @remarks
 * - In development mode, loads `.ts` files
 * - In production mode, loads `.js` files
 * - Skips files missing required exports (`pattern` or `execute`)
 * - Skips production-only buttons when running in development
 * - Logs warnings for invalid or skipped button files
 */
export async function loadButtonHandlers(
  buttonsPath: string,
): Promise<Collection<string, ButtonModule>> {
  if (!fs.existsSync(buttonsPath)) {
    logger.warn(`Buttons directory not found: ${buttonsPath}`);
    return new Collection();
  }

  const buttonFiles = fs
    .readdirSync(buttonsPath)
    .filter((file) => (isDev ? file.endsWith(".ts") : file.endsWith(".js")));

  const buttonHandlers = new Collection<string, ButtonModule>();

  for (const file of buttonFiles) {
    const filePath = path.join(buttonsPath, file);
    try {
      const buttonModule = (await import(
        pathToFileURL(filePath).href
      )) as ButtonModule;

      if (!buttonModule.pattern) {
        logger.warn(`Skipped ${file}: missing 'pattern' export`);
        continue;
      }

      if (typeof buttonModule.execute !== "function") {
        logger.warn(`Skipped ${file}: 'execute' is not a function`);
        continue;
      }

      const isProdOnly = buttonModule.prodOnly === true;

      if (isDev && isProdOnly) {
        logger.warn(`Skipped loading production only button handler: ${file}`);
        continue;
      }

      const handlerKey = path.parse(file).name;
      buttonHandlers.set(handlerKey, buttonModule);

      logger.debug(
        `Loaded button handler: ${handlerKey} (pattern: ${buttonModule.pattern})`,
      );
    } catch (error) {
      logger.error(`Failed to load button handler ${file}:`, error);
    }
  }

  logger.info(
    `Loaded ${buttonHandlers.size} button handler(s) from ${buttonsPath}`,
  );
  return buttonHandlers;
}

/**
 * Finds a matching button handler for a given customId
 *
 * Interates through all registered button handlers and returns the first one
 * whose pattern matches the provided customId. Returns null if no match is found
 *
 * @param customId - The button's customId from the interaction
 * @param handlers - Collection of registered button handlers
 * @returns The matching ButtomModule, or null if no handler matches
 */
export function findButtonHandler(
  customId: string,
  handlers: Collection<string, ButtonModule>,
): ButtonModule | null {
  for (const handler of handlers.values()) {
    if (matchesPattern(customId, handler.pattern)) {
      return handler;
    }
  }
  return null;
}
