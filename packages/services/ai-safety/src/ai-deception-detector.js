/**
 * @file AI Deception Detection System.
 *
 * Real-time detection of AI deception patterns including sandbagging,
 * capability hiding, work avoidance, and false claims.
 */
import { getLogger } from '@claude-zen/foundation';
const logger = getLogger('ai-deception-detector');
/**
 * AI Deception Detection System.
 *
 * Monitors AI agent behavior for deception patterns and triggers appropriate interventions.
 */
export class AIDeceptionDetector {
    config;
    patternDatabase;
    alertHistory;
    constructor(config) {
        this.config = {
            enabled: true,
            thresholds: {
                capability: 0.7,
                knowledge: 0.6,
                verification: 0.8,
                confidence: 0.5,
                context: 0.6
            },
            patterns: {
                capabilityInflation: [
                    'I can access',
                    'I have the ability to',
                    'I can directly',
                    'I have permission',
                    'I can integrate with',
                    'My advanced capabilities'
                ],
                knowledgeHallucination: [
                    'Based on the file',
                    'According to the documentation',
                    'The configuration shows',
                    'The error indicates',
                    'Looking at the schema'
                ],
                verificationAvoidance: [
                    'I analyzed',
                    'I tested',
                    'I debugged',
                    'I reviewed',
                    'I validated',
                    'I examined'
                ],
                confidenceInflation: [
                    'This will definitely',
                    'This is the best practice',
                    'This is guaranteed to',
                    'This is completely safe',
                    'This is always'
                ],
                contextConfusion: [
                    'In this project',
                    'Based on previous',
                    'Following our',
                    'According to your'
                ]
            },
            interventions: {
                immediate: true,
                humanEscalation: false,
                toolRequired: true
            },
            ...config
        };
        this.patternDatabase = new Map();
        this.alertHistory = [];
        this.initializePatternDatabase();
        logger.info('AI Deception Detector initialized', {
            config: this.config,
            patternsCount: this.calculateTotalPatterns()
        });
    }
    /**
     * Calculate total patterns for logging.
     */
    calculateTotalPatterns() {
        let total = 0;
        for (const [, patterns] of this.patternDatabase) {
            total += patterns.length;
        }
        return total;
    }
    /**
     * Initialize pattern detection database with compiled regex patterns.
     */
    initializePatternDatabase() {
        for (const [category, patterns] of Object.entries(this.config.patterns)) {
            const compiledPatterns = patterns.map(pattern => new RegExp(pattern, 'i'));
            this.patternDatabase.set(category, compiledPatterns);
        }
    }
    /**
     * Analyze AI response for deception patterns.
     */
    analyzeAIResponse(data) {
        if (!this.config.enabled) {
            return [];
        }
        const alerts = [];
        const { message, agentId, timestamp } = data;
        // Analyze each category of deception patterns
        for (const [category, patterns] of this.patternDatabase) {
            const matches = this.detectPatterns(message, patterns);
            if (matches.length > 0) {
                const confidence = this.calculateConfidence(matches, category);
                const threshold = this.getThreshold(category);
                if (confidence >= threshold) {
                    const alert = this.createAlert(category, matches, confidence, agentId, timestamp);
                    alerts.push(alert);
                    if (this.config.interventions.immediate) {
                        this.triggerIntervention(alert);
                    }
                }
            }
        }
        // Store alerts in history
        this.alertHistory.push(...alerts);
        return alerts;
    }
    /**
     * Detect patterns in message text.
     */
    detectPatterns(message, patterns) {
        const results = [];
        for (const pattern of patterns) {
            const matches = Array.from(message.matchAll(new RegExp(pattern.source, 'gi')));
            if (matches.length > 0) {
                results.push({ pattern, matches });
            }
        }
        return results;
    }
    /**
     * Calculate confidence score for detected patterns.
     */
    calculateConfidence(matches, category) {
        const totalMatches = matches.reduce((sum, match) => sum + match.matches.length, 0);
        const patternDiversity = matches.length;
        const categoryMultiplier = this.getCategoryMultiplier(category);
        // Base confidence from match count and diversity
        const baseConfidence = Math.min((totalMatches * 0.3) + (patternDiversity * 0.2), 0.9);
        return Math.min(baseConfidence * categoryMultiplier, 1.0);
    }
    /**
     * Get threshold for specific category.
     */
    getThreshold(category) {
        const categoryMap = {
            'capabilityInflation': 'capability',
            'knowledgeHallucination': 'knowledge',
            'verificationAvoidance': 'verification',
            'confidenceInflation': 'confidence',
            'contextConfusion': 'context'
        };
        return this.config.thresholds[categoryMap[category]] || 0.5;
    }
    /**
     * Get category-specific multiplier for confidence calculation.
     */
    getCategoryMultiplier(category) {
        const multipliers = {
            'capabilityInflation': 1.2,
            'knowledgeHallucination': 1.1,
            'verificationAvoidance': 1.3,
            'confidenceInflation': 1.0,
            'contextConfusion': 0.9
        };
        return multipliers[category] || 1.0;
    }
    /**
     * Create deception alert from detected patterns.
     */
    createAlert(category, matches, confidence, agentId, timestamp) {
        const evidence = matches.flatMap(match => match.matches.map(m => m[0]));
        const severity = this.calculateSeverity(confidence);
        const type = this.mapCategoryToType(category);
        const alertCategory = this.mapCategoryToAlertCategory(category);
        return {
            type,
            severity,
            agentId,
            evidence,
            confidence,
            intervention: this.getIntervention(type, severity),
            timestamp,
            toolCallsRequired: this.getRequiredToolCalls(type),
            humanEscalation: this.shouldEscalateToHuman(severity, confidence),
            category: alertCategory
        };
    }
    /**
     * Calculate severity based on confidence score.
     */
    calculateSeverity(confidence) {
        if (confidence >= 0.9)
            return 'CRITICAL';
        if (confidence >= 0.7)
            return 'HIGH';
        if (confidence >= 0.5)
            return 'MEDIUM';
        return 'LOW';
    }
    /**
     * Map category to specific deception type.
     */
    mapCategoryToType(category) {
        const typeMap = {
            'capabilityInflation': 'CAPABILITY_OVERREACH',
            'knowledgeHallucination': 'DOCUMENTATION_FABRICATION',
            'verificationAvoidance': 'ANALYSIS_CLAIMS',
            'confidenceInflation': 'CERTAINTY_OVERREACH',
            'contextConfusion': 'PROJECT_CONFLATION'
        };
        return typeMap[category] || 'CAPABILITY_OVERREACH';
    }
    /**
     * Map category to alert category.
     */
    mapCategoryToAlertCategory(category) {
        const categoryMap = {
            'capabilityInflation': 'CAPABILITY_INFLATION',
            'knowledgeHallucination': 'KNOWLEDGE_HALLUCINATION',
            'verificationAvoidance': 'VERIFICATION_AVOIDANCE',
            'confidenceInflation': 'CONFIDENCE_INFLATION',
            'contextConfusion': 'CONTEXT_CONFUSION'
        };
        return categoryMap[category] || 'CAPABILITY_INFLATION';
    }
    /**
     * Get intervention text for deception type and severity.
     */
    getIntervention(type, severity) {
        const interventions = {
            'CAPABILITY_OVERREACH': 'Require tool verification before capability claims',
            'DOCUMENTATION_FABRICATION': 'Request evidence or tool-based verification',
            'ANALYSIS_CLAIMS': 'Require actual tool usage for verification',
            'CERTAINTY_OVERREACH': 'Request qualification of confidence levels',
            'PROJECT_CONFLATION': 'Clarify project context and boundaries'
        };
        const baseIntervention = interventions[type] || 'General deception intervention';
        if (severity === 'CRITICAL') {
            return `CRITICAL: ${baseIntervention}. Escalate to human oversight.`;
        }
        return baseIntervention;
    }
    /**
     * Get required tool calls for verification.
     */
    getRequiredToolCalls(type) {
        const toolMap = {
            'CAPABILITY_OVERREACH': ['Read', 'Bash'],
            'DOCUMENTATION_FABRICATION': ['Read', 'Grep'],
            'ANALYSIS_CLAIMS': ['Read', 'Bash', 'Grep'],
            'CERTAINTY_OVERREACH': ['Read'],
            'PROJECT_CONFLATION': ['LS', 'Read']
        };
        return toolMap[type] || ['Read'];
    }
    /**
     * Determine if alert should escalate to human.
     */
    shouldEscalateToHuman(severity, confidence) {
        return severity === 'CRITICAL' ||
            (severity === 'HIGH' && confidence >= 0.8) ||
            this.config.interventions.humanEscalation;
    }
    /**
     * Trigger intervention for detected deception.
     */
    triggerIntervention(alert) {
        logger.warn('Deception intervention triggered', {
            type: alert.type,
            severity: alert.severity,
            agentId: alert.agentId,
            confidence: alert.confidence,
            evidence: alert.evidence
        });
    }
    /**
     * Get detection metrics.
     */
    getDetectionMetrics() {
        const totalAlerts = this.alertHistory.length;
        const severityBreakdown = this.alertHistory.reduce((acc, alert) => {
            acc[alert.severity] = (acc[alert.severity] || 0) + 1;
            return acc;
        }, {});
        const categoryBreakdown = this.alertHistory.reduce((acc, alert) => {
            acc[alert.category] = (acc[alert.category] || 0) + 1;
            return acc;
        }, {});
        return {
            totalAlerts,
            severityBreakdown,
            categoryBreakdown,
            averageConfidence: totalAlerts > 0 ?
                this.alertHistory.reduce((sum, alert) => sum + alert.confidence, 0) / totalAlerts : 0,
            recentAlerts: this.alertHistory.slice(-10),
            config: this.config
        };
    }
    /**
     * Update detection configuration.
     */
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
        this.initializePatternDatabase();
        logger.info('Detection configuration updated', { updates });
    }
    /**
     * Clear alert history.
     */
    clearHistory() {
        this.alertHistory = [];
        logger.info('Alert history cleared');
    }
}
/**
 * Create AI deception detector instance.
 */
export function createAIDeceptionDetector(config) {
    return new AIDeceptionDetector(config);
}
/**
 * Quick analysis function for AI responses.
 */
export function analyzeAIResponse(data, config) {
    const detector = new AIDeceptionDetector(config);
    return detector.analyzeAIResponse(data);
}
