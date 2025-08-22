/**
 * Event System Type Definitions.
 *
 * Comprehensive TypeScript types for the event bus system.
 * Replaces loose 'any' types with strict, type-safe interfaces.
 * Following Google TypeScript Style Guide.
 *
 * @file Strict event system type definitions.
 */
/**
 * Base event payload structure.
 *
 * @example
 */
export interface anyPayload {
  readonly timestamp: Date;
  readonly source: string;
  readonly id: string;
  readonly version: string;
}
/**
 * THE COLLECTIVE Events - Borg-style system coordination.
 *
 * @example
 */
export interface CollectiveEvents {
  'collective:initialized': CollectiveInitializedPayload;
  'collective:status:report': CollectiveStatusPayload;
  'collective:shutdown': CollectiveShutdownPayload;
  'collective:health:updated': CollectiveHealthPayload;
  'collective:task:request': TaskRequestPayload;
  'collective:task:assigned': TaskAssignmentPayload;
  'collective:task:completed': TaskCompletionPayload;
  'drone:spawned': DroneSpawnedPayload;
  'drone:terminated': DroneTerminatedPayload;
  'drone:status:changed': DroneStatusPayload;
  'system:started': SystemStartedPayload;
  'system:stopped': SystemStoppedPayload;
  'system:shutdown': SystemStoppedPayload;
  'system:error': SystemErrorPayload;
  'system:health:changed': SystemHealthChangedPayload;
  'system:resource-pressure': SystemResourcePressurePayload;
  'resource:pressure': ResourcePressurePayload;
}
export interface CollectiveInitializedPayload extends anyPayload {
  readonly status: string;
  readonly borgEfficiency: number;
}
export interface CollectiveStatusPayload extends anyPayload {
  readonly status: string;
  readonly activeCubes: number;
  readonly totalDrones: number;
  readonly borgEfficiency: number;
}
export interface CollectiveShutdownPayload extends anyPayload {
  readonly reason?: string;
}
export interface CollectiveHealthPayload extends anyPayload {
  readonly overallStatus: string;
  readonly borgEfficiency: number;
  readonly systemLoad: number;
}
export interface TaskRequestPayload extends anyPayload {
  readonly taskId: string;
  readonly type: string;
  readonly priority: string;
  readonly requiredCapabilities: string[];
}
export interface TaskAssignmentPayload extends anyPayload {
  readonly taskId: string;
  readonly priority: string;
}
export interface TaskCompletionPayload extends anyPayload {
  readonly taskId: string;
  readonly success: boolean;
  readonly borgEfficiency: number;
}
export interface CubeStatusPayload extends anyPayload {
  readonly type: string;
  readonly status: string;
  readonly borgRating: string;
}
export interface MatronRegistrationPayload extends anyPayload {
  readonly capabilities: string[];
}
export interface MatronShutdownPayload extends anyPayload {
}
export interface QueenAssignmentPayload extends anyPayload {
  readonly queenId: string;
}
export interface QueenRemovalPayload extends anyPayload {
  readonly queenId: string;
}
export interface DroneSpawnedPayload extends anyPayload {
  readonly droneId: string;
  readonly type: string;
}
export interface DroneTerminatedPayload extends anyPayload {
  readonly droneId: string;
  readonly reason: string;
}
export interface DroneStatusPayload extends anyPayload {
  readonly droneId: string;
  readonly status: string;
  readonly borgEfficiency: number;
}
export interface SystemStartedPayload extends anyPayload {
  readonly config: SystemConfig;
  readonly modules: readonly string[];
}
export interface SystemStoppedPayload extends anyPayload {
  readonly reason: 'shutdown | error' | 'restart');
  readonly uptime: number;
}
export interface SystemErrorPayload extends anyPayload {
  readonly error: SystemError;
  readonly context?: SystemErrorContext;
}
export interface SystemHealthChangedPayload extends anyPayload {
  readonly previousState: HealthState;
  readonly currentState: HealthState;
  readonly services: ServiceHealthMap;
}
/**
 * Workflow events.
 *
 * @example
 */
export interface WorkflowEvents {
  'workflow:started': WorkflowStartedPayload;
  'workflow:completed': WorkflowCompletedPayload;
  'workflow:failed': WorkflowFailedPayload;
  'workflow:paused': WorkflowPausedPayload;
  'workflow:resumed': WorkflowResumedPayload;
  'workflow:cancelled': WorkflowCancelledPayload;
  'workflow:step:started': WorkflowStepStartedPayload;
  'workflow:step:completed': WorkflowStepCompletedPayload;
  'workflow:step:failed': WorkflowStepFailedPayload;
}
export interface WorkflowStartedPayload extends anyPayload {
  readonly workflowId: string;
  readonly workflowName: string;
  readonly context: WorkflowEventContext;
}
export interface WorkflowCompletedPayload extends anyPayload {
  readonly workflowId: string;
  readonly duration: number;
  readonly results: WorkflowResults;
}
export interface WorkflowFailedPayload extends anyPayload {
  readonly workflowId: string;
  readonly error: WorkflowEventError;
  readonly stepIndex?: number;
}
export interface WorkflowPausedPayload extends anyPayload {
  readonly workflowId: string;
  readonly stepIndex: number;
  readonly reason: string;
}
export interface WorkflowResumedPayload extends anyPayload {
  readonly workflowId: string;
  readonly stepIndex: number;
}
export interface WorkflowCancelledPayload extends anyPayload {
  readonly workflowId: string;
  readonly reason: string;
  readonly stepIndex: number;
}
export interface WorkflowStepStartedPayload extends anyPayload {
  readonly workflowId: string;
  readonly stepIndex: number;
  readonly stepName: string;
  readonly stepType: string;
}
export interface WorkflowStepCompletedPayload extends anyPayload {
  readonly workflowId: string;
  readonly stepIndex: number;
  readonly stepName: string;
  readonly duration: number;
  readonly result: StepEventResult;
}
export interface WorkflowStepFailedPayload extends anyPayload {
  readonly workflowId: string;
  readonly stepIndex: number;
  readonly stepName: string;
  readonly error: WorkflowEventError;
  readonly retryCount: number;
}
/**
 * Coordination events.
 *
 * @example
 */
export interface CoordinationEvents {
  'agent:created': AgentCreatedPayload;
  'agent:destroyed': AgentDestroyedPayload;
  'agent:status:changed': AgentStatusChangedPayload;
  'agent:heartbeat': AgentHeartbeatPayload;
  'agent:registered': AgentRegisteredPayload;
  'agent:capabilities-updated': AgentCapabilitiesUpdatedPayload;
  'agent:performance-update': AgentPerformanceUpdatePayload;
  'agent:unavailable': AgentUnavailablePayload;
  'agent:task-completed': AgentTaskCompletedPayload;
  'agent:task-failed': AgentTaskFailedPayload;
  'agent:error': AgentErrorPayload;
  'task:assigned': TaskAssignedPayload;
  'task:completed': TaskCompletedPayload;
  'task:failed': TaskFailedPayload;
  'task:progress-update': TaskProgressUpdatePayload;
  'task:cancel': TaskCancelPayload;
  'task:assign': TaskAssignPayload;
  'swarm:initialized': SwarmInitializedPayload;
  'swarm:created': SwarmCreatedPayload;
  'swarm:completed': SwarmCompletedPayload;
  'swarm:topology:changed': SwarmTopologyChangedPayload;
  'swarm:knowledge:inject': SwarmKnowledgeInjectPayload;
  'node:connected': NodeConnectedPayload;
  'node:disconnected': NodeDisconnectedPayload;
  'message:received': MessageReceivedPayload;
  'network:partition': NetworkPartitionPayload;
  'agent:spawn:request': AgentSpawnRequestPayload;
  'swarm:initialize': SwarmInitializePayload;
  'task:execute': TaskExecutePayload;
  'agent:terminate': AgentTerminatePayload;
  'swarm:cleanup': SwarmCleanupPayload;
  'agent:idle': AgentIdlePayload;
  'hive:request:agent_states': HiveRequestAgentStatesPayload;
  'hive:task:assigned': HiveTaskAssignedPayload;
  'hive:load:rebalance': HiveLoadRebalancePayload;
  'hive:global:state': HiveGlobalStatePayload;
  'hive:heartbeat': HiveHeartbeatPayload;
  'hive:swarm:unhealthy': HiveSwarmUnhealthyPayload;
  'swarm:register': SwarmRegisterPayload;
  'agent:register': AgentRegisterPayload;
  'agent:state:update': AgentStateUpdatePayload;
  'swarm:heartbeat': SwarmHeartbeatPayload;
  'swarm:disconnect': SwarmDisconnectPayload;
  'swarm:fact:request': SwarmFactRequestPayload;
  'workload:demand-change': WorkloadDemandChangePayload;
  'load:spike': LoadSpikePayload;
  'node:joined': NodeJoinedPayload;
  'node:left': NodeLeftPayload;
  'node:metrics-updated': NodeMetricsUpdatedPayload;
  'heartbeat:sent': HeartbeatSentPayload;
  'connection:quality-changed': ConnectionQualityChangedPayload;
  'network:fault-detected': NetworkFaultDetectedPayload;
  'workload:pattern-changed': WorkloadPatternChangedPayload;
  'swarm:sync:broadcast': SwarmSyncBroadcastPayload;
  'swarm:sync:response': SwarmSyncResponsePayload;
  'agent:state:updated': AgentStateUpdatedPayload;
}
export interface AgentCreatedPayload extends anyPayload {
  readonly agentId: string;
  readonly agentType: AgentType;
  readonly capabilities: readonly string[];
}
export interface AgentDestroyedPayload extends anyPayload {
  readonly agentId: string;
  readonly reason: 'shutdown | error' | 'timeout');
  readonly uptime: number;
}
export interface AgentStatusChangedPayload extends anyPayload {
  readonly agentId: string;
  readonly previousStatus: AgentStatus;
  readonly currentStatus: AgentStatus;
  readonly reason?: string;
}
export interface TaskAssignedPayload extends anyPayload {
  readonly taskId: string;
  readonly agentId: string;
  readonly taskType: string;
  readonly priority: number;
}
export interface TaskCompletedPayload extends anyPayload {
  readonly taskId: string;
  readonly agentId: string;
  readonly duration: number;
  readonly result: TaskEventResult;
}
export interface TaskFailedPayload extends anyPayload {
  readonly taskId: string;
  readonly agentId: string;
  readonly error: TaskEventError;
  readonly retryCount: number;
}
export interface SwarmInitializedPayload extends anyPayload {
  readonly swarmId: string;
  readonly topology: SwarmTopology;
  readonly agentCount: number;
}
export interface SwarmTopologyChangedPayload extends anyPayload {
  readonly swarmId: string;
  readonly previousTopology: SwarmTopology;
  readonly currentTopology: SwarmTopology;
  readonly affectedAgents: readonly string[];
}
export interface AgentSpawnRequestPayload extends anyPayload {
  readonly swarmId: string;
  readonly agentId: string;
  readonly agentType: AgentType;
  readonly claudeSubAgent?: string;
  readonly ephemeral: boolean;
}
export interface SwarmInitializePayload extends anyPayload {
  readonly swarmId: string;
  readonly agents: readonly {
    id: string;
    type: AgentType;
  }[];
  readonly task: {
    readonly id: string;
    readonly description: string;
  };
}
export interface TaskExecutePayload extends anyPayload {
  readonly swarmId: string;
  readonly stepId: string;
  readonly agentId?: string;
  readonly description: string;
}
export interface AgentTerminatePayload extends anyPayload {
  readonly swarmId: string;
  readonly agentId: string;
}
export interface SwarmCleanupPayload extends anyPayload {
  readonly swarmId: string;
  readonly reason: string;
}
export interface AgentIdlePayload extends anyPayload {
  readonly swarmId: string;
  readonly agentId: string;
}
export interface HiveRequestAgentStatesPayload extends anyPayload {
  readonly requestId: string;
}
export interface HiveTaskAssignedPayload extends anyPayload {
  readonly taskId: string;
  readonly agentId: string;
  readonly swarmId: string;
  readonly task: {
    readonly id: string;
    readonly type: string;
    readonly priority: 'low | medium' | 'high | critical');
    readonly requiredCapabilities?: readonly string[];
  };
}
export interface HiveLoadRebalancePayload extends anyPayload {
  readonly overloadedSwarmId: string;
  readonly currentLoad: number;
  readonly suggestedReduction: number;
}
export interface HiveGlobalStatePayload extends anyPayload {
  readonly availableAgents: number;
  readonly activeSwarms: number;
  readonly globalResources: {
    readonly totalCPU: number;
    readonly usedCPU: number;
    readonly totalMemory: number;
    readonly usedMemory: number;
    readonly totalAgents: number;
    readonly availableAgents: number;
    readonly busyAgents: number;
    readonly networkBandwidth: number;
  };
  readonly hiveHealth: {
    readonly overallHealth: number;
    readonly consensus: number;
    readonly synchronization: number;
    readonly faultTolerance: number;
    readonly loadBalance: number;
  };
  readonly taskDistribution: readonly [string, string][];
}
export interface HiveHeartbeatPayload extends anyPayload {
  readonly hiveHealth: number;
  readonly activeSwarms: number;
  readonly availableAgents: number;
}
export interface HiveSwarmUnhealthyPayload extends anyPayload {
  readonly swarmId: string;
  readonly lastHeartbeat: Date;
  readonly timeSinceHeartbeat: number;
}
export interface SwarmRegisterPayload extends anyPayload {
  readonly swarmId: string;
  readonly hiveMindId?: string;
  readonly topology?: SwarmTopology;
  readonly agentCount?: number;
  readonly activeAgents?: number;
  readonly taskQueue?: number;
  readonly performance?: {
    readonly averageResponseTime: number;
    readonly tasksCompletedPerMinute: number;
    readonly successRate: number;
    readonly resourceEfficiency: number;
    readonly qualityScore: number;
  };
  readonly location?: string;
}
export interface AgentRegisterPayload extends anyPayload {
  readonly swarmId: string;
  readonly hiveMindId?: string;
  readonly agentState: {
    readonly id: string;
    readonly type: AgentType;
    readonly capabilities: readonly {
      readonly type: string;
      readonly level: number;
    }[];
    readonly metrics: {
      readonly cpuUsage: number;
      readonly memoryUsage: number;
      readonly responseTime: number;
      readonly tasksCompleted: number;
      readonly successRate: number;
      readonly codeQuality?: number;
    };
    readonly currentWorkload: number;
  };
  readonly availability?: {
    readonly status: 'available | busy' | 'offline');
    readonly currentTasks: number;
    readonly maxConcurrentTasks: number;
  };
  readonly networkLatency?: number;
}
export interface AgentStateUpdatePayload extends anyPayload {
  readonly agentId: string;
  readonly updates: Record<string, unknown>;
}
export interface SwarmHeartbeatPayload extends anyPayload {
  readonly swarmId: string;
  readonly agentCount?: number;
  readonly activeAgents?: number;
  readonly taskQueue?: number;
}
export interface SwarmDisconnectPayload extends anyPayload {
  readonly swarmId: string;
  readonly reason?: string;
}
export interface SwarmFactRequestPayload extends anyPayload {
  readonly requestId: string;
  readonly swarmId: string;
  readonly factType:
    | 'npm-package'
    | 'github-repo'
    | 'api-docs'
    | 'security-advisory'
    | 'general');
  readonly subject: string;
}
export interface AgentHeartbeatPayload extends anyPayload {
  readonly agentId: string;
  readonly health: number;
  readonly load: number;
  readonly memoryUsage: number;
  readonly cpuUsage: number;
  readonly lastActivity: Date;
}
export interface AgentRegisteredPayload extends anyPayload {
  readonly agentId: string;
  readonly agentType: AgentType;
  readonly capabilities: readonly string[];
  readonly registryId: string;
  readonly metadata?: Record<string, unknown>;
}
export interface AgentCapabilitiesUpdatedPayload extends anyPayload {
  readonly agentId: string;
  readonly previousCapabilities: readonly string[];
  readonly currentCapabilities: readonly string[];
  readonly updateReason: string;
}
export interface AgentPerformanceUpdatePayload extends anyPayload {
  readonly agentId: string;
  readonly metrics: {
    readonly tasksCompleted: number;
    readonly averageResponseTime: number;
    readonly successRate: number;
    readonly errorRate: number;
    readonly throughput: number;
  };
  readonly timePeriod: {
    readonly start: Date;
    readonly end: Date;
  };
}
export interface AgentUnavailablePayload extends anyPayload {
  readonly agentId: string;
  readonly reason:
    | 'overloaded'
    | 'error'
    | 'maintenance'
    | 'timeout'
    | 'resource-exhaustion');
  readonly expectedRecoveryTime?: Date;
  readonly alternativeAgents?: readonly string[];
}
export interface AgentTaskCompletedPayload extends anyPayload {
  readonly agentId: string;
  readonly taskId: string;
  readonly taskType: string;
  readonly duration: number;
  readonly quality: number;
  readonly resources: {
    readonly cpuTime: number;
    readonly memoryPeak: number;
    readonly networkIO: number;
  };
  readonly result: TaskEventResult;
}
export interface AgentTaskFailedPayload extends anyPayload {
  readonly agentId: string;
  readonly taskId: string;
  readonly taskType: string;
  readonly error: TaskEventError;
  readonly retryCount: number;
  readonly failureStage:
    | 'initialization'
    | 'execution'
    | 'completion'
    | 'cleanup');
  readonly diagnostics?: Record<string, unknown>;
}
export interface AgentErrorPayload extends anyPayload {
  readonly agentId: string;
  readonly errorType: 'fatal | recoverable' | 'warning');
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly stack?: string;
    readonly context?: Record<string, unknown>;
  };
  readonly impact: {
    readonly affectedTasks: readonly string[];
    readonly recoveryAction: string;
    readonly estimatedDowntime?: number;
  };
}
export interface TaskProgressUpdatePayload extends anyPayload {
  readonly taskId: string;
  readonly agentId: string;
  readonly progress: {
    readonly percentage: number;
    readonly completedSteps: number;
    readonly totalSteps: number;
    readonly currentStep: string;
    readonly estimatedTimeRemaining?: number;
  };
  readonly milestones: readonly {
    readonly name: string;
    readonly completed: boolean;
    readonly timestamp?: Date;
  }[];
}
export interface TaskCancelPayload extends anyPayload {
  readonly taskId: string;
  readonly agentId?: string;
  readonly reason:
    | 'user-request'
    | 'timeout'
    | 'resource-unavailable'
    | 'dependency-failure'
    | 'priority-override'
    | 'system-shutdown'
    | 'agent-failure'
    | 'task_stuck'
    | 'agent_unavailable');
  readonly cancelledBy: string;
  readonly rollbackRequired: boolean;
  readonly affectedDependencies: readonly string[];
}
export interface TaskAssignPayload extends anyPayload {
  readonly taskId: string;
  readonly agentId: string;
  readonly taskType: string;
  readonly task: {
    readonly id: string;
    readonly description: string;
    readonly requirements?: readonly string[];
  };
  readonly priority: 'low | medium' | 'high | critical');
  readonly deadline?: Date;
  readonly dependencies: readonly string[];
  readonly requiredCapabilities: readonly string[];
  readonly estimatedDuration?: number;
  readonly resourceRequirements: {
    readonly cpu: number;
    readonly memory: number;
    readonly network: number;
    readonly disk?: number;
  };
}
export interface SwarmCreatedPayload extends anyPayload {
  readonly swarmId: string;
  readonly topology: SwarmTopology;
  readonly maxAgents: number;
  readonly purpose: string;
  readonly createdBy: string;
  readonly agentTypes?: readonly AgentType[];
  readonly configuration: {
    readonly coordinationStrategy: 'centralized | distributed' | 'hybrid');
    readonly failoverPolicy: 'immediate | graceful' | 'manual');
    readonly loadBalancing: boolean;
    readonly healthChecking: boolean;
  };
}
export interface SwarmCompletedPayload extends anyPayload {
  readonly swarmId: string;
  readonly duration: number;
  readonly tasksCompleted: number;
  readonly tasksFailed: number;
  readonly finalState: 'success | partial-success' | 'failure');
  readonly results?: readonly unknown[];
  readonly performance: {
    readonly averageResponseTime: number;
    readonly totalThroughput: number;
    readonly resourceEfficiency: number;
    readonly qualityScore: number;
  };
  readonly artifacts: readonly {
    readonly type: string;
    readonly location: string;
    readonly size: number;
  }[];
}
export interface SwarmKnowledgeInjectPayload extends anyPayload {
  readonly swarmId: string;
  readonly knowledgeType:
    | 'facts'
    | 'patterns'
    | 'procedures'
    | 'constraints'
    | 'preferences');
  readonly knowledge: {
    readonly content: any;
    readonly metadata: {
      readonly source: string;
      readonly confidence: number;
      readonly expiry?: Date;
      readonly tags: readonly string[];
    };
  };
  readonly distributionScope:
    | 'all-agents'
    | 'specific-agents'
    | 'agent-type'
    | 'swarm-local');
  readonly targetAgents?: readonly string[];
  readonly persistenceRequested?: boolean;
}
export interface NodeConnectedPayload extends anyPayload {
  readonly nodeId: string;
  readonly nodeType: 'agent | coordinator' | 'storage | compute');
  readonly endpoint: string;
  readonly capabilities: readonly string[];
  readonly networkLatency: number;
  readonly bandwidth: {
    readonly upload: number;
    readonly download: number;
  };
  readonly metadata: Record<string, unknown>;
}
export interface NodeDisconnectedPayload extends anyPayload {
  readonly nodeId: string;
  readonly reason:
    | 'clean-shutdown'
    | 'timeout'
    | 'error'
    | 'network-failure'
    | 'resource-exhaustion');
  readonly lastSeen: Date;
  readonly connectionDuration: number;
  readonly gracefulShutdown: boolean;
  readonly reconnectionPossible: boolean;
  readonly affectedOperations: readonly string[];
}
export interface MessageReceivedPayload extends anyPayload {
  readonly messageId: string;
  readonly fromNodeId: string;
  readonly toNodeId: string;
  readonly messageType: 'command | response' | 'event | heartbeat' | 'data');
  readonly size: number;
  readonly processingTime: number;
  readonly priority: 'low | medium' | 'high | critical');
  readonly encrypted: boolean;
  readonly deliveryGuarantee: 'at-most-once | at-least-once' | 'exactly-once');
}
export interface NetworkPartitionPayload extends anyPayload {
  readonly partitionId: string;
  readonly affectedNodes: readonly string[];
  readonly isolatedNodes: readonly string[];
  readonly partitionType: 'split-brain | island' | 'cascade-failure');
  readonly detectionTime: Date;
  readonly estimatedDuration?: number;
  readonly recoveryStrategy: 'wait | failover' | 'merge | restart');
  readonly dataConsistencyImpact: 'none | eventual' | 'strong | unknown');
}
export interface SystemResourcePressurePayload extends anyPayload {
  readonly resourceType:
    | 'cpu'
    | 'memory'
    | 'disk'
    | 'network'
    | 'file-descriptors'
    | 'connections');
  readonly currentUsage: number;
  readonly threshold: number;
  readonly severity: 'warning | critical' | 'emergency');
  readonly trends: {
    readonly short: 'increasing | decreasing' | 'stable');
    readonly medium: 'increasing | decreasing' | 'stable');
    readonly long: 'increasing | decreasing' | 'stable');
  };
  readonly affectedServices: readonly string[];
  readonly recommendedActions: readonly string[];
  readonly autoScalingTriggered: boolean;
}
export interface WorkloadDemandChangePayload extends anyPayload {
  readonly resourceType: 'cpu | memory' | 'network | agents' | 'tasks');
  readonly previousDemand: number;
  readonly currentDemand: number;
  readonly changePercentage: number;
  readonly trend: 'increasing | decreasing' | 'stable');
  readonly triggerReason:
    | 'traffic-spike'
    | 'resource-constraint'
    | 'scaling-event'
    | 'load-balancing');
  readonly affectedNodes: readonly string[];
  readonly recommendedAction:
    | 'scale-up'
    | 'scale-down'
    | 'redistribute'
    | 'optimize');
}
export interface LoadSpikePayload extends anyPayload {
  readonly resourceType:
    | 'cpu'
    | 'memory'
    | 'network'
    | 'connections'
    | 'requests');
  readonly baselineLoad: number;
  readonly currentLoad: number;
  readonly peakLoad: number;
  readonly spikeMultiplier: number;
  readonly duration: number;
  readonly severity: 'minor | moderate' | 'severe | critical');
  readonly affectedServices: readonly string[];
  readonly autoScalingTriggered: boolean;
  readonly mitigationActions: readonly string[];
}
export interface ResourcePressurePayload extends anyPayload {
  readonly resourceType:
    | 'cpu'
    | 'memory'
    | 'disk'
    | 'network'
    | 'file-descriptors'
    | 'database-connections');
  readonly currentUsage: number;
  readonly capacity: number;
  readonly utilizationPercentage: number;
  readonly pressureLevel: 'low | medium' | 'high | critical');
  readonly timeToExhaustion?: number;
  readonly growthRate: number;
  readonly impactedOperations: readonly string[];
  readonly suggestedMitigation: readonly string[];
}
export interface NodeJoinedPayload extends anyPayload {
  readonly nodeId: string;
  readonly nodeType:
    | 'agent'
    | 'coordinator'
    | 'storage'
    | 'compute'
    | 'load-balancer');
  readonly capabilities: readonly string[];
  readonly resources: {
    readonly cpu: number;
    readonly memory: number;
    readonly network: number;
    readonly storage: number;
  };
  readonly location: {
    readonly region?: string;
    readonly zone?: string;
    readonly datacenter?: string;
  };
  readonly metadata: Record<string, unknown>;
  readonly joinReason: 'startup | scaling' | 'recovery | migration');
}
export interface NodeLeftPayload extends anyPayload {
  readonly nodeId: string;
  readonly nodeType:
    | 'agent'
    | 'coordinator'
    | 'storage'
    | 'compute'
    | 'load-balancer');
  readonly leaveReason:
    | 'shutdown'
    | 'scaling-down'
    | 'failure'
    | 'maintenance'
    | 'eviction');
  readonly gracefulShutdown: boolean;
  readonly connectionDuration: number;
  readonly tasksRelocated: number;
  readonly dataEvacuated: boolean;
  readonly replacementNode?: string;
  readonly finalMetrics: Record<string, number>;
}
export interface NodeMetricsUpdatedPayload extends anyPayload {
  readonly nodeId: string;
  readonly metricsSnapshot: {
    readonly timestamp: Date;
    readonly cpu: {
      readonly usage: number;
      readonly load1: number;
      readonly load5: number;
      readonly load15: number;
    };
    readonly memory: {
      readonly usage: number;
      readonly available: number;
      readonly swapUsage: number;
    };
    readonly network: {
      readonly bytesIn: number;
      readonly bytesOut: number;
      readonly packetsIn: number;
      readonly packetsOut: number;
      readonly errors: number;
    };
    readonly disk: {
      readonly usage: number;
      readonly iopsRead: number;
      readonly iopsWrite: number;
      readonly latency: number;
    };
    readonly system: {
      readonly uptime: number;
      readonly processes: number;
      readonly threads: number;
      readonly fileDescriptors: number;
    };
  };
  readonly healthScore: number;
  readonly alertsTriggered: readonly string[];
}
export interface HeartbeatSentPayload extends anyPayload {
  readonly heartbeatId: string;
  readonly fromNodeId: string;
  readonly from?: string;
  readonly to?: string;
  readonly term?: number;
  readonly toNodeId?: string;
  readonly heartbeatType: 'node | agent' | 'swarm | service' | 'cluster');
  readonly sequenceNumber: number;
  readonly interval: number;
  readonly payload: {
    readonly status: 'healthy | degraded' | 'unhealthy');
    readonly load: number;
    readonly responseTime: number;
    readonly lastActivity: Date;
    readonly metrics?: Record<string, number>;
  };
  readonly expectedResponse: boolean;
  readonly networkLatency?: number;
}
export interface ConnectionQualityChangedPayload extends anyPayload {
  readonly connectionId: string;
  readonly previousQuality: 'excellent | good' | 'fair | poor' | 'critical');
  readonly currentQuality: 'excellent | good' | 'fair | poor' | 'critical');
  readonly metrics: {
    readonly latency: number;
    readonly packetLoss: number;
    readonly bandwidth: number;
    readonly jitter: number;
  };
  readonly affectedServices: readonly string[];
}
export interface NetworkFaultDetectedPayload extends anyPayload {
  readonly faultType:
    | 'connection-loss'
    | 'high-latency'
    | 'packet-loss'
    | 'bandwidth-degradation'
    | 'routing-issue');
  readonly severity: 'minor | moderate' | 'severe | critical');
  readonly affectedNodes: readonly string[];
  readonly detectionTime: Date;
  readonly estimatedImpact: {
    readonly affectedConnections: number;
    readonly estimatedDowntime?: number;
    readonly impactedOperations: readonly string[];
  };
  readonly mitigationStatus: 'none | in-progress' | 'completed');
}
export interface WorkloadPatternChangedPayload extends anyPayload {
  readonly patternType:
    | 'load-distribution'
    | 'task-frequency'
    | 'resource-usage'
    | 'communication-pattern');
  readonly previousPattern: string;
  readonly currentPattern: string;
  readonly confidence: number;
  readonly detectionAlgorithm: string;
  readonly implications: readonly {
    readonly category: 'performance | resource' | 'scaling | coordination');
    readonly impact: 'positive | negative' | 'neutral');
    readonly description: string;
  }[];
  readonly recommendedActions: readonly string[];
}
export interface SwarmSyncBroadcastPayload extends anyPayload {
  readonly swarmId: string;
  readonly sourceSwarmId?: string;
  readonly syncId: string;
  readonly syncType: 'state | config' | 'knowledge | health');
  readonly broadcastScope:
    | 'all-agents'
    | 'specific-agents'
    | 'coordinator-only');
  readonly targetAgents?: readonly string[];
  readonly payload?: {
    readonly type: string;
    readonly data: any;
    readonly checksum: string;
  };
  readonly state?: any;
  readonly priority?: 'low | medium' | 'high | critical');
  readonly acknowledgeRequired?: boolean;
}
export interface SwarmSyncResponsePayload extends anyPayload {
  readonly swarmId: string;
  readonly syncId: string;
  readonly respondingAgentId: string;
  readonly responseType: 'ack | nack' | 'partial | error');
  readonly responseData?: any;
  readonly processingTime: number;
  readonly sourceSwarmId?: string;
  readonly error?: {
    readonly code: string;
    readonly message: string;
    readonly details?: any;
  };
}
export interface AgentStateUpdatedPayload extends anyPayload {
  readonly agentId: string;
  readonly swarmId?: string;
  readonly state: any;
  readonly stateChanges: Record<
    string,
    {
      readonly previous: any;
      readonly current: any;
      readonly changeType: 'created | updated' | 'deleted');
    }
  >;
  readonly updateTrigger: 'external | internal' | 'system | user');
  readonly updateSource: string;
  readonly validationPassed: boolean;
  readonly propagationRequired: boolean;
}
/**
 * Neural events.
 *
 * @example
 */
export interface NeuralEvents {
  'neural:network:created': NeuralNetworkCreatedPayload;
  'neural:network:training:started': NeuralTrainingStartedPayload;
  'neural:network:training:completed': NeuralTrainingCompletedPayload;
  'neural:network:training:failed': NeuralTrainingFailedPayload;
  'neural:prediction:made': NeuralPredictionMadePayload;
}
export interface NeuralNetworkCreatedPayload extends anyPayload {
  readonly networkId: string;
  readonly networkType: NeuralNetworkType;
  readonly layerCount: number;
  readonly parameterCount: number;
}
export interface NeuralTrainingStartedPayload extends anyPayload {
  readonly networkId: string;
  readonly trainingId: string;
  readonly epochs: number;
  readonly dataSize: number;
}
export interface NeuralTrainingCompletedPayload extends anyPayload {
  readonly networkId: string;
  readonly trainingId: string;
  readonly duration: number;
  readonly finalAccuracy: number;
  readonly finalLoss: number;
}
export interface NeuralTrainingFailedPayload extends anyPayload {
  readonly networkId: string;
  readonly trainingId: string;
  readonly error: NeuralEventError;
  readonly epoch: number;
}
export interface NeuralPredictionMadePayload extends anyPayload {
  readonly networkId: string;
  readonly inputSize: number;
  readonly outputSize: number;
  readonly confidence: number;
  readonly processingTime: number;
}
/**
 * Memory events.
 *
 * @example
 */
export interface MemoryEvents {
  'memory:store:created': MemoryStoreCreatedPayload;
  'memory:key:set': MemoryKeySetPayload;
  'memory:key:get': MemoryKeyGetPayload;
  'memory:key:deleted': MemoryKeyDeletedPayload;
  'memory:sync:started': MemorySyncStartedPayload;
  'memory:sync:completed': MemorySyncCompletedPayload;
}
export interface MemoryStoreCreatedPayload extends anyPayload {
  readonly storeId: string;
  readonly storeType: MemoryStoreType;
  readonly config: MemoryStoreConfig;
}
export interface MemoryKeySetPayload extends anyPayload {
  readonly storeId: string;
  readonly key: string;
  readonly valueSize: number;
  readonly ttl?: number;
}
export interface MemoryKeyGetPayload extends anyPayload {
  readonly storeId: string;
  readonly key: string;
  readonly hit: boolean;
  readonly responseTime: number;
}
export interface MemoryKeyDeletedPayload extends anyPayload {
  readonly storeId: string;
  readonly key: string;
  readonly existed: boolean;
}
export interface MemorySyncStartedPayload extends anyPayload {
  readonly storeId: string;
  readonly syncType: 'full | incremental');
  readonly targetNodes: readonly string[];
}
export interface MemorySyncCompletedPayload extends anyPayload {
  readonly storeId: string;
  readonly syncId: string;
  readonly duration: number;
  readonly changesApplied: number;
  readonly conflicts: number;
}
/**
 * Combined event map for type safety.
 */
export type EventMap = SystemEvents &
  WorkflowEvents &
  CoordinationEvents &
  NeuralEvents &
  MemoryEvents;
/**
 * Event listener types.
 */
export type EventListener<T extends keyof EventMap> = (
  payload: EventMap[T]
) => void | Promise<void>;
export type EventListenerAny = (payload: anyPayload) => void | Promise<void>;
/**
 * Event middleware function.
 */
export type EventMiddleware<T extends keyof EventMap = keyof EventMap> = (
  event: T,
  payload: EventMap[T],
  next: () => void | Promise<void>
) => void | Promise<void>;
/**
 * Supporting types.
 *
 * @example
 */
export interface SystemConfig {
  readonly [key: string]: any;
}
export interface SystemError {
  readonly code: string;
  readonly message: string;
  readonly stack?: string;
  readonly cause?: any;
}
export interface SystemErrorContext {
  readonly module: string;
  readonly operation: string;
  readonly [key: string]: any;
}
export type HealthState = 'healthy | degraded' | 'unhealthy');
export interface ServiceHealthMap {
  readonly [serviceName: string]: HealthState;
}
export interface WorkflowEventContext {
  readonly [key: string]: any;
}
export interface WorkflowResults {
  readonly [key: string]: any;
}
export interface WorkflowEventError {
  readonly code: string;
  readonly message: string;
  readonly details?: any;
}
export interface StepEventResult {
  readonly [key: string]: any;
}
export type AgentType =
  | 'researcher'
  | 'coder'
  | 'analyst'
  | 'tester'
  | 'coordinator');
export type AgentStatus = 'idle | busy' | 'error | offline');
export type SwarmTopology = 'mesh | hierarchical' | 'ring | star');
export interface TaskEventResult {
  readonly [key: string]: any;
}
export interface TaskEventError {
  readonly code: string;
  readonly message: string;
  readonly details?: any;
}
export type NeuralNetworkType =
  | 'feedforward'
  | 'convolutional'
  | 'recurrent'
  | 'transformer');
export interface NeuralEventError {
  readonly code: string;
  readonly message: string;
  readonly details?: any;
}
export type MemoryStoreType = 'local | distributed' | 'cache');
export interface MemoryStoreConfig {
  readonly [key: string]: any;
}
/**
 * Event bus configuration.
 *
 * @example
 */
export interface EventBusConfig {
  readonly maxListeners: number;
  readonly enableMiddleware: boolean;
  readonly enableMetrics: boolean;
  readonly enableLogging: boolean;
  readonly logLevel: 'debug | info' | 'warn | error');
}
/**
 * Event metrics.
 *
 * @example
 */
export interface EventMetrics {
  readonly eventCount: number;
  readonly eventTypes: Record<string, number>;
  readonly avgProcessingTime: number;
  readonly errorCount: number;
  readonly listenerCount: number;
}
//# sourceMappingURL=event-types.d.ts.map
