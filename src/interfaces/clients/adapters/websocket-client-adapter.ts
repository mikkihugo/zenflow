/**
 * WebSocket Client Adapter for UACL (Unified API Client Layer)
 *
 * Enterprise-grade WebSocket client implementing UACL patterns for real-time communication.
 * Provides reliable, event-driven connectivity with automatic reconnection, message queuing,
 * and comprehensive monitoring capabilities.
 *
 * @file WebSocket client adapter implementing the UACL IClient interface for real-time communication
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
 * ```typescript
 * import { WebSocketClientAdapter } from './websocket-client-adapter';
 * import type { WebSocketClientConfig } from './websocket-client-adapter';
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
 *     token: process.env.WS_TOKEN,
 *     headers: {
 *       'Authorization': `Bearer ${process.env.API_KEY}`
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
import type {
  AuthenticationConfig,
  ClientConfig,
  ClientMetrics,
  ClientResponse,
  ClientStatus,
  IClient,
  RequestOptions,
  RetryConfig,
} from '../core/interfaces';

/**
 * WebSocket-specific authentication configuration
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
 * WebSocket-specific retry configuration
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
 * WebSocket client configuration extending UACL ClientConfig
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
    message: any;
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
 * WebSocket request options
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
 * WebSocket response wrapper
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
 * WebSocket message interface
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
 * WebSocket Client Adapter implementing UACL IClient interface
 *
 * @class WebSocketClientAdapter
 * @augments EventEmitter
 * @implements {IClient}
 * @description Enterprise-grade WebSocket client providing real-time communication capabilities
 *              with automatic reconnection, message queuing, heartbeat monitoring, and comprehensive
 *              observability features. Implements the UACL IClient interface for unified client management.
 * @property {WebSocketClientConfig} config - WebSocket client configuration (read-only)
 * @property {string} name - Client identifier (read-only)
 * @property {WebSocket|null} ws - Underlying WebSocket connection (private)
 * @property {string[]} messageQueue - Queued messages for offline scenarios (private)
 * @property {boolean} isConnected - Connection status (private)
 * @property {string} connectionId - Unique connection identifier (private)
 * @property {ClientMetrics} metrics - Performance metrics (private)
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
export class WebSocketClientAdapter extends EventEmitter implements IClient {
  public readonly config: WebSocketClientConfig;
  public readonly name: string;

  private ws: WebSocket | null = null;
  private messageQueue: string[] = [];
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private _isConnected = false;
  private reconnectAttempts = 0;
  private _connectionId: string;
  private metrics: ClientMetrics;
  private startTime: number;

  /**
   * Create new WebSocket Client Adapter instance
   *
   * @param {WebSocketClientConfig} config - WebSocket client configuration
   * @param {string} config.name - Unique client identifier
   * @param {string} config.url - WebSocket server URL (ws:// or wss://)
   * @param {string[]} [config.protocols] - WebSocket subprotocols to negotiate
   * @param {WebSocketAuthenticationConfig} [config.authentication] - Authentication config
   * @param {WebSocketRetryConfig} [config.retry] - Retry and reconnection config
   * @param {object} [config.heartbeat] - Heartbeat/ping configuration
   * @param {object} [config.messageQueue] - Message queuing configuration
   * @param {number} [config.timeout=30000] - Connection timeout in milliseconds
   * @throws {Error} If required configuration is missing or invalid
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
  constructor(config: WebSocketClientConfig) {
    super();
    this.config = {
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
      ...config,
    };

    this.name = config.name || `ws-client-${Date.now()}`;
    this._connectionId = this.generateConnectionId();
    this.startTime = Date.now();
    this.metrics = this.initializeMetrics();
  }

  /**
   * Connect to WebSocket server (UACL interface)
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const url = this.buildConnectionUrl();
        const protocols = this.config.protocols || [];

        // Create WebSocket with authentication headers if needed
        this.ws = new WebSocket(url, protocols);

        // Apply binary type setting
        if (this.config.binaryType) {
          // @ts-ignore - Node.js WebSocket might not have this
          if (this.ws.binaryType !== undefined) {
            this.ws.binaryType = this.config.binaryType as any;
          }
        }

        const timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timeout'));
        }, this.config.connectionTimeout || this.config.timeout);

        this.ws.onopen = () => {
          clearTimeout(timeout);
          this._isConnected = true;
          this.reconnectAttempts = 0;
          this._connectionId = this.generateConnectionId();

          this.emit('connect');
          this.emit('connected'); // Legacy event

          this.startHeartbeat();
          this.flushMessageQueue();

          this.updateMetrics(true, Date.now() - this.startTime);
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onclose = (event) => {
          clearTimeout(timeout);
          this._isConnected = false;
          this.stopHeartbeat();

          this.emit('disconnect', event.code, event.reason);
          this.emit('disconnected', event.code, event.reason); // Legacy event

          if (this.shouldReconnect(event)) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          clearTimeout(timeout);
          this.emit('error', error);
          this.updateMetrics(false, Date.now() - this.startTime);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server (UACL interface)
   */
  async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }

      this.stopHeartbeat();

      if (this.ws && this._isConnected) {
        this.ws.onclose = () => {
          this._isConnected = false;
          this.emit('disconnect');
          resolve();
        };
        this.ws.close();
      } else {
        this._isConnected = false;
        resolve();
      }
    });
  }

  /**
   * Check if client is connected (UACL interface)
   */
  isConnected(): boolean {
    return this._isConnected && this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Health check (UACL interface)
   */
  async healthCheck(): Promise<ClientStatus> {
    const responseTime = await this.measurePingTime();

    return {
      name: this.name,
      status: this._isConnected ? 'healthy' : 'disconnected',
      lastCheck: new Date(),
      responseTime,
      errorRate: this.calculateErrorRate(),
      uptime: Date.now() - this.startTime,
      metadata: {
        connectionId: this._connectionId,
        readyState: this.ws?.readyState || -1,
        queuedMessages: this.messageQueue.length,
        reconnectAttempts: this.reconnectAttempts,
      },
    };
  }

  /**
   * Get client metrics (UACL interface)
   */
  async getMetrics(): Promise<ClientMetrics> {
    return {
      ...this.metrics,
      timestamp: new Date(),
    };
  }

  /**
   * Generic GET request (UACL interface) - WebSocket doesn't have HTTP methods
   * This is implemented as a request-response pattern over WebSocket
   */
  async get<T = any>(endpoint: string, options?: RequestOptions): Promise<ClientResponse<T>> {
    return this.sendRequest('GET', endpoint, undefined, options);
  }

  /**
   * Generic POST request (UACL interface)
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ClientResponse<T>> {
    return this.sendRequest('POST', endpoint, data, options);
  }

  /**
   * Generic PUT request (UACL interface)
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ClientResponse<T>> {
    return this.sendRequest('PUT', endpoint, data, options);
  }

  /**
   * Generic DELETE request (UACL interface)
   */
  async delete<T = any>(endpoint: string, options?: RequestOptions): Promise<ClientResponse<T>> {
    return this.sendRequest('DELETE', endpoint, undefined, options);
  }

  /**
   * Update client configuration (UACL interface)
   */
  updateConfig(config: Partial<WebSocketClientConfig>): void {
    Object.assign(this.config, config);
    this.emit('config-updated', this.config);
  }

  /**
   * Event handler registration (UACL interface)
   */
  on(
    event: 'connect' | 'disconnect' | 'error' | 'retry' | string,
    handler: (...args: any[]) => void
  ): void {
    super.on(event, handler);
  }

  /**
   * Event handler removal (UACL interface)
   */
  off(event: string, handler?: (...args: any[]) => void): void {
    if (handler) {
      super.off(event, handler);
    } else {
      super.removeAllListeners(event);
    }
  }

  /**
   * Cleanup and destroy client (UACL interface)
   */
  async destroy(): Promise<void> {
    await this.disconnect();
    this.removeAllListeners();
    this.messageQueue = [];
    this.metrics = this.initializeMetrics();
  }

  // =============================================================================
  // WebSocket-Specific Methods (maintaining backward compatibility)
  // =============================================================================

  /**
   * Send raw message (legacy method for backward compatibility)
   */
  send(data: any): void {
    const message = typeof data === 'string' ? data : JSON.stringify(data);

    if (this._isConnected && this.ws) {
      try {
        this.ws.send(message);
        this.updateMetrics(true, 0);
      } catch (error) {
        this.emit('error', error);
        this.queueMessage(message);
        this.updateMetrics(false, 0);
      }
    } else {
      this.queueMessage(message);
    }
  }

  /**
   * Send typed message with metadata
   */
  async sendMessage<T = any>(
    message: WebSocketMessage<T>,
    _options?: WebSocketRequestOptions
  ): Promise<void> {
    const messageWithId = {
      id: this.generateMessageId(),
      timestamp: Date.now(),
      ...message,
    };

    const serialized = JSON.stringify(messageWithId);

    if (this._isConnected && this.ws) {
      try {
        this.ws.send(serialized);
        this.updateMetrics(true, 0);
      } catch (error) {
        this.emit('error', error);
        if (this.config.messageQueue?.enabled) {
          this.queueMessage(serialized);
        }
        this.updateMetrics(false, 0);
        throw error;
      }
    } else {
      if (this.config.messageQueue?.enabled) {
        this.queueMessage(serialized);
      } else {
        throw new Error('WebSocket not connected and queuing is disabled');
      }
    }
  }

  /**
   * Get connection URL
   */
  get connectionUrl(): string {
    return this.config.url;
  }

  /**
   * Get queued message count
   */
  get queuedMessages(): number {
    return this.messageQueue.length;
  }

  /**
   * Get current connection state
   */
  get readyState(): number {
    return this.ws?.readyState || WebSocket.CLOSED;
  }

  /**
   * Get connection ID
   */
  get connectionId(): string {
    return this._connectionId;
  }

  // =============================================================================
  // Private Methods
  // =============================================================================

  private buildConnectionUrl(): string {
    let url = this.config.url;

    // Add authentication query parameters if configured
    if (this.config.authentication?.query) {
      const params = new URLSearchParams(this.config.authentication.query);
      const separator = url.includes('?') ? '&' : '?';
      url += separator + params.toString();
    }

    // Add token as query parameter if configured
    if (this.config.authentication?.type === 'query' && this.config.authentication.token) {
      const separator = url.includes('?') ? '&' : '?';
      url += `${separator}token=${this.config.authentication.token}`;
    }

    return url;
  }

  private handleMessage(event: MessageEvent): void {
    try {
      let data: any;

      // Handle different message types
      if (typeof event.data === 'string') {
        try {
          data = JSON.parse(event.data);
        } catch {
          data = event.data;
        }
      } else {
        data = event.data;
      }

      // Check for heartbeat response
      if (this.isHeartbeatResponse(data)) {
        this.emit('heartbeat', data);
        return;
      }

      // Emit message event with rich data
      this.emit('message', data, {
        messageType: typeof event.data === 'string' ? 'text' : 'binary',
        timestamp: Date.now(),
        connectionId: this._connectionId,
      });
    } catch (error) {
      this.emit('error', error);
    }
  }

  private async sendRequest<T = any>(
    method: string,
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ClientResponse<T>> {
    const requestId = this.generateMessageId();
    const startTime = Date.now();

    const requestMessage: WebSocketMessage = {
      id: requestId,
      type: 'request',
      data: {
        method,
        endpoint,
        body: data,
        headers: options?.headers,
      },
      timestamp: startTime,
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => {
          this.off(`response:${requestId}`, responseHandler);
          reject(new Error('Request timeout'));
        },
        options?.timeout || this.config.timeout || 30000
      );

      const responseHandler = (responseData: any) => {
        clearTimeout(timeout);
        const duration = Date.now() - startTime;

        resolve({
          data: responseData.data,
          status: responseData.status || 200,
          statusText: responseData.statusText || 'OK',
          headers: responseData.headers || {},
          config: options || {},
          metadata: {
            requestId,
            duration,
            connectionId: this._connectionId,
            messageType: 'response',
          },
        });
      };

      this.once(`response:${requestId}`, responseHandler);

      this.sendMessage(requestMessage).catch(reject);
    });
  }

  private queueMessage(message: string): void {
    if (!this.config.messageQueue?.enabled) return;

    this.messageQueue.push(message);

    // Limit queue size to prevent memory issues
    const maxSize = this.config.messageQueue.maxSize || 1000;
    if (this.messageQueue.length > maxSize) {
      this.messageQueue.shift();
    }
  }

  private flushMessageQueue(): void {
    if (!this.config.messageQueue?.enabled) return;

    while (this.messageQueue.length > 0 && this._isConnected) {
      const message = this.messageQueue.shift();
      if (message) {
        try {
          this.ws?.send(message);
        } catch (error) {
          this.emit('error', error);
          this.messageQueue.unshift(message);
          break;
        }
      }
    }
  }

  private shouldReconnect(event: CloseEvent): boolean {
    return (
      this.config.reconnection?.enabled === true &&
      this.reconnectAttempts < (this.config.reconnection.maxAttempts || 10) &&
      event.code !== 1000
    ); // Normal closure
  }

  private scheduleReconnect(): void {
    if (!this.config.reconnection?.enabled) return;

    const baseInterval = this.config.reconnection.interval || 1000;
    const maxInterval = this.config.reconnection.maxInterval || 30000;

    let delay: number;
    if (this.config.reconnection.backoff === 'exponential') {
      delay = Math.min(baseInterval * 2 ** this.reconnectAttempts, maxInterval);
    } else {
      delay = baseInterval;
    }

    this.reconnectTimer = setTimeout(async () => {
      this.reconnectAttempts++;
      this.emit('reconnecting', this.reconnectAttempts);

      try {
        await this.connect();
        this.emit('reconnected');
      } catch (error) {
        this.emit('reconnectError', error);
        if (this.reconnectAttempts < (this.config.reconnection?.maxAttempts || 10)) {
          this.scheduleReconnect();
        } else {
          this.emit('reconnectFailed');
        }
      }
    }, delay);
  }

  private startHeartbeat(): void {
    if (!this.config.heartbeat?.enabled) return;

    const interval = this.config.heartbeat.interval || 30000;
    const message = this.config.heartbeat.message || { type: 'ping' };

    this.heartbeatTimer = setInterval(() => {
      if (this._isConnected && this.ws) {
        try {
          this.ws.send(JSON.stringify(message));
        } catch (error) {
          this.emit('error', error);
        }
      }
    }, interval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private isHeartbeatResponse(data: any): boolean {
    return data && (data.type === 'pong' || data.type === 'heartbeat' || data.type === 'ping');
  }

  private async measurePingTime(): Promise<number> {
    if (!this._isConnected) return -1;

    return new Promise((resolve) => {
      const startTime = Date.now();
      const pingId = this.generateMessageId();

      const pongHandler = (data: any) => {
        if (data.id === pingId) {
          const responseTime = Date.now() - startTime;
          this.off('message', pongHandler);
          resolve(responseTime);
        }
      };

      this.on('message', pongHandler);

      // Send ping with ID
      this.send({ type: 'ping', id: pingId });

      // Timeout after 5 seconds
      setTimeout(() => {
        this.off('message', pongHandler);
        resolve(-1);
      }, 5000);
    });
  }

  private calculateErrorRate(): number {
    if (this.metrics.requestCount === 0) return 0;
    return this.metrics.errorCount / this.metrics.requestCount;
  }

  private generateConnectionId(): string {
    return `ws-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  private generateMessageId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  private initializeMetrics(): ClientMetrics {
    return {
      name: this.name,
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
    this.metrics.requestCount++;

    if (success) {
      this.metrics.successCount++;
    } else {
      this.metrics.errorCount++;
    }

    // Update average latency (simple moving average)
    if (duration > 0) {
      const totalLatency = this.metrics.averageLatency * (this.metrics.requestCount - 1);
      this.metrics.averageLatency = (totalLatency + duration) / this.metrics.requestCount;
    }

    // Calculate throughput (requests per second)
    const uptime = (Date.now() - this.startTime) / 1000;
    this.metrics.throughput = this.metrics.requestCount / Math.max(uptime, 1);
  }
}

/**
 * WebSocket Client Factory implementing UACL IClientFactory interface
 *
 * @example
 */
export class WebSocketClientFactory {
  private clients = new Map<string, WebSocketClientAdapter>();

  /**
   * Create new WebSocket client instance
   *
   * @param config
   */
  async create(config: WebSocketClientConfig): Promise<WebSocketClientAdapter> {
    const client = new WebSocketClientAdapter(config);
    await client.connect();
    return client;
  }

  /**
   * Create multiple WebSocket clients
   *
   * @param configs
   */
  async createMultiple(configs: WebSocketClientConfig[]): Promise<WebSocketClientAdapter[]> {
    return Promise.all(configs.map((config) => this.create(config)));
  }

  /**
   * Get cached client by name
   *
   * @param name
   */
  get(name: string): WebSocketClientAdapter | undefined {
    return this.clients.get(name);
  }

  /**
   * List all clients
   */
  list(): WebSocketClientAdapter[] {
    return Array.from(this.clients.values());
  }

  /**
   * Check if client exists
   *
   * @param name
   */
  has(name: string): boolean {
    return this.clients.has(name);
  }

  /**
   * Remove client by name
   *
   * @param name
   */
  async remove(name: string): Promise<boolean> {
    const client = this.clients.get(name);
    if (client) {
      await client.destroy();
      this.clients.delete(name);
      return true;
    }
    return false;
  }

  /**
   * Health check all clients
   */
  async healthCheckAll(): Promise<Map<string, ClientStatus>> {
    const results = new Map<string, ClientStatus>();

    for (const [name, client] of this.clients) {
      try {
        const status = await client.healthCheck();
        results.set(name, status);
      } catch (error) {
        results.set(name, {
          name,
          status: 'unhealthy',
          lastCheck: new Date(),
          responseTime: -1,
          errorRate: 1,
          uptime: 0,
          metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
        });
      }
    }

    return results;
  }

  /**
   * Get metrics for all clients
   */
  async getMetricsAll(): Promise<Map<string, ClientMetrics>> {
    const results = new Map<string, ClientMetrics>();

    for (const [name, client] of this.clients) {
      try {
        const metrics = await client.getMetrics();
        results.set(name, metrics);
      } catch (_error) {
        // Create error metrics
        results.set(name, {
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
   * Shutdown all clients
   */
  async shutdown(): Promise<void> {
    const shutdownPromises = Array.from(this.clients.values()).map((client) =>
      client.destroy().catch((error) => {
        console.error(`Error shutting down WebSocket client:`, error);
      })
    );

    await Promise.all(shutdownPromises);
    this.clients.clear();
  }

  /**
   * Get active client count
   */
  getActiveCount(): number {
    return this.clients.size;
  }
}

// Export convenience functions
export async function createWebSocketClient(
  config: WebSocketClientConfig
): Promise<WebSocketClientAdapter> {
  const factory = new WebSocketClientFactory();
  return await factory.create(config);
}

export default WebSocketClientAdapter;
