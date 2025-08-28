/**
 * @fileoverview Domain Services Index
 *
 * Centralized exports for all domain services in the Kanban system.
 * Domain services contain pure business logic and domain rules without
 * infrastructure concerns.
 *
 * **Domain Services:**
 * - TaskManagementService: Core task lifecycle and business rules
 * - WIPManagementService: Work-in-Progress limits and optimization
 * - FlowAnalysisService: Flow metrics calculation and analysis
 * - BottleneckDetectionService: Workflow bottleneck identification and resolution
 * - HealthMonitoringService: System health assessment and monitoring
 *
 * **Domain Principles:**
 * - Pure business logic without infrastructure dependencies
 * - Immutable data operations for consistency
 * - Validation and business rule enforcement
 * - Clear separation from infrastructure concerns
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

// Domain Services
export { TaskManagementService } from './task-management';
export { WIPManagementService } from './wip-management';
export { FlowAnalysisService } from './flow-analysis';
export { BottleneckDetectionService } from './bottleneck-detection';
export { HealthMonitoringService } from './health-monitoring';
// Domain Service Interfaces and Types
export type { 
  TaskCreationInput,
  TaskUpdateInput,
  TaskMovementResult,
  KanbanOperationResult,
} from './task-management';
export type {
  WIPCheckResult,
  WIPOptimizationRecommendation,
} from './wip-management';
export type {
  FlowTrend,
  PredictabilityAnalysis,
} from './flow-analysis';
export type {
  BottleneckDetectionConfig,
  BottleneckResolutionStrategy,
} from './bottleneck-detection';
export type {
  ComponentHealthAssessment,
  HealthMonitoringConfig,
  PerformanceMetrics as DomainPerformanceMetrics,
} from './health-monitoring';
/**
 * Domain Services Factory
 * 
 * Creates and configures all domain services with proper business logic setup.
 * Domain services are stateful and maintain business context across operations.
 */
export class DomainServicesFactory {
  private taskManagement?: TaskManagementService;
  private wipManagement?: WIPManagementService;
  private flowAnalysis?: FlowAnalysisService;
  private bottleneckDetection?: BottleneckDetectionService;
  private healthMonitoring?: HealthMonitoringService;

  /**
   * Create task management service
   */
  createTaskManagementService(): TaskManagementService {
    if (!this.taskManagement) {
      this.taskManagement = new TaskManagementService();
    }
    return this.taskManagement;
  }

  /**
   * Create WIP management service
   */
  createWIPManagementService(initialLimits: any): WIPManagementService {
    if (!this.wipManagement) {
      this.wipManagement = new WIPManagementService(initialLimits);
    }
    return this.wipManagement;
  }

  /**
   * Create flow analysis service
   */
  createFlowAnalysisService(): FlowAnalysisService {
    if (!this.flowAnalysis) {
      this.flowAnalysis = new FlowAnalysisService();
    }
    return this.flowAnalysis;
  }

  /**
   * Create bottleneck detection service
   */
  createBottleneckDetectionService(config?: any): BottleneckDetectionService {
    if (!this.bottleneckDetection) {
      this.bottleneckDetection = new BottleneckDetectionService(config);
    }
    return this.bottleneckDetection;
  }

  /**
   * Create health monitoring service
   */
  createHealthMonitoringService(config?: any, performanceMetrics?: any): HealthMonitoringService {
    if (!this.healthMonitoring) {
      this.healthMonitoring = new HealthMonitoringService(config, performanceMetrics);
    }
    return this.healthMonitoring;
  }

  /**
   * Create all domain services
   */
  createAllServices(config?: {
    wipLimits?: any;
    bottleneckDetection?: any;
    healthMonitoring?: any;
    performanceMetrics?: any;
  }): {
    taskManagement: TaskManagementService;
    wipManagement: WIPManagementService;
    flowAnalysis: FlowAnalysisService;
    bottleneckDetection: BottleneckDetectionService;
    healthMonitoring: HealthMonitoringService;
  } {
    // Default WIP limits if not provided
    const defaultWipLimits = config?.wipLimits|| {
      analysis: 5,
      development: 8,
      testing: 6,
      review: 4,
      deployment: 3,
      blocked: 10,
      done: 1000,
    };

    return {
      taskManagement: this.createTaskManagementService(),
      wipManagement: this.createWIPManagementService(defaultWipLimits),
      flowAnalysis: this.createFlowAnalysisService(),
      bottleneckDetection: this.createBottleneckDetectionService(config?.bottleneckDetection),
      healthMonitoring: this.createHealthMonitoringService(
        config?.healthMonitoring,
        config?.performanceMetrics
      ),
    };
  }

  /**
   * Reset all domain services to initial state
   */
  resetAllServices(): void {
    this.taskManagement = undefined;
    this.wipManagement = undefined;
    this.flowAnalysis = undefined;
    this.bottleneckDetection = undefined;
    this.healthMonitoring = undefined;
  }
}