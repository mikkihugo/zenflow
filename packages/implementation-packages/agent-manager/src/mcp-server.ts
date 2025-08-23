#!/usr/bin/env node
/**
 * @fileoverview AgentManager stdio MCP Server
 *
 * Provides an MCP (Model Context Protocol) server interface for ephemeral swarm orchestration.
 * This allows Claude Code to interact with AgentManager through standard MCP protocols.
 *
 * @example
 * ```bash
 * # Start the MCP server
 * agent-manager mcp start
 *
 * # Or run directly
 * node dist/mcp-server.js
 * ```
 *
 * @example MCP Integration
 * ```bash
 * # Add to Claude Code
 * claude mcp add agent-manager npx @claude-zen/agent-manager mcp start
 * ```
 */

import { getLogger } from '@claude-zen/foundation';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from '@modelcontextprotocol/sdk/types.js';

import { AgentManager } from './agent-manager';
import type { CognitiveArchetype, SwarmTopology } from './types';

const logger = getLogger('agent-manager-mcp');

// Global AgentManager instance
let globalManager: AgentManager|null = null;

async function getManager(): Promise<AgentManager> {
  if (!globalManager) {
    globalManager = new AgentManager();
    await globalManager.initialize();
  }
  return globalManager;
}

/**
 * MCP Server for AgentManager
 */
class AgentManagerMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name:'agent-manager',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      // Simulate async operation for tool discovery
      await new Promise(resolve => setTimeout(resolve, 1));
      
      return {
        tools: [
          {
            name: 'create_swarm',
            description:
              'Create a new ephemeral swarm for task coordination with cognitive diversity. This creates temporary agents with specialized thinking patterns (researcher, coder, analyst, architect) that coordinate to solve complex tasks. Supports session persistence for Claude CLI restarts and optional WASM neural acceleration for <100ms decision making.',
            inputSchema: {
              type: 'object',
              properties: {
                task: {
                  type: 'string',
                  description: 'Task description for the swarm',
                },
                cognitiveTypes: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: ['researcher', 'coder', 'analyst', 'architect'],
                  },
                  description: 'Array of cognitive types for diversity',
                },
                topology: {
                  type: 'string',
                  enum: ['mesh', 'hierarchical', 'ring', 'star'],
                  description: 'Coordination topology',
                  default: 'mesh',
                },
                maxDuration: {
                  type: 'number',
                  description: 'Max duration in milliseconds',
                  default: 3600000,
                },
                persistent: {
                  type: 'boolean',
                  description:
                    'Enable session persistence (survive Claude CLI restarts)',
                  default: true,
                },
                neuralAcceleration: {
                  type: 'boolean',
                  description: 'Enable WASM neural acceleration',
                  default: false,
                },
                maxTurns: {
                  type: 'number',
                  description: 'Maximum Claude SDK interactions',
                  default: 50,
                },
              },
              required: ['task', 'cognitiveTypes'],
            },
          },
          {
            name: 'execute_swarm',
            description:
              'Execute coordination for an existing swarm using Claude SDK with flexible turn limits. The swarm uses cognitive diversity and topology-based coordination to provide comprehensive analysis and decision-making. Results include performance metrics, agent insights, and coordination effectiveness.',
            inputSchema: {
              type: 'object',
              properties: {
                swarmId: {
                  type: 'string',
                  description: 'Unique swarm identifier',
                },
                maxTurns: {
                  type: 'number',
                  description:
                    'Maximum Claude SDK interactions for this execution',
                  default: 50,
                },
              },
              required: ['swarmId'],
            },
          },
          {
            name: 'list_swarms',
            description:
              'List all active ephemeral swarms with their status, cognitive composition, and performance metrics. Shows swarm topology, agent types, creation time, expiration, and detailed performance data including decision counts and coordination effectiveness.',
            inputSchema: {
              type: 'object',
              properties: {
                detailed: {
                  type: 'boolean',
                  description: 'Include detailed performance metrics',
                  default: false,
                },
              },
            },
          },
          {
            name: 'dissolve_swarm',
            description:
              'Dissolve an ephemeral swarm and clean up all resources. This terminates all agents in the swarm, clears coordination state, and removes the swarm from active management. Use when a task is complete or no longer needed.',
            inputSchema: {
              type: 'object',
              properties: {
                swarmId: {
                  type: 'string',
                  description: 'Unique swarm identifier',
                },
              },
              required: ['swarmId'],
            },
          },
          {
            name: 'pause_swarm',
            description:
              'Pause a swarm for Claude CLI session restart. This saves the swarm state and allows it to be resumed after the Claude CLI session restarts. Essential for maintaining long-running coordination across session boundaries.',
            inputSchema: {
              type: 'object',
              properties: {
                swarmId: {
                  type: 'string',
                  description: 'Unique swarm identifier',
                },
              },
              required: ['swarmId'],
            },
          },
          {
            name: 'resume_swarm',
            description:
              'Resume a paused swarm after Claude CLI session restart. This restores the swarm state and reactivates all agents from their checkpointed state, allowing seamless continuation of coordination tasks.',
            inputSchema: {
              type: 'object',
              properties: {
                swarmId: {
                  type: 'string',
                  description: 'Unique swarm identifier',
                },
              },
              required: ['swarmId'],
            },
          },
          {
            name: 'get_metrics',
            description:
              'Get comprehensive AgentManager performance metrics including uptime, active swarms, coordination statistics, cognitive distribution, and session restoration data. Provides insights into system performance and agent effectiveness.',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'health_check',
            description:
              'Check AgentManager health and system status including operational state, foundation logger availability, WASM neural acceleration status, uptime, and active swarm health. Essential for monitoring system reliability.',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          case 'create_swarm':
            return await this.handleCreateSwarm(args);
          case 'execute_swarm':
            return await this.handleExecuteSwarm(args);
          case 'list_swarms':
            return await this.handleListSwarms(args);
          case 'dissolve_swarm':
            return await this.handleDissolveSwarm(args);
          case 'pause_swarm':
            return await this.handlePauseSwarm(args);
          case 'resume_swarm':
            return await this.handleResumeSwarm(args);
          case 'get_metrics':
            return await this.handleGetMetrics();
          case 'health_check':
            return await this.handleHealthCheck();
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        logger.error('Tool execution failed', {
          error,
          tool: request.params.name,
        });
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    });
  }

  private async handleCreateSwarm(args: any) {
    const _manager = await getManager();

    // Validate cognitive types
    const validTypes: CognitiveArchetype[] = [
      'researcher',
      'coder',
      'analyst',
      'architect',
    ];
    for (const type of args.cognitiveTypes) {
      if (!validTypes.includes(type)) {
        throw new McpError(
          ErrorCode.InvalidParams,
          `Invalid cognitive type: ${type}`
        );
      }
    }

    // Validate topology
    const validTopologies: SwarmTopology[] = [
      'mesh',
      'hierarchical',
      'ring',
      'star',
    ];
    if (args.topology && !validTopologies.includes(args.topology)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Invalid topology: ${args.topology}`
      );
    }

    const swarm = await AgentManager.createSwarm({
      task: args.task,
      cognitiveTypes: args.cognitiveTypes,
      topology: args.topology||'mesh',
      maxDuration: args.maxDuration||3600000,
      persistent: args.persistent ?? true,
      neuralAcceleration: args.neuralAcceleration||false,
      maxTurns: args.maxTurns||50,
    });

    return {
      content: [
        {
          type:'text',
          text: JSON.stringify(
            {
              success: true,
              swarm: {
                id: swarm.id,
                task: swarm.task,
                cognitiveTypes: swarm.agents.map((a) => a.archetype),
                topology: swarm.topology,
                created: swarm.created,
                expiresAt: swarm.expiresAt,
                persistent: swarm.persistent,
                agentCount: swarm.agents.length,
                agents: swarm.agents.map((agent) => ({
                  id: agent.id,
                  archetype: agent.archetype,
                  decisionSpeed: agent.cognition.decisionSpeed,
                  patterns: agent.cognition.patterns,
                  strengths: agent.cognition.strengths,
                })),
              },
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async handleExecuteSwarm(args: any) {
    const manager = await getManager();

    const result = await manager.executeSwarm(args.swarmId, {
      maxTurns: args.maxTurns||50,
    });

    return {
      content: [
        {
          type:'text',
          text: JSON.stringify(
            {
              success: true,
              result: {
                swarmId: result.swarmId,
                success: result.success,
                duration: result.duration,
                agentResults: result.agentResults,
                coordination: result.coordination,
                neuralMetrics: result.neuralMetrics,
              },
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async handleListSwarms(args: any) {
    const manager = await getManager();
    const swarms = manager.getActiveSwarms();

    const swarmList = swarms.map((swarm) => ({
      id: swarm.id,
      task: swarm.task,
      status: swarm.status,
      cognitiveTypes: swarm.agents.map((a) => a.archetype),
      topology: swarm.topology,
      created: swarm.created,
      expiresAt: swarm.expiresAt,
      persistent: swarm.persistent,
      agentCount: swarm.agents.length,
      ...(args.detailed && {
        performance: swarm.performance,
        agents: swarm.agents.map((agent) => ({
          id: agent.id,
          archetype: agent.archetype,
          status: agent.status,
          performance: agent.performance,
          cognition: agent.cognition,
        })),
      }),
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              swarms: swarmList,
              count: swarms.length,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async handleDissolveSwarm(args: any) {
    const manager = await getManager();

    await manager.dissolveSwarm(args.swarmId);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              message: `Swarm ${args.swarmId} dissolved successfully`,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async handlePauseSwarm(args: any) {
    const manager = await getManager();

    await manager.pauseSwarm(args.swarmId);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              message: `Swarm ${args.swarmId} paused successfully`,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async handleResumeSwarm(args: any) {
    const manager = await getManager();

    await manager.resumeSwarm(args.swarmId);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              message: `Swarm ${args.swarmId} resumed successfully`,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async handleGetMetrics() {
    const manager = await getManager();
    const metrics = manager.getPerformanceMetrics();
    const swarms = manager.getActiveSwarms();

    // Calculate cognitive distribution
    const archetypeCounts = new Map<string, number>();
    for (const swarm of swarms) {
      for (const agent of swarm.agents) {
        archetypeCounts.set(
          agent.archetype,
          (archetypeCounts.get(agent.archetype)||0) + 1
        );
      }
    }

    return {
      content: [
        {
          type:'text',
          text: JSON.stringify(
            {
              success: true,
              metrics: {
                uptime: manager.getUptime(),
                activeSwarms: manager.getSwarmCount(),
                totalSwarms: metrics.totalSwarms,
                averageDecisionTime: metrics.averageDecisionTime,
                successfulCoordinations: metrics.successfulCoordinations,
                sessionsRestored: metrics.sessionsRestored,
                cognitiveDistribution: Object.fromEntries(archetypeCounts),
              },
            },
            null,
            2
          ),
        },
      ],
    };
  }

  private async handleHealthCheck() {
    const manager = await getManager();

    let wasmAvailable = false;
    try {
      // Use dynamic loader to avoid TypeScript compilation issues
      const { isWasmNeuralAvailable } = await import('./wasm-loader');
      wasmAvailable = await isWasmNeuralAvailable();
    } catch {
      // WASM not available, but that's optional
    }

    const uptime = manager.getUptime();
    const activeSwarms = manager.getSwarmCount();
    const swarms = manager.getActiveSwarms();
    const healthySwarms = swarms.filter((s) => s.status === 'active').length;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              health: {
                status: 'healthy',
                agentManager: 'operational',
                foundationLogger: 'available',
                wasmNeural: wasmAvailable ? 'available' : 'not_available',
                uptime,
                activeSwarms,
                healthySwarms,
              },
            },
            null,
            2
          ),
        },
      ],
    };
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    logger.info('🚀 AgentManager MCP Server started on stdio');
  }
}

// Start the server if run directly
if (require.main === module) {
  const server = new AgentManagerMCPServer();
  server.start().catch((error) => {
    logger.error('Failed to start MCP server', error);
    process.exit(1);
  });
}

export { AgentManagerMCPServer };
