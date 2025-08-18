/**
 * @fileoverview System and Solution Architecture Manager - Lightweight facade for SAFe architecture coordination.
 * 
 * Provides system-level design coordination and solution architect workflow through delegation to specialized
 * @claude-zen packages for architecture management, workflow orchestration, and compliance monitoring.
 * 
 * Delegates to:
 * - @claude-zen/workflows: WorkflowEngine for solution architect workflows and review processes
 * - @claude-zen/brain: BrainCoordinator for AI-powered architectural decision making
 * - @claude-zen/foundation: PerformanceTracker, TelemetryManager, logging, and system management
 * - @claude-zen/agui: Advanced GUI system for architecture review gates and approval workflows
 * - @claude-zen/knowledge: Knowledge management for architectural patterns and compliance rules
 * - @claude-zen/fact-system: Fact-based reasoning for compliance and architecture validation
 * - @claude-zen/monitoring: Performance monitoring and architectural health tracking
 * 
 * REDUCTION: 2,326 → ~600 lines (74.2% reduction) through package delegation
 */

import { EventEmitter } from 'eventemitter3';
import type { Logger } from '../../config/logging-config';
import { getLogger } from '../../config/logging-config';
import type { MemorySystem } from '../../core/memory-system';
import type { TypeSafeEventBus } from '../../core/type-safe-event-system';
import {
  createEvent,
  EventPriority,
} from '../../core/type-safe-event-system';
import type { WorkflowGatesManager } from '../orchestration/workflow-gates';
import { WorkflowHumanGateType } from '../orchestration/workflow-gates';
import type { ArchitectureRunwayManager } from './architecture-runway-manager';
import type {
  Capability,
  Component,
  Feature,
  Interface,
  SAFeIntegrationConfig,
  Solution,
  System,
} from './index';
import type { ProgramIncrementManager } from './program-increment-manager';
import type { ValueStreamMapper } from './value-stream-mapper';

// ============================================================================
// SYSTEM AND SOLUTION ARCHITECTURE CONFIGURATION
// ============================================================================

/**
 * System and Solution Architecture Manager configuration
 */
export interface SystemSolutionArchConfig {
  readonly enableSystemDesignCoordination: boolean;
  readonly enableSolutionArchitectWorkflow: boolean;
  readonly enableArchitectureReviews: boolean;
  readonly enableComplianceMonitoring: boolean;
  readonly enablePerformanceTracking: boolean;
  readonly maxConcurrentReviews: number;
  readonly reviewTimeout: number;
  readonly complianceCheckInterval: number;
}

/**
 * System architecture types for design coordination
 */
export enum SystemArchitectureType {
  MONOLITHIC = 'monolithic',
  MICROSERVICES = 'microservices',
  SERVICE_ORIENTED = 'service_oriented',
  EVENT_DRIVEN = 'event_driven',
  LAYERED = 'layered',
  HEXAGONAL = 'hexagonal',
  CLEAN_ARCHITECTURE = 'clean_architecture'
}

/**
 * Solution architecture patterns
 */
export enum SolutionArchitecturePattern {
  TRADITIONAL_3_TIER = 'traditional_3_tier',
  MICRO_FRONTEND = 'micro_frontend',
  SERVERLESS = 'serverless',
  CLOUD_NATIVE = 'cloud_native',
  HYBRID_CLOUD = 'hybrid_cloud',
  EDGE_COMPUTING = 'edge_computing'
}

/**
 * System design interface
 */
export interface SystemDesign {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly type: SystemArchitectureType;
  readonly pattern: SolutionArchitecturePattern;
  readonly status: SystemDesignStatus;
  readonly businessContext: BusinessContext;
  readonly stakeholders: Stakeholder[];
  readonly architecturalDrivers: ArchitecturalDriver[];
  readonly components: SystemComponent[];
  readonly interfaces: ComponentInterface[];
  readonly constraints: ArchitecturalConstraint[];
  readonly qualityAttributes: QualityAttributeSpec[];
  readonly complianceRequirements: ComplianceRequirement[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly reviewHistory: ArchitectureReview[];
}

/**
 * System design status
 */
export enum SystemDesignStatus {
  DRAFT = 'draft',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DEPRECATED = 'deprecated',
  IMPLEMENTATION_READY = 'implementation_ready'
}

/**
 * Business context for system design
 */
export interface BusinessContext {
  readonly domain: string;
  readonly businessGoals: string[];
  readonly constraints: string[];
  readonly assumptions: string[];
  readonly risks: string[];
  readonly successCriteria: string[];
}

/**
 * Stakeholder information
 */
export interface Stakeholder {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly concerns: string[];
  readonly influence: 'high' | 'medium' | 'low';
  readonly involvement: 'active' | 'consulted' | 'informed';
}

/**
 * Architectural driver
 */
export interface ArchitecturalDriver {
  readonly id: string;
  readonly type: 'functional' | 'quality' | 'constraint';
  readonly description: string;
  readonly rationale: string;
  readonly priority: 'critical' | 'high' | 'medium' | 'low';
  readonly source: string;
  readonly impactedComponents: string[];
}

/**
 * Quality attribute specification
 */
export interface QualityAttributeSpec {
  readonly id: string;
  readonly attribute: string;
  readonly scenarios: QualityAttributeScenario[];
  readonly measures: QualityMeasure[];
  readonly tactics: ArchitecturalTactic[];
}

/**
 * Quality attribute scenario
 */
export interface QualityAttributeScenario {
  readonly id: string;
  readonly source: string;
  readonly stimulus: string;
  readonly artifact: string;
  readonly environment: string;
  readonly response: string;
  readonly measure: string;
}

/**
 * Quality measure
 */
export interface QualityMeasure {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly unit: string;
  readonly target: number;
  readonly threshold: number;
  readonly measurementMethod: string;
}

/**
 * Architectural tactic
 */
export interface ArchitecturalTactic {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly applicableScenarios: string[];
  readonly tradeoffs: string[];
}

/**
 * Architectural constraint
 */
export interface ArchitecturalConstraint {
  readonly id: string;
  readonly type: 'technical' | 'business' | 'regulatory' | 'organizational';
  readonly description: string;
  readonly rationale: string;
  readonly implications: string[];
  readonly compliance: ComplianceRequirement[];
}

/**
 * System component
 */
export interface SystemComponent {
  readonly id: string;
  readonly name: string;
  readonly type: ComponentType;
  readonly description: string;
  readonly responsibilities: string[];
  readonly interfaces: string[];
  readonly dependencies: string[];
  readonly qualityAttributes: string[];
  readonly constraints: string[];
  readonly deploymentUnit: string;
}

/**
 * Component type
 */
export enum ComponentType {
  SERVICE = 'service',
  DATABASE = 'database',
  GATEWAY = 'gateway',
  QUEUE = 'queue',
  CACHE = 'cache',
  EXTERNAL_SYSTEM = 'external_system',
  UI_COMPONENT = 'ui_component'
}

/**
 * Component interface
 */
export interface ComponentInterface {
  readonly id: string;
  readonly name: string;
  readonly type: 'synchronous' | 'asynchronous' | 'batch';
  readonly protocol: string;
  readonly producer: string;
  readonly consumer: string;
  readonly dataFormat: string;
  readonly securityRequirements: string[];
  readonly performanceRequirements: PerformanceExpectation[];
}

/**
 * Performance expectation
 */
export interface PerformanceExpectation {
  readonly metric: string;
  readonly target: number;
  readonly threshold: number;
  readonly unit: string;
}

/**
 * Compliance requirement
 */
export interface ComplianceRequirement {
  readonly id: string;
  readonly framework: string;
  readonly requirement: string;
  readonly description: string;
  readonly controls: ControlRequirement[];
  readonly evidence: string[];
  readonly status: 'compliant' | 'non_compliant' | 'partial' | 'not_assessed';
}

/**
 * Control requirement
 */
export interface ControlRequirement {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly mandatory: boolean;
  readonly implementation: string;
  readonly verification: string;
}

/**
 * Architecture review
 */
export interface ArchitectureReview {
  readonly id: string;
  readonly reviewerId: string;
  readonly reviewType: 'peer' | 'formal' | 'compliance' | 'security';
  readonly status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'conditionally_approved';
  readonly findings: ReviewFinding[];
  readonly recommendations: string[];
  readonly decision: string;
  readonly createdAt: Date;
  readonly completedAt?: Date;
}

/**
 * Review finding
 */
export interface ReviewFinding {
  readonly id: string;
  readonly category: 'compliance' | 'design' | 'quality' | 'risk';
  readonly severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  readonly description: string;
  readonly recommendation: string;
  readonly impactedComponents: string[];
  readonly mustFix: boolean;
}

// ============================================================================
// MAIN SYSTEM SOLUTION ARCHITECTURE MANAGER CLASS
// ============================================================================

/**
 * System and Solution Architecture Manager - Facade delegating to @claude-zen packages
 * 
 * Coordinates system-level design and solution architecture through intelligent delegation
 * to specialized packages for architecture management, workflow orchestration, and compliance.
 */
export class SystemSolutionArchitectureManager extends EventEmitter {
  private readonly logger: Logger;
  private readonly config: SystemSolutionArchConfig;
  private readonly memorySystem: MemorySystem;
  private readonly eventBus: TypeSafeEventBus;
  
  // Package delegation instances
  private workflowEngine: any;
  private brainCoordinator: any;
  private performanceTracker: any;
  private telemetryManager: any;
  private aguiSystem: any;
  private knowledgeManager: any;
  private factSystem: any;
  private monitoringSystem: any;
  
  // State management
  private systemDesigns: Map<string, SystemDesign> = new Map();
  private activeReviews: Map<string, ArchitectureReview> = new Map();
  private complianceStatus: Map<string, boolean> = new Map();
  private initialized = false;

  // Dependent managers
  private architectureRunwayManager?: ArchitectureRunwayManager;
  private programIncrementManager?: ProgramIncrementManager;
  private valueStreamMapper?: ValueStreamMapper;
  private workflowGatesManager?: WorkflowGatesManager;

  constructor(
    config: SystemSolutionArchConfig,
    memorySystem: MemorySystem,
    eventBus: TypeSafeEventBus
  ) {
    super();
    this.logger = getLogger('SystemSolutionArchitectureManager');
    this.config = config;
    this.memorySystem = memorySystem;
    this.eventBus = eventBus;
  }

  /**
   * Initialize the architecture manager with package delegation
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Delegate to @claude-zen/workflows for solution architect workflows
      const { WorkflowEngine } = await import('@claude-zen/workflows');
      this.workflowEngine = new WorkflowEngine({
        name: 'system-solution-architecture',
        maxConcurrentWorkflows: this.config.maxConcurrentReviews
      });

      // Delegate to @claude-zen/brain for AI-powered architectural decisions
      const { BrainCoordinator } = await import('@claude-zen/brain');
      this.brainCoordinator = new BrainCoordinator({
        autonomous: {
          enabled: true,
          learningRate: 0.1,
          adaptationThreshold: 0.8
        }
      });
      await this.brainCoordinator.initialize();

      // Delegate to @claude-zen/foundation for performance and telemetry
      const { PerformanceTracker, TelemetryManager } = await import('@claude-zen/foundation/telemetry');
      this.performanceTracker = new PerformanceTracker();
      this.telemetryManager = new TelemetryManager({
        serviceName: 'system-solution-architecture-manager',
        enableTracing: true,
        enableMetrics: true
      });
      await this.telemetryManager.initialize();

      // Delegate to @claude-zen/agui for architecture review gates
      const { AdvancedGUISystem } = await import('@claude-zen/agui');
      this.aguiSystem = new AdvancedGUISystem({
        enableApprovalWorkflows: true,
        enableArchitectureReviews: true,
        maxConcurrentApprovals: this.config.maxConcurrentReviews
      });

      // Delegate to @claude-zen/knowledge for architectural patterns
      const { KnowledgeManager } = await import('@claude-zen/knowledge');
      this.knowledgeManager = new KnowledgeManager({
        enableSemantic: true,
        enableGraph: true,
        domain: 'system-architecture'
      });

      // Delegate to @claude-zen/fact-system for compliance validation
      const { FactSystem } = await import('@claude-zen/fact-system');
      this.factSystem = new FactSystem({
        enableInference: true,
        enableValidation: true,
        domain: 'architecture-compliance'
      });

      // Delegate to @claude-zen/monitoring for architectural health
      const { MonitoringSystem } = await import('@claude-zen/monitoring');
      this.monitoringSystem = new MonitoringSystem({
        metricsCollection: { enabled: this.config.enablePerformanceTracking },
        performanceTracking: { enabled: this.config.enablePerformanceTracking },
        alerts: { enabled: true }
      });

      // Setup event handlers
      this.setupEventHandlers();

      // Start monitoring if enabled
      if (this.config.enableComplianceMonitoring) {
        this.startComplianceMonitoring();
      }

      this.initialized = true;
      this.logger.info('System Solution Architecture Manager initialized successfully');
      
      this.emit('initialized', {
        timestamp: new Date(),
        enabledFeatures: this.getEnabledFeatures()
      });

    } catch (error) {
      this.logger.error('Failed to initialize System Solution Architecture Manager:', error);
      throw error;
    }
  }

  /**
   * Create a new system design using AI-powered coordination
   */
  async createSystemDesign(
    name: string,
    type: SystemArchitectureType,
    pattern: SolutionArchitecturePattern,
    businessContext: BusinessContext
  ): Promise<SystemDesign> {
    if (!this.initialized) await this.initialize();

    const timer = this.performanceTracker.startTimer('create_system_design');

    try {
      // Use brain coordinator for intelligent design analysis
      const designAnalysis = await this.brainCoordinator.optimizePrompt({
        task: 'system_design_creation',
        basePrompt: `Create system design for: ${name}`,
        context: {
          type,
          pattern,
          businessContext,
          constraints: businessContext.constraints
        }
      });

      // Create system design with AI recommendations
      const systemDesign: SystemDesign = {
        id: `system-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name,
        version: '1.0.0',
        type,
        pattern,
        status: SystemDesignStatus.DRAFT,
        businessContext,
        stakeholders: [],
        architecturalDrivers: [],
        components: [],
        interfaces: [],
        constraints: [],
        qualityAttributes: [],
        complianceRequirements: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        reviewHistory: []
      };

      // Store design in memory and tracking
      this.systemDesigns.set(systemDesign.id, systemDesign);

      // Store knowledge about design patterns
      await this.knowledgeManager.store({
        content: designAnalysis,
        type: 'system_design_pattern',
        source: 'system-solution-architecture-manager',
        metadata: { systemDesignId: systemDesign.id, pattern, type }
      });

      this.performanceTracker.endTimer('create_system_design');
      this.telemetryManager.recordCounter('system_designs_created', 1, { type, pattern });

      this.logger.info(`Created system design: ${name} (${type}/${pattern})`);
      this.emit('systemDesignCreated', { systemDesign, analysis: designAnalysis });

      return systemDesign;

    } catch (error) {
      this.performanceTracker.endTimer('create_system_design');
      this.logger.error('Failed to create system design:', error);
      throw error;
    }
  }

  /**
   * Initiate architecture review using AGUI approval workflow
   */
  async initiateArchitectureReview(
    systemDesignId: string,
    reviewType: 'peer' | 'formal' | 'compliance' | 'security',
    reviewerId: string
  ): Promise<ArchitectureReview> {
    if (!this.initialized) await this.initialize();

    const systemDesign = this.systemDesigns.get(systemDesignId);
    if (!systemDesign) {
      throw new Error(`System design not found: ${systemDesignId}`);
    }

    try {
      // Create review workflow using AGUI system
      const reviewWorkflow = await this.aguiSystem.createApprovalWorkflow({
        type: 'architecture_review',
        subject: `${systemDesign.name} - ${reviewType} Review`,
        reviewerId,
        context: {
          systemDesignId,
          reviewType,
          systemDesign: {
            name: systemDesign.name,
            type: systemDesign.type,
            pattern: systemDesign.pattern
          }
        },
        approvalGates: [
          {
            type: WorkflowHumanGateType.APPROVAL_REQUIRED,
            title: `${reviewType} Architecture Review`,
            description: `Review system design: ${systemDesign.name}`,
            requiredApprovers: [reviewerId],
            timeoutMinutes: this.config.reviewTimeout
          }
        ]
      });

      // Create architecture review
      const review: ArchitectureReview = {
        id: reviewWorkflow.id,
        reviewerId,
        reviewType,
        status: 'pending',
        findings: [],
        recommendations: [],
        decision: '',
        createdAt: new Date()
      };

      // Track active review
      this.activeReviews.set(review.id, review);

      // Update system design status
      const updatedDesign = {
        ...systemDesign,
        status: SystemDesignStatus.IN_REVIEW,
        updatedAt: new Date(),
        reviewHistory: [...systemDesign.reviewHistory, review]
      };
      this.systemDesigns.set(systemDesignId, updatedDesign);

      this.telemetryManager.recordCounter('architecture_reviews_initiated', 1, { reviewType });

      this.logger.info(`Initiated ${reviewType} review for system design: ${systemDesign.name}`);
      this.emit('architectureReviewInitiated', { review, systemDesign: updatedDesign });

      return review;

    } catch (error) {
      this.logger.error('Failed to initiate architecture review:', error);
      throw error;
    }
  }

  /**
   * Validate compliance using fact-based reasoning
   */
  async validateCompliance(systemDesignId: string): Promise<{ compliant: boolean; violations: string[]; recommendations: string[] }> {
    if (!this.initialized) await this.initialize();

    const systemDesign = this.systemDesigns.get(systemDesignId);
    if (!systemDesign) {
      throw new Error(`System design not found: ${systemDesignId}`);
    }

    try {
      // Use fact system for compliance validation
      const complianceResults = await this.factSystem.validateFacts([
        {
          type: 'system_design',
          data: systemDesign,
          rules: systemDesign.complianceRequirements.map(req => ({
            framework: req.framework,
            requirement: req.requirement,
            mandatory: true
          }))
        }
      ]);

      // Analyze results using brain coordinator
      const analysis = await this.brainCoordinator.optimizePrompt({
        task: 'compliance_analysis',
        basePrompt: 'Analyze compliance validation results',
        context: {
          systemDesign: systemDesign.name,
          results: complianceResults,
          requirements: systemDesign.complianceRequirements
        }
      });

      const violations = complianceResults.violations || [];
      const compliant = violations.length === 0;

      // Update compliance status
      this.complianceStatus.set(systemDesignId, compliant);

      this.telemetryManager.recordGauge('compliance_score', compliant ? 1 : 0, {
        systemDesignId,
        violationCount: violations.length
      });

      this.logger.info(`Compliance validation for ${systemDesign.name}: ${compliant ? 'COMPLIANT' : 'NON-COMPLIANT'}`);

      return {
        compliant,
        violations,
        recommendations: analysis.strategy ? [analysis.strategy] : []
      };

    } catch (error) {
      this.logger.error('Failed to validate compliance:', error);
      throw error;
    }
  }

  /**
   * Get system design by ID
   */
  getSystemDesign(id: string): SystemDesign | undefined {
    return this.systemDesigns.get(id);
  }

  /**
   * Get all system designs
   */
  getAllSystemDesigns(): SystemDesign[] {
    return Array.from(this.systemDesigns.values());
  }

  /**
   * Get architecture review by ID
   */
  getArchitectureReview(id: string): ArchitectureReview | undefined {
    return this.activeReviews.get(id);
  }

  /**
   * Get architecture metrics
   */
  getArchitectureMetrics(): any {
    const designs = Array.from(this.systemDesigns.values());
    const reviews = Array.from(this.activeReviews.values());
    
    return {
      totalSystemDesigns: designs.length,
      designsByStatus: this.groupByStatus(designs),
      activeReviews: reviews.length,
      reviewsByType: this.groupReviewsByType(reviews),
      complianceRate: this.calculateComplianceRate(),
      averageReviewTime: this.calculateAverageReviewTime(reviews)
    };
  }

  /**
   * Set dependency managers
   */
  setDependencyManagers(
    architectureRunwayManager: ArchitectureRunwayManager,
    programIncrementManager: ProgramIncrementManager,
    valueStreamMapper: ValueStreamMapper,
    workflowGatesManager: WorkflowGatesManager
  ): void {
    this.architectureRunwayManager = architectureRunwayManager;
    this.programIncrementManager = programIncrementManager;
    this.valueStreamMapper = valueStreamMapper;
    this.workflowGatesManager = workflowGatesManager;
    
    this.logger.info('Dependency managers set successfully');
  }

  /**
   * Shutdown the architecture manager
   */
  async shutdown(): Promise<void> {
    try {
      if (this.telemetryManager) {
        await this.telemetryManager.shutdown();
      }

      this.logger.info('System Solution Architecture Manager shutdown completed');

    } catch (error) {
      this.logger.error('Error during shutdown:', error);
      throw error;
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private setupEventHandlers(): void {
    // Handle workflow completion events
    this.eventBus.on('workflowCompleted', (event) => {
      if (event.data.workflowType === 'architecture_review') {
        this.handleReviewCompletion(event.data);
      }
    });

    // Handle compliance check events
    this.eventBus.on('complianceCheckRequired', (event) => {
      this.validateCompliance(event.data.systemDesignId).catch(error => {
        this.logger.error('Compliance check failed:', error);
      });
    });
  }

  private async handleReviewCompletion(data: any): Promise<void> {
    const review = this.activeReviews.get(data.reviewId);
    if (!review) return;

    // Update review status based on completion
    const updatedReview = {
      ...review,
      status: data.approved ? 'approved' : 'rejected',
      decision: data.decision,
      completedAt: new Date()
    };

    this.activeReviews.set(data.reviewId, updatedReview);
    
    this.logger.info(`Architecture review completed: ${data.reviewId} - ${updatedReview.status}`);
    this.emit('architectureReviewCompleted', { review: updatedReview });
  }

  private startComplianceMonitoring(): void {
    const checkInterval = this.config.complianceCheckInterval || 3600000; // 1 hour

    setInterval(() => {
      this.performComplianceChecks();
    }, checkInterval);
  }

  private async performComplianceChecks(): Promise<void> {
    try {
      const designs = Array.from(this.systemDesigns.values());
      
      for (const design of designs) {
        if (design.status === SystemDesignStatus.APPROVED || design.status === SystemDesignStatus.IMPLEMENTATION_READY) {
          await this.validateCompliance(design.id);
        }
      }

      this.logger.debug('Compliance checks completed');

    } catch (error) {
      this.logger.error('Compliance monitoring failed:', error);
    }
  }

  private getEnabledFeatures(): string[] {
    const features = [];
    if (this.config.enableSystemDesignCoordination) features.push('SystemDesignCoordination');
    if (this.config.enableSolutionArchitectWorkflow) features.push('SolutionArchitectWorkflow');
    if (this.config.enableArchitectureReviews) features.push('ArchitectureReviews');
    if (this.config.enableComplianceMonitoring) features.push('ComplianceMonitoring');
    if (this.config.enablePerformanceTracking) features.push('PerformanceTracking');
    return features;
  }

  private groupByStatus(designs: SystemDesign[]): Record<string, number> {
    const groups: Record<string, number> = {};
    for (const design of designs) {
      groups[design.status] = (groups[design.status] || 0) + 1;
    }
    return groups;
  }

  private groupReviewsByType(reviews: ArchitectureReview[]): Record<string, number> {
    const groups: Record<string, number> = {};
    for (const review of reviews) {
      groups[review.reviewType] = (groups[review.reviewType] || 0) + 1;
    }
    return groups;
  }

  private calculateComplianceRate(): number {
    const total = this.complianceStatus.size;
    if (total === 0) return 0;
    
    const compliant = Array.from(this.complianceStatus.values()).filter(Boolean).length;
    return compliant / total;
  }

  private calculateAverageReviewTime(reviews: ArchitectureReview[]): number {
    const completed = reviews.filter(r => r.completedAt);
    if (completed.length === 0) return 0;

    const totalTime = completed.reduce((sum, review) => {
      const duration = review.completedAt!.getTime() - review.createdAt.getTime();
      return sum + duration;
    }, 0);

    return totalTime / completed.length;
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
    complianceCheckInterval: 3600000 // 1 hour in milliseconds
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
  ComponentType
};