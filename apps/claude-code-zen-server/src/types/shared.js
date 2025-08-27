/**
 * Shared Types
 *
 * Cross-domain types and utilities used throughout the system.
 * Consolidated from: shared-types.ts, global.d.ts, singletons.ts, event-types.ts
 */
export function success(data) {
    return { success: true, data };
}
export function failure(error) {
    return { success: false, error };
}
// ============================================================================
// Type Guards
// ============================================================================
export function isBaseEntity(obj) {
    return (obj &&
        typeof obj.id === 'string' &&
        obj.created instanceof Date &&
        obj.updated instanceof Date);
}
export function isSystemEvent(obj) {
    return (obj &&
        typeof obj.id === 'string' &&
        typeof obj.type === 'string' &&
        typeof obj.source === 'string' &&
        obj.timestamp instanceof Date);
}
export function isService(obj) {
    return (obj &&
        typeof obj.name === 'string' &&
        typeof obj.version === 'string' &&
        typeof obj.status === 'string');
}
export function isSuccess(result) {
    return result.success === true;
}
export function isFailure(result) {
    return result.success === false;
}
// ============================================================================
// Constants
// ============================================================================
export const DEFAULT_TIMEOUT = 30000; // 30 seconds
export const DEFAULT_RETRY_ATTEMPTS = 3;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const EVENT_PRIORITIES = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
};
export const SERVICE_STATUSES = {
    starting: 'Starting',
    running: 'Running',
    stopping: 'Stopping',
    stopped: 'Stopped',
    error: 'Error',
};
