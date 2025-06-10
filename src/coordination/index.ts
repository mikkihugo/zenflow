/**
 * Coordination system exports
 */

// Core coordination components
export { CoordinationManager, type ICoordinationManager } from './manager.ts';
export { TaskScheduler } from './scheduler.ts';
export { ResourceManager } from './resources.ts';
export { MessageRouter } from './messaging.ts';

// Advanced scheduling
export { 
  AdvancedTaskScheduler,
  type SchedulingStrategy,
  type SchedulingContext,
  CapabilitySchedulingStrategy,
  RoundRobinSchedulingStrategy,
  LeastLoadedSchedulingStrategy,
  AffinitySchedulingStrategy,
} from './advanced-scheduler.ts';

// Work stealing
export {
  WorkStealingCoordinator,
  type WorkStealingConfig,
  type AgentWorkload,
} from './work-stealing.ts';

// Dependency management
export {
  DependencyGraph,
  type DependencyNode,
  type DependencyPath,
} from './dependency-graph.ts';

// Circuit breakers
export {
  CircuitBreaker,
  CircuitBreakerManager,
  CircuitState,
  type CircuitBreakerConfig,
  type CircuitBreakerMetrics,
} from './circuit-breaker.ts';

// Conflict resolution
export {
  ConflictResolver,
  PriorityResolutionStrategy,
  TimestampResolutionStrategy,
  VotingResolutionStrategy,
  OptimisticLockManager,
  type ResourceConflict,
  type TaskConflict,
  type ConflictResolution,
  type ConflictResolutionStrategy,
} from './conflict-resolution.ts';

// Metrics and monitoring
export {
  CoordinationMetricsCollector,
  type CoordinationMetrics,
  type MetricsSample,
} from './metrics.ts';