/**
 * @file Type-Safe Event System Integration Examples
 *
 * Demonstrates how to use the type-safe event system with domain boundary validation
 * for various scenarios including AGUI integration, multi-agent coordination,
 * and cross-domain workflows.
 *
 * These examples show best practices for:
 * - Event-driven architecture implementation
 * - Domain boundary validation integration
 * - AGUI human validation workflows
 * - Performance-optimized event processing
 * - Error handling and recovery patterns
 */

import { getLogger } from '../config/logging-config.ts';
import type { Agent, Task } from '../coordination/types.ts';
import {
  Domain,
  type DomainBoundaryValidator,
  getDomainValidator,
} from '../core/domain-boundary-validator.ts';
import {
  type AGUIGateClosedEvent,
  type AGUIGateOpenedEvent,
  type AgentCreatedEvent,
  type BaseEvent,
  createCorrelationId,
  createEvent,
  createTypeSafeEventBus,
  type EventHandler,
  EventPriority,
  type EventSystemConfig,
  type HumanValidationCompletedEvent,
  type HumanValidationRequestedEvent,
  type TaskAssignedEvent,
  type TaskCompletedEvent,
  type TypeSafeEventBus,
  type WorkflowCompletedEvent,
  type WorkflowStartedEvent,
} from '../core/type-safe-event-system.ts';
import type {
  WorkflowContext,
  WorkflowDefinition,
} from '../workflows/types.ts';

const logger = getLogger('event-integration-examples');

// ============================================================================
// EXAMPLE 1: Basic Event System Setup with Domain Validation
// ============================================================================

/**
 * Example 1: Setting up a type-safe event bus with comprehensive configuration
 */
export async function createProductionEventBus(): Promise<TypeSafeEventBus> {
  const config: EventSystemConfig = {
    enableMetrics: true,
    enableCaching: true,
    domainValidation: true,
    maxEventHistory: 10000,
    defaultTimeout: 30000,
    maxConcurrency: 100,
    batchSize: 50,
    retryAttempts: 3,
    backoffMultiplier: 2,
  };

  const eventBus = createTypeSafeEventBus(config);
  await eventBus.initialize();

  logger.info('Production event bus created', { config });
  return eventBus;
}

// ============================================================================
// EXAMPLE 2: Multi-Agent Coordination with Event-Driven Architecture
// ============================================================================

/**
 * Example 2: Complete multi-agent coordination workflow using events
 */
export class EventDrivenCoordinationSystem {
  constructor(private eventBus: TypeSafeEventBus) {}

  async initializeCoordination(): Promise<void> {
    // Register handlers for agent lifecycle events
    this.eventBus.registerHandler(
      'agent.created',
      this.handleAgentCreated.bind(this),
    );
    this.eventBus.registerHandler(
      'agent.destroyed',
      this.handleAgentDestroyed.bind(this),
    );

    // Register handlers for task management events
    this.eventBus.registerHandler(
      'task.assigned',
      this.handleTaskAssigned.bind(this),
    );
    this.eventBus.registerHandler(
      'task.completed',
      this.handleTaskCompleted.bind(this),
    );

    // Register handlers for swarm state changes
    this.eventBus.registerHandler(
      'swarm.state.changed',
      this.handleSwarmStateChanged.bind(this),
    );

    logger.info('Event-driven coordination system initialized');
  }

  // Agent Creation Workflow
  async createAgent(agentConfig: {
    id: string;
    capabilities: string[];
    type: 'researcher' | 'coder' | 'analyst' | 'coordinator';
  }): Promise<Agent> {
    const correlationId = createCorrelationId();

    logger.info('Creating agent', { agentId: agentConfig.id, correlationId });

    // Create agent object
    const agent: Agent = {
      id: agentConfig.id,
      capabilities: agentConfig.capabilities,
      status: 'idle',
    };

    // Emit agent creation event
    const agentCreatedEvent: AgentCreatedEvent = createEvent(
      'agent.created',
      Domain.COORDINATION,
      {
        payload: {
          agent,
          capabilities: agent.capabilities,
          initialStatus: agent.status,
        },
      },
      {
        correlationId,
        source: 'coordination-system',
        priority: EventPriority.HIGH,
        tags: [`agent-type:${agentConfig.type}`, 'lifecycle:creation'],
      },
    );

    const result = await this.eventBus.emitEvent(agentCreatedEvent);

    if (!result.success) {
      throw new Error(
        `Failed to emit agent creation event: ${result.error?.message}`,
      );
    }

    logger.info('Agent created successfully', {
      agentId: agent.id,
      correlationId,
      processingTime: result.processingTime,
    });

    return agent;
  }

  // Task Assignment with Cross-Domain Validation
  async assignTask(taskId: string, agentId: string): Promise<void> {
    const correlationId = createCorrelationId();

    logger.info('Assigning task', { taskId, agentId, correlationId });

    // Create task object (simplified)
    const task: Task = {
      id: taskId,
      description: `Task ${taskId}`,
      strategy: 'adaptive',
      dependencies: [],
      requiredCapabilities: ['analysis'],
      maxAgents: 1,
      requireConsensus: false,
    };

    // Use cross-domain event routing to ensure proper validation
    const taskAssignedEvent: TaskAssignedEvent = createEvent(
      'task.assigned',
      Domain.COORDINATION,
      {
        payload: {
          task,
          agentId,
          assignmentTime: new Date(),
        },
      },
      {
        correlationId,
        source: 'task-coordinator',
        priority: EventPriority.NORMAL,
      },
    );

    // Route the event from workflows domain to coordination domain
    const result = await this.eventBus.routeCrossDomainEvent(
      taskAssignedEvent,
      Domain.WORKFLOWS,
      Domain.COORDINATION,
      'task_assignment',
    );

    if (!result.success) {
      logger.error('Task assignment failed', {
        taskId,
        agentId,
        error: result.error?.message,
        correlationId,
      });
      throw new Error(`Task assignment failed: ${result.error?.message}`);
    }

    logger.info('Task assigned successfully', {
      taskId,
      agentId,
      correlationId,
      crossingId: result.metadata?.crossingId,
    });
  }

  // Event handlers with comprehensive error handling
  private async handleAgentCreated(event: AgentCreatedEvent): Promise<void> {
    const { agent, capabilities } = event.payload;

    logger.info('Processing agent creation', {
      agentId: agent.id,
      capabilities,
      correlationId: event.metadata?.correlationId,
    });

    try {
      // Validate agent creation with domain boundary validator
      const validator = getDomainValidator(Domain.COORDINATION);

      // Track the domain crossing for monitoring
      validator.trackCrossings(
        Domain.CORE,
        Domain.COORDINATION,
        'agent_creation',
      );

      // Additional business logic would go here
      // e.g., register agent in registry, allocate resources, etc.

      logger.debug('Agent creation processed successfully', {
        agentId: agent.id,
        status: agent.status,
      });
    } catch (error) {
      logger.error('Agent creation processing failed', {
        agentId: agent.id,
        error: error instanceof Error ? error.message : String(error),
        correlationId: event.metadata?.correlationId,
      });

      // Emit error event for monitoring
      await this.eventBus.emitEvent(
        createEvent(
          'error.occurred',
          Domain.CORE,
          {
            payload: {
              error: error instanceof Error ? error : new Error(String(error)),
              context: { operation: 'agent_creation', agentId: agent.id },
              severity: 'high' as const,
              recoverable: true,
            },
          },
          { correlationId: event.metadata?.correlationId },
        ),
      );
    }
  }

  private async handleAgentDestroyed(event: any): Promise<void> {
    const { agentId, reason } = event.payload;

    logger.info('Processing agent destruction', { agentId, reason });

    // Clean up resources, update registries, etc.
    // This is where cleanup logic would go
  }

  private async handleTaskAssigned(event: TaskAssignedEvent): Promise<void> {
    const { task, agentId, assignmentTime } = event.payload;

    logger.info('Processing task assignment', {
      taskId: task.id,
      agentId,
      assignmentTime,
      correlationId: event.metadata?.correlationId,
    });

    // Here you would:
    // 1. Validate agent capabilities against task requirements
    // 2. Update agent status to 'busy'
    // 3. Start task execution monitoring
    // 4. Set up timeout handling

    // Simulate task completion after some processing
    setTimeout(async () => {
      const taskCompletedEvent: TaskCompletedEvent = createEvent(
        'task.completed',
        Domain.COORDINATION,
        {
          payload: {
            taskId: task.id,
            agentId,
            result: {
              status: 'completed',
              output: 'Task completed successfully',
            },
            duration: 5000,
            success: true,
          },
        },
        {
          correlationId: event.metadata?.correlationId,
          causationId: event.id,
          source: 'task-executor',
        },
      );

      await this.eventBus.emitEvent(taskCompletedEvent);
    }, 1000);
  }

  private async handleTaskCompleted(event: TaskCompletedEvent): Promise<void> {
    const { taskId, agentId, result, duration, success } = event.payload;

    logger.info('Processing task completion', {
      taskId,
      agentId,
      success,
      duration,
      correlationId: event.metadata?.correlationId,
    });

    // Update agent status back to 'idle'
    // Record task metrics
    // Trigger next task in workflow if applicable
  }

  private async handleSwarmStateChanged(event: any): Promise<void> {
    const { swarmId, previousState, newState, agentCount } = event.payload;

    logger.info('Processing swarm state change', {
      swarmId,
      previousState,
      newState,
      agentCount,
    });

    // React to swarm state changes
    // Update load balancing, scaling decisions, etc.
  }
}

// ============================================================================
// EXAMPLE 3: AGUI Human Validation Workflow
// ============================================================================

/**
 * Example 3: AGUI integration for human validation workflows
 */
export class AGUIValidationSystem {
  private pendingValidations = new Map<
    string,
    {
      requestId: string;
      context: any;
      timeout: NodeJS.Timeout;
      resolve: (approved: boolean) => void;
    }
  >();

  constructor(private eventBus: TypeSafeEventBus) {}

  async initializeAGUI(): Promise<void> {
    // Register AGUI event handlers
    this.eventBus.registerHandler(
      'human.validation.requested',
      this.handleValidationRequest.bind(this),
    );
    this.eventBus.registerHandler(
      'human.validation.completed',
      this.handleValidationCompleted.bind(this),
    );
    this.eventBus.registerHandler(
      'agui.gate.opened',
      this.handleGateOpened.bind(this),
    );
    this.eventBus.registerHandler(
      'agui.gate.closed',
      this.handleGateClosed.bind(this),
    );

    logger.info('AGUI validation system initialized');
  }

  // Request human validation with type safety
  async requestHumanValidation(
    validationType: 'approval' | 'selection' | 'input' | 'review',
    context: any,
    options: {
      priority?: EventPriority;
      timeout?: number;
      correlationId?: string;
    } = {},
  ): Promise<{ approved: boolean; input?: any; feedback?: string }> {
    const requestId = `val-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const correlationId = options.correlationId || createCorrelationId();
    const timeout = options.timeout || 300000; // 5 minutes default

    logger.info('Requesting human validation', {
      requestId,
      validationType,
      priority: options.priority,
      correlationId,
    });

    // Create validation request event
    const validationRequest: HumanValidationRequestedEvent = createEvent(
      'human.validation.requested',
      Domain.INTERFACES,
      {
        payload: {
          requestId,
          validationType,
          context,
          priority: options.priority || EventPriority.NORMAL,
          timeout,
        },
      },
      {
        correlationId,
        source: 'agui-validation-system',
        priority: options.priority || EventPriority.NORMAL,
      },
    );

    // Emit the validation request
    const result = await this.eventBus.emitEvent(validationRequest);

    if (!result.success) {
      throw new Error(
        `Failed to request human validation: ${result.error?.message}`,
      );
    }

    // Return a promise that resolves when validation is completed
    return new Promise((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        this.pendingValidations.delete(requestId);
        reject(new Error('Human validation timeout'));
      }, timeout);

      this.pendingValidations.set(requestId, {
        requestId,
        context,
        timeout: timeoutHandle,
        resolve: (approved: boolean) => {
          clearTimeout(timeoutHandle);
          resolve({ approved, input: null, feedback: null });
        },
      });
    });
  }

  // AGUI Gate Pattern for controlled operations
  async openAGUIGate(
    gateType: string,
    context: any,
    requiresApproval: boolean = true,
  ): Promise<{ approved: boolean; duration: number; humanInput?: any }> {
    const gateId = `gate-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const correlationId = createCorrelationId();

    logger.info('Opening AGUI gate', {
      gateId,
      gateType,
      requiresApproval,
      correlationId,
    });

    // Emit gate opened event
    const gateOpenedEvent: AGUIGateOpenedEvent = createEvent(
      'agui.gate.opened',
      Domain.INTERFACES,
      {
        payload: {
          gateId,
          gateType,
          requiredApproval: requiresApproval,
          context,
        },
      },
      { correlationId, source: 'agui-gate-system' },
    );

    const result = await this.eventBus.emitEvent(gateOpenedEvent);

    if (!result.success) {
      throw new Error(`Failed to open AGUI gate: ${result.error?.message}`);
    }

    // If approval is not required, immediately close the gate
    if (!requiresApproval) {
      const closeResult = await this.closeAGUIGate(
        gateId,
        true,
        0,
        correlationId,
      );
      return closeResult;
    }

    // Wait for human approval (in a real system, this would be handled by UI)
    return new Promise((resolve) => {
      setTimeout(() => {
        this.closeAGUIGate(gateId, true, 5000, correlationId).then(resolve);
      }, 100); // Simulate quick approval for demo
    });
  }

  private async closeAGUIGate(
    gateId: string,
    approved: boolean,
    duration: number,
    correlationId: string,
    humanInput?: any,
  ): Promise<{ approved: boolean; duration: number; humanInput?: any }> {
    const gateClosedEvent: AGUIGateClosedEvent = createEvent(
      'agui.gate.closed',
      Domain.INTERFACES,
      {
        payload: {
          gateId,
          approved,
          duration,
          humanInput,
        },
      },
      { correlationId, source: 'agui-gate-system' },
    );

    await this.eventBus.emitEvent(gateClosedEvent);

    return { approved, duration, humanInput };
  }

  // Event handlers
  private async handleValidationRequest(
    event: HumanValidationRequestedEvent,
  ): Promise<void> {
    const { requestId, validationType, context, priority } = event.payload;

    logger.info('Processing validation request', {
      requestId,
      validationType,
      priority,
      correlationId: event.metadata?.correlationId,
    });

    // In a real implementation, this would:
    // 1. Display validation UI to human operator
    // 2. Wait for human response
    // 3. Emit validation completed event with response

    // For demo purposes, simulate approval after short delay
    setTimeout(async () => {
      const completedEvent: HumanValidationCompletedEvent = createEvent(
        'human.validation.completed',
        Domain.INTERFACES,
        {
          payload: {
            requestId,
            approved: true,
            processingTime: 2000,
            feedback: 'Approved by human operator',
          },
        },
        {
          correlationId: event.metadata?.correlationId,
          causationId: event.id,
          source: 'human-operator',
        },
      );

      await this.eventBus.emitEvent(completedEvent);
    }, 100);
  }

  private async handleValidationCompleted(
    event: HumanValidationCompletedEvent,
  ): Promise<void> {
    const { requestId, approved, feedback } = event.payload;

    logger.info('Processing validation completion', {
      requestId,
      approved,
      feedback,
      correlationId: event.metadata?.correlationId,
    });

    // Resolve pending validation promise
    const pending = this.pendingValidations.get(requestId);
    if (pending) {
      pending.resolve(approved);
      this.pendingValidations.delete(requestId);
    }
  }

  private async handleGateOpened(event: AGUIGateOpenedEvent): Promise<void> {
    const { gateId, gateType, requiredApproval, context } = event.payload;

    logger.info('Processing gate opened', {
      gateId,
      gateType,
      requiredApproval,
      correlationId: event.metadata?.correlationId,
    });

    // Gate opening logic would go here
    // For example: UI rendering, notification sending, etc.
  }

  private async handleGateClosed(event: AGUIGateClosedEvent): Promise<void> {
    const { gateId, approved, duration } = event.payload;

    logger.info('Processing gate closed', {
      gateId,
      approved,
      duration,
      correlationId: event.metadata?.correlationId,
    });

    // Gate closure logic would go here
    // For example: cleanup, metrics recording, etc.
  }
}

// ============================================================================
// EXAMPLE 4: Cross-Domain Workflow with Event Orchestration
// ============================================================================

/**
 * Example 4: Complex workflow orchestration across multiple domains
 */
export class CrossDomainWorkflowOrchestrator {
  constructor(private eventBus: TypeSafeEventBus) {}

  async initializeOrchestrator(): Promise<void> {
    // Register workflow event handlers
    this.eventBus.registerHandler(
      'workflow.started',
      this.handleWorkflowStarted.bind(this),
    );
    this.eventBus.registerHandler(
      'workflow.completed',
      this.handleWorkflowCompleted.bind(this),
    );
    this.eventBus.registerHandler(
      'workflow.failed',
      this.handleWorkflowFailed.bind(this),
    );
    this.eventBus.registerHandler(
      'workflow.step.completed',
      this.handleWorkflowStepCompleted.bind(this),
    );

    logger.info('Cross-domain workflow orchestrator initialized');
  }

  // Execute a complex workflow that spans multiple domains
  async executeComplexWorkflow(
    workflowId: string,
    definition: WorkflowDefinition,
    context: WorkflowContext,
  ): Promise<{ success: boolean; result?: any; error?: Error }> {
    const correlationId = createCorrelationId();

    logger.info('Starting complex workflow execution', {
      workflowId,
      correlationId,
    });

    try {
      // 1. Start workflow in workflows domain
      const workflowStartedEvent: WorkflowStartedEvent = createEvent(
        'workflow.started',
        Domain.WORKFLOWS,
        {
          payload: {
            workflowId,
            definition,
            context,
            startTime: new Date(),
          },
        },
        { correlationId, source: 'workflow-orchestrator' },
      );

      let result = await this.eventBus.emitEvent(workflowStartedEvent);
      if (!result.success) {
        throw new Error(`Failed to start workflow: ${result.error?.message}`);
      }

      // 2. Coordinate with coordination domain for agent allocation
      const agentAllocationEvent = createEvent(
        'agent.allocation.requested',
        Domain.COORDINATION,
        {
          payload: {
            workflowId,
            requiredCapabilities: ['workflow-execution'],
            agentCount: 2,
          },
        },
        { correlationId, causationId: workflowStartedEvent.id },
      );

      result = await this.eventBus.routeCrossDomainEvent(
        agentAllocationEvent,
        Domain.WORKFLOWS,
        Domain.COORDINATION,
        'agent_allocation',
      );

      if (!result.success) {
        throw new Error(`Failed to allocate agents: ${result.error?.message}`);
      }

      // 3. Request human validation via AGUI if needed
      const validationEvent: HumanValidationRequestedEvent = createEvent(
        'human.validation.requested',
        Domain.INTERFACES,
        {
          payload: {
            requestId: `workflow-${workflowId}-validation`,
            validationType: 'approval',
            context: { workflow: workflowId, step: 'execution-approval' },
            priority: EventPriority.HIGH,
            timeout: 30000,
          },
        },
        { correlationId },
      );

      result = await this.eventBus.routeCrossDomainEvent(
        validationEvent,
        Domain.WORKFLOWS,
        Domain.INTERFACES,
        'human_validation',
      );

      if (!result.success) {
        throw new Error(
          `Failed to request validation: ${result.error?.message}`,
        );
      }

      // 4. Execute workflow steps with neural optimization
      const neuralOptimizationEvent = createEvent(
        'optimization.requested',
        Domain.NEURAL,
        {
          payload: {
            workflowId,
            optimizationType: 'execution-path',
            parameters: { accuracy: 0.95, speed: 'high' },
          },
        },
        { correlationId },
      );

      result = await this.eventBus.routeCrossDomainEvent(
        neuralOptimizationEvent,
        Domain.WORKFLOWS,
        Domain.NEURAL,
        'neural_optimization',
      );

      // 5. Store results in database domain
      const dataStorageEvent = createEvent(
        'data.storage.requested',
        Domain.DATABASE,
        {
          payload: {
            workflowId,
            data: { status: 'completed', timestamp: new Date() },
            collection: 'workflow-results',
          },
        },
        { correlationId },
      );

      await this.eventBus.routeCrossDomainEvent(
        dataStorageEvent,
        Domain.WORKFLOWS,
        Domain.DATABASE,
        'result_storage',
      );

      logger.info('Complex workflow completed successfully', {
        workflowId,
        correlationId,
      });

      return { success: true, result: { workflowId, status: 'completed' } };
    } catch (error) {
      logger.error('Complex workflow execution failed', {
        workflowId,
        correlationId,
        error: error instanceof Error ? error.message : String(error),
      });

      // Emit workflow failure event
      const failureEvent = createEvent(
        'workflow.failed',
        Domain.WORKFLOWS,
        {
          payload: {
            workflowId,
            error: error instanceof Error ? error : new Error(String(error)),
            failedStep: 0,
          },
        },
        { correlationId },
      );

      await this.eventBus.emitEvent(failureEvent);

      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  // Event handlers for workflow orchestration
  private async handleWorkflowStarted(
    event: WorkflowStartedEvent,
  ): Promise<void> {
    const { workflowId, definition, startTime } = event.payload;

    logger.info('Processing workflow start', {
      workflowId,
      startTime,
      correlationId: event.metadata?.correlationId,
    });

    // Initialize workflow execution state
    // Set up monitoring and tracking
  }

  private async handleWorkflowCompleted(
    event: WorkflowCompletedEvent,
  ): Promise<void> {
    const { workflowId, result, duration } = event.payload;

    logger.info('Processing workflow completion', {
      workflowId,
      duration,
      correlationId: event.metadata?.correlationId,
    });

    // Clean up resources
    // Record metrics
    // Notify stakeholders
  }

  private async handleWorkflowFailed(
    event: WorkflowFailedEvent,
  ): Promise<void> {
    const { workflowId, error, failedStep } = event.payload;

    logger.error('Processing workflow failure', {
      workflowId,
      failedStep,
      error: error.message,
      correlationId: event.metadata?.correlationId,
    });

    // Implement failure recovery
    // Clean up partial state
    // Notify administrators
  }

  private async handleWorkflowStepCompleted(
    event: WorkflowStepCompletedEvent,
  ): Promise<void> {
    const { workflowId, stepIndex, stepResult } = event.payload;

    logger.debug('Processing workflow step completion', {
      workflowId,
      stepIndex,
      correlationId: event.metadata?.correlationId,
    });

    // Update workflow progress
    // Trigger next step
  }
}

// ============================================================================
// EXAMPLE 5: Performance Monitoring and Analytics
// ============================================================================

/**
 * Example 5: Comprehensive performance monitoring with event analytics
 */
export class EventSystemAnalytics {
  private metricsCollectionInterval?: NodeJS.Timeout;

  constructor(private eventBus: TypeSafeEventBus) {}

  async startMonitoring(intervalMs: number = 10000): Promise<void> {
    logger.info('Starting event system analytics', { intervalMs });

    // Register handlers for all events to collect analytics
    this.eventBus.registerWildcardHandler(
      this.collectEventAnalytics.bind(this),
      {
        priority: -1, // Low priority so it runs after business logic
        trackMetrics: false, // Don't track metrics for metrics collection
      },
    );

    // Set up periodic metrics reporting
    this.metricsCollectionInterval = setInterval(() => {
      this.reportMetrics();
    }, intervalMs);

    logger.info('Event system analytics started');
  }

  async stopMonitoring(): Promise<void> {
    if (this.metricsCollectionInterval) {
      clearInterval(this.metricsCollectionInterval);
    }

    logger.info('Event system analytics stopped');
  }

  private async collectEventAnalytics(event: BaseEvent): Promise<void> {
    // Collect event patterns, frequencies, and performance data
    // This would typically send data to a monitoring service

    logger.debug('Collecting event analytics', {
      eventType: event.type,
      domain: event.domain,
      timestamp: event.timestamp,
      correlationId: event.metadata?.correlationId,
    });
  }

  private reportMetrics(): void {
    const metrics = this.eventBus.getMetrics();
    const performanceStats = this.eventBus.getPerformanceStats();

    logger.info('Event system metrics report', {
      totalEvents: metrics.totalEvents,
      eventsPerSecond: metrics.eventsPerSecond,
      averageProcessingTime: metrics.averageProcessingTime,
      failureRate: metrics.failureRate,
      handlerCount: metrics.handlerCount,
      memoryUsage: metrics.memoryUsage,
      cacheHitRate: metrics.cacheHitRate,
      domainEventCounts: metrics.domainEventCounts,
      performanceStats: Object.keys(performanceStats).length,
    });

    // In a production system, you would:
    // 1. Send these metrics to a monitoring service (Prometheus, DataDog, etc.)
    // 2. Set up alerting for anomalies
    // 3. Create dashboards for visualization
    // 4. Store historical data for trend analysis
  }

  // Get comprehensive analytics report
  getAnalyticsReport(): {
    metrics: any;
    performanceStats: any;
    eventHistory: BaseEvent[];
    recommendations: string[];
  } {
    const metrics = this.eventBus.getMetrics();
    const performanceStats = this.eventBus.getPerformanceStats();
    const eventHistory = this.eventBus.queryEvents({ limit: 100 });

    const recommendations: string[] = [];

    // Generate recommendations based on metrics
    if (metrics.failureRate > 0.05) {
      recommendations.push(
        'High failure rate detected. Consider reviewing error handling.',
      );
    }

    if (metrics.averageProcessingTime > 1000) {
      recommendations.push(
        'High average processing time. Consider optimizing handlers.',
      );
    }

    if (metrics.memoryUsage > 50000000) {
      // 50MB
      recommendations.push(
        'High memory usage. Consider reducing event history size.',
      );
    }

    return {
      metrics,
      performanceStats,
      eventHistory,
      recommendations,
    };
  }
}

// ============================================================================
// EXAMPLE 6: Complete Integration Usage
// ============================================================================

/**
 * Example 6: Complete system integration demonstrating all features
 */
export async function demonstrateCompleteIntegration(): Promise<void> {
  logger.info('Starting complete event system integration demonstration');

  try {
    // 1. Create production event bus
    const eventBus = await createProductionEventBus();

    // 2. Initialize all subsystems
    const coordinationSystem = new EventDrivenCoordinationSystem(eventBus);
    const aguiSystem = new AGUIValidationSystem(eventBus);
    const workflowOrchestrator = new CrossDomainWorkflowOrchestrator(eventBus);
    const analytics = new EventSystemAnalytics(eventBus);

    await coordinationSystem.initializeCoordination();
    await aguiSystem.initializeAGUI();
    await workflowOrchestrator.initializeOrchestrator();
    await analytics.startMonitoring(5000);

    // 3. Demonstrate multi-agent coordination
    logger.info('Demonstrating multi-agent coordination');
    const agent = await coordinationSystem.createAgent({
      id: 'demo-agent-1',
      capabilities: ['analysis', 'coordination'],
      type: 'analyst',
    });

    await coordinationSystem.assignTask('demo-task-1', agent.id);

    // 4. Demonstrate AGUI human validation
    logger.info('Demonstrating AGUI human validation');
    const validationResult = await aguiSystem.requestHumanValidation(
      'approval',
      { action: 'deploy', environment: 'demo' },
      { priority: EventPriority.HIGH, timeout: 10000 },
    );

    logger.info('Human validation result', { validationResult });

    // 5. Demonstrate AGUI gate pattern
    const gateResult = await aguiSystem.openAGUIGate(
      'deployment-gate',
      { target: 'demo-environment' },
      true,
    );

    logger.info('AGUI gate result', { gateResult });

    // 6. Demonstrate cross-domain workflow
    const workflowDefinition: WorkflowDefinition = {
      id: 'demo-workflow',
      name: 'Demo Workflow',
      version: '1.0.0',
    } as WorkflowDefinition;

    const workflowContext: WorkflowContext = {
      workflowId: 'demo-workflow',
      variables: { demo: true },
    } as WorkflowContext;

    const workflowResult = await workflowOrchestrator.executeComplexWorkflow(
      'demo-workflow',
      workflowDefinition,
      workflowContext,
    );

    logger.info('Workflow execution result', { workflowResult });

    // 7. Generate analytics report
    const analyticsReport = analytics.getAnalyticsReport();
    logger.info('Analytics report generated', {
      totalEvents: analyticsReport.metrics.totalEvents,
      recommendations: analyticsReport.recommendations,
    });

    // 8. Clean shutdown
    await analytics.stopMonitoring();
    await eventBus.shutdown();

    logger.info(
      'Complete event system integration demonstration completed successfully',
    );
  } catch (error) {
    logger.error('Integration demonstration failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  EventDrivenCoordinationSystem,
  AGUIValidationSystem,
  CrossDomainWorkflowOrchestrator,
  EventSystemAnalytics,
};

// Example usage function for testing
export async function runExamples(): Promise<void> {
  try {
    await demonstrateCompleteIntegration();
  } catch (error) {
    console.error('Examples failed:', error);
    process.exit(1);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  runExamples();
}
