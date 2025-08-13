/**
 * @file Unit tests for WorkflowAGUIAdapter - Phase 1, Task 1.3
 *
 * Comprehensive testing of workflow-aware AGUI capabilities including
 * enhanced prompts, decision logging, timeout handling, and escalation.
 */

import { EventEmitter } from 'events';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  createApprovalGate,
  createCheckpointGate,
  createEmergencyGate,
  GateEscalationLevel,
  WorkflowGateRequest,
} from '../../../coordination/workflows/workflow-gate-request.ts';
import { Domain } from '../../../core/domain-boundary-validator.ts';
import {
  createTypeSafeEventBus,
  EventPriority,
  type TypeSafeEventBus,
} from '../../../core/type-safe-event-system.ts';
import {
  createTestWorkflowAGUIAdapter,
  createWorkflowAGUIAdapter,
  WorkflowAGUIAdapter,
  type WorkflowAGUIConfig,
  type WorkflowDecisionAudit,
} from '../../../interfaces/agui/workflow-agui-adapter.ts';

// Mock readline to avoid terminal interaction in tests
vi.mock('node:readline', () => ({
  createInterface: vi.fn(() => ({
    question: vi.fn(),
    close: vi.fn(),
  })),
}));

// Mock console methods to capture output
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
let consoleOutput: string[] = [];

beforeEach(() => {
  consoleOutput = [];
  console.log = vi.fn((message: string) => {
    consoleOutput.push(message);
  });
  console.warn = vi.fn((message: string) => {
    consoleOutput.push(`WARN: ${message}`);
  });
});

afterEach(() => {
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
});

describe('WorkflowAGUIAdapter', () => {
  let eventBus: TypeSafeEventBus;
  let adapter: WorkflowAGUIAdapter;

  beforeEach(() => {
    eventBus = createTypeSafeEventBus({
      enableMetrics: false,
      enableCaching: false,
      domainValidation: false,
    });
    adapter = createTestWorkflowAGUIAdapter(eventBus);
  });

  afterEach(async () => {
    await adapter.shutdown();
    await eventBus.shutdown();
  });

  // ============================================================================
  // BASIC FUNCTIONALITY TESTS
  // ============================================================================

  describe('Initialization and Configuration', () => {
    test('should initialize with default configuration', () => {
      const defaultAdapter = createWorkflowAGUIAdapter(eventBus);
      const stats = defaultAdapter.getStatistics();

      expect(stats.totalDecisionAudits).toBe(0);
      expect(stats.activeGates).toBe(0);
      expect(stats.config.enableRichPrompts).toBe(true);
      expect(stats.config.enableDecisionLogging).toBe(true);
    });

    test('should initialize with custom configuration', () => {
      const customConfig: Partial<WorkflowAGUIConfig> = {
        enableRichPrompts: false,
        enableDecisionLogging: false,
        auditRetentionDays: 30,
        maxAuditRecords: 500,
      };

      const customAdapter = new WorkflowAGUIAdapter(eventBus, customConfig);
      const stats = customAdapter.getStatistics();

      expect(stats.config.enableRichPrompts).toBe(false);
      expect(stats.config.enableDecisionLogging).toBe(false);
      expect(stats.config.auditRetentionDays).toBe(30);
      expect(stats.config.maxAuditRecords).toBe(500);
    });

    test('should handle shutdown gracefully', async () => {
      const shutdownAdapter = createWorkflowAGUIAdapter(eventBus);
      await expect(shutdownAdapter.shutdown()).resolves.not.toThrow();
    });
  });

  // ============================================================================
  // WORKFLOW GATE PROCESSING TESTS
  // ============================================================================

  describe('Workflow Gate Processing', () => {
    test('should process a simple approval gate', async () => {
      const approvalGate = createApprovalGate(
        'test-workflow-001',
        'user-registration',
        'Should we proceed with user registration feature?',
        ['product-manager', 'tech-lead'],
        {
          businessImpact: 'medium',
          priority: 'high',
        }
      );

      // Mock user input
      const originalAskQuestion = adapter.askQuestion;
      vi.spyOn(adapter, 'askQuestion').mockImplementation(async (question) => {
        if ('workflowContext' in question) {
          return 'approved';
        }
        return originalAskQuestion.call(adapter, question);
      });

      const response = await adapter.processWorkflowGate(approvalGate);

      expect(response).toBe('approved');

      // Check decision audit
      const auditHistory =
        adapter.getWorkflowDecisionHistory('test-workflow-001');
      expect(auditHistory).toHaveLength(1);
      expect(auditHistory[0]!.decision).toBe('approved');
      expect(auditHistory[0]!.gateId).toBe(approvalGate.id);
    });

    test(
      'should process a checkpoint gate with auto-approval',
      { timeout: 5000 },
      async () => {
        const checkpointData = {
          confidence: 0.95,
          validationResults: ['all tests passed', 'code coverage > 90%'],
        };

        const checkpointGate = createCheckpointGate(
          'test-workflow-002',
          'pre-deployment-check',
          checkpointData,
          {
            autoApprovalThreshold: 0.9,
            businessImpact: 'low',
          }
        );

        // Mock the base askQuestion to return a positive response immediately
        const mockAskQuestion = vi
          .spyOn(adapter, 'askQuestion')
          .mockImplementation(async () => {
            return 'continue';
          });

        const response = await adapter.processWorkflowGate(checkpointGate);

        expect(response).toBe('continue');

        // Verify audit logging
        const stats = adapter.getStatistics();
        expect(stats.totalDecisionAudits).toBe(1);
      }
    );

    test(
      'should handle emergency gates with urgency markers',
      { timeout: 5000 },
      async () => {
        const emergencyGate = createEmergencyGate(
          'test-workflow-003',
          'security-breach-response',
          {
            severity: 'critical',
            affectedSystems: ['user-database', 'payment-gateway'],
          },
          ['security-lead', 'cto', 'ceo']
        );

        const mockAskQuestion = vi
          .spyOn(adapter, 'askQuestion')
          .mockImplementation(async () => {
            return 'emergency approved - immediate action required';
          });

        const response = await adapter.processWorkflowGate(emergencyGate);

        expect(response).toBe(
          'URGENT: emergency approved - immediate action required'
        );
      }
    );

    test('should handle gate processing errors gracefully', async () => {
      const invalidGate = createApprovalGate(
        '', // Invalid empty workflow ID
        'test-step',
        'Test question?',
        []
      );

      await expect(adapter.processWorkflowGate(invalidGate)).rejects.toThrow(
        'Gate validation failed'
      );
    });
  });

  // ============================================================================
  // DECISION LOGGING AND AUDIT TRAIL TESTS
  // ============================================================================

  describe('Decision Logging and Audit Trail', () => {
    test(
      'should maintain decision audit trail',
      { timeout: 5000 },
      async () => {
        const gate1 = createApprovalGate('wf-001', 'step-1', 'Question 1?', [
          'user1',
        ]);
        const gate2 = createApprovalGate('wf-001', 'step-2', 'Question 2?', [
          'user2',
        ]);

        const mockAskQuestion = vi
          .spyOn(adapter, 'askQuestion')
          .mockImplementationOnce(async () => 'approved')
          .mockImplementationOnce(async () => 'rejected');

        await adapter.processWorkflowGate(gate1);
        await adapter.processWorkflowGate(gate2);

        const history = adapter.getWorkflowDecisionHistory('wf-001');
        expect(history).toHaveLength(2);
        expect(history[0]!.decision).toBe('approved');
        expect(history[1]!.decision).toBe('rejected');
      }
    );

    test('should export audit trail as JSON', async () => {
      const gate = createApprovalGate('wf-export', 'step-1', 'Export test?', [
        'user',
      ]);

      vi.spyOn(adapter, 'askQuestion').mockResolvedValue('approved');
      await adapter.processWorkflowGate(gate);

      const jsonExport = adapter.exportAuditTrail('json');
      const auditData = JSON.parse(jsonExport) as WorkflowDecisionAudit[];

      expect(Array.isArray(auditData)).toBe(true);
      expect(auditData).toHaveLength(1);
      expect(auditData[0]!.workflowId).toBe('wf-export');
    });

    test('should export audit trail as CSV', async () => {
      const gate = createApprovalGate('wf-csv', 'csv-step', 'CSV test?', [
        'csv-user',
      ]);

      vi.spyOn(adapter, 'askQuestion').mockResolvedValue('csv-approved');
      await adapter.processWorkflowGate(gate);

      const csvExport = adapter.exportAuditTrail('csv');
      const lines = csvExport.split('\n');

      expect(lines).toHaveLength(2); // Header + 1 data row
      expect(lines[0]).toContain('Gate ID');
      expect(lines[1]).toContain('wf-csv');
    });

    test('should limit audit records based on configuration', async () => {
      const limitedAdapter = new WorkflowAGUIAdapter(eventBus, {
        maxAuditRecords: 2,
        auditRetentionDays: 1,
      });

      vi.spyOn(limitedAdapter, 'askQuestion').mockResolvedValue('test');

      // Add 3 records to test the limit
      for (let i = 0; i < 3; i++) {
        const gate = createApprovalGate(`wf-${i}`, `step-${i}`, 'Test?', [
          'user',
        ]);
        await limitedAdapter.processWorkflowGate(gate);
      }

      const allAudits = limitedAdapter.getAllDecisionAudits();
      expect(allAudits.length).toBeLessThanOrEqual(2);
    });
  });

  // ============================================================================
  // ENHANCED PROMPT DISPLAY TESTS
  // ============================================================================

  describe('Enhanced Prompt Display', () => {
    test('should display rich workflow prompts when enabled', async () => {
      const richAdapter = new WorkflowAGUIAdapter(eventBus, {
        enableRichPrompts: true,
      });

      const gate = createApprovalGate(
        'rich-workflow',
        'complex-step',
        'Should we proceed with this complex operation?',
        ['stakeholder1', 'stakeholder2'],
        {
          businessImpact: 'critical',
          deadline: new Date(Date.now() + 3600000), // 1 hour from now
        }
      );

      // Add some context
      gate.workflowContext = {
        ...gate.workflowContext,
        dependencies: [
          {
            id: 'dep-1',
            type: 'blocking',
            reference: 'database-migration',
            criticality: 'high',
            description: 'Database schema update required',
          },
        ],
        riskFactors: [
          {
            id: 'risk-1',
            category: 'technical',
            severity: 'medium',
            probability: 0.3,
            description: 'Potential performance impact during migration',
          },
        ],
      };

      vi.spyOn(richAdapter, 'askQuestion').mockResolvedValue('approved');

      await richAdapter.processWorkflowGate(gate);

      // Verify that rich prompt elements are displayed
      expect(
        consoleOutput.some((output) => output.includes('WORKFLOW GATE'))
      ).toBe(true);
      expect(
        consoleOutput.some((output) => output.includes('rich-workflow'))
      ).toBe(true);
      expect(consoleOutput.some((output) => output.includes('CRITICAL'))).toBe(
        true
      );
    });

    test('should not display rich prompts when disabled', async () => {
      const simpleAdapter = new WorkflowAGUIAdapter(eventBus, {
        enableRichPrompts: false,
      });

      const gate = createApprovalGate(
        'simple-workflow',
        'simple-step',
        'Simple question?',
        ['user']
      );

      vi.spyOn(simpleAdapter, 'askQuestion').mockResolvedValue('approved');

      await simpleAdapter.processWorkflowGate(gate);

      // Should not contain rich prompt elements
      expect(
        consoleOutput.some((output) => output.includes('WORKFLOW GATE'))
      ).toBe(false);
    });
  });

  // ============================================================================
  // TIMEOUT AND ESCALATION TESTS
  // ============================================================================

  describe('Timeout and Escalation Handling', () => {
    test('should handle gate timeout with notifications', (done) => {
      const timeoutAdapter = new WorkflowAGUIAdapter(eventBus, {
        enableTimeoutHandling: true,
        timeoutConfig: {
          initialTimeout: 100, // 100ms for fast test
          escalationTimeouts: [200],
          maxTotalTimeout: 500,
          enableAutoEscalation: false,
          notifyOnTimeout: true,
        },
      });

      const gate = createApprovalGate(
        'timeout-test',
        'timeout-step',
        'Timeout test?',
        ['user']
      );
      gate.timeoutConfig = {
        initialTimeout: 100,
        escalationTimeouts: [200],
        maxTotalTimeout: 500,
      };

      // Don't provide immediate response to trigger timeout
      vi.spyOn(timeoutAdapter, 'askQuestion').mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve('late-response'), 300)
          )
      );

      // Listen for timeout events
      eventBus.registerHandler('agui.gate.timeout', async (event) => {
        expect(event.payload.gateId).toBe(gate.id);
        done();
      });

      timeoutAdapter.processWorkflowGate(gate).catch(() => {
        // Expected to timeout
      });
    });

    test('should handle escalation properly', (done) => {
      const escalationAdapter = new WorkflowAGUIAdapter(eventBus, {
        enableEscalationManagement: true,
        timeoutConfig: {
          initialTimeout: 50,
          escalationTimeouts: [100],
          maxTotalTimeout: 300,
          enableAutoEscalation: true,
          notifyOnTimeout: true,
        },
      });

      const gate = createApprovalGate(
        'escalation-test',
        'escalation-step',
        'Escalation test?',
        ['user']
      );

      // Listen for escalation events
      eventBus.registerHandler('agui.gate.escalated', async (event) => {
        expect(event.payload.gateId).toBe(gate.id);
        expect(event.payload.newLevel).toBe(GateEscalationLevel.TEAM_LEAD);
        done();
      });

      // Mock delayed response
      vi.spyOn(escalationAdapter, 'askQuestion').mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve('escalated-response'), 200)
          )
      );

      escalationAdapter.processWorkflowGate(gate).catch(() => {
        // Expected behavior for timeout/escalation scenarios
      });
    });
  });

  // ============================================================================
  // EVENT INTEGRATION TESTS
  // ============================================================================

  describe('Event System Integration', () => {
    test('should emit gate opened and closed events', async () => {
      const gateOpenedEvents: unknown[] = [];
      const gateClosedEvents: unknown[] = [];

      eventBus.registerHandler('agui.gate.opened', async (event) => {
        gateOpenedEvents.push(event);
      });

      eventBus.registerHandler('agui.gate.closed', async (event) => {
        gateClosedEvents.push(event);
      });

      const gate = createApprovalGate(
        'event-test',
        'event-step',
        'Event test?',
        ['user']
      );

      vi.spyOn(adapter, 'askQuestion').mockResolvedValue('approved');

      await adapter.processWorkflowGate(gate);

      // Allow event processing
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(gateOpenedEvents).toHaveLength(1);
      expect(gateClosedEvents).toHaveLength(1);
      expect(gateOpenedEvents[0].payload.gateId).toBe(gate.id);
      expect(gateClosedEvents[0].payload.gateId).toBe(gate.id);
    });

    test('should emit workflow decision audit events', async () => {
      const auditEvents: unknown[] = [];

      eventBus.registerHandler('workflow.decision.audited', async (event) => {
        auditEvents.push(event);
      });

      const gate = createApprovalGate(
        'audit-event-test',
        'audit-step',
        'Audit event test?',
        ['user']
      );

      vi.spyOn(adapter, 'askQuestion').mockResolvedValue('approved');

      await adapter.processWorkflowGate(gate);

      // Allow event processing
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(auditEvents).toHaveLength(1);
      expect(auditEvents[0].payload.auditRecord.gateId).toBe(gate.id);
    });
  });

  // ============================================================================
  // BATCH PROCESSING TESTS
  // ============================================================================

  describe('Batch Question Processing', () => {
    test('should handle mixed workflow gates and standard questions', async () => {
      const workflowGate = createApprovalGate(
        'batch-workflow',
        'batch-step',
        'Workflow gate?',
        ['user']
      );
      const standardQuestion = {
        id: 'std-1',
        type: 'relevance' as const,
        question: 'Standard question?',
        context: {},
        confidence: 0.8,
      };

      vi.spyOn(adapter, 'askQuestion')
        .mockResolvedValueOnce('workflow-approved')
        .mockResolvedValueOnce('standard-answer');

      const responses = await adapter.askBatchQuestions([
        workflowGate,
        standardQuestion,
      ]);

      expect(responses).toHaveLength(2);
      expect(responses[0]).toBe('workflow-approved');
      expect(responses[1]).toBe('standard-answer');
    });
  });

  // ============================================================================
  // RESPONSE PROCESSING TESTS
  // ============================================================================

  describe('Response Processing', () => {
    test('should process approval responses correctly', async () => {
      const gate = createApprovalGate(
        'approval-processing',
        'approval-step',
        'Approve?',
        ['user']
      );

      vi.spyOn(adapter, 'askQuestion').mockResolvedValue(
        'yes, I approve this change'
      );

      const response = await adapter.processWorkflowGate(gate);

      expect(response).toBe('approved');
    });

    test('should process rejection responses correctly', async () => {
      const gate = createApprovalGate(
        'rejection-processing',
        'rejection-step',
        'Approve?',
        ['user']
      );

      vi.spyOn(adapter, 'askQuestion').mockResolvedValue(
        'no, I reject this proposal'
      );

      const response = await adapter.processWorkflowGate(gate);

      expect(response).toBe('rejected');
    });

    test('should process emergency responses with urgency markers', async () => {
      const gate = createEmergencyGate(
        'emergency-processing',
        'emergency-step',
        { severity: 'critical' },
        ['emergency-contact']
      );

      vi.spyOn(adapter, 'askQuestion').mockResolvedValue(
        'emergency action approved immediately'
      );

      const response = await adapter.processWorkflowGate(gate);

      expect(response).toBe('URGENT: emergency action approved immediately');
    });
  });

  // ============================================================================
  // FACTORY FUNCTION TESTS
  // ============================================================================

  describe('Factory Functions', () => {
    test('should create test adapter with appropriate config', () => {
      const testAdapter = createTestWorkflowAGUIAdapter(eventBus);
      const stats = testAdapter.getStatistics();

      expect(stats.config.enableRichPrompts).toBe(false);
      expect(stats.config.enableTimeoutHandling).toBe(false);
      expect(stats.config.auditRetentionDays).toBe(1);
    });

    test('should create standard adapter with default config', () => {
      const standardAdapter = createWorkflowAGUIAdapter(eventBus);
      const stats = standardAdapter.getStatistics();

      expect(stats.config.enableRichPrompts).toBe(true);
      expect(stats.config.enableDecisionLogging).toBe(true);
    });
  });
});
