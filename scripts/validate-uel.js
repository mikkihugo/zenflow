#!/usr/bin/env node
/**
 * UEL (Unified Event Layer) - System Validation Script
 *
 * Command-line validation tool for verifying UEL integration quality,
 * system health, and migration completeness across all components.
 *
 * Usage:
 *   node scripts/validate-uel.js [options]
 *   npm run validate:uel [-- options]
 *
 * Options:
 *   --verbose, -v         Show detailed validation output
 *   --health             Perform system health validation only
 *   --integration        Perform integration validation only
 *   --events             Validate event types and schemas
 *   --compatibility      Test EventEmitter compatibility
 *   --export-report      Export detailed validation report
 *   --fix-issues         Attempt to fix detected issues
 *   --format=json        Output format (json, table, summary)
 *
 * @fileoverview UEL System Validation CLI Tool
 */

const fs = require('node:fs').promises;
const path = require('node:path');
const { execSync } = require('node:child_process');

class UELValidationCLI {
  constructor() {
    this.options = this.parseArguments();
    this.logger = this.createLogger();
    this.validationResults = [];
    this.startTime = Date.now();
  }

  parseArguments() {
    const args = process.argv.slice(2);
    const options = {
      verbose: false,
      health: false,
      integration: false,
      events: false,
      compatibility: false,
      exportReport: false,
      fixIssues: false,
      format: 'table',
      includeAll: true,
    };

    for (const arg of args) {
      if (arg === '--verbose' || arg === '-v') {
        options.verbose = true;
      } else if (arg === '--health') {
        options.health = true;
        options.includeAll = false;
      } else if (arg === '--integration') {
        options.integration = true;
        options.includeAll = false;
      } else if (arg === '--events') {
        options.events = true;
        options.includeAll = false;
      } else if (arg === '--compatibility') {
        options.compatibility = true;
        options.includeAll = false;
      } else if (arg === '--export-report') {
        options.exportReport = true;
      } else if (arg === '--fix-issues') {
        options.fixIssues = true;
      } else if (arg.startsWith('--format=')) {
        options.format = arg.split('=')[1];
      } else if (arg === '--help' || arg === '-h') {
        this.showHelp();
        process.exit(0);
      }
    }

    return options;
  }

  createLogger() {
    return {
      info: (_msg, ..._args) => {
        if (this.options.verbose || this.options.format !== 'json') {
        }
      },
      warn: (msg, ...args) => {
        console.warn(`⚠️  ${msg}`, ...args);
      },
      error: (msg, ...args) => {
        // console.error(`❌ ${msg}`, ...args);
      },
      success: (_msg, ..._args) => {
        if (this.options.format !== 'json') {
        }
      },
      debug: (_msg, ..._args) => {
        if (this.options.verbose) {
        }
      },
    };
  }

  showHelp() {}

  async run() {
    try {
      this.logger.info('🚀 Starting UEL System Validation...');
      this.logger.debug('Configuration:', this.options);

      // Pre-flight checks
      await this.performPreflightChecks();

      // Main validation phases
      const validationTasks = this.getValidationTasks();

      for (const task of validationTasks) {
        try {
          this.logger.info(`\n📋 Running ${task.name}...`);
          const result = await task.run();
          this.validationResults.push({
            name: task.name,
            category: task.category,
            ...result,
          });

          if (result.success) {
            this.logger.success(`${task.name} completed successfully`);
          } else {
            this.logger.warn(`${task.name} completed with issues`);
          }
        } catch (error) {
          this.logger.error(`${task.name} failed:`, error.message);
          this.validationResults.push({
            name: task.name,
            category: task.category,
            success: false,
            score: 0,
            errors: [{ message: error.message, severity: 'critical' }],
            warnings: [],
            recommendations: [],
          });
        }
      }

      // Generate final report
      const report = this.generateReport();

      // Output results
      this.outputResults(report);

      // Export detailed report if requested
      if (this.options.exportReport) {
        await this.exportReport(report);
      }

      // Attempt fixes if requested
      if (this.options.fixIssues) {
        await this.attemptFixes(report);
      }

      // Exit with appropriate code
      const exitCode = this.determineExitCode(report);

      if (exitCode === 0) {
        this.logger.success('🎉 All UEL validations passed!');
      } else {
        this.logger.warn(
          `⚠️  UEL validation completed with issues (exit code: ${exitCode})`
        );
      }

      process.exit(exitCode);
    } catch (error) {
      this.logger.error('💥 UEL validation failed:', error);
      process.exit(3);
    }
  }

  async performPreflightChecks() {
    this.logger.debug('Performing preflight checks...');

    // Check if UEL module exists
    const uelPath = path.join(__dirname, '../src/interfaces/events/index.ts');
    try {
      await fs.access(uelPath);
    } catch {
      throw new Error(
        'UEL module not found. Ensure src/interfaces/events/index.ts exists.'
      );
    }

    // Check if TypeScript is available
    try {
      execSync('npx tsc --version', { stdio: 'pipe' });
    } catch {
      this.logger.warn('TypeScript not available - skipping type validation');
    }

    this.logger.debug('Preflight checks completed');
  }

  getValidationTasks() {
    const allTasks = [
      {
        name: 'System Health Validation',
        category: 'health',
        run: () => this.validateSystemHealth(),
      },
      {
        name: 'Integration Completeness',
        category: 'integration',
        run: () => this.validateIntegration(),
      },
      {
        name: 'Event Type Validation',
        category: 'events',
        run: () => this.validateEventTypes(),
      },
      {
        name: 'EventEmitter Compatibility',
        category: 'compatibility',
        run: () => this.validateCompatibility(),
      },
      {
        name: 'Factory Registration',
        category: 'integration',
        run: () => this.validateFactories(),
      },
      {
        name: 'Registry Functionality',
        category: 'integration',
        run: () => this.validateRegistry(),
      },
      {
        name: 'Performance Benchmarks',
        category: 'health',
        run: () => this.validatePerformance(),
      },
    ];

    // Filter tasks based on options
    if (this.options.includeAll) {
      return allTasks;
    }

    return allTasks.filter((task) => {
      return (
        (this.options.health && task.category === 'health') ||
        (this.options.integration && task.category === 'integration') ||
        (this.options.events && task.category === 'events') ||
        (this.options.compatibility && task.category === 'compatibility')
      );
    });
  }

  async validateSystemHealth() {
    const errors = [];
    const warnings = [];
    const recommendations = [];
    let score = 100;

    try {
      // Import UEL dynamically
      const { UEL } = await import('../src/interfaces/events/index.ts');
      const uel = UEL.getInstance();

      // Initialize UEL system
      await uel.initialize({
        enableValidation: true,
        enableCompatibility: true,
        healthMonitoring: true,
      });

      // Get system status
      const systemStatus = await uel.getSystemStatus();

      // Validate system health
      if (!systemStatus.initialized) {
        errors.push({
          message: 'UEL system not properly initialized',
          severity: 'critical',
        });
        score -= 30;
      }

      if (systemStatus.components.factory !== true) {
        errors.push({
          message: 'Factory component not available',
          severity: 'high',
        });
        score -= 20;
      }

      if (systemStatus.components.registry !== true) {
        errors.push({
          message: 'Registry component not available',
          severity: 'high',
        });
        score -= 20;
      }

      if (systemStatus.components.eventManager !== true) {
        warnings.push({
          message: 'Event Manager component not initialized',
          impact: 'medium',
        });
        score -= 10;
      }

      if (systemStatus.components.validation !== true) {
        warnings.push({
          message: 'Validation framework not enabled',
          impact: 'low',
        });
        score -= 5;
      }

      // Performance checks
      const globalMetrics = await uel.getGlobalMetrics();
      if (globalMetrics.errorRate > 0.05) {
        errors.push({
          message: `High error rate: ${(globalMetrics.errorRate * 100).toFixed(2)}%`,
          severity: 'medium',
        });
        score -= 15;
      }

      if (globalMetrics.averageLatency > 100) {
        warnings.push({
          message: `High average latency: ${globalMetrics.averageLatency}ms`,
          impact: 'medium',
        });
        score -= 5;
      }

      // Add recommendations
      if (systemStatus.factoryStats.totalManagers === 0) {
        recommendations.push({
          type: 'setup',
          message:
            'No event managers created yet - consider setting up default managers',
          priority: 'medium',
        });
      }

      await uel.shutdown();
    } catch (error) {
      errors.push({
        message: `System health check failed: ${error.message}`,
        severity: 'critical',
      });
      score = 0;
    }

    return {
      success: errors.filter((e) => e.severity === 'critical').length === 0,
      score: Math.max(0, score),
      errors,
      warnings,
      recommendations,
    };
  }

  async validateIntegration() {
    const errors = [];
    const warnings = [];
    const recommendations = [];
    let score = 100;

    try {
      // Check for required UEL components
      const requiredComponents = [
        'src/interfaces/events/index.ts',
        'src/interfaces/events/manager.ts',
        'src/interfaces/events/registry.ts',
        'src/interfaces/events/validation.ts',
        'src/interfaces/events/compatibility.ts',
        'src/interfaces/events/factories.ts',
      ];

      for (const component of requiredComponents) {
        try {
          await fs.access(path.join(__dirname, '..', component));
        } catch {
          errors.push({
            message: `Required component missing: ${component}`,
            severity: 'critical',
          });
          score -= 20;
        }
      }

      // Check adapter implementations
      const adapterPath = path.join(
        __dirname,
        '../src/interfaces/events/adapters'
      );
      try {
        const adapters = await fs.readdir(adapterPath);
        const requiredAdapters = [
          'system-event-adapter.ts',
          'coordination-event-adapter.ts',
          'communication-event-adapter.ts',
          'monitoring-event-adapter.ts',
        ];

        for (const adapter of requiredAdapters) {
          if (!adapters.includes(adapter)) {
            warnings.push({
              message: `Recommended adapter missing: ${adapter}`,
              impact: 'medium',
            });
            score -= 5;
          }
        }
      } catch {
        warnings.push({
          message: 'Adapters directory not accessible',
          impact: 'high',
        });
        score -= 15;
      }

      // Check for system integrations
      const integrationChecks = [
        { file: 'src/core/event-bus.ts', name: 'Core Event Bus' },
        {
          file: 'src/core/application-coordinator.ts',
          name: 'Application Coordinator',
        },
        {
          file: 'src/interfaces/events/observer-system.ts',
          name: 'Observer System',
        },
      ];

      for (const check of integrationChecks) {
        try {
          const content = await fs.readFile(
            path.join(__dirname, '..', check.file),
            'utf8'
          );

          // Check if it uses EventEmitter
          if (content.includes('extends EventEmitter')) {
            recommendations.push({
              type: 'migration',
              message: `${check.name} could benefit from UEL integration`,
              priority: 'low',
            });
          }

          // Check if it already has UEL integration
          if (content.includes('UEL') || content.includes('EventManager')) {
            // Already integrated or in progress
          } else {
            warnings.push({
              message: `${check.name} not integrated with UEL`,
              impact: 'low',
            });
            score -= 3;
          }
        } catch {
          warnings.push({
            message: `Could not analyze ${check.name} integration`,
            impact: 'low',
          });
        }
      }
    } catch (error) {
      errors.push({
        message: `Integration validation failed: ${error.message}`,
        severity: 'high',
      });
      score -= 25;
    }

    return {
      success: errors.filter((e) => e.severity === 'critical').length === 0,
      score: Math.max(0, score),
      errors,
      warnings,
      recommendations,
    };
  }

  async validateEventTypes() {
    const errors = [];
    const warnings = [];
    const recommendations = [];
    let score = 100;

    try {
      // Import event types
      const eventTypesPath = path.join(
        __dirname,
        '../src/interfaces/events/types.ts'
      );
      const content = await fs.readFile(eventTypesPath, 'utf8');

      // Check for required event type definitions
      const requiredTypes = [
        'SystemLifecycleEvent',
        'CoordinationEvent',
        'CommunicationEvent',
        'MonitoringEvent',
        'InterfaceEvent',
        'NeuralEvent',
        'DatabaseEvent',
        'MemoryEvent',
        'WorkflowEvent',
      ];

      for (const type of requiredTypes) {
        if (
          !(
            content.includes(`interface ${type}`) ||
            content.includes(`type ${type}`)
          )
        ) {
          errors.push({
            message: `Required event type missing: ${type}`,
            severity: 'medium',
          });
          score -= 10;
        }
      }

      // Check for event categories
      if (!content.includes('EventCategories')) {
        warnings.push({
          message: 'Event categories enum not found',
          impact: 'medium',
        });
        score -= 5;
      }

      // Check for type guards
      if (
        !(content.includes('UELTypeGuards') || content.includes('TypeGuards'))
      ) {
        warnings.push({
          message: 'Type guard utilities not found',
          impact: 'medium',
        });
        score -= 5;
      }

      // Validate event structure consistency
      const eventInterfaceRegex = /interface (\w+Event) extends \w+ \{[^}]+\}/g;
      let match;
      const eventInterfaces = [];

      while ((match = eventInterfaceRegex.exec(content)) !== null) {
        eventInterfaces.push(match[1]);
      }

      if (eventInterfaces.length < 5) {
        warnings.push({
          message: 'Low number of event type definitions found',
          impact: 'medium',
        });
        score -= 10;
      }

      recommendations.push({
        type: 'enhancement',
        message: 'Consider adding JSDoc documentation for event types',
        priority: 'low',
      });
    } catch (error) {
      errors.push({
        message: `Event type validation failed: ${error.message}`,
        severity: 'high',
      });
      score = 0;
    }

    return {
      success:
        errors.filter((e) => e.severity === 'critical' || e.severity === 'high')
          .length === 0,
      score: Math.max(0, score),
      errors,
      warnings,
      recommendations,
    };
  }

  async validateCompatibility() {
    const errors = [];
    const warnings = [];
    const recommendations = [];
    let score = 100;

    try {
      // Test compatibility layer
      const { UELCompatibleEventEmitter, EventEmitterMigrationHelper } =
        await import('../src/interfaces/events/compatibility.ts');

      // Create test EventEmitter
      const testEmitter = new UELCompatibleEventEmitter({
        enableUEL: false, // Start with disabled UEL
      });

      let eventReceived = false;
      testEmitter.on('test', () => {
        eventReceived = true;
      });

      testEmitter.emit('test');

      if (!eventReceived) {
        errors.push({
          message: 'Basic EventEmitter compatibility broken',
          severity: 'critical',
        });
        score -= 50;
      }

      // Test UEL status methods
      const status = testEmitter.getUELStatus();
      if (typeof status.enabled !== 'boolean') {
        errors.push({
          message: 'UEL status reporting broken',
          severity: 'medium',
        });
        score -= 15;
      }

      // Test migration helper
      const migrationHelper = new EventEmitterMigrationHelper();
      if (typeof migrationHelper.analyzeEventEmitter !== 'function') {
        errors.push({
          message: 'Migration helper functionality missing',
          severity: 'medium',
        });
        score -= 15;
      }

      // Test event mapping
      testEmitter.mapEventToUEL('legacy-event', 'system:legacy');
      const mappedStatus = testEmitter.getUELStatus();

      if (mappedStatus.mappedEvents !== 1) {
        warnings.push({
          message: 'Event mapping functionality may have issues',
          impact: 'medium',
        });
        score -= 10;
      }
    } catch (error) {
      errors.push({
        message: `Compatibility validation failed: ${error.message}`,
        severity: 'high',
      });
      score -= 30;
    }

    return {
      success: errors.filter((e) => e.severity === 'critical').length === 0,
      score: Math.max(0, score),
      errors,
      warnings,
      recommendations,
    };
  }

  async validateFactories() {
    const errors = [];
    const warnings = [];
    const recommendations = [];
    let score = 100;

    try {
      const factoriesPath = path.join(
        __dirname,
        '../src/interfaces/events/factories.ts'
      );
      const content = await fs.readFile(factoriesPath, 'utf8');

      // Check for required factory exports
      const requiredFactories = [
        'UELFactory',
        'UELRegistry',
        'SystemEventManagerFactory',
        'CoordinationEventManagerFactory',
      ];

      for (const factory of requiredFactories) {
        if (!content.includes(`export.*${factory}`)) {
          warnings.push({
            message: `Factory export may be missing: ${factory}`,
            impact: 'medium',
          });
          score -= 10;
        }
      }

      // Check for factory interfaces
      if (!content.includes('IEventManagerFactory')) {
        errors.push({
          message: 'Core factory interface missing',
          severity: 'high',
        });
        score -= 20;
      }

      // Check for event manager type definitions
      if (!content.includes('EventManagerTypes')) {
        errors.push({
          message: 'Event manager types enum missing',
          severity: 'medium',
        });
        score -= 15;
      }
    } catch (error) {
      errors.push({
        message: `Factory validation failed: ${error.message}`,
        severity: 'high',
      });
      score = 0;
    }

    return {
      success:
        errors.filter((e) => e.severity === 'critical' || e.severity === 'high')
          .length === 0,
      score: Math.max(0, score),
      errors,
      warnings,
      recommendations,
    };
  }

  async validateRegistry() {
    const errors = [];
    const warnings = [];
    const recommendations = [];
    let score = 100;

    try {
      const { EventRegistry } = await import(
        '../src/interfaces/events/registry.ts'
      );

      // Test registry creation
      const logger = {
        debug: () => {},
        info: () => {},
        warn: () => {},
        error: () => {},
      };
      const registry = new EventRegistry(logger);

      // Test initialization
      await registry.initialize();

      // Test basic operations
      const stats = registry.getRegistryStats();
      if (typeof stats.totalManagers !== 'number') {
        errors.push({
          message: 'Registry statistics not properly structured',
          severity: 'medium',
        });
        score -= 15;
      }

      // Test event type registration
      registry.registerEventType('test:validation', {
        category: 'test',
        managerTypes: ['system'],
      });

      const eventTypes = registry.getEventTypes();
      if (!eventTypes.includes('test:validation')) {
        errors.push({
          message: 'Event type registration not working',
          severity: 'high',
        });
        score -= 25;
      }

      await registry.shutdownAll();
    } catch (error) {
      errors.push({
        message: `Registry validation failed: ${error.message}`,
        severity: 'high',
      });
      score -= 30;
    }

    return {
      success:
        errors.filter((e) => e.severity === 'critical' || e.severity === 'high')
          .length === 0,
      score: Math.max(0, score),
      errors,
      warnings,
      recommendations,
    };
  }

  async validatePerformance() {
    const errors = [];
    const warnings = [];
    const recommendations = [];
    let score = 100;

    try {
      const startTime = Date.now();

      // Import and initialize UEL
      const { UEL } = await import('../src/interfaces/events/index.ts');
      const uel = UEL.getInstance();

      await uel.initialize({
        enableValidation: false, // Skip validation for performance test
        healthMonitoring: false,
      });

      const initTime = Date.now() - startTime;

      // Test initialization time
      if (initTime > 5000) {
        warnings.push({
          message: `Slow UEL initialization: ${initTime}ms`,
          impact: 'medium',
        });
        score -= 10;
      }

      // Test event manager creation performance
      const createStartTime = Date.now();
      const _systemManager = await uel.createSystemEventManager('perf-test');
      const createTime = Date.now() - createStartTime;

      if (createTime > 1000) {
        warnings.push({
          message: `Slow event manager creation: ${createTime}ms`,
          impact: 'low',
        });
        score -= 5;
      }

      // Test memory usage (basic check)
      const memoryUsage = process.memoryUsage();
      if (memoryUsage.heapUsed > 100 * 1024 * 1024) {
        // 100MB
        warnings.push({
          message: 'High memory usage detected during validation',
          impact: 'medium',
        });
        score -= 10;
      }

      await uel.shutdown();

      recommendations.push({
        type: 'performance',
        message:
          'Consider implementing performance monitoring for production use',
        priority: 'medium',
      });
    } catch (error) {
      errors.push({
        message: `Performance validation failed: ${error.message}`,
        severity: 'medium',
      });
      score -= 20;
    }

    return {
      success:
        errors.filter((e) => e.severity === 'critical' || e.severity === 'high')
          .length === 0,
      score: Math.max(0, score),
      errors,
      warnings,
      recommendations,
    };
  }

  generateReport() {
    const totalTime = Date.now() - this.startTime;
    const totalTests = this.validationResults.length;
    const passedTests = this.validationResults.filter((r) => r.success).length;
    const overallScore =
      totalTests > 0
        ? this.validationResults.reduce((sum, r) => sum + r.score, 0) /
          totalTests
        : 0;

    const allErrors = this.validationResults.flatMap((r) => r.errors || []);
    const allWarnings = this.validationResults.flatMap((r) => r.warnings || []);
    const allRecommendations = this.validationResults.flatMap(
      (r) => r.recommendations || []
    );

    const criticalErrors = allErrors.filter(
      (e) => e.severity === 'critical'
    ).length;
    const highErrors = allErrors.filter((e) => e.severity === 'high').length;

    return {
      summary: {
        totalTests,
        passedTests,
        failedTests: totalTests - passedTests,
        overallScore: Math.round(overallScore),
        totalTime,
        status:
          criticalErrors > 0
            ? 'critical'
            : highErrors > 0
              ? 'error'
              : allErrors.length > 0
                ? 'warning'
                : 'success',
      },
      details: {
        errors: allErrors,
        warnings: allWarnings,
        recommendations: allRecommendations,
      },
      results: this.validationResults,
      timestamp: new Date().toISOString(),
    };
  }

  outputResults(report) {
    switch (this.options.format) {
      case 'json':
        break;

      case 'summary':
        this.outputSummary(report);
        break;

      default:
        this.outputTable(report);
        break;
    }
  }

  outputSummary(report) {
    const { summary } = report;

    if (report.details.errors.length > 0) {
    }

    if (report.details.warnings.length > 0) {
    }

    if (report.details.recommendations.length > 0) {
    }
  }

  outputTable(report) {
    // Results table
    for (const result of report.results) {
      const _status = result.success ? '✅' : '❌';
      const _score = result.score.toString().padStart(3);
      const _name = result.name.padEnd(30);

      if (this.options.verbose) {
        if (result.errors && result.errors.length > 0) {
          result.errors.forEach((_error) => {});
        }

        if (result.warnings && result.warnings.length > 0) {
          result.warnings.forEach((_warning) => {});
        }
      }
    }

    // Issues summary
    if (report.details.errors.length > 0) {
      report.details.errors.slice(0, 5).forEach((_error) => {});
      if (report.details.errors.length > 5) {
      }
    }

    if (report.details.recommendations.length > 0 && this.options.verbose) {
      report.details.recommendations.slice(0, 3).forEach((_rec) => {});
    }
  }

  getStatusEmoji(status) {
    const emojis = {
      success: '🟢',
      warning: '🟡',
      error: '🟠',
      critical: '🔴',
    };
    return emojis[status] || '❓';
  }

  async exportReport(report) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `uel-validation-report-${timestamp}.json`;
    const filepath = path.join(process.cwd(), filename);

    try {
      await fs.writeFile(filepath, JSON.stringify(report, null, 2));
      this.logger.success(`Detailed report exported to: ${filename}`);
    } catch (error) {
      this.logger.error('Failed to export report:', error.message);
    }
  }

  async attemptFixes(report) {
    if (
      report.details.errors.length === 0 &&
      report.details.warnings.length === 0
    ) {
      this.logger.info('No issues to fix');
      return;
    }

    this.logger.info('🔧 Attempting to fix issues...');

    // Simple fixes that can be automated
    const fixCount = 0;

    for (const error of report.details.errors) {
      if (
        error.message.includes('missing') &&
        error.message.includes('component')
      ) {
        // Could attempt to generate missing components
        this.logger.debug(`Could potentially fix: ${error.message}`);
      }
    }

    for (const warning of report.details.warnings) {
      if (warning.message.includes('not integrated')) {
        // Could suggest integration steps
        this.logger.debug(`Integration opportunity: ${warning.message}`);
      }
    }

    if (fixCount > 0) {
      this.logger.success(`Applied ${fixCount} automated fixes`);
    } else {
      this.logger.info(
        'No automated fixes available - manual intervention required'
      );
    }
  }

  determineExitCode(report) {
    const { errors } = report.details;

    const criticalErrors = errors.filter(
      (e) => e.severity === 'critical'
    ).length;
    const highErrors = errors.filter((e) => e.severity === 'high').length;

    if (criticalErrors > 0) return 3;
    if (highErrors > 0) return 2;
    if (errors.length > 0) return 1;

    return 0;
  }
}

// Run the CLI if this script is executed directly
if (require.main === module) {
  const cli = new UELValidationCLI();
  cli.run().catch((error) => {
    // console.error('💥 Validation failed:', error);
    process.exit(3);
  });
}

module.exports = UELValidationCLI;
