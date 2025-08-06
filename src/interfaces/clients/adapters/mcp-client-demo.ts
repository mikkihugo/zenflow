/**
 * MCP Client Adapter Demonstration
 *
 * Shows how to use the UACL MCP adapter to convert existing MCP clients
 * and provides examples of both stdio and HTTP protocol usage
 */

import {
  createMCPConfigFromLegacy,
  MCPClientAdapter,
  type MCPClientConfig,
  MCPClientFactory,
} from './mcp-client-adapter.js';

/**
 * Example: Convert existing external MCP client setup to UACL
 */
export async function demonstrateMCPClientConversion() {
  console.log('🔄 MCP Client UACL Conversion Demo\n');

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
    // Create clients using factory
    console.log('📡 Creating HTTP MCP client (Context7)...');
    const httpClient = await factory.create(context7Config);

    console.log('🔌 Creating stdio MCP client (Local)...');
    const stdioClient = await factory.create(localStdioConfig);

    // Test UACL interface compliance
    console.log('\n✅ Testing UACL Interface Compliance:');

    // 1. Connection management
    console.log('  🔗 Connection Management:');
    console.log(`    HTTP Client Connected: ${httpClient.isConnected()}`);
    console.log(`    Stdio Client Connected: ${stdioClient.isConnected()}`);

    // Connect clients
    await httpClient.connect();
    await stdioClient.connect();

    console.log(`    HTTP Client Connected: ${httpClient.isConnected()}`);
    console.log(`    Stdio Client Connected: ${stdioClient.isConnected()}`);

    // 2. Health checks
    console.log('\n  🏥 Health Monitoring:');
    const httpHealth = await httpClient.healthCheck();
    const stdioHealth = await stdioClient.healthCheck();

    console.log(`    HTTP Health: ${httpHealth.status} (${httpHealth.responseTime}ms)`);
    console.log(`    Stdio Health: ${stdioHealth.status} (${stdioHealth.responseTime}ms)`);

    // 3. Performance metrics
    console.log('\n  📊 Performance Metrics:');
    const httpMetrics = await httpClient.getMetrics();
    const stdioMetrics = await stdioClient.getMetrics();

    console.log(
      `    HTTP Requests: ${httpMetrics.requestCount} (${httpMetrics.successCount} success)`
    );
    console.log(
      `    Stdio Requests: ${stdioMetrics.requestCount} (${stdioMetrics.successCount} success)`
    );

    // 4. Tool execution via UACL interface
    console.log('\n  🛠️  Tool Execution:');

    // Get available tools (GET request)
    const httpTools = await httpClient.get('/tools');
    const stdioTools = await stdioClient.get('/tools');

    console.log(
      `    HTTP Tools Available: ${Array.isArray(httpTools.data) ? httpTools.data.length : 0}`
    );
    console.log(
      `    Stdio Tools Available: ${Array.isArray(stdioTools.data) ? stdioTools.data.length : 0}`
    );

    // Execute tools (POST request - mapped to tool execution)
    if (Array.isArray(httpTools.data) && httpTools.data.length > 0) {
      const toolName = httpTools.data[0].name;
      console.log(`    Executing HTTP tool: ${toolName}...`);

      const result = await httpClient.post(toolName, {
        query: 'test research query',
      });

      console.log(`    HTTP Tool Result: ${result.status} ${result.statusText}`);
      console.log(`    Response Time: ${result.metadata?.responseTime}ms`);
    }

    if (Array.isArray(stdioTools.data) && stdioTools.data.length > 0) {
      const toolName = stdioTools.data[0].name;
      console.log(`    Executing stdio tool: ${toolName}...`);

      const result = await stdioClient.post(toolName, {
        path: './test-file.txt',
      });

      console.log(`    Stdio Tool Result: ${result.status} ${result.statusText}`);
      console.log(`    Response Time: ${result.metadata?.responseTime}ms`);
    }

    // 5. Factory operations
    console.log('\n  🏭 Factory Operations:');
    console.log(`    Total Clients: ${factory.getActiveCount()}`);
    console.log(
      `    Client Names: ${factory
        .list()
        .map((c) => c.name)
        .join(', ')}`
    );

    // Bulk health check
    const allHealth = await factory.healthCheckAll();
    console.log(`    Bulk Health Check: ${allHealth.size} clients checked`);

    for (const [name, health] of allHealth) {
      console.log(`      ${name}: ${health.status}`);
    }

    // Bulk metrics
    const allMetrics = await factory.getMetricsAll();
    console.log(`    Bulk Metrics: ${allMetrics.size} clients reported`);

    for (const [name, metrics] of allMetrics) {
      console.log(
        `      ${name}: ${metrics.requestCount} requests, ${metrics.averageLatency.toFixed(2)}ms avg`
      );
    }

    // 6. Configuration updates
    console.log('\n  ⚙️  Configuration Management:');
    httpClient.updateConfig({ timeout: 45000 });
    console.log(`    Updated HTTP timeout to: ${httpClient.config.timeout}ms`);

    // 7. Event handling
    console.log('\n  📻 Event Handling:');
    httpClient.on('connect', (data) => {
      console.log(`    HTTP Client connected: ${JSON.stringify(data)}`);
    });

    stdioClient.on('disconnect', (data) => {
      console.log(`    Stdio Client disconnected: ${JSON.stringify(data)}`);
    });

    // Clean up
    console.log('\n🧹 Cleanup:');
    await httpClient.disconnect();
    await stdioClient.disconnect();
    await factory.shutdown();

    console.log('✅ MCP Client UACL conversion demonstration completed successfully!');
  } catch (error) {
    console.error('❌ Error during MCP client demonstration:', error);
    throw error;
  }
}

/**
 * Example: Migrate from legacy ExternalMCPClient to UACL
 */
export async function migrateLegacyMCPClient() {
  console.log('\n🔄 Legacy MCP Client Migration Example\n');

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
      console.log(`🔄 Converting ${name}...`);

      const uaclConfig = createMCPConfigFromLegacy(name, legacyConfig);

      // Create client
      const client = await factory.create(uaclConfig);
      clients.push({ name, client });

      console.log(`✅ ${name} converted and created`);
      console.log(`   Protocol: ${uaclConfig.protocol}`);
      console.log(`   Base URL: ${uaclConfig.baseURL}`);
      console.log(`   Capabilities: ${uaclConfig.server?.capabilities?.join(', ')}`);
    }

    // Test unified interface
    console.log('\n🔗 Testing unified interface...');

    for (const { name, client } of clients) {
      try {
        await client.connect();
        const health = await client.healthCheck();
        console.log(`${name}: ${health.status}`);
      } catch (error) {
        console.log(`${name}: connection failed (${(error as Error).message})`);
      }
    }

    // Cleanup
    console.log('\n🧹 Cleanup...');
    for (const { client } of clients) {
      await client.disconnect();
    }
    await factory.shutdown();

    console.log('✅ Legacy MCP client migration completed!');
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  }
}

/**
 * Example: Usage patterns for different MCP protocols
 */
export async function demonstrateProtocolPatterns() {
  console.log('\n🌐 MCP Protocol Pattern Examples\n');

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
    console.log('📱 Creating protocol-specific clients...');

    const stdioClient = await factory.create(stdioConfig);
    const httpClient = await factory.create(httpConfig);

    console.log('🔌 Testing stdio pattern (local coordination)...');
    // Stdio pattern: Fast local communication
    console.log('  - Fast local process communication');
    console.log('  - Binary message passing');
    console.log('  - Process lifecycle management');
    console.log('  - Direct tool execution');

    console.log('🌐 Testing HTTP pattern (remote services)...');
    // HTTP pattern: Reliable remote communication
    console.log('  - RESTful API integration');
    console.log('  - Authentication handling');
    console.log('  - Network error recovery');
    console.log('  - Load balancing support');

    // Show unified interface despite different protocols
    console.log('\n🤝 Unified Interface Benefits:');
    console.log('  - Same methods for all protocols');
    console.log('  - Consistent error handling');
    console.log('  - Unified monitoring and metrics');
    console.log('  - Protocol-agnostic tool execution');

    console.log('\n✅ Protocol pattern demonstration completed!');
  } catch (error) {
    console.error('❌ Protocol pattern error:', error);
  } finally {
    await factory.shutdown();
  }
}

// Export for testing
export { MCPClientAdapter, MCPClientFactory, createMCPConfigFromLegacy };
