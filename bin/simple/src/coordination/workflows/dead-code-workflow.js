import { getLogger } from '../../config/logging-config.js';
import { AutomatedDeadCodeManager, } from '../../core/automated-dead-code-manager.js';
const logger = getLogger('dead-code-workflow');
export const deadCodeWorkflowDefinition = {
    id: 'dead-code-management',
    name: 'Dead Code Management',
    description: 'Automated dead code detection with human approval workflow',
    version: '1.0.0',
    steps: [
        {
            id: 'scan-dead-code',
            name: 'Scan for Dead Code',
            description: 'Run automated dead code detection tools',
            type: 'action',
            handler: 'scanDeadCode',
            timeout: 120000,
            retries: 1,
        },
        {
            id: 'analyze-results',
            name: 'Analyze Scan Results',
            description: 'Analyze and categorize dead code findings',
            type: 'action',
            handler: 'analyzeScanResults',
            timeout: 30000,
        },
        {
            id: 'human-decision-gate',
            name: 'Human Decision Gate',
            description: 'Present findings to human for decision making',
            type: 'gate',
            handler: 'presentToHuman',
            timeout: 0,
            gateConfig: {
                gateType: 'approval',
                requiredApproval: true,
                businessImpact: 'medium',
                stakeholders: ['developer', 'tech-lead'],
            },
        },
        {
            id: 'execute-decisions',
            name: 'Execute Decisions',
            description: 'Execute approved dead code removal actions',
            type: 'action',
            handler: 'executeDecisions',
            timeout: 60000,
        },
        {
            id: 'generate-report',
            name: 'Generate Report',
            description: 'Generate and store dead code management report',
            type: 'action',
            handler: 'generateReport',
            timeout: 15000,
        },
    ],
    triggers: [
        {
            type: 'schedule',
            schedule: '0 2 * * 1',
            enabled: true,
        },
        {
            type: 'manual',
            enabled: true,
        },
        {
            type: 'webhook',
            endpoint: '/dead-code/scan',
            enabled: true,
        },
    ],
    configuration: {
        enableMetrics: true,
        persistResults: true,
        notificationChannels: ['slack', 'email'],
    },
};
export class DeadCodeWorkflowHandler {
    deadCodeManager;
    workflowEngine;
    constructor(aguiInterface, workflowEngine) {
        this.deadCodeManager = new AutomatedDeadCodeManager(aguiInterface);
        this.workflowEngine = workflowEngine;
    }
    async initialize() {
        if (this.workflowEngine) {
            await this.workflowEngine.registerWorkflow(deadCodeWorkflowDefinition);
            this.workflowEngine.registerStepHandler('scanDeadCode', this.scanDeadCode.bind(this));
            this.workflowEngine.registerStepHandler('analyzeScanResults', this.analyzeScanResults.bind(this));
            this.workflowEngine.registerStepHandler('presentToHuman', this.presentToHuman.bind(this));
            this.workflowEngine.registerStepHandler('executeDecisions', this.executeDecisions.bind(this));
            this.workflowEngine.registerStepHandler('generateReport', this.generateReport.bind(this));
            logger.info('Dead code workflow initialized successfully');
        }
    }
    async startDeadCodeWorkflow(options = {}) {
        if (!this.workflowEngine) {
            throw new Error('Workflow engine not available');
        }
        const context = {
            workflowId: `dead-code-${Date.now()}`,
            autoApprove: options.autoApprove ?? false,
            maxItemsToReview: options.maxItemsToReview ?? 20,
        };
        const workflowId = await this.workflowEngine.startWorkflow('dead-code-management', context);
        logger.info('Dead code workflow started', { workflowId, options });
        return workflowId;
    }
    async scanDeadCode(step, context) {
        logger.info('Starting dead code scan...');
        try {
            const scanResult = await this.deadCodeManager.scanForDeadCode();
            context.scanResult = scanResult;
            logger.info('Dead code scan completed', {
                totalItems: scanResult.totalItems,
                highConfidence: scanResult.highConfidenceItems.length,
                duration: scanResult.scanDuration,
            });
        }
        catch (error) {
            logger.error('Dead code scan failed', { error });
            throw error;
        }
    }
    async analyzeScanResults(step, context) {
        if (!context.scanResult) {
            throw new Error('No scan result available for analysis');
        }
        logger.info('Analyzing dead code scan results...');
        const analysis = {
            criticalItems: context.scanResult.highConfidenceItems.filter((item) => item.confidence > 0.9 && item.safetyScore > 0.8),
            requiresReview: context.scanResult.highConfidenceItems.filter((item) => item.confidence > 0.8 || item.safetyScore < 0.6),
            lowPriority: context.scanResult.mediumConfidenceItems.concat(context.scanResult.lowConfidenceItems),
        };
        logger.info('Analysis complete', {
            criticalItems: analysis.criticalItems.length,
            requiresReview: analysis.requiresReview.length,
            lowPriority: analysis.lowPriority.length,
        });
        context.analysis = analysis;
    }
    async presentToHuman(step, context) {
        if (!context.scanResult) {
            throw new Error('No scan result available for human review');
        }
        logger.info('Presenting dead code findings to human...');
        if (context.autoApprove) {
            const safeItems = context.scanResult.highConfidenceItems.filter((item) => item.confidence > 0.9 && item.safetyScore > 0.8);
            context.decisions = safeItems.map((item) => ({
                itemId: item.id,
                action: 'remove',
                timestamp: new Date(),
                reason: 'Auto-approved based on high confidence and safety scores',
            }));
            logger.info('Auto-approved dead code removal', {
                autoApprovedCount: safeItems.length,
            });
        }
        else {
            const decisions = await this.deadCodeManager.presentToHuman(context.scanResult);
            context.decisions = decisions;
            logger.info('Human decisions collected', {
                decisionCount: decisions.length,
            });
        }
    }
    async executeDecisions(step, context) {
        if (!context.decisions || context.decisions.length === 0) {
            logger.info('No decisions to execute');
            return;
        }
        logger.info('Executing dead code decisions...', {
            decisionCount: context.decisions.length,
        });
        const results = {
            removed: 0,
            wiredUp: 0,
            kept: 0,
            deferred: 0,
            errors: 0,
        };
        for (const decision of context.decisions) {
            try {
                switch (decision.action) {
                    case 'remove':
                        logger.info('Removing dead code', { itemId: decision.itemId });
                        results.removed++;
                        break;
                    case 'wire-up':
                        logger.info('Wiring up code', { itemId: decision.itemId });
                        results.wiredUp++;
                        break;
                    case 'keep':
                        logger.info('Keeping code', { itemId: decision.itemId });
                        results.kept++;
                        break;
                    case 'defer':
                        logger.info('Deferring decision', { itemId: decision.itemId });
                        results.deferred++;
                        break;
                }
            }
            catch (error) {
                logger.error('Failed to execute decision', {
                    decision: decision.itemId,
                    error,
                });
                results.errors++;
            }
        }
        context.executionResults = results;
        logger.info('Decision execution completed', results);
    }
    async generateReport(step, context) {
        logger.info('Generating dead code management report...');
        const report = {
            timestamp: new Date(),
            workflowId: context.workflowId,
            scanSummary: context.scanResult
                ? {
                    totalItems: context.scanResult.totalItems,
                    highConfidence: context.scanResult.highConfidenceItems.length,
                    mediumConfidence: context.scanResult.mediumConfidenceItems.length,
                    lowConfidence: context.scanResult.lowConfidenceItems.length,
                    duration: context.scanResult.scanDuration,
                }
                : null,
            decisions: context.decisions?.length || 0,
            executionResults: context.executionResults || null,
            recommendations: this.generateRecommendations(context),
        };
        logger.info('Dead code management report generated', report);
        context.finalReport = report;
    }
    generateRecommendations(context) {
        const recommendations = [];
        if (context.scanResult) {
            const total = context.scanResult.totalItems;
            if (total === 0) {
                recommendations.push('✅ Excellent! No dead code found.');
            }
            else if (total < 5) {
                recommendations.push('👍 Good code hygiene - minimal dead code found.');
            }
            else if (total < 20) {
                recommendations.push('⚠️ Consider regular dead code cleanup to maintain code quality.');
            }
            else {
                recommendations.push('🚨 High amount of dead code detected - prioritize cleanup efforts.');
            }
            if (context.scanResult.highConfidenceItems.length > 10) {
                recommendations.push('🔍 Consider enabling auto-removal for high-confidence, safe-to-remove items.');
            }
            if (context.executionResults?.errors &&
                context.executionResults.errors > 0) {
                recommendations.push('⚠️ Some removal operations failed - manual review recommended.');
            }
        }
        recommendations.push('📅 Schedule regular dead code scans (weekly recommended).');
        recommendations.push('🔧 Consider integrating dead code detection into your CI/CD pipeline.');
        return recommendations;
    }
    getWorkflowStats() {
        const history = this.deadCodeManager.getScanHistory();
        const pending = this.deadCodeManager.getPendingDecisions();
        return {
            totalScans: history.length,
            lastScanDate: history.length > 0 ? history[history.length - 1].timestamp : null,
            pendingDecisions: pending.size,
            averageScanDuration: history.length > 0
                ? history.reduce((sum, scan) => sum + scan.scanDuration, 0) /
                    history.length
                : 0,
        };
    }
}
export default DeadCodeWorkflowHandler;
//# sourceMappingURL=dead-code-workflow.js.map