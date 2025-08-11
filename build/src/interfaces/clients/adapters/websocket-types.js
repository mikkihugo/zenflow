/**
 * WebSocket Client Types for UACL.
 *
 * WebSocket-specific extensions to UACL core interfaces and types.
 */
/**
 * @file TypeScript type definitions for interfaces.
 */
/**
 * WebSocket connection states.
 */
export const WebSocketReadyState = {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
};
/**
 * WebSocket message types.
 */
export const WebSocketMessageType = {
    TEXT: 'text',
    BINARY: 'binary',
    PING: 'ping',
    PONG: 'pong',
    CLOSE: 'close',
};
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
    TLS_HANDSHAKE: 1015,
};
/**
 * WebSocket authentication methods.
 */
export const WebSocketAuthMethod = {
    NONE: 'none',
    TOKEN: 'token',
    HEADER: 'header',
    QUERY: 'query',
    PROTOCOL: 'protocol',
    CUSTOM: 'custom',
};
/**
 * Type guards for WebSocket types.
 */
export const WebSocketTypeGuards = {
    isWebSocketConfig: (config) => {
        return config && typeof config.url === 'string';
    },
    isWebSocketMessage: (message) => {
        return message && typeof message === 'object' && 'data' in message;
    },
    isValidReadyState: (state) => {
        return typeof state === 'number' && state >= 0 && state <= 3;
    },
    isValidCloseCode: (code) => {
        return typeof code === 'number' && Object.values(WebSocketCloseCode).includes(code);
    },
};
/**
 * WebSocket utility functions.
 */
export const WebSocketUtils = {
    /**
     * Generate a unique message ID.
     */
    generateMessageId: () => {
        return `ws-msg-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    },
    /**
     * Generate a unique connection ID.
     */
    generateConnectionId: () => {
        return `ws-conn-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    },
    /**
     * Calculate exponential backoff delay.
     *
     * @param attempt
     * @param baseDelay
     * @param maxDelay
     * @param jitter
     */
    calculateBackoffDelay: (attempt, baseDelay, maxDelay, jitter = false) => {
        let delay = Math.min(baseDelay * 2 ** attempt, maxDelay);
        if (jitter) {
            // Add jitter to prevent thundering herd
            delay = delay * (0.5 + Math.random() * 0.5);
        }
        return Math.floor(delay);
    },
    /**
     * Check if URL is a valid WebSocket URL.
     *
     * @param url
     */
    isValidWebSocketUrl: (url) => {
        try {
            const parsed = new URL(url);
            return parsed.protocol === 'ws:' || parsed.protocol === 'wss:';
        }
        catch {
            return false;
        }
    },
    /**
     * Get human-readable close code description.
     *
     * @param code
     */
    getCloseCodeDescription: (code) => {
        switch (code) {
            case WebSocketCloseCode.NORMAL_CLOSURE:
                return 'Normal Closure';
            case WebSocketCloseCode.GOING_AWAY:
                return 'Going Away';
            case WebSocketCloseCode.PROTOCOL_ERROR:
                return 'Protocol Error';
            case WebSocketCloseCode.UNSUPPORTED_DATA:
                return 'Unsupported Data';
            case WebSocketCloseCode.NO_STATUS_RECEIVED:
                return 'No Status Received';
            case WebSocketCloseCode.ABNORMAL_CLOSURE:
                return 'Abnormal Closure';
            case WebSocketCloseCode.INVALID_FRAME_PAYLOAD_DATA:
                return 'Invalid Frame Payload Data';
            case WebSocketCloseCode.POLICY_VIOLATION:
                return 'Policy Violation';
            case WebSocketCloseCode.MESSAGE_TOO_BIG:
                return 'Message Too Big';
            case WebSocketCloseCode.MANDATORY_EXTENSION:
                return 'Mandatory Extension';
            case WebSocketCloseCode.INTERNAL_SERVER_ERROR:
                return 'Internal Server Error';
            case WebSocketCloseCode.SERVICE_RESTART:
                return 'Service Restart';
            case WebSocketCloseCode.TRY_AGAIN_LATER:
                return 'Try Again Later';
            case WebSocketCloseCode.BAD_GATEWAY:
                return 'Bad Gateway';
            case WebSocketCloseCode.TLS_HANDSHAKE:
                return 'TLS Handshake';
            default:
                return `Unknown (${code})`;
        }
    },
    /**
     * Get human-readable ready state description.
     *
     * @param state
     */
    getReadyStateDescription: (state) => {
        switch (state) {
            case WebSocketReadyState.CONNECTING:
                return 'Connecting';
            case WebSocketReadyState.OPEN:
                return 'Open';
            case WebSocketReadyState.CLOSING:
                return 'Closing';
            case WebSocketReadyState.CLOSED:
                return 'Closed';
            default:
                return `Unknown (${state})`;
        }
    },
};
export default {
    WebSocketReadyState,
    WebSocketMessageType,
    WebSocketCloseCode,
    WebSocketAuthMethod,
    WebSocketTypeGuards,
    WebSocketUtils,
};
