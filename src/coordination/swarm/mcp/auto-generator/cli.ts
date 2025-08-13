#!/usr/bin/env node

/**
 * @fileoverview CLI for OpenAPI to MCP Tools Auto-Generator
 *
 * Command-line interface for generating MCP tools from OpenAPI specifications.
 * Supports both one-time generation and continuous sync monitoring.
 *
 * @example
 * ```bash
 * # Generate tools from local API server
 * npx openapi-mcp-generator --spec http://localhost:3456/openapi.json --output ./generated --namespace api
 *
 * # Generate with sync monitoring
 * npx openapi-mcp-generator --spec ./openapi.json --output ./generated --namespace api --sync
 *
 * # Generate with authentication
 * API_BEARER_TOKEN=token npx openapi-mcp-generator --spec https://api.example.com/openapi.json --output ./generated --namespace api --auth bearer
 * ```
 */

import chalk from 'chalk';
import { program } from 'commander';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { getLogger } from '../../../../config/logging-config.js';
import type { OpenAPIMCPGeneratorConfig } from './openapi-mcp-generator.js';
import { OpenAPIMCPGenerator } from './openapi-mcp-generator.js';

const logger = getLogger('openapi-mcp-cli');

// Package info (would normally come from package.json)
const packageInfo = {
  name: 'openapi-mcp-generator',
  version: '1.0.0',
  description: 'Generate MCP tools from OpenAPI specifications',
};

program
  .name(packageInfo.name)
  .version(packageInfo.version)
  .description(packageInfo.description);

program
  .command('generate')
  .description('Generate MCP tools from OpenAPI specification')
  .requiredOption('-s, --spec <url>', 'OpenAPI specification URL or file path')
  .requiredOption('-o, --output <dir>', 'Output directory for generated tools')
  .requiredOption('-n, --namespace <name>', 'Namespace for generated tools')
  .option(
    '-b, --base-url <url>',
    'Base URL for API requests',
    'http://localhost:3456'
  )
  .option('--sync', 'Enable continuous sync monitoring')
  .option(
    '-a, --auth <type>',
    'Authentication type (bearer|apikey|custom)',
    'none'
  )
  .option('--auth-header <name>', 'Custom auth header name (for apikey)')
  .option('--no-tests', 'Skip test generation')
  .option('--no-validate-responses', 'Skip response validation')
  .option('--include-deprecated', 'Include deprecated operations')
  .option('--timeout <ms>', 'Request timeout in milliseconds', '30000')
  .option('-v, --verbose', 'Verbose logging')
  .option('--dry-run', 'Show what would be generated without creating files')
  .action(async (options) => {
    try {
      await handleGenerate(options);
    } catch (error) {
      console.error(
        chalk.red('❌ Generation failed:'),
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  });

program
  .command('watch')
  .description('Watch OpenAPI specification for changes and regenerate tools')
  .requiredOption('-s, --spec <url>', 'OpenAPI specification URL or file path')
  .requiredOption('-o, --output <dir>', 'Output directory for generated tools')
  .requiredOption('-n, --namespace <name>', 'Namespace for generated tools')
  .option(
    '-b, --base-url <url>',
    'Base URL for API requests',
    'http://localhost:3456'
  )
  .option(
    '-a, --auth <type>',
    'Authentication type (bearer|apikey|custom)',
    'none'
  )
  .option('--auth-header <name>', 'Custom auth header name (for apikey)')
  .option('--no-tests', 'Skip test generation')
  .option('--no-validate-responses', 'Skip response validation')
  .option('--include-deprecated', 'Include deprecated operations')
  .option('--timeout <ms>', 'Request timeout in milliseconds', '30000')
  .option('-v, --verbose', 'Verbose logging')
  .action(async (options) => {
    try {
      await handleWatch(options);
    } catch (error) {
      console.error(
        chalk.red('❌ Watch failed:'),
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate OpenAPI specification')
  .requiredOption('-s, --spec <url>', 'OpenAPI specification URL or file path')
  .option('-v, --verbose', 'Verbose logging')
  .action(async (options) => {
    try {
      await handleValidate(options);
    } catch (error) {
      console.error(
        chalk.red('❌ Validation failed:'),
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List available endpoints in OpenAPI specification')
  .requiredOption('-s, --spec <url>', 'OpenAPI specification URL or file path')
  .option('--format <format>', 'Output format (table|json)', 'table')
  .option('-v, --verbose', 'Verbose logging')
  .action(async (options) => {
    try {
      await handleList(options);
    } catch (error) {
      console.error(
        chalk.red('❌ List failed:'),
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  });

/**
 * Handle generate command
 */
async function handleGenerate(options: unknown): Promise<void> {
  console.log(chalk.blue('🚀 OpenAPI → MCP Tools Generator'));
  console.log('');

  // Validate options
  validateOptions(options);

  // Setup logging
  if (options.verbose) {
    process.env.LOG_LEVEL = 'debug';
  }

  // Build config
  const config = buildGeneratorConfig(options);

  // Show config in dry-run mode
  if (options.dryRun) {
    console.log(chalk.yellow('📋 Dry Run Mode - Configuration:'));
    console.log(JSON.stringify(config, null, 2));
    console.log('');
    return;
  }

  // Create generator
  const generator = new OpenAPIMCPGenerator(config);

  // Show progress
  console.log(chalk.green('📊 Configuration:'));
  console.log(`  Spec URL: ${config.specUrl}`);
  console.log(`  Output Dir: ${config.outputDir}`);
  console.log(`  Namespace: ${config.namespace}`);
  console.log(`  Base URL: ${config.baseUrl}`);
  console.log(`  Auth: ${config.auth?.type || 'none'}`);
  console.log(
    `  Tests: ${config.options?.generateTests ? 'enabled' : 'disabled'}`
  );
  console.log(`  Sync: ${config.enableSync ? 'enabled' : 'disabled'}`);
  console.log('');

  // Generate tools
  console.log(chalk.blue('⚡ Generating MCP tools...'));
  await generator.generateAll();

  // Show results
  const stats = generator.getStats();
  console.log('');
  console.log(chalk.green('✅ Generation completed successfully!'));
  console.log(`  Tools generated: ${stats.toolsGenerated}`);
  console.log(`  Output directory: ${stats.outputDir}`);

  if (config.enableSync) {
    console.log('');
    console.log(
      chalk.yellow('👁️  Sync monitoring enabled - watching for changes...')
    );
    console.log(chalk.gray('Press Ctrl+C to stop'));

    // Keep process alive for sync monitoring
    process.on('SIGINT', () => {
      console.log('');
      console.log(chalk.blue('🛑 Stopping sync monitoring...'));
      generator.stopSyncMonitoring();
      process.exit(0);
    });

    // Keep alive
    setInterval(() => {}, 1000);
  }
}

/**
 * Handle watch command
 */
async function handleWatch(options: unknown): Promise<void> {
  console.log(chalk.blue('👁️  OpenAPI → MCP Tools Watcher'));
  console.log('');

  // Validate options
  validateOptions(options);

  // Setup logging
  if (options.verbose) {
    process.env.LOG_LEVEL = 'debug';
  }

  // Build config with sync enabled
  const config = buildGeneratorConfig({ ...options, sync: true });

  // Create generator
  const generator = new OpenAPIMCPGenerator(config);

  console.log(chalk.green('📊 Watch Configuration:'));
  console.log(`  Spec URL: ${config.specUrl}`);
  console.log(`  Output Dir: ${config.outputDir}`);
  console.log(`  Namespace: ${config.namespace}`);
  console.log('');

  // Initial generation
  console.log(chalk.blue('⚡ Initial generation...'));
  await generator.generateAll();

  const stats = generator.getStats();
  console.log('');
  console.log(chalk.green('✅ Initial generation completed!'));
  console.log(`  Tools generated: ${stats.toolsGenerated}`);
  console.log('');
  console.log(chalk.yellow('👁️  Watching for changes...'));
  console.log(chalk.gray('Press Ctrl+C to stop'));

  // Handle cleanup
  process.on('SIGINT', () => {
    console.log('');
    console.log(chalk.blue('🛑 Stopping watcher...'));
    generator.stopSyncMonitoring();
    process.exit(0);
  });

  // Keep alive
  setInterval(() => {}, 1000);
}

/**
 * Handle validate command
 */
async function handleValidate(options: unknown): Promise<void> {
  console.log(chalk.blue('✅ OpenAPI Specification Validator'));
  console.log('');

  // Setup logging
  if (options.verbose) {
    process.env.LOG_LEVEL = 'debug';
  }

  try {
    // Create minimal generator for validation
    const generator = new OpenAPIMCPGenerator({
      specUrl: options.spec,
      outputDir: '/tmp',
      namespace: 'test',
      enableSync: false,
    });

    // Load and validate spec
    console.log(chalk.blue('📋 Loading specification...'));
    await (generator as any).loadOpenAPISpec();
    await (generator as any).validateSpec();

    const stats = generator.getStats();

    console.log('');
    console.log(chalk.green('✅ Specification is valid!'));
    console.log(`  Endpoints found: ${stats.toolsGenerated}`);
    console.log(`  Spec URL: ${options.spec}`);
  } catch (error) {
    console.log('');
    console.log(chalk.red('❌ Specification validation failed!'));
    throw error;
  }
}

/**
 * Handle list command
 */
async function handleList(options: unknown): Promise<void> {
  console.log(chalk.blue('📋 OpenAPI Endpoints Lister'));
  console.log('');

  // Setup logging
  if (options.verbose) {
    process.env.LOG_LEVEL = 'debug';
  }

  try {
    // Create minimal generator for listing
    const generator = new OpenAPIMCPGenerator({
      specUrl: options.spec,
      outputDir: '/tmp',
      namespace: 'test',
      enableSync: false,
    });

    // Load spec
    console.log(chalk.blue('📋 Loading specification...'));
    await (generator as any).loadOpenAPISpec();

    const spec = (generator as any).spec;
    if (!spec) {
      throw new Error('Failed to load specification');
    }

    // Extract endpoints
    const endpoints: Array<{
      path: string;
      method: string;
      operationId?: string;
      summary?: string;
      deprecated?: boolean;
      tags?: string[];
    }> = [];

    for (const [path, methods] of Object.entries(spec.paths)) {
      for (const [method, operation] of Object.entries(methods as any)) {
        endpoints.push({
          path,
          method: method.toUpperCase(),
          operationId: operation.operationId,
          summary: operation.summary,
          deprecated: operation.deprecated,
          tags: operation.tags,
        });
      }
    }

    console.log('');

    if (options.format === 'json') {
      console.log(JSON.stringify(endpoints, null, 2));
    } else {
      console.log(chalk.green(`📊 Found ${endpoints.length} endpoints:`));
      console.log('');

      const table = endpoints.map((endpoint) => {
        const deprecated = endpoint.deprecated
          ? chalk.red(' [DEPRECATED]')
          : '';
        const tags = endpoint.tags?.join(', ') || '';

        return [
          chalk.cyan(endpoint.method.padEnd(6)),
          endpoint.path,
          endpoint.summary || endpoint.operationId || '',
          tags,
          deprecated,
        ].join(' | ');
      });

      console.log(chalk.gray('METHOD | PATH | DESCRIPTION | TAGS | STATUS'));
      console.log(chalk.gray('-------|------|-------------|------|-------'));
      table.forEach((row) => console.log(row));
    }
  } catch (error) {
    console.log('');
    console.log(chalk.red('❌ Failed to list endpoints!'));
    throw error;
  }
}

/**
 * Validate command options
 */
function validateOptions(options: unknown): void {
  // Validate output directory for generation commands
  if (options.output) {
    const outputDir = resolve(options.output);

    // Check if parent directory exists
    const parentDir = join(outputDir, '..');
    if (!existsSync(parentDir)) {
      throw new Error(`Parent directory does not exist: ${parentDir}`);
    }
  }

  // Validate namespace
  if (
    options.namespace &&
    !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(options.namespace)
  ) {
    throw new Error(
      'Namespace must be a valid identifier (letters, numbers, underscore)'
    );
  }

  // Validate auth type
  if (
    options.auth &&
    !['bearer', 'apikey', 'custom', 'none'].includes(options.auth)
  ) {
    throw new Error('Auth type must be one of: bearer, apikey, custom, none');
  }

  // Validate timeout
  if (options.timeout) {
    const timeout = Number.parseInt(options.timeout);
    if (isNaN(timeout) || timeout <= 0) {
      throw new Error('Timeout must be a positive number');
    }
  }
}

/**
 * Build generator config from CLI options
 */
function buildGeneratorConfig(options: unknown): OpenAPIMCPGeneratorConfig {
  const config: OpenAPIMCPGeneratorConfig = {
    specUrl: options.spec,
    outputDir: resolve(options.output || './generated'),
    namespace: options.namespace,
    baseUrl: options.baseUrl,
    enableSync: options.sync,
    options: {
      includeDeprecated: options.includeDeprecated,
      generateTests: options.tests !== false,
      validateResponses: options.validateResponses !== false,
      timeout: Number.parseInt(options.timeout) || 30000,
    },
  };

  // Setup authentication
  if (options.auth && options.auth !== 'none') {
    config.auth = {
      type: options.auth,
      header: options.authHeader,
    };
  }

  return config;
}

// Error handling
process.on('uncaughtException', (error) => {
  console.error(chalk.red('💥 Uncaught exception:'), error.message);
  if (process.env.LOG_LEVEL === 'debug') {
    console.error(error.stack);
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error(chalk.red('💥 Unhandled rejection:'), reason);
  process.exit(1);
});

// Parse command line arguments
program.parse();

// Show help if no command specified
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
