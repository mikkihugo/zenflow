/**
 * @file System Event Adapter - Type Definitions
 *
 * Type definitions and interfaces for system event adapter.
 */

import type { EventManagerConfig } from '../../core/interfaces';

export interface SystemEventAdapterConfig extends EventManagerConfig {
  system?: {
    enabled: boolean;
    wrapSystemEvents?: boolean;
    wrapProcessEvents?: boolean;
    wrapResourceEvents?: boolean;
  };
  processMonitoring?: {
    enabled: boolean;
    trackMemory?: boolean;
    trackCPU?: boolean;
    trackHandles?: boolean;
  };
  resourceTracking?: {
    enabled: boolean;
    trackDisk?: boolean;
    trackNetwork?: boolean;
    trackDatabase?: boolean;
  };
  systemHealth?: {
    enabled: boolean;
    checkInterval?: number;
    enableAutoRecovery?: boolean;
    thresholds?: {
      memory?: number;
      cpu?: number;
      disk?: number;
    };
  };
}

export interface SystemResourceMonitor {
  healthCheck?(): Promise<{
    memoryUsage?: number;
    cpuUsage?: number;
    diskUsage?: number;
    healthScore?: number;
  }>;
  getMetrics?(): Promise<{
    memory: { used: number; total: number; percentage: number };
    cpu: { usage: number; load: number[] };
    disk: { used: number; total: number; percentage: number };
    network: { bytesIn: number; bytesOut: number };
  }>;
  [key: string]: unknown;
}

export interface ProcessManager {
  healthCheck?(): Promise<{
    processCount?: number;
    activeProcesses?: number;
    healthScore?: number;
  }>;
  getProcesses?(): Promise<{
    active: number;
    idle: number;
    total: number;
    processes: Array<{ pid: number; name: string; status: string }>;
  }>;
  [key: string]: unknown;
}

export interface SystemHealthMonitor {
  healthCheck?(): Promise<{
    systemLoad?: number;
    uptime?: number;
    healthScore?: number;
  }>;
  getSystemHealth?(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    uptime: number;
    load: number;
    issues: string[];
  }>;
  [key: string]: unknown;
}

export interface SystemFactoryMetrics {
  totalCreated: number;
  totalErrors: number;
  activeInstances: number;
  runningInstances: number;
  uptime: number;
  creationRate: number;
  errorRate: number;
  systemMetrics: {
    totalSystemMonitors: number;
    activeSystemMonitors: number;
    failedSystemMonitors: number;
    averageSystemLoad: number;
  };
  timestamp: Date;
}

export interface SystemHealthResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  activeInstances: number;
  runningInstances: number;
  errorRate: number;
  systemSuccessRate: number;
  uptime: number;
  timestamp: Date;
  details: {
    factoryHealth: string;
    systemHealth: string;
    instanceHealth: Array<{
      name: string;
      status: string;
      activeSystemMonitors: number;
      lastCheck: Date;
    }>;
  };
}

export interface FactoryOperationResult {
  success: boolean;
  instanceName?: string;
  error?: string;
  duration: number;
  timestamp: Date;
}

export interface BulkOperationResult {
  totalProcessed: number;
  successful: number;
  failed: number;
  results: FactoryOperationResult[];
  duration: number;
  timestamp: Date;
}
