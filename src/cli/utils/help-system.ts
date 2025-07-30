/**
 * Help System - TypeScript Edition
 * Comprehensive help generation and display system with rich formatting
 */

import { 
  HelpSystem as IHelpSystem,
  CommandDefinition,
  CommandRegistry,
  CommandCategory,
  HelpOptions
} from '../../types/cli';
import { colorize, getIcon, createBox, wrapText, formatTable } from './output-formatter';

// =============================================================================
// HELP SYSTEM IMPLEMENTATION
// =============================================================================

export class TypeScriptHelpSystem implements IHelpSystem {
  private defaultOptions: HelpOptions = {
    includeExamples: true,
    includeFlags: true,
    includeAliases: true,
    colorize: process.stdout.isTTY,
    width: Math.min(process.stdout.columns || 80, 120)
  };

  generateCommandHelp(definition: CommandDefinition, options?: Partial<HelpOptions>): string {
    const opts = { ...this.defaultOptions, ...options };
    let help = '';

    // Command header
    const title = `${definition.name} - ${definition.description}`;
    help += this.colorizeText(title, 'bright', opts.colorize) + '\n\n';

    // Usage section
    help += this.colorizeText('USAGE:', 'cyan', opts.colorize) + '\n';
    help += `  ${definition.usage}\n\n`;

    // Category and metadata
    help += this.colorizeText('CATEGORY:', 'cyan', opts.colorize) + '\n';
    help += `  ${this.formatCategory(definition.category)}\n\n`;

    // Aliases
    if (opts.includeAliases && definition.aliases && definition.aliases.length > 0) {
      help += this.colorizeText('ALIASES:', 'cyan', opts.colorize) + '\n';
      help += `  ${definition.aliases.join(', ')}\n\n`;
    }

    // Arguments section
    if (definition.args && definition.args.length > 0) {
      help += this.colorizeText('ARGUMENTS:', 'cyan', opts.colorize) + '\n';
      for (const arg of definition.args) {
        const required = arg.required ? this.colorizeText(' (required)', 'red', opts.colorize) : '';
        const variadic = arg.variadic ? this.colorizeText(' (variadic)', 'yellow', opts.colorize) : '';
        help += `  ${this.colorizeText(arg.name, 'bright', opts.colorize)}${required}${variadic}\n`;
        help += `    ${arg.description}\n`;
        if (arg.type !== 'string') {
          help += `    Type: ${arg.type}\n`;
        }
      }
      help += '\n';
    }

    // Flags section
    if (opts.includeFlags && definition.flags && definition.flags.length > 0) {
      help += this.colorizeText('FLAGS:', 'cyan', opts.colorize) + '\n';
      
      for (const flag of definition.flags) {
        const alias = flag.alias ? `, -${flag.alias}` : '';
        const required = flag.required ? this.colorizeText(' (required)', 'red', opts.colorize) : '';
        const defaultValue = flag.default !== undefined ? 
          this.colorizeText(` (default: ${flag.default})`, 'dim', opts.colorize) : '';
        
        help += `  --${this.colorizeText(flag.name, 'bright', opts.colorize)}${alias}${required}${defaultValue}\n`;
        
        // Wrap description
        const wrappedDesc = wrapText(flag.description, opts.width - 4);
        wrappedDesc.forEach(line => {
          help += `    ${line}\n`;
        });
        
        // Type and choices
        if (flag.type !== 'boolean') {
          help += `    Type: ${flag.type}\n`;
        }
        
        if (flag.choices && flag.choices.length > 0) {
          help += `    Choices: ${flag.choices.join(', ')}\n`;
        }
        
        help += '\n';
      }
    }

    // Examples section
    if (opts.includeExamples && definition.examples && definition.examples.length > 0) {
      help += this.colorizeText('EXAMPLES:', 'cyan', opts.colorize) + '\n';
      for (const example of definition.examples) {
        help += `  ${this.colorizeText(example.command, 'green', opts.colorize)}\n`;
        help += `    ${example.description}\n\n`;
      }
    }

    // Status indicators
    const statusIndicators: string[] = [];
    
    if (definition.isExperimental) {
      statusIndicators.push(this.colorizeText('⚠️  EXPERIMENTAL', 'yellow', opts.colorize));
    }
    
    if (definition.deprecated) {
      statusIndicators.push(this.colorizeText('🚨 DEPRECATED', 'red', opts.colorize));
    }
    
    if (definition.requiresArchitecture) {
      statusIndicators.push(this.colorizeText('🏗️  REQUIRES ARCHITECTURE', 'blue', opts.colorize));
    }
    
    if (statusIndicators.length > 0) {
      help += this.colorizeText('STATUS:', 'cyan', opts.colorize) + '\n';
      statusIndicators.forEach(indicator => help += `  ${indicator}\n`);
      help += '\n';
    }

    // Version info
    if (definition.since) {
      help += this.colorizeText('SINCE:', 'cyan', opts.colorize) + ` ${definition.since}\n\n`;
    }

    return help.trim();
  }

  generateGlobalHelp(registry: CommandRegistry, options?: Partial<HelpOptions>): string {
    const opts = { ...this.defaultOptions, ...options };
    let help = '';

    // Header
    const title = `${getIcon('rocket')} Claude Zen CLI - Revolutionary Unified Architecture`;
    help += this.colorizeText(title, 'bright', opts.colorize) + '\n\n';

    // Description
    const description = `
A powerful CLI for orchestrating AI workflows with swarm intelligence,
neural networks, vector search, and graph databases.
    `.trim();
    
    help += wrapText(description, opts.width).join('\n') + '\n\n';

    // Usage
    help += this.colorizeText('USAGE:', 'cyan', opts.colorize) + '\n';
    help += '  claude-zen <command> [options]\n';
    help += '  claude-zen <command> --help    # Get help for specific command\n\n';

    // Global flags
    help += this.colorizeText('GLOBAL FLAGS:', 'cyan', opts.colorize) + '\n';
    const globalFlags = [
      { name: 'help', alias: 'h', description: 'Show help information' },
      { name: 'version', alias: 'v', description: 'Show version information' },
      { name: 'verbose', description: 'Enable verbose logging' },
      { name: 'debug', description: 'Enable debug mode' },
      { name: 'config', description: 'Specify config file path' },
      { name: 'no-color', description: 'Disable colored output' }
    ];

    globalFlags.forEach(flag => {
      const alias = flag.alias ? `, -${flag.alias}` : '';
      help += `  --${this.colorizeText(flag.name, 'bright', opts.colorize)}${alias}\n`;
      help += `    ${flag.description}\n`;
    });
    help += '\n';

    // Commands by category
    const commands = registry.list();
    const categories = this.groupCommandsByCategory(commands);

    help += this.colorizeText('COMMANDS:', 'cyan', opts.colorize) + '\n\n';

    Object.entries(categories).forEach(([category, categoryCommands]) => {
      if (categoryCommands.length === 0) return;
      
      help += `  ${this.formatCategory(category as CommandCategory)}:\n`;
      
      categoryCommands.forEach(cmd => {
        const nameWithStatus = this.formatCommandNameWithStatus(cmd, opts.colorize);
        const paddedName = nameWithStatus.padEnd(20);
        help += `    ${paddedName} ${cmd.description}\n`;
      });
      
      help += '\n';
    });

    // Quick start section
    help += this.colorizeText('QUICK START:', 'cyan', opts.colorize) + '\n';
    const quickStartCommands = [
      { cmd: 'claude-zen init', desc: 'Initialize a new project' },
      { cmd: 'claude-zen start', desc: 'Start the orchestration system' },
      { cmd: 'claude-zen status', desc: 'Check system status' },
      { cmd: 'claude-zen swarm init', desc: 'Initialize swarm coordination' }
    ];

    quickStartCommands.forEach(({ cmd, desc }) => {
      help += `  ${this.colorizeText(cmd, 'green', opts.colorize)}\n`;
      help += `    ${desc}\n`;
    });
    help += '\n';

    // Environment variables
    help += this.colorizeText('ENVIRONMENT VARIABLES:', 'cyan', opts.colorize) + '\n';
    const envVars = [
      { name: 'CLAUDE_FLOW_DEBUG', desc: 'Enable debug mode (true/false)' },
      { name: 'CLAUDE_FLOW_VERBOSE', desc: 'Enable verbose logging (true/false)' },
      { name: 'CLAUDE_ZEN_CONFIG', desc: 'Path to configuration file' },
      { name: 'CLAUDE_ZEN_DATA_DIR', desc: 'Data directory path' },
      { name: 'NO_COLOR', desc: 'Disable colored output (1/0)' },
      { name: 'NO_EMOJI', desc: 'Disable emoji icons (1/0)' }
    ];

    envVars.forEach(envVar => {
      help += `  ${this.colorizeText(envVar.name, 'bright', opts.colorize)}\n`;
      help += `    ${envVar.desc}\n`;
    });
    help += '\n';

    // Footer
    help += this.colorizeText('MORE INFORMATION:', 'cyan', opts.colorize) + '\n';
    help += '  Use "claude-zen <command> --help" for detailed command information\n';
    help += '  Documentation: https://github.com/your-org/claude-code-flow\n';
    help += '  Issues: https://github.com/your-org/claude-code-flow/issues\n';

    return help;
  }

  generateCategoryHelp(category: CommandCategory, registry: CommandRegistry, options?: Partial<HelpOptions>): string {
    const opts = { ...this.defaultOptions, ...options };
    const commands = registry.listByCategory(category);
    
    if (commands.length === 0) {
      return `No commands found in category: ${category}`;
    }

    let help = '';

    // Header
    const title = `${this.formatCategory(category)} Commands`;
    help += this.colorizeText(title, 'bright', opts.colorize) + '\n\n';

    // Commands table
    const tableData = commands.map(cmd => ({
      name: this.formatCommandNameWithStatus(cmd, opts.colorize),
      description: cmd.description,
      aliases: cmd.aliases?.join(', ') || '',
      status: this.getCommandStatus(cmd)
    }));

    help += formatTable(tableData, {
      columns: [
        { key: 'name', title: 'Command', align: 'left' },
        { key: 'description', title: 'Description', align: 'left' },
        { key: 'aliases', title: 'Aliases', align: 'left' },
        { key: 'status', title: 'Status', align: 'center' }
      ],
      border: true,
      striped: true
    });

    help += '\n\nUse "claude-zen <command> --help" for detailed information about each command.\n';

    return help;
  }

  showCommandHelp(command: string, registry: CommandRegistry, options?: Partial<HelpOptions>): void {
    const definition = registry.get(command);
    
    if (!definition) {
      console.error(this.colorizeText(`❌ Unknown command: ${command}`, 'red', options?.colorize));
      console.log('\nAvailable commands:');
      this.showGlobalHelp(registry, options);
      return;
    }

    const help = this.generateCommandHelp(definition, options);
    console.log(help);
  }

  showGlobalHelp(registry: CommandRegistry, options?: Partial<HelpOptions>): void {
    const help = this.generateGlobalHelp(registry, options);
    console.log(help);
  }

  showVersion(config: { name: string; version: string; description: string }): void {
    console.log(`${config.name} v${config.version}`);
    console.log(config.description);
    console.log();
    console.log('🚀 Revolutionary Unified Architecture: ACTIVE');
    console.log('💎 Features: Native Swarm + Graph DB + Vector Search + Neural Learning');
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  private colorizeText(text: string, color: string, enabled = true): string {
    if (!enabled) return text;
    return colorize(text, color as any);
  }

  private formatCategory(category: CommandCategory): string {
    const categoryMap: Record<CommandCategory, string> = {
      core: '🏗️  Core System',
      swarm: '🐝 Swarm Intelligence', 
      hive: '🏠 Hive Management',
      plugins: '🔌 Plugin System',
      neural: '🧠 Neural Networks',
      memory: '💾 Memory Management',
      debug: '🐛 Debug & Development',
      utility: '🛠️  Utilities'
    };

    return categoryMap[category] || category;
  }

  private formatCommandNameWithStatus(cmd: CommandDefinition, colorize = true): string {
    let name = cmd.name;
    
    if (!colorize) {
      if (cmd.deprecated) name += ' (deprecated)';
      if (cmd.isExperimental) name += ' (experimental)';
      return name;
    }

    if (cmd.deprecated) {
      name = this.colorizeText(name, 'dim', colorize);
    } else if (cmd.isExperimental) {
      name = this.colorizeText(name, 'yellow', colorize);
    } else {
      name = this.colorizeText(name, 'bright', colorize);
    }

    return name;
  }

  private getCommandStatus(cmd: CommandDefinition): string {
    if (cmd.deprecated) return '🚨 Deprecated';
    if (cmd.isExperimental) return '⚠️  Experimental';
    if (cmd.requiresArchitecture) return '🏗️  Advanced';
    return '✅ Stable';
  }

  private groupCommandsByCategory(commands: CommandDefinition[]): Record<CommandCategory, CommandDefinition[]> {
    const categories: Record<CommandCategory, CommandDefinition[]> = {
      core: [],
      swarm: [],
      hive: [],
      plugins: [],
      neural: [],
      memory: [],
      debug: [],
      utility: []
    };

    commands.forEach(cmd => {
      if (categories[cmd.category]) {
        categories[cmd.category].push(cmd);
      } else {
        categories.utility.push(cmd);
      }
    });

    // Sort commands within each category
    Object.keys(categories).forEach(category => {
      categories[category as CommandCategory].sort((a, b) => a.name.localeCompare(b.name));
    });

    return categories;
  }
}

// =============================================================================
// HELP CONTENT GENERATORS
// =============================================================================

export function generateMarkdownHelp(registry: CommandRegistry): string {
  const commands = registry.list();
  let markdown = '';

  // Header
  markdown += '# Claude Zen CLI Documentation\n\n';
  markdown += 'Revolutionary AI orchestration platform with swarm intelligence.\n\n';

  // Table of contents
  markdown += '## Table of Contents\n\n';
  const categories = commands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, CommandDefinition[]>);

  Object.keys(categories).forEach(category => {
    markdown += `- [${category.charAt(0).toUpperCase() + category.slice(1)}](#${category})\n`;
  });
  markdown += '\n';

  // Commands by category
  Object.entries(categories).forEach(([category, categoryCommands]) => {
    markdown += `## ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
    
    categoryCommands.forEach(cmd => {
      markdown += `### ${cmd.name}\n\n`;
      markdown += `${cmd.description}\n\n`;
      
      // Usage
      markdown += '**Usage:**\n';
      markdown += `\`\`\`bash\n${cmd.usage}\n\`\`\`\n\n`;
      
      // Aliases
      if (cmd.aliases && cmd.aliases.length > 0) {
        markdown += `**Aliases:** ${cmd.aliases.map(a => `\`${a}\``).join(', ')}\n\n`;
      }
      
      // Flags
      if (cmd.flags && cmd.flags.length > 0) {
        markdown += '**Flags:**\n\n';
        cmd.flags.forEach(flag => {
          const alias = flag.alias ? `, \`-${flag.alias}\`` : '';
          const required = flag.required ? ' *(required)*' : '';
          const defaultValue = flag.default !== undefined ? ` (default: \`${flag.default}\`)` : '';
          
          markdown += `- \`--${flag.name}\`${alias}${required}${defaultValue}\n`;
          markdown += `  ${flag.description}\n`;
        });
        markdown += '\n';
      }
      
      // Examples
      if (cmd.examples && cmd.examples.length > 0) {
        markdown += '**Examples:**\n\n';
        cmd.examples.forEach(example => {
          markdown += `\`\`\`bash\n${example.command}\n\`\`\`\n`;
          markdown += `${example.description}\n\n`;
        });
      }
    });
  });

  return markdown;
}

export function generateManPage(registry: CommandRegistry): string {
  const commands = registry.list();
  let manPage = '';

  // Man page header
  manPage += '.TH CLAUDE-ZEN 1 "$(date)" "Claude Zen CLI" "User Commands"\n';
  manPage += '.SH NAME\n';
  manPage += 'claude-zen \\- Revolutionary AI orchestration platform\n';
  manPage += '.SH SYNOPSIS\n';
  manPage += '.B claude-zen\n';
  manPage += '[\\fIGLOBAL_OPTIONS\\fR] \\fICOMMAND\\fR [\\fICOMMAND_OPTIONS\\fR] [\\fIARGS\\fR]\n';
  manPage += '.SH DESCRIPTION\n';
  manPage += 'Claude Zen is a comprehensive CLI for orchestrating AI workflows with swarm intelligence, neural networks, vector search, and graph databases.\n';

  // Commands
  manPage += '.SH COMMANDS\n';
  commands.forEach(cmd => {
    manPage += `.SS ${cmd.name}\n`;
    manPage += `${cmd.description}\n`;
    manPage += '.PP\n';
    
    if (cmd.flags && cmd.flags.length > 0) {
      manPage += '.RS\n';
      cmd.flags.forEach(flag => {
        const alias = flag.alias ? `, \\fB\\-${flag.alias}\\fR` : '';
        manPage += `.TP\n\\fB\\-\\-${flag.name}\\fR${alias}\n`;
        manPage += `${flag.description}\n`;
      });
      manPage += '.RE\n';
    }
  });

  // Footer
  manPage += '.SH SEE ALSO\n';
  manPage += 'For more information, visit https://github.com/your-org/claude-code-flow\n';

  return manPage;
}

// =============================================================================
// GLOBAL HELP SYSTEM INSTANCE
// =============================================================================

export const helpSystem = new TypeScriptHelpSystem();

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

export function showCommandHelp(command: string, registry: CommandRegistry): void {
  helpSystem.showCommandHelp(command, registry);
}

export function showGlobalHelp(registry: CommandRegistry): void {
  helpSystem.showGlobalHelp(registry);
}

export function showCategoryHelp(category: CommandCategory, registry: CommandRegistry): void {
  const help = helpSystem.generateCategoryHelp(category, registry);
  console.log(help);
}

export function showVersion(config: { name: string; version: string; description: string }): void {
  helpSystem.showVersion(config);
}