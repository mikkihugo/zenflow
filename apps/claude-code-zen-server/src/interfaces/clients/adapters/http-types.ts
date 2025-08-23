/**
 * HTTP Client Adapter Types.
 *
 * HTTP-specific extensions to UACL core interfaces.
 * Provides comprehensive type definitions for HTTP client configurations,
 * authentication, retries, and request/response handling.
 */

/**
 * @file TypeScript type definitions for HTTP client interfaces.
 */

import type {
  AuthenticationConfig,
  ClientConfig,
  RetryConfig

} from '../core/interfaces';

/**
 * HTTP-specific authentication configuration.
 *
 * Extends base authentication with HTTP-specific auth methods
 * including digest auth, client certificates, and custom headers.
 *
 * @example
 * ``'typescript
 * const httpAuth: HTTPAuthenticationConfig = {
 *   type: 'digest',
 *   diges: {
  *     username: 'user',
  *     passwod: 'pass',
  *     realm: 'api'
 *
},
 *   clentCert: {
  *     cert: fs.readFileSync('client.crt',
  'utf8),
  *     key: fs.readFileSync('client.key',
  'utf8)
 *
}
 * };
 * ``'
 */
export interface HTTPAuthenticationConfig extends AuthenticationConfig {
  /** HTTP-specific auth methods */

  /** Digest authentication */
  digest?: {
  username: string;
    password: string;
    realm?: string

};

  /** Client certificate auth */
  clientCert?: {
  cert: string;
    key: string;
    passphrase?: string

};

  /** Custom headers for auth */
  customHeaders?: Record<string, string>
}

/**
 * HTTP-specific retry configuration.
 *
 * Extends base retry config with HTTP status codes and methods
 * for intelligent retry logic based on HTTP semantics.
 *
 * @example
 * '`'typescript
 * const retryConfig: HTTPRetryConfig = {
  *   maxAttempts: 3,
  *   delay: 1000,
  *   retryStatusCodes: [408,
  429,
  502,
  503,
  504],
  *   retryMethods: ['GET',
  'POST',
  'PUT],
  *   idempotentOnly: true
 *
};
 * ``'
 */
export interface HTTPRetryConfig extends RetryConfig {
  /** HTTP status codes to retry on */
  retryStatusCodes?: number[];

  /** HTTP methods to retry */
  retryMethods?: ('GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH')[]';

  /** Idempotent requests only */
  idempotentOnly?: boolean

}

/**
 * HTTP client configuration.
 *
 * Comprehensive configuration for HTTP clients including authentication,
 * retry logic, proxy settings, SSL/TLS, and HTTP/2 support.
 *
 * @example
 * ``'typescript
 * const config: HTTPClientConfig = {
 *   baseURL: https://api.example.com',
 *   tieout: 30000,
 *   authentication: {
  *     type: 'bearer',
  *     token: 'your-jwt-token'
 *
},
 *   retry: {
  *     maxAttempts: 3,
  *     retryStatusCodes: [502,
  503,
  504]
 *
},
 *   followRedirects: true,
 *   maxRedirects: 5,
 *   compressio: true,
 *   keepAlive: true,
 *   http2: true
 * };
 * ``'
 */
export interface HTTPClientConfig extends ClientConfig {
  /** HTTP-specific settings */
  baseURL: string;
  timeout?: number;

  /** HTTP authentication */
  authentication?: HTTPAuthenticationConfig;

  /** HTTP retry logic */
  retry?: HTTPRetryConfig;

  /** HTTP-specific options */
  followRedirects?: boolean;
  maxRedirects?: number;
  validateStatus?: (status: number) => boolean;

  /** Compression */
  compression?: boolean;

  /** Keep-alive */
  keepAlive?: boolean;
  keepAliveTimeout?: number;

  /** Request/Response interceptors */
  requestInterceptors?: Array<(config: any) => any>;
  responseInterceptors?: Array<(response: any) => any>;

  /** Proxy settings */
  proxy?: {
    host: string;
    port: number;
    protocol?: 'http' | 'https';
    auth?: {
  username: string;
  password: string
}
};

  /** SSL/TLS settings */
  ssl?: {
  rejectUnauthorized?: boolean;
    ca?: string[];
    cert?: string;
    key?: string

};

  /** HTTP/2 support */
  http2?: boolean
}

/**
 * HTTP request options.
 *
 * Request-specific options that can override client defaults
 * for individual HTTP requests.
 *
 * @example
 * ``'typescript
 * const requestOptions: HTTPRequestOptions = {
 *   timeout: 15000,
 *   headers: {
 *     'X-Custom-Header: 'value'
 *   },
 *   rtries: 2,
 *   responseType: 'json',
 *   metadata: {
  *     requestId: 'req_123',
  *     priority: 'high'
 *
}
 * };
 * ``'
 */
export interface HTTPRequestOptions {
  timeout?: number;
  headers?: Record<string,
  string>;
  retries?: number;
  validateStatus?: (status: number) => boolean;
  responseType?: 'json' | 'text' | 'blob' | 'stream';
  signal?: AbortSignal;
  onUploadProgress?: (progressEvent: any) => void;
  onDownloadProgress?: (progressEvent: any) => void;
  metadata?: Record<string,
  unknown>

}

/**
 * HTTP response type.
 *
 * Standardized response format with data, status, headers,
 * and metadata for comprehensive response handling.
 *
 * @example
 * ``'typescript
 * const response: HTTPResponse<User> = {
 *   data: {
  id: 1,
  name: 'John'
},
 *   status: 200,
 *   statusText: 'OK',
 *   headers: { 'content-type: 'application/json' },
 *   cofig: requestOptions,
 *   metadata: {
  requestId: 'req_123',
  duration: 245
}
 * };
 * ``'
 */
export interface HTTPResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string,
  string>;
  config: HTTPRequestOptions;
  request?: any;
  metadata?: Record<string,
  unknown>

}

/**
 * HTTP error details.
 *
 * Detailed error information for HTTP request failures
 * including status, headers, and response data.
 *
 * @example
 * '`'typescript
 * const errorDetails: HTTPErrorDetails = {
 *   status: 404,
 *   statusText: 'Not'Found',
 *   heaers: { 'content-type: 'application/json' },
 *   data: { error: 'Resource'not found' },
 *   config: requestOptions
 * };
 * ``'
 */
export interface HTTPErrorDetails {
  status?: number;
  statusText?: string;
  headers?: Record<string,
  string>;
  data?: any;
  config?: HTTPRequestOptions

}

/**
 * HTTP client capabilities.
 *
 * Describes the capabilities and limitations of an HTTP client
 * for feature detection and optimization.
 *
 * @example
 * '`'typescript
 * const capabilities: HTTPClientCapabilities = {
  *   supportedMethods: ['GET',
  'POST',
  'PUT',
  'DELETE',
  'PATCH],
  *   supportsStreaming: true,
  *   supportsCompression: true,
  *   supportsttp2: true,
  *   supportsWebSockets: false,
  *   maxConcurrentRequests: 100,
  *   supportedAuthMethods: ['bearer',
  'basic',
  'oauth2',
  'digest]
 *
};
 * ``'
 */
export interface HTTPClientCapabilities {
  supportedMethods: string[];
  supportsStreaming: boolean;
  supportsCompression: boolean;
  supportsHttp2: boolean;
  supportsWebSockets: boolean;
  maxConcurrentRequests: number;
  supportedAuthMethods: string[]

}

/**
 * OAuth credentials for HTTP clients.
 *
 * OAuth2 authentication credentials with support for
 * access tokens, refresh tokens, and automatic token refresh.
 *
 * @example
 * '`'typescript
 * const oauthCredentials: OAuthCredentials = {
  *   clientId: 'your-client-id',
  *   clientSecret: 'your-client-secret',
  *   okenUrl: https://auth.example.com/oauth/token',
  *   scope: 'read'write',
  *   accssToken: 'current-access-token',
  *   refreshToke: 'current-refresh-token',
  *   expiresAt: 'ew Date(Date.now() + 3600000)
 *
};
 * ``'
 */
export interface OAuthCredentials {
  clientId: string;
  clientSecret: string;
  tokenUrl: string;
  scope?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date

}

/**
 * HTTP request metrics for monitoring and analysis.
 *
 * Comprehensive metrics collection for HTTP requests
 * including timing, size, and performance data.
 *
 * @example
 * '`'typescript
 * const metrics: HTTPRequestMetrics = {
  *   requestId: 'req_123',
  *   startTime: Date.now(),
  *   endTime: Date.now() + 245,
  *   duration: 245,
  *   requestSize: 1024,
  *   responseSize: 2048,
  *   statusCode: 200,
  *   retryCount: 0,
  *   cached: false,
  *   connectionReused: true
 *
};
 * ``'
 */
export interface HTTPRequestMetrics {
  requestId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  requestSize?: number;
  responseSize?: number;
  statusCode?: number;
  retryCount?: number;
  cached?: boolean;
  connectionReused?: boolean

}

/**
 * HTTP cache configuration.
 *
 * Caching configuration for HTTP responses with
 * TTL, size limits, and cache key strategies.
 *
 * @example
 * '`'typescript
 * const cacheConfig: HTTPCacheConfig = {
  *   enabled: true,
  *   ttl: 300000,
  // 5 minutes
 *   maxSize: 100,
  *   keyStrategy: 'url-headers',
  *   repectCacheHeaders: true,
  *   staleWhileRevalidate: true
 *
};
 * ``'
 */
export interface HTTPCacheConfig {
  enabled: boolean;
  ttl?: number;
  maxSize?: number;
  keyStrategy?: 'url' | 'url-headers' | 'custom';
  respectCacheHeaders?: boolean;
  staleWhileRevalidate?: boolean

}

/**
 * HTTP client statistics for monitoring.
 *
 * Real-time statistics about HTTP client performance
 * and usage patterns.
 *
 * @example
 * ``'typescript
 * const stats: HTTPClientStats = {
  *   totalRequests: 1000,
  *   successfulRequests: 980,
  *   failedRequests: 20,
  *   averageResponseTime: 245,
  *   cacheHitRate: 0.65,
  *   activeConnections: 5,
  *   queuedRequests: 2
 *
};
 * '``
 */
export interface HTTPClientStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  cacheHitRate: number;
  activeConnections: number;
  queuedRequests: number

}