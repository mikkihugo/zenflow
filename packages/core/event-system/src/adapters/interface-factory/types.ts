/**
 * @file Interface Event Factory - Type Definitions
 *
 * Type definitions and interfaces for interface event factory operations.
 */




/**
 * Interface event factory configuration.
 */
export interface InterfaceEventFactoryConfig {
  maxInstances?: number;
  defaultTimeout?: number;
  enableMonitoring?: boolean;
  enableHealthChecking?: boolean;
  healthCheckInterval?: number;
  retryConfig?: {
    attempts: number;
    delay: number;
    backoff: 'linear' | 'exponential';
  };
}

/**
 * Interface factory metrics.
 */
export interface InterfaceFactoryMetrics {
  totalCreated: number;
  totalErrors: number;
  activeInstances: number;
  runningInstances: number;
  uptime: number;
  creationRate: number;
  errorRate: number;
  timestamp: Date;
}

/**
 * Interface health result.
 */
export interface InterfaceHealthResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  activeInstances: number;
  runningInstances: number;
  errorRate: number;
  uptime: number;
  timestamp: Date;
  details: {
    factoryHealth: string;
    instanceHealth: Array<{
      name: string;
      status: string;
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
