/**
 * @file Interface implementation: coordination-usage-example
 */


import { getLogger } from '../../../../config/logging-config';

const logger = getLogger('interfaces-events-adapters-coordination-usage-example');

/**
 * Coordination Event Adapter Usage Example.
 *
 * Demonstrates practical usage of the CoordinationEventAdapter.
 * in various scenarios within the Claude-Zen system.
 */

import {
  CoordinationEventAdapter,
  CoordinationEventHelpers,
  createComprehensiveCoordinationEventManager,
  createCoordinationEventManager,
  createHighPerformanceCoordinationEventManager,
} from './coordination-event-adapter';

/**
 * Example 1: Basic Coordination Event Management.
 *
 * Shows how to set up basic coordination event monitoring.
 * for swarm, agent, and task events.
 */
export async function basicCoordinationExample(): Promise<void> {
  // Create coordination event manager
  const coordinator = await createCoordinationEventManager('main-coordinator');
  await coordinator.start();

  // Subscribe to different types of coordination events
  coordinator.subscribeSwarmLifecycleEvents((event) => {
    if (event["details"]?.["topology"]) {
    }
    if (event["details"]?.["agentCount"]) {
    }
  });

  coordinator.subscribeAgentManagementEvents((event) => {
    if (event["details"]?.["swarmId"]) {
    }
  });

  coordinator.subscribeTaskOrchestrationEvents((event) => {
    if (event["details"]?.["assignedTo"]) {
    }
  });

  // Simulate coordination events
  await simulateSwarmLifecycle(coordinator);

  // Check final status
  const status = await coordinator.healthCheck();

  await coordinator.stop();
  await coordinator.destroy();
}

/**
 * Example 2: Advanced Coordination Monitoring.
 *
 * Shows comprehensive coordination monitoring with health tracking,
 * performance metrics, and event correlation.
 */
export async function advancedCoordinationExample(): Promise<void> {
  // Create comprehensive coordination manager
  const coordinator = await createComprehensiveCoordinationEventManager('advanced-coordinator');
  await coordinator.start();

  // Set up detailed event monitoring
  coordinator.subscribe(
    ['coordination:swarm', 'coordination:agent', 'coordination:task'],
    async (event) => {
      // Check if this is part of a correlation
      if (event["correlationId"]) {
        const correlation = coordinator.getCoordinationCorrelatedEvents(event["correlationId"]);
        if (correlation) {
        }
      }
    }
  );

  // Monitor health status changes
  setInterval(async () => {
    const healthStatus = await coordinator.getCoordinationHealthStatus();
    const unhealthyComponents = Object.entries(healthStatus).filter(
      ([_, health]) => health.status !== 'healthy'
    );

    if (unhealthyComponents.length > 0) {
      unhealthyComponents.forEach(([component, health]) => {});
    }
  }, 30000); // Check every 30 seconds

  // Simulate complex coordination workflow
  await simulateComplexCoordinationWorkflow(coordinator);

  // Get final metrics
  const metrics = await coordinator.getMetrics();

  await coordinator.stop();
  await coordinator.destroy();
}

/**
 * Example 3: High-Performance Coordination.
 *
 * Shows how to use the high-performance configuration.
 * for production workloads with minimal overhead.
 */
export async function highPerformanceCoordinationExample(): Promise<void> {
  // Create high-performance coordinator
  const coordinator = await createHighPerformanceCoordinationEventManager('perf-coordinator');
  await coordinator.start();

  // Set up minimal but essential monitoring
  let eventCount = 0;
  const startTime = Date.now();

  coordinator.subscribe(
    ['coordination:swarm', 'coordination:agent', 'coordination:task'],
    (event) => {
      eventCount++;

      // Only log critical events to minimize overhead
      if (event["priority"] === 'high' || event["operation"] === 'fail') {
      }
    }
  );
  const promises: Promise<void>[] = [];

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

/**
 * Example 4: Custom Coordination Configuration.
 *
 * Shows how to create a custom coordination manager.
 * with specific configuration for particular use cases.
 */
export async function customCoordinationExample(): Promise<void> {
  // Create custom configuration for research-focused coordination
  const customConfig: CoordinationEventAdapterConfig = {
    name: 'research-coordinator',
    type: 'coordination',

    // Enable only swarm and agent coordination
    swarmCoordination: {
      enabled: true,
      wrapLifecycleEvents: true,
      wrapPerformanceEvents: false, // Disable for research focus
      wrapTopologyEvents: true,
      wrapHealthEvents: true,
      coordinators: ['sparc'], // Focus on SPARC methodology
    },

    agentManagement: {
      enabled: true,
      wrapAgentEvents: true,
      wrapHealthEvents: true,
      wrapRegistryEvents: false, // Simplified for research
      wrapLifecycleEvents: true,
    },

    // Disable task orchestration for this use case
    taskOrchestration: {
      enabled: false,
      wrapTaskEvents: false,
      wrapDistributionEvents: false,
      wrapExecutionEvents: false,
      wrapCompletionEvents: false,
    },

    // Enhanced correlation for research tracking
    coordination: {
      enabled: true,
      strategy: 'swarm',
      correlationTTL: 1800000, // 30 minutes for long research sessions
      maxCorrelationDepth: 25,
      correlationPatterns: ['coordination:swarm->coordination:agent'],
      trackAgentCommunication: true,
      trackSwarmHealth: true,
    },

    // Research-specific performance settings
    performance: {
      enableSwarmCorrelation: true,
      enableAgentTracking: true,
      enableTaskMetrics: false,
      maxConcurrentCoordinations: 50,
      coordinationTimeout: 120000, // Longer timeout for research
      enablePerformanceTracking: true,
    },

    processing: {
      strategy: 'queued',
      queueSize: 1000,
    },
  };

  const coordinator = new CoordinationEventAdapter(customConfig);
  await coordinator.start();

  // Set up research-specific monitoring
  coordinator.subscribeSwarmLifecycleEvents((event) => {
    if (event["details"]?.["topology"]) {
    }
  });

  coordinator.subscribeAgentManagementEvents((event) => {});

  // Simulate research coordination
  await simulateResearchCoordination(coordinator);

  // Get research-specific insights
  const correlations = coordinator.getActiveCoordinationCorrelations();

  correlations.forEach((correlation) => {});

  await coordinator.stop();
  await coordinator.destroy();
}

/**
 * Helper function to simulate basic swarm lifecycle.
 *
 * @param coordinator
 */
async function simulateSwarmLifecycle(coordinator: CoordinationEventAdapter): Promise<void> {
  // Initialize swarm
  await coordinator.emitSwarmCoordinationEvent(
    CoordinationEventHelpers.createSwarmInitEvent('demo-swarm', 'mesh', {
      agentCount: 3,
      purpose: 'demonstration',
    })
  );

  // Spawn agents
  for (let i = 1; i <= 3; i++) {
    await coordinator.emitSwarmCoordinationEvent(
      CoordinationEventHelpers.createAgentSpawnEvent(`agent-${i}`, 'demo-swarm', {
        capabilities: ['research', 'analysis'],
        specialization: i === 1 ? 'data-analysis' : i === 2 ? 'pattern-recognition' : 'synthesis',
      })
    );
  }

  // Distribute tasks
  await coordinator.emitSwarmCoordinationEvent(
    CoordinationEventHelpers.createTaskDistributionEvent('demo-task', ['agent-1', 'agent-2'], {
      taskType: 'analysis',
      priority: 'medium',
    })
  );

  // Simulate a topology change
  await coordinator.emitSwarmCoordinationEvent(
    CoordinationEventHelpers.createTopologyChangeEvent('demo-swarm', 'hierarchical', {
      reason: 'optimization',
      nodeCount: 3,
    })
  );
}

/**
 * Helper function to simulate complex coordination workflow.
 *
 * @param coordinator
 */
async function simulateComplexCoordinationWorkflow(
  coordinator: CoordinationEventAdapter
): Promise<void> {
  const correlationId = `workflow-${Date.now()}`;

  // Initialize multiple swarms
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

    // Spawn agents for each swarm
    for (let agentId = 1; agentId <= swarmId * 2; agentId++) {
      await coordinator.emitSwarmCoordinationEvent({
        source: 'agent-manager',
        type: 'coordination:agent',
        operation: 'spawn',
        targetId: `swarm-${swarmId}-agent-${agentId}`,
        correlationId,
        details: {
          swarmId: `swarm-${swarmId}`,
          capabilities: ['research', 'analysis', 'coordination'],
        },
      });
    }
  }

  // Create inter-swarm coordination tasks
  await coordinator.emitSwarmCoordinationEvent({
    source: 'task-orchestrator',
    type: 'coordination:task',
    operation: 'distribute',
    targetId: 'inter-swarm-coordination',
    correlationId,
    details: {
      taskType: 'coordination',
      assignedTo: ['swarm-1', 'swarm-2', 'swarm-3'],
      complexity: 'high',
    },
  });
}

/**
 * Helper function to simulate research coordination.
 *
 * @param coordinator
 */
async function simulateResearchCoordination(coordinator: CoordinationEventAdapter): Promise<void> {
  const researchSession = `research-${Date.now()}`;

  // Initialize research swarm
  await coordinator.emitSwarmCoordinationEvent({
    source: 'research-coordinator',
    type: 'coordination:swarm',
    operation: 'init',
    targetId: 'research-swarm',
    correlationId: researchSession,
    details: {
      topology: 'hierarchical',
      agentCount: 4,
      researchType: 'pattern-analysis',
    },
  });

  // Spawn specialized research agents
  const researchRoles = ['data-collector', 'pattern-analyzer', 'hypothesis-generator', 'validator'];

  for (const role of researchRoles) {
    await coordinator.emitSwarmCoordinationEvent({
      source: 'research-agent-manager',
      type: 'coordination:agent',
      operation: 'spawn',
      targetId: `research-${role}`,
      correlationId: researchSession,
      details: {
        swarmId: 'research-swarm',
        specialization: role,
        capabilities: ['research', 'analysis', role],
      },
    });
  }
}

/**
 * Main function to run all examples.
 */
export async function runCoordinationExamples(): Promise<void> {
  try {
    await basicCoordinationExample();
    await advancedCoordinationExample();
    await highPerformanceCoordinationExample();
    await customCoordinationExample();
  } catch (error) {
    logger.error('❌ Error running coordination examples:', error);
  }
}

// Export for direct execution
if (require.main === module) {
  runCoordinationExamples().catch(console.error);
}
