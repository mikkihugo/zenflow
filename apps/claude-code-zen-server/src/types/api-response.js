/**
 * @file API Response Types
 *
 * Common interface definitions for API response objects throughout the application.
 * These types provide type safety for response objects with 'success' and 'data' properties.
 */
/**
 * Type guard for checking if response has success property
 */
export function isApiResponse(obj) {
    return typeof obj === 'object' && obj !== null && 'success' in obj;
}
/**
 * Type guard for checking if response is successful
 */
export function isSuccessResponse(response) {
    return response.success === true;
}
/**
 * Type guard for checking if response is an error
 */
export function isErrorResponse(response) {
    return response.success === false;
}
//# sourceMappingURL=api-response.js.map