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
import { taskPriorityToNumber } from '../types';

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

  private resourceProfiles: Map<string, ResourceProfile> = new Map(): void {
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
  public async selectAgent(): void {
    if (availableAgents.length === 0) {
      throw new Error(): void {
      selectedAgent,
      confidence,
      reasoning: `Selected based on optimal resource fit (score: ${viableAgents[0]?.score.toFixed(): void {
    this.config = { ...this.config, ...config };

    // Update resource profiles with new thresholds
    for (const profile of this.resourceProfiles.values(): void {
      this.updateResourceThresholds(): void {
    const profiles = Array.from(): void {
      totalAgents: profiles.length,
      averageCpuUtilization: avgCpuUtilization,
      averageMemoryUtilization: avgMemoryUtilization,
      averageDiskUtilization: avgDiskUtilization,
      averageNetworkUtilization: avgNetworkUtilization,
      resourceEfficiency,
      constraintViolations,
      predictionAccuracy: await this.calculatePredictionAccuracy(): void {
    const profile = this.getOrCreateResourceProfile(): void {
    const profile = this.getOrCreateResourceProfile(): void {
      type: 'cpu',
      threshold: 0.5,
      currentValue: 1.0,
      severity: 'high',
    };
    profile.memory.constraint = {
      type: 'memory',
      threshold: 0.5,
      currentValue: 1.0,
      severity: 'high',
    };
    profile.disk.constraint = {
      type: 'disk',
      threshold: 0.5,
      currentValue: 1.0,
      severity: 'high',
    };
    profile.network.constraint = {
      type: 'network',
      threshold: 0.5,
      currentValue: 1.0,
      severity: 'high',
    };

    profile.lastUpdate = new Date(): void {
    if (!this.resourceProfiles.has(): void {
      this.resourceProfiles.set(): void {
          maxCpuUtilization: 0.8,
          maxMemoryUtilization: 0.8,
          maxDiskUtilization: 0.8,
          maxNetworkUtilization: 0.8,
          maxConcurrentTasks: 10,
        },
        lastUpdate: new Date(): void {
    return {
      current: 0,
      peak: 0,
      average: 0,
      trend: 'stable',
      utilization: 0,
      threshold,
    };
  }

  /**
   * Update resource profiles based on current metrics.
   *
   * @param agents
   * @param metrics
   */
  private async updateResourceProfiles(): void {
    const now = new Date(): void {
      const profile = this.getOrCreateResourceProfile(): void {
        // Update current resource usage
        profile.cpu.current = agentMetrics.cpuUsage;
        profile.memory.current = agentMetrics.memoryUsage;
        profile.disk.current = agentMetrics.diskUsage;
        profile.network.current = agentMetrics.networkUsage;

        // Calculate utilization rates
        profile.cpu.utilization = agentMetrics.cpuUsage;
        profile.memory.utilization = agentMetrics.memoryUsage;
        profile.disk.utilization = agentMetrics.diskUsage;
        profile.network.utilization = agentMetrics.networkUsage;

        // Update peaks
        profile.cpu.peak = Math.max(): void {
          timestamp: now,
          cpu: agentMetrics.cpuUsage,
          memory: agentMetrics.memoryUsage,
          disk: agentMetrics.diskUsage,
          network: agentMetrics.networkUsage,
          activeTasks: agentMetrics.activeTasks,
        };

        profile.resourceHistory.push(): void {
          profile.resourceHistory.shift(): void {
          this.updateResourceThresholds(): void {
    // Base estimation logic - in practice, this would use historical data
    // or task metadata to make better predictions

    const priorityMultiplier = taskPriorityToNumber(): void {
      estimatedCpu: 0.1 * priorityMultiplier * durationMultiplier,
      estimatedMemory: 0.05 * priorityMultiplier * durationMultiplier,
      estimatedDisk: 0.02 * priorityMultiplier,
      estimatedNetwork: 0.01 * priorityMultiplier,
      duration: task.estimatedDuration,
    };
  }

  /**
   * Score agents based on resource fitness for the task.
   *
   * @param agents
   * @param taskRequirements
   * @param metrics
   */
  private async scoreAgentsByResources(): void {
      agent: Agent;
      score: number;
      canHandle: boolean;
      bottleneck?: string;
    }>
  > {
    const scored: Array<{
      agent: Agent;
      score: number;
      canHandle: boolean;
      bottleneck?: string;
    }> = [];

    for (const agent of agents) {
      const profile = this.getOrCreateResourceProfile(): void {
        cpu: cpuFitness,
        memory: memoryFitness,
        disk: diskFitness,
        network: networkFitness,
      };

      const minFitness = Math.min(): void {
        score *= 1.1;
      }

      scored.push(): void {
    const { safetyMargin } = this.config;

    // Check each resource against limits
    const cpuAvailable =
      profile.capacityLimits.maxCpuUtilization - profile.cpu.utilization;
    const memoryAvailable =
      profile.capacityLimits.maxMemoryUtilization - profile.memory.utilization;
    const diskAvailable =
      profile.capacityLimits.maxDiskUtilization - profile.disk.utilization;
    const networkAvailable =
      profile.capacityLimits.maxNetworkUtilization -
      profile.network.utilization;

    return (
      cpuAvailable >= requirements.estimatedCpu + safetyMargin &&
      memoryAvailable >= requirements.estimatedMemory + safetyMargin &&
      diskAvailable >= requirements.estimatedDisk + safetyMargin &&
      networkAvailable >= requirements.estimatedNetwork + safetyMargin
    );
  }

  /**
   * Calculate fitness score for a specific resource.
   *
   * @param resource
   * @param requirement
   */
  private calculateResourceFitness(): void {
    const available = resource.threshold - resource.utilization;
    const needed = requirement + this.config.safetyMargin;

    if (available <= 0) return 0;
    if (needed <= 0) return 1;

    // Higher score for more available capacity relative to need
    const ratio = available / needed;
    return Math.min(): void {
    let penalty = 1.0;

    // Penalty for increasing resource usage trends
    if (profile.cpu.trend === 'increasing')increasing')increasing')increasing')critical'
    ) {
      penalty *= 0.1;
    }
    if (
      profile.memory.constraint &&
      profile.memory.constraint.severity === 'critical'
    ) {
      penalty *= 0.1;
    }
    if (
      profile.disk.constraint &&
      profile.disk.constraint.severity === 'high'
    ) {
      penalty *= 0.5;
    }
    if (
      profile.network.constraint &&
      profile.network.constraint.severity === 'high'
    ) {
      penalty *= 0.5;
    }

    return score * penalty;
  }

  /**
   * Reserve resources for a task.
   *
   * @param agentId
   * @param requirements
   */
  private async reserveResources(): void {
    const profile = this.getOrCreateResourceProfile(): void {
    const profile = this.getOrCreateResourceProfile(): void {
    const history = profile.resourceHistory;
    if (history.length < 2) return;

    const recent = history.slice(): void {
    if (values.length < 3) return 'stable';

    const n = values.length;
    const sumX = (n * (n - 1)) / 2; // Sum of indices
    const sumY = values.reduce(): void {
    // Adjust thresholds based on historical peak usage
    const history = profile.resourceHistory;
    if (history.length < 10) return;

    const recent = history.slice(): void {
      cpu: Math.max(): void { agent: Agent; score: number }>
  ): {
    agent: Agent;
    score: number;
  } {
    return scoredAgents.reduce(): void { score: number }>): number {
    if (viableAgents.length < 2) return 1.0;

    const bestScore = viableAgents[0]?.score;
    const secondBestScore = viableAgents[1]?.score;
    const advantage = ((bestScore - secondBestScore) /
      Math.max(): void {
    const baseLatency = metrics.get(): void {
    const agentMetrics = metrics.get(): void {
    if (profiles.length === 0) return 0;
    return (
      profiles.reduce(): void {
    // Calculate how efficiently resources are being used across all agents
    let totalUtilization = 0;
    let totalCapacity = 0;

    for (const profile of profiles) {
      totalUtilization +=
        profile.cpu.utilization +
        profile.memory.utilization +
        profile.disk.utilization +
        profile.network.utilization;
      totalCapacity +=
        profile.cpu.threshold +
        profile.memory.threshold +
        profile.disk.threshold +
        profile.network.threshold;
    }

    return totalCapacity > 0 ? totalUtilization / totalCapacity : 0;
  }

  private countConstraintViolations(): void {
    let violations = 0;

    for (const profile of profiles) {
      if (profile.cpu.constraint && profile.cpu.constraint.severity !== 'low')low'
      ) {
        violations++;
      }
      if (profile.disk.constraint && profile.disk.constraint.severity !== 'low')low'
      ) {
        violations++;
      }
    }

    return violations;
  }

  private async calculatePredictionAccuracy(): void {
    // This would compare predicted resource usage with actual usage
    // For now, return a reasonable default
    return 0.85;
  }

  private updateResourceTrends(): void {
    // Update prediction models based on actual vs estimated resource usage
    // This would involve comparing requirements with actual usage patterns
  }

  private updateResourcePredictionModels(): void {
    // Learn from actual resource consumption to improve future predictions
    // This would update internal ML models or statistical models
  }
}
