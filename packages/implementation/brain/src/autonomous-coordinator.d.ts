/**
 * @fileoverview Autonomous Coordinator - Self-Governing Brain System
 *
 * Extends the brain with autonomous decision-making capabilities across
 * all aspects of coordination, optimization, and system management.
 * Makes intelligent decisions without human intervention.
 *
 * Features:
 * - Autonomous resource allocation
 * - Self-tuning performance parameters
 * - Intelligent agent selection and routing
 * - Automatic system optimization
 * - Self-healing and recovery
 * - Dynamic load balancing
 * - Predictive scaling
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 */
import type { AutonomousOptimizationEngine } from './autonomous-optimization-engine';
import type { BehavioralIntelligence } from './behavioral-intelligence';
export interface SystemMetrics {
  readonly cpuUsage: number;
  readonly memoryUsage: number;
  readonly taskQueueLength: number;
  readonly activeAgents: number;
  readonly averageResponseTime: number;
  readonly errorRate: number;
  readonly throughput: number;
  readonly timestamp: number;
}
export interface AutonomousDecision {
  readonly type: 'resource_allocation|agent_routing|performance_tuning|scaling|optimization;
  readonly action: string;
  readonly reasoning: string[];
  readonly confidence: number;
  readonly expectedImpact: number;
  readonly timestamp: number;
  readonly parameters: Record<string, any>;
}
export interface ScalingDecision {
  readonly action: 'scale_up|scale_down|maintain|optimize;
  readonly targetAgents: number;
  readonly confidence: number;
  readonly reasoning: string;
  readonly urgency: 'low|medium|high|critical;
}
/**
 * Autonomous Coordinator - Self-Governing Brain System
 *
 * Makes intelligent decisions across all aspects of system operation
 * without requiring human intervention. Continuously learns and adapts.
 */
export declare class AutonomousCoordinator {
  private behavioralIntelligence;
  private optimizationEngine;
  private initialized;
  private systemMetricsHistory;
  private decisionHistory;
  private performanceBaselines;
  private autonomousConfig;
  constructor();
  /**
   * Initialize autonomous coordination system
   */
  initialize(
    behavioralIntelligence?: BehavioralIntelligence,
    optimizationEngine?: AutonomousOptimizationEngine
  ): Promise<void>;
  /**
   * Autonomous system monitoring and decision making
   */
  autonomousSystemMonitoring(
    currentMetrics: SystemMetrics
  ): Promise<AutonomousDecision[]>;
  /**
   * Autonomous resource allocation and management
   */
  private autonomousResourceManagement;
  /**
   * Autonomous agent routing and selection
   */
  private autonomousAgentRouting;
  /**
   * Autonomous performance tuning
   */
  private autonomousPerformanceTuning;
  /**
   * Autonomous scaling decisions
   */
  private autonomousScaling;
  /**
   * Autonomous system optimization
   */
  private autonomousSystemOptimization;
  /**
   * Self-tuning of autonomous parameters
   */
  private autonomousParameterTuning;
  /**
   * Get autonomous decision insights
   */
  getAutonomousInsights(): {
    totalDecisions: number;
    decisionsByType: Record<string, number>;
    averageConfidence: number;
    recentTrends: string[];
    systemHealth: 'excellent|good|fair|poor;
    autonomyLevel: number;
  };
  private calculatePressureLevel;
  private calculateResponseTimePressure;
  private analyzeRoutingEfficiency;
  private calculateScalingDecision;
  private adjustParametersForType;
  private calculateSystemHealth;
  private generateRecentTrends;
  private initializeBaselines;
  private startAutonomousMonitoring;
  /**
   * Analyze response time metrics against thresholds for resource decisions
   */
  private analyzeResponseTimeMetrics;
}
export default AutonomousCoordinator;
//# sourceMappingURL=autonomous-coordinator.d.ts.map
