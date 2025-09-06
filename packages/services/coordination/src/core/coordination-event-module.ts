/**
 * @fileoverview Coordination Event Module Wrapper
 * 
 * External integration wrapper for coordination package using unified event contracts.
 * Provides a clean interface for other packages to interact with coordination services.
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
  type UUID
} from '@claude-zen/foundation/types';

import type { Logger } from '@claude-zen/foundation/core';

// Temporary type definitions for development
type EventModule = {
  initialize: () => Promise<void>;
  shutdown: () => Promise<void>;
  on: (event: string, handler: Function) => void;
  emit: (event: string, data: any, context?: CorrelationContext) => void;
  createCorrelation: (type: string, metadata?: Record<string, unknown>) => CorrelationContext;
};

type CorrelationContext = { 
  correlationId: UUID; 
  metadata: Record<string, unknown> 
};

// Temporary helper function
function createCoordinationEventModule(_id: string, _version: string): EventModule {
  return {
    initialize: async () => {},
    shutdown: async () => {},
    on: (_event: string, _handler: Function) => {},
    emit: (_event: string, _data: any, _context?: CorrelationContext) => {},
    createCorrelation: (_type: string, metadata?: Record<string, unknown>) => ({ 
      correlationId: generateUUID(), 
      metadata: metadata || {} 
    })
  };
}

import { CoordinationOrchestrator } from './coordination-orchestrator.js';
import type { CoordinationConfig, AgentState } from './coordination-interfaces.js';

// =============================================================================
// COORDINATION EVENT MODULE WRAPPER
// =============================================================================

/**
 * Event module wrapper for coordination package external integration
 */
export class CoordinationEventModule {
  private readonly logger: Logger;
  private readonly eventModule: EventModule;
  private readonly coordinator: CoordinationOrchestrator;
  private readonly eventBus: EventBus;
  
  private isInitialized = false;

  constructor(config: CoordinationConfig, eventBus?: EventBus) {
    this.logger = getLogger('coordination-event-module');
    this.eventBus = eventBus ?? EventBus.getInstance();
    
    // Create unified event module
    this.eventModule = createCoordinationEventModule(
      'coordination-package',
      '1.0.0'
    );
    
    // Create coordination orchestrator
    this.coordinator = new CoordinationOrchestrator(config, this.eventBus);
    
    this.logger.info('Coordination Event Module Wrapper created');
  }

  /**
   * Initialize the coordination event module
   */
  async initialize(): Promise<Result<void, Error>> {
    if (this.isInitialized) {
      return ok();
    }

    try {
      // Initialize unified event module
      await this.eventModule.initialize();
      
      // Initialize coordination orchestrator
      const orchestratorResult = await this.coordinator.initialize();
      if (orchestratorResult.isErr()) {
        return err(orchestratorResult.error);
      }
      
      this.setupExternalEventHandlers();
      this.isInitialized = true;
      
      this.logger.info('Coordination Event Module initialized with unified event contracts');
      return ok();
    } catch (error) {
      return err(new Error(`Coordination Event Module initialization failed: ${error}`));
    }
  }

  /**
   * Shutdown the coordination event module
   */
  async shutdown(): Promise<Result<void, Error>> {
    try {
      await this.eventModule.shutdown();
      this.isInitialized = false;
      this.logger.info('Coordination Event Module shutdown completed');
      return ok();
    } catch (error) {
      return err(new Error(`Coordination Event Module shutdown failed: ${error}`));
    }
  }

  // =============================================================================
  // EXTERNAL API METHODS
  // =============================================================================

  /**
   * Register an agent with the coordination system
   */
  async registerAgent(agentState: AgentState): Promise<Result<void, Error>> {
    if (!this.isInitialized) {
      return err(new Error('Coordination Event Module not initialized'));
    }
    
    return await this.coordinator.registerAgent(agentState);
  }

  /**
   * Orchestrate external document import workflow
   */
  async orchestrateDocumentImport(request: {
    documentId: string;
    targetProjectId: string;
    documentData: any;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<Result<UUID, Error>> {
    if (!this.isInitialized) {
      return err(new Error('Coordination Event Module not initialized'));
    }
    
    return await this.coordinator.orchestrateExternalDocumentImport(request);
  }

  /**
   * Submit a coordination task
   */
  async submitCoordinationTask(task: {
    type: 'agent-assignment' | 'resource-allocation' | 'workflow-coordination' | 'health-check';
    priority: number;
    payload: any;
    target?: string;
    deadline?: number;
  }): Promise<Result<UUID, Error>> {
    if (!this.isInitialized) {
      return err(new Error('Coordination Event Module not initialized'));
    }
    
    const baseTask: any = {
      taskId: generateUUID(),
      type: task.type,
      priority: task.priority,
      payload: task.payload,
      createdAt: now(),
      deadline: task.deadline as any, // TODO: refine to proper Timestamp if provided
      status: 'pending' as const
    };
    const coordinationTask = task.target ? { ...baseTask, target: task.target } : baseTask;
    
    const result = await this.coordinator.submitTask(coordinationTask);
    if (result.isErr()) {
      return err(result.error);
    }
    
    return ok(coordinationTask.taskId);
  }

  /**
   * Coordinate SAFe PI Planning
   */
  async coordinatePIPlanning(piId: UUID): Promise<Result<void, Error>> {
    if (!this.isInitialized) {
      return err(new Error('Coordination Event Module not initialized'));
    }
    
    return await this.coordinator.coordinatePIPlanning(piId);
  }

  /**
   * Coordinate TaskMaster approval
   */
  async coordinateApproval(approvalId: UUID): Promise<Result<void, Error>> {
    if (!this.isInitialized) {
      return err(new Error('Coordination Event Module not initialized'));
    }
    
    return await this.coordinator.coordinateApproval(approvalId);
  }

  /**
   * Coordinate SPARC process
   */
  async coordinateSPARC(projectId: UUID, phase: string): Promise<Result<void, Error>> {
    if (!this.isInitialized) {
      return err(new Error('Coordination Event Module not initialized'));
    }
    
    return await this.coordinator.coordinateSPARC(projectId, phase);
  }

  /**
   * Get coordination status
   */
  getStatus(): {
    registeredAgents: number;
    activeTasks: number;
    activeWorkflows: number;
    completedWorkflows: number;
    failedWorkflows: number;
  } {
    if (!this.isInitialized) {
      return {
        registeredAgents: 0,
        activeTasks: 0,
        activeWorkflows: 0,
        completedWorkflows: 0,
        failedWorkflows: 0
      };
    }
    
    return this.coordinator.getCoordinationStatus();
  }

  /**
   * Get active workflow contexts
   */
  getActiveWorkflows(): any[] {
    if (!this.isInitialized) {
      return [];
    }
    
    return this.coordinator.getActiveWorkflows();
  }

  /**
   * Get workflow context by ID
   */
  getWorkflowContext(workflowId: UUID): any | undefined {
    if (!this.isInitialized) {
      return undefined;
    }
    
    return this.coordinator.getWorkflowContext(workflowId);
  }

  // =============================================================================
  // EVENT EMISSION HELPERS
  // =============================================================================

  /**
   * Emit brain workflow approval event
   */
  emitBrainWorkflowApproval(event: {
    originalRequestId: string;
    approvalId: string;
    approvedBy: string;
    allocatedResources: any;
    constraints: any;
  }): void {
    this.eventModule.emit('coordination:brain:workflow-approved', {
      requestId: generateUUID(),
      timestamp: now(),
      originalRequestId: event.originalRequestId,
      approvalId: event.approvalId,
      approvedBy: event.approvedBy,
      approvalType: 'external' as const,
      allocatedResources: event.allocatedResources,
      constraints: event.constraints
    });
  }

  /**
   * Emit document intelligence import approval event
   */
  emitDocumentImportApproval(event: {
    documentId: string;
    targetProjectId: string;
    importParameters: any;
    resourceAllocation: any;
    constraints: any;
  }): void {
    this.eventModule.emit('coordination:document-intelligence:import-approved', {
      requestId: generateUUID(),
      timestamp: now(),
      documentId: event.documentId,
      importWorkflowType: 'external-integration' as const,
      importApprovalId: generateUUID(),
      approvedBy: 'coordination-event-module',
      targetProjectId: event.targetProjectId,
      importParameters: event.importParameters,
      importResourceAllocation: event.resourceAllocation,
      importConstraints: event.constraints
    });
  }

  /**
   * Emit priority escalation event
   */
  emitPriorityEscalation(event: {
    workflowId: string;
    escalationReason: string;
    newPriority: 'high' | 'critical';
    urgencyLevel: number;
    actionRequired: string[];
    deadline: string;
  }): void {
    this.eventModule.emit('coordination:brain:priority-escalated', {
      requestId: generateUUID(),
      timestamp: now(),
      workflowId: event.workflowId,
      escalationReason: event.escalationReason as any,
      newPriority: event.newPriority,
      urgencyLevel: event.urgencyLevel,
      escalatedBy: 'coordination-event-module',
      actionRequired: event.actionRequired,
      deadline: event.deadline
    });
  }

  /**
   * Create correlation context for external systems
   */
  createCorrelation(initiatedBy: string, metadata?: Record<string, unknown>): CorrelationContext {
    return this.eventModule.createCorrelation(initiatedBy, {
      source: 'coordination-event-module',
      ...metadata
    });
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  /**
   * Setup external event handlers for coordination responses
   */
  private setupExternalEventHandlers(): void {
    // Listen for external workflow requests
    this.eventBus.on('external:workflow-request', async (event: any) => {
      await this.handleExternalWorkflowRequest(event);
    });

    // Listen for external coordination requests
    this.eventBus.on('external:coordination-request', async (event: any) => {
      await this.handleExternalCoordinationRequest(event);
    });

    // Listen for external status requests
    this.eventBus.on('external:status-request', (event: any) => {
      this.handleExternalStatusRequest(event);
    });

    this.logger.info('External event handlers configured');
  }

  /**
   * Handle external workflow requests
   */
  private async handleExternalWorkflowRequest(event: any): Promise<void> {
    this.logger.info('Processing external workflow request', {
      requestId: event.requestId,
      workflowType: event.workflowType
    });

    try {
      switch (event.workflowType) {
        case 'document-import':
          await this.orchestrateDocumentImport({
            documentId: event.documentId,
            targetProjectId: event.targetProjectId,
            documentData: event.documentData,
            priority: event.priority || 'medium'
          });
          break;
          
        case 'safe-integration':
          await this.coordinatePIPlanning(event.piId);
          break;
          
        case 'sparc-coordination':
          await this.coordinateSPARC(event.projectId, event.phase);
          break;
          
        default:
          this.logger.warn('Unknown external workflow type', {
            workflowType: event.workflowType
          });
      }
    } catch (error) {
      this.logger.error('External workflow request failed', {
        requestId: event.requestId,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Handle external coordination requests
   */
  private async handleExternalCoordinationRequest(event: any): Promise<void> {
    this.logger.info('Processing external coordination request', {
      requestId: event.requestId,
      coordinationType: event.coordinationType
    });

    try {
      switch (event.coordinationType) {
        case 'approval':
          await this.coordinateApproval(event.approvalId);
          break;
          
        case 'resource-allocation':
          // Handle resource allocation coordination
          this.eventBus.emit('coordination:resource-allocated', {
            workflowId: event.workflowId,
            allocationType: event.allocationType,
            allocatedResources: event.requestedResources,
            allocationDuration: event.duration || 3600000, // 1 hour default
            constraints: event.constraints || {}
          });
          break;
          
        default:
          this.logger.warn('Unknown external coordination type', {
            coordinationType: event.coordinationType
          });
      }
    } catch (error) {
      this.logger.error('External coordination request failed', {
        requestId: event.requestId,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Handle external status requests
   */
  private handleExternalStatusRequest(event: any): void {
    const status = this.getStatus();
    
    this.eventBus.emit('external:status-response', {
      requestId: event.requestId,
      timestamp: now(),
      status,
      workflows: event.includeWorkflows ? this.getActiveWorkflows() : undefined
    });
  }
}

// =============================================================================
// GLOBAL COORDINATION EVENT MODULE INSTANCE
// =============================================================================

/**
 * Default coordination configuration for event module
 */
const DEFAULT_COORDINATION_CONFIG: CoordinationConfig = {
  maxConcurrentTasks: 50,
  defaultTaskTimeout: 300000, // 5 minutes
  healthCheckInterval: 30000, // 30 seconds
  enablePerformanceMonitoring: true,
  eventBusConfig: {
    maxListeners: 100
  },
  retryConfig: {
    maxAttempts: 3,
    backoffMs: 1000,
    exponentialBackoff: true
  }
};

/**
 * Global coordination event module instance
 */
let globalCoordinationEventModule: CoordinationEventModule | undefined;

/**
 * Get or create the global coordination event module
 */
export function getCoordinationEventModule(
  config?: CoordinationConfig,
  eventBus?: EventBus
): CoordinationEventModule {
  if (!globalCoordinationEventModule) {
    globalCoordinationEventModule = new CoordinationEventModule(
      config ?? DEFAULT_COORDINATION_CONFIG,
      eventBus
    );
  }
  
  return globalCoordinationEventModule;
}

/**
 * Initialize the global coordination event module
 */
export async function initializeCoordinationEventModule(
  config?: CoordinationConfig,
  eventBus?: EventBus
): Promise<Result<CoordinationEventModule, Error>> {
  try {
    const module = getCoordinationEventModule(config, eventBus);
    const result = await module.initialize();
    
    if (result.isErr()) {
      return err(result.error);
    }
    
    return ok(module);
  } catch (error) {
    return err(new Error(`Global coordination event module initialization failed: ${error}`));
  }
}

/**
 * Shutdown the global coordination event module
 */
export async function shutdownCoordinationEventModule(): Promise<Result<void, Error>> {
  if (!globalCoordinationEventModule) {
    return ok();
  }
  
  const result = await globalCoordinationEventModule.shutdown();
  globalCoordinationEventModule = undefined;
  
  return result;
}