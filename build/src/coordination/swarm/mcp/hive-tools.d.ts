/**
 * Hive MCP Tools - High-Level Knowledge Coordination.
 *
 * Provides Hive-level coordination commands that abstract away swarm complexity.
 * Users interact with the Hive mind rather than individual swarms.
 */
/**
 * @file Coordination system: hive-tools.
 */
export declare class HiveTools {
    private dalFactory;
    tools: Record<string, Function>;
    constructor();
    /**
     * Initialize DAL Factory (lazy loading).
     */
    private getDalFactory;
    /**
     * Get comprehensive Hive system status.
     *
     * @param _params
     */
    hiveStatus(_params?: any): Promise<any>;
    /**
     * Query the Hive knowledge base.
     *
     * @param params
     */
    hiveQuery(params?: any): Promise<any>;
    /**
     * Contribute knowledge to the Hive.
     *
     * @param params
     */
    hiveContribute(params?: any): Promise<any>;
    /**
     * Get global agent information across all swarms.
     *
     * @param _params
     */
    hiveAgents(_params?: any): Promise<any>;
    /**
     * Get global task overview across all swarms.
     *
     * @param params
     */
    hiveTasks(params?: any): Promise<any>;
    /**
     * Get knowledge base statistics and health.
     *
     * @param _params
     */
    hiveKnowledge(_params?: any): Promise<any>;
    /**
     * Synchronize Hive with external systems.
     *
     * @param params
     */
    hiveSync(params?: any): Promise<any>;
    /**
     * Get comprehensive Hive health metrics.
     *
     * @param _params
     */
    hiveHealth(_params?: any): Promise<any>;
    /**
     * Get running agent processes from system.
     */
    private getRunningAgentProcesses;
    /**
     * Get active MCP connections.
     */
    private getActiveMCPConnections;
    /**
     * Get swarm states from database.
     *
     * @param dal
     * @param _dal
     */
    private getSwarmStates;
    /**
     * Get active task queue.
     *
     * @param dal
     * @param _dal
     */
    private getActiveTaskQueue;
    /**
     * Get system performance metrics.
     */
    private getSystemPerformanceMetrics;
    /**
     * Get active swarms from system/database.
     *
     * @param dal
     * @param _dal
     */
    private getActiveSwarms;
    /**
     * Get swarm health metrics.
     *
     * @param dal
     * @param _dal
     */
    private getSwarmHealthMetrics;
    /**
     * Search local knowledge base.
     *
     * @param query
     * @param domain
     * @param _query
     * @param _domain
     */
    private searchLocalKnowledgeBase;
    /**
     * Search swarm memory.
     *
     * @param query
     * @param dal
     * @param _query
     * @param _dal
     */
    private searchSwarmMemory;
    /**
     * Coordinate search across swarms.
     *
     * @param swarms
     * @param query
     * @param domain
     * @param confidence
     * @param _swarms
     * @param _query
     * @param _domain
     * @param _confidence
     */
    private coordinateSwarmSearch;
    /**
     * Get swarm workloads.
     *
     * @param dal
     */
    private getSwarmWorkloads;
}
export default HiveTools;
//# sourceMappingURL=hive-tools.d.ts.map