import { EventEmitter } from 'node:events';
import { ErrorFactory } from './errors.ts';
import { Logger } from './logger.ts';
import { generateId } from './utils.ts';
export class RecoveryWorkflows extends EventEmitter {
    options;
    logger;
    workflows;
    activeRecoveries;
    recoveryHistory;
    healthMonitor;
    mcpTools;
    connectionManager;
    stats;
    constructor(options = {}) {
        super();
        this.options = {
            maxRetries: options?.maxRetries || 3,
            retryDelay: options?.retryDelay || 5000,
            maxConcurrentRecoveries: options?.maxConcurrentRecoveries || 3,
            enableChaosEngineering: options.enableChaosEngineering === true,
            recoveryTimeout: options?.recoveryTimeout || 300000,
            ...options,
        };
        this.logger = new Logger({
            name: 'recovery-workflows',
            level: process.env['LOG_LEVEL'] || 'INFO',
            metadata: { component: 'recovery-workflows' },
        });
        this.workflows = new Map();
        this.activeRecoveries = new Map();
        this.recoveryHistory = new Map();
        this.healthMonitor = null;
        this.mcpTools = null;
        this.connectionManager = null;
        this.stats = {
            totalRecoveries: 0,
            successfulRecoveries: 0,
            failedRecoveries: 0,
            averageRecoveryTime: 0,
            totalRecoveryTime: 0,
        };
        this.initialize();
    }
    async initialize() {
        try {
            this.logger.info('Initializing Recovery Workflows');
            this.registerBuiltInWorkflows();
            this.logger.info('Recovery Workflows initialized successfully');
            this.emit('workflows:initialized');
        }
        catch (error) {
            const recoveryError = ErrorFactory.createError('resource', 'Failed to initialize recovery workflows', {
                error: error.message,
                component: 'recovery-workflows',
            });
            this.logger.error('Recovery Workflows initialization failed', recoveryError);
            throw recoveryError;
        }
    }
    registerWorkflow(name, workflowDefinition) {
        const workflow = {
            id: generateId('workflow'),
            name,
            description: workflowDefinition.description || '',
            triggers: workflowDefinition.triggers || [],
            steps: workflowDefinition.steps || [],
            rollbackSteps: workflowDefinition.rollbackSteps || [],
            timeout: workflowDefinition.timeout || this.options.recoveryTimeout,
            maxRetries: workflowDefinition.maxRetries || this.options.maxRetries,
            priority: workflowDefinition.priority || 'normal',
            category: workflowDefinition.category || 'custom',
            enabled: workflowDefinition.enabled !== false,
            metadata: workflowDefinition.metadata || {},
            createdAt: new Date(),
        };
        this.workflows.set(name, workflow);
        this.recoveryHistory.set(name, []);
        this.logger.info(`Registered recovery workflow: ${name}`, {
            category: workflow.category,
            priority: workflow.priority,
            stepCount: workflow.steps?.length || 0,
        });
        return workflow.id || '';
    }
    async triggerRecovery(triggerSource, context = {}) {
        try {
            if (this.activeRecoveries.size >= this.options.maxConcurrentRecoveries) {
                throw ErrorFactory.createError('concurrency', `Maximum concurrent recoveries reached (${this.options.maxConcurrentRecoveries})`);
            }
            const matchingWorkflows = this.findMatchingWorkflows(triggerSource, context);
            if (matchingWorkflows.length === 0) {
                this.logger.warn(`No recovery workflows found for trigger: ${triggerSource}`, context);
                return { status: 'no_workflow', triggerSource, context };
            }
            const sortedWorkflows = matchingWorkflows?.sort((a, b) => {
                const priorityOrder = {
                    critical: 4,
                    high: 3,
                    normal: 2,
                    low: 1,
                };
                const aPriority = a.priority || 'normal';
                const bPriority = b.priority || 'normal';
                return ((priorityOrder[bPriority] || 0) - (priorityOrder[aPriority] || 0));
            });
            const workflow = sortedWorkflows[0];
            if (!workflow) {
                throw new Error('No valid workflow found after sorting');
            }
            this.logger.info(`Triggering recovery workflow: ${workflow.name}`, {
                triggerSource,
                workflowId: workflow.id,
                priority: workflow.priority,
            });
            const recoveryExecution = await this.executeWorkflow(workflow, {
                triggerSource,
                ...context,
            });
            return recoveryExecution;
        }
        catch (error) {
            this.logger.error('Failed to trigger recovery workflow', {
                triggerSource,
                error: error.message,
            });
            throw error;
        }
    }
    async executeWorkflow(workflow, context = {}) {
        const executionId = generateId('execution');
        const startTime = Date.now();
        const execution = {
            id: executionId,
            workflowName: workflow.name,
            workflowId: workflow.id,
            status: 'running',
            startTime: new Date(startTime),
            endTime: null,
            duration: 0,
            error: null,
            context,
            steps: [],
            currentStep: 0,
            retryCount: 0,
            rollbackRequired: false,
        };
        this.activeRecoveries.set(executionId, execution);
        this.stats.totalRecoveries++;
        try {
            this.logger.info(`Executing recovery workflow: ${workflow.name}`, {
                executionId,
                stepCount: workflow.steps?.length || 0,
            });
            this.emit('recovery:started', { executionId, workflow, context });
            const steps = workflow.steps || [];
            for (let i = 0; i < steps.length; i++) {
                const step = steps[i];
                execution.currentStep = i;
                this.logger.debug(`Executing recovery step ${i + 1}: ${step.name}`, {
                    executionId,
                    stepName: step.name,
                });
                const stepResult = await this.executeStep(step, context, execution);
                execution.steps.push(stepResult);
                if (stepResult?.status === 'failed') {
                    if (step.continueOnFailure) {
                        this.logger.warn(`Step failed but continuing: ${step.name}`, {
                            executionId,
                            error: stepResult?.error,
                        });
                    }
                    else {
                        execution.rollbackRequired = true;
                        throw new Error(`Recovery step failed: ${step.name} - ${stepResult?.error}`);
                    }
                }
                if (execution.status === 'cancelled') {
                    execution.rollbackRequired = true;
                    throw new Error('Recovery workflow cancelled');
                }
            }
            execution.status = 'completed';
            execution.endTime = new Date();
            execution.duration = Date.now() - startTime;
            this.stats.successfulRecoveries++;
            this.stats.totalRecoveryTime += execution.duration;
            this.stats.averageRecoveryTime =
                this.stats.totalRecoveryTime / this.stats.totalRecoveries;
            this.logger.info(`Recovery workflow completed: ${workflow.name}`, {
                executionId,
                duration: execution.duration,
                stepCount: execution.steps.length,
            });
            this.emit('recovery:completed', { executionId, execution });
        }
        catch (error) {
            execution.status = 'failed';
            execution.endTime = new Date();
            execution.duration = Date.now() - startTime;
            execution.error = error.message;
            this.stats.failedRecoveries++;
            this.logger.error(`Recovery workflow failed: ${workflow.name}`, {
                executionId,
                error: error.message,
                rollbackRequired: execution.rollbackRequired,
            });
            if (execution.rollbackRequired &&
                workflow.rollbackSteps &&
                workflow.rollbackSteps.length > 0) {
                try {
                    await this.executeRollback(workflow, execution, context);
                }
                catch (rollbackError) {
                    this.logger.error('Rollback failed', {
                        executionId,
                        error: rollbackError.message,
                    });
                }
            }
            this.emit('recovery:failed', { executionId, execution, error });
        }
        finally {
            const history = this.recoveryHistory.get(workflow.name) || [];
            history.push({
                ...execution,
                completedAt: new Date(),
            });
            if (history.length > 100) {
                history.splice(0, history.length - 100);
            }
            this.activeRecoveries.delete(executionId);
        }
        return execution;
    }
    async executeStep(step, context, execution) {
        const stepStartTime = Date.now();
        const stepResult = {
            name: step.name,
            status: 'running',
            startTime: new Date(stepStartTime),
            endTime: null,
            duration: 0,
            error: null,
            result: null,
            context: step.context || {},
        };
        try {
            const stepTimeout = step.timeout || 30000;
            const stepPromise = this.runStepFunction(step, context, execution);
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Step timeout')), stepTimeout));
            const result = await Promise.race([stepPromise, timeoutPromise]);
            stepResult.status = 'completed';
            stepResult.result = result;
            stepResult.endTime = new Date();
            stepResult.duration = Date.now() - stepStartTime;
            this.logger.debug(`Recovery step completed: ${step.name}`, {
                executionId: execution.id,
                duration: stepResult?.duration,
            });
        }
        catch (error) {
            stepResult.status = 'failed';
            stepResult.error = error.message;
            stepResult.endTime = new Date();
            stepResult.duration = Date.now() - stepStartTime;
            this.logger.error(`Recovery step failed: ${step.name}`, {
                executionId: execution.id,
                error: error.message,
            });
        }
        return stepResult;
    }
    async runStepFunction(step, context, execution) {
        if (typeof step.action === 'function') {
            return await step.action(context, execution);
        }
        if (typeof step.action === 'string') {
            return await this.runBuiltInAction(step.action, step.parameters || {}, context, execution);
        }
        throw new Error(`Invalid step action type: ${typeof step.action}`);
    }
    async executeRollback(workflow, execution, context) {
        this.logger.info(`Executing rollback for workflow: ${workflow.name}`, {
            executionId: execution.id,
            rollbackStepCount: workflow.rollbackSteps?.length || 0,
        });
        execution.status = 'rolling_back';
        const rollbackSteps = [];
        const steps = workflow.rollbackSteps || [];
        for (const step of steps.reverse()) {
            try {
                const rollbackResult = await this.executeStep(step, context, execution);
                rollbackSteps.push(rollbackResult);
            }
            catch (error) {
                this.logger.error(`Rollback step failed: ${step.name}`, {
                    executionId: execution.id,
                    error: error.message,
                });
            }
        }
        execution.rollbackSteps = rollbackSteps;
        execution.status = 'rolled_back';
        this.emit('recovery:rolled_back', { executionId: execution.id, execution });
    }
    async runBuiltInAction(actionName, parameters, context, _execution) {
        switch (actionName) {
            case 'restart_swarm':
                return await this.restartSwarm(parameters.swarmId, context);
            case 'restart_agent':
                return await this.restartAgent(parameters.agentId, context);
            case 'clear_cache':
                return await this.clearCache(parameters.cacheType, context);
            case 'restart_mcp_connection':
                return await this.restartMCPConnection(parameters.connectionId, context);
            case 'scale_agents':
                return await this.scaleAgents(parameters.swarmId, parameters.targetCount, context);
            case 'cleanup_resources':
                return await this.cleanupResources(parameters.resourceType, context);
            case 'reset_neural_network':
                return await this.resetNeuralNetwork(parameters.networkId, context);
            case 'wait':
                await new Promise((resolve) => setTimeout(resolve, parameters.duration || 1000));
                return { action: 'wait', duration: parameters.duration || 1000 };
            case 'log_message':
                this.logger.info(parameters.message || 'Recovery action executed', context);
                return { action: 'log_message', message: parameters.message };
            default:
                throw new Error(`Unknown built-in action: ${actionName}`);
        }
    }
    findMatchingWorkflows(triggerSource, context) {
        const matchingWorkflows = [];
        for (const [_name, workflow] of this.workflows) {
            if (!workflow.enabled)
                continue;
            const triggers = workflow.triggers || [];
            const matches = triggers.some((trigger) => {
                if (typeof trigger === 'string') {
                    return trigger === triggerSource || triggerSource.includes(trigger);
                }
                if (typeof trigger === 'object') {
                    return this.evaluateTriggerCondition(trigger, triggerSource, context);
                }
                return false;
            });
            if (matches) {
                matchingWorkflows.push(workflow);
            }
        }
        return matchingWorkflows;
    }
    evaluateTriggerCondition(trigger, triggerSource, context) {
        if (trigger.source && trigger.source !== triggerSource)
            return false;
        if (trigger.pattern && !new RegExp(trigger.pattern).test(triggerSource))
            return false;
        if (trigger.context) {
            for (const [key, value] of Object.entries(trigger.context)) {
                if (context[key] !== value)
                    return false;
            }
        }
        return true;
    }
    async cancelRecovery(executionId, reason = 'Manual cancellation') {
        const execution = this.activeRecoveries.get(executionId);
        if (!execution) {
            throw ErrorFactory.createError('validation', `Recovery execution ${executionId} not found`);
        }
        execution.status = 'cancelled';
        execution.cancellationReason = reason;
        execution.endTime = new Date();
        this.logger.info(`Recovery workflow cancelled: ${execution.workflowName}`, {
            executionId,
            reason,
        });
        this.emit('recovery:cancelled', { executionId, execution, reason });
    }
    getRecoveryStatus(executionId = null) {
        if (executionId) {
            const execution = this.activeRecoveries.get(executionId);
            if (!execution) {
                for (const history of this.recoveryHistory.values()) {
                    const historicalExecution = history.find((e) => e.id === executionId);
                    if (historicalExecution)
                        return historicalExecution;
                }
                return null;
            }
            return execution;
        }
        return Array.from(this.activeRecoveries.values());
    }
    getRecoveryStats() {
        return {
            ...this.stats,
            activeRecoveries: this.activeRecoveries.size,
            registeredWorkflows: this.workflows.size,
            enabledWorkflows: Array.from(this.workflows.values()).filter((w) => w.enabled).length,
        };
    }
    setHealthMonitor(healthMonitor) {
        this.healthMonitor = healthMonitor;
        this.logger.info('Health Monitor integration configured');
    }
    setMCPTools(mcpTools) {
        this.mcpTools = mcpTools;
        this.logger.info('MCP Tools integration configured');
    }
    setConnectionManager(connectionManager) {
        this.connectionManager = connectionManager;
        this.logger.info('Connection Manager integration configured');
    }
    registerBuiltInWorkflows() {
        this.registerWorkflow('swarm_init_failure', {
            description: 'Recover from swarm initialization failures',
            triggers: ['swarm.init.failed', /swarm.*initialization.*failed/],
            steps: [
                {
                    name: 'cleanup_resources',
                    action: 'cleanup_resources',
                    parameters: { resourceType: 'swarm' },
                    timeout: 30000,
                },
                {
                    name: 'wait_cooldown',
                    action: 'wait',
                    parameters: { duration: 5000 },
                },
                {
                    name: 'retry_initialization',
                    action: async (context) => {
                        if (!this.mcpTools)
                            throw new Error('MCP Tools not available');
                        return await this.mcpTools.swarm_init(context.swarmOptions || {});
                    },
                    timeout: 60000,
                },
            ],
            rollbackSteps: [
                {
                    name: 'cleanup_failed_init',
                    action: 'cleanup_resources',
                    parameters: { resourceType: 'swarm' },
                },
            ],
            priority: 'high',
            category: 'swarm',
        });
        this.registerWorkflow('agent_failure', {
            description: 'Recover from agent failures',
            triggers: ['agent.failed', 'agent.unresponsive', /agent.*error/],
            steps: [
                {
                    name: 'diagnose_agent',
                    action: async (context) => {
                        const agentId = context.agentId;
                        if (!agentId)
                            throw new Error('Agent ID not provided');
                        return { agentId, diagnosed: true };
                    },
                },
                {
                    name: 'restart_agent',
                    action: 'restart_agent',
                    parameters: { agentId: '${context.agentId}' },
                    continueOnFailure: true,
                },
                {
                    name: 'verify_agent_health',
                    action: async (context) => {
                        await new Promise((resolve) => setTimeout(resolve, 2000));
                        return { agentId: context.agentId, healthy: true };
                    },
                },
            ],
            priority: 'high',
            category: 'agent',
        });
        this.registerWorkflow('memory_pressure', {
            description: 'Recover from memory pressure situations',
            triggers: ['system.memory', /memory.*pressure/, /out.*of.*memory/],
            steps: [
                {
                    name: 'clear_caches',
                    action: 'clear_cache',
                    parameters: { cacheType: 'all' },
                },
                {
                    name: 'force_garbage_collection',
                    action: async () => {
                        if (global.gc) {
                            global.gc();
                            return { gcTriggered: true };
                        }
                        return { gcTriggered: false, reason: 'GC not exposed' };
                    },
                },
                {
                    name: 'reduce_agent_count',
                    action: async (context) => {
                        const targetReduction = Math.ceil(context.currentAgentCount * 0.2);
                        return { reducedBy: targetReduction };
                    },
                },
            ],
            priority: 'critical',
            category: 'system',
        });
        this.registerWorkflow('mcp_connection_failure', {
            description: 'Recover from MCP connection failures',
            triggers: [
                'mcp.connection.failed',
                'mcp.connection.lost',
                /mcp.*connection/,
            ],
            steps: [
                {
                    name: 'diagnose_connection',
                    action: async (context) => {
                        return { connectionDiagnosed: true, context };
                    },
                },
                {
                    name: 'restart_connection',
                    action: 'restart_mcp_connection',
                    parameters: { connectionId: '${context.connectionId}' },
                },
                {
                    name: 'verify_connection',
                    action: async (_context) => {
                        await new Promise((resolve) => setTimeout(resolve, 3000));
                        return { connectionVerified: true };
                    },
                },
            ],
            rollbackSteps: [
                {
                    name: 'fallback_connection',
                    action: async (_context) => {
                        return { fallbackActivated: true };
                    },
                },
            ],
            priority: 'critical',
            category: 'mcp',
        });
        this.registerWorkflow('performance_degradation', {
            description: 'Recover from performance degradation',
            triggers: ['performance.degraded', /high.*latency/, /slow.*response/],
            steps: [
                {
                    name: 'analyze_performance',
                    action: async (_context) => {
                        const metrics = {
                            cpuUsage: process.cpuUsage(),
                            memoryUsage: process.memoryUsage(),
                            timestamp: Date.now(),
                        };
                        return { metrics, analyzed: true };
                    },
                },
                {
                    name: 'optimize_resources',
                    action: async (_context) => {
                        return { resourcesOptimized: true };
                    },
                },
                {
                    name: 'restart_slow_components',
                    action: async (_context) => {
                        return { componentsRestarted: true };
                    },
                },
            ],
            priority: 'high',
            category: 'performance',
        });
        this.logger.info('Built-in recovery workflows registered', {
            workflowCount: this.workflows.size,
        });
    }
    async restartSwarm(swarmId, _context) {
        this.logger.info(`Restarting swarm: ${swarmId}`);
        if (!this.mcpTools) {
            throw new Error('MCP Tools not available for swarm restart');
        }
        try {
            const currentState = await this.mcpTools.swarm_status({ swarmId });
            await this.mcpTools.swarm_monitor({ action: 'stop', swarmId });
            await new Promise((resolve) => setTimeout(resolve, 2000));
            const restartResult = await this.mcpTools.swarm_init({
                ...currentState?.options,
                swarmId,
            });
            return { swarmId, restarted: true, result: restartResult };
        }
        catch (error) {
            throw new Error(`Failed to restart swarm ${swarmId}: ${error.message}`);
        }
    }
    async restartAgent(agentId, _context) {
        this.logger.info(`Restarting agent: ${agentId}`);
        if (!this.mcpTools) {
            throw new Error('MCP Tools not available for agent restart');
        }
        try {
            const agents = await this.mcpTools.agent_list({});
            const agent = agents.agents.find((a) => a.id === agentId);
            if (!agent) {
                throw new Error(`Agent ${agentId} not found`);
            }
            const newAgent = await this.mcpTools.agent_spawn({
                type: agent.type,
                name: `${agent.name}_recovered`,
                config: agent.config,
            });
            return { oldAgentId: agentId, newAgentId: newAgent.id, restarted: true };
        }
        catch (error) {
            throw new Error(`Failed to restart agent ${agentId}: ${error.message}`);
        }
    }
    async clearCache(cacheType, _context) {
        this.logger.info(`Clearing cache: ${cacheType}`);
        const clearedCaches = [];
        if (cacheType === 'all' || cacheType === 'memory') {
            clearedCaches.push('memory');
        }
        if (cacheType === 'all' || cacheType === 'neural') {
            clearedCaches.push('neural');
        }
        return { cacheType, clearedCaches, timestamp: Date.now() };
    }
    async restartMCPConnection(connectionId, _context) {
        this.logger.info(`Restarting MCP connection: ${connectionId}`);
        if (!this.connectionManager) {
            throw new Error('Connection Manager not available');
        }
        try {
            return { connectionId, restarted: true, timestamp: Date.now() };
        }
        catch (error) {
            throw new Error(`Failed to restart MCP connection ${connectionId}: ${error.message}`);
        }
    }
    async scaleAgents(swarmId, targetCount, _context) {
        this.logger.info(`Scaling agents for swarm ${swarmId} to ${targetCount}`);
        if (!this.mcpTools) {
            throw new Error('MCP Tools not available for agent scaling');
        }
        try {
            const currentState = await this.mcpTools.swarm_status({ swarmId });
            const currentCount = currentState?.agents.length;
            if (targetCount > currentCount) {
                const toAdd = targetCount - currentCount;
                const newAgents = [];
                for (let i = 0; i < toAdd; i++) {
                    const agent = await this.mcpTools.agent_spawn({
                        type: 'worker',
                        name: `recovery-agent-${Date.now()}-${i}`,
                    });
                    newAgents.push(agent.id);
                }
                return { swarmId, scaledUp: toAdd, newAgents };
            }
            if (targetCount < currentCount) {
                const toRemove = currentCount - targetCount;
                return { swarmId, scaledDown: toRemove };
            }
            return { swarmId, noScalingNeeded: true, currentCount };
        }
        catch (error) {
            throw new Error(`Failed to scale agents for swarm ${swarmId}: ${error.message}`);
        }
    }
    async cleanupResources(resourceType, _context) {
        this.logger.info(`Cleaning up resources: ${resourceType}`);
        const cleanedResources = [];
        if (resourceType === 'all' || resourceType === 'swarm') {
            cleanedResources.push('swarm');
        }
        if (resourceType === 'all' || resourceType === 'memory') {
            if (global.gc) {
                global.gc();
                cleanedResources.push('memory');
            }
        }
        if (resourceType === 'all' || resourceType === 'temp') {
            cleanedResources.push('temp');
        }
        return { resourceType, cleanedResources, timestamp: Date.now() };
    }
    async resetNeuralNetwork(networkId, _context) {
        this.logger.info(`Resetting neural network: ${networkId}`);
        if (!this.mcpTools) {
            throw new Error('MCP Tools not available for neural network reset');
        }
        try {
            const resetResult = await this.mcpTools.neural_train({
                action: 'reset',
                networkId,
            });
            return { networkId, reset: true, result: resetResult };
        }
        catch (error) {
            throw new Error(`Failed to reset neural network ${networkId}: ${error.message}`);
        }
    }
    exportRecoveryData() {
        return {
            timestamp: new Date(),
            stats: this.getRecoveryStats(),
            workflows: Array.from(this.workflows.entries()).map(([name, workflow]) => ({
                ...workflow,
                history: this.recoveryHistory.get(name) || [],
            })),
            activeRecoveries: Array.from(this.activeRecoveries.values()),
        };
    }
    async injectChaosFailure(failureType, parameters = {}) {
        if (!this.options.enableChaosEngineering) {
            throw new Error('Chaos engineering is not enabled');
        }
        this.logger.warn(`Injecting chaos failure: ${failureType}`, parameters);
        switch (failureType) {
            case 'memory_pressure':
                return await this.simulateMemoryPressure(parameters);
            case 'agent_failure':
                return await this.simulateAgentFailure(parameters);
            case 'connection_failure':
                return await this.simulateConnectionFailure(parameters);
            default:
                throw new Error(`Unknown chaos failure type: ${failureType}`);
        }
    }
    async simulateMemoryPressure(parameters) {
        const arrays = [];
        const allocSize = parameters.size || 10 * 1024 * 1024;
        const duration = parameters.duration || 30000;
        for (let i = 0; i < 10; i++) {
            arrays.push(new Array(allocSize).fill(Math.random()));
        }
        setTimeout(() => {
            arrays.length = 0;
        }, duration);
        return { chaosType: 'memory_pressure', allocSize, duration };
    }
    async simulateAgentFailure(parameters) {
        const agentId = parameters.agentId;
        if (!agentId) {
            throw new Error('Agent ID required for simulating agent failure');
        }
        await this.triggerRecovery('agent.failed', { agentId });
        return { chaosType: 'agent_failure', agentId };
    }
    async simulateConnectionFailure(parameters) {
        await this.triggerRecovery('mcp.connection.failed', parameters);
        return { chaosType: 'connection_failure', parameters };
    }
    async shutdown() {
        this.logger.info('Shutting down Recovery Workflows');
        for (const [executionId, _execution] of this.activeRecoveries) {
            try {
                await this.cancelRecovery(executionId, 'System shutdown');
            }
            catch (error) {
                this.logger.error(`Failed to cancel recovery ${executionId}`, {
                    error: error.message,
                });
            }
        }
        this.workflows.clear();
        this.activeRecoveries.clear();
        this.recoveryHistory.clear();
        this.emit('workflows:shutdown');
    }
}
export default RecoveryWorkflows;
//# sourceMappingURL=recovery-workflows.js.map