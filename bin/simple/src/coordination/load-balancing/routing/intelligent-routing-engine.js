import { NetworkLatencyOptimizer } from '../optimization/network-latency-optimizer.ts';
import { FailoverManager } from './failover-manager.ts';
import { TaskAgentMatcher } from './task-agent-matcher.ts';
export class IntelligentRoutingEngine {
    routingTable = new Map();
    taskAgentMatcher;
    failoverManager;
    networkOptimizer;
    capacityManager;
    routingMetrics;
    networkTopology = null;
    config = {
        routeUpdateInterval: 30000,
        maxRoutingAttempts: 3,
        routingTimeout: 5000,
        qosWeights: {
            latency: 0.4,
            reliability: 0.3,
            bandwidth: 0.2,
            qos: 0.1,
        },
        failoverThreshold: 0.8,
        adaptiveRoutingEnabled: true,
        geographicAwareRouting: true,
        loadBalancingStrategy: 'intelligent',
    };
    constructor(capacityManager) {
        this.capacityManager = capacityManager;
        this.taskAgentMatcher = new TaskAgentMatcher();
        this.failoverManager = new FailoverManager();
        this.networkOptimizer = new NetworkLatencyOptimizer();
        this.routingMetrics = {
            totalRoutingDecisions: 0,
            successfulRoutings: 0,
            averageRoutingLatency: 0,
            failoverActivations: 0,
            routeOptimizations: 0,
            qosViolations: 0,
        };
    }
    async route(task) {
        const startTime = Date.now();
        this.routingMetrics.totalRoutingDecisions++;
        try {
            const availableAgents = this.getAvailableAgents();
            if (availableAgents.length === 0) {
                throw new Error('No available agents for routing');
            }
            const candidates = await this.taskAgentMatcher.findCandidates(task, availableAgents, this.capacityManager);
            if (candidates.length === 0) {
                throw new Error('No suitable candidates found for task');
            }
            const decision = await this.makeRoutingDecision(task, candidates);
            const routingLatency = Date.now() - startTime;
            this.updateRoutingMetrics(routingLatency, true);
            return {
                selectedAgent: decision.selectedAgent,
                confidence: decision.confidence,
                reasoning: `Intelligent routing: ${decision.routingPath.join(' -> ')} (${decision.estimatedLatency}ms)`,
                alternativeAgents: decision.fallbackOptions,
                estimatedLatency: decision.estimatedLatency,
                expectedQuality: this.calculateExpectedQuality(decision),
            };
        }
        catch (error) {
            this.updateRoutingMetrics(Date.now() - startTime, false);
            throw error;
        }
    }
    async updateRoutingTable(agents) {
        const updatePromises = agents.map((agent) => this.updateAgentRoute(agent));
        await Promise.all(updatePromises);
        await this.optimizeRoutes();
    }
    async handleFailover(failedAgentId) {
        this.routingMetrics.failoverActivations++;
        this.routingTable.delete(failedAgentId);
        await this.failoverManager.activateFailover(failedAgentId);
        await this.redistributeRoutes(failedAgentId);
    }
    async optimizeRoutes() {
        if (!this.config.adaptiveRoutingEnabled)
            return;
        this.routingMetrics.routeOptimizations++;
        if (this.networkTopology) {
            await this.optimizeNetworkPaths();
        }
        await this.updateReliabilityScores();
        await this.balanceRouteLoad();
    }
    setNetworkTopology(topology) {
        this.networkTopology = topology;
    }
    getRoutingStatistics() {
        const avgReliability = Array.from(this.routingTable.values()).reduce((sum, route) => sum + route.reliability, 0) / this.routingTable.size;
        return {
            ...this.routingMetrics,
            routingTableSize: this.routingTable.size,
            avgRouteReliability: avgReliability || 0,
        };
    }
    getAvailableAgents() {
        const agents = [];
        for (const [agentId, routingEntry] of this.routingTable) {
            agents.push({
                id: agentId,
                name: `Agent-${agentId}`,
                capabilities: [],
                status: routingEntry.reliability > 0.8 ? 'healthy' : 'degraded',
                endpoint: `http://agent-${agentId}:8080`,
                lastHealthCheck: routingEntry.lastUpdate,
                metadata: {
                    reliability: routingEntry.reliability,
                    averageLatency: routingEntry.averageLatency,
                },
            });
        }
        return agents;
    }
    async updateAgentRoute(agent) {
        const routes = await this.discoverRoutes(agent);
        const reliability = await this.calculateAgentReliability(agent);
        const averageLatency = await this.calculateAverageLatency(agent);
        this.routingTable.set(agent.id, {
            agentId: agent.id,
            routes,
            lastUpdate: new Date(),
            reliability,
            averageLatency,
        });
    }
    async discoverRoutes(agent) {
        const routes = [];
        routes.push({
            destination: agent.id,
            latency: await this.measureLatency(agent.endpoint),
            bandwidth: await this.measureBandwidth(agent.endpoint),
            reliability: 0.95,
            qosLevel: 1,
            path: [agent.id],
        });
        if (this.networkTopology && this.config.geographicAwareRouting) {
            const geoRoutes = await this.discoverGeographicRoutes(agent);
            routes.push(...geoRoutes);
        }
        return routes;
    }
    async discoverGeographicRoutes(agent) {
        if (!this.networkTopology)
            return [];
        const routes = [];
        const agentLocation = this.networkTopology.agents.get(agent.id);
        if (!agentLocation)
            return routes;
        const optimalPaths = await this.networkOptimizer.selectOptimalPath('source', agent.id);
        for (const path of optimalPaths) {
            const latency = (await this.calculatePathLatency(path));
            const bandwidth = (await this.calculatePathBandwidth(path));
            const reliability = this.calculatePathReliability(path);
            routes.push({
                destination: agent.id,
                latency,
                bandwidth,
                reliability,
                qosLevel: this.calculateQoSLevel(latency, bandwidth, reliability),
                path,
            });
        }
        return routes;
    }
    async makeRoutingDecision(task, candidates) {
        const routingOptions = [];
        for (const candidate of candidates) {
            const routingEntry = this.routingTable.get(candidate.id);
            if (!routingEntry)
                continue;
            const score = await this.calculateRoutingScore(task, candidate, routingEntry);
            routingOptions.push({
                agent: candidate,
                routingEntry,
                score,
                estimatedLatency: routingEntry.averageLatency,
                confidence: this.calculateConfidence(routingEntry, task),
            });
        }
        routingOptions?.sort((a, b) => b.score - a.score);
        const bestOption = routingOptions?.[0];
        const fallbackOptions = routingOptions.slice(1, 4).map((opt) => opt.agent);
        const bestRoute = this.selectBestRoute(bestOption.routingEntry, task);
        return {
            selectedAgent: bestOption.agent,
            routingPath: bestRoute.path,
            estimatedLatency: bestRoute.latency,
            confidence: bestOption.confidence,
            qosGuarantees: this.calculateQoSGuarantees(bestRoute),
            fallbackOptions,
        };
    }
    async calculateRoutingScore(task, agent, routingEntry) {
        const weights = this.config.qosWeights;
        const latencyScore = Math.max(0, 1 - routingEntry.averageLatency / 10000);
        const reliabilityScore = routingEntry.reliability;
        const bandwidthScore = Math.min(1, this.calculateAverageBandwidth(routingEntry) / 1000);
        const qosScore = await this.calculateQoSScore(task, routingEntry);
        const capacity = await this.capacityManager.getCapacity(agent.id);
        const capacityScore = capacity.availableCapacity / capacity.maxConcurrentTasks;
        return (latencyScore * weights.latency +
            reliabilityScore * weights.reliability +
            bandwidthScore * weights.bandwidth +
            qosScore * weights.qos +
            capacityScore * 0.2);
    }
    selectBestRoute(routingEntry, task) {
        if (routingEntry.routes.length === 0) {
            throw new Error('No routes available');
        }
        let bestRoute = routingEntry.routes[0];
        let bestScore = 0;
        for (const route of routingEntry.routes) {
            const score = this.scoreRoute(route, task);
            if (score > bestScore) {
                bestScore = score;
                bestRoute = route;
            }
        }
        return bestRoute;
    }
    scoreRoute(route, task) {
        const weights = this.config.qosWeights;
        const latencyScore = Math.max(0, 1 - route.latency / 10000);
        const reliabilityScore = route.reliability;
        const bandwidthScore = Math.min(1, route.bandwidth / 1000);
        const qosScore = route.qosLevel / 5;
        const priorityMultiplier = task.priority >= 4 ? 1.2 : 1.0;
        return ((latencyScore * weights.latency +
            reliabilityScore * weights.reliability +
            bandwidthScore * weights.bandwidth +
            qosScore * weights.qos) *
            priorityMultiplier);
    }
    updateRoutingMetrics(latency, success) {
        if (success) {
            this.routingMetrics.successfulRoutings++;
        }
        const alpha = 0.1;
        this.routingMetrics.averageRoutingLatency =
            (1 - alpha) * this.routingMetrics.averageRoutingLatency + alpha * latency;
    }
    async redistributeRoutes(failedAgentId) {
        const affectedRoutes = [];
        for (const [agentId, routingEntry] of this.routingTable) {
            const updatedRoutes = routingEntry.routes.filter((route) => !route.path.includes(failedAgentId));
            if (updatedRoutes.length !== routingEntry.routes.length) {
                routingEntry.routes = updatedRoutes;
                affectedRoutes.push(agentId);
            }
        }
        for (const agentId of affectedRoutes) {
            await this.recalculateRouteForAgent(agentId);
            this.emit('route:recalculated', { agentId, timestamp: Date.now() });
        }
    }
    async optimizeNetworkPaths() {
        if (!this.networkTopology)
            return;
        for (const [agentId, routingEntry] of this.routingTable) {
            const optimizedPaths = await this.networkOptimizer.selectOptimalPath('source', agentId);
            const optimizedRoutes = await Promise.all(optimizedPaths.map(async (path) => ({
                destination: agentId,
                latency: await this.calculatePathLatency(path),
                bandwidth: await this.calculatePathBandwidth(path),
                reliability: this.calculatePathReliability(path),
                qosLevel: 1,
                path,
            })));
            routingEntry.routes = [...routingEntry.routes, ...optimizedRoutes];
        }
    }
    async updateReliabilityScores() {
        for (const [agentId, routingEntry] of this.routingTable) {
            const newReliability = await this.calculateAgentReliability({
                id: agentId,
            });
            const alpha = 0.2;
            routingEntry.reliability =
                (1 - alpha) * routingEntry.reliability + alpha * newReliability;
        }
    }
    async balanceRouteLoad() {
    }
    async measureLatency(_endpoint) {
        return 50 + Math.random() * 200;
    }
    async measureBandwidth(_endpoint) {
        return 1000 + Math.random() * 5000;
    }
    async calculateAgentReliability(_agent) {
        return 0.85 + Math.random() * 0.15;
    }
    async calculateAverageLatency(_agent) {
        return 100 + Math.random() * 500;
    }
    calculateAverageBandwidth(routingEntry) {
        if (routingEntry.routes.length === 0)
            return 0;
        return (routingEntry.routes.reduce((sum, route) => sum + route.bandwidth, 0) /
            routingEntry.routes.length);
    }
    async calculateQoSScore(_task, _routingEntry) {
        return 0.8 + Math.random() * 0.2;
    }
    calculateConfidence(routingEntry, _task) {
        const reliabilityFactor = routingEntry.reliability;
        const routeCountFactor = Math.min(1, routingEntry.routes.length / 3);
        const freshnessFactory = this.calculateFreshnessFactor(routingEntry.lastUpdate);
        return (reliabilityFactor + routeCountFactor + freshnessFactory) / 3;
    }
    calculateFreshnessFactor(lastUpdate) {
        const ageMs = Date.now() - lastUpdate.getTime();
        const maxAge = this.config.routeUpdateInterval * 2;
        return Math.max(0, 1 - ageMs / maxAge);
    }
    calculateExpectedQuality(decision) {
        return (decision.confidence * 0.8 +
            (decision.qosGuarantees.availability || 0.9) * 0.2);
    }
    calculateQoSGuarantees(route) {
        return {
            maxLatency: route.latency * 1.2,
            minThroughput: route.bandwidth * 0.8,
            maxErrorRate: 1 - route.reliability,
            availability: route.reliability,
        };
    }
    async calculatePathLatency(path) {
        return 100 + path.length * 20;
    }
    async calculatePathBandwidth(path) {
        return Math.max(100, 1000 - path.length * 100);
    }
    calculatePathReliability(path) {
        const baseReliability = 0.95;
        return baseReliability ** path.length;
    }
    calculateQoSLevel(latency, bandwidth, reliability) {
        const latencyScore = Math.max(0, 1 - latency / 1000);
        const bandwidthScore = Math.min(1, bandwidth / 5000);
        const reliabilityScore = reliability;
        const avgScore = (latencyScore + bandwidthScore + reliabilityScore) / 3;
        return Math.ceil(avgScore * 5);
    }
}
//# sourceMappingURL=intelligent-routing-engine.js.map