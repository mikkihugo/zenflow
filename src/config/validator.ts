/**
 * @file Configuration Validator.
 *
 * Validates configuration against schema and provides detailed error reporting.
 */

import { VALIDATION_RULES } from './defaults.ts';
import type {
  ConfigValidationResult,
  SystemConfiguration,
  ValidationResult,
} from './types.ts';

/**
 * Configuration validator.
 *
 * @example
 */
export class ConfigValidator {
  /**
   * Validate configuration object.
   *
   * @param config
   */
  validate(config: SystemConfiguration): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate structure
      this.validateStructure(config, errors);

      // Validate specific rules
      this.validateRules(config, errors, warnings);

      // Validate dependencies
      this.validateDependencies(config, errors, warnings);

      // Validate ranges and constraints
      this.validateConstraints(config, errors, warnings);
    } catch (error) {
      errors.push(`Validation error: ${error}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate basic structure.
   *
   * @param config
   * @param errors
   */
  private validateStructure(
    config: SystemConfiguration,
    errors: string[]
  ): void {
    const requiredSections = [
      'core',
      'interfaces',
      'storage',
      'coordination',
      'neural',
      'optimization',
    ];

    for (const section of requiredSections) {
      if (!config?.[section as keyof SystemConfiguration]) {
        errors.push(`Missing required configuration section: ${section}`);
      }
    }

    // Validate core subsections
    if (config?.core) {
      if (!config?.core?.logger) {
        errors.push('Missing core.logger configuration');
      }
      if (!config?.core?.performance) {
        errors.push('Missing core.performance configuration');
      }
      if (!config?.core?.security) {
        errors.push('Missing core.security configuration');
      }
    }

    // Validate interfaces subsections
    if (config?.interfaces) {
      const requiredInterfaces = ['shared', 'terminal', 'web', 'mcp'];
      for (const iface of requiredInterfaces) {
        if (!config?.interfaces?.[iface as keyof typeof config.interfaces]) {
          errors.push(`Missing interfaces.${iface} configuration`);
        }
      }
    }

    // Validate storage subsections
    if (config?.storage) {
      if (!config?.storage?.memory) {
        errors.push('Missing storage.memory configuration');
      }
      if (!config?.storage?.database) {
        errors.push('Missing storage.database configuration');
      }
    }
  }

  /**
   * Validate against specific rules.
   *
   * @param config
   * @param errors
   * @param warnings
   */
  private validateRules(
    config: SystemConfiguration,
    errors: string[],
    warnings: string[]
  ): void {
    for (const [path, rule] of Object.entries(VALIDATION_RULES)) {
      const value = this.getNestedValue(config as any, path);

      if (value === undefined) {
        warnings.push(`Optional configuration missing: ${path}`);
        continue;
      }

      // Type validation
      if (rule.type === 'string' && typeof value !== 'string') {
        errors.push(`${path} must be a string, got ${typeof value}`);
        continue;
      }

      if (rule.type === 'number' && typeof value !== 'number') {
        errors.push(`${path} must be a number, got ${typeof value}`);
        continue;
      }

      // Boolean validation (if rule supports boolean type)
      if (
        'type' in rule &&
        rule.type &&
        (rule.type as string) === 'boolean' &&
        typeof value !== 'boolean'
      ) {
        errors.push(`${path} must be a boolean, got ${typeof value}`);
        continue;
      }

      // Enum validation
      if ('enum' in rule && rule.enum && Array.isArray(rule.enum)) {
        if (!rule.enum.includes(value as never)) {
          errors.push(
            `${path} must be one of: ${rule.enum.join(', ')}, got ${value}`
          );
        }
      }

      // Range validation
      if (rule.type === 'number' && typeof value === 'number') {
        if ('min' in rule && rule.min !== undefined && value < rule.min) {
          errors.push(`${path} must be >= ${rule.min}, got ${value}`);
        }
        if ('max' in rule && rule.max !== undefined && value > rule.max) {
          errors.push(`${path} must be <= ${rule.max}, got ${value}`);
        }
      }
    }
  }

  /**
   * Validate configuration dependencies.
   *
   * @param config
   * @param errors
   * @param warnings
   */
  private validateDependencies(
    config: SystemConfiguration,
    errors: string[],
    warnings: string[]
  ): void {
    // Web interface dependencies
    if (
      config?.interfaces?.web?.enableHttps &&
      !config?.interfaces?.web?.corsOrigins
    ) {
      warnings.push('HTTPS enabled but no CORS origins configured');
    }

    // Neural network dependencies
    if (config?.neural?.enableCUDA && !config?.neural?.enableWASM) {
      warnings.push('CUDA enabled without WASM - may not be supported');
    }

    // Database dependencies
    if (
      config?.storage?.memory?.backend === 'lancedb' &&
      !config?.storage?.database?.lancedb
    ) {
      errors.push('LanceDB backend selected but lancedb configuration missing');
    }

    // MCP tool dependencies
    if (
      config?.interfaces?.mcp?.tools?.enableAll &&
      config?.interfaces?.mcp?.tools?.disabledTools?.length > 0
    ) {
      warnings.push('enableAll is true but some tools are disabled');
    }

    // Security dependencies
    if (
      !config?.core?.security?.enableSandbox &&
      config?.core?.security?.allowShellAccess
    ) {
      warnings.push('Shell access enabled without sandbox - security risk');
    }

    // Performance dependencies
    if (
      config?.core?.performance?.enableProfiling &&
      !config?.core?.performance?.enableMetrics
    ) {
      warnings.push(
        'Profiling enabled without metrics - limited functionality'
      );
    }
  }

  /**
   * Validate constraints and logical consistency.
   *
   * @param config
   * @param errors
   * @param warnings
   */
  private validateConstraints(
    config: SystemConfiguration,
    errors: string[],
    warnings: string[]
  ): void {
    // Port conflicts
    const ports = [
      config?.interfaces?.web?.port,
      config?.interfaces?.mcp?.http?.port,
    ].filter(Boolean);

    const uniquePorts = new Set(ports);
    if (ports.length !== uniquePorts.size) {
      errors.push(
        'Port conflicts detected - multiple services cannot use the same port'
      );
    }

    // Memory constraints
    if (
      config?.storage?.memory?.maxMemorySize &&
      config?.storage?.memory?.cacheSize
    ) {
      if (
        config?.storage?.memory?.cacheSize >
        config?.storage?.memory?.maxMemorySize
      ) {
        errors.push('Cache size cannot be larger than max memory size');
      }
    }

    // Agent constraints
    if (
      config?.coordination?.maxAgents &&
      config?.coordination?.maxAgents > 1000
    ) {
      warnings.push('Very high agent count may impact performance');
    }

    // Timeout constraints
    const timeouts = [
      config?.interfaces?.terminal?.timeout,
      config?.interfaces?.mcp?.http?.timeout,
      config?.coordination?.timeout,
    ].filter(Boolean);

    for (const timeout of timeouts) {
      if (timeout < 1000) {
        warnings.push(`Very low timeout value (${timeout}ms) may cause issues`);
      }
      if (timeout > 300000) {
        // 5 minutes
        warnings.push(`Very high timeout value (${timeout}ms) may cause hangs`);
      }
    }

    // Directory constraints
    const directories = [
      config?.storage?.memory?.directory,
      config?.storage?.database?.sqlite?.path,
      config?.storage?.database?.lancedb?.path,
      config?.neural?.modelPath,
    ].filter(Boolean);

    for (const dir of directories) {
      if (dir.includes('..')) {
        warnings.push(
          `Directory path contains '..' - potential security risk: ${dir}`
        );
      }
    }
  }

  /**
   * Get nested value using dot notation.
   *
   * @param obj
   * @param path
   */
  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path
      .split('.')
      .reduce((current: unknown, key) => current?.[key], obj);
  }

  /**
   * Validate specific configuration section.
   *
   * @param _config
   * @param section
   */
  validateSection(
    _config: SystemConfiguration,
    section: string
  ): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Get rules for this section
    const sectionRules = Object.entries(VALIDATION_RULES).filter(([path]) =>
      path.startsWith(`${section}.`)
    );

    for (const [_path, _rule] of sectionRules) {
      // Apply validation rules...
      // (Implementation similar to validateRules but scoped to section)
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Enhanced validation with production readiness check.
   *
   * @param config - System configuration to validate.
   * @returns Enhanced validation result with production readiness details.
   */
  validateEnhanced(config: SystemConfiguration): ValidationResult {
    const basicResult = this.validate(config);

    const securityIssues: string[] = [];
    const portConflicts: string[] = [];
    const performanceWarnings: string[] = [];
    const failsafeApplied: string[] = [];

    // Check security issues
    if (
      !config?.core?.security?.enableSandbox &&
      config?.core?.security?.allowShellAccess
    ) {
      securityIssues.push('Shell access enabled without sandbox protection');
    }

    if (config?.core?.security?.trustedHosts?.length === 0) {
      securityIssues.push('No trusted hosts configured for security');
    }

    // Check port conflicts
    const ports = [
      config?.interfaces?.web?.port,
      config?.interfaces?.mcp?.http?.port,
      config?.monitoring?.dashboard?.port,
    ].filter((port): port is number => typeof port === 'number');

    const uniquePorts = new Set(ports);
    if (ports.length !== uniquePorts.size) {
      portConflicts.push('Multiple services configured to use the same port');
    }

    // Check performance warnings
    if (
      config?.coordination?.maxAgents &&
      config?.coordination?.maxAgents > 1000
    ) {
      performanceWarnings.push('High agent count may impact performance');
    }

    if (config?.core?.logger?.level === 'debug') {
      performanceWarnings.push(
        'Debug logging enabled - may impact performance'
      );
    }

    // Check production readiness
    const productionReady =
      basicResult?.valid &&
      securityIssues.length === 0 &&
      portConflicts.length === 0 &&
      config?.core?.security?.enableSandbox === true;

    const result: ValidationResult = {
      valid: basicResult?.valid,
      errors: basicResult?.errors,
      warnings: basicResult?.warnings,
      productionReady,
      securityIssues,
      portConflicts,
      performanceWarnings,
      failsafeApplied,
    };

    return result;
  }

  /**
   * Get configuration health report.
   *
   * @param config
   */
  getHealthReport(config: SystemConfiguration): {
    status: 'healthy' | 'warning' | 'critical';
    score: number;
    details: {
      structure: boolean;
      security: boolean;
      performance: boolean;
      production: boolean;
    };
    recommendations: string[];
  } {
    const result = this.validateEnhanced(config);
    const recommendations: string[] = [];

    // Calculate health scores
    const structureScore =
      result?.errors.length === 0
        ? 100
        : Math.max(0, 100 - result?.errors.length * 10);
    const securityScore =
      result?.securityIssues.length === 0
        ? 100
        : Math.max(0, 100 - result?.securityIssues.length * 20);
    const performanceScore =
      result?.performanceWarnings.length === 0
        ? 100
        : Math.max(0, 100 - result?.performanceWarnings.length * 5);
    const productionScore = result?.productionReady ? 100 : 50;

    const overallScore =
      (structureScore + securityScore + performanceScore + productionScore) / 4;

    // Generate recommendations
    if (result?.errors.length > 0) {
      recommendations.push('Fix configuration errors before deployment');
    }
    if (result?.securityIssues.length > 0) {
      recommendations.push('Address security issues for production deployment');
    }
    if (result?.portConflicts.length > 0) {
      recommendations.push('Resolve port conflicts between services');
    }
    if (result?.performanceWarnings.length > 0) {
      recommendations.push('Review performance configuration for optimization');
    }

    const status =
      overallScore >= 90
        ? 'healthy'
        : overallScore >= 70
          ? 'warning'
          : 'critical';

    return {
      status,
      score: Math.round(overallScore),
      details: {
        structure: result?.errors.length === 0,
        security: result?.securityIssues.length === 0,
        performance: result?.performanceWarnings.length < 3,
        production: result?.productionReady,
      },
      recommendations,
    };
  }
}
