/**
 * UACL Compatibility Layer
 * 
 * Provides backward compatibility with existing client interfaces
 * while leveraging the new UACL (Unified API Client Layer) internally.
 */

import { getLogger } from '@claude-zen/foundation';
import { createAPIClient } from './api-client';
import { createWebSocketClient } from './websocket-client';
import type { APIClient } from './api-client';
import type { WebSocketClient } from './websocket-client';
import type { ClientInstance } from './types';
import { ClientTypes } from './types';

const logger = getLogger('UACLCompatibility');

/**
 * Legacy HTTP Client Factory (Backward Compatible).
 *
 * Provides the same interface as before but uses UACL internally.
 */
export const createCompatibleAPIClient = (config: any = {}): APIClient => {
  // Use direct client creation for backward compatibility
  // This maintains the exact same interface as before
  return createAPIClient(config);
};

/**
 * Enhanced HTTP Client Factory (UACL-Managed).
 *
 * Uses UACL factory pattern for improved resource management,
 * connection pooling, and advanced features.
 */
export const createEnhancedAPIClient = async (config: any = {}): Promise<APIClient> => {
  logger.info('Creating enhanced API client with UACL', { config });
  
  try {
    // Enhanced creation with UACL features
    const client = createAPIClient({
      ...config,
      // Enable UACL enhanced features
      enableConnectionPooling: true,
      enableMetrics: true,
      enableRetryLogic: true
    });
    
    return client;
  } catch (error) {
    logger.error('Failed to create enhanced API client', error);
    throw error;
  }
};

/**
 * Legacy WebSocket Client Factory (Backward Compatible).
 */
export const createCompatibleWebSocketClient = (config: any = {}): WebSocketClient => {
  return createWebSocketClient(config);
};

/**
 * Enhanced WebSocket Client Factory (UACL-Managed).
 */
export const createEnhancedWebSocketClient = async (config: any = {}): Promise<WebSocketClient> => {
  logger.info('Creating enhanced WebSocket client with UACL', { config });
  
  try {
    const client = createWebSocketClient({
      ...config,
      // Enable UACL enhanced features
      enableConnectionPooling: true,
      enableMetrics: true,
      enableRetryLogic: true,
      enableHeartbeat: true
    });
    
    return client;
  } catch (error) {
    logger.error('Failed to create enhanced WebSocket client', error);
    throw error;
  }
};

/**
 * Universal Client Factory (UACL).
 * 
 * Creates clients based on protocol/type detection.
 */
export const createUniversalClient = async (config: {
  type?: 'http' | 'websocket' | 'auto';
  url?: string;
  protocol?: string;
  [key: string]: any;
}): Promise<APIClient | WebSocketClient> => {
  const clientType = config.type || detectClientType(config);
  
  logger.info('Creating universal client', { clientType, config });
  
  switch (clientType) {
    case 'http':
      return createEnhancedAPIClient(config);
    case 'websocket':
      return createEnhancedWebSocketClient(config);
    default:
      throw new Error(`Unsupported client type: ${clientType}`);
  }
};

/**
 * Detect client type from configuration.
 */
function detectClientType(config: any): 'http' | 'websocket' {
  if (config.url) {
    const url = new URL(config.url);
    if (url.protocol === 'ws:' || url.protocol === 'wss:') {
      return 'websocket';
    }
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return 'http';
    }
  }
  
  if (config.protocol) {
    if (config.protocol.includes('websocket') || config.protocol.includes('ws')) {
      return 'websocket';
    }
    if (config.protocol.includes('http')) {
      return 'http';
    }
  }
  
  // Default to HTTP if cannot detect
  return 'http';
}

/**
 * Client Migration Helper.
 * 
 * Helps migrate from old client interfaces to UACL.
 */
export class ClientMigrationHelper {
  private legacyClients = new Map<string, any>();
  private uaclClients = new Map<string, any>();

  /**
   * Register a legacy client for migration.
   */
  registerLegacyClient(id: string, client: any): void {
    this.legacyClients.set(id, client);
    logger.info('Registered legacy client for migration', { id });
  }

  /**
   * Migrate a legacy client to UACL.
   */
  async migrateLegacyClient(id: string, config: any = {}): Promise<any> {
    const legacyClient = this.legacyClients.get(id);
    if (!legacyClient) {
      throw new Error(`Legacy client not found: ${id}`);
    }

    logger.info('Migrating legacy client to UACL', { id });

    try {
      // Create UACL equivalent
      const uaclClient = await createUniversalClient({
        ...config,
        // Inherit configuration from legacy client
        ...this.extractLegacyConfig(legacyClient)
      });

      this.uaclClients.set(id, uaclClient);
      logger.info('Successfully migrated legacy client', { id });

      return uaclClient;
    } catch (error) {
      logger.error('Failed to migrate legacy client', { id, error });
      throw error;
    }
  }

  /**
   * Extract configuration from legacy client.
   */
  private extractLegacyConfig(legacyClient: any): any {
    const config: any = {};

    // Extract common configuration patterns
    if (legacyClient.baseURL || legacyClient.url) {
      config.url = legacyClient.baseURL || legacyClient.url;
    }

    if (legacyClient.timeout) {
      config.timeout = legacyClient.timeout;
    }

    if (legacyClient.headers) {
      config.headers = legacyClient.headers;
    }

    if (legacyClient.auth || legacyClient.authentication) {
      config.authentication = legacyClient.auth || legacyClient.authentication;
    }

    return config;
  }

  /**
   * Get migrated client.
   */
  getMigratedClient(id: string): any {
    return this.uaclClients.get(id);
  }

  /**
   * Cleanup migration resources.
   */
  cleanup(): void {
    this.legacyClients.clear();
    this.uaclClients.clear();
    logger.info('Cleaned up migration resources');
  }
}

/**
 * Compatibility shims for common client patterns.
 */
export const CompatibilityShims = {
  /**
   * Axios-like interface shim.
   */
  axios: {
    create: (config: any = {}) => createCompatibleAPIClient(config),
    get: (url: string, config?: any) => {
      const client = createCompatibleAPIClient(config);
      return client.get(url, config);
    },
    post: (url: string, data?: any, config?: any) => {
      const client = createCompatibleAPIClient(config);
      return client.post(url, data, config);
    },
    put: (url: string, data?: any, config?: any) => {
      const client = createCompatibleAPIClient(config);
      return client.put(url, data, config);
    },
    delete: (url: string, config?: any) => {
      const client = createCompatibleAPIClient(config);
      return client.delete(url, config);
    }
  },

  /**
   * Fetch-like interface shim.
   */
  fetch: async (url: string, options: any = {}) => {
    const client = createCompatibleAPIClient({
      baseURL: new URL(url).origin,
      ...options
    });
    
    const method = options.method?.toLowerCase() || 'get';
    const response = await client[method](url, options.body, options);
    
    return {
      ...response,
      ok: response.status >= 200 && response.status < 300,
      json: () => Promise.resolve(response.data),
      text: () => Promise.resolve(typeof response.data === 'string' ? response.data : JSON.stringify(response.data))
    };
  },

  /**
   * Socket.IO-like interface shim.
   */
  socketIO: {
    connect: (url: string, options: any = {}) => {
      return createCompatibleWebSocketClient({
        url,
        protocols: ['socket.io'],
        ...options
      });
    }
  }
};

/**
 * Feature detection for UACL capabilities.
 */
export const FeatureDetection = {
  /**
   * Check if UACL is available.
   */
  isUACLAvailable(): boolean {
    try {
      return typeof createUniversalClient === 'function';
    } catch {
      return false;
    }
  },

  /**
   * Get UACL feature list.
   */
  getUACLFeatures(): string[] {
    return [
      'connection-pooling',
      'retry-logic',
      'metrics-collection',
      'protocol-detection',
      'unified-interface',
      'compatibility-layer',
      'resource-management',
      'error-handling',
      'authentication',
      'middleware-support'
    ];
  },

  /**
   * Check if specific feature is supported.
   */
  supportsFeature(feature: string): boolean {
    return this.getUACLFeatures().includes(feature);
  }
};

// Global compatibility instance
export const globalMigrationHelper = new ClientMigrationHelper();

/**
 * Initialize UACL compatibility layer.
 */
export function initializeUACLCompatibility(): void {
  logger.info('Initializing UACL compatibility layer');
  
  // Set up global shims if needed
  if (typeof globalThis !== 'undefined') {
    // Provide global access to compatibility shims
    globalThis.UACLCompat = CompatibilityShims;
  }
  
  logger.info('UACL compatibility layer initialized successfully');
}

// Auto-initialize on import
initializeUACLCompatibility();

export default {
  createCompatibleAPIClient,
  createEnhancedAPIClient,
  createCompatibleWebSocketClient,
  createEnhancedWebSocketClient,
  createUniversalClient,
  ClientMigrationHelper,
  CompatibilityShims,
  FeatureDetection,
  globalMigrationHelper,
  initializeUACLCompatibility
};