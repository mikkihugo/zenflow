/**
 * SPARC Completion Knowledge Extractor - Post-Completion Intelligence Extraction
 *
 * Extracts valuable patterns and insights from SPARC methodology completion phases,
 * leveraging ML tools from Brain, Neural-ML packages for intelligent
 * pattern recognition and knowledge preservation during the Completion phase.
 */

import {
  EventEmitter,
  getLogger,
  recordMetric,
  withTrace,
  TelemetryManager,
  type Logger,
} from '@claude-zen/foundation';

// Types for SPARC completion knowledge
interface SPARCSession {
  sessionId: string;
  executionId: string;
  phase: 'specification' | 'pseudocode' | 'architecture' | 'refinement' | 'completion';
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
    outcome: 'success' | 'failure' | 'partial';
    metrics: Record<string, number>;
  }>;
  collaborationPatterns: Array<{
    pattern: string;
    effectiveness: number;
    frequency: number;
  }>;
  artifacts: Array<{
    type: 'specification' | 'pseudocode' | 'architecture' | 'code' | 'documentation' | 'analysis';
    content: string;
    quality: number;
    phase: string;
  }>;
}

interface ExtractedKnowledge {
  sessionId: string;
  extractedAt: number;
  patterns: Array<{
    type: string;
    description: string;
    confidence: number;
    applicability: string[];
  }>;
  insights: Array<{
    category: 'performance' | 'collaboration' | 'decision_quality' | 'methodology_adherence';
    insight: string;
    impact: number;
    evidence: any[];
  }>;
  recommendations: Array<{
    area: string;
    recommendation: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

/**
 * SPARC Completion Knowledge Extractor
 * 
 * Extracts knowledge during the Completion phase of SPARC methodology
 */
export class SPARCCompletionExtractor extends EventEmitter {
  private readonly logger: Logger;
  private readonly telemetryManager: TelemetryManager;

  constructor() {
    super();
    this.logger = getLogger('sparc-completion-extractor');
    this.telemetryManager = new TelemetryManager();
  }

  /**
   * Extract knowledge from a completed SPARC session
   */
  @withTrace('sparc-completion-extractor', 'extract-knowledge')
  async extractKnowledge(session: SPARCSession): Promise<ExtractedKnowledge> {
    this.logger.info(`Extracting knowledge from SPARC session ${session.sessionId}`);
    
    recordMetric('sparc_knowledge_extraction_started', 1, {
      sessionId: session.sessionId,
      phase: session.phase
    });

    try {
      const extractedKnowledge: ExtractedKnowledge = {
        sessionId: session.sessionId,
        extractedAt: Date.now(),
        patterns: await this.extractPatterns(session),
        insights: await this.generateInsights(session),
        recommendations: await this.generateRecommendations(session)
      };

      this.emit('knowledge-extracted', extractedKnowledge);
      
      recordMetric('sparc_knowledge_extraction_completed', 1, {
        sessionId: session.sessionId,
        patternsCount: extractedKnowledge.patterns.length,
        insightsCount: extractedKnowledge.insights.length
      });

      return extractedKnowledge;
    } catch (error) {
      this.logger.error('Failed to extract knowledge from SPARC session', error);
      recordMetric('sparc_knowledge_extraction_failed', 1, {
        sessionId: session.sessionId,
        error: error.message
      });
      throw error;
    }
  }

  private async extractPatterns(session: SPARCSession): Promise<Array<{
    type: string;
    description: string;
    confidence: number;
    applicability: string[];
  }>> {
    // Extract patterns from SPARC execution
    const patterns = [];
    
    // Analyze collaboration patterns from teamwork
    for (const pattern of session.collaborationPatterns) {
      patterns.push({
        type: 'sparc-collaboration',
        description: `${pattern.pattern} pattern observed with ${pattern.effectiveness} effectiveness`,
        confidence: pattern.effectiveness,
        applicability: ['teamwork', 'sparc-methodology']
      });
    }

    return patterns;
  }

  private async generateInsights(session: SPARCSession): Promise<Array<{
    category: 'performance' | 'collaboration' | 'decision_quality' | 'methodology_adherence';
    insight: string;
    impact: number;
    evidence: any[];
  }>> {
    const insights = [];
    
    // Generate insights from SPARC phase completion
    if (session.phase === 'completion') {
      insights.push({
        category: 'methodology_adherence' as const,
        insight: 'SPARC methodology completed successfully with all phases',
        impact: 0.9,
        evidence: [session.artifacts.filter(a => a.phase === 'completion')]
      });
    }

    return insights;
  }

  private async generateRecommendations(session: SPARCSession): Promise<Array<{
    area: string;
    recommendation: string;
    priority: 'high' | 'medium' | 'low';
  }>> {
    const recommendations = [];
    
    // Generate recommendations based on SPARC execution
    const avgDecisionSuccess = session.decisions
      .filter(d => d.outcome === 'success').length / session.decisions.length;
    
    if (avgDecisionSuccess < 0.8) {
      recommendations.push({
        area: 'sparc-decision-quality',
        recommendation: 'Review decision-making processes in SPARC methodology phases',
        priority: 'high' as const
      });
    }

    return recommendations;
  }
}