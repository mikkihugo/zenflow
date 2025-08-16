/**
 * @fileoverview Chaos Engineering - Production-ready system resilience testing
 * 
 * Provides comprehensive chaos engineering capabilities for testing system
 * resilience, fault tolerance, and recovery mechanisms in production environments.
 */

import { ChaosEngineering } from './chaos-engineering';

export { ChaosEngineering };
export type {
  ChaosExperiment,
  ExperimentExecution,
  ChaosEngineeringOptions,
  ChaosStats
} from './chaos-engineering';

// Re-export useful types for consumers
export type ChaosEngineeringFeatures = {
  chaosEngineering: InstanceType<typeof ChaosEngineering>;
};