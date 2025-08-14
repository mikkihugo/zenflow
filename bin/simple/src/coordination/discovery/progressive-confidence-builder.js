import { EventEmitter } from 'node:events';
import { getLogger } from '../../config/logging-config.ts';
const logger = getLogger('ProgressiveConfidence');
export class ProgressiveConfidenceBuilder extends EventEmitter {
    memoryStore;
    agui;
    config;
    confidence = 0.0;
    confidenceMetrics;
    learningHistory = [];
    domains = new Map();
    relationships = [];
    iteration = 0;
    hiveFact;
    validationAuditTrail = [];
    currentSessionId;
    validatorId;
    totalQuestionsAsked = 0;
    totalQuestionsAnswered = 0;
    checkpointsReached = new Set();
    constructor(_discoveryBridge, memoryStore, agui, config = {}) {
        super();
        this.memoryStore = memoryStore;
        this.agui = agui;
        this.config = config;
        this.config = {
            targetConfidence: 0.8,
            maxIterations: 10,
            researchThreshold: 0.6,
            validationBatchSize: 5,
            memoryNamespace: 'progressive-confidence',
            validationCheckpoints: [0.3, 0.5, 0.7, 0.9],
            requireHumanApprovalAt: [0.5, 0.8],
            minimumValidationsPerDomain: 2,
            validationTimeoutMs: 300000,
            enableDetailedAuditTrail: true,
            ...config,
        };
        this.confidenceMetrics = this.initializeMetrics();
        this.currentSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }
    async buildConfidence(context) {
        logger.info('Starting progressive confidence building', {
            projectPath: context.projectPath,
            targetConfidence: this.config.targetConfidence,
            sessionId: this.currentSessionId,
        });
        if (context.validatorId !== undefined) {
            this.validatorId = context.validatorId;
        }
        if (context.existingDomains) {
            await this.initializeFromExisting(context.existingDomains);
        }
        if (context.previousLearning) {
            this.learningHistory.push(...context.previousLearning);
            this.recalculateConfidenceFromHistory();
        }
        const hiveFact = getHiveFACT();
        if (hiveFact !== null) {
            this.hiveFact = hiveFact;
        }
        while (this.confidence < this.config.targetConfidence &&
            this.iteration < this.config.maxIterations) {
            this.iteration++;
            logger.info(`Starting iteration ${this.iteration}`, {
                currentConfidence: this.confidence,
            });
            try {
                await this.importMoreDocuments(context);
                await this.checkValidationCheckpoints();
                await this.performHumanValidation();
                if (this.confidence < this.config.researchThreshold) {
                    await this.performOnlineResearch();
                }
                await this.refineDomainUnderstanding();
                this.updateConfidenceMetrics();
                await this.persistLearning();
                if (this.config.enableDetailedAuditTrail) {
                    await this.updateAuditTrail();
                }
                await this.showProgress();
                this.emit('progress', {
                    iteration: this.iteration,
                    confidence: this.confidence,
                    metrics: this.confidenceMetrics,
                    domainCount: this.domains.size,
                });
            }
            catch (error) {
                logger.error(`Error in iteration ${this.iteration}:`, error);
                this.recordLearningEvent('confidence_update', {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    iteration: this.iteration,
                }, -0.1);
            }
        }
        if (this.confidence >= this.config.targetConfidence) {
            await this.performFinalValidation();
        }
        return this.buildConfidentDomainMap();
    }
    async checkValidationCheckpoints() {
        const checkpoints = this.config.validationCheckpoints || [];
        const approvalPoints = this.config.requireHumanApprovalAt || [];
        for (const checkpoint of checkpoints) {
            if (this.confidence >= checkpoint &&
                !this.checkpointsReached.has(checkpoint)) {
                this.checkpointsReached.add(checkpoint);
                if (approvalPoints.includes(checkpoint)) {
                    await this.performCheckpointValidation(checkpoint, true);
                }
                else {
                    await this.performCheckpointValidation(checkpoint, false);
                }
            }
        }
    }
    async performCheckpointValidation(checkpoint, requireApproval) {
        logger.info(`Reached validation checkpoint: ${(checkpoint * 100).toFixed(0)}%`, {
            requireApproval,
            currentConfidence: this.confidence,
        });
        const checkpointQuestion = {
            id: `checkpoint_${checkpoint}_${this.iteration}`,
            type: 'checkpoint',
            question: requireApproval
                ? `🔍 APPROVAL CHECKPOINT (${(checkpoint * 100).toFixed(0)}% confidence)\n\nWe've reached a significant milestone. Current state:\n- Domains identified: ${this.domains.size}\n- Confidence: ${(this.confidence * 100).toFixed(1)}%\n- Validations performed: ${this.getTotalValidations()}\n\nDo you approve to continue, or would you like to review/adjust?`
                : `📊 CHECKPOINT (${(checkpoint * 100).toFixed(0)}% confidence)\n\nProgress update:\n- Domains: ${this.domains.size}\n- Confidence: ${(this.confidence * 100).toFixed(1)}%\n\nAny feedback or adjustments needed?`,
            context: {
                checkpoint,
                domains: Array.from(this.domains.keys()),
                metrics: this.confidenceMetrics,
                iteration: this.iteration,
            },
            options: requireApproval
                ? ['Continue', 'Review domains', 'Adjust confidence', 'Add notes']
                : ['Continue', 'Add feedback'],
            confidence: this.confidence,
            priority: requireApproval ? 'critical' : 'high',
            validationReason: 'Validation checkpoint reached',
            expectedImpact: 0.0,
        };
        const response = (await this.agui.askQuestion(checkpointQuestion));
        if (response === 'Review domains') {
            await this.reviewDomains();
        }
        else if (response === 'Adjust confidence') {
            await this.adjustConfidence();
        }
        else if (response === 'Add notes' || response === 'Add feedback') {
            await this.collectValidatorNotes(checkpoint);
        }
        this.recordLearningEvent('confidence_update', {
            type: 'checkpoint',
            checkpoint,
            response,
            requireApproval,
        }, 0.0);
    }
    async importMoreDocuments(_context) {
        logger.info('Importing additional documents for analysis');
        const importQuestion = {
            id: `import_${this.iteration}`,
            type: 'relevance',
            question: 'Would you like to import additional documentation? (Enter paths or "skip" to continue)',
            context: {
                currentDomains: Array.from(this.domains.keys()),
                documentCount: this.getDocumentCount(),
                confidence: this.confidence,
            },
            allowCustom: true,
            confidence: this.confidence,
        };
        const response = (await this.agui.askQuestion(importQuestion));
        if (response && response.toLowerCase() !== 'skip') {
            const paths = response
                ?.split(/[,\n]/)
                .map((p) => p.trim())
                .filter((p) => p);
            for (const path of paths) {
                try {
                    const insights = await this.analyzeDocument(path);
                    this.recordLearningEvent('document_import', {
                        path,
                        insights,
                        extracted: insights.concepts.length,
                    }, 0.05);
                }
                catch (error) {
                    logger.warn(`Failed to import document ${path}:`, error);
                }
            }
        }
    }
    async performHumanValidation() {
        logger.info('Performing human validation round');
        const questions = this.generateValidationQuestions();
        const prioritizedQuestions = this.prioritizeQuestions(questions);
        const batches = this.batchQuestions(prioritizedQuestions, this.config.validationBatchSize);
        for (const batch of batches) {
            const startTime = Date.now();
            await this.agui.showMessage(`📋 Validation Batch ${batches.indexOf(batch) + 1}/${batches.length} (${batch.length} questions)`, 'info');
            const responses = (await this.agui.askBatchQuestions(batch));
            const duration = Date.now() - startTime;
            for (let i = 0; i < batch.length; i++) {
                const question = batch[i];
                const response = responses?.[i];
                this.totalQuestionsAsked++;
                if (response && question) {
                    this.totalQuestionsAnswered++;
                    await this.processValidationResponse(question, response, duration / batch.length);
                }
            }
            await this.checkMinimumValidations();
        }
    }
    async performOnlineResearch() {
        if (!this.hiveFact) {
            logger.warn('HiveFACT not available for research');
            return;
        }
        logger.info('Performing online research to improve confidence');
        for (const [domainName, domain] of this.domains) {
            if (domain.detailedConfidence.overall < 0.7) {
                try {
                    const queries = this.generateResearchQueries(domain);
                    for (const query of queries) {
                        const facts = await this.hiveFact.searchFacts({
                            query,
                            limit: 5,
                        });
                        if (facts.length > 0) {
                            const research = {
                                query,
                                sources: facts.map((f) => f.metadata.source),
                                insights: this.extractInsights(facts),
                                confidence: this.calculateResearchConfidence(facts),
                                relevantDomains: [domainName],
                            };
                            domain.research.push(research);
                            this.recordLearningEvent('online_research', {
                                domain: domainName,
                                query,
                                factsFound: facts.length,
                                sources: research.sources,
                            }, 0.1 * research.confidence);
                        }
                    }
                }
                catch (error) {
                    logger.error(`Research failed for domain ${domainName}:`, error);
                }
            }
        }
    }
    async refineDomainUnderstanding() {
        logger.info('Refining domain understanding');
        const refinements = this.analyzePatterns();
        for (const refinement of refinements) {
            const domain = this.domains.get(refinement.domainName);
            if (domain) {
                this.applyRefinement(domain, refinement);
                domain.refinementHistory.push({
                    timestamp: Date.now(),
                    changes: refinement.changes,
                    reason: refinement.reason,
                    confidenceImpact: refinement.confidenceImpact,
                });
                this.recordLearningEvent('domain_refinement', {
                    domain: refinement.domainName,
                    changes: refinement.changes,
                    reason: refinement.reason,
                }, refinement.confidenceImpact);
            }
        }
        this.updateDomainRelationships();
    }
    updateConfidenceMetrics() {
        const documentCoverage = this.calculateDocumentCoverage();
        const humanValidations = this.calculateValidationScore();
        const researchDepth = this.calculateResearchDepth();
        const domainClarity = this.calculateDomainClarity();
        const consistency = this.calculateConsistency();
        this.confidenceMetrics = {
            overall: (documentCoverage +
                humanValidations +
                researchDepth +
                domainClarity +
                consistency) /
                5,
            documentCoverage,
            humanValidations,
            researchDepth,
            domainClarity,
            consistency,
        };
        this.confidence = this.confidenceMetrics.overall;
        for (const domain of this.domains.values()) {
            this.updateDomainConfidence(domain);
        }
    }
    async persistLearning() {
        try {
            await this.memoryStore.store(`${this.config.memoryNamespace}/learning-history`, 'progressive-confidence', {
                history: this.learningHistory,
                iteration: this.iteration,
                confidence: this.confidence,
                metrics: this.confidenceMetrics,
            });
            await this.memoryStore.store(`${this.config.memoryNamespace}/domains`, 'domain-map', {
                domains: Array.from(this.domains.entries()),
                relationships: this.relationships,
            });
            logger.debug('Learning persisted to memory');
        }
        catch (error) {
            logger.error('Failed to persist learning:', error);
        }
    }
    async showProgress() {
        const progress = {
            iteration: this.iteration,
            confidence: `${(this.confidence * 100).toFixed(1)}%`,
            target: `${(this.config.targetConfidence * 100).toFixed(1)}%`,
            domains: this.domains.size,
            validations: this.getTotalValidations(),
            research: this.getTotalResearch(),
            metrics: {
                documentCoverage: `${(this.confidenceMetrics.documentCoverage * 100).toFixed(1)}%`,
                humanValidations: `${(this.confidenceMetrics.humanValidations * 100).toFixed(1)}%`,
                researchDepth: `${(this.confidenceMetrics.researchDepth * 100).toFixed(1)}%`,
                domainClarity: `${(this.confidenceMetrics.domainClarity * 100).toFixed(1)}%`,
                consistency: `${(this.confidenceMetrics.consistency * 100).toFixed(1)}%`,
            },
        };
        await this.agui.showProgress(progress);
    }
    async performFinalValidation() {
        logger.info('Performing final validation');
        const summary = this.generateSummary();
        const finalQuestion = {
            id: 'final_validation',
            type: 'boundary',
            question: `Based on my analysis, I've identified ${this.domains.size} domains with ${(this.confidence * 100).toFixed(1)}% confidence. Would you like to:\n\n${summary}\n\n1. Approve and proceed\n2. Request more iterations\n3. Manually adjust domains`,
            context: {
                domains: Array.from(this.domains.entries()),
                relationships: this.relationships,
                confidence: this.confidenceMetrics,
            },
            options: ['1', '2', '3'],
            confidence: this.confidence,
        };
        const response = (await this.agui.askQuestion(finalQuestion));
        if (response === '2') {
            this.config.maxIterations += 3;
        }
        else if (response === '3') {
            await this.performManualAdjustments();
        }
    }
    async initializeFromExisting(existingDomains) {
        for (const domain of existingDomains) {
            const confidentDomain = {
                ...domain,
                confidence: domain.confidence || 0.5,
                detailedConfidence: this.initializeMetrics(),
                path: domain.codeFiles.length > 0 && domain.codeFiles[0]
                    ? domain.codeFiles[0]
                    : '',
                files: domain.codeFiles,
                suggestedConcepts: domain.concepts,
                technologies: [],
                validations: [],
                research: [],
                refinementHistory: [],
            };
            this.domains.set(domain.name, confidentDomain);
        }
    }
    generateValidationQuestions() {
        const questions = [];
        for (const [name, domain] of this.domains) {
            if (domain.detailedConfidence.domainClarity < 0.7) {
                questions.push({
                    id: `boundary_${name}_${this.iteration}`,
                    type: 'boundary',
                    question: `Is "${name}" the correct name and boundary for this domain?\n\nFiles: ${domain.files.slice(0, 5).join(', ')}...\nConcepts: ${domain.suggestedConcepts.join(', ')}`,
                    context: { domain },
                    options: ['Yes', 'No - suggest changes'],
                    confidence: domain.detailedConfidence.overall,
                });
            }
        }
        for (const rel of this.relationships) {
            if (rel.confidence < 0.7) {
                questions.push({
                    id: `relationship_${rel.sourceDomain}_${rel.targetDomain}_${this.iteration}`,
                    type: 'relationship',
                    question: `Does "${rel.sourceDomain}" ${rel.type.replace('_', ' ')} "${rel.targetDomain}"?`,
                    context: { relationship: rel },
                    options: ['Yes', 'No', 'Unsure'],
                    confidence: rel.confidence,
                });
            }
        }
        return questions;
    }
    generateResearchQueries(domain) {
        const queries = [];
        const mainTech = domain.technologies?.[0];
        if (mainTech) {
            queries.push(`${mainTech} ${domain.name} best practices`);
            queries.push(`${mainTech} ${domain.suggestedConcepts[0]} architecture patterns`);
        }
        for (const concept of domain.suggestedConcepts.slice(0, 3)) {
            queries.push(`${concept} domain driven design`);
        }
        return queries;
    }
    initializeMetrics() {
        return {
            overall: 0.0,
            documentCoverage: 0.0,
            humanValidations: 0.0,
            researchDepth: 0.0,
            domainClarity: 0.0,
            consistency: 0.0,
        };
    }
    recordLearningEvent(type, data, confidenceImpact) {
        const event = {
            timestamp: Date.now(),
            type,
            data,
            confidenceBefore: this.confidence,
            confidenceAfter: Math.max(0, Math.min(1, this.confidence + confidenceImpact)),
            source: `iteration_${this.iteration}`,
        };
        this.learningHistory.push(event);
        this.confidence = event.confidenceAfter;
    }
    async analyzeDocument(_path) {
        return {
            concepts: ['concept1', 'concept2'],
            domains: ['domain1'],
            confidence: 0.7,
        };
    }
    batchQuestions(questions, batchSize) {
        const batches = [];
        for (let i = 0; i < questions.length; i += batchSize) {
            batches.push(questions.slice(i, i + batchSize));
        }
        return batches;
    }
    async processValidationResponse(question, response, responseTime) {
        const confidenceBefore = this.confidence;
        for (const domain of this.domains.values()) {
            const isRelevant = this.isQuestionRelevantToDomain(question, domain);
            if (isRelevant) {
                const validation = {
                    questionId: question.id,
                    question: question.question,
                    userResponse: response,
                    timestamp: Date.now(),
                    impactOnConfidence: 0.0,
                    validationType: question.type,
                    confidenceBefore,
                    confidenceAfter: confidenceBefore,
                    ...(responseTime !== undefined && {
                        validationDuration: responseTime,
                    }),
                };
                validation.impactOnConfidence = this.calculateConfidenceImpact(question, response, domain);
                this.confidence = Math.max(0, Math.min(1, this.confidence + validation.impactOnConfidence));
                validation.confidenceAfter = this.confidence;
                domain.validations.push(validation);
                this.recordLearningEvent('human_validation', {
                    questionId: question.id,
                    questionType: question.type,
                    response,
                    domain: domain.name,
                    impactOnConfidence: validation.impactOnConfidence,
                    responseTime,
                }, validation.impactOnConfidence);
            }
        }
    }
    calculateConfidenceImpact(question, response, domain) {
        const positiveResponses = ['yes', 'correct', 'approve', 'continue'];
        const negativeResponses = ['no', 'incorrect', 'wrong', 'adjust'];
        const isPositive = positiveResponses.some((r) => response.toLowerCase().includes(r));
        const isNegative = negativeResponses.some((r) => response.toLowerCase().includes(r));
        let impact = 0.0;
        switch (question.type) {
            case 'boundary':
                impact = isPositive ? 0.1 : isNegative ? -0.15 : 0.05;
                break;
            case 'relationship':
                impact = isPositive ? 0.05 : isNegative ? -0.05 : 0.02;
                break;
            case 'naming':
                impact = isPositive ? 0.08 : isNegative ? -0.1 : 0.03;
                break;
            case 'priority':
                impact = isPositive ? 0.03 : 0.0;
                break;
            case 'checkpoint':
                impact = 0.0;
                break;
            case 'review':
                impact = question.expectedImpact || 0.0;
                break;
            default:
                impact = isPositive ? 0.05 : isNegative ? -0.05 : 0.0;
        }
        const validationCount = domain.validations.length;
        if (validationCount < this.config.minimumValidationsPerDomain) {
            impact *= 1.5;
        }
        return impact;
    }
    extractInsights(facts) {
        return facts.map((f) => {
            if (typeof f.content === 'string') {
                return `${f.content.substring(0, 100)}...`;
            }
            return `${JSON.stringify(f.content).substring(0, 100)}...`;
        });
    }
    calculateResearchConfidence(facts) {
        const sourceCount = new Set(facts.map((f) => f.metadata.source)).size;
        const avgAge = facts.reduce((sum, f) => sum + (Date.now() - f.metadata.timestamp), 0) /
            facts.length;
        const ageFactor = Math.max(0, 1 - avgAge / (30 * 24 * 60 * 60 * 1000));
        return Math.min(1, (sourceCount / 3) * 0.5 + ageFactor * 0.5);
    }
    analyzePatterns() {
        const refinements = [];
        for (const domain of this.domains.values()) {
            const negativeValidations = domain.validations.filter((v) => v.userResponse.toLowerCase().includes('no') ||
                v.userResponse.toLowerCase().includes('incorrect'));
            if (negativeValidations.length > 1) {
                refinements.push({
                    domainName: domain.name,
                    changes: ['Review domain boundary', 'Consider splitting or merging'],
                    reason: 'Multiple negative validations',
                    confidenceImpact: -0.1,
                });
            }
        }
        return refinements;
    }
    applyRefinement(domain, refinement) {
        logger.info(`Applying refinement to domain ${domain.name}:`, refinement.changes);
    }
    updateDomainRelationships() {
        const domains = Array.from(this.domains.values());
        for (let i = 0; i < domains.length; i++) {
            for (let j = i + 1; j < domains.length; j++) {
                const domain1 = domains[i];
                const domain2 = domains[j];
                if (domain1 && domain2) {
                    const relationship = this.detectRelationship(domain1, domain2);
                    if (relationship) {
                        this.relationships.push(relationship);
                    }
                }
            }
        }
    }
    detectRelationship(domain1, domain2) {
        const sharedConcepts = domain1.suggestedConcepts.filter((c) => domain2.suggestedConcepts.includes(c));
        if (sharedConcepts.length > 0) {
            return {
                sourceDomain: domain1.name,
                targetDomain: domain2.name,
                type: 'communicates_with',
                confidence: Math.min(1, sharedConcepts.length * 0.3),
                evidence: sharedConcepts,
            };
        }
        return null;
    }
    calculateDocumentCoverage() {
        const totalDocs = this.getDocumentCount();
        const docsWithDomains = this.domains.size * 2;
        return Math.min(1, docsWithDomains / Math.max(totalDocs, 1));
    }
    calculateValidationScore() {
        let totalValidations = 0;
        let positiveValidations = 0;
        for (const domain of this.domains.values()) {
            totalValidations += domain.validations.length;
            positiveValidations += domain.validations.filter((v) => v.userResponse.toLowerCase().includes('yes') ||
                v.userResponse.toLowerCase().includes('correct')).length;
        }
        return totalValidations > 0 ? positiveValidations / totalValidations : 0;
    }
    calculateResearchDepth() {
        let totalResearch = 0;
        let highQualityResearch = 0;
        for (const domain of this.domains.values()) {
            totalResearch += domain.research.length;
            highQualityResearch += domain.research.filter((r) => r.confidence > 0.7).length;
        }
        return totalResearch > 0 ? highQualityResearch / totalResearch : 0;
    }
    calculateDomainClarity() {
        const domainScores = Array.from(this.domains.values()).map((d) => {
            const hasGoodName = d.validations.some((v) => v.question.includes('correct name') &&
                v.userResponse.toLowerCase().includes('yes'));
            const hasResearch = d.research.length > 0;
            const hasRefinements = d.refinementHistory.length > 0;
            return ((hasGoodName ? 0.4 : 0) +
                (hasResearch ? 0.3 : 0) +
                (hasRefinements ? 0.3 : 0));
        });
        return domainScores.length > 0
            ? domainScores.reduce((a, b) => a + b, 0) / domainScores.length
            : 0;
    }
    calculateConsistency() {
        const recentEvents = this.learningHistory.slice(-20);
        const positiveEvents = recentEvents.filter((e) => e.confidenceAfter > e.confidenceBefore).length;
        return recentEvents.length > 0 ? positiveEvents / recentEvents.length : 0.5;
    }
    updateDomainConfidence(domain) {
        const newDetailedConfidence = {
            overall: this.confidence * 0.8 + Math.random() * 0.2,
            documentCoverage: this.confidenceMetrics.documentCoverage,
            humanValidations: domain.validations.length > 0 ? this.calculateValidationScore() : 0,
            researchDepth: domain.research.length > 0 ? 0.8 : 0.2,
            domainClarity: domain.validations.filter((v) => v.impactOnConfidence > 0).length /
                Math.max(domain.validations.length, 1),
            consistency: this.confidenceMetrics.consistency,
        };
        domain.detailedConfidence = newDetailedConfidence;
        domain.confidence = newDetailedConfidence.overall;
    }
    getDocumentCount() {
        return this.learningHistory.filter((e) => e.type === 'document_import')
            .length;
    }
    getTotalValidations() {
        return Array.from(this.domains.values()).reduce((sum, d) => sum + d.validations.length, 0);
    }
    getTotalResearch() {
        return Array.from(this.domains.values()).reduce((sum, d) => sum + d.research.length, 0);
    }
    generateSummary() {
        const domainList = Array.from(this.domains.entries())
            .map(([name, domain]) => `• ${name} (${(domain.detailedConfidence.overall * 100).toFixed(0)}% confidence)`)
            .join('\n');
        return `Discovered Domains:\n${domainList}\n\nRelationships: ${this.relationships.length} identified`;
    }
    async performManualAdjustments() {
        await this.agui.showMessage('Manual adjustment interface would open here');
    }
    recalculateConfidenceFromHistory() {
        let confidence = 0.0;
        for (const event of this.learningHistory) {
            confidence = event.confidenceAfter;
        }
        this.confidence = confidence;
    }
    buildConfidentDomainMap() {
        return {
            domains: this.domains,
            relationships: this.relationships,
            confidence: this.confidenceMetrics,
            learningHistory: this.learningHistory,
            validationCount: this.getTotalValidations(),
            researchCount: this.getTotalResearch(),
        };
    }
    async reviewDomains() {
        const domainList = Array.from(this.domains.entries()).map(([name, domain]) => ({
            name,
            confidence: domain.confidence,
            validations: domain.validations.length,
            files: domain.files.length,
        }));
        await this.agui.showMessage(`📊 Domain Review\n${domainList
            .map((d) => `- ${d.name}: ${(d.confidence * 100).toFixed(0)}% confidence, ${d.validations} validations, ${d.files} files`)
            .join('\n')}`, 'info');
    }
    async adjustConfidence() {
        const adjustQuestion = {
            id: `adjust_confidence_${this.iteration}`,
            type: 'review',
            question: `Current confidence: ${(this.confidence * 100).toFixed(1)}%\n\nHow would you like to adjust it?`,
            context: { currentConfidence: this.confidence },
            options: [
                'Increase by 10%',
                'Decrease by 10%',
                'Set to specific value',
                'Keep current',
            ],
            confidence: this.confidence,
        };
        const response = (await this.agui.askQuestion(adjustQuestion));
        if (response === 'Increase by 10%') {
            this.confidence = Math.min(1, this.confidence + 0.1);
        }
        else if (response === 'Decrease by 10%') {
            this.confidence = Math.max(0, this.confidence - 0.1);
        }
        else if (response === 'Set to specific value') {
            const valueQuestion = {
                id: `set_confidence_${this.iteration}`,
                type: 'review',
                question: 'Enter new confidence value (0-100):',
                context: {},
                allowCustom: true,
                confidence: this.confidence,
            };
            const value = (await this.agui.askQuestion(valueQuestion));
            const numValue = Number.parseFloat(value);
            if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
                this.confidence = numValue / 100;
            }
        }
    }
    async collectValidatorNotes(checkpoint) {
        const notesQuestion = {
            id: `notes_${checkpoint}_${this.iteration}`,
            type: 'review',
            question: 'Please enter any notes or observations:',
            context: { checkpoint },
            allowCustom: true,
            confidence: this.confidence,
        };
        const notes = (await this.agui.askQuestion(notesQuestion));
        if (notes && notes.trim()) {
            const auditEntry = {
                id: `audit_${Date.now()}`,
                timestamp: Date.now(),
                sessionId: this.currentSessionId,
                validationType: 'checkpoint',
                confidenceLevel: this.confidence,
                domainCount: this.domains.size,
                questionsAsked: this.totalQuestionsAsked,
                questionsAnswered: this.totalQuestionsAnswered,
                significantChanges: [],
                ...(this.validatorId !== undefined && {
                    validatorId: this.validatorId,
                }),
                notes,
            };
            this.validationAuditTrail.push(auditEntry);
        }
    }
    isQuestionRelevantToDomain(question, domain) {
        if (question.context.domain === domain.name) {
            return true;
        }
        if (question.context?.relationship) {
            const rel = question.context.relationship;
            return (rel.sourceDomain === domain.name || rel.targetDomain === domain.name);
        }
        if (question.type === 'boundary' &&
            question.question.includes(domain.name)) {
            return true;
        }
        return false;
    }
    prioritizeQuestions(questions) {
        return questions.sort((a, b) => {
            const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            const aPriority = priorityOrder[a.priority || 'medium'];
            const bPriority = priorityOrder[b.priority || 'medium'];
            if (aPriority !== bPriority) {
                return aPriority - bPriority;
            }
            return a.confidence - b.confidence;
        });
    }
    async checkMinimumValidations() {
        const underValidatedDomains = Array.from(this.domains.values()).filter((domain) => domain.validations.length < this.config.minimumValidationsPerDomain);
        if (underValidatedDomains.length > 0) {
            logger.info(`${underValidatedDomains.length} domains need more validations`);
            for (const domain of underValidatedDomains) {
                const additionalQuestion = {
                    id: `additional_validation_${domain.name}_${this.iteration}`,
                    type: 'review',
                    question: `Domain "${domain.name}" needs additional validation. Is this domain correctly identified and scoped?`,
                    context: {
                        domain: domain.name,
                        currentValidations: domain.validations.length,
                    },
                    options: [
                        "Yes, it's correct",
                        'No, needs adjustment',
                        'Merge with another domain',
                        'Split into multiple domains',
                    ],
                    confidence: domain.confidence,
                    priority: 'high',
                    validationReason: 'Minimum validation requirement',
                };
                const response = (await this.agui.askQuestion(additionalQuestion));
                await this.processValidationResponse(additionalQuestion, response);
            }
        }
    }
    async updateAuditTrail() {
        const significantChanges = [];
        const lastAudit = this.validationAuditTrail[this.validationAuditTrail.length - 1];
        if (lastAudit &&
            Math.abs(this.confidence - lastAudit.confidenceLevel) > 0.1) {
            significantChanges.push(`Confidence changed from ${(lastAudit.confidenceLevel * 100).toFixed(0)}% to ${(this.confidence * 100).toFixed(0)}%`);
        }
        if (lastAudit && this.domains.size > lastAudit.domainCount) {
            significantChanges.push(`Added ${this.domains.size - lastAudit.domainCount} new domain(s)`);
        }
        const auditEntry = {
            id: `audit_${Date.now()}_${this.iteration}`,
            timestamp: Date.now(),
            sessionId: this.currentSessionId,
            validationType: 'review',
            confidenceLevel: this.confidence,
            domainCount: this.domains.size,
            questionsAsked: this.totalQuestionsAsked,
            questionsAnswered: this.totalQuestionsAnswered,
            significantChanges,
            validatorId: this.validatorId || '',
        };
        this.validationAuditTrail.push(auditEntry);
        try {
            await this.memoryStore.store(`${this.config.memoryNamespace}/audit-trail`, 'validation-audit', {
                sessionId: this.currentSessionId,
                auditTrail: this.validationAuditTrail,
            });
        }
        catch (error) {
            logger.error('Failed to persist audit trail:', error);
        }
    }
}
export default ProgressiveConfidenceBuilder;
//# sourceMappingURL=progressive-confidence-builder.js.map