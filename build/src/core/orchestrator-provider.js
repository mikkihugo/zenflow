/**
 * @file Orchestrator-provider implementation.
 */
import { config } from '../config';
import { getLogger } from '../config/logging-config.ts';
import { HTTPMCPServer as MCPServer } from '../interfaces/mcp';
import { TerminalManager } from '../interfaces/terminal';
import { MemoryManager } from '../memory/index.ts';
import { EventBus } from './event-bus.ts';
import { Orchestrator } from './orchestrator.ts';
let orchestratorInstance = null;
let coordinationProvider = null;
/**
 * Set the coordination provider (dependency injection)
 * This breaks the direct dependency on coordination module.
 *
 * @param provider
 * @example
 */
export function setCoordinationProvider(provider) {
    coordinationProvider = provider;
}
/**
 * Factory function to create orchestrator with injected dependencies.
 *
 * @param customCoordinationProvider Optional coordination provider override.
 * @example
 */
export function createOrchestratorInstance(customCoordinationProvider) {
    const logger = getLogger('orchestrator');
    const eventBus = new EventBus();
    // Get configuration sections from unified config
    const terminalConfig = config?.getSection('interfaces').terminal;
    const memoryConfig = config?.getSection('storage').memory;
    const coordinationConfig = config?.getSection('coordination');
    const mcpConfig = config?.getSection('interfaces').mcp.http;
    const terminalManager = new TerminalManager(terminalConfig, logger, eventBus);
    const memoryManager = new MemoryManager(memoryConfig);
    // Use injected coordination provider or fall back to lazy loading
    const coordinationManagerProvider = customCoordinationProvider || coordinationProvider;
    const mcpServer = new MCPServer(mcpConfig);
    // Create orchestrator with proper coordination configuration
    const orchestrator = new Orchestrator(coordinationConfig, // Use coordination config instead of empty object
    terminalManager, memoryManager, coordinationManagerProvider, // Type assertion for now, will be properly typed later
    mcpServer, eventBus, logger);
    return orchestrator;
}
/**
 * Get or create orchestrator instance (singleton pattern).
 *
 * @deprecated Use createOrchestratorInstance for better dependency management.
 * @example
 */
export function getOrchestratorInstance() {
    if (!orchestratorInstance) {
        // Lazy load coordination manager only when needed
        if (!coordinationProvider) {
            // Dynamic import to break circular dependency
            import('../coordination/manager.ts')
                .then(({ CoordinationManager }) => {
                const coordinationConfig = config?.getSection('coordination');
                const logger = getLogger('coordination');
                const eventBus = new EventBus();
                const coordinationManager = new CoordinationManager(coordinationConfig, logger, eventBus);
                setCoordinationProvider(coordinationManager);
            })
                .catch((error) => {
                const logger = getLogger('orchestrator');
                logger.warn('Failed to load coordination manager:', error);
            });
        }
        orchestratorInstance = createOrchestratorInstance(coordinationProvider || undefined);
    }
    return orchestratorInstance;
}
export function setOrchestratorInstance(instance) {
    orchestratorInstance = instance;
}
