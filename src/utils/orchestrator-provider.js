import { Orchestrator } from '../core/orchestrator.js';
import { TerminalManager } from '../terminal/manager.js';
import { MemoryManager } from '../memory/manager.js';
import { CoordinationManager } from '../coordination/manager.js';
import { MCPServer } from '../mcp/server.js';
import { EventBus } from '../core/event-bus.js';
import { Logger } from '../core/logger.js';
import { ConfigManager } from '../config/config-manager.js';

let orchestratorInstance = null;

export function getOrchestratorInstance() {
  if (!orchestratorInstance) {
    const configManager = ConfigManager.getInstance();
    const config = configManager.config;
    const logger = new Logger(config.logger);
    const eventBus = new EventBus();
    const terminalManager = new TerminalManager(config.terminal, logger, eventBus);
    const memoryManager = new MemoryManager(config.memory, logger, eventBus);
    const coordinationManager = new CoordinationManager(config.coordination, logger, eventBus);
    const mcpServer = new MCPServer(config.mcp, logger, eventBus);

    orchestratorInstance = new Orchestrator(
      config,
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

export function setOrchestratorInstance(instance) {
  orchestratorInstance = instance;
}
