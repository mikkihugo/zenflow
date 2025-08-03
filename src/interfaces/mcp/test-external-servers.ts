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
      enableLogging: true
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

    // Display connection results
    console.log('\n📋 Connection Results:');
    console.log('========================');
    
    for (const result of connectionResults) {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.server}:`);
      
      if (result.success) {
        console.log(`   URL: ${result.url}`);
        console.log(`   Tools: ${result.toolCount}`);
        console.log(`   Capabilities: ${result.capabilities?.join(', ')}`);
      } else {
        console.log(`   Error: ${result.error}`);
      }
      console.log('');
    }

    // Get server status
    const serverStatus = client.getServerStatus();
    console.log('🖥️  Server Status:');
    console.log('==================');
    
    for (const [name, status] of Object.entries(serverStatus)) {
      const connectionIcon = status.connected ? '🟢' : '🔴';
      console.log(`${connectionIcon} ${name}:`);
      console.log(`   Type: ${status.type.toUpperCase()}`);
      console.log(`   URL: ${status.url}`);
      console.log(`   Connected: ${status.connected}`);
      console.log(`   Tools: ${status.toolCount}`);
      console.log(`   Capabilities: ${status.capabilities.join(', ')}`);
      if (status.lastPing) {
        console.log(`   Last Ping: ${status.lastPing.toISOString()}`);
      }
      console.log('');
    }

    // Test tool discovery
    const availableTools = client.getAvailableTools();
    console.log('🔧 Available Tools:');
    console.log('===================');
    
    for (const [serverName, tools] of Object.entries(availableTools)) {
      console.log(`\n📡 ${serverName.toUpperCase()}:`);
      
      if (tools.length === 0) {
        console.log('   No tools available');
      } else {
        for (const tool of tools) {
          console.log(`   • ${tool.name}: ${tool.description}`);
        }
      }
    }

    // Test tool execution (simulation)
    logger.info('\nTesting tool execution...');
    
    const testExecutions = [
      { server: 'context7', tool: 'research_analysis', params: { topic: 'AI development' } },
      { server: 'deepwiki', tool: 'knowledge_search', params: { query: 'TypeScript best practices' } },
      { server: 'gitmcp', tool: 'repository_analysis', params: { repo: 'claude-code-zen' } },
      { server: 'semgrep', tool: 'security_scan', params: { language: 'typescript' } }
    ];

    console.log('\n⚙️  Tool Execution Tests:');
    console.log('=========================');

    for (const test of testExecutions) {
      try {
        const result = await client.executeTool(test.server, test.tool, test.params);
        
        if (result.success) {
          console.log(`✅ ${test.server}.${test.tool}:`);
          console.log(`   Result: ${JSON.stringify(result.result, null, 2)}`);
        } else {
          console.log(`❌ ${test.server}.${test.tool}:`);
          console.log(`   Error: ${result.error}`);
        }
      } catch (error) {
        console.log(`❌ ${test.server}.${test.tool}:`);
        console.log(`   Exception: ${error instanceof Error ? error.message : String(error)}`);
      }
      console.log('');
    }

    // Generate configuration summary
    console.log('📊 Configuration Summary:');
    console.log('=========================');
    console.log(`Total External Servers: ${connectionResults.length}`);
    console.log(`Connected Servers: ${connectionResults.filter(r => r.success).length}`);
    console.log(`Failed Connections: ${connectionResults.filter(r => !r.success).length}`);
    
    const totalTools = Object.values(availableTools).reduce((sum, tools) => sum + tools.length, 0);
    console.log(`Total Available Tools: ${totalTools}`);

    // GitHub Copilot configuration recommendations
    console.log('\n🤖 GitHub Copilot Configuration:');
    console.log('=================================');
    console.log('The following configuration files have been created:');
    console.log('• .github/copilot_settings.yml - External MCP server settings');
    console.log('• claude_desktop_config.json - Claude Desktop configuration');
    console.log('• .copilotrc.json - Project-specific Copilot settings');
    console.log('');
    console.log('To enable external MCP servers in GitHub Copilot:');
    console.log('1. Ensure Claude Desktop is configured with the external servers');
    console.log('2. Verify the copilot_settings.yml contains correct server URLs');
    console.log('3. Check that external servers are accessible from your environment');
    console.log('4. Restart GitHub Copilot to pick up new configuration');

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
  import('fs').then(fs => {
    import('path').then(path => {
      console.log('\n📄 Configuration File Validation:');
      console.log('===================================');

      const configFiles = [
        '.github/copilot_settings.yml',
        'claude_desktop_config.json', 
        '.copilotrc.json',
        '.github/copilot-config.yml'
      ];

      for (const file of configFiles) {
        const filePath = path.resolve(process.cwd(), file);
        
        if (fs.existsSync(filePath)) {
          console.log(`✅ ${file} - Found`);
          
          try {
            const content = fs.readFileSync(filePath, 'utf8');
            
            if (file.endsWith('.json')) {
              JSON.parse(content); // Validate JSON
              console.log(`   📝 Valid JSON format`);
            } else if (file.endsWith('.yml') || file.endsWith('.yaml')) {
              console.log(`   📝 YAML format (syntax check recommended)`);
            }
            
            // Check for external server references
            if (content.includes('context7') || content.includes('deepwiki') || 
                content.includes('gitmcp') || content.includes('semgrep')) {
              console.log(`   🌐 Contains external MCP server references`);
            }
            
          } catch (error) {
            console.log(`   ❌ Invalid format: ${error instanceof Error ? error.message : String(error)}`);
          }
        } else {
          console.log(`❌ ${file} - Not found`);
        }
      }
    }).catch(console.error);
  }).catch(console.error);
}

/**
 * Main test function
 */
async function main(): Promise<void> {
  console.log('🧪 External MCP Server Configuration Test');
  console.log('==========================================\n');

  // Validate configuration files first
  validateConfigurationFiles();

  // Test external server connections
  await testExternalMCPServers();

  console.log('\n✨ Test completed! Check the output above for configuration status.');
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}

export { testExternalMCPServers, validateConfigurationFiles };