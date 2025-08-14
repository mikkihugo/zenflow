import { spawn } from 'node:child_process';
import { EventEmitter } from 'node:events';
export class TerminalManager extends EventEmitter {
    logger;
    eventBus;
    config;
    sessions = new Map();
    activeProcesses = new Map();
    constructor(config = {}, logger, eventBus) {
        super();
        this.logger = logger;
        this.eventBus = eventBus;
        this.config = {
            shell: config?.shell ||
                (process.platform === 'win32' ? 'cmd.exe' : '/bin/bash'),
            cwd: config?.cwd || process.cwd(),
            env: {
                ...Object.fromEntries(Object.entries(process.env).filter(([_, value]) => value !== undefined)),
                ...config?.env,
            },
            timeout: config?.timeout || 30000,
            maxConcurrentProcesses: config?.maxConcurrentProcesses || 10,
        };
        this.setupEventHandlers();
        this.logger?.info('TerminalManager initialized');
    }
    async executeCommand(command, options = {}) {
        const startTime = Date.now();
        const processId = `proc_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        if (this.activeProcesses.size >= this.config.maxConcurrentProcesses) {
            throw new Error('Maximum concurrent processes limit reached');
        }
        const execOptions = {
            cwd: options?.cwd || this.config.cwd,
            env: { ...this.config.env, ...options?.env },
            shell: options?.shell !== false,
            timeout: options?.timeout || this.config.timeout,
        };
        this.logger?.info(`Executing command: ${command}`, {
            processId,
            options: execOptions,
        });
        return new Promise((resolve) => {
            let stdout = '';
            let stderr = '';
            let completed = false;
            const childProcess = spawn(command, [], {
                ...execOptions,
                stdio: ['pipe', 'pipe', 'pipe'],
            });
            this.activeProcesses.set(processId, childProcess);
            this.emit('processStarted', { processId, command });
            const timeoutHandle = setTimeout(() => {
                if (!completed) {
                    completed = true;
                    childProcess?.kill('SIGTERM');
                    this.cleanupProcess(processId);
                    resolve({
                        success: false,
                        stdout,
                        stderr: `${stderr}\nProcess killed due to timeout`,
                        exitCode: -1,
                        duration: Date.now() - startTime,
                        error: new Error(`Command timeout after ${execOptions?.timeout}ms`),
                    });
                }
            }, execOptions?.timeout);
            childProcess?.stdout?.on('data', (data) => {
                stdout += data.toString();
                this.emit('processOutput', {
                    processId,
                    type: 'stdout',
                    data: data.toString(),
                });
            });
            childProcess?.stderr?.on('data', (data) => {
                stderr += data.toString();
                this.emit('processOutput', {
                    processId,
                    type: 'stderr',
                    data: data.toString(),
                });
            });
            childProcess?.on('close', (code) => {
                if (!completed) {
                    completed = true;
                    clearTimeout(timeoutHandle);
                    this.cleanupProcess(processId);
                    const duration = Date.now() - startTime;
                    const result = {
                        success: code === 0,
                        stdout,
                        stderr,
                        exitCode: code || 0,
                        duration,
                    };
                    this.logger?.info(`Command completed: ${command}`, {
                        processId,
                        exitCode: code,
                        duration,
                    });
                    this.emit('processCompleted', { processId, command, result });
                    resolve(result);
                }
            });
            childProcess?.on('error', (error) => {
                if (!completed) {
                    completed = true;
                    clearTimeout(timeoutHandle);
                    this.cleanupProcess(processId);
                    const duration = Date.now() - startTime;
                    this.logger?.error(`Command failed: ${command}`, {
                        processId,
                        error,
                    });
                    this.emit('processError', { processId, command, error });
                    resolve({
                        success: false,
                        stdout,
                        stderr: `${stderr}
      Process error: ${error.message}`,
                        exitCode: -1,
                        duration,
                        error,
                    });
                }
            });
        });
    }
    async createSession(sessionId) {
        const id = sessionId ||
            `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        if (this.sessions.has(id)) {
            throw new Error(`Session ${id} already exists`);
        }
        const session = {
            id,
            shell: this.config.shell,
            cwd: this.config.cwd,
            env: this.config.env,
            active: true,
            created: new Date(),
            lastActivity: new Date(),
        };
        this.sessions.set(id, session);
        this.logger?.info(`Terminal session created: ${id}`);
        this.emit('sessionCreated', { sessionId: id });
        return id;
    }
    async executeInSession(sessionId, command) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error(`Session ${sessionId} not found`);
        }
        session.lastActivity = new Date();
        return this.executeCommand(command, {
            cwd: session.cwd,
            env: session.env,
        });
    }
    async closeSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (!session) {
            return;
        }
        session.active = false;
        if (session.process && !session.process.killed) {
            session.process.kill('SIGTERM');
        }
        this.sessions.delete(sessionId);
        this.logger?.info(`Terminal session closed: ${sessionId}`);
        this.emit('sessionClosed', { sessionId });
    }
    getSessions() {
        return Array.from(this.sessions.values());
    }
    getActiveProcessCount() {
        return this.activeProcesses.size;
    }
    async killProcess(processId) {
        const process = this.activeProcesses.get(processId);
        if (!process) {
            return false;
        }
        process.kill('SIGTERM');
        this.cleanupProcess(processId);
        this.logger?.info(`Process killed: ${processId}`);
        return true;
    }
    async cleanup() {
        this.logger?.info('Cleaning up TerminalManager...');
        for (const sessionId of Array.from(this.sessions.keys())) {
            await this.closeSession(sessionId);
        }
        for (const [processId, process] of Array.from(this.activeProcesses.entries())) {
            if (!process.killed) {
                process.kill('SIGTERM');
            }
            this.activeProcesses.delete(processId);
        }
        this.logger?.info('TerminalManager cleanup completed');
    }
    setupEventHandlers() {
        if (this.eventBus) {
            this.eventBus.on('system:shutdown', () => {
                this.cleanup().catch((error) => this.logger?.error('Error during TerminalManager cleanup', { error }));
            });
        }
    }
    cleanupProcess(processId) {
        this.activeProcesses.delete(processId);
    }
}
export default TerminalManager;
//# sourceMappingURL=process-orchestrator.js.map