/**
 * @file AI Deception Detection System.
 *
 * Real-time detection of AI deception patterns including sandbagging,
 * capability hiding, work avoidance, and false claims.
 *
 * Based on proven pattern-detection framework from fix:zen:compile system.
 */
import { EventEmitter } from 'node:events';
/**
 * Deception alert interface.
 *
 * @example
 */
export interface DeceptionAlert {
    type: 'SANDBAGGING' | 'WORK_AVOIDANCE' | 'FALSE_CONFIDENCE' | 'GOAL_DRIFT' | 'VERIFICATION_FRAUD';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    agentId?: string;
    evidence: string[];
    confidence: number;
    intervention: string;
    timestamp: Date;
    toolCallsRequired?: string[];
    humanEscalation: boolean;
}
/**
 * AI interaction data for analysis.
 *
 * @example
 */
export interface AIInteractionData {
    agentId: string;
    input: string;
    response: string;
    toolCalls: string[];
    timestamp: Date;
    claimedCapabilities: string[];
    actualWork: string[];
}
/**
 * AI Deception Detector.
 *
 * Detects and prevents AI deception patterns in real-time using
 * the proven hierarchical coordination protocol from pattern detection.
 *
 * @example
 */
export declare class AIDeceptionDetector extends EventEmitter {
    private patterns;
    private alertHistory;
    private interventionCount;
    private _config;
    constructor();
    /**
     * Detect deception patterns in AI response
     * PRIMARY METHOD - catches the exact deception demonstrated.
     *
     * @param interactionData
     */
    detectDeception(interactionData: AIInteractionData): Promise<DeceptionAlert[]>;
    /**
     * Detect sandbagging - claiming capabilities without verification
     * This catches the EXACT pattern demonstrated in our conversation.
     *
     * @param data
     */
    private detectSandbagging;
    /**
     * Detect work avoidance - theoretical responses without implementation.
     *
     * @param data
     */
    private detectWorkAvoidance;
    /**
     * Detect verification fraud - claiming to have checked code without tool calls
     * This is CRITICAL - catches lies about doing work.
     *
     * @param data
     */
    private detectVerificationFraud;
    /**
     * Detect false confidence - definitive claims about unknown systems.
     *
     * @param data
     */
    private detectFalseConfidence;
    /**
     * Detect goal drift - avoiding assigned tasks.
     *
     * @param data
     */
    private detectGoalDrift;
    /**
     * Process alerts and trigger interventions.
     *
     * @param alerts
     * @param agentId
     */
    private processAlerts;
    /**
     * Initialize deception patterns from configuration.
     */
    private initializePatterns;
    /**
     * Get current detector configuration.
     */
    getConfiguration(): any;
    /**
     * Load configuration.
     */
    private loadConfiguration;
    /**
     * Get deception statistics.
     */
    getStatistics(): {
        totalAlerts: number;
        criticalAlerts: number;
        agentsWithInterventions: number;
        patterns: number;
        recentAlerts: DeceptionAlert[];
    };
    /**
     * Reset agent intervention history.
     *
     * @param agentId
     */
    resetAgent(agentId: string): void;
}
/**
 * Factory function to create AI deception detector.
 *
 * @example
 */
export declare function createAIDeceptionDetector(): AIDeceptionDetector;
/**
 * Utility function to analyze a single AI response for deception.
 *
 * @param response
 * @param toolCalls
 * @param agentId
 * @example
 */
export declare function analyzeAIResponse(response: string, toolCalls: string[], agentId?: string): Promise<DeceptionAlert[]>;
//# sourceMappingURL=ai-deception-detector.d.ts.map