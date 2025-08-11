/**
 * @file Interface implementation: mcp-integration-example.
 */
/**
 * MCP Integration Manager.
 * Bridges legacy MCP clients with new UACL architecture.
 *
 * @example
 */
export declare class MCPIntegrationManager {
    private legacyClient;
    private uaclFactory;
    private uaclClients;
    private eventEmitter;
    constructor();
    /**
     * Initialize both legacy and UACL MCP systems.
     */
    initialize(): Promise<void>;
    /**
     * Migrate legacy MCP configurations to UACL.
     */
    private migrateLegacyToUACL;
    /**
     * Create UACL config from legacy server status.
     *
     * @param serverName
     * @param serverStatus
     */
    private createUACLConfigFromLegacyServer;
    /**
     * Setup unified interface that works with both systems.
     */
    private setupUnifiedInterface;
    /**
     * Setup event handlers for monitoring.
     */
    private setupEventHandlers;
    /**
     * Execute tool with automatic failover between UACL and Legacy.
     *
     * @param serverName
     * @param toolName
     * @param parameters
     */
    executeToolWithFailover(serverName: string, toolName: string, parameters: any): Promise<any>;
    /**
     * Get comprehensive system status.
     */
    getSystemStatus(): Promise<{
        legacy: any;
        uacl: any;
        comparison: any;
    }>;
    /**
     * Performance comparison between Legacy and UACL.
     *
     * @param serverName
     * @param toolName
     * @param parameters
     * @param iterations
     */
    performanceComparison(serverName: string, toolName: string, parameters: any, iterations?: number): Promise<{
        legacy: {
            averageTime: number;
            successRate: number;
        };
        uacl: {
            averageTime: number;
            successRate: number;
        };
        winner: 'legacy' | 'uacl' | 'tie';
    }>;
    /**
     * Gradual migration strategy.
     *
     * @param migrationConfig
     * @param migrationConfig.servers
     * @param migrationConfig.batchSize
     * @param migrationConfig.delayBetweenBatches
     * @param migrationConfig.rollbackOnFailure
     */
    startGradualMigration(migrationConfig: {
        servers: string[];
        batchSize: number;
        delayBetweenBatches: number;
        rollbackOnFailure: boolean;
    }): Promise<void>;
    /**
     * Cleanup and shutdown.
     */
    shutdown(): Promise<void>;
    on(event: string, handler: (...args: any[]) => void): void;
    off(event: string, handler: (...args: any[]) => void): void;
}
/**
 * Example usage and demonstration.
 *
 * @example
 */
export declare function demonstrateMCPIntegration(): Promise<void>;
//# sourceMappingURL=mcp-integration-example.d.ts.map