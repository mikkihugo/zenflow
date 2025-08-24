/**
 * @file API Response Types
 *
 * Common interface definitions for API response objects throughout the application.
 * These types provide type safety for response objects with 'success'and data' properties.
 */

/**
 * B'se API response structure
 */
export interface BaseApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

/**
 * Successful API response
 */
export interface SuccessResponse<T = unknown> extends BaseApiResponse<T> {
  success: true;
  data: T;
}

/**
 * Error API response
 */
export interface ErrorResponse extends BaseApiResponse<never> {
  success: false;
  error: string;
  data?: never;
}

/**
 * API response with additional details
 */
export interface DetailedApiResponse<T = unknown> extends BaseApiResponse<T> {
  details?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Command execution result
 */
export interface CommandResult {
  success: boolean;
  stdout?: string;
  stderr?: string;
  code?: number;
  error?: string;
}

/**
 * Test execution result
 */
export interface TestResult {
  success: boolean;
  details?: Record<string, unknown>;
  error?: string;
  data?: any;
}

/**
 * SPARC-specific response types
 */
export interface SparcGenerationResult extends BaseApiResponse<unknown> {
  algorithms?: any[];
  dataStructures?: any[];
  controlFlows?: any[];
  validation?: any[];
  pseudocodeStructure?: { id: string; [key: string]: any };
}

/**
 * Type guard for checking if response has success property
 */
export function isApiResponse(obj: any): obj is BaseApiResponse {
  return typeof obj === 'object' && obj !== null && 'success' in obj;
}

/**
 * Type guard for checking if response is successful
 */
export function isSuccessResponse<T>(
  response: BaseApiResponse<T>
): response is SuccessResponse<T> {
  return response.success === true;
}

/**
 * Type guard for checking if response is an error
 */
export function isErrorResponse(
  response: BaseApiResponse
): response is ErrorResponse {
  return response.success === false;
}
