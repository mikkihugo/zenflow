/**
 * Web Data Service - Business logic and data management.
 *
 * Handles all business logic for the web dashboard.
 * Provides data services for API endpoints with mock implementations.
 */
/**
 * @file Web-data service implementation.
 */
export interface SystemStatusData {
    system: string;
    version: string;
    swarms: {
        active: number;
        total: number;
    };
    tasks: {
        pending: number;
        active: number;
        completed: number;
    };
    resources: {
        cpu: string;
        memory: string;
        disk: string;
    };
    uptime: string;
}
export interface SwarmData {
    id: string;
    name: string;
    status: string;
    agents: number;
    tasks: number;
    progress: number;
    createdAt?: string;
}
export interface TaskData {
    id: string;
    title: string;
    status: string;
    assignedAgents: string[];
    progress: number;
    eta: string;
    createdAt?: string;
}
export interface DocumentData {
    id: string;
    type: string;
    title: string;
    status: string;
    lastModified: string;
}
export interface CommandResult {
    command: string;
    args: any[];
    output: string;
    exitCode: number;
    timestamp: string;
}
export declare class WebDataService {
    private logger;
    /**
     * Get comprehensive system status.
     */
    getSystemStatus(): Promise<SystemStatusData>;
    /**
     * Get all swarms.
     */
    getSwarms(): Promise<SwarmData[]>;
    /**
     * Create new swarm.
     *
     * @param config
     */
    createSwarm(config: any): Promise<SwarmData>;
    /**
     * Get all tasks.
     */
    getTasks(): Promise<TaskData[]>;
    /**
     * Create new task.
     *
     * @param config
     */
    createTask(config: any): Promise<TaskData>;
    /**
     * Get all documents.
     */
    getDocuments(): Promise<DocumentData[]>;
    /**
     * Execute command.
     *
     * @param command
     * @param args
     */
    executeCommand(command: string, args: any[]): Promise<CommandResult>;
    /**
     * Get service statistics.
     */
    getServiceStats(): {
        requestsServed: number;
        averageResponseTime: number;
        cacheHitRate: number;
    };
}
//# sourceMappingURL=web-data-service.d.ts.map