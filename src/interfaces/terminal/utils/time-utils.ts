/**
 * Time utility functions for terminal interface.
 */

/**
 * Format uptime duration in milliseconds to human-readable string.
 *
 * @param uptimeMs - Uptime duration in milliseconds
 * @returns Formatted string (e.g., "2h 30m 15s", "45m 20s", "30s")
 */
export function formatUptime(uptimeMs: number): string {
  const seconds = Math.floor(uptimeMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

/**
 * Calculate uptime duration from a start timestamp.
 *
 * @param startTime - Start timestamp in milliseconds
 * @returns Duration in milliseconds
 */
export function calculateUptime(startTime: number): number {
  return Date.now() - startTime;
}

/**
 * Format uptime from start timestamp to human-readable string.
 *
 * @param startTime - Start timestamp in milliseconds
 * @returns Formatted uptime string
 */
export function formatUptimeFromStart(startTime: number): string {
  return formatUptime(calculateUptime(startTime));
}
