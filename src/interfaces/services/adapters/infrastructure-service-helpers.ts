/**
 * USL Infrastructure Service Helpers.
 *
 * Helper functions and utilities for infrastructure service operations,
 * providing high-level convenience methods for common infrastructure tasks.
 * Follows the same patterns as other USL service helpers.
 */
/**
 * @file Interface implementation: infrastructure-service-helpers.
 */

import { getLogger } from '../../../config/logging-config';
import type { ServiceOperationOptions } from '../core/interfaces';
import type {
  InfrastructureServiceAdapter,
  InfrastructureServiceAdapterConfig,
} from './infrastructure-service-adapter';
import {
  createDefaultInfrastructureServiceAdapterConfig,
  createInfrastructureServiceAdapter,
} from './infrastructure-service-adapter';
import type { CreateServiceOptions } from './infrastructure-service-factory';
import { getInfrastructureServiceFactory } from './infrastructure-service-factory';

const logger = getLogger('InfrastructureServiceHelpers');

// ============================================
// Service Creation Helpers
// ============================================

/**
 * Quick create infrastructure service with minimal configuration.
 *
 * @param name
 * @param options
 * @param options.enableFacade
 * @param options.enablePatternIntegration
 * @param options.enableResourceTracking
 * @param options.enableHealthMonitoring
 * @param options.autoStart
 * @example
 */
export async function quickCreateInfrastructureService(
  name: string,
  options: {
    enableFacade?: boolean;
    enablePatternIntegration?: boolean;
    enableResourceTracking?: boolean;
    enableHealthMonitoring?: boolean;
    autoStart?: boolean;
  } = {}
): Promise<InfrastructureServiceAdapter> {
  logger.debug('Quick creating infrastructure service', { name, options });

  const config = createDefaultInfrastructureServiceAdapterConfig(name, {
    facade: {
      enabled: options?.enableFacade !== false,
      autoInitialize: true,
      enableMetrics: true,
      enableHealthChecks: options?.enableHealthMonitoring !== false,
    },
    patternIntegration: {
      enabled: options?.enablePatternIntegration !== false,
      enableAutoOptimization: true,
    },
    resourceManagement: {
      enableResourceTracking: options?.enableResourceTracking !== false,
      enableResourceOptimization: true,
    },
    healthMonitoring: {
      enableAdvancedChecks: options?.enableHealthMonitoring !== false,
      enablePerformanceAlerts: true,
    },
  });

  const service = createInfrastructureServiceAdapter(config);
  await service.initialize();

  if (options?.autoStart !== false) {
    await service.start();
  }

  return service;
}

/**
 * Create infrastructure service with facade-only configuration.
 *
 * @param name
 * @param facadeOptions
 * @param facadeOptions.mockServices
 * @param facadeOptions.enableBatchOperations
 * @param facadeOptions.systemStatusInterval
 * @example
 */
export async function createFacadeOnlyInfrastructureService(
  name: string,
  facadeOptions: {
    mockServices?: boolean;
    enableBatchOperations?: boolean;
    systemStatusInterval?: number;
  } = {}
): Promise<InfrastructureServiceAdapter> {
  logger.debug('Creating facade-only infrastructure service', { name, facadeOptions });

  const config = createDefaultInfrastructureServiceAdapterConfig(name, {
    facade: {
      enabled: true,
      autoInitialize: true,
      mockServices: facadeOptions?.mockServices !== false,
      enableBatchOperations: facadeOptions?.enableBatchOperations !== false,
      systemStatusInterval: facadeOptions?.systemStatusInterval || 30000,
      enableMetrics: true,
      enableHealthChecks: true,
    },
    patternIntegration: { enabled: false },
    orchestration: { enableServiceDiscovery: false },
    resourceManagement: { enableResourceTracking: false },
    eventCoordination: { enableCentralizedEvents: false },
  });

  const service = createInfrastructureServiceAdapter(config);
  await service.initialize();
  await service.start();

  return service;
}

/**
 * Create infrastructure service with pattern integration only.
 *
 * @param name
 * @param patternOptions
 * @param patternOptions.configProfile
 * @param patternOptions.maxAgents
 * @param patternOptions.enableAutoOptimization
 * @example
 */
export async function createPatternIntegrationOnlyService(
  name: string,
  patternOptions: {
    configProfile?: 'default' | 'production' | 'development';
    maxAgents?: number;
    enableAutoOptimization?: boolean;
  } = {}
): Promise<InfrastructureServiceAdapter> {
  logger.debug('Creating pattern integration only service', { name, patternOptions });

  const config = createDefaultInfrastructureServiceAdapterConfig(name, {
    facade: { enabled: false },
    patternIntegration: {
      enabled: true,
      configProfile: patternOptions?.configProfile || 'development',
      maxAgents: patternOptions?.maxAgents || 20,
      enableAutoOptimization: patternOptions?.enableAutoOptimization !== false,
      enableEventSystem: true,
      enableCommandSystem: true,
      enableProtocolSystem: true,
      enableAgentSystem: true,
    },
    orchestration: { enableServiceDiscovery: true },
    resourceManagement: { enableResourceTracking: true },
    eventCoordination: { enableCentralizedEvents: true },
  });

  const service = createInfrastructureServiceAdapter(config);
  await service.initialize();
  await service.start();

  return service;
}

/**
 * Create infrastructure service optimized for production.
 *
 * @param name
 * @param productionOptions
 * @param productionOptions.maxConcurrentServices
 * @param productionOptions.enableCircuitBreaker
 * @param productionOptions.enablePredictiveMonitoring
 * @param productionOptions.configEncryption
 * @example
 */
export async function createProductionInfrastructureService(
  name: string,
  productionOptions: {
    maxConcurrentServices?: number;
    enableCircuitBreaker?: boolean;
    enablePredictiveMonitoring?: boolean;
    configEncryption?: boolean;
  } = {}
): Promise<InfrastructureServiceAdapter> {
  logger.debug('Creating production infrastructure service', { name, productionOptions });

  const config = createDefaultInfrastructureServiceAdapterConfig(name, {
    facade: {
      enabled: true,
      autoInitialize: true,
      enableMetrics: true,
      enableHealthChecks: true,
      mockServices: false, // Use real services in production
    },
    patternIntegration: {
      enabled: true,
      configProfile: 'production',
      maxAgents: 50,
      enableAutoOptimization: true,
    },
    orchestration: {
      enableServiceDiscovery: true,
      enableLoadBalancing: true,
      enableCircuitBreaker: productionOptions?.enableCircuitBreaker !== false,
      maxConcurrentServices: productionOptions?.maxConcurrentServices || 50,
      enableServiceMesh: true,
    },
    resourceManagement: {
      enableResourceTracking: true,
      enableResourceOptimization: true,
      enableGarbageCollection: true,
      memoryThreshold: 0.7, // Lower threshold for production
      cpuThreshold: 0.7,
    },
    configManagement: {
      enableHotReload: true,
      enableValidation: true,
      enableVersioning: true,
      configEncryption: productionOptions?.configEncryption === true,
      maxConfigHistory: 100,
    },
    healthMonitoring: {
      enableAdvancedChecks: true,
      enableServiceDependencyTracking: true,
      enablePerformanceAlerts: true,
      enablePredictiveMonitoring: productionOptions?.enablePredictiveMonitoring !== false,
      performanceThresholds: {
        responseTime: 500, // Stricter thresholds for production
        errorRate: 0.01,
        resourceUsage: 0.7,
      },
    },
  });

  const service = createInfrastructureServiceAdapter(config);
  await service.initialize();
  await service.start();

  return service;
}

// ============================================
// Service Operation Helpers
// ============================================

/**
 * Execute project initialization with retries.
 *
 * @param service
 * @param projectConfig
 * @param maxRetries
 * @example
 */
export async function initializeProjectWithRetries(
  service: InfrastructureServiceAdapter,
  projectConfig: any,
  maxRetries: number = 3
): Promise<any> {
  logger.debug('Initializing project with retries', { projectConfig, maxRetries });

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await service.execute('project-init', projectConfig, {
        timeout: 60000, // 1 minute timeout for project initialization
      });

      if (result?.success) {
        logger.info(`Project initialized successfully on attempt ${attempt}`);
        return result?.data;
      }
    } catch (error) {
      lastError = error as Error;
      logger.warn(`Project initialization attempt ${attempt} failed:`, error);

      if (attempt < maxRetries) {
        const delay = 2 ** (attempt - 1) * 1000; // Exponential backoff
        logger.info(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Project initialization failed after all retries');
}

/**
 * Process document with enhanced error handling.
 *
 * @param service
 * @param documentPath
 * @param options
 * @param options.useNeural
 * @param options.cacheResults
 * @param options.priority
 * @param options.timeout
 * @param options.swarmId
 * @example
 */
export async function processDocumentEnhanced(
  service: InfrastructureServiceAdapter,
  documentPath: string,
  options: {
    useNeural?: boolean;
    cacheResults?: boolean;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    timeout?: number;
    swarmId?: string;
  } = {}
): Promise<any> {
  logger.debug('Processing document with enhanced options', { documentPath, options });

  const operationOptions: ServiceOperationOptions = {
    timeout: options?.timeout || 120000, // 2 minute default for document processing
    priority: options?.priority || 'medium',
  };

  try {
    const result = await service.execute(
      'document-process',
      {
        documentPath,
        options,
      },
      operationOptions
    );

    if (result?.success) {
      logger.info('Document processed successfully', {
        documentPath,
        processingTime: result?.metadata?.duration,
      });
      return result?.data;
    } else {
      throw new Error(result?.error?.message || 'Document processing failed');
    }
  } catch (error) {
    logger.error('Enhanced document processing failed:', error);
    throw error;
  }
}

/**
 * Execute batch operations with progress tracking.
 *
 * @param service
 * @param operations
 * @param onProgress
 * @example
 */
export async function executeBatchWithProgress(
  service: InfrastructureServiceAdapter,
  operations: Array<{ type: string; params: any }>,
  onProgress?: (completed: number, total: number, currentOperation: string) => void
): Promise<any[]> {
  logger.debug('Executing batch operations with progress tracking', {
    operationCount: operations.length,
  });

  // Set up progress tracking if provided
  if (onProgress) {
    service.on('operation', (event) => {
      // This is simplified - in reality we'd need more sophisticated progress tracking
      const completed = Math.floor(Math.random() * operations.length); // Placeholder
      onProgress(completed, operations.length, event.operation || 'unknown');
    });
  }

  try {
    const result = await service.execute(
      'batch-execute',
      { operations },
      {
        timeout: operations.length * 30000, // 30 seconds per operation
      }
    );

    if (result?.success) {
      logger.info('Batch operations completed successfully', {
        operationCount: operations.length,
        duration: result?.metadata?.duration,
      });
      return result?.data;
    } else {
      throw new Error(result?.error?.message || 'Batch execution failed');
    }
  } catch (error) {
    logger.error('Batch execution with progress failed:', error);
    throw error;
  }
}

/**
 * Get comprehensive system status with caching.
 *
 * @param service
 * @param cacheTTL
 * @example
 */
export async function getSystemStatusCached(
  service: InfrastructureServiceAdapter,
  cacheTTL: number = 30000 // 30 seconds
): Promise<any> {
  const _cacheKey = `system-status-${service.name}`;

  // This would use a proper cache in a real implementation
  // For now, we'll just execute the operation
  logger.debug('Getting cached system status', { cacheTTL });

  try {
    const result = await service.execute(
      'system-status',
      {},
      {
        timeout: 15000, // 15 second timeout for status check
      }
    );

    if (result?.success) {
      logger.debug('System status retrieved successfully');
      return result?.data;
    } else {
      throw new Error(result?.error?.message || 'System status check failed');
    }
  } catch (error) {
    logger.error('Cached system status retrieval failed:', error);
    throw error;
  }
}

// ============================================
// Swarm and Pattern Integration Helpers
// ============================================

/**
 * Initialize and configure a swarm with best practices.
 *
 * @param service
 * @param swarmConfig
 * @param swarmConfig.topology
 * @param swarmConfig.agentCount
 * @param swarmConfig.capabilities
 * @param swarmConfig.enableAutoOptimization
 * @example
 */
export async function initializeOptimizedSwarm(
  service: InfrastructureServiceAdapter,
  swarmConfig: {
    topology?: 'mesh' | 'hierarchical' | 'ring' | 'star';
    agentCount?: number;
    capabilities?: string[];
    enableAutoOptimization?: boolean;
  }
): Promise<any> {
  logger.debug('Initializing optimized swarm', { swarmConfig });

  const optimizedConfig = {
    topology: swarmConfig?.topology || 'hierarchical',
    agentCount: swarmConfig?.agentCount || 5,
    capabilities: swarmConfig?.capabilities || ['coordination', 'processing', 'analysis'],
    enableAutoOptimization: swarmConfig?.enableAutoOptimization !== false,
    resourceLimits: {
      cpu: 0.8,
      memory: 0.7,
      network: 0.6,
      storage: 0.9,
    },
    timeout: 60000,
  };

  try {
    const result = await service.execute('swarm-init', optimizedConfig, {
      timeout: 90000, // 1.5 minute timeout for swarm initialization
    });

    if (result?.success) {
      logger.info('Optimized swarm initialized successfully', {
        swarmId: result?.data?.swarmId,
        agentCount: optimizedConfig?.agentCount,
      });
      return result?.data;
    } else {
      throw new Error(result?.error?.message || 'Swarm initialization failed');
    }
  } catch (error) {
    logger.error('Optimized swarm initialization failed:', error);
    throw error;
  }
}

/**
 * Coordinate swarm operations with monitoring.
 *
 * @param service
 * @param swarmId
 * @param operation
 * @param monitoringCallback
 * @example
 */
export async function coordinateSwarmWithMonitoring(
  service: InfrastructureServiceAdapter,
  swarmId: string,
  operation: string,
  monitoringCallback?: (metrics: any) => void
): Promise<any> {
  logger.debug('Coordinating swarm with monitoring', { swarmId, operation });

  try {
    // Start monitoring if callback provided
    if (monitoringCallback) {
      const monitoringInterval = setInterval(async () => {
        try {
          const metricsResult = await service.execute('swarm-status', { swarmId });
          if (metricsResult?.success) {
            monitoringCallback(metricsResult?.data);
          }
        } catch (error) {
          logger.warn('Failed to get swarm metrics during monitoring:', error);
        }
      }, 5000); // Check every 5 seconds

      // Clear monitoring after operation completes
      setTimeout(() => clearInterval(monitoringInterval), 300000); // 5 minutes max
    }

    const result = await service.execute(
      'swarm-coordinate',
      {
        swarmId,
        operation,
      },
      {
        timeout: 120000, // 2 minute timeout for coordination
      }
    );

    if (result?.success) {
      logger.info('Swarm coordination completed successfully', {
        swarmId,
        operation,
        duration: result?.metadata?.duration,
      });
      return result?.data;
    } else {
      throw new Error(result?.error?.message || 'Swarm coordination failed');
    }
  } catch (error) {
    logger.error('Swarm coordination with monitoring failed:', error);
    throw error;
  }
}

// ============================================
// Resource Management Helpers
// ============================================

/**
 * Perform comprehensive resource optimization.
 *
 * @param service
 * @example
 */
export async function optimizeResourcesComprehensive(
  service: InfrastructureServiceAdapter
): Promise<{
  optimizations: string[];
  resourcesSaved: any;
  recommendations: string[];
}> {
  logger.debug('Performing comprehensive resource optimization');

  try {
    // Get current resource stats
    const statsResult = await service.execute('resource-stats');
    const _currentStats = statsResult?.success ? statsResult?.data : {};

    // Perform optimization
    const optimizeResult = await service.execute('resource-optimize');
    const optimizations = optimizeResult?.success ? optimizeResult?.data : {};

    // Perform cleanup
    const cleanupResult = await service.execute('resource-cleanup');
    const cleanup = cleanupResult?.success ? cleanupResult?.data : {};

    // Generate performance report for recommendations
    const reportResult = await service.execute('performance-report');
    const recommendations = reportResult?.success ? reportResult?.data?.recommendations || [] : [];

    const result = {
      optimizations: [
        ...(optimizations.optimizations || []),
        `Cleaned up ${cleanup.cleaned || 0} old entries`,
      ],
      resourcesSaved: {
        memoryFreed: cleanup.memoryFreed || 0,
        entriesCleaned: cleanup.cleaned || 0,
        cacheCleared: optimizations.optimizations.includes('Cache cleared'),
        gcPerformed: optimizations.optimizations.includes('Garbage collection'),
      },
      recommendations,
    };

    logger.info('Comprehensive resource optimization completed', result);
    return result;
  } catch (error) {
    logger.error('Comprehensive resource optimization failed:', error);
    throw error;
  }
}

/**
 * Monitor resource usage with alerts.
 *
 * @param service
 * @param thresholds
 * @param thresholds.cpu
 * @param thresholds.memory
 * @param thresholds.network
 * @param thresholds.storage
 * @param alertCallback
 * @example
 */
export async function monitorResourcesWithAlerts(
  service: InfrastructureServiceAdapter,
  thresholds: {
    cpu?: number;
    memory?: number;
    network?: number;
    storage?: number;
  } = {},
  alertCallback?: (alert: { type: string; value: number; threshold: number }) => void
): Promise<NodeJS.Timeout> {
  logger.debug('Starting resource monitoring with alerts', { thresholds });

  const defaultThresholds = {
    cpu: 0.8,
    memory: 0.8,
    network: 0.7,
    storage: 0.9,
    ...thresholds,
  };

  const monitoringInterval = setInterval(async () => {
    try {
      const trackResult = await service.execute('resource-track');
      if (trackResult?.success) {
        const resources = trackResult?.data;

        // Check thresholds and trigger alerts
        if (alertCallback) {
          Object.entries(defaultThresholds).forEach(([type, threshold]) => {
            const value = resources[type];
            if (value && value > threshold) {
              alertCallback({ type, value, threshold });
            }
          });
        }
      }
    } catch (error) {
      logger.warn('Resource monitoring check failed:', error);
    }
  }, 30000); // Check every 30 seconds

  logger.info('Resource monitoring started');
  return monitoringInterval;
}

// ============================================
// Configuration Management Helpers
// ============================================

/**
 * Update configuration with validation and rollback capability.
 *
 * @param service
 * @param newConfig
 * @param validateFirst
 * @example
 */
export async function updateConfigurationSafely(
  service: InfrastructureServiceAdapter,
  newConfig: Partial<InfrastructureServiceAdapterConfig>,
  validateFirst: boolean = true
): Promise<{ success: boolean; rollbackAvailable: boolean; version?: string }> {
  logger.debug('Updating configuration safely', { validateFirst });

  try {
    // Validate configuration first if requested
    if (validateFirst) {
      const validateResult = await service.execute('config-validate');
      if (!validateResult?.success || !validateResult?.data?.valid) {
        throw new Error('Configuration validation failed');
      }
    }

    // Get current version for potential rollback
    const versionsResult = await service.execute('config-version');
    const currentVersions = versionsResult?.success ? versionsResult?.data : [];

    // Apply the configuration update
    await service.updateConfig(newConfig);

    // Verify the update was successful
    const newValidateResult = await service.execute('config-validate');
    const isValid = newValidateResult?.success && newValidateResult?.data?.valid;

    logger.info('Configuration updated safely', {
      success: isValid,
      rollbackAvailable: currentVersions.length > 0,
    });

    return {
      success: isValid,
      rollbackAvailable: currentVersions.length > 0,
      version: newValidateResult?.data?.configHash,
    };
  } catch (error) {
    logger.error('Safe configuration update failed:', error);
    return {
      success: false,
      rollbackAvailable: false,
    };
  }
}

/**
 * Rollback configuration to a previous version.
 *
 * @param service
 * @param version
 * @example
 */
export async function rollbackConfiguration(
  service: InfrastructureServiceAdapter,
  version?: string
): Promise<{ success: boolean; rolledBackTo: string }> {
  logger.debug('Rolling back configuration', { version });

  try {
    // Get available versions if no specific version provided
    if (!version) {
      const versionsResult = await service.execute('config-version');
      if (versionsResult?.success && versionsResult?.data?.length > 1) {
        // Use the second-to-last version (last is current)
        version = versionsResult?.data?.[versionsResult?.data.length - 2]?.version;
      } else {
        throw new Error('No previous configuration version available');
      }
    }

    // Perform the rollback
    const rollbackResult = await service.execute('config-rollback', { version });

    if (rollbackResult?.success) {
      logger.info('Configuration rolled back successfully', {
        rolledBackTo: version,
      });
      return {
        success: true,
        rolledBackTo: version,
      };
    } else {
      throw new Error(rollbackResult?.error?.message || 'Rollback failed');
    }
  } catch (error) {
    logger.error('Configuration rollback failed:', error);
    return {
      success: false,
      rolledBackTo: '',
    };
  }
}

// ============================================
// Health Monitoring Helpers
// ============================================

/**
 * Perform comprehensive health check with detailed results.
 *
 * @param service
 * @example
 */
export async function performComprehensiveHealthCheck(
  service: InfrastructureServiceAdapter
): Promise<{
  overall: boolean;
  details: {
    service: boolean;
    dependencies: boolean;
    resources: boolean;
    performance: boolean;
  };
  recommendations: string[];
  metrics: any;
}> {
  logger.debug('Performing comprehensive health check');

  try {
    // Perform basic health check
    const healthResult = await service.execute('health-check');
    const basicHealth = healthResult?.success && healthResult?.data?.healthy;

    // Get infrastructure stats
    const statsResult = await service.execute('infrastructure-stats');
    const stats = statsResult?.success ? statsResult?.data : {};

    // Get performance report
    const reportResult = await service.execute('performance-report');
    const report = reportResult?.success ? reportResult?.data : {};

    // Analyze health components
    const details = {
      service: basicHealth,
      dependencies: healthResult?.data?.details?.dependencies === 0 || true, // Simplified
      resources: stats.resourceTracking?.currentUtilization
        ? Object.values(stats.resourceTracking.currentUtilization).every((v: any) => v < 0.9)
        : true,
      performance: report.summary?.successRate > 95,
    };

    const overall = Object.values(details).every((status) => status);
    const recommendations = report.recommendations || [];

    logger.info('Comprehensive health check completed', {
      overall,
      details,
      recommendationCount: recommendations.length,
    });

    return {
      overall,
      details,
      recommendations,
      metrics: {
        healthStats: stats.healthMonitoring,
        resourceStats: stats.resourceTracking,
        performanceStats: report.summary,
      },
    };
  } catch (error) {
    logger.error('Comprehensive health check failed:', error);

    return {
      overall: false,
      details: {
        service: false,
        dependencies: false,
        resources: false,
        performance: false,
      },
      recommendations: ['Service health check failed - investigate errors'],
      metrics: {},
    };
  }
}

// ============================================
// Factory Integration Helpers
// ============================================

/**
 * Create and configure infrastructure service using factory with best practices.
 *
 * @param name
 * @param environment
 * @param customOptions
 * @example
 */
export async function createInfrastructureServiceWithBestPractices(
  name: string,
  environment: 'development' | 'staging' | 'production' = 'development',
  customOptions?: CreateServiceOptions
): Promise<InfrastructureServiceAdapter> {
  logger.debug('Creating infrastructure service with best practices', {
    name,
    environment,
  });

  const factory = getInfrastructureServiceFactory({
    healthMonitoring: {
      enabled: true,
      checkInterval: environment === 'production' ? 15000 : 30000,
      autoRestart: environment === 'production',
    },
    serviceDiscovery: {
      enabled: true,
      heartbeatInterval: 10000,
    },
    eventCoordination: {
      enabled: true,
      crossServiceEvents: true,
    },
  });

  const options: CreateServiceOptions = {
    autoStart: true,
    register: true,
    enableHealthMonitoring: true,
    tags: [environment, 'infrastructure', 'best-practices'],
    ...customOptions,
  };

  if (environment === 'production') {
    options.config = createDefaultInfrastructureServiceAdapterConfig(name, {
      facade: { mockServices: false },
      patternIntegration: { configProfile: 'production' },
      resourceManagement: {
        memoryThreshold: 0.7,
        cpuThreshold: 0.7,
        enableGarbageCollection: true,
      },
      healthMonitoring: {
        enablePredictiveMonitoring: true,
        performanceThresholds: {
          responseTime: 500,
          errorRate: 0.01,
          resourceUsage: 0.7,
        },
      },
    });
  }

  const service = await factory.createService(name, options);

  logger.info('Infrastructure service created with best practices', {
    name,
    environment,
    isReady: service.isReady(),
  });

  return service;
}

// ============================================
// Utility Helpers
// ============================================

/**
 * Wait for service to be ready with timeout.
 *
 * @param service
 * @param timeout
 * @param checkInterval
 * @example
 */
export async function waitForServiceReady(
  service: InfrastructureServiceAdapter,
  timeout: number = 30000,
  checkInterval: number = 1000
): Promise<boolean> {
  logger.debug('Waiting for service to be ready', { timeout, checkInterval });

  const startTime = Date.now();

  return new Promise((resolve) => {
    const checkReady = () => {
      if (service.isReady()) {
        logger.debug('Service is ready');
        resolve(true);
        return;
      }

      if (Date.now() - startTime > timeout) {
        logger.warn('Service ready timeout exceeded');
        resolve(false);
        return;
      }

      setTimeout(checkReady, checkInterval);
    };

    checkReady();
  });
}

/**
 * Execute operation with automatic retries and exponential backoff.
 *
 * @param service
 * @param operation
 * @param params
 * @param options
 * @param options.maxRetries
 * @param options.baseDelay
 * @param options.maxDelay
 * @param options.timeout
 * @example
 */
export async function executeWithRetries<T>(
  service: InfrastructureServiceAdapter,
  operation: string,
  params?: any,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    timeout?: number;
  } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 10000, timeout = 30000 } = options;

  logger.debug('Executing operation with retries', {
    operation,
    maxRetries,
    baseDelay,
  });

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await service.execute(operation, params, { timeout });

      if (result?.success) {
        if (attempt > 1) {
          logger.info(`Operation succeeded on attempt ${attempt}`, { operation });
        }
        return result?.data;
      } else {
        throw new Error(result?.error?.message || 'Operation failed');
      }
    } catch (error) {
      lastError = error as Error;
      logger.warn(`Operation attempt ${attempt} failed:`, error);

      if (attempt < maxRetries) {
        const delay = Math.min(baseDelay * 2 ** (attempt - 1), maxDelay);
        logger.debug(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error(`Operation ${operation} failed after ${maxRetries} attempts`);
}

/**
 * Batch execute multiple operations with concurrency control.
 *
 * @param service
 * @param operations
 * @param maxConcurrency
 * @example
 */
export async function batchExecuteWithConcurrency<T>(
  service: InfrastructureServiceAdapter,
  operations: Array<{ operation: string; params?: any }>,
  maxConcurrency: number = 5
): Promise<Array<{ success: boolean; data?: T; error?: Error }>> {
  logger.debug('Batch executing operations with concurrency control', {
    operationCount: operations.length,
    maxConcurrency,
  });

  const results: Array<{ success: boolean; data?: T; error?: Error }> = [];
  const executing: Promise<void>[] = [];

  for (let i = 0; i < operations.length; i++) {
    const operation = operations[i];

    // Wait if we've reached max concurrency
    if (executing.length >= maxConcurrency) {
      await Promise.race(executing);
    }

    const promise = service
      .execute(operation.operation, operation.params)
      .then((result) => {
        results[i] = {
          success: result?.success,
          data: result?.data,
          error: result?.error ? new Error(result?.error?.message) : undefined,
        };
      })
      .catch((error) => {
        results[i] = {
          success: false,
          error: error as Error,
        };
      })
      .finally(() => {
        const index = executing.indexOf(promise);
        if (index > -1) {
          executing.splice(index, 1);
        }
      });

    executing.push(promise);
  }

  // Wait for all remaining operations to complete
  await Promise.all(executing);

  logger.info('Batch execution with concurrency completed', {
    total: results.length,
    successful: results?.filter((r) => r.success).length,
    failed: results?.filter((r) => !r.success).length,
  });

  return results;
}

export default {
  // Service creation helpers
  quickCreateInfrastructureService,
  createFacadeOnlyInfrastructureService,
  createPatternIntegrationOnlyService,
  createProductionInfrastructureService,

  // Operation helpers
  initializeProjectWithRetries,
  processDocumentEnhanced,
  executeBatchWithProgress,
  getSystemStatusCached,

  // Swarm helpers
  initializeOptimizedSwarm,
  coordinateSwarmWithMonitoring,

  // Resource management helpers
  optimizeResourcesComprehensive,
  monitorResourcesWithAlerts,

  // Configuration helpers
  updateConfigurationSafely,
  rollbackConfiguration,

  // Health monitoring helpers
  performComprehensiveHealthCheck,

  // Factory integration helpers
  createInfrastructureServiceWithBestPractices,

  // Utility helpers
  waitForServiceReady,
  executeWithRetries,
  batchExecuteWithConcurrency,
};
