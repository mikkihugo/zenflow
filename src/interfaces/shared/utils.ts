/**
 * @fileoverview Provides shared utility functions for use across different interfaces.
 *
 * This avoids code duplication and ensures consistent behavior for common tasks.
 * like logging, formatting, or validation.
 */

export function formatLog(message: string): string {
  return `[LOG] ${new Date().toISOString()}: ${message}`;
}
