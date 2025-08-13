/**
 * @file Interface implementation: safe-api-client.
 */

import { getLogger } from '../config/logging-config';

const logger = getLogger('interfaces-api-safe-api-client');

/**
 * Safe API Response Handler.
 *
 * Provides type-safe API response handling with proper union type discrimination.
 * For HTTP endpoints and external service interactions.
 */

import {
  type APIError,
  type APIResult,
  type APISuccess,
  extractErrorMessage,
  isAPIError,
  isAPISuccess,
} from '../utils/type-guards';

export interface APIRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
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
export class SafeAPIClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;

  constructor(
    baseURL: string,
    defaultHeaders: Record<string, string> = {},
    timeout: number = 30000
  ) {
    this.baseURL = baseURL.replace(/\/$/, ''); // Remove trailing slash
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...defaultHeaders,
    };
    this.timeout = timeout;
  }

  /**
   * Make a GET request with type-safe response handling.
   *
   * @param endpoint
   * @param options
   */
  async get<T = any>(
    endpoint: string,
    options: Partial<APIRequestOptions> = {}
  ): Promise<APIResult<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * Make a POST request with type-safe response handling.
   *
   * @param endpoint
   * @param data
   * @param options
   */
  async post<T = any>(
    endpoint: string,
    data?: unknown,
    options: Partial<APIRequestOptions> = {}
  ): Promise<APIResult<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data,
    });
  }

  /**
   * Make a PUT request with type-safe response handling.
   *
   * @param endpoint
   * @param data
   * @param options
   */
  async put<T = any>(
    endpoint: string,
    data?: unknown,
    options: Partial<APIRequestOptions> = {}
  ): Promise<APIResult<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body: data });
  }

  /**
   * Make a DELETE request with type-safe response handling.
   *
   * @param endpoint
   * @param options
   */
  async delete<T = any>(
    endpoint: string,
    options: Partial<APIRequestOptions> = {}
  ): Promise<APIResult<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Core request method with comprehensive error handling and type safety.
   *
   * @param endpoint
   * @param options
   */
  private async request<T = any>(
    endpoint: string,
    options: APIRequestOptions
  ): Promise<APIResult<T>> {
    const requestId = this.generateRequestId();
    const startTime = Date.now();

    try {
      const url = `${this.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
      const headers = { ...this.defaultHeaders, ...options?.headers };

      const requestOptions: RequestInit = {
        method: options?.method,
        headers,
        signal: AbortSignal.timeout(options?.timeout ?? this.timeout),
      };

      if (options?.body && ['POST', 'PUT', 'PATCH'].includes(options?.method)) {
        requestOptions.body =
          typeof options.body === 'string'
            ? options?.body
            : JSON.stringify(options?.body);
      }

      // Execute request with optional retries
      const maxRetries = options?.retries ?? 3;
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const response = await fetch(url, requestOptions);
          const duration = Date.now() - startTime;

          const metadata: APIMetadata = {
            timestamp: new Date().toISOString(),
            requestId,
            version: '1.0.0',
            duration,
            retryCount: attempt,
          };

          // Handle response based on status
          if (response?.ok) {
            // Success response
            const contentType = response?.headers?.get('content-type');
            let data: T;

            if (contentType?.includes('application/json')) {
              data = (await response?.json()) as T;
            } else {
              data = (await response?.text()) as unknown as T;
            }

            return {
              success: true,
              data,
              metadata,
            } as APISuccess<T>;
          }
          // HTTP error response
          const errorData = await this.parseErrorResponse(response);

          return {
            success: false,
            error: {
              code: `HTTP_${response?.status}`,
              message: errorData?.message || response?.statusText,
              details: {
                status: response?.status,
                statusText: response?.statusText,
                url,
                method: options?.method,
                ...errorData,
              },
            },
            metadata,
          } as APIError;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));

          // Don't retry on certain errors
          if (this.isNonRetryableError(lastError)) {
            break;
          }

          // Wait before retry (exponential backoff)
          if (attempt < maxRetries) {
            await this.delay(2 ** attempt * 1000);
          }
        }
      }

      // All retries failed
      const duration = Date.now() - startTime;
      const metadata: APIMetadata = {
        timestamp: new Date().toISOString(),
        requestId,
        version: '1.0.0',
        duration,
        retryCount: maxRetries,
      };

      return {
        success: false,
        error: {
          code: 'REQUEST_FAILED',
          message: lastError?.message || 'Request failed after all retries',
          details: {
            url,
            method: options?.method,
            maxRetries,
            originalError: lastError?.message,
          },
          stack: lastError?.stack,
        },
        metadata,
      } as APIError;
    } catch (error) {
      // Unexpected error
      const duration = Date.now() - startTime;
      const metadata: APIMetadata = {
        timestamp: new Date().toISOString(),
        requestId,
        version: '1.0.0',
        duration,
      };

      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred',
          details: { endpoint, options },
          stack: error instanceof Error ? error.stack : undefined,
        },
        metadata,
      } as APIError;
    }
  }

  // ============================================
  // Helper Methods
  // ============================================

  private async parseErrorResponse(response: Response): Promise<unknown> {
    try {
      const contentType = response?.headers?.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response?.json();
      }
      const text = await response?.text();
      return { message: text };
    } catch {
      return { message: 'Failed to parse error response' };
    }
  }

  private isNonRetryableError(error: Error): boolean {
    // Don't retry on certain types of errors
    const nonRetryablePatterns = [
      'abort',
      'timeout',
      'authentication',
      'authorization',
      'permission',
    ];

    const message = error.message.toLowerCase();
    return nonRetryablePatterns.some((pattern) => message.includes(pattern));
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================
// Higher-level API Service with Type Safety
// ============================================

/**
 * Service for handling specific API operations with type-safe responses.
 *
 * @example
 */
export class SafeAPIService {
  private client: SafeAPIClient;

  constructor(baseURL: string, apiKey?: string) {
    const headers = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
    this.client = new SafeAPIClient(baseURL, headers) as any as any as any;
  }

  /**
   * Create a resource with type-safe response.
   *
   * @param endpoint
   * @param data
   */
  async createResource<TResource, TCreateData>(
    endpoint: string,
    data: TCreateData
  ): Promise<APIResult<TResource>> {
    return this.client.post<TResource>(endpoint, data);
  }

  /**
   * Get a resource by ID with type-safe response.
   *
   * @param endpoint
   * @param id
   */
  async getResource<TResource>(
    endpoint: string,
    id: string | number
  ): Promise<APIResult<TResource>> {
    return this.client.get<TResource>(`${endpoint}/${id}`);
  }

  /**
   * List resources with pagination support.
   *
   * @param endpoint
   * @param params
   */
  async listResources<TResource>(
    endpoint: string,
    params?: Record<string, unknown>
  ): Promise<APIResult<{ items: TResource[]; pagination: unknown }>> {
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : '';
    return this.client.get<{ items: TResource[]; pagination: unknown }>(
      `${endpoint}${queryString}`
    );
  }

  /**
   * Update a resource with type-safe response.
   *
   * @param endpoint
   * @param id
   * @param data
   */
  async updateResource<TResource, TUpdateData>(
    endpoint: string,
    id: string | number,
    data: TUpdateData
  ): Promise<APIResult<TResource>> {
    return this.client.put<TResource>(`${endpoint}/${id}`, data);
  }

  /**
   * Delete a resource with type-safe response.
   *
   * @param endpoint
   * @param id
   */
  async deleteResource(
    endpoint: string,
    id: string | number
  ): Promise<APIResult<{ deleted: boolean }>> {
    return this.client.delete<{ deleted: boolean }>(`${endpoint}/${id}`);
  }
}

// ============================================
// Usage Examples for Safe API Operations
// ============================================

/**
 * Example interfaces for demonstration.
 *
 * @example
 */
interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

interface CreateUserData {
  name: string;
  email: string;
  password: string;
}

/**
 * Example function showing safe API usage patterns.
 *
 * @example
 */
export async function safeAPIUsageExample(): Promise<void> {
  const apiService = new SafeAPIService(
    'https://api.example.com',
    'your-api-key'
  );

  // Create a user with safe response handling
  const createData: CreateUserData = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'secret123',
  };

  const createResult = await apiService.createResource<User, CreateUserData>(
    '/users',
    createData
  );

  if (isAPISuccess(createResult)) {
    // Get the created user
    const getResult = await apiService.getResource<User>(
      '/users',
      createResult?.data?.id
    );

    if (isAPISuccess(getResult)) {
    } else if (isAPIError(getResult)) {
      logger.error('❌ Failed to retrieve user:', getResult?.error?.message);
      logger.error('Error code:', getResult?.error?.code);
    }
  } else if (isAPIError(createResult)) {
    logger.error('❌ Failed to create user:', createResult?.error?.message);
    logger.error('Error details:', createResult?.error?.details);

    // Handle specific error codes
    switch (createResult?.error?.code) {
      case 'HTTP_409':
        logger.error('User already exists');
        break;
      case 'HTTP_422':
        logger.error('Invalid user data provided');
        break;
      default:
        logger.error('Unexpected error occurred');
    }
  }

  // List users with pagination
  const listResult = await apiService.listResources<User>('/users', {
    page: 1,
    limit: 10,
    sort: 'created_at',
  });

  if (isAPISuccess(listResult)) {
    listResult?.data?.items.forEach((_user: unknown) => {});
  } else if (isAPIError(listResult)) {
    logger.error('❌ Failed to list users:', extractErrorMessage(listResult));
  }
}

/**
 * Example of handling concurrent API requests with type safety.
 *
 * @example
 */
export async function safeConcurrentAPIExample(): Promise<void> {
  const apiService = new SafeAPIService('https://api.example.com');

  // Make multiple concurrent requests
  const userIds = [1, 2, 3, 4, 5];
  const userRequests = userIds.map((id) =>
    apiService.getResource<User>('/users', id)
  );

  const results = await Promise.all(userRequests);

  // Safely process results
  const successfulUsers: User[] = [];
  const errors: string[] = [];

  results?.forEach((result, index) => {
    if (isAPISuccess(result)) {
      successfulUsers.push(result?.data);
    } else if (isAPIError(result)) {
      errors.push(`User ${userIds[index]}: ${result?.error?.message}`);
    }
  });

  if (errors.length > 0) {
    logger.error('Errors:', errors);
  }
}
