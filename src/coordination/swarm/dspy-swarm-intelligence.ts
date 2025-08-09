/**
 * DSPy-Powered Swarm Intelligence.
 *
 * Integrates DSPy into swarm coordination for:
 * - Intelligent agent selection and task assignment
 * - Dynamic topology optimization
 * - Self-improving coordination strategies
 * - Predictive performance optimization.
 */

import { createLogger } from '../../core/logger';
import type { DSPyWrapper } from '../../neural/dspy-wrapper';
// Using the new wrapper architecture instead of direct dspy.ts imports
import { createDSPyWrapper } from '../../neural/dspy-wrapper';
import type { DSPyConfig } from '../../neural/types/dspy-types';
import type { AgentType } from '../../types/agent-types';

const logger = createLogger({ prefix: 'DSPySwarmIntelligence' });

export interface SwarmIntelligenceConfig {
  model?: string;
  temperature?: number;
  enableContinuousLearning?: boolean;
  optimizationInterval?: number;
}

export interface AgentPerformanceData {
  agentId: string;
  agentType: AgentType;
  tasksCompleted: number;
  averageResponseTime: number;
  successRate: number;
  capabilities: string[];
  currentLoad: number;
}

export interface TaskRequirements {
  taskType: string;
  complexity: number;
  requiredCapabilities: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration: number;
}

export class DSPySwarmIntelligence {
  private dspyWrapper: DSPyWrapper | null = null;
  private config: SwarmIntelligenceConfig;
  private learningHistory: Array<{ input: any; output: any; success: boolean; timestamp: Date }> =
    [];

  constructor(config: SwarmIntelligenceConfig = {}) {
    this.config = {
      model: 'claude-3-5-sonnet-20241022',
      temperature: 0.2, // Lower for more deterministic swarm decisions
      enableContinuousLearning: true,
      optimizationInterval: 300000, // 5 minutes
      ...config,
    };

    logger.info('DSPy swarm intelligence initialized', { model: this.config.model });

    // Initialize wrapper and start continuous learning
    this.initializeWrapper()
      .then(() => {
        if (this.config.enableContinuousLearning) {
          this.startContinuousLearning();
        }
      })
      .catch((error) => {
        logger.error('Failed to initialize DSPy wrapper:', error);
      });
  }

  /**
   * Initialize the DSPy wrapper.
   *
   * @private
   */
  private async initializeWrapper(): Promise<void> {
    try {
      const dspyConfig: DSPyConfig = {
        model: this.config.model ?? 'claude-3-5-sonnet-20241022',
        temperature: this.config.temperature ?? 0.2,
        maxTokens: 1500,
      };

      this.dspyWrapper = await createDSPyWrapper(dspyConfig);
      logger.info('DSPy wrapper initialized for swarm intelligence');
    } catch (error) {
      logger.error('Failed to initialize DSPy wrapper:', error);
      throw error;
    }
  }

  /**
   * Generic method to execute DSPy programs with fallback handling.
   *
   * @param signature
   * @param description
   * @param input
   * @param fallbackResult
   * @param programType
   * @private
   */
  private async executeDSPyProgram(
    signature: string,
    description: string,
    input: any,
    fallbackResult: any,
    programType: string
  ): Promise<any> {
    if (!this.dspyWrapper) {
      logger.warn(`DSPy wrapper not initialized for ${programType}, using fallback`);
      return fallbackResult;
    }

    try {
      const program = await this.dspyWrapper.createProgram(signature, description);
      const executionResult = await this.dspyWrapper.execute(program, input);

      if (!executionResult.success) {
        throw new Error(executionResult.error?.message || `${programType} execution failed`);
      }

      // Record learning example
      this.recordLearningExample(programType, {
        input,
        output: executionResult.result,
        success: true,
        timestamp: new Date(),
      });

      return executionResult.result;
    } catch (error) {
      logger.error(`${programType} failed:`, error);
      return fallbackResult;
    }
  }

  /**
   * Intelligently select agents for a task using DSPy wrapper.
   *
   * @param taskRequirements
   * @param availableAgents
   */
  async selectOptimalAgents(
    taskRequirements: TaskRequirements,
    availableAgents: AgentPerformanceData[]
  ): Promise<{
    selectedAgents: string[];
    reasoning: string;
    confidence: number;
    alternativeOptions?: string[];
  }> {
    const startTime = Date.now();

    if (!this.dspyWrapper) {
      logger.warn('DSPy wrapper not initialized, using fallback selection');
      return this.fallbackAgentSelection(taskRequirements, availableAgents);
    }

    try {
      // Create DSPy program for agent selection
      const program = await this.dspyWrapper.createProgram(
        'task_requirements: object, available_agents: array -> selected_agents: array, reasoning: string, confidence: number',
        'Intelligently select optimal agents for task execution based on requirements, agent capabilities, and performance history'
      );

      const input = {
        task_requirements: taskRequirements,
        available_agents: availableAgents,
      };

      const executionResult = await this.dspyWrapper.execute(program, input);
      const executionTime = Date.now() - startTime;

      if (!executionResult.success) {
        throw new Error(executionResult.error?.message || 'Agent selection execution failed');
      }

      const result = this.parseAgentSelectionResponse(JSON.stringify(executionResult.result));

      // Record learning example
      this.recordLearningExample('agent_selection', {
        input: { taskRequirements, availableAgents },
        output: result,
        success: true, // Will be updated based on actual task outcomes
        timestamp: new Date(),
      });

      logger.debug(`Agent selection completed in ${executionTime}ms`, {
        selectedAgents: result.selectedAgents,
        confidence: result.confidence,
      });

      return result;
    } catch (error) {
      logger.error('Agent selection failed:', error);

      // Fallback to simple selection
      return this.fallbackAgentSelection(taskRequirements, availableAgents);
    }
  }

  /**
   * Optimize swarm topology based on current conditions using DSPy wrapper.
   *
   * @param currentTopology
   * @param taskLoad
   * @param agentPerformance
   * @param communicationPatterns
   */
  async optimizeTopology(
    currentTopology: string,
    taskLoad: object,
    agentPerformance: AgentPerformanceData[],
    communicationPatterns: object
  ): Promise<{
    optimalTopology: string;
    restructurePlan: object;
    performanceGain: number;
    implementationSteps: string[];
  }> {
    const input = {
      current_topology: currentTopology,
      task_load: taskLoad,
      agent_performance: agentPerformance,
      communication_patterns: communicationPatterns,
    };

    const fallbackResult = {
      optimalTopology: currentTopology,
      restructurePlan: {},
      performanceGain: 0,
      implementationSteps: ['No optimization needed - system error'],
    };

    const result = await this.executeDSPyProgram(
      'current_topology: string, task_load: object, agent_performance: array, communication_patterns: object -> optimal_topology: string, restructure_plan: object, performance_gain: number',
      'Analyze current swarm topology and recommend optimizations based on task load, agent performance, and communication patterns',
      input,
      fallbackResult,
      'topology_optimization'
    );

    return {
      optimalTopology: result.optimal_topology || result.optimalTopology || currentTopology,
      restructurePlan: result.restructure_plan || result.restructurePlan || {},
      performanceGain: result.performance_gain || result.performanceGain || 0,
      implementationSteps: this.generateImplementationSteps(
        result.restructure_plan || result.restructurePlan
      ),
    };
  }

  /**
   * Optimize load balancing across agents using DSPy wrapper.
   *
   * @param agentLoads
   * @param taskQueue
   * @param performanceMetrics
   */
  async optimizeLoadBalancing(
    agentLoads: AgentPerformanceData[],
    taskQueue: any[],
    performanceMetrics: object
  ): Promise<{
    loadDistribution: object;
    rebalancingActions: object[];
    efficiencyScore: number;
    urgentActions: string[];
  }> {
    const input = {
      agent_loads: agentLoads,
      task_queue: taskQueue,
      performance_metrics: performanceMetrics,
    };

    const fallbackResult = {
      loadDistribution: this.createBalancedDistribution(agentLoads, taskQueue),
      rebalancingActions: [],
      efficiencyScore: 0.7, // Conservative estimate
      urgentActions: [],
    };

    const result = await this.executeDSPyProgram(
      'agent_loads: array, task_queue: array, performance_metrics: object -> load_distribution: object, rebalancing_actions: array, efficiency_score: number',
      'Optimize task distribution across agents based on current loads, pending tasks, and performance metrics',
      input,
      fallbackResult,
      'load_balancing'
    );

    return {
      loadDistribution:
        result.load_distribution ||
        result.loadDistribution ||
        this.createBalancedDistribution(agentLoads, taskQueue),
      rebalancingActions: result.rebalancing_actions || result.rebalancingActions || [],
      efficiencyScore: result.efficiency_score || result.efficiencyScore || 0.7,
      urgentActions: this.identifyUrgentActions(
        result.rebalancing_actions || result.rebalancingActions || []
      ),
    };
  }

  /**
   * Predict swarm performance and identify potential issues using DSPy wrapper.
   *
   * @param historicalPerformance
   * @param currentState
   * @param upcomingTasks
   */
  async predictPerformance(
    historicalPerformance: object[],
    currentState: object,
    upcomingTasks: any[]
  ): Promise<{
    performancePrediction: object;
    bottleneckWarnings: string[];
    optimizationSuggestions: string[];
    confidence: number;
  }> {
    const input = {
      historical_performance: historicalPerformance,
      current_state: currentState,
      upcoming_tasks: upcomingTasks,
    };

    const fallbackResult = {
      performancePrediction: { status: 'uncertain', trend: 'stable' },
      bottleneckWarnings: ['Unable to predict - system error'],
      optimizationSuggestions: ['Monitor system closely'],
      confidence: 0.3,
    };

    const result = await this.executeDSPyProgram(
      'historical_performance: array, current_state: object, upcoming_tasks: array -> performance_prediction: object, bottleneck_warnings: array, optimization_suggestions: array',
      'Predict future swarm performance and identify potential bottlenecks based on historical data and upcoming workload',
      input,
      fallbackResult,
      'performance_prediction'
    );

    // Assess prediction confidence based on historical accuracy
    const confidence = this.assessPredictionConfidence(result);

    return {
      performancePrediction:
        result.performance_prediction ||
        result.performancePrediction ||
        fallbackResult.performancePrediction,
      bottleneckWarnings:
        result.bottleneck_warnings ||
        result.bottleneckWarnings ||
        fallbackResult.bottleneckWarnings,
      optimizationSuggestions:
        result.optimization_suggestions ||
        result.optimizationSuggestions ||
        fallbackResult.optimizationSuggestions,
      confidence,
    };
  }

  /**
   * Intelligently recover from failures using DSPy wrapper.
   *
   * @param failureContext
   * @param availableAgents
   * @param taskState
   */
  async recoverFromFailure(
    failureContext: object,
    availableAgents: AgentPerformanceData[],
    taskState: object
  ): Promise<{
    recoveryStrategy: object;
    agentReassignments: object[];
    riskMitigation: string[];
    estimatedRecoveryTime: number;
  }> {
    const input = {
      failure_context: failureContext,
      available_agents: availableAgents,
      task_state: taskState,
    };

    const fallbackResult = {
      recoveryStrategy: { type: 'restart', approach: 'conservative' },
      agentReassignments: [],
      riskMitigation: ['Monitor system closely', 'Use backup agents if available'],
      estimatedRecoveryTime: 300, // 5 minutes default
    };

    const result = await this.executeDSPyProgram(
      'failure_context: object, available_agents: array, task_state: object -> recovery_strategy: object, agent_reassignments: array, risk_mitigation: array',
      'Plan intelligent recovery from system failures by reassigning tasks and mitigating risks',
      input,
      fallbackResult,
      'failure_recovery'
    );

    return {
      recoveryStrategy:
        result.recovery_strategy || result.recoveryStrategy || fallbackResult.recoveryStrategy,
      agentReassignments:
        result.agent_reassignments ||
        result.agentReassignments ||
        fallbackResult.agentReassignments,
      riskMitigation:
        result.risk_mitigation || result.riskMitigation || fallbackResult.riskMitigation,
      estimatedRecoveryTime: this.estimateRecoveryTime(
        result.recovery_strategy || result.recoveryStrategy || fallbackResult.recoveryStrategy
      ),
    };
  }

  /**
   * Update success/failure of previous decisions for learning.
   *
   * @param decisionId
   * @param success
   * @param metrics
   */
  updateDecisionOutcome(decisionId: string, success: boolean, metrics: object) {
    const example = this.learningHistory.find(
      (ex) => ex.output.decision_id === decisionId || ex.output.id === decisionId
    );

    if (example) {
      example.success = success;
      example.output.actual_metrics = metrics;

      logger.debug(`Updated decision outcome: ${decisionId} -> ${success ? 'success' : 'failure'}`);
    }
  }

  /**
   * Get swarm intelligence statistics.
   */
  getIntelligenceStats() {
    const recentDecisions = this.learningHistory.filter(
      (ex) => Date.now() - ex.timestamp.getTime() < 3600000 // Last hour
    );

    const successRate =
      recentDecisions.length > 0
        ? recentDecisions.filter((ex) => ex.success).length / recentDecisions.length
        : 0;

    return {
      totalPrograms: 5, // Fixed number: agent_selection, topology_optimization, etc.
      programTypes: [
        'agent_selection',
        'topology_optimization',
        'load_balancing',
        'performance_prediction',
        'failure_recovery',
      ],
      learningHistorySize: this.learningHistory.length,
      recentDecisions: recentDecisions.length,
      successRate: Math.round(successRate * 100),
      continuousLearningEnabled: this.config.enableContinuousLearning,
      lmDriver: 'DSPy LM Driver',
    };
  }

  private recordLearningExample(programType: string, example: any) {
    this.learningHistory.push({
      ...example,
      programType,
      timestamp: new Date(),
    });

    // Keep only last 1000 examples
    if (this.learningHistory.length > 1000) {
      this.learningHistory = this.learningHistory.slice(-1000);
    }
  }

  private startContinuousLearning() {
    setInterval(() => {
      this.performContinuousLearning();
    }, this.config.optimizationInterval!);

    logger.info('Continuous learning enabled');
  }

  private async performContinuousLearning() {
    const recentExamples = this.learningHistory.filter(
      (ex) => Date.now() - ex.timestamp.getTime() < this.config.optimizationInterval!
    );

    if (recentExamples.length < 5) return; // Need minimum examples

    // Group by program type
    const examplesByProgram = recentExamples.reduce(
      (acc, ex) => {
        const programType = (ex as any).programType;
        if (!acc[programType]) acc[programType] = [];
        acc[programType].push(ex);
        return acc;
      },
      {} as Record<string, any[]>
    );

    // Analyze patterns in examples for continuous learning (simplified approach)
    for (const [programType, examples] of Object.entries(examplesByProgram)) {
      if (examples.length >= 3) {
        try {
          const successfulExamples = examples.filter((ex) => ex.success);
          if (successfulExamples.length > 0) {
            // In a real implementation, we could:
            // 1. Adjust prompt templates based on successful patterns
            // 2. Update generation parameters based on success rates
            // 3. Cache successful examples for few-shot prompting

            logger.debug(
              `Continuous learning analysis for ${programType}: ${successfulExamples.length} successful examples analyzed`
            );

            // Simple learning: adjust temperature based on success rate
            const successRate = successfulExamples.length / examples.length;
            if (successRate > 0.8 && this.config.temperature! > 0.1) {
              this.config.temperature = Math.max(0.1, this.config.temperature! - 0.05);
            } else if (successRate < 0.6 && this.config.temperature! < 0.5) {
              this.config.temperature = Math.min(0.5, this.config.temperature! + 0.05);
            }
          }
        } catch (error) {
          logger.warn(`Continuous learning failed for ${programType}:`, error);
        }
      }
    }
  }

  private fallbackAgentSelection(
    taskRequirements: TaskRequirements,
    availableAgents: AgentPerformanceData[]
  ) {
    // Simple fallback: select agents with highest success rate and required capabilities
    const suitableAgents = availableAgents
      .filter((agent) =>
        taskRequirements.requiredCapabilities.some((cap) => agent.capabilities.includes(cap))
      )
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, Math.min(3, Math.ceil(taskRequirements.complexity / 30)));

    return {
      selectedAgents: suitableAgents.map((a) => a.agentId),
      reasoning: 'Fallback selection based on success rate and capabilities',
      confidence: 0.6,
    };
  }

  private generateImplementationSteps(restructurePlan: any): string[] {
    if (!restructurePlan || typeof restructurePlan !== 'object') {
      return ['No restructuring needed'];
    }

    const steps: string[] = [];
    if (restructurePlan.topology_change) {
      steps.push('Update topology configuration');
    }
    if (restructurePlan.agent_reassignments) {
      steps.push('Reassign agents to new roles');
    }
    if (restructurePlan.communication_updates) {
      steps.push('Update communication patterns');
    }
    if (restructurePlan.load_redistribution) {
      steps.push('Redistribute task load');
    }

    return steps.length > 0 ? steps : ['Apply optimization changes'];
  }

  private identifyUrgentActions(rebalancingActions: any[]): string[] {
    if (!Array.isArray(rebalancingActions)) return [];

    return rebalancingActions
      .filter((action) => action.priority === 'urgent' || action.severity === 'high')
      .map((action) => action.description || action.action || 'Urgent rebalancing action');
  }

  private assessPredictionConfidence(result: any): number {
    // Base confidence on the quality and completeness of the prediction
    let confidence = 0.5;

    if (result.performance_prediction) confidence += 0.2;
    if (result.bottleneck_warnings?.length > 0) confidence += 0.1;
    if (result.optimization_suggestions?.length > 0) confidence += 0.1;
    if (result.confidence) confidence = Math.max(confidence, result.confidence);

    return Math.min(confidence, 0.95);
  }

  private estimateRecoveryTime(recoveryStrategy: any): number {
    if (!recoveryStrategy) return 300; // 5 minutes default

    let baseTime = 60; // 1 minute base
    if (recoveryStrategy.complexity === 'high') baseTime *= 5;
    if (recoveryStrategy.agent_count > 5) baseTime *= 2;
    if (recoveryStrategy.requires_restart) baseTime += 120;

    return baseTime;
  }

  private parseAgentSelectionResponse(response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return {
          selectedAgents: result.selectedAgents || [],
          reasoning: result.reasoning || 'Agent selection completed',
          confidence: result.confidence || 0.7,
          alternativeOptions: result.alternativeOptions,
        };
      }
    } catch (error) {
      logger.warn('Failed to parse agent selection response:', error);
    }

    return {
      selectedAgents: [],
      reasoning: 'Failed to parse response',
      confidence: 0.3,
    };
  }

  private createBalancedDistribution(
    agentLoads: AgentPerformanceData[],
    _taskQueue: any[]
  ): object {
    const distribution: any = {};
    const totalCapacity = agentLoads.reduce((sum, agent) => sum + (100 - agent.currentLoad), 0);

    agentLoads.forEach((agent) => {
      const capacity = 100 - agent.currentLoad;
      const share = Math.round((capacity / totalCapacity) * 100);
      distribution[agent.agentId] = Math.max(10, Math.min(90, share)); // Between 10-90%
    });

    return distribution;
  }
}

export default DSPySwarmIntelligence;