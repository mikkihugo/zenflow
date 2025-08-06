/**
 * @file Swarm CLI Command - Direct MCP Integration
 *
 * Simple, direct swarm commands using meow CLI parsing and MCP tool calls.
 * Replaces the complex terminal interface system with straightforward command execution.
 */

import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import meow from 'meow';
import { createLogger } from '../../../core/logger';

const logger = createLogger({ prefix: 'SwarmCommand' });

export interface SwarmOptions {
  agents?: number;
  topology?: 'mesh' | 'hierarchical' | 'ring' | 'star' | 'auto';
  verbose?: boolean;
  timeout?: number;
  format?: 'json' | 'table' | 'compact';
}

export const swarmCLI = meow(
  `
🐝 CLAUDE-ZEN SWARM COORDINATION SYSTEM
High-Performance Multi-Agent Orchestration

Usage
  $ claude-zen swarm <command> [options]

Commands
  init                     Initialize new swarm coordination
  status                   Show swarm system status
  list                     List active swarms and agents
  monitor                  Real-time swarm monitoring
  create <name>            Create new swarm with name
  stop <swarm-id>          Stop specific swarm
  spawn <type>             Spawn new agent of specified type

Options
  --agents, -a             Number of agents to spawn [default: 4]
  --topology, -t           Swarm topology (mesh|hierarchical|ring|star|auto) [default: auto]
  --verbose, -v            Verbose output with detailed information
  --timeout                Operation timeout in milliseconds [default: 10000]
  --format, -f             Output format (json|table|compact) [default: table]

Examples
  $ claude-zen swarm status
  $ claude-zen swarm init --agents 8 --topology mesh
  $ claude-zen swarm create "Document Processing" --agents 6
  $ claude-zen swarm spawn researcher --verbose
  $ claude-zen swarm monitor --format json
`,
  {
    importMeta: import.meta,
    flags: {
      agents: {
        type: 'number',
        shortFlag: 'a',
        default: 4,
      },
      topology: {
        type: 'string',
        shortFlag: 't',
        default: 'auto',
      },
      verbose: {
        type: 'boolean',
        shortFlag: 'v',
        default: false,
      },
      timeout: {
        type: 'number',
        default: 10000,
      },
      format: {
        type: 'string',
        shortFlag: 'f',
        default: 'table',
      },
    },
  }
);

/**
 * Call MCP tool via stdio protocol
 *
 * @param toolName
 * @param params
 */
async function callMcpTool(
  toolName: string,
  params: any = {}
): Promise<{ success: boolean; data?: any; error?: string }> {
  return new Promise((resolve) => {
    const mcpProcess = spawn('npx', ['tsx', 'src/coordination/swarm/mcp/mcp-server.ts'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd(),
    });

    let stdout = '';
    let stderr = '';
    let isResolved = false;

    // Prepare MCP request
    const request = {
      jsonrpc: '2.0',
      id: randomUUID(),
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: params,
      },
    };

    // Set up timeout
    const timeout = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        mcpProcess.kill();
        resolve({ success: false, error: 'MCP call timeout' });
      }
    }, 8000);

    mcpProcess.stdout?.on('data', (data) => {
      stdout += data.toString();
      // Look for JSON response
      const lines = stdout.split('\n');
      for (const line of lines) {
        if (line.trim() && line.includes('"jsonrpc"')) {
          try {
            const response = JSON.parse(line.trim());
            if (response.id === request.id && !isResolved) {
              isResolved = true;
              clearTimeout(timeout);
              mcpProcess.kill();

              if (response.error) {
                resolve({ success: false, error: response.error.message });
              } else {
                resolve({ success: true, data: response.result });
              }
              return;
            }
          } catch (_e) {
            // Ignore parsing errors, continue looking
          }
        }
      }
    });

    mcpProcess.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    mcpProcess.on('close', (code) => {
      if (!isResolved) {
        isResolved = true;
        clearTimeout(timeout);
        if (code !== 0) {
          resolve({ success: false, error: `MCP process exited with code ${code}: ${stderr}` });
        } else {
          resolve({ success: false, error: 'No response from MCP server' });
        }
      }
    });

    mcpProcess.on('error', (error) => {
      if (!isResolved) {
        isResolved = true;
        clearTimeout(timeout);
        resolve({ success: false, error: `Failed to start MCP process: ${error.message}` });
      }
    });

    // Send the request
    try {
      mcpProcess.stdin?.write(`${JSON.stringify(request)}\n`);
      mcpProcess.stdin?.end();
    } catch (error) {
      if (!isResolved) {
        isResolved = true;
        clearTimeout(timeout);
        resolve({ success: false, error: `Failed to send MCP request: ${error.message}` });
      }
    }
  });
}

/**
 * Format output based on user preference
 *
 * @param data
 * @param format
 */
function _formatOutput(data: any, format: string): string {
  switch (format) {
    case 'json':
      return JSON.stringify(data, null, 2);
    case 'compact':
      return JSON.stringify(data);
    default:
      if (typeof data === 'object' && data !== null) {
        return Object.entries(data)
          .map(
            ([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`
          )
          .join('\n');
      }
      return String(data);
  }
}

/**
 * Execute swarm command
 */
export async function executeSwarmCommand(): Promise<void> {
  const startTime = performance.now();
  const { input, flags } = swarmCLI;
  const command = input[0];
  const options: SwarmOptions = flags;

  if (!command) {
    swarmCLI.showHelp();
    return;
  }

  try {
    logger.info(`Executing swarm command: ${command}`, { options });

    let result: any;

    switch (command) {
      case 'status':
        result = await callMcpTool('swarm_status', {});
        break;

      case 'init':
        result = await callMcpTool('swarm_init', {
          topology: options.topology || 'auto',
          maxAgents: options.agents || 4,
        });
        break;

      case 'list':
        result = await callMcpTool('agent_list', {});
        break;

      case 'monitor':
        result = await callMcpTool('swarm_monitor', {});
        break;

      case 'create': {
        const swarmName = input[1] || 'New Swarm';
        result = await callMcpTool('swarm_init', {
          name: swarmName,
          topology: options.topology || 'auto',
          maxAgents: options.agents || 4,
        });
        break;
      }

      case 'spawn': {
        const agentType = input[1] || 'general';
        result = await callMcpTool('agent_spawn', {
          type: agentType,
          name: `${agentType}-${Date.now()}`,
        });
        break;
      }

      default:
        console.error(`❌ Unknown swarm command: ${command}`);
        process.exit(1);
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    if (result.success) {
      if (result.data) {
      }

      if (options.verbose) {
      }
    } else {
      console.error(`❌ Swarm ${command} failed: ${result.error}`);

      if (options.verbose && result.error) {
        console.error('');
        console.error('Debug information:');
        console.error(`Command: ${command}`);
        console.error(`Options: ${JSON.stringify(options, null, 2)}`);
        console.error(`Duration: ${duration.toFixed(2)}ms`);
      }

      process.exit(1);
    }
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;

    logger.error('Swarm command execution failed:', error);
    console.error(`❌ Swarm ${command} failed: ${error.message}`);

    if (options.verbose) {
      console.error('');
      console.error('Debug information:');
      console.error(`Duration: ${duration.toFixed(2)}ms`);
      console.error(`Stack trace: ${error.stack}`);
    }

    process.exit(1);
  }
}

/**
 * Get MCP tool name for a command
 *
 * @param command
 */
function _getMcpToolName(command: string): string {
  const toolMap: Record<string, string> = {
    status: 'swarm_status',
    init: 'swarm_init',
    list: 'agent_list',
    monitor: 'swarm_monitor',
    create: 'swarm_init',
    spawn: 'agent_spawn',
  };
  return toolMap[command] || 'unknown';
}

// Export CLI for direct usage
export default swarmCLI;
