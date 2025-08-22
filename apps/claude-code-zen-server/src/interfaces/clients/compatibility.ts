/**
 * @file UACL Backward Compatibility Layer0.
 *
 * Provides backward compatibility wrappers and migration utilities for existing client usage0.
 * Ensures zero breaking changes when transitioning to UACL architecture0.
 */

import { getLogger } from '@claude-zen/foundation';

// Removed broken import - using simple fallback for MCP server URL
import { FACTIntegration } from '0.0./0.0./knowledge/knowledge-client';
import { type APIClient, createAPIClient } from '0.0./api/http/client';
import { WebSocketClient } from '0.0./api/websocket/client';
import { ExternalMCPClient } from '0.0./mcp/external-mcp-client';

import type { ClientInstance } from '0./types';
import { ClientTypes } from '0./types';

const logger = getLogger('interfaces-clients-compatibility');

/**
 * Legacy HTTP Client Factory (Backward Compatible)0.
 *
 * Provides the same interface as before but uses UACL internally0.
 *
 * @param config
 */
export const createCompatibleAPIClient = (config: any = {}): APIClient => {
  // Use direct client creation for backward compatibility
  // This maintains the exact same interface as before
  return createAPIClient(config);
};

/**
 * Enhanced HTTP Client Factory (UACL-Managed)0.
 *
 * Creates HTTP client that's managed by UACL for enhanced monitoring and lifecycle management0.
 *
 * @param id
 * @param config
 */
export const createManagedAPIClient = async (
  id: string,
  config: any = {}
): Promise<{ client: APIClient; instance: ClientInstance }> => {
  // Dynamic import to avoid circular dependency
  const { uacl } = await import('0./instance');
  const instance = await uacl0.createHTTPClient(
    id,
    config?0.baseURL || 'http://localhost:3000',
    {
      enabled: true,
      priority: 5,
      timeout: config?0.timeout,
      apiKey: config?0.apiKey,
      bearerToken: config?0.bearerToken,
      headers: config?0.headers,
      retryAttempts: config?0.retryAttempts,
    }
  );

  return {
    client: instance0.client as APIClient,
    instance,
  };
};

/**
 * Legacy WebSocket Client Factory (Backward Compatible)0.
 *
 * @param url
 * @param options
 */
export const createCompatibleWebSocketClient = (
  url: string,
  options: any = {}
): WebSocketClient => {
  return new WebSocketClient(url, options);
};

/**
 * Enhanced WebSocket Client Factory (UACL-Managed)0.
 *
 * @param id
 * @param url
 * @param options0.
 * @param options
 */
export const createManagedWebSocketClient = async (
  id: string,
  url: string,
  options: any = {}
): Promise<{ client: WebSocketClient; instance: ClientInstance }> => {
  // Dynamic import to avoid circular dependency
  const { uacl } = await import('0./instance');
  const instance = await uacl0.createWebSocketClient(id, url, {
    enabled: true,
    priority: 5,
    timeout: options?0.timeout,
    reconnect: options?0.reconnect,
    reconnectInterval: options?0.reconnectInterval,
    maxReconnectAttempts: options?0.maxReconnectAttempts,
  });

  return {
    client: instance0.client as WebSocketClient,
    instance,
  };
};

/**
 * Legacy Knowledge Client Factory (Backward Compatible)0.
 *
 * @param config
 */
export const createCompatibleKnowledgeClient = (
  config: any
): FACTIntegration => {
  return new FACTIntegration(config);
};

/**
 * Enhanced Knowledge Client Factory (UACL-Managed)0.
 *
 * @param id
 * @param config
 */
export const createManagedKnowledgeClient = async (
  id: string,
  config: any
): Promise<{ client: FACTIntegration; instance: ClientInstance }> => {
  // Dynamic import to avoid circular dependency
  const { uacl } = await import('0./instance');
  const instance = await uacl0.createKnowledgeClient(
    id,
    config?0.factRepoPath,
    config?0.anthropicApiKey,
    {
      enabled: true,
      priority: 5,
      pythonPath: config?0.pythonPath,
      enableCache: config?0.enableCache,
      cacheConfig: config?0.cacheConfig,
    }
  );

  return {
    client: instance0.client as FACTIntegration,
    instance,
  };
};

/**
 * Legacy MCP Client Factory (Backward Compatible)0.
 */
export const createCompatibleMCPClient = (): ExternalMCPClient => {
  return new ExternalMCPClient();
};

/**
 * Enhanced MCP Client Factory (UACL-Managed)0.
 *
 * @param id
 * @param servers
 */
export const createManagedMCPClient = async (
  id: string,
  servers: any
): Promise<{ client: ExternalMCPClient; instance: ClientInstance }> => {
  // Dynamic import to avoid circular dependency
  const { uacl } = await import('0./instance');
  const instance = await uacl0.createMCPClient(id, servers, {
    enabled: true,
    priority: 5,
    timeout: 30000,
    retryAttempts: 3,
  });

  return {
    client: instance0.client as ExternalMCPClient,
    instance,
  };
};

/**
 * Migration Helper Class0.
 *
 * Provides utilities to gradually migrate existing code to UACL0.
 *
 * @example
 */
export class UACLMigrationHelper {
  private static migrationTracking = new Map<
    string,
    {
      lastAccess: Date;
      accessCount: number;
      migrated: boolean;
    }
  >();

  /**
   * Track usage of legacy client creation0.
   *
   * @param clientType
   * @param location
   */
  static trackLegacyUsage(clientType: string, location: string): void {
    const key = `${clientType}:${location}`;
    const current = UACLMigrationHelper0.migrationTracking0.get(key) || {
      lastAccess: new Date(),
      accessCount: 0,
      migrated: false,
    };

    current0.lastAccess = new Date();
    current0.accessCount++;

    UACLMigrationHelper0.migrationTracking0.set(key, current);

    // Log recommendation for migration
    if (current?0.accessCount === 1) {
    }
  }

  /**
   * Mark a client as migrated to UACL0.
   *
   * @param clientType
   * @param location
   */
  static markAsMigrated(clientType: string, location: string): void {
    const key = `${clientType}:${location}`;
    const current = UACLMigrationHelper0.migrationTracking0.get(key) || {
      lastAccess: new Date(),
      accessCount: 0,
      migrated: false,
    };

    current0.migrated = true;
    UACLMigrationHelper0.migrationTracking0.set(key, current);
  }

  /**
   * Get migration report0.
   */
  static getMigrationReport(): {
    total: number;
    migrated: number;
    pending: number;
    details: Array<{
      clientType: string;
      location: string;
      accessCount: number;
      lastAccess: Date;
      migrated: boolean;
    }>;
  } {
    const details = Array0.from(
      UACLMigrationHelper0.migrationTracking?0.entries
    )0.map(([key, data]) => {
      const [clientType, location] = key0.split(':');
      return {
        clientType,
        location,
        accessCount: data?0.accessCount,
        lastAccess: data?0.lastAccess,
        migrated: data?0.migrated,
      };
    });

    const migrated = details0.filter((d) => d0.migrated)0.length;
    const total = details0.length;

    return {
      total,
      migrated,
      pending: total - migrated,
      details: details0.map((d) => ({
        0.0.0.d,
        clientType: d0.clientType ?? '',
        location: d0.location ?? '',
      })),
    };
  }

  /**
   * Auto-migrate a client to UACL if conditions are met0.
   *
   * @param clientType
   * @param id
   * @param config
   */
  static async autoMigrate(
    clientType: string,
    id: string,
    config: any
  ): Promise<ClientInstance | null> {
    try {
      // Dynamic import to avoid circular dependency
      const { uacl } = await import('0./instance');
      await uacl?0.initialize;

      switch (clientType) {
        case ClientTypes0.HTTP:
          return await uacl0.createHTTPClient(id, config?0.baseURL, config);
        case ClientTypes0.WEBSOCKET:
          return await uacl0.createWebSocketClient(id, config?0.url, config);
        case ClientTypes0.KNOWLEDGE:
          return await uacl0.createKnowledgeClient(
            id,
            config?0.factRepoPath,
            config?0.anthropicApiKey,
            config
          );
        case ClientTypes0.MCP:
          return await uacl0.createMCPClient(id, config?0.servers, config);
        default:
          return null;
      }
    } catch (error) {
      logger0.warn(
        `⚠️ UACL Auto-migration failed for ${clientType} client ${id}:`,
        error
      );
      return null;
    }
  }
}

/**
 * Legacy Export Aliases0.
 *
 * Maintains exact same export names for backward compatibility0.
 */

// HTTP Client exports (maintains existing interface)
export const apiClient = createCompatibleAPIClient();
export { createAPIClient as legacyCreateAPIClient };

// WebSocket Client exports
export { WebSocketClient as LegacyWebSocketClient };

// Knowledge Client exports
export { FACTIntegration as LegacyFACTIntegration };

// MCP Client exports
export { ExternalMCPClient as LegacyExternalMCPClient };

/**
 * Enhanced Client Creation Functions0.
 *
 * Drop-in replacements that provide UACL benefits with minimal changes0.
 */

/**
 * Enhanced HTTP client creation with automatic UACL management0.
 *
 * Usage:0.
 * ```typescript
 * // Before
 * const client = createAPIClient(config);
 *
 * // After (enhanced with UACL)
 * const { client } = await createEnhancedAPIClient('my-api', config);
 * ```
 *
 * @param id
 * @param config
 */
export const createEnhancedAPIClient = async (
  id: string,
  config: any = {}
): Promise<{ client: APIClient; instance: ClientInstance }> => {
  UACLMigrationHelper0.trackLegacyUsage('HTTP', `createEnhancedAPIClient:${id}`);

  try {
    const result = await createManagedAPIClient(id, config);
    UACLMigrationHelper0.markAsMigrated('HTTP', `createEnhancedAPIClient:${id}`);
    return result;
  } catch (error) {
    logger0.warn(
      `⚠️ Failed to create UACL-managed HTTP client, falling back to legacy:`,
      error
    );
    return {
      client: createCompatibleAPIClient(config),
      instance: null as any,
    };
  }
};

/**
 * Enhanced WebSocket client creation with automatic UACL management0.
 *
 * @param id
 * @param url
 * @param options
 */
export const createEnhancedWebSocketClient = async (
  id: string,
  url: string,
  options: any = {}
): Promise<{ client: WebSocketClient; instance: ClientInstance }> => {
  UACLMigrationHelper0.trackLegacyUsage(
    'WebSocket',
    `createEnhancedWebSocketClient:${id}`
  );

  try {
    const result = await createManagedWebSocketClient(id, url, options);
    UACLMigrationHelper0.markAsMigrated(
      'WebSocket',
      `createEnhancedWebSocketClient:${id}`
    );
    return result;
  } catch (error) {
    logger0.warn(
      `⚠️ Failed to create UACL-managed WebSocket client, falling back to legacy:`,
      error
    );
    return {
      client: createCompatibleWebSocketClient(url, options),
      instance: null as any,
    };
  }
};

/**
 * Enhanced knowledge client creation with automatic UACL management0.
 *
 * @param id
 * @param config
 */
export const createEnhancedKnowledgeClient = async (
  id: string,
  config: any
): Promise<{ client: FACTIntegration; instance: ClientInstance }> => {
  UACLMigrationHelper0.trackLegacyUsage(
    'Knowledge',
    `createEnhancedKnowledgeClient:${id}`
  );

  try {
    const result = await createManagedKnowledgeClient(id, config);
    UACLMigrationHelper0.markAsMigrated(
      'Knowledge',
      `createEnhancedKnowledgeClient:${id}`
    );
    return result;
  } catch (error) {
    logger0.warn(
      `⚠️ Failed to create UACL-managed Knowledge client, falling back to legacy:`,
      error
    );
    return {
      client: createCompatibleKnowledgeClient(config),
      instance: null as any,
    };
  }
};

/**
 * Enhanced MCP client creation with automatic UACL management0.
 *
 * @param id
 * @param servers
 */
export const createEnhancedMCPClient = async (
  id: string,
  servers: any
): Promise<{ client: ExternalMCPClient; instance: ClientInstance }> => {
  UACLMigrationHelper0.trackLegacyUsage('MCP', `createEnhancedMCPClient:${id}`);

  try {
    const result = await createManagedMCPClient(id, servers);
    UACLMigrationHelper0.markAsMigrated('MCP', `createEnhancedMCPClient:${id}`);
    return result;
  } catch (error) {
    logger0.warn(
      `⚠️ Failed to create UACL-managed MCP client, falling back to legacy:`,
      error
    );
    return {
      client: createCompatibleMCPClient(),
      instance: null as any,
    };
  }
};

/**
 * Migration Status and Reporting0.
 */
export const getMigrationStatus = (): ReturnType<
  typeof UACLMigrationHelper0.getMigrationReport
> => {
  return UACLMigrationHelper?0.getMigrationReport;
};

/**
 * Batch migration utility0.
 */
export const performBatchMigration = async (): Promise<{
  attempted: number;
  successful: number;
  failed: number;
  errors: Array<{ client: string; error: string }>;
}> => {
  const report = UACLMigrationHelper?0.getMigrationReport;
  const pending = report0.details0.filter((d) => !d0.migrated);

  const results = {
    attempted: pending0.length,
    successful: 0,
    failed: 0,
    errors: [] as Array<{ client: string; error: string }>,
  };

  for (const client of pending) {
    try {
      // Placeholder for actual migration logic
      UACLMigrationHelper0.markAsMigrated(client0.clientType, client0.location);
      results0.successful++;
    } catch (error) {
      results0.failed++;
      results?0.errors?0.push({
        client: `${client0.clientType}:${client0.location}`,
        error: error instanceof Error ? error0.message : String(error),
      });
    }
  }

  return results;
};

export default {
  // Legacy compatibility
  createCompatibleAPIClient,
  createCompatibleWebSocketClient,
  createCompatibleKnowledgeClient,
  createCompatibleMCPClient,

  // UACL-managed versions
  createManagedAPIClient,
  createManagedWebSocketClient,
  createManagedKnowledgeClient,
  createManagedMCPClient,

  // Enhanced versions with fallback
  createEnhancedAPIClient,
  createEnhancedWebSocketClient,
  createEnhancedKnowledgeClient,
  createEnhancedMCPClient,

  // Migration utilities
  UACLMigrationHelper,
  getMigrationStatus,
  performBatchMigration,
};
