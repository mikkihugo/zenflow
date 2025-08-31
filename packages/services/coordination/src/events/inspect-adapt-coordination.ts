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
    this.on('ia: workshop-start', this.handleWorkshopStart.bind(this));
    this.on('ia: problem-identified', this.handleProblemIdentified.bind(this));
    this.on('ia: problem-voting', this.handleProblemVoting.bind(this));
    this.on(
      'ia: workshop-facilitation',
      this.handleWorkshopFacilitation.bind(this)
    );
    this.on('ia: demo-feedback', this.handleDemoFeedback.bind(this));
    this.on('ia: metrics-review', this.handleMetricsReview.bind(this));
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
    const workshopId = `ia-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const workshop: InspectAdaptWorkshop = {
      id: workshopId,
      artName: config.artName,
      piNumber: config.piNumber,
      workshopDate: config.workshopDate,
      duration: 8, // Full day workshop
      facilitators: config.facilitators,
      participants: config.teams,
      agenda: {
        piSystemDemo: this.createDefaultSystemDemo(workshopId, config.teams),
        quantitativeReview: this.createDefaultMetrics(config.teams),
        problemIdentification: [],
        problemSolvingWorkshops: [],
      },
      outcomes: {
        actionItems: [],
        improvements: [],
        experimentsPlanned: [],
        nextPIFocus: [],
      },
    };

    this.workshops.set(workshopId, workshop);
    logger.info(
      `I&A Workshop created: ${config.artName} PI ${config.piNumber}`
    );

    this.emit('ia: workshop-created', { workshopId, workshop });
    return workshop;
  }

  /**
   * Handle workshop start
   */
  private handleWorkshopStart(data: { workshopId: string }): void {
    const workshop = this.workshops.get(data.workshopId);
    if (!workshop) {
      logger.error(`Workshop not found: ${data.workshopId}`);
      return;
    }

    logger.info(
      `I&A Workshop started: ${workshop.artName} PI ${workshop.piNumber}`
    );

    // Initialize problem identification phase
    this.emit('ia: phase-start', {
      workshopId: data.workshopId,
      phase: 'problem-identification',
      duration: 90, // minutes
    });
  }

  /**
   * Handle problem identification
   */
  private handleProblemIdentified(data: {
    workshopId: string;
    problem: Omit<ProblemItem, 'id' | 'votes' | 'priority'>;
  }): void {
    const problemId = `problem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const problem: ProblemItem = {
      id: problemId,
      ...data.problem,
      votes: 0,
      priority: 0,
    };

    this.problems.set(problemId, problem);

    const workshop = this.workshops.get(data.workshopId);
    if (workshop) {
      workshop.agenda.problemIdentification.push(problem);
      this.workshops.set(data.workshopId, workshop);
    }

    logger.info(`Problem identified: ${problem.title}`);
    this.emit('ia: problem-added', { problemId, problem });
  }

  /**
   * Handle problem voting
   */
  private handleProblemVoting(data: {
    problemId: string;
    votes: number;
  }): void {
    const problem = this.problems.get(data.problemId);
    if (!problem) {
      logger.error(`Problem not found: ${data.problemId}`);
      return;
    }

    problem.votes = data.votes;
    problem.priority = this.calculatePriority(problem);

    this.problems.set(data.problemId, problem);
    logger.info(`Problem voted: ${problem.title} - ${data.votes} votes`);

    this.emit('ia: problem-prioritized', { problemId: data.problemId, problem });
  }

  /**
   * Handle workshop facilitation
   */
  private handleWorkshopFacilitation(data: {
    problemId: string;
    facilitator: string;
    participants: string[];
    technique: string;
  }): void {
    const problem = this.problems.get(data.problemId);
    if (!problem) {
      logger.error(`Problem not found: ${data.problemId}`);
      return;
    }

    const workshopId = `solving-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const solvingWorkshop: ProblemSolvingWorkshop = {
      id: workshopId,
      problemId: data.problemId,
      facilitator: data.facilitator,
      participants: data.participants,
      duration: 45, // 45 minutes per workshop
      techniques: [data.technique],
      outcomes: {
        rootCauseIdentified: false,
        rootCause: '',
        actionItems: [],
        followUpRequired: false,
      },
    };

    this.solvingWorkshops.set(workshopId, solvingWorkshop);
    logger.info(`Problem-solving workshop started: ${problem.title}`);

    this.emit('ia: solving-workshop-started', { workshopId, solvingWorkshop });
  }

  /**
   * Complete problem-solving workshop
   */
  completeSolvingWorkshop(
    workshopId: string,
    outcomes: ProblemSolvingWorkshop['outcomes']
  ): void {
    const workshop = this.solvingWorkshops.get(workshopId);
    if (!workshop) {
      logger.error(`Solving workshop not found: ${workshopId}`);
      return;
    }

    workshop.outcomes = outcomes;
    this.solvingWorkshops.set(workshopId, workshop);

    logger.info(`Problem-solving workshop completed: ${workshopId}`);
    this.emit('ia: solving-workshop-completed', { workshopId, outcomes });
  }

  /**
   * Handle demo feedback
   */
  private handleDemoFeedback(data: {
    demoId: string;
    featureId: string;
    feedback: string[];
  }): void {
    const demo = this.systemDemos.get(data.demoId);
    if (!demo) {
      logger.error(`Demo not found: ${data.demoId}`);
      return;
    }

    const feature = demo.features.find((f) => f.id === data.featureId);
    if (feature) {
      feature.stakeholderFeedback = data.feedback;
      this.systemDemos.set(data.demoId, demo);
    }

    logger.info(`Demo feedback received for feature: ${data.featureId}`);
    this.emit('ia: feedback-recorded', {
      demoId: data.demoId,
      featureId: data.featureId,
    });
  }

  /**
   * Handle metrics review
   */
  private handleMetricsReview(data: {
    workshopId: string;
    metrics: QuantitativeMeasurement[];
  }): void {
    const workshop = this.workshops.get(data.workshopId);
    if (!workshop) {
      logger.error(`Workshop not found: ${data.workshopId}`);
      return;
    }

    workshop.agenda.quantitativeReview = data.metrics;
    this.workshops.set(data.workshopId, workshop);

    logger.info(`Metrics reviewed for workshop: ${data.workshopId}`);
    this.emit('ia: metrics-updated', {
      workshopId: data.workshopId,
      metrics: data.metrics,
    });
  }

  /**
   * Create default system demo
   */
  private createDefaultSystemDemo(
    workshopId: string,
    teams: IATeam[]
  ): PISystemDemo {
    const demoId = `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const demo: PISystemDemo = {
      id: demoId,
      piId: workshopId,
      demoDate: new Date(),
      features: teams.flatMap((team) =>
        team.actualDelivery.map((delivery) => ({
          id: `feature-${Math.random().toString(36).substr(2, 9)}`,
          name: delivery,
          team: team.name,
          businessValue:
            team.businessValueDelivered / team.actualDelivery.length,
          demoStatus: 'completed' as const,
          stakeholderFeedback: [],
        }))
      ),
      stakeholderAttendance: {
        businessOwners: [],
        customers: [],
        sponsors: [],
      },
      overallFeedback: [],
      nextPIConsiderations: [],
    };

    this.systemDemos.set(demoId, demo);
    return demo;
  }

  /**
   * Create default metrics
   */
  private createDefaultMetrics(teams: IATeam[]): QuantitativeMeasurement[] {
    return [
      {
        category: 'Velocity',
        metric: 'Team Average Velocity',
        target: 40,
        actual:
          teams.reduce((sum, team) => sum + team.velocity, 0) / teams.length,
        trend: 'stable',
        actionRequired: false,
        analysis: 'Velocity trending as expected',
      },
      {
        category: 'Quality',
        metric: 'Average Test Coverage',
        target: 80,
        actual:
          teams.reduce(
            (sum, team) => sum + team.qualityMetrics.testCoverage,
            0
          ) / teams.length,
        trend: 'improving',
        actionRequired: false,
        analysis: 'Test coverage improving across teams',
      },
      {
        category: 'Technical Debt',
        metric: 'Average Tech Debt Score',
        target: 3,
        actual:
          teams.reduce(
            (sum, team) => sum + team.qualityMetrics.techDebtScore,
            0
          ) / teams.length,
        trend: 'stable',
        actionRequired: true,
        analysis: 'Technical debt requires attention',
      },
    ];
  }

  /**
   * Calculate problem priority
   */
  private calculatePriority(problem: ProblemItem): number {
    let priority = problem.votes;

    // Boost priority based on impact and frequency
    if (problem.impact === 'high') priority += 10;
    if (problem.impact === 'medium') priority += 5;
    if (problem.frequency === 'frequent') priority += 10;
    if (problem.frequency === 'occasional') priority += 5;

    // Boost priority based on affected teams
    priority += problem.affectedTeams.length * 2;

    return priority;
  }

  /**
   * Get workshop status
   */
  getWorkshopStatus(workshopId: string): {
    workshop?: InspectAdaptWorkshop;
    problemsSolved: number;
    actionItemsGenerated: number;
    participationRate: number;
    outcomes: string[];
  } {
    const workshop = this.workshops.get(workshopId);
    if (!workshop) {
      return {
        problemsSolved: 0,
        actionItemsGenerated: 0,
        participationRate: 0,
        outcomes: [],
      };
    }

    const solvingWorkshops = Array.from(this.solvingWorkshops.values()).filter(
      (sw) =>
        workshop.agenda.problemIdentification.some((p) => p.id === sw.problemId)
    );

    const problemsSolved = solvingWorkshops.filter(
      (sw) => sw.outcomes.rootCauseIdentified
    ).length;
    const actionItemsGenerated = solvingWorkshops.reduce(
      (total, sw) => total + sw.outcomes.actionItems.length,
      0
    );

    return {
      workshop,
      problemsSolved,
      actionItemsGenerated,
      participationRate: 95, // Placeholder calculation
      outcomes: workshop.outcomes.actionItems.concat(
        workshop.outcomes.improvements,
        workshop.outcomes.experimentsPlanned
      ),
    };
  }

  /**
   * Get all workshops
   */
  getAllWorkshops(): InspectAdaptWorkshop[] {
    return Array.from(this.workshops.values());
  }

  /**
   * Get problems by priority
   */
  getProblemsByPriority(): ProblemItem[] {
    return Array.from(this.problems.values()).sort(
      (a, b) => b.priority - a.priority
    );
  }
}

export default InspectAdaptCoordinationManager;
