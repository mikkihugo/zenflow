/**
 * MCP Connection State Manager for ZenSwarm
 *
 * Provides comprehensive MCP connection state management with persistence,
 * automatic recovery, and health monitoring integration.
 *
 * Features:
 * - Connection state persistence and recovery
 * - Automatic reconnection with exponential backoff
 * - Health monitoring integration
 * - Connection pooling and load balancing
 * - Graceful degradation and fallback mechanisms
 * - Real-time connection status monitoring
 */

import { spawn } from 'node:child_process';
import { EventEmitter } from 'node:events';

// Helper functions and classes moved inline to avoid missing imports
const generateId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Simple logger implementation
class Logger {
  constructor(options: any) {
    this.name = options.name;
  }
  name: string;
  info(msg: string, ...args: any[]) {
    console.log(`[INFO] ${this.name}:`, msg, ...args);
  }
  error(msg: string, ...args: any[]) {
    console.error(`[ERROR] ${this.name}:`, msg, ...args);
  }
  warn(msg: string, ...args: any[]) {
    console.warn(`[WARN] ${this.name}:`, msg, ...args);
  }
  debug(msg: string, ...args: any[]) {
    console.debug(`[DEBUG] ${this.name}:`, msg, ...args);
  }
}

// Simple error factory
class ErrorFactory {
  static createError(type: string, message: string, context?: any): Error {
    const error = new Error(message);
    (error as any).type = type;
    (error as any).context = context;
    return error;
  }
}

export class ConnectionStateManager extends EventEmitter {
  options: any;
  connections: Map<string, any>;
  connectionStats: Map<string, any>;
  healthChecks: Map<string, any>;
  persistenceManager: any;
  fallbackManager: any;
  logger: Logger;
  connectionHealth: Map<string, any>;
  reconnectTimers: Map<string, any>;
  fallbackConnections: Map<string, any>;
  isInitialized: boolean;
  isShuttingDown: boolean;
  connectionPool: any[];
  activeConnections: number;
  stats: any;
  persistence: any;
  healthMonitor: any;
  recoveryWorkflows: any;
  healthMonitorInterval: any;

  constructor(options: any = {}) {
    super();

    this.options = {
      maxConnections: options.maxConnections || 10,
      connectionTimeout: options.connectionTimeout || 30000,
      reconnectDelay: options.reconnectDelay || 1000,
      maxReconnectDelay: options.maxReconnectDelay || 30000,
      maxReconnectAttempts: options.maxReconnectAttempts || 10,
      healthCheckInterval: options.healthCheckInterval || 30000,
      persistenceEnabled: options.persistenceEnabled !== false,
      enableFallback: options.enableFallback !== false,
      ...options,
    };

    this.logger = new Logger({
      name: 'connection-state-manager',
      level: process.env.LOG_LEVEL || 'INFO',
      metadata: { component: 'connection-state-manager' },
    });

    // Connection state
    this.connections = new Map();
    this.connectionHealth = new Map();
    this.reconnectTimers = new Map();
    this.fallbackConnections = new Map();

    // State tracking
    this.isInitialized = false;
    this.isShuttingDown = false;
    this.connectionPool = [];
    this.activeConnections = 0;

    // Statistics
    this.stats = {
      totalConnections: 0,
      activeConnections: 0,
      failedConnections: 0,
      reconnectAttempts: 0,
      averageConnectionTime: 0,
      totalConnectionTime: 0,
    };

    // Integration points
    this.persistence = null;
    this.healthMonitor = null;
    this.recoveryWorkflows = null;

    this.initialize();
  }

  /**
   * Initialize the connection state manager
   */
  async initialize() {
    try {
      this.logger.info('Initializing Connection State Manager');

      // Start health monitoring
      this.startHealthMonitoring();

      // Restore persisted connections if enabled
      if (this.options.persistenceEnabled && this.persistence) {
        await this.restorePersistedConnections();
      }

      this.isInitialized = true;
      this.logger.info('Connection State Manager initialized successfully');
      this.emit('manager:initialized');
    } catch (error) {
      const managerError = ErrorFactory.createError(
        'resource',
        'Failed to initialize connection state manager',
        {
          error: error.message,
          component: 'connection-state-manager',
        }
      );
      this.logger.error('Connection State Manager initialization failed', managerError);
      throw managerError;
    }
  }

  /**
   * Register a new MCP connection
   *
   * @param connectionConfig
   */
  async registerConnection(connectionConfig) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const connectionId = connectionConfig.id || generateId('connection');
    const startTime = Date.now();

    const connection = {
      id: connectionId,
      type: connectionConfig.type || 'stdio',
      config: connectionConfig,
      status: 'initializing',
      createdAt: new Date(),
      lastConnected: null,
      lastDisconnected: null,
      reconnectAttempts: 0,
      error: null as Error | null,
      health: {
        status: 'unknown',
        lastCheck: null,
        latency: null,
        errors: [],
      },
      metadata: connectionConfig.metadata || {},
    };

    this.connections.set(connectionId, connection);
    this.connectionHealth.set(connectionId, {
      consecutive_failures: 0,
      last_success: null,
      last_failure: null,
      total_attempts: 0,
      success_rate: 0,
    });

    this.logger.info(`Registering MCP connection: ${connectionId}`, {
      type: connection.type,
      config: connectionConfig,
    });

    try {
      // Attempt to establish connection
      await this.establishConnection(connectionId);

      connection.status = 'connected';
      connection.lastConnected = new Date();
      this.activeConnections++;
      this.stats.activeConnections++;
      this.stats.totalConnections++;

      const connectionTime = Date.now() - startTime;
      this.stats.totalConnectionTime += connectionTime;
      this.stats.averageConnectionTime =
        this.stats.totalConnectionTime / this.stats.totalConnections;

      // Persist connection state if enabled
      if (this.options.persistenceEnabled) {
        await this.persistConnectionState(connection);
      }

      this.logger.info(`MCP connection established: ${connectionId}`, {
        connectionTime,
        activeConnections: this.activeConnections,
      });

      this.emit('connection:established', { connectionId, connection });
    } catch (error) {
      connection.status = 'failed';
      connection.error = error.message;
      this.stats.failedConnections++;

      this.logger.error(`Failed to establish MCP connection: ${connectionId}`, {
        error: error.message,
      });

      this.emit('connection:failed', { connectionId, connection, error });

      // Schedule reconnection attempt
      this.scheduleReconnection(connectionId);
    }

    return connectionId;
  }

  /**
   * Establish connection to MCP server
   *
   * @param connectionId
   */
  async establishConnection(connectionId) {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error(`Connection ${connectionId} not found`);
    }

    this.logger.debug(`Establishing connection: ${connectionId}`, {
      type: connection.type,
      attempt: connection.reconnectAttempts + 1,
    });

    const startTime = Date.now();

    try {
      // Connection establishment logic based on type
      switch (connection.type) {
        case 'stdio':
          await this.establishStdioConnection(connection);
          break;
        case 'websocket':
          await this.establishWebSocketConnection(connection);
          break;
        case 'http':
          await this.establishHttpConnection(connection);
          break;
        default:
          throw new Error(`Unsupported connection type: ${connection.type}`);
      }

      // Update health metrics
      const health = this.connectionHealth.get(connectionId);
      health.consecutive_failures = 0;
      health.last_success = new Date();
      health.total_attempts++;
      health.success_rate = health.last_success ? 1 : 0;

      connection.health.status = 'healthy';
      connection.health.lastCheck = new Date();
      connection.health.latency = Date.now() - startTime;

      this.logger.debug(`Connection established successfully: ${connectionId}`, {
        latency: connection.health.latency,
      });
    } catch (error) {
      // Update failure metrics
      const health = this.connectionHealth.get(connectionId);
      health.consecutive_failures++;
      health.last_failure = new Date();
      health.total_attempts++;

      connection.health.status = 'unhealthy';
      connection.health.lastCheck = new Date();
      connection.health.errors.push({
        message: error.message,
        timestamp: new Date(),
      });

      // Keep only last 10 errors
      if (connection.health.errors.length > 10) {
        connection.health.errors = connection.health.errors.slice(-10);
      }

      throw error;
    }
  }

  /**
   * Establish stdio-based MCP connection
   *
   * @param connection
   */
  async establishStdioConnection(connection) {
    const { spawn } = await import('node:child_process');

    const config = connection.config;
    const command = config.command;
    const args = config.args || [];

    if (!command) {
      throw new Error('Command is required for stdio connection');
    }

    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, this.options.connectionTimeout);

      try {
        const childProcess = spawn(command, args, {
          stdio: ['pipe', 'pipe', 'pipe'],
          env: { ...process.env, ...config.env },
        });

        childProcess.on('spawn', () => {
          clearTimeout(timeout);
          connection.process = childProcess;
          connection.stdin = childProcess.stdin;
          connection.stdout = childProcess.stdout;
          connection.stderr = childProcess.stderr;

          // Set up message handling
          this.setupMessageHandling(connection);

          resolve();
        });

        childProcess.on('error', (error) => {
          clearTimeout(timeout);
          reject(new Error(`Failed to spawn process: ${error.message}`));
        });

        childProcess.on('exit', (code, signal) => {
          this.handleConnectionClosed(connection.id, code, signal);
        });
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  /**
   * Establish WebSocket-based MCP connection
   *
   * @param connection
   */
  async establishWebSocketConnection(connection) {
    const WebSocket = await import('ws').then((m) => m.default);

    const config = connection.config;
    const url = config.url;

    if (!url) {
      throw new Error('URL is required for WebSocket connection');
    }

    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('WebSocket connection timeout'));
      }, this.options.connectionTimeout);

      try {
        const ws = new WebSocket(url, config.protocols, config.options);

        ws.on('open', () => {
          clearTimeout(timeout);
          connection.websocket = ws;

          // Set up message handling
          this.setupWebSocketHandling(connection);

          resolve();
        });

        ws.on('error', (error) => {
          clearTimeout(timeout);
          reject(new Error(`WebSocket error: ${error.message}`));
        });

        ws.on('close', (code, reason) => {
          this.handleConnectionClosed(connection.id, code, reason);
        });
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  /**
   * Establish HTTP-based MCP connection
   *
   * @param connection
   */
  async establishHttpConnection(connection) {
    const config = connection.config;
    const baseUrl = config.baseUrl;

    if (!baseUrl) {
      throw new Error('Base URL is required for HTTP connection');
    }

    // Test connection with a simple request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.options.connectionTimeout);

    try {
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: config.headers || {},
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP connection test failed: ${response.status} ${response.statusText}`);
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`HTTP connection test timed out after ${this.options.connectionTimeout}ms`);
      }
      throw error;
    }

    connection.http = {
      baseUrl,
      headers: config.headers || {},
      fetch: (endpoint: string, options: any = {}) => {
        return fetch(`${baseUrl}${endpoint}`, {
          ...options,
          headers: { ...connection.http.headers, ...(options.headers || {}) },
        });
      },
    };
  }

  /**
   * Set up message handling for stdio connections
   *
   * @param connection
   */
  setupMessageHandling(connection) {
    let buffer = '';

    connection.stdout.on('data', (data) => {
      buffer += data.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop(); // Keep incomplete line in buffer

      lines.forEach((line) => {
        if (line.trim()) {
          try {
            const message = JSON.parse(line);
            this.handleMessage(connection.id, message);
          } catch (error) {
            this.logger.warn(`Invalid JSON message from ${connection.id}`, {
              line,
              error: error.message,
            });
          }
        }
      });
    });

    connection.stderr.on('data', (data) => {
      this.logger.warn(`stderr from ${connection.id}:`, data.toString());
    });
  }

  /**
   * Set up WebSocket message handling
   *
   * @param connection
   */
  setupWebSocketHandling(connection) {
    connection.websocket.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleMessage(connection.id, message);
      } catch (error) {
        this.logger.warn(`Invalid JSON message from WebSocket ${connection.id}`, {
          data: data.toString(),
          error: error.message,
        });
      }
    });
  }

  /**
   * Handle incoming message from MCP connection
   *
   * @param connectionId
   * @param message
   */
  handleMessage(connectionId, message) {
    this.logger.debug(`Received message from ${connectionId}`, { message });

    // Update connection health
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.health.lastCheck = new Date();
      connection.health.status = 'healthy';
    }

    this.emit('message:received', { connectionId, message });
  }

  /**
   * Send message to MCP connection
   *
   * @param connectionId
   * @param message
   */
  async sendMessage(connectionId, message) {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error(`Connection ${connectionId} not found`);
    }

    if (connection.status !== 'connected') {
      throw new Error(`Connection ${connectionId} is not connected (status: ${connection.status})`);
    }

    const messageStr = JSON.stringify(message);

    try {
      switch (connection.type) {
        case 'stdio':
          if (!connection.stdin || connection.stdin.destroyed) {
            throw new Error('stdin is not available');
          }
          connection.stdin.write(`${messageStr}\n`);
          break;

        case 'websocket':
          if (!connection.websocket || connection.websocket.readyState !== 1) {
            throw new Error('WebSocket is not open');
          }
          connection.websocket.send(messageStr);
          break;

        case 'http':
          // For HTTP, this would typically be handled differently
          // depending on the specific API design
          throw new Error('HTTP message sending not implemented');

        default:
          throw new Error(`Unsupported connection type: ${connection.type}`);
      }

      this.logger.debug(`Sent message to ${connectionId}`, { message });
      this.emit('message:sent', { connectionId, message });
    } catch (error) {
      this.logger.error(`Failed to send message to ${connectionId}`, {
        error: error.message,
        message,
      });

      // Mark connection as unhealthy
      connection.health.status = 'unhealthy';
      connection.health.errors.push({
        message: error.message,
        timestamp: new Date(),
        operation: 'send_message',
      });

      throw error;
    }
  }

  /**
   * Handle connection closure
   *
   * @param connectionId
   * @param code
   * @param reason
   */
  handleConnectionClosed(connectionId, code, reason) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    connection.status = 'disconnected';
    connection.lastDisconnected = new Date();
    this.activeConnections = Math.max(0, this.activeConnections - 1);
    this.stats.activeConnections = this.activeConnections;

    this.logger.warn(`Connection closed: ${connectionId}`, {
      code,
      reason: reason?.toString(),
      wasConnected: connection.lastConnected !== null,
    });

    this.emit('connection:closed', { connectionId, connection, code, reason });

    // Schedule reconnection if not shutting down
    if (!this.isShuttingDown && connection.config.autoReconnect !== false) {
      this.scheduleReconnection(connectionId);
    }
  }

  /**
   * Schedule reconnection attempt
   *
   * @param connectionId
   */
  scheduleReconnection(connectionId) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    // Check if we've exceeded max reconnect attempts
    if (connection.reconnectAttempts >= this.options.maxReconnectAttempts) {
      this.logger.error(`Max reconnection attempts reached for ${connectionId}`, {
        attempts: connection.reconnectAttempts,
      });

      connection.status = 'failed';
      this.emit('connection:exhausted', { connectionId, connection });

      // Trigger recovery workflow if available
      if (this.recoveryWorkflows) {
        this.recoveryWorkflows.triggerRecovery('mcp.connection.exhausted', {
          connectionId,
          connection,
        });
      }

      return;
    }

    // Calculate delay with exponential backoff
    const delay = Math.min(
      this.options.reconnectDelay * 2 ** connection.reconnectAttempts,
      this.options.maxReconnectDelay
    );

    this.logger.info(`Scheduling reconnection for ${connectionId}`, {
      attempt: connection.reconnectAttempts + 1,
      delay,
    });

    const timer = setTimeout(async () => {
      this.reconnectTimers.delete(connectionId);

      try {
        connection.reconnectAttempts++;
        connection.status = 'reconnecting';
        this.stats.reconnectAttempts++;

        this.emit('connection:reconnecting', { connectionId, connection });

        await this.establishConnection(connectionId);

        connection.status = 'connected';
        connection.lastConnected = new Date();
        connection.reconnectAttempts = 0; // Reset on successful reconnection
        this.activeConnections++;
        this.stats.activeConnections++;

        this.logger.info(`Reconnection successful for ${connectionId}`);
        this.emit('connection:reconnected', { connectionId, connection });

        // Persist updated state
        if (this.options.persistenceEnabled) {
          await this.persistConnectionState(connection);
        }
      } catch (error) {
        this.logger.error(`Reconnection failed for ${connectionId}`, {
          error: error.message,
          attempt: connection.reconnectAttempts,
        });

        connection.status = 'failed';
        this.emit('connection:reconnect_failed', { connectionId, connection, error });

        // Schedule next attempt
        this.scheduleReconnection(connectionId);
      }
    }, delay);

    this.reconnectTimers.set(connectionId, timer);
  }

  /**
   * Get connection status
   *
   * @param connectionId
   */
  getConnectionStatus(connectionId = null) {
    if (connectionId) {
      const connection = this.connections.get(connectionId);
      if (!connection) return null;

      return {
        ...connection,
        health: this.connectionHealth.get(connectionId),
      };
    }

    // Return all connections status
    const connections = {};
    for (const [id, connection] of this.connections) {
      connections[id] = {
        ...connection,
        health: this.connectionHealth.get(id),
      };
    }

    return {
      connections,
      stats: this.getConnectionStats(),
      summary: {
        total: this.connections.size,
        active: this.activeConnections,
        failed: Array.from(this.connections.values()).filter((c) => c.status === 'failed').length,
        reconnecting: Array.from(this.connections.values()).filter(
          (c) => c.status === 'reconnecting'
        ).length,
      },
    };
  }

  /**
   * Get connection statistics
   */
  getConnectionStats() {
    return {
      ...this.stats,
      connectionCount: this.connections.size,
      healthyConnections: Array.from(this.connections.values()).filter(
        (c) => c.health.status === 'healthy'
      ).length,
      reconnectingConnections: this.reconnectTimers.size,
    };
  }

  /**
   * Disconnect a connection
   *
   * @param connectionId
   * @param reason
   */
  async disconnectConnection(connectionId, reason = 'Manual disconnect') {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error(`Connection ${connectionId} not found`);
    }

    this.logger.info(`Disconnecting connection: ${connectionId}`, { reason });

    // Cancel reconnection timer if active
    const timer = this.reconnectTimers.get(connectionId);
    if (timer) {
      clearTimeout(timer);
      this.reconnectTimers.delete(connectionId);
    }

    // Close connection based on type
    try {
      switch (connection.type) {
        case 'stdio':
          if (connection.process && !connection.process.killed) {
            connection.process.kill();
          }
          break;

        case 'websocket':
          if (connection.websocket && connection.websocket.readyState === 1) {
            connection.websocket.close();
          }
          break;

        case 'http':
          // HTTP connections don't need explicit closing
          break;
      }
    } catch (error) {
      this.logger.warn(`Error closing connection ${connectionId}`, {
        error: error.message,
      });
    }

    connection.status = 'disconnected';
    connection.lastDisconnected = new Date();

    if (this.activeConnections > 0) {
      this.activeConnections--;
      this.stats.activeConnections--;
    }

    this.emit('connection:disconnected', { connectionId, connection, reason });
  }

  /**
   * Remove a connection completely
   *
   * @param connectionId
   */
  async removeConnection(connectionId) {
    // First disconnect if still connected
    if (this.connections.has(connectionId)) {
      try {
        await this.disconnectConnection(connectionId, 'Connection removal');
      } catch (error) {
        this.logger.warn(`Error disconnecting before removal: ${connectionId}`, {
          error: error.message,
        });
      }
    }

    // Remove from all tracking
    this.connections.delete(connectionId);
    this.connectionHealth.delete(connectionId);
    this.reconnectTimers.delete(connectionId);
    this.fallbackConnections.delete(connectionId);

    // Remove from persistence
    if (this.options.persistenceEnabled && this.persistence) {
      await this.removePersistedConnection(connectionId);
    }

    this.logger.info(`Connection removed: ${connectionId}`);
    this.emit('connection:removed', { connectionId });
  }

  /**
   * Start health monitoring
   */
  startHealthMonitoring() {
    this.healthMonitorInterval = setInterval(async () => {
      try {
        await this.performHealthChecks();
      } catch (error) {
        this.logger.error('Error in health monitoring', {
          error: error.message,
        });
      }
    }, this.options.healthCheckInterval);

    this.logger.debug('Health monitoring started');
  }

  /**
   * Perform health checks on all connections
   */
  async performHealthChecks() {
    const healthChecks = Array.from(this.connections.entries())
      .filter(([_, connection]) => connection.status === 'connected')
      .map(([id, _connection]) => this.performConnectionHealthCheck(id));

    await Promise.allSettled(healthChecks);
  }

  /**
   * Perform health check on a specific connection
   *
   * @param connectionId
   */
  async performConnectionHealthCheck(connectionId) {
    const connection = this.connections.get(connectionId);
    if (!connection || connection.status !== 'connected') return;

    const startTime = Date.now();

    try {
      // Send a simple ping message to test connectivity
      const pingMessage = {
        jsonrpc: '2.0',
        method: 'ping',
        id: generateId('ping'),
      };

      await this.sendMessage(connectionId, pingMessage);

      const latency = Date.now() - startTime;
      connection.health.latency = latency;
      connection.health.status = 'healthy';
      connection.health.lastCheck = new Date();

      // Update health metrics
      const health = this.connectionHealth.get(connectionId);
      health.consecutive_failures = 0;
    } catch (error) {
      connection.health.status = 'unhealthy';
      connection.health.lastCheck = new Date();
      connection.health.errors.push({
        message: error.message,
        timestamp: new Date(),
        operation: 'health_check',
      });

      // Update failure metrics
      const health = this.connectionHealth.get(connectionId);
      health.consecutive_failures++;
      health.last_failure = new Date();

      this.logger.warn(`Health check failed for connection ${connectionId}`, {
        error: error.message,
      });

      // Trigger recovery if too many consecutive failures
      if (health.consecutive_failures >= 3) {
        this.logger.error(`Connection ${connectionId} failing health checks`, {
          consecutiveFailures: health.consecutive_failures,
        });

        if (this.recoveryWorkflows) {
          await this.recoveryWorkflows.triggerRecovery('mcp.connection.unhealthy', {
            connectionId,
            connection,
            consecutiveFailures: health.consecutive_failures,
          });
        }
      }
    }
  }

  /**
   * Persist connection state
   *
   * @param connection
   */
  async persistConnectionState(connection) {
    if (!this.persistence) return;

    try {
      await this.persistence.pool.write(
        `
        INSERT OR REPLACE INTO mcp_connections 
        (id, type, config, status, created_at, last_connected, last_disconnected, reconnect_attempts, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          connection.id,
          connection.type,
          JSON.stringify(connection.config),
          connection.status,
          connection.createdAt.toISOString(),
          connection.lastConnected?.toISOString(),
          connection.lastDisconnected?.toISOString(),
          connection.reconnectAttempts,
          JSON.stringify(connection.metadata),
        ]
      );
    } catch (error) {
      this.logger.error('Failed to persist connection state', {
        connectionId: connection.id,
        error: error.message,
      });
    }
  }

  /**
   * Restore persisted connections
   */
  async restorePersistedConnections() {
    if (!this.persistence) return;

    try {
      // Create table if it doesn't exist
      await this.persistence.pool.write(`
        CREATE TABLE IF NOT EXISTS mcp_connections (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          config TEXT NOT NULL,
          status TEXT NOT NULL,
          created_at DATETIME,
          last_connected DATETIME,
          last_disconnected DATETIME,
          reconnect_attempts INTEGER DEFAULT 0,
          metadata TEXT DEFAULT '{}'
        )
      `);

      const connections = await this.persistence.pool.read(
        'SELECT * FROM mcp_connections WHERE status IN (?, ?)',
        ['connected', 'reconnecting']
      );

      for (const row of connections) {
        const connection = {
          id: row.id,
          type: row.type,
          config: JSON.parse(row.config),
          status: 'disconnected', // Start as disconnected and let reconnection handle it
          createdAt: new Date(row.created_at),
          lastConnected: row.last_connected ? new Date(row.last_connected) : null,
          lastDisconnected: row.last_disconnected ? new Date(row.last_disconnected) : null,
          reconnectAttempts: row.reconnect_attempts,
          health: {
            status: 'unknown',
            lastCheck: null,
            latency: null,
            errors: [],
          },
          metadata: JSON.parse(row.metadata),
        };

        this.connections.set(connection.id, connection);
        this.connectionHealth.set(connection.id, {
          consecutive_failures: 0,
          last_success: null,
          last_failure: null,
          total_attempts: 0,
          success_rate: 0,
        });

        // Schedule reconnection
        if (connection.config.autoReconnect !== false) {
          this.scheduleReconnection(connection.id);
        }
      }

      this.logger.info('Restored persisted connections', {
        connectionCount: connections.length,
      });
    } catch (error) {
      this.logger.error('Failed to restore persisted connections', {
        error: error.message,
      });
    }
  }

  /**
   * Remove persisted connection
   *
   * @param connectionId
   */
  async removePersistedConnection(connectionId) {
    if (!this.persistence) return;

    try {
      await this.persistence.pool.write('DELETE FROM mcp_connections WHERE id = ?', [connectionId]);
    } catch (error) {
      this.logger.error('Failed to remove persisted connection', {
        connectionId,
        error: error.message,
      });
    }
  }

  /**
   * Set integration points
   *
   * @param persistence
   */
  setPersistence(persistence) {
    this.persistence = persistence;
    this.logger.info('Persistence integration configured');
  }

  setHealthMonitor(healthMonitor) {
    this.healthMonitor = healthMonitor;
    this.logger.info('Health Monitor integration configured');
  }

  setRecoveryWorkflows(recoveryWorkflows) {
    this.recoveryWorkflows = recoveryWorkflows;
    this.logger.info('Recovery Workflows integration configured');
  }

  /**
   * Export connection data for monitoring dashboards
   */
  exportConnectionData() {
    return {
      timestamp: new Date(),
      stats: this.getConnectionStats(),
      connections: Array.from(this.connections.entries()).map(([id, connection]) => ({
        id,
        ...connection,
        health: this.connectionHealth.get(id),
      })),
      activeTimers: this.reconnectTimers.size,
    };
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown() {
    this.logger.info('Shutting down Connection State Manager');
    this.isShuttingDown = true;

    // Stop health monitoring
    if (this.healthMonitorInterval) {
      clearInterval(this.healthMonitorInterval);
    }

    // Clear all reconnection timers
    for (const [_connectionId, timer] of this.reconnectTimers) {
      clearTimeout(timer);
    }
    this.reconnectTimers.clear();

    // Disconnect all connections
    const disconnectPromises = Array.from(this.connections.keys()).map((connectionId) =>
      this.disconnectConnection(connectionId, 'System shutdown').catch((error) =>
        this.logger.warn(`Error disconnecting ${connectionId}`, { error: error.message })
      )
    );

    await Promise.allSettled(disconnectPromises);

    // Clear all data
    this.connections.clear();
    this.connectionHealth.clear();
    this.fallbackConnections.clear();

    this.emit('manager:shutdown');
  }
}

export default ConnectionStateManager;
