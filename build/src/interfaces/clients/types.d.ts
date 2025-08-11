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
export type ProtocolType = 'http' | 'https' | 'ws' | 'wss' | 'tcp' | 'udp' | 'stdio' | 'ipc' | 'custom';
/**
 * Authentication types.
 */
export type AuthType = 'none' | 'bearer' | 'basic' | 'api-key' | 'oauth' | 'jwt' | 'custom';
/**
 * HTTP methods.
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
/**
 * WebSocket event types.
 */
export type WebSocketEventType = 'connect' | 'disconnect' | 'message' | 'error' | 'heartbeat' | 'custom';
/**
 * Knowledge query types.
 */
export type KnowledgeQueryType = 'exact' | 'fuzzy' | 'semantic' | 'vector' | 'hybrid';
/**
 * MCP message types.
 */
export type McpMessageType = 'request' | 'response' | 'notification' | 'error';
/**
 * Client status types.
 */
export type ClientStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error' | 'suspended';
/**
 * Response format types.
 */
export type ResponseFormat = 'json' | 'xml' | 'text' | 'binary' | 'stream' | 'auto';
/**
 * Compression types.
 */
export type CompressionType = 'none' | 'gzip' | 'deflate' | 'brotli' | 'lz4';
/**
 * Client configuration presets.
 */
export type ClientPreset = 'default' | 'fast' | 'reliable' | 'minimal' | 'secure' | 'debug';
/**
 * Error severity levels.
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
/**
 * Load balancing strategies.
 */
export type LoadBalancingStrategy = 'round-robin' | 'least-connections' | 'random' | 'weighted' | 'health-based';
/**
 * Circuit breaker states.
 */
export type CircuitBreakerState = 'closed' | 'open' | 'half-open';
/**
 * Serialization formats.
 */
export type SerializationFormat = 'json' | 'msgpack' | 'protobuf' | 'avro' | 'custom';
/**
 * Client type enum for runtime usage.
 */
export declare const ClientTypes: {
    readonly HTTP: "http";
    readonly WEBSOCKET: "websocket";
    readonly KNOWLEDGE: "knowledge";
    readonly MCP: "mcp";
    readonly GENERIC: "generic";
};
/**
 * Protocol type enum for runtime usage.
 */
export declare const ProtocolTypes: {
    readonly HTTP: "http";
    readonly HTTPS: "https";
    readonly WS: "ws";
    readonly WSS: "wss";
    readonly TCP: "tcp";
    readonly UDP: "udp";
    readonly STDIO: "stdio";
    readonly IPC: "ipc";
    readonly CUSTOM: "custom";
};
/**
 * Authentication type enum for runtime usage.
 */
export declare const AuthTypes: {
    readonly NONE: "none";
    readonly BEARER: "bearer";
    readonly BASIC: "basic";
    readonly API_KEY: "api-key";
    readonly OAUTH: "oauth";
    readonly JWT: "jwt";
    readonly CUSTOM: "custom";
};
/**
 * HTTP method enum for runtime usage.
 */
export declare const HttpMethods: {
    readonly GET: "GET";
    readonly POST: "POST";
    readonly PUT: "PUT";
    readonly DELETE: "DELETE";
    readonly PATCH: "PATCH";
    readonly HEAD: "HEAD";
    readonly OPTIONS: "OPTIONS";
};
/**
 * Client status enum for runtime usage.
 */
export declare const ClientStatuses: {
    readonly DISCONNECTED: "disconnected";
    readonly CONNECTING: "connecting";
    readonly CONNECTED: "connected";
    readonly RECONNECTING: "reconnecting";
    readonly ERROR: "error";
    readonly SUSPENDED: "suspended";
};
/**
 * Default client configurations by type.
 */
export declare const ClientConfigs: {
    readonly http: {
        readonly timeout: 30000;
        readonly retry: {
            readonly maxRetries: 3;
            readonly initialDelay: 1000;
            readonly backoffMultiplier: 2;
            readonly maxDelay: 10000;
        };
        readonly headers: {
            readonly 'Content-Type': "application/json";
            readonly Accept: "application/json";
        };
    };
    readonly websocket: {
        readonly timeout: 5000;
        readonly retry: {
            readonly maxRetries: 5;
            readonly initialDelay: 1000;
            readonly backoffMultiplier: 1.5;
            readonly maxDelay: 30000;
        };
        readonly options: {
            readonly heartbeatInterval: 30000;
            readonly enableReconnect: true;
        };
    };
    readonly knowledge: {
        readonly timeout: 15000;
        readonly retry: {
            readonly maxRetries: 2;
            readonly initialDelay: 2000;
            readonly backoffMultiplier: 2;
            readonly maxDelay: 8000;
        };
        readonly options: {
            readonly cacheResults: true;
            readonly vectorSearch: true;
        };
    };
    readonly mcp: {
        readonly timeout: 10000;
        readonly retry: {
            readonly maxRetries: 3;
            readonly initialDelay: 1000;
            readonly backoffMultiplier: 2;
            readonly maxDelay: 5000;
        };
        readonly options: {
            readonly protocolVersion: "2024-11-05";
            readonly capabilities: {};
        };
    };
    readonly generic: {
        readonly timeout: 30000;
        readonly retry: {
            readonly maxRetries: 3;
            readonly initialDelay: 1000;
            readonly backoffMultiplier: 2;
            readonly maxDelay: 10000;
        };
    };
};
/**
 * Protocol to client type mapping.
 */
export declare const ProtocolToClientTypeMap: Record<ProtocolType, ClientType>;
/**
 * Standard HTTP status codes.
 */
export declare const HttpStatusCodes: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly ACCEPTED: 202;
    readonly NO_CONTENT: 204;
    readonly MOVED_PERMANENTLY: 301;
    readonly FOUND: 302;
    readonly NOT_MODIFIED: 304;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly METHOD_NOT_ALLOWED: 405;
    readonly CONFLICT: 409;
    readonly UNPROCESSABLE_ENTITY: 422;
    readonly TOO_MANY_REQUESTS: 429;
    readonly INTERNAL_SERVER_ERROR: 500;
    readonly NOT_IMPLEMENTED: 501;
    readonly BAD_GATEWAY: 502;
    readonly SERVICE_UNAVAILABLE: 503;
    readonly GATEWAY_TIMEOUT: 504;
};
/**
 * WebSocket close codes.
 */
export declare const WebSocketCloseCodes: {
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
    readonly INTERNAL_ERROR: 1011;
    readonly SERVICE_RESTART: 1012;
    readonly TRY_AGAIN_LATER: 1013;
    readonly BAD_GATEWAY: 1014;
    readonly TLS_HANDSHAKE: 1015;
};
/**
 * Client error codes.
 */
export declare const ClientErrorCodes: {
    readonly CONNECTION_FAILED: "CONNECTION_FAILED";
    readonly TIMEOUT: "TIMEOUT";
    readonly AUTHENTICATION_FAILED: "AUTHENTICATION_FAILED";
    readonly INVALID_RESPONSE: "INVALID_RESPONSE";
    readonly NETWORK_ERROR: "NETWORK_ERROR";
    readonly PROTOCOL_ERROR: "PROTOCOL_ERROR";
    readonly SERIALIZATION_ERROR: "SERIALIZATION_ERROR";
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
    readonly RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED";
    readonly SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE";
    readonly CONFIGURATION_ERROR: "CONFIGURATION_ERROR";
    readonly UNKNOWN_ERROR: "UNKNOWN_ERROR";
};
/**
 * MCP protocol constants.
 */
export declare const McpConstants: {
    readonly PROTOCOL_VERSION: "2024-11-05";
    readonly DEFAULT_TIMEOUT: 30000;
    readonly JSONRPC_VERSION: "2.0";
    readonly METHODS: {
        readonly INITIALIZE: "initialize";
        readonly LIST_TOOLS: "tools/list";
        readonly CALL_TOOL: "tools/call";
        readonly LIST_RESOURCES: "resources/list";
        readonly READ_RESOURCE: "resources/read";
        readonly SUBSCRIBE: "resources/subscribe";
        readonly UNSUBSCRIBE: "resources/unsubscribe";
    };
    readonly NOTIFICATIONS: {
        readonly INITIALIZED: "notifications/initialized";
        readonly TOOLS_LIST_CHANGED: "notifications/tools/list_changed";
        readonly RESOURCES_LIST_CHANGED: "notifications/resources/list_changed";
        readonly PROGRESS: "notifications/progress";
        readonly LOG_MESSAGE: "notifications/message";
    };
};
/**
 * Knowledge client constants.
 */
export declare const KnowledgeConstants: {
    readonly DEFAULT_LIMIT: 10;
    readonly MAX_LIMIT: 1000;
    readonly DEFAULT_SIMILARITY_THRESHOLD: 0.8;
    readonly DEFAULT_VECTOR_DIMENSIONS: 384;
    readonly QUERY_TYPES: {
        readonly EXACT: "exact";
        readonly FUZZY: "fuzzy";
        readonly SEMANTIC: "semantic";
        readonly VECTOR: "vector";
        readonly HYBRID: "hybrid";
    };
    readonly SIMILARITY_METRICS: {
        readonly COSINE: "cosine";
        readonly EUCLIDEAN: "euclidean";
        readonly DOT_PRODUCT: "dot";
    };
};
/**
 * Type guards for runtime type checking.
 */
export declare const TypeGuards: {
    readonly isClientType: (value: any) => value is ClientType;
    readonly isProtocolType: (value: any) => value is ProtocolType;
    readonly isAuthType: (value: any) => value is AuthType;
    readonly isHttpMethod: (value: any) => value is HttpMethod;
    readonly isClientStatus: (value: any) => value is ClientStatus;
};
declare const _default: {
    readonly ClientTypes: {
        readonly HTTP: "http";
        readonly WEBSOCKET: "websocket";
        readonly KNOWLEDGE: "knowledge";
        readonly MCP: "mcp";
        readonly GENERIC: "generic";
    };
    readonly ProtocolTypes: {
        readonly HTTP: "http";
        readonly HTTPS: "https";
        readonly WS: "ws";
        readonly WSS: "wss";
        readonly TCP: "tcp";
        readonly UDP: "udp";
        readonly STDIO: "stdio";
        readonly IPC: "ipc";
        readonly CUSTOM: "custom";
    };
    readonly AuthTypes: {
        readonly NONE: "none";
        readonly BEARER: "bearer";
        readonly BASIC: "basic";
        readonly API_KEY: "api-key";
        readonly OAUTH: "oauth";
        readonly JWT: "jwt";
        readonly CUSTOM: "custom";
    };
    readonly HttpMethods: {
        readonly GET: "GET";
        readonly POST: "POST";
        readonly PUT: "PUT";
        readonly DELETE: "DELETE";
        readonly PATCH: "PATCH";
        readonly HEAD: "HEAD";
        readonly OPTIONS: "OPTIONS";
    };
    readonly ClientStatuses: {
        readonly DISCONNECTED: "disconnected";
        readonly CONNECTING: "connecting";
        readonly CONNECTED: "connected";
        readonly RECONNECTING: "reconnecting";
        readonly ERROR: "error";
        readonly SUSPENDED: "suspended";
    };
    readonly ClientConfigs: {
        readonly http: {
            readonly timeout: 30000;
            readonly retry: {
                readonly maxRetries: 3;
                readonly initialDelay: 1000;
                readonly backoffMultiplier: 2;
                readonly maxDelay: 10000;
            };
            readonly headers: {
                readonly 'Content-Type': "application/json";
                readonly Accept: "application/json";
            };
        };
        readonly websocket: {
            readonly timeout: 5000;
            readonly retry: {
                readonly maxRetries: 5;
                readonly initialDelay: 1000;
                readonly backoffMultiplier: 1.5;
                readonly maxDelay: 30000;
            };
            readonly options: {
                readonly heartbeatInterval: 30000;
                readonly enableReconnect: true;
            };
        };
        readonly knowledge: {
            readonly timeout: 15000;
            readonly retry: {
                readonly maxRetries: 2;
                readonly initialDelay: 2000;
                readonly backoffMultiplier: 2;
                readonly maxDelay: 8000;
            };
            readonly options: {
                readonly cacheResults: true;
                readonly vectorSearch: true;
            };
        };
        readonly mcp: {
            readonly timeout: 10000;
            readonly retry: {
                readonly maxRetries: 3;
                readonly initialDelay: 1000;
                readonly backoffMultiplier: 2;
                readonly maxDelay: 5000;
            };
            readonly options: {
                readonly protocolVersion: "2024-11-05";
                readonly capabilities: {};
            };
        };
        readonly generic: {
            readonly timeout: 30000;
            readonly retry: {
                readonly maxRetries: 3;
                readonly initialDelay: 1000;
                readonly backoffMultiplier: 2;
                readonly maxDelay: 10000;
            };
        };
    };
    readonly ProtocolToClientTypeMap: Record<ProtocolType, ClientType>;
    readonly HttpStatusCodes: {
        readonly OK: 200;
        readonly CREATED: 201;
        readonly ACCEPTED: 202;
        readonly NO_CONTENT: 204;
        readonly MOVED_PERMANENTLY: 301;
        readonly FOUND: 302;
        readonly NOT_MODIFIED: 304;
        readonly BAD_REQUEST: 400;
        readonly UNAUTHORIZED: 401;
        readonly FORBIDDEN: 403;
        readonly NOT_FOUND: 404;
        readonly METHOD_NOT_ALLOWED: 405;
        readonly CONFLICT: 409;
        readonly UNPROCESSABLE_ENTITY: 422;
        readonly TOO_MANY_REQUESTS: 429;
        readonly INTERNAL_SERVER_ERROR: 500;
        readonly NOT_IMPLEMENTED: 501;
        readonly BAD_GATEWAY: 502;
        readonly SERVICE_UNAVAILABLE: 503;
        readonly GATEWAY_TIMEOUT: 504;
    };
    readonly WebSocketCloseCodes: {
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
        readonly INTERNAL_ERROR: 1011;
        readonly SERVICE_RESTART: 1012;
        readonly TRY_AGAIN_LATER: 1013;
        readonly BAD_GATEWAY: 1014;
        readonly TLS_HANDSHAKE: 1015;
    };
    readonly ClientErrorCodes: {
        readonly CONNECTION_FAILED: "CONNECTION_FAILED";
        readonly TIMEOUT: "TIMEOUT";
        readonly AUTHENTICATION_FAILED: "AUTHENTICATION_FAILED";
        readonly INVALID_RESPONSE: "INVALID_RESPONSE";
        readonly NETWORK_ERROR: "NETWORK_ERROR";
        readonly PROTOCOL_ERROR: "PROTOCOL_ERROR";
        readonly SERIALIZATION_ERROR: "SERIALIZATION_ERROR";
        readonly VALIDATION_ERROR: "VALIDATION_ERROR";
        readonly RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED";
        readonly SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE";
        readonly CONFIGURATION_ERROR: "CONFIGURATION_ERROR";
        readonly UNKNOWN_ERROR: "UNKNOWN_ERROR";
    };
    readonly McpConstants: {
        readonly PROTOCOL_VERSION: "2024-11-05";
        readonly DEFAULT_TIMEOUT: 30000;
        readonly JSONRPC_VERSION: "2.0";
        readonly METHODS: {
            readonly INITIALIZE: "initialize";
            readonly LIST_TOOLS: "tools/list";
            readonly CALL_TOOL: "tools/call";
            readonly LIST_RESOURCES: "resources/list";
            readonly READ_RESOURCE: "resources/read";
            readonly SUBSCRIBE: "resources/subscribe";
            readonly UNSUBSCRIBE: "resources/unsubscribe";
        };
        readonly NOTIFICATIONS: {
            readonly INITIALIZED: "notifications/initialized";
            readonly TOOLS_LIST_CHANGED: "notifications/tools/list_changed";
            readonly RESOURCES_LIST_CHANGED: "notifications/resources/list_changed";
            readonly PROGRESS: "notifications/progress";
            readonly LOG_MESSAGE: "notifications/message";
        };
    };
    readonly KnowledgeConstants: {
        readonly DEFAULT_LIMIT: 10;
        readonly MAX_LIMIT: 1000;
        readonly DEFAULT_SIMILARITY_THRESHOLD: 0.8;
        readonly DEFAULT_VECTOR_DIMENSIONS: 384;
        readonly QUERY_TYPES: {
            readonly EXACT: "exact";
            readonly FUZZY: "fuzzy";
            readonly SEMANTIC: "semantic";
            readonly VECTOR: "vector";
            readonly HYBRID: "hybrid";
        };
        readonly SIMILARITY_METRICS: {
            readonly COSINE: "cosine";
            readonly EUCLIDEAN: "euclidean";
            readonly DOT_PRODUCT: "dot";
        };
    };
    readonly TypeGuards: {
        readonly isClientType: (value: any) => value is ClientType;
        readonly isProtocolType: (value: any) => value is ProtocolType;
        readonly isAuthType: (value: any) => value is AuthType;
        readonly isHttpMethod: (value: any) => value is HttpMethod;
        readonly isClientStatus: (value: any) => value is ClientStatus;
    };
};
export default _default;
//# sourceMappingURL=types.d.ts.map