"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configCommand = configCommand;
// config.js - Configuration management commands
const utils_js_1 = require("../utils.js");
async function configCommand(subArgs, flags) {
    const configCmd = subArgs[0];
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
        default:
            showConfigHelp();
    }
}
async function initConfig(subArgs, flags) {
    const force = subArgs.includes('--force') || subArgs.includes('-f');
    const configFile = 'claude-flow.config.json';
    try {
        // Check if config already exists
        const exists = await (0, utils_js_1.fileExists)(configFile);
        if (exists && !force) {
            (0, utils_js_1.printWarning)('Configuration file already exists');
            console.log('Use --force to overwrite existing configuration');
            return;
        }
        (0, utils_js_1.printSuccess)('Initializing Claude-Flow configuration...');
        // Create default configuration
        const defaultConfig = {
            version: "1.0.71",
            terminal: {
                poolSize: 10,
                recycleAfter: 20,
                healthCheckInterval: 30000,
                type: "auto"
            },
            orchestrator: {
                maxConcurrentTasks: 10,
                taskTimeout: 300000,
                defaultPriority: 5
            },
            memory: {
                backend: "json",
                path: "./memory/claude-flow-data.json",
                cacheSize: 1000,
                indexing: true
            },
            agents: {
                maxAgents: 20,
                defaultCapabilities: ["research", "code", "terminal"],
                resourceLimits: {
                    memory: "1GB",
                    cpu: "50%"
                }
            },
            mcp: {
                port: 3000,
                host: "localhost",
                timeout: 30000
            },
            logging: {
                level: "info",
                file: "./claude-flow.log",
                maxSize: "10MB",
                maxFiles: 5
            }
        };
        await (0, utils_js_1.writeJsonFile)(configFile, defaultConfig);
        console.log(`✓ Created ${configFile}`);
        console.log('✓ Default settings configured');
        console.log('\nNext steps:');
        console.log('1. Review settings: claude-flow config show');
        console.log('2. Customize values: claude-flow config set <key> <value>');
        console.log('3. Validate config: claude-flow config validate');
    }
    catch (err) {
        (0, utils_js_1.printError)(`Failed to initialize configuration: ${err.message}`);
    }
}
async function showConfig(subArgs, flags) {
    const configFile = 'claude-flow.config.json';
    const format = getFlag(subArgs, '--format') || 'pretty';
    try {
        const config = await (0, utils_js_1.readJsonFile)(configFile);
        (0, utils_js_1.printSuccess)('Current configuration:');
        if (format === 'json') {
            console.log(JSON.stringify(config, null, 2));
        }
        else {
            // Pretty format
            console.log('\n📋 System Configuration:');
            console.log(`   Version: ${config.version || 'unknown'}`);
            console.log('\n🖥️  Terminal Pool:');
            console.log(`   Pool Size: ${config.terminal?.poolSize || 10}`);
            console.log(`   Recycle After: ${config.terminal?.recycleAfter || 20} commands`);
            console.log(`   Health Check: ${config.terminal?.healthCheckInterval || 30000}ms`);
            console.log('\n🎭 Orchestrator:');
            console.log(`   Max Concurrent Tasks: ${config.orchestrator?.maxConcurrentTasks || 10}`);
            console.log(`   Task Timeout: ${config.orchestrator?.taskTimeout || 300000}ms`);
            console.log('\n💾 Memory:');
            console.log(`   Backend: ${config.memory?.backend || 'json'}`);
            console.log(`   Path: ${config.memory?.path || './memory/claude-flow-data.json'}`);
            console.log('\n🤖 Agents:');
            console.log(`   Max Agents: ${config.agents?.maxAgents || 20}`);
            console.log(`   Resource Limits: ${JSON.stringify(config.agents?.resourceLimits || {})}`);
        }
    }
    catch (err) {
        (0, utils_js_1.printError)('Configuration file not found');
        console.log('Run "claude-flow config init" to create default configuration');
    }
}
async function getConfigValue(subArgs, flags) {
    const key = subArgs[1];
    const configFile = 'claude-flow.config.json';
    if (!key) {
        (0, utils_js_1.printError)('Usage: config get <key>');
        console.log('Examples:');
        console.log('  claude-flow config get terminal.poolSize');
        console.log('  claude-flow config get orchestrator.maxConcurrentTasks');
        return;
    }
    try {
        const config = await (0, utils_js_1.readJsonFile)(configFile);
        const value = getNestedValue(config, key);
        if (value !== undefined) {
            console.log(`${key}: ${JSON.stringify(value)}`);
        }
        else {
            (0, utils_js_1.printWarning)(`Configuration key '${key}' not found`);
        }
    }
    catch (err) {
        (0, utils_js_1.printError)('Configuration file not found');
        console.log('Run "claude-flow config init" to create configuration');
    }
}
async function setConfigValue(subArgs, flags) {
    const key = subArgs[1];
    const value = subArgs[2];
    const configFile = 'claude-flow.config.json';
    if (!key || value === undefined) {
        (0, utils_js_1.printError)('Usage: config set <key> <value>');
        console.log('Examples:');
        console.log('  claude-flow config set terminal.poolSize 15');
        console.log('  claude-flow config set orchestrator.taskTimeout 600000');
        return;
    }
    try {
        let config = await (0, utils_js_1.readJsonFile)(configFile, {});
        // Parse value appropriately
        let parsedValue = value;
        if (value === 'true')
            parsedValue = true;
        else if (value === 'false')
            parsedValue = false;
        else if (!isNaN(value) && value.trim() !== '')
            parsedValue = Number(value);
        // Set nested value
        setNestedValue(config, key, parsedValue);
        await (0, utils_js_1.writeJsonFile)(configFile, config);
        (0, utils_js_1.printSuccess)(`Set ${key} = ${JSON.stringify(parsedValue)}`);
    }
    catch (err) {
        (0, utils_js_1.printError)(`Failed to set configuration: ${err.message}`);
    }
}
async function validateConfig(subArgs, flags) {
    const configFile = 'claude-flow.config.json';
    try {
        const config = await (0, utils_js_1.readJsonFile)(configFile);
        (0, utils_js_1.printSuccess)('Validating configuration...');
        const errors = [];
        const warnings = [];
        // Validate required sections
        const requiredSections = ['terminal', 'orchestrator', 'memory'];
        for (const section of requiredSections) {
            if (!config[section]) {
                errors.push(`Missing required section: ${section}`);
            }
        }
        // Validate specific values
        if (config.terminal?.poolSize && (config.terminal.poolSize < 1 || config.terminal.poolSize > 100)) {
            warnings.push('Terminal pool size should be between 1 and 100');
        }
        if (config.orchestrator?.maxConcurrentTasks && config.orchestrator.maxConcurrentTasks < 1) {
            errors.push('Max concurrent tasks must be at least 1');
        }
        if (config.agents?.maxAgents && config.agents.maxAgents < 1) {
            errors.push('Max agents must be at least 1');
        }
        // Report results
        if (errors.length === 0 && warnings.length === 0) {
            (0, utils_js_1.printSuccess)('✅ Configuration is valid');
        }
        else {
            if (errors.length > 0) {
                (0, utils_js_1.printError)(`Found ${errors.length} error(s):`);
                errors.forEach(error => console.log(`  ❌ ${error}`));
            }
            if (warnings.length > 0) {
                (0, utils_js_1.printWarning)(`Found ${warnings.length} warning(s):`);
                warnings.forEach(warning => console.log(`  ⚠️  ${warning}`));
            }
        }
    }
    catch (err) {
        (0, utils_js_1.printError)('Configuration file not found or invalid');
        console.log('Run "claude-flow config init" to create valid configuration');
    }
}
async function resetConfig(subArgs, flags) {
    const force = subArgs.includes('--force') || subArgs.includes('-f');
    if (!force) {
        (0, utils_js_1.printWarning)('This will reset configuration to defaults');
        console.log('Use --force to confirm reset');
        return;
    }
    await initConfig(['--force'], flags);
    (0, utils_js_1.printSuccess)('Configuration reset to defaults');
}
// Helper functions
function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}
function setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const last = keys.pop();
    const target = keys.reduce((current, key) => {
        if (!current[key])
            current[key] = {};
        return current[key];
    }, obj);
    target[last] = value;
}
function getFlag(args, flagName) {
    const index = args.indexOf(flagName);
    return index !== -1 && index + 1 < args.length ? args[index + 1] : null;
}
// fileExists is now imported from utils.js
function showConfigHelp() {
    console.log('Configuration commands:');
    console.log('  init [--force]                   Create default configuration');
    console.log('  show [--format json]             Display current configuration');
    console.log('  get <key>                        Get configuration value');
    console.log('  set <key> <value>                Set configuration value');
    console.log('  validate                         Validate configuration');
    console.log('  reset --force                    Reset to defaults');
    console.log();
    console.log('Configuration Keys:');
    console.log('  terminal.poolSize                Terminal pool size');
    console.log('  terminal.recycleAfter            Commands before recycle');
    console.log('  orchestrator.maxConcurrentTasks  Max parallel tasks');
    console.log('  orchestrator.taskTimeout         Task timeout in ms');
    console.log('  memory.backend                   Memory storage backend');
    console.log('  memory.path                      Memory database path');
    console.log('  agents.maxAgents                 Maximum number of agents');
    console.log();
    console.log('Examples:');
    console.log('  claude-flow config init');
    console.log('  claude-flow config set terminal.poolSize 15');
    console.log('  claude-flow config get orchestrator.maxConcurrentTasks');
    console.log('  claude-flow config validate');
}
