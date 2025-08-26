/**
 * Claude Code Zen Server Entry Point
 * Main server application with comprehensive coordination system
 */

import { createServer } from "http";

import { getSafeFramework } from "@claude-zen/enterprise";
import { getLogger } from "@claude-zen/foundation";
import { getDatabaseSystem } from "@claude-zen/infrastructure";
import { getBrainSystem } from "@claude-zen/intelligence";
import { getPerformanceTracker } from "@claude-zen/operations";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { Server } from "socket.io";

import { ApplicationCoordinator } from "./core/application-coordinator";
import { CoreSystem } from "./core/core-system";
import { setupRoutes } from "./routes";
import { setupWebSocketHandlers } from "./websocket";

const logger = getLogger("server");
const PORT = process.env.PORT || 3000;

async function startServer() {
	try {
		// Initialize core systems
		const databaseSystem = await getDatabaseSystem();
		const brainSystem = await getBrainSystem();
		const safeFramework = await getSafeFramework();
		const performanceTracker = await getPerformanceTracker();

		// Initialize core system
		const coreSystem = new CoreSystem({
			database: databaseSystem,
			brain: brainSystem,
			safety: safeFramework,
			performance: performanceTracker,
		});

		await coreSystem.initialize();

		// Initialize application coordinator
		const applicationCoordinator = new ApplicationCoordinator(coreSystem);
		await applicationCoordinator.initialize();

		// Create Express app
		const app = express();
		const server = createServer(app);
		const io = new Server(server, {
			cors: {
				origin: process.env.CLIENT_URL || "http://localhost:3002",
				methods: ["GET", "POST"],
			},
		});

		// Middleware
		app.use(helmet());
		app.use(cors());
		app.use(express.json({ limit: "50mb" }));
		app.use(express.urlencoded({ extended: true, limit: "50mb" }));

		// Setup routes with coordination system
		setupRoutes(app, {
			coreSystem,
			applicationCoordinator,
			database: databaseSystem,
			brain: brainSystem,
			safety: safeFramework,
			performance: performanceTracker,
		});

		// Setup WebSocket handlers
		setupWebSocketHandlers(io, applicationCoordinator);

		// Health check endpoint
		app.get("/health", (req, res) => {
			res.json({
				status: "healthy",
				timestamp: new Date().toISOString(),
				version: process.env.npm_package_version || "1.0.0",
			});
		});

		// Start server
		server.listen(PORT, () => {
			logger.info(`Claude Code Zen Server started on port ${PORT}`);
			logger.info(`Health check: http://localhost:${PORT}/health`);
			logger.info(`WebSocket server ready`);
		});

		// Graceful shutdown
		process.on("SIGTERM", async () => {
			logger.info("Received SIGTERM, shutting down gracefully");
			await applicationCoordinator.shutdown();
			await coreSystem.shutdown();
			server.close(() => {
				logger.info("Server shutdown complete");
				process.exit(0);
			});
		});
	} catch (error) {
		logger.error("Failed to start server:", error);
		process.exit(1);
	}
}

// Start the server
startServer().catch((error) => {
	getLogger("server-startup").error(
		"Unhandled error during server startup:",
		error,
	);
	process.exit(1);
});

export { startServer };
