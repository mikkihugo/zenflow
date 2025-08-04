#!/usr/bin/env node

/**
 * Claude-Zen Direct Usage Example
 *
 * This demonstrates the PRIMARY pattern for using Claude-Zen:
 * Direct imports and function calls instead of MCP processes.
 *
 * MCP remains available for temporary swarms or external coordination,
 * but direct usage is faster, simpler, and more reliable.
 */

import { AgentManager } from '../src/coordination/agents/agent-manager';
import { SwarmCoordinator } from '../src/coordination/swarm/core/swarm-coordinator';
import { MemoryCoordinator } from '../src/memory/core/memory-coordinator';

/**
 * Example 1: Permanent Project Swarm
 * Lives with the project, direct imports for coordination
 */
export async function permanentProjectSwarmExample() {
  // Permanent swarm lives with the project
  const projectSwarm = new SwarmCoordinator({
    topology: 'hierarchical',
    maxAgents: 8,
    strategy: 'specialized',
    persistent: true, // Lives with project
    workspaceId: 'my-project-2024',
  });

  // Initialize permanent project swarm
  await projectSwarm.initializeSwarm({
    topology: 'hierarchical',
    agentCount: 6,
  });

  // Spawn permanent project agents (persist across sessions)
  const _agents = await Promise.all([
    projectSwarm.spawnAgent({ type: 'architect', name: 'System Architect', persistent: true }),
    projectSwarm.spawnAgent({ type: 'coder', name: 'Lead Developer', persistent: true }),
    projectSwarm.spawnAgent({ type: 'analyst', name: 'Business Analyst', persistent: true }),
    projectSwarm.spawnAgent({ type: 'tester', name: 'QA Engineer', persistent: true }),
    projectSwarm.spawnAgent({ type: 'coordinator', name: 'Project Manager', persistent: true }),
  ]);

  // Orchestrate tasks directly
  const _result = await swarm.orchestrateTask({
    type: 'code_generation',
    input: {
      requirements: 'Create a REST API with authentication',
      framework: 'express',
      database: 'postgresql',
    },
    strategy: 'parallel',
    agents: ['coder', 'analyst'],
  });

  // Get real-time status
  const _status = await swarm.getStatus();

  await swarm.shutdown();
}

/**
 * Example 2: Memory Coordination
 * Direct memory management without external processes
 */
export async function directMemoryExample() {
  const memory = new MemoryCoordinator({
    backend: 'sqlite',
    persistentSessions: true,
  });

  await memory.initialize();

  // Store coordination data directly
  await memory.store('swarm/session-1/context', {
    agents: ['coder', 'analyst'],
    progress: 'implementing-auth',
    decisions: ['use-jwt-tokens', 'postgres-sessions'],
  });

  // Retrieve data directly
  const _context = await memory.retrieve('swarm/session-1/context');

  // Cross-session memory (survives restarts)
  await memory.persistSession('session-1', {
    startTime: Date.now(),
    swarmTopology: 'mesh',
    completedTasks: 3,
  });

  await memory.shutdown();
}

/**
 * Example 3: Agent Management
 * Direct agent lifecycle management
 */
export async function directAgentExample() {
  const agentManager = new AgentManager({
    maxConcurrentAgents: 10,
    autoScaling: true,
  });

  await agentManager.initialize();

  // Create agent pool directly
  const _agentPool = await agentManager.createAgentPool({
    size: 4,
    types: ['coder', 'analyst', 'tester', 'coordinator'],
    capabilities: ['typescript', 'testing', 'documentation'],
  });

  // Assign work directly
  const _assignments = await agentManager.assignWork([
    { type: 'coding', assignee: 'coder', priority: 'high' },
    { type: 'analysis', assignee: 'analyst', priority: 'medium' },
    { type: 'testing', assignee: 'tester', priority: 'low' },
  ]);

  // Monitor performance directly
  const _metrics = await agentManager.getPerformanceMetrics();

  await agentManager.shutdown();
}

/**
 * Example 4: When to Use MCP (Optional Activation)
 * Use MCP only for temporary coordination or external access
 */
export async function mcpActivationExample() {
  // Option 1: Temporary external coordination
  if (process.env.ENABLE_EXTERNAL_COORDINATION === 'true') {
    const { HTTPMCPServer } = await import('../src/interfaces/mcp/http-mcp-server');

    const mcpServer = new HTTPMCPServer({ port: 3000 });
    await mcpServer.start();

    // Auto-shutdown after work complete
    setTimeout(async () => {
      await mcpServer.stop();
    }, 30000); // 30 seconds
  }

  // Option 2: Domain-specific temporary swarm
  if (process.env.ACTIVATE_TEMP_SWARM === 'true') {
    // Direct SwarmCoordinator for temporary work
    const tempSwarm = new SwarmCoordinator({
      topology: 'star',
      maxAgents: 3,
      strategy: 'specialized',
      lifetime: 'temporary', // Auto-cleanup
    });

    await tempSwarm.initializeSwarm({ topology: 'star', agentCount: 3 });

    // Do specific work
    await tempSwarm.orchestrateTask({
      type: 'emergency_fix',
      input: { severity: 'critical', domain: 'payment-processing' },
    });

    // Auto-cleanup
    await tempSwarm.shutdown();
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    await directSwarmExample();

    await directMemoryExample();

    await directAgentExample();

    await mcpActivationExample();
  } catch (error) {
    console.error('❌ Example failed:', error);
    process.exit(1);
  }
}

// Run examples if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
