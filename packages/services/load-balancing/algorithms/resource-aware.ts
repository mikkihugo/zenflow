/**
 * Resource-Aware Load Balancing Algorithm.
 * Multi-dimensional resource monitoring and intelligent scheduling.
 */
/**
 * @file Coordination system:resource-aware
 */

import type { LoadBalancingAlgorithm } from '../interfaces';
import type {
  Agent,
  LoadMetrics,
  ResourceConstraint,
  RoutingResult,
  Task,
} from '../types';
import { taskPriorityToNumber as _taskPriorityToNumber } from '../types';

interface ResourceProfile {
  agentId: string;
  cpu: ResourceMetric;
  memory: ResourceMetric;
  disk: ResourceMetric;
  network: ResourceMetric;
  customResources: Map<string, ResourceMetric>;
  resourceHistory: ResourceSnapshot[];
  capacityLimits: ResourceLimits;
  lastUpdate: Date;
}

interface ResourceMetric {
  current: number;
  peak: number;
  average: number;
  trend: 'increasing' | ' decreasing' | ' stable';
  utilization: number;
  threshold: number;
  constraint?: ResourceConstraint;
}

interface ResourceSnapshot {
  timestamp: Date;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  activeTasks: number;
}

interface ResourceLimits {
  maxCpuUtilization: number;
  maxMemoryUtilization: number;
  maxDiskUtilization: number;
  maxNetworkUtilization: number;
  maxConcurrentTasks: number;
}

interface TaskResourceRequirement {
  estimatedCpu: number;
  estimatedMemory: number;
  estimatedDisk: number;
  estimatedNetwork: number;
  duration: number;
}

export class ResourceAwareAlgorithm implements LoadBalancingAlgorithm {
  public readonly name = 'resource_aware';

  private resourceProfiles: Map<string, ResourceProfile> = new Map();
  private config = {
    historySize: 100,
    trendAnalysisWindow: 20,
    resourceWeights: {
      cpu: 0.3,
      memory: 0.3,
      disk: 0.2,
      network: 0.2,
    },
    safetyMargin: 0.1, // 10% safety margin
    predictionHorizon: 300000, // 5 minutes
    adaptiveThresholds: true,
    emergencyThresholds: {
      cpu: 0.95,
      memory: 0.95,
      disk: 0.9,
      network: 0.85,
    },
  };

  /**
   * Select agent based on multi-dimensional resource availability.
   *
   * @param task
   * @param availableAgents
   * @param metrics
   */
  public async selectAgent(
    task: Task,
    availableAgents: Agent[],
    metrics: Map<string, LoadMetrics>
  ): Promise<RoutingResult> {
    if (availableAgents.length === 0) {
      throw new Error('No available agents');
    }

    // Update resource profiles
    await this.updateResourceProfiles(availableAgents, metrics);

    // Estimate task resource requirements
    const taskRequirements = this.estimateTaskRequirements(task);

    // Score agents based on resource fitness
    const scoredAgents = await this.scoreAgentsByResources(
      availableAgents,
      taskRequirements,
      metrics
    );

    // Filter out agents that cannot handle the task
    const viableAgents = scoredAgents.filter((s) => s.canHandle);

    if (viableAgents.length === 0) {
      // All agents are overloaded, select least loaded
      const fallbackAgent = this.selectFallbackAgent(scoredAgents);
      return {
        selectedAgent: fallbackAgent.agent,
        confidence: 0.3,
        reasoning: 'All agents overloaded, selected least loaded as fallback',
        alternativeAgents: [],
        estimatedLatency: this.estimateLatency(
          fallbackAgent.agent,
          metrics,
          true
        ),
        expectedQuality: 0.4,
      };
    }

    // Sort by resource fitness score (higher is better)
    viableAgents.sort((a, b) => b.score - a.score);

    const selectedAgent = viableAgents[0]?.agent;
    const confidence = this.calculateConfidence(viableAgents);
    const alternatives = viableAgents.slice(1, 4).map((s) => s.agent);

    // Reserve resources for the task
    await this.reserveResources(selectedAgent?.id, taskRequirements);

    return {
      selectedAgent,
      confidence,
      reasoning: `Selected based on optimal resource fit (score: ${viableAgents[0]?.score.toFixed(2)})"Fixed unterminated template"