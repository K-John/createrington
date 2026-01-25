/**
 * Balance utility class for 3 decimal precision
 *
 * Converts between user-facing decimals and storage integers
 * Storage format: 1.000 = 1,000
 */
export class BalanceUtils {
  /**
   * Precision multiplier for 3 decimal places
   * 1.000 = 1,000 in storage
   */
  private static readonly PRECISION = 1_000;
  private static readonly PRECISION_BIGINT = BigInt(this.PRECISION);

  /**
   * Maximum safe balance value (~9.2 quintillion with 3 decimals)
   */
  private static readonly MAX_BALANCE = 9_223_372_036_854_775n;
  private static readonly MAX_BALANCE_BIG_INT = this.MAX_BALANCE;

  /**
   * Validates the amount is within safe range and has max 3 decimals
   */
  static validate(amount: number): void {
    if (amount < 0) {
      throw new Error("Amount cannot be negative");
    }
    if (!Number.isFinite(amount)) {
      throw new Error("Amount must be a finite number");
    }

    const rounded = Math.round(amount * this.PRECISION) / this.PRECISION;
    if (Math.abs(rounded - amount) > 0.0001) {
      throw new Error("Amount can have at most 3 decimal places");
    }
  }

  /**
   * Validates bigint is within safe range
   */
  static validateBigInt(amount: bigint): void {
    if (amount < 0n) {
      throw new Error("Amount cannot be negative");
    }
    if (amount > this.MAX_BALANCE_BIG_INT) {
      throw new Error(`Amount exceeds maximum balance`);
    }
  }

  /**
   * Converts user-facing decimal storage to bigint
   *
   * @param amount - Decimal amount (e.g. 1.5, 0.200)
   * @returns Storage bigint (e.g. 1500n, 200n)
   *
   * @example
   * BalanceUtils.toStorage(1.5) // 150
   * BalanceUtils.toStorage(0.200) // 200n
   * BalanceUtils.toStorage(0.2) // 200n
   * BalanceUtils.toStorage(10.123) // 10123n
   */
  static toStorage(amount: number): bigint {
    this.validate(amount);
    const rounded = Math.round(amount * this.PRECISION);
    return BigInt(rounded);
  }

  /**
   * Converts storage bigint to user-friendly decimal
   *
   * @param amount - Storage bigint
   * @returns Decimal number
   *
   * @example
   * BalanceUtils.fromStorage(1500n) // 1.5
   * BalanceUtils.fromStorage(200n) // 0.2
   * BalanceUtils.fromStorage(10123n) // 10.123
   */
  static fromStorage(amount: bigint): number {
    return Number(amount) / this.PRECISION;
  }

  /**
   * Formats balance for display
   *
   * @param amount - Storage bigint
   * @param decimals - Number of decimal places (default: 3)
   * @returns Formatted string
   *
   * @example
   * BalanceUtils.format(1500n) // "1.500"
   * BalanceUtils.format(1500n, 1) // "1.5"
   * BalanceUtils.format(200n) // 0.200
   * BalanceUtils.format(10123n) // "10.123"
   */
  static format(amount: bigint, decimals: number = 3): string {
    const value = this.fromStorage(amount);
    return value.toFixed(decimals);
  }

  /**
   * Formats balance with auto-trimming of trailing zeros
   *
   * @param amount - Storage bigint
   * @returns Formatted string without unnecessary trailing zeros
   *
   * @example
   * BalanceUtils.formatTrimmed(1500n) // "1.5"
   * BalanceUtils.formatTrimmed(1230n) // "1.23"
   * BalanceUtils.formatTrimmed(1234n) // "1.234"
   * BalanceUtils.formatTrimmed(200n) // "0.2"
   */
  static formatTrimmed(amount: bigint): string {
    const value = this.fromStorage(amount);
    const formatted = value.toFixed(3);
    return formatted.replace(/\.?0+$/, "") || "0";
  }

  /**
   * Formats balance with thousands separators
   *
   * @param amount - Storage bigint
   * @param decimals - Number of decimal places (default: 3)
   * @returns Formatted string with commas
   *
   * @example
   * BalanceUtils.formatWithCommas(1500000n) // "1,500.000"
   * BalanceUtils.formatWithCommas(10123n, 2) // "10.12"
   */
  static formatWithCommas(amount: bigint, decimals: number = 3): string {
    const value = this.fromStorage(amount);
    return value.toLocaleString("en-US", {
      maximumFractionDigits: decimals,
      maximumSignificantDigits: decimals,
    });
  }

  /**
   * Safely adds two amounts with overflow protection
   *
   * @param a - First amount (bigint)
   * @param b - Second amount (bigint)
   * @returns Sum
   *
   * @example
   * BalanceUtils.add(1000n, 500n) // 1500n (1.000 + 0.500 = 1.500)
   */
  static add(a: bigint, b: bigint): bigint {
    const result = a + b;
    this.validateBigInt(result);
    return result;
  }

  /**
   * Safely subtracts with underflow protection
   *
   * @param a - First amount (bigint)
   * @param b - Second amount (bigint)
   * @returns Difference
   *
   * @example
   * BalanceUtils.subtract(1500n, 500n) // 1000n (1.500 - 0.500 = 1.000)
   */
  static subtract(a: bigint, b: bigint): bigint {
    const result = a - b;
    if (result < 0n) {
      throw new Error("Subtraction would result in negative number");
    }
    return result;
  }

  /**
   * Compares two balance amounts
   *
   * @param a - First amount (bigint)
   * @param b - Second amount (bigint)
   * @returns -1 if a < b, 0 if a === b, 1 if a > b
   */
  static compare(a: bigint, b: bigint): number {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  }

  /**
   * Checks if an amount would cause overflow when added to balance
   */
  static wouldOverflow(currentBalance: bigint, amountToAdd: number): boolean {
    const amountBigInt = this.toStorage(amountToAdd);
    return currentBalance + amountBigInt > this.MAX_BALANCE_BIG_INT;
  }

  /**
   * Gets the precision (number of decimal places)
   */
  static getPrecision(): number {
    return 3;
  }
}
