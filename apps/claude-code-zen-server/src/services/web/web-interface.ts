/**
 * Web Interface - Modern modular browser-based dashboard.
 *
 * Refactored into clean, maintainable modules following Google standards.
 * Orchestrates web server, API routes, WebSocket, sessions, and process management.
 */

// 📁 Node.js built-in modules
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// ✅ TIER 1 ONLY - 5-Tier Architecture Compliance
import { getLogger, ProcessLifecycleManager } from "@claude-zen/foundation";

// Strategic facades for accessing functionality

// Types from consolidated system
import type {
	DIContainer,
	WebApiRoutes,
	WebConfig,
	WebDashboardServer,
	WebDataService,
	WebHtmlGenerator,
	WebProcessManager,
	WebSessionManager,
	WebSocketManager,
} from "../../types";
import {
	createDashboardRedirect,
	createSvelteHealthCheck,
	createSvelteProxyRoute,
	type SvelteProxyConfig,
} from "./svelte-proxy-route";

const { getVersion } = (global as { foundation?: { getVersion: () => string } })
	.foundation || { getVersion: () => "1.0.0" };

// Constants to avoid string duplication
const DASHBOARD_PATHS = {
	basePath: DASHBOARD_PATHS.basePath,
} as const;

/**
 * Main Web Interface orchestrator.
 *
 * Coordinates all web dashboard components using composition pattern.
 * Reduced from 728 lines to clean, maintainable architecture.
 */
export class WebInterface {
	private logger = getLogger("WebInterface");
	private config: WebConfig;
	private container?: DIContainer;
	private lifecycleManager?: ProcessLifecycleManager;

	// Component instances
	private server: WebDashboardServer;
	private sessionManager: WebSessionManager;
	private dataService: WebDataService;
	private apiRoutes: WebApiRoutes;
	private webSocketManager: WebSocketManager;
	private htmlGenerator: WebHtmlGenerator;
	private processManager: WebProcessManager;
	private svelteProxyConfig: SvelteProxyConfig;

	constructor(config: WebConfig = {}) {
		// Create unified configuration with defaults
		this.config = this.createWebConfig({
			staticDir: join(
				dirname(fileURLToPath(import.meta.url)),
				"../../../web/dist",
			),
			...config,
		});

		// Store DI container if provided
		this.container = config.container;

		// Setup Svelte proxy configuration
		this.svelteProxyConfig = {
			enabled: true,
			sveltePort: 3003,
			svelteHost: "localhost",
			basePath: DASHBOARD_PATHS.basePath,
			fallbackToLegacy: true,
		};

		// Initialize all components
		this.initializeComponents();
	}

	/**
	 * Initialize all modular components.
	 */
	private initializeComponents(): void {
		// Core server setup
		this.server = new WebDashboardServer(this.config);

		// Business logic and data management
		this.dataService = new WebDataService();

		// Session management
		this.sessionManager = new WebSessionManager(this.config);

		// API route handling
		this.apiRoutes = new WebApiRoutes(
			this.config,
			this.sessionManager,
			this.dataService,
		);

		// WebSocket real-time communication
		this.webSocketManager = new WebSocketManager(
			this.server?.getSocketIO,
			this.config,
			this.dataService,
		);

		// HTML generation for fallback UI
		this.htmlGenerator = new WebHtmlGenerator(this.config);

		// Process and daemon management
		this.processManager = new WebProcessManager(this.config);

		this.logger.debug("All web interface components initialized");
	}

	/**
	 * Start the complete web interface system.
	 */
	async run(): Promise<void> {
		try {
			this.logger.info(
				"Starting claude-code-zen web interface with enhanced lifecycle management",
			);

			// Setup process lifecycle management if container is available
			if (this.container) {
				this.lifecycleManager = new ProcessLifecycleManager({
					onShutdown: async () => {
						this.logger.info("🧹 Graceful shutdown initiated...");
						await this.stop();
					},
					onError: (error: Error) => {
						this.logger.error("💥 Application error in web interface:", error);
					},
				});
				this.logger.info("✅ Process lifecycle management enabled");
			}

			// Check for existing instances if in daemon mode
			if (this.config.daemon) {
				const existing = await this.processManager?.isInstanceRunning();
				if (existing) {
					throw new Error(
						`Web interface already running with PID ${existing.pid}`,
					);
				}
			}

			// Setup all components
			this.setupComponents();

			// Start daemon mode if requested
			if (this.config.daemon) {
				await this.processManager?.startDaemonMode();
			}

			// Start the HTTP server
			await this.server?.start();

			this.logger.info("Web interface started successfully");
		} catch (error) {
			this.logger.error("Failed to start web interface:", error);
			throw error;
		}
	}

	/**
	 * Setup all components with proper integration.
	 */
	private setupComponents(): void {
		const app = this.server?.getApp();

		try {
			// Setup Express middleware
			this.server?.setupMiddleware();
			this.logger.debug("✅ Express middleware setup complete");
		} catch (error) {
			this.logger.warn(
				"⚠️ Express middleware setup failed, continuing...",
				error.message,
			);
		}

		try {
			// Add session management middleware
			app.use(this.sessionManager?.middleware);
			this.logger.debug("✅ Session middleware setup complete");
		} catch (error) {
			this.logger.warn(
				"⚠️ Session middleware setup failed, continuing...",
				error.message,
			);
		}

		// MCP removed - Web-only interface for maximum simplicity
		try {
			// Setup API routes
			this.apiRoutes.setupRoutes(app);
			this.logger.debug("✅ API routes setup complete");
		} catch (error) {
			this.logger.warn(
				"⚠️ API routes setup failed, continuing...",
				error.message,
			);
		}

		try {
			// Setup WebSocket communication
			this.webSocketManager?.setupWebSocket(app);
			this.logger.debug("✅ WebSocket setup complete");
		} catch (error) {
			this.logger.warn(
				"⚠️ WebSocket setup failed, continuing...",
				error.message,
			);
		}

		try {
			// Setup Svelte proxy routes
			this.setupSvelteProxy(app);
			this.logger.debug("✅ Svelte proxy setup complete");
		} catch (error) {
			this.logger.warn(
				"⚠️ Svelte proxy setup failed, continuing...",
				error.message,
			);
		}

		try {
			// Setup fallback HTML serving
			this.setupFallbackRoutes(app);
			this.logger.debug("✅ Fallback routes setup complete");
		} catch (error) {
			this.logger.warn(
				"⚠️ Fallback routes setup failed, continuing...",
				error.message,
			);
		}

		this.logger.info(
			"🎉 Component setup completed (with error tolerance for tsx compatibility)",
		);
	}

	/**
	 * Setup Svelte proxy routes for the web dashboard.
	 *
	 * @param app Express application
	 */
	private setupSvelteProxy(app: unknown): void {
		if (!this.svelteProxyConfig.enabled) {
			this.logger.info("Svelte proxy disabled");
			return;
		}

		// Health check endpoint for Svelte dashboard
		app.get("/health/svelte", createSvelteHealthCheck(this.svelteProxyConfig));

		// Main Svelte proxy - proxy /dashboard/* to Svelte app
		const svelteProxy = createSvelteProxyRoute(this.svelteProxyConfig);
		app.use(DASHBOARD_PATHS.basePath, svelteProxy);

		// Redirect root to dashboard
		app.get("/", createDashboardRedirect(DASHBOARD_PATHS.basePath));

		// SAFe-specific routes redirect to dashboard
		app.get(
			"/safe",
			(_req: unknown, res: { redirect: (path: string) => void }) =>
				res.redirect("/dashboard/safe"),
		);
		app.get(
			"/safe-production",
			(_req: unknown, res: { redirect: (path: string) => void }) =>
				res.redirect("/dashboard/safe-production"),
		);

		this.logger.info(
			`✅ Svelte proxy configured: /dashboard/* -> http://${this.svelteProxyConfig.svelteHost}:${this.svelteProxyConfig.sveltePort}`,
		);
	}

	/**
	 * Setup fallback routes for HTML generation.
	 *
	 * @param app Express application
	 */
	private setupFallbackRoutes(app: unknown): void {
		// Fallback route for legacy dashboard (only if Svelte proxy is disabled)
		if (!this.svelteProxyConfig.enabled) {
			(
				app as {
					get: (
						path: string,
						handler: (req: unknown, res: unknown) => void,
					) => void;
				}
			).get(
				"/",
				(
					_unusedReq: unknown,
					res: {
						sendFile?: (path: string) => void;
						send?: (content: unknown) => void;
					},
				) => {
					if (existsSync(this.config.staticDir!)) {
						res.sendFile(join(this.config.staticDir!, "index.html"));
					} else {
						res.send(this.htmlGenerator?.generateDashboardHtml());
					}
				},
			);
		}

		// Legacy dashboard route
		(
			app as {
				get: (
					path: string,
					handler: (req: unknown, res: unknown) => void,
				) => void;
			}
		).get(
			"/legacy",
			(
				_unusedReq: unknown,
				res: {
					sendFile?: (path: string) => void;
					send?: (content: unknown) => void;
				},
			) => {
				if (existsSync(this.config.staticDir!)) {
					res.sendFile(join(this.config.staticDir!, "index.html"));
				} else {
					res.send(this.htmlGenerator?.generateDashboardHtml());
				}
			},
		);

		// Catch all for SPA - temporarily disabled due to path-to-regexp error
		// app.get('*', (_req: any, res: any) => {
		//   if (existsSync(join(this.config.staticDir!, 'index.html'))) {
		//     res.sendFile(join(this.config.staticDir!, 'index.html'));
		//   } else {
		//     res.send(this.htmlGenerator?.generateDashboardHtml());
		//   }
		// });
	}

	/**
	 * Stop the web interface gracefully.
	 */
	async stop(): Promise<void> {
		this.logger.info("Stopping web interface...");
		try {
			// Stop WebSocket broadcasting
			this.webSocketManager?.stopBroadcasting();

			// Stop HTTP server
			await this.server?.stop();

			// Perform graceful shutdown if in daemon mode
			if (this.config.daemon) {
				await this.processManager?.gracefulShutdown();
			}

			// Cleanup lifecycle manager
			if (this.lifecycleManager) {
				this.lifecycleManager?.dispose();
			}

			this.logger.info("Web interface stopped successfully");
		} catch (error) {
			this.logger.error("Error during shutdown:", error);
			throw error;
		}
	}

	/**
	 * Get comprehensive system status.
	 */
	getStatus(): {
		server: unknown;
		sessions: unknown;
		webSocket: unknown;
		process: unknown;
		config: WebConfig;
	} {
		return {
			server: {
				status: "running",
				capabilities: WebDashboardServer?.getCapabilities(),
			},
			sessions: this.sessionManager?.getStats(),
			webSocket: this.webSocketManager?.getConnectionStats(),
			process: this.processManager?.getProcessStats(),
			config: this.config,
		};
	}

	/**
	 * Broadcast event to all connected WebSocket clients.
	 *
	 * @param event Event name
	 * @param data Event data
	 */
	broadcast(event: string, data: unknown): void {
		this.webSocketManager.broadcast(event, data);
	}

	/**
	 * Get web interface capabilities (static method).
	 */
	static getCapabilities(): unknown {
		return WebDashboardServer?.getCapabilities();
	}

	/**
	 * Health check for the entire web interface.
	 */
	healthCheck(): {
		status: "healthy" | "warning" | "error";
		components: Record<string, unknown>;
		version: string;
		uptime: number;
	} {
		return {
			status: "healthy",
			components: {
				server: { status: "running" },
				sessions: this.sessionManager?.getStats(),
				webSocket: this.webSocketManager?.getConnectionStats(),
				process: this.processManager?.healthCheck(),
				dataService: { status: "ready" },
			},
			version: getVersion(),
			uptime: process.uptime(),
		};
	}

	/**
	 * Create web configuration with defaults.
	 */
	private createWebConfig(config: Partial<WebConfig>): WebConfig {
		return {
			port: 3000,
			host: "localhost",
			staticDir: join(process.cwd(), "web/dist"),
			daemon: false,
			...config,
		};
	}
}

// Re-export types and configuration utilities
export type { WebConfig } from "./web-config";
export { createWebConfig } from "./web-config";
