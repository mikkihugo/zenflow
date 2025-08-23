/**
 * Event System Type Definitions.
 *
 * Comprehensive TypeScript types for the event bus system.
 * Replaces loose 'any' t'pes with strict, type-safe interfaces.
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
  readonly version: string

}

/**
 * THE COLLECTIVE Events - Borg-style system coordination.
 *
 * @example
 */
export interface CollectiveEvents {
  // Core Collective events collective:initialized: CollectiveInitialize'Payload;
  collective:status:report: Collec'iveStatusPayload;
  collective:shutdown: CollectiveShutdow'Payload;
  collective:health:updated: CollectiveHealthPayloa;
  // Task coordination collective:task:request: TaskReques'Payload;
  collective:task:assigned: TaskAssignmentPayloa;
  collective:task:completed: TaskCompletionPayloa;
  // Cube coordination 'ops-cube:status: CubeStatu'Payload;
  'dev-cube:status: CubeStatu'Payload;
  'research-cube:status: CubeStatu'Payload;
  // Matron coor'ination collective:matron:registered: MatronRegistrationPayloa;
  'ops-cube:matron:shutdown: Matro'ShutdownPayload;
  'dev-cube:matron:shutdown: Matro'ShutdownPayload;
  // Queen coor'ination 'ops-cube:queen:assigned: QueenAssignmentPayloa;
  'dev-cube:queen:assigned: QueenAssignmentPayloa;
  'ops-cube:queen:removed: QueenRemovalPayloa;
  'dev-cube:queen:removed: QueenRemovalPayloa;
  // Drone coordination drone:spawned: DroneSpawne'Payload;
  drone:terminated: DroneTerminate'Payload;
  drone:status:changed: DroneStatusPayloa;
  // Legacy system events (backward compatibility) system:started: SystemStarte'Payload;
  system:stopped: SystemStoppe'Payload;
  system:shutdown: SystemStoppedPayload;
  system:error: SystemE'rorPayload;
  system:health:changed: SystemHealthChange'Payload;
  system:resource-pressure: Syst'mResourcePressurePayload;
  resource:pressure: R'sourcePressurePayload

}

// THE COLLECTIVE Event Payloa's
export interface CollectiveInitializedPayload extends anyPayload {
  readonly status: string; readonly cubes: number; readonly matrons: number; readonly borgEfficiency: number

}

export interface CollectiveStatusPayload extends anyPayload {
  readonly status: string; readonly activeCubes: number; readonly totalDrones: number; readonly borgEfficiency: number

}

export interface CollectiveShutdownPayload extends anyPayload { readonly reason?: string
}

export interface CollectiveHealthPayload extends anyPayload {
  readonly overallStatus: string; readonly borgEfficiency: number; readonly systemLoad: number

}

export interface TaskRequestPayload extends anyPayload {
  readonly taskId: string; readonly type: string; readonly priority: string; readonly requiredCapabilities: string[]

}

export interface TaskAssignmentPayload extends anyPayload {
  readonly taskId: string; readonly cubeId: string; readonly matron: string; readonly priority: string

}

export interface TaskCompletionPayload extends anyPayload {
  readonly taskId: string; readonly success: boolean; readonly borgEfficiency: number

}

export interface CubeStatusPayload extends anyPayload {
  readonly cubeId: string; readonly type: string; readonly status: string; readonly borgRating: string

}

export interface MatronRegistrationPayload extends anyPayload {
  readonly matron: string; readonly cube: string; readonly capabilities: string[]

}

export interface MatronShutdownPayload extends anyPayload { readonly matron: string
}

export interface QueenAssignmentPayload extends anyPayload {
  readonly queenId: string;
  readonly matron: string

}

export interface QueenRemovalPayload extends anyPayload {
  readonly queenId: string;
  readonly matron: string

}

export interface DroneSpawnedPayload extends anyPayload {
  readonly droneId: string; readonly type: string; readonly cubeId: string

}

export interface DroneTerminatedPayload extends anyPayload {
  readonly droneId: string;
  readonly reason: string

}

export interface DroneStatusPayload extends anyPayload {
  readonly droneId: string; readonly status: string; readonly borgEfficiency: number

}

export interface SystemStartedPayload extends anyPayload {
  readonly config: SystemConfig;
  readonly modules: readonly string[]

}

export interface SystemStoppedPayload extends anyPayload {
  readonly reason: 'shutdown' |error | | rest'a'r't')';
  readonly uptime: number

}

export interface SystemErrorPayload extends anyPayload {
  readonly error: SystemError;
  readonly context?: SystemErrorContext

}

export interface SystemHealthChangedPayload extends anyPayload {
  readonly previousState: HealthState; readonly currentState: HealthState; readonly services: ServiceHealthMap

}

/**
 * Workflow events.
 *
 * @example
 */
export interface WorkflowEvents {
  workflow:started: WorkflowStarte'Payload;
  workflow:completed: WorkflowComplete'Payload;
  workflow:failed: WorkflowFaile'Payload;
  workflow:paused: WorkflowPause'Payload;
  workflow:resumed: WorkflowResume'Payload;
  workflow:cancelled: WorkflowCancelle'Payload;
  workflow:step:started: WorkflowStepStarte'Payload;
  workflow:step:completed: WorkflowStepComplete'Payload;
  workflow:step:failed: WorkflowStepFaile'Payload

}

export interface WorkflowStarte'Payload extends anyPayload {
  readonly workflowId: string; readonly workflowName: string; readonly context: WorkflowEventContext

}

export interface WorkflowCompletedPayload extends anyPayload {
  readonly workflowId: string; readonly duration: number; readonly results: WorkflowResults

}

export interface WorkflowFailedPayload extends anyPayload {
  readonly workflowId: string; readonly error: WorkflowEventError; readonly stepIndex?: number

}

export interface WorkflowPausedPayload extends anyPayload {
  readonly workflowId: string; readonly stepIndex: number; readonly reason: string

}

export interface WorkflowResumedPayload extends anyPayload {
  readonly workflowId: string;
  readonly stepIndex: number

}

export interface WorkflowCancelledPayload extends anyPayload {
  readonly workflowId: string; readonly reason: string; readonly stepIndex: number

}

export interface WorkflowStepStartedPayload extends anyPayload {
  readonly workflowId: string; readonly stepIndex: number; readonly stepName: string; readonly stepType: string

}

export interface WorkflowStepCompletedPayload extends anyPayload {
  readonly workflowId: string; readonly stepIndex: number; readonly stepName: string; readonly duration: number; readonly result: StepEventResult

}

export interface WorkflowStepFailedPayload extends anyPayload {
  readonly workflowId: string; readonly stepIndex: number; readonly stepName: string; readonly error: WorkflowEventError; readonly retryCount: number

}

/**
 * Coordination events.
 *
 * @example
 */
export interface CoordinationEvents {
  agent:created: AgentCreate'Payload;
  agent:destroyed: AgentDestroye'Payload;
  agent:status:changed: AgentStatusChange'Payload;
  agent:heartbeat: Agen'HeartbeatPayload;
  agent:registered: AgentRegistere'Payload;
  agent:capabilities-updated: AgentCapabilitiesUp'atedPayload;
  agent:performance-update: Ag'ntPerformanceUpdatePayload;
  agent:unavailable: Ag'ntUnavailablePayload;
  agent:task-completed: AgentTaskComplete'Payload;
  agent:task-failed: AgentTaskFaile'Payload;
  agent:error: AgentE'rorPayload;
  task:assigned: TaskAssigne'Payload;
  task:completed: TaskComplete'Payload;
  task:failed: TaskFaile'Payload;
  task:progress-update: TaskProgr'ssUpdatePayload;
  task:cancel: TaskCance'Payload;
  task:assign: TaskAssig'Payload;
  swarm:initialized: SwarmInitialize'Payload;
  swarm:created: SwarmCreate'Payload;
  swarm:completed: SwarmComplete'Payload;
  swarm:topology:changed: SwarmTopologyChange'Payload;
  swarm:knowledge:inject: SwarmKnowledgeInjec'Payload;
  node:connected: No'eConnectedPayload;
  node:disconnected: No'eDisconnectedPayload;
  message:received: MessageReceive'Payload;
  network:partition: NetworkPartitio'Payload;
  // Ephemeral swarm lifecycle events agent:spawn:request: Agen'SpawnRequestPayload;
  swarm:initialize: SwarmInitializ'Payload;
  task:execute: TaskEx'cutePayload;
  agent:terminate: Ag'ntTerminatePayload;
  swarm:cleanup: SwarmCleanu'Payload;
  agent:idle: Ag'ntIdlePayload;
  // Hive min' coordination events hive:request:agent_states: HiveReque'tAgentStatesPayload;
  hive:task:assigned: HiveTaskAssigne'Payload;
  hive:load:rebalance: Hiv'LoadRebalancePayload;
  hive:global:state: Hiv'GlobalStatePayload;
  hive:heartbeat: HiveHear'beatPayload;
  hive:swarm:unhealthy: HiveSwarmUnhealth'Payload;
  // Swarm registration an' communication events swarm:register: Swa'mRegisterPayload;
  agent:register: AgentRegiste'Payload;
  agent:state:update: Ag'ntStateUpdatePayload;
  swarm:heartbeat: SwarmHear'beatPayload;
  swarm:disconnect: SwarmDisconnec'Payload;
  swarm:fact:request: SwarmFac'RequestPayload;
  // Loa' balancing and workload events workload:demand-change: WorkloadD'mandChangePayload;
  load:spike: LoadSpik'Payload;
  // No'e lifecycle events node:joined: No'eJoinedPayload;
  node:left: NodeLef'Payload;
  node:metrics-updated: No'eMetricsUpdatedPayload;
  // Heartbeat events heartbeat:sent: Hear'beatSentPayload;
  // Connection an' network events connection:quality-changed: ConnectionQualityChange'Payload;
  network:fault-detected: NetworkFaultDetecte'Payload;
  // Workloa' pattern events workload:pattern-changed: Workloa'PatternChangedPayload;
  // Swarm synchronization events swarm:sync:broadcast: SwarmSyncBroadcas'Payload;
  swarm:sync:response: SwarmSyncR'sponsePayload;
  // Agent state events agent:state:updated: AgentStateUp'atedPayload

}

export interface AgentCreate'Payload extends anyPayload {
  readonly agentId: string; readonly agentType: AgentType; readonly capabilities: readonly string[]

}

export interface AgentDestroyedPayload extends anyPayload {
  readonly agentId: string; readonly reason: 'shutdown' |error | | time'o'u't')'; readonly uptime: number

}

export interface AgentStatusChangedPayload extends anyPayload {
  readonly agentId: string; readonly previousStatus: AgentStatus; readonly currentStatus: AgentStatus; readonly reason?: string

}

export interface TaskAssignedPayload extends anyPayload {
  readonly taskId: string; readonly agentId: string; readonly taskType: string; readonly priority: number

}

export interface TaskCompletedPayload extends anyPayload {
  readonly taskId: string; readonly agentId: string; readonly duration: number; readonly result: TaskEventResult

}

export interface TaskFailedPayload extends anyPayload {
  readonly taskId: string; readonly agentId: string; readonly error: TaskEventError; readonly retryCount: number

}

export interface SwarmInitializedPayload extends anyPayload {
  readonly swarmId: string; readonly topology: SwarmTopology; readonly agentCount: number

}

export interface SwarmTopologyChangedPayload extends anyPayload {
  readonly swarmId: string; readonly previousTopology: SwarmTopology; readonly currentTopology: SwarmTopology; readonly affectedAgents: readonly string[]

}

// Ephemeral swarm lifecycle event payloads
export interface AgentSpawnRequestPayload extends anyPayload {
  readonly swarmId: string; readonly agentId: string; readonly agentType: AgentType; readonly claudeSubAgent?: string; readonly ephemeral: boolean

}

export interface SwarmInitializePayload extends anyPayload { readonly swarmId: string; readonly agents: readonly { id: string; type: AgentType }[]; readonly task: {
  readonly id: string;
  readonly description: string

}
}

export interface TaskExecutePayload extends anyPayload {
  readonly swarmId: string; readonly stepId: string; readonly agentId?: string; readonly description: string

}

export interface AgentTerminatePayload extends anyPayload {
  readonly swarmId: string;
  readonly agentId: string

}

export interface SwarmCleanupPayload extends anyPayload {
  readonly swarmId: string;
  readonly reason: string

}

export interface AgentIdlePayload extends anyPayload {
  readonly swarmId: string;
  readonly agentId: string

}

// Hive mind coordination event payloads
export interface HiveRequestAgentStatesPayload extends anyPayload { readonly requestId: string
}

export interface HiveTaskAssignedPayload extends anyPayload { readonly taskId: string; readonly agentId: string; readonly swarmId: string; readonly task: {
  readonly id: string; readonly type: string; readonly priority: 'low' || medium || 'high  '|| critical)'; readonly requiredCapabilities?: readonly string[]

}
}

export interface HiveLoadRebalancePayload extends anyPayload {
  readonly overloadedSwarmId: string; readonly currentLoad: number; readonly suggestedReduction: number

}

export interface HiveGlobalStatePayload extends anyPayload { readonly availableAgents: number; readonly activeSwarms: number; readonly globalResources: {
  readonly totalCPU: number; readonly usedCPU: number; readonly totalMemory: number; readonly usedMemory: number; readonly totalAgents: number; readonly availableAgents: number; readonly busyAgents: number; readonly networkBandwidth: number

}; readonly hiveHealth: {
  readonly overallHealth: number; readonly consensus: number; readonly synchronization: number; readonly faultTolerance: number; readonly loadBalance: number

}; readonly taskDistribution: readonly [string, string][]
}

export interface HiveHeartbeatPayload extends anyPayload {
  readonly hiveHealth: number; readonly activeSwarms: number; readonly availableAgents: number

}

export interface HiveSwarmUnhealthyPayload extends anyPayload {
  readonly swarmId: string; readonly lastHeartbeat: Date; readonly timeSinceHeartbeat: number

}

// Swarm registration and communication event payloads
export interface SwarmRegisterPayload extends anyPayload { readonly swarmId: string; readonly hiveMindId?: string; readonly topology?: SwarmTopology; readonly agentCount?: number; readonly activeAgents?: number; readonly taskQueue?: number; readonly performance?: {
  readonly averageResponseTime: number; readonly tasksCompletedPerMinute: number; readonly successRate: number; readonly resourceEfficiency: number; readonly qualityScore: number

}; readonly location?: string
}

export interface AgentRegisterPayload extends anyPayload { readonly swarmId: string; readonly hiveMindId?: string; readonly agentState: { readonly id: string; readonly type: AgentType; readonly capabilities: readonly {
  readonly type: string;
  readonly level: number
}[]; readonly metrics: {
  readonly cpuUsage: number; readonly memoryUsage: number; readonly responseTime: number; readonly tasksCompleted: number; readonly successRate: number; readonly codeQuality?: number

}; readonly currentWorkload: number
}; readonly availability?: {
  readonly status:' 'available'| busy' || offli'n'e')'; readonly currentTasks: number; readonly maxConcurrentTasks: number

}; readonly networkLatency?: number
}

export interface AgentStateUpdatePayload extends anyPayload {
  readonly agentId: string; readonly updates: Record<string,
  unknown>

}

export interface SwarmHeartbeatPayload extends anyPayload {
  readonly swarmId: string; readonly agentCount?: number; readonly activeAgents?: number; readonly taskQueue?: number

}

export interface SwarmDisconnectPayload extends anyPayload {
  readonly swarmId: string;
  readonly reason?: string

}

export interface SwarmFactRequestPayload extends anyPayload {
  readonly requestId: string; readonly swarmId: string; readonly factType: || npm-packa'g'e | 'ithub-repo | api-docs | security-advisory  || gener'a'l')'; readonly subject: string

}

// Additional agent event payloads
export interface AgentHeartbeatPayload extends anyPayload {
  readonly agentId: string; readonly health: number; readonly load: number; readonly memoryUsage: number; readonly cpuUsage: number; readonly lastActivity: Date

}

export interface AgentRegisteredPayload extends anyPayload {
  readonly agentId: string; readonly agentType: AgentType; readonly capabilities: readonly string[]; readonly registryId: string; readonly metadata?: Record<string,
  unknown>

}

export interface AgentCapabilitiesUpdatedPayload extends anyPayload {
  readonly agentId: string; readonly previousCapabilities: readonly string[]; readonly currentCapabilities: readonly string[]; readonly updateReason: string

}

export interface AgentPerformanceUpdatePayload extends anyPayload { readonly agentId: string; readonly metrics: {
  readonly tasksCompleted: number; readonly averageResponseTime: number; readonly successRate: number; readonly errorRate: number; readonly throughput: number

}; readonly timePeriod: {
  readonly start: Date;
  readonly end: Date
}
}

export interface AgentUnavailablePayload extends anyPayload {
  readonly agentId: string; readonly reason: overloaded  || error | maintenan'c'e | timeout | resour'e-exhaustio'n)'; readonly expectedRecoveryTime?: Date; readonly alternativeAgents?: readonly string[]

}

export interface AgentTaskCompletedPayload extends anyPayload { readonly agentId: string; readonly taskId: string; readonly taskType: string; readonly duration: number; readonly quality: number; readonly resources: {
  readonly cpuTime: number; readonly memoryPeak: number; readonly networkIO: number

}; readonly result: TaskEventResult
}

export interface AgentTaskFailedPayload extends anyPayload {
  readonly agentId: string; readonly taskId: string; readonly taskType: string; readonly error: TaskEventError; readonly retryCount: number; readonly failureStage: initialization  || execution | completi'o'n | cleanu'p)'; readonly diagnostics?: Record<string,
  unknown>

}

export interface AgentErrorPayload extends anyPayload { readonly agentId: string; readonly errorType: 'fatal' |recoverable | | warn'i'n'g')'; readonly error: {
  readonly code: string; readonly message: string; readonly stack?: string; readonly context?: Record<string,
  unknown>

}; readonly impact: {
  readonly affectedTasks: readonly string[]; readonly recoveryAction: string; readonly estimatedDowntime?: number

}
}

// Additional task event payloads
export interface TaskProgressUpdatePayload extends anyPayload { readonly taskId: string; readonly agentId: string; readonly progress: {
  readonly percentage: number; readonly completedSteps: number; readonly totalSteps: number; readonly currentStep: string; readonly estimatedTimeRemaining?: number

}; readonly milestones: readonly {
  readonly name: string; readonly completed: boolean; readonly timestamp?: Date

}[]
}

export interface TaskCancelPayload extends anyPayload {
  readonly taskId: string; readonly agentId?: string; readonly reason: user-request  || timeout | resource-unavailab'l'e | dependency-fai'ure | priority-override | system-shutdown | agent-failure | task_stuc'k' || agent_unavailab'l'e')'; readonly cancelledBy: string; readonly rollbackRequired: boolean; readonly affectedDependencies: readonly string[]

}

export interface TaskAssignPayload extends anyPayload { readonly taskId: string; readonly agentId: string; readonly taskType: string; readonly task: {
  readonly id: string; readonly description: string; readonly requirements?: readonly string[]

}; readonly priority: 'low' || medium || 'high  '|| critical)'; readonly deadline?: Date; readonly dependencies: readonly string[]; readonly requiredCapabilities: readonly string[]; readonly estimatedDuration?: number; readonly resourceRequirements: {
  readonly cpu: number; readonly memory: number; readonly network: number; readonly disk?: number

}
}

// Additional swarm event payloads
export interface SwarmCreatedPayload extends anyPayload { readonly swarmId: string; readonly topology: SwarmTopology; readonly maxAgents: number; readonly purpose: string; readonly createdBy: string; readonly agentTypes?: readonly AgentType[]; // Added missing agentTypes property readonly configuration: {
  readonly coordinationStrategy:' 'centralized'| distributed' || hybr'i'd')'; readonly failoverPolicy: 'immediate' |graceful | | man'u'a'l')'; readonly loadBalancing: boolean; readonly healthChecking: boolean

}
}

export interface SwarmCompletedPayload extends anyPayload { readonly swarmId: string; readonly duration: number; readonly tasksCompleted: number; readonly tasksFailed: number; readonly finalState: 'success'| partial-success   | failure')'; readonly results?: readonly unknown[]; // Added missing results property readonly performance: {
  readonly averageResponseTime: number; readonly totalThroughput: number; readonly resourceEfficiency: number; readonly qualityScore: number

}; readonly artifacts: readonly {
  readonly type: string; readonly location: string; readonly size: number

}[]
}

export interface SwarmKnowledgeInjectPayload extends anyPayload { readonly swarmId: string; readonly knowledgeType: 'facts | patter'n's | procedures | co'straints | preferenc'e's')'; readonly knowledge: { readonly content: any; readonly metadata: {
  readonly source: string; readonly confidence: number; readonly expiry?: Date; readonly tags: readonly string[]

}
}; readonly distributionScope: || all-agen't's | specific-agen's | agent-type  || swarm-loc'a'l')'; readonly targetAgents?: readonly string[]; readonly persistenceRequested?: boolean
}

// Network and node event payloads
export interface NodeConnectedPayload extends anyPayload { readonly nodeId: string; readonly nodeType: 'agent' |coordinator | 'storage'| comput'e')'; readonly endpoint: string; readonly capabilities: readonly string[]; readonly networkLatency: number; readonly bandwidth: {
  readonly upload: number;
  readonly download: number

}; readonly metadata: Record<string, unknown>
}

export interface NodeDisconnectedPayload extends anyPayload {
  readonly nodeId: string; readonly reason: clean-shutdown  || timeout | err'o'r | netw'rk-failure | resource-exhaustio'n)'; readonly lastSeen: Date; readonly connectionDuration: number; readonly gracefulShutdown: boolean; readonly reconnectionPossible: boolean; readonly affectedOperations: readonly string[]

}

export interface MessageReceivedPayload extends anyPayload {
  readonly messageId: string; readonly fromNodeId: string; readonly toNodeId: string; readonly messageType: 'command' |response | 'event'| heartbeat | dat'a')'; readonly size: number; readonly processingTime: number; readonly priority: 'low' || medium || 'high  '|| critical)'; readonly encrypted: boolean; readonly deliveryGuarantee:' 'at-most-once'| at-least-once | exactly-once')'

}

export interface NetworkPartitionPayload extends anyPayload {
  readonly partitionId: string; readonly affectedNodes: readonly string[]; readonly isolatedNodes: readonly string[]; readonly partitionType: 'split-brain' |island | | cascade-fail'u'r'e')'; readonly detectionTime: Date; readonly estimatedDuration?: number; readonly recoveryStrategy: 'wait' |failover | 'merge'| restar't')'; readonly dataConsistencyImpact: 'none' |eventual | 'strong'| unknow'n')'

}

// Additional system event payloads
export interface SystemResourcePressurePayload extends anyPayload { readonly resourceType: cpu  || memory | di's'k | network | file-de'criptors | connection's)'; readonly currentUsage: number; readonly threshold: number; readonly severity: 'warning' |critical | | emerge'n'c'y')'; readonly trends: {
  readonly short: 'increasing' |decreasing | | sta'b'l'e')'; readonly medium: 'increasing' |decreasing | | sta'b'l'e')'; readonly long: 'increasing' |decreasing | | sta'b'l'e')'

}; readonly affectedServices: readonly string[]; readonly recommendedActions: readonly string[]; readonly autoScalingTriggered: boolean
}

// Load balancing and workload event payloads
export interface WorkloadDemandChangePayload extends anyPayload {
  readonly resourceType: 'cpu' |memory | 'network'| agents | task's')'; readonly previousDemand: number; readonly currentDemand: number; readonly changePercentage: number; readonly trend: 'increasing' |decreasing | | sta'b'l'e')'; readonly triggerReason: || traffic-spi'k'e | resource-constraint | scaling-event  || load-balanci'n'g')'; readonly affectedNodes: readonly string[]; readonly recommendedAction: || scale-'u'p | scale-down  || redistrib't'e' || optimiz'e')'

}

export interface LoadSpikePayload extends anyPayload {
  readonly resourceType: cpu  || m'mory | netwo'r'k | connections || 'requests')'; readonly baselineLoad: number; readonly currentLoad: number; readonly peakLoad: number; readonly spikeMultiplier: number; readonly duration: number; readonly severity: 'minor' |moderate | 'severe'| critica'l')'; readonly affectedServices: readonly string[]; readonly autoScalingTriggered: boolean; readonly mitigationActions: readonly string[]

}

// Additional resource pressure event (more specific than system:resource-pressure'
export interface ResourcePressurePayload extends anyPayload {
  readonly resourceType: cpu  || memory | di's'k | network | file-de'criptors | database-connection's)'; readonly currentUsage: number; readonly capacity: number; readonly utilizationPercentage: number; readonly pressureLevel: 'low' || medium || 'high  '|| critical)'; readonly timeToExhaustion?: number; readonly growthRate: number; readonly impactedOperations: readonly string[]; readonly suggestedMitigation: readonly string[]

}

// Node lifecycle event payloads
export interface NodeJoinedPayload extends anyPayload { readonly nodeId: string; readonly nodeType: || ag'n't || coordi'at'o'r | st'rage | compute  || load-balancer)'; readonly capabilities: readonly string[]; readonly resources: {
  readonly cpu: number; readonly memory: number; readonly network: number; readonly storage: number

}; readonly location: {
  readonly region?: string; readonly zone?: string; readonly datacenter?: string

}; readonly metadata: Record<string, unknown>; readonly joinReason: startup | scaling | recove'r'y | mig'ati'o'n')'
}

export interface NodeLeftPayload extends anyPayload {
  readonly nodeId: string; readonly nodeType: agent  || coordinator | stora'g'e | compute | load-balance'r)'; readonly leaveReason: || shutdo'w'n | scaling-do'n  || failure | maintenan'c'e | evi'tio'n)'; readonly gracefulShutdown: boolean; readonly connectionDuration: number; readonly tasksRelocated: number; readonly dataEvacuated: boolean; readonly replacementNode?: string; readonly finalMetrics: Record<string,
  number>

}

export interface NodeMetricsUpdatedPayload extends anyPayload { readonly nodeId: string; readonly metricsSnapshot: { readonly timestamp: Date; readonly cpu: {
  readonly usage: number; readonly load1: number; readonly load5: number; readonly load15: number

}; readonly memory: {
  readonly usage: number; readonly available: number; readonly swapUsage: number

}; readonly network: {
  readonly bytesIn: number; readonly bytesOut: number; readonly packetsIn: number; readonly packetsOut: number; readonly errors: number

}; readonly disk: {
  readonly usage: number; readonly iopsRead: number; readonly iopsWrite: number; readonly latency: number

}; readonly system: {
  readonly uptime: number; readonly processes: number; readonly threads: number; readonly fileDescriptors: number

}
}; readonly healthScore: number; readonly alertsTriggered: readonly string[]
}

// Heartbeat event payloads
export interface HeartbeatSentPayload extends anyPayload { readonly heartbeatId: string; readonly fromNodeId: string; readonly from?: string; // Added missing 'from' property for co'patibility readonly to?: string; // Added missin' 'to' pr'perty readonly term?: number; // Added missing 'term' property for leadership coordination readonly toNodeId?: string; // undefined for broadcast heartbeats readonly heartbeatType: 'node' |agent | 'swarm'| service | cluste'r')'; readonly sequenceNumber: number; readonly interval: number; readonly payload: {
  readonly status: 'healthy' |degraded | | unheal't'h'y')'; readonly load: number; readonly responseTime: number; readonly lastActivity: Date; readonly metrics?: Record<string,
  number>

}; readonly expectedResponse: boolean; readonly networkLatency?: number
}

// Connection and network event payloads
export interface ConnectionQualityChangedPayload extends anyPayload { readonly connectionId: string; readonly previousQuality: 'excellent' |good | 'fair'| poor | critica'l')'; readonly currentQuality: 'excellent' |good | 'fair'| poor | critica'l')'; readonly metrics: {
  readonly latency: number; readonly packetLoss: number; readonly bandwidth: number; readonly jitter: number

}; readonly affectedServices: readonly string[]
}

export interface NetworkFaultDetectedPayload extends anyPayload { readonly faultType: || connection-lo's' | high-latency | packet-loss | bandwidth-degradation  || routing-iss'u'e')'; readonly severity: 'minor' |moderate | 'severe'| critica'l')'; readonly affectedNodes: readonly string[]; readonly detectionTime: Date; readonly estimatedImpact: {
  readonly affectedConnections: number; readonly estimatedDowntime?: number; readonly impactedOperations: readonly string[]

}; readonly mitigationStatus: 'none'| in-progress   | completed')'
}

// Workload pattern event payloads
export interface WorkloadPatternChangedPayload extends anyPayload { readonly patternType: 'load-distribution | task-frequency | resource-usage | communication-patte'r'n')'; readonly previousPattern: string; readonly currentPattern: string; readonly confidence: number; readonly detectionAlgorithm: string; readonly implications: readonly {
  readonly category: 'performance' |resource | 'scaling'| coordinatio'n')'; readonly impact: 'positive' |negative | | neut'r'a'l')'; readonly description: string

}[]; readonly recommendedActions: readonly string[]
}

// Swarm synchronization event payloads
export interface SwarmSyncBroadcastPayload extends anyPayload { readonly swarmId: string; readonly sourceSwarmId?: string; // Source swarm identifier for sync operations readonly syncId: string; readonly syncType: 'state' |config | 'knowledge'| healt'h')'; readonly broadcastScope: || all-agen't's | specific-agen's  || coordinator-on'l'y')'; readonly targetAgents?: readonly string[]; readonly payload?: {
  // Made optional since some usages don't i'clude this readonly type: string; readonly data: any; readonly checksum: string

}; readonly state?: any; // Added for sync state data readonly priority?: 'low' || medium || 'high  '|| critical)'; // Made optional readonly acknowledgeRequired?: boolean; // Made optional
}

export interface SwarmSyncResponsePayload extends anyPayload { readonly swarmId: string; readonly syncId: string; readonly respondingAgentId: string; readonly responseType:' 'ack'| nack | partial  || err'o'r')'; readonly responseData?: any; readonly processingTime: number; readonly sourceSwarmId?: string; // Added to match usage in swarm-synchronization.ts readonly error?: {
  readonly code: string; readonly message: string; readonly details?: any

}
}

// Additional agent state event payloads
export interface AgentStateUpdatedPayload extends anyPayload { readonly agentId: string; readonly swarmId?: string; readonly state: any; readonly stateChanges: Record< string, {
  readonly previous: any; readonly current: any; readonly changeType: 'created' |updated | | dele't'e'd')'

} >; readonly updateTrigger: 'external' |internal | 'system'| use'r')'; readonly updateSource: string; readonly validationPassed: boolean; readonly propagationRequired: boolean
}

/**
 * Neural events.
 *
 * @example
 */
export interface NeuralEvents {
  neural:network:created: NeuralNetworkCreate'Payload;
  neural:network:training:started: NeuralTrainingStarte'Payload;
  neural:network:training:completed: NeuralTrainingComplete'Payload;
  neural:network:training:failed: NeuralTrainingFaile'Payload;
  neural:prediction:made: N'uralPredictionMadePayload

}

export interface NeuralNetworkCreate'Payload extends anyPayload {
  readonly networkId: string; readonly networkType: NeuralNetworkType; readonly layerCount: number; readonly parameterCount: number

}

export interface NeuralTrainingStartedPayload extends anyPayload {
  readonly networkId: string; readonly trainingId: string; readonly epochs: number; readonly dataSize: number

}

export interface NeuralTrainingCompletedPayload extends anyPayload {
  readonly networkId: string; readonly trainingId: string; readonly duration: number; readonly finalAccuracy: number; readonly finalLoss: number

}

export interface NeuralTrainingFailedPayload extends anyPayload {
  readonly networkId: string; readonly trainingId: string; readonly error: NeuralEventError; readonly epoch: number

}

export interface NeuralPredictionMadePayload extends anyPayload {
  readonly networkId: string; readonly inputSize: number; readonly outputSize: number; readonly confidence: number; readonly processingTime: number

}

/**
 * Memory events.
 *
 * @example
 */
export interface MemoryEvents {
  memory:store:created: MemoryStoreCreate'Payload;
  memory:key:set: MemoryKeySe'Payload;
  memory:key:get: MemoryKeyGe'Payload;
  memory:key:deleted: MemoryKeyDelete'Payload;
  memory:sync:started: MemorySyncStarte'Payload;
  memory:sync:completed: MemorySyncComplete'Payload

}

export interface MemoryStoreCreate'Payload extends anyPayload {
  readonly storeId: string; readonly storeType: MemoryStoreType; readonly config: MemoryStoreConfig

}

export interface MemoryKeySetPayload extends anyPayload {
  readonly storeId: string; readonly key: string; readonly valueSize: number; readonly ttl?: number

}

export interface MemoryKeyGetPayload extends anyPayload {
  readonly storeId: string; readonly key: string; readonly hit: boolean; readonly responseTime: number

}

export interface MemoryKeyDeletedPayload extends anyPayload {
  readonly storeId: string; readonly key: string; readonly existed: boolean

}

export interface MemorySyncStartedPayload extends anyPayload {
  readonly storeId: string; readonly syncType: 'full' | incremental)'; readonly targetNodes: readonly string[]

}

export interface MemorySyncCompletedPayload extends anyPayload {
  readonly storeId: string; readonly syncId: string; readonly duration: number; readonly changesApplied: number; readonly conflicts: number

}

/**
 * Combined event map for type safety.
 */
export type EventMap = 'SystemEvents'& WorkflowEvents & CoordinationEvents & NeuralEvents & MemoryEvents';

/**
 * Event listener types.
 */
export type EventListener<T extends keyof EventMap> = ( payload: EventMap[T]') => void |Promise'<void>';

export type EventListenerAny =
  | (payload: anyPayloa'd') => voi'
  | Promise<void>';

/**
 * Event middleware function.
 */
export type EventMiddleware<T extends keyof EventMap = keyof EventMap' = ( event: T, payload: EventMap[T], next: () => void' '|| Promise<void>' ')'= '>'void | Promise<void>';

/**
 * Supporting types.
 *
 * @example
 */
export interface SystemConfig { readonly [key: string]: any
}

export interface SystemError {
  readonly code: string;
  readonly message: string;
  readonly stack?: string;
  readonly cause?: any

}

export interface SystemErrorContext {
  readonly module: string;
  readonly operation: string;
  readonly [key: string]: any

}

export type HealthState '='healthy | degraded' || unhealt'h'y')';

export interface ServiceHealthMap { readonly [serviceName: string]: HealthState
}

export interface WorkflowEventContext { readonly [key: string]: any
}

export interface WorkflowResults { readonly [key: string]: any
}

export interface WorkflowEventError {
  readonly code: string;
  readonly message: string;
  readonly details?: any

}

export interface StepEventResult { readonly [key: string]: any
}

export type AgentType =
  | 'researcher'
  | coder
  | 'analyst
  | tester
  | coordinato'r')';
export type AgentStatus =
  | 'idle'
  | busy
  | 'error  '
  | offline)';
export type SwarmTopology '=' 'mesh'| hierarchical | ring  || st'a'r')';

export interface TaskEventResult { readonly [key: string]: any
}

export interface TaskEventError {
  readonly code: string;
  readonly message: string;
  readonly details?: any

}

export type NeuralNetworkType =
  | feedforward
  | convolutional
  | recurre'n't
  | tra'sforme'r)';

export interface NeuralEventError {
  readonly code: string;
  readonly message: string;
  readonly details?: any

}

export type MemoryStoreType =
  | 'local'
  | distributed
  | ca'c'h'e')';

export interface MemoryStoreConfig { readonly [key: string]: any
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
  readonly logLevel: 'debug' |info | 'warn'| erro'r')'

}

/**
 * Event metrics.
 *
 * @example
 */
export interface EventMetrics {
  readonly eventCount: number;
  readonly eventTypes: Record<string,
  number>;
  readonly avgProcessingTime: number;
  readonly errorCount: number;
  readonly listenerCount: number

}
