import { getLogger } from '../config/logging-config.ts';
import { WorkflowGatesManager, } from '../coordination/orchestration/workflow-gates.ts';
import { TypeSafeEventBus, } from '../core/type-safe-event-system.ts';
import { WorkflowEngine, } from '../workflows/workflow-engine.ts';
const logger = getLogger('workflow-gate-examples');
export async function basicWorkflowWithGates() {
    logger.info('Running basic workflow with gates example');
    const eventBus = new TypeSafeEventBus();
    const gatesManager = new WorkflowGatesManager(eventBus, {
        persistencePath: './data/examples-gates.db',
        enableMetrics: true,
    });
    const workflowEngine = new WorkflowEngine({
        maxConcurrentWorkflows: 5,
        persistWorkflows: true,
    }, undefined, undefined, gatesManager);
    await gatesManager.initialize();
    await workflowEngine.initialize();
    const definition = {
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
        let attempts = 0;
        const maxAttempts = 20;
        while (attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            const status = workflowEngine.getWorkflowStatus(result.workflowId);
            const gateStatus = workflowEngine.getWorkflowGateStatus(result.workflowId);
            logger.info('Workflow status check', {
                status: status?.status,
                currentStep: status?.currentStep,
                hasPendingGates: gateStatus.hasPendingGates,
                pausedForGate: gateStatus.pausedForGate,
            });
            if (status?.status === 'paused' && gateStatus.pausedForGate) {
                logger.info('Workflow paused for gate approval', {
                    gateId: gateStatus.pausedForGate.gateId,
                    stepIndex: gateStatus.pausedForGate.stepIndex,
                });
                await new Promise((resolve) => setTimeout(resolve, 1000));
                const approvalResult = await workflowEngine.resumeWorkflowAfterGate(result.workflowId, gateStatus.pausedForGate.gateId, true);
                if (!approvalResult.success) {
                    throw new Error(`Failed to approve gate: ${approvalResult.error}`);
                }
                logger.info('Gate approved, workflow resumed', {
                    gateId: gateStatus.pausedForGate.gateId,
                });
            }
            else if (status?.status === 'completed') {
                logger.info('Workflow completed successfully');
                break;
            }
            else if (status?.status === 'failed') {
                throw new Error(`Workflow failed: ${status.error}`);
            }
            attempts++;
        }
        if (attempts >= maxAttempts) {
            logger.warn('Workflow monitoring timed out');
        }
        const finalStatus = workflowEngine.getWorkflowStatus(result.workflowId);
        const finalGateStatus = workflowEngine.getWorkflowGateStatus(result.workflowId);
        logger.info('Basic workflow with gates completed', {
            finalStatus: finalStatus?.status,
            gateResults: finalGateStatus.gateResults.length,
            totalProcessingTime: finalStatus?.endTime
                ? new Date(finalStatus.endTime).getTime() -
                    new Date(finalStatus.startTime).getTime()
                : 0,
        });
    }
    finally {
        await workflowEngine.shutdown();
        await gatesManager.shutdown();
    }
}
export async function multiStageProductApprovalWorkflow() {
    logger.info('Running multi-stage product approval workflow example');
    const eventBus = new TypeSafeEventBus();
    const gatesManager = new WorkflowGatesManager(eventBus, {
        persistencePath: './data/product-approval-gates.db',
        enableMetrics: true,
    });
    const workflowEngine = new WorkflowEngine({
        maxConcurrentWorkflows: 3,
        persistWorkflows: true,
        retryAttempts: 2,
    }, undefined, undefined, gatesManager);
    await gatesManager.initialize();
    await workflowEngine.initialize();
    const definition = {
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
        let completedStages = 0;
        let attempts = 0;
        const maxAttempts = 50;
        while (attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 300));
            const status = workflowEngine.getWorkflowStatus(result.workflowId);
            const gateStatus = workflowEngine.getWorkflowGateStatus(result.workflowId);
            if (status?.status === 'paused' && gateStatus.pausedForGate) {
                completedStages++;
                logger.info(`Processing approval stage ${completedStages}`, {
                    gateId: gateStatus.pausedForGate.gateId,
                    stepIndex: gateStatus.pausedForGate.stepIndex,
                    stageName: definition.steps[gateStatus.pausedForGate.stepIndex].name,
                });
                let approved = true;
                let delay = 500;
                switch (completedStages) {
                    case 1:
                        delay = 200;
                        break;
                    case 2:
                        delay = 800;
                        break;
                    case 3:
                        delay = 1200;
                        if (Math.random() > 0.8) {
                            approved = false;
                            logger.info('Budget approval initially rejected, requesting revision');
                        }
                        break;
                    case 4:
                        delay = 600;
                        break;
                    case 5:
                        delay = 1000;
                        break;
                }
                await new Promise((resolve) => setTimeout(resolve, delay));
                const approvalResult = await workflowEngine.resumeWorkflowAfterGate(result.workflowId, gateStatus.pausedForGate.gateId, approved);
                if (!approvalResult.success) {
                    logger.error('Failed to process gate approval', {
                        error: approvalResult.error,
                        gateId: gateStatus.pausedForGate.gateId,
                    });
                }
                else if (approved) {
                    logger.info(`Stage ${completedStages} approved and workflow resumed`);
                }
                else {
                    logger.info(`Stage ${completedStages} rejected, workflow may fail`);
                }
            }
            else if (status?.status === 'completed') {
                logger.info('Multi-stage approval workflow completed successfully');
                break;
            }
            else if (status?.status === 'failed') {
                logger.warn(`Workflow failed at stage ${completedStages}: ${status.error}`);
                break;
            }
            attempts++;
        }
        const finalStatus = workflowEngine.getWorkflowStatus(result.workflowId);
        const finalGateStatus = workflowEngine.getWorkflowGateStatus(result.workflowId);
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
                ? new Date(finalStatus.endTime).getTime() -
                    new Date(finalStatus.startTime).getTime()
                : 0,
        });
    }
    finally {
        await workflowEngine.shutdown();
        await gatesManager.shutdown();
    }
}
export async function gateErrorHandlingAndRecovery() {
    logger.info('Running gate error handling and recovery example');
    const eventBus = new TypeSafeEventBus();
    const gatesManager = new WorkflowGatesManager(eventBus, {
        persistencePath: ':memory:',
        enableMetrics: true,
        queueProcessingInterval: 100,
    });
    const workflowEngine = new WorkflowEngine({
        maxConcurrentWorkflows: 5,
        stepTimeout: 2000,
        retryAttempts: 1,
    }, undefined, undefined, gatesManager);
    await gatesManager.initialize();
    await workflowEngine.initialize();
    const definition = {
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
                timeout: 1000,
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
            const status = workflowEngine.getWorkflowStatus(result.workflowId);
            const gateStatus = workflowEngine.getWorkflowGateStatus(result.workflowId);
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
                if (stepName === 'Timeout-Prone Gate') {
                    logger.info('Simulating slow approval process...');
                    await new Promise((resolve) => setTimeout(resolve, 1500));
                    try {
                        const approvalResult = await workflowEngine.resumeWorkflowAfterGate(result.workflowId, gateStatus.pausedForGate.gateId, true);
                        if (approvalResult.success) {
                            logger.info('Timeout gate approved successfully (recovery)');
                            recoveryCount++;
                        }
                        else {
                            logger.warn('Timeout gate approval failed');
                            errorCount++;
                        }
                    }
                    catch (error) {
                        logger.error('Error during timeout gate processing', { error });
                        errorCount++;
                    }
                }
                else if (stepName === 'High-Risk Gate') {
                    logger.info('Simulating high-risk gate processing with escalation');
                    const approvalResult = await workflowEngine.resumeWorkflowAfterGate(result.workflowId, gateStatus.pausedForGate.gateId, false);
                    if (approvalResult.success) {
                        logger.info('High-risk gate rejected, simulating escalation...');
                        errorCount++;
                    }
                }
                else {
                    const approvalResult = await workflowEngine.resumeWorkflowAfterGate(result.workflowId, gateStatus.pausedForGate.gateId, true);
                    if (approvalResult.success) {
                        logger.info('Normal gate approved');
                    }
                    else {
                        logger.warn('Normal gate approval failed');
                        errorCount++;
                    }
                }
            }
            else if (status?.status === 'completed') {
                logger.info('Error handling workflow completed');
                break;
            }
            else if (status?.status === 'failed') {
                logger.info('Workflow failed as expected in error scenario', {
                    error: status.error,
                });
                errorCount++;
                break;
            }
            attempts++;
        }
        const finalStatus = workflowEngine.getWorkflowStatus(result.workflowId);
        const finalGateStatus = workflowEngine.getWorkflowGateStatus(result.workflowId);
        logger.info('Error handling and recovery analysis', {
            finalStatus: finalStatus?.status,
            errorCount,
            recoveryCount,
            totalGateResults: finalGateStatus.gateResults.length,
            successfulRecoveryRate: (recoveryCount / (errorCount + recoveryCount)) * 100,
        });
    }
    catch (error) {
        logger.error('Error handling example encountered unexpected error', {
            error,
        });
    }
    finally {
        await workflowEngine.shutdown();
        await gatesManager.shutdown();
    }
}
export async function performanceOptimizedGateWorkflow() {
    logger.info('Running performance optimized gate workflow example');
    const eventBus = new TypeSafeEventBus();
    const gatesManager = new WorkflowGatesManager(eventBus, {
        persistencePath: ':memory:',
        queueProcessingInterval: 10,
        maxConcurrentGates: 20,
        enableMetrics: true,
    });
    const workflowEngine = new WorkflowEngine({
        maxConcurrentWorkflows: 10,
        stepTimeout: 5000,
        persistWorkflows: false,
    }, undefined, undefined, gatesManager);
    await gatesManager.initialize();
    await workflowEngine.initialize();
    const startTime = Date.now();
    const workflowCount = 5;
    const results = [];
    try {
        const workflowPromises = Array.from({ length: workflowCount }, (_, i) => {
            const definition = {
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
                            autoApproval: true,
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
                            enabled: i % 3 === 0,
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
                batchId: Math.floor(i / 2),
            });
        });
        const workflowResults = await Promise.all(workflowPromises);
        const setupTime = Date.now() - startTime;
        logger.info('Performance test workflows started', {
            count: workflowCount,
            setupTime,
            successCount: workflowResults.filter((r) => r.success).length,
        });
        let completedCount = 0;
        let attempts = 0;
        const maxAttempts = 30;
        while (completedCount < workflowCount && attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            for (const result of workflowResults) {
                if (!result.success)
                    continue;
                const status = workflowEngine.getWorkflowStatus(result.workflowId);
                if (status?.status === 'paused') {
                    const gateStatus = workflowEngine.getWorkflowGateStatus(result.workflowId);
                    if (gateStatus.pausedForGate) {
                        await workflowEngine.resumeWorkflowAfterGate(result.workflowId, gateStatus.pausedForGate.gateId, true);
                    }
                }
                else if (status?.status === 'completed') {
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
        const avgCompletionTime = results.length > 0
            ? results.reduce((sum, r) => sum + r.completionTime, 0) / results.length
            : 0;
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
        const performanceTargets = {
            completionRate: 0.9,
            maxAvgTime: 3000,
            minThroughput: 1,
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
    }
    finally {
        await workflowEngine.shutdown();
        await gatesManager.shutdown();
    }
}
export const examples = {
    basicWorkflowWithGates,
    multiStageProductApprovalWorkflow,
    gateErrorHandlingAndRecovery,
    performanceOptimizedGateWorkflow,
};
export async function runAllExamples() {
    logger.info('Running all workflow gate integration examples');
    try {
        await basicWorkflowWithGates();
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await multiStageProductApprovalWorkflow();
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await gateErrorHandlingAndRecovery();
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await performanceOptimizedGateWorkflow();
        logger.info('All workflow gate integration examples completed successfully');
    }
    catch (error) {
        logger.error('Error running workflow gate examples', { error });
        throw error;
    }
}
if (require.main === module) {
    runAllExamples().catch((error) => {
        console.error('Failed to run examples:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=workflow-gate-integration.js.map