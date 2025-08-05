/**
 * WebSocket Client Adapter Index
 * 
 * Exports all WebSocket client components for UACL integration
 */

// Core WebSocket adapter
export { 
  WebSocketClientAdapter,
  WebSocketClientFactory as WebSocketAdapterFactory,
  createWebSocketClient
} from './websocket-client-adapter';

// Enhanced WebSocket client with backward compatibility
export { 
  EnhancedWebSocketClient,
  WebSocketClient // Legacy export
} from './enhanced-websocket-client';

// WebSocket client factory with advanced features
export { 
  WebSocketClientFactory,
  LoadBalancedWebSocketClient,
  FailoverWebSocketClient,
  createWebSocketClientFactory,
  createWebSocketClientWithConfig
} from './websocket-client-factory';

// WebSocket types and utilities
export {
  // Configuration types
  type WebSocketClientConfig,
  type WebSocketAuthenticationConfig,
  type WebSocketRetryConfig,
  type WebSocketHeartbeatConfig,
  type WebSocketMessageQueueConfig,
  type WebSocketCompressionConfig,
  type WebSocketRequestOptions,
  type WebSocketResponse,
  type WebSocketMessage,
  type WebSocketConnectionInfo,
  type WebSocketMetrics,
  type WebSocketPoolConfig,
  type WebSocketExtension,
  type WebSocketSecurityConfig,
  
  // Enums and constants
  WebSocketReadyState,
  WebSocketMessageType,
  WebSocketCloseCode,
  WebSocketAuthMethod,
  
  // Utilities and type guards
  WebSocketTypeGuards,
  WebSocketUtils
} from './websocket-types';

// Re-export core UACL interfaces for convenience
export type {
  IClient,
  IClientFactory,
  ClientConfig,
  ClientStatus,
  ClientMetrics,
  RequestOptions,
  ClientResponse
} from '../core/interfaces';

/**
 * Convenience function to create a WebSocket client with automatic factory selection
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
): Promise<import('../core/interfaces').IClient> {
  const factory = new WebSocketClientFactory();
  
  // Handle load balancing
  if (options?.loadBalancing?.enabled && options.loadBalancing.urls) {
    const configs = options.loadBalancing.urls.map(url => ({
      ...config,
      url,
      name: `${config.name || 'ws'}-${url.split('://')[1]?.replace(/[:.]/g, '-')}`
    }));
    
    return factory.createLoadBalanced(configs, options.loadBalancing.strategy);
  }
  
  // Handle failover
  if (options?.failover?.enabled && options.failover.fallbackUrls) {
    const fallbackConfigs = options.failover.fallbackUrls.map(url => ({
      ...config,
      url,
      name: `${config.name || 'ws'}-fallback-${url.split('://')[1]?.replace(/[:.]/g, '-')}`
    }));
    
    const primaryClient = await factory.create(config);
    const fallbackClients = await factory.createMultiple(fallbackConfigs);
    
    return new FailoverWebSocketClient(primaryClient, fallbackClients);
  }
  
  // Handle connection pooling
  if (options?.pooling?.enabled) {
    const pooledClients = await factory.createPooled(config, options.pooling.size);
    return new LoadBalancedWebSocketClient(pooledClients, 'round-robin');
  }
  
  // Use enhanced client if requested
  if (options?.useEnhanced) {
    config.metadata = { ...config.metadata, clientType: 'enhanced' };
  }
  
  // Create standard client
  return factory.create(config);
}

/**
 * Convenience function to create a WebSocket client from URL with minimal configuration
 */
export async function createSimpleWebSocketClient(
  url: string,
  options?: {
    timeout?: number;
    reconnect?: boolean;
    heartbeat?: boolean;
    useEnhanced?: boolean;
  }
): Promise<import('../core/interfaces').IClient> {
  const config: WebSocketClientConfig = {
    name: `simple-ws-${Date.now()}`,
    baseURL: url,
    url,
    timeout: options?.timeout || 30000,
    reconnection: {
      enabled: options?.reconnect !== false,
      maxAttempts: 10,
      initialDelay: 1000,
      maxDelay: 30000,
      backoff: 'exponential'
    },
    heartbeat: {
      enabled: options?.heartbeat !== false,
      interval: 30000,
      message: { type: 'ping' }
    },
    messageQueue: {
      enabled: true,
      maxSize: 1000
    }
  };
  
  return createOptimalWebSocketClient(config, { useEnhanced: options?.useEnhanced });
}

/**
 * Default WebSocket client configurations for common use cases
 */
export const WebSocketClientPresets = {
  /**
   * High-performance configuration for low-latency applications
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
      backoff: 'exponential'
    },
    heartbeat: {
      enabled: true,
      interval: 10000,
      timeout: 2000,
      message: { type: 'ping' }
    },
    messageQueue: {
      enabled: true,
      maxSize: 100,
      drainOnReconnect: true
    },
    compression: {
      enabled: true,
      method: 'deflate',
      level: 6,
      threshold: 1024
    }
  }),
  
  /**
   * Robust configuration for unreliable networks
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
      jitter: true
    },
    heartbeat: {
      enabled: true,
      interval: 45000,
      timeout: 10000,
      message: { type: 'heartbeat' }
    },
    messageQueue: {
      enabled: true,
      maxSize: 10000,
      persistOnDisconnect: true,
      drainOnReconnect: true
    },
    retry: {
      attempts: 10,
      delay: 1000,
      backoff: 'exponential',
      maxDelay: 30000
    }
  }),
  
  /**
   * Minimal configuration for simple applications
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
      backoff: 'linear'
    },
    heartbeat: {
      enabled: false
    },
    messageQueue: {
      enabled: false
    }
  }),
  
  /**
   * Secure configuration with authentication
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
        'Authorization': `Bearer ${token}`
      }
    },
    reconnection: {
      enabled: true,
      maxAttempts: 10,
      initialDelay: 1000,
      maxDelay: 30000,
      backoff: 'exponential'
    },
    heartbeat: {
      enabled: true,
      interval: 30000,
      message: { type: 'auth-ping', token }
    },
    messageQueue: {
      enabled: true,
      maxSize: 1000
    }
  })
};

/**
 * WebSocket client health monitor utility
 */
export class WebSocketHealthMonitor {
  private clients = new Map<string, import('../core/interfaces').IClient>();
  private intervals = new Map<string, NodeJS.Timeout>();
  
  /**
   * Add client to monitoring
   */
  addClient(name: string, client: import('../core/interfaces').IClient, checkInterval: number = 60000): void {
    this.clients.set(name, client);
    
    const interval = setInterval(async () => {
      try {
        const status = await client.healthCheck();
        console.log(`WebSocket Health [${name}]:`, status.status, `(${status.responseTime}ms)`);
        
        if (status.status === 'unhealthy') {
          console.warn(`WebSocket client ${name} is unhealthy:`, status.metadata);
        }
      } catch (error) {
        console.error(`WebSocket health check failed for ${name}:`, error);
      }
    }, checkInterval);
    
    this.intervals.set(name, interval);
  }
  
  /**
   * Remove client from monitoring
   */
  removeClient(name: string): void {
    const interval = this.intervals.get(name);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(name);
    }
    this.clients.delete(name);
  }
  
  /**
   * Get health status for all monitored clients
   */
  async getHealthStatus(): Promise<Map<string, import('../core/interfaces').ClientStatus>> {
    const results = new Map();
    
    for (const [name, client] of this.clients) {
      try {
        const status = await client.healthCheck();
        results.set(name, status);
      } catch (error) {
        results.set(name, {
          name,
          status: 'unhealthy',
          lastCheck: new Date(),
          responseTime: -1,
          errorRate: 1,
          uptime: 0,
          metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
        });
      }
    }
    
    return results;
  }
  
  /**
   * Stop monitoring all clients
   */
  stopAll(): void {
    for (const interval of this.intervals.values()) {
      clearInterval(interval);
    }
    this.intervals.clear();
    this.clients.clear();
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
  WebSocketHealthMonitor
};