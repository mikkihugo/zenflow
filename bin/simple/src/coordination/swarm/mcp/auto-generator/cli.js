#!/usr/bin/env node
import chalk from 'chalk';
import { program } from 'commander';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { getLogger } from '../../../../config/logging-config.js';
import { OpenAPIMCPGenerator } from './openapi-mcp-generator.js';
const logger = getLogger('openapi-mcp-cli');
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
    .option('-b, --base-url <url>', 'Base URL for API requests', 'http://localhost:3456')
    .option('--sync', 'Enable continuous sync monitoring')
    .option('-a, --auth <type>', 'Authentication type (bearer|apikey|custom)', 'none')
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
    }
    catch (error) {
        console.error(chalk.red('❌ Generation failed:'), error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
});
program
    .command('watch')
    .description('Watch OpenAPI specification for changes and regenerate tools')
    .requiredOption('-s, --spec <url>', 'OpenAPI specification URL or file path')
    .requiredOption('-o, --output <dir>', 'Output directory for generated tools')
    .requiredOption('-n, --namespace <name>', 'Namespace for generated tools')
    .option('-b, --base-url <url>', 'Base URL for API requests', 'http://localhost:3456')
    .option('-a, --auth <type>', 'Authentication type (bearer|apikey|custom)', 'none')
    .option('--auth-header <name>', 'Custom auth header name (for apikey)')
    .option('--no-tests', 'Skip test generation')
    .option('--no-validate-responses', 'Skip response validation')
    .option('--include-deprecated', 'Include deprecated operations')
    .option('--timeout <ms>', 'Request timeout in milliseconds', '30000')
    .option('-v, --verbose', 'Verbose logging')
    .action(async (options) => {
    try {
        await handleWatch(options);
    }
    catch (error) {
        console.error(chalk.red('❌ Watch failed:'), error instanceof Error ? error.message : String(error));
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
    }
    catch (error) {
        console.error(chalk.red('❌ Validation failed:'), error instanceof Error ? error.message : String(error));
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
    }
    catch (error) {
        console.error(chalk.red('❌ List failed:'), error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
});
async function handleGenerate(options) {
    console.log(chalk.blue('🚀 OpenAPI → MCP Tools Generator'));
    console.log('');
    validateOptions(options);
    if (options.verbose) {
        process.env.LOG_LEVEL = 'debug';
    }
    const config = buildGeneratorConfig(options);
    if (options.dryRun) {
        console.log(chalk.yellow('📋 Dry Run Mode - Configuration:'));
        console.log(JSON.stringify(config, null, 2));
        console.log('');
        return;
    }
    const generator = new OpenAPIMCPGenerator(config);
    console.log(chalk.green('📊 Configuration:'));
    console.log(`  Spec URL: ${config.specUrl}`);
    console.log(`  Output Dir: ${config.outputDir}`);
    console.log(`  Namespace: ${config.namespace}`);
    console.log(`  Base URL: ${config.baseUrl}`);
    console.log(`  Auth: ${config.auth?.type || 'none'}`);
    console.log(`  Tests: ${config.options?.generateTests ? 'enabled' : 'disabled'}`);
    console.log(`  Sync: ${config.enableSync ? 'enabled' : 'disabled'}`);
    console.log('');
    console.log(chalk.blue('⚡ Generating MCP tools...'));
    await generator.generateAll();
    const stats = generator.getStats();
    console.log('');
    console.log(chalk.green('✅ Generation completed successfully!'));
    console.log(`  Tools generated: ${stats.toolsGenerated}`);
    console.log(`  Output directory: ${stats.outputDir}`);
    if (config.enableSync) {
        console.log('');
        console.log(chalk.yellow('👁️  Sync monitoring enabled - watching for changes...'));
        console.log(chalk.gray('Press Ctrl+C to stop'));
        process.on('SIGINT', () => {
            console.log('');
            console.log(chalk.blue('🛑 Stopping sync monitoring...'));
            generator.stopSyncMonitoring();
            process.exit(0);
        });
        setInterval(() => { }, 1000);
    }
}
async function handleWatch(options) {
    console.log(chalk.blue('👁️  OpenAPI → MCP Tools Watcher'));
    console.log('');
    validateOptions(options);
    if (options.verbose) {
        process.env.LOG_LEVEL = 'debug';
    }
    const config = buildGeneratorConfig({ ...options, sync: true });
    const generator = new OpenAPIMCPGenerator(config);
    console.log(chalk.green('📊 Watch Configuration:'));
    console.log(`  Spec URL: ${config.specUrl}`);
    console.log(`  Output Dir: ${config.outputDir}`);
    console.log(`  Namespace: ${config.namespace}`);
    console.log('');
    console.log(chalk.blue('⚡ Initial generation...'));
    await generator.generateAll();
    const stats = generator.getStats();
    console.log('');
    console.log(chalk.green('✅ Initial generation completed!'));
    console.log(`  Tools generated: ${stats.toolsGenerated}`);
    console.log('');
    console.log(chalk.yellow('👁️  Watching for changes...'));
    console.log(chalk.gray('Press Ctrl+C to stop'));
    process.on('SIGINT', () => {
        console.log('');
        console.log(chalk.blue('🛑 Stopping watcher...'));
        generator.stopSyncMonitoring();
        process.exit(0);
    });
    setInterval(() => { }, 1000);
}
async function handleValidate(options) {
    console.log(chalk.blue('✅ OpenAPI Specification Validator'));
    console.log('');
    if (options.verbose) {
        process.env.LOG_LEVEL = 'debug';
    }
    try {
        const generator = new OpenAPIMCPGenerator({
            specUrl: options.spec,
            outputDir: '/tmp',
            namespace: 'test',
            enableSync: false,
        });
        console.log(chalk.blue('📋 Loading specification...'));
        await generator.loadOpenAPISpec();
        await generator.validateSpec();
        const stats = generator.getStats();
        console.log('');
        console.log(chalk.green('✅ Specification is valid!'));
        console.log(`  Endpoints found: ${stats.toolsGenerated}`);
        console.log(`  Spec URL: ${options.spec}`);
    }
    catch (error) {
        console.log('');
        console.log(chalk.red('❌ Specification validation failed!'));
        throw error;
    }
}
async function handleList(options) {
    console.log(chalk.blue('📋 OpenAPI Endpoints Lister'));
    console.log('');
    if (options.verbose) {
        process.env.LOG_LEVEL = 'debug';
    }
    try {
        const generator = new OpenAPIMCPGenerator({
            specUrl: options.spec,
            outputDir: '/tmp',
            namespace: 'test',
            enableSync: false,
        });
        console.log(chalk.blue('📋 Loading specification...'));
        await generator.loadOpenAPISpec();
        const spec = generator.spec;
        if (!spec) {
            throw new Error('Failed to load specification');
        }
        const endpoints = [];
        for (const [path, methods] of Object.entries(spec.paths)) {
            for (const [method, operation] of Object.entries(methods)) {
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
        }
        else {
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
    }
    catch (error) {
        console.log('');
        console.log(chalk.red('❌ Failed to list endpoints!'));
        throw error;
    }
}
function validateOptions(options) {
    if (options.output) {
        const outputDir = resolve(options.output);
        const parentDir = join(outputDir, '..');
        if (!existsSync(parentDir)) {
            throw new Error(`Parent directory does not exist: ${parentDir}`);
        }
    }
    if (options.namespace &&
        !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(options.namespace)) {
        throw new Error('Namespace must be a valid identifier (letters, numbers, underscore)');
    }
    if (options.auth &&
        !['bearer', 'apikey', 'custom', 'none'].includes(options.auth)) {
        throw new Error('Auth type must be one of: bearer, apikey, custom, none');
    }
    if (options.timeout) {
        const timeout = Number.parseInt(options.timeout);
        if (isNaN(timeout) || timeout <= 0) {
            throw new Error('Timeout must be a positive number');
        }
    }
}
function buildGeneratorConfig(options) {
    const config = {
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
    if (options.auth && options.auth !== 'none') {
        config.auth = {
            type: options.auth,
            header: options.authHeader,
        };
    }
    return config;
}
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
program.parse();
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
//# sourceMappingURL=cli.js.map