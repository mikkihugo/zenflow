/**
 * @fileoverview System Monitoring Implementation
 *
 * System monitoring using @claude-zen/telemetry for metrics collection.
 */
import type { InfrastructureConfig } from './types.js';
/**
 * System resource monitoring using telemetry
 */
export declare class SystemMonitor {
  private config;
  private logger;
  private monitoringInterval;
  private initialized;
  constructor(config?: InfrastructureConfig);
  initialize(): Promise<void>;
  /**
   * Get process-specific metrics using pidusage
   */
  getProcessMetrics(pid?: number): Promise<any>;
  catch(error: any): void;
}
//# sourceMappingURL=monitoring.d.ts.map
