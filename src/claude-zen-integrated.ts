/**
 * Claude Code Zen - Integrated Application Entry Point
 *
 * This file provides the CLI-compatible entry point with command-line argument support
 * and integrates with HTTP server functionality for development and production use.
 */

interface IntegratedOptions {
  port?: number;
  daemon?: boolean;
  dev?: boolean;
  verbose?: boolean;
}

/**
 * Simplified application class with CLI support (avoiding DI decorators for now)
 */
export class ClaudeZenIntegrated {
  private options: IntegratedOptions;
  private server?: any; // HTTP server instance

  constructor(options: IntegratedOptions = {}) {
    this.options = {
      port: 3000,
      daemon: false,
      dev: false,
      verbose: false,
      ...options,
    };
  }

  /**
   * Parse command line arguments
   */
  static parseArgs(args: string[]): IntegratedOptions {
    const options: IntegratedOptions = {};

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg === '--port' && i + 1 < args.length) {
        options.port = parseInt(args[i + 1], 10);
        i++; // Skip next argument
      } else if (arg === '--daemon') {
        options.daemon = true;
      } else if (arg === '--dev') {
        options.dev = true;
      } else if (arg === '--verbose' || arg === '-v') {
        options.verbose = true;
      } else if (arg === '--help' || arg === '-h') {
        console.log(
          `
Claude Code Zen - Integrated AI Coordination Platform

Usage: claude-zen-integrated [options]

Options:
  --port <number>     HTTP server port (default: 3000)
  --daemon           Run as daemon process
  --dev              Development mode with hot reload
  --verbose, -v      Verbose logging
  --help, -h         Show this help message

Examples:
  claude-zen-integrated --port 3000 --dev
  claude-zen-integrated --daemon --verbose
        `.trim(),
        );
        process.exit(0);
      }
    }

    return options;
  }

  /**
   * Initialize basic system without DI complexity
   */
  async initialize(): Promise<void> {
    console.log('🚀 Starting Claude Code Zen Integrated...');

    // Basic initialization without complex DI for now
    console.log('✅ Core system initialized');

    // Start HTTP server if port is specified
    if (this.options.port) {
      await this.startServer();
    }

    console.log(`✅ Claude Code Zen ready on port ${this.options.port || 'none'}`);
  }

  /**
   * Start HTTP server for API access
   */
  private async startServer(): Promise<void> {
    try {
      // Import express dynamically to avoid loading it if not needed
      const express = await import('express');
      const app = express.default();

      // Basic health check endpoint
      app.get('/health', (req: any, res: any) => {
        res.json({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          version: '2.0.0-alpha.73',
        });
      });

      // API status endpoint
      app.get('/api/status', (req: any, res: any) => {
        res.json({
          status: 'running',
          mode: this.options.dev ? 'development' : 'production',
          daemon: this.options.daemon,
          uptime: process.uptime(),
        });
      });

      // Start server
      this.server = app.listen(this.options.port, () => {
        console.log(`🌐 HTTP server listening on port ${this.options.port}`);
      });
    } catch (error) {
      console.error('❌ Failed to start HTTP server:', error);
      throw error;
    }
  }

  /**
   * Simplified shutdown
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down Claude Code Zen Integrated...');

    // Close HTTP server
    if (this.server) {
      await new Promise<void>((resolve, reject) => {
        this.server.close((err: any) => {
          if (err) reject(err);
          else resolve();
        });
      });
      console.log('🌐 HTTP server stopped');
    }

    console.log('✅ Shutdown completed successfully');
  }
}

/**
 * Main entry point for CLI usage
 */
async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const options = ClaudeZenIntegrated.parseArgs(args);

  // Create and start application
  const app = new ClaudeZenIntegrated(options);

  // Handle graceful shutdown
  const shutdown = async () => {
    await app.shutdown();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  try {
    await app.initialize();

    // Keep process alive
    if (!options.daemon) {
      console.log('Press Ctrl+C to stop...');
    }

    // Keep the process running
    setInterval(() => {
      // Application heartbeat - could add health checks here
    }, 10000);
  } catch (error) {
    console.error('❌ Failed to start Claude Code Zen Integrated:', error);
    process.exit(1);
  }
}

// Start the application if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default ClaudeZenIntegrated;
