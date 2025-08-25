/**
 * Error Handling Middleware.
 *
 * Standardized error handling following Google API Design Guide.
 * Provides consistent error responses across all API endpoints.
 *
 * @file Express error handling middleware.
 */

import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('interfaces-api-http-middleware-errors');

/**
 * Standard API Error Response Structure.
 * Following Google API Design Guide error format.
 *
 * @example
 */
