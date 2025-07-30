/**
 * Coordination System Types
 * Advanced coordination layer for Queens, Swarms, and Hive Mind integration
 */

import { Identifiable, JSONObject, TypedEventEmitter, ResourceUsage } from './core';
import { Queen } from './queen';
import { Swarm } from './swarm';
import { HiveMind } from './hive-mind';

// =============================================================================
// COORDINATION CORE TYPES
// =============================================================================

export type CoordinationPattern = 
  | 'centralized'
  | 'distributed' 
  | 'hierarchical'
  | 'peer-to-peer'
  | 'hybrid'
  | 'mesh'
  | 'ring'
  | 'star'
  | 'tree'
  | 'gossip'
  | 'consensus'
  | 'blockchain'
  | 'federated';

export type CoordinationStrategy = 
  | 'leader-follower'
  | 'democratic'
  | 'anarchic'
  | 'autocratic'
  | 'collaborative'
  | 'competitive'
  | 'cooperative'
  | 'negotiation'
  | 'auction'
  | 'market-based'
  | 'swarm-intelligence'
  | 'emergent';

export type MessageType = 
  | 'command'
  | 'query'
  | 'response'
  | 'notification'
  | 'heartbeat'
  | 'discovery'
  | 'gossip'
  | 'consensus'
  | 'election'
  | 'synchronization'
  | 'resource-request'
  | 'resource-grant'
  | 'task-assignment'
  | 'task-result'
  | 'error'
  | 'alert';

export type CoordinationStatus = 'initializing' | 'active' | 'degraded' | 'partitioned' | 'failed' | 'shutdown';

// =============================================================================
// COORDINATION NETWORK
// =============================================================================

export interface CoordinationNetwork extends Identifiable {
  name: string;
  pattern: CoordinationPattern;
  strategy: CoordinationStrategy;
  status: CoordinationStatus;
  
  // Network topology
  topology: {
    nodes: NetworkNode[];
    edges: NetworkEdge[];
    diameter: number;
    clustering: number;
    centrality: Record<UUID, number>;
    partitions: NetworkPartition[];
  };
  
  // Configuration
  config: {
    maxNodes: number;
    maxEdges: number;
    heartbeatInterval: number; // milliseconds
    electionTimeout: number; // milliseconds
    consensusTimeout: number; // milliseconds
    messageTimeout: number; // milliseconds
    retryAttempts: number;
    bufferSize: number;
    compressionEnabled: boolean;
    encryptionEnabled: boolean;
  };
  
  // Performance metrics
  metrics: {
    messageCount: number;
    averageLatency: number; // milliseconds
    throughput: number; // messages per second
    errorRate: number; // 0-1
    partitionTolerance: number; // 0-1
    availabilityRate: number; // 0-1
    consistencyLevel: number; // 0-1
  };
  
  // Health monitoring
  health: {
    overallHealth: number; // 0-1
    nodeHealth: Record<UUID, number>;
    networkPartitions: number;
    byzantineFaults: number;
    lastHealthCheck: Date;
  };
  
  // State management
  state: {
    leaderNode?: UUID;
    epoch: number;
    term: number;
    lastElection: Date;
    consensusRounds: number;
    pendingOperations: number;
  };
}

export interface NetworkNode extends Identifiable {
  type: 'queen' | 'swarm' | 'hive' | 'coordinator' | 'proxy' | 'gateway';
  address: NodeAddress;
  capabilities: NodeCapability[];
  
  // Node state
  status: 'active' | 'inactive' | 'suspected' | 'failed' | 'recovering';
  role: 'leader' | 'follower' | 'candidate' | 'observer' | 'proxy';
  lastSeen: Date;
  joinedAt: Date;
  
  // Performance metrics
  metrics: {
    messagesProcessed: number;
    averageResponseTime: number;
    errorCount: number;
    loadFactor: number; // 0-1
    reliability: number; // 0-1
  };
  
  // Resource information
  resources: {
    cpu: ResourceInfo;
    memory: ResourceInfo;
    network: ResourceInfo;
    storage: ResourceInfo;
    custom: Record<string, ResourceInfo>;
  };
  
  // Relationships
  neighbors: UUID[];
  routes: Route[];
  subscriptions: Subscription[];
}

export interface NetworkEdge extends Identifiable {
  sourceId: UUID;
  targetId: UUID;
  type: 'direct' | 'relay' | 'virtual' | 'backup';
  
  // Connection properties
  weight: number; // 0-1
  latency: number; // milliseconds
  bandwidth: number; // bytes per second
  reliability: number; // 0-1
  cost: number;
  
  // Quality metrics
  packetLoss: number; // 0-1
  jitter: number; // milliseconds
  congestion: number; // 0-1
  uptime: number; // 0-1
  
  // State
  status: 'active' | 'inactive' | 'congested' | 'failed';
  established: Date;
  lastActivity: Date;
  
  // Security
  encrypted: boolean;
  authenticated: boolean;
  trusted: boolean;
}

export interface NetworkPartition {
  id: UUID;
  nodes: UUID[];
  size: number;
  leader?: UUID;
  isolated: boolean;
  createdAt: Date;
  healedAt?: Date;
  
  // Partition metrics
  internalConnectivity: number; // 0-1
  externalConnectivity: number; // 0-1
  consensus: boolean;
  dataConsistency: number; // 0-1
}

// =============================================================================
// MESSAGE SYSTEM
// =============================================================================

export interface CoordinationMessage extends Identifiable {
  type: MessageType;
  sourceId: UUID;
  targetId: UUID | 'broadcast' | 'multicast';
  
  // Message content
  payload: JSONObject;
  headers: Record<string, string>;
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'system';
  
  // Routing information
  route: UUID[];
  hopCount: number;
  ttl: number; // time to live in seconds
  
  // Quality of service
  qos: {
    reliability: 'best-effort' | 'at-least-once' | 'exactly-once';
    ordering: 'none' | 'fifo' | 'causal' | 'total';
    durability: 'volatile' | 'persistent' | 'replicated';
    latency: 'low' | 'medium' | 'high' | 'batch';
  };
  
  // Timing
  timestamp: Date;
  timeout: number; // milliseconds
  expiresAt: Date;
  
  // Status tracking
  status: 'pending' | 'sent' | 'delivered' | 'acknowledged' | 'failed' | 'expired';
  attempts: number;
  maxAttempts: number;
  
  // Response handling
  correlationId?: UUID;
  replyTo?: UUID;
  expectsReply: boolean;
  
  // Security
  signed: boolean;
  encrypted: boolean;
  signature?: string;
  checksum: string;
}

export interface MessageBus extends TypedEventEmitter<MessageBusEvents> {
  // Message operations
  send(message: CoordinationMessage): Promise<void>;
  broadcast(message: Omit<CoordinationMessage, 'targetId'>): Promise<void>;
  multicast(message: Omit<CoordinationMessage, 'targetId'>, targets: UUID[]): Promise<void>;
  reply(originalMessage: CoordinationMessage, response: JSONObject): Promise<void>;
  
  // Subscription management
  subscribe(pattern: MessagePattern, handler: MessageHandler): Promise<UUID>;
  unsubscribe(subscriptionId: UUID): Promise<boolean>;
  
  // Routing
  addRoute(route: Route): Promise<void>;
  removeRoute(routeId: UUID): Promise<boolean>;
  findRoute(sourceId: UUID, targetId: UUID): Promise<Route | null>;
  
  // Quality of service
  setQoSPolicy(policy: QoSPolicy): Promise<void>;
  getQoSMetrics(): Promise<QoSMetrics>;
  
  // Management
  getMetrics(): Promise<MessageBusMetrics>;
  getHealth(): Promise<MessageBusHealth>;
  purgeExpiredMessages(): Promise<number>;
}

export interface MessagePattern {
  type?: MessageType;
  sourceId?: UUID | string; // string for patterns like "queen:*"
  targetId?: UUID | string;
  headers?: Record<string, string>;
  priority?: ('low' | 'medium' | 'high' | 'urgent' | 'system')[];
}

export interface MessageHandler {
  (message: CoordinationMessage, context: MessageContext): Promise<JSONObject | void>;
}

export interface MessageContext {
  network: CoordinationNetwork;
  bus: MessageBus;
  sourceNode: NetworkNode;
  route: Route;
  qos: QoSMetrics;
  security: SecurityContext;
}

// =============================================================================
// COORDINATION PROTOCOLS
// =============================================================================

export interface CoordinationProtocol {
  name: string;
  version: string;
  type: 'consensus' | 'leader-election' | 'mutual-exclusion' | 'synchronization' | 'replication' | 'custom';
  
  // Protocol configuration
  parameters: JSONObject;
  constraints: ProtocolConstraint[];
  assumptions: string[];
  
  // Performance characteristics
  characteristics: {
    faultTolerance: number; // maximum faults tolerated
    timeComplexity: string;
    messageComplexity: string;
    roundComplexity: number;
    terminationGuarantee: boolean;
    safetyGuarantee: boolean;
    livenessGuarantee: boolean;
  };
  
  // Implementation
  phases: ProtocolPhase[];
  messageTypes: MessageType[];
  stateTransitions: StateTransition[];
  
  // Quality attributes
  qualities: {
    consistency: 'weak' | 'eventual' | 'strong' | 'linearizable';
    availability: 'low' | 'medium' | 'high' | 'always';
    partition_tolerance: 'none' | 'partial' | 'full';
    latency: 'low' | 'medium' | 'high' | 'variable';
    throughput: 'low' | 'medium' | 'high' | 'variable';
  };
}

export interface ProtocolPhase {
  name: string;
  description: string;
  duration: number; // milliseconds
  
  // Phase requirements
  prerequisites: string[];
  participants: NodeRole[];
  messages: MessageType[];
  
  // Phase logic  
  conditions: ProtocolCondition[];
  actions: ProtocolAction[];
  transitions: StateTransition[];
  
  // Failure handling
  timeouts: number[];
  retries: number;
  fallback?: string;
}

export interface ProtocolCondition {
  type: 'message-received' | 'timeout' | 'state-change' | 'threshold' | 'custom';
  expression: string;
  parameters: JSONObject;
}

export interface ProtocolAction {
  type: 'send-message' | 'update-state' | 'start-timer' | 'stop-timer' | 'execute-function' | 'custom';
  target?: UUID;
  parameters: JSONObject;
  condition?: ProtocolCondition;
}

export interface StateTransition {
  from: string;
  to: string;
  trigger: string;
  guard?: ProtocolCondition;
  action?: ProtocolAction;
}

// =============================================================================
// CONSENSUS SYSTEM
// =============================================================================

export interface ConsensusEngine extends Identifiable {
  algorithm: 'raft' | 'pbft' | 'pow' | 'pos' | 'dpos' | 'hotstuff' | 'tendermint' | 'algorand' | 'custom';
  status: 'initializing' | 'follower' | 'candidate' | 'leader' | 'observer' | 'failed';
  
  // Consensus state
  state: {
    term: number;
    votedFor?: UUID;
    log: LogEntry[];
    commitIndex: number;
    lastApplied: number;
    nextIndex: Record<UUID, number>;
    matchIndex: Record<UUID, number>;
  };
  
  // Configuration
  config: {
    nodes: UUID[];
    quorumSize: number;
    electionTimeoutMin: number; // milliseconds
    electionTimeoutMax: number; // milliseconds
    heartbeatInterval: number; // milliseconds
    maxLogEntries: number;
    snapshotThreshold: number;
    batchSize: number;
  };
  
  // Performance metrics
  metrics: {
    electionCount: number;
    consensusRounds: number;
    averageConsensusTime: number; // milliseconds
    throughput: number; // operations per second
    latency: {
      p50: number;
      p95: number;
      p99: number;
    };
  };
  
  // Fault tolerance
  faultTolerance: {
    maxByzantineFaults: number;
    maxCrashFaults: number;
    currentFaults: number;
    faultDetection: boolean;
    recovery: boolean;
  };
}

export interface LogEntry extends Identifiable {
  term: number;
  index: number;
  command: JSONObject;
  timestamp: Date;
  committed: boolean;
  
  // Metadata
  type: 'operation' | 'configuration' | 'snapshot' | 'no-op';
  size: number; // bytes
  checksum: string;
  
  // Consensus tracking
  votes: Record<UUID, boolean>;
  quorum: boolean;
  appliedAt?: Date;
}

export interface ConsensusOperation {
  type: 'propose' | 'vote' | 'commit' | 'abort' | 'snapshot' | 'reconfigure';
  initiator: UUID;
  proposal: JSONObject;
  
  // Voting information
  ballotNumber: number;
  quorumSize: number;
  votes: Vote[];
  decision?: 'accept' | 'reject' | 'timeout';
  
  // Timing
  startTime: Date;
  endTime?: Date;
  timeout: number; // milliseconds
  
  // Results
  result?: JSONObject;
  committed: boolean;
  appliedNodes: UUID[];
}

export interface Vote {
  nodeId: UUID;
  ballot: number;
  decision: 'accept' | 'reject' | 'abstain';
  reasoning?: string;
  timestamp: Date;
  signature?: string;
}

// =============================================================================
// SCHEDULING & ORCHESTRATION
// =============================================================================

export interface CoordinationScheduler extends Identifiable {
  type: 'round-robin' | 'priority' | 'fair-share' | 'load-balanced' | 'capability-based' | 'ml-optimized';
  status: 'active' | 'paused' | 'overloaded' | 'failed';
  
  // Scheduling policies
  policies: {
    defaultPolicy: SchedulingPolicy;
    taskPolicies: Record<string, SchedulingPolicy>;
    resourcePolicies: Record<string, ResourcePolicy>;
    priorityPolicies: Record<string, PriorityPolicy>;
  };
  
  // Queue management
  queues: {
    pending: ScheduledTask[];
    running: ScheduledTask[];
    completed: ScheduledTask[];
    failed: ScheduledTask[];
    capacity: number;
    maxWaitTime: number; // milliseconds
  };
  
  // Resource tracking
  resources: {
    available: ResourcePool[];
    allocated: ResourceAllocation[];
    utilization: Record<string, number>; // 0-1
    reservations: ResourceReservation[];
  };
  
  // Performance metrics
  metrics: {
    tasksScheduled: number;
    averageWaitTime: number; // milliseconds
    averageExecutionTime: number; // milliseconds
    throughput: number; // tasks per second
    fairness: number; // 0-1
    efficiency: number; // 0-1
    loadBalance: number; // 0-1
  };
  
  // Optimization
  optimization: {
    algorithm: 'genetic' | 'simulated-annealing' | 'particle-swarm' | 'gradient-descent' | 'reinforcement-learning';
    objective: 'minimize-latency' | 'maximize-throughput' | 'balance-load' | 'minimize-cost' | 'multi-objective';
    parameters: JSONObject;
    enabled: boolean;
    frequency: number; // seconds
    lastOptimization: Date;
  };
}

export interface ScheduledTask extends Identifiable {
  type: string;
  priority: number; // 0-100
  requirements: TaskRequirements;
  constraints: TaskConstraints;
  
  // Scheduling information
  submittedAt: Date;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  assignedResources: UUID[];
  
  // Dependencies
  dependencies: UUID[];
  dependents: UUID[];
  precedence: number;
  
  // Status tracking
  status: 'pending' | 'queued' | 'scheduled' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  
  // Quality metrics
  qos: {
    deadline: Date;
    latencyRequirement: number; // milliseconds
    reliabilityRequirement: number; // 0-1
    throughputRequirement: number; // operations per second
  };
  
  // Results
  result?: JSONObject;
  metrics?: TaskExecutionMetrics;
  errors?: string[];
}

export interface TaskRequirements {
  cpu: number; // cores
  memory: number; // MB
  storage: number; // MB
  network: number; // KB/s
  gpu?: number; // cores
  
  // Capability requirements
  capabilities: string[];
  minimumVersion: string;
  operatingSystem: string[];
  architecture: string[];
  
  // Specialized requirements
  specialized: Record<string, any>;
}

export interface TaskConstraints {
  // Temporal constraints
  earliestStart?: Date;
  latestStart?: Date;
  deadline?: Date;
  maxDuration?: number; // milliseconds
  
  // Resource constraints
  maxCost: number;
  requiredNodes: UUID[];
  excludedNodes: UUID[];
  colocation: UUID[];
  separation: UUID[];
  
  // Quality constraints
  minQuality: number; // 0-1
  maxRetries: number;
  faultTolerance: boolean;
  
  // Custom constraints
  custom: Record<string, any>;
}

// =============================================================================
// RESOURCE MANAGEMENT
// =============================================================================

export interface ResourceManager extends Identifiable {
  strategy: 'static' | 'dynamic' | 'predictive' | 'market-based' | 'auction' | 'negotiation';
  status: 'active' | 'degraded' | 'failed';
  
  // Resource pools
  pools: ResourcePool[];
  
  // Allocation tracking
  allocations: ResourceAllocation[];
  reservations: ResourceReservation[];
  
  // Policies
  policies: {
    allocation: AllocationPolicy;
    reclamation: ReclamationPolicy;
    sharing: SharingPolicy;
    pricing: PricingPolicy;
  };
  
  // Performance metrics
  metrics: {
    utilization: Record<string, number>; // 0-1 per resource type
    fragmentation: number; // 0-1
    efficiency: number; // 0-1
    fairness: number; // 0-1
    waste: number; // 0-1
    contention: Record<string, number>; // per resource type
  };
  
  // Optimization
  optimization: {
    enabled: boolean;
    algorithm: 'first-fit' | 'best-fit' | 'worst-fit' | 'genetic' | 'ml-based';
    objective: 'maximize-utilization' | 'minimize-fragmentation' | 'minimize-cost' | 'balance-load';
    parameters: JSONObject;
  };
}

export interface ResourcePool extends Identifiable {
  name: string;
  type: string;
  
  // Capacity
  total: ResourceCapacity;
  available: ResourceCapacity;
  allocated: ResourceCapacity;
  reserved: ResourceCapacity;
  
  // Configuration
  shared: boolean;
  preemptible: boolean;
  priority: number;
  cost: number; // per unit per hour
  
  // Quality attributes
  reliability: number; // 0-1
  performance: number; // 0-1
  availability: number; // 0-1
  
  // Access control
  permissions: ResourcePermission[];
  quota: Record<string, number>; // per user/group
  
  // Status
  status: 'active' | 'maintenance' | 'degraded' | 'failed' | 'retired';
  health: number; // 0-1
  lastHealthCheck: Date;
}

export interface ResourceCapacity {
  cpu: number; // cores
  memory: number; // MB
  storage: number; // MB
  network: number; // KB/s
  gpu: number; // cores
  custom: Record<string, number>;
}

export interface ResourceAllocation extends Identifiable {
  resourceId: UUID;
  taskId: UUID;
  requesterId: UUID;
  
  // Allocation details
  amount: ResourceCapacity;
  duration: number; // milliseconds
  priority: number;
  preemptible: boolean;
  
  // Timing
  allocatedAt: Date;
  releasedAt?: Date;
  expiresAt?: Date;
  
  // Status
  status: 'active' | 'expired' | 'released' | 'preempted' | 'failed';
  
  // Usage tracking
  actualUsage: ResourceUsage[];
  efficiency: number; // 0-1
  cost: number;
}

export interface ResourceReservation extends Identifiable {
  resourceId: UUID;
  requesterId: UUID;
  
  // Reservation details
  amount: ResourceCapacity;
  startTime: Date;
  endTime: Date;
  priority: number;
  
  // Status
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'expired';
  
  // Policies
  cancellable: boolean;
  transferable: boolean;
  renewable: boolean;
  
  // Cost
  cost: number;
  deposit: number;
}

// =============================================================================
// COORDINATION EVENTS
// =============================================================================

export interface CoordinationEvents {
  // Network events
  'node-joined': (nodeId: UUID, network: CoordinationNetwork) => void;
  'node-left': (nodeId: UUID, reason: string) => void;
  'node-failed': (nodeId: UUID, error: string) => void;
  'node-recovered': (nodeId: UUID) => void;
  'partition-detected': (partition: NetworkPartition) => void;
  'partition-healed': (partitionId: UUID) => void;
  
  // Message events
  'message-sent': (message: CoordinationMessage) => void;
  'message-received': (message: CoordinationMessage) => void;
  'message-failed': (messageId: UUID, error: string) => void;
  'message-timeout': (messageId: UUID) => void;
  
  // Consensus events
  'election-started': (term: number) => void;
  'leader-elected': (leaderId: UUID, term: number) => void;
  'consensus-reached': (operation: ConsensusOperation) => void;
  'consensus-failed': (operation: ConsensusOperation, reason: string) => void;
  
  // Scheduling events
  'task-scheduled': (taskId: UUID, resourceId: UUID) => void;
  'task-rescheduled': (taskId: UUID, oldResource: UUID, newResource: UUID) => void;
  'queue-full': (queueType: string, capacity: number) => void;
  'resource-exhausted': (resourceType: string, poolId: UUID) => void;
  
  // Performance events
  'performance-degraded': (component: string, metric: string, value: number) => void;
  'bottleneck-detected': (component: string, cause: string) => void;
  'optimization-triggered': (component: string, algorithm: string) => void;
  'sla-violated': (sla: string, actual: number, expected: number) => void;
}

export interface MessageBusEvents {
  'message-sent': (message: CoordinationMessage) => void;
  'message-delivered': (messageId: UUID, latency: number) => void;
  'message-failed': (messageId: UUID, error: string) => void;
  'subscription-added': (subscriptionId: UUID, pattern: MessagePattern) => void;
  'subscription-removed': (subscriptionId: UUID) => void;
  'route-added': (route: Route) => void;
  'route-removed': (routeId: UUID) => void;
  'qos-violated': (messageId: UUID, violation: string) => void;
}

// =============================================================================
// AUXILIARY TYPES
// =============================================================================

export interface NodeAddress {
  protocol: 'tcp' | 'udp' | 'websocket' | 'http' | 'grpc' | 'custom';
  host: string;
  port: number;
  path?: string;
  secure: boolean;
}

export interface NodeCapability {
  name: string;
  version: string;
  type: 'processing' | 'storage' | 'network' | 'specialized';
  capacity: number;
  available: number;
  quality: number; // 0-1
}

export interface NodeRole {
  name: string;
  permissions: string[];
  responsibilities: string[];
  constraints: JSONObject;
}

export interface ResourceInfo {
  total: number;
  available: number;
  allocated: number;
  unit: string;
  quality: number; // 0-1
}

export interface Route extends Identifiable {
  sourceId: UUID;
  targetId: UUID;
  path: UUID[];
  
  // Route metrics
  cost: number;
  latency: number; // milliseconds
  bandwidth: number; // bytes per second
  reliability: number; // 0-1
  
  // Route status
  active: boolean;
  primary: boolean;
  backup: boolean;
  
  // Quality of service
  qos: QoSLevel;
  
  // Maintenance
  lastUsed: Date;
  usageCount: number;
  errors: number;
}

export interface Subscription extends Identifiable {
  pattern: MessagePattern;
  handler: MessageHandler;
  nodeId: UUID;
  
  // Subscription metadata
  priority: number;
  active: boolean;
  persistent: boolean;
  
  // Statistics
  messagesHandled: number;
  errorsCount: number;
  averageProcessingTime: number; // milliseconds
  lastActivity: Date;
}

export interface QoSPolicy {
  name: string;
  rules: QoSRule[];
  default: QoSLevel;
  enforcement: 'strict' | 'best-effort' | 'adaptive';
}

export interface QoSRule {
  condition: MessagePattern;
  qos: QoSLevel;
  priority: number;
}

export interface QoSLevel {
  reliability: 'best-effort' | 'at-least-once' | 'exactly-once';
  ordering: 'none' | 'fifo' | 'causal' | 'total';
  durability: 'volatile' | 'persistent' | 'replicated';
  latency: 'low' | 'medium' | 'high' | 'batch';
  throughput: number; // messages per second
  timeout: number; // milliseconds
}

export interface QoSMetrics {
  deliveryRate: number; // 0-1
  averageLatency: number; // milliseconds
  duplicateRate: number; // 0-1
  orderViolations: number;
  timeoutRate: number; // 0-1
  throughput: number; // messages per second
}

export interface MessageBusMetrics {
  totalMessages: number;
  messagesPerSecond: number;
  averageLatency: number; // milliseconds
  errorRate: number; // 0-1
  queueDepth: Record<string, number>;
  throughput: Record<string, number>; // per message type
}

export interface MessageBusHealth {
  status: 'healthy' | 'degraded' | 'critical' | 'failed';
  components: {
    routing: 'healthy' | 'degraded' | 'failed';
    queuing: 'healthy' | 'degraded' | 'failed';
    delivery: 'healthy' | 'degraded' | 'failed';
    persistence: 'healthy' | 'degraded' | 'failed';
  };
  issues: string[];
  recommendations: string[];
  lastCheck: Date;
}

export interface ProtocolConstraint {
  type: 'timing' | 'resource' | 'ordering' | 'consistency' | 'security' | 'custom';
  description: string;
  parameters: JSONObject;
  severity: 'must' | 'should' | 'may';
}

export interface SchedulingPolicy {
  algorithm: string;
  parameters: JSONObject;
  constraints: string[];
  objectives: string[];
  fairness: boolean;
  preemption: boolean;
}

export interface ResourcePolicy {
  type: 'quota' | 'priority' | 'fair-share' | 'reservation' | 'custom';
  parameters: JSONObject;
  scope: 'global' | 'pool' | 'user' | 'group' | 'task';
  enforcement: 'strict' | 'soft' | 'advisory';
}

export interface PriorityPolicy {
  levels: number;
  algorithm: 'static' | 'dynamic' | 'aging' | 'lottery' | 'stride';
  parameters: JSONObject;
  inheritance: boolean;
  inversion: boolean;
}

export interface AllocationPolicy {
  strategy: 'first-fit' | 'best-fit' | 'worst-fit' | 'next-fit' | 'buddy' | 'slab';
  fragmentation_threshold: number; // 0-1
  compaction: boolean;
  overcommit: boolean;
  overcommit_ratio: number; // > 1
}

export interface ReclamationPolicy {
  enabled: boolean;
  triggers: ('idle' | 'low-priority' | 'deadline' | 'emergency')[];
  grace_period: number; // milliseconds
  notification: boolean;
  compensation: boolean;
}

export interface SharingPolicy {
  enabled: boolean;
  granularity: 'coarse' | 'fine' | 'adaptive';
  isolation: 'none' | 'soft' | 'hard';
  contention_resolution: 'fifo' | 'priority' | 'fair' | 'auction';
}

export interface PricingPolicy {
  model: 'fixed' | 'variable' | 'auction' | 'market' | 'negotiated';
  base_price: number;
  demand_multiplier: number;
  quality_multiplier: number;
  discount: Record<string, number>; // per user type
}

export interface ResourcePermission {
  principal: string; // user or group
  actions: ('read' | 'write' | 'allocate' | 'deallocate' | 'reserve' | 'admin')[];
  conditions: JSONObject;
  expiration?: Date;
}

export interface TaskExecutionMetrics {
  startTime: Date;
  endTime: Date;
  duration: number; // milliseconds
  cpuTime: number; // milliseconds
  memoryPeak: number; // MB
  networkIO: number; // bytes
  diskIO: number; // bytes
  exitCode: number;
  efficiency: number; // 0-1
}

export interface SecurityContext {
  authenticated: boolean;
  principal?: string;
  roles: string[];
  permissions: string[];
  session?: string;
  encryption: boolean;
  signature: boolean;
}