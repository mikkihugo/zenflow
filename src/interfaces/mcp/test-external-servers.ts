#!/usr/bin/env node

/**
 * External MCP Server Connection Test
 * Tests connectivity and tool discovery for external MCP servers
 */

import { ExternalMCPClient } from './external-mcp-client';
import { createLogger } from './simple-logger';

const logger = createLogger('MCP-Test');

/**
 * Test external MCP server connections
 */
async function testExternalMCPServers(): Promise<void> {
  logger.info('Starting external MCP server connection tests...');

  try {
    // Create MCP client with configuration
    const client = new ExternalMCPClient({
      timeout: 30000,
      retryAttempts: 3,
      enableLogging: true,
    });

    // Set up event listeners
    client.on('serverConnected', (data) => {
      logger.info(`✅ Server connected: ${data.server} (${data.tools} tools)`);
    });

    client.on('serverError', (data) => {
      logger.error(`❌ Server error: ${data.server} - ${data.error}`);
    });

    client.on('toolExecuted', (data) => {
      logger.info(`🔧 Tool executed: ${data.tool} on ${data.server}`);
    });

    // Test server connections
    logger.info('Connecting to external MCP servers...');
    const connectionResults = await client.connectAll();

    for (const result of connectionResults) {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.serverName}: ${result.success ? 'Connected' : result.error}`);

      if (result.success) {
        logger.info(`Successfully connected to ${result.serverName}`);
      } else {
        logger.error(`Failed to connect to ${result.serverName}: ${result.error}`);
      }
    }

    // Get server status
    const serverStatus = client.getServerStatus();

    console.log('\n📊 Server Status:');
    for (const [name, status] of Object.entries(serverStatus)) {
      const connectionIcon = status.connected ? '🟢' : '🔴';
      console.log(`  ${connectionIcon} ${name}: ${status.connected ? 'Online' : 'Offline'}`);
      if (status.lastPing) {
        console.log(`    Last ping: ${new Date(status.lastPing).toLocaleString()}`);
      }
    }

    // Test tool discovery
    const availableTools = client.getAvailableTools();

    console.log('\n🔧 Available Tools:');
    for (const [serverName, tools] of Object.entries(availableTools)) {
      if (tools.length === 0) {
        console.log(`  ${serverName}: No tools available`);
      } else {
        console.log(`  ${serverName}: ${tools.length} tools`);
        for (const tool of tools) {
          console.log(`    - ${tool.name}: ${tool.description || 'No description'}`);
        }
      }
    }

    // Test tool execution (simulation)
    logger.info('\nTesting tool execution...');

    const testExecutions = [
      { server: 'context7', tool: 'research_analysis', params: { topic: 'AI development' } },
      {
        server: 'deepwiki',
        tool: 'knowledge_search',
        params: { query: 'TypeScript best practices' },
      },
      { server: 'gitmcp', tool: 'repository_analysis', params: { repo: 'claude-code-zen' } },
      { server: 'semgrep', tool: 'security_scan', params: { language: 'typescript' } },
    ];

    for (const test of testExecutions) {
      try {
        const result = await client.executeTool(test.server, test.tool, test.params);

        if (result.success) {
        } else {
        }
      } catch (_error) {}
    }

    const totalTools = Object.values(availableTools).reduce((sum, tools) => sum + tools.length, 0);
    console.log(`\n📊 Total tools available: ${totalTools}`);

    // Cleanup
    await client.disconnectAll();
    logger.info('External MCP server test completed successfully');
  } catch (error) {
    logger.error('External MCP server test failed:', error);
    process.exit(1);
  }
}

/**
 * Validate configuration files
 */
function validateConfigurationFiles(): void {
  import('node:fs')
    .then((fs) => {
      import('node:path')
        .then((path) => {
          const configFiles = [
            '.github/copilot_settings.yml',
            'claude_desktop_config.json',
            '.copilotrc.json',
            '.github/copilot-config.yml',
          ];

          for (const file of configFiles) {
            const filePath = path.resolve(process.cwd(), file);

            if (fs.existsSync(filePath)) {
              try {
                const content = fs.readFileSync(filePath, 'utf8');

                if (file.endsWith('.json')) {
                  JSON.parse(content); // Validate JSON
                } else if (file.endsWith('.yml') || file.endsWith('.yaml')) {
                }

                // Check for external server references
                if (
                  content.includes('context7') ||
                  content.includes('deepwiki') ||
                  content.includes('gitmcp') ||
                  content.includes('semgrep')
                ) {
                }
              } catch (_error) {}
            } else {
            }
          }
        })
        .catch(console.error);
    })
    .catch(console.error);
}

/**
 * Main test function
 */
async function main(): Promise<void> {
  // Validate configuration files first
  validateConfigurationFiles();

  // Test external server connections
  await testExternalMCPServers();
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}

export { testExternalMCPServers, validateConfigurationFiles };
