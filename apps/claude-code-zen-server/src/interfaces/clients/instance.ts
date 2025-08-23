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
  healthCheckInterval?: number

}

/**
 * UACL instance metrics interface.
 */
export interface UACLMetrics {
  initialized: boolean;
  clientCount: number;
  activeTypes: number;
  timestamp: number

}

/**
 * UACL health status interface.
 */
export interface UACLHealthStatus {
  status: 'healthy' | 'not_initialized' | 'unhealthy';
  initialized: boolean;
  clientsActive: boolean;
  timestamp: number

}

/**
 * Health check result interface.
 */
export interface HealthCheckResult {
  component: string;
  status: 'healthy' | 'unhealthy' | 'warning';
  details?: any

}

/**
 * UACL Instance Manager.
 *
 * Core functionality for managing multiple client types with unified interface.
 * Implements singleton pattern to ensure single point of access.
 */
export class ClientInstanceManager {
  private static instance: ClientInstanceManager;
  private initialized = false;
  private logger: Logger;
  private clients = new Map<string, ClientInstance>();
  private config?: ClientManagerConfig;

  private constructor(config?: ClientManagerConfig) {
  this.logger = getLogger('ClientInstanceManager);
    this.config = config;
    this.logger.debug('UACL instance created)

}

  /**
   * Get singleton instance of ClientInstanceManager.
   */
  public static getInstance(config?: ClientManagerConfig: ClientInstanceManager {
    if (!ClientInstanceManager.instance) {
  ClientInstanceManager.instance = new ClientInstanceManager(config)

}
    return ClientInstanceManager.instance
}

  /**
   * Initialize UACL system.
   */
  public async initialize(config?: ClientManagerConfig): Promise<void>  {
    if (this.initialized) {
  this.logger.debug('UACL already initialized);
      return

}

    if(config' {
      this.config = {
  ...this.config,
  ...config
}
}

    this.logger.info('Initializing UACL system...);

    try {
  // Initialize internal systems
      this.setupHealthChecks();
      this.setupMetricsCollection();

      this.initialized = true;
      this.logger.info('✅ UACL system initialized successfully)'

} catch (error) {
  this.logger.error('Failed to initialize UACL system:','
  error)';
      throw error

}
  }

  /**
   * Check if UACL is initialized.
   */
  public isInitialized(': boolean {
    return this.initialized
}

  /**
   * Register a client instance.
   */
  public registerClient(id: string, client: ClientInstance): void  {
    this.clients.set(id, client);
    this.logger.debug('Registered client: ' + id + ')'
}

  /**
   * Get client by ID.
   */
  public getClient(id: string: ClientInstance | undefined {
    return this.clients.get(id)
}

  /**
   * Remove client by ID.
   */
  public removeClient(id: string): boolean  {
    const removed = this.clients.delete(id);
    if (removed) {
      this.logger.debug('Removed client: ' + id + ')'
}
    return removed
}

  /**
   * Get all registered clients.
   */
  public getAllClients(': ClientInstance[] {
    return Array.from(this.clients.values())
}

  /**
   * Get clients by type.
   */
  public getClientsByType(type: string): ClientInstance[]  {
  return this.getAllClients().filter(client =>
      client.metadata?.type === type
    )

}

  /**
   * Get system metrics.
   */
  public getMetrics(): UACLMetrics  {
    const clientTypes = new Set(
      this.getAllClients().map(client => client.metadata?.type || 'unknown)
    );

    retur' {
  initialized: this.initialized,
  clientCount: this.clients.size,
  activeTypes: clientTypes.size,
  timestamp: Date.now()

}
}

  /**
   * Get health status.
   */
  public getHealthStatus(): UACLHealthStatus  {
    const status = this.initialized
      ? (this.clients.size > 0 ? 'healthy' : 'healthy')
      : 'not_initialized';

    return {
  status: status as 'healthy' | 'not_initialized' | 'unhealthy,
  initialized: this.initialized,
  clientsActive: this.clients.size > 0,
  timestamp: Date.now()

}
}

  /**
   * Shutdown the UACL s'stem.
   */
  public async shutdown(): Promise<void>  {
    if (!this.initialized) {
      return
}

    this.logger.info('Shutting down UACL system...);

    try {
      // Disconnect all clients
      const disconnectPromises = this.getAllClients('.map(async (client) => {
        try {
          if (client.isConnected) {
            await client.disconnect()
}
        } catch (error) {
          this.logger.warn('Failed to disconnect client ' + client.id + ':', error)'
}
      });

      await Promise.allSettled(disconnectPromises);

      // Clear client registry
      this.clients.clear();

      this.initialized = false;
      this.logger.info('UACL system shutdown completed)'
} catch (error) {
  this.logger.error('Error during UACL shutdown:','
  error)';
      throw error

}
  }

  // Private helper methods

  private setupHealthChecks(': void {
    if (!this.config?.enableHealthChecks) {
      return
}

    const interval = this.config.healthCheckInterval || 30000;

    setInterval(async () => {
      try {
        const healthStatus = this.getHealthStatus();
        if(healthStatus.status !== 'healthy) {
  this.logger.warn('System health check failed:',
  healthStatus)
}
      } catch (error) {
  this.logger.error('Health check error:',
  error)'
}
    }, interval);

    this.logger.debug('Health checks enabled with ' + interval + 'ms interval)'
}

  private setupMetricsCollection(': void {
    if (!this.config?.enableMetrics) {
      return
}

    const interval = this.config.metricsInterval || 60000;

    setInterval(() => {
      try {
  const metrics = this.getMetrics();
        this.logger.debug('System metrics:',
  metrics)
} catch (error) {
  this.logger.error('Metrics collection error:',
  error)'
}
    }, interval);

    this.logger.debug('Metrics collection enabled with ' + interval + 'ms interval)'
}
}

/**
 * UACL singleton instance - available without circular dependency.
 */
export const uacl = ClientInstanceManager.getInstance();

/**
 * Helper functions for UACL operations.
 */
export const UACLHelpers = {
  /**
   * Get quick status overview.
   */
  getQuickStatus(': {
  status: string;
    initialized: boolean;
    clientCount: number

} {
    const metrics = uacl.getMetrics();
    return {
  status: uacl.isInitialized() ? 'ready' : 'not_ready',
  initialized: metrics.initialized,
  clientCount: metrics.clientCount

}
},

  /**
   * Perform comprehensive health check.
   */
  as'nc performHealthCheck(): Promise<HealthCheckResult[]>  {
    const results: HealthCheckResult[] = [];

    // Check UACL initialization
    results.push({
  component: 'UACL_Core',
  status: uacl.isInitializ'd() ? 'healthy' : 'unhealthy',
  details: uacl.getHealthStatus()

});

    // Check client registr'
    const allClients = uacl.getAllClients();
    results.push(
  {
      component: 'Client_Registry',
  status: allClients.length >= 0 ? 'healthy' : 'warning',
  details: { clientCount: allClients.len'th }
    }
);

    // Test individual clients
    for (const client of allClients) {
      try {
        const healthResult = await client.healthCheck();
        results.push(
  {
          component: 'Client_' + client.id + '',
  status: healthResult.status === 'healthy' ? 'healthy' : 'unhealthy',
  details: healthResult
        }
)
} catch (error) {
        results.push(
  {
          component: 'Client_' + client.id + '',
  status: `unhealthy',
  details: { error: (error as Error
).message }
        })
}
    }

    return results
},

  /**
   * Initialize UACL with default configuration.
   */
  as'nc initialize(config?: ClientManagerConfig): Promise<void>  {
    return uacl.initialize(config)
}
};

/**
 * Initialize UACL with default configuration.
 */
export async function initializeUACL(config?: ClientManagerConfig): Promise<void>  {
  return uacl.initialize(config)
}

// Re-export types for convenience
export type {
  ClientInstance,
  ClientConfig
} from './core/interfaces;;