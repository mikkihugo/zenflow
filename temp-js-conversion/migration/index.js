#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Claude-Flow Migration Tool
 * Helps existing projects migrate to optimized prompts and configurations
 */
const command_1 = require("@cliffy/command");
const migration_runner_js_1 = require("./migration-runner.js");
const migration_analyzer_js_1 = require("./migration-analyzer.js");
const logger_js_1 = require("./logger.js");
const path = require("path");
const program = new command_1.Command();
program
    .name('claude-flow-migrate')
    .description('Migrate existing claude-flow projects to optimized prompts')
    .version('1.0.0');
program
    .command('analyze [path]')
    .description('Analyze existing project for migration readiness')
    .option('-d, --detailed', 'Show detailed analysis')
    .option('-o, --output <file>', 'Output analysis to file')
    .action(async (projectPath = '.', options) => {
    try {
        const analyzer = new migration_analyzer_js_1.MigrationAnalyzer();
        const analysis = await analyzer.analyze(path.resolve(projectPath));
        if (options.output) {
            await analyzer.saveAnalysis(analysis, options.output);
            logger_js_1.logger.success(`Analysis saved to ${options.output}`);
        }
        analyzer.printAnalysis(analysis, options.detailed);
    }
    catch (error) {
        logger_js_1.logger.error('Analysis failed:', error);
        process.exit(1);
    }
});
program
    .command('migrate [path]')
    .description('Migrate project to optimized prompts')
    .option('-s, --strategy <type>', 'Migration strategy: full, selective, merge', 'selective')
    .option('-b, --backup <dir>', 'Backup directory', '.claude-backup')
    .option('-f, --force', 'Force migration without prompts')
    .option('--dry-run', 'Simulate migration without making changes')
    .option('--preserve-custom', 'Preserve custom commands and configurations')
    .option('--skip-validation', 'Skip post-migration validation')
    .action(async (projectPath = '.', options) => {
    try {
        const runner = new migration_runner_js_1.MigrationRunner({
            projectPath: path.resolve(projectPath),
            strategy: options.strategy,
            backupDir: options.backup,
            force: options.force,
            dryRun: options.dryRun,
            preserveCustom: options.preserveCustom,
            skipValidation: options.skipValidation
        });
        await runner.run();
    }
    catch (error) {
        logger_js_1.logger.error('Migration failed:', error);
        process.exit(1);
    }
});
program
    .command('rollback [path]')
    .description('Rollback to previous configuration')
    .option('-b, --backup <dir>', 'Backup directory to restore from', '.claude-backup')
    .option('-t, --timestamp <time>', 'Restore from specific timestamp')
    .option('-f, --force', 'Force rollback without prompts')
    .action(async (projectPath = '.', options) => {
    try {
        const runner = new migration_runner_js_1.MigrationRunner({
            projectPath: path.resolve(projectPath),
            strategy: 'full',
            backupDir: options.backup,
            force: options.force
        });
        await runner.rollback(options.timestamp);
    }
    catch (error) {
        logger_js_1.logger.error('Rollback failed:', error);
        process.exit(1);
    }
});
program
    .command('validate [path]')
    .description('Validate migration was successful')
    .option('-v, --verbose', 'Show detailed validation results')
    .action(async (projectPath = '.', options) => {
    try {
        const runner = new migration_runner_js_1.MigrationRunner({
            projectPath: path.resolve(projectPath),
            strategy: 'full'
        });
        const isValid = await runner.validate(options.verbose);
        if (isValid) {
            logger_js_1.logger.success('Migration validated successfully!');
        }
        else {
            logger_js_1.logger.error('Migration validation failed');
            process.exit(1);
        }
    }
    catch (error) {
        logger_js_1.logger.error('Validation failed:', error);
        process.exit(1);
    }
});
program
    .command('list-backups [path]')
    .description('List available backups')
    .option('-b, --backup <dir>', 'Backup directory', '.claude-backup')
    .action(async (projectPath = '.', options) => {
    try {
        const runner = new migration_runner_js_1.MigrationRunner({
            projectPath: path.resolve(projectPath),
            strategy: 'full',
            backupDir: options.backup
        });
        await runner.listBackups();
    }
    catch (error) {
        logger_js_1.logger.error('Failed to list backups:', error);
        process.exit(1);
    }
});
// Show help if no command provided
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
program.parse(process.argv);
