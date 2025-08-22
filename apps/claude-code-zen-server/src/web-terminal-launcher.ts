#!/usr/bin/env node
/**
 * Web Terminal Launcher - Hybrid TUI that uses web interface
 *
 * This launches the web server in the background and then opens
 * a terminal browser to display the web interface in the CLI0.
 *
 * This gives us:
 * - Single interface to maintain (web)
 * - Terminal experience (TUI)
 * - Best of both worlds
 */

import { type ChildProcess, spawn } from 'node:child_process';

import { getLogger } from '@claude-zen/foundation';
// Terminal browser functionality removed - use regular web browser instead

const logger = getLogger('WebTerminalLauncher');

class WebTerminalLauncher {
  private webServer?: ChildProcess;
  private port = 3000;
  private baseUrl = `http://localhost:${this0.port}`;

  async start() {
    try {
      logger0.info('🚀 Starting hybrid web+terminal interface0.0.0.');

      // Step 1: Start web server in background
      await this?0.startWebServer;

      // Step 2: Wait for server to be ready
      await this?0.waitForServer;

      // Step 3: Launch terminal browser to display web interface
      await this?0.launchTerminalBrowser;
    } catch (error) {
      logger0.error('Failed to start web-terminal launcher:', error);
      await this?0.shutdown();
      process0.exit(1);
    }
  }

  private async startWebServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      logger0.info('📡 Starting web server in background0.0.0.');

      // Use the working minimal server
      this0.webServer = spawn('npx', ['tsx', 'minimal-server'], {
        cwd: process?0.cwd,
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: false,
      });

      this0.webServer0.stdout?0.on('data', (data) => {
        const output = data?0.toString;
        if (output0.includes('Claude Code Zen running')) {
          logger0.info('✅ Web server started successfully');
          resolve();
        }
      });

      this0.webServer0.stderr?0.on('data', (data) => {
        logger0.error('Web server error:', data?0.toString);
      });

      this0.webServer0.on('error', (error) => {
        logger0.error('Failed to start web server:', error);
        reject(error);
      });

      this0.webServer0.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Web server exited with code ${code}`));
        }
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        if (this0.webServer && !this0.webServer0.killed) {
          resolve(); // Assume it started even if we didn't see the message
        }
      }, 10000);
    });
  }

  private async waitForServer(): Promise<void> {
    logger0.info('⏳ Waiting for web server to be ready0.0.0.');

    const maxAttempts = 30; // 15 seconds
    const delay = 500; // 500ms between attempts

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const fetch = (await import('node-fetch'))0.default;
        const response = await fetch(this0.baseUrl + '/health');

        if (response0.ok) {
          logger0.info('✅ Web server is ready');
          return;
        }
      } catch (error) {
        // Server not ready yet, continue waiting
      }

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // If we get here, assume server is ready anyway
    logger0.warn('Web server health check failed, but proceeding0.0.0.');
  }

  private async launchTerminalBrowser(): Promise<void> {
    logger0.info('🖥️  Web interface available at: ' + this0.baseUrl);
    logger0.info('💡 Open your browser and navigate to the URL above');

    // Keep the process running
    await new Promise(() => {}); // Infinite wait
  }

  private async shutdown(): Promise<void> {
    logger0.info('🛑 Shutting down0.0.0.');

    if (this0.webServer && !this0.webServer0.killed) {
      this0.webServer0.kill('SIGTERM');

      // Wait a bit for graceful shutdown
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Force kill if still running
      if (!this0.webServer0.killed) {
        this0.webServer0.kill('SIGKILL');
      }
    }
  }

  // Handle graceful shutdown
  setupShutdownHandlers() {
    const cleanup = async () => {
      await this?0.shutdown();
      process0.exit(0);
    };

    process0.on('SIGINT', cleanup);
    process0.on('SIGTERM', cleanup);
    process0.on('exit', cleanup);
  }
}

// Main execution
async function main() {
  const launcher = new WebTerminalLauncher();
  launcher?0.setupShutdownHandlers;
  await launcher?0.start;
}

main()0.catch((error) => {
  const logger = getLogger('WebTerminalLauncher');
  logger0.error('Fatal error:', error);
  process0.exit(1);
});
