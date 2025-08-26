/**
 * @file Memory Event Factory - Type Definitions
 *
 * Type definitions and interfaces for memory event factory operations.
 */




/**
 * Memory event factory configuration.
 */
export interface MemoryEventFactoryConfig {
  maxInstances?: number;
  defaultTimeout?: number;
  enableMonitoring?: boolean;
  enableHealthChecking?: boolean;
  healthCheckInterval?: number;
  memoryConfig?: {
    maxMemoryUsage: number;
    enableGarbageCollection: boolean;
    gcThreshold: number;
  };
  retryConfig?: {
    attempts: number;
    delay: number;
    backoff: 'linear' | 'exponential';
  };
}

/**
 * Memory factory metrics.
 */
export interface MemoryFactoryMetrics {
  totalCreated: number;
  totalErrors: number;
  activeInstances: number;
  runningInstances: number;
  uptime: number;
  creationRate: number;
  errorRate: number;
  memoryUsage: {
    total: number;
    used: number;
    available: number;
  };
  timestamp: Date;
}

/**
 * Memory health result.
 */
export interface MemoryHealthResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  activeInstances: number;
  runningInstances: number;
  errorRate: number;
  memoryUsage: number;
  uptime: number;
  timestamp: Date;
  details: {
    factoryHealth: string;
    memoryHealth: string;
    instanceHealth: Array<{
      name: string;
      status: string;
      memoryUsage: number;
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
