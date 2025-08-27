/**
 * @fileoverview Enterprise Architecture Manager - Lightweight Facade for SAFe Enterprise Architecture
 *
 * Provides comprehensive enterprise architecture management for SAFe environments through
 * delegation to specialized @claude-zen services for advanced functionality and intelligence.
 *
 * Delegates to:
 * - Architecture Principle Service for principle management and compliance validation
 * - Technology Standards Service for standard management and enforcement
 * - Governance Decision Service for decision workflows and approvals
 * - Architecture Health Service for health monitoring and metrics
 *
 * STATUS: 957 lines - Well-structured facade with comprehensive service delegation
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import { getLogger } from '../config/logging-config';
/**
 * Enterprise Architecture Manager - Lightweight facade for enterprise architecture management
 */
export class EnterpriseArchitectureManager extends EventBus {
    logger;
    architecturePrincipleService;
    technologyStandardsService;
    governanceDecisionService;
    architectureHealthService;
    initialized = false;
    config;
    monitoringTimers = new Map();
    constructor(_config = {}) {
        super();
        this.logger = getLogger('EnterpriseArchitectureManager');
        ';
        this.config =
            enablePrincipleValidation;
        true,
            enableTechnologyStandardCompliance;
        true,
            enableArchitectureGovernance;
        true,
            enableHealthMetrics;
        true,
            principlesReviewInterval;
        86400000, // 24 hours
            complianceCheckInterval;
        3600000, // 1 hour
            governanceReviewInterval;
        43200000, // 12 hours
            healthMetricsInterval;
        1800000, // 30 minutes
            maxArchitecturePrinciples;
        50,
            maxTechnologyStandards;
        100,
            complianceThreshold;
        85,
            governanceApprovalTimeout;
        604800000,
        ; // 7 days
        config, ;
    }
    /**
     * Initialize with service delegation - LAZY LOADING
     */
    async initialize() {
        if (this.initialized)
            return;
        try {
            // Delegate to Architecture Principle Service for principle management
            const { ArchitecturePrincipleService } = await import('../services/enterprise-architecture/architecture-principle-service', ');
            this.architecturePrincipleService = new ArchitecturePrincipleService(this.logger);
            await this.architecturePrincipleService.initialize();
            // Delegate to Technology Standards Service for standard management
            const { TechnologyStandardsService } = await import('../services/enterprise-architecture/technology-standards-service', ');
            this.technologyStandardsService = new TechnologyStandardsService(this.logger);
            await this.technologyStandardsService.initialize();
            // Delegate to Governance Decision Service for decision workflows
            const { GovernanceDecisionService } = await import('../services/enterprise-architecture/governance-decision-service', ');
            this.governanceDecisionService = new GovernanceDecisionService(this.logger);
            await this.governanceDecisionService.initialize();
            // Delegate to Architecture Health Service for health monitoring
            const { ArchitectureHealthService } = await import('../services/enterprise-architecture/architecture-health-service', ');
            this.architectureHealthService = new ArchitectureHealthService(this.logger, {
                enableRealTimeMonitoring: this.configuration.enableHealthMetrics,
                monitoringInterval: this.configuration.healthMetricsInterval / 1000,
            });
            await this.architectureHealthService.initialize();
            // Setup event forwarding from services
            this.setupServiceEventForwarding();
            // Start monitoring intervals if enabled
            this.startMonitoringIntervals();
            this.initialized = true;
            this.logger.info('Enterprise Architecture Manager initialized successfully with service delegation', ');
            this.emit('initialized', {});
            ';
        }
        catch (error) {
            this.logger.error('Failed to initialize Enterprise Architecture Manager:', error);
            throw error;
        }
    }
    /**
     * Create architecture principle - Delegates to Architecture Principle Service
     */
    async createArchitecturePrinciple(name, statement, rationale, category, priority = 'medium', implications = []) {
        if (!this.initialized)
            await this.initialize();
        this.logger.info('Creating architecture principle', { ': name,
            category,
            priority,
        });
        try {
            const request = {
                name,
                statement,
                rationale,
                category,
                priority: priority,
                implications,
                owner: 'chief-architect',
                stakeholders: ['architecture-board', 'technical-leads'],
                reviewIntervalDays: 365,
            };
            const principle = await this.architecturePrincipleService.createArchitecturePrinciple(request);
            this.emit('architecture-principle-created', { ': principleId, principle, : .id,
                name: principle.name,
                category: principle.category,
            });
            this.logger.info('Architecture principle created successfully', { ': principleId, principle, : .id,
                name: principle.name,
            });
            return principle;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error('Failed to create architecture principle:', errorMessage);
            this.emit('architecture-principle-failed', { name, error: errorMessage });
            ';
            throw error;
        }
    }
    /**
     * Validate principle compliance - Delegates to Architecture Principle Service
     */
    async validatePrincipleCompliance(principleId, validationScope = {}, complianceRules = []) {
        if (!this.initialized)
            await this.initialize();
        this.logger.info('Validating principle compliance', { ': principleId,
            rulesCount: complianceRules.length,
        });
        try {
            const config = {
                principleId,
                validationScope: {
                    includeProjects: validationScope.includeProjects || [],
                    excludeProjects: validationScope.excludeProjects || [],
                    includeTeams: validationScope.includeTeams || [],
                    excludeTeams: validationScope.excludeTeams || [],
                    includeArtifacts: validationScope.includeArtifacts || [],
                    timeWindow: {
                        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
                        endDate: new Date(),
                    },
                },
                complianceRules: complianceRules.length > 0
                    ? complianceRules
                    : [
                        {
                            ruleId: 'default-compliance-rule',
                            name: 'Default Compliance Rule',
                            description: 'Basic compliance validation',
                            condition: 'principle_adherence > 80%',
                            severity: 'medium',
                            automated: true,
                            remediation: 'Review principle implementation',
                            category: 'compliance',
                        },
                    ],
                thresholds: {
                    minComplianceRate: this.configuration.complianceThreshold,
                    maxViolationsPerProject: 5,
                    criticalViolationThreshold: 0,
                    alertThresholds: {
                        warning: 75,
                        critical: 60,
                    },
                },
                reportingConfig: {
                    frequency: 'weekly',
                    recipients: ['architecture-lead@company.com'],
                    format: 'dashboard',
                    includeRecommendations: true,
                    includeTrends: true,
                },
            };
            const result = await this.architecturePrincipleService.validatePrincipleCompliance(config);
            this.emit('principle-compliance-validated', { ': principleId,
                validationId: result.validationId,
                complianceRate: result.overallCompliance,
                violationCount: result.violations.length,
            });
            this.logger.info('Principle compliance validation completed', { ': principleId,
                complianceRate: result.overallCompliance,
            });
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error('Principle compliance validation failed:', errorMessage);
            this.emit('principle-validation-failed', { ': principleId,
                error: errorMessage,
            });
            throw error;
        }
    }
    /**
     * Create technology standard - Delegates to Technology Standards Service
     */
    async createTechnologyStandard(name, description, category, type = 'recommended', mandatory = false, applicability = [], implementation = ',, verification = ',, owner = 'technology-board', ) {
        if (!this.initialized)
            await this.initialize();
        this.logger.info('Creating technology standard', { ': name,
            category,
            type,
            mandatory,
        });
        try {
            const request = {
                name,
                description,
                category: category,
                type: type,
                mandatory,
                applicability: {
                    domains: applicability,
                    projectTypes: ['all'],
                    teamTypes: ['development', 'architecture'],
                    environments: ['production', 'staging'],
                    exclusions: [],
                    conditions: [],
                },
                implementation: {
                    overview: implementation,
                    requirements: [
                        {
                            id: 'req-1',
                            description: 'Standard implementation required',
                            priority: 'mandatory',
                            verification: verification || 'Manual review',
                            examples: [],
                            dependencies: [],
                        },
                    ],
                    bestPractices: [],
                    resources: [],
                    migration: {
                        fromStandards: [],
                        migrationPath: [],
                        timeline: '30 days',
                        effort: 'medium',
                        risks: [],
                        checkpoints: [],
                    },
                    support: [],
                },
                verification: {
                    automated: [],
                    manual: [
                        {
                            checklistId: 'manual-1',
                            name: 'Manual Verification',
                            description: verification || 'Manual standard verification',
                            frequency: 'per_project',
                            owner,
                            checklist: [
                                {
                                    id: 'check-1',
                                    description: 'Verify standard implementation',
                                    evidence: 'Implementation artifacts',
                                    mandatory: true,
                                    weight: 1,
                                },
                            ],
                        },
                    ],
                    reporting: {
                        frequency: 'monthly',
                        recipients: [owner],
                        format: 'dashboard',
                        includeRecommendations: true,
                        escalationRules: [],
                    },
                },
                owner,
                approvers: ['architecture-board', 'technology-committee'],
                effectiveDate: new Date(),
                reviewIntervalMonths: 12,
            };
            const standard = await this.technologyStandardsService.createTechnologyStandard(request);
            this.emit('technology-standard-created', { ': standardId, standard, : .id,
                name: standard.name,
                category: standard.category,
                mandatory: standard.mandatory,
            });
            this.logger.info('Technology standard created successfully', { ': standardId, standard, : .id,
                name: standard.name,
            });
            return standard;
        }
        catch (error) {
            this.logger.error('Failed to create technology standard:', error);
            ';
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.emit('technology-standard-failed', { name, error: errorMessage });
            ';
            throw error;
        }
    }
    /**
     * Initiate governance decision - Delegates to Governance Decision Service
     */
    async initiateGovernanceDecision(type, title, description, requesterId, decisionMakers, priority = 'medium', requestedDecisionDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), criteria = [], risks = [], implications = []) {
        if (!this.initialized)
            await this.initialize();
        this.logger.info('Initiating governance decision', { ': type,
            title,
            priority,
            requesterId,
            decisionMakersCount: decisionMakers.length,
        });
        try {
            const request = {
                type: type,
                title,
                description,
                requesterId,
                requesterRole: 'architect',
                priority: priority,
                requestedDecisionDate,
                decisionMakers,
                criteria: criteria.length > 0
                    ? criteria
                    : [
                        {
                            name: 'Technical Feasibility',
                            description: 'Assess technical feasibility',
                            category: 'technical',
                            weight: 0.3,
                            mandatory: true,
                            measurable: true,
                            threshold: {
                                operator: 'gte',
                                value: 7,
                                action: 'accept',
                            },
                        },
                        {
                            name: 'Business Value',
                            description: 'Assess business value',
                            category: 'business',
                            weight: 0.4,
                            mandatory: true,
                            measurable: true,
                            threshold: {
                                operator: 'gte',
                                value: 7,
                                action: 'accept',
                            },
                        },
                        {
                            name: 'Risk Assessment',
                            description: 'Assess associated risks',
                            category: 'compliance',
                            weight: 0.3,
                            mandatory: true,
                            measurable: true,
                            threshold: {
                                operator: 'lte',
                                value: 3,
                                action: 'accept',
                            },
                        },
                    ],
                risks: risks.length > 0
                    ? risks
                    : [
                        {
                            name: 'Implementation Risk',
                            description: 'Risk of implementation failure',
                            category: 'technical',
                            probability: 0.2,
                            impact: 'medium',
                            timeframe: '6 months',
                            owner: requesterId,
                            mitigation: {
                                strategy: 'mitigate',
                                description: 'Implement phased rollout',
                                actions: [],
                                cost: 'medium',
                                timeline: '2 months',
                                effectiveness: 0.8,
                                owner: requesterId,
                                dependencies: [],
                            },
                        },
                    ],
                implications: implications.length > 0
                    ? implications
                    : [
                        {
                            type: 'short_term',
                            category: 'technical',
                            description: 'Short-term technical implications',
                            impact: 'neutral',
                            magnitude: 'medium',
                            stakeholders: decisionMakers,
                            timeframe: '3 months',
                            reversibility: 'reversible',
                            dependencies: [],
                        },
                    ],
                context: {
                    businessContext: {
                        businessObjectives: ['Strategic alignment'],
                        strategicInitiatives: ['Digital transformation'],
                        marketConditions: ['Stable market'],
                        competitiveLandscape: ['Competitive pressure'],
                        customerRequirements: ['High availability'],
                        budgetConstraints: [],
                    },
                    technicalContext: {
                        currentArchitecture: ['Existing systems'],
                        technologyStandards: ['Current standards'],
                        constraints: [],
                        dependencies: [],
                        integrationPoints: [],
                        performanceRequirements: [],
                    },
                    organizationalContext: {
                        stakeholders: [],
                        teams: [],
                        capabilities: [],
                        changeCapacity: 'medium',
                        culturalFactors: [],
                        governancePolicies: [],
                    },
                    externalContext: {
                        regulatoryRequirements: [],
                        industryStandards: [],
                        vendorConstraints: [],
                        partnerRequirements: [],
                        marketTrends: [],
                    },
                },
                artifacts: [],
            };
            const decision = await this.governanceDecisionService.initiateGovernanceDecision(request);
            this.emit('governance-decision-initiated', { ': decisionId, decision, : .id,
                type: decision.type,
                priority: decision.priority,
                workflowId: decision.workflow.workflowId,
            });
            this.logger.info('Governance decision initiated successfully', { ': decisionId, decision, : .id,
                type: decision.type,
            });
            return decision;
        }
        catch (error) {
            this.logger.error('Failed to initiate governance decision:', error);
            ';
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.emit('governance-decision-failed', { ': type,
                title,
                error: errorMessage,
            });
            throw error;
        }
    }
    /**
     * Calculate architecture health metrics - Delegates to Architecture Health Service
     */
    async calculateArchitectureHealthMetrics() {
        if (!this.initialized)
            await this.initialize();
        this.logger.info('Calculating architecture health metrics');
        ';
        try {
            const metrics = await this.architectureHealthService.calculateArchitectureHealthMetrics();
            this.emit('architecture-health-calculated', { ': overallHealth, metrics, : .overallHealth,
                healthGrade: metrics.healthGrade,
                alertCount: metrics.alerts.length,
                recommendationCount: metrics.recommendations.length,
            });
            this.logger.info('Architecture health metrics calculated successfully', { ': overallHealth, metrics, : .overallHealth,
                healthGrade: metrics.healthGrade,
            });
            return metrics;
        }
        catch (error) {
            this.logger.error('Failed to calculate architecture health metrics:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.emit('architecture-health-failed', { error: errorMessage });
            ';
            throw error;
        }
    }
    /**
     * Get architecture principles
     */
    getArchitecturePrinciples() {
        if (!this.initialized || !this.architecturePrincipleService) {
            return [];
        }
        return this.architecturePrincipleService.getAllPrinciples() || [];
    }
    /**
     * Get technology standards
     */
    getTechnologyStandards() {
        if (!this.initialized || !this.technologyStandardsService) {
            return [];
        }
        return this.technologyStandardsService.getAllStandards() || [];
    }
    /**
     * Get governance decisions
     */
    getGovernanceDecisions() {
        if (!this.initialized || !this.governanceDecisionService) {
            return [];
        }
        return this.governanceDecisionService.getAllDecisions() || [];
    }
    /**
     * Get enterprise architecture status
     */
    getEnterpriseArchitectureStatus() {
        return {
            initialized: this.initialized,
            config: this.config,
            services: {
                architecturePrinciples: !!this.architecturePrincipleService,
                technologyStandards: !!this.technologyStandardsService,
                governanceDecisions: !!this.governanceDecisionService,
                architectureHealth: !!this.architectureHealthService,
            },
            monitoring: {
                principlesReview: this.monitoringTimers.has('principles-review'),
                complianceCheck: this.monitoringTimers.has('compliance-check'),
                governanceReview: this.monitoringTimers.has('governance-review'),
                healthMetrics: this.monitoringTimers.has('health-metrics'),
            },
            stats: {
                principlesCount: this.getArchitecturePrinciples().length,
                standardsCount: this.getTechnologyStandards().length,
                decisionsCount: this.getGovernanceDecisions().length,
            },
        };
    }
    /**
     * Shutdown enterprise architecture manager
     */
    async shutdown() {
        this.logger.info('Shutting down Enterprise Architecture Manager');
        ';
        // Clear monitoring timers
        for (const [name, timer] of this.monitoringTimers) {
            clearInterval(timer);
            this.logger.debug('Stopped monitoring timer', { timer: name });
            ';
        }
        this.monitoringTimers.clear();
        // Shutdown services
        if (this.architecturePrincipleService) {
            await this.architecturePrincipleService.shutdown();
        }
        if (this.technologyStandardsService) {
            await this.technologyStandardsService.shutdown();
        }
        if (this.governanceDecisionService) {
            await this.governanceDecisionService.shutdown();
        }
        if (this.architectureHealthService) {
            await this.architectureHealthService.shutdown();
        }
        this.removeAllListeners();
        this.initialized = false;
        this.logger.info('Enterprise Architecture Manager shutdown complete');
        ';
    }
    // ============================================================================
    // PRIVATE HELPER METHODS
    // ============================================================================
    /**
     * Setup event forwarding from services
     */
    setupServiceEventForwarding() {
        // Forward events from Architecture Principle Service
        if (this.architecturePrincipleService) {
            this.architecturePrincipleService.on('principle-created', (_data) => {
                ';
                this.emit('architecture-principle-created', data);
                ';
            });
            this.architecturePrincipleService.on('principle-validated', (data) => {
                this.emit('principle-compliance-validated', data);
                ';
            });
        }
        // Forward events from Technology Standards Service
        if (this.technologyStandardsService) {
            this.technologyStandardsService.on('standard-created', (_data) => {
                ';
                this.emit('technology-standard-created', data);
                ';
            });
            this.technologyStandardsService.on('standard-compliance-monitored', (data) => {
                this.emit('technology-compliance-monitored', data);
                ';
            });
        }
        // Forward events from Governance Decision Service
        if (this.governanceDecisionService) {
            this.governanceDecisionService.on('governance-decision-initiated', (data) => {
                this.emit('governance-decision-initiated', data);
                ';
            });
            this.governanceDecisionService.on('decision-status-updated', (data) => {
                this.emit('governance-decision-updated', data);
                ';
            });
        }
        // Forward events from Architecture Health Service
        if (this.architectureHealthService) {
            this.architectureHealthService.on('health-metrics-calculated', (data) => {
                this.emit('architecture-health-calculated', data);
                ';
            });
        }
    }
    /**
     * Start monitoring intervals for periodic tasks
     */
    startMonitoringIntervals() {
        if (this.configuration.enablePrincipleValidation) {
            const principlesTimer = setInterval(async () => {
                await this.reviewArchitecturePrinciples();
            }, this.configuration.principlesReviewInterval);
            this.monitoringTimers.set('principles-review', principlesTimer);
            ';
        }
        if (this.configuration.enableTechnologyStandardCompliance) {
            const complianceTimer = setInterval(async () => {
                await this.performComplianceChecks();
            }, this.configuration.complianceCheckInterval);
            this.monitoringTimers.set('compliance-check', complianceTimer);
            ';
        }
        if (this.configuration.enableArchitectureGovernance) {
            const governanceTimer = setInterval(async () => {
                await this.reviewGovernanceDecisions();
            }, this.configuration.governanceReviewInterval);
            this.monitoringTimers.set('governance-review', governanceTimer);
            ';
        }
        if (this.configuration.enableHealthMetrics) {
            const healthTimer = setInterval(async () => {
                await this.calculateArchitectureHealthMetrics();
            }, this.configuration.healthMetricsInterval);
            this.monitoringTimers.set('health-metrics', healthTimer);
            ';
        }
        this.logger.info('Monitoring intervals started', { ': principlesReview, this: .configuration.enablePrincipleValidation,
            complianceCheck: this.configuration.enableTechnologyStandardCompliance,
            governanceReview: this.configuration.enableArchitectureGovernance,
            healthMetrics: this.configuration.enableHealthMetrics,
        });
    }
    /**
     * Review architecture principles
     */
    reviewArchitecturePrinciples() {
        try {
            const principles = this.getArchitecturePrinciples();
            const now = new Date();
            for (const principle of principles) {
                if (principle.reviewDate <= now) {
                    this.logger.info('Architecture principle due for review', { ': principleId, principle, : .id,
                        name: principle.name,
                        reviewDate: principle.reviewDate,
                    });
                    this.emit('architecture-principle-review-due', { ': principleId, principle, : .id,
                        name: principle.name,
                        reviewDate: principle.reviewDate,
                    });
                }
            }
        }
        catch (error) {
            this.logger.error('Failed to review architecture principles:', error);
            ';
        }
    }
    /**
     * Perform compliance checks
     */
    async performComplianceChecks() {
        try {
            const standards = this.getTechnologyStandards();
            for (const standard of standards) {
                if (standard.mandatory) {
                    this.logger.debug('Checking compliance for mandatory standard', { ': standardId, standard, : .id,
                        name: standard.name,
                    });
                    // Monitor standard compliance through service
                    const scope = {
                        projects: ['all'],
                        teams: ['all'],
                        environments: ['production'],
                        timeWindow: {
                            startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
                            endDate: new Date(),
                        },
                    };
                    await this.technologyStandardsService.monitorStandardCompliance(standard.id, scope);
                }
            }
        }
        catch (error) {
            this.logger.error('Failed to perform compliance checks:', error);
            ';
        }
    }
    /**
     * Review governance decisions
     */
    reviewGovernanceDecisions() {
        try {
            const decisions = this.getGovernanceDecisions();
            const now = new Date();
            for (const decision of decisions) {
                if (decision.status === 'pending_approval' && ')
                    decision.approvalDeadline <= now;
                this.logger.warn('Governance decision approval overdue', { ': decisionId, decision, : .id,
                    title: decision.title,
                    approvalDeadline: decision.approvalDeadline,
                });
                this.emit('governance-decision-overdue', { ': decisionId, decision, : .id,
                    title: decision.title,
                    approvalDeadline: decision.approvalDeadline,
                });
            }
        }
        catch (error) {
            this.logger.error('Failed to review governance decisions:', error);
            ';
        }
    }
}
export default EnterpriseArchitectureManager;
