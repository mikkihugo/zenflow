/**
 * UACL (Unified API Client Layer) Core Interfaces.
 *
 * Provides unified abstractions for all client implementations:
 * - HTTP, WebSocket, GraphQL, gRPC clients
 * - Consistent authentication, retry, and monitoring patterns
 * - Factory pattern for client creation and management
 * - Health checks and performance monitoring.
 *
 * @file Core interfaces defining the UACL contract for all client types.
 * @module interfaces/clients/core.
 * @version 2.0.0
 * @description This module defines the foundational interfaces that all UACL clients must implement,
 *              providing a consistent API surface across HTTP, WebSocket, Knowledge, and MCP clients.
 *              These interfaces ensure uniform behavior for connection management, authentication,
 *              retry logic, health monitoring, and performance metrics collection.
 *
 * Key design principles:
 * - Protocol-agnostic: Interfaces work for HTTP, WebSocket, and other protocols
 * - Event-driven: Built on EventEmitter for real-time notifications
 * - Observable: Comprehensive metrics and health monitoring
 * - Resilient: Built-in retry logic and error handling
 * - Extensible: Support for custom authentication and middleware.
 * @example
 * ```typescript
 * // Implement a custom client using UACL interfaces.
 * import type { IClient, ClientConfig, ClientResponse } from './core/interfaces';
 *
 * class CustomClient extends EventEmitter implements IClient {
 *   constructor(public readonly config: ClientConfig) {
 *     super();
 *   }
 *
 *   async connect(): Promise<void> {
 *     // Custom connection logic
 *     this.emit('connect');
 *   }
 *
 *   async get<T>(endpoint: string): Promise<ClientResponse<T>> {
 *     // Custom request implementation
 *     return {
 *       data: {} as T,
 *       status: 200,
 *       statusText: 'OK',
 *       headers: {},
 *       config: {}
 *     };
 *   }
 * }
 * ```
 */
/**
 * Error types for client operations.
 *
 * @example
 */
export class ClientError extends Error {
    code;
    client;
    cause;
    constructor(message, code, client, cause) {
        super(message);
        this.code = code;
        this.client = client;
        this.cause = cause;
        this.name = 'ClientError';
    }
}
export class ConnectionError extends ClientError {
    constructor(client, cause) {
        super(`Connection failed for client: ${client}`, 'CONNECTION_ERROR', client, cause);
        this.name = 'ConnectionError';
    }
}
export class AuthenticationError extends ClientError {
    constructor(client, cause) {
        super(`Authentication failed for client: ${client}`, 'AUTH_ERROR', client, cause);
        this.name = 'AuthenticationError';
    }
}
export class TimeoutError extends ClientError {
    constructor(client, timeout, cause) {
        super(`Request timeout (${timeout}ms) for client: ${client}`, 'TIMEOUT_ERROR', client, cause);
        this.name = 'TimeoutError';
    }
}
export class RetryExhaustedError extends ClientError {
    constructor(client, attempts, cause) {
        super(`Retry exhausted (${attempts} attempts) for client: ${client}`, 'RETRY_EXHAUSTED', client, cause);
        this.name = 'RetryExhaustedError';
    }
}
//# sourceMappingURL=interfaces.js.map