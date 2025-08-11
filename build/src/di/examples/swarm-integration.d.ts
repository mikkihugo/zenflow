/**
 * Example integration of SwarmCoordinator with Dependency Injection.
 * Demonstrates how to migrate existing services to use DI patterns.
 */
/**
 * @file Swarm-integration implementation.
 */
import { DIContainer, type IAgentRegistry, type IConfig, type ILogger, type IMessageBroker, type ISwarmCoordinator } from '../index.ts';
/**
 * Enhanced SwarmCoordinator using dependency injection.
 * This shows how to refactor existing services to use DI.
 *
 * @example
 */
export declare class EnhancedSwarmCoordinator implements ISwarmCoordinator {
    private _logger;
    private _config;
    private _agentRegistry;
    private _messageBroker;
    private isInitialized;
    private agents;
    private tasks;
    constructor(_logger: ILogger, _config: IConfig, _agentRegistry: IAgentRegistry, _messageBroker: IMessageBroker);
    initializeSwarm(options: any): Promise<void>;
    addAgent(config: any): Promise<string>;
    removeAgent(agentId: string): Promise<void>;
    assignTask(task: any): Promise<string>;
    getMetrics(): any;
    shutdown(): Promise<void>;
}
/**
 * Mock implementations for testing and development.
 *
 * @example
 */
export declare class MockLogger implements ILogger {
    debug(_message: string, _meta?: any): void;
    info(_message: string, _meta?: any): void;
    warn(message: string, meta?: any): void;
    error(message: string, meta?: any): void;
}
export declare class MockConfig implements IConfig {
    private data;
    constructor(initialConfig?: Record<string, any>);
    get<T>(key: string, defaultValue?: T): T;
    set(key: string, value: any): void;
    has(key: string): boolean;
}
export declare class MockAgentRegistry implements IAgentRegistry {
    private agents;
    registerAgent(agent: any): Promise<void>;
    unregisterAgent(agentId: string): Promise<void>;
    getAgent(agentId: string): Promise<any>;
    getActiveAgents(): Promise<any[]>;
    findAvailableAgents(criteria: any): Promise<any[]>;
}
export declare class MockMessageBroker implements IMessageBroker {
    private subscribers;
    publish(topic: string, message: any): Promise<void>;
    subscribe(topic: string, handler: (message: any) => void): Promise<void>;
    unsubscribe(topic: string, handler: (message: any) => void): Promise<void>;
    broadcast(message: any): Promise<void>;
}
/**
 * Factory function to set up a complete DI container with swarm services.
 *
 * @param config
 * @example
 */
export declare function createSwarmContainer(config?: Record<string, any>): DIContainer;
/**
 * Example usage demonstrating the complete workflow.
 *
 * @example
 */
export declare function demonstrateSwarmDI(): Promise<void>;
//# sourceMappingURL=swarm-integration.d.ts.map