/**
 * @file Pattern Integration Layer
 * Integrates all design patterns with direct TypeScript coordination system.
 *
 * Architecture:
 * - Internal Communication: Direct TypeScript function calls between services
 * - External Web API: Dedicated web interface components (see src/interfaces/web/)
 * - No internal protocol adapters (REST/WebSocket) - pure TypeScript integration
 */
import { EventEmitter } from 'node:events';
import { type HierarchicalAgentGroup, type TaskDefinition } from '../coordination/agents/composite-system';
import { type CoordinationContext, type CoordinationResult, SwarmCoordinator, type SwarmTopology } from '../coordination/swarm/core/strategy';
import { ClaudeZenFacade, type SwarmService } from '../core/facade';
import { SystemEventManager } from '../interfaces/events/observer-system';
export interface IntegrationConfig {
    swarm: {
        defaultTopology: SwarmTopology;
        maxAgents: number;
        enableAutoOptimization: boolean;
    };
    events: {
        enableMetrics: boolean;
        enableLogging: boolean;
        enableWebSocketUpdates: boolean;
        enableDatabasePersistence: boolean;
    };
    commands: {
        enableUndo: boolean;
        enableBatchOperations: boolean;
        enableTransactions: boolean;
        maxConcurrentCommands: number;
    };
    webAPI: {
        enableHTTPEndpoints: boolean;
        enableWebSocketUpdates: boolean;
        enableExternalAccess: boolean;
        port: number;
    };
    agents: {
        enableHierarchicalGroups: boolean;
        defaultLoadBalancing: 'round-robin' | 'least-loaded' | 'capability-based';
        maxGroupDepth: number;
    };
}
export declare class IntegratedSwarmService implements SwarmService {
    private swarmCoordinator;
    private eventManager;
    private agentManager;
    constructor(swarmCoordinator: SwarmCoordinator, eventManager: SystemEventManager, agentManager: AgentManager);
    initializeSwarm(config: unknown): Promise<unknown>;
    getSwarmStatus(swarmId: string): Promise<unknown>;
    destroySwarm(swarmId: string): Promise<void>;
    coordinateSwarm(swarmId: string, context: CoordinationContext): Promise<CoordinationResult>;
    spawnAgent(swarmId: string, agentConfig: unknown): Promise<unknown>;
    listSwarms(): Promise<any[]>;
    private createCommandContext;
}
export declare class AgentManager extends EventEmitter {
    private swarmGroups;
    private individualAgents;
    private config;
    constructor(config: IntegrationConfig);
    createSwarmGroup(swarmId: string, swarmConfig: unknown): Promise<HierarchicalAgentGroup>;
    destroySwarmGroup(swarmId: string): Promise<void>;
    getSwarmGroup(swarmId: string): HierarchicalAgentGroup | undefined;
    addAgentToSwarm(swarmId: string, agentId: string, agentConfig: unknown): Promise<void>;
    removeAgentFromSwarm(swarmId: string, agentId: string): Promise<void>;
    listSwarmGroups(): unknown[];
    executeTaskOnSwarm(swarmId: string, task: TaskDefinition): Promise<unknown>;
    private createAgent;
}
export declare class IntegratedPatternSystem extends EventEmitter {
    private config;
    private eventManager;
    private swarmCoordinator;
    private agentManager;
    private swarmService;
    private facade;
    constructor(config: IntegrationConfig, logger: unknown, metrics: unknown);
    private initializeEventSystem;
    private initializeCommandSystem;
    private initializeCoordinationSystem;
    private initializeAgentSystem;
    private initializeSwarmService;
    private initializeFacade;
    private setupIntegrationEventHandlers;
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    getFacade(): ClaudeZenFacade;
    getEventManager(): SystemEventManager;
    getSwarmCoordinator(): SwarmCoordinator;
    getAgentManager(): AgentManager;
    createIntegratedSwarm(config: unknown): Promise<unknown>;
    executeIntegratedTask(swarmId: string, taskDefinition: unknown): Promise<unknown>;
    getIntegratedSystemStatus(): unknown;
    /**
     * Create neural service with mock implementation.
     * Note: Real neural modules not yet implemented - using mock service.
     */
    private createRealNeuralService;
    /**
     * Create real memory service connected to actual memory coordinator.
     */
    private createRealMemoryService;
    /**
     * Create real database service connected to DAL Factory.
     */
    private createRealDatabaseService;
    /**
     * Create real interface service connected to actual interface managers.
     */
    private createRealInterfaceService;
    /**
     * Create real workflow service connected to actual workflow engine.
     */
    private createRealWorkflowService;
}
export declare class ConfigurationFactory {
    static createDefaultConfig(): IntegrationConfig;
    static createProductionConfig(): IntegrationConfig;
    static createDevelopmentConfig(): IntegrationConfig;
}
//# sourceMappingURL=pattern-integration.d.ts.map