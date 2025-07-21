/**
 * Command execution engine - separated from argument parsing
 * Implements Google's single responsibility and dependency injection principles
 */

import { CommandExecutionError, ValidationError } from './cli-error.js';
import logger from './logger.js';
import configManager from './configuration-manager.js';

export class CommandExecutor {
  constructor(commandRegistry, options = {}) {
    this.commandRegistry = commandRegistry;
    this.logger = options.logger || logger.createChild('executor');
    this.config = options.config || configManager;
    this.timeout = options.timeout || 30000;
  }
  
  /**
   * Execute a command with proper error handling and logging
   */
  async executeCommand(commandName, subArgs = [], flags = {}, context = {}) {
    const startTime = Date.now();
    
    try {
      this.logger.debug(`Executing command: ${commandName}`, { 
        subArgs, 
        flags: Object.keys(flags),
        context 
      });
      
      // Validate command exists
      const command = this.commandRegistry.get(commandName);
      if (!command) {
        throw new ValidationError(`Unknown command: ${commandName}`);
      }
      
      // Create execution context
      const executionContext = {
        commandName,
        subArgs,
        flags,
        logger: this.logger.createChild(commandName),
        config: this.config,
        startTime,
        ...context
      };
      
      // Execute with timeout
      const result = await this.executeWithTimeout(
        () => command.handler(subArgs, flags, executionContext),
        this.timeout
      );
      
      const duration = Date.now() - startTime;
      this.logger.debug(`Command '${commandName}' completed successfully`, { 
        duration: `${duration}ms` 
      });
      
      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (error instanceof ValidationError || error instanceof CommandExecutionError) {
        // Re-throw CLI errors as-is
        this.logger.debug(`Command '${commandName}' failed`, { 
          error: error.message,
          duration: `${duration}ms`
        });
        throw error;
      }
      
      // Wrap unexpected errors
      this.logger.error(`Command '${commandName}' encountered unexpected error`, {
        error: error.message,
        stack: error.stack,
        duration: `${duration}ms`
      });
      
      throw new CommandExecutionError(
        `Command '${commandName}' failed: ${error.message}`,
        commandName,
        error
      );
    }
  }
  
  /**
   * Execute function with timeout
   */
  async executeWithTimeout(fn, timeoutMs) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new CommandExecutionError(`Command timed out after ${timeoutMs}ms`));
      }, timeoutMs);
      
      Promise.resolve(fn())
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timeoutId));
    });
  }
  
  /**
   * List available commands
   */
  listCommands(includeHidden = false) {
    const commands = [];
    
    for (const [name, command] of this.commandRegistry.entries()) {
      if (includeHidden || !command.hidden) {
        commands.push({
          name,
          description: command.description,
          usage: command.usage,
          examples: command.examples || []
        });
      }
    }
    
    return commands.sort((a, b) => a.name.localeCompare(b.name));
  }
  
  /**
   * Get command information
   */
  getCommandInfo(commandName) {
    const command = this.commandRegistry.get(commandName);
    if (!command) {
      return null;
    }
    
    return {
      name: commandName,
      description: command.description,
      usage: command.usage,
      examples: command.examples || [],
      details: command.details || null,
      customHelp: command.customHelp || false
    };
  }
  
  /**
   * Check if command exists
   */
  hasCommand(commandName) {
    return this.commandRegistry.has(commandName);
  }
  
  /**
   * Validate command arguments before execution
   */
  validateCommand(commandName, subArgs, flags) {
    const command = this.commandRegistry.get(commandName);
    if (!command) {
      throw new ValidationError(`Unknown command: ${commandName}`);
    }
    
    // Add custom validation logic here if needed
    // This can be extended to validate specific command requirements
    
    return true;
  }
}

/**
 * Create command executor with default dependencies
 */
export function createCommandExecutor(commandRegistry, options = {}) {
  return new CommandExecutor(commandRegistry, options);
}