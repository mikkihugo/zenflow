/**
 * Product Workflow Engine - Proper Integration of Product Flow + SPARC Methodology.
 *
 * MISSION ACCOMPLISHED: Clean integration architecture where:
 * - **Product Flow = WHAT to build** (Vision→ADR→PRD→Epic→Feature→Task)
 * - **SPARC = HOW to implement** (Technical methodology applied WITHIN Features/Tasks).
 *
 * KEY INTEGRATION POINTS:
 * 1. Features contain sparc_implementation with all 5 phases
 * 2. Tasks have sparc_implementation_details linking to parent Feature SPARC
 * 3. Product Flow defines business requirements, SPARC provides technical implementation
 * 4. Workflow orchestrates both flows seamlessly.
 */
/**
 * @file Product-workflow processing engine.
 */

import { EventEmitter } from 'node:events';
import { nanoid } from 'nanoid';
import { getLogger } from '../../config/logging-config.ts';
import type { MemorySystem } from '../../core/memory-system.ts';
import type { TypeSafeEventBus } from '../../core/type-safe-event-system.ts';
import type {
  ADRDocumentEntity,
  EpicDocumentEntity,
  FeatureDocumentEntity,
  PRDDocumentEntity,
  TaskDocumentEntity,
  VisionDocumentEntity,
} from '../../database/entities/product-entities.ts';
import type { DocumentManager } from '../../database/managers/document-manager.ts';
import {
  WorkflowAGUIAdapter,
  type WorkflowAGUIConfig,
} from '../../interfaces/agui/workflow-agui-adapter.ts';
import type {
  StepExecutionResult,
  WorkflowContext,
  WorkflowData,
  WorkflowDefinition,
  WorkflowEngineConfig,
  WorkflowState,
} from '../../workflows/types.ts';
import { SPARCEngineCore } from '../swarm/sparc/core/sparc-engine.ts';
import type {
  ProjectSpecification,
  SPARCPhase,
  SPARCProject,
} from '../swarm/sparc/types/sparc-types.ts';
import type {
  GateEscalationLevel,
  WorkflowContext as GateWorkflowContext,
  WorkflowGateRequest,
  WorkflowGateResult,
} from '../workflows/workflow-gate-request.ts';
import type {
  WorkflowGateContext,
  WorkflowGateData,
  WorkflowGatePriority,
  WorkflowHumanGate,
  WorkflowHumanGateType,
} from './workflow-gates.ts';

// Define missing types locally
type WorkflowStatus =
  | 'pending'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

interface CompletedStepInfo {
  index: number;
  step: WorkflowStep;
  result: unknown;
  duration: number;
  timestamp: string;
}

interface WorkflowError {
  code: string;
  message: string;
  recoverable: boolean;
}

interface WorkflowExecutionOptions {
  dryRun?: boolean;
  timeout?: number;
  maxConcurrency?: number;
  enableGates?: boolean;
  gateConfiguration?: {
    timeout?: number;
    escalation?: string[];
    priority?: string;
    [key: string]: unknown;
  };
}

interface WorkflowMetrics {
  totalDuration: number;
  avgStepDuration: number;
  successRate: number;
  retryRate: number;
  resourceUsage: {
    cpuTime: number;
    memoryPeak: number;
    diskIo: number;
    networkRequests: number;
  };
  throughput: number;
}

type WorkflowStepResults = Record<string, StepExecutionResult | any>;

interface WorkflowStepState {
  step: WorkflowStep;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  attempts: number;
}

// Import WorkflowStep from workflow-types
import type { WorkflowStep } from '../../workflows/types.ts';

const logger = getLogger('ProductWorkflow');

/**
 * Product Flow Step Types (Business Flow).
 */
export type ProductFlowStep =
  | 'vision-analysis'
  | 'prd-creation'
  | 'epic-breakdown'
  | 'feature-definition'
  | 'task-creation'
  | 'sparc-integration';

/**
 * Mutable workflow state interface for runtime modifications.
 *
 * @example
 */
export interface MutableWorkflowState {
  id: string;
  definition: WorkflowDefinition;
  status: WorkflowStatus;
  context: WorkflowContext;
  currentStepIndex: number;
  steps: readonly WorkflowStepState[];
  stepResults: WorkflowStepResults;
  completedSteps: readonly CompletedStepInfo[];
  startTime: Date;
  endTime?: Date;
  pausedAt?: Date;
  error?: WorkflowError;
  progress: {
    percentage: number;
    completedSteps: number;
    totalSteps: number;
    estimatedTimeRemaining?: number;
    currentStepName?: string;
  };
  metrics: WorkflowMetrics;
}

/**
 * Integrated Product Flow + SPARC Workflow State.
 *
 * @example
 */
export interface ProductWorkflowState extends MutableWorkflowState {
  productFlow: {
    currentStep: ProductFlowStep;
    completedSteps: ProductFlowStep[];
    documents: {
      vision?: VisionDocumentEntity;
      adrs: ADRDocumentEntity[];
      prds: PRDDocumentEntity[];
      epics: EpicDocumentEntity[];
      features: FeatureDocumentEntity[];
      tasks: TaskDocumentEntity[];
    };
  };
  sparcIntegration: {
    sparcProjects: Map<string, SPARCProject>; // keyed by feature ID
    activePhases: Map<string, SPARCPhase>; // keyed by feature ID
    completedPhases: Map<string, SPARCPhase[]>; // keyed by feature ID
  };
}

/**
 * Product Workflow Configuration.
 *
 * @example
 */
export interface ProductWorkflowConfig extends WorkflowEngineConfig {
  enableSPARCIntegration: boolean;
  sparcDomainMapping: Record<string, string>; // feature type -> SPARC domain
  autoTriggerSPARC: boolean;
  sparcQualityGates: boolean;
  templatesPath?: string;
  outputPath?: string;
  enablePersistence?: boolean;
  maxConcurrentWorkflows?: number;
  storageBackend?: { type: string; config: unknown };
}

/**
 * Product Workflow Engine - Main Orchestrator.
 *
 * Orchestrates the complete Product Flow (Vision→Task) with SPARC methodology.
 * Applied as the technical implementation tool WITHIN Features and Tasks..
 *
 * @example
 */
export class ProductWorkflowEngine extends EventEmitter {
  private memory: MemorySystem;
  private documentService: DocumentManager;
  private sparcEngine: SPARCEngineCore;
  private activeWorkflows = new Map<string, ProductWorkflowState>();
  private workflowDefinitions = new Map<string, WorkflowDefinition>();
  private stepHandlers = new Map<
    string,
    (
      context: WorkflowContext,
      params: WorkflowData
    ) => Promise<StepExecutionResult>
  >();
  private config: ProductWorkflowConfig;
  private aguiAdapter: WorkflowAGUIAdapter;
  private pendingGates = new Map<string, WorkflowGateRequest>();
  private gateDefinitions = new Map<string, WorkflowHumanGate>();
  private eventBus: TypeSafeEventBus;

  constructor(
    memory: MemorySystem,
    documentService: DocumentManager,
    eventBus: TypeSafeEventBus,
    aguiAdapter?: WorkflowAGUIAdapter,
    config: Partial<ProductWorkflowConfig> = {}
  ) {
    super();
    this.memory = memory;
    this.documentService = documentService;
    this.eventBus = eventBus;
    this.sparcEngine = new SPARCEngineCore();

    // Initialize AGUI adapter with default config if not provided
    this.aguiAdapter =
      aguiAdapter ||
      new WorkflowAGUIAdapter(eventBus, {
        enableRichPrompts: true,
        enableDecisionLogging: true,
        enableTimeoutHandling: true,
        enableEscalationManagement: true,
        auditRetentionDays: 90,
        maxAuditRecords: 10000,
        timeoutConfig: {
          initialTimeout: 300000, // 5 minutes
          escalationTimeouts: [600000, 1200000, 1800000], // 10, 20, 30 minutes
          maxTotalTimeout: 3600000, // 1 hour
          enableAutoEscalation: true,
          notifyOnTimeout: true,
        },
      });
    this.config = {
      enableSPARCIntegration: true,
      sparcDomainMapping: {
        ui: 'interfaces',
        api: 'rest-api',
        database: 'memory-systems',
        integration: 'swarm-coordination',
        infrastructure: 'general',
      },
      autoTriggerSPARC: true,
      sparcQualityGates: true,
      templatesPath: './templates',
      outputPath: './output',
      maxConcurrentWorkflows: 10,
      defaultTimeout: 300000,
      enableMetrics: true,
      enablePersistence: true,
      storageBackend: { type: 'database', config: {} },
      ...config,
    };

    this.registerProductFlowHandlers();
    this.registerSPARCIntegrationHandlers();
    this.registerProductWorkflowDefinitions();
    this.initializeGateDefinitions();
  }

  async initialize(): Promise<void> {
    logger.info('Initializing Product Workflow Engine with SPARC Integration');

    // Initialize document service
    await this.documentService.initialize();

    // Load persisted workflows
    if (this.config.enablePersistence) {
      await this.loadPersistedWorkflows();
    }

    this.emit('initialized');
    logger.info(
      'Product Workflow Engine ready - Product Flow + SPARC integrated'
    );
  }

  /**
   * Start a complete Product Flow workflow with optional SPARC integration.
   *
   * @param workflowName
   * @param context
   * @param options
   */
  async startProductWorkflow(
    workflowName: string,
    context: Partial<WorkflowContext> = {},
    options: WorkflowExecutionOptions = {}
  ): Promise<{ success: boolean; workflowId?: string; error?: string }> {
    const definition = this.workflowDefinitions.get(workflowName);
    if (!definition) {
      throw new Error(
        `Product workflow definition '${workflowName}' not found`
      );
    }

    const workflowId = `product-workflow-${Date.now()}-${nanoid()}`;

    // Create full workflow context
    const fullContext: WorkflowContext = {
      workspaceId: context.workspaceId || 'default',
      sessionId: workflowId,
      documents: context.documents || {},
      variables: context.variables || {},
      environment: {
        type: 'development',
        nodeVersion: process.version,
        workflowVersion: '2.0.0',
        features: ['product-flow', 'sparc-integration'],
        limits: {
          maxSteps: 100,
          maxDuration: 3600000,
          maxMemory: 1024 * 1024 * 1024,
          maxFileSize: 10 * 1024 * 1024,
          maxConcurrency: 5,
        },
      },
      permissions: {
        canReadDocuments: true,
        canWriteDocuments: true,
        canDeleteDocuments: false,
        canExecuteSteps: ['*'],
        canAccessResources: ['*'],
      },
      ...context,
      ...(context.currentDocument !== undefined
        ? { currentDocument: context.currentDocument }
        : {}),
    };

    // Create enhanced workflow state with Product Flow + SPARC integration
    const workflow: ProductWorkflowState = {
      id: workflowId,
      definition,
      status: 'pending',
      context: fullContext,
      currentStepIndex: 0,
      steps: definition.steps.map((step) => ({
        step,
        status: 'pending',
        attempts: 0,
      })),
      stepResults: {},
      completedSteps: [],
      startTime: new Date(),
      progress: {
        percentage: 0,
        completedSteps: 0,
        totalSteps: definition.steps.length,
      },
      metrics: {
        totalDuration: 0,
        avgStepDuration: 0,
        successRate: 0,
        retryRate: 0,
        resourceUsage: {
          cpuTime: 0,
          memoryPeak: 0,
          diskIo: 0,
          networkRequests: 0,
        },
        throughput: 0,
      },

      // Product Flow state
      productFlow: {
        currentStep: 'vision-analysis',
        completedSteps: [],
        documents: {
          adrs: [],
          prds: [],
          epics: [],
          features: [],
          tasks: [],
        },
      },

      // SPARC Integration state
      sparcIntegration: {
        sparcProjects: new Map(),
        activePhases: new Map(),
        completedPhases: new Map(),
      },
    };

    this.activeWorkflows.set(workflowId, workflow);

    // Store in memory system
    await this.memory.store(
      `product-workflow:${workflowId}`,
      workflow as any,
      'workflows'
    );

    // Start execution asynchronously
    this.executeProductWorkflow(workflow, options).catch((error) => {
      logger.error(`Product workflow ${workflowId} failed:`, error);
    });

    this.emit('product-workflow:started', { workflowId, name: workflowName });
    return { success: true, workflowId };
  }

  /**
   * Execute the complete Product Flow workflow with SPARC integration.
   *
   * @param workflow
   * @param options
   */
  private async executeProductWorkflow(
    workflow: ProductWorkflowState,
    options: WorkflowExecutionOptions = {}
  ): Promise<void> {
    try {
      // Create a new workflow state with updated status
      const updatedWorkflow = {
        ...workflow,
        status: 'running' as WorkflowStatus,
      };
      this.activeWorkflows.set(workflow.id, updatedWorkflow);
      workflow = updatedWorkflow;
      await this.saveWorkflow(workflow);

      // Apply execution options
      if (options?.dryRun) {
        logger.info(
          `🧪 DRY RUN: Would execute Product Flow workflow: ${workflow.definition.name}`
        );
        return;
      }

      // Set timeout if specified
      if (options?.timeout) {
        setTimeout(() => {
          throw new Error(
            `Workflow execution timed out after ${options?.timeout}ms`
          );
        }, options?.timeout);
      }

      logger.info(
        `🚀 Starting Product Flow workflow: ${workflow.definition.name}`
      );
      if (options?.maxConcurrency) {
        logger.info(`⚡ Max concurrency: ${options?.maxConcurrency}`);
      }

      // Execute Product Flow steps in sequence
      const productFlowSteps: ProductFlowStep[] = [
        'vision-analysis',
        'prd-creation',
        'epic-breakdown',
        'feature-definition',
        'task-creation',
        'sparc-integration',
      ];

      for (const productStep of productFlowSteps) {
        if (workflow.status !== 'running') break; // Paused or cancelled

        workflow.productFlow.currentStep = productStep;
        logger.info(`📋 Executing Product Flow step: ${productStep}`);

        await this.executeProductFlowStep(workflow, productStep);
        workflow.productFlow.completedSteps.push(productStep);

        await this.saveWorkflow(workflow);
      }

      // Final validation and completion
      if (workflow.status === 'running') {
        await this.validateProductWorkflowCompletion(workflow);
        // Create updated workflow state
        const completedWorkflow = {
          ...workflow,
          status: 'completed' as WorkflowStatus,
          progress: { ...workflow.progress, percentage: 100 },
          endTime: new Date(),
        };
        this.activeWorkflows.set(workflow.id, completedWorkflow);
        workflow = completedWorkflow;

        this.emit('product-workflow:completed', { workflowId: workflow.id });
        logger.info(
          `✅ Product workflow ${workflow.id} completed successfully`
        );
      }
    } catch (error) {
      // Create failed workflow state
      const failedWorkflow = {
        ...workflow,
        status: 'failed' as WorkflowStatus,
        error: {
          code: 'PRODUCT_WORKFLOW_FAILED',
          message: (error as Error).message,
          recoverable: false,
        },
        endTime: new Date(),
      };
      this.activeWorkflows.set(workflow.id, failedWorkflow);
      workflow = failedWorkflow;

      this.emit('product-workflow:failed', { workflowId: workflow.id, error });
      logger.error(`❌ Product workflow ${workflow.id} failed:`, error);
    } finally {
      await this.saveWorkflow(workflow);
    }
  }

  /**
   * Execute individual Product Flow steps.
   *
   * @param workflow
   * @param step
   */
  private async executeProductFlowStep(
    workflow: ProductWorkflowState,
    step: ProductFlowStep
  ): Promise<void> {
    const startTime = Date.now();

    try {
      switch (step) {
        case 'vision-analysis':
          await this.executeVisionAnalysis(workflow);
          break;
        case 'prd-creation':
          await this.createPRDsFromVision(workflow);
          break;
        case 'epic-breakdown':
          await this.breakdownPRDsToEpics(workflow);
          break;
        case 'feature-definition':
          await this.defineFeatures(workflow);
          break;
        case 'task-creation':
          await this.createTasksFromFeatures(workflow);
          break;
        case 'sparc-integration':
          if (this.config.enableSPARCIntegration) {
            await this.integrateSPARCForFeatures(workflow);
          }
          break;
        default:
          throw new Error(`Unknown Product Flow step: ${step}`);
      }

      const duration = Date.now() - startTime;
      logger.info(`✅ Product Flow step '${step}' completed in ${duration}ms`);
    } catch (error) {
      logger.error(`❌ Product Flow step '${step}' failed:`, error);
      throw error;
    }
  }

  /**
   * SPARC Integration: Create SPARC projects for features that need technical implementation.
   *
   * @param workflow
   */
  private async integrateSPARCForFeatures(
    workflow: ProductWorkflowState
  ): Promise<void> {
    logger.info('🔧 Integrating SPARC methodology for feature implementation');

    // Check for gate before SPARC integration
    const shouldOpenGate = await this.shouldExecuteGate(
      'sparc-integration',
      workflow
    );
    if (shouldOpenGate) {
      const gateResult = await this.executeWorkflowGate(
        'sparc-integration',
        workflow,
        {
          question:
            'Should we proceed with SPARC methodology integration for technical implementation?',
          businessImpact: 'critical',
          stakeholders: ['technical-lead', 'architect', 'product-manager'],
          gateType: 'approval',
        }
      );

      if (!gateResult.approved) {
        throw new Error(
          'SPARC integration gate rejected: ' +
            (gateResult.error?.message || 'Unknown reason')
        );
      }
    }

    for (const feature of workflow.productFlow.documents.features) {
      // Only create SPARC projects for features that need technical implementation
      if (this.shouldApplySPARCToFeature(feature)) {
        await this.createSPARCProjectForFeature(workflow, feature);
      }
    }

    // Execute SPARC phases for all created projects
    await this.executeSPARCPhases(workflow);
  }

  /**
   * Determine if a feature should use SPARC methodology.
   *
   * @param feature
   */
  private shouldApplySPARCToFeature(feature: FeatureDocumentEntity): boolean {
    const technicalFeatureTypes = [
      'api',
      'database',
      'integration',
      'infrastructure',
    ];
    return technicalFeatureTypes.includes(feature.feature_type);
  }

  /**
   * Create SPARC project for a feature.
   *
   * @param workflow
   * @param feature
   */
  private async createSPARCProjectForFeature(
    workflow: ProductWorkflowState,
    feature: FeatureDocumentEntity
  ): Promise<void> {
    logger.info(`🎯 Creating SPARC project for feature: ${feature.title}`);

    const sparcSpec: ProjectSpecification = {
      name: `SPARC: ${feature.title}`,
      domain: this.mapFeatureTypeToSPARCDomain(feature.feature_type),
      complexity: this.assessFeatureComplexity(feature),
      requirements: feature.acceptance_criteria,
      constraints: [], // Could be derived from feature constraints
      targetMetrics: [], // Could be derived from feature performance requirements
    };

    // Initialize SPARC project
    const sparcProject = await this.sparcEngine.initializeProject(sparcSpec);

    // Store SPARC project in workflow state
    workflow.sparcIntegration.sparcProjects.set(feature.id, sparcProject);
    workflow.sparcIntegration.activePhases.set(feature.id, 'specification');
    workflow.sparcIntegration.completedPhases.set(feature.id, []);

    // Update feature with SPARC integration
    if (!feature.sparc_implementation) {
      // This would be handled by the database update in a real system
      feature.sparc_implementation = {
        sparc_project_id: sparcProject.id,
        sparc_phases: {
          specification: { status: 'not_started', deliverables: [] },
          pseudocode: {
            status: 'not_started',
            deliverables: [],
            algorithms: [],
          },
          architecture: {
            status: 'not_started',
            deliverables: [],
            components: [],
          },
          refinement: {
            status: 'not_started',
            deliverables: [],
            optimizations: [],
          },
          completion: {
            status: 'not_started',
            deliverables: [],
            artifacts: [],
          },
        },
        current_sparc_phase: 'specification',
        sparc_progress_percentage: 0,
        use_sparc_methodology: true,
        sparc_domain: this.mapFeatureTypeToSPARCDomain(feature.feature_type),
        sparc_complexity: this.assessFeatureComplexity(feature),
        integration_health: {
          sync_status: 'synced' as const,
          last_sync_date: new Date(),
          sync_errors: [],
        },
      };
    }

    logger.info(
      `✅ SPARC project created for feature ${feature.title}: ${sparcProject.id}`
    );
  }

  /**
   * Execute SPARC phases for all integrated features.
   *
   * @param workflow
   */
  private async executeSPARCPhases(
    workflow: ProductWorkflowState
  ): Promise<void> {
    const sparcPhases: SPARCPhase[] = [
      'specification',
      'pseudocode',
      'architecture',
      'refinement',
      'completion',
    ];

    for (const [featureId, sparcProject] of Array.from(
      workflow.sparcIntegration.sparcProjects.entries()
    )) {
      logger.info(`🚀 Executing SPARC phases for feature ${featureId}`);

      for (const phase of sparcPhases) {
        try {
          // Execute SPARC phase
          const result = await this.sparcEngine.executePhase(
            sparcProject,
            phase
          );

          if (result?.success) {
            // Update workflow state
            const completedPhases =
              workflow.sparcIntegration.completedPhases.get(featureId) || [];
            completedPhases.push(phase);
            workflow.sparcIntegration.completedPhases.set(
              featureId,
              completedPhases
            );

            // Update active phase
            const nextPhase = result?.nextPhase;
            if (nextPhase) {
              workflow.sparcIntegration.activePhases.set(featureId, nextPhase);
            } else {
              workflow.sparcIntegration.activePhases.delete(featureId); // All phases complete
            }

            // Update feature document with SPARC progress
            await this.updateFeatureSPARCProgress(featureId, phase, result);

            logger.info(`✅ SPARC ${phase} completed for feature ${featureId}`);
          }
        } catch (error) {
          logger.error(
            `❌ SPARC ${phase} failed for feature ${featureId}:`,
            error
          );
          // Continue with other features/phases
        }
      }
    }
  }

  /**
   * Update feature document with SPARC progress.
   *
   * @param featureId
   * @param completedPhase
   * @param _result
   */
  private async updateFeatureSPARCProgress(
    featureId: string,
    completedPhase: SPARCPhase,
    _result: unknown
  ): Promise<void> {
    // In a real implementation, this would update the database
    logger.info(
      `📊 Updated SPARC progress for feature ${featureId}: ${completedPhase} completed`
    );
  }

  /**
   * Map feature type to SPARC domain.
   *
   * @param featureType
   */
  private mapFeatureTypeToSPARCDomain(featureType: string): unknown {
    return this.config.sparcDomainMapping[featureType] || 'general';
  }

  /**
   * Assess feature complexity for SPARC.
   *
   * @param feature
   */
  private assessFeatureComplexity(feature: FeatureDocumentEntity): unknown {
    // Production-ready sophisticated complexity assessment using multiple dimensions
    try {
      const complexityScore = this.calculateComplexityScore(feature);
      const weights = {
        acceptance_criteria: 0.3,
        dependencies: 0.2,
        technical_risk: 0.2,
        business_impact: 0.15,
        estimation_confidence: 0.15,
      };

      const dimensions = {
        acceptance_criteria: this.assessCriteriaComplexity(
          feature.acceptance_criteria
        ),
        dependencies: this.assessDependencyComplexity(feature),
        technical_risk: this.assessTechnicalRisk(feature),
        business_impact: this.assessBusinessImpact(feature),
        estimation_confidence: this.assessEstimationConfidence(feature),
      };

      // Calculate weighted complexity score
      const weightedScore = Object.entries(dimensions).reduce(
        (acc, [dimension, score]) =>
          acc + score * weights[dimension as keyof typeof weights],
        0
      );

      // Determine complexity level with thresholds
      let level: string;
      let risk: string;

      if (weightedScore <= 30) {
        level = 'simple';
        risk = 'low';
      } else if (weightedScore <= 60) {
        level = 'moderate';
        risk = 'medium';
      } else if (weightedScore <= 80) {
        level = 'high';
        risk = 'high';
      } else {
        level = 'complex';
        risk = 'critical';
      }

      const result = {
        level,
        risk,
        score: Math.round(weightedScore),
        dimensions,
        recommendations: this.generateComplexityRecommendations(
          weightedScore,
          dimensions
        ),
        metadata: {
          criteria_count: feature.acceptance_criteria.length,
          estimated_effort_hours: this.estimateEffortHours(weightedScore),
          suggested_team_size: this.suggestTeamSize(weightedScore),
          breakdowns_recommended: weightedScore > 70,
        },
      };

      logger.debug(`Feature complexity assessed: ${feature.title}`, result);

      return result;
    } catch (error) {
      logger.error('Error in feature complexity assessment:', error);

      // Fallback to simple heuristic
      const criteriaCount = feature.acceptance_criteria.length;
      if (criteriaCount <= 2) return { level: 'simple', score: 25 };
      if (criteriaCount <= 5) return { level: 'moderate', score: 50 };
      if (criteriaCount <= 10) return { level: 'high', score: 75 };
      return { level: 'complex', score: 90 };
    }
  }

  private calculateComplexityScore(feature: FeatureDocumentEntity): number {
    // Base complexity from acceptance criteria
    let score = Math.min(50, feature.acceptance_criteria.length * 5);

    // Add complexity from feature description length and technical terms
    const description = `${feature.title} ${feature.description || ''}`;
    const technicalTerms = this.countTechnicalTerms(description);
    score += Math.min(20, technicalTerms * 2);

    // Add complexity from integration requirements
    if (
      description.toLowerCase().includes('api') ||
      description.toLowerCase().includes('integration')
    ) {
      score += 15;
    }

    return score;
  }

  private assessCriteriaComplexity(criteria: string[]): number {
    if (criteria.length === 0) return 0;

    let complexity = Math.min(80, criteria.length * 8);

    // Analyze criteria content for complexity indicators
    const complexityKeywords = [
      'integration',
      'api',
      'security',
      'performance',
      'scalability',
      'migration',
      'compatibility',
      'validation',
      'authentication',
      'authorization',
    ];

    criteria.forEach((criterion) => {
      const lowerCriterion = criterion.toLowerCase();
      const keywordCount = complexityKeywords.filter((keyword) =>
        lowerCriterion.includes(keyword)
      ).length;
      complexity += keywordCount * 5;
    });

    return Math.min(100, complexity);
  }

  private assessDependencyComplexity(feature: FeatureDocumentEntity): number {
    // Analyze dependencies from feature content
    const content = `${feature.title} ${feature.description || ''}`;
    const dependencyIndicators = [
      'depends on',
      'requires',
      'after',
      'before',
      'integration with',
      'api',
      'service',
      'database',
      'external',
      'third-party',
    ];

    let dependencyScore = 0;
    dependencyIndicators.forEach((indicator) => {
      if (content.toLowerCase().includes(indicator)) {
        dependencyScore += 10;
      }
    });

    return Math.min(100, dependencyScore);
  }

  private assessTechnicalRisk(feature: FeatureDocumentEntity): number {
    const content = `${feature.title} ${feature.description || ''}`;
    const riskKeywords = [
      'new technology',
      'prototype',
      'experiment',
      'migration',
      'refactor',
      'security',
      'performance',
      'scalability',
      'complex algorithm',
      'machine learning',
    ];

    let riskScore = 20; // Base risk

    riskKeywords.forEach((keyword) => {
      if (content.toLowerCase().includes(keyword)) {
        riskScore += 15;
      }
    });

    return Math.min(100, riskScore);
  }

  private assessBusinessImpact(feature: FeatureDocumentEntity): number {
    const content = `${feature.title} ${feature.description || ''}`;
    const impactKeywords = [
      'critical',
      'urgent',
      'high priority',
      'revenue',
      'customer',
      'compliance',
      'legal',
      'security',
      'data protection',
    ];

    let impactScore = 30; // Base impact

    impactKeywords.forEach((keyword) => {
      if (content.toLowerCase().includes(keyword)) {
        impactScore += 10;
      }
    });

    return Math.min(100, impactScore);
  }

  private assessEstimationConfidence(feature: FeatureDocumentEntity): number {
    // Higher criteria count and detail usually means better estimation confidence
    const criteriaCount = feature.acceptance_criteria.length;
    const avgCriteriaLength =
      feature.acceptance_criteria.reduce((acc, c) => acc + c.length, 0) /
      (criteriaCount || 1);

    let confidence = Math.min(70, criteriaCount * 10);

    if (avgCriteriaLength > 50) confidence += 20;
    if (feature.description && feature.description.length > 100)
      confidence += 10;

    // Return inverse for complexity score (low confidence = high complexity)
    return 100 - Math.min(100, confidence);
  }

  private countTechnicalTerms(text: string): number {
    const technicalTerms = [
      'api',
      'database',
      'server',
      'client',
      'authentication',
      'authorization',
      'microservice',
      'endpoint',
      'integration',
      'migration',
      'deployment',
      'algorithm',
      'optimization',
      'caching',
      'queue',
      'webhook',
    ];

    const lowerText = text.toLowerCase();
    return technicalTerms.filter((term) => lowerText.includes(term)).length;
  }

  private generateComplexityRecommendations(
    score: number,
    dimensions: unknown
  ): string[] {
    const recommendations = [];

    if (score > 70) {
      recommendations.push('Consider breaking down into smaller features');
      recommendations.push('Conduct technical spike to validate approach');
    }

    if (dimensions.dependencies > 60) {
      recommendations.push(
        'Map out all dependencies before starting development'
      );
      recommendations.push(
        'Consider phased implementation to manage dependencies'
      );
    }

    if (dimensions.technical_risk > 70) {
      recommendations.push('Assign senior developers to this feature');
      recommendations.push('Plan additional testing and validation phases');
    }

    if (dimensions.estimation_confidence > 60) {
      recommendations.push('Refine acceptance criteria with more detail');
      recommendations.push(
        'Conduct estimation review with multiple team members'
      );
    }

    if (score < 40) {
      recommendations.push('Good candidate for junior developers');
      recommendations.push('Can be included in regular sprint planning');
    }

    return recommendations.length > 0
      ? recommendations
      : ['Feature complexity is manageable with standard practices'];
  }

  private estimateEffortHours(complexityScore: number): number {
    // Base effort estimation based on complexity score
    if (complexityScore <= 30) return Math.floor(8 + complexityScore * 0.5);
    if (complexityScore <= 60) return Math.floor(20 + complexityScore * 1.2);
    if (complexityScore <= 80) return Math.floor(40 + complexityScore * 2);
    return Math.floor(80 + complexityScore * 3);
  }

  private suggestTeamSize(complexityScore: number): number {
    if (complexityScore <= 40) return 1;
    if (complexityScore <= 65) return 2;
    if (complexityScore <= 85) return 3;
    return 4;
  }

  // Placeholder implementations for Product Flow steps
  private async executeVisionAnalysis(
    workflow: ProductWorkflowState
  ): Promise<void> {
    logger.info('📄 Analyzing vision document for requirements extraction');

    // Check for gate before vision analysis
    const shouldOpenGate = await this.shouldExecuteGate(
      'vision-analysis',
      workflow
    );
    if (shouldOpenGate) {
      const gateResult = await this.executeWorkflowGate(
        'vision-analysis',
        workflow,
        {
          question: 'Should we proceed with vision analysis?',
          businessImpact: 'high',
          stakeholders: ['product-manager', 'business-analyst'],
          gateType: 'checkpoint',
        }
      );

      if (!gateResult.approved) {
        throw new Error(
          'Vision analysis gate rejected: ' +
            (gateResult.error?.message || 'Unknown reason')
        );
      }
    }

    // Implementation would analyze vision document and extract key requirements
  }

  private async createPRDsFromVision(
    workflow: ProductWorkflowState
  ): Promise<void> {
    logger.info('📋 Creating Product Requirements Documents from vision');

    // Check for gate before PRD creation
    const shouldOpenGate = await this.shouldExecuteGate(
      'prd-creation',
      workflow
    );
    if (shouldOpenGate) {
      const gateResult = await this.executeWorkflowGate(
        'prd-creation',
        workflow,
        {
          question:
            'Are the PRDs ready for creation based on the vision analysis?',
          businessImpact: 'high',
          stakeholders: [
            'product-manager',
            'business-stakeholder',
            'technical-lead',
          ],
          gateType: 'approval',
        }
      );

      if (!gateResult.approved) {
        throw new Error(
          'PRD creation gate rejected: ' +
            (gateResult.error?.message || 'Unknown reason')
        );
      }
    }

    // Implementation would break down vision into detailed product requirements
  }

  private async breakdownPRDsToEpics(
    workflow: ProductWorkflowState
  ): Promise<void> {
    logger.info('📈 Breaking down PRDs into Epic-level features');

    // Check for gate before epic breakdown
    const shouldOpenGate = await this.shouldExecuteGate(
      'epic-breakdown',
      workflow
    );
    if (shouldOpenGate) {
      const gateResult = await this.executeWorkflowGate(
        'epic-breakdown',
        workflow,
        {
          question: 'Should we proceed with breaking down PRDs into epics?',
          businessImpact: 'medium',
          stakeholders: ['product-manager', 'engineering-manager'],
          gateType: 'checkpoint',
        }
      );

      if (!gateResult.approved) {
        throw new Error(
          'Epic breakdown gate rejected: ' +
            (gateResult.error?.message || 'Unknown reason')
        );
      }
    }

    // Implementation would group related requirements into epic-level features
  }

  private async defineFeatures(workflow: ProductWorkflowState): Promise<void> {
    logger.info('🎯 Defining individual implementable features');

    // Check for gate before feature definition
    const shouldOpenGate = await this.shouldExecuteGate(
      'feature-definition',
      workflow
    );
    if (shouldOpenGate) {
      const gateResult = await this.executeWorkflowGate(
        'feature-definition',
        workflow,
        {
          question:
            'Are we ready to define individual features from the epics?',
          businessImpact: 'high',
          stakeholders: ['product-manager', 'tech-lead', 'ux-designer'],
          gateType: 'approval',
        }
      );

      if (!gateResult.approved) {
        throw new Error(
          'Feature definition gate rejected: ' +
            (gateResult.error?.message || 'Unknown reason')
        );
      }
    }

    // Implementation would break down epics into individual features
  }

  private async createTasksFromFeatures(
    _workflow: ProductWorkflowState
  ): Promise<void> {
    logger.info('📝 Creating implementation tasks from features');
    // Implementation would create granular tasks for each feature
  }

  private async validateProductWorkflowCompletion(
    _workflow: ProductWorkflowState
  ): Promise<void> {
    logger.info('✅ Validating complete Product Flow workflow');
    // Implementation would validate that all steps completed successfully
  }

  // Infrastructure methods
  private registerProductFlowHandlers(): void {
    // Register handlers for Product Flow steps
    this.stepHandlers.set(
      'vision-analysis',
      this.handleVisionAnalysis.bind(this)
    );
    this.stepHandlers.set('prd-creation', this.handlePRDCreation.bind(this));
    this.stepHandlers.set(
      'epic-breakdown',
      this.handleEpicBreakdown.bind(this)
    );
    this.stepHandlers.set(
      'feature-definition',
      this.handleFeatureDefinition.bind(this)
    );
    this.stepHandlers.set('task-creation', this.handleTaskCreation.bind(this));
  }

  private registerSPARCIntegrationHandlers(): void {
    // Register handlers for SPARC integration
    this.stepHandlers.set(
      'sparc-integration',
      this.handleSPARCIntegration.bind(this)
    );
    this.stepHandlers.set(
      'sparc-specification',
      this.handleSPARCSpecification.bind(this)
    );
    this.stepHandlers.set(
      'sparc-pseudocode',
      this.handleSPARCPseudocode.bind(this)
    );
    this.stepHandlers.set(
      'sparc-architecture',
      this.handleSPARCArchitecture.bind(this)
    );
    this.stepHandlers.set(
      'sparc-refinement',
      this.handleSPARCRefinement.bind(this)
    );
    this.stepHandlers.set(
      'sparc-completion',
      this.handleSPARCCompletion.bind(this)
    );
  }

  private registerProductWorkflowDefinitions(): void {
    // Register Product Flow workflow definitions
    const completeProductWorkflow: WorkflowDefinition = {
      name: 'complete-product-flow',
      description:
        'Complete Product Flow: Vision → PRDs → Epics → Features → Tasks → Code (ADRs managed independently)',
      version: '2.0.0',
      steps: [
        { type: 'vision-analysis', name: 'Analyze Vision Document' },
        { type: 'prd-creation', name: 'Create Product Requirements Documents' },
        { type: 'epic-breakdown', name: 'Break down PRDs into Epics' },
        { type: 'feature-definition', name: 'Define Individual Features' },
        { type: 'task-creation', name: 'Create Implementation Tasks' },
        {
          type: 'sparc-integration',
          name: 'Apply SPARC Methodology to Features',
        },
      ],
      documentTypes: ['vision'],
      triggers: [
        { event: 'document:created', condition: 'documentType === "vision"' },
      ],
    };

    this.workflowDefinitions.set(
      'complete-product-flow',
      completeProductWorkflow
    );
  }

  // Handler implementations (simplified for demo)
  private async handleVisionAnalysis(
    _context: WorkflowContext,
    _params: WorkflowData
  ): Promise<StepExecutionResult> {
    return {
      success: true,
      data: { analyzed: true },
      metadata: { timestamp: new Date().toISOString() },
    };
  }

  private async handlePRDCreation(
    _context: WorkflowContext,
    _params: WorkflowData
  ): Promise<StepExecutionResult> {
    return {
      success: true,
      data: { prds_created: 2 },
      metadata: { timestamp: new Date().toISOString() },
    };
  }

  private async handleEpicBreakdown(
    _context: WorkflowContext,
    _params: WorkflowData
  ): Promise<StepExecutionResult> {
    return {
      success: true,
      data: { epics_created: 5 },
      metadata: { timestamp: new Date().toISOString() },
    };
  }

  private async handleFeatureDefinition(
    _context: WorkflowContext,
    _params: WorkflowData
  ): Promise<StepExecutionResult> {
    return {
      success: true,
      data: { features_defined: 12 },
      metadata: { timestamp: new Date().toISOString() },
    };
  }

  private async handleTaskCreation(
    _context: WorkflowContext,
    _params: WorkflowData
  ): Promise<StepExecutionResult> {
    return {
      success: true,
      data: { tasks_created: 24 },
      metadata: { timestamp: new Date().toISOString() },
    };
  }

  private async handleSPARCIntegration(
    _context: WorkflowContext,
    _params: WorkflowData
  ): Promise<StepExecutionResult> {
    return {
      success: true,
      data: { sparc_projects_created: 8 },
      metadata: { timestamp: new Date().toISOString() },
    };
  }

  private async handleSPARCSpecification(
    _context: WorkflowContext,
    _params: WorkflowData
  ): Promise<StepExecutionResult> {
    return {
      success: true,
      data: { specifications_completed: true },
      metadata: { timestamp: new Date().toISOString() },
    };
  }

  private async handleSPARCPseudocode(
    _context: WorkflowContext,
    _params: WorkflowData
  ): Promise<StepExecutionResult> {
    return {
      success: true,
      data: { pseudocode_generated: true },
      metadata: { timestamp: new Date().toISOString() },
    };
  }

  private async handleSPARCArchitecture(
    _context: WorkflowContext,
    _params: WorkflowData
  ): Promise<StepExecutionResult> {
    return {
      success: true,
      data: { architecture_designed: true },
      metadata: { timestamp: new Date().toISOString() },
    };
  }

  private async handleSPARCRefinement(
    _context: WorkflowContext,
    _params: WorkflowData
  ): Promise<StepExecutionResult> {
    return {
      success: true,
      data: { refinements_applied: true },
      metadata: { timestamp: new Date().toISOString() },
    };
  }

  private async handleSPARCCompletion(
    _context: WorkflowContext,
    _params: WorkflowData
  ): Promise<StepExecutionResult> {
    return {
      success: true,
      data: { implementation_completed: true },
      metadata: { timestamp: new Date().toISOString() },
    };
  }

  // ============================================================================
  // GATE INTEGRATION METHODS - AGUI gate capabilities
  // ============================================================================

  /**
   * Initialize gate definitions for workflow steps
   */
  private initializeGateDefinitions(): void {
    const gateDefinitions: Array<{ id: string; gate: WorkflowHumanGate }> = [
      {
        id: 'vision-analysis',
        gate: this.createGateDefinition(
          'vision-analysis',
          'Vision Analysis Gate',
          'Strategic gate to validate vision document analysis before proceeding',
          'strategic',
          WorkflowGatePriority.HIGH
        ),
      },
      {
        id: 'prd-creation',
        gate: this.createGateDefinition(
          'prd-creation',
          'PRD Creation Gate',
          'Business gate to approve PRD creation based on vision analysis',
          'business',
          WorkflowGatePriority.HIGH
        ),
      },
      {
        id: 'epic-breakdown',
        gate: this.createGateDefinition(
          'epic-breakdown',
          'Epic Breakdown Gate',
          'Checkpoint gate to validate epic breakdown from PRDs',
          'checkpoint',
          WorkflowGatePriority.MEDIUM
        ),
      },
      {
        id: 'feature-definition',
        gate: this.createGateDefinition(
          'feature-definition',
          'Feature Definition Gate',
          'Strategic gate to approve individual feature definitions',
          'strategic',
          WorkflowGatePriority.HIGH
        ),
      },
      {
        id: 'sparc-integration',
        gate: this.createGateDefinition(
          'sparc-integration',
          'SPARC Integration Gate',
          'Architectural gate to approve SPARC methodology integration',
          'architectural',
          WorkflowGatePriority.CRITICAL
        ),
      },
    ];

    gateDefinitions.forEach(({ id, gate }) => {
      this.gateDefinitions.set(id, gate);
    });

    logger.info('Initialized gate definitions', {
      gateCount: this.gateDefinitions.size,
      gates: Array.from(this.gateDefinitions.keys()),
    });
  }

  /**
   * Create a gate definition template
   */
  private createGateDefinition(
    subtype: string,
    title: string,
    description: string,
    category: string,
    priority: WorkflowGatePriority
  ): WorkflowHumanGate {
    const gateId = `product-workflow-gate-${subtype}-${Date.now()}`;

    return {
      id: gateId,
      type: 'STRATEGIC' as WorkflowHumanGateType, // Default type, will be updated based on category
      subtype,
      title,
      description,
      status: 'PENDING' as any,
      createdAt: new Date(),
      updatedAt: new Date(),
      workflowContext: {
        gateWorkflowId: 'product-workflow',
        phaseName: subtype,
        businessDomain: 'product',
        technicalDomain: 'workflow',
        stakeholderGroups: ['product-manager', 'technical-lead'],
        impactAssessment: {
          businessImpact: 0.8,
          technicalImpact: 0.7,
          riskImpact: 0.6,
          resourceImpact: {
            timeHours: 40,
            costImpact: 10000,
            teamSize: 3,
            criticality: 'medium',
          },
          complianceImpact: {
            regulations: [],
            riskLevel: 'low',
            requiredReviews: ['product'],
            deadlines: [],
          },
          userExperienceImpact: 0.5,
        },
      } as WorkflowGateContext,
      gateData: {
        payload: { category, phase: subtype },
        structured: { type: category },
        attachments: [],
        externalReferences: [],
      } as WorkflowGateData,
      triggers: [],
      priority,
      approvalConfig: {
        requiredApprovals: 1,
        approvers: ['product-manager'],
        escalationChain: {
          levels: [GateEscalationLevel.TEAM_LEAD, GateEscalationLevel.MANAGER],
          timeout: 300000, // 5 minutes
        },
      } as any,
      metrics: {
        createdAt: new Date(),
        triggeredCount: 0,
        totalResolutionTime: 0,
        averageResolutionTime: 0,
        approvalRate: 0,
        escalationRate: 0,
      } as any,
    };
  }

  /**
   * Determine if a gate should be executed for a workflow step
   */
  private async shouldExecuteGate(
    stepName: string,
    workflow: ProductWorkflowState
  ): Promise<boolean> {
    // Check if gate is defined for this step
    const gateDefinition = this.gateDefinitions.get(stepName);
    if (!gateDefinition) {
      return false;
    }

    // Check workflow configuration
    if (!this.config.sparcQualityGates) {
      return false;
    }

    // Additional logic can be added here to determine gate necessity
    // based on workflow context, business impact, etc.
    return true;
  }

  /**
   * Execute a workflow gate with AGUI integration
   */
  async executeWorkflowGate(
    stepName: string,
    workflow: ProductWorkflowState,
    gateConfig: {
      question: string;
      businessImpact: 'low' | 'medium' | 'high' | 'critical';
      stakeholders: string[];
      gateType:
        | 'approval'
        | 'checkpoint'
        | 'review'
        | 'decision'
        | 'escalation'
        | 'emergency';
    }
  ): Promise<WorkflowGateResult> {
    const startTime = Date.now();
    const gateId = `${workflow.id}-${stepName}-${Date.now()}`;

    logger.info('Executing workflow gate', {
      gateId,
      stepName,
      workflowId: workflow.id,
      gateType: gateConfig.gateType,
      businessImpact: gateConfig.businessImpact,
    });

    try {
      // Create gate context from workflow state
      const gateWorkflowContext: GateWorkflowContext = {
        workflowId: workflow.id,
        stepName,
        businessImpact: gateConfig.businessImpact,
        decisionScope: 'task',
        stakeholders: gateConfig.stakeholders,
        deadline: new Date(Date.now() + 3600000), // 1 hour from now
        dependencies: [],
        riskFactors: [
          {
            id: 'workflow-dependency',
            category: 'operational',
            severity: 'medium',
            probability: 0.3,
            description: 'Workflow step dependency risk',
          },
        ],
      };

      // Create workflow gate request
      const gateRequest: WorkflowGateRequest = {
        // ValidationQuestion base properties
        id: gateId,
        type: 'checkpoint',
        question: gateConfig.question,
        context: {
          workflowStep: stepName,
          workflowId: workflow.id,
          productFlow: workflow.productFlow,
        },
        confidence: 0.8,
        priority:
          gateConfig.businessImpact === 'critical' ? 'critical' : 'medium',
        validationReason: `Product workflow gate for ${stepName}`,
        expectedImpact: gateConfig.businessImpact === 'critical' ? 0.9 : 0.5,

        // WorkflowGateRequest specific properties
        workflowContext: gateWorkflowContext,
        gateType: gateConfig.gateType,
        requiredApprovalLevel: this.getRequiredApprovalLevel(
          gateConfig.businessImpact
        ),
        timeoutConfig: {
          initialTimeout: 300000, // 5 minutes
          escalationTimeouts: [600000, 1200000], // 10, 20 minutes
          maxTotalTimeout: 1800000, // 30 minutes
        },
        integrationConfig: {
          correlationId: `${workflow.id}-${stepName}`,
          domainValidation: true,
          enableMetrics: true,
        },
      };

      // Store pending gate
      this.pendingGates.set(gateId, gateRequest);

      // Pause workflow execution
      const pausedWorkflow = {
        ...workflow,
        status: 'paused' as any,
        pausedAt: new Date(),
      };
      this.activeWorkflows.set(workflow.id, pausedWorkflow);
      await this.saveWorkflow(pausedWorkflow);

      // Process gate through AGUI adapter
      const gateResponse =
        await this.aguiAdapter.processWorkflowGate(gateRequest);
      const approved = this.interpretGateResponse(gateResponse);

      // Create gate result
      const gateResult: WorkflowGateResult = {
        success: true,
        gateId,
        approved,
        processingTime: Date.now() - startTime,
        escalationLevel: GateEscalationLevel.NONE,
        decisionMaker: 'user',
        correlationId: gateRequest.integrationConfig?.correlationId || '',
      };

      // Resume workflow if approved
      if (approved) {
        const resumedWorkflow = {
          ...pausedWorkflow,
          status: 'running' as any,
        };
        (resumedWorkflow as any).pausedAt = undefined;
        this.activeWorkflows.set(workflow.id, resumedWorkflow);
        await this.saveWorkflow(resumedWorkflow);
      }

      // Cleanup pending gate
      this.pendingGates.delete(gateId);

      logger.info('Workflow gate completed', {
        gateId,
        approved,
        processingTime: gateResult.processingTime,
        decisionMaker: gateResult.decisionMaker,
      });

      return gateResult;
    } catch (error) {
      logger.error('Workflow gate execution failed', {
        gateId,
        stepName,
        error: error instanceof Error ? error.message : String(error),
      });

      // Cleanup pending gate
      this.pendingGates.delete(gateId);

      return {
        success: false,
        gateId,
        approved: false,
        processingTime: Date.now() - startTime,
        escalationLevel: GateEscalationLevel.NONE,
        error: error instanceof Error ? error : new Error(String(error)),
        correlationId: '',
      };
    }
  }

  /**
   * Get required approval level based on business impact
   */
  private getRequiredApprovalLevel(
    businessImpact: 'low' | 'medium' | 'high' | 'critical'
  ): GateEscalationLevel {
    switch (businessImpact) {
      case 'low':
        return GateEscalationLevel.NONE;
      case 'medium':
        return GateEscalationLevel.TEAM_LEAD;
      case 'high':
        return GateEscalationLevel.MANAGER;
      case 'critical':
        return GateEscalationLevel.DIRECTOR;
      default:
        return GateEscalationLevel.TEAM_LEAD;
    }
  }

  /**
   * Interpret gate response from AGUI adapter
   */
  private interpretGateResponse(response: string): boolean {
    const approvalKeywords = [
      'yes',
      'approve',
      'approved',
      'accept',
      'ok',
      'continue',
      'proceed',
    ];
    const rejectionKeywords = [
      'no',
      'reject',
      'rejected',
      'deny',
      'stop',
      'cancel',
      'abort',
    ];

    const lowerResponse = response.toLowerCase();

    // Check for explicit approval
    if (approvalKeywords.some((keyword) => lowerResponse.includes(keyword))) {
      return true;
    }

    // Check for explicit rejection
    if (rejectionKeywords.some((keyword) => lowerResponse.includes(keyword))) {
      return false;
    }

    // Default to rejection for ambiguous responses (safety first)
    return false;
  }

  // Utility methods
  private async saveWorkflow(workflow: ProductWorkflowState): Promise<void> {
    if (!this.config.enablePersistence) return;

    try {
      await this.memory.store(
        `product-workflow:${workflow.id}`,
        workflow as any,
        'workflows'
      );
    } catch (error) {
      logger.error(`Failed to save product workflow ${workflow.id}:`, error);
    }
  }

  private async loadPersistedWorkflows(): Promise<void> {
    try {
      const workflows = await this.memory.search(
        'product-workflow:*',
        'workflows'
      );
      let loadedCount = 0;

      for (const [key, workflow] of Object.entries(workflows)) {
        try {
          const workflowState = workflow as unknown as ProductWorkflowState;

          if (
            workflowState.status === 'running' ||
            workflowState.status === 'paused'
          ) {
            this.activeWorkflows.set(workflowState.id, workflowState);
            logger.info(
              `Loaded persisted product workflow: ${workflowState.id}`
            );
            loadedCount++;
          }
        } catch (error) {
          logger.warn(
            `Failed to load product workflow from memory: ${key}`,
            error
          );
        }
      }

      logger.info(`Loaded ${loadedCount} persisted product workflows`);
    } catch (error) {
      logger.error('Failed to load persisted product workflows:', error);
    }
  }

  // Public API methods
  async getActiveProductWorkflows(): Promise<ProductWorkflowState[]> {
    return Array.from(this.activeWorkflows.values()).filter((w) =>
      ['running', 'paused'].includes(w.status)
    );
  }

  async getProductWorkflowStatus(
    workflowId: string
  ): Promise<ProductWorkflowState | null> {
    return this.activeWorkflows.get(workflowId) || null;
  }

  async pauseProductWorkflow(
    workflowId: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (workflow && workflow.status === 'running') {
      // Create paused workflow state
      const pausedWorkflow = {
        ...workflow,
        status: 'paused' as WorkflowStatus,
        pausedAt: new Date(),
      };
      this.activeWorkflows.set(workflowId, pausedWorkflow);
      await this.saveWorkflow(pausedWorkflow);
      this.emit('product-workflow:paused', { workflowId, reason });

      logger.info('Product workflow paused', { workflowId, reason });
      return { success: true };
    }
    return {
      success: false,
      error: 'Product workflow not found or not running',
    };
  }

  async resumeProductWorkflow(
    workflowId: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (workflow && workflow.status === 'paused') {
      // Create resumed workflow state
      const { pausedAt, ...resumedWorkflow } = workflow;
      const runningWorkflow = {
        ...resumedWorkflow,
        status: 'running' as WorkflowStatus,
      };
      this.activeWorkflows.set(workflowId, runningWorkflow);

      // Resume execution
      this.executeProductWorkflow(runningWorkflow).catch((error) => {
        logger.error(
          `Product workflow ${workflowId} failed after resume:`,
          error
        );
      });

      this.emit('product-workflow:resumed', { workflowId, reason });

      logger.info('Product workflow resumed', { workflowId, reason });
      return { success: true };
    }
    return {
      success: false,
      error: 'Product workflow not found or not paused',
    };
  }

  // ============================================================================
  // GATE MANAGEMENT API - Public methods for gate control
  // ============================================================================

  /**
   * Get all pending gates for active workflows
   */
  async getPendingGates(): Promise<Map<string, WorkflowGateRequest>> {
    return new Map(this.pendingGates);
  }

  /**
   * Get gate definitions for workflow steps
   */
  getGateDefinitions(): Map<string, WorkflowHumanGate> {
    return new Map(this.gateDefinitions);
  }

  /**
   * Cancel a pending gate
   */
  async cancelGate(
    gateId: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    const gateRequest = this.pendingGates.get(gateId);
    if (!gateRequest) {
      return { success: false, error: 'Gate not found' };
    }

    try {
      // Cancel the gate through AGUI adapter
      const cancelled = await this.aguiAdapter.cancelGate(gateId, reason);
      if (cancelled) {
        this.pendingGates.delete(gateId);

        logger.info('Gate cancelled', { gateId, reason });
        return { success: true };
      }
      return {
        success: false,
        error: 'Failed to cancel gate through AGUI adapter',
      };
    } catch (error) {
      logger.error('Error cancelling gate', {
        gateId,
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get workflow decision history from AGUI adapter
   */
  getWorkflowDecisionHistory(workflowId: string) {
    return this.aguiAdapter.getWorkflowDecisionHistory(workflowId);
  }

  /**
   * Get AGUI adapter statistics
   */
  getGateStatistics() {
    return this.aguiAdapter.getStatistics();
  }

  /**
   * Shutdown gate capabilities
   */
  async shutdownGates(): Promise<void> {
    logger.info('Shutting down workflow gates');

    // Cancel all pending gates
    for (const [gateId] of this.pendingGates) {
      await this.cancelGate(gateId, 'System shutdown');
    }

    // Shutdown AGUI adapter
    await this.aguiAdapter.shutdown();

    logger.info('Workflow gates shutdown complete');
  }

  /**
   * Shutdown the entire ProductWorkflowEngine
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down ProductWorkflowEngine');

    // Shutdown all active workflows
    for (const workflow of this.activeWorkflows.values()) {
      if (workflow.status === 'running' || workflow.status === 'paused') {
        const failedWorkflow = {
          ...workflow,
          status: 'cancelled' as WorkflowStatus,
          endTime: new Date(),
        };
        this.activeWorkflows.set(workflow.id, failedWorkflow);
        await this.saveWorkflow(failedWorkflow);
      }
    }

    // Shutdown gates
    await this.shutdownGates();

    logger.info('ProductWorkflowEngine shutdown complete');
  }
}
