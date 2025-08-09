import { CliCommandAdapter } from './adapters/cli-command-adapter';

/**
 * Advanced CLI Commands Handler
 *
 * Implements the advanced CLI commands while maintaining compatibility
 * with the existing terminal interface system. Uses adapter pattern
 * to avoid cross-interface dependencies.
 *
 * @example
 */
export class CLICommands {
  private commandAdapter: CliCommandAdapter;

  constructor() {
    this.commandAdapter = new CliCommandAdapter();
  }

  /**
   * Execute advanced CLI command
   *
   * @param commandName
   * @param args
   * @param options
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
   *
   * @param commandName
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
   *
   * @param command
   */
  getAdvancedCommandHelp(command?: string): string {
    return this.commandAdapter.getCommandHelp(command);
  }
}

export default AdvancedCLICommands;
