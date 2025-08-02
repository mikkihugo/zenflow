import { ConfigManager } from '../config/config-manager';
import { createLogger, EventBus, Orchestrator } from '../core';
import { HTTPMCPServer as MCPServer } from '../interfaces/mcp';
import { MemoryManager } from '../memory/manager';
import { TerminalManager } from '../interfaces/terminal';
import type { CoordinationProvider } from '../types/shared-types';

let orchestratorInstance: Orchestrator | null = null;
let coordinationProvider: CoordinationProvider | null = null;

/**
 * Set the coordination provider (dependency injection)
 * This breaks the direct dependency on coordination module
 */
export function setCoordinationProvider(provider: CoordinationProvider): void {
  coordinationProvider = provider;
}

/**
 * Factory function to create orchestrator with injected dependencies
 * @param customCoordinationProvider Optional coordination provider override
 */
export function createOrchestratorInstance(
  customCoordinationProvider?: CoordinationProvider
): Orchestrator {
  const configManager = ConfigManager.getInstance();
  const config = configManager.config;
  const logger = createLogger({ prefix: 'orchestrator' });
  const eventBus = new EventBus();

  const terminalManager = new TerminalManager(config.terminal || {}, logger, eventBus);
  const memoryManager = new MemoryManager(config.memory || {}, logger, eventBus);

  // Use injected coordination provider or fall back to lazy loading
  const coordinationManagerProvider = customCoordinationProvider || coordinationProvider;

  const mcpServer = new MCPServer(
    config.mcp || { port: 3000, host: 'localhost', timeout: 30000 }
  );

  // Create orchestrator without direct coordination dependency
  // The coordination manager will be injected at runtime
  const orchestrator = new Orchestrator(
    config.orchestrator || {},
    terminalManager,
    memoryManager,
    coordinationManagerProvider as any, // Type assertion for now, will be properly typed later
    mcpServer,
    eventBus,
    logger
  );

  return orchestrator;
}

/**
 * Get or create orchestrator instance (singleton pattern)
 * @deprecated Use createOrchestratorInstance for better dependency management
 */
export function getOrchestratorInstance(): Orchestrator {
  if (!orchestratorInstance) {
    // Lazy load coordination manager only when needed
    if (!coordinationProvider) {
      // Dynamic import to break circular dependency
      import('../coordination/manager')
        .then(({ CoordinationManager }) => {
          const configManager = ConfigManager.getInstance();
          const config = configManager.config;
          const logger = createLogger({ prefix: 'coordination' });
          const eventBus = new EventBus();

          const coordinationManager = new CoordinationManager(
            config.coordination || { maxAgents: 50, heartbeatInterval: 10000, timeout: 30000 },
            logger,
            eventBus
          );

          setCoordinationProvider(coordinationManager as any);
        })
        .catch((error) => {
          console.warn('Failed to load coordination manager:', error);
        });
    }

    orchestratorInstance = createOrchestratorInstance(coordinationProvider || undefined);
  }
  return orchestratorInstance;
}

export function setOrchestratorInstance(instance: Orchestrator): void {
  orchestratorInstance = instance;
}
