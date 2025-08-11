/**
 * Swarm Status State Hook.
 *
 * React hook for managing swarm state and providing real-time updates.
 * Note: This is a React hook, NOT a Claude Code hook (which belongs in templates/).
 */
/**
 * @file Interface implementation: use-swarm-status.
 */
export interface SwarmMetrics {
    totalAgents: number;
    activeAgents: number;
    tasksInProgress: number;
    tasksCompleted: number;
    totalTasks: number;
    uptime: number;
    performance: {
        throughput: number;
        errorRate: number;
        avgLatency: number;
    };
}
export interface SwarmAgent {
    id: string;
    role: 'coordinator' | 'worker' | string;
    status: 'active' | 'idle' | 'busy';
    capabilities: string[];
    lastActivity: Date;
    metrics: {
        tasksCompleted: number;
        averageResponseTime: number;
        errors: number;
        successRate: number;
        totalTasks: number;
    };
    cognitivePattern: string;
    performanceScore: number;
}
export interface SwarmTask {
    id: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    progress: number;
    assignedAgents: string[];
    priority: 'low' | 'medium' | 'high';
    startTime?: Date;
    estimatedDuration?: number;
}
export interface SwarmStatus {
    status: 'idle' | 'active' | 'paused' | 'error' | 'unknown';
    topology: 'mesh' | 'hierarchical' | 'ring' | 'star';
    totalAgents: number;
    activeAgents: number;
    uptime: number;
}
export interface SwarmState {
    status: SwarmStatus;
    metrics: SwarmMetrics;
    agents: SwarmAgent[];
    tasks: SwarmTask[];
    lastUpdated: Date;
}
export interface UseSwarmStatusOptions {
    autoRefresh?: boolean;
    refreshInterval?: number;
    enableMockData?: boolean;
}
export interface UseSwarmStatusReturn {
    swarmState: SwarmState;
    isLoading: boolean;
    error?: Error;
    refreshStatus: () => Promise<void>;
    startAgent: (agentConfig: Partial<SwarmAgent>) => Promise<void>;
    stopAgent: (agentId: string) => Promise<void>;
    createTask: (taskConfig: Partial<SwarmTask>) => Promise<void>;
    updateTask: (taskId: string, updates: Partial<SwarmTask>) => Promise<void>;
}
/**
 * Swarm Status React Hook.
 *
 * Provides reactive swarm state management with real-time updates for React components.
 *
 * @param options
 */
export declare const useSwarmStatus: (options?: UseSwarmStatusOptions) => UseSwarmStatusReturn;
export default useSwarmStatus;
//# sourceMappingURL=use-swarm-status.d.ts.map