/**
 * @file Strategy Pattern Implementation for Swarm Coordination
 * Provides flexible coordination strategies for different swarm topologies.
 */
import { EventEmitter } from 'node:events';
// Mesh Strategy Implementation - Full connectivity
export class MeshStrategy {
    metrics = {
        latency: 50,
        throughput: 1000,
        reliability: 0.99,
        scalability: 0.85,
        resourceEfficiency: 0.75,
    };
    async coordinate(agents, context) {
        const _startTime = Date.now();
        if (!this.validateContext(context)) {
            throw new Error('Invalid coordination context for mesh strategy');
        }
        // Establish full mesh connections
        const connections = this.establishMeshConnections(agents);
        const performance = await this.calculateMeshPerformance(agents, connections);
        const latency = this.measureLatency(connections, context);
        return {
            topology: 'mesh',
            performance,
            connections,
            latency,
            success: true,
            recommendations: this.generateRecommendations(agents, performance),
        };
    }
    getMetrics() {
        return { ...this.metrics };
    }
    getTopologyType() {
        return 'mesh';
    }
    validateContext(context) {
        return (context.resources.network > 0.3 && // Mesh requires good network
            context.constraints.maxLatency > 100); // Allow for mesh overhead
    }
    async optimize(_agents, history) {
        // Analyze historical performance and adjust metrics
        const avgLatency = history
            .filter((h) => h.metrics.latency)
            .reduce((sum, h) => sum + (h.metrics.latency || 0), 0) / history.length;
        if (avgLatency > 0) {
            this.metrics.latency = Math.min(this.metrics.latency * 0.9, avgLatency * 1.1);
        }
    }
    establishMeshConnections(agents) {
        const connections = {};
        agents.forEach((agent) => {
            connections[agent.id] = agents
                .filter((other) => other.id !== agent.id)
                .map((other) => other.id);
        });
        return connections;
    }
    async calculateMeshPerformance(agents, connections) {
        const connectionCount = Object.values(connections).reduce((sum, conns) => sum + conns.length, 0);
        return {
            executionTime: Date.now(),
            messageCount: connectionCount * 2, // Bidirectional
            coordinationEfficiency: Math.min(0.95, 1 - agents.length * 0.02), // Decreases with scale
            resourceUtilization: {
                cpu: agents.length * 0.1,
                memory: agents.length * 0.05,
                network: connectionCount * 0.02,
                storage: 0.01,
            },
        };
    }
    measureLatency(connections, context) {
        const baseLatency = 50;
        const networkFactor = (1 - context.resources.network) * 100;
        const scaleFactor = Object.keys(connections).length * 2;
        return baseLatency + networkFactor + scaleFactor;
    }
    generateRecommendations(agents, performance) {
        const recommendations = [];
        if (agents.length > 20) {
            recommendations.push('Consider hierarchical topology for better scalability');
        }
        if (performance.resourceUtilization.network > 0.8) {
            recommendations.push('Network utilization high - consider connection pooling');
        }
        return recommendations;
    }
}
// Hierarchical Strategy Implementation - Tree structure with leaders
export class HierarchicalStrategy {
    metrics = {
        latency: 75,
        throughput: 800,
        reliability: 0.95,
        scalability: 0.95,
        resourceEfficiency: 0.9,
    };
    async coordinate(agents, context) {
        if (!this.validateContext(context)) {
            throw new Error('Invalid coordination context for hierarchical strategy');
        }
        const hierarchy = await this.buildHierarchy(agents, context);
        const performance = this.optimizeHierarchy(hierarchy, agents);
        const latency = this.calculateHierarchicalLatency(hierarchy);
        return {
            topology: 'hierarchical',
            performance,
            leadership: hierarchy,
            latency,
            success: true,
            recommendations: this.generateHierarchicalRecommendations(agents, hierarchy),
        };
    }
    getMetrics() {
        return { ...this.metrics };
    }
    getTopologyType() {
        return 'hierarchical';
    }
    validateContext(context) {
        return (context.resources.cpu > 0.2 && // Need CPU for leader election
            context.agents.length > 5); // Hierarchical makes sense with more agents
    }
    async optimize(agents, history) {
        // Optimize based on leadership effectiveness
        const leadershipChanges = history.filter((h) => h.action.includes('leader'));
        if (leadershipChanges.length > agents.length * 0.1) {
            this.metrics.reliability *= 0.95; // Frequent leadership changes reduce reliability
        }
    }
    async buildHierarchy(agents, _context) {
        // Simple hierarchy builder - can be enhanced with agent capabilities
        const leaders = [];
        const hierarchy = {};
        // Select leaders based on agent capabilities and resource availability
        const sortedAgents = agents.sort((a, b) => b.capabilities.length - a.capabilities.length);
        const leaderCount = Math.max(1, Math.floor(agents.length / 5));
        leaders.push(...sortedAgents.slice(0, leaderCount).map((a) => a.id));
        // Build hierarchy levels
        hierarchy[0] = leaders;
        hierarchy[1] = sortedAgents.slice(leaderCount).map((a) => a.id);
        return {
            leaders,
            hierarchy,
            maxDepth: Object.keys(hierarchy).length,
        };
    }
    optimizeHierarchy(hierarchy, agents) {
        return {
            executionTime: Date.now(),
            messageCount: agents.length + hierarchy.leaders.length, // More efficient messaging
            coordinationEfficiency: 0.9 + hierarchy.leaders.length * 0.02,
            resourceUtilization: {
                cpu: hierarchy.leaders.length * 0.15 + (agents.length - hierarchy.leaders.length) * 0.05,
                memory: agents.length * 0.03,
                network: hierarchy.leaders.length * 0.1,
                storage: 0.005,
            },
        };
    }
    calculateHierarchicalLatency(hierarchy) {
        return 50 + hierarchy.maxDepth * 25; // Latency increases with depth
    }
    generateHierarchicalRecommendations(agents, hierarchy) {
        const recommendations = [];
        if (hierarchy.leaders.length / agents.length > 0.3) {
            recommendations.push('Too many leaders - consider fewer leadership levels');
        }
        if (hierarchy.maxDepth > 3) {
            recommendations.push('Deep hierarchy detected - consider flatter structure');
        }
        return recommendations;
    }
}
// Ring Strategy Implementation - Circular communication
export class RingStrategy {
    metrics = {
        latency: 100,
        throughput: 600,
        reliability: 0.85,
        scalability: 0.7,
        resourceEfficiency: 0.95,
    };
    async coordinate(agents, context) {
        if (!this.validateContext(context)) {
            throw new Error('Invalid coordination context for ring strategy');
        }
        const connections = this.establishRingConnections(agents);
        const performance = this.calculateRingPerformance(agents);
        const latency = this.calculateRingLatency(agents.length);
        return {
            topology: 'ring',
            performance,
            connections,
            latency,
            success: true,
            recommendations: this.generateRingRecommendations(agents),
        };
    }
    getMetrics() {
        return { ...this.metrics };
    }
    getTopologyType() {
        return 'ring';
    }
    validateContext(context) {
        return (context.resources.network > 0.1 && // Minimal network requirements
            context.constraints.maxLatency > 200); // Ring can have higher latency
    }
    async optimize(agents, history) {
        // Optimize based on ring failures
        const failures = history.filter((h) => h.result === 'failure').length;
        if (failures > agents.length * 0.1) {
            this.metrics.reliability *= 0.9; // Ring is vulnerable to single points of failure
        }
    }
    establishRingConnections(agents) {
        const connections = {};
        if (agents.length === 0) {
            return connections;
        }
        agents.forEach((agent, index) => {
            const nextIndex = (index + 1) % agents.length;
            const nextAgent = agents[nextIndex];
            if (nextAgent !== undefined) {
                connections[agent.id] = [nextAgent.id];
            }
        });
        return connections;
    }
    calculateRingPerformance(agents) {
        return {
            executionTime: Date.now(),
            messageCount: agents.length, // Each agent connects to one other
            coordinationEfficiency: 0.7, // Lower due to sequential nature
            resourceUtilization: {
                cpu: agents.length * 0.05,
                memory: agents.length * 0.02,
                network: agents.length * 0.01,
                storage: 0.005,
            },
        };
    }
    calculateRingLatency(agentCount) {
        return 50 + agentCount * 10; // Latency increases linearly with ring size
    }
    generateRingRecommendations(agents) {
        const recommendations = [];
        if (agents.length > 15) {
            recommendations.push('Large ring detected - consider hierarchical or mesh topology');
        }
        recommendations.push('Implement ring failure detection and recovery mechanisms');
        return recommendations;
    }
}
// Star Strategy Implementation - Central hub coordination
export class StarStrategy {
    metrics = {
        latency: 30,
        throughput: 1200,
        reliability: 0.8,
        scalability: 0.6,
        resourceEfficiency: 0.85,
    };
    async coordinate(agents, context) {
        if (!this.validateContext(context)) {
            throw new Error('Invalid coordination context for star strategy');
        }
        const hub = this.selectHub(agents);
        const connections = this.establishStarConnections(agents, hub);
        const performance = this.calculateStarPerformance(agents, hub);
        const latency = this.calculateStarLatency();
        return {
            topology: 'star',
            performance,
            connections,
            leadership: {
                leaders: [hub.id],
                hierarchy: { 0: [hub.id], 1: agents.filter((a) => a.id !== hub.id).map((a) => a.id) },
                maxDepth: 2,
            },
            latency,
            success: true,
            recommendations: this.generateStarRecommendations(agents, hub),
        };
    }
    getMetrics() {
        return { ...this.metrics };
    }
    getTopologyType() {
        return 'star';
    }
    validateContext(context) {
        return context.resources.cpu > 0.3; // Hub needs good CPU resources
    }
    async optimize(_agents, history) {
        // Optimize based on hub performance
        const hubFailures = history.filter((h) => h.result === 'failure' && h.action.includes('hub')).length;
        if (hubFailures > 0) {
            this.metrics.reliability *= 0.85; // Hub failures significantly impact reliability
        }
    }
    selectHub(agents) {
        // Select agent with most capabilities as hub
        return agents.reduce((best, current) => current?.capabilities.length > best.capabilities.length ? current : best);
    }
    establishStarConnections(agents, hub) {
        const connections = {};
        // Hub connects to all others
        connections[hub.id] = agents.filter((a) => a.id !== hub.id).map((a) => a.id);
        // Others connect only to hub
        agents
            .filter((a) => a.id !== hub.id)
            .forEach((agent) => {
            connections[agent.id] = [hub.id];
        });
        return connections;
    }
    calculateStarPerformance(agents, _hub) {
        return {
            executionTime: Date.now(),
            messageCount: (agents.length - 1) * 2, // Hub communicates with all others
            coordinationEfficiency: 0.85, // Efficient for small to medium swarms
            resourceUtilization: {
                cpu: 0.2, // Hub uses more CPU
                memory: agents.length * 0.03,
                network: (agents.length - 1) * 0.02,
                storage: 0.01,
            },
        };
    }
    calculateStarLatency() {
        return 30; // Low latency due to direct hub communication
    }
    generateStarRecommendations(agents, hub) {
        const recommendations = [];
        recommendations.push(`Hub agent ${hub.id} is critical - implement failover mechanisms`);
        if (agents.length > 25) {
            recommendations.push('Large star topology - consider hierarchical structure');
        }
        return recommendations;
    }
}
// Context with runtime strategy switching and optimization
export class SwarmCoordinator extends EventEmitter {
    strategy;
    history = [];
    optimizationInterval = 10; // Optimize every 10 coordinations
    constructor(strategy) {
        super();
        this.strategy = strategy;
    }
    setStrategy(strategy) {
        this.strategy = strategy;
        this.logStrategyChange(strategy.getTopologyType());
    }
    async executeCoordination(agents, contextData) {
        const context = this.buildContext(agents, contextData);
        const startTime = Date.now();
        try {
            const result = await this.strategy.coordinate(agents, context);
            // Record successful coordination
            this.recordHistory(agents, 'coordinate', 'success', {
                latency: result?.latency,
                reliability: this.strategy.getMetrics().reliability,
            });
            // Periodic optimization
            if (this.history.length % this.optimizationInterval === 0) {
                await this.strategy.optimize(agents, this.history);
            }
            // Emit coordination completed event
            this.emit('coordination:completed', {
                context,
                result,
                agents: agents.length,
                latency: result?.latency,
            });
            return result;
        }
        catch (error) {
            // Record failed coordination
            this.recordHistory(agents, 'coordinate', 'failure', {
                latency: Date.now() - startTime,
            });
            throw error;
        }
    }
    getStrategy() {
        return this.strategy;
    }
    getHistory() {
        return [...this.history];
    }
    clearHistory() {
        this.history = [];
    }
    // Auto-select optimal strategy based on context and agent characteristics
    async autoSelectStrategy(agents, context) {
        const strategies = [
            new MeshStrategy(),
            new HierarchicalStrategy(),
            new RingStrategy(),
            new StarStrategy(),
        ];
        // Score each strategy based on context
        const scores = strategies.map((strategy) => ({
            strategy,
            score: this.scoreStrategy(strategy, agents, context),
        }));
        // Select highest scoring strategy
        const best = scores.reduce((best, current) => (current?.score > best.score ? current : best));
        return best.strategy;
    }
    buildContext(agents, contextData) {
        return {
            swarmId: `swarm-${Date.now()}`,
            timestamp: new Date(),
            resources: {
                cpu: 0.7,
                memory: 0.8,
                network: 0.6,
                storage: 0.9,
                ...contextData?.resources,
            },
            constraints: {
                maxLatency: 500,
                minReliability: 0.9,
                resourceLimits: { cpu: 1.0, memory: 1.0, network: 1.0, storage: 1.0 },
                securityLevel: 'medium',
                ...contextData?.constraints,
            },
            history: this.history,
            agents: agents,
            ...contextData,
        };
    }
    logStrategyChange(_topology) { }
    recordHistory(agents, action, result, metrics) {
        this.history.push({
            timestamp: new Date(),
            action,
            agentId: agents[0]?.id || 'unknown',
            result,
            metrics: metrics || {},
        });
        // Keep history bounded
        if (this.history.length > 1000) {
            this.history = this.history.slice(-500);
        }
    }
    scoreStrategy(strategy, agents, context) {
        const metrics = strategy.getMetrics();
        let score = 0;
        // Score based on context requirements
        if (context.constraints.maxLatency > metrics.latency)
            score += 20;
        if (context.constraints.minReliability <= metrics.reliability)
            score += 30;
        // Score based on agent count (scalability)
        if (agents.length <= 10) {
            score += strategy.getTopologyType() === 'star' ? 20 : 10;
        }
        else if (agents.length <= 50) {
            score += strategy.getTopologyType() === 'hierarchical' ? 20 : 10;
        }
        else {
            score += strategy.getTopologyType() === 'mesh' ? 20 : 10;
        }
        // Score based on resource availability
        score += metrics.resourceEfficiency * context.resources.cpu * 10;
        return score;
    }
}
// Factory for creating strategies
export class StrategyFactory {
    static createStrategy(topology) {
        switch (topology) {
            case 'mesh':
                return new MeshStrategy();
            case 'hierarchical':
                return new HierarchicalStrategy();
            case 'ring':
                return new RingStrategy();
            case 'star':
                return new StarStrategy();
            default:
                throw new Error(`Unknown topology: ${topology}`);
        }
    }
    static getAllStrategies() {
        return [new MeshStrategy(), new HierarchicalStrategy(), new RingStrategy(), new StarStrategy()];
    }
}
