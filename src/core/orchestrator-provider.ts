import { config } from '../config';
import { HTTPMCPServer as MCPServer } from '../interfaces/mcp';
import { TerminalManager } from '../interfaces/terminal';
import { MemoryManager } from '../memory/index';
import type { CoordinationProvider } from '../types/shared-types';
import { EventBus } from './event-bus';
import { createLogger } from './logger';
import { Orchestrator } from './orchestrator';

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
  const logger = createLogger({ prefix: 'orchestrator' });
  const eventBus = new EventBus();

  // Get configuration sections from unified config
  const terminalConfig = config.getSection('interfaces').terminal;
  const memoryConfig = config.getSection('storage').memory;
  const coordinationConfig = config.getSection('coordination');
  const mcpConfig = config.getSection('interfaces').mcp.http;

  const terminalManager = new TerminalManager(terminalConfig, logger, eventBus);
  const memoryManager = new MemoryManager(memoryConfig, logger, eventBus);

  // Use injected coordination provider or fall back to lazy loading
  const coordinationManagerProvider = customCoordinationProvider || coordinationProvider;

  const mcpServer = new MCPServer(mcpConfig);

  // Create orchestrator with proper coordination configuration
  const orchestrator = new Orchestrator(
    coordinationConfig, // Use coordination config instead of empty object
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
          const coordinationConfig = config.getSection('coordination');
          const logger = createLogger({ prefix: 'coordination' });
          const eventBus = new EventBus();

          const coordinationManager = new CoordinationManager(coordinationConfig, logger, eventBus);

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
