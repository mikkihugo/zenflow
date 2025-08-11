/**
 * Intelligent Routing Engine.
 * Advanced routing with task-agent matching and failover capabilities.
 */
/**
 * @file intelligent-routing processing engine
 */
import type { CapacityManager, RoutingEngine } from '../interfaces.ts';
import type { Agent, NetworkTopology, RoutingResult, Task } from '../types.ts';
interface RoutingMetrics {
    totalRoutingDecisions: number;
    successfulRoutings: number;
    averageRoutingLatency: number;
    failoverActivations: number;
    routeOptimizations: number;
    qosViolations: number;
}
export declare class IntelligentRoutingEngine implements RoutingEngine {
    private routingTable;
    private taskAgentMatcher;
    private failoverManager;
    private networkOptimizer;
    private capacityManager;
    private routingMetrics;
    private networkTopology;
    private config;
    constructor(capacityManager: CapacityManager);
    /**
     * Route a task to the optimal agent.
     *
     * @param task
     */
    route(task: Task): Promise<RoutingResult>;
    /**
     * Update routing table with current agents.
     *
     * @param agents
     */
    updateRoutingTable(agents: Agent[]): Promise<void>;
    /**
     * Handle failover when an agent fails.
     *
     * @param failedAgentId
     */
    handleFailover(failedAgentId: string): Promise<void>;
    /**
     * Optimize routing paths and decisions.
     */
    optimizeRoutes(): Promise<void>;
    /**
     * Set network topology for geographic-aware routing.
     *
     * @param topology
     */
    setNetworkTopology(topology: NetworkTopology): void;
    /**
     * Get routing statistics.
     */
    getRoutingStatistics(): RoutingMetrics & {
        routingTableSize: number;
        avgRouteReliability: number;
    };
    /**
     * Get available agents from routing table.
     */
    private getAvailableAgents;
    /**
     * Update routing information for a specific agent.
     *
     * @param agent
     */
    private updateAgentRoute;
    /**
     * Discover available routes to an agent.
     *
     * @param agent
     */
    private discoverRoutes;
    /**
     * Discover geographic routes using network topology.
     *
     * @param agent
     */
    private discoverGeographicRoutes;
    /**
     * Make intelligent routing decision.
     *
     * @param task
     * @param candidates
     */
    private makeRoutingDecision;
    /**
     * Calculate routing score for an agent.
     *
     * @param task
     * @param agent
     * @param routingEntry
     */
    private calculateRoutingScore;
    /**
     * Select the best route from available options.
     *
     * @param routingEntry
     * @param task
     */
    private selectBestRoute;
    /**
     * Score a route based on task requirements.
     *
     * @param route
     * @param task
     */
    private scoreRoute;
    /**
     * Update routing metrics.
     *
     * @param latency
     * @param success
     */
    private updateRoutingMetrics;
    /**
     * Redistribute routes after agent failure.
     *
     * @param failedAgentId
     */
    private redistributeRoutes;
    /**
     * Optimize network paths using topology information.
     */
    private optimizeNetworkPaths;
    /**
     * Update reliability scores based on historical performance.
     */
    private updateReliabilityScores;
    /**
     * Balance load across available routes.
     */
    private balanceRouteLoad;
    private measureLatency;
    private measureBandwidth;
    private calculateAgentReliability;
    private calculateAverageLatency;
    private calculateAverageBandwidth;
    private calculateQoSScore;
    private calculateConfidence;
    private calculateFreshnessFactor;
    private calculateExpectedQuality;
    private calculateQoSGuarantees;
    private calculatePathLatency;
    private calculatePathBandwidth;
    private calculatePathReliability;
    private calculateQoSLevel;
}
export {};
//# sourceMappingURL=intelligent-routing-engine.d.ts.map