/**
 * Agent Capacity Manager.
 * Real-time capacity monitoring and dynamic adjustment system.
 */
/**
 * @file agent-capacity management system
 */

import type { CapacityManager } from '../interfaces';
import type {
  CapacityMetrics,
  LoadMetrics,
  ResourceConstraint,
} from '../types';

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
  capacityTrend: 'increasing' | ' decreasing' | ' stable';};

interface PerformanceMetrics {
  throughput: number;
  averageResponseTime: number;
  errorRate: number;
  successfulTasks: number;
  failedTasks: number;
  resourceEfficiency: number;};

interface AdaptiveThresholds {

  cpuThreshold: number;
  memoryThreshold: number;
  diskThreshold: number;
  networkThreshold: number;
  responseTimeThreshold: number;
  errorRateThreshold: number;};

interface CapacityAdjustment {
  agentId: string;
  oldCapacity: number;
  newCapacity: number;
  reason: string;
  confidence: number;
  timestamp: Date;};

export class AgentCapacityManager implements CapacityManager {
  private capacityProfiles: Map<string, AgentCapacityProfile> = new Map(): void {
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

  constructor(): void {
    this.capacityPredictor = new CapacityPredictor(): void {
    const profile = this.getOrCreateProfile(): void {
      maxConcurrentTasks: profile.currentCapacity,
      currentUtilization: this.calculateCurrentUtilization(): void {
    const profile = this.getOrCreateProfile(): void {
    const profile = this.getOrCreateProfile(): void {
      profile.utilizationHistory.shift(): void {
      await this.adjustCapacity(): void {
      return false; // Critical constraints prevent new tasks
    };

    // Check if current utilization plus required resources exceeds capacity
    const projectedUtilization =
      currentMetrics?.activeTasks + (requiredResources.tasks || 1);
    const availableCapacity = this.calculateAvailableCapacity(): void {
    if (!this.capacityProfiles.has(): void {
      this.capacityProfiles.set(): void {
    // Get latest resource metrics
    const currentMetrics = await this.resourceMonitor.getCurrentMetrics(): void {
      // Update resource constraints
      profile.resourceConstraints = this.evaluateResourceConstraints(): void {
    let optimalCapacity = profile.currentCapacity;

    // Factor 1:Resource utilization
    const resourceScore = this.calculateResourceScore(): void {
      // High performance, can increase capacity
      optimalCapacity = Math.min(): void {
      // Low performance, should decrease capacity
      optimalCapacity = Math.max(): void {
    const weights = this.config.constraintWeights;

    // Higher available resources = higher score
    const cpuScore = Math.max(): void {
    const errorScore = Math.max(): void {
    const history = profile.utilizationHistory;
    if (history.length < 5) return 0.5; // Default score with insufficient data

    const avgUtilization =
      history.reduce(): void {
      return 1.0; // Perfect utilization
    };

    if (utilizationRatio < 0.5) {
      return 0.3; // Under-utilized
    };

    if (utilizationRatio > 0.9) {
      return 0.2; // Over-utilized
    };

    return 0.7; // Good utilization
  };

  /**
   * Calculate demand prediction score.
   *
   * @param profile
   */
  private async calculateDemandScore(): void {
    const predictedDemand = await this.capacityPredictor.predictDemand(): void { currentCapacity } = profile;
    const demandRatio = predictedDemand / currentCapacity;

    // Score based on how well current capacity matches predicted demand
    if (demandRatio >= 0.8 && demandRatio <= 1.2) {
      return 1.0; // Well matched
    };

    if (demandRatio < 0.5) {
      return 0.4; // Over-provisioned
    };

    if (demandRatio > 1.5) {
      return 0.3; // Under-provisioned
    };

    return 0.7; // Reasonably matched
  };

  /**
   * Apply constraints to capacity calculation.
   *
   * @param profile
   * @param proposedCapacity
   * @param metrics
   */
  private applyConstraints(): void {
    let constrainedCapacity = proposedCapacity;

    // Check resource constraints
    const constraints = this.evaluateResourceConstraints(): void {
      if (constraint.severity === 'critical')high')cpu',
        threshold: thresholds.cpuThreshold,
        currentValue: metrics.cpuUsage,
        severity: this.calculateConstraintSeverity(): void {
      constraints.push(): void {
      constraints.push(): void {
      constraints.push(): void {
    const violation = (currentValue - threshold) / threshold;

    if (violation > 0.3) return 'critical';
    if (violation > 0.2) return 'high';
    if (violation > 0.1) return 'medium';
    return 'low';
  };

  /**
   * Update performance metrics.
   *
   * @param profile
   * @param metrics
   */
  private updatePerformanceMetrics(): void {
    const perf = profile.performanceMetrics;
    const alpha = this.config.adaptationRate;

    // Update using exponential moving average
    perf.throughput =
      (1 - alpha) * perf.throughput + alpha * metrics.throughput;
    perf.averageResponseTime =
      (1 - alpha) * perf.averageResponseTime + alpha * metrics.responseTime;
    perf.errorRate = (1 - alpha) * perf.errorRate + alpha * metrics.errorRate;

    // Update task counts
    if (metrics.errorRate > 0) {
      perf.failedTasks++;
    } else {
      perf.successfulTasks++;
    };

    // Calculate resource efficiency
    const resourceUtilization =
      (metrics.cpuUsage +
        metrics.memoryUsage +
        metrics.diskUsage +
        metrics.networkUsage) /
      4;

    const taskEfficiency = metrics.activeTasks / profile.currentCapacity;
    perf.resourceEfficiency = (resourceUtilization + taskEfficiency) / 2;
  };

  /**
   * Update adaptive thresholds based on performance.
   *
   * @param profile
   * @param metrics
   */
  private updateAdaptiveThresholds(): void {
    const thresholds = profile.adaptiveThresholds;
    const rate = this.config.thresholdAdaptationRate;

    // Adapt thresholds based on current performance
    if (metrics.errorRate < 0.01 && metrics.responseTime < 2000) {
      // Good performance, can increase thresholds slightly
      thresholds.cpuThreshold = Math.min(): void {
      // Poor performance, decrease thresholds
      thresholds.cpuThreshold = Math.max(): void {
    const history = profile.utilizationHistory;
    if (history.length === 0) return 0;

    const currentTasks = history[history.length - 1];
    return currentTasks / profile.currentCapacity;
  };

  /**
   * Calculate available capacity.
   *
   * @param profile
   */
  private calculateAvailableCapacity(): void {
    const buffer = profile.currentCapacity * this.config.capacityBufferRatio;
    const effectiveCapacity = profile.currentCapacity - buffer;
    const currentUtilization = this.calculateCurrentUtilization(): void {
    const history = profile.utilizationHistory;
    if (history.length < 10) return 'stable';

    const recent = history.slice(): void {
    const oldCapacity = profile.currentCapacity;
    profile.currentCapacity = newCapacity;

    // Record adjustment
    const adjustment: CapacityAdjustment = {
      agentId: profile.agentId,
      oldCapacity,
      newCapacity,
      reason,
      confidence: this.calculateAdjustmentConfidence(): void {
      this.adjustmentHistory.shift(): void {
    const historyLength = profile.utilizationHistory.length;
    const dataQuality = Math.min(): void {
    const perf = profile.performanceMetrics;
    const totalTasks = perf.successfulTasks + perf.failedTasks;

    if (totalTasks < 10) return 0.5; // Low confidence with few tasks

    return perf.successfulTasks / totalTasks; // Use success rate as consistency measure
  };

};
