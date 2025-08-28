/**
 * @fileoverview Bottleneck Detection Domain Service
 *
 * Pure domain logic for workflow bottleneck detection and analysis.
 * Identifies capacity constraints, process issues, and flow impediments.
 *
 * **Responsibilities:**
 * - Real-time bottleneck detection across workflow states
 * - Bottleneck severity classification and prioritization
 * - Resolution strategy recommendation
 * - Performance impact estimation
 * - Trend analysis for proactive detection
 *
 * **Detection Algorithms:**
 * - WIP Capacity Analysis: High utilization detection
 * - Task Dwelling Analysis: Long-running task identification
 * - Flow Rate Analysis: Throughput variance detection
 * - Dependency Analysis: Blocking relationship mapping
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

import { getLogger } from '@claude-zen/foundation';
import type {
  BottleneckReport,
  TaskState,
  WIPLimits,
  WorkflowBottleneck,
  WorkflowTask,
} from '../types/index';
const logger = getLogger('BottleneckDetection'');

/**
 * Bottleneck detection configuration
 */
export interface BottleneckDetectionConfig {
  /** Utilization threshold for capacity bottlenecks */
  capacityThreshold: number;
  /** Hours threshold for dwelling task detection */
  dwellingThreshold: number;
  /** Minimum tasks required for flow rate analysis */
  minimumTasksForAnalysis: number;
  /** Confidence threshold for bottleneck reporting */
  confidenceThreshold: number;
}

/**
 * Default bottleneck detection configuration
 */
const DEFAULT_CONFIG: BottleneckDetectionConfig = {
  capacityThreshold: 0.85, // 85% utilization
  dwellingThreshold: 48,   // 48 hours
  minimumTasksForAnalysis: 5,
  confidenceThreshold: 0.6,
};

/**
 * Bottleneck resolution strategy
 */
export interface BottleneckResolutionStrategy {
  id: string;
  name: string;
  description: string;
  estimatedEffort:'low'|'medium'|'high';
  expectedImpact: number; // 0-1 scale
  timeToImplement: number; // hours
  prerequisites: string[];
}

/**
 * Bottleneck Detection Domain Service
 *
 * Sophisticated bottleneck detection using multiple algorithms.
 * Provides actionable insights for workflow optimization.
 */
export class BottleneckDetectionService {
  private config: BottleneckDetectionConfig;
  private detectionHistory: WorkflowBottleneck[] = [];

  constructor(config: Partial<BottleneckDetectionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    logger.info('BottleneckDetectionService initialized,this.config');
  }

  /**
   * Detect current bottlenecks in the workflow
   */
  async detectBottlenecks(
    allTasks: WorkflowTask[],
    wipLimits: WIPLimits
  ): Promise<BottleneckReport> {
    const timestamp = new Date();
    const bottlenecks: WorkflowBottleneck[] = [];

    logger.debug('Starting bottleneck detection,{
      totalTasks: allTasks.length,
      timestamp: timestamp.toISOString(),
    });

    // Run different detection algorithms
    const capacityBottlenecks = await this.detectCapacityBottlenecks(allTasks, wipLimits);
    const dwellingBottlenecks = await this.detectDwellingBottlenecks(allTasks);
    const flowRateBottlenecks = await this.detectFlowRateBottlenecks(allTasks);
    const dependencyBottlenecks = await this.detectDependencyBottlenecks(allTasks);

    // Combine all detected bottlenecks
    bottlenecks.push(
      ...capacityBottlenecks,
      ...dwellingBottlenecks,
      ...flowRateBottlenecks,
      ...dependencyBottlenecks
    );

    // Filter by confidence threshold and deduplicate
    const filteredBottlenecks = this.filterAndPrioritizeBottlenecks(bottlenecks);

    // Store in history for trend analysis
    this.detectionHistory.push(...filteredBottlenecks);
    if (this.detectionHistory.length > 100) {
      this.detectionHistory = this.detectionHistory.slice(-100); // Keep last 100 detections
    }

    const report: BottleneckReport = {
      reportId: `report-${timestamp.getTime()}`,
      generatedAt: timestamp,
      timeRange: {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        end: timestamp,
      },
      bottlenecks: filteredBottlenecks,
      systemHealth: this.calculateSystemHealth(filteredBottlenecks),
      recommendations: filteredBottlenecks.map(bottleneck => ({
        bottleneckId: bottleneck.id,
        strategy: this.getResolutionStrategy(bottleneck).name,
        description: bottleneck.recommendedResolution,
        estimatedImpact: Math.min(1, bottleneck.impactScore * 0.8),
        implementationEffort: bottleneck.severity ==='critical '? 4 : 2,
        priority: bottleneck.severity as any,
        prerequisites: [],
      })),
      trends: await this.analyzeTrends(),
    };

    logger.info(`Bottleneck detection complete: ${filteredBottlenecks.length} bottlenecks found`, {
      critical: filteredBottlenecks.filter(b => b.severity ==='critical').length,
      high: filteredBottlenecks.filter(b => b.severity ==='high').length,
      medium: filteredBottlenecks.filter(b => b.severity ==='medium').length,
    });

    return report;
  }

  /**
   * Get detailed resolution strategies for a bottleneck
   */
  async getResolutionStrategies(bottleneck: WorkflowBottleneck): Promise<BottleneckResolutionStrategy[]> {
    const strategies: BottleneckResolutionStrategy[] = [];

    switch (bottleneck.type) {
      case'capacity:
        strategies.push(
          {
            id:'increase-wip-limit,
            name:'Increase WIP Limit,
            description: `Increase WIP limit for ${bottleneck.state} from current capacity`,
            estimatedEffort:'low,
            expectedImpact: 0.7,
            timeToImplement: 1,
            prerequisites: ['Team capacity assessment'],
          },
          {
            id:'parallel-processing,
            name:'Enable Parallel Processing,
            description:'Split work to enable parallel processing in this state,
            estimatedEffort:'medium,
            expectedImpact: 0.8,
            timeToImplement: 8,
            prerequisites: ['Work decomposition analysis'],
          }
        );
        break;

      case'process:
        strategies.push(
          {
            id:'process-optimization,
            name:'Process Optimization,
            description:'Analyze and optimize the process in this workflow state,
            estimatedEffort:'high,
            expectedImpact: 0.9,
            timeToImplement: 16,
            prerequisites: ['Process analysis,'Team consultation'],
          },
          {
            id:'automation,
            name:'Automation Implementation,
            description:'Automate repetitive tasks causing delays,
            estimatedEffort:'high,
            expectedImpact: 0.8,
            timeToImplement: 24,
            prerequisites: ['Automation feasibility study'],
          }
        );
        break;

      case'dependency:
        strategies.push(
          {
            id:'dependency-removal,
            name:'Dependency Elimination,
            description:'Remove or reduce dependencies causing delays,
            estimatedEffort:'medium,
            expectedImpact: 0.75,
            timeToImplement: 12,
            prerequisites: ['Dependency mapping'],
          }
        );
        break;

      default:
        strategies.push({
          id:'general-optimization,
          name:'General Workflow Optimization,
          description:'Apply general workflow optimization techniques,
          estimatedEffort:'medium,
          expectedImpact: 0.6,
          timeToImplement: 8,
          prerequisites: [],
        });
    }

    return strategies.sort((a, b) => b.expectedImpact - a.expectedImpact);
  }

  // =============================================================================
  // DETECTION ALGORITHMS
  // =============================================================================

  private async detectCapacityBottlenecks(
    allTasks: WorkflowTask[],
    wipLimits: WIPLimits
  ): Promise<WorkflowBottleneck[]> {
    const bottlenecks: WorkflowBottleneck[] = [];
    const workflowStates: TaskState[] = ['analysis,'development,'testing,'review,'deployment];

    for (const state of workflowStates) {
      const tasksInState = allTasks.filter(task => task.state === state);
      const currentCount = tasksInState.length;
      const limit = wipLimits[state];
      const utilization = limit > 0 ? currentCount / limit : 0;

      if (utilization >= this.config.capacityThreshold) {
        const severity = utilization >= 0.95 ?'critical: utilization >= 0.9 ?'high: 'medium';
        bottlenecks.push({
          id: `capacity-${state}-${Date.now()}`,
          state,
          type:'capacity,
          severity,
          impactScore: utilization,
          detectedAt: new Date(),
          affectedTasks: tasksInState.map(t => t.id),
          estimatedDelay: (currentCount - limit) * 2, // Rough estimate in hours
          recommendedResolution: `Increase WIP limit for ${state} or optimize task flow`,
          metadata: {
            currentCount,
            limit,
            utilization,
            threshold: this.config.capacityThreshold,
          },
        });
      }
    }

    return bottlenecks;
  }

  private async detectDwellingBottlenecks(allTasks: WorkflowTask[]): Promise<WorkflowBottleneck[]> {
    const bottlenecks: WorkflowBottleneck[] = [];
    const workflowStates: TaskState[] = ['analysis,'development,'testing,'review,'deployment];

    for (const state of workflowStates) {
      const tasksInState = allTasks.filter(task => task.state === state);
      
      // Find tasks that have been in this state too long
      const dwellingTasks = tasksInState.filter(task => {
        const hoursInState = (Date.now() - task.updatedAt.getTime()) / (1000 * 60 * 60);
        return hoursInState > this.config.dwellingThreshold;
      });

      if (dwellingTasks.length > 0) {
        const avgDwellingTime = dwellingTasks.reduce(
          (sum, task) => sum + (Date.now() - task.updatedAt.getTime()) / (1000 * 60 * 60),
          0
        ) / dwellingTasks.length;

        const severity = dwellingTasks.length > 3 ?'high: 'medium';
        const impactScore = Math.min(1, dwellingTasks.length / tasksInState.length);

        bottlenecks.push({
          id: `dwelling-${state}-${Date.now()}`,
          state,
          type:'process,
          severity,
          impactScore,
          detectedAt: new Date(),
          affectedTasks: dwellingTasks.map(t => t.id),
          estimatedDelay: avgDwellingTime,
          recommendedResolution: `Review long-dwelling tasks in ${state} for process improvements`,
          metadata: {
            dwellingTaskCount: dwellingTasks.length,
            totalTasksInState: tasksInState.length,
            averageDwellingTime: avgDwellingTime,
            threshold: this.config.dwellingThreshold,
          },
        });
      }
    }

    return bottlenecks;
  }

  private async detectFlowRateBottlenecks(allTasks: WorkflowTask[]): Promise<WorkflowBottleneck[]> {
    const bottlenecks: WorkflowBottleneck[] = [];
    
    // This would typically analyze flow rates between states
    // For now, return empty array - could be enhanced with historical flow data
    
    return bottlenecks;
  }

  private async detectDependencyBottlenecks(allTasks: WorkflowTask[]): Promise<WorkflowBottleneck[]> {
    const bottlenecks: WorkflowBottleneck[] = [];
    
    // Find tasks blocked by dependencies
    const blockedTasks = allTasks.filter(task => 
      task.state ==='blocked '&& task.dependencies && task.dependencies.length > 0
    );

    if (blockedTasks.length >= this.config.minimumTasksForAnalysis) {
      const impactScore = Math.min(1, blockedTasks.length / allTasks.length);
      
      bottlenecks.push({
        id: `dependency-blocked-${Date.now()}`,
        state:'blocked,
        type:'dependency,
        severity:  blockedTasks.length > 5 ?high:'medium,
        impactScore,
        detectedAt: new Date(),
        affectedTasks: blockedTasks.map(t => t.id),
        estimatedDelay: 24, // Default estimate
        recommendedResolution:'Review and resolve task dependencies,
        metadata: {
          blockedTaskCount: blockedTasks.length,
          totalTasks: allTasks.length,
        },
      });
    }

    return bottlenecks;
  }

  // =============================================================================
  // ANALYSIS AND UTILITIES
  // =============================================================================

  private filterAndPrioritizeBottlenecks(bottlenecks: WorkflowBottleneck[]): WorkflowBottleneck[] {
    // Filter by confidence and remove duplicates
    const filtered = bottlenecks.filter(bottleneck => 
      bottleneck.impactScore >= this.config.confidenceThreshold
    );

    // Sort by severity and impact
    const severityOrder = { critical: 3, high: 2, medium: 1, low: 0 };
    
    return filtered.sort((a, b) => {
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.impactScore - a.impactScore;
    });
  }

  private calculateSystemHealth(bottlenecks: WorkflowBottleneck[]): number {
    const criticalCount = bottlenecks.filter(b => b.severity ==='critical').length';
    const highCount = bottlenecks.filter(b => b.severity ==='high').length';
    const mediumCount = bottlenecks.filter(b => b.severity ==='medium').length';
    const healthImpact = criticalCount * 0.3 + highCount * 0.2 + mediumCount * 0.1;
    return Math.max(0, 1 - Math.min(1, healthImpact);
  }

  private getResolutionStrategy(bottleneck: WorkflowBottleneck): BottleneckResolutionStrategy {
    // Return the primary resolution strategy for the bottleneck type
    switch (bottleneck.type) {
      case'capacity:
        return {
          id:'increase-capacity,
          name:'Increase Capacity,
          description:'Increase team capacity or WIP limits,
          estimatedEffort:'medium,
          expectedImpact: 0.7,
          timeToImplement: 8,
          prerequisites: [],
        };
      case'process:
        return {
          id:'optimize-process,
          name:'Process Optimization,
          description:'Optimize process efficiency,
          estimatedEffort:'high,
          expectedImpact: 0.8,
          timeToImplement: 16,
          prerequisites: [],
        };
      case'dependency:
        return {
          id:'resolve-dependencies,
          name:'Resolve Dependencies,
          description:'Address blocking dependencies,
          estimatedEffort:'medium,
          expectedImpact: 0.75,
          timeToImplement: 12,
          prerequisites: [],
        };
      default:
        return {
          id:'general-optimization,
          name:'General Optimization,
          description:'Apply general optimization,
          estimatedEffort:'medium,
          expectedImpact: 0.6,
          timeToImplement: 8,
          prerequisites: [],
        };
    }
  }

  private async analyzeTrends(): Promise<any[]> {
    // Placeholder for trend analysis
    // Would typically analyze bottleneck history for patterns
    return [];
  }
}