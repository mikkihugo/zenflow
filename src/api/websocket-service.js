/**
 * WebSocket Service Integration
 * Combines WebSocket server and Node.js 22 native client capabilities
 * Provides unified WebSocket management for claude-zen
 */

import { EventEmitter } from 'events';
import { NativeWebSocketClient, WebSocketConnectionManager } from './websocket-client.js';

/**
 * WebSocket Service for claude-zen
 * Manages both server-side WebSocket connections and client connections
 */
export class WebSocketService extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      clientPort: 3000,
      clientHost: 'localhost',
      enableReconnect: true,
      heartbeatInterval: 30000,
      messageQueueLimit: 1000,
      ...options
    };
    
    this.connectionManager = new WebSocketConnectionManager({
      maxConnections: 20,
      loadBalancing: 'least-loaded',
      healthCheckInterval: this.options.heartbeatInterval
    });
    
    this.clients = new Map();
    this.isInitialized = false;
    
    // Message handlers
    this.messageHandlers = new Map();
    
    // Statistics
    this.stats = {
      totalConnections: 0,
      activeConnections: 0,
      messagesReceived: 0,
      messagesSent: 0,
      errors: 0,
      startTime: Date.now()
    };
    
    this.setupEventHandlers();
  }

  /**
   * Initialize WebSocket service
   */
  async initialize() {
    if (this.isInitialized) return;
    
    // Check Node.js 22 WebSocket availability
    if (!NativeWebSocketClient.isNativeWebSocketAvailable()) {
      console.warn('⚠️ Native WebSocket not available. Use --experimental-websocket flag with Node.js 22+');
      console.log('🔧 Starting in compatibility mode with ws package');
    } else {
      console.log('✅ Node.js 22 native WebSocket support detected');
    }
    
    // Setup connection manager event handlers
    this.connectionManager.on('connectionConnected', (info) => {
      this.stats.activeConnections++;
      this.emit('clientConnected', info);
    });
    
    this.connectionManager.on('connectionDisconnected', (info) => {
      this.stats.activeConnections--;
      this.emit('clientDisconnected', info);
    });
    
    this.connectionManager.on('connectionMessage', (info) => {
      this.stats.messagesReceived++;
      this.handleMessage(info);
    });
    
    this.connectionManager.on('connectionError', (info) => {
      this.stats.errors++;
      this.emit('error', info);
    });
    
    this.isInitialized = true;
    this.emit('initialized');
    
    console.log('🚀 WebSocket service initialized');
  }

  /**
   * Connect to claude-zen server WebSocket
   */
  async connectToServer(connectionName = 'main', customOptions = {}) {
    const url = `ws://${this.options.clientHost}:${this.options.clientPort}/ws`;
    
    const clientOptions = {
      reconnect: this.options.enableReconnect,
      heartbeatInterval: this.options.heartbeatInterval,
      messageQueueLimit: this.options.messageQueueLimit,
      ...customOptions
    };
    
    try {
      const client = this.connectionManager.addConnection(connectionName, url, clientOptions);
      await client.connect();
      
      this.stats.totalConnections++;
      
      console.log(`🔗 Connected to claude-zen server: ${connectionName}`);
      return client;
    } catch (error) {
      console.error(`❌ Failed to connect to claude-zen server: ${error.message}`);
      throw error;
    }
  }

  /**
   * Connect to external WebSocket
   */
  async connectToExternal(connectionName, url, options = {}) {
    try {
      const client = this.connectionManager.addConnection(connectionName, url, options);
      await client.connect();
      
      this.stats.totalConnections++;
      
      console.log(`🔗 Connected to external WebSocket: ${connectionName} (${url})`);
      return client;
    } catch (error) {
      console.error(`❌ Failed to connect to ${url}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send message to specific connection
   */
  sendToConnection(connectionName, data) {
    const client = this.connectionManager.getConnection(connectionName);
    if (!client) {
      throw new Error(`Connection '${connectionName}' not found`);
    }
    
    const success = client.send(data);
    if (success) {
      this.stats.messagesSent++;
    }
    
    return success;
  }

  /**
   * Send message using load balancing
   */
  sendBalanced(data) {
    const client = this.connectionManager.getNextConnection();
    if (!client) {
      throw new Error('No active connections available');
    }
    
    const success = client.send(data);
    if (success) {
      this.stats.messagesSent++;
    }
    
    return success;
  }

  /**
   * Broadcast message to all connections
   */
  broadcast(data) {
    const results = this.connectionManager.broadcast(data);
    
    const successCount = results.filter(r => r.success).length;
    this.stats.messagesSent += successCount;
    
    this.emit('broadcast', {
      data,
      results,
      successCount,
      totalConnections: results.length
    });
    
    return results;
  }

  /**
   * Register message handler
   */
  onMessage(type, handler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    
    this.messageHandlers.get(type).add(handler);
    
    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(type);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  /**
   * Handle incoming message
   */
  handleMessage(info) {
    const { name: connectionName, data, raw } = info;
    
    // Try to determine message type
    let messageType = 'unknown';
    let messageData = data;
    
    if (typeof data === 'object' && data !== null) {
      if (data.type) {
        messageType = data.type;
        messageData = data.payload || data.data || data;
      } else if (data.event) {
        messageType = data.event;
        messageData = data.data || data;
      }
    }
    
    // Call registered handlers
    const handlers = this.messageHandlers.get(messageType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler({
            type: messageType,
            data: messageData,
            raw: raw,
            connection: connectionName,
            timestamp: Date.now()
          });
        } catch (error) {
          console.error(`Error in message handler for '${messageType}':`, error);
          this.emit('handlerError', { messageType, error, connectionName });
        }
      });
    }
    
    // Emit generic message event
    this.emit('message', {
      connectionName,
      type: messageType,
      data: messageData,
      raw: raw
    });
  }

  /**
   * Setup default event handlers
   */
  setupEventHandlers() {
    this.on('clientConnected', (info) => {
      console.log(`✅ WebSocket client connected: ${info.name}`);
    });
    
    this.on('clientDisconnected', (info) => {
      console.log(`❌ WebSocket client disconnected: ${info.name} (${info.reason})`);
    });
    
    this.on('error', (info) => {
      console.error(`🚨 WebSocket error on ${info.name}: ${info.error.message}`);
    });
  }

  /**
   * Setup common message handlers for claude-zen
   */
  setupClaudeZenHandlers() {
    // Handle queen council updates
    this.onMessage('queen_council_update', (msg) => {
      console.log(`👑 Queen Council Update: ${JSON.stringify(msg.data)}`);
      this.emit('queenCouncilUpdate', msg.data);
    });
    
    // Handle swarm status updates
    this.onMessage('swarm_status', (msg) => {
      console.log(`🐝 Swarm Status: ${JSON.stringify(msg.data)}`);
      this.emit('swarmStatus', msg.data);
    });
    
    // Handle task orchestration updates
    this.onMessage('task_update', (msg) => {
      console.log(`📋 Task Update: ${JSON.stringify(msg.data)}`);
      this.emit('taskUpdate', msg.data);
    });
    
    // Handle neural network updates
    this.onMessage('neural_update', (msg) => {
      console.log(`🧠 Neural Update: ${JSON.stringify(msg.data)}`);
      this.emit('neuralUpdate', msg.data);
    });
    
    // Handle memory updates
    this.onMessage('memory_update', (msg) => {
      console.log(`💾 Memory Update: ${JSON.stringify(msg.data)}`);
      this.emit('memoryUpdate', msg.data);
    });
  }

  /**
   * Send queen council command
   */
  async sendQueenCouncilCommand(objective, options = {}) {
    const message = {
      type: 'queen_council_command',
      payload: {
        objective,
        options,
        timestamp: Date.now(),
        id: `qc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
      }
    };
    
    return this.sendBalanced(message);
  }

  /**
   * Send swarm orchestration command
   */
  async sendSwarmCommand(command, params = {}) {
    const message = {
      type: 'swarm_command',
      payload: {
        command,
        params,
        timestamp: Date.now(),
        id: `sw_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
      }
    };
    
    return this.sendBalanced(message);
  }

  /**
   * Send real-time update
   */
  sendRealtimeUpdate(updateType, data) {
    const message = {
      type: 'realtime_update',
      payload: {
        updateType,
        data,
        timestamp: Date.now()
      }
    };
    
    return this.broadcast(message);
  }

  /**
   * Get service status
   */
  getStatus() {
    const connectionStatus = this.connectionManager.getStatus();
    
    return {
      service: {
        initialized: this.isInitialized,
        uptime: Date.now() - this.stats.startTime,
        stats: this.stats
      },
      connections: connectionStatus,
      handlers: {
        totalTypes: this.messageHandlers.size,
        types: Array.from(this.messageHandlers.keys())
      },
      nodeJsVersion: process.version,
      nativeWebSocketSupport: NativeWebSocketClient.isNativeWebSocketAvailable()
    };
  }

  /**
   * Get connection statistics
   */
  getConnectionStats(connectionName) {
    const client = this.connectionManager.getConnection(connectionName);
    return client ? client.getStats() : null;
  }

  /**
   * List all connections
   */
  listConnections() {
    return this.connectionManager.getStatus().connections;
  }

  /**
   * Disconnect specific connection
   */
  disconnectConnection(connectionName) {
    return this.connectionManager.removeConnection(connectionName);
  }

  /**
   * Disconnect all connections and cleanup
   */
  async shutdown() {
    console.log('🔄 Shutting down WebSocket service...');
    
    this.connectionManager.cleanup();
    this.messageHandlers.clear();
    
    this.emit('shutdown');
    console.log('✅ WebSocket service shut down');
  }

  /**
   * Create WebSocket service instance with Node.js 22 support
   */
  static async create(options = {}) {
    const service = new WebSocketService(options);
    await service.initialize();
    service.setupClaudeZenHandlers();
    return service;
  }
}

/**
 * Utility function to check WebSocket support
 */
export function checkWebSocketSupport() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);
  
  return {
    nodeVersion,
    majorVersion,
    hasNativeWebSocket: NativeWebSocketClient.isNativeWebSocketAvailable(),
    supportsExperimentalWebSocket: majorVersion >= 22,
    recommendation: majorVersion >= 22 
      ? 'Use --experimental-websocket flag for native WebSocket support'
      : 'Upgrade to Node.js 22+ for native WebSocket support'
  };
}

export default WebSocketService;