/**
 * Web Process Manager - Daemon and process lifecycle management.
 *
 * Handles daemon mode operations, PID file management,
 * and graceful shutdown procedures for the web interface.
 */
import type { WebConfig } from '../../config/server/server.config';
export interface ProcessInfo {
    pid: number;
    startTime: Date;
    isRunning: boolean;
    pidFile: string;
}
export declare class WebProcessManager {
    private logger;
    private config;
    private pid?;
    private pidFile;
    private isShuttingDown;
    constructor(config: WebConfig);
    /**
     * Start process management (daemon mode).
     */
    startDaemonMode(): Promise<void>;
    /**
     * Save process ID to file.
     */
    private savePidFile;
    /**
     * Remove PID file.
     */
    private removePidFile;
    /**
     * Setup signal handlers for graceful shutdown.
     */
    private setupSignalHandlers;
    /**
     * Perform graceful shutdown.
     *
     * @param signal
     */
    gracefulShutdown(signal?: string): Promise<void>;
    /**
     * Check if another instance is running.
     */
    isInstanceRunning(): Promise<ProcessInfo | null>;
    /**
     * Check if a process is running by PID.
     *
     * @param pid
     */
    private isProcessRunning;
    /**
     * Stop a running instance.
     *
     * @param pid
     */
    stopInstance(pid?: number): Promise<boolean>;
    /**
     * Get current process information.
     */
    getCurrentProcessInfo(): ProcessInfo;
    /**
     * Get process statistics.
     */
    getProcessStats(): {
        pid: number;
        uptime: number;
        memory: NodeJS.MemoryUsage;
        cpu: NodeJS.CpuUsage;
        isMain: boolean;
    };
    /**
     * Health check for process manager.
     */
    healthCheck(): {
        status: 'healthy' | 'warning' | 'error';
        pid: number;
        uptime: number;
        daemonMode: boolean;
        pidFile: string;
        pidFileExists: boolean;
    };
}
//# sourceMappingURL=web.manager.d.ts.map