interface CoordinationManager {
    coordinate?: () => Promise<void>;
    initialize?: () => Promise<void>;
    stop?: () => Promise<void>;
    coordinateTask?: (task: Task) => Promise<void>;
    isHealthy?: () => Promise<boolean>;
}
interface EventBus {
    emit?: (event: string, data?: unknown) => void;
}
interface MemoryManager {
    store?: (key: string, value: unknown) => Promise<void>;
    initialize?: () => Promise<void>;
    stop?: () => Promise<void>;
    storeTask?: (task: Task) => Promise<void>;
    isHealthy?: () => Promise<boolean>;
}
interface TerminalManager {
    execute?: (command: string) => Promise<void>;
    initialize?: () => Promise<void>;
    stop?: () => Promise<void>;
    isHealthy?: () => Promise<boolean>;
}
interface OrchestratorConfig {
    name: string;
    timeout: number;
    maxConcurrentTasks: number;
    enableHealthCheck: boolean;
    healthCheckInterval: number;
}
interface Task {
    id: string;
    type: string;
    description: string;
    priority: number;
    input: unknown;
    metadata: {
        userId: string;
        sessionId: string;
    };
}
interface TaskResult {
    id: string;
    status: 'success' | 'failure' | 'timeout';
    result?: unknown;
    error?: string;
    duration: number;
}
interface OrchestratorDependencies {
    terminalManager: TerminalManager;
    memoryManager: MemoryManager;
    coordinationManager: CoordinationManager;
    eventBus: EventBus;
}
export declare class Orchestrator {
    private config;
    private logger;
    private isStarted;
    private activeTasks;
    private terminalManager;
    private memoryManager;
    private coordinationManager;
    private eventBus;
    constructor(config: OrchestratorConfig, dependencies: OrchestratorDependencies, customLogger?: import("@claude-zen/foundation").Logger);
    start(): Promise<void>;
    stop(): Promise<void>;
    executeTask(task: Task): Promise<TaskResult>;
    private processTask;
    private executeTaskLogic;
    private executeNeuralTraining;
    private executeDataProcessing;
    private executeSystemCoordination;
    private startHealthCheck;
    getHealthStatus(): Promise<{
        healthy: boolean;
        details: unknown;
    }>;
    getActiveTasks(): string[];
}
export {};
//# sourceMappingURL=orchestrator.d.ts.map