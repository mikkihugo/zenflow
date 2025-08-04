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

import { SwarmCoordinator } from '../src/coordination/swarm/core/swarm-coordinator';
import { AgentManager } from '../src/coordination/agents/agent-manager';
import { MemoryCoordinator } from '../src/memory/core/memory-coordinator';

/**
 * Example 1: Permanent Project Swarm
 * Lives with the project, direct imports for coordination
 */
export async function permanentProjectSwarmExample() {
  console.log('🏠 Permanent Project Swarm Example');
  
  // Permanent swarm lives with the project
  const projectSwarm = new SwarmCoordinator({
    topology: 'hierarchical',
    maxAgents: 8,
    strategy: 'specialized',
    persistent: true, // Lives with project
    workspaceId: 'my-project-2024'
  });

  // Initialize permanent project swarm
  await projectSwarm.initializeSwarm({
    topology: 'hierarchical',
    agentCount: 6
  });

  // Spawn permanent project agents (persist across sessions)
  const agents = await Promise.all([
    projectSwarm.spawnAgent({ type: 'architect', name: 'System Architect', persistent: true }),
    projectSwarm.spawnAgent({ type: 'coder', name: 'Lead Developer', persistent: true }),
    projectSwarm.spawnAgent({ type: 'analyst', name: 'Business Analyst', persistent: true }),
    projectSwarm.spawnAgent({ type: 'tester', name: 'QA Engineer', persistent: true }),
    projectSwarm.spawnAgent({ type: 'coordinator', name: 'Project Manager', persistent: true })
  ]);

  console.log(`✅ Spawned ${agents.length} agents directly`);

  // Orchestrate tasks directly
  const result = await swarm.orchestrateTask({
    type: 'code_generation',
    input: {
      requirements: 'Create a REST API with authentication',
      framework: 'express',
      database: 'postgresql'
    },
    strategy: 'parallel',
    agents: ['coder', 'analyst']
  });

  console.log('✅ Task orchestrated directly:', result.success);

  // Get real-time status
  const status = await swarm.getStatus();
  console.log('📊 Swarm Status:', {
    agents: status.agents,
    tasks: status.activeTasks,
    performance: status.metrics.throughput
  });

  await swarm.shutdown();
  console.log('🛑 Swarm shutdown complete');
}

/**
 * Example 2: Memory Coordination
 * Direct memory management without external processes
 */
export async function directMemoryExample() {
  console.log('🧠 Direct Memory Coordination Example');

  const memory = new MemoryCoordinator({
    backend: 'sqlite',
    persistentSessions: true
  });

  await memory.initialize();

  // Store coordination data directly
  await memory.store('swarm/session-1/context', {
    agents: ['coder', 'analyst'],
    progress: 'implementing-auth',
    decisions: ['use-jwt-tokens', 'postgres-sessions']
  });

  // Retrieve data directly
  const context = await memory.retrieve('swarm/session-1/context');
  console.log('✅ Retrieved context:', context);

  // Cross-session memory (survives restarts)
  await memory.persistSession('session-1', {
    startTime: Date.now(),
    swarmTopology: 'mesh',
    completedTasks: 3
  });

  await memory.shutdown();
  console.log('🛑 Memory coordinator shutdown');
}

/**
 * Example 3: Agent Management
 * Direct agent lifecycle management
 */
export async function directAgentExample() {
  console.log('🤖 Direct Agent Management Example');

  const agentManager = new AgentManager({
    maxConcurrentAgents: 10,
    autoScaling: true
  });

  await agentManager.initialize();

  // Create agent pool directly
  const agentPool = await agentManager.createAgentPool({
    size: 4,
    types: ['coder', 'analyst', 'tester', 'coordinator'],
    capabilities: ['typescript', 'testing', 'documentation']
  });

  console.log(`✅ Created agent pool with ${agentPool.length} agents`);

  // Assign work directly
  const assignments = await agentManager.assignWork([
    { type: 'coding', assignee: 'coder', priority: 'high' },
    { type: 'analysis', assignee: 'analyst', priority: 'medium' },
    { type: 'testing', assignee: 'tester', priority: 'low' }
  ]);

  console.log('✅ Work assigned:', assignments.length, 'tasks');

  // Monitor performance directly
  const metrics = await agentManager.getPerformanceMetrics();
  console.log('📈 Performance Metrics:', {
    throughput: metrics.tasksPerMinute,
    errorRate: metrics.errorRate,
    efficiency: metrics.utilizationRate
  });

  await agentManager.shutdown();
  console.log('🛑 Agent manager shutdown');
}

/**
 * Example 4: When to Use MCP (Optional Activation)
 * Use MCP only for temporary coordination or external access
 */
export async function mcpActivationExample() {
  console.log('🔌 MCP Activation Example (Optional)');

  // Option 1: Temporary external coordination
  if (process.env.ENABLE_EXTERNAL_COORDINATION === 'true') {
    const { HTTPMCPServer } = await import('../src/interfaces/mcp/http-mcp-server');
    
    const mcpServer = new HTTPMCPServer({ port: 3000 });
    await mcpServer.start();
    
    console.log('✅ MCP server activated for external coordination');
    console.log('   - Available at http://localhost:3000');
    console.log('   - Use for Claude Desktop integration');
    console.log('   - Will shutdown when external coordination ends');
    
    // Auto-shutdown after work complete
    setTimeout(async () => {
      await mcpServer.stop();
      console.log('🛑 MCP server deactivated (temporary work complete)');
    }, 30000); // 30 seconds
  }

  // Option 2: Domain-specific temporary swarm
  if (process.env.ACTIVATE_TEMP_SWARM === 'true') {
    console.log('🐝 Activating temporary swarm for specific domain...');
    
    // Direct SwarmCoordinator for temporary work
    const tempSwarm = new SwarmCoordinator({
      topology: 'star',
      maxAgents: 3,
      strategy: 'specialized',
      lifetime: 'temporary' // Auto-cleanup
    });

    await tempSwarm.initializeSwarm({ topology: 'star', agentCount: 3 });
    
    // Do specific work
    await tempSwarm.orchestrateTask({
      type: 'emergency_fix',
      input: { severity: 'critical', domain: 'payment-processing' }
    });

    // Auto-cleanup
    await tempSwarm.shutdown();
    console.log('✅ Temporary swarm completed and cleaned up');
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🎯 Claude-Zen Direct Usage Examples');
  console.log('=====================================');
  
  try {
    await directSwarmExample();
    console.log();
    
    await directMemoryExample();
    console.log();
    
    await directAgentExample();
    console.log();
    
    await mcpActivationExample();
    console.log();
    
    console.log('🎉 All examples completed successfully!');
    console.log();
    console.log('Key Takeaways:');
    console.log('• Direct imports are faster and simpler');
    console.log('• No external processes to manage');
    console.log('• MCP available when needed for external coordination');
    console.log('• Each domain can spin up its own coordinators');
    console.log('• Clean shutdown and resource management');
    
  } catch (error) {
    console.error('❌ Example failed:', error);
    process.exit(1);
  }
}

// Run examples if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}