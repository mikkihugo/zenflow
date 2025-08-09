/**
 * Agent Capacity Manager.
 * Real-time capacity monitoring and dynamic adjustment system.
 */
/**
 * @file agent-capacity management system
 */



import type { CapacityManager } from '../interfaces';
import type { CapacityMetrics, LoadMetrics, ResourceConstraint } from '../types';
import { CapacityPredictor } from './capacity-predictor';
import { ResourceMonitor } from './resource-monitor';

interface AgentCapacityProfile {
  agentId: string;
  baseCapacity: number;
  currentCapacity: number;
  predictedCapacity: number;
  utilizationHistory: number[];
  performanceMetrics: PerformanceMetrics;
  resourceConstraints: ResourceConstraint[];
  adaptiveThresholds: AdaptiveThresholds;
  lastUpdate: Date;
  capacityTrend: 'increasing' | 'decreasing' | 'stable';
}

interface PerformanceMetrics {
  throughput: number;
  averageResponseTime: number;
  errorRate: number;
  successfulTasks: number;
  failedTasks: number;
  resourceEfficiency: number;
}

interface AdaptiveThresholds {
  cpuThreshold: number;
  memoryThreshold: number;
  diskThreshold: number;
  networkThreshold: number;
  responseTimeThreshold: number;
  errorRateThreshold: number;
}

interface CapacityAdjustment {
  agentId: string;
  oldCapacity: number;
  newCapacity: number;
  reason: string;
  confidence: number;
  timestamp: Date;
}

export class AgentCapacityManager implements CapacityManager {
  private capacityProfiles: Map<string, AgentCapacityProfile> = new Map();
  private capacityPredictor: CapacityPredictor;
  private resourceMonitor: ResourceMonitor;
  private adjustmentHistory: CapacityAdjustment[] = [];

  private config = {
    baseCapacity: 10,
    minCapacity: 1,
    maxCapacity: 100,
    adaptationRate: 0.1,
    utilizationWindow: 50, // Number of samples for utilization calculation
    thresholdAdaptationRate: 0.05,
    capacityBufferRatio: 0.1, // 10% buffer
    predictionHorizon: 300000, // 5 minutes
    emergencyThresholds: {
      cpu: 0.95,
      memory: 0.9,
      errorRate: 0.1,
      responseTime: 10000, // 10 seconds
    },
    autoScalingEnabled: true,
    constraintWeights: {
      cpu: 0.3,
      memory: 0.3,
      disk: 0.2,
      network: 0.2,
    },
  };

  constructor() {
    this.capacityPredictor = new CapacityPredictor();
    this.resourceMonitor = new ResourceMonitor();
  }

  /**
   * Get current capacity metrics for an agent.
   *
   * @param agentId
   */
  public async getCapacity(agentId: string): Promise<CapacityMetrics> {
    const profile = this.getOrCreateProfile(agentId);
    await this.updateProfile(profile);

    const resourceConstraints = this.evaluateResourceConstraints(profile);

    return {
      maxConcurrentTasks: profile.currentCapacity,
      currentUtilization: this.calculateCurrentUtilization(profile),
      availableCapacity: this.calculateAvailableCapacity(profile),
      predictedCapacity: profile.predictedCapacity,
      capacityTrend: profile.capacityTrend,
      resourceConstraints,
    };
  }

  /**
   * Predict capacity for a future time horizon.
   *
   * @param agentId
   * @param timeHorizon
   */
  public async predictCapacity(agentId: string, timeHorizon: number): Promise<number> {
    const profile = this.getOrCreateProfile(agentId);

    // Use capacity predictor for time-based prediction
    const prediction = await this.capacityPredictor.predict(profile, timeHorizon);

    return Math.max(this.config.minCapacity, Math.min(this.config.maxCapacity, prediction));
  }

  /**
   * Update capacity based on new metrics.
   *
   * @param agentId
   * @param metrics
   */
  public async updateCapacity(agentId: string, metrics: LoadMetrics): Promise<void> {
    const profile = this.getOrCreateProfile(agentId);

    // Update utilization history
    profile.utilizationHistory.push(metrics.activeTasks);
    if (profile.utilizationHistory.length > this.config.utilizationWindow) {
      profile.utilizationHistory.shift();
    }

    // Update performance metrics
    this.updatePerformanceMetrics(profile, metrics);

    // Update adaptive thresholds
    this.updateAdaptiveThresholds(profile, metrics);

    // Calculate new capacity
    const newCapacity = await this.calculateOptimalCapacity(profile, metrics);

    // Apply capacity adjustment if significant change
    if (Math.abs(newCapacity - profile.currentCapacity) >= 1) {
      await this.adjustCapacity(profile, newCapacity, 'performance_based');
    }

    // Update predicted capacity
    profile.predictedCapacity = await this.capacityPredictor.predict(
      profile,
      this.config.predictionHorizon
    );

    // Update capacity trend
    profile.capacityTrend = this.calculateCapacityTrend(profile);

    profile.lastUpdate = new Date();
  }

  /**
   * Check if capacity is available for required resources.
   *
   * @param agentId
   * @param requiredResources
   */
  public async isCapacityAvailable(
    agentId: string,
    requiredResources: Record<string, number>
  ): Promise<boolean> {
    const profile = this.getOrCreateProfile(agentId);
    const currentMetrics = await this.resourceMonitor.getCurrentMetrics(agentId);

    if (!currentMetrics) {
      return false; // No metrics available, assume not available
    }

    // Check resource constraints
    const constraints = this.evaluateResourceConstraints(profile);
    const criticalConstraints = constraints.filter((c) => c.severity === 'critical');

    if (criticalConstraints.length > 0) {
      return false; // Critical constraints prevent new tasks
    }

    // Check if current utilization plus required resources exceeds capacity
    const projectedUtilization = currentMetrics?.activeTasks + (requiredResources.tasks || 1);
    const availableCapacity = this.calculateAvailableCapacity(profile);

    return projectedUtilization <= availableCapacity;
  }

  /**
   * Get or create capacity profile for an agent.
   *
   * @param agentId
   */
  private getOrCreateProfile(agentId: string): AgentCapacityProfile {
    if (!this.capacityProfiles.has(agentId)) {
      this.capacityProfiles.set(agentId, {
        agentId,
        baseCapacity: this.config.baseCapacity,
        currentCapacity: this.config.baseCapacity,
        predictedCapacity: this.config.baseCapacity,
        utilizationHistory: [],
        performanceMetrics: {
          throughput: 0,
          averageResponseTime: 1000,
          errorRate: 0,
          successfulTasks: 0,
          failedTasks: 0,
          resourceEfficiency: 0.8,
        },
        resourceConstraints: [],
        adaptiveThresholds: {
          cpuThreshold: 0.8,
          memoryThreshold: 0.8,
          diskThreshold: 0.8,
          networkThreshold: 0.8,
          responseTimeThreshold: 5000,
          errorRateThreshold: 0.05,
        },
        lastUpdate: new Date(),
        capacityTrend: 'stable',
      });
    }
    return this.capacityProfiles.get(agentId)!;
  }

  /**
   * Update capacity profile with latest information.
   *
   * @param profile
   */
  private async updateProfile(profile: AgentCapacityProfile): Promise<void> {
    // Get latest resource metrics
    const currentMetrics = await this.resourceMonitor.getCurrentMetrics(profile.agentId);

    if (currentMetrics) {
      // Update resource constraints
      profile.resourceConstraints = this.evaluateResourceConstraints(profile, currentMetrics);

      // Update performance metrics
      this.updatePerformanceMetrics(profile, currentMetrics);
    }
  }

  /**
   * Calculate optimal capacity based on current performance.
   *
   * @param profile
   * @param metrics
   */
  private async calculateOptimalCapacity(
    profile: AgentCapacityProfile,
    metrics: LoadMetrics
  ): Promise<number> {
    let optimalCapacity = profile.currentCapacity;

    // Factor 1: Resource utilization
    const resourceScore = this.calculateResourceScore(metrics);

    // Factor 2: Performance metrics
    const performanceScore = this.calculatePerformanceScore(profile.performanceMetrics);

    // Factor 3: Historical utilization patterns
    const utilizationScore = this.calculateUtilizationScore(profile);

    // Factor 4: Predicted demand
    const demandScore = await this.calculateDemandScore(profile);

    // Combine scores to determine capacity adjustment
    const combinedScore =
      resourceScore * 0.3 + performanceScore * 0.3 + utilizationScore * 0.2 + demandScore * 0.2;

    // Adjust capacity based on combined score
    if (combinedScore > 0.8) {
      // High performance, can increase capacity
      optimalCapacity = Math.min(
        this.config.maxCapacity,
        profile.currentCapacity * (1 + this.config.adaptationRate)
      );
    } else if (combinedScore < 0.4) {
      // Low performance, should decrease capacity
      optimalCapacity = Math.max(
        this.config.minCapacity,
        profile.currentCapacity * (1 - this.config.adaptationRate)
      );
    }

    // Apply constraints
    optimalCapacity = this.applyConstraints(profile, optimalCapacity, metrics);

    return Math.round(optimalCapacity);
  }

  /**
   * Calculate resource utilization score.
   *
   * @param metrics
   */
  private calculateResourceScore(metrics: LoadMetrics): number {
    const weights = this.config.constraintWeights;

    // Higher available resources = higher score
    const cpuScore = Math.max(0, 1 - metrics.cpuUsage);
    const memoryScore = Math.max(0, 1 - metrics.memoryUsage);
    const diskScore = Math.max(0, 1 - metrics.diskUsage);
    const networkScore = Math.max(0, 1 - metrics.networkUsage);

    return (
      cpuScore * weights.cpu +
      memoryScore * weights.memory +
      diskScore * weights.disk +
      networkScore * weights.network
    );
  }

  /**
   * Calculate performance score.
   *
   * @param performance
   */
  private calculatePerformanceScore(performance: PerformanceMetrics): number {
    const errorScore = Math.max(0, 1 - performance.errorRate);
    const responseTimeScore = Math.max(0, 1 - performance.averageResponseTime / 10000);
    const efficiencyScore = performance.resourceEfficiency;

    return (errorScore + responseTimeScore + efficiencyScore) / 3;
  }

  /**
   * Calculate utilization pattern score.
   *
   * @param profile
   */
  private calculateUtilizationScore(profile: AgentCapacityProfile): number {
    const history = profile.utilizationHistory;
    if (history.length < 5) return 0.5; // Default score with insufficient data

    const avgUtilization = history.reduce((sum, val) => sum + val, 0) / history.length;
    const utilizationRatio = avgUtilization / profile.currentCapacity;

    // Optimal utilization is around 70-80%
    if (utilizationRatio >= 0.7 && utilizationRatio <= 0.8) {
      return 1.0; // Perfect utilization
    } else if (utilizationRatio < 0.5) {
      return 0.3; // Under-utilized
    } else if (utilizationRatio > 0.9) {
      return 0.2; // Over-utilized
    } else {
      return 0.7; // Good utilization
    }
  }

  /**
   * Calculate demand prediction score.
   *
   * @param profile
   */
  private async calculateDemandScore(profile: AgentCapacityProfile): Promise<number> {
    const predictedDemand = await this.capacityPredictor.predictDemand(
      profile,
      this.config.predictionHorizon
    );

    const currentCapacity = profile.currentCapacity;
    const demandRatio = predictedDemand / currentCapacity;

    // Score based on how well current capacity matches predicted demand
    if (demandRatio >= 0.8 && demandRatio <= 1.2) {
      return 1.0; // Well matched
    } else if (demandRatio < 0.5) {
      return 0.4; // Over-provisioned
    } else if (demandRatio > 1.5) {
      return 0.3; // Under-provisioned
    } else {
      return 0.7; // Reasonably matched
    }
  }

  /**
   * Apply constraints to capacity calculation.
   *
   * @param profile
   * @param proposedCapacity
   * @param metrics
   */
  private applyConstraints(
    profile: AgentCapacityProfile,
    proposedCapacity: number,
    metrics: LoadMetrics
  ): number {
    let constrainedCapacity = proposedCapacity;

    // Check resource constraints
    const constraints = this.evaluateResourceConstraints(profile, metrics);

    for (const constraint of constraints) {
      if (constraint.severity === 'critical') {
        // Critical constraints force capacity reduction
        constrainedCapacity = Math.min(constrainedCapacity, profile.currentCapacity * 0.5);
      } else if (constraint.severity === 'high') {
        // High severity constraints limit capacity growth
        constrainedCapacity = Math.min(constrainedCapacity, profile.currentCapacity);
      }
    }

    // Apply emergency thresholds
    if (metrics.cpuUsage > this.config.emergencyThresholds.cpu) {
      constrainedCapacity = Math.min(constrainedCapacity, profile.currentCapacity * 0.8);
    }

    if (metrics.memoryUsage > this.config.emergencyThresholds.memory) {
      constrainedCapacity = Math.min(constrainedCapacity, profile.currentCapacity * 0.8);
    }

    if (metrics.errorRate > this.config.emergencyThresholds.errorRate) {
      constrainedCapacity = Math.min(constrainedCapacity, profile.currentCapacity * 0.7);
    }

    return Math.max(this.config.minCapacity, constrainedCapacity);
  }

  /**
   * Evaluate resource constraints.
   *
   * @param profile
   * @param metrics
   */
  private evaluateResourceConstraints(
    profile: AgentCapacityProfile,
    metrics?: LoadMetrics
  ): ResourceConstraint[] {
    const constraints: ResourceConstraint[] = [];

    if (!metrics) {
      return constraints;
    }

    const thresholds = profile.adaptiveThresholds;

    // CPU constraint
    if (metrics.cpuUsage > thresholds.cpuThreshold) {
      constraints.push({
        type: 'cpu',
        threshold: thresholds.cpuThreshold,
        currentValue: metrics.cpuUsage,
        severity: this.calculateConstraintSeverity(metrics.cpuUsage, thresholds.cpuThreshold),
      });
    }

    // Memory constraint
    if (metrics.memoryUsage > thresholds.memoryThreshold) {
      constraints.push({
        type: 'memory',
        threshold: thresholds.memoryThreshold,
        currentValue: metrics.memoryUsage,
        severity: this.calculateConstraintSeverity(metrics.memoryUsage, thresholds.memoryThreshold),
      });
    }

    // Disk constraint
    if (metrics.diskUsage > thresholds.diskThreshold) {
      constraints.push({
        type: 'disk',
        threshold: thresholds.diskThreshold,
        currentValue: metrics.diskUsage,
        severity: this.calculateConstraintSeverity(metrics.diskUsage, thresholds.diskThreshold),
      });
    }

    // Network constraint
    if (metrics.networkUsage > thresholds.networkThreshold) {
      constraints.push({
        type: 'network',
        threshold: thresholds.networkThreshold,
        currentValue: metrics.networkUsage,
        severity: this.calculateConstraintSeverity(
          metrics.networkUsage,
          thresholds.networkThreshold
        ),
      });
    }

    return constraints;
  }

  /**
   * Calculate constraint severity based on threshold violation.
   *
   * @param currentValue
   * @param threshold
   */
  private calculateConstraintSeverity(
    currentValue: number,
    threshold: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    const violation = (currentValue - threshold) / threshold;

    if (violation > 0.3) return 'critical';
    if (violation > 0.2) return 'high';
    if (violation > 0.1) return 'medium';
    return 'low';
  }

  /**
   * Update performance metrics.
   *
   * @param profile
   * @param metrics
   */
  private updatePerformanceMetrics(profile: AgentCapacityProfile, metrics: LoadMetrics): void {
    const perf = profile.performanceMetrics;
    const alpha = this.config.adaptationRate;

    // Update using exponential moving average
    perf.throughput = (1 - alpha) * perf.throughput + alpha * metrics.throughput;
    perf.averageResponseTime =
      (1 - alpha) * perf.averageResponseTime + alpha * metrics.responseTime;
    perf.errorRate = (1 - alpha) * perf.errorRate + alpha * metrics.errorRate;

    // Update task counts
    if (metrics.errorRate > 0) {
      perf.failedTasks++;
    } else {
      perf.successfulTasks++;
    }

    // Calculate resource efficiency
    const resourceUtilization =
      (metrics.cpuUsage + metrics.memoryUsage + metrics.diskUsage + metrics.networkUsage) / 4;

    const taskEfficiency = metrics.activeTasks / profile.currentCapacity;
    perf.resourceEfficiency = (resourceUtilization + taskEfficiency) / 2;
  }

  /**
   * Update adaptive thresholds based on performance.
   *
   * @param profile
   * @param metrics
   */
  private updateAdaptiveThresholds(profile: AgentCapacityProfile, metrics: LoadMetrics): void {
    const thresholds = profile.adaptiveThresholds;
    const rate = this.config.thresholdAdaptationRate;

    // Adapt thresholds based on current performance
    if (metrics.errorRate < 0.01 && metrics.responseTime < 2000) {
      // Good performance, can increase thresholds slightly
      thresholds.cpuThreshold = Math.min(0.9, thresholds.cpuThreshold + rate);
      thresholds.memoryThreshold = Math.min(0.9, thresholds.memoryThreshold + rate);
    } else if (metrics.errorRate > 0.05 || metrics.responseTime > 5000) {
      // Poor performance, decrease thresholds
      thresholds.cpuThreshold = Math.max(0.5, thresholds.cpuThreshold - rate);
      thresholds.memoryThreshold = Math.max(0.5, thresholds.memoryThreshold - rate);
    }
  }

  /**
   * Calculate current utilization percentage.
   *
   * @param profile
   */
  private calculateCurrentUtilization(profile: AgentCapacityProfile): number {
    const history = profile.utilizationHistory;
    if (history.length === 0) return 0;

    const currentTasks = history[history.length - 1];
    return currentTasks / profile.currentCapacity;
  }

  /**
   * Calculate available capacity.
   *
   * @param profile
   */
  private calculateAvailableCapacity(profile: AgentCapacityProfile): number {
    const buffer = profile.currentCapacity * this.config.capacityBufferRatio;
    const effectiveCapacity = profile.currentCapacity - buffer;
    const currentUtilization = this.calculateCurrentUtilization(profile);

    return Math.max(0, effectiveCapacity - currentUtilization * profile.currentCapacity);
  }

  /**
   * Calculate capacity trend.
   *
   * @param profile
   */
  private calculateCapacityTrend(
    profile: AgentCapacityProfile
  ): 'increasing' | 'decreasing' | 'stable' {
    const history = profile.utilizationHistory;
    if (history.length < 10) return 'stable';

    const recent = history.slice(-10);
    const older = history.slice(-20, -10);

    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;

    const change = (recentAvg - olderAvg) / olderAvg;

    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  /**
   * Adjust agent capacity.
   *
   * @param profile
   * @param newCapacity
   * @param reason
   */
  private async adjustCapacity(
    profile: AgentCapacityProfile,
    newCapacity: number,
    reason: string
  ): Promise<void> {
    const oldCapacity = profile.currentCapacity;
    profile.currentCapacity = newCapacity;

    // Record adjustment
    const adjustment: CapacityAdjustment = {
      agentId: profile.agentId,
      oldCapacity,
      newCapacity,
      reason,
      confidence: this.calculateAdjustmentConfidence(profile),
      timestamp: new Date(),
    };

    this.adjustmentHistory.push(adjustment);

    // Limit history size
    if (this.adjustmentHistory.length > 1000) {
      this.adjustmentHistory.shift();
    }
  }

  /**
   * Calculate confidence in capacity adjustment.
   *
   * @param profile
   */
  private calculateAdjustmentConfidence(profile: AgentCapacityProfile): number {
    const historyLength = profile.utilizationHistory.length;
    const dataQuality = Math.min(1, historyLength / this.config.utilizationWindow);

    const performanceConsistency = this.calculatePerformanceConsistency(profile);

    return (dataQuality + performanceConsistency) / 2;
  }

  /**
   * Calculate performance consistency.
   *
   * @param profile
   */
  private calculatePerformanceConsistency(profile: AgentCapacityProfile): number {
    const perf = profile.performanceMetrics;
    const totalTasks = perf.successfulTasks + perf.failedTasks;

    if (totalTasks < 10) return 0.5; // Low confidence with few tasks

    const successRate = perf.successfulTasks / totalTasks;
    return successRate; // Use success rate as consistency measure
  }
}
