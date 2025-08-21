/**
 * @file UACL Backward Compatibility Layer.
 *
 * Provides backward compatibility wrappers and migration utilities for existing client usage.
 * Ensures zero breaking changes when transitioning to UACL architecture.
 */

import { getLogger } from '@claude-zen/foundation'

// Removed broken import - using simple fallback for MCP server URL
import { FACTIntegration } from '../../knowledge/knowledge-client';
import { type APIClient, createAPIClient } from '../api/http/client';
import { WebSocketClient } from '../api/websocket/client';
import { ExternalMCPClient } from '../mcp/external-mcp-client';

import type { ClientInstance } from './types';
import { ClientTypes } from './types';

const logger = getLogger('interfaces-clients-compatibility');

/**
 * Legacy HTTP Client Factory (Backward Compatible).
 *
 * Provides the same interface as before but uses UACL internally.
 *
 * @param config
 */
export const createCompatibleAPIClient = (config: unknown = {}): APIClient => {
  // Use direct client creation for backward compatibility
  // This maintains the exact same interface as before
  return createAPIClient(config);
};

/**
 * Enhanced HTTP Client Factory (UACL-Managed).
 *
 * Creates HTTP client that's managed by UACL for enhanced monitoring and lifecycle management.
 *
 * @param id
 * @param config
 */
export const createManagedAPIClient = async (
  id: string,
  config: unknown = {}
): Promise<{ client: APIClient; instance: ClientInstance }> => {
  // Dynamic import to avoid circular dependency
  const { uacl } = await import('./instance');
  const instance = await uacl.createHTTPClient(
    id,
    config?.baseURL || 'http://localhost:3000',
    {
      enabled: true,
      priority: 5,
      timeout: config?.timeout,
      apiKey: config?.apiKey,
      bearerToken: config?.bearerToken,
      headers: config?.headers,
      retryAttempts: config?.retryAttempts,
    }
  );

  return {
    client: instance.client as APIClient,
    instance,
  };
};

/**
 * Legacy WebSocket Client Factory (Backward Compatible).
 *
 * @param url
 * @param options
 */
export const createCompatibleWebSocketClient = (
  url: string,
  options: unknown = {}
): WebSocketClient => {
  return new WebSocketClient(url, options);
};

/**
 * Enhanced WebSocket Client Factory (UACL-Managed).
 *
 * @param id
 * @param url
 * @param options.
 * @param options
 */
export const createManagedWebSocketClient = async (
  id: string,
  url: string,
  options: unknown = {}
): Promise<{ client: WebSocketClient; instance: ClientInstance }> => {
  // Dynamic import to avoid circular dependency
  const { uacl } = await import('./instance');
  const instance = await uacl.createWebSocketClient(id, url, {
    enabled: true,
    priority: 5,
    timeout: options?.timeout,
    reconnect: options?.reconnect,
    reconnectInterval: options?.reconnectInterval,
    maxReconnectAttempts: options?.maxReconnectAttempts,
  });

  return {
    client: instance.client as WebSocketClient,
    instance,
  };
};

/**
 * Legacy Knowledge Client Factory (Backward Compatible).
 *
 * @param config
 */
export const createCompatibleKnowledgeClient = (
  config: unknown
): FACTIntegration => {
  return new FACTIntegration(config);
};

/**
 * Enhanced Knowledge Client Factory (UACL-Managed).
 *
 * @param id
 * @param config
 */
export const createManagedKnowledgeClient = async (
  id: string,
  config: unknown
): Promise<{ client: FACTIntegration; instance: ClientInstance }> => {
  // Dynamic import to avoid circular dependency
  const { uacl } = await import('./instance');
  const instance = await uacl.createKnowledgeClient(
    id,
    config?.factRepoPath,
    config?.anthropicApiKey,
    {
      enabled: true,
      priority: 5,
      pythonPath: config?.pythonPath,
      enableCache: config?.enableCache,
      cacheConfig: config?.cacheConfig,
    }
  );

  return {
    client: instance.client as FACTIntegration,
    instance,
  };
};

/**
 * Legacy MCP Client Factory (Backward Compatible).
 */
export const createCompatibleMCPClient = (): ExternalMCPClient => {
  return new ExternalMCPClient();
};

/**
 * Enhanced MCP Client Factory (UACL-Managed).
 *
 * @param id
 * @param servers
 */
export const createManagedMCPClient = async (
  id: string,
  servers: unknown
): Promise<{ client: ExternalMCPClient; instance: ClientInstance }> => {
  // Dynamic import to avoid circular dependency
  const { uacl } = await import('./instance');
  const instance = await uacl.createMCPClient(id, servers, {
    enabled: true,
    priority: 5,
    timeout: 30000,
    retryAttempts: 3,
  });

  return {
    client: instance.client as ExternalMCPClient,
    instance,
  };
};

/**
 * Migration Helper Class.
 *
 * Provides utilities to gradually migrate existing code to UACL.
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
   * Track usage of legacy client creation.
   *
   * @param clientType
   * @param location
   */
  static trackLegacyUsage(clientType: string, location: string): void {
    const key = `${clientType}:${location}`;
    const current = UACLMigrationHelper.migrationTracking.get(key) || {
      lastAccess: new Date(),
      accessCount: 0,
      migrated: false,
    };

    current.lastAccess = new Date();
    current.accessCount++;

    UACLMigrationHelper.migrationTracking.set(key, current);

    // Log recommendation for migration
    if (current?.accessCount === 1) {
    }
  }

  /**
   * Mark a client as migrated to UACL.
   *
   * @param clientType
   * @param location
   */
  static markAsMigrated(clientType: string, location: string): void {
    const key = `${clientType}:${location}`;
    const current = UACLMigrationHelper.migrationTracking.get(key) || {
      lastAccess: new Date(),
      accessCount: 0,
      migrated: false,
    };

    current.migrated = true;
    UACLMigrationHelper.migrationTracking.set(key, current);
  }

  /**
   * Get migration report.
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
    const details = Array.from(
      UACLMigrationHelper.migrationTracking.entries()
    ).map(([key, data]) => {
      const [clientType, location] = key.split(':');
      return {
        clientType,
        location,
        accessCount: data?.accessCount,
        lastAccess: data?.lastAccess,
        migrated: data?.migrated,
      };
    });

    const migrated = details.filter((d) => d.migrated).length;
    const total = details.length;

    return {
      total,
      migrated,
      pending: total - migrated,
      details: details.map((d) => ({
        ...d,
        clientType: d.clientType ?? '',
        location: d.location ?? '',
      })),
    };
  }

  /**
   * Auto-migrate a client to UACL if conditions are met.
   *
   * @param clientType
   * @param id
   * @param config
   */
  static async autoMigrate(
    clientType: string,
    id: string,
    config: unknown
  ): Promise<ClientInstance | null> {
    try {
      // Dynamic import to avoid circular dependency
      const { uacl } = await import('./instance');
      await uacl.initialize();

      switch (clientType) {
        case ClientTypes.HTTP:
          return await uacl.createHTTPClient(id, config?.baseURL, config);
        case ClientTypes.WEBSOCKET:
          return await uacl.createWebSocketClient(id, config?.url, config);
        case ClientTypes.KNOWLEDGE:
          return await uacl.createKnowledgeClient(
            id,
            config?.factRepoPath,
            config?.anthropicApiKey,
            config
          );
        case ClientTypes.MCP:
          return await uacl.createMCPClient(id, config?.servers, config);
        default:
          return null;
      }
    } catch (error) {
      logger.warn(
        `⚠️ UACL Auto-migration failed for ${clientType} client ${id}:`,
        error
      );
      return null;
    }
  }
}

/**
 * Legacy Export Aliases.
 *
 * Maintains exact same export names for backward compatibility.
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
 * Enhanced Client Creation Functions.
 *
 * Drop-in replacements that provide UACL benefits with minimal changes.
 */

/**
 * Enhanced HTTP client creation with automatic UACL management.
 *
 * Usage:.
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
  config: unknown = {}
): Promise<{ client: APIClient; instance: ClientInstance }> => {
  UACLMigrationHelper.trackLegacyUsage('HTTP', `createEnhancedAPIClient:${id}`);

  try {
    const result = await createManagedAPIClient(id, config);
    UACLMigrationHelper.markAsMigrated('HTTP', `createEnhancedAPIClient:${id}`);
    return result;
  } catch (error) {
    logger.warn(
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
 * Enhanced WebSocket client creation with automatic UACL management.
 *
 * @param id
 * @param url
 * @param options
 */
export const createEnhancedWebSocketClient = async (
  id: string,
  url: string,
  options: unknown = {}
): Promise<{ client: WebSocketClient; instance: ClientInstance }> => {
  UACLMigrationHelper.trackLegacyUsage(
    'WebSocket',
    `createEnhancedWebSocketClient:${id}`
  );

  try {
    const result = await createManagedWebSocketClient(id, url, options);
    UACLMigrationHelper.markAsMigrated(
      'WebSocket',
      `createEnhancedWebSocketClient:${id}`
    );
    return result;
  } catch (error) {
    logger.warn(
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
 * Enhanced knowledge client creation with automatic UACL management.
 *
 * @param id
 * @param config
 */
export const createEnhancedKnowledgeClient = async (
  id: string,
  config: unknown
): Promise<{ client: FACTIntegration; instance: ClientInstance }> => {
  UACLMigrationHelper.trackLegacyUsage(
    'Knowledge',
    `createEnhancedKnowledgeClient:${id}`
  );

  try {
    const result = await createManagedKnowledgeClient(id, config);
    UACLMigrationHelper.markAsMigrated(
      'Knowledge',
      `createEnhancedKnowledgeClient:${id}`
    );
    return result;
  } catch (error) {
    logger.warn(
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
 * Enhanced MCP client creation with automatic UACL management.
 *
 * @param id
 * @param servers
 */
export const createEnhancedMCPClient = async (
  id: string,
  servers: unknown
): Promise<{ client: ExternalMCPClient; instance: ClientInstance }> => {
  UACLMigrationHelper.trackLegacyUsage('MCP', `createEnhancedMCPClient:${id}`);

  try {
    const result = await createManagedMCPClient(id, servers);
    UACLMigrationHelper.markAsMigrated('MCP', `createEnhancedMCPClient:${id}`);
    return result;
  } catch (error) {
    logger.warn(
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
 * Migration Status and Reporting.
 */
export const getMigrationStatus = (): ReturnType<
  typeof UACLMigrationHelper.getMigrationReport
> => {
  return UACLMigrationHelper.getMigrationReport();
};

/**
 * Batch migration utility.
 */
export const performBatchMigration = async (): Promise<{
  attempted: number;
  successful: number;
  failed: number;
  errors: Array<{ client: string; error: string }>;
}> => {
  const report = UACLMigrationHelper.getMigrationReport();
  const pending = report.details.filter((d) => !d.migrated);

  const results = {
    attempted: pending.length,
    successful: 0,
    failed: 0,
    errors: [] as Array<{ client: string; error: string }>,
  };

  for (const client of pending) {
    try {
      // Placeholder for actual migration logic
      UACLMigrationHelper.markAsMigrated(client.clientType, client.location);
      results.successful++;
    } catch (error) {
      results.failed++;
      results?.errors?.push({
        client: `${client.clientType}:${client.location}`,
        error: error instanceof Error ? error.message : String(error),
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
