import { BaseEventManager } from '../core/base-event-manager.ts';
class WorkflowEventManager extends BaseEventManager {
    workflowMetrics = {
        totalWorkflows: 0,
        activeWorkflows: 0,
        completedWorkflows: 0,
        failedWorkflows: 0,
        totalTasks: 0,
        completedTasks: 0,
        failedTasks: 0,
        retryCount: 0,
        totalExecutionTime: 0,
        longestWorkflow: 0,
        averageExecutionTime: 0,
        dependencyResolutions: 0,
        orchestrationEvents: 0,
        performanceStats: {
            successRate: 0,
            averageTaskTime: 0,
            bottleneckTasks: new Set(),
            lastCalculated: new Date(),
        },
    };
    subscriptions = {
        execution: new Map(),
        task: new Map(),
        orchestration: new Map(),
        performance: new Map(),
        dependency: new Map(),
    };
    activeWorkflows = new Map();
    constructor(config, logger) {
        super(config, logger);
        this.initializeWorkflowHandlers();
    }
    async emitWorkflowEvent(event) {
        try {
            this.updateWorkflowMetrics(event);
            const enrichedEvent = {
                ...event,
                metadata: {
                    ...event.metadata,
                    timestamp: new Date(),
                    processingTime: Date.now(),
                    workflowId: event.workflowId,
                    taskId: event.taskId,
                    orchestrationId: event.data?.orchestrationId,
                },
            };
            await this.emit(enrichedEvent);
            await this.routeWorkflowEvent(enrichedEvent);
            this.logger.debug(`Workflow event emitted: ${event.operation} for ${event.workflowId}`);
        }
        catch (error) {
            this.workflowMetrics.failedWorkflows++;
            this.logger.error('Failed to emit workflow event:', error);
            throw error;
        }
    }
    subscribeExecutionEvents(listener) {
        const subscriptionId = this.generateSubscriptionId();
        this.subscriptions.execution.set(subscriptionId, listener);
        this.logger.debug(`Execution event subscription created: ${subscriptionId}`);
        return subscriptionId;
    }
    subscribeTaskEvents(listener) {
        const subscriptionId = this.generateSubscriptionId();
        this.subscriptions.task.set(subscriptionId, listener);
        this.logger.debug(`Task event subscription created: ${subscriptionId}`);
        return subscriptionId;
    }
    subscribeOrchestrationEvents(listener) {
        const subscriptionId = this.generateSubscriptionId();
        this.subscriptions.orchestration.set(subscriptionId, listener);
        this.logger.debug(`Orchestration event subscription created: ${subscriptionId}`);
        return subscriptionId;
    }
    subscribePerformanceEvents(listener) {
        const subscriptionId = this.generateSubscriptionId();
        this.subscriptions.performance.set(subscriptionId, listener);
        this.logger.debug(`Performance event subscription created: ${subscriptionId}`);
        return subscriptionId;
    }
    subscribeDependencyEvents(listener) {
        const subscriptionId = this.generateSubscriptionId();
        this.subscriptions.dependency.set(subscriptionId, listener);
        this.logger.debug(`Dependency event subscription created: ${subscriptionId}`);
        return subscriptionId;
    }
    async getWorkflowMetrics() {
        const totalWorkflows = this.workflowMetrics.totalWorkflows;
        const failureRate = totalWorkflows > 0
            ? this.workflowMetrics.failedWorkflows / totalWorkflows
            : 0;
        const taskFailureRate = this.workflowMetrics.totalTasks > 0
            ? this.workflowMetrics.failedTasks / this.workflowMetrics.totalTasks
            : 0;
        this.updatePerformanceStats();
        return {
            activeWorkflows: this.workflowMetrics.activeWorkflows,
            completedTasks: this.workflowMetrics.completedTasks,
            failureRate,
            performance: {
                successRate: this.workflowMetrics.performanceStats.successRate,
                averageExecutionTime: this.workflowMetrics.averageExecutionTime,
                averageTaskTime: this.workflowMetrics.performanceStats.averageTaskTime,
                longestWorkflow: this.workflowMetrics.longestWorkflow,
            },
            execution: {
                totalWorkflows: this.workflowMetrics.totalWorkflows,
                completedWorkflows: this.workflowMetrics.completedWorkflows,
                failedWorkflows: this.workflowMetrics.failedWorkflows,
                retryCount: this.workflowMetrics.retryCount,
            },
            tasks: {
                total: this.workflowMetrics.totalTasks,
                completed: this.workflowMetrics.completedTasks,
                failed: this.workflowMetrics.failedTasks,
                bottlenecks: Array.from(this.workflowMetrics.performanceStats.bottleneckTasks),
            },
            orchestration: {
                events: this.workflowMetrics.orchestrationEvents,
                dependencyResolutions: this.workflowMetrics.dependencyResolutions,
            },
        };
    }
    async getMetrics() {
        const baseMetrics = await super.getMetrics();
        const workflowMetrics = await this.getWorkflowMetrics();
        return {
            ...baseMetrics,
            customMetrics: {
                workflow: workflowMetrics,
            },
        };
    }
    async healthCheck() {
        const baseStatus = await super.healthCheck();
        const workflowMetrics = await this.getWorkflowMetrics();
        const highFailureRate = workflowMetrics.failureRate > 0.2;
        const manyActiveWorkflows = workflowMetrics.activeWorkflows > 100;
        const lowSuccessRate = workflowMetrics.performance.successRate < 0.8;
        const slowExecution = workflowMetrics.performance.averageExecutionTime > 60000;
        const isHealthy = baseStatus.status === 'healthy' &&
            !highFailureRate &&
            !manyActiveWorkflows &&
            !lowSuccessRate &&
            !slowExecution;
        return {
            ...baseStatus,
            status: isHealthy ? 'healthy' : 'degraded',
            metadata: {
                ...baseStatus.metadata,
                workflow: {
                    activeWorkflows: workflowMetrics.activeWorkflows,
                    failureRate: workflowMetrics.failureRate,
                    successRate: workflowMetrics.performance.successRate,
                    averageExecutionTime: workflowMetrics.performance.averageExecutionTime,
                },
            },
        };
    }
    initializeWorkflowHandlers() {
        this.logger.debug('Initializing workflow event handlers');
        this.subscribe([
            'workflow:execution',
            'workflow:task',
            'workflow:orchestration',
            'workflow:performance',
            'workflow:dependency',
        ], this.handleWorkflowEvent.bind(this));
    }
    async handleWorkflowEvent(event) {
        try {
            const operationType = event.type.split(':')[1];
            switch (operationType) {
                case 'execution':
                    await this.notifySubscribers(this.subscriptions.execution, event);
                    break;
                case 'task':
                    await this.notifySubscribers(this.subscriptions.task, event);
                    break;
                case 'orchestration':
                    await this.notifySubscribers(this.subscriptions.orchestration, event);
                    break;
                case 'performance':
                    await this.notifySubscribers(this.subscriptions.performance, event);
                    break;
                case 'dependency':
                    await this.notifySubscribers(this.subscriptions.dependency, event);
                    break;
                default:
                    this.logger.warn(`Unknown workflow operation type: ${operationType}`);
            }
        }
        catch (error) {
            this.logger.error('Workflow event handling failed:', error);
            throw error;
        }
    }
    async routeWorkflowEvent(event) {
        if (event.workflowId) {
            this.updateActiveWorkflows(event);
        }
        switch (event.operation) {
            case 'start':
                this.workflowMetrics.activeWorkflows++;
                this.logger.info(`Workflow started: ${event.workflowId}`);
                if (event.workflowId) {
                    this.activeWorkflows.set(event.workflowId, {
                        id: event.workflowId,
                        status: 'running',
                        startTime: Date.now(),
                        totalTasks: event.data?.totalTasks || 0,
                        completedTasks: 0,
                        failedTasks: 0,
                    });
                }
                break;
            case 'complete':
                this.workflowMetrics.activeWorkflows = Math.max(0, this.workflowMetrics.activeWorkflows - 1);
                this.workflowMetrics.completedWorkflows++;
                this.logger.info(`Workflow completed: ${event.workflowId}`);
                if (event.workflowId && this.activeWorkflows.has(event.workflowId)) {
                    const workflow = this.activeWorkflows.get(event.workflowId);
                    const duration = Date.now() - workflow.startTime;
                    this.workflowMetrics.totalExecutionTime += duration;
                    if (duration > this.workflowMetrics.longestWorkflow) {
                        this.workflowMetrics.longestWorkflow = duration;
                    }
                    this.activeWorkflows.delete(event.workflowId);
                }
                break;
            case 'fail':
                this.workflowMetrics.activeWorkflows = Math.max(0, this.workflowMetrics.activeWorkflows - 1);
                this.workflowMetrics.failedWorkflows++;
                this.logger.error(`Workflow failed: ${event.workflowId} - ${event.data?.error}`);
                if (event.workflowId) {
                    this.activeWorkflows.delete(event.workflowId);
                }
                break;
            case 'retry':
                this.workflowMetrics.retryCount++;
                this.logger.warn(`Workflow retry: ${event.workflowId} (attempt ${event.data?.attempt})`);
                break;
            case 'task-complete':
                this.workflowMetrics.completedTasks++;
                if (event.workflowId && this.activeWorkflows.has(event.workflowId)) {
                    this.activeWorkflows.get(event.workflowId).completedTasks++;
                }
                break;
            case 'task-fail':
                this.workflowMetrics.failedTasks++;
                if (event.workflowId && this.activeWorkflows.has(event.workflowId)) {
                    this.activeWorkflows.get(event.workflowId).failedTasks++;
                }
                if (event.taskId &&
                    event.data?.duration &&
                    event.data.duration > 30000) {
                    this.workflowMetrics.performanceStats.bottleneckTasks.add(event.taskId);
                }
                break;
            case 'dependency-resolved':
                this.workflowMetrics.dependencyResolutions++;
                this.logger.debug(`Dependency resolved: ${event.data?.dependency} for ${event.workflowId}`);
                break;
            case 'orchestrate':
                this.workflowMetrics.orchestrationEvents++;
                this.logger.debug(`Orchestration event: ${event.data?.action} for ${event.workflowId}`);
                break;
        }
    }
    updateWorkflowMetrics(event) {
        const operationType = event.type.split(':')[1];
        switch (operationType) {
            case 'execution':
                if (event.operation === 'start') {
                    this.workflowMetrics.totalWorkflows++;
                }
                break;
            case 'task':
                if (event.operation === 'create' || event.operation === 'start') {
                    this.workflowMetrics.totalTasks++;
                }
                break;
            case 'orchestration':
                this.workflowMetrics.orchestrationEvents++;
                break;
        }
    }
    updateActiveWorkflows(event) {
        if (!event.workflowId)
            return;
        const workflow = this.activeWorkflows.get(event.workflowId);
        if (workflow) {
            switch (event.operation) {
                case 'pause':
                    workflow.status = 'paused';
                    break;
                case 'resume':
                    workflow.status = 'running';
                    break;
                case 'task-complete':
                    workflow.completedTasks++;
                    break;
                case 'task-fail':
                    workflow.failedTasks++;
                    break;
            }
        }
    }
    updatePerformanceStats() {
        const totalWorkflows = this.workflowMetrics.totalWorkflows;
        const completedWorkflows = this.workflowMetrics.completedWorkflows;
        this.workflowMetrics.performanceStats.successRate =
            totalWorkflows > 0 ? completedWorkflows / totalWorkflows : 0;
        this.workflowMetrics.averageExecutionTime =
            completedWorkflows > 0
                ? this.workflowMetrics.totalExecutionTime / completedWorkflows
                : 0;
        const completedTasks = this.workflowMetrics.completedTasks;
        this.workflowMetrics.performanceStats.averageTaskTime =
            completedTasks > 0
                ? this.workflowMetrics.totalExecutionTime / completedTasks
                : 0;
        this.workflowMetrics.performanceStats.lastCalculated = new Date();
    }
    async notifySubscribers(subscribers, event) {
        const notifications = Array.from(subscribers.values()).map(async (listener) => {
            try {
                await listener(event);
            }
            catch (error) {
                this.logger.error('Workflow event listener failed:', error);
            }
        });
        await Promise.allSettled(notifications);
    }
    generateSubscriptionId() {
        return `workflow-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
}
export class WorkflowEventManagerFactory {
    logger;
    config;
    constructor(logger, config) {
        this.logger = logger;
        this.config = config;
        this.logger.debug('WorkflowEventManagerFactory initialized');
    }
    async create(config) {
        this.logger.info(`Creating workflow event manager: ${config.name}`);
        this.validateConfig(config);
        const optimizedConfig = this.applyWorkflowDefaults(config);
        const manager = new WorkflowEventManager(optimizedConfig, this.logger);
        await this.configureWorkflowManager(manager, optimizedConfig);
        this.logger.info(`Workflow event manager created successfully: ${config.name}`);
        return manager;
    }
    validateConfig(config) {
        if (!config.name) {
            throw new Error('Workflow event manager name is required');
        }
        if (config.type !== 'workflow') {
            throw new Error('Manager type must be "workflow"');
        }
        if (config.processing?.timeout && config.processing.timeout < 5000) {
            this.logger.warn('Workflow processing timeout < 5000ms may be too short for complex workflows');
        }
    }
    applyWorkflowDefaults(config) {
        return {
            ...config,
            maxListeners: config.maxListeners || 200,
            processing: {
                strategy: 'reliable',
                timeout: 30000,
                retries: 3,
                batchSize: 25,
                ...config.processing,
            },
            persistence: {
                enabled: true,
                maxAge: 2592000000,
                ...config.persistence,
            },
            monitoring: {
                enabled: true,
                metricsInterval: 60000,
                healthCheckInterval: 180000,
                ...config.monitoring,
            },
        };
    }
    async configureWorkflowManager(manager, config) {
        if (config.monitoring?.enabled) {
            await manager.start();
            this.logger.debug(`Workflow event manager monitoring started: ${config.name}`);
        }
        if (config.monitoring?.healthCheckInterval) {
            setInterval(async () => {
                try {
                    const status = await manager.healthCheck();
                    if (status.status !== 'healthy') {
                        this.logger.warn(`Workflow manager health degraded: ${config.name}`, status.metadata);
                    }
                }
                catch (error) {
                    this.logger.error(`Workflow manager health check failed: ${config.name}`, error);
                }
            }, config.monitoring.healthCheckInterval);
        }
    }
}
export default WorkflowEventManagerFactory;
//# sourceMappingURL=workflow-event-factory.js.map