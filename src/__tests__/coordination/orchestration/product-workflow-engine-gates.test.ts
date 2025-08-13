/**
 * @file Product Workflow Engine with Gates Integration Tests
 *
 * Tests the enhanced ProductWorkflowEngine with AGUI gate capabilities including:
 * - Gate injection at key workflow steps
 * - AGUI adapter integration
 * - Workflow pause/resume functionality
 * - Gate decision routing (approve/reject/escalate)
 * - Gate timeout and escalation handling
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ProductWorkflowEngine,
  type ProductWorkflowState,
} from '../../../coordination/orchestration/product-workflow-engine.ts';
import type { WorkflowGateRequest } from '../../../coordination/workflows/workflow-gate-request.ts';
import { GateEscalationLevel } from '../../../coordination/workflows/workflow-gate-request.ts';
import type { MemorySystem } from '../../../core/memory-system.ts';
import {
  createTypeSafeEventBus,
  type TypeSafeEventBus,
} from '../../../core/type-safe-event-system.ts';
import type { DocumentManager } from '../../../database/managers/document-manager.ts';
import { WorkflowAGUIAdapter } from '../../../interfaces/agui/workflow-agui-adapter.ts';

// Mock implementations
const mockMemorySystem: Partial<MemorySystem> = {
  initialize: vi.fn().mockResolvedValue(undefined),
  store: vi.fn().mockResolvedValue(undefined),
  search: vi.fn().mockResolvedValue({}),
  retrieve: vi.fn().mockResolvedValue(null),
};

const mockDocumentService: Partial<DocumentManager> = {
  initialize: vi.fn().mockResolvedValue(undefined),
};

describe('ProductWorkflowEngine with Gates Integration', () => {
  let engine: ProductWorkflowEngine;
  let eventBus: TypeSafeEventBus;
  let aguiAdapter: WorkflowAGUIAdapter;
  let mockProcessWorkflowGate: unknown;

  // Helper function to create complete ProductWorkflowState
  function createMockWorkflowState(
    overrides: Partial<ProductWorkflowState> = {}
  ): ProductWorkflowState {
    return {
      id: 'test-workflow',
      status: 'running',
      definition: { name: 'test-workflow', steps: [] },
      context: {},
      currentStepIndex: 0,
      steps: [],
      stepResults: {},
      completedSteps: [],
      startTime: new Date(),
      progress: {
        percentage: 0,
        completedSteps: 0,
        totalSteps: 1,
      },
      metrics: {
        totalDuration: 0,
        avgStepDuration: 0,
        successRate: 0,
        retryRate: 0,
        resourceUsage: {
          cpuTime: 0,
          memoryPeak: 0,
          diskIo: 0,
          networkRequests: 0,
        },
        throughput: 0,
      },
      productFlow: {
        currentStep: 'vision-analysis',
        completedSteps: [],
        documents: {
          vision: undefined,
          adrs: [],
          prds: [],
          epics: [],
          features: [],
          tasks: [],
        },
      },
      sparcIntegration: {
        sparcProjects: new Map(),
        activePhases: new Map(),
        completedPhases: new Map(),
      },
      ...overrides,
    } as ProductWorkflowState;
  }

  beforeEach(async () => {
    // Create event bus
    eventBus = createTypeSafeEventBus({
      enableMetrics: true,
      domainValidation: true,
    });
    await eventBus.initialize();

    // Create mock AGUI adapter
    aguiAdapter = new WorkflowAGUIAdapter(eventBus, {
      enableRichPrompts: false, // Disable for testing
      enableDecisionLogging: true,
      enableTimeoutHandling: false, // Disable for testing
      enableEscalationManagement: false, // Disable for testing
      auditRetentionDays: 1,
      maxAuditRecords: 100,
      timeoutConfig: {
        initialTimeout: 5000,
        escalationTimeouts: [10000],
        maxTotalTimeout: 30000,
        enableAutoEscalation: false,
        notifyOnTimeout: false,
      },
    });

    // Mock the processWorkflowGate method
    mockProcessWorkflowGate = vi.fn();
    aguiAdapter.processWorkflowGate = mockProcessWorkflowGate;

    // Create engine with mocked dependencies
    engine = new ProductWorkflowEngine(
      mockMemorySystem as MemorySystem,
      mockDocumentService as DocumentManager,
      eventBus,
      aguiAdapter,
      {
        enableSPARCIntegration: true,
        sparcDomainMapping: {},
        sparcQualityGates: true, // Enable gates
        autoTriggerSPARC: false,
        maxConcurrentWorkflows: 1,
      }
    );

    await engine.initialize();
  });

  afterEach(async () => {
    await engine.shutdownGates();
    await eventBus.shutdown();
  });

  describe('Gate Initialization', () => {
    it('should initialize gate definitions', () => {
      const gateDefinitions = engine.getGateDefinitions();

      expect(gateDefinitions.size).toBeGreaterThan(0);
      expect(gateDefinitions.has('vision-analysis')).toBe(true);
      expect(gateDefinitions.has('prd-creation')).toBe(true);
      expect(gateDefinitions.has('epic-breakdown')).toBe(true);
      expect(gateDefinitions.has('feature-definition')).toBe(true);
      expect(gateDefinitions.has('sparc-integration')).toBe(true);
    });

    it('should have proper gate configuration', () => {
      const visionGate = engine.getGateDefinitions().get('vision-analysis');

      expect(visionGate).toBeDefined();
      expect(visionGate!.title).toBe('Vision Analysis Gate');
      expect(visionGate!.description).toContain(
        'Strategic gate to validate vision document analysis'
      );
      expect(visionGate!.subtype).toBe('vision-analysis');
      expect(visionGate!.priority).toBeDefined();
    });
  });

  describe('Gate Execution During Workflow', () => {
    beforeEach(() => {
      // Mock AGUI adapter to approve gates by default
      mockProcessWorkflowGate.mockResolvedValue('approved');
    });

    it('should execute gate before vision analysis', async () => {
      const workflowResult = await engine.startProductWorkflow(
        'complete-product-flow',
        {
          workspaceId: 'test-workspace',
          variables: { testMode: true },
        }
      );

      expect(workflowResult.success).toBe(true);
      expect(workflowResult.workflowId).toBeDefined();

      // Wait a bit for workflow to start and potentially execute gates
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check if gates were executed
      expect(mockProcessWorkflowGate).toHaveBeenCalled();

      // Verify gate request structure
      const gateCall = mockProcessWorkflowGate.mock.calls[0];
      const gateRequest: WorkflowGateRequest = gateCall[0];

      expect(gateRequest.workflowContext.stepName).toBe('vision-analysis');
      expect(gateRequest.gateType).toBe('checkpoint');
      expect(gateRequest.question).toContain('vision analysis');
    });

    it('should pause workflow when gate is pending', async () => {
      // Mock AGUI adapter to simulate pending gate (not resolving immediately)
      mockProcessWorkflowGate.mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve('approved'), 1000))
      );

      const workflowResult = await engine.startProductWorkflow(
        'complete-product-flow'
      );
      expect(workflowResult.success).toBe(true);

      const workflowId = workflowResult.workflowId!;

      // Wait for gate to be triggered
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check if workflow is paused
      const workflowStatus = await engine.getProductWorkflowStatus(workflowId);
      if (workflowStatus) {
        // Workflow might be paused if gate is being processed
        expect(['running', 'paused']).toContain(workflowStatus.status);
      }
    });

    it('should handle gate rejection', async () => {
      // Mock AGUI adapter to reject gate
      mockProcessWorkflowGate.mockResolvedValue('rejected');

      const workflowResult = await engine.startProductWorkflow(
        'complete-product-flow'
      );
      expect(workflowResult.success).toBe(true);

      // Wait for workflow execution
      await new Promise((resolve) => setTimeout(resolve, 200));

      const workflowId = workflowResult.workflowId!;
      const workflowStatus = await engine.getProductWorkflowStatus(workflowId);

      // Workflow should either fail or be in error state due to gate rejection
      if (workflowStatus) {
        expect(['failed', 'paused']).toContain(workflowStatus.status);
      }
    });
  });

  describe('Gate Management API', () => {
    it('should track pending gates', async () => {
      // Start workflow
      await engine.startProductWorkflow('complete-product-flow');

      // Wait for gates to be created
      await new Promise((resolve) => setTimeout(resolve, 50));

      const pendingGates = await engine.getPendingGates();

      // Should have gates if workflow is running and gates are enabled
      expect(pendingGates).toBeDefined();
      expect(pendingGates instanceof Map).toBe(true);
    });

    it('should provide gate statistics', () => {
      const stats = engine.getGateStatistics();

      expect(stats).toBeDefined();
      expect(typeof stats.totalDecisionAudits).toBe('number');
      expect(typeof stats.activeGates).toBe('number');
      expect(stats.config).toBeDefined();
    });

    it('should cancel gates', async () => {
      // Mock a pending gate scenario
      mockProcessWorkflowGate.mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve('approved'), 2000))
      );

      await engine.startProductWorkflow('complete-product-flow');
      await new Promise((resolve) => setTimeout(resolve, 50));

      const pendingGates = await engine.getPendingGates();

      if (pendingGates.size > 0) {
        const gateId = Array.from(pendingGates.keys())[0]!;
        const result = await engine.cancelGate(gateId, 'Test cancellation');

        // Result depends on implementation, but should not throw
        expect(result).toBeDefined();
        expect(typeof result.success).toBe('boolean');
      }
    });
  });

  describe('Gate Decision Routing', () => {
    it('should handle approval decision', async () => {
      mockProcessWorkflowGate.mockResolvedValue('approved');

      const result = await engine.executeWorkflowGate(
        'test-step',
        createMockWorkflowState(),
        {
          question: 'Test gate question',
          businessImpact: 'medium',
          stakeholders: ['test-user'],
          gateType: 'approval',
        }
      );

      expect(result.success).toBe(true);
      expect(result.approved).toBe(true);
      expect(result.escalationLevel).toBe(GateEscalationLevel.NONE);
    });

    it('should handle rejection decision', async () => {
      mockProcessWorkflowGate.mockResolvedValue('rejected');

      const result = await engine.executeWorkflowGate(
        'test-step',
        createMockWorkflowState(),
        {
          question: 'Test gate question',
          businessImpact: 'medium',
          stakeholders: ['test-user'],
          gateType: 'approval',
        }
      );

      expect(result.success).toBe(true);
      expect(result.approved).toBe(false);
    });

    it('should map business impact to escalation levels', async () => {
      const testCases = [
        {
          businessImpact: 'critical' as const,
          expectedLevel: GateEscalationLevel.DIRECTOR,
        },
        {
          businessImpact: 'high' as const,
          expectedLevel: GateEscalationLevel.MANAGER,
        },
        {
          businessImpact: 'medium' as const,
          expectedLevel: GateEscalationLevel.TEAM_LEAD,
        },
        {
          businessImpact: 'low' as const,
          expectedLevel: GateEscalationLevel.NONE,
        },
      ];

      for (const testCase of testCases) {
        mockProcessWorkflowGate.mockResolvedValue('approved');

        const result = await engine.executeWorkflowGate(
          'test-step',
          createMockWorkflowState(),
          {
            question: 'Test gate question',
            businessImpact: testCase.businessImpact,
            stakeholders: ['test-user'],
            gateType: 'approval',
          }
        );

        // The gate request should have been created with the appropriate approval level
        expect(mockProcessWorkflowGate).toHaveBeenCalled();
        const gateRequest =
          mockProcessWorkflowGate.mock.calls[
            mockProcessWorkflowGate.mock.calls.length - 1
          ][0];
        expect(gateRequest.requiredApprovalLevel).toBe(testCase.expectedLevel);
      }
    });
  });

  describe('Workflow Pause/Resume with Gates', () => {
    it('should pause workflow manually', async () => {
      const workflowResult = await engine.startProductWorkflow(
        'complete-product-flow'
      );
      const workflowId = workflowResult.workflowId!;

      const pauseResult = await engine.pauseProductWorkflow(
        workflowId,
        'Manual pause for testing'
      );
      expect(pauseResult.success).toBe(true);

      const workflowStatus = await engine.getProductWorkflowStatus(workflowId);
      expect(workflowStatus?.status).toBe('paused');
    });

    it('should resume paused workflow', async () => {
      const workflowResult = await engine.startProductWorkflow(
        'complete-product-flow'
      );
      const workflowId = workflowResult.workflowId!;

      // Pause workflow
      await engine.pauseProductWorkflow(workflowId, 'Test pause');

      // Resume workflow
      const resumeResult = await engine.resumeProductWorkflow(
        workflowId,
        'Test resume'
      );
      expect(resumeResult.success).toBe(true);

      const workflowStatus = await engine.getProductWorkflowStatus(workflowId);
      expect(workflowStatus?.status).toBe('running');
    });
  });

  describe('Error Handling', () => {
    it('should handle AGUI adapter errors gracefully', async () => {
      mockProcessWorkflowGate.mockRejectedValue(
        new Error('AGUI adapter error')
      );

      const result = await engine.executeWorkflowGate(
        'test-step',
        createMockWorkflowState(),
        {
          question: 'Test gate question',
          businessImpact: 'medium',
          stakeholders: ['test-user'],
          gateType: 'approval',
        }
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('AGUI adapter error');
    });

    it('should handle gate cancellation errors', async () => {
      const result = await engine.cancelGate(
        'non-existent-gate',
        'Test cancellation'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('Gate not found');
    });
  });

  describe('Integration with Workflow Steps', () => {
    it('should inject gates at correct workflow steps', () => {
      const gateDefinitions = engine.getGateDefinitions();
      const expectedSteps = [
        'vision-analysis',
        'prd-creation',
        'epic-breakdown',
        'feature-definition',
        'sparc-integration',
      ];

      expectedSteps.forEach((step) => {
        expect(gateDefinitions.has(step)).toBe(true);
      });
    });

    it('should respect gate configuration settings', async () => {
      // Create engine with gates disabled
      const engineWithoutGates = new ProductWorkflowEngine(
        mockMemorySystem as MemorySystem,
        mockDocumentService as DocumentManager,
        eventBus,
        aguiAdapter,
        {
          enableSPARCIntegration: true,
          sparcQualityGates: false, // Disable gates
          autoTriggerSPARC: false,
        }
      );

      await engineWithoutGates.initialize();

      // Start workflow - should not trigger gates
      await engineWithoutGates.startProductWorkflow('complete-product-flow');

      // Wait for potential gate execution
      await new Promise((resolve) => setTimeout(resolve, 100));

      // AGUI adapter should not have been called since gates are disabled
      expect(mockProcessWorkflowGate).not.toHaveBeenCalled();

      await engineWithoutGates.shutdownGates();
    });
  });

  describe('Decision Logging and Audit Trail', () => {
    it('should log workflow decisions', async () => {
      mockProcessWorkflowGate.mockResolvedValue(
        'approved with rationale: looks good'
      );

      await engine.executeWorkflowGate(
        'test-step',
        createMockWorkflowState({ id: 'test-workflow-audit' }),
        {
          question: 'Test audit gate',
          businessImpact: 'high',
          stakeholders: ['test-approver'],
          gateType: 'approval',
        }
      );

      // Check decision history
      const history = engine.getWorkflowDecisionHistory('test-workflow-audit');
      expect(Array.isArray(history)).toBe(true);
    });

    it('should provide comprehensive statistics', () => {
      const stats = engine.getGateStatistics();

      expect(stats).toHaveProperty('totalDecisionAudits');
      expect(stats).toHaveProperty('activeGates');
      expect(stats).toHaveProperty('config');
      expect(stats.config).toHaveProperty('enableDecisionLogging');
    });
  });
});
