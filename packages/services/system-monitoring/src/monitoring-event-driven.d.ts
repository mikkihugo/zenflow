/**
 * @fileoverview System Monitoring Implementation - 100% Event-Driven
 *
 * ZERO IMPORTS - Pure event-based system monitoring
 * Listens to brain events and responds with system metrics events
 */
interface SystemMonitoringEvents {
  'brain:system-monitoring:get-metrics': {
    requestId: string;
    timestamp: number;
  };
  'brain:system-monitoring:get-health': {
    requestId: string;
    timestamp: number;
  };
  'brain:system-monitoring:start-tracking': {
    requestId: string;
    config?: SystemMonitoringConfig;
    timestamp: number;
  };
  'brain:system-monitoring:stop-tracking': {
    requestId: string;
    timestamp: number;
  };
  'system-monitoring:metrics': {
    requestId: string;
    metrics: SystemMetrics;
    timestamp: number;
  };
  'system-monitoring:health': {
    requestId: string;
    health: HealthStatus;
    timestamp: number;
  };
  'system-monitoring:tracking-started': {
    requestId: string;
    success: boolean;
    timestamp: number;
  };
  'system-monitoring:tracking-stopped': {
    requestId: string;
    success: boolean;
    timestamp: number;
  };
  'system-monitoring:error': {
    requestId: string;
    error: string;
    timestamp: number;
  };
  'telemetry:record-metric': {
    name: string;
    value: number;
    attributes?: Record<string, any>;
    timestamp: number;
  };
  'telemetry:record-histogram': {
    name: string;
    value: number;
    attributes?: Record<string, any>;
    timestamp: number;
  };
  'telemetry:record-gauge': {
    name: string;
    value: number;
    attributes?: Record<string, any>;
    timestamp: number;
  };
}
interface SystemMetrics {
  cpu: {
    usage: number;
    load: number[];
    cores: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
  };
  uptime: number;
  timestamp: number;
}
interface HealthStatus {
  status: 'healthy' | ' degraded' | ' unhealthy';
  checks: Record<
    string,
    {
      status: 'ok' | ' warning' | ' error';
      value: number;
      threshold: number;
      message: string;
    }
  >;
  timestamp: number;
  details?: Record<string, any>;
}
interface SystemMonitoringConfig {
  enableSystemMetrics?: boolean;
  systemMetricsInterval?: number;
  enablePerformanceTracking?: boolean;
  enableHealthChecks?: boolean;
  healthCheckInterval?: number;
  cpuWarningThreshold?: number;
  cpuErrorThreshold?: number;
  memoryWarningThreshold?: number;
  memoryErrorThreshold?: number;
  diskWarningThreshold?: number;
  diskErrorThreshold?: number;
  serviceName?: string;
}
export declare class EventDrivenSystemMonitor {
  private eventListeners;
  private logger;
  private config;
  private monitoringInterval;
  private initialized;
  constructor();
  addEventListener<K extends keyof SystemMonitoringEvents>(
    event: K,
    listener: (data: SystemMonitoringEvents[K]) => void
  ): void;
  private emitEvent;
  private setupBrainEventHandlers;
  private initializeInternal;
  private shutdownInternal;
  private getMetricsInternal;
  private getHealthStatusInternal;
  private startSystemMetricsCollection;
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
}
export declare function createEventDrivenSystemMonitor(): EventDrivenSystemMonitor;
export default EventDrivenSystemMonitor;
//# sourceMappingURL=monitoring-event-driven.d.ts.map
