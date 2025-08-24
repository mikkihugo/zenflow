/**
 * @fileoverview Clean WebSocket Client Implementation for UACL
 * 
 * Enterprise-grade WebSocket client with full UACL compliance, providing:
 * - Real-time bidirectional communication
 * - Automatic reconnection with exponential backoff
 * - Message queuing for offline periods
 * - Subscription/publication model
 * - Comprehensive health monitoring
 * - Event-driven architecture
 */

import WebSocket from 'ws';
import { TypedEventBase, Logger, getLogger } from '@claude-zen/foundation';
import type {
  Client,
  ClientConfig,
  ClientResponse,
  ClientMetrics,
  HealthCheckResult
} from '../core/interfaces';

const logger: Logger = getLogger('websocket-client-new');

/**
 * WebSocket-specific configuration interface
 */
export interface WebSocketClientConfig extends ClientConfig {
  /** WebSocket connection URL */
  url: string;
  /** WebSocket subprotocols */
  protocols?: string[];
  /** Reconnection settings */
  reconnection?: {
    enabled: boolean;
    maxAttempts: number;
    initialDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
  };
  /** Message queue settings */
  messageQueue?: {
    enabled: boolean;
    maxSize: number;
    persistOnDisconnect: boolean;
  };
  /** Heartbeat/ping settings */
  heartbeat?: {
    enabled: boolean;
    interval: number;
    timeout: number;
  };
  /** Connection timeout */
  connectionTimeout?: number;
}

/**
 * WebSocket message structure
 */
export interface WebSocketMessage {
  id: string;
  type: 'request' | 'response' | 'subscribe' | 'unsubscribe' | 'publish' | 'ping' | 'pong';
  topic?: string;
  data?: any;
  timestamp: number;
  correlationId?: string;
}

/**
 * WebSocket subscription
 */
export interface WebSocketSubscription {
  id: string;
  topic: string;
  callback: (data: any) => void;
  created: Date;
  active: boolean;
}

/**
 * Clean WebSocket Client Implementation
 * 
 * Provides enterprise-grade WebSocket functionality with automatic reconnection,
 * message queuing, subscription management, and comprehensive monitoring.
 */
export class WebSocketClientNew extends TypedEventBase implements Client {
  public readonly config: WebSocketClientConfig;
  public readonly type = 'websocket';
  public readonly version = '2.0.0';

  private ws: WebSocket | null = null;
  private connectionState: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' = 'disconnected';
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private messageQueue: Array<{ message: WebSocketMessage; resolve: Function; reject: Function }> = [];
  private subscriptions = new Map<string, WebSocketSubscription>();
  private pendingResponses = new Map<string, { resolve: Function; reject: Function; timeout: NodeJS.Timeout }>();
  private metrics: ClientMetrics;
  private startTime = Date.now();
  private messageIdCounter = 0;

  constructor(config: WebSocketClientConfig) {
    super();
    this.config = { ...config };
    this.metrics = this.initializeMetrics();
  }

  get isConnected(): boolean {
    return this.connectionState === 'connected' && this.ws?.readyState === WebSocket.OPEN;
  }

  get isInitialized(): boolean {
    return this.ws !== null;
  }

  /**
   * Initialize the WebSocket client
   */
  async initialize(): Promise<void> {
    logger.info('Initializing WebSocket client', { url: this.config.url });
    // Initialization logic if needed
    this.emit('initialized', { timestamp: new Date() });
  }

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      logger.debug('WebSocket already connected');
      return;
    }

    if (this.connectionState === 'connecting') {
      logger.debug('WebSocket connection already in progress');
      return;
    }

    try {
      this.connectionState = 'connecting';
      this.emit('connecting', { attempt: this.reconnectAttempts });

      logger.info('Connecting to WebSocket', { url: this.config.url });

      this.ws = new WebSocket(this.config.url, this.config.protocols);
      this.setupWebSocketHandlers();

      // Wait for connection to open
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timeout'));
        }, this.config.connectionTimeout || 30000);

        this.ws!.once('open', () => {
          clearTimeout(timeout);
          resolve();
        });

        this.ws!.once('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });

      this.connectionState = 'connected';
      this.reconnectAttempts = 0;
      this.emit('connected', { timestamp: new Date() });

      // Start heartbeat if configured
      this.startHeartbeat();

      // Process any queued messages
      await this.processMessageQueue();

      logger.info('WebSocket connected successfully');

    } catch (error) {
      this.connectionState = 'disconnected';
      this.ws = null;
      logger.error('WebSocket connection failed', error);
      this.emit('error', error);
      
      // Attempt reconnection if configured
      if (this.shouldReconnect()) {
        this.scheduleReconnect();
      }
      
      throw error;
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  async disconnect(): Promise<void> {
    if (!this.ws) {
      return;
    }

    logger.info('Disconnecting WebSocket');
    
    this.connectionState = 'disconnected';
    this.stopHeartbeat();
    this.clearReconnectTimer();
    this.clearPendingResponses();
    
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.close(1000, 'Normal closure');
    }
    
    this.ws = null;
    this.emit('disconnected', { timestamp: new Date() });
  }

  /**
   * Send a GET-like request (for UACL compliance)
   */
  async get<T = any>(endpoint: string, config?: any): Promise<ClientResponse<T>> {
    const message: WebSocketMessage = {
      id: this.generateMessageId(),
      type: 'request',
      topic: endpoint,
      data: { method: 'GET', ...config },
      timestamp: Date.now()
    };

    return this.sendMessage<T>(message);
  }

  /**
   * Send a POST-like request (for UACL compliance)
   */
  async post<T = any>(endpoint: string, data?: any, config?: any): Promise<ClientResponse<T>> {
    const message: WebSocketMessage = {
      id: this.generateMessageId(),
      type: 'request',
      topic: endpoint,
      data: { method: 'POST', body: data, ...config },
      timestamp: Date.now()
    };

    return this.sendMessage<T>(message);
  }

  /**
   * Send a PUT-like request (for UACL compliance)
   */
  async put<T = any>(endpoint: string, data?: any, config?: any): Promise<ClientResponse<T>> {
    const message: WebSocketMessage = {
      id: this.generateMessageId(),
      type: 'request',
      topic: endpoint,
      data: { method: 'PUT', body: data, ...config },
      timestamp: Date.now()
    };

    return this.sendMessage<T>(message);
  }

  /**
   * Send a DELETE-like request (for UACL compliance)
   */
  async delete<T = any>(endpoint: string, config?: any): Promise<ClientResponse<T>> {
    const message: WebSocketMessage = {
      id: this.generateMessageId(),
      type: 'request',
      topic: endpoint,
      data: { method: 'DELETE', ...config },
      timestamp: Date.now()
    };

    return this.sendMessage<T>(message);
  }

  /**
   * Send a PATCH-like request (for UACL compliance)
   */
  async patch<T = any>(endpoint: string, data?: any, config?: any): Promise<ClientResponse<T>> {
    const message: WebSocketMessage = {
      id: this.generateMessageId(),
      type: 'request',
      topic: endpoint,
      data: { method: 'PATCH', body: data, ...config },
      timestamp: Date.now()
    };

    return this.sendMessage<T>(message);
  }

  /**
   * Send a HEAD-like request (for UACL compliance)
   */
  async head(endpoint: string, config?: any): Promise<ClientResponse> {
    const message: WebSocketMessage = {
      id: this.generateMessageId(),
      type: 'request',
      topic: endpoint,
      data: { method: 'HEAD', ...config },
      timestamp: Date.now()
    };

    return this.sendMessage(message);
  }

  /**
   * Send an OPTIONS-like request (for UACL compliance)
   */
  async options(endpoint: string, config?: any): Promise<ClientResponse> {
    const message: WebSocketMessage = {
      id: this.generateMessageId(),
      type: 'request',
      topic: endpoint,
      data: { method: 'OPTIONS', ...config },
      timestamp: Date.now()
    };

    return this.sendMessage(message);
  }

  /**
   * Subscribe to a topic for real-time updates
   */
  async subscribe(topic: string, callback: (data: any) => void): Promise<string> {
    const subscriptionId = this.generateMessageId();
    
    const subscription: WebSocketSubscription = {
      id: subscriptionId,
      topic,
      callback,
      created: new Date(),
      active: true
    };

    this.subscriptions.set(subscriptionId, subscription);

    if (this.isConnected) {
      const message: WebSocketMessage = {
        id: this.generateMessageId(),
        type: 'subscribe',
        topic,
        data: { subscriptionId },
        timestamp: Date.now()
      };

      await this.sendRawMessage(message);
    }

    logger.debug('Subscribed to topic', { topic, subscriptionId });
    return subscriptionId;
  }

  /**
   * Unsubscribe from a topic
   */
  async unsubscribe(subscriptionId: string): Promise<void> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error(`Subscription ${subscriptionId} not found`);
    }

    if (this.isConnected) {
      const message: WebSocketMessage = {
        id: this.generateMessageId(),
        type: 'unsubscribe',
        topic: subscription.topic,
        data: { subscriptionId },
        timestamp: Date.now()
      };

      await this.sendRawMessage(message);
    }

    this.subscriptions.delete(subscriptionId);
    logger.debug('Unsubscribed from topic', { topic: subscription.topic, subscriptionId });
  }

  /**
   * Publish data to a topic
   */
  async publish(topic: string, data: any): Promise<void> {
    const message: WebSocketMessage = {
      id: this.generateMessageId(),
      type: 'publish',
      topic,
      data,
      timestamp: Date.now()
    };

    await this.sendRawMessage(message);
    logger.debug('Published to topic', { topic });
  }

  /**
   * Perform health check
   */
  async healthCheck(): Promise<HealthCheckResult> {
    const timestamp = new Date();
    const startTime = Date.now();

    try {
      if (!this.isConnected) {
        return {
          status: 'unhealthy',
          timestamp,
          responseTime: Date.now() - startTime,
          components: {
            connection: { status: 'unhealthy', message: 'Not connected' }
          }
        };
      }

      // Send ping
      const pingMessage: WebSocketMessage = {
        id: this.generateMessageId(),
        type: 'ping',
        timestamp: Date.now()
      };

      await this.sendRawMessage(pingMessage);

      return {
        status: 'healthy',
        timestamp,
        responseTime: Date.now() - startTime,
        components: {
          connection: { status: 'healthy', responseTime: Date.now() - startTime }
        }
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp,
        responseTime: Date.now() - startTime,
        components: {
          connection: { status: 'unhealthy', message: error instanceof Error ? error.message : 'Unknown error' }
        }
      };
    }
  }

  /**
   * Get client metrics
   */
  async getMetrics(): Promise<ClientMetrics> {
    this.metrics.uptime = Date.now() - this.startTime;
    this.metrics.concurrentOperations = this.pendingResponses.size;
    return { ...this.metrics };
  }

  /**
   * Reset client metrics
   */
  resetMetrics(): void {
    this.metrics = this.initializeMetrics();
  }

  /**
   * Configure the client
   */
  configure(config: Partial<WebSocketClientConfig>): void {
    Object.assign(this.config, config);
    logger.info('WebSocket client reconfigured');
  }

  /**
   * Shutdown the client
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down WebSocket client');
    await this.disconnect();
    this.clearAllSubscriptions();
    this.emit('shutdown', { timestamp: new Date() });
  }

  // Private helper methods

  private setupWebSocketHandlers(): void {
    if (!this.ws) return;

    this.ws.on('open', () => {
      logger.debug('WebSocket opened');
    });

    this.ws.on('message', (data) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        this.handleIncomingMessage(message);
      } catch (error) {
        logger.error('Failed to parse WebSocket message', error);
        this.emit('message', data.toString());
      }
    });

    this.ws.on('close', (code, reason) => {
      logger.info('WebSocket closed', { code, reason: reason.toString() });
      this.connectionState = 'disconnected';
      this.emit('disconnected', { code, reason: reason.toString() });

      if (this.shouldReconnect()) {
        this.scheduleReconnect();
      }
    });

    this.ws.on('error', (error) => {
      logger.error('WebSocket error', error);
      this.emit('error', error);
    });

    this.ws.on('ping', (data) => {
      this.ws?.pong(data);
    });
  }

  private handleIncomingMessage(message: WebSocketMessage): void {
    this.metrics.totalOperations++;

    switch (message.type) {
      case 'response':
        this.handleResponse(message);
        break;
      case 'publish':
        this.handlePublish(message);
        break;
      case 'pong':
        this.emit('pong', message);
        break;
      default:
        this.emit('message', message);
    }
  }

  private handleResponse(message: WebSocketMessage): void {
    const pending = this.pendingResponses.get(message.id);
    if (pending) {
      clearTimeout(pending.timeout);
      this.pendingResponses.delete(message.id);
      
      const response: ClientResponse = {
        data: message.data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
        duration: Date.now() - message.timestamp,
        metadata: {
          messageId: message.id,
          timestamp: new Date(message.timestamp).toISOString()
        }
      };
      
      pending.resolve(response);
      this.metrics.successfulOperations++;
    }
  }

  private handlePublish(message: WebSocketMessage): void {
    if (message.topic) {
      for (const subscription of this.subscriptions.values()) {
        if (subscription.topic === message.topic && subscription.active) {
          try {
            subscription.callback(message.data);
          } catch (error) {
            logger.error('Subscription callback error', error);
          }
        }
      }
    }
  }

  private async sendMessage<T = any>(message: WebSocketMessage): Promise<ClientResponse<T>> {
    const startTime = Date.now();
    
    if (!this.isConnected) {
      if (this.config.messageQueue?.enabled) {
        return this.queueMessage<T>(message);
      } else {
        throw new Error('WebSocket is not connected');
      }
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingResponses.delete(message.id);
        reject(new Error('Message timeout'));
        this.metrics.failedOperations++;
      }, this.config.timeout?.request || 30000);

      this.pendingResponses.set(message.id, { resolve, reject, timeout });
      
      try {
        this.ws!.send(JSON.stringify(message));
        this.updateLatencyMetrics(Date.now() - startTime);
      } catch (error) {
        clearTimeout(timeout);
        this.pendingResponses.delete(message.id);
        reject(error);
        this.metrics.failedOperations++;
      }
    });
  }

  private async sendRawMessage(message: WebSocketMessage): Promise<void> {
    if (!this.isConnected) {
      throw new Error('WebSocket is not connected');
    }

    this.ws!.send(JSON.stringify(message));
  }

  private queueMessage<T = any>(message: WebSocketMessage): Promise<ClientResponse<T>> {
    return new Promise((resolve, reject) => {
      const maxSize = this.config.messageQueue?.maxSize || 1000;
      if (this.messageQueue.length >= maxSize) {
        reject(new Error('Message queue is full'));
        return;
      }

      this.messageQueue.push({ message, resolve, reject });
    });
  }

  private async processMessageQueue(): Promise<void> {
    while (this.messageQueue.length > 0 && this.isConnected) {
      const queued = this.messageQueue.shift()!;
      try {
        const result = await this.sendMessage(queued.message);
        queued.resolve(result);
      } catch (error) {
        queued.reject(error);
      }
    }
  }

  private shouldReconnect(): boolean {
    const reconnectConfig = this.config.reconnection;
    return reconnectConfig?.enabled === true && 
           this.reconnectAttempts < (reconnectConfig.maxAttempts || 5);
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.connectionState = 'reconnecting';
    const delay = this.calculateReconnectDelay();
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.emit('reconnecting', { attempt: this.reconnectAttempts });
      this.connect().catch(error => {
        logger.error('Reconnection failed', error);
      });
    }, delay);
  }

  private calculateReconnectDelay(): number {
    const config = this.config.reconnection!;
    const baseDelay = config.initialDelay || 1000;
    const maxDelay = config.maxDelay || 30000;
    const multiplier = config.backoffMultiplier || 2;
    
    const delay = Math.min(baseDelay * Math.pow(multiplier, this.reconnectAttempts), maxDelay);
    return delay + (Math.random() * 1000); // Add jitter
  }

  private startHeartbeat(): void {
    const heartbeatConfig = this.config.heartbeat;
    if (!heartbeatConfig?.enabled) return;

    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        const pingMessage: WebSocketMessage = {
          id: this.generateMessageId(),
          type: 'ping',
          timestamp: Date.now()
        };
        
        this.sendRawMessage(pingMessage).catch(error => {
          logger.error('Heartbeat ping failed', error);
        });
      }
    }, heartbeatConfig.interval || 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private clearPendingResponses(): void {
    for (const [id, pending] of this.pendingResponses) {
      clearTimeout(pending.timeout);
      pending.reject(new Error('Connection closed'));
    }
    this.pendingResponses.clear();
  }

  private clearAllSubscriptions(): void {
    this.subscriptions.clear();
  }

  private generateMessageId(): string {
    return `ws-${Date.now()}-${++this.messageIdCounter}`;
  }

  private initializeMetrics(): ClientMetrics {
    return {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      cacheHitRatio: 0,
      averageLatency: 0,
      throughput: 0,
      concurrentOperations: 0,
      uptime: 0
    };
  }

  private updateLatencyMetrics(latency: number): void {
    const total = this.metrics.totalOperations;
    this.metrics.averageLatency = (this.metrics.averageLatency * (total - 1) + latency) / total;
  }
}

export default WebSocketClientNew;