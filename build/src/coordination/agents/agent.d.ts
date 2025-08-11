/**
 * @file Coordination system: agent.
 */
import type { Agent, AgentConfig, AgentMetrics, AgentState, AgentStatus, AgentType, ExecutionResult, Message, Task } from '../types.ts';
export declare class BaseAgent implements Agent {
    id: string;
    type: AgentType;
    metrics: AgentMetrics;
    config: AgentConfig;
    state: AgentState;
    connections: string[];
    private messageHandlers;
    private wasmAgentId?;
    get status(): AgentStatus;
    set status(value: AgentStatus);
    constructor(config: AgentConfig);
    private setupMessageHandlers;
    protected executeTaskByType(task: Task): Promise<any>;
    communicate(message: Message): Promise<void>;
    update(state: Partial<AgentState>): void;
    private updatePerformanceMetrics;
    private handleTaskAssignment;
    private handleCoordination;
    private handleKnowledgeShare;
    private handleStatusUpdate;
    setWasmAgentId(id: number): void;
    getWasmAgentId(): number | undefined;
    initialize(): Promise<void>;
    execute(task: Task): Promise<ExecutionResult>;
    handleMessage(message: Message): Promise<void>;
    updateState(updates: Partial<AgentState>): void;
    getStatus(): AgentStatus;
    shutdown(): Promise<void>;
}
/**
 * Specialized agent for research tasks.
 *
 * @example
 */
export declare class ResearcherAgent extends BaseAgent {
    constructor(config: Omit<AgentConfig, 'type'>);
    protected executeTaskByType(task: Task): Promise<any>;
}
/**
 * Specialized agent for coding tasks.
 *
 * @example
 */
export declare class CoderAgent extends BaseAgent {
    constructor(config: Omit<AgentConfig, 'type'>);
    protected executeTaskByType(task: Task): Promise<any>;
}
/**
 * Specialized agent for analysis tasks.
 *
 * @example
 */
export declare class AnalystAgent extends BaseAgent {
    constructor(config: Omit<AgentConfig, 'type'>);
    protected executeTaskByType(task: Task): Promise<any>;
}
/**
 * Factory function to create specialized agents.
 *
 * @param config
 * @example
 */
export declare function createAgent(config: AgentConfig): Agent;
/**
 * Agent pool for managing multiple agents.
 *
 * @example
 */
export declare class AgentPool {
    private agents;
    private availableAgents;
    addAgent(agent: Agent): void;
    removeAgent(agentId: string): void;
    getAgent(agentId: string): Agent | undefined;
    getAvailableAgent(preferredType?: string): Agent | undefined;
    releaseAgent(agentId: string): void;
    getAllAgents(): Agent[];
    getAgentsByType(type: string): Agent[];
    getAgentsByStatus(status: AgentStatus): Agent[];
    shutdown(): Promise<void>;
}
//# sourceMappingURL=agent.d.ts.map