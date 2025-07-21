"use strict";
/**
 * MCPToolWrapper Class
 *
 * Wraps all MCP tools for use within the Hive Mind system,
 * providing a unified interface for swarm coordination, neural processing,
 * and memory management.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPToolWrapper = void 0;
const events_1 = require("events");
const child_process_1 = require("child_process");
const util_1 = require("util");
const type_guards_js_1 = require("../../utils/type-guards.js");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class MCPToolWrapper extends events_1.EventEmitter {
    constructor() {
        super();
        this.toolPrefix = 'mcp__ruv-swarm__';
        this.isInitialized = false;
    }
    /**
     * Initialize MCP tools
     */
    async initialize() {
        try {
            // Check if MCP tools are available
            await this.checkToolAvailability();
            this.isInitialized = true;
            this.emit('initialized');
        }
        catch (error) {
            this.emit('error', error);
            throw error;
        }
    }
    /**
     * Check if MCP tools are available
     */
    async checkToolAvailability() {
        try {
            const { stdout } = await execAsync('npx ruv-swarm --version');
            if (!stdout) {
                throw new Error('ruv-swarm MCP tools not found');
            }
        }
        catch (error) {
            throw new Error('MCP tools not available. Please ensure ruv-swarm is installed.');
        }
    }
    /**
     * Execute MCP tool via CLI
     */
    async executeTool(toolName, params) {
        try {
            const command = `npx ruv-swarm mcp-execute ${toolName} '${JSON.stringify(params)}'`;
            const { stdout, stderr } = await execAsync(command);
            if (stderr) {
                return { success: false, error: stderr };
            }
            const result = JSON.parse(stdout);
            return { success: true, data: result };
        }
        catch (error) {
            return { success: false, error: (0, type_guards_js_1.getErrorMessage)(error) };
        }
    }
    // Swarm coordination tools
    async initSwarm(params) {
        return this.executeTool('swarm_init', params);
    }
    async spawnAgent(params) {
        return this.executeTool('agent_spawn', params);
    }
    async orchestrateTask(params) {
        return this.executeTool('task_orchestrate', params);
    }
    async getSwarmStatus(swarmId) {
        return this.executeTool('swarm_status', { swarmId });
    }
    async monitorSwarm(params) {
        return this.executeTool('swarm_monitor', params);
    }
    // Neural and pattern tools
    async analyzePattern(params) {
        return this.executeTool('neural_patterns', params);
    }
    async trainNeural(params) {
        return this.executeTool('neural_train', params);
    }
    async predict(params) {
        return this.executeTool('neural_predict', params);
    }
    async getNeuralStatus(modelId) {
        return this.executeTool('neural_status', { modelId });
    }
    // Memory management tools
    async storeMemory(params) {
        return this.executeTool('memory_usage', params);
    }
    async retrieveMemory(params) {
        const result = await this.executeTool('memory_usage', params);
        return result.success ? result.data : null;
    }
    async searchMemory(params) {
        return this.executeTool('memory_search', params);
    }
    async deleteMemory(params) {
        return this.executeTool('memory_usage', params);
    }
    async listMemory(params) {
        return this.executeTool('memory_usage', params);
    }
    // Performance and monitoring tools
    async getPerformanceReport(params) {
        return this.executeTool('performance_report', params || {});
    }
    async analyzeBottlenecks(params) {
        return this.executeTool('bottleneck_analyze', params || {});
    }
    async getTokenUsage(params) {
        return this.executeTool('token_usage', params || {});
    }
    // Agent management tools
    async listAgents(swarmId) {
        return this.executeTool('agent_list', { swarmId });
    }
    async getAgentMetrics(agentId) {
        return this.executeTool('agent_metrics', { agentId });
    }
    // Task management tools
    async getTaskStatus(taskId) {
        return this.executeTool('task_status', { taskId });
    }
    async getTaskResults(taskId) {
        return this.executeTool('task_results', { taskId });
    }
    // Advanced coordination tools
    async optimizeTopology(swarmId) {
        return this.executeTool('topology_optimize', { swarmId });
    }
    async loadBalance(params) {
        return this.executeTool('load_balance', params);
    }
    async syncCoordination(swarmId) {
        return this.executeTool('coordination_sync', { swarmId });
    }
    async scaleSwarm(params) {
        return this.executeTool('swarm_scale', params);
    }
    // SPARC mode integration
    async runSparcMode(params) {
        return this.executeTool('sparc_mode', params);
    }
    // Workflow tools
    async createWorkflow(params) {
        return this.executeTool('workflow_create', params);
    }
    async executeWorkflow(params) {
        return this.executeTool('workflow_execute', params);
    }
    // GitHub integration tools
    async analyzeRepository(params) {
        return this.executeTool('github_repo_analyze', params);
    }
    async manageGitHubPR(params) {
        return this.executeTool('github_pr_manage', params);
    }
    // Dynamic Agent Architecture tools
    async createDynamicAgent(params) {
        return this.executeTool('daa_agent_create', params);
    }
    async matchCapabilities(params) {
        return this.executeTool('daa_capability_match', params);
    }
    // System tools
    async runBenchmark(suite) {
        return this.executeTool('benchmark_run', { suite });
    }
    async collectMetrics(components) {
        return this.executeTool('metrics_collect', { components });
    }
    async analyzeTrends(params) {
        return this.executeTool('trend_analysis', params);
    }
    async analyzeCost(timeframe) {
        return this.executeTool('cost_analysis', { timeframe });
    }
    async assessQuality(params) {
        return this.executeTool('quality_assess', params);
    }
    async healthCheck(components) {
        return this.executeTool('health_check', { components });
    }
    // Batch operations
    async batchProcess(params) {
        return this.executeTool('batch_process', params);
    }
    async parallelExecute(tasks) {
        return this.executeTool('parallel_execute', { tasks });
    }
    /**
     * Generic tool execution for custom tools
     */
    async executeMCPTool(toolName, params) {
        return this.executeTool(toolName, params);
    }
    /**
     * Helper to format tool responses
     */
    formatResponse(response) {
        if (response.success) {
            return response.data;
        }
        else {
            throw new Error(`MCP Tool Error: ${response.error}`);
        }
    }
}
exports.MCPToolWrapper = MCPToolWrapper;
