export interface LoggerConfig {
  logDir: string;
  keepDays: number;
}

const config: LoggerConfig = {
  /**
   * Root directory where daily log folders/files are written
   * Relative paths are resolved from the process working directory
   */
  logDir: "logs",
  /**
   * Number of days to retain dated log folders before automatic cleanup
   * Older folders beyond this threshold may be deleted
   */
  keepDays: 7,
};

export default config;
