#!/usr/bin/env node
"use strict";
/**
 * CLI command wrapper for migrate-hooks script
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateHooksCommandConfig = void 0;
exports.migrateHooksCommand = migrateHooksCommand;
const child_process_1 = require("child_process");
const path_1 = require("path");
const url_1 = require("url");
const fs_1 = require("fs");
const __dirname = path_1.default.dirname((0, url_1.fileURLToPath)(import.meta.url));
async function migrateHooksCommand(flags, args) {
    console.log('🔄 Claude Flow Hooks Migration\n');
    try {
        // Find the migration script
        const scriptPath = path_1.default.join(__dirname, '../../../scripts/migrate-hooks.js');
        // Check if script exists
        try {
            await fs_1.promises.access(scriptPath);
        }
        catch {
            console.error('❌ Migration script not found. Please ensure you have the latest version.');
            process.exit(1);
        }
        // Build command with any additional arguments
        const command = ['node', scriptPath];
        if (args.length > 0) {
            command.push(...args);
        }
        // Execute the migration script
        (0, child_process_1.execSync)(command.join(' '), {
            stdio: 'inherit',
            cwd: process.cwd()
        });
    }
    catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}
// Export the command configuration
exports.migrateHooksCommandConfig = {
    handler: migrateHooksCommand,
    description: 'Migrate settings.json hooks to Claude Code 1.0.51+ format',
    usage: 'migrate-hooks [settings-file]',
    examples: [
        'claude-flow migrate-hooks                    # Migrate all found settings.json files',
        'claude-flow migrate-hooks .claude/settings.json  # Migrate specific file'
    ],
    details: `
Migrates old hooks format to new Claude Code 1.0.51+ format:
  • Converts object-based hooks to array-based format
  • Creates backup before making changes
  • Removes unsupported fields (mcpServers, features, performance)
  • Searches common locations if no file specified

The migration is safe and creates backups of original files.`
};
