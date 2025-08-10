/**
 * Intelligent Load Balancing System for Claude-Zen Swarm Agents.
 * Advanced load balancing with ML-based prediction and multi-dimensional metrics.
 */
/**
 * @file load-balancing module exports
 */

export { AdaptiveLearningAlgorithm } from './algorithms/adaptive-learning';
export { LeastConnectionsAlgorithm } from './algorithms/least-connections';
export { MLPredictiveAlgorithm } from './algorithms/ml-predictive';
export { ResourceAwareAlgorithm } from './algorithms/resource-aware';
export { WeightedRoundRobinAlgorithm } from './algorithms/weighted-round-robin';
export { AgentCapacityManager } from './capacity/agent-capacity-manager';
export { CapacityPredictor } from './capacity/capacity-predictor';
export { ResourceMonitor } from './capacity/resource-monitor';
export * from './interfaces';
export { LoadBalancingManager } from './load-balancing-manager';
export { BandwidthOptimizer } from './optimization/bandwidth-optimizer';
export { CacheAwareRouter } from './optimization/cache-aware-router';
export { ConnectionPoolOptimizer } from './optimization/connection-pool-optimizer';
export { NetworkLatencyOptimizer } from './optimization/network-latency-optimizer';
export { RequestBatchOptimizer } from './optimization/request-batch-optimizer';
export { FailoverManager } from './routing/failover-manager';
export { IntelligentRoutingEngine } from './routing/intelligent-routing-engine';
export { TaskAgentMatcher } from './routing/task-agent-matcher';
export { AutoScalingStrategy } from './strategies/auto-scaling-strategy';
export { CircuitBreakerStrategy } from './strategies/circuit-breaker-strategy';
export { LoadBalancingStrategy } from './strategies/load-balancing-strategy';
export { StickySessionStrategy } from './strategies/sticky-session-strategy';
export * from './types';
