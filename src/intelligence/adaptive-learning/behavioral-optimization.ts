/**
 * Behavioral Optimization System for Swarm Agent Refinement
 *
 * Optimizes agent behaviors based on successful patterns, task allocation,
 * communication protocols, resource allocation, and coordination strategies.
 */

import { EventEmitter } from 'node:events';
import type { ExecutionPattern } from './pattern-recognition-engine';

export interface AgentBehavior {
  agentId: string;
  type: string;
  version: string;
  parameters: BehaviorParameters;
  performance: BehaviorPerformance;
  adaptations: Adaptation[];
  lastUpdated: number;
}

export interface BehaviorParameters {
  taskSelection: TaskSelectionParams;
  communication: CommunicationParams;
  resourceManagement: ResourceManagementParams;
  coordination: CoordinationParams;
  learning: LearningParams;
}

export interface TaskSelectionParams {
  preferredComplexity: number;
  riskTolerance: number;
  specialization: string[];
  priorityWeights: Record<string, number>;
  loadBalancing: number;
}

export interface CommunicationParams {
  frequency: number;
  verbosity: number;
  protocols: string[];
  broadcastThreshold: number;
  responseTimeout: number;
}

export interface ResourceManagementParams {
  memoryLimit: number;
  cpuThreshold: number;
  storageQuota: number;
  networkBandwidth: number;
  resourceSharing: boolean;
}

export interface CoordinationParams {
  leadershipStyle: 'democratic' | 'autocratic' | 'laissez_faire';
  consensusThreshold: number;
  conflictResolution: string;
  collaborationLevel: number;
  autonomyLevel: number;
}

export interface LearningParams {
  adaptationRate: number;
  explorationRate: number;
  memoryRetention: number;
  transferLearning: boolean;
  continuousImprovement: boolean;
}

export interface BehaviorPerformance {
  efficiency: number;
  accuracy: number;
  reliability: number;
  collaboration: number;
  adaptability: number;
  resourceUtilization: number;
  taskCompletionRate: number;
  errorRate: number;
}

export interface Adaptation {
  id: string;
  timestamp: number;
  type: 'parameter_adjustment' | 'strategy_change' | 'skill_acquisition' | 'optimization';
  description: string;
  parameters: Record<string, any>;
  impact: AdaptationImpact;
  success: boolean;
}

export interface AdaptationImpact {
  performanceChange: number;
  efficiencyGain: number;
  stabilityEffect: number;
  collaborationImprovement: number;
}

export interface OptimizationStrategy {
  id: string;
  name: string;
  type: 'genetic' | 'gradient_descent' | 'simulated_annealing' | 'bayesian' | 'reinforcement';
  objective: string;
  constraints: Record<string, any>;
  parameters: Record<string, any>;
}

export interface OptimizationResult {
  strategyId: string;
  agentId: string;
  originalBehavior: AgentBehavior;
  optimizedBehavior: AgentBehavior;
  improvement: number;
  convergenceTime: number;
  iterations: number;
}

export interface BehaviorCluster {
  id: string;
  behaviors: AgentBehavior[];
  centroid: AgentBehavior;
  characteristics: string[];
  performance: number;
  stability: number;
}

export class BehavioralOptimization extends EventEmitter {
  private agentBehaviors: Map<string, AgentBehavior> = new Map();
  private optimizationStrategies: Map<string, OptimizationStrategy> = new Map();
  private behaviorClusters: Map<string, BehaviorCluster> = new Map();
  private optimizationHistory: OptimizationResult[] = [];
  private config: BehavioralOptimizationConfig;

  constructor(config: BehavioralOptimizationConfig = {}) {
    super();
    this.config = {
      optimizationInterval: 600000, // 10 minutes
      maxBehaviors: 1000,
      convergenceThreshold: 0.01,
      maxIterations: 100,
      mutationRate: 0.1,
      crossoverRate: 0.8,
      populationSize: 50,
      elitismRate: 0.2,
      ...config,
    };

    this.initializeOptimizationStrategies();
    this.startContinuousOptimization();
  }

  /**
   * Register an agent's behavior for optimization
   */
  registerAgentBehavior(agentId: string, initialBehavior?: Partial<BehaviorParameters>): string {
    const behavior: AgentBehavior = {
      agentId,
      type: 'adaptive_agent',
      version: '1.0.0',
      parameters: this.createDefaultBehaviorParameters(initialBehavior),
      performance: this.createDefaultPerformance(),
      adaptations: [],
      lastUpdated: Date.now(),
    };

    this.agentBehaviors.set(agentId, behavior);
    this.emit('behavior_registered', { agentId, behavior });

    return agentId;
  }

  /**
   * Optimize agent behavior based on execution patterns
   */
  async optimizeAgentBehavior(
    agentId: string,
    patterns: ExecutionPattern[],
    strategy: string = 'genetic',
  ): Promise<OptimizationResult> {
    const currentBehavior = this.agentBehaviors.get(agentId);
    if (!currentBehavior) {
      throw new Error(`Agent behavior ${agentId} not found`);
    }

    const optimizationStrategy = this.optimizationStrategies.get(strategy);
    if (!optimizationStrategy) {
      throw new Error(`Optimization strategy ${strategy} not found`);
    }

    this.emit('optimization_started', { agentId, strategy });

    const startTime = Date.now();
    let optimizedBehavior: AgentBehavior;

    switch (optimizationStrategy.type) {
      case 'genetic':
        optimizedBehavior = await this.geneticOptimization(currentBehavior, patterns);
        break;
      case 'gradient_descent':
        optimizedBehavior = await this.gradientDescentOptimization(currentBehavior, patterns);
        break;
      case 'simulated_annealing':
        optimizedBehavior = await this.simulatedAnnealingOptimization(currentBehavior, patterns);
        break;
      case 'bayesian':
        optimizedBehavior = await this.bayesianOptimization(currentBehavior, patterns);
        break;
      case 'reinforcement':
        optimizedBehavior = await this.reinforcementOptimization(currentBehavior, patterns);
        break;
      default:
        throw new Error(`Unsupported optimization type: ${optimizationStrategy.type}`);
    }

    const improvement = this.calculateImprovement(currentBehavior, optimizedBehavior);
    const convergenceTime = Date.now() - startTime;

    const result: OptimizationResult = {
      strategyId: strategy,
      agentId,
      originalBehavior: { ...currentBehavior },
      optimizedBehavior,
      improvement,
      convergenceTime,
      iterations: this.config.maxIterations, // Would track actual iterations
    };

    // Update agent behavior if improvement is significant
    if (improvement > 0.05) {
      this.agentBehaviors.set(agentId, optimizedBehavior);
      this.recordAdaptation(agentId, {
        type: 'optimization',
        description: `Applied ${strategy} optimization with ${(improvement * 100).toFixed(1)}% improvement`,
        parameters: { strategy, improvement },
        impact: {
          performanceChange: improvement,
          efficiencyGain: improvement * 0.8,
          stabilityEffect: 0,
          collaborationImprovement: improvement * 0.3,
        },
        success: true,
      });
    }

    this.optimizationHistory.push(result);
    this.emit('optimization_completed', result);

    return result;
  }

  /**
   * Refine task allocation based on successful patterns
   */
  async refineTaskAllocation(
    swarmId: string,
    patterns: ExecutionPattern[],
  ): Promise<TaskAllocationStrategy> {
    const taskPatterns = patterns.filter((p) => p.type === 'task_completion');
    const successfulPatterns = taskPatterns.filter((p) => p.metadata.success === true);

    const allocationStrategy: TaskAllocationStrategy = {
      id: `allocation_${swarmId}_${Date.now()}`,
      swarmId,
      rules: [],
      weightings: {},
      constraints: {},
      performance: 0,
    };

    // Analyze successful task completion patterns
    const taskTypes = new Set(successfulPatterns.map((p) => p.metadata.taskType));

    taskTypes.forEach((taskType) => {
      const typePatterns = successfulPatterns.filter((p) => p.metadata.taskType === taskType);
      const avgPerformance =
        typePatterns.reduce((sum, p) => sum + p.confidence, 0) / typePatterns.length;

      // Create allocation rule based on pattern analysis
      allocationStrategy.rules.push({
        condition: `taskType === '${taskType}'`,
        action: 'assign_to_specialist',
        priority: avgPerformance,
        agentCriteria: this.extractAgentCriteria(typePatterns),
      });

      allocationStrategy.weightings[taskType] = avgPerformance;
    });

    // Analyze resource requirements
    const resourcePatterns = patterns.filter((p) => p.type === 'resource_utilization');
    allocationStrategy.constraints = this.extractResourceConstraints(resourcePatterns);

    this.emit('task_allocation_refined', allocationStrategy);
    return allocationStrategy;
  }

  /**
   * Optimize communication protocols based on patterns
   */
  async optimizeCommunicationProtocols(
    swarmId: string,
    patterns: ExecutionPattern[],
  ): Promise<CommunicationOptimization> {
    const commPatterns = patterns.filter((p) => p.type === 'communication');

    const optimization: CommunicationOptimization = {
      swarmId,
      protocols: [],
      frequencies: {},
      messageTypes: {},
      networkTopology: 'mesh',
      latencyTargets: {},
      throughputTargets: {},
    };

    // Analyze communication effectiveness
    const effectiveComms = commPatterns.filter((p) => p.metadata.effective === true);
    const avgLatency =
      effectiveComms.reduce((sum, p) => sum + (p.metadata.latency || 0), 0) / effectiveComms.length;

    // Optimize based on successful communication patterns
    optimization.frequencies = this.calculateOptimalFrequencies(effectiveComms);
    optimization.messageTypes = this.classifyMessageTypes(effectiveComms);
    optimization.latencyTargets = { default: avgLatency * 0.8 }; // Target 20% improvement

    // Determine optimal network topology
    optimization.networkTopology = this.determineOptimalTopology(commPatterns);

    this.emit('communication_optimized', optimization);
    return optimization;
  }

  /**
   * Optimize resource allocation based on usage patterns
   */
  async optimizeResourceAllocation(
    patterns: ExecutionPattern[],
  ): Promise<ResourceAllocationStrategy> {
    const resourcePatterns = patterns.filter((p) => p.type === 'resource_utilization');

    const strategy: ResourceAllocationStrategy = {
      id: `resource_strategy_${Date.now()}`,
      allocations: {},
      thresholds: {},
      scalingRules: [],
      priorities: {},
      constraints: {},
    };

    // Analyze resource usage efficiency
    const resourceTypes = new Set(resourcePatterns.map((p) => p.metadata.resourceType));

    resourceTypes.forEach((resourceType) => {
      const typePatterns = resourcePatterns.filter((p) => p.metadata.resourceType === resourceType);
      const avgUtilization =
        typePatterns.reduce((sum, p) => sum + (p.metadata.utilization || 0), 0) /
        typePatterns.length;
      const peakUtilization = Math.max(...typePatterns.map((p) => p.metadata.utilization || 0));

      strategy.allocations[resourceType] = avgUtilization * 1.2; // 20% buffer
      strategy.thresholds[resourceType] = {
        warning: peakUtilization * 0.8,
        critical: peakUtilization * 0.95,
      };

      // Create scaling rules
      strategy.scalingRules.push({
        resource: resourceType,
        condition: `utilization > ${peakUtilization * 0.8}`,
        action: 'scale_up',
        factor: 1.5,
      });
    });

    this.emit('resource_allocation_optimized', strategy);
    return strategy;
  }

  /**
   * Adapt coordination strategies based on swarm performance
   */
  async adaptCoordinationStrategies(
    swarmId: string,
    patterns: ExecutionPattern[],
  ): Promise<CoordinationStrategy> {
    const coordPatterns = patterns.filter((p) => p.type === 'coordination');

    const strategy: CoordinationStrategy = {
      swarmId,
      leadershipModel: 'adaptive',
      decisionMaking: 'consensus',
      conflictResolution: 'mediation',
      synchronization: {},
      coordination: {},
      adaptation: {},
    };

    // Analyze coordination effectiveness
    const effectiveCoordination = coordPatterns.filter((p) => p.metadata.effective === true);

    if (effectiveCoordination.length > 0) {
      // Determine optimal leadership model
      const leadershipStyles = effectiveCoordination
        .map((p) => p.metadata.leadershipStyle)
        .filter(Boolean);
      strategy.leadershipModel = this.getMostFrequent(leadershipStyles) || 'democratic';

      // Optimize decision-making process
      const decisionTimes = effectiveCoordination
        .map((p) => p.metadata.decisionTime)
        .filter(Boolean);
      const avgDecisionTime =
        decisionTimes.reduce((sum, time) => sum + time, 0) / decisionTimes.length;

      strategy.synchronization = {
        frequency: this.calculateOptimalSyncFrequency(effectiveCoordination),
        timeout: avgDecisionTime * 1.5,
      };
    }

    this.emit('coordination_adapted', strategy);
    return strategy;
  }

  /**
   * Cluster behaviors for pattern analysis
   */
  clusterBehaviors(): BehaviorCluster[] {
    const behaviors = Array.from(this.agentBehaviors.values());
    const clusters: BehaviorCluster[] = [];

    // Simple clustering based on behavior similarity
    const visited = new Set<string>();

    for (const behavior of behaviors) {
      if (visited.has(behavior.agentId)) continue;

      const cluster = this.createBehaviorCluster(behavior, behaviors, visited);
      if (cluster.behaviors.length >= 3) {
        // Minimum cluster size
        clusters.push(cluster);
      }
    }

    // Update cluster storage
    clusters.forEach((cluster) => {
      this.behaviorClusters.set(cluster.id, cluster);
    });

    return clusters;
  }

  /**
   * Get optimization recommendations
   */
  getOptimizationRecommendations(): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    this.agentBehaviors.forEach((behavior) => {
      // Low performance agents
      if (behavior.performance.efficiency < 0.7) {
        recommendations.push({
          type: 'performance_improvement',
          agentId: behavior.agentId,
          priority: 'high',
          description: 'Agent showing low efficiency, needs optimization',
          suggestedStrategy: 'genetic',
          expectedImprovement: 0.3,
        });
      }

      // High error rate agents
      if (behavior.performance.errorRate > 0.1) {
        recommendations.push({
          type: 'error_reduction',
          agentId: behavior.agentId,
          priority: 'high',
          description: 'Agent has high error rate, needs parameter adjustment',
          suggestedStrategy: 'gradient_descent',
          expectedImprovement: 0.2,
        });
      }

      // Resource inefficient agents
      if (behavior.performance.resourceUtilization > 0.9) {
        recommendations.push({
          type: 'resource_optimization',
          agentId: behavior.agentId,
          priority: 'medium',
          description: 'Agent using too many resources, needs resource management optimization',
          suggestedStrategy: 'simulated_annealing',
          expectedImprovement: 0.15,
        });
      }

      // Outdated behaviors
      if (Date.now() - behavior.lastUpdated > 86400000) {
        // 24 hours
        recommendations.push({
          type: 'behavior_refresh',
          agentId: behavior.agentId,
          priority: 'low',
          description: 'Agent behavior not updated recently, consider optimization',
          suggestedStrategy: 'bayesian',
          expectedImprovement: 0.1,
        });
      }
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Apply behavior adaptation based on feedback
   */
  async applyBehaviorAdaptation(
    agentId: string,
    adaptationType: string,
    parameters: Record<string, any>,
  ): Promise<void> {
    const behavior = this.agentBehaviors.get(agentId);
    if (!behavior) {
      throw new Error(`Agent behavior ${agentId} not found`);
    }

    const originalPerformance = { ...behavior.performance };

    // Apply adaptation based on type
    switch (adaptationType) {
      case 'learning_rate_adjustment':
        behavior.parameters.learning.adaptationRate = parameters.newRate;
        break;
      case 'task_specialization':
        behavior.parameters.taskSelection.specialization = parameters.specializations;
        break;
      case 'communication_frequency':
        behavior.parameters.communication.frequency = parameters.frequency;
        break;
      case 'resource_limits':
        behavior.parameters.resourceManagement = {
          ...behavior.parameters.resourceManagement,
          ...parameters,
        };
        break;
      case 'coordination_style':
        behavior.parameters.coordination.leadershipStyle = parameters.style;
        break;
    }

    behavior.lastUpdated = Date.now();

    // Calculate performance change from baseline
    const performanceChange = behavior.performance.efficiency - originalPerformance.efficiency;
    const successRate = behavior.performance.success_rate - originalPerformance.success_rate;

    // Record the adaptation with performance comparison
    this.recordAdaptation(agentId, {
      type: 'parameter_adjustment',
      description: `Applied ${adaptationType} adaptation`,
      parameters,
      impact: {
        performanceChange: performanceChange,
        efficiencyGain: successRate,
        stabilityEffect: behavior.performance.response_time - originalPerformance.response_time,
        collaborationImprovement:
          behavior.performance.collaboration_score - originalPerformance.collaboration_score,
      },
      success: performanceChange >= 0, // Success if performance improved or stayed same
      originalPerformance,
      newPerformance: { ...behavior.performance },
    });

    this.emit('behavior_adapted', { agentId, adaptationType, parameters });
  }

  // Private optimization algorithm implementations

  private async geneticOptimization(
    behavior: AgentBehavior,
    patterns: ExecutionPattern[],
  ): Promise<AgentBehavior> {
    // Create initial population
    const population = this.createPopulation(behavior, this.config.populationSize);

    for (let generation = 0; generation < this.config.maxIterations; generation++) {
      // Evaluate fitness
      const fitness = population.map((individual) => this.evaluateFitness(individual, patterns));

      // Selection
      const parents = this.selectParents(population, fitness);

      // Crossover
      const offspring = this.crossover(parents);

      // Mutation
      this.mutate(offspring);

      // Replace population
      population.splice(
        0,
        population.length,
        ...this.selectSurvivors(population, offspring, fitness),
      );

      // Check convergence
      const bestFitness = Math.max(...fitness);
      if (generation > 0 && Math.abs(bestFitness - fitness[0]) < this.config.convergenceThreshold) {
        break;
      }
    }

    // Return best individual
    const finalFitness = population.map((individual) => this.evaluateFitness(individual, patterns));
    const bestIndex = finalFitness.indexOf(Math.max(...finalFitness));

    return population[bestIndex];
  }

  private async gradientDescentOptimization(
    behavior: AgentBehavior,
    patterns: ExecutionPattern[],
  ): Promise<AgentBehavior> {
    let currentBehavior = { ...behavior };
    const learningRate = 0.01;

    for (let iteration = 0; iteration < this.config.maxIterations; iteration++) {
      const currentFitness = this.evaluateFitness(currentBehavior, patterns);

      // Calculate gradients (simplified)
      const gradients = this.calculateGradients(currentBehavior, patterns);

      // Update parameters
      currentBehavior = this.applyGradients(currentBehavior, gradients, learningRate);

      const newFitness = this.evaluateFitness(currentBehavior, patterns);

      // Check convergence
      if (Math.abs(newFitness - currentFitness) < this.config.convergenceThreshold) {
        break;
      }
    }

    return currentBehavior;
  }

  private async simulatedAnnealingOptimization(
    behavior: AgentBehavior,
    patterns: ExecutionPattern[],
  ): Promise<AgentBehavior> {
    let currentBehavior = { ...behavior };
    let bestBehavior = { ...behavior };
    let currentFitness = this.evaluateFitness(currentBehavior, patterns);
    let bestFitness = currentFitness;

    const initialTemperature = 100;
    const coolingRate = 0.95;
    let temperature = initialTemperature;

    for (let iteration = 0; iteration < this.config.maxIterations; iteration++) {
      // Generate neighbor solution
      const neighborBehavior = this.generateNeighbor(currentBehavior);
      const neighborFitness = this.evaluateFitness(neighborBehavior, patterns);

      // Accept or reject based on probability
      const deltaFitness = neighborFitness - currentFitness;
      const acceptanceProbability = deltaFitness > 0 ? 1 : Math.exp(deltaFitness / temperature);

      if (Math.random() < acceptanceProbability) {
        currentBehavior = neighborBehavior;
        currentFitness = neighborFitness;

        if (currentFitness > bestFitness) {
          bestBehavior = { ...currentBehavior };
          bestFitness = currentFitness;
        }
      }

      // Cool down
      temperature *= coolingRate;

      if (temperature < 0.01) break;
    }

    return bestBehavior;
  }

  private async bayesianOptimization(
    behavior: AgentBehavior,
    patterns: ExecutionPattern[],
  ): Promise<AgentBehavior> {
    // Simplified Bayesian optimization
    const candidates: AgentBehavior[] = [];
    const evaluations: number[] = [];

    // Generate initial candidates
    for (let i = 0; i < 20; i++) {
      const candidate = this.generateRandomBehavior(behavior);
      candidates.push(candidate);
      evaluations.push(this.evaluateFitness(candidate, patterns));
    }

    // Iteratively improve
    for (let iteration = 0; iteration < this.config.maxIterations / 5; iteration++) {
      // Find most promising candidate based on acquisition function
      const nextCandidate = this.selectNextCandidate(candidates, evaluations, behavior);
      const nextEvaluation = this.evaluateFitness(nextCandidate, patterns);

      candidates.push(nextCandidate);
      evaluations.push(nextEvaluation);
    }

    // Return best candidate
    const bestIndex = evaluations.indexOf(Math.max(...evaluations));
    return candidates[bestIndex];
  }

  private async reinforcementOptimization(
    behavior: AgentBehavior,
    patterns: ExecutionPattern[],
  ): Promise<AgentBehavior> {
    // Use Q-learning to optimize behavior parameters
    const stateActionValues = new Map<string, number>();
    let currentBehavior = { ...behavior };

    for (let episode = 0; episode < this.config.maxIterations / 10; episode++) {
      const state = this.behaviorToState(currentBehavior);
      const actions = this.generatePossibleActions(currentBehavior);

      // Select action using epsilon-greedy
      const action = this.selectAction(state, actions, stateActionValues);

      // Apply action to get new behavior
      const newBehavior = this.applyAction(currentBehavior, action);
      const reward =
        this.evaluateFitness(newBehavior, patterns) -
        this.evaluateFitness(currentBehavior, patterns);

      // Update Q-values
      const stateActionKey = `${state}_${action.id}`;
      const currentQ = stateActionValues.get(stateActionKey) || 0;
      const newQ =
        currentQ +
        0.1 *
          (reward +
            0.9 * this.getMaxQValue(this.behaviorToState(newBehavior), stateActionValues) -
            currentQ);
      stateActionValues.set(stateActionKey, newQ);

      currentBehavior = newBehavior;
    }

    return currentBehavior;
  }

  // Helper methods for optimization algorithms

  private createPopulation(baseBehavior: AgentBehavior, size: number): AgentBehavior[] {
    const population: AgentBehavior[] = [];

    for (let i = 0; i < size; i++) {
      population.push(this.generateRandomBehavior(baseBehavior));
    }

    return population;
  }

  private generateRandomBehavior(baseBehavior: AgentBehavior): AgentBehavior {
    const mutatedBehavior = JSON.parse(JSON.stringify(baseBehavior));

    // Randomly mutate parameters
    mutatedBehavior.parameters.taskSelection.preferredComplexity += (Math.random() - 0.5) * 0.2;
    mutatedBehavior.parameters.taskSelection.riskTolerance += (Math.random() - 0.5) * 0.2;
    mutatedBehavior.parameters.communication.frequency += (Math.random() - 0.5) * 0.2;
    mutatedBehavior.parameters.resourceManagement.memoryLimit += (Math.random() - 0.5) * 100;
    mutatedBehavior.parameters.learning.adaptationRate += (Math.random() - 0.5) * 0.1;

    // Clamp values to valid ranges
    mutatedBehavior.parameters.taskSelection.preferredComplexity = Math.max(
      0,
      Math.min(1, mutatedBehavior.parameters.taskSelection.preferredComplexity),
    );
    mutatedBehavior.parameters.taskSelection.riskTolerance = Math.max(
      0,
      Math.min(1, mutatedBehavior.parameters.taskSelection.riskTolerance),
    );
    mutatedBehavior.parameters.communication.frequency = Math.max(
      0,
      Math.min(1, mutatedBehavior.parameters.communication.frequency),
    );
    mutatedBehavior.parameters.learning.adaptationRate = Math.max(
      0.001,
      Math.min(0.5, mutatedBehavior.parameters.learning.adaptationRate),
    );

    return mutatedBehavior;
  }

  private evaluateFitness(behavior: AgentBehavior, patterns: ExecutionPattern[]): number {
    let fitness = 0;

    // Base fitness from current performance
    fitness += behavior.performance.efficiency * 0.3;
    fitness += behavior.performance.accuracy * 0.25;
    fitness += behavior.performance.reliability * 0.2;
    fitness += behavior.performance.collaboration * 0.15;
    fitness += behavior.performance.adaptability * 0.1;

    // Bonus from pattern matching
    const relevantPatterns = patterns.filter((p) => p.agentId === behavior.agentId);
    if (relevantPatterns.length > 0) {
      const avgConfidence =
        relevantPatterns.reduce((sum, p) => sum + p.confidence, 0) / relevantPatterns.length;
      fitness += avgConfidence * 0.2;
    }

    // Penalty for extreme parameter values
    const extremePenalty = this.calculateExtremePenalty(behavior);
    fitness -= extremePenalty;

    return Math.max(0, Math.min(1, fitness));
  }

  private calculateExtremePenalty(behavior: AgentBehavior): number {
    let penalty = 0;

    // Penalize extreme values that might cause instability
    if (behavior.parameters.learning.adaptationRate > 0.3) penalty += 0.1;
    if (behavior.parameters.learning.adaptationRate < 0.005) penalty += 0.1;
    if (behavior.parameters.communication.frequency > 0.9) penalty += 0.05;
    if (behavior.parameters.taskSelection.riskTolerance > 0.9) penalty += 0.05;

    return penalty;
  }

  private selectParents(population: AgentBehavior[], fitness: number[]): AgentBehavior[] {
    const parents: AgentBehavior[] = [];
    const tournamentSize = 3;

    for (let i = 0; i < population.length; i++) {
      // Tournament selection
      let bestIndex = Math.floor(Math.random() * population.length);
      let bestFitness = fitness[bestIndex];

      for (let j = 1; j < tournamentSize; j++) {
        const candidateIndex = Math.floor(Math.random() * population.length);
        if (fitness[candidateIndex] > bestFitness) {
          bestIndex = candidateIndex;
          bestFitness = fitness[candidateIndex];
        }
      }

      parents.push(population[bestIndex]);
    }

    return parents;
  }

  private crossover(parents: AgentBehavior[]): AgentBehavior[] {
    const offspring: AgentBehavior[] = [];

    for (let i = 0; i < parents.length - 1; i += 2) {
      const parent1 = parents[i];
      const parent2 = parents[i + 1];

      if (Math.random() < this.config.crossoverRate) {
        const child1 = this.createChild(parent1, parent2);
        const child2 = this.createChild(parent2, parent1);
        offspring.push(child1, child2);
      } else {
        offspring.push({ ...parent1 }, { ...parent2 });
      }
    }

    return offspring;
  }

  private createChild(parent1: AgentBehavior, parent2: AgentBehavior): AgentBehavior {
    const child = JSON.parse(JSON.stringify(parent1));

    // Mix parameters from both parents
    if (Math.random() < 0.5)
      child.parameters.taskSelection = { ...parent2.parameters.taskSelection };
    if (Math.random() < 0.5)
      child.parameters.communication = { ...parent2.parameters.communication };
    if (Math.random() < 0.5)
      child.parameters.resourceManagement = { ...parent2.parameters.resourceManagement };
    if (Math.random() < 0.5) child.parameters.coordination = { ...parent2.parameters.coordination };
    if (Math.random() < 0.5) child.parameters.learning = { ...parent2.parameters.learning };

    return child;
  }

  private mutate(population: AgentBehavior[]): void {
    population.forEach((individual) => {
      if (Math.random() < this.config.mutationRate) {
        // Mutate random parameter
        const mutations = [
          () =>
            (individual.parameters.taskSelection.preferredComplexity +=
              (Math.random() - 0.5) * 0.1),
          () => (individual.parameters.taskSelection.riskTolerance += (Math.random() - 0.5) * 0.1),
          () => (individual.parameters.communication.frequency += (Math.random() - 0.5) * 0.1),
          () => (individual.parameters.learning.adaptationRate += (Math.random() - 0.5) * 0.05),
          () =>
            (individual.parameters.resourceManagement.memoryLimit += (Math.random() - 0.5) * 50),
        ];

        const randomMutation = mutations[Math.floor(Math.random() * mutations.length)];
        randomMutation();

        // Clamp values
        individual.parameters.taskSelection.preferredComplexity = Math.max(
          0,
          Math.min(1, individual.parameters.taskSelection.preferredComplexity),
        );
        individual.parameters.taskSelection.riskTolerance = Math.max(
          0,
          Math.min(1, individual.parameters.taskSelection.riskTolerance),
        );
        individual.parameters.communication.frequency = Math.max(
          0,
          Math.min(1, individual.parameters.communication.frequency),
        );
        individual.parameters.learning.adaptationRate = Math.max(
          0.001,
          Math.min(0.5, individual.parameters.learning.adaptationRate),
        );
      }
    });
  }

  private selectSurvivors(
    parents: AgentBehavior[],
    offspring: AgentBehavior[],
    parentFitness: number[],
  ): AgentBehavior[] {
    const combined = [...parents, ...offspring];
    const combinedFitness = [
      ...parentFitness,
      ...offspring.map((individual) => this.evaluateFitness(individual, [])),
    ];

    // Sort by fitness
    const indexed = combined.map((individual, index) => ({
      individual,
      fitness: combinedFitness[index],
    }));
    indexed.sort((a, b) => b.fitness - a.fitness);

    // Return top individuals
    return indexed.slice(0, parents.length).map((item) => item.individual);
  }

  private calculateGradients(
    behavior: AgentBehavior,
    patterns: ExecutionPattern[],
  ): Record<string, number> {
    const gradients: Record<string, number> = {};
    const epsilon = 0.001;
    const baseFitness = this.evaluateFitness(behavior, patterns);

    // Calculate numerical gradients for key parameters
    const parameters = [
      'taskSelection.preferredComplexity',
      'taskSelection.riskTolerance',
      'communication.frequency',
      'learning.adaptationRate',
    ];

    parameters.forEach((param) => {
      const modifiedBehavior = JSON.parse(JSON.stringify(behavior));
      this.setNestedProperty(
        modifiedBehavior.parameters,
        param,
        this.getNestedProperty(modifiedBehavior.parameters, param) + epsilon,
      );

      const modifiedFitness = this.evaluateFitness(modifiedBehavior, patterns);
      gradients[param] = (modifiedFitness - baseFitness) / epsilon;
    });

    return gradients;
  }

  private applyGradients(
    behavior: AgentBehavior,
    gradients: Record<string, number>,
    learningRate: number,
  ): AgentBehavior {
    const updatedBehavior = JSON.parse(JSON.stringify(behavior));

    Object.entries(gradients).forEach(([param, gradient]) => {
      const currentValue = this.getNestedProperty(updatedBehavior.parameters, param);
      const newValue = currentValue + learningRate * gradient;
      this.setNestedProperty(updatedBehavior.parameters, param, newValue);
    });

    // Clamp values to valid ranges
    this.clampBehaviorParameters(updatedBehavior);

    return updatedBehavior;
  }

  private generateNeighbor(behavior: AgentBehavior): AgentBehavior {
    const neighbor = JSON.parse(JSON.stringify(behavior));

    // Make small random changes
    const changeAmount = 0.05;
    neighbor.parameters.taskSelection.preferredComplexity += (Math.random() - 0.5) * changeAmount;
    neighbor.parameters.taskSelection.riskTolerance += (Math.random() - 0.5) * changeAmount;
    neighbor.parameters.communication.frequency += (Math.random() - 0.5) * changeAmount;
    neighbor.parameters.learning.adaptationRate += (Math.random() - 0.5) * changeAmount * 0.5;

    this.clampBehaviorParameters(neighbor);
    return neighbor;
  }

  private selectNextCandidate(
    candidates: AgentBehavior[],
    evaluations: number[],
    baseBehavior: AgentBehavior,
  ): AgentBehavior {
    // Simplified acquisition function (exploration vs exploitation)
    const explorationCandidates = [];

    for (let i = 0; i < 10; i++) {
      const candidate = this.generateRandomBehavior(baseBehavior);
      const uncertainty = this.calculateUncertainty(candidate, candidates);
      const expectedImprovement = this.calculateExpectedImprovement(candidate, evaluations);
      const acquisitionValue = expectedImprovement + 0.1 * uncertainty;

      explorationCandidates.push({ candidate, acquisitionValue });
    }

    explorationCandidates.sort((a, b) => b.acquisitionValue - a.acquisitionValue);
    return explorationCandidates[0].candidate;
  }

  private calculateUncertainty(
    candidate: AgentBehavior,
    existingCandidates: AgentBehavior[],
  ): number {
    // Simple uncertainty based on distance to existing candidates
    if (existingCandidates.length === 0) return 1;

    const distances = existingCandidates.map((existing) =>
      this.calculateBehaviorDistance(candidate, existing),
    );
    return Math.min(...distances);
  }

  private calculateExpectedImprovement(_candidate: AgentBehavior, evaluations: number[]): number {
    if (evaluations.length === 0) return 0.5;

    const maxEvaluation = Math.max(...evaluations);
    const predictedValue = Math.random() * 0.5 + 0.25; // Simplified prediction

    return Math.max(0, predictedValue - maxEvaluation);
  }

  private behaviorToState(behavior: AgentBehavior): string {
    // Convert behavior to string representation for Q-learning
    return `${behavior.parameters.taskSelection.preferredComplexity.toFixed(2)}_${behavior.parameters.taskSelection.riskTolerance.toFixed(2)}_${behavior.parameters.communication.frequency.toFixed(2)}`;
  }

  private generatePossibleActions(_behavior: AgentBehavior): BehaviorAction[] {
    const actions: BehaviorAction[] = [];

    // Generate actions that modify behavior parameters
    const adjustments = [-0.1, -0.05, 0.05, 0.1];

    adjustments.forEach((adj) => {
      actions.push({
        id: `adjust_complexity_${adj}`,
        type: 'adjust_parameter',
        parameter: 'taskSelection.preferredComplexity',
        value: adj,
      });

      actions.push({
        id: `adjust_risk_${adj}`,
        type: 'adjust_parameter',
        parameter: 'taskSelection.riskTolerance',
        value: adj,
      });
    });

    return actions;
  }

  private selectAction(
    state: string,
    actions: BehaviorAction[],
    stateActionValues: Map<string, number>,
  ): BehaviorAction {
    const epsilon = 0.1;

    if (Math.random() < epsilon) {
      // Explore: random action
      return actions[Math.floor(Math.random() * actions.length)];
    } else {
      // Exploit: best action
      let bestAction = actions[0];
      let bestValue = stateActionValues.get(`${state}_${bestAction.id}`) || 0;

      actions.forEach((action) => {
        const value = stateActionValues.get(`${state}_${action.id}`) || 0;
        if (value > bestValue) {
          bestValue = value;
          bestAction = action;
        }
      });

      return bestAction;
    }
  }

  private applyAction(behavior: AgentBehavior, action: BehaviorAction): AgentBehavior {
    const newBehavior = JSON.parse(JSON.stringify(behavior));

    if (action.type === 'adjust_parameter') {
      const currentValue = this.getNestedProperty(newBehavior.parameters, action.parameter);
      this.setNestedProperty(newBehavior.parameters, action.parameter, currentValue + action.value);
    }

    this.clampBehaviorParameters(newBehavior);
    return newBehavior;
  }

  private getMaxQValue(state: string, stateActionValues: Map<string, number>): number {
    const stateKeys = Array.from(stateActionValues.keys()).filter((key) => key.startsWith(state));
    if (stateKeys.length === 0) return 0;

    const values = stateKeys.map((key) => stateActionValues.get(key) || 0);
    return Math.max(...values);
  }

  // Utility methods

  private createDefaultBehaviorParameters(
    initial?: Partial<BehaviorParameters>,
  ): BehaviorParameters {
    return {
      taskSelection: {
        preferredComplexity: 0.5,
        riskTolerance: 0.3,
        specialization: [],
        priorityWeights: { urgent: 0.8, important: 0.6, routine: 0.2 },
        loadBalancing: 0.5,
        ...initial?.taskSelection,
      },
      communication: {
        frequency: 0.5,
        verbosity: 0.3,
        protocols: ['direct', 'broadcast'],
        broadcastThreshold: 0.7,
        responseTimeout: 5000,
        ...initial?.communication,
      },
      resourceManagement: {
        memoryLimit: 512,
        cpuThreshold: 0.8,
        storageQuota: 1024,
        networkBandwidth: 100,
        resourceSharing: true,
        ...initial?.resourceManagement,
      },
      coordination: {
        leadershipStyle: 'democratic',
        consensusThreshold: 0.6,
        conflictResolution: 'mediation',
        collaborationLevel: 0.7,
        autonomyLevel: 0.5,
        ...initial?.coordination,
      },
      learning: {
        adaptationRate: 0.1,
        explorationRate: 0.2,
        memoryRetention: 0.8,
        transferLearning: true,
        continuousImprovement: true,
        ...initial?.learning,
      },
    };
  }

  private createDefaultPerformance(): BehaviorPerformance {
    return {
      efficiency: 0.5,
      accuracy: 0.5,
      reliability: 0.5,
      collaboration: 0.5,
      adaptability: 0.5,
      resourceUtilization: 0.5,
      taskCompletionRate: 0.5,
      errorRate: 0.1,
    };
  }

  private recordAdaptation(
    agentId: string,
    adaptationData: Omit<Adaptation, 'id' | 'timestamp'>,
  ): void {
    const behavior = this.agentBehaviors.get(agentId);
    if (!behavior) return;

    const adaptation: Adaptation = {
      id: `adaptation_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: Date.now(),
      ...adaptationData,
    };

    behavior.adaptations.push(adaptation);

    // Keep only recent adaptations
    if (behavior.adaptations.length > 50) {
      behavior.adaptations = behavior.adaptations.slice(-50);
    }

    this.emit('adaptation_recorded', { agentId, adaptation });
  }

  private calculateImprovement(original: AgentBehavior, optimized: AgentBehavior): number {
    const originalScore = this.calculateOverallPerformance(original);
    const optimizedScore = this.calculateOverallPerformance(optimized);

    return optimizedScore - originalScore;
  }

  private calculateOverallPerformance(behavior: AgentBehavior): number {
    const perf = behavior.performance;
    return (
      (perf.efficiency +
        perf.accuracy +
        perf.reliability +
        perf.collaboration +
        perf.adaptability) /
      5
    );
  }

  private extractAgentCriteria(patterns: ExecutionPattern[]): Record<string, any> {
    const criteria: Record<string, any> = {};

    // Analyze what makes agents successful for specific tasks
    const successfulAgents = patterns.filter((p) => p.metadata.success).map((p) => p.agentId);
    const uniqueAgents = [...new Set(successfulAgents)];

    if (uniqueAgents.length > 0) {
      criteria.preferredAgents = uniqueAgents;
      criteria.minExperience = Math.min(...patterns.map((p) => p.metadata.experience || 0));
      criteria.requiredSkills = this.extractRequiredSkills(patterns);
    }

    return criteria;
  }

  private extractRequiredSkills(patterns: ExecutionPattern[]): string[] {
    const skills = new Set<string>();

    patterns.forEach((pattern) => {
      if (pattern.metadata.skills && Array.isArray(pattern.metadata.skills)) {
        pattern.metadata.skills.forEach((skill: string) => skills.add(skill));
      }
    });

    return Array.from(skills);
  }

  private extractResourceConstraints(patterns: ExecutionPattern[]): Record<string, any> {
    const constraints: Record<string, any> = {};

    if (patterns.length > 0) {
      const memoryUsages = patterns.map((p) => p.metadata.memoryUsage || 0).filter((m) => m > 0);
      const cpuUsages = patterns.map((p) => p.metadata.cpuUsage || 0).filter((c) => c > 0);

      if (memoryUsages.length > 0) {
        constraints.maxMemory = Math.max(...memoryUsages) * 1.2; // 20% buffer
      }

      if (cpuUsages.length > 0) {
        constraints.maxCpu = Math.max(...cpuUsages) * 1.1; // 10% buffer
      }
    }

    return constraints;
  }

  private calculateOptimalFrequencies(patterns: ExecutionPattern[]): Record<string, number> {
    const frequencies: Record<string, number> = {};

    // Group by message type and calculate optimal frequencies
    const messageTypes = new Set(patterns.map((p) => p.metadata.messageType).filter(Boolean));

    messageTypes.forEach((messageType) => {
      const typePatterns = patterns.filter((p) => p.metadata.messageType === messageType);
      const avgInterval =
        typePatterns.reduce((sum, p) => sum + (p.metadata.interval || 1000), 0) /
        typePatterns.length;
      frequencies[messageType] = 1000 / avgInterval; // Convert to frequency
    });

    return frequencies;
  }

  private classifyMessageTypes(patterns: ExecutionPattern[]): Record<string, any> {
    const messageTypes: Record<string, any> = {};

    patterns.forEach((pattern) => {
      const msgType = pattern.metadata.messageType;
      if (msgType) {
        if (!messageTypes[msgType]) {
          messageTypes[msgType] = {
            count: 0,
            avgSize: 0,
            avgLatency: 0,
            priority: 'normal',
          };
        }

        messageTypes[msgType].count++;
        messageTypes[msgType].avgSize += pattern.metadata.messageSize || 0;
        messageTypes[msgType].avgLatency += pattern.metadata.latency || 0;
      }
    });

    // Finalize averages
    Object.values(messageTypes).forEach((type: any) => {
      type.avgSize /= type.count;
      type.avgLatency /= type.count;
    });

    return messageTypes;
  }

  private determineOptimalTopology(patterns: ExecutionPattern[]): string {
    // Analyze communication patterns to determine best topology
    const topologyScores = {
      mesh: 0,
      star: 0,
      ring: 0,
      tree: 0,
    };

    patterns.forEach((pattern) => {
      if (pattern.metadata.communicationPattern) {
        const pattern_type = pattern.metadata.communicationPattern;
        if (pattern_type === 'broadcast') topologyScores.mesh += pattern.confidence;
        if (pattern_type === 'centralized') topologyScores.star += pattern.confidence;
        if (pattern_type === 'sequential') topologyScores.ring += pattern.confidence;
        if (pattern_type === 'hierarchical') topologyScores.tree += pattern.confidence;
      }
    });

    return Object.entries(topologyScores).reduce(
      (best, [topology, score]) =>
        score > topologyScores[best as keyof typeof topologyScores] ? topology : best,
      'mesh',
    );
  }

  private calculateOptimalSyncFrequency(patterns: ExecutionPattern[]): number {
    const syncIntervals = patterns
      .map((p) => p.metadata.syncInterval)
      .filter(Boolean)
      .map(Number);

    if (syncIntervals.length === 0) return 5000; // Default 5 seconds

    const avgInterval =
      syncIntervals.reduce((sum, interval) => sum + interval, 0) / syncIntervals.length;
    return Math.max(1000, avgInterval * 0.8); // 20% more frequent than average
  }

  private getMostFrequent(items: string[]): string | null {
    if (items.length === 0) return null;

    const counts = new Map<string, number>();
    items.forEach((item) => {
      counts.set(item, (counts.get(item) || 0) + 1);
    });

    let mostFrequent = items[0];
    let maxCount = 0;

    counts.forEach((count, item) => {
      if (count > maxCount) {
        maxCount = count;
        mostFrequent = item;
      }
    });

    return mostFrequent;
  }

  private createBehaviorCluster(
    seed: AgentBehavior,
    behaviors: AgentBehavior[],
    visited: Set<string>,
  ): BehaviorCluster {
    const clusterBehaviors = [seed];
    visited.add(seed.agentId);

    behaviors.forEach((behavior) => {
      if (visited.has(behavior.agentId)) return;

      const similarity = this.calculateBehaviorSimilarity(seed, behavior);
      if (similarity > 0.7) {
        // Similarity threshold
        clusterBehaviors.push(behavior);
        visited.add(behavior.agentId);
      }
    });

    const centroid = this.calculateBehaviorCentroid(clusterBehaviors);
    const avgPerformance =
      clusterBehaviors.reduce((sum, b) => sum + this.calculateOverallPerformance(b), 0) /
      clusterBehaviors.length;
    const stability = this.calculateClusterStability(clusterBehaviors);

    return {
      id: `cluster_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      behaviors: clusterBehaviors,
      centroid,
      characteristics: this.extractClusterCharacteristics(clusterBehaviors),
      performance: avgPerformance,
      stability,
    };
  }

  private calculateBehaviorSimilarity(b1: AgentBehavior, b2: AgentBehavior): number {
    let similarity = 0;
    let factors = 0;

    // Compare task selection parameters
    similarity +=
      1 -
      Math.abs(
        b1.parameters.taskSelection.preferredComplexity -
          b2.parameters.taskSelection.preferredComplexity,
      );
    similarity +=
      1 -
      Math.abs(
        b1.parameters.taskSelection.riskTolerance - b2.parameters.taskSelection.riskTolerance,
      );
    factors += 2;

    // Compare communication parameters
    similarity +=
      1 - Math.abs(b1.parameters.communication.frequency - b2.parameters.communication.frequency);
    factors += 1;

    // Compare learning parameters
    similarity +=
      1 - Math.abs(b1.parameters.learning.adaptationRate - b2.parameters.learning.adaptationRate);
    factors += 1;

    return similarity / factors;
  }

  private calculateBehaviorDistance(b1: AgentBehavior, b2: AgentBehavior): number {
    return 1 - this.calculateBehaviorSimilarity(b1, b2);
  }

  private calculateBehaviorCentroid(behaviors: AgentBehavior[]): AgentBehavior {
    const centroid = JSON.parse(JSON.stringify(behaviors[0]));

    // Average all numerical parameters
    centroid.parameters.taskSelection.preferredComplexity =
      behaviors.reduce((sum, b) => sum + b.parameters.taskSelection.preferredComplexity, 0) /
      behaviors.length;

    centroid.parameters.taskSelection.riskTolerance =
      behaviors.reduce((sum, b) => sum + b.parameters.taskSelection.riskTolerance, 0) /
      behaviors.length;

    centroid.parameters.communication.frequency =
      behaviors.reduce((sum, b) => sum + b.parameters.communication.frequency, 0) /
      behaviors.length;

    centroid.parameters.learning.adaptationRate =
      behaviors.reduce((sum, b) => sum + b.parameters.learning.adaptationRate, 0) /
      behaviors.length;

    // Average performance metrics
    Object.keys(centroid.performance).forEach((key) => {
      centroid.performance[key as keyof BehaviorPerformance] =
        behaviors.reduce((sum, b) => sum + b.performance[key as keyof BehaviorPerformance], 0) /
        behaviors.length;
    });

    centroid.agentId = `centroid_${Date.now()}`;
    return centroid;
  }

  private calculateClusterStability(behaviors: AgentBehavior[]): number {
    if (behaviors.length <= 1) return 1;

    const centroid = this.calculateBehaviorCentroid(behaviors);
    const distances = behaviors.map((b) => this.calculateBehaviorDistance(b, centroid));
    const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;
    const maxDistance = Math.max(...distances);

    return maxDistance > 0 ? 1 - avgDistance / maxDistance : 1;
  }

  private extractClusterCharacteristics(behaviors: AgentBehavior[]): string[] {
    const characteristics: string[] = [];

    const avgComplexity =
      behaviors.reduce((sum, b) => sum + b.parameters.taskSelection.preferredComplexity, 0) /
      behaviors.length;
    const avgRisk =
      behaviors.reduce((sum, b) => sum + b.parameters.taskSelection.riskTolerance, 0) /
      behaviors.length;
    const avgCommunication =
      behaviors.reduce((sum, b) => sum + b.parameters.communication.frequency, 0) /
      behaviors.length;

    if (avgComplexity > 0.7) characteristics.push('high_complexity_preference');
    if (avgComplexity < 0.3) characteristics.push('low_complexity_preference');
    if (avgRisk > 0.7) characteristics.push('risk_tolerant');
    if (avgRisk < 0.3) characteristics.push('risk_averse');
    if (avgCommunication > 0.7) characteristics.push('highly_communicative');
    if (avgCommunication < 0.3) characteristics.push('low_communication');

    return characteristics;
  }

  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private setNestedProperty(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => current[key], obj);
    target[lastKey] = value;
  }

  private clampBehaviorParameters(behavior: AgentBehavior): void {
    behavior.parameters.taskSelection.preferredComplexity = Math.max(
      0,
      Math.min(1, behavior.parameters.taskSelection.preferredComplexity),
    );
    behavior.parameters.taskSelection.riskTolerance = Math.max(
      0,
      Math.min(1, behavior.parameters.taskSelection.riskTolerance),
    );
    behavior.parameters.communication.frequency = Math.max(
      0,
      Math.min(1, behavior.parameters.communication.frequency),
    );
    behavior.parameters.learning.adaptationRate = Math.max(
      0.001,
      Math.min(0.5, behavior.parameters.learning.adaptationRate),
    );
  }

  private initializeOptimizationStrategies(): void {
    this.optimizationStrategies.set('genetic', {
      id: 'genetic',
      name: 'Genetic Algorithm',
      type: 'genetic',
      objective: 'maximize_overall_performance',
      constraints: { maxIterations: 100 },
      parameters: { populationSize: 50, mutationRate: 0.1, crossoverRate: 0.8 },
    });

    this.optimizationStrategies.set('gradient_descent', {
      id: 'gradient_descent',
      name: 'Gradient Descent',
      type: 'gradient_descent',
      objective: 'minimize_loss',
      constraints: { maxIterations: 200 },
      parameters: { learningRate: 0.01, momentum: 0.9 },
    });

    this.optimizationStrategies.set('simulated_annealing', {
      id: 'simulated_annealing',
      name: 'Simulated Annealing',
      type: 'simulated_annealing',
      objective: 'global_optimization',
      constraints: { maxIterations: 500 },
      parameters: { initialTemperature: 100, coolingRate: 0.95 },
    });

    this.optimizationStrategies.set('bayesian', {
      id: 'bayesian',
      name: 'Bayesian Optimization',
      type: 'bayesian',
      objective: 'efficient_exploration',
      constraints: { maxEvaluations: 100 },
      parameters: { acquisitionFunction: 'expected_improvement', kernel: 'gaussian' },
    });

    this.optimizationStrategies.set('reinforcement', {
      id: 'reinforcement',
      name: 'Reinforcement Learning',
      type: 'reinforcement',
      objective: 'maximize_reward',
      constraints: { maxEpisodes: 1000 },
      parameters: { learningRate: 0.1, discountFactor: 0.95, explorationRate: 0.1 },
    });
  }

  private startContinuousOptimization(): void {
    setInterval(() => {
      this.performBatchOptimization();
    }, this.config.optimizationInterval);
  }

  private async performBatchOptimization(): Promise<void> {
    const recommendations = this.getOptimizationRecommendations();

    // Process high-priority recommendations
    const highPriority = recommendations.filter((rec) => rec.priority === 'high').slice(0, 3);

    for (const rec of highPriority) {
      try {
        // This would typically use actual execution patterns
        await this.optimizeAgentBehavior(rec.agentId, [], rec.suggestedStrategy);
      } catch (error) {
        this.emit('optimization_error', { agentId: rec.agentId, error });
      }
    }
  }

  // Public getters and utilities

  getAgentBehavior(agentId: string): AgentBehavior | undefined {
    return this.agentBehaviors.get(agentId);
  }

  getAllBehaviors(): AgentBehavior[] {
    return Array.from(this.agentBehaviors.values());
  }

  getBehaviorClusters(): BehaviorCluster[] {
    return Array.from(this.behaviorClusters.values());
  }

  getOptimizationHistory(): OptimizationResult[] {
    return [...this.optimizationHistory];
  }

  getOptimizationStrategies(): OptimizationStrategy[] {
    return Array.from(this.optimizationStrategies.values());
  }
}

// Supporting interfaces and types

interface BehavioralOptimizationConfig {
  optimizationInterval?: number;
  maxBehaviors?: number;
  convergenceThreshold?: number;
  maxIterations?: number;
  mutationRate?: number;
  crossoverRate?: number;
  populationSize?: number;
  elitismRate?: number;
}

interface TaskAllocationStrategy {
  id: string;
  swarmId: string;
  rules: AllocationRule[];
  weightings: Record<string, number>;
  constraints: Record<string, any>;
  performance: number;
}

interface AllocationRule {
  condition: string;
  action: string;
  priority: number;
  agentCriteria: Record<string, any>;
}

interface CommunicationOptimization {
  swarmId: string;
  protocols: string[];
  frequencies: Record<string, number>;
  messageTypes: Record<string, any>;
  networkTopology: string;
  latencyTargets: Record<string, number>;
  throughputTargets: Record<string, number>;
}

interface ResourceAllocationStrategy {
  id: string;
  allocations: Record<string, number>;
  thresholds: Record<string, any>;
  scalingRules: ScalingRule[];
  priorities: Record<string, number>;
  constraints: Record<string, any>;
}

interface ScalingRule {
  resource: string;
  condition: string;
  action: string;
  factor: number;
}

interface CoordinationStrategy {
  swarmId: string;
  leadershipModel: string;
  decisionMaking: string;
  conflictResolution: string;
  synchronization: Record<string, any>;
  coordination: Record<string, any>;
  adaptation: Record<string, any>;
}

interface OptimizationRecommendation {
  type: string;
  agentId: string;
  priority: 'high' | 'medium' | 'low';
  description: string;
  suggestedStrategy: string;
  expectedImprovement: number;
}

interface BehaviorAction {
  id: string;
  type: string;
  parameter: string;
  value: number;
}

export default BehavioralOptimization;
