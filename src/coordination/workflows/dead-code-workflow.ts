/**
 * @file Dead Code Management Workflow
 *
 * Integrates dead code detection with Claude Zen's workflow system and AGUI interface.
 * Provides automated scanning with human-in-the-loop decision making.
 */

import { getLogger } from '../../config/logging-config.js';
import {
  AutomatedDeadCodeManager,
  type DeadCodeDecision,
  type DeadCodeScanResult,
} from '../../core/automated-dead-code-manager.js';
import type { AGUIInterface } from '../../interfaces/agui/agui-adapter.js';
import type {
  WorkflowContext,
  WorkflowDefinition,
  WorkflowStep,
} from '../../types/workflow-types.js';
import type { WorkflowEngine } from '../../workflows/workflow-engine.js';

const logger = getLogger('dead-code-workflow');

export interface DeadCodeWorkflowContext extends WorkflowContext {
  scanResult?: DeadCodeScanResult;
  decisions?: DeadCodeDecision[];
  autoApprove?: boolean;
  maxItemsToReview?: number;
}

/**
 * Dead Code Management Workflow Definition
 */
export const deadCodeWorkflowDefinition: WorkflowDefinition = {
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
      timeout: 120000, // 2 minutes
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
      timeout: 0, // No timeout for human decisions
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
      schedule: '0 2 * * 1', // Every Monday at 2 AM
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

/**
 * Dead Code Workflow Handler
 */
export class DeadCodeWorkflowHandler {
  private deadCodeManager: AutomatedDeadCodeManager;
  private workflowEngine?: WorkflowEngine;

  constructor(aguiInterface: AGUIInterface, workflowEngine?: WorkflowEngine) {
    this.deadCodeManager = new AutomatedDeadCodeManager(aguiInterface);
    this.workflowEngine = workflowEngine;
  }

  /**
   * Initialize the dead code workflow
   */
  async initialize(): Promise<void> {
    if (this.workflowEngine) {
      // Register workflow definition
      await this.workflowEngine.registerWorkflow(deadCodeWorkflowDefinition);

      // Register step handlers
      this.workflowEngine.registerStepHandler(
        'scanDeadCode',
        this.scanDeadCode.bind(this)
      );
      this.workflowEngine.registerStepHandler(
        'analyzeScanResults',
        this.analyzeScanResults.bind(this)
      );
      this.workflowEngine.registerStepHandler(
        'presentToHuman',
        this.presentToHuman.bind(this)
      );
      this.workflowEngine.registerStepHandler(
        'executeDecisions',
        this.executeDecisions.bind(this)
      );
      this.workflowEngine.registerStepHandler(
        'generateReport',
        this.generateReport.bind(this)
      );

      logger.info('Dead code workflow initialized successfully');
    }
  }

  /**
   * Start dead code management workflow
   */
  async startDeadCodeWorkflow(
    options: { autoApprove?: boolean; maxItemsToReview?: number } = {}
  ): Promise<string> {
    if (!this.workflowEngine) {
      throw new Error('Workflow engine not available');
    }

    const context: DeadCodeWorkflowContext = {
      workflowId: `dead-code-${Date.now()}`,
      autoApprove: options.autoApprove ?? false,
      maxItemsToReview: options.maxItemsToReview ?? 20,
    };

    const workflowId = await this.workflowEngine.startWorkflow(
      'dead-code-management',
      context
    );

    logger.info('Dead code workflow started', { workflowId, options });
    return workflowId;
  }

  /**
   * Step handler: Scan for dead code
   */
  private async scanDeadCode(
    step: WorkflowStep,
    context: DeadCodeWorkflowContext
  ): Promise<void> {
    logger.info('Starting dead code scan...');

    try {
      const scanResult = await this.deadCodeManager.scanForDeadCode();
      context.scanResult = scanResult;

      logger.info('Dead code scan completed', {
        totalItems: scanResult.totalItems,
        highConfidence: scanResult.highConfidenceItems.length,
        duration: scanResult.scanDuration,
      });
    } catch (error) {
      logger.error('Dead code scan failed', { error });
      throw error;
    }
  }

  /**
   * Step handler: Analyze scan results
   */
  private async analyzeScanResults(
    step: WorkflowStep,
    context: DeadCodeWorkflowContext
  ): Promise<void> {
    if (!context.scanResult) {
      throw new Error('No scan result available for analysis');
    }

    logger.info('Analyzing dead code scan results...');

    const analysis = {
      criticalItems: context.scanResult.highConfidenceItems.filter(
        (item) => item.confidence > 0.9 && item.safetyScore > 0.8
      ),
      requiresReview: context.scanResult.highConfidenceItems.filter(
        (item) => item.confidence > 0.8 || item.safetyScore < 0.6
      ),
      lowPriority: context.scanResult.mediumConfidenceItems.concat(
        context.scanResult.lowConfidenceItems
      ),
    };

    logger.info('Analysis complete', {
      criticalItems: analysis.criticalItems.length,
      requiresReview: analysis.requiresReview.length,
      lowPriority: analysis.lowPriority.length,
    });

    // Store analysis in context for next step
    context.analysis = analysis;
  }

  /**
   * Step handler: Present to human for decision
   */
  private async presentToHuman(
    step: WorkflowStep,
    context: DeadCodeWorkflowContext
  ): Promise<void> {
    if (!context.scanResult) {
      throw new Error('No scan result available for human review');
    }

    logger.info('Presenting dead code findings to human...');

    if (context.autoApprove) {
      // Auto-approve safe removals
      const safeItems = context.scanResult.highConfidenceItems.filter(
        (item) => item.confidence > 0.9 && item.safetyScore > 0.8
      );

      context.decisions = safeItems.map((item) => ({
        itemId: item.id,
        action: 'remove' as const,
        timestamp: new Date(),
        reason: 'Auto-approved based on high confidence and safety scores',
      }));

      logger.info('Auto-approved dead code removal', {
        autoApprovedCount: safeItems.length,
      });
    } else {
      // Present to human for decision
      const decisions = await this.deadCodeManager.presentToHuman(
        context.scanResult
      );
      context.decisions = decisions;

      logger.info('Human decisions collected', {
        decisionCount: decisions.length,
      });
    }
  }

  /**
   * Step handler: Execute decisions
   */
  private async executeDecisions(
    step: WorkflowStep,
    context: DeadCodeWorkflowContext
  ): Promise<void> {
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
            // Execute removal logic here
            logger.info('Removing dead code', { itemId: decision.itemId });
            results.removed++;
            break;

          case 'wire-up':
            // Execute wire-up logic here
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
      } catch (error) {
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

  /**
   * Step handler: Generate report
   */
  private async generateReport(
    step: WorkflowStep,
    context: DeadCodeWorkflowContext
  ): Promise<void> {
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

    // Store report (implementation depends on storage backend)
    logger.info('Dead code management report generated', report);

    // TODO: Store report in database/file system
    context.finalReport = report;
  }

  /**
   * Generate recommendations based on workflow results
   */
  private generateRecommendations(context: DeadCodeWorkflowContext): string[] {
    const recommendations: string[] = [];

    if (context.scanResult) {
      const total = context.scanResult.totalItems;

      if (total === 0) {
        recommendations.push('✅ Excellent! No dead code found.');
      } else if (total < 5) {
        recommendations.push('👍 Good code hygiene - minimal dead code found.');
      } else if (total < 20) {
        recommendations.push(
          '⚠️ Consider regular dead code cleanup to maintain code quality.'
        );
      } else {
        recommendations.push(
          '🚨 High amount of dead code detected - prioritize cleanup efforts.'
        );
      }

      if (context.scanResult.highConfidenceItems.length > 10) {
        recommendations.push(
          '🔍 Consider enabling auto-removal for high-confidence, safe-to-remove items.'
        );
      }

      if (
        context.executionResults?.errors &&
        context.executionResults.errors > 0
      ) {
        recommendations.push(
          '⚠️ Some removal operations failed - manual review recommended.'
        );
      }
    }

    recommendations.push(
      '📅 Schedule regular dead code scans (weekly recommended).'
    );
    recommendations.push(
      '🔧 Consider integrating dead code detection into your CI/CD pipeline.'
    );

    return recommendations;
  }

  /**
   * Get workflow statistics
   */
  getWorkflowStats(): unknown {
    const history = this.deadCodeManager.getScanHistory();
    const pending = this.deadCodeManager.getPendingDecisions();

    return {
      totalScans: history.length,
      lastScanDate:
        history.length > 0 ? history[history.length - 1].timestamp : null,
      pendingDecisions: pending.size,
      averageScanDuration:
        history.length > 0
          ? history.reduce((sum, scan) => sum + scan.scanDuration, 0) /
            history.length
          : 0,
    };
  }
}

export default DeadCodeWorkflowHandler;
