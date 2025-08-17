/**
 * @claude-zen/load-balancing
 * 
 * Intelligent load balancing with ML algorithms, health monitoring, and adaptive resource management.
 * 
 * ## Simple Entry Point
 * 
 * ```typescript
 * import { LoadBalancer } from '@claude-zen/load-balancing';
 * 
 * const balancer = new LoadBalancer({
 *   algorithm: 'ml-predictive',
 *   healthCheckInterval: 5000,
 *   adaptiveLearning: true,
 *   autoScaling: {
 *     enabled: true,
 *     minAgents: 2,
 *     maxAgents: 20,
 *     targetUtilization: 0.7
 *   }
 * });
 * 
 * await balancer.start();
 * 
 * // Route tasks intelligently
 * const assignment = await balancer.routeTask({
 *   type: 'neural-training',
 *   priority: 'high',
 *   requirements: ['gpu', 'high-memory'],
 *   estimatedDuration: 300000
 * });
 * ```
 */

// ✅ MAIN ENTRY POINT - Use this for everything!
export { LoadBalancingManager as LoadBalancer } from './src/load-balancing-manager';
export { LoadBalancingManager as default } from './src/load-balancing-manager';

// Configuration types
export type { 
  LoadBalancingConfig,
  TaskRoutingRequest,
  AgentAssignment,
  LoadBalancingMetrics,
  Agent,
  Task,
  HealthStatus
} from './src/types';

// Advanced interfaces (for power users)
export type { 
  LoadBalancingObserver,
  RoutingEngine,
  CapacityManager,
  AutoScaler,
  EmergencyHandler
} from './src/interfaces';

// Algorithm options
export { LoadBalancingAlgorithm, AgentStatus } from './src/types';

// Advanced exports (for customization)
export { IntelligentRoutingEngine } from './src/routing/intelligent-routing-engine';
export { AutoScalingStrategy } from './src/strategies/auto-scaling-strategy';
export { AgentCapacityManager } from './src/capacity/agent-capacity-manager';
export { EmergencyProtocolHandler } from './src/optimization/emergency-protocol-handler';