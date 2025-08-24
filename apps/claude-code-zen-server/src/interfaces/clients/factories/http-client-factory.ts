/**
 * @fileoverview HTTP Client Factory - UACL Implementation
 *
 * Factory implementation for creating and managing HTTP clients within the
 * Unified API Client Layer (UACL) architecture. Provides comprehensive
 * HTTP client creation, management, and monitoring capabilities.
 *
 * Key Features:
 * - Type-safe HTTP client creation and configuration
 * - Authentication presets (Bearer, API Key, Basic Auth)
 * - Retry logic configuration and backoff strategies
 * - Health monitoring and metrics collection
 * - Load balancing and failover support
 * - Batch operations and bulk management
 * - Professional error handling and logging
 *
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0
 */

import {
  getLogger,
  type Logger
} from '@claude-zen/foundation';
import { HTTPClientAdapter } from '../adapters/http-client-adapter';
import type { HTTPClientConfig } from '../adapters/http-types';
import type {
  Client,
  ClientFactory,
  ClientConfig,
  ClientMetrics,
  HealthCheckResult
} from '../core/interfaces';

/**
 * Authentication configuration type for convenience methods.
 */
export type AuthConfig =
  | { type: 'bearer'; token: string }
  | { type: 'apikey'; apiKey: string }
  | { type: 'basic'; username: string; password: string };

/**
 * Retry configuration interface.
 */
export interface RetryConfig {
  attempts: number;
  delay: number;
  backoff?: 'linear' | 'exponential' | 'fixed';
}

/**
 * Monitoring configuration interface.
 */
export interface MonitoringConfig {
  metricsInterval?: number;
  healthCheckInterval?: number;
  healthEndpoint?: string;
}

/**
 * Load balancing strategy type.
 */
export type LoadBalancingStrategy =
  | 'round-robin'
  | 'random'
  | 'least-connections';

/**
 * Client status filter type.
 */
export type ClientStatusFilter =
  | 'healthy'
  | 'degraded'
  | 'unhealthy';

/**
 * HTTP Client Factory implementing UACL ClientFactory interface.
 *
 * Provides comprehensive HTTP client management with advanced features
 * including authentication, retry logic, monitoring, and load balancing.
 */
export class HTTPClientFactory implements ClientFactory<Client, HTTPClientConfig> {
  readonly type = 'http';
  private clients = new Map<string, HTTPClientAdapter>();
  private isShuttingDown = false;
  private logger: Logger;

  constructor() {
    this.logger = getLogger('HTTPClientFactory');
  }

  // ===== Core ClientFactory Methods =====

  /**
   * Create a new HTTP client instance.
   */
  async create(config: HTTPClientConfig): Promise<Client> {
    if (this.isShuttingDown) {
      throw new Error('Factory is shutting down, cannot create new clients');
    }

    const clientName = config.name || `http-client-${Date.now()}`;

    if (this.clients.has(clientName)) {
      throw new Error(`Client with name '${clientName}' already exists`);
    }

    try {
      const client = new HTTPClientAdapter(config);

      // Setup client event handlers
      this.setupClientHandlers(client);

      // Store client
      this.clients.set(clientName, client);

      // Auto-connect if monitoring is enabled
      if (config.monitoring?.enabled || config.health) {
        try {
          await client.connect();
        } catch (error) {
          // Remove failed client
          this.clients.delete(clientName);
          throw error;
        }
      }

      this.logger.info(`Created HTTP client: ${clientName}`);
      return client;
    } catch (error) {
      this.logger.error(`Failed to create HTTP client: ${error}`);
      throw error;
    }
  }

  /**
   * Get an existing client by name.
   */
  get(name: string): Client | undefined {
    return this.clients.get(name);
  }

  /**
   * Register a client instance.
   */
  register(name: string, client: Client): void {
    if (this.clients.has(name)) {
      throw new Error(`Client with name '${name}' already exists`);
    }

    if (client instanceof HTTPClientAdapter) {
      this.clients.set(name, client);
      this.setupClientHandlers(client);
      this.logger.debug(`Registered HTTP client: ${name}`);
    } else {
      throw new Error('Client must be an HTTPClientAdapter instance');
    }
  }

  /**
   * Unregister a client instance.
   */
  unregister(name: string): boolean {
    const client = this.clients.get(name);
    if (!client) {
      return false;
    }

    try {
      // Cleanup client if possible
      if (client.shutdown) {
        client.shutdown().catch((error) => {
          this.logger.warn(`Error during client shutdown: ${error}`);
        });
      }

      this.clients.delete(name);
      this.logger.debug(`Unregistered HTTP client: ${name}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to unregister client ${name}: ${error}`);
      // Force remove even if cleanup failed
      this.clients.delete(name);
      return true;
    }
  }

  /**
   * Get all registered clients.
   */
  getAll(): Client[] {
    return Array.from(this.clients.values());
  }

  /**
   * Validate client configuration.
   */
  validateConfig(config: HTTPClientConfig): boolean {
    if (!config.baseURL || typeof config.baseURL !== 'string') {
      return false;
    }

    if (config.name && typeof config.name !== 'string') {
      return false;
    }

    // Validate authentication config if present
    if (config.authentication) {
      const auth = config.authentication;
      switch (auth.type) {
        case 'bearer':
          return !!auth.token;
        case 'apikey':
          return !!auth.apiKey;
        case 'basic':
          return !!(auth.username && auth.password);
        default:
          return false;
      }
    }

    return true;
  }

  /**
   * Shutdown all clients managed by this factory.
   */
  async shutdown(): Promise<void> {
    this.isShuttingDown = true;
    this.logger.info('Shutting down HTTP client factory');

    const shutdownPromises = Array.from(this.clients.values()).map(
      async (client) => {
        try {
          await client.shutdown();
        } catch (error) {
          this.logger.error(`Failed to shutdown client ${client.config.name}: ${error}`);
        }
      }
    );

    await Promise.allSettled(shutdownPromises);
    this.clients.clear();
    this.logger.info('HTTP client factory shutdown completed');
  }

  // ===== Extended Factory Methods =====

  /**
   * Create multiple HTTP clients in parallel.
   */
  async createMultiple(configs: HTTPClientConfig[]): Promise<Client[]> {
    const clients: Client[] = [];
    const errors: Array<{ config: HTTPClientConfig; error: Error }> = [];

    // Create all clients in parallel
    const promises = configs.map(async (config) => {
      try {
        const client = await this.create(config);
        clients.push(client);
        return client;
      } catch (error) {
        errors.push({
          config,
          error: error as Error
        });
        throw error;
      }
    });

    // Wait for all creations to complete or fail
    const results = await Promise.allSettled(promises);

    // If any failed, cleanup successful ones and throw aggregated error
    if (errors.length > 0) {
      // Cleanup successful clients
      for (const client of clients) {
        try {
          await client.shutdown();
          const clientName = client.config.name || 'unknown';
          this.clients.delete(clientName);
        } catch (cleanupError) {
          this.logger.error(`Failed to cleanup client: ${cleanupError}`);
        }
      }

      // Create aggregated error
      const errorMessages = errors
        .map(({ config, error }) => `${config.name}: ${error.message}`)
        .join('; ');

      throw new Error(`Failed to create ${errors.length} clients: ${errorMessages}`);
    }

    return clients;
  }

  /**
   * Create HTTP client with authentication preset.
   */
  async createWithAuth(
    name: string,
    baseURL: string,
    authType: 'bearer' | 'apikey' | 'basic',
    credentials: string | { username: string; password: string }
  ): Promise<Client> {
    let authentication: AuthConfig;

    switch (authType) {
      case 'bearer':
        authentication = {
          type: 'bearer',
          token: credentials as string
        };
        break;
      case 'apikey':
        authentication = {
          type: 'apikey',
          apiKey: credentials as string
        };
        break;
      case 'basic': {
        const basicCreds = credentials as { username: string; password: string };
        authentication = {
          type: 'basic',
          username: basicCreds.username,
          password: basicCreds.password
        };
        break;
      }
      default:
        throw new Error(`Unsupported auth type: ${authType}`);
    }

    const config: HTTPClientConfig = {
      name,
      baseURL,
      authentication: authentication as any,
      retry: {
        attempts: 3,
        delay: 1000,
        backoff: 'exponential'
      },
      monitoring: {
        enabled: true,
        metricsInterval: 60000,
        trackLatency: true,
        trackThroughput: true,
        trackErrors: true
      }
    };

    return this.create(config);
  }

  /**
   * Create HTTP client with retry configuration.
   */
  async createWithRetry(
    name: string,
    baseURL: string,
    retryConfig: RetryConfig
  ): Promise<Client> {
    const config: HTTPClientConfig = {
      name,
      baseURL,
      retry: {
        attempts: retryConfig.attempts,
        delay: retryConfig.delay,
        backoff: retryConfig.backoff || 'exponential'
      }
    };

    return this.create(config);
  }

  /**
   * Create HTTP client with monitoring enabled.
   */
  async createWithMonitoring(
    name: string,
    baseURL: string,
    monitoringConfig?: MonitoringConfig
  ): Promise<Client> {
    const config: HTTPClientConfig = {
      name,
      baseURL,
      monitoring: {
        enabled: true,
        metricsInterval: monitoringConfig?.metricsInterval || 60000,
        trackLatency: true,
        trackThroughput: true,
        trackErrors: true
      },
      health: monitoringConfig?.healthCheckInterval ? {
        endpoint: monitoringConfig.healthEndpoint || '/health',
        interval: monitoringConfig.healthCheckInterval,
        timeout: 5000,
        failureThreshold: 3,
        successThreshold: 2
      } : undefined
    };

    return this.create(config);
  }

  /**
   * Create load-balanced HTTP clients.
   */
  async createLoadBalanced(
    baseName: string,
    baseURLs: string[],
    options?: {
      strategy?: LoadBalancingStrategy;
      healthCheck?: boolean;
    }
  ): Promise<Client[]> {
    const configs: HTTPClientConfig[] = baseURLs.map((baseURL, index) => ({
      name: `${baseName}-${index}`,
      baseURL,
      monitoring: {
        enabled: options?.healthCheck !== false,
        metricsInterval: 30000,
        trackLatency: true,
        trackThroughput: true,
        trackErrors: true
      },
      health: options?.healthCheck !== false ? {
        endpoint: '/health',
        interval: 10000,
        timeout: 5000,
        failureThreshold: 3,
        successThreshold: 2
      } : undefined
    }));

    return this.createMultiple(configs);
  }

  // ===== Batch Operations =====

  /**
   * Perform health check on all clients.
   */
  async healthCheckAll(): Promise<Map<string, HealthCheckResult>> {
    const results = new Map<string, HealthCheckResult>();

    const promises = Array.from(this.clients.entries()).map(
      async ([name, client]) => {
        try {
          const status = await client.healthCheck();
          results.set(name, status);
        } catch (error) {
          results.set(name, {
            status: 'unhealthy',
            timestamp: new Date(),
            responseTime: -1,
            metadata: {
              error: (error as Error).message
            }
          });
        }
      }
    );

    await Promise.allSettled(promises);
    return results;
  }

  /**
   * Get metrics for all clients.
   */
  async getMetricsAll(): Promise<Map<string, ClientMetrics>> {
    const results = new Map<string, ClientMetrics>();

    const promises = Array.from(this.clients.entries()).map(
      async ([name, client]) => {
        try {
          const metrics = await client.getMetrics();
          results.set(name, metrics);
        } catch (error) {
          // Return empty metrics on error
          results.set(name, {
            totalOperations: 0,
            successfulOperations: 0,
            failedOperations: 0,
            cacheHitRatio: 0,
            averageLatency: 0,
            throughput: 0,
            concurrentOperations: 0,
            uptime: 0
          });
        }
      }
    );

    await Promise.allSettled(promises);
    return results;
  }

  /**
   * Get clients by health status.
   */
  async getClientsByStatus(status: ClientStatusFilter): Promise<Client[]> {
    const healthResults = await this.healthCheckAll();
    const matchingClients: Client[] = [];

    for (const [name, healthResult] of healthResults) {
      if (healthResult.status === status) {
        const client = this.clients.get(name);
        if (client) {
          matchingClients.push(client);
        }
      }
    }

    return matchingClients;
  }

  // ===== Statistics and Information =====

  /**
   * Get factory statistics.
   */
  getStats(): {
    totalClients: number;
    connectedClients: number;
    averageResponseTime: number;
    totalRequests: number;
    totalErrors: number;
  } {
    let connectedCount = 0;

    for (const client of this.clients.values()) {
      if (client.isConnected) {
        connectedCount++;
      }
    }

    return {
      totalClients: this.clients.size,
      connectedClients: connectedCount,
      averageResponseTime: 0, // Would need to aggregate from metrics
      totalRequests: 0, // Would need to aggregate from metrics
      totalErrors: 0 // Would need to aggregate from metrics
    };
  }

  /**
   * Get active client count.
   */
  getActiveCount(): number {
    return this.clients.size;
  }

  /**
   * Check if factory has a client by name.
   */
  has(name: string): boolean {
    return this.clients.has(name);
  }

  /**
   * List all client names.
   */
  list(): string[] {
    return Array.from(this.clients.keys());
  }

  // ===== Private Helper Methods =====

  /**
   * Setup event handlers for created clients.
   */
  private setupClientHandlers(client: HTTPClientAdapter): void {
    client.on('error', (error) => {
      this.logger.error(`Client ${client.config.name} error:`, error);
    });

    client.on('connect', () => {
      this.logger.debug(`Client ${client.config.name} connected`);
    });

    client.on('disconnect', () => {
      this.logger.debug(`Client ${client.config.name} disconnected`);
    });

    client.on('retry', (info) => {
      this.logger.debug(`Client ${client.config.name} retry attempt:`, info);
    });
  }
}

/**
 * Default HTTP client factory instance.
 */
export const httpClientFactory = new HTTPClientFactory();

/**
 * Convenience function to create HTTP client.
 */
export const createHTTPClient = async (
  config: HTTPClientConfig
): Promise<Client> => {
  return httpClientFactory.create(config);
};

/**
 * Convenience function to create multiple HTTP clients.
 */
export const createHTTPClients = async (
  configs: HTTPClientConfig[]
): Promise<Client[]> => {
  return httpClientFactory.createMultiple(configs);
};

export default HTTPClientFactory;