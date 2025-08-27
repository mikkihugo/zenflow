/**
 * @fileoverview Release Train Engineer Manager - SAFe ART Facilitation
 *
 * Release Train Engineer management for SAFe Agile Release Train facilitation.
 * Coordinates PI planning, Scrum of Scrums, and program predictability measurement.
 *
 * Delegates to:
 * - PI Planning Facilitation Service for event coordination
 * - Scrum of Scrums Service for cross-team synchronization
 * - Program Predictability Service for metrics and analysis
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
/**
 * RTE Manager configuration
 */
export interface RTEManagerConfig {
    readonly enablePIPlanningFacilitation: boolean;
    readonly enableScrumOfScrums: boolean;
    readonly enableSystemDemoCoordination: boolean;
    readonly enableInspectAndAdaptFacilitation: boolean;
    readonly enableProgramSynchronization: boolean;
    readonly enablePredictabilityMeasurement: boolean;
    readonly enableRiskAndDependencyManagement: boolean;
    readonly enableMultiARTCoordination: boolean;
    readonly enableImpedimentTracking: boolean;
    readonly scrumOfScrumsFrequency: 'javascript' | 'typescript' | 'python' | 'java' | 'csharp' | 'cpp' | 'go' | 'ruby' | 'swift' | 'kotlin;;
    readonly systemDemoFrequency: 'javascript' | 'typescript' | 'python' | 'java' | 'csharp' | 'cpp' | 'go' | 'ruby' | 'swift' | 'kotlin;;
    readonly impedimentEscalationThreshold: number;
    readonly programSyncInterval: number;
    readonly predictabilityReportingInterval: number;
    readonly riskReviewInterval: number;
    readonly maxARTsUnderManagement: number;
    readonly maxImpedimentsPerTeam: number;
    readonly facilitation: FacilitationConfig;
}
/**
 * Facilitation configuration for RTE activities
 */
export interface FacilitationConfig {
    readonly enableTimeboxing: boolean;
    readonly enableConflictResolution: boolean;
    readonly enableConsensusBuilding: boolean;
    readonly enableActionItemTracking: boolean;
    readonly facilitationStyle: 'collaborative' | 'directive' | 'adaptive';
    readonly timeboxDurationMinutes: number;
    readonly breakFrequencyMinutes: number;
    readonly participantEngagementTracking: boolean;
}
export type { PIPlanningEventConfig, PlanningAgenda, PlanningFacilitationResult, PlanningParticipant, } from '../services/rte/pi-planning-facilitation-service';
export type { BusinessImpactAssessment, CustomerImpactLevel, MoraleImpactLevel, MultiARTCoordination, PredictabilityTrend, ProgramPredictability, ProgramSynchronization, QualityImpactLevel, } from '../services/rte/program-predictability-service';
export type { ImpedimentCategory, ImpedimentEscalationLevel, ImpedimentSeverity, ImpedimentStatus, ParticipationRecord, ProgramImpediment, ScrumOfScrumsAgenda, ScrumOfScrumsConfig, ScrumOfScrumsParticipant, } from '../services/rte/scrum-of-scrums-service';
export declare class ReleaseTrainEngineerManager extends EventBus {
    private logger;
    private piPlanningService;
    private scrumOfScrumsService;
    private predictabilityService;
    private config;
    private initialized;
    constructor(config: RTEManagerConfig);
    /**
     * Initialize with service delegation - LAZY LOADING
     */
    initialize(): Promise<void>;
    /**
     * Facilitate PI Planning event - Delegates to PI Planning Facilitation Service
     */
    facilitatePIPlanning(input: {
        piId: string;
        artId: string;
        duration: number;
        venue: string;
        facilitators: string[];
        objectives: any[];
        features: any[];
    }): Promise<any>;
    /**
     * Coordinate Scrum of Scrums - Delegates to Scrum of Scrums Service
     */
    coordinateScrumOfScrums(artId: string, teams: any[]): Promise<any>;
    /**
     * Measure program predictability - Delegates to Program Predictability Service
     */
    measurePredictability(piId: string, artId: string, objectives: any[], features: any[]): Promise<any>;
    /**
     * Track program impediment - Delegates to Scrum of Scrums Service
     */
    trackImpediment(impediment: {
        title: string;
        description: string;
        reportedBy: string;
        category: any;
        severity: any;
        affectedTeams: string[];
        impact: string;
    }): Promise<any>;
    /**
     * Escalate impediment - Delegates to Scrum of Scrums Service
     */
    escalateImpediment(impedimentId: string, escalationLevel: any): Promise<void>;
    /**
     * Resolve impediment - Delegates to Scrum of Scrums Service
     */
    resolveImpediment(impedimentId: string, resolution: any): Promise<void>;
    /**
     * Track team velocity - Delegates to Program Predictability Service
     */
    trackVelocity(teamId: string, piId: string, velocity: {
        plannedVelocity: number;
        actualVelocity: number;
        historicalAverage: number;
        factors?: any[];
    }): Promise<any>;
    /**
     * Assess business impact - Delegates to Program Predictability Service
     */
    assessBusinessImpact(impact: any): Promise<any>;
    /**
     * Get program predictability
     */
    getPredictability(piId: string, artId: string): Promise<any>;
    /**
     * Get impediment by ID
     */
    getImpediment(impedimentId: string): Promise<any>;
    /**
     * Get all ART impediments
     */
    getARTImpediments(artId: string): Promise<any[]>;
    /**
     * Get planning event
     */
    getPlanningEvent(eventId: string): Promise<any>;
    /**
     * Get facilitation results
     */
    getFacilitationResults(eventId: string): Promise<any>;
    /**
     * Get velocity tracking
     */
    getVelocityTracking(teamId: string, piId: string): Promise<any>;
    /**
     * Placeholder methods for test compatibility
     */
    manageProgramRisks(artId: string): Promise<any>;
    coordinateARTSynchronization(artId: string): Promise<any>;
    trackProgramPredictability(artId: string): Promise<any>;
    facilitateInspectAndAdapt(piId: string, artId: string, _config: any): Promise<any>;
    manageSystemDemo(config: any): Promise<any>;
}
export default ReleaseTrainEngineerManager;
//# sourceMappingURL=release-train-engineer-manager.d.ts.map