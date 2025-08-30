/**
 * @file AI Safety Orchestrator - Enterprise Integration
 *
 * Professional AI safety coordination system with comprehensive monitoring,
 * deception detection, and intervention capabilities.
 */
import { type AIInteractionData } from './ai-deception-detector';
export declare class SafetyError extends Error {
  readonly context?: Record<string, unknown>;
  constructor(message: string, context?: Record<string, unknown>);
}
/**
 * Enhanced safety orchestration result.
 */
export interface SafetyOrchestrationResult {
  id: string;
  phase1: AutomatedDetectionResult;
  phase2: BehavioralAnalysisResult;
  phase3?: HumanEscalationResult;
  totalTime: number;
  interventionsTriggered: number;
  timestamp: Date;
  success: boolean;
}
/**
 * Enhanced automated detection result.
 */
export interface AutomatedDetectionResult {
  id: string;
  detectionSpeed: string;
  alertsGenerated: number;
  immediateInterventions: number;
  accuracy: number;
  timeMs: number;
  timestamp: Date;
  errors?: string[];
}
/**
 * Enhanced behavioral analysis result.
 */
export interface BehavioralAnalysisResult {
  id: string;
  patternsAnalyzed: number;
  behavioralDeviations: number;
  guidedInterventions: number;
  timeMs: number;
  timestamp: Date;
  analysisQuality: number;
  errors?: string[];
}
/**
 * Enhanced human escalation result.
 */
export interface HumanEscalationResult {
  id: string;
  escalationLevel: 'LOW' | ' MEDIUM' | ' HIGH' | ' CRITICAL';
  responseTime: number;
  resolution: 'APPROVED' | ' REJECTED' | ' MODIFIED' | ' PENDING';
  humanFeedback?: string;
  timestamp: Date;
  errors?: string[];
}
/**
 * Safety metrics interface.
 */
export interface SafetyMetrics {
  totalMonitoringSessions: number;
  alertsGenerated: number;
  interventionsTriggered: number;
  humanEscalations: number;
  averageDetectionTime: number;
  systemUptime: number;
  lastUpdate: Date;
}
/**
 * AI Safety Orchestrator - Enterprise Integration
 *
 * Professional AI safety coordination system with comprehensive monitoring,
 * deception detection, and intervention capabilities.
 */
export declare class AISafetyOrchestrator {
  private deceptionDetector;
  private isMonitoring;
  private metrics;
  private sessionId;
  constructor();
  /**
   * Generate simple ID.
   */
  private generateId;
  /**
   * Start safety monitoring.
   */
  startSafetyMonitoring(): Promise<{
    success: boolean;
    error?: SafetyError;
  }>;
  /**
   * Stop safety monitoring.
   */
  stopSafetyMonitoring(): Promise<{
    success: boolean;
    error?: SafetyError;
  }>;
  /**
   * Evaluate agent safety with comprehensive analysis.
   */
  evaluateAgentSafety(
    agentId: string,
    interactionData: AIInteractionData
  ): Promise<{
    success: boolean;
    value?: SafetyOrchestrationResult;
    error?: SafetyError;
  }>;
  /**
   * Perform automated detection using deception detector.
   */
  private performAutomatedDetection;
  /**
   * Perform behavioral analysis with pattern detection.
   */
  private performBehavioralAnalysis;
  /**
   * Analyze behavioral patterns in interaction data.
   */
  private analyzeBehavioralPatterns;
  /**
   * Detect behavioral deviations from normal patterns.
   */
  private detectBehavioralDeviations;
  /**
   * Determine if human escalation is needed.
   */
  private shouldEscalateToHuman;
  /**
   * Escalate to human oversight.
   */
  private escalateToHuman;
  /**
   * Determine escalation level based on detection results.
   */
  private determineEscalationLevel;
  /**
   * Get current safety metrics.
   */
  getSafetyMetrics(): SafetyMetrics;
  /**
   * Get current safety status.
   */
  getSafetyStatus(): {
    isMonitoring: boolean;
    sessionId: string;
    metrics: SafetyMetrics;
    deceptionDetectorStatus: {
      totalAlerts: number;
      severityBreakdown: Record<string, number>;
      categoryBreakdown: Record<string, number>;
      averageConfidence: number;
      recentAlerts: import('./ai-deception-detector').DeceptionAlert[];
      config: import('./ai-deception-detector').DetectionConfig;
    };
  };
  /**
   * Emergency shutdown procedure.
   */
  emergencyShutdown(): Promise<{
    success: boolean;
    error?: SafetyError;
  }>;
}
/**
 * Create AI safety orchestrator instance.
 */
export declare function createAISafetyOrchestrator(): AISafetyOrchestrator;
/**
 * Create and initialize AI safety orchestrator.
 */
export declare function createInitializedAISafetyOrchestrator(): Promise<{
  success: boolean;
  value?: AISafetyOrchestrator;
  error?: SafetyError;
}>;
//# sourceMappingURL=safety-orchestrator.d.ts.map
