/**
 * HTTP Client Adapter Types.
 *
 * HTTP-specific extensions to UACL core interfaces.
 */
/**
 * @file TypeScript type definitions for interfaces.
 */
import type { AuthenticationConfig, ClientConfig, RetryConfig } from '../core/interfaces.ts';
/**
 * HTTP-specific authentication configuration.
 *
 * @example
 */
export interface HTTPAuthenticationConfig extends AuthenticationConfig {
    digest?: {
        username: string;
        password: string;
        realm?: string;
    };
    clientCert?: {
        cert: string;
        key: string;
        passphrase?: string;
    };
    customHeaders?: Record<string, string>;
}
/**
 * HTTP-specific retry configuration.
 *
 * @example
 */
export interface HTTPRetryConfig extends RetryConfig {
    retryStatusCodes?: number[];
    retryMethods?: ('GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH')[];
    idempotentOnly?: boolean;
}
/**
 * HTTP client configuration.
 *
 * @example
 */
export interface HTTPClientConfig extends ClientConfig {
    baseURL: string;
    timeout?: number;
    authentication?: HTTPAuthenticationConfig;
    retry?: HTTPRetryConfig;
    followRedirects?: boolean;
    maxRedirects?: number;
    validateStatus?: (status: number) => boolean;
    compression?: boolean;
    keepAlive?: boolean;
    keepAliveTimeout?: number;
    requestInterceptors?: Array<(config: any) => any>;
    responseInterceptors?: Array<(response: any) => any>;
    proxy?: {
        host: string;
        port: number;
        protocol?: 'http' | 'https';
        auth?: {
            username: string;
            password: string;
        };
    };
    ssl?: {
        rejectUnauthorized?: boolean;
        ca?: string[];
        cert?: string;
        key?: string;
    };
    http2?: boolean;
}
/**
 * HTTP request options.
 *
 * @example
 */
export interface HTTPRequestOptions {
    timeout?: number;
    headers?: Record<string, string>;
    retries?: number;
    validateStatus?: (status: number) => boolean;
    responseType?: 'json' | 'text' | 'blob' | 'stream';
    signal?: AbortSignal;
    onUploadProgress?: (progressEvent: any) => void;
    onDownloadProgress?: (progressEvent: any) => void;
    metadata?: Record<string, any>;
}
/**
 * HTTP response type.
 *
 * @example
 */
export interface HTTPResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    config: HTTPRequestOptions;
    request?: any;
    metadata?: Record<string, any>;
}
/**
 * HTTP error details.
 *
 * @example
 */
export interface HTTPErrorDetails {
    status?: number;
    statusText?: string;
    headers?: Record<string, string>;
    data?: any;
    config?: HTTPRequestOptions;
}
/**
 * HTTP client capabilities.
 *
 * @example
 */
export interface HTTPClientCapabilities {
    supportedMethods: string[];
    supportsStreaming: boolean;
    supportsCompression: boolean;
    supportsHttp2: boolean;
    supportsWebSockets: boolean;
    maxConcurrentRequests: number;
    supportedAuthMethods: string[];
}
/**
 * OAuth credentials for HTTP clients.
 *
 * @example
 */
export interface OAuthCredentials {
    clientId: string;
    clientSecret: string;
    tokenUrl: string;
    scope?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
}
//# sourceMappingURL=http-types.d.ts.map