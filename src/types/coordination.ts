/**
 * Coordination System Types
 * Advanced coordination layer for Queens, Swarms, and Hive Mind integration
 */

import type { Identifiable, JSONObject } from './core';

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

export type CoordinationStatus =
  | 'initializing'
  | 'active'
  | 'degraded'
  | 'partitioned'
  | 'failed'
  | 'shutdown';

// =============================================================================
// COORDINATION NETWORK
// =============================================================================

export interface CoordinationNetwork extends Identifiable {name = ============================================================================
// MESSAGE SYSTEM
// =============================================================================

export interface CoordinationMessage extends Identifiable {type = ============================================================================
// COORDINATION PROTOCOLS
// =============================================================================

export interface CoordinationProtocol {name = ============================================================================
// CONSENSUS SYSTEM
// =============================================================================

export interface ConsensusEngine extends Identifiable {algorithm = ============================================================================
// SCHEDULING & ORCHESTRATION
// =============================================================================

export interface CoordinationScheduler extends Identifiable {type = ============================================================================
// RESOURCE MANAGEMENT
// =============================================================================

export interface ResourceManager extends Identifiable {strategy = ============================================================================
// COORDINATION EVENTS
// =============================================================================

export interface CoordinationEvents {
  // Network events
  'node-joined': (nodeId = > void;
  'node-left': (nodeId = > void;
  'node-failed': (nodeId = > void;
  'node-recovered': (nodeId = > void;
  'partition-detected': (partition = > void;
  'partition-healed': (partitionId = > void;
  
  // Message events
  'message-sent': (message = > void;
  'message-received': (message = > void;
  'message-failed': (messageId = > void;
  'message-timeout': (messageId = > void;
  
  // Consensus events
  'election-started': (term = > void;
  'leader-elected': (leaderId = > void;
  'consensus-reached': (operation = > void;
  'consensus-failed': (operation = > void;
  
  // Scheduling events
  'task-scheduled': (taskId = > void;
  'task-rescheduled': (taskId = > void;
  'queue-full': (queueType = > void;
  'resource-exhausted': (resourceType = > void;
  
  // Performance events
  'performance-degraded': (component = > void;
  'bottleneck-detected': (component = > void;
  'optimization-triggered': (component = > void;
  'sla-violated': (sla = > void;
}

export interface MessageBusEvents {
  'message-sent': (message = > void;
  'message-delivered': (messageId = > void;
  'message-failed': (messageId = > void;
  'subscription-added': (subscriptionId = > void;
  'subscription-removed': (subscriptionId = > void;
  'route-added': (route = > void;
  'route-removed': (routeId = > void;
  'qos-violated': (messageId = > void;
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
