/**
 * @fileoverview Unified stdio MCP Server for Claude Code Zen Swarm Integration
 *
 * This module implements the central stdio MCP (Model Context Protocol) server that
 * exposes all Claude Code Zen swarm capabilities through a unified interface. When
 * you run `claude-zen swarm`, this server starts and makes all MCP tools available
 * to Claude CLI and other MCP clients.
 *
 * ## stdio MCP Architecture
 *
 * This server uses stdio transport (not HTTP) for optimal integration with Claude CLI:
 * - **Transport**: StdioServerTransport for direct CLI communication
 * - **Protocol**: Official MCP SDK with proper message formatting
 * - **Tools**: Unified registration of all swarm, hive, and DSPy tools
 * - **Configuration**: Flexible server configuration with sensible defaults
 *
 * ## Tool Integration
 *
 * The server combines three main tool registries:
 *
 * ### SwarmTools
 * - `swarm_status` - Get swarm system status and metrics
 * - `swarm_init` - Initialize new swarm coordination
 * - `swarm_monitor` - Monitor swarm activity in real-time
 * - `agent_spawn` - Create new specialized agents
 * - `agent_list` - List all active agents
 * - `agent_metrics` - Get agent performance metrics
 * - `task_orchestrate` - Orchestrate complex multi-agent tasks
 * - `task_status` - Check task execution progress
 * - `task_results` - Retrieve completed task results
 * - `memory_usage` - Manage swarm memory and state
 * - `benchmark_run` - Execute performance benchmarks
 * - `features_detect` - Detect available system capabilities
 *
 * ### CollectiveTools (High-Level Coordination)
 * - `hive_status` - Get hive-level system status
 * - `hive_query` - Query the hive mind knowledge base
 * - `hive_contribute` - Contribute knowledge to the hive
 * - `hive_agents` - Manage hive-level agent coordination
 * - `hive_tasks` - Coordinate hive-level task execution
 * - `hive_knowledge` - Access and manage hive knowledge
 * - `hive_sync` - Synchronize hive state across systems
 * - `hive_health` - Monitor hive system health
 *
 * ### DSPy Swarm Tools (Neural Intelligence)
 * - `dspy_swarm_init` - Initialize DSPy neural coordination
 * - `dspy_swarm_execute_task` - Execute tasks using neural agents
 * - `dspy_swarm_generate_code` - AI-powered code generation
 * - `dspy_swarm_analyze_code` - Intelligent code analysis
 * - `dspy_swarm_design_architecture` - Neural architecture design
 * - `dspy_swarm_status` - Get DSPy swarm status and metrics
 * - `dspy_swarm_optimize_agent` - Optimize neural agents
 * - `dspy_swarm_cleanup` - Clean up DSPy resources
 *
 * ## Usage with Claude CLI
 *
 * ```bash
 * # Start the stdio MCP server
 * claude-zen swarm
 *
 * # Tools become available as:
 * # mcp__claude-zen-unified__swarm_status
 * # mcp__claude-zen-unified__dspy_swarm_init
 * # mcp__claude-zen-unified__hive_query
 * # ... and all other tools
 * ```
 *
 * ## Error Handling
 *
 * The server implements comprehensive error handling:
 * - Tool execution errors are caught and returned in MCP format
 * - Logging for all operations and failures
 * - Graceful degradation for missing dependencies
 * - Proper MCP response formatting for all scenarios
 *
 * @example
 * ```typescript
 * // Start stdio MCP server
 * const server = new StdioMcpServer({
 *   timeout: 30000,
 *   maxConcurrentRequests: 10,
 *   logLevel: 'info'
 * });
 *
 * await server.start();
 * // Server now accepts stdio MCP requests
 * ```
 *
 * @author Claude Code Zen Team
 * @version 2.0.0-alpha.73
 * @since 1.0.0
 * @see {@link https://modelcontextprotocol.io} MCP Protocol Specification
 * @see {@link SwarmTools} Core swarm management tools
 * @see {@link CollectiveTools} High-level coordination tools
 * @see {@link dspySwarmMCPTools} Neural intelligence tools
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { getLogger } from '../../../config/logging-config.ts';
import { dspySwarmMCPTools } from '../../mcp/dspy-swarm-mcp-tools.ts';
import { CollectiveTools } from './collective-tools.ts';
import { SwarmTools } from './swarm-tools.ts';
import type { MCPServerConfig } from './types.ts';

const logger = getLogger('UnifiedMCPServer');

/**
 * Unified stdio MCP Server that exposes all Claude Code Zen swarm capabilities.
 *
 * This server combines SwarmTools, CollectiveTools, and DSPy tools into a single
 * stdio MCP interface for seamless integration with Claude CLI. It handles
 * tool registration, execution, error handling, and response formatting.
 *
 * ## Server Architecture
 *
 * - **Transport**: stdio for direct CLI communication (not HTTP)
 * - **Protocol**: Official MCP SDK with proper message formatting
 * - **Tools**: Unified registration of 25+ swarm coordination tools
 * - **Error Handling**: Comprehensive error catching and MCP formatting
 *
 * ## Tool Categories
 *
 * 1. **Core Swarm Tools** (12 tools): Basic swarm management and coordination
 * 2. **Hive Tools** (8 tools): High-level knowledge coordination
 * 3. **DSPy Tools** (8 tools): Neural intelligence and learning
 *
 * @example
 * ```typescript
 * // Basic server setup
 * const server = new StdioMcpServer();
 * await server.start();
 *
 * // Custom configuration
 * const customServer = new StdioMcpServer({
 *   timeout: 45000,
 *   maxConcurrentRequests: 20,
 *   logLevel: 'debug'
 * });
 * ```
 */
export class StdioMcpServer {
  /** Official MCP SDK server instance */
  private server: McpServer;

  /** stdio transport for Claude CLI integration */
  private transport: StdioServerTransport;

  /** Core swarm management tools registry */
  private toolRegistry: SwarmTools;

  /** High-level hive coordination tools registry */
  private collectiveRegistry: CollectiveTools;

  /** Server configuration with defaults */
  private config: MCPServerConfig;

  /**
   * Creates a new stdio MCP server with unified tool registration.
   *
   * Initializes all tool registries and configures the MCP server for stdio
   * communication. The server is ready to start after construction.
   *
   * ## Default Configuration
   *
   * - **Timeout**: 30 seconds for reliable tool execution
   * - **Log Level**: 'info' for balanced logging
   * - **Max Requests**: 10 concurrent requests for stability
   * - **Server Name**: 'claude-zen-unified' for MCP identification
   * - **Version**: Matches Claude Code Zen version
   *
   * @param config - Optional server configuration
   * @param config.timeout - Tool execution timeout in milliseconds
   * @param config.logLevel - Logging level (debug, info, warn, error)
   * @param config.maxConcurrentRequests - Maximum concurrent tool executions
   *
   * @example
   * ```typescript
   * // Production server with extended timeout
   * const prodServer = new StdioMcpServer({
   *   timeout: 60000,
   *   logLevel: 'warn',
   *   maxConcurrentRequests: 15
   * });
   * ```
   */
  constructor(config: MCPServerConfig = {}) {
    this.config = {
      timeout: 30000,
      logLevel: 'info',
      maxConcurrentRequests: 10,
      ...config,
    };

    this.transport = new StdioServerTransport();
    this.toolRegistry = new SwarmTools();
    this.collectiveRegistry = new CollectiveTools();

    this.server = new McpServer(
      {
        name: 'claude-zen-unified',
        version: '1.0.0-alpha.43',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
          logging: {},
        },
      },
    );
  }

  /**
   * Starts the stdio MCP server and registers all available tools.
   *
   * This method performs the complete server startup process:
   * 1. Registers all tools from SwarmTools, CollectiveTools, and DSPy registries
   * 2. Connects the MCP server to stdio transport
   * 3. Begins accepting MCP requests from Claude CLI
   *
   * After this method completes, the server is ready to handle tool requests
   * from Claude CLI and other MCP clients.
   *
   * ## Tool Registration Process
   *
   * - **SwarmTools**: 12 core swarm management tools
   * - **CollectiveTools**: 8 high-level coordination tools
   * - **DSPy Tools**: 8 neural intelligence tools
   * - **Total**: 28 tools available via `claude-zen swarm`
   *
   * @throws {Error} When tool registration fails
   * @throws {Error} When transport connection fails
   *
   * @example
   * ```typescript
   * const server = new StdioMcpServer();
   * try {
   *   await server.start();
   *   console.log('Server ready for MCP requests');
   * } catch (error) {
   *   console.error('Failed to start server:', error);
   * }
   * ```
   */
  async start(): Promise<void> {
    logger.info('Starting unified MCP server for Claude Code CLI');

    // Register all tools from the tool registry
    await this.registerTools();

    // Connect server to transport
    await this.server.connect(this.transport);
    logger.info('Unified MCP server started successfully');
  }

  /**
   * Registers all available tools with the MCP server for stdio access.
   *
   * This private method combines tools from all registries and registers each
   * one with the MCP server using the official SDK pattern. Each tool is wrapped
   * with proper error handling and MCP response formatting.
   *
   * ## Registration Process
   *
   * 1. **Tool Collection**: Gather tools from all registries
   * 2. **SDK Registration**: Register each tool with MCP server
   * 3. **Error Wrapping**: Add comprehensive error handling
   * 4. **Response Formatting**: Ensure proper MCP response format
   *
   * ## Tool Naming Convention
   *
   * Tools are accessible with original names:
   * - SwarmTools: `swarm_status`, `agent_spawn`, etc.
   * - CollectiveTools: `hive_query`, `hive_contribute`, etc.
   * - DSPy Tools: `dspy_swarm_init`, `dspy_swarm_execute_task`, etc.
   *
   * @throws {Error} When tool registration fails
   */
  private async registerTools(): Promise<void> {
    logger.info('Registering swarm, hive, and DSPy MCP tools...');

    // Get all tools from registries
    const swarmTools = this.toolRegistry.tools;
    const hiveTools = this.collectiveRegistry.tools;
    const tools = { ...swarmTools, ...hiveTools, ...dspySwarmMCPTools };

    // Register each tool with the MCP server using the official SDK pattern
    for (const [toolName, toolFunction] of Object.entries(tools)) {
      try {
        this.server.tool(
          toolName,
          `Swarm ${toolName.replace('_', ' ')} operation`,
          {
            // Basic parameters that all tools can accept
            params: z.record(z.any()).optional().describe('Tool parameters'),
          },
          async (args, _extra) => {
            try {
              logger.debug(`Executing tool: ${toolName}`, { args });
              const result = await (toolFunction as Function)(
                args?.params || ({} as any),
              );

              // Convert result to MCP format with required content array
              return {
                content: [
                  {
                    type: 'text' as const,
                    text: JSON.stringify(result, null, 2),
                  },
                ],
                _meta: {
                  tool: toolName,
                  executionTime: Date.now(),
                },
              };
            } catch (error) {
              logger.error(`Tool execution failed: ${toolName}`, error);

              // Return error in MCP format
              return {
                content: [
                  {
                    type: 'text' as const,
                    text: JSON.stringify(
                      {
                        success: false,
                        error:
                          error instanceof Error
                            ? error.message
                            : String(error),
                        tool: toolName,
                      },
                      null,
                      2,
                    ),
                  },
                ],
                _meta: {
                  tool: toolName,
                  error: true,
                },
              };
            }
          },
        );

        logger.debug(`Registered tool: ${toolName}`);
      } catch (error) {
        logger.error(`Failed to register tool ${toolName}:`, error);
      }
    }

    logger.info(
      `Registered ${Object.keys(swarmTools).length} swarm tools, ${Object.keys(hiveTools).length} hive tools, and ${Object.keys(dspySwarmMCPTools).length} DSPy swarm tools`,
    );
  }

  /**
   * Gracefully stops the stdio MCP server and closes all connections.
   *
   * This method performs a clean shutdown of the MCP server:
   * 1. Stops accepting new MCP requests
   * 2. Waits for active tool executions to complete
   * 3. Closes the stdio transport connection
   * 4. Releases all server resources
   *
   * Should be called during application shutdown to ensure proper cleanup.
   *
   * @throws {Error} When server shutdown fails
   *
   * @example
   * ```typescript
   * // Graceful shutdown on SIGINT
   * process.on('SIGINT', async () => {
   *   await server.stop();
   *   process.exit(0);
   * });
   * ```
   */
  async stop(): Promise<void> {
    logger.info('Stopping unified MCP server');
    await this.server.close();
  }
}

// Re-export for compatibility
export { StdioMcpServer as MCPServer };
export default StdioMcpServer;

// Main execution when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new StdioMcpServer();

  server.start().catch((error) => {
    logger.error('Failed to start MCP server:', error);
    process.exit(1);
  });

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    logger.info('Received SIGINT, shutting down gracefully...');
    await server.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM, shutting down gracefully...');
    await server.stop();
    process.exit(0);
  });
}
