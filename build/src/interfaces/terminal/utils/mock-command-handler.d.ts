/**
 * Mock Command Handler - Delegates to Command Execution Engine.
 *
 * Thin wrapper around CommandExecutionEngine for backward compatibility.
 * Renamed to reflect its mock/testing nature per Google standards.
 */
/**
 * @file Interface implementation: mock-command-handler.
 */
export interface CommandResult {
    success: boolean;
    message?: string;
    data?: any;
    error?: string;
    timestamp?: Date;
}
export interface CommandContext {
    args: string[];
    flags: Record<string, any>;
    cwd: string;
    config?: any;
}
/**
 * Execute terminal commands with unified result handling.
 *
 * @example
 */
export declare class MockCommandHandler {
    /**
     * Execute init command.
     *
     * @param args
     * @param flags
     */
    static executeInit(args: string[], flags: Record<string, any>): Promise<CommandResult>;
    /**
     * Execute status command.
     *
     * @param _args
     * @param flags
     */
    static executeStatus(_args: string[], flags: Record<string, any>): Promise<CommandResult>;
    /**
     * Execute swarm command.
     *
     * @param args
     * @param flags
     */
    static executeSwarm(args: string[], flags: Record<string, any>): Promise<CommandResult>;
    /**
     * Execute MCP command.
     *
     * @param args
     * @param flags
     */
    static executeMCP(args: string[], flags: Record<string, any>): Promise<CommandResult>;
    /**
     * Execute workspace command.
     *
     * @param args
     * @param _flags
     */
    static executeWorkspace(args: string[], _flags: Record<string, any>): Promise<CommandResult>;
    /**
     * Execute any command - delegates to CommandExecutionEngine.
     *
     * @param command
     * @param args
     * @param flags
     */
    static executeCommand(command: string, args: string[], flags: Record<string, any>): Promise<CommandResult>;
}
//# sourceMappingURL=mock-command-handler.d.ts.map