/**
 * @fileoverview Core Competency Practice Frameworks - SAFe 6.0 Implementation
 *
 * Provides comprehensive implementation of SAFe 6.0 Core Competencies
 * with practice-level guidance, assessment frameworks, and improvement planning.
 */

import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('CoreCompetencyFrameworks');

// ============================================================================
// CORE COMPETENCY TYPES AND INTERFACES
// ============================================================================

/**
 * Core competency types in Essential SAFe 6.0
 */
export enum CoreCompetencyType {
  TEAM_AND_TECHNICAL_AGILITY = 'team_and_technical_agility',
  AGILE_PRODUCT_DELIVERY = 'agile_product_delivery',
  CONTINUOUS_LEARNING_CULTURE = 'continuous_learning_culture' // Foundation competency
}

/**
 * Practice maturity levels
 */
export enum PracticeMaturityLevel {
  INITIAL = 'initial', // Ad-hoc, inconsistent
  DEVELOPING = 'developing', // Some practices in place
  DEFINED = 'defined', // Standardized practices
  MANAGED = 'managed', // Measured and controlled
  OPTIMIZING = 'optimizing' // Continuously improving
}

/**
 * Core competency assessment configuration
 */
export interface CompetencyAssessmentConfig {
  id: string;
  competencyType: CoreCompetencyType;
  assessmentName: string;
  description: string;
  
  // Assessment scope
  scope: {
    teamLevel: boolean;
    programLevel: boolean;
    portfolioLevel: boolean;
    organizationLevel: boolean;
  };
  
  // Assessment methodology
  methodology: {
    assessmentType: 'self_assessment' | 'peer_assessment' | 'expert_assessment' | 'comprehensive';
    evidenceRequired: boolean;
    practiceDemonstration: boolean;
    metricsValidation: boolean;
    stakeholderInput: boolean;
  };
  
  // Improvement planning
  improvementPlanning: {
    generateImprovementPlan: boolean;
    prioritizeByBusinessValue: boolean;
    alignWithPIObjectives: boolean;
    createApprovalWorkflows: boolean;
  };
}

/**
 * Practice assessment interface
 */
export interface PracticeAssessment {
  assessmentId: string;
  practiceId: string;
  currentMaturityLevel: PracticeMaturityLevel;
  targetMaturityLevel: PracticeMaturityLevel;
  assessmentDate: Date;
  assessor: string;
  evidenceProvided: string[];
  gaps: string[];
  strengths: string[];
  improvementRecommendations: string[];
  nextAssessmentDate: Date;
}

/**
 * Practice metric interface
 */
export interface PracticeMetric {
  name: string;
  description: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
  measurementPeriod: {
    startDate: Date;
    endDate: Date;
  };
}

/**
 * Practice improvement action
 */
export interface PracticeImprovementAction {
  id: string;
  title: string;
  description: string;
  
  // Action details
  practiceArea: string;
  improvementType: 'process' | 'training' | 'tooling' | 'culture' | 'measurement';
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Implementation planning
  assignedTo: string;
  assignedTeam: string;
  targetDate: Date;
  estimatedEffort: string;
  dependencies: string[];
  
  // Business impact
  businessJustification: string;
  expectedBenefit: string;
  successCriteria: string[];
  
  // Progress tracking
  status: 'planned' | 'in_progress' | 'completed' | 'blocked';
  completionPercentage: number;
  lastUpdated: Date;
}

// ============================================================================
// TEAM AND TECHNICAL AGILITY FRAMEWORK
// ============================================================================

/**
 * Team formation practices
 */
export enum TTATeamFormationPractice {
  CROSS_FUNCTIONAL_TEAMS = 'cross_functional_teams',
  STABLE_TEAM_COMPOSITION = 'stable_team_composition',
  OPTIMAL_TEAM_SIZE = 'optimal_team_size',
  CLEAR_TEAM_CHARTER = 'clear_team_charter',
  DEFINED_ROLES_RESPONSIBILITIES = 'defined_roles_responsibilities'
}

/**
 * Team performance practices
 */
export enum TTATeamPerformancePractice {
  ITERATION_PLANNING = 'iteration_planning',
  DAILY_STANDUPS = 'daily_standups',
  ITERATION_REVIEW = 'iteration_review',
  ITERATION_RETROSPECTIVE = 'iteration_retrospective',
  TEAM_PI_PLANNING = 'team_pi_planning'
}

/**
 * Built-in quality practices
 */
export enum TTABuiltInQualityPractice {
  TEST_DRIVEN_DEVELOPMENT = 'test_driven_development',
  CONTINUOUS_INTEGRATION = 'continuous_integration',
  CONTINUOUS_DEPLOYMENT = 'continuous_deployment',
  CODE_REVIEW_PRACTICES = 'code_review_practices',
  AUTOMATED_TESTING = 'automated_testing',
  DEFINITION_OF_DONE = 'definition_of_done'
}

/**
 * Team and Technical Agility practice framework
 */
export interface TeamTechnicalAgilityFramework {
  competencyType: CoreCompetencyType.TEAM_AND_TECHNICAL_AGILITY;
  
  // Dimension 1: Agile Teams
  agileTeams: {
    teamFormation: {
      practices: TTATeamFormationPractice[];
      maturityLevel: PracticeMaturityLevel;
      assessment: PracticeAssessment;
      metrics: PracticeMetric[];
    };
    teamPerformance: {
      practices: TTATeamPerformancePractice[];
      maturityLevel: PracticeMaturityLevel;
      assessment: PracticeAssessment;
      metrics: PracticeMetric[];
    };
  };
  
  // Dimension 2: Built-in Quality
  builtInQuality: {
    practices: TTABuiltInQualityPractice[];
    maturityLevel: PracticeMaturityLevel;
    assessment: PracticeAssessment;
    metrics: PracticeMetric[];
  };
  
  // Improvement planning
  improvementActions: PracticeImprovementAction[];
  
  // Overall assessment
  overallMaturity: PracticeMaturityLevel;
  assessmentSummary: string;
  nextSteps: string[];
}

// ============================================================================
// AGILE PRODUCT DELIVERY FRAMEWORK
// ============================================================================

/**
 * Customer centricity practices
 */
export enum APDCustomerCentricityPractice {
  CUSTOMER_COLLABORATION = 'customer_collaboration',
  USER_STORY_MAPPING = 'user_story_mapping',
  CUSTOMER_JOURNEY_MAPPING = 'customer_journey_mapping',
  CUSTOMER_FEEDBACK_LOOPS = 'customer_feedback_loops',
  DESIGN_THINKING = 'design_thinking'
}

/**
 * DevOps practices
 */
export enum APDDevOpsPractice {
  DEPLOYMENT_AUTOMATION = 'deployment_automation',
  INFRASTRUCTURE_AS_CODE = 'infrastructure_as_code',
  MONITORING_OBSERVABILITY = 'monitoring_observability',
  RELEASE_ON_DEMAND = 'release_on_demand',
  VALUE_STREAM_MAPPING = 'value_stream_mapping'
}

/**
 * Business solutions practices
 */
export enum APDBusinessSolutionsPractice {
  SOLUTION_INTENT = 'solution_intent',
  SOLUTION_CONTEXT = 'solution_context',
  MODEL_BASED_SYSTEMS_ENGINEERING = 'model_based_systems_engineering',
  SET_BASED_DESIGN = 'set_based_design',
  AGILE_ARCHITECTURE = 'agile_architecture'
}

/**
 * Agile Product Delivery framework
 */
export interface AgileProductDeliveryFramework {
  competencyType: CoreCompetencyType.AGILE_PRODUCT_DELIVERY;
  
  // Dimension 1: Customer Centricity
  customerCentricity: {
    practices: APDCustomerCentricityPractice[];
    maturityLevel: PracticeMaturityLevel;
    assessment: PracticeAssessment;
    metrics: PracticeMetric[];
  };
  
  // Dimension 2: DevOps
  devOps: {
    practices: APDDevOpsPractice[];
    maturityLevel: PracticeMaturityLevel;
    assessment: PracticeAssessment;
    metrics: PracticeMetric[];
  };
  
  // Dimension 3: Business Solutions (Large Solution Level)
  businessSolutions: {
    practices: APDBusinessSolutionsPractice[];
    maturityLevel: PracticeMaturityLevel;
    assessment: PracticeAssessment;
    metrics: PracticeMetric[];
  };
  
  // Improvement planning
  improvementActions: PracticeImprovementAction[];
  
  // Overall assessment
  overallMaturity: PracticeMaturityLevel;
  assessmentSummary: string;
  nextSteps: string[];
}

// ============================================================================
// CONTINUOUS LEARNING CULTURE FRAMEWORK
// ============================================================================

/**
 * Learning organization practices
 */
export enum CLCLearningOrganizationPractice {
  CONTINUOUS_EXPLORATION = 'continuous_exploration',
  INNOVATION_CULTURE = 'innovation_culture',
  RELENTLESS_IMPROVEMENT = 'relentless_improvement',
  IP_ITERATION = 'ip_iteration',
  COMMUNITIES_OF_PRACTICE = 'communities_of_practice'
}

/**
 * Innovation practices
 */
export enum CLCInnovationPractice {
  HACKATHONS = 'hackathons',
  INNOVATION_ACCOUNTING = 'innovation_accounting',
  MINIMUM_VIABLE_PRODUCTS = 'minimum_viable_products',
  PIVOT_OR_PERSEVERE = 'pivot_or_persevere',
  INNOVATION_RIPTIDES = 'innovation_riptides'
}

/**
 * Organizational agility practices
 */
export enum CLCOrganizationalAgilityPractice {
  LEAN_AGILE_MINDSET = 'lean_agile_mindset',
  SAFe_IMPLEMENTATION_ROADMAP = 'safe_implementation_roadmap',
  LEAN_AGILE_CENTER_OF_EXCELLENCE = 'lean_agile_center_of_excellence',
  MEASURE_AND_GROW = 'measure_and_grow',
  ORGANIZATIONAL_CHANGE_MANAGEMENT = 'organizational_change_management'
}

/**
 * Continuous Learning Culture framework
 */
export interface ContinuousLearningCultureFramework {
  competencyType: CoreCompetencyType.CONTINUOUS_LEARNING_CULTURE;
  
  // Dimension 1: Learning Organization
  learningOrganization: {
    practices: CLCLearningOrganizationPractice[];
    maturityLevel: PracticeMaturityLevel;
    assessment: PracticeAssessment;
    metrics: PracticeMetric[];
  };
  
  // Dimension 2: Innovation Culture
  innovationCulture: {
    practices: CLCInnovationPractice[];
    maturityLevel: PracticeMaturityLevel;
    assessment: PracticeAssessment;
    metrics: PracticeMetric[];
  };
  
  // Dimension 3: Organizational Agility
  organizationalAgility: {
    practices: CLCOrganizationalAgilityPractice[];
    maturityLevel: PracticeMaturityLevel;
    assessment: PracticeAssessment;
    metrics: PracticeMetric[];
  };
  
  // Improvement planning
  improvementActions: PracticeImprovementAction[];
  
  // Overall assessment
  overallMaturity: PracticeMaturityLevel;
  assessmentSummary: string;
  nextSteps: string[];
}

// ============================================================================
// COMPREHENSIVE COMPETENCY FRAMEWORK
// ============================================================================

/**
 * Complete SAFe 6.0 Core Competencies framework
 */
export interface SAFeCoreCompetenciesFramework {
  organizationId: string;
  assessmentId: string;
  assessmentDate: Date;
  assessmentPeriod: {
    startDate: Date;
    endDate: Date;
  };
  
  // Core competency frameworks
  teamTechnicalAgility: TeamTechnicalAgilityFramework;
  agileProductDelivery: AgileProductDeliveryFramework;
  continuousLearningCulture: ContinuousLearningCultureFramework;
  
  // Overall organization assessment
  overallMaturityLevel: PracticeMaturityLevel;
  competencyReadiness: number; // 0-100 percentage
  
  // Strategic alignment
  businessObjectivesAlignment: string[];
  valueStreamAlignment: string[];
  PIObjectivesAlignment: string[];
  
  // Organization-wide improvement plan
  organizationImprovementPlan: {
    strategicInitiatives: PracticeImprovementAction[];
    quickWins: PracticeImprovementAction[];
    longTermInvestments: PracticeImprovementAction[];
    changeManagementActivities: PracticeImprovementAction[];
  };
  
  // Progress tracking
  progressMetrics: PracticeMetric[];
  milestones: {
    name: string;
    targetDate: Date;
    status: 'planned' | 'in_progress' | 'completed' | 'at_risk';
    description: string;
  }[];
  
  // Stakeholder engagement
  stakeholders: {
    name: string;
    role: string;
    involvement: 'sponsor' | 'champion' | 'participant' | 'informed';
    contactInfo: string;
  }[];
}

// ============================================================================
// PRACTICE IMPLEMENTATION HELPERS
// ============================================================================

/**
 * Core Competency Framework Manager
 */
export class CoreCompetencyFrameworkManager {
  private frameworks: Map<string, SAFeCoreCompetenciesFramework> = new Map();

  constructor() {
    logger.info('Core Competency Framework Manager initialized');
  }

  /**
   * Create new competency assessment
   */
  createCompetencyAssessment(
    organizationId: string,
    config: CompetencyAssessmentConfig
  ): SAFeCoreCompetenciesFramework {
    const assessmentId = `competency-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const framework: SAFeCoreCompetenciesFramework = {
      organizationId,
      assessmentId,
      assessmentDate: new Date(),
      assessmentPeriod: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
      },
      teamTechnicalAgility: this.createTTAFramework(),
      agileProductDelivery: this.createAPDFramework(),
      continuousLearningCulture: this.createCLCFramework(),
      overallMaturityLevel: PracticeMaturityLevel.INITIAL,
      competencyReadiness: 0,
      businessObjectivesAlignment: [],
      valueStreamAlignment: [],
      PIObjectivesAlignment: [],
      organizationImprovementPlan: {
        strategicInitiatives: [],
        quickWins: [],
        longTermInvestments: [],
        changeManagementActivities: []
      },
      progressMetrics: [],
      milestones: [],
      stakeholders: []
    };

    this.frameworks.set(assessmentId, framework);
    logger.info(`Created competency assessment: ${assessmentId} for organization: ${organizationId}`);
    
    return framework;
  }

  /**
   * Get competency assessment by ID
   */
  getCompetencyAssessment(assessmentId: string): SAFeCoreCompetenciesFramework | undefined {
    return this.frameworks.get(assessmentId);
  }

  /**
   * Update competency assessment
   */
  updateCompetencyAssessment(
    assessmentId: string,
    updates: Partial<SAFeCoreCompetenciesFramework>
  ): boolean {
    const framework = this.frameworks.get(assessmentId);
    if (!framework) {
      logger.error(`Competency assessment not found: ${assessmentId}`);
      return false;
    }

    Object.assign(framework, updates);
    this.frameworks.set(assessmentId, framework);
    logger.info(`Updated competency assessment: ${assessmentId}`);
    return true;
  }

  /**
   * Calculate overall maturity score
   */
  calculateOverallMaturity(framework: SAFeCoreCompetenciesFramework): number {
    const maturityScores = {
      [PracticeMaturityLevel.INITIAL]: 1,
      [PracticeMaturityLevel.DEVELOPING]: 2,
      [PracticeMaturityLevel.DEFINED]: 3,
      [PracticeMaturityLevel.MANAGED]: 4,
      [PracticeMaturityLevel.OPTIMIZING]: 5
    };

    const ttaScore = maturityScores[framework.teamTechnicalAgility.overallMaturity];
    const apdScore = maturityScores[framework.agileProductDelivery.overallMaturity];
    const clcScore = maturityScores[framework.continuousLearningCulture.overallMaturity];

    const averageScore = (ttaScore + apdScore + clcScore) / 3;
    return Math.round((averageScore / 5) * 100); // Convert to percentage
  }

  private createTTAFramework(): TeamTechnicalAgilityFramework {
    return {
      competencyType: CoreCompetencyType.TEAM_AND_TECHNICAL_AGILITY,
      agileTeams: {
        teamFormation: {
          practices: [],
          maturityLevel: PracticeMaturityLevel.INITIAL,
          assessment: this.createEmptyAssessment('tta_team_formation'),
          metrics: []
        },
        teamPerformance: {
          practices: [],
          maturityLevel: PracticeMaturityLevel.INITIAL,
          assessment: this.createEmptyAssessment('tta_team_performance'),
          metrics: []
        }
      },
      builtInQuality: {
        practices: [],
        maturityLevel: PracticeMaturityLevel.INITIAL,
        assessment: this.createEmptyAssessment('tta_built_in_quality'),
        metrics: []
      },
      improvementActions: [],
      overallMaturity: PracticeMaturityLevel.INITIAL,
      assessmentSummary: '',
      nextSteps: []
    };
  }

  private createAPDFramework(): AgileProductDeliveryFramework {
    return {
      competencyType: CoreCompetencyType.AGILE_PRODUCT_DELIVERY,
      customerCentricity: {
        practices: [],
        maturityLevel: PracticeMaturityLevel.INITIAL,
        assessment: this.createEmptyAssessment('apd_customer_centricity'),
        metrics: []
      },
      devOps: {
        practices: [],
        maturityLevel: PracticeMaturityLevel.INITIAL,
        assessment: this.createEmptyAssessment('apd_devops'),
        metrics: []
      },
      businessSolutions: {
        practices: [],
        maturityLevel: PracticeMaturityLevel.INITIAL,
        assessment: this.createEmptyAssessment('apd_business_solutions'),
        metrics: []
      },
      improvementActions: [],
      overallMaturity: PracticeMaturityLevel.INITIAL,
      assessmentSummary: '',
      nextSteps: []
    };
  }

  private createCLCFramework(): ContinuousLearningCultureFramework {
    return {
      competencyType: CoreCompetencyType.CONTINUOUS_LEARNING_CULTURE,
      learningOrganization: {
        practices: [],
        maturityLevel: PracticeMaturityLevel.INITIAL,
        assessment: this.createEmptyAssessment('clc_learning_organization'),
        metrics: []
      },
      innovationCulture: {
        practices: [],
        maturityLevel: PracticeMaturityLevel.INITIAL,
        assessment: this.createEmptyAssessment('clc_innovation_culture'),
        metrics: []
      },
      organizationalAgility: {
        practices: [],
        maturityLevel: PracticeMaturityLevel.INITIAL,
        assessment: this.createEmptyAssessment('clc_organizational_agility'),
        metrics: []
      },
      improvementActions: [],
      overallMaturity: PracticeMaturityLevel.INITIAL,
      assessmentSummary: '',
      nextSteps: []
    };
  }

  private createEmptyAssessment(practiceId: string): PracticeAssessment {
    return {
      assessmentId: `assessment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      practiceId,
      currentMaturityLevel: PracticeMaturityLevel.INITIAL,
      targetMaturityLevel: PracticeMaturityLevel.DEFINED,
      assessmentDate: new Date(),
      assessor: '',
      evidenceProvided: [],
      gaps: [],
      strengths: [],
      improvementRecommendations: [],
      nextAssessmentDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    };
  }
}

export default CoreCompetencyFrameworkManager;