import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';
import { BaseQueen, Task, Result, Consensus } from './base-queen.js';
import { CodeQueen } from './code-queen.js';
import { DebugQueen } from './debug-queen.js';
import { Logger } from '../utils/logger.js';

export interface QueenCoordinatorConfig {
    maxConcurrentTasks?: number;
    enableLoadBalancing?: boolean;
    consensusThreshold?: number;
    healthCheckInterval?: number;
    autoScaling?: boolean;
}

export interface TaskQueue {
    pending: Task[];
    active: Map<string, Task>;
    completed: Map<string, Result | Consensus>;
    failed: Map<string, Error>;
}

export interface CoordinatorMetrics {
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    averageProcessingTime: number;
    consensusRate: number;
    queenUtilization: { [queenName: string]: number };
    throughput: number; // tasks per minute
}

export class QueenCoordinator extends EventEmitter {
    private queens: Map<string, BaseQueen>;
    private taskQueue: TaskQueue;
    private config: Required<QueenCoordinatorConfig>;
    private logger: Logger;
    private metrics: CoordinatorMetrics;
    private isRunning = false;
    private healthCheckTimer: NodeJS.Timeout | null = null;
    private taskIdCounter = 0;

    constructor(config: QueenCoordinatorConfig = {}) {
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

    private async initializeQueens(): Promise<void> {
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

    async start(): Promise<void> {
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

    async stop(): Promise<void> {
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

    async submitTask(prompt: string, options: Partial<Task> = {}): Promise<string> {
        const taskId = this.generateTaskId();
        
        const task: Task = {
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

    async executeTask(task: Task, requireConsensus = false): Promise<Result | Consensus> {
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
            this.taskQueue.failed.set(task.id, error as Error);
            this.metrics.failedTasks++;
            throw error;
        } finally {
            this.taskQueue.active.delete(task.id);
            const processingTime = performance.now() - startTime;
            this.updateProcessingTimeMetrics(processingTime);
        }
    }

    private async executeWithBestQueen(task: Task): Promise<Result> {
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

    private async executeWithConsensus(task: Task): Promise<Consensus> {
        const suitableQueens = await this.getSuitableQueens(task);
        
        if (suitableQueens.length < 2) {
            this.logger.warn(`Insufficient queens for consensus on task ${task.id}, falling back to single queen`);
            return await this.executeWithBestQueen(task) as Consensus;
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

    private async selectBestQueen(task: Task): Promise<BaseQueen | null> {
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

    private async getSuitableQueens(task: Task): Promise<BaseQueen[]> {
        const suitableQueens: BaseQueen[] = [];
        
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

    private async processTaskQueue(): Promise<void> {
        while (this.isRunning) {
            try {
                // Process pending tasks if we're under the concurrent limit
                while (
                    this.taskQueue.pending.length > 0 && 
                    this.taskQueue.active.size < this.config.maxConcurrentTasks
                ) {
                    const task = this.taskQueue.pending.shift()!;
                    
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

    private performHealthCheck(): void {
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

    private handleQueenTaskComplete(queenName: string, data: any): void {
        this.logger.debug(`Queen ${queenName} completed task ${data.taskId}`);
        this.emit('taskComplete', { queenName, ...data });
    }

    private handleQueenCollaboration(queenName: string, data: any): void {
        this.logger.debug(`Queen ${queenName} participated in collaboration for task ${data.task.id}`);
        this.emit('collaboration', { initiator: queenName, ...data });
    }

    private updateProcessingTimeMetrics(processingTime: number): void {
        this.metrics.averageProcessingTime = 
            (this.metrics.averageProcessingTime * (this.metrics.completedTasks + this.metrics.failedTasks - 1) + processingTime) / 
            (this.metrics.completedTasks + this.metrics.failedTasks);
    }

    private generateTaskId(): string {
        return `task_${++this.taskIdCounter}_${Date.now()}`;
    }

    // Public API methods
    getQueens(): { [name: string]: BaseQueen } {
        return Object.fromEntries(this.queens.entries());
    }

    getQueen(name: string): BaseQueen | undefined {
        return this.queens.get(name);
    }

    getTaskStatus(taskId: string): 'pending' | 'active' | 'completed' | 'failed' | 'not-found' {
        if (this.taskQueue.pending.some(task => task.id === taskId)) return 'pending';
        if (this.taskQueue.active.has(taskId)) return 'active';
        if (this.taskQueue.completed.has(taskId)) return 'completed';
        if (this.taskQueue.failed.has(taskId)) return 'failed';
        return 'not-found';
    }

    getTaskResult(taskId: string): Result | Consensus | null {
        return this.taskQueue.completed.get(taskId) || null;
    }

    getTaskError(taskId: string): Error | null {
        return this.taskQueue.failed.get(taskId) || null;
    }

    getMetrics(): CoordinatorMetrics {
        return { ...this.metrics };
    }

    getQueueStatus(): {
        pending: number;
        active: number;
        completed: number;
        failed: number;
    } {
        return {
            pending: this.taskQueue.pending.length,
            active: this.taskQueue.active.size,
            completed: this.taskQueue.completed.size,
            failed: this.taskQueue.failed.size
        };
    }

    async addQueen(name: string, queen: BaseQueen): Promise<void> {
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

    async removeQueen(name: string): Promise<boolean> {
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

    clearCompletedTasks(): void {
        this.taskQueue.completed.clear();
        this.taskQueue.failed.clear();
        this.logger.info('Cleared completed and failed tasks from queue');
    }

    async waitForTask(taskId: string, timeout = 30000): Promise<Result | Consensus> {
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

    isRunning(): boolean {
        return this.isRunning;
    }
}