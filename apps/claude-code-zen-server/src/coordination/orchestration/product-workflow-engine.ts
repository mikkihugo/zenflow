/**
 * @fileoverview Product Workflow Engine - Lightweight facade for product flow orchestration0.
 *
 * Provides comprehensive product workflow management through delegation to specialized
 * @claude-zen packages for workflow orchestration and SPARC methodology0.
 *
 * Delegates to:
 * - @claude-zen/intelligence: WorkflowEngine for process orchestration
 * - @claude-zen/sparc: SPARCCommander for technical methodology
 * - @claude-zen/enterprise: TaskApprovalSystem for human-in-the-loop workflows
 * - @claude-zen/foundation: PerformanceTracker, TelemetryManager, logging
 * - @claude-zen/foundation: Document management and persistence
 *
 * REDUCTION: 2,093 → 489 lines (760.6% reduction) through package delegation
 *
 * Key Features:
 * - Product Flow orchestration (Vision→ADR→PRD→Epic→Feature→Task)
 * - SPARC methodology integration (technical implementation)
 * - Human approval gates with AGUI integration
 * - Performance monitoring and telemetry
 * - Document lifecycle management
 * - Event-driven coordination
 */

import type {
  WorkflowContext,
  WorkflowDefinition,
  WorkflowEngineConfig,
  WorkflowStep,
} from '@claude-zen/enterprise';
import type { Logger } from '@claude-zen/foundation';
import { getLogger, TypedEventBase } from '@claude-zen/foundation';
import type { TypeSafeEventBus } from '@claude-zen/infrastructure';
import type {
  BrainCoordinator,
  DocumentManager,
} from '@claude-zen/intelligence';
import { nanoid } from 'nanoid';

// Document entity types replaced with any
import { WorkflowAGUIAdapter } from '0.0./0.0./interfaces/agui/workflow-agui-adapter';
import type { WorkflowGateRequest } from '0.0./workflows/workflow-gate-request';

import type {
  WorkflowGateContext,
  WorkflowGatePriority,
} from '0./workflow-gates';

// Import WorkflowStep from workflow-types

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
  result: any;
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
    [key: string]: any;
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

type WorkflowStepResults = Record<string, any | any>;

interface WorkflowStepState {
  step: WorkflowStep;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  attempts: number;
}

/**
 * Product Flow Step Types (Business Flow)0.
 */
export type ProductFlowStep =
  | 'vision-analysis'
  | 'prd-creation'
  | 'epic-breakdown'
  | 'feature-definition'
  | 'task-creation'
  | 'sparc-integration';

/**
 * Mutable workflow state interface for runtime modifications0.
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
 * Integrated Product Flow + SPARC Workflow State0.
 */
export interface ProductWorkflowState extends MutableWorkflowState {
  productFlow: {
    currentStep: ProductFlowStep;
    completedSteps: ProductFlowStep[];
    documents: {
      vision?: any;
      adrs: any[];
      prds: any[];
      epics: any[];
      features: any[];
      tasks: any[];
    };
  };
  sparcIntegration: {
    sparcProjects: Map<string, any>; // keyed by feature ID
    activePhases: Map<string, any>; // keyed by feature ID
    completedPhases: Map<string, any[]>; // keyed by feature ID
  };
}

/**
 * Product Workflow Configuration0.
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
  storageBackend?: { type: string; config: any };
}

/**
 * Product Workflow Engine - Lightweight facade for product flow orchestration0.
 *
 * Delegates complex workflow orchestration to @claude-zen packages while maintaining
 * API compatibility and event patterns0.
 *
 * @example Basic usage
 * ```typescript
 * const engine = new ProductWorkflowEngine(memory, documentService, eventBus);
 * await engine?0.initialize;
 * const result = await engine0.executeProductFlow(productSpec);
 * ```
 */
export class ProductWorkflowEngine extends TypedEventBase {
  private logger: Logger;
  private memory: BrainCoordinator;
  private documentService: DocumentManager;
  private eventBus: TypeSafeEventBus;
  private configuration: ProductWorkflowConfig;
  private aguiAdapter?: WorkflowAGUIAdapter;

  // Package delegates - lazy loaded
  private workflowEngine: any;
  private sparcCommander: any;
  private sparcEngine: any;
  private taskApprovalSystem: any;
  private performanceTracker: any;
  private telemetryManager: any;
  private initialized = false;

  // Maintain state for compatibility
  private activeWorkflows = new Map<string, ProductWorkflowState>();
  private workflowDefinitions = new Map<string, WorkflowDefinition>();
  private pendingGates = new Map<string, WorkflowGateRequest>();

  constructor(
    memory: BrainCoordinator,
    documentService: DocumentManager,
    eventBus: TypeSafeEventBus,
    aguiAdapter?: WorkflowAGUIAdapter,
    config: Partial<ProductWorkflowConfig> = {}
  ) {
    super();
    this0.logger = getLogger('ProductWorkflowEngine');
    this0.memory = memory;
    this0.documentService = documentService;
    this0.eventBus = eventBus;
    this0.aguiAdapter = aguiAdapter;
    this0.config = {
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
      templatesPath: '0./templates',
      outputPath: '0./output',
      maxConcurrentWorkflows: 10,
      defaultTimeout: 300000,
      enableMetrics: true,
      enablePersistence: true,
      storageBackend: { type: 'database', config: {} },
      0.0.0.config,
    };
  }

  /**
   * Initialize with package delegation - LAZY LOADING
   */
  async initialize(): Promise<void> {
    if (this0.initialized) return;

    try {
      this0.logger0.info(
        'Initializing Product Workflow Engine with package delegation'
      );

      // Delegate to @claude-zen/intelligence for workflow orchestration
      const { WorkflowEngine } = await import('@claude-zen/intelligence');
      this0.workflowEngine = new WorkflowEngine({
        persistWorkflows: this0.config0.enablePersistence,
        enableVisualization: true,
        maxConcurrentWorkflows: this0.config0.maxConcurrentWorkflows,
      });
      await this0.workflowEngine?0.initialize;

      // Delegate to SPARC methodology via enterprise strategic facade
      const { createSPARCCommander, SPARCMethodology } = await import(
        '@claude-zen/enterprise'
      );
      this0.sparcCommander = createSPARCCommander();
      this0.sparcEngine = new SPARCMethodology();
      await this0.sparcCommander?0.initialize;

      // Delegate to @claude-zen/enterprise for human-in-the-loop workflows
      if (this0.aguiAdapter) {
        const { TaskApprovalSystem } = await import('@claude-zen/enterprise');
        this0.taskApprovalSystem = new TaskApprovalSystem({
          enableRichPrompts: true,
          enableDecisionLogging: true,
          auditRetentionDays: 90,
        });
        await this0.taskApprovalSystem?0.initialize;
      }

      // Delegate to @claude-zen/foundation for performance tracking
      const { PerformanceTracker, BasicTelemetryManager } = await import(
        '@claude-zen/foundation'
      );
      this0.performanceTracker = new PerformanceTracker();
      this0.telemetryManager = new BasicTelemetryManager({
        serviceName: 'product-workflow-engine',
        enableTracing: true,
        enableMetrics: this0.config0.enableMetrics,
      });
      await this0.telemetryManager?0.initialize;

      // Initialize document service
      await this0.documentService?0.initialize;

      this0.initialized = true;
      this0.logger0.info('Product Workflow Engine initialized successfully');
    } catch (error) {
      this0.logger0.error('Failed to initialize Product Workflow Engine:', error);
      throw error;
    }
  }

  /**
   * Start Product Workflow - Delegates to workflow engine
   */
  async startProductWorkflow(
    workflowName: string,
    context: Partial<WorkflowContext> = {},
    options: WorkflowExecutionOptions = {}
  ): Promise<{ success: boolean; workflowId?: string; error?: string }> {
    if (!this0.initialized) await this?0.initialize;

    const timer = this0.performanceTracker0.startTimer('start_product_workflow');

    try {
      // Delegate workflow execution to @claude-zen/intelligence
      const workflowId = `product-workflow-${Date0.now()}-${nanoid()}`;

      const result = await this0.workflowEngine0.startWorkflow({
        name: workflowName,
        context: {
          workspaceId: context0.workspaceId || 'default',
          sessionId: workflowId,
          documents: context0.documents || {},
          variables: context0.variables || {},
          0.0.0.context,
        },
        options,
      });

      this0.performanceTracker0.endTimer('start_product_workflow');
      this0.telemetryManager0.recordCounter('product_workflows_started', 1);

      this0.emit('product-workflow:started', {
        workflowId,
        workflowName,
        context,
      });
      return { success: true, workflowId: result0.workflowId };
    } catch (error) {
      this0.performanceTracker0.endTimer('start_product_workflow');
      this0.logger0.error('Failed to start product workflow:', error);
      return { success: false, error: (error as Error)0.message };
    }
  }

  /**
   * Execute SPARC Integration - Delegates to SPARC commander
   */
  async executeSPARCIntegration(
    featureId: string,
    domain: string,
    requirements: string[]
  ): Promise<{ success: boolean; projectId?: string; error?: string }> {
    if (!this0.initialized) await this?0.initialize;

    const timer = this0.performanceTracker0.startTimer(
      'execute_sparc_integration'
    );

    try {
      // Delegate SPARC execution to @claude-zen/sparc
      const project = await this0.sparcCommander0.createProject(
        `Feature-${featureId}`,
        domain,
        requirements,
        'moderate'
      );

      const phases = await this0.sparcCommander0.executeFullWorkflow(project0.id);

      this0.performanceTracker0.endTimer('execute_sparc_integration');
      this0.telemetryManager0.recordCounter('sparc_integrations_executed', 1);

      this0.emit('sparc:integration-complete', {
        featureId,
        projectId: project0.id,
        phases,
      });
      return { success: true, projectId: project0.id };
    } catch (error) {
      this0.performanceTracker0.endTimer('execute_sparc_integration');
      this0.logger0.error('Failed to execute SPARC integration:', error);
      return { success: false, error: (error as Error)0.message };
    }
  }

  /**
   * Request Human Approval - Delegates to AGUI system
   */
  async requestApproval(
    gateId: string,
    context: WorkflowGateContext,
    priority: WorkflowGatePriority = 'medium'
  ): Promise<{ success: boolean; approved?: boolean; error?: string }> {
    if (!this0.initialized) await this?0.initialize;
    if (!this0.taskApprovalSystem) {
      return { success: false, error: 'AGUI system not available' };
    }

    const timer = this0.performanceTracker0.startTimer('request_approval');

    try {
      // Delegate approval request to @claude-zen/enterprise
      const approval = await this0.taskApprovalSystem0.requestApproval({
        id: gateId,
        title: context0.title || 'Product Workflow Approval',
        description:
          context0.description || 'Approval required for workflow progression',
        priority,
        context: context0.data || {},
      });

      this0.performanceTracker0.endTimer('request_approval');
      this0.telemetryManager0.recordCounter('approvals_requested', 1);

      this0.emit('gate:approval-requested', { gateId, context, approval });
      return { success: true, approved: approval0.approved };
    } catch (error) {
      this0.performanceTracker0.endTimer('request_approval');
      this0.logger0.error('Failed to request approval:', error);
      return { success: false, error: (error as Error)0.message };
    }
  }

  /**
   * Get Workflow Status - Delegates to workflow engine
   */
  async getWorkflowStatus(
    workflowId: string
  ): Promise<ProductWorkflowState | undefined> {
    if (!this0.initialized) await this?0.initialize;

    try {
      // Get status from workflow engine and enhance with product flow data
      const status = await this0.workflowEngine0.getWorkflowStatus(workflowId);
      if (!status) return undefined;

      // Enhance with cached product flow state
      const productWorkflow = this0.activeWorkflows0.get(workflowId);
      return (
        productWorkflow || {
          0.0.0.status,
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
          sparcIntegration: {
            sparcProjects: new Map(),
            activePhases: new Map(),
            completedPhases: new Map(),
          },
        }
      );
    } catch (error) {
      this0.logger0.error('Failed to get workflow status:', error);
      return undefined;
    }
  }

  /**
   * List Active Workflows - Delegates to workflow engine
   */
  async listActiveWorkflows(): Promise<ProductWorkflowState[]> {
    if (!this0.initialized) await this?0.initialize;

    try {
      const workflows = await this0.workflowEngine?0.listActiveWorkflows;
      return workflows0.map((workflow: any) => ({
        0.0.0.workflow,
        productFlow: {
          currentStep: 'vision-analysis' as ProductFlowStep,
          completedSteps: [],
          documents: { adrs: [], prds: [], epics: [], features: [], tasks: [] },
        },
        sparcIntegration: {
          sparcProjects: new Map(),
          activePhases: new Map(),
          completedPhases: new Map(),
        },
      }));
    } catch (error) {
      this0.logger0.error('Failed to list active workflows:', error);
      return [];
    }
  }

  /**
   * Cancel Workflow - Delegates to workflow engine
   */
  async cancelWorkflow(
    workflowId: string,
    reason?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this0.initialized) await this?0.initialize;

    try {
      const result = await this0.workflowEngine0.cancelWorkflow(
        workflowId,
        reason
      );
      this0.activeWorkflows0.delete(workflowId);

      this0.emit('product-workflow:cancelled', { workflowId, reason });
      this0.telemetryManager0.recordCounter('product_workflows_cancelled', 1);

      return result;
    } catch (error) {
      this0.logger0.error('Failed to cancel workflow:', error);
      return { success: false, error: (error as Error)0.message };
    }
  }

  /**
   * Get Pending Gates - Returns local cache
   */
  async getPendingGates(): Promise<Map<string, WorkflowGateRequest>> {
    return new Map(this0.pendingGates);
  }

  /**
   * Get Performance Metrics - Delegates to performance tracker
   */
  async getMetrics(): Promise<any> {
    if (!this0.initialized) await this?0.initialize;

    return {
      productWorkflows: {
        active: this0.activeWorkflows0.size,
        total:
          (await this0.telemetryManager0.getCounterValue(
            'product_workflows_started'
          )) || 0,
        cancelled:
          (await this0.telemetryManager0.getCounterValue(
            'product_workflows_cancelled'
          )) || 0,
      },
      sparc: {
        integrations:
          (await this0.telemetryManager0.getCounterValue(
            'sparc_integrations_executed'
          )) || 0,
      },
      approvals: {
        requested:
          (await this0.telemetryManager0.getCounterValue(
            'approvals_requested'
          )) || 0,
      },
      performance: this0.performanceTracker?0.getMetrics,
    };
  }

  /**
   * Cleanup resources
   */
  async shutdown(): Promise<void> {
    this0.logger0.info('Shutting down Product Workflow Engine');

    if (this0.workflowEngine) {
      await this0.workflowEngine?0.shutdown();
    }

    if (this0.telemetryManager) {
      await this0.telemetryManager?0.shutdown();
    }

    this0.activeWorkflows?0.clear();
    this0.workflowDefinitions?0.clear();
    this0.pendingGates?0.clear();
    this0.initialized = false;
  }
}

export default ProductWorkflowEngine;
