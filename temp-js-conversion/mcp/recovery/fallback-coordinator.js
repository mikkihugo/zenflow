"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FallbackCoordinator = void 0;
/**
 * Fallback Coordinator for MCP
 * Manages graceful degradation to CLI when MCP connection fails
 */
const node_events_1 = require("node:events");
const node_child_process_1 = require("node:child_process");
const node_util_1 = require("node:util");
const execAsync = (0, node_util_1.promisify)(node_child_process_1.exec);
class FallbackCoordinator extends node_events_1.EventEmitter {
    constructor(logger, config) {
        super();
        this.logger = logger;
        this.operationQueue = [];
        this.processingQueue = false;
        this.defaultConfig = {
            enableFallback: true,
            maxQueueSize: 100,
            queueTimeout: 300000, // 5 minutes
            cliPath: 'npx ruv-swarm',
            fallbackNotificationInterval: 30000, // 30 seconds
        };
        this.config = { ...this.defaultConfig, ...config };
        this.state = {
            isFallbackActive: false,
            queuedOperations: 0,
            failedOperations: 0,
            successfulOperations: 0,
        };
    }
    /**
     * Check if MCP is available
     */
    async isMCPAvailable() {
        try {
            // Try to execute a simple MCP command
            const { stdout } = await execAsync(`${this.config.cliPath} status --json`);
            const status = JSON.parse(stdout);
            return status.connected === true;
        }
        catch (error) {
            this.logger.debug('MCP availability check failed', error);
            return false;
        }
    }
    /**
     * Enable CLI fallback mode
     */
    enableCLIFallback() {
        if (this.state.isFallbackActive) {
            this.logger.debug('Fallback already active');
            return;
        }
        this.logger.warn('Enabling CLI fallback mode');
        this.state.isFallbackActive = true;
        this.state.lastFallbackActivation = new Date();
        // Start notification timer
        this.startNotificationTimer();
        this.emit('fallbackEnabled', this.state);
    }
    /**
     * Disable CLI fallback mode
     */
    disableCLIFallback() {
        if (!this.state.isFallbackActive) {
            return;
        }
        this.logger.info('Disabling CLI fallback mode');
        this.state.isFallbackActive = false;
        // Stop notification timer
        this.stopNotificationTimer();
        this.emit('fallbackDisabled', this.state);
        // Process any queued operations
        if (this.operationQueue.length > 0) {
            this.processQueue().catch(error => {
                this.logger.error('Error processing queue after fallback disabled', error);
            });
        }
    }
    /**
     * Queue an operation for later execution
     */
    queueOperation(operation) {
        if (!this.config.enableFallback) {
            this.logger.debug('Fallback disabled, operation not queued');
            return;
        }
        if (this.operationQueue.length >= this.config.maxQueueSize) {
            this.logger.warn('Operation queue full, removing oldest operation');
            this.operationQueue.shift();
            this.state.failedOperations++;
        }
        const queuedOp = {
            ...operation,
            id: this.generateOperationId(),
            timestamp: new Date(),
        };
        this.operationQueue.push(queuedOp);
        this.state.queuedOperations = this.operationQueue.length;
        this.logger.debug('Operation queued', {
            id: queuedOp.id,
            type: queuedOp.type,
            method: queuedOp.method,
            queueSize: this.operationQueue.length,
        });
        this.emit('operationQueued', queuedOp);
        // If in fallback mode, try to execute via CLI
        if (this.state.isFallbackActive && !this.processingQueue) {
            this.executeViaCliFallback(queuedOp).catch(error => {
                this.logger.error('CLI fallback execution failed', { operation: queuedOp, error });
            });
        }
    }
    /**
     * Process all queued operations
     */
    async processQueue() {
        if (this.processingQueue || this.operationQueue.length === 0) {
            return;
        }
        this.processingQueue = true;
        this.logger.info('Processing operation queue', {
            queueSize: this.operationQueue.length,
        });
        this.emit('queueProcessingStart', this.operationQueue.length);
        const results = {
            successful: 0,
            failed: 0,
        };
        // Process operations in order
        while (this.operationQueue.length > 0) {
            const operation = this.operationQueue.shift();
            // Check if operation has expired
            if (this.isOperationExpired(operation)) {
                this.logger.warn('Operation expired', { id: operation.id });
                results.failed++;
                continue;
            }
            try {
                await this.replayOperation(operation);
                results.successful++;
                this.state.successfulOperations++;
            }
            catch (error) {
                this.logger.error('Failed to replay operation', {
                    operation,
                    error,
                });
                results.failed++;
                this.state.failedOperations++;
                // Re-queue if retryable
                if (operation.retryable) {
                    this.operationQueue.push(operation);
                }
            }
        }
        this.state.queuedOperations = this.operationQueue.length;
        this.processingQueue = false;
        this.logger.info('Queue processing complete', results);
        this.emit('queueProcessingComplete', results);
    }
    /**
     * Get current fallback state
     */
    getState() {
        return { ...this.state };
    }
    /**
     * Get queued operations
     */
    getQueuedOperations() {
        return [...this.operationQueue];
    }
    /**
     * Clear operation queue
     */
    clearQueue() {
        const clearedCount = this.operationQueue.length;
        this.operationQueue = [];
        this.state.queuedOperations = 0;
        this.logger.info('Operation queue cleared', { clearedCount });
        this.emit('queueCleared', clearedCount);
    }
    async executeViaCliFallback(operation) {
        this.logger.debug('Executing operation via CLI fallback', {
            id: operation.id,
            method: operation.method,
        });
        try {
            // Map MCP operations to CLI commands
            const cliCommand = this.mapOperationToCli(operation);
            if (!cliCommand) {
                throw new Error(`No CLI mapping for operation: ${operation.method}`);
            }
            const { stdout, stderr } = await execAsync(cliCommand);
            if (stderr) {
                this.logger.warn('CLI command stderr', { stderr });
            }
            this.logger.debug('CLI fallback execution successful', {
                id: operation.id,
                stdout: stdout.substring(0, 200), // Log first 200 chars
            });
            this.state.successfulOperations++;
            this.emit('fallbackExecutionSuccess', { operation, result: stdout });
        }
        catch (error) {
            this.logger.error('CLI fallback execution failed', {
                operation,
                error,
            });
            this.state.failedOperations++;
            this.emit('fallbackExecutionFailed', { operation, error });
            // Re-queue if retryable
            if (operation.retryable) {
                this.queueOperation(operation);
            }
        }
    }
    async replayOperation(operation) {
        // This would typically use the MCP client to replay the operation
        // For now, we'll log it
        this.logger.info('Replaying operation', {
            id: operation.id,
            method: operation.method,
        });
        // Emit event for handling by the MCP client
        this.emit('replayOperation', operation);
    }
    mapOperationToCli(operation) {
        // Map common MCP operations to CLI commands
        const mappings = {
            // Tool operations
            'tools/list': () => `${this.config.cliPath} tools list`,
            'tools/call': (params) => `${this.config.cliPath} tools call ${params.name} '${JSON.stringify(params.arguments)}'`,
            // Resource operations
            'resources/list': () => `${this.config.cliPath} resources list`,
            'resources/read': (params) => `${this.config.cliPath} resources read ${params.uri}`,
            // Session operations
            'initialize': () => `${this.config.cliPath} session init`,
            'shutdown': () => `${this.config.cliPath} session shutdown`,
            // Custom operations
            'heartbeat': () => `${this.config.cliPath} health check`,
        };
        const mapper = mappings[operation.method];
        return mapper ? mapper(operation.params) : null;
    }
    isOperationExpired(operation) {
        const age = Date.now() - operation.timestamp.getTime();
        return age > this.config.queueTimeout;
    }
    generateOperationId() {
        return `op-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }
    startNotificationTimer() {
        if (this.notificationTimer) {
            return;
        }
        this.notificationTimer = setInterval(() => {
            if (this.state.isFallbackActive && this.operationQueue.length > 0) {
                this.logger.info('Fallback mode active', {
                    queuedOperations: this.operationQueue.length,
                    duration: Date.now() - (this.state.lastFallbackActivation?.getTime() || 0),
                });
                this.emit('fallbackStatus', this.state);
            }
        }, this.config.fallbackNotificationInterval);
    }
    stopNotificationTimer() {
        if (this.notificationTimer) {
            clearInterval(this.notificationTimer);
            this.notificationTimer = undefined;
        }
    }
}
exports.FallbackCoordinator = FallbackCoordinator;
