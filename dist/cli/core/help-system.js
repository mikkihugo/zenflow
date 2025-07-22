/**
 * Centralized help system
 * Implements Google's single responsibility principle
 */

import { HelpFormatter } from '../help-formatter.js';

export class HelpSystem {
  constructor(commandExecutor, options = {}) {
    this.commandExecutor = commandExecutor;
    this.appName = options.appName || 'claude-zen';
    this.version = options.version || '2.0.0';
    this.formatter = options.formatter || HelpFormatter;
  }
  
  /**
   * Show main application help
   */
  showMainHelp() {
    const commands = this.commandExecutor.listCommands();
    
    console.log(`🌊 ${this.appName} v${this.version} - Enterprise-Grade AI Agent Orchestration Platform\n`);
    
    console.log('USAGE:');
    console.log(`  ${this.appName} <command> [options]\n`);
    
    console.log('COMMANDS:');
    for (const command of commands) {
      const name = command.name.padEnd(15);
      console.log(`  ${name} ${command.description}`);
    }
    
    console.log(`\nUse "${this.appName} help <command>" for detailed usage information`);
    console.log(`Use "${this.appName} --version" to show version information\n`);
    
    console.log('🚀 QUICK START:');
    console.log(`  ${this.appName} init --sparc     # Initialize with SPARC development environment`);
    console.log(`  ${this.appName} swarm "Build API" # Start AI swarm for development task`);
    console.log(`  ${this.appName} status           # Show system status and health\n`);
  }
  
  /**
   * Show help for specific command
   */
  showCommandHelp(commandName) {
    const commandInfo = this.commandExecutor.getCommandInfo(commandName);
    
    if (!commandInfo) {
      console.log(
        this.formatter.formatError(
          `Unknown command: ${commandName}`,
          this.appName,
          `${this.appName} <command> [options]`
        )
      );
      return;
    }
    
    // If command has custom help, let it handle the display
    if (commandInfo.customHelp) {
      try {
        // Execute command with help flag
        this.commandExecutor.executeCommand(commandName, ['--help'], { help: true });
      } catch (error) {
        // Fallback to standard help if custom help fails
        this.showStandardCommandHelp(commandInfo);
      }
      return;
    }
    
    this.showStandardCommandHelp(commandInfo);
  }
  
  /**
   * Show standardized command help
   */
  showStandardCommandHelp(commandInfo) {
    const helpInfo = {
      name: `${this.appName} ${commandInfo.name}`,
      description: this.formatter.stripFormatting(commandInfo.description),
      usage: `${this.appName} ${commandInfo.usage}`,
    };
    
    // Add examples
    if (commandInfo.examples && commandInfo.examples.length > 0) {
      helpInfo.examples = commandInfo.examples.map(ex => {
        if (ex.startsWith('npx')) {
          return ex;
        }
        return `${this.appName} ${ex}`;
      });
    }
    
    // Parse options from details if available
    if (commandInfo.details) {
      helpInfo.options = this.parseOptionsFromDetails(commandInfo.details);
    }
    
    console.log(this.formatter.formatHelp(helpInfo));
  }
  
  /**
   * Parse options from command details text
   */
  parseOptionsFromDetails(details) {
    const optionsMatch = details.match(/Options:([\s\S]*?)(?=\n\n|$)/);
    if (!optionsMatch) return [];
    
    const optionsText = optionsMatch[1];
    const options = [];
    const optionLines = optionsText.split('\n').filter(line => line.trim());
    
    for (const line of optionLines) {
      const match = line.match(/^\s*(--.+?)\s{2,}(.+)$/);
      if (match) {
        const [_, flags, description] = match;
        
        // Check for default value in description
        const defaultMatch = description.match(/\(default: (.+?)\)/);
        const option = {
          flags: flags.trim(),
          description: description.replace(/\(default: .+?\)/, '').trim(),
        };
        
        if (defaultMatch) {
          option.defaultValue = defaultMatch[1];
        }
        
        options.push(option);
      }
    }
    
    return options;
  }
  
  /**
   * Show version information
   */
  showVersion() {
    console.log(`v${this.version}`);
  }
  
  /**
   * Show brief usage information
   */
  showUsage() {
    console.log(`Usage: ${this.appName} <command> [options]`);
    console.log(`Use "${this.appName} help" for more information`);
  }
}