/**
 * Config Command Handler - TypeScript Edition
 * Configuration management with comprehensive validation and type safety
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { CLIError } from '../../types/cli.js';
import type { Logger } from '../../types/core.js';
import { FlagValidator } from '../core/argument-parser.js';

// =============================================================================
// CONFIG COMMAND TYPES
// =============================================================================

interface ConfigOptions {force = 'init' | 'show' | 'get' | 'set' | 'validate' | 'reset' | 'help'

// =============================================================================
// CONFIG COMMAND IMPLEMENTATION
// =============================================================================

export const configCommand = {
      name => {

    const logger = context.logger.child({command = (context.arguments[0] as ConfigSubCommand) || 'help'

// Parse and validate options
const _options = parseConfigOptions(context
, logger)

// Execute subcommand
const result = await initConfig(options, logger);
break;
case 'show':
          result = await showConfig(options, logger)
break;
case 'get':
          result = await getConfigValue(context.arguments[1], options, logger)
break;
case 'set':
          result = await setConfigValue(context.arguments[1], context.arguments[2], options, logger)
break;
case 'validate':
          result = await validateConfig(options, logger)
break;
case 'reset':
          result = await resetConfig(options, logger)
break;
default = showConfigHelp(logger)
}

// Return success result
return {success = ============================================================================
// OPTION PARSING AND VALIDATION
// =============================================================================

function parseConfigOptions(context = new FlagValidator(context.flags as any);

logger.debug('Parsing config options', {flags = validator.getBooleanFlag('force', false);
const format = validator.getStringFlag('format', 'pretty') as 'pretty' | 'json';

// Validate format
if (!['pretty', 'json'].includes(format)) {
  throw new CLIError('Format must be either "pretty" or "json"', 'config');
}

const options = {force = ============================================================================
// CONFIG SUBCOMMAND IMPLEMENTATIONS
// =============================================================================

async function initConfig(_options = 'claude-zen.config.json';

logger.info('Initializing configuration', {force = await fileExists(configFile);
if (exists && !options.force) {
  logger.warn('Configuration file already exists');
  console.warn('⚠️  Configuration file already exists');
  console.warn('Use --force to overwrite existing configuration');
  return 'Configuration already exists';
}

console.warn('⚙️  Initializing Claude-Flow configuration...');

// Create default configuration

logger.error(errorMessage, error);
console.error(`❌ ${errorMessage}`);
throw error;
}
}

async
function showConfig(options = 'claude-zen.config.json';

logger.debug('Showing configuration', {format = await readJsonFile<ClaudeFlowConfig>(configFile);

console.warn('⚙️  Currentconfiguration = == 'json') {
      console.warn(JSON.stringify(config, null, 2));
} else
{
  // Pretty format
  console.warn('\n📋 SystemConfiguration = 'claude-zen.config.json';

  if (!key) {
    logger.error('No key provided for get command');
    console.error('❌Usage = await readJsonFile<ClaudeFlowConfig>(configFile);
    const value = getNestedValue(config, key);

    if (value !== undefined) {
      console.warn(`${key}: ${JSON.stringify(value)}`);
      logger.info('Configuration value retrieved', { key, value });
      return value;
    } else {
      logger.warn('Configuration key not found', { key });
      console.warn(`⚠️  Configuration key '${key}' not found`);
      return undefined;
    }
  }
  catch (error) 
    logger.error('Configuration file not found', error)
  console.error('❌ Configuration file not found')
  console.warn('Run "claude-zen config init" to create configuration')
  throw new CLIError('Configuration file not found', 'config');
}

async function setConfigValue(key = 'claude-zen.config.json';

if (!key || value === undefined) {
  logger.error('Missing key or value for set command');
  console.error('❌Usage = await readJsonFile<ClaudeFlowConfig>(configFile, {} as ClaudeFlowConfig);

    // Parse value appropriately
    let parsedValue = value;
  if (value === 'true') parsedValue = true;
  else if (value === 'false') parsedValue = false;
  else if (!Number.isNaN(Number(value)) && value.trim() !== '') parsedValue = Number(value);

  // Set nested value
  setNestedValue(config, key, parsedValue);

  await writeJsonFile(configFile, config);
  console.warn(`✅ Set ${key} = ${JSON.stringify(parsedValue)}`);
  logger.info('Configuration value set successfully', { key,value = `Failed to set configuration: ${error instanceof Error ? error.message : String(error)}`;
  logger.error(errorMessage, error);
  console.error(`❌ ${errorMessage}`);
  throw error;
}
}

async
function validateConfig(options = 'claude-zen.config.json';

logger.debug('Validating configuration');

try {
  const config = await readJsonFile<ClaudeFlowConfig>(configFile);

  console.warn('⚙️  Validating configuration...');

  const errors = [];
  const warnings = [];

  // Validate required sections
  const requiredSections = ['terminal', 'orchestrator', 'memory'];
  for (const section of requiredSections) {
    if (!config[section]) {
      errors.push(`Missing required section = {valid = == 0,
      errors,
      warnings
    };

    if (errors.length === 0 && warnings.length === 0) {
      console.warn('✅ Configuration is valid');
    } else {
      if (errors.length > 0) {
        console.error(`❌ Found ${errors.length} error(s):`);
      errors.forEach((error) => console.warn(`  ❌ ${error}`));
    }

    if (warnings.length > 0) {
      console.warn(`⚠️  Found ${warnings.length} warning(s):`);
      warnings.forEach((warning) => console.warn(`  ⚠️  ${warning}`));
    }
  }

  logger.info('Configuration validation completed', result);
  return result;
} catch (error) {
  logger.error('Configuration file not found or invalid', error);
  console.error('❌ Configuration file not found or invalid');
  console.warn('Run "claude-zen config init" to create valid configuration');
  throw new CLIError('Configuration file not found or invalid', 'config');
}
}

async
function resetConfig(options = ============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function getNestedValue(obj = > current?.[key], _obj);
}

function setNestedValue(obj = path.split('.');
const last = keys.pop();
if (!last) throw new Error('Invalid path');

const target = keys.reduce((current, key) => {
  if (!current[key]) current[key] = {};
  return current[key];
}, obj);
target[last] = value;
}

async
function fileExists(filePath = await fs.readFile(filePath, 'utf-8');
return JSON.parse(content);
} catch (error)
{
  if (defaultValue !== undefined) {
    return defaultValue;
  }
  throw error;
}
}

async
function writeJsonFile(filePath = JSON.stringify(data, null, 2);
await fs.writeFile(filePath, content, 'utf-8');
}

function _showConfigHelp(logger: Logger): string {
  logger.debug('Showing config help');

  console.warn('⚙️  Configuration commands:');
  console.warn('  init [--force]                   Create default configuration');
  console.warn('  show [--format json]             Display current configuration');
  console.warn('  get <key>                        Get configuration value');
  console.warn('  set <key> <value>                Set configuration value');
  console.warn('  validate                         Validate configuration');
  console.warn('  reset --force                    Reset to defaults');
  console.warn();
  console.warn('📋 Configuration Keys:');
  console.warn('  terminal.poolSize                Terminal pool size');
  console.warn('  terminal.recycleAfter            Commands before recycle');
  console.warn('  orchestrator.maxConcurrentTasks  Max parallel tasks');
  console.warn('  orchestrator.taskTimeout         Task timeout in ms');
  console.warn('  memory.backend                   Memory storage backend');
  console.warn('  memory.path                      Memory database path');
  console.warn('  agents.maxAgents                 Maximum number of agents');
  console.warn('  mcp.port                         MCP server port');
  console.warn('  logging.level                    Logging level');
  console.warn();
  console.warn('📚 Examples:');
  console.warn('  claude-zen config init');
  console.warn('  claude-zen config set terminal.poolSize 15');
  console.warn('  claude-zen config get orchestrator.maxConcurrentTasks');
  console.warn('  claude-zen config validate');

  return 'Config help displayed';
}
