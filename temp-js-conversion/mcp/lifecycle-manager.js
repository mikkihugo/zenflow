"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPLifecycleManager = exports.LifecycleState = void 0;
/**
 * MCP Server Lifecycle Manager
 * Handles server lifecycle operations including start, stop, restart, and health checks
 */
const node_events_1 = require("node:events");
const errors_js_1 = require("../utils/errors.js");
var LifecycleState;
(function (LifecycleState) {
    LifecycleState["STOPPED"] = "stopped";
    LifecycleState["STARTING"] = "starting";
    LifecycleState["RUNNING"] = "running";
    LifecycleState["STOPPING"] = "stopping";
    LifecycleState["RESTARTING"] = "restarting";
    LifecycleState["ERROR"] = "error";
})(LifecycleState || (exports.LifecycleState = LifecycleState = {}));
/**
 * MCP Server Lifecycle Manager
 * Manages the complete lifecycle of MCP servers with robust error handling
 */
class MCPLifecycleManager extends node_events_1.EventEmitter {
    constructor(mcpConfig, logger, serverFactory, config) {
        super();
        this.mcpConfig = mcpConfig;
        this.logger = logger;
        this.serverFactory = serverFactory;
        this.state = LifecycleState.STOPPED;
        this.restartAttempts = 0;
        this.history = [];
        this.config = {
            healthCheckInterval: 30000, // 30 seconds
            gracefulShutdownTimeout: 10000, // 10 seconds
            maxRestartAttempts: 3,
            restartDelay: 5000, // 5 seconds
            enableAutoRestart: true,
            enableHealthChecks: true,
        };
        if (config) {
            Object.assign(this.config, config);
        }
        this.setupEventHandlers();
    }
    /**
     * Start the MCP server
     */
    async start() {
        if (this.state !== LifecycleState.STOPPED) {
            throw new errors_js_1.MCPError(`Cannot start server in state: ${this.state}`);
        }
        this.setState(LifecycleState.STARTING);
        this.logger.info('Starting MCP server lifecycle manager');
        try {
            // Create server instance
            this.server = this.serverFactory();
            // Start the server
            await this.server.start();
            // Record start time
            this.startTime = new Date();
            this.restartAttempts = 0;
            // Start health checks
            if (this.config.enableHealthChecks) {
                this.startHealthChecks();
            }
            this.setState(LifecycleState.RUNNING);
            this.logger.info('MCP server started successfully');
        }
        catch (error) {
            this.setState(LifecycleState.ERROR, error);
            this.logger.error('Failed to start MCP server', error);
            throw error;
        }
    }
    /**
     * Stop the MCP server gracefully
     */
    async stop() {
        if (this.state === LifecycleState.STOPPED) {
            return;
        }
        if (this.shutdownPromise) {
            return this.shutdownPromise;
        }
        this.setState(LifecycleState.STOPPING);
        this.logger.info('Stopping MCP server');
        this.shutdownPromise = this.performShutdown();
        await this.shutdownPromise;
        this.shutdownPromise = undefined;
    }
    /**
     * Restart the MCP server
     */
    async restart() {
        if (this.state === LifecycleState.STOPPED) {
            return this.start();
        }
        this.setState(LifecycleState.RESTARTING);
        this.logger.info('Restarting MCP server');
        try {
            await this.stop();
            // Add restart delay
            if (this.config.restartDelay > 0) {
                await new Promise(resolve => setTimeout(resolve, this.config.restartDelay));
            }
            await this.start();
            this.lastRestart = new Date();
            this.restartAttempts++;
            this.logger.info('MCP server restarted successfully');
        }
        catch (error) {
            this.setState(LifecycleState.ERROR, error);
            this.logger.error('Failed to restart MCP server', error);
            throw error;
        }
    }
    /**
     * Perform comprehensive health check
     */
    async healthCheck() {
        const startTime = Date.now();
        const result = {
            healthy: false,
            state: this.state,
            uptime: this.getUptime(),
            lastRestart: this.lastRestart,
            components: {
                server: false,
                transport: false,
                sessions: false,
                tools: false,
                auth: false,
                loadBalancer: false,
            },
        };
        try {
            if (!this.server || this.state !== LifecycleState.RUNNING) {
                result.error = 'Server not running';
                return result;
            }
            // Check server health
            const serverHealth = await this.server.getHealthStatus();
            result.components.server = serverHealth.healthy;
            result.metrics = serverHealth.metrics;
            if (serverHealth.error) {
                result.error = serverHealth.error;
            }
            // Check individual components
            result.components.transport = serverHealth.metrics?.transportConnections !== undefined;
            result.components.sessions = serverHealth.metrics?.activeSessions !== undefined;
            result.components.tools = (serverHealth.metrics?.registeredTools || 0) > 0;
            result.components.auth = serverHealth.metrics?.authenticatedSessions !== undefined;
            result.components.loadBalancer = serverHealth.metrics?.rateLimitedRequests !== undefined;
            // Overall health assessment
            result.healthy = result.components.server &&
                result.components.transport &&
                result.components.sessions &&
                result.components.tools;
            const checkDuration = Date.now() - startTime;
            if (result.metrics) {
                result.metrics.healthCheckDuration = checkDuration;
            }
            this.logger.debug('Health check completed', {
                healthy: result.healthy,
                duration: checkDuration,
                components: result.components,
            });
            return result;
        }
        catch (error) {
            result.error = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error('Health check failed', error);
            return result;
        }
    }
    /**
     * Get current server state
     */
    getState() {
        return this.state;
    }
    /**
     * Get server metrics
     */
    getMetrics() {
        return this.server?.getMetrics();
    }
    /**
     * Get active sessions
     */
    getSessions() {
        return this.server?.getSessions() || [];
    }
    /**
     * Get server uptime in milliseconds
     */
    getUptime() {
        return this.startTime ? Date.now() - this.startTime.getTime() : 0;
    }
    /**
     * Get lifecycle event history
     */
    getHistory() {
        return [...this.history];
    }
    /**
     * Force terminate server (emergency stop)
     */
    async forceStop() {
        this.logger.warn('Force stopping MCP server');
        // Stop health checks
        this.stopHealthChecks();
        // Force close server
        if (this.server) {
            try {
                await this.server.stop();
            }
            catch (error) {
                this.logger.error('Error during force stop', error);
            }
            this.server = undefined;
        }
        this.setState(LifecycleState.STOPPED);
        this.startTime = undefined;
    }
    /**
     * Enable or disable auto-restart
     */
    setAutoRestart(enabled) {
        this.config.enableAutoRestart = enabled;
        this.logger.info('Auto-restart', { enabled });
    }
    /**
     * Enable or disable health checks
     */
    setHealthChecks(enabled) {
        this.config.enableHealthChecks = enabled;
        if (enabled && this.state === LifecycleState.RUNNING) {
            this.startHealthChecks();
        }
        else {
            this.stopHealthChecks();
        }
        this.logger.info('Health checks', { enabled });
    }
    setState(newState, error) {
        const previousState = this.state;
        this.state = newState;
        const event = {
            timestamp: new Date(),
            state: newState,
            previousState,
            error,
        };
        this.history.push(event);
        // Keep only last 100 events
        if (this.history.length > 100) {
            this.history.shift();
        }
        this.emit('stateChange', event);
        this.logger.info('State change', {
            from: previousState,
            to: newState,
            error: error?.message,
        });
    }
    setupEventHandlers() {
        // Handle uncaught errors
        process.on('uncaughtException', (error) => {
            this.logger.error('Uncaught exception', error);
            this.handleServerError(error);
        });
        process.on('unhandledRejection', (reason) => {
            this.logger.error('Unhandled rejection', reason);
            this.handleServerError(reason instanceof Error ? reason : new Error(String(reason)));
        });
        // Handle process signals
        process.on('SIGINT', () => {
            this.logger.info('Received SIGINT, shutting down gracefully');
            this.stop().catch(error => {
                this.logger.error('Error during graceful shutdown', error);
                process.exit(1);
            });
        });
        process.on('SIGTERM', () => {
            this.logger.info('Received SIGTERM, shutting down gracefully');
            this.stop().catch(error => {
                this.logger.error('Error during graceful shutdown', error);
                process.exit(1);
            });
        });
    }
    async handleServerError(error) {
        this.logger.error('Server error detected', error);
        this.setState(LifecycleState.ERROR, error);
        if (this.config.enableAutoRestart && this.restartAttempts < this.config.maxRestartAttempts) {
            this.logger.info('Attempting auto-restart', {
                attempt: this.restartAttempts + 1,
                maxAttempts: this.config.maxRestartAttempts,
            });
            try {
                await this.restart();
            }
            catch (restartError) {
                this.logger.error('Auto-restart failed', restartError);
            }
        }
        else {
            this.logger.error('Max restart attempts reached or auto-restart disabled');
            await this.forceStop();
        }
    }
    startHealthChecks() {
        if (this.healthCheckTimer) {
            return;
        }
        this.healthCheckTimer = setInterval(async () => {
            try {
                const health = await this.healthCheck();
                if (!health.healthy && this.state === LifecycleState.RUNNING) {
                    this.logger.warn('Health check failed', health);
                    this.handleServerError(new Error(health.error || 'Health check failed'));
                }
            }
            catch (error) {
                this.logger.error('Health check error', error);
            }
        }, this.config.healthCheckInterval);
        this.logger.debug('Health checks started', { interval: this.config.healthCheckInterval });
    }
    stopHealthChecks() {
        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
            this.healthCheckTimer = undefined;
            this.logger.debug('Health checks stopped');
        }
    }
    async performShutdown() {
        try {
            // Stop health checks
            this.stopHealthChecks();
            // Graceful shutdown with timeout
            const shutdownPromise = this.server?.stop() || Promise.resolve();
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Shutdown timeout')), this.config.gracefulShutdownTimeout);
            });
            await Promise.race([shutdownPromise, timeoutPromise]);
            this.server = undefined;
            this.setState(LifecycleState.STOPPED);
            this.startTime = undefined;
            this.logger.info('MCP server stopped successfully');
        }
        catch (error) {
            this.logger.error('Error during shutdown', error);
            await this.forceStop();
            throw error;
        }
    }
}
exports.MCPLifecycleManager = MCPLifecycleManager;
