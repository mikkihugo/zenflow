/**
 * WebSocket Client Types for UACL
 * 
 * Type definitions specific to WebSocket client implementations
 * including connection options, message formats, and metrics.
 */

import type {
  ClientConfig,
  ClientMetrics,
  ClientResponse,
  RequestMetadata
} from '../core/interfaces';

/**
 * WebSocket connection states
 */
export type WebSocketConnectionState = 
  | 'connecting' 
  | 'connected' 
  | 'disconnecting' 
  | 'disconnected' 
  | 'error' 
  | 'reconnecting';

/**
 * WebSocket message types
 */
export type WebSocketMessageType = 
  | 'text' 
  | 'binary' 
  | 'ping' 
  | 'pong' 
  | 'close' 
  | 'error';

/**
 * WebSocket client configuration extending base client config
 */
export interface WebSocketClientConfig extends ClientConfig {
  /** WebSocket server URL (ws:// or wss://) */
  url: string;
  
  /** WebSocket sub-protocols */
  protocols?: string[];
  
  /** Connection headers */
  headers?: Record<string, string>;
  
  /** Ping interval in milliseconds */
  pingInterval?: number;
  
  /** Pong timeout in milliseconds */
  pongTimeout?: number;
  
  /** Reconnect interval in milliseconds */
  reconnectInterval?: number;
  
  /** Maximum number of reconnection attempts */
  maxReconnectAttempts?: number;
  
  /** Message queue size for buffering */
  messageQueueSize?: number;
  
  /** Binary data type */
  binaryType?: 'blob' | 'arraybuffer';
  
  /** Connection timeout in milliseconds */
  connectionTimeout?: number;
  
  /** Enable automatic reconnection */
  autoReconnect?: boolean;
  
  /** Heartbeat configuration */
  heartbeat?: {
    enabled: boolean;
    interval: number;
    timeout: number;
    message?: string;
  };
  
  /** Compression settings */
  compression?: {
    enabled: boolean;
    threshold?: number;
    windowBits?: number;
    concurrencyLimit?: number;
  };
}

/**
 * WebSocket connection options
 */
export interface WebSocketConnectionOptions {
  /** Connection headers */
  headers?: Record<string, string>;
  
  /** Handshake timeout */
  handshakeTimeout?: number;
  
  /** Per-message deflate */
  perMessageDeflate?: boolean;
  
  /** Skip UTF-8 validation */
  skipUTF8Validation?: boolean;
  
  /** Maximum payload size */
  maxPayload?: number;
  
  /** Origin header */
  origin?: string;
  
  /** Protocol version */
  protocolVersion?: number;
  
  /** Local address */
  localAddress?: string;
  
  /** Agent for HTTP upgrade */
  agent?: any;
  
  /** Client certificate */
  cert?: Buffer | string;
  
  /** Private key */
  key?: Buffer | string;
  
  /** Certificate authority */
  ca?: Buffer | string;
  
  /** Skip certificate verification */
  rejectUnauthorized?: boolean;
}

/**
 * WebSocket message data
 */
export interface WebSocketMessage {
  /** Message ID */
  id: string;
  
  /** Message type */
  type: WebSocketMessageType;
  
  /** Message payload */
  data: string | Buffer | ArrayBuffer;
  
  /** Message timestamp */
  timestamp: number;
  
  /** Message size in bytes */
  size: number;
  
  /** Message metadata */
  metadata?: RequestMetadata;
  
  /** Binary flag */
  isBinary: boolean;
  
  /** Fragmented flag */
  isFragmented?: boolean;
  
  /** Compression flag */
  isCompressed?: boolean;
}

/**
 * WebSocket event data
 */
export interface WebSocketEventData {
  /** Event type */
  type: 'open' | 'close' | 'message' | 'error' | 'ping' | 'pong';
  
  /** Event timestamp */
  timestamp: number;
  
  /** Event data */
  data?: any;
  
  /** Error information if applicable */
  error?: Error;
  
  /** Close code if applicable */
  code?: number;
  
  /** Close reason if applicable */
  reason?: string;
  
  /** Connection was clean */
  wasClean?: boolean;
}

/**
 * WebSocket client metrics extending base metrics
 */
export interface WebSocketMetrics extends ClientMetrics {
  /** Connection state */
  connectionState: WebSocketConnectionState;
  
  /** Connection uptime in milliseconds */
  uptime: number;
  
  /** Number of reconnection attempts */
  reconnectAttempts: number;
  
  /** Messages sent count */
  messagesSent: number;
  
  /** Messages received count */
  messagesReceived: number;
  
  /** Bytes sent */
  bytesSent: number;
  
  /** Bytes received */
  bytesReceived: number;
  
  /** Ping latency in milliseconds */
  pingLatency?: number;
  
  /** Queue size */
  queueSize: number;
  
  /** Queue overflow count */
  queueOverflows: number;
  
  /** Connection errors */
  connectionErrors: number;
  
  /** Message errors */
  messageErrors: number;
  
  /** Last ping time */
  lastPingTime?: number;
  
  /** Last pong time */
  lastPongTime?: number;
  
  /** Connection established time */
  connectedAt?: number;
  
  /** Last reconnect time */
  lastReconnectAt?: number;
}

/**
 * WebSocket close codes
 */
export enum WebSocketCloseCode {
  NORMAL_CLOSURE = 1000,
  GOING_AWAY = 1001,
  PROTOCOL_ERROR = 1002,
  UNSUPPORTED_DATA = 1003,
  NO_STATUS_RECEIVED = 1005,
  ABNORMAL_CLOSURE = 1006,
  INVALID_FRAME_PAYLOAD_DATA = 1007,
  POLICY_VIOLATION = 1008,
  MESSAGE_TOO_BIG = 1009,
  MANDATORY_EXTENSION = 1010,
  INTERNAL_SERVER_ERROR = 1011,
  TLS_HANDSHAKE = 1015,
  
  // Custom codes
  RECONNECT_REQUIRED = 3000,
  AUTHENTICATION_FAILED = 3001,
  RATE_LIMITED = 3002,
  MAINTENANCE_MODE = 3003
}

/**
 * WebSocket error types
 */
export enum WebSocketErrorType {
  CONNECTION_ERROR = 'connection_error',
  AUTHENTICATION_ERROR = 'authentication_error',
  PROTOCOL_ERROR = 'protocol_error',
  MESSAGE_ERROR = 'message_error',
  TIMEOUT_ERROR = 'timeout_error',
  NETWORK_ERROR = 'network_error',
  COMPRESSION_ERROR = 'compression_error',
  VALIDATION_ERROR = 'validation_error'
}

/**
 * WebSocket error details
 */
export interface WebSocketError extends Error {
  /** Error type */
  type: WebSocketErrorType;
  
  /** Error code */
  code?: number;
  
  /** Additional error details */
  details?: Record<string, any>;
  
  /** Connection ID */
  connectionId?: string;
  
  /** Message ID if related to specific message */
  messageId?: string;
  
  /** Retry able flag */
  retryable?: boolean;
  
  /** Original error */
  originalError?: Error;
}

/**
 * WebSocket subscription options
 */
export interface WebSocketSubscriptionOptions {
  /** Subscription ID */
  id?: string;
  
  /** Subscription topics/channels */
  topics: string[];
  
  /** Subscription filters */
  filters?: Record<string, any>;
  
  /** Auto-resubscribe on reconnection */
  autoResubscribe?: boolean;
  
  /** Subscription metadata */
  metadata?: RequestMetadata;
}

/**
 * WebSocket subscription state
 */
export interface WebSocketSubscription {
  /** Subscription ID */
  id: string;
  
  /** Subscription options */
  options: WebSocketSubscriptionOptions;
  
  /** Subscription state */
  state: 'pending' | 'active' | 'paused' | 'cancelled';
  
  /** Created timestamp */
  createdAt: number;
  
  /** Last message timestamp */
  lastMessageAt?: number;
  
  /** Message count */
  messageCount: number;
}

/**
 * WebSocket client factory options
 */
export interface WebSocketClientFactoryOptions {
  /** Default client configuration */
  defaultConfig?: Partial<WebSocketClientConfig>;
  
  /** Connection pool size */
  poolSize?: number;
  
  /** Connection pool timeout */
  poolTimeout?: number;
  
  /** Enable connection sharing */
  enableConnectionSharing?: boolean;
  
  /** Factory statistics collection */
  enableStatistics?: boolean;
}

/**
 * WebSocket protocol handler
 */
export interface WebSocketProtocolHandler {
  /** Protocol name */
  name: string;
  
  /** Handle incoming message */
  handleMessage(message: WebSocketMessage): Promise<any>;
  
  /** Handle connection events */
  handleEvent(event: WebSocketEventData): Promise<void>;
  
  /** Protocol initialization */
  initialize?(config: WebSocketClientConfig): Promise<void>;
  
  /** Protocol cleanup */
  cleanup?(): Promise<void>;
}

/**
 * WebSocket message queue item
 */
export interface WebSocketQueueItem {
  /** Queue item ID */
  id: string;
  
  /** Message to send */
  message: WebSocketMessage;
  
  /** Promise resolve callback */
  resolve: (value: any) => void;
  
  /** Promise reject callback */
  reject: (reason?: any) => void;
  
  /** Retry count */
  retries: number;
  
  /** Max retries allowed */
  maxRetries: number;
  
  /** Created timestamp */
  createdAt: number;
  
  /** Expiry timestamp */
  expiresAt?: number;
}

/**
 * WebSocket connection pool entry
 */
export interface WebSocketConnectionPoolEntry {
  /** Connection ID */
  id: string;
  
  /** WebSocket instance */
  socket: WebSocket;
  
  /** Connection URL */
  url: string;
  
  /** Connection state */
  state: WebSocketConnectionState;
  
  /** Reference count */
  refCount: number;
  
  /** Created timestamp */
  createdAt: number;
  
  /** Last used timestamp */
  lastUsedAt: number;
  
  /** Connection metadata */
  metadata: Record<string, any>;
}

/**
 * WebSocket frame information
 */
export interface WebSocketFrameInfo {
  /** Frame opcode */
  opcode: number;
  
  /** Frame payload length */
  payloadLength: number;
  
  /** Frame is final */
  fin: boolean;
  
  /** Frame is masked */
  masked: boolean;
  
  /** Mask key */
  maskingKey?: Buffer;
  
  /** Frame payload */
  payload: Buffer;
  
  /** Frame is compressed */
  compressed?: boolean;
}

export default {
  WebSocketCloseCode,
  WebSocketErrorType
};