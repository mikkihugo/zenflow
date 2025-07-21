#!/usr/bin/env node
"use strict";
/**
 * Hive Mind Pause Command
 *
 * Pause active swarm sessions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.pauseCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = require("chalk");
const session_manager_js_1 = require("../../simple-commands/hive-mind/session-manager.js");
const inquirer_1 = require("inquirer");
exports.pauseCommand = new commander_1.Command('pause')
    .description('Pause active hive mind sessions')
    .option('-s, --session <id>', 'Pause specific session by ID')
    .action(async (options) => {
    const sessionManager = new session_manager_js_1.HiveMindSessionManager();
    try {
        if (options.session) {
            // Pause specific session
            const sessionId = options.session;
            const session = sessionManager.getSession(sessionId);
            if (!session) {
                console.log(chalk_1.default.red(`Session ${sessionId} not found`));
                return;
            }
            if (session.status === 'paused') {
                console.log(chalk_1.default.yellow(`Session ${sessionId} is already paused`));
                return;
            }
            if (session.status !== 'active') {
                console.log(chalk_1.default.yellow(`Session ${sessionId} is not active (status: ${session.status})`));
                return;
            }
            console.log(chalk_1.default.cyan(`Pausing session ${sessionId}...`));
            const result = sessionManager.pauseSession(sessionId);
            if (result) {
                console.log(chalk_1.default.green(`✓ Session ${sessionId} paused successfully`));
                console.log(chalk_1.default.gray(`Use 'claude-flow hive-mind resume -s ${sessionId}' to resume`));
            }
            else {
                console.log(chalk_1.default.red(`Failed to pause session ${sessionId}`));
            }
        }
        else {
            // Interactive selection
            const sessions = sessionManager.getActiveSessions().filter(s => s.status === 'active');
            if (sessions.length === 0) {
                console.log(chalk_1.default.yellow('No active sessions found to pause'));
                return;
            }
            const { sessionId } = await inquirer_1.default.prompt([{
                    type: 'list',
                    name: 'sessionId',
                    message: 'Select session to pause:',
                    choices: sessions.map(s => ({
                        name: `${s.swarm_name} (${s.id}) - ${s.completion_percentage}% complete`,
                        value: s.id
                    }))
                }]);
            console.log(chalk_1.default.cyan(`Pausing session ${sessionId}...`));
            const result = sessionManager.pauseSession(sessionId);
            if (result) {
                console.log(chalk_1.default.green(`✓ Session paused successfully`));
                console.log(chalk_1.default.gray(`Use 'claude-flow hive-mind resume -s ${sessionId}' to resume`));
            }
            else {
                console.log(chalk_1.default.red(`Failed to pause session`));
            }
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('Error pausing session:'), error.message);
        process.exit(1);
    }
    finally {
        sessionManager.close();
    }
});
