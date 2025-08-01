import { Orchestrator } from '../core/orchestrator';
import { TerminalManager } from '../terminal/manager';
import { MemoryManager } from '../memory/manager';
import { CoordinationManager } from '../coordination/manager';
import { MCPServer } from '../mcp/server';
import { EventBus } from '../core/event-bus';
import { Logger } from '../core/logger';
import { ConfigManager, type SystemConfig } from '../config/config-manager';

let orchestratorInstance: Orchestrator | null = null;

export function getOrchestratorInstance(): Orchestrator {
  if (!orchestratorInstance) {
    const configManager = ConfigManager.getInstance();
    const config = configManager.config;
    const logger = new Logger(config.logging);
    const eventBus = new EventBus();
    const terminalManager = new TerminalManager(config.terminal, logger, eventBus);
    const memoryManager = new MemoryManager(config.memory, logger, eventBus);
    const coordinationManager = new CoordinationManager(config.coordination, logger, eventBus);
    const mcpServer = new MCPServer(config.mcp, logger, eventBus);

    orchestratorInstance = new Orchestrator(
      config.orchestrator,
      terminalManager,
      memoryManager,
      coordinationManager,
      mcpServer,
      eventBus,
      logger,
    );
  }
  return orchestratorInstance;
}

export function setOrchestratorInstance(instance: Orchestrator): void {
  orchestratorInstance = instance;
}