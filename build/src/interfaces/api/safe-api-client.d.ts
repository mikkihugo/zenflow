/**
 * @file Interface implementation: safe-api-client.
 */
/**
 * Safe API Response Handler.
 *
 * Provides type-safe API response handling with proper union type discrimination.
 * For HTTP endpoints and external service interactions.
 */
import { type APIResult } from '../utils/type-guards';
export interface APIRequestOptions {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    body?: any;
    timeout?: number;
    retries?: number;
}
export interface APIMetadata {
    timestamp: string;
    requestId: string;
    version: string;
    duration?: number;
    retryCount?: number;
}
/**
 * Type-safe API client with union type responses.
 *
 * @example
 */
export declare class SafeAPIClient {
    private baseURL;
    private defaultHeaders;
    private timeout;
    constructor(baseURL: string, defaultHeaders?: Record<string, string>, timeout?: number);
    /**
     * Make a GET request with type-safe response handling.
     *
     * @param endpoint
     * @param options
     */
    get<T = any>(endpoint: string, options?: Partial<APIRequestOptions>): Promise<APIResult<T>>;
    /**
     * Make a POST request with type-safe response handling.
     *
     * @param endpoint
     * @param data
     * @param options
     */
    post<T = any>(endpoint: string, data?: any, options?: Partial<APIRequestOptions>): Promise<APIResult<T>>;
    /**
     * Make a PUT request with type-safe response handling.
     *
     * @param endpoint
     * @param data
     * @param options
     */
    put<T = any>(endpoint: string, data?: any, options?: Partial<APIRequestOptions>): Promise<APIResult<T>>;
    /**
     * Make a DELETE request with type-safe response handling.
     *
     * @param endpoint
     * @param options
     */
    delete<T = any>(endpoint: string, options?: Partial<APIRequestOptions>): Promise<APIResult<T>>;
    /**
     * Core request method with comprehensive error handling and type safety.
     *
     * @param endpoint
     * @param options
     */
    private request;
    private parseErrorResponse;
    private isNonRetryableError;
    private generateRequestId;
    private delay;
}
/**
 * Service for handling specific API operations with type-safe responses.
 *
 * @example
 */
export declare class SafeAPIService {
    private client;
    constructor(baseURL: string, apiKey?: string);
    /**
     * Create a resource with type-safe response.
     *
     * @param endpoint
     * @param data
     */
    createResource<TResource, TCreateData>(endpoint: string, data: TCreateData): Promise<APIResult<TResource>>;
    /**
     * Get a resource by ID with type-safe response.
     *
     * @param endpoint
     * @param id
     */
    getResource<TResource>(endpoint: string, id: string | number): Promise<APIResult<TResource>>;
    /**
     * List resources with pagination support.
     *
     * @param endpoint
     * @param params
     */
    listResources<TResource>(endpoint: string, params?: Record<string, any>): Promise<APIResult<{
        items: TResource[];
        pagination: any;
    }>>;
    /**
     * Update a resource with type-safe response.
     *
     * @param endpoint
     * @param id
     * @param data
     */
    updateResource<TResource, TUpdateData>(endpoint: string, id: string | number, data: TUpdateData): Promise<APIResult<TResource>>;
    /**
     * Delete a resource with type-safe response.
     *
     * @param endpoint
     * @param id
     */
    deleteResource(endpoint: string, id: string | number): Promise<APIResult<{
        deleted: boolean;
    }>>;
}
/**
 * Example function showing safe API usage patterns.
 *
 * @example
 */
export declare function safeAPIUsageExample(): Promise<void>;
/**
 * Example of handling concurrent API requests with type safety.
 *
 * @example
 */
export declare function safeConcurrentAPIExample(): Promise<void>;
//# sourceMappingURL=safe-api-client.d.ts.map