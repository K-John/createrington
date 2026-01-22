/**
 * Formatting utilities for Discord messages and embeds
 *
 * Provides consistent formatting for common data types like playtime,
 * currency, numbers, and dates across the application
 */

/**
 * Formats playtime in seconds to a human-readable string
 *
 * Converts total seconds into hours and minutes format.
 * For very long durations (1000+ hours), includes days.
 *
 * @param seconds - Total playtime in seconds
 * @returns Formatted string
 *
 * @example
 * formatPlaytime(0)        // "0m"
 * formatPlaytime(120)      // "2m"
 * formatPlaytime(3661)     // "1h 1m"
 * formatPlaytime(36000)    // "10h 0m"
 * formatPlaytime(90000)    // "25h 0m"
 * formatPlaytime(360000)   // "4d 4h"
 */
export function formatPlaytime(seconds: number): string {
  if (seconds < 60) {
    return "0m";
  }

  const totalMinutes = Math.floor(seconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  // For very long durations (100+ hours), show days
  if (totalHours >= 100) {
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;

    if (hours === 0) {
      return `${days}d`;
    }
    return `${days}d ${hours}h`;
  }

  // Standard format: Xh Ym
  if (totalHours > 0) {
    if (minutes === 0) {
      return `${totalHours}h`;
    }
    return `${totalHours}h ${minutes}m`;
  }

  // Less than an hour: just minutes
  return `${minutes}m`;
}

/**
 * Formats a balance/currency value in American format
 *
 * Always floors the value (no decimals) and formats with commas
 * for thousands separators. Adds dollar sign prefix.
 *
 * @param balance - The balance amount (can be number or string)
 * @returns Formatted currency string
 *
 * @example
 * formatBalance(0)           // "$0"
 * formatBalance(100)         // "$100"
 * formatBalance(1000)        // "$1,000"
 * formatBalance(1234567)     // "$1,234,567"
 * formatBalance(1234.56)     // "$1,234"
 * formatBalance("9999.99")   // "$9,999"
 */
export function formatBalance(balance: number | string): string {
  const numericValue =
    typeof balance === "string" ? parseFloat(balance) : balance;

  if (isNaN(numericValue)) {
    return "$0";
  }

  const floored = Math.floor(numericValue);
  const formatted = floored.toLocaleString("en-US");

  return `$${formatted}`;
}

/**
 * Formats a large number with American-style thousand separators
 *
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted number string
 *
 * @example
 * formatNumber(1234)         // "1,234"
 * formatNumber(1234567)      // "1,234,567"
 * formatNumber(1234.567, 2)  // "1,234.57"
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formats a percentage value
 *
 * @param value - The percentage value (0-100 or 0-1)
 * @param decimals - Number of decimal places (default: 1)
 * @param isDecimal - Whether the input is in decimal form (0-1) vs percentage form (0-100)
 * @returns Formatted percentage string with % symbol
 *
 * @example
 * formatPercentage(50)           // "50.0%"
 * formatPercentage(66.666, 2)    // "66.67%"
 * formatPercentage(0.5, 1, true) // "50.0%"
 */
export function formatPercentage(
  value: number,
  decimals: number = 1,
  isDecimal: boolean = false,
): string {
  const percentage = isDecimal ? value * 100 : value;
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Formats a Discord timestamp for relative or absolute display
 *
 * Uses Discord's timestamp formatting syntax for client-side rendering
 *
 * @param date - Date object or timestamp in milliseconds
 * @param style - Discord timestamp style
 * @returns Discord timestamp string
 *
 * Styles:
 * - "t": Short time (e.g., "9:41 PM")
 * - "T": Long time (e.g., "9:41:30 PM")
 * - "d": Short date (e.g., "01/17/2026")
 * - "D": Long date (e.g., "January 17, 2026")
 * - "f": Short date/time (e.g., "January 17, 2026 9:41 PM")
 * - "F": Long date/time (e.g., "Saturday, January 17, 2026 9:41 PM")
 * - "R": Relative time (e.g., "2 hours ago")
 *
 * @example
 * formatDiscordTimestamp(new Date(), "R") // "<t:1705526490:R>" → "2 hours ago"
 * formatDiscordTimestamp(date, "f")       // "<t:1705526490:f>" → "January 17, 2026 9:41 PM"
 */
export function formatDiscordTimestamp(
  date: Date | number,
  style: "t" | "T" | "d" | "D" | "f" | "F" | "R" = "f",
): string {
  const timestamp = date instanceof Date ? date.getTime() : date;
  const unixTimestamp = Math.floor(timestamp / 1000);
  return `<t:${unixTimestamp}:${style}>`;
}

/**
 * Formats a duration between two dates
 *
 * @param start - Start date
 * @param end - End date (defaults to now)
 * @returns Human-readable duration string
 *
 * @example
 * formatDuration(pastDate, now) // "2 hours and 30 minutes"
 * formatDuration(pastDate)      // "5 days and 3 hours"
 */
export function formatDuration(start: Date, end: Date = new Date()): string {
  const diffMs = end.getTime() - start.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 60) {
    return `${diffSeconds} second${diffSeconds !== 1 ? "s" : ""}`;
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""}`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  const remainingMinutes = diffMinutes % 60;

  if (diffHours < 24) {
    if (remainingMinutes === 0) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""}`;
    }
    return `${diffHours} hour${
      diffHours !== 1 ? "s" : ""
    } and ${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""}`;
  }

  const diffDays = Math.floor(diffHours / 24);
  const remainingHours = diffHours % 24;

  if (remainingHours === 0) {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
  }
  return `${diffDays} day${
    diffDays !== 1 ? "s" : ""
  } and ${remainingHours} hour${remainingHours !== 1 ? "s" : ""}`;
}

/**
 * Truncates a string to a maximum length with ellipsis
 *
 * @param text - The text to truncate
 * @param maxLength - Maximum length (default: 100)
 * @param ellipsis - String to append when truncated (default: "...")
 * @returns Truncated string
 *
 * @example
 * truncate("Hello World", 5)              // "Hello..."
 * truncate("Short", 10)                    // "Short"
 * truncate("Long text here", 8, "…")      // "Long tex…"
 */
export function truncate(
  text: string,
  maxLength: number = 100,
  ellipsis: string = "...",
): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Formats a file size in bytes to human-readable format
 *
 * @param bytes - File size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted file size string
 *
 * @example
 * formatFileSize(1024)           // "1.00 KB"
 * formatFileSize(1048576)        // "1.00 MB"
 * formatFileSize(1234567, 1)     // "1.2 MB"
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${
    sizes[i]
  }`;
}

/**
 * Pluralizes a word based on count
 *
 * @param count - The count to check
 * @param singular - Singular form of the word
 * @param plural - Plural form (defaults to singular + "s")
 * @returns Pluralized word
 *
 * @example
 * pluralize(1, "item")           // "item"
 * pluralize(5, "item")           // "items"
 * pluralize(1, "box", "boxes")   // "box"
 * pluralize(3, "box", "boxes")   // "boxes"
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string,
): string {
  if (count === 1) {
    return singular;
  }
  return plural || `${singular}s`;
}

/**
 * Formats a count with word
 *
 * @param count - The count
 * @param singular - Singular form
 * @param plural - Plural form (optional)
 * @returns Formatted string with count and word
 *
 * @example
 * formatCount(1, "player")          // "1 player"
 * formatCount(5, "player")          // "5 players"
 * formatCount(0, "item")            // "0 items"
 */
export function formatCount(
  count: number,
  singular: string,
  plural?: string,
): string {
  return `${count} ${pluralize(count, singular, plural)}`;
}
