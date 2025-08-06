/**
 * Coordination Event Adapter Usage Example
 * 
 * Demonstrates practical usage of the CoordinationEventAdapter
 * in various scenarios within the Claude-Zen system.
 */

import {
  CoordinationEventAdapter,
  CoordinationEventManagerFactory,
  createCoordinationEventManager,
  createComprehensiveCoordinationEventManager,
  createHighPerformanceCoordinationEventManager,
  CoordinationEventHelpers,
  type CoordinationEventAdapterConfig
} from './coordination-event-adapter';

import type { CoordinationEvent } from '../types';

/**
 * Example 1: Basic Coordination Event Management
 * 
 * Shows how to set up basic coordination event monitoring
 * for swarm, agent, and task events.
 */
export async function basicCoordinationExample(): Promise<void> {
  console.log('=== Basic Coordination Event Management ===');

  // Create coordination event manager
  const coordinator = await createCoordinationEventManager('main-coordinator');
  await coordinator.start();

  // Subscribe to different types of coordination events
  coordinator.subscribeSwarmLifecycleEvents((event) => {
    console.log(`🐝 Swarm ${event.operation}: ${event.targetId}`);
    if (event.details?.topology) {
      console.log(`   Topology: ${event.details.topology}`);
    }
    if (event.details?.agentCount) {
      console.log(`   Agent Count: ${event.details.agentCount}`);
    }
  });

  coordinator.subscribeAgentManagementEvents((event) => {
    console.log(`🤖 Agent ${event.operation}: ${event.targetId}`);
    if (event.details?.swarmId) {
      console.log(`   Swarm: ${event.details.swarmId}`);
    }
  });

  coordinator.subscribeTaskOrchestrationEvents((event) => {
    console.log(`📋 Task ${event.operation}: ${event.targetId}`);
    if (event.details?.assignedTo) {
      console.log(`   Assigned to: ${event.details.assignedTo.join(', ')}`);
    }
  });

  // Simulate coordination events
  await simulateSwarmLifecycle(coordinator);
  
  // Check final status
  const status = await coordinator.healthCheck();
  console.log(`Final Health Status: ${status.status}`);
  console.log(`Events Processed: ${status.metadata?.eventCount || 0}`);

  await coordinator.stop();
  await coordinator.destroy();
}

/**
 * Example 2: Advanced Coordination Monitoring
 * 
 * Shows comprehensive coordination monitoring with health tracking,
 * performance metrics, and event correlation.
 */
export async function advancedCoordinationExample(): Promise<void> {
  console.log('\n=== Advanced Coordination Monitoring ===');

  // Create comprehensive coordination manager
  const coordinator = await createComprehensiveCoordinationEventManager('advanced-coordinator');
  await coordinator.start();

  // Set up detailed event monitoring
  coordinator.subscribe(['coordination:swarm', 'coordination:agent', 'coordination:task'], async (event) => {
    console.log(`📊 Event: ${event.type} | Operation: ${event.operation} | Target: ${event.targetId}`);
    
    // Check if this is part of a correlation
    if (event.correlationId) {
      const correlation = coordinator.getCoordinationCorrelatedEvents(event.correlationId);
      if (correlation) {
        console.log(`   🔗 Correlation: ${correlation.events.length} related events`);
        console.log(`   ⚡ Efficiency: ${(correlation.performance.coordinationEfficiency * 100).toFixed(1)}%`);
      }
    }
  });

  // Monitor health status changes
  setInterval(async () => {
    const healthStatus = await coordinator.getCoordinationHealthStatus();
    const unhealthyComponents = Object.entries(healthStatus)
      .filter(([_, health]) => health.status !== 'healthy');
    
    if (unhealthyComponents.length > 0) {
      console.log('⚠️  Unhealthy Components:');
      unhealthyComponents.forEach(([component, health]) => {
        console.log(`   ${component}: ${health.status} (${(health.reliability * 100).toFixed(1)}% reliable)`);
      });
    }
  }, 30000); // Check every 30 seconds

  // Simulate complex coordination workflow
  await simulateComplexCoordinationWorkflow(coordinator);

  // Get final metrics
  const metrics = await coordinator.getMetrics();
  console.log('\n📈 Final Metrics:');
  console.log(`   Events Processed: ${metrics.eventsProcessed}`);
  console.log(`   Average Latency: ${metrics.averageLatency.toFixed(2)}ms`);
  console.log(`   Throughput: ${metrics.throughput.toFixed(2)} events/sec`);
  console.log(`   Error Rate: ${(metrics.eventsFailed / metrics.eventsProcessed * 100).toFixed(2)}%`);

  await coordinator.stop();
  await coordinator.destroy();
}

/**
 * Example 3: High-Performance Coordination
 * 
 * Shows how to use the high-performance configuration
 * for production workloads with minimal overhead.
 */
export async function highPerformanceCoordinationExample(): Promise<void> {
  console.log('\n=== High-Performance Coordination ===');

  // Create high-performance coordinator
  const coordinator = await createHighPerformanceCoordinationEventManager('perf-coordinator');
  await coordinator.start();

  // Set up minimal but essential monitoring
  let eventCount = 0;
  const startTime = Date.now();

  coordinator.subscribe(['coordination:swarm', 'coordination:agent', 'coordination:task'], (event) => {
    eventCount++;
    
    // Only log critical events to minimize overhead
    if (event.priority === 'high' || event.operation === 'fail') {
      console.log(`🚨 Critical: ${event.type} ${event.operation} - ${event.targetId}`);
    }
  });

  // Simulate high-volume coordination events
  console.log('Simulating high-volume coordination events...');
  const promises: Promise<void>[] = [];
  
  for (let i = 0; i < 1000; i++) {
    const eventPromise = coordinator.emitSwarmCoordinationEvent({
      source: 'performance-test',
      type: 'coordination:task',
      operation: 'distribute',
      targetId: `task-${i}`,
      details: {
        taskType: 'performance-test',
        priority: i % 100 === 0 ? 'high' : 'medium'
      }
    });
    promises.push(eventPromise);
  }

  await Promise.all(promises);
  
  const duration = Date.now() - startTime;
  const throughput = eventCount / (duration / 1000);
  
  console.log(`✅ Performance Test Complete:`);
  console.log(`   Events: ${eventCount}`);
  console.log(`   Duration: ${duration}ms`);
  console.log(`   Throughput: ${throughput.toFixed(2)} events/sec`);

  const finalMetrics = await coordinator.getMetrics();
  console.log(`   Average Latency: ${finalMetrics.averageLatency.toFixed(2)}ms`);

  await coordinator.stop();
  await coordinator.destroy();
}

/**
 * Example 4: Custom Coordination Configuration
 * 
 * Shows how to create a custom coordination manager
 * with specific configuration for particular use cases.
 */
export async function customCoordinationExample(): Promise<void> {
  console.log('\n=== Custom Coordination Configuration ===');

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
      coordinators: ['sparc'] // Focus on SPARC methodology
    },
    
    agentManagement: {
      enabled: true,
      wrapAgentEvents: true,
      wrapHealthEvents: true,
      wrapRegistryEvents: false, // Simplified for research
      wrapLifecycleEvents: true
    },
    
    // Disable task orchestration for this use case
    taskOrchestration: {
      enabled: false,
      wrapTaskEvents: false,
      wrapDistributionEvents: false,
      wrapExecutionEvents: false,
      wrapCompletionEvents: false
    },
    
    // Enhanced correlation for research tracking
    coordination: {
      enabled: true,
      strategy: 'swarm',
      correlationTTL: 1800000, // 30 minutes for long research sessions
      maxCorrelationDepth: 25,
      correlationPatterns: [
        'coordination:swarm->coordination:agent'
      ],
      trackAgentCommunication: true,
      trackSwarmHealth: true
    },
    
    // Research-specific performance settings
    performance: {
      enableSwarmCorrelation: true,
      enableAgentTracking: true,
      enableTaskMetrics: false,
      maxConcurrentCoordinations: 50,
      coordinationTimeout: 120000, // Longer timeout for research
      enablePerformanceTracking: true
    },
    
    processing: {
      strategy: 'queued',
      queueSize: 1000
    }
  };

  const coordinator = new CoordinationEventAdapter(customConfig);
  await coordinator.start();

  // Set up research-specific monitoring
  coordinator.subscribeSwarmLifecycleEvents((event) => {
    console.log(`🔬 Research Swarm: ${event.operation} - ${event.targetId}`);
    if (event.details?.topology) {
      console.log(`   Research Topology: ${event.details.topology}`);
    }
  });

  coordinator.subscribeAgentManagementEvents((event) => {
    console.log(`🧬 Research Agent: ${event.operation} - ${event.targetId}`);
  });

  // Simulate research coordination
  await simulateResearchCoordination(coordinator);

  // Get research-specific insights
  const correlations = coordinator.getActiveCoordinationCorrelations();
  console.log(`\n🔍 Research Insights:`);
  console.log(`   Active Research Sessions: ${correlations.length}`);
  
  correlations.forEach(correlation => {
    console.log(`   Session ${correlation.correlationId}:`);
    console.log(`     Events: ${correlation.events.length}`);
    console.log(`     Duration: ${correlation.lastUpdate.getTime() - correlation.startTime.getTime()}ms`);
    console.log(`     Efficiency: ${(correlation.performance.coordinationEfficiency * 100).toFixed(1)}%`);
  });

  await coordinator.stop();
  await coordinator.destroy();
}

/**
 * Helper function to simulate basic swarm lifecycle
 */
async function simulateSwarmLifecycle(coordinator: CoordinationEventAdapter): Promise<void> {
  console.log('\n🎭 Simulating Swarm Lifecycle...');

  // Initialize swarm
  await coordinator.emitSwarmCoordinationEvent(
    CoordinationEventHelpers.createSwarmInitEvent('demo-swarm', 'mesh', {
      agentCount: 3,
      purpose: 'demonstration'
    })
  );

  // Spawn agents
  for (let i = 1; i <= 3; i++) {
    await coordinator.emitSwarmCoordinationEvent(
      CoordinationEventHelpers.createAgentSpawnEvent(`agent-${i}`, 'demo-swarm', {
        capabilities: ['research', 'analysis'],
        specialization: i === 1 ? 'data-analysis' : i === 2 ? 'pattern-recognition' : 'synthesis'
      })
    );
  }

  // Distribute tasks
  await coordinator.emitSwarmCoordinationEvent(
    CoordinationEventHelpers.createTaskDistributionEvent('demo-task', ['agent-1', 'agent-2'], {
      taskType: 'analysis',
      priority: 'medium'
    })
  );

  // Simulate a topology change
  await coordinator.emitSwarmCoordinationEvent(
    CoordinationEventHelpers.createTopologyChangeEvent('demo-swarm', 'hierarchical', {
      reason: 'optimization',
      nodeCount: 3
    })
  );

  console.log('✅ Swarm lifecycle simulation complete');
}

/**
 * Helper function to simulate complex coordination workflow
 */
async function simulateComplexCoordinationWorkflow(coordinator: CoordinationEventAdapter): Promise<void> {
  console.log('\n🎭 Simulating Complex Coordination Workflow...');

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
        agentCount: swarmId * 2
      }
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
          capabilities: ['research', 'analysis', 'coordination']
        }
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
      complexity: 'high'
    }
  });

  console.log('✅ Complex coordination workflow simulation complete');
}

/**
 * Helper function to simulate research coordination
 */
async function simulateResearchCoordination(coordinator: CoordinationEventAdapter): Promise<void> {
  console.log('\n🎭 Simulating Research Coordination...');

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
      researchType: 'pattern-analysis'
    }
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
        capabilities: ['research', 'analysis', role]
      }
    });
  }

  console.log('✅ Research coordination simulation complete');
}

/**
 * Main function to run all examples
 */
export async function runCoordinationExamples(): Promise<void> {
  console.log('🚀 Starting Coordination Event Adapter Examples\n');

  try {
    await basicCoordinationExample();
    await advancedCoordinationExample();
    await highPerformanceCoordinationExample();
    await customCoordinationExample();
    
    console.log('\n✅ All coordination examples completed successfully!');
  } catch (error) {
    console.error('❌ Error running coordination examples:', error);
  }
}

// Export for direct execution
if (require.main === module) {
  runCoordinationExamples().catch(console.error);
}