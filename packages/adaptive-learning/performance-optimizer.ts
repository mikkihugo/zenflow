/**
 * Performance Optimizer.
 *
 * Optimizes agent behavior, task allocation, and resource utilization based on.
 * Learned patterns to improve overall swarm performance and efficiency.
 */
/**
 * @file Performance-optimizer implementation.
 */

import { EventEmitter } from 'node:events';
import type {
  AdaptiveLearningConfig,
  AdaptiveThreshold,
  Agent,
  BehaviorOptimization,
  Bottleneck,
  EfficiencyImprovement,
  LatencyReduction,
  MonitoringStrategy,
  OptimizationAction,
  Pattern,
  PerformanceMetrics,
  Resource,
  ResourceAllocation,
  ResourceStrategy,
  SystemContext,
  Task,
} from './types';

// Import Zod schemas for validation
import {
  AllocationConstraintSchema,
  AllocationStrategySchema,
  LatencyOptimizationSchema,
  ImplementationPlanSchema,
  ImplementationStepSchema,
  MonitoringStrategySchema,
  MonitoringMetricSchema,
  TaskAllocationSchema,
  type LatencyOptimization,
  type AllocationConstraint,
  type AllocationStrategy,
  type ImplementationPlan,
  type ImplementationStep,
  type MonitoringMetric,
  type TaskAllocation,
} from './schemas';

// Import interface separately to avoid naming conflict
import type { PerformanceOptimizer as PerformanceOptimizerInterface } from './types';

export class PerformanceOptimizer
  extends EventEmitter
  implements PerformanceOptimizerInterface
{
  private config: AdaptiveLearningConfig;
  private behaviorCache = new Map<string, BehaviorOptimization>();
  private allocationHistory = new Map<string, AllocationStrategy[]>();
  private resourceHistory = new Map<string, ResourceStrategy[]>();
  private optimizationMetrics = new Map<string, PerformanceMetrics>();
  private adaptiveThresholds = new Map<string, AdaptiveThreshold>();
  private context: SystemContext;

  constructor(config: AdaptiveLearningConfig, context: SystemContext) {
    super();
    this.config = config;
    this.context = context;
    this.initializeAdaptiveThresholds();
    this.startContinuousOptimization();
  }

  /**
   * Optimize agent behavior based on learned patterns.
   *
   * @param agentId
   * @param patterns
   */
  optimizeBehavior(agentId: string, patterns: Pattern[]): BehaviorOptimization {
    // Analyze patterns relevant to the agent
    const relevantPatterns = this.filterPatternsForAgent(agentId, patterns);

    // Generate optimization actions based on patterns
    const optimizations = this.generateBehaviorOptimizations(
      agentId,
      relevantPatterns
    );

    // Calculate expected improvement and implementation cost
    const expectedImprovement =
      this.calculateExpectedImprovement(optimizations);
    const implementationCost = this.calculateImplementationCost(optimizations);
    const confidence = this.calculateOptimizationConfidence(
      relevantPatterns,
      optimizations
    );

    // Define validation metrics
    const validationMetrics = this.defineValidationMetrics(optimizations);

    const behaviorOptimization: BehaviorOptimization = {
      agentId,
      optimizations,
      expectedImprovement,
      confidence,
      implementationCost,
      validationMetrics,
    };

    // Cache for future reference
    this.behaviorCache.set(agentId, behaviorOptimization);

    this.emit('behaviorOptimized', {
      agentId,
      optimizations: optimizations.length,
      expectedImprovement,
      confidence,
      timestamp: Date.now(),
    });

    return behaviorOptimization;
  }

  /**
   * Optimize task allocation across agents.
   *
   * @param tasks
   * @param agents
   */
  public optimizeTaskAllocation(tasks: Task[], agents: Agent[]): AllocationStrategy {
    // Helper function to ensure AllocationStrategy type compliance
    const ensureAllocationStrategy = (strategy: any): AllocationStrategy => {
      return strategy as AllocationStrategy;
    };
    // Analyze agent capabilities and current load
    const agentAnalysis = this.analyzeAgentCapabilities(agents);

    // Analyze task requirements and dependencies
    const taskAnalysis = this.analyzeTaskRequirements(tasks);

    // Generate optimal allocations using learned patterns - ensure proper typing
    const allocations = this.generateOptimalAllocations(
      tasks,
      agents,
      agentAnalysis,
      taskAnalysis
    );

    // Calculate strategy metrics with explicit typing
    const expectedEfficiency: number = this.calculateAllocationEfficiency(
      allocations,
      agents
    );
    const resourceUtilization: number = this.calculateResourceUtilization(
      allocations,
      agents
    );
    const balanceScore: number = this.calculateLoadBalance(allocations, agents);

    // Identify constraints that may affect allocation
    const constraints: AllocationConstraint[] = this.identifyAllocationConstraints(tasks, agents);

    // Directly construct TaskAllocation objects without schema inference
    const validatedAllocations: TaskAllocation[] = allocations;
    
    // Directly use constraints without schema interference
    const validatedConstraints: AllocationConstraint[] = constraints;
    
    // Directly construct AllocationStrategy without any schema validation
    const result: AllocationStrategy = {
      tasks: validatedAllocations,
      expectedEfficiency: expectedEfficiency,
      resourceUtilization: resourceUtilization,
      balanceScore: balanceScore,
      constraints: validatedConstraints,
    };

    // Store allocation history
    const allocationId = `allocation_${Date.now()}`;
    if (!this.allocationHistory.has(allocationId)) {
      this.allocationHistory.set(allocationId, []);
    }
    this.allocationHistory.get(allocationId)?.push(result);

    this.emit('allocationOptimized', {
      tasks: tasks.length,
      agents: agents.length,
      efficiency: expectedEfficiency,
      utilization: resourceUtilization,
      balance: balanceScore,
      timestamp: Date.now(),
    });

    // Force TypeScript to accept the correct return type
    return result as unknown as AllocationStrategy;
  }

  /**
   * Optimize resource allocation.
   *
   * @param resources
   */
  optimizeResourceAllocation(resources: Resource[]): ResourceStrategy {
    // Analyze current resource usage patterns
    const usagePatterns = this.analyzeResourceUsage(resources);

    // Generate optimal resource allocations
    const allocations = this.generateResourceAllocations(
      resources,
      usagePatterns
    );

    // Calculate strategy metrics
    const expectedPerformance = this.calculateResourcePerformance(allocations);
    const utilizationTarget = this.calculateUtilizationTarget(resources);
    const costEfficiency = this.calculateCostEfficiency(allocations, resources);

    // Define adaptive thresholds for resource management
    const adaptiveThresholds = this.generateResourceThresholds(
      resources,
      usagePatterns
    );

    const strategy: ResourceStrategy = {
      allocations,
      expectedPerformance,
      utilizationTarget,
      costEfficiency,
      adaptiveThresholds,
    };

    // Store resource history
    const resourceId = `resource_${Date.now()}`;
    if (!this.resourceHistory.has(resourceId)) {
      this.resourceHistory.set(resourceId, []);
    }
    this.resourceHistory.get(resourceId)?.push(strategy);

    this.emit('resourceOptimized', {
      resources: resources.length,
      allocations: allocations.length,
      performance: expectedPerformance,
      utilization: utilizationTarget,
      cost: costEfficiency,
      timestamp: Date.now(),
    });

    return strategy;
  }

  /**
   * Improve overall system efficiency.
   *
   * @param metrics
   */
  improveEfficiency(metrics: PerformanceMetrics): EfficiencyImprovement {
    // Helper function to ensure EfficiencyImprovement type compliance
    const ensureEfficiencyImprovement = (improvement: any): EfficiencyImprovement => {
      return improvement as EfficiencyImprovement;
    };
    // Identify efficiency bottlenecks
    const bottlenecks = this.identifyEfficiencyBottlenecks(metrics);

    // Generate targeted optimizations
    const optimizations = this.generateEfficiencyOptimizations(
      bottlenecks,
      metrics
    );

    // Calculate improvement potential
    const estimatedGain = this.calculateEfficiencyGain(optimizations, metrics);

    // Create implementation plan with explicit type assertion
    const implementation = this.createImplementationPlan(optimizations) as ImplementationPlan;

    // Determine the category with highest impact
    const category = this.determinePrimaryCategory(bottlenecks);

    const improvement: EfficiencyImprovement = {
      category,
      currentMetrics: metrics,
      targetMetrics: this.calculateTargetMetrics(metrics, optimizations),
      optimizations,
      estimatedGain,
      implementation,
    };

    this.emit('efficiencyImproved', {
      category,
      currentEfficiency: metrics.efficiency,
      targetEfficiency: improvement.targetMetrics.efficiency,
      estimatedGain,
      optimizations: optimizations.length,
      timestamp: Date.now(),
    });

    // Force TypeScript to accept the correct return type
    return improvement as unknown as EfficiencyImprovement;
  }

  /**
   * Reduce system latency by addressing bottlenecks.
   *
   * @param bottlenecks
   */
  reduceLatency(bottlenecks: Bottleneck[]): LatencyReduction {
    // Helper function to ensure LatencyReduction type compliance
    const ensureLatencyReduction = (reduction: any): LatencyReduction => {
      return reduction as LatencyReduction;
    };
    // Prioritize bottlenecks by impact and frequency
    const prioritizedBottlenecks = this.prioritizeBottlenecks(bottlenecks);

    // Generate latency optimizations for each bottleneck with explicit type assertion
    const optimizations = this.generateLatencyOptimizations(
      prioritizedBottlenecks
    ) as LatencyOptimization[];

    // Calculate expected latency reduction
    const expectedReduction = this.calculateLatencyReduction(
      optimizations,
      bottlenecks
    );

    // Create implementation plan with explicit type assertion
    const implementation = this.createLatencyImplementationPlan(optimizations) as ImplementationPlan;

    // Define monitoring strategy
    const monitoringPlan = this.createLatencyMonitoringPlan(
      bottlenecks,
      optimizations
    );

    const latencyReduction: LatencyReduction = {
      bottlenecks: prioritizedBottlenecks,
      optimizations,
      expectedReduction,
      implementation,
      monitoringPlan,
    };

    this.emit('latencyReduced', {
      bottlenecks: bottlenecks.length,
      optimizations: optimizations.length,
      expectedReduction,
      timestamp: Date.now(),
    });

    // Force TypeScript to accept the correct return type
    return latencyReduction as unknown as LatencyReduction;
  }

  /**
   * Get optimization history for analysis.
   */
  getOptimizationHistory(): {
    behaviors: Map<string, BehaviorOptimization>;
    allocations: Map<string, AllocationStrategy[]>;
    resources: Map<string, ResourceStrategy[]>;
    metrics: Map<string, PerformanceMetrics>;
  } {
    return {
      behaviors: new Map(this.behaviorCache),
      allocations: new Map(this.allocationHistory),
      resources: new Map(this.resourceHistory),
      metrics: new Map(this.optimizationMetrics),
    };
  }

  /**
   * Clear optimization cache.
   */
  clearOptimizationCache(): void {
    this.behaviorCache.clear();
    this.allocationHistory.clear();
    this.resourceHistory.clear();
    this.optimizationMetrics.clear();

    this.emit('cacheCleared', { timestamp: Date.now() });
  }

  // Private helper methods

  private filterPatternsForAgent(
    agentId: string,
    patterns: Pattern[]
  ): Pattern[] {
    return patterns.filter(
      (pattern) =>
        pattern.context['agentId'] === agentId ||
        pattern.confidence > 0.8 ||
        pattern.metadata.relevance > 0.7
    );
  }

  private generateBehaviorOptimizations(
    agentId: string,
    patterns: Pattern[]
  ): OptimizationAction[] {
    const optimizations: OptimizationAction[] = [];

    for (const pattern of patterns) {
      if (pattern.type === 'task_completion' && pattern.confidence > 0.7) {
        optimizations.push({
          type: 'task_optimization',
          description: `Optimize task completion based on pattern ${pattern.id}`,
          target: agentId,
          parameters: { patternId: pattern.id, strategy: 'efficiency' },
          expectedImpact: pattern.confidence * 0.2,
          effort: 0.3,
          risk: 0.1,
        });
      }

      if (pattern.type === 'communication' && pattern.confidence > 0.6) {
        optimizations.push({
          type: 'communication_optimization',
          description: `Improve communication patterns for agent ${agentId}`,
          target: agentId,
          parameters: { patternId: pattern.id, strategy: 'reduce_latency' },
          expectedImpact: pattern.confidence * 0.15,
          effort: 0.2,
          risk: 0.05,
        });
      }

      if (pattern.type === 'resource_utilization' && pattern.confidence > 0.8) {
        optimizations.push({
          type: 'resource_optimization',
          description: `Optimize resource usage for agent ${agentId}`,
          target: agentId,
          parameters: { patternId: pattern.id, strategy: 'balance_load' },
          expectedImpact: pattern.confidence * 0.25,
          effort: 0.4,
          risk: 0.15,
        });
      }
    }

    return optimizations;
  }

  private calculateExpectedImprovement(
    optimizations: OptimizationAction[]
  ): number {
    return optimizations.reduce((total, opt) => total + opt.expectedImpact, 0);
  }

  private calculateImplementationCost(
    optimizations: OptimizationAction[]
  ): number {
    return optimizations.reduce((total, opt) => total + opt.effort, 0);
  }

  private calculateOptimizationConfidence(
    patterns: Pattern[],
    optimizations: OptimizationAction[]
  ): number {
    if (patterns.length === 0) return 0;

    const avgPatternConfidence =
      patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length;
    const optimizationFactor = Math.min(1, optimizations.length / 3); // More optimizations = higher confidence

    return avgPatternConfidence * optimizationFactor;
  }

  private defineValidationMetrics(
    optimizations: OptimizationAction[]
  ): string[] {
    const metrics = new Set<string>();

    for (const opt of optimizations) {
      switch (opt.type) {
        case 'task_optimization':
          metrics.add('task_completion_time');
          metrics.add('task_success_rate');
          break;
        case 'communication_optimization':
          metrics.add('message_latency');
          metrics.add('communication_efficiency');
          break;
        case 'resource_optimization':
          metrics.add('resource_utilization');
          metrics.add('resource_efficiency');
          break;
      }
    }

    return Array.from(metrics);
  }

  private analyzeAgentCapabilities(agents: Agent[]): Map<string, any> {
    const analysis = new Map<string, any>();

    for (const agent of agents) {
      analysis.set(agent.id, {
        capabilities: agent.capabilities,
        specializations: agent.specializations,
        currentLoad: agent.currentLoad,
        efficiency: agent.performance.efficiency,
        adaptability: agent.learningProgress.adaptability,
        availableCapacity: 1 - agent.currentLoad,
      });
    }

    return analysis;
  }

  private analyzeTaskRequirements(tasks: Task[]): Map<string, any> {
    const analysis = new Map<string, any>();

    for (const task of tasks) {
      analysis.set(task.id, {
        complexity: task.complexity,
        priority: task.priority,
        requirements: task.requirements,
        estimatedDuration: task.estimatedDuration,
        dependencies: task.dependencies,
        urgency:
          task.priority > 0.8 ? 'high' : task.priority > 0.5 ? 'medium' : 'low',
      });
    }

    return analysis;
  }

  private generateOptimalAllocations(
    tasks: Task[],
    agents: Agent[],
    agentAnalysis: Map<string, any>,
    taskAnalysis: Map<string, any>
  ): TaskAllocation[] {
    const allocations: TaskAllocation[] = [];

    // Sort tasks by priority and complexity
    const sortedTasks = tasks.sort(
      (a, b) => b.priority - a.priority || b.complexity - a.complexity
    );

    for (const task of sortedTasks) {
      const taskInfo = taskAnalysis.get(task.id);
      let bestAgent: Agent | null = null;
      let bestScore = -1;

      // Find the best agent for this task
      for (const agent of agents) {
        const agentInfo = agentAnalysis.get(agent.id);
        const score = this.calculateAgentTaskScore(
          agent,
          task,
          agentInfo,
          taskInfo
        );

        if (score > bestScore && agentInfo.availableCapacity > 0.1) {
          bestScore = score;
          bestAgent = agent;
        }
      }

      if (bestAgent) {
        // Create TaskAllocation with guaranteed required properties (no undefined/null values)
        const guaranteedTaskId = task.id || `task_${Date.now()}`;
        const guaranteedAgentId = bestAgent.id || `agent_${Date.now()}`;
        const guaranteedConfidence = bestScore || 0.5;
        const guaranteedDuration = task.estimatedDuration * (1 / bestAgent.performance.efficiency);
        const guaranteedQuality = bestAgent.performance.quality || 0.8;
        const guaranteedReasoning = 'Best match based on capabilities and current load';
        
        const taskAllocationRaw = {
          taskId: guaranteedTaskId,
          agentId: guaranteedAgentId,
          confidence: guaranteedConfidence,
          expectedDuration: guaranteedDuration,
          expectedQuality: guaranteedQuality,
          reasoning: guaranteedReasoning
        };
        
        // Directly construct TaskAllocation without schema validation
        const typedAllocation: TaskAllocation = {
          taskId: guaranteedTaskId,
          agentId: guaranteedAgentId,
          confidence: guaranteedConfidence,
          expectedDuration: guaranteedDuration,
          expectedQuality: guaranteedQuality,
          reasoning: guaranteedReasoning,
        };
        allocations.push(typedAllocation);

        // Update agent capacity
        const agentInfo = agentAnalysis.get(bestAgent.id);
        agentInfo.availableCapacity -= task.complexity * 0.1;
      }
    }

    return allocations;
  }

  private calculateAgentTaskScore(
    agent: Agent,
    task: Task,
    _agentInfo: unknown,
    _taskInfo: unknown
  ): number {
    let score = 0;

    // Capability match
    const capabilityMatch =
      task.requirements.filter(
        (req) =>
          agent.capabilities.includes(req) ||
          agent.specializations.includes(req)
      ).length / task.requirements.length;
    score += capabilityMatch * 0.4;

    // Efficiency factor
    score += agent.performance.efficiency * 0.3;

    // Load factor (prefer less loaded agents)
    score += (1 - agent.currentLoad) * 0.2;

    // Specialization bonus
    if (
      agent.specializations.some((spec) => task.requirements.includes(spec))
    ) {
      score += 0.1;
    }

    return score;
  }

  private calculateAllocationEfficiency(
    allocations: TaskAllocation[],
    _agents: Agent[]
  ): number {
    if (allocations.length === 0) return 0;

    const totalConfidence = allocations.reduce(
      (sum, alloc) => sum + alloc.confidence,
      0
    );
    return totalConfidence / allocations.length;
  }

  private calculateResourceUtilization(
    _allocations: TaskAllocation[],
    agents: Agent[]
  ): number {
    if (agents.length === 0) return 0;

    const totalLoad = agents.reduce((sum, agent) => sum + agent.currentLoad, 0);
    return totalLoad / agents.length;
  }

  private calculateLoadBalance(
    _allocations: TaskAllocation[],
    agents: Agent[]
  ): number {
    if (agents.length === 0) return 1;

    const loads = agents.map((agent) => agent.currentLoad);
    const avgLoad = loads.reduce((sum, load) => sum + load, 0) / loads.length;
    const variance =
      loads.reduce((sum, load) => sum + (load - avgLoad) ** 2, 0) /
      loads.length;

    return 1 / (1 + variance); // Higher score for lower variance
  }

  private identifyAllocationConstraints(
    tasks: Task[],
    agents: Agent[]
  ): AllocationConstraint[] {
    const constraints: AllocationConstraint[] = [];

    // Resource constraints
    if (agents.length < tasks.length) {
      constraints.push(AllocationConstraintSchema.parse({
        type: 'capacity',
        description: 'More tasks than available agents',
        priority: 0.9,
        flexibility: 0.3
      }));
    }

    // Skill constraints
    const totalRequirements = new Set(
      tasks.flatMap((task) => task.requirements)
    );
    const totalCapabilities = new Set(
      agents.flatMap((agent) => agent.capabilities)
    );
    const missingCapabilities = Array.from(totalRequirements).filter(
      (req) => !totalCapabilities.has(req)
    );

    if (missingCapabilities.length > 0) {
      constraints.push(AllocationConstraintSchema.parse({
        type: 'capability',
        description: `Missing capabilities: ${missingCapabilities.join(', ')}`,
        priority: 0.8,
        flexibility: 0.1
      }));
    }

    return constraints;
  }

  private analyzeResourceUsage(resources: Resource[]): Map<string, any> {
    const patterns = new Map<string, any>();

    for (const resource of resources) {
      patterns.set(resource.id, {
        utilizationRate: resource.currentUsage / resource.capacity,
        costEfficiency: resource.capacity / resource.cost,
        availability: resource.availability,
        type: resource.type,
        trend: 'stable', // Simplified
        peakUsage: resource.currentUsage * 1.2,
        recommendedCapacity: resource.currentUsage * 1.3,
      });
    }

    return patterns;
  }

  private generateResourceAllocations(
    resources: Resource[],
    patterns: Map<string, any>
  ): ResourceAllocation[] {
    const allocations: ResourceAllocation[] = [];

    for (const resource of resources) {
      const pattern = patterns.get(resource.id);

      if (pattern && pattern.utilizationRate < 0.9) {
        allocations.push({
          resourceId: resource.id,
          allocation: Math.min(
            resource.capacity * 0.8,
            pattern.recommendedCapacity
          ),
          duration: 3600, // 1 hour
          priority: pattern.utilizationRate > 0.7 ? 0.8 : 0.5,
          efficiency: pattern.costEfficiency,
        });
      }
    }

    return allocations;
  }

  private calculateResourcePerformance(
    allocations: ResourceAllocation[]
  ): number {
    if (allocations.length === 0) return 0;

    const avgEfficiency =
      allocations.reduce((sum, alloc) => sum + alloc.efficiency, 0) /
      allocations.length;
    return Math.min(1, avgEfficiency / 100); // Normalize to 0-1
  }

  private calculateUtilizationTarget(_resources: Resource[]): number {
    // Target 80% utilization as optimal
    return 0.8;
  }

  private calculateCostEfficiency(
    allocations: ResourceAllocation[],
    resources: Resource[]
  ): number {
    if (allocations.length === 0 || resources.length === 0) return 0;

    const totalAllocation = allocations.reduce(
      (sum, alloc) => sum + alloc.allocation,
      0
    );
    const totalCapacity = resources.reduce((sum, res) => sum + res.capacity, 0);
    const totalCost = resources.reduce((sum, res) => sum + res.cost, 0);

    return totalAllocation / totalCapacity / totalCost;
  }

  private generateResourceThresholds(
    resources: Resource[],
    patterns: Map<string, any>
  ): AdaptiveThreshold[] {
    const thresholds: AdaptiveThreshold[] = [];

    for (const resource of resources) {
      const _pattern = patterns.get(resource.id);

      thresholds.push({
        metric: `${resource.type}_utilization`,
        currentThreshold: 0.8,
        adaptiveRange: [0.6, 0.9],
        adaptationRate: 0.1,
        conditions: [`resource_id:${resource.id}`, `type:${resource.type}`],
      });
    }

    return thresholds;
  }

  private identifyEfficiencyBottlenecks(metrics: PerformanceMetrics): string[] {
    const bottlenecks: string[] = [];

    if (metrics.latency > 1000) bottlenecks.push('high_latency');
    if (metrics.throughput < 10) bottlenecks.push('low_throughput');
    if (metrics.errorRate > 0.05) bottlenecks.push('high_error_rate');
    if (metrics.resourceUtilization.cpu > 0.9)
      bottlenecks.push('cpu_bottleneck');
    if (metrics.resourceUtilization.memory > 0.9)
      bottlenecks.push('memory_bottleneck');
    if (metrics.efficiency < 0.7) bottlenecks.push('low_efficiency');

    return bottlenecks;
  }

  private generateEfficiencyOptimizations(
    bottlenecks: string[],
    _metrics: PerformanceMetrics
  ): OptimizationAction[] {
    const optimizations: OptimizationAction[] = [];

    for (const bottleneck of bottlenecks) {
      switch (bottleneck) {
        case 'high_latency':
          optimizations.push({
            type: 'latency_reduction',
            description: 'Implement caching and request optimization',
            target: 'system',
            parameters: { strategy: 'caching', target_latency: 500 },
            expectedImpact: 0.3,
            effort: 0.6,
            risk: 0.2,
          });
          break;

        case 'low_throughput':
          optimizations.push({
            type: 'throughput_improvement',
            description: 'Increase parallelism and optimize processing',
            target: 'system',
            parameters: { strategy: 'parallelization', target_throughput: 50 },
            expectedImpact: 0.4,
            effort: 0.7,
            risk: 0.3,
          });
          break;

        case 'cpu_bottleneck':
          optimizations.push({
            type: 'resource_optimization',
            description: 'Optimize CPU-intensive operations',
            target: 'cpu',
            parameters: { strategy: 'algorithm_optimization' },
            expectedImpact: 0.25,
            effort: 0.5,
            risk: 0.15,
          });
          break;
      }
    }

    return optimizations;
  }

  private calculateEfficiencyGain(
    optimizations: OptimizationAction[],
    _metrics: PerformanceMetrics
  ): number {
    return optimizations.reduce((total, opt) => total + opt.expectedImpact, 0);
  }

  private createImplementationPlan(
    optimizations: OptimizationAction[]
  ): ImplementationPlan {
    const steps: ImplementationStep[] = optimizations.map((opt, index) => {
      // Create step data with guaranteed required properties (no undefined/null values)
      const guaranteedId = `step_${index + 1}`;
      const guaranteedDescription = opt.description;
      const guaranteedDuration = (opt.effort * 10) || 1; // Convert effort to hours
      const guaranteedDependencies = index > 0 ? [`step_${index}`] : [];
      const guaranteedResources = [opt.target || 'system'];
      const guaranteedValidation = `Validate ${opt.type || 'optimization'} improvement`;
      
      const stepRaw = {
        id: guaranteedId,
        description: guaranteedDescription,
        duration: guaranteedDuration,
        dependencies: guaranteedDependencies,
        resources: guaranteedResources,
        validation: guaranteedValidation,
      };
      
      // Directly construct ImplementationStep to avoid schema inference issues
      ImplementationStepSchema.parse(stepRaw); // Validation only
      return {
        id: guaranteedId,
        description: guaranteedDescription,
        duration: guaranteedDuration,
        dependencies: guaranteedDependencies,
        resources: guaranteedResources,
        validation: guaranteedValidation,
      } as ImplementationStep;
    });

    // Steps are already properly typed from direct construction
    const validatedSteps: ImplementationStep[] = steps;
    
    // Create plan data with all required properties explicitly defined
    const implementationPlanRaw = {
      steps: validatedSteps,
      timeline: validatedSteps.reduce((total, step) => total + step.duration, 0),
      resources: Array.from(new Set(optimizations.map((opt) => opt.target))),
      risks: optimizations.map((opt, index) => ({
        id: `risk_${index + 1}`,
        description: `Risk in implementing ${opt.type}`,
        probability: opt.risk || 0.3,
        impact: opt.expectedImpact * 0.1,
        mitigation: `Monitor ${opt.target} during implementation`,
      })),
      validation: optimizations.map((opt, index) => ({
        step: `step_${index + 1}`,
        criteria: `${opt.type} shows expected improvement`,
        method: 'automated_monitoring',
      })),
    };
    
    // Directly construct ImplementationPlan to avoid schema inference issues
    ImplementationPlanSchema.parse(implementationPlanRaw); // Validation only
    return {
      steps: validatedSteps,
      timeline: validatedSteps.reduce((total, step) => total + step.duration, 0),
      resources: Array.from(new Set(optimizations.map((opt) => opt.target))),
      risks: optimizations.map((opt, index) => ({
        id: `risk_${index + 1}`,
        description: `Risk in implementing ${opt.type}`,
        probability: opt.risk || 0.3,
        impact: opt.expectedImpact * 0.1,
        mitigation: `Monitor ${opt.target} during implementation`,
      })),
      validation: optimizations.map((opt, index) => ({
        step: `step_${index + 1}`,
        criteria: `${opt.type} shows expected improvement`,
        method: 'automated_monitoring',
      })),
    } as ImplementationPlan;
  }

  private calculateTargetMetrics(
    current: PerformanceMetrics,
    optimizations: OptimizationAction[]
  ): PerformanceMetrics {
    const totalImprovement = optimizations.reduce(
      (sum, opt) => sum + opt.expectedImpact,
      0
    );

    return {
      throughput: current?.throughput * (1 + totalImprovement),
      latency: current?.latency * (1 - totalImprovement * 0.5),
      errorRate: current?.errorRate * (1 - totalImprovement * 0.3),
      resourceUtilization: {
        cpu: Math.max(
          0.1,
          current?.resourceUtilization?.cpu * (1 - totalImprovement * 0.2)
        ),
        memory: Math.max(
          0.1,
          current?.resourceUtilization?.memory * (1 - totalImprovement * 0.2)
        ),
        network: current?.resourceUtilization?.network,
        diskIO: current?.resourceUtilization?.diskIO,
        bandwidth: current?.resourceUtilization?.bandwidth,
        latency:
          current?.resourceUtilization?.latency * (1 - totalImprovement * 0.4),
      },
      efficiency: Math.min(1, current?.efficiency + totalImprovement),
      quality: Math.min(1, current?.quality + totalImprovement * 0.1),
    };
  }

  private determinePrimaryCategory(
    bottlenecks: string[]
  ): 'cpu' | 'memory' | 'network' | 'coordination' {
    if (bottlenecks.includes('cpu_bottleneck')) return 'cpu';
    if (bottlenecks.includes('memory_bottleneck')) return 'memory';
    if (bottlenecks.includes('high_latency')) return 'network';
    return 'coordination';
  }

  private prioritizeBottlenecks(bottlenecks: Bottleneck[]): Bottleneck[] {
    return bottlenecks.sort(
      (a, b) =>
        b.severity * b.impact * b.frequency -
        a.severity * a.impact * a.frequency
    );
  }

  private generateLatencyOptimizations(bottlenecks: Bottleneck[]): LatencyOptimization[] {
    return bottlenecks.map((bottleneck) => {
      // Create implementation step data with guaranteed required properties (no undefined/null values)
      const guaranteedStepId = `impl_${bottleneck.id || 'unknown'}`;
      const guaranteedStepDescription = `Address ${bottleneck.type || 'unknown'} bottleneck`;
      const guaranteedStepDuration = 2;
      const guaranteedStepDependencies: string[] = [];
      const guaranteedStepResources = [bottleneck.location || 'system'];
      const guaranteedStepValidation = `Measure latency reduction in ${bottleneck.location || 'system'}`;
      
      const stepRaw = {
        id: guaranteedStepId,
        description: guaranteedStepDescription,
        duration: guaranteedStepDuration,
        dependencies: guaranteedStepDependencies,
        resources: guaranteedStepResources,
        validation: guaranteedStepValidation,
      };
      
      // Directly construct ImplementationStep to avoid schema inference issues
      ImplementationStepSchema.parse(stepRaw); // Validation only
      const typedStep: ImplementationStep = {
        id: guaranteedStepId,
        description: guaranteedStepDescription,
        duration: guaranteedStepDuration,
        dependencies: guaranteedStepDependencies,
        resources: guaranteedStepResources,
        validation: guaranteedStepValidation,
      };
      const implementation = [typedStep];
      
      // Create monitoring metric data with guaranteed required properties
      const guaranteedMetricName = `${bottleneck.type}_latency`;
      const guaranteedMetricType = 'latency';
      const guaranteedMetricThreshold = bottleneck.severity * 50;
      const guaranteedMetricAlertLevel = 'warning' as const;
      
      const metricRaw = {
        name: guaranteedMetricName,
        type: guaranteedMetricType,
        threshold: guaranteedMetricThreshold,
        alertLevel: guaranteedMetricAlertLevel,
      };
      
      // Validate and create monitoring array - all properties guaranteed
      const validatedMetric = MonitoringMetricSchema.parse(metricRaw) as MonitoringMetric;
      
      // Create latency optimization data with guaranteed required properties (no undefined/null values)
      const guaranteedTarget = bottleneck.location || 'unknown_location';
      const guaranteedOptimization = `Optimize ${bottleneck.type || 'unknown'} in ${bottleneck.location || 'system'}`;
      const guaranteedExpectedReduction = bottleneck.severity * 100;
      
      const latencyOptimizationRaw = {
        target: guaranteedTarget,
        optimization: guaranteedOptimization,
        expectedReduction: guaranteedExpectedReduction,
        implementation: implementation,
        monitoring: [validatedMetric],
      };
      
      // Directly construct LatencyOptimization to avoid schema inference issues
      LatencyOptimizationSchema.parse(latencyOptimizationRaw); // Validation only
      return {
        target: guaranteedTarget,
        optimization: guaranteedOptimization,
        expectedReduction: guaranteedExpectedReduction,
        implementation: implementation,
        monitoring: [validatedMetric],
      } as LatencyOptimization;
    });
  }

  private calculateLatencyReduction(
    optimizations: LatencyOptimization[],
    _bottlenecks: Bottleneck[]
  ): number {
    return optimizations.reduce(
      (total, opt) => total + opt.expectedReduction,
      0
    );
  }

  private createLatencyImplementationPlan(
    optimizations: LatencyOptimization[]
  ): ImplementationPlan {
    const allSteps = optimizations.flatMap((opt) => opt.implementation);

    // Directly construct ImplementationStep objects to avoid schema inference issues
    const validatedSteps: ImplementationStep[] = allSteps.map(step => {
      // Validate with schema but construct explicit object
      ImplementationStepSchema.parse(step); // Validation only
      return {
        id: step.id,
        description: step.description,
        duration: step.duration,
        dependencies: step.dependencies,
        resources: step.resources,
        validation: step.validation,
      } as ImplementationStep;
    });
    
    // Create plan data with explicit typing
    const implementationPlanRaw = {
      steps: validatedSteps,
      timeline: validatedSteps.reduce((total, step) => total + step.duration, 0),
      resources: Array.from(new Set(validatedSteps.flatMap((step) => step.resources))),
      risks: [
        {
          id: 'latency_optimization_risk',
          description: 'Risk of introducing new bottlenecks',
          probability: 0.3,
          impact: 0.2,
          mitigation: 'Gradual rollout with monitoring',
        },
      ],
      validation: validatedSteps.map((step) => ({
        step: `validation_${step.id}`,
        criteria: 'latency_reduced',
        method: 'performance_test',
      })),
    };

    // Directly construct ImplementationPlan to avoid schema inference issues
    ImplementationPlanSchema.parse(implementationPlanRaw); // Validation only
    return {
      steps: validatedSteps,
      timeline: validatedSteps.reduce((total, step) => total + step.duration, 0),
      resources: Array.from(new Set(validatedSteps.flatMap((step) => step.resources))),
      risks: [
        {
          id: 'latency_optimization_risk',
          description: 'Risk of introducing new bottlenecks',
          probability: 0.3,
          impact: 0.2,
          mitigation: 'Gradual rollout with monitoring',
        },
      ],
      validation: validatedSteps.map((step) => ({
        step: `validation_${step.id}`,
        criteria: 'latency_reduced',
        method: 'performance_test',
      })),
    } as ImplementationPlan;
  }

  private createLatencyMonitoringPlan(
    _bottlenecks: Bottleneck[],
    optimizations: LatencyOptimization[]
  ): MonitoringStrategy {
    const allMetrics = optimizations.flatMap((opt) => opt.monitoring);

    // Ensure all metrics have required properties
    const validatedMetrics = allMetrics.map((metric, index) => ({
      name: metric.name || `metric_${index}`,
      type: metric.type || 'latency',
      threshold: metric.threshold || 100,
      alertLevel: metric.alertLevel || 'warning' as const,
    }));

    return {
      metrics: validatedMetrics,
      frequency: 60, // seconds
      alerts: validatedMetrics.map((metric) => ({
        metric: metric.name,
        condition: 'greater_than',
        threshold: metric.threshold,
        severity: metric.alertLevel === 'info' ? 'low' as const :
                  metric.alertLevel === 'warning' ? 'medium' as const :
                  metric.alertLevel === 'error' ? 'high' as const :
                  'critical' as const,
        action: 'investigate_bottleneck',
      })),
      dashboards: ['latency_overview', 'bottleneck_analysis'],
    };
  }

  private initializeAdaptiveThresholds(): void {
    // Initialize default adaptive thresholds
    const defaultThresholds = [
      {
        metric: 'cpu_utilization',
        currentThreshold: 0.8,
        adaptiveRange: [0.6, 0.9] as [number, number],
        adaptationRate: 0.1,
        conditions: ['environment:production'],
      },
      {
        metric: 'memory_utilization',
        currentThreshold: 0.85,
        adaptiveRange: [0.7, 0.95] as [number, number],
        adaptationRate: 0.05,
        conditions: ['environment:production'],
      },
      {
        metric: 'response_time',
        currentThreshold: 1000,
        adaptiveRange: [500, 2000] as [number, number],
        adaptationRate: 50,
        conditions: ['environment:production'],
      },
    ];

    for (const threshold of defaultThresholds) {
      this.adaptiveThresholds.set(threshold.metric, threshold);
    }
  }

  private startContinuousOptimization(): void {
    // Start periodic optimization analysis
    setInterval(
      () => {
        this.performPeriodicOptimization();
      },
      10 * 60 * 1000
    ); // Every 10 minutes
  }

  private performPeriodicOptimization(): void {
    // Analyze current system state and apply optimizations
    this.emit('periodicOptimization', {
      timestamp: Date.now(),
      activeOptimizations: this.behaviorCache.size,
    });
  }
}
