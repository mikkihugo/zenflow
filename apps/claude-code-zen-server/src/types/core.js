/**
 * Core System Types
 *
 * Core types for system configuration, lifecycle, and fundamental operations.
 * Consolidated from: core-config.ts, system-config.ts, config-types.ts, logger.ts
 */
// ============================================================================
// Type Guards
// ============================================================================
export function isSystemConfig(obj) {
    return (obj &&
        typeof obj.environment === 'string' &&
        typeof obj.server === 'object' &&
        typeof obj.logging === 'object');
}
export function isSystemHealth(obj) {
    return (obj &&
        typeof obj.status === 'string' &&
        typeof obj.version === 'string' &&
        typeof obj.uptime === 'number');
}
