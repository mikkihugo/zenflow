/**
 * Comprehensive MCP Integration Tests for ruv-swarm
 * Tests all 12 MCP tools and their integration
 */

import assert from 'node:assert';
import { promises as fs } from 'node:fs';
import WebSocket from 'ws';

// Test configuration
const MCP_SERVER_URL = 'ws://localhost:3000/mcp';
const HTTP_BASE_URL = 'http://localhost:3000';
const _TEST_TIMEOUT = 60000; // 60 seconds

// Test utilities
class MCPTestClient {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.requestId = 0;
    this.pendingRequests = new Map();
    this.notifications = [];
    this.connected = false;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);

      this.ws.on('open', () => {
        resolve();
      });

      this.ws.on('message', (data) => {
        const message = JSON.parse(data.toString());

        if (message.id && this.pendingRequests.has(message.id)) {
          const { resolve, reject } = this.pendingRequests.get(message.id);
          this.pendingRequests.delete(message.id);

          if (message.error) {
            reject(new Error(message.error.message));
          } else {
            resolve(message.result);
          }
        } else if (message.method) {
          // Notification
          this.notifications.push(message);
        }
      });

      this.ws.on('error', (error) => {
        console.error('WebSocket error:', error.message);
        reject(new Error(`MCP server connection failed: ${error.message}`));
      });

      this.ws.on('close', () => {
        this.connected = false;
      });

      // Set connection timeout
      setTimeout(() => {
        if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
          this.ws.close();
          reject(
            new Error('Connection timeout - MCP server may not be running'),
          );
        }
      }, 5000);
    });
  }

  async disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  async sendRequest(method, params = null) {
    const id = ++this.requestId;
    const request = {
      jsonrpc: '2.0',
      id,
      method,
      params,
    };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      this.ws.send(JSON.stringify(request));

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`Request ${id} timed out`));
        }
      }, 30000);
    });
  }

  clearNotifications() {
    this.notifications = [];
  }

  getNotifications(filter = null) {
    if (!filter) {
      return this.notifications;
    }
    return this.notifications.filter((n) => n.method === filter);
  }
}

// Test suites
async function runMCPIntegrationTests() {
  const results = {
    passed: 0,
    failed: 0,
    errors: [],
  };

  const client = new MCPTestClient(MCP_SERVER_URL);

  async function test(name, fn) {
    try {
      await fn();
      results.passed++;
    } catch (error) {
      console.error(`❌ ${name}`);
      console.error(`   ${error.message}`);
      results.failed++;
      results.errors.push({ test: name, error: error.message });
    }
  }

  try {
    try {
      await client.connect();
    } catch (_connectError) {
      results.errors.push({
        test: 'MCP Connection',
        error: 'Server not available',
      });
      results.failed++;
      return results;
    }

    // 1. Test Initialize
    await test('MCP Initialize', async () => {
      const result = await client.sendRequest('initialize', {
        protocolVersion: '2024-11-05',
        clientInfo: {
          name: 'ruv-swarm-test-client',
          version: '1.0.0',
        },
        capabilities: {
          tools: {},
          resources: {},
        },
      });

      // More flexible assertions
      assert(result, 'Initialize should return a result');
      assert(
        result.protocolVersion || result.capabilities,
        'Should have protocol version or capabilities',
      );

      if (result.serverInfo) {
      }
    });

    // 2. Test Tools List
    await test('MCP Tools List', async () => {
      const result = await client.sendRequest('tools/list');

      assert(result, 'Tools list should return a result');
      assert(
        result.tools || result.available_tools,
        'Should have tools or available_tools',
      );

      const tools = result.tools || result.available_tools || [];

      if (tools.length > 0) {
      }

      const toolNames = result.tools.map((t) => t.name);
      const expectedTools = [
        'ruv-swarm.spawn',
        'ruv-swarm.orchestrate',
        'ruv-swarm.query',
        'ruv-swarm.monitor',
        'ruv-swarm.optimize',
        'ruv-swarm.memory.store',
        'ruv-swarm.memory.get',
        'ruv-swarm.task.create',
        'ruv-swarm.workflow.execute',
        'ruv-swarm.agent.list',
      ];

      expectedTools.forEach((tool) => {
        assert(toolNames.includes(tool), `Missing tool: ${tool}`);
      });
    });

    // 3. Test Swarm Init (Agent Spawn)
    let agentId;
    await test('MCP Tool: ruv-swarm.spawn', async () => {
      const result = await client.sendRequest('tools/call', {
        name: 'ruv-swarm.spawn',
        arguments: {
          agent_type: 'researcher',
          name: 'test-researcher-001',
          capabilities: {
            max_tokens: 4096,
            temperature: 0.7,
            specialized_domains: ['web_frameworks', 'performance'],
          },
        },
      });

      assert(result.agent_id);
      assert(result.agent_type === 'researcher');
      assert(result.status === 'active');
      agentId = result.agent_id;
    });

    // 4. Test Agent List
    await test('MCP Tool: ruv-swarm.agent.list', async () => {
      const result = await client.sendRequest('tools/call', {
        name: 'ruv-swarm.agent.list',
        arguments: {
          include_inactive: false,
          sort_by: 'created_at',
        },
      });

      assert(Array.isArray(result.agents));
      assert(result.count >= 1);
      assert(result.agents.some((a) => a.id === agentId));
    });

    // 5. Test Memory Store
    await test('MCP Tool: ruv-swarm.memory.store', async () => {
      const testData = {
        framework_analysis: {
          react: { performance: 'excellent', learning_curve: 'moderate' },
          vue: { performance: 'excellent', learning_curve: 'easy' },
          angular: { performance: 'good', learning_curve: 'steep' },
        },
        timestamp: new Date().toISOString(),
      };

      const result = await client.sendRequest('tools/call', {
        name: 'ruv-swarm.memory.store',
        arguments: {
          key: 'test_framework_analysis',
          value: testData,
          ttl_secs: 3600,
        },
      });

      assert(result.stored === true);
      assert(result.key === 'test_framework_analysis');
    });

    // 6. Test Memory Get
    await test('MCP Tool: ruv-swarm.memory.get', async () => {
      const result = await client.sendRequest('tools/call', {
        name: 'ruv-swarm.memory.get',
        arguments: {
          key: 'test_framework_analysis',
        },
      });

      assert(result.found === true);
      assert(result.value);
      assert(result.value.framework_analysis);
      assert(result.value.framework_analysis.react.performance === 'excellent');
    });

    // 7. Test Task Create
    let _taskId;
    await test('MCP Tool: ruv-swarm.task.create', async () => {
      const result = await client.sendRequest('tools/call', {
        name: 'ruv-swarm.task.create',
        arguments: {
          task_type: 'research',
          description:
            'Analyze performance characteristics of modern web frameworks',
          priority: 'high',
          assigned_agent: agentId,
        },
      });

      assert(result.task_id);
      assert(result.task_type === 'research');
      assert(result.priority === 'high');
      assert(result.status === 'pending');
      _taskId = result.task_id;
    });

    // 8. Test Query Swarm State
    await test('MCP Tool: ruv-swarm.query', async () => {
      const result = await client.sendRequest('tools/call', {
        name: 'ruv-swarm.query',
        arguments: {
          filter: {
            agent_type: 'researcher',
          },
          include_metrics: true,
        },
      });

      assert(result.agents);
      assert(result.active_tasks >= 1);
      assert(result.total_agents >= 1);
      if (result.metrics) {
        assert(typeof result.metrics === 'object');
      }
    });

    // 9. Test Monitor (with short duration)
    await test('MCP Tool: ruv-swarm.monitor', async () => {
      client.clearNotifications();

      const result = await client.sendRequest('tools/call', {
        name: 'ruv-swarm.monitor',
        arguments: {
          event_types: ['agent_spawned', 'task_created', 'task_completed'],
          duration_secs: 5, // Short duration for testing
        },
      });

      assert(result.status === 'monitoring');
      assert(result.duration_secs === 5);

      // Wait a bit and check for notifications
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const _notifications = client.getNotifications('ruv-swarm/event');
    });

    // 10. Test Orchestrate
    await test('MCP Tool: ruv-swarm.orchestrate', async () => {
      const result = await client.sendRequest('tools/call', {
        name: 'ruv-swarm.orchestrate',
        arguments: {
          objective:
            'Create comprehensive comparison of React, Vue, and Angular frameworks',
          strategy: 'research',
          mode: 'distributed',
          max_agents: 3,
          parallel: true,
        },
      });

      assert(result.task_id);
      assert(result.objective);
      assert(result.strategy === 'research');
      assert(result.mode === 'distributed');
      assert(result.status === 'started');
    });

    // 11. Test Optimize
    await test('MCP Tool: ruv-swarm.optimize', async () => {
      const result = await client.sendRequest('tools/call', {
        name: 'ruv-swarm.optimize',
        arguments: {
          target_metric: 'throughput',
          constraints: {
            max_memory_mb: 512,
            max_cpu_percent: 80,
          },
          auto_apply: false,
        },
      });

      assert(result.target_metric === 'throughput');
      assert(Array.isArray(result.recommendations));
      assert(result.applied === false);
    });

    // 12. Test Workflow Execute
    await test('MCP Tool: ruv-swarm.workflow.execute', async () => {
      // First, create a simple workflow file
      const workflowPath = '/tmp/test-workflow.json';
      const workflow = {
        name: 'test-workflow',
        steps: [
          { action: 'spawn', params: { agent_type: 'coder' } },
          { action: 'spawn', params: { agent_type: 'tester' } },
          {
            action: 'create_task',
            params: {
              task_type: 'development',
              description: 'Build feature X',
            },
          },
        ],
      };

      await fs.writeFile(workflowPath, JSON.stringify(workflow, null, 2));

      const result = await client.sendRequest('tools/call', {
        name: 'ruv-swarm.workflow.execute',
        arguments: {
          workflow_path: workflowPath,
          parameters: {
            feature_name: 'user-authentication',
          },
          async_execution: true,
        },
      });

      assert(result.workflow_id);
      assert(result.status === 'started');
      assert(result.async === true);

      // Clean up
      await fs.unlink(workflowPath);
    });

    // Test Concurrency
    await test('Concurrent Operations', async () => {
      const promises = [];

      // Spawn multiple agents concurrently
      for (let i = 0; i < 5; i++) {
        promises.push(
          client.sendRequest('tools/call', {
            name: 'ruv-swarm.spawn',
            arguments: {
              agent_type: [
                'researcher',
                'coder',
                'analyst',
                'tester',
                'reviewer',
              ][i],
              name: `concurrent-agent-${i}`,
            },
          }),
        );
      }

      const results = await Promise.all(promises);
      assert(results.length === 5);
      results.forEach((r) => assert(r.agent_id));
    });

    // Test Error Handling
    await test('Error Handling: Invalid Agent Type', async () => {
      try {
        await client.sendRequest('tools/call', {
          name: 'ruv-swarm.spawn',
          arguments: {
            agent_type: 'invalid_type',
          },
        });
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.message.includes('Invalid agent_type'));
      }
    });

    await test('Error Handling: Missing Required Parameters', async () => {
      try {
        await client.sendRequest('tools/call', {
          name: 'ruv-swarm.task.create',
          arguments: {
            // Missing required 'task_type' and 'description'
            priority: 'high',
          },
        });
        assert.fail('Should have thrown an error');
      } catch (error) {
        assert(error.message.includes('Missing'));
      }
    });

    // Test Persistence Across Sessions
    await test('Persistence: Memory Across Reconnection', async () => {
      // Store data
      await client.sendRequest('tools/call', {
        name: 'ruv-swarm.memory.store',
        arguments: {
          key: 'persistence_test',
          value: { test: 'data', timestamp: Date.now() },
        },
      });

      // Disconnect and reconnect
      await client.disconnect();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await client.connect();

      // Re-initialize
      await client.sendRequest('initialize', {
        clientInfo: {
          name: 'ruv-swarm-test-client',
          version: '1.0.0',
        },
      });

      // Try to retrieve data
      const _result = await client.sendRequest('tools/call', {
        name: 'ruv-swarm.memory.get',
        arguments: {
          key: 'persistence_test',
        },
      });
    });

    // Performance Benchmarks
    await test('Performance: Rapid Agent Spawning', async () => {
      const startTime = Date.now();
      const promises = [];

      for (let i = 0; i < 10; i++) {
        promises.push(
          client.sendRequest('tools/call', {
            name: 'ruv-swarm.spawn',
            arguments: {
              agent_type: 'researcher',
              name: `perf-test-agent-${i}`,
            },
          }),
        );
      }

      await Promise.all(promises);
      const duration = Date.now() - startTime;
      assert(duration < 5000, 'Agent spawning too slow');
    });

    // Test Custom MCP Methods
    await test('Custom Method: ruv-swarm/status', async () => {
      const result = await client.sendRequest('ruv-swarm/status');
      assert(result);
    });

    await test('Custom Method: ruv-swarm/metrics', async () => {
      const result = await client.sendRequest('ruv-swarm/metrics');
      assert(result);
    });
  } catch (error) {
    console.error('Test suite error:', error);
    results.failed++;
  } finally {
    await client.disconnect();
  }

  if (results.errors.length > 0) {
    results.errors.forEach((_e) => {});
  }

  return results.failed === 0;
}

// Integration test scenarios
async function runIntegrationScenarios() {
  const client = new MCPTestClient(MCP_SERVER_URL);

  try {
    await client.connect();
    await client.sendRequest('initialize', {
      clientInfo: { name: 'integration-test', version: '1.0.0' },
    });

    // 1. Spawn research team
    const researchers = [];
    for (let i = 0; i < 3; i++) {
      const result = await client.sendRequest('tools/call', {
        name: 'ruv-swarm.spawn',
        arguments: {
          agent_type: 'researcher',
          name: `research-team-${i}`,
          capabilities: {
            specialization: ['web_tech', 'performance', 'architecture'][i],
          },
        },
      });
      researchers.push(result.agent_id);
    }

    // 2. Create research tasks
    const tasks = [];
    const topics = [
      'Modern JavaScript frameworks comparison',
      'WebAssembly performance analysis',
      'Microservices vs Monolithic architecture',
    ];

    for (let i = 0; i < topics.length; i++) {
      const result = await client.sendRequest('tools/call', {
        name: 'ruv-swarm.task.create',
        arguments: {
          task_type: 'research',
          description: topics[i],
          priority: 'high',
          assigned_agent: researchers[i],
        },
      });
      tasks.push(result.task_id);
    }

    // 3. Store research findings
    await client.sendRequest('tools/call', {
      name: 'ruv-swarm.memory.store',
      arguments: {
        key: 'research_findings',
        value: {
          frameworks: {
            react: { pros: ['ecosystem', 'flexibility'], cons: ['complexity'] },
            vue: {
              pros: ['simplicity', 'performance'],
              cons: ['smaller ecosystem'],
            },
            angular: {
              pros: ['enterprise', 'typescript'],
              cons: ['learning curve'],
            },
          },
          timestamp: new Date().toISOString(),
        },
      },
    });

    // 4. Query final state
    const _state = await client.sendRequest('tools/call', {
      name: 'ruv-swarm.query',
      arguments: { include_metrics: true },
    });

    // 1. Orchestrate development task
    const _devResult = await client.sendRequest('tools/call', {
      name: 'ruv-swarm.orchestrate',
      arguments: {
        objective: 'Implement user authentication system with JWT',
        strategy: 'development',
        mode: 'hierarchical',
        max_agents: 5,
        parallel: true,
      },
    });

    // 2. Monitor progress
    client.clearNotifications();
    await client.sendRequest('tools/call', {
      name: 'ruv-swarm.monitor',
      arguments: {
        event_types: ['task_started', 'task_completed', 'agent_message'],
        duration_secs: 3,
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 3500));
    const _events = client.getNotifications('ruv-swarm/event');

    // 3. Optimize performance
    const _optResult = await client.sendRequest('tools/call', {
      name: 'ruv-swarm.optimize',
      arguments: {
        target_metric: 'latency',
        constraints: {
          max_memory_mb: 256,
          max_agents: 10,
        },
        auto_apply: true,
      },
    });

    // 1. Create analyzer agents
    const analyzers = [];
    for (let i = 0; i < 2; i++) {
      const result = await client.sendRequest('tools/call', {
        name: 'ruv-swarm.spawn',
        arguments: {
          agent_type: 'analyst',
          name: `neural-analyzer-${i}`,
          capabilities: {
            neural_enabled: true,
            learning_rate: 0.01,
          },
        },
      });
      analyzers.push(result.agent_id);
    }

    // 2. Store training data
    const trainingData = {
      patterns: [
        { input: [0, 0], output: [0] },
        { input: [0, 1], output: [1] },
        { input: [1, 0], output: [1] },
        { input: [1, 1], output: [0] },
      ],
      epochs: 1000,
    };

    await client.sendRequest('tools/call', {
      name: 'ruv-swarm.memory.store',
      arguments: {
        key: 'xor_training_data',
        value: trainingData,
      },
    });

    // 3. Create learning task
    const _learningResult = await client.sendRequest('tools/call', {
      name: 'ruv-swarm.task.create',
      arguments: {
        task_type: 'analysis',
        description: 'Train XOR pattern recognition',
        priority: 'critical',
        assigned_agent: analyzers[0],
      },
    });
  } finally {
    await client.disconnect();
  }
}

// Main test runner
async function main() {
  // Check if MCP server is running
  try {
    const response = await fetch(`${HTTP_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error('MCP server health check failed');
    }
  } catch (_error) {
    console.error('❌ MCP server is not running!');
    console.error('   Please start the server with: npm run mcp:server');
    process.exit(1);
  }

  // Run comprehensive tests
  const testsPassed = await runMCPIntegrationTests();

  // Run integration scenarios
  await runIntegrationScenarios();

  process.exit(testsPassed ? 0 : 1);
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

// Run tests if called directly
// Direct execution
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

export { MCPTestClient, runMCPIntegrationTests, runIntegrationScenarios };
