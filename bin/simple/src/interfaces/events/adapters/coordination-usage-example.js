import { getLogger } from '../../../config/logging-config.ts';
const logger = getLogger('interfaces-events-adapters-coordination-usage-example');
import { CoordinationEventAdapter, CoordinationEventHelpers, } from './coordination-event-adapter.ts';
export async function basicCoordinationExample() {
    const coordinator = new CoordinationEventAdapter({
        name: 'main-coordinator',
        type: 'coordination',
    });
    await coordinator.start();
    coordinator.subscribeSwarmLifecycleEvents((event) => {
        if (event['details']?.['topology']) {
        }
        if (event['details']?.['agentCount']) {
        }
    });
    coordinator.subscribeAgentManagementEvents((event) => {
        if (event['details']?.['swarmId']) {
        }
    });
    coordinator.subscribeTaskOrchestrationEvents((event) => {
        if (event['details']?.['assignedTo']) {
        }
    });
    await simulateSwarmLifecycle(coordinator);
    const status = await coordinator.healthCheck();
    await coordinator.stop();
    await coordinator.destroy();
}
export async function advancedCoordinationExample() {
    const coordinator = new CoordinationEventAdapter({
        name: 'advanced-coordinator',
        type: 'coordination',
        coordination: {
            enabled: true,
            strategy: 'swarm',
            correlationTTL: 300000,
            maxCorrelationDepth: 15,
            correlationPatterns: ['coordination:swarm->coordination:agent'],
            trackAgentCommunication: true,
            trackSwarmHealth: true,
        },
    });
    await coordinator.start();
    coordinator.subscribe(['coordination:swarm', 'coordination:agent', 'coordination:task'], async (event) => {
        if (event['correlationId']) {
            const correlation = coordinator.getCoordinationCorrelatedEvents(event['correlationId']);
            if (correlation) {
            }
        }
    });
    setInterval(async () => {
        const healthStatus = await coordinator.getCoordinationHealthStatus();
        const unhealthyComponents = Object.entries(healthStatus).filter(([_, health]) => health.status !== 'healthy');
        if (unhealthyComponents.length > 0) {
            unhealthyComponents.forEach(([component, health]) => { });
        }
    }, 30000);
    await simulateComplexCoordinationWorkflow(coordinator);
    const metrics = await coordinator.getMetrics();
    await coordinator.stop();
    await coordinator.destroy();
}
export async function highPerformanceCoordinationExample() {
    const coordinator = new CoordinationEventAdapter({
        name: 'perf-coordinator',
        type: 'coordination',
        performance: {
            enableSwarmCorrelation: true,
            enableAgentTracking: true,
            enableTaskMetrics: true,
            maxConcurrentCoordinations: 1000,
            coordinationTimeout: 5000,
            enablePerformanceTracking: true,
        },
        processing: {
            strategy: 'immediate',
        },
    });
    await coordinator.start();
    let eventCount = 0;
    const startTime = Date.now();
    coordinator.subscribe(['coordination:swarm', 'coordination:agent', 'coordination:task'], (event) => {
        eventCount++;
        if (event['priority'] === 'high' || event['operation'] === 'fail') {
        }
    });
    const promises = [];
    for (let i = 0; i < 1000; i++) {
        const eventPromise = coordinator.emitSwarmCoordinationEvent({
            source: 'performance-test',
            type: 'coordination:task',
            operation: 'distribute',
            targetId: `task-${i}`,
            details: {
                taskType: 'performance-test',
                priority: i % 100 === 0 ? 'high' : 'medium',
            },
        });
        promises.push(eventPromise);
    }
    await Promise.all(promises);
    const duration = Date.now() - startTime;
    const throughput = eventCount / (duration / 1000);
    const finalMetrics = await coordinator.getMetrics();
    await coordinator.stop();
    await coordinator.destroy();
}
export async function customCoordinationExample() {
    const customConfig = {
        name: 'research-coordinator',
        type: 'coordination',
        swarmCoordination: {
            enabled: true,
            wrapLifecycleEvents: true,
            wrapPerformanceEvents: false,
            wrapTopologyEvents: true,
            wrapHealthEvents: true,
            coordinators: ['sparc'],
        },
        agentManagement: {
            enabled: true,
            wrapAgentEvents: true,
            wrapHealthEvents: true,
            wrapRegistryEvents: false,
            wrapLifecycleEvents: true,
        },
        taskOrchestration: {
            enabled: false,
            wrapTaskEvents: false,
            wrapDistributionEvents: false,
            wrapExecutionEvents: false,
            wrapCompletionEvents: false,
        },
        coordination: {
            enabled: true,
            strategy: 'swarm',
            correlationTTL: 1800000,
            maxCorrelationDepth: 25,
            correlationPatterns: ['coordination:swarm->coordination:agent'],
            trackAgentCommunication: true,
            trackSwarmHealth: true,
        },
        performance: {
            enableSwarmCorrelation: true,
            enableAgentTracking: true,
            enableTaskMetrics: false,
            maxConcurrentCoordinations: 50,
            coordinationTimeout: 120000,
            enablePerformanceTracking: true,
        },
        processing: {
            strategy: 'queued',
            queueSize: 1000,
        },
    };
    const coordinator = new CoordinationEventAdapter(customConfig);
    await coordinator.start();
    coordinator.subscribeSwarmLifecycleEvents((event) => {
        if (event['details']?.['topology']) {
        }
    });
    coordinator.subscribeAgentManagementEvents((event) => { });
    await simulateResearchCoordination(coordinator);
    const correlations = coordinator.getActiveCoordinationCorrelations();
    correlations.forEach((correlation) => { });
    await coordinator.stop();
    await coordinator.destroy();
}
async function simulateSwarmLifecycle(coordinator) {
    await coordinator.emitSwarmCoordinationEvent(CoordinationEventHelpers.createSwarmInitEvent('demo-swarm', 'mesh', {
        agentCount: 3,
        purpose: 'demonstration',
    }));
    for (let i = 1; i <= 3; i++) {
        await coordinator.emitSwarmCoordinationEvent(CoordinationEventHelpers.createAgentSpawnEvent(`agent-${i}`, 'demo-swarm', {
            capabilities: ['research', 'analysis'],
            specialization: i === 1
                ? 'data-analysis'
                : i === 2
                    ? 'pattern-recognition'
                    : 'synthesis',
        }));
    }
    await coordinator.emitSwarmCoordinationEvent(CoordinationEventHelpers.createTaskDistributionEvent('demo-task', ['agent-1', 'agent-2'], {
        taskType: 'analysis',
        priority: 'medium',
    }));
    await coordinator.emitSwarmCoordinationEvent(CoordinationEventHelpers.createTopologyChangeEvent('demo-swarm', 'hierarchical', {
        reason: 'optimization',
        nodeCount: 3,
    }));
}
async function simulateComplexCoordinationWorkflow(coordinator) {
    const correlationId = `workflow-${Date.now()}`;
    for (let swarmId = 1; swarmId <= 3; swarmId++) {
        await coordinator.emitSwarmCoordinationEvent({
            source: 'swarm-orchestrator',
            type: 'coordination:swarm',
            operation: 'init',
            targetId: `swarm-${swarmId}`,
            correlationId,
            details: {
                topology: swarmId === 1 ? 'mesh' : swarmId === 2 ? 'hierarchical' : 'star',
                agentCount: swarmId * 2,
            },
        });
        for (let agentId = 1; agentId <= swarmId * 2; agentId++) {
            await coordinator.emitSwarmCoordinationEvent({
                source: 'agent-manager',
                type: 'coordination:agent',
                operation: 'spawn',
                targetId: `swarm-${swarmId}-agent-${agentId}`,
                correlationId,
                details: {
                    capabilities: ['research', 'analysis', 'coordination'],
                },
            });
        }
    }
    await coordinator.emitSwarmCoordinationEvent({
        source: 'task-orchestrator',
        type: 'coordination:task',
        operation: 'distribute',
        targetId: 'inter-swarm-coordination',
        correlationId,
        details: {
            taskType: 'coordination',
            assignedTo: ['swarm-1', 'swarm-2', 'swarm-3'],
        },
    });
}
async function simulateResearchCoordination(coordinator) {
    const researchSession = `research-${Date.now()}`;
    await coordinator.emitSwarmCoordinationEvent({
        source: 'research-coordinator',
        type: 'coordination:swarm',
        operation: 'init',
        targetId: 'research-swarm',
        correlationId: researchSession,
        details: {
            topology: 'hierarchical',
            agentCount: 4,
        },
    });
    const researchRoles = [
        'data-collector',
        'pattern-analyzer',
        'hypothesis-generator',
        'validator',
    ];
    for (const role of researchRoles) {
        await coordinator.emitSwarmCoordinationEvent({
            source: 'research-agent-manager',
            type: 'coordination:agent',
            operation: 'spawn',
            targetId: `research-${role}`,
            correlationId: researchSession,
            details: {
                specialization: role,
                capabilities: ['research', 'analysis', role],
            },
        });
    }
}
export async function runCoordinationExamples() {
    try {
        await basicCoordinationExample();
        await advancedCoordinationExample();
        await highPerformanceCoordinationExample();
        await customCoordinationExample();
    }
    catch (error) {
        logger.error('❌ Error running coordination examples:', error);
    }
}
if (require.main === module) {
    runCoordinationExamples().catch(console.error);
}
//# sourceMappingURL=coordination-usage-example.js.map