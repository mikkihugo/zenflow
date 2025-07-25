/**
 * MCP Client Example
 * Demonstrates how to connect to and use MCP tools
 */

import { ClaudeFlowMCPServer } from '../src/mcp/mcp-server.js';

class MCPClientExample {
  constructor() {
    this.mcpServer = null;
    this.examples = new Map();
    this.setupExamples();
  }

  setupExamples() {
    // Basic swarm examples
    this.examples.set('swarm-init', this.swarmInitExample.bind(this));
    this.examples.set('agent-spawn', this.agentSpawnExample.bind(this));
    this.examples.set('task-orchestrate', this.taskOrchestrateExample.bind(this));
    this.examples.set('swarm-status', this.swarmStatusExample.bind(this));
    
    // Memory examples
    this.examples.set('memory-operations', this.memoryOperationsExample.bind(this));
    this.examples.set('memory-search', this.memorySearchExample.bind(this));
    
    // Analysis examples
    this.examples.set('performance-analysis', this.performanceAnalysisExample.bind(this));
    this.examples.set('system-diagnostics', this.systemDiagnosticsExample.bind(this));
    
    // Workflow examples
    this.examples.set('complete-workflow', this.completeWorkflowExample.bind(this));
  }

  async initialize() {
    console.log('🚀 Initializing MCP Client Example');
    
    this.mcpServer = new ClaudeFlowMCPServer({
      version: '2.0.0-alpha.70',
      capabilities: {
        tools: { listChanged: true },
        resources: { subscribe: true, listChanged: true }
      }
    });

    await this.mcpServer.initialize();
    console.log('✅ MCP Server initialized');
    return this;
  }

  // Helper method to call MCP tools
  async callTool(toolName, params = {}) {
    try {
      console.log(`🔧 Calling tool: ${toolName}`, params);
      const result = await this.mcpServer.executeToolCall({
        name: toolName,
        arguments: params
      });
      console.log(`✅ Tool result:`, result);
      return result;
    } catch (error) {
      console.error(`❌ Tool error:`, error);
      throw error;
    }
  }

  // Swarm initialization example
  async swarmInitExample() {
    console.log('\n🐝 === Swarm Initialization Example ===');
    
    const result = await this.callTool('swarm_init', {
      topology: 'hierarchical',
      maxAgents: 8,
      strategy: 'adaptive'
    });

    return result;
  }

  // Agent spawning example
  async agentSpawnExample() {
    console.log('\n🤖 === Agent Spawning Example ===');
    
    // Spawn coordinator agent
    await this.callTool('agent_spawn', {
      type: 'coordinator',
      name: 'TaskMaster',
      capabilities: ['orchestration', 'monitoring', 'resource-management']
    });

    // Spawn coder agent  
    await this.callTool('agent_spawn', {
      type: 'coder',
      name: 'CodeGen-Alpha',
      capabilities: ['javascript', 'rust', 'testing', 'documentation']
    });

    // Spawn analyst agent
    await this.callTool('agent_spawn', {
      type: 'analyst', 
      name: 'SystemAnalyzer',
      capabilities: ['performance-analysis', 'security-audit', 'optimization']
    });

    console.log('✅ All agents spawned successfully');
  }

  // Task orchestration example
  async taskOrchestrateExample() {
    console.log('\n📋 === Task Orchestration Example ===');

    const result = await this.callTool('task_orchestrate', {
      task: 'Analyze repository structure and optimize performance bottlenecks',
      strategy: 'parallel',
      priority: 'high'
    });

    return result;
  }

  // Swarm status monitoring example
  async swarmStatusExample() {
    console.log('\n📊 === Swarm Status Example ===');

    // Basic status
    const basicStatus = await this.callTool('swarm_status', {
      detailed: false
    });

    console.log('Basic Status:', basicStatus);

    // Detailed status
    const detailedStatus = await this.callTool('swarm_status', {
      detailed: true
    });

    console.log('Detailed Status:', detailedStatus);

    // Agent metrics
    const agentMetrics = await this.callTool('agent_metrics', {
      agentId: 'coder-alpha'
    });

    console.log('Agent Metrics:', agentMetrics);
  }

  // Memory operations example
  async memoryOperationsExample() {
    console.log('\n💾 === Memory Operations Example ===');

    // Store project context
    await this.callTool('memory_usage', {
      action: 'store',
      key: 'project-context',
      value: JSON.stringify({
        repository: 'claude-code-zen',
        branch: 'main',
        objectives: ['performance-optimization', 'documentation'],
        constraints: ['minimal-changes', 'preserve-api']
      }),
      namespace: 'project'
    });

    // Store task data
    await this.callTool('memory_usage', {
      action: 'store',
      key: 'current-task',
      value: JSON.stringify({
        id: 'task-001',
        type: 'optimization',
        target: 'database-queries',
        status: 'in-progress'
      }),
      namespace: 'tasks'
    });

    // Retrieve data
    const context = await this.callTool('memory_usage', {
      action: 'retrieve',
      key: 'project-context',
      namespace: 'project'
    });

    console.log('Retrieved context:', context);

    // List all memories
    const memories = await this.callTool('memory_usage', {
      action: 'list',
      namespace: 'project'
    });

    console.log('All project memories:', memories);
  }

  // Memory search example
  async memorySearchExample() {
    console.log('\n🔍 === Memory Search Example ===');

    // Search for optimization-related memories
    const optimizationResults = await this.callTool('memory_search', {
      pattern: 'optimization',
      limit: 5,
      namespace: 'project'
    });

    console.log('Optimization memories:', optimizationResults);

    // Search for task-related memories
    const taskResults = await this.callTool('memory_search', {
      pattern: 'task*',
      limit: 10,
      namespace: 'tasks'
    });

    console.log('Task memories:', taskResults);

    // Memory analytics
    const analytics = await this.callTool('memory_analytics', {
      timeframe: '24h'
    });

    console.log('Memory analytics:', analytics);
  }

  // Performance analysis example
  async performanceAnalysisExample() {
    console.log('\n📈 === Performance Analysis Example ===');

    // Generate performance report
    const performanceReport = await this.callTool('performance_report', {
      format: 'detailed',
      timeframe: '24h'
    });

    console.log('Performance Report:', performanceReport);

    // Analyze bottlenecks
    const bottleneckAnalysis = await this.callTool('bottleneck_analyze', {
      component: 'database',
      metrics: ['response-time', 'throughput', 'error-rate']
    });

    console.log('Bottleneck Analysis:', bottleneckAnalysis);
  }

  // System diagnostics example  
  async systemDiagnosticsExample() {
    console.log('\n🔧 === System Diagnostics Example ===');

    // Health check
    const healthCheck = await this.callTool('health_check', {
      components: ['database', 'memory', 'network', 'agents']
    });

    console.log('Health Check:', healthCheck);

    // Security scan
    const securityScan = await this.callTool('security_scan', {
      scope: 'full',
      includeRecommendations: true
    });

    console.log('Security Scan:', securityScan);

    // Feature detection
    const features = await this.callTool('features_detect', {
      component: 'system'
    });

    console.log('Feature Detection:', features);
  }

  // Complete workflow example
  async completeWorkflowExample() {
    console.log('\n🔄 === Complete Workflow Example ===');

    try {
      // 1. Initialize swarm
      console.log('Step 1: Initialize swarm');
      await this.swarmInitExample();

      // 2. Spawn agents
      console.log('Step 2: Spawn specialized agents');
      await this.agentSpawnExample();

      // 3. Set up memory context
      console.log('Step 3: Set up memory context');
      await this.memoryOperationsExample();

      // 4. Orchestrate main task
      console.log('Step 4: Orchestrate main task');
      await this.taskOrchestrateExample();

      // 5. Monitor progress
      console.log('Step 5: Monitor swarm status');
      await this.swarmStatusExample();

      // 6. Analyze performance
      console.log('Step 6: Analyze performance');
      await this.performanceAnalysisExample();

      // 7. Run diagnostics
      console.log('Step 7: Run diagnostics');
      await this.systemDiagnosticsExample();

      console.log('\n✅ Complete workflow example finished successfully');

    } catch (error) {
      console.error('❌ Workflow error:', error);
      throw error;
    }
  }

  // Run specific example
  async runExample(exampleName) {
    if (!this.examples.has(exampleName)) {
      throw new Error(`Example "${exampleName}" not found`);
    }

    console.log(`\n🎯 Running example: ${exampleName}`);
    return await this.examples.get(exampleName)();
  }

  // List available examples
  listExamples() {
    console.log('\n📋 Available MCP Examples:');
    Array.from(this.examples.keys()).forEach((name, index) => {
      console.log(`  ${index + 1}. ${name}`);
    });
  }

  // Run all examples
  async runAllExamples() {
    console.log('\n🎯 Running all MCP examples...');
    
    for (const [name, example] of this.examples) {
      try {
        console.log(`\n--- Running ${name} ---`);
        await example();
      } catch (error) {
        console.error(`❌ Example ${name} failed:`, error);
      }
    }

    console.log('\n✅ All examples completed');
  }
}

// CLI runner
async function main() {
  const exampleName = process.argv[2];
  
  const client = new MCPClientExample();
  await client.initialize();

  if (!exampleName) {
    client.listExamples();
    console.log('\nUsage: node mcp-client-example.js [example-name|all]');
    return;
  }

  if (exampleName === 'all') {
    await client.runAllExamples();
  } else {
    await client.runExample(exampleName);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { MCPClientExample };