/**
 * MCP Command - Start and manage Claude-Zen MCP server
 *
 * Provides CLI interface for managing the MCP server integration
 */

import { ClaudeZenMCPServer } from '../../../mcp/claude-zen-server';
import { BaseCommand } from '../../core/base-command';
import type { CommandContext, CommandResult } from '../../types/index';

export class MCPCommand extends BaseCommand {
  private mcpServer?: ClaudeZenMCPServer;

  constructor() {
    super({
      name: 'mcp',
      description: 'Manage Claude-Zen MCP server for swarm coordination',
      usage: 'claude-zen mcp <subcommand> [options]',
      category: 'integration',
      minArgs: 1,
      examples: [
        'claude-zen mcp start',
        'claude-zen mcp status',
        'claude-zen mcp stop',
        'claude-zen mcp tools',
      ],
    });
  }

  protected async run(context: CommandContext): Promise<CommandResult> {
    const subcommand = context.args[0];

    switch (subcommand.toLowerCase()) {
      case 'start':
        return await this.handleStart(context);
      case 'stop':
        return await this.handleStop(context);
      case 'status':
        return this.handleStatus(context);
      case 'tools':
        return this.handleTools(context);
      case 'help':
        return this.handleHelp(context);
      default:
        return {
          success: false,
          error: `Unknown subcommand: ${subcommand}. Use 'claude-zen mcp help' for available commands.`,
          exitCode: 1,
        };
    }
  }

  private async handleStart(context: CommandContext): Promise<CommandResult> {
    try {
      if (this.mcpServer) {
        return {
          success: false,
          error: 'MCP server is already running',
          exitCode: 1,
        };
      }

      console.log('🚀 Starting Claude-Zen MCP Server...');

      this.mcpServer = new ClaudeZenMCPServer();
      await this.mcpServer.start();

      console.log('✅ Claude-Zen MCP Server started successfully!');
      console.log('');
      console.log('📋 Available tools:');
      const tools = this.mcpServer.getTools();
      Object.entries(tools).forEach(([name, tool]) => {
        console.log(`  • mcp__claude-zen__${name} - ${tool.description}`);
      });
      console.log('');
      console.log('🔗 To use in Claude Code:');
      console.log('   claude mcp add claude-zen npx claude-zen mcp start');

      return {
        success: true,
        exitCode: 0,
        message: 'MCP server started successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to start MCP server: ${error instanceof Error ? error.message : String(error)}`,
        exitCode: 1,
      };
    }
  }

  private async handleStop(context: CommandContext): Promise<CommandResult> {
    try {
      if (!this.mcpServer) {
        return {
          success: false,
          error: 'MCP server is not running',
          exitCode: 1,
        };
      }

      console.log('⏹️ Stopping Claude-Zen MCP Server...');

      await this.mcpServer.stop();
      this.mcpServer = undefined;

      console.log('✅ Claude-Zen MCP Server stopped successfully!');

      return {
        success: true,
        exitCode: 0,
        message: 'MCP server stopped successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to stop MCP server: ${error instanceof Error ? error.message : String(error)}`,
        exitCode: 1,
      };
    }
  }

  private handleStatus(context: CommandContext): CommandResult {
    const isRunning = !!this.mcpServer;

    console.log('📊 Claude-Zen MCP Server Status');
    console.log('');
    console.log(`Status: ${isRunning ? '🟢 Running' : '🔴 Stopped'}`);

    if (isRunning && this.mcpServer) {
      const status = this.mcpServer.getStatus();
      console.log(`Host: ${status.host}`);
      console.log(`Port: ${status.port}`);
      console.log(`Handlers: ${status.handlers.length}`);
      console.log('');
      console.log('Available Tools:');
      const tools = this.mcpServer.getTools();
      Object.entries(tools).forEach(([name, tool]) => {
        console.log(`  • mcp__claude-zen__${name}`);
      });
    } else {
      console.log('');
      console.log('To start the server: claude-zen mcp start');
    }

    return {
      success: true,
      exitCode: 0,
      message: 'Status displayed',
    };
  }

  private handleTools(context: CommandContext): CommandResult {
    console.log('🛠️ Claude-Zen MCP Tools');
    console.log('');

    if (!this.mcpServer) {
      console.log('⚠️  MCP server is not running. Start it with: claude-zen mcp start');
      console.log('');
    }

    console.log('Available Tools:');
    console.log('');

    const toolDescriptions = {
      swarm_init: 'Initialize swarm coordination topology',
      agent_spawn: 'Spawn specialized agent for coordinated tasks',
      task_orchestrate: 'Orchestrate complex task execution across swarm',
      swarm_status: 'Get current swarm status and metrics',
      swarm_monitor: 'Monitor swarm performance in real-time',
    };

    Object.entries(toolDescriptions).forEach(([name, description]) => {
      console.log(`🔧 mcp__claude-zen__${name}`);
      console.log(`   ${description}`);
      console.log('');
    });

    console.log('💡 Usage in Claude Code:');
    console.log('   1. Add MCP server: claude mcp add claude-zen npx claude-zen mcp start');
    console.log('   2. Use tools: mcp__claude-zen__swarm_init, mcp__claude-zen__agent_spawn, etc.');

    return {
      success: true,
      exitCode: 0,
      message: 'Tools listed',
    };
  }

  private handleHelp(context: CommandContext): CommandResult {
    console.log(this.getHelp());
    return { success: true, exitCode: 0 };
  }

  getHelp(): string {
    return `🔗 Claude-Zen MCP Server Management

USAGE:
  claude-zen mcp <subcommand> [options]

AVAILABLE COMMANDS:
  start           Start the MCP server
  stop            Stop the MCP server
  status          Show server status
  tools           List available MCP tools
  help            Show this help message

MCP INTEGRATION:
  The MCP server provides swarm coordination tools for Claude Code.
  Once started, Claude Code can use mcp__claude-zen__* tools for:
  
  • Swarm initialization and topology management
  • Agent spawning and specialization
  • Task orchestration and coordination
  • Performance monitoring and metrics

SETUP:
  1. Start MCP server:     claude-zen mcp start
  2. Add to Claude Code:   claude mcp add claude-zen npx claude-zen mcp start
  3. Use tools in Claude:  mcp__claude-zen__swarm_init, etc.

EXAMPLES:
  claude-zen mcp start                # Start MCP server
  claude-zen mcp status               # Check server status
  claude-zen mcp tools                # List available tools
  claude-zen mcp stop                 # Stop server

🚀 TIP: The MCP server enables Claude Code to coordinate complex tasks!`;
  }
}
