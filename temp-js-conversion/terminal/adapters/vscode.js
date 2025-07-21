"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VSCodeAdapter = void 0;
/**
 * VSCode terminal adapter implementation
 */
const os_1 = require("os");
const errors_js_1 = require("../../utils/errors.js");
const helpers_js_1 = require("../../utils/helpers.js");
/**
 * VSCode terminal implementation
 */
class VSCodeTerminalWrapper {
    constructor(vscodeApi, shellType, logger) {
        this.vscodeApi = vscodeApi;
        this.shellType = shellType;
        this.logger = logger;
        this.outputBuffer = '';
        this.outputDeferred = (0, helpers_js_1.createDeferred)();
        this.isDisposed = false;
        this.id = (0, helpers_js_1.generateId)('vscode-term');
        this.commandMarker = `__CLAUDE_FLOW_${this.id}__`;
    }
    async initialize() {
        try {
            // Create VSCode terminal
            const shellPath = this.getShellPath();
            const terminalOptions = {
                name: `Claude-Flow Terminal ${this.id}`,
                shellArgs: this.getShellArgs(),
                env: {
                    CLAUDE_FLOW_TERMINAL: 'true',
                    CLAUDE_FLOW_TERMINAL_ID: this.id,
                    PS1: '$ ', // Simple prompt
                },
            };
            if (shellPath !== undefined) {
                terminalOptions.shellPath = shellPath;
            }
            this.vscodeTerminal = this.vscodeApi.window.createTerminal(terminalOptions);
            // Get process ID
            const processId = await this.vscodeTerminal.processId;
            if (processId !== undefined) {
                this.pid = processId;
            }
            // Show terminal (but don't steal focus)
            this.vscodeTerminal.show(true);
            // Wait for terminal to be ready
            await this.waitForReady();
            this.logger.debug('VSCode terminal initialized', { id: this.id, pid: this.pid });
        }
        catch (error) {
            throw new errors_js_1.TerminalError('Failed to create VSCode terminal', { error });
        }
    }
    async executeCommand(command) {
        if (!this.vscodeTerminal || !this.isAlive()) {
            throw new errors_js_1.TerminalError('Terminal is not alive');
        }
        try {
            // Clear output buffer
            this.outputBuffer = '';
            this.outputDeferred = (0, helpers_js_1.createDeferred)();
            // Send command with marker
            const markedCommand = `${command} && echo "${this.commandMarker}"`;
            this.vscodeTerminal.sendText(markedCommand, true);
            // Wait for command to complete
            const output = await (0, helpers_js_1.timeout)(this.outputDeferred.promise, 30000, 'Command execution timeout');
            return output;
        }
        catch (error) {
            throw new errors_js_1.TerminalError('Failed to execute command', { command, error });
        }
    }
    async write(data) {
        if (!this.vscodeTerminal || !this.isAlive()) {
            throw new errors_js_1.TerminalError('Terminal is not alive');
        }
        this.vscodeTerminal.sendText(data, false);
    }
    async read() {
        if (!this.vscodeTerminal || !this.isAlive()) {
            throw new errors_js_1.TerminalError('Terminal is not alive');
        }
        // Return buffered output
        const output = this.outputBuffer;
        this.outputBuffer = '';
        return output;
    }
    isAlive() {
        return !this.isDisposed && this.vscodeTerminal !== undefined;
    }
    async kill() {
        if (this.vscodeTerminal && !this.isDisposed) {
            try {
                // Try graceful shutdown first
                this.vscodeTerminal.sendText('exit', true);
                await (0, helpers_js_1.delay)(500);
                // Dispose terminal
                this.vscodeTerminal.dispose();
                this.isDisposed = true;
            }
            catch (error) {
                this.logger.warn('Error killing VSCode terminal', { id: this.id, error });
            }
        }
    }
    /**
     * Process terminal output (called by extension)
     */
    processOutput(data) {
        this.outputBuffer += data;
        // Check for command completion marker
        const markerIndex = this.outputBuffer.indexOf(this.commandMarker);
        if (markerIndex !== -1) {
            // Extract output before marker
            const output = this.outputBuffer.substring(0, markerIndex).trim();
            // Clear buffer up to after marker
            this.outputBuffer = this.outputBuffer.substring(markerIndex + this.commandMarker.length).trim();
            // Resolve pending command
            this.outputDeferred.resolve(output);
        }
    }
    getShellPath() {
        switch (this.shellType) {
            case 'bash':
                return '/bin/bash';
            case 'zsh':
                return '/bin/zsh';
            case 'powershell':
                return (0, os_1.platform)() === 'win32' ? 'powershell.exe' : 'pwsh';
            case 'cmd':
                return (0, os_1.platform)() === 'win32' ? 'cmd.exe' : undefined;
            default:
                return undefined;
        }
    }
    getShellArgs() {
        switch (this.shellType) {
            case 'bash':
                return ['--norc', '--noprofile'];
            case 'zsh':
                return ['--no-rcs'];
            case 'powershell':
                return ['-NoProfile', '-NonInteractive'];
            case 'cmd':
                return ['/Q'];
            default:
                return [];
        }
    }
    async waitForReady() {
        // Send a test command to ensure terminal is ready
        this.vscodeTerminal.sendText('echo "READY"', true);
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
 * VSCode terminal adapter
 */
class VSCodeAdapter {
    constructor(logger) {
        this.logger = logger;
        this.terminals = new Map();
        this.shellType = this.detectShell();
    }
    async initialize() {
        this.logger.info('Initializing VSCode terminal adapter');
        // Check if running in VSCode extension context
        if (!this.isVSCodeExtensionContext()) {
            throw new errors_js_1.TerminalError('Not running in VSCode extension context');
        }
        // Get VSCode API from global
        this.vscodeApi = globalThis.vscode;
        if (!this.vscodeApi) {
            throw new errors_js_1.TerminalError('VSCode API not available');
        }
        // Register terminal close listener
        this.terminalCloseListener = this.vscodeApi.window.onDidCloseTerminal((terminal) => {
            // Find and clean up closed terminal
            for (const [id, wrapper] of this.terminals.entries()) {
                if (wrapper.vscodeTerminal === terminal) {
                    this.logger.info('VSCode terminal closed', { id });
                    this.terminals.delete(id);
                    break;
                }
            }
        });
        this.logger.info('VSCode terminal adapter initialized');
    }
    async shutdown() {
        this.logger.info('Shutting down VSCode terminal adapter');
        // Dispose listener
        if (this.terminalCloseListener) {
            this.terminalCloseListener.dispose();
        }
        // Kill all terminals
        const terminals = Array.from(this.terminals.values());
        await Promise.all(terminals.map(term => term.kill()));
        this.terminals.clear();
    }
    async createTerminal() {
        if (!this.vscodeApi) {
            throw new errors_js_1.TerminalError('VSCode API not initialized');
        }
        const terminal = new VSCodeTerminalWrapper(this.vscodeApi, this.shellType, this.logger);
        await terminal.initialize();
        this.terminals.set(terminal.id, terminal);
        // Register output processor if extension provides it
        const outputProcessor = globalThis.registerTerminalOutputProcessor;
        if (outputProcessor) {
            outputProcessor(terminal.id, (data) => terminal.processOutput(data));
        }
        return terminal;
    }
    async destroyTerminal(terminal) {
        await terminal.kill();
        this.terminals.delete(terminal.id);
    }
    isVSCodeExtensionContext() {
        // Check for VSCode extension environment
        return typeof globalThis.vscode !== 'undefined' &&
            typeof globalThis.vscode.window !== 'undefined';
    }
    detectShell() {
        // Get default shell from VSCode settings or environment
        const osplatform = (0, os_1.platform)();
        if (osplatform === 'win32') {
            // Windows defaults
            const comspec = process.env.COMSPEC;
            if (comspec?.toLowerCase().includes('powershell')) {
                return 'powershell';
            }
            return 'cmd';
        }
        else {
            // Unix-like defaults
            const shell = process.env.SHELL;
            if (shell) {
                const shellName = shell.split('/').pop();
                if (shellName && ['bash', 'zsh', 'fish', 'sh'].includes(shellName)) {
                    return shellName;
                }
            }
            return 'bash';
        }
    }
}
exports.VSCodeAdapter = VSCodeAdapter;
