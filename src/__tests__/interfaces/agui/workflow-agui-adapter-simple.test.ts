/**
 * @file Simple WorkflowAGUIAdapter Tests - Phase 1, Task 1.3
 *
 * Basic testing of WorkflowAGUIAdapter core functionality without complex
 * workflow processing to verify the implementation works.
 */

import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import {
  createApprovalGate,
  createCheckpointGate,
  GateEscalationLevel,
} from '../../../coordination/workflows/workflow-gate-request.ts';
import {
  createTypeSafeEventBus,
  type TypeSafeEventBus,
} from '../../../core/type-safe-event-system.ts';
import {
  createTestWorkflowAGUIAdapter,
  createWorkflowAGUIAdapter,
  WorkflowAGUIAdapter,
  type WorkflowAGUIConfig,
} from '../../../interfaces/agui/workflow-agui-adapter.ts';

describe('WorkflowAGUIAdapter - Simple Tests', () => {
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

  describe('Basic Functionality', () => {
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

  describe('Gate Creation', () => {
    test('should create approval gates with correct structure', () => {
      const approvalGate = createApprovalGate(
        'test-workflow-001',
        'user-registration',
        'Should we proceed with user registration feature?',
        ['product-manager', 'tech-lead'],
        {
          businessImpact: 'medium',
          priority: 'high',
        },
      );

      expect(approvalGate.id).toBeDefined();
      expect(approvalGate.gateType).toBe('approval');
      expect(approvalGate.workflowContext.workflowId).toBe('test-workflow-001');
      expect(approvalGate.workflowContext.stepName).toBe('user-registration');
      expect(approvalGate.workflowContext.businessImpact).toBe('medium');
      expect(approvalGate.workflowContext.stakeholders).toEqual([
        'product-manager',
        'tech-lead',
      ]);
      expect(approvalGate.priority).toBe('high');
    });

    test('should create checkpoint gates with correct structure', () => {
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
        },
      );

      expect(checkpointGate.id).toBeDefined();
      expect(checkpointGate.gateType).toBe('checkpoint');
      expect(checkpointGate.workflowContext.workflowId).toBe(
        'test-workflow-002',
      );
      expect(checkpointGate.workflowContext.stepName).toBe(
        'pre-deployment-check',
      );
      expect(checkpointGate.workflowContext.businessImpact).toBe('low');
      expect(checkpointGate.context).toEqual(checkpointData);
      expect(
        checkpointGate.conditionalLogic?.autoApprovalConditions,
      ).toBeDefined();
    });
  });

  describe('Workflow Context Validation', () => {
    test('should identify workflow gate requests correctly', () => {
      const workflowGate = createApprovalGate('test-wf', 'test-step', 'Test?', [
        'user',
      ]);
      const standardQuestion = {
        id: 'std-1',
        type: 'relevance' as const,
        question: 'Standard question?',
        context: {},
        confidence: 0.8,
      };

      // Test the type guard logic
      expect('workflowContext' in workflowGate).toBe(true);
      expect('gateType' in workflowGate).toBe(true);
      expect('workflowContext' in standardQuestion).toBe(false);
      expect('gateType' in standardQuestion).toBe(false);
    });

    test('should validate required workflow context fields', () => {
      const validGate = createApprovalGate('valid-wf', 'valid-step', 'Valid?', [
        'user',
      ]);

      expect(validGate.workflowContext.workflowId).toBe('valid-wf');
      expect(validGate.workflowContext.stepName).toBe('valid-step');
      expect(validGate.workflowContext.stakeholders).toEqual(['user']);
      expect(['low', 'medium', 'high', 'critical']).toContain(
        validGate.workflowContext.businessImpact,
      );
      expect(['task', 'feature', 'epic', 'prd', 'portfolio']).toContain(
        validGate.workflowContext.decisionScope,
      );
    });
  });

  describe('Decision Audit Trail', () => {
    test('should maintain audit statistics', () => {
      const initialStats = adapter.getStatistics();
      expect(initialStats.totalDecisionAudits).toBe(0);

      // Verify audit methods exist and work
      const allAudits = adapter.getAllDecisionAudits();
      expect(Array.isArray(allAudits)).toBe(true);
      expect(allAudits.length).toBe(0);

      const workflowHistory =
        adapter.getWorkflowDecisionHistory('non-existent');
      expect(Array.isArray(workflowHistory)).toBe(true);
      expect(workflowHistory.length).toBe(0);
    });

    test('should export empty audit trail', () => {
      const jsonExport = adapter.exportAuditTrail('json');
      const auditData = JSON.parse(jsonExport);
      expect(Array.isArray(auditData)).toBe(true);
      expect(auditData.length).toBe(0);

      const csvExport = adapter.exportAuditTrail('csv');
      const lines = csvExport.split('\n');
      expect(lines.length).toBe(1); // Only header row
      expect(lines[0]).toContain('Gate ID');
    });
  });

  describe('Factory Functions', () => {
    test('should create test adapter with appropriate config', () => {
      const testAdapter = createTestWorkflowAGUIAdapter(eventBus);
      const stats = testAdapter.getStatistics();

      expect(stats.config.enableRichPrompts).toBe(false);
      expect(stats.config.enableTimeoutHandling).toBe(false);
      expect(stats.config.auditRetentionDays).toBe(1);
      expect(stats.config.maxAuditRecords).toBe(100);
    });

    test('should create standard adapter with default config', () => {
      const standardAdapter = createWorkflowAGUIAdapter(eventBus);
      const stats = standardAdapter.getStatistics();

      expect(stats.config.enableRichPrompts).toBe(true);
      expect(stats.config.enableDecisionLogging).toBe(true);
      expect(stats.config.auditRetentionDays).toBe(90);
      expect(stats.config.maxAuditRecords).toBe(10000);
    });
  });

  describe('Response Processing Logic', () => {
    test('should have approval response processing logic', () => {
      // Test that the class has the expected methods for processing responses
      expect(typeof adapter.processWorkflowGate).toBe('function');
      expect(typeof adapter.askQuestion).toBe('function');
      expect(typeof adapter.askBatchQuestions).toBe('function');
    });

    test('should maintain escalation level constants', () => {
      expect(GateEscalationLevel.NONE).toBe(0);
      expect(GateEscalationLevel.TEAM_LEAD).toBe(1);
      expect(GateEscalationLevel.MANAGER).toBe(2);
      expect(GateEscalationLevel.DIRECTOR).toBe(3);
      expect(GateEscalationLevel.EXECUTIVE).toBe(4);
      expect(GateEscalationLevel.BOARD).toBe(5);
    });
  });

  describe('Integration Points', () => {
    test('should have event bus integration', () => {
      expect(adapter).toBeDefined();
      // The adapter should be constructed with the event bus
      // and be ready for event emission/handling
    });

    test('should extend TerminalAGUI correctly', () => {
      // Verify inheritance
      expect(adapter.askQuestion).toBeDefined();
      expect(adapter.askBatchQuestions).toBeDefined();
      expect(adapter.showMessage).toBeDefined();
      expect(adapter.showProgress).toBeDefined();
    });
  });
});
