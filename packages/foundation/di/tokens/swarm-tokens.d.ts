/**
 * Swarm coordination tokens for dependency injection.
 * Defines tokens for swarm and agent management services.
 */
/**
 * @file Swarm-tokens implementation.
 */
export interface AgentInfo {
    id: string;
    type: 'researcher' | 'coder' | 'analyst' | 'coordinator' | 'tester' | 'architect';
    status: 'active' | 'idle' | 'busy' | 'offline';
    capabilities: string[];
    currentLoad: number;
    maxLoad: number;
    createdAt: Date;
    lastActivity: Date;
}
export interface SwarmOptions {
    name: string;
    topology: 'mesh' | 'hierarchical' | 'ring' | 'star';
    maxAgents: number;
    strategy: 'balanced' | 'specialized' | 'adaptive';
}
export interface AgentConfig {
    type: AgentInfo['type'];
    capabilities: string[];
    maxLoad?: number;
    resources?: Record<string, unknown>;
}
export interface TaskAssignment {
    id: string;
    type: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    estimatedDuration?: number;
    requiredCapabilities: string[];
    payload: Record<string, unknown>;
}
export interface SwarmMetrics {
    totalAgents: number;
    activeAgents: number;
    completedTasks: number;
    pendingTasks: number;
    averageResponseTime: number;
    successRate: number;
}
export interface AgentCriteria {
    type?: AgentInfo['type'];
    capabilities?: string[];
    maxLoad?: number;
    status?: AgentInfo['status'];
}
export interface TopologyInfo {
    type: string;
    nodeCount: number;
    connections: Array<{
        from: string;
        to: string;
        weight?: number;
    }>;
    properties: Record<string, unknown>;
}
export interface LoadMetrics {
    agentId: string;
    currentLoad: number;
    maxLoad: number;
    utilizationRate: number;
    responseTime: number;
}
export interface SwarmCoordinator {
    initializeSwarm(options: SwarmOptions): Promise<void>;
    addAgent(config: AgentConfig): Promise<string>;
    removeAgent(agentId: string): Promise<void>;
    assignTask(task: TaskAssignment): Promise<string>;
    getMetrics(): Promise<SwarmMetrics>;
    shutdown(): Promise<void>;
}
export interface AgentRegistry {
    registerAgent(agent: AgentInfo): Promise<void>;
    unregisterAgent(agentId: string): Promise<void>;
    getAgent(agentId: string): Promise<AgentInfo | null>;
    getActiveAgents(): Promise<AgentInfo[]>;
    findAvailableAgents(criteria: AgentCriteria): Promise<AgentInfo[]>;
}
export interface MessageBroker {
    publish(topic: string, message: Record<string, unknown>): Promise<void>;
    subscribe(topic: string, handler: (message: Record<string, unknown>) => void): Promise<void>;
    unsubscribe(topic: string, handler: (message: Record<string, unknown>) => void): Promise<void>;
    broadcast(message: Record<string, unknown>): Promise<void>;
}
export interface LoadBalancer {
    selectAgent(criteria: AgentCriteria): Promise<string>;
    updateAgentLoad(agentId: string, load: number): Promise<void>;
    getLoadMetrics(): Promise<LoadMetrics[]>;
}
export interface TopologyManager {
    createTopology(type: string, options: Record<string, unknown>): Promise<void>;
    updateTopology(changes: Record<string, unknown>): Promise<void>;
    getTopologyInfo(): Promise<TopologyInfo>;
    validateTopology(): Promise<boolean>;
}
export declare const SWARM_TOKENS: {
    readonly SwarmCoordinator: import("..").DIToken<SwarmCoordinator>;
    readonly AgentRegistry: import("..").DIToken<AgentRegistry>;
    readonly MessageBroker: import("..").DIToken<MessageBroker>;
    readonly LoadBalancer: import("..").DIToken<LoadBalancer>;
    readonly TopologyManager: import("..").DIToken<TopologyManager>;
};
//# sourceMappingURL=swarm-tokens.d.ts.map