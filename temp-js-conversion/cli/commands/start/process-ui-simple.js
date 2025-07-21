"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessUI = void 0;
/**
 * Simplified Process UI without keypress dependency
 * Uses basic stdin reading for compatibility
 */
const chalk_1 = require("chalk");
const types_js_1 = require("./types.js");
class ProcessUI {
    constructor(processManager) {
        this.running = false;
        this.selectedIndex = 0;
        this.processManager = processManager;
        this.setupEventListeners();
    }
    setupEventListeners() {
        this.processManager.on('statusChanged', ({ processId, status }) => {
            if (this.running) {
                this.render();
            }
        });
        this.processManager.on('processError', ({ processId, error }) => {
            if (this.running) {
                console.log(chalk_1.default.red(`\nProcess ${processId} error: ${(error instanceof Error ? error.message : String(error))}`));
            }
        });
    }
    async start() {
        this.running = true;
        // Clear screen
        console.clear();
        // Initial render
        this.render();
        // Simple input loop
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        while (this.running) {
            // Show prompt
            await Deno.stdout.write(encoder.encode('\nCommand: '));
            // Read single character
            const buf = new Uint8Array(1024);
            const n = await Deno.stdin.read(buf);
            if (n === null)
                break;
            const input = decoder.decode(buf.subarray(0, n)).trim();
            if (input.length > 0) {
                await this.handleCommand(input);
            }
        }
    }
    async stop() {
        this.running = false;
        console.clear();
    }
    async handleCommand(input) {
        const processes = this.processManager.getAllProcesses();
        switch (input.toLowerCase()) {
            case 'q':
            case 'quit':
            case 'exit':
                await this.handleExit();
                break;
            case 'a':
            case 'all':
                await this.startAll();
                break;
            case 'z':
            case 'stop-all':
                await this.stopAll();
                break;
            case 'r':
            case 'refresh':
                this.render();
                break;
            case 'h':
            case 'help':
            case '?':
                this.showHelp();
                break;
            default:
                // Check if it's a number (process selection)
                const num = parseInt(input);
                if (!isNaN(num) && num >= 1 && num <= processes.length) {
                    this.selectedIndex = num - 1;
                    await this.showProcessMenu(processes[this.selectedIndex]);
                }
                else {
                    console.log(chalk_1.default.yellow('Invalid command. Type "h" for help.'));
                }
                break;
        }
    }
    render() {
        console.clear();
        const processes = this.processManager.getAllProcesses();
        const stats = this.processManager.getSystemStats();
        // Header
        console.log(chalk_1.default.cyan.bold('🧠 Claude-Flow Process Manager'));
        console.log(chalk_1.default.gray('─'.repeat(60)));
        // System stats
        console.log(chalk_1.default.white('System Status:'), chalk_1.default.green(`${stats.runningProcesses}/${stats.totalProcesses} running`));
        if (stats.errorProcesses > 0) {
            console.log(chalk_1.default.red(`⚠️  ${stats.errorProcesses} processes with errors`));
        }
        console.log();
        // Process list
        console.log(chalk_1.default.white.bold('Processes:'));
        console.log(chalk_1.default.gray('─'.repeat(60)));
        processes.forEach((process, index) => {
            const num = `[${index + 1}]`.padEnd(4);
            const status = this.getStatusDisplay(process.status);
            const name = process.name.padEnd(25);
            console.log(`${chalk_1.default.gray(num)} ${status} ${chalk_1.default.white(name)}`);
            if (process.metrics?.lastError) {
                console.log(chalk_1.default.red(`       Error: ${process.metrics.lastError}`));
            }
        });
        // Footer
        console.log(chalk_1.default.gray('─'.repeat(60)));
        console.log(chalk_1.default.gray('Commands: [1-9] Select process [a] Start All [z] Stop All'));
        console.log(chalk_1.default.gray('[r] Refresh [h] Help [q] Quit'));
    }
    async showProcessMenu(process) {
        console.log();
        console.log(chalk_1.default.cyan.bold(`Selected: ${process.name}`));
        console.log(chalk_1.default.gray('─'.repeat(40)));
        if (process.status === types_js_1.ProcessStatus.STOPPED) {
            console.log('[s] Start');
        }
        else if (process.status === types_js_1.ProcessStatus.RUNNING) {
            console.log('[x] Stop');
            console.log('[r] Restart');
        }
        console.log('[d] Details');
        console.log('[c] Cancel');
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        await Deno.stdout.write(encoder.encode('\nAction: '));
        const buf = new Uint8Array(1024);
        const n = await Deno.stdin.read(buf);
        if (n === null)
            return;
        const action = decoder.decode(buf.subarray(0, n)).trim().toLowerCase();
        switch (action) {
            case 's':
                if (process.status === types_js_1.ProcessStatus.STOPPED) {
                    await this.startProcess(process.id);
                }
                break;
            case 'x':
                if (process.status === types_js_1.ProcessStatus.RUNNING) {
                    await this.stopProcess(process.id);
                }
                break;
            case 'r':
                if (process.status === types_js_1.ProcessStatus.RUNNING) {
                    await this.restartProcess(process.id);
                }
                break;
            case 'd':
                this.showProcessDetails(process);
                await this.waitForKey();
                break;
        }
        this.render();
    }
    showProcessDetails(process) {
        console.log();
        console.log(chalk_1.default.cyan.bold(`📋 Process Details: ${process.name}`));
        console.log(chalk_1.default.gray('─'.repeat(60)));
        console.log(chalk_1.default.white('ID:'), process.id);
        console.log(chalk_1.default.white('Type:'), process.type);
        console.log(chalk_1.default.white('Status:'), this.getStatusDisplay(process.status), process.status);
        if (process.pid) {
            console.log(chalk_1.default.white('PID:'), process.pid);
        }
        if (process.startTime) {
            const uptime = Date.now() - process.startTime;
            console.log(chalk_1.default.white('Uptime:'), this.formatUptime(uptime));
        }
        if (process.metrics) {
            console.log();
            console.log(chalk_1.default.white.bold('Metrics:'));
            if (process.metrics.cpu !== undefined) {
                console.log(chalk_1.default.white('CPU:'), `${process.metrics.cpu.toFixed(1)}%`);
            }
            if (process.metrics.memory !== undefined) {
                console.log(chalk_1.default.white('Memory:'), `${process.metrics.memory.toFixed(0)} MB`);
            }
            if (process.metrics.restarts !== undefined) {
                console.log(chalk_1.default.white('Restarts:'), process.metrics.restarts);
            }
            if (process.metrics.lastError) {
                console.log(chalk_1.default.red('Last Error:'), process.metrics.lastError);
            }
        }
        console.log();
        console.log(chalk_1.default.gray('Press any key to continue...'));
    }
    async waitForKey() {
        const buf = new Uint8Array(1);
        await Deno.stdin.read(buf);
    }
    getStatusDisplay(status) {
        switch (status) {
            case types_js_1.ProcessStatus.RUNNING:
                return chalk_1.default.green('●');
            case types_js_1.ProcessStatus.STOPPED:
                return chalk_1.default.gray('○');
            case types_js_1.ProcessStatus.STARTING:
                return chalk_1.default.yellow('◐');
            case types_js_1.ProcessStatus.STOPPING:
                return chalk_1.default.yellow('◑');
            case types_js_1.ProcessStatus.ERROR:
                return chalk_1.default.red('✗');
            case types_js_1.ProcessStatus.CRASHED:
                return chalk_1.default.red('☠');
            default:
                return chalk_1.default.gray('?');
        }
    }
    formatUptime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (days > 0) {
            return `${days}d ${hours % 24}h`;
        }
        else if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        }
        else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        }
        else {
            return `${seconds}s`;
        }
    }
    showHelp() {
        console.log();
        console.log(chalk_1.default.cyan.bold('🧠 Claude-Flow Process Manager - Help'));
        console.log(chalk_1.default.gray('─'.repeat(60)));
        console.log();
        console.log(chalk_1.default.white.bold('Commands:'));
        console.log('  1-9     - Select process by number');
        console.log('  a       - Start all processes');
        console.log('  z       - Stop all processes');
        console.log('  r       - Refresh display');
        console.log('  h/?     - Show this help');
        console.log('  q       - Quit');
        console.log();
        console.log(chalk_1.default.white.bold('Process Actions:'));
        console.log('  s       - Start selected process');
        console.log('  x       - Stop selected process');
        console.log('  r       - Restart selected process');
        console.log('  d       - Show process details');
        console.log();
        console.log(chalk_1.default.gray('Press any key to continue...'));
    }
    async startProcess(processId) {
        try {
            console.log(chalk_1.default.yellow(`Starting ${processId}...`));
            await this.processManager.startProcess(processId);
            console.log(chalk_1.default.green(`✓ Started ${processId}`));
        }
        catch (error) {
            console.log(chalk_1.default.red(`✗ Failed to start ${processId}: ${error.message}`));
        }
        await this.waitForKey();
    }
    async stopProcess(processId) {
        try {
            console.log(chalk_1.default.yellow(`Stopping ${processId}...`));
            await this.processManager.stopProcess(processId);
            console.log(chalk_1.default.green(`✓ Stopped ${processId}`));
        }
        catch (error) {
            console.log(chalk_1.default.red(`✗ Failed to stop ${processId}: ${error.message}`));
        }
        await this.waitForKey();
    }
    async restartProcess(processId) {
        try {
            console.log(chalk_1.default.yellow(`Restarting ${processId}...`));
            await this.processManager.restartProcess(processId);
            console.log(chalk_1.default.green(`✓ Restarted ${processId}`));
        }
        catch (error) {
            console.log(chalk_1.default.red(`✗ Failed to restart ${processId}: ${error.message}`));
        }
        await this.waitForKey();
    }
    async startAll() {
        try {
            console.log(chalk_1.default.yellow('Starting all processes...'));
            await this.processManager.startAll();
            console.log(chalk_1.default.green('✓ All processes started'));
        }
        catch (error) {
            console.log(chalk_1.default.red(`✗ Failed to start all: ${error.message}`));
        }
        await this.waitForKey();
        this.render();
    }
    async stopAll() {
        try {
            console.log(chalk_1.default.yellow('Stopping all processes...'));
            await this.processManager.stopAll();
            console.log(chalk_1.default.green('✓ All processes stopped'));
        }
        catch (error) {
            console.log(chalk_1.default.red(`✗ Failed to stop all: ${error.message}`));
        }
        await this.waitForKey();
        this.render();
    }
    async handleExit() {
        const processes = this.processManager.getAllProcesses();
        const hasRunning = processes.some(p => p.status === types_js_1.ProcessStatus.RUNNING);
        if (hasRunning) {
            console.log();
            console.log(chalk_1.default.yellow('⚠️  Some processes are still running.'));
            console.log('Stop all processes before exiting? [y/N]: ');
            const decoder = new TextDecoder();
            const buf = new Uint8Array(1024);
            const n = await Deno.stdin.read(buf);
            if (n && decoder.decode(buf.subarray(0, n)).trim().toLowerCase() === 'y') {
                await this.stopAll();
            }
        }
        await this.stop();
    }
}
exports.ProcessUI = ProcessUI;
