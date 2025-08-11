/**
 * SPARC-Swarm Integration Example.
 *
 * Demonstrates the complete integration of SPARC methodology with swarm coordination.
 * In the database-driven product flow system.
 */
/**
 * @file Coordination system: sparc-swarm-integration-example.
 */
/**
 * Complete Integration Example.
 *
 * Shows the flow:
 * 1. Database-driven product flow creates Features/Tasks
 * 2. Features/Tasks are assigned to SPARC swarm
 * 3. SPARC methodology is applied by coordinated agents
 * 4. Results are stored back in database.
 *
 * @example
 */
export declare class SPARCSwarmIntegrationExample {
    private databaseSystem;
    private sparcSwarm;
    private bridge;
    private taskCoordinator;
    constructor();
    /**
     * Run complete integration demonstration.
     */
    runIntegrationDemo(): Promise<void>;
    /**
     * Step 1: Initialize all systems.
     */
    private initializeSystems;
    /**
     * Step 2: Create demo workspace with product flow.
     */
    private createDemoWorkspace;
    /**
     * Step 3: Create demo feature using database-driven system.
     *
     * @param workspaceId
     */
    private createDemoFeature;
    /**
     * Step 4: Assign feature to SPARC swarm.
     *
     * @param feature
     */
    private assignFeatureToSparc;
    /**
     * Step 5: Demonstrate task coordination with SPARC.
     *
     * @param feature
     */
    private demonstrateTaskCoordination;
    /**
     * Step 6: Monitor and report results.
     *
     * @param assignmentId
     * @param _assignmentId
     */
    private monitorResults;
    /**
     * Get integration status summary.
     */
    getIntegrationStatus(): Promise<{
        databaseSystem: boolean;
        sparcSwarm: boolean;
        bridge: boolean;
        taskCoordination: boolean;
    }>;
}
/**
 * Run the integration example.
 *
 * @example
 */
export declare function runSPARCSwarmIntegrationExample(): Promise<void>;
//# sourceMappingURL=sparc-swarm-integration-example.d.ts.map