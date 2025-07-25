/**
 * Node.js 22 Native WebSocket Client Implementation
 * Uses the built-in WebSocket client available in Node.js 22+
 * Provides high-performance, standards-compliant WebSocket connectivity
 */

import { EventEmitter } from 'events';

/**
 * Native WebSocket Client using Node.js 22 built-in WebSocket
 * 
 * Features:
 * - Standards-compliant WebSocket client (RFC 6455)
 * - Built into Node.js 22+ (no external dependencies)
 * - Automatic reconnection with exponential backoff
 * - Message queuing during disconnection
 * - Heartbeat/ping support
 * - Comprehensive error handling
 */
export class NativeWebSocketClient extends EventEmitter {
  constructor(url, options = {}) {
    super();
    
    this.url = url;
    this.options = {
      reconnect: true,
      reconnectInterval: 1000,
      maxReconnectInterval: 30000,
      reconnectDecay: 1.5,
      maxReconnectAttempts: 50,
      heartbeatInterval: 30000,
      messageQueueLimit: 1000,
      ...options
    };
    
    this.ws = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.reconnectTimer = null;
    this.heartbeatTimer = null;
    this.messageQueue = [];
    
    // Statistics
    this.stats = {
      messagesReceived: 0,
      messagesSent: 0,
      bytesReceived: 0,
      bytesSent: 0,
      reconnections: 0,
      errors: 0,
      uptime: 0,
      connectedAt: null
    };
    
    this.setupEventHandlers();
  }

  /**
   * Connect to WebSocket server using Node.js 22 native WebSocket
   */
  async connect() {
    if (this.isConnected || this.isConnecting) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        this.isConnecting = true;
        
        // Use Node.js 22 built-in WebSocket with experimental flag
        // Note: In Node.js 22, WebSocket is available via --experimental-websocket flag
        this.ws = new WebSocket(this.url, this.options.protocols);
        
        // Set up event listeners
        this.ws.addEventListener('open', () => {
          this.handleOpen();
          resolve();
        });
        
        this.ws.addEventListener('message', (event) => {
          this.handleMessage(event);
        });
        
        this.ws.addEventListener('close', (event) => {
          this.handleClose(event);
        });
        
        this.ws.addEventListener('error', (error) => {
          this.handleError(error);
          if (this.isConnecting) {
            reject(error);
          }
        });
        
        // Connection timeout
        const timeout = setTimeout(() => {
          if (this.isConnecting) {
            this.ws.close();
            reject(new Error('WebSocket connection timeout'));
          }
        }, this.options.connectionTimeout || 10000);
        
        this.ws.addEventListener('open', () => clearTimeout(timeout));
        
      } catch (error) {
        this.isConnecting = false;
        this.stats.errors++;
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    this.options.reconnect = false;
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close(1000, 'Client disconnect');
    }
    
    this.isConnected = false;
    this.isConnecting = false;
  }

  /**
   * Send message to WebSocket server
   */
  send(data) {
    if (!this.isConnected) {
      // Queue message if not connected and queue is enabled
      if (this.options.messageQueueLimit > 0) {
        if (this.messageQueue.length >= this.options.messageQueueLimit) {
          this.messageQueue.shift(); // Remove oldest message
        }
        this.messageQueue.push(data);
        this.emit('messageQueued', { data, queueSize: this.messageQueue.length });
      } else {
        throw new Error('WebSocket not connected and message queuing disabled');
      }
      return false;
    }

    try {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      this.ws.send(message);
      
      this.stats.messagesSent++;
      this.stats.bytesSent += message.length;
      
      this.emit('messageSent', { data, size: message.length });
      return true;
    } catch (error) {
      this.stats.errors++;
      this.emit('sendError', error);
      return false;
    }
  }

  /**
   * Send JSON data
   */
  sendJSON(data) {
    return this.send(JSON.stringify(data));
  }

  /**
   * Send ping frame (Node.js 22 WebSocket supports ping/pong)
   */
  ping(data = Buffer.alloc(0)) {
    if (this.isConnected && this.ws.ping) {
      this.ws.ping(data);
      this.emit('pingSent', { data });
    }
  }

  /**
   * Handle WebSocket open event
   */
  handleOpen() {
    this.isConnected = true;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.stats.connectedAt = Date.now();
    
    if (this.reconnectAttempts > 0) {
      this.stats.reconnections++;
    }
    
    // Start heartbeat
    this.startHeartbeat();
    
    // Send queued messages
    this.flushMessageQueue();
    
    this.emit('connected', {
      url: this.url,
      reconnected: this.stats.reconnections > 0
    });
  }

  /**
   * Handle WebSocket message event
   */
  handleMessage(event) {
    const data = event.data;
    
    this.stats.messagesReceived++;
    this.stats.bytesReceived += data.length || data.byteLength || 0;
    
    let parsedData = data;
    
    // Try to parse JSON
    if (typeof data === 'string') {
      try {
        parsedData = JSON.parse(data);
      } catch (e) {
        // Not JSON, keep as string
      }
    }
    
    this.emit('message', {
      data: parsedData,
      raw: data,
      size: data.length || data.byteLength || 0
    });
  }

  /**
   * Handle WebSocket close event
   */
  handleClose(event) {
    this.isConnected = false;
    this.isConnecting = false;
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    
    // Update uptime stats
    if (this.stats.connectedAt) {
      this.stats.uptime += Date.now() - this.stats.connectedAt;
      this.stats.connectedAt = null;
    }
    
    this.emit('disconnected', {
      code: event.code,
      reason: event.reason,
      wasClean: event.wasClean
    });
    
    // Attempt reconnection if enabled
    if (this.options.reconnect && this.reconnectAttempts < this.options.maxReconnectAttempts) {
      this.scheduleReconnect();
    }
  }

  /**
   * Handle WebSocket error event
   */
  handleError(error) {
    this.stats.errors++;
    this.isConnecting = false;
    
    this.emit('error', {
      error,
      message: error.message,
      code: error.code
    });
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    const timeout = Math.min(
      this.options.reconnectInterval * Math.pow(this.options.reconnectDecay, this.reconnectAttempts),
      this.options.maxReconnectInterval
    );
    
    this.reconnectAttempts++;
    
    this.emit('reconnecting', {
      attempt: this.reconnectAttempts,
      maxAttempts: this.options.maxReconnectAttempts,
      timeout
    });
    
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        this.emit('reconnectFailed', { error, attempt: this.reconnectAttempts });
      });
    }, timeout);
  }

  /**
   * Start heartbeat mechanism
   */
  startHeartbeat() {
    if (this.options.heartbeatInterval <= 0) return;
    
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        this.ping();
      }
    }, this.options.heartbeatInterval);
  }

  /**
   * Flush queued messages after reconnection
   */
  flushMessageQueue() {
    if (this.messageQueue.length === 0) return;
    
    const queuedMessages = [...this.messageQueue];
    this.messageQueue = [];
    
    queuedMessages.forEach(data => {
      this.send(data);
    });
    
    this.emit('queueFlushed', { messageCount: queuedMessages.length });
  }

  /**
   * Setup default event handlers for logging
   */
  setupEventHandlers() {
    this.on('connected', (info) => {
      console.log(`✅ WebSocket connected to ${info.url}${info.reconnected ? ' (reconnected)' : ''}`);
    });
    
    this.on('disconnected', (info) => {
      console.log(`❌ WebSocket disconnected: ${info.reason || 'Unknown reason'} (${info.code})`);
    });
    
    this.on('error', (info) => {
      console.error(`🚨 WebSocket error: ${info.message}`);
    });
    
    this.on('reconnecting', (info) => {
      console.log(`🔄 WebSocket reconnecting... attempt ${info.attempt}/${info.maxAttempts} (${info.timeout}ms)`);
    });
  }

  /**
   * Get connection statistics
   */
  getStats() {
    const currentUptime = this.stats.connectedAt 
      ? this.stats.uptime + (Date.now() - this.stats.connectedAt)
      : this.stats.uptime;
      
    return {
      ...this.stats,
      uptime: currentUptime,
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
      queuedMessages: this.messageQueue.length,
      url: this.url
    };
  }

  /**
   * Get current connection state
   */
  getState() {
    return {
      connected: this.isConnected,
      connecting: this.isConnecting,
      url: this.url,
      readyState: this.ws?.readyState || WebSocket.CLOSED,
      protocol: this.ws?.protocol || null,
      extensions: this.ws?.extensions || null
    };
  }

  /**
   * Check if Node.js 22 WebSocket is available
   */
  static isNativeWebSocketAvailable() {
    try {
      return typeof WebSocket !== 'undefined' && WebSocket.prototype && WebSocket.prototype.send;
    } catch (error) {
      return false;
    }
  }

  /**
   * Create WebSocket client with automatic fallback
   */
  static create(url, options = {}) {
    if (NativeWebSocketClient.isNativeWebSocketAvailable()) {
      return new NativeWebSocketClient(url, options);
    } else {
      throw new Error('Native WebSocket not available. Ensure Node.js is running with --experimental-websocket flag.');
    }
  }
}

/**
 * WebSocket Connection Manager
 * Manages multiple WebSocket connections with load balancing
 */
export class WebSocketConnectionManager extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      maxConnections: 10,
      loadBalancing: 'round-robin', // 'round-robin', 'random', 'least-loaded'
      healthCheckInterval: 30000,
      ...options
    };
    
    this.connections = new Map();
    this.currentIndex = 0;
    this.healthCheckTimer = null;
    
    this.startHealthCheck();
  }

  /**
   * Add WebSocket connection
   */
  addConnection(name, url, options = {}) {
    if (this.connections.size >= this.options.maxConnections) {
      throw new Error(`Maximum connections (${this.options.maxConnections}) reached`);
    }

    const client = new NativeWebSocketClient(url, options);
    
    // Forward events with connection name
    client.on('connected', (info) => this.emit('connectionConnected', { name, ...info }));
    client.on('disconnected', (info) => this.emit('connectionDisconnected', { name, ...info }));
    client.on('message', (info) => this.emit('connectionMessage', { name, ...info }));
    client.on('error', (info) => this.emit('connectionError', { name, ...info }));
    
    this.connections.set(name, {
      client,
      url,
      options,
      stats: { messagesHandled: 0, lastUsed: null }
    });
    
    return client;
  }

  /**
   * Remove WebSocket connection
   */
  removeConnection(name) {
    const connection = this.connections.get(name);
    if (connection) {
      connection.client.disconnect();
      this.connections.delete(name);
      return true;
    }
    return false;
  }

  /**
   * Get connection by name
   */
  getConnection(name) {
    const connection = this.connections.get(name);
    return connection?.client || null;
  }

  /**
   * Get next connection based on load balancing strategy
   */
  getNextConnection() {
    const activeConnections = Array.from(this.connections.entries())
      .filter(([name, conn]) => conn.client.isConnected);
    
    if (activeConnections.length === 0) {
      return null;
    }

    let selectedConnection;

    switch (this.options.loadBalancing) {
      case 'round-robin':
        selectedConnection = activeConnections[this.currentIndex % activeConnections.length];
        this.currentIndex = (this.currentIndex + 1) % activeConnections.length;
        break;
        
      case 'random':
        selectedConnection = activeConnections[Math.floor(Math.random() * activeConnections.length)];
        break;
        
      case 'least-loaded':
        selectedConnection = activeConnections.reduce((prev, curr) => 
          prev[1].stats.messagesHandled < curr[1].stats.messagesHandled ? prev : curr
        );
        break;
        
      default:
        selectedConnection = activeConnections[0];
    }

    // Update usage stats
    selectedConnection[1].stats.messagesHandled++;
    selectedConnection[1].stats.lastUsed = Date.now();

    return selectedConnection[1].client;
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcast(data) {
    const results = [];
    
    this.connections.forEach((connection, name) => {
      if (connection.client.isConnected) {
        const success = connection.client.send(data);
        results.push({ name, success });
      }
    });
    
    return results;
  }

  /**
   * Start health check for all connections
   */
  startHealthCheck() {
    if (this.options.healthCheckInterval <= 0) return;
    
    this.healthCheckTimer = setInterval(() => {
      this.connections.forEach((connection, name) => {
        if (connection.client.isConnected) {
          connection.client.ping();
        }
      });
    }, this.options.healthCheckInterval);
  }

  /**
   * Get status of all connections
   */
  getStatus() {
    const status = {
      totalConnections: this.connections.size,
      activeConnections: 0,
      connections: {}
    };

    this.connections.forEach((connection, name) => {
      const clientStats = connection.client.getStats();
      status.connections[name] = {
        ...clientStats,
        url: connection.url,
        stats: connection.stats
      };
      
      if (clientStats.isConnected) {
        status.activeConnections++;
      }
    });

    return status;
  }

  /**
   * Cleanup all connections
   */
  cleanup() {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }

    this.connections.forEach((connection) => {
      connection.client.disconnect();
    });
    
    this.connections.clear();
  }
}

export default NativeWebSocketClient;