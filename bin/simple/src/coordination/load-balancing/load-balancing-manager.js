import { EventEmitter } from 'node:events';
import { AdaptiveLearningAlgorithm } from './algorithms/adaptive-learning.ts';
import { LeastConnectionsAlgorithm } from './algorithms/least-connections.ts';
import { MLPredictiveAlgorithm } from './algorithms/ml-predictive.ts';
import { ResourceAwareAlgorithm } from './algorithms/resource-aware.ts';
import { WeightedRoundRobinAlgorithm } from './algorithms/weighted-round-robin.ts';
import { AgentCapacityManager } from './capacity/agent-capacity-manager.ts';
import { EmergencyProtocolHandler } from './optimization/emergency-protocol-handler.ts';
import { HealthChecker } from './routing/health-checker.ts';
import { IntelligentRoutingEngine } from './routing/intelligent-routing-engine.ts';
import { AutoScalingStrategy } from './strategies/auto-scaling-strategy.ts';
import { AgentStatus, LoadBalancingAlgorithm, } from './types.ts';
export class LoadBalancingManager extends EventEmitter {
    agents = new Map();
    algorithms = new Map();
    currentAlgorithm;
    capacityManager;
    routingEngine;
    healthChecker;
    autoScaler;
    emergencyHandler;
    observers = [];
    config;
    metricsHistory = new Map();
    isRunning = false;
    monitoringInterval = null;
    constructor(config = {}) {
        super();
        this.config = this.mergeConfig(config);
        this.initializeComponents();
    }
    initializeComponents() {
        this.algorithms.set(LoadBalancingAlgorithm.WEIGHTED_ROUND_ROBIN, new WeightedRoundRobinAlgorithm());
        this.algorithms.set(LoadBalancingAlgorithm.LEAST_CONNECTIONS, new LeastConnectionsAlgorithm());
        this.algorithms.set(LoadBalancingAlgorithm.RESOURCE_AWARE, new ResourceAwareAlgorithm());
        this.algorithms.set(LoadBalancingAlgorithm.ML_PREDICTIVE, new MLPredictiveAlgorithm());
        this.algorithms.set(LoadBalancingAlgorithm.ADAPTIVE_LEARNING, new AdaptiveLearningAlgorithm());
        this.currentAlgorithm = this.algorithms.get(this.config.algorithm);
        this.capacityManager = new AgentCapacityManager();
        this.routingEngine = new IntelligentRoutingEngine(this.capacityManager);
        this.healthChecker = new HealthChecker(this.config.healthCheckInterval);
        this.autoScaler = new AutoScalingStrategy(this.config.autoScalingConfig);
        this.emergencyHandler = new EmergencyProtocolHandler();
        this.setupEventHandlers();
    }
    setupEventHandlers() {
        this.healthChecker.on('agent:unhealthy', (agentId) => {
            this.handleAgentFailure(agentId, new Error('Health check failed'));
        });
        this.healthChecker.on('agent:recovered', (agentId) => {
            this.handleAgentRecovery(agentId);
        });
        this.autoScaler.on('scale:up', (count) => {
            this.handleScaleUp(count);
        });
        this.autoScaler.on('scale:down', (agentIds) => {
            this.handleScaleDown(agentIds);
        });
        this.emergencyHandler.on('emergency:activated', (type, severity) => {
            this.emit('emergency', { type, severity, timestamp: new Date() });
        });
    }
    async start() {
        if (this.isRunning)
            return;
        this.isRunning = true;
        await this.healthChecker.startHealthChecks(Array.from(this.agents.values()));
        this.startMonitoring();
        await this.routingEngine.updateRoutingTable(Array.from(this.agents.values()));
        this.emit('started');
    }
    async stop() {
        if (!this.isRunning)
            return;
        this.isRunning = false;
        await this.healthChecker.stopHealthChecks();
        this.stopMonitoring();
        this.emit('stopped');
    }
    async addAgent(agent) {
        this.agents.set(agent.id, agent);
        await this.capacityManager.updateCapacity(agent.id, this.createInitialMetrics());
        await this.routingEngine.updateRoutingTable(Array.from(this.agents.values()));
        if (this.isRunning) {
            await this.healthChecker.startHealthChecks([agent]);
        }
        for (const observer of this.observers) {
            await observer.onAgentAdded(agent);
        }
        this.emit('agent:added', agent);
    }
    async removeAgent(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent)
            return;
        this.agents.delete(agentId);
        await this.healthChecker.stopHealthChecks();
        if (this.isRunning && this.agents.size > 0) {
            await this.healthChecker.startHealthChecks(Array.from(this.agents.values()));
        }
        await this.routingEngine.updateRoutingTable(Array.from(this.agents.values()));
        this.metricsHistory.delete(agentId);
        for (const observer of this.observers) {
            await observer.onAgentRemoved(agentId);
        }
        this.emit('agent:removed', agentId);
    }
    async routeTask(task) {
        const availableAgents = Array.from(this.agents.values()).filter((agent) => agent.status === AgentStatus.HEALTHY);
        if (availableAgents.length === 0) {
            throw new Error('No healthy agents available');
        }
        const metricsMap = new Map();
        for (const agent of availableAgents) {
            const metrics = this.getLatestMetrics(agent.id);
            if (metrics) {
                metricsMap.set(agent.id, metrics);
            }
        }
        const result = await this.currentAlgorithm.selectAgent(task, availableAgents, metricsMap);
        await this.capacityManager.updateCapacity(result?.selectedAgent?.id, this.createTaskMetrics(task));
        for (const observer of this.observers) {
            await observer.onTaskRouted(task, result?.selectedAgent);
        }
        this.emit('task:routed', { task, agent: result?.selectedAgent, result });
        return result;
    }
    async handleTaskCompletion(taskId, agentId, duration, success) {
        const agent = this.agents.get(agentId);
        if (!agent)
            return;
        const metrics = this.createCompletionMetrics(duration, success);
        this.recordMetrics(agentId, metrics);
        await this.capacityManager.updateCapacity(agentId, metrics);
        if (this.currentAlgorithm.onTaskComplete) {
            const task = { id: taskId };
            await this.currentAlgorithm.onTaskComplete(agentId, task, duration, success);
        }
        for (const observer of this.observers) {
            const task = { id: taskId };
            await observer.onTaskCompleted(task, agent, duration, success);
        }
        this.emit('task:completed', { taskId, agentId, duration, success });
    }
    async switchAlgorithm(algorithm) {
        const newAlgorithm = this.algorithms.get(algorithm);
        if (!newAlgorithm) {
            throw new Error(`Algorithm ${algorithm} not available`);
        }
        this.currentAlgorithm = newAlgorithm;
        this.config.algorithm = algorithm;
        if (this.currentAlgorithm.updateWeights) {
            const metricsMap = new Map();
            for (const [agentId, metrics] of this.metricsHistory) {
                const latest = metrics[metrics.length - 1];
                if (latest) {
                    metricsMap.set(agentId, latest);
                }
            }
            await this.currentAlgorithm.updateWeights(Array.from(this.agents.values()), metricsMap);
        }
        this.emit('algorithm:changed', algorithm);
    }
    getStatistics() {
        const totalAgents = this.agents.size;
        const healthyAgents = Array.from(this.agents.values()).filter((agent) => agent.status === AgentStatus.HEALTHY).length;
        const avgLoad = this.calculateAverageLoad();
        const maxLoad = this.calculateMaxLoad();
        const minLoad = this.calculateMinLoad();
        return {
            totalAgents,
            healthyAgents,
            unhealthyAgents: totalAgents - healthyAgents,
            currentAlgorithm: this.config.algorithm,
            averageLoad: avgLoad,
            maxLoad,
            minLoad,
            loadVariance: this.calculateLoadVariance(),
            uptime: this.isRunning ? Date.now() - (this.startTime || Date.now()) : 0,
        };
    }
    async updateConfiguration(newConfig) {
        this.config = { ...this.config, ...newConfig };
        if (newConfig?.algorithm &&
            newConfig?.algorithm !== this.config.algorithm) {
            await this.switchAlgorithm(newConfig?.algorithm);
        }
        if (newConfig?.healthCheckInterval) {
        }
        this.emit('configuration:updated', this.config);
    }
    addObserver(observer) {
        this.observers.push(observer);
    }
    removeObserver(observer) {
        const index = this.observers.indexOf(observer);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }
    async handleAgentFailure(agentId, error) {
        const agent = this.agents.get(agentId);
        if (!agent)
            return;
        agent.status = AgentStatus.UNHEALTHY;
        await this.routingEngine.handleFailover(agentId);
        if (this.currentAlgorithm.onAgentFailure) {
            await this.currentAlgorithm.onAgentFailure(agentId, error);
        }
        for (const observer of this.observers) {
            await observer.onAgentFailure(agentId, error);
        }
        await this.checkEmergencyConditions();
        this.emit('agent:failed', { agentId, error });
    }
    async handleAgentRecovery(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent)
            return;
        agent.status = AgentStatus.HEALTHY;
        agent.lastHealthCheck = new Date();
        await this.routingEngine.updateRoutingTable(Array.from(this.agents.values()));
        this.emit('agent:recovered', agentId);
    }
    async handleScaleUp(count) {
        this.emit('scale:up:requested', count);
    }
    async handleScaleDown(agentIds) {
        for (const agentId of agentIds) {
            await this.removeAgent(agentId);
        }
        this.emit('scale:down:completed', agentIds);
    }
    startMonitoring() {
        this.monitoringInterval = setInterval(async () => {
            await this.performMonitoringCycle();
        }, this.config.healthCheckInterval);
    }
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
    }
    async performMonitoringCycle() {
        try {
            const metricsMap = new Map();
            for (const [agentId, metrics] of this.metricsHistory) {
                const latest = metrics[metrics.length - 1];
                if (latest) {
                    metricsMap.set(agentId, latest);
                }
            }
            if (await this.autoScaler.shouldScaleUp(metricsMap)) {
                const newAgents = await this.autoScaler.scaleUp(1);
                for (const agent of newAgents) {
                    await this.addAgent(agent);
                }
            }
            else if (await this.autoScaler.shouldScaleDown(metricsMap)) {
                const agentsToRemove = await this.autoScaler.scaleDown(1);
                for (const agentId of agentsToRemove) {
                    await this.removeAgent(agentId);
                }
            }
            if (this.currentAlgorithm.updateWeights) {
                await this.currentAlgorithm.updateWeights(Array.from(this.agents.values()), metricsMap);
            }
            await this.routingEngine.optimizeRoutes();
        }
        catch (error) {
            this.emit('monitoring:error', error);
        }
    }
    async checkEmergencyConditions() {
        const healthyAgents = Array.from(this.agents.values()).filter((agent) => agent.status === AgentStatus.HEALTHY).length;
        const totalAgents = this.agents.size;
        const healthyPercentage = totalAgents > 0 ? healthyAgents / totalAgents : 0;
        if (healthyPercentage < 0.3) {
            await this.emergencyHandler.handleEmergency('low_availability', 'critical');
        }
        else if (healthyPercentage < 0.5) {
            await this.emergencyHandler.handleEmergency('low_availability', 'high');
        }
    }
    mergeConfig(config) {
        return {
            algorithm: config?.algorithm || LoadBalancingAlgorithm.WEIGHTED_ROUND_ROBIN,
            healthCheckInterval: config?.healthCheckInterval || 5000,
            maxRetries: config?.maxRetries || 3,
            timeoutMs: config?.timeoutMs || 30000,
            circuitBreakerConfig: config?.circuitBreakerConfig || {
                failureThreshold: 5,
                recoveryTimeout: 60000,
                halfOpenMaxCalls: 3,
                monitoringPeriod: 10000,
            },
            stickySessionConfig: config?.stickySessionConfig || {
                enabled: false,
                sessionTimeout: 300000,
                affinityStrength: 0.8,
                fallbackStrategy: 'redistribute',
            },
            autoScalingConfig: config?.autoScalingConfig || {
                enabled: true,
                minAgents: 2,
                maxAgents: 20,
                scaleUpThreshold: 0.8,
                scaleDownThreshold: 0.3,
                cooldownPeriod: 300000,
            },
            optimizationConfig: config?.optimizationConfig || {
                connectionPooling: true,
                requestBatching: true,
                cacheAwareRouting: true,
                networkOptimization: true,
                bandwidthOptimization: true,
            },
        };
    }
    createInitialMetrics() {
        return {
            timestamp: new Date(),
            cpuUsage: 0,
            memoryUsage: 0,
            diskUsage: 0,
            networkUsage: 0,
            activeTasks: 0,
            queueLength: 0,
            responseTime: 0,
            errorRate: 0,
            throughput: 0,
        };
    }
    createTaskMetrics(task) {
        return {
            timestamp: new Date(),
            cpuUsage: 0.1,
            memoryUsage: 0.05,
            diskUsage: 0,
            networkUsage: 0.02,
            activeTasks: 1,
            queueLength: 0,
            responseTime: task.estimatedDuration,
            errorRate: 0,
            throughput: 1,
        };
    }
    createCompletionMetrics(duration, success) {
        return {
            timestamp: new Date(),
            cpuUsage: 0,
            memoryUsage: 0,
            diskUsage: 0,
            networkUsage: 0,
            activeTasks: -1,
            queueLength: 0,
            responseTime: duration,
            errorRate: success ? 0 : 1,
            throughput: success ? 1 : 0,
        };
    }
    recordMetrics(agentId, metrics) {
        if (!this.metricsHistory.has(agentId)) {
            this.metricsHistory.set(agentId, []);
        }
        const history = this.metricsHistory.get(agentId);
        history.push(metrics);
        if (history.length > 1000) {
            history.shift();
        }
    }
    getLatestMetrics(agentId) {
        const history = this.metricsHistory.get(agentId);
        return history && history.length > 0 ? history[history.length - 1] : null;
    }
    calculateAverageLoad() {
        const loads = [];
        for (const [agentId, _] of this.agents) {
            const metrics = this.getLatestMetrics(agentId);
            if (metrics) {
                loads.push(metrics.activeTasks);
            }
        }
        return loads.length > 0
            ? loads.reduce((a, b) => a + b, 0) / loads.length
            : 0;
    }
    calculateMaxLoad() {
        let maxLoad = 0;
        for (const [agentId, _] of this.agents) {
            const metrics = this.getLatestMetrics(agentId);
            if (metrics && metrics.activeTasks > maxLoad) {
                maxLoad = metrics.activeTasks;
            }
        }
        return maxLoad;
    }
    calculateMinLoad() {
        let minLoad = Number.POSITIVE_INFINITY;
        for (const [agentId, _] of this.agents) {
            const metrics = this.getLatestMetrics(agentId);
            if (metrics && metrics.activeTasks < minLoad) {
                minLoad = metrics.activeTasks;
            }
        }
        return minLoad === Number.POSITIVE_INFINITY ? 0 : minLoad;
    }
    calculateLoadVariance() {
        const loads = [];
        for (const [agentId, _] of this.agents) {
            const metrics = this.getLatestMetrics(agentId);
            if (metrics) {
                loads.push(metrics.activeTasks);
            }
        }
        if (loads.length === 0)
            return 0;
        const mean = loads.reduce((a, b) => a + b, 0) / loads.length;
        const variance = loads.reduce((acc, load) => acc + (load - mean) ** 2, 0) / loads.length;
        return variance;
    }
    startTime;
}
//# sourceMappingURL=load-balancing-manager.js.map