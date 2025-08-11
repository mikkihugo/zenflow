/**
 * CLI Command Adapter for Terminal Interface.
 *
 * This adapter provides terminal interface access to CLI functionality.
 * Without creating cross-interface dependencies. It implements the
 * CommandExecutorContract using shared abstractions.
 */
/**
 * @file Cli-command adapter implementation.
 */
import type { CommandContext, CommandExecutorContract, CommandResult } from '../shared/index';
/**
 * CLI Command Adapter.
 *
 * Adapts CLI functionality for use in terminal interface while.
 * Maintaining interface isolation through shared contracts..
 *
 * @example
 */
export declare class CliCommandAdapter implements CommandExecutorContract {
    /**
     * Execute a command with the given context.
     *
     * @param context
     */
    executeCommand(context: CommandContext): Promise<CommandResult>;
    /**
     * Check if command is valid.
     *
     * @param command
     */
    isValidCommand(command: string): boolean;
    /**
     * Get help for commands.
     *
     * @param command
     */
    getCommandHelp(command?: string): string;
    /**
     * Get list of available commands.
     */
    getAvailableCommands(): string[];
    /**
     * Handle project creation.
     *
     * @param args
     * @param options
     */
    private handleCreateProject;
    /**
     * Handle project optimization.
     *
     * @param args
     * @param _options
     */
    private handleOptimizeProject;
    /**
     * Handle project status.
     *
     * @param args
     * @param _options
     */
    private handleProjectStatus;
    /**
     * Handle swarm commands.
     *
     * @param args
     * @param options
     */
    private handleSwarmCommand;
    /**
     * Handle generate commands.
     *
     * @param args
     * @param options
     */
    private handleGenerateCommand;
    /**
     * Handle test commands.
     *
     * @param _args
     * @param _options
     */
    private handleTestCommand;
    /**
     * Handle performance commands.
     *
     * @param _args
     * @param _options
     */
    private handlePerformanceCommand;
    /**
     * Parse domains from string.
     *
     * @param domainsStr
     */
    private parseDomains;
    /**
     * Get general help.
     */
    private getGeneralHelp;
    /**
     * Get create command help.
     */
    private getCreateHelp;
    /**
     * Get swarm command help.
     */
    private getSwarmHelp;
    /**
     * Get generate command help.
     */
    private getGenerateHelp;
}
//# sourceMappingURL=cli-command-adapter.d.ts.map