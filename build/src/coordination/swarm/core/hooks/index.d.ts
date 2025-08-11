/**
 * @file Claude Code Hooks Implementation for ruv-swarm - provides automated coordination, formatting, and learning capabilities.
 */
import type { AgentMemoryCoordinationDao } from '../../../../database';
type SwarmPersistence = AgentMemoryCoordinationDao;
declare class ZenSwarmHooks {
    sessionData: any;
    persistence: SwarmPersistence | null;
    private _sessionId?;
    constructor();
    /**
     * Initialize persistence layer with error handling.
     */
    initializePersistence(): Promise<void>;
    /**
     * Main hook handler - routes to specific hook implementations.
     *
     * @param hookType
     * @param args
     */
    handleHook(hookType: string, args: any[]): Promise<any>;
    /**
     * Pre-search hook - Prepare cache and optimize search.
     *
     * @param args
     */
    preSearchHook(args: any): Promise<{
        continue: boolean;
        cached: boolean;
        cacheHit: any;
        metadata: {
            pattern: any;
            cached: boolean;
            cacheReady?: never;
        };
        reason?: never;
    } | {
        continue: boolean;
        reason: string;
        metadata: {
            pattern: any;
            cacheReady: boolean;
            cached?: never;
        };
        cached?: never;
        cacheHit?: never;
    }>;
    /**
     * Pre-MCP hook - Validate MCP tool state.
     *
     * @param args
     */
    preMcpHook(args: any): Promise<{
        continue: boolean;
        warning: string;
        autoInit: boolean;
        reason?: never;
        metadata?: never;
    } | {
        continue: boolean;
        reason: string;
        metadata: {
            tool: any;
            state: string;
        };
        warning?: never;
        autoInit?: never;
    }>;
    /**
     * Pre-edit hook - Ensure coordination before file modifications.
     *
     * @param args
     */
    preEditHook(args: any): Promise<{
        continue: boolean;
        reason: string;
        suggestion: string;
        metadata?: never;
    } | {
        continue: boolean;
        reason: string;
        metadata: {
            agent_id: any;
            agent_type: string;
            cognitive_pattern: any;
            readiness: any;
        };
        suggestion?: never;
    }>;
    /**
     * Pre-task hook - Auto-spawn agents and optimize topology.
     *
     * @param args
     */
    preTaskHook(args: any): Promise<{
        continue: boolean;
        reason: string;
        metadata: {
            complexity: any;
            topology: string;
            agentsReady: boolean;
            estimatedDuration: number;
        };
    }>;
    /**
     * Post-edit hook - Format and learn from edits.
     *
     * @param args
     */
    postEditHook(args: any): Promise<any>;
    /**
     * Post-task hook - Analyze performance and update coordination.
     *
     * @param args
     */
    postTaskHook(args: any): Promise<{
        continue: boolean;
        performance: any;
        metadata: {
            taskId: any;
            optimized: boolean;
        };
    }>;
    /**
     * Post-web-search hook - Analyze results and update knowledge.
     *
     * @param args
     */
    postWebSearchHook(args: any): Promise<{
        continue: boolean;
        reason: string;
        metadata: {
            query: any;
            patternsExtracted: number;
            knowledgeUpdated: any;
        };
    }>;
    /**
     * Post-web-fetch hook - Extract patterns and cache content.
     *
     * @param args
     */
    postWebFetchHook(args: any): Promise<{
        continue: boolean;
        patterns: string[];
        cached: boolean;
    }>;
    /**
     * Notification hook - Handle notifications with swarm status.
     *
     * @param args
     */
    notificationHook(args: any): Promise<{
        continue: boolean;
        notification: any;
        handled: boolean;
    }>;
    /**
     * Pre-bash hook - Validate commands before execution.
     *
     * @param args
     */
    preBashHook(args: any): Promise<{
        continue: boolean;
        reason: string | undefined;
        riskLevel: string | undefined;
        metadata?: never;
    } | {
        continue: boolean;
        reason: string;
        metadata: {
            estimatedDuration: any;
            requiresAgent: any;
        };
        riskLevel?: never;
    }>;
    /**
     * MCP swarm initialized hook - Persist configuration.
     *
     * @param args
     */
    mcpSwarmInitializedHook(args: any): Promise<{
        continue: boolean;
        reason: string;
        metadata: {
            id: any;
            topology: any;
            initialized: number;
            monitoring: any;
        };
    }>;
    /**
     * MCP agent spawned hook - Update roster and train.
     *
     * @param args
     */
    mcpAgentSpawnedHook(args: any): Promise<{
        continue: boolean;
        agentId: any;
        type: any;
        specialized: boolean;
    }>;
    /**
     * MCP task orchestrated hook - Monitor and optimize.
     *
     * @param args
     */
    mcpTaskOrchestratedHook(args: any): Promise<{
        continue: boolean;
        taskId: any;
        optimization: {
            taskId: any;
            strategy: string;
            agentAllocation: any;
            parallelization: any;
        };
        monitoring?: never;
    } | {
        continue: boolean;
        taskId: any;
        monitoring: any;
        optimization?: never;
    }>;
    /**
     * MCP neural trained hook - Save improvements.
     *
     * @param args
     */
    mcpNeuralTrainedHook(args: any): Promise<{
        continue: boolean;
        improvement: number;
        saved: boolean;
        patternsUpdated: boolean;
    }>;
    /**
     * Agent complete hook - Commit to git with detailed report.
     */
    /**
     * Extract key points from output.
     *
     * @param output
     */
    extractKeyPoints(output: string): string;
    /**
     * Extract bullet points for commit message.
     *
     * @param output
     */
    extractBulletPoints(output: string): string;
    /**
     * Get count of modified files.
     */
    getModifiedFilesCount(): number;
    /**
     * Get list of modified files.
     */
    getModifiedFilesList(): string;
    /**
     * Session restore hook - Load previous state.
     *
     * @param args
     */
    sessionRestoreHook(args: any): Promise<{
        continue: boolean;
        restored: {
            memory: boolean;
            agents: boolean;
            metrics: boolean;
        };
    }>;
    /**
     * Session end hook - Generate summary and persist state.
     *
     * @param args
     */
    sessionEndHook(args: any): Promise<{
        continue: boolean;
        files: any;
        summary: {
            duration: number;
            operations: any;
            improvements: any;
        };
    }>;
    getAgentTypeForFile(extension: string): string;
    checkSwarmStatus(): Promise<any>;
    ensureAgent(type: string): Promise<any>;
    getCognitivePattern(agentType: string): string;
    autoFormatFile(filePath: string): Promise<{
        success: boolean;
        reason?: string;
        details?: any;
    }>;
    trainPatternsFromEdit(filePath: string): Promise<any>;
    validateCommandSafety(command: string): {
        safe: boolean;
        reason?: string;
        riskLevel?: string;
    };
    estimateCommandResources(command: string): any;
    generateSessionSummary(): string;
    captureSwarmState(): any;
    calculateSessionMetrics(): any;
    formatDuration(ms: number): string;
    analyzeTaskComplexity(description: string): any;
    selectOptimalTopology(complexity: any): string;
    determineRequiredAgents(description: any, complexity: any): string[];
    updateKnowledgeGraph(file: string, operation: string): Promise<void>;
    calculateEfficiency(performance: any): any;
    identifyBottlenecks(performance: any): Array<{
        type: string;
        severity: string;
        description: string;
        recommendation: string;
    }>;
    suggestImprovements(performance: any): Array<{
        area: string;
        suggestion: string;
        expectedImprovement: string;
    }>;
    updateCoordinationStrategy(performance: any): void;
    extractSearchPatterns(query: any): string[];
    updateKnowledgeBase(type: string, data: any): Promise<void>;
    extractUrlPatterns(url: any): string[];
    getSwarmStatus(): Promise<any>;
    sendTelemetry(event: string, data: any): void;
    getSpecializationForType(type: string): string[];
    generateSpecializationPatterns(type: string): string[];
    generateMockWeights(): any;
    optimizeAgentAllocation(_taskId: string): any;
    calculateParallelization(_taskId: string): any;
    getFileType(filePath: string): string;
    getCurrentAgent(): string;
    findRelatedFiles(filePath: any): Promise<string[]>;
    /**
     * 🔧 CRITICAL FIX: Store notification in database for cross-agent access.
     *
     * @param notification
     */
    storeNotificationInDatabase(notification: any): Promise<void>;
    /**
     * 🔧 CRITICAL FIX: Retrieve notifications from database for cross-agent access.
     *
     * @param agentId
     * @param type
     */
    getNotificationsFromDatabase(agentId?: string | null, type?: string | null): Promise<any[]>;
    /**
     * 🔧 CRITICAL FIX: Enhanced agent completion with database coordination.
     *
     * @param args
     */
    agentCompleteHook(args: any): Promise<{
        continue: boolean;
        stored: boolean;
        agent: any;
    }>;
    /**
     * Get current session ID for coordination.
     */
    getSessionId(): string;
    /**
     * 🔧 CRITICAL FIX: Cross-agent memory retrieval for coordinated decisions.
     *
     * @param key
     * @param agentId
     */
    getSharedMemory(key: string, agentId?: string | null): Promise<any>;
    /**
     * 🔧 CRITICAL FIX: Cross-agent memory storage for coordinated decisions.
     *
     * @param key
     * @param value
     * @param agentId
     */
    setSharedMemory(key: string, value: any, agentId?: string | null): Promise<void>;
}
declare const hooksInstance: ZenSwarmHooks;
export declare const handleHook: (hookType: string, options: any[]) => Promise<any>;
export default hooksInstance;
//# sourceMappingURL=index.d.ts.map