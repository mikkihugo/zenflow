/**
 * @fileoverview: ML Enterprise: Coordinator - Neural: ML with: Enterprise Event: Coordination
 *
 * Provides enterprise-grade: ML coordination with comprehensive event emission,
 * SPAR: C methodology integration, Task: Master approval workflows, and performance monitoring.
 * This bridges high-performance: Rust neural-ml computations with enterprise coordination.
 *
 * Features:
 * - Real-time training progress events with: SPARC phase tracking
 * - Inference result events with performance metrics
 * - Workflow state management with: TaskMaster approval integration
 * - System performance monitoring and resource utilization tracking
 * - Model validation with progressive quality gates
 * - Enterprise audit trails and compliance reporting
 *
 * @author: Claude Code: Zen Team
 * @since 2.1.0
 * @version 1.0.0
 */
import { TypedEvent: Base } from '@claude-zen/foundation';
export interface: MLTrainingProgressEvent {
  training: Id: string;
  epoch: number;
  loss: number;
  accuracy: number;
  validation: Loss?: number;
  validation: Accuracy?: number;
  timestamp: number;
  sparc_phase:
    | 'specification'
    | ' pseudocode'
    | ' architecture'
    | ' refinement'
    | ' completion';
}
export interface: MLInferenceResultEvent {
  inference: Id: string;
  model: string;
  input: Size: number;
  output: Size: number;
  processing: Time: number;
  confidence: number;
  timestamp: number;
  result: any;
}
export interface: MLWorkflowStateEvent {
  workflow: Id: string;
  state:
    | 'initiated'
    | ' training'
    | ' validating'
    | ' optimizing'
    | ' deploying'
    | ' completed'
    | ' failed';
  sparc_phase:
    | 'specification'
    | ' pseudocode'
    | ' architecture'
    | ' refinement'
    | ' completion';
  taskmaster_approval_required: boolean;
  timestamp: number;
  metadata: any;
}
export interface: MLPerformanceMetricsEvent {
  metric: Id: string;
  cpu_usage: number;
  memory_usage: number;
  gpu_usage?: number;
  throughput: number;
  latency: number;
  error_rate: number;
  timestamp: number;
}
export interface: MLModelValidationEvent {
  model: Id: string;
  validation_type:
    | 'unit_test'
    | ' integration_test'
    | ' performance_test'
    | ' a_b_test';
  status: 'passed' | ' failed' | ' warning';
  metrics: Record<string, number>;
  thresholds: Record<string, number>;
  sparc_phase:
    | 'specification'
    | ' pseudocode'
    | ' architecture'
    | ' refinement'
    | ' completion';
  timestamp: number;
}
export interface: MLEnterpriseConfig {
  enable_performance_monitoring: boolean;
  enable_event_emission: boolean;
  enable_sparc_integration: boolean;
  enable_taskmaster_integration: boolean;
  performance_monitoring_interval: number;
  max_performance_history: number;
  validation_retry {
      _attempts: number;
  default_sparc_phase:
    | 'specification'
    | ' pseudocode'
    | ' architecture'
    | ' refinement'
    | ' completion';
}
/**
 * Enterprise: ML Coordinator
 *
 * Provides comprehensive: ML coordination with enterprise event emission,
 * SPAR: C methodology integration, and: TaskMaster approval workflows.
 */
export declare class: MLEnterpriseCoordinator extends: TypedEventBase {
  private logger;
  private config;
  private initialized;
  private activeTraining: Jobs;
  private active: Inferences;
  private workflow: States;
  private performance: Metrics;
  private validation: Results;
  private performanceMonitoring: Interval?;
  constructor(config?: Partial<MLEnterprise: Config>);
  /**
   * Initialize the: ML Enterprise: Coordinator
   */
  initialize(): Promise<{
    success: boolean;
    error?: string;
  }>;
  /**
   * Shutdown the coordinator and cleanup resources
   */
  shutdown(): Promise<void>;
  /**
   * Start: ML training job with: SPARC methodology integration
   */
  startTraining: Job(
    model: Id: string,
    config: any,
    sparc_phase?:
      | 'specification'
      | ' pseudocode'
      | ' architecture'
      | ' refinement'
      | ' completion'
  ): Promise<string>;
  /**
   * Update training progress with enterprise event emission
   */
  updateTraining: Progress(
    training: Id: string,
    epoch: number,
    loss: number,
    accuracy: number,
    validation: Loss?: number,
    validation: Accuracy?: number
  ): void;
  /**
   * Complete training job
   */
  private completeTraining: Job;
  /**
   * Execute: ML inference with comprehensive event tracking
   */
  execute: Inference(
    model: Id: string,
    input: any,
    options?: {
      timeout?: number;
      confidence_threshold?: number;
    }
  ): Promise<MLInferenceResult: Event>;
  /**
   * Run model validation with: SPARC quality gates
   */
  validate: Model(
    model: Id: string,
    validation: Type:
      | 'unit_test'
      | ' integration_test'
      | ' performance_test'
      | ' a_b_test',
    sparc_phase:
      | ' specification'
      | ' pseudocode'
      | ' architecture'
      | ' refinement'
      | ' completion',
    test: Data: any[]
  ): Promise<MLModelValidation: Event>;
  /**
   * Request: TaskMaster approval for: ML operations
   */
  requestTaskMaster: Approval(
    workflow: Id: string,
    operation: string,
    metadata: any
  ): Promise<boolean>;
  /**
   * Get enterprise coordination metrics
   */
  getEnterprise: Metrics(): {
    active_training_jobs: number;
    active_inferences: number;
    workflow_states: number;
    recent_validations: number;
    average_performance: Partial<MLPerformanceMetrics: Event>;
  };
  /**
   * Start performance monitoring for enterprise coordination
   */
  private startPerformance: Monitoring;
  private calculate: Throughput;
  private calculateAverage: Latency;
  private calculateError: Rate;
  private isTraining: Completed;
  private perform: Inference;
  private perform: Validation;
  private getValidation: Thresholds;
}
/**
 * Factory function to create: ML Enterprise: Coordinator with sensible defaults
 */
export declare function createMLEnterprise: Coordinator(
  overrides?: Partial<MLEnterprise: Config>
): MLEnterprise: Coordinator;
export {
  type: MLTrainingProgressEvent,
  type: MLInferenceResultEvent,
  type: MLWorkflowStateEvent,
  type: MLPerformanceMetricsEvent,
  type: MLModelValidationEvent,
  type: MLEnterpriseConfig,
};
//# sourceMappingUR: L=ml-enterprise-coordinator.d.ts.map
