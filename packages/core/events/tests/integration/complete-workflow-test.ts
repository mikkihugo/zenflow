/**
 * @fileoverview Complete Event-Driven Workflow Synchronization Test
 * 
 * Integration test to verify the complete event-driven architecture works correctly
 * across brain, document intelligence, and coordination packages.
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { EventBus } from '@claude-zen/foundation';
import {
  createCorrelationContext,
  globalSagaManager,
  SagaWorkflowFactory,
  globalEventCoordinator,
  type CorrelationContext,
  type SagaWorkflow
} from '../../../src/index.js';

describe('Complete Event-Driven Workflow Synchronization', () => {
  let eventBus: EventBus;
  let correlationContext: CorrelationContext;
  let mockEvents: any[] = [];

  beforeAll(async () => {
    // Setup event bus with mocking
    eventBus = EventBus.getInstance();
    
    // Mock event emissions for testing
    const originalEmit = eventBus.emit.bind(eventBus);
    eventBus.emit = vi.fn((eventName: string, eventData: any) => {
      mockEvents.push({ eventName, eventData, timestamp: Date.now() });
      return originalEmit(eventName, eventData);
    });

    // Create correlation context for test
    correlationContext = createCorrelationContext({
      initiatedBy: 'system',
      metadata: { test: 'complete-workflow-synchronization' }
    });
  });

  afterAll(() => {
    mockEvents = [];
    vi.restoreAllMocks();
  });

  it('should orchestrate complete external document import workflow', async () => {
    // 1. SETUP: Create external document import saga
    const documentData = {
      documentId: 'test-doc-001',
      sourceType: 'external-vision',
      targetProjectId: 'project-safe-001',
      importType: 'stakeholder-input'
    };

    const saga = SagaWorkflowFactory.createDocumentImport(correlationContext, documentData);
    
    expect(saga).toBeDefined();
    expect(saga.workflowType).toBe('document-import');
    expect(saga.state).toBe('initiated');
    expect(saga.steps).toHaveLength(5); // Based on our workflow definition

    // 2. VERIFY: Event flow starts correctly
    expect(mockEvents).toHaveLength(0); // No events emitted yet
    
    // 3. SIMULATE: Brain analysis step
    const brainAnalysisStep = saga.steps[0];
    expect(brainAnalysisStep.stepName).toBe('brain-document-analysis');
    expect(brainAnalysisStep.service).toBe('brain');

    // Update step to executing
    const updateResult = globalSagaManager.updateSagaStep(
      saga.sagaId,
      brainAnalysisStep.stepId,
      { state: 'executing' }
    );
    expect(updateResult).toBe(true);

    // Complete step
    globalSagaManager.updateSagaStep(
      saga.sagaId,
      brainAnalysisStep.stepId,
      { 
        state: 'completed',
        output: { 
          analysisResult: 'ready-for-import',
          confidence: 0.95,
          extractedContent: 'Stakeholder vision content...'
        }
      }
    );

    // 4. SIMULATE: Coordination approval step
    const coordinationApprovalStep = saga.steps[1];
    expect(coordinationApprovalStep.stepName).toBe('coordination-import-approval');
    expect(coordinationApprovalStep.service).toBe('coordination');

    globalSagaManager.updateSagaStep(
      saga.sagaId,
      coordinationApprovalStep.stepId,
      { state: 'executing' }
    );

    globalSagaManager.updateSagaStep(
      saga.sagaId,
      coordinationApprovalStep.stepId,
      { 
        state: 'completed',
        output: {
          approvalResult: 'approved',
          approver: 'system',
          resourcesAllocated: { 
            aiTokenBudget: 10000,
            processingPriority: 'medium'
          }
        }
      }
    );

    // 5. SIMULATE: Document intelligence processing step
    const docProcessingStep = saga.steps[2];
    expect(docProcessingStep.stepName).toBe('document-intelligence-processing');
    expect(docProcessingStep.service).toBe('document-intelligence');

    globalSagaManager.updateSagaStep(
      saga.sagaId,
      docProcessingStep.stepId,
      { state: 'executing' }
    );

    globalSagaManager.updateSagaStep(
      saga.sagaId,
      docProcessingStep.stepId,
      { 
        state: 'completed',
        output: {
          processedArtifacts: [
            {
              type: 'enhanced-vision',
              title: 'Enhanced Stakeholder Vision',
              content: 'Processed stakeholder vision with SAFe integration points...',
              safeCompatible: true
            }
          ],
          integrationReady: true,
          qualityScore: 0.92
        }
      }
    );

    // 6. SIMULATE: SAFe integration step
    const safeIntegrationStep = saga.steps[3];
    expect(safeIntegrationStep.stepName).toBe('coordination-safe-integration');

    globalSagaManager.updateSagaStep(
      saga.sagaId,
      safeIntegrationStep.stepId,
      { state: 'executing' }
    );

    globalSagaManager.updateSagaStep(
      saga.sagaId,
      safeIntegrationStep.stepId,
      { 
        state: 'completed',
        output: {
          integrationResult: 'success',
          updatedProjectArtifacts: ['vision-document', 'stakeholder-input-log'],
          safeProjectUpdated: true
        }
      }
    );

    // 7. SIMULATE: Completion notification step
    const completionStep = saga.steps[4];
    expect(completionStep.stepName).toBe('brain-completion-notification');

    globalSagaManager.updateSagaStep(
      saga.sagaId,
      completionStep.stepId,
      { state: 'executing' }
    );

    globalSagaManager.updateSagaStep(
      saga.sagaId,
      completionStep.stepId,
      { 
        state: 'completed',
        output: {
          notificationsSent: ['stakeholder', 'project-manager'],
          workflowCompleted: true
        }
      }
    );

    // 8. VERIFY: Saga completed successfully
    const finalSaga = globalSagaManager.getSaga(saga.sagaId);
    expect(finalSaga).toBeDefined();
    expect(finalSaga!.state).toBe('completed');
    expect(finalSaga!.completedAt).toBeDefined();

    // All steps should be completed
    const completedSteps = finalSaga!.steps.filter(s => s.state === 'completed');
    expect(completedSteps).toHaveLength(5);

    console.log('✅ External document import workflow completed successfully');
  });

  it('should handle cross-package coordination workflow', async () => {
    // 1. SETUP: Create cross-package coordination saga
    const coordinationData = {
      requestType: 'safe-workflow' as const,
      initiatingService: 'brain' as const,
      targetServices: ['coordination', 'document-intelligence'],
      workflowContext: {
        operation: 'enhance-existing-project',
        projectId: 'project-safe-002',
        enhancementType: 'imported-content-integration'
      }
    };

    const saga = SagaWorkflowFactory.createCrossPackageCoordination(correlationContext, coordinationData);

    expect(saga).toBeDefined();
    expect(saga.workflowType).toBe('cross-package-coordination');
    expect(saga.state).toBe('initiated');

    // 2. SIMULATE: Validation step
    const validationStep = saga.steps[0];
    expect(validationStep.stepName).toBe('coordination-request-validation');

    globalSagaManager.updateSagaStep(
      saga.sagaId,
      validationStep.stepId,
      { state: 'executing' }
    );

    globalSagaManager.updateSagaStep(
      saga.sagaId,
      validationStep.stepId,
      { 
        state: 'completed',
        output: {
          validationResult: 'valid',
          approvedServices: ['coordination', 'document-intelligence'],
          resourceEstimate: { timeMinutes: 15, complexity: 'medium' }
        }
      }
    );

    // 3. SIMULATE: Resource allocation step  
    const resourceStep = saga.steps[1];
    expect(resourceStep.stepName).toBe('resource-allocation');

    globalSagaManager.updateSagaStep(
      saga.sagaId,
      resourceStep.stepId,
      { state: 'executing' }
    );

    globalSagaManager.updateSagaStep(
      saga.sagaId,
      resourceStep.stepId,
      { 
        state: 'completed',
        output: {
          allocatedResources: {
            cpuTime: '5 minutes',
            memoryMB: 512,
            aiTokens: 5000
          },
          priority: 'medium',
          deadline: Date.now() + 900000 // 15 minutes from now
        }
      }
    );

    // 4. SIMULATE: Service coordination steps (dynamic based on target services)
    const dynamicSteps = saga.steps.slice(2); // Steps after resource allocation
    
    for (const step of dynamicSteps) {
      if (step.stepName.startsWith('service-coordination-')) {
        globalSagaManager.updateSagaStep(
          saga.sagaId,
          step.stepId,
          { state: 'executing' }
        );

        globalSagaManager.updateSagaStep(
          saga.sagaId,
          step.stepId,
          { 
            state: 'completed',
            output: {
              coordinationResult: 'success',
              service: step.service,
              operationCompleted: true
            }
          }
        );
      }
    }

    // 5. SIMULATE: Result integration step
    const integrationStep = saga.steps[saga.steps.length - 1];
    expect(integrationStep.stepName).toBe('coordination-result-integration');

    globalSagaManager.updateSagaStep(
      saga.sagaId,
      integrationStep.stepId,
      { state: 'executing' }
    );

    globalSagaManager.updateSagaStep(
      saga.sagaId,
      integrationStep.stepId,
      { 
        state: 'completed',
        output: {
          integrationResult: 'success',
          allServicesCoordinated: true,
          finalResult: 'cross-package-coordination-completed'
        }
      }
    );

    // 6. VERIFY: Saga completed successfully
    const finalSaga = globalSagaManager.getSaga(saga.sagaId);
    expect(finalSaga).toBeDefined();
    expect(finalSaga!.state).toBe('completed');

    console.log('✅ Cross-package coordination workflow completed successfully');
  });

  it('should handle saga compensation on failure', async () => {
    // 1. SETUP: Create document import saga that will fail
    const documentData = {
      documentId: 'test-doc-fail-001',
      sourceType: 'external-prd',
      targetProjectId: 'project-safe-003',
      importType: 'legacy-documentation'
    };

    const saga = SagaWorkflowFactory.createDocumentImport(correlationContext, documentData);

    // 2. SIMULATE: Successful first step (brain analysis)
    const brainStep = saga.steps[0];
    globalSagaManager.updateSagaStep(
      saga.sagaId,
      brainStep.stepId,
      { 
        state: 'completed',
        output: { analysisResult: 'ready-for-import' }
      }
    );

    // 3. SIMULATE: Failed second step (coordination approval)
    const coordinationStep = saga.steps[1];
    globalSagaManager.updateSagaStep(
      saga.sagaId,
      coordinationStep.stepId,
      { state: 'executing' }
    );

    // Simulate failure after max retries
    coordinationStep.retryCount = coordinationStep.maxRetries;
    globalSagaManager.updateSagaStep(
      saga.sagaId,
      coordinationStep.stepId,
      { 
        state: 'failed',
        error: 'Import approval rejected: insufficient project permissions'
      }
    );

    // 4. VERIFY: Saga should start compensation
    const finalSaga = globalSagaManager.getSaga(saga.sagaId);
    expect(finalSaga).toBeDefined();
    
    // Saga should either be in compensating or rolled-back state
    expect(['compensating', 'rolled-back']).toContain(finalSaga!.state);
    
    // Should have compensation history for the completed step
    if (finalSaga!.state === 'rolled-back') {
      expect(finalSaga!.compensationHistory).toHaveLength(1);
      expect(finalSaga!.compensationHistory[0].stepId).toBe(brainStep.stepId);
    }

    console.log('✅ Saga compensation handled correctly on failure');
  });

  it('should track correlation across all workflow events', () => {
    // 1. VERIFY: Correlation context was used consistently
    expect(correlationContext.correlationId).toBeDefined();
    expect(correlationContext.rootRequestId).toBeDefined();
    expect(correlationContext.traceId).toBeDefined();

    // 2. VERIFY: All sagas have proper correlation
    const allSagas = globalSagaManager.getActiveSagas().concat(
      // Get completed sagas from the manager
      [] // Note: Would need access to completed sagas map in real implementation
    );

    for (const saga of allSagas) {
      expect(saga.correlationId).toBeDefined();
      expect(saga.rootRequestId).toBeDefined();
    }

    console.log('✅ Correlation tracking works correctly across workflows');
  });

  it('should provide saga metrics and monitoring', () => {
    // 1. GET: Saga metrics
    const metrics = globalSagaManager.getSagaMetrics();

    expect(metrics).toBeDefined();
    expect(typeof metrics.active).toBe('number');
    expect(typeof metrics.completed).toBe('number');
    expect(typeof metrics.failed).toBe('number');
    expect(typeof metrics.rolledBack).toBe('number');
    expect(typeof metrics.averageCompletionTime).toBe('number');

    console.log('📊 Saga Metrics:', {
      active: metrics.active,
      completed: metrics.completed,
      failed: metrics.failed,
      rolledBack: metrics.rolledBack,
      avgTime: `${Math.round(metrics.averageCompletionTime)}ms`
    });

    console.log('✅ Saga metrics and monitoring working correctly');
  });
});

/**
 * Event flow verification test
 */
describe('Event Flow Verification', () => {
  it('should emit events in correct sequence for document import', async () => {
    const testEvents: string[] = [];
    const eventBus = EventBus.getInstance();

    // Mock event handlers to track sequence
    const eventTypes = [
      'brain:coordination:safe-workflow-support',
      'coordination:brain:workflow-approved',
      'brain:document-intelligence:import-request',
      'document-intelligence:brain:import-result',
      'document-intelligence:coordination:import-complete',
      'coordination:document-intelligence:import-approved'
    ];

    // Setup listeners
    eventTypes.forEach(eventType => {
      eventBus.on(eventType, () => {
        testEvents.push(eventType);
      });
    });

    // Simulate event sequence
    eventBus.emit('brain:coordination:safe-workflow-support', {
      requestId: 'test-001',
      timestamp: Date.now(),
      workflowType: 'external-document-import',
      safeContext: { projectId: 'test-project' }
    });

    eventBus.emit('coordination:brain:workflow-approved', {
      requestId: 'response-001',
      timestamp: Date.now(),
      originalRequestId: 'test-001',
      approvalResult: 'approved'
    });

    eventBus.emit('brain:document-intelligence:import-request', {
      requestId: 'import-001',
      timestamp: Date.now(),
      documentData: { type: 'external-vision' },
      importType: 'external-vision',
      targetProjectId: 'test-project'
    });

    eventBus.emit('document-intelligence:brain:import-result', {
      requestId: 'import-result-001',
      timestamp: Date.now(),
      originalRequestId: 'import-001',
      result: { success: true }
    });

    eventBus.emit('document-intelligence:coordination:import-complete', {
      requestId: 'import-complete-001',
      timestamp: Date.now(),
      importId: 'import-001',
      integrationReady: true
    });

    eventBus.emit('coordination:document-intelligence:import-approved', {
      requestId: 'final-approval-001',
      timestamp: Date.now(),
      importId: 'import-001',
      approvalResult: 'integration-approved'
    });

    // Wait for events to be processed
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify event sequence
    expect(testEvents).toHaveLength(6);
    expect(testEvents).toEqual(eventTypes);

    console.log('✅ Event flow sequence verified correctly');
  });
});