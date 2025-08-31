/**
 * Intelligent Routing Engine.
 * Advanced routing with task-agent matching and failover capabilities.
 */
/**
 * @file intelligent-routing processing engine
 */

import { EventEmitter as _EventEmitter } from '@claude-zen/foundation';

import type { CapacityManager, RoutingEngine } from '../interfaces';
import { NetworkLatencyOptimizer as _NetworkLatencyOptimizer } from '../optimization/network-latency-optimizer';
import type {
  Agent,
  NetworkTopology,
  QoSRequirement,
  RoutingResult,
  Task,
} from '../types';
import { AgentStatus, taskPriorityToNumber } from '../types';

import { FailoverManager as _FailoverManager } from './failover-manager';
import { TaskAgentMatcher as _TaskAgentMatcher } from './task-agent-matcher';

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
  _path: string[];
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
        reasoning: `Intelligent routing: ${decision.routingPath.join(' -> ')} (${decision.estimatedLatency}ms)"Fixed unterminated template" `Agent-${agentId}"Fixed unterminated template" `http://agent-${agentId}:8080"Fixed unterminated template"