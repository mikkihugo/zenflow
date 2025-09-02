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
      reasoning: `Selected based on optimal resource fit (score: ${  viableAgents[0]?.score.toFixed(2)  })`,
      alternativeAgents: alternatives,
      estimatedLatency: this.estimateLatency(selectedAgent, metrics, false),
      expectedQuality: this.estimateQuality(selectedAgent, metrics),
    };
  }

  /**
   * Update algorithm configuration.
   *
   * @param config
   */
  public async updateConfiguration(
    config: Record<string, unknown>
  ): Promise<void> {
    this.config = { ...this.config, ...config };

    // Update resource profiles with new thresholds
    for (const profile of this.resourceProfiles.values()) {
      this.updateResourceThresholds(profile);
    }
  }

  /**
   * Get performance metrics.
   */
  public async getPerformanceMetrics(): Promise<Record<string, number>> {
    const profiles = Array.from(this.resourceProfiles.values());

    const avgCpuUtilization = this.calculateAverageUtilization(profiles, 'cpu');
    const avgMemoryUtilization = this.calculateAverageUtilization(
      profiles,
      'memory'
    );
    const avgDiskUtilization = this.calculateAverageUtilization(
      profiles,
      'disk'
    );
    const avgNetworkUtilization = this.calculateAverageUtilization(
      profiles,
      'network'
    );

    const resourceEfficiency = this.calculateResourceEfficiency(profiles);
    const constraintViolations = this.countConstraintViolations(profiles);

    return {
      totalAgents: profiles.length,
      averageCpuUtilization: avgCpuUtilization,
      averageMemoryUtilization: avgMemoryUtilization,
      averageDiskUtilization: avgDiskUtilization,
      averageNetworkUtilization: avgNetworkUtilization,
      resourceEfficiency,
      constraintViolations,
      predictionAccuracy: await this.calculatePredictionAccuracy(),
    };
  }

  /**
   * Handle task completion.
   *
   * @param agentId
   * @param task
   * @param duration
   * @param success
   */
  public async onTaskComplete(
    agentId: string,
    task: Task,
    duration: number,
    success: boolean
  ): Promise<void> {
    const profile = this.getOrCreateResourceProfile(agentId);

    // Release reserved resources
    const taskRequirements = this.estimateTaskRequirements(task);
    await this.releaseResources(agentId, taskRequirements, duration, success);

    // Update resource trends based on actual usage
    this.updateResourceTrends(profile, taskRequirements, duration, success);
  }

  /**
   * Handle agent failure.
   *
   * @param agentId
   * @param error
   */
  public async onAgentFailure(agentId: string, error: Error): Promise<void> {
    const profile = this.getOrCreateResourceProfile(agentId);

    // Mark all resources as potentially compromised
    profile.cpu.constraint = {
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

    profile.lastUpdate = new Date();
  }

  /**
   * Get or create resource profile for an agent.
   *
   * @param agentId
   */
  private getOrCreateResourceProfile(agentId: string): ResourceProfile {
    if (!this.resourceProfiles.has(agentId)) {
      this.resourceProfiles.set(agentId, {
        agentId,
        cpu: this.createResourceMetric(0.8),
        memory: this.createResourceMetric(0.8),
        disk: this.createResourceMetric(0.8),
        network: this.createResourceMetric(0.8),
        customResources: new Map(),
        resourceHistory: [],
        capacityLimits: {
          maxCpuUtilization: 0.8,
          maxMemoryUtilization: 0.8,
          maxDiskUtilization: 0.8,
          maxNetworkUtilization: 0.8,
          maxConcurrentTasks: 10,
        },
        lastUpdate: new Date(),
      });
    }
    return this.resourceProfiles.get(agentId)!;
  }

  /**
   * Create a resource metric with default values.
   *
   * @param threshold
   */
  private createResourceMetric(threshold: number): ResourceMetric {
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
  private async updateResourceProfiles(
    agents: Agent[],
    metrics: Map<string, LoadMetrics>
  ): Promise<void> {
    const now = new Date();

    for (const agent of agents) {
      const profile = this.getOrCreateResourceProfile(agent.id);
      const agentMetrics = metrics.get(agent.id);

      if (agentMetrics) {
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
        profile.cpu.peak = Math.max(profile.cpu.peak, agentMetrics.cpuUsage);
        profile.memory.peak = Math.max(
          profile.memory.peak,
          agentMetrics.memoryUsage
        );
        profile.disk.peak = Math.max(profile.disk.peak, agentMetrics.diskUsage);
        profile.network.peak = Math.max(
          profile.network.peak,
          agentMetrics.networkUsage
        );

        // Add to history
        const snapshot: ResourceSnapshot = {
          timestamp: now,
          cpu: agentMetrics.cpuUsage,
          memory: agentMetrics.memoryUsage,
          disk: agentMetrics.diskUsage,
          network: agentMetrics.networkUsage,
          activeTasks: agentMetrics.activeTasks,
        };

        profile.resourceHistory.push(snapshot);
        if (profile.resourceHistory.length > this.config.historySize) {
          profile.resourceHistory.shift();
        }

        // Update averages and trends
        this.updateResourceAveragesAndTrends(profile);

        // Update thresholds if adaptive thresholds are enabled
        if (this.config.adaptiveThresholds) {
          this.updateResourceThresholds(profile);
        }

        profile.lastUpdate = now;
      }
    }
  }

  /**
   * Estimate resource requirements for a task.
   *
   * @param task
   */
  private estimateTaskRequirements(task: Task): TaskResourceRequirement {
    // Base estimation logic - in practice, this would use historical data
    // or task metadata to make better predictions

    const priorityMultiplier = taskPriorityToNumber(task.priority) / 3; // Scale by priority
    const durationMultiplier = Math.min(2, task.estimatedDuration / 60000); // Scale by duration

    return {
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
  private async scoreAgentsByResources(
    agents: Agent[],
    taskRequirements: TaskResourceRequirement,
    metrics: Map<string, LoadMetrics>
  ): Promise<
    Array<{
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
      const profile = this.getOrCreateResourceProfile(agent.id);
      const agentMetrics = metrics.get(agent.id);

      // Check if agent can handle the task
      const canHandle = this.canHandleTask(profile, taskRequirements);
      // Calculate resource fitness score
      let score = 0;
      const weights = this.config.resourceWeights;

      // CPU fitness
      const cpuFitness = this.calculateResourceFitness(
        profile.cpu,
        taskRequirements.estimatedCpu
      );
      score += cpuFitness * weights.cpu;

      // Memory fitness
      const memoryFitness = this.calculateResourceFitness(
        profile.memory,
        taskRequirements.estimatedMemory
      );
      score += memoryFitness * weights.memory;

      // Disk fitness
      const diskFitness = this.calculateResourceFitness(
        profile.disk,
        taskRequirements.estimatedDisk
      );
      score += diskFitness * weights.disk;

      // Network fitness
      const networkFitness = this.calculateResourceFitness(
        profile.network,
        taskRequirements.estimatedNetwork
      );
      score += networkFitness * weights.network;

      // Identify bottleneck resource
      const resourceFitness = {
        cpu: cpuFitness,
        memory: memoryFitness,
        disk: diskFitness,
        network: networkFitness,
      };

      const minFitness = Math.min(...Object.values(resourceFitness));
      const bottleneck = Object.keys(resourceFitness).find(
        (key) =>
          resourceFitness[key as keyof typeof resourceFitness] === minFitness
      );

      // Apply penalties for trends and constraints
      score = this.applyTrendPenalties(score, profile);
      score = this.applyConstraintPenalties(score, profile);

      // Bonus for low error rate
      if (agentMetrics && agentMetrics.errorRate < 0.01) {
        score *= 1.1;
      }

      scored.push({ agent, score, canHandle, bottleneck });
    }

    return scored;
  }

  /**
   * Check if an agent can handle a task based on resource constraints.
   *
   * @param profile
   * @param requirements
   */
  private canHandleTask(
    profile: ResourceProfile,
    requirements: TaskResourceRequirement
  ): boolean {
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
  private calculateResourceFitness(
    resource: ResourceMetric,
    requirement: number
  ): number {
    const available = resource.threshold - resource.utilization;
    const needed = requirement + this.config.safetyMargin;

    if (available <= 0) return 0;
    if (needed <= 0) return 1;

    // Higher score for more available capacity relative to need
    const ratio = available / needed;
    return Math.min(1, Math.max(0, Math.log10(ratio + 1)));
  }

  /**
   * Apply penalties based on resource trends.
   *
   * @param score
   * @param profile
   */
  private applyTrendPenalties(score: number, profile: ResourceProfile): number {
    let penalty = 1.0;

    // Penalty for increasing resource usage trends
    if (profile.cpu.trend === 'increasing') penalty *= 0.9;
    if (profile.memory.trend === 'increasing') penalty *= 0.9;
    if (profile.disk.trend === 'increasing') penalty *= 0.95;
    if (profile.network.trend === 'increasing') penalty *= 0.95;

    return score * penalty;
  }

  /**
   * Apply penalties based on resource constraints.
   *
   * @param score
   * @param profile
   */
  private applyConstraintPenalties(
    score: number,
    profile: ResourceProfile
  ): number {
    let penalty = 1.0;

    // Check for active constraints
    if (
      profile.cpu.constraint &&
      profile.cpu.constraint.severity === 'critical'
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
  private async reserveResources(
    agentId: string,
    requirements: TaskResourceRequirement
  ): Promise<void> {
    const profile = this.getOrCreateResourceProfile(agentId);

    // Temporarily increase utilization to reserve resources
    profile.cpu.utilization += requirements.estimatedCpu;
    profile.memory.utilization += requirements.estimatedMemory;
    profile.disk.utilization += requirements.estimatedDisk;
    profile.network.utilization += requirements.estimatedNetwork;
  }

  /**
   * Release resources after task completion.
   *
   * @param agentId
   * @param requirements
   * @param actualDuration
   * @param success
   */
  private async releaseResources(
    agentId: string,
    requirements: TaskResourceRequirement,
    actualDuration: number,
    success: boolean
  ): Promise<void> {
    const profile = this.getOrCreateResourceProfile(agentId);

    // Release reserved resources
    profile.cpu.utilization = Math.max(
      0,
      profile.cpu.utilization - requirements.estimatedCpu
    );
    profile.memory.utilization = Math.max(
      0,
      profile.memory.utilization - requirements.estimatedMemory
    );
    profile.disk.utilization = Math.max(
      0,
      profile.disk.utilization - requirements.estimatedDisk
    );
    profile.network.utilization = Math.max(
      0,
      profile.network.utilization - requirements.estimatedNetwork
    );

    // Learn from actual vs estimated usage for future predictions
    this.updateResourcePredictionModels(
      profile,
      requirements,
      actualDuration,
      success
    );
  }

  /**
   * Update resource averages and trend analysis.
   *
   * @param profile
   */
  private updateResourceAveragesAndTrends(profile: ResourceProfile): void {
    const history = profile.resourceHistory;
    if (history.length < 2) return;

    const recent = history.slice(-this.config.trendAnalysisWindow);

    // Update averages
    profile.cpu.average =
      recent.reduce((sum, s) => sum + s.cpu, 0) / recent.length;
    profile.memory.average =
      recent.reduce((sum, s) => sum + s.memory, 0) / recent.length;
    profile.disk.average =
      recent.reduce((sum, s) => sum + s.disk, 0) / recent.length;
    profile.network.average =
      recent.reduce((sum, s) => sum + s.network, 0) / recent.length;

    // Update trends using linear regression
    profile.cpu.trend = this.calculateTrend(recent.map((s) => s.cpu));
    profile.memory.trend = this.calculateTrend(recent.map((s) => s.memory));
    profile.disk.trend = this.calculateTrend(recent.map((s) => s.disk));
    profile.network.trend = this.calculateTrend(recent.map((s) => s.network));
  }

  /**
   * Calculate trend using simple linear regression.
   *
   * @param values
   */
  private calculateTrend(
    values: number[]
  ): 'increasing' | ' decreasing' | ' stable' {
    if (values.length < 3) return 'stable';

    const n = values.length;
    const sumX = (n * (n - 1)) / 2; // Sum of indices
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, idx) => sum + idx * val, 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6; // Sum of squared indices

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    if (slope > 0.01) return 'increasing';
    if (slope < -0.01) return 'decreasing';
    return 'stable';
  }

  /**
   * Update adaptive resource thresholds.
   *
   * @param profile
   */
  private updateResourceThresholds(profile: ResourceProfile): void {
    // Adjust thresholds based on historical peak usage
    const history = profile.resourceHistory;
    if (history.length < 10) return;

    const recent = history.slice(-20);
    const peaks = {
      cpu: Math.max(...recent.map((s) => s.cpu)),
      memory: Math.max(...recent.map((s) => s.memory)),
      disk: Math.max(...recent.map((s) => s.disk)),
      network: Math.max(...recent.map((s) => s.network)),
    };

    // Set thresholds slightly above recent peaks
    profile.cpu.threshold = Math.min(0.9, peaks.cpu * 1.2);
    profile.memory.threshold = Math.min(0.9, peaks.memory * 1.2);
    profile.disk.threshold = Math.min(0.9, peaks.disk * 1.2);
    profile.network.threshold = Math.min(0.9, peaks.network * 1.2);
  }

  // Additional helper methods for metrics and calculations...

  private selectFallbackAgent(
    scoredAgents: Array<{ agent: Agent; score: number }>
  ): {
    agent: Agent;
    score: number;
  } {
    return scoredAgents.reduce((best, current) =>
      current?.score > best.score ? current : best
    );
  }

  private calculateConfidence(viableAgents: Array<{ score: number }>): number {
    if (viableAgents.length < 2) return 1.0;

    const bestScore = viableAgents[0]?.score;
    const secondBestScore = viableAgents[1]?.score;
    const advantage = ((bestScore - secondBestScore) /
      Math.max(bestScore, 0.1)) as any;

    return Math.min(1.0, Math.max(0.3, advantage + 0.5));
  }

  private estimateLatency(
    agent: Agent,
    metrics: Map<string, LoadMetrics>,
    isOverloaded: boolean
  ): number {
    const baseLatency = metrics.get(agent.id)?.responseTime || 1000;
    return isOverloaded ? baseLatency * 2 : baseLatency;
  }

  private estimateQuality(
    agent: Agent,
    metrics: Map<string, LoadMetrics>
  ): number {
    const agentMetrics = metrics.get(agent.id);
    return agentMetrics ? Math.max(0.1, 1 - agentMetrics.errorRate) : 0.8;
  }

  private calculateAverageUtilization(
    profiles: ResourceProfile[],
    resource: keyof Pick<
      ResourceProfile,
      'cpu' | ' memory' | ' disk' | ' network'
    >
  ): number {
    if (profiles.length === 0) return 0;
    return (
      profiles.reduce((sum, p) => sum + p[resource]?.utilization, 0) /
      profiles.length
    );
  }

  private calculateResourceEfficiency(profiles: ResourceProfile[]): number {
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

  private countConstraintViolations(profiles: ResourceProfile[]): number {
    let violations = 0;

    for (const profile of profiles) {
      if (profile.cpu.constraint && profile.cpu.constraint.severity !== 'low')
        violations++;
      if (
        profile.memory.constraint &&
        profile.memory.constraint.severity !== 'low'
      ) {
        violations++;
      }
      if (profile.disk.constraint && profile.disk.constraint.severity !== 'low')
        violations++;
      if (
        profile.network.constraint &&
        profile.network.constraint.severity !== 'low'
      ) {
        violations++;
      }
    }

    return violations;
  }

  private async calculatePredictionAccuracy(): Promise<number> {
    // This would compare predicted resource usage with actual usage
    // For now, return a reasonable default
    return 0.85;
  }

  private updateResourceTrends(
    _profile: ResourceProfile,
    _requirements: TaskResourceRequirement,
    _duration: number,
    _success: boolean
  ): void {
    // Update prediction models based on actual vs estimated resource usage
    // This would involve comparing requirements with actual usage patterns
  }

  private updateResourcePredictionModels(
    _profile: ResourceProfile,
    _requirements: TaskResourceRequirement,
    _actualDuration: number,
    _success: boolean
  ): void {
    // Learn from actual resource consumption to improve future predictions
    // This would update internal ML models or statistical models
  }
}
