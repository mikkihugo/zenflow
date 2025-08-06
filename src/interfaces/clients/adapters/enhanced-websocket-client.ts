/**
 * Enhanced WebSocket Client with UACL Integration
 *
 * Extends the original WebSocket client to implement UACL interface
 * while maintaining 100% backward compatibility with existing code.
 */

import { EventEmitter } from 'node:events';
import type {
  ClientMetrics,
  ClientResponse,
  ClientStatus,
  IClient,
  RequestOptions,
} from '../core/interfaces';

import type {
  WebSocketClientConfig,
  WebSocketConnectionInfo,
  WebSocketMessage,
  WebSocketMetrics,
  WebSocketRequestOptions,
} from './websocket-types';

// Legacy interface for backward compatibility
interface WebSocketClientOptions {
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  timeout?: number;
}

/**
 * Enhanced WebSocket Client implementing both legacy interface and UACL
 *
 * Maintains 100% backward compatibility with the original WebSocketClient
 * while adding UACL interface support for unified client management.
 *
 * @example
 */
export class EnhancedWebSocketClient extends EventEmitter implements IClient {
  // UACL interface properties
  public readonly config: WebSocketClientConfig;
  public readonly name: string;

  // Legacy properties (maintained for backward compatibility)
  private url: string;
  private options: WebSocketClientOptions;

  // Internal state
  private ws: WebSocket | null = null;
  private messageQueue: string[] = [];
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private connectionId: string;
  private metrics: ClientMetrics;
  private startTime: number;
  private connectionInfo: WebSocketConnectionInfo;

  /**
   * Constructor supporting both legacy and UACL patterns
   *
   * @param urlOrConfig
   * @param legacyOptions
   */
  constructor(urlOrConfig: string | WebSocketClientConfig, legacyOptions?: WebSocketClientOptions) {
    super();

    // Handle both legacy and new construction patterns
    if (typeof urlOrConfig === 'string') {
      // Legacy constructor: new EnhancedWebSocketClient(url, options)
      this.url = urlOrConfig;
      this.options = {
        reconnect: true,
        reconnectInterval: 1000,
        maxReconnectAttempts: 10,
        timeout: 30000,
        ...legacyOptions,
      };

      // Convert legacy options to UACL config
      this.config = this.convertLegacyToUACL(urlOrConfig, this.options);
      this.name = `ws-client-${Date.now()}`;
    } else {
      // New UACL constructor: new EnhancedWebSocketClient(config)
      this.config = {
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
        ...urlOrConfig,
      };

      this.url = this.config.url;
      this.name = this.config.name || `ws-client-${Date.now()}`;

      // Convert UACL config to legacy options for compatibility
      this.options = this.convertUACLToLegacy(this.config);
    }

    this.connectionId = this.generateConnectionId();
    this.startTime = Date.now();
    this.metrics = this.initializeMetrics();
    this.connectionInfo = this.initializeConnectionInfo();
  }

  // =============================================================================
  // UACL Interface Implementation
  // =============================================================================

  /**
   * Connect to WebSocket server (UACL interface)
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Use Node.js 22 built-in WebSocket
        this.ws = new WebSocket(this.url);

        const timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timeout'));
        }, this.options.timeout);

        this.ws.onopen = () => {
          clearTimeout(timeout);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.connectionId = this.generateConnectionId();
          this.connectionInfo.connectTime = new Date();
          this.connectionInfo.readyState = this.ws?.readyState;

          // Emit both legacy and UACL events
          this.emit('connected'); // Legacy
          this.emit('connect'); // UACL

          this.startHeartbeat();
          this.flushMessageQueue();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onclose = (event) => {
          clearTimeout(timeout);
          this.isConnected = false;
          this.connectionInfo.readyState = this.ws?.readyState;
          this.stopHeartbeat();

          // Emit both legacy and UACL events
          this.emit('disconnected', event.code, event.reason); // Legacy
          this.emit('disconnect', event.code, event.reason); // UACL

          if (
            this.options.reconnect &&
            this.reconnectAttempts < this.options.maxReconnectAttempts!
          ) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          clearTimeout(timeout);
          this.connectionInfo.errors.push({
            timestamp: new Date(),
            error: error.toString(),
            code: 'CONNECTION_ERROR',
          });
          this.emit('error', error);
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

      if (this.ws && this.isConnected) {
        this.ws.onclose = () => {
          this.isConnected = false;
          this.emit('disconnect');
          resolve();
        };
        this.ws.close();
      } else {
        this.isConnected = false;
        resolve();
      }
    });
  }

  /**
   * Check if client is connected (UACL interface)
   */
  isConnected(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Health check (UACL interface)
   */
  async healthCheck(): Promise<ClientStatus> {
    const responseTime = await this.measurePingTime();

    return {
      name: this.name,
      status: this.isConnected ? 'healthy' : 'disconnected',
      lastCheck: new Date(),
      responseTime,
      errorRate: this.calculateErrorRate(),
      uptime: Date.now() - this.startTime,
      metadata: {
        connectionId: this.connectionId,
        readyState: this.ws?.readyState || -1,
        queuedMessages: this.messageQueue.length,
        reconnectAttempts: this.reconnectAttempts,
        url: this.url,
        protocol: this.ws?.protocol,
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
   * Generic GET request (UACL interface)
   *
   * @param endpoint
   * @param options
   */
  async get<T = any>(endpoint: string, options?: RequestOptions): Promise<ClientResponse<T>> {
    return this.sendRequest('GET', endpoint, undefined, options);
  }

  /**
   * Generic POST request (UACL interface)
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
    return this.sendRequest('POST', endpoint, data, options);
  }

  /**
   * Generic PUT request (UACL interface)
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
    return this.sendRequest('PUT', endpoint, data, options);
  }

  /**
   * Generic DELETE request (UACL interface)
   *
   * @param endpoint
   * @param options
   */
  async delete<T = any>(endpoint: string, options?: RequestOptions): Promise<ClientResponse<T>> {
    return this.sendRequest('DELETE', endpoint, undefined, options);
  }

  /**
   * Update client configuration (UACL interface)
   *
   * @param config
   */
  updateConfig(config: Partial<WebSocketClientConfig>): void {
    Object.assign(this.config, config);

    // Update legacy options for compatibility
    this.options = this.convertUACLToLegacy(this.config);

    this.emit('config-updated', this.config);
  }

  /**
   * Event handler registration (UACL interface)
   *
   * @param event
   * @param handler
   */
  on(
    event: 'connect' | 'disconnect' | 'error' | 'retry' | string,
    handler: (...args: any[]) => void
  ): void {
    super.on(event, handler);
  }

  /**
   * Event handler removal (UACL interface)
   *
   * @param event
   * @param handler
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
  // Legacy Interface (100% Backward Compatibility)
  // =============================================================================

  /**
   * Send message (legacy method - exact same signature as original)
   *
   * @param data
   */
  send(data: any): void {
    const message = typeof data === 'string' ? data : JSON.stringify(data);
    if (this.isConnected && this.ws) {
      try {
        this.ws.send(message);
        this.connectionInfo.messagesSent++;
        this.connectionInfo.bytesSent += message.length;
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
   * Get connection status (legacy property)
   */
  get connected(): boolean {
    return this.isConnected;
  }

  /**
   * Get connection URL (legacy property)
   */
  get connectionUrl(): string {
    return this.url;
  }

  /**
   * Get queued message count (legacy property)
   */
  get queuedMessages(): number {
    return this.messageQueue.length;
  }

  // =============================================================================
  // Enhanced Methods (New Functionality)
  // =============================================================================

  /**
   * Send typed message with enhanced features
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
      id: this.generateMessageId(),
      timestamp: Date.now(),
      ...message,
    };

    const serialized = JSON.stringify(messageWithId);

    if (this.isConnected && this.ws) {
      try {
        this.ws.send(serialized);
        this.connectionInfo.messagesSent++;
        this.connectionInfo.bytesSent += serialized.length;
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
   * Get connection information
   */
  getConnectionInfo(): WebSocketConnectionInfo {
    return {
      ...this.connectionInfo,
      readyState: this.ws?.readyState || -1,
      bufferedAmount: this.ws?.bufferedAmount || 0,
      lastActivity: new Date(),
    };
  }

  /**
   * Get WebSocket-specific metrics
   */
  async getWebSocketMetrics(): Promise<WebSocketMetrics> {
    return {
      connectionsOpened: 1,
      connectionsClosed: 0,
      connectionsActive: this.isConnected ? 1 : 0,
      connectionDuration: Date.now() - this.startTime,

      messagesSent: this.connectionInfo.messagesSent,
      messagesReceived: this.connectionInfo.messagesReceived,
      messagesSentPerSecond:
        this.connectionInfo.messagesSent / ((Date.now() - this.startTime) / 1000),
      messagesReceivedPerSecond:
        this.connectionInfo.messagesReceived / ((Date.now() - this.startTime) / 1000),

      bytesSent: this.connectionInfo.bytesSent,
      bytesReceived: this.connectionInfo.bytesReceived,
      bytesSentPerSecond: this.connectionInfo.bytesSent / ((Date.now() - this.startTime) / 1000),
      bytesReceivedPerSecond:
        this.connectionInfo.bytesReceived / ((Date.now() - this.startTime) / 1000),

      averageLatency: this.connectionInfo.latency || 0,
      p95Latency: this.connectionInfo.latency || 0,
      p99Latency: this.connectionInfo.latency || 0,
      packetLoss: this.connectionInfo.packetLoss || 0,

      connectionErrors: this.connectionInfo.errors.length,
      messageErrors: 0,
      timeoutErrors: 0,
      authenticationErrors: 0,

      messagesQueued: this.messageQueue.length,
      queueSize: this.messageQueue.length,
      queueOverflows: 0,

      timestamp: new Date(),
    };
  }

  /**
   * Get current ready state
   */
  get readyState(): number {
    return this.ws?.readyState || WebSocket.CLOSED;
  }

  // =============================================================================
  // Private Methods
  // =============================================================================

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

      // Update connection info
      this.connectionInfo.messagesReceived++;
      this.connectionInfo.lastActivity = new Date();
      if (typeof event.data === 'string') {
        this.connectionInfo.bytesReceived += event.data.length;
      }

      // Check for heartbeat response
      if (this.isHeartbeatResponse(data)) {
        this.emit('heartbeat', data);
        return;
      }

      // Check for response correlation
      if (data?.id && data.type === 'response') {
        this.emit(`response:${data.correlationId || data.id}`, data);
        return;
      }

      // Emit message event
      this.emit('message', data);
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
            connectionId: this.connectionId,
            messageType: 'response',
          },
        });
      };

      this.once(`response:${requestId}`, responseHandler);

      this.sendMessage(requestMessage).catch(reject);
    });
  }

  private queueMessage(message: string): void {
    this.messageQueue.push(message);

    // Limit queue size to prevent memory issues
    const maxSize = this.options.maxReconnectAttempts || 1000;
    if (this.messageQueue.length > maxSize) {
      this.messageQueue.shift();
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.isConnected) {
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

  private scheduleReconnect(): void {
    const delay = this.options.reconnectInterval! * 2 ** this.reconnectAttempts;
    this.reconnectTimer = setTimeout(async () => {
      this.reconnectAttempts++;
      this.emit('reconnecting', this.reconnectAttempts);
      this.emit('retry', this.reconnectAttempts); // UACL event

      try {
        await this.connect();
      } catch (error) {
        this.emit('reconnectError', error);
        if (this.reconnectAttempts < this.options.maxReconnectAttempts!) {
          this.scheduleReconnect();
        } else {
          this.emit('reconnectFailed');
        }
      }
    }, delay);
  }

  private startHeartbeat(): void {
    const interval = this.config.heartbeat?.interval || 30000;
    const message = this.config.heartbeat?.message || { type: 'ping' };

    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected && this.ws) {
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
    if (!this.isConnected) return -1;

    return new Promise((resolve) => {
      const startTime = Date.now();
      const pingId = this.generateMessageId();

      const pongHandler = (data: any) => {
        if (data.id === pingId) {
          const responseTime = Date.now() - startTime;
          this.off('message', pongHandler);
          this.connectionInfo.latency = responseTime;
          resolve(responseTime);
        }
      };

      this.on('message', pongHandler);
      this.send({ type: 'ping', id: pingId });

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
    return `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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

  private initializeConnectionInfo(): WebSocketConnectionInfo {
    return {
      id: this.connectionId,
      url: this.url,
      readyState: WebSocket.CLOSED,
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
    this.metrics.requestCount++;

    if (success) {
      this.metrics.successCount++;
    } else {
      this.metrics.errorCount++;
    }

    if (duration > 0) {
      const totalLatency = this.metrics.averageLatency * (this.metrics.requestCount - 1);
      this.metrics.averageLatency = (totalLatency + duration) / this.metrics.requestCount;
    }

    const uptime = (Date.now() - this.startTime) / 1000;
    this.metrics.throughput = this.metrics.requestCount / Math.max(uptime, 1);
  }

  private convertLegacyToUACL(url: string, options: WebSocketClientOptions): WebSocketClientConfig {
    return {
      name: `ws-client-${Date.now()}`,
      baseURL: url,
      url: url,
      timeout: options.timeout,
      reconnection: {
        enabled: options.reconnect || true,
        maxAttempts: options.maxReconnectAttempts || 10,
        initialDelay: options.reconnectInterval || 1000,
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
    };
  }

  private convertUACLToLegacy(config: WebSocketClientConfig): WebSocketClientOptions {
    return {
      reconnect: config.reconnection?.enabled || true,
      reconnectInterval: config.reconnection?.initialDelay || 1000,
      maxReconnectAttempts: config.reconnection?.maxAttempts || 10,
      timeout: config.timeout || 30000,
    };
  }
}

// Export for both patterns
export { EnhancedWebSocketClient as WebSocketClient }; // Legacy compatibility
export default EnhancedWebSocketClient;
