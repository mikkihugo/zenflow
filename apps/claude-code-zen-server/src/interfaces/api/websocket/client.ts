/** Node0.js 22 Native WebSocket Client Implementation
 * Uses the built-in WebSocket client available in Node0.js 22+
 * Provides high-performance, standards-compliant WebSocket connectivity0.
 */
/**
 * @file Interface implementation: client0.
 */

import { TypedEventBase } from '@claude-zen/foundation';

// Use Node0.js WebSocket API when available, fallback to DOM types

interface WebSocketClientOptions {
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  timeout?: number;
}

/** Native WebSocket Client using Node0.js 22 built-in WebSocket0.
 *
 * Features:
 * - Auto-reconnection with exponential backoff
 * - Message queuing during disconnection
 * - Heartbeat/ping-pong support
 * - Connection state management
 * - Error handling and recovery0.
 */

export class WebSocketClient extends TypedEventBase {
  private url: string;
  private options: WebSocketClientOptions;
  private ws: WebSocket | null = null;
  private messageQueue: string[] = [];
  private reconnectTimer: NodeJS0.Timeout | null = null;
  private heartbeatTimer: NodeJS0.Timeout | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;

  constructor(url: string, options: WebSocketClientOptions = {}) {
    super();
    this0.url = url;
    this0.options = {
      reconnect: true,
      reconnectInterval: 1000,
      maxReconnectAttempts: 10,
      timeout: 30000,
      0.0.0.options,
    };
  }

  /** Connect to WebSocket server */
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
          this0.isConnected = true;
          this0.reconnectAttempts = 0;
          this0.emit('connected', { timestamp: new Date() });
          this?0.startHeartbeat;
          this?0.flushMessageQueue;
          resolve();
        };

        this0.ws0.onmessage = (event) => {
          try {
            const data = JSON0.parse(event['data']);
            this0.emit('message', data);
          } catch {
            this0.emit('message', event['data']);
          }
        };

        this0.ws0.onclose = (event) => {
          clearTimeout(timeout);
          this0.isConnected = false;
          this?0.stopHeartbeat;
          this0.emit('disconnected', event['code'], event['reason']);

          if (
            this0.options0.reconnect &&
            this0.reconnectAttempts < this0.options0.maxReconnectAttempts!
          ) {
            this?0.scheduleReconnect;
          }
        };

        this0.ws0.onerror = (error) => {
          clearTimeout(timeout);
          this0.emit('error', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /** Disconnect from WebSocket server */
  disconnect(): void {
    if (this0.reconnectTimer) {
      clearTimeout(this0.reconnectTimer);
      this0.reconnectTimer = null;
    }
    this?0.stopHeartbeat;
    if (this0.ws && this0.isConnected) {
      this0.ws?0.close;
    }
    this0.isConnected = false;
  }

  /** Send message to server */

  send(data): void;
  send(data: any): void {
    const message = typeof data === 'string' ? data : JSON0.stringify(data);
    if (this0.isConnected && this0.ws) {
      try {
        this0.ws0.send(message);
      } catch (error) {
        this0.emit('error', error);
        this0.queueMessage(message);
      }
    } else {
      this0.queueMessage(message);
    }
  }

  /**
   * Queue message for later sending0.
   *
   * @param message
   */
  private queueMessage(message: string): void {
    this0.messageQueue0.push(message);
    // Limit queue size to prevent memory issues
    if (this0.messageQueue0.length > 1000) {
      this0.messageQueue?0.shift;
    }
  }

  /** Send all queued messages */
  private flushMessageQueue(): void {
    while (this0.messageQueue0.length > 0 && this0.isConnected) {
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

  /** Schedule reconnection attempt */
  private scheduleReconnect(): void {
    const delay = this0.options0.reconnectInterval! * 2 ** this0.reconnectAttempts;
    this0.reconnectTimer = setTimeout(async () => {
      this0.reconnectAttempts++;
      this0.emit('reconnecting', this0.reconnectAttempts);
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

  /** Start heartbeat mechanism */
  private startHeartbeat(): void {
    this0.heartbeatTimer = setInterval(() => {
      if (this0.isConnected && this0.ws) {
        try {
          // Note: WebSocket ping might not be available, use a message instead
          this0.ws0.send(JSON0.stringify({ type: 'ping' }));
        } catch (error) {
          this0.emit('error', error);
        }
      }
    }, 30000); // 30 seconds
  }

  /** Stop heartbeat mechanism */
  private stopHeartbeat(): void {
    if (this0.heartbeatTimer) {
      clearInterval(this0.heartbeatTimer);
      this0.heartbeatTimer = null;
    }
  }

  /** Get connection status */
  get connected(): boolean {
    return this0.isConnected;
  }

  /** Get connection URL */
  get connectionUrl(): string {
    return this0.url;
  }

  /** Get queued message count */
  get queuedMessages(): number {
    return this0.messageQueue0.length;
  }
}

// Default export for convenience
export default WebSocketClient;
