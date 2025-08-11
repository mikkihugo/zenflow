/**
 * Terminal Manager - Terminal operations and process management.
 * Handles terminal sessions, command execution, and process lifecycle.
 */
/**
 * @file Interface implementation: process-orchestrator.
 */
import { type ChildProcess } from 'node:child_process';
import { EventEmitter } from 'node:events';
import type { ILogger } from '../../core/logger.ts';
import type { IEventBus } from '../core/event-bus';
export interface TerminalConfig {
    shell?: string;
    cwd?: string;
    env?: Record<string, string>;
    timeout?: number;
    maxConcurrentProcesses?: number;
}
export interface ProcessResult {
    success: boolean;
    stdout: string;
    stderr: string;
    exitCode: number;
    duration: number;
    error?: Error;
}
export interface TerminalSession {
    id: string;
    shell: string;
    cwd: string;
    env: Record<string, string>;
    process?: ChildProcess;
    active: boolean;
    created: Date;
    lastActivity: Date;
}
/**
 * Terminal Manager for process and session management.
 *
 * @example
 */
export declare class TerminalManager extends EventEmitter {
    private logger?;
    private eventBus?;
    private config;
    private sessions;
    private activeProcesses;
    constructor(config?: TerminalConfig, logger?: ILogger | undefined, eventBus?: IEventBus);
    /**
     * Execute a command in a new process.
     *
     * @param command
     * @param options
     * @param options.cwd
     * @param options.env
     * @param options.timeout
     * @param options.shell
     */
    executeCommand(command: string, options?: {
        cwd?: string;
        env?: Record<string, string>;
        timeout?: number;
        shell?: boolean;
    }): Promise<ProcessResult>;
    /**
     * Create a persistent terminal session.
     *
     * @param sessionId
     */
    createSession(sessionId?: string): Promise<string>;
    /**
     * Execute command in a session.
     *
     * @param sessionId
     * @param command
     */
    executeInSession(sessionId: string, command: string): Promise<ProcessResult>;
    /**
     * Close a terminal session.
     *
     * @param sessionId
     */
    closeSession(sessionId: string): Promise<void>;
    /**
     * Get active sessions.
     */
    getSessions(): TerminalSession[];
    /**
     * Get active processes count.
     */
    getActiveProcessCount(): number;
    /**
     * Kill a specific process.
     *
     * @param processId
     */
    killProcess(processId: string): Promise<boolean>;
    /**
     * Clean up all resources.
     */
    cleanup(): Promise<void>;
    private setupEventHandlers;
    private cleanupProcess;
}
export default TerminalManager;
//# sourceMappingURL=process-orchestrator.d.ts.map