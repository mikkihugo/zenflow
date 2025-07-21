#!/usr/bin/env node
"use strict";
/**
 * Hive Mind Stop Command
 *
 * Stop active swarm sessions and terminate child processes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = require("chalk");
const session_manager_js_1 = require("../../simple-commands/hive-mind/session-manager.js");
const inquirer_1 = require("inquirer");
exports.stopCommand = new commander_1.Command('stop')
    .description('Stop active hive mind sessions')
    .option('-s, --session <id>', 'Stop specific session by ID')
    .option('-a, --all', 'Stop all active sessions')
    .option('-f, --force', 'Force stop without confirmation')
    .action(async (options) => {
    const sessionManager = new session_manager_js_1.HiveMindSessionManager();
    try {
        if (options.all) {
            // Stop all active sessions
            const sessions = sessionManager.getActiveSessionsWithProcessInfo();
            if (sessions.length === 0) {
                console.log(chalk_1.default.yellow('No active sessions found'));
                return;
            }
            if (!options.force) {
                const { confirm } = await inquirer_1.default.prompt([{
                        type: 'confirm',
                        name: 'confirm',
                        message: `Stop all ${sessions.length} active session(s)?`,
                        default: false
                    }]);
                if (!confirm) {
                    console.log(chalk_1.default.gray('Operation cancelled'));
                    return;
                }
            }
            for (const session of sessions) {
                console.log(chalk_1.default.cyan(`Stopping session ${session.id}...`));
                await sessionManager.stopSession(session.id);
                console.log(chalk_1.default.green(`✓ Session ${session.id} stopped`));
            }
            console.log(chalk_1.default.green(`\n✅ All sessions stopped successfully`));
        }
        else if (options.session) {
            // Stop specific session
            const sessionId = options.session;
            const session = sessionManager.getSession(sessionId);
            if (!session) {
                console.log(chalk_1.default.red(`Session ${sessionId} not found`));
                return;
            }
            if (session.status === 'stopped') {
                console.log(chalk_1.default.yellow(`Session ${sessionId} is already stopped`));
                return;
            }
            if (!options.force) {
                const { confirm } = await inquirer_1.default.prompt([{
                        type: 'confirm',
                        name: 'confirm',
                        message: `Stop session ${sessionId} (${session.swarm_name})?`,
                        default: false
                    }]);
                if (!confirm) {
                    console.log(chalk_1.default.gray('Operation cancelled'));
                    return;
                }
            }
            console.log(chalk_1.default.cyan(`Stopping session ${sessionId}...`));
            await sessionManager.stopSession(sessionId);
            console.log(chalk_1.default.green(`✓ Session ${sessionId} stopped successfully`));
        }
        else {
            // Interactive selection
            const sessions = sessionManager.getActiveSessionsWithProcessInfo();
            if (sessions.length === 0) {
                console.log(chalk_1.default.yellow('No active sessions found'));
                return;
            }
            const { sessionId } = await inquirer_1.default.prompt([{
                    type: 'list',
                    name: 'sessionId',
                    message: 'Select session to stop:',
                    choices: sessions.map(s => ({
                        name: `${s.swarm_name} (${s.id}) - ${s.total_processes} process(es)`,
                        value: s.id
                    }))
                }]);
            const { confirm } = await inquirer_1.default.prompt([{
                    type: 'confirm',
                    name: 'confirm',
                    message: 'Stop this session?',
                    default: false
                }]);
            if (!confirm) {
                console.log(chalk_1.default.gray('Operation cancelled'));
                return;
            }
            console.log(chalk_1.default.cyan(`Stopping session ${sessionId}...`));
            await sessionManager.stopSession(sessionId);
            console.log(chalk_1.default.green(`✓ Session stopped successfully`));
        }
        // Clean up orphaned processes
        const cleanedCount = sessionManager.cleanupOrphanedProcesses();
        if (cleanedCount > 0) {
            console.log(chalk_1.default.blue(`\nCleaned up ${cleanedCount} orphaned session(s)`));
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('Error stopping session:'), error.message);
        process.exit(1);
    }
    finally {
        sessionManager.close();
    }
});
