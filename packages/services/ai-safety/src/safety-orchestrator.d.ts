/**
 * @file AI Safety Orchestrator - Enterprise Integration
 *
 * Professional AI safety coordination system with comprehensive monitoring,
 * deception detection, and intervention capabilities.
 */
import { type AIInteractionData } from './ai-deception-detector';
export declare class SafetyError extends Error {
  readonly context?: Record<string, unknown>;
  constructor(): void {
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
}
/**
 * Enhanced behavioral analysis result.
 */
export interface BehavioralAnalysisResult {
  id: string;
}
/**
 * Enhanced human escalation result.
 */
export interface HumanEscalationResult {
  id: string;
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
  constructor(): void {
    success: boolean;
    error?: SafetyError;
  }>;
  /**
   * Stop safety monitoring.
   */
  stopSafetyMonitoring(): void {
    success: boolean;
    error?: SafetyError;
  }>;
  /**
   * Evaluate agent safety with comprehensive analysis.
   */
  evaluateAgentSafety(): void {
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
  getSafetyMetrics(): void {
    isMonitoring: boolean;
    sessionId: string;
    metrics: SafetyMetrics;
    deceptionDetectorStatus: {
      totalAlerts: number;
      severityBreakdown: Record<string, number>;
      categoryBreakdown: Record<string, number>;
      averageConfidence: number;
      recentAlerts: import(): void {
    success: boolean;
    error?: SafetyError;
  }>;
}
/**
 * Create AI safety orchestrator instance.
 */
export declare function createAISafetyOrchestrator(): void {
  success: boolean;
  value?: AISafetyOrchestrator;
  error?: SafetyError;
}>;
//# sourceMappingURL=safety-orchestrator.d.ts.map
