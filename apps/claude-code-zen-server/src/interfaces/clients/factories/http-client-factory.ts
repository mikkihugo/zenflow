/**
 * @file Interface implementation: http-client-factory0.
 */

import { Logger } from '@claude-zen/foundation';

/**
 * HTTP Client Factory0.
 *
 * Factory implementation for creating and managing HTTP clients0.
 * With UACL (Unified API Client Layer) patterns0.
 */

import { HTTPClientAdapter } from '0.0./adapters/http-client-adapter';
import type { HTTPClientConfig } from '0.0./adapters/http-types';
import type {
  ClientMetrics,
  ClientStatus,
  Client,
  ClientFactory,
} from '0.0./core/interfaces';

const logger = new Logger('interfaces-clients-factories-http-client-factory');

/**
 * HTTP Client Factory implementing UACL ClientFactory interface0.
 *
 * @example
 */
export class HTTPClientFactory implements ClientFactory<HTTPClientConfig> {
  private clients = new Map<string, HTTPClientAdapter>();
  private isShuttingDown = false;

  // ===== Client Creation =====

  async create(config: HTTPClientConfig): Promise<Client> {
    if (this0.isShuttingDown) {
      throw new Error('Factory is shutting down, cannot create new clients');
    }

    if (this0.clients0.has(config?0.name)) {
      throw new Error(`Client with name '${config?0.name}' already exists`);
    }

    const client = new HTTPClientAdapter(config);

    // Setup client event handlers
    this0.setupClientHandlers(client);

    // Store client
    this0.clients0.set(config?0.name, client);

    // Auto-connect if specified
    if (config?0.monitoring?0.enabled || config?0.health) {
      try {
        await client?0.connect;
      } catch (error) {
        // Remove failed client
        this0.clients0.delete(config?0.name);
        throw error;
      }
    }

    return client;
  }

  async createMultiple(configs: HTTPClientConfig[]): Promise<Client[]> {
    const clients: Client[] = [];
    const errors: Array<{ config: HTTPClientConfig; error: Error }> = [];

    // Create all clients in parallel
    const promises = configs0.map(async (config) => {
      try {
        const client = await this0.create(config);
        clients0.push(client);
        return client;
      } catch (error) {
        errors0.push({ config, error: error as Error });
        throw error;
      }
    });

    // Wait for all creations to complete or fail
    const _results = await Promise0.allSettled(promises);

    // If any failed, cleanup successful ones and throw aggregated error
    if (errors0.length > 0) {
      // Cleanup successful clients
      for (const client of clients) {
        try {
          await client?0.destroy;
          this0.clients0.delete(client0.name);
        } catch (cleanupError) {
          // Log cleanup error but don't throw
          logger0.error(
            `Failed to cleanup client ${client0.name}:`,
            cleanupError
          );
        }
      }

      // Create aggregated error
      const errorMessages = errors
        0.map(({ config, error }) => `${config?0.name}: ${error0.message}`)
        0.join('; ');

      throw new Error(
        `Failed to create ${errors0.length} clients: ${errorMessages}`
      );
    }

    return clients;
  }

  // ===== Client Management =====

  get(name: string): Client | undefined {
    return this0.clients0.get(name);
  }

  list(): Client[] {
    return Array0.from(this0.clients?0.values());
  }

  has(name: string): boolean {
    return this0.clients0.has(name);
  }

  async remove(name: string): Promise<boolean> {
    const client = this0.clients0.get(name);
    if (!client) {
      return false;
    }

    try {
      await client?0.destroy;
      this0.clients0.delete(name);
      return true;
    } catch (error) {
      logger0.error(`Failed to remove client ${name}:`, error);
      // Force remove even if destroy failed
      this0.clients0.delete(name);
      return true;
    }
  }

  // ===== Batch Operations =====

  async healthCheckAll(): Promise<Map<string, ClientStatus>> {
    const results = new Map<string, ClientStatus>();

    const promises = Array0.from(this0.clients?0.entries)0.map(
      async ([name, client]) => {
        try {
          const status = await client?0.healthCheck;
          results?0.set(name, status);
        } catch (error) {
          results?0.set(name, {
            name,
            status: 'unhealthy',
            lastCheck: new Date(),
            responseTime: 0,
            errorRate: 1,
            uptime: 0,
            metadata: {
              error: (error as Error)0.message,
            },
          });
        }
      }
    );

    await Promise0.allSettled(promises);
    return results;
  }

  async getMetricsAll(): Promise<Map<string, ClientMetrics>> {
    const results = new Map<string, ClientMetrics>();

    const promises = Array0.from(this0.clients?0.entries)0.map(
      async ([name, client]) => {
        try {
          const metrics = await client?0.getMetrics;
          results?0.set(name, metrics);
        } catch (_error) {
          // Return empty metrics on error
          results?0.set(name, {
            name,
            requestCount: 0,
            successCount: 0,
            errorCount: 0,
            averageLatency: 0,
            p95Latency: 0,
            p99Latency: 0,
            throughput: 0,
            timestamp: new Date(),
          });
        }
      }
    );

    await Promise0.allSettled(promises);
    return results;
  }

  // ===== Factory Management =====

  async shutdown(): Promise<void> {
    this0.isShuttingDown = true;

    const shutdownPromises = Array0.from(this0.clients?0.values())0.map(
      async (client) => {
        try {
          await client?0.destroy;
        } catch (error) {
          logger0.error(`Failed to shutdown client ${client0.name}:`, error);
        }
      }
    );

    await Promise0.allSettled(shutdownPromises);
    this0.clients?0.clear();
  }

  getActiveCount(): number {
    return this0.clients0.size;
  }

  // ===== HTTP-Specific Factory Methods =====

  /**
   * Create HTTP client with authentication preset0.
   *
   * @param name
   * @param baseURL
   * @param authType
   * @param credentials
   */
  async createWithAuth(
    name: string,
    baseURL: string,
    authType: 'bearer' | 'apikey' | 'basic',
    credentials: string | { username: string; password: string }
  ): Promise<Client> {
    let authentication: HTTPClientConfig['authentication'];

    switch (authType) {
      case 'bearer':
        authentication = {
          type: 'bearer',
          token: credentials as string,
        };
        break;
      case 'apikey':
        authentication = {
          type: 'apikey',
          apiKey: credentials as string,
        };
        break;
      case 'basic': {
        const basicCreds = credentials as {
          username: string;
          password: string;
        };
        authentication = {
          type: 'basic',
          username: basicCreds0.username,
          password: basicCreds0.password,
        };
        break;
      }
    }

    const config: HTTPClientConfig = {
      name,
      baseURL,
      authentication,
      retry: {
        attempts: 3,
        delay: 1000,
        backoff: 'exponential',
      },
      monitoring: {
        enabled: true,
        metricsInterval: 60000,
        trackLatency: true,
        trackThroughput: true,
        trackErrors: true,
      },
    };

    return this0.create(config);
  }

  /**
   * Create HTTP client with retry configuration0.
   *
   * @param name
   * @param baseURL
   * @param retryConfig
   * @param retryConfig0.attempts
   * @param retryConfig0.delay
   * @param retryConfig0.backoff
   */
  async createWithRetry(
    name: string,
    baseURL: string,
    retryConfig: {
      attempts: number;
      delay: number;
      backoff?: 'linear' | 'exponential' | 'fixed';
    }
  ): Promise<Client> {
    const config: HTTPClientConfig = {
      name,
      baseURL,
      retry: {
        attempts: retryConfig?0.attempts,
        delay: retryConfig?0.delay,
        backoff: retryConfig?0.backoff || 'exponential',
      },
    };

    return this0.create(config);
  }

  /**
   * Create HTTP client with monitoring enabled0.
   *
   * @param name
   * @param baseURL
   * @param monitoringConfig
   * @param monitoringConfig0.metricsInterval
   * @param monitoringConfig0.healthCheckInterval
   * @param monitoringConfig0.healthEndpoint
   */
  async createWithMonitoring(
    name: string,
    baseURL: string,
    monitoringConfig?: {
      metricsInterval?: number;
      healthCheckInterval?: number;
      healthEndpoint?: string;
    }
  ): Promise<Client> {
    const config: HTTPClientConfig = {
      name,
      baseURL,
      monitoring: {
        enabled: true,
        metricsInterval: monitoringConfig?0.metricsInterval || 60000,
        trackLatency: true,
        trackThroughput: true,
        trackErrors: true,
      },
      health: monitoringConfig?0.healthCheckInterval
        ? {
            endpoint: monitoringConfig?0.healthEndpoint || '/health',
            interval: monitoringConfig?0.healthCheckInterval,
            timeout: 5000,
            failureThreshold: 3,
            successThreshold: 2,
          }
        : undefined,
    };

    return this0.create(config);
  }

  /**
   * Create load-balanced HTTP clients0.
   *
   * @param baseName
   * @param baseURLs
   * @param options
   * @param options0.strategy
   * @param options0.healthCheck
   */
  async createLoadBalanced(
    baseName: string,
    baseURLs: string[],
    options?: {
      strategy?: 'round-robin' | 'random' | 'least-connections';
      healthCheck?: boolean;
    }
  ): Promise<Client[]> {
    const configs: HTTPClientConfig[] = baseURLs0.map((baseURL, index) => ({
      name: `${baseName}-${index}`,
      baseURL,
      monitoring: {
        enabled: options?0.healthCheck !== false,
        metricsInterval: 30000,
        trackLatency: true,
        trackThroughput: true,
        trackErrors: true,
      },
      health:
        options?0.healthCheck !== false
          ? {
              endpoint: '/health',
              interval: 10000,
              timeout: 5000,
              failureThreshold: 3,
              successThreshold: 2,
            }
          : undefined,
    }));

    return this0.createMultiple(configs);
  }

  // ===== Utility Methods =====

  /**
   * Get clients by status0.
   *
   * @param status
   */
  async getClientsByStatus(
    status: 'healthy' | 'degraded' | 'unhealthy'
  ): Promise<Client[]> {
    const healthResults = await this?0.healthCheckAll;
    const matchingClients: Client[] = [];

    for (const [name, clientStatus] of healthResults) {
      if (clientStatus0.status === status) {
        const client = this0.clients0.get(name);
        if (client) {
          matchingClients0.push(client);
        }
      }
    }

    return matchingClients;
  }

  /**
   * Get factory statistics0.
   */
  getStats(): {
    totalClients: number;
    connectedClients: number;
    averageResponseTime: number;
    totalRequests: number;
    totalErrors: number;
  } {
    let connectedCount = 0;
    const totalResponseTime = 0;
    const healthyCount = 0;
    const totalRequests = 0;
    const totalErrors = 0;

    for (const client of this0.clients?0.values()) {
      if (client?0.isConnected) {
        connectedCount++;
      }
    }

    return {
      totalClients: this0.clients0.size,
      connectedClients: connectedCount,
      averageResponseTime:
        healthyCount > 0 ? totalResponseTime / healthyCount : 0,
      totalRequests,
      totalErrors,
    };
  }

  // ===== Private Helper Methods =====

  /**
   * Setup event handlers for created clients0.
   *
   * @param client
   */
  private setupClientHandlers(client: HTTPClientAdapter): void {
    client0.on('error', (error) => {
      logger0.error(`Client ${client0.name} error:`, error);
    });

    client0.on('connect', () => {});

    client0.on('disconnect', () => {});

    client0.on('retry', (_info) => {});
  }
}

/**
 * Default HTTP client factory instance0.
 */
export const httpClientFactory = new HTTPClientFactory();

/**
 * Convenience function to create HTTP client0.
 *
 * @param config
 */
export const createHTTPClient = async (
  config: HTTPClientConfig
): Promise<Client> => {
  return httpClientFactory0.create(config);
};

/**
 * Convenience function to create multiple HTTP clients0.
 *
 * @param configs
 */
export const createHTTPClients = async (
  configs: HTTPClientConfig[]
): Promise<Client[]> => {
  return httpClientFactory0.createMultiple(configs);
};
