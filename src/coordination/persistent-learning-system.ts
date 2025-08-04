/**
 * Persistent Learning System for Ephemeral Swarms
 *
 * While swarm instances are ephemeral (temporary), their knowledge and learnings
 * are persistent and shared across all future swarm instances.
 */

import { EventEmitter } from 'node:events';
import type { IEventBus } from '../core/event-bus';
import type { ILogger } from '../core/logger';
import type { AgentType } from '../types/agent-types';

export interface AgentKnowledge {
  agentType: AgentType;
  experiences: Experience[];
  patterns: LearnedPattern[];
  capabilities: CapabilityEvolution;
  performance: PerformanceHistory;
  relationships: AgentRelationships;
  lastUpdated: Date;
  version: number;
}

export interface Experience {
  id: string;
  timestamp: Date;
  swarmId: string;
  taskType: string;
  context: TaskContext;
  actions: Action[];
  outcome: TaskOutcome;
  lessons: string[];
  confidence: number; // 0-1
}

export interface LearnedPattern {
  id: string;
  pattern: string;
  frequency: number;
  successRate: number;
  contexts: string[]; // When this pattern applies
  examples: string[];
  discovered: Date;
  lastReinforced: Date;
}

export interface CapabilityEvolution {
  baseCapabilities: string[];
  acquiredSkills: AcquiredSkill[];
  specializations: Specialization[];
  adaptations: Adaptation[];
}

export interface AcquiredSkill {
  skill: string;
  proficiency: number; // 0-100
  acquiredAt: Date;
  lastUsed: Date;
  usageCount: number;
  successRate: number;
}

export interface Specialization {
  domain: string;
  expertise: number; // 0-100
  keyPatterns: string[];
  tools: string[];
  bestPractices: string[];
}

export interface Adaptation {
  trigger: string; // What caused this adaptation
  change: string; // What changed
  impact: string; // Effect on performance
  timestamp: Date;
}

export interface PerformanceHistory {
  totalTasks: number;
  successfulTasks: number;
  averageExecutionTime: number;
  qualityScores: number[];
  improvementTrend: number; // Positive = improving
  benchmarks: PerformanceBenchmark[];
}

export interface PerformanceBenchmark {
  metric: string;
  value: number;
  timestamp: Date;
  context: string;
}

export interface AgentRelationships {
  collaborations: Collaboration[];
  synergies: Synergy[];
  conflicts: Conflict[];
}

export interface Collaboration {
  partnerAgentType: AgentType;
  taskTypes: string[];
  successRate: number;
  synergy: number; // How well they work together
  frequency: number;
}

export interface Synergy {
  combination: AgentType[];
  effect: string;
  multiplier: number; // Performance multiplier when working together
  discoveredAt: Date;
}

export interface Conflict {
  conflictWith: AgentType;
  issue: string;
  resolution: string;
  occurrence: number;
}

export interface TaskContext {
  domain: string;
  complexity: 'low' | 'medium' | 'high' | 'extreme';
  timeConstraints: boolean;
  resources: string[];
  dependencies: string[];
  stakeholders: string[];
}

export interface Action {
  id: string;
  timestamp: Date;
  action: string;
  parameters: Record<string, any>;
  duration: number;
  success: boolean;
  impact: number; // 0-1
}

export interface TaskOutcome {
  success: boolean;
  quality: number; // 0-100
  efficiency: number; // 0-100
  stakeholderSatisfaction: number; // 0-100
  lessonsLearned: string[];
  improvements: string[];
  failures: string[];
}

/**
 * Manages persistent learning across ephemeral swarm instances
 */
export class PersistentLearningSystem extends EventEmitter {
  private agentKnowledge = new Map<AgentType, AgentKnowledge>();
  private globalPatterns: GlobalPattern[] = [];
  private swarmMemories = new Map<string, SwarmMemory>();
  private crossSwarmLearnings: CrossSwarmLearning[] = [];

  constructor(
    private eventBus: IEventBus,
    private logger?: ILogger
  ) {
    super();
    this.setupEventHandlers();
    this.startPeriodicLearning();
  }

  /**
   * When a new swarm is created, inject accumulated knowledge
   */
  async injectKnowledgeIntoSwarm(swarmId: string, agentTypes: AgentType[]): Promise<void> {
    this.logger?.info('Injecting knowledge into new swarm', {
      swarmId,
      agentTypes: agentTypes.length,
    });

    const swarmMemory: SwarmMemory = {
      content: { swarmId, agentTypes, injectedKnowledge: [] },
      metadata: {
        source: 'persistent-learning-system',
        confidence: 0.8,
        expiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        tags: ['swarm-knowledge', 'injection'],
      },
      swarmId,
      agentTypes,
      injectedKnowledge: [],
      createdAt: new Date(),
      performance: {
        expectedSuccess: 0,
        riskFactors: [],
        recommendations: [],
      },
    };

    for (const agentType of agentTypes) {
      const knowledge = this.agentKnowledge.get(agentType);
      if (knowledge) {
        // Inject relevant experiences and patterns
        const relevantKnowledge = this.filterRelevantKnowledge(knowledge, swarmMemory);
        swarmMemory.injectedKnowledge.push({
          agentType,
          experiences: relevantKnowledge.experiences,
          patterns: relevantKnowledge.patterns,
          bestPractices: relevantKnowledge.bestPractices,
        });

        // Calculate expected performance
        swarmMemory.performance.expectedSuccess +=
          knowledge.performance.successfulTasks / knowledge.performance.totalTasks;
      }
    }

    // Average expected success across agents
    swarmMemory.performance.expectedSuccess /= agentTypes.length;

    // Add cross-swarm learnings
    swarmMemory.crossSwarmInsights = this.getCrossSwarmInsights(agentTypes);

    this.swarmMemories.set(swarmId, swarmMemory);

    // Broadcast knowledge to swarm
    this.eventBus.emit('swarm:knowledge:inject', {
      swarmId,
      knowledgeType: 'patterns',
      knowledge: {
        content: swarmMemory.content,
        metadata: swarmMemory.metadata,
      },
      source: 'persistent-learning-system',
      distributionScope: 'all-agents',
      timestamp: new Date(),
      persistenceRequested: true,
    });

    this.emit('knowledge:injected', { swarmId, agentTypes: agentTypes.length });
  }

  /**
   * Collect learnings when a swarm completes
   */
  async collectSwarmLearnings(swarmId: string, swarmResults: SwarmResults): Promise<void> {
    this.logger?.info('Collecting learnings from completed swarm', { swarmId });

    const swarmMemory = this.swarmMemories.get(swarmId);
    if (!swarmMemory) return;

    // Process each agent's experiences
    for (const agentResult of swarmResults.agentResults) {
      await this.processAgentLearnings(agentResult, swarmMemory);
    }

    // Extract global patterns
    await this.extractGlobalPatterns(swarmResults);

    // Update cross-swarm learnings
    await this.updateCrossSwarmLearnings(swarmResults);

    // Clean up swarm memory (keep summary for reference)
    this.archiveSwarmMemory(swarmId, swarmResults);

    this.emit('learnings:collected', { swarmId, insights: swarmResults.insights?.length || 0 });
  }

  /**
   * Process individual agent learnings
   */
  private async processAgentLearnings(
    agentResult: AgentResult,
    swarmMemory: SwarmMemory
  ): Promise<void> {
    let knowledge = this.agentKnowledge.get(agentResult.agentType);

    if (!knowledge) {
      knowledge = this.initializeAgentKnowledge(agentResult.agentType);
      this.agentKnowledge.set(agentResult.agentType, knowledge);
    }

    // Add new experience
    const experience: Experience = {
      id: `exp_${Date.now()}_${agentResult.agentId}`,
      timestamp: new Date(),
      swarmId: swarmMemory.swarmId,
      taskType: agentResult.taskType,
      context: agentResult.context,
      actions: agentResult.actions,
      outcome: agentResult.outcome,
      lessons: agentResult.lessonsLearned,
      confidence: agentResult.confidence,
    };

    knowledge.experiences.push(experience);

    // Update performance history
    knowledge.performance.totalTasks++;
    if (agentResult.outcome.success) {
      knowledge.performance.successfulTasks++;
    }
    knowledge.performance.averageExecutionTime =
      (knowledge.performance.averageExecutionTime * (knowledge.performance.totalTasks - 1) +
        agentResult.executionTime) /
      knowledge.performance.totalTasks;

    knowledge.performance.qualityScores.push(agentResult.outcome.quality);

    // Learn new patterns
    await this.extractAgentPatterns(knowledge, agentResult);

    // Update capabilities
    await this.updateAgentCapabilities(knowledge, agentResult);

    // Update relationships
    await this.updateAgentRelationships(knowledge, agentResult, swarmMemory);

    knowledge.lastUpdated = new Date();
    knowledge.version++;

    this.logger?.debug('Agent knowledge updated', {
      agentType: agentResult.agentType,
      totalExperiences: knowledge.experiences.length,
      successRate: knowledge.performance.successfulTasks / knowledge.performance.totalTasks,
    });
  }

  /**
   * Extract patterns from agent behavior
   */
  private async extractAgentPatterns(
    knowledge: AgentKnowledge,
    agentResult: AgentResult
  ): Promise<void> {
    // Analyze action sequences for patterns
    const actionSequence = agentResult.actions.map((a) => a.action).join(' -> ');

    let pattern = knowledge.patterns.find((p) => p.pattern === actionSequence);
    if (pattern) {
      pattern.frequency++;
      pattern.lastReinforced = new Date();
      if (agentResult.outcome.success) {
        pattern.successRate =
          (pattern.successRate * (pattern.frequency - 1) + 1) / pattern.frequency;
      } else {
        pattern.successRate = (pattern.successRate * (pattern.frequency - 1)) / pattern.frequency;
      }
    } else if (agentResult.actions.length > 1) {
      // New pattern discovered
      pattern = {
        id: `pattern_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        pattern: actionSequence,
        frequency: 1,
        successRate: agentResult.outcome.success ? 1 : 0,
        contexts: [agentResult.context.domain],
        examples: [agentResult.taskType],
        discovered: new Date(),
        lastReinforced: new Date(),
      };
      knowledge.patterns.push(pattern);
    }
  }

  /**
   * Update agent capabilities based on performance
   */
  private async updateAgentCapabilities(
    knowledge: AgentKnowledge,
    agentResult: AgentResult
  ): Promise<void> {
    // Check for new skills demonstrated
    for (const action of agentResult.actions) {
      if (action.success && action.impact > 0.7) {
        let skill = knowledge.capabilities.acquiredSkills.find((s) => s.skill === action.action);

        if (skill) {
          skill.usageCount++;
          skill.lastUsed = new Date();
          // Update proficiency based on success
          skill.proficiency = Math.min(100, skill.proficiency + action.impact * 2);
          skill.successRate =
            (skill.successRate * (skill.usageCount - 1) + (action.success ? 1 : 0)) /
            skill.usageCount;
        } else {
          // New skill acquired
          skill = {
            skill: action.action,
            proficiency: Math.min(100, action.impact * 50),
            acquiredAt: new Date(),
            lastUsed: new Date(),
            usageCount: 1,
            successRate: action.success ? 1 : 0,
          };
          knowledge.capabilities.acquiredSkills.push(skill);
        }
      }
    }

    // Update specializations
    const domain = agentResult.context.domain;
    let specialization = knowledge.capabilities.specializations.find((s) => s.domain === domain);

    if (specialization) {
      // Increase expertise based on performance
      const performanceBonus = (agentResult.outcome.quality / 100) * 5; // Up to 5 points
      specialization.expertise = Math.min(100, specialization.expertise + performanceBonus);
    } else if (agentResult.outcome.quality > 70) {
      // New specialization discovered
      specialization = {
        domain,
        expertise: agentResult.outcome.quality / 2, // Start with half the quality score
        keyPatterns: [agentResult.actions.map((a) => a.action).join(' -> ')],
        tools: agentResult.actions.map((a) => a.parameters.tool).filter(Boolean),
        bestPractices: agentResult.lessonsLearned,
      };
      knowledge.capabilities.specializations.push(specialization);
    }
  }

  /**
   * Update agent relationships based on collaboration
   */
  private async updateAgentRelationships(
    knowledge: AgentKnowledge,
    agentResult: AgentResult,
    swarmMemory: SwarmMemory
  ): Promise<void> {
    // Analyze collaborations with other agents in the swarm
    const otherAgentTypes = swarmMemory.agentTypes.filter((type) => type !== agentResult.agentType);

    for (const partnerType of otherAgentTypes) {
      let collaboration = knowledge.relationships.collaborations.find(
        (c) => c.partnerAgentType === partnerType
      );

      if (collaboration) {
        collaboration.frequency++;
        if (!collaboration.taskTypes.includes(agentResult.taskType)) {
          collaboration.taskTypes.push(agentResult.taskType);
        }

        // Update success rate
        const taskSuccess = agentResult.outcome.success ? 1 : 0;
        collaboration.successRate =
          (collaboration.successRate * (collaboration.frequency - 1) + taskSuccess) /
          collaboration.frequency;
      } else {
        // New collaboration
        collaboration = {
          partnerAgentType: partnerType,
          taskTypes: [agentResult.taskType],
          successRate: agentResult.outcome.success ? 1 : 0,
          synergy: agentResult.outcome.efficiency / 100, // Initial synergy estimate
          frequency: 1,
        };
        knowledge.relationships.collaborations.push(collaboration);
      }
    }
  }

  /**
   * Filter relevant knowledge for a new swarm
   */
  private filterRelevantKnowledge(knowledge: AgentKnowledge, _swarmMemory: SwarmMemory): any {
    // Get most relevant experiences (recent + successful)
    const relevantExperiences = knowledge.experiences
      .filter((exp) => exp.confidence > 0.7)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10); // Top 10 most recent relevant experiences

    // Get proven patterns (high success rate)
    const relevantPatterns = knowledge.patterns
      .filter((pattern) => pattern.successRate > 0.8 && pattern.frequency > 2)
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 5); // Top 5 most successful patterns

    // Extract best practices
    const bestPractices = knowledge.capabilities.specializations
      .flatMap((spec) => spec.bestPractices)
      .concat(relevantExperiences.flatMap((exp) => exp.lessons))
      .filter((practice, index, arr) => arr.indexOf(practice) === index) // Unique
      .slice(0, 10); // Top 10 best practices

    return {
      experiences: relevantExperiences,
      patterns: relevantPatterns,
      bestPractices,
    };
  }

  /**
   * Get cross-swarm insights for new swarm
   */
  private getCrossSwarmInsights(agentTypes: AgentType[]): CrossSwarmInsight[] {
    return this.crossSwarmLearnings
      .filter((learning) => learning.agentCombination.some((type) => agentTypes.includes(type)))
      .map((learning) => ({
        insight: learning.insight,
        applicability: learning.confidence,
        evidence: learning.examples.length,
      }));
  }

  /**
   * Initialize knowledge for a new agent type
   */
  private initializeAgentKnowledge(agentType: AgentType): AgentKnowledge {
    return {
      agentType,
      experiences: [],
      patterns: [],
      capabilities: {
        baseCapabilities: [], // Would be loaded from agent type definition
        acquiredSkills: [],
        specializations: [],
        adaptations: [],
      },
      performance: {
        totalTasks: 0,
        successfulTasks: 0,
        averageExecutionTime: 0,
        qualityScores: [],
        improvementTrend: 0,
        benchmarks: [],
      },
      relationships: {
        collaborations: [],
        synergies: [],
        conflicts: [],
      },
      lastUpdated: new Date(),
      version: 1,
    };
  }

  /**
   * Extract global patterns across all swarms
   */
  private async extractGlobalPatterns(swarmResults: SwarmResults): Promise<void> {
    // Analyze patterns that emerge across different swarms
    // This would be more sophisticated in practice
    const patterns = swarmResults.insights?.filter(
      (insight) => insight.type === 'pattern' && insight.confidence > 0.8
    );

    for (const patternInsight of patterns || []) {
      const globalPattern = this.globalPatterns.find(
        (gp) => gp.pattern === patternInsight.description
      );

      if (globalPattern) {
        globalPattern.frequency++;
        globalPattern.reinforcedAt = new Date();
      } else {
        this.globalPatterns.push({
          id: `global_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          pattern: patternInsight.description,
          frequency: 1,
          discoveredAt: new Date(),
          reinforcedAt: new Date(),
          applicableContexts: [swarmResults.context],
          impact: patternInsight.impact || 1,
        });
      }
    }
  }

  /**
   * Update cross-swarm learnings
   */
  private async updateCrossSwarmLearnings(swarmResults: SwarmResults): Promise<void> {
    // Analyze what works well across different agent combinations
    const agentTypes = swarmResults.agentResults.map((r) => r.agentType);
    const overallSuccess = swarmResults.overallSuccess;

    if (overallSuccess > 0.8) {
      const learning = this.crossSwarmLearnings.find(
        (csl) =>
          csl.agentCombination.length === agentTypes.length &&
          csl.agentCombination.every((type) => agentTypes.includes(type))
      );

      if (learning) {
        learning.frequency++;
        learning.confidence = Math.min(1.0, learning.confidence + 0.1);
        learning.examples.push({
          swarmId: swarmResults.swarmId,
          success: overallSuccess,
          context: swarmResults.context,
        });
      } else {
        this.crossSwarmLearnings.push({
          id: `cross_${Date.now()}`,
          agentCombination: agentTypes,
          insight: `Combination of ${agentTypes.join(' + ')} works well for ${swarmResults.context}`,
          frequency: 1,
          confidence: 0.7,
          discoveredAt: new Date(),
          examples: [
            {
              swarmId: swarmResults.swarmId,
              success: overallSuccess,
              context: swarmResults.context,
            },
          ],
        });
      }
    }
  }

  /**
   * Archive swarm memory for future reference
   */
  private archiveSwarmMemory(swarmId: string, swarmResults: SwarmResults): void {
    // Keep a summary for future reference
    const swarmMemory = this.swarmMemories.get(swarmId);
    if (swarmMemory) {
      swarmMemory.completedAt = new Date();
      swarmMemory.finalPerformance = {
        actualSuccess: swarmResults.overallSuccess,
        efficiency: swarmResults.efficiency,
        quality: swarmResults.quality,
        insights: swarmResults.insights?.length || 0,
      };

      // Move to archive (in practice, would persist to database)
      this.swarmMemories.delete(swarmId);
    }
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    this.eventBus.on('swarm:created', (data) => {
      this.injectKnowledgeIntoSwarm(data.swarmId, [...(data.agentTypes || [])]);
    });

    this.eventBus.on('swarm:completed', (data) => {
      const results =
        (data.results as unknown as SwarmResults) ||
        ({
          swarmId: data.swarmId,
          context: 'completion',
          overallSuccess: 1.0,
          efficiency: 0.8,
          quality: 0.8,
          agentResults: [],
          learnings: [],
        } as SwarmResults);
      this.collectSwarmLearnings(data.swarmId, results);
    });
  }

  /**
   * Start periodic learning processes
   */
  private startPeriodicLearning(): void {
    // Periodically analyze and consolidate learnings
    setInterval(() => {
      this.consolidateLearnings();
    }, 300000); // Every 5 minutes
  }

  /**
   * Consolidate and optimize learnings
   */
  private consolidateLearnings(): void {
    // Clean up low-confidence patterns
    for (const knowledge of this.agentKnowledge.values()) {
      knowledge.patterns = knowledge.patterns.filter(
        (pattern) => pattern.frequency > 1 || pattern.successRate > 0.6
      );
    }

    // Clean up old experiences (keep only best and recent)
    for (const knowledge of this.agentKnowledge.values()) {
      if (knowledge.experiences.length > 100) {
        knowledge.experiences = knowledge.experiences
          .sort((a, b) => {
            // Sort by confidence and recency
            const aScore =
              a.confidence * 0.7 + ((Date.now() - a.timestamp.getTime()) / 86400000) * 0.3;
            const bScore =
              b.confidence * 0.7 + ((Date.now() - b.timestamp.getTime()) / 86400000) * 0.3;
            return bScore - aScore;
          })
          .slice(0, 50); // Keep top 50
      }
    }

    this.emit('learnings:consolidated');
  }

  /**
   * Get knowledge summary for an agent type
   */
  getAgentKnowledgeSummary(agentType: AgentType): AgentKnowledgeSummary | null {
    const knowledge = this.agentKnowledge.get(agentType);
    if (!knowledge) return null;

    return {
      agentType,
      totalExperiences: knowledge.experiences.length,
      successRate:
        knowledge.performance.successfulTasks / Math.max(knowledge.performance.totalTasks, 1),
      topPatterns: knowledge.patterns
        .sort((a, b) => b.successRate - a.successRate)
        .slice(0, 3)
        .map((p) => ({ pattern: p.pattern, successRate: p.successRate })),
      specializations: knowledge.capabilities.specializations.map((s) => ({
        domain: s.domain,
        expertise: s.expertise,
      })),
      lastUpdated: knowledge.lastUpdated,
    };
  }
}

// Supporting interfaces
interface SwarmMemory {
  readonly content: unknown;
  readonly metadata: {
    readonly source: string;
    readonly confidence: number;
    readonly expiry?: Date;
    readonly tags: readonly string[];
  };
  swarmId: string;
  agentTypes: readonly AgentType[];
  injectedKnowledge: any[];
  crossSwarmInsights?: CrossSwarmInsight[];
  createdAt: Date;
  completedAt?: Date;
  performance: {
    expectedSuccess: number;
    riskFactors: string[];
    recommendations: string[];
  };
  finalPerformance?: {
    actualSuccess: number;
    efficiency: number;
    quality: number;
    insights: number;
  };
}

interface CrossSwarmInsight {
  insight: string;
  applicability: number;
  evidence: number;
}

interface GlobalPattern {
  id: string;
  pattern: string;
  frequency: number;
  discoveredAt: Date;
  reinforcedAt: Date;
  applicableContexts: string[];
  impact: number;
}

interface CrossSwarmLearning {
  id: string;
  agentCombination: AgentType[];
  insight: string;
  frequency: number;
  confidence: number;
  discoveredAt: Date;
  examples: Array<{
    swarmId: string;
    success: number;
    context: string;
  }>;
}

interface SwarmResults {
  swarmId: string;
  context: string;
  overallSuccess: number;
  efficiency: number;
  quality: number;
  agentResults: AgentResult[];
  learnings: any[];
  insights?: Insight[];
}

interface AgentResult {
  agentId: string;
  agentType: AgentType;
  taskType: string;
  context: TaskContext;
  actions: Action[];
  outcome: TaskOutcome;
  executionTime: number;
  lessonsLearned: string[];
  confidence: number;
}

interface Insight {
  type: 'pattern' | 'improvement' | 'risk' | 'optimization';
  description: string;
  confidence: number;
  impact?: number;
}

interface AgentKnowledgeSummary {
  agentType: AgentType;
  totalExperiences: number;
  successRate: number;
  topPatterns: Array<{ pattern: string; successRate: number }>;
  specializations: Array<{ domain: string; expertise: number }>;
  lastUpdated: Date;
}

export default PersistentLearningSystem;
