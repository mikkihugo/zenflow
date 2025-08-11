/**
 * @file Workflow Gate Integration Examples
 *
 * Complete examples demonstrating workflow gate integration with various
 * scenarios including approval flows, escalation handling, and error recovery.
 */

import { getLogger } from '../config/logging-config.ts';
import {
  WorkflowGatesManager,
  WorkflowHumanGateType,
} from '../coordination/orchestration/workflow-gates.ts';
import {
  createApprovalGate,
  WorkflowGateRequestProcessor,
} from '../coordination/workflows/workflow-gate-request.ts';
import { Domain } from '../core/domain-boundary-validator.ts';
import { createEvent, TypeSafeEventBus } from '../core/type-safe-event-system.ts';
import { type WorkflowDefinition, WorkflowEngine } from '../workflows/workflow-engine.ts';

const logger = getLogger('workflow-gate-examples');

/**
 * Example: Basic Workflow with Approval Gates
 *
 * Demonstrates how to create a simple workflow with approval gates
 * that pause execution until human approval is received.
 */
export async function basicWorkflowWithGates() {
  logger.info('Running basic workflow with gates example');

  // Initialize system components
  const eventBus = new TypeSafeEventBus();
  const gatesManager = new WorkflowGatesManager(eventBus, {
    persistencePath: './data/examples-gates.db',
    enableMetrics: true,
  });

  const workflowEngine = new WorkflowEngine(
    {
      maxConcurrentWorkflows: 5,
      persistWorkflows: true,
    },
    undefined,
    undefined,
    gatesManager
  );

  await gatesManager.initialize();
  await workflowEngine.initialize();

  // Define workflow with gate-enabled steps
  const definition: WorkflowDefinition = {
    name: 'basic-approval-workflow',
    description: 'Basic workflow demonstrating approval gates',
    version: '1.0.0',
    steps: [
      {
        type: 'log',
        name: 'Initialize Process',
        params: {
          message: 'Starting approval workflow',
          level: 'info',
        },
      },
      {
        type: 'log',
        name: 'Critical Decision Point',
        params: {
          message: 'Reached critical decision point - requires approval',
          level: 'warn',
        },
        gateConfig: {
          enabled: true,
          gateType: 'approval',
          businessImpact: 'high',
          stakeholders: ['manager', 'team-lead'],
          autoApproval: false,
        },
      },
      {
        type: 'log',
        name: 'Execute Approved Action',
        params: {
          message: 'Executing approved action',
          level: 'info',
        },
      },
      {
        type: 'log',
        name: 'Complete Process',
        params: {
          message: 'Process completed successfully',
          level: 'info',
        },
      },
    ],
  };

  try {
    // Start the workflow
    const result = await workflowEngine.startWorkflow(definition, {
      requestedBy: 'example-user',
      department: 'engineering',
    });

    if (!result.success) {
      throw new Error(`Failed to start workflow: ${result.error}`);
    }

    logger.info('Workflow started successfully', {
      workflowId: result.workflowId,
    });

    // Monitor workflow progress
    let attempts = 0;
    const maxAttempts = 20;

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const status = workflowEngine.getWorkflowStatus(result.workflowId!);
      const gateStatus = workflowEngine.getWorkflowGateStatus(result.workflowId!);

      logger.info('Workflow status check', {
        status: status?.status,
        currentStep: status?.currentStep,
        hasPendingGates: gateStatus.hasPendingGates,
        pausedForGate: gateStatus.pausedForGate,
      });

      if (status?.status === 'paused' && gateStatus.pausedForGate) {
        // Simulate approval process
        logger.info('Workflow paused for gate approval', {
          gateId: gateStatus.pausedForGate.gateId,
          stepIndex: gateStatus.pausedForGate.stepIndex,
        });

        // In a real scenario, this would wait for external approval
        // For this example, we'll auto-approve after a short delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const approvalResult = await workflowEngine.resumeWorkflowAfterGate(
          result.workflowId!,
          gateStatus.pausedForGate.gateId,
          true // Approve the gate
        );

        if (!approvalResult.success) {
          throw new Error(`Failed to approve gate: ${approvalResult.error}`);
        }

        logger.info('Gate approved, workflow resumed', {
          gateId: gateStatus.pausedForGate.gateId,
        });
      } else if (status?.status === 'completed') {
        logger.info('Workflow completed successfully');
        break;
      } else if (status?.status === 'failed') {
        throw new Error(`Workflow failed: ${status.error}`);
      }

      attempts++;
    }

    if (attempts >= maxAttempts) {
      logger.warn('Workflow monitoring timed out');
    }

    // Get final results
    const finalStatus = workflowEngine.getWorkflowStatus(result.workflowId!);
    const finalGateStatus = workflowEngine.getWorkflowGateStatus(result.workflowId!);

    logger.info('Basic workflow with gates completed', {
      finalStatus: finalStatus?.status,
      gateResults: finalGateStatus.gateResults.length,
      totalProcessingTime: finalStatus?.endTime
        ? new Date(finalStatus.endTime).getTime() - new Date(finalStatus.startTime).getTime()
        : 0,
    });
  } finally {
    await workflowEngine.shutdown();
    await gatesManager.shutdown();
  }
}

/**
 * Example: Multi-Stage Product Approval Workflow
 *
 * Demonstrates a complex workflow with multiple approval stages,
 * different stakeholder groups, and escalation scenarios.
 */
export async function multiStageProductApprovalWorkflow() {
  logger.info('Running multi-stage product approval workflow example');

  const eventBus = new TypeSafeEventBus();
  const gatesManager = new WorkflowGatesManager(eventBus, {
    persistencePath: './data/product-approval-gates.db',
    enableMetrics: true,
  });

  const workflowEngine = new WorkflowEngine(
    {
      maxConcurrentWorkflows: 3,
      persistWorkflows: true,
      retryAttempts: 2,
    },
    undefined,
    undefined,
    gatesManager
  );

  await gatesManager.initialize();
  await workflowEngine.initialize();

  // Define complex product approval workflow
  const definition: WorkflowDefinition = {
    name: 'multi-stage-product-approval',
    description: 'Complex product approval workflow with multiple gates',
    version: '2.0.0',
    steps: [
      {
        type: 'log',
        name: 'Product Concept Review',
        params: {
          message: 'Reviewing product concept and market fit',
          stage: 'concept',
        },
        gateConfig: {
          enabled: true,
          gateType: 'review',
          businessImpact: 'medium',
          stakeholders: ['product-manager', 'market-analyst'],
          autoApproval: false,
        },
      },
      {
        type: 'log',
        name: 'Technical Feasibility Assessment',
        params: {
          message: 'Assessing technical feasibility and architecture',
          stage: 'technical',
        },
        gateConfig: {
          enabled: true,
          gateType: 'approval',
          businessImpact: 'high',
          stakeholders: ['tech-lead', 'architect', 'security-officer'],
          autoApproval: false,
        },
      },
      {
        type: 'log',
        name: 'Budget and Resource Allocation',
        params: {
          message: 'Reviewing budget requirements and resource allocation',
          stage: 'budget',
        },
        gateConfig: {
          enabled: true,
          gateType: 'approval',
          businessImpact: 'critical',
          stakeholders: ['finance-director', 'cfo', 'project-sponsor'],
          autoApproval: false,
        },
      },
      {
        type: 'log',
        name: 'Compliance and Legal Review',
        params: {
          message: 'Conducting compliance and legal review',
          stage: 'compliance',
        },
        gateConfig: {
          enabled: true,
          gateType: 'review',
          businessImpact: 'high',
          stakeholders: ['legal-counsel', 'compliance-officer'],
          autoApproval: false,
        },
      },
      {
        type: 'log',
        name: 'Final Executive Approval',
        params: {
          message: 'Final executive approval for product launch',
          stage: 'executive',
        },
        gateConfig: {
          enabled: true,
          gateType: 'approval',
          businessImpact: 'critical',
          stakeholders: ['ceo', 'cpo', 'cto'],
          autoApproval: false,
        },
      },
      {
        type: 'log',
        name: 'Product Launch Authorized',
        params: {
          message: 'Product launch has been fully authorized',
          stage: 'complete',
        },
      },
    ],
  };

  try {
    const result = await workflowEngine.startWorkflow(definition, {
      productName: 'Next-Gen Analytics Platform',
      estimatedBudget: 2500000,
      timeline: '18 months',
      targetMarket: 'Enterprise B2B',
      riskLevel: 'medium-high',
    });

    if (!result.success) {
      throw new Error(`Failed to start workflow: ${result.error}`);
    }

    logger.info('Multi-stage workflow started', {
      workflowId: result.workflowId,
    });

    // Process each gate as it appears
    let completedStages = 0;
    let attempts = 0;
    const maxAttempts = 50;

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const status = workflowEngine.getWorkflowStatus(result.workflowId!);
      const gateStatus = workflowEngine.getWorkflowGateStatus(result.workflowId!);

      if (status?.status === 'paused' && gateStatus.pausedForGate) {
        completedStages++;

        logger.info(`Processing approval stage ${completedStages}`, {
          gateId: gateStatus.pausedForGate.gateId,
          stepIndex: gateStatus.pausedForGate.stepIndex,
          stageName: definition.steps[gateStatus.pausedForGate.stepIndex].name,
        });

        // Simulate different approval scenarios
        let approved = true;
        let delay = 500;

        switch (completedStages) {
          case 1: // Product concept - quick approval
            delay = 200;
            break;
          case 2: // Technical feasibility - longer review
            delay = 800;
            break;
          case 3: // Budget - critical review with potential rejection/re-approval
            delay = 1200;
            if (Math.random() > 0.8) {
              // 20% chance of initial rejection
              approved = false;
              logger.info('Budget approval initially rejected, requesting revision');
            }
            break;
          case 4: // Compliance - thorough review
            delay = 600;
            break;
          case 5: // Executive - final critical approval
            delay = 1000;
            break;
        }

        await new Promise((resolve) => setTimeout(resolve, delay));

        const approvalResult = await workflowEngine.resumeWorkflowAfterGate(
          result.workflowId!,
          gateStatus.pausedForGate.gateId,
          approved
        );

        if (!approvalResult.success) {
          logger.error('Failed to process gate approval', {
            error: approvalResult.error,
            gateId: gateStatus.pausedForGate.gateId,
          });
        } else if (approved) {
          logger.info(`Stage ${completedStages} approved and workflow resumed`);
        } else {
          logger.info(`Stage ${completedStages} rejected, workflow may fail`);
        }
      } else if (status?.status === 'completed') {
        logger.info('Multi-stage approval workflow completed successfully');
        break;
      } else if (status?.status === 'failed') {
        logger.warn(`Workflow failed at stage ${completedStages}: ${status.error}`);
        break;
      }

      attempts++;
    }

    // Final results analysis
    const finalStatus = workflowEngine.getWorkflowStatus(result.workflowId!);
    const finalGateStatus = workflowEngine.getWorkflowGateStatus(result.workflowId!);

    const approvedGates = finalGateStatus.gateResults.filter((g) => g.approved);
    const rejectedGates = finalGateStatus.gateResults.filter((g) => !g.approved);

    logger.info('Multi-stage workflow analysis', {
      finalStatus: finalStatus?.status,
      totalStages: definition.steps.filter((s) => s.gateConfig?.enabled).length,
      processedGates: finalGateStatus.gateResults.length,
      approvedGates: approvedGates.length,
      rejectedGates: rejectedGates.length,
      completedStages,
      totalTime: finalStatus?.endTime
        ? new Date(finalStatus.endTime).getTime() - new Date(finalStatus.startTime).getTime()
        : 0,
    });
  } finally {
    await workflowEngine.shutdown();
    await gatesManager.shutdown();
  }
}

/**
 * Example: Gate Error Handling and Recovery
 *
 * Demonstrates how to handle various error scenarios in gate processing
 * including timeouts, escalations, and system failures.
 */
export async function gateErrorHandlingAndRecovery() {
  logger.info('Running gate error handling and recovery example');

  const eventBus = new TypeSafeEventBus();
  const gatesManager = new WorkflowGatesManager(eventBus, {
    persistencePath: ':memory:', // Use memory DB for this example
    enableMetrics: true,
    queueProcessingInterval: 100,
  });

  const workflowEngine = new WorkflowEngine(
    {
      maxConcurrentWorkflows: 5,
      stepTimeout: 2000, // Short timeout for testing
      retryAttempts: 1,
    },
    undefined,
    undefined,
    gatesManager
  );

  await gatesManager.initialize();
  await workflowEngine.initialize();

  // Define workflow with potential error scenarios
  const definition: WorkflowDefinition = {
    name: 'error-handling-workflow',
    description: 'Workflow demonstrating error handling and recovery',
    version: '1.0.0',
    steps: [
      {
        type: 'log',
        name: 'Normal Step',
        params: { message: 'Normal processing step' },
      },
      {
        type: 'log',
        name: 'Timeout-Prone Gate',
        params: { message: 'Step with short timeout' },
        timeout: 1000, // Very short timeout
        gateConfig: {
          enabled: true,
          gateType: 'approval',
          businessImpact: 'medium',
          stakeholders: ['slow-approver'],
          autoApproval: false,
        },
      },
      {
        type: 'log',
        name: 'Recovery Step',
        params: { message: 'Recovery processing' },
      },
      {
        type: 'log',
        name: 'High-Risk Gate',
        params: { message: 'High-risk operation requiring approval' },
        gateConfig: {
          enabled: true,
          gateType: 'approval',
          businessImpact: 'critical',
          stakeholders: ['risk-manager', 'executive'],
          autoApproval: false,
        },
      },
      {
        type: 'log',
        name: 'Final Step',
        params: { message: 'Workflow completion' },
      },
    ],
  };

  try {
    const result = await workflowEngine.startWorkflow(definition, {
      errorHandlingTest: true,
      riskTolerance: 'low',
    });

    if (!result.success) {
      throw new Error(`Failed to start workflow: ${result.error}`);
    }

    logger.info('Error handling workflow started', {
      workflowId: result.workflowId,
    });

    let errorCount = 0;
    let recoveryCount = 0;
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 200));

      const status = workflowEngine.getWorkflowStatus(result.workflowId!);
      const gateStatus = workflowEngine.getWorkflowGateStatus(result.workflowId!);

      logger.info('Status check', {
        status: status?.status,
        currentStep: status?.currentStep,
        error: status?.error,
        pausedForGate: gateStatus.pausedForGate,
      });

      if (status?.status === 'paused' && gateStatus.pausedForGate) {
        const stepName = definition.steps[gateStatus.pausedForGate.stepIndex].name;

        logger.info('Processing gate with potential errors', {
          stepName,
          gateId: gateStatus.pausedForGate.gateId,
        });

        // Simulate different error scenarios
        if (stepName === 'Timeout-Prone Gate') {
          // Simulate slow approval process
          logger.info('Simulating slow approval process...');
          await new Promise((resolve) => setTimeout(resolve, 1500)); // Longer than step timeout

          try {
            const approvalResult = await workflowEngine.resumeWorkflowAfterGate(
              result.workflowId!,
              gateStatus.pausedForGate.gateId,
              true
            );

            if (approvalResult.success) {
              logger.info('Timeout gate approved successfully (recovery)');
              recoveryCount++;
            } else {
              logger.warn('Timeout gate approval failed');
              errorCount++;
            }
          } catch (error) {
            logger.error('Error during timeout gate processing', { error });
            errorCount++;
          }
        } else if (stepName === 'High-Risk Gate') {
          // Simulate rejection followed by escalation and eventual approval
          logger.info('Simulating high-risk gate processing with escalation');

          // Initial rejection
          const approvalResult = await workflowEngine.resumeWorkflowAfterGate(
            result.workflowId!,
            gateStatus.pausedForGate.gateId,
            false
          );

          if (approvalResult.success) {
            logger.info('High-risk gate rejected, simulating escalation...');
            errorCount++;

            // Wait a bit, then simulate escalation and approval
            // Note: In this simplified example, rejection will fail the workflow
            // In a real implementation, you'd have more sophisticated escalation logic
          }
        } else {
          // Normal approval
          const approvalResult = await workflowEngine.resumeWorkflowAfterGate(
            result.workflowId!,
            gateStatus.pausedForGate.gateId,
            true
          );

          if (approvalResult.success) {
            logger.info('Normal gate approved');
          } else {
            logger.warn('Normal gate approval failed');
            errorCount++;
          }
        }
      } else if (status?.status === 'completed') {
        logger.info('Error handling workflow completed');
        break;
      } else if (status?.status === 'failed') {
        logger.info('Workflow failed as expected in error scenario', {
          error: status.error,
        });
        errorCount++;
        break;
      }

      attempts++;
    }

    // Analysis of error handling
    const finalStatus = workflowEngine.getWorkflowStatus(result.workflowId!);
    const finalGateStatus = workflowEngine.getWorkflowGateStatus(result.workflowId!);

    logger.info('Error handling and recovery analysis', {
      finalStatus: finalStatus?.status,
      errorCount,
      recoveryCount,
      totalGateResults: finalGateStatus.gateResults.length,
      successfulRecoveryRate: (recoveryCount / (errorCount + recoveryCount)) * 100,
    });
  } catch (error) {
    logger.error('Error handling example encountered unexpected error', {
      error,
    });
  } finally {
    await workflowEngine.shutdown();
    await gatesManager.shutdown();
  }
}

/**
 * Example: Performance Optimization with Gates
 *
 * Demonstrates best practices for optimizing performance when using gates
 * in high-throughput scenarios.
 */
export async function performanceOptimizedGateWorkflow() {
  logger.info('Running performance optimized gate workflow example');

  const eventBus = new TypeSafeEventBus();
  const gatesManager = new WorkflowGatesManager(eventBus, {
    persistencePath: ':memory:',
    queueProcessingInterval: 10, // Fast processing
    maxConcurrentGates: 20,
    enableMetrics: true,
  });

  const workflowEngine = new WorkflowEngine(
    {
      maxConcurrentWorkflows: 10,
      stepTimeout: 5000,
      persistWorkflows: false, // Disable persistence for performance
    },
    undefined,
    undefined,
    gatesManager
  );

  await gatesManager.initialize();
  await workflowEngine.initialize();

  const startTime = Date.now();
  const workflowCount = 5;
  const results = [];

  try {
    // Create multiple optimized workflows concurrently
    const workflowPromises = Array.from({ length: workflowCount }, (_, i) => {
      const definition: WorkflowDefinition = {
        name: `perf-optimized-${i}`,
        description: `Performance optimized workflow ${i}`,
        version: '1.0.0',
        steps: [
          {
            type: 'log',
            name: 'Fast Init',
            params: { message: `Fast init ${i}` },
          },
          {
            type: 'log',
            name: 'Auto-Approved Gate',
            params: { message: `Auto-approved gate ${i}` },
            gateConfig: {
              enabled: true,
              gateType: 'checkpoint',
              businessImpact: 'low',
              stakeholders: ['system'],
              autoApproval: true, // Key optimization: auto-approve low-impact gates
            },
          },
          {
            type: 'log',
            name: 'Quick Process',
            params: { message: `Quick processing ${i}` },
          },
          {
            type: 'log',
            name: 'Conditional Gate',
            params: { message: `Conditional gate ${i}` },
            gateConfig: {
              enabled: i % 3 === 0, // Only enable gate for every 3rd workflow
              gateType: 'approval',
              businessImpact: 'medium',
              stakeholders: ['approver'],
              autoApproval: false,
            },
          },
          {
            type: 'log',
            name: 'Fast Complete',
            params: { message: `Completion ${i}` },
          },
        ],
      };

      return workflowEngine.startWorkflow(definition, {
        performanceTest: true,
        batchId: Math.floor(i / 2), // Group workflows in batches
      });
    });

    const workflowResults = await Promise.all(workflowPromises);
    const setupTime = Date.now() - startTime;

    logger.info('Performance test workflows started', {
      count: workflowCount,
      setupTime,
      successCount: workflowResults.filter((r) => r.success).length,
    });

    // Process workflows efficiently
    let completedCount = 0;
    let attempts = 0;
    const maxAttempts = 30;

    while (completedCount < workflowCount && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 100));

      for (const result of workflowResults) {
        if (!result.success) continue;

        const status = workflowEngine.getWorkflowStatus(result.workflowId!);

        if (status?.status === 'paused') {
          const gateStatus = workflowEngine.getWorkflowGateStatus(result.workflowId!);

          if (gateStatus.pausedForGate) {
            // Fast approval for performance testing
            await workflowEngine.resumeWorkflowAfterGate(
              result.workflowId!,
              gateStatus.pausedForGate.gateId,
              true
            );
          }
        } else if (status?.status === 'completed') {
          if (!results.find((r) => r.workflowId === result.workflowId)) {
            results.push({
              workflowId: result.workflowId,
              completionTime: Date.now() - startTime,
            });
            completedCount++;
          }
        }
      }

      attempts++;
    }

    const totalTime = Date.now() - startTime;
    const avgCompletionTime =
      results.length > 0
        ? results.reduce((sum, r) => sum + r.completionTime, 0) / results.length
        : 0;

    // Get performance metrics
    const metrics = await gatesManager.getMetrics();

    logger.info('Performance optimization results', {
      totalWorkflows: workflowCount,
      completedWorkflows: completedCount,
      totalTime,
      avgCompletionTime,
      throughput: Math.round(completedCount / (totalTime / 1000)),
      gateMetrics: {
        totalGates: metrics.totalGates,
        avgResolutionTime: metrics.averageResolutionTime,
      },
    });

    // Performance assertions for demonstration
    const performanceTargets = {
      completionRate: 0.9, // 90% completion rate
      maxAvgTime: 3000, // Max 3 seconds average
      minThroughput: 1, // Min 1 workflow/second
    };

    const actualCompletionRate = completedCount / workflowCount;
    const actualThroughput = completedCount / (totalTime / 1000);

    logger.info('Performance target analysis', {
      targets: performanceTargets,
      actual: {
        completionRate: actualCompletionRate,
        avgTime: avgCompletionTime,
        throughput: actualThroughput,
      },
      meetsTargets: {
        completionRate: actualCompletionRate >= performanceTargets.completionRate,
        avgTime: avgCompletionTime <= performanceTargets.maxAvgTime,
        throughput: actualThroughput >= performanceTargets.minThroughput,
      },
    });
  } finally {
    await workflowEngine.shutdown();
    await gatesManager.shutdown();
  }
}

// Export all examples for easy execution
export const examples = {
  basicWorkflowWithGates,
  multiStageProductApprovalWorkflow,
  gateErrorHandlingAndRecovery,
  performanceOptimizedGateWorkflow,
};

// Main execution function for running all examples
export async function runAllExamples() {
  logger.info('Running all workflow gate integration examples');

  try {
    await basicWorkflowWithGates();
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Brief pause between examples

    await multiStageProductApprovalWorkflow();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await gateErrorHandlingAndRecovery();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await performanceOptimizedGateWorkflow();

    logger.info('All workflow gate integration examples completed successfully');
  } catch (error) {
    logger.error('Error running workflow gate examples', { error });
    throw error;
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples().catch((error) => {
    console.error('Failed to run examples:', error);
    process.exit(1);
  });
}
