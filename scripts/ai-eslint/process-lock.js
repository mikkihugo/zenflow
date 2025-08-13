#!/usr/bin/env node

/**
 * 🔒 Process Lock Manager for Zen ESLint
 * Prevents multiple ESLint instances from running simultaneously
 */

import fs from 'fs';
import os from 'os';
import path from 'path';

export class ProcessLock {
  constructor(name = 'zen-eslint') {
    this.lockFile = path.join(os.tmpdir(), `${name}.lock`);
    this.pid = process.pid;
    this.acquired = false;
  }

  /**
   * Acquire lock or throw error if another process is running
   */
  acquire() {
    if (fs.existsSync(this.lockFile)) {
      const existingPid = fs.readFileSync(this.lockFile, 'utf8').trim();

      // Check if the process is still running
      if (this.isProcessRunning(existingPid)) {
        throw new Error(
          `Another Zen ESLint process is already running (PID: ${existingPid})`
        );
      }
      // Stale lock file, remove it
      console.log(
        `Removing stale lock file (PID ${existingPid} no longer running)`
      );
      this.release();
    }

    // Create lock file
    fs.writeFileSync(this.lockFile, this.pid.toString());
    this.acquired = true;

    // Set up cleanup handlers
    process.on('exit', () => this.release());
    process.on('SIGINT', () => {
      this.release();
      process.exit(0);
    });
    process.on('SIGTERM', () => {
      this.release();
      process.exit(0);
    });
    process.on('uncaughtException', (error) => {
      console.error('Uncaught exception:', error);
      this.release();
      process.exit(1);
    });

    console.log(`✅ Process lock acquired (PID: ${this.pid})`);
  }

  /**
   * Release the lock
   */
  release() {
    if (this.acquired && fs.existsSync(this.lockFile)) {
      try {
        fs.unlinkSync(this.lockFile);
        this.acquired = false;
        console.log(`🔓 Process lock released (PID: ${this.pid})`);
      } catch (error) {
        console.warn('Warning: Could not remove lock file:', error.message);
      }
    }
  }

  /**
   * Check if a process is still running
   */
  isProcessRunning(pid) {
    try {
      process.kill(pid, 0); // Signal 0 just checks if process exists
      return true;
    } catch (error) {
      return false; // Process doesn't exist
    }
  }

  /**
   * Static helper to wrap execution with lock
   */
  static async withLock(name, fn) {
    const lock = new ProcessLock(name);
    try {
      lock.acquire();
      return await fn();
    } finally {
      lock.release();
    }
  }
}
