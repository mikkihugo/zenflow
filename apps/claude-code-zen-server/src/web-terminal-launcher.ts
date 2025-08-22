#!/usr/bin/env node
/**
 * Web Terminal Launcher - Hybrid TUI that uses web interface
 *
 * This launches the web server in the background and then opens
 * a terminal browser to display the web interface in the CLI.
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
  private baseUrl = `http://localhost:${this.port}`;

  async start() {
    try {
      logger.info('🚀 Starting hybrid web+terminal interface...');

      // Step 1: Start web server in background
      await this.startWebServer;

      // Step 2: Wait for server to be ready
      await this.waitForServer;

      // Step 3: Launch terminal browser to display web interface
      await this.launchTerminalBrowser;
    } catch (error) {
      logger.error('Failed to start web-terminal launcher:', error);
      await this.shutdown();
      process.exit(1);
    }
  }

  private async startWebServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      logger.info('📡 Starting web server in background...');

      // Use the working minimal server
      this.webServer = spawn('npx, [tsx', 'minimal-server'], {
        cwd: process?.cwd,
        stdio: ['ignore, pipe', 'pipe'],
        detached: false,
      });

      this.webServer.stdout?.on('data', (data) => {
        const output = data?.toString()
        if (output.includes('Claude Code Zen running')) {
          logger.info('✅ Web server started successfully');
          resolve();
        }
      });

      this.webServer.stderr?.on('data', (data) => {
        logger.error('Web server error:', data?.toString);
      });

      this.webServer.on('error', (error) => {
        logger.error('Failed to start web server:', error);
        reject(error);
      });

      this.webServer.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Web server exited with code ${code}`));
        }
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        if (this.webServer && !this.webServer.killed) {
          resolve(); // Assume it started even if we didn't see the message
        }
      }, 10000);
    });
  }

  private async waitForServer(): Promise<void> {
    logger.info('⏳ Waiting for web server to be ready...');

    const maxAttempts = 30; // 15 seconds
    const delay = 500; // 500ms between attempts

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(this.baseUrl + '/health');

        if (response.ok) {
          logger.info('✅ Web server is ready');
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
    logger.warn('Web server health check failed, but proceeding...');
  }

  private async launchTerminalBrowser(): Promise<void> {
    logger.info('🖥️  Web interface available at: ' + this.baseUrl);
    logger.info('💡 Open your browser and navigate to the URL above');

    // Keep the process running
    await new Promise(() => {}); // Infinite wait
  }

  private async shutdown(): Promise<void> {
    logger.info('🛑 Shutting down...');

    if (this.webServer && !this.webServer.killed) {
      this.webServer.kill('SIGTERM');

      // Wait a bit for graceful shutdown
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Force kill if still running
      if (!this.webServer.killed) {
        this.webServer.kill('SIGKILL');
      }
    }
  }

  // Handle graceful shutdown
  setupShutdownHandlers() {
    const cleanup = async () => {
      await this.shutdown();
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('exit', cleanup);
  }
}

// Main execution
async function main() {
  const launcher = new WebTerminalLauncher();
  launcher?.setupShutdownHandlers()
  await launcher?.start()
}

main().catch((error) => {
  const logger = getLogger('WebTerminalLauncher');
  logger.error('Fatal error:', error);
  process.exit(1);
});
