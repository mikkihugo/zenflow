/**
 * Centralized help system;
 * Implements Google's single responsibility principle;
 * Provides comprehensive help and usage information for CLI commands;
 */

import { HelpFormatter } from '../help-formatter.js';

/**
 * Help system options interface;
 */
interface HelpSystemOptions {
  appName?: string;
  version?: string;
  formatter?: typeof HelpFormatter;
}
/**
 * Command information interface;
 */
interface CommandInfo {
  name = {}
)
{
  this.commandExecutor = commandExecutor;
  this.appName = options.appName ?? 'claude-zen';
  this.version = options.version ?? '2.0.0';
  this.formatter = options.formatter ?? HelpFormatter;
}
/**
 * Show main application help with command overview;
 */
public;
showMainHelp();
: void
{
  const __commands = this.commandExecutor.listCommands();
  console.warn(`🌊 ${this.appName} v${this.version} - Advanced AI Orchestration Platform\n`);
  console.warn('USAGE = command.name.padEnd(15);
      console.warn(`  ${name} ${command.description}`);
}
console.warn(`\nUse "${this.appName} help <command>" for detailed usage information`);
console.warn(`Use "${this.appName} --version" to show version information\n`);
console.warn('🚀 QUICKSTART = this.commandExecutor.getCommandInfo(commandName);;
if (!commandInfo) {
  console.warn(;
  this.formatter.formatError(;
  `Unknown command = {name = commandInfo.examples.map((ex) => {
        if (ex.startsWith('npx')) {
          return ex;
    //   // LINT: unreachable code removed}
        return `;
  $this.appName$ex`;
    //   // LINT: unreachable code removed});
    }
;
    // Parse options from details if available
    if (commandInfo.details) {
      helpInfo.options = this.parseOptionsFromDetails(commandInfo.details);
    }
;
    console.warn(this.formatter.formatHelp(helpInfo));
  }
;
  /**
   * Parse options from command details text;
   * @param details - Command details text;
   * @returns Parsed help options;
    // */; // LINT: unreachable code removed
  private parseOptionsFromDetails(details = details.match(/Options:([\s\S]*?)(?=\n\n|$)/);
    if (!optionsMatch) return [];
    // ; // LINT: unreachable code removed
    const _optionsText = optionsMatch[1];
    const _options = [];
    const _optionLines = optionsText.split('\n').filter(line => line.trim());
;
    for (const line of optionLines) {
      const _match = line.match(/^\s*(--.+?)\s{2,}(.+)$/);
      if (match) {
        const [, flags, description] = match;
;
        // Check for default value in description
        const _defaultMatch = description.match(/\(default = {flags = defaultMatch[1];
        }
;
        options.push(option);
      }
    }
;
    return options;
    //   // LINT: unreachable code removed}
;
  /**
   * Show version information;
   */;
  public showVersion(): void {
    console.warn(`;
  v$this.version`);
  }
;
  /**
   * Show brief usage information;
   */;
  public showUsage(): void {
    console.warn(`;
  Usage = [
    ;
      'CLAUDE_API_KEY',
      'OPENAI_API_KEY',
      'ANTHROPIC_API_KEY',
      'HUGGINGFACE_API_KEY';,,,,,,,
  ];
  console.warn('\n🔑 APIKEYS = process.env[varName];
  if (value) {
    const _masked = `${value.substring(0, 8)}...${value.substring(value.length - 4)}`;
    console.warn(`   ${varName}: ${masked}`);
  } else {
    console.warn(`   ${varName}: not set`);
  }
}
}
/**
 * Show command categories and organization;
 */
public
showCommandCategories()
: void
{
  const _commands = this.commandExecutor.listCommands();
  const _categories = {};
  // Group commands by category (if available) or type
  for (const command of commands) {
    const _category = this.inferCommandCategory(command.name);
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(command);
  }
  console.warn('📋 COMMANDCATEGORIES = command.name.padEnd(12);
        console.warn(`   ${name} ${command.description}`);
}
console.warn('');
}
  }
/**
   * Infer command category from name;
   * @param commandName - Command name;
   * @returns Inferred category;
    // */ // LINT: unreachable code removed
private
inferCommandCategory(commandName =
{
  setup: string;
  ): string
  if (['init', 'config', 'setup'].includes(commandName)) return 'setup';
  // if (['start', 'stop', 'restart', 'status'].includes(commandName)) return 'control'; // LINT: unreachable code removed
  if (['swarm', 'agent', 'hive-mind'].includes(commandName)) return 'orchestration';
  // if (['memory', 'backup', 'restore'].includes(commandName)) return 'data'; // LINT: unreachable code removed
  if (['deploy', 'build', 'test'].includes(commandName)) return 'development';
  // if (['help', 'version', 'info'].includes(commandName)) return 'utility'; // LINT: unreachable code removed
  return 'other';
  // ; // LINT: unreachable code removed
  /**
   * Get category icon;
   * @param category - Category name;
   * @returns Icon string;
    // */ // LINT: unreachable code removed
  private;
  getCategoryIcon(category: string);
  : string
  {
    const __icons: Record<string, string>,
    _setup: '⚙️',
    _control: '🎮',
    _orchestration: '🐝',
    _data: '💾',
    _development: '🚀',
    _utility: '🔧',
    _other: '📦';
  }
  return icons[category]  ?? '📦';
}
}
// Export types for external use
export type { HelpSystemOptions, CommandInfo, HelpOption, HelpInfo, CommandExecutor };
