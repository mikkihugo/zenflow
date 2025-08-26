/**
 * @file Workflow Event Factory - Type Definitions
 *
 * Type definitions and interfaces for workflow event factory operations.
 */




/**
 * Workflow event factory configuration.
 */
export interface WorkflowEventFactoryConfig {
  maxInstances?: number;
  defaultTimeout?: number;
  enableMonitoring?: boolean;
  enableHealthChecking?: boolean;
  healthCheckInterval?: number;
  workflowConfig?: {
    maxParallelWorkflows: number;
    enableStateTracking: boolean;
    enableRetries: boolean;
    defaultRetryCount: number;
  };
  retryConfig?: {
    attempts: number;
    delay: number;
    backoff: 'linear' | 'exponential';
  };
}

/**
 * Workflow factory metrics.
 */
export interface WorkflowFactoryMetrics {
  totalCreated: number;
  totalErrors: number;
  activeInstances: number;
  runningInstances: number;
  uptime: number;
  creationRate: number;
  errorRate: number;
  workflowMetrics: {
    totalWorkflows: number;
    completedWorkflows: number;
    failedWorkflows: number;
    averageExecutionTime: number;
  };
  timestamp: Date;
}

/**
 * Workflow health result.
 */
export interface WorkflowHealthResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  activeInstances: number;
  runningInstances: number;
  errorRate: number;
  workflowSuccessRate: number;
  uptime: number;
  timestamp: Date;
  details: {
    factoryHealth: string;
    workflowHealth: string;
    instanceHealth: Array<{
      name: string;
      status: string;
      activeWorkflows: number;
      lastCheck: Date;
    }>;
  };
}

/**
 * Factory operation result.
 */
export interface FactoryOperationResult {
  success: boolean;
  instanceName?: string;
  error?: Error;
  duration: number;
  timestamp: Date;
}

/**
 * Bulk operation result.
 */
export interface BulkOperationResult {
  totalRequested: number;
  totalSuccessful: number;
  totalFailed: number;
  results: FactoryOperationResult[];
  overallDuration: number;
  timestamp: Date;
}
