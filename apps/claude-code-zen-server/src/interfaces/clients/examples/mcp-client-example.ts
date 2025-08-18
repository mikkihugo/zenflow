/**
 * MCP Client Usage Examples
 * 
 * Examples showing how to use the MCP client adapter to connect to external
 * MCP servers like Context7, Deepwiki, Semgrep, and GitMCP.
 */

import type { McpClientConfig } from '../adapters/mcp-client-adapter';
import {
  McpClientAdapter,
  createContext7Client,
  createDeepwikiClient,
  createSemgrepClient,
  createGitMcpClient,
} from '../adapters/mcp-client-adapter';
import { createMcpClient } from '../factories';
import { ProtocolTypes } from '../types';

/**
 * Example 1: Basic MCP client usage with Context7
 */
export async function basicMcpExample() {
  console.log('\n🔧 Example 1: Basic MCP Client Usage with Context7');

  try {
    // Create Context7 client
    const client = await createContext7Client();
    
    // Connect to Context7
    await client.connect();
    console.log('✅ Connected to Context7');

    // List available tools
    const tools = await client.listTools();
    console.log(`📋 Available tools: ${tools.length}`);
    tools.forEach(tool => {
      console.log(`  - ${tool.name}: ${tool.description}`);
    });

    // List available resources
    const resources = await client.listResources();
    console.log(`📚 Available resources: ${resources.length}`);
    resources.slice(0, 3).forEach(resource => {
      console.log(`  - ${resource.uri}: ${resource.name || 'Unnamed'}`);
    });

    // Health check
    const isHealthy = await client.health();
    console.log(`🏥 Health status: ${isHealthy ? 'Healthy' : 'Unhealthy'}`);

    // Disconnect
    await client.disconnect();
    console.log('✅ Disconnected from Context7');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

/**
 * Example 2: Using the factory pattern
 */
export async function factoryPatternExample() {
  console.log('\n🏭 Example 2: Factory Pattern Usage');

  try {
    // Create multiple MCP clients using factory
    const context7 = await createMcpClient('https://mcp.context7.com/mcp');
    const deepwiki = await createMcpClient('https://mcp.deepwiki.com/sse');
    
    console.log('✅ Created multiple MCP clients using factory pattern');

    // Connect to both
    await Promise.all([
      context7.connect().catch(e => console.warn('Context7 connection failed:', e.message)),
      deepwiki.connect().catch(e => console.warn('Deepwiki connection failed:', e.message))
    ]);

    // Check which ones are connected
    const context7Connected = context7.isConnected();
    const deepwikiConnected = deepwiki.isConnected();
    
    console.log(`🔗 Context7 connected: ${context7Connected}`);
    console.log(`🔗 Deepwiki connected: ${deepwikiConnected}`);

    // Cleanup
    await Promise.allSettled([
      context7.disconnect(),
      deepwiki.disconnect()
    ]);

  } catch (error) {
    console.error('❌ Factory pattern error:', error.message);
  }
}

/**
 * Example 3: Tool execution
 */
export async function toolExecutionExample() {
  console.log('\n🔨 Example 3: Tool Execution');

  try {
    // Create and connect to a research-oriented MCP server
    const client = await createContext7Client();
    await client.connect();
    
    // Try to call a research tool (example)
    try {
      const result = await client.callTool('search', {
        query: 'TypeScript best practices',
        limit: 5
      });
      console.log('🔍 Research results:', JSON.stringify(result, null, 2));
    } catch (toolError) {
      console.log('ℹ️ Tool call failed (expected for demo):', toolError.message);
    }

    await client.disconnect();

  } catch (error) {
    console.log('ℹ️ Tool execution demo (connection may fail):', error.message);
  }
}

/**
 * Example 4: Resource access
 */
export async function resourceAccessExample() {
  console.log('\n📖 Example 4: Resource Access');

  try {
    // Create Deepwiki client for documentation resources
    const client = await createDeepwikiClient();
    await client.connect();

    // Try to read a documentation resource
    try {
      const resource = await client.readResource('typescript/handbook/basic-types');
      console.log('📄 Resource content preview:', 
        typeof resource === 'string' ? resource.substring(0, 200) + '...' : resource);
    } catch (resourceError) {
      console.log('ℹ️ Resource access failed (expected for demo):', resourceError.message);
    }

    await client.disconnect();

  } catch (error) {
    console.log('ℹ️ Resource access demo (connection may fail):', error.message);
  }
}

/**
 * Example 5: Error handling and reconnection
 */
export async function errorHandlingExample() {
  console.log('\n🛡️ Example 5: Error Handling and Reconnection');

  try {
    // Create client with auto-reconnect enabled
    const config: McpClientConfig = {
      protocol: ProtocolTypes.HTTPS,
      url: 'https://mcp.context7.com/mcp',
      clientName: 'claude-zen-demo',
      clientVersion: '1.0.0',
      timeout: 5000, // Short timeout for demo
      connection: {
        autoReconnect: true,
        reconnectDelay: 2000,
        maxReconnectAttempts: 3,
      },
    };

    const client = new McpClientAdapter(config);
    
    // Set up event listeners
    client.on('connecting', () => console.log('🔄 Connecting...'));
    client.on('connect', () => console.log('✅ Connected'));
    client.on('disconnect', () => console.log('❌ Disconnected'));
    client.on('error', (error) => console.log('⚠️ Error:', error.message));

    // Try to connect
    await client.connect();
    
    // Get metadata
    const metadata = await client.getMetadata();
    console.log('📊 Client metadata:', {
      version: metadata.version,
      features: metadata.features,
      connected: metadata.connection.connected,
    });

    await client.disconnect();

  } catch (error) {
    console.log('ℹ️ Error handling demo (connection may fail):', error.message);
  }
}

/**
 * Example 6: Multiple MCP servers
 */
export async function multipleServersExample() {
  console.log('\n🌐 Example 6: Multiple MCP Servers');

  const servers = [
    { name: 'Context7', factory: createContext7Client },
    { name: 'Deepwiki', factory: createDeepwikiClient },
    { name: 'Semgrep', factory: createSemgrepClient },
    { name: 'GitMCP', factory: createGitMcpClient },
  ];

  const results = await Promise.allSettled(
    servers.map(async ({ name, factory }) => {
      try {
        const client = await factory();
        await client.connect();
        
        // Quick health check
        const isHealthy = await client.health();
        await client.disconnect();
        
        return { name, status: isHealthy ? 'healthy' : 'unhealthy' };
      } catch (error) {
        return { name, status: 'failed', error: error.message };
      }
    })
  );

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const { name, status } = result.value;
      console.log(`${status === 'healthy' ? '✅' : '⚠️'} ${name}: ${status}`);
    } else {
      console.log(`❌ ${servers[index].name}: ${result.reason.message}`);
    }
  });
}

/**
 * Run all examples
 */
export async function runAllMcpExamples() {
  console.log('🚀 Running MCP Client Examples\n');
  console.log('Note: These examples may show connection failures in demo environment');
  console.log('In production, ensure MCP servers are accessible and configured correctly\n');

  await basicMcpExample();
  await factoryPatternExample();
  await toolExecutionExample();
  await resourceAccessExample();
  await errorHandlingExample();
  await multipleServersExample();

  console.log('\n✨ All MCP Client examples completed!');
}

// Export for testing
export const mcpExamples = {
  basicMcpExample,
  factoryPatternExample,
  toolExecutionExample,
  resourceAccessExample,
  errorHandlingExample,
  multipleServersExample,
  runAllMcpExamples,
};

// Run examples if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllMcpExamples().catch(console.error);
}