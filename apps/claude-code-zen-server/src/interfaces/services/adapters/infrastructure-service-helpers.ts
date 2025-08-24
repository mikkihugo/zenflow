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

import { getLogger } from '@claude-zen/foundation';

import type { ServiceOperationOptions } from '../core/interfaces';

import type {
  InfrastructureServiceAdapter,
  InfrastructureServiceAdapterConfig,
} from './infrastructure-service-adapter';
import {
  createDefaultInfrastructureServiceAdapterConfig,
  createInfrastructureServiceAdapter,
} from './infrastructure-service-adapter';
import { InfrastructureServiceFactory } from './infrastructure-service-factory';

const logger = getLogger('InfrastructureServiceHelpers');

// ============================================
// Service Creation Helpers
// ============================================

/**
 * Quick create infrastructure service with minimal configuration.
 *
 * @param name - Service name
 * @param options - Configuration options
 * @param options.enableFacade - Enable facade pattern
 * @param options.enablePatternIntegration - Enable pattern integration
 * @param options.enableResourceTracking - Enable resource tracking
 * @param options.enableHealthMonitoring - Enable health monitoring
 * @param options.autoStart - Auto-start the service
 * @returns Infrastructure service adapter
 *
 * @example
 * ```typescript
 * const service = await quickCreateInfrastructureService(
 *   'my-service',
 *   {
 *     enableFacade: true,
 *     enableHealthMonitoring: true,
 *     autoStart: true
 *   }
 * );
 * ```
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
  logger.debug('Quick creating infrastructure service', {
    name,
    options,
  });

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

  await service?.initialize();

  if (options?.autoStart !== false) {
    await service?.start();
  }

  return service;
}

/**
 * Create infrastructure service with facade-only configuration.
 *
 * @param name - Service name
 * @param facadeOptions - Facade configuration options
 * @param facadeOptions.mockServices - Enable mock services for testing
 * @param facadeOptions.enableCaching - Enable caching
 * @param facadeOptions.enableValidation - Enable validation
 * @returns Infrastructure service adapter
 */
export async function createFacadeOnlyInfrastructureService(
  name: string,
  facadeOptions: {
    mockServices?: boolean;
    enableCaching?: boolean;
    enableValidation?: boolean;
  } = {}
): Promise<InfrastructureServiceAdapter> {
  logger.debug('Creating facade-only infrastructure service', {
    name,
    facadeOptions,
  });

  const config = createDefaultInfrastructureServiceAdapterConfig(name, {
    facade: {
      enabled: true,
      autoInitialize: true,
      enableMetrics: true,
      enableHealthChecks: true,
      mockServices: facadeOptions.mockServices,
      enableCaching: facadeOptions.enableCaching,
      enableValidation: facadeOptions.enableValidation,
    },
    patternIntegration: {
      enabled: false,
    },
    resourceManagement: {
      enableResourceTracking: false,
      enableResourceOptimization: false,
    },
    healthMonitoring: {
      enableAdvancedChecks: false,
      enablePerformanceAlerts: false,
    },
  });

  const service = createInfrastructureServiceAdapter(config);
  await service?.initialize();
  return service;
}

/**
 * Create infrastructure service with full production configuration.
 *
 * @param name - Service name
 * @param productionOptions - Production configuration options
 * @param productionOptions.enableDistributedMode - Enable distributed mode
 * @param productionOptions.enableClusterMode - Enable cluster mode
 * @param productionOptions.enableLoadBalancing - Enable load balancing
 * @param productionOptions.enableFailover - Enable failover
 * @returns Infrastructure service adapter
 */
export async function createProductionInfrastructureService(
  name: string,
  productionOptions: {
    enableDistributedMode?: boolean;
    enableClusterMode?: boolean;
    enableLoadBalancing?: boolean;
    enableFailover?: boolean;
  } = {}
): Promise<InfrastructureServiceAdapter> {
  logger.debug('Creating production infrastructure service', {
    name,
    productionOptions,
  });

  const config = createDefaultInfrastructureServiceAdapterConfig(name, {
    facade: {
      enabled: true,
      autoInitialize: true,
      enableMetrics: true,
      enableHealthChecks: true,
    },
    patternIntegration: {
      enabled: true,
      enableAutoOptimization: true,
      enableDistributedMode: productionOptions.enableDistributedMode,
    },
    resourceManagement: {
      enableResourceTracking: true,
      enableResourceOptimization: true,
      enableClusterMode: productionOptions.enableClusterMode,
      enableLoadBalancing: productionOptions.enableLoadBalancing,
    },
    healthMonitoring: {
      enableAdvancedChecks: true,
      enablePerformanceAlerts: true,
      enableFailover: productionOptions.enableFailover,
    },
  });

  const service = createInfrastructureServiceAdapter(config);
  await service?.initialize();
  await service?.start();
  return service;
}

// ============================================
// Service Management Helpers
// ============================================

/**
 * Start multiple infrastructure services concurrently.
 *
 * @param services - Array of infrastructure service adapters
 * @param options - Start operation options
 * @returns Promise resolving when all services are started
 */
export async function startInfrastructureServices(
  services: InfrastructureServiceAdapter[],
  options: ServiceOperationOptions = {}
): Promise<void> {
  logger.info('Starting infrastructure services', { count: services.length });

  const startPromises = services.map(async (service, index) => {
    try {
      await service.start(options);
      logger.debug('Infrastructure service ' + index + ' started successfully');
    } catch (error) {
      logger.error(
        'Failed to start infrastructure service ' + index + ':',
        error
      );
      throw error;
    }
  });

  await Promise.all(startPromises);
  logger.info('All infrastructure services started successfully');
}

/**
 * Stop multiple infrastructure services gracefully.
 *
 * @param services - Array of infrastructure service adapters
 * @param options - Stop operation options
 * @returns Promise resolving when all services are stopped
 */
export async function stopInfrastructureServices(
  services: InfrastructureServiceAdapter[],
  options: ServiceOperationOptions = {}
): Promise<void> {
  logger.info('Stopping infrastructure services', { count: services.length });

  const stopPromises = services.map(async (service, index) => {
    try {
      await service.stop(options);
      logger.debug('Infrastructure service ' + index + ' stopped successfully');
    } catch (error) {
      logger.error(
        'Failed to stop infrastructure service ' + index + ':',
        error
      );
      throw error;
    }
  });

  await Promise.all(stopPromises);
  logger.info('All infrastructure services stopped successfully');
}

/**
 * Restart multiple infrastructure services.
 *
 * @param services - Array of infrastructure service adapters
 * @param options - Restart operation options
 * @returns Promise resolving when all services are restarted
 */
export async function restartInfrastructureServices(
  services: InfrastructureServiceAdapter[],
  options: ServiceOperationOptions = {}
): Promise<void> {
  logger.info('Restarting infrastructure services', { count: services.length });

  // Stop all services first
  await stopInfrastructureServices(services, options);

  // Then start them again
  await startInfrastructureServices(services, options);

  logger.info('All infrastructure services restarted successfully');
}

// ============================================
// Health Monitoring Helpers
// ============================================

/**
 * Check health status of multiple infrastructure services.
 *
 * @param services - Array of infrastructure service adapters
 * @returns Health status summary
 */
export async function checkInfrastructureServicesHealth(
  services: InfrastructureServiceAdapter[]
): Promise<{
  overall: 'healthy' | 'degraded' | 'unhealthy';
  services: Array<{
    index: number;
    status: 'healthy' | 'degraded' | 'unhealthy';
    details?: any;
  }>;
}> {
  logger.debug('Checking infrastructure services health', {
    count: services.length,
  });

  const healthChecks = await Promise.allSettled(
    services.map(async (service, index) => {
      try {
        const health = await service.getHealth?.();
        return {
          index,
          status: health?.status || 'unknown',
          details: health,
        };
      } catch (error) {
        return {
          index,
          status: 'unhealthy' as const,
          details: {
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        };
      }
    })
  );

  const serviceResults = healthChecks.map((result, index) => {
    return result.status === 'fulfilled'
      ? result.value
      : {
          index,
          status: 'unhealthy' as const,
          details: { error: result.reason },
        };
  });

  // Determine overall health
  const healthyCount = serviceResults.filter(
    (r) => r.status === 'healthy'
  ).length;
  const unhealthyCount = serviceResults.filter(
    (r) => r.status === 'unhealthy'
  ).length;

  let overall: 'healthy' | 'degraded' | 'unhealthy';
  if (unhealthyCount === 0) {
    overall = 'healthy';
  } else if (healthyCount > unhealthyCount) {
    overall = 'degraded';
  } else {
    overall = 'unhealthy';
  }

  return {
    overall,
    services: serviceResults,
  };
}

/**
 * Wait for infrastructure services to become healthy.
 *
 * @param services - Array of infrastructure service adapters
 * @param options - Wait options
 * @param options.timeout - Maximum wait time in milliseconds
 * @param options.checkInterval - Health check interval in milliseconds
 * @returns Promise resolving when services are healthy
 */
export async function waitForInfrastructureServicesHealthy(
  services: InfrastructureServiceAdapter[],
  options: {
    timeout?: number;
    checkInterval?: number;
  } = {}
): Promise<void> {
  const timeout = options.timeout || 30000; // 30 seconds default
  const checkInterval = options.checkInterval || 1000; // 1 second default
  const startTime = Date.now();

  logger.info('Waiting for infrastructure services to become healthy', {
    count: services.length,
    timeout,
    checkInterval,
  });

  while (Date.now() - startTime < timeout) {
    const health = await checkInfrastructureServicesHealth(services);

    if (health.overall === 'healthy') {
      logger.info('All infrastructure services are healthy');
      return;
    }

    logger.debug('Infrastructure services not yet healthy, waiting...', {
      overall: health.overall,
      elapsed: Date.now() - startTime,
    });

    await new Promise((resolve) => setTimeout(resolve, checkInterval));
  }

  throw new Error(
    'Infrastructure services did not become healthy within ' + timeout + 'ms'
  );
}

// ============================================
// Configuration Helpers
// ============================================

/**
 * Create infrastructure service configuration for testing.
 *
 * @param name - Service name
 * @param testOptions - Testing configuration options
 * @returns Infrastructure service adapter configuration
 */
export function createTestInfrastructureServiceConfig(
  name: string,
  testOptions: {
    enableMocking?: boolean;
    enableInMemoryMode?: boolean;
    disableNetworking?: boolean;
  } = {}
): InfrastructureServiceAdapterConfig {
  return createDefaultInfrastructureServiceAdapterConfig(name, {
    facade: {
      enabled: true,
      autoInitialize: true,
      enableMetrics: false,
      enableHealthChecks: false,
      mockServices: testOptions.enableMocking,
      inMemoryMode: testOptions.enableInMemoryMode,
    },
    patternIntegration: {
      enabled: false,
      disableNetworking: testOptions.disableNetworking,
    },
    resourceManagement: {
      enableResourceTracking: false,
      enableResourceOptimization: false,
    },
    healthMonitoring: {
      enableAdvancedChecks: false,
      enablePerformanceAlerts: false,
    },
  });
}

/**
 * Create infrastructure service configuration for development.
 *
 * @param name - Service name
 * @param devOptions - Development configuration options
 * @returns Infrastructure service adapter configuration
 */
export function createDevelopmentInfrastructureServiceConfig(
  name: string,
  devOptions: {
    enableHotReload?: boolean;
    enableDebugMode?: boolean;
    enableVerboseLogging?: boolean;
  } = {}
): InfrastructureServiceAdapterConfig {
  return createDefaultInfrastructureServiceAdapterConfig(name, {
    facade: {
      enabled: true,
      autoInitialize: true,
      enableMetrics: true,
      enableHealthChecks: true,
      enableDebugMode: devOptions.enableDebugMode,
      enableVerboseLogging: devOptions.enableVerboseLogging,
    },
    patternIntegration: {
      enabled: true,
      enableAutoOptimization: false,
      enableHotReload: devOptions.enableHotReload,
    },
    resourceManagement: {
      enableResourceTracking: true,
      enableResourceOptimization: false,
    },
    healthMonitoring: {
      enableAdvancedChecks: true,
      enablePerformanceAlerts: false,
    },
  });
}

// ============================================
// Utility Functions
// ============================================

/**
 * Get infrastructure service factory instance.
 *
 * @returns Infrastructure service factory
 */
export function getInfrastructureServiceFactory(): InfrastructureServiceFactory {
  return new InfrastructureServiceFactory();
}

/**
 * Validate infrastructure service configuration.
 *
 * @param config - Infrastructure service adapter configuration
 * @returns Validation result
 */
export function validateInfrastructureServiceConfig(
  config: InfrastructureServiceAdapterConfig
): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate required fields
  if (!config.name || typeof config.name !== 'string') {
    errors.push('Service name is required and must be a string');
  }

  if (!config.type || typeof config.type !== 'string') {
    errors.push('Service type is required and must be a string');
  }

  // Validate facade configuration
  if (config.facade?.enabled && !config.facade.autoInitialize) {
    warnings.push('Facade is enabled but auto-initialization is disabled');
  }

  // Validate resource management
  if (
    config.resourceManagement?.enableResourceOptimization &&
    !config.resourceManagement.enableResourceTracking
  ) {
    warnings.push(
      'Resource optimization is enabled but resource tracking is disabled'
    );
  }

  // Validate health monitoring
  if (
    config.healthMonitoring?.enablePerformanceAlerts &&
    !config.healthMonitoring.enableAdvancedChecks
  ) {
    warnings.push(
      'Performance alerts are enabled but advanced health checks are disabled'
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Create infrastructure service adapter with validation.
 *
 * @param config - Infrastructure service adapter configuration
 * @returns Infrastructure service adapter
 * @throws Error if configuration is invalid
 */
export function createValidatedInfrastructureServiceAdapter(
  config: InfrastructureServiceAdapterConfig
): InfrastructureServiceAdapter {
  const validation = validateInfrastructureServiceConfig(config);

  if (!validation.valid) {
    throw new Error(
      'Invalid infrastructure service configuration: ' +
        validation.errors.join(', ')
    );
  }

  if (validation.warnings.length > 0) {
    logger.warn(
      'Infrastructure service configuration warnings:',
      validation.warnings
    );
  }

  return createInfrastructureServiceAdapter(config);
}

// ============================================
// Export All Helper Functions
// ============================================

export {
  // Service creation
  quickCreateInfrastructureService,
  createFacadeOnlyInfrastructureService,
  createProductionInfrastructureService,
  // Service management
  startInfrastructureServices,
  stopInfrastructureServices,
  restartInfrastructureServices,
  // Health monitoring
  checkInfrastructureServicesHealth,
  waitForInfrastructureServicesHealthy,
  // Configuration
  createTestInfrastructureServiceConfig,
  createDevelopmentInfrastructureServiceConfig,
  // Utilities
  getInfrastructureServiceFactory,
  validateInfrastructureServiceConfig,
  createValidatedInfrastructureServiceAdapter,
};
