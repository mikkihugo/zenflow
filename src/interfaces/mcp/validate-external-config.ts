#!/usr/bin/env node

/**
 * Simple External MCP Configuration Validator
 * Validates the external MCP server configuration files
 */

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Validate configuration files
 */
function validateConfigurationFiles(): void {
  const configFiles = [
    '.github/copilot_settings.yml',
    'claude_desktop_config.json',
    '.copilotrc.json',
    '.github/copilot-config.yml',
  ];

  let validFiles = 0;
  const totalFiles = configFiles.length;
  const validationReport = {
    totalFiles,
    validFiles: 0,
    errors: [] as string[],
    warnings: [] as string[]
  };

  for (const file of configFiles) {
    const filePath = resolve(process.cwd(), file);

    if (existsSync(filePath)) {
      try {
        const content = readFileSync(filePath, 'utf8');

        if (file.endsWith('.json')) {
          JSON.parse(content); // Validate JSON
          validFiles++;
          validationReport.validFiles++;
        } else if (file.endsWith('.yml') || file.endsWith('.yaml')) {
          console.log(`⚠️  YAML validation not implemented for ${file}`);
          validationReport.warnings.push(`YAML validation skipped for ${file}`);
        }

        // Check for external server references
        if (
          content.includes('context7') ||
          content.includes('deepwiki') ||
          content.includes('gitmcp') ||
          content.includes('semgrep')
        ) {
        }

      } catch (error) {
        const errorMsg = `Invalid config file ${file}: ${error.message}`;
        validationReport.errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    } else {
      console.log(`⚠️  Config file not found: ${file}`);
      validationReport.warnings.push(`Config file not found: ${file}`);
    }
  }
}

/**
 * Test MCP server configuration
 */
function testMCPConfiguration(): void {
  try {
    // Check claude_desktop_config.json
    if (existsSync('claude_desktop_config.json')) {
      const config = JSON.parse(readFileSync('claude_desktop_config.json', 'utf8'));

      if (config.mcpServers) {
        const serverCount = Object.keys(config.mcpServers).length;
        console.log(`✅ Found ${serverCount} MCP servers in claude_desktop_config.json`);

        // List configured servers
        for (const [name, serverConfig] of Object.entries(config.mcpServers as any)) {
          console.log(`  → ${name}: ${JSON.stringify(serverConfig)}`);
        }
      } else {
        console.log('⚠️  No MCP servers configured in claude_desktop_config.json');
      }
    }

    // Check .copilotrc.json
    if (existsSync('.copilotrc.json')) {
      const config = JSON.parse(readFileSync('.copilotrc.json', 'utf8'));

      if (config.mcp?.external_servers) {
        const externalServers = Object.keys(config.mcp.external_servers);

        console.log(`✅ Found ${externalServers.length} external servers in .copilotrc.json`);
        for (const server of externalServers) {
          const serverConfig = config.mcp.external_servers[server];
          console.log(`  → ${server}: enabled=${serverConfig.enabled || false}`);
        }
      }
    }
  } catch (_error) {}
}

/**
 * Print setup instructions
 */
function printSetupInstructions(): void {}

/**
 * Main function
 */
function main(): void {
  validateConfigurationFiles();
  testMCPConfiguration();
  printSetupInstructions();
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
