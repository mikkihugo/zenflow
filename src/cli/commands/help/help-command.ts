/**
 * Help Command Implementation
 *
 * Shows help for all commands or specific command help
 */

import { BaseCommand } from '../../core/base-command';
import type { CommandContext, CommandResult, CommandValidationResult } from '../../types/index';

interface CommandInfo {
  name: string;
  description: string;
  usage: string;
  category: string;
  aliases?: string[];
  examples?: string[];
  deprecated?: boolean;
}

export class HelpCommand extends BaseCommand {
  constructor() {
    super({
      name: 'help',
      description: 'Show help for commands',
      usage: 'claude-flow help [command] [options]',
      category: 'utility',
      minArgs: 0,
      maxArgs: 1,
      examples: [
        'claude-flow help',
        'claude-flow help init',
        'claude-flow help swarm start',
        'claude-flow help --category core',
      ],
      flags: {
        category: {
          type: 'string',
          description: 'Show commands in specific category',
        },
        all: {
          type: 'boolean',
          description: 'Show all commands including deprecated',
          default: false,
        },
        examples: {
          type: 'boolean',
          description: 'Show examples for all commands',
          default: false,
        },
        'no-color': {
          type: 'boolean',
          description: 'Disable colored output',
          default: false,
        },
      },
    });
  }

  protected async validate(context: CommandContext): Promise<CommandValidationResult | null> {
    const errors: string[] = [];
    const warnings: string[] = [];

    const category = context.flags.category as string;
    if (category) {
      const validCategories = ['core', 'swarm', 'config', 'utility', 'experimental'];
      if (!validCategories.includes(category)) {
        errors.push(
          `Invalid category '${category}'. Valid categories: ${validCategories.join(', ')}`
        );
      }
    }

    return errors.length > 0 || warnings.length > 0
      ? { valid: errors.length === 0, errors, warnings }
      : null;
  }

  protected async run(context: CommandContext): Promise<CommandResult> {
    try {
      const commandName = context.args[0];
      const category = context.flags.category as string;
      const showAll = (context.flags.all as boolean) || false;
      const showExamples = (context.flags.examples as boolean) || false;
      const noColor = (context.flags['no-color'] as boolean) || false;

      if (commandName) {
        // Show help for specific command
        const helpText = await this.getCommandHelp(commandName, noColor);
        return {
          success: true,
          exitCode: 0,
          message: helpText,
        };
      } else {
        // Show general help
        const helpText = await this.getGeneralHelp(category, showAll, showExamples, noColor);
        return {
          success: true,
          exitCode: 0,
          message: helpText,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to show help: ${error instanceof Error ? error.message : String(error)}`,
        exitCode: 1,
      };
    }
  }

  private async getCommandHelp(commandName: string, noColor: boolean): Promise<string> {
    // This would integrate with the command registry to get actual command help
    // For now, we'll provide help for our implemented commands

    const commands = this.getAvailableCommands();

    // Handle subcommands (e.g., "swarm start")
    const parts = commandName.split(' ');
    const mainCommand = parts[0];
    const subCommand = parts[1];

    const command = commands.find(
      (cmd) => cmd.name === mainCommand || (cmd.aliases && cmd.aliases.includes(mainCommand))
    );

    if (!command) {
      throw new Error(`Command '${commandName}' not found`);
    }

    let helpText = '';

    // Add colors if not disabled
    const colors = noColor
      ? {
          title: (text: string) => text,
          header: (text: string) => text,
          command: (text: string) => text,
          flag: (text: string) => text,
          example: (text: string) => text,
          description: (text: string) => text,
        }
      : {
          title: (text: string) => `\x1b[1m\x1b[36m${text}\x1b[0m`, // Bold cyan
          header: (text: string) => `\x1b[1m${text}\x1b[0m`, // Bold
          command: (text: string) => `\x1b[32m${text}\x1b[0m`, // Green
          flag: (text: string) => `\x1b[33m${text}\x1b[0m`, // Yellow
          example: (text: string) => `\x1b[90m${text}\x1b[0m`, // Dark gray
          description: (text: string) => text,
        };

    // Title
    helpText += colors.title(`Claude Flow - ${command.name.toUpperCase()} Command`);
    helpText += '\n' + '='.repeat(50) + '\n\n';

    // Description
    helpText += colors.description(command.description) + '\n\n';

    // Usage
    helpText += colors.header('USAGE:') + '\n';
    helpText += `  ${colors.command(command.usage)}\n\n`;

    // Get detailed help based on command
    if (mainCommand === 'swarm' && subCommand) {
      helpText += this.getSwarmSubcommandHelp(subCommand, colors);
    } else {
      helpText += this.getDetailedCommandHelp(mainCommand, colors);
    }

    // Examples
    if (command.examples && command.examples.length > 0) {
      helpText += colors.header('EXAMPLES:') + '\n';
      for (const example of command.examples) {
        helpText += `  ${colors.example(example)}\n`;
      }
      helpText += '\n';
    }

    // Aliases
    if (command.aliases && command.aliases.length > 0) {
      helpText += colors.header('ALIASES:') + '\n';
      helpText += `  ${command.aliases.join(', ')}\n\n`;
    }

    // Deprecation warning
    if (command.deprecated) {
      helpText += colors.header('⚠️  DEPRECATED:') + '\n';
      helpText += `  This command is deprecated and may be removed in future versions.\n\n`;
    }

    return helpText;
  }

  private async getGeneralHelp(
    category?: string,
    showAll?: boolean,
    showExamples?: boolean,
    noColor?: boolean
  ): Promise<string> {
    const colors = noColor
      ? {
          title: (text: string) => text,
          header: (text: string) => text,
          command: (text: string) => text,
          description: (text: string) => text,
          category: (text: string) => text,
          example: (text: string) => text,
        }
      : {
          title: (text: string) => `\x1b[1m\x1b[36m${text}\x1b[0m`,
          header: (text: string) => `\x1b[1m${text}\x1b[0m`,
          command: (text: string) => `\x1b[32m${text}\x1b[0m`,
          description: (text: string) => text,
          category: (text: string) => `\x1b[35m${text}\x1b[0m`,
          example: (text: string) => `\x1b[90m${text}\x1b[0m`,
        };

    let helpText = '';

    // Header
    helpText += colors.title('Claude Flow CLI') + '\n';
    helpText += '='.repeat(50) + '\n\n';

    helpText +=
      colors.description('A powerful swarm orchestration and neural coordination system') + '\n\n';

    // Usage
    helpText += colors.header('USAGE:') + '\n';
    helpText += `  ${colors.command('claude-flow <command> [options]')}\n\n`;

    // Global options
    helpText += colors.header('GLOBAL OPTIONS:') + '\n';
    helpText += '  -h, --help       Show help\n';
    helpText += '  -v, --version    Show version\n';
    helpText += '  --config <path>  Configuration file path\n';
    helpText += '  --debug          Enable debug mode\n';
    helpText += '  --verbose        Verbose output\n';
    helpText += '  --quiet          Quiet mode\n\n';

    // Commands by category
    const commands = this.getAvailableCommands();
    const categories = this.groupCommandsByCategory(commands, category, showAll);

    for (const [cat, categoryCommands] of Object.entries(categories)) {
      if (categoryCommands.length === 0) continue;

      helpText += colors.header(`${cat.toUpperCase()} COMMANDS:`) + '\n';

      for (const command of categoryCommands) {
        const nameAndAliases = command.aliases
          ? `${command.name} (${command.aliases.join(', ')})`
          : command.name;

        const deprecated = command.deprecated ? ' [DEPRECATED]' : '';
        helpText += `  ${colors.command(nameAndAliases.padEnd(20))} ${command.description}${deprecated}\n`;

        if (showExamples && command.examples && command.examples.length > 0) {
          helpText += `    ${colors.example('Example: ' + command.examples[0])}\n`;
        }
      }
      helpText += '\n';
    }

    // Additional sections
    helpText += colors.header('GETTING STARTED:') + '\n';
    helpText += `  1. Initialize a new project: ${colors.command('claude-flow init my-project')}\n`;
    helpText += `  2. Start a swarm:           ${colors.command('claude-flow swarm start')}\n`;
    helpText += `  3. Check status:            ${colors.command('claude-flow status')}\n`;
    helpText += `  4. Get help:                ${colors.command('claude-flow help <command>')}\n\n`;

    helpText += colors.header('LEARN MORE:') + '\n';
    helpText += '  Documentation: https://github.com/Ejb503/claude-flow\n';
    helpText += '  Issues:        https://github.com/Ejb503/claude-flow/issues\n';
    helpText += '  Examples:      https://github.com/Ejb503/claude-flow/tree/main/examples\n\n';

    helpText += `Use ${colors.command('claude-flow help <command>')} for detailed help on specific commands.\n`;

    return helpText;
  }

  private getAvailableCommands(): CommandInfo[] {
    return [
      {
        name: 'init',
        description: 'Initialize a new claude-flow project',
        usage: 'claude-flow init [project-name] [options]',
        category: 'core',
        examples: ['claude-flow init', 'claude-flow init my-project --template typescript'],
      },
      {
        name: 'status',
        description: 'Show swarm status and information',
        usage: 'claude-flow status [options]',
        category: 'core',
        examples: ['claude-flow status', 'claude-flow status --detailed'],
      },
      {
        name: 'swarm',
        description: 'Manage swarm operations',
        usage: 'claude-flow swarm <subcommand> [options]',
        category: 'swarm',
        examples: ['claude-flow swarm start', 'claude-flow swarm list'],
      },
      {
        name: 'help',
        description: 'Show help for commands',
        usage: 'claude-flow help [command] [options]',
        category: 'utility',
        aliases: ['h'],
        examples: ['claude-flow help', 'claude-flow help init'],
      },
    ];
  }

  private groupCommandsByCategory(
    commands: CommandInfo[],
    categoryFilter?: string,
    showAll?: boolean
  ): Record<string, CommandInfo[]> {
    const categories: Record<string, CommandInfo[]> = {
      core: [],
      swarm: [],
      config: [],
      utility: [],
      experimental: [],
    };

    for (const command of commands) {
      if (!showAll && command.deprecated) continue;
      if (categoryFilter && command.category !== categoryFilter) continue;

      if (!categories[command.category]) {
        categories[command.category] = [];
      }
      categories[command.category].push(command);
    }

    // Sort commands within each category
    for (const category of Object.keys(categories)) {
      categories[category].sort((a, b) => a.name.localeCompare(b.name));
    }

    return categories;
  }

  private getDetailedCommandHelp(commandName: string, colors: any): string {
    let helpText = '';

    switch (commandName) {
      case 'init':
        helpText += colors.header('OPTIONS:') + '\n';
        helpText += `  ${colors.flag('--template <template>')}  Project template (basic, typescript, javascript, node, browser)\n`;
        helpText += `  ${colors.flag('--force')}              Overwrite existing files\n`;
        helpText += `  ${colors.flag('--skip-install')}       Skip npm package installation\n`;
        helpText += `  ${colors.flag('--skip-git')}           Skip git repository initialization\n\n`;
        break;

      case 'status':
        helpText += colors.header('OPTIONS:') + '\n';
        helpText += `  ${colors.flag('--format <format>')}    Output format (table, json, yaml)\n`;
        helpText += `  ${colors.flag('--detailed')}           Show detailed status information\n`;
        helpText += `  ${colors.flag('--watch')}              Watch status changes in real-time\n`;
        helpText += `  ${colors.flag('--show-config')}        Include configuration in output\n`;
        helpText += `  ${colors.flag('--show-memory')}        Include memory statistics\n\n`;
        break;

      case 'swarm':
        helpText += colors.header('SUBCOMMANDS:') + '\n';
        helpText += `  ${colors.command('start')}    Start a new swarm\n`;
        helpText += `  ${colors.command('stop')}     Stop an existing swarm\n`;
        helpText += `  ${colors.command('list')}     List all swarms\n`;
        helpText += `  ${colors.command('status')}   Show swarm status\n\n`;
        helpText += `Use ${colors.command('claude-flow help swarm <subcommand>')} for detailed help.\n\n`;
        break;

      case 'help':
        helpText += colors.header('OPTIONS:') + '\n';
        helpText += `  ${colors.flag('--category <category>')} Show commands in specific category\n`;
        helpText += `  ${colors.flag('--all')}                Show all commands including deprecated\n`;
        helpText += `  ${colors.flag('--examples')}           Show examples for all commands\n`;
        helpText += `  ${colors.flag('--no-color')}           Disable colored output\n\n`;
        break;
    }

    return helpText;
  }

  private getSwarmSubcommandHelp(subCommand: string, colors: any): string {
    let helpText = '';

    switch (subCommand) {
      case 'start':
        helpText += colors.header('OPTIONS:') + '\n';
        helpText += `  ${colors.flag('--topology <type>')}     Swarm topology (mesh, hierarchical, ring, star)\n`;
        helpText += `  ${colors.flag('--agents <count>')}      Maximum number of agents\n`;
        helpText += `  ${colors.flag('--strategy <strategy>')} Execution strategy (balanced, parallel, sequential)\n`;
        helpText += `  ${colors.flag('--config <path>')}       Path to configuration file\n`;
        helpText += `  ${colors.flag('--dev-mode')}            Start in development mode\n`;
        helpText += `  ${colors.flag('--port <number>')}       Port for swarm communication\n\n`;
        break;

      case 'stop':
        helpText += colors.header('OPTIONS:') + '\n';
        helpText += `  ${colors.flag('--all')}                Stop all running swarms\n`;
        helpText += `  ${colors.flag('--force')}              Force stop without graceful shutdown\n`;
        helpText += `  ${colors.flag('--timeout <seconds>')}  Graceful shutdown timeout\n`;
        helpText += `  ${colors.flag('--save-state')}         Save swarm state before stopping\n\n`;
        break;

      case 'list':
        helpText += colors.header('OPTIONS:') + '\n';
        helpText += `  ${colors.flag('--format <format>')}    Output format (table, json, yaml)\n`;
        helpText += `  ${colors.flag('--status <status>')}    Filter by status\n`;
        helpText += `  ${colors.flag('--detailed')}           Show detailed information\n`;
        helpText += `  ${colors.flag('--show-history')}       Include stopped swarms\n\n`;
        break;

      default:
        helpText += `Unknown subcommand: ${subCommand}\n\n`;
    }

    return helpText;
  }

  getHelp(): string {
    return `Show help for commands

USAGE:
  claude-flow help [command] [options]

ARGUMENTS:
  [command]         Show help for specific command

OPTIONS:
  --category <cat>  Show commands in specific category (core, swarm, config, utility, experimental)
  --all            Show all commands including deprecated
  --examples       Show examples for all commands  
  --no-color       Disable colored output
  -h, --help       Show help

EXAMPLES:
  claude-flow help
  claude-flow help init
  claude-flow help swarm start
  claude-flow help --category core
  claude-flow help --all --examples

CATEGORIES:
  core          Essential commands (init, status)
  swarm         Swarm management commands
  config        Configuration commands
  utility       Utility commands (help, version)
  experimental  Experimental features

The help command provides comprehensive documentation for all CLI commands.
Use without arguments to see all available commands.
Use with a command name to see detailed help for that command.
`;
  }
}
