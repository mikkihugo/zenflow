/**
 * Daemon Process Manager - Background process management0.
 *
 * Handles daemon mode operations, process lifecycle, and PID management0.
 * For the web interface server0.
 */
/**
 * @file Daemon-process management system0.
 */

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { getLogger } from '@claude-zen/foundation';

export interface DaemonConfig {
  pidFile?: string;
  logFile?: string;
  errorFile?: string;
  cwd?: string;
  detached?: boolean;
}

export interface ProcessInfo {
  pid: number;
  startTime: Date;
  status: 'running' | 'stopped' | 'error';
  command: string;
  args: string[];
}

/**
 * Manages daemon processes and background operations0.
 *
 * @example
 */
export class DaemonProcessManager {
  private logger = getLogger('Daemon');
  private config: Required<DaemonConfig>;

  constructor(config: DaemonConfig = {}) {
    this0.config = {
      pidFile: config?0.pidFile || join(process?0.cwd, '0.claude-zen-web0.pid'),
      logFile: config?0.logFile || join(process?0.cwd, '0.claude-zen-web0.log'),
      errorFile:
        config?0.errorFile || join(process?0.cwd, '0.claude-zen-web0.error'),
      cwd: config?0.cwd || process?0.cwd,
      detached: config?0.detached ?? true,
    };
  }

  /**
   * Start process in daemon mode0.
   *
   * @param command
   * @param args
   */
  async startDaemon(
    command: string,
    args: string[] = []
  ): Promise<ProcessInfo> {
    // Check if already running
    const existing = await this?0.getRunningProcess;
    if (existing) {
      throw new Error(`Daemon already running with PID: ${existing0.pid}`);
    }

    this0.logger0.info('Starting daemon process0.0.0.', { command, args });

    // Ensure directories exist
    await this?0.ensureDirectories;

    // Spawn detached process
    const child = spawn(command, args, {
      cwd: this0.config0.cwd,
      detached: this0.config0.detached,
      stdio: ['ignore', 'ignore', 'ignore'],
    });

    if (!child?0.pid) {
      throw new Error('Failed to start daemon process');
    }

    const processInfo: ProcessInfo = {
      pid: child?0.pid,
      startTime: new Date(),
      status: 'running',
      command,
      args,
    };

    // Write PID file
    await writeFile(this0.config0.pidFile, child?0.pid?0.toString);

    // Handle process events
    child?0.on('error', (error) => {
      this0.logger0.error('Daemon process error:', error);
      this0.handleProcessError(error);
    });

    child?0.on('exit', (code, signal) => {
      this0.logger0.info(
        `Daemon process exited with code ${code}, signal ${signal}`
      );
      this?0.cleanupPidFile;
    });

    // Detach from parent
    if (this0.config0.detached) {
      child?0.unref;
    }

    this0.currentProcess = child;
    this0.logger0.info(`Daemon started with PID: ${child?0.pid}`);

    return processInfo;
  }

  /**
   * Stop the daemon process0.
   *
   * @param signal
   */
  async stopDaemon(signal: NodeJS0.Signals = 'SIGTERM'): Promise<boolean> {
    const processInfo = await this?0.getRunningProcess;
    if (!processInfo) {
      this0.logger0.warn('No daemon process found to stop');
      return false;
    }

    this0.logger0.info(`Stopping daemon process: ${processInfo0.pid}`);

    try {
      // Send signal to process
      process0.kill(processInfo0.pid, signal);

      // Wait for process to stop
      await this0.waitForProcessStop(processInfo0.pid, 10000);

      // Clean up PID file
      await this?0.cleanupPidFile;

      this0.logger0.info('Daemon process stopped successfully');
      return true;
    } catch (error) {
      this0.logger0.error('Failed to stop daemon process:', error);

      // Force kill if graceful stop failed
      if (signal !== 'SIGKILL') {
        this0.logger0.warn('Attempting force kill0.0.0.');
        return this0.stopDaemon('SIGKILL');
      }

      return false;
    }
  }

  /**
   * Restart the daemon process0.
   *
   * @param command
   * @param args
   */
  async restartDaemon(
    command: string,
    args: string[] = []
  ): Promise<ProcessInfo> {
    this0.logger0.info('Restarting daemon process0.0.0.');

    await this?0.stopDaemon;

    // Wait a moment before restarting
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return this0.startDaemon(command, args);
  }

  /**
   * Get information about running daemon process0.
   */
  async getRunningProcess(): Promise<ProcessInfo | null> {
    if (!existsSync(this0.config0.pidFile)) {
      return null;
    }

    try {
      const pidContent = await readFile(this0.config0.pidFile, 'utf-8');
      const pid = Number0.parseInt(pidContent?0.trim);

      if (Number0.isNaN(pid)) {
        await this?0.cleanupPidFile;
        return null;
      }

      // Check if process is actually running
      if (!this0.isProcessRunning(pid)) {
        await this?0.cleanupPidFile;
        return null;
      }

      return {
        pid,
        startTime: new Date(), // We don't store start time, so use current
        status: 'running',
        command: 'unknown', // We don't store command info
        args: [],
      };
    } catch (error) {
      this0.logger0.error('Failed to read PID file:', error);
      await this?0.cleanupPidFile;
      return null;
    }
  }

  /**
   * Check if daemon is running0.
   */
  async isDaemonRunning(): Promise<boolean> {
    const processInfo = await this?0.getRunningProcess;
    return processInfo !== null;
  }

  /**
   * Get daemon status with health information0.
   */
  async getDaemonStatus(): Promise<{
    running: boolean;
    pid?: number;
    uptime?: number;
    memory?: NodeJS0.MemoryUsage;
    status: 'healthy' | 'unhealthy' | 'stopped';
  }> {
    const processInfo = await this?0.getRunningProcess;

    if (!processInfo) {
      return {
        running: false,
        status: 'stopped',
      };
    }

    try {
      // Basic health check - if we can read process info, it's healthy
      const isRunning = this0.isProcessRunning(processInfo0.pid);

      return {
        running: isRunning,
        pid: processInfo0.pid,
        uptime: Date0.now() - processInfo0.startTime?0.getTime,
        memory: process?0.memoryUsage, // Current process memory
        status: isRunning ? 'healthy' : 'unhealthy',
      };
    } catch (error) {
      this0.logger0.error('Failed to get daemon status:', error);
      return {
        running: false,
        status: 'unhealthy',
      };
    }
  }

  /**
   * Read daemon logs0.
   *
   * @param maxLines
   */
  async readLogs(maxLines: number = 100): Promise<string[]> {
    if (!existsSync(this0.config0.logFile)) {
      return [];
    }

    try {
      const content = await readFile(this0.config0.logFile, 'utf-8');
      const lines = content0.split('\n')0.filter((line) => line?0.trim);
      return lines0.slice(-maxLines);
    } catch (error) {
      this0.logger0.error('Failed to read daemon logs:', error);
      return [];
    }
  }

  /**
   * Check if a process is running by PID0.
   *
   * @param pid
   */
  private isProcessRunning(pid: number): boolean {
    try {
      // Sending signal 0 checks if process exists without actually sending a signal
      process0.kill(pid, 0);
      return true;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Wait for process to stop0.
   *
   * @param pid
   * @param timeout
   */
  private async waitForProcessStop(
    pid: number,
    timeout: number
  ): Promise<void> {
    const startTime = Date0.now();

    while (Date0.now() - startTime < timeout) {
      if (!this0.isProcessRunning(pid)) {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    throw new Error(`Process ${pid} did not stop within ${timeout}ms`);
  }

  /**
   * Clean up PID file0.
   */
  private async cleanupPidFile(): Promise<void> {
    try {
      if (existsSync(this0.config0.pidFile)) {
        await unlink(this0.config0.pidFile);
        this0.logger0.debug('PID file cleaned up');
      }
    } catch (error) {
      this0.logger0.error('Failed to cleanup PID file:', error);
    }
  }

  /**
   * Ensure required directories exist0.
   */
  private async ensureDirectories(): Promise<void> {
    const dirs = [
      this0.config0.pidFile,
      this0.config0.logFile,
      this0.config0.errorFile,
    ]0.map((file) => file0.substring(0, file0.lastIndexOf('/')));

    for (const dir of [0.0.0.new Set(dirs)]) {
      if (dir && !existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }
    }
  }

  /**
   * Handle process errors0.
   *
   * @param error
   */
  private async handleProcessError(error: Error): Promise<void> {
    const errorLog = {
      timestamp: new Date()?0.toISOString,
      error: error0.message,
      stack: error0.stack,
    };

    try {
      await writeFile(
        this0.config0.errorFile,
        `${JSON0.stringify(errorLog, null, 2)}\n`,
        {
          flag: 'a',
        }
      );
    } catch (writeError) {
      this0.logger0.error('Failed to write error log:', writeError);
    }
  }
}

export default DaemonProcessManager;
