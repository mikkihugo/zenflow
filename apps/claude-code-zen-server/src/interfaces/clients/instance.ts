/**
 * @fileoverview UACL Instance Manager
 *
 * Provides UACL singleton instance and instance management functionality
 * separate from the main index to avoid circular dependencies.
 *
 * This file provides access to the UACL singleton instance and helpers
 * without importing the full index.ts that also imports validation.ts
 *
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0
 */

import {
  getLogger,
  type Logger
} from '@claude-zen/foundation';
import type {
  ClientInstance,
  ClientConfig
} from './core/interfaces';

/**
 * Client manager configuration interface.
 */
export interface ClientManagerConfig {
  /** Enable automatic health checking */
  enableHealthChecks?: boolean;
  /** Metrics collection interval in milliseconds */
  metricsInterval?: number;
  /** Maximum number of concurrent clients */
  maxClients?: number;
  /** Enable automatic retry mechanisms */
  enableRetries?: boolean;
  /** Enable performance metrics collection */
  enableMetrics?: boolean;
  /** Connection timeout in milliseconds */
  connectionTimeout?: number;
  /** Health check interval in milliseconds */
  healthCheckInterval?: number;
}

/**
 * UACL instance metrics interface.
 */
export interface UACLMetrics {
  initialized: boolean;
  clientCount: number;
  healthCheckCount: number;
  uptime: number;
  lastActivity: Date;
  errors: number;
  connections: {
    active: number;
    total: number;
    failed: number;
  };
  performance: {
    avgResponseTime: number;
    maxResponseTime: number;
    throughput: number;
  };
}

/**
 * Client Instance Manager.
 *
 * Provides centralized management for client instances with health monitoring,
 * metrics collection, and lifecycle management. Follows singleton pattern for
 * Core functionality for managing multiple client types with unified interface.
 * Implements singleton pattern to ensure single point of access.
 */
export class ClientInstanceManager {
  private static instance: ClientInstanceManager;
  private initialized = false;
  private logger: Logger;
  private clients = new Map<string, ClientInstance>();
  private config?: ClientManagerConfig;
  private healthCheckInterval?: NodeJS.Timeout;
  private metricsInterval?: NodeJS.Timeout;
  private startTime = Date.now();
  private errorCount = 0;
  private healthCheckCount = 0;

  private constructor(config?: ClientManagerConfig) {
    this.logger = getLogger('ClientInstanceManager');
    this.config = config;
    this.logger.debug('UACL instance created');
  }

  /**
   * Get singleton instance of ClientInstanceManager.
   */
  public static getInstance(config?: ClientManagerConfig): ClientInstanceManager {
    if (!ClientInstanceManager.instance) {
      ClientInstanceManager.instance = new ClientInstanceManager(config);
    }
    return ClientInstanceManager.instance;
  }

  /**
   * Initialize UACL system.
   */
  public async initialize(config?: ClientManagerConfig): Promise<void> {
    if (this.initialized) {
      this.logger.debug('UACL already initialized');
      return;
    }

    if (config) {
      this.config = {
        ...this.config,
        ...config
      };
    }

    this.logger.info('Initializing UACL system...');

    try {
      // Initialize internal systems
      this.setupHealthChecks();
      this.setupMetricsCollection();

      this.initialized = true;
      this.logger.info('UACL system initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize UACL system:', error);
      this.errorCount++;
      throw error;
    }
  }

  /**
   * Check if UACL is initialized.
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Register a client instance.
   */
  public registerClient(id: string, client: ClientInstance): void {
    if (this.clients.has(id)) {
      throw new Error(`Client with ID '${id}' is already registered`);
    }

    this.clients.set(id, client);
    this.logger.info(`Client registered: ${id}`);
  }

  /**
   * Unregister a client instance.
   */
  public unregisterClient(id: string): boolean {
    const removed = this.clients.delete(id);
    if (removed) {
      this.logger.info(`Client unregistered: ${id}`);
    }
    return removed;
  }

  /**
   * Get a client instance by ID.
   */
  public getClient(id: string): ClientInstance | undefined {
    return this.clients.get(id);
  }

  /**
   * Get all client instances.
   */
  public getAllClients(): ClientInstance[] {
    return Array.from(this.clients.values());
  }

  /**
   * Get client IDs.
   */
  public getClientIds(): string[] {
    return Array.from(this.clients.keys());
  }

  /**
   * Check if client exists.
   */
  public hasClient(id: string): boolean {
    return this.clients.has(id);
  }

  /**
   * Get client count.
   */
  public getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Get UACL metrics.
   */
  public getMetrics(): UACLMetrics {
    const uptime = Date.now() - this.startTime;
    let activeConnections = 0;
    let totalConnections = 0;
    let failedConnections = 0;

    // Count connection statistics from clients
    for (const client of this.clients.values()) {
      totalConnections++;
      if (client.isConnected) {
        activeConnections++;
      }
      // Note: failedConnections would need to be tracked separately
    }

    return {
      initialized: this.initialized,
      clientCount: this.clients.size,
      healthCheckCount: this.healthCheckCount,
      uptime,
      lastActivity: new Date(),
      errors: this.errorCount,
      connections: {
        active: activeConnections,
        total: totalConnections,
        failed: failedConnections
      },
      performance: {
        avgResponseTime: 0, // Would need response time tracking
        maxResponseTime: 0,
        throughput: 0
      }
    };
  }

  /**
   * Perform health check on all clients.
   */
  public async healthCheck(): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();
    this.healthCheckCount++;

    for (const [id, client] of this.clients) {
      try {
        // Check if client has health check method
        let isHealthy = true;
        if (typeof client.healthCheck === 'function') {
          const healthResult = await client.healthCheck();
          isHealthy = healthResult.status === 'healthy';
        } else if ('isConnected' in client) {
          isHealthy = Boolean(client.isConnected);
        }

        results.set(id, isHealthy);
      } catch (error) {
        this.logger.warn(`Health check failed for client ${id}:`, error);
        results.set(id, false);
        this.errorCount++;
      }
    }

    return results;
  }

  /**
   * Shutdown UACL system.
   */
  public async shutdown(): Promise<void> {
    this.logger.info('Shutting down UACL system...');

    // Stop intervals
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }

    // Shutdown all clients
    const shutdownPromises = Array.from(this.clients.values()).map(async (client) => {
      try {
        if (typeof client.shutdown === 'function') {
          await client.shutdown();
        } else if (typeof client.disconnect === 'function') {
          await client.disconnect();
        }
      } catch (error) {
        this.logger.error(`Error shutting down client:`, error);
        this.errorCount++;
      }
    });

    await Promise.allSettled(shutdownPromises);

    // Clear clients
    this.clients.clear();

    this.initialized = false;
    this.logger.info('UACL system shutdown completed');
  }

  /**
   * Setup health checking.
   */
  private setupHealthChecks(): void {
    if (this.config?.enableHealthChecks !== false) {
      const interval = this.config?.healthCheckInterval || 30000; // 30 seconds
      this.healthCheckInterval = setInterval(async () => {
        try {
          await this.healthCheck();
        } catch (error) {
          this.logger.error('Error during health check:', error);
          this.errorCount++;
        }
      }, interval);
    }
  }

  /**
   * Setup metrics collection.
   */
  private setupMetricsCollection(): void {
    if (this.config?.enableMetrics !== false) {
      const interval = this.config?.metricsInterval || 60000; // 1 minute
      this.metricsInterval = setInterval(() => {
        try {
          const metrics = this.getMetrics();
          this.logger.debug('UACL metrics:', metrics);
        } catch (error) {
          this.logger.error('Error collecting metrics:', error);
          this.errorCount++;
        }
      }, interval);
    }
  }
}

/**
 * Global instance manager.
 */
export const globalInstanceManager = ClientInstanceManager.getInstance();

/**
 * Initialize UACL globally.
 */
export const initializeUACLInstance = async (config?: ClientManagerConfig): Promise<void> => {
  return globalInstanceManager.initialize(config);
};

/**
 * Check if UACL is initialized globally.
 */
export const isUACLInstanceInitialized = (): boolean => {
  return globalInstanceManager.isInitialized();
};

export default ClientInstanceManager;