/**
 * Daemon Process Manager - Background process management.
 *
 * Handles daemon mode operations, process lifecycle, and PID management.
 * For the web interface server.
 */
/**
 * @file Daemon-process management system.
 */
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
    status: 'running' | 'stopped' | 'error';
    command: string;
    args: string[];
}
/**
 * Manages daemon processes and background operations.
 *
 * @example
 */
export declare class DaemonProcessManager {
    private logger;
    private config;
    constructor(config?: DaemonConfig);
    /**
     * Start process in daemon mode.
     *
     * @param command
     * @param args
     */
    startDaemon(command: string, args?: string[]): Promise<ProcessInfo>;
    /**
     * Stop the daemon process.
     *
     * @param signal
     */
    stopDaemon(signal?: NodeJS.Signals): Promise<boolean>;
    /**
     * Restart the daemon process.
     *
     * @param command
     * @param args
     */
    restartDaemon(command: string, args?: string[]): Promise<ProcessInfo>;
    /**
     * Get information about running daemon process.
     */
    getRunningProcess(): Promise<ProcessInfo | null>;
    /**
     * Check if daemon is running.
     */
    isDaemonRunning(): Promise<boolean>;
    /**
     * Get daemon status with health information.
     */
    getDaemonStatus(): Promise<{
        running: boolean;
        pid?: number;
        uptime?: number;
        memory?: NodeJS.MemoryUsage;
        status: 'healthy' | 'unhealthy' | 'stopped';
    }>;
    /**
     * Read daemon logs.
     *
     * @param maxLines
     */
    readLogs(maxLines?: number): Promise<string[]>;
    /**
     * Check if a process is running by PID.
     *
     * @param pid
     */
    private isProcessRunning;
    /**
     * Wait for process to stop.
     *
     * @param pid
     * @param timeout
     */
    private waitForProcessStop;
    /**
     * Clean up PID file.
     */
    private cleanupPidFile;
    /**
     * Ensure required directories exist.
     */
    private ensureDirectories;
    /**
     * Handle process errors.
     *
     * @param error
     */
    private handleProcessError;
}
export default DaemonProcessManager;
//# sourceMappingURL=daemon-process-manager.d.ts.map