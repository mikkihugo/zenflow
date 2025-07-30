// src/swarm/types.ts
// TODO: These are stubs. Implement the actual types.

export interface SwarmConfig {
    name: string;
    description: string;
    version: string;
    mode: string;
    strategy: string;
    coordinationStrategy: { name: string; description: string; agentSelection: string; taskScheduling: string; loadBalancing: string; faultTolerance: string; communication: string; };
    maxAgents: number;
    maxTasks: number;
    maxDuration: number;
    taskTimeoutMinutes: number;
    resourceLimits: { memory: number; cpu: number; disk: number; network: number; };
    qualityThreshold: number;
    reviewRequired: boolean;
    testingRequired: boolean;
    monitoring: { metricsEnabled: boolean; loggingEnabled: boolean; tracingEnabled: boolean; metricsInterval: number; heartbeatInterval: number; healthCheckInterval: number; retentionPeriod: number; maxLogSize: number; maxMetricPoints: number; alertingEnabled: boolean; alertThresholds: object; exportEnabled: boolean; exportFormat: string; exportDestination: string; };
    memory: { namespace: string; partitions: any[]; permissions: { read: string; write: string; delete: string; share: string; }; persistent: boolean; backupEnabled: boolean; distributed: boolean; consistency: string; cacheEnabled: boolean; compressionEnabled: boolean; };
    security: { authenticationRequired: boolean; authorizationRequired: boolean; encryptionEnabled: boolean; defaultPermissions: string[]; adminRoles: string[]; auditEnabled: boolean; auditLevel: string; inputValidation: boolean; outputSanitization: boolean; };
    performance: { maxConcurrency: number; defaultTimeout: number; cacheEnabled: boolean; cacheSize: number; cacheTtl: number; optimizationEnabled: boolean; adaptiveScheduling: boolean; predictiveLoading: boolean; resourcePooling: boolean; connectionPooling: boolean; memoryPooling: boolean; };
    maxRetries: number;
    autoScaling: boolean;
    loadBalancing: boolean;
    faultTolerance: boolean;
    realTimeMonitoring: boolean;
    maxThroughput: number;
    latencyTarget: number;
    reliabilityTarget: number;
    mcpIntegration: boolean;
    hiveIntegration: boolean;
    claudeCodeIntegration: boolean;
    neuralProcessing: boolean;
    learningEnabled: boolean;
    adaptiveScheduling: boolean;
}

export interface SwarmObjective {
    id: any;
    name: string;
    description: string;
    strategy: string;
    mode: string;
    requirements: { minAgents: number; maxAgents: number; agentTypes: any[]; estimatedDuration: number; maxDuration: number; qualityThreshold: number; reviewCoverage: number; testCoverage: number; reliabilityTarget: number; };
    constraints: { maxCost: number; resourceLimits: any; minQuality: number; requiredApprovals: any[]; allowedFailures: number; recoveryTime: number; milestones: any[]; deadline?: Date; };
    tasks: any[];
    dependencies: any[];
    status: string;
    progress: any;
    createdAt: Date;
    results: any;
    metrics: any;
    startedAt?: Date;
    completedAt?: Date;
}

export interface SwarmAgent {
    id: any;
    name: string;
    type: any;
    status: string;
    capabilities: any[];
    metrics: { tasksCompleted: number; tasksFailed: number; totalDuration: number; lastActivity: Date; };
}

export interface SwarmTask {
    id: any;
    type: any;
    name: string;
    description: string;
    requirements: { capabilities: any[]; tools: string[]; permissions: string[]; estimatedDuration: number; maxDuration: number; memoryRequired: number; };
    constraints: { dependencies: any[]; dependents: any[]; conflicts: any[]; maxRetries: number; timeoutAfter: number; };
    priority: any;
    input: object;
    instructions: string;
    context: object;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    attempts: any[];
    statusHistory: any[];
}

export interface SwarmId {
    id: string;
    timestamp: number;
    namespace: string;
}

export interface AgentId {
    id: string;
}

export interface TaskId {
    id: string;
}

export interface SwarmStatus {}
export interface SwarmProgress {
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    runningTasks: number;
    percentComplete: number;
    estimatedCompletion: Date;
    timeRemaining: number;
    averageQuality: number;
    passedReviews: number;
    passedTests: number;
    resourceUtilization: object;
    costSpent: number;
    activeAgents: number;
    idleAgents: number;
    busyAgents: number;
}
export interface SwarmResults {
    outputs: object;
    artifacts: object;
    reports: object;
    overallQuality: number;
    qualityByTask: object;
    totalExecutionTime: number;
    resourcesUsed: object;
    efficiency: number;
    objectivesMet: any[];
    objectivesFailed: any[];
    improvements: any[];
    nextActions: any[];
}
export interface SwarmMetrics {
    throughput: number;
    latency: number;
    efficiency: number;
    reliability: number;
    averageQuality: number;
    defectRate: number;
    reworkRate: number;
    resourceUtilization: object;
    costEfficiency: number;
    agentUtilization: number;
    agentSatisfaction: number;
    collaborationEffectiveness: number;
    scheduleVariance: number;
    deadlineAdherence: number;
}
export interface TaskDefinition {
    id: any;
    type: any;
    name: string;
    description: string;
    requirements: { capabilities: any[]; tools: string[]; permissions: string[]; estimatedDuration: number; maxDuration: number; memoryRequired: number; };
    constraints: { dependencies: any[]; dependents: any[]; conflicts: any[]; maxRetries: number; timeoutAfter: number; };
    priority: any;
    input: object;
    instructions: string;
    context: object;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    attempts: any[];
    statusHistory: any[];
}
export interface AgentState {}
export interface AgentCapabilities {}
export interface TaskResult {}
export interface SwarmEvent {}
export enum EventType {
    SWARM_CREATED = 'swarm:created',
    SWARM_STARTED = 'swarm:started',
    SWARM_COMPLETED = 'swarm:completed',
    SWARM_FAILED = 'swarm:failed',
    AGENT_REGISTERED = 'agent:registered',
    TASK_SCHEDULED = 'task:scheduled',
    TASK_COMPLETED = 'task:completed',
    TASK_FAILED = 'task:failed',
    HEALTH_WARNING = 'health:warning',
    ORCHESTRATOR_INITIALIZED = 'orchestrator:initialized',
    ORCHESTRATOR_SHUTDOWN = 'orchestrator:shutdown',
}

export const SWARM_CONSTANTS = {};