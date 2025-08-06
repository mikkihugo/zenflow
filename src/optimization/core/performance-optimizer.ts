/**
 * Core Performance Optimizer
 * Orchestrates optimization across all system domains
 */

import { EventEmitter } from 'node:events';
import type {
  DataOptimizer,
  NeuralOptimizer,
  OptimizationResult,
  PerformanceMetrics,
  SwarmOptimizer,
  WasmOptimizer,
} from '../interfaces/optimization-interfaces';

export interface PerformanceOptimizerConfig {
  enabled: boolean;
  optimizationInterval: number; // milliseconds
  aggressiveness: 'conservative' | 'moderate' | 'aggressive';
  targetMetrics: {
    latency: number;
    throughput: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  domains: {
    neural: boolean;
    swarm: boolean;
    data: boolean;
    wasm: boolean;
  };
}

export interface OptimizationPlan {
  id: string;
  domain: 'neural' | 'swarm' | 'data' | 'wasm' | 'system';
  actions: OptimizationAction[];
  estimatedImpact: number;
  executionOrder: number;
  dependencies: string[];
}

export interface OptimizationAction {
  id: string;
  type: string;
  target: string;
  parameters: Record<string, any>;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration: number;
}

export interface SystemPerformanceState {
  overall: PerformanceMetrics;
  neural: PerformanceMetrics;
  swarm: PerformanceMetrics;
  data: PerformanceMetrics;
  wasm: PerformanceMetrics;
  lastOptimization: Date;
  optimizationCount: number;
}

export class PerformanceOptimizer extends EventEmitter {
  private config: PerformanceOptimizerConfig;
  private optimizers: Map<string, any> = new Map();
  private performanceHistory: PerformanceMetrics[] = [];
  private activeOptimizations: Set<string> = new Set();
  private isOptimizing = false;

  constructor(
    config: Partial<PerformanceOptimizerConfig> = {},
    optimizers: {
      neural?: NeuralOptimizer;
      swarm?: SwarmOptimizer;
      data?: DataOptimizer;
      wasm?: WasmOptimizer;
    } = {}
  ) {
    super();

    this.config = {
      enabled: true,
      optimizationInterval: 30000, // 30 seconds
      aggressiveness: 'moderate',
      targetMetrics: {
        latency: 50, // <50ms
        throughput: 10000, // 10K req/sec
        memoryUsage: 0.8, // <80%
        cpuUsage: 0.7, // <70%
      },
      domains: {
        neural: true,
        swarm: true,
        data: true,
        wasm: true,
      },
      ...config,
    };

    // Register domain optimizers
    if (optimizers.neural) this.optimizers.set('neural', optimizers.neural);
    if (optimizers.swarm) this.optimizers.set('swarm', optimizers.swarm);
    if (optimizers.data) this.optimizers.set('data', optimizers.data);
    if (optimizers.wasm) this.optimizers.set('wasm', optimizers.wasm);
  }

  /**
   * Start continuous performance optimization
   */
  public async startOptimization(): Promise<void> {
    if (!this.config.enabled || this.isOptimizing) {
      return;
    }

    this.isOptimizing = true;
    this.emit('optimization:started');

    // Initial performance assessment
    await this.assessCurrentPerformance();

    // Start optimization loop
    this.scheduleOptimization();
  }

  /**
   * Stop continuous optimization
   */
  public stopOptimization(): void {
    this.isOptimizing = false;
    this.emit('optimization:stopped');
  }

  /**
   * Perform immediate comprehensive optimization
   */
  public async optimizeNow(): Promise<OptimizationResult[]> {
    const results: OptimizationResult[] = [];

    try {
      // Get current performance baseline
      const beforeMetrics = await this.getCurrentPerformanceMetrics();

      // Generate optimization plan
      const plan = await this.generateOptimizationPlan(beforeMetrics);

      // Execute optimizations
      for (const optimizationPlan of plan) {
        const result = await this.executeOptimizationPlan(optimizationPlan);
        results.push(result);
      }

      // Measure final performance
      const afterMetrics = await this.getCurrentPerformanceMetrics();

      // Calculate overall improvement
      const overallImprovement = this.calculateImprovement(beforeMetrics, afterMetrics);

      this.emit('optimization:completed', {
        results,
        improvement: overallImprovement,
        beforeMetrics,
        afterMetrics,
      });

      return results;
    } catch (error) {
      this.emit('optimization:error', error);
      throw error;
    }
  }

  /**
   * Get current system performance state
   */
  public async getPerformanceState(): Promise<SystemPerformanceState> {
    const overall = await this.getCurrentPerformanceMetrics();

    return {
      overall,
      neural: await this.getDomainMetrics('neural'),
      swarm: await this.getDomainMetrics('swarm'),
      data: await this.getDomainMetrics('data'),
      wasm: await this.getDomainMetrics('wasm'),
      lastOptimization: new Date(),
      optimizationCount: this.performanceHistory.length,
    };
  }

  /**
   * Register a domain optimizer
   *
   * @param domain
   * @param optimizer
   */
  public registerOptimizer(domain: string, optimizer: any): void {
    this.optimizers.set(domain, optimizer);
    this.emit('optimizer:registered', { domain });
  }

  /**
   * Generate optimization plan based on current performance
   *
   * @param currentMetrics
   */
  private async generateOptimizationPlan(
    currentMetrics: PerformanceMetrics
  ): Promise<OptimizationPlan[]> {
    const plans: OptimizationPlan[] = [];

    // Analyze performance bottlenecks
    const bottlenecks = this.identifyBottlenecks(currentMetrics);

    // Generate domain-specific optimization plans
    for (const bottleneck of bottlenecks) {
      const plan = await this.createOptimizationPlan(bottleneck);
      if (plan) {
        plans.push(plan);
      }
    }

    // Sort by priority and dependencies
    return this.sortOptimizationPlans(plans);
  }

  /**
   * Execute a specific optimization plan
   *
   * @param plan
   */
  private async executeOptimizationPlan(plan: OptimizationPlan): Promise<OptimizationResult> {
    const startTime = Date.now();
    const beforeMetrics = await this.getCurrentPerformanceMetrics();

    try {
      this.activeOptimizations.add(plan.id);
      this.emit('optimization:plan:started', plan);

      const optimizer = this.optimizers.get(plan.domain);
      if (!optimizer) {
        throw new Error(`No optimizer available for domain: ${plan.domain}`);
      }

      // Execute each action in the plan
      for (const action of plan.actions) {
        await this.executeOptimizationAction(optimizer, action);
      }

      const afterMetrics = await this.getCurrentPerformanceMetrics();
      const improvement = this.calculateImprovement(beforeMetrics, afterMetrics);

      const result: OptimizationResult = {
        success: true,
        improvement,
        beforeMetrics,
        afterMetrics,
        executionTime: Date.now() - startTime,
      };

      this.emit('optimization:plan:completed', { plan, result });
      return result;
    } catch (error) {
      const result: OptimizationResult = {
        success: false,
        improvement: 0,
        beforeMetrics,
        afterMetrics: beforeMetrics,
        executionTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error),
      };

      this.emit('optimization:plan:failed', { plan, error });
      return result;
    } finally {
      this.activeOptimizations.delete(plan.id);
    }
  }

  /**
   * Execute a specific optimization action
   *
   * @param optimizer
   * @param action
   */
  private async executeOptimizationAction(
    optimizer: any,
    action: OptimizationAction
  ): Promise<void> {
    this.emit('optimization:action:started', action);

    try {
      // Execute domain-specific optimization
      switch (action.type) {
        case 'training_speed':
          await optimizer.optimizeTrainingSpeed?.(action.target);
          break;
        case 'batch_processing':
          await optimizer.implementBatchProcessing?.(action.target);
          break;
        case 'gpu_acceleration':
          await optimizer.enableGPUAcceleration?.(action.parameters.computeUnits);
          break;
        case 'memory_optimization':
          await optimizer.optimizeMemoryUsage?.(action.parameters.networks);
          break;
        case 'message_routing':
          await optimizer.optimizeMessageRouting?.(action.parameters.topology);
          break;
        case 'caching':
          await optimizer.implementCaching?.(action.parameters.coordinationLayer);
          break;
        case 'latency_reduction':
          await optimizer.reduceLatency?.(action.parameters.protocols);
          break;
        case 'horizontal_scaling':
          await optimizer.scaleHorizontally?.(action.parameters.swarmSize);
          break;
        case 'query_optimization':
          await optimizer.optimizeQueryPerformance?.(action.parameters.queries);
          break;
        case 'connection_pooling':
          await optimizer.implementConnectionPooling?.(action.parameters.connections);
          break;
        case 'intelligent_caching':
          await optimizer.addIntelligentCaching?.(action.parameters.cacheLayer);
          break;
        case 'data_compression':
          await optimizer.compressDataStorage?.(action.parameters.storage);
          break;
        case 'wasm_loading':
          await optimizer.optimizeWasmModuleLoading?.(action.parameters.modules);
          break;
        case 'streaming_compilation':
          await optimizer.implementStreamingCompilation?.(action.parameters.wasmFiles);
          break;
        case 'memory_sharing':
          await optimizer.optimizeMemorySharing?.(action.parameters.jsWasmBridge);
          break;
        case 'simd_acceleration':
          await optimizer.enableSIMDAcceleration?.(action.parameters.computeKernels);
          break;
        default:
          throw new Error(`Unknown optimization action type: ${action.type}`);
      }

      this.emit('optimization:action:completed', action);
    } catch (error) {
      this.emit('optimization:action:failed', { action, error });
      throw error;
    }
  }

  /**
   * Schedule next optimization cycle
   */
  private scheduleOptimization(): void {
    if (!this.isOptimizing) return;

    setTimeout(async () => {
      try {
        await this.optimizationCycle();
      } catch (error) {
        this.emit('optimization:cycle:error', error);
      }

      // Schedule next cycle
      this.scheduleOptimization();
    }, this.config.optimizationInterval);
  }

  /**
   * Perform optimization cycle
   */
  private async optimizationCycle(): Promise<void> {
    const currentMetrics = await this.getCurrentPerformanceMetrics();
    this.performanceHistory.push(currentMetrics);

    // Cleanup old history
    if (this.performanceHistory.length > 100) {
      this.performanceHistory = this.performanceHistory.slice(-100);
    }

    // Check if optimization is needed
    if (this.needsOptimization(currentMetrics)) {
      await this.optimizeNow();
    }

    this.emit('optimization:cycle:completed', currentMetrics);
  }

  /**
   * Check if optimization is needed
   *
   * @param metrics
   */
  private needsOptimization(metrics: PerformanceMetrics): boolean {
    const targets = this.config.targetMetrics;

    return (
      metrics.latency > targets.latency ||
      metrics.throughput < targets.throughput ||
      metrics.memoryUsage > targets.memoryUsage ||
      metrics.cpuUsage > targets.cpuUsage
    );
  }

  /**
   * Identify performance bottlenecks
   *
   * @param metrics
   */
  private identifyBottlenecks(metrics: PerformanceMetrics): string[] {
    const bottlenecks: string[] = [];
    const targets = this.config.targetMetrics;

    if (metrics.latency > targets.latency) {
      bottlenecks.push('latency');
    }
    if (metrics.throughput < targets.throughput) {
      bottlenecks.push('throughput');
    }
    if (metrics.memoryUsage > targets.memoryUsage) {
      bottlenecks.push('memory');
    }
    if (metrics.cpuUsage > targets.cpuUsage) {
      bottlenecks.push('cpu');
    }

    return bottlenecks;
  }

  /**
   * Create optimization plan for bottleneck
   *
   * @param bottleneck
   */
  private async createOptimizationPlan(bottleneck: string): Promise<OptimizationPlan | null> {
    const planId = `opt-${Date.now()}-${bottleneck}`;
    const actions: OptimizationAction[] = [];

    switch (bottleneck) {
      case 'latency':
        actions.push({
          id: `${planId}-latency-1`,
          type: 'message_routing',
          target: 'swarm',
          parameters: {},
          priority: 'high',
          estimatedDuration: 5000,
        });
        break;
      case 'throughput':
        actions.push({
          id: `${planId}-throughput-1`,
          type: 'batch_processing',
          target: 'neural',
          parameters: {},
          priority: 'high',
          estimatedDuration: 10000,
        });
        break;
      case 'memory':
        actions.push({
          id: `${planId}-memory-1`,
          type: 'memory_optimization',
          target: 'system',
          parameters: {},
          priority: 'medium',
          estimatedDuration: 8000,
        });
        break;
      case 'cpu':
        actions.push({
          id: `${planId}-cpu-1`,
          type: 'wasm_loading',
          target: 'wasm',
          parameters: {},
          priority: 'medium',
          estimatedDuration: 6000,
        });
        break;
      default:
        return null;
    }

    return {
      id: planId,
      domain: 'system',
      actions,
      estimatedImpact: 0.2, // 20% improvement estimate
      executionOrder: 1,
      dependencies: [],
    };
  }

  /**
   * Sort optimization plans by priority and dependencies
   *
   * @param plans
   */
  private sortOptimizationPlans(plans: OptimizationPlan[]): OptimizationPlan[] {
    return plans.sort((a, b) => {
      // Sort by execution order first, then by estimated impact
      if (a.executionOrder !== b.executionOrder) {
        return a.executionOrder - b.executionOrder;
      }
      return b.estimatedImpact - a.estimatedImpact;
    });
  }

  /**
   * Calculate performance improvement
   *
   * @param before
   * @param after
   */
  private calculateImprovement(before: PerformanceMetrics, after: PerformanceMetrics): number {
    const latencyImprovement = Math.max(0, (before.latency - after.latency) / before.latency);
    const throughputImprovement = Math.max(
      0,
      (after.throughput - before.throughput) / before.throughput
    );
    const memoryImprovement = Math.max(
      0,
      (before.memoryUsage - after.memoryUsage) / before.memoryUsage
    );
    const cpuImprovement = Math.max(0, (before.cpuUsage - after.cpuUsage) / before.cpuUsage);

    return (latencyImprovement + throughputImprovement + memoryImprovement + cpuImprovement) / 4;
  }

  /**
   * Get current performance metrics
   */
  private async getCurrentPerformanceMetrics(): Promise<PerformanceMetrics> {
    // Mock implementation - replace with actual metrics collection
    return {
      latency: Math.random() * 100 + 10,
      throughput: Math.random() * 1000 + 500,
      memoryUsage: Math.random() * 0.5 + 0.3,
      cpuUsage: Math.random() * 0.4 + 0.2,
      errorRate: Math.random() * 0.01,
      timestamp: new Date(),
    };
  }

  /**
   * Get domain-specific metrics
   *
   * @param _domain
   */
  private async getDomainMetrics(_domain: string): Promise<PerformanceMetrics> {
    // Mock implementation - replace with actual domain-specific metrics
    return this.getCurrentPerformanceMetrics();
  }

  /**
   * Assess current performance across all domains
   */
  private async assessCurrentPerformance(): Promise<void> {
    const metrics = await this.getCurrentPerformanceMetrics();
    this.performanceHistory.push(metrics);
    this.emit('performance:assessed', metrics);
  }
}
