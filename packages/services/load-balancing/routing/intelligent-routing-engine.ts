/**
 * Intelligent Routing Engine.
 * Advanced routing with task-agent matching and failover capabilities.
 */
/**
 * @file intelligent-routing processing engine
 */

import { EventEmitter } from '@claude-zen/foundation';

import type { CapacityManager, RoutingEngine } from '../interfaces';
import { NetworkLatencyOptimizer } from '../optimization/network-latency-optimizer';
import { AgentStatus, taskPriorityToNumber, type Agent, type NetworkTopology, type QoSRequirement, type RoutingResult, type Task } from '../types';

import { FailoverManager } from './failover-manager';
import { TaskAgentMatcher } from './task-agent-matcher';

interface RoutingTable {
  agentId: string;
  routes: RouteEntry[];
  lastUpdate: Date;
  reliability: number;
  averageLatency: number;
}

interface RouteEntry {
  destination: string;
  latency: number;
  bandwidth: number;
  reliability: number;
  qosLevel: number;
  path: string[];
}

interface RoutingDecision {
  selectedAgent: Agent;
  routingPath: string[];
  estimatedLatency: number;
  confidence: number;
  qosGuarantees: QoSRequirement;
  fallbackOptions: Agent[];
}

interface RoutingMetrics {
  totalRoutingDecisions: number;
  successfulRoutings: number;
  averageRoutingLatency: number;
  failoverActivations: number;
  routeOptimizations: number;
  qosViolations: number;
}

export class IntelligentRoutingEngine
  extends EventEmitter
  implements RoutingEngine
{
  private routingTable: Map<string, RoutingTable> = new Map();
  private taskAgentMatcher: TaskAgentMatcher;
  private failoverManager: FailoverManager;
  private networkOptimizer: NetworkLatencyOptimizer;
  private capacityManager: CapacityManager;
  private routingMetrics: RoutingMetrics;
  private networkTopology: NetworkTopology | null = null;

  private routingConfig = {
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
    loadBalancingStrategy:
      'intelligent' as ' round_robin|least_connections|intelligent',
  };

  constructor(capacityManager: CapacityManager) {
    super();
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
  public async route(task: Task): Promise<RoutingResult> {
    const startTime = Date.now();
    this.routingMetrics.totalRoutingDecisions++;

    try {
      // Get available agents from routing table
      const availableAgents = this.getAvailableAgents();

      if (availableAgents.length === 0) {
        throw new Error('No available agents for routing');
      }

      // Find candidate agents using task-agent matching
      const candidates = await this.taskAgentMatcher.findCandidates(
        task,
        availableAgents,
        this.capacityManager
      );

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
    } catch (error) {
      this.updateRoutingMetrics(Date.now() - startTime, false);
      throw error;
    }
  }

  /**
   * Update routing table with current agents.
   *
   * @param agents
   */
  public async updateRoutingTable(agents: Agent[]): Promise<void> {
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
  public async handleFailover(failedAgentId: string): Promise<void> {
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
  public async optimizeRoutes(): Promise<void> {
    if (!this.routingConfig.adaptiveRoutingEnabled) return;

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
  public setNetworkTopology(topology: NetworkTopology): void {
    this.networkTopology = topology;
  }

  /**
   * Get routing statistics.
   */
  public getRoutingStatistics(): RoutingMetrics & {
    routingTableSize: number;
    avgRouteReliability: number;
  } {
    const avgReliability =
      Array.from(this.routingTable.values()).reduce(
        (sum, route) => sum + route.reliability,
        0
      ) / this.routingTable.size;

    return {
      ...this.routingMetrics,
      routingTableSize: this.routingTable.size,
      avgRouteReliability: avgReliability || 0,
    };
  }

  /**
   * Get available agents from routing table.
   */
  private getAvailableAgents(): Agent[] {
    const agents: Agent[] = [];

    for (const [agentId, routingEntry] of this.routingTable) {
      // Create agent object from routing table entry
      agents.push({
        id: agentId,
        name: `Agent-${agentId}`,
        capabilities: [], // Would be populated from actual agent data
        status:
          routingEntry.reliability > 0.8
            ? AgentStatus.HEALTHY
            : AgentStatus.DEGRADED,
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
  private async updateAgentRoute(agent: Agent): Promise<void> {
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
  private async discoverRoutes(agent: Agent): Promise<RouteEntry[]> {
    const routes: RouteEntry[] = [];

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
    if (this.networkTopology && this.routingConfig.geographicAwareRouting) {
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
  private async discoverGeographicRoutes(agent: Agent): Promise<RouteEntry[]> {
    if (!this.networkTopology) return [];

    const routes: RouteEntry[] = [];
    const agentLocation = this.networkTopology.agents.get(agent.id);

    if (!agentLocation) return routes;

    // Find optimal path using network topology
    const optimalPath = await this.networkOptimizer.selectOptimalPath(
      'source' // Would be actual source location')      agent.id
    );

    const latency = await this.calculatePathLatency(optimalPath);
    const bandwidth = await this.calculatePathBandwidth(optimalPath);
    const reliability = this.calculatePathReliability(optimalPath);

    routes.push({
      destination: agent.id,
      latency,
      bandwidth,
      reliability,
      qosLevel: this.calculateQoSLevel(latency, bandwidth, reliability),
      path: optimalPath,
    });

    return routes;
  }

  /**
   * Make intelligent routing decision.
   *
   * @param task
   * @param candidates
   */
  private async makeRoutingDecision(
    task: Task,
    candidates: Agent[]
  ): Promise<RoutingDecision> {
    const routingOptions: Array<{
      agent: Agent;
      routingEntry: RoutingTable;
      score: number;
      estimatedLatency: number;
      confidence: number;
    }> = [];

    for (const candidate of candidates) {
      const routingEntry = this.routingTable.get(candidate.id);
      if (!routingEntry) continue;

      // Calculate routing score for each candidate
      const score = await this.calculateRoutingScore(
        task,
        candidate,
        routingEntry
      );

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
  private async calculateRoutingScore(
    task: Task,
    agent: Agent,
    routingEntry: RoutingTable
  ): Promise<number> {
    const weights = this.routingConfig.qosWeights;

    // Latency score (lower latency = higher score)
    const latencyScore = Math.max(0, 1 - routingEntry.averageLatency / 10000);

    // Reliability score
    const reliabilityScore = routingEntry.reliability;

    // Bandwidth score (simplified)
    const bandwidthScore = Math.min(
      1,
      this.calculateAverageBandwidth(routingEntry) / 1000
    );

    // QoS score based on task requirements
    const qosScore = await this.calculateQoSScore(task, routingEntry);

    // Capacity score
    const capacity = await this.capacityManager.getCapacity(agent.id);
    const capacityScore =
      capacity.availableCapacity / capacity.maxConcurrentTasks;

    return (
      latencyScore * weights.latency +
      reliabilityScore * weights.reliability +
      bandwidthScore * weights.bandwidth +
      qosScore * weights.qos +
      capacityScore * 0.2
    );
  }

  /**
   * Select the best route from available options.
   *
   * @param routingEntry
   * @param task
   */
  private selectBestRoute(routingEntry: RoutingTable, task: Task): RouteEntry {
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
  private scoreRoute(route: RouteEntry, task: Task): number {
    const weights = this.routingConfig.qosWeights;

    const latencyScore = Math.max(0, 1 - route.latency / 10000);
    const reliabilityScore = route.reliability;
    const bandwidthScore = Math.min(1, route.bandwidth / 1000);
    const qosScore = route.qosLevel / 5; // Normalize QoS level

    // Priority adjustment
    const priorityMultiplier =
      taskPriorityToNumber(task.priority) >= 4 ? 1.2 : 1.0;

    return (
      (latencyScore * weights.latency +
        reliabilityScore * weights.reliability +
        bandwidthScore * weights.bandwidth +
        qosScore * weights.qos) *
      priorityMultiplier
    );
  }

  /**
   * Update routing metrics.
   *
   * @param latency
   * @param success
   */
  private updateRoutingMetrics(latency: number, success: boolean): void {
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
  private async redistributeRoutes(failedAgentId: string): Promise<void> {
    // Implement route redistribution logic
    // This would involve updating routes that went through the failed agent
    const affectedRoutes: string[] = [];

    for (const [agentId, routingEntry] of this.routingTable) {
      const updatedRoutes = routingEntry.routes.filter(
        (route) => !route.path.includes(failedAgentId)
      );

      if (updatedRoutes.length !== routingEntry.routes.length) {
        routingEntry.routes = updatedRoutes;
        affectedRoutes.push(agentId);
      }
    }

    // Recalculate routes for affected agents
    for (const agentId of affectedRoutes) {
      // Trigger route recalculation for affected agent
      await this.updateAgentRoute({ id: agentId } as Agent);
      this.emit('route:recalculated', { agentId, timestamp: Date.now() });
    }
  }

  /**
   * Optimize network paths using topology information.
   */
  private async optimizeNetworkPaths(): Promise<void> {
    if (!this.networkTopology) return;

    // Use network optimizer to find better paths
    for (const [agentId, routingEntry] of this.routingTable) {
      const optimizedPath = await this.networkOptimizer.selectOptimalPath(
        'source',
        agentId
      );

      // Update routes with optimized path
      const optimizedRoute = {
        destination: agentId,
        latency: await this.calculatePathLatency(optimizedPath),
        bandwidth: await this.calculatePathBandwidth(optimizedPath),
        reliability: this.calculatePathReliability(optimizedPath),
        qosLevel: 1,
        path: optimizedPath,
      };

      // Merge with existing routes
      routingEntry.routes = [...routingEntry.routes, optimizedRoute];
    }
  }

  /**
   * Update reliability scores based on historical performance.
   */
  private async updateReliabilityScores(): Promise<void> {
    for (const [agentId, routingEntry] of this.routingTable) {
      // Calculate new reliability based on recent performance
      const newReliability = await this.calculateAgentReliability({
        id: agentId,
      } as Agent);

      // Update using exponential moving average
      const alpha = 0.2;
      routingEntry.reliability =
        (1 - alpha) * routingEntry.reliability + alpha * newReliability;
    }
  }

  /**
   * Balance load across available routes.
   */
  private async balanceRouteLoad(): Promise<void> {
    // Implement load balancing across routes
    // This would adjust route preferences based on current load
  }

  // Helper methods for measurements and calculations
  private async measureLatency(endpoint: string): Promise<number> {
    // Mock latency measurement
    return 50 + Math.random() * 200;
  }

  private async measureBandwidth(endpoint: string): Promise<number> {
    // Mock bandwidth measurement
    return 1000 + Math.random() * 5000;
  }

  private async calculateAgentReliability(agent: Agent): Promise<number> {
    // Mock reliability calculation based on historical data
    return 0.85 + Math.random() * 0.15;
  }

  private async calculateAverageLatency(agent: Agent): Promise<number> {
    // Mock average latency calculation
    return 100 + Math.random() * 500;
  }

  private calculateAverageBandwidth(routingEntry: RoutingTable): number {
    if (routingEntry.routes.length === 0) return 0;

    return (
      routingEntry.routes.reduce((sum, route) => sum + route.bandwidth, 0) /
      routingEntry.routes.length
    );
  }

  private async calculateQoSScore(
    task: Task,
    routingEntry: RoutingTable
  ): Promise<number> {
    // Calculate QoS score based on task requirements
    // This would consider task priority, SLA requirements, etc.
    return 0.8 + Math.random() * 0.2;
  }

  private calculateConfidence(routingEntry: RoutingTable, task: Task): number {
    // Calculate confidence in routing decision
    const reliabilityFactor = routingEntry.reliability;
    const routeCountFactor = Math.min(1, routingEntry.routes.length / 3);
    const freshnessFactory = this.calculateFreshnessFactor(
      routingEntry.lastUpdate
    );

    return (reliabilityFactor + routeCountFactor + freshnessFactory) / 3;
  }

  private calculateFreshnessFactor(lastUpdate: Date): number {
    const ageMs = Date.now() - lastUpdate.getTime();
    const maxAge = this.routingConfig.routeUpdateInterval * 2;

    return Math.max(0, 1 - ageMs / maxAge);
  }

  private calculateExpectedQuality(decision: RoutingDecision): number {
    return (
      decision.confidence * 0.8 +
      (decision.qosGuarantees.availability || 0.9) * 0.2
    );
  }

  private calculateQoSGuarantees(route: RouteEntry): QoSRequirement {
    return {
      maxLatency: route.latency * 1.2, // 20% buffer
      minThroughput: route.bandwidth * 0.8, // 80% guarantee
      maxErrorRate: 1 - route.reliability,
      availability: route.reliability,
    };
  }

  private async calculatePathLatency(path: string[]): Promise<number> {
    // Calculate total latency for a path
    return 100 + path.length * 20;
  }

  private async calculatePathBandwidth(path: string[]): Promise<number> {
    // Calculate minimum bandwidth along path
    return Math.max(100, 1000 - path.length * 100);
  }

  private calculatePathReliability(path: string[]): number {
    // Calculate overall path reliability
    const baseReliability = 0.95;
    return baseReliability ** path.length;
  }

  private calculateQoSLevel(
    latency: number,
    bandwidth: number,
    reliability: number
  ): number {
    // Calculate QoS level from 1-5
    const latencyScore = Math.max(0, 1 - latency / 1000);
    const bandwidthScore = Math.min(1, bandwidth / 5000);
    const reliabilityScore = reliability;

    const avgScore = (latencyScore + bandwidthScore + reliabilityScore) / 3;
    return Math.ceil(avgScore * 5);
  }
}
