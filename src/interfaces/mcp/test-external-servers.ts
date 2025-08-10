#!/usr/bin/env node

/**
 * @file Test suite for test-external-servers.
 */

/**
 * External MCP Server Connection Test.
 * Tests connectivity and tool discovery for external MCP servers.
 */

import { getLogger } from '../../config/logging-config';
import { ExternalMCPClient } from './external-mcp-client';

const logger = getLogger('MCP-Test');

/**
 * Test external MCP server connections.
 *
 * @example
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
      logger.info(`✅ Server connected: ${data?.server} (${data?.tools} tools)`);
    });

    client.on('serverError', (data) => {
      logger.error(`❌ Server error: ${data?.server} - ${data?.error}`);
    });

    client.on('toolExecuted', (data) => {
      logger.info(`🔧 Tool executed: ${data?.tool} on ${data?.server}`);
    });

    // Test server connections
    logger.info('Connecting to external MCP servers...');
    const connectionResults = await client.connectAll();

    for (const result of connectionResults) {
      const _status = result?.success ? '✅' : '❌';

      if (result?.success) {
        logger.info(`Successfully connected to ${result?.serverName}`);
      } else {
        logger.error(`Failed to connect to ${result?.serverName}: ${result?.error}`);
      }
    }

    // Get server status
    const serverStatus = client.getServerStatus();
    for (const [_name, status] of Object.entries(serverStatus)) {
      const _connectionIcon = status.connected ? '🟢' : '🔴';
      if (status.lastPing) {
      }
    }

    // Test tool discovery
    const availableTools = client.getAvailableTools();
    for (const [_serverName, tools] of Object.entries(availableTools)) {
      if (tools.length === 0) {
      } else {
        for (const _tool of tools) {
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

        if (result?.success) {
        } else {
        }
      } catch (_error) {}
    }

    const _totalTools = Object.values(availableTools).reduce((sum, tools) => sum + tools.length, 0);

    // Cleanup
    await client.disconnectAll();
    logger.info('External MCP server test completed successfully');
  } catch (error) {
    logger.error('External MCP server test failed:', error);
    process.exit(1);
  }
}

/**
 * Validate configuration files.
 *
 * @example
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
 * Main test function.
 *
 * @example
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
    logger.error('Test failed:', error);
    process.exit(1);
  });
}

export { testExternalMCPServers, validateConfigurationFiles };
