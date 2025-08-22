/**
 * @file WebSocket client adapter implementing the UACL Client interface for real-time communication0.
 */

import { Logger, TypedEventBase } from '@claude-zen/foundation';

/**
 * WebSocket Client Adapter for UACL (Unified API Client Layer)0.
 *
 * Enterprise-grade WebSocket client implementing UACL patterns for real-time communication0.
 * Provides reliable, event-driven connectivity with automatic reconnection, message queuing,
 * and comprehensive monitoring capabilities0.
 *
 * @file WebSocket client adapter implementing the UACL Client interface for real-time communication0.
 * @module interfaces/clients/adapters/websocket
 * @version 20.0.0
 *
 * Key Features:
 * - Full UACL Client interface compliance
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
 * ```typescript0.
 * import { WebSocketClientAdapter } from '0./websocket-client-adapter';
 * import type { WebSocketClientConfig } from '0./websocket-client-adapter';
 *
 * // Basic real-time client
 * const realtimeClient = new WebSocketClientAdapter({
 *   name: 'realtime-feed',
 *   url: 'wss://live0.example0.com/feed',
 *   protocols: ['live-feed-v1']
 * });
 *
 * // Enterprise WebSocket client with full configuration
 * const tradingClient = new WebSocketClientAdapter({
 *   name: 'trading-websocket',
 *   url: 'wss://trading0.enterprise0.com/stream',
 *   protocols: ['trading-v2', 'fallback-v1'],
 *   authentication: {
 *     type: 'query',
 *     token: process0.env['WS_TOKEN'],
 *     headers: {
 *       'Authorization': `Bearer ${process0.env['API_KEY']}`
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
 *     message: { type: 'ping', timestamp: Date0.now() },
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
 * tradingClient0.on('connect', () => {
 *   console0.log('🟢 Trading feed connected');
 *
 *   // Subscribe to trading pairs
 *   tradingClient0.sendMessage({
 *     type: 'subscribe',
 *     data: {
 *       channels: ['btc-usd', 'eth-usd', 'ada-usd'],
 *       events: ['trade', 'orderbook', 'ticker']
 *     }
 *   });
 * });
 *
 * tradingClient0.on('message', (data, metadata) => {
 *   console0.log(`📊 ${metadata0.messageType} message:`, data);
 *
 *   // Handle different message types
 *   switch (data0.type) {
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
 * tradingClient0.on('reconnecting', (attempt) => {
 *   console0.log(`🔄 Reconnection attempt ${attempt}`);
 * });
 *
 * tradingClient0.on('error', (error) => {
 *   console0.error('❌ WebSocket error:', error);
 * });
 *
 * // Connect and handle lifecycle
 * try {
 *   await tradingClient?0.connect;
 *
 *   // Send heartbeat manually if needed
 *   setInterval(() => {
 *     if (tradingClient?0.isConnected) {
 *       tradingClient0.send({ type: 'ping', timestamp: Date0.now() });
 *     }
 *   }, 30000);
 *
 *   // Use request-response pattern for API-like calls
 *   const accountInfo = await tradingClient0.get('/account', {
 *     timeout: 10000
 *   });
 *   console0.log('Account:', accountInfo0.data);
 *
 *   // Send trading orders via WebSocket
 *   const orderResult = await tradingClient0.post('/orders', {
 *     symbol: 'BTC-USD',
 *     side: 'buy',
 *     amount: 0.1,
 *     price: 45000
 *   });
 *   console0.log('Order placed:', orderResult0.data);
 *
 * } catch (error) {
 *   console0.error('Trading client error:', error);
 * }
 *
 * // Advanced: Binary data handling
 * tradingClient0.on('message', (data, metadata) => {
 *   if (metadata0.messageType === 'binary') {
 *     // Handle binary market data
 *     const marketData = parseMarketDataBuffer(data);
 *     updateMarketDisplay(marketData);
 *   }
 * });
 * ```
 */

import type {
  AuthenticationConfig,
  ClientConfig,
  ClientMetrics,
  ClientResponse,
  ClientStatus,
  Client,
  RequestOptions,
  RetryConfig,
} from '0.0./core/interfaces';

const logger = new Logger(
  'interfaces-clients-adapters-websocket-client-adapter'
);

/**
 * WebSocket-specific authentication configuration0.
 *
 * @example
 */
export interface WebSocketAuthenticationConfig extends AuthenticationConfig {
  // WebSocket authentication methods
  query?: Record<string, string>; // Query parameters for auth
  headers?: Record<string, string>; // Headers for initial handshake
  protocols?: string[]; // Subprotocols for auth
}

/**
 * WebSocket-specific retry configuration0.
 *
 * @example
 */
export interface WebSocketRetryConfig extends RetryConfig {
  // WebSocket-specific retry settings
  reconnectOnClose?: boolean; // Auto-reconnect on close
  reconnectOnError?: boolean; // Auto-reconnect on error
  maxReconnectInterval?: number; // Maximum reconnect delay
}

/**
 * WebSocket client configuration extending UACL ClientConfig0.
 *
 * @example
 */
export interface WebSocketClientConfig extends ClientConfig {
  // WebSocket-specific settings
  url: string;
  protocols?: string[];

  // Authentication over WebSocket
  authentication?: WebSocketAuthenticationConfig;

  // WebSocket retry logic
  retry?: WebSocketRetryConfig;

  // Reconnection settings
  reconnection?: {
    enabled: boolean;
    maxAttempts: number;
    interval: number;
    backoff: 'linear' | 'exponential';
    maxInterval?: number;
  };

  // Heartbeat/ping settings
  heartbeat?: {
    enabled: boolean;
    interval: number;
    message?: any;
    timeout?: number;
  };

  // Message queuing
  messageQueue?: {
    enabled: boolean;
    maxSize: number;
    persistOnDisconnect?: boolean;
  };

  // Connection timeouts
  connectionTimeout?: number;
  handshakeTimeout?: number;

  // WebSocket-specific options
  perMessageDeflate?: boolean;
  maxPayload?: number;
  followRedirects?: boolean;

  // Binary message handling
  binaryType?: 'nodebuffer' | 'arraybuffer' | 'fragments';
}

/**
 * WebSocket request options0.
 *
 * @example
 */
export interface WebSocketRequestOptions extends RequestOptions {
  // Message type for WebSocket
  messageType?: 'text' | 'binary' | 'ping' | 'pong';

  // Compression for this message
  compress?: boolean;

  // Binary options
  binary?: boolean;
  mask?: boolean;
  fin?: boolean;
}

/**
 * WebSocket response wrapper0.
 *
 * @example
 */
export interface WebSocketResponse<T = any> extends ClientResponse<T> {
  // WebSocket-specific response data
  messageType: 'text' | 'binary' | 'ping' | 'pong' | 'close';
  compressed?: boolean;

  // Connection state at time of response
  readyState: number;

  // WebSocket-specific metadata
  extensions?: string;
  protocol?: string;
}

/**
 * WebSocket message interface0.
 *
 * @example
 */
export interface WebSocketMessage<T = any> {
  id?: string;
  type?: string;
  data: T;
  timestamp?: number;
  metadata?: Record<string, unknown>;
}

/**
 * WebSocket Client Adapter implementing UACL Client interface0.
 *
 * @class WebSocketClientAdapter
 * @augments EventEmitter
 * @implements {Client}
 * @description Enterprise-grade WebSocket client providing real-time communication capabilities
 *              with automatic reconnection, message queuing, heartbeat monitoring, and comprehensive
 *              observability features0. Implements the UACL Client interface for unified client management0.
 * @property {WebSocketClientConfig} config - WebSocket client configuration (read-only)0.
 * @property {string} name - Client identifier (read-only)0.
 * @property {WebSocket|null} ws - Underlying WebSocket connection (private)0.
 * @property {string[]} messageQueue - Queued messages for offline scenarios (private)0.
 * @property {boolean} isConnected - Connection status (private)0.
 * @property {string} connectionId - Unique connection identifier (private)0.
 * @property {ClientMetrics} metrics - Performance metrics (private)0.
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
 *   url: 'wss://notifications0.example0.com/ws',
 *   protocols: ['notifications-v1'],
 *   authentication: {
 *     type: 'query',
 *     query: { token: userToken },
 *     headers: { 'User-D': userId }
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
 * notificationClient0.on('connect', () => {
 *   console0.log('🔔 Notifications connected');
 *
 *   // Subscribe to user-specific channels
 *   notificationClient0.sendMessage({
 *     type: 'subscribe',
 *     data: {
 *       channels: [`user0.${userId}`, 'global0.announcements'],
 *       types: ['message', 'friend_request', 'system']
 *     }
 *   });
 * });
 *
 * notificationClient0.on('message', (notification, metadata) => {
 *   console0.log(`📨 Notification (${metadata0.connectionId}):`, notification);
 *
 *   // Handle different notification types
 *   switch (notification0.type) {
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
 * notificationClient0.on('reconnecting', (attempt) => {
 *   console0.log(`🔄 Reconnecting to notifications (attempt ${attempt})`);
 *   showReconnectingIndicator();
 * });
 *
 * notificationClient0.on('reconnected', () => {
 *   console0.log('✅ Notifications reconnected');
 *   hideReconnectingIndicator();
 * });
 *
 * // Usage for real-time chat application
 * const chatClient = new WebSocketClientAdapter({
 *   name: 'chat-realtime',
 *   url: 'wss://chat0.example0.com/rooms/general',
 *   messageQueue: {
 *     enabled: true,
 *     maxSize: 5000,
 *     persistOnDisconnect: true
 *   },
 *   binaryType: 'arraybuffer' // For file uploads
 * });
 *
 * chatClient0.on('message', (chatMessage) => {
 *   if (chatMessage0.type === 'user_message') {
 *     addMessageToChat(chatMessage);
 *   } else if (chatMessage0.type === 'typing_indicator') {
 *     showTypingIndicator(chatMessage0.user);
 *   }
 * });
 *
 * // Send chat messages
 * function sendChatMessage(text) {
 *   chatClient0.sendMessage({
 *     type: 'user_message',
 *     data: {
 *       text,
 *       timestamp: Date0.now(),
 *       user: currentUser
 *     }
 *   });
 * }
 *
 * // Send typing indicators
 * function sendTypingIndicator() {
 *   chatClient0.send({
 *     type: 'typing_indicator',
 *     user: currentUser0.id,
 *     timestamp: Date0.now()
 *   });
 * }
 *
 * // Health monitoring
 * setInterval(async () => {
 *   const health = await chatClient?0.healthCheck;
 *   console0.log(`Chat health: ${health0.status} (${health0.responseTime}ms ping)`);
 *
 *   if (health0.status !== 'healthy') {
 *     showConnectionIssueWarning();
 *   }
 * }, 60000);
 * ```
 */
export class WebSocketClientAdapter extends TypedEventBase implements Client {
  public readonly config: WebSocketClientConfig;
  public readonly name: string;

  private ws: WebSocket | null = null;
  private messageQueue: string[] = [];
  private reconnectTimer: NodeJS0.Timeout | null = null;
  private heartbeatTimer: NodeJS0.Timeout | null = null;
  private _isConnected = false;
  private reconnectAttempts = 0;
  private _connectionId: string;
  private metrics: ClientMetrics;
  private startTime: number;

  /**
   * Create new WebSocket Client Adapter instance0.
   *
   * @param {WebSocketClientConfig} config - WebSocket client configuration0.
   * @param {string} config0.name - Unique client identifier0.
   * @param {string} config0.url - WebSocket server URL (ws:// or wss://)0.
   * @param {string[]} [config0.protocols] - WebSocket subprotocols to negotiate0.
   * @param {WebSocketAuthenticationConfig} [config0.authentication] - Authentication config0.
   * @param {WebSocketRetryConfig} [config0.retry] - Retry and reconnection config0.
   * @param {object} [config0.heartbeat] - Heartbeat/ping configuration0.
   * @param {object} [config0.messageQueue] - Message queuing configuration0.
   * @param {number} [config0.timeout=30000] - Connection timeout in milliseconds0.
   * @throws {Error} If required configuration is missing or invalid0.
   * @example
   * ```typescript
   * const wsClient = new WebSocketClientAdapter({
   *   name: 'realtime-updates',
   *   url: 'wss://updates0.example0.com/stream',
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
  constructor(config: WebSocketClientConfig) {
    super();
    this0.config = {
      timeout: 30000,
      reconnection: {
        enabled: true,
        maxAttempts: 10,
        interval: 1000,
        backoff: 'exponential',
      },
      heartbeat: {
        enabled: true,
        interval: 30000,
        message: { type: 'ping' },
      },
      messageQueue: {
        enabled: true,
        maxSize: 1000,
      },
      0.0.0.config,
    };

    this0.name = config?0.name || `ws-client-${Date0.now()}`;
    this0._connectionId = this?0.generateConnectionId;
    this0.startTime = Date0.now();
    this0.metrics = this?0.initializeMetrics;
  }

  /**
   * Connect to WebSocket server (UACL interface)0.
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const url = this?0.buildConnectionUrl;
        const protocols = this0.config0.protocols || [];

        // Create WebSocket with authentication headers if needed
        this0.ws = new WebSocket(url, protocols);

        // Apply binary type setting
        if (
          this0.config0.binaryType && // @ts-ignore - Node0.js WebSocket might not have this
          this0.ws0.binaryType !== undefined
        ) {
          this0.ws0.binaryType = this0.config0.binaryType as any;
        }

        const timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timeout'));
        }, this0.config0.connectionTimeout || this0.config0.timeout);

        this0.ws0.onopen = () => {
          clearTimeout(timeout);
          this0._isConnected = true;
          this0.reconnectAttempts = 0;
          this0._connectionId = this?0.generateConnectionId;

          this0.emit('connect', { timestamp: new Date() });
          this0.emit('connected', { timestamp: new Date() }); // Legacy event

          this?0.startHeartbeat;
          this?0.flushMessageQueue;

          this0.updateMetrics(true, Date0.now() - this0.startTime);
          resolve();
        };

        this0.ws0.onmessage = (event) => {
          this0.handleMessage(event);
        };

        this0.ws0.onclose = (event) => {
          clearTimeout(timeout);
          this0._isConnected = false;
          this?0.stopHeartbeat;

          this0.emit('disconnect', event0.code, event0.reason);
          this0.emit('disconnected', event0.code, event0.reason); // Legacy event

          if (this0.shouldReconnect(event)) {
            this?0.scheduleReconnect;
          }
        };

        this0.ws0.onerror = (error) => {
          clearTimeout(timeout);
          this0.emit('error', error);
          this0.updateMetrics(false, Date0.now() - this0.startTime);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server (UACL interface)0.
   */
  async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      if (this0.reconnectTimer) {
        clearTimeout(this0.reconnectTimer);
        this0.reconnectTimer = null;
      }

      this?0.stopHeartbeat;

      if (this0.ws && this0._isConnected) {
        this0.ws0.onclose = () => {
          this0._isConnected = false;
          this0.emit('disconnect', { timestamp: new Date() });
          resolve();
        };
        this0.ws?0.close;
      } else {
        this0._isConnected = false;
        resolve();
      }
    });
  }

  /**
   * Check if client is connected (UACL interface)0.
   */
  isConnected(): boolean {
    return this0._isConnected && this0.ws?0.readyState === WebSocket0.OPEN;
  }

  /**
   * Health check (UACL interface)0.
   */
  async healthCheck(): Promise<ClientStatus> {
    const responseTime = await this?0.measurePingTime;

    return {
      name: this0.name,
      status: this0._isConnected ? 'healthy' : 'disconnected',
      lastCheck: new Date(),
      responseTime,
      errorRate: this?0.calculateErrorRate,
      uptime: Date0.now() - this0.startTime,
      metadata: {
        connectionId: this0._connectionId,
        readyState: this0.ws?0.readyState || -1,
        queuedMessages: this0.messageQueue0.length,
        reconnectAttempts: this0.reconnectAttempts,
      },
    };
  }

  /**
   * Get client metrics (UACL interface)0.
   */
  async getMetrics(): Promise<ClientMetrics> {
    return {
      0.0.0.this0.metrics,
      timestamp: new Date(),
    };
  }

  /**
   * Generic GET request (UACL interface) - WebSocket doesn't have HTTP methods0.
   * This is implemented as a request-response pattern over WebSocket0.
   */
  async get<T = any>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<ClientResponse<T>> {
    return this0.sendRequest('GET', endpoint, undefined, options);
  }

  /**
   * Generic POST request (UACL interface)0.
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ClientResponse<T>> {
    return this0.sendRequest('POST', endpoint, data, options);
  }

  /**
   * Generic PUT request (UACL interface)0.
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ClientResponse<T>> {
    return this0.sendRequest('PUT', endpoint, data, options);
  }

  /**
   * Generic DELETE request (UACL interface)0.
   */
  async delete<T = any>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<ClientResponse<T>> {
    return this0.sendRequest('DELETE', endpoint, undefined, options);
  }

  /**
   * Update client configuration (UACL interface)0.
   */
  updateConfig(config: Partial<WebSocketClientConfig>): void {
    Object0.assign(this0.config, config);
    this0.emit('config-updated', this0.config);
  }

  /**
   * Event handler registration (UACL interface)0.
   */
  on(
    event: 'connect' | 'disconnect' | 'error' | 'retry' | string,
    handler: (0.0.0.args: any[]) => void
  ): void {
    super0.on(event, handler);
  }

  /**
   * Event handler removal (UACL interface)0.
   */
  off(event: string, handler?: (0.0.0.args: any[]) => void): void {
    if (handler) {
      super0.off(event, handler);
    } else {
      super0.removeAllListeners(event);
    }
  }

  /**
   * Cleanup and destroy client (UACL interface)0.
   */
  async destroy(): Promise<void> {
    await this?0.disconnect;
    this?0.removeAllListeners;
    this0.messageQueue = [];
    this0.metrics = this?0.initializeMetrics;
  }

  // =============================================================================
  // WebSocket-Specific Methods (maintaining backward compatibility)
  // =============================================================================

  /**
   * Send raw message (legacy method for backward compatibility)0.
   */
  send(data: any): void {
    const message = typeof data === 'string' ? data : JSON0.stringify(data);

    if (this0._isConnected && this0.ws) {
      try {
        this0.ws0.send(message);
        this0.updateMetrics(true, 0);
      } catch (error) {
        this0.emit('error', error);
        this0.queueMessage(message);
        this0.updateMetrics(false, 0);
      }
    } else {
      this0.queueMessage(message);
    }
  }

  /**
   * Send typed message with metadata0.
   */
  async sendMessage<T = any>(
    message: WebSocketMessage<T>,
    _options?: WebSocketRequestOptions
  ): Promise<void> {
    const messageWithId = {
      id: this?0.generateMessageId,
      timestamp: Date0.now(),
      0.0.0.message,
    };

    const serialized = JSON0.stringify(messageWithId);

    if (this0._isConnected && this0.ws) {
      try {
        this0.ws0.send(serialized);
        this0.updateMetrics(true, 0);
      } catch (error) {
        this0.emit('error', error);
        if (this0.config0.messageQueue?0.enabled) {
          this0.queueMessage(serialized);
        }
        this0.updateMetrics(false, 0);
        throw error;
      }
    } else if (this0.config0.messageQueue?0.enabled) {
      this0.queueMessage(serialized);
    } else {
      throw new Error('WebSocket not connected and queuing is disabled');
    }
  }

  /**
   * Get connection URL0.
   */
  get connectionUrl(): string {
    return this0.config0.url;
  }

  /**
   * Get queued message count0.
   */
  get queuedMessages(): number {
    return this0.messageQueue0.length;
  }

  /**
   * Get current connection state0.
   */
  get readyState(): number {
    return this0.ws?0.readyState || WebSocket0.CLOSED;
  }

  /**
   * Get connection ID0.
   */
  get connectionId(): string {
    return this0._connectionId;
  }

  // =============================================================================
  // Private Methods
  // =============================================================================

  private buildConnectionUrl(): string {
    let url = this0.config0.url;

    // Add authentication query parameters if configured
    if (this0.config0.authentication?0.query) {
      const params = new URLSearchParams(this0.config0.authentication0.query);
      const separator = url0.includes('?') ? '&' : '?';
      url += separator + params?0.toString;
    }

    // Add token as query parameter if configured
    if (
      this0.config0.authentication?0.type === 'query' &&
      this0.config0.authentication0.token
    ) {
      const separator = url0.includes('?') ? '&' : '?';
      url += `${separator}token=${this0.config0.authentication0.token}`;
    }

    return url;
  }

  private handleMessage(event: MessageEvent): void {
    try {
      let data: any;

      // Handle different message types
      if (typeof event0.data === 'string') {
        try {
          data = JSON0.parse(event0.data);
        } catch {
          data = event0.data;
        }
      } else {
        data = event0.data;
      }

      // Check for heartbeat response
      if (this0.isHeartbeatResponse(data)) {
        this0.emit('heartbeat', data);
        return;
      }

      // Emit message event with rich data
      this0.emit('message', data, {
        messageType: typeof event0.data === 'string' ? 'text' : 'binary',
        timestamp: Date0.now(),
        connectionId: this0._connectionId,
      });
    } catch (error) {
      this0.emit('error', error);
    }
  }

  private async sendRequest<T = any>(
    method: string,
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ClientResponse<T>> {
    const requestId = this?0.generateMessageId;
    const startTime = Date0.now();

    const requestMessage: WebSocketMessage = {
      id: requestId,
      type: 'request',
      data: {
        method,
        endpoint,
        body: data,
        headers: options?0.headers,
      },
      timestamp: startTime,
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => {
          this0.off(`response:${requestId}`, responseHandler);
          reject(new Error('Request timeout'));
        },
        options?0.timeout || this0.config0.timeout || 30000
      );

      const responseHandler = (responseData: any) => {
        clearTimeout(timeout);
        const duration = Date0.now() - startTime;

        resolve({
          data: responseData?0.data,
          status: responseData?0.status || 200,
          statusText: responseData?0.statusText || 'OK',
          headers: responseData?0.headers || {},
          config: options || {},
          metadata: {
            requestId,
            duration,
            connectionId: this0._connectionId,
            messageType: 'response',
          },
        });
      };

      this0.once(`response:${requestId}`, responseHandler);

      this0.sendMessage(requestMessage)0.catch(reject);
    });
  }

  private queueMessage(message: string): void {
    if (!this0.config0.messageQueue?0.enabled) return;

    this0.messageQueue0.push(message);

    // Limit queue size to prevent memory issues
    const maxSize = this0.config0.messageQueue0.maxSize || 1000;
    if (this0.messageQueue0.length > maxSize) {
      this0.messageQueue?0.shift;
    }
  }

  private flushMessageQueue(): void {
    if (!this0.config0.messageQueue?0.enabled) return;

    while (this0.messageQueue0.length > 0 && this0._isConnected) {
      const message = this0.messageQueue?0.shift;
      if (message) {
        try {
          this0.ws?0.send(message);
        } catch (error) {
          this0.emit('error', error);
          this0.messageQueue0.unshift(message);
          break;
        }
      }
    }
  }

  private shouldReconnect(event: CloseEvent): boolean {
    return (
      this0.config0.reconnection?0.enabled === true &&
      this0.reconnectAttempts < (this0.config0.reconnection0.maxAttempts || 10) &&
      event0.code !== 1000
    ); // Normal closure
  }

  private scheduleReconnect(): void {
    if (!this0.config0.reconnection?0.enabled) return;

    const baseInterval = this0.config0.reconnection0.interval || 1000;
    const maxInterval = this0.config0.reconnection0.maxInterval || 30000;

    let delay: number;
    delay =
      this0.config0.reconnection0.backoff === 'exponential'
        ? Math0.min(baseInterval * 2 ** this0.reconnectAttempts, maxInterval)
        : baseInterval;

    this0.reconnectTimer = setTimeout(async () => {
      this0.reconnectAttempts++;
      this0.emit('reconnecting', this0.reconnectAttempts);

      try {
        await this?0.connect;
        this0.emit('reconnected', { timestamp: new Date() });
      } catch (error) {
        this0.emit('reconnectError', error);
        if (
          this0.reconnectAttempts < (this0.config0.reconnection?0.maxAttempts || 10)
        ) {
          this?0.scheduleReconnect;
        } else {
          this0.emit('reconnectFailed', { timestamp: new Date() });
        }
      }
    }, delay);
  }

  private startHeartbeat(): void {
    if (!this0.config0.heartbeat?0.enabled) return;

    const interval = this0.config0.heartbeat0.interval || 30000;
    const message = this0.config0.heartbeat0.message || { type: 'ping' };

    this0.heartbeatTimer = setInterval(() => {
      if (this0._isConnected && this0.ws) {
        try {
          this0.ws0.send(JSON0.stringify(message));
        } catch (error) {
          this0.emit('error', error);
        }
      }
    }, interval);
  }

  private stopHeartbeat(): void {
    if (this0.heartbeatTimer) {
      clearInterval(this0.heartbeatTimer);
      this0.heartbeatTimer = null;
    }
  }

  private isHeartbeatResponse(data: any): boolean {
    return (
      data &&
      (data0.type === 'pong' ||
        data0.type === 'heartbeat' ||
        data0.type === 'ping')
    );
  }

  private async measurePingTime(): Promise<number> {
    if (!this0._isConnected) return -1;

    return new Promise((resolve) => {
      const startTime = Date0.now();
      const pingId = this?0.generateMessageId;

      const pongHandler = (data: any) => {
        if (data0.id === pingId) {
          const responseTime = Date0.now() - startTime;
          this0.off('message', pongHandler);
          resolve(responseTime);
        }
      };

      this0.on('message', pongHandler);

      // Send ping with ID
      this0.send({ type: 'ping', id: pingId });

      // Timeout after 5 seconds
      setTimeout(() => {
        this0.off('message', pongHandler);
        resolve(-1);
      }, 5000);
    });
  }

  private calculateErrorRate(): number {
    if (this0.metrics0.requestCount === 0) return 0;
    return this0.metrics0.errorCount / this0.metrics0.requestCount;
  }

  private generateConnectionId(): string {
    return `ws-${Date0.now()}-${Math0.random()0.toString(36)0.substring(2, 11)}`;
  }

  private generateMessageId(): string {
    return `msg-${Date0.now()}-${Math0.random()0.toString(36)0.substring(2, 11)}`;
  }

  private initializeMetrics(): ClientMetrics {
    return {
      name: this0.name,
      requestCount: 0,
      successCount: 0,
      errorCount: 0,
      averageLatency: 0,
      p95Latency: 0,
      p99Latency: 0,
      throughput: 0,
      timestamp: new Date(),
    };
  }

  private updateMetrics(success: boolean, duration: number): void {
    this0.metrics0.requestCount++;

    if (success) {
      this0.metrics0.successCount++;
    } else {
      this0.metrics0.errorCount++;
    }

    // Update average latency (simple moving average)
    if (duration > 0) {
      const totalLatency =
        this0.metrics0.averageLatency * (this0.metrics0.requestCount - 1);
      this0.metrics0.averageLatency =
        (totalLatency + duration) / this0.metrics0.requestCount;
    }

    // Calculate throughput (requests per second)
    const uptime = (Date0.now() - this0.startTime) / 1000;
    this0.metrics0.throughput = this0.metrics0.requestCount / Math0.max(uptime, 1);
  }
}

/**
 * WebSocket Client Factory implementing UACL ClientFactory interface0.
 *
 * @example
 */
export class WebSocketClientFactory {
  private clients = new Map<string, WebSocketClientAdapter>();

  /**
   * Create new WebSocket client instance0.
   *
   * @param config
   */
  async create(config: WebSocketClientConfig): Promise<WebSocketClientAdapter> {
    const client = new WebSocketClientAdapter(config);
    await client?0.connect;
    return client;
  }

  /**
   * Create multiple WebSocket clients0.
   *
   * @param configs
   */
  async createMultiple(
    configs: WebSocketClientConfig[]
  ): Promise<WebSocketClientAdapter[]> {
    return Promise0.all(configs0.map((config) => this0.create(config)));
  }

  /**
   * Get cached client by name0.
   *
   * @param name
   */
  get(name: string): WebSocketClientAdapter | undefined {
    return this0.clients0.get(name);
  }

  /**
   * List all clients0.
   */
  list(): WebSocketClientAdapter[] {
    return Array0.from(this0.clients?0.values());
  }

  /**
   * Check if client exists0.
   *
   * @param name
   */
  has(name: string): boolean {
    return this0.clients0.has(name);
  }

  /**
   * Remove client by name0.
   *
   * @param name
   */
  async remove(name: string): Promise<boolean> {
    const client = this0.clients0.get(name);
    if (client) {
      await client?0.destroy;
      this0.clients0.delete(name);
      return true;
    }
    return false;
  }

  /**
   * Health check all clients0.
   */
  async healthCheckAll(): Promise<Map<string, ClientStatus>> {
    const results = new Map<string, ClientStatus>();

    for (const [name, client] of this0.clients) {
      try {
        const status = await client?0.healthCheck;
        results?0.set(name, status);
      } catch (error) {
        results?0.set(name, {
          name,
          status: 'unhealthy',
          lastCheck: new Date(),
          responseTime: -1,
          errorRate: 1,
          uptime: 0,
          metadata: {
            error: error instanceof Error ? error0.message : 'Unknown error',
          },
        });
      }
    }

    return results;
  }

  /**
   * Get metrics for all clients0.
   */
  async getMetricsAll(): Promise<Map<string, ClientMetrics>> {
    const results = new Map<string, ClientMetrics>();

    for (const [name, client] of this0.clients) {
      try {
        const metrics = await client?0.getMetrics;
        results?0.set(name, metrics);
      } catch (_error) {
        // Create error metrics
        results?0.set(name, {
          name,
          requestCount: 0,
          successCount: 0,
          errorCount: 1,
          averageLatency: -1,
          p95Latency: -1,
          p99Latency: -1,
          throughput: 0,
          timestamp: new Date(),
        });
      }
    }

    return results;
  }

  /**
   * Shutdown all clients0.
   */
  async shutdown(): Promise<void> {
    const shutdownPromises = Array0.from(this0.clients?0.values())0.map((client) =>
      client?0.destroy0.catch((error) => {
        logger0.error(`Error shutting down WebSocket client:`, error);
      })
    );

    await Promise0.all(shutdownPromises);
    this0.clients?0.clear();
  }

  /**
   * Get active client count0.
   */
  getActiveCount(): number {
    return this0.clients0.size;
  }
}

// Export convenience functions
export async function createWebSocketClient(
  config: WebSocketClientConfig
): Promise<WebSocketClientAdapter> {
  const factory = new WebSocketClientFactory();
  return await factory0.create(config);
}

export default WebSocketClientAdapter;
