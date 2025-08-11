/**
 * Intelligent Routing Engine.
 * Advanced routing with task-agent matching and failover capabilities.
 */
/**
 * @file intelligent-routing processing engine
 */
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
        routeUpdateInterval: 30000, // 30 seconds
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
    /**
     * Route a task to the optimal agent.
     *
     * @param task
     */
    async route(task) {
        const startTime = Date.now();
        this.routingMetrics.totalRoutingDecisions++;
        try {
            // Get available agents from routing table
            const availableAgents = this.getAvailableAgents();
            if (availableAgents.length === 0) {
                throw new Error('No available agents for routing');
            }
            // Find candidate agents using task-agent matching
            const candidates = await this.taskAgentMatcher.findCandidates(task, availableAgents, this.capacityManager);
            if (candidates.length === 0) {
                throw new Error('No suitable candidates found for task');
            }
            // Make routing decision
            const decision = await this.makeRoutingDecision(task, candidates);
            // Update routing metrics
            const routingLatency = Date.now() - startTime;
            this.updateRoutingMetrics(routingLatency, true);
            // Return routing result
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
    /**
     * Update routing table with current agents.
     *
     * @param agents
     */
    async updateRoutingTable(agents) {
        const updatePromises = agents.map((agent) => this.updateAgentRoute(agent));
        await Promise.all(updatePromises);
        // Optimize routes after updating
        await this.optimizeRoutes();
    }
    /**
     * Handle failover when an agent fails.
     *
     * @param failedAgentId
     */
    async handleFailover(failedAgentId) {
        this.routingMetrics.failoverActivations++;
        // Remove failed agent from routing table
        this.routingTable.delete(failedAgentId);
        // Activate failover procedures
        await this.failoverManager.activateFailover(failedAgentId);
        // Redistribute routes
        await this.redistributeRoutes(failedAgentId);
    }
    /**
     * Optimize routing paths and decisions.
     */
    async optimizeRoutes() {
        if (!this.config.adaptiveRoutingEnabled)
            return;
        this.routingMetrics.routeOptimizations++;
        // Optimize network paths
        if (this.networkTopology) {
            await this.optimizeNetworkPaths();
        }
        // Update route reliability scores
        await this.updateReliabilityScores();
        // Balance load across routes
        await this.balanceRouteLoad();
    }
    /**
     * Set network topology for geographic-aware routing.
     *
     * @param topology
     */
    setNetworkTopology(topology) {
        this.networkTopology = topology;
    }
    /**
     * Get routing statistics.
     */
    getRoutingStatistics() {
        const avgReliability = Array.from(this.routingTable.values()).reduce((sum, route) => sum + route.reliability, 0) /
            this.routingTable.size;
        return {
            ...this.routingMetrics,
            routingTableSize: this.routingTable.size,
            avgRouteReliability: avgReliability || 0,
        };
    }
    /**
     * Get available agents from routing table.
     */
    getAvailableAgents() {
        const agents = [];
        for (const [agentId, routingEntry] of this.routingTable) {
            // Create agent object from routing table entry
            agents.push({
                id: agentId,
                name: `Agent-${agentId}`,
                capabilities: [], // Would be populated from actual agent data
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
    /**
     * Update routing information for a specific agent.
     *
     * @param agent
     */
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
    /**
     * Discover available routes to an agent.
     *
     * @param agent
     */
    async discoverRoutes(agent) {
        const routes = [];
        // Direct route
        routes.push({
            destination: agent.id,
            latency: await this.measureLatency(agent.endpoint),
            bandwidth: await this.measureBandwidth(agent.endpoint),
            reliability: 0.95, // Default reliability
            qosLevel: 1,
            path: [agent.id],
        });
        // Geographic routes if topology is available
        if (this.networkTopology && this.config.geographicAwareRouting) {
            const geoRoutes = await this.discoverGeographicRoutes(agent);
            routes.push(...geoRoutes);
        }
        return routes;
    }
    /**
     * Discover geographic routes using network topology.
     *
     * @param agent
     */
    async discoverGeographicRoutes(agent) {
        if (!this.networkTopology)
            return [];
        const routes = [];
        const agentLocation = this.networkTopology.agents.get(agent.id);
        if (!agentLocation)
            return routes;
        // Find optimal paths using network topology
        const optimalPaths = await this.networkOptimizer.selectOptimalPath('source', // Would be actual source location
        agent.id);
        for (const path of optimalPaths) {
            const latency = await this.calculatePathLatency(path);
            const bandwidth = await this.calculatePathBandwidth(path);
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
    /**
     * Make intelligent routing decision.
     *
     * @param task
     * @param candidates
     */
    async makeRoutingDecision(task, candidates) {
        const routingOptions = [];
        for (const candidate of candidates) {
            const routingEntry = this.routingTable.get(candidate.id);
            if (!routingEntry)
                continue;
            // Calculate routing score for each candidate
            const score = await this.calculateRoutingScore(task, candidate, routingEntry);
            routingOptions.push({
                agent: candidate,
                routingEntry,
                score,
                estimatedLatency: routingEntry.averageLatency,
                confidence: this.calculateConfidence(routingEntry, task),
            });
        }
        // Sort by routing score (higher is better)
        routingOptions?.sort((a, b) => b.score - a.score);
        const bestOption = routingOptions?.[0];
        const fallbackOptions = routingOptions.slice(1, 4).map((opt) => opt.agent);
        // Select best route for the chosen agent
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
    /**
     * Calculate routing score for an agent.
     *
     * @param task
     * @param agent
     * @param routingEntry
     */
    async calculateRoutingScore(task, agent, routingEntry) {
        const weights = this.config.qosWeights;
        // Latency score (lower latency = higher score)
        const latencyScore = Math.max(0, 1 - routingEntry.averageLatency / 10000);
        // Reliability score
        const reliabilityScore = routingEntry.reliability;
        // Bandwidth score (simplified)
        const bandwidthScore = Math.min(1, this.calculateAverageBandwidth(routingEntry) / 1000);
        // QoS score based on task requirements
        const qosScore = await this.calculateQoSScore(task, routingEntry);
        // Capacity score
        const capacity = await this.capacityManager.getCapacity(agent.id);
        const capacityScore = capacity.availableCapacity / capacity.maxConcurrentTasks;
        return (latencyScore * weights.latency +
            reliabilityScore * weights.reliability +
            bandwidthScore * weights.bandwidth +
            qosScore * weights.qos +
            capacityScore * 0.2);
    }
    /**
     * Select the best route from available options.
     *
     * @param routingEntry
     * @param task
     */
    selectBestRoute(routingEntry, task) {
        if (routingEntry.routes.length === 0) {
            throw new Error('No routes available');
        }
        // Score each route based on task requirements
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
    /**
     * Score a route based on task requirements.
     *
     * @param route
     * @param task
     */
    scoreRoute(route, task) {
        const weights = this.config.qosWeights;
        const latencyScore = Math.max(0, 1 - route.latency / 10000);
        const reliabilityScore = route.reliability;
        const bandwidthScore = Math.min(1, route.bandwidth / 1000);
        const qosScore = route.qosLevel / 5; // Normalize QoS level
        // Priority adjustment
        const priorityMultiplier = task.priority >= 4 ? 1.2 : 1.0;
        return ((latencyScore * weights.latency +
            reliabilityScore * weights.reliability +
            bandwidthScore * weights.bandwidth +
            qosScore * weights.qos) *
            priorityMultiplier);
    }
    /**
     * Update routing metrics.
     *
     * @param latency
     * @param success
     */
    updateRoutingMetrics(latency, success) {
        if (success) {
            this.routingMetrics.successfulRoutings++;
        }
        // Update average routing latency using exponential moving average
        const alpha = 0.1;
        this.routingMetrics.averageRoutingLatency =
            (1 - alpha) * this.routingMetrics.averageRoutingLatency + alpha * latency;
    }
    /**
     * Redistribute routes after agent failure.
     *
     * @param failedAgentId
     */
    async redistributeRoutes(failedAgentId) {
        // Implement route redistribution logic
        // This would involve updating routes that went through the failed agent
        const affectedRoutes = [];
        for (const [agentId, routingEntry] of this.routingTable) {
            const updatedRoutes = routingEntry.routes.filter((route) => !route.path.includes(failedAgentId));
            if (updatedRoutes.length !== routingEntry.routes.length) {
                routingEntry.routes = updatedRoutes;
                affectedRoutes.push(agentId);
            }
        }
        // Recalculate routes for affected agents
        for (const agentId of affectedRoutes) {
            // Trigger route recalculation for affected agent
            await this.recalculateRouteForAgent(agentId);
            this.emit('route:recalculated', { agentId, timestamp: Date.now() });
        }
    }
    /**
     * Optimize network paths using topology information.
     */
    async optimizeNetworkPaths() {
        if (!this.networkTopology)
            return;
        // Use network optimizer to find better paths
        for (const [agentId, routingEntry] of this.routingTable) {
            const optimizedPaths = await this.networkOptimizer.selectOptimalPath('source', agentId);
            // Update routes with optimized paths
            const optimizedRoutes = await Promise.all(optimizedPaths.map(async (path) => ({
                destination: agentId,
                latency: await this.calculatePathLatency(path),
                bandwidth: await this.calculatePathBandwidth(path),
                reliability: this.calculatePathReliability(path),
                qosLevel: 1,
                path,
            })));
            // Merge with existing routes
            routingEntry.routes = [...routingEntry.routes, ...optimizedRoutes];
        }
    }
    /**
     * Update reliability scores based on historical performance.
     */
    async updateReliabilityScores() {
        for (const [agentId, routingEntry] of this.routingTable) {
            // Calculate new reliability based on recent performance
            const newReliability = await this.calculateAgentReliability({
                id: agentId,
            });
            // Update using exponential moving average
            const alpha = 0.2;
            routingEntry.reliability = (1 - alpha) * routingEntry.reliability + alpha * newReliability;
        }
    }
    /**
     * Balance load across available routes.
     */
    async balanceRouteLoad() {
        // Implement load balancing across routes
        // This would adjust route preferences based on current load
    }
    // Helper methods for measurements and calculations
    async measureLatency(_endpoint) {
        // Mock latency measurement
        return 50 + Math.random() * 200;
    }
    async measureBandwidth(_endpoint) {
        // Mock bandwidth measurement
        return 1000 + Math.random() * 5000;
    }
    async calculateAgentReliability(_agent) {
        // Mock reliability calculation based on historical data
        return 0.85 + Math.random() * 0.15;
    }
    async calculateAverageLatency(_agent) {
        // Mock average latency calculation
        return 100 + Math.random() * 500;
    }
    calculateAverageBandwidth(routingEntry) {
        if (routingEntry.routes.length === 0)
            return 0;
        return (routingEntry.routes.reduce((sum, route) => sum + route.bandwidth, 0) /
            routingEntry.routes.length);
    }
    async calculateQoSScore(_task, _routingEntry) {
        // Calculate QoS score based on task requirements
        // This would consider task priority, SLA requirements, etc.
        return 0.8 + Math.random() * 0.2;
    }
    calculateConfidence(routingEntry, _task) {
        // Calculate confidence in routing decision
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
        return decision.confidence * 0.8 + (decision.qosGuarantees.availability || 0.9) * 0.2;
    }
    calculateQoSGuarantees(route) {
        return {
            maxLatency: route.latency * 1.2, // 20% buffer
            minThroughput: route.bandwidth * 0.8, // 80% guarantee
            maxErrorRate: 1 - route.reliability,
            availability: route.reliability,
        };
    }
    async calculatePathLatency(path) {
        // Calculate total latency for a path
        return 100 + path.length * 20;
    }
    async calculatePathBandwidth(path) {
        // Calculate minimum bandwidth along path
        return Math.max(100, 1000 - path.length * 100);
    }
    calculatePathReliability(path) {
        // Calculate overall path reliability
        const baseReliability = 0.95;
        return baseReliability ** path.length;
    }
    calculateQoSLevel(latency, bandwidth, reliability) {
        // Calculate QoS level from 1-5
        const latencyScore = Math.max(0, 1 - latency / 1000);
        const bandwidthScore = Math.min(1, bandwidth / 5000);
        const reliabilityScore = reliability;
        const avgScore = (latencyScore + bandwidthScore + reliabilityScore) / 3;
        return Math.ceil(avgScore * 5);
    }
}
