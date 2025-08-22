/**
 * @fileoverview Task Flow Intelligence - Light ML Integration
 *
 * Integrates with @claude-zen/brain for intelligent task flow optimization.
 * Provides predictive analytics, adaptive thresholds, and smart recommendations
 * without heavy ML overhead.
 *
 * @author Claude-Zen Team
 * @since 2.0.0
 * @version 2.0.0 - Brain Integration
 */

import type { Logger } from '@claude-zen/foundation';
import { getLogger } from '@claude-zen/foundation';
import type { TaskFlowState, TaskFlowStatus } from '../types/task-flow-types';

// Light Brain integration - only what we need for task flow
interface BrainPredictor {
  predictBottleneck(flowHistory: FlowMetric[]): Promise<BottleneckPrediction>;
  optimizeThreshold(
    approvalHistory: ApprovalMetric[]
  ): Promise<ThresholdRecommendation>;
  learnFromDecisions(decisions: DecisionOutcome[]): Promise<void>;
}

interface FlowMetric {
  timestamp: number;
  state: TaskFlowState;
  wipUsage: number;
  queueDepth: number;
  throughput: number;
}

interface ApprovalMetric {
  timestamp: number;
  confidence: number;
  humanDecision: boolean;
  approved: boolean;
  responseTime: number;
}

interface DecisionOutcome {
  predictionAccurate: boolean;
  humanOverride: boolean;
  outcomePositive: boolean;
}

interface BottleneckPrediction {
  state: TaskFlowState;
  probability: number;
  timeToBottleneck: number;
  recommendedActions: string[];
}

interface ThresholdRecommendation {
  currentThreshold: number;
  recommendedThreshold: number;
  confidence: number;
  reasoning: string;
}

/**
 * Task Flow Intelligence System
 *
 * Lightweight ML integration for:
 * - Bottleneck prediction
 * - Threshold optimization
 * - Decision learning
 * - Capacity forecasting
 */
export class TaskFlowIntelligence {
  private readonly logger: Logger;
  private brainPredictor?: BrainPredictor;
  private flowHistory: FlowMetric[] = [];
  private approvalHistory: ApprovalMetric[] = [];
  private isLearningEnabled: boolean = true;

  constructor() {
    this.logger = getLogger('TaskFlowIntelligence');
    this.initializeBrain();
  }

  /**
   * Initialize lightweight WASM prediction (if available)
   */
  private async initializeBrain(): Promise<void> {
    try {
      // Try to load lightweight WASM predictor from your brain's WASM module
      const wasmModule = await import('../wasm/task-flow-predictor.wasm');

      this.brainPredictor = {
        predictBottleneck: async (history) => {
          // Use WASM for fast mathematical prediction
          const result = wasmModule.predict_bottleneck(
            new Float32Array(history.map((h) => h.wipUsage)),
            new Float32Array(history.map((h) => h.queueDepth)),
            new Float32Array(history.map((h) => h.throughput))
          );

          return {
            state: result.state,
            probability: result.probability,
            timeToBottleneck: result.timeToBottleneck,
            recommendedActions: result.actions,
          };
        },

        optimizeThreshold: async (history) => {
          const result = wasmModule.optimize_threshold(
            new Float32Array(history.map((h) => h.confidence)),
            new Uint8Array(history.map((h) => (h.approved ? 1 : 0)))
          );

          return {
            currentThreshold: result.current,
            recommendedThreshold: result.recommended,
            confidence: result.confidence,
            reasoning: result.reasoning,
          };
        },

        learnFromDecisions: async (outcomes) => {
          // Update WASM model with new decision outcomes
          wasmModule.learn_from_decisions(
            new Uint8Array(outcomes.map((o) => (o.predictionAccurate ? 1 : 0))),
            new Uint8Array(outcomes.map((o) => (o.outcomePositive ? 1 : 0)))
          );
        },
      };

      this.logger.info('TaskFlow intelligence initialized with WASM predictor');
    } catch (error) {
      this.logger.info(
        'WASM predictor not available - using statistical methods',
        { error }
      );
      // Use pure JavaScript statistical methods (no external dependencies)
    }
  }

  /**
   * Predict potential bottlenecks based on flow history
   */
  async predictBottlenecks(
    currentStatus: TaskFlowStatus
  ): Promise<BottleneckPrediction[]> {
    // Record current metrics
    this.recordFlowMetrics(currentStatus);

    if (this.brainPredictor) {
      // Use neural prediction
      const predictions: BottleneckPrediction[] = [];

      for (const [state, usage] of Object.entries(currentStatus.wipUsage)) {
        const prediction = await this.brainPredictor.predictBottleneck(
          this.getRecentFlowHistory(state as TaskFlowState)
        );
        predictions.push(prediction);
      }

      return predictions.filter((p) => p.probability > 0.7);
    } else {
      // Fallback to statistical prediction
      return this.statisticalBottleneckPrediction(currentStatus);
    }
  }

  /**
   * Optimize approval thresholds based on human decision patterns
   */
  async optimizeApprovalThresholds(
    gateId: string
  ): Promise<ThresholdRecommendation> {
    const gateHistory = this.approvalHistory.filter(
      (h) => h.timestamp > Date.now() - 7 * 24 * 60 * 60 * 1000 // Last 7 days
    );

    if (this.brainPredictor && gateHistory.length > 10) {
      return await this.brainPredictor.optimizeThreshold(gateHistory);
    } else {
      // Fallback to statistical optimization
      return this.statisticalThresholdOptimization(gateHistory);
    }
  }

  /**
   * Learn from approval decisions to improve future predictions
   */
  async learnFromApprovalDecision(
    originalConfidence: number,
    humanDecision: boolean,
    approved: boolean,
    outcomePositive: boolean,
    responseTime: number
  ): Promise<void> {
    if (!this.isLearningEnabled) return;

    // Record approval metric
    this.approvalHistory.push({
      timestamp: Date.now(),
      confidence: originalConfidence,
      humanDecision,
      approved,
      responseTime,
    });

    // Learn from outcome
    if (this.brainPredictor) {
      await this.brainPredictor.learnFromDecisions([
        {
          predictionAccurate: originalConfidence > 0.8 === approved,
          humanOverride: humanDecision,
          outcomePositive,
        },
      ]);
    }

    // Cleanup old history (keep last 1000 entries)
    if (this.approvalHistory.length > 1000) {
      this.approvalHistory = this.approvalHistory.slice(-1000);
    }
  }

  /**
   * Get smart recommendations for flow optimization
   */
  async getFlowRecommendations(
    currentStatus: TaskFlowStatus
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // Bottleneck predictions
    const bottlenecks = await this.predictBottlenecks(currentStatus);
    for (const bottleneck of bottlenecks) {
      recommendations.push(...bottleneck.recommendedActions);
    }

    // Threshold optimizations
    for (const [state, queue] of Object.entries(currentStatus.approvalQueues)) {
      if (queue.pending > 3) {
        const optimization = await this.optimizeApprovalThresholds(state);
        if (
          optimization.recommendedThreshold !== optimization.currentThreshold
        ) {
          recommendations.push(
            `Adjust ${state} threshold from ${optimization.currentThreshold} to ${optimization.recommendedThreshold} (${optimization.reasoning})`
          );
        }
      }
    }

    // Capacity recommendations
    if (currentStatus.systemCapacity.utilizationPercent > 80) {
      recommendations.push(
        'System approaching capacity - consider pausing low-priority task intake'
      );
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }

  /**
   * Forecast capacity needs based on historical trends
   */
  async forecastCapacity(hoursAhead: number = 24): Promise<{
    expectedLoad: number;
    requiredCapacity: number;
    riskLevel: 'low|medium|high';
    recommendations: string[];
  }> {
    const recentMetrics = this.flowHistory.slice(-100); // Last 100 data points

    if (recentMetrics.length < 10) {
      return {
        expectedLoad: 0.5,
        requiredCapacity: 1.0,
        riskLevel: 'low',
        recommendations: ['Insufficient data for accurate forecasting'],
      };
    }

    // Simple trend analysis (can be enhanced with brain predictions)
    const avgThroughput =
      recentMetrics.reduce((sum, m) => sum + m.throughput, 0) /
      recentMetrics.length;
    const expectedLoad = avgThroughput * hoursAhead;

    const maxQueueDepth = Math.max(...recentMetrics.map((m) => m.queueDepth));
    const requiredCapacity = expectedLoad + maxQueueDepth * 0.2; // 20% buffer

    let riskLevel: 'low|medium|high' = 'low';
    if (requiredCapacity > 0.8) riskLevel = 'high';
    else if (requiredCapacity > 0.6) riskLevel = 'medium';

    const recommendations: string[] = [];
    if (riskLevel === 'high') {
      recommendations.push(
        'High capacity risk - consider increasing reviewer availability'
      );
      recommendations.push('Enable emergency auto-approval for low-risk tasks');
    }

    return { expectedLoad, requiredCapacity, riskLevel, recommendations };
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private recordFlowMetrics(status: TaskFlowStatus): void {
    for (const [state, usage] of Object.entries(status.wipUsage)) {
      this.flowHistory.push({
        timestamp: Date.now(),
        state: state as TaskFlowState,
        wipUsage: usage.utilization,
        queueDepth: status.approvalQueues[`${state}-gate`]?.pending||0,
        throughput: this.calculateThroughput(state as TaskFlowState),
      });
    }

    // Keep only recent history (last 1000 entries)
    if (this.flowHistory.length > 1000) {
      this.flowHistory = this.flowHistory.slice(-1000);
    }
  }

  private getRecentFlowHistory(state: TaskFlowState): FlowMetric[] {
    return this.flowHistory.filter((h) => h.state === state).slice(-50); // Last 50 data points for this state
  }

  private statisticalBottleneckPrediction(
    status: TaskFlowStatus
  ): BottleneckPrediction[] {
    const predictions: BottleneckPrediction[] = [];

    for (const [state, usage] of Object.entries(status.wipUsage)) {
      if (usage.utilization > 0.8) {
        predictions.push({
          state: state as TaskFlowState,
          probability: Math.min(usage.utilization, 0.95),
          timeToBottleneck: (1 - usage.utilization) * 60 * 60 * 1000, // Hours to bottleneck
          recommendedActions: [
            `Increase WIP limit for ${state}`,
            `Review ${state} capacity allocation`,
            `Consider spillover routing for ${state}`,
          ],
        });
      }
    }

    return predictions;
  }

  private statisticalThresholdOptimization(
    history: ApprovalMetric[]
  ): ThresholdRecommendation {
    if (history.length < 5) {
      return {
        currentThreshold: 0.8,
        recommendedThreshold: 0.8,
        confidence: 0.1,
        reasoning:'Insufficient data for optimization',
      };
    }

    // Find optimal threshold based on human approval patterns
    const humanApprovals = history.filter((h) => h.humanDecision);
    const avgConfidenceApproved =
      humanApprovals
        .filter((h) => h.approved)
        .reduce((sum, h) => sum + h.confidence, 0) /
      humanApprovals.filter((h) => h.approved).length;

    const avgConfidenceRejected =
      humanApprovals
        .filter((h) => !h.approved)
        .reduce((sum, h) => sum + h.confidence, 0) /
      humanApprovals.filter((h) => !h.approved).length;

    const optimalThreshold =
      (avgConfidenceApproved + avgConfidenceRejected) / 2;

    return {
      currentThreshold: 0.8,
      recommendedThreshold: Math.max(0.5, Math.min(0.95, optimalThreshold)),
      confidence: 0.7,
      reasoning: `Based on ${history.length} approval decisions, humans approve ${Math.round(avgConfidenceApproved * 100)}% confident tasks and reject ${Math.round(avgConfidenceRejected * 100)}% confident tasks`,
    };
  }

  private calculateThroughput(state: TaskFlowState): number {
    const recentHistory = this.flowHistory.filter(
      (h) => h.state === state && h.timestamp > Date.now() - 60 * 60 * 1000
    ).length; // Last hour

    return recentHistory / 60; // Tasks per minute
  }
}

/**
 * Factory function to create task flow intelligence
 */
export function createTaskFlowIntelligence(): TaskFlowIntelligence {
  return new TaskFlowIntelligence();
}

// =============================================================================
// EXPORTS
// =============================================================================

export type {
  BottleneckPrediction,
  ThresholdRecommendation,
  FlowMetric,
  ApprovalMetric,
};
