/**
 * Learning Coordinator
 *
 * Coordinates learning across multiple agents in the swarm, manages knowledge
 * sharing, tracks expertise evolution, and identifies best practices and anti-patterns.
 */

import { EventEmitter } from 'node:events';
import type { ILogger } from '../../di/index';
import { CORE_TOKENS, inject, injectable } from '../../di/index';
import type {
  AdaptiveLearningConfig,
  Agent,
  AntiPattern,
  BestPractice,
  ExpertiseEvolution,
  FailurePattern,
  LearningCoordinator as ILearningCoordinator,
  KnowledgeUpdate,
  LearningMetadata,
  LearningResult,
  LearningType,
  Pattern,
  PerformanceImprovement,
  SuccessPattern,
  SystemContext,
} from './types';

@injectable
export class LearningCoordinator extends EventEmitter implements ILearningCoordinator {
  private agents = new Map<string, Agent>();
  private knowledgeBase = new Map<string, any>();
  private expertiseTracking = new Map<string, ExpertiseEvolution>();
  private bestPractices = new Map<string, BestPractice>();
  private antiPatterns = new Map<string, AntiPattern>();
  private learningHistory = new Map<string, LearningResult[]>();
  private config: AdaptiveLearningConfig;
  private context: SystemContext;

  constructor(
    config: AdaptiveLearningConfig,
    context: SystemContext,
    @inject(CORE_TOKENS.Logger) private _logger: ILogger,
  ) {
    super();
    this.config = config;
    this.context = context;
    this.startLearningCoordination();
  }

  /**
   * Coordinate learning across multiple agents
   *
   * @param agents
   */
  async coordinateLearning(agents: Agent[]): Promise<LearningResult> {
    // Update agent registry
    for (const agent of agents) {
      this.agents.set(agent.id, agent);
    }

    // Determine learning strategy based on agents and context
    const learningStrategy = this.determineLearningStrategy(agents);

    // Execute coordinated learning
    const learningResults = await this.executeLearning(agents, learningStrategy);

    // Aggregate and synthesize results
    const aggregatedResult = this.aggregateLearningResults(learningResults);

    // Update knowledge base with new learnings
    await this.updateKnowledgeBase(aggregatedResult.patterns);

    // Track learning progress
    this.trackLearningProgress(agents, aggregatedResult);

    this.emit('learningCompleted', {
      agents: agents.map((a) => a.id),
      result: aggregatedResult,
      timestamp: Date.now(),
    });

    return aggregatedResult;
  }

  /**
   * Update the knowledge base with new patterns
   *
   * @param patterns
   */
  async updateKnowledgeBase(patterns: Pattern[]): Promise<void> {
    for (const pattern of patterns) {
      const existing = this.knowledgeBase.get(pattern.id);

      if (existing) {
        // Update existing pattern with new insights
        const updated = this.mergePatterns(existing, pattern);
        this.knowledgeBase.set(pattern.id, updated);

        this.emit('knowledgeUpdated', {
          patternId: pattern.id,
          type: 'updated',
          confidence: updated.confidence,
          timestamp: Date.now(),
        });
      } else {
        // Add new pattern
        this.knowledgeBase.set(pattern.id, pattern);

        this.emit('knowledgeAdded', {
          patternId: pattern.id,
          type: pattern.type,
          confidence: pattern.confidence,
          timestamp: Date.now(),
        });
      }
    }

    // Prune outdated or low-confidence patterns
    this.pruneKnowledgeBase();

    // Distribute knowledge updates to relevant agents
    await this.distributeKnowledgeUpdates(patterns);
  }

  /**
   * Track expertise evolution for an agent
   *
   * @param agentId
   */
  trackExpertiseEvolution(agentId: string): ExpertiseEvolution {
    if (!this.expertiseTracking.has(agentId)) {
      this.initializeExpertiseTracking(agentId);
    }

    const expertise = this.expertiseTracking.get(agentId)!;
    const agent = this.agents.get(agentId);

    if (agent) {
      // Update expertise based on recent performance
      this.updateExpertiseMetrics(expertise, agent);

      // Identify growth areas and specializations
      this.identifyGrowthOpportunities(expertise, agent);

      // Update learning recommendations
      this.updateLearningRecommendations(expertise, agent);
    }

    return expertise;
  }

  /**
   * Emerge best practices from successful patterns
   *
   * @param successes
   */
  emergeBestPractices(successes: SuccessPattern[]): BestPractice[] {
    const practices: BestPractice[] = [];

    // Group successes by category and context
    const groupedSuccesses = this.groupSuccessesByCategory(successes);

    for (const [category, categorySuccesses] of groupedSuccesses) {
      // Analyze common patterns in successful executions
      const commonPatterns = this.findCommonPatterns(categorySuccesses);

      // Extract actionable practices
      for (const pattern of commonPatterns) {
        const practice = this.extractBestPractice(category, pattern, categorySuccesses);

        if (practice.confidence >= this.config.learning.adaptationRate) {
          practices.push(practice);
          this.bestPractices.set(practice.id, practice);

          this.emit('bestPracticeIdentified', {
            practice: practice.id,
            category,
            confidence: practice.confidence,
            timestamp: Date.now(),
          });
        }
      }
    }

    // Validate and rank practices
    return this.validateAndRankPractices(practices);
  }

  /**
   * Detect anti-patterns from failure patterns
   *
   * @param failures
   */
  detectAntiPatterns(failures: FailurePattern[]): AntiPattern[] {
    const antiPatterns: AntiPattern[] = [];

    // Group failures by type and frequency
    const groupedFailures = this.groupFailuresByType(failures);

    for (const [type, typeFailures] of groupedFailures) {
      // Analyze common preconditions and triggers
      const commonTriggers = this.identifyCommonTriggers(typeFailures);
      const commonConsequences = this.identifyCommonConsequences(typeFailures);

      // Create anti-pattern
      const antiPattern: AntiPattern = {
        id: `antipattern_${type}_${Date.now()}`,
        category: type,
        description: this.generateAntiPatternDescription(type, commonTriggers),
        triggers: commonTriggers,
        consequences: commonConsequences,
        avoidance: this.generateAvoidanceStrategies(commonTriggers, commonConsequences),
        detectionConfidence: this.calculateDetectionConfidence(typeFailures),
      };

      if (antiPattern.detectionConfidence >= 0.7) {
        antiPatterns.push(antiPattern);
        this.antiPatterns.set(antiPattern.id, antiPattern);

        this.emit('antiPatternDetected', {
          antiPattern: antiPattern.id,
          category: type,
          confidence: antiPattern.detectionConfidence,
          timestamp: Date.now(),
        });
      }
    }

    return antiPatterns;
  }

  /**
   * Get current knowledge base
   */
  getKnowledgeBase(): Map<string, any> {
    return new Map(this.knowledgeBase);
  }

  /**
   * Get expertise evolution for all agents
   */
  getAllExpertiseEvolution(): Map<string, ExpertiseEvolution> {
    return new Map(this.expertiseTracking);
  }

  /**
   * Get all identified best practices
   */
  getBestPractices(): BestPractice[] {
    return Array.from(this.bestPractices.values()).sort((a, b) => b.successRate - a.successRate);
  }

  /**
   * Get all detected anti-patterns
   */
  getAntiPatterns(): AntiPattern[] {
    return Array.from(this.antiPatterns.values()).sort(
      (a, b) => b.detectionConfidence - a.detectionConfidence
    );
  }

  /**
   * Get learning history for an agent
   *
   * @param agentId
   */
  getLearningHistory(agentId: string): LearningResult[] {
    return this.learningHistory.get(agentId) || [];
  }

  /**
   * Clear learning data (for testing or reset)
   */
  clearLearningData(): void {
    this.knowledgeBase.clear();
    this.expertiseTracking.clear();
    this.bestPractices.clear();
    this.antiPatterns.clear();
    this.learningHistory.clear();

    this.emit('learningDataCleared', { timestamp: Date.now() });
  }

  // Private helper methods

  private determineLearningStrategy(agents: Agent[]): LearningType {
    // Analyze agent capabilities and current performance
    const avgPerformance =
      agents.reduce((sum, agent) => sum + agent.performance.efficiency, 0) / agents.length;

    const hasSpecializations = agents.some((agent) => agent.specializations.length > 0);
    const learningProgress =
      agents.reduce((sum, agent) => sum + agent.learningProgress.adaptability, 0) / agents.length;

    // Choose strategy based on swarm characteristics
    if (avgPerformance < 0.5) {
      return 'supervised'; // Guided learning for poor performance
    } else if (hasSpecializations && learningProgress > 0.7) {
      return 'reinforcement'; // Advanced learning for specialized agents
    } else if (learningProgress > 0.5) {
      return 'unsupervised'; // Exploration for moderate performers
    } else {
      return 'online'; // Continuous adaptation
    }
  }

  private async executeLearning(
    agents: Agent[],
    strategy: LearningType
  ): Promise<LearningResult[]> {
    const results: LearningResult[] = [];

    for (const agent of agents) {
      const agentResult = await this.executeAgentLearning(agent, strategy);
      results.push(agentResult);

      // Store in history
      if (!this.learningHistory.has(agent.id)) {
        this.learningHistory.set(agent.id, []);
      }
      this.learningHistory.get(agent.id)?.push(agentResult);
    }

    return results;
  }

  private async executeAgentLearning(
    agent: Agent,
    strategy: LearningType
  ): Promise<LearningResult> {
    // Simulate learning execution based on strategy
    const patterns = await this.generateLearningPatterns(agent, strategy);
    const improvements = this.calculateImprovements(agent, patterns);
    const knowledge = this.extractKnowledgeUpdates(agent, patterns);

    const metadata: LearningMetadata = {
      algorithmUsed: strategy,
      trainingTime: Math.random() * 1000, // Simulated
      dataQuality: 0.8 + Math.random() * 0.2,
      convergence: Math.random() > 0.2,
      iterations: Math.floor(Math.random() * 100) + 10,
      validationScore: 0.7 + Math.random() * 0.3,
    };

    return {
      agentId: agent.id,
      learningType: strategy,
      patterns,
      improvements,
      knowledge,
      metadata,
    };
  }

  private aggregateLearningResults(results: LearningResult[]): LearningResult {
    // Combine all patterns and improvements
    const allPatterns: Pattern[] = [];
    const allImprovements: PerformanceImprovement[] = [];
    const allKnowledge: KnowledgeUpdate[] = [];

    for (const result of results) {
      allPatterns.push(...result.patterns);
      allImprovements.push(...result.improvements);
      allKnowledge.push(...result.knowledge);
    }

    // Calculate aggregate metadata
    const avgMetadata: LearningMetadata = {
      algorithmUsed: 'ensemble',
      trainingTime: results.reduce((sum, r) => sum + r.metadata.trainingTime, 0) / results.length,
      dataQuality: results.reduce((sum, r) => sum + r.metadata.dataQuality, 0) / results.length,
      convergence: results.every((r) => r.metadata.convergence),
      iterations: Math.max(...results.map((r) => r.metadata.iterations)),
      validationScore:
        results.reduce((sum, r) => sum + r.metadata.validationScore, 0) / results.length,
    };

    return {
      agentId: 'swarm_aggregate',
      learningType: 'ensemble' as LearningType,
      patterns: allPatterns,
      improvements: allImprovements,
      knowledge: allKnowledge,
      metadata: avgMetadata,
    };
  }

  private async generateLearningPatterns(agent: Agent, strategy: LearningType): Promise<Pattern[]> {
    // Generate patterns based on agent capabilities and strategy
    const patterns: Pattern[] = [];

    for (let i = 0; i < 3; i++) {
      const pattern: Pattern = {
        id: `pattern_${agent.id}_${Date.now()}_${i}`,
        type: this.selectPatternType(agent),
        data: this.generatePatternData(agent, strategy),
        confidence: 0.7 + Math.random() * 0.3,
        frequency: Math.floor(Math.random() * 10) + 1,
        context: { agentId: agent.id, strategy },
        metadata: {
          complexity: Math.random(),
          predictability: Math.random(),
          stability: Math.random(),
          anomalyScore: Math.random() * 0.3,
          correlations: [],
          quality: 0.8 + Math.random() * 0.2,
          relevance: Math.random(),
        },
        timestamp: Date.now(),
      };

      patterns.push(pattern);
    }

    return patterns;
  }

  private calculateImprovements(agent: Agent, _patterns: Pattern[]): PerformanceImprovement[] {
    const improvements: PerformanceImprovement[] = [];

    const metrics = ['efficiency', 'quality', 'latency', 'throughput'];

    for (const metric of metrics) {
      const baseline = agent.performance.efficiency; // Simplified
      const improved = baseline + Math.random() * 0.2; // Simulate improvement

      improvements.push({
        metric,
        baseline,
        improved,
        improvement: ((improved - baseline) / baseline) * 100,
        confidence: 0.8 + Math.random() * 0.2,
        sustainability: 0.7 + Math.random() * 0.3,
      });
    }

    return improvements;
  }

  private extractKnowledgeUpdates(agent: Agent, patterns: Pattern[]): KnowledgeUpdate[] {
    const updates: KnowledgeUpdate[] = [];

    for (const pattern of patterns) {
      updates.push({
        domain: pattern.type,
        type: 'new',
        knowledge: pattern.data,
        confidence: pattern.confidence,
        source: agent.id,
        timestamp: Date.now(),
      });
    }

    return updates;
  }

  private trackLearningProgress(agents: Agent[], result: LearningResult): void {
    for (const agent of agents) {
      const agentResult = result.patterns.filter((p) => p.context.agentId === agent.id);

      // Update agent learning progress (simplified)
      agent.learningProgress.totalExperience += agentResult.length;

      // Update expertise tracking
      this.trackExpertiseEvolution(agent.id);
    }
  }

  private mergePatterns(existing: Pattern, newPattern: Pattern): Pattern {
    return {
      ...existing,
      confidence: (existing.confidence + newPattern.confidence) / 2,
      frequency: existing.frequency + newPattern.frequency,
      metadata: {
        ...existing.metadata,
        quality: Math.max(existing.metadata.quality, newPattern.metadata.quality),
      },
      timestamp: Date.now(),
    };
  }

  private pruneKnowledgeBase(): void {
    const currentTime = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    const minConfidence = 0.5;

    for (const [id, pattern] of this.knowledgeBase) {
      if (currentTime - pattern.timestamp > maxAge || pattern.confidence < minConfidence) {
        this.knowledgeBase.delete(id);

        this.emit('knowledgePruned', {
          patternId: id,
          reason: currentTime - pattern.timestamp > maxAge ? 'age' : 'confidence',
          timestamp: Date.now(),
        });
      }
    }
  }

  private async distributeKnowledgeUpdates(patterns: Pattern[]): Promise<void> {
    // Distribute relevant knowledge to agents based on their specializations
    for (const [agentId, agent] of this.agents) {
      const relevantPatterns = patterns.filter(
        (pattern) => agent.specializations.includes(pattern.type) || pattern.confidence > 0.9
      );

      if (relevantPatterns.length > 0) {
        this.emit('knowledgeDistributed', {
          agentId,
          patterns: relevantPatterns.map((p) => p.id),
          timestamp: Date.now(),
        });
      }
    }
  }

  private initializeExpertiseTracking(agentId: string): void {
    const agent = this.agents.get(agentId);

    this.expertiseTracking.set(agentId, {
      agentId,
      domain: agent?.specializations[0] || 'general',
      currentLevel: agent?.learningProgress.adaptability || 0.5,
      growthRate: 0.1,
      specializations: agent?.specializations || [],
      knowledgeGaps: [],
      timeline: [
        {
          timestamp: Date.now(),
          level: agent?.learningProgress.adaptability || 0.5,
          domain: agent?.specializations[0] || 'general',
        },
      ],
    });
  }

  private updateExpertiseMetrics(expertise: ExpertiseEvolution, agent: Agent): void {
    const currentLevel = agent.performance.efficiency;
    const previousLevel = expertise.currentLevel;

    expertise.currentLevel = currentLevel;
    expertise.growthRate = (currentLevel - previousLevel) / previousLevel;

    expertise.timeline.push({
      timestamp: Date.now(),
      level: currentLevel,
      domain: expertise.domain,
    });

    // Keep only recent timeline entries
    const maxEntries = 100;
    if (expertise.timeline.length > maxEntries) {
      expertise.timeline = expertise.timeline.slice(-maxEntries);
    }
  }

  private identifyGrowthOpportunities(expertise: ExpertiseEvolution, agent: Agent): void {
    // Identify areas where the agent could improve
    const knowledgeGaps: string[] = [];

    // Compare with available knowledge base
    for (const [_patternId, pattern] of this.knowledgeBase) {
      if (!agent.specializations.includes(pattern.type) && pattern.confidence > 0.8) {
        knowledgeGaps.push(pattern.type);
      }
    }

    expertise.knowledgeGaps = [...new Set(knowledgeGaps)];
  }

  private updateLearningRecommendations(expertise: ExpertiseEvolution, agent: Agent): void {
    // Generate learning recommendations based on gaps and growth rate
    // This would integrate with the learning system to suggest next steps
    this.emit('learningRecommendation', {
      agentId: agent.id,
      recommendations: expertise.knowledgeGaps.slice(0, 3),
      priority: expertise.growthRate < 0.05 ? 'high' : 'medium',
      timestamp: Date.now(),
    });
  }

  private groupSuccessesByCategory(successes: SuccessPattern[]): Map<string, SuccessPattern[]> {
    const groups = new Map<string, SuccessPattern[]>();

    for (const success of successes) {
      const category = success.context || 'general';
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)?.push(success);
    }

    return groups;
  }

  private findCommonPatterns(successes: SuccessPattern[]): any[] {
    // Simplified pattern extraction
    const actionCounts = new Map<string, number>();

    for (const success of successes) {
      for (const action of success.actions) {
        actionCounts.set(action, (actionCounts.get(action) || 0) + 1);
      }
    }

    return Array.from(actionCounts.entries())
      .filter(([, count]) => count >= Math.max(2, successes.length * 0.3))
      .map(([action, count]) => ({ action, frequency: count }));
  }

  private extractBestPractice(
    category: string,
    pattern: any,
    successes: SuccessPattern[]
  ): BestPractice {
    const relevantSuccesses = successes.filter((s) => s.actions.includes(pattern.action));

    return {
      id: `bestpractice_${category}_${pattern.action}_${Date.now()}`,
      category,
      description: `Use ${pattern.action} for ${category} tasks`,
      conditions: this.extractConditions(relevantSuccesses),
      outcomes: this.calculateAverageOutcomes(relevantSuccesses),
      confidence: pattern.frequency / successes.length,
      usageCount: pattern.frequency,
      successRate: relevantSuccesses.length / successes.length,
    };
  }

  private validateAndRankPractices(practices: BestPractice[]): BestPractice[] {
    return practices
      .filter((p) => p.confidence >= 0.6 && p.successRate >= 0.7)
      .sort((a, b) => b.confidence * b.successRate - a.confidence * a.successRate);
  }

  private groupFailuresByType(failures: FailurePattern[]): Map<string, FailurePattern[]> {
    const groups = new Map<string, FailurePattern[]>();

    for (const failure of failures) {
      if (!groups.has(failure.type)) {
        groups.set(failure.type, []);
      }
      groups.get(failure.type)?.push(failure);
    }

    return groups;
  }

  private identifyCommonTriggers(failures: FailurePattern[]): string[] {
    const triggerCounts = new Map<string, number>();

    for (const failure of failures) {
      for (const context of failure.context) {
        triggerCounts.set(context, (triggerCounts.get(context) || 0) + 1);
      }
    }

    return Array.from(triggerCounts.entries())
      .filter(([, count]) => count >= Math.max(2, failures.length * 0.3))
      .map(([trigger]) => trigger);
  }

  private identifyCommonConsequences(failures: FailurePattern[]): string[] {
    const consequenceCounts = new Map<string, number>();

    for (const failure of failures) {
      for (const impact of failure.impacts) {
        consequenceCounts.set(impact, (consequenceCounts.get(impact) || 0) + 1);
      }
    }

    return Array.from(consequenceCounts.entries())
      .filter(([, count]) => count >= Math.max(2, failures.length * 0.3))
      .map(([consequence]) => consequence);
  }

  private generateAntiPatternDescription(type: string, triggers: string[]): string {
    return `Anti-pattern for ${type}: Avoid when ${triggers.join(', ')} are present`;
  }

  private generateAvoidanceStrategies(triggers: string[], consequences: string[]): string[] {
    return [
      `Monitor for conditions: ${triggers.join(', ')}`,
      `Implement safeguards to prevent: ${consequences.join(', ')}`,
      'Use alternative approaches when triggers are detected',
    ];
  }

  private calculateDetectionConfidence(failures: FailurePattern[]): number {
    if (failures.length === 0) return 0;

    const avgFrequency = failures.reduce((sum, f) => sum + f.frequency, 0) / failures.length;
    const consistencyScore = failures.length >= 3 ? 0.8 : failures.length * 0.3;

    return Math.min(0.95, (avgFrequency / 10) * consistencyScore);
  }

  private selectPatternType(agent: Agent): any {
    const types = ['task_completion', 'communication', 'resource_utilization', 'optimization'];
    if (agent.specializations.length > 0) {
      return agent.specializations[0];
    }
    return types[Math.floor(Math.random() * types.length)];
  }

  private generatePatternData(agent: Agent, strategy: LearningType): any {
    return {
      agentCapabilities: agent.capabilities,
      strategy,
      performance: agent.performance,
      learningContext: agent.learningProgress,
    };
  }

  private extractConditions(successes: SuccessPattern[]): string[] {
    const allConditions = successes.flatMap((s) => s.conditions);
    const conditionCounts = new Map<string, number>();

    for (const condition of allConditions) {
      conditionCounts.set(condition, (conditionCounts.get(condition) || 0) + 1);
    }

    return Array.from(conditionCounts.entries())
      .filter(([, count]) => count >= successes.length * 0.5)
      .map(([condition]) => condition);
  }

  private calculateAverageOutcomes(successes: SuccessPattern[]): any {
    const totals = {
      efficiency: 0,
      quality: 0,
      cost: 0,
      satisfaction: 0,
      sustainability: 0,
    };

    for (const success of successes) {
      totals.efficiency += success.outcomes.efficiency;
      totals.quality += success.outcomes.quality;
      totals.cost += success.outcomes.cost;
      totals.satisfaction += success.outcomes.satisfaction;
      totals.sustainability += success.outcomes.sustainability;
    }

    const count = successes.length;
    return {
      efficiency: totals.efficiency / count,
      quality: totals.quality / count,
      cost: totals.cost / count,
      satisfaction: totals.satisfaction / count,
      sustainability: totals.sustainability / count,
    };
  }

  private startLearningCoordination(): void {
    // Start periodic learning coordination
    setInterval(
      () => {
        if (this.agents.size > 0) {
          const agents = Array.from(this.agents.values());
          this.coordinateLearning(agents).catch((error) => {
            this.emit('learningError', { error: error.message, timestamp: Date.now() });
          });
        }
      },
      5 * 60 * 1000
    ); // Every 5 minutes
  }
}
