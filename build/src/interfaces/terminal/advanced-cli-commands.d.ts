/**
 * @file Advanced CLI Commands Integration.
 *
 * Provides advanced CLI command implementations that integrate with the existing.
 * command execution system. Uses shared abstractions to avoid cross-interface dependencies.
 */
import type { CommandResult } from '../shared/index.ts';
/**
 * Advanced CLI Commands Handler.
 *
 * Implements the advanced CLI commands while maintaining compatibility.
 * With the existing terminal interface system. Uses adapter pattern
 * to avoid cross-interface dependencies..
 *
 * @example
 */
export declare class AdvancedCLICommands {
    private commandAdapter;
    constructor();
    /**
     * Execute advanced CLI command.
     *
     * @param commandName
     * @param args
     * @param options
     */
    executeCommand(commandName: string, args: string[], options: any): Promise<CommandResult>;
    /**
     * Check if command is an advanced CLI command.
     *
     * @param commandName
     */
    isAdvancedCommand(commandName: string): boolean;
    /**
     * Get available commands.
     */
    getAvailableCommands(): string[];
    /**
     * Get help for advanced commands.
     *
     * @param command
     */
    getAdvancedCommandHelp(command?: string): string;
}
export default AdvancedCLICommands;
//# sourceMappingURL=advanced-cli-commands.d.ts.map