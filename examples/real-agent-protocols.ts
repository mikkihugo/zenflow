#!/usr/bin/env node

/**
 * Real Agent Protocols Example
 *
 * Shows how to use sophisticated agent communication and coordination
 * instead of simple MCP wrappers. This gives us real distributed systems
 * capabilities: consensus, leader election, message passing, work stealing.
 */

import { CommunicationProtocol } from '../src/coordination/protocols/communication/communication-protocols';
import { CoordinationPatterns } from '../src/coordination/protocols/patterns/coordination-patterns';
import { SwarmCoordinator } from '../src/coordination/swarm/core/swarm-coordinator';

/**
 * Example 1: Real Distributed Consensus
 * Instead of MCP, use Raft consensus for agent coordination
 */
export async function distributedConsensusExample() {
  const coordinationPatterns = new CoordinationPatterns({
    consensus: {
      algorithm: 'raft',
      electionTimeout: [150, 300],
      heartbeatInterval: 50,
      logReplicationTimeout: 100,
      maxLogEntries: 1000,
      snapshotThreshold: 100,
    },
  });

  // Initialize multi-node agent cluster
  const _nodes = await Promise.all([
    coordinationPatterns.createNode({
      id: 'agent-1',
      type: 'candidate',
      capabilities: ['coding', 'analysis'],
    }),
    coordinationPatterns.createNode({
      id: 'agent-2',
      type: 'candidate',
      capabilities: ['testing', 'review'],
    }),
    coordinationPatterns.createNode({
      id: 'agent-3',
      type: 'candidate',
      capabilities: ['coordination', 'planning'],
    }),
  ]);

  // Elect leader using Raft algorithm
  const _leaderElection = await coordinationPatterns.electLeader({
    algorithm: 'raft',
    timeoutMs: 5000,
    priorityBased: true,
    minNodes: 2,
  });

  // Distributed task assignment with consensus
  const taskAssignment = await coordinationPatterns.proposeConsensus({
    proposal: {
      type: 'task_assignment',
      tasks: [
        { id: 'task-1', type: 'coding', assignee: 'agent-1' },
        { id: 'task-2', type: 'testing', assignee: 'agent-2' },
        { id: 'task-3', type: 'coordination', assignee: 'agent-3' },
      ],
    },
    requiredVotes: 2,
  });

  if (taskAssignment.consensus) {
  } else {
  }

  await coordinationPatterns.shutdown();
}

/**
 * Example 2: Advanced Message Passing
 * Sophisticated agent communication with gossip protocols
 */
export async function advancedMessagePassingExample() {
  const commProtocol = new CommunicationProtocol({
    compression: { enabled: true, algorithm: 'gzip', level: 6 },
    encryption: { enabled: true, algorithm: 'aes-256-gcm' },
    qos: { reliability: 'at-least-once', ordering: 'fifo' },
  });

  await commProtocol.initialize();

  // Create agent network
  const agents = ['coder-agent', 'test-agent', 'review-agent', 'coord-agent'];

  for (const agent of agents) {
    await commProtocol.registerNode(agent, {
      capabilities: agent.split('-')[0],
      endpoint: `agent://${agent}`,
      protocols: ['gossip', 'consensus', 'broadcast'],
    });
  }

  // Gossip protocol for distributed knowledge sharing
  await commProtocol.initiateGossip({
    initiator: 'coder-agent',
    payload: {
      type: 'knowledge_update',
      data: {
        discovery: 'found-new-optimization-pattern',
        confidence: 0.85,
        evidence: ['performance-test-results', 'code-analysis'],
      },
    },
    gossipRounds: 3,
    fanout: 2,
  });

  // Multicast coordination message
  await commProtocol.multicast({
    type: 'coordination',
    sender: 'coord-agent',
    recipients: ['coder-agent', 'test-agent'],
    payload: {
      data: {
        instruction: 'begin-integration-testing',
        priority: 'high',
        deadline: Date.now() + 3600000, // 1 hour
      },
    },
    priority: 'high',
    qos: { reliability: 'exactly-once', timeout: 30000 },
  });

  // Emergency broadcast
  await commProtocol.broadcast({
    type: 'emergency',
    sender: 'coord-agent',
    payload: {
      data: {
        alert: 'critical-security-vulnerability-detected',
        action: 'halt-all-operations',
        severity: 'critical',
      },
    },
    priority: 'emergency',
    ttl: 60000, // 1 minute
  });

  await commProtocol.shutdown();
}

/**
 * Example 3: Work-Stealing Agent Coordination
 * Dynamic load balancing with work-stealing queues
 */
export async function workStealingExample() {
  const coordinationPatterns = new CoordinationPatterns({
    workStealing: {
      maxQueueSize: 100,
      stealThreshold: 10,
      stealRatio: 0.5,
      retryInterval: 1000,
      maxRetries: 3,
      loadBalancingInterval: 5000,
    },
  });

  // Create heterogeneous agent pool
  const _agentPool = await coordinationPatterns.createWorkStealingPool([
    { id: 'fast-coder', capabilities: ['coding'], performance: 1.5 },
    { id: 'slow-coder', capabilities: ['coding'], performance: 0.8 },
    { id: 'fast-tester', capabilities: ['testing'], performance: 1.2 },
    { id: 'multi-agent', capabilities: ['coding', 'testing', 'review'], performance: 1.0 },
  ]);

  // Add large batch of tasks
  const tasks = Array.from({ length: 50 }, (_, i) => ({
    id: `task-${i}`,
    type: Math.random() > 0.5 ? 'coding' : 'testing',
    complexity: Math.floor(Math.random() * 5) + 1,
    deadline: Date.now() + Math.random() * 10000,
  }));

  await coordinationPatterns.distributeTasks(tasks);

  // Monitor work-stealing behavior
  const _workStealingStats = await coordinationPatterns.monitorWorkStealing({
    duration: 10000, // 10 seconds
    sampleInterval: 1000,
  });

  await coordinationPatterns.shutdown();
}

/**
 * Example 4: Hybrid Agent Architecture
 * Combines real protocols with SwarmCoordinator for best of both worlds
 */
export async function hybridAgentArchitectureExample() {
  // Real protocols for low-level coordination
  const commProtocol = new CommunicationProtocol();
  const coordinationPatterns = new CoordinationPatterns();

  // SwarmCoordinator for high-level orchestration
  const swarmCoordinator = new SwarmCoordinator({
    topology: 'hierarchical',
    maxAgents: 8,
    strategy: 'adaptive',
    // Use real protocols underneath
    communicationProtocol: commProtocol,
    coordinationPatterns: coordinationPatterns,
  });

  await Promise.all([
    commProtocol.initialize(),
    coordinationPatterns.initialize(),
    swarmCoordinator.initializeSwarm({ topology: 'hierarchical', agentCount: 6 }),
  ]);

  // High-level task orchestration
  const _orchestrationResult = await swarmCoordinator.orchestrateTask({
    type: 'complex_system_development',
    input: {
      requirements: 'Build distributed microservices architecture',
      technologies: ['nodejs', 'postgresql', 'redis', 'docker'],
      deadline: '2024-12-31',
    },
    strategy: 'adaptive',
  });

  // Get combined metrics
  const _hybridMetrics = {
    swarm: await swarmCoordinator.getMetrics(),
    communication: await commProtocol.getMetrics(),
    coordination: await coordinationPatterns.getMetrics(),
  };

  await Promise.all([
    swarmCoordinator.shutdown(),
    coordinationPatterns.shutdown(),
    commProtocol.shutdown(),
  ]);
}

/**
 * Main execution
 */
async function main() {
  try {
    await distributedConsensusExample();

    await advancedMessagePassingExample();

    await workStealingExample();

    await hybridAgentArchitectureExample();
  } catch (error) {
    console.error('❌ Example failed:', error);
    process.exit(1);
  }
}

// Run examples if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
