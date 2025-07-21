/**
 * Process Manager - Handles lifecycle of system processes
 */

import { EventEmitter } from './event-emitter.js';
import chalk from 'chalk';
<<<<<<< HEAD:src/cli/commands/start/process-manager.js
import { 
  ProcessType, 
  ProcessStatus 
} from './types.js';
||||||| 47d5ef4:src/cli/commands/start/process-manager.ts
import { 
  ProcessInfo, 
  ProcessType, 
  ProcessStatus, 
  ProcessMetrics,
  SystemStats 
} from './types.js';
=======
import { ProcessInfo, ProcessType, ProcessStatus, ProcessMetrics, SystemStats } from './types.js';
>>>>>>> origin/main:src/cli/commands/start/process-manager.ts
import { Orchestrator } from '../../../core/orchestrator.js';
import { TerminalManager } from '../../../terminal/manager.js';
import { MemoryManager } from '../../../memory/manager.js';
import { CoordinationManager } from '../../../coordination/manager.js';
import { MCPServer } from '../../../mcp/server.js';
import { eventBus } from '../../../core/event-bus.js';
import { logger } from '../../../core/logger.js';
import { configManager } from '../../../core/config.js';

export class ProcessManager extends EventEmitter {
  constructor() {
    super();
    this.processes = new Map();
    this.orchestrator = undefined;
    this.terminalManager = undefined;
    this.memoryManager = undefined;
    this.coordinationManager = undefined;
    this.mcpServer = undefined;
    this.config = null;
    this.initializeProcesses();
  }

  initializeProcesses() {
    // Define all manageable processes
    const processDefinitions = [
      {
        id: 'event-bus',
        name: 'Event Bus',
        type: ProcessType.EVENT_BUS,
        status: ProcessStatus.STOPPED,
      },
      {
        id: 'orchestrator',
        name: 'Orchestrator Engine',
        type: ProcessType.ORCHESTRATOR,
        status: ProcessStatus.STOPPED,
      },
      {
        id: 'memory-manager',
        name: 'Memory Manager',
        type: ProcessType.MEMORY_MANAGER,
        status: ProcessStatus.STOPPED,
      },
      {
        id: 'terminal-pool',
        name: 'Terminal Pool',
        type: ProcessType.TERMINAL_POOL,
        status: ProcessStatus.STOPPED,
      },
      {
        id: 'mcp-server',
        name: 'MCP Server',
        type: ProcessType.MCP_SERVER,
        status: ProcessStatus.STOPPED,
      },
      {
        id: 'coordinator',
        name: 'Coordination Manager',
        type: ProcessType.COORDINATOR,
        status: ProcessStatus.STOPPED,
      },
    ];

    for (const process of processDefinitions) {
      this.processes.set(process.id, process);
    }
  }

  async initialize(configPath) {
    try {
      this.config = await configManager.load(configPath);
      this.emit('initialized', { config: this.config });
    } catch (error) {
      this.emit('error', { component: 'ProcessManager', error });
      throw error;
    }
  }

  async startProcess(processId) {
    const process = this.processes.get(processId);
    if (!process) {
      throw new Error(`Unknown process: ${processId}`);
    }

    if (process.status === ProcessStatus.RUNNING) {
      throw new Error(`Process ${processId} is already running`);
    }

    this.updateProcessStatus(processId, ProcessStatus.STARTING);

    try {
      switch (process.type) {
        case ProcessType.EVENT_BUS:
          // Event bus is already initialized globally
          process.pid = process.pid || Date.now(); // Use node.pid if available, fallback to timestamp
          break;

        case ProcessType.MEMORY_MANAGER:
          this.memoryManager = new MemoryManager(this.config.memory, eventBus, logger);
          await this.memoryManager.initialize();
          break;

        case ProcessType.TERMINAL_POOL:
          this.terminalManager = new TerminalManager(this.config.terminal, eventBus, logger);
          await this.terminalManager.initialize();
          break;

        case ProcessType.COORDINATOR:
          this.coordinationManager = new CoordinationManager(
            this.config.coordination,
            eventBus,
            logger,
          );
          await this.coordinationManager.initialize();
          break;

        case ProcessType.MCP_SERVER:
          this.mcpServer = new MCPServer(this.config.mcp, eventBus, logger);
          await this.mcpServer.start();
          break;

        case ProcessType.ORCHESTRATOR:
          if (
            !this.terminalManager ||
            !this.memoryManager ||
            !this.coordinationManager ||
            !this.mcpServer
          ) {
            throw new Error('Required components not initialized');
          }

          this.orchestrator = new Orchestrator(
            this.config,
            this.terminalManager,
            this.memoryManager,
            this.coordinationManager,
            this.mcpServer,
            eventBus,
            logger,
          );
          await this.orchestrator.initialize();
          break;
      }

      process.startTime = Date.now();
      this.updateProcessStatus(processId, ProcessStatus.RUNNING);
      this.emit('processStarted', { processId, process });
    } catch (error) {
      this.updateProcessStatus(processId, ProcessStatus.ERROR);
      process.metrics = {
        ...process.metrics,
<<<<<<< HEAD:src/cli/commands/start/process-manager.js
        lastError: error.message
||||||| 47d5ef4:src/cli/commands/start/process-manager.ts
        lastError: (error as Error).message
=======
        lastError: (error as Error).message,
>>>>>>> origin/main:src/cli/commands/start/process-manager.ts
      };
      this.emit('processError', { processId, error });
      throw error;
    }
  }

  async stopProcess(processId) {
    const process = this.processes.get(processId);
    if (!process || process.status !== ProcessStatus.RUNNING) {
      throw new Error(`Process ${processId} is not running`);
    }

    this.updateProcessStatus(processId, ProcessStatus.STOPPING);

    try {
      switch (process.type) {
        case ProcessType.ORCHESTRATOR:
          if (this.orchestrator) {
            await this.orchestrator.shutdown();
            this.orchestrator = undefined;
          }
          break;

        case ProcessType.MCP_SERVER:
          if (this.mcpServer) {
            await this.mcpServer.stop();
            this.mcpServer = undefined;
          }
          break;

        case ProcessType.MEMORY_MANAGER:
          if (this.memoryManager) {
            await this.memoryManager.shutdown();
            this.memoryManager = undefined;
          }
          break;

        case ProcessType.TERMINAL_POOL:
          if (this.terminalManager) {
            await this.terminalManager.shutdown();
            this.terminalManager = undefined;
          }
          break;

        case ProcessType.COORDINATOR:
          if (this.coordinationManager) {
            await this.coordinationManager.shutdown();
            this.coordinationManager = undefined;
          }
          break;
      }

      this.updateProcessStatus(processId, ProcessStatus.STOPPED);
      this.emit('processStopped', { processId });
    } catch (error) {
      this.updateProcessStatus(processId, ProcessStatus.ERROR);
      this.emit('processError', { processId, error });
      throw error;
    }
  }

  async restartProcess(processId) {
    await this.stopProcess(processId);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Brief delay
    await this.startProcess(processId);
  }

  async startAll() {
    // Start in dependency order
    const startOrder = [
      'event-bus',
      'memory-manager',
      'terminal-pool',
      'coordinator',
      'mcp-server',
      'orchestrator',
    ];

    for (const processId of startOrder) {
      try {
        await this.startProcess(processId);
      } catch (error) {
        console.error(chalk.red(`Failed to start ${processId}:`), error.message);
        // Continue with other processes
      }
    }
  }

  async stopAll() {
    // Stop in reverse dependency order
    const stopOrder = [
      'orchestrator',
      'mcp-server',
      'coordinator',
      'terminal-pool',
      'memory-manager',
      'event-bus',
    ];

    for (const processId of stopOrder) {
      const process = this.processes.get(processId);
      if (process && process.status === ProcessStatus.RUNNING) {
        try {
          await this.stopProcess(processId);
        } catch (error) {
          console.error(chalk.red(`Failed to stop ${processId}:`), error.message);
        }
      }
    }
  }

  getProcess(processId) {
    return this.processes.get(processId);
  }

  getAllProcesses() {
    return Array.from(this.processes.values());
  }

  getSystemStats() {
    const processes = this.getAllProcesses();
    const runningProcesses = processes.filter((p) => p.status === ProcessStatus.RUNNING);
    const stoppedProcesses = processes.filter((p) => p.status === ProcessStatus.STOPPED);
    const errorProcesses = processes.filter((p) => p.status === ProcessStatus.ERROR);

    return {
      totalProcesses: processes.length,
      runningProcesses: runningProcesses.length,
      stoppedProcesses: stoppedProcesses.length,
      errorProcesses: errorProcesses.length,
      systemUptime: this.getSystemUptime(),
      totalMemory: this.getTotalMemoryUsage(),
      totalCpu: this.getTotalCpuUsage(),
    };
  }

  updateProcessStatus(processId, status) {
    const process = this.processes.get(processId);
    if (process) {
      process.status = status;
      this.emit('statusChanged', { processId, status });
    }
  }

  getSystemUptime() {
    const orchestrator = this.processes.get('orchestrator');
    if (orchestrator && orchestrator.startTime) {
      return Date.now() - orchestrator.startTime;
    }
    return 0;
  }

  getTotalMemoryUsage() {
    // Placeholder - would integrate with actual memory monitoring
    return 0;
  }

  getTotalCpuUsage() {
    // Placeholder - would integrate with actual CPU monitoring
    return 0;
  }

  async getProcessLogs(processId, lines = 50) {
    // Placeholder - would integrate with actual logging system
    return [
      `[${new Date().toISOString()}] Process ${processId} started`,
      `[${new Date().toISOString()}] Process ${processId} is running normally`,
    ];
  }
}
