/**
 * @file WebSocket client adapter implementing the UACL IClient interface for real-time communication.
 */
/**
 * WebSocket Client Adapter for UACL (Unified API Client Layer).
 *
 * Enterprise-grade WebSocket client implementing UACL patterns for real-time communication.
 * Provides reliable, event-driven connectivity with automatic reconnection, message queuing,
 * and comprehensive monitoring capabilities.
 *
 * @file WebSocket client adapter implementing the UACL IClient interface for real-time communication.
 * @module interfaces/clients/adapters/websocket
 * @version 2.0.0
 *
 * Key Features:
 * - Full UACL IClient interface compliance
 * - Automatic reconnection with configurable backoff strategies
 * - Message queuing for offline reliability
 * - Heartbeat/ping-pong monitoring for connection health
 * - Request-response pattern over WebSocket for API-like usage
 * - Binary and text message support
 * - Compression support (per-message-deflate)
 * - Connection pooling and load balancing ready
 * - Real-time event streaming and notifications
 * - WebSocket subprotocol negotiation
 * - Authentication over WebSocket (query, headers, protocols)
 * @example
 * ```typescript.
 * import { WebSocketClientAdapter } from './websocket-client-adapter.ts';
 * import type { WebSocketClientConfig } from './websocket-client-adapter.ts';
 *
 * // Basic real-time client
 * const realtimeClient = new WebSocketClientAdapter({
 *   name: 'realtime-feed',
 *   url: 'wss://live.example.com/feed',
 *   protocols: ['live-feed-v1']
 * });
 *
 * // Enterprise WebSocket client with full configuration
 * const tradingClient = new WebSocketClientAdapter({
 *   name: 'trading-websocket',
 *   url: 'wss://trading.enterprise.com/stream',
 *   protocols: ['trading-v2', 'fallback-v1'],
 *   authentication: {
 *     type: 'query',
 *     token: process.env['WS_TOKEN'],
 *     headers: {
 *       'Authorization': `Bearer ${process.env['API_KEY']}`
 *     }
 *   },
 *   reconnection: {
 *     enabled: true,
 *     maxAttempts: 20,
 *     interval: 1000,
 *     backoff: 'exponential',
 *     maxInterval: 30000
 *   },
 *   heartbeat: {
 *     enabled: true,
 *     interval: 15000,
 *     message: { type: 'ping', timestamp: Date.now() },
 *     timeout: 5000
 *   },
 *   messageQueue: {
 *     enabled: true,
 *     maxSize: 10000,
 *     persistOnDisconnect: true
 *   },
 *   perMessageDeflate: true,
 *   maxPayload: 10 * 1024 * 1024 // 10MB
 * });
 *
 * // Event handling for real-time data
 * tradingClient.on('connect', () => {
 *   console.log('🟢 Trading feed connected');
 *
 *   // Subscribe to trading pairs
 *   tradingClient.sendMessage({
 *     type: 'subscribe',
 *     data: {
 *       channels: ['btc-usd', 'eth-usd', 'ada-usd'],
 *       events: ['trade', 'orderbook', 'ticker']
 *     }
 *   });
 * });
 *
 * tradingClient.on('message', (data, metadata) => {
 *   console.log(`📊 ${metadata.messageType} message:`, data);
 *
 *   // Handle different message types
 *   switch (data.type) {
 *     case 'trade':
 *       handleTradeUpdate(data);
 *       break;
 *     case 'orderbook':
 *       handleOrderbookUpdate(data);
 *       break;
 *     case 'ticker':
 *       handleTickerUpdate(data);
 *       break;
 *   }
 * });
 *
 * tradingClient.on('reconnecting', (attempt) => {
 *   console.log(`🔄 Reconnection attempt ${attempt}`);
 * });
 *
 * tradingClient.on('error', (error) => {
 *   console.error('❌ WebSocket error:', error);
 * });
 *
 * // Connect and handle lifecycle
 * try {
 *   await tradingClient.connect();
 *
 *   // Send heartbeat manually if needed
 *   setInterval(() => {
 *     if (tradingClient.isConnected()) {
 *       tradingClient.send({ type: 'ping', timestamp: Date.now() });
 *     }
 *   }, 30000);
 *
 *   // Use request-response pattern for API-like calls
 *   const accountInfo = await tradingClient.get('/account', {
 *     timeout: 10000
 *   });
 *   console.log('Account:', accountInfo.data);
 *
 *   // Send trading orders via WebSocket
 *   const orderResult = await tradingClient.post('/orders', {
 *     symbol: 'BTC-USD',
 *     side: 'buy',
 *     amount: 0.1,
 *     price: 45000
 *   });
 *   console.log('Order placed:', orderResult.data);
 *
 * } catch (error) {
 *   console.error('Trading client error:', error);
 * }
 *
 * // Advanced: Binary data handling
 * tradingClient.on('message', (data, metadata) => {
 *   if (metadata.messageType === 'binary') {
 *     // Handle binary market data
 *     const marketData = parseMarketDataBuffer(data);
 *     updateMarketDisplay(marketData);
 *   }
 * });
 * ```
 */
import { EventEmitter } from 'node:events';
import type { AuthenticationConfig, ClientConfig, ClientMetrics, ClientResponse, ClientStatus, IClient, RequestOptions, RetryConfig } from '../core/interfaces.ts';
/**
 * WebSocket-specific authentication configuration.
 *
 * @example
 */
export interface WebSocketAuthenticationConfig extends AuthenticationConfig {
    query?: Record<string, string>;
    headers?: Record<string, string>;
    protocols?: string[];
}
/**
 * WebSocket-specific retry configuration.
 *
 * @example
 */
export interface WebSocketRetryConfig extends RetryConfig {
    reconnectOnClose?: boolean;
    reconnectOnError?: boolean;
    maxReconnectInterval?: number;
}
/**
 * WebSocket client configuration extending UACL ClientConfig.
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
        interval: number;
        backoff: 'linear' | 'exponential';
        maxInterval?: number;
    };
    heartbeat?: {
        enabled: boolean;
        interval: number;
        message: any;
        timeout?: number;
    };
    messageQueue?: {
        enabled: boolean;
        maxSize: number;
        persistOnDisconnect?: boolean;
    };
    connectionTimeout?: number;
    handshakeTimeout?: number;
    perMessageDeflate?: boolean;
    maxPayload?: number;
    followRedirects?: boolean;
    binaryType?: 'nodebuffer' | 'arraybuffer' | 'fragments';
}
/**
 * WebSocket request options.
 *
 * @example
 */
export interface WebSocketRequestOptions extends RequestOptions {
    messageType?: 'text' | 'binary' | 'ping' | 'pong';
    compress?: boolean;
    binary?: boolean;
    mask?: boolean;
    fin?: boolean;
}
/**
 * WebSocket response wrapper.
 *
 * @example
 */
export interface WebSocketResponse<T = any> extends ClientResponse<T> {
    messageType: 'text' | 'binary' | 'ping' | 'pong' | 'close';
    compressed?: boolean;
    readyState: number;
    extensions?: string;
    protocol?: string;
}
/**
 * WebSocket message interface.
 *
 * @example
 */
export interface WebSocketMessage<T = any> {
    id?: string;
    type?: string;
    data: T;
    timestamp?: number;
    metadata?: Record<string, any>;
}
/**
 * WebSocket Client Adapter implementing UACL IClient interface.
 *
 * @class WebSocketClientAdapter
 * @augments EventEmitter
 * @implements {IClient}
 * @description Enterprise-grade WebSocket client providing real-time communication capabilities
 *              with automatic reconnection, message queuing, heartbeat monitoring, and comprehensive
 *              observability features. Implements the UACL IClient interface for unified client management.
 * @property {WebSocketClientConfig} config - WebSocket client configuration (read-only).
 * @property {string} name - Client identifier (read-only).
 * @property {WebSocket|null} ws - Underlying WebSocket connection (private).
 * @property {string[]} messageQueue - Queued messages for offline scenarios (private).
 * @property {boolean} isConnected - Connection status (private).
 * @property {string} connectionId - Unique connection identifier (private).
 * @property {ClientMetrics} metrics - Performance metrics (private).
 * @fires WebSocketClientAdapter#connect - When WebSocket successfully connects
 * @fires WebSocketClientAdapter#disconnect - When WebSocket disconnects
 * @fires WebSocketClientAdapter#message - When a message is received
 * @fires WebSocketClientAdapter#error - When an error occurs
 * @fires WebSocketClientAdapter#reconnecting - When attempting to reconnect
 * @fires WebSocketClientAdapter#reconnected - When reconnection succeeds
 * @fires WebSocketClientAdapter#reconnectFailed - When all reconnection attempts fail
 * @fires WebSocketClientAdapter#heartbeat - When heartbeat/ping is sent or received
 * @example
 * ```typescript
 * // Real-time notifications client
 * const notificationClient = new WebSocketClientAdapter({
 *   name: 'notifications',
 *   url: 'wss://notifications.example.com/ws',
 *   protocols: ['notifications-v1'],
 *   authentication: {
 *     type: 'query',
 *     query: { token: userToken },
 *     headers: { 'User-ID': userId }
 *   },
 *   reconnection: {
 *     enabled: true,
 *     maxAttempts: 15,
 *     interval: 2000,
 *     backoff: 'exponential'
 *   },
 *   heartbeat: {
 *     enabled: true,
 *     interval: 25000,
 *     message: { type: 'keepalive' }
 *   }
 * });
 *
 * // Event handling
 * notificationClient.on('connect', () => {
 *   console.log('🔔 Notifications connected');
 *
 *   // Subscribe to user-specific channels
 *   notificationClient.sendMessage({
 *     type: 'subscribe',
 *     data: {
 *       channels: [`user.${userId}`, 'global.announcements'],
 *       types: ['message', 'friend_request', 'system']
 *     }
 *   });
 * });
 *
 * notificationClient.on('message', (notification, metadata) => {
 *   console.log(`📨 Notification (${metadata.connectionId}):`, notification);
 *
 *   // Handle different notification types
 *   switch (notification.type) {
 *     case 'message':
 *       displayMessage(notification);
 *       break;
 *     case 'friend_request':
 *       showFriendRequest(notification);
 *       break;
 *     case 'system':
 *       showSystemNotification(notification);
 *       break;
 *   }
 *
 *   // Update notification badge
 *   updateNotificationBadge();
 * });
 *
 * notificationClient.on('reconnecting', (attempt) => {
 *   console.log(`🔄 Reconnecting to notifications (attempt ${attempt})`);
 *   showReconnectingIndicator();
 * });
 *
 * notificationClient.on('reconnected', () => {
 *   console.log('✅ Notifications reconnected');
 *   hideReconnectingIndicator();
 * });
 *
 * // Usage for real-time chat application
 * const chatClient = new WebSocketClientAdapter({
 *   name: 'chat-realtime',
 *   url: 'wss://chat.example.com/rooms/general',
 *   messageQueue: {
 *     enabled: true,
 *     maxSize: 5000,
 *     persistOnDisconnect: true
 *   },
 *   binaryType: 'arraybuffer' // For file uploads
 * });
 *
 * chatClient.on('message', (chatMessage) => {
 *   if (chatMessage.type === 'user_message') {
 *     addMessageToChat(chatMessage);
 *   } else if (chatMessage.type === 'typing_indicator') {
 *     showTypingIndicator(chatMessage.user);
 *   }
 * });
 *
 * // Send chat messages
 * function sendChatMessage(text) {
 *   chatClient.sendMessage({
 *     type: 'user_message',
 *     data: {
 *       text,
 *       timestamp: Date.now(),
 *       user: currentUser
 *     }
 *   });
 * }
 *
 * // Send typing indicators
 * function sendTypingIndicator() {
 *   chatClient.send({
 *     type: 'typing_indicator',
 *     user: currentUser.id,
 *     timestamp: Date.now()
 *   });
 * }
 *
 * // Health monitoring
 * setInterval(async () => {
 *   const health = await chatClient.healthCheck();
 *   console.log(`Chat health: ${health.status} (${health.responseTime}ms ping)`);
 *
 *   if (health.status !== 'healthy') {
 *     showConnectionIssueWarning();
 *   }
 * }, 60000);
 * ```
 */
export declare class WebSocketClientAdapter extends EventEmitter implements IClient {
    readonly config: WebSocketClientConfig;
    readonly name: string;
    private ws;
    private messageQueue;
    private reconnectTimer;
    private heartbeatTimer;
    private _isConnected;
    private reconnectAttempts;
    private _connectionId;
    private metrics;
    private startTime;
    /**
     * Create new WebSocket Client Adapter instance.
     *
     * @param {WebSocketClientConfig} config - WebSocket client configuration.
     * @param {string} config.name - Unique client identifier.
     * @param {string} config.url - WebSocket server URL (ws:// or wss://).
     * @param {string[]} [config.protocols] - WebSocket subprotocols to negotiate.
     * @param {WebSocketAuthenticationConfig} [config.authentication] - Authentication config.
     * @param {WebSocketRetryConfig} [config.retry] - Retry and reconnection config.
     * @param {object} [config.heartbeat] - Heartbeat/ping configuration.
     * @param {object} [config.messageQueue] - Message queuing configuration.
     * @param {number} [config.timeout=30000] - Connection timeout in milliseconds.
     * @throws {Error} If required configuration is missing or invalid.
     * @example
     * ```typescript
     * const wsClient = new WebSocketClientAdapter({
     *   name: 'realtime-updates',
     *   url: 'wss://updates.example.com/stream',
     *   protocols: ['updates-v2', 'updates-v1'],
     *   authentication: {
     *     type: 'query',
     *     query: { auth_token: token }
     *   },
     *   reconnection: {
     *     enabled: true,
     *     maxAttempts: 10,
     *     interval: 1000,
     *     backoff: 'exponential'
     *   },
     *   heartbeat: {
     *     enabled: true,
     *     interval: 30000,
     *     message: { type: 'ping' }
     *   }
     * });
     * ```
     */
    constructor(config: WebSocketClientConfig);
    /**
     * Connect to WebSocket server (UACL interface).
     */
    connect(): Promise<void>;
    /**
     * Disconnect from WebSocket server (UACL interface).
     */
    disconnect(): Promise<void>;
    /**
     * Check if client is connected (UACL interface).
     */
    isConnected(): boolean;
    /**
     * Health check (UACL interface).
     */
    healthCheck(): Promise<ClientStatus>;
    /**
     * Get client metrics (UACL interface).
     */
    getMetrics(): Promise<ClientMetrics>;
    /**
     * Generic GET request (UACL interface) - WebSocket doesn't have HTTP methods.
     * This is implemented as a request-response pattern over WebSocket.
     */
    get<T = any>(endpoint: string, options?: RequestOptions): Promise<ClientResponse<T>>;
    /**
     * Generic POST request (UACL interface).
     */
    post<T = any>(endpoint: string, data?: any, options?: RequestOptions): Promise<ClientResponse<T>>;
    /**
     * Generic PUT request (UACL interface).
     */
    put<T = any>(endpoint: string, data?: any, options?: RequestOptions): Promise<ClientResponse<T>>;
    /**
     * Generic DELETE request (UACL interface).
     */
    delete<T = any>(endpoint: string, options?: RequestOptions): Promise<ClientResponse<T>>;
    /**
     * Update client configuration (UACL interface).
     */
    updateConfig(config: Partial<WebSocketClientConfig>): void;
    /**
     * Event handler registration (UACL interface).
     */
    on(event: 'connect' | 'disconnect' | 'error' | 'retry' | string, handler: (...args: any[]) => void): void;
    /**
     * Event handler removal (UACL interface).
     */
    off(event: string, handler?: (...args: any[]) => void): void;
    /**
     * Cleanup and destroy client (UACL interface).
     */
    destroy(): Promise<void>;
    /**
     * Send raw message (legacy method for backward compatibility).
     */
    send(data: any): void;
    /**
     * Send typed message with metadata.
     */
    sendMessage<T = any>(message: WebSocketMessage<T>, _options?: WebSocketRequestOptions): Promise<void>;
    /**
     * Get connection URL.
     */
    get connectionUrl(): string;
    /**
     * Get queued message count.
     */
    get queuedMessages(): number;
    /**
     * Get current connection state.
     */
    get readyState(): number;
    /**
     * Get connection ID.
     */
    get connectionId(): string;
    private buildConnectionUrl;
    private handleMessage;
    private sendRequest;
    private queueMessage;
    private flushMessageQueue;
    private shouldReconnect;
    private scheduleReconnect;
    private startHeartbeat;
    private stopHeartbeat;
    private isHeartbeatResponse;
    private measurePingTime;
    private calculateErrorRate;
    private generateConnectionId;
    private generateMessageId;
    private initializeMetrics;
    private updateMetrics;
}
/**
 * WebSocket Client Factory implementing UACL IClientFactory interface.
 *
 * @example
 */
export declare class WebSocketClientFactory {
    private clients;
    /**
     * Create new WebSocket client instance.
     *
     * @param config
     */
    create(config: WebSocketClientConfig): Promise<WebSocketClientAdapter>;
    /**
     * Create multiple WebSocket clients.
     *
     * @param configs
     */
    createMultiple(configs: WebSocketClientConfig[]): Promise<WebSocketClientAdapter[]>;
    /**
     * Get cached client by name.
     *
     * @param name
     */
    get(name: string): WebSocketClientAdapter | undefined;
    /**
     * List all clients.
     */
    list(): WebSocketClientAdapter[];
    /**
     * Check if client exists.
     *
     * @param name
     */
    has(name: string): boolean;
    /**
     * Remove client by name.
     *
     * @param name
     */
    remove(name: string): Promise<boolean>;
    /**
     * Health check all clients.
     */
    healthCheckAll(): Promise<Map<string, ClientStatus>>;
    /**
     * Get metrics for all clients.
     */
    getMetricsAll(): Promise<Map<string, ClientMetrics>>;
    /**
     * Shutdown all clients.
     */
    shutdown(): Promise<void>;
    /**
     * Get active client count.
     */
    getActiveCount(): number;
}
export declare function createWebSocketClient(config: WebSocketClientConfig): Promise<WebSocketClientAdapter>;
export default WebSocketClientAdapter;
//# sourceMappingURL=websocket-client-adapter.d.ts.map