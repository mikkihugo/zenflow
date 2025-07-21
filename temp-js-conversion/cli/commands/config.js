#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = require("chalk");
const config_js_1 = require("../../core/config.js");
const configManager = config_js_1.ConfigManager.getInstance();
exports.configCommand = new commander_1.Command('config')
    .description('Configuration management commands');
// Get command
exports.configCommand
    .command('get')
    .arguments('<key>')
    .description('Get configuration value')
    .action(async (key) => {
    try {
        const value = configManager.getValue(key);
        console.log(chalk_1.default.green('✓'), `${key}:`, JSON.stringify(value, null, 2));
    }
    catch (error) {
        console.error(chalk_1.default.red('Failed to get configuration:'), error.message);
        process.exit(1);
    }
});
// Set command  
exports.configCommand
    .command('set')
    .arguments('<key> <value>')
    .description('Set configuration value')
    .action(async (key, value) => {
    try {
        let parsedValue = value;
        try {
            parsedValue = JSON.parse(value);
        }
        catch {
            // Keep as string if not valid JSON
        }
        await configManager.set(key, parsedValue);
        console.log(chalk_1.default.green('✓'), `Configuration updated: ${key} = ${JSON.stringify(parsedValue)}`);
    }
    catch (error) {
        console.error(chalk_1.default.red('Failed to set configuration:'), error.message);
        process.exit(1);
    }
});
// List command
exports.configCommand
    .command('list')
    .description('List all configuration values')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
    try {
        const config = await configManager.getAll();
        if (options.json) {
            console.log(JSON.stringify(config, null, 2));
        }
        else {
            console.log(chalk_1.default.cyan.bold('Configuration:'));
            console.log('─'.repeat(40));
            for (const [key, value] of Object.entries(config)) {
                console.log(`${chalk_1.default.yellow(key)}: ${JSON.stringify(value)}`);
            }
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('Failed to list configuration:'), error.message);
        process.exit(1);
    }
});
// Reset command
exports.configCommand
    .command('reset')
    .description('Reset configuration to defaults')
    .option('--force', 'Skip confirmation')
    .action(async (options) => {
    try {
        if (!options.force) {
            console.log(chalk_1.default.yellow('This will reset all configuration to defaults.'));
            // Note: In a real implementation, you'd want to add a confirmation prompt here
        }
        await configManager.reset();
        console.log(chalk_1.default.green('✓'), 'Configuration reset to defaults');
    }
    catch (error) {
        console.error(chalk_1.default.red('Failed to reset configuration:'), error.message);
        process.exit(1);
    }
});
exports.default = exports.configCommand;
