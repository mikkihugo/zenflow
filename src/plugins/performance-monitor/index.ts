/**
 * Performance Monitor Plugin
 * Monitors system and plugin performance metrics
 */

import { BasePlugin } from '../base-plugin.js';
import type { PluginManifest, PluginConfig, PluginContext } from '../types.js';

export class PerformanceMonitorPlugin extends BasePlugin {
  private performanceMetrics: any[] = [];
  private startTime = Date.now();

  constructor(manifest: PluginManifest, config: PluginConfig, context: PluginContext) {
    super(manifest, config, context);
  }

  async onInitialize(): Promise<void> {
    this.context.logger.info('Performance Monitor Plugin initialized');
  }

  async onStart(): Promise<void> {
    this.context.logger.info('Performance Monitor Plugin started');
  }

  async onStop(): Promise<void> {
    this.context.logger.info('Performance Monitor Plugin stopped');
  }

  async onDestroy(): Promise<void> {
    this.performanceMetrics = [];
    this.context.logger.info('Performance Monitor Plugin cleaned up');
  }

  recordMetric(name: string, value: number, unit: string = 'ms'): void {
    this.performanceMetrics.push({
      name,
      value,
      unit,
      timestamp: Date.now()
    });
  }

  getMetrics(): any[] {
    return [...this.performanceMetrics];
  }

  getUptime(): number {
    return Date.now() - this.startTime;
  }

  getAverageMetric(name: string): number {
    const namedMetrics = this.performanceMetrics.filter(m => m.name === name);
    if (namedMetrics.length === 0) return 0;
    return namedMetrics.reduce((sum, m) => sum + m.value, 0) / namedMetrics.length;
  }
}

export default PerformanceMonitorPlugin;