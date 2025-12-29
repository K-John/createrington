import fs from "node:fs";
import path from "node:path";

/**
 * Safe file writing utilities with directory creation
 */

/**
 * Ensure directory exists, creating it recursively if needed
 */
export function ensureDirectory(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Write file with automatic directory creation
 */
export function writeFile(filePath: string, content: string): void {
  const dir = path.dirname(filePath);
  ensureDirectory(dir);
  fs.writeFileSync(filePath, content, "utf-8");
}

/**
 * Write file only if it doesn't exist (for scaffolding)
 */
export function writeFileIfNotExists(
  filePath: string,
  content: string
): boolean {
  if (fs.existsSync(filePath)) {
    return false;
  }

  writeFile(filePath, content);
  return true;
}

/**
 * Copy file with automatic directory creation
 */
export function copyFile(source: string, destination: string): void {
  const dir = path.dirname(destination);
  ensureDirectory(dir);
  fs.copyFileSync(source, destination);
}

/**
 * Get relative path from project root
 */
export function getRelativePath(from: string, to: string): string {
  return path.relative(from, to);
}
