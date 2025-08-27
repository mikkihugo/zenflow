/**
 * @fileoverview System and Solution Architecture Manager - Lightweight facade for SAFe framework integration.
 *
 * Provides system-level design coordination and solution architect workflow through delegation to specialized
 * services for system design management, compliance monitoring, and architecture reviews.
 *
 * Delegates to:
 * - SystemDesignManagementService: System design creation and lifecycle management
 * - ComplianceMonitoringService: Automated compliance validation and monitoring
 * - ArchitectureReviewManagementService: Architecture review workflows and coordination
 *
 * REDUCTION: 860 → ~300 lines (~65% reduction) through service delegation
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import { EventBus } from '@claude-zen/foundation';
import { getLogger, } from '../types';
/**
 * System architecture types for design coordination
 */
export var SystemArchitectureType;
(function (SystemArchitectureType) {
    SystemArchitectureType["MONOLITHIC"] = "monolithic";
    SystemArchitectureType["MICROSERVICES"] = "microservices";
    SystemArchitectureType["SERVICE_ORIENTED"] = "service_oriented";
    SystemArchitectureType["EVENT_DRIVEN"] = "event_driven";
    SystemArchitectureType["LAYERED"] = "layered";
    SystemArchitectureType["HEXAGONAL"] = "hexagonal";
    SystemArchitectureType["CLEAN_ARCHITECTURE"] = "clean_architecture";
})(SystemArchitectureType || (SystemArchitectureType = {}));
/**
 * Solution architecture patterns
 */
export var SolutionArchitecturePattern;
(function (SolutionArchitecturePattern) {
    SolutionArchitecturePattern["TRADITIONAL_3_TIER"] = "traditional_3_tier";
    SolutionArchitecturePattern["MICRO_FRONTEND"] = "micro_frontend";
    SolutionArchitecturePattern["SERVERLESS"] = "serverless";
    SolutionArchitecturePattern["CLOUD_NATIVE"] = "cloud_native";
    SolutionArchitecturePattern["HYBRID_CLOUD"] = "hybrid_cloud";
    SolutionArchitecturePattern["EDGE_COMPUTING"] = "edge_computing";
})(SolutionArchitecturePattern || (SolutionArchitecturePattern = {}));
/**
 * System design status
 */
export var SystemDesignStatus;
(function (SystemDesignStatus) {
    SystemDesignStatus["DRAFT"] = "draft";
    SystemDesignStatus["IN_REVIEW"] = "in_review";
    SystemDesignStatus["APPROVED"] = "approved";
    SystemDesignStatus["REJECTED"] = "rejected";
    SystemDesignStatus["DEPRECATED"] = "deprecated";
    SystemDesignStatus["IMPLEMENTATION_READY"] = "implementation_ready";
})(SystemDesignStatus || (SystemDesignStatus = {}));
/**
 * Component type
 */
export var ComponentType;
(function (ComponentType) {
    ComponentType["SERVICE"] = "service";
    ComponentType["DATABASE"] = "database";
    ComponentType["GATEWAY"] = "gateway";
    ComponentType["QUEUE"] = "queue";
    ComponentType["CACHE"] = "cache";
    ComponentType["EXTERNAL_SYSTEM"] = "external_system";
    ComponentType["UI_COMPONENT"] = "ui_component";
})(ComponentType || (ComponentType = {}));
// ============================================================================
// MAIN SYSTEM SOLUTION ARCHITECTURE MANAGER CLASS
// ============================================================================
/**
 * System and Solution Architecture Manager - Facade delegating to @claude-zen packages
 *
 * Coordinates system-level design and solution architecture through intelligent delegation
 * to specialized packages for architecture management, workflow orchestration, and compliance.
 */
export class SystemSolutionArchitectureManager extends EventBus {
    logger;
    eventBus;
    // Service delegation instances
    systemDesignService;
    complianceMonitoringService;
    architectureReviewService;
    performanceTracker;
    telemetryManager;
    initialized = false;
    constructor(_config, memorySystem, eventBus) {
        super();
        this.logger = getLogger('SystemSolutionArchitectureManager');
        ';
        this.config = config;
        this.memorySystem = memorySystem;
        this.eventBus = eventBus;
    }
    /**
     * Initialize with service delegation - LAZY LOADING
     */
    async initialize() {
        if (this.initialized)
            return;
        try {
            // Delegate to System Design Management Service
            const { SystemDesignManagementService } = await import('../services/system-solution/system-design-management-service', ');
            this.systemDesignService = new SystemDesignManagementService(this.logger, {
                maxSystemDesigns: 500,
                enableAIAnalysis: true,
                enablePatternRecognition: true,
                enableDesignValidation: true,
            });
            await this.systemDesignService.initialize();
            // Delegate to Compliance Monitoring Service
            const { ComplianceMonitoringService } = await import('../services/system-solution/compliance-monitoring-service');
            ';
            this.complianceMonitoringService = new ComplianceMonitoringService(this.logger, enableContinuousMonitoring, this.configuration.enableComplianceMonitoring, enableAutomatedRemediation, false, enableRealTimeAlerts, true, monitoringInterval, this.configuration.complianceCheckInterval || 3600000);
            await this.complianceMonitoringService.initialize();
            // Delegate to Architecture Review Management Service
            const { ArchitectureReviewManagementService } = await import('../services/system-solution/architecture-review-management-service');
            ';
            this.architectureReviewService = new ArchitectureReviewManagementService(this.logger, maxConcurrentReviews, this.configuration.maxConcurrentReviews, defaultReviewTimeout, this.configuration.reviewTimeout || 480, enableAIAnalysis, true, enableAutomatedReviews, true);
            await this.architectureReviewService.initialize();
            // Lazy load @claude-zen/foundation for performance tracking
            const { PerformanceTracker, TelemetryManager } = await import('@claude-zen/foundation', ');
            this.performanceTracker = new PerformanceTracker();
            this.telemetryManager = new TelemetryManager({
                serviceName: 'system-solution-architecture',
                enableTracing: true,
                enableMetrics: true,
            });
            await this.telemetryManager.initialize();
            // Setup event handlers
            this.setupEventHandlers();
            this.initialized = true;
            this.logger.info('System Solution Architecture Manager initialized successfully with service delegation', ');
            this.emit('initialized', { ': timestamp, new: Date(),
                enabledFeatures: this.getEnabledFeatures(),
            });
        }
        catch (error) {
            this.logger.error('Failed to initialize System Solution Architecture Manager:', error);
            throw error;
        }
    }
    /**
     * Create a new system design - Delegates to System Design Management Service
     */
    async createSystemDesign(name, type, pattern, businessContext) {
        if (!this.initialized)
            await this.initialize();
        const _timer = this.performanceTracker.startTimer('create_system_design');
        ';
        try {
            const _systemDesign = await this.systemDesignService.createSystemDesign(name, type, pattern, businessContext);
            this.performanceTracker.endTimer('create_system_design');
            ';
            this.telemetryManager.recordCounter('system_designs_created', 1, ', type, pattern);
            this.logger.info(`Created system design: ${name} (${type}/${pattern})`);
            `
      this.emit('systemDesignCreated', { systemDesign });'

      return systemDesign;
    } catch (error) {
      this.performanceTracker.endTimer('create_system_design');'
      this.logger.error('Failed to create system design:', error);'
      throw error;
    }
  }

  /**
   * Initiate architecture review - Delegates to Architecture Review Management Service
   */
  async initiateArchitectureReview(
    systemDesignId: string,
    reviewType: 'peer|formal|compliance|security',
    reviewerId: string
  ): Promise<ArchitectureReview> {
    if (!this.initialized) await this.initialize();

    const systemDesign =
      this.systemDesignService.getSystemDesign(systemDesignId);
    if (!systemDesign) {
      throw new Error(`;
            System;
            design;
            not;
            found: $systemDesignId `);`;
        }
        finally {
        }
        try {
            const reviewRequest = {
                systemDesignId,
                reviewType,
                reviewerId,
                priority: 'medium',
                deadline: new Date(Date.now() + (this.configuration.reviewTimeout || 480) * 60000),
            };
            const _review = await this.architectureReviewService.initiateArchitectureReview(reviewRequest, systemDesign);
            this.telemetryManager.recordCounter('architecture_reviews_initiated', 1, { ': reviewType,
            });
            this.logger.info(`Initiated ${reviewType} review for system design: ${systemDesign.name}` `
      );
      this.emit('architectureReviewInitiated', { review, systemDesign });'

      return review;
    } catch (error) {
      this.logger.error('Failed to initiate architecture review:', error);'
      throw error;
    }
  }

  /**
   * Validate compliance - Delegates to Compliance Monitoring Service
   */
  async validateCompliance(
    systemDesignId: string
  ): Promise<{
    compliant: boolean;
    violations: string[];
    recommendations: string[];
  }> {
    if (!this.initialized) await this.initialize();

    const systemDesign =
      this.systemDesignService.getSystemDesign(systemDesignId);
    if (!systemDesign) {
      throw new Error(`, System, design, not, found, $, { systemDesignId } `);`);
        }
        finally {
        }
        try {
            const validationResult = await this.complianceMonitoringService.validateCompliance(systemDesign);
            const violations = validationResult.violations.map((v) => v.description);
            const recommendations = validationResult.recommendations.map((r) => r.description);
            this.telemetryManager.recordGauge('compliance_score', validationResult.overallCompliance, {
                systemDesignId,
                violationCount: violations.length,
            });
            this.logger.info(`Compliance validation for ${systemDesign.name}: $validationResult.compliant ? 'COMPLIANT' : 'NON-COMPLIANT'` `
      );

      return {
        compliant: validationResult.compliant,
        violations,
        recommendations,
      };
    } catch (error) {
      this.logger.error('Failed to validate compliance:', error);'
      throw error;
    }
  }

  /**
   * Get system design by ID - Delegates to System Design Management Service
   */
  getSystemDesign(id: string): SystemDesign|undefined {
    if (!this.initialized||!this.systemDesignService) {
      return undefined;
    }
    return this.systemDesignService.getSystemDesign(id);
  }

  /**
   * Get all system designs - Delegates to System Design Management Service
   */
  getAllSystemDesigns(): SystemDesign[] {
    if (!this.initialized||!this.systemDesignService) {
      return [];
    }
    return this.systemDesignService.getAllSystemDesigns();
  }

  /**
   * Get architecture review by ID - Delegates to Architecture Review Management Service
   */
  getArchitectureReview(id: string): ArchitectureReview|undefined {
    if (!this.initialized||!this.architectureReviewService) {
      return undefined;
    }
    return this.architectureReviewService.getArchitectureReview(id);
  }

  /**
   * Get architecture metrics - Aggregates from all services
   */
  async getArchitectureMetrics(): Promise<any> {
    if (!this.initialized) await this.initialize();

    try {
      // Get metrics from each service
      const [designDashboard, reviewDashboard, complianceDashboard] =
        await Promise.all([
          this.systemDesignService?.getSystemDesignDashboard()||Promise.resolve(null),
          this.architectureReviewService?.getArchitectureReviewDashboard()||Promise.resolve(null),
          this.complianceMonitoringService?.getComplianceDashboard()||Promise.resolve(null),
        ]);

      return {
        systemDesigns: {
          total: designDashboard?.totalDesigns||0,
          byStatus: designDashboard?.designsByStatus||{},
          byType: designDashboard?.designsByType||{},
          byPattern: designDashboard?.designsByPattern||{},
          qualityScore: designDashboard?.designQualityScore||0,
        },
        reviews: {
          total: reviewDashboard?.totalReviews||0,
          active: reviewDashboard?.pendingReviews?.length||0,
          byType: reviewDashboard?.reviewsByType||{},
          averageTime: reviewDashboard?.averageReviewTime||0,
          effectiveness:
            reviewDashboard?.reviewEffectiveness?.overallEffectiveness||0,
        },
        compliance: {
          overallRate: complianceDashboard?.overallComplianceRate||0,
          byFramework: complianceDashboard?.complianceByFramework||{},
          violations: complianceDashboard?.violationsBySeverity||{},
          criticalCount: complianceDashboard?.criticalViolations?.length||0,
        },
      };
    } catch (error) {
      this.logger.error('Failed to get architecture metrics:', error);'
      return {
        systemDesigns: { total: 0 },
        reviews: { total: 0 },
        compliance: { overallRate: 0 },
      };
    }
  }

  /**
   * Shutdown the architecture manager and all services
   */
  async shutdown(): Promise<void> {
    try {
      // Shutdown all services
      if (this.systemDesignService?.shutdown) {
        await this.systemDesignService.shutdown();
      }
      if (this.complianceMonitoringService?.shutdown) {
        await this.complianceMonitoringService.shutdown();
      }
      if (this.architectureReviewService?.shutdown) {
        await this.architectureReviewService.shutdown();
      }
      if (this.telemetryManager?.shutdown) {
        await this.telemetryManager.shutdown();
      }

      this.initialized = false;
      this.logger.info(
        'System Solution Architecture Manager shutdown completed''
      );
    } catch (error) {
      this.logger.error('Error during shutdown:', error);'
      throw error;
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private setupEventHandlers(): void {
    // Forward events from System Design Service
    if (this.systemDesignService) {
      // Note: In production, would set up proper event forwarding from services
    }

    // Handle compliance check events
    this.eventBus.on('complianceCheckRequired', (event: any) => {'
      if (event.data?.systemDesignId) {
        this.validateCompliance(event.data.systemDesignId).catch((error) => {
          this.logger.error('Compliance check failed:', error);'
        });
      }
    });
  }

  // Review completion now handled by Architecture Review Management Service

  // Compliance monitoring now handled by Compliance Monitoring Service

  private getEnabledFeatures(): string[] {
    const features: string[] = [];
    if (this.configuration.enableSystemDesignCoordination)
      features.push('SystemDesignCoordination');'
    if (this.configuration.enableSolutionArchitectWorkflow)
      features.push('SolutionArchitectWorkflow');'
    if (this.configuration.enableArchitectureReviews)
      features.push('ArchitectureReviews');'
    if (this.configuration.enableComplianceMonitoring)
      features.push('ComplianceMonitoring');'
    if (this.configuration.enablePerformanceTracking)
      features.push('PerformanceTracking');'
    return features;
  }
}

/**
 * Create a System Solution Architecture Manager with default configuration
 */
export function createSystemSolutionArchitectureManager(
  memorySystem: MemorySystem,
  eventBus: TypeSafeEventBus,
  config?: Partial<SystemSolutionArchConfig>
): SystemSolutionArchitectureManager {
  const defaultConfig: SystemSolutionArchConfig = {
    enableSystemDesignCoordination: true,
    enableSolutionArchitectWorkflow: true,
    enableArchitectureReviews: true,
    enableComplianceMonitoring: true,
    enablePerformanceTracking: true,
    maxConcurrentReviews: 10,
    reviewTimeout: 480, // 8 hours in minutes
    complianceCheckInterval: 3600000, // 1 hour in milliseconds
  };

  return new SystemSolutionArchitectureManager(
    { ...defaultConfig, ...config },
    memorySystem,
    eventBus
  );
}

/**
 * Default export for easy import
 */
export default {
  SystemSolutionArchitectureManager,
  createSystemSolutionArchitectureManager,
  SystemArchitectureType,
  SolutionArchitecturePattern,
  SystemDesignStatus,
  ComponentType,
};
            );
        }
        finally { }
    }
}
