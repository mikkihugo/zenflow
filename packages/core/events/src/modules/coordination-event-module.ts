/**
 * @fileoverview Coordination Event Module Wrapper
 * 
 * Unified Coordination domain event module that bridges the existing coordination event module
 * with the new standardized event module patterns. Maintains backward compatibility
 * while providing enhanced functionality.
 * 
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 2.1.0
 */

// =============================================================================
// IMPORTS
// =============================================================================

import {
  EventBus,
  getLogger,
  generateUUID,
  recordMetric,
  withTrace,
  ok,
  err,
  Result
} from '@claude-zen/foundation';

import type { Logger } from '@claude-zen/foundation/core';
import type { UUID } from '@claude-zen/foundation/types';

import {
  EventModuleFactory,
  type CoordinationModuleConfig,
  type IEventModule
} from './event-module-factory.js';

import {
  type CorrelationContext
} from './base-event-module.js';

// Import event contracts from foundation (they were migrated there)
// Note: These types would need to be imported from foundation or redefined locally
// For now, using any types to allow compilation
type CoordinationBrainEventMap = {
  'coordination:brain:workflow-approved': any;
  'coordination:brain:priority-escalated': any;
  'coordination:brain:resource-allocated': any;
};

type CoordinationDocumentEventMap = {
  'coordination:document-intelligence:import-approved': any;
};

// =============================================================================
// COORDINATION EVENT MODULE WRAPPER TYPES
// =============================================================================

/**
 * Configuration for the unified Coordination Event Module
 */
export interface UnifiedCoordinationEventModuleConfig extends Partial<CoordinationModuleConfig> {
  /** Unique identifier for the module instance */
  moduleId: string;
  
  /** Optional human readable name override */
  moduleName?: string;
  
  /** Module version override */
  version?: string;
  
  /** Enable backward compatibility mode */
  enableLegacyCompatibility?: boolean;
  
  /** Enhanced TaskMaster integration features */
  enableEnhancedTaskMaster?: boolean;
  
  /** Enhanced resource allocation features */
  enableEnhancedResourceAllocation?: boolean;
  
  /** Custom coordination-specific metadata */
  coordinationMetadata?: Record<string, unknown>;
}

/**
 * Agent state for coordination registration
 */
export interface AgentState {
  agentId: string;
  agentType: string;
  capabilities: string[];
  status: 'active' | 'inactive' | 'busy' | 'maintenance';
  lastHeartbeat: number;
  metadata?: Record<string, unknown>;
}

/**
 * Coordination task definition
 */
export interface CoordinationTask {
  taskId: UUID;
  type: 'agent-assignment' | 'resource-allocation' | 'workflow-coordination' | 'health-check' | 'approval-request';
  priority: number;
  payload: any;
  target?: string;
  createdAt: number;
  deadline?: number;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'cancelled';
  assignedAgent?: string;
  attempts?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Document import orchestration request
 */
export interface DocumentImportOrchestrationRequest {
  documentId: string;
  targetProjectId: string;
  documentData: {
    type: string;
    title: string;
    content: string;
    metadata?: Record<string, unknown>;
  };
  priority: 'low' | 'medium' | 'high' | 'critical';
  importType?: 'external-vision' | 'external-prd' | 'external-requirements';
  targetSafeProject?: {
    portfolioId: string;
    programId: string;
    piId?: string;
  };
  approvalRequired?: boolean;
  constraints?: {
    maxImportTime?: number;
    qualityThreshold?: number;
    aiTokenBudget?: number;
  };
}

/**
 * Resource allocation request
 */
export interface ResourceAllocationRequest {
  requestId?: string;
  resourceType: 'computational' | 'storage' | 'network' | 'ai-tokens' | 'database-connections';
  allocation: {
    amount: number;
    unit: string;
    duration: number;
    priority: number;
  };
  requestedBy: string;
  workflowId?: string;
  constraints?: {
    maxCost?: number;
    preferredRegion?: string;
    securityLevel?: 'standard' | 'high' | 'critical';
  };
}

/**
 * TaskMaster approval request
 */
export interface TaskMasterApprovalRequest {
  approvalId?: string;
  approvalType: 'workflow-execution' | 'resource-allocation' | 'document-import' | 'pi-planning' | 'architecture-change';
  requestedBy: string;
  workflowId?: string;
  approvalData: {
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high' | 'critical';
    requiredApprovers: string[];
    deadline?: number;
    context: Record<string, unknown>;
  };
  riskAssessment?: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    mitigation: string[];
    rollbackPlan?: string;
  };
}

/**
 * PI Planning coordination request
 */
export interface PIPlanningCoordinationRequest {
  piId: string;
  planningPhase: 'preparation' | 'planning' | 'commitment' | 'execution' | 'review';
  portfolioId: string;
  programId: string;
  participants: Array<{
    agentId: string;
    role: 'product-owner' | 'architect' | 'developer' | 'tester' | 'stakeholder';
    availability: number; // 0-1 scale
  }>;
  objectives: Array<{
    objectiveId: string;
    title: string;
    priority: number;
    businessValue: number;
    confidence: number;
  }>;
  constraints?: {
    duration: number;
    budget?: number;
    resourceLimits?: Record<string, number>;
  };
}

/**
 * SPARC process coordination request
 */
export interface SPARCCoordinationRequest {
  projectId: string;
  currentPhase: 'specification' | 'pseudocode' | 'architecture' | 'refinement' | 'completion';
  nextPhase?: 'specification' | 'pseudocode' | 'architecture' | 'refinement' | 'completion';
  artifacts: Array<{
    artifactId: string;
    type: string;
    name: string;
    status: 'draft' | 'review' | 'approved' | 'rejected';
    qualityScore?: number;
  }>;
  qualityGates: {
    phase: string;
    criteria: string[];
    passed: boolean;
    score: number;
  };
  approvalRequired: boolean;
}

// =============================================================================
// UNIFIED COORDINATION EVENT MODULE
// =============================================================================

/**
 * Unified Coordination Event Module that combines legacy functionality with new patterns
 * 
 * Provides high-level methods for coordination, resource allocation, TaskMaster integration,
 * and SAFe/SPARC workflow coordination while maintaining backward compatibility.
 */
export class UnifiedCoordinationEventModule {
  private readonly moduleId: string;
  private readonly config: UnifiedCoordinationEventModuleConfig;
  private readonly logger: Logger;
  private eventModule?: IEventModule;
  
  private isInitialized = false;
  private eventHandlers = new Map<string, Set<Function>>();
  private registeredAgents = new Map<string, AgentState>();
  private activeTasks = new Map<string, CoordinationTask>();
  private activeWorkflows = new Map<string, any>();

  constructor(config: UnifiedCoordinationEventModuleConfig, _eventBus?: EventBus) {
    this.moduleId = config.moduleId;
    this.config = {
      moduleName: `Unified Coordination Module ${config.moduleId}`,
      version: '2.1.0',
      enableLegacyCompatibility: true,
      enableEnhancedTaskMaster: true,
      enableEnhancedResourceAllocation: true,
      enableCorrelation: true,
      enableHeartbeat: false,
      heartbeatInterval: 30000,
      maxConcurrentTasks: 50,
      defaultOperationTimeout: 300000,
      enableTaskMasterIntegration: true,
      enableResourceAllocation: true,
      enablePIPlanningCoordination: true,
      ...config
    };
    
    this.logger = getLogger(`unified-coordination-event-module:${this.moduleId}`);
  }

  /**
   * Initialize the unified coordination event module
   */
  async initialize(): Promise<Result<void, Error>> {
    if (this.isInitialized) {
      this.logger.warn('Unified coordination event module already initialized');
      return ok();
    }

    return await withTrace('unified-coordination-event-module:initialize', async () => {
      try {
        this.logger.info('Initializing unified coordination event module', {
          moduleId: this.moduleId,
          config: this.config
        });

        // Create the underlying event module using factory
        const coordinationModuleConfig: CoordinationModuleConfig = {
          moduleId: this.config.moduleId,
          moduleName: this.config.moduleName!,
          version: this.config.version!,
          description: `Unified Coordination Event Module for ${this.moduleId}`,
          enableCorrelation: this.config.enableCorrelation ?? true,
          enableHeartbeat: this.config.enableHeartbeat ?? false,
          heartbeatInterval: this.config.heartbeatInterval ?? 30000,
          maxConcurrentTasks: this.config.maxConcurrentTasks ?? 50,
          defaultOperationTimeout: this.config.defaultOperationTimeout ?? 300000,
          enableTaskMasterIntegration: this.config.enableTaskMasterIntegration ?? true,
          enableResourceAllocation: this.config.enableResourceAllocation ?? true,
          enablePIPlanningCoordination: this.config.enablePIPlanningCoordination ?? true,
          metadata: {
            unifiedModule: true,
            legacyCompatibility: this.config.enableLegacyCompatibility,
            enhancedTaskMaster: this.config.enableEnhancedTaskMaster,
            enhancedResourceAllocation: this.config.enableEnhancedResourceAllocation,
            ...this.config.coordinationMetadata
          }
        };

        const moduleResult = await EventModuleFactory.createCoordinationModuleWithDefaults(
          this.config.moduleId,
          this.config.moduleName,
          coordinationModuleConfig
        );

        if (moduleResult.isErr()) {
          return err(new Error(`Failed to create coordination module: ${moduleResult.error.message}`));
        }

        this.eventModule = moduleResult.value;

        // Setup enhanced event handling
        this.setupEnhancedEventHandling();

        this.isInitialized = true;
        
        recordMetric('unified_coordination_event_module_initialized', 1, {
          moduleId: this.moduleId
        });

        this.logger.info('Unified coordination event module initialized successfully');
        return ok();
      } catch (error) {
        return err(new Error(`Unified coordination event module initialization failed: ${error}`));
      }
    });
  }

  /**
   * Shutdown the unified coordination event module
   */
  async shutdown(): Promise<Result<void, Error>> {
    if (!this.isInitialized || !this.eventModule) {
      return ok();
    }

    return await withTrace('unified-coordination-event-module:shutdown', async () => {
      try {
        this.logger.info('Shutting down unified coordination event module');

        const shutdownResult = await this.eventModule!.shutdown();
        if (shutdownResult.isErr()) {
          this.logger.error('Event module shutdown failed', { 
            error: shutdownResult.error.message 
          });
        }
        
        this.eventHandlers.clear();
        this.registeredAgents.clear();
        this.activeTasks.clear();
        this.activeWorkflows.clear();
        this.isInitialized = false;
        
        recordMetric('unified_coordination_event_module_shutdown', 1, {
          moduleId: this.moduleId
        });

        this.logger.info('Unified coordination event module shutdown complete');
        return ok();
      } catch (error) {
        return err(new Error(`Unified coordination event module shutdown failed: ${error}`));
      }
    });
  }

  // =============================================================================
  // AGENT COORDINATION METHODS
  // =============================================================================

  /**
   * Register an agent with the coordination system
   */
  async registerAgent(agentState: AgentState): Promise<Result<void, Error>> {
    if (!this.ensureInitialized()) {
      return err(new Error('Module not initialized'));
    }

    try {
      this.registeredAgents.set(agentState.agentId, agentState);

      const correlationContext = this.eventModule!.createCorrelation(
        'agent-registration',
        { agentId: agentState.agentId, agentType: agentState.agentType }
      );

      this.eventModule!.emit('coordination:agent:registered', {
        timestamp: Date.now(),
        agentId: agentState.agentId,
        agentType: agentState.agentType,
        capabilities: agentState.capabilities,
        status: agentState.status,
        metadata: agentState.metadata
      }, { correlationContext });

      this.logger.info('Agent registered', {
        agentId: agentState.agentId,
        agentType: agentState.agentType,
        capabilities: agentState.capabilities.length
      });

      return ok();
    } catch (error) {
      return err(new Error(`Agent registration failed: ${error}`));
    }
  }

  /**
   * Submit a coordination task
   */
  async submitCoordinationTask(task: Omit<CoordinationTask, 'taskId' | 'createdAt' | 'status'>): Promise<Result<UUID, Error>> {
    if (!this.ensureInitialized()) {
      return err(new Error('Module not initialized'));
    }

    try {
      const coordinationTask: CoordinationTask = {
        ...task,
        taskId: generateUUID(),
        createdAt: Date.now(),
        status: 'pending'
      };

      this.activeTasks.set(coordinationTask.taskId, coordinationTask);

      const correlationContext = this.eventModule!.createCorrelation(
        'coordination-task-submission',
        { taskId: coordinationTask.taskId, taskType: task.type }
      );

      this.eventModule!.emit('coordination:task:submitted', {
        timestamp: Date.now(),
        ...coordinationTask
      }, { correlationContext });

      this.logger.info('Coordination task submitted', {
        taskId: coordinationTask.taskId,
        type: task.type,
        priority: task.priority,
        target: task.target
      });

      return ok(coordinationTask.taskId);
    } catch (error) {
      return err(new Error(`Coordination task submission failed: ${error}`));
    }
  }

  // =============================================================================
  // DOCUMENT ORCHESTRATION METHODS
  // =============================================================================

  /**
   * Orchestrate external document import workflow
   */
  async orchestrateDocumentImport(request: DocumentImportOrchestrationRequest): Promise<Result<UUID, Error>> {
    if (!this.ensureInitialized()) {
      return err(new Error('Module not initialized'));
    }

    try {
      const orchestrationId = generateUUID();
      
      const correlationContext = this.eventModule!.createCorrelation(
        'document-import-orchestration',
        { documentId: request.documentId, targetProjectId: request.targetProjectId }
      );

      const event: CoordinationDocumentEventMap['coordination:document-intelligence:import-approved'] = {
        requestId: orchestrationId,
        timestamp: Date.now(),
        documentId: request.documentId,
        importWorkflowType: request.importType || 'external-vision',
        importApprovalId: generateUUID(),
        approvedBy: this.moduleId,
        targetProjectId: request.targetProjectId,
        importParameters: {
          documentData: request.documentData,
          priority: request.priority,
          targetSafeProject: request.targetSafeProject
        },
        importResourceAllocation: {
          aiTokenBudget: request.constraints?.aiTokenBudget || 10000,
          maxImportTime: request.constraints?.maxImportTime || 300000
        },
        importConstraints: {
          requiresImportApproval: request.approvalRequired ?? true,
          qualityThreshold: request.constraints?.qualityThreshold || 0.8
        }
      };

      this.eventModule!.emit('coordination:document-intelligence:import-approved', event, { correlationContext });

      this.logger.info('Document import orchestration initiated', {
        orchestrationId,
        documentId: request.documentId,
        targetProjectId: request.targetProjectId,
        priority: request.priority
      });

      return ok(orchestrationId);
    } catch (error) {
      return err(new Error(`Document import orchestration failed: ${error}`));
    }
  }

  // =============================================================================
  // RESOURCE ALLOCATION METHODS
  // =============================================================================

  /**
   * Request resource allocation
   */
  async requestResourceAllocation(request: ResourceAllocationRequest): Promise<Result<UUID, Error>> {
    if (!this.ensureInitialized()) {
      return err(new Error('Module not initialized'));
    }

    try {
      const requestId = request.requestId || generateUUID();
      
      const correlationContext = this.eventModule!.createCorrelation(
        'resource-allocation-request',
        { requestId, resourceType: request.resourceType }
      );

      this.eventModule!.emit('coordination:resource:allocation-request', {
        requestId,
        timestamp: Date.now(),
        resourceType: request.resourceType,
        allocation: request.allocation,
        requestedBy: request.requestedBy,
        workflowId: request.workflowId,
        constraints: request.constraints
      }, { correlationContext });

      this.logger.info('Resource allocation requested', {
        requestId,
        resourceType: request.resourceType,
        amount: request.allocation.amount,
        requestedBy: request.requestedBy
      });

      return ok(requestId);
    } catch (error) {
      return err(new Error(`Resource allocation request failed: ${error}`));
    }
  }

  /**
   * Emit resource allocation approval
   */
  async approveResourceAllocation(
    originalRequestId: string,
    allocatedResources: any,
    constraints: any = {}
  ): Promise<Result<void, Error>> {
    if (!this.ensureInitialized()) {
      return err(new Error('Module not initialized'));
    }

    try {
      const correlationContext = this.eventModule!.createCorrelation(
        'resource-allocation-approval',
        { originalRequestId }
      );

      const event: CoordinationBrainEventMap['coordination:brain:resource-allocated'] = {
        requestId: generateUUID(),
        timestamp: Date.now(),
        workflowId: originalRequestId,
        allocationType: 'approved',
        allocatedResources,
        allocationDuration: constraints.duration || 3600000, // 1 hour default
        constraints
      };

      this.eventModule!.emit('coordination:brain:resource-allocated', event, { correlationContext });

      this.logger.info('Resource allocation approved', {
        originalRequestId,
        allocatedResources
      });

      return ok();
    } catch (error) {
      return err(new Error(`Resource allocation approval failed: ${error}`));
    }
  }

  // =============================================================================
  // TASKMASTER INTEGRATION METHODS
  // =============================================================================

  /**
   * Request TaskMaster approval
   */
  async requestTaskMasterApproval(request: TaskMasterApprovalRequest): Promise<Result<UUID, Error>> {
    if (!this.ensureInitialized()) {
      return err(new Error('Module not initialized'));
    }

    try {
      const approvalId = request.approvalId || generateUUID();
      
      const correlationContext = this.eventModule!.createCorrelation(
        'taskmaster-approval-request',
        { approvalId, approvalType: request.approvalType }
      );

      this.eventModule!.emit('coordination:taskmaster:approval-request', {
        approvalId,
        timestamp: Date.now(),
        approvalType: request.approvalType,
        requestedBy: request.requestedBy,
        workflowId: request.workflowId,
        approvalData: request.approvalData,
        riskAssessment: request.riskAssessment
      }, { correlationContext });

      this.logger.info('TaskMaster approval requested', {
        approvalId,
        approvalType: request.approvalType,
        requestedBy: request.requestedBy,
        impact: request.approvalData.impact
      });

      return ok(approvalId);
    } catch (error) {
      return err(new Error(`TaskMaster approval request failed: ${error}`));
    }
  }

  /**
   * Emit workflow approval
   */
  async approveWorkflow(
    originalRequestId: string,
    approvalId: string,
    approvedBy: string,
    allocatedResources: any,
    constraints: any = {}
  ): Promise<Result<void, Error>> {
    if (!this.ensureInitialized()) {
      return err(new Error('Module not initialized'));
    }

    try {
      const correlationContext = this.eventModule!.createCorrelation(
        'workflow-approval',
        { originalRequestId, approvalId }
      );

      const event: CoordinationBrainEventMap['coordination:brain:workflow-approved'] = {
        requestId: generateUUID(),
        timestamp: Date.now(),
        originalRequestId,
        approvalId,
        approvedBy,
        approvalType: 'external',
        allocatedResources,
        constraints
      };

      this.eventModule!.emit('coordination:brain:workflow-approved', event, { correlationContext });

      this.logger.info('Workflow approved', {
        originalRequestId,
        approvalId,
        approvedBy
      });

      return ok();
    } catch (error) {
      return err(new Error(`Workflow approval failed: ${error}`));
    }
  }

  // =============================================================================
  // SAFe AND SPARC COORDINATION METHODS
  // =============================================================================

  /**
   * Coordinate PI Planning
   */
  async coordinatePIPlanning(request: PIPlanningCoordinationRequest): Promise<Result<void, Error>> {
    if (!this.ensureInitialized()) {
      return err(new Error('Module not initialized'));
    }

    try {
      const correlationContext = this.eventModule!.createCorrelation(
        'pi-planning-coordination',
        { piId: request.piId, planningPhase: request.planningPhase }
      );

      this.eventModule!.emit('coordination:safe:pi-planning-request', {
        requestId: generateUUID(),
        timestamp: Date.now(),
        piId: request.piId,
        planningPhase: request.planningPhase,
        portfolioId: request.portfolioId,
        programId: request.programId,
        participants: request.participants,
        objectives: request.objectives,
        constraints: request.constraints
      }, { correlationContext });

      this.activeWorkflows.set(request.piId, {
        workflowId: request.piId,
        type: 'pi-planning',
        phase: request.planningPhase,
        status: 'active',
        startedAt: Date.now()
      });

      this.logger.info('PI Planning coordination initiated', {
        piId: request.piId,
        planningPhase: request.planningPhase,
        participantCount: request.participants.length,
        objectiveCount: request.objectives.length
      });

      return ok();
    } catch (error) {
      return err(new Error(`PI Planning coordination failed: ${error}`));
    }
  }

  /**
   * Coordinate SPARC process
   */
  async coordinateSPARC(request: SPARCCoordinationRequest): Promise<Result<void, Error>> {
    if (!this.ensureInitialized()) {
      return err(new Error('Module not initialized'));
    }

    try {
      const correlationContext = this.eventModule!.createCorrelation(
        'sparc-coordination',
        { projectId: request.projectId, currentPhase: request.currentPhase }
      );

      this.eventModule!.emit('coordination:sparc:phase-coordination', {
        requestId: generateUUID(),
        timestamp: Date.now(),
        projectId: request.projectId,
        currentPhase: request.currentPhase,
        nextPhase: request.nextPhase,
        artifacts: request.artifacts,
        qualityGates: request.qualityGates,
        approvalRequired: request.approvalRequired
      }, { correlationContext });

      this.activeWorkflows.set(request.projectId, {
        workflowId: request.projectId,
        type: 'sparc',
        currentPhase: request.currentPhase,
        nextPhase: request.nextPhase,
        status: 'active',
        startedAt: Date.now()
      });

      this.logger.info('SPARC coordination initiated', {
        projectId: request.projectId,
        currentPhase: request.currentPhase,
        nextPhase: request.nextPhase,
        qualityGatesPassed: request.qualityGates.passed
      });

      return ok();
    } catch (error) {
      return err(new Error(`SPARC coordination failed: ${error}`));
    }
  }

  /**
   * Emit priority escalation
   */
  async escalatePriority(
    workflowId: string,
    escalationReason: string,
    newPriority: 'high' | 'critical',
    urgencyLevel: number,
    actionRequired: string[],
    deadline: string
  ): Promise<Result<void, Error>> {
    if (!this.ensureInitialized()) {
      return err(new Error('Module not initialized'));
    }

    try {
      const correlationContext = this.eventModule!.createCorrelation(
        'priority-escalation',
        { workflowId, escalationReason }
      );

      const event: CoordinationBrainEventMap['coordination:brain:priority-escalated'] = {
        requestId: generateUUID(),
        timestamp: Date.now(),
        workflowId,
        escalationReason: escalationReason as any,
        newPriority,
        urgencyLevel,
        escalatedBy: this.moduleId,
        actionRequired,
        deadline
      };

      this.eventModule!.emit('coordination:brain:priority-escalated', event, { correlationContext });

      this.logger.info('Priority escalated', {
        workflowId,
        escalationReason,
        newPriority,
        urgencyLevel
      });

      return ok();
    } catch (error) {
      return err(new Error(`Priority escalation failed: ${error}`));
    }
  }

  // =============================================================================
  // STATUS AND MONITORING METHODS
  // =============================================================================

  /**
   * Get coordination status
   */
  getStatus(): {
    moduleId: string;
    isInitialized: boolean;
    registeredAgents: number;
    activeTasks: number;
    activeWorkflows: number;
    completedWorkflows: number;
    failedWorkflows: number;
    eventHandlerCount: number;
    underlyingModuleStatus?: any;
  } {
    const baseStatus = {
      moduleId: this.moduleId,
      isInitialized: this.isInitialized,
      registeredAgents: this.registeredAgents.size,
      activeTasks: this.activeTasks.size,
      activeWorkflows: Array.from(this.activeWorkflows.values()).filter(w => w.status === 'active').length,
      completedWorkflows: Array.from(this.activeWorkflows.values()).filter(w => w.status === 'completed').length,
      failedWorkflows: Array.from(this.activeWorkflows.values()).filter(w => w.status === 'failed').length,
      eventHandlerCount: Array.from(this.eventHandlers.values()).reduce((sum, set) => sum + set.size, 0)
    };

    if (this.eventModule) {
      return {
        ...baseStatus,
        underlyingModuleStatus: this.eventModule.getStatus()
      };
    }

    return baseStatus;
  }

  /**
   * Get active workflows
   */
  getActiveWorkflows(): any[] {
    return Array.from(this.activeWorkflows.values()).filter(w => w.status === 'active');
  }

  /**
   * Get workflow context by ID
   */
  getWorkflowContext(workflowId: UUID): any | undefined {
    return this.activeWorkflows.get(workflowId);
  }

  /**
   * Get registered agents
   */
  getRegisteredAgents(): AgentState[] {
    return Array.from(this.registeredAgents.values());
  }

  /**
   * Get active tasks
   */
  getActiveTasks(): CoordinationTask[] {
    return Array.from(this.activeTasks.values()).filter(t => t.status === 'pending' || t.status === 'in-progress');
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Send a custom heartbeat with additional data
   */
  async sendHeartbeat(customData?: Record<string, unknown>): Promise<Result<void, Error>> {
    if (!this.ensureInitialized()) {
      return err(new Error('Module not initialized'));
    }
    
    try {
      await this.eventModule!.sendHeartbeat({
        moduleId: this.moduleId,
        registeredAgents: this.registeredAgents.size,
        activeTasks: this.activeTasks.size,
        activeWorkflows: this.activeWorkflows.size,
        unifiedModule: true,
        ...customData
      });
      return ok();
    } catch (error) {
      return err(new Error(`Heartbeat failed: ${error}`));
    }
  }

  /**
   * Create correlation context for external systems
   */
  createCorrelation(initiatedBy: string, metadata?: Record<string, unknown>): CorrelationContext | undefined {
    if (!this.ensureInitialized()) {
      return undefined;
    }
    
    return this.eventModule!.createCorrelation(initiatedBy, {
      source: 'unified-coordination-event-module',
      ...metadata
    });
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private ensureInitialized(): boolean {
    return this.isInitialized && !!this.eventModule;
  }

  private _addEventListener(eventName: string, handler: Function): void {
    if (!this.ensureInitialized()) {
      throw new Error(`Unified coordination event module ${this.moduleId} not initialized. Call initialize() first.`);
    }

    // Store handler for tracking
    if (!this.eventHandlers.has(eventName)) {
      this.eventHandlers.set(eventName, new Set());
    }
    this.eventHandlers.get(eventName)!.add(handler);

    // Add to underlying event module
    this.eventModule!.on(eventName, handler);

    this.logger.debug('Event listener added', {
      eventName,
      handlerCount: this.eventHandlers.get(eventName)!.size
    });
  }

  private setupEnhancedEventHandling(): void {
    if (!this.eventModule) return;

    // Enhanced coordination event handling
    const coordinationEvents = [
      'brain:coordination:safe-workflow-support',
      'brain:coordination:sparc-phase-ready',
      'document-intelligence:coordination:import-approved',
      'taskmaster:coordination:approval-request',
      'taskmaster:coordination:approval-granted'
    ];

    for (const eventName of coordinationEvents) {
      this.eventModule.on(eventName, (event: any) => {
        this.logger.debug('Enhanced coordination event received', { 
          eventName, 
          requestId: event.requestId,
          correlationId: event._correlation?.correlationId
        });
        
        recordMetric('unified_coordination_event_module_event_received', 1, {
          moduleId: this.moduleId,
          eventName,
          hasCorrelation: !!event._correlation
        });
      });
    }

    // Enhanced TaskMaster event handling
    if (this.config.enableEnhancedTaskMaster) {
      this.setupEnhancedTaskMasterHandling();
    }

    // Enhanced resource allocation handling
    if (this.config.enableEnhancedResourceAllocation) {
      this.setupEnhancedResourceAllocationHandling();
    }
  }

  private setupEnhancedTaskMasterHandling(): void {
    if (!this.eventModule) return;

    const taskMasterEvents = [
      'coordination:taskmaster:approval-request',
      'coordination:taskmaster:approval-granted',
      'coordination:taskmaster:approval-denied',
      'coordination:taskmaster:approval-escalated'
    ];

    for (const eventName of taskMasterEvents) {
      this.eventModule.on(eventName, (event: any) => {
        this.logger.info('Enhanced TaskMaster event', {
          eventName,
          approvalId: event.approvalId,
          approvalType: event.approvalType
        });
        
        recordMetric('unified_coordination_event_module_taskmaster_event', 1, {
          moduleId: this.moduleId,
          eventName,
          approvalType: event.approvalType
        });
      });
    }
  }

  private setupEnhancedResourceAllocationHandling(): void {
    if (!this.eventModule) return;

    const resourceEvents = [
      'coordination:resource:allocation-request',
      'coordination:resource:allocation-approved',
      'coordination:resource:allocation-denied',
      'coordination:resource:usage-monitoring'
    ];

    for (const eventName of resourceEvents) {
      this.eventModule.on(eventName, (event: any) => {
        this.logger.info('Enhanced resource allocation event', {
          eventName,
          requestId: event.requestId,
          resourceType: event.resourceType
        });
        
        recordMetric('unified_coordination_event_module_resource_event', 1, {
          moduleId: this.moduleId,
          eventName,
          resourceType: event.resourceType
        });
      });
    }
  }
}

// =============================================================================
// CONVENIENCE FACTORY FUNCTIONS
// =============================================================================

/**
 * Create and initialize a unified coordination event module
 */
export async function createUnifiedCoordinationEventModule(
  moduleId: string,
  config?: Partial<UnifiedCoordinationEventModuleConfig>,
  eventBus?: EventBus
): Promise<Result<UnifiedCoordinationEventModule, Error>> {
  try {
    const fullConfig: UnifiedCoordinationEventModuleConfig = {
      moduleId,
      ...config
    };

    const module = new UnifiedCoordinationEventModule(fullConfig, eventBus);
    const initResult = await module.initialize();
    
    if (initResult.isErr()) {
      return err(initResult.error);
    }
    
    return ok(module);
  } catch (error) {
    return err(new Error(`Failed to create unified coordination event module: ${error}`));
  }
}

/**
 * Create a unified coordination event module with default configuration
 */
export async function createDefaultUnifiedCoordinationEventModule(
  moduleId: string,
  moduleName?: string,
  eventBus?: EventBus
): Promise<Result<UnifiedCoordinationEventModule, Error>> {
  return createUnifiedCoordinationEventModule(moduleId, {
    moduleName: moduleName || `Default Coordination Module ${moduleId}`,
    enableLegacyCompatibility: true,
    enableEnhancedTaskMaster: true,
    enableEnhancedResourceAllocation: true,
    enableCorrelation: true,
    enableHeartbeat: true,
    heartbeatInterval: 30000,
    maxConcurrentTasks: 100,
    defaultOperationTimeout: 600000, // 10 minutes
    coordinationMetadata: {
      defaultConfiguration: true,
      createdAt: Date.now()
    }
  }, eventBus);
}

// =============================================================================
// TYPE EXPORTS
// =============================================================================

// Types are exported inline above to avoid conflicts