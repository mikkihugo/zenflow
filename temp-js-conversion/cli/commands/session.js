"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionCommand = void 0;
/**
 * Session management commands for Claude-Flow
 */
const commander_1 = require("commander");
const node_fs_1 = require("node:fs");
const cli_table3_1 = require("cli-table3");
const inquirer_1 = require("inquirer");
const formatter_js_1 = require("../formatter.js");
const helpers_js_1 = require("../../utils/helpers.js");
const chalk_1 = require("chalk");
exports.sessionCommand = new commander_1.Command()
    .name('session')
    .description('Manage Claude-Flow sessions')
    .action(() => {
    exports.sessionCommand.help();
});
// List command
exports.sessionCommand
    .command('list')
    .description('List all saved sessions')
    .option('-a, --active', 'Show only active sessions')
    .option('--format <format>', 'Output format (table, json)', 'table')
    .action(async (options) => {
    await listSessions(options);
});
// Save command
exports.sessionCommand
    .command('save')
    .description('Save current session state')
    .arguments('[name]')
    .option('-d, --description <desc>', 'Session description')
    .option('-t, --tags <tags>', 'Comma-separated tags')
    .option('--auto', 'Auto-generate session name')
    .action(async (name, options) => {
    await saveSession(name, options);
});
// Restore command
exports.sessionCommand
    .command('restore')
    .description('Restore a saved session')
    .arguments('<session-id>')
    .option('-f, --force', 'Force restore without confirmation')
    .option('--merge', 'Merge with current session instead of replacing')
    .action(async (sessionId, options) => {
    await restoreSession(sessionId, options);
});
// Delete command
exports.sessionCommand
    .command('delete')
    .description('Delete a saved session')
    .arguments('<session-id>')
    .option('-f, --force', 'Skip confirmation prompt')
    .action(async (sessionId, options) => {
    await deleteSession(sessionId, options);
});
// Export command
exports.sessionCommand
    .command('export')
    .description('Export session to file')
    .arguments('<session-id> <output-file>')
    .option('--format <format>', 'Export format (json, yaml)', 'json')
    .option('--include-memory', 'Include agent memory in export')
    .action(async (sessionId, outputFile, options) => {
    await exportSession(sessionId, outputFile, options);
});
// Import command
exports.sessionCommand
    .command('import')
    .description('Import session from file')
    .arguments('<input-file>')
    .option('-n, --name <name>', 'Custom session name')
    .option('--overwrite', 'Overwrite existing session with same ID')
    .action(async (inputFile, options) => {
    await importSession(inputFile, options);
});
// Info command
exports.sessionCommand
    .command('info')
    .description('Show detailed session information')
    .arguments('<session-id>')
    .action(async (sessionId, options) => {
    await showSessionInfo(sessionId);
});
// Clean command
exports.sessionCommand
    .command('clean')
    .description('Clean up old or orphaned sessions')
    .option('--older-than <days>', 'Delete sessions older than N days', '30')
    .option('--dry-run', 'Show what would be deleted without deleting')
    .option('--orphaned', 'Only clean orphaned sessions')
    .action(async (options) => {
    await cleanSessions(options);
});
const SESSION_DIR = '.claude-flow/sessions';
async function ensureSessionDir() {
    try {
        await node_fs_1.promises.mkdir(SESSION_DIR, { recursive: true });
    }
    catch (error) {
        if (error.code !== 'EEXIST') {
            throw error;
        }
    }
}
async function listSessions(options) {
    try {
        await ensureSessionDir();
        const sessions = await loadAllSessions();
        let filteredSessions = sessions;
        if (options.active) {
            // In production, this would check if the session is currently active
            filteredSessions = sessions.filter(s => s.metadata.active);
        }
        if (options.format === 'json') {
            console.log(JSON.stringify(filteredSessions, null, 2));
            return;
        }
        if (filteredSessions.length === 0) {
            console.log(chalk_1.default.gray('No sessions found'));
            return;
        }
        console.log(chalk_1.default.cyan.bold(`Sessions (${filteredSessions.length})`));
        console.log('─'.repeat(60));
        const rows = [];
        for (const session of filteredSessions) {
            rows.push([
                chalk_1.default.gray(session.id.substring(0, 8) + '...'),
                chalk_1.default.white(session.name),
                session.description ? session.description.substring(0, 30) + (session.description.length > 30 ? '...' : '') : '-',
                session.state.agents.length.toString(),
                session.state.tasks.length.toString(),
                session.createdAt.toLocaleDateString()
            ]);
        }
        const table = new cli_table3_1.default({
            head: ['ID', 'Name', 'Description', 'Agents', 'Tasks', 'Created']
        });
        for (const row of rows) {
            table.push(row);
        }
        console.log(table.toString());
    }
    catch (error) {
        console.error(chalk_1.default.red('Failed to list sessions:'), error.message);
    }
}
async function saveSession(name, options) {
    try {
        // Get current session state (mock for now)
        const currentState = await getCurrentSessionState();
        if (!name) {
            if (options.auto) {
                name = `session-${new Date().toISOString().split('T')[0]}-${Date.now().toString().slice(-4)}`;
            }
            else {
                const response = await inquirer_1.default.prompt({
                    type: 'input',
                    name: 'sessionName',
                    message: 'Enter session name:',
                    default: `session-${new Date().toISOString().split('T')[0]}`,
                });
                name = response.sessionName;
            }
        }
        const session = {
            id: (0, helpers_js_1.generateId)('session'),
            name: name,
            description: options.description,
            tags: options.tags ? options.tags.split(',').map((t) => t.trim()) : [],
            createdAt: new Date(),
            updatedAt: new Date(),
            state: currentState,
            metadata: {
                version: '1.0.0',
                platform: process.platform,
                checksum: await calculateChecksum(currentState)
            }
        };
        await ensureSessionDir();
        const filePath = `${SESSION_DIR}/${session.id}.json`;
        await node_fs_1.promises.writeFile(filePath, JSON.stringify(session, null, 2));
        console.log(chalk_1.default.green('✓ Session saved successfully'));
        console.log(`${chalk_1.default.white('ID:')} ${session.id}`);
        console.log(`${chalk_1.default.white('Name:')} ${session.name}`);
        console.log(`${chalk_1.default.white('File:')} ${filePath}`);
        if (session.description) {
            console.log(`${chalk_1.default.white('Description:')} ${session.description}`);
        }
        console.log(`${chalk_1.default.white('Agents:')} ${session.state.agents.length}`);
        console.log(`${chalk_1.default.white('Tasks:')} ${session.state.tasks.length}`);
    }
    catch (error) {
        console.error(chalk_1.default.red('Failed to save session:'), error.message);
    }
}
async function restoreSession(sessionId, options) {
    try {
        const session = await loadSession(sessionId);
        if (!session) {
            console.error(chalk_1.default.red(`Session '${sessionId}' not found`));
            return;
        }
        // Show session info
        console.log(chalk_1.default.cyan.bold('Session to restore:'));
        console.log(`${chalk_1.default.white('Name:')} ${session.name}`);
        console.log(`${chalk_1.default.white('Description:')} ${session.description || 'None'}`);
        console.log(`${chalk_1.default.white('Agents:')} ${session.state.agents.length}`);
        console.log(`${chalk_1.default.white('Tasks:')} ${session.state.tasks.length}`);
        console.log(`${chalk_1.default.white('Created:')} ${session.createdAt.toLocaleString()}`);
        // Confirmation
        if (!options.force) {
            const action = options.merge ? 'merge with current session' : 'replace current session';
            const response = await inquirer_1.default.prompt({
                type: 'confirm',
                name: 'confirmed',
                message: `Are you sure you want to ${action}?`,
                default: false,
            });
            const confirmed = response.confirmed;
            if (!confirmed) {
                console.log(chalk_1.default.gray('Restore cancelled'));
                return;
            }
        }
        // Validate session integrity
        const expectedChecksum = await calculateChecksum(session.state);
        if (session.metadata.checksum !== expectedChecksum) {
            console.log(chalk_1.default.yellow('⚠ Warning: Session checksum mismatch. Data may be corrupted.'));
            if (!options.force) {
                const response = await inquirer_1.default.prompt({
                    type: 'confirm',
                    name: 'proceed',
                    message: 'Continue anyway?',
                    default: false,
                });
                const proceed = response.proceed;
                if (!proceed) {
                    console.log(chalk_1.default.gray('Restore cancelled'));
                    return;
                }
            }
        }
        // Restore session (mock for now)
        console.log(chalk_1.default.yellow('Restoring session...'));
        if (options.merge) {
            console.log(chalk_1.default.blue('• Merging agents...'));
            console.log(chalk_1.default.blue('• Merging tasks...'));
            console.log(chalk_1.default.blue('• Merging memory...'));
        }
        else {
            console.log(chalk_1.default.blue('• Stopping current agents...'));
            console.log(chalk_1.default.blue('• Clearing current tasks...'));
            console.log(chalk_1.default.blue('• Restoring agents...'));
            console.log(chalk_1.default.blue('• Restoring tasks...'));
            console.log(chalk_1.default.blue('• Restoring memory...'));
        }
        // Update session metadata
        session.updatedAt = new Date();
        const filePath = `${SESSION_DIR}/${session.id}.json`;
        await node_fs_1.promises.writeFile(filePath, JSON.stringify(session, null, 2));
        console.log(chalk_1.default.green('✓ Session restored successfully'));
        console.log(chalk_1.default.yellow('Note: This is a mock implementation. In production, this would connect to the orchestrator.'));
    }
    catch (error) {
        console.error(chalk_1.default.red('Failed to restore session:'), error.message);
    }
}
async function deleteSession(sessionId, options) {
    try {
        const session = await loadSession(sessionId);
        if (!session) {
            console.error(chalk_1.default.red(`Session '${sessionId}' not found`));
            return;
        }
        // Confirmation
        if (!options.force) {
            console.log(`${chalk_1.default.white('Session:')} ${session.name}`);
            console.log(`${chalk_1.default.white('Created:')} ${session.createdAt.toLocaleString()}`);
            const response = await inquirer_1.default.prompt({
                type: 'confirm',
                name: 'confirmed',
                message: 'Are you sure you want to delete this session?',
                default: false,
            });
            const confirmed = response.confirmed;
            if (!confirmed) {
                console.log(chalk_1.default.gray('Delete cancelled'));
                return;
            }
        }
        const filePath = `${SESSION_DIR}/${session.id}.json`;
        await node_fs_1.promises.unlink(filePath);
        console.log(chalk_1.default.green('✓ Session deleted successfully'));
    }
    catch (error) {
        console.error(chalk_1.default.red('Failed to delete session:'), error.message);
    }
}
async function exportSession(sessionId, outputFile, options) {
    try {
        const session = await loadSession(sessionId);
        if (!session) {
            console.error(chalk_1.default.red(`Session '${sessionId}' not found`));
            return;
        }
        let exportData = session;
        if (!options.includeMemory) {
            exportData = {
                ...session,
                state: {
                    ...session.state,
                    memory: [] // Exclude memory data
                }
            };
        }
        let content;
        if (options.format === 'yaml') {
            // In production, you'd use a YAML library
            console.log(chalk_1.default.yellow('YAML export not implemented yet, using JSON'));
            content = JSON.stringify(exportData, null, 2);
        }
        else {
            content = JSON.stringify(exportData, null, 2);
        }
        await node_fs_1.promises.writeFile(outputFile, content);
        console.log(chalk_1.default.green('✓ Session exported successfully'));
        console.log(`${chalk_1.default.white('File:')} ${outputFile}`);
        console.log(`${chalk_1.default.white('Format:')} ${options.format}`);
        console.log(`${chalk_1.default.white('Size:')} ${Buffer.from(content).length} bytes`);
    }
    catch (error) {
        console.error(chalk_1.default.red('Failed to export session:'), error.message);
    }
}
async function importSession(inputFile, options) {
    try {
        const content = await node_fs_1.promises.readFile(inputFile, 'utf-8');
        const sessionData = JSON.parse(content);
        // Validate session data structure
        if (!sessionData.id || !sessionData.name || !sessionData.state) {
            throw new Error('Invalid session file format');
        }
        // Generate new ID if not overwriting
        if (!options.overwrite) {
            sessionData.id = (0, helpers_js_1.generateId)('session');
        }
        // Update name if specified
        if (options.name) {
            sessionData.name = options.name;
        }
        // Check if session already exists
        const existingSession = await loadSession(sessionData.id);
        if (existingSession && !options.overwrite) {
            console.error(chalk_1.default.red('Session with this ID already exists'));
            console.log(chalk_1.default.gray('Use --overwrite to replace it'));
            return;
        }
        // Update timestamps
        if (options.overwrite && existingSession) {
            sessionData.updatedAt = new Date();
        }
        else {
            sessionData.createdAt = new Date();
            sessionData.updatedAt = new Date();
        }
        await ensureSessionDir();
        const filePath = `${SESSION_DIR}/${sessionData.id}.json`;
        await node_fs_1.promises.writeFile(filePath, JSON.stringify(sessionData, null, 2));
        console.log(chalk_1.default.green('✓ Session imported successfully'));
        console.log(`${chalk_1.default.white('ID:')} ${sessionData.id}`);
        console.log(`${chalk_1.default.white('Name:')} ${sessionData.name}`);
        console.log(`${chalk_1.default.white('Action:')} ${options.overwrite ? 'Overwritten' : 'Created'}`);
    }
    catch (error) {
        console.error(chalk_1.default.red('Failed to import session:'), error.message);
    }
}
async function showSessionInfo(sessionId) {
    try {
        const session = await loadSession(sessionId);
        if (!session) {
            console.error(chalk_1.default.red(`Session '${sessionId}' not found`));
            return;
        }
        console.log(chalk_1.default.cyan.bold('Session Information'));
        console.log('─'.repeat(40));
        console.log(`${chalk_1.default.white('ID:')} ${session.id}`);
        console.log(`${chalk_1.default.white('Name:')} ${session.name}`);
        console.log(`${chalk_1.default.white('Description:')} ${session.description || 'None'}`);
        console.log(`${chalk_1.default.white('Tags:')} ${session.tags.join(', ') || 'None'}`);
        console.log(`${chalk_1.default.white('Created:')} ${session.createdAt.toLocaleString()}`);
        console.log(`${chalk_1.default.white('Updated:')} ${session.updatedAt.toLocaleString()}`);
        console.log();
        console.log(chalk_1.default.cyan.bold('State Summary'));
        console.log('─'.repeat(40));
        console.log(`${chalk_1.default.white('Agents:')} ${session.state.agents.length}`);
        console.log(`${chalk_1.default.white('Tasks:')} ${session.state.tasks.length}`);
        console.log(`${chalk_1.default.white('Memory Entries:')} ${session.state.memory.length}`);
        console.log();
        console.log(chalk_1.default.cyan.bold('Metadata'));
        console.log('─'.repeat(40));
        console.log(`${chalk_1.default.white('Version:')} ${session.metadata.version}`);
        console.log(`${chalk_1.default.white('Platform:')} ${session.metadata.platform}`);
        console.log(`${chalk_1.default.white('Checksum:')} ${session.metadata.checksum}`);
        // Verify integrity
        const currentChecksum = await calculateChecksum(session.state);
        const integrity = currentChecksum === session.metadata.checksum;
        const integrityIcon = (0, formatter_js_1.formatStatusIndicator)(integrity ? 'success' : 'error');
        console.log(`${chalk_1.default.white('Integrity:')} ${integrityIcon} ${integrity ? 'Valid' : 'Corrupted'}`);
        // File info
        const filePath = `${SESSION_DIR}/${session.id}.json`;
        try {
            const fileInfo = await node_fs_1.promises.stat(filePath);
            console.log();
            console.log(chalk_1.default.cyan.bold('File Information'));
            console.log('─'.repeat(40));
            console.log(`${chalk_1.default.white('Path:')} ${filePath}`);
            console.log(`${chalk_1.default.white('Size:')} ${fileInfo.size} bytes`);
            console.log(`${chalk_1.default.white('Modified:')} ${fileInfo.mtime?.toLocaleString() || 'Unknown'}`);
        }
        catch {
            console.log(chalk_1.default.red('Warning: Session file not found'));
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('Failed to show session info:'), error.message);
    }
}
async function cleanSessions(options) {
    try {
        await ensureSessionDir();
        const sessions = await loadAllSessions();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(options.olderThan));
        let toDelete = sessions.filter(session => session.createdAt < cutoffDate);
        if (options.orphaned) {
            // In production, check if sessions have valid references
            toDelete = toDelete.filter(session => session.metadata.orphaned);
        }
        if (toDelete.length === 0) {
            console.log(chalk_1.default.gray('No sessions to clean'));
            return;
        }
        console.log(chalk_1.default.cyan.bold(`Sessions to clean (${toDelete.length})`));
        console.log('─'.repeat(50));
        for (const session of toDelete) {
            const age = Math.floor((Date.now() - session.createdAt.getTime()) / (1000 * 60 * 60 * 24));
            console.log(`• ${session.name} (${chalk_1.default.gray(session.id.substring(0, 8) + '...')}) - ${age} days old`);
        }
        if (options.dryRun) {
            console.log('\n' + chalk_1.default.yellow('Dry run mode - no files were deleted'));
            return;
        }
        console.log();
        const response = await inquirer_1.default.prompt({
            type: 'confirm',
            name: 'confirmed',
            message: `Delete ${toDelete.length} sessions?`,
            default: false,
        });
        const confirmed = response.confirmed;
        if (!confirmed) {
            console.log(chalk_1.default.gray('Clean cancelled'));
            return;
        }
        let deleted = 0;
        for (const session of toDelete) {
            try {
                const filePath = `${SESSION_DIR}/${session.id}.json`;
                await node_fs_1.promises.unlink(filePath);
                deleted++;
            }
            catch (error) {
                console.error(chalk_1.default.red(`Failed to delete ${session.name}:`), error.message);
            }
        }
        console.log(chalk_1.default.green(`✓ Cleaned ${deleted} sessions`));
    }
    catch (error) {
        console.error(chalk_1.default.red('Failed to clean sessions:'), error.message);
    }
}
async function loadAllSessions() {
    const sessions = [];
    try {
        const entries = await node_fs_1.promises.readdir(SESSION_DIR, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isFile() && entry.name.endsWith('.json')) {
                try {
                    const content = await node_fs_1.promises.readFile(`${SESSION_DIR}/${entry.name}`, 'utf-8');
                    const session = JSON.parse(content);
                    // Convert date strings back to Date objects
                    session.createdAt = new Date(session.createdAt);
                    session.updatedAt = new Date(session.updatedAt);
                    sessions.push(session);
                }
                catch (error) {
                    console.warn(chalk_1.default.yellow(`Warning: Failed to load session file ${entry.name}:`), error.message);
                }
            }
        }
    }
    catch (error) {
        if (error.code !== 'ENOENT') {
            throw error;
        }
    }
    return sessions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}
async function loadSession(sessionId) {
    const sessions = await loadAllSessions();
    return sessions.find(s => s.id === sessionId || s.id.startsWith(sessionId)) || null;
}
async function getCurrentSessionState() {
    // Mock current session state - in production, this would connect to the orchestrator
    return {
        agents: [
            { id: 'agent-001', type: 'coordinator', status: 'active' },
            { id: 'agent-002', type: 'researcher', status: 'active' }
        ],
        tasks: [
            { id: 'task-001', type: 'research', status: 'running' },
            { id: 'task-002', type: 'analysis', status: 'pending' }
        ],
        memory: [
            { id: 'memory-001', type: 'conversation', agentId: 'agent-001' },
            { id: 'memory-002', type: 'result', agentId: 'agent-002' }
        ],
        configuration: {
            orchestrator: { maxAgents: 10 },
            memory: { backend: 'hybrid' }
        }
    };
}
async function calculateChecksum(data) {
    const content = JSON.stringify(data, null, 0);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
}
