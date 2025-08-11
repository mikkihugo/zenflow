/**
 * Swarm MCP Tools - Core Swarm Management.
 *
 * Swarm coordination tools using clean DAL Factory integration.
 * Provides essential swarm functionality for CLI and MCP integration.
 */
/**
 * @file Coordination system: swarm-tools.
 */
export declare class SwarmTools {
    tools: Record<string, Function>;
    constructor();
    /**
     * Get swarm system status.
     *
     * @param _params
     */
    swarmStatus(_params?: any): Promise<any>;
    /**
     * Initialize new swarm.
     *
     * @param params
     */
    swarmInit(params?: any): Promise<any>;
    /**
     * Monitor swarm activity.
     *
     * @param _params
     */
    swarmMonitor(_params?: any): Promise<any>;
    /**
     * Spawn new agent.
     *
     * @param params
     */
    agentSpawn(params?: any): Promise<any>;
    /**
     * List active agents.
     *
     * @param _params
     */
    agentList(_params?: any): Promise<any>;
    /**
     * Get agent metrics.
     *
     * @param _params
     */
    agentMetrics(_params?: any): Promise<any>;
    /**
     * Orchestrate task.
     *
     * @param params
     */
    taskOrchestrate(params?: any): Promise<any>;
    /**
     * Get task status.
     *
     * @param params
     */
    taskStatus(params?: any): Promise<any>;
    /**
     * Get task results.
     *
     * @param params
     */
    taskResults(params?: any): Promise<any>;
    /**
     * Get memory usage.
     *
     * @param _params
     */
    memoryUsage(_params?: any): Promise<any>;
    /**
     * Run benchmark.
     *
     * @param _params
     */
    benchmarkRun(_params?: any): Promise<any>;
    /**
     * Detect available features.
     *
     * @param _params
     */
    featuresDetect(_params?: any): Promise<any>;
}
export default SwarmTools;
//# sourceMappingURL=swarm-tools.d.ts.map