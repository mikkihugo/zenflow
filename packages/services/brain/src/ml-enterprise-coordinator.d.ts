/**
 * @fileoverview ML Enterprise Coordinator - Neural ML with Enterprise Event Coordination
 *
 * Provides enterprise-grade ML coordination with comprehensive event emission,
 * SPARC methodology integration, TaskMaster approval workflows, and performance monitoring.
 * This bridges high-performance Rust neural-ml computations with enterprise coordination.
 *
 * Features:
 * - Real-time training progress events with SPARC phase tracking
 * - Inference result events with performance metrics
 * - Workflow state management with TaskMaster approval integration
 * - System performance monitoring and resource utilization tracking
 * - Model validation with progressive quality gates
 * - Enterprise audit trails and compliance reporting
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 1.0.0
 */
import { TypedEventBase } from '@claude-zen/foundation';
export interface MLTrainingProgressEvent {
  trainingId: string;
  epoch: number;
  loss: number;
  accuracy: number;
  validationLoss?: number;
  validationAccuracy?: number;
  timestamp: number;
  sparc_phase:
    | 'specification'
    | ' pseudocode'
    | ' architecture'
    | ' refinement'
    | ' completion';
}
export interface MLInferenceResultEvent {
  inferenceId: string;
  model: string;
  inputSize: number;
  outputSize: number;
  processingTime: number;
  confidence: number;
  timestamp: number;
  result: any;
}
export interface MLWorkflowStateEvent {
  workflowId: string;
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
export interface MLPerformanceMetricsEvent {
  metricId: string;
  cpu_usage: number;
  memory_usage: number;
  gpu_usage?: number;
  throughput: number;
  latency: number;
  error_rate: number;
  timestamp: number;
}
export interface MLModelValidationEvent {
  modelId: string;
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
export interface MLEnterpriseConfig {
  enable_performance_monitoring: boolean;
  enable_event_emission: boolean;
  enable_sparc_integration: boolean;
  enable_taskmaster_integration: boolean;
  performance_monitoring_interval: number;
  max_performance_history: number;
  validation_retry_attempts: number;
  default_sparc_phase:
    | 'specification'
    | ' pseudocode'
    | ' architecture'
    | ' refinement'
    | ' completion';
}
/**
 * Enterprise ML Coordinator
 *
 * Provides comprehensive ML coordination with enterprise event emission,
 * SPARC methodology integration, and TaskMaster approval workflows.
 */
export declare class MLEnterpriseCoordinator extends TypedEventBase {
  private logger;
  private config;
  private initialized;
  private activeTrainingJobs;
  private activeInferences;
  private workflowStates;
  private performanceMetrics;
  private validationResults;
  private performanceMonitoringInterval?;
  constructor(config?: Partial<MLEnterpriseConfig>);
  /**
   * Initialize the ML Enterprise Coordinator
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
   * Start ML training job with SPARC methodology integration
   */
  startTrainingJob(
    modelId: string,
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
  updateTrainingProgress(
    trainingId: string,
    epoch: number,
    loss: number,
    accuracy: number,
    validationLoss?: number,
    validationAccuracy?: number
  ): void;
  /**
   * Complete training job
   */
  private completeTrainingJob;
  /**
   * Execute ML inference with comprehensive event tracking
   */
  executeInference(
    modelId: string,
    input: any,
    options?: {
      timeout?: number;
      confidence_threshold?: number;
    }
  ): Promise<MLInferenceResultEvent>;
  /**
   * Run model validation with SPARC quality gates
   */
  validateModel(
    modelId: string,
    validationType:
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
    testData: any[]
  ): Promise<MLModelValidationEvent>;
  /**
   * Request TaskMaster approval for ML operations
   */
  requestTaskMasterApproval(
    workflowId: string,
    operation: string,
    metadata: any
  ): Promise<boolean>;
  /**
   * Get enterprise coordination metrics
   */
  getEnterpriseMetrics(): {
    active_training_jobs: number;
    active_inferences: number;
    workflow_states: number;
    recent_validations: number;
    average_performance: Partial<MLPerformanceMetricsEvent>;
  };
  /**
   * Start performance monitoring for enterprise coordination
   */
  private startPerformanceMonitoring;
  private calculateThroughput;
  private calculateAverageLatency;
  private calculateErrorRate;
  private isTrainingCompleted;
  private performInference;
  private performValidation;
  private getValidationThresholds;
}
/**
 * Factory function to create ML Enterprise Coordinator with sensible defaults
 */
export declare function createMLEnterpriseCoordinator(
  overrides?: Partial<MLEnterpriseConfig>
): MLEnterpriseCoordinator;
export {
  type MLTrainingProgressEvent,
  type MLInferenceResultEvent,
  type MLWorkflowStateEvent,
  type MLPerformanceMetricsEvent,
  type MLModelValidationEvent,
  type MLEnterpriseConfig,
};
//# sourceMappingURL=ml-enterprise-coordinator.d.ts.map
