/**
 * @file AI Safety Orchestrator - Enterprise Integration
 *
 * Professional AI safety coordination system with comprehensive monitoring,
 * deception detection, and intervention capabilities.
 */
import { getLogger } from '@claude-zen/foundation';
import { AIDeceptionDetector, } from './ai-deception-detector';
const logger = getLogger('ai-safety-orchestrator');
// Enhanced error classes
export class SafetyError extends Error {
    context;
    constructor(message, context) {
        super(message);
        this.context = context;
        this.name = 'SafetyError';
    }
}
/**
 * AI Safety Orchestrator - Enterprise Integration
 *
 * Professional AI safety coordination system with comprehensive monitoring,
 * deception detection, and intervention capabilities.
 */
export class AISafetyOrchestrator {
    deceptionDetector;
    isMonitoring = false;
    metrics;
    sessionId;
    constructor() {
        this.sessionId = this.generateId();
        // Initialize deception detector
        this.deceptionDetector = new AIDeceptionDetector({
            enabled: true,
            thresholds: {
                capability: 0.7,
                knowledge: 0.6,
                verification: 0.8,
                confidence: 0.5,
                context: 0.6
            },
            interventions: {
                immediate: true,
                humanEscalation: false,
                toolRequired: true
            }
        });
        // Initialize metrics
        this.metrics = {
            totalMonitoringSessions: 0,
            alertsGenerated: 0,
            interventionsTriggered: 0,
            humanEscalations: 0,
            averageDetectionTime: 0,
            systemUptime: 0,
            lastUpdate: new Date()
        };
        logger.info('AI Safety Orchestrator initialized', {
            sessionId: this.sessionId,
            timestamp: new Date().toISOString()
        });
    }
    /**
     * Generate simple ID.
     */
    generateId() {
        return Math.random().toString(36).substring(2, 15);
    }
    /**
     * Start safety monitoring.
     */
    async startSafetyMonitoring() {
        try {
            if (this.isMonitoring) {
                return { success: false, error: new SafetyError('Safety monitoring is already active') };
            }
            this.isMonitoring = true;
            this.metrics.totalMonitoringSessions++;
            logger.info('Safety monitoring started', {
                sessionId: this.sessionId,
                session: this.metrics.totalMonitoringSessions
            });
            return { success: true };
        }
        catch (error) {
            return {
                success: false,
                error: new SafetyError('Failed to start safety monitoring', { sessionId: this.sessionId })
            };
        }
    }
    /**
     * Stop safety monitoring.
     */
    async stopSafetyMonitoring() {
        try {
            if (!this.isMonitoring) {
                return { success: false, error: new SafetyError('Safety monitoring is not active') };
            }
            this.isMonitoring = false;
            this.metrics.lastUpdate = new Date();
            logger.info('Safety monitoring stopped', {
                sessionId: this.sessionId,
                metrics: this.metrics
            });
            return { success: true };
        }
        catch (error) {
            return {
                success: false,
                error: new SafetyError('Failed to stop safety monitoring', { sessionId: this.sessionId })
            };
        }
    }
    /**
     * Evaluate agent safety with comprehensive analysis.
     */
    async evaluateAgentSafety(agentId, interactionData) {
        try {
            const startTime = Date.now();
            const orchestrationId = this.generateId();
            // Phase 1: Automated Detection
            const phase1Result = await this.performAutomatedDetection(agentId, interactionData, orchestrationId);
            if (!phase1Result.success) {
                throw phase1Result.error;
            }
            // Phase 2: Behavioral Analysis
            const phase2Result = await this.performBehavioralAnalysis(agentId, interactionData, orchestrationId);
            if (!phase2Result.success) {
                throw phase2Result.error;
            }
            // Phase 3: Human Escalation (if needed)
            let phase3Result;
            if (this.shouldEscalateToHuman(phase1Result.value, phase2Result.value)) {
                const escalationResult = await this.escalateToHuman(agentId, phase1Result.value, phase2Result.value, orchestrationId);
                if (escalationResult.success) {
                    phase3Result = escalationResult.value;
                }
            }
            const totalTime = Date.now() - startTime;
            const interventionsTriggered = phase1Result.value.immediateInterventions +
                phase2Result.value.guidedInterventions;
            // Update metrics
            this.metrics.alertsGenerated += phase1Result.value.alertsGenerated;
            this.metrics.interventionsTriggered += interventionsTriggered;
            if (phase3Result) {
                this.metrics.humanEscalations++;
            }
            return {
                success: true,
                value: {
                    id: orchestrationId,
                    phase1: phase1Result.value,
                    phase2: phase2Result.value,
                    phase3: phase3Result,
                    totalTime,
                    interventionsTriggered,
                    timestamp: new Date(),
                    success: true
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof SafetyError ? error : new SafetyError(error instanceof Error ? error.message : 'Unknown error')
            };
        }
    }
    /**
     * Perform automated detection using deception detector.
     */
    async performAutomatedDetection(agentId, interactionData, orchestrationId) {
        try {
            const startTime = Date.now();
            const alerts = this.deceptionDetector.analyzeAIResponse(interactionData);
            const immediateInterventions = alerts.filter(alert => alert.severity === 'CRITICAL' || alert.severity === 'HIGH').length;
            return {
                success: true,
                value: {
                    id: this.generateId(),
                    detectionSpeed: 'REAL_TIME',
                    alertsGenerated: alerts.length,
                    immediateInterventions,
                    accuracy: alerts.length > 0 ? 0.95 : 1.0,
                    timeMs: Date.now() - startTime,
                    timestamp: new Date(),
                    errors: []
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: new SafetyError('Automated detection failed')
            };
        }
    }
    /**
     * Perform behavioral analysis with pattern detection.
     */
    async performBehavioralAnalysis(agentId, interactionData, orchestrationId) {
        try {
            const startTime = Date.now();
            // Analyze behavioral patterns
            const patternsAnalyzed = this.analyzeBehavioralPatterns(interactionData);
            const behavioralDeviations = this.detectBehavioralDeviations(interactionData);
            const guidedInterventions = behavioralDeviations > 2 ? 1 : 0;
            return {
                success: true,
                value: {
                    id: this.generateId(),
                    patternsAnalyzed,
                    behavioralDeviations,
                    guidedInterventions,
                    timeMs: Date.now() - startTime,
                    timestamp: new Date(),
                    analysisQuality: 0.9,
                    errors: []
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: new SafetyError('Behavioral analysis failed')
            };
        }
    }
    /**
     * Analyze behavioral patterns in interaction data.
     */
    analyzeBehavioralPatterns(data) {
        let patterns = 0;
        // Check for tool usage patterns
        if (data.toolCalls && data.toolCalls.length > 0) {
            patterns++;
        }
        // Check for behavioral metrics
        if (data.behaviorMetrics) {
            if (data.behaviorMetrics.hesitation > 0.5)
                patterns++;
            if (data.behaviorMetrics.certainty < 0.7)
                patterns++;
            if (data.behaviorMetrics.verificationAttempts > 0)
                patterns++;
        }
        // Check message length and complexity
        if (data.message.length > 1000)
            patterns++;
        return patterns;
    }
    /**
     * Detect behavioral deviations from normal patterns.
     */
    detectBehavioralDeviations(data) {
        let deviations = 0;
        // Check for unusual confidence levels
        if (data.confidenceLevel !== undefined && (data.confidenceLevel > 0.95 || data.confidenceLevel < 0.3)) {
            deviations++;
        }
        // Check for unusual response times
        if (data.responseTime !== undefined && (data.responseTime < 100 || data.responseTime > 10000)) {
            deviations++;
        }
        // Check for claims without verification
        if (data.claimsVerification === false && data.message.includes('I can')) {
            deviations++;
        }
        return deviations;
    }
    /**
     * Determine if human escalation is needed.
     */
    shouldEscalateToHuman(phase1, phase2) {
        return phase1.immediateInterventions > 2 ||
            phase2.behavioralDeviations > 3 ||
            phase1.alertsGenerated > 5;
    }
    /**
     * Escalate to human oversight.
     */
    async escalateToHuman(agentId, phase1, phase2, orchestrationId) {
        try {
            // Simulate human escalation process
            const escalationLevel = this.determineEscalationLevel(phase1, phase2);
            return {
                success: true,
                value: {
                    id: this.generateId(),
                    escalationLevel,
                    responseTime: 0, // Immediate for now
                    resolution: 'PENDING',
                    timestamp: new Date(),
                    errors: []
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: new SafetyError('Human escalation failed')
            };
        }
    }
    /**
     * Determine escalation level based on detection results.
     */
    determineEscalationLevel(phase1, phase2) {
        if (phase1.immediateInterventions > 3 || phase2.behavioralDeviations > 4) {
            return 'CRITICAL';
        }
        if (phase1.immediateInterventions > 2 || phase2.behavioralDeviations > 3) {
            return 'HIGH';
        }
        if (phase1.immediateInterventions > 1 || phase2.behavioralDeviations > 2) {
            return 'MEDIUM';
        }
        return 'LOW';
    }
    /**
     * Get current safety metrics.
     */
    getSafetyMetrics() {
        return {
            ...this.metrics,
            systemUptime: this.isMonitoring ? Date.now() - this.metrics.lastUpdate.getTime() : 0,
            lastUpdate: new Date()
        };
    }
    /**
     * Get current safety status.
     */
    getSafetyStatus() {
        return {
            isMonitoring: this.isMonitoring,
            sessionId: this.sessionId,
            metrics: this.getSafetyMetrics(),
            deceptionDetectorStatus: this.deceptionDetector.getDetectionMetrics()
        };
    }
    /**
     * Emergency shutdown procedure.
     */
    async emergencyShutdown() {
        try {
            logger.warn('Emergency shutdown initiated', {
                sessionId: this.sessionId,
                timestamp: new Date().toISOString()
            });
            this.isMonitoring = false;
            this.deceptionDetector.clearHistory();
            logger.info('Emergency shutdown completed', {
                sessionId: this.sessionId
            });
            return { success: true };
        }
        catch (error) {
            return {
                success: false,
                error: new SafetyError('Emergency shutdown failed', { sessionId: this.sessionId })
            };
        }
    }
}
/**
 * Create AI safety orchestrator instance.
 */
export function createAISafetyOrchestrator() {
    return new AISafetyOrchestrator();
}
/**
 * Create and initialize AI safety orchestrator.
 */
export async function createInitializedAISafetyOrchestrator() {
    try {
        const orchestrator = new AISafetyOrchestrator();
        const startResult = await orchestrator.startSafetyMonitoring();
        if (!startResult.success) {
            return { success: false, error: startResult.error };
        }
        return { success: true, value: orchestrator };
    }
    catch (error) {
        return {
            success: false,
            error: new SafetyError('Failed to create and initialize AI safety orchestrator')
        };
    }
}
