/**
 * Type definitions for the Intelligent Load Balancing System.
 */
/**
 * @file TypeScript type definitions for coordination
 */

export interface Agent {
  id: string;
  name: string;
  capabilities: string[];
  status: AgentStatus;
  endpoint: string;
  lastHealthCheck: Date;
  metadata: Record<string, unknown>;
}

export enum AgentStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  OFFLINE = 'offline',
  MAINTENANCE = 'maintenance',
}

export interface Task {
  id: string;
  type: string;
  priority: TaskPriority;
  requiredCapabilities: string[];
  estimatedDuration: number;
  maxRetries: number;
  timeout: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export enum TaskPriority {
  LOW = 1,
  NORMAL = 2,
  HIGH = 3,
  CRITICAL = 4,
  EMERGENCY = 5,
}

export interface LoadMetrics {
  timestamp: Date;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkUsage: number;
  activeTasks: number;
  queueLength: number;
  responseTime: number;
  errorRate: number;
  throughput: number;
}

export interface CapacityMetrics {
  maxConcurrentTasks: number;
  currentUtilization: number;
  availableCapacity: number;
  predictedCapacity: number;
  capacityTrend: 'increasing' | 'decreasing' | 'stable';
  resourceConstraints: ResourceConstraint[];
}

export interface ResourceConstraint {
  type: 'cpu' | 'memory' | 'disk' | 'network' | 'custom';
  threshold: number;
  currentValue: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface RoutingResult {
  selectedAgent: Agent;
  confidence: number;
  reasoning: string;
  alternativeAgents: Agent[];
  estimatedLatency: number;
  expectedQuality: number;
}

export interface LoadBalancingConfig {
  algorithm: LoadBalancingAlgorithm;
  healthCheckInterval: number;
  maxRetries: number;
  timeoutMs: number;
  circuitBreakerConfig: CircuitBreakerConfig;
  stickySessionConfig: StickySessionConfig;
  autoScalingConfig: AutoScalingConfig;
  optimizationConfig: OptimizationConfig;
}

export enum LoadBalancingAlgorithm {
  ROUND_ROBIN = 'round_robin',
  WEIGHTED_ROUND_ROBIN = 'weighted_round_robin',
  LEAST_CONNECTIONS = 'least_connections',
  RESOURCE_AWARE = 'resource_aware',
  ML_PREDICTIVE = 'ml_predictive',
  ADAPTIVE_LEARNING = 'adaptive_learning',
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  halfOpenMaxCalls: number;
  monitoringPeriod: number;
}

export interface StickySessionConfig {
  enabled: boolean;
  sessionTimeout: number;
  affinityStrength: number;
  fallbackStrategy: 'fail' | 'redistribute';
}

export interface AutoScalingConfig {
  enabled: boolean;
  minAgents: number;
  maxAgents: number;
  scaleUpThreshold: number;
  scaleDownThreshold: number;
  cooldownPeriod: number;
}

export interface OptimizationConfig {
  connectionPooling: boolean;
  requestBatching: boolean;
  cacheAwareRouting: boolean;
  networkOptimization: boolean;
  bandwidthOptimization: boolean;
}

export interface PredictionModel {
  modelType: 'linear' | 'neural' | 'ensemble';
  accuracy: number;
  features: string[];
  lastTraining: Date;
  version: string;
}

export interface HistoricalData {
  timestamp: Date;
  agentId: string;
  taskType: string;
  duration: number;
  success: boolean;
  resourceUsage: LoadMetrics;
}

export interface QoSRequirement {
  maxLatency: number;
  minThroughput: number;
  maxErrorRate: number;
  availability: number;
}

export interface LoadBalancingStrategy {
  name: string;
  selectAgent(
    task: Task,
    availableAgents: Agent[],
    metrics: Map<string, LoadMetrics>
  ): Promise<RoutingResult>;
  updateWeights?(
    agents: Agent[],
    metrics: Map<string, LoadMetrics>
  ): Promise<void>;
  onAgentFailure?(agentId: string, error: Error): Promise<void>;
  onTaskComplete?(
    agentId: string,
    task: Task,
    duration: number,
    success: boolean
  ): Promise<void>;
}

export interface GeographicLocation {
  region: string;
  zone: string;
  latitude: number;
  longitude: number;
  networkLatency: Map<string, number>;
}

export interface NetworkTopology {
  agents: Map<string, GeographicLocation>;
  connections: NetworkConnection[];
  bandwidthLimits: Map<string, number>;
}

export interface NetworkConnection {
  from: string;
  to: string;
  latency: number;
  bandwidth: number;
  reliability: number;
}

export interface EmergencyProtocol {
  name: string;
  triggers: string[];
  actions: EmergencyAction[];
  priority: number;
}

export interface EmergencyAction {
  type: 'load_shed' | 'scale_up' | 'failover' | 'throttle' | 'alert';
  parameters: Record<string, unknown>;
  timeout: number;
}
