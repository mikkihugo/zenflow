/**
 * Start command for Claude-Flow
 */

import { Command } from '@cliffy/command';
import { colors } from '@cliffy/ansi/colors';
import { Orchestrator } from '../../core/orchestrator.ts';
import { eventBus } from '../../core/event-bus.ts';
import { logger } from '../../core/logger.ts';
import { configManager } from '../../core/config.ts';
import { TerminalManager } from '../../terminal/manager.ts';
import { MemoryManager } from '../../memory/manager.ts';
import { CoordinationManager } from '../../coordination/manager.ts';
import { MCPServer } from '../../mcp/server.ts';
import { SystemEvents } from '../../utils/types.ts';
// Spinner is not available in the current cliffy version, use simple text instead

export const startCommand = new Command()
  .description('Start the Claude-Flow orchestration system')
  .option('-d, --daemon', 'Run as daemon in background')
  .option('-p, --port <port:number>', 'MCP server port', { default: 3000 })
  .option('--mcp-transport <transport:string>', 'MCP transport type (stdio, http)', {
    default: 'stdio',
  })
  .action(async (options: any) => {
    console.log(colors.cyan('Starting Claude-Flow...'));

    try {
      // Load configuration
      const config = await configManager.load(options.config || undefined);
      
      // Override MCP settings from CLI options
      if (options.port) {
        config.mcp.port = options.port;
      }
      if (options.mcpTransport) {
        config.mcp.transport = options.mcpTransport as any;
      }

      // Create components
      const terminalManager = new TerminalManager(
        config.terminal,
        eventBus,
        logger,
      );

      const memoryManager = new MemoryManager(
        config.memory,
        eventBus,
        logger,
      );

      const coordinationManager = new CoordinationManager(
        config.coordination,
        eventBus,
        logger,
      );

      const mcpServer = new MCPServer(
        config.mcp,
        eventBus,
        logger,
      );

      // Create orchestrator
      const orchestrator = new Orchestrator(
        config,
        terminalManager,
        memoryManager,
        coordinationManager,
        mcpServer,
        eventBus,
        logger,
      );

      // Initialize orchestrator
      await orchestrator.initialize();

      // spinner.stop();
      console.log(colors.green.bold('✓'), 'Claude-Flow started successfully!');
      
      if (config.mcp.transport === 'http') {
        console.log(colors.cyan('MCP server listening on'), 
          colors.yellow(`http://${config.mcp.host || 'localhost'}:${config.mcp.port}`));
      } else {
        console.log(colors.cyan('MCP server listening on'), colors.yellow('stdio'));
      }

      // Set up graceful shutdown
      const shutdown = async () => {
        console.log('\n' + colors.yellow('Shutting down Claude-Flow...'));
        eventBus.emit('shutdown');
        await orchestrator.shutdown();
        console.log(colors.green.bold('✓'), 'Shutdown complete');
        Deno.exit(0);
      };

      Deno.addSignalListener('SIGINT', shutdown);
      Deno.addSignalListener('SIGTERM', shutdown);

      // Set up event listeners for logging
      setupEventListeners();

      if (options.daemon) {
        console.log(colors.gray('Running in daemon mode. Press Ctrl+C to stop.'));
        // Keep the process running
        await new Promise<void>((resolve) => {
          // This promise will only resolve when shutdown is called
          eventBus.once('shutdown', resolve);
        });
      } else {
        console.log(colors.gray('Press Ctrl+C to stop.'));
        // Keep the process running in interactive mode
        await new Promise<void>((resolve) => {
          // This promise will only resolve when shutdown is called
          eventBus.once('shutdown', resolve);
        });
      }
    } catch (error) {
      // spinner.stop();
      throw error;
    }
  });

function setupEventListeners(): void {
  // Log important events
  eventBus.on(SystemEvents.AGENT_SPAWNED, (data: any) => {
    const { agentId, profile } = data;
    console.log(colors.blue('→'), `Agent spawned: ${colors.cyan(agentId)} (${profile.type})`);
  });

  eventBus.on(SystemEvents.AGENT_TERMINATED, (data: any) => {
    const { agentId, reason } = data;
    console.log(colors.red('←'), `Agent terminated: ${colors.cyan(agentId)} - ${reason}`);
  });

  eventBus.on(SystemEvents.TASK_ASSIGNED, (data: any) => {
    const { taskId, agentId } = data;
    console.log(colors.magenta('◆'), `Task ${colors.yellow(taskId)} assigned to ${colors.cyan(agentId)}`);
  });

  eventBus.on(SystemEvents.TASK_COMPLETED, (data: any) => {
    const { taskId } = data;
    console.log(colors.green('✓'), `Task completed: ${colors.yellow(taskId)}`);
  });

  eventBus.on(SystemEvents.TASK_FAILED, (data: any) => {
    const { taskId, error } = data;
    console.log(colors.red('✗'), `Task failed: ${colors.yellow(taskId)} - ${error.message}`);
  });

  eventBus.on(SystemEvents.SYSTEM_ERROR, (data: any) => {
    const { component, error } = data;
    console.error(colors.red.bold('System Error:'), `${component} - ${error.message}`);
  });
}