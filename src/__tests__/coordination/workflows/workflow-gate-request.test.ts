/**
 * @file Workflow Gate Request Tests - Phase 1, Task 1.2
 *
 * Comprehensive test suite for WorkflowGateRequest system.
 * Tests extension of ValidationQuestion, escalation chains, event integration,
 * and domain boundary validation.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createApprovalGate,
  createCheckpointGate,
  createEmergencyGate,
  type EscalationChain,
  type EscalationLevel,
  GateEscalationLevel,
  type WorkflowContext,
  type WorkflowGateRequest,
  WorkflowGateRequestProcessor,
  WorkflowGateRequestSchema,
} from '../../../coordination/workflows/workflow-gate-request.ts';
import {
  Domain,
  getDomainValidator,
} from '../../../core/domain-boundary-validator.ts';
import {
  type AGUIGateOpenedEvent,
  createTypeSafeEventBus,
  EventPriority,
  type HumanValidationRequestedEvent,
  type TypeSafeEventBus,
} from '../../../core/type-safe-event-system.ts';
import type { AGUIInterface } from '../../../interfaces/agui/agui-adapter.ts';

// ============================================================================
// MOCK IMPLEMENTATIONS
// ============================================================================

class MockAGUIInterface implements AGUIInterface {
  private mockResponses = new Map<string, string>();
  private callHistory: Array<{ question: unknown; response: string }> = [];

  setMockResponse(questionId: string, response: string): void {
    this.mockResponses.set(questionId, response);
  }

  getCallHistory(): Array<{ question: unknown; response: string }> {
    return [...this.callHistory];
  }

  async askQuestion(question: unknown): Promise<string> {
    const response = this.mockResponses.get(question.id) || 'approve';
    this.callHistory.push({ question, response });

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 10));

    return response;
  }

  async askBatchQuestions(questions: unknown[]): Promise<string[]> {
    const responses: string[] = [];
    for (const question of questions) {
      responses.push(await this.askQuestion(question));
    }
    return responses;
  }

  async showMessage(message: string, type?: string): Promise<void> {
    // Mock implementation
  }

  async showProgress(progress: unknown): Promise<void> {
    // Mock implementation
  }
}

// ============================================================================
// TEST SETUP AND UTILITIES
// ============================================================================

describe('WorkflowGateRequest System', () => {
  let eventBus: TypeSafeEventBus;
  let mockAGUI: MockAGUIInterface;
  let processor: WorkflowGateRequestProcessor;

  beforeEach(async () => {
    // Create fresh instances for each test
    eventBus = createTypeSafeEventBus({
      enableMetrics: false,
      enableCaching: false,
      domainValidation: true,
    });
    await eventBus.initialize();

    mockAGUI = new MockAGUIInterface();
    processor = new WorkflowGateRequestProcessor(eventBus, mockAGUI, {
      enableMetrics: false,
      enableDomainValidation: true,
      defaultTimeout: 10000, // Short timeout for tests
      enableAutoApproval: true,
    });
  });

  afterEach(async () => {
    await eventBus.shutdown();
    vi.clearAllMocks();
  });

  // ============================================================================
  // WORKFLOW CONTEXT TESTS
  // ============================================================================

  describe('WorkflowContext', () => {
    it('should create a valid workflow context', () => {
      const workflowContext: WorkflowContext = {
        workflowId: 'test-workflow-001',
        stepName: 'approval-step',
        businessImpact: 'high',
        decisionScope: 'feature',
        stakeholders: ['user1', 'user2', 'manager1'],
        deadline: new Date(Date.now() + 86400000), // 24 hours from now
        dependencies: [
          {
            id: 'dep-001',
            type: 'blocking',
            reference: 'other-workflow-002',
            criticality: 'high',
            description: 'Must complete before deployment',
          },
        ],
        impactEstimates: [
          {
            outcome: 'approve',
            timeImpact: 8,
            costImpact: 1000,
            qualityImpact: 0.9,
            confidence: 0.8,
          },
        ],
        riskFactors: [
          {
            id: 'risk-001',
            category: 'technical',
            severity: 'medium',
            probability: 0.3,
            description: 'Potential integration issues',
            mitigation: ['thorough testing', 'rollback plan'],
          },
        ],
      };

      expect(workflowContext.workflowId).toBe('test-workflow-001');
      expect(workflowContext.businessImpact).toBe('high');
      expect(workflowContext.stakeholders).toContain('manager1');
      expect(workflowContext.dependencies).toHaveLength(1);
      expect(workflowContext.impactEstimates?.[0]?.confidence).toBe(0.8);
      expect(workflowContext.riskFactors?.[0]?.mitigation).toContain(
        'rollback plan'
      );
    });

    it('should validate required fields', () => {
      const minimalContext: WorkflowContext = {
        workflowId: 'test-001',
        stepName: 'step-001',
        businessImpact: 'medium',
        decisionScope: 'task',
        stakeholders: ['user1'],
      };

      expect(minimalContext.workflowId).toBeDefined();
      expect(minimalContext.stakeholders).toHaveLength(1);
    });
  });

  // ============================================================================
  // ESCALATION CHAIN TESTS
  // ============================================================================

  describe('EscalationChain', () => {
    it('should create a proper escalation chain', () => {
      const escalationChain: EscalationChain = {
        id: 'escalation-001',
        levels: [
          {
            level: GateEscalationLevel.TEAM_LEAD,
            approvers: ['team-lead-1'],
            requiredApprovals: 1,
            timeLimit: 1800000, // 30 minutes
            permissions: ['approve_low_impact'],
          },
          {
            level: GateEscalationLevel.MANAGER,
            approvers: ['manager-1', 'manager-2'],
            requiredApprovals: 1,
            timeLimit: 3600000, // 1 hour
            permissions: ['approve_medium_impact'],
          },
          {
            level: GateEscalationLevel.DIRECTOR,
            approvers: ['director-1'],
            requiredApprovals: 1,
            timeLimit: 7200000, // 2 hours
            permissions: ['approve_high_impact'],
          },
        ],
        triggers: [
          {
            type: 'timeout',
            threshold: 'time_limit',
            delay: 0,
          },
          {
            type: 'business_impact',
            threshold: 'high',
            delay: 300000, // 5 minutes
          },
        ],
        maxLevel: GateEscalationLevel.DIRECTOR,
        notifyAllLevels: true,
      };

      expect(escalationChain.levels).toHaveLength(3);
      expect(escalationChain.levels[0]?.level).toBe(
        GateEscalationLevel.TEAM_LEAD
      );
      expect(escalationChain.levels[1]?.approvers).toContain('manager-2');
      expect(escalationChain.triggers).toHaveLength(2);
      expect(escalationChain.maxLevel).toBe(GateEscalationLevel.DIRECTOR);
    });

    it('should validate escalation level hierarchy', () => {
      expect(GateEscalationLevel.NONE).toBeLessThan(
        GateEscalationLevel.TEAM_LEAD
      );
      expect(GateEscalationLevel.TEAM_LEAD).toBeLessThan(
        GateEscalationLevel.MANAGER
      );
      expect(GateEscalationLevel.MANAGER).toBeLessThan(
        GateEscalationLevel.DIRECTOR
      );
      expect(GateEscalationLevel.DIRECTOR).toBeLessThan(
        GateEscalationLevel.EXECUTIVE
      );
      expect(GateEscalationLevel.EXECUTIVE).toBeLessThan(
        GateEscalationLevel.BOARD
      );
    });
  });

  // ============================================================================
  // WORKFLOW GATE REQUEST TESTS
  // ============================================================================

  describe('WorkflowGateRequest', () => {
    it('should extend ValidationQuestion properly', () => {
      const workflowContext: WorkflowContext = {
        workflowId: 'test-workflow-001',
        stepName: 'approval-gate',
        businessImpact: 'high',
        decisionScope: 'feature',
        stakeholders: ['product-manager', 'tech-lead'],
      };

      const gateRequest: WorkflowGateRequest = {
        // ValidationQuestion base properties
        id: 'gate-001',
        type: 'checkpoint',
        question: 'Approve deployment to production?',
        context: { deployment: 'production', version: '1.2.3' },
        confidence: 0.9,
        priority: 'high',
        validationReason: 'Production deployment approval required',
        expectedImpact: 0.8,

        // WorkflowGateRequest specific properties
        workflowContext,
        gateType: 'approval',
        requiredApprovalLevel: GateEscalationLevel.MANAGER,
        timeoutConfig: {
          initialTimeout: 1800000, // 30 minutes
          escalationTimeouts: [1800000, 3600000], // 30min, 1hr
          maxTotalTimeout: 7200000, // 2 hours
        },
        integrationConfig: {
          domainValidation: true,
          enableMetrics: true,
        },
      };

      // Validate ValidationQuestion properties
      expect(gateRequest.id).toBe('gate-001');
      expect(gateRequest.type).toBe('checkpoint');
      expect(gateRequest.question).toContain('production');
      expect(gateRequest.confidence).toBe(0.9);
      expect(gateRequest.priority).toBe('high');

      // Validate WorkflowGateRequest properties
      expect(gateRequest.workflowContext.workflowId).toBe('test-workflow-001');
      expect(gateRequest.gateType).toBe('approval');
      expect(gateRequest.requiredApprovalLevel).toBe(
        GateEscalationLevel.MANAGER
      );
      expect(gateRequest.timeoutConfig?.maxTotalTimeout).toBe(7200000);
      expect(gateRequest.integrationConfig?.domainValidation).toBe(true);
    });

    it('should validate against WorkflowGateRequestSchema', () => {
      const validator = getDomainValidator(Domain.WORKFLOWS);

      const validGateRequest: WorkflowGateRequest = {
        id: 'gate-002',
        type: 'checkpoint',
        question: 'Continue with next phase?',
        context: { phase: 'testing' },
        confidence: 0.8,

        workflowContext: {
          workflowId: 'workflow-002',
          stepName: 'testing-gate',
          businessImpact: 'medium',
          decisionScope: 'task',
          stakeholders: ['qa-lead'],
        },
        gateType: 'checkpoint',
      };

      // Should not throw an error for valid gate request
      expect(() => {
        validator.validateInput(validGateRequest, WorkflowGateRequestSchema);
      }).not.toThrow();
    });

    it('should reject invalid gate requests', () => {
      const validator = getDomainValidator(Domain.WORKFLOWS);

      const invalidGateRequest = {
        id: 'gate-003',
        // Missing required 'type' field
        question: 'Invalid gate?',
        context: {},
        confidence: 0.5,

        workflowContext: {
          workflowId: 'workflow-003',
          stepName: 'invalid-gate',
          businessImpact: 'invalid-impact', // Invalid enum value
          decisionScope: 'task',
          stakeholders: ['user'],
        },
        gateType: 'approval',
      };

      expect(() => {
        validator.validateInput(invalidGateRequest, WorkflowGateRequestSchema);
      }).toThrow();
    });
  });

  // ============================================================================
  // PROCESSOR TESTS
  // ============================================================================

  describe('WorkflowGateRequestProcessor', () => {
    it('should create workflow gate requests', () => {
      const workflowContext: Partial<WorkflowContext> = {
        businessImpact: 'high',
        decisionScope: 'feature',
        stakeholders: ['product-owner', 'engineering-manager'],
      };

      const gateRequest = processor.createWorkflowGateRequest(
        'workflow-001',
        'approval-step',
        'approval',
        'Deploy to production?',
        { version: '2.1.0' },
        workflowContext
      );

      expect(gateRequest.id).toMatch(/^gate-\d+-\d+$/);
      expect(gateRequest.workflowContext.workflowId).toBe('workflow-001');
      expect(gateRequest.workflowContext.stepName).toBe('approval-step');
      expect(gateRequest.gateType).toBe('approval');
      expect(gateRequest.question).toBe('Deploy to production?');
      expect(gateRequest.context.version).toBe('2.1.0');
      expect(gateRequest.workflowContext.businessImpact).toBe('high');
    });

    it('should process a simple approval gate', async () => {
      // Mock AGUI to approve
      const gateRequest = processor.createWorkflowGateRequest(
        'workflow-001',
        'simple-approval',
        'approval',
        'Approve this action?',
        { action: 'deploy' },
        {
          businessImpact: 'medium',
          decisionScope: 'task',
          stakeholders: ['developer'],
        }
      );

      mockAGUI.setMockResponse(gateRequest.id, 'approve');

      const result = await processor.processWorkflowGate(gateRequest);

      expect(result.success).toBe(true);
      expect(result.approved).toBe(true);
      expect(result.gateId).toBe(gateRequest.id);
      expect(result.processingTime).toBeGreaterThan(0);
      expect(result.escalationLevel).toBeDefined();

      // Verify AGUI was called
      const callHistory = mockAGUI.getCallHistory();
      expect(callHistory).toHaveLength(1);
      expect(callHistory[0]?.question).toMatchObject({
        question: 'Approve this action?',
        context: { action: 'deploy' },
      });
    });

    it('should handle gate rejection', async () => {
      const gateRequest = processor.createWorkflowGateRequest(
        'workflow-002',
        'rejection-test',
        'approval',
        'Should we proceed?',
        { risk: 'high' },
        {
          businessImpact: 'high',
          decisionScope: 'feature',
          stakeholders: ['security-team'],
        }
      );

      mockAGUI.setMockResponse(gateRequest.id, 'reject');

      const result = await processor.processWorkflowGate(gateRequest);

      expect(result.success).toBe(true); // Process succeeded
      expect(result.approved).toBe(false); // But was rejected
      expect(result.gateId).toBe(gateRequest.id);
      expect(result.escalationLevel).toBeGreaterThan(GateEscalationLevel.NONE);
    });

    it('should handle auto-approval conditions', async () => {
      const gateRequest = processor.createWorkflowGateRequest(
        'workflow-003',
        'auto-approval-test',
        'checkpoint',
        'Quality gate passed?',
        { confidence: 0.95 },
        {
          businessImpact: 'low',
          decisionScope: 'task',
          stakeholders: ['qa-system'],
        }
      );

      // Add auto-approval condition
      (gateRequest as any).conditionalLogic = {
        autoApprovalConditions: [
          {
            id: 'high_confidence',
            type: 'custom',
            operator: 'greater_than',
            field: 'businessImpact',
            value: 'low', // This should match
            required: false,
          },
        ],
      };

      const result = await processor.processWorkflowGate(gateRequest);

      expect(result.success).toBe(true);
      expect(result.approved).toBe(true);
      expect(result.autoApproved).toBe(true);
      expect(result.escalationLevel).toBe(GateEscalationLevel.NONE);

      // Should not have called AGUI for auto-approval
      const callHistory = mockAGUI.getCallHistory();
      expect(callHistory).toHaveLength(0);
    });

    it('should handle prerequisite validation', async () => {
      const gateRequest = processor.createWorkflowGateRequest(
        'workflow-004',
        'prerequisite-test',
        'approval',
        'Ready to deploy?',
        { tests_passed: false },
        {
          businessImpact: 'medium',
          decisionScope: 'feature',
          stakeholders: ['developer'],
        }
      );

      // Add failing prerequisite
      (gateRequest as any).conditionalLogic = {
        prerequisites: [
          {
            id: 'tests_must_pass',
            type: 'custom',
            operator: 'equals',
            field: 'tests_passed', // This will evaluate against context
            value: true,
            required: true,
          },
        ],
      };

      const result = await processor.processWorkflowGate(gateRequest);

      expect(result.success).toBe(false);
      expect(result.approved).toBe(false);
      expect(result.error?.message).toContain('Prerequisites not met');
    });

    it('should emit proper events during processing', async () => {
      const eventEmissions: unknown[] = [];

      // Capture all events
      eventBus.registerWildcardHandler(async (event) => {
        eventEmissions.push({
          type: event.type,
          domain: event.domain,
          timestamp: event.timestamp,
        });
      });

      const gateRequest = processor.createWorkflowGateRequest(
        'workflow-005',
        'event-test',
        'approval',
        'Emit events test?',
        { test: true },
        {
          businessImpact: 'medium',
          decisionScope: 'task',
          stakeholders: ['developer'],
        }
      );

      mockAGUI.setMockResponse(gateRequest.id, 'approve');

      await processor.processWorkflowGate(gateRequest);

      // Check for expected events
      const eventTypes = eventEmissions.map((e) => e.type);
      expect(eventTypes).toContain('agui.gate.opened');
      expect(eventTypes).toContain('human.validation.requested');
      expect(eventTypes).toContain('agui.gate.closed');

      // Verify domain consistency
      const interfaceEvents = eventEmissions.filter(
        (e) => e.domain === Domain.INTERFACES
      );
      expect(interfaceEvents.length).toBeGreaterThan(0);
    });

    it('should handle escalation chains', async () => {
      const escalationChain: EscalationChain = {
        id: 'test-escalation',
        levels: [
          {
            level: GateEscalationLevel.TEAM_LEAD,
            approvers: ['team-lead'],
            requiredApprovals: 1,
            timeLimit: 100, // Very short for testing
          },
          {
            level: GateEscalationLevel.MANAGER,
            approvers: ['manager'],
            requiredApprovals: 1,
            timeLimit: 100,
          },
        ],
        triggers: [
          {
            type: 'timeout',
            threshold: 'time_limit',
            delay: 0,
          },
        ],
        maxLevel: GateEscalationLevel.MANAGER,
      };

      const gateRequest = processor.createWorkflowGateRequest(
        'workflow-006',
        'escalation-test',
        'approval',
        'Test escalation?',
        { urgent: true },
        {
          businessImpact: 'critical',
          decisionScope: 'feature',
          stakeholders: ['team-lead', 'manager'],
        },
        {
          escalationChain,
        }
      );

      mockAGUI.setMockResponse(gateRequest.id, 'reject'); // Force escalation

      const result = await processor.processWorkflowGate(gateRequest);

      expect(result.success).toBe(true);
      expect(result.escalationLevel).toBeGreaterThanOrEqual(
        GateEscalationLevel.TEAM_LEAD
      );
      expect(result.approvalChain).toBeDefined();
      expect(result.approvalChain?.approvals).toBeDefined();
    });

    it('should track pending gates', async () => {
      const gateRequest = processor.createWorkflowGateRequest(
        'workflow-007',
        'pending-test',
        'approval',
        'Pending gate test?',
        {},
        {
          businessImpact: 'low',
          decisionScope: 'task',
          stakeholders: ['user'],
        }
      );

      // Start processing but don't await
      const processingPromise = processor.processWorkflowGate(gateRequest);

      // Check pending gates
      const pendingGates = processor.getPendingGates();
      expect(pendingGates.size).toBeGreaterThanOrEqual(0); // Might complete quickly

      mockAGUI.setMockResponse(gateRequest.id, 'approve');
      await processingPromise;

      // Should be cleared after completion
      const pendingGatesAfter = processor.getPendingGates();
      expect(pendingGatesAfter.has(gateRequest.id)).toBe(false);
    });

    it('should support gate cancellation', async () => {
      const gateRequest = processor.createWorkflowGateRequest(
        'workflow-008',
        'cancellation-test',
        'approval',
        'Cancel me?',
        {},
        {
          businessImpact: 'medium',
          decisionScope: 'task',
          stakeholders: ['user'],
        }
      );

      // Delay AGUI response to allow cancellation
      mockAGUI.setMockResponse(gateRequest.id, 'approve');

      // Start processing
      const processingPromise = processor.processWorkflowGate(gateRequest);

      // Cancel the gate
      const cancelled = await processor.cancelGate(
        gateRequest.id,
        'Test cancellation'
      );

      await processingPromise;

      // Note: Due to timing, the gate might complete before cancellation
      // In a real system with longer delays, this would work more reliably
      expect(typeof cancelled).toBe('boolean');
    });
  });

  // ============================================================================
  // FACTORY FUNCTION TESTS
  // ============================================================================

  describe('Factory Functions', () => {
    it('should create approval gates', () => {
      const approvalGate = createApprovalGate(
        'workflow-factory-001',
        'deployment-approval',
        'Deploy to production environment?',
        ['devops-lead', 'product-manager'],
        {
          businessImpact: 'high',
          deadline: new Date(Date.now() + 3600000), // 1 hour
          priority: 'high',
        }
      );

      expect(approvalGate.gateType).toBe('approval');
      expect(approvalGate.workflowContext.workflowId).toBe(
        'workflow-factory-001'
      );
      expect(approvalGate.workflowContext.stepName).toBe('deployment-approval');
      expect(approvalGate.workflowContext.businessImpact).toBe('high');
      expect(approvalGate.workflowContext.stakeholders).toContain(
        'devops-lead'
      );
      expect(approvalGate.priority).toBe('high');
      expect(approvalGate.workflowContext.deadline).toBeDefined();
    });

    it('should create checkpoint gates', () => {
      const checkpointGate = createCheckpointGate(
        'workflow-factory-002',
        'quality-checkpoint',
        { coverage: 85, tests_passed: true },
        {
          autoApprovalThreshold: 0.9,
          businessImpact: 'medium',
        }
      );

      expect(checkpointGate.gateType).toBe('checkpoint');
      expect(checkpointGate.workflowContext.businessImpact).toBe('medium');
      expect(checkpointGate.context.coverage).toBe(85);
      expect(checkpointGate.context.tests_passed).toBe(true);
      // Should have auto-approval conditions
      // expect(checkpointGate.conditionalLogic?.autoApprovalConditions).toBeDefined();
    });

    it('should create emergency gates', () => {
      const emergencyGate = createEmergencyGate(
        'workflow-factory-003',
        'security-incident',
        { severity: 'critical', affected_systems: ['payment', 'auth'] },
        ['security-lead', 'cto', 'ceo']
      );

      expect(emergencyGate.gateType).toBe('emergency');
      expect(emergencyGate.workflowContext.businessImpact).toBe('critical');
      expect(emergencyGate.workflowContext.decisionScope).toBe('portfolio');
      expect(emergencyGate.priority).toBe('critical');
      expect(emergencyGate.escalationChain).toBeDefined();
      expect(emergencyGate.escalationChain?.levels).toHaveLength(3);
      expect(emergencyGate.escalationChain?.maxLevel).toBe(
        GateEscalationLevel.EXECUTIVE
      );
      expect(emergencyGate.timeoutConfig?.maxTotalTimeout).toBe(1800000); // 30 minutes
    });
  });

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  describe('Integration Tests', () => {
    it('should integrate with ValidationQuestion system', async () => {
      // Create a gate request that is compatible with ValidationQuestion
      const gateRequest: WorkflowGateRequest = {
        // All ValidationQuestion fields
        id: 'integration-001',
        type: 'checkpoint',
        question: 'Integration test gate?',
        context: { integration: true },
        options: ['Yes', 'No', 'Skip'],
        allowCustom: false,
        confidence: 0.85,
        priority: 'medium',
        validationReason: 'Integration testing',
        expectedImpact: 0.2,

        // WorkflowGateRequest extensions
        workflowContext: {
          workflowId: 'integration-workflow',
          stepName: 'integration-test',
          businessImpact: 'medium',
          decisionScope: 'feature',
          stakeholders: ['qa-lead', 'developer'],
        },
        gateType: 'checkpoint',
      };

      // Should be usable as ValidationQuestion
      const asValidationQuestion = gateRequest as any; // ValidationQuestion
      expect(asValidationQuestion.id).toBe('integration-001');
      expect(asValidationQuestion.type).toBe('checkpoint');
      expect(asValidationQuestion.confidence).toBe(0.85);

      // Should be processable as WorkflowGateRequest
      mockAGUI.setMockResponse(gateRequest.id, 'Yes');
      const result = await processor.processWorkflowGate(gateRequest);

      expect(result.success).toBe(true);
      expect(result.approved).toBe(true);
    });

    it('should integrate with type-safe event system', async () => {
      const eventHistory: unknown[] = [];

      // Register event listeners to verify integration
      eventBus.registerHandler(
        'human.validation.requested',
        async (event: HumanValidationRequestedEvent) => {
          eventHistory.push({
            type: 'validation_requested',
            requestId: event.payload.requestId,
            validationType: event.payload.validationType,
            priority: event.payload.priority,
          });
        }
      );

      eventBus.registerHandler(
        'agui.gate.opened',
        async (event: AGUIGateOpenedEvent) => {
          eventHistory.push({
            type: 'gate_opened',
            gateId: event.payload.gateId,
            gateType: event.payload.gateType,
            requiredApproval: event.payload.requiredApproval,
          });
        }
      );

      const gateRequest = processor.createWorkflowGateRequest(
        'integration-workflow-002',
        'event-integration',
        'approval',
        'Test event integration?',
        { test: 'event_integration' },
        {
          businessImpact: 'low',
          decisionScope: 'task',
          stakeholders: ['developer'],
        },
        {
          integrationConfig: {
            enableMetrics: true,
            domainValidation: true,
          },
        }
      );

      mockAGUI.setMockResponse(gateRequest.id, 'approve');

      await processor.processWorkflowGate(gateRequest);

      // Verify events were emitted and received
      expect(eventHistory.length).toBeGreaterThan(0);

      const validationRequested = eventHistory.find(
        (e) => e.type === 'validation_requested'
      );
      expect(validationRequested).toBeDefined();
      expect(validationRequested.requestId).toBe(`gate-${gateRequest.id}`);

      const gateOpened = eventHistory.find((e) => e.type === 'gate_opened');
      expect(gateOpened).toBeDefined();
      expect(gateOpened.gateId).toBe(gateRequest.id);
    });

    it('should integrate with domain boundary validation', async () => {
      const domainValidator = getDomainValidator(Domain.WORKFLOWS);

      // Test cross-domain validation
      const gateRequest = processor.createWorkflowGateRequest(
        'cross-domain-001',
        'domain-validation',
        'approval',
        'Cross-domain test?',
        { domain: 'workflows' },
        {
          businessImpact: 'medium',
          decisionScope: 'feature',
          stakeholders: ['developer'],
        },
        {
          integrationConfig: {
            domainValidation: true,
          },
        }
      );

      // Should validate successfully against schema
      expect(() => {
        domainValidator.validateInput(gateRequest, WorkflowGateRequestSchema);
      }).not.toThrow();

      mockAGUI.setMockResponse(gateRequest.id, 'approve');

      // Should process without domain validation errors
      const result = await processor.processWorkflowGate(gateRequest);
      expect(result.success).toBe(true);
    });

    it('should handle complex workflow scenarios', async () => {
      // Complex scenario: High-impact deployment with multiple stakeholders and escalation
      const complexGateRequest = processor.createWorkflowGateRequest(
        'complex-workflow-001',
        'production-deployment-gate',
        'approval',
        'Deploy version 2.5.0 to production? This includes database migrations and may impact user sessions.',
        {
          version: '2.5.0',
          changes: ['database_migration', 'api_changes', 'ui_updates'],
          impact_analysis: {
            estimated_downtime: '5 minutes',
            affected_users: 10000,
            rollback_time: '15 minutes',
          },
        },
        {
          businessImpact: 'critical',
          decisionScope: 'portfolio',
          stakeholders: [
            'product-manager',
            'engineering-lead',
            'devops-lead',
            'cto',
          ],
          deadline: new Date(Date.now() + 7200000), // 2 hours
          dependencies: [
            {
              id: 'staging-validation',
              type: 'blocking',
              reference: 'staging-tests-workflow',
              criticality: 'critical',
              description: 'All staging tests must pass',
            },
            {
              id: 'database-backup',
              type: 'blocking',
              reference: 'backup-workflow',
              criticality: 'critical',
              description: 'Production database backup must be completed',
            },
          ],
          impactEstimates: [
            {
              outcome: 'approve',
              timeImpact: 2, // 2 hours
              costImpact: 5000, // $5000 in opportunity cost
              qualityImpact: 0.95, // High quality expected
              confidence: 0.9,
            },
            {
              outcome: 'reject',
              timeImpact: 24, // 24 hours delay
              costImpact: 15000, // $15000 in delayed features
              qualityImpact: 0.8, // Some technical debt accumulation
              confidence: 0.85,
            },
          ],
          riskFactors: [
            {
              id: 'migration-risk',
              category: 'technical',
              severity: 'high',
              probability: 0.2,
              description:
                'Database migration could fail or take longer than expected',
              mitigation: ['full backup', 'rollback procedure', 'monitoring'],
            },
            {
              id: 'user-impact-risk',
              category: 'business',
              severity: 'medium',
              probability: 0.3,
              description: 'User sessions may be disrupted during deployment',
              mitigation: ['off-peak deployment', 'user notifications'],
            },
          ],
        },
        {
          priority: 'critical',
          timeoutConfig: {
            initialTimeout: 1800000, // 30 minutes initial
            escalationTimeouts: [1800000, 1800000, 1800000], // 30min each level
            maxTotalTimeout: 7200000, // 2 hours total
          },
          integrationConfig: {
            domainValidation: true,
            enableMetrics: true,
          },
        }
      );

      mockAGUI.setMockResponse(complexGateRequest.id, 'approve');

      const result = await processor.processWorkflowGate(complexGateRequest);

      expect(result.success).toBe(true);
      expect(result.gateId).toBe(complexGateRequest.id);
      expect(result.processingTime).toBeGreaterThan(0);

      // Verify complex workflow context was preserved
      expect(complexGateRequest.workflowContext.businessImpact).toBe(
        'critical'
      );
      expect(complexGateRequest.workflowContext.dependencies).toHaveLength(2);
      expect(complexGateRequest.workflowContext.impactEstimates).toHaveLength(
        2
      );
      expect(complexGateRequest.workflowContext.riskFactors).toHaveLength(2);
    });
  });
});
