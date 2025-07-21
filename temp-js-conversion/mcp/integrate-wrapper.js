#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPIntegration = void 0;
exports.injectClaudeCodeClient = injectClaudeCodeClient;
const child_process_1 = require("child_process");
const index_js_1 = require("@modelcontextprotocol/sdk/client/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/client/stdio.js");
const claude_code_wrapper_js_1 = require("./claude-code-wrapper.js");
/**
 * Integration script that connects the Claude-Flow MCP wrapper
 * to the Claude Code MCP server
 */
class MCPIntegration {
    constructor() {
        this.wrapper = new claude_code_wrapper_js_1.ClaudeCodeMCPWrapper();
    }
    async connectToClaudeCode() {
        try {
            // Start Claude Code MCP server process
            const claudeCodeProcess = (0, child_process_1.spawn)('npx', [
                '-y',
                '@anthropic/claude-code',
                'mcp'
            ], {
                stdio: ['pipe', 'pipe', 'pipe'],
            });
            const transport = new stdio_js_1.StdioClientTransport({
                command: 'npx',
                args: ['-y', '@anthropic/claude-code', 'mcp'],
            });
            this.claudeCodeClient = new index_js_1.Client({
                name: 'claude-flow-wrapper-client',
                version: '1.0.0',
            }, {
                capabilities: {},
            });
            await this.claudeCodeClient.connect(transport);
            // Inject the client into the wrapper
            this.wrapper.claudeCodeMCP = this.claudeCodeClient;
            console.log('Connected to Claude Code MCP server');
        }
        catch (error) {
            console.error('Failed to connect to Claude Code MCP:', error);
            throw error;
        }
    }
    async start() {
        // Connect to Claude Code MCP
        await this.connectToClaudeCode();
        // Start the wrapper server
        await this.wrapper.run();
    }
}
exports.MCPIntegration = MCPIntegration;
// Update the wrapper to use the real Claude Code MCP client
function injectClaudeCodeClient(wrapper, client) {
    // Override the forwardToClaudeCode method
    wrapper.forwardToClaudeCode = async function (toolName, args) {
        try {
            const result = await client.callTool(toolName, args);
            return result;
        }
        catch (error) {
            return {
                content: [{
                        type: 'text',
                        text: `Error calling Claude Code tool ${toolName}: ${error instanceof Error ? error.message : String(error)}`,
                    }],
                isError: true,
            };
        }
    };
}
// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
    const integration = new MCPIntegration();
    integration.start().catch(console.error);
}
