#!/usr/bin/env node
"use strict";
/**
 * Hive Mind PS (Process Status) Command
 *
 * Show active sessions and their processes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.psCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = require("chalk");
const session_manager_js_1 = require("../../simple-commands/hive-mind/session-manager.js");
const cli_table3_1 = require("cli-table3");
exports.psCommand = new commander_1.Command('ps')
    .description('Show active hive mind sessions and processes')
    .option('-a, --all', 'Show all sessions including stopped ones')
    .option('-v, --verbose', 'Show detailed process information')
    .action(async (options) => {
    const sessionManager = new session_manager_js_1.HiveMindSessionManager();
    try {
        const sessions = options.all
            ? sessionManager.getActiveSessionsWithProcessInfo()
            : sessionManager.getActiveSessionsWithProcessInfo().filter(s => s.status === 'active' || s.status === 'paused');
        if (sessions.length === 0) {
            console.log(chalk_1.default.yellow('No sessions found'));
            return;
        }
        // Clean up orphaned processes first
        const cleanedCount = sessionManager.cleanupOrphanedProcesses();
        if (cleanedCount > 0) {
            console.log(chalk_1.default.blue(`Cleaned up ${cleanedCount} orphaned session(s)\n`));
        }
        // Create table
        const table = new cli_table3_1.default({
            head: [
                chalk_1.default.cyan('Session ID'),
                chalk_1.default.cyan('Swarm'),
                chalk_1.default.cyan('Status'),
                chalk_1.default.cyan('Parent PID'),
                chalk_1.default.cyan('Child PIDs'),
                chalk_1.default.cyan('Progress'),
                chalk_1.default.cyan('Duration')
            ],
            style: {
                head: [],
                border: ['gray']
            }
        });
        for (const session of sessions) {
            const duration = new Date() - new Date(session.created_at);
            const durationStr = formatDuration(duration);
            const statusColor = session.status === 'active' ? chalk_1.default.green :
                session.status === 'paused' ? chalk_1.default.yellow :
                    session.status === 'stopped' ? chalk_1.default.red :
                        chalk_1.default.gray;
            table.push([
                session.id.substring(0, 20) + '...',
                session.swarm_name,
                statusColor(session.status),
                session.parent_pid || '-',
                session.child_pids.length > 0 ? session.child_pids.join(', ') : '-',
                `${session.completion_percentage}%`,
                durationStr
            ]);
        }
        console.log(table.toString());
        if (options.verbose) {
            console.log('\n' + chalk_1.default.bold('Detailed Session Information:'));
            for (const session of sessions) {
                console.log('\n' + chalk_1.default.cyan(`Session: ${session.id}`));
                console.log(chalk_1.default.gray(`  Objective: ${session.objective || 'N/A'}`));
                console.log(chalk_1.default.gray(`  Created: ${new Date(session.created_at).toLocaleString()}`));
                console.log(chalk_1.default.gray(`  Updated: ${new Date(session.updated_at).toLocaleString()}`));
                if (session.paused_at) {
                    console.log(chalk_1.default.gray(`  Paused: ${new Date(session.paused_at).toLocaleString()}`));
                }
                console.log(chalk_1.default.gray(`  Agents: ${session.agent_count || 0}`));
                console.log(chalk_1.default.gray(`  Tasks: ${session.task_count || 0} (${session.completed_tasks || 0} completed)`));
                if (session.child_pids.length > 0) {
                    console.log(chalk_1.default.gray(`  Active Processes:`));
                    for (const pid of session.child_pids) {
                        console.log(chalk_1.default.gray(`    - PID ${pid}`));
                    }
                }
            }
        }
        // Summary
        const activeSessions = sessions.filter(s => s.status === 'active').length;
        const pausedSessions = sessions.filter(s => s.status === 'paused').length;
        const totalProcesses = sessions.reduce((sum, s) => sum + s.total_processes, 0);
        console.log('\n' + chalk_1.default.bold('Summary:'));
        console.log(chalk_1.default.gray(`  Active sessions: ${activeSessions}`));
        console.log(chalk_1.default.gray(`  Paused sessions: ${pausedSessions}`));
        console.log(chalk_1.default.gray(`  Total processes: ${totalProcesses}`));
    }
    catch (error) {
        console.error(chalk_1.default.red('Error listing sessions:'), error.message);
        process.exit(1);
    }
    finally {
        sessionManager.close();
    }
});
function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    }
    else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    }
    else {
        return `${seconds}s`;
    }
}
