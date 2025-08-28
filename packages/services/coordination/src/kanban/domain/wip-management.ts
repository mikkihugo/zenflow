/**
 * @fileoverview WIP Management Domain Service
 *
 * Pure domain logic for Work-In-Progress limit management and optimization.
 * Handles WIP limits, capacity tracking, and optimization strategies.
 *
 * **Responsibilities:**
 * - WIP limit enforcement
 * - Capacity utilization monitoring
 * - WIP optimization strategies
 * - Limit recommendation algorithms
 *
 * **Domain Rules:**
 * - WIP limits prevent workflow overload
 * - Utilization tracking guides optimization
 * - Dynamic limits adapt to team capacity
 * - Intelligent recommendations improve flow
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

import { getLogger } from '@claude-zen/foundation';
import type {
  TaskState,
  WIPLimits,
  WorkflowTask,
} from '../types/index';
import { ImmutableWIPUtils, ValidationUtils } from '../utilities/index';
const logger = getLogger('WIPManagement'');

/**
 * WIP check result interface
 */
export interface WIPCheckResult {
  allowed: boolean;
  currentCount: number;
  limit: number;
  utilization: number;
  recommendation?: string;
}

/**
 * WIP optimization recommendation
 */
export interface WIPOptimizationRecommendation {
  state: TaskState;
  currentLimit: number;
  recommendedLimit: number;
  reason: string;
  confidence: number;
  expectedImpact: number;
}

/**
 * WIP Management Domain Service
 *
 * Handles all WIP limit operations with intelligent optimization.
 * Pure domain logic focused on flow optimization principles.
 */
export class WIPManagementService {
  private wipLimits: WIPLimits;
  private utilizationHistory: Record<TaskState, number[]> = {} as Record<TaskState, number[]>;

  constructor(initialLimits: WIPLimits) {
    this.wipLimits = { ...initialLimits };
    logger.info('WIPManagementService initialized with limits:,this.wipLimits');
  }

  /**
   * Check WIP limits for a specific state
   */
  async checkWIPLimits(state: TaskState, currentTasks: WorkflowTask[]): Promise<WIPCheckResult> {
    const tasksInState = currentTasks.filter(task => task.state === state);
    const currentCount = tasksInState.length;
    const limit = this.wipLimits[state];
    const utilization = limit > 0 ? currentCount / limit : 0;

    // Track utilization for optimization
    this.trackUtilization(state, utilization);

    const result: WIPCheckResult = {
      allowed: currentCount < limit,
      currentCount,
      limit,
      utilization,
    };

    // Add recommendation if at high utilization
    if (utilization > 0.8) {
      result.recommendation = this.generateWIPRecommendation(state, utilization, currentCount, limit);
    }

    return result;
  }

  /**
   * Get current WIP limits
   */
  async getWIPLimits(): Promise<WIPLimits> {
    return { ...this.wipLimits };
  }

  /**
   * Update WIP limits with validation
   */
  async updateWIPLimits(newLimits: Partial<WIPLimits>): Promise<void> {
    // Use immutable operations for safe updates
    const updatedLimits = ImmutableWIPUtils.updateWIPLimits(
      this.wipLimits,
      newLimits
    );

    // Validate updated limits
    const validation = ValidationUtils.validateWIPLimits(updatedLimits);
    if (!validation.success) {
      throw new Error(
        `Invalid WIP limits: ${validation.error.issues.map((i) => i.message).join(,')}`
      );
    }

    this.wipLimits = validation.data;
    logger.info('WIP limits updated:,this.wipLimits');
  }

  /**
   * Generate WIP optimization recommendations
   */
  async getWIPOptimizationRecommendations(currentTasks: WorkflowTask[]): Promise<WIPOptimizationRecommendation[]> {
    const recommendations: WIPOptimizationRecommendation[] = [];
    
    const workflowStates: TaskState[] = [
     'analysis,
     'development,
     'testing,
     'review,
     'deployment,
    ];

    for (const state of workflowStates) {
      const tasksInState = currentTasks.filter(task => task.state === state);
      const currentCount = tasksInState.length;
      const currentLimit = this.wipLimits[state];
      const utilization = currentLimit > 0 ? currentCount / currentLimit : 0;

      const recommendation = this.analyzeWIPOptimization(state, currentCount, currentLimit, utilization);
      if (recommendation) {
        recommendations.push(recommendation);
      }
    }

    // Sort by expected impact
    recommendations.sort((a, b) => b.expectedImpact - a.expectedImpact);

    return recommendations;
  }

  /**
   * Calculate overall WIP efficiency
   */
  async calculateWIPEfficiency(currentTasks: WorkflowTask[]): Promise<number> {
    let totalUtilization = 0;
    let stateCount = 0;

    const workflowStates: TaskState[] = [
     'analysis,
     'development,
     'testing,
     'review,
     'deployment,
    ];

    for (const state of workflowStates) {
      const limit = this.wipLimits[state];
      const tasksInState = currentTasks.filter(task => task.state === state);
      const utilization = limit > 0 ? tasksInState.length / limit : 0;

      totalUtilization += Math.min(1, utilization);
      stateCount++;
    }

    return stateCount > 0 ? totalUtilization / stateCount : 0;
  }

  /**
   * Get WIP utilization trends
   */
  async getUtilizationTrends(): Promise<Record<TaskState, { current: number; trend: number; history: number[] }>> {
    const trends: Record<string, { current: number; trend: number; history: number[] }> = {};

    for (const state of Object.keys(this.utilizationHistory) as TaskState[]) {
      const history = this.utilizationHistory[state];
      const current = history[history.length - 1]|| 0;
      
      // Calculate trend (positive = increasing, negative = decreasing)
      const trend = history.length > 1 
        ? (current - history[history.length - 2]) 
        : 0;

      trends[state] = {
        current,
        trend,
        history: [...history], // Copy for immutability
      };
    }

    return trends;
  }

  // =============================================================================
  // PRIVATE DOMAIN LOGIC
  // =============================================================================

  private trackUtilization(state: TaskState, utilization: number): void {
    if (!this.utilizationHistory[state]) {
      this.utilizationHistory[state] = [];
    }

    this.utilizationHistory[state].push(utilization);

    // Keep only last 24 data points (for trend analysis)
    if (this.utilizationHistory[state].length > 24) {
      this.utilizationHistory[state].shift();
    }
  }

  private generateWIPRecommendation(state: TaskState, utilization: number, currentCount: number, limit: number): string {
    if (utilization >= 1.0) {
      return `WIP limit exceeded in ${state}. Consider increasing limit or optimizing flow.`;
    } else if (utilization > 0.9) {
      return `High utilization in ${state} (${Math.round(utilization * 100)}%). Monitor for bottlenecks.`;
    } else if (utilization > 0.8) {
      return `Approaching WIP limit in ${state}. Consider workflow optimization.`;
    }
    
    return `WIP utilization in ${state} is healthy (${Math.round(utilization * 100)}%).`;
  }

  private analyzeWIPOptimization(
    state: TaskState, 
    currentCount: number, 
    currentLimit: number, 
    utilization: number
  ): WIPOptimizationRecommendation| null {
    const history = this.utilizationHistory[state]|| [];
    
    // Not enough data for recommendations
    if (history.length < 3) {
      return null;
    }

    const avgUtilization = history.reduce((sum, val) => sum + val, 0) / history.length;
    const isConsistentlyHigh = avgUtilization > 0.8;
    const isConsistentlyLow = avgUtilization < 0.3;

    if (isConsistentlyHigh && utilization > 0.9) {
      // Recommend increasing limit
      const recommendedLimit = Math.ceil(currentLimit * 1.2);
      return {
        state,
        currentLimit,
        recommendedLimit,
        reason: `Consistently high utilization (${Math.round(avgUtilization * 100)}%) indicates capacity constraint`,
        confidence: 0.8,
        expectedImpact: 0.7,
      };
    }

    if (isConsistentlyLow && currentLimit > 2) {
      // Recommend decreasing limit
      const recommendedLimit = Math.max(2, Math.floor(currentLimit * 0.8);
      return {
        state,
        currentLimit,
        recommendedLimit,
        reason: `Consistently low utilization (${Math.round(avgUtilization * 100)}%) suggests over-capacity`,
        confidence: 0.6,
        expectedImpact: 0.4,
      };
    }

    return null;
  }
}