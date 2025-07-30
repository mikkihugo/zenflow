import { EventEmitter } from 'node:events';
import { performance } from 'node:perf_hooks';
import { Logger } from '../utils/logger.js';
import { CodeQueen } from './code-queen.js';
import { DebugQueen } from './debug-queen.js';

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
  constructor(_config = {}): any {
        super();
        
        this.config = {maxConcurrentTasks = new Logger('QueenCoordinator');
        this.queens = new Map();
        this.taskQueue = {
            pending = {totalTasks = new CodeQueen();
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

            this.logger.info(`Initialized ${this.queens.size}queens = true;

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
        if(!this.isRunning) {
            return;
        }

        this.logger.info('Stopping QueenCoordinator...');
        this.isRunning = false;

        // Clear health check timer
        if(this.healthCheckTimer) {
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
    async submitTask(prompt, options = {}): any {
        const taskId = this.generateTaskId();
        
        const task = {id = false] - Whether to require consensus
     * @returns {Promise<Result | Consensus>} Task result
     */
    async executeTask(task, requireConsensus = false): any {
        const startTime = performance.now();
        
        try {
            this.logger.info(`Executing task ${task.id},requireConsensus = performance.now() - startTime;
            this.updateProcessingTimeMetrics(processingTime);
        }
}

/**
 * Execute task with the best available queen
 * @private
 * @param {Task} task - The task to execute
 * @returns {Promise<Result>} Task result
 */
async;
executeWithBestQueen(task);
: any
{
  const bestQueen = await this.selectBestQueen(task);

  if (!bestQueen) {
    throw new Error(`No suitable queen found for tasktype = await bestQueen.process(task);
        
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
    async executeWithConsensus(task): any {
        const suitableQueens = await this.getSuitableQueens(task);
        
        if(suitableQueens.length < 2) {
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
      (this.metrics.consensusRate * (this.metrics.completedTasks - 1) + 1) /
      this.metrics.completedTasks;
  } else {
    this.logger.warn(
      `Consensus confidence ${consensus.confidence} below threshold ${this.config.consensusThreshold}`
    );
  }

  return consensus;
}

/**
 * Select the best queen for a task
 * @private
 * @param {Task} task - The task
 * @returns {Promise<BaseQueen | null>} Best queen or null
 */
async;
selectBestQueen(task);
: any
{
  const suitableQueens = await this.getSuitableQueens(task);

  if (suitableQueens.length === 0) {
    return null;
  }

  if (!this.config.enableLoadBalancing) {
    return suitableQueens[0];
  }

  // Loadbalancing = >
  current.getWorkload() < best.getWorkload() ?current = [];

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
async;
processTaskQueue();
{
        while(this.isRunning) {
            try {
                // Process pending tasks if we're under the concurrent limit
                while(
                    this.taskQueue.pending.length > 0 && 
                    this.taskQueue.active.size < this.config.maxConcurrentTasks
                ) {
                    const task = this.taskQueue.pending.shift();
                    
                    // Process task asynchronously
                    this.executeTask(task).catch(_error => {
                        this.logger.error(`Task ${task.id}failed = > setTimeout(resolve, 100));
            } catch(error) {
                this.logger.error('Error in task queueprocessing = 0;
        for (const [name, queen] of this.queens.entries()) {
            const isHealthy = queen.isHealthy();
            
            if(!isHealthy) {
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
            healthyQueens,totalQueens = (this.metrics.averageProcessingTime * (this.metrics.completedTasks + this.metrics.failedTasks - 1) + processingTime) / 
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
    getQueen(name): any {
        return this.queens.get(name);
    }

    /**
     * Get task status
     * @param {string} taskId - Task ID
     * @returns {'pending' | 'active' | 'completed' | 'failed' | 'not-found'} Task status
     */
    getTaskStatus(taskId): any {
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
    getTaskResult(taskId): any {
        return this.taskQueue.completed.get(taskId) || null;
    }

    /**
     * Get task error
     * @param {string} taskId - Task ID
     * @returns {Error | null} Task error or null
     */
    getTaskError(taskId): any {
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
     * @returns {{pending = 0;

        // Set up event listeners
        queen.on('taskComplete', (data) => {
            this.handleQueenTaskComplete(name, data);
        });

        queen.on('collaboration', (data) => {
            this.handleQueenCollaboration(name, data);
        });

        this.logger.info(`Addedqueen = this.queens.get(name);
        if(!queen) {
            return false;
        }

        await queen.shutdown();
        this.queens.delete(name);
        delete this.metrics.queenUtilization[name];

        this.logger.info(`Removedqueen = 30000] - Timeout in milliseconds
     * @returns {Promise<Result | Consensus>} Task result when completed
     */
    async waitForTask(taskId, timeout = 30000): any {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            const status = this.getTaskStatus(taskId);
            
            if(status === 'completed') {
                const result = this.getTaskResult(taskId);
                if (result) return result;
            }
            
            if(status === 'failed') {
                const error = this.getTaskError(taskId);
                throw error || new Error(`Task ${taskId} failed`);
            }
            
            if(status === 'not-found') {
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
