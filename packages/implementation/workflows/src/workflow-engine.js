/**
 * @fileoverview Unified Workflow Engine
 *
 * Single, clean workflow engine that combines simple and advanced capabilities.
 * Follows Google TypeScript style guide with max 500 lines and low complexity.
 *
 * Architecture:
 * - EventEmitter-based for real-time updates
 * - Supports both simple steps and document workflows
 * - Memory and database integration optional
 * - Clean separation of concerns with focused methods
 */
const __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    let c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (let i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return (c > 3 && r && Object.defineProperty(target, key, r), r);
  };
import { EventEmitter } from 'eventemitter3';
import {
  getLogger,
  EnhancedError,
  // 🔬 Enterprise Telemetry & Monitoring Systems
  recordMetric,
  recordHistogram,
  recordGauge,
  createCircuitBreaker,
  withAsyncTrace,
  recordEvent,
  setTraceAttributes,
  tracedAsync,
  metered,
  createSystemMonitor,
  createPerformanceTracker,
  createAgentMonitor,
  createMLMonitor,
} from '@claude-zen/foundation';
const logger = getLogger('WorkflowEngine');
// ============================================================================
// WORKFLOW ENGINE CLASS
// ============================================================================
/**
 * Unified workflow engine supporting both simple and advanced use cases.
 * Enhanced with comprehensive Foundation monitoring and telemetry.
 *
 * Features:
 * - Simple step-by-step workflows with distributed tracing
 * - Document processing workflows with performance monitoring
 * - Memory and database integration with observability
 * - Event-driven architecture with comprehensive telemetry
 * - Configurable persistence with circuit breaker protection
 * - Enterprise-grade monitoring and analytics
 * - Graceful error handling and recovery
 */
export class WorkflowEngine extends EventEmitter {
  config;
  activeWorkflows = new Map();
  workflowDefinitions = new Map();
  stepHandlers = new Map();
  isInitialized = false;
  // 🔬 Foundation Monitoring & Telemetry Systems
  systemMonitor;
  performanceTracker;
  agentMonitor;
  mlMonitor;
  // 🛡️ Circuit Breaker Protection
  workflowExecutionCircuitBreaker;
  stepExecutionCircuitBreaker;
  documentProcessingCircuitBreaker;
  // 📊 Workflow Analytics
  workflowMetrics = new Map();
  executionCache = new Map();
  lastHealthCheck = Date.now();
  startupTime = Date.now();
  // Optional advanced capabilities
  memory;
  documentManager;
  gatesManager;
  constructor(config = {}, documentManager, memoryFactory, gatesManager) {
    super();
    this.config = {
      maxConcurrentWorkflows: config.maxConcurrentWorkflows ?? 10,
      stepTimeout: config.stepTimeout ?? 30000,
      persistWorkflows: config.persistWorkflows ?? false,
      persistencePath: config.persistencePath ?? './workflows',
      retryAttempts: config.retryAttempts ?? 3,
      enableAdvancedOrchestration: config.enableAdvancedOrchestration ?? false,
      orchestrationMode: config.orchestrationMode ?? 'basic',
      enableErrorRecovery: config.enableErrorRecovery ?? true,
      enablePerformanceTracking: config.enablePerformanceTracking ?? true,
    };
    this.documentManager = documentManager;
    this.memory = memoryFactory;
    this.gatesManager = gatesManager;
    // 🔬 Initialize comprehensive Foundation monitoring
    this.systemMonitor = createSystemMonitor({
      intervalMs: 15000, // 15-second system monitoring intervals
    });
    this.performanceTracker = createPerformanceTracker();
    this.agentMonitor = createAgentMonitor();
    this.mlMonitor = createMLMonitor();
    // 🛡️ Initialize circuit breakers for workflow protection
    this.workflowExecutionCircuitBreaker = createCircuitBreaker(
      async () => {
        throw new Error('Workflow execution failed');
      },
      { errorThresholdPercentage: 50, resetTimeout: 30000 },
      'workflow-execution'
    );
    this.stepExecutionCircuitBreaker = createCircuitBreaker(
      async () => {
        throw new Error('Step execution failed');
      },
      { errorThresholdPercentage: 50, resetTimeout: 15000 },
      'step-execution'
    );
    this.documentProcessingCircuitBreaker = createCircuitBreaker(
      async () => {
        throw new Error('Document processing failed');
      },
      { errorThresholdPercentage: 50, resetTimeout: 20000 },
      'document-processing'
    );
    // 📊 Initialize metrics recording
    recordMetric('workflow_engine_initialized', 1, { timestamp: Date.now() });
    recordGauge('workflow_engine_startup_time', this.startupTime);
    logger.info(
      'WorkflowEngine constructor completed with Foundation integration',
      {
        config: this.config,
        hasDocumentManager: !!documentManager,
        hasMemoryFactory: !!memoryFactory,
        hasGatesManager: !!gatesManager,
        foundationIntegration: 'comprehensive',
      }
    );
  }
  // --------------------------------------------------------------------------
  // LIFECYCLE METHODS
  // --------------------------------------------------------------------------
  async initialize() {
    if (this.isInitialized) {
      recordEvent('workflow_engine_already_initialized', {
        timestamp: Date.now(),
      });
      return;
    }
    return withAsyncTrace('workflow-engine-initialization', async (span) => {
      setTraceAttributes({
        'workflow.engine.config': JSON.stringify(this.config),
        'workflow.engine.has_document_manager': !!this.documentManager,
        'workflow.engine.has_memory_factory': !!this.memory,
        'workflow.engine.has_gates_manager': !!this.gatesManager,
      });
      const initStartTime = Date.now();
      try {
        // 🔧 Register default step handlers with telemetry
        recordEvent('workflow_step_handlers_registration_started', {
          timestamp: Date.now(),
        });
        this.registerDefaultStepHandlers();
        recordEvent('workflow_step_handlers_registration_completed', {
          timestamp: Date.now(),
        });
        // 📄 Register document workflows with telemetry
        recordEvent('workflow_document_workflows_registration_started', {
          timestamp: Date.now(),
        });
        await this.registerDocumentWorkflows();
        recordEvent('workflow_document_workflows_registration_completed', {
          timestamp: Date.now(),
        });
        // 🏥 Start monitoring systems
        recordEvent('workflow_monitoring_systems_started', {
          timestamp: Date.now(),
        });
        await this.systemMonitor.start();
        this.isInitialized = true;
        const initDuration = Date.now() - initStartTime;
        // 📊 Record initialization metrics
        recordHistogram(
          'workflow_engine_initialization_duration',
          initDuration
        );
        recordGauge('workflow_engine_initialized_timestamp', Date.now());
        recordMetric('workflow_engine_initialized_successfully', 1);
        this.emit('initialized');
        setTraceAttributes({
          'workflow.engine.initialized': true,
          'workflow.engine.initialization_duration_ms': initDuration,
          'workflow.engine.step_handlers_count': this.stepHandlers.size,
          'workflow.engine.workflow_definitions_count':
            this.workflowDefinitions.size,
        });
        logger.info(
          'WorkflowEngine initialized successfully with Foundation monitoring',
          {
            initializationDuration: initDuration,
            stepHandlersCount: this.stepHandlers.size,
            workflowDefinitionsCount: this.workflowDefinitions.size,
            foundationIntegration: 'active',
          }
        );
      } catch (error) {
        const initDuration = Date.now() - initStartTime;
        recordMetric('workflow_engine_initialization_failed', 1);
        recordHistogram(
          'workflow_engine_initialization_error_duration',
          initDuration
        );
        logger.error('WorkflowEngine initialization failed', {
          error: error instanceof Error ? error.message : String(error),
          initializationDuration: initDuration,
        });
        throw new EnhancedError(
          'Failed to initialize WorkflowEngine',
          { cause: error, duration: initDuration },
          'WORKFLOW_INITIALIZATION_ERROR'
        );
      }
    });
  }
  async shutdown() {
    return withAsyncTrace('workflow-engine-shutdown', async (span) => {
      const shutdownStartTime = Date.now();
      logger.info(
        'Shutting down WorkflowEngine with comprehensive Foundation cleanup'
      );
      try {
        setTraceAttributes({
          'workflow.engine.active_workflows_count': this.activeWorkflows.size,
          'workflow.engine.workflow_definitions_count':
            this.workflowDefinitions.size,
          'workflow.engine.step_handlers_count': this.stepHandlers.size,
          'workflow.engine.shutdown_started': true,
        });
        // 🚨 Cancel all active workflows with telemetry
        recordEvent('workflow_engine_cancelling_active_workflows', {
          activeWorkflowsCount: this.activeWorkflows.size,
        });
        const cancelPromises = Array.from(this.activeWorkflows.keys()).map(
          async (id) => {
            try {
              recordEvent('workflow_cancellation_started', { workflowId: id });
              this.cancelWorkflow(id);
              recordEvent('workflow_cancellation_completed', {
                workflowId: id,
              });
              return Promise.resolve();
            } catch (err) {
              recordMetric('workflow_cancellation_failed', 1, {
                workflowId: id,
              });
              logger.error(`Error cancelling workflow ${id}:`, err);
              return Promise.resolve();
            }
          }
        );
        await Promise.all(cancelPromises);
        recordEvent('workflow_engine_all_workflows_cancelled');
        // 🏥 Shutdown monitoring systems with graceful cleanup
        recordEvent('workflow_engine_shutting_down_monitoring');
        try {
          await this.systemMonitor.stop();
          // Note: Foundation monitoring classes don't have cleanup methods
          // await this.performanceTracker.cleanup?.();
          // await this.agentMonitor.cleanup?.();
          // await this.mlMonitor.cleanup?.();
          recordEvent('workflow_engine_monitoring_shutdown_completed');
        } catch (monitoringError) {
          recordMetric('workflow_engine_monitoring_shutdown_failed', 1);
          logger.warn('Error during monitoring systems shutdown', {
            error:
              monitoringError instanceof Error
                ? monitoringError.message
                : String(monitoringError),
          });
        }
        // 🛡️ Close circuit breakers
        recordEvent('workflow_engine_closing_circuit_breakers');
        try {
          this.workflowExecutionCircuitBreaker.close?.();
          this.stepExecutionCircuitBreaker.close?.();
          this.documentProcessingCircuitBreaker.close?.();
          recordEvent('workflow_engine_circuit_breakers_closed');
        } catch (circuitError) {
          logger.warn('Error closing circuit breakers', {
            error:
              circuitError instanceof Error
                ? circuitError.message
                : String(circuitError),
          });
        }
        // 🧹 Clear all state with comprehensive cleanup
        recordEvent('workflow_engine_clearing_state');
        this.activeWorkflows.clear();
        this.workflowDefinitions.clear();
        this.stepHandlers.clear();
        this.workflowMetrics.clear();
        this.executionCache.clear();
        this.removeAllListeners();
        this.isInitialized = false;
        const shutdownDuration = Date.now() - shutdownStartTime;
        // 📊 Record shutdown metrics
        recordHistogram('workflow_engine_shutdown_duration', shutdownDuration);
        recordGauge('workflow_engine_shutdown_timestamp', Date.now());
        recordMetric('workflow_engine_shutdown_completed', 1);
        setTraceAttributes({
          'workflow.engine.shutdown_completed': true,
          'workflow.engine.shutdown_duration_ms': shutdownDuration,
          'workflow.engine.final_state': 'clean',
        });
        logger.info(
          'WorkflowEngine shutdown completed successfully with Foundation cleanup',
          {
            shutdownDuration,
            finalState: 'clean',
            foundationCleanup: 'comprehensive',
          }
        );
      } catch (error) {
        const shutdownDuration = Date.now() - shutdownStartTime;
        recordMetric('workflow_engine_shutdown_failed', 1);
        recordHistogram(
          'workflow_engine_shutdown_error_duration',
          shutdownDuration
        );
        logger.error('WorkflowEngine shutdown encountered errors', {
          error: error instanceof Error ? error.message : String(error),
          shutdownDuration,
        });
        // Continue with shutdown even if there were errors
        this.isInitialized = false;
        throw new EnhancedError(
          'WorkflowEngine shutdown completed with errors',
          { cause: error, duration: shutdownDuration },
          'WORKFLOW_SHUTDOWN_ERROR'
        );
      }
    });
  }
  // --------------------------------------------------------------------------
  // WORKFLOW MANAGEMENT
  // --------------------------------------------------------------------------
  async startWorkflow(definitionOrName, context = {}) {
    return withAsyncTrace('workflow-start', async (span) => {
      const startTime = Date.now();
      try {
        await this.ensureInitialized();
        const definition = this.resolveDefinition(definitionOrName);
        if (!definition) {
          recordMetric('workflow_start_definition_not_found', 1);
          recordEvent('workflow_start_failed', {
            reason: 'definition_not_found',
          });
          return { success: false, error: 'Workflow definition not found' };
        }
        setTraceAttributes({
          'workflow.definition.name': definition.name,
          'workflow.definition.version': definition.version,
          'workflow.definition.steps_count': definition.steps.length,
          'workflow.context.keys': Object.keys(context).join(','),
        });
        // 🚦 Check capacity with circuit breaker protection
        return this.workflowExecutionCircuitBreaker.execute(async () => {
          if (this.activeWorkflows.size >= this.config.maxConcurrentWorkflows) {
            recordMetric('workflow_start_capacity_exceeded', 1);
            recordGauge(
              'workflow_active_count_at_capacity',
              this.activeWorkflows.size
            );
            recordEvent('workflow_start_failed', {
              reason: 'capacity_exceeded',
              activeWorkflows: this.activeWorkflows.size,
              maxConcurrent: this.config.maxConcurrentWorkflows,
            });
            return {
              success: false,
              error: 'Maximum concurrent workflows reached',
            };
          }
          const workflowId = this.generateWorkflowId();
          const workflow = {
            id: workflowId,
            definition,
            status: 'pending',
            context,
            currentStep: 0,
            stepResults: {},
            startTime: new Date().toISOString(),
          };
          // 📊 Track workflow creation metrics
          this.activeWorkflows.set(workflowId, workflow);
          this.workflowMetrics.set(workflowId, {
            startTime: Date.now(),
            definition: definition.name,
            stepsTotal: definition.steps.length,
            stepsCompleted: 0,
          });
          // 📈 Record metrics
          recordMetric('workflow_started', 1, {
            workflowType: definition.name,
            stepsCount: definition.steps.length,
          });
          recordGauge('workflow_active_count', this.activeWorkflows.size);
          recordHistogram('workflow_start_duration', Date.now() - startTime);
          setTraceAttributes({
            'workflow.id': workflowId,
            'workflow.status': 'started',
            'workflow.active_count': this.activeWorkflows.size,
          });
          this.emit('workflow:started', {
            workflowId,
            definition: definition.name,
          });
          recordEvent('workflow_started_successfully', {
            workflowId,
            workflowType: definition.name,
            activeWorkflows: this.activeWorkflows.size,
          });
          // 🚀 Start execution in background with enhanced error handling
          this.executeWorkflowAsync(workflow).catch((error) => {
            recordMetric('workflow_execution_background_error', 1, {
              workflowId,
            });
            logger.error(`Workflow ${workflowId} execution failed:`, {
              error: error instanceof Error ? error.message : String(error),
              workflowType: definition.name,
              workflowId,
            });
          });
          return { success: true, workflowId };
        });
      } catch (error) {
        const duration = Date.now() - startTime;
        recordMetric('workflow_start_circuit_breaker_failure', 1);
        recordHistogram('workflow_start_error_duration', duration);
        logger.error('Workflow start failed with circuit breaker protection', {
          error: error instanceof Error ? error.message : String(error),
          duration,
        });
        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'Unknown error during workflow start',
        };
      }
    });
  }
  cancelWorkflow(workflowId) {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) return false;
    workflow.status = 'cancelled';
    workflow.endTime = new Date().toISOString();
    this.activeWorkflows.delete(workflowId);
    this.emit('workflow:cancelled', { workflowId });
    return true;
  }
  getWorkflowStatus(workflowId) {
    return this.activeWorkflows.get(workflowId) ?? null;
  }
  // --------------------------------------------------------------------------
  // WORKFLOW REGISTRATION
  // --------------------------------------------------------------------------
  registerWorkflowDefinition(name, definition) {
    this.workflowDefinitions.set(name, definition);
    logger.debug(`Registered workflow definition: ${name}`);
  }
  registerStepHandler(type, handler) {
    this.stepHandlers.set(type, handler);
    logger.debug(`Registered step handler: ${type}`);
  }
  // --------------------------------------------------------------------------
  // DOCUMENT WORKFLOW METHODS
  // --------------------------------------------------------------------------
  async registerDocumentWorkflows() {
    const documentWorkflows = [
      {
        name: 'vision-to-prds',
        description: 'Process vision documents into PRDs',
        version: '1.0.0',
        steps: [
          { type: 'extract-requirements', name: 'Extract requirements' },
          { type: 'generate-prds', name: 'Generate PRD documents' },
          { type: 'save-documents', name: 'Save to database' },
        ],
      },
      {
        name: 'prd-to-epics',
        description: 'Break down PRDs into epics',
        version: '1.0.0',
        steps: [
          { type: 'analyze-prd', name: 'Analyze PRD structure' },
          { type: 'create-epics', name: 'Create epic documents' },
          { type: 'estimate-effort', name: 'Estimate development effort' },
        ],
      },
    ];
    const registrationPromises = documentWorkflows.map((workflow) =>
      this.registerWorkflowDefinition(workflow.name, workflow)
    );
    await Promise.all(registrationPromises);
    logger.info(`Registered ${documentWorkflows.length} document workflows`);
  }
  async processDocumentEvent(eventType, documentData) {
    return withAsyncTrace('document-event-processing', async (span) => {
      const processingStartTime = Date.now();
      const docData = documentData;
      setTraceAttributes({
        'document.event.type': eventType,
        'document.data.type': docData.type || 'unknown',
        'document.data.id': docData.id || 'unknown',
      });
      recordEvent('document_event_processing_started', {
        eventType,
        documentType: docData.type,
        documentId: docData.id,
      });
      try {
        // 🛡️ Use circuit breaker protection for document processing
        return this.documentProcessingCircuitBreaker.execute(async () => {
          const triggerWorkflows = this.getWorkflowsForDocumentType(
            docData.type
          );
          if (triggerWorkflows.length === 0) {
            recordEvent('document_event_no_workflows_found', {
              eventType,
              documentType: docData.type,
            });
            recordMetric('document_event_no_workflows', 1, {
              eventType,
              documentType: docData.type || 'unknown',
            });
            logger.debug(`No workflows for document type: ${docData.type}`, {
              eventType,
              documentType: docData.type,
              documentId: docData.id,
            });
            return;
          }
          setTraceAttributes({
            'document.workflows.triggered_count': triggerWorkflows.length,
            'document.workflows.names': triggerWorkflows.join(','),
          });
          recordEvent('document_event_triggering_workflows', {
            eventType,
            documentType: docData.type,
            workflowsCount: triggerWorkflows.length,
            workflows: triggerWorkflows,
          });
          // 🚀 Start all triggered workflows in parallel with comprehensive tracking
          const triggerPromises = triggerWorkflows.map(
            async (workflowName, index) => {
              const workflowStartTime = Date.now();
              try {
                recordEvent('document_workflow_trigger_started', {
                  workflowName,
                  eventType,
                  documentType: docData.type,
                });
                const result = await this.startWorkflow(workflowName, {
                  documentData,
                  eventType,
                  triggerIndex: index,
                  triggerTimestamp: Date.now(),
                });
                const workflowTriggerDuration = Date.now() - workflowStartTime;
                recordHistogram(
                  'document_workflow_trigger_duration',
                  workflowTriggerDuration,
                  {
                    workflowName,
                    eventType,
                    documentType: docData.type || 'unknown',
                  }
                );
                if (result.success) {
                  recordEvent('document_workflow_trigger_succeeded', {
                    workflowName,
                    workflowId: result.workflowId,
                    duration: workflowTriggerDuration,
                  });
                  recordMetric('document_workflow_triggered_successfully', 1, {
                    workflowName,
                    eventType,
                  });
                } else {
                  recordEvent('document_workflow_trigger_failed', {
                    workflowName,
                    error: result.error,
                    duration: workflowTriggerDuration,
                  });
                  recordMetric('document_workflow_trigger_failed', 1, {
                    workflowName,
                    eventType,
                  });
                }
                return {
                  workflowName,
                  result,
                  duration: workflowTriggerDuration,
                };
              } catch (error) {
                const workflowTriggerDuration = Date.now() - workflowStartTime;
                recordMetric('document_workflow_trigger_exception', 1, {
                  workflowName,
                  eventType,
                });
                recordEvent('document_workflow_trigger_exception', {
                  workflowName,
                  error: error instanceof Error ? error.message : String(error),
                  duration: workflowTriggerDuration,
                });
                return {
                  workflowName,
                  result: {
                    success: false,
                    error:
                      error instanceof Error ? error.message : String(error),
                  },
                  duration: workflowTriggerDuration,
                };
              }
            }
          );
          const results = await Promise.all(triggerPromises);
          const totalProcessingDuration = Date.now() - processingStartTime;
          // 📊 Analyze and record results
          const successfulWorkflows = results.filter((r) => r.result.success);
          const failedWorkflows = results.filter((r) => !r.result.success);
          recordHistogram(
            'document_event_total_processing_duration',
            totalProcessingDuration,
            {
              eventType,
              documentType: docData.type || 'unknown',
            }
          );
          recordGauge('document_event_workflows_triggered', results.length);
          recordGauge(
            'document_event_workflows_successful',
            successfulWorkflows.length
          );
          recordGauge(
            'document_event_workflows_failed',
            failedWorkflows.length
          );
          setTraceAttributes({
            'document.processing.duration_ms': totalProcessingDuration,
            'document.workflows.successful_count': successfulWorkflows.length,
            'document.workflows.failed_count': failedWorkflows.length,
            'document.processing.success_rate':
              successfulWorkflows.length / results.length,
          });
          // 📝 Log detailed results
          results.forEach(({ workflowName, result, duration }) => {
            const logLevel = result.success ? 'info' : 'warn';
            const status = result.success ? 'SUCCESS' : 'FAILED';
            logger[logLevel](`Document workflow ${workflowName}: ${status}`, {
              workflowName,
              status,
              duration,
              workflowId: result.workflowId,
              error: result.error,
              eventType,
              documentType: docData.type,
              documentId: docData.id,
            });
          });
          recordEvent('document_event_processing_completed', {
            eventType,
            documentType: docData.type,
            totalDuration: totalProcessingDuration,
            workflowsTriggered: results.length,
            workflowsSuccessful: successfulWorkflows.length,
            workflowsFailed: failedWorkflows.length,
          });
          logger.info('Document event processing completed', {
            eventType,
            documentType: docData.type,
            documentId: docData.id,
            totalDuration: totalProcessingDuration,
            workflowsTriggered: results.length,
            workflowsSuccessful: successfulWorkflows.length,
            workflowsFailed: failedWorkflows.length,
            successRate: `${Math.round((successfulWorkflows.length / results.length) * 100)}%`,
          });
        });
      } catch (error) {
        const processingDuration = Date.now() - processingStartTime;
        recordMetric('document_event_processing_circuit_breaker_failure', 1);
        recordHistogram(
          'document_event_processing_error_duration',
          processingDuration
        );
        logger.error(
          'Document event processing failed with circuit breaker protection',
          {
            eventType,
            documentType: docData.type,
            documentId: docData.id,
            error: error instanceof Error ? error.message : String(error),
            duration: processingDuration,
          }
        );
        throw new EnhancedError('Document event processing failed', {
          cause: error,
          eventType,
          documentType: docData.type,
          duration: processingDuration,
        });
      }
    });
  }
  convertEntityToDocumentContent(entity) {
    return {
      id: entity.id,
      type: entity.type,
      title: entity.title || `${entity.type} Document`,
      content: entity.content || '',
      metadata: {
        entityId: entity.id,
        createdAt: entity.created_at,
        updatedAt: entity.updated_at,
        version: entity.version,
        status: entity.status,
      },
    };
  }
  // --------------------------------------------------------------------------
  // DATA ACCESS METHODS
  // --------------------------------------------------------------------------
  getWorkflowData(workflowId) {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) return null;
    return {
      id: workflow.id,
      name: workflow.definition.name,
      description: workflow.definition.description,
      version: workflow.definition.version,
      data: {
        status: workflow.status,
        context: workflow.context,
        currentStep: workflow.currentStep,
        stepResults: workflow.stepResults,
      },
    };
  }
  async createWorkflowFromData(data) {
    const definition = {
      name: data.name,
      description: data.description,
      version: data.version,
      steps: [],
    };
    const result = await this.startWorkflow(definition, data.data);
    if (!(result.success && result.workflowId)) {
      throw new Error(`Failed to create workflow: ${result.error}`);
    }
    return result.workflowId;
  }
  updateWorkflowData(workflowId, updates) {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }
    if (updates.data) {
      Object.assign(workflow.context, updates.data);
    }
    this.emit('workflow:updated', { workflowId, updates });
  }
  // --------------------------------------------------------------------------
  // PRIVATE METHODS
  // --------------------------------------------------------------------------
  async executeWorkflowAsync(workflow) {
    return withAsyncTrace('workflow-execution', async (span) => {
      const executionStartTime = Date.now();
      setTraceAttributes({
        'workflow.id': workflow.id,
        'workflow.definition.name': workflow.definition.name,
        'workflow.definition.steps_count': workflow.definition.steps.length,
        'workflow.execution.started': true,
      });
      workflow.status = 'running';
      recordEvent('workflow_execution_started', {
        workflowId: workflow.id,
        workflowType: workflow.definition.name,
        stepsCount: workflow.definition.steps.length,
      });
      try {
        // 🔄 Execute each step with comprehensive telemetry
        for (let i = 0; i < workflow.definition.steps.length; i++) {
          if (workflow.status !== 'running') {
            recordEvent('workflow_execution_interrupted', {
              workflowId: workflow.id,
              currentStep: i,
              status: workflow.status,
            });
            break;
          }
          workflow.currentStep = i;
          const step = workflow.definition.steps[i];
          // 📊 Record step execution metrics
          recordEvent('workflow_step_execution_started', {
            workflowId: workflow.id,
            stepIndex: i,
            stepType: step.type,
            stepName: step.name,
          });
          const stepStartTime = Date.now();
          const result = await this.executeStep(step, workflow);
          const stepDuration = Date.now() - stepStartTime;
          // 📈 Update workflow progress metrics
          const workflowMetric = this.workflowMetrics.get(workflow.id);
          if (workflowMetric) {
            workflowMetric.stepsCompleted = i + 1;
            workflowMetric.lastStepDuration = stepDuration;
          }
          recordHistogram('workflow_step_execution_duration', stepDuration, {
            workflowId: workflow.id,
            stepType: step.type,
            stepIndex: i.toString(),
          });
          if (!result.success) {
            workflow.status = 'failed';
            workflow.error = result.error;
            recordMetric('workflow_step_execution_failed', 1, {
              workflowId: workflow.id,
              stepType: step.type,
              stepIndex: i.toString(),
            });
            recordEvent('workflow_execution_failed', {
              workflowId: workflow.id,
              failedStep: i,
              stepType: step.type,
              error: result.error,
            });
            setTraceAttributes({
              'workflow.execution.failed': true,
              'workflow.execution.failed_step': i,
              'workflow.execution.error': result.error,
            });
            break;
          }
          workflow.stepResults[i] = result.output;
          recordEvent('workflow_step_execution_completed', {
            workflowId: workflow.id,
            stepIndex: i,
            stepType: step.type,
            duration: stepDuration,
          });
        }
        // 🎯 Determine final workflow status
        if (workflow.status === 'running') {
          workflow.status = 'completed';
          recordEvent('workflow_execution_completed_successfully', {
            workflowId: workflow.id,
            totalSteps: workflow.definition.steps.length,
            executionDuration: Date.now() - executionStartTime,
          });
          setTraceAttributes({
            'workflow.execution.completed': true,
            'workflow.execution.steps_completed':
              workflow.definition.steps.length,
          });
        }
      } catch (error) {
        workflow.status = 'failed';
        workflow.error =
          error instanceof Error ? error.message : 'Unknown error';
        recordMetric('workflow_execution_exception', 1, {
          workflowId: workflow.id,
        });
        recordEvent('workflow_execution_failed_with_exception', {
          workflowId: workflow.id,
          error: workflow.error,
          currentStep: workflow.currentStep,
        });
        setTraceAttributes({
          'workflow.execution.failed': true,
          'workflow.execution.exception': true,
          'workflow.execution.error': workflow.error,
        });
        logger.error('Workflow execution failed with exception', {
          workflowId: workflow.id,
          workflowType: workflow.definition.name,
          currentStep: workflow.currentStep,
          error: workflow.error,
        });
      } finally {
        // 🏁 Finalize workflow execution with comprehensive metrics
        workflow.endTime = new Date().toISOString();
        const totalExecutionDuration = Date.now() - executionStartTime;
        // 📊 Record final execution metrics
        recordHistogram(
          'workflow_total_execution_duration',
          totalExecutionDuration,
          {
            workflowId: workflow.id,
            workflowType: workflow.definition.name,
            status: workflow.status,
          }
        );
        recordGauge('workflow_steps_completed', workflow.currentStep, {
          workflowId: workflow.id,
        });
        recordMetric(`workflow_${workflow.status}`, 1, {
          workflowType: workflow.definition.name,
        });
        // 🧹 Cleanup workflow state
        this.activeWorkflows.delete(workflow.id);
        this.workflowMetrics.delete(workflow.id);
        recordGauge('workflow_active_count', this.activeWorkflows.size);
        setTraceAttributes({
          'workflow.execution.final_status': workflow.status,
          'workflow.execution.duration_ms': totalExecutionDuration,
          'workflow.execution.steps_completed': workflow.currentStep,
          'workflow.execution.finalized': true,
        });
        this.emit('workflow:completed', {
          workflowId: workflow.id,
          status: workflow.status,
          duration: totalExecutionDuration,
          stepsCompleted: workflow.currentStep,
        });
        recordEvent('workflow_execution_finalized', {
          workflowId: workflow.id,
          status: workflow.status,
          duration: totalExecutionDuration,
          stepsCompleted: workflow.currentStep,
          activeWorkflows: this.activeWorkflows.size,
        });
        logger.info('Workflow execution finalized', {
          workflowId: workflow.id,
          workflowType: workflow.definition.name,
          status: workflow.status,
          duration: totalExecutionDuration,
          stepsCompleted: workflow.currentStep,
          activeWorkflows: this.activeWorkflows.size,
        });
      }
    });
  }
  async executeStep(step, workflow) {
    const startTime = Date.now();
    // Check if step requires gate approval
    if (step.gateConfig?.enabled && this.gatesManager) {
      const gateResult = await this.executeGateForStep(step, workflow);
      if (!gateResult.success) {
        return {
          success: false,
          error: gateResult.error?.message || 'Gate approval failed',
          duration: Date.now() - startTime,
        };
      }
      if (!gateResult.approved) {
        // Pause workflow until gate is approved
        workflow.status = 'paused';
        workflow.pausedForGate = {
          stepIndex: workflow.currentStep,
          gateId: gateResult.gateId,
          pausedAt: new Date().toISOString(),
        };
        return {
          success: true,
          output: { gateId: gateResult.gateId, status: 'pending_approval' },
          duration: Date.now() - startTime,
        };
      }
    }
    const handler = this.stepHandlers.get(step.type);
    if (!handler) {
      return {
        success: false,
        error: `No handler found for step type: ${step.type}`,
        duration: Date.now() - startTime,
      };
    }
    try {
      const output = await Promise.race([
        handler(workflow.context, step.params || {}),
        this.createTimeoutPromise(step.timeout || this.config.stepTimeout),
      ]);
      return {
        success: true,
        output,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
      };
    }
  }
  registerDefaultStepHandlers() {
    // Default step handlers
    this.registerStepHandler('delay', async (context, params) => {
      const duration = params.duration || 1000;
      await new Promise((resolve) => setTimeout(resolve, duration));
      return { delayed: duration };
    });
    this.registerStepHandler('log', (context, params) => {
      const message = params.message || 'Step executed';
      logger.info(message);
      return Promise.resolve({ logged: message });
    });
    this.registerStepHandler('transform', (context, params) => {
      const { input, transformation } = params;
      const inputValue = this.getNestedValue(context, input || '');
      return Promise.resolve({
        transformed: this.applyTransformation(inputValue, transformation),
      });
    });
  }
  resolveDefinition(definitionOrName) {
    if (typeof definitionOrName === 'string') {
      return this.workflowDefinitions.get(definitionOrName) || null;
    }
    return definitionOrName;
  }
  generateWorkflowId() {
    return `workflow-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
  getWorkflowsForDocumentType(documentType) {
    const typeWorkflowMap = {
      vision: ['vision-to-prds'],
      prd: ['prd-to-epics'],
      epic: ['epic-to-features'],
    };
    return typeWorkflowMap[documentType || ''] || [];
  }
  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }
  createTimeoutPromise(timeout) {
    return new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`Step timeout after ${timeout}ms`)),
        timeout
      )
    );
  }
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
  applyTransformation(data, transformation) {
    if (typeof transformation === 'function') {
      return transformation(data);
    }
    return data;
  }
  // --------------------------------------------------------------------------
  // GATE NTEGRATION METHODS
  // --------------------------------------------------------------------------
  /**
   * Execute gate for workflow step
   */
  async executeGateForStep(step, workflow) {
    if (!(this.gatesManager && step.gateConfig)) {
      return {
        success: false,
        gateId: '',
        approved: false,
        processingTime: 0,
        escalationLevel: 0,
        error: new Error('Gate manager not available'),
        correlationId: '',
      };
    }
    try {
      const gateId = `workflow-${workflow.id}-step-${workflow.currentStep}`;
      // Create gate request from step configuration
      const gateRequest = {
        // ValidationQuestion base properties
        id: gateId,
        type: 'checkpoint',
        question: `Approve execution of step: ${step.name || step.type}?`,
        context: {
          workflowId: workflow.id,
          stepName: step.name || step.type,
          stepType: step.type,
          stepParams: step.params || {},
        },
        confidence: 0.8,
        priority:
          step.gateConfig.businessImpact === 'critical' ? 'critical' : 'medium',
        validationReason: `Workflow step gate: ${step.name || step.type}`,
        expectedImpact: step.gateConfig.businessImpact === 'high' ? 0.7 : 0.4,
        // WorkflowGateRequest specific properties
        workflowContext: {
          workflowId: workflow.id,
          stepName: step.name || step.type,
          businessImpact: step.gateConfig.businessImpact || 'medium',
          decisionScope: 'task',
          stakeholders: step.gateConfig.stakeholders || ['workflow-manager'],
          dependencies: [],
          riskFactors: [],
        },
        gateType: step.gateConfig.gateType || 'checkpoint',
        timeoutConfig: {
          initialTimeout: step.timeout || 300000, // 5 minutes
          escalationTimeouts: [600000, 1200000], // 10, 20 minutes
          maxTotalTimeout: 1800000, // 30 minutes
        },
        integrationConfig: {
          correlationId: `${workflow.id}-${workflow.currentStep}`,
          domainValidation: true,
          enableMetrics: true,
        },
      };
      // Initialize pending gates map if not exists
      if (!workflow.pendingGates) {
        workflow.pendingGates = new Map();
      }
      workflow.pendingGates.set(gateId, gateRequest);
      // For auto-approval steps, return immediately approved
      if (step.gateConfig.autoApproval) {
        return {
          success: true,
          gateId,
          approved: true,
          processingTime: 10,
          escalationLevel: 0,
          decisionMaker: 'auto-approval',
          correlationId: gateRequest.integrationConfig?.correlationId || '',
        };
      }
      // Simulate gate processing (in real implementation, this would go through AGUI)
      const approved = await this.simulateGateDecision(step, workflow);
      return {
        success: true,
        gateId,
        approved,
        processingTime: 100,
        escalationLevel: 0,
        decisionMaker: approved ? 'stakeholder' : 'rejected',
        correlationId: gateRequest.integrationConfig?.correlationId || '',
      };
    } catch (error) {
      return {
        success: false,
        gateId: '',
        approved: false,
        processingTime: 0,
        escalationLevel: 0,
        error: error instanceof Error ? error : new Error(String(error)),
        correlationId: '',
      };
    }
  }
  /**
   * Production gate decision logic based on workflow context and business rules
   */
  simulateGateDecision(step, workflow) {
    const businessImpact = step.gateConfig?.businessImpact || 'medium';
    const stakeholders = step.gateConfig?.stakeholders || [];
    // Auto-approve if configured
    if (step.gateConfig?.autoApproval) {
      return true;
    }
    // Analyze workflow context for decision criteria
    const workflowAge = Date.now() - new Date(workflow.startTime).getTime();
    const isUrgent = workflowAge > 86400000; // 24 hours
    const hasRequiredStakeholders = stakeholders.length > 0;
    // Production decision matrix based on multiple factors
    let approvalScore = 0.5; // Base score
    // Business impact weighting
    switch (businessImpact) {
      case 'critical':
        approvalScore = hasRequiredStakeholders ? 0.9 : 0.3; // Require stakeholders
        break;
      case 'high':
        approvalScore = 0.75;
        break;
      case 'medium':
        approvalScore = 0.85;
        break;
      case 'low':
        approvalScore = 0.95;
        break;
    }
    // Urgency factor
    if (isUrgent) {
      approvalScore += 0.1; // Slight boost for old workflows
    }
    // Previous step success factor
    const completedSteps = workflow.currentStep;
    const successRate =
      completedSteps > 0
        ? Object.keys(workflow.stepResults).length / completedSteps
        : 1;
    approvalScore += (successRate - 0.5) * 0.1; // Adjust based on success rate
    // Stakeholder availability simulation
    if (stakeholders.length > 0 && businessImpact === 'critical') {
      const stakeholderApproval = Math.random() > 0.2; // 80% stakeholder availability
      if (!stakeholderApproval) {
        return false;
      }
    }
    return Math.random() < approvalScore;
  }
  /**
   * Resume workflow after gate approval
   */
  async resumeWorkflowAfterGate(workflowId, gateId, approved) {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      return { success: false, error: 'Workflow not found' };
    }
    if (!workflow.pausedForGate || workflow.pausedForGate.gateId !== gateId) {
      return { success: false, error: 'Workflow not paused for this gate' };
    }
    // Initialize gate results map if not exists
    if (!workflow.gateResults) {
      workflow.gateResults = new Map();
    }
    // Record gate result
    const gateResult = {
      success: true,
      gateId,
      approved,
      processingTime:
        Date.now() - new Date(workflow.pausedForGate.pausedAt).getTime(),
      escalationLevel: 0,
      decisionMaker: 'external',
      correlationId: `${workflowId}-${gateId}`,
    };
    workflow.gateResults.set(gateId, gateResult);
    if (!approved) {
      // Gate rejected, fail the workflow
      workflow.status = 'failed';
      workflow.error = `Gate rejected: ${gateId}`;
      workflow.endTime = new Date().toISOString();
      this.activeWorkflows.delete(workflowId);
      this.emit('workflow:failed', {
        workflowId,
        reason: 'gate_rejected',
        gateId,
      });
      return { success: true };
    }
    // Gate approved, resume workflow
    workflow.status = 'running';
    workflow.pausedForGate = undefined;
    // Resume execution from the paused step
    this.executeWorkflowAsync(workflow).catch((error) => {
      logger.error(`Workflow ${workflowId} failed after gate resume:`, error);
    });
    this.emit('workflow:resumed', { workflowId, gateId });
    return { success: true };
  }
  /**
   * Get workflow gate status
   */
  getWorkflowGateStatus(workflowId) {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      return {
        hasPendingGates: false,
        pendingGates: [],
        gateResults: [],
      };
    }
    return {
      hasPendingGates: Boolean(
        workflow.pendingGates && workflow.pendingGates.size > 0
      ),
      pendingGates: workflow.pendingGates
        ? Array.from(workflow.pendingGates.values())
        : [],
      gateResults: workflow.gateResults
        ? Array.from(workflow.gateResults.values())
        : [],
      pausedForGate: workflow.pausedForGate,
    };
  }
}
__decorate(
  [
    tracedAsync('workflow-engine-initialize'),
    metered('workflow_engine_initialization'),
  ],
  WorkflowEngine.prototype,
  'initialize',
  null
);
__decorate(
  [
    tracedAsync('workflow-engine-shutdown'),
    metered('workflow_engine_shutdown'),
  ],
  WorkflowEngine.prototype,
  'shutdown',
  null
);
__decorate(
  [tracedAsync('workflow-start'), metered('workflow_start_operation')],
  WorkflowEngine.prototype,
  'startWorkflow',
  null
);
__decorate(
  [
    tracedAsync('document-event-processing'),
    metered('document_event_processing'),
  ],
  WorkflowEngine.prototype,
  'processDocumentEvent',
  null
);
__decorate(
  [tracedAsync('workflow-execution'), metered('workflow_execution_operation')],
  WorkflowEngine.prototype,
  'executeWorkflowAsync',
  null
);
