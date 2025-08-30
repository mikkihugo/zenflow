/**
 * Agent Capacity Manager.
 * Real-time capacity monitoring and dynamic adjustment system.
 */
/**
 * @file agent-capacity management system
 */
import type { CapacityManager } from '../interfaces';
import type { CapacityMetrics, LoadMetrics } from '../types';
export declare class AgentCapacityManager implements CapacityManager {
  private capacityProfiles;
  private capacityPredictor;
  private resourceMonitor;
  private adjustmentHistory;
  private config;
  constructor();
  /**
   * Get current capacity metrics for an agent.
   *
   * @param agentId
   */
  getCapacity(agentId: string): Promise<CapacityMetrics>;
  /**
   * Predict capacity for a future time horizon.
   *
   * @param agentId
   * @param timeHorizon
   */
  predictCapacity(agentId: string, timeHorizon: number): Promise<number>;
  /**
   * Update capacity based on new metrics.
   *
   * @param agentId
   * @param metrics
   */
  updateCapacity(agentId: string, metrics: LoadMetrics): Promise<void>;
  /**
   * Check if capacity is available for required resources.
   *
   * @param agentId
   * @param requiredResources
   */
  isCapacityAvailable(
    agentId: string,
    requiredResources: Record<string, number>
  ): Promise<boolean>;
  /**
   * Get or create capacity profile for an agent.
   *
   * @param agentId
   */
  private getOrCreateProfile;
  /**
   * Update capacity profile with latest information.
   *
   * @param profile
   */
  private updateProfile;
  /**
   * Calculate optimal capacity based on current performance.
   *
   * @param profile
   * @param metrics
   */
  private calculateOptimalCapacity;
  /**
   * Calculate resource utilization score.
   *
   * @param metrics
   */
  private calculateResourceScore;
  /**
   * Calculate performance score.
   *
   * @param performance
   */
  private calculatePerformanceScore;
  /**
   * Calculate utilization pattern score.
   *
   * @param profile
   */
  private calculateUtilizationScore;
  /**
   * Calculate demand prediction score.
   *
   * @param profile
   */
  private calculateDemandScore;
  /**
   * Apply constraints to capacity calculation.
   *
   * @param profile
   * @param proposedCapacity
   * @param metrics
   */
  private applyConstraints;
  /**
   * Evaluate resource constraints.
   *
   * @param profile
   * @param metrics
   */
  private evaluateResourceConstraints;
  /**
   * Calculate constraint severity based on threshold violation.
   *
   * @param currentValue
   * @param threshold
   */
  private calculateConstraintSeverity;
  /**
   * Update performance metrics.
   *
   * @param profile
   * @param metrics
   */
  private updatePerformanceMetrics;
  /**
   * Update adaptive thresholds based on performance.
   *
   * @param profile
   * @param metrics
   */
  private updateAdaptiveThresholds;
  /**
   * Calculate current utilization percentage.
   *
   * @param profile
   */
  private calculateCurrentUtilization;
  /**
   * Calculate available capacity.
   *
   * @param profile
   */
  private calculateAvailableCapacity;
  /**
   * Calculate capacity trend.
   *
   * @param profile
   */
  private calculateCapacityTrend;
  /**
   * Adjust agent capacity.
   *
   * @param profile
   * @param newCapacity
   * @param reason
   */
  private adjustCapacity;
  /**
   * Calculate confidence in capacity adjustment.
   *
   * @param profile
   */
  private calculateAdjustmentConfidence;
  /**
   * Calculate performance consistency.
   *
   * @param profile
   */
  private calculatePerformanceConsistency;
}
//# sourceMappingURL=agent-capacity-manager.d.ts.map
