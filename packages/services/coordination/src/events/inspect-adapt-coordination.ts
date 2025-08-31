import { getLogger as _getLogger } from '@claude-zen/foundation';
/**
 * @fileoverview Inspect & Adapt Workshop Coordination
 *
 * SAFe 6.0 Inspect & Adapt workshop coordination system.
 * Handles PI retrospectives, problem-solving workshops, and continuous improvement.
 */

import { EventBus, getLogger } from '@claude-zen/foundation';

const logger = getLogger('InspectAdaptCoordination');

/**
 * I&A team interface
 */
export interface IATeam {
  id: string;
  name: string;
  piObjectives: string[];
  actualDelivery: string[];
  businessValueDelivered: number;
  velocity: number;
  qualityMetrics: {
    defects: number;
    testCoverage: number;
    techDebtScore: number;
  };
  impediments: string[];
  improvements: string[];
}

/**
 * Problem identification interface
 */
export interface ProblemItem {
  id: string;
  title: string;
  description: string;
  category: 'process' | 'technical' | 'people' | 'organizational';
  impact: 'high' | 'medium' | 'low';
  frequency: 'frequent' | 'occasional' | 'rare';
  affectedTeams: string[];
  symptoms: string[];
  rootCause?: string;
  proposedSolutions: string[];
  votes: number;
  priority: number;
}

/**
 * PI System Demo interface
 */
export interface PISystemDemo {
  id: string;
  piId: string;
  demoDate: Date;
  features: {
    id: string;
    name: string;
    team: string;
    businessValue: number;
    demoStatus: 'completed' | 'partial' | 'not-ready';
    stakeholderFeedback: string[];
  }[];
  stakeholderAttendance: {
    businessOwners: string[];
    customers: string[];
    sponsors: string[];
  };
  overallFeedback: string[];
  nextPIConsiderations: string[];
}

/**
 * Quantitative measurement review interface
 */
export interface QuantitativeMeasurement {
  category: string;
  metric: string;
  target: number;
  actual: number;
  trend: 'improving' | 'stable' | 'declining';
  actionRequired: boolean;
  analysis: string;
}

/**
 * Problem-solving workshop interface
 */
export interface ProblemSolvingWorkshop {
  id: string;
  problemId: string;
  facilitator: string;
  participants: string[];
  duration: number; // minutes
  techniques: string[]; // e.g., '5 Whys', 'Fishbone', 'Affinity Mapping'
  outcomes: {
    rootCauseIdentified: boolean;
    rootCause: string;
    actionItems: {
      id: string;
      description: string;
      owner: string;
      dueDate: Date;
      priority: 'high' | 'medium' | 'low';
    }[];
    followUpRequired: boolean;
    followUpDate?: Date;
  };
}

/**
 * I&A workshop configuration
 */
export interface InspectAdaptWorkshop {
  id: string;
  artName: string;
  piNumber: number;
  workshopDate: Date;
  duration: number; // hours
  facilitators: {
    primary: string;
    coaches: string[];
    external?: string;
  };
  participants: IATeam[];
  agenda: {
    piSystemDemo: PISystemDemo;
    quantitativeReview: QuantitativeMeasurement[];
    problemIdentification: ProblemItem[];
    problemSolvingWorkshops: ProblemSolvingWorkshop[];
  };
  outcomes: {
    actionItems: string[];
    improvements: string[];
    experimentsPlanned: string[];
    nextPIFocus: string[];
  };
}

/**
 * Inspect & Adapt Coordination Manager
 */
export class InspectAdaptCoordinationManager extends EventBus {
  private workshops = new Map<string, InspectAdaptWorkshop>();
  private problems = new Map<string, ProblemItem>();
  private solvingWorkshops = new Map<string, ProblemSolvingWorkshop>();
  private systemDemos = new Map<string, PISystemDemo>();

  constructor() {
    super();
    this.setupEventHandlers();
    logger.info('Inspect & Adapt Coordination Manager initialized');
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    this.on('ia:workshop-start', this.handleWorkshopStart.bind(this));
    this.on('ia:problem-identified', this.handleProblemIdentified.bind(this));
    this.on('ia:problem-voting', this.handleProblemVoting.bind(this));
    this.on(
      'ia:workshop-facilitation',
      this.handleWorkshopFacilitation.bind(this)
    );
    this.on('ia:demo-feedback', this.handleDemoFeedback.bind(this));
    this.on('ia:metrics-review', this.handleMetricsReview.bind(this));
  }

  /**
   * Create I&A workshop
   */
  createWorkshop(config: {
    artName: string;
    piNumber: number;
    workshopDate: Date;
    teams: IATeam[];
    facilitators: InspectAdaptWorkshop['facilitators'];
  }): InspectAdaptWorkshop {
    const workshopId = `ia-${Date.now()}-${Math.random().toString(36).substr(2, 9)}"Fixed unterminated template" `I&A Workshop created: ${config.artName} PI ${config.piNumber}"Fixed unterminated template"(`Workshop not found: ${data.workshopId}"Fixed unterminated template" `I&A Workshop started: ${workshop.artName} PI ${workshop.piNumber}"Fixed unterminated template" `problem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}"Fixed unterminated template"(`Problem identified: ${problem.title}"Fixed unterminated template"(`Problem not found: ${data.problemId}"Fixed unterminated template"(`Problem voted: ${problem.title} - ${data.votes} votes"Fixed unterminated template"(`Problem not found: ${data.problemId}"Fixed unterminated template" `solving-${Date.now()}-${Math.random().toString(36).substr(2, 9)}"Fixed unterminated template"(`Problem-solving workshop started: ${problem.title}"Fixed unterminated template"(`Solving workshop not found: ${workshopId}"Fixed unterminated template"(`Problem-solving workshop completed: ${workshopId}"Fixed unterminated template"(`Demo not found: ${data.demoId}"Fixed unterminated template"(`Demo feedback received for feature: ${data.featureId}"Fixed unterminated template"(`Workshop not found: ${data.workshopId}"Fixed unterminated template"(`Metrics reviewed for workshop: ${data.workshopId}"Fixed unterminated template" `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}"Fixed unterminated template" `feature-${Math.random().toString(36).substr(2, 9)}"Fixed unterminated template"