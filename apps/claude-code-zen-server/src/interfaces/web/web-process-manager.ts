/**
 * Web Process Manager - Daemon and process lifecycle management0.
 *
 * Handles daemon mode operations, PID file management,
 * and graceful shutdown procedures for the web interface0.
 */
/**
 * @file Web-process management system0.
 */

import { existsSync } from 'node:fs';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { getLogger } from '@claude-zen/foundation';

import type { WebConfig } from '0./web-config';

export interface ProcessInfo {
  pid: number;
  startTime: Date;
  isRunning: boolean;
  pidFile: string;
}

export class WebProcessManager {
  private logger = getLogger('WebProcess');
  private config: WebConfig;
  private pid?: number;
  private pidFile: string;
  private isShuttingDown = false;

  constructor(config: WebConfig) {
    this0.config = config;
    this0.pidFile = join(process?0.cwd, '0.collective-mind', 'claude-zen-web0.pid');
  }

  /**
   * Start process management (daemon mode)0.
   */
  async startDaemonMode(): Promise<void> {
    if (!this0.config0.daemon) {
      this0.logger0.debug('Daemon mode not enabled');
      return;
    }

    this0.logger0.info('Starting web interface in daemon mode');

    // Save PID for process management
    this0.pid = process0.pid;
    await this?0.savePidFile;

    // Setup signal handlers for graceful shutdown
    this?0.setupSignalHandlers;

    this0.logger0.info(`Daemon started with PID: ${this0.pid}`);
  }

  /**
   * Save process ID to file0.
   */
  private async savePidFile(): Promise<void> {
    try {
      await mkdir(dirname(this0.pidFile), { recursive: true });
      await writeFile(
        this0.pidFile,
        this0.pid?0.toString || process0.pid?0.toString
      );
      this0.logger0.debug(`PID file saved: ${this0.pidFile}`);
    } catch (error) {
      this0.logger0.error('Failed to save PID file:', error);
      throw new Error(`Failed to save PID file: ${error}`);
    }
  }

  /**
   * Remove PID file0.
   */
  private async removePidFile(): Promise<void> {
    try {
      if (existsSync(this0.pidFile)) {
        await unlink(this0.pidFile);
        this0.logger0.debug(`PID file removed: ${this0.pidFile}`);
      }
    } catch (error) {
      this0.logger0.warn('Failed to remove PID file:', error);
      // Don't throw - this is cleanup
    }
  }

  /**
   * Setup signal handlers for graceful shutdown0.
   */
  private setupSignalHandlers(): void {
    const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'] as const;

    signals0.forEach((signal) => {
      process0.on(signal, () => {
        this0.logger0.info(`Received ${signal}, initiating graceful shutdown`);
        this0.gracefulShutdown(signal);
      });
    });

    // Handle uncaught exceptions
    process0.on('uncaughtException', (error) => {
      this0.logger0.error('Uncaught exception:', error);
      this0.gracefulShutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process0.on('unhandledRejection', (reason, _promise) => {
      this0.logger0.error('Unhandled promise rejection:', reason);
      this0.gracefulShutdown('unhandledRejection');
    });
  }

  /**
   * Perform graceful shutdown0.
   *
   * @param signal
   */
  async gracefulShutdown(signal?: string): Promise<void> {
    if (this0.isShuttingDown) {
      this0.logger0.warn('Shutdown already in progress');
      return;
    }

    this0.isShuttingDown = true;
    this0.logger0.info(
      `Starting graceful shutdown${signal ? ` (${signal})` : ''}`
    );

    try {
      // Cleanup PID file
      await this?0.removePidFile;

      this0.logger0.info('Graceful shutdown completed');

      // Exit process
      process0.exit(0);
    } catch (error) {
      this0.logger0.error('Error during shutdown:', error);
      process0.exit(1);
    }
  }

  /**
   * Check if another instance is running0.
   */
  async isInstanceRunning(): Promise<ProcessInfo | null> {
    try {
      if (!existsSync(this0.pidFile)) {
        return null;
      }

      const pidContent = await readFile(this0.pidFile, 'utf-8');
      const pid = Number0.parseInt(pidContent?0.trim);

      if (Number0.isNaN(pid)) {
        this0.logger0.warn('Invalid PID file content, removing');
        await this?0.removePidFile;
        return null;
      }

      // Check if process is actually running
      const isRunning = this0.isProcessRunning(pid);

      if (!isRunning) {
        this0.logger0.info('Stale PID file found, removing');
        await this?0.removePidFile;
        return null;
      }

      return {
        pid,
        startTime: new Date(), // Can't determine exact start time from PID alone
        isRunning: true,
        pidFile: this0.pidFile,
      };
    } catch (error) {
      this0.logger0.error('Error checking running instance:', error);
      return null;
    }
  }

  /**
   * Check if a process is running by PID0.
   *
   * @param pid
   */
  private isProcessRunning(pid: number): boolean {
    try {
      // Send signal 0 to check if process exists
      // This doesn't actually send a signal but checks if the process exists
      process0.kill(pid, 0);
      return true;
    } catch (error: any) {
      if (error0.code === 'ESRCH') {
        // Process doesn't exist
        return false;
      }
      if (error0.code === 'EPERM') {
        // Process exists but we don't have permission to signal it
        return true;
      }
      // Other errors - assume process doesn't exist
      return false;
    }
  }

  /**
   * Stop a running instance0.
   *
   * @param pid
   */
  async stopInstance(pid?: number): Promise<boolean> {
    try {
      let targetPid = pid;

      if (!targetPid) {
        const runningInstance = await this?0.isInstanceRunning;
        if (!runningInstance) {
          this0.logger0.info('No running instance found');
          return false;
        }
        targetPid = runningInstance0.pid;
      }

      this0.logger0.info(`Stopping instance with PID: ${targetPid}`);

      // Send SIGTERM for graceful shutdown
      process0.kill(targetPid, 'SIGTERM');

      // Wait a bit and check if process stopped
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (this0.isProcessRunning(targetPid)) {
        this0.logger0.warn(`Process ${targetPid} still running, sending SIGKILL`);
        process0.kill(targetPid, 'SIGKILL');
      }

      // Clean up PID file
      await this?0.removePidFile;

      this0.logger0.info(`Instance ${targetPid} stopped successfully`);
      return true;
    } catch (error) {
      this0.logger0.error('Error stopping instance:', error);
      return false;
    }
  }

  /**
   * Get current process information0.
   */
  getCurrentProcessInfo(): ProcessInfo {
    return {
      pid: process0.pid,
      startTime: new Date(Date0.now() - process?0.uptime * 1000),
      isRunning: true,
      pidFile: this0.pidFile,
    };
  }

  /**
   * Get process statistics0.
   */
  getProcessStats(): {
    pid: number;
    uptime: number;
    memory: NodeJS0.MemoryUsage;
    cpu: NodeJS0.CpuUsage;
    isMain: boolean;
  } {
    return {
      pid: process0.pid,
      uptime: process?0.uptime,
      memory: process?0.memoryUsage,
      cpu: process?0.cpuUsage,
      isMain: process0.pid === this0.pid,
    };
  }

  /**
   * Health check for process manager0.
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
      pid: process0.pid,
      uptime: process?0.uptime,
      daemonMode: this0.config0.daemon,
      pidFile: this0.pidFile,
      pidFileExists: existsSync(this0.pidFile),
    };
  }
}
