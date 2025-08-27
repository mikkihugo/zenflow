/**
 * API Types
 *
 * Types for REST API, HTTP clients, and web interfaces.
 * Consolidated from: api-types.ts, api-response.ts, client-types.ts, express-api-types.ts
 */
// ============================================================================
// Type Guards
// ============================================================================
export function isApiResponse(obj) {
    return (obj && typeof obj.success === 'boolean' && obj.timestamp instanceof Date);
}
export function isApiError(obj) {
    return obj && typeof obj.code === 'string' && typeof obj.message === 'string';
}
export function isPaginatedResponse(obj) {
    return (isApiResponse(obj) &&
        obj.meta?.pagination &&
        typeof obj.meta.pagination.total === 'number');
}
