/**
 * @fileoverview Telemetry Integration with Foundation Configuration
 * 
 * Seamless integration between the telemetry system and foundation configuration.
 * Automatically configures telemetry from config settings and provides DI registration.
 */

import { getTelemetryConfig } from '../config';

import { getGlobalContainer, TOKENS } from './di';
import { Result, ok, err } from './error-handling';
import { getLogger } from './logging';
import { TelemetryManager, type TelemetryConfig } from './telemetry';

const logger = getLogger('telemetry-integration');

/**
 * Create a telemetry manager from foundation configuration
 */
export function createTelemetryFromConfig(): TelemetryManager {
  const config = getTelemetryConfig();
  
  const telemetryConfig: TelemetryConfig = {
    serviceName: config.serviceName,
    serviceVersion: config.serviceVersion,
    enableTracing: config.enableTracing,
    enableMetrics: config.enableMetrics,
    enableAutoInstrumentation: config.enableAutoInstrumentation,
    traceSamplingRatio: config.traceSamplingRatio,
    metricsInterval: config.metricsInterval,
    prometheusEndpoint: config.prometheusEndpoint,
    prometheusPort: config.prometheusPort,
    jaegerEndpoint: config.jaegerEndpoint,
    enableConsoleExporters: config.enableConsoleExporters
  };
  
  logger.debug('Creating telemetry manager from foundation config', { telemetryConfig });
  
  return new TelemetryManager(telemetryConfig);
}

/**
 * Initialize and register telemetry with the DI container
 */
export async function initializeAndRegisterTelemetry(): Promise<Result<TelemetryManager, Error>> {
  try {
    const telemetryManager = createTelemetryFromConfig();
    
    // Initialize telemetry
    const initResult = await telemetryManager.initialize();
    if (initResult.isErr()) {
      return err(initResult.error);
    }
    
    // Register with DI container
    const container = getGlobalContainer();
    container.registerInstance(TOKENS.TelemetryManager, telemetryManager);
    
    logger.info('✅ Telemetry initialized and registered with DI container');
    
    return ok(telemetryManager);
  } catch (error) {
    logger.error('Failed to initialize and register telemetry', { error });
    return err(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Auto-configure telemetry for the entire foundation package
 * Call this once during application startup
 */
export async function autoConfigureTelemetry(): Promise<Result<void, Error>> {
  const config = getTelemetryConfig();
  
  // Only auto-configure if telemetry is enabled
  if (!config.enableTracing && !config.enableMetrics) {
    logger.debug('Telemetry disabled in configuration, skipping auto-configuration');
    return ok();
  }
  
  const result = await initializeAndRegisterTelemetry();
  if (result.isErr()) {
    return err(result.error);
  }
  
  logger.info('Telemetry auto-configuration completed successfully');
  return ok();
}

/**
 * Get telemetry manager from DI container
 */
export function getTelemetryFromDI(): TelemetryManager | null {
  try {
    const container = getGlobalContainer();
    if (container.isRegistered(TOKENS.TelemetryManager)) {
      return container.resolve(TOKENS.TelemetryManager);
    }
    return null;
  } catch (error) {
    logger.warn('Failed to get telemetry manager from DI container', { error });
    return null;
  }
}

/**
 * Shutdown telemetry and clean up DI registration
 */
export async function shutdownAndCleanupTelemetry(): Promise<Result<void, Error>> {
  try {
    const telemetryManager = getTelemetryFromDI();
    
    if (telemetryManager) {
      // Shutdown telemetry
      const shutdownResult = await telemetryManager.shutdown();
      if (shutdownResult.isErr()) {
        logger.warn('Error during telemetry shutdown', { error: shutdownResult.error });
      }
      
      // Clean up DI registration
      const container = getGlobalContainer();
      if (container.isRegistered(TOKENS.TelemetryManager) && // Note: TSyringe doesn't have direct unregister, but clearing instances works
        typeof container.clear === 'function') {
          container.clear();
        }
    }
    
    logger.info('Telemetry shutdown and cleanup completed');
    return ok();
  } catch (error) {
    logger.error('Failed to shutdown and cleanup telemetry', { error });
    return err(error instanceof Error ? error : new Error(String(error)));
  }
}

// Export all functions individually 
// (already exported inline above)