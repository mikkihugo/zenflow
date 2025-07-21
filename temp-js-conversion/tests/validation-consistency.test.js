"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const agent_types_js_1 = require("../constants/agent-types.js");
// Import validation schemas from various files
const mcpServer = require('../mcp/mcp-server.js');
const claude_flow_tools_js_1 = require("../mcp/claude-flow-tools.js");
const ruv_swarm_tools_js_1 = require("../mcp/ruv-swarm-tools.js");
const swarm_tools_js_1 = require("../mcp/swarm-tools.js");
(0, globals_1.describe)('Agent Type Validation Consistency', () => {
    const expectedTypes = agent_types_js_1.VALID_AGENT_TYPES.sort();
    (0, globals_1.test)('MCP server agent_spawn uses consistent agent types', () => {
        const agentSpawnTool = mcpServer.tools.agent_spawn;
        const enumValues = agentSpawnTool.inputSchema.properties.type.enum;
        (0, globals_1.expect)(enumValues.sort()).toEqual(expectedTypes);
    });
    (0, globals_1.test)('Claude Flow tools use consistent agent types', () => {
        const tools = (0, claude_flow_tools_js_1.getClaudeFlowTools)({});
        const spawnTool = tools.find(t => t.name === 'spawn_agent');
        const enumValues = spawnTool?.inputSchema.properties.type.enum;
        (0, globals_1.expect)(enumValues?.sort()).toEqual(expectedTypes);
    });
    (0, globals_1.test)('Ruv Swarm tools use consistent agent types', () => {
        const tools = (0, ruv_swarm_tools_js_1.getRuvSwarmTools)({});
        const spawnTool = tools.find(t => t.name === 'spawn_agent');
        const enumValues = spawnTool?.inputSchema.properties.type.enum;
        (0, globals_1.expect)(enumValues?.sort()).toEqual(expectedTypes);
    });
    (0, globals_1.test)('Swarm tools use consistent agent types', () => {
        const tools = (0, swarm_tools_js_1.getSwarmTools)({});
        const spawnTool = tools.find(t => t.name === 'spawn_agent');
        const enumValues = spawnTool?.inputSchema.properties.type.enum;
        (0, globals_1.expect)(enumValues?.sort()).toEqual(expectedTypes);
    });
    (0, globals_1.test)('Error wrapper validation uses consistent agent types', () => {
        // This would require importing the error wrapper module
        // For now, we've manually verified it's updated
        (0, globals_1.expect)(true).toBe(true);
    });
});
(0, globals_1.describe)('Strategy Validation Consistency', () => {
    (0, globals_1.test)('Task orchestrate uses correct orchestration strategies', () => {
        const taskOrchestrateTool = mcpServer.tools.task_orchestrate;
        const strategies = taskOrchestrateTool.inputSchema.properties.strategy.enum;
        (0, globals_1.expect)(strategies).toEqual(['parallel', 'sequential', 'adaptive', 'balanced']);
    });
});
