import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';
import { BaseQueen } from './base-queen.js';
import { CodeQueen } from './code-queen.js';
import { DebugQueen } from './debug-queen.js';
import { Logger } from '../utils/logger.js';

/**
 * @typedef {Object} QueenCoordinatorConfig
 * @property {number} [maxConcurrentTasks] - Maximum number of concurrent tasks
 * @property {boolean} [enableLoadBalancing] - Whether to enable load balancing
 * @property {number} [consensusThreshold] - Threshold for consensus acceptance
 * @property {number} [healthCheckInterval] - Health check interval in milliseconds
 * @property {boolean} [autoScaling] - Whether to enable auto scaling
 */

/**
 * @typedef {Object} TaskQueue
 * @property {Task[]} pending - Pending tasks array
 * @property {Map<string, Task>} active - Active tasks map
 * @property {Map<string, Result | Consensus>} completed - Completed tasks map
 * @property {Map<string, Error>} failed - Failed tasks map
 */

/**
 * @typedef {Object} CoordinatorMetrics
 * @property {number} totalTasks - Total number of tasks
 * @property {number} completedTasks - Number of completed tasks
 * @property {number} failedTasks - Number of failed tasks
 * @property {number} averageProcessingTime - Average processing time
 * @property {number} consensusRate - Consensus success rate
 * @property {Object.<string, number>} queenUtilization - Queen utilization stats
 * @property {number} throughput - Tasks per minute
 */

export class QueenCoordinator extends EventEmitter {
    /**
     * Creates a new QueenCoordinator instance
     * @param {QueenCoordinatorConfig} [config={}] - Configuration options
     */
    constructor(config = {}) {
        super();
        
        this.config = {
            maxConcurrentTasks: config.maxConcurrentTasks || 50,
            enableLoadBalancing: config.enableLoadBalancing ?? true,
            consensusThreshold: config.consensusThreshold || 0.7,
            healthCheckInterval: config.healthCheckInterval || 30000,
            autoScaling: config.autoScaling ?? false
        };

        this.logger = new Logger('QueenCoordinator');
        this.queens = new Map();
        this.taskQueue = {
            pending: [],
            active: new Map(),
            completed: new Map(),
            failed: new Map()
        };

        this.metrics = {
            totalTasks: 0,
            completedTasks: 0,
            failedTasks: 0,
            averageProcessingTime: 0,
            consensusRate: 0,
            queenUtilization: {},
            throughput: 0
        };

        this.initializeQueens();
    }

    /**
     * Initialize queens
     * @private
     * @returns {Promise<void>}
     */
    async initializeQueens() {
        try {
            // Initialize core queens
            const codeQueen = new CodeQueen();
            const debugQueen = new DebugQueen();

            this.queens.set('CodeQueen', codeQueen);
            this.queens.set('DebugQueen', debugQueen);

            // Set up event listeners for queens
            for (const [name, queen] of this.queens.entries()) {
                queen.on('taskComplete', (data) => {
                    this.handleQueenTaskComplete(name, data);
                });

                queen.on('collaboration', (data) => {
                    this.handleQueenCollaboration(name, data);
                });

                queen.on('shutdown', () => {
                    this.logger.info(`Queen ${name} has shut down`);
                });

                this.metrics.queenUtilization[name] = 0;
            }

            this.logger.info(`Initialized ${this.queens.size} queens: ${Array.from(this.queens.keys()).join(', ')}`);
        } catch (error) {
            this.logger.error('Failed to initialize queens:', error);
            throw error;
        }
    }

    /**
     * Start the coordinator
     * @returns {Promise<void>}
     */
    async start() {
        if (this.isRunning) {
            this.logger.warn('QueenCoordinator is already running');
            return;
        }

        this.logger.info('Starting QueenCoordinator...');
        this.isRunning = true;

        // Start health check timer
        this.healthCheckTimer = setInterval(() => {
            this.performHealthCheck();
        }, this.config.healthCheckInterval);

        // Start processing task queue
        this.processTaskQueue();

        this.emit('started');
        this.logger.info('QueenCoordinator started successfully');
    }

    /**
     * Stop the coordinator
     * @returns {Promise<void>}
     */
    async stop() {
        if (!this.isRunning) {
            return;
        }

        this.logger.info('Stopping QueenCoordinator...');
        this.isRunning = false;

        // Clear health check timer
        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
            this.healthCheckTimer = null;
        }

        // Shutdown all queens
        const shutdownPromises = Array.from(this.queens.values()).map(queen => queen.shutdown());
        await Promise.all(shutdownPromises);

        this.emit('stopped');
        this.logger.info('QueenCoordinator stopped');
    }

    /**
     * Submit a task for processing
     * @param {string} prompt - Task prompt
     * @param {Partial<Task>} [options={}] - Task options
     * @returns {Promise<string>} Task ID
     */
    async submitTask(prompt, options = {}) {
        const taskId = this.generateTaskId();
        
        const task = {
            id: taskId,
            type: options.type || 'code-generation',
            prompt,
            context: options.context,
            priority: options.priority || 'medium',
            deadline: options.deadline,
            metadata: options.metadata
        };

        this.taskQueue.pending.push(task);
        this.metrics.totalTasks++;

        this.logger.info(`Task ${taskId} submitted: ${prompt.substring(0, 50)}...`);
        this.emit('taskSubmitted', { task });

        return taskId;
    }

    /**
     * Execute a task
     * @param {Task} task - The task to execute
     * @param {boolean} [requireConsensus=false] - Whether to require consensus
     * @returns {Promise<Result | Consensus>} Task result
     */
    async executeTask(task, requireConsensus = false) {
        const startTime = performance.now();
        
        try {
            this.logger.info(`Executing task ${task.id}, requireConsensus: ${requireConsensus}`);
            this.taskQueue.active.set(task.id, task);

            if (requireConsensus) {
                return await this.executeWithConsensus(task);
            } else {
                return await this.executeWithBestQueen(task);
            }
        } catch (error) {
            this.logger.error(`Task ${task.id} execution failed:`, error);
            this.taskQueue.failed.set(task.id, error);
            this.metrics.failedTasks++;
            throw error;
        } finally {
            this.taskQueue.active.delete(task.id);
            const processingTime = performance.now() - startTime;
            this.updateProcessingTimeMetrics(processingTime);
        }
    }

    /**
     * Execute task with the best available queen
     * @private
     * @param {Task} task - The task to execute
     * @returns {Promise<Result>} Task result
     */
    async executeWithBestQueen(task) {
        const bestQueen = await this.selectBestQueen(task);
        
        if (!bestQueen) {
            throw new Error(`No suitable queen found for task type: ${task.type}`);
        }

        this.logger.info(`Assigned task ${task.id} to ${bestQueen.getName()}`);
        const result = await bestQueen.process(task);
        
        this.taskQueue.completed.set(task.id, result);
        this.metrics.completedTasks++;
        
        return result;
    }

    /**
     * Execute task with consensus from multiple queens
     * @private
     * @param {Task} task - The task to execute
     * @returns {Promise<Consensus>} Consensus result
     */
    async executeWithConsensus(task) {
        const suitableQueens = await this.getSuitableQueens(task);
        
        if (suitableQueens.length < 2) {
            this.logger.warn(`Insufficient queens for consensus on task ${task.id}, falling back to single queen`);
            return await this.executeWithBestQueen(task);
        }

        const primaryQueen = suitableQueens[0];
        const otherQueens = suitableQueens.slice(1);

        this.logger.info(`Executing consensus for task ${task.id} with ${suitableQueens.length} queens`);
        const consensus = await primaryQueen.collaborate(task, otherQueens);
        
        if (consensus.confidence >= this.config.consensusThreshold) {
            this.taskQueue.completed.set(task.id, consensus);
            this.metrics.completedTasks++;
            this.metrics.consensusRate = 
                (this.metrics.consensusRate * (this.metrics.completedTasks - 1) + 1) / this.metrics.completedTasks;
        } else {
            this.logger.warn(`Consensus confidence ${consensus.confidence} below threshold ${this.config.consensusThreshold}`);
        }
        
        return consensus;
    }

    /**
     * Select the best queen for a task
     * @private
     * @param {Task} task - The task
     * @returns {Promise<BaseQueen | null>} Best queen or null
     */
    async selectBestQueen(task) {
        const suitableQueens = await this.getSuitableQueens(task);
        
        if (suitableQueens.length === 0) {
            return null;
        }

        if (!this.config.enableLoadBalancing) {
            return suitableQueens[0];
        }

        // Load balancing: select queen with lowest workload among suitable queens
        return suitableQueens.reduce((best, current) => 
            current.getWorkload() < best.getWorkload() ? current : best
        );
    }

    /**
     * Get suitable queens for a task
     * @private
     * @param {Task} task - The task
     * @returns {Promise<BaseQueen[]>} Array of suitable queens
     */
    async getSuitableQueens(task) {
        const suitableQueens = [];
        
        for (const queen of this.queens.values()) {
            if (await queen.canAcceptTask(task)) {
                suitableQueens.push(queen);
            }
        }

        // Sort by suitability (queens with matching specialty first)
        suitableQueens.sort((a, b) => {
            const aMatches = a.getSpecialty().includes(task.type.split('-')[0]);
            const bMatches = b.getSpecialty().includes(task.type.split('-')[0]);
            
            if (aMatches && !bMatches) return -1;
            if (!aMatches && bMatches) return 1;
            
            // If both match or neither match, sort by workload
            return a.getWorkload() - b.getWorkload();
        });

        return suitableQueens;
    }

    /**
     * Process the task queue
     * @private
     * @returns {Promise<void>}
     */
    async processTaskQueue() {
        while (this.isRunning) {
            try {
                // Process pending tasks if we're under the concurrent limit
                while (
                    this.taskQueue.pending.length > 0 && 
                    this.taskQueue.active.size < this.config.maxConcurrentTasks
                ) {
                    const task = this.taskQueue.pending.shift();
                    
                    // Process task asynchronously
                    this.executeTask(task).catch(error => {
                        this.logger.error(`Task ${task.id} failed:`, error);
                    });
                }

                // Wait before next iteration
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (error) {
                this.logger.error('Error in task queue processing:', error);
            }
        }
    }

    /**
     * Perform health check on queens
     * @private
     * @returns {void}
     */
    performHealthCheck() {
        this.logger.debug('Performing health check...');
        
        let healthyQueens = 0;
        for (const [name, queen] of this.queens.entries()) {
            const isHealthy = queen.isHealthy();
            
            if (!isHealthy) {
                this.logger.warn(`Queen ${name} is unhealthy`);
                this.emit('queenUnhealthy', { name, queen });
            } else {
                healthyQueens++;
            }

            // Update utilization metrics
            this.metrics.queenUtilization[name] = queen.getWorkload();
        }

        // Update throughput (tasks per minute)
        const now = Date.now();
        const timeWindow = 60000; // 1 minute
        const recentTasks = this.metrics.completedTasks; // Simplified calculation
        this.metrics.throughput = (recentTasks / timeWindow) * 60000;

        this.emit('healthCheck', {
            healthyQueens,
            totalQueens: this.queens.size,
            activeTasksCount: this.taskQueue.active.size,
            pendingTasksCount: this.taskQueue.pending.length,
            metrics: this.metrics
        });
    }

    /**
     * Handle queen task completion
     * @private
     * @param {string} queenName - Queen name
     * @param {any} data - Task data
     * @returns {void}
     */
    handleQueenTaskComplete(queenName, data) {
        this.logger.debug(`Queen ${queenName} completed task ${data.taskId}`);
        this.emit('taskComplete', { queenName, ...data });
    }

    /**
     * Handle queen collaboration
     * @private
     * @param {string} queenName - Queen name
     * @param {any} data - Collaboration data
     * @returns {void}
     */
    handleQueenCollaboration(queenName, data) {
        this.logger.debug(`Queen ${queenName} participated in collaboration for task ${data.task.id}`);
        this.emit('collaboration', { initiator: queenName, ...data });
    }

    /**
     * Update processing time metrics
     * @private
     * @param {number} processingTime - Processing time in milliseconds
     * @returns {void}
     */
    updateProcessingTimeMetrics(processingTime) {
        this.metrics.averageProcessingTime = 
            (this.metrics.averageProcessingTime * (this.metrics.completedTasks + this.metrics.failedTasks - 1) + processingTime) / 
            (this.metrics.completedTasks + this.metrics.failedTasks);
    }

    /**
     * Generate a unique task ID
     * @private
     * @returns {string} Task ID
     */
    generateTaskId() {
        return `task_${++this.taskIdCounter}_${Date.now()}`;
    }

    // Public API methods
    /**
     * Get all queens
     * @returns {Object.<string, BaseQueen>} Queens map
     */
    getQueens() {
        return Object.fromEntries(this.queens.entries());
    }

    /**
     * Get a specific queen by name
     * @param {string} name - Queen name
     * @returns {BaseQueen | undefined} Queen instance or undefined
     */
    getQueen(name) {
        return this.queens.get(name);
    }

    /**
     * Get task status
     * @param {string} taskId - Task ID
     * @returns {'pending' | 'active' | 'completed' | 'failed' | 'not-found'} Task status
     */
    getTaskStatus(taskId) {
        if (this.taskQueue.pending.some(task => task.id === taskId)) return 'pending';
        if (this.taskQueue.active.has(taskId)) return 'active';
        if (this.taskQueue.completed.has(taskId)) return 'completed';
        if (this.taskQueue.failed.has(taskId)) return 'failed';
        return 'not-found';
    }

    /**
     * Get task result
     * @param {string} taskId - Task ID
     * @returns {Result | Consensus | null} Task result or null
     */
    getTaskResult(taskId) {
        return this.taskQueue.completed.get(taskId) || null;
    }

    /**
     * Get task error
     * @param {string} taskId - Task ID
     * @returns {Error | null} Task error or null
     */
    getTaskError(taskId) {
        return this.taskQueue.failed.get(taskId) || null;
    }

    /**
     * Get coordinator metrics
     * @returns {CoordinatorMetrics} Current metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }

    /**
     * Get queue status
     * @returns {{pending: number, active: number, completed: number, failed: number}} Queue status
     */
    getQueueStatus() {
        return {
            pending: this.taskQueue.pending.length,
            active: this.taskQueue.active.size,
            completed: this.taskQueue.completed.size,
            failed: this.taskQueue.failed.size
        };
    }

    /**
     * Add a new queen
     * @param {string} name - Queen name
     * @param {BaseQueen} queen - Queen instance
     * @returns {Promise<void>}
     */
    async addQueen(name, queen) {
        if (this.queens.has(name)) {
            throw new Error(`Queen with name ${name} already exists`);
        }

        this.queens.set(name, queen);
        this.metrics.queenUtilization[name] = 0;

        // Set up event listeners
        queen.on('taskComplete', (data) => {
            this.handleQueenTaskComplete(name, data);
        });

        queen.on('collaboration', (data) => {
            this.handleQueenCollaboration(name, data);
        });

        this.logger.info(`Added queen: ${name}`);
        this.emit('queenAdded', { name, queen });
    }

    /**
     * Remove a queen
     * @param {string} name - Queen name
     * @returns {Promise<boolean>} True if removed, false if not found
     */
    async removeQueen(name) {
        const queen = this.queens.get(name);
        if (!queen) {
            return false;
        }

        await queen.shutdown();
        this.queens.delete(name);
        delete this.metrics.queenUtilization[name];

        this.logger.info(`Removed queen: ${name}`);
        this.emit('queenRemoved', { name });
        return true;
    }

    /**
     * Clear completed and failed tasks from queue
     * @returns {void}
     */
    clearCompletedTasks() {
        this.taskQueue.completed.clear();
        this.taskQueue.failed.clear();
        this.logger.info('Cleared completed and failed tasks from queue');
    }

    /**
     * Wait for a task to complete
     * @param {string} taskId - Task ID
     * @param {number} [timeout=30000] - Timeout in milliseconds
     * @returns {Promise<Result | Consensus>} Task result when completed
     */
    async waitForTask(taskId, timeout = 30000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            const status = this.getTaskStatus(taskId);
            
            if (status === 'completed') {
                const result = this.getTaskResult(taskId);
                if (result) return result;
            }
            
            if (status === 'failed') {
                const error = this.getTaskError(taskId);
                throw error || new Error(`Task ${taskId} failed`);
            }
            
            if (status === 'not-found') {
                throw new Error(`Task ${taskId} not found`);
            }
            
            // Wait before checking again
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        throw new Error(`Task ${taskId} timed out after ${timeout}ms`);
    }

    /**
     * Check if coordinator is running
     * @returns {boolean} True if running
     */
    isRunning() {
        return this.isRunning;
    }
}