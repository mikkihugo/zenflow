/**
 * Memory Optimization for 32GB Machines
 *
 * Intelligent memory management and allocation strategies for
 * maximizing parallel stream execution on 32GB systems.
 */

export interface MemoryAllocationStrategy {
  portfolioStreamMB: number;
  programStreamMB: number;
  swarmStreamMB: number;
  systemReserveMB: number;
  cacheBufferMB: number;
  totalCapacityGB: number;
}

export interface ParallelStreamConfig {
  portfolio: number;
  program: number;
  swarm: number;
  totalStreams: number;
  memoryPerStream: {
    portfolio: number;
    program: number;
    swarm: number;
  };
}

/**
 * Base configuration for 8GB machines (conservative starting point)
 */
export const memory8GBConfig: MemoryAllocationStrategy = {
  portfolioStreamMB: 128, // Strategic operations (reduced for 8GB)
  programStreamMB: 32, // Balanced AI-human workloads (reduced)
  swarmStreamMB: 8, // Efficient AI-only processing (reduced)
  systemReserveMB: 4096, // 4GB for OS and base system
  cacheBufferMB: 1024, // 1GB for caching (reduced)
  totalCapacityGB: 8,
};

/**
 * Optimized configuration for 32GB machines (maximum performance)
 */
export const memory32GBConfig: MemoryAllocationStrategy = {
  portfolioStreamMB: 256, // Strategic operations need more memory
  programStreamMB: 64, // Balanced AI-human workloads
  swarmStreamMB: 16, // Efficient AI-only processing
  systemReserveMB: 8192, // 8GB for OS and base system
  cacheBufferMB: 4096, // 4GB for caching and temporary operations
  totalCapacityGB: 32,
};

/**
 * Default configuration (starts conservative, adapts automatically)
 */
export const defaultMemoryConfig = memory8GBConfig;

/**
 * Auto-detect available memory and calculate optimal configuration
 */
export function detectAvailableMemory(): number {
  // In Node.js, get total system memory
  const os = require('os');
  const totalMemoryGB = Math.round(os.totalmem() / (1024 * 1024 * 1024));
  return totalMemoryGB;
}

/**
 * Calculate optimal parallel stream configuration with adaptive scaling
 */
export function calculateOptimalStreams(
  availableMemoryGB?: number
): ParallelStreamConfig {
  // Auto-detect if not provided
  if (!availableMemoryGB) {
    availableMemoryGB = detectAvailableMemory();
  }

  // Select appropriate base configuration
  let baseConfig: MemoryAllocationStrategy;
  if (availableMemoryGB >= 24) {
    baseConfig = memory32GBConfig;
  } else if (availableMemoryGB >= 12) {
    // Scale between 8GB and 32GB configs
    const scaleFactor = (availableMemoryGB - 8) / (32 - 8);
    baseConfig = {
      portfolioStreamMB: Math.round(
        memory8GBConfig.portfolioStreamMB +
          (memory32GBConfig.portfolioStreamMB -
            memory8GBConfig.portfolioStreamMB) *
            scaleFactor
      ),
      programStreamMB: Math.round(
        memory8GBConfig.programStreamMB +
          (memory32GBConfig.programStreamMB - memory8GBConfig.programStreamMB) *
            scaleFactor
      ),
      swarmStreamMB: Math.round(
        memory8GBConfig.swarmStreamMB +
          (memory32GBConfig.swarmStreamMB - memory8GBConfig.swarmStreamMB) *
            scaleFactor
      ),
      systemReserveMB: Math.round(
        memory8GBConfig.systemReserveMB +
          (memory32GBConfig.systemReserveMB - memory8GBConfig.systemReserveMB) *
            scaleFactor
      ),
      cacheBufferMB: Math.round(
        memory8GBConfig.cacheBufferMB +
          (memory32GBConfig.cacheBufferMB - memory8GBConfig.cacheBufferMB) *
            scaleFactor
      ),
      totalCapacityGB: availableMemoryGB,
    };
  } else {
    baseConfig = memory8GBConfig;
  }

  const availableMemoryMB =
    availableMemoryGB * 1024 -
    baseConfig.systemReserveMB -
    baseConfig.cacheBufferMB;

  // Calculate streams with safety margins
  const portfolioStreams = Math.max(
    1,
    Math.min(
      24,
      Math.floor((availableMemoryMB * 0.25) / baseConfig.portfolioStreamMB)
    )
  );
  const programStreams = Math.max(
    2,
    Math.min(
      200,
      Math.floor((availableMemoryMB * 0.4) / baseConfig.programStreamMB)
    )
  );
  const swarmStreams = Math.max(
    4,
    Math.min(
      1000,
      Math.floor((availableMemoryMB * 0.35) / baseConfig.swarmStreamMB)
    )
  );

  return {
    portfolio: portfolioStreams,
    program: programStreams,
    swarm: swarmStreams,
    totalStreams: portfolioStreams + programStreams + swarmStreams,
    memoryPerStream: {
      portfolio: baseConfig.portfolioStreamMB,
      program: baseConfig.programStreamMB,
      swarm: baseConfig.swarmStreamMB,
    },
  };
}

/**
 * Performance monitoring for adaptive scaling
 */
export interface PerformanceMetrics {
  memoryUtilization: number;
  cpuUtilization: number;
  activeStreams: number;
  throughput: number;
  avgResponseTime: number;
  errorRate: number;
  timestamp: number;
}

/**
 * Adaptive Memory Optimizer with Real-Time Performance Scaling
 */
export class AdaptiveMemoryOptimizer {
  private config: MemoryAllocationStrategy;
  private activeStreams: Map<string, number> = new Map();
  private performanceHistory: PerformanceMetrics[] = [];
  private autoScaleEnabled: boolean = true;
  private lastOptimization: number = 0;
  private optimizationInterval: number = 30000; // 30 seconds

  constructor(config?: MemoryAllocationStrategy) {
    // Auto-detect and use optimal configuration
    if (config) {
      this.config = config;
    } else {
      const detectedMemoryGB = detectAvailableMemory();
      console.log(`🔍 Auto-detected ${detectedMemoryGB}GB system memory`);
      const optimalConfig = calculateOptimalStreams(detectedMemoryGB);

      // Convert to MemoryAllocationStrategy
      if (detectedMemoryGB >= 24) {
        this.config = memory32GBConfig;
      } else if (detectedMemoryGB >= 12) {
        const scaleFactor = (detectedMemoryGB - 8) / (32 - 8);
        this.config = {
          portfolioStreamMB: Math.round(
            memory8GBConfig.portfolioStreamMB +
              (memory32GBConfig.portfolioStreamMB -
                memory8GBConfig.portfolioStreamMB) *
                scaleFactor
          ),
          programStreamMB: Math.round(
            memory8GBConfig.programStreamMB +
              (memory32GBConfig.programStreamMB -
                memory8GBConfig.programStreamMB) *
                scaleFactor
          ),
          swarmStreamMB: Math.round(
            memory8GBConfig.swarmStreamMB +
              (memory32GBConfig.swarmStreamMB - memory8GBConfig.swarmStreamMB) *
                scaleFactor
          ),
          systemReserveMB: Math.round(
            memory8GBConfig.systemReserveMB +
              (memory32GBConfig.systemReserveMB -
                memory8GBConfig.systemReserveMB) *
                scaleFactor
          ),
          cacheBufferMB: Math.round(
            memory8GBConfig.cacheBufferMB +
              (memory32GBConfig.cacheBufferMB - memory8GBConfig.cacheBufferMB) *
                scaleFactor
          ),
          totalCapacityGB: detectedMemoryGB,
        };
      } else {
        this.config = memory8GBConfig;
      }

      console.log(
        `⚡ Adaptive configuration: Portfolio=${optimalConfig.portfolio}, Program=${optimalConfig.program}, Swarm=${optimalConfig.swarm}`
      );
    }
  }

  /**
   * Check if we can allocate a new stream of the given type
   */
  canAllocateStream(type: 'portfolio' | 'program' | 'swarm'): boolean {
    const currentStreams = this.activeStreams.get(type) || 0;
    const memoryPerStream = this.config[
      `${type}StreamMB` as keyof MemoryAllocationStrategy
    ] as number;
    const maxStreams = this.getMaxStreamsForType(type);

    return currentStreams < maxStreams;
  }

  /**
   * Allocate a new stream and track memory usage
   */
  allocateStream(
    type: 'portfolio' | 'program' | 'swarm',
    streamId: string
  ): boolean {
    if (!this.canAllocateStream(type)) {
      return false;
    }

    const currentStreams = this.activeStreams.get(type) || 0;
    this.activeStreams.set(type, currentStreams + 1);

    return true;
  }

  /**
   * Deallocate a stream and free memory
   */
  deallocateStream(
    type: 'portfolio' | 'program' | 'swarm',
    streamId: string
  ): void {
    const currentStreams = this.activeStreams.get(type) || 0;
    if (currentStreams > 0) {
      this.activeStreams.set(type, currentStreams - 1);
    }
  }

  /**
   * Get current memory usage statistics
   */
  getMemoryStats(): {
    allocated: { portfolio: number; program: number; swarm: number };
    available: { portfolio: number; program: number; swarm: number };
    utilization: number;
  } {
    const portfolioActive = this.activeStreams.get('portfolio') || 0;
    const programActive = this.activeStreams.get('program') || 0;
    const swarmActive = this.activeStreams.get('swarm') || 0;

    const portfolioMax = this.getMaxStreamsForType('portfolio');
    const programMax = this.getMaxStreamsForType('program');
    const swarmMax = this.getMaxStreamsForType('swarm');

    const totalAllocated =
      portfolioActive * this.config.portfolioStreamMB +
      programActive * this.config.programStreamMB +
      swarmActive * this.config.swarmStreamMB;

    const totalCapacity =
      portfolioMax * this.config.portfolioStreamMB +
      programMax * this.config.programStreamMB +
      swarmMax * this.config.swarmStreamMB;

    return {
      allocated: {
        portfolio: portfolioActive,
        program: programActive,
        swarm: swarmActive,
      },
      available: {
        portfolio: portfolioMax - portfolioActive,
        program: programMax - programActive,
        swarm: swarmMax - swarmActive,
      },
      utilization: totalAllocated / totalCapacity,
    };
  }

  private getMaxStreamsForType(
    type: 'portfolio' | 'program' | 'swarm'
  ): number {
    const streamConfig = calculateOptimalStreams(this.config.totalCapacityGB);
    return streamConfig[type];
  }

  /**
   * Record performance metrics for adaptive optimization
   */
  recordPerformance(metrics: Partial<PerformanceMetrics>): void {
    const fullMetrics: PerformanceMetrics = {
      memoryUtilization: 0,
      cpuUtilization: 0,
      activeStreams: 0,
      throughput: 0,
      avgResponseTime: 0,
      errorRate: 0,
      timestamp: Date.now(),
      ...metrics,
    };

    this.performanceHistory.push(fullMetrics);

    // Keep only last 100 data points
    if (this.performanceHistory.length > 100) {
      this.performanceHistory.shift();
    }

    // Trigger auto-optimization if interval passed
    if (
      this.autoScaleEnabled &&
      Date.now() - this.lastOptimization > this.optimizationInterval
    ) {
      this.performAutoOptimization();
    }
  }

  /**
   * ULTRA-CONSERVATIVE automatic optimization - NEVER EVER cause OOM
   */
  private performAutoOptimization(): void {
    if (this.performanceHistory.length < 15) return; // Wait for lots of data

    const recentMetrics = this.performanceHistory.slice(-20); // Analyze more history
    const avgMemoryUtil =
      recentMetrics.reduce((sum, m) => sum + m.memoryUtilization, 0) /
      recentMetrics.length;
    const avgCpuUtil =
      recentMetrics.reduce((sum, m) => sum + m.cpuUtilization, 0) /
      recentMetrics.length;
    const avgThroughput =
      recentMetrics.reduce((sum, m) => sum + m.throughput, 0) /
      recentMetrics.length;
    const avgErrorRate =
      recentMetrics.reduce((sum, m) => sum + m.errorRate, 0) /
      recentMetrics.length;

    // Check for memory spikes - CRITICAL for OOM prevention
    const maxRecentMemory = Math.max(
      ...recentMetrics.map((m) => m.memoryUtilization)
    );
    const memoryVolatility =
      Math.max(...recentMetrics.map((m) => m.memoryUtilization)) -
      Math.min(...recentMetrics.map((m) => m.memoryUtilization));

    let adjustmentFactor = 1.0;
    let action = 'maintain';

    // AGGRESSIVE scale down at first sign of memory pressure
    if (avgMemoryUtil > 0.6 || maxRecentMemory > 0.65 || avgErrorRate > 0.001) {
      adjustmentFactor = 0.6; // Very aggressive scale down
      action = 'emergency-scale-down';
    }
    // Preventive scale down for any memory concerns
    else if (
      avgMemoryUtil > 0.45 ||
      memoryVolatility > 0.15 ||
      maxRecentMemory > 0.55
    ) {
      adjustmentFactor = 0.8; // Conservative scale down
      action = 'preventive-scale-down';
    }
    // ONLY scale up if conditions are ABSOLUTELY PERFECT
    else if (
      avgMemoryUtil < 0.25 &&
      maxRecentMemory < 0.3 &&
      avgCpuUtil < 0.35 &&
      avgErrorRate === 0 &&
      avgThroughput > 25 &&
      memoryVolatility < 0.03 &&
      this.performanceHistory.length >= 30
    ) {
      // Require lots of perfect history
      adjustmentFactor = 1.01; // Tiny 1% increase only
      action = 'ultra-cautious-scale-up';
    }

    if (adjustmentFactor !== 1.0) {
      console.log(
        `🔄 ULTRA-SAFE optimization: ${action} (factor: ${adjustmentFactor})`
      );
      console.log(
        `   Memory: ${(avgMemoryUtil * 100).toFixed(1)}% (max: ${(maxRecentMemory * 100).toFixed(1)}%), CPU: ${(avgCpuUtil * 100).toFixed(1)}%, Errors: ${(avgErrorRate * 100).toFixed(4)}%`
      );
      console.log(
        `   Memory volatility: ${(memoryVolatility * 100).toFixed(1)}% (MUST be <3% for scale-up)`
      );

      // Apply ultra-safe adjustment
      this.adjustCapacity(adjustmentFactor, action);
    }

    this.lastOptimization = Date.now();
  }

  /**
   * Adjust system capacity based on performance
   */
  private adjustCapacity(factor: number, action: string): void {
    // This would integrate with the actual stream management system
    // For now, we'll just log the recommended adjustments
    const currentConfig = calculateOptimalStreams(this.config.totalCapacityGB);

    const newPortfolio = Math.max(
      1,
      Math.min(24, Math.round(currentConfig.portfolio * factor))
    );
    const newProgram = Math.max(
      2,
      Math.min(200, Math.round(currentConfig.program * factor))
    );
    const newSwarm = Math.max(
      4,
      Math.min(1000, Math.round(currentConfig.swarm * factor))
    );

    console.log(`📊 Capacity adjustment (${action}):`);
    console.log(`   Portfolio: ${currentConfig.portfolio} → ${newPortfolio}`);
    console.log(`   Program: ${currentConfig.program} → ${newProgram}`);
    console.log(`   Swarm: ${currentConfig.swarm} → ${newSwarm}`);

    // Update internal tracking
    // This would be implemented by the actual system integration
  }

  /**
   * Get current performance trends
   */
  getPerformanceTrends(): {
    memoryTrend: 'increasing' | 'decreasing' | 'stable';
    cpuTrend: 'increasing' | 'decreasing' | 'stable';
    throughputTrend: 'increasing' | 'decreasing' | 'stable';
    recommendation: string;
  } {
    if (this.performanceHistory.length < 6) {
      return {
        memoryTrend: 'stable',
        cpuTrend: 'stable',
        throughputTrend: 'stable',
        recommendation: 'Collecting performance data...',
      };
    }

    const recent = this.performanceHistory.slice(-3);
    const older = this.performanceHistory.slice(-6, -3);

    const avgRecentMemory =
      recent.reduce((sum, m) => sum + m.memoryUtilization, 0) / recent.length;
    const avgOlderMemory =
      older.reduce((sum, m) => sum + m.memoryUtilization, 0) / older.length;

    const avgRecentCpu =
      recent.reduce((sum, m) => sum + m.cpuUtilization, 0) / recent.length;
    const avgOlderCpu =
      older.reduce((sum, m) => sum + m.cpuUtilization, 0) / older.length;

    const avgRecentThroughput =
      recent.reduce((sum, m) => sum + m.throughput, 0) / recent.length;
    const avgOlderThroughput =
      older.reduce((sum, m) => sum + m.throughput, 0) / older.length;

    const memoryTrend =
      avgRecentMemory > avgOlderMemory * 1.1
        ? 'increasing'
        : avgRecentMemory < avgOlderMemory * 0.9
          ? 'decreasing'
          : 'stable';

    const cpuTrend =
      avgRecentCpu > avgOlderCpu * 1.1
        ? 'increasing'
        : avgRecentCpu < avgOlderCpu * 0.9
          ? 'decreasing'
          : 'stable';

    const throughputTrend =
      avgRecentThroughput > avgOlderThroughput * 1.1
        ? 'increasing'
        : avgRecentThroughput < avgOlderThroughput * 0.9
          ? 'decreasing'
          : 'stable';

    let recommendation = 'System performance is stable';
    if (memoryTrend === 'increasing' && cpuTrend === 'increasing') {
      recommendation = 'Consider scaling down - resource pressure detected';
    } else if (
      memoryTrend === 'decreasing' &&
      throughputTrend === 'increasing'
    ) {
      recommendation = 'System optimized well - consider scaling up capacity';
    } else if (throughputTrend === 'decreasing') {
      recommendation = 'Performance declining - investigate bottlenecks';
    }

    return { memoryTrend, cpuTrend, throughputTrend, recommendation };
  }

  /**
   * Optimize memory allocation with performance awareness
   */
  optimizeAllocation(): {
    recommendations: string[];
    canOptimize: boolean;
    potentialGains: number;
    currentPerformance: unknown;
  } {
    const stats = this.getMemoryStats();
    const trends = this.getPerformanceTrends();
    const recommendations: string[] = [];

    // Performance-aware recommendations
    if (trends.memoryTrend === 'increasing' && stats.utilization > 0.8) {
      recommendations.push(
        '🚨 MEMORY PRESSURE: Scale down non-critical streams immediately'
      );
    } else if (trends.memoryTrend === 'decreasing' && stats.utilization < 0.6) {
      recommendations.push(
        '⚡ SCALE UP: Memory available for more parallel streams'
      );
    }

    if (trends.throughputTrend === 'decreasing') {
      recommendations.push(
        '🔍 PERFORMANCE: Investigate bottlenecks causing throughput decline'
      );
    } else if (trends.throughputTrend === 'increasing') {
      recommendations.push(
        '🚀 OPTIMIZE: Good throughput trend, consider adding more capacity'
      );
    }

    // Traditional utilization recommendations
    if (stats.allocated.portfolio < stats.available.portfolio * 0.5) {
      recommendations.push('📈 PORTFOLIO: Can handle more strategic streams');
    }

    if (stats.allocated.program < stats.available.program * 0.7) {
      recommendations.push('🤝 PROGRAM: Underutilized collaborative capacity');
    }

    if (stats.allocated.swarm < stats.available.swarm * 0.8) {
      recommendations.push(
        '🐝 SWARM: Significant autonomous processing capacity available'
      );
    }

    const potentialGains = (1 - stats.utilization) * 100;

    return {
      recommendations,
      canOptimize: recommendations.length > 0,
      potentialGains,
      currentPerformance: trends,
    };
  }

  /**
   * Enable/disable auto-scaling
   */
  setAutoScale(enabled: boolean): void {
    this.autoScaleEnabled = enabled;
    console.log(`🔄 Auto-scaling ${enabled ? 'ENABLED' : 'DISABLED'}`);
  }

  /**
   * Get real-time system performance summary
   */
  getPerformanceSummary(): string {
    if (this.performanceHistory.length === 0) {
      return '⏳ Collecting performance data...';
    }

    const latest = this.performanceHistory[this.performanceHistory.length - 1]!;
    const trends = this.getPerformanceTrends();
    const memStats = this.getMemoryStats();

    return `
🎯 Adaptive Performance Summary:
   Memory: ${(latest.memoryUtilization * 100).toFixed(1)}% (${trends.memoryTrend})
   CPU: ${(latest.cpuUtilization * 100).toFixed(1)}% (${trends.cpuTrend})
   Throughput: ${latest.throughput.toFixed(1)}/sec (${trends.throughputTrend})
   Active Streams: ${memStats.allocated.portfolio + memStats.allocated.program + memStats.allocated.swarm}
   Auto-scaling: ${this.autoScaleEnabled ? '✅ ENABLED' : '❌ DISABLED'}
   ${trends.recommendation}`;
  }
}

/**
 * Create adaptive memory optimizer instance (auto-detects system capacity)
 */
export function createAdaptiveOptimizer(): AdaptiveMemoryOptimizer {
  return new AdaptiveMemoryOptimizer(); // Auto-detects and optimizes
}

/**
 * Create memory optimizer instance for specific configuration
 */
export function createMemoryOptimizer(
  config?: MemoryAllocationStrategy
): AdaptiveMemoryOptimizer {
  return new AdaptiveMemoryOptimizer(config);
}

/**
 * Validate memory configuration for system requirements
 */
export function validateMemoryConfig(config: ParallelStreamConfig): {
  valid: boolean;
  warnings: string[];
  totalMemoryMB: number;
} {
  const warnings: string[] = [];

  const portfolioMemory = config.portfolio * config.memoryPerStream.portfolio;
  const programMemory = config.program * config.memoryPerStream.program;
  const swarmMemory = config.swarm * config.memoryPerStream.swarm;
  const totalMemoryMB = portfolioMemory + programMemory + swarmMemory;

  // Add system and cache memory
  const totalSystemMemoryMB =
    totalMemoryMB +
    memory32GBConfig.systemReserveMB +
    memory32GBConfig.cacheBufferMB;

  if (totalSystemMemoryMB > 32 * 1024) {
    warnings.push(
      `Configuration requires ${Math.round(totalSystemMemoryMB / 1024)}GB but only 32GB available`
    );
  }

  if (config.portfolio > 24) {
    warnings.push('Portfolio streams > 24 may cause resource contention');
  }

  if (config.program > 200) {
    warnings.push('Program streams > 200 may impact coordination efficiency');
  }

  if (config.swarm > 1000) {
    warnings.push(
      'Swarm streams > 1000 may exceed optimal coordination limits'
    );
  }

  return {
    valid: warnings.length === 0,
    warnings,
    totalMemoryMB,
  };
}

export default {
  memory8GBConfig,
  memory32GBConfig,
  defaultMemoryConfig,
  calculateOptimalStreams,
  detectAvailableMemory,
  AdaptiveMemoryOptimizer,
  createAdaptiveOptimizer,
  createMemoryOptimizer,
  validateMemoryConfig,
};
