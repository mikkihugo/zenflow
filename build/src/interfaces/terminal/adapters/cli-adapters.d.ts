/**
 * @file CLI Adapters for Terminal Interface.
 *
 * Provides terminal interface with access to CLI functionality without direct imports.
 * Uses adapter pattern to maintain interface separation.
 */
import type { CommandResult, DiscoverCommandInterface, ExecutionContext } from '../../shared/command-interfaces.ts';
/**
 * Discover Command Adapter
 * Provides access to discover command functionality without direct CLI dependency.
 *
 * @example
 */
export declare class DiscoverCommandAdapter implements DiscoverCommandInterface {
    name: string;
    description: string;
    execute(context: ExecutionContext): Promise<CommandResult>;
}
/**
 * CLI Command Registry Adapter
 * Provides access to CLI commands through a safe interface.
 *
 * @example
 */
export declare class CLICommandRegistry {
    private static instance;
    private commands;
    private constructor();
    static getInstance(): CLICommandRegistry;
    getCommand(name: string): Promise<DiscoverCommandInterface | null>;
    executeCommand(name: string, context: ExecutionContext): Promise<CommandResult>;
    getAvailableCommands(): string[];
}
//# sourceMappingURL=cli-adapters.d.ts.map