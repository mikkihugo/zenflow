/**
 * @file Claude-zen-integrated implementation.
 */

import { getLogger } from "@claude-zen/foundation";

// Removed missing coordination types - using basic types instead
type ServerInstance = unknown;
type BaseError = Error;
const hasErrorCode = (error: unknown): boolean =>
	error !== null && typeof error === "object" && "code" in error;

const logger = getLogger("claude-zen-integrated");

/**
 * Claude Code Zen - Integrated Application Entry Point.
 *
 * This file provides the CLI-compatible entry point with command-line argument support.
 * And integrates with HTTP server functionality for development and production use.
 */

interface IntegratedOptions {
	port?: number;
	daemon?: boolean;
	dev?: boolean;
	verbose?: boolean;
}

interface HealthResponse {
	status: string;
	timestamp: string;
	version: string;
}

interface StatusResponse {
	status: string;
	mode: string;
	daemon: boolean;
	uptime: number;
}

/**
 * Simplified application class with CLI support (avoiding DI decorators for now'.
 */
export class ClaudeZenIntegrated {
	private options: IntegratedOptions;
	private server?: ServerInstance; // HTTP server instance with proper typing

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
	 * Parse command line arguments.
	 *
	 * @param args - Command line arguments
	 * @returns Parsed options
	 */
	static parseArgs(args: string[]): IntegratedOptions {
		const options: IntegratedOptions = {};
		for (let i = 0; i < args.length; i++) {
			const arg = args[i];
			const result = ClaudeZenIntegrated.parseArgument(arg, args, i, options);
			if (result.skipNext) {
				i++; // Skip next argument for port parsing
			}
		}
		return options;
	}

	/**
	 * Parse a single argument to reduce cognitive complexity.
	 *
	 * @param arg - Current argument
	 * @param args - All arguments
	 * @param index - Current index
	 * @param options - Options object to modify
	 * @returns Object indicating if next argument should be skipped
	 */
	private static parseArgument(
		arg: string,
		args: string[],
		index: number,
		options: IntegratedOptions,
	): { skipNext: boolean } {
		switch (arg) {
			case "--port":
				return ClaudeZenIntegrated.parsePortArgument(args, index, options);
			case "--daemon":
				options.daemon = true;
				return { skipNext: false };
			case "--dev":
				options.dev = true;
				return { skipNext: false };
			case "--verbose":
			case "-v":
				options.verbose = true;
				return { skipNext: false };
			case "--help":
			case "-h":
				ClaudeZenIntegrated.showHelp();
				process.exit(0);
				return { skipNext: false };
			default:
				return { skipNext: false };
		}
	}

	/**
	 * Parse port argument with validation.
	 *
	 * @param args - All arguments
	 * @param index - Current index
	 * @param options - Options object to modify
	 * @returns Object indicating if next argument should be skipped
	 */
	private static parsePortArgument(
		args: string[],
		index: number,
		options: IntegratedOptions,
	): { skipNext: boolean } {
		if (index + 1 < args.length) {
			const nextArg = args[index + 1];
			if (nextArg !== undefined) {
				options.port = Number.parseInt(nextArg, 10);
			}
			return { skipNext: true };
		}
		return { skipNext: false };
	}

	/**
	 * Show help message.
	 */
	private static showHelp(): void {
		const helpMessage = `
Claude Code Zen - Integrated Application

Usage: node claude-zen-integrated.js [options]

Options:
  --port <number>    Port number for HTTP server (default: 3000)
  --daemon           Run in daemon mode
  --dev              Development mode
  --verbose, -v      Verbose logging
  --help, -h         Show this help message
`;
		// Use process.stdout.write instead of console.log to avoid ESLint error
		process.stdout.write(helpMessage);
	}

	/**
	 * Initialize basic system without DI complexity.
	 */
	async initialize(): Promise<void> {
		logger.info("🚀 Initializing Claude Code Zen Integrated");

		// Start HTTP server if port is specified
		if (this.options.port) {
			await this.startServer();
		}

		logger.info("✅ Claude Code Zen Integrated initialized successfully");
	}

	/**
	 * Start HTTP server for API access.
	 */
	private async startServer(): Promise<void> {
		try {
			// Import express dynamically to avoid loading it if not needed
			const express = await import("express");
			const app = express.default();

			// Basic health check endpoint
			app.get(
				"/health",
				(_req: unknown, res: { json: (data: HealthResponse) => void }) => {
					res.json({
						status: "healthy",
						timestamp: new Date().toISOString(),
						version: "2.0.0-alpha.73",
					});
				},
			);

			// API status endpoint
			app.get(
				"/api/status",
				(_req: unknown, res: { json: (data: StatusResponse) => void }) => {
					res.json({
						status: "running",
						mode: this.options.dev ? "development" : "production",
						daemon: this.options.daemon ?? false,
						uptime: process.uptime(),
					});
				},
			);

			// Start server
			const expressServer = app.listen(this.options.port, () => {
				logger.info(`HTTP server started on port ${this.options.port}`);
				logger.info(
					`Health check: http://localhost:${this.options.port}/health`,
				);
			});

			// Wrap Express server with ServerInstance interface
			this.server = {
				id: `server-${Date.now()}`,
				status: "running",
				port: this.options.port,
				host: "localhost",
				uptime: 0,
				close: expressServer.close.bind(expressServer),
				on: expressServer.on.bind(expressServer),
			};

			expressServer.on("error", (err: BaseError) => {
				logger.error("Server error:", err);
				if (
					hasErrorCode(err) &&
					(err as unknown as { code: string }).code === "EADDRINUSE"
				) {
					logger.error(`Port ${this.options.port} is already in use`);
				}
				throw err;
			});
		} catch (error) {
			logger.error("❌ Failed to start HTTP server:", error);
			throw error;
		}
	}

	/**
	 * Simplified shutdown.
	 */
	async shutdown(): Promise<void> {
		logger.info("🛑 Shutting down Claude Code Zen Integrated");

		// Close HTTP server
		if ((this.server as any)?.close) {
			await new Promise<void>((resolve, reject) => {
				(this.server as any)?.close?.((err?: Error) => {
					if (err) reject(err);
					else resolve();
				});
			});
		}

		logger.info("✅ Shutdown completed successfully");
	}
}

/**
 * Main entry point for CLI usage.
 */
async function main() {
	// Parse command line arguments
	const args = process.argv.slice(2);
	const options = ClaudeZenIntegrated.parseArgs(args);

	// Create and start application
	const app = new ClaudeZenIntegrated(options);

	// Handle graceful shutdown
	const shutdown = async () => {
		await app?.shutdown();
		process.exit(0);
	};

	process.on("SIGINT", shutdown);
	process.on("SIGTERM", shutdown);

	try {
		await app?.initialize();

		// Keep process alive if not in daemon mode
		if (!options?.daemon) {
			// Running in foreground mode - process will stay alive naturally
			logger.info("Running in foreground mode");
		}

		// Keep the process running with health checks
		setInterval(() => {
			// Application heartbeat - could add health checks here
			logger.debug("Application heartbeat");
		}, 10000);
	} catch (error) {
		logger.error("❌ Failed to start Claude Code Zen Integrated:", error);
		process.exit(1);
	}
}

// Start the application if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch((error) => {
		const logger = getLogger("ClaudeZenIntegrated");
		logger.error("Fatal error in main:", error);
		process.exit(1);
	});
}
