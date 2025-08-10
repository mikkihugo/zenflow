/**
 * @file Interface implementation: mcp-integration-example.
 */

import { getLogger } from '../../../config/logging-config';

const logger = getLogger('interfaces-clients-adapters-mcp-integration-example');

/**
 * MCP Integration Example.
 *
 * Shows how to integrate the UACL MCP adapter with existing MCP infrastructure
 * and provides a migration path from the legacy external MCP client.
 */

import { EventEmitter } from 'node:events';
import type { IClient } from '../core/interfaces.js';
// Note: ExternalMCPClient import commented out as it doesn't exist
// import { ExternalMCPClient } from '../mcp/external-mcp-client.js';
import {
  createMCPConfigFromLegacy,
  type MCPClientConfig,
  MCPClientFactory,
} from './mcp-client-adapter.js';

// Mock ExternalMCPClient for demonstration purposes
class ExternalMCPClient {
  async connectAll(): Promise<any> {
    return {};
  }

  getServerStatus(): Record<string, any> {
    return {};
  }

  async executeTool(serverName: string, toolName: string, parameters: any): Promise<any> {
    return { success: true, result: null };
  }

  getAvailableTools(): Record<string, string[]> {
    return {};
  }

  async disconnectAll(): Promise<void> {
    // Mock implementation
  }
}

/**
 * MCP Integration Manager.
 * Bridges legacy MCP clients with new UACL architecture.
 *
 * @example
 */
export class MCPIntegrationManager {
  private legacyClient: ExternalMCPClient;
  private uaclFactory: MCPClientFactory;
  private uaclClients: Map<string, IClient> = new Map();
  private eventEmitter: EventEmitter = new EventEmitter();

  constructor() {
    this.legacyClient = new ExternalMCPClient();
    this.uaclFactory = new MCPClientFactory();
    this.setupEventHandlers();
  }

  /**
   * Initialize both legacy and UACL MCP systems.
   */
  async initialize(): Promise<void> {
    try {
      const _legacyResults = await this.legacyClient.connectAll();
      await this.migrateLegacyToUACL();
      this.setupUnifiedInterface();
      this.eventEmitter.emit('initialized');
    } catch (error) {
      logger.error('❌ Failed to initialize MCP Integration Manager:', error);
      throw error;
    }
  }

  /**
   * Migrate legacy MCP configurations to UACL.
   */
  private async migrateLegacyToUACL(): Promise<void> {
    const legacyServers = this.legacyClient.getServerStatus();

    for (const [serverName, serverStatus] of Object.entries(legacyServers)) {
      try {
        // Create UACL configuration from legacy server
        const uaclConfig = this.createUACLConfigFromLegacyServer(serverName, serverStatus);

        // Create UACL client
        const uaclClient = await this.uaclFactory.create(uaclConfig);
        this.uaclClients.set(serverName, uaclClient);
      } catch (error) {
        logger.warn(`⚠️  Failed to migrate ${serverName}:`, error);
      }
    }
  }

  /**
   * Create UACL config from legacy server status.
   *
   * @param serverName
   * @param serverStatus
   */
  private createUACLConfigFromLegacyServer(serverName: string, serverStatus: any): MCPClientConfig {
    // Determine protocol based on server type
    const _protocol = serverStatus.type === 'http' ? 'http' : 'stdio';

    const baseConfig = {
      url: serverStatus.url,
      type: serverStatus.type,
      timeout: 30000,
      capabilities: serverStatus.capabilities || [],
    };

    // Use helper to convert legacy format
    const uaclConfig = createMCPConfigFromLegacy(serverName, baseConfig);

    // Enhance with additional UACL features
    uaclConfig.monitoring = {
      enabled: true,
      metricsInterval: 60000,
      trackLatency: true,
      trackThroughput: true,
      trackErrors: true,
    };

    uaclConfig.tools = {
      timeout: 30000,
      retries: 3,
      discovery: true,
    };

    return uaclConfig;
  }

  /**
   * Setup unified interface that works with both systems.
   */
  private setupUnifiedInterface(): void {
    // Create unified tool execution method
    this.eventEmitter.on('execute-tool', async (params) => {
      const { serverName, toolName, parameters, useUACL } = params;

      try {
        let result;

        if (useUACL && this.uaclClients.has(serverName)) {
          // Use UACL client
          const client = this.uaclClients.get(serverName)!;
          result = await client.post(toolName, parameters);

          this.eventEmitter.emit('tool-executed', {
            serverName,
            toolName,
            success: true,
            source: 'UACL',
            result: result?.data,
            metrics: {
              responseTime: result?.metadata?.responseTime,
              status: result?.status,
            },
          });
        } else {
          // Use legacy client
          result = await this.legacyClient.executeTool(serverName, toolName, parameters);

          this.eventEmitter.emit('tool-executed', {
            serverName,
            toolName,
            success: result?.success,
            source: 'Legacy',
            result: result?.result,
            error: result?.error,
          });
        }
      } catch (error) {
        this.eventEmitter.emit('tool-error', {
          serverName,
          toolName,
          error: (error as Error).message,
          source: useUACL ? 'UACL' : 'Legacy',
        });
      }
    });
  }

  /**
   * Setup event handlers for monitoring.
   */
  private setupEventHandlers(): void {
    this.eventEmitter.on('tool-executed', (data) => {
      if (data?.metrics) {
      }
    });

    this.eventEmitter.on('tool-error', (data) => {
      logger.error(
        `❌ Tool error: ${data?.toolName} on ${data?.serverName} (${data?.source}): ${data?.error}`
      );
    });
  }

  /**
   * Execute tool with automatic failover between UACL and Legacy.
   *
   * @param serverName
   * @param toolName
   * @param parameters
   */
  async executeToolWithFailover(
    serverName: string,
    toolName: string,
    parameters: any
  ): Promise<any> {
    // Try UACL first (preferred)
    if (this.uaclClients.has(serverName)) {
      try {
        const client = this.uaclClients.get(serverName)!;
        const result = await client.post(toolName, parameters);
        return {
          success: true,
          source: 'UACL',
          data: result?.data,
          metadata: result?.metadata,
        };
      } catch (_error) {
        logger.warn(`⚠️  UACL execution failed for ${toolName}, falling back to legacy...`);
      }
    }

    // Fallback to legacy
    try {
      const result = await this.legacyClient.executeTool(serverName, toolName, parameters);
      return {
        success: result?.success,
        source: 'Legacy',
        data: result?.result,
        error: result?.error,
      };
    } catch (error) {
      throw new Error(`Both UACL and Legacy execution failed: ${(error as Error).message}`);
    }
  }

  /**
   * Get comprehensive system status.
   */
  async getSystemStatus(): Promise<{
    legacy: any;
    uacl: any;
    comparison: any;
  }> {
    // Legacy status
    const legacyStatus = this.legacyClient.getServerStatus();
    const legacyTools = this.legacyClient.getAvailableTools();

    // UACL status
    const uaclHealth = await this.uaclFactory.healthCheckAll();
    const uaclMetrics = await this.uaclFactory.getMetricsAll();

    // Comparison
    const comparison = {
      totalServers: {
        legacy: Object.keys(legacyStatus).length,
        uacl: this.uaclClients.size,
      },
      healthyServers: {
        legacy: Object.values(legacyStatus).filter((s: any) => s.connected).length,
        uacl: Array.from(uaclHealth.values()).filter((h) => h.status === 'healthy').length,
      },
      totalTools: {
        legacy: Object.values(legacyTools).reduce(
          (sum: number, tools: string[]) => sum + tools.length,
          0
        ),
        uacl: this.uaclClients.size * 2, // Estimate based on typical tool count
      },
    };

    return {
      legacy: { status: legacyStatus, tools: legacyTools },
      uacl: { health: Object.fromEntries(uaclHealth), metrics: Object.fromEntries(uaclMetrics) },
      comparison,
    };
  }

  /**
   * Performance comparison between Legacy and UACL.
   *
   * @param serverName
   * @param toolName
   * @param parameters
   * @param iterations
   */
  async performanceComparison(
    serverName: string,
    toolName: string,
    parameters: any,
    iterations = 5
  ): Promise<{
    legacy: { averageTime: number; successRate: number };
    uacl: { averageTime: number; successRate: number };
    winner: 'legacy' | 'uacl' | 'tie';
  }> {
    const legacyTimes: number[] = [];
    const uaclTimes: number[] = [];
    let legacySuccesses = 0;
    let uaclSuccesses = 0;
    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      try {
        await this.legacyClient.executeTool(serverName, toolName, parameters);
        legacyTimes.push(Date.now() - startTime);
        legacySuccesses++;
      } catch (_error) {
        legacyTimes.push(Date.now() - startTime);
      }
    }
    const uaclClient = this.uaclClients.get(serverName);
    if (uaclClient) {
      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        try {
          await uaclClient.post(toolName, parameters);
          uaclTimes.push(Date.now() - startTime);
          uaclSuccesses++;
        } catch (_error) {
          uaclTimes.push(Date.now() - startTime);
        }
      }
    }

    // Calculate results
    const legacyAvg = legacyTimes.reduce((a, b) => a + b, 0) / legacyTimes.length;
    const uaclAvg = uaclTimes.reduce((a, b) => a + b, 0) / uaclTimes.length;
    const legacySuccessRate = legacySuccesses / iterations;
    const uaclSuccessRate = uaclSuccesses / iterations;

    let winner: 'legacy' | 'uacl' | 'tie' = 'tie';
    if (uaclAvg < legacyAvg && uaclSuccessRate >= legacySuccessRate) {
      winner = 'uacl';
    } else if (legacyAvg < uaclAvg && legacySuccessRate >= uaclSuccessRate) {
      winner = 'legacy';
    }

    return {
      legacy: { averageTime: legacyAvg, successRate: legacySuccessRate },
      uacl: { averageTime: uaclAvg, successRate: uaclSuccessRate },
      winner,
    };
  }

  /**
   * Gradual migration strategy.
   *
   * @param migrationConfig
   * @param migrationConfig.servers
   * @param migrationConfig.batchSize
   * @param migrationConfig.delayBetweenBatches
   * @param migrationConfig.rollbackOnFailure
   */
  async startGradualMigration(migrationConfig: {
    servers: string[];
    batchSize: number;
    delayBetweenBatches: number;
    rollbackOnFailure: boolean;
  }): Promise<void> {
    const { servers, batchSize, delayBetweenBatches, rollbackOnFailure } = migrationConfig;
    const batches: string[][] = [];

    // Create batches
    for (let i = 0; i < servers.length; i += batchSize) {
      batches.push(servers.slice(i, i + batchSize));
    }

    const migratedServers: string[] = [];

    try {
      for (const [batchIndex, batch] of batches.entries()) {
        for (const serverName of batch) {
          try {
            // Create UACL client
            const legacyStatus = this.legacyClient.getServerStatus()[serverName];
            if (!legacyStatus) {
              logger.warn(`⚠️  Server ${serverName} not found in legacy system`);
              continue;
            }

            const uaclConfig = this.createUACLConfigFromLegacyServer(serverName, legacyStatus);
            const uaclClient = await this.uaclFactory.create(uaclConfig);

            // Test the new client
            await uaclClient.connect();
            const health = await uaclClient.healthCheck();

            if (health.status === 'healthy') {
              this.uaclClients.set(serverName, uaclClient);
              migratedServers.push(serverName);
            } else {
              throw new Error(`Health check failed: ${health.status}`);
            }
          } catch (error) {
            logger.error(`❌ Failed to migrate ${serverName}:`, error);

            if (rollbackOnFailure) {
              for (const rolledBackServer of migratedServers.slice(-batch.length)) {
                await this.uaclFactory.remove(rolledBackServer);
                this.uaclClients.delete(rolledBackServer);
              }
              throw error;
            }
          }
        }

        // Delay between batches
        if (batchIndex < batches.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, delayBetweenBatches));
        }
      }
    } catch (error) {
      logger.error('💥 Migration failed:', error);
      throw error;
    }
  }

  /**
   * Cleanup and shutdown.
   */
  async shutdown(): Promise<void> {
    try {
      // Shutdown UACL factory and clients
      await this.uaclFactory.shutdown();
      this.uaclClients.clear();

      // Shutdown legacy client
      await this.legacyClient.disconnectAll();

      // Clean up event emitter
      this.eventEmitter.removeAllListeners();
    } catch (error) {
      logger.error('❌ Error during shutdown:', error);
      throw error;
    }
  }

  // Event interface
  on(event: string, handler: (...args: any[]) => void): void {
    this.eventEmitter.on(event, handler);
  }

  off(event: string, handler: (...args: any[]) => void): void {
    this.eventEmitter.off(event, handler);
  }
}

/**
 * Example usage and demonstration.
 *
 * @example
 */
export async function demonstrateMCPIntegration(): Promise<void> {
  const manager = new MCPIntegrationManager();

  try {
    // Initialize integration manager
    await manager.initialize();

    // Get system status
    const _status = await manager.getSystemStatus();

    // Execute tool with failover
    const _result = await manager.executeToolWithFailover('context7', 'research_analysis', {
      query: 'UACL architecture benefits',
    });

    // Performance comparison
    const _comparison = await manager.performanceComparison(
      'context7',
      'research_analysis',
      { query: 'performance test' },
      3
    );

    // Gradual migration example
    await manager.startGradualMigration({
      servers: ['context7', 'deepwiki'],
      batchSize: 1,
      delayBetweenBatches: 1000,
      rollbackOnFailure: false,
    });
  } catch (error) {
    logger.error('💥 Integration demonstration failed:', error);
  } finally {
    await manager.shutdown();
  }
}
