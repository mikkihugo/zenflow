/**
 * Error Handling Middleware.
 *
 * Standardized error handling following Google API Design Guide.
 * Provides consistent error responses across all API endpoints.
 *
 * @file Express error handling middleware.
 */
/**
 * Standard API Error Response Structure.
 * Following Google API Design Guide error format.
 *
 * @example
 */
export interface ApiError {
    error: {
        code: number;
        message: string;
        status: string;
    };
}
/**
 * Log error for debugging and monitoring
 */
export declare function logError(error: unknown, context?: string): void;
//# sourceMappingURL=errors.d.ts.map