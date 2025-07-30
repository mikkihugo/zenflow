/**
 * WebSocket Service Integration;
 * Combines WebSocket server and Node.js 22 native client capabilities;
 * Provides unified WebSocket management for claude-zen;
 */

import { EventEmitter } from 'node:events';
import { WebSocketConnectionManager } from './websocket-client.js';
// =============================================================================
// WEBSOCKET SERVICE TYPES
// =============================================================================

/**
 * WebSocket service options;
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
 * WebSocket service statistics;
 */
export interface WebSocketStats {
  totalConnections: number;
  activeConnections: number;
  messagesSent: number;
  messagesReceived: number;
  errors: number;
}
/**
 * Message information;
 */
export interface MessageInfo {
  type: string;
  data: unknown;
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
 * WebSocket Service for claude-zen;
 * Manages both server-side WebSocket connections and client connections;
 */
export class WebSocketService extends EventEmitter {
  constructor(options: WebSocketServiceOptions = {}) {
    super();
    this.options = options;
    this.connectionManager = new WebSocketConnectionManager({
      maxConnections, // Example value
    });
    this.messageHandlers = new Map();
    this.isInitialized = false;
    this.stats = {
      totalConnections,
    activeConnections,
    messagesSent,
    messagesReceived,
    errors}
}
async;
initialize();
{
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
async;
connectToServer((connectionName = 'main'), (customOptions = {}));
: Promise<any>
{
    const _url = `ws://${this.options.clientHost  ?? 'localhost'}:${this.options.clientPort  ?? 8080}`;
    const _clientOptions = { ...this.options, ...customOptions };
    const _client = this.connectionManager.addConnection(connectionName, url, clientOptions);
// await client.connect();
    this.stats.totalConnections++;
    console.warn(`🔗 Connected to claude-zen server`);
    return client;
    //   // LINT: unreachable code removed}

  async connectToExternal(connectionName, url, options: unknown = {}): Promise<any>
    try {
      const _client = this.connectionManager.addConnection(connectionName, url, options);
// await client.connect();
      this.stats.totalConnections++;
      console.warn(`🔗 Connected to external WebSocket`);
      return client;
    //   // LINT: unreachable code removed} catch (error) {
      console.error(`Error connecting to external WebSocket: ${error}`);
      throw error;
    }

  sendMessage(connectionName, data: unknown): boolean {
    const _client = this.connectionManager.getConnection(connectionName);
    if (!client) {
      throw new Error(`Connection '${connectionName}' not found`);
    }

    const _success = client.send(data);
    if (success) {
      this.stats.messagesSent++;
    }

    return success;
    //   // LINT: unreachable code removed}

  sendBalanced(data: unknown): boolean {
    const _client = this.connectionManager.getNextConnection();
    if (!client) {
      throw new Error('No active connections available');
    }

    const _success = client.send(data);
    if (success) {
      this.stats.messagesSent++;
    }

    return success;
    //   // LINT: unreachable code removed}

  broadcast(data: unknown) {
    const _results = this.connectionManager.broadcast(data);
    const _successCount = results.filter((r: unknown) => r.success).length;
    this.stats.messagesSent += successCount;

    this.emit('broadcast', {
      data,
      results,
      successCount,
      totalConnections: this.stats.activeConnections });

    return results;
    //   // LINT: unreachable code removed}

  onMessage(type, handler: (_message: unknown) => void): () => void
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }

    this.messageHandlers.get(type)?.add(handler);

    return () => {
      const _handlers = this.messageHandlers.get(type);
    // if (handlers) { // LINT: unreachable code removed
        handlers.delete(handler);
      };
  }

  private handleMessage(info: unknown) {
    const { data } = info;
    const _messageType = 'unknown';
    const _messageData = data;

    if (typeof data === 'object' && data !== null) {
      if (data.type) {
        messageType = data.type;
        messageData = data.payload  ?? data.data  ?? data;
      } else if (data.event) {
        messageType = data.event;
        messageData = data.data  ?? data;
      }
    }

    const _handlers = this.messageHandlers.get(messageType);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler({ type, data, source: info.name });
        } catch (error) {
          console.error(`Error in message handler for type ${messageType}:`, error);
        }
      });
    }
  }

  setupClaudeZenHandlers(): void
    this.onMessage('queen_council_update', (msg) =>
      console.warn(`👑 Queen Council Update:`, msg););
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

  async sendCommand(connectionName, command, payload: unknown): Promise<boolean> {
    const _message = { type: 'command', command, payload };
    return this.sendMessage(connectionName, message);
    //   // LINT: unreachable code removed}

  async sendEvent(connectionName, event, data: unknown): Promise<boolean> {
    const _message = { type: 'event', event, data };
    return this.sendMessage(connectionName, message);
    //   // LINT: unreachable code removed}

  getServiceStatus()
    return {
      isInitialized: this.isInitialized,
    // options: this.options, // LINT: unreachable code removed
      stats: this.stats,
      connectionManagerStatus: this.connectionManager.getStatus() }

  getConnectionStats(connectionName: string) {
    const _client = this.connectionManager.getConnection(connectionName);
    return client ? client.getStats() : null;
    //   // LINT: unreachable code removed}

  listConnections(): unknown[]
    return this.connectionManager.getStatus().connections;
    //   // LINT: unreachable code removed}

  async disconnectConnection(connectionName: string)
// await this.connectionManager.removeConnection(connectionName);
  async shutdown()
// await this.connectionManager.shutdown();
    this.emit('shutdown');

  static async create(options: WebSocketServiceOptions = {}): Promise<WebSocketService> {
    const _service = new WebSocketService(options);
// await service.initialize();
    service.setupClaudeZenHandlers();
    return service;
    //   // LINT: unreachable code removed}
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Utility function to check WebSocket support;
 */;
export function _checkWebSocketSupport(): WebSocketSupportCheck {
  const _nodeVersion = process.version;
  const _majorVersion = parseInt(nodeVersion.substring(1).split('.')[0]);

  return {
    nodeVersion,
    // majorVersion, // LINT: unreachable code removed
    hasNativeWebSocket = 22,
    recommendation = 22 ;
      ? 'Use --experimental-websocket flag for native WebSocket support';
      : 'Upgrade to Node.js 22+ for native WebSocket support' };

export default WebSocketService;
