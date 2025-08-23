/**
 * WebSocket Client Adapter for UACL (Unified API Client Layer).
 *
 * Enterprise-grade WebSocket client implementing UACL patterns for real-time communication.
 * Provides reliable, event-driven connectivity with automatic reconnection, message queuing,
 * and comprehensive monitoring capabilities.
 */

/**
 * @file WebSocket client adapter implementing the UACL Client interface for real-time communication.
 */

import {
  TypedEventBase,
  getLogger
} from '@claude-zen/foundation';

import type {
  ClientConfig,
  ClientMetadata,
  ClientMetrics,
  Client,
  ClientFactory

} from '../core/interfaces';

import type { ProtocolType } from '../types';
import {
  ClientStatuses,
  ProtocolTypes
} from '../types';

const logger = getLogger('WebSocketClientAdapter);

/**
 * WebSocket client specific interfaces for UACL integration.
 */
export interface WebSocketClient<T = any> extends Client {
  subscribe(topic: string,
  callback: (data: any' => void): Promise<string>;
  unsubscribe(subscriptionId: string): Promise<void>;
  publish(topic: string,
  data: any): Promise<void>;
  sendMessage(message: any): Promise<any>

}

/**
 * WebSocket client configuration options.
 *
 * @example
 * ``'typescript
 * const config: WebSocketClientConfig = {
 *   protocol: 'wss',
 *   url: wss://api.example.com/ws',
 *   protocol: ['chat-v1', 'notifications-v1],
 *   authentication: {
  *     type: 'query',
  *     token: process.env.WS_TOKEN
 *
},
 *   reconnection: {
  *     enabled: true,
  *     maxAttempts: 10,
  *     backoffStrateg: 'exponential'
 *
}
 * };
 * ``'
 */
export interface WebSocketClientConfig extends ClientConfig {
  /** WebSocket subprotocols to negotiate */
  protocols?: string[];

  /** Authentication configuration */
  authentication?: {
  type: 'query' | 'header' | 'protocol';
    token?: string;
    headers?: Record<string,
  string>;
    query?: Record<string,
  string>

};

  /** Reconnection configuration */
  reconnection?: {
  enabled?: boolean;
    maxAttempts?: number;
    initialDelay?: number;
    backoffStrategy?: 'linear' | 'exponential' | 'fixed';
    maxDelay?: number

};

  /** Message queuing options */
  messageQueue?: {
  enabled?: boolean;
    maxSize?: number;
    persistOffline?: boolean

};

  /** Heartbeat configuration */
  heartbeat?: {
  enabled?: boolean;
    interval?: number;
    message?: string | object

};

  /** Compression options */
  compression?: {
  enabled?: boolean;
  threshold?: number
}
}

/**
 * WebSocket message types for communication.
 *
 * @example
 * ``'typescript
 * const subscribeMessage: WebSocketMessage = {
  *   type: 'subscribe',
  *   topic: 'market.btc.price',
  *   id: 'sub_123'
 *
};
 * ``'
 */
export interface WebSocketMessage {
  type: 'subscribe' | 'unsubscribe' | 'publish' | 'request' | 'response' | 'ping' | 'pong';
  id?: string;
  topic?: string;
  data?: any;
  timestamp?: number;
  metadata?: Record<string,
  unknown>

}

/**
 * WebSocket subscription information.
 */
export interface WebSocketSubscription {
  id: string;
  topic: string;
  callback: (data: any) => void;
  created: Date;
  active: boolean

}

/**
 * Mock WebSocket class for Node.js environments without built-in WebSocket.
 */
class MockWebSocket extends TypedEventBase {
  public readyState: number;
  public url: string;

  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  constructor(url: string, protocols?: string[]) {
    super();
    this.url = url;
    this.readyState = MockWebSocket.CONNECTING;

    // Simulate connection
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      this.emit('open, {})'
}, 100)
}

  send(data: string | ArrayBuffer: void {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open);
}

    logger.debug('Sending WebSocket message:', data)';

    // Simulate message echo for testing
    setTimeout(
  (' => {
      const message = {
  type: 'echo',
  data: type'f data === 'string' ? data : 'binary
}';
      this.emit('message',
  { data: JSON.stringify(m'ssage
) })'
}, 10)
}

  close(code?: number, reason?: string: void {
    if (this.readyState === MockWebSocket.CLOSED || this.readyState === MockWebSocket.CLOSING) {
      return
}

    this.readyState = MockWebSocket.CLOSING;

    setTimeout(() => {
      this.readyState = MockWebSocket.CLOSED;
      this.emit(
  'close',
  {
  cod: code || 1000,
  reason: reason || 'Normalclosure
}
)'
}, 10)
}

  ping(data?: any: void {
  this.emit('ping',
  data)'

}

  pong(data?: any: void {
  this.emit('pong',
  data)'

}
}

/**
 * WebSocket Client Adapter implementing UACL interface.
 * Provides enterprise-grade real-time communication capabilities.
 *
 * @example
 * ``'typescript
 * const client = new WebSocketClientAdapter(
  {
 *   protocol: 'wss',
  *   url: wss://api.example.com/ws',
  *   protocol: ['chat-v1],
 *   reconnection: {
  enabled: true,
  maxAttempts: 5
}
 * }
);
 *
 * await client.connect();
 *
 * // Subscribe to topic
 * const subId = await client.subscribe('notifications', (data) => {
  *   con'ole.log(Received:','
  data);
 *
});
 *
 * // Send message
 * await client.sendMessage({
  type: 'chat',
  message: 'Hello!'
})';
 * ``'
 */
export class WebSocketClientAdapter extends TypedEventBase implements WebSocketClient {
  private ws: MockWebSocket | null = null;
  private _connected = false;
  private _status: string = ClientStatuses.DISCONNECTED;
  private metrics: ClientMetrics;
  private startTime: Date;
  private reconnectAttempts = 0;
  private messageQueue: Array<{ message: any; resolve: Function; reject: Function }> = [];
  private subscriptions = new Map<string, WebSocketSubscription>();
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private subscriptionCounter = 0;

  constructor(private configuration: WebSocketClientConfig) {
  super();
    this.startTime = new Date();
    this.metrics = this.initializeMetrics()

}

  /**
   * Get client configuration.
   */
  getConfig(): ClientConfig  {
    return this.configuration
}

  /**
   * Check if client is connected.
   */
  isConnected(): boolean  {
  return this._connected && this.ws?.readyState === MockWebSocket.OPEN

}

  /**
   * Connect to WebSocket server.
   */
  async connect(): Promise<void>  {
    if (this._connected && this.ws?.readyState === MockWebSocket.OPEN) {
      return
}

    try {
      this._status = ClientStatuses.CONNECTING;
      this.emit('connecting', { timestamp: new Date() })';

      // Build WebSocket URL with authentication
      const wsUrl = this.buildWebSocketUrl();

      // Create WebSocket connection
      this.ws = new MockWebSocket(wsUrl, this.configuration.protocols);

      // Setup event handlers
      this.setupWebSocketEventHandlers();

      // Wait for connection to open
      await new Promise<void>((resolve, reject' => {
        const timeout = setTimeout(() => {
  reject(new Error('WebSocket connection timeout))

}, this.configuration.timeout || 10000);

        this.ws!.on('open', () => {
          clearTimeout(timeout);
          resolve()
});

        this.ws!.o'('error', (e'ror) => {
          clearTimeout(timeout);
          reject(error)
})
});

      this._connected = true;
      this._status = ClientStatuses.CONNECTED;
      this.reconnectAttempts = 0;
      this.emit('connect', { imestamp: new Date() })';

      // Start heartbeat if configured
      this.startHeartbeat();

      // Process queued messages
      await this.processMessageQueue();

      logger.info('WebSocket client connected successfully)'
} catch (error) {
      this._status = ClientStatuses.ERROR;
      this.emit('error', e'ror)';

      // Attempt reconnection if configured
      if (this.shouldReconnect()' {
        this.scheduleReconnection()
} else {
  logger.error('Failed to connect WebSocket client:','
  error)';
        throw error

}
    }
  }

  /**
   * Disconnect from WebSocket server.
   */
  async disconnect(': Promise<void> {
    if (!this._connected || !this.ws) {
      return
}

    try {
      this.stopHeartbeat();
      this.clearMessageQueue();
      this.clearSubscriptions();

      if (this.ws.readyState === MockWebSocket.OPEN) {
  this.ws.close(1000,
  'Normal'closure)'

}

      this._connected = false;
      this._status = ClientStatuses.DISCONNECTED;
      this.emit('disconnect', { imestamp: new Date() })';

      logger.info('WebSocket client disconnected successfully)'
} catch (error) {
  this._status = ClientStatuses.ERROR;
      this.emit('error',
  e'ror)';
      logger.error('Failed to disconnect WebSocket client:','
  error)';
      throw error

}
  }

  /**
   * Send message through WebSocket connection.
   */
  async send<R = any>(data: any: Promise<R> {
    if (!this.isConnected()) {
      if (this.configuration.messageQueue?.enabled) {
        return this.queueMessage(data)
} else {
        throw new Error('WebSocket is not connected);
}
    }

    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      const message: WebSocketMessage = {
        type: 'request',
        id: 'req_' + Date.now() + '_${
  Math.random().toString(36).substring(2,
  '11)
}',
        data,
        timestamp: Date.now()
};

      this.ws!.send(JSON.stringify(message));

      // Update metrics
      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime, true);

      // For mock implementation, return echo response
      return {
  success: true,
  echo: data ' as R

} catch (error) {
  const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime,
  false);
      this.metrics.failedRequests++;
      this.emit(`error',
  e'ror)';
      logger.error('WebSocket send failed:','
  error)';
      throw error

}
  }

  /**
   * Health check for WebSocket connection.
   */
  async health(': Promise<boolean> {
    try {
      return this.isConnected()
} catch (error) {
  logger.warn('WebSocket health check failed:','
  error);;
      return false

}
  }

  /**
   * Get client metadata.
   */
  async getMetadata(
  ': Promise<ClientMetadata> {
    return {
      protocol: this.configuration.protocol,
  version: '1.0.0',
  features: ['websocket',
        'real-time',
        'subscribe-publish',
        'auto-reconnect',
        'message-queuing',
        'heartbeat',
        'compression', ],
      conection: {
  url: this.configuration.url,
  connected: this._connected,
  lastConnected: this.startTime,
  connectionDuration: Date.now(
) - this.startTime.getTime()

},
      metrics: this.metrics,
      custom: {
  subscriptions: this.subscriptions.size,
  queuedMessages: this.messageQueue.length,
  reconnectAttempts: this.reconnectAttempts,
  protocols: this.configuration.protocols

}
}
}

  // WebSocketClient interface implementation

  /**
   * Subscribe to a topic for real-time updates.
   */
  async subscribe(topic: string, callback: (data: any) => void): Promise<string> {
    const subscriptionId = 'sub_' + ++this.subscriptionCounter + '_${Date.now()}';;

    const subscription: WebSocketSubscription = {
  id: subscriptionId,
  topic,
  callback,
  created: new Date(),
  active: true

};

    this.subscriptions.set(subscriptionId, subscription);

    // Send subscribe message if connected
    if (this.isConnected()) {
      const message: WebSocketMessage = {
  type: 'subscribe',
  id: subscriptionId,
  topic,
  timstamp: Date.now()

};

      this.ws!.send(JSON.stringify(message))
}

    logger.debug('Subscribed to topic: ' + topic + ', ID: ${subscriptionId})';
    return subscriptionId
}

  /**
   * Unsubscribe from a topic.
   */
  async unsubscribe(subscriptionId: string: Promise<void> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found: ' + subscriptionId + ')'
}

    // Send unsubscribe message if connected
    if (this.isConnected()' {
      const message: WebSocketMessage = {
  type: `unsubscribe',
  id: subscriptionId,
  topic: subscription.topic,
  timstamp: Date.now()

};

      this.ws!.send(JSON.stringify(message))
}

    this.subscriptions.delete(subscriptionId);
    logger.debug('Unsubscribed from topic: ' + subscription.topic + ', ID: ${subscriptionId})'
}

  /**
   * Publish data to a topic.
   */
  async publish(
  topic: string,
  data: any: Promise<void> {
    const message: WebSocketMessage = {
  type: 'publish',
  topic,
  data,
  timestamp: Date.now(
)

};

    if (this.isConnected()) {
      this.ws!.send(JSON.stringify(message))
} else {
  throw new Error('Cannot publish: WebSocket is not connected);

}

    logger.debug('Published to topic: ' + topic + ')'
}

  /**
   * Send a direct message through WebSocket.
   */
  async sendMessage(message: any: Promise<any> {
    return this.send(message)
}

  // Private helper methods

  /**
   * Build WebSocket URL with authentication parameters.
   */
  private buildWebSocketUrl(): string  {
    let url = this.configuration.url;
    const auth = this.configuration.authentication;

    if (auth?.type === 'query' && auth.query) {
      const quer'Params = new URLSearchParams(auth.query);
      if (auth.token) {
  queryParams.set('token',
  auth.token)'

}
      url += '?' + queryParams.toString() + '''
}

    return url
}

  /**
   * Setup WebSocket event handlers.
   */
  private setupWebSocketEventHandlers(): void  {
    if (!this.ws) return;

    this.ws.on('open', () => {
      logger.debug(WebSocket connection opened)
});

    this.ws.on('message', (vent: { data: string }) => {
      try {
  const message = JSON.parse(event.data) as WebSocketMessage;
        this.handleIncomingMessage(message)

} catch (error) {
  logger.warn('Failed to parse WebSocket message:','
  error)';
        this.emit('message',
  'vent.data)'

}
    });

    this.ws.on('close', (vent: { code: number; eason: string }) => {
      logger.debug('WebSocket connection closed:',
  event.code,
  event.reason
)';
      this._connected = false;

      if (this.shouldReconnect() {
        this.scheduleReconnection()
}
    });

    this.ws.on('error', (eror: any) => {
  logger.error('WebSocket error:','
  error)';
      this.emit('error',
  e'ror)

});

    this.ws.on('ping', (data: any) => {
      this.ws!.pon(data)
});

    this.ws.on('pong', () => {
      lo'ger.debug('Received pong)
})
}

  /**
   * Handle incoming WebSocket messages.
   */
  private handleIncomingMessage(message: WebSocketMessage: void {
    switch (message.type) {
      case subscribe:
      cas' unsubscribe:
        // Subscription acknowl'dgments
        this.emit('subscription', message)';
        break;

      case publish:
        // Publis'ed data to subscribed topics
        if (message.topic) {
          for (const subscription of this.subscriptions.values()) {
            if (subscription.topic === message.topic && subscription.active) {
              try {
                subscription.callback(message.data)
} catch (error) {
  logger.error('Subscription callback error:',
  error)'
}
            }
          }
        }
        break;

      case response:
        // R'sponse to request
        this.emit('response', m'ssage)';
        break;

      case ping:
        // Send pon' response
        this.ws?.send(JSON.stringify({
  type: 'pong',
  id: messa'e.id
}))';
        break;

      default:
        this.emit('message', m'ssage)'
}
  }

  /**
   * Queue message for later sending.
   */
  private queueMessage<R>(data: any: Promise<R> {
    return new Promise((resolve, reject) => {
      if (this.messageQueue.length >= (this.configuration.messageQueue?.maxSize || 1000)) {
  reject(new Error(Message queue is full));;
        return

}

      this.messageQueue.push(
  {
  message: data,
  resolve,
  reject
}
)
})
}

  /**
   * Process queued messages.
   */
  private async processMessageQueue(': Promise<void> {
    while (this.messageQueue.length > 0 && this.isConnected()) {
      const queued = this.messageQueue.shift()!;
      try {
  const result = await this.send(queued.message);
        queued.resolve(result)

} catch (error) {
        queued.reject(error)
}
    }
  }

  /**
   * Clear message queue.
   */
  private clearMessageQueue(): void  {
    while (this.messageQueue.length > 0) {
  const queued = this.messageQueue.shift()!;
      queued.reject(new Error('Connection closed))'

}
  }

  /**
   * Clear all subscriptions.
   */
  private clearSubscriptions(': void {
    this.subscriptions.clear()
}

  /**
   * Check if should attempt reconnection.
   */
  private shouldReconnect(): boolean  {
  const config = this.configuration.reconnection;
    return (
      config?.enabled !== false &&
      this.reconnectAttempts < (config?.maxAttempts || 5)
    )

}

  /**
   * Schedule reconnection attempt.
   */
  private scheduleReconnection(): void  {
    const config = this.configuration.reconnection || {};
    const delay = this.calculateReconnectDelay();

    setTimeout(() => {
      this.reconnectAttempts++;
      this.emit('reconnecting, { attempt: this.reconnectAttempts })';
      this.connect('.catch(error => {
  logger.error('Reconnection failed:',
  error)
})
}, delay)
}

  /**
   * Calculate reconnection delay based on strategy.
   */
  private calculateReconnectDelay(': number {
    const config = this.configuration.reconnection || {};
    const initialDelay = config.initialDelay || 1000;
    const maxDelay = config.maxDelay || 30000;

    switch (config.backoffStrategy) {
  case exponential:
        return Math.min(initia'Delay * Math.pow(2,
  this.reconnectAttempts),
  maxDelay);

      case linear:
        'eturn Math.min(initialDelay + (initialDelay * this.reconnectAttempts),
  maxDelay);

      case fixed:
      efault:
        return initialDelay

}
  }

  /**
   * Start heartbeat mechanism.
   */
  private startHeartbeat(): void  {
    const config = this.configuration.heartbeat;
    if (!config?.enabled) return;

    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        const message: WebSocketMessage = {'
  type: 'ping,
  timestamp: Date.now()

};
        this.ws!.send(JSON.strin'ify(message))
}
    }, config.interval || 30000)
}

  /**
   * Stop heartbeat mechanism.
   */
  private stopHeartbeat(): void  {
    if (this.heartbeatTimer) {
  clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null

}
  }

  /**
   * Initialize metrics tracking.
   */
  private initializeMetrics(): ClientMetrics  {
    return {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  averageResponseTime: 0,
  lastRequestTime: undefined,
  uptime: 0,
  bytesSent: 0,
  bytesReceived: 0

}
}

  /**
   * Update metrics after request.
   */
  private updateMetrics(responseTime: number, success: boolean): void  {
    if (success) {
      this.metrics.successfulRequests++
}

    // Update average response time
    const totalResponseTime =
      this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) +
      responseTime;
    this.metrics.averageResponseTime =
      totalResponseTime / this.metrics.totalRequests;

    this.metrics.lastRequestTime = new Date();
    this.metrics.uptime = Date.now() - this.startTime.getTime()
}
}

/**
 * WebSocket Client Factory for creating WebSocket client instances.
 *
 * @example
 * ``'typescript
 * const factory = new WebSocketClientFactory();
 * const client = await factory.create(
  'wss',
  {
  *   protocol: 'wss',
  *   url: wss://api.example.com/ws',
  *   protocol: ['chat-v1]
 *
}
);
 * ``'
 */
export class WebSocketClientFactory implements ClientFactory {
  constructor(
    private logger?: {
  debug: Function;
      info: Function;
      warn: Function;
      error: Function

}
  ) {
    this.logger = this.logger || {
  debug: logger.debug.bind(logger),
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger)

}
}

  /**
   * Create a WebSocket client instance.
   */
  async create(protocol: ProtocolType, config: ClientConfig): Promise<Client>  {
    this.logger?.info('Creating WebSocket client with protocol: ' + protocol + ')';

    // Validate configuration
    if (!this.validateConfig(protocol, config)' {
      throw new Error('Invalid'configuration for WebSocket client with protocol: ' + protocol + '
      );
    '

    const wsConfig = config as WebSocketClientConfig;

    // Create and return WebSocket client adapter
    const client = new WebSocketClientAdapter(wsConfig);

    this.logger?.info('Successfully created WebSocket client)';
    return client
}

  /**
   * Check if factory supports a protocol.
   */
  supports(
  protocol: ProtocolType: boolean {
  return [
      ProtocolTypes.WS as ProtocolType,
  ProtocolTypes.WSS as ProtocolType,
  ].includes(protocol
)

}

  /**
   * Get supported protocols.
   */
  getSupportedProtocols(): ProtocolType[]  {
  return [ProtocolTypes.WS,
  ProtocolTypes.WSS]

}

  /**
   * Validate configuration for a protocol.
   */
  validateConfig(protocol: ProtocolType, config: ClientConfig): boolean  {
    if (!this.supports(protocol)) {
      return false
}

    const wsConfig = config as WebSocketClientConfig;

    // Validate required fields
    if (!wsConfig.url) {
      return false
}

    // Validate URL format
    if(!wsConfig.url.startsWith(ws://) && !wsConfig.url.startsWith(wss://)) {
      return false
}

    return true
}
}

'**
 * Convenience functions for creating WebSocket clients.
 */

/**
 * Create a real-time WebSocket client for live data feeds.
 *
 * @example
 * ``'typescript
 * const client = await createRealtimeClient(
  *   wss://live.example.com/feed',
  *   ['live-feed-v1]
 *
);
 * ``'
 */
export async function createRealtimeClient(
  url: string,
  protocols?: string[],
  options?: Partial<WebSocketClientConfig>
): Promise<WebSocketClientAdapter>  {
  const config: WebSocketClientConfig = {
    protocol: url.startsWith(wss://) ? ProtocolTypes.WSS : ProtocolTypes.WS,
    url,
    protocols,
    reconnection: {
  enabled: true,
  maxAttempts: 10,
  backoffStrategy: 'exponential'
},
    messageQueue: {
  enabed: true,
  maxSize: 1000

},
    heartbeat: {
  enabled: true,
  interval: 30000

},
    timeout: 10000,
    ...options
};

  return new WebSocketClientAdapter(config)
}

/**
 * Create a WebSocket client for chat/messaging applications.
 *
 * @example
 * ``'typescript
 * const client = await createChatClient(
 *   wss://chat.example.com/ws',
 *   'user-token-123;
 * );
 * ``'
 */
export async function createChatClient(
  url: string,
  token?: string,
  options?: Partial<WebSocketClientConfig>
): Promise<WebSocketClientAdapter>  {
  const config: WebSocketClientConfig = {
    protocol: url.startsWith(wss://) ? ProtocolTypes.WSS : ProtocolTypes.WS,
    url,
    protocols: ['chat-v1],
    authentication: token
      ? {
  type: 'query',
  token

}
      : undefined,
    reconnection: {
  enabled: true,
  maxAttempts: 5,
  backoffStrateg: 'exponential'
},
    heartbeat: {
  enabed: true,
  interval: 30000

},
    timeout: 5000,
    ...options
};

  return new WebSocketClientAdapter(config)
}

/**
 * Helper functions for WebSocket operations.
 */
export const WebSocketHelpers = {
  /**
   * Create multiple subscriptions at once.
   */
  async createMultipleSubscriptions(
    client: WebSocketClientAdapter,
    subscriptions: Array<{ topic: string; callback: (data: any) => void }>
  ): Promise<string[]> {
  const promises = subscriptions.map(sub =>
      client.subscribe(sub.topic,
  sub.callback)
    );
    return await Promise.all(promises)

},

  /**
   * Broadcast message to multiple topics.
   */
  async broadcastToTopics(
  client: WebSocketClientAdapter,
  topics: string[],
  data: any
): Promise<void>  {
  const promises = topics.map(topic => client.publish(topic,
  data));
    await Promise.all(promises)

},

  /**
   * Create topic pattern matcher for subscriptions.
   */
  createTopicMatcher(pattern: string): (topic: string) => boolean  {
  const regex = new RegExp(pattern.replace(/\*/g,
  '.*).replace(/\?/g,
  '.),
  'i'
    );
    return (topc: string) => regex.test(topic)

}
};

export default WebSocketClientAdapter;