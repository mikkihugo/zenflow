import { getLogger } from '../../config/logging-config.ts';
const logger = getLogger('interfaces-clients-compatibility');
import { getMCPServerURL } from '../../config/defaults.ts';
import { FACTIntegration } from '../../knowledge/knowledge-client.ts';
import { createAPIClient } from '../api/http/client.ts';
import { WebSocketClient } from '../api/websocket/client.ts';
import { ExternalMCPClient } from '../mcp/external-mcp-client.ts';
import { ClientTypes } from './types.ts';
export const createCompatibleAPIClient = (config = {}) => {
    return createAPIClient(config);
};
export const createManagedAPIClient = async (id, config = {}) => {
    const { uacl } = await import('./instance.ts');
    const instance = await uacl.createHTTPClient(id, config?.baseURL || getMCPServerURL(), {
        enabled: true,
        priority: 5,
        timeout: config?.timeout,
        apiKey: config?.apiKey,
        bearerToken: config?.bearerToken,
        headers: config?.headers,
        retryAttempts: config?.retryAttempts,
    });
    return {
        client: instance.client,
        instance,
    };
};
export const createCompatibleWebSocketClient = (url, options = {}) => {
    return new WebSocketClient(url, options);
};
export const createManagedWebSocketClient = async (id, url, options = {}) => {
    const { uacl } = await import('./instance.ts');
    const instance = await uacl.createWebSocketClient(id, url, {
        enabled: true,
        priority: 5,
        timeout: options?.timeout,
        reconnect: options?.reconnect,
        reconnectInterval: options?.reconnectInterval,
        maxReconnectAttempts: options?.maxReconnectAttempts,
    });
    return {
        client: instance.client,
        instance,
    };
};
export const createCompatibleKnowledgeClient = (config) => {
    return new FACTIntegration(config);
};
export const createManagedKnowledgeClient = async (id, config) => {
    const { uacl } = await import('./instance.ts');
    const instance = await uacl.createKnowledgeClient(id, config?.factRepoPath, config?.anthropicApiKey, {
        enabled: true,
        priority: 5,
        pythonPath: config?.pythonPath,
        enableCache: config?.enableCache,
        cacheConfig: config?.cacheConfig,
    });
    return {
        client: instance.client,
        instance,
    };
};
export const createCompatibleMCPClient = () => {
    return new ExternalMCPClient();
};
export const createManagedMCPClient = async (id, servers) => {
    const { uacl } = await import('./instance.ts');
    const instance = await uacl.createMCPClient(id, servers, {
        enabled: true,
        priority: 5,
        timeout: 30000,
        retryAttempts: 3,
    });
    return {
        client: instance.client,
        instance,
    };
};
export class UACLMigrationHelper {
    static migrationTracking = new Map();
    static trackLegacyUsage(clientType, location) {
        const key = `${clientType}:${location}`;
        const current = UACLMigrationHelper.migrationTracking.get(key) || {
            lastAccess: new Date(),
            accessCount: 0,
            migrated: false,
        };
        current.lastAccess = new Date();
        current.accessCount++;
        UACLMigrationHelper.migrationTracking.set(key, current);
        if (current?.accessCount === 1) {
        }
    }
    static markAsMigrated(clientType, location) {
        const key = `${clientType}:${location}`;
        const current = UACLMigrationHelper.migrationTracking.get(key) || {
            lastAccess: new Date(),
            accessCount: 0,
            migrated: false,
        };
        current.migrated = true;
        UACLMigrationHelper.migrationTracking.set(key, current);
    }
    static getMigrationReport() {
        const details = Array.from(UACLMigrationHelper.migrationTracking.entries()).map(([key, data]) => {
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
    static async autoMigrate(clientType, id, config) {
        try {
            const { uacl } = await import('./instance.ts');
            await uacl.initialize();
            switch (clientType) {
                case ClientTypes.HTTP:
                    return await uacl.createHTTPClient(id, config?.baseURL, config);
                case ClientTypes.WEBSOCKET:
                    return await uacl.createWebSocketClient(id, config?.url, config);
                case ClientTypes.KNOWLEDGE:
                    return await uacl.createKnowledgeClient(id, config?.factRepoPath, config?.anthropicApiKey, config);
                case ClientTypes.MCP:
                    return await uacl.createMCPClient(id, config?.servers, config);
                default:
                    return null;
            }
        }
        catch (error) {
            logger.warn(`⚠️ UACL Auto-migration failed for ${clientType} client ${id}:`, error);
            return null;
        }
    }
}
export const apiClient = createCompatibleAPIClient();
export { createAPIClient as legacyCreateAPIClient };
export { WebSocketClient as LegacyWebSocketClient };
export { FACTIntegration as LegacyFACTIntegration };
export { ExternalMCPClient as LegacyExternalMCPClient };
export const createEnhancedAPIClient = async (id, config = {}) => {
    UACLMigrationHelper.trackLegacyUsage('HTTP', `createEnhancedAPIClient:${id}`);
    try {
        const result = await createManagedAPIClient(id, config);
        UACLMigrationHelper.markAsMigrated('HTTP', `createEnhancedAPIClient:${id}`);
        return result;
    }
    catch (error) {
        logger.warn(`⚠️ Failed to create UACL-managed HTTP client, falling back to legacy:`, error);
        return {
            client: createCompatibleAPIClient(config),
            instance: null,
        };
    }
};
export const createEnhancedWebSocketClient = async (id, url, options = {}) => {
    UACLMigrationHelper.trackLegacyUsage('WebSocket', `createEnhancedWebSocketClient:${id}`);
    try {
        const result = await createManagedWebSocketClient(id, url, options);
        UACLMigrationHelper.markAsMigrated('WebSocket', `createEnhancedWebSocketClient:${id}`);
        return result;
    }
    catch (error) {
        logger.warn(`⚠️ Failed to create UACL-managed WebSocket client, falling back to legacy:`, error);
        return {
            client: createCompatibleWebSocketClient(url, options),
            instance: null,
        };
    }
};
export const createEnhancedKnowledgeClient = async (id, config) => {
    UACLMigrationHelper.trackLegacyUsage('Knowledge', `createEnhancedKnowledgeClient:${id}`);
    try {
        const result = await createManagedKnowledgeClient(id, config);
        UACLMigrationHelper.markAsMigrated('Knowledge', `createEnhancedKnowledgeClient:${id}`);
        return result;
    }
    catch (error) {
        logger.warn(`⚠️ Failed to create UACL-managed Knowledge client, falling back to legacy:`, error);
        return {
            client: createCompatibleKnowledgeClient(config),
            instance: null,
        };
    }
};
export const createEnhancedMCPClient = async (id, servers) => {
    UACLMigrationHelper.trackLegacyUsage('MCP', `createEnhancedMCPClient:${id}`);
    try {
        const result = await createManagedMCPClient(id, servers);
        UACLMigrationHelper.markAsMigrated('MCP', `createEnhancedMCPClient:${id}`);
        return result;
    }
    catch (error) {
        logger.warn(`⚠️ Failed to create UACL-managed MCP client, falling back to legacy:`, error);
        return {
            client: createCompatibleMCPClient(),
            instance: null,
        };
    }
};
export const getMigrationStatus = () => {
    return UACLMigrationHelper.getMigrationReport();
};
export const performBatchMigration = async () => {
    const report = UACLMigrationHelper.getMigrationReport();
    const pending = report.details.filter((d) => !d.migrated);
    const results = {
        attempted: pending.length,
        successful: 0,
        failed: 0,
        errors: [],
    };
    for (const client of pending) {
        try {
            UACLMigrationHelper.markAsMigrated(client.clientType, client.location);
            results.successful++;
        }
        catch (error) {
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
    createCompatibleAPIClient,
    createCompatibleWebSocketClient,
    createCompatibleKnowledgeClient,
    createCompatibleMCPClient,
    createManagedAPIClient,
    createManagedWebSocketClient,
    createManagedKnowledgeClient,
    createManagedMCPClient,
    createEnhancedAPIClient,
    createEnhancedWebSocketClient,
    createEnhancedKnowledgeClient,
    createEnhancedMCPClient,
    UACLMigrationHelper,
    getMigrationStatus,
    performBatchMigration,
};
//# sourceMappingURL=compatibility.js.map