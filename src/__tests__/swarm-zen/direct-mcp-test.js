#!/usr/bin/env node
/**
 * Direct MCP Tools Test
 * Tests MCP tools by calling them directly
 */

import { exec } from 'node:child_process';
import util from 'node:util';

const execPromise = util.promisify(exec);

// Test each MCP tool
async function testMcpTools() {
  const tests = [
    {
      name: 'features_detect',
      request: {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'features_detect',
          arguments: { category: 'all' },
        },
        id: 1,
      },
    },
    {
      name: 'memory_usage',
      request: {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'memory_usage',
          arguments: { detail: 'summary' },
        },
        id: 2,
      },
    },
    {
      name: 'swarm_init',
      request: {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'swarm_init',
          arguments: { topology: 'mesh', maxAgents: 5, strategy: 'balanced' },
        },
        id: 3,
      },
    },
    {
      name: 'swarm_status',
      request: {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'swarm_status',
          arguments: { verbose: false },
        },
        id: 4,
      },
    },
    {
      name: 'agent_spawn',
      request: {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'agent_spawn',
          arguments: { type: 'researcher', name: 'test-researcher' },
        },
        id: 5,
      },
    },
  ];

  for (const test of tests) {
    try {
      const cmd = `echo '${JSON.stringify(test.request)}' | node bin/ruv-swarm.js mcp start --protocol=stdio 2>/dev/null`;
      const { stdout, stderr } = await execPromise(cmd, {
        cwd: '/workspaces/ruv-FANN/ruv-swarm/npm',
      });

      if (stdout) {
        const lines = stdout.trim().split('\n');
        for (const line of lines) {
          if (line.trim() && line.includes('jsonrpc')) {
            const response = JSON.parse(line);
            if (response.result) {
              if (response.result.content?.[0]) {
              }
            } else if (response.error) {
            }
            break;
          }
        }
      } else {
      }
    } catch (_error) {}
  }
}

// Test parallel agent creation
async function testParallelAgents() {
  const agentTypes = ['researcher', 'coder', 'analyst', 'optimizer', 'coordinator'];
  const promises = [];

  for (let i = 0; i < agentTypes.length; i++) {
    const request = {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'agent_spawn',
        arguments: {
          type: agentTypes[i],
          name: `agent-${i + 1}`,
          capabilities: [`skill-${i + 1}`],
        },
      },
      id: 100 + i,
    };

    const cmd = `echo '${JSON.stringify(request)}' | node bin/ruv-swarm.js mcp start --protocol=stdio 2>/dev/null | grep -E "jsonrpc|result"`;
    promises.push(execPromise(cmd, { cwd: '/workspaces/ruv-FANN/ruv-swarm/npm' }));
  }

  try {
    const results = await Promise.all(promises);

    results.forEach((result, _i) => {
      if (result.stdout?.includes('jsonrpc')) {
      }
    });
  } catch (_error) {}
}

// Run all tests
async function runAllTests() {
  await testMcpTools();
  await testParallelAgents();
}

runAllTests().catch(console.error);
