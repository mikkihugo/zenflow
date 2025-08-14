export const ClientTypes = {
    HTTP: 'http',
    WEBSOCKET: 'websocket',
    KNOWLEDGE: 'knowledge',
    MCP: 'mcp',
    GENERIC: 'generic',
};
export const ProtocolTypes = {
    HTTP: 'http',
    HTTPS: 'https',
    WS: 'ws',
    WSS: 'wss',
    TCP: 'tcp',
    UDP: 'udp',
    STDIO: 'stdio',
    IPC: 'ipc',
    CUSTOM: 'custom',
};
export const AuthTypes = {
    NONE: 'none',
    BEARER: 'bearer',
    BASIC: 'basic',
    API_KEY: 'api-key',
    OAUTH: 'oauth',
    JWT: 'jwt',
    CUSTOM: 'custom',
};
export const HttpMethods = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
    PATCH: 'PATCH',
    HEAD: 'HEAD',
    OPTIONS: 'OPTIONS',
};
export const ClientStatuses = {
    DISCONNECTED: 'disconnected',
    CONNECTING: 'connecting',
    CONNECTED: 'connected',
    RECONNECTING: 'reconnecting',
    ERROR: 'error',
    SUSPENDED: 'suspended',
};
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
};
export const ProtocolToClientTypeMap = {
    http: ClientTypes['HTTP'],
    https: ClientTypes['HTTP'],
    ws: ClientTypes['WEBSOCKET'],
    wss: ClientTypes['WEBSOCKET'],
    tcp: ClientTypes['GENERIC'],
    udp: ClientTypes['GENERIC'],
    stdio: ClientTypes['MCP'],
    ipc: ClientTypes['GENERIC'],
    custom: ClientTypes['GENERIC'],
};
export const HttpStatusCodes = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    MOVED_PERMANENTLY: 301,
    FOUND: 302,
    NOT_MODIFIED: 304,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
};
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
};
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
};
export const McpConstants = {
    PROTOCOL_VERSION: '2024-11-05',
    DEFAULT_TIMEOUT: 30000,
    JSONRPC_VERSION: '2.0',
    METHODS: {
        INITIALIZE: 'initialize',
        LIST_TOOLS: 'tools/list',
        CALL_TOOL: 'tools/call',
        LIST_RESOURCES: 'resources/list',
        READ_RESOURCE: 'resources/read',
        SUBSCRIBE: 'resources/subscribe',
        UNSUBSCRIBE: 'resources/unsubscribe',
    },
    NOTIFICATIONS: {
        INITIALIZED: 'notifications/initialized',
        TOOLS_LIST_CHANGED: 'notifications/tools/list_changed',
        RESOURCES_LIST_CHANGED: 'notifications/resources/list_changed',
        PROGRESS: 'notifications/progress',
        LOG_MESSAGE: 'notifications/message',
    },
};
export const KnowledgeConstants = {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 1000,
    DEFAULT_SIMILARITY_THRESHOLD: 0.8,
    DEFAULT_VECTOR_DIMENSIONS: 384,
    QUERY_TYPES: {
        EXACT: 'exact',
        FUZZY: 'fuzzy',
        SEMANTIC: 'semantic',
        VECTOR: 'vector',
        HYBRID: 'hybrid',
    },
    SIMILARITY_METRICS: {
        COSINE: 'cosine',
        EUCLIDEAN: 'euclidean',
        DOT_PRODUCT: 'dot',
    },
};
export const TypeGuards = {
    isClientType: (value) => {
        return Object.values(ClientTypes).includes(value);
    },
    isProtocolType: (value) => {
        return Object.values(ProtocolTypes).includes(value);
    },
    isAuthType: (value) => {
        return Object.values(AuthTypes).includes(value);
    },
    isHttpMethod: (value) => {
        return Object.values(HttpMethods).includes(value);
    },
    isClientStatus: (value) => {
        return Object.values(ClientStatuses).includes(value);
    },
};
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
};
//# sourceMappingURL=types.js.map