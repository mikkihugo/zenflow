/**
 * Legacy CLI Command Registry (Stub)
 * 
 * This is a compatibility stub for legacy CLI command registry tests.
 * The actual terminal interface uses Ink-based TUI components.
 * 
 * For real terminal interfaces, see:
 * - /src/interfaces/terminal/ (Ink-based TUI)
 * - /src/interfaces/tui/ (Terminal UI components)
 */

import { BaseCommand, CommandConfig, CommandContext, CommandResult } from './base-command';

export interface RegistryOptions {
  autoLoad?: boolean;
  commandsPath?: string;
  enableDiscovery?: boolean;
}

export interface CommandInfo {
  name: string;
  description: string;
  available: boolean;
  aliases?: string[];
}

/**
 * Legacy CLI Command Registry (Stub Implementation)
 * 
 * NOTE: This is a stub for testing legacy command registry patterns.
 * Real terminal interactions should use the Ink-based TUI system:
 * 
 * @see /src/interfaces/terminal/interactive-terminal-application.tsx
 * @see /src/interfaces/terminal/screens/ (for actual screens)
 * @see /src/interfaces/tui/ (for TUI components)
 */
export class CommandRegistry {
  private commands: Map<string, BaseCommand> = new Map();
  private aliases: Map<string, string> = new Map();
  private listeners: Map<string, Function[]> = new Map();

  constructor(private options: RegistryOptions = {}) {}

  /**
   * Register a command instance
   */
  register(command: BaseCommand): void {
    const name = command.config.name;
    this.commands.set(name, command);
    this.emit('command-registered', { name, command });
  }

  /**
   * Register a command by configuration
   */
  registerCommand(config: CommandConfig, handler: (context: CommandContext) => Promise<CommandResult>): void {
    const command = new (class extends BaseCommand {
      constructor() { super(config); }
      protected async run(context: CommandContext): Promise<CommandResult> {
        return handler(context);
      }
      getHelp(): string {
        return config.description;
      }
    })();
    
    this.register(command);
  }

  /**
   * Unregister a command
   */
  unregister(name: string): boolean {
    const existed = this.commands.has(name);
    if (existed) {
      this.commands.delete(name);
      this.emit('command-unregistered', { name });
    }
    return existed;
  }

  /**
   * Execute a command by name
   */
  async execute(name: string, context: CommandContext): Promise<CommandResult> {
    const commandName = this.resolveAlias(name);
    const command = this.commands.get(commandName);

    if (!command) {
      return {
        success: false,
        error: `Command '${name}' not found`,
        exitCode: 1,
        executionTime: 0,
      };
    }

    this.emit('command-executing', { name: commandName, context });
    
    try {
      const result = await command.execute(context);
      this.emit('command-executed', { name: commandName, result });
      return result;
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        exitCode: 1,
        executionTime: 0,
      };
      this.emit('command-error', { name: commandName, error });
      return errorResult;
    }
  }

  /**
   * Check if a command exists
   */
  has(name: string): boolean {
    return this.commands.has(this.resolveAlias(name));
  }

  /**
   * Get command by name
   */
  get(name: string): BaseCommand | undefined {
    return this.commands.get(this.resolveAlias(name));
  }

  /**
   * Get all registered commands
   */
  getAll(): CommandInfo[] {
    return Array.from(this.commands.values()).map(command => ({
      name: command.config.name,
      description: command.config.description,
      available: true,
    }));
  }

  /**
   * Get list of command names
   */
  list(): string[] {
    return Array.from(this.commands.keys());
  }

  /**
   * Register command alias
   */
  alias(alias: string, commandName: string): void {
    this.aliases.set(alias, commandName);
    this.emit('alias-registered', { alias, commandName });
  }

  /**
   * Remove command alias
   */
  removeAlias(alias: string): boolean {
    const existed = this.aliases.has(alias);
    if (existed) {
      this.aliases.delete(alias);
      this.emit('alias-removed', { alias });
    }
    return existed;
  }

  /**
   * Resolve alias to command name
   */
  private resolveAlias(name: string): string {
    return this.aliases.get(name) || name;
  }

  /**
   * Load commands from directory (stub implementation)
   */
  async loadFromDirectory(path: string): Promise<number> {
    this.emit('loading-started', { path });
    
    // Stub implementation - in real system, would scan directory
    // for command files and load them
    
    const loadedCount = 0; // No actual loading in stub
    this.emit('loading-completed', { path, count: loadedCount });
    return loadedCount;
  }

  /**
   * Auto-discover and load commands (stub implementation)
   */
  async discover(): Promise<number> {
    if (!this.options.enableDiscovery) {
      return 0;
    }

    const commandsPath = this.options.commandsPath || './commands';
    return this.loadFromDirectory(commandsPath);
  }

  /**
   * Clear all commands and aliases
   */
  clear(): void {
    const commandCount = this.commands.size;
    const aliasCount = this.aliases.size;
    
    this.commands.clear();
    this.aliases.clear();
    
    this.emit('registry-cleared', { commandCount, aliasCount });
  }

  /**
   * Get registry statistics
   */
  getStats(): { commands: number; aliases: number } {
    return {
      commands: this.commands.size,
      aliases: this.aliases.size,
    };
  }

  /**
   * Event emitter methods
   */
  on(event: string, listener: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  emit(event: string, ...args: any[]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => listener(...args));
    }
  }

  removeAllListeners(): void {
    this.listeners.clear();
  }

  listenerCount(event: string): number {
    return this.listeners.get(event)?.length || 0;
  }

  dispose(): void {
    this.removeAllListeners();
    this.clear();
  }
}