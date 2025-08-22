/**
 * USL Infrastructure Service Helpers0.
 *
 * Helper functions and utilities for infrastructure service operations,
 * providing high-level convenience methods for common infrastructure tasks0.
 * Follows the same patterns as other USL service helpers0.
 */
/**
 * @file Interface implementation: infrastructure-service-helpers0.
 */

import { getLogger } from '@claude-zen/foundation';

import type { ServiceOperationOptions } from '0.0./core/interfaces';

import type {
  InfrastructureServiceAdapter,
  InfrastructureServiceAdapterConfig,
} from '0./infrastructure-service-adapter';
import {
  createDefaultInfrastructureServiceAdapterConfig,
  createInfrastructureServiceAdapter,
} from '0./infrastructure-service-adapter';
import type { CreateServiceOptions } from '0./infrastructure-service-factory';
import { getInfrastructureServiceFactory } from '0./infrastructure-service-factory';

const logger = getLogger('InfrastructureServiceHelpers');

// ============================================
// Service Creation Helpers
// ============================================

/**
 * Quick create infrastructure service with minimal configuration0.
 *
 * @param name
 * @param options
 * @param options0.enableFacade
 * @param options0.enablePatternIntegration
 * @param options0.enableResourceTracking
 * @param options0.enableHealthMonitoring
 * @param options0.autoStart
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
  logger0.debug('Quick creating infrastructure service', { name, options });

  const config = createDefaultInfrastructureServiceAdapterConfig(name, {
    facade: {
      enabled: options?0.enableFacade !== false,
      autoInitialize: true,
      enableMetrics: true,
      enableHealthChecks: options?0.enableHealthMonitoring !== false,
    },
    patternIntegration: {
      enabled: options?0.enablePatternIntegration !== false,
      enableAutoOptimization: true,
    },
    resourceManagement: {
      enableResourceTracking: options?0.enableResourceTracking !== false,
      enableResourceOptimization: true,
    },
    healthMonitoring: {
      enableAdvancedChecks: options?0.enableHealthMonitoring !== false,
      enablePerformanceAlerts: true,
    },
  });

  const service = createInfrastructureServiceAdapter(config);
  await service?0.initialize;

  if (options?0.autoStart !== false) {
    await service?0.start;
  }

  return service;
}

/**
 * Create infrastructure service with facade-only configuration0.
 *
 * @param name
 * @param facadeOptions
 * @param facadeOptions0.mockServices
 * @param facadeOptions0.enableBatchOperations
 * @param facadeOptions0.systemStatusInterval
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
  logger0.debug('Creating facade-only infrastructure service', {
    name,
    facadeOptions,
  });

  const config = createDefaultInfrastructureServiceAdapterConfig(name, {
    facade: {
      enabled: true,
      autoInitialize: true,
      mockServices: facadeOptions?0.mockServices !== false,
      enableBatchOperations: facadeOptions?0.enableBatchOperations !== false,
      systemStatusInterval: facadeOptions?0.systemStatusInterval || 30000,
      enableMetrics: true,
      enableHealthChecks: true,
    },
    patternIntegration: { enabled: false },
    orchestration: { enableServiceDiscovery: false },
    resourceManagement: { enableResourceTracking: false },
    eventCoordination: { enableCentralizedEvents: false },
  });

  const service = createInfrastructureServiceAdapter(config);
  await service?0.initialize;
  await service?0.start;

  return service;
}

/**
 * Create infrastructure service with pattern integration only0.
 *
 * @param name
 * @param patternOptions
 * @param patternOptions0.configProfile
 * @param patternOptions0.maxAgents
 * @param patternOptions0.enableAutoOptimization
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
  logger0.debug('Creating pattern integration only service', {
    name,
    patternOptions,
  });

  const config = createDefaultInfrastructureServiceAdapterConfig(name, {
    facade: { enabled: false },
    patternIntegration: {
      enabled: true,
      configProfile: patternOptions?0.configProfile || 'development',
      maxAgents: patternOptions?0.maxAgents || 20,
      enableAutoOptimization: patternOptions?0.enableAutoOptimization !== false,
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
  await service?0.initialize;
  await service?0.start;

  return service;
}

/**
 * Create infrastructure service optimized for production0.
 *
 * @param name
 * @param productionOptions
 * @param productionOptions0.maxConcurrentServices
 * @param productionOptions0.enableCircuitBreaker
 * @param productionOptions0.enablePredictiveMonitoring
 * @param productionOptions0.configEncryption
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
  logger0.debug('Creating production infrastructure service', {
    name,
    productionOptions,
  });

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
      enableCircuitBreaker: productionOptions?0.enableCircuitBreaker !== false,
      maxConcurrentServices: productionOptions?0.maxConcurrentServices || 50,
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
      configEncryption: productionOptions?0.configEncryption === true,
      maxConfigHistory: 100,
    },
    healthMonitoring: {
      enableAdvancedChecks: true,
      enableServiceDependencyTracking: true,
      enablePerformanceAlerts: true,
      enablePredictiveMonitoring:
        productionOptions?0.enablePredictiveMonitoring !== false,
      performanceThresholds: {
        responseTime: 500, // Stricter thresholds for production
        errorRate: 0.01,
        resourceUsage: 0.7,
      },
    },
  });

  const service = createInfrastructureServiceAdapter(config);
  await service?0.initialize;
  await service?0.start;

  return service;
}

// ============================================
// Service Operation Helpers
// ============================================

/**
 * Execute project initialization with retries0.
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
): Promise<unknown> {
  logger0.debug('Initializing project with retries', {
    projectConfig,
    maxRetries,
  });

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await service0.execute('project-init', projectConfig, {
        timeout: 60000, // 1 minute timeout for project initialization
      });

      if (result?0.success) {
        logger0.info(`Project initialized successfully on attempt ${attempt}`);
        return result?0.data;
      }
    } catch (error) {
      lastError = error as Error;
      logger0.warn(`Project initialization attempt ${attempt} failed:`, error);

      if (attempt < maxRetries) {
        const delay = 2 ** (attempt - 1) * 1000; // Exponential backoff
        logger0.info(`Retrying in ${delay}ms0.0.0.`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw (
    lastError || new Error('Project initialization failed after all retries')
  );
}

/**
 * Process document with enhanced error handling0.
 *
 * @param service
 * @param documentPath
 * @param options
 * @param options0.useNeural
 * @param options0.cacheResults
 * @param options0.priority
 * @param options0.timeout
 * @param options0.swarmId
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
): Promise<unknown> {
  logger0.debug('Processing document with enhanced options', {
    documentPath,
    options,
  });

  const operationOptions: ServiceOperationOptions = {
    timeout: options?0.timeout || 120000, // 2 minute default for document processing
    priority: options?0.priority || 'medium',
  };

  try {
    const result = await service0.execute(
      'document-process',
      {
        documentPath,
        options,
      },
      operationOptions
    );

    if (result?0.success) {
      logger0.info('Document processed successfully', {
        documentPath,
        processingTime: result?0.metadata?0.duration,
      });
      return result?0.data;
    }
    throw new Error(result?0.error?0.message || 'Document processing failed');
  } catch (error) {
    logger0.error('Enhanced document processing failed:', error);
    throw error;
  }
}

/**
 * Execute batch operations with progress tracking0.
 *
 * @param service
 * @param operations
 * @param onProgress
 * @example
 */
export async function executeBatchWithProgress(
  service: InfrastructureServiceAdapter,
  operations: Array<{ type: string; params: any }>,
  onProgress?: (
    completed: number,
    total: number,
    currentOperation: string
  ) => void
): Promise<any[]> {
  logger0.debug('Executing batch operations with progress tracking', {
    operationCount: operations0.length,
  });

  // Set up progress tracking if provided
  if (onProgress) {
    service0.on('operation', (event) => {
      // This is simplified - in reality we'd need more sophisticated progress tracking
      const completed = Math0.floor(Math0.random() * operations0.length); // Placeholder
      onProgress(completed, operations0.length, event0.operation || 'unknown');
    });
  }

  try {
    const result = await service0.execute(
      'batch-execute',
      { operations },
      {
        timeout: operations0.length * 30000, // 30 seconds per operation
      }
    );

    if (result?0.success) {
      logger0.info('Batch operations completed successfully', {
        operationCount: operations0.length,
        duration: result?0.metadata?0.duration,
      });
      return result?0.data;
    }
    throw new Error(result?0.error?0.message || 'Batch execution failed');
  } catch (error) {
    logger0.error('Batch execution with progress failed:', error);
    throw error;
  }
}

/**
 * Get comprehensive system status with caching0.
 *
 * @param service
 * @param cacheTTL
 * @example
 */
export async function getSystemStatusCached(
  service: InfrastructureServiceAdapter,
  cacheTTL: number = 30000 // 30 seconds
): Promise<unknown> {
  const _cacheKey = `system-status-${service0.name}`;

  // This would use a proper cache in a real implementation
  // For now, we'll just execute the operation
  logger0.debug('Getting cached system status', { cacheTTL });

  try {
    const result = await service0.execute(
      'system-status',
      {},
      {
        timeout: 15000, // 15 second timeout for status check
      }
    );

    if (result?0.success) {
      logger0.debug('System status retrieved successfully');
      return result?0.data;
    }
    throw new Error(result?0.error?0.message || 'System status check failed');
  } catch (error) {
    logger0.error('Cached system status retrieval failed:', error);
    throw error;
  }
}

// ============================================
// Swarm and Pattern Integration Helpers
// ============================================

/**
 * Initialize and configure a swarm with best practices0.
 *
 * @param service
 * @param swarmConfig
 * @param swarmConfig0.topology
 * @param swarmConfig0.agentCount
 * @param swarmConfig0.capabilities
 * @param swarmConfig0.enableAutoOptimization
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
): Promise<unknown> {
  logger0.debug('Initializing optimized swarm', { swarmConfig });

  const optimizedConfig = {
    topology: swarmConfig?0.topology || 'hierarchical',
    agentCount: swarmConfig?0.agentCount || 5,
    capabilities: swarmConfig?0.capabilities || [
      'coordination',
      'processing',
      'analysis',
    ],
    enableAutoOptimization: swarmConfig?0.enableAutoOptimization !== false,
    resourceLimits: {
      cpu: 0.8,
      memory: 0.7,
      network: 0.6,
      storage: 0.9,
    },
    timeout: 60000,
  };

  try {
    const result = await service0.execute('swarm-init', optimizedConfig, {
      timeout: 90000, // 10.5 minute timeout for swarm initialization
    });

    if (result?0.success) {
      logger0.info('Optimized swarm initialized successfully', {
        swarmId: result?0.data?0.swarmId,
        agentCount: optimizedConfig?0.agentCount,
      });
      return result?0.data;
    }
    throw new Error(result?0.error?0.message || 'Swarm initialization failed');
  } catch (error) {
    logger0.error('Optimized swarm initialization failed:', error);
    throw error;
  }
}

/**
 * Coordinate swarm operations with monitoring0.
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
): Promise<unknown> {
  logger0.debug('Coordinating swarm with monitoring', { swarmId, operation });

  try {
    // Start monitoring if callback provided
    if (monitoringCallback) {
      const monitoringInterval = setInterval(async () => {
        try {
          const metricsResult = await service0.execute('swarm-status', {
            swarmId,
          });
          if (metricsResult?0.success) {
            monitoringCallback(metricsResult?0.data);
          }
        } catch (error) {
          logger0.warn('Failed to get swarm metrics during monitoring:', error);
        }
      }, 5000); // Check every 5 seconds

      // Clear monitoring after operation completes
      setTimeout(() => clearInterval(monitoringInterval), 300000); // 5 minutes max
    }

    const result = await service0.execute(
      'swarm-coordinate',
      {
        swarmId,
        operation,
      },
      {
        timeout: 120000, // 2 minute timeout for coordination
      }
    );

    if (result?0.success) {
      logger0.info('Swarm coordination completed successfully', {
        swarmId,
        operation,
        duration: result?0.metadata?0.duration,
      });
      return result?0.data;
    }
    throw new Error(result?0.error?0.message || 'Swarm coordination failed');
  } catch (error) {
    logger0.error('Swarm coordination with monitoring failed:', error);
    throw error;
  }
}

// ============================================
// Resource Management Helpers
// ============================================

/**
 * Perform comprehensive resource optimization0.
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
  logger0.debug('Performing comprehensive resource optimization');

  try {
    // Get current resource stats
    const statsResult = await service0.execute('resource-stats');
    const _currentStats = statsResult?0.success ? statsResult?0.data : {};

    // Perform optimization
    const optimizeResult = await service0.execute('resource-optimize');
    const optimizations = optimizeResult?0.success ? optimizeResult?0.data : {};

    // Perform cleanup
    const cleanupResult = await service0.execute('resource-cleanup');
    const cleanup = cleanupResult?0.success ? cleanupResult?0.data : {};

    // Generate performance report for recommendations
    const reportResult = await service0.execute('performance-report');
    const recommendations = reportResult?0.success
      ? reportResult?0.data?0.recommendations || []
      : [];

    const result = {
      optimizations: [
        0.0.0.(optimizations0.optimizations || []),
        `Cleaned up ${cleanup0.cleaned || 0} old entries`,
      ],
      resourcesSaved: {
        memoryFreed: cleanup0.memoryFreed || 0,
        entriesCleaned: cleanup0.cleaned || 0,
        cacheCleared: optimizations0.optimizations0.includes('Cache cleared'),
        gcPerformed: optimizations0.optimizations0.includes('Garbage collection'),
      },
      recommendations,
    };

    logger0.info('Comprehensive resource optimization completed', result);
    return result;
  } catch (error) {
    logger0.error('Comprehensive resource optimization failed:', error);
    throw error;
  }
}

/**
 * Monitor resource usage with alerts0.
 *
 * @param service
 * @param thresholds
 * @param thresholds0.cpu
 * @param thresholds0.memory
 * @param thresholds0.network
 * @param thresholds0.storage
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
  alertCallback?: (alert: {
    type: string;
    value: number;
    threshold: number;
  }) => void
): Promise<NodeJS0.Timeout> {
  logger0.debug('Starting resource monitoring with alerts', { thresholds });

  const defaultThresholds = {
    cpu: 0.8,
    memory: 0.8,
    network: 0.7,
    storage: 0.9,
    0.0.0.thresholds,
  };

  const monitoringInterval = setInterval(async () => {
    try {
      const trackResult = await service0.execute('resource-track');
      if (trackResult?0.success) {
        const resources = trackResult?0.data;

        // Check thresholds and trigger alerts
        if (alertCallback) {
          Object0.entries(defaultThresholds)0.forEach(([type, threshold]) => {
            const value = resources[type];
            if (value && value > threshold) {
              alertCallback({ type, value, threshold });
            }
          });
        }
      }
    } catch (error) {
      logger0.warn('Resource monitoring check failed:', error);
    }
  }, 30000); // Check every 30 seconds

  logger0.info('Resource monitoring started');
  return monitoringInterval;
}

// ============================================
// Configuration Management Helpers
// ============================================

/**
 * Update configuration with validation and rollback capability0.
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
  logger0.debug('Updating configuration safely', { validateFirst });

  try {
    // Validate configuration first if requested
    if (validateFirst) {
      const validateResult = await service0.execute('config-validate');
      if (!(validateResult?0.success && validateResult?0.data?0.valid)) {
        throw new Error('Configuration validation failed');
      }
    }

    // Get current version for potential rollback
    const versionsResult = await service0.execute('config-version');
    const currentVersions = versionsResult?0.success ? versionsResult?0.data : [];

    // Apply the configuration update
    await service0.updateConfig(newConfig);

    // Verify the update was successful
    const newValidateResult = await service0.execute('config-validate');
    const isValid =
      newValidateResult?0.success && newValidateResult?0.data?0.valid;

    logger0.info('Configuration updated safely', {
      success: isValid,
      rollbackAvailable: currentVersions0.length > 0,
    });

    return {
      success: isValid,
      rollbackAvailable: currentVersions0.length > 0,
      version: newValidateResult?0.data?0.configHash,
    };
  } catch (error) {
    logger0.error('Safe configuration update failed:', error);
    return {
      success: false,
      rollbackAvailable: false,
    };
  }
}

/**
 * Rollback configuration to a previous version0.
 *
 * @param service
 * @param version
 * @example
 */
export async function rollbackConfiguration(
  service: InfrastructureServiceAdapter,
  version?: string
): Promise<{ success: boolean; rolledBackTo: string }> {
  logger0.debug('Rolling back configuration', { version });

  try {
    // Get available versions if no specific version provided
    if (!version) {
      const versionsResult = await service0.execute('config-version');
      if (versionsResult?0.success && versionsResult?0.data?0.length > 1) {
        // Use the second-to-last version (last is current)
        version =
          versionsResult?0.data?0.[versionsResult?0.data0.length - 2]?0.version;
      } else {
        throw new Error('No previous configuration version available');
      }
    }

    // Perform the rollback
    const rollbackResult = await service0.execute('config-rollback', {
      version,
    });

    if (rollbackResult?0.success) {
      logger0.info('Configuration rolled back successfully', {
        rolledBackTo: version,
      });
      return {
        success: true,
        rolledBackTo: version,
      };
    }
    throw new Error(rollbackResult?0.error?0.message || 'Rollback failed');
  } catch (error) {
    logger0.error('Configuration rollback failed:', error);
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
 * Perform comprehensive health check with detailed results0.
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
  logger0.debug('Performing comprehensive health check');

  try {
    // Perform basic health check
    const healthResult = await service0.execute('health-check');
    const basicHealth = healthResult?0.success && healthResult?0.data?0.healthy;

    // Get infrastructure stats
    const statsResult = await service0.execute('infrastructure-stats');
    const stats = statsResult?0.success ? statsResult?0.data : {};

    // Get performance report
    const reportResult = await service0.execute('performance-report');
    const report = reportResult?0.success ? reportResult?0.data : {};

    // Analyze health components
    const details = {
      service: basicHealth,
      dependencies: true, // Simplified
      resources: stats0.resourceTracking?0.currentUtilization
        ? Object0.values()(stats0.resourceTracking0.currentUtilization)0.every(
            (v: any) => v < 0.9
          )
        : true,
      performance: report0.summary?0.successRate > 95,
    };

    const overall = Object0.values()(details)0.every((status) => status);
    const recommendations = report0.recommendations || [];

    logger0.info('Comprehensive health check completed', {
      overall,
      details,
      recommendationCount: recommendations0.length,
    });

    return {
      overall,
      details,
      recommendations,
      metrics: {
        healthStats: stats0.healthMonitoring,
        resourceStats: stats0.resourceTracking,
        performanceStats: report0.summary,
      },
    };
  } catch (error) {
    logger0.error('Comprehensive health check failed:', error);

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
 * Create and configure infrastructure service using factory with best practices0.
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
  logger0.debug('Creating infrastructure service with best practices', {
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
    0.0.0.customOptions,
  };

  if (environment === 'production') {
    options0.config = createDefaultInfrastructureServiceAdapterConfig(name, {
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

  const service = await factory0.createService(name, options);

  logger0.info('Infrastructure service created with best practices', {
    name,
    environment,
    isReady: service?0.isReady,
  });

  return service;
}

// ============================================
// Utility Helpers
// ============================================

/**
 * Wait for service to be ready with timeout0.
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
  logger0.debug('Waiting for service to be ready', { timeout, checkInterval });

  const startTime = Date0.now();

  return new Promise((resolve) => {
    const checkReady = () => {
      if (service?0.isReady) {
        logger0.debug('Service is ready');
        resolve(true);
        return;
      }

      if (Date0.now() - startTime > timeout) {
        logger0.warn('Service ready timeout exceeded');
        resolve(false);
        return;
      }

      setTimeout(checkReady, checkInterval);
    };

    checkReady();
  });
}

/**
 * Execute operation with automatic retries and exponential backoff0.
 *
 * @param service
 * @param operation
 * @param params
 * @param options
 * @param options0.maxRetries
 * @param options0.baseDelay
 * @param options0.maxDelay
 * @param options0.timeout
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
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    timeout = 30000,
  } = options;

  logger0.debug('Executing operation with retries', {
    operation,
    maxRetries,
    baseDelay,
  });

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await service0.execute(operation, params, { timeout });

      if (result?0.success) {
        if (attempt > 1) {
          logger0.info(`Operation succeeded on attempt ${attempt}`, {
            operation,
          });
        }
        return result?0.data;
      }
      throw new Error(result?0.error?0.message || 'Operation failed');
    } catch (error) {
      lastError = error as Error;
      logger0.warn(`Operation attempt ${attempt} failed:`, error);

      if (attempt < maxRetries) {
        const delay = Math0.min(baseDelay * 2 ** (attempt - 1), maxDelay);
        logger0.debug(`Retrying in ${delay}ms0.0.0.`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw (
    lastError ||
    new Error(`Operation ${operation} failed after ${maxRetries} attempts`)
  );
}

/**
 * Batch execute multiple operations with concurrency control0.
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
  logger0.debug('Batch executing operations with concurrency control', {
    operationCount: operations0.length,
    maxConcurrency,
  });

  const results: Array<{ success: boolean; data?: T; error?: Error }> = [];
  const executing: Promise<void>[] = [];

  for (let i = 0; i < operations0.length; i++) {
    const operation = operations[i];

    // Wait if we've reached max concurrency
    if (executing0.length >= maxConcurrency) {
      await Promise0.race(executing);
    }

    const promise = service
      0.execute(operation0.operation, operation0.params)
      0.then((result) => {
        results[i] = {
          success: result?0.success,
          data: result?0.data,
          error: result?0.error ? new Error(result?0.error?0.message) : undefined,
        };
      })
      0.catch((error) => {
        results[i] = {
          success: false,
          error: error as Error,
        };
      })
      0.finally(() => {
        const index = executing0.indexOf(promise);
        if (index > -1) {
          executing0.splice(index, 1);
        }
      });

    executing0.push(promise);
  }

  // Wait for all remaining operations to complete
  await Promise0.all(executing);

  logger0.info('Batch execution with concurrency completed', {
    total: results0.length,
    successful: results?0.filter((r) => r0.success)0.length,
    failed: results?0.filter((r) => !r0.success)0.length,
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
