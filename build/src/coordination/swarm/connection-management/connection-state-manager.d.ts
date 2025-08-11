/**
 * @file Connection-state management system.
 */
/**
 * MCP Connection State Manager for ZenSwarm.
 *
 * Provides comprehensive MCP connection state management with persistence,
 * automatic recovery, and health monitoring integration.
 *
 * Features:
 * - Connection state persistence and recovery
 * - Automatic reconnection with exponential backoff
 * - Health monitoring integration
 * - Connection pooling and load balancing
 * - Graceful degradation and fallback mechanisms.
 * - Real-time connection status monitoring.
 */
import type { ChildProcess } from 'node:child_process';
import { EventEmitter } from 'node:events';
import type { Readable, Writable } from 'node:stream';
interface LoggerOptions {
    name: string;
    level?: string;
    metadata?: Record<string, unknown>;
}
interface ConnectionConfig {
    id?: string;
    type?: string;
    metadata?: Record<string, unknown>;
    [key: string]: unknown;
}
interface ConnectionError {
    message: string;
    timestamp: Date;
    operation?: string;
}
interface ConnectionHealth {
    status: string;
    lastCheck: Date | null;
    latency: number | null;
    errors: ConnectionError[];
}
interface Connection {
    id: string;
    type: string;
    config: ConnectionConfig;
    status: string;
    createdAt: Date;
    lastConnected: Date | null;
    lastDisconnected: Date | null;
    reconnectAttempts: number;
    error: Error | null;
    health: ConnectionHealth;
    metadata: Record<string, unknown>;
    process?: ChildProcess;
    stdin?: Writable;
    stdout?: Readable;
    stderr?: Readable;
    websocket?: any;
    http?: {
        baseUrl: string;
        headers: Record<string, string>;
        fetch: (endpoint: string, options?: any) => Promise<Response>;
    };
}
interface ConnectionHealthStats {
    consecutive_failures: number;
    last_success: Date | null;
    last_failure: Date | null;
    total_attempts: number;
    success_rate: number;
}
interface ManagerOptions {
    maxConnections?: number;
    connectionTimeout?: number;
    reconnectDelay?: number;
    maxReconnectDelay?: number;
    maxReconnectAttempts?: number;
    healthCheckInterval?: number;
    persistenceEnabled?: boolean;
    enableFallback?: boolean;
    [key: string]: unknown;
}
interface ManagerStats {
    totalConnections: number;
    activeConnections: number;
    failedConnections: number;
    reconnectAttempts: number;
    averageConnectionTime: number;
    totalConnectionTime: number;
}
declare class Logger {
    constructor(options: LoggerOptions);
    name: string;
    info(_msg: string, ..._args: unknown[]): void;
    error(msg: string, ...args: any[]): void;
    warn(msg: string, ...args: any[]): void;
    debug(_msg: string, ..._args: unknown[]): void;
}
export declare class ConnectionStateManager extends EventEmitter {
    options: ManagerOptions;
    connections: Map<string, Connection>;
    connectionStats: Map<string, Record<string, unknown>>;
    healthChecks: Map<string, NodeJS.Timeout>;
    persistenceManager: unknown;
    fallbackManager: unknown;
    logger: Logger;
    connectionHealth: Map<string, ConnectionHealthStats>;
    reconnectTimers: Map<string, NodeJS.Timeout>;
    fallbackConnections: Map<string, Connection>;
    isInitialized: boolean;
    isShuttingDown: boolean;
    connectionPool: Connection[];
    activeConnections: number;
    stats: ManagerStats;
    persistence: unknown;
    healthMonitor: unknown;
    recoveryWorkflows: unknown;
    healthMonitorInterval: NodeJS.Timeout | null;
    constructor(options?: ManagerOptions);
    /**
     * Initialize the connection state manager.
     */
    initialize(): Promise<void>;
    /**
     * Register a new MCP connection.
     *
     * @param connectionConfig
     */
    registerConnection(connectionConfig: ConnectionConfig): Promise<string>;
    /**
     * Establish connection to MCP server.
     *
     * @param connectionId
     */
    establishConnection(connectionId: string): Promise<void>;
    /**
     * Establish stdio-based MCP connection.
     *
     * @param connection
     */
    establishStdioConnection(connection: Connection): Promise<void>;
    /**
     * Establish WebSocket-based MCP connection.
     *
     * @param connection
     */
    establishWebSocketConnection(connection: Connection): Promise<void>;
    /**
     * Establish HTTP-based MCP connection.
     *
     * @param connection
     */
    establishHttpConnection(connection: Connection): Promise<void>;
    /**
     * Set up message handling for stdio connections.
     *
     * @param connection
     */
    setupMessageHandling(connection: Connection): void;
    /**
     * Set up WebSocket message handling.
     *
     * @param connection
     */
    setupWebSocketHandling(connection: Connection): void;
    /**
     * Handle incoming message from MCP connection.
     *
     * @param connectionId
     * @param message
     */
    handleMessage(connectionId: string, message: any): void;
    /**
     * Send message to MCP connection.
     *
     * @param connectionId
     * @param message
     */
    sendMessage(connectionId: string, message: any): Promise<void>;
    /**
     * Handle connection closure.
     *
     * @param connectionId
     * @param code
     * @param reason
     */
    handleConnectionClosed(connectionId: string, code: number | null, reason: any): void;
    /**
     * Schedule reconnection attempt.
     *
     * @param connectionId
     */
    scheduleReconnection(connectionId: string): void;
    /**
     * Get connection status.
     *
     * @param connectionId
     */
    getConnectionStatus(connectionId?: string | null): {
        health: ConnectionHealthStats | undefined;
        id: string;
        type: string;
        config: ConnectionConfig;
        status: string;
        createdAt: Date;
        lastConnected: Date | null;
        lastDisconnected: Date | null;
        reconnectAttempts: number;
        error: Error | null;
        metadata: Record<string, unknown>;
        process?: ChildProcess;
        stdin?: Writable;
        stdout?: Readable;
        stderr?: Readable;
        websocket?: any;
        http?: {
            baseUrl: string;
            headers: Record<string, string>;
            fetch: (endpoint: string, options?: any) => Promise<Response>;
        };
        connections?: never;
        stats?: never;
        summary?: never;
    } | {
        connections: Record<string, any>;
        stats: {
            connectionCount: number;
            healthyConnections: number;
            reconnectingConnections: number;
            totalConnections: number;
            activeConnections: number;
            failedConnections: number;
            reconnectAttempts: number;
            averageConnectionTime: number;
            totalConnectionTime: number;
        };
        summary: {
            total: number;
            active: number;
            failed: number;
            reconnecting: number;
        };
    } | null;
    /**
     * Get connection statistics.
     */
    getConnectionStats(): {
        connectionCount: number;
        healthyConnections: number;
        reconnectingConnections: number;
        totalConnections: number;
        activeConnections: number;
        failedConnections: number;
        reconnectAttempts: number;
        averageConnectionTime: number;
        totalConnectionTime: number;
    };
    /**
     * Disconnect a connection.
     *
     * @param connectionId
     * @param reason
     */
    disconnectConnection(connectionId: string, reason?: string): Promise<void>;
    /**
     * Remove a connection completely.
     *
     * @param connectionId
     */
    removeConnection(connectionId: string): Promise<void>;
    /**
     * Start health monitoring.
     */
    startHealthMonitoring(): void;
    /**
     * Perform health checks on all connections.
     */
    performHealthChecks(): Promise<void>;
    /**
     * Perform health check on a specific connection.
     *
     * @param connectionId
     */
    performConnectionHealthCheck(connectionId: string): Promise<void>;
    /**
     * Persist connection state.
     *
     * @param connection
     */
    persistConnectionState(connection: Connection): Promise<void>;
    /**
     * Restore persisted connections.
     */
    restorePersistedConnections(): Promise<void>;
    /**
     * Remove persisted connection.
     *
     * @param connectionId
     */
    removePersistedConnection(connectionId: string): Promise<void>;
    /**
     * Set integration points.
     *
     * @param persistence
     */
    setPersistence(persistence: any): void;
    setHealthMonitor(healthMonitor: any): void;
    setRecoveryWorkflows(recoveryWorkflows: any): void;
    /**
     * Export connection data for monitoring dashboards.
     */
    exportConnectionData(): {
        timestamp: Date;
        stats: {
            connectionCount: number;
            healthyConnections: number;
            reconnectingConnections: number;
            totalConnections: number;
            activeConnections: number;
            failedConnections: number;
            reconnectAttempts: number;
            averageConnectionTime: number;
            totalConnectionTime: number;
        };
        connections: {
            health: ConnectionHealthStats | undefined;
            id: string;
            type: string;
            config: ConnectionConfig;
            status: string;
            createdAt: Date;
            lastConnected: Date | null;
            lastDisconnected: Date | null;
            reconnectAttempts: number;
            error: Error | null;
            metadata: Record<string, unknown>;
            process?: ChildProcess;
            stdin?: Writable;
            stdout?: Readable;
            stderr?: Readable;
            websocket?: any;
            http?: {
                baseUrl: string;
                headers: Record<string, string>;
                fetch: (endpoint: string, options?: any) => Promise<Response>;
            };
        }[];
        activeTimers: number;
    };
    /**
     * Cleanup and shutdown.
     */
    shutdown(): Promise<void>;
}
export default ConnectionStateManager;
//# sourceMappingURL=connection-state-manager.d.ts.map