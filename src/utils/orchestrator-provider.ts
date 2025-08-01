import { ConfigManager, type SystemConfig } from '../config/config-manager';
import { CoordinationManager } from '../coordination/manager';
import { EventBus } from '../core/event-bus';
import { createLogger } from '../core/logger';
import { Orchestrator } from '../core/orchestrator';
import { MCPServer } from '../mcp/server';
import { MemoryManager } from '../memory/manager';
import { TerminalManager } from '../terminal/manager';

let orchestratorInstance: Orchestrator | null = null;

export function getOrchestratorInstance(): Orchestrator {
  if (!orchestratorInstance) {
    const configManager = ConfigManager.getInstance();
    const config = configManager.config;
    const logger = createLogger({ prefix: 'orchestrator' });
    const eventBus = new EventBus();
    const terminalManager = new TerminalManager(config.terminal || {}, logger, eventBus);
    const memoryManager = new MemoryManager(config.memory || {}, logger, eventBus);
    const coordinationManager = new CoordinationManager(
      config.coordination || { maxAgents: 50, heartbeatInterval: 10000, timeout: 30000 },
      logger,
      eventBus
    );
    const mcpServer = new MCPServer(
      config.mcp || { port: 3000, host: 'localhost', timeout: 30000 },
      logger,
      eventBus
    );

    orchestratorInstance = new Orchestrator(
      config.orchestrator || {},
      terminalManager,
      memoryManager,
      coordinationManager,
      mcpServer,
      eventBus,
      logger
    );
  }
  return orchestratorInstance;
}

export function setOrchestratorInstance(instance: Orchestrator): void {
  orchestratorInstance = instance;
}
