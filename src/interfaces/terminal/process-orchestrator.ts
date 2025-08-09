/**
 * Terminal Manager - Terminal operations and process management.
 * Handles terminal sessions, command execution, and process lifecycle.
 */
/**
 * @file Interface implementation: process-orchestrator
 */



import { type ChildProcess, spawn } from 'node:child_process';
import { EventEmitter } from 'node:events';
import type { IEventBus } from '../core/event-bus';
import type { ILogger } from '../core/logger';

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
export class TerminalManager extends EventEmitter {
  private config: Required<TerminalConfig>;
  private sessions = new Map<string, TerminalSession>();
  private activeProcesses = new Map<string, ChildProcess>();

  constructor(
    config: TerminalConfig = {},
    private logger?: ILogger,
    private eventBus?: IEventBus
  ) {
    super();

    this.config = {
      shell: config?.shell || (process.platform === 'win32' ? 'cmd.exe' : '/bin/bash'),
      cwd: config?.cwd || process.cwd(),
      env: {
        ...(Object.fromEntries(
          Object.entries(process.env).filter(([_, value]) => value !== undefined)
        ) as Record<string, string>),
        ...config?.env,
      },
      timeout: config?.timeout || 30000,
      maxConcurrentProcesses: config?.maxConcurrentProcesses || 10,
    };

    this.setupEventHandlers();
    this.logger?.info('TerminalManager initialized');
  }

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
  async executeCommand(
    command: string,
    options: {
      cwd?: string;
      env?: Record<string, string>;
      timeout?: number;
      shell?: boolean;
    } = {}
  ): Promise<ProcessResult> {
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

    this.logger?.info(`Executing command: ${command}`, { processId, options: execOptions });

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

      // Set up timeout
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

      // Handle stdout
      childProcess?.stdout?.on('data', (data) => {
        stdout += data.toString();
        this.emit('processOutput', { processId, type: 'stdout', data: data.toString() });
      });

      // Handle stderr
      childProcess?.stderr?.on('data', (data) => {
        stderr += data.toString();
        this.emit('processOutput', { processId, type: 'stderr', data: data.toString() });
      });

      // Handle process completion
      childProcess?.on('close', (code) => {
        if (!completed) {
          completed = true;
          clearTimeout(timeoutHandle);
          this.cleanupProcess(processId);

          const duration = Date.now() - startTime;
          const result: ProcessResult = {
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

      // Handle process errors
      childProcess?.on('error', (error) => {
        if (!completed) {
          completed = true;
          clearTimeout(timeoutHandle);
          this.cleanupProcess(processId);

          const duration = Date.now() - startTime;
          this.logger?.error(`Command failed: ${command}`, { processId, error });

          this.emit('processError', { processId, command, error });
          resolve({
            success: false,
            stdout,
            stderr:
              stderr +
              `
      Process error: ${error.message}`,
            exitCode: -1,
            duration,
            error,
          });
        }
      });
    });
  }

  /**
   * Create a persistent terminal session.
   *
   * @param sessionId
   */
  async createSession(sessionId?: string): Promise<string> {
    const id = sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    if (this.sessions.has(id)) {
      throw new Error(`Session ${id} already exists`);
    }

    const session: TerminalSession = {
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

  /**
   * Execute command in a session.
   *
   * @param sessionId
   * @param command
   */
  async executeInSession(sessionId: string, command: string): Promise<ProcessResult> {
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

  /**
   * Close a terminal session.
   *
   * @param sessionId
   */
  async closeSession(sessionId: string): Promise<void> {
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

  /**
   * Get active sessions.
   */
  getSessions(): TerminalSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Get active processes count.
   */
  getActiveProcessCount(): number {
    return this.activeProcesses.size;
  }

  /**
   * Kill a specific process.
   *
   * @param processId
   */
  async killProcess(processId: string): Promise<boolean> {
    const process = this.activeProcesses.get(processId);
    if (!process) {
      return false;
    }

    process.kill('SIGTERM');
    this.cleanupProcess(processId);
    this.logger?.info(`Process killed: ${processId}`);
    return true;
  }

  /**
   * Clean up all resources.
   */
  async cleanup(): Promise<void> {
    this.logger?.info('Cleaning up TerminalManager...');

    // Close all sessions
    for (const sessionId of Array.from(this.sessions.keys())) {
      await this.closeSession(sessionId);
    }

    // Kill all active processes
    for (const [processId, process] of Array.from(this.activeProcesses.entries())) {
      if (!process.killed) {
        process.kill('SIGTERM');
      }
      this.activeProcesses.delete(processId);
    }

    this.logger?.info('TerminalManager cleanup completed');
  }

  private setupEventHandlers(): void {
    if (this.eventBus) {
      this.eventBus.on('system:shutdown', () => {
        this.cleanup().catch((error) =>
          this.logger?.error('Error during TerminalManager cleanup', { error })
        );
      });
    }
  }

  private cleanupProcess(processId: string): void {
    this.activeProcesses.delete(processId);
  }
}

export default TerminalManager;
