/**
 * @fileoverview Advanced CLI Commands Integration
 *
 * Provides advanced CLI command implementations that integrate with the existing
 * command execution system. Uses shared abstractions to avoid cross-interface dependencies.
 */

import type { CommandContext, CommandResult } from '../shared/index';
import { CliCommandAdapter } from './adapters/cli-command-adapter';

/**
 * Advanced CLI Commands Handler
 *
 * Implements the advanced CLI commands while maintaining compatibility
 * with the existing terminal interface system. Uses adapter pattern
 * to avoid cross-interface dependencies.
 */
export class AdvancedCLICommands {
  private commandAdapter: CliCommandAdapter;

  constructor() {
    this.commandAdapter = new CliCommandAdapter();
  }

  /**
   * Execute advanced CLI command
   */
  async executeCommand(commandName: string, args: string[], options: any): Promise<CommandResult> {
    const context: CommandContext = {
      command: commandName,
      args,
      options,
      workingDirectory: process.cwd(),
    };

    return await this.commandAdapter.executeCommand(context);
  }

  /**
   * Check if command is an advanced CLI command
   */
  isAdvancedCommand(commandName: string): boolean {
    return this.commandAdapter.isValidCommand(commandName);
  }

  /**
   * Get available commands
   */
  getAvailableCommands(): string[] {
    return this.commandAdapter.getAvailableCommands();
  }

  /**
   * Get help for advanced commands
   */
  getAdvancedCommandHelp(command?: string): string {
    return this.commandAdapter.getCommandHelp(command);
  }
}

export default AdvancedCLICommands;
