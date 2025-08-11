/**
 * @file CLI Adapters for Terminal Interface.
 *
 * Provides terminal interface with access to CLI functionality without direct imports.
 * Uses adapter pattern to maintain interface separation.
 */
/**
 * Discover Command Adapter
 * Provides access to discover command functionality without direct CLI dependency.
 *
 * @example
 */
export class DiscoverCommandAdapter {
    name = 'discover';
    description = 'Discover and analyze project structure and capabilities';
    async execute(context) {
        try {
            // Dynamic import to avoid circular dependency
            const { DiscoverCommand } = await import('../../cli/commands/discover.ts');
            const discoverCommand = new DiscoverCommand();
            // Execute the discover command
            const result = (await discoverCommand.execute?.(context)) ||
                (await discoverCommand.run?.(context)) || { success: true, message: 'Discovery completed' };
            return result;
        }
        catch (error) {
            console.warn('Discover command execution failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Discovery failed',
                message: 'Could not execute discover command',
            };
        }
    }
}
/**
 * CLI Command Registry Adapter
 * Provides access to CLI commands through a safe interface.
 *
 * @example
 */
export class CLICommandRegistry {
    static instance;
    commands = new Map();
    constructor() {
        // Register available commands
        this.commands.set('discover', new DiscoverCommandAdapter());
    }
    static getInstance() {
        if (!CLICommandRegistry.instance) {
            CLICommandRegistry.instance = new CLICommandRegistry();
        }
        return CLICommandRegistry.instance;
    }
    async getCommand(name) {
        return this.commands.get(name) || null;
    }
    async executeCommand(name, context) {
        const command = await this.getCommand(name);
        if (!command) {
            return {
                success: false,
                error: `Command '${name}' not found`,
                message: `Available commands: ${Array.from(this.commands.keys()).join(', ')}`,
            };
        }
        return await command.execute(context);
    }
    getAvailableCommands() {
        return Array.from(this.commands.keys());
    }
}
