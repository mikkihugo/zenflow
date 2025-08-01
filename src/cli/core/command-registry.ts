/**
 * Command Registry
 * 
 * Manages command registration, discovery, and execution.
 * Supports dynamic command loading and plugin architecture.
 */

import { EventEmitter } from 'events';
import { readdir, stat } from 'fs/promises';
import { join, extname } from 'path';
import type {
  CommandConfig,
  CommandContext,
  CommandResult,
  CommandRegistry as ICommandRegistry,
  CommandMetadata,
  AsyncResult
} from '../types/index';
import { BaseCommand } from './base-command';

/**
 * Command registration entry
 */
interface CommandEntry extends CommandMetadata {
  command?: BaseCommand;
  loadTime: number;
  lastUsed?: number;
  usageCount: number;
}

/**
 * Command loading statistics
 */
interface LoadingStats {
  totalCommands: number;
  loadedCommands: number;
  failedCommands: number;
  loadTime: number;
  errors: Array<{ path: string; error: Error }>;
}

/**
 * Plugin interface for command extensions
 */
export interface CommandPlugin {
  name: string;
  version: string;
  commands: CommandConfig[];
  initialize?(): Promise<void> | void;
  dispose?(): Promise<void> | void;
}

/**
 * Command registry implementation
 */
export class CommandRegistry extends EventEmitter implements ICommandRegistry {
  private commands = new Map<string, CommandEntry>();
  private aliases = new Map<string, string>();
  private plugins = new Map<string, CommandPlugin>();
  private loadingPaths: string[] = [];
  private isInitialized = false;

  /**
   * Initialize the registry
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    this.emit('initializing');
    
    try {
      // Load plugins first
      await this.loadPlugins();
      
      // Then load commands from configured paths
      await this.loadCommands();
      
      this.isInitialized = true;
      this.emit('initialized', {
        commandCount: this.commands.size,
        pluginCount: this.plugins.size
      });
    } catch (error) {
      this.emit('initialization-error', error);
      throw error;
    }
  }

  /**
   * Register a command metadata
   */
  register(metadata: CommandMetadata): void {
    if (this.commands.has(metadata.config.name)) {
      throw new Error(`Command '${metadata.config.name}' is already registered`);
    }

    const entry: CommandEntry = {
      ...metadata,
      loadTime: Date.now(),
      usageCount: 0
    };

    this.commands.set(metadata.config.name, entry);

    // Register aliases
    if (metadata.config.aliases) {
      for (const alias of metadata.config.aliases) {
        if (this.aliases.has(alias)) {
          throw new Error(`Alias '${alias}' is already registered`);
        }
        this.aliases.set(alias, metadata.config.name);
      }
    }

    this.emit('command-registered', { name: metadata.config.name, metadata });
  }

  /**
   * Register a BaseCommand instance
   */
  registerCommand(command: BaseCommand): void {
    this.register(command.metadata);
    
    // Store the command instance for execution
    const entry = this.commands.get(command.metadata.config.name);
    if (entry) {
      entry.command = command;
    }
  }

  /**
   * Unregister a command
   */
  unregister(name: string): boolean {
    const entry = this.commands.get(name);
    if (!entry) {
      return false;
    }

    // Remove aliases
    if (entry.config.aliases) {
      for (const alias of entry.config.aliases) {
        this.aliases.delete(alias);
      }
    }

    // Dispose of command resources if it's a BaseCommand
    if (entry.command) {
      entry.command.dispose();
    }
    
    this.commands.delete(name);
    this.emit('command-unregistered', { name });
    
    return true;
  }

  /**
   * Get a command metadata by name or alias
   */
  get(name: string): CommandMetadata | undefined {
    // Check direct name first
    let entry = this.commands.get(name);
    
    // Check aliases if not found
    if (!entry) {
      const actualName = this.aliases.get(name);
      if (actualName) {
        entry = this.commands.get(actualName);
      }
    }

    return entry;
  }

  /**
   * Get a BaseCommand instance by name or alias
   */
  getCommand(name: string): BaseCommand | null {
    const entry = this.get(name) as CommandEntry;
    return entry?.command || null;
  }

  /**
   * Check if a command exists
   */
  has(name: string): boolean {
    return this.commands.has(name) || this.aliases.has(name);
  }

  /**
   * Get all registered commands metadata
   */
  list(): CommandMetadata[] {
    return Array.from(this.commands.values())
      .sort((a, b) => a.config.name.localeCompare(b.config.name));
  }

  /**
   * Get commands by category
   */
  findByCategory(category: string): CommandMetadata[] {
    return this.list().filter(cmd => cmd.config.category === category);
  }

  /**
   * Search commands by name, description, or category
   */
  search(query: string): CommandMetadata[] {
    const lowerQuery = query.toLowerCase();
    
    return this.list().filter(cmd => {
      return cmd.config.name.toLowerCase().includes(lowerQuery) ||
             cmd.config.description.toLowerCase().includes(lowerQuery) ||
             cmd.config.category?.toLowerCase().includes(lowerQuery);
    });
  }

  /**
   * Execute a command
   */
  async execute(name: string, context: CommandContext): Promise<CommandResult> {
    const entry = this.get(name) as CommandEntry;
    
    if (!entry) {
      return {
        success: false,
        error: `Command '${name}' not found`,
        exitCode: 127,
        executionTime: 0
      };
    }

    // Update usage statistics
    const actualName = this.aliases.get(name) || name;
    const commandEntry = this.commands.get(actualName);
    if (commandEntry) {
      commandEntry.lastUsed = Date.now();
      commandEntry.usageCount++;
    }

    this.emit('command-executing', { name, context });
    
    try {
      let result: CommandResult;

      // Execute using BaseCommand if available, otherwise use handler
      if (entry.command) {
        result = await entry.command.execute(context);
      } else if (entry.handler) {
        result = await entry.handler(context);
      } else {
        throw new Error(`No execution method available for command '${name}'`);
      }

      this.emit('command-executed', { name, result });
      return result;
    } catch (error) {
      const commandError = error instanceof Error ? error : new Error(String(error));
      this.emit('command-error', { name, error: commandError });
      
      return {
        success: false,
        error: commandError.message,
        exitCode: 1,
        executionTime: 0
      };
    }
  }

  /**
   * Add command loading path
   */
  addLoadingPath(path: string): void {
    if (!this.loadingPaths.includes(path)) {
      this.loadingPaths.push(path);
    }
  }

  /**
   * Remove command loading path
   */
  removeLoadingPath(path: string): void {
    const index = this.loadingPaths.indexOf(path);
    if (index > -1) {
      this.loadingPaths.splice(index, 1);
    }
  }

  /**
   * Load commands from configured paths
   */
  private async loadCommands(): Promise<LoadingStats> {
    const startTime = Date.now();
    const stats: LoadingStats = {
      totalCommands: 0,
      loadedCommands: 0,
      failedCommands: 0,
      loadTime: 0,
      errors: []
    };

    for (const loadingPath of this.loadingPaths) {
      try {
        await this.loadCommandsFromPath(loadingPath, stats);
      } catch (error) {
        stats.errors.push({
          path: loadingPath,
          error: error instanceof Error ? error : new Error(String(error))
        });
        stats.failedCommands++;
      }
    }

    stats.loadTime = Date.now() - startTime;
    this.emit('commands-loaded', stats);
    
    return stats;
  }

  /**
   * Load commands from a specific path
   */
  private async loadCommandsFromPath(path: string, stats: LoadingStats): Promise<void> {
    try {
      const pathStat = await stat(path);
      
      if (pathStat.isDirectory()) {
        const files = await readdir(path);
        
        for (const file of files) {
          const filePath = join(path, file);
          const fileExt = extname(file);
          
          if (['.js', '.ts'].includes(fileExt)) {
            await this.loadCommandFromFile(filePath, stats);
          }
        }
      } else if (['.js', '.ts'].includes(extname(path))) {
        await this.loadCommandFromFile(path, stats);
      }
    } catch (error) {
      stats.errors.push({
        path,
        error: error instanceof Error ? error : new Error(String(error))
      });
      stats.failedCommands++;
    }
  }

  /**
   * Load a command from a file
   */
  private async loadCommandFromFile(filePath: string, stats: LoadingStats): Promise<void> {
    try {
      stats.totalCommands++;
      
      // Dynamic import with proper error handling
      const module = await import(filePath);
      
      // Look for command exports
      const commandClass = module.default || module.Command;
      
      if (commandClass && typeof commandClass === 'function') {
        const command = new commandClass() as BaseCommand;
        
        if (command instanceof BaseCommand) {
          this.registerCommand(command);
          stats.loadedCommands++;
          this.emit('command-loaded', { path: filePath, name: command.getConfig().name });
        } else {
          throw new Error('Exported class is not a BaseCommand instance');
        }
      } else {
        throw new Error('No valid command export found');
      }
    } catch (error) {
      stats.errors.push({
        path: filePath,
        error: error instanceof Error ? error : new Error(String(error))
      });
      stats.failedCommands++;
      this.emit('command-load-error', { path: filePath, error });
    }
  }

  /**
   * Register a plugin
   */
  async registerPlugin(plugin: CommandPlugin): Promise<void> {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin '${plugin.name}' is already registered`);
    }

    try {
      // Initialize plugin if it has an initialize method
      if (plugin.initialize) {
        await plugin.initialize();
      }

      // Register plugin commands
      for (const commandConfig of plugin.commands) {
        // Create a dynamic command metadata from config
        const metadata: CommandMetadata = {
          config: commandConfig,
          handler: async (context: CommandContext): Promise<CommandResult> => {
            // This is a placeholder - real plugins would provide actual handlers
            return {
              success: true,
              message: `Dynamic command '${commandConfig.name}' executed`,
              exitCode: 0
            };
          },
          registeredAt: new Date(),
          available: true,
          plugin: plugin.name
        };
        
        this.register(metadata);
      }

      this.plugins.set(plugin.name, plugin);
      this.emit('plugin-registered', { name: plugin.name, version: plugin.version });
    } catch (error) {
      this.emit('plugin-error', { name: plugin.name, error });
      throw error;
    }
  }

  /**
   * Unregister a plugin
   */
  async unregisterPlugin(name: string): Promise<boolean> {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      return false;
    }

    try {
      // Unregister plugin commands
      for (const commandConfig of plugin.commands) {
        this.unregister(commandConfig.name);
      }

      // Dispose plugin if it has a dispose method
      if (plugin.dispose) {
        await plugin.dispose();
      }

      this.plugins.delete(name);
      this.emit('plugin-unregistered', { name });
      
      return true;
    } catch (error) {
      this.emit('plugin-error', { name, error });
      throw error;
    }
  }

  /**
   * Load plugins from configuration
   */
  private async loadPlugins(): Promise<void> {
    // This would load plugins from configuration files or plugin directories
    // For now, this is a placeholder
    this.emit('plugins-loaded', { count: 0 });
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): Array<{ name: string; usageCount: number; lastUsed?: number }> {
    return Array.from(this.commands.entries()).map(([name, entry]) => ({
      name,
      usageCount: entry.usageCount,
      lastUsed: entry.lastUsed
    }));
  }

  /**
   * Clear all commands and plugins
   */
  async clear(): Promise<void> {
    // Unregister all plugins
    for (const pluginName of this.plugins.keys()) {
      await this.unregisterPlugin(pluginName);
    }

    // Unregister all commands
    for (const commandName of this.commands.keys()) {
      this.unregister(commandName);
    }

    this.aliases.clear();
    this.isInitialized = false;
    
    this.emit('cleared');
  }

  /**
   * Get registry status
   */
  getStatus(): {
    initialized: boolean;
    commandCount: number;
    pluginCount: number;
    aliasCount: number;
    loadingPaths: string[];
  } {
    return {
      initialized: this.isInitialized,
      commandCount: this.commands.size,
      pluginCount: this.plugins.size,
      aliasCount: this.aliases.size,
      loadingPaths: [...this.loadingPaths]
    };
  }

  /**
   * Dispose of registry resources
   */
  async dispose(): Promise<void> {
    await this.clear();
    this.removeAllListeners();
    this.loadingPaths.length = 0;
  }
}