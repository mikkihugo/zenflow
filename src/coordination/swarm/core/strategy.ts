/**
 * @file Strategy Pattern Implementation for Swarm Coordination
 * Provides flexible coordination strategies for different swarm topologies.
 */

import { EventEmitter } from 'node:events';
import type { Agent } from '../../types';

// Core strategy interfaces with strong typing
export interface CoordinationContext {
  swarmId: string;
  timestamp: Date;
  resources: ResourceMetrics;
  constraints: CoordinationConstraints;
  history: CoordinationHistory[];
  agents: Agent[];
}

export interface CoordinationResult {
  topology: SwarmTopology;
  performance: PerformanceMetrics;
  connections?: ConnectionMap;
  leadership?: LeadershipInfo;
  latency: number;
  success: boolean;
  recommendations?: string[];
}

export interface StrategyMetrics {
  latency: number;
  throughput: number;
  reliability: number;
  scalability: number;
  resourceEfficiency: number;
}

export interface ResourceMetrics {
  cpu: number;
  memory: number;
  network: number;
  storage: number;
}

export interface CoordinationConstraints {
  maxLatency: number;
  minReliability: number;
  resourceLimits: ResourceMetrics;
  securityLevel: 'low' | 'medium' | 'high';
}

export interface CoordinationHistory {
  timestamp: Date;
  action: string;
  agentId: string;
  result: 'success' | 'failure';
  metrics: Partial<StrategyMetrics>;
}

export interface ConnectionMap {
  [agentId: string]: string[];
}

export interface LeadershipInfo {
  leaders: string[];
  hierarchy: { [level: number]: string[] };
  maxDepth: number;
}

export interface PerformanceMetrics {
  executionTime: number;
  messageCount: number;
  coordinationEfficiency: number;
  resourceUtilization: ResourceMetrics;
}

export type SwarmTopology = 'mesh' | 'hierarchical' | 'ring' | 'star';

// Generic strategy interface with type safety
export interface CoordinationStrategy<T extends Agent = Agent> {
  coordinate(agents: T[], context: CoordinationContext): Promise<CoordinationResult>;
  getMetrics(): StrategyMetrics;
  getTopologyType(): SwarmTopology;
  validateContext(context: CoordinationContext): boolean;
  optimize(agents: T[], history: CoordinationHistory[]): Promise<void>;
}

// Mesh Strategy Implementation - Full connectivity
export class MeshStrategy implements CoordinationStrategy<Agent> {
  private metrics: StrategyMetrics = {
    latency: 50,
    throughput: 1000,
    reliability: 0.99,
    scalability: 0.85,
    resourceEfficiency: 0.75,
  };

  async coordinate(agents: Agent[], context: CoordinationContext): Promise<CoordinationResult> {
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

  getMetrics(): StrategyMetrics {
    return { ...this.metrics };
  }

  getTopologyType(): SwarmTopology {
    return 'mesh';
  }

  validateContext(context: CoordinationContext): boolean {
    return (
      context.resources.network > 0.3 && // Mesh requires good network
      context.constraints.maxLatency > 100
    ); // Allow for mesh overhead
  }

  async optimize(_agents: Agent[], history: CoordinationHistory[]): Promise<void> {
    // Analyze historical performance and adjust metrics
    const avgLatency =
      history
        .filter((h) => h.metrics.latency)
        .reduce((sum, h) => sum + (h.metrics.latency || 0), 0) / history.length;

    if (avgLatency > 0) {
      this.metrics.latency = Math.min(this.metrics.latency * 0.9, avgLatency * 1.1);
    }
  }

  private establishMeshConnections(agents: Agent[]): ConnectionMap {
    const connections: ConnectionMap = {};

    agents.forEach((agent) => {
      connections[agent.id] = agents
        .filter((other) => other.id !== agent.id)
        .map((other) => other.id);
    });

    return connections;
  }

  private async calculateMeshPerformance(
    agents: Agent[],
    connections: ConnectionMap
  ): Promise<PerformanceMetrics> {
    const connectionCount = Object.values(connections).reduce(
      (sum, conns) => sum + conns.length,
      0
    );

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

  private measureLatency(connections: ConnectionMap, context: CoordinationContext): number {
    const baseLatency = 50;
    const networkFactor = (1 - context.resources.network) * 100;
    const scaleFactor = Object.keys(connections).length * 2;

    return baseLatency + networkFactor + scaleFactor;
  }

  private generateRecommendations(agents: Agent[], performance: PerformanceMetrics): string[] {
    const recommendations: string[] = [];

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
export class HierarchicalStrategy implements CoordinationStrategy<Agent> {
  private metrics: StrategyMetrics = {
    latency: 75,
    throughput: 800,
    reliability: 0.95,
    scalability: 0.95,
    resourceEfficiency: 0.9,
  };

  async coordinate(agents: Agent[], context: CoordinationContext): Promise<CoordinationResult> {
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

  getMetrics(): StrategyMetrics {
    return { ...this.metrics };
  }

  getTopologyType(): SwarmTopology {
    return 'hierarchical';
  }

  validateContext(context: CoordinationContext): boolean {
    return (
      context.resources.cpu > 0.2 && // Need CPU for leader election
      context.agents.length > 5
    ); // Hierarchical makes sense with more agents
  }

  async optimize(agents: Agent[], history: CoordinationHistory[]): Promise<void> {
    // Optimize based on leadership effectiveness
    const leadershipChanges = history.filter((h) => h.action.includes('leader'));
    if (leadershipChanges.length > agents.length * 0.1) {
      this.metrics.reliability *= 0.95; // Frequent leadership changes reduce reliability
    }
  }

  private async buildHierarchy(
    agents: Agent[],
    _context: CoordinationContext
  ): Promise<LeadershipInfo> {
    // Simple hierarchy builder - can be enhanced with agent capabilities
    const leaders: string[] = [];
    const hierarchy: { [level: number]: string[] } = {};

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

  private optimizeHierarchy(hierarchy: LeadershipInfo, agents: Agent[]): PerformanceMetrics {
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

  private calculateHierarchicalLatency(hierarchy: LeadershipInfo): number {
    return 50 + hierarchy.maxDepth * 25; // Latency increases with depth
  }

  private generateHierarchicalRecommendations(
    agents: Agent[],
    hierarchy: LeadershipInfo
  ): string[] {
    const recommendations: string[] = [];

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
export class RingStrategy implements CoordinationStrategy<Agent> {
  private metrics: StrategyMetrics = {
    latency: 100,
    throughput: 600,
    reliability: 0.85,
    scalability: 0.7,
    resourceEfficiency: 0.95,
  };

  async coordinate(agents: Agent[], context: CoordinationContext): Promise<CoordinationResult> {
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

  getMetrics(): StrategyMetrics {
    return { ...this.metrics };
  }

  getTopologyType(): SwarmTopology {
    return 'ring';
  }

  validateContext(context: CoordinationContext): boolean {
    return (
      context.resources.network > 0.1 && // Minimal network requirements
      context.constraints.maxLatency > 200
    ); // Ring can have higher latency
  }

  async optimize(agents: Agent[], history: CoordinationHistory[]): Promise<void> {
    // Optimize based on ring failures
    const failures = history.filter((h) => h.result === 'failure').length;
    if (failures > agents.length * 0.1) {
      this.metrics.reliability *= 0.9; // Ring is vulnerable to single points of failure
    }
  }

  private establishRingConnections(agents: Agent[]): ConnectionMap {
    const connections: ConnectionMap = {};

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

  private calculateRingPerformance(agents: Agent[]): PerformanceMetrics {
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

  private calculateRingLatency(agentCount: number): number {
    return 50 + agentCount * 10; // Latency increases linearly with ring size
  }

  private generateRingRecommendations(agents: Agent[]): string[] {
    const recommendations: string[] = [];

    if (agents.length > 15) {
      recommendations.push('Large ring detected - consider hierarchical or mesh topology');
    }

    recommendations.push('Implement ring failure detection and recovery mechanisms');

    return recommendations;
  }
}

// Star Strategy Implementation - Central hub coordination
export class StarStrategy implements CoordinationStrategy<Agent> {
  private metrics: StrategyMetrics = {
    latency: 30,
    throughput: 1200,
    reliability: 0.8,
    scalability: 0.6,
    resourceEfficiency: 0.85,
  };

  async coordinate(agents: Agent[], context: CoordinationContext): Promise<CoordinationResult> {
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

  getMetrics(): StrategyMetrics {
    return { ...this.metrics };
  }

  getTopologyType(): SwarmTopology {
    return 'star';
  }

  validateContext(context: CoordinationContext): boolean {
    return context.resources.cpu > 0.3; // Hub needs good CPU resources
  }

  async optimize(_agents: Agent[], history: CoordinationHistory[]): Promise<void> {
    // Optimize based on hub performance
    const hubFailures = history.filter(
      (h) => h.result === 'failure' && h.action.includes('hub')
    ).length;
    if (hubFailures > 0) {
      this.metrics.reliability *= 0.85; // Hub failures significantly impact reliability
    }
  }

  private selectHub(agents: Agent[]): Agent {
    // Select agent with most capabilities as hub
    return agents.reduce((best, current) =>
      current.capabilities.length > best.capabilities.length ? current : best
    );
  }

  private establishStarConnections(agents: Agent[], hub: Agent): ConnectionMap {
    const connections: ConnectionMap = {};

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

  private calculateStarPerformance(agents: Agent[], _hub: Agent): PerformanceMetrics {
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

  private calculateStarLatency(): number {
    return 30; // Low latency due to direct hub communication
  }

  private generateStarRecommendations(agents: Agent[], hub: Agent): string[] {
    const recommendations: string[] = [];

    recommendations.push(`Hub agent ${hub.id} is critical - implement failover mechanisms`);

    if (agents.length > 25) {
      recommendations.push('Large star topology - consider hierarchical structure');
    }

    return recommendations;
  }
}

// Context with runtime strategy switching and optimization
export class SwarmCoordinator<T extends Agent = Agent> extends EventEmitter {
  private strategy: CoordinationStrategy<T>;
  private history: CoordinationHistory[] = [];
  private optimizationInterval: number = 10; // Optimize every 10 coordinations

  constructor(strategy: CoordinationStrategy<T>) {
    super();
    this.strategy = strategy;
  }

  setStrategy(strategy: CoordinationStrategy<T>): void {
    this.strategy = strategy;
    this.logStrategyChange(strategy.getTopologyType());
  }

  async executeCoordination(
    agents: T[],
    contextData?: Partial<CoordinationContext>
  ): Promise<CoordinationResult> {
    const context = this.buildContext(agents, contextData);
    const startTime = Date.now();

    try {
      const result = await this.strategy.coordinate(agents, context);

      // Record successful coordination
      this.recordHistory(agents, 'coordinate', 'success', {
        latency: result.latency,
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
        latency: result.latency,
      });

      return result;
    } catch (error) {
      // Record failed coordination
      this.recordHistory(agents, 'coordinate', 'failure', {
        latency: Date.now() - startTime,
      });
      throw error;
    }
  }

  getStrategy(): CoordinationStrategy<T> {
    return this.strategy;
  }

  getHistory(): CoordinationHistory[] {
    return [...this.history];
  }

  clearHistory(): void {
    this.history = [];
  }

  // Auto-select optimal strategy based on context and agent characteristics
  async autoSelectStrategy(
    agents: T[],
    context: CoordinationContext
  ): Promise<CoordinationStrategy<T>> {
    const strategies = [
      new MeshStrategy(),
      new HierarchicalStrategy(),
      new RingStrategy(),
      new StarStrategy(),
    ] as CoordinationStrategy<T>[];

    // Score each strategy based on context
    const scores = strategies.map((strategy) => ({
      strategy,
      score: this.scoreStrategy(strategy, agents, context),
    }));

    // Select highest scoring strategy
    const best = scores.reduce((best, current) => (current.score > best.score ? current : best));

    return best.strategy;
  }

  private buildContext(
    agents: T[],
    contextData?: Partial<CoordinationContext>
  ): CoordinationContext {
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
      agents: agents as Agent[],
      ...contextData,
    };
  }

  private logStrategyChange(_topology: SwarmTopology): void {}

  private recordHistory(
    agents: T[],
    action: string,
    result: 'success' | 'failure',
    metrics?: Partial<StrategyMetrics>
  ): void {
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

  private scoreStrategy(
    strategy: CoordinationStrategy<T>,
    agents: T[],
    context: CoordinationContext
  ): number {
    const metrics = strategy.getMetrics();
    let score = 0;

    // Score based on context requirements
    if (context.constraints.maxLatency > metrics.latency) score += 20;
    if (context.constraints.minReliability <= metrics.reliability) score += 30;

    // Score based on agent count (scalability)
    if (agents.length <= 10) {
      score += strategy.getTopologyType() === 'star' ? 20 : 10;
    } else if (agents.length <= 50) {
      score += strategy.getTopologyType() === 'hierarchical' ? 20 : 10;
    } else {
      score += strategy.getTopologyType() === 'mesh' ? 20 : 10;
    }

    // Score based on resource availability
    score += metrics.resourceEfficiency * context.resources.cpu * 10;

    return score;
  }
}

// Factory for creating strategies
export class StrategyFactory {
  static createStrategy(topology: SwarmTopology): CoordinationStrategy {
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

  static getAllStrategies(): CoordinationStrategy[] {
    return [new MeshStrategy(), new HierarchicalStrategy(), new RingStrategy(), new StarStrategy()];
  }
}
