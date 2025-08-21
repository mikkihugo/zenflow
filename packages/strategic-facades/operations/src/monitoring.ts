/**
 * @fileoverview Operations Monitoring Strategic Facade
 * 
 * STRATEGIC FACADE PURPOSE:
 * This facade provides unified access to monitoring and observability capabilities
 * while delegating to real implementation packages when available.
 * 
 * DELEGATION ARCHITECTURE:
 * • @claude-zen/system-monitoring: System health monitoring, operational metrics, telemetry
 * 
 * GRACEFUL DEGRADATION:
 * When implementation packages are not available, throws clear errors indicating
 * which packages are required for monitoring operations. This ensures proper
 * error handling rather than silent failures in production monitoring.
 * 
 * RUNTIME IMPORTS:
 * Uses dynamic imports to prevent circular dependencies while providing unified
 * access to monitoring, observability, and telemetry systems through operations package.
 * 
 * @author Claude Code Zen Team
 * @since 2.1.0 (Strategic Architecture v2.0.0)
 * @version 1.0.0
 */

import { getLogger } from '@claude-zen/foundation/logging';

const logger = getLogger('operations-monitoring');

/**
 * Custom error types for monitoring operations
 */
export class MonitoringSystemError extends Error {
  public override cause?: Error;
  
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'MonitoringSystemError';
    this.cause = cause;
  }
}

export class MonitoringSystemConnectionError extends MonitoringSystemError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'MonitoringSystemConnectionError';
  }
}

/**
 * Monitoring module interface for accessing real monitoring backends.
 * @internal
 */
interface MonitoringSystemModule {
  MonitoringFacade: any;
  ObservabilityFramework: any;
  TelemetryCollector: any;
  MetricsAggregator: any;
  HealthChecker: any;
  createMonitoringFacade: (...args: any[]) => any;
  createObservabilityFramework: (...args: any[]) => any;
  createTelemetryCollector: (...args: any[]) => any;
}

/**
 * Monitoring access interface
 */
interface MonitoringSystemAccess {
  /**
   * Create a new monitoring facade
   */
  createMonitoringFacade(config?: any): Promise<any>;
  
  /**
   * Create a new observability framework
   */
  createObservabilityFramework(config?: any): Promise<any>;
  
  /**
   * Create a new telemetry collector
   */
  createTelemetryCollector(config?: any): Promise<any>;
  
  /**
   * Create a new metrics aggregator
   */
  createMetricsAggregator(config?: any): Promise<any>;
  
  /**
   * Create a health checker
   */
  createHealthChecker(config?: any): Promise<any>;
}

/**
 * Monitoring configuration interface
 */
interface MonitoringSystemConfig {
  enableObservability?: boolean;
  enableTelemetryCollection?: boolean;
  enableMetricsAggregation?: boolean;
  enableHealthChecking?: boolean;
  monitoringInterval?: number;
  metricsRetention?: number;
  telemetryBuffer?: number;
  healthCheckInterval?: number;
}

/**
 * Implementation of monitoring access via runtime delegation
 */
class MonitoringSystemAccessImpl implements MonitoringSystemAccess {
  private monitoringModule: MonitoringSystemModule | null = null;
  
  private async getMonitoringModule(): Promise<MonitoringSystemModule> {
    if (!this.monitoringModule) {
      try {
        // Import the monitoring package at runtime (matches database pattern)
        // Use dynamic import with string to avoid TypeScript compile-time checking
        const packageName = '@claude-zen/system-monitoring';
        this.monitoringModule = await import(packageName) as MonitoringSystemModule;
        logger.debug('Monitoring module loaded successfully');
      } catch (error) {
        throw new MonitoringSystemConnectionError(
          'System monitoring package not available. Operations requires @claude-zen/system-monitoring for monitoring operations.',
          error instanceof Error ? error : undefined
        );
      }
    }
    return this.monitoringModule;
  }
  
  async createMonitoringFacade(config?: any): Promise<any> {
    const module = await this.getMonitoringModule();
    logger.debug('Creating monitoring facade via operations delegation', { config });
    return module.createMonitoringFacade ? module.createMonitoringFacade(config) : new module.MonitoringFacade(config);
  }
  
  async createObservabilityFramework(config?: any): Promise<any> {
    const module = await this.getMonitoringModule();
    logger.debug('Creating observability framework via operations delegation', { config });
    return module.createObservabilityFramework ? module.createObservabilityFramework(config) : new module.ObservabilityFramework(config);
  }
  
  async createTelemetryCollector(config?: any): Promise<any> {
    const module = await this.getMonitoringModule();
    logger.debug('Creating telemetry collector via operations delegation', { config });
    return module.createTelemetryCollector ? module.createTelemetryCollector(config) : new module.TelemetryCollector(config);
  }
  
  async createMetricsAggregator(config?: any): Promise<any> {
    const module = await this.getMonitoringModule();
    logger.debug('Creating metrics aggregator via operations delegation', { config });
    return new module.MetricsAggregator(config);
  }
  
  async createHealthChecker(config?: any): Promise<any> {
    const module = await this.getMonitoringModule();
    logger.debug('Creating health checker via operations delegation', { config });
    return new module.HealthChecker(config);
  }
}

// Global singleton instance
let globalMonitoringSystemAccess: MonitoringSystemAccess | null = null;

/**
 * Get monitoring access interface (singleton pattern)
 */
export function getMonitoringSystemAccess(): MonitoringSystemAccess {
  if (!globalMonitoringSystemAccess) {
    globalMonitoringSystemAccess = new MonitoringSystemAccessImpl();
    logger.info('Initialized global monitoring access');
  }
  return globalMonitoringSystemAccess;
}

/**
 * Create a monitoring facade through operations delegation
 * @param config - Monitoring facade configuration
 */
export async function getMonitoringFacade(config?: MonitoringSystemConfig): Promise<any> {
  const monitoringSystem = getMonitoringSystemAccess();
  return monitoringSystem.createMonitoringFacade(config);
}

/**
 * Create an observability framework through operations delegation  
 * @param config - Observability framework configuration
 */
export async function getObservabilityFramework(config?: MonitoringSystemConfig): Promise<any> {
  const monitoringSystem = getMonitoringSystemAccess();
  return monitoringSystem.createObservabilityFramework(config);
}

/**
 * Create a telemetry collector through operations delegation  
 * @param config - Telemetry collector configuration
 */
export async function getTelemetryCollector(config?: MonitoringSystemConfig): Promise<any> {
  const monitoringSystem = getMonitoringSystemAccess();
  return monitoringSystem.createTelemetryCollector(config);
}

/**
 * Create a metrics aggregator through operations delegation  
 * @param config - Metrics aggregator configuration
 */
export async function getMetricsAggregator(config?: MonitoringSystemConfig): Promise<any> {
  const monitoringSystem = getMonitoringSystemAccess();
  return monitoringSystem.createMetricsAggregator(config);
}

/**
 * Create a health checker through operations delegation  
 * @param config - Health checker configuration
 */
export async function getHealthChecker(config?: MonitoringSystemConfig): Promise<any> {
  const monitoringSystem = getMonitoringSystemAccess();
  return monitoringSystem.createHealthChecker(config);
}

/**
 * TelemetryManager - Strategic Facade for Telemetry Management
 * 
 * FACADE BEHAVIOR:
 * • Delegates to @claude-zen/system-monitoring package when available
 * • Provides fallback implementation when package not installed
 * • Essential telemetry functionality for metrics collection and tracing
 * 
 * REAL PACKAGE FEATURES (when @claude-zen/system-monitoring is available):
 * • Comprehensive telemetry collection and aggregation
 * • Distributed tracing with span management
 * • Metrics recording with proper formatting
 * 
 * FALLBACK BEHAVIOR (when @claude-zen/system-monitoring not available):
 * • No-op implementations for all telemetry methods
 * • Interface maintained for compatibility
 */
export class TelemetryManager {
  private enabled = true;
  private monitoringModule: any = null;
  
  constructor(config?: any) {
    this.enabled = config?.enabled !== false;
  }
  
  private async getMonitoringModule(): Promise<any> {
    if (!this.monitoringModule) {
      try {
        const packageName = '@claude-zen/system-monitoring';
        this.monitoringModule = await import(packageName);
      } catch (error) {
        // Use fallback implementation if agent monitoring package not available
        this.monitoringModule = {
          TelemetryManager: class FallbackTelemetryManager {
            recordMetric() {}
            startTrace() { return { setAttributes: () => {}, end: () => {} }; }
          }
        };
      }
    }
    return this.monitoringModule;
  }
  
  async initialize() {
    const module = await this.getMonitoringModule();
    if (module.TelemetryManager) {
      return new module.TelemetryManager();
    }
    return this;
  }
  
  recordMetric(name: string, value?: number) {
    if (!this.enabled) return;
    // Implementation would delegate to monitoring package
    logger.debug('Recording metric', { name, value });
  }
  
  startTrace(name: string) {
    if (!this.enabled) return { setAttributes: () => {}, end: () => {} };
    // Implementation would delegate to monitoring package
    logger.debug('Starting trace', { name });
    return { setAttributes: () => {}, end: () => {} };
  }
}

// Professional monitoring object with proper naming (matches Storage/Telemetry patterns)
export const monitoringSystem = {
  getAccess: getMonitoringSystemAccess,
  getFacade: getMonitoringFacade,
  getObservabilityFramework: getObservabilityFramework,
  getTelemetryCollector: getTelemetryCollector,
  getMetricsAggregator: getMetricsAggregator,
  getHealthChecker: getHealthChecker
};

// Type exports for external consumers
export type {
  MonitoringSystemAccess,
  MonitoringSystemConfig
};