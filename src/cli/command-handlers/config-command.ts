/**
 * Config Command Module
 * Converted from JavaScript to TypeScript
 */

// config.js - Configuration management commands
import {
  fileExists,
  printError,
  printSuccess,
  printWarning,
  readJsonFile,
  writeJsonFile,
} from '../utils.js';

export async function configCommand(subArgs = subArgs[0];

switch (configCmd) {
  case 'init':
    await initConfig(subArgs, flags);
    break;

  case 'show':
    await showConfig(subArgs, flags);
    break;

  case 'get':
    await getConfigValue(subArgs, flags);
    break;

  case 'set':
    await setConfigValue(subArgs, flags);
    break;

  case 'validate':
    await validateConfig(subArgs, flags);
    break;

  case 'reset':
    await resetConfig(subArgs, flags);
    break;
  default = subArgs.includes('--force') || subArgs.includes('-f');
  const configFile = 'claude-zen.config.json';

  try {
    // Check if config already exists
    const exists = await fileExists(configFile);
    if(exists && !force) {
      printWarning('Configuration file already exists');
      console.warn('Use --force to overwrite existing configuration');
      return;
    }

    printSuccess('Initializing Claude-Flow configuration...');

    // Create default configuration

  const _format = getFlag(subArgs, '--format') || 'pretty';

  try {
    const config = await readJsonFile(configFile);

    printSuccess('Currentconfiguration = == 'json') {
      console.warn(JSON.stringify(config, null, 2));
    } else {
      // Pretty format
      console.warn('\n📋 SystemConfiguration = subArgs[1];
  const _configFile = 'claude-zen.config.json';

  if(!key) {
    printError('Usage = await readJsonFile(configFile);
    const value = getNestedValue(config, key);

    if(value !== undefined) {
      console.warn(`${key}: ${JSON.stringify(value)}`);
    } else {
      printWarning(`Configuration key '${key}' not found`);
    }
  } catch(err) 
    printError('Configuration file not found');
    console.warn('Run "claude-zen config init" to create configuration');
}

async function setConfigValue(subArgs = subArgs[1];
  const value = subArgs[2];
  const configFile = 'claude-zen.config.json';

  if(!key || value === undefined) {
    printError('Usage = await readJsonFile(configFile, {});

    // Parse value appropriately
    let parsedValue = value;
    if (value === 'true') parsedValue = true;
    else if (value === 'false') parsedValue = false;
    else if (!Number.isNaN(value) && value.trim() !== '') parsedValue = Number(value);

    // Set nested value
    setNestedValue(config, key, parsedValue);

    await writeJsonFile(configFile, config);
    printSuccess(`Set ${key} = ${JSON.stringify(parsedValue)}`);
  } catch(err) 
    printError(`Failed to setconfiguration = 'claude-zen.config.json';

  try {
    const config = await readJsonFile(configFile);

    printSuccess('Validating configuration...');

    const errors = [];
    const warnings = [];

    // Validate required sections
    const requiredSections = ['terminal', 'orchestrator', 'memory'];
    for(const section of requiredSections) {
      if(!config[section]) {
        errors.push(`Missing requiredsection = == 0 && warnings.length === 0) 
      printSuccess('✅ Configuration is valid');else 
      if(errors.length > 0) {
        printError(`Found ${errors.length} error(s):`);
        errors.forEach((error) => console.warn(`  ❌ ${error}`));
      }

      if(warnings.length > 0) {
        printWarning(`Found ${warnings.length} warning(s):`);
        warnings.forEach((warning) => console.warn(`  ⚠️  ${warning}`));
      }catch(err) 
    printError('Configuration file not found or invalid');
    console.warn('Run "claude-zen config init" to create valid configuration');
}

async function resetConfig(subArgs = subArgs.includes('--force') || subArgs.includes('-f');

  if(!force) {
    printWarning('This will reset configuration to defaults');
    console.warn('Use --force to confirm reset');
    return;
  }

  await initConfig(['--force'], flags);
  printSuccess('Configuration reset to defaults');
}

// Helper functions
function getNestedValue(obj = > current?.[key], obj);
}

function setNestedValue(obj = path.split('.');
  const last = keys.pop();
  const target = keys.reduce((current, key) => {
    if (!current[key]) current[key] = {};
    return current[key];
  }, obj);
  target[last] = value;
}

function getFlag(args = args.indexOf(flagName);
return index !== -1 && index + 1 < args.length ? args[index + 1] : null;
}

// fileExists is now imported from utils.js

function _showConfigHelp() {
  console.warn('Configuration commands:');
  console.warn('  init [--force]                   Create default configuration');
  console.warn('  show [--format json]             Display current configuration');
  console.warn('  get <key>                        Get configuration value');
  console.warn('  set <key> <value>                Set configuration value');
  console.warn('  validate                         Validate configuration');
  console.warn('  reset --force                    Reset to defaults');
  console.warn();
  console.warn('Configuration Keys:');
  console.warn('  terminal.poolSize                Terminal pool size');
  console.warn('  terminal.recycleAfter            Commands before recycle');
  console.warn('  orchestrator.maxConcurrentTasks  Max parallel tasks');
  console.warn('  orchestrator.taskTimeout         Task timeout in ms');
  console.warn('  memory.backend                   Memory storage backend');
  console.warn('  memory.path                      Memory database path');
  console.warn('  agents.maxAgents                 Maximum number of agents');
  console.warn();
  console.warn('Examples:');
  console.warn('  claude-zen config init');
  console.warn('  claude-zen config set terminal.poolSize 15');
  console.warn('  claude-zen config get orchestrator.maxConcurrentTasks');
  console.warn('  claude-zen config validate');
}
