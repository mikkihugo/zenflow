import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { getLogger } from '../../../config/logging-config.ts';
import { dspySwarmMCPTools } from '../../mcp/dspy-swarm-mcp-tools.ts';
import { CollectiveTools } from './collective-tools.ts';
import { SwarmTools } from './swarm-tools.ts';
const logger = getLogger('UnifiedMCPServer');
export class StdioMcpServer {
    server;
    transport;
    toolRegistry;
    collectiveRegistry;
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
        this.collectiveRegistry = new CollectiveTools();
        this.server = new McpServer({
            name: 'claude-zen-unified',
            version: '1.0.0-alpha.43',
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
        await this.registerTools();
        await this.server.connect(this.transport);
        logger.info('Unified MCP server started successfully');
    }
    async registerTools() {
        logger.info('Registering swarm, hive, and DSPy MCP tools...');
        const swarmTools = this.toolRegistry.tools;
        const hiveTools = this.collectiveRegistry.tools;
        const tools = { ...swarmTools, ...hiveTools, ...dspySwarmMCPTools };
        for (const [toolName, toolFunction] of Object.entries(tools)) {
            try {
                this.server.tool(toolName, `Swarm ${toolName.replace('_', ' ')} operation`, {
                    params: z.record(z.any()).optional().describe('Tool parameters'),
                }, async (args, _extra) => {
                    try {
                        logger.debug(`Executing tool: ${toolName}`, { args });
                        const result = await toolFunction(args?.params || {});
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
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        success: false,
                                        error: error instanceof Error
                                            ? error.message
                                            : String(error),
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
export { StdioMcpServer as MCPServer };
export default StdioMcpServer;
if (import.meta.url === `file://${process.argv[1]}`) {
    const server = new StdioMcpServer();
    server.start().catch((error) => {
        logger.error('Failed to start MCP server:', error);
        process.exit(1);
    });
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
//# sourceMappingURL=mcp-server.js.map