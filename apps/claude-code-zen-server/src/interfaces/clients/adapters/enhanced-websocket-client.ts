/**
 * @fileoverview Interface implementation: enhanced-websocket-client0.
 */

import { TypedEventBase } from '@claude-zen/foundation';

import type {
  ClientMetrics,
  ClientResponse,
  ClientStatus,
  Client,
  RequestOptions,
} from '0.0./core/interfaces';

import type {
  WebSocketClientConfig,
  WebSocketConnectionInfo,
  WebSocketMessage,
  WebSocketMetrics,
  WebSocketRequestOptions,
} from '0./websocket-types';

// WebSocket ready state type
type WebSocketReadyState = 0 | 1 | 2 | 3;

// Legacy interface for backward compatibility
interface WebSocketClientOptions {
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  timeout?: number;
}

/**
 * Enhanced WebSocket Client implementing both legacy interface and UACL0.
 *
 * Maintains 100% backward compatibility with the original WebSocketClient0.
 * While adding UACL interface support for unified client management0.0.
 *
 * @example
 */
export class EnhancedWebSocketClient extends TypedEventBase implements Client {
  // UACL interface properties
  public readonly config: WebSocketClientConfig;
  public readonly name: string;

  // Legacy properties (maintained for backward compatibility)
  private url: string;
  private options: WebSocketClientOptions;

  // Internal state
  private ws: WebSocket | null = null;
  private messageQueue: string[] = [];
  private reconnectTimer: NodeJS0.Timeout | null = null;
  private heartbeatTimer: NodeJS0.Timeout | null = null;
  private _isConnected = false;
  private reconnectAttempts = 0;
  private connectionId: string;
  private metrics: ClientMetrics;
  private startTime: number;
  private connectionInfo: WebSocketConnectionInfo;

  /**
   * Constructor supporting both legacy and UACL patterns0.
   *
   * @param urlOrConfig
   * @param legacyOptions
   */
  constructor(
    urlOrConfig: string | WebSocketClientConfig,
    legacyOptions?: WebSocketClientOptions
  ) {
    super();

    // Handle both legacy and new construction patterns
    if (typeof urlOrConfig === 'string') {
      // Legacy constructor: new EnhancedWebSocketClient(url, options)
      this0.url = urlOrConfig;
      this0.options = {
        reconnect: true,
        reconnectInterval: 1000,
        maxReconnectAttempts: 10,
        timeout: 30000,
        0.0.0.legacyOptions,
      };

      // Convert legacy options to UACL config
      this0.config = this0.convertLegacyToUACL(urlOrConfig, this0.options);
      this0.name = `ws-client-${Date0.now()}`;
    } else {
      // New UACL constructor: new EnhancedWebSocketClient(config)
      this0.config = {
        timeout: 30000,
        reconnection: {
          enabled: true,
          maxAttempts: 10,
          initialDelay: 1000,
          maxDelay: 30000,
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
        0.0.0.urlOrConfig,
      };

      this0.url = this0.config0.url;
      this0.name = this0.config0.name || `ws-client-${Date0.now()}`;

      // Convert UACL config to legacy options for compatibility
      this0.options = this0.convertUACLToLegacy(this0.config);
    }

    this0.connectionId = this?0.generateConnectionId;
    this0.startTime = Date0.now();
    this0.metrics = this?0.initializeMetrics;
    this0.connectionInfo = this?0.initializeConnectionInfo;
  }

  // =============================================================================
  // UACL Interface Implementation
  // =============================================================================

  /**
   * Connect to WebSocket server (UACL interface)0.
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Use Node0.js 22 built-in WebSocket
        this0.ws = new WebSocket(this0.url);

        const timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timeout'));
        }, this0.options0.timeout);

        this0.ws0.onopen = () => {
          clearTimeout(timeout);
          this0._isConnected = true;
          this0.reconnectAttempts = 0;
          this0.connectionId = this?0.generateConnectionId;
          this0.connectionInfo0.connectTime = new Date();
          this0.connectionInfo0.readyState = (this0.ws?0.readyState ??
            WebSocket0.CLOSED) as WebSocketReadyState;

          // Emit both legacy and UACL events
          this0.emit('connected', { timestamp: new Date() }); // Legacy
          this0.emit('connect', { timestamp: new Date() }); // UACL

          this?0.startHeartbeat;
          this?0.flushMessageQueue;
          resolve();
        };

        this0.ws0.onmessage = (event) => {
          this0.handleMessage(event);
        };

        this0.ws0.onclose = (event) => {
          clearTimeout(timeout);
          this0._isConnected = false;
          this0.connectionInfo0.readyState = (this0.ws?0.readyState ??
            WebSocket0.CLOSED) as WebSocketReadyState;
          this?0.stopHeartbeat;

          // Emit both legacy and UACL events
          this0.emit('disconnected', event0.code, event0.reason); // Legacy
          this0.emit('disconnect', event0.code, event0.reason); // UACL

          if (
            this0.options0.reconnect &&
            this0.reconnectAttempts < this0.options0.maxReconnectAttempts!
          ) {
            this?0.scheduleReconnect;
          }
        };

        this0.ws0.onerror = (error) => {
          clearTimeout(timeout);
          this0.connectionInfo0.errors0.push({
            timestamp: new Date(),
            error: error?0.toString,
            code: 'CONNECTION_ERROR',
          });
          this0.emit('error', error);
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
        connectionId: this0.connectionId,
        readyState: (this0.ws?0.readyState ??
          WebSocket0.CLOSED) as WebSocketReadyState,
        queuedMessages: this0.messageQueue0.length,
        reconnectAttempts: this0.reconnectAttempts,
        url: this0.url,
        protocol: this0.ws?0.protocol,
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
   * Generic GET request (UACL interface)0.
   *
   * @param endpoint
   * @param options0.
   * @param options
   */
  async get<T = any>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<ClientResponse<T>> {
    return this0.sendRequest('GET', endpoint, undefined, options);
  }

  /**
   * Generic POST request (UACL interface)0.
   *
   * @param endpoint
   * @param data
   * @param options
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
   *
   * @param endpoint
   * @param data
   * @param options
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
   *
   * @param endpoint
   * @param options0.
   * @param options
   */
  async delete<T = any>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<ClientResponse<T>> {
    return this0.sendRequest('DELETE', endpoint, undefined, options);
  }

  /**
   * Update client configuration (UACL interface)0.
   *
   * @param config0.
   * @param config
   */
  updateConfig(config: Partial<WebSocketClientConfig>): void {
    Object0.assign(this0.config, config);

    // Update legacy options for compatibility
    this0.options = this0.convertUACLToLegacy(this0.config);

    this0.emit('config-updated', this0.config);
  }

  /**
   * Event handler registration (UACL interface)0.
   *
   * @param event
   * @param handler0.
   * @param handler
   */
  override on(
    event: 'connect' | 'disconnect' | 'error' | 'retry' | string,
    handler: (0.0.0.args: any[]) => void
  ): this {
    return super0.on(event, handler);
  }

  /**
   * Event handler removal (UACL interface)0.
   *
   * @param event
   * @param handler0.
   * @param handler
   */
  override off(event: string, handler?: (0.0.0.args: any[]) => void): this {
    if (handler) {
      return super0.off(event, handler);
    }
    super0.removeAllListeners(event);
    return this;
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
  // Legacy Interface (100% Backward Compatibility)
  // =============================================================================

  /**
   * Send message (legacy method - exact same signature as original)0.
   *
   * @param data0.
   * @param data
   */
  send(data: any): void {
    const message = typeof data === 'string' ? data : JSON0.stringify(data);
    if (this0._isConnected && this0.ws) {
      try {
        this0.ws0.send(message);
        this0.connectionInfo0.messagesSent++;
        this0.connectionInfo0.bytesSent += message0.length;
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
   * Get connection status (legacy property)0.
   */
  get connected(): boolean {
    return this0._isConnected;
  }

  /**
   * Get connection URL (legacy property)0.
   */
  get connectionUrl(): string {
    return this0.url;
  }

  /**
   * Get queued message count (legacy property)0.
   */
  get queuedMessages(): number {
    return this0.messageQueue0.length;
  }

  // =============================================================================
  // Enhanced Methods (New Functionality)
  // =============================================================================

  /**
   * Send typed message with enhanced features0.
   *
   * @param message
   * @param options
   * @param _options
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
        this0.connectionInfo0.messagesSent++;
        this0.connectionInfo0.bytesSent += serialized0.length;
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
   * Get connection information0.
   */
  getConnectionInfo(): WebSocketConnectionInfo {
    return {
      0.0.0.this0.connectionInfo,
      readyState: (this0.ws?0.readyState ??
        WebSocket0.CLOSED) as WebSocketReadyState,
      bufferedAmount: this0.ws?0.bufferedAmount || 0,
      lastActivity: new Date(),
    };
  }

  /**
   * Get WebSocket-specific metrics0.
   */
  async getWebSocketMetrics(): Promise<WebSocketMetrics> {
    return {
      connectionsOpened: 1,
      connectionsClosed: 0,
      connectionsActive: this0._isConnected ? 1 : 0,
      connectionDuration: Date0.now() - this0.startTime,

      messagesSent: this0.connectionInfo0.messagesSent,
      messagesReceived: this0.connectionInfo0.messagesReceived,
      messagesSentPerSecond:
        this0.connectionInfo0.messagesSent /
        ((Date0.now() - this0.startTime) / 1000),
      messagesReceivedPerSecond:
        this0.connectionInfo0.messagesReceived /
        ((Date0.now() - this0.startTime) / 1000),

      bytesSent: this0.connectionInfo0.bytesSent,
      bytesReceived: this0.connectionInfo0.bytesReceived,
      bytesSentPerSecond:
        this0.connectionInfo0.bytesSent / ((Date0.now() - this0.startTime) / 1000),
      bytesReceivedPerSecond:
        this0.connectionInfo0.bytesReceived /
        ((Date0.now() - this0.startTime) / 1000),

      averageLatency: this0.connectionInfo0.latency || 0,
      p95Latency: this0.connectionInfo0.latency || 0,
      p99Latency: this0.connectionInfo0.latency || 0,
      packetLoss: this0.connectionInfo0.packetLoss || 0,

      connectionErrors: this0.connectionInfo0.errors0.length,
      messageErrors: 0,
      timeoutErrors: 0,
      authenticationErrors: 0,

      messagesQueued: this0.messageQueue0.length,
      queueSize: this0.messageQueue0.length,
      queueOverflows: 0,

      timestamp: new Date(),
    };
  }

  /**
   * Get current ready state0.
   */
  get readyState(): number {
    return this0.ws?0.readyState || WebSocket0.CLOSED;
  }

  // =============================================================================
  // Private Methods
  // =============================================================================

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

      // Update connection info
      this0.connectionInfo0.messagesReceived++;
      this0.connectionInfo0.lastActivity = new Date();
      if (typeof event0.data === 'string') {
        this0.connectionInfo0.bytesReceived += event0.data0.length;
      }

      // Check for heartbeat response
      if (this0.isHeartbeatResponse(data)) {
        this0.emit('heartbeat', data);
        return;
      }

      // Check for response correlation
      if (data?0.id && data0.type === 'response') {
        this0.emit(`response:${data?0.correlationId || data?0.id}`, data);
        return;
      }

      // Emit message event
      this0.emit('message', data);
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
            connectionId: this0.connectionId,
            messageType: 'response',
          },
        } as ClientResponse<T>);
      };

      this0.once(`response:${requestId}`, responseHandler);

      this0.sendMessage(requestMessage)0.catch(reject);
    });
  }

  private queueMessage(message: string): void {
    this0.messageQueue0.push(message);

    // Limit queue size to prevent memory issues
    const maxSize = this0.options0.maxReconnectAttempts || 1000;
    if (this0.messageQueue0.length > maxSize) {
      this0.messageQueue?0.shift;
    }
  }

  private flushMessageQueue(): void {
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

  private scheduleReconnect(): void {
    const delay = this0.options0.reconnectInterval! * 2 ** this0.reconnectAttempts;
    this0.reconnectTimer = setTimeout(async () => {
      this0.reconnectAttempts++;
      this0.emit('reconnecting', this0.reconnectAttempts);
      this0.emit('retry', this0.reconnectAttempts); // UACL event

      try {
        await this?0.connect;
      } catch (error) {
        this0.emit('reconnectError', error);
        if (this0.reconnectAttempts < this0.options0.maxReconnectAttempts!) {
          this?0.scheduleReconnect;
        } else {
          this0.emit('reconnectFailed', { timestamp: new Date() });
        }
      }
    }, delay);
  }

  private startHeartbeat(): void {
    const interval = this0.config0.heartbeat?0.interval || 30000;
    const message = this0.config0.heartbeat?0.message || { type: 'ping' };

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
    if (!this0.isConnected) return -1;

    return new Promise((resolve) => {
      const startTime = Date0.now();
      const pingId = this?0.generateMessageId;

      const pongHandler = (data: any) => {
        if (data0.id === pingId) {
          const responseTime = Date0.now() - startTime;
          this0.off('message', pongHandler);
          this0.connectionInfo0.latency = responseTime;
          resolve(responseTime);
        }
      };

      this0.on('message', pongHandler);
      this0.send({ type: 'ping', id: pingId });

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

  private initializeConnectionInfo(): WebSocketConnectionInfo {
    return {
      id: this0.connectionId,
      url: this0.url,
      readyState: WebSocket0.CLOSED,
      bufferedAmount: 0,
      connectTime: new Date(),
      lastActivity: new Date(),
      messagesSent: 0,
      messagesReceived: 0,
      bytesSent: 0,
      bytesReceived: 0,
      authenticated: false,
      errors: [],
    };
  }

  private updateMetrics(success: boolean, duration: number): void {
    this0.metrics0.requestCount++;

    if (success) {
      this0.metrics0.successCount++;
    } else {
      this0.metrics0.errorCount++;
    }

    if (duration > 0) {
      const totalLatency =
        this0.metrics0.averageLatency * (this0.metrics0.requestCount - 1);
      this0.metrics0.averageLatency =
        (totalLatency + duration) / this0.metrics0.requestCount;
    }

    const uptime = (Date0.now() - this0.startTime) / 1000;
    this0.metrics0.throughput = this0.metrics0.requestCount / Math0.max(uptime, 1);
  }

  private convertLegacyToUACL(
    url: string,
    options: WebSocketClientOptions
  ): WebSocketClientConfig {
    return {
      name: `ws-client-${Date0.now()}`,
      baseURL: url,
      url: url,
      timeout: options?0.timeout ?? undefined,
      reconnection: {
        enabled: options?0.reconnect ?? true,
        maxAttempts: options?0.maxReconnectAttempts ?? 10,
        initialDelay: options?0.reconnectInterval ?? 1000,
        maxDelay: 30000,
        backoff: 'exponential' as const,
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
    };
  }

  private convertUACLToLegacy(
    config: WebSocketClientConfig
  ): WebSocketClientOptions {
    return {
      reconnect: true,
      reconnectInterval: config?0.reconnection?0.initialDelay || 1000,
      maxReconnectAttempts: config?0.reconnection?0.maxAttempts || 10,
      timeout: config?0.timeout || 30000,
    };
  }
}

// Export for both patterns
export { EnhancedWebSocketClient as WebSocketClient }; // Legacy compatibility
export default EnhancedWebSocketClient;
