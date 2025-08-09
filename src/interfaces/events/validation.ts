/**
 * UEL (Unified Event Layer) - Validation Framework.
 *
 * Comprehensive validation framework for ensuring UEL integration quality,
 * event type safety, and system health across all components.
 *
 * @file Validation Framework Implementation
 */

import type { ILogger } from '../core/interfaces/base-interfaces';
import type { EventManagerConfig, EventManagerType, SystemEvent } from './core/interfaces';

import { EventManagerTypes, EventTypeGuards } from './core/interfaces';
import type { EventManager } from './manager';
import type { EventRegistry } from './registry';

/**
 * Validation result interface.
 *
 * @example
 */
export interface ValidationResult {
  /** Validation passed */
  valid: boolean;

  /** Validation score (0-100) */
  score: number;

  /** Validation errors */
  errors: ValidationError[];

  /** Validation warnings */
  warnings: ValidationWarning[];

  /** Validation recommendations */
  recommendations: ValidationRecommendation[];

  /** Performance metrics */
  metrics: {
    validationTime: number;
    checkCount: number;
    complexity: 'low' | 'medium' | 'high';
  };

  /** Validation metadata */
  metadata: {
    validator: string;
    timestamp: Date;
    version: string;
    context: Record<string, any>;
  };
}

/**
 * Validation error details.
 *
 * @example
 */
export interface ValidationError {
  /** Error code */
  code: string;

  /** Error message */
  message: string;

  /** Error severity */
  severity: 'critical' | 'high' | 'medium' | 'low';

  /** Error category */
  category: 'type' | 'config' | 'integration' | 'performance' | 'compatibility';

  /** Error location */
  location?: {
    component: string;
    method?: string;
    line?: number;
  };

  /** Suggested fix */
  suggestion?: string;

  /** Error context */
  context?: Record<string, any>;
}

/**
 * Validation warning details.
 *
 * @example
 */
export interface ValidationWarning {
  /** Warning code */
  code: string;

  /** Warning message */
  message: string;

  /** Warning category */
  category: 'optimization' | 'deprecation' | 'best-practice' | 'maintenance';

  /** Warning impact */
  impact: 'low' | 'medium' | 'high';

  /** Warning context */
  context?: Record<string, any>;
}

/**
 * Validation recommendation details.
 *
 * @example
 */
export interface ValidationRecommendation {
  /** Recommendation type */
  type: 'optimization' | 'refactoring' | 'feature' | 'security' | 'performance';

  /** Recommendation message */
  message: string;

  /** Expected benefit */
  benefit: string;

  /** Implementation effort */
  effort: 'low' | 'medium' | 'high';

  /** Priority */
  priority: 'low' | 'medium' | 'high' | 'critical';

  /** Implementation steps */
  steps?: string[];
}

/**
 * Event type validation schema.
 *
 * @example
 */
export interface EventTypeSchema {
  /** Required properties */
  required: string[];

  /** Property types */
  properties: Record<
    string,
    {
      type: 'string' | 'number' | 'boolean' | 'object' | 'array';
      format?: string;
      enum?: any[];
      minimum?: number;
      maximum?: number;
      pattern?: string;
    }
  >;

  /** Additional properties allowed */
  additionalProperties: boolean;

  /** Event type constraints */
  constraints?: {
    maxSize?: number;
    requiredFields?: string[];
    forbiddenFields?: string[];
  };
}

/**
 * System health validation configuration.
 *
 * @example
 */
export interface HealthValidationConfig {
  /** Health check timeout */
  timeout: number;

  /** Acceptable response time threshold */
  responseTimeThreshold: number;

  /** Memory usage threshold (MB) */
  memoryThreshold: number;

  /** CPU usage threshold (%) */
  cpuThreshold: number;

  /** Error rate threshold (%) */
  errorRateThreshold: number;

  /** Minimum uptime requirement (ms) */
  minimumUptime: number;
}

/**
 * Integration validation configuration.
 *
 * @example
 */
export interface IntegrationValidationConfig {
  /** Required manager types */
  requiredManagerTypes: EventManagerType[];

  /** Required event types */
  requiredEventTypes: string[];

  /** Cross-manager communication tests */
  crossManagerTests: boolean;

  /** Performance benchmarks */
  performanceBenchmarks: {
    eventsPerSecond: number;
    maxLatency: number;
    maxMemoryUsage: number;
  };
}

/**
 * Main validation framework class.
 *
 * @example
 */
export class UELValidationFramework {
  private eventTypeSchemas = new Map<string, EventTypeSchema>();
  private healthConfig: HealthValidationConfig;
  private integrationConfig: IntegrationValidationConfig;
  private validationHistory: ValidationResult[] = [];
  private logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;

    this.healthConfig = {
      timeout: 10000,
      responseTimeThreshold: 1000,
      memoryThreshold: 100, // MB
      cpuThreshold: 80, // %
      errorRateThreshold: 5, // %
      minimumUptime: 60000, // 1 minute
    };

    this.integrationConfig = {
      requiredManagerTypes: [EventManagerTypes.SYSTEM, EventManagerTypes.COORDINATION],
      requiredEventTypes: ['system:lifecycle', 'coordination:swarm'],
      crossManagerTests: true,
      performanceBenchmarks: {
        eventsPerSecond: 1000,
        maxLatency: 100,
        maxMemoryUsage: 50,
      },
    };

    this.initializeDefaultSchemas();
  }

  /**
   * Validate event type against schema.
   *
   * @param event
   * @param schema
   */
  validateEventType<T extends SystemEvent>(event: T, schema?: EventTypeSchema): ValidationResult {
    const startTime = Date.now();
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const recommendations: ValidationRecommendation[] = [];

    try {
      // Get schema for event type
      const eventSchema = schema || this.eventTypeSchemas.get(event.type);

      if (!eventSchema) {
        warnings.push({
          code: 'SCHEMA_NOT_FOUND',
          message: `No validation schema found for event type: ${event.type}`,
          category: 'best-practice',
          impact: 'medium',
          context: { eventType: event.type },
        });
      } else {
        // Validate required properties
        for (const required of eventSchema.required) {
          if (!(required in event)) {
            errors.push({
              code: 'MISSING_REQUIRED_PROPERTY',
              message: `Required property '${required}' is missing`,
              severity: 'high',
              category: 'type',
              suggestion: `Add property '${required}' to the event object`,
              context: { property: required, eventType: event.type },
            });
          }
        }

        // Validate property types
        for (const [property, definition] of Object.entries(eventSchema.properties)) {
          if (property in event) {
            const value = (event as any)[property];
            const isValidType = this.validatePropertyType(value, definition.type);

            if (!isValidType) {
              errors.push({
                code: 'INVALID_PROPERTY_TYPE',
                message: `Property '${property}' has invalid type. Expected ${definition.type}`,
                severity: 'medium',
                category: 'type',
                suggestion: `Ensure property '${property}' is of type ${definition.type}`,
                context: { property, expectedType: definition.type, actualType: typeof value },
              });
            }

            // Validate enums
            if (definition.enum && !definition.enum.includes(value)) {
              errors.push({
                code: 'INVALID_ENUM_VALUE',
                message: `Property '${property}' has invalid enum value: ${value}`,
                severity: 'medium',
                category: 'type',
                suggestion: `Use one of: ${definition.enum.join(', ')}`,
                context: { property, value, allowedValues: definition.enum },
              });
            }
          }
        }

        // Check additional properties
        if (!eventSchema.additionalProperties) {
          const allowedProperties = new Set([
            ...eventSchema.required,
            ...Object.keys(eventSchema.properties),
          ]);
          for (const property of Object.keys(event)) {
            if (!allowedProperties.has(property)) {
              warnings.push({
                code: 'UNEXPECTED_PROPERTY',
                message: `Unexpected property '${property}' found`,
                category: 'best-practice',
                impact: 'low',
                context: { property, eventType: event.type },
              });
            }
          }
        }
      }

      // General event validation
      this.validateGeneralEventStructure(event, errors, warnings, recommendations);

      const validationTime = Date.now() - startTime;
      const score = this.calculateValidationScore(errors, warnings);

      return {
        valid:
          errors.filter((e) => e.severity === 'critical' || e.severity === 'high').length === 0,
        score,
        errors,
        warnings,
        recommendations,
        metrics: {
          validationTime,
          checkCount: errors.length + warnings.length,
          complexity: this.determineComplexity(event),
        },
        metadata: {
          validator: 'UELValidationFramework.validateEventType',
          timestamp: new Date(),
          version: '1.0.0',
          context: { eventType: event.type, hasSchema: !!eventSchema },
        },
      };
    } catch (error) {
      return {
        valid: false,
        score: 0,
        errors: [
          {
            code: 'VALIDATION_ERROR',
            message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            severity: 'critical',
            category: 'type',
            context: { error: String(error) },
          },
        ],
        warnings: [],
        recommendations: [],
        metrics: {
          validationTime: Date.now() - startTime,
          checkCount: 1,
          complexity: 'high',
        },
        metadata: {
          validator: 'UELValidationFramework.validateEventType',
          timestamp: new Date(),
          version: '1.0.0',
          context: { error: true },
        },
      };
    }
  }

  /**
   * Validate event manager configuration.
   *
   * @param config
   */
  validateManagerConfig(config: EventManagerConfig): ValidationResult {
    const startTime = Date.now();
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const recommendations: ValidationRecommendation[] = [];

    // Validate required fields
    if (!config?.name || typeof config?.name !== 'string') {
      errors.push({
        code: 'INVALID_MANAGER_NAME',
        message: 'Event manager name is required and must be a string',
        severity: 'critical',
        category: 'config',
        suggestion: 'Provide a valid string name for the event manager',
      });
    }

    if (!EventTypeGuards.isEventManagerType(config?.type)) {
      errors.push({
        code: 'INVALID_MANAGER_TYPE',
        message: `Invalid event manager type: ${config?.type}`,
        severity: 'critical',
        category: 'config',
        suggestion: `Use one of: ${Object.values(EventManagerTypes).join(', ')}`,
        context: { type: config?.type },
      });
    }

    // Validate configuration values
    if (
      config?.maxListeners !== undefined &&
      (config?.maxListeners < 1 || config?.maxListeners > 10000)
    ) {
      warnings.push({
        code: 'UNUSUAL_MAX_LISTENERS',
        message: `Unusual maxListeners value: ${config?.maxListeners}`,
        category: 'optimization',
        impact: 'medium',
        context: { maxListeners: config?.maxListeners },
      });
    }

    if (config?.queueSize !== undefined && config?.queueSize > 50000) {
      warnings.push({
        code: 'LARGE_QUEUE_SIZE',
        message: `Large queue size may impact memory usage: ${config?.queueSize}`,
        category: 'optimization',
        impact: 'high',
        context: { queueSize: config?.queueSize },
      });

      recommendations.push({
        type: 'optimization',
        message: 'Consider implementing queue size monitoring and backpressure',
        benefit: 'Prevents memory exhaustion under high load',
        effort: 'medium',
        priority: 'medium',
        steps: [
          'Add queue size monitoring',
          'Implement backpressure mechanism',
          'Add queue overflow handling',
        ],
      });
    }

    const validationTime = Date.now() - startTime;
    const score = this.calculateValidationScore(errors, warnings);

    return {
      valid: errors.filter((e) => e.severity === 'critical' || e.severity === 'high').length === 0,
      score,
      errors,
      warnings,
      recommendations,
      metrics: {
        validationTime,
        checkCount: errors.length + warnings.length,
        complexity: 'low',
      },
      metadata: {
        validator: 'UELValidationFramework.validateManagerConfig',
        timestamp: new Date(),
        version: '1.0.0',
        context: { managerType: config?.type, managerName: config?.name },
      },
    };
  }

  /**
   * Validate system health.
   *
   * @param eventManager
   * @param config
   */
  async validateSystemHealth(
    eventManager: EventManager,
    config?: Partial<HealthValidationConfig>
  ): Promise<ValidationResult> {
    const startTime = Date.now();
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const recommendations: ValidationRecommendation[] = [];
    const healthConfig = { ...this.healthConfig, ...config };

    try {
      // Get system status
      const systemStatus = await Promise.race([
        eventManager.getSystemStatus(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Health check timeout')), healthConfig?.timeout)
        ),
      ]);

      // Validate health percentage
      if (systemStatus.healthPercentage < 50) {
        errors.push({
          code: 'LOW_SYSTEM_HEALTH',
          message: `System health is critical: ${systemStatus.healthPercentage}%`,
          severity: 'critical',
          category: 'performance',
          suggestion: 'Investigate unhealthy event managers and resolve issues',
        });
      } else if (systemStatus.healthPercentage < 80) {
        warnings.push({
          code: 'DEGRADED_SYSTEM_HEALTH',
          message: `System health is degraded: ${systemStatus.healthPercentage}%`,
          category: 'maintenance',
          impact: 'medium',
        });
      }

      // Validate manager count
      if (systemStatus.totalManagers === 0) {
        errors.push({
          code: 'NO_ACTIVE_MANAGERS',
          message: 'No active event managers found',
          severity: 'critical',
          category: 'integration',
          suggestion: 'Create and start event managers for your application',
        });
      }

      // Get global metrics for performance validation
      const globalMetrics = await eventManager.getGlobalMetrics();

      // Validate performance metrics
      if (globalMetrics.registry.errorRate > healthConfig?.errorRateThreshold / 100) {
        errors.push({
          code: 'HIGH_ERROR_RATE',
          message: `Error rate exceeds threshold: ${(globalMetrics.registry.errorRate * 100).toFixed(2)}%`,
          severity: 'high',
          category: 'performance',
          suggestion: 'Investigate and fix sources of errors in event processing',
        });
      }

      if (globalMetrics.registry.averageLatency > healthConfig?.responseTimeThreshold) {
        warnings.push({
          code: 'HIGH_LATENCY',
          message: `Average latency is high: ${globalMetrics.registry.averageLatency}ms`,
          category: 'optimization',
          impact: 'medium',
        });

        recommendations.push({
          type: 'performance',
          message: 'Optimize event processing to reduce latency',
          benefit: 'Improved system responsiveness',
          effort: 'medium',
          priority: 'medium',
          steps: [
            'Profile event processing bottlenecks',
            'Optimize event handler implementations',
            'Consider event batching for high-volume scenarios',
          ],
        });
      }

      const validationTime = Date.now() - startTime;
      const score = this.calculateValidationScore(errors, warnings);

      return {
        valid:
          errors.filter((e) => e.severity === 'critical' || e.severity === 'high').length === 0,
        score,
        errors,
        warnings,
        recommendations,
        metrics: {
          validationTime,
          checkCount: errors.length + warnings.length,
          complexity: 'medium',
        },
        metadata: {
          validator: 'UELValidationFramework.validateSystemHealth',
          timestamp: new Date(),
          version: '1.0.0',
          context: {
            totalManagers: systemStatus.totalManagers,
            healthPercentage: systemStatus.healthPercentage,
            errorRate: globalMetrics.registry.errorRate,
          },
        },
      };
    } catch (error) {
      return {
        valid: false,
        score: 0,
        errors: [
          {
            code: 'HEALTH_CHECK_FAILED',
            message: `Health validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            severity: 'critical',
            category: 'performance',
            context: { error: String(error) },
          },
        ],
        warnings: [],
        recommendations: [],
        metrics: {
          validationTime: Date.now() - startTime,
          checkCount: 1,
          complexity: 'high',
        },
        metadata: {
          validator: 'UELValidationFramework.validateSystemHealth',
          timestamp: new Date(),
          version: '1.0.0',
          context: { error: true },
        },
      };
    }
  }

  /**
   * Validate UEL integration completeness.
   *
   * @param eventManager
   * @param registry
   * @param config
   */
  async validateIntegration(
    eventManager: EventManager,
    registry: EventRegistry,
    config?: Partial<IntegrationValidationConfig>
  ): Promise<ValidationResult> {
    const startTime = Date.now();
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const recommendations: ValidationRecommendation[] = [];
    const integrationConfig = { ...this.integrationConfig, ...config };

    try {
      // Validate required manager types are present
      const registryStats = registry.getRegistryStats();

      for (const requiredType of integrationConfig?.requiredManagerTypes) {
        if (registryStats.managersByType[requiredType] === 0) {
          errors.push({
            code: 'MISSING_REQUIRED_MANAGER_TYPE',
            message: `Required manager type not found: ${requiredType}`,
            severity: 'high',
            category: 'integration',
            suggestion: `Create at least one event manager of type: ${requiredType}`,
            context: { managerType: requiredType },
          });
        }
      }

      // Validate required event types are registered
      const eventTypes = registry.getEventTypes();

      for (const requiredEventType of integrationConfig?.requiredEventTypes) {
        if (!eventTypes.includes(requiredEventType)) {
          warnings.push({
            code: 'MISSING_RECOMMENDED_EVENT_TYPE',
            message: `Recommended event type not registered: ${requiredEventType}`,
            category: 'best-practice',
            impact: 'medium',
            context: { eventType: requiredEventType },
          });
        }
      }

      // Validate factory coverage
      const factoryTypes = registry.listFactoryTypes();
      const missingFactories = Object.values(EventManagerTypes).filter(
        (type) => !factoryTypes.includes(type)
      );

      if (missingFactories.length > 0) {
        recommendations.push({
          type: 'feature',
          message: `Consider implementing factories for: ${missingFactories.join(', ')}`,
          benefit: 'Complete UEL coverage for all event manager types',
          effort: 'medium',
          priority: 'low',
          steps: [
            'Implement missing factory classes',
            'Register factories with the registry',
            'Add unit tests for new factories',
          ],
        });
      }

      // Performance benchmark validation
      const globalMetrics = await eventManager.getGlobalMetrics();
      const performanceBenchmarks = integrationConfig?.performanceBenchmarks;

      if (globalMetrics.registry.averageLatency > performanceBenchmarks.maxLatency) {
        warnings.push({
          code: 'PERFORMANCE_BELOW_BENCHMARK',
          message: `Latency exceeds benchmark: ${globalMetrics.registry.averageLatency}ms > ${performanceBenchmarks.maxLatency}ms`,
          category: 'optimization',
          impact: 'medium',
        });
      }

      const validationTime = Date.now() - startTime;
      const score = this.calculateValidationScore(errors, warnings);

      return {
        valid:
          errors.filter((e) => e.severity === 'critical' || e.severity === 'high').length === 0,
        score,
        errors,
        warnings,
        recommendations,
        metrics: {
          validationTime,
          checkCount: errors.length + warnings.length,
          complexity: 'high',
        },
        metadata: {
          validator: 'UELValidationFramework.validateIntegration',
          timestamp: new Date(),
          version: '1.0.0',
          context: {
            totalManagers: registryStats.totalManagers,
            totalEventTypes: registryStats.totalEventTypes,
            factoryTypes: factoryTypes.length,
          },
        },
      };
    } catch (error) {
      return {
        valid: false,
        score: 0,
        errors: [
          {
            code: 'INTEGRATION_VALIDATION_FAILED',
            message: `Integration validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            severity: 'critical',
            category: 'integration',
            context: { error: String(error) },
          },
        ],
        warnings: [],
        recommendations: [],
        metrics: {
          validationTime: Date.now() - startTime,
          checkCount: 1,
          complexity: 'high',
        },
        metadata: {
          validator: 'UELValidationFramework.validateIntegration',
          timestamp: new Date(),
          version: '1.0.0',
          context: { error: true },
        },
      };
    }
  }

  /**
   * Perform comprehensive UEL validation.
   *
   * @param eventManager
   * @param registry
   * @param sampleEvents
   */
  async validateComplete(
    eventManager: EventManager,
    registry: EventRegistry,
    sampleEvents?: SystemEvent[]
  ): Promise<{
    overall: ValidationResult;
    health: ValidationResult;
    integration: ValidationResult;
    events: ValidationResult[];
    summary: {
      totalScore: number;
      criticalIssues: number;
      recommendations: number;
      validationTime: number;
    };
  }> {
    const startTime = Date.now();

    // Perform all validation checks
    const [healthResult, integrationResult] = await Promise.allSettled([
      this.validateSystemHealth(eventManager),
      this.validateIntegration(eventManager, registry),
    ]);

    const health =
      healthResult?.status === 'fulfilled'
        ? healthResult?.value
        : this.createErrorResult('Health validation failed');
    const integration =
      integrationResult?.status === 'fulfilled'
        ? integrationResult?.value
        : this.createErrorResult('Integration validation failed');

    // Validate sample events if provided
    const events: ValidationResult[] = [];
    if (sampleEvents && sampleEvents.length > 0) {
      for (const event of sampleEvents) {
        events.push(this.validateEventType(event));
      }
    }

    // Calculate overall result
    const allResults = [health, integration, ...events];
    const totalErrors = allResults.reduce((sum, result) => sum + result?.errors.length, 0);
    const totalWarnings = allResults.reduce((sum, result) => sum + result?.warnings.length, 0);
    const totalRecommendations = allResults.reduce(
      (sum, result) => sum + result?.recommendations.length,
      0
    );
    const criticalIssues = allResults.reduce(
      (sum, result) => sum + result?.errors.filter((e) => e.severity === 'critical').length,
      0
    );

    const overallScore =
      allResults.length > 0
        ? allResults.reduce((sum, result) => sum + result?.score, 0) / allResults.length
        : 0;

    const overall: ValidationResult = {
      valid: criticalIssues === 0 && overallScore >= 70,
      score: overallScore,
      errors: allResults?.flatMap((r) => r.errors),
      warnings: allResults?.flatMap((r) => r.warnings),
      recommendations: allResults?.flatMap((r) => r.recommendations),
      metrics: {
        validationTime: Date.now() - startTime,
        checkCount: totalErrors + totalWarnings,
        complexity: 'high',
      },
      metadata: {
        validator: 'UELValidationFramework.validateComplete',
        timestamp: new Date(),
        version: '1.0.0',
        context: {
          healthChecks: 1,
          integrationChecks: 1,
          eventChecks: events.length,
          totalChecks: allResults.length,
        },
      },
    };

    // Store validation result in history
    this.validationHistory.push(overall);

    return {
      overall,
      health,
      integration,
      events,
      summary: {
        totalScore: overallScore,
        criticalIssues,
        recommendations: totalRecommendations,
        validationTime: Date.now() - startTime,
      },
    };
  }

  /**
   * Register custom event type schema.
   *
   * @param eventType
   * @param schema
   */
  registerEventTypeSchema(eventType: string, schema: EventTypeSchema): void {
    this.eventTypeSchemas.set(eventType, schema);
    this.logger.debug(`📋 Registered validation schema for event type: ${eventType}`);
  }

  /**
   * Get validation history.
   */
  getValidationHistory(): ValidationResult[] {
    return [...this.validationHistory];
  }

  /**
   * Clear validation history.
   */
  clearValidationHistory(): void {
    this.validationHistory = [];
  }

  /**
   * Export validation report.
   *
   * @param results
   */
  exportValidationReport(results: ValidationResult[]): {
    summary: {
      totalValidations: number;
      averageScore: number;
      totalErrors: number;
      totalWarnings: number;
      totalRecommendations: number;
    };
    trends: {
      scoreOverTime: Array<{ timestamp: Date; score: number }>;
      errorsByCategory: Record<string, number>;
      recommendationsByType: Record<string, number>;
    };
    details: ValidationResult[];
  } {
    const summary = {
      totalValidations: results.length,
      averageScore:
        results.length > 0 ? results.reduce((sum, r) => sum + r.score, 0) / results.length : 0,
      totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
      totalWarnings: results.reduce((sum, r) => sum + r.warnings.length, 0),
      totalRecommendations: results.reduce((sum, r) => sum + r.recommendations.length, 0),
    };

    const scoreOverTime = results.map((r) => ({
      timestamp: r.metadata.timestamp,
      score: r.score,
    }));

    const errorsByCategory: Record<string, number> = {};
    const recommendationsByType: Record<string, number> = {};

    results.forEach((result) => {
      result?.errors.forEach((error) => {
        errorsByCategory[error.category] = (errorsByCategory[error.category] || 0) + 1;
      });

      result?.recommendations.forEach((rec) => {
        recommendationsByType[rec.type] = (recommendationsByType[rec.type] || 0) + 1;
      });
    });

    return {
      summary,
      trends: {
        scoreOverTime,
        errorsByCategory,
        recommendationsByType,
      },
      details: results,
    };
  }

  /**
   * Private helper methods.
   */

  private validatePropertyType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !Number.isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'array':
        return Array.isArray(value);
      default:
        return true;
    }
  }

  private validateGeneralEventStructure(
    event: SystemEvent,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    recommendations: ValidationRecommendation[]
  ): void {
    // Validate required base properties
    if (!event.id) {
      errors.push({
        code: 'MISSING_EVENT_ID',
        message: 'Event must have an id property',
        severity: 'high',
        category: 'type',
        suggestion: 'Add a unique id to the event',
      });
    }

    if (!event.timestamp) {
      errors.push({
        code: 'MISSING_TIMESTAMP',
        message: 'Event must have a timestamp property',
        severity: 'high',
        category: 'type',
        suggestion: 'Add a timestamp (Date object) to the event',
      });
    } else if (!(event.timestamp instanceof Date)) {
      errors.push({
        code: 'INVALID_TIMESTAMP_TYPE',
        message: 'Event timestamp must be a Date object',
        severity: 'medium',
        category: 'type',
        suggestion: 'Convert timestamp to Date object',
      });
    }

    if (!event.source) {
      warnings.push({
        code: 'MISSING_SOURCE',
        message: 'Event should have a source property for better traceability',
        category: 'best-practice',
        impact: 'low',
      });
    }

    if (!event.type) {
      errors.push({
        code: 'MISSING_EVENT_TYPE',
        message: 'Event must have a type property',
        severity: 'critical',
        category: 'type',
        suggestion: 'Add a type property to identify the event',
      });
    }

    // Check for large events
    const eventSize = JSON.stringify(event).length;
    if (eventSize > 10000) {
      warnings.push({
        code: 'LARGE_EVENT_SIZE',
        message: `Event size is large: ${eventSize} bytes`,
        category: 'optimization',
        impact: 'medium',
        context: { size: eventSize },
      });

      recommendations.push({
        type: 'optimization',
        message: 'Consider reducing event payload size or using references',
        benefit: 'Improved performance and reduced memory usage',
        effort: 'low',
        priority: 'medium',
      });
    }
  }

  private calculateValidationScore(
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): number {
    let score = 100;

    // Deduct points for errors based on severity
    errors.forEach((error) => {
      switch (error.severity) {
        case 'critical':
          score -= 30;
          break;
        case 'high':
          score -= 20;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    });

    // Deduct points for warnings based on impact
    warnings.forEach((warning) => {
      switch (warning.impact) {
        case 'high':
          score -= 5;
          break;
        case 'medium':
          score -= 3;
          break;
        case 'low':
          score -= 1;
          break;
      }
    });

    return Math.max(0, Math.min(100, score));
  }

  private determineComplexity(event: SystemEvent): 'low' | 'medium' | 'high' {
    const eventSize = JSON.stringify(event).length;
    const propertyCount = Object.keys(event).length;

    if (eventSize > 5000 || propertyCount > 15) return 'high';
    if (eventSize > 1000 || propertyCount > 8) return 'medium';
    return 'low';
  }

  private createErrorResult(message: string): ValidationResult {
    return {
      valid: false,
      score: 0,
      errors: [
        {
          code: 'VALIDATION_FAILED',
          message,
          severity: 'critical',
          category: 'type',
        },
      ],
      warnings: [],
      recommendations: [],
      metrics: {
        validationTime: 0,
        checkCount: 1,
        complexity: 'high',
      },
      metadata: {
        validator: 'UELValidationFramework.createErrorResult',
        timestamp: new Date(),
        version: '1.0.0',
        context: { error: true },
      },
    };
  }

  private initializeDefaultSchemas(): void {
    // System lifecycle event schema
    this.registerEventTypeSchema('system:lifecycle', {
      required: ['id', 'timestamp', 'source', 'type', 'operation', 'status'],
      properties: {
        id: { type: 'string' },
        timestamp: { type: 'object' },
        source: { type: 'string' },
        type: { type: 'string' },
        operation: { type: 'string', enum: ['start', 'stop', 'restart', 'error', 'health'] },
        status: { type: 'string', enum: ['success', 'failure', 'pending', 'unknown'] },
        details: { type: 'object' },
      },
      additionalProperties: true,
    });

    // Coordination event schema
    this.registerEventTypeSchema('coordination:swarm', {
      required: ['id', 'timestamp', 'source', 'type', 'operation', 'targetId'],
      properties: {
        id: { type: 'string' },
        timestamp: { type: 'object' },
        source: { type: 'string' },
        type: { type: 'string' },
        operation: { type: 'string', enum: ['create', 'update', 'destroy', 'coordinate'] },
        targetId: { type: 'string' },
        details: { type: 'object' },
      },
      additionalProperties: true,
    });

    this.logger.debug('📋 Initialized default validation schemas');
  }
}

export default UELValidationFramework;
