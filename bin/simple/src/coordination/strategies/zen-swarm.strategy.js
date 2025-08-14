import { getLogger } from '../../config/logging-config.ts';
import { ZenOrchestratorIntegration } from '../../zen-orchestrator-integration.js';
import { AgentLearningSystem } from '../intelligence/agent-learning-system.ts';
import { TaskPredictor } from '../intelligence/task-predictor.ts';
import { AgentHealthMonitor } from '../intelligence/agent-health-monitor.ts';
const logger = getLogger('coordination-strategies-zen-swarm-strategy');
export class ZenSwarmStrategy {
    orchestrator;
    agents = new Map();
    agentCounter = 0;
    isInitialized = false;
    learningSystem;
    taskPredictor;
    healthMonitor;
    constructor(config) {
        logger.info('🚀 Initializing Enhanced Zen Swarm Strategy', { config });
        this.orchestrator = new ZenOrchestratorIntegration({
            host: 'localhost',
            port: 4003,
            storage_path: '.zen/swarm-collective',
            enabled: true,
            a2a_server_port: 4005,
            heartbeat_timeout_sec: 300,
            message_timeout_ms: 30000,
            use_websocket_transport: config?.enableA2A !== false,
            websocket_port: 4006,
            enable_zen_neural: config?.enableNeural !== false,
            enable_zen_forecasting: true,
            enable_zen_compute: true,
            gpu_enabled: false,
            enable_quantum: false,
        });
        this.learningSystem = new AgentLearningSystem({
            baseLearningRate: 0.1,
            adaptationThreshold: 0.8,
            performanceWindowSize: 100,
            enableDynamicAdaptation: true,
            enableNeuralAnalysis: config?.enableNeural !== false,
        });
        this.taskPredictor = new TaskPredictor({
            historyWindowSize: 100,
            confidenceThreshold: 0.7,
            enableEnsemblePrediction: true,
            enableComplexityAnalysis: true,
            enableCapabilityMatching: true,
        }, this.learningSystem);
        this.healthMonitor = new AgentHealthMonitor({
            healthCheckInterval: 30000,
            alertThresholds: {
                cpu: 0.8,
                memory: 0.9,
                diskUsage: 0.85,
                networkLatency: 1000,
                taskFailureRate: 0.3,
                responseTime: 5000,
                errorRate: 0.2,
            },
        }, this.learningSystem);
        logger.info('🧠 Intelligence systems initialized', {
            learningSystem: true,
            taskPredictor: true,
            healthMonitor: true,
        });
    }
    async ensureInitialized() {
        if (this.isInitialized)
            return;
        try {
            await this.orchestrator.initialize();
            this.isInitialized = true;
            logger.info('✅ Zen Swarm Strategy initialized successfully');
        }
        catch (error) {
            logger.error('❌ Failed to initialize zen-swarm orchestrator', error);
            throw new Error(`Zen Swarm initialization failed: ${error}`);
        }
    }
    async createAgent(config) {
        await this.ensureInitialized();
        const agentId = `zen-agent-${++this.agentCounter}`;
        const agentType = config.type || 'researcher';
        const agentName = config.name || `${agentType}-${this.agentCounter}`;
        logger.info(`🤖 Creating enhanced agent: ${agentName}`, {
            id: agentId,
            type: agentType,
            neural: config.enableNeural,
            daa: config.enableDAA,
        });
        try {
            let neuralCapabilities = undefined;
            if (config.enableNeural !== false) {
                const neuralResult = await this.orchestrator.executeNeuralService('neural-agent-init', {
                    agentId,
                    agentType,
                    cognitivePattern: config.cognitivePattern || 'adaptive',
                });
                if (neuralResult.success) {
                    neuralCapabilities = neuralResult.data;
                    logger.info(`🧠 Neural capabilities initialized for ${agentName}`);
                }
            }
            let daaCapabilities = undefined;
            if (config.enableDAA !== false) {
                const daaResult = await this.orchestrator.sendA2AMessage('daa_agent_create', {
                    id: agentId,
                    capabilities: config.capabilities || [],
                    cognitivePattern: config.cognitivePattern || 'adaptive',
                    enableMemory: true,
                    learningRate: 0.1,
                });
                if (daaResult.success) {
                    daaCapabilities = daaResult.data;
                    logger.info(`🤖 DAA capabilities initialized for ${agentName}`);
                }
            }
            const agent = {
                id: agentId,
                name: agentName,
                type: agentType,
                capabilities: config.capabilities || [],
                status: 'initializing',
                metadata: {
                    ...config.metadata,
                    created: new Date().toISOString(),
                    neuralCapabilities,
                    daaCapabilities,
                    cognitivePattern: config.cognitivePattern || 'adaptive',
                    orchestratorIntegration: true,
                    intelligenceEnabled: true,
                },
            };
            this.agents.set(agentId, agent);
            this.learningSystem.initializeAgent(agentId, {
                initialLearningRate: 0.1,
                capabilities: config.capabilities || [],
                cognitivePattern: config.cognitivePattern || 'adaptive',
            });
            this.healthMonitor.updateAgentHealth(agentId, {
                status: 'initializing',
                cpuUsage: 0.1,
                memoryUsage: 0.1,
                taskSuccessRate: 0.5,
                averageResponseTime: 1000,
                errorRate: 0.0,
                uptime: 0,
            });
            setTimeout(async () => {
                agent.status = 'idle';
                this.agents.set(agentId, agent);
                this.healthMonitor.updateAgentHealth(agentId, {
                    status: 'idle',
                    cpuUsage: 0.05,
                    memoryUsage: 0.05,
                    taskSuccessRate: 1.0,
                    averageResponseTime: 500,
                    errorRate: 0.0,
                    uptime: 1000,
                });
                logger.info(`✅ Agent ${agentName} ready for tasks with intelligence systems`);
            }, 1000);
            return agent;
        }
        catch (error) {
            logger.error(`❌ Failed to create agent ${agentName}`, error);
            throw new Error(`Agent creation failed: ${error}`);
        }
    }
    async destroyAgent(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent) {
            logger.warn(`⚠️ Agent ${agentId} not found for destruction`);
            return;
        }
        logger.info(`🗑️ Destroying agent: ${agent.name}`);
        try {
            if (agent.metadata?.daaCapabilities) {
                await this.orchestrator.sendA2AMessage('daa_agent_destroy', {
                    agentId,
                });
            }
            if (agent.metadata?.neuralCapabilities) {
                await this.orchestrator.executeNeuralService('neural-agent-cleanup', {
                    agentId,
                });
            }
            this.agents.delete(agentId);
            logger.info(`✅ Agent ${agent.name} destroyed successfully`);
        }
        catch (error) {
            logger.error(`❌ Error destroying agent ${agentId}`, error);
            this.agents.delete(agentId);
        }
    }
    async sendMessage(agentId, message) {
        await this.ensureInitialized();
        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new Error(`Agent ${agentId} not found`);
        }
        logger.info(`📨 Sending A2A message from ${agent.name}`, {
            type: message.type,
            priority: message.priority || 'medium',
        });
        try {
            const result = await this.orchestrator.sendA2AMessage('agent_message', {
                from: agentId,
                to: message.to,
                messageType: message.type,
                content: message.content,
                priority: message.priority || 'medium',
                timestamp: Date.now(),
            });
            if (!result.success) {
                throw new Error(`A2A message failed: ${result.error}`);
            }
            logger.info(`✅ A2A message sent successfully in ${result.executionTimeMs}ms`);
        }
        catch (error) {
            logger.error(`❌ Failed to send A2A message`, error);
            throw error;
        }
    }
    async assignTaskToAgent(agentId, task) {
        await this.ensureInitialized();
        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new Error(`Agent ${agentId} not found`);
        }
        const agentHealth = this.healthMonitor.getAgentHealth(agentId);
        if (agentHealth &&
            (agentHealth.status === 'critical' || agentHealth.status === 'unhealthy')) {
            logger.warn(`⚠️ Agent ${agent.name} is ${agentHealth.status}, task assignment may fail`);
            const recoveryActions = this.healthMonitor.getRecoveryRecommendations(agentId);
            if (recoveryActions.length > 0) {
                logger.info(`💡 Recovery recommendations available for agent ${agent.name}:`, recoveryActions.map((a) => a.description));
            }
        }
        const taskId = task.id || `task-${Date.now()}`;
        const prediction = this.taskPredictor.predictTaskDuration(agentId, task.type, {
            complexity: task.complexity,
            linesOfCode: task.linesOfCode,
            dependencies: task.dependencies,
        });
        logger.info(`📋 Assigning task to ${agent.name}`, {
            taskId,
            type: task.type,
            priority: task.priority,
            predictedDuration: prediction.duration,
            confidence: prediction.confidence,
            agentHealth: agentHealth?.status,
        });
        const taskStartTime = Date.now();
        try {
            agent.status = 'busy';
            this.agents.set(agentId, agent);
            this.healthMonitor.updateAgentHealth(agentId, {
                status: 'busy',
                cpuUsage: Math.min(1.0, (agentHealth?.cpuUsage || 0.1) + 0.3),
                memoryUsage: Math.min(1.0, (agentHealth?.memoryUsage || 0.1) + 0.2),
            });
            if (task.requiresNeural && agent.metadata?.neuralCapabilities) {
                const neuralResult = await this.orchestrator.executeNeuralService('neural-task-coordinate', {
                    agentId,
                    taskId,
                    taskType: task.type,
                    input: task.input,
                });
                if (neuralResult.success) {
                    logger.info(`🧠 Neural coordination completed for task ${taskId}`);
                }
            }
            if (task.requiresDAA && agent.metadata?.daaCapabilities) {
                const daaResult = await this.orchestrator.sendA2AMessage('daa_task_assign', {
                    agentId,
                    taskId,
                    task: {
                        type: task.type,
                        description: task.description,
                        priority: task.priority || 0,
                        input: task.input,
                        metadata: task.metadata,
                    },
                });
                if (daaResult.success) {
                    logger.info(`🤖 DAA coordination completed for task ${taskId}`);
                }
            }
            const result = await this.orchestrator.executeService('task-execute', {
                agentId,
                taskId,
                task,
            });
            const taskEndTime = Date.now();
            const actualDuration = taskEndTime - taskStartTime;
            const taskSuccess = result.success;
            this.taskPredictor.recordTaskCompletion(agentId, task.type, actualDuration, taskSuccess, {
                complexity: task.complexity,
                quality: taskSuccess ? 0.9 : 0.3,
                resourceUsage: (agentHealth?.cpuUsage || 0.1) + (agentHealth?.memoryUsage || 0.1),
                linesOfCode: task.linesOfCode,
                dependencies: task.dependencies,
                taskId,
            });
            this.learningSystem.updateAgentPerformance(agentId, taskSuccess, {
                duration: actualDuration,
                quality: taskSuccess ? 0.9 : 0.3,
                resourceUsage: (agentHealth?.cpuUsage || 0.1) + (agentHealth?.memoryUsage || 0.1),
                taskType: task.type,
                predictedDuration: prediction.duration,
                actualDuration,
            });
            const successRate = taskSuccess ? 1.0 : 0.0;
            const responseTime = actualDuration;
            const errorRate = taskSuccess ? 0.0 : 1.0;
            this.healthMonitor.updateAgentHealth(agentId, {
                taskSuccessRate: successRate,
                averageResponseTime: responseTime,
                errorRate: errorRate,
                cpuUsage: Math.max(0.05, (agentHealth?.cpuUsage || 0.3) - 0.2),
                memoryUsage: Math.max(0.05, (agentHealth?.memoryUsage || 0.2) - 0.1),
            });
            if (taskSuccess) {
                logger.info(`✅ Task ${taskId} completed by ${agent.name}`, {
                    actualDuration,
                    predictedDuration: prediction.duration,
                    accuracy: Math.abs(actualDuration - prediction.duration) /
                        prediction.duration <
                        0.2
                        ? 'good'
                        : 'poor',
                    executionTimeMs: result.executionTimeMs,
                });
            }
            else {
                logger.error(`❌ Task ${taskId} failed: ${result.error}`);
                throw new Error(`Task execution failed: ${result.error}`);
            }
        }
        catch (error) {
            logger.error(`❌ Failed to assign task ${taskId} to ${agent.name}`, error);
            const taskEndTime = Date.now();
            const actualDuration = taskEndTime - taskStartTime;
            this.taskPredictor.recordTaskCompletion(agentId, task.type, actualDuration, false, {
                complexity: task.complexity,
                quality: 0.1,
                error: error.message,
            });
            this.learningSystem.updateAgentPerformance(agentId, false, {
                duration: actualDuration,
                quality: 0.1,
                resourceUsage: 0.8,
                taskType: task.type,
                error: error.message,
            });
            this.healthMonitor.updateAgentHealth(agentId, {
                taskSuccessRate: 0.0,
                errorRate: 1.0,
                averageResponseTime: actualDuration,
            });
            throw error;
        }
        finally {
            if (this.agents.has(agentId)) {
                agent.status = 'idle';
                this.agents.set(agentId, agent);
                this.healthMonitor.updateAgentHealth(agentId, {
                    status: 'idle',
                });
            }
        }
    }
    async getAgents() {
        const agents = Array.from(this.agents.values());
        for (const agent of agents) {
            try {
                const status = await this.orchestrator.getStatus();
                if (status.success && status.data) {
                    agent.metadata = {
                        ...agent.metadata,
                        orchestratorStatus: status.data,
                        lastStatusCheck: new Date().toISOString(),
                    };
                }
            }
            catch (error) {
                logger.warn(`⚠️ Failed to get enhanced status for agent ${agent.name}`, error);
            }
        }
        return agents;
    }
    async getMetrics() {
        const agents = Array.from(this.agents.values());
        const metrics = {
            totalAgents: agents.length,
            activeAgents: agents.filter((a) => a.status !== 'error').length,
            busyAgents: agents.filter((a) => a.status === 'busy').length,
            orchestratorMetrics: undefined,
            a2aStatus: undefined,
            healthSummary: undefined,
            predictionAccuracy: undefined,
            learningProgress: undefined,
            intelligenceMetrics: undefined,
        };
        try {
            const orchestratorResult = await this.orchestrator.getMetrics();
            if (orchestratorResult.success) {
                metrics.orchestratorMetrics = orchestratorResult.data;
            }
            const a2aResult = await this.orchestrator.getA2AServerStatus();
            if (a2aResult.success) {
                metrics.a2aStatus = a2aResult.data;
            }
            metrics.healthSummary = this.healthMonitor.getSystemHealthSummary();
            metrics.predictionAccuracy = this.taskPredictor.getPredictionAccuracy();
            const learningStates = agents.map((agent) => {
                const state = this.learningSystem.getAgentState(agent.id);
                return {
                    agentId: agent.id,
                    learningRate: state?.currentLearningRate || 0.1,
                    successRate: state?.currentSuccessRate || 0.5,
                    totalTasks: state?.totalTasks || 0,
                    trend: state?.learningTrend || 'stable',
                };
            });
            metrics.learningProgress = {
                totalAgents: learningStates.length,
                averageLearningRate: learningStates.reduce((sum, s) => sum + s.learningRate, 0) /
                    learningStates.length || 0,
                averageSuccessRate: learningStates.reduce((sum, s) => sum + s.successRate, 0) /
                    learningStates.length || 0,
                totalTasksCompleted: learningStates.reduce((sum, s) => sum + s.totalTasks, 0),
                trendSummary: {
                    improving: learningStates.filter((s) => s.trend === 'improving')
                        .length,
                    stable: learningStates.filter((s) => s.trend === 'stable').length,
                    declining: learningStates.filter((s) => s.trend === 'declining')
                        .length,
                },
            };
            metrics.intelligenceMetrics = {
                systemHealthScore: metrics.healthSummary.systemHealthScore,
                predictionConfidence: metrics.predictionAccuracy.overallAccuracy,
                learningEfficiency: metrics.learningProgress.averageSuccessRate,
                activeAlerts: metrics.healthSummary.activeAlerts,
                criticalAlerts: metrics.healthSummary.criticalAlerts,
                agentHealthDistribution: {
                    healthy: metrics.healthSummary.healthyAgents,
                    degraded: metrics.healthSummary.degradedAgents,
                    unhealthy: metrics.healthSummary.unhealthyAgents,
                    critical: metrics.healthSummary.criticalAgents,
                },
            };
        }
        catch (error) {
            logger.warn('⚠️ Failed to get enhanced metrics', error);
        }
        return metrics;
    }
    getAgentHealth(agentId) {
        return this.healthMonitor.getAgentHealth(agentId);
    }
    predictTaskDuration(agentId, taskType, contextFactors) {
        return this.taskPredictor.predictTaskDuration(agentId, taskType, contextFactors);
    }
    getAgentLearningState(agentId) {
        return this.learningSystem.getAgentState(agentId);
    }
    getActiveHealthAlerts(agentId) {
        return this.healthMonitor.getActiveAlerts(agentId);
    }
    getRecoveryRecommendations(agentId) {
        return this.healthMonitor.getRecoveryRecommendations(agentId);
    }
    async executeRecoveryAction(agentId, actionId) {
        logger.info(`🔧 Executing recovery action ${actionId} for agent ${agentId}`);
        try {
            const result = await this.healthMonitor.executeRecoveryAction(agentId, actionId);
            if (result) {
                this.learningSystem.updateAgentPerformance(agentId, true, {
                    taskType: 'recovery_action',
                    quality: 0.8,
                    duration: 30000,
                });
            }
            return result;
        }
        catch (error) {
            logger.error(`❌ Recovery action failed for agent ${agentId}`, error);
            return false;
        }
    }
    getIntelligenceSummary() {
        return {
            healthSummary: this.healthMonitor.getSystemHealthSummary(),
            predictionAccuracy: this.taskPredictor.getPredictionAccuracy(),
            learningSystemActive: true,
            timestamp: Date.now(),
        };
    }
    analyzeTaskComplexity(taskType, contextFactors) {
        return this.taskPredictor.analyzeTaskComplexity(taskType, contextFactors);
    }
    async shutdown() {
        logger.info('🛑 Shutting down Zen Swarm Strategy with Intelligence Systems');
        try {
            const agentIds = Array.from(this.agents.keys());
            await Promise.all(agentIds.map((id) => this.destroyAgent(id)));
            logger.info('🧠 Shutting down intelligence systems...');
            this.healthMonitor.shutdown();
            this.taskPredictor.shutdown();
            this.learningSystem.shutdown();
            logger.info('✅ Intelligence systems shutdown complete');
            if (this.isInitialized) {
                await this.orchestrator.shutdown();
            }
            this.isInitialized = false;
            logger.info('✅ Zen Swarm Strategy shutdown complete');
        }
        catch (error) {
            logger.error('❌ Error during shutdown', error);
            throw error;
        }
    }
}
//# sourceMappingURL=zen-swarm.strategy.js.map