/**
 * WebSocket Client Factory for UACL
 * 
 * Factory implementation for creating and managing WebSocket client instances
 * with connection pooling, lifecycle management, and monitoring.
 */

import { getLogger } from '@claude-zen/foundation';
import type {
  Client,
  ClientFactory,
  ClientConfig
} from '../core/interfaces';
import type { ProtocolType } from '../types';
import { ProtocolTypes } from '../types';
import { WebSocketClientAdapter } from './websocket-client-adapter';

const logger = getLogger('WebSocketClientFactory');

/**
 * WebSocket client configuration extending base client config
 */
export interface WebSocketClientConfig extends ClientConfig {
  url: string;
  protocols?: string[];
  headers?: Record<string, string>;
  pingInterval?: number;
  pongTimeout?: number;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  messageQueueSize?: number;
  binaryType?: 'blob' | 'arraybuffer';
}

/**
 * Connection information for monitoring and management
 */
export interface WebSocketConnectionInfo {
  id: string;
  url: string;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  createdAt: Date;
  lastConnectedAt?: Date;
  reconnectAttempts: number;
  messagesSent: number;
  messagesReceived: number;
  bytesTransferred: number;
  errors: number;
}

/**
 * Factory statistics for monitoring
 */
export interface WebSocketFactoryStats {
  totalClients: number;
  activeConnections: number;
  totalConnections: number;
  failedConnections: number;
  averageConnectionTime: number;
  messagesSent: number;
  messagesReceived: number;
  bytesTransferred: number;
  errors: number;
  memoryUsage: number;
  queueOverflows: number;
}

/**
 * WebSocket Client Factory implementing UACL ClientFactory interface.
 */
export class WebSocketClientFactory implements ClientFactory {
  private clients = new Map<string, Client>();
  private clientConfigs = new Map<string, WebSocketClientConfig>();
  private connectionPool = new Map<string, WebSocketConnectionInfo>();
  private factoryStats: WebSocketFactoryStats = {
    totalClients: 0,
    activeConnections: 0,
    totalConnections: 0,
    failedConnections: 0,
    averageConnectionTime: 0,
    messagesSent: 0,
    messagesReceived: 0,
    bytesTransferred: 0,
    errors: 0,
    memoryUsage: 0,
    queueOverflows: 0
  };

  /**
   * Create new WebSocket client instance.
   */
  async create(protocol: ProtocolType, config: ClientConfig): Promise<Client> {
    if (protocol !== ProtocolTypes.WEBSOCKET) {
      throw new Error(`Unsupported protocol: ${protocol}. WebSocket factory only supports WebSocket protocol.`);
    }

    const wsConfig = config as WebSocketClientConfig;
    
    // Validate required configuration
    if (!wsConfig.url) {
      throw new Error('WebSocket URL is required in client configuration');
    }

    // Generate unique client ID
    const clientId = this.generateClientId(wsConfig);
    
    try {
      logger.info('Creating WebSocket client', { clientId, url: wsConfig.url });
      
      // Create client instance
      const client = new WebSocketClientAdapter(wsConfig);
      
      // Store client and configuration
      this.clients.set(clientId, client);
      this.clientConfigs.set(clientId, wsConfig);
      
      // Initialize connection info
      const connectionInfo: WebSocketConnectionInfo = {
        id: clientId,
        url: wsConfig.url,
        status: 'disconnected',
        createdAt: new Date(),
        reconnectAttempts: 0,
        messagesSent: 0,
        messagesReceived: 0,
        bytesTransferred: 0,
        errors: 0
      };
      this.connectionPool.set(clientId, connectionInfo);
      
      // Set up client event listeners for monitoring
      this.setupClientMonitoring(client, connectionInfo);
      
      // Update factory statistics
      this.factoryStats.totalClients++;
      
      logger.info('WebSocket client created successfully', { clientId });
      return client;
      
    } catch (error) {
      this.factoryStats.failedConnections++;
      this.factoryStats.errors++;
      logger.error('Failed to create WebSocket client', { clientId, error });
      throw error;
    }
  }

  /**
   * Get existing client by ID
   */
  getClient(clientId: string): Client | undefined {
    return this.clients.get(clientId);
  }

  /**
   * Remove and cleanup client
   */
  async removeClient(clientId: string): Promise<void> {
    const client = this.clients.get(clientId);
    if (!client) {
      return;
    }

    try {
      logger.info('Removing WebSocket client', { clientId });
      
      // Disconnect client if connected
      if (client.getStatus() === 'connected') {
        await client.disconnect();
      }
      
      // Remove from maps
      this.clients.delete(clientId);
      this.clientConfigs.delete(clientId);
      this.connectionPool.delete(clientId);
      
      // Update statistics
      this.factoryStats.totalClients--;
      if (client.getStatus() === 'connected') {
        this.factoryStats.activeConnections--;
      }
      
      logger.info('WebSocket client removed successfully', { clientId });
      
    } catch (error) {
      this.factoryStats.errors++;
      logger.error('Error removing WebSocket client', { clientId, error });
      throw error;
    }
  }

  /**
   * Get all active clients
   */
  getAllClients(): Map<string, Client> {
    return new Map(this.clients);
  }

  /**
   * Get client configuration
   */
  getClientConfig(clientId: string): WebSocketClientConfig | undefined {
    return this.clientConfigs.get(clientId);
  }

  /**
   * Get connection information
   */
  getConnectionInfo(clientId: string): WebSocketConnectionInfo | undefined {
    return this.connectionPool.get(clientId);
  }

  /**
   * Get factory statistics
   */
  getFactoryStats(): WebSocketFactoryStats {
    // Update memory usage
    this.factoryStats.memoryUsage = process.memoryUsage().heapUsed;
    return { ...this.factoryStats };
  }

  /**
   * Check if factory supports a protocol
   */
  supportsProtocol(protocol: ProtocolType): boolean {
    return protocol === ProtocolTypes.WEBSOCKET;
  }

  /**
   * Get supported protocols
   */
  getSupportedProtocols(): ProtocolType[] {
    return [ProtocolTypes.WEBSOCKET];
  }

  /**
   * Cleanup all clients and resources
   */
  async cleanup(): Promise<void> {
    logger.info('Cleaning up WebSocket factory');
    
    const cleanupPromises: Promise<void>[] = [];
    
    for (const [clientId, client] of this.clients) {
      cleanupPromises.push(this.removeClient(clientId));
    }
    
    await Promise.all(cleanupPromises);
    
    // Reset statistics
    this.factoryStats = {
      totalClients: 0,
      activeConnections: 0,
      totalConnections: 0,
      failedConnections: 0,
      averageConnectionTime: 0,
      messagesSent: 0,
      messagesReceived: 0,
      bytesTransferred: 0,
      errors: 0,
      memoryUsage: 0,
      queueOverflows: 0
    };
    
    logger.info('WebSocket factory cleanup completed');
  }

  /**
   * Generate unique client ID
   */
  private generateClientId(config: WebSocketClientConfig): string {
    const url = new URL(config.url);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `ws_${url.hostname}_${timestamp}_${random}`;
  }

  /**
   * Setup monitoring for client events
   */
  private setupClientMonitoring(client: Client, connectionInfo: WebSocketConnectionInfo): void {
    // Listen for connection events
    client.on('connected', () => {
      connectionInfo.status = 'connected';
      connectionInfo.lastConnectedAt = new Date();
      this.factoryStats.activeConnections++;
      this.factoryStats.totalConnections++;
      logger.debug('Client connected', { clientId: connectionInfo.id });
    });

    client.on('disconnected', () => {
      connectionInfo.status = 'disconnected';
      this.factoryStats.activeConnections--;
      logger.debug('Client disconnected', { clientId: connectionInfo.id });
    });

    client.on('connecting', () => {
      connectionInfo.status = 'connecting';
      logger.debug('Client connecting', { clientId: connectionInfo.id });
    });

    client.on('error', (error: Error) => {
      connectionInfo.status = 'error';
      connectionInfo.errors++;
      this.factoryStats.errors++;
      logger.error('Client error', { clientId: connectionInfo.id, error });
    });

    client.on('message', (data: any) => {
      connectionInfo.messagesReceived++;
      this.factoryStats.messagesReceived++;
      
      // Estimate bytes received (rough calculation)
      const bytes = typeof data === 'string' ? data.length : data.byteLength || 0;
      connectionInfo.bytesTransferred += bytes;
      this.factoryStats.bytesTransferred += bytes;
    });

    // Listen for message sent events if available
    if (typeof client.on === 'function') {
      client.on('messageSent', (data: any) => {
        connectionInfo.messagesSent++;
        this.factoryStats.messagesSent++;
        
        // Estimate bytes sent (rough calculation)
        const bytes = typeof data === 'string' ? data.length : data.byteLength || 0;
        connectionInfo.bytesTransferred += bytes;
        this.factoryStats.bytesTransferred += bytes;
      });
    }

    // Listen for reconnect attempts if available
    if (typeof client.on === 'function') {
      client.on('reconnecting', () => {
        connectionInfo.reconnectAttempts++;
        logger.debug('Client reconnecting', { 
          clientId: connectionInfo.id,
          attempts: connectionInfo.reconnectAttempts 
        });
      });
    }
  }

  /**
   * Validate WebSocket client configuration
   */
  private validateConfig(config: WebSocketClientConfig): void {
    if (!config.url) {
      throw new Error('WebSocket URL is required');
    }

    try {
      new URL(config.url);
    } catch (error) {
      throw new Error(`Invalid WebSocket URL: ${config.url}`);
    }

    if (config.protocols && !Array.isArray(config.protocols)) {
      throw new Error('WebSocket protocols must be an array of strings');
    }

    if (config.headers && typeof config.headers !== 'object') {
      throw new Error('WebSocket headers must be an object');
    }

    if (config.pingInterval && (typeof config.pingInterval !== 'number' || config.pingInterval < 1000)) {
      throw new Error('Ping interval must be a number >= 1000ms');
    }

    if (config.pongTimeout && (typeof config.pongTimeout !== 'number' || config.pongTimeout < 1000)) {
      throw new Error('Pong timeout must be a number >= 1000ms');
    }

    if (config.maxReconnectAttempts && (typeof config.maxReconnectAttempts !== 'number' || config.maxReconnectAttempts < 0)) {
      throw new Error('Max reconnect attempts must be a non-negative number');
    }

    if (config.messageQueueSize && (typeof config.messageQueueSize !== 'number' || config.messageQueueSize < 1)) {
      throw new Error('Message queue size must be a positive number');
    }
  }
}

export default WebSocketClientFactory;