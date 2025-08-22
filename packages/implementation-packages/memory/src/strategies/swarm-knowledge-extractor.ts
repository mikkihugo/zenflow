/**
 * Swarm Knowledge Extractor - Pre-deletion Intelligence Extraction
 *
 * Extracts valuable patterns and insights from swarm sessions before memory deletion,
 * leveraging ML tools from Brain, Neural-ML, and SPARC packages for intelligent
 * pattern recognition and knowledge preservation.
 */

import { TypedEventBase } from '@claude-zen/foundation';
import {
  getLogger,
  recordMetric,
  withTrace,
  TelemetryManager,
} from '@claude-zen/foundation';
import type { Logger } from '@claude-zen/foundation';
import { DataLifecycleManager } from './data-lifecycle-manager';

// Types for extracted knowledge
interface SwarmSession {
  sessionId: string;
  swarmId: string;
  type:|'dev-swarm|ops-swarm'||coordination-swarm|hybrid-swarm'||sparc-swarm';
  startTime: number;
  endTime: number;
  participants: Array<{
    agentId: string;
    role: string;
    performanceMetrics: Record<string, number>;
  }>;
  decisions: Array<{
    decisionId: string;
    context: string;
    outcome: 'success|failure|partial';
    metrics: Record<string, number>;
  }>;
  collaborationPatterns: Array<{
    pattern: string;
    effectiveness: number;
    frequency: number;
  }>;
  artifacts: Array<{
    type: 'code|documentation|decision|analysis';
    content: string;
    quality: number;
  }>;
  sparcPhases?: Record<
    string,
    {
      duration: number;
      quality: number;
      iterations: number;
    }
  >;
}

interface ExtractedKnowledge {
  sessionId: string;
  extractedAt: number;
  importance: number;
  confidence: number;

  // Behavioral patterns
  successPatterns: Array<{
    pattern: string;
    successRate: number;
    contexts: string[];
    recommendations: string[];
  }>;

  // Performance insights
  performanceMetrics: {
    avgTaskCompletion: number;
    collaborationEfficiency: number;
    decisionQuality: number;
    adaptabilityScore: number;
  };

  // Learning insights
  learningOutcomes: Array<{
    topic: string;
    insight: string;
    confidence: number;
    applicability: string[];
  }>;

  // Failure analysis
  failurePatterns: Array<{
    pattern: string;
    frequency: number;
    rootCauses: string[];
    mitigations: string[];
  }>;

  // SPARC-specific insights (if applicable)
  sparcInsights?: {
    phaseEfficiency: Record<string, number>;
    bottlenecks: string[];
    optimizations: string[];
  };
}

interface ExtractionConfig {
  enabled: boolean;
  minSessionDuration: number; // Minimum session duration to extract (ms)
  minImportanceThreshold: number; // Minimum importance score (0-1)
  mlEnabled: boolean; // Use ML for pattern recognition
  brainEnabled: boolean; // Use Brain coordinator for analysis
  sparcEnabled: boolean; // Extract SPARC-specific patterns
  extractionTimeout: number; // Max time for extraction (ms)
  preserveRawData: boolean; // Keep raw session data in archive
}

export class SwarmKnowledgeExtractor extends TypedEventBase {
  private logger: Logger;
  private config: ExtractionConfig;
  private telemetry: TelemetryManager;
  private lifecycleManager?: DataLifecycleManager;
  private brainCoordinator?: any; // Will be dynamically imported
  private mlCoordinator?: any; // Will be dynamically imported
  private patternRecognizer?: any; // Will be dynamically imported
  private sparcEngine?: any; // Will be dynamically imported
  private initialized = false;

  constructor(config: ExtractionConfig) {
    super();
    this.config = config;
    this.logger = getLogger('SwarmKnowledgeExtractor');
    this.telemetry = new TelemetryManager({
      serviceName: 'swarm-knowledge-extraction',
      enableTracing: true,
      enableMetrics: true,
    });
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await withTrace('swarm-knowledge-extractor-init', async () => {
        await this.telemetry.initialize();

        // Initialize lifecycle manager
        this.lifecycleManager = new DataLifecycleManager({
          enabled: true,
          stages: {
            hot: { maxAge: 3600000, maxSize: 100000000 }, // 1 hour
            warm: { maxAge: 86400000, maxSize: 500000000 }, // 1 day
            cold: { maxAge: 604800000, maxSize: 1000000000 }, // 1 week
          },
          archival: {
            enabled: this.configuration.preserveRawData,
            compression: true,
            retentionPeriod: 2592000000, // 30 days
          },
          migration: {
            enabled: true,
            triggers: ['before_delete', 'stage_transition'],
            extractors: [
              'swarm-patterns',
              'performance-insights',
              'learning-outcomes',
            ],
          },
        });
        await this.lifecycleManager.initialize();

        // Initialize ML tools if enabled
        if (this.configuration.mlEnabled) {
          await this.initializeMLTools();
        }

        // Initialize Brain coordinator if enabled
        if (this.configuration.brainEnabled) {
          await this.initializeBrainTools();
        }

        // Initialize SPARC engine if enabled
        if (this.configuration.sparcEnabled) {
          await this.initializeSPARCTools();
        }

        this.initialized = true;
        this.logger.info('Swarm knowledge extractor initialized', {
          mlEnabled: this.configuration.mlEnabled,
          brainEnabled: this.configuration.brainEnabled,
          sparcEnabled: this.configuration.sparcEnabled,
        });

        recordMetric('swarm_knowledge_extractor_initialized', 1);
      });
    } catch (error) {
      this.logger.error(
        'Failed to initialize swarm knowledge extractor:',
        error
      );
      throw error;
    }
  }

  /**
   * Extract knowledge from a swarm session before deletion
   */
  async extractKnowledge(
    sessionData: SwarmSession
  ): Promise<ExtractedKnowledge> {
    if (!this.initialized) {
      throw new Error('SwarmKnowledgeExtractor not initialized');
    }

    return withTrace('extract-swarm-knowledge', async (span) => {
      span?.setAttributes({
        'session.id': sessionData.sessionId,
        'swarm.type': sessionData.type,
        'session.duration': sessionData.endTime - sessionData.startTime,
      });

      const startTime = Date.now();

      try {
        // Check if session meets extraction criteria
        if (!this.shouldExtract(sessionData)) {
          this.logger.debug(
            `Skipping extraction for session ${sessionData.sessionId}: does not meet criteria`
          );
          throw new Error('Session does not meet extraction criteria');
        }

        // Parallel extraction of different knowledge types
        const [
          successPatterns,
          performanceMetrics,
          learningOutcomes,
          failurePatterns,
          sparcInsights,
        ] = await Promise.all([
          this.extractSuccessPatterns(sessionData),
          this.extractPerformanceMetrics(sessionData),
          this.extractLearningOutcomes(sessionData),
          this.extractFailurePatterns(sessionData),
          this.configuration.sparcEnabled
            ? this.extractSPARCInsights(sessionData)
            : Promise.resolve(undefined),
        ]);

        // Calculate importance and confidence using ML if available
        const importance = await this.calculateImportance(sessionData);
        const confidence = await this.calculateConfidence(sessionData);

        const extractedKnowledge: ExtractedKnowledge = {
          sessionId: sessionData.sessionId,
          extractedAt: Date.now(),
          importance,
          confidence,
          successPatterns,
          performanceMetrics,
          learningOutcomes,
          failurePatterns,
          sparcInsights,
        };

        // Store extracted knowledge
        if (this.lifecycleManager) {
          await this.lifecycleManager.store(
            `knowledge:${sessionData.sessionId}`,
            extractedKnowledge,
            {
              stage: 'warm',
              priority: Math.floor(importance * 10),
              tags: [
                'extracted-knowledge',
                sessionData.type,
                `swarm:${sessionData.swarmId}`,
              ],
            }
          );
        }

        const extractionTime = Date.now() - startTime;

        this.emit('knowledgeExtracted', {
          sessionId: sessionData.sessionId,
          importance,
          confidence,
          extractionTime,
          knowledgeSize: JSON.stringify(extractedKnowledge).length,
        });

        recordMetric('swarm_knowledge_extracted', 1, {
          swarmType: sessionData.type,
          importance: importance.toString(),
          extractionTime: extractionTime.toString(),
        });

        this.logger.info(
          `Knowledge extracted from session ${sessionData.sessionId}`,
          {
            importance,
            confidence,
            extractionTime,
            patterns: successPatterns.length,
            learnings: learningOutcomes.length,
          }
        );

        return extractedKnowledge;
      } catch (error) {
        this.logger.error(
          `Failed to extract knowledge from session ${sessionData.sessionId}:`,
          error
        );
        recordMetric('swarm_knowledge_extraction_failed', 1);
        throw error;
      }
    });
  }

  /**
   * Extract knowledge before lifecycle deletion
   */
  async extractBeforeDeletion(entryId: string, entryData: any): Promise<void> {
    if (!this.shouldExtractFromEntry(entryData)) {
      return;
    }

    try {
      const sessionData = this.parseSessionData(entryData);
      const extractedKnowledge = await this.extractKnowledge(sessionData);

      this.emit('preDeleteExtraction', {
        entryId,
        sessionId: sessionData.sessionId,
        extractedKnowledge,
      });
    } catch (error) {
      this.logger.error(
        `Pre-deletion extraction failed for entry ${entryId}:`,
        error
      );
    }
  }

  private async initializeMLTools(): Promise<void> {
    try {
      // Dynamic import to avoid circular dependencies
      // @ts-ignore - Package may not exist yet, graceful degradation
      const { MLNeuralCoordinator } = await import('@claude-zen/neural-ml');
      // @ts-ignore - Package may not exist yet, graceful degradation
      const { PatternRecognizer } = await import('@claude-zen/neural-ml');

      this.mlCoordinator = new MLNeuralCoordinator({
        enabled: true,
        modelType: 'pattern-analysis',
        optimizationStrategy: 'swarm-intelligence',
      });

      this.patternRecognizer = new PatternRecognizer({
        algorithm: 'clustering',
        minPatternSupport: 0.3,
        confidenceThreshold: 0.7,
      });

      await this.mlCoordinator.initialize();
      await this.patternRecognizer.initialize();
    } catch (error) {
      this.logger.warn(
        'Failed to initialize ML tools, continuing without ML:',
        error
      );
      this.configuration.mlEnabled = false;
    }
  }

  private async initializeBrainTools(): Promise<void> {
    try {
      // @ts-ignore - Package may not exist yet, graceful degradation
      const { BrainCoordinator } = await import('@claude-zen/brain');

      this.brainCoordinator = new BrainCoordinator({
        autonomous: {
          enabled: true,
          learningRate: 0.1,
          adaptationThreshold: 0.7,
        },
        optimization: {
          strategy: 'swarm-analysis',
          objectives: ['pattern-recognition', 'performance-prediction'],
        },
      });

      await this.brainCoordinator.initialize();
    } catch (error) {
      this.logger.warn(
        'Failed to initialize Brain tools, continuing without Brain:',
        error
      );
      this.configuration.brainEnabled = false;
    }
  }

  private async initializeSPARCTools(): Promise<void> {
    try {
      // @ts-ignore - Package may not exist yet, graceful degradation
      const { SPARCEngineCore } = await import('@claude-zen/sparc');

      this.sparcEngine = new SPARCEngineCore({
        enabled: true,
        analysisMode: 'pattern-extraction',
        phases: [
          'specification',
          'pseudocode',
          'architecture',
          'refinement',
          'completion',
        ],
      });

      await this.sparcEngine.initialize();
    } catch (error) {
      this.logger.warn(
        'Failed to initialize SPARC tools, continuing without SPARC:',
        error
      );
      this.configuration.sparcEnabled = false;
    }
  }

  private shouldExtract(sessionData: SwarmSession): boolean {
    const sessionDuration = sessionData.endTime - sessionData.startTime;

    return (
      sessionDuration >= this.configuration.minSessionDuration &&
      sessionData.decisions.length > 0 &&
      sessionData.participants.length > 1
    );
  }

  private shouldExtractFromEntry(entryData: any): boolean {
    return (
      entryData &&
      typeof entryData === 'object' &&
      ('sessionId'in entryData||'swarmId' in entryData) &&
      ('participants'in entryData||'decisions'in entryData)
    );
  }

  private parseSessionData(entryData: any): SwarmSession {
    // Parse and normalize session data from various formats
    return {
      sessionId: entryData.sessionId||entryData.id||`session-${Date.now()}`,
      swarmId: entryData.swarmId||'unknown',
      type: entryData.type||'coordination-swarm',
      startTime: entryData.startTime||Date.now() - 3600000,
      endTime: entryData.endTime||Date.now(),
      participants: entryData.participants||[],
      decisions: entryData.decisions||[],
      collaborationPatterns: entryData.collaborationPatterns||[],
      artifacts: entryData.artifacts||[],
      sparcPhases: entryData.sparcPhases,
    };
  }

  private async extractSuccessPatterns(
    sessionData: SwarmSession
  ): Promise<ExtractedKnowledge['successPatterns']> {
    const patterns: ExtractedKnowledge['successPatterns'] = [];

    try {
      // Use ML pattern recognition if available
      if (this.patternRecognizer) {
        const successfulDecisions = sessionData.decisions.filter(
          (d) => d.outcome === 'success');
        if (successfulDecisions.length > 0) {
          const mlPatterns =
            await this.patternRecognizer.extractPatterns(successfulDecisions);
          patterns.push(
            ...mlPatterns.map((p: any) => ({
              pattern: p.description,
              successRate: p.confidence,
              contexts: p.contexts||[],
              recommendations: p.recommendations||[],
            }))
          );
        }
      }

      // Manual pattern extraction
      const collaborationSuccess = sessionData.collaborationPatterns
        .filter((p) => p.effectiveness > 0.7)
        .map((p) => ({
          pattern: `Collaboration: ${p.pattern}`,
          successRate: p.effectiveness,
          contexts: ['team-coordination'],
          recommendations: [`Repeat pattern: ${p.pattern}`],
        }));

      patterns.push(...collaborationSuccess);
    } catch (error) {
      this.logger.error('Failed to extract success patterns:', error);
    }

    return patterns;
  }

  private async extractPerformanceMetrics(
    sessionData: SwarmSession
  ): Promise<ExtractedKnowledge['performanceMetrics']> {
    const successfulDecisions = sessionData.decisions.filter(
      (d) => d.outcome === 'success').length;
    const totalDecisions = sessionData.decisions.length;
    const avgTaskCompletion =
      totalDecisions > 0 ? successfulDecisions / totalDecisions : 0;

    const avgCollaboration =
      sessionData.collaborationPatterns.length > 0
        ? sessionData.collaborationPatterns.reduce(
            (sum, p) => sum + p.effectiveness,
            0
          ) / sessionData.collaborationPatterns.length
        : 0;

    const qualityArtifacts = sessionData.artifacts.filter(
      (a) => a.quality > 0.7
    ).length;
    const totalArtifacts = sessionData.artifacts.length;
    const decisionQuality =
      totalArtifacts > 0 ? qualityArtifacts / totalArtifacts : 0;

    // Use Brain coordinator for adaptability assessment if available
    let adaptabilityScore = 0.5; // Default
    if (this.brainCoordinator) {
      try {
        const features = [avgTaskCompletion, avgCollaboration, decisionQuality];
        const prediction = await this.brainCoordinator.predict(features);
        adaptabilityScore = prediction.output.adaptability||0.5;
      } catch (error) {
        this.logger.debug('Brain adaptability prediction failed, using default'
        );
      }
    }

    return {
      avgTaskCompletion,
      collaborationEfficiency: avgCollaboration,
      decisionQuality,
      adaptabilityScore,
    };
  }

  private async extractLearningOutcomes(
    sessionData: SwarmSession
  ): Promise<ExtractedKnowledge['learningOutcomes']> {
    const outcomes: ExtractedKnowledge['learningOutcomes'] = [];

    // Extract from successful decisions
    sessionData.decisions
      .filter((d) => d.outcome === 'success')
      .forEach((decision) => {
        outcomes.push({
          topic: 'decision-making',
          insight: `Successful decision in context: ${decision.context}`,
          confidence: 0.8,
          applicability: ['similar-contexts', 'team-decisions'],
        });
      });

    // Extract from high-quality artifacts
    sessionData.artifacts
      .filter((a) => a.quality > 0.8)
      .forEach((artifact) => {
        outcomes.push({
          topic: `${artifact.type}-creation`,
          insight: `High-quality ${artifact.type} production methods`,
          confidence: artifact.quality,
          applicability: [`${artifact.type}-tasks`, 'quality-improvement'],
        });
      });

    return outcomes;
  }

  private async extractFailurePatterns(
    sessionData: SwarmSession
  ): Promise<ExtractedKnowledge['failurePatterns']> {
    const patterns: ExtractedKnowledge['failurePatterns'] = [];

    const failures = sessionData.decisions.filter(
      (d) => d.outcome === 'failure');
    if (failures.length > 0) {
      // Group failures by context
      const failureGroups = new Map<string, typeof failures>();
      failures.forEach((failure) => {
        const context = failure.context||'unknown';
        if (!failureGroups.has(context)) {
          failureGroups.set(context, []);
        }
        failureGroups.get(context)!.push(failure);
      });

      failureGroups.forEach((failureList, context) => {
        patterns.push({
          pattern: `Failures in ${context}`,
          frequency: failureList.length / sessionData.decisions.length,
          rootCauses: ['context-specific-challenges', 'coordination-issues'],
          mitigations: ['additional-context-analysis', 'improved-coordination'],
        });
      });
    }

    return patterns;
  }

  private async extractSPARCInsights(
    sessionData: SwarmSession
  ): Promise<ExtractedKnowledge['sparcInsights']|undefined> {
    if (!sessionData.sparcPhases||!this.sparcEngine) {
      return undefined;
    }

    try {
      const phaseEfficiency: Record<string, number> = {};
      const bottlenecks: string[] = [];
      const optimizations: string[] = [];

      Object.entries(sessionData.sparcPhases).forEach(([phase, metrics]) => {
        phaseEfficiency[phase] = metrics.quality / (metrics.duration / 3600000); // efficiency per hour

        if (metrics.iterations > 3) {
          bottlenecks.push(
            `${phase}: excessive iterations (${metrics.iterations})`
          );
          optimizations.push(
            `Improve ${phase} initial quality to reduce iterations`
          );
        }

        if (metrics.quality < 0.7) {
          bottlenecks.push(`${phase}: low quality output (${metrics.quality})`);
          optimizations.push(`Focus on ${phase} quality improvement`);
        }
      });

      return {
        phaseEfficiency,
        bottlenecks,
        optimizations,
      };
    } catch (error) {
      this.logger.error('Failed to extract SPARC insights:', error);
      return undefined;
    }
  }

  private async calculateImportance(
    sessionData: SwarmSession
  ): Promise<number> {
    let importance = 0.5; // Base importance

    // Factor in session duration
    const durationHours =
      (sessionData.endTime - sessionData.startTime) / 3600000;
    importance += Math.min(durationHours * 0.1, 0.3);

    // Factor in decision success rate
    const successRate =
      sessionData.decisions.length > 0
        ? sessionData.decisions.filter((d) => d.outcome === 'success').length /
          sessionData.decisions.length
        : 0;
    importance += successRate * 0.3;

    // Factor in collaboration effectiveness
    const avgCollaboration =
      sessionData.collaborationPatterns.length > 0
        ? sessionData.collaborationPatterns.reduce(
            (sum, p) => sum + p.effectiveness,
            0
          ) / sessionData.collaborationPatterns.length
        : 0;
    importance += avgCollaboration * 0.2;

    // Use Brain coordinator for ML-based importance if available
    if (this.brainCoordinator) {
      try {
        const features = [
          durationHours,
          successRate,
          avgCollaboration,
          sessionData.participants.length,
        ];
        const prediction = await this.brainCoordinator.predict(features);
        const mlImportance = prediction.output.importance||0.5;
        importance = (importance + mlImportance) / 2; // Blend manual and ML scores
      } catch (error) {
        this.logger.debug('Brain importance prediction failed, using manual calculation'
        );
      }
    }

    return Math.min(Math.max(importance, 0), 1); // Clamp to [0,1]
  }

  private async calculateConfidence(
    sessionData: SwarmSession
  ): Promise<number> {
    let confidence = 0.7; // Base confidence

    // Higher confidence with more data points
    const dataPoints =
      sessionData.decisions.length +
      sessionData.artifacts.length +
      sessionData.collaborationPatterns.length;
    confidence += Math.min(dataPoints * 0.01, 0.2);

    // Higher confidence with consistent patterns
    const consistentDecisions = sessionData.decisions.filter(
      (d) => d.outcome === 'success'
    ).length;
    if (sessionData.decisions.length > 0) {
      const consistency = consistentDecisions / sessionData.decisions.length;
      confidence += consistency * 0.1;
    }

    return Math.min(Math.max(confidence, 0), 1); // Clamp to [0,1]
  }

  // Public methods

  getExtractionStats() {
    return {
      initialized: this.initialized,
      mlEnabled: this.configuration.mlEnabled,
      brainEnabled: this.configuration.brainEnabled,
      sparcEnabled: this.configuration.sparcEnabled,
      minSessionDuration: this.configuration.minSessionDuration,
      minImportanceThreshold: this.configuration.minImportanceThreshold,
    };
  }

  updateConfig(newConfig: Partial<ExtractionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logger.info(
      'Swarm knowledge extractor configuration updated',
      newConfig
    );
  }

  async shutdown(): Promise<void> {
    if (this.lifecycleManager) {
      await this.lifecycleManager.shutdown();
    }

    this.initialized = false;
    this.logger.info('Swarm knowledge extractor shut down');
  }
}
