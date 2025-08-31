/**
 * @fileoverview System Demo Coordination - SAFe 6.0 Demo Coordination Implementation
 *
 * Provides comprehensive SAFe 6.0 System Demo coordination capabilities
 * including demo planning, stakeholder management, and feedback collection.
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

import { getLogger as _getLogger } from '@claude-zen/foundation';

const logger = getLogger('SystemDemoCoordination');

// ============================================================================
// SYSTEM DEMO TYPES AND INTERFACES
// ============================================================================

/**
 * System Demo event configuration
 */
export interface SystemDemoConfig {
  id: string;
  artName: string;
  piNumber: number;
  iterationNumber: number;
  demoDate: Date;
  duration: number; // minutes

  // Demo environment
  environment: {
    type: 'production' | 'staging' | 'demo';
    url?: string;
    credentials?: string;
    setupInstructions: string;
  };

  // Participating teams and features
  teamDemonstrations: TeamDemonstration[];

  // Stakeholders and attendees
  attendees: {
    businessOwners: string[];
    productManagement: string[];
    customers: string[];
    keyStakeholders: string[];
    systemArchitects: string[];
    allTeamMembers: string[];
  };

  // Demo configuration
  settings: {
    recordDemo: boolean;
    enableLiveFeedback: boolean;
    requireFormalApproval: boolean;
    feedbackCollectionMethod: 'real_time' | 'post_demo' | 'hybrid';
    businessValueValidation: boolean;
  };

  // Success criteria
  successCriteria: {
    piObjectiveProgress: string[];
    businessValueTargets: string[];
    stakeholderSatisfaction: number; // 1-10 scale
    technicalQualityGates: string[];
  };
}

/**
 * Individual team demonstration
 */
export interface TeamDemonstration {
  teamId: string;
  teamName: string;

  // Demo content
  featuresDemo: FeatureDemo[];
  demoScript: {
    overview: string;
    keyMessages: string[];
    demoFlow: DemoStep[];
    timeAllocation: number; // minutes
  };

  // Preparation status
  preparation: {
    environmentReady: boolean;
    dataSetup: boolean;
    scriptsValidated: boolean;
    backupPlan: string;
    demoApproved: boolean;
    approvalGateId?: string;
  };

  // Team representatives
  presenters: {
    primary: string; // usually Product Owner
    technical: string; // usually tech lead or developer
    backup: string;
  };

  // Demo artifacts
  artifacts: {
    screenshots: string[];
    demoVideos: string[];
    setupScripts: string[];
    documentationLinks: string[];
  };
}

/**
 * Feature demonstration details
 */
export interface FeatureDemo {
  featureId: string;
  featureName: string;
  businessValue: string;

  // Demo content
  userStories: string[];
  acceptanceCriteria: string[];
  demoScenarios: DemoScenario[];

  // PI Objective alignment
  piObjectiveId?: string;
  piObjectiveContribution: string;

  // Business value metrics
  metrics: {
    performanceImprovements?: string[];
    userExperienceGains?: string[];
    businessProcessImpacts?: string[];
    costSavings?: number;
    revenueImpact?: number;
  };
}

/**
 * Demo scenario details
 */
export interface DemoScenario {
  scenarioName: string;
  description: string;
  userPersona: string;

  // Demo steps
  steps: DemoStep[];

  // Expected outcomes
  expectedOutcome: string;
  businessValueDemonstrated: string;

  // Technical details
  technicalHighlights: string[];
  integrationPoints: string[];
}

/**
 * Individual demo step
 */
export interface DemoStep {
  stepNumber: number;
  action: string;
  expectedResult: string;
  notes?: string;
  duration: number; // seconds

  // Technical setup
  prerequisiteSteps?: string[];
  dataRequirements?: string[];
  environmentSettings?: Record<string, any>;
}

/**
 * Real-time feedback during demo
 */
export interface DemoFeedback {
  id: string;
  demoId: string;
  teamId?: string;

  // Feedback source
  providedBy: string;
  role:
    | 'business_owner'
    | 'customer'
    | 'product_manager'
    | 'stakeholder'
    | 'team_member';
  timestamp: Date;

  // Feedback content
  feedback: {
    type:
      | 'positive'
      | 'concern'
      | 'suggestion'
      | 'question'
      | 'approval'
      | 'rejection';
    category:
      | 'functionality'
      | 'usability'
      | 'performance'
      | 'business_value'
      | 'technical'
      | 'process';
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    specificDetails: string;
  };

  // Business context
  businessImpact: {
    affectedProcesses: string[];
    customerImpact: string;
    businessValue: number; // 1-10 rating
    adoptionConcerns: string[];
  };

  // Response and follow-up
  _response: {
    acknowledgedBy: string;
    responseRequired: boolean;
    targetResponseDate?: Date;
    actualResponse?: string;
    responseDate?: Date;
    followUpActions: string[];
  };

  // Approval workflow integration
  triggersApproval: boolean;
  approvalGateId?: string;
  approvalRequired?: string[]; // roles/people who must respond
}

/**
 * Demo outcomes and results
 */
export interface DemoOutcome {
  demoId: string;
  completedAt: Date;

  // Overall assessment
  overallSuccess: boolean;
  stakeholderSatisfaction: number; // 1-10 scale
  businessValueDemonstrated: boolean;

  // PI Objective progress
  piObjectiveProgress: Array<{
    objectiveId: string;
    progressPercentage: number;
    demonstratedCapabilities: string[];
    remainingWork: string[];
  }>;

  // Feedback summary
  feedbackSummary: {
    totalFeedbackItems: number;
    positiveCount: number;
    concernsCount: number;
    suggestionsCount: number;
    approvalCount: number;
    rejectionCount: number;
  };

  // Action items
  actionItems: Array<{
    item: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    assignedTo: string;
    dueDate: Date;
    category:
      | 'feature_enhancement'
      | 'bug_fix'
      | 'process_improvement'
      | 'documentation';
  }>;

  // Next steps
  nextSteps: {
    nextDemoDate?: Date;
    iterationPlanning: string[];
    stakeholderFollowUp: string[];
    businessApprovals: string[];
  };
}

// ============================================================================
// SYSTEM DEMO COORDINATION SERVICE
// ============================================================================

/**
 * System Demo Coordination Service
 *
 * Manages the complete SAFe System Demo lifecycle including planning,
 * execution coordination, feedback collection, and outcome tracking.
 */
export class SystemDemoCoordination {
  private readonly logger = getLogger('SystemDemoCoordination');
  private activeDemos = new Map<string, SystemDemoConfig>();
  private demoFeedback = new Map<string, DemoFeedback[]>();
  private demoOutcomes = new Map<string, DemoOutcome>();

  constructor() {
    this.logger.info('SystemDemoCoordination service initialized');
  }

  /**
   * Schedule a new system demo
   */
  async scheduleDemo(config: SystemDemoConfig): Promise<{
    demoId: string;
    scheduled: boolean;
    conflicts: string[];
    recommendations: string[];
  }> {
    this.logger.info('Scheduling system demo', {
      artName: config.artName,
      piNumber: config.piNumber,
      demoDate: config.demoDate,
    });

    // Store demo configuration
    this.activeDemos.set(config.id, config);
    this.demoFeedback.set(config.id, []);

    // Validate demo readiness
    const readinessCheck = this.validateDemoReadiness(config);

    return {
      demoId: config.id,
      scheduled: readinessCheck.ready,
      conflicts: readinessCheck.conflicts,
      recommendations: readinessCheck.recommendations,
    };
  }

  /**
   * Collect real-time feedback during demo
   */
  async collectFeedback(feedback: DemoFeedback): Promise<{
    feedbackId: string;
    recorded: boolean;
    triggersAction: boolean;
    nextSteps: string[];
  }> {
    this.logger.info('Collecting demo feedback', {
      demoId: feedback.demoId,
      type: feedback.feedback.type,
      priority: feedback.feedback.priority,
    });

    // Store feedback
    const existingFeedback = this.demoFeedback.get(feedback.demoId) || [];
    existingFeedback.push(feedback);
    this.demoFeedback.set(feedback.demoId, existingFeedback);

    // Determine if immediate action is required
    const triggersAction =
      feedback.feedback.priority === 'critical' ||
      feedback.feedback.type === 'rejection';

    const nextSteps = this.determineNextSteps(feedback);

    return {
      feedbackId: feedback.id,
      recorded: true,
      triggersAction,
      nextSteps,
    };
  }

  /**
   * Complete demo and generate outcomes
   */
  async completeDemo(demoId: string): Promise<DemoOutcome> {
    const demo = this.activeDemos.get(demoId);
    if (!demo) {
      throw new Error(`Demo ${demoId} not found"Fixed unterminated template"(`Demo ${demoId} not found"Fixed unterminated template"(`Team ${team.teamName} demo not approved"Fixed unterminated template"(`Team ${team.teamName} environment not ready"Fixed unterminated template"