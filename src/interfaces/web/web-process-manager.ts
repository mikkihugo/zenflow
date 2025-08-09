/**
 * Web Process Manager - Daemon and process lifecycle management
 *
 * Handles daemon mode operations, PID file management,
 * and graceful shutdown procedures for the web interface.
 */

import { existsSync } from 'node:fs';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { createLogger } from '../../utils/logger';

export interface ProcessInfo {
  pid: number;
  startTime: Date;
  isRunning: boolean;
  pidFile: string;
}

export class WebProcessManager {
  private logger = createLogger('WebProcess');
  private config: WebConfig;
  private pid?: number;
  private pidFile: string;
  private isShuttingDown = false;

  constructor(config: WebConfig) {
    this.config = config;
    this.pidFile = join(process.cwd(), '.hive-mind', 'claude-zen-web.pid');
  }

  /**
   * Start process management (daemon mode)
   */
  async startDaemonMode(): Promise<void> {
    if (!this.config.daemon) {
      this.logger.debug('Daemon mode not enabled');
      return;
    }

    this.logger.info('Starting web interface in daemon mode');

    // Save PID for process management
    this.pid = process.pid;
    await this.savePidFile();

    // Setup signal handlers for graceful shutdown
    this.setupSignalHandlers();

    this.logger.info(`Daemon started with PID: ${this.pid}`);
  }

  /**
   * Save process ID to file
   */
  private async savePidFile(): Promise<void> {
    try {
      await mkdir(dirname(this.pidFile), { recursive: true });
      await writeFile(this.pidFile, this.pid?.toString());
      this.logger.debug(`PID file saved: ${this.pidFile}`);
    } catch (error) {
      this.logger.error('Failed to save PID file:', error);
      throw new Error(`Failed to save PID file: ${error}`);
    }
  }

  /**
   * Remove PID file
   */
  private async removePidFile(): Promise<void> {
    try {
      if (existsSync(this.pidFile)) {
        await unlink(this.pidFile);
        this.logger.debug(`PID file removed: ${this.pidFile}`);
      }
    } catch (error) {
      this.logger.warn('Failed to remove PID file:', error);
      // Don't throw - this is cleanup
    }
  }

  /**
   * Setup signal handlers for graceful shutdown
   */
  private setupSignalHandlers(): void {
    const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'] as const;

    signals.forEach((signal) => {
      process.on(signal, () => {
        this.logger.info(`Received ${signal}, initiating graceful shutdown`);
        this.gracefulShutdown(signal);
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.logger.error('Uncaught exception:', error);
      this.gracefulShutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, _promise) => {
      this.logger.error('Unhandled promise rejection:', reason);
      this.gracefulShutdown('unhandledRejection');
    });
  }

  /**
   * Perform graceful shutdown
   *
   * @param signal
   */
  async gracefulShutdown(signal?: string): Promise<void> {
    if (this.isShuttingDown) {
      this.logger.warn('Shutdown already in progress');
      return;
    }

    this.isShuttingDown = true;
    this.logger.info(`Starting graceful shutdown${signal ? ` (${signal})` : ''}`);

    try {
      // Cleanup PID file
      await this.removePidFile();

      this.logger.info('Graceful shutdown completed');

      // Exit process
      process.exit(0);
    } catch (error) {
      this.logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  }

  /**
   * Check if another instance is running
   */
  async isInstanceRunning(): Promise<ProcessInfo | null> {
    try {
      if (!existsSync(this.pidFile)) {
        return null;
      }

      const pidContent = await readFile(this.pidFile, 'utf-8');
      const pid = parseInt(pidContent.trim());

      if (Number.isNaN(pid)) {
        this.logger.warn('Invalid PID file content, removing');
        await this.removePidFile();
        return null;
      }

      // Check if process is actually running
      const isRunning = this.isProcessRunning(pid);

      if (!isRunning) {
        this.logger.info('Stale PID file found, removing');
        await this.removePidFile();
        return null;
      }

      return {
        pid,
        startTime: new Date(), // Can't determine exact start time from PID alone
        isRunning: true,
        pidFile: this.pidFile,
      };
    } catch (error) {
      this.logger.error('Error checking running instance:', error);
      return null;
    }
  }

  /**
   * Check if a process is running by PID
   *
   * @param pid
   */
  private isProcessRunning(pid: number): boolean {
    try {
      // Send signal 0 to check if process exists
      // This doesn't actually send a signal but checks if the process exists
      process.kill(pid, 0);
      return true;
    } catch (error: any) {
      if (error.code === 'ESRCH') {
        // Process doesn't exist
        return false;
      } else if (error.code === 'EPERM') {
        // Process exists but we don't have permission to signal it
        return true;
      }
      // Other errors - assume process doesn't exist
      return false;
    }
  }

  /**
   * Stop a running instance
   *
   * @param pid
   */
  async stopInstance(pid?: number): Promise<boolean> {
    try {
      let targetPid = pid;

      if (!targetPid) {
        const runningInstance = await this.isInstanceRunning();
        if (!runningInstance) {
          this.logger.info('No running instance found');
          return false;
        }
        targetPid = runningInstance.pid;
      }

      this.logger.info(`Stopping instance with PID: ${targetPid}`);

      // Send SIGTERM for graceful shutdown
      process.kill(targetPid, 'SIGTERM');

      // Wait a bit and check if process stopped
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (this.isProcessRunning(targetPid)) {
        this.logger.warn(`Process ${targetPid} still running, sending SIGKILL`);
        process.kill(targetPid, 'SIGKILL');
      }

      // Clean up PID file
      await this.removePidFile();

      this.logger.info(`Instance ${targetPid} stopped successfully`);
      return true;
    } catch (error) {
      this.logger.error('Error stopping instance:', error);
      return false;
    }
  }

  /**
   * Get current process information
   */
  getCurrentProcessInfo(): ProcessInfo {
    return {
      pid: process.pid,
      startTime: new Date(Date.now() - process.uptime() * 1000),
      isRunning: true,
      pidFile: this.pidFile,
    };
  }

  /**
   * Get process statistics
   */
  getProcessStats(): {
    pid: number;
    uptime: number;
    memory: NodeJS.MemoryUsage;
    cpu: NodeJS.CpuUsage;
    isMain: boolean;
  } {
    return {
      pid: process.pid,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      isMain: process.pid === this.pid,
    };
  }

  /**
   * Health check for process manager
   */
  healthCheck(): {
    status: 'healthy' | 'warning' | 'error';
    pid: number;
    uptime: number;
    daemonMode: boolean;
    pidFile: string;
    pidFileExists: boolean;
  } {
    return {
      status: 'healthy',
      pid: process.pid,
      uptime: process.uptime(),
      daemonMode: this.config.daemon || false,
      pidFile: this.pidFile,
      pidFileExists: existsSync(this.pidFile),
    };
  }
}
