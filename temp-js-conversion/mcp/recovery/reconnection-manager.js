"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReconnectionManager = void 0;
/**
 * Reconnection Manager for MCP
 * Handles automatic reconnection with exponential backoff
 */
const node_events_1 = require("node:events");
class ReconnectionManager extends node_events_1.EventEmitter {
    constructor(client, logger, config) {
        super();
        this.client = client;
        this.logger = logger;
        this.defaultConfig = {
            maxRetries: 10,
            initialDelay: 1000,
            maxDelay: 30000,
            backoffMultiplier: 2,
            jitterFactor: 0.1,
            resetAfterSuccess: true,
        };
        this.config = { ...this.defaultConfig, ...config };
        this.state = {
            attempts: 0,
            nextDelay: this.config.initialDelay,
            isReconnecting: false,
        };
    }
    /**
     * Attempt to reconnect
     */
    async attemptReconnection() {
        // Prevent concurrent reconnection attempts
        if (this.reconnectPromise) {
            this.logger.debug('Reconnection already in progress');
            return this.reconnectPromise;
        }
        if (this.state.attempts >= this.config.maxRetries) {
            this.logger.error('Max reconnection attempts exceeded');
            this.emit('maxRetriesExceeded', this.state);
            return false;
        }
        this.reconnectPromise = this.performReconnection();
        const result = await this.reconnectPromise;
        this.reconnectPromise = undefined;
        return result;
    }
    /**
     * Start automatic reconnection
     */
    startAutoReconnect() {
        if (this.state.isReconnecting) {
            this.logger.debug('Auto-reconnect already active');
            return;
        }
        this.logger.info('Starting automatic reconnection');
        this.state.isReconnecting = true;
        this.emit('reconnectStart');
        this.scheduleReconnect();
    }
    /**
     * Stop reconnection attempts
     */
    stopReconnection() {
        if (!this.state.isReconnecting) {
            return;
        }
        this.logger.info('Stopping reconnection attempts');
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = undefined;
        }
        this.state.isReconnecting = false;
        this.emit('reconnectStop');
    }
    /**
     * Reset reconnection state
     */
    reset() {
        this.logger.debug('Resetting reconnection manager');
        this.stopReconnection();
        this.state = {
            attempts: 0,
            nextDelay: this.config.initialDelay,
            isReconnecting: false,
        };
    }
    /**
     * Get current reconnection state
     */
    getState() {
        return { ...this.state };
    }
    /**
     * Calculate next retry delay
     */
    getNextDelay() {
        return this.state.nextDelay;
    }
    async performReconnection() {
        this.state.attempts++;
        this.state.lastAttempt = new Date();
        this.logger.info('Attempting reconnection', {
            attempt: this.state.attempts,
            maxRetries: this.config.maxRetries,
            delay: this.state.nextDelay,
        });
        this.emit('attemptStart', {
            attempt: this.state.attempts,
            delay: this.state.nextDelay,
        });
        try {
            // Disconnect first if needed
            if (this.client.isConnected()) {
                await this.client.disconnect();
            }
            // Attempt to reconnect
            await this.client.connect();
            // Success!
            this.logger.info('Reconnection successful', {
                attempts: this.state.attempts,
            });
            this.emit('success', {
                attempts: this.state.attempts,
                duration: Date.now() - this.state.lastAttempt.getTime(),
            });
            // Reset state if configured
            if (this.config.resetAfterSuccess) {
                this.reset();
            }
            return true;
        }
        catch (error) {
            this.state.lastError = error;
            this.logger.error('Reconnection failed', {
                attempt: this.state.attempts,
                error: error.message,
            });
            this.emit('attemptFailed', {
                attempt: this.state.attempts,
                error: error,
            });
            // Calculate next delay with exponential backoff
            this.calculateNextDelay();
            // Schedule next attempt if within retry limit
            if (this.state.attempts < this.config.maxRetries && this.state.isReconnecting) {
                this.scheduleReconnect();
            }
            else if (this.state.attempts >= this.config.maxRetries) {
                this.logger.error('Max reconnection attempts reached');
                this.emit('maxRetriesExceeded', this.state);
                this.state.isReconnecting = false;
            }
            return false;
        }
    }
    scheduleReconnect() {
        if (!this.state.isReconnecting) {
            return;
        }
        const delay = this.addJitter(this.state.nextDelay);
        this.logger.debug('Scheduling next reconnection attempt', {
            delay,
            baseDelay: this.state.nextDelay,
        });
        this.reconnectTimer = setTimeout(() => {
            this.attemptReconnection().catch(error => {
                this.logger.error('Scheduled reconnection error', error);
            });
        }, delay);
        this.emit('attemptScheduled', {
            attempt: this.state.attempts + 1,
            delay,
        });
    }
    calculateNextDelay() {
        // Exponential backoff calculation
        const nextDelay = Math.min(this.state.nextDelay * this.config.backoffMultiplier, this.config.maxDelay);
        this.state.nextDelay = nextDelay;
        this.logger.debug('Calculated next delay', {
            delay: nextDelay,
            multiplier: this.config.backoffMultiplier,
            maxDelay: this.config.maxDelay,
        });
    }
    addJitter(delay) {
        // Add random jitter to prevent thundering herd
        const jitter = delay * this.config.jitterFactor;
        const randomJitter = (Math.random() - 0.5) * 2 * jitter;
        return Math.max(0, delay + randomJitter);
    }
    /**
     * Force immediate reconnection attempt
     */
    async forceReconnect() {
        this.logger.info('Forcing immediate reconnection');
        // Cancel any scheduled reconnect
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = undefined;
        }
        // Reset delay for immediate attempt
        const originalDelay = this.state.nextDelay;
        this.state.nextDelay = 0;
        const result = await this.attemptReconnection();
        // Restore delay if failed
        if (!result) {
            this.state.nextDelay = originalDelay;
        }
        return result;
    }
    /**
     * Get estimated time until next reconnection attempt
     */
    getTimeUntilNextAttempt() {
        if (!this.state.isReconnecting || !this.reconnectTimer) {
            return null;
        }
        // This is an approximation since we don't track the exact timer start
        return this.state.nextDelay;
    }
}
exports.ReconnectionManager = ReconnectionManager;
