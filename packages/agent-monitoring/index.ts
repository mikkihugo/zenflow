/**
 * @claude-zen/agent-monitoring
 * 
 * Agent monitoring system with health tracking, performance analytics, and predictive behavior analysis.
 * 
 * ## Simple Entry Point
 * 
 * ```typescript
 * import { AgentMonitor } from '@claude-zen/agent-monitoring';
 * 
 * // Simple setup
 * const monitor = await AgentMonitor.create();
 * 
 * // Monitor agent health
 * const health = monitor.getAgentHealth('agent-123');
 * 
 * // Predict task duration
 * const prediction = await monitor.predictTaskDuration('agent-123', 'code-review');
 * 
 * // Get system health summary
 * const systemHealth = monitor.getSystemHealth();
 * ```
 * 
 * ## Advanced Setup
 * 
 * ```typescript
 * import { AgentMonitor } from '@claude-zen/agent-monitoring';
 * 
 * const monitor = await AgentMonitor.createProduction({
 *   taskPrediction: { enabled: true, confidenceThreshold: 0.85 },
 *   healthMonitoring: { enabled: true, healthCheckInterval: 30000 },
 *   predictiveAnalytics: { enabled: true, enableEmergentBehavior: true }
 * });
 * ```
 */

// ✅ MAIN ENTRY POINT - Use this for everything!
export { 
  CompleteIntelligenceSystem as AgentMonitor,
  createIntelligenceSystem as createAgentMonitor
} from './src/index';
export { CompleteIntelligenceSystem as default } from './src/index';

// Simple factory functions
export { 
  createBasicIntelligenceSystem as createBasic,
  createProductionIntelligenceSystem as createProduction
} from './src/index';

// Core types
export type { 
  IntelligenceSystem as AgentMonitoringSystem,
  IntelligenceSystemConfig as AgentMonitoringConfig,
  AgentHealth,
  TaskPrediction,
  SystemHealthSummary
} from './src/index';

// Advanced components (for power users)
export { 
  TaskPredictor,
  AgentLearningSystem,
  AgentHealthMonitor,
  PredictiveAnalyticsEngine
} from './src/index';

// Advanced types
export type {
  TaskPredictionConfig,
  AgentLearningConfig,
  HealthMonitorConfig,
  PredictiveAnalyticsConfig,
  MultiHorizonTaskPrediction,
  EmergentBehaviorPrediction
} from './src/index';

// Utility functions
export { 
  isHighConfidencePrediction,
  formatPredictionDuration,
  DEFAULT_HEALTH_MONITOR_CONFIG,
  DEFAULT_PREDICTIVE_ANALYTICS_CONFIG
} from './src/index';

// Metadata
export { INTELLIGENCE_SYSTEM_INFO as AGENT_MONITORING_INFO } from './src/index';