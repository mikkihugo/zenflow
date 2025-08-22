/**
 * @fileoverview Temporary stub for @claude-zen/intelligence/monitoring/memory-monitor
 */

export interface MemoryMonitorConfig { enabled?: boolean; interval?: number;
}

export interface MemoryMetrics { usage: number; available: number; total: number;
}

export class MemoryMonitor { constructor(config?: MemoryMonitorConfig) { // Stub implementation } async initialize(): Promise<void> { // Stub implementation } async getMetrics(): Promise<MemoryMetrics> { // Stub implementation return { usage: 512, available: 1024, total: 1536, }; }
}

export { MemoryMonitor as default };
