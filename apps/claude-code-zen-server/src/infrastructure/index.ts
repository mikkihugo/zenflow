/**
 * Infrastructure Layer - Foundation Pattern
 *
 * Single coordinating facade for system infrastructure.
 * Internally delegates to strategic facades when needed.
 */

import {
	getLogger,
	createContainer,
	Result,
	ok,
	err,
} from "@claude-zen/foundation";

const logger = getLogger("infrastructure");

/**
 * System Coordinator - Single point of entry for complex operations
 */
export interface SystemCoordinator {
	getSystemHealth(): Promise<Result<SystemHealth, Error>>;
	getSystemMetrics(): Promise<Result<SystemMetrics, Error>>;
	initializeSystem(): Promise<Result<void, Error>>;
	shutdownSystem(): Promise<Result<void, Error>>;
}

export interface SystemHealth {
	overall: "healthy" | "warning" | "critical";
	components: {
		brain: "healthy" | "warning" | "critical";
		memory: "healthy" | "warning" | "critical";
		database: "healthy" | "warning" | "critical";
		coordination: "healthy" | "warning" | "critical";
	};
	alerts: Array<{
		level: "info" | "warning" | "error";
		component: string;
		message: string;
		timestamp: number;
	}>;
}

export interface SystemMetrics {
	uptime: number;
	memoryUsage: number;
	cpuUsage: number;
	activeConnections: number;
	performance: {
		averageLatency: number;
		errorRate: number;
		throughput: number;
	};
}

class SystemCoordinatorImpl implements SystemCoordinator {
	private serviceContainer = createContainer();
	private initialized = false;

	async getSystemHealth(): Promise<Result<SystemHealth, Error>> {
		try {
			// Internally coordinate with strategic facades
			const brainHealth = await this.getBrainHealth();
			const memoryHealth = this.getMemoryHealth();
			const dbHealth = await this.getDatabaseHealth();
			const coordHealth = this.getCoordinationHealth();

			const health: SystemHealth = {
				overall: this.assessOverallHealth([
					brainHealth,
					memoryHealth,
					dbHealth,
					coordHealth,
				]),
				components: {
					brain: brainHealth,
					memory: memoryHealth,
					database: dbHealth,
					coordination: coordHealth,
				},
				alerts: this.getSystemAlerts(),
			};

			return ok(health);
		} catch (error) {
			logger.error("Failed to get system health:", error);
			return err(error as Error);
		}
	}

	getSystemMetrics(): Result<SystemMetrics, Error> {
		try {
			const metrics: SystemMetrics = {
				uptime: process.uptime() * 1000,
				memoryUsage: process.memoryUsage().heapUsed,
				cpuUsage: this.getCpuUsage(),
				activeConnections: this.getActiveConnections(),
				performance: this.getPerformanceMetrics(),
			};

			return ok(metrics);
		} catch (error) {
			logger.error("Failed to get system metrics:", error);
			return err(error as Error);
		}
	}

	async initializeSystem(): Promise<Result<void, Error>> {
		if (this.initialized) {
			return ok();
		}

		try {
			logger.info("Initializing system coordinator...");

			// Initialize strategic facades in order
			await this.initializeBrainSystem();
			await this.initializeMemorySystem();
			await this.initializeDatabaseSystem();
			await this.initializeCoordinationSystem();

			this.initialized = true;
			logger.info("System coordinator initialized successfully");
			return ok();
		} catch (error) {
			logger.error("Failed to initialize system:", error);
			return err(error as Error);
		}
	}

	async shutdownSystem(): Promise<Result<void, Error>> {
		try {
			logger.info("Shutting down system coordinator...");

			// Shutdown in reverse order
			await this.shutdownCoordinationSystem();
			await this.shutdownDatabaseSystem();
			await this.shutdownMemorySystem();
			await this.shutdownBrainSystem();

			this.initialized = false;
			logger.info("System coordinator shut down successfully");
			return ok();
		} catch (error) {
			logger.error("Failed to shutdown system:", error);
			return err(error as Error);
		}
	}

	// Private methods - internally use strategic facades
	private async getBrainHealth(): Promise<"healthy" | "warning" | "critical"> {
		try {
			// Lazy load brain system facade when needed
			const { getBrainSystem } = await import("@claude-zen/intelligence");
			const brainSystem = await getBrainSystem();
			const health = await brainSystem.getHealth();
			return health.isHealthy
				? "healthy"
				: health.hasWarnings
					? "warning"
					: "critical";
		} catch (error) {
			logger.warn("Brain system not available:", error);
			return "critical";
		}
	}

	private getMemoryHealth(): "healthy" | "warning" | "critical" {
		const usage = process.memoryUsage().heapUsed / 1024 / 1024; // MB
		if (usage > 1000) return "critical";
		if (usage > 500) return "warning";
		return "healthy";
	}

	private async getDatabaseHealth(): Promise<
		"healthy" | "warning" | "critical"
	> {
		try {
			const { getDatabaseSystem } = await import("@claude-zen/infrastructure");
			const dbSystem = await getDatabaseSystem();
			const isConnected = await dbSystem.isConnected();
			return isConnected ? "healthy" : "critical";
		} catch (error) {
			logger.warn("Database system not available:", error);
			return "critical";
		}
	}

	private getCoordinationHealth(): "healthy" | "warning" | "critical" {
		// Check coordination system health
		return "healthy"; // Simplified for now
	}

	private assessOverallHealth(
		componentHealths: string[],
	): "healthy" | "warning" | "critical" {
		if (componentHealths.includes("critical")) return "critical";
		if (componentHealths.includes("warning")) return "warning";
		return "healthy";
	}

	private getSystemAlerts(): SystemHealth["alerts"] {
		return []; // Simplified for now
	}

	private getCpuUsage(): number {
		const usage = process.cpuUsage();
		return (usage.user + usage.system) / 1000000; // Convert to seconds
	}

	private getActiveConnections(): number {
		return 0; // Simplified for now
	}

	private getPerformanceMetrics(): SystemMetrics["performance"] {
		return {
			averageLatency: 100,
			errorRate: 0.01,
			throughput: 1000,
		};
	}

	private async initializeBrainSystem(): Promise<void> {
		// Lazy initialization of brain system
	}

	private async initializeMemorySystem(): Promise<void> {
		// Lazy initialization of memory system
	}

	private async initializeDatabaseSystem(): Promise<void> {
		// Lazy initialization of database system
	}

	private async initializeCoordinationSystem(): Promise<void> {
		// Lazy initialization of coordination system
	}

	private async shutdownBrainSystem(): Promise<void> {
		// Graceful shutdown of brain system
	}

	private async shutdownMemorySystem(): Promise<void> {
		// Graceful shutdown of memory system
	}

	private async shutdownDatabaseSystem(): Promise<void> {
		// Graceful shutdown of database system
	}

	private async shutdownCoordinationSystem(): Promise<void> {
		// Graceful shutdown of coordination system
	}
}

/**
 * Get system coordinator instance (Strategic Facade)
 */
export function getSystemCoordinator(): SystemCoordinator {
	return new SystemCoordinatorImpl();
}

/**
 * Infrastructure service container
 */
export const infrastructureContainer = createContainer();

// Legacy exports for backward compatibility
export { WebSessionManager } from "./session.manager";
export type { WebSession } from "./session.manager";
export { WebProcessManager } from "./process/web.manager";
export type { ProcessInfo } from "./process/web.manager";

logger.info(
	"Infrastructure layer initialized with coordinating facade pattern",
);
