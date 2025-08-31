/**
 * Interface definitions for the Load Balancing System.
 */
/**
 * @file Coordination system:interfaces
 */

import type { EventEmitter } from '@claude-zen/foundation';

import type {
  Agent,
  CapacityMetrics,
  LoadMetrics,
  PredictionModel,
  QoSRequirement,
  RoutingResult,
  Task,
} from './types';

export interface LoadBalancingAlgorithm {
  name: string;
  selectAgent(
    task: Task,
    availableAgents: Agent[],
    metrics: Map<string, LoadMetrics>
  ): Promise<RoutingResult>;
  updateConfiguration(config: Record<string, unknown>): Promise<void>;
  getPerformanceMetrics(): Promise<Record<string, number>>;

  // Optional methods that some algorithms may implement
  onTaskComplete?(
    agentId: string,
    task: Task,
    duration: number,
    success: boolean
  ): Promise<void>;
  updateWeights?(
    agents: Agent[],
    agentMetrics: Map<string, LoadMetrics>
  ): Promise<void>;
  onAgentFailure?(agentId: string, error: Error): Promise<void>;
}

export interface CapacityManager {
  getCapacity(agentId: string): Promise<CapacityMetrics>;
  predictCapacity(agentId: string, timeHorizon: number): Promise<number>;
  updateCapacity(agentId: string, metrics: LoadMetrics): Promise<void>;
  isCapacityAvailable(
    agentId: string,
    requiredResources: Record<string, number>
  ): Promise<boolean>;
}

export interface ResourceMonitor {
  startMonitoring(agentId: string): Promise<void>;
  stopMonitoring(agentId: string): Promise<void>;
  getCurrentMetrics(agentId: string): Promise<LoadMetrics | null>;
  getHistoricalMetrics(
    agentId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<LoadMetrics[]>;
  setThresholds(
    agentId: string,
    thresholds: Record<string, number>
  ): Promise<void>;
}

export interface RoutingEngine {
  route(task: Task): Promise<RoutingResult>;
  updateRoutingTable(agents: Agent[]): Promise<void>;
  handleFailover(failedAgentId: string): Promise<void>;
  optimizeRoutes(): Promise<void>;
}

export interface PredictionEngine {
  predict(features: Record<string, number>): Promise<number>;
  train(data: unknown[]): Promise<void>;
  getModel(): Promise<PredictionModel>;
  updateModel(model: PredictionModel): Promise<void>;
  getAccuracy(): Promise<number>;
}

export interface HealthChecker extends EventEmitter {
  checkHealth(agent: Agent): Promise<boolean>;
  startHealthChecks(agents: Agent[]): Promise<void>;
  stopHealthChecks(): Promise<void>;
  getHealthStatus(
    agentId: string
  ): Promise<{ healthy: boolean; lastCheck: Date; details?: string }>;
}

export interface CircuitBreaker {
  isOpen(agentId: string): boolean;
  recordSuccess(agentId: string): void;
  recordFailure(agentId: string, error: Error): void;
  reset(agentId: string): void;
  getState(agentId: string): 'closed' | 'open' | 'half-open';
}

export interface ConnectionPool {
  getConnection(agentId: string): Promise<unknown>;
  releaseConnection(agentId: string, connection: unknown): Promise<void>;
  closePool(agentId: string): Promise<void>;
  getPoolStats(
    agentId: string
  ): Promise<{ active: number; idle: number; total: number }>;
}

export interface BatchProcessor {
  addRequest(request: unknown): Promise<void>;
  processBatch(): Promise<any[]>;
  setBatchSize(size: number): void;
  setBatchTimeout(timeout: number): void;
}

export interface CacheManager {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown, ttl?: number): Promise<void>;
  invalidate(pattern: string): Promise<void>;
  getHitRate(): Promise<number>;
  preload(keys: string[]): Promise<void>;
}

export interface NetworkOptimizer {
  optimizeLatency(
    source: string,
    destinations: string[]
  ): Promise<Map<string, number>>;
  selectOptimalPath(source: string, destination: string): Promise<string[]>;
  monitorBandwidth(): Promise<Map<string, number>>;
  adjustQoS(requirements: QoSRequirement): Promise<void>;
}

export interface AutoScaler extends EventEmitter {
  shouldScaleUp(metrics: Map<string, LoadMetrics>): Promise<boolean>;
  shouldScaleDown(metrics: Map<string, LoadMetrics>): Promise<boolean>;
  scaleUp(count: number): Promise<Agent[]>;
  scaleDown(count: number): Promise<string[]>;
  getScalingHistory(): Promise<
    Array<{ timestamp: Date; action: string; reason: string }>
  >;
}

export interface EmergencyHandler extends EventEmitter {
  handleEmergency(
    type: string,
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): Promise<void>;
  shedLoad(percentage: number): Promise<void>;
  activateFailover(): Promise<void>;
  throttleRequests(rate: number): Promise<void>;
  sendAlert(message: string, recipients: string[]): Promise<void>;
}

export interface MetricsAggregator {
  aggregate(metrics: LoadMetrics[]): Promise<LoadMetrics>;
  calculateTrends(
    metrics: LoadMetrics[],
    timeWindow: number
  ): Promise<Record<string, 'up' | ' down' | ' stable'>>;
  detectAnomalies(
    metrics: LoadMetrics[]
  ): Promise<
    Array<{ timestamp: Date; metric: string; value: number; expected: number }>
  >;
  generateReport(timeRange: { start: Date; end: Date }): Promise<string>;
}

export interface LoadBalancingObserver {
  onAgentAdded(agent: Agent): Promise<void>;
  onAgentRemoved(agentId: string): Promise<void>;
  onTaskRouted(task: Task, agent: Agent): Promise<void>;
  onTaskCompleted(
    task: Task,
    agent: Agent,
    duration: number,
    success: boolean
  ): Promise<void>;
  onAgentFailure(agentId: string, error: Error): Promise<void>;
  onCapacityChanged(
    agentId: string,
    oldCapacity: number,
    newCapacity: number
  ): Promise<void>;
}

export interface QoSManager {
  setRequirements(requirements: QoSRequirement): Promise<void>;
  checkCompliance(agentId: string): Promise<boolean>;
  enforceQoS(agentId: string): Promise<void>;
  getQoSReport(): Promise<Record<string, unknown>>;
  adjustPriorities(tasks: Task[]): Promise<Task[]>;
}
