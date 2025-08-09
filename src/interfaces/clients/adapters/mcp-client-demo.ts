import { getLogger } from "../../../config/logging-config";
const logger = getLogger("interfaces-clients-adapters-mcp-client-demo");
/**
 * MCP Client Adapter Demonstration
 *
 * Shows how to use the UACL MCP adapter to convert existing MCP clients
 * and provides examples of both stdio and HTTP protocol usage
 */

import { createMCPConfigFromLegacy, MCPClientAdapter, MCPClientFactory } from './mcp-client-adapter.js';

/**
 * Example: Convert existing external MCP client setup to UACL
 */
export async function demonstrateMCPClientConversion() {
  // 1. Create UACL MCP clients from existing configurations
  const factory = new MCPClientFactory();

  // Example: Context7 HTTP MCP server
  const context7Config: MCPClientConfig = createMCPConfigFromLegacy('context7', {
    url: 'https://mcp.context7.com/mcp',
    type: 'http',
    timeout: 30000,
    capabilities: ['research', 'analysis', 'documentation'],
  });

  // Example: Local stdio MCP server
  const localStdioConfig: MCPClientConfig = {
    name: 'local-mcp',
    baseURL: 'stdio://local-mcp',
    protocol: 'stdio',
    command: ['node', './local-mcp-server.js'],
    timeout: 10000,
    authentication: { type: 'none' },
    tools: {
      timeout: 15000,
      retries: 2,
      discovery: true,
    },
    server: {
      name: 'local-mcp',
      version: '1.0.0',
      capabilities: ['file-operations', 'git-integration'],
    },
    monitoring: {
      enabled: true,
      metricsInterval: 30000,
      trackLatency: true,
      trackThroughput: true,
      trackErrors: true,
    },
  };

  try {
    const httpClient = await factory.create(context7Config);
    const stdioClient = await factory.create(localStdioConfig);

    // Connect clients
    await httpClient.connect();
    await stdioClient.connect();
    const httpHealth = await httpClient.healthCheck();
    const stdioHealth = await stdioClient.healthCheck();
    const httpMetrics = await httpClient.getMetrics();
    const stdioMetrics = await stdioClient.getMetrics();

    // Get available tools (GET request)
    const httpTools = await httpClient.get('/tools');
    const stdioTools = await stdioClient.get('/tools');

    // Execute tools (POST request - mapped to tool execution)
    if (Array.isArray(httpTools.data) && httpTools.data.length > 0) {
      const toolName = httpTools.data[0]?.name;

      const result = await httpClient.post(toolName, {
        query: 'test research query',
      });
    }

    if (Array.isArray(stdioTools.data) && stdioTools.data.length > 0) {
      const toolName = stdioTools.data[0]?.name;

      const result = await stdioClient.post(toolName, {
        path: './test-file.txt',
      });
    }

    // Bulk health check
    const allHealth = await factory.healthCheckAll();

    for (const [name, health] of allHealth) {
    }

    // Bulk metrics
    const allMetrics = await factory.getMetricsAll();

    for (const [name, metrics] of allMetrics) {
    }
    httpClient.updateConfig({ timeout: 45000 });
    httpClient.on('connect', (data) => {});

    stdioClient.on('disconnect', (data) => {});
    await httpClient.disconnect();
    await stdioClient.disconnect();
    await factory.shutdown();
  } catch (error) {
    logger.error('❌ Error during MCP client demonstration:', error);
    throw error;
  }
}

/**
 * Example: Migrate from legacy ExternalMCPClient to UACL
 */
export async function migrateLegacyMCPClient() {
  // Legacy configuration (from existing external-mcp-client.ts)
  const legacyConfigs = {
    context7: {
      url: 'https://mcp.context7.com/mcp',
      type: 'http' as const,
      description: 'Research and analysis tools',
      timeout: 30000,
      retryAttempts: 3,
      capabilities: ['research', 'analysis', 'documentation'],
    },
    deepwiki: {
      url: 'https://mcp.deepwiki.com/sse',
      type: 'sse' as const,
      description: 'Knowledge base and research tools',
      timeout: 30000,
      retryAttempts: 3,
      capabilities: ['knowledge', 'documentation', 'research'],
    },
    localMcp: {
      command: ['npx', 'claude-zen', 'mcp', 'start'],
      timeout: 15000,
      capabilities: ['coordination', 'swarm', 'memory'],
    },
  };

  const factory = new MCPClientFactory();
  const clients: Array<{ name: string; client: any }> = [];

  try {
    // Convert each legacy config to UACL
    for (const [name, legacyConfig] of Object.entries(legacyConfigs)) {
      const uaclConfig = createMCPConfigFromLegacy(name, legacyConfig);

      // Create client
      const client = await factory.create(uaclConfig);
      clients.push({ name, client });
    }

    for (const { name, client } of clients) {
      try {
        await client.connect();
        const health = await client.healthCheck();
      } catch (error) {}
    }
    for (const { client } of clients) {
      await client.disconnect();
    }
    await factory.shutdown();
  } catch (error) {
    logger.error('❌ Migration error:', error);
    throw error;
  }
}

/**
 * Example: Usage patterns for different MCP protocols
 */
export async function demonstrateProtocolPatterns() {
  const factory = new MCPClientFactory();

  // Pattern 1: Stdio MCP for local coordination
  const stdioConfig: MCPClientConfig = {
    name: 'local-coordinator',
    baseURL: 'stdio://coordinator',
    protocol: 'stdio',
    command: ['node', 'coordinator.js'],
    timeout: 10000,
    authentication: { type: 'none' },
    tools: { timeout: 15000, retries: 2, discovery: true },
    server: { name: 'coordinator', version: '1.0.0' },
    stdio: {
      encoding: 'utf8',
      killSignal: 'SIGTERM',
      killTimeout: 5000,
    },
  };

  // Pattern 2: HTTP MCP for remote services
  const httpConfig: MCPClientConfig = {
    name: 'remote-service',
    baseURL: 'https://api.example.com',
    protocol: 'http',
    url: 'https://api.example.com/mcp',
    timeout: 30000,
    authentication: {
      type: 'bearer',
      credentials: 'your-api-token',
    },
    tools: { timeout: 30000, retries: 3, discovery: true },
    server: { name: 'remote-service', version: '2.0.0' },
  };

  try {
    const stdioClient = await factory.create(stdioConfig);
    const httpClient = await factory.create(httpConfig);
  } catch (error) {
    logger.error('❌ Protocol pattern error:', error);
  } finally {
    await factory.shutdown();
  }
}

// Export for testing
export { MCPClientAdapter, MCPClientFactory, createMCPConfigFromLegacy };
