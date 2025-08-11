/**
 * @file Pattern Integration Layer
 * Integrates all design patterns with existing swarm coordination system.
 */
import { EventEmitter } from 'node:events';
import { type HierarchicalAgentGroup, type TaskDefinition } from '../coordination/agents/composite-system.ts';
import { type CoordinationContext, type CoordinationResult, SwarmCoordinator, type SwarmTopology } from '../coordination/swarm/core/strategy.ts';
import { ClaudeZenFacade, type ISwarmService } from '../core/facade.ts';
import { ProtocolManager } from '../integration/adapter-system.ts';
import { SystemEventManager } from '../interfaces/events/observer-system.ts';
import { MCPCommandQueue } from '../interfaces/mcp/command-system.ts';
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
    protocols: {
        enabledAdapters: string[];
        defaultProtocol: string;
        enableAutoFailover: boolean;
    };
    agents: {
        enableHierarchicalGroups: boolean;
        defaultLoadBalancing: 'round-robin' | 'least-loaded' | 'capability-based';
        maxGroupDepth: number;
    };
}
export declare class IntegratedSwarmService implements ISwarmService {
    private swarmCoordinator;
    private eventManager;
    private commandQueue;
    private agentManager;
    constructor(swarmCoordinator: SwarmCoordinator, eventManager: SystemEventManager, commandQueue: MCPCommandQueue, agentManager: AgentManager);
    initializeSwarm(config: any): Promise<any>;
    getSwarmStatus(swarmId: string): Promise<any>;
    destroySwarm(swarmId: string): Promise<void>;
    coordinateSwarm(swarmId: string, context: CoordinationContext): Promise<CoordinationResult>;
    spawnAgent(swarmId: string, agentConfig: any): Promise<any>;
    listSwarms(): Promise<any[]>;
    private createCommandContext;
}
export declare class AgentManager extends EventEmitter {
    private swarmGroups;
    private individualAgents;
    private config;
    constructor(config: IntegrationConfig);
    createSwarmGroup(swarmId: string, swarmConfig: any): Promise<HierarchicalAgentGroup>;
    destroySwarmGroup(swarmId: string): Promise<void>;
    getSwarmGroup(swarmId: string): HierarchicalAgentGroup | undefined;
    addAgentToSwarm(swarmId: string, agentId: string, agentConfig: any): Promise<void>;
    removeAgentFromSwarm(swarmId: string, agentId: string): Promise<void>;
    listSwarmGroups(): unknown[];
    executeTaskOnSwarm(swarmId: string, task: TaskDefinition): Promise<any>;
    private createAgent;
}
export declare class IntegratedPatternSystem extends EventEmitter {
    private config;
    private eventManager;
    private commandQueue;
    private swarmCoordinator;
    private protocolManager;
    private agentManager;
    private swarmService;
    private facade;
    constructor(config: IntegrationConfig, logger: any, metrics: any);
    private initializeEventSystem;
    private initializeCommandSystem;
    private initializeCoordinationSystem;
    private initializeProtocolSystem;
    private initializeAgentSystem;
    private initializeSwarmService;
    private initializeFacade;
    private setupIntegrationEventHandlers;
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    getFacade(): ClaudeZenFacade;
    getEventManager(): SystemEventManager;
    getCommandQueue(): MCPCommandQueue;
    getSwarmCoordinator(): SwarmCoordinator;
    getProtocolManager(): ProtocolManager;
    getAgentManager(): AgentManager;
    createIntegratedSwarm(config: any): Promise<any>;
    executeIntegratedTask(swarmId: string, taskDefinition: any): Promise<any>;
    broadcastToProtocols(message: any): Promise<any[]>;
    getIntegratedSystemStatus(): any;
    private initializeProtocols;
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