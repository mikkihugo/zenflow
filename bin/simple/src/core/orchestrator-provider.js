import { config } from '../config/index.js';
import { getLogger } from '../config/logging-config.ts';
import { HTTPMCPServer as MCPServer } from '../interfaces/mcp/index.js';
import { TerminalManager } from '../interfaces/terminal/index.js';
import { MemoryManager } from '../memory/index.ts';
import { EventBus } from './event-bus.ts';
import { Orchestrator } from './orchestrator.ts';
let orchestratorInstance = null;
let coordinationProvider = null;
export function setCoordinationProvider(provider) {
    coordinationProvider = provider;
}
export function createOrchestratorInstance(customCoordinationProvider) {
    const logger = getLogger('orchestrator');
    const eventBus = new EventBus();
    const terminalConfig = config?.getSection('interfaces').terminal;
    const memoryConfig = config?.getSection('storage').memory;
    const coordinationConfig = config?.getSection('coordination');
    const mcpConfig = config?.getSection('interfaces').mcp.http;
    const terminalManager = new TerminalManager(terminalConfig, logger, eventBus);
    const memoryManager = new MemoryManager(memoryConfig);
    const coordinationManagerProvider = customCoordinationProvider || coordinationProvider;
    const mcpServer = new MCPServer(mcpConfig);
    const orchestrator = new Orchestrator(coordinationConfig, terminalManager, memoryManager, coordinationManagerProvider, mcpServer, eventBus, logger);
    return orchestrator;
}
export function getOrchestratorInstance() {
    if (!orchestratorInstance) {
        if (!coordinationProvider) {
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
//# sourceMappingURL=orchestrator-provider.js.map