/**
 * @file UACL Backward Compatibility Layer.
 *
 * Provides backward compatibility wrappers and migration utilities for existing client usage.
 * Ensures zero breaking changes when transitioning to UACL architecture.
 */
import { FACTIntegration } from '../../knowledge/knowledge-client.ts';
import { type APIClient, createAPIClient } from '../api/http/client.ts';
import { WebSocketClient } from '../api/websocket/client.ts';
import { ExternalMCPClient } from '../mcp/external-mcp-client.ts';
import type { ClientInstance } from './registry.ts';
/**
 * Legacy HTTP Client Factory (Backward Compatible).
 *
 * Provides the same interface as before but uses UACL internally.
 *
 * @param config
 */
export declare const createCompatibleAPIClient: (config?: any) => APIClient;
/**
 * Enhanced HTTP Client Factory (UACL-Managed).
 *
 * Creates HTTP client that's managed by UACL for enhanced monitoring and lifecycle management.
 *
 * @param id
 * @param config
 */
export declare const createManagedAPIClient: (id: string, config?: any) => Promise<{
    client: APIClient;
    instance: ClientInstance;
}>;
/**
 * Legacy WebSocket Client Factory (Backward Compatible).
 *
 * @param url
 * @param options
 */
export declare const createCompatibleWebSocketClient: (url: string, options?: any) => WebSocketClient;
/**
 * Enhanced WebSocket Client Factory (UACL-Managed).
 *
 * @param id
 * @param url
 * @param options.
 * @param options
 */
export declare const createManagedWebSocketClient: (id: string, url: string, options?: any) => Promise<{
    client: WebSocketClient;
    instance: ClientInstance;
}>;
/**
 * Legacy Knowledge Client Factory (Backward Compatible).
 *
 * @param config
 */
export declare const createCompatibleKnowledgeClient: (config: any) => FACTIntegration;
/**
 * Enhanced Knowledge Client Factory (UACL-Managed).
 *
 * @param id
 * @param config
 */
export declare const createManagedKnowledgeClient: (id: string, config: any) => Promise<{
    client: FACTIntegration;
    instance: ClientInstance;
}>;
/**
 * Legacy MCP Client Factory (Backward Compatible).
 */
export declare const createCompatibleMCPClient: () => ExternalMCPClient;
/**
 * Enhanced MCP Client Factory (UACL-Managed).
 *
 * @param id
 * @param servers
 */
export declare const createManagedMCPClient: (id: string, servers: any) => Promise<{
    client: ExternalMCPClient;
    instance: ClientInstance;
}>;
/**
 * Migration Helper Class.
 *
 * Provides utilities to gradually migrate existing code to UACL.
 *
 * @example
 */
export declare class UACLMigrationHelper {
    private static migrationTracking;
    /**
     * Track usage of legacy client creation.
     *
     * @param clientType
     * @param location
     */
    static trackLegacyUsage(clientType: string, location: string): void;
    /**
     * Mark a client as migrated to UACL.
     *
     * @param clientType
     * @param location
     */
    static markAsMigrated(clientType: string, location: string): void;
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
    };
    /**
     * Auto-migrate a client to UACL if conditions are met.
     *
     * @param clientType
     * @param id
     * @param config
     */
    static autoMigrate(clientType: string, id: string, config: any): Promise<ClientInstance | null>;
}
/**
 * Legacy Export Aliases.
 *
 * Maintains exact same export names for backward compatibility.
 */
export declare const apiClient: APIClient;
export { createAPIClient as legacyCreateAPIClient };
export { WebSocketClient as LegacyWebSocketClient };
export { FACTIntegration as LegacyFACTIntegration };
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
export declare const createEnhancedAPIClient: (id: string, config?: any) => Promise<{
    client: APIClient;
    instance: ClientInstance;
}>;
/**
 * Enhanced WebSocket client creation with automatic UACL management.
 *
 * @param id
 * @param url
 * @param options
 */
export declare const createEnhancedWebSocketClient: (id: string, url: string, options?: any) => Promise<{
    client: WebSocketClient;
    instance: ClientInstance;
}>;
/**
 * Enhanced knowledge client creation with automatic UACL management.
 *
 * @param id
 * @param config
 */
export declare const createEnhancedKnowledgeClient: (id: string, config: any) => Promise<{
    client: FACTIntegration;
    instance: ClientInstance;
}>;
/**
 * Enhanced MCP client creation with automatic UACL management.
 *
 * @param id
 * @param servers
 */
export declare const createEnhancedMCPClient: (id: string, servers: any) => Promise<{
    client: ExternalMCPClient;
    instance: ClientInstance;
}>;
/**
 * Migration Status and Reporting.
 */
export declare const getMigrationStatus: () => ReturnType<typeof UACLMigrationHelper.getMigrationReport>;
/**
 * Batch migration utility.
 */
export declare const performBatchMigration: () => Promise<{
    attempted: number;
    successful: number;
    failed: number;
    errors: Array<{
        client: string;
        error: string;
    }>;
}>;
declare const _default: {
    createCompatibleAPIClient: (config?: any) => APIClient;
    createCompatibleWebSocketClient: (url: string, options?: any) => WebSocketClient;
    createCompatibleKnowledgeClient: (config: any) => FACTIntegration;
    createCompatibleMCPClient: () => ExternalMCPClient;
    createManagedAPIClient: (id: string, config?: any) => Promise<{
        client: APIClient;
        instance: ClientInstance;
    }>;
    createManagedWebSocketClient: (id: string, url: string, options?: any) => Promise<{
        client: WebSocketClient;
        instance: ClientInstance;
    }>;
    createManagedKnowledgeClient: (id: string, config: any) => Promise<{
        client: FACTIntegration;
        instance: ClientInstance;
    }>;
    createManagedMCPClient: (id: string, servers: any) => Promise<{
        client: ExternalMCPClient;
        instance: ClientInstance;
    }>;
    createEnhancedAPIClient: (id: string, config?: any) => Promise<{
        client: APIClient;
        instance: ClientInstance;
    }>;
    createEnhancedWebSocketClient: (id: string, url: string, options?: any) => Promise<{
        client: WebSocketClient;
        instance: ClientInstance;
    }>;
    createEnhancedKnowledgeClient: (id: string, config: any) => Promise<{
        client: FACTIntegration;
        instance: ClientInstance;
    }>;
    createEnhancedMCPClient: (id: string, servers: any) => Promise<{
        client: ExternalMCPClient;
        instance: ClientInstance;
    }>;
    UACLMigrationHelper: typeof UACLMigrationHelper;
    getMigrationStatus: () => ReturnType<typeof UACLMigrationHelper.getMigrationReport>;
    performBatchMigration: () => Promise<{
        attempted: number;
        successful: number;
        failed: number;
        errors: Array<{
            client: string;
            error: string;
        }>;
    }>;
};
export default _default;
//# sourceMappingURL=compatibility.d.ts.map