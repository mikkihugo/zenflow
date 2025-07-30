/**
 * Node.js 22 Native WebSocket Client Implementation;
 * Uses the built-in WebSocket client available in Node.js 22+;
 * Provides high-performance, standards-compliant WebSocket connectivity;
 */

import { EventEmitter } from 'node:events';

interface WebSocketClientOptions {
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  timeout?: number;
}
/**
 * Native WebSocket Client using Node.js 22 built-in WebSocket;
 *;
 * Features:;
 * - Auto-reconnection with exponential backoff;
 * - Message queuing during disconnection;
 * - Heartbeat/ping-pong support;
 * - Connection state management;
 * - Error handling and recovery;
 */
export class WebSocketClient extends EventEmitter {
  constructor(url: string, _options: WebSocketClientOptions = {}) {
    super();
    this.url = url;
    this.options = {
      reconnect: false,;
    reconnectInterval: 1000,;
    maxReconnectAttempts: 5,;
    timeout: 10000,;
    ...options,
  }
  this;
  .
  isConnected = false;
  this;
  .
  reconnectAttempts = 0;
  this;
  .
  messageQueue = [];
}
/**
 * Connect to WebSocket server;
 */
async;
connect();
: Promise<void>
{
  return new Promise((resolve, reject) => {
      try {
        // Use Node.js 22 built-in WebSocket
        this.ws = new WebSocket(this.url);
    // ; // LINT: unreachable code removed
        const _timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timeout'));
        }, this.options.timeout);
;
        this.ws.onopen = (): unknown => {
          clearTimeout(timeout);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.emit('connected');
          this.startHeartbeat();
          this.flushMessageQueue();
          resolve();
        };
;
        this.ws.onmessage = (): unknown => {
          try {
            const _data = JSON.parse(event.data);
            this.emit('message', data);
          } catch (/* _error */) {
            this.emit('message', event.data);
          }
        };
;
        this.ws.onclose = (): unknown => {
          clearTimeout(timeout);
          this.isConnected = false;
          this.stopHeartbeat();
          this.emit('disconnected', event.code, event.reason);
;
          if (;
            this.options.reconnect &&;
            this.reconnectAttempts < this.options.maxReconnectAttempts;
          ) 
            this.scheduleReconnect();
        };
;
        this.ws.onerror = (): unknown => {
          clearTimeout(timeout);
          this.emit('error', error);
          reject(error);
        };
      } catch (/* error */) {
        reject(error);
      }
    });
}
/**
 * Disconnect from WebSocket server;
 */
disconnect();
: void
{
  if (this.reconnectTimer) {
    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = undefined;
  }
  this.stopHeartbeat();
  if (this.ws && this.isConnected) {
    this.ws.close();
  }
  this.isConnected = false;
}
/**
 * Send message to server;
 */
send(data: unknown)
: void
{
  const _message = typeof data === 'string' ? data : JSON.stringify(data);
  if (this.isConnected && this.ws) {
    try {
        this.ws.send(message);
      } catch (/* error */) {
        this.emit('error', error);
        this.queueMessage(message);
      }
  } else {
    this.queueMessage(message);
  }
}
/**
 * Queue message for later sending;
 */
private
queueMessage(message: string)
: void
{
  this.messageQueue.push(message);
  // Limit queue size to prevent memory issues
  if (this.messageQueue.length > 1000) {
    this.messageQueue.shift();
  }
}
/**
 * Send all queued messages;
 */
private
flushMessageQueue();
: void
{
  while (this.messageQueue.length > 0 && this.isConnected) {
    const _message = this.messageQueue.shift();
    if (message) {
      try {
          this.ws.send(message);
        } catch (/* error */) {
          this.emit('error', error);
          this.messageQueue.unshift(message);
          break;
        }
    }
  }
}
/**
 * Schedule reconnection attempt;
 */
private
scheduleReconnect();
: void
{
  const _delay = this.options.reconnectInterval * 2 ** this.reconnectAttempts;
  this.reconnectTimer = setTimeout(async () => {
    this.reconnectAttempts++;
    this.emit('reconnecting', this.reconnectAttempts);
    try {
        await this.connect();
      } catch (/* error */) {
        this.emit('reconnectError', error);
;
        if (this.reconnectAttempts < this.options.maxReconnectAttempts) {
          this.scheduleReconnect();
        } else {
          this.emit('reconnectFailed');
        }
      }
  }, delay);
}
/**
 * Start heartbeat mechanism;
 */
private
startHeartbeat();
: void
{
  this.heartbeatTimer = setInterval(() => {
    if (this.isConnected && this.ws) {
      try {
          this.ws.ping();
        } catch (/* error */) {
          this.emit('error', error);
        }
    }
  }, 30000); // 30 seconds
}
/**
 * Stop heartbeat mechanism;
 */
private
stopHeartbeat();
: void
{
  if (this.heartbeatTimer) {
    clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = undefined;
  }
}
/**
 * Get connection status;
 */
get;
connected();
: boolean
{
    return this.isConnected;
    //   // LINT: unreachable code removed}
;
  /**
   * Get connection URL;
   */;
  get connectionUrl(): string 
    return this.url;
    //   // LINT: unreachable code removed}
;
  /**
   * Get queued message count;
   */;
  get queuedMessages(): number 
    return this.messageQueue.length;
;
// Default export for convenience
export default WebSocketClient;
