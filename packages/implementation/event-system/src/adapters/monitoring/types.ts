/**
 * @file Monitoring Event Adapter - Type Definitions
 *
 * Type definitions and interfaces for monitoring event adapter.
 */

import type { EventManagerConfig } from '../../core/interfaces';

export interface MonitoringEventAdapterConfig extends EventManagerConfig {
  monitoring?: {
    enabled: boolean;
    wrapPerformanceEvents?: boolean;
    wrapMetricsEvents?: boolean;
    wrapHealthEvents?: boolean;
  };
  performanceTracking?: {
    enabled: boolean;
    trackLatency?: boolean;
    trackThroughput?: boolean;
    trackErrorRates?: boolean;
  };
  metricsCollection?: {
    enabled: boolean;
    collectSystemMetrics?: boolean;
    collectApplicationMetrics?: boolean;
    interval?: number;
  };
  healthMonitoring?: {
    enabled: boolean;
    checkInterval?: number;
    enableAutoRecovery?: boolean;
  };
}

export interface PerformanceAnalyzer {
  healthCheck?(): Promise<{
    responseTime?: number;
    errorRate?: number;
    healthScore?: number;
  }>;
  getMetrics?(): Promise<{
    averageLatency?: number;
    requestCount: number;
    errorCount: number;
    performance?: { healthScore?: number };
  }>;
  [key: string]: unknown;
}

export interface MetricsCollector {
  healthCheck?(): Promise<{
    responseTime?: number;
    errorRate?: number;
    healthScore?: number;
  }>;
  getMetrics?(): Promise<{
    averageLatency?: number;
    requestCount: number;
    errorCount: number;
    performance?: { healthScore?: number };
  }>;
  [key: string]: unknown;
}

export interface RealTimePerformanceMonitor {
  healthCheck?(): Promise<{
    responseTime?: number;
    errorRate?: number;
    healthScore?: number;
  }>;
  getMetrics?(): Promise<{
    averageLatency?: number;
    requestCount: number;
    errorCount: number;
    performance?: { healthScore?: number };
  }>;
  [key: string]: unknown;
}

export interface MonitoringFactoryMetrics {
  totalCreated: number;
  totalErrors: number;
  activeInstances: number;
  runningInstances: number;
  uptime: number;
  creationRate: number;
  errorRate: number;
  monitoringMetrics: {
    totalMonitors: number;
    activeMonitors: number;
    failedMonitors: number;
    averageResponseTime: number;
  };
  timestamp: Date;
}

export interface MonitoringHealthResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  activeInstances: number;
  runningInstances: number;
  errorRate: number;
  monitoringSuccessRate: number;
  uptime: number;
  timestamp: Date;
  details: {
    factoryHealth: string;
    monitoringHealth: string;
    instanceHealth: Array<{
      name: string;
      status: string;
      activeMonitors: number;
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
