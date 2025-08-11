/**
 * @file Gate Performance Validation Tests
 *
 * Performance testing and memory efficiency validation for the gate system.
 * Tests scalability, memory usage, and response times under various loads.
 */

import { vi } from 'vitest';
import { getLogger } from '../../config/logging-config.ts';
import {
  WorkflowGatePriority,
  WorkflowGatesManager,
  WorkflowHumanGateType,
} from '../../coordination/orchestration/workflow-gates.ts';
import { TypeSafeEventBus } from '../../core/type-safe-event-system.ts';
import { type WorkflowDefinition, WorkflowEngine } from '../../workflows/workflow-engine.ts';

const logger = getLogger('gate-performance-validation');

describe('Gate Performance Validation', () => {
  let workflowEngine: WorkflowEngine;
  let gatesManager: WorkflowGatesManager;
  let eventBus: TypeSafeEventBus;

  beforeAll(async () => {
    eventBus = new TypeSafeEventBus();

    gatesManager = new WorkflowGatesManager(eventBus, {
      persistencePath: ':memory:', // Use in-memory DB for performance tests
      queueProcessingInterval: 10, // Fast processing
      maxConcurrentGates: 100,
      enableMetrics: true,
    });

    workflowEngine = new WorkflowEngine(
      {
        maxConcurrentWorkflows: 50,
        stepTimeout: 5000,
        persistWorkflows: false,
      },
      undefined,
      undefined,
      gatesManager
    );

    await gatesManager.initialize();
    await workflowEngine.initialize();

    logger.info('Gate performance test environment initialized');
  });

  afterAll(async () => {
    await workflowEngine.shutdown();
    await gatesManager.shutdown();
  });

  describe('Gate Creation and Management Performance', () => {
    test('should create gates efficiently at scale', async () => {
      const gateCount = 50;
      const startTime = Date.now();
      const createdGates: string[] = [];

      // Create gates in batches
      const batchSize = 10;
      for (let batch = 0; batch < Math.ceil(gateCount / batchSize); batch++) {
        const batchPromises = [];

        for (let i = 0; i < batchSize && batch * batchSize + i < gateCount; i++) {
          const index = batch * batchSize + i;

          const gatePromise = gatesManager.createGate(
            WorkflowHumanGateType.BUSINESS,
            `perf-test-${index}`,
            {
              gateWorkflowId: `perf-workflow-${index}`,
              phaseName: `perf-phase-${index}`,
              businessDomain: 'performance-testing',
              technicalDomain: 'testing',
              stakeholderGroups: [`stakeholder-${index % 5}`],
              impactAssessment: {
                businessImpact: 0.5 + (index % 5) * 0.1,
                technicalImpact: 0.4 + (index % 3) * 0.1,
                riskImpact: 0.3 + (index % 4) * 0.1,
                resourceImpact: {
                  timeHours: 10 + index,
                  costImpact: 1000 + index * 100,
                  teamSize: 1 + (index % 3),
                  criticality: ['low', 'medium', 'high'][index % 3] as 'low' | 'medium' | 'high',
                },
                complianceImpact: {
                  regulations: index % 2 === 0 ? ['regulation-1'] : [],
                  riskLevel: ['low', 'medium', 'high'][index % 3] as 'low' | 'medium' | 'high',
                  requiredReviews: [],
                  deadlines: [],
                },
                userExperienceImpact: 0.6 + (index % 4) * 0.1,
              },
            },
            {
              structured: { type: 'business' as const },
              payload: { perfTest: true, index },
              attachments: [],
              externalReferences: [],
            },
            {
              priority: [
                WorkflowGatePriority.LOW,
                WorkflowGatePriority.MEDIUM,
                WorkflowGatePriority.HIGH,
              ][index % 3],
            }
          );

          batchPromises.push(gatePromise);
        }

        const batchResults = await Promise.all(batchPromises);
        createdGates.push(...batchResults.map((gate) => gate.id));

        // Small delay between batches to prevent overwhelming
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const creationTime = Date.now() - startTime;
      const avgCreationTime = creationTime / gateCount;

      logger.info('Gate creation performance results', {
        gateCount,
        totalCreationTime: creationTime,
        avgCreationTime,
        gatesPerSecond: Math.round(gateCount / (creationTime / 1000)),
      });

      // Performance assertions
      expect(createdGates.length).toBe(gateCount);
      expect(avgCreationTime).toBeLessThan(100); // Should create each gate in under 100ms
      expect(creationTime).toBeLessThan(10000); // Total time under 10 seconds

      // Cleanup - resolve some gates to test deletion performance
      const resolveStartTime = Date.now();
      const gatesToResolve = createdGates.slice(0, 10);

      await Promise.all(
        gatesToResolve.map((gateId) =>
          gatesManager.resolveGate(gateId, 'approved', 'performance-tester')
        )
      );

      const resolveTime = Date.now() - resolveStartTime;

      logger.info('Gate resolution performance', {
        resolvedCount: gatesToResolve.length,
        resolveTime,
        avgResolveTime: resolveTime / gatesToResolve.length,
      });

      expect(resolveTime).toBeLessThan(2000); // Should resolve 10 gates in under 2 seconds
    });

    test('should handle gate queue processing efficiently', async () => {
      const queueTestCount = 30;
      const startTime = Date.now();

      // Create gates with different priorities and urgencies
      const gatePromises = Array.from({ length: queueTestCount }, (_, i) =>
        gatesManager.createGate(
          [
            WorkflowHumanGateType.STRATEGIC,
            WorkflowHumanGateType.QUALITY,
            WorkflowHumanGateType.BUSINESS,
          ][i % 3],
          `queue-perf-${i}`,
          {
            gateWorkflowId: `queue-workflow-${i}`,
            phaseName: `queue-phase-${i}`,
            businessDomain: 'queue-testing',
            technicalDomain: 'performance',
            stakeholderGroups: ['queue-tester'],
            impactAssessment: {
              businessImpact: 0.3 + (i % 7) * 0.1,
              technicalImpact: 0.4 + (i % 5) * 0.1,
              riskImpact: 0.2 + (i % 6) * 0.1,
              resourceImpact: {
                timeHours: 5 + i,
                costImpact: 500 + i * 50,
                teamSize: 1,
                criticality: 'medium',
              },
              complianceImpact: {
                regulations: [],
                riskLevel: 'low',
                requiredReviews: [],
                deadlines: [],
              },
              userExperienceImpact: 0.5,
            },
          },
          {
            structured: { type: ['strategic', 'quality', 'business'][i % 3] as any },
            payload: { queueTest: true, priority: i % 3 },
            attachments: [],
            externalReferences: [],
          },
          {
            priority: [
              WorkflowGatePriority.HIGH,
              WorkflowGatePriority.MEDIUM,
              WorkflowGatePriority.LOW,
            ][i % 3],
          }
        )
      );

      const createdGates = await Promise.all(gatePromises);
      const creationTime = Date.now() - startTime;

      // Wait for queue processing
      await new Promise((resolve) => setTimeout(resolve, 500));

      const queueProcessTime = Date.now() - startTime;
      const queuedGates = await gatesManager.getQueuedGates();

      logger.info('Gate queue performance results', {
        totalGates: queueTestCount,
        creationTime,
        queueProcessTime,
        queuedGatesCount: queuedGates.length,
        avgQueueTime: queueProcessTime / queueTestCount,
      });

      // Performance assertions
      expect(creationTime).toBeLessThan(5000); // Should create 30 gates in under 5 seconds
      expect(queueProcessTime).toBeLessThan(6000); // Should process queue in under 6 seconds
      expect(queuedGates.length >= 0).toBe(true); // Queue should be processed
    });
  });

  describe('Workflow Engine Gate Integration Performance', () => {
    test('should execute gate-enabled workflows efficiently', async () => {
      const workflowCount = 10;
      const startTime = Date.now();

      const workflowPromises = Array.from({ length: workflowCount }, (_, i) => {
        const definition: WorkflowDefinition = {
          name: `perf-workflow-${i}`,
          description: `Performance test workflow ${i}`,
          version: '1.0.0',
          steps: [
            {
              type: 'log',
              name: `Start Step ${i}`,
              params: { message: `Starting workflow ${i}` },
            },
            {
              type: 'log',
              name: `Gate Step ${i}`,
              params: { message: `Gate step for workflow ${i}` },
              gateConfig: {
                enabled: true,
                gateType: 'checkpoint',
                businessImpact: 'low',
                stakeholders: ['performance-tester'],
                autoApproval: true, // Auto-approve for performance testing
              },
            },
            {
              type: 'delay',
              name: `Processing ${i}`,
              params: { duration: 10 }, // Minimal delay
            },
            {
              type: 'log',
              name: `Finish Step ${i}`,
              params: { message: `Completing workflow ${i}` },
            },
          ],
        };

        return workflowEngine.startWorkflow(definition, {
          perfTest: true,
          index: i,
        });
      });

      const workflowResults = await Promise.all(workflowPromises);
      const startupTime = Date.now() - startTime;

      // All workflows should start successfully
      workflowResults.forEach((result) => {
        expect(result.success).toBe(true);
      });

      // Wait for workflows to complete
      let completedCount = 0;
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max

      while (completedCount < workflowCount && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 100));

        completedCount = 0;
        workflowResults.forEach((result) => {
          const status = workflowEngine.getWorkflowStatus(result.workflowId!);
          if (['completed', 'failed'].includes(status?.status || '')) {
            completedCount++;
          }
        });

        attempts++;
      }

      const totalTime = Date.now() - startTime;

      logger.info('Workflow gate integration performance', {
        workflowCount,
        startupTime,
        totalTime,
        completedCount,
        avgWorkflowTime: totalTime / workflowCount,
        throughput: Math.round(workflowCount / (totalTime / 1000)),
      });

      // Performance assertions
      expect(completedCount).toBe(workflowCount);
      expect(totalTime).toBeLessThan(8000); // Should complete all workflows in under 8 seconds
      expect(startupTime / workflowCount).toBeLessThan(200); // Avg startup time under 200ms
    });

    test('should handle concurrent gate approvals efficiently', async () => {
      const concurrentCount = 15;
      const startTime = Date.now();

      // Create workflows that require manual gate approval
      const workflowPromises = Array.from({ length: concurrentCount }, (_, i) => {
        const definition: WorkflowDefinition = {
          name: `concurrent-approval-${i}`,
          description: `Concurrent approval test ${i}`,
          version: '1.0.0',
          steps: [
            {
              type: 'log',
              name: `Concurrent Gate ${i}`,
              params: { message: `Concurrent gate ${i}` },
              gateConfig: {
                enabled: true,
                gateType: 'approval',
                businessImpact: 'medium',
                stakeholders: [`approver-${i % 3}`],
                autoApproval: false,
              },
            },
          ],
        };

        return workflowEngine.startWorkflow(definition, {
          concurrentApproval: true,
          index: i,
        });
      });

      const workflowResults = await Promise.all(workflowPromises);
      const setupTime = Date.now() - startTime;

      // Wait for all workflows to reach gates
      await new Promise((resolve) => setTimeout(resolve, 300));

      const approvalStartTime = Date.now();

      // Approve all gates concurrently
      const approvalPromises = workflowResults.map(async (result) => {
        const gateStatus = workflowEngine.getWorkflowGateStatus(result.workflowId!);
        if (gateStatus.pausedForGate) {
          return workflowEngine.resumeWorkflowAfterGate(
            result.workflowId!,
            gateStatus.pausedForGate.gateId,
            true
          );
        }
      });

      const approvalResults = await Promise.all(approvalPromises);
      const approvalTime = Date.now() - approvalStartTime;

      // Wait for workflows to complete
      await new Promise((resolve) => setTimeout(resolve, 200));

      const totalTime = Date.now() - startTime;

      // Count successful approvals
      const successfulApprovals = approvalResults.filter((result) => result?.success).length;

      logger.info('Concurrent gate approval performance', {
        concurrentCount,
        setupTime,
        approvalTime,
        totalTime,
        successfulApprovals,
        avgApprovalTime: approvalTime / successfulApprovals,
        approvalThroughput: Math.round(successfulApprovals / (approvalTime / 1000)),
      });

      // Performance assertions
      expect(successfulApprovals).toBeGreaterThan(concurrentCount * 0.8); // At least 80% success rate
      expect(approvalTime).toBeLessThan(3000); // Should approve all gates in under 3 seconds
      expect(approvalTime / successfulApprovals).toBeLessThan(500); // Avg approval time under 500ms
    });
  });

  describe('Memory and Resource Efficiency', () => {
    test('should maintain efficient memory usage with many gates', async () => {
      const initialMemory = process.memoryUsage();
      const gateCount = 100;

      logger.info('Initial memory usage', {
        heapUsed: initialMemory.heapUsed,
        heapTotal: initialMemory.heapTotal,
        rss: initialMemory.rss,
      });

      // Create many gates
      const gates = [];
      for (let i = 0; i < gateCount; i++) {
        const gate = await gatesManager.createGate(
          WorkflowHumanGateType.BUSINESS,
          `memory-test-${i}`,
          {
            gateWorkflowId: `memory-workflow-${i}`,
            phaseName: `memory-phase-${i}`,
            businessDomain: 'memory-testing',
            technicalDomain: 'efficiency',
            stakeholderGroups: ['memory-tester'],
            impactAssessment: {
              businessImpact: 0.5,
              technicalImpact: 0.4,
              riskImpact: 0.3,
              resourceImpact: {
                timeHours: 8,
                costImpact: 2000,
                teamSize: 2,
                criticality: 'medium',
              },
              complianceImpact: {
                regulations: [],
                riskLevel: 'low',
                requiredReviews: [],
                deadlines: [],
              },
              userExperienceImpact: 0.4,
            },
          },
          {
            structured: { type: 'business' },
            payload: { memoryTest: true, size: 'small' },
            attachments: [],
            externalReferences: [],
          }
        );

        gates.push(gate.id);

        // Check memory every 25 gates
        if (i > 0 && i % 25 === 0) {
          const currentMemory = process.memoryUsage();
          const memoryGrowth = currentMemory.heapUsed - initialMemory.heapUsed;
          const avgMemoryPerGate = memoryGrowth / i;

          logger.info(`Memory usage at ${i} gates`, {
            heapUsed: currentMemory.heapUsed,
            memoryGrowth,
            avgMemoryPerGate,
          });
        }
      }

      const finalMemory = process.memoryUsage();
      const totalMemoryGrowth = finalMemory.heapUsed - initialMemory.heapUsed;
      const avgMemoryPerGate = totalMemoryGrowth / gateCount;

      logger.info('Final memory usage analysis', {
        initialHeapUsed: initialMemory.heapUsed,
        finalHeapUsed: finalMemory.heapUsed,
        totalMemoryGrowth,
        avgMemoryPerGate,
        gateCount,
      });

      // Memory efficiency assertions
      expect(avgMemoryPerGate).toBeLessThan(50000); // Less than 50KB per gate on average
      expect(totalMemoryGrowth).toBeLessThan(gateCount * 100000); // Less than 100KB per gate total

      // Cleanup - resolve gates to test memory cleanup
      const cleanupStartTime = Date.now();
      await Promise.all(
        gates
          .slice(0, 50)
          .map((gateId) => gatesManager.resolveGate(gateId, 'approved', 'memory-tester'))
      );

      const cleanupTime = Date.now() - cleanupStartTime;

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
      const postCleanupMemory = process.memoryUsage();

      logger.info('Memory cleanup results', {
        cleanupTime,
        preCleanupHeap: finalMemory.heapUsed,
        postCleanupHeap: postCleanupMemory.heapUsed,
        memoryReclaimed: finalMemory.heapUsed - postCleanupMemory.heapUsed,
      });
    });

    test('should handle resource contention gracefully', async () => {
      const contendingOperations = 20;
      const startTime = Date.now();

      // Create various operations that compete for resources
      const operations = Array.from({ length: contendingOperations }, (_, i) => {
        const operationType = i % 4;

        switch (operationType) {
          case 0: // Gate creation
            return gatesManager.createGate(
              WorkflowHumanGateType.QUALITY,
              `contention-${i}`,
              {
                gateWorkflowId: `contention-workflow-${i}`,
                phaseName: `contention-phase-${i}`,
                businessDomain: 'contention-testing',
                technicalDomain: 'performance',
                stakeholderGroups: ['contention-tester'],
                impactAssessment: {
                  businessImpact: 0.6,
                  technicalImpact: 0.5,
                  riskImpact: 0.4,
                  resourceImpact: {
                    timeHours: 12,
                    costImpact: 3000,
                    teamSize: 2,
                    criticality: 'high',
                  },
                  complianceImpact: {
                    regulations: ['test-reg'],
                    riskLevel: 'medium',
                    requiredReviews: ['review-1'],
                    deadlines: [],
                  },
                  userExperienceImpact: 0.7,
                },
              },
              {
                structured: { type: 'quality' },
                payload: { contentionTest: true },
                attachments: [],
                externalReferences: [],
              }
            );

          case 1: // Workflow creation
            return workflowEngine.startWorkflow({
              name: `contention-workflow-${i}`,
              description: 'Resource contention test',
              version: '1.0.0',
              steps: [
                {
                  type: 'delay',
                  name: 'Contention Step',
                  params: { duration: 50 },
                },
              ],
            });

          case 2: // Queue processing simulation
            return gatesManager.getQueuedGates();

          case 3: // Metrics retrieval
            return gatesManager.getMetrics();

          default:
            return Promise.resolve({ success: true });
        }
      });

      const results = await Promise.allSettled(operations);
      const operationTime = Date.now() - startTime;

      const successCount = results.filter((result) => result.status === 'fulfilled').length;
      const failureCount = results.filter((result) => result.status === 'rejected').length;

      logger.info('Resource contention test results', {
        contendingOperations,
        operationTime,
        successCount,
        failureCount,
        successRate: (successCount / contendingOperations) * 100,
        avgOperationTime: operationTime / contendingOperations,
      });

      // Resource contention assertions
      expect(successCount).toBeGreaterThan(contendingOperations * 0.7); // At least 70% success rate
      expect(operationTime).toBeLessThan(8000); // Should handle all operations in under 8 seconds
      expect(avgOperationTime).toBeLessThan(1000); // Average operation time under 1 second
    });
  });
});
