import { MonitoringMetrics, MonitoringConfig } from '../types/index.js';

export class BrainMonitoring {
  constructor(private config: MonitoringConfig = { enabled: true, interval: 30000 }) {}

  async getMetrics(): Promise<MonitoringMetrics> {
    return {
      timestamp: Date.now(),
      metrics: {
        performance: 0.85,
        memory: 0.65,
        cpu: 0.45,
        enabled: this.config.enabled ? 1 : 0
      },
      status: 'healthy'
    };
  }
}

export type { MonitoringMetrics, MonitoringConfig };