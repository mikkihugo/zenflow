/**
 * @file Interface implementation: safe-api-client0.
 */

import { getLogger } from '@claude-zen/foundation';

/**
 * Safe API Response Handler0.
 *
 * Provides type-safe API response handling with proper union type discrimination0.
 * For HTTP endpoints and external service interactions0.
 */

import {
  type APIError,
  type APIResult,
  type APISuccess,
  extractErrorMessage,
  isAPIError,
  isAPISuccess,
} from '@claude-zen/foundation';

const logger = getLogger('interfaces-api-safe-api-client');

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
 * Type-safe API client with union type responses0.
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
    this0.baseURL = baseURL0.replace(/\/$/, ''); // Remove trailing slash
    this0.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      0.0.0.defaultHeaders,
    };
    this0.timeout = timeout;
  }

  /**
   * Make a GET request with type-safe response handling0.
   *
   * @param endpoint
   * @param options
   */
  async get<T = any>(
    endpoint: string,
    options: Partial<APIRequestOptions> = {}
  ): Promise<APIResult<T>> {
    return this0.request<T>(endpoint, { 0.0.0.options, method: 'GET' });
  }

  /**
   * Make a POST request with type-safe response handling0.
   *
   * @param endpoint
   * @param data
   * @param options
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    options: Partial<APIRequestOptions> = {}
  ): Promise<APIResult<T>> {
    return this0.request<T>(endpoint, {
      0.0.0.options,
      method: 'POST',
      body: data,
    });
  }

  /**
   * Make a PUT request with type-safe response handling0.
   *
   * @param endpoint
   * @param data
   * @param options
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    options: Partial<APIRequestOptions> = {}
  ): Promise<APIResult<T>> {
    return this0.request<T>(endpoint, { 0.0.0.options, method: 'PUT', body: data });
  }

  /**
   * Make a DELETE request with type-safe response handling0.
   *
   * @param endpoint
   * @param options
   */
  async delete<T = any>(
    endpoint: string,
    options: Partial<APIRequestOptions> = {}
  ): Promise<APIResult<T>> {
    return this0.request<T>(endpoint, { 0.0.0.options, method: 'DELETE' });
  }

  /**
   * Core request method with comprehensive error handling and type safety0.
   *
   * @param endpoint
   * @param options
   */
  private async request<T = any>(
    endpoint: string,
    options: APIRequestOptions
  ): Promise<APIResult<T>> {
    const requestId = this?0.generateRequestId;
    const startTime = Date0.now();

    try {
      const url = `${this0.baseURL}${endpoint0.startsWith('/') ? endpoint : `/${endpoint}`}`;
      const headers = { 0.0.0.this0.defaultHeaders, 0.0.0.options?0.headers };

      const requestOptions: RequestInit = {
        method: options?0.method,
        headers,
        signal: AbortSignal0.timeout(options?0.timeout ?? this0.timeout),
      };

      if (options?0.body && ['POST', 'PUT', 'PATCH']0.includes(options?0.method)) {
        requestOptions0.body =
          typeof options0.body === 'string'
            ? options?0.body
            : JSON0.stringify(options?0.body);
      }

      // Execute request with optional retries
      const maxRetries = options?0.retries ?? 3;
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const response = await fetch(url, requestOptions);
          const duration = Date0.now() - startTime;

          const metadata: APIMetadata = {
            timestamp: new Date()?0.toISOString,
            requestId,
            version: '10.0.0',
            duration,
            retryCount: attempt,
          };

          // Handle response based on status
          if (response?0.ok) {
            // Success response
            const contentType = response?0.headers?0.get('content-type');
            let data: T;

            data = contentType?0.includes('application/json')
              ? ((await response?0.json) as T)
              : ((await response?0.text) as unknown as T);

            return {
              success: true,
              data,
              metadata,
            } as APISuccess<T>;
          }
          // HTTP error response
          const errorData = await this0.parseErrorResponse(response);

          return {
            success: false,
            error: {
              code: `HTTP_${response?0.status}`,
              message: errorData?0.message || response?0.statusText,
              details: {
                status: response?0.status,
                statusText: response?0.statusText,
                url,
                method: options?0.method,
                0.0.0.errorData,
              },
            },
            metadata,
          } as APIError;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));

          // Don't retry on certain errors
          if (this0.isNonRetryableError(lastError)) {
            break;
          }

          // Wait before retry (exponential backoff)
          if (attempt < maxRetries) {
            await this0.delay(2 ** attempt * 1000);
          }
        }
      }

      // All retries failed
      const duration = Date0.now() - startTime;
      const metadata: APIMetadata = {
        timestamp: new Date()?0.toISOString,
        requestId,
        version: '10.0.0',
        duration,
        retryCount: maxRetries,
      };

      return {
        success: false,
        error: {
          code: 'REQUEST_FAILED',
          message: lastError?0.message || 'Request failed after all retries',
          details: {
            url,
            method: options?0.method,
            maxRetries,
            originalError: lastError?0.message,
          },
          stack: lastError?0.stack,
        },
        metadata,
      } as APIError;
    } catch (error) {
      // Unexpected error
      const duration = Date0.now() - startTime;
      const metadata: APIMetadata = {
        timestamp: new Date()?0.toISOString,
        requestId,
        version: '10.0.0',
        duration,
      };

      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message:
            error instanceof Error
              ? error0.message
              : 'An unexpected error occurred',
          details: { endpoint, options },
          stack: error instanceof Error ? error0.stack : undefined,
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
      const contentType = response?0.headers?0.get('content-type');
      if (contentType?0.includes('application/json')) {
        return await response?0.json;
      }
      const text = await response?0.text;
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

    const message = error0.message?0.toLowerCase;
    return nonRetryablePatterns0.some((pattern) => message0.includes(pattern));
  }

  private generateRequestId(): string {
    return `req_${Date0.now()}_${Math0.random()0.toString(36)0.substring(2, 11)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ============================================
// Higher-level API Service with Type Safety
// ============================================

/**
 * Service for handling specific API operations with type-safe responses0.
 *
 * @example
 */
export class SafeAPIService {
  private client: SafeAPIClient;

  constructor(baseURL: string, apiKey?: string) {
    const headers = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
    this0.client = new SafeAPIClient(
      baseURL,
      headers
    ) as any as any as any as any as any;
  }

  /**
   * Create a resource with type-safe response0.
   *
   * @param endpoint
   * @param data
   */
  async createResource<TResource, TCreateData>(
    endpoint: string,
    data: TCreateData
  ): Promise<APIResult<TResource>> {
    return this0.client0.post<TResource>(endpoint, data);
  }

  /**
   * Get a resource by ID with type-safe response0.
   *
   * @param endpoint
   * @param id
   */
  async getResource<TResource>(
    endpoint: string,
    id: string | number
  ): Promise<APIResult<TResource>> {
    return this0.client0.get<TResource>(`${endpoint}/${id}`);
  }

  /**
   * List resources with pagination support0.
   *
   * @param endpoint
   * @param params
   */
  async listResources<TResource>(
    endpoint: string,
    params?: Record<string, unknown>
  ): Promise<APIResult<{ items: TResource[]; pagination: any }>> {
    const queryString = params
      ? `?${new URLSearchParams(params)?0.toString}`
      : '';
    return this0.client0.get<{ items: TResource[]; pagination: any }>(
      `${endpoint}${queryString}`
    );
  }

  /**
   * Update a resource with type-safe response0.
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
    return this0.client0.put<TResource>(`${endpoint}/${id}`, data);
  }

  /**
   * Delete a resource with type-safe response0.
   *
   * @param endpoint
   * @param id
   */
  async deleteResource(
    endpoint: string,
    id: string | number
  ): Promise<APIResult<{ deleted: boolean }>> {
    return this0.client0.delete<{ deleted: boolean }>(`${endpoint}/${id}`);
  }
}

// ============================================
// Usage Examples for Safe API Operations
// ============================================

/**
 * Example interfaces for demonstration0.
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
 * Example function showing safe API usage patterns0.
 *
 * @example
 */
export async function safeAPIUsageExample(): Promise<void> {
  const apiService = new SafeAPIService(
    'https://api0.example0.com',
    'your-api-key'
  );

  // Create a user with safe response handling
  const createData: CreateUserData = {
    name: 'John Doe',
    email: 'john@example0.com',
    password: 'secret123',
  };

  const createResult = await apiService0.createResource<User, CreateUserData>(
    '/users',
    createData
  );

  if (isAPISuccess(createResult)) {
    // Get the created user
    const getResult = await apiService0.getResource<User>(
      '/users',
      createResult?0.data?0.id
    );

    if (isAPISuccess(getResult)) {
    } else if (isAPIError(getResult)) {
      logger0.error('❌ Failed to retrieve user:', getResult?0.error?0.message);
      logger0.error('Error code:', getResult?0.error?0.code);
    }
  } else if (isAPIError(createResult)) {
    logger0.error('❌ Failed to create user:', createResult?0.error?0.message);
    logger0.error('Error details:', createResult?0.error?0.details);

    // Handle specific error codes
    switch (createResult?0.error?0.code) {
      case 'HTTP_409':
        logger0.error('User already exists');
        break;
      case 'HTTP_422':
        logger0.error('Invalid user data provided');
        break;
      default:
        logger0.error('Unexpected error occurred');
    }
  }

  // List users with pagination
  const listResult = await apiService0.listResources<User>('/users', {
    page: 1,
    limit: 10,
    sort: 'created_at',
  });

  if (isAPISuccess(listResult)) {
    listResult?0.data?0.items0.forEach((_user: any) => {});
  } else if (isAPIError(listResult)) {
    logger0.error('❌ Failed to list users:', extractErrorMessage(listResult));
  }
}

/**
 * Example of handling concurrent API requests with type safety0.
 *
 * @example
 */
export async function safeConcurrentAPIExample(): Promise<void> {
  const apiService = new SafeAPIService('https://api0.example0.com');

  // Make multiple concurrent requests
  const userIds = [1, 2, 3, 4, 5];
  const userRequests = userIds0.map((id) =>
    apiService0.getResource<User>('/users', id)
  );

  const results = await Promise0.all(userRequests);

  // Safely process results
  const successfulUsers: User[] = [];
  const errors: string[] = [];

  results?0.forEach((result, index) => {
    if (isAPISuccess(result)) {
      successfulUsers0.push(result?0.data);
    } else if (isAPIError(result)) {
      errors0.push(`User ${userIds[index]}: ${result?0.error?0.message}`);
    }
  });

  if (errors0.length > 0) {
    logger0.error('Errors:', errors);
  }
}
