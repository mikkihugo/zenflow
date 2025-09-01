/**
 * @fileoverview Agent Monitoring Package - Main entry point
 *
 * Comprehensive agent health monitoring and performance tracking for claude-code-zen.
 * Provides real-time health metrics and performance analytics.
 */

// Core monitoring components
export { CompleteIntelligenceSystem } from './intelligence-system.js';
export type { CompleteIntelligenceSystem as IntelligenceSystemType } from './intelligence-system.js';
export * from './performance-tracker.js';
export type { TaskPredictor } from './task-predictor.js';
export { SimpleTaskPredictor } from './task-predictor.js';
export * from './intelligence-factory.js';

// Event-driven monitoring system
export { EventDrivenIntelligenceSystem, createEventDrivenIntelligenceSystem } from './intelligence-system-event-driven.js';

// EventBus bridge
export { 
  AgentMonitoringBridge,
  createAgentMonitoringBridge,
  createAgentMonitoringBridgeConfig
} from './intelligence-system-bridge.js';

// Types and interfaces
export type * from './types.js';
