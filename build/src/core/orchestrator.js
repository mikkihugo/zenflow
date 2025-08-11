/**
 * Orchestrator - Core orchestration system for claude-zen.
 * Coordinates components and manages system lifecycle.
 */
/**
 * @file Orchestrator implementation.
 */
import { EventEmitter } from 'node:events';
/**
 * Core orchestrator for system coordination.
 *
 * @example
 */
export class Orchestrator extends EventEmitter {
    terminalManager;
    memoryManager;
    coordinationManager;
    mcpServer;
    eventBus;
    logger;
    config;
    isRunning = false;
    activeTasks = new Map();
    healthCheckTimer;
    constructor(config, terminalManager, memoryManager, coordinationManager, mcpServer, eventBus, logger) {
        super();
        this.terminalManager = terminalManager;
        this.memoryManager = memoryManager;
        this.coordinationManager = coordinationManager;
        this.mcpServer = mcpServer;
        this.eventBus = eventBus;
        this.logger = logger;
        this.config = {
            name: config?.['name'] || 'claude-zen-orchestrator',
            timeout: config?.['timeout'] || 30000,
            maxConcurrentTasks: config?.['maxConcurrentTasks'] || 10,
            enableHealthCheck: config?.['enableHealthCheck'] !== false,
            healthCheckInterval: config?.['healthCheckInterval'] || 30000,
        };
        this.setupEventHandlers();
        this.logger?.info(`Orchestrator initialized: ${this.config.name}`);
    }
    /**
     * Start the orchestrator.
     */
    async start() {
        if (this.isRunning) {
            this.logger?.warn('Orchestrator is already running');
            return;
        }
        try {
            this.logger?.info('Starting orchestrator...');
            // Start health checks if enabled
            if (this.config.enableHealthCheck) {
                this.startHealthChecks();
            }
            this.isRunning = true;
            this.emit('started');
            this.logger?.info('Orchestrator started successfully');
        }
        catch (error) {
            this.logger?.error('Failed to start orchestrator', { error });
            throw error;
        }
    }
    /**
     * Stop the orchestrator.
     */
    async stop() {
        if (!this.isRunning) {
            this.logger?.warn('Orchestrator is not running');
            return;
        }
        try {
            this.logger?.info('Stopping orchestrator...');
            // Stop health checks
            if (this.healthCheckTimer) {
                clearInterval(this.healthCheckTimer);
                this.healthCheckTimer = undefined;
            }
            // Wait for active tasks to complete or timeout
            await this.waitForTasksCompletion();
            this.isRunning = false;
            this.emit('stopped');
            this.logger?.info('Orchestrator stopped successfully');
        }
        catch (error) {
            this.logger?.error('Error stopping orchestrator', { error });
            throw error;
        }
    }
    /**
     * Execute a task.
     *
     * @param task
     */
    async executeTask(task) {
        const startTime = Date.now();
        if (this.activeTasks.size >= this.config.maxConcurrentTasks) {
            throw new Error('Maximum concurrent tasks limit reached');
        }
        this.activeTasks.set(task.id, task);
        this.emit('taskStarted', { taskId: task.id });
        try {
            this.logger?.info(`Executing task: ${task.id}`, { type: task.type });
            // Simulate task execution (replace with actual implementation)
            const result = await this.performTask(task);
            const duration = Date.now() - startTime;
            this.logger?.info(`Task completed: ${task.id}`, { duration });
            this.emit('taskCompleted', { taskId: task.id, result, duration });
            return { success: true, output: result, duration };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.logger?.error(`Task failed: ${task.id}`, { error, duration });
            this.emit('taskFailed', { taskId: task.id, error, duration });
            return { success: false, duration, error: error };
        }
        finally {
            this.activeTasks.delete(task.id);
        }
    }
    /**
     * Get orchestrator status.
     */
    getStatus() {
        return {
            running: this.isRunning,
            activeTasks: this.activeTasks.size,
            name: this.config.name,
            uptime: this.isRunning ? Date.now() : 0,
        };
    }
    /**
     * Get active tasks.
     */
    getActiveTasks() {
        return Array.from(this.activeTasks.values());
    }
    setupEventHandlers() {
        // Handle system events if eventBus is available
        if (this.eventBus) {
            this.eventBus.on('system:shutdown', () => {
                this.stop().catch((error) => this.logger?.error('Error during shutdown', { error }));
            });
        }
    }
    startHealthChecks() {
        this.healthCheckTimer = setInterval(() => {
            this.performHealthCheck();
        }, this.config.healthCheckInterval);
    }
    performHealthCheck() {
        const status = this.getStatus();
        this.emit('healthCheck', status);
        if (status.activeTasks > this.config.maxConcurrentTasks * 0.8) {
            this.logger?.warn('High task load detected', {
                activeTasks: status.activeTasks,
                maxTasks: this.config.maxConcurrentTasks,
            });
        }
    }
    async waitForTasksCompletion() {
        const timeout = this.config.timeout;
        const startTime = Date.now();
        while (this.activeTasks.size > 0 && Date.now() - startTime < timeout) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        if (this.activeTasks.size > 0) {
            this.logger?.warn(`${this.activeTasks.size} tasks still active after timeout`);
        }
    }
    async performTask(task) {
        // This is a placeholder implementation
        // In a real system, this would delegate to appropriate subsystems
        // based on task.type and use the injected managers
        await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate work
        return {
            taskId: task.id,
            result: `Task ${task.type} completed`,
            timestamp: new Date().toISOString(),
        };
    }
}
export default Orchestrator;
