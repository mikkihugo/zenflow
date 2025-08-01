/**
 * Swarm Command - MCP Integration Proxy
 * 
 * Delegates swarm operations to claude-zen MCP tools for proper coordination.
 * Provides convenient CLI interface that uses the MCP-based swarm system.
 */

import { BaseCommand } from '../../core/base-command';
import type { CommandContext, CommandResult } from '../../types/index';
import { launchSwarmTUI } from '../../../interfaces/tui/swarm-tui-simple';

export class SwarmCommand extends BaseCommand {
  constructor() {
    super({
      name: 'swarm',
      description: 'Manage swarm operations via claude-zen MCP integration',
      usage: 'claude-zen swarm <subcommand> [options]',
      category: 'swarm',
      minArgs: 0, // Allow for interactive TUI mode
      examples: [
        'claude-zen swarm ui',
        'claude-zen swarm status',
        'claude-zen swarm help'
      ]
    });
  }

  protected async run(context: CommandContext): Promise<CommandResult> {
    const subcommand = context.args[0];
    
    // If no subcommand, launch interactive TUI
    if (!subcommand) {
      try {
        console.log('🐝 Launching Swarm TUI...');
        launchSwarmTUI();
        return { success: true, exitCode: 0 };
      } catch (error) {
        return {
          success: false,
          error: `Failed to launch Swarm TUI: ${error}`,
          exitCode: 1
        };
      }
    }

    // Handle subcommands
    switch (subcommand.toLowerCase()) {
      case 'ui':
      case 'tui':
        return await this.handleUI(context);
      case 'status':
        return await this.handleStatus(context);
      case 'help':
        return this.handleHelp(context);
      default:
        return this.handleMCPGuide(subcommand);
    }
  }

  private async handleUI(context: CommandContext): Promise<CommandResult> {
    try {
      console.log('🐝 Launching Swarm TUI...');
      launchSwarmTUI();
      return { success: true, exitCode: 0 };
    } catch (error) {
      return {
        success: false,
        error: `Failed to launch Swarm TUI: ${error}`,
        exitCode: 1
      };
    }
  }

  private handleStatus(context: CommandContext): CommandResult {
    console.log('🐝 Swarm Status Information');
    console.log('');
    console.log('✅ Swarm operations are managed via claude-zen MCP integration:');
    console.log('');
    console.log('📋 To manage swarms in Claude Code:');
    console.log('   1. Ensure MCP server is configured:');
    console.log('      claude mcp add claude-zen npx claude-zen mcp start');
    console.log('');
    console.log('   2. Use MCP tools in Claude Code:');
    console.log('      - mcp__claude-zen__swarm_init');
    console.log('      - mcp__claude-zen__agent_spawn');
    console.log('      - mcp__claude-zen__task_orchestrate');
    console.log('');
    console.log('   3. Or launch the TUI: claude-zen swarm ui');
    console.log('');
    console.log('📖 See CLAUDE.md for complete MCP integration guide');
    
    return {
      success: true,
      exitCode: 0,
      message: 'Swarm status and integration guide displayed'
    };
  }

  private handleHelp(context: CommandContext): CommandResult {
    console.log(this.getHelp());
    return { success: true, exitCode: 0 };
  }

  private handleMCPGuide(subcommand: string): CommandResult {
    console.log(`🐝 Swarm Command: ${subcommand}`);
    console.log('');
    console.log('⚠️  Swarm operations are managed via claude-zen MCP integration.');
    console.log('   Direct CLI commands have been replaced with MCP tools for better coordination.');
    console.log('');
    console.log('🚀 To use swarm features:');
    console.log('');
    console.log('   📱 Interactive TUI:');
    console.log('      claude-zen swarm ui');
    console.log('');
    console.log('   🔧 MCP Integration:');
    console.log('      1. Configure MCP server in Claude Code:');
    console.log('         claude mcp add claude-zen npx claude-zen mcp start');
    console.log('');
    console.log('      2. Use MCP tools in Claude Code:');
    console.log('         - mcp__claude-zen__swarm_init');
    console.log('         - mcp__claude-zen__agent_spawn');  
    console.log('         - mcp__claude-zen__task_orchestrate');
    console.log('');
    console.log('   📖 Documentation:');
    console.log('      See CLAUDE.md for complete integration guide');
    console.log('');
    console.log('💡 This ensures proper coordination with Claude Code\'s workflow orchestration.');

    return {
      success: true,
      exitCode: 0,
      message: 'MCP integration guide displayed'
    };
  }


  getHelp(): string {
    return `🐝 Swarm Operations - Direct Integration

USAGE:
  claude-flow swarm [subcommand] [options]

AVAILABLE COMMANDS:
  (no args)       Launch interactive Swarm TUI
  ui, tui         Launch Swarm TUI interface
  init            Initialize a new swarm
  spawn <type>    Spawn a new agent
  task <desc>     Create a new task
  status          Show current swarm status
  list            List all swarm components
  stop            Stop the swarm orchestrator
  help            Show this help message

COMMAND OPTIONS:
  init:
    --topology <type>    Swarm topology (hierarchical, mesh, star) [default: hierarchical]
    --agents <count>     Maximum agents [default: 8]
    --strategy <type>    Execution strategy (parallel, sequential) [default: parallel]

  spawn:
    --name <name>        Agent name [default: auto-generated]
    --capabilities <list> Comma-separated capabilities

  task:
    --strategy <type>    Task strategy (parallel, sequential) [default: parallel]
    --priority <level>   Task priority (high, medium, low) [default: medium]

EXAMPLES:
  claude-flow swarm                    # Launch TUI
  claude-flow swarm init --topology mesh --agents 5
  claude-flow swarm spawn researcher --name analyst-1
  claude-flow swarm task "Analyze codebase" --priority high
  claude-flow swarm status
  claude-flow swarm list
  claude-flow swarm stop

DIRECT INTEGRATION:
  - ✅ No MCP dependencies - pure Claude Code integration
  - ✅ Direct orchestrator calls for maximum performance
  - ✅ Real-time status and monitoring
  - ✅ Simplified command structure
  - ✅ Built-in TUI for visual management

🚀 TIP: Use 'claude-flow swarm ui' for visual swarm management!
`;
  }

  // Add isActive property getter for external access
  get isActive(): boolean {
    return this.orchestrator?.isActive || false;
  }
}