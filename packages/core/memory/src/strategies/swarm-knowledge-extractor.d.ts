/**
 * Swarm Knowledge Extractor - Pre-deletion Intelligence Extraction
 *
 * Extracts valuable patterns and insights from swarm sessions before memory deletion,
 * leveraging ML tools from Brain, Neural-ML, and SPARC packages for intelligent
 * pattern recognition and knowledge preservation.
 */
import { TypedEventBase } from '@claude-zen/foundation';
interface SwarmSession {
  sessionId: string;
  swarmId: string;
  type:
    | 'dev-swarm'
    | 'ops-swarm'
    | 'coordination-swarm'
    | 'hybrid-swarm'
    | 'sparc-swarm';
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
  successPatterns: Array<{
    pattern: string;
    successRate: number;
    contexts: string[];
    recommendations: string[];
  }>;
  performanceMetrics: {
    avgTaskCompletion: number;
    collaborationEfficiency: number;
    decisionQuality: number;
    adaptabilityScore: number;
  };
  learningOutcomes: Array<{
    topic: string;
    insight: string;
    confidence: number;
    applicability: string[];
  }>;
  failurePatterns: Array<{
    pattern: string;
    frequency: number;
    rootCauses: string[];
    mitigations: string[];
  }>;
  sparcInsights?: {
    phaseEfficiency: Record<string, number>;
    bottlenecks: string[];
    optimizations: string[];
  };
}
interface ExtractionConfig {
  enabled: boolean;
  minSessionDuration: number;
  minImportanceThreshold: number;
  mlEnabled: boolean;
  brainEnabled: boolean;
  sparcEnabled: boolean;
  extractionTimeout: number;
  preserveRawData: boolean;
}
export declare class SwarmKnowledgeExtractor extends TypedEventBase {
  private logger;
  private config;
  private telemetry;
  private lifecycleManager?;
  private brainCoordinator?;
  private mlCoordinator?;
  private patternRecognizer?;
  private sparcEngine?;
  private initialized;
  constructor(config: ExtractionConfig);
  initialize(): Promise<void>;
  /**
   * Extract knowledge from a swarm session before deletion
   */
  extractKnowledge(sessionData: SwarmSession): Promise<ExtractedKnowledge>;
  /**
   * Extract knowledge before lifecycle deletion
   */
  extractBeforeDeletion(entryId: string, entryData: any): Promise<void>;
  private initializeMLTools;
  private initializeBrainTools;
  private initializeSPARCTools;
  private shouldExtract;
  private shouldExtractFromEntry;
  private parseSessionData;
  private extractSuccessPatterns;
  private extractPerformanceMetrics;
  private extractLearningOutcomes;
  private extractFailurePatterns;
  private extractSPARCInsights;
  private calculateImportance;
  private calculateConfidence;
  getExtractionStats(): {
    initialized: boolean;
    mlEnabled: any;
    brainEnabled: any;
    sparcEnabled: any;
    minSessionDuration: any;
    minImportanceThreshold: any;
  };
  updateConfig(newConfig: Partial<ExtractionConfig>): void;
  shutdown(): Promise<void>;
}
export {};
//# sourceMappingURL=swarm-knowledge-extractor.d.ts.map
