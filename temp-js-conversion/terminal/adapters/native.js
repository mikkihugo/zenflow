"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NativeAdapter = void 0;
const process = require("node:process");
/**
 * Native terminal adapter implementation
 */
const child_process_1 = require("child_process");
const os_1 = require("os");
const errors_js_1 = require("../../utils/errors.js");
const helpers_js_1 = require("../../utils/helpers.js");
/**
 * Native terminal implementation using Deno subprocess
 */
class NativeTerminal {
    constructor(shell, logger) {
        this.logger = logger;
        this.encoder = new TextEncoder();
        this.decoder = new TextDecoder();
        this.outputBuffer = '';
        this.errorBuffer = '';
        this.outputListeners = new Set();
        this.alive = true;
        this.stdoutData = '';
        this.stderrData = '';
        this.id = (0, helpers_js_1.generateId)('native-term');
        this.shell = shell;
        this.commandMarker = `__CLAUDE_FLOW_${this.id}__`;
    }
    async initialize() {
        try {
            const shellConfig = this.getShellConfig();
            // Start shell process
            this.process = (0, child_process_1.spawn)(shellConfig.path, shellConfig.args, {
                stdio: ['pipe', 'pipe', 'pipe'],
                env: {
                    ...process.env,
                    ...shellConfig.env,
                    CLAUDE_FLOW_TERMINAL: 'true',
                    CLAUDE_FLOW_TERMINAL_ID: this.id,
                },
            });
            // Get PID
            this.pid = this.process.pid;
            // Set up output handlers
            this.setupOutputHandlers();
            // Monitor process status
            this.monitorProcess();
            // Wait for shell to be ready
            await this.waitForReady();
            this.logger.debug('Native terminal initialized', {
                id: this.id,
                pid: this.pid,
                shell: this.shell,
            });
        }
        catch (error) {
            this.alive = false;
            throw new errors_js_1.TerminalError('Failed to create native terminal', { error });
        }
    }
    async executeCommand(command) {
        if (!this.process || !this.isAlive()) {
            throw new errors_js_1.TerminalError('Terminal is not alive');
        }
        try {
            // Create deferred for this command
            this.commandDeferred = (0, helpers_js_1.createDeferred)();
            // Clear output buffer
            this.outputBuffer = '';
            // Send command with marker
            const markedCommand = this.wrapCommand(command);
            await this.write(markedCommand + '\n');
            // Wait for command to complete
            const output = await (0, helpers_js_1.timeout)(this.commandDeferred.promise, 30000, 'Command execution timeout');
            return output;
        }
        catch (error) {
            throw new errors_js_1.TerminalCommandError('Failed to execute command', { command, error });
        }
    }
    async write(data) {
        if (!this.process || !this.isAlive()) {
            throw new errors_js_1.TerminalError('Terminal is not alive');
        }
        return new Promise((resolve, reject) => {
            if (!this.process?.stdin) {
                reject(new errors_js_1.TerminalError('Process stdin not available'));
                return;
            }
            this.process.stdin.write(data, (error) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve();
                }
            });
        });
    }
    async read() {
        if (!this.process || !this.isAlive()) {
            throw new errors_js_1.TerminalError('Terminal is not alive');
        }
        // Return buffered output
        const output = this.outputBuffer;
        this.outputBuffer = '';
        return output;
    }
    isAlive() {
        return this.alive && this.process !== undefined;
    }
    async kill() {
        if (!this.process)
            return;
        try {
            this.alive = false;
            // Close streams
            if (this.process.stdin && !this.process.stdin.destroyed) {
                this.process.stdin.end();
            }
            // Try graceful shutdown first
            try {
                await this.write('exit\n');
                await (0, helpers_js_1.delay)(500);
            }
            catch {
                // Ignore write errors during shutdown
            }
            // Force kill if still alive
            try {
                this.process.kill('SIGTERM');
                await (0, helpers_js_1.delay)(500);
                // Use SIGKILL if SIGTERM didn't work
                if (!this.process.killed) {
                    this.process.kill('SIGKILL');
                }
            }
            catch {
                // Process might already be dead
            }
        }
        catch (error) {
            this.logger.warn('Error killing native terminal', { id: this.id, error });
        }
        finally {
            this.process = undefined;
        }
    }
    /**
     * Add output listener
     */
    addOutputListener(listener) {
        this.outputListeners.add(listener);
    }
    /**
     * Remove output listener
     */
    removeOutputListener(listener) {
        this.outputListeners.delete(listener);
    }
    getShellConfig() {
        const osplatform = (0, os_1.platform)();
        switch (this.shell) {
            case 'bash':
                return {
                    path: osplatform === 'win32' ? 'C:\\Program Files\\Git\\bin\\bash.exe' : '/bin/bash',
                    args: ['--norc', '--noprofile'],
                    env: { PS1: '$ ' },
                };
            case 'zsh':
                return {
                    path: '/bin/zsh',
                    args: ['--no-rcs'],
                    env: { PS1: '$ ' },
                };
            case 'powershell':
                return {
                    path: osplatform === 'win32' ? 'powershell.exe' : 'pwsh',
                    args: ['-NoProfile', '-NonInteractive', '-NoLogo'],
                };
            case 'cmd':
                return {
                    path: 'cmd.exe',
                    args: ['/Q', '/K', 'prompt $G'],
                };
            case 'sh':
            default:
                return {
                    path: '/bin/sh',
                    args: [],
                    env: { PS1: '$ ' },
                };
        }
    }
    wrapCommand(command) {
        const osplatform = (0, os_1.platform)();
        if (this.shell === 'powershell') {
            // PowerShell command wrapping
            return `${command}; Write-Host "${this.commandMarker}"`;
        }
        else if (this.shell === 'cmd' && osplatform === 'win32') {
            // Windows CMD command wrapping
            return `${command} & echo ${this.commandMarker}`;
        }
        else {
            // Unix-like shell command wrapping
            return `${command} && echo "${this.commandMarker}" || (echo "${this.commandMarker}"; false)`;
        }
    }
    setupOutputHandlers() {
        if (!this.process)
            return;
        // Handle stdout
        this.process.stdout?.on('data', (data) => {
            const text = data.toString();
            this.processOutput(text);
        });
        // Handle stderr
        this.process.stderr?.on('data', (data) => {
            const text = data.toString();
            this.errorBuffer += text;
            // Also send stderr to output listeners
            this.notifyListeners(text);
        });
        // Handle process errors
        this.process.on('error', (error) => {
            if (this.alive) {
                this.logger.error('Process error', { id: this.id, error });
            }
        });
    }
    processOutput(text) {
        this.outputBuffer += text;
        // Notify listeners
        this.notifyListeners(text);
        // Check for command completion marker
        const markerIndex = this.outputBuffer.indexOf(this.commandMarker);
        if (markerIndex !== -1 && this.commandDeferred) {
            // Extract output before marker
            const output = this.outputBuffer.substring(0, markerIndex).trim();
            // Include any stderr output
            const fullOutput = this.errorBuffer ? `${output}\n${this.errorBuffer}` : output;
            this.errorBuffer = '';
            // Clear buffer up to after marker
            this.outputBuffer = this.outputBuffer.substring(markerIndex + this.commandMarker.length).trim();
            // Resolve pending command
            this.commandDeferred.resolve(fullOutput);
            this.commandDeferred = undefined;
        }
    }
    notifyListeners(data) {
        this.outputListeners.forEach(listener => {
            try {
                listener(data);
            }
            catch (error) {
                this.logger.error('Error in output listener', { id: this.id, error });
            }
        });
    }
    async monitorProcess() {
        if (!this.process)
            return;
        this.process.on('exit', (code, signal) => {
            this.logger.info('Terminal process exited', {
                id: this.id,
                code,
                signal,
            });
            this.alive = false;
            // Reject any pending command
            if (this.commandDeferred) {
                this.commandDeferred.reject(new Error('Terminal process exited'));
            }
        });
        this.process.on('error', (error) => {
            this.logger.error('Error monitoring process', { id: this.id, error });
            this.alive = false;
            // Reject any pending command
            if (this.commandDeferred) {
                this.commandDeferred.reject(error);
            }
        });
    }
    async waitForReady() {
        // Send a test command to ensure shell is ready
        const testCommand = this.shell === 'powershell'
            ? 'Write-Host "READY"'
            : 'echo "READY"';
        await this.write(testCommand + '\n');
        const startTime = Date.now();
        while (Date.now() - startTime < 5000) {
            if (this.outputBuffer.includes('READY')) {
                this.outputBuffer = '';
                return;
            }
            await (0, helpers_js_1.delay)(100);
        }
        throw new errors_js_1.TerminalError('Terminal failed to become ready');
    }
}
/**
 * Native terminal adapter
 */
class NativeAdapter {
    constructor(logger) {
        this.logger = logger;
        this.terminals = new Map();
        // Detect available shell
        this.shell = this.detectShell();
    }
    async initialize() {
        this.logger.info('Initializing native terminal adapter', { shell: this.shell });
        // Verify shell is available
        try {
            const testConfig = this.getTestCommand();
            const { spawnSync } = require('child_process');
            const result = spawnSync(testConfig.cmd, testConfig.args, { stdio: 'ignore' });
            if (result.status !== 0) {
                throw new Error('Shell test failed');
            }
        }
        catch (error) {
            this.logger.warn(`Shell ${this.shell} not available, falling back to sh`, { error });
            this.shell = 'sh';
        }
    }
    async shutdown() {
        this.logger.info('Shutting down native terminal adapter');
        // Kill all terminals
        const terminals = Array.from(this.terminals.values());
        await Promise.all(terminals.map(term => term.kill()));
        this.terminals.clear();
    }
    async createTerminal() {
        const terminal = new NativeTerminal(this.shell, this.logger);
        await terminal.initialize();
        this.terminals.set(terminal.id, terminal);
        return terminal;
    }
    async destroyTerminal(terminal) {
        await terminal.kill();
        this.terminals.delete(terminal.id);
    }
    detectShell() {
        const osplatform = (0, os_1.platform)();
        if (osplatform === 'win32') {
            // Windows shell detection
            const comspec = process.env.COMSPEC;
            if (comspec?.toLowerCase().includes('powershell')) {
                return 'powershell';
            }
            // Check if PowerShell is available
            try {
                const { spawnSync } = require('child_process');
                const result = spawnSync('powershell', ['-Version'], { stdio: 'ignore' });
                if (result.status === 0) {
                    return 'powershell';
                }
            }
            catch {
                // PowerShell not available
            }
            return 'cmd';
        }
        else {
            // Unix-like shell detection
            const shell = process.env.SHELL;
            if (shell) {
                const shellName = shell.split('/').pop();
                if (shellName && this.isShellSupported(shellName)) {
                    return shellName;
                }
            }
            // Try common shells in order of preference
            const shells = ['bash', 'zsh', 'sh'];
            for (const shell of shells) {
                try {
                    const { spawnSync } = require('child_process');
                    const result = spawnSync('which', [shell], { stdio: 'ignore' });
                    if (result.status === 0) {
                        return shell;
                    }
                }
                catch {
                    // Continue to next shell
                }
            }
            // Default to sh
            return 'sh';
        }
    }
    isShellSupported(shell) {
        return ['bash', 'zsh', 'sh', 'fish', 'dash', 'powershell', 'cmd'].includes(shell);
    }
    getTestCommand() {
        switch (this.shell) {
            case 'powershell':
                return { cmd: 'powershell', args: ['-Version'] };
            case 'cmd':
                return { cmd: 'cmd', args: ['/C', 'echo test'] };
            default:
                return { cmd: this.shell, args: ['--version'] };
        }
    }
}
exports.NativeAdapter = NativeAdapter;
