/**
 * @fileoverview Correlation ID and Saga State Tracking (Foundation)
 *
 * Provides correlation tracking for distributed workflows across brain, document intelligence,
 * and coordination packages with complete audit trails and saga state management.
 */

import { generateUUID } from '../../utils.js';
import { nanoid } from '../../utilities/index.js';
import type { BaseEvent } from '../event-catalog.js';

// =============================================================================
// CORRELATION ID MANAGEMENT
// =============================================================================

/**
 * Correlation context for tracking related events across services
 */
export interface CorrelationContext {
  correlationId: string;
  rootRequestId: string;
  parentRequestId?: string;
  sessionId?: string;
  userId?: string;
  traceId: string;
  spanId: string;
  timestamp: number;
  metadata: Record<string, unknown>;
}

/**
 * Enhanced base event with correlation tracking
 */
export interface CorrelatedEvent extends BaseEvent {
  correlationId: string;
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  rootRequestId: string;
  sessionContext?: {
    userId?: string;
    sessionId?: string;
    organizationId?: string;
  };
  causality: {
    initiatedBy: 'user' | 'brain' | 'document-intelligence' | 'coordination' | 'system';
    triggeringEvent?: string;
    relatedEvents: string[];
  };
}

/**
 * Generate new correlation context for workflow initiation
 */
export function createCorrelationContext(options: {
  userId?: string;
  sessionId?: string;
  initiatedBy: 'user' | 'brain' | 'document-intelligence' | 'coordination' | 'system';
  metadata?: Record<string, unknown>;
}): CorrelationContext {
  return {
    correlationId: nanoid(12),
    rootRequestId: generateUUID(),
    traceId: nanoid(16),
    spanId: nanoid(8),
    timestamp: Date.now(),
    metadata: options.metadata || {},
  };
}

/**
 * Create child correlation context for related operations
 */
export function createChildCorrelation(
  parent: CorrelationContext,
  operation: string
): CorrelationContext {
  return {
    ...parent,
    parentRequestId: parent.rootRequestId,
    spanId: nanoid(8),
    timestamp: Date.now(),
    metadata: {
      ...parent.metadata,
      operation,
      parentSpanId: parent.spanId,
    },
  };
}

// =============================================================================
// SAGA STATE MANAGEMENT
// =============================================================================

/**
 * Saga workflow states
 */
export type SagaState =
  | 'initiated'
  | 'in-progress'
  | 'compensating'
  | 'completed'
  | 'failed'
  | 'rolled-back';

/**
 * Saga step definition
 */
export interface SagaStep {
  stepId: string;
  stepName: string;
  service: 'brain' | 'document-intelligence' | 'coordination' | 'safe' | 'web-interface';
  operation: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  state: 'pending' | 'executing' | 'completed' | 'failed' | 'compensated';
  startTime?: number;
  endTime?: number;
  error?: string;
  retryCount: number;
  maxRetries: number;
  compensationAction?: string;
}

/**
 * Complete saga workflow tracking
 */
export interface SagaWorkflow {
  sagaId: string;
  workflowType: 'document-import' | 'safe-artifact-creation' | 'cross-package-coordination';
  correlationId: string;
  rootRequestId: string;
  state: SagaState;
  steps: SagaStep[];
  initiatedBy: string;
  initiatedAt: number;
  lastUpdated: number;
  completedAt?: number;
  metadata: {
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    timeout: number;
    stakeholders: string[];
    businessContext?: Record<string, unknown>;
  };
  compensationHistory: Array<{
    stepId: string;
    compensatedAt: number;
    reason: string;
    success: boolean;
  }>;
}

/**
 * Saga workflow manager for distributed transaction management
 */
export class SagaWorkflowManager {
  private activeSagas = new Map<string, SagaWorkflow>();
  private completedSagas = new Map<string, SagaWorkflow>();
  // Keeping for potential future history queries
  // @ts-ignore used for future history queries
  private sagaHistory: SagaWorkflow[] = [];
  // Legacy compatibility: store registered workflow definitions by name
  private registeredWorkflows = new Map<string, RegisteredWorkflowDefinition>();

  /**
   * Initiate new saga workflow
   */
  initiateSaga(
    workflowType: SagaWorkflow['workflowType'],
    correlationContext: CorrelationContext,
    steps: Omit<SagaStep, 'stepId' | 'state' | 'retryCount'>[],
    metadata: SagaWorkflow['metadata']
  ): SagaWorkflow {
    const sagaId = `saga_${workflowType}_${nanoid(8)}`;

    const saga: SagaWorkflow = {
      sagaId,
      workflowType,
      correlationId: correlationContext.correlationId,
      rootRequestId: correlationContext.rootRequestId,
      state: 'initiated',
      steps: steps.map((step, index) => ({
        ...step,
        stepId: `step_${index + 1}_${nanoid(6)}`,
        state: 'pending',
        retryCount: 0,
        maxRetries: (step as any).maxRetries || 3,
      })),
      initiatedBy: (correlationContext.metadata as any).initiatedBy || 'system',
      initiatedAt: Date.now(),
      lastUpdated: Date.now(),
      metadata,
      compensationHistory: [],
    };

    this.activeSagas.set(sagaId, saga);
    return saga;
  }

  /**
   * Update saga step state
   */
  updateSagaStep(
    sagaId: string,
    stepId: string,
    update: Partial<Pick<SagaStep, 'state' | 'output' | 'error' | 'endTime'>>
  ): boolean {
    const saga = this.activeSagas.get(sagaId);
    if (!saga) return false;

    const step = saga.steps.find((s) => s.stepId === stepId);
    if (!step) return false;

    Object.assign(step, update);

    if (update.state === 'executing' && !step.startTime) {
      step.startTime = Date.now();
    }
    if (update.state === 'completed' || update.state === 'failed') {
      step.endTime = Date.now();
    }

    saga.lastUpdated = Date.now();
    this.updateSagaState(saga);

    return true;
  }

  /**
   * Update overall saga state based on step states
   */
  private updateSagaState(saga: SagaWorkflow): void {
    const steps = saga.steps;

    if (steps.every((s) => s.state === 'completed')) {
      saga.state = 'completed';
      saga.completedAt = Date.now();
      this.completedSagas.set(saga.sagaId, saga);
      this.activeSagas.delete(saga.sagaId);
    } else if (steps.some((s) => s.state === 'failed' && s.retryCount >= s.maxRetries)) {
      saga.state = 'failed';
      // Initiate compensation
      this.initiateCompensation(saga);
    } else if (saga.state !== 'compensating' && steps.some((s) => s.state === 'executing')) {
      saga.state = 'in-progress';
    }
  }

  /**
   * Initiate compensation (rollback) for failed saga
   */
  private async initiateCompensation(saga: SagaWorkflow): Promise<void> {
    saga.state = 'compensating';

    // Compensate completed steps in reverse order
    const completedSteps = saga.steps.filter((s) => s.state === 'completed').reverse();

    for (const step of completedSteps) {
      if (step.compensationAction) {
        try {
          // Execute compensation action
          await this.executeCompensation(step);
          saga.compensationHistory.push({
            stepId: step.stepId,
            compensatedAt: Date.now(),
            reason: 'saga-rollback',
            success: true,
          });
          step.state = 'compensated';
        } catch (error) {
          saga.compensationHistory.push({
            stepId: step.stepId,
            compensatedAt: Date.now(),
            reason: `compensation-failed: ${error}`,
            success: false,
          });
        }
      }
    }

    saga.state = 'rolled-back';
    saga.completedAt = Date.now();
    this.completedSagas.set(saga.sagaId, saga);
    this.activeSagas.delete(saga.sagaId);
  }

  /**
   * Execute compensation action for a step
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // @ts-ignore step is reserved for future use
  private async executeCompensation(step: SagaStep): Promise<void> {
    // This would emit compensation events to appropriate services
    // Implementation depends on specific compensation requirements
    // Intentionally left as a no-op in foundation
  }

  /**
   * Get saga by ID
   */
  getSaga(sagaId: string): SagaWorkflow | undefined {
    return this.activeSagas.get(sagaId) || this.completedSagas.get(sagaId);
  }

  /**
   * Get all active sagas
   */
  getActiveSagas(): SagaWorkflow[] {
    return Array.from(this.activeSagas.values());
  }

  /**
   * Get saga metrics
   */
  getSagaMetrics(): {
    active: number;
    completed: number;
    failed: number;
    rolledBack: number;
    averageCompletionTime: number;
  } {
    const completed = Array.from(this.completedSagas.values());

    return {
      active: this.activeSagas.size,
      completed: completed.filter((s) => s.state === 'completed').length,
      failed: completed.filter((s) => s.state === 'failed').length,
      rolledBack: completed.filter((s) => s.state === 'rolled-back').length,
      averageCompletionTime:
        completed
          .filter((s) => s.completedAt)
          .reduce((sum, s) => sum + ((s.completedAt as number) - s.initiatedAt), 0) /
        (completed.length || 1),
    };
  }

  // =============================================================================
  // LEGACY COMPATIBILITY LAYER
  // =============================================================================

  /**
   * Register a workflow definition by name (legacy API compatibility)
   * Supports both (name, def) and (def) signatures.
   */
  registerWorkflow(
    nameOrDef: string | RegisteredWorkflowDefinition,
    def?: RegisteredWorkflowDefinition
  ): void {
    let defToRegister: RegisteredWorkflowDefinition;
    if (typeof nameOrDef === 'string') {
      if (!def) throw new Error('registerWorkflow: definition required when name is provided');
      defToRegister = { ...def, name: nameOrDef };
    } else {
      defToRegister = nameOrDef;
    }

    if (!defToRegister.name) throw new Error('registerWorkflow: name is required');
    this.registeredWorkflows.set(defToRegister.name, defToRegister);
  }

  /**
   * Start a registered workflow by name with an arbitrary context payload.
   * Returns a minimal context with workflowId for subsequent progress/cancel calls.
   */
  async startWorkflow(
    name: string,
    context: Record<string, unknown>
  ): Promise<{ workflowId: string; name: string; startedAt: number }>
  {
    const def = this.registeredWorkflows.get(name);
    if (!def) throw new Error(`startWorkflow: workflow '${name}' is not registered`);

    // Build correlation context from provided context metadata if present
    const ctxAny = context as Record<string, unknown>;
    const correlation: CorrelationContext = {
      correlationId: (ctxAny['correlationId'] as string) || nanoid(12),
      rootRequestId: (ctxAny['rootRequestId'] as string) || generateUUID(),
      traceId: (ctxAny['traceId'] as string) || nanoid(16),
      spanId: nanoid(8),
      timestamp: Date.now(),
      metadata: { ...context },
    };

    // Convert legacy step defs into SagaStep inputs (omit state/retryCount which are added by initiateSaga)
    const steps = def.steps.map((s) => ({
      stepName: s.name,
      service: inferServiceFromType(s.type),
      operation: s.type,
      input: { timeout: s.timeout, retries: s.retries },
      maxRetries: typeof s.retries === 'number' ? s.retries : 3,
    }));

    const saga = this.initiateSaga(
      inferWorkflowTypeFromName(name),
      correlation,
      steps,
      {
        description: def.description,
        priority: 'medium',
        timeout: Math.max(...def.steps.map((s) => s.timeout || 0), 0) || 300000,
        stakeholders: [],
      }
    );

    return { workflowId: saga.sagaId, name, startedAt: saga.initiatedAt };
  }

  /**
   * Progress a workflow to complete a named step with provided output (legacy compatibility)
   */
  async progressWorkflow(
    workflowId: string,
    stepName: string,
    data?: Record<string, unknown>
  ): Promise<boolean> {
    const saga = this.getSaga(workflowId);
    if (!saga) return false;
    const step = saga.steps.find((s) => s.stepName === stepName);
    if (!step) return false;

    // Mark executing then completed
    this.updateSagaStep(workflowId, step.stepId, { state: 'executing' });
    return this.updateSagaStep(workflowId, step.stepId, { state: 'completed', output: data });
  }

  /**
   * Cancel a running workflow (legacy compatibility)
   */
  async cancelWorkflow(workflowId: string, reason?: string): Promise<void> {
    const saga = this.activeSagas.get(workflowId);
    if (!saga) return;

    // Mark a synthetic failure on the last executing/pending step to trigger compensation
    const step =
      saga.steps.find((s) => s.state === 'executing') ||
      saga.steps.find((s) => s.state === 'pending');
    if (step) {
      step.error = reason || 'canceled';
      step.retryCount = step.maxRetries; // force failure
      this.updateSagaStep(workflowId, step.stepId, { state: 'failed', error: step.error });
    } else {
      // If no steps found, mark saga failed directly
      (saga as any).state = 'failed';
      await (this as any).initiateCompensation(saga);
    }
  }
}

// =============================================================================
// EVENT CORRELATION UTILITIES
// =============================================================================

/**
 * Add correlation context to any event
 */
export function correlateEvent<T extends BaseEvent>(
  event: T,
  context: CorrelationContext,
  causality: CorrelatedEvent['causality']
): T & CorrelatedEvent {
  return {
    ...event,
    correlationId: context.correlationId,
    traceId: context.traceId,
    spanId: context.spanId,
    rootRequestId: context.rootRequestId,
    causality,
    timestamp: (event as any).timestamp || Date.now(),
  } as T & CorrelatedEvent;
}

/**
 * Extract correlation context from correlated event
 */
export function extractCorrelationContext(event: CorrelatedEvent): CorrelationContext {
  return {
    correlationId: event.correlationId,
    rootRequestId: event.rootRequestId,
    traceId: event.traceId,
    spanId: event.spanId,
    timestamp: (event as any).timestamp || Date.now(),
    metadata: {},
  };
}

// =============================================================================
// GLOBAL INSTANCES
// =============================================================================

/**
 * Global saga manager instance
 */
export const globalSagaManager = new SagaWorkflowManager();

// =============================================================================
// INTERNAL TYPES & UTILITIES (for compatibility)
// =============================================================================

export interface RegisteredWorkflowDefinition {
  name: string;
  description: string;
  version: string;
  steps: Array<{
    name: string;
    type: string;
    timeout?: number;
    retries?: number;
  }>;
  compensationSteps?: Array<{
    name: string;
    type: string;
    timeout?: number;
  }>;
}

function inferWorkflowTypeFromName(name: string): SagaWorkflow['workflowType'] {
  if (name.includes('document') || name.includes('import')) return 'document-import';
  if (name.includes('coordination')) return 'cross-package-coordination';
  if (name.includes('artifact') || name.includes('safe')) return 'safe-artifact-creation';
  return 'cross-package-coordination';
}

function inferServiceFromType(type: string): SagaStep['service'] {
  if (type.includes('coordination')) return 'coordination';
  if (type.includes('document')) return 'document-intelligence';
  if (type.includes('safe') || type.includes('artifact')) return 'safe';
  if (type.includes('web')) return 'web-interface';
  return 'brain';
}
