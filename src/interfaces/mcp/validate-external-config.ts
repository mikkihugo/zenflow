#!/usr/bin/env nodeimport { getLogger } from '../config/logging-config";
/**
 * @file Interface implementation: validate-external-config
 */


const logger = getLogger('interfaces-mcp-validate-external-config');

/**
 * Simple External MCP Configuration Validator.
 * Validates the external MCP server configuration files.
 */

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { getLogger } from '../../core/logger';

/**
 * Validate configuration files.
 */
function validateConfigurationFiles(): void {
  const configFiles = [
    '.github/copilot_settings.yml',
    'claude_desktop_config.json',
    '.copilotrc.json',
    '.github/copilot-config.yml',
  ];

  let _validFiles = 0;
  const totalFiles = configFiles.length;
  const validationReport = {
    totalFiles,
    validFiles: 0,
    errors: [] as string[],
    warnings: [] as string[],
  };

  for (const file of configFiles) {
    const filePath = resolve(process.cwd(), file);

    if (existsSync(filePath)) {
      try {
        const content = readFileSync(filePath, 'utf8');

        if (file.endsWith('.json')) {
          JSON.parse(content); // Validate JSON
          _validFiles++;
          validationReport.validFiles++;
        } else if (file.endsWith('.yml') || file.endsWith('.yaml')) {
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
        logger.error(`❌ ${errorMsg}`);
      }
    } else {
      validationReport.warnings.push(`Config file not found: ${file}`);
    }
  }
}

/**
 * Test MCP server configuration.
 */
function testMCPConfiguration(): void {
  try {
    // Check claude_desktop_config.json
    if (existsSync('claude_desktop_config.json')) {
      const config = JSON.parse(readFileSync('claude_desktop_config.json', 'utf8'));

      if (config?.mcpServers) {
        const _serverCount = Object.keys(config?.mcpServers).length;

        // List configured servers
        for (const [_name, _serverConfig] of Object.entries(config?.mcpServers as any)) {
        }
      } else {
      }
    }

    // Check .copilotrc.json
    if (existsSync('.copilotrc.json')) {
      const config = JSON.parse(readFileSync('.copilotrc.json', 'utf8'));

      if (config?.mcp?.external_servers) {
        const externalServers = Object.keys(config?.mcp?.external_servers);
        for (const server of externalServers) {
          const _serverConfig = config?.mcp?.external_servers?.[server];
        }
      }
    }
  } catch (_error) {}
}

/**
 * Print setup instructions.
 */
function printSetupInstructions(): void {}

/**
 * Main function.
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
