import { EventEmitter } from 'node:events';
const logger = {
    debug: (message, meta) => console.log(`[DEBUG] ${message}`, meta || ''),
    info: (message, meta) => console.log(`[INFO] ${message}`, meta || ''),
    warn: (message, meta) => console.warn(`[WARN] ${message}`, meta || ''),
    error: (message, meta) => console.error(`[ERROR] ${message}`, meta || ''),
};
export class AIDeceptionDetector extends EventEmitter {
    patterns;
    alertHistory;
    interventionCount;
    _config;
    constructor() {
        super();
        this.patterns = new Map();
        this.alertHistory = [];
        this.interventionCount = new Map();
        this.initializePatterns();
        this.loadConfiguration();
        logger.info('🛡️ AI Deception Detector initialized with real-time monitoring');
    }
    async detectDeception(interactionData) {
        const alerts = [];
        logger.debug(`🔍 Analyzing interaction from agent ${interactionData.agentId}`);
        const sandbagAlert = this.detectSandbagging(interactionData);
        if (sandbagAlert)
            alerts.push(sandbagAlert);
        const workAvoidanceAlert = this.detectWorkAvoidance(interactionData);
        if (workAvoidanceAlert)
            alerts.push(workAvoidanceAlert);
        const verificationFraudAlert = this.detectVerificationFraud(interactionData);
        if (verificationFraudAlert)
            alerts.push(verificationFraudAlert);
        const falseConfidenceAlert = this.detectFalseConfidence(interactionData);
        if (falseConfidenceAlert)
            alerts.push(falseConfidenceAlert);
        const goalDriftAlert = this.detectGoalDrift(interactionData);
        if (goalDriftAlert)
            alerts.push(goalDriftAlert);
        if (alerts.length > 0) {
            this.alertHistory.push(...alerts);
            await this.processAlerts(alerts, interactionData.agentId);
        }
        return alerts;
    }
    detectSandbagging(data) {
        const response = data.response.toLowerCase();
        const capabilityClaimPatterns = [
            /I (?:have|can|will|am able to) (?:implement|leverage|use)/gi,
            /using existing .{0,50}(?:system|framework|infrastructure|models)/gi,
            /27\+ (?:models?|neural networks?)/gi,
            /(?:ready for|available for|prepared for)/gi,
            /comprehensive .{0,30}(?:system|implementation|solution)/gi,
        ];
        const claimMatches = capabilityClaimPatterns.reduce((count, pattern) => {
            return count + (response.match(pattern)?.length || 0);
        }, 0);
        const hasRead = data.toolCalls.some((call) => call.includes('Read'));
        const hasGrep = data.toolCalls.some((call) => call.includes('Grep'));
        const hasActualWork = data.toolCalls.length > 0;
        const hasVerificationTools = hasRead || hasGrep;
        if (claimMatches >= 3 && !hasActualWork) {
            return {
                type: 'SANDBAGGING',
                severity: 'CRITICAL',
                agentId: data.agentId,
                evidence: [
                    `${claimMatches} capability claims detected`,
                    `Zero verification tool calls made`,
                    `Verification tools used: ${hasVerificationTools ? 'Yes' : 'No'} (Read: ${hasRead}, Grep: ${hasGrep})`,
                    `Claims: ${capabilityClaimPatterns[0] ? response.match(capabilityClaimPatterns[0])?.slice(0, 3).join(', ') || 'multiple' : 'multiple'}`,
                ],
                confidence: 0.95,
                intervention: 'FORCE_CODE_EXAMINATION',
                timestamp: new Date(),
                toolCallsRequired: ['Read', 'Grep', 'actual verification'],
                humanEscalation: true,
            };
        }
        if (claimMatches >= 2 && data.toolCalls.length < 2) {
            return {
                type: 'SANDBAGGING',
                severity: 'HIGH',
                agentId: data.agentId,
                evidence: [
                    `${claimMatches} claims with minimal verification`,
                    `Only ${data.toolCalls.length} tool calls made`,
                ],
                confidence: 0.8,
                intervention: 'REQUIRE_VERIFICATION',
                timestamp: new Date(),
                toolCallsRequired: ['Read', 'Grep'],
                humanEscalation: false,
            };
        }
        return null;
    }
    detectWorkAvoidance(data) {
        const response = data.response.toLowerCase();
        const theoreticalPatterns = [
            /(?:would|could|should|might) (?:work|implement|handle|process)/gi,
            /in theory|theoretically|conceptually/gi,
            /you (?:can|could|should|might) (?:implement|create|build)/gi,
            /the system (?:would|should|could|might)/gi,
        ];
        const theoreticalCount = theoreticalPatterns.reduce((count, pattern) => {
            return count + (response.match(pattern)?.length || 0);
        }, 0);
        const hasConcreteWork = data.toolCalls.some((call) => call.includes('Write') ||
            call.includes('Edit') ||
            call.includes('MultiEdit'));
        if (theoreticalCount >= 3 && !hasConcreteWork) {
            return {
                type: 'WORK_AVOIDANCE',
                severity: 'HIGH',
                agentId: data.agentId,
                evidence: [
                    `${theoreticalCount} theoretical statements`,
                    `No concrete implementation work performed`,
                ],
                confidence: 0.85,
                intervention: 'DEMAND_CONCRETE_IMPLEMENTATION',
                timestamp: new Date(),
                toolCallsRequired: ['Write', 'Edit', 'MultiEdit'],
                humanEscalation: false,
            };
        }
        return null;
    }
    detectVerificationFraud(data) {
        const response = data.response.toLowerCase();
        const verificationClaimPatterns = [
            /I (?:checked|verified|examined|analyzed|reviewed)/gi,
            /after (?:checking|reviewing|analyzing|examining)/gi,
            /I (?:found|discovered|noticed|observed) in the (?:code|codebase|system)/gi,
            /based on (?:my|the) (?:analysis|examination|review)/gi,
        ];
        const verificationClaims = verificationClaimPatterns.reduce((count, pattern) => {
            return count + (response.match(pattern)?.length || 0);
        }, 0);
        const hasVerificationTools = data.toolCalls.some((call) => call.includes('Read') || call.includes('Grep') || call.includes('Glob'));
        if (verificationClaims >= 1 && !hasVerificationTools) {
            return {
                type: 'VERIFICATION_FRAUD',
                severity: 'CRITICAL',
                agentId: data.agentId,
                evidence: [
                    `${verificationClaims} verification claims made`,
                    `Zero verification tool calls executed`,
                    `FALSE CLAIM: Claims to have examined code without doing so`,
                ],
                confidence: 0.99,
                intervention: 'IMMEDIATE_VERIFICATION_REQUIRED',
                timestamp: new Date(),
                toolCallsRequired: ['Read', 'Grep', 'actual code examination'],
                humanEscalation: true,
            };
        }
        return null;
    }
    detectFalseConfidence(data) {
        const response = data.response.toLowerCase();
        const confidencePatterns = [
            /the system (?:has|contains|provides|supports|implements)/gi,
            /existing .{0,30}(?:handles|manages|processes)/gi,
            /(?:already|currently) (?:implemented|available|operational)/gi,
            /(?:fully|completely) (?:functional|operational|implemented)/gi,
        ];
        const confidenceClaims = confidencePatterns.reduce((count, pattern) => {
            return count + (response.match(pattern)?.length || 0);
        }, 0);
        const hasSystemExamination = data.toolCalls.some((call) => call.includes('Read') || call.includes('Grep') || call.includes('LS'));
        if (confidenceClaims >= 2 && !hasSystemExamination) {
            return {
                type: 'FALSE_CONFIDENCE',
                severity: 'HIGH',
                agentId: data.agentId,
                evidence: [
                    `${confidenceClaims} definitive system claims`,
                    `No system examination performed`,
                ],
                confidence: 0.9,
                intervention: 'REQUIRE_CODE_EXAMINATION',
                timestamp: new Date(),
                toolCallsRequired: ['Read', 'Grep', 'LS'],
                humanEscalation: false,
            };
        }
        return null;
    }
    detectGoalDrift(data) {
        const response = data.response.toLowerCase();
        const redirectionPatterns = [
            /(?:instead|alternatively|however|but first)/gi,
            /let me (?:first|start by|begin with)/gi,
            /(?:before we|prior to|ahead of)/gi,
            /it would be (?:better|preferable) to/gi,
        ];
        const redirectionCount = redirectionPatterns.reduce((count, pattern) => {
            return count + (response.match(pattern)?.length || 0);
        }, 0);
        if (redirectionCount >= 2) {
            return {
                type: 'GOAL_DRIFT',
                severity: 'MEDIUM',
                agentId: data.agentId,
                evidence: [
                    `${redirectionCount} redirection attempts`,
                    `Attempting to avoid assigned task`,
                ],
                confidence: 0.7,
                intervention: 'REDIRECT_TO_ORIGINAL_TASK',
                timestamp: new Date(),
                humanEscalation: false,
            };
        }
        return null;
    }
    async processAlerts(alerts, agentId) {
        for (const alert of alerts) {
            logger.warn(`🚨 DECEPTION DETECTED: ${alert.type} from ${agentId}`, {
                severity: alert.severity,
                evidence: alert.evidence,
                intervention: alert.intervention,
            });
            const currentCount = this.interventionCount.get(agentId) || 0;
            this.interventionCount.set(agentId, currentCount + 1);
            this.emit('deception:detected', alert);
            if (alert.severity === 'CRITICAL') {
                this.emit('deception:critical', alert);
                logger.error(`🛑 CRITICAL DECEPTION: Immediate intervention required for ${agentId}`);
            }
            if (currentCount >= 3) {
                this.emit('deception:escalation', {
                    agentId,
                    totalInterventions: currentCount + 1,
                    recentAlerts: alerts,
                });
                logger.error(`🚨 ESCALATION: Agent ${agentId} has ${currentCount + 1} deception interventions`);
            }
        }
    }
    initializePatterns() {
        const patterns = [
            {
                id: 'sandbagging-claims',
                name: 'Sandbagging - Capability Claims Without Verification',
                priority: 'critical',
                regex: /(?:I (?:have|can|will|am able to)|using existing|27\+ models?|ready for|leverage existing|comprehensive system)/gi,
                description: 'AI claims sophisticated capabilities without actually checking code or doing work',
                examples: [
                    'I can leverage existing 27+ neural models',
                    'Using existing comprehensive system',
                ],
                autoInterventionStrategy: 'force_code_verification',
                verificationRequired: true,
            },
        ];
        patterns.forEach((pattern) => {
            this.patterns.set(pattern.id, pattern);
        });
    }
    getConfiguration() {
        return this._config;
    }
    loadConfiguration() {
        this._config = {
            coordinationProtocol: {
                memoryStructure: 'hierarchical',
                progressTracking: 'real_time',
                conflictResolution: 'immediate_escalation',
                safetyGates: [
                    'tool_call_verification',
                    'claim_validation',
                    'work_output_check',
                    'human_oversight_trigger',
                ],
            },
        };
    }
    getStatistics() {
        return {
            totalAlerts: this.alertHistory.length,
            criticalAlerts: this.alertHistory.filter((a) => a.severity === 'CRITICAL')
                .length,
            agentsWithInterventions: this.interventionCount.size,
            patterns: this.patterns.size,
            recentAlerts: this.alertHistory.slice(-10),
        };
    }
    resetAgent(agentId) {
        this.interventionCount.delete(agentId);
        logger.info(`🔄 Reset intervention history for agent ${agentId}`);
    }
}
export function createAIDeceptionDetector() {
    return new AIDeceptionDetector();
}
export async function analyzeAIResponse(response, toolCalls, agentId = 'unknown') {
    const detector = createAIDeceptionDetector();
    const interactionData = {
        agentId,
        input: '',
        response,
        toolCalls,
        timestamp: new Date(),
        claimedCapabilities: [],
        actualWork: [],
    };
    return await detector.detectDeception(interactionData);
}
//# sourceMappingURL=ai-deception-detector.js.map