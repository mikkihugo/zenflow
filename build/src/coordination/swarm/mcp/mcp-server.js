/**
 * Unified MCP Server for Claude Code CLI Integration.
 * Single stdio MCP server combining coordination and swarm functionality.
 */
/**
 * @file Coordination system: mcp-server.
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { getLogger } from '../../../config/logging-config.ts';
import { dspySwarmMCPTools } from '../../mcp/dspy-swarm-mcp-tools.ts';
import { HiveTools } from './hive-tools.ts';
import { SwarmTools } from './swarm-tools.ts';
const logger = getLogger('UnifiedMCPServer');
export class StdioMcpServer {
    server;
    transport;
    toolRegistry;
    hiveRegistry;
    config;
    constructor(config = {}) {
        this.config = {
            timeout: 30000,
            logLevel: 'info',
            maxConcurrentRequests: 10,
            ...config,
        };
        this.transport = new StdioServerTransport();
        this.toolRegistry = new SwarmTools();
        this.hiveRegistry = new HiveTools();
        this.server = new McpServer({
            name: 'claude-zen-unified',
            version: '2.0.0-alpha.73',
        }, {
            capabilities: {
                tools: {},
                resources: {},
                prompts: {},
                logging: {},
            },
        });
    }
    async start() {
        logger.info('Starting unified MCP server for Claude Code CLI');
        // Register all tools from the tool registry
        await this.registerTools();
        // Connect server to transport
        await this.server.connect(this.transport);
        logger.info('Unified MCP server started successfully');
    }
    async registerTools() {
        logger.info('Registering swarm, hive, and DSPy MCP tools...');
        // Get all tools from registries
        const swarmTools = this.toolRegistry.tools;
        const hiveTools = this.hiveRegistry.tools;
        const tools = { ...swarmTools, ...hiveTools, ...dspySwarmMCPTools };
        // Register each tool with the MCP server using the official SDK pattern
        for (const [toolName, toolFunction] of Object.entries(tools)) {
            try {
                this.server.tool(toolName, `Swarm ${toolName.replace('_', ' ')} operation`, {
                    // Basic parameters that all tools can accept
                    params: z.record(z.any()).optional().describe('Tool parameters'),
                }, async (args, _extra) => {
                    try {
                        logger.debug(`Executing tool: ${toolName}`, { args });
                        const result = await toolFunction(args?.params || {});
                        // Convert result to MCP format with required content array
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(result, null, 2),
                                },
                            ],
                            _meta: {
                                tool: toolName,
                                executionTime: Date.now(),
                            },
                        };
                    }
                    catch (error) {
                        logger.error(`Tool execution failed: ${toolName}`, error);
                        // Return error in MCP format
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        success: false,
                                        error: error instanceof Error ? error.message : String(error),
                                        tool: toolName,
                                    }, null, 2),
                                },
                            ],
                            _meta: {
                                tool: toolName,
                                error: true,
                            },
                        };
                    }
                });
                logger.debug(`Registered tool: ${toolName}`);
            }
            catch (error) {
                logger.error(`Failed to register tool ${toolName}:`, error);
            }
        }
        logger.info(`Registered ${Object.keys(swarmTools).length} swarm tools, ${Object.keys(hiveTools).length} hive tools, and ${Object.keys(dspySwarmMCPTools).length} DSPy swarm tools`);
    }
    async stop() {
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
