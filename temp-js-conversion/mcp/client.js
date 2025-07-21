"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPClient = void 0;
/**
 * MCP Client for Model Context Protocol
 */
const node_events_1 = require("node:events");
const logger_js_1 = require("../core/logger.js");
const index_js_1 = require("./recovery/index.js");
class MCPClient extends node_events_1.EventEmitter {
    constructor(config) {
        super();
        this.connected = false;
        this.pendingRequests = new Map();
        this.transport = config.transport;
        this.timeout = config.timeout || 30000;
        // Initialize recovery manager if enabled
        if (config.enableRecovery) {
            this.recoveryManager = new index_js_1.RecoveryManager(this, config.mcpConfig || {}, logger_js_1.logger, config.recoveryConfig);
            this.setupRecoveryHandlers();
        }
    }
    async connect() {
        try {
            await this.transport.connect();
            this.connected = true;
            logger_js_1.logger.info('MCP Client connected');
            // Start recovery manager if enabled
            if (this.recoveryManager) {
                await this.recoveryManager.start();
            }
            this.emit('connected');
        }
        catch (error) {
            logger_js_1.logger.error('Failed to connect MCP client', error);
            this.connected = false;
            // Trigger recovery if enabled
            if (this.recoveryManager) {
                await this.recoveryManager.forceRecovery();
            }
            throw error;
        }
    }
    async disconnect() {
        if (this.connected) {
            // Stop recovery manager first
            if (this.recoveryManager) {
                await this.recoveryManager.stop();
            }
            await this.transport.disconnect();
            this.connected = false;
            logger_js_1.logger.info('MCP Client disconnected');
            this.emit('disconnected');
        }
    }
    async request(method, params) {
        const request = {
            jsonrpc: '2.0',
            method,
            params,
            id: Math.random().toString(36).slice(2),
        };
        // If recovery manager is enabled, let it handle the request
        if (this.recoveryManager && !this.connected) {
            await this.recoveryManager.handleRequest(request);
        }
        if (!this.connected) {
            throw new Error('Client not connected');
        }
        // Create promise for tracking the request
        const requestPromise = new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                this.pendingRequests.delete(request.id);
                reject(new Error(`Request timeout: ${method}`));
            }, this.timeout);
            this.pendingRequests.set(request.id, { resolve, reject, timer });
        });
        try {
            const response = await this.transport.sendRequest(request);
            // Clear pending request
            const pending = this.pendingRequests.get(request.id);
            if (pending) {
                clearTimeout(pending.timer);
                this.pendingRequests.delete(request.id);
            }
            if ('error' in response) {
                throw new Error(response.error);
            }
            return response.result;
        }
        catch (error) {
            // Clear pending request on error
            const pending = this.pendingRequests.get(request.id);
            if (pending) {
                clearTimeout(pending.timer);
                this.pendingRequests.delete(request.id);
            }
            throw error;
        }
    }
    async notify(method, params) {
        // Special handling for heartbeat notifications
        if (method === 'heartbeat') {
            // Always allow heartbeat notifications for recovery
            const notification = {
                jsonrpc: '2.0',
                method,
                params,
            };
            if (this.transport.sendNotification) {
                await this.transport.sendNotification(notification);
            }
            return;
        }
        if (!this.connected) {
            throw new Error('Client not connected');
        }
        const notification = {
            jsonrpc: '2.0',
            method,
            params,
        };
        if (this.transport.sendNotification) {
            await this.transport.sendNotification(notification);
        }
        else {
            throw new Error('Transport does not support notifications');
        }
    }
    isConnected() {
        return this.connected;
    }
    /**
     * Get recovery status if recovery is enabled
     */
    getRecoveryStatus() {
        return this.recoveryManager?.getStatus();
    }
    /**
     * Force a recovery attempt
     */
    async forceRecovery() {
        if (!this.recoveryManager) {
            throw new Error('Recovery not enabled');
        }
        return this.recoveryManager.forceRecovery();
    }
    setupRecoveryHandlers() {
        if (!this.recoveryManager) {
            return;
        }
        // Handle recovery events
        this.recoveryManager.on('recoveryStart', ({ trigger }) => {
            logger_js_1.logger.info('Recovery started', { trigger });
            this.emit('recoveryStart', { trigger });
        });
        this.recoveryManager.on('recoveryComplete', ({ success, duration }) => {
            if (success) {
                logger_js_1.logger.info('Recovery completed successfully', { duration });
                this.connected = true;
                this.emit('recoverySuccess', { duration });
            }
            else {
                logger_js_1.logger.error('Recovery failed');
                this.emit('recoveryFailed', { duration });
            }
        });
        this.recoveryManager.on('fallbackActivated', (state) => {
            logger_js_1.logger.warn('Fallback mode activated', state);
            this.emit('fallbackActivated', state);
        });
        this.recoveryManager.on('healthChange', (newStatus, oldStatus) => {
            this.emit('healthChange', newStatus, oldStatus);
        });
    }
    /**
     * Cleanup resources
     */
    async cleanup() {
        // Clear all pending requests
        for (const [id, pending] of this.pendingRequests) {
            clearTimeout(pending.timer);
            pending.reject(new Error('Client cleanup'));
        }
        this.pendingRequests.clear();
        // Cleanup recovery manager
        if (this.recoveryManager) {
            await this.recoveryManager.cleanup();
        }
        // Disconnect if connected
        await this.disconnect();
    }
}
exports.MCPClient = MCPClient;
