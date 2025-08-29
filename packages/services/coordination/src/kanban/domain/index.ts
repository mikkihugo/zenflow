/**
 * @fileoverview Kanban Domain Service Index
 *
 * Entry point for all kanban domain services.
 * Exports all domain services and types.
 */

// Export all domain services
export { BottleneckDetectionService } from './bottleneck-detection.js';
export { FlowAnalysisService } from './flow-analysis.js';
export { HealthMonitoringService } from './health-monitoring.js';
export { TaskManagementService } from './task-management.js';
export { WIPManagementService } from './wip-management.js';

// Export interfaces and types
export type { BottleneckDetectionConfig } from './bottleneck-detection.js';
export type { FlowTrend, FlowMetrics } from './flow-analysis.js';
export type { 
  HealthMonitoringConfig, 
  PerformanceMetrics, 
  HealthStatus 
} from './health-monitoring.js';
export type { TaskManagementConfig, Task } from './task-management.js';
export type { 
  WIPManagementConfig, 
  WIPLimits, 
  WIPViolation, 
  WIPStatus 
} from './wip-management.js';