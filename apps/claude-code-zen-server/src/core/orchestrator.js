import { getLogger } from '@claude-zen/foundation';
export class Orchestrator {
    config;
    logger = getLogger('Orchestrator');
    isStarted = false;
    activeTasks = new Map();
    terminalManager;
    memoryManager;
    coordinationManager;
    eventBus;
    constructor(config, dependencies, customLogger = getLogger('Orchestrator')) {
        this.config = config;
        this.terminalManager = dependencies.terminalManager;
        this.memoryManager = dependencies.memoryManager;
        this.coordinationManager = dependencies.coordinationManager;
        this.eventBus = dependencies.eventBus;
        this.logger = customLogger;
    }
    async start() {
        if (this.isStarted) {
            this.logger.warn('Orchestrator already started');
            return;
        }
        this.logger.info('Starting orchestrator', { config: this.config });
        // Initialize all managers
        await this.terminalManager.initialize?.();
        await this.memoryManager.initialize?.();
        await this.coordinationManager.initialize?.();
        // Set up health check if enabled
        if (this.config.enableHealthCheck) {
            this.startHealthCheck();
        }
        this.isStarted = true;
        this.eventBus.emit?.('orchestrator:started', { config: this.config });
        this.logger.info('Orchestrator started successfully');
    }
    async stop() {
        if (!this.isStarted) {
            return;
        }
        this.logger.info('Stopping orchestrator');
        // Wait for all active tasks to complete
        await Promise.allSettled(Array.from(this.activeTasks.values()));
        // Stop all managers
        await this.coordinationManager.stop?.();
        await this.memoryManager.stop?.();
        await this.terminalManager.stop?.();
        this.isStarted = false;
        this.eventBus.emit?.('orchestrator:stopped');
        this.logger.info('Orchestrator stopped successfully');
    }
    async executeTask(task) {
        if (!this.isStarted) {
            throw new Error('Orchestrator not started');
        }
        if (this.activeTasks.size >= this.config.maxConcurrentTasks) {
            throw new Error('Maximum concurrent tasks reached');
        }
        const startTime = Date.now();
        this.logger.info('Executing task', { task });
        const taskPromise = this.processTask(task, startTime);
        this.activeTasks.set(task.id, taskPromise);
        try {
            const result = await taskPromise;
            this.eventBus.emit?.('task:completed', { task, result });
            return result;
        }
        catch (error) {
            const errorResult = {
                id: task.id,
                status: 'failure',
                error: error instanceof Error ? error.message : 'Unknown error',
                duration: Date.now() - startTime,
            };
            this.eventBus.emit?.('task:failed', { task, error: errorResult });
            return errorResult;
        }
        finally {
            this.activeTasks.delete(task.id);
        }
    }
    async processTask(task, startTime) {
        const timeoutPromise = new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(new Error('Task timeout'));
            }, this.config.timeout);
        });
        const taskPromise = this.executeTaskLogic(task, startTime);
        try {
            return await Promise.race([taskPromise, timeoutPromise]);
        }
        catch (error) {
            if (error instanceof Error && error.message === 'Task timeout') {
                return {
                    id: task.id,
                    status: 'timeout',
                    error: 'Task execution timed out',
                    duration: Date.now() - startTime,
                };
            }
            throw error;
        }
    }
    async executeTaskLogic(task, startTime) {
        // Store task in memory for tracking
        await this.memoryManager.storeTask?.(task);
        // Coordinate with other systems
        await this.coordinationManager.coordinateTask?.(task);
        // Execute based on task type
        let result;
        switch (task.type) {
            case 'neural_training':
                result = await this.executeNeuralTraining(task);
                break;
            case 'data_processing':
                result = await this.executeDataProcessing(task);
                break;
            case 'system_coordination':
                result = await this.executeSystemCoordination(task);
                break;
            default:
                throw new Error(`Unknown task type: ${task.type}`);
        }
        return {
            id: task.id,
            status: 'success',
            result,
            duration: Date.now() - startTime,
        };
    }
    executeNeuralTraining(task) {
        this.logger.info('Executing neural training', { task });
        // Neural training implementation would go here
        return Promise.resolve({
            trained: true,
            model: task.input?.dataset,
        });
    }
    executeDataProcessing(task) {
        this.logger.info('Executing data processing', { task });
        // Data processing implementation would go here
        return Promise.resolve({
            processed: true,
            records: task.input?.recordCount || 0,
        });
    }
    executeSystemCoordination(task) {
        this.logger.info('Executing system coordination', { task });
        // System coordination implementation would go here
        return Promise.resolve({
            coordinated: true,
            systems: task.input?.systems || [],
        });
    }
    startHealthCheck() {
        setInterval(async () => {
            try {
                const health = await this.getHealthStatus();
                this.eventBus.emit?.('health:check', health);
                if (!health.healthy) {
                    this.logger.warn('Health check failed', { health });
                }
            }
            catch (error) {
                this.logger.error('Health check error', { error });
            }
        }, this.config.healthCheckInterval);
    }
    async getHealthStatus() {
        const details = {
            started: this.isStarted,
            activeTasks: this.activeTasks.size,
            maxTasks: this.config.maxConcurrentTasks,
            managers: {
                terminal: await this.terminalManager.isHealthy?.() || false,
                memory: await this.memoryManager.isHealthy?.() || false,
                coordination: await this.coordinationManager.isHealthy?.() || false,
            },
        };
        const healthy = this.isStarted &&
            details.managers.terminal &&
            details.managers.memory &&
            details.managers.coordination;
        return { healthy, details };
    }
    getActiveTasks() {
        return Array.from(this.activeTasks.keys());
    }
}
// Example usage:
// Initialize orchestrator with full dependency injection
// const orchestrator = new Orchestrator(
//   {
//     name: 'claude-zen-main',
//     timeout: 60000,
//     maxConcurrentTasks: 20,
//     enableHealthCheck: true,
//     healthCheckInterval: 30000
//   },
//   terminalManager, memoryManager, coordinationManager, eventBus, logger
// );
//
// Start system coordination
// await orchestrator.start();
//
// Execute tasks with priority handling
// const result = await orchestrator.executeTask({
//   id: 'neural-training-001',
//   type: 'neural_training',
//   description: 'Train CNN model with latest dataset',
//   priority: 1,
//   input: {
//     dataset: 'cnn_v2',
//     epochs: 100
//   },
//   metadata: {
//     userId: '123',
//     sessionId: 'abc'
//   }
// });
