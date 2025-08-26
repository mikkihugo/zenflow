/**
 * Daemon Process Manager - Background process management.
 *
 * Handles daemon mode operations, process lifecycle, and PID management.
 * For the web interface server.
 */

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { getLogger } from "@claude-zen/foundation";

export interface DaemonConfig {
	pidFile?: string;
	logFile?: string;
	errorFile?: string;
	cwd?: string;
	detached?: boolean;
}

export interface ProcessInfo {
	pid: number;
	startTime: Date;
	status: "running" | "stopped" | "error";
	command: string;
	args: string[];
}

/**
 * Manages daemon processes and background operations.
 */
export class DaemonProcessManager {
	private logger = getLogger("Daemon");
	private config: Required<DaemonConfig>;

	constructor(config: DaemonConfig = {}) {
		this.config = {
			pidFile: config?.pidFile || join(process.cwd(), ".claude-zen-web.pid"),
			logFile: config?.logFile || join(process.cwd(), ".claude-zen-web.log"),
			errorFile:
				config?.errorFile || join(process.cwd(), ".claude-zen-web.error"),
			cwd: config?.cwd || process.cwd(),
			detached: config?.detached ?? true,
		};
	}

	/**
	 * Start process in daemon mode.
	 */
	async startDaemon(
		command: string,
		args: string[] = [],
	): Promise<ProcessInfo> {
		// Check if already running
		const existing = await this.getRunningProcess();
		if (existing) {
			throw new Error(`Daemon already running with PID: ${existing.pid}`);
		}

		this.logger.info("Starting daemon process...", { command, args });

		// Ensure directories exist
		await this.ensureDirectories();

		// Spawn detached process
		const child = spawn(command, args, {
			cwd: this.config.cwd,
			detached: this.config.detached,
			stdio: ["ignore", "ignore", "ignore"],
		});

		if (!child?.pid) {
			throw new Error("Failed to start daemon process");
		}

		const processInfo: ProcessInfo = {
			pid: child.pid,
			startTime: new Date(),
			status: "running",
			command,
			args,
		};

		// Write PID file
		await writeFile(this.config.pidFile, child.pid.toString());

		// Handle process events
		child.on("error", (error) => {
			this.logger.error("Daemon process error:", error);
			this.handleProcessError(error);
		});

		child.on("exit", (code, signal) => {
			this.logger.info(
				`Daemon process exited with code ${code}, signal ${signal}`,
			);
			this.cleanupPidFile();
		});

		// Detach from parent
		if (this.config.detached) {
			child.unref();
		}

		this.currentProcess = child;
		this.logger.info(`Daemon started with PID: ${child.pid}`);

		return processInfo;
	}

	/**
	 * Stop the daemon process.
	 */
	async stopDaemon(signal: NodeJS.Signals = "SIGTERM"): Promise<boolean> {
		const processInfo = await this.getRunningProcess();
		if (!processInfo) {
			this.logger.warn("No daemon process found to stop");
			return false;
		}

		this.logger.info(`Stopping daemon process: ${processInfo.pid}`);

		try {
			// Send signal to process
			process.kill(processInfo.pid, signal);

			// Wait for process to stop
			await this.waitForProcessStop(processInfo.pid, 10000);

			// Clean up PID file
			await this.cleanupPidFile();

			this.logger.info("Daemon process stopped successfully");
			return true;
		} catch (error) {
			this.logger.error("Failed to stop daemon process:", error);

			// Force kill if graceful stop failed
			if (signal !== "SIGKILL") {
				this.logger.warn("Attempting force kill...");
				return this.stopDaemon("SIGKILL");
			}

			return false;
		}
	}

	/**
	 * Restart the daemon process.
	 */
	async restartDaemon(
		command: string,
		args: string[] = [],
	): Promise<ProcessInfo> {
		this.logger.info("Restarting daemon process...");

		await this.stopDaemon();

		// Wait a moment before restarting
		await new Promise((resolve) => setTimeout(resolve, 1000));

		return this.startDaemon(command, args);
	}

	/**
	 * Get information about running daemon process.
	 */
	async getRunningProcess(): Promise<ProcessInfo | null> {
		if (!existsSync(this.config.pidFile)) {
			return null;
		}

		try {
			const pidContent = await readFile(this.config.pidFile, "utf-8");
			const pid = Number.parseInt(pidContent.trim(), 10);

			if (Number.isNaN(pid)) {
				await this.cleanupPidFile();
				return null;
			}

			// Check if process is actually running
			if (!this.isProcessRunning(pid)) {
				await this.cleanupPidFile();
				return null;
			}

			return {
				pid,
				startTime: new Date(), // We don't store start time, so use current
				status: "running",
				command: "unknown", // We don't store command info
				args: [],
			};
		} catch (error) {
			this.logger.error("Failed to read PID file:", error);
			await this.cleanupPidFile();
			return null;
		}
	}

	/**
	 * Check if daemon is running.
	 */
	async isDaemonRunning(): Promise<boolean> {
		const processInfo = await this.getRunningProcess();
		return processInfo !== null;
	}

	/**
	 * Get daemon status with health information.
	 */
	async getDaemonStatus(): Promise<{
		running: boolean;
		pid?: number;
		uptime?: number;
		memory?: NodeJS.MemoryUsage;
		status: "healthy" | "unhealthy" | "stopped";
	}> {
		const processInfo = await this.getRunningProcess();

		if (!processInfo) {
			return {
				running: false,
				status: "stopped",
			};
		}

		try {
			// Basic health check - if we can read process info, it's healthy
			const isRunning = this.isProcessRunning(processInfo.pid);

			return {
				running: isRunning,
				pid: processInfo.pid,
				uptime: Date.now() - processInfo.startTime.getTime(),
				memory: process.memoryUsage(), // Current process memory
				status: isRunning ? "healthy" : "unhealthy",
			};
		} catch (error) {
			this.logger.error("Failed to get daemon status:", error);
			return {
				running: false,
				status: "unhealthy",
			};
		}
	}

	/**
	 * Read daemon logs.
	 */
	async readLogs(maxLines: number = 100): Promise<string[]> {
		if (!existsSync(this.config.logFile)) {
			return [];
		}

		try {
			const content = await readFile(this.config.logFile, "utf-8");
			const lines = content.split("\n").filter((line) => line.trim());
			return lines.slice(-maxLines);
		} catch (error) {
			this.logger.error("Failed to read daemon logs:", error);
			return [];
		}
	}

	/**
	 * Check if a process is running by PID.
	 */
	private isProcessRunning(pid: number): boolean {
		try {
			// Sending signal 0 checks if process exists without actually sending a signal
			process.kill(pid, 0);
			return true;
		} catch (error) {
			// Process doesn't exist or permission denied
			this.logger.debug("Process check failed:", error);
			return false;
		}
	}

	/**
	 * Wait for process to stop.
	 */
	private async waitForProcessStop(
		pid: number,
		timeout: number,
	): Promise<void> {
		const startTime = Date.now();

		while (Date.now() - startTime < timeout) {
			if (!this.isProcessRunning(pid)) {
				return;
			}
			await new Promise((resolve) => setTimeout(resolve, 100));
		}

		throw new Error(`Process ${pid} did not stop within ${timeout}ms`);
	}

	/**
	 * Clean up PID file.
	 */
	private async cleanupPidFile(): Promise<void> {
		try {
			if (existsSync(this.config.pidFile)) {
				await unlink(this.config.pidFile);
				this.logger.debug("PID file cleaned up");
			}
		} catch (error) {
			this.logger.error("Failed to cleanup PID file:", error);
		}
	}

	/**
	 * Ensure required directories exist.
	 */
	private async ensureDirectories(): Promise<void> {
		const dirs = [
			this.config.pidFile,
			this.config.logFile,
			this.config.errorFile,
		].map((file) => file.substring(0, file.lastIndexOf("/")));

		for (const dir of [...new Set(dirs)]) {
			if (dir && !existsSync(dir)) {
				await mkdir(dir, { recursive: true });
			}
		}
	}

	/**
	 * Handle process errors.
	 */
	private async handleProcessError(error: Error): Promise<void> {
		const errorLog = {
			timestamp: new Date().toISOString(),
			error: error.message,
			stack: error.stack,
		};

		try {
			await writeFile(
				this.config.errorFile,
				`${JSON.stringify(errorLog, null, 2)}\n`,
				{ flag: "a" },
			);
		} catch (writeError) {
			this.logger.error("Failed to write error log:", writeError);
		}
	}
}

export default DaemonProcessManager;
