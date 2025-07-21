"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionHealthMonitor = void 0;
/**
 * Connection Health Monitor for MCP
 * Monitors connection health and triggers recovery when needed
 */
const node_events_1 = require("node:events");
class ConnectionHealthMonitor extends node_events_1.EventEmitter {
    constructor(client, logger, config) {
        super();
        this.client = client;
        this.logger = logger;
        this.lastHeartbeat = new Date();
        this.missedHeartbeats = 0;
        this.currentLatency = 0;
        this.isMonitoring = false;
        this.defaultConfig = {
            heartbeatInterval: 5000,
            heartbeatTimeout: 10000,
            maxMissedHeartbeats: 3,
            enableAutoRecovery: true,
        };
        this.config = { ...this.defaultConfig, ...config };
        this.healthStatus = {
            healthy: false,
            lastHeartbeat: new Date(),
            missedHeartbeats: 0,
            latency: 0,
            connectionState: 'disconnected',
        };
    }
    /**
     * Start health monitoring
     */
    async start() {
        if (this.isMonitoring) {
            this.logger.warn('Health monitor already running');
            return;
        }
        this.logger.info('Starting connection health monitor', {
            config: this.config,
        });
        this.isMonitoring = true;
        this.missedHeartbeats = 0;
        this.lastHeartbeat = new Date();
        // Start heartbeat cycle
        this.scheduleHeartbeat();
        // Update initial status
        this.updateHealthStatus('connected');
        this.emit('started');
    }
    /**
     * Stop health monitoring
     */
    async stop() {
        if (!this.isMonitoring) {
            return;
        }
        this.logger.info('Stopping connection health monitor');
        this.isMonitoring = false;
        if (this.heartbeatTimer) {
            clearTimeout(this.heartbeatTimer);
            this.heartbeatTimer = undefined;
        }
        if (this.timeoutTimer) {
            clearTimeout(this.timeoutTimer);
            this.timeoutTimer = undefined;
        }
        this.updateHealthStatus('disconnected');
        this.emit('stopped');
    }
    /**
     * Get current health status
     */
    getHealthStatus() {
        return { ...this.healthStatus };
    }
    /**
     * Check connection health immediately
     */
    async checkHealth() {
        try {
            const startTime = Date.now();
            // Send heartbeat ping
            await this.sendHeartbeat();
            // Calculate latency
            this.currentLatency = Date.now() - startTime;
            this.lastHeartbeat = new Date();
            this.missedHeartbeats = 0;
            this.updateHealthStatus('connected', true);
            return this.getHealthStatus();
        }
        catch (error) {
            this.logger.error('Health check failed', error);
            this.handleHeartbeatFailure(error);
            return this.getHealthStatus();
        }
    }
    /**
     * Force a health check
     */
    async forceCheck() {
        this.logger.debug('Forcing health check');
        // Cancel current timers
        if (this.heartbeatTimer) {
            clearTimeout(this.heartbeatTimer);
        }
        if (this.timeoutTimer) {
            clearTimeout(this.timeoutTimer);
        }
        // Perform immediate check
        await this.performHeartbeat();
    }
    scheduleHeartbeat() {
        if (!this.isMonitoring) {
            return;
        }
        this.heartbeatTimer = setTimeout(() => {
            this.performHeartbeat().catch(error => {
                this.logger.error('Heartbeat error', error);
            });
        }, this.config.heartbeatInterval);
    }
    async performHeartbeat() {
        if (!this.isMonitoring) {
            return;
        }
        this.logger.debug('Performing heartbeat');
        try {
            // Set timeout for heartbeat response
            this.setHeartbeatTimeout();
            const startTime = Date.now();
            await this.sendHeartbeat();
            // Clear timeout on success
            this.clearHeartbeatTimeout();
            // Update metrics
            this.currentLatency = Date.now() - startTime;
            this.lastHeartbeat = new Date();
            this.missedHeartbeats = 0;
            this.logger.debug('Heartbeat successful', {
                latency: this.currentLatency,
            });
            this.updateHealthStatus('connected', true);
            // Schedule next heartbeat
            this.scheduleHeartbeat();
        }
        catch (error) {
            this.handleHeartbeatFailure(error);
        }
    }
    async sendHeartbeat() {
        // Send heartbeat notification via MCP
        await this.client.notify('heartbeat', {
            timestamp: Date.now(),
            sessionId: this.generateSessionId(),
        });
    }
    setHeartbeatTimeout() {
        this.timeoutTimer = setTimeout(() => {
            this.handleHeartbeatTimeout();
        }, this.config.heartbeatTimeout);
    }
    clearHeartbeatTimeout() {
        if (this.timeoutTimer) {
            clearTimeout(this.timeoutTimer);
            this.timeoutTimer = undefined;
        }
    }
    handleHeartbeatTimeout() {
        this.logger.warn('Heartbeat timeout');
        this.handleHeartbeatFailure(new Error('Heartbeat timeout'));
    }
    handleHeartbeatFailure(error) {
        this.clearHeartbeatTimeout();
        this.missedHeartbeats++;
        this.logger.warn('Heartbeat failed', {
            missedHeartbeats: this.missedHeartbeats,
            maxMissed: this.config.maxMissedHeartbeats,
            error: (error instanceof Error ? error.message : String(error)),
        });
        if (this.missedHeartbeats >= this.config.maxMissedHeartbeats) {
            this.logger.error('Max missed heartbeats exceeded, connection unhealthy');
            this.updateHealthStatus('disconnected', false, (error instanceof Error ? error.message : String(error)));
            if (this.config.enableAutoRecovery) {
                this.emit('connectionLost', { error });
            }
        }
        else {
            // Schedule next heartbeat with backoff
            const backoffDelay = this.config.heartbeatInterval * (this.missedHeartbeats + 1);
            this.logger.debug('Scheduling heartbeat with backoff', { delay: backoffDelay });
            this.heartbeatTimer = setTimeout(() => {
                this.performHeartbeat().catch(err => {
                    this.logger.error('Backoff heartbeat error', err);
                });
            }, backoffDelay);
        }
    }
    updateHealthStatus(connectionState, healthy, error) {
        const previousStatus = { ...this.healthStatus };
        this.healthStatus = {
            healthy: healthy ?? (connectionState === 'connected'),
            lastHeartbeat: this.lastHeartbeat,
            missedHeartbeats: this.missedHeartbeats,
            latency: this.currentLatency,
            connectionState,
            error,
        };
        // Emit event if health changed
        if (previousStatus.healthy !== this.healthStatus.healthy ||
            previousStatus.connectionState !== this.healthStatus.connectionState) {
            this.logger.info('Health status changed', {
                from: previousStatus.connectionState,
                to: this.healthStatus.connectionState,
                healthy: this.healthStatus.healthy,
            });
            this.emit('healthChange', this.healthStatus, previousStatus);
        }
    }
    generateSessionId() {
        return `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
    /**
     * Reset monitor state
     */
    reset() {
        this.missedHeartbeats = 0;
        this.currentLatency = 0;
        this.lastHeartbeat = new Date();
        if (this.isMonitoring) {
            this.logger.debug('Resetting health monitor');
            this.clearHeartbeatTimeout();
            this.scheduleHeartbeat();
        }
    }
}
exports.ConnectionHealthMonitor = ConnectionHealthMonitor;
