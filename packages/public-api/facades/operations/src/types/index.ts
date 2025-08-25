/**
 * @fileoverview Operations Package Types Index
 *
 * Consolidated type exports for all operations systems, following the same
 * pattern as foundation types with comprehensive interface delegation types.
 *
 * @author Claude Code Zen Team
 * @since 2.1.0 (Strategic Architecture v2.0.0)
 * @version 1.0.0
 */

// Agent Monitoring System Types
export type {
  AgentMonitoringSystemAccess,
  AgentMonitoringSystemConfig,
  AgentMonitoringSystemError,
  AgentMonitoringSystemConnectionError,
} from '../agent-monitoring';

// Chaos Engineering System Types
export type {
  ChaosEngineeringSystemAccess,
  ChaosEngineeringSystemConfig,
  ChaosEngineeringSystemError,
  ChaosEngineeringSystemConnectionError,
} from '../chaos-engineering';

// Monitoring System Types
export type {
  MonitoringSystemAccess,
  MonitoringSystemConfig,
  MonitoringSystemError,
  MonitoringSystemConnectionError,
} from '../monitoring';

/**
 * Combined operations system configuration
 */
export interface OperationsSystemConfig {
  agentMonitoring?: {
    enableIntelligenceTracking?: boolean;
    enablePerformanceMonitoring?: boolean;
    enableHealthMonitoring?: boolean;
    enableTaskPrediction?: boolean;
    monitoringInterval?: number;
    healthThreshold?: number;
    performanceMetrics?: string[];
  };

  chaosEngineering?: {
    enableChaosExperiments?: boolean;
    enableResilienceTesting?: boolean;
    enableFailureSimulation?: boolean;
    experimentDuration?: number;
    failureRate?: number;
    recoveryTime?: number;
    safetyChecks?: boolean;
  };

  monitoring?: {
    enableObservability?: boolean;
    enableTelemetryCollection?: boolean;
    enableMetricsAggregation?: boolean;
    enableHealthChecking?: boolean;
    monitoringInterval?: number;
    metricsRetention?: number;
    telemetryBuffer?: number;
    healthCheckInterval?: number;
  };
}

/**
 * Operations system status interface
 */
export interface OperationsSystemStatus {
  agentMonitoring: {
    initialized: boolean;
    activeMonitors: number;
    intelligenceSystemsRunning: number;
    performanceMetricsCollected: number;
    healthStatus: 'healthy | warning|critical';
  };

  chaosEngineering: {
    initialized: boolean;
    experimentsRunning: number;
    resilienceTestsActive: number;
    failuresSimulated: number;
    safetyChecksEnabled: boolean;
  };

  monitoring: {
    initialized: boolean;
    observabilityActive: boolean;
    telemetryCollecting: boolean;
    metricsAggregated: number;
    healthChecksRunning: number;
  };
}

/**
 * Operations system metrics interface
 */
export interface OperationsSystemMetrics {
  performance: {
    responseTime: number;
    throughput: number;
    errorRate: number;
    resourceUsage: {
      cpu: number;
      memory: number;
      disk: number;
    };
  };

  availability: {
    uptime: number;
    healthScore: number;
    failureCount: number;
    recoveryTime: number;
  };

  monitoring: {
    metricsCollected: number;
    telemetryPoints: number;
    observabilityData: number;
    alertsTriggered: number;
  };

  chaos: {
    experimentsRun: number;
    resilienceScore: number;
    failuresSurvived: number;
    recoveryRate: number;
  };
}
