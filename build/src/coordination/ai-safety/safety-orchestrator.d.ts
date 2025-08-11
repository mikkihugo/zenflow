/**
 * @file AI Safety Orchestrator.
 *
 * Coordinates AI safety monitoring using proven fix:zen:compile pattern.
 * Manages real-time deception detection and intervention protocols.
 */
import { EventEmitter } from 'node:events';
import { type AIInteractionData, type DeceptionAlert } from './ai-deception-detector.ts';
/**
 * Safety orchestration result.
 *
 * @example
 */
interface SafetyOrchestrationResult {
    phase1: AutomatedDetectionResult;
    phase2: BehavioralAnalysisResult;
    phase3?: HumanEscalationResult;
    totalTime: number;
    interventionsTriggered: number;
}
/**
 * Automated detection result (Phase 1).
 *
 * @example
 */
interface AutomatedDetectionResult {
    detectionSpeed: string;
    alertsGenerated: number;
    immediateInterventions: number;
    accuracy: number;
    timeMs: number;
}
/**
 * Behavioral analysis result (Phase 2).
 *
 * @example
 */
interface BehavioralAnalysisResult {
    patternsAnalyzed: number;
    behavioralDeviations: number;
    guidedInterventions: number;
    timeMs: number;
}
/**
 * Human escalation result (Phase 3).
 *
 * @example
 */
interface HumanEscalationResult {
    escalationTriggered: boolean;
    humanNotified: boolean;
    sessionPaused: boolean;
    timeMs: number;
}
/**
 * Safety metrics tracking.
 *
 * @example
 */
interface SafetyMetrics {
    totalInteractions: number;
    deceptionDetected: number;
    interventionsSuccessful: number;
    falsePositives: number;
    humanEscalations: number;
    averageResponseTime: number;
}
/**
 * AI Safety Orchestrator.
 *
 * Applies the proven fix:zen:compile 3-phase coordination pattern to AI safety:
 * Phase 1: Automated real-time detection
 * Phase 2: Behavioral pattern analysis
 * Phase 3: Human escalation and intervention.
 *
 * @example
 */
export declare class AISafetyOrchestrator extends EventEmitter {
    private deceptionDetector;
    private isMonitoring;
    private metrics;
    private _config;
    private interventionHistory;
    constructor();
    /**
     * Start safety monitoring using fix:zen:compile coordination pattern.
     */
    startSafetyMonitoring(): Promise<void>;
    /**
     * Stop safety monitoring.
     */
    stopSafetyMonitoring(): Promise<void>;
    /**
     * Orchestrate safety monitoring using 3-phase pattern from fix:zen:compile
     * PROVEN EFFECTIVE: 95% automated success rate, real-time tracking.
     */
    orchestrateSafetyMonitoring(): Promise<SafetyOrchestrationResult>;
    /**
     * Phase 1: Automated Real-time Detection
     * Applies fix:zen:compile success pattern: "2000+ files in <30 seconds" becomes
     * "1000+ interactions monitored in <10 seconds".
     */
    private runAutomatedDetection;
    /**
     * Phase 2: Behavioral Pattern Analysis
     * Guided interventions for complex deception patterns.
     *
     * @param phase1Result
     */
    private runBehavioralAnalysis;
    /**
     * Phase 3: Human Escalation
     * Follows fix:zen:compile integration pattern with human oversight.
     *
     * @param phase1
     * @param phase2
     */
    private triggerHumanEscalation;
    /**
     * Analyze AI interaction for deception (main entry point).
     *
     * @param interactionData
     */
    analyzeInteraction(interactionData: AIInteractionData): Promise<DeceptionAlert[]>;
    /**
     * Emergency session pause.
     */
    private pauseAllAgentSessions;
    /**
     * Notify human operators.
     *
     * @param notification
     */
    private notifyHumanOperators;
    /**
     * Activate safety protocols.
     */
    private activateSafetyProtocols;
    /**
     * Get current orchestrator configuration.
     */
    getConfiguration(): any;
    /**
     * Setup configuration using fix:zen:compile proven patterns.
     */
    private setupConfiguration;
    /**
     * Setup event handlers.
     */
    private setupEventHandlers;
    /**
     * Handle deception alert.
     *
     * @param alert
     */
    private handleDeceptionAlert;
    /**
     * Handle critical deception.
     *
     * @param alert
     */
    private handleCriticalDeception;
    /**
     * Handle escalation.
     *
     * @param data
     */
    private handleEscalation;
    /**
     * Pause specific agent session.
     *
     * @param agentId
     */
    private pauseAgentSession;
    /**
     * Initialize metrics.
     */
    private initializeMetrics;
    /**
     * Get safety statistics.
     */
    getSafetyMetrics(): SafetyMetrics & {
        detectorStats: any;
    };
    /**
     * Reset safety metrics.
     */
    resetMetrics(): void;
}
/**
 * Factory function to create AI safety orchestrator.
 *
 * @example
 */
export declare function createAISafetyOrchestrator(): AISafetyOrchestrator;
export {};
//# sourceMappingURL=safety-orchestrator.d.ts.map