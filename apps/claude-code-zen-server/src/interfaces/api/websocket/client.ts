/**
 * Node.js 22 Native WebSocket Client Implementation
 * Uses the built-in WebSocket client available in Node.js 22+
 * Provides high-performance, standards-compliant WebSocket connectivity.
 */

/**
 * @file Interface implementation: client.
 */

import { TypedEventBase } from '@claude-zen/foundation';

// Use Node.js WebSocket API when available, fallback to DOM types

interface WebSocketClientOptions {
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  timeout?: number

}

/**
 * Native WebSocket Client using Node.js 22 built-in WebSocket.
 *
 * Features:
 * - Auto-reconnection with exponential backoff
 * - Message queuing during disconnection
 * - Heartbeat/ping-pong support
 * - Connection state management
 * - Error handling and recovery
 */
export class WebSocketClient extends TypedEventBase {
  private url: string;
  private options: WebSocketClientOptions;
  private ws: WebSocket | null = null;
  private messageQueue: string[] = [];
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;

  constructor(url: string, options: WebSocketClientOptions = {}) {
    super();
    this.url = url;
    this.options = {
  reconnect: true,
  reconnectInterval: 1000,
  maxReconnectAttempts: 10,
  timeout: 30000,
  ...options

}
}

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void>  {
    return new Promise((resolve, reject) => {
      try {
        // Use Node.js 22 built-in WebSocket
        this.ws = new WebSocket(this.url);

        const timeout = setTimeout(() => {
  reject(new Error('WebSocket connection timeout))

}, this.options.timeout);

        this.ws.onopen = (' => {
          clearTimeout(timeout);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.emit('connected, { timestamp: new Date() })';
          this.startHeartbeat();
          this.flushMessageQueue();
          resolve()
};

        this.ws.onmessage = (event' => {
          try {
  const data = JSON.parse(event.data);
            this.emit('message',
  data)

} catch {
  this.emit('message',
  'vent.data)'

}
        };

        this.ws.onclose = (event' => {
          clearTimeout(timeout);
          this.isConnected = false;
          this.stopHeartbeat();
          this.emit(
  'disconnected',
  event.co'e,
  event.reason
)';

          if (
            this.options.reconnect &&
            this.reconnectAttempts < this.options.maxReconnectAttempts!
           {
            this.scheduleReconnect()
}
        };

        this.ws.onerror = (error) => {
  clearTimeout(timeout);
          this.emit('error',
  e'ror);
          reject(error)

}
} catch (error) {
        reject(error)
}
    })
}

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void  {
    if (this.reconnectTimer) {
  clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null

}

    this.stopHeartbeat();

    if (this.ws && this.isConnected) {
      this.ws.close()
}

    this.isConnected = false
}

  /**
   * Send message to server
   */
  send(data: any): void  {
    const message = typeof data === 'string' ? data : JSON.strin'ify(data)';

    if (this.isConnected && this.ws' {
      try {
        this.ws.send(message)
} catch (error) {
  this.emit('error',
  e'ror)';
        this.queueMessage(message)

}
    } else {
      this.queueMessage(message)
}
  }

  /**
   * Queue message for later sending.
   *
   * @param message - Message to queue
   */
  private queueMessage(message: string: void {
    this.messageQueue.push(message);

    // Limit queue size to prevent memory issues
    if (this.messageQueue.length > 1000) {
      this.messageQueue.shift()
}
  }

  /**
   * Send all queued messages
   */
  private flushMessageQueue(): void  {
    while (this.messageQueue.length > 0 && this.isConnected) {
      const message = this.messageQueue.shift();
      if (message) {
        try {
          this.ws?.send(message)
} catch (error) {
  this.emit('error',
  e'ror)';
          this.messageQueue.unshift(message);
          break

}
      }
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(': void {
    const delay = this.options.reconnectInterval! * 2 ** this.reconnectAttempts;
    this.reconnectTimer = setTimeout(async () => {
      this.reconnectAttempts++;
      this.emit('reconnecting', this.reconnectAttempts);

      try {
        await this.connect()
} catch (error) {
        this.emit('reconnectError', e'ror)';
        if (this.reconnectAttempts < this.options.maxReconnectAttempts!' {
          this.scheduleReconnect()
} else {
          this.emit('reconnectFailed', { timestamp: new Date() })'
}
      }
    }, delay)
}

  /**
   * Start heartbeat mechanism
   */
  private startHeartbeat(': void {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected && this.ws) {
        try {
          // Note: WebSocket ping might not be available, use a message instead
          this.ws.send(JSON.stringify({ type: 'ping }))'
} catch (error) {
  this.emit('error',
  e'ror)'

}
      }
    }, 30000); // 30 seconds
  }

  /**
   * Stop heartbeat mechanism
   */
  private stopHeartbeat(': void {
    if (this.heartbeatTimer) {
  clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null

}
  }

  /**
   * Get connection status
   */
  get connected(): boolean  {
    return this.isConnected
}

  /**
   * Get connection URL
   */
  get connectionUrl(): string  {
    return this.url
}

  /**
   * Get queued message count
   */
  get queuedMessages(): number  {
    return this.messageQueue.length
}
}

// Default export for convenience
export default WebSocketClient;