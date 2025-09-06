/**
 * @fileoverview Coordination Orchestrator - Lightweight coordination layer
 * 
 * Simple orchestrator that coordinates existing package functionality for
 * SAFe 6.0, TaskMaster, Teamwork, Kanban, AGUI, and SPARC processes.
 * 
 * @author Claude Code Zen Team
 * @version 1.0.0
 */

import {
  EventBus,
  getLogger,
  ok,
  err,
  Result
} from '@claude-zen/foundation';

import {
  generateUUID,
  now,
  type UUID,
  type Timestamp
} from '@claude-zen/foundation/types';

import type { Logger } from '@claude-zen/foundation/core';
// Unified event system: all coordination events now sourced from foundation

// Temporary type definitions for development
type EventModule = any;
type CorrelationContext = { correlationId: UUID; metadata: Record<string, unknown> };
type BrainSafeWorkflowSupportEvent = any;
type BrainSparcPhaseReadyEvent = any;
type BrainExistingProjectWorkflowRequestEvent = any;
type DocumentIntelligenceImportCompleteEvent = any;
type DocumentIntelligenceImportIntegrationReadyEvent = any;
type DocumentIntelligenceImportErrorEscalatedEvent = any;
type CoordinationWorkflowApprovedEvent = any;
type CoordinationImportApprovedEvent = any;
type CoordinationImportContextProvidedEvent = any;

// Temporary helper functions
function createCoordinationEventModule(_id: string, _version: string): EventModule {
  return {
    initialize: async () => {},
    on: (_event: string, _handler: Function) => {},
    emit: (_event: string, _data: any, _context?: CorrelationContext) => {},
    createCorrelation: (_type: string) => ({ correlationId: generateUUID(), metadata: {} })
  };
}

import type {
  AgentId,
  AgentState,
  CoordinationConfig,
  CoordinationTask
} from './coordination-interfaces.js';

// =============================================================================
// WORKFLOW CONTEXT INTERFACES
// =============================================================================

/**
 * Context for tracking active coordination workflows
 */
interface WorkflowContext {
  workflowId: UUID;
  workflowType: 'brain-coordination' | 'document-intelligence-coordination' | 'external-import' | 'safe-integration';
  correlationId: UUID;
  initiatedBy: string;
  targetServices: string[];
  currentPhase: string;
  startTime: Timestamp;
  deadline?: Timestamp;
  status: 'initiated' | 'in-progress' | 'approval-pending' | 'completed' | 'failed';
  metadata: Record<string, unknown>;
  stepResults: Record<string, unknown>;
}

/**
 * Lightweight coordination orchestrator that connects existing package functionality.
 * Acts as a coordination layer rather than reimplementing business logic.
 */
export class CoordinationOrchestrator {
  private readonly logger: Logger;
  private readonly eventBus: EventBus;
  private readonly eventModule: EventModule;
  
  // Simple state tracking
  private readonly registeredAgents = new Set<string>();
  private readonly activeTasks = new Map<UUID, CoordinationTask>();
  
  // Unified event system integration
  private readonly activeWorkflows = new Map<UUID, WorkflowContext>();
  
  private isInitialized = false;

  constructor(_config: CoordinationConfig, eventBus?: EventBus) {
    this.logger = getLogger('coordination-orchestrator');
    this.eventBus = eventBus ?? EventBus.getInstance();
    
    // Create unified event module for coordination
    this.eventModule = createCoordinationEventModule(
      'coordination-orchestrator',
      '1.0.0'
    );

    this.logger.info('Coordination Orchestrator created with unified event contracts integration');
  }

  /**
   * Initialize the coordination orchestrator.
   */
  public async initialize(): Promise<Result<void, Error>> {
    if (this.isInitialized) {
      return ok();
    }

    try {
      // Initialize unified event module
      await this.eventModule.initialize();
      
      this.setupEventListeners();
      this.setupUnifiedEventHandlers();
      this.isInitialized = true;
      
      this.logger.info('Coordination Orchestrator initialized with unified event contracts');
      return ok();
    } catch (error) {
      return err(new Error(`Initialization failed: ${error}`));
    }
  }

  /**
   * Register an agent for coordination.
   */
  public async registerAgent(agentState: AgentState): Promise<Result<void, Error>> {
    try {
      const agentKey = `${agentState.agentId.swarmId}:${agentState.agentId.id}`;
      this.registeredAgents.add(agentKey);

      // Emit event for other packages to handle
      this.eventBus.emit('coordination:agent-registered', {
        agentState,
        initiator: agentState.agentId,
        timestamp: now(),
        correlationId: generateUUID()
      });

      this.logger.info('Agent registered for coordination', { agentId: agentState.agentId });
      return ok();
    } catch (error) {
      return err(new Error(`Agent registration failed: ${error}`));
    }
  }

  /**
   * Submit a coordination task.
   */
  public async submitTask(task: CoordinationTask): Promise<Result<void, Error>> {
    try {
      this.activeTasks.set(task.taskId, task);

      // Emit event for package-specific handlers
      this.eventBus.emit('coordination:task-submitted', {
        task,
        initiator: this.getSystemAgent(),
        timestamp: now(),
        correlationId: generateUUID()
      });

      this.logger.info('Task submitted for coordination', { 
        taskId: task.taskId,
        type: task.type,
        priority: task.priority
      });
      return ok();
    } catch (error) {
      return err(new Error(`Task submission failed: ${error}`));
    }
  }

  /**
   * Get coordination status and metrics.
   */
  public getStatus(): {
    registeredAgents: number;
    activeTasks: number;
  } {
    return {
      registeredAgents: this.registeredAgents.size,
      activeTasks: this.activeTasks.size
    };
  }

  /**
   * Coordinate SAFe 6.0 PI Planning (delegates to SAFe package).
   */
  public async coordinatePIPlanning(piId: UUID): Promise<Result<void, Error>> {
    try {
      this.eventBus.emit('safe:pi-planning-requested', {
        piId,
        initiator: this.getSystemAgent(),
        timestamp: now(),
        correlationId: generateUUID()
      });

      this.logger.info('PI Planning coordination requested', { piId });
      return ok();
    } catch (error) {
      return err(new Error(`PI Planning coordination failed: ${error}`));
    }
  }

  /**
   * Coordinate TaskMaster approval (delegates to TaskMaster package).
   */
  public async coordinateApproval(approvalId: UUID): Promise<Result<void, Error>> {
    try {
      this.eventBus.emit('taskmaster:approval-requested', {
        approvalId,
        initiator: this.getSystemAgent(),
        timestamp: now(),
        correlationId: generateUUID()
      });

      this.logger.info('TaskMaster approval coordination requested', { approvalId });
      return ok();
    } catch (error) {
      return err(new Error(`Approval coordination failed: ${error}`));
    }
  }

  /**
   * Coordinate Teamwork collaboration (delegates to Teamwork package).
   */
  public async coordinateTeamwork(sessionId: UUID): Promise<Result<void, Error>> {
    try {
      this.eventBus.emit('teamwork:collaboration-requested', {
        sessionId,
        initiator: this.getSystemAgent(),
        timestamp: now(),
        correlationId: generateUUID()
      });

      this.logger.info('Teamwork coordination requested', { sessionId });
      return ok();
    } catch (error) {
      return err(new Error(`Teamwork coordination failed: ${error}`));
    }
  }

  /**
   * Coordinate Kanban flow optimization (delegates to Kanban package).
   */
  public async coordinateKanban(boardId: string): Promise<Result<void, Error>> {
    try {
      this.eventBus.emit('kanban:optimization-requested', {
        boardId,
        initiator: this.getSystemAgent(),
        timestamp: now(),
        correlationId: generateUUID()
      });

      this.logger.info('Kanban coordination requested', { boardId });
      return ok();
    } catch (error) {
      return err(new Error(`Kanban coordination failed: ${error}`));
    }
  }

  /**
   * Coordinate SPARC process (delegates to SPARC package).
   */
  public async coordinateSPARC(projectId: UUID, phase: string): Promise<Result<void, Error>> {
    try {
      this.eventBus.emit('sparc:phase-coordination-requested', {
        projectId,
        phase,
        initiator: this.getSystemAgent(),
        timestamp: now(),
        correlationId: generateUUID()
      });

      this.logger.info('SPARC coordination requested', { projectId, phase });
      return ok();
    } catch (error) {
      return err(new Error(`SPARC coordination failed: ${error}`));
    }
  }

  /**
   * Setup unified event handlers for brain and document intelligence coordination
   */
  private setupUnifiedEventHandlers(): void {
    // =============================================================================
    // BRAIN → COORDINATION EVENT HANDLERS
    // =============================================================================
    
    // Handle brain SAFe workflow support requests
    this.eventModule.on('brain:coordination:safe-workflow-support', async (event: BrainSafeWorkflowSupportEvent) => {
      await this.handleBrainSafeWorkflowSupport(event);
    });
    
    // Handle brain SPARC phase readiness notifications
    this.eventModule.on('brain:coordination:sparc-phase-ready', async (event: BrainSparcPhaseReadyEvent) => {
      await this.handleBrainSparcPhaseReady(event);
    });
    
    // Handle brain existing project workflow requests
    this.eventModule.on('brain:coordination:existing-project-workflow-request', async (event: BrainExistingProjectWorkflowRequestEvent) => {
      await this.handleBrainExistingProjectWorkflow(event);
    });
    
    // =============================================================================
    // DOCUMENT INTELLIGENCE → COORDINATION EVENT HANDLERS
    // =============================================================================
    
    // Handle document intelligence import completion
    this.eventModule.on('document-intelligence:coordination:import-complete', async (event: DocumentIntelligenceImportCompleteEvent) => {
      await this.handleDocumentImportComplete(event);
    });
    
    // Handle document intelligence integration readiness
    this.eventModule.on('document-intelligence:coordination:integration-ready', async (event: DocumentIntelligenceImportIntegrationReadyEvent) => {
      await this.handleDocumentIntegrationReady(event);
    });
    
    // Handle document intelligence import errors
    this.eventModule.on('document-intelligence:coordination:import-error-escalated', async (event: DocumentIntelligenceImportErrorEscalatedEvent) => {
      await this.handleDocumentImportError(event);
    });
    
    this.logger.info('Unified event handlers configured for brain and document intelligence coordination');
  }
  
  // =============================================================================
  // BRAIN COORDINATION EVENT HANDLERS
  // =============================================================================
  
  /**
   * Handle brain SAFe workflow support request
   */
  private async handleBrainSafeWorkflowSupport(event: BrainSafeWorkflowSupportEvent): Promise<void> {
    this.logger.info('Processing brain SAFe workflow support request', {
      workflowType: event.workflowType,
      documentId: event.documentId,
      priority: event.priority
    });
    
    const correlationContext = this.eventModule.createCorrelation('brain-safe-workflow');
    
    const workflowContext: WorkflowContext = {
      workflowId: generateUUID(),
      workflowType: 'brain-coordination',
      correlationId: correlationContext.correlationId,
      initiatedBy: 'brain',
      targetServices: ['coordination', 'safe', 'sparc'],
      currentPhase: event.sparcPhase,
      startTime: now(),
      status: event.approvalRequired ? 'approval-pending' : 'in-progress',
      metadata: {
        documentId: event.documentId,
        workflowType: event.workflowType,
        safeArtifacts: event.safeArtifacts,
        priority: event.priority
      },
      stepResults: {}
    };
    
    this.activeWorkflows.set(workflowContext.workflowId, workflowContext);
    
    if (event.approvalRequired) {
      // Request approval via TaskMaster
      await this.requestWorkflowApproval(workflowContext, event);
    } else {
      // Process immediately
      await this.processSafeWorkflowSupport(workflowContext, event, correlationContext);
    }
  }
  
  /**
   * Handle brain SPARC phase readiness notification
   */
  private async handleBrainSparcPhaseReady(event: BrainSparcPhaseReadyEvent): Promise<void> {
    this.logger.info('Processing brain SPARC phase readiness', {
      projectId: event.projectId,
      currentPhase: event.currentPhase,
      nextPhase: event.nextPhase
    });
    
    const correlationContext = this.eventModule.createCorrelation('brain-sparc-phase');
    
    // Validate quality gates
    if (!event.qualityGates.passed) {
      this.logger.warn('SPARC phase quality gates not passed', {
        projectId: event.projectId,
        criteria: event.qualityGates.criteria
      });
      
      // Emit quality gate failure notification
      this.eventModule.emit('coordination:brain:quality-gate-failed', {
        requestId: generateUUID(),
        timestamp: now(),
        originalRequestId: event.requestId,
        projectId: event.projectId,
        currentPhase: event.currentPhase,
        failedCriteria: event.qualityGates.criteria.filter(() => !event.qualityGates.passed),
        requiredActions: ['review-artifacts', 'update-quality-metrics']
      } as any, correlationContext);
      
      return;
    }
    
    // Process SPARC phase transition
    await this.processSparcPhaseTransition(event, correlationContext);
  }
  
  /**
   * Handle brain existing project workflow request
   */
  private async handleBrainExistingProjectWorkflow(event: BrainExistingProjectWorkflowRequestEvent): Promise<void> {
    this.logger.info('Processing brain existing project workflow request', {
      documentId: event.documentId,
      projectId: event.projectId,
      workflowType: event.workflowType
    });
    
    const correlationContext = this.eventModule.createCorrelation('brain-existing-project');
    
    // Create workflow context
    const workflowContext: WorkflowContext = {
      workflowId: generateUUID(),
      workflowType: 'brain-coordination',
      correlationId: correlationContext.correlationId,
      initiatedBy: 'brain',
      targetServices: ['coordination', 'document-intelligence'],
      currentPhase: 'initiation',
      startTime: now(),
      status: 'in-progress',
      metadata: {
        documentId: event.documentId,
        projectId: event.projectId,
        workflowType: event.workflowType,
        processingOptions: event.processingOptions,
        existingProjectRequirements: event.existingProjectRequirements
      },
      stepResults: {}
    };
    
    this.activeWorkflows.set(workflowContext.workflowId, workflowContext);
    
    // Process existing project workflow
    await this.processExistingProjectWorkflow(workflowContext, event, correlationContext);
  }
  
  // =============================================================================
  // DOCUMENT INTELLIGENCE COORDINATION EVENT HANDLERS
  // =============================================================================
  
  /**
   * Handle document intelligence import completion
   */
  private async handleDocumentImportComplete(event: DocumentIntelligenceImportCompleteEvent): Promise<void> {
    this.logger.info('Processing document intelligence import completion', {
      workflowId: event.workflowId,
      importWorkflowType: event.importWorkflowType,
      documentId: event.documentId
    });
    
    const correlationContext = this.eventModule.createCorrelation('document-import-complete');
    
    // Update workflow context if exists
    const existingWorkflow = Array.from(this.activeWorkflows.values())
    .find(wf => wf.metadata['documentId'] == (event as any)['documentId']);
    
    if (existingWorkflow) {
  existingWorkflow.stepResults['documentImportComplete'] = {
    importedArtifacts: event.importedArtifacts,
        importMetrics: event.importMetrics,
        nextIntegrationActions: event.nextIntegrationActions
      };
      existingWorkflow.currentPhase = 'integration-ready';
    }
    
    // Process integration with SAFe project
    await this.processDocumentIntegration(event, correlationContext);
  }
  
  /**
   * Handle document intelligence integration readiness
   */
  private async handleDocumentIntegrationReady(event: DocumentIntelligenceImportIntegrationReadyEvent): Promise<void> {
    this.logger.info('Processing document intelligence integration readiness', {
      importId: event.importId,
      targetProjectId: event.targetProjectId,
      integrationMethod: event.integrationData.integrationMethod
    });
    
    const correlationContext = this.eventModule.createCorrelation('document-integration-ready');
    
    // Request integration approval if required
    if (event.integrationApprovalRequired) {
      await this.requestIntegrationApproval(event, correlationContext);
    } else {
      // Process integration immediately
      await this.processIntegrationWithSafeProject(event, correlationContext);
    }
  }
  
  /**
   * Handle document intelligence import error escalation
   */
  private async handleDocumentImportError(event: DocumentIntelligenceImportErrorEscalatedEvent): Promise<void> {
    this.logger.error('Processing document intelligence import error escalation', {
      workflowId: event.workflowId,
      errorType: event.importErrorType,
      severity: event.severity
    });
    
    const correlationContext = this.eventModule.createCorrelation('document-import-error');
    
    // Update workflow status
    const workflow = Array.from(this.activeWorkflows.values())
  .find(wf => wf.metadata['documentId'] === event.documentId);
    
    if (workflow) {
      workflow.status = 'failed';
  workflow.stepResults['importError'] = {
    errorType: event.importErrorType,
        errorDetails: event.errorDetails,
        suggestedActions: event.suggestedActions
      };
    }
    
    // Handle error escalation based on severity
    await this.handleImportErrorEscalation(event, correlationContext);
  }

  // =============================================================================
  // WORKFLOW PROCESSING METHODS
  // =============================================================================
  
  /**
   * Request workflow approval via TaskMaster
   */
  private async requestWorkflowApproval(workflowContext: WorkflowContext, event: any): Promise<void> {
    const approvalRequest = {
      requestId: generateUUID(),
      timestamp: now(),
      workflowId: workflowContext.workflowId,
      workflowType: workflowContext.workflowType,
      description: `Workflow approval required for ${workflowContext.workflowType}`,
      priority: event.priority || 'medium',
      metadata: workflowContext.metadata,
      approvalType: 'taskmaster-approval'
    };
    
    this.eventBus.emit('taskmaster:approval-requested', approvalRequest);
    
    this.logger.info('Workflow approval requested', {
      workflowId: workflowContext.workflowId,
      approvalRequestId: approvalRequest.requestId
    });
  }
  
  /**
   * Process SAFe workflow support
   */
  private async processSafeWorkflowSupport(
    workflowContext: WorkflowContext, 
    event: BrainSafeWorkflowSupportEvent, 
    correlationContext: CorrelationContext
  ): Promise<void> {
    // Emit workflow approved event to brain
    this.eventModule.emit('coordination:brain:workflow-approved', {
      requestId: generateUUID(),
      timestamp: now(),
      originalRequestId: event.requestId,
      approvalId: workflowContext.workflowId,
      approvedBy: 'coordination-orchestrator',
      approvalType: 'automatic',
      allocatedResources: {
        priority: event.priority,
        timeAllocation: 3600000, // 1 hour default
        computeResources: { type: 'standard' }
      },
      constraints: {
        deadlines: [{
          phase: event.sparcPhase,
          deadline: new Date(Date.now() + 86400000).toISOString() // 24 hours
        }],
        qualityRequirements: {},
        complianceRequirements: ['safe-compliance', 'sparc-compliance']
      }
    } as CoordinationWorkflowApprovedEvent, correlationContext);
    
    workflowContext.status = 'completed';
  workflowContext.stepResults['workflowApproved'] = true;
  }
  
  /**
   * Process SPARC phase transition
   */
  private async processSparcPhaseTransition(event: BrainSparcPhaseReadyEvent, correlationContext: CorrelationContext): Promise<void> {
    // Emit SPARC phase coordination request
    this.eventBus.emit('sparc:phase-coordination-requested', {
      projectId: event.projectId,
      currentPhase: event.currentPhase,
      nextPhase: event.nextPhase,
      artifacts: event.artifacts,
      qualityGates: event.qualityGates,
      initiator: this.getSystemAgent(),
      timestamp: now(),
      correlationId: correlationContext.correlationId
    });
    
    // If TaskMaster approval required, emit approval request
    if (event.taskMasterApprovalRequired) {
      this.eventBus.emit('taskmaster:approval-requested', {
        requestId: generateUUID(),
        timestamp: now(),
        projectId: event.projectId,
        approvalType: 'sparc-phase-transition',
        description: `SPARC phase transition: ${event.currentPhase} → ${event.nextPhase}`,
        priority: 'high',
        metadata: {
          artifacts: event.artifacts,
          qualityGates: event.qualityGates
        }
      });
    }
  }
  
  /**
   * Process existing project workflow
   */
  private async processExistingProjectWorkflow(
    workflowContext: WorkflowContext,
    event: BrainExistingProjectWorkflowRequestEvent,
    correlationContext: CorrelationContext
  ): Promise<void> {
    // Coordinate with document intelligence if needed
    if (event.workflowType === 'content-analysis' || event.workflowType === 'requirements-validation') {
      // Emit import approval to document intelligence
      this.eventModule.emit('coordination:document-intelligence:import-approved', {
        requestId: generateUUID(),
        timestamp: now(),
        documentId: event.documentId,
        importWorkflowType: 'content-extraction',
        importApprovalId: workflowContext.workflowId,
        approvedBy: 'coordination-orchestrator',
        targetProjectId: event.projectId,
        importParameters: {
          priority: event.processingOptions.qualityLevel === 'premium' ? 'high' : 'medium',
          extractionQuality: event.processingOptions.qualityLevel,
          aiAssistanceLevel: event.processingOptions.aiAssisted ? 'advanced' : 'standard',
          integrationValidation: event.existingProjectRequirements.projectIntegration,
          projectImpactAssessment: true
        },
        importResourceAllocation: {
          maxImportTime: event.processingOptions.timeout,
          aiTokenBudget: event.processingOptions.qualityLevel === 'premium' ? 10000 : 5000,
          humanReviewRequired: event.processingOptions.qualityLevel === 'premium',
          integrationReviewRequired: event.existingProjectRequirements.sparcCompliance,
          computePriority: 5
        },
        importConstraints: {
          integrationDeadlines: [],
          qualityGates: {},
          projectAlignmentRequirements: event.existingProjectRequirements.maintainExistingStructure ? 
            ['maintain-structure', 'preserve-compliance'] : []
        }
      } as CoordinationImportApprovedEvent, correlationContext);
    }
    
    workflowContext.status = 'completed';
  workflowContext.stepResults['existingProjectWorkflowProcessed'] = true;
  }
  
  /**
   * Process document integration
   */
  private async processDocumentIntegration(
    event: DocumentIntelligenceImportCompleteEvent,
    correlationContext: CorrelationContext
  ): Promise<void> {
    // Emit context for integration if needed
    this.eventModule.emit('coordination:document-intelligence:import-context-provided', {
      requestId: generateUUID(),
      timestamp: now(),
      documentId: event.documentId,
      importWorkflowId: event.workflowId,
      targetProjectId: event.importedArtifacts[0]?.targetProjectId || '',
      contextType: 'integration-stakeholder',
      additionalContext: {
        stakeholderContext: {
          primaryStakeholders: ['project-manager', 'tech-lead'],
          decisionMakers: ['product-owner'],
          influencers: ['architects', 'developers'],
          communicationPreferences: {
            'project-manager': 'email',
            'tech-lead': 'slack',
            'product-owner': 'dashboard'
          }
        }
      },
      integrationContextPriority: 'recommended'
    } as CoordinationImportContextProvidedEvent, correlationContext);
    
    this.logger.info('Document integration context provided', {
      documentId: event.documentId,
      workflowId: event.workflowId
    });
  }
  
  /**
   * Request integration approval
   */
  private async requestIntegrationApproval(
    event: DocumentIntelligenceImportIntegrationReadyEvent,
    _correlationContext: CorrelationContext
  ): Promise<void> {
    const approvalRequest = {
      requestId: generateUUID(),
      timestamp: now(),
      importId: event.importId,
      targetProjectId: event.targetProjectId,
      approvalType: 'integration-approval',
      description: `Integration approval required: ${event.integrationData.integrationMethod}`,
      priority: event.integrationMetadata.businessImpact,
      metadata: {
        integrationData: event.integrationData,
        integrationMetadata: event.integrationMetadata,
        targetArtifact: event.integrationData.targetArtifactType
      }
    };
    
    this.eventBus.emit('taskmaster:approval-requested', approvalRequest);
    
    this.logger.info('Integration approval requested', {
      importId: event.importId,
      targetProjectId: event.targetProjectId,
      approvalRequestId: approvalRequest.requestId
    });
  }
  
  /**
   * Process integration with SAFe project
   */
  private async processIntegrationWithSafeProject(
    event: DocumentIntelligenceImportIntegrationReadyEvent,
    correlationContext: CorrelationContext
  ): Promise<void> {
    // Emit SAFe integration request
    this.eventBus.emit('safe:integration-requested', {
      importId: event.importId,
      sourceDocumentId: event.sourceDocumentId,
      targetProjectId: event.targetProjectId,
      integrationData: event.integrationData,
      integrationMetadata: event.integrationMetadata,
      initiator: this.getSystemAgent(),
      timestamp: now(),
      correlationId: correlationContext.correlationId
    });
    
    this.logger.info('SAFe integration requested', {
      importId: event.importId,
      targetProjectId: event.targetProjectId,
      integrationMethod: event.integrationData.integrationMethod
    });
  }
  
  /**
   * Handle import error escalation
   */
  private async handleImportErrorEscalation(
    event: DocumentIntelligenceImportErrorEscalatedEvent,
    correlationContext: CorrelationContext
  ): Promise<void> {
    // Emit error escalation based on severity
    if (event.severity === 'critical' || event.severity === 'high') {
      // Escalate to human review
      this.eventBus.emit('human-review:escalation-required', {
        workflowId: event.workflowId,
        documentId: event.documentId,
        errorType: event.importErrorType,
        errorDetails: event.errorDetails,
        severity: event.severity,
        suggestedActions: event.suggestedActions,
        escalationReason: 'import-failure',
        timestamp: now(),
        correlationId: correlationContext.correlationId
      });
    }
    
    // Notify stakeholders
    if (event.importImpact.stakeholdersToNotify.length > 0) {
      this.eventBus.emit('notification:stakeholder-alert', {
        alertType: 'import-error',
        severity: event.severity,
        affectedImports: event.importImpact.affectedImports,
        stakeholders: event.importImpact.stakeholdersToNotify,
        message: `Import error: ${event.errorDetails.message}`,
        timestamp: now(),
        correlationId: correlationContext.correlationId
      });
    }
  }

  // =============================================================================
  // EXTERNAL DOCUMENT IMPORT WORKFLOW ORCHESTRATION
  // =============================================================================
  
  /**
   * Orchestrate complete external document import workflow
   */
  public async orchestrateExternalDocumentImport(request: {
    documentId: string;
    targetProjectId: string;
    documentData: any;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<Result<UUID, Error>> {
    try {
      const correlationContext = this.eventModule.createCorrelation('external-document-import');
      
      const workflowContext: WorkflowContext = {
        workflowId: generateUUID(),
        workflowType: 'external-import',
        correlationId: correlationContext.correlationId,
        initiatedBy: 'coordination-orchestrator',
        targetServices: ['brain', 'document-intelligence', 'safe'],
        currentPhase: 'initiation',
        startTime: now(),
        status: 'in-progress',
        metadata: {
          documentId: request.documentId,
          targetProjectId: request.targetProjectId,
          priority: request.priority,
          documentData: request.documentData
        },
        stepResults: {}
      };
      
      this.activeWorkflows.set(workflowContext.workflowId, workflowContext);
      
      // Use global workflow orchestrator for complex orchestration
      this.eventBus.emit('orchestrator:execute-workflow', {
        requestId: workflowContext.workflowId,
        timestamp: now(),
        patternId: 'external-document-import',
        workflowData: {
          documentId: request.documentId,
          targetProjectId: request.targetProjectId,
          documentData: request.documentData,
          priority: request.priority
        }
      });
      
      this.logger.info('External document import workflow orchestrated', {
        workflowId: workflowContext.workflowId,
        documentId: request.documentId,
        targetProjectId: request.targetProjectId
      });
      
      return ok(workflowContext.workflowId);
    } catch (error) {
      return err(new Error(`External document import orchestration failed: ${error}`));
    }
  }

  // =============================================================================
  // PUBLIC WORKFLOW STATUS METHODS
  // =============================================================================
  
  /**
   * Get active workflow contexts
   */
  public getActiveWorkflows(): WorkflowContext[] {
    return Array.from(this.activeWorkflows.values());
  }
  
  /**
   * Get workflow context by ID
   */
  public getWorkflowContext(workflowId: UUID): WorkflowContext | undefined {
    return this.activeWorkflows.get(workflowId);
  }
  
  /**
   * Get coordination status with workflow information
   */
  public getCoordinationStatus(): {
    registeredAgents: number;
    activeTasks: number;
    activeWorkflows: number;
    completedWorkflows: number;
    failedWorkflows: number;
  } {
    const workflows = Array.from(this.activeWorkflows.values());
    return {
      registeredAgents: this.registeredAgents.size,
      activeTasks: this.activeTasks.size,
      activeWorkflows: workflows.filter(wf => wf.status === 'in-progress' || wf.status === 'approval-pending').length,
      completedWorkflows: workflows.filter(wf => wf.status === 'completed').length,
      failedWorkflows: workflows.filter(wf => wf.status === 'failed').length
    };
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private setupEventListeners(): void {
    // Listen for coordination events from other packages
    this.eventBus.on('coordination:*', (...args: unknown[]) => {
      const event = args[0];
      this.logger.debug('Coordination event received', { event });
    });

    // Listen for package-specific events that need coordination
    this.eventBus.on('safe:*', (...args: unknown[]) => {
      const event = args[0];
      this.logger.debug('SAFe event received for coordination', { event });
    });

    this.eventBus.on('taskmaster:*', (...args: unknown[]) => {
      const event = args[0];
      this.logger.debug('TaskMaster event received for coordination', { event });
    });

    this.eventBus.on('teamwork:*', (...args: unknown[]) => {
      const event = args[0];
      this.logger.debug('Teamwork event received for coordination', { event });
    });

    this.eventBus.on('kanban:*', (...args: unknown[]) => {
      const event = args[0];
      this.logger.debug('Kanban event received for coordination', { event });
    });

    this.eventBus.on('sparc:*', (...args: unknown[]) => {
      const event = args[0];
      this.logger.debug('SPARC event received for coordination', { event });
    });
  }

  private getSystemAgent(): AgentId {
    return {
      id: 'coordination-orchestrator',
      swarmId: 'system',
      type: 'coordinator',
      instance: 1
    };
  }
}