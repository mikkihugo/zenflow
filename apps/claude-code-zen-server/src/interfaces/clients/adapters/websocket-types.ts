/**
 * WebSocket Client Types for UACL.
 *
 * WebSocket-specific extensions to UACL core interfaces and types.
 */

/**
 * @file TypeScript type definitions for WebSocket interfaces.
 */

import type {
  AuthenticationConfig,
  ClientConfig,
  ClientResponse,
  RequestOptions,
  RetryConfig

} from './core/interfaces';

/**
 * WebSocket connection states.
 */
export const WebSocketReadyState = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3

} as const;

export type WebSocketReadyState = (typeof WebSocketReadyState)[keyof typeof WebSocketReadyState];

/**
 * WebSocket message types.
 */
export const WebSocketMessageType = {
  TEXT: 'text',
  BINARY: 'binary',
  PING: 'ping',
  PONG: 'pong',
  CLOSE: 'close'
} as const;

'xport type WebSocketMessageType = (typeof WebSocketMessageType)[keyof typeof WebSocketMessageType];

/**
 * WebSocket close codes (RFC 6455).
 */
export const WebSocketCloseCode = {
  NORMAL_CLOSURE: 1000,
  GOING_AWAY: 1001,
  PROTOCOL_ERROR: 1002,
  UNSUPPORTED_DATA: 1003,
  NO_STATUS_RECEIVED: 1005,
  ABNORMAL_CLOSURE: 1006,
  INVALID_FRAME_PAYLOAD_DATA: 1007,
  POLICY_VIOLATION: 1008,
  MESSAGE_TOO_BIG: 1009,
  MANDATORY_EXTENSION: 1010,
  INTERNAL_SERVER_ERROR: 1011,
  SERVICE_RESTART: 1012,
  TRY_AGAIN_LATER: 1013,
  BAD_GATEWAY: 1014,
  TLS_HANDSHAKE: 1015

} as const;

export type WebSocketCloseCode = (typeof WebSocketCloseCode)[keyof typeof WebSocketCloseCode];

/**
 * WebSocket authentication methods.
 */
export const WebSocketAuthMethod = {
  NONE: 'none',
  TOKEN: 'token',
  HEADER: 'header',
  QUERY: 'query',
  PROTOCOL: 'protocol',
  CUSTOM: 'custom'
} as const;

export type WebSocketAuthMethod = (typeof WebSocketAuthMethod)[keyof typeof WebSocketAuthMethod];

/**
 * WebSocket authentication configuration.
 */
export interface WebSocketAuthenticationConfig extends AuthenticationConfig {
  // WebSocket-specific auth 'ethods
  method: WebSocketAuthMethod;

  // Query parameters for authentication
  query?: Record<string, string>;

  // Headers for initial handshake authentication
  headers?: Record<string, string>;

  // Subprotocols for authentication
  protocols?: string[];

  // Custom authentication function
  customAuth?: (
    url: string,
    protocols?: string[]
  ) => {
  url: string;
    protocols?: string[];
    headers?: Record<string,
  string>

}
}

/**
 * WebSocket retry configuration.
 */
export interface WebSocketRetryConfig extends RetryConfig {
  // Reconnection-specific settings
  reconnectOnClose?: boolean;
  reconnectOnError?: boolean;

  // Close codes to retry on
  retryOnCloseCodes?: WebSocketCloseCode[];

  // Maximum reconnection interval
  maxReconnectInterval?: number;

  // Jitter for reconnection delays
  jitter?: boolean;
  jitterFactor?: number; // 0.0 to 1.0

}

/**
 * WebSocket heartbeat configuration.
 */
export interface WebSocketHeartbeatConfig {
  enabled: boolean;
  interval: number;
  // milliseconds
  timeout?: number;
  // milliseconds to wait for pong
  message?: any;
  // custom heartbeat message
  autoStart?: boolean;
  // start heartbeat after connection

}

/**
 * WebSocket message queue configuration.
 */
export interface WebSocketMessageQueueConfig {
  enabled: boolean;
  maxSize: number;
  maxMemoryUsage?: number;
  // bytes
  persistOnDisconnect?: boolean;
  drainOnReconnect?: boolean;
  priority?: 'fifo' | 'lifo'

}

/**
 * WebSocket compression configuration.
 */
export interface WebSocketCompressionConfig {
  enabled: boolean;
  method?: 'deflate' | 'gzip';
  level?: number;
  // 1-9
  threshold?: number;
  // minimum message size to compress
  windowBits?: number;
  memLevel?: number

}

/**
 * Complete WebSocket client configuration.
 */
export interface WebSocketClientConfig extends ClientConfig {
  // Connection settings
  url: string;
  protocols?: string[];

  // Authentication
  authentication?: WebSocketAuthenticationConfig;

  // Retry and reconnection
  retry?: WebSocketRetryConfig;
  reconnection?: {
  enabled: boolean;
    maxAttempts: number;
    initialDelay: number;
    maxDelay: number;
    backoff: 'linear' | 'exponential';
    jitter?: boolean

};

  // Heartbeat/keepalive
  heartbeat?: WebSocketHeartbeatConfig;

  // Message queuing
  messageQueue?: WebSocketMessageQueueConfig;

  // Performance settings
  compression?: WebSocketCompressionConfig;
  maxPayload?: number;
  maxFrameSize?: number;

  // Timeouts
  connectionTimeout?: number;
  handshakeTimeout?: number;
  closeTimeout?: number;

  // WebSocket options
  perMessageDeflate?: boolean;
  followRedirects?: boolean;
  maxRedirects?: number;

  // Node.js specific options
  agent?: any; // HTTP agent for Node.js

  // Binary handling
  binaryType?: 'nodebuffer' | 'arraybuffer' | 'fragments';

  // Extensions
  extensions?: string[];

  // Origin for browser environments
  origin?: string;

  // Custom headers for handshake
  headers?: Record<string, string>
}

/**
 * WebSocket request options.
 */
export interface WebSocketRequestOptions extends RequestOptions {
  messageType?: WebSocketMessageType;
  binary?: boolean;
  compress?: boolean;
  mask?: boolean;
  fin?: boolean;
  priority?: 'high' | 'normal' | 'low';
  expectResponse?: boolean;
  responseTimeout?: number

}

/**
 * WebSocket response.
 */
export interface WebSocketResponse<T = any> extends ClientResponse<T> {
  messageType: WebSocketMessageType;
  compressed?: boolean;
  binary?: boolean;
  readyState: WebSocketReadyState;
  extensions?: string;
  protocol?: string

}

/**
 * WebSocket message structure.
 */
export interface WebSocketMessage<T = any> {
  id?: string;
  type?: string;
  data: T;
  timestamp?: number;
  priority?: 'high' | 'normal' | 'low';
  metadata?: Record<string,
  unknown>;

  // Response handling
  expectResponse?: boolean;
  responseTimeout?: number;
  correlationId?: string

}

/**
 * WebSocket connection info.
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
  // Statistics
  messagesSent: number;
  messagesReceived: number;
  bytesSent: number;
  bytesReceived: number;
  // Connection quality
  latency?: number;
  packetLoss?: number;
  // Authentication info
  authenticated: boolean;
  authMethod?: WebSocketAuthMethod;
  // Error tracking
  errors: Array<{
    timestamp: Date;
  error: string;
  code?: string
}>
}

/**
 * WebSocket event types.
 */
export interface WebSocketEvents {
  // Connection events
  connecting: () => void;
  connected: () => void;
  disconnected: (code: number,
  reason: string) => void;
  error: (error: Error) => void;
  // Reconnection events
  reconnecting: (attempt: number) => void;
  reconnected: () => void;
  reconnectFailed: (attempts: number) => void;
  // Message events
  message: (data: unknown,
  metadata?: any) => void;
  binaryMessage: (data: ArrayBuffer,
  metadata?: any) => void;
  // Heartbeat events
  ping: (data?: any) => void;
  pong: (data?: any) => void;
  heartbeat: (data?: any) => void;
  // Queue events
  queueFull: (queueSize: number) => void;
  queueDrained: () => void;
  // Authentication events
  authenticated: (method: WebSocketAuthMethod) => void;
  authenticationFailed: (error: Error) => void;
  // State events
  stateChange: (
    oldState: WebSocketReadyState,
  newState: WebSocketReadyState
  ) => void;
  // Custom events
  [eventName: string]: (...args: any[]) => void

}

/**
 * WebSocket metrics.
 */
export interface WebSocketMetrics {
  // Connection metrics
  connectionsOpened: number;
  connectionsClosed: number;
  connectionsActive: number;
  connectionDuration: number;
  // average in ms

  // Message metrics
  messagesSent: number;
  messagesReceived: number;
  messagesSentPerSecond: number;
  messagesReceivedPerSecond: number;
  // Data metrics
  bytesSent: number;
  bytesReceived: number;
  bytesSentPerSecond: number;
  bytesReceivedPerSecond: number;
  // Performance metrics
  averageLatency: number;
  p95Latency: number;
  p99Latency: number;
  packetLoss: number;
  // Error metrics
  connectionErrors: number;
  messageErrors: number;
  timeoutErrors: number;
  authenticationErrors: number;
  // Queue metrics
  messagesQueued: number;
  queueSize: number;
  queueOverflows: number;
  // Compression metrics (if enabled)
  compressionRatio?: number;
  compressedMessages?: number;
  timestamp: Date

}

/**
 * WebSocket connection pool configuration.
 */
export interface WebSocketPoolConfig {
  maxConnections: number;
  minConnections?: number;
  connectionTimeout: number;
  idleTimeout: number;
  // Load balancing
  loadBalancingStrategy: 'round-robin' | 'least-connections' | 'random' | 'weighted';
  // Health checks
  healthCheckInterval: number;
  healthCheckTimeout: number;
  // Connection management
  enableConnectionReuse: boolean;
  connectionIdleTime: number;
  maxConnectionAge: number

}

/**
 * WebSocket protocol extensions.
 */
export interface WebSocketExtension {
  name: string;
  params?: Record<string,
  string | number | boolean>;
  enabled: boolean;
  config?: any

}

/**
 * WebSocket security configuration.
 */
export interface WebSocketSecurityConfig {
  // TLS settings
  tls?: {
  rejectUnauthorized?: boolean;
  ca?: string[];
  cert?: string;
  key?: string;
  passphrase?: string

};

  // CORS settings for server-side
  cors?: {
  origin?: string | string[];
  credentials?: boolean

};

  // Rate limiting
  rateLimit?: {
  enabled: boolean;
    messagesPerSecond: number;
    burstSize: number;
    windowSize: number

};

  // Message validation
  validation?: {
  maxMessageSize: number;
    allowedOrigins?: string[];
    messageSchema?: any; // JSON schema for message validation

}
}

/**
 * Type guards for WebSocket types.
 */
export const WebSocketTypeGuards = {
  isWebSocketConfig: (config: any): config is WebSocketClientConfig => {
    return config && typeof config.url === 'string
},

  isWebSocketMessage: (message: any): message is WebSocketMessage => {
  return (
      message &&
      typeof message === 'object' &&
      'data' in messge
    )

},

  isValidReadyState: (state: any): state is WebSocketReadyState => {
  return typeof state === 'number && state >= 0 && state <= 3;

},

  isValidCloseCode: (code: any): code is WebSocketCloseCode => {
  return (
      typeof code === 'number &&
      Object.values(WebSocketCloseCode).includes(code)
    )

}
};

/**
 * WebSocket utility functions.
 */
expo't const WebSocketUtils = {
  /**
   * Generate a unique message ID.
   */
  generateMessageId: (): string => {
    return 'ws-msg-' + Date.now() + '-${
  Math.random().toString(36).substring(2,
  11)
}``
},

  /**
   * Generate a unique connection ID.
   */
  generateConnectionId: (): string => {
    return 'ws-conn-' + Date.now() + -${
  Math.random().toString(36).substring(2,
  11)
}';
},

  /**
   * Calculate exponential backoff delay.
   */
  calculateBackoffDelay: (
    attempt: number,
    baseDelay: number,
    maxDelay: number,
    jitter = false
  ): number => {
    let delay = Math.min(baseDelay * 2 ** attempt, maxDelay);
    if (jitter) {
  // Add jitter to prevent thundering herd
      delay = delay * (0.5 + Math.random() * 0.5)

}
    return Math.floor(delay)
},

  /**
   * Check if URL is a valid WebSocket URL.
   */
  isValidWebSocketUrl: (url: string): boolean => {
    try {
  const parsed = new URL(url);
      return parsed.protocol === ws:' || parsed.protocol === wss:
} catch {
      return false
}
  },

  /**
   * Get human-readable close code description.
   */
  getCloseCodeDescription: (code: number): string => {
    switch (code) {
      case WebSocketCloseCode.NORMAL_CLOSURE:
        return 'Normal Closure;;
      case WebSocketCloseCode.GOING_AWAY:
        return 'Going Away;;
      case WebSocketCloseCode.PROTOCOL_ERROR:
        return 'Protocol Error;;
      case WebSocketCloseCode.UNSUPPORTED_DATA:
        return 'Unsupported Data;;
      case WebSocketCloseCode.NO_STATUS_RECEIVED:
        return 'No Status Received;;
      case WebSocketCloseCode.ABNORMAL_CLOSURE:
        return 'Abnormal Closure;;
      case WebSocketCloseCode.INVALID_FRAME_PAYLOAD_DATA:
        return 'Invalid Frame Payload Data;;
      case WebSocketCloseCode.POLICY_VIOLATION:
        return 'Policy Violation;;
      case WebSocketCloseCode.MESSAGE_TOO_BIG:
        return 'Message Too Big;;
      case WebSocketCloseCode.MANDATORY_EXTENSION:
        return 'Mandatory Extension;;
      case WebSocketCloseCode.INTERNAL_SERVER_ERROR:
        return 'Internal Server Error;;
      case WebSocketCloseCode.SERVICE_RESTART:
        return 'Service Restart;;
      case WebSocketCloseCode.TRY_AGAIN_LATER:
        return 'Try Again Later;;
      case WebSocketCloseCode.BAD_GATEWAY:
        return 'Bad Gateway;;
      case WebSocketCloseCode.TLS_HANDSHAKE:
        return 'TLS Handshake;;
      default:
        return 'Unknown'(' + code + ')'
}
  },

  /**
   * Get human-readable ready state description.
   */
  getReadyStateDescription: (state: WebSocketReadyState): string => {
    switch (state) {
      case WebSocketReadyState.CONNECTING:
        return 'Connecting;;
      case WebSocketReadyState.OPEN:
        return 'Open;;
      case WebSocketReadyState.CLOSING:
        return 'Closing;;
      case WebSocketReadyState.CLOSED:
        return 'Closed;;
      default:
        return 'Unknown'(' + state + ')`
}
  }
};

export default {
  WebSocketReadyState,
  WebSocketMessageType,
  WebSocketCloseCode,
  WebSocketAuthMethod,
  WebSocketTypeGuards,
  WebSocketUtils

};