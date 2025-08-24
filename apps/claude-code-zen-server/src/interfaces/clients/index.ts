/**
 * @fileoverview UACL (Unified API Client Layer) - Main Exports
 *
 * Central export point for all UACL functionality including:
 * - Client registry and management system
 * - Client factory implementations
 * - Type definitions and configurations
 * - Helper functions and utilities
 * - Global instances and initialization
 *
 * The UACL provides a unified interface for managing HTTP, WebSocket,
 * Knowledge, and MCP clients with consistent patterns for authentication,
 * retry logic, health monitoring, and metrics collection.
 *
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0
 */

import { getLogger } from '@claude-zen/foundation';

// Core UACL components
export {
  ClientRegistry,
  globalClientRegistry
} from './core/client-registry';

export type {
  Client,
  ClientConfig,
  ClientFactory,
  ClientInstance,
  ClientType,
  ClientResponse,
  ClientError,
  ClientMetrics,
  HealthCheckResult,
  AuthenticationConfig,
  RetryConfig,
  RateLimitConfig,
  LoggingConfig,
  CircuitBreakerConfig,
  CacheConfig,
  TimeoutConfig
} from './core/interfaces';

// Client factories and implementations
export {
  UACLFactory,
  HTTPClientFactory,
  WebSocketClientFactory,
  KnowledgeClientFactory,
  globalUACLFactory,
  createHTTPClient,
  createWebSocketClient,
  createKnowledgeClient
} from './factories';

// HTTP client implementation and types
export { HTTPClientAdapter } from './adapters/http-client-adapter';
export type {
  HTTPClientConfig,
  HTTPMethod,
  HTTPAuthType,
  HTTPRetryConfig,
  HTTPMonitoringConfig,
  HTTPHealthConfig,
  HTTPResponse,
  HTTPRequestConfig,
  HTTPClientOptions
} from './adapters/http-types';

// WebSocket client implementation and types
export { WebSocketClientAdapter } from './adapters/websocket-client-adapter';
export type {
  WebSocketClientConfig,
  WebSocketMessage,
  WebSocketOptions,
  WebSocketSubscription,
  WebSocketEventType
} from './adapters/websocket-types';

// Knowledge client implementation
export { KnowledgeClientAdapter } from './adapters/knowledge-client-adapter';

// Type definitions and enums
export {
  ProtocolTypes
} from './types';
export type { ProtocolType } from './types';

// Compatibility layer
export {
  UACLCompatibility,
  isUACLEnabled,
  enableUACL,
  disableUACL
} from './compatibility';

const logger = getLogger('UACL');

/**
 * System health status interface
 */
export interface SystemHealthStatus {
  /** Overall system status */
  status: 'healthy' | 'degraded' | 'critical';
  /** Total number of clients */
  totalClients: number;
  /** Number of healthy clients */
  healthyClients: number;
  /** Number of degraded clients */
  degradedClients: number;
  /** Number of unhealthy clients */
  unhealthyClients: number;
  /** Health breakdown by client type */
  byType: Record<string, {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
  }>;
}

/**
 * UACL Main Interface - Singleton Pattern.
 *
 * Primary interface for interacting with the Unified API Client Layer.
 * Provides high-level methods for client management and operations.
 */
export class UACL {
  private static instance: UACL;
  private initialized = false;
  private logger = getLogger('UACL');

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get singleton UACL instance.
   */
  static getInstance(): UACL {
    if (!UACL.instance) {
      UACL.instance = new UACL();
    }
    return UACL.instance;
  }

  /**
   * Initialize UACL system.
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      await globalClientRegistry.initialize();
      this.initialized = true;
      this.logger.info('UACL system initialized');
    } catch (error) {
      this.logger.error('Failed to initialize UACL system:', error);
      throw error;
    }
  }

  /**
   * Check if UACL is initialized.
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Create HTTP client using factory.
   */
  async createHTTPClient(config: ClientConfig): Promise<Client> {
    if (!this.initialized) {
      await this.initialize();
    }

    return createHTTPClient(config);
  }

  /**
   * Create WebSocket client using factory.
   */
  async createWebSocketClient(config: ClientConfig): Promise<Client> {
    if (!this.initialized) {
      await this.initialize();
    }

    return createWebSocketClient(config);
  }

  /**
   * Create Knowledge client using factory.
   */
  async createKnowledgeClient(config: ClientConfig): Promise<Client> {
    if (!this.initialized) {
      await this.initialize();
    }

    return createKnowledgeClient(config);
  }

  /**
   * Get system health status.
   */
  async getSystemHealth(): Promise<SystemHealthStatus> {
    const stats = globalClientRegistry.getStatistics();
    
    // For now, return basic health status
    // In a full implementation, this would check actual client health
    const status: SystemHealthStatus = {
      status: stats.totalClients > 0 ? 'healthy' : 'degraded',
      totalClients: stats.totalClients,
      healthyClients: stats.activeClients,
      degradedClients: 0,
      unhealthyClients: stats.totalClients - stats.activeClients,
      byType: {}
    };

    // Add protocol breakdown
    for (const [protocol, count] of Object.entries(stats.clientsByProtocol)) {
      status.byType[protocol] = {
        total: count,
        healthy: count,
        degraded: 0,
        unhealthy: 0
      };
    }

    return status;
  }

  /**
   * Shutdown UACL system.
   */
  async shutdown(): Promise<void> {
    try {
      await globalClientRegistry.shutdown();
      this.initialized = false;
      this.logger.info('UACL system shutdown completed');
    } catch (error) {
      this.logger.error('Error during UACL shutdown:', error);
      throw error;
    }
  }
}

/**
 * Global UACL instance.
 */
export const globalUACL = UACL.getInstance();

/**
 * Initialize UACL system globally.
 */
export const initializeUACL = async (): Promise<void> => {
  return globalUACL.initialize();
};

/**
 * Check if UACL is initialized globally.
 */
export const isUACLInitialized = (): boolean => {
  return globalUACL.isInitialized();
};

/**
 * Convenience functions for client creation
 */
export const createClient = {
  http: (config: ClientConfig) => globalUACL.createHTTPClient(config),
  websocket: (config: ClientConfig) => globalUACL.createWebSocketClient(config),
  knowledge: (config: ClientConfig) => globalUACL.createKnowledgeClient(config)
};

export default UACL;