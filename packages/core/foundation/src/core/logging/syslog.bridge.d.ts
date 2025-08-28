/**
 * @fileoverview LogTape Syslog Bridge for System-Wide Logging
 *
 * Integrates LogTape with system syslog for centralized logging across
 * all claude-zen components. Provides structured logging that appears
 * in journalctl and system logs.
 *
 * This is part of the foundation logging infrastructure, providing
 * enterprise-grade system integration for all claude-zen packages.
 */
import type { UnknownRecord } from "../../types/primitives";
export interface SyslogEntry {
    timestamp: string;
    level: "debug" | "info" | "warn" | "error" | "fatal";
    component: string;
    message: string;
    metadata?: UnknownRecord;
    sessionId?: string;
    traceId?: string;
}
export declare class LogTapeSyslogBridge {
    private logger;
    private isEnabled;
    private componentName;
    constructor(componentName?: string);
    /**
     * Initialize syslog logging integration
     */
    private setupSyslogLogging;
    /**
     * Send structured log entry to syslog
     */
    logToSyslog(entry: SyslogEntry): void;
    /**
     * Format message for syslog consumption
     */
    private formatSyslogMessage;
    /**
     * Send to system log using logger command
     */
    private sendToSystemLog;
    /**
     * Map LogTape log levels to syslog priorities
     */
    private mapLogLevel;
    /**
     * Log via LogTape for database persistence
     */
    private logViaLogTape;
    /**
     * Convenience methods for different log levels
     */
    info(component: string, message: string, metadata?: UnknownRecord): void;
    warn(component: string, message: string, metadata?: UnknownRecord): void;
    error(component: string, message: string, metadata?: UnknownRecord): void;
    debug(component: string, message: string, metadata?: UnknownRecord): void;
    /**
     * Batch log multiple entries (useful for performance)
     */
    logBatch(entries: SyslogEntry[]): void;
    /**
     * Enable/disable syslog integration
     */
    setEnabled(enabled: boolean): void;
    /**
     * Check if syslog integration is working
     */
    testSyslogIntegration(): Promise<boolean>;
    /**
     * Get syslog configuration status
     */
    getStatus(): UnknownRecord;
    /**
     * Check if logger command is available
     */
    private checkLoggerCommand;
}
export declare const syslogBridge: LogTapeSyslogBridge;
export declare const logToSyslog: {
    info: (component: string, message: string, metadata?: UnknownRecord) => void;
    warn: (component: string, message: string, metadata?: UnknownRecord) => void;
    error: (component: string, message: string, metadata?: UnknownRecord) => void;
    debug: (component: string, message: string, metadata?: UnknownRecord) => void;
};
//# sourceMappingURL=syslog.bridge.d.ts.map