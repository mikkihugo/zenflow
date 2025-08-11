/**
 * Swarm coordination tokens for dependency injection.
 * Defines tokens for swarm and agent management services.
 */
/**
 * @file Swarm-tokens implementation.
 */
export interface ISwarmCoordinator {
    initializeSwarm(options: any): Promise<void>;
    addAgent(config: any): Promise<string>;
    removeAgent(agentId: string): Promise<void>;
    assignTask(task: any): Promise<string>;
    getMetrics(): any;
    shutdown(): Promise<void>;
}
export interface IAgentRegistry {
    registerAgent(agent: any): Promise<void>;
    unregisterAgent(agentId: string): Promise<void>;
    getAgent(agentId: string): Promise<any>;
    getActiveAgents(): Promise<any[]>;
    findAvailableAgents(criteria: any): Promise<any[]>;
}
export interface IMessageBroker {
    publish(topic: string, message: any): Promise<void>;
    subscribe(topic: string, handler: (message: any) => void): Promise<void>;
    unsubscribe(topic: string, handler: (message: any) => void): Promise<void>;
    broadcast(message: any): Promise<void>;
}
export interface ILoadBalancer {
    selectAgent(criteria: any): Promise<string>;
    updateAgentLoad(agentId: string, load: number): Promise<void>;
    getLoadMetrics(): Promise<any>;
}
export interface ITopologyManager {
    createTopology(type: string, options: any): Promise<void>;
    updateTopology(changes: any): Promise<void>;
    getTopologyInfo(): Promise<any>;
    validateTopology(): Promise<boolean>;
}
export declare const SWARM_TOKENS: {
    readonly SwarmCoordinator: import("../index.ts").DIToken<ISwarmCoordinator>;
    readonly AgentRegistry: import("../index.ts").DIToken<IAgentRegistry>;
    readonly MessageBroker: import("../index.ts").DIToken<IMessageBroker>;
    readonly LoadBalancer: import("../index.ts").DIToken<ILoadBalancer>;
    readonly TopologyManager: import("../index.ts").DIToken<ITopologyManager>;
};
//# sourceMappingURL=swarm-tokens.d.ts.map