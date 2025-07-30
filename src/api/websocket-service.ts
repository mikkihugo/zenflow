/**
 * WebSocket Service Integration
 * Combines WebSocket server and Node.js 22 native client capabilities
 * Provides unified WebSocket management for claude-zen
 */

import { EventEmitter } from 'node:events';
import { WebSocketConnectionManager } from './websocket-client.js';

// =============================================================================
// WEBSOCKET SERVICE TYPES
// =============================================================================

/**
 * WebSocket service options
 */
export interface WebSocketServiceOptions {
  /** Client port for connections */
  clientPort?: number;
  /** Client host for connections */
  clientHost?: string;
  /** Enable automatic reconnection */
  enableReconnect?: boolean;
  /** Heartbeat interval in milliseconds */
  heartbeatInterval?: number;
  /** Message queue limit */
  messageQueueLimit?: number;
}

/**
 * WebSocket service statistics
 */
export interface WebSocketStats {
  totalConnections: number;
  activeConnections: number;
  messagesSent: number;
  messagesReceived: number;
  errors: number;
}

/**
 * Message information
 */
export interface MessageInfo {
  type: string;
  data: any;
  source: string;
}

export interface WebSocketSupportCheck {
  nodeVersion: string;
  majorVersion: number;
  hasNativeWebSocket: boolean;
  recommendation: string;
}

// =============================================================================
// WEBSOCKET SERVICE CLASS
// =============================================================================

/**
 * WebSocket Service for claude-zen
 * Manages both server-side WebSocket connections and client connections
 */
export class WebSocketService extends EventEmitter {
  private options: WebSocketServiceOptions;
  private connectionManager: WebSocketConnectionManager;
  private messageHandlers: Map<string, Set<(message: any) => void>>;
  private stats: WebSocketStats;
  private isInitialized: boolean;

  constructor(options: WebSocketServiceOptions = {}) {
    super();
    this.options = options;
    this.connectionManager = new WebSocketConnectionManager({
      maxConnections: 100, // Example value
    });
    this.messageHandlers = new Map();
    this.isInitialized = false;
    this.stats = {
      totalConnections: 0,
      activeConnections: 0,
      messagesSent: 0,
      messagesReceived: 0,
      errors: 0,
    };
  }

  async initialize() {
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

    console.warn('🚀 WebSocket service initialized');
  }

  async connectToServer(connectionName = 'main', customOptions = {}): Promise<any> {
    const url = `ws://${this.options.clientHost || 'localhost'}:${this.options.clientPort || 8080}`;
    const clientOptions = { ...this.options, ...customOptions };
    const client = this.connectionManager.addConnection(connectionName, url, clientOptions);
    await client.connect();
    this.stats.totalConnections++;
    console.warn(`🔗 Connected to claude-zen server`);
    return client;
  }

  async connectToExternal(connectionName: string, url: string, options: any = {}): Promise<any> {
    try {
      const client = this.connectionManager.addConnection(connectionName, url, options);
      await client.connect();
      this.stats.totalConnections++;
      console.warn(`🔗 Connected to external WebSocket`);
      return client;
    } catch (error) {
      console.error(`Error connecting to external WebSocket: ${error}`);
      throw error;
    }
  }

  sendMessage(connectionName: string, data: any): boolean {
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

  sendBalanced(data: any): boolean {
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

  broadcast(data: any) {
    const results = this.connectionManager.broadcast(data);
    const successCount = results.filter((r: any) => r.success).length;
    this.stats.messagesSent += successCount;

    this.emit('broadcast', {
      data,
      results,
      successCount,
      totalConnections: this.stats.activeConnections,
    });

    return results;
  }

  onMessage(type: string, handler: (message: any) => void): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }

    this.messageHandlers.get(type)?.add(handler);

    return () => {
      const handlers = this.messageHandlers.get(type);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  private handleMessage(info: any) {
    const { data } = info;
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

    const handlers = this.messageHandlers.get(messageType);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler({ type: messageType, data: messageData, source: info.name });
        } catch (error) {
          console.error(`Error in message handler for type ${messageType}:`, error);
        }
      });
    }
  }

  setupClaudeZenHandlers(): void {
    this.onMessage('queen_council_update', (msg) => {
      console.warn(`👑 Queen Council Update:`, msg);
    });
    this.onMessage('swarm_status', (msg) => {
      console.warn(`🐝 Swarm Status:`, msg);
    });
    this.onMessage('task_update', (msg) => {
      console.warn(`📋 Task Update:`, msg);
    });
    this.onMessage('neural_update', (msg) => {
      console.warn(`🧠 Neural Update:`, msg);
    });
    this.onMessage('memory_update', (msg) => {
      console.warn(`💾 Memory Update:`, msg);
    });
  }

  async sendCommand(connectionName: string, command: string, payload: any): Promise<boolean> {
    const message = { type: 'command', command, payload };
    return this.sendMessage(connectionName, message);
  }

  async sendEvent(connectionName: string, event: string, data: any): Promise<boolean> {
    const message = { type: 'event', event, data };
    return this.sendMessage(connectionName, message);
  }

  getServiceStatus() {
    return {
      isInitialized: this.isInitialized,
      options: this.options,
      stats: this.stats,
      connectionManagerStatus: this.connectionManager.getStatus(),
    };
  }

  getConnectionStats(connectionName: string) {
    const client = this.connectionManager.getConnection(connectionName);
    return client ? client.getStats() : null;
  }

  listConnections(): any[] {
    return this.connectionManager.getStatus().connections;
  }

  async disconnectConnection(connectionName: string) {
    await this.connectionManager.removeConnection(connectionName);
  }

  async shutdown() {
    await this.connectionManager.shutdown();
    this.emit('shutdown');
  }

  static async create(options: WebSocketServiceOptions = {}): Promise<WebSocketService> {
    const service = new WebSocketService(options);
    await service.initialize();
    service.setupClaudeZenHandlers();
    return service;
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Utility function to check WebSocket support
 */
export function checkWebSocketSupport(): WebSocketSupportCheck {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);

  return {
    nodeVersion,
    majorVersion,
    hasNativeWebSocket = 22,
    recommendation = 22 
      ? 'Use --experimental-websocket flag for native WebSocket support'
      : 'Upgrade to Node.js 22+ for native WebSocket support',
  };
}

export default WebSocketService;
