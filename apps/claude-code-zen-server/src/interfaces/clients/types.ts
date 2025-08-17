/**
 * Unified API Client Layer (UACL) - Type Definitions.
 *
 * Core type definitions for client types, protocol types, and enums.
 * Used throughout the UACL system for type-safe client operations.
 */

/**
 * Supported client types.
 */
/**
 * @file TypeScript type definitions for interfaces.
 */

export type ClientType = 'http' | 'websocket' | 'knowledge' | 'mcp' | 'generic';

/**
 * Supported protocol types.
 */
export type ProtocolType =
  | 'http'
  | 'https'
  | 'ws'
  | 'wss'
  | 'tcp'
  | 'udp'
  | 'stdio'
  | 'ipc'
  | 'custom';

/**
 * Authentication types.
 */
export type AuthType =
  | 'none'
  | 'bearer'
  | 'basic'
  | 'api-key'
  | 'oauth'
  | 'jwt'
  | 'custom';

/**
 * HTTP methods.
 */
export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'HEAD'
  | 'OPTIONS';

/**
 * WebSocket event types.
 */
export type WebSocketEventType =
  | 'connect'
  | 'disconnect'
  | 'message'
  | 'error'
  | 'heartbeat'
  | 'custom';

/**
 * Knowledge query types.
 */
export type KnowledgeQueryType =
  | 'exact'
  | 'fuzzy'
  | 'semantic'
  | 'vector'
  | 'hybrid';

/**
 * MCP message types.
 */
export type McpMessageType = 'request' | 'response' | 'notification' | 'error';

/**
 * Client status types.
 */
export type ClientStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error'
  | 'suspended';

/**
 * Response format types.
 */
export type ResponseFormat =
  | 'json'
  | 'xml'
  | 'text'
  | 'binary'
  | 'stream'
  | 'auto';

/**
 * Compression types.
 */
export type CompressionType = 'none' | 'gzip' | 'deflate' | 'brotli' | 'lz4';

/**
 * Client configuration presets.
 */
export type ClientPreset =
  | 'default'
  | 'fast'
  | 'reliable'
  | 'minimal'
  | 'secure'
  | 'debug';

/**
 * Error severity levels.
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Load balancing strategies.
 */
export type LoadBalancingStrategy =
  | 'round-robin'
  | 'least-connections'
  | 'random'
  | 'weighted'
  | 'health-based';

/**
 * Circuit breaker states.
 */
export type CircuitBreakerState = 'closed' | 'open' | 'half-open';

/**
 * Serialization formats.
 */
export type SerializationFormat =
  | 'json'
  | 'msgpack'
  | 'protobuf'
  | 'avro'
  | 'custom';

/**
 * Client type enum for runtime usage.
 */
export const ClientTypes = {
  HTTP: 'http' as const,
  WEBSOCKET: 'websocket' as const,
  KNOWLEDGE: 'knowledge' as const,
  MCP: 'mcp' as const,
  GENERIC: 'generic' as const,
} as const;

/**
 * Protocol type enum for runtime usage.
 */
export const ProtocolTypes = {
  HTTP: 'http' as const,
  HTTPS: 'https' as const,
  WS: 'ws' as const,
  WSS: 'wss' as const,
  TCP: 'tcp' as const,
  UDP: 'udp' as const,
  STDIO: 'stdio' as const,
  PC: 'ipc' as const,
  CUSTOM: 'custom' as const,
} as const;

/**
 * Authentication type enum for runtime usage.
 */
export const AuthTypes = {
  NONE: 'none' as const,
  BEARER: 'bearer' as const,
  BASIC: 'basic' as const,
  API_KEY: 'api-key' as const,
  OAUTH: 'oauth' as const,
  JWT: 'jwt' as const,
  CUSTOM: 'custom' as const,
} as const;

/**
 * HTTP method enum for runtime usage.
 */
export const HttpMethods = {
  GET: 'GET' as const,
  POST: 'POST' as const,
  PUT: 'PUT' as const,
  DELETE: 'DELETE' as const,
  PATCH: 'PATCH' as const,
  HEAD: 'HEAD' as const,
  OPTIONS: 'OPTIONS' as const,
} as const;

/**
 * Client status enum for runtime usage.
 */
export const ClientStatuses = {
  DISCONNECTED: 'disconnected' as const,
  CONNECTING: 'connecting' as const,
  CONNECTED: 'connected' as const,
  RECONNECTING: 'reconnecting' as const,
  ERROR: 'error' as const,
  SUSPENDED: 'suspended' as const,
} as const;

/**
 * Default client configurations by type.
 */
export const ClientConfigs = {
  [ClientTypes['HTTP']]: {
    timeout: 30000,
    retry: {
      maxRetries: 3,
      initialDelay: 1000,
      backoffMultiplier: 2,
      maxDelay: 10000,
    },
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  },

  [ClientTypes['WEBSOCKET']]: {
    timeout: 5000,
    retry: {
      maxRetries: 5,
      initialDelay: 1000,
      backoffMultiplier: 1.5,
      maxDelay: 30000,
    },
    options: {
      heartbeatInterval: 30000,
      enableReconnect: true,
    },
  },

  [ClientTypes['KNOWLEDGE']]: {
    timeout: 15000,
    retry: {
      maxRetries: 2,
      initialDelay: 2000,
      backoffMultiplier: 2,
      maxDelay: 8000,
    },
    options: {
      cacheResults: true,
      vectorSearch: true,
    },
  },

  [ClientTypes['MCP']]: {
    timeout: 10000,
    retry: {
      maxRetries: 3,
      initialDelay: 1000,
      backoffMultiplier: 2,
      maxDelay: 5000,
    },
    options: {
      protocolVersion: '2024-11-05',
      capabilities: {},
    },
  },

  [ClientTypes['GENERIC']]: {
    timeout: 30000,
    retry: {
      maxRetries: 3,
      initialDelay: 1000,
      backoffMultiplier: 2,
      maxDelay: 10000,
    },
  },
} as const;

/**
 * Protocol to client type mapping.
 */
export const ProtocolToClientTypeMap: Record<ProtocolType, ClientType> = {
  http: ClientTypes['HTTP'],
  https: ClientTypes['HTTP'],
  ws: ClientTypes['WEBSOCKET'],
  wss: ClientTypes['WEBSOCKET'],
  tcp: ClientTypes['GENERIC'],
  udp: ClientTypes['GENERIC'],
  stdio: ClientTypes['MCP'],
  ipc: ClientTypes['GENERIC'],
  custom: ClientTypes['GENERIC'],
} as const;

/**
 * Standard HTTP status codes.
 */
export const HttpStatusCodes = {
  // Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // Redirection
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,

  // Client Error
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // Server Error
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

/**
 * WebSocket close codes.
 */
export const WebSocketCloseCodes = {
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
  INTERNAL_ERROR: 1011,
  SERVICE_RESTART: 1012,
  TRY_AGAIN_LATER: 1013,
  BAD_GATEWAY: 1014,
  TLS_HANDSHAKE: 1015,
} as const;

/**
 * Client error codes.
 */
export const ClientErrorCodes = {
  CONNECTION_FAILED: 'CONNECTION_FAILED',
  TIMEOUT: 'TIMEOUT',
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
  INVALID_RESPONSE: 'INVALID_RESPONSE',
  NETWORK_ERROR: 'NETWORK_ERROR',
  PROTOCOL_ERROR: 'PROTOCOL_ERROR',
  SERIALIZATION_ERROR: 'SERIALIZATION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

/**
 * MCP protocol constants.
 */
export const McpConstants = {
  PROTOCOL_VERSION: '2024-11-05',
  DEFAULT_TIMEOUT: 30000,
  JSONRPC_VERSION: '2.0',

  // Standard methods
  METHODS: {
    NITIALIZE: 'initialize',
    LIST_TOOLS: 'tools/list',
    CALL_TOOL: 'tools/call',
    LIST_RESOURCES: 'resources/list',
    READ_RESOURCE: 'resources/read',
    SUBSCRIBE: 'resources/subscribe',
    UNSUBSCRIBE: 'resources/unsubscribe',
  },

  // Standard notifications
  NOTIFICATIONS: {
    NITIALIZED: 'notifications/initialized',
    TOOLS_LIST_CHANGED: 'notifications/tools/list_changed',
    RESOURCES_LIST_CHANGED: 'notifications/resources/list_changed',
    PROGRESS: 'notifications/progress',
    LOG_MESSAGE: 'notifications/message',
  },
} as const;

/**
 * Knowledge client constants.
 */
export const KnowledgeConstants = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 1000,
  DEFAULT_SIMILARITY_THRESHOLD: 0.8,
  DEFAULT_VECTOR_DIMENSIONS: 384,

  // Query types
  QUERY_TYPES: {
    EXACT: 'exact',
    FUZZY: 'fuzzy',
    SEMANTIC: 'semantic',
    VECTOR: 'vector',
    HYBRID: 'hybrid',
  },

  // Similarity metrics
  SIMILARITY_METRICS: {
    COSINE: 'cosine',
    EUCLIDEAN: 'euclidean',
    DOT_PRODUCT: 'dot',
  },
} as const;

/**
 * Type guards for runtime type checking.
 */
export const TypeGuards = {
  isClientType: (value: unknown): value is ClientType => {
    return Object.values(ClientTypes).includes(value);
  },

  isProtocolType: (value: unknown): value is ProtocolType => {
    return Object.values(ProtocolTypes).includes(value);
  },

  isAuthType: (value: unknown): value is AuthType => {
    return Object.values(AuthTypes).includes(value);
  },

  isHttpMethod: (value: unknown): value is HttpMethod => {
    return Object.values(HttpMethods).includes(value);
  },

  isClientStatus: (value: unknown): value is ClientStatus => {
    return Object.values(ClientStatuses).includes(value);
  },
} as const;

export default {
  ClientTypes,
  ProtocolTypes,
  AuthTypes,
  HttpMethods,
  ClientStatuses,
  ClientConfigs,
  ProtocolToClientTypeMap,
  HttpStatusCodes,
  WebSocketCloseCodes,
  ClientErrorCodes,
  McpConstants,
  KnowledgeConstants,
  TypeGuards,
} as const;
