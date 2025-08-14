import { getLogger } from '../config/logging-config.ts';
import { Domain, getDomainValidator, } from '../core/domain-boundary-validator.ts';
import { createCorrelationId, createEvent, createTypeSafeEventBus, EventPriority, } from '../core/type-safe-event-system.ts';
const logger = getLogger('event-integration-examples');
export async function createProductionEventBus() {
    const config = {
        enableMetrics: true,
        enableCaching: true,
        domainValidation: true,
        maxEventHistory: 10000,
        defaultTimeout: 30000,
        maxConcurrency: 100,
        batchSize: 50,
        retryAttempts: 3,
        backoffMultiplier: 2,
    };
    const eventBus = createTypeSafeEventBus(config);
    await eventBus.initialize();
    logger.info('Production event bus created', { config });
    return eventBus;
}
export class EventDrivenCoordinationSystem {
    eventBus;
    constructor(eventBus) {
        this.eventBus = eventBus;
    }
    async initializeCoordination() {
        this.eventBus.registerHandler('agent.created', this.handleAgentCreated.bind(this));
        this.eventBus.registerHandler('agent.destroyed', this.handleAgentDestroyed.bind(this));
        this.eventBus.registerHandler('task.assigned', this.handleTaskAssigned.bind(this));
        this.eventBus.registerHandler('task.completed', this.handleTaskCompleted.bind(this));
        this.eventBus.registerHandler('swarm.state.changed', this.handleSwarmStateChanged.bind(this));
        logger.info('Event-driven coordination system initialized');
    }
    async createAgent(agentConfig) {
        const correlationId = createCorrelationId();
        logger.info('Creating agent', { agentId: agentConfig.id, correlationId });
        const agent = {
            id: agentConfig.id,
            capabilities: agentConfig.capabilities,
            status: 'idle',
        };
        const agentCreatedEvent = createEvent('agent.created', Domain.COORDINATION, {
            payload: {
                agent,
                capabilities: agent.capabilities,
                initialStatus: agent.status,
            },
        }, {
            correlationId,
            source: 'coordination-system',
            priority: EventPriority.HIGH,
            tags: [`agent-type:${agentConfig.type}`, 'lifecycle:creation'],
        });
        const result = await this.eventBus.emitEvent(agentCreatedEvent);
        if (!result.success) {
            throw new Error(`Failed to emit agent creation event: ${result.error?.message}`);
        }
        logger.info('Agent created successfully', {
            agentId: agent.id,
            correlationId,
            processingTime: result.processingTime,
        });
        return agent;
    }
    async assignTask(taskId, agentId) {
        const correlationId = createCorrelationId();
        logger.info('Assigning task', { taskId, agentId, correlationId });
        const task = {
            id: taskId,
            description: `Task ${taskId}`,
            strategy: 'adaptive',
            dependencies: [],
            requiredCapabilities: ['analysis'],
            maxAgents: 1,
            requireConsensus: false,
        };
        const taskAssignedEvent = createEvent('task.assigned', Domain.COORDINATION, {
            payload: {
                task,
                agentId,
                assignmentTime: new Date(),
            },
        }, {
            correlationId,
            source: 'task-coordinator',
            priority: EventPriority.NORMAL,
        });
        const result = await this.eventBus.routeCrossDomainEvent(taskAssignedEvent, Domain.WORKFLOWS, Domain.COORDINATION, 'task_assignment');
        if (!result.success) {
            logger.error('Task assignment failed', {
                taskId,
                agentId,
                error: result.error?.message,
                correlationId,
            });
            throw new Error(`Task assignment failed: ${result.error?.message}`);
        }
        logger.info('Task assigned successfully', {
            taskId,
            agentId,
            correlationId,
            crossingId: result.metadata?.crossingId,
        });
    }
    async handleAgentCreated(event) {
        const { agent, capabilities } = event.payload;
        logger.info('Processing agent creation', {
            agentId: agent.id,
            capabilities,
            correlationId: event.metadata?.correlationId,
        });
        try {
            const validator = getDomainValidator(Domain.COORDINATION);
            validator.trackCrossings(Domain.CORE, Domain.COORDINATION, 'agent_creation');
            logger.debug('Agent creation processed successfully', {
                agentId: agent.id,
                status: agent.status,
            });
        }
        catch (error) {
            logger.error('Agent creation processing failed', {
                agentId: agent.id,
                error: error instanceof Error ? error.message : String(error),
                correlationId: event.metadata?.correlationId,
            });
            await this.eventBus.emitEvent(createEvent('error.occurred', Domain.CORE, {
                payload: {
                    error: error instanceof Error ? error : new Error(String(error)),
                    context: { operation: 'agent_creation', agentId: agent.id },
                    severity: 'high',
                    recoverable: true,
                },
            }, { correlationId: event.metadata?.correlationId }));
        }
    }
    async handleAgentDestroyed(event) {
        const { agentId, reason } = event.payload;
        logger.info('Processing agent destruction', { agentId, reason });
    }
    async handleTaskAssigned(event) {
        const { task, agentId, assignmentTime } = event.payload;
        logger.info('Processing task assignment', {
            taskId: task.id,
            agentId,
            assignmentTime,
            correlationId: event.metadata?.correlationId,
        });
        setTimeout(async () => {
            const taskCompletedEvent = createEvent('task.completed', Domain.COORDINATION, {
                payload: {
                    taskId: task.id,
                    agentId,
                    result: {
                        status: 'completed',
                        output: 'Task completed successfully',
                    },
                    duration: 5000,
                    success: true,
                },
            }, {
                correlationId: event.metadata?.correlationId,
                causationId: event.id,
                source: 'task-executor',
            });
            await this.eventBus.emitEvent(taskCompletedEvent);
        }, 1000);
    }
    async handleTaskCompleted(event) {
        const { taskId, agentId, result, duration, success } = event.payload;
        logger.info('Processing task completion', {
            taskId,
            agentId,
            success,
            duration,
            correlationId: event.metadata?.correlationId,
        });
    }
    async handleSwarmStateChanged(event) {
        const { swarmId, previousState, newState, agentCount } = event.payload;
        logger.info('Processing swarm state change', {
            swarmId,
            previousState,
            newState,
            agentCount,
        });
    }
}
export class AGUIValidationSystem {
    eventBus;
    pendingValidations = new Map();
    constructor(eventBus) {
        this.eventBus = eventBus;
    }
    async initializeAGUI() {
        this.eventBus.registerHandler('human.validation.requested', this.handleValidationRequest.bind(this));
        this.eventBus.registerHandler('human.validation.completed', this.handleValidationCompleted.bind(this));
        this.eventBus.registerHandler('agui.gate.opened', this.handleGateOpened.bind(this));
        this.eventBus.registerHandler('agui.gate.closed', this.handleGateClosed.bind(this));
        logger.info('AGUI validation system initialized');
    }
    async requestHumanValidation(validationType, context, options = {}) {
        const requestId = `val-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        const correlationId = options.correlationId || createCorrelationId();
        const timeout = options.timeout || 300000;
        logger.info('Requesting human validation', {
            requestId,
            validationType,
            priority: options.priority,
            correlationId,
        });
        const validationRequest = createEvent('human.validation.requested', Domain.INTERFACES, {
            payload: {
                requestId,
                validationType,
                context,
                priority: options.priority || EventPriority.NORMAL,
                timeout,
            },
        }, {
            correlationId,
            source: 'agui-validation-system',
            priority: options.priority || EventPriority.NORMAL,
        });
        const result = await this.eventBus.emitEvent(validationRequest);
        if (!result.success) {
            throw new Error(`Failed to request human validation: ${result.error?.message}`);
        }
        return new Promise((resolve, reject) => {
            const timeoutHandle = setTimeout(() => {
                this.pendingValidations.delete(requestId);
                reject(new Error('Human validation timeout'));
            }, timeout);
            this.pendingValidations.set(requestId, {
                requestId,
                context,
                timeout: timeoutHandle,
                resolve: (approved) => {
                    clearTimeout(timeoutHandle);
                    resolve({ approved, input: null, feedback: null });
                },
            });
        });
    }
    async openAGUIGate(gateType, context, requiresApproval = true) {
        const gateId = `gate-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
        const correlationId = createCorrelationId();
        logger.info('Opening AGUI gate', {
            gateId,
            gateType,
            requiresApproval,
            correlationId,
        });
        const gateOpenedEvent = createEvent('agui.gate.opened', Domain.INTERFACES, {
            payload: {
                gateId,
                gateType,
                requiredApproval: requiresApproval,
                context,
            },
        }, { correlationId, source: 'agui-gate-system' });
        const result = await this.eventBus.emitEvent(gateOpenedEvent);
        if (!result.success) {
            throw new Error(`Failed to open AGUI gate: ${result.error?.message}`);
        }
        if (!requiresApproval) {
            const closeResult = await this.closeAGUIGate(gateId, true, 0, correlationId);
            return closeResult;
        }
        return new Promise((resolve) => {
            setTimeout(() => {
                this.closeAGUIGate(gateId, true, 5000, correlationId).then(resolve);
            }, 100);
        });
    }
    async closeAGUIGate(gateId, approved, duration, correlationId, humanInput) {
        const gateClosedEvent = createEvent('agui.gate.closed', Domain.INTERFACES, {
            payload: {
                gateId,
                approved,
                duration,
                humanInput,
            },
        }, { correlationId, source: 'agui-gate-system' });
        await this.eventBus.emitEvent(gateClosedEvent);
        return { approved, duration, humanInput };
    }
    async handleValidationRequest(event) {
        const { requestId, validationType, context, priority } = event.payload;
        logger.info('Processing validation request', {
            requestId,
            validationType,
            priority,
            correlationId: event.metadata?.correlationId,
        });
        setTimeout(async () => {
            const completedEvent = createEvent('human.validation.completed', Domain.INTERFACES, {
                payload: {
                    requestId,
                    approved: true,
                    processingTime: 2000,
                    feedback: 'Approved by human operator',
                },
            }, {
                correlationId: event.metadata?.correlationId,
                causationId: event.id,
                source: 'human-operator',
            });
            await this.eventBus.emitEvent(completedEvent);
        }, 100);
    }
    async handleValidationCompleted(event) {
        const { requestId, approved, feedback } = event.payload;
        logger.info('Processing validation completion', {
            requestId,
            approved,
            feedback,
            correlationId: event.metadata?.correlationId,
        });
        const pending = this.pendingValidations.get(requestId);
        if (pending) {
            pending.resolve(approved);
            this.pendingValidations.delete(requestId);
        }
    }
    async handleGateOpened(event) {
        const { gateId, gateType, requiredApproval, context } = event.payload;
        logger.info('Processing gate opened', {
            gateId,
            gateType,
            requiredApproval,
            correlationId: event.metadata?.correlationId,
        });
    }
    async handleGateClosed(event) {
        const { gateId, approved, duration } = event.payload;
        logger.info('Processing gate closed', {
            gateId,
            approved,
            duration,
            correlationId: event.metadata?.correlationId,
        });
    }
}
export class CrossDomainWorkflowOrchestrator {
    eventBus;
    constructor(eventBus) {
        this.eventBus = eventBus;
    }
    async initializeOrchestrator() {
        this.eventBus.registerHandler('workflow.started', this.handleWorkflowStarted.bind(this));
        this.eventBus.registerHandler('workflow.completed', this.handleWorkflowCompleted.bind(this));
        this.eventBus.registerHandler('workflow.failed', this.handleWorkflowFailed.bind(this));
        this.eventBus.registerHandler('workflow.step.completed', this.handleWorkflowStepCompleted.bind(this));
        logger.info('Cross-domain workflow orchestrator initialized');
    }
    async executeComplexWorkflow(workflowId, definition, context) {
        const correlationId = createCorrelationId();
        logger.info('Starting complex workflow execution', {
            workflowId,
            correlationId,
        });
        try {
            const workflowStartedEvent = createEvent('workflow.started', Domain.WORKFLOWS, {
                payload: {
                    workflowId,
                    definition,
                    context,
                    startTime: new Date(),
                },
            }, { correlationId, source: 'workflow-orchestrator' });
            let result = await this.eventBus.emitEvent(workflowStartedEvent);
            if (!result.success) {
                throw new Error(`Failed to start workflow: ${result.error?.message}`);
            }
            const agentAllocationEvent = createEvent('agent.allocation.requested', Domain.COORDINATION, {
                payload: {
                    workflowId,
                    requiredCapabilities: ['workflow-execution'],
                    agentCount: 2,
                },
            }, { correlationId, causationId: workflowStartedEvent.id });
            result = await this.eventBus.routeCrossDomainEvent(agentAllocationEvent, Domain.WORKFLOWS, Domain.COORDINATION, 'agent_allocation');
            if (!result.success) {
                throw new Error(`Failed to allocate agents: ${result.error?.message}`);
            }
            const validationEvent = createEvent('human.validation.requested', Domain.INTERFACES, {
                payload: {
                    requestId: `workflow-${workflowId}-validation`,
                    validationType: 'approval',
                    context: { workflow: workflowId, step: 'execution-approval' },
                    priority: EventPriority.HIGH,
                    timeout: 30000,
                },
            }, { correlationId });
            result = await this.eventBus.routeCrossDomainEvent(validationEvent, Domain.WORKFLOWS, Domain.INTERFACES, 'human_validation');
            if (!result.success) {
                throw new Error(`Failed to request validation: ${result.error?.message}`);
            }
            const neuralOptimizationEvent = createEvent('optimization.requested', Domain.NEURAL, {
                payload: {
                    workflowId,
                    optimizationType: 'execution-path',
                    parameters: { accuracy: 0.95, speed: 'high' },
                },
            }, { correlationId });
            result = await this.eventBus.routeCrossDomainEvent(neuralOptimizationEvent, Domain.WORKFLOWS, Domain.NEURAL, 'neural_optimization');
            const dataStorageEvent = createEvent('data.storage.requested', Domain.DATABASE, {
                payload: {
                    workflowId,
                    data: { status: 'completed', timestamp: new Date() },
                    collection: 'workflow-results',
                },
            }, { correlationId });
            await this.eventBus.routeCrossDomainEvent(dataStorageEvent, Domain.WORKFLOWS, Domain.DATABASE, 'result_storage');
            logger.info('Complex workflow completed successfully', {
                workflowId,
                correlationId,
            });
            return { success: true, result: { workflowId, status: 'completed' } };
        }
        catch (error) {
            logger.error('Complex workflow execution failed', {
                workflowId,
                correlationId,
                error: error instanceof Error ? error.message : String(error),
            });
            const failureEvent = createEvent('workflow.failed', Domain.WORKFLOWS, {
                payload: {
                    workflowId,
                    error: error instanceof Error ? error : new Error(String(error)),
                    failedStep: 0,
                },
            }, { correlationId });
            await this.eventBus.emitEvent(failureEvent);
            return {
                success: false,
                error: error instanceof Error ? error : new Error(String(error)),
            };
        }
    }
    async handleWorkflowStarted(event) {
        const { workflowId, definition, startTime } = event.payload;
        logger.info('Processing workflow start', {
            workflowId,
            startTime,
            correlationId: event.metadata?.correlationId,
        });
    }
    async handleWorkflowCompleted(event) {
        const { workflowId, result, duration } = event.payload;
        logger.info('Processing workflow completion', {
            workflowId,
            duration,
            correlationId: event.metadata?.correlationId,
        });
    }
    async handleWorkflowFailed(event) {
        const { workflowId, error, failedStep } = event.payload;
        logger.error('Processing workflow failure', {
            workflowId,
            failedStep,
            error: error.message,
            correlationId: event.metadata?.correlationId,
        });
    }
    async handleWorkflowStepCompleted(event) {
        const { workflowId, stepIndex, stepResult } = event.payload;
        logger.debug('Processing workflow step completion', {
            workflowId,
            stepIndex,
            correlationId: event.metadata?.correlationId,
        });
    }
}
export class EventSystemAnalytics {
    eventBus;
    metricsCollectionInterval;
    constructor(eventBus) {
        this.eventBus = eventBus;
    }
    async startMonitoring(intervalMs = 10000) {
        logger.info('Starting event system analytics', { intervalMs });
        this.eventBus.registerWildcardHandler(this.collectEventAnalytics.bind(this), {
            priority: -1,
            trackMetrics: false,
        });
        this.metricsCollectionInterval = setInterval(() => {
            this.reportMetrics();
        }, intervalMs);
        logger.info('Event system analytics started');
    }
    async stopMonitoring() {
        if (this.metricsCollectionInterval) {
            clearInterval(this.metricsCollectionInterval);
        }
        logger.info('Event system analytics stopped');
    }
    async collectEventAnalytics(event) {
        logger.debug('Collecting event analytics', {
            eventType: event.type,
            domain: event.domain,
            timestamp: event.timestamp,
            correlationId: event.metadata?.correlationId,
        });
    }
    reportMetrics() {
        const metrics = this.eventBus.getMetrics();
        const performanceStats = this.eventBus.getPerformanceStats();
        logger.info('Event system metrics report', {
            totalEvents: metrics.totalEvents,
            eventsPerSecond: metrics.eventsPerSecond,
            averageProcessingTime: metrics.averageProcessingTime,
            failureRate: metrics.failureRate,
            handlerCount: metrics.handlerCount,
            memoryUsage: metrics.memoryUsage,
            cacheHitRate: metrics.cacheHitRate,
            domainEventCounts: metrics.domainEventCounts,
            performanceStats: Object.keys(performanceStats).length,
        });
    }
    getAnalyticsReport() {
        const metrics = this.eventBus.getMetrics();
        const performanceStats = this.eventBus.getPerformanceStats();
        const eventHistory = this.eventBus.queryEvents({ limit: 100 });
        const recommendations = [];
        if (metrics.failureRate > 0.05) {
            recommendations.push('High failure rate detected. Consider reviewing error handling.');
        }
        if (metrics.averageProcessingTime > 1000) {
            recommendations.push('High average processing time. Consider optimizing handlers.');
        }
        if (metrics.memoryUsage > 50000000) {
            recommendations.push('High memory usage. Consider reducing event history size.');
        }
        return {
            metrics,
            performanceStats,
            eventHistory,
            recommendations,
        };
    }
}
export async function demonstrateCompleteIntegration() {
    logger.info('Starting complete event system integration demonstration');
    try {
        const eventBus = await createProductionEventBus();
        const coordinationSystem = new EventDrivenCoordinationSystem(eventBus);
        const aguiSystem = new AGUIValidationSystem(eventBus);
        const workflowOrchestrator = new CrossDomainWorkflowOrchestrator(eventBus);
        const analytics = new EventSystemAnalytics(eventBus);
        await coordinationSystem.initializeCoordination();
        await aguiSystem.initializeAGUI();
        await workflowOrchestrator.initializeOrchestrator();
        await analytics.startMonitoring(5000);
        logger.info('Demonstrating multi-agent coordination');
        const agent = await coordinationSystem.createAgent({
            id: 'demo-agent-1',
            capabilities: ['analysis', 'coordination'],
            type: 'analyst',
        });
        await coordinationSystem.assignTask('demo-task-1', agent.id);
        logger.info('Demonstrating AGUI human validation');
        const validationResult = await aguiSystem.requestHumanValidation('approval', { action: 'deploy', environment: 'demo' }, { priority: EventPriority.HIGH, timeout: 10000 });
        logger.info('Human validation result', { validationResult });
        const gateResult = await aguiSystem.openAGUIGate('deployment-gate', { target: 'demo-environment' }, true);
        logger.info('AGUI gate result', { gateResult });
        const workflowDefinition = {
            id: 'demo-workflow',
            name: 'Demo Workflow',
            version: '1.0.0',
        };
        const workflowContext = {
            workflowId: 'demo-workflow',
            variables: { demo: true },
        };
        const workflowResult = await workflowOrchestrator.executeComplexWorkflow('demo-workflow', workflowDefinition, workflowContext);
        logger.info('Workflow execution result', { workflowResult });
        const analyticsReport = analytics.getAnalyticsReport();
        logger.info('Analytics report generated', {
            totalEvents: analyticsReport.metrics.totalEvents,
            recommendations: analyticsReport.recommendations,
        });
        await analytics.stopMonitoring();
        await eventBus.shutdown();
        logger.info('Complete event system integration demonstration completed successfully');
    }
    catch (error) {
        logger.error('Integration demonstration failed', {
            error: error instanceof Error ? error.message : String(error),
        });
        throw error;
    }
}
export async function runExamples() {
    try {
        await demonstrateCompleteIntegration();
    }
    catch (error) {
        console.error('Examples failed:', error);
        process.exit(1);
    }
}
if (require.main === module) {
    runExamples();
}
//# sourceMappingURL=type-safe-event-integration.js.map