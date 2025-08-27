/**
 * @file AI Deception Detection System.
 *
 * Real-time detection of AI deception patterns including sandbagging,
 * capability hiding, work avoidance, and false claims.
 */
/**
 * Deception alert interface.
 */
export interface DeceptionAlert {
    type: 'TOOL_OMNIPOTENCE' | 'API_ASSUMPTIONS' | 'LIBRARY_HALLUCINATION' | 'VERSION_CONFUSION' | 'PERMISSION_ASSUMPTIONS' | 'INTEGRATION_CLAIMS' | 'PERFORMANCE_PROMISES' | 'CAPABILITY_OVERREACH' | 'SKILL_FABRICATION' | 'ACCESS_INFLATION' | 'MEMORY_FABRICATION' | 'IMPLEMENTATION_CLAIMS' | 'FILENAME_INFERENCE' | 'CONFIGURATION_ASSUMPTION' | 'DOCUMENTATION_FABRICATION' | 'ERROR_MESSAGE_INVENTION' | 'DEPENDENCY_MAPPING' | 'SCHEMA_HALLUCINATION' | 'FACTUAL_INVENTION' | 'EXPERTISE_MIMICRY' | 'REFERENCE_FABRICATION' | 'CODE_INVENTION' | 'DOCUMENTATION_HALLUCINATION' | 'ANALYSIS_CLAIMS' | 'TESTING_CLAIMS' | 'DEBUGGING_CLAIMS' | 'REVIEW_CLAIMS' | 'VALIDATION_CLAIMS' | 'EXAMINATION_FRAUD' | 'SEARCH_AVOIDANCE' | 'CERTAINTY_OVERREACH' | 'BEST_PRACTICE_CLAIMS' | 'COMPATIBILITY_ASSURANCE' | 'SECURITY_ASSUMPTIONS' | 'PROJECT_CONFLATION' | 'TIMELINE_CONFUSION' | 'ENVIRONMENT_ASSUMPTIONS';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    agentId?: string;
    evidence: string[];
    confidence: number;
    intervention: string;
    timestamp: Date;
    toolCallsRequired?: string[];
    humanEscalation: boolean;
    category: 'CAPABILITY_INFLATION' | 'KNOWLEDGE_HALLUCINATION' | 'VERIFICATION_AVOIDANCE' | 'CONFIDENCE_INFLATION' | 'CONTEXT_CONFUSION';
}
/**
 * AI interaction data for analysis.
 */
export interface AIInteractionData {
    agentId: string;
    message: string;
    toolCalls?: string[];
    claimsVerification?: boolean;
    contextAwareness?: string;
    confidenceLevel?: number;
    timestamp: Date;
    responseTime?: number;
    behaviorMetrics?: {
        hesitation: number;
        certainty: number;
        toolUsage: number;
        verificationAttempts: number;
    };
}
/**
 * Detection configuration interface.
 */
export interface DetectionConfig {
    enabled: boolean;
    thresholds: {
        capability: number;
        knowledge: number;
        verification: number;
        confidence: number;
        context: number;
    };
    patterns: {
        capabilityInflation: string[];
        knowledgeHallucination: string[];
        verificationAvoidance: string[];
        confidenceInflation: string[];
        contextConfusion: string[];
    };
    interventions: {
        immediate: boolean;
        humanEscalation: boolean;
        toolRequired: boolean;
    };
}
/**
 * AI Deception Detection System.
 *
 * Monitors AI agent behavior for deception patterns and triggers appropriate interventions.
 */
export declare class AIDeceptionDetector {
    private config;
    private patternDatabase;
    private alertHistory;
    constructor(config?: Partial<DetectionConfig>);
    /**
     * Calculate total patterns for logging.
     */
    private calculateTotalPatterns;
    /**
     * Initialize pattern detection database with compiled regex patterns.
     */
    private initializePatternDatabase;
    /**
     * Analyze AI response for deception patterns.
     */
    analyzeAIResponse(data: AIInteractionData): DeceptionAlert[];
    /**
     * Detect patterns in message text.
     */
    private detectPatterns;
    /**
     * Calculate confidence score for detected patterns.
     */
    private calculateConfidence;
    /**
     * Get threshold for specific category.
     */
    private getThreshold;
    /**
     * Get category-specific multiplier for confidence calculation.
     */
    private getCategoryMultiplier;
    /**
     * Create deception alert from detected patterns.
     */
    private createAlert;
    /**
     * Calculate severity based on confidence score.
     */
    private calculateSeverity;
    /**
     * Map category to specific deception type.
     */
    private mapCategoryToType;
    /**
     * Map category to alert category.
     */
    private mapCategoryToAlertCategory;
    /**
     * Get intervention text for deception type and severity.
     */
    private getIntervention;
    /**
     * Get required tool calls for verification.
     */
    private getRequiredToolCalls;
    /**
     * Determine if alert should escalate to human.
     */
    private shouldEscalateToHuman;
    /**
     * Trigger intervention for detected deception.
     */
    private triggerIntervention;
    /**
     * Get detection metrics.
     */
    getDetectionMetrics(): {
        totalAlerts: number;
        severityBreakdown: Record<string, number>;
        categoryBreakdown: Record<string, number>;
        averageConfidence: number;
        recentAlerts: DeceptionAlert[];
        config: DetectionConfig;
    };
    /**
     * Update detection configuration.
     */
    updateConfig(updates: Partial<DetectionConfig>): void;
    /**
     * Clear alert history.
     */
    clearHistory(): void;
}
/**
 * Create AI deception detector instance.
 */
export declare function createAIDeceptionDetector(config?: Partial<DetectionConfig>): AIDeceptionDetector;
/**
 * Quick analysis function for AI responses.
 */
export declare function analyzeAIResponse(data: AIInteractionData, config?: Partial<DetectionConfig>): DeceptionAlert[];
//# sourceMappingURL=ai-deception-detector.d.ts.map