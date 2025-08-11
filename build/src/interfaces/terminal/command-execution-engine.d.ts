/**
 * @file Command Execution Engine - Pure TypeScript command processing.
 *
 * Handles command execution logic without React dependencies.
 * Separates business logic from UI rendering concerns following Google standards.
 */
export interface CommandResult {
    success: boolean;
    message?: string;
    data?: any;
    error?: string;
    duration?: number;
    metadata?: {
        command: string;
        args: string[];
        flags: Record<string, any>;
        timestamp: string;
    };
}
export interface ExecutionContext {
    args: string[];
    flags: Record<string, any>;
    cwd: string;
    environment?: Record<string, string>;
    timeout?: number;
}
/**
 * Pure TypeScript command execution engine.
 * No React dependencies - focused on business logic.
 *
 * @example
 */
export declare class CommandExecutionEngine {
    private static readonly SUPPORTED_COMMANDS;
    /**
     * Execute command with full context and error handling.
     *
     * @param command
     * @param args
     * @param flags
     * @param context
     */
    static executeCommand(command: string, args: string[], flags: Record<string, any>, context?: Partial<ExecutionContext>): Promise<CommandResult>;
    /**
     * Handle init command - project initialization.
     *
     * @param context
     */
    private static handleInitCommand;
    /**
     * Handle status command - system status.
     *
     * @param context
     */
    private static handleStatusCommand;
    /**
     * Handle swarm command - swarm management.
     *
     * @param context
     */
    private static handleSwarmCommand;
    /**
     * Handle MCP command - MCP server operations.
     *
     * @param context
     */
    private static handleMcpCommand;
    /**
     * Handle workspace command - document-driven development.
     *
     * @param context
     */
    private static handleWorkspaceCommand;
    /**
     * Handle discover command - neural auto-discovery system.
     *
     * @param context
     */
    private static handleDiscoverCommand;
    /**
     * Fallback discover implementation when enhanced version fails.
     *
     * @param projectPath
     * @param options
     */
    private static handleDiscoverFallback;
    /**
     * Handle help command.
     *
     * @param _context
     */
    private static handleHelpCommand;
    /**
     * Swarm management sub-handlers.
     *
     * @param context
     */
    private static handleSwarmStart;
    private static handleSwarmStop;
    private static handleSwarmList;
    /**
     * Call MCP tool via stdio protocol.
     *
     * @param toolName
     * @param params
     */
    private static callMcpTool;
    private static handleSwarmStatus;
    private static handleSwarmCreate;
    /**
     * Handle swarm init command - initialize new swarm coordination.
     *
     * @param context
     */
    private static handleSwarmInit;
    /**
     * Handle swarm spawn command - spawn new agent.
     *
     * @param context
     */
    private static handleSwarmSpawn;
    /**
     * Handle swarm monitor command - real-time swarm monitoring.
     *
     * @param context
     * @param _context
     */
    private static handleSwarmMonitor;
    /**
     * Handle swarm metrics command - agent metrics.
     *
     * @param context
     * @param _context
     */
    private static handleSwarmMetrics;
    /**
     * Handle swarm orchestrate command - task orchestration.
     *
     * @param context
     */
    private static handleSwarmOrchestrate;
    /**
     * Handle hive query command.
     *
     * @param context
     */
    private static handleHiveQuery;
    /**
     * Handle hive agents command.
     *
     * @param _context
     */
    private static handleHiveAgents;
    /**
     * Handle hive tasks command.
     *
     * @param context
     */
    private static handleHiveTasks;
    /**
     * Handle hive knowledge command.
     *
     * @param _context
     */
    private static handleHiveKnowledge;
    /**
     * Handle hive sync command.
     *
     * @param context
     */
    private static handleHiveSync;
    /**
     * Handle hive health command.
     *
     * @param _context
     */
    private static handleHiveHealth;
    /**
     * Handle hive contribute command.
     *
     * @param context
     */
    private static handleHiveContribute;
    /**
     * Utility methods.
     *
     * @param error
     * @param command
     * @param args
     * @param flags
     * @param startTime
     */
    private static createErrorResult;
    private static generateProjectStructure;
    private static simulateAsyncOperation;
}
export default CommandExecutionEngine;
//# sourceMappingURL=command-execution-engine.d.ts.map