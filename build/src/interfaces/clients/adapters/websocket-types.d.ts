/**
 * WebSocket Client Types for UACL.
 *
 * WebSocket-specific extensions to UACL core interfaces and types.
 */
/**
 * @file TypeScript type definitions for interfaces.
 */
import type { AuthenticationConfig, ClientConfig, ClientResponse, RequestOptions, RetryConfig } from '../core/interfaces.ts';
/**
 * WebSocket connection states.
 */
export declare const WebSocketReadyState: {
    readonly CONNECTING: 0;
    readonly OPEN: 1;
    readonly CLOSING: 2;
    readonly CLOSED: 3;
};
export type WebSocketReadyState = (typeof WebSocketReadyState)[keyof typeof WebSocketReadyState];
/**
 * WebSocket message types.
 */
export declare const WebSocketMessageType: {
    readonly TEXT: "text";
    readonly BINARY: "binary";
    readonly PING: "ping";
    readonly PONG: "pong";
    readonly CLOSE: "close";
};
export type WebSocketMessageType = (typeof WebSocketMessageType)[keyof typeof WebSocketMessageType];
/**
 * WebSocket close codes (RFC 6455).
 */
export declare const WebSocketCloseCode: {
    readonly NORMAL_CLOSURE: 1000;
    readonly GOING_AWAY: 1001;
    readonly PROTOCOL_ERROR: 1002;
    readonly UNSUPPORTED_DATA: 1003;
    readonly NO_STATUS_RECEIVED: 1005;
    readonly ABNORMAL_CLOSURE: 1006;
    readonly INVALID_FRAME_PAYLOAD_DATA: 1007;
    readonly POLICY_VIOLATION: 1008;
    readonly MESSAGE_TOO_BIG: 1009;
    readonly MANDATORY_EXTENSION: 1010;
    readonly INTERNAL_SERVER_ERROR: 1011;
    readonly SERVICE_RESTART: 1012;
    readonly TRY_AGAIN_LATER: 1013;
    readonly BAD_GATEWAY: 1014;
    readonly TLS_HANDSHAKE: 1015;
};
export type WebSocketCloseCode = (typeof WebSocketCloseCode)[keyof typeof WebSocketCloseCode];
/**
 * WebSocket authentication methods.
 */
export declare const WebSocketAuthMethod: {
    readonly NONE: "none";
    readonly TOKEN: "token";
    readonly HEADER: "header";
    readonly QUERY: "query";
    readonly PROTOCOL: "protocol";
    readonly CUSTOM: "custom";
};
export type WebSocketAuthMethod = (typeof WebSocketAuthMethod)[keyof typeof WebSocketAuthMethod];
/**
 * WebSocket authentication configuration.
 *
 * @example
 */
export interface WebSocketAuthenticationConfig extends AuthenticationConfig {
    method: WebSocketAuthMethod;
    query?: Record<string, string>;
    headers?: Record<string, string>;
    protocols?: string[];
    customAuth?: (url: string, protocols?: string[]) => {
        url: string;
        protocols?: string[];
        headers?: Record<string, string>;
    };
}
/**
 * WebSocket retry configuration.
 *
 * @example
 */
export interface WebSocketRetryConfig extends RetryConfig {
    reconnectOnClose?: boolean;
    reconnectOnError?: boolean;
    retryOnCloseCodes?: WebSocketCloseCode[];
    maxReconnectInterval?: number;
    jitter?: boolean;
    jitterFactor?: number;
}
/**
 * WebSocket heartbeat configuration.
 *
 * @example
 */
export interface WebSocketHeartbeatConfig {
    enabled: boolean;
    interval: number;
    timeout?: number;
    message?: any;
    autoStart?: boolean;
}
/**
 * WebSocket message queue configuration.
 *
 * @example
 */
export interface WebSocketMessageQueueConfig {
    enabled: boolean;
    maxSize: number;
    maxMemoryUsage?: number;
    persistOnDisconnect?: boolean;
    drainOnReconnect?: boolean;
    priority?: 'fifo' | 'lifo';
}
/**
 * WebSocket compression configuration.
 *
 * @example
 */
export interface WebSocketCompressionConfig {
    enabled: boolean;
    method?: 'deflate' | 'gzip';
    level?: number;
    threshold?: number;
    windowBits?: number;
    memLevel?: number;
}
/**
 * Complete WebSocket client configuration.
 *
 * @example
 */
export interface WebSocketClientConfig extends ClientConfig {
    url: string;
    protocols?: string[];
    authentication?: WebSocketAuthenticationConfig;
    retry?: WebSocketRetryConfig;
    reconnection?: {
        enabled: boolean;
        maxAttempts: number;
        initialDelay: number;
        maxDelay: number;
        backoff: 'linear' | 'exponential';
        jitter?: boolean;
    };
    heartbeat?: WebSocketHeartbeatConfig;
    messageQueue?: WebSocketMessageQueueConfig;
    compression?: WebSocketCompressionConfig;
    maxPayload?: number;
    maxFrameSize?: number;
    connectionTimeout?: number;
    handshakeTimeout?: number;
    closeTimeout?: number;
    perMessageDeflate?: boolean;
    followRedirects?: boolean;
    maxRedirects?: number;
    agent?: any;
    binaryType?: 'nodebuffer' | 'arraybuffer' | 'fragments';
    extensions?: string[];
    origin?: string;
    headers?: Record<string, string>;
}
/**
 * WebSocket request options.
 *
 * @example
 */
export interface WebSocketRequestOptions extends RequestOptions {
    messageType?: WebSocketMessageType;
    binary?: boolean;
    compress?: boolean;
    mask?: boolean;
    fin?: boolean;
    priority?: 'high' | 'normal' | 'low';
    expectResponse?: boolean;
    responseTimeout?: number;
}
/**
 * WebSocket response.
 *
 * @example
 */
export interface WebSocketResponse<T = any> extends ClientResponse<T> {
    messageType: WebSocketMessageType;
    compressed?: boolean;
    binary?: boolean;
    readyState: WebSocketReadyState;
    extensions?: string;
    protocol?: string;
}
/**
 * WebSocket message structure.
 *
 * @example
 */
export interface WebSocketMessage<T = any> {
    id?: string;
    type?: string;
    data: T;
    timestamp?: number;
    priority?: 'high' | 'normal' | 'low';
    metadata?: Record<string, any>;
    expectResponse?: boolean;
    responseTimeout?: number;
    correlationId?: string;
}
/**
 * WebSocket connection info.
 *
 * @example
 */
export interface WebSocketConnectionInfo {
    id: string;
    url: string;
    protocol?: string;
    extensions?: string[];
    readyState: WebSocketReadyState;
    bufferedAmount: number;
    connectTime: Date;
    lastActivity: Date;
    messagesSent: number;
    messagesReceived: number;
    bytesSent: number;
    bytesReceived: number;
    latency?: number;
    packetLoss?: number;
    authenticated: boolean;
    authMethod?: WebSocketAuthMethod;
    errors: Array<{
        timestamp: Date;
        error: string;
        code?: string;
    }>;
}
/**
 * WebSocket event types.
 *
 * @example
 */
export interface WebSocketEvents {
    connecting: () => void;
    connected: () => void;
    disconnected: (code: number, reason: string) => void;
    error: (error: Error) => void;
    reconnecting: (attempt: number) => void;
    reconnected: () => void;
    reconnectFailed: (attempts: number) => void;
    message: (data: any, metadata?: any) => void;
    binaryMessage: (data: ArrayBuffer, metadata?: any) => void;
    ping: (data?: any) => void;
    pong: (data?: any) => void;
    heartbeat: (data?: any) => void;
    queueFull: (queueSize: number) => void;
    queueDrained: () => void;
    authenticated: (method: WebSocketAuthMethod) => void;
    authenticationFailed: (error: Error) => void;
    stateChange: (oldState: WebSocketReadyState, newState: WebSocketReadyState) => void;
    [eventName: string]: (...args: any[]) => void;
}
/**
 * WebSocket metrics.
 *
 * @example
 */
export interface WebSocketMetrics {
    connectionsOpened: number;
    connectionsClosed: number;
    connectionsActive: number;
    connectionDuration: number;
    messagesSent: number;
    messagesReceived: number;
    messagesSentPerSecond: number;
    messagesReceivedPerSecond: number;
    bytesSent: number;
    bytesReceived: number;
    bytesSentPerSecond: number;
    bytesReceivedPerSecond: number;
    averageLatency: number;
    p95Latency: number;
    p99Latency: number;
    packetLoss: number;
    connectionErrors: number;
    messageErrors: number;
    timeoutErrors: number;
    authenticationErrors: number;
    messagesQueued: number;
    queueSize: number;
    queueOverflows: number;
    compressionRatio?: number;
    compressedMessages?: number;
    timestamp: Date;
}
/**
 * WebSocket connection pool configuration.
 *
 * @example
 */
export interface WebSocketPoolConfig {
    maxConnections: number;
    minConnections?: number;
    connectionTimeout: number;
    idleTimeout: number;
    loadBalancingStrategy: 'round-robin' | 'least-connections' | 'random' | 'weighted';
    healthCheckInterval: number;
    healthCheckTimeout: number;
    enableConnectionReuse: boolean;
    connectionIdleTime: number;
    maxConnectionAge: number;
}
/**
 * WebSocket protocol extensions.
 *
 * @example
 */
export interface WebSocketExtension {
    name: string;
    params?: Record<string, string | number | boolean>;
    enabled: boolean;
    config?: any;
}
/**
 * WebSocket security configuration.
 *
 * @example
 */
export interface WebSocketSecurityConfig {
    tls?: {
        rejectUnauthorized?: boolean;
        ca?: string[];
        cert?: string;
        key?: string;
        passphrase?: string;
    };
    cors?: {
        origin?: string | string[];
        credentials?: boolean;
    };
    rateLimit?: {
        enabled: boolean;
        messagesPerSecond: number;
        burstSize: number;
        windowSize: number;
    };
    validation?: {
        maxMessageSize: number;
        allowedOrigins?: string[];
        messageSchema?: any;
    };
}
/**
 * Type guards for WebSocket types.
 */
export declare const WebSocketTypeGuards: {
    isWebSocketConfig: (config: any) => config is WebSocketClientConfig;
    isWebSocketMessage: (message: any) => message is WebSocketMessage;
    isValidReadyState: (state: any) => state is WebSocketReadyState;
    isValidCloseCode: (code: any) => code is WebSocketCloseCode;
};
/**
 * WebSocket utility functions.
 */
export declare const WebSocketUtils: {
    /**
     * Generate a unique message ID.
     */
    generateMessageId: () => string;
    /**
     * Generate a unique connection ID.
     */
    generateConnectionId: () => string;
    /**
     * Calculate exponential backoff delay.
     *
     * @param attempt
     * @param baseDelay
     * @param maxDelay
     * @param jitter
     */
    calculateBackoffDelay: (attempt: number, baseDelay: number, maxDelay: number, jitter?: boolean) => number;
    /**
     * Check if URL is a valid WebSocket URL.
     *
     * @param url
     */
    isValidWebSocketUrl: (url: string) => boolean;
    /**
     * Get human-readable close code description.
     *
     * @param code
     */
    getCloseCodeDescription: (code: number) => string;
    /**
     * Get human-readable ready state description.
     *
     * @param state
     */
    getReadyStateDescription: (state: WebSocketReadyState) => string;
};
declare const _default: {
    WebSocketReadyState: {
        readonly CONNECTING: 0;
        readonly OPEN: 1;
        readonly CLOSING: 2;
        readonly CLOSED: 3;
    };
    WebSocketMessageType: {
        readonly TEXT: "text";
        readonly BINARY: "binary";
        readonly PING: "ping";
        readonly PONG: "pong";
        readonly CLOSE: "close";
    };
    WebSocketCloseCode: {
        readonly NORMAL_CLOSURE: 1000;
        readonly GOING_AWAY: 1001;
        readonly PROTOCOL_ERROR: 1002;
        readonly UNSUPPORTED_DATA: 1003;
        readonly NO_STATUS_RECEIVED: 1005;
        readonly ABNORMAL_CLOSURE: 1006;
        readonly INVALID_FRAME_PAYLOAD_DATA: 1007;
        readonly POLICY_VIOLATION: 1008;
        readonly MESSAGE_TOO_BIG: 1009;
        readonly MANDATORY_EXTENSION: 1010;
        readonly INTERNAL_SERVER_ERROR: 1011;
        readonly SERVICE_RESTART: 1012;
        readonly TRY_AGAIN_LATER: 1013;
        readonly BAD_GATEWAY: 1014;
        readonly TLS_HANDSHAKE: 1015;
    };
    WebSocketAuthMethod: {
        readonly NONE: "none";
        readonly TOKEN: "token";
        readonly HEADER: "header";
        readonly QUERY: "query";
        readonly PROTOCOL: "protocol";
        readonly CUSTOM: "custom";
    };
    WebSocketTypeGuards: {
        isWebSocketConfig: (config: any) => config is WebSocketClientConfig;
        isWebSocketMessage: (message: any) => message is WebSocketMessage;
        isValidReadyState: (state: any) => state is WebSocketReadyState;
        isValidCloseCode: (code: any) => code is WebSocketCloseCode;
    };
    WebSocketUtils: {
        /**
         * Generate a unique message ID.
         */
        generateMessageId: () => string;
        /**
         * Generate a unique connection ID.
         */
        generateConnectionId: () => string;
        /**
         * Calculate exponential backoff delay.
         *
         * @param attempt
         * @param baseDelay
         * @param maxDelay
         * @param jitter
         */
        calculateBackoffDelay: (attempt: number, baseDelay: number, maxDelay: number, jitter?: boolean) => number;
        /**
         * Check if URL is a valid WebSocket URL.
         *
         * @param url
         */
        isValidWebSocketUrl: (url: string) => boolean;
        /**
         * Get human-readable close code description.
         *
         * @param code
         */
        getCloseCodeDescription: (code: number) => string;
        /**
         * Get human-readable ready state description.
         *
         * @param state
         */
        getReadyStateDescription: (state: WebSocketReadyState) => string;
    };
};
export default _default;
//# sourceMappingURL=websocket-types.d.ts.map