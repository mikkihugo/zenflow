/**
 * @fileoverview Event Coordination System
 * 
 * Coordinates events between brain, document intelligence, and coordination packages
 * with proper correlation tracking and workflow management.
 */

import { EventBus, getLogger, type BaseEvent } from '@claude-zen/foundation';
import { 
  createCorrelationContext,
  correlateEvent,
  globalSagaManager,
  type CorrelationContext,
  type CorrelatedEvent
} from '../saga/correlation-tracker.js';

const logger = getLogger('EventCoordinator');

// =============================================================================
// COORDINATION REQUEST/RESPONSE TYPES
// =============================================================================

/**
 * Generic event coordination request
 */
export interface EventCoordinationRequest extends BaseEvent {
  requestType: 'workflow-orchestration' | 'cross-package-coordination' | 'saga-initiation';
  sourceService: 'brain' | 'document-intelligence' | 'coordination' | 'web-interface';
  targetServices: string[];
  workflowContext: Record<string, unknown>;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timeout: number;
  requiresApproval: boolean;
}

/**
 * Event coordination response
 */
export interface EventCoordinationResponse extends BaseEvent {
  originalRequestId: string;
  responseType: 'coordination-approved' | 'coordination-rejected' | 'workflow-initiated' | 'error';
  coordinatedServices: string[];
  workflowId?: string;
  sagaId?: string;
  error?: string;
  results: Record<string, unknown>;
}

/**
 * Cross-package workflow definition
 */
export interface CrossPackageWorkflow {
  workflowId: string;
  workflowType: string;
  participatingServices: string[];
  correlationId: string;
  state: 'pending' | 'running' | 'completed' | 'failed';
  steps: Array<{
    stepId: string;
    service: string;
    operation: string;
    state: 'pending' | 'running' | 'completed' | 'failed';
    startTime?: number;
    endTime?: number;
  }>;
  metadata: Record<string, unknown>;
}

// =============================================================================
// EVENT COORDINATOR CLASS
// =============================================================================

/**
 * Main event coordinator for cross-package event orchestration
 */
export class EventCoordinator {
  private eventBus: EventBus;
  private activeWorkflows = new Map<string, CrossPackageWorkflow>();
  private correlationContexts = new Map<string, CorrelationContext>();

  constructor(eventBus?: EventBus) {
    this.eventBus = eventBus || EventBus.getInstance();
    this.setupEventListeners();
    logger.info('EventCoordinator initialized with foundation EventBus integration');
  }

  /**
   * Setup event listeners for coordination
   */
  private setupEventListeners(): void {
    // Listen for coordination requests from any service
    this.eventBus.on('coordination:request', this.handleCoordinationRequest.bind(this));
    
    // Listen for workflow events
    this.eventBus.on('workflow:*', this.handleWorkflowEvent.bind(this));
    
    // Listen for saga events
    this.eventBus.on('saga:*', this.handleSagaEvent.bind(this));

    // Brain coordination events
    this.eventBus.on('brain:coordination:*', this.handleBrainCoordinationEvent.bind(this));
    
    // Document intelligence coordination events
    this.eventBus.on('document-intelligence:coordination:*', this.handleDocumentIntelligenceCoordinationEvent.bind(this));
  }

  /**
   * Handle incoming coordination requests
   */
  private async handleCoordinationRequest(request: EventCoordinationRequest): Promise<void> {
    logger.info('Received coordination request', {
      requestType: request.requestType,
      sourceService: request.sourceService,
      targetServices: request.targetServices,
    });

    try {
      // Create correlation context for this coordination
      const correlationContext = createCorrelationContext({
        initiatedBy: request.sourceService,
        metadata: {
          requestType: request.requestType,
          targetServices: request.targetServices,
        },
      });

      this.correlationContexts.set(request.requestId!, correlationContext);

      // Handle different types of coordination
      switch (request.requestType) {
        case 'workflow-orchestration':
          await this.orchestrateWorkflow(request, correlationContext);
          break;
        case 'cross-package-coordination':
          await this.coordinateAcrossPackages(request, correlationContext);
          break;
        case 'saga-initiation':
          await this.initiateSaga(request, correlationContext);
          break;
        default:
          throw new Error(`Unknown coordination request type: ${request.requestType}`);
      }
    } catch (error) {
      logger.error('Coordination request failed', { error, requestId: request.requestId });
      
      const errorResponse: EventCoordinationResponse = {
        requestId: `response_${Date.now()}`,
        timestamp: Date.now(),
        originalRequestId: request.requestId!,
        responseType: 'error',
        coordinatedServices: [],
        error: error instanceof Error ? error.message : String(error),
        results: {},
      };

      this.eventBus.emit('coordination:response', errorResponse);
    }
  }

  /**
   * Orchestrate workflow across multiple services
   */
  private async orchestrateWorkflow(
    request: EventCoordinationRequest,
    correlationContext: CorrelationContext
  ): Promise<void> {
    const workflowId = `workflow_${Date.now()}_${correlationContext.correlationId}`;
    
    const workflow: CrossPackageWorkflow = {
      workflowId,
      workflowType: request.workflowContext.workflowType as string || 'generic',
      participatingServices: request.targetServices,
      correlationId: correlationContext.correlationId,
      state: 'pending',
      steps: request.targetServices.map((service, index) => ({
        stepId: `step_${index + 1}`,
        service,
        operation: request.workflowContext.operation as string || 'coordinate',
        state: 'pending',
      })),
      metadata: request.workflowContext,
    };

    this.activeWorkflows.set(workflowId, workflow);

    // Start workflow execution
    workflow.state = 'running';
    
    // Emit workflow initiation events to target services
    for (const service of request.targetServices) {
      const workflowEvent = correlateEvent({
        requestId: `${workflowId}_${service}`,
        timestamp: Date.now(),
        workflowId,
        targetService: service,
        operation: workflow.steps.find(s => s.service === service)?.operation,
        context: request.workflowContext,
      }, correlationContext, {
        initiatedBy: 'coordination',
        triggeringEvent: 'coordination:request',
        relatedEvents: [request.requestId!],
      });

      this.eventBus.emit(`${service}:workflow-assigned`, workflowEvent);
    }

    // Send workflow initiation response
    const response: EventCoordinationResponse = {
      requestId: `response_${Date.now()}`,
      timestamp: Date.now(),
      originalRequestId: request.requestId!,
      responseType: 'workflow-initiated',
      coordinatedServices: request.targetServices,
      workflowId,
      results: {
        workflowId,
        participatingServices: request.targetServices,
        state: 'running',
      },
    };

    this.eventBus.emit('coordination:response', response);
    logger.info('Workflow orchestration initiated', { workflowId, services: request.targetServices });
  }

  /**
   * Coordinate across multiple packages
   */
  private async coordinateAcrossPackages(
    request: EventCoordinationRequest,
    correlationContext: CorrelationContext
  ): Promise<void> {
    // Emit coordination events to all target services
    const coordinationResults: Record<string, unknown> = {};

    for (const service of request.targetServices) {
      const coordinationEvent = correlateEvent({
        requestId: `coord_${Date.now()}_${service}`,
        timestamp: Date.now(),
        coordinationType: 'cross-package',
        sourceService: request.sourceService,
        coordinationContext: request.workflowContext,
      }, correlationContext, {
        initiatedBy: 'coordination',
        triggeringEvent: 'coordination:request',
        relatedEvents: [request.requestId!],
      });

      this.eventBus.emit(`${service}:coordination-required`, coordinationEvent);
      coordinationResults[service] = 'coordination-initiated';
    }

    // Send coordination response
    const response: EventCoordinationResponse = {
      requestId: `response_${Date.now()}`,
      timestamp: Date.now(),
      originalRequestId: request.requestId!,
      responseType: 'coordination-approved',
      coordinatedServices: request.targetServices,
      results: coordinationResults,
    };

    this.eventBus.emit('coordination:response', response);
    logger.info('Cross-package coordination initiated', { services: request.targetServices });
  }

  /**
   * Initiate saga for complex distributed workflow
   */
  private async initiateSaga(
    request: EventCoordinationRequest,
    correlationContext: CorrelationContext
  ): Promise<void> {
    const sagaType = request.workflowContext.sagaType as string;
    const sagaData = request.workflowContext.sagaData as Record<string, unknown>;

    let saga;
    
    // Create appropriate saga based on type
    switch (sagaType) {
      case 'document-import':
        const { SagaWorkflowFactory } = await import('../saga/workflow-sagas.js');
        saga = SagaWorkflowFactory.createDocumentImport(correlationContext, sagaData as any);
        break;
      case 'cross-package-coordination':
        const { SagaWorkflowFactory: Factory2 } = await import('../saga/workflow-sagas.js');
        saga = Factory2.createCrossPackageCoordination(correlationContext, sagaData as any);
        break;
      default:
        throw new Error(`Unknown saga type: ${sagaType}`);
    }

    // Send saga initiation response
    const response: EventCoordinationResponse = {
      requestId: `response_${Date.now()}`,
      timestamp: Date.now(),
      originalRequestId: request.requestId!,
      responseType: 'workflow-initiated',
      coordinatedServices: request.targetServices,
      sagaId: saga.sagaId,
      results: {
        sagaId: saga.sagaId,
        workflowType: saga.workflowType,
        state: saga.state,
        steps: saga.steps.length,
      },
    };

    this.eventBus.emit('coordination:response', response);
    logger.info('Saga initiated', { sagaId: saga.sagaId, type: sagaType });
  }

  /**
   * Handle brain coordination events
   */
  private handleBrainCoordinationEvent(eventName: string, eventData: any): void {
    logger.debug('Received brain coordination event', { eventName, eventData });
    
    // Forward to coordination service if needed
    if (eventName.includes('workflow-trigger') || eventName.includes('sparc-phase-ready')) {
      this.eventBus.emit('coordination:brain-event-received', {
        originalEvent: eventName,
        eventData,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Handle document intelligence coordination events
   */
  private handleDocumentIntelligenceCoordinationEvent(eventName: string, eventData: any): void {
    logger.debug('Received document intelligence coordination event', { eventName, eventData });
    
    // Forward to coordination service if needed
    if (eventName.includes('workflow-complete') || eventName.includes('epic-ready')) {
      this.eventBus.emit('coordination:document-intelligence-event-received', {
        originalEvent: eventName,
        eventData,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Handle workflow events
   */
  private handleWorkflowEvent(eventName: string, eventData: any): void {
    logger.debug('Received workflow event', { eventName, eventData });
    
    // Update workflow state if applicable
    if (eventData.workflowId && this.activeWorkflows.has(eventData.workflowId)) {
      const workflow = this.activeWorkflows.get(eventData.workflowId)!;
      // Update workflow based on event
      if (eventName.includes('completed')) {
        workflow.state = 'completed';
      } else if (eventName.includes('failed')) {
        workflow.state = 'failed';
      }
    }
  }

  /**
   * Handle saga events
   */
  private handleSagaEvent(eventName: string, eventData: any): void {
    logger.debug('Received saga event', { eventName, eventData });
    // Saga events are handled by the saga manager
  }

  /**
   * Get active workflows
   */
  getActiveWorkflows(): CrossPackageWorkflow[] {
    return Array.from(this.activeWorkflows.values());
  }

  /**
   * Get workflow by ID
   */
  getWorkflow(workflowId: string): CrossPackageWorkflow | undefined {
    return this.activeWorkflows.get(workflowId);
  }
}

// =============================================================================
// WORKFLOW ORCHESTRATOR CONFIG
// =============================================================================

/**
 * Configuration for workflow orchestrator
 */
export interface WorkflowOrchestratorConfig {
  enableSagaSupport: boolean;
  enableCrossPackageCoordination: boolean;
  defaultTimeout: number;
  maxConcurrentWorkflows: number;
  correlationTrackingEnabled: boolean;
}

// =============================================================================
// GLOBAL EVENT COORDINATOR INSTANCE
// =============================================================================

/**
 * Global event coordinator instance using foundation's EventBus
 */
export const globalEventCoordinator = new EventCoordinator();