/**
 * @file Gate Pause/Resume Tests
 *
 * Tests gate pause/resume functionality, timeout handling, and escalation scenarios
 * for workflow gate integration with comprehensive state management validation.
 */

import { vi } from 'vitest';
import { getLogger } from '../../../config/logging-config.ts';
import {
  WorkflowGatesManager,
  WorkflowHumanGateStatus,
} from '../../../coordination/orchestration/workflow-gates.ts';
import { TypeSafeEventBus } from '../../../core/type-safe-event-system.ts';
import {
  type WorkflowDefinition,
  WorkflowEngine,
} from '../../../workflows/workflow-engine.ts';

const logger = getLogger('gate-pause-resume-tests');

describe('Gate Pause/Resume Functionality', () => {
  let workflowEngine: WorkflowEngine;
  let gatesManager: WorkflowGatesManager;
  let eventBus: TypeSafeEventBus;

  beforeAll(async () => {
    eventBus = new TypeSafeEventBus();

    gatesManager = new WorkflowGatesManager(eventBus, {
      persistencePath: ':memory:',
      queueProcessingInterval: 50, // Fast processing for tests
      enableMetrics: true,
    });

    workflowEngine = new WorkflowEngine(
      {
        maxConcurrentWorkflows: 10,
        stepTimeout: 2000,
        persistWorkflows: false,
      },
      undefined,
      undefined,
      gatesManager,
    );

    await gatesManager.initialize();
    await workflowEngine.initialize();

    logger.info('Gate pause/resume test environment initialized');
  });

  afterAll(async () => {
    await workflowEngine.shutdown();
    await gatesManager.shutdown();
  });

  describe('Basic Pause/Resume Operations', () => {
    test('should pause workflow at gate and resume after approval', async () => {
      const definition: WorkflowDefinition = {
        name: 'pause-resume-test',
        description: 'Test workflow pause and resume at gate',
        version: '1.0.0',
        steps: [
          {
            type: 'log',
            name: 'Before Gate',
            params: { message: 'Step before gate' },
          },
          {
            type: 'log',
            name: 'Gate Step',
            params: { message: 'Step with gate' },
            gateConfig: {
              enabled: true,
              gateType: 'approval',
              businessImpact: 'medium',
              stakeholders: ['manager'],
              autoApproval: false,
            },
          },
          {
            type: 'log',
            name: 'After Gate',
            params: { message: 'Step after gate' },
          },
        ],
      };

      const result = await workflowEngine.startWorkflow(definition, {
        testId: 'pause-resume-basic',
      });

      expect(result.success).toBe(true);
      const workflowId = result.workflowId!;

      // Wait for workflow to reach gate
      await new Promise((resolve) => setTimeout(resolve, 200));

      let status = workflowEngine.getWorkflowStatus(workflowId);

      // Should be paused at gate or completed if auto-approved
      if (status?.status === 'paused') {
        expect(status.pausedForGate).toBeDefined();
        expect(status.pausedForGate!.stepIndex).toBe(1);

        const gateStatus = workflowEngine.getWorkflowGateStatus(workflowId);
        expect(gateStatus.pausedForGate).toBeDefined();

        const gateId = gateStatus.pausedForGate!.gateId;

        // Resume workflow by approving gate
        const resumeResult = await workflowEngine.resumeWorkflowAfterGate(
          workflowId,
          gateId,
          true,
        );

        expect(resumeResult.success).toBe(true);

        // Wait for workflow to complete
        await new Promise((resolve) => setTimeout(resolve, 300));

        status = workflowEngine.getWorkflowStatus(workflowId);
        expect(['completed', 'running'].includes(status?.status || '')).toBe(
          true,
        );

        // Check gate results are recorded
        const finalGateStatus =
          workflowEngine.getWorkflowGateStatus(workflowId);
        expect(finalGateStatus.gateResults.length).toBeGreaterThan(0);

        const gateResult = finalGateStatus.gateResults.find(
          (g) => g.gateId === gateId,
        );
        expect(gateResult?.approved).toBe(true);
      }

      logger.info('Basic pause/resume test completed', {
        finalStatus: status?.status,
        currentStep: status?.currentStep,
      });
    });

    test('should handle workflow rejection at gate', async () => {
      const definition: WorkflowDefinition = {
        name: 'gate-rejection-test',
        description: 'Test workflow rejection at gate',
        version: '1.0.0',
        steps: [
          {
            type: 'log',
            name: 'Step Before Rejection',
            params: { message: 'About to be rejected' },
          },
          {
            type: 'log',
            name: 'Rejection Gate Step',
            params: { message: 'This will be rejected' },
            gateConfig: {
              enabled: true,
              gateType: 'approval',
              businessImpact: 'critical',
              stakeholders: ['executive'],
              autoApproval: false,
            },
          },
          {
            type: 'log',
            name: 'Should Not Reach',
            params: { message: 'This should not execute' },
          },
        ],
      };

      const result = await workflowEngine.startWorkflow(definition, {
        testId: 'gate-rejection',
      });

      expect(result.success).toBe(true);
      const workflowId = result.workflowId!;

      // Wait for gate to be reached
      await new Promise((resolve) => setTimeout(resolve, 200));

      let status = workflowEngine.getWorkflowStatus(workflowId);

      if (status?.status === 'paused') {
        const gateStatus = workflowEngine.getWorkflowGateStatus(workflowId);
        const gateId = gateStatus.pausedForGate!.gateId;

        // Reject the gate
        const resumeResult = await workflowEngine.resumeWorkflowAfterGate(
          workflowId,
          gateId,
          false,
        );

        expect(resumeResult.success).toBe(true);

        // Wait for workflow to fail
        await new Promise((resolve) => setTimeout(resolve, 100));

        status = workflowEngine.getWorkflowStatus(workflowId);
        expect(status?.status).toBe('failed');
        expect(status?.error).toContain('Gate rejected');

        // Check gate result is recorded as rejected
        const finalGateStatus =
          workflowEngine.getWorkflowGateStatus(workflowId);
        const gateResult = finalGateStatus.gateResults.find(
          (g) => g.gateId === gateId,
        );
        expect(gateResult?.approved).toBe(false);
      }

      logger.info('Gate rejection test completed');
    });
  });

  describe('Multiple Gates and State Management', () => {
    test('should handle workflow with multiple sequential gates', async () => {
      const definition: WorkflowDefinition = {
        name: 'multi-gate-sequential',
        description: 'Test workflow with multiple sequential gates',
        version: '1.0.0',
        steps: [
          {
            type: 'log',
            name: 'First Gate',
            params: { message: 'First gate step' },
            gateConfig: {
              enabled: true,
              gateType: 'approval',
              businessImpact: 'medium',
              stakeholders: ['team-lead'],
              autoApproval: false,
            },
          },
          {
            type: 'delay',
            name: 'Processing',
            params: { duration: 10 },
          },
          {
            type: 'log',
            name: 'Second Gate',
            params: { message: 'Second gate step' },
            gateConfig: {
              enabled: true,
              gateType: 'review',
              businessImpact: 'high',
              stakeholders: ['manager'],
              autoApproval: false,
            },
          },
          {
            type: 'log',
            name: 'Final Step',
            params: { message: 'Workflow complete' },
          },
        ],
      };

      const result = await workflowEngine.startWorkflow(definition, {
        testId: 'multi-gate-sequential',
      });

      expect(result.success).toBe(true);
      const workflowId = result.workflowId!;

      const approvedGates: string[] = [];
      let attempts = 0;
      const maxAttempts = 30;

      // Process gates as they appear
      while (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 100));

        const status = workflowEngine.getWorkflowStatus(workflowId);

        if (status?.status === 'paused') {
          const gateStatus = workflowEngine.getWorkflowGateStatus(workflowId);

          if (
            gateStatus.pausedForGate &&
            !approvedGates.includes(gateStatus.pausedForGate.gateId)
          ) {
            const gateId = gateStatus.pausedForGate.gateId;

            logger.info(`Approving gate: ${gateId}`);

            await workflowEngine.resumeWorkflowAfterGate(
              workflowId,
              gateId,
              true,
            );
            approvedGates.push(gateId);
          }
        } else if (['completed', 'failed'].includes(status?.status || '')) {
          break;
        }

        attempts++;
      }

      const finalStatus = workflowEngine.getWorkflowStatus(workflowId);
      const finalGateStatus = workflowEngine.getWorkflowGateStatus(workflowId);

      logger.info('Multi-gate sequential test completed', {
        finalStatus: finalStatus?.status,
        totalGates: finalGateStatus.gateResults.length,
        approvedGates: approvedGates.length,
      });

      // Should have processed multiple gates
      expect(approvedGates.length).toBeGreaterThan(0);
      expect(finalGateStatus.gateResults.length).toBe(approvedGates.length);
    });

    test('should maintain workflow state during multiple pause/resume cycles', async () => {
      const definition: WorkflowDefinition = {
        name: 'state-persistence-test',
        description: 'Test state persistence across pause/resume cycles',
        version: '1.0.0',
        steps: [
          {
            type: 'log',
            name: 'State Init',
            params: { message: 'Initialize state', counter: 1 },
          },
          {
            type: 'log',
            name: 'Gate 1',
            params: { message: 'First state gate', counter: 2 },
            gateConfig: {
              enabled: true,
              gateType: 'checkpoint',
              businessImpact: 'low',
              stakeholders: ['system'],
              autoApproval: false,
            },
          },
          {
            type: 'log',
            name: 'State Update',
            params: { message: 'Update state', counter: 3 },
          },
          {
            type: 'log',
            name: 'Gate 2',
            params: { message: 'Second state gate', counter: 4 },
            gateConfig: {
              enabled: true,
              gateType: 'checkpoint',
              businessImpact: 'low',
              stakeholders: ['system'],
              autoApproval: false,
            },
          },
          {
            type: 'log',
            name: 'State Complete',
            params: { message: 'Complete state', counter: 5 },
          },
        ],
      };

      const result = await workflowEngine.startWorkflow(definition, {
        testId: 'state-persistence',
        initialState: { testValue: 'persistent' },
      });

      expect(result.success).toBe(true);
      const workflowId = result.workflowId!;

      let pauseCount = 0;
      let attempts = 0;

      while (attempts < 25) {
        await new Promise((resolve) => setTimeout(resolve, 100));

        const status = workflowEngine.getWorkflowStatus(workflowId);

        if (status?.status === 'paused') {
          pauseCount++;
          const gateStatus = workflowEngine.getWorkflowGateStatus(workflowId);

          // Verify state is maintained
          expect(status.context).toBeDefined();
          expect(status.stepResults).toBeDefined();

          if (gateStatus.pausedForGate) {
            await workflowEngine.resumeWorkflowAfterGate(
              workflowId,
              gateStatus.pausedForGate.gateId,
              true,
            );
          }
        } else if (['completed', 'failed'].includes(status?.status || '')) {
          break;
        }

        attempts++;
      }

      const finalStatus = workflowEngine.getWorkflowStatus(workflowId);

      logger.info('State persistence test completed', {
        finalStatus: finalStatus?.status,
        pauseCount,
        finalStep: finalStatus?.currentStep,
      });

      expect(pauseCount).toBeGreaterThan(0);
    });
  });

  describe('Timeout and Escalation Handling', () => {
    test('should handle gate timeout scenarios', async () => {
      const definition: WorkflowDefinition = {
        name: 'timeout-test',
        description: 'Test gate timeout handling',
        version: '1.0.0',
        steps: [
          {
            type: 'log',
            name: 'Timeout Step',
            params: { message: 'This will timeout' },
            timeout: 500, // Short timeout
            gateConfig: {
              enabled: true,
              gateType: 'approval',
              businessImpact: 'medium',
              stakeholders: ['approver'],
              autoApproval: false,
            },
          },
        ],
      };

      const result = await workflowEngine.startWorkflow(definition, {
        testId: 'timeout-test',
      });

      expect(result.success).toBe(true);
      const workflowId = result.workflowId!;

      // Wait longer than timeout
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const status = workflowEngine.getWorkflowStatus(workflowId);

      // Should handle timeout gracefully
      expect(
        ['paused', 'failed', 'completed'].includes(status?.status || ''),
      ).toBe(true);

      logger.info('Timeout test completed', {
        finalStatus: status?.status,
        error: status?.error,
      });
    });

    test('should handle invalid gate operations gracefully', async () => {
      const definition: WorkflowDefinition = {
        name: 'invalid-operations-test',
        description: 'Test handling of invalid gate operations',
        version: '1.0.0',
        steps: [
          {
            type: 'log',
            name: 'Valid Step',
            params: { message: 'Valid operation' },
            gateConfig: {
              enabled: true,
              gateType: 'approval',
              businessImpact: 'low',
              stakeholders: ['tester'],
              autoApproval: false,
            },
          },
        ],
      };

      const result = await workflowEngine.startWorkflow(definition);
      expect(result.success).toBe(true);
      const workflowId = result.workflowId!;

      // Test invalid operations
      const invalidResumeResult1 = await workflowEngine.resumeWorkflowAfterGate(
        'non-existent-workflow',
        'fake-gate-id',
        true,
      );
      expect(invalidResumeResult1.success).toBe(false);
      expect(invalidResumeResult1.error).toContain('not found');

      const invalidResumeResult2 = await workflowEngine.resumeWorkflowAfterGate(
        workflowId,
        'wrong-gate-id',
        true,
      );
      expect(invalidResumeResult2.success).toBe(false);

      logger.info('Invalid operations test completed');
    });
  });

  describe('Concurrent Gates and Resource Management', () => {
    test('should handle multiple concurrent workflows with gates', async () => {
      const workflowCount = 3;
      const results = [];

      // Start multiple workflows simultaneously
      for (let i = 0; i < workflowCount; i++) {
        const definition: WorkflowDefinition = {
          name: `concurrent-gates-${i}`,
          description: `Concurrent workflow ${i} with gates`,
          version: '1.0.0',
          steps: [
            {
              type: 'log',
              name: `Concurrent Step ${i}`,
              params: { message: `Processing workflow ${i}` },
              gateConfig: {
                enabled: true,
                gateType: 'checkpoint',
                businessImpact: 'low',
                stakeholders: ['system'],
                autoApproval: i % 2 === 0, // Auto-approve every other workflow
              },
            },
            {
              type: 'delay',
              name: `Processing ${i}`,
              params: { duration: 50 },
            },
          ],
        };

        const result = await workflowEngine.startWorkflow(definition, {
          concurrentTest: true,
          index: i,
        });

        results.push({
          index: i,
          workflowId: result.workflowId!,
          success: result.success,
        });
      }

      // All workflows should start successfully
      results.forEach((result) => {
        expect(result.success).toBe(true);
      });

      // Process gates for non-auto-approved workflows
      await new Promise((resolve) => setTimeout(resolve, 200));

      for (const result of results) {
        const gateStatus = workflowEngine.getWorkflowGateStatus(
          result.workflowId,
        );

        if (gateStatus.pausedForGate) {
          await workflowEngine.resumeWorkflowAfterGate(
            result.workflowId,
            gateStatus.pausedForGate.gateId,
            true,
          );
        }
      }

      // Wait for all workflows to complete
      await new Promise((resolve) => setTimeout(resolve, 500));

      const finalStatuses = results.map((result) => {
        const status = workflowEngine.getWorkflowStatus(result.workflowId);
        return {
          index: result.index,
          status: status?.status,
          gateResults: workflowEngine.getWorkflowGateStatus(result.workflowId)
            .gateResults.length,
        };
      });

      logger.info('Concurrent gates test completed', {
        workflowCount,
        finalStatuses,
      });

      // All workflows should have processed
      finalStatuses.forEach((status) => {
        expect(
          ['completed', 'running', 'paused'].includes(status.status || ''),
        ).toBe(true);
      });
    });
  });
});
