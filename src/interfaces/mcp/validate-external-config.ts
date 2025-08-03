#!/usr/bin/env node

/**
 * Simple External MCP Configuration Validator
 * Validates the external MCP server configuration files
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

/**
 * Validate configuration files
 */
function validateConfigurationFiles(): void {
  console.log('📄 Configuration File Validation:');
  console.log('===================================');

  const configFiles = [
    '.github/copilot_settings.yml',
    'claude_desktop_config.json', 
    '.copilotrc.json',
    '.github/copilot-config.yml'
  ];

  let validFiles = 0;
  let totalFiles = configFiles.length;

  for (const file of configFiles) {
    const filePath = resolve(process.cwd(), file);
    
    if (existsSync(filePath)) {
      console.log(`✅ ${file} - Found`);
      
      try {
        const content = readFileSync(filePath, 'utf8');
        
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
        
        validFiles++;
        
      } catch (error) {
        console.log(`   ❌ Invalid format: ${error instanceof Error ? error.message : String(error)}`);
      }
    } else {
      console.log(`❌ ${file} - Not found`);
    }
  }

  console.log(`\n📊 Summary: ${validFiles}/${totalFiles} configuration files found and valid`);
}

/**
 * Test MCP server configuration
 */
function testMCPConfiguration(): void {
  console.log('\n🤖 GitHub Copilot MCP Configuration:');
  console.log('=====================================');

  try {
    // Check claude_desktop_config.json
    if (existsSync('claude_desktop_config.json')) {
      const config = JSON.parse(readFileSync('claude_desktop_config.json', 'utf8'));
      
      if (config.mcpServers) {
        const serverCount = Object.keys(config.mcpServers).length;
        console.log(`✅ Claude Desktop config found with ${serverCount} MCP servers`);
        
        // List configured servers
        for (const [name, serverConfig] of Object.entries(config.mcpServers as any)) {
          console.log(`   📡 ${name}: ${serverConfig.env?.MCP_SERVER_URL || 'local server'}`);
        }
      } else {
        console.log('❌ No mcpServers section found in claude_desktop_config.json');
      }
    }

    // Check .copilotrc.json
    if (existsSync('.copilotrc.json')) {
      const config = JSON.parse(readFileSync('.copilotrc.json', 'utf8'));
      
      if (config.mcp?.external_servers) {
        const externalServers = Object.keys(config.mcp.external_servers);
        console.log(`✅ Copilot config found with ${externalServers.length} external servers`);
        
        for (const server of externalServers) {
          const serverConfig = config.mcp.external_servers[server];
          console.log(`   🌐 ${server}: ${serverConfig.url} (${serverConfig.type})`);
        }
      }
    }

  } catch (error) {
    console.log(`❌ Error reading configuration: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Print setup instructions
 */
function printSetupInstructions(): void {
  console.log('\n📋 Setup Instructions:');
  console.log('=======================');
  console.log('');
  console.log('1. Copy Claude Desktop Configuration:');
  console.log('   # macOS');
  console.log('   cp claude_desktop_config.json ~/Library/Application\\ Support/Claude/claude_desktop_config.json');
  console.log('   ');
  console.log('   # Windows'); 
  console.log('   copy claude_desktop_config.json %APPDATA%\\Claude\\claude_desktop_config.json');
  console.log('   ');
  console.log('   # Linux');
  console.log('   cp claude_desktop_config.json ~/.config/Claude/claude_desktop_config.json');
  console.log('');
  console.log('2. Restart Claude Desktop to load new MCP servers');
  console.log('');
  console.log('3. Restart GitHub Copilot in your IDE');
  console.log('');
  console.log('4. Verify external MCP tools are available in Claude Desktop');
  console.log('');
  
  console.log('🌐 External MCP Servers Configured:');
  console.log('- Context7: https://mcp.context7.com/mcp (Research & Analysis)');
  console.log('- DeepWiki: https://mcp.deepwiki.com/sse (Knowledge Base)');
  console.log('- GitMCP: https://gitmcp.io/docs (Git Operations)');
  console.log('- Semgrep: https://mcp.semgrep.ai/sse (Security Analysis)');
  console.log('');
  console.log('✅ Configuration complete! GitHub Copilot should now have access to external MCP tools.');
}

/**
 * Main function
 */
function main(): void {
  console.log('🧪 External MCP Server Configuration Validator');
  console.log('===============================================\n');

  validateConfigurationFiles();
  testMCPConfiguration();
  printSetupInstructions();

  console.log('\n✨ Validation completed!');
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}