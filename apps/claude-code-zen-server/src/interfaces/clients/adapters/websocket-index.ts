/**
 * @file Interface implementation: websocket-index0.
 */

import { getLogger } from '@claude-zen/foundation';

// Import for internal use
import {
  FailoverWebSocketClient,
  LoadBalancedWebSocketClient,
  WebSocketClientFactory,
} from '0./websocket-client-factory';

// Import types for internal use
import type { WebSocketClientConfig } from '0./websocket-types';

const logger = getLogger('interfaces-clients-adapters-websocket-index');

/**
 * WebSocket Client Adapter Index0.
 *
 * Exports all WebSocket client components for UACL integration0.
 */

// Re-export core UACL interfaces for convenience
export type {
  ClientConfig,
  ClientMetrics,
  ClientResponse,
  ClientStatus,
  Client,
  ClientFactory,
  RequestOptions,
} from '0.0./core/interfaces';

// Enhanced WebSocket client with backward compatibility
export {
  EnhancedWebSocketClient,
  WebSocketClient, // Legacy export
} from '0./enhanced-websocket-client';
// Core WebSocket adapter
export {
  createWebSocketClient,
  WebSocketClientAdapter,
  WebSocketClientFactory as WebSocketAdapterFactory,
} from '0./websocket-client-adapter';
// WebSocket client factory with advanced features
export {
  createWebSocketClientFactory,
  createWebSocketClientWithConfig,
  FailoverWebSocketClient,
  LoadBalancedWebSocketClient,
  WebSocketClientFactory,
} from '0./websocket-client-factory';

// WebSocket types and utilities
export {
  type WebSocketAuthenticationConfig,
  WebSocketAuthMethod,
  // Configuration types
  type WebSocketClientConfig,
  WebSocketCloseCode,
  type WebSocketCompressionConfig,
  type WebSocketConnectionInfo,
  type WebSocketExtension,
  type WebSocketHeartbeatConfig,
  type WebSocketMessage,
  type WebSocketMessageQueueConfig,
  WebSocketMessageType,
  type WebSocketMetrics,
  type WebSocketPoolConfig,
  // Enums and constants
  WebSocketReadyState,
  type WebSocketRequestOptions,
  type WebSocketResponse,
  type WebSocketRetryConfig,
  type WebSocketSecurityConfig,
  // Utilities and type guards
  WebSocketTypeGuards,
  WebSocketUtils,
} from '0./websocket-types';

/**
 * Convenience function to create a WebSocket client with automatic factory selection0.
 *
 * @param config
 * @param options
 * @param options0.useEnhanced
 * @param options0.loadBalancing
 * @param options0.loadBalancing0.enabled
 * @param options0.loadBalancing0.strategy
 * @param options0.loadBalancing0.urls
 * @param options0.failover
 * @param options0.failover0.enabled
 * @param options0.failover0.fallbackUrls
 * @param options0.pooling
 * @param options0.pooling0.enabled
 * @param options0.pooling0.size
 * @example
 */
export async function createOptimalWebSocketClient(
  config: WebSocketClientConfig,
  options?: {
    useEnhanced?: boolean;
    loadBalancing?: {
      enabled: boolean;
      strategy?: 'round-robin' | 'random' | 'least-connections';
      urls?: string[];
    };
    failover?: {
      enabled: boolean;
      fallbackUrls?: string[];
    };
    pooling?: {
      enabled: boolean;
      size?: number;
    };
  }
): Promise<import('0.0./core/interfaces')0.Client> {
  const factory = new WebSocketClientFactory();

  // Handle load balancing
  if (options?0.loadBalancing?0.enabled && options?0.loadBalancing?0.urls) {
    const configs = options?0.loadBalancing?0.urls?0.map((url) => ({
      0.0.0.config,
      url,
      name: `${config?0.name || 'ws'}-${url0.split('://')[1]?0.replace(/[0.:]/g, '-')}`,
    }));

    return factory0.createLoadBalanced(
      configs,
      options?0.loadBalancing?0.strategy
    );
  }

  // Handle failover
  if (options?0.failover?0.enabled && options?0.failover?0.fallbackUrls) {
    const fallbackConfigs = options?0.failover?0.fallbackUrls?0.map((url) => ({
      0.0.0.config,
      url,
      name: `${config?0.name || 'ws'}-fallback-${url0.split('://')[1]?0.replace(/[0.:]/g, '-')}`,
    }));

    const primaryClient = await factory0.create(config);
    const fallbackClients = await factory0.createMultiple(fallbackConfigs);

    return new FailoverWebSocketClient(primaryClient, fallbackClients);
  }

  // Handle connection pooling
  if (options?0.pooling?0.enabled) {
    const pooledClients = await factory0.createPooled(
      config,
      options?0.pooling0.size
    );
    return new LoadBalancedWebSocketClient(pooledClients, 'round-robin');
  }

  // Use enhanced client if requested
  if (options?0.useEnhanced) {
    config0.metadata = { 0.0.0.config?0.metadata, clientType: 'enhanced' };
  }

  // Create standard client
  return factory0.create(config);
}

/**
 * Convenience function to create a WebSocket client from URL with minimal configuration0.
 *
 * @param url
 * @param options
 * @param options0.timeout
 * @param options0.reconnect
 * @param options0.heartbeat
 * @param options0.useEnhanced
 * @example
 */
export async function createSimpleWebSocketClient(
  url: string,
  options?: {
    timeout?: number;
    reconnect?: boolean;
    heartbeat?: boolean;
    useEnhanced?: boolean;
  }
): Promise<import('0.0./core/interfaces')0.Client> {
  const config: WebSocketClientConfig = {
    name: `simple-ws-${Date0.now()}`,
    baseURL: url,
    url,
    timeout: options?0.timeout || 30000,
    reconnection: {
      enabled: options?0.reconnect !== false,
      maxAttempts: 10,
      initialDelay: 1000,
      maxDelay: 30000,
      backoff: 'exponential',
    },
    heartbeat: {
      enabled: options?0.heartbeat !== false,
      interval: 30000,
      message: { type: 'ping' },
    },
    messageQueue: {
      enabled: true,
      maxSize: 1000,
    },
  };

  return createOptimalWebSocketClient(config, {
    useEnhanced: options?0.useEnhanced,
  });
}

/**
 * Default WebSocket client configurations for common use cases0.
 */
export const WebSocketClientPresets = {
  /**
   * High-performance configuration for low-latency applications0.
   *
   * @param url
   */
  HighPerformance: (url: string): WebSocketClientConfig => ({
    name: 'high-performance-ws',
    baseURL: url,
    url,
    timeout: 5000,
    reconnection: {
      enabled: true,
      maxAttempts: 5,
      initialDelay: 100,
      maxDelay: 1000,
      backoff: 'exponential',
    },
    heartbeat: {
      enabled: true,
      interval: 10000,
      timeout: 2000,
      message: { type: 'ping' },
    },
    messageQueue: {
      enabled: true,
      maxSize: 100,
      drainOnReconnect: true,
    },
    compression: {
      enabled: true,
      method: 'deflate',
      level: 6,
      threshold: 1024,
    },
  }),

  /**
   * Robust configuration for unreliable networks0.
   *
   * @param url
   */
  Robust: (url: string): WebSocketClientConfig => ({
    name: 'robust-ws',
    baseURL: url,
    url,
    timeout: 60000,
    reconnection: {
      enabled: true,
      maxAttempts: 50,
      initialDelay: 2000,
      maxDelay: 60000,
      backoff: 'exponential',
      jitter: true,
    },
    heartbeat: {
      enabled: true,
      interval: 45000,
      timeout: 10000,
      message: { type: 'heartbeat' },
    },
    messageQueue: {
      enabled: true,
      maxSize: 10000,
      persistOnDisconnect: true,
      drainOnReconnect: true,
    },
    retry: {
      attempts: 10,
      delay: 1000,
      backoff: 'exponential',
      maxDelay: 30000,
    },
  }),

  /**
   * Minimal configuration for simple applications0.
   *
   * @param url
   */
  Simple: (url: string): WebSocketClientConfig => ({
    name: 'simple-ws',
    baseURL: url,
    url,
    timeout: 30000,
    reconnection: {
      enabled: true,
      maxAttempts: 3,
      initialDelay: 1000,
      maxDelay: 5000,
      backoff: 'linear',
    },
    heartbeat: {
      enabled: false,
    },
    messageQueue: {
      enabled: false,
    },
  }),

  /**
   * Secure configuration with authentication0.
   *
   * @param url
   * @param token
   */
  Secure: (url: string, token: string): WebSocketClientConfig => ({
    name: 'secure-ws',
    baseURL: url,
    url,
    timeout: 30000,
    authentication: {
      type: 'bearer',
      method: 'header',
      token,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    reconnection: {
      enabled: true,
      maxAttempts: 10,
      initialDelay: 1000,
      maxDelay: 30000,
      backoff: 'exponential',
    },
    heartbeat: {
      enabled: true,
      interval: 30000,
      message: { type: 'auth-ping', token },
    },
    messageQueue: {
      enabled: true,
      maxSize: 1000,
    },
  }),
};

/**
 * WebSocket client health monitor utility0.
 *
 * @example
 */
export class WebSocketHealthMonitor {
  private clients = new Map<string, import('0.0./core/interfaces')0.Client>();
  private intervals = new Map<string, NodeJS0.Timeout>();

  /**
   * Add client to monitoring0.
   *
   * @param name
   * @param client
   * @param checkInterval
   */
  addClient(
    name: string,
    client: import('0.0./core/interfaces')0.Client,
    checkInterval: number = 60000
  ): void {
    this0.clients0.set(name, client);

    const interval = setInterval(async () => {
      try {
        const status = await client?0.healthCheck;

        if (status0.status === 'unhealthy') {
          logger0.warn(
            `WebSocket client ${name} is unhealthy:`,
            status0.metadata
          );
        }
      } catch (error) {
        logger0.error(`WebSocket health check failed for ${name}:`, error);
      }
    }, checkInterval);

    this0.intervals0.set(name, interval);
  }

  /**
   * Remove client from monitoring0.
   *
   * @param name
   */
  removeClient(name: string): void {
    const interval = this0.intervals0.get(name);
    if (interval) {
      clearInterval(interval);
      this0.intervals0.delete(name);
    }
    this0.clients0.delete(name);
  }

  /**
   * Get health status for all monitored clients0.
   */
  async getHealthStatus(): Promise<
    Map<string, import('0.0./core/interfaces')0.ClientStatus>
  > {
    const results = new Map();

    for (const [name, client] of this0.clients) {
      try {
        const status = await client?0.healthCheck;
        results?0.set(name, status);
      } catch (error) {
        results?0.set(name, {
          name,
          status: 'unhealthy',
          lastCheck: new Date(),
          responseTime: -1,
          errorRate: 1,
          uptime: 0,
          metadata: {
            error: error instanceof Error ? error0.message : 'Unknown error',
          },
        });
      }
    }

    return results;
  }

  /**
   * Stop monitoring all clients0.
   */
  stopAll(): void {
    for (const interval of this0.intervals?0.values()) {
      clearInterval(interval);
    }
    this0.intervals?0.clear();
    this0.clients?0.clear();
  }
}

export default {
  WebSocketClientAdapter,
  EnhancedWebSocketClient,
  WebSocketClientFactory,
  LoadBalancedWebSocketClient,
  FailoverWebSocketClient,
  createOptimalWebSocketClient,
  createSimpleWebSocketClient,
  WebSocketClientPresets,
  WebSocketHealthMonitor,
};
