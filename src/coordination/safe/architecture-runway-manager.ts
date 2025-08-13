/**
 * @file Architecture Runway Manager - Phase 3, Day 14 (Task 13.1)
 *
 * Implements SAFe Architecture Runway management including architecture backlog and planning,
 * architectural epic and capability tracking, architecture decision workflow with AGUI,
 * and technical debt management. Integrates with the existing multi-level orchestration.
 *
 * ARCHITECTURE:
 * - Architecture runway and backlog management
 * - Architectural epic and capability tracking
 * - Architecture decision workflow with AGUI gates
 * - Technical debt management and tracking
 * - Integration with Program Increment and Value Stream management
 */

import { EventEmitter } from 'events';
import type { Logger } from '../../config/logging-config.ts';
import { getLogger } from '../../config/logging-config.ts';
import type { MemorySystem } from '../../core/memory-system.ts';
import type { TypeSafeEventBus } from '../../core/type-safe-event-system.ts';
import {
  createEvent,
  EventPriority,
} from '../../core/type-safe-event-system.ts';
import type { WorkflowGatesManager } from '../orchestration/workflow-gates.ts';
import { WorkflowHumanGateType } from '../orchestration/workflow-gates.ts';
import type {
  AgileReleaseTrain,
  Capability,
  Epic,
  Feature,
  ProgramIncrement,
  SAFeIntegrationConfig,
} from './index.ts';
import type { ProgramIncrementManager } from './program-increment-manager.ts';
import type { ValueStreamMapper } from './value-stream-mapper.ts';

// ============================================================================
// ARCHITECTURE RUNWAY CONFIGURATION
// ============================================================================

/**
 * Architecture Runway Manager configuration
 */
export interface ArchitectureRunwayConfig {
  readonly enableAGUIIntegration: boolean;
  readonly enableAutomatedTracking: boolean;
  readonly enableTechnicalDebtManagement: boolean;
  readonly enableArchitectureGovernance: boolean;
  readonly enableRunwayPlanning: boolean;
  readonly runwayPlanningHorizon: number; // PI cycles
  readonly technicalDebtThreshold: number; // 0-100 score
  readonly architectureReviewInterval: number; // milliseconds
  readonly runwayTrackingInterval: number; // milliseconds
  readonly maxArchitecturalEpics: number;
  readonly maxRunwayItems: number;
  readonly governanceApprovalTimeout: number; // milliseconds
}

/**
 * Architecture Runway item types
 */
export enum RunwayItemType {
  FOUNDATION = 'foundation',
  INFRASTRUCTURE = 'infrastructure',
  PLATFORM = 'platform',
  SECURITY = 'security',
  COMPLIANCE = 'compliance',
  PERFORMANCE = 'performance',
  INTEGRATION = 'integration',
  TOOLING = 'tooling',
}

/**
 * Architecture decision status
 */
export enum ArchitectureDecisionStatus {
  PROPOSED = 'proposed',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SUPERSEDED = 'superseded',
  IMPLEMENTED = 'implemented',
}

/**
 * Technical debt severity
 */
export enum TechnicalDebtSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Architecture Runway item
 */
export interface ArchitectureRunwayItem {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly type: RunwayItemType;
  readonly category: string;
  readonly priority: number; // 1-10 scale
  readonly businessValue: number; // 1-10 scale
  readonly effort: number; // story points or hours
  readonly complexity: 'simple' | 'moderate' | 'complex' | 'very-complex';
  readonly riskLevel: 'low' | 'medium' | 'high' | 'critical';
  readonly status: RunwayItemStatus;
  readonly assignedTeams: string[];
  readonly requiredSkills: string[];
  readonly dependencies: string[]; // Other runway item IDs
  readonly blockers: string[];
  readonly targetPI: string; // PI ID when this should be completed
  readonly createdBy: string;
  readonly createdAt: Date;
  readonly lastUpdated: Date;
  readonly completedAt?: Date;
  readonly architecture: ArchitecturalContext;
  readonly technicalSpecs: TechnicalSpecification;
  readonly acceptanceCriteria: AcceptanceCriterion[];
  readonly risks: ArchitecturalRisk[];
  readonly decisions: ArchitecturalDecision[];
}

/**
 * Runway item status
 */
export enum RunwayItemStatus {
  BACKLOG = 'backlog',
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  BLOCKED = 'blocked',
  REVIEW = 'review',
  APPROVED = 'approved',
  IMPLEMENTED = 'implemented',
  VERIFIED = 'verified',
  CLOSED = 'closed',
}

/**
 * Architectural context
 */
export interface ArchitecturalContext {
  readonly domain: string;
  readonly subdomain: string;
  readonly systemBoundaries: string[];
  readonly impactedComponents: string[];
  readonly architecturalLayers: ArchitecturalLayer[];
  readonly integrationPoints: IntegrationPoint[];
  readonly qualityAttributes: QualityAttribute[];
  readonly complianceRequirements: string[];
}

/**
 * Architectural layer
 */
export interface ArchitecturalLayer {
  readonly name: string;
  readonly description: string;
  readonly technologies: string[];
  readonly responsibilities: string[];
  readonly interfaces: LayerInterface[];
}

/**
 * Layer interface
 */
export interface LayerInterface {
  readonly name: string;
  readonly type: 'api' | 'event' | 'database' | 'file' | 'message_queue';
  readonly protocol: string;
  readonly dataFormat: string;
  readonly securityRequirements: string[];
}

/**
 * Integration point
 */
export interface IntegrationPoint {
  readonly name: string;
  readonly type: 'synchronous' | 'asynchronous' | 'batch' | 'stream';
  readonly systems: string[];
  readonly dataFlow: DataFlowDirection;
  readonly protocol: string;
  readonly securityLevel: 'public' | 'internal' | 'confidential' | 'restricted';
  readonly performanceRequirements: PerformanceRequirement;
}

/**
 * Data flow direction
 */
export enum DataFlowDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
  BIDIRECTIONAL = 'bidirectional',
}

/**
 * Performance requirement
 */
export interface PerformanceRequirement {
  readonly latency: number; // milliseconds
  readonly throughput: number; // requests/second
  readonly availability: number; // 0-1 (99.9% = 0.999)
  readonly scalability: ScalabilityRequirement;
}

/**
 * Scalability requirement
 */
export interface ScalabilityRequirement {
  readonly horizontal: boolean;
  readonly vertical: boolean;
  readonly maxLoad: number;
  readonly loadPattern: 'steady' | 'spiky' | 'seasonal';
}

/**
 * Quality attribute
 */
export interface QualityAttribute {
  readonly name: string;
  readonly category:
    | 'performance'
    | 'security'
    | 'reliability'
    | 'scalability'
    | 'maintainability'
    | 'usability';
  readonly description: string;
  readonly measurementMethod: string;
  readonly target: QualityTarget;
  readonly current?: QualityMeasurement;
  readonly priority: 'must-have' | 'should-have' | 'could-have' | 'wont-have';
}

/**
 * Quality target
 */
export interface QualityTarget {
  readonly metric: string;
  readonly value: number;
  readonly unit: string;
  readonly condition: string;
  readonly testMethod: string;
}

/**
 * Quality measurement
 */
export interface QualityMeasurement {
  readonly value: number;
  readonly unit: string;
  readonly measuredAt: Date;
  readonly testMethod: string;
  readonly confidence: number; // 0-1
}

/**
 * Technical specification
 */
export interface TechnicalSpecification {
  readonly technologies: Technology[];
  readonly frameworks: Framework[];
  readonly patterns: ArchitecturalPattern[];
  readonly standards: TechnicalStandard[];
  readonly tools: DevelopmentTool[];
  readonly environments: Environment[];
  readonly deployment: DeploymentSpecification;
}

/**
 * Technology specification
 */
export interface Technology {
  readonly name: string;
  readonly version: string;
  readonly purpose: string;
  readonly justification: string;
  readonly alternatives: string[];
  readonly risks: string[];
  readonly licensing: LicensingInfo;
  readonly support: SupportInfo;
}

/**
 * Framework specification
 */
export interface Framework {
  readonly name: string;
  readonly version: string;
  readonly purpose: string;
  readonly components: string[];
  readonly configuration: unknown;
  readonly customizations: string[];
}

/**
 * Architectural pattern
 */
export interface ArchitecturalPattern {
  readonly name: string;
  readonly type: 'structural' | 'behavioral' | 'creational';
  readonly description: string;
  readonly applicability: string;
  readonly implementation: string;
  readonly tradeoffs: string[];
}

/**
 * Technical standard
 */
export interface TechnicalStandard {
  readonly name: string;
  readonly version: string;
  readonly authority: string;
  readonly mandatoryRequirements: string[];
  readonly optionalRequirements: string[];
  readonly complianceLevel: 'full' | 'partial' | 'planned';
}

/**
 * Development tool
 */
export interface DevelopmentTool {
  readonly name: string;
  readonly version: string;
  readonly purpose: string;
  readonly configuration: unknown;
  readonly integrations: string[];
}

/**
 * Environment specification
 */
export interface Environment {
  readonly name: string;
  readonly type: 'development' | 'testing' | 'staging' | 'production';
  readonly infrastructure: InfrastructureSpec;
  readonly configuration: unknown;
  readonly securityProfile: SecurityProfile;
}

/**
 * Infrastructure specification
 */
export interface InfrastructureSpec {
  readonly compute: ComputeSpec;
  readonly storage: StorageSpec;
  readonly network: NetworkSpec;
  readonly monitoring: MonitoringSpec;
}

/**
 * Compute specification
 */
export interface ComputeSpec {
  readonly cpu: string;
  readonly memory: string;
  readonly instances: number;
  readonly autoScaling: boolean;
  readonly containerization: ContainerSpec;
}

/**
 * Container specification
 */
export interface ContainerSpec {
  readonly platform: string;
  readonly orchestration: string;
  readonly registry: string;
  readonly securityScanning: boolean;
}

/**
 * Deployment specification
 */
export interface DeploymentSpecification {
  readonly strategy: 'blue-green' | 'canary' | 'rolling' | 'recreate';
  readonly automation: boolean;
  readonly rollbackStrategy: string;
  readonly healthChecks: HealthCheck[];
  readonly monitoring: MonitoringRequirement[];
}

/**
 * Health check
 */
export interface HealthCheck {
  readonly name: string;
  readonly type: 'liveness' | 'readiness' | 'startup';
  readonly endpoint: string;
  readonly interval: number; // seconds
  readonly timeout: number; // seconds
  readonly retries: number;
}

/**
 * Acceptance criterion
 */
export interface AcceptanceCriterion {
  readonly id: string;
  readonly description: string;
  readonly type: 'functional' | 'non-functional' | 'technical' | 'business';
  readonly priority: 'must' | 'should' | 'could' | 'wont';
  readonly testMethod: string;
  readonly acceptanceTest: string;
  readonly status: 'pending' | 'in_progress' | 'passed' | 'failed' | 'blocked';
  readonly verifiedBy?: string;
  readonly verifiedAt?: Date;
}

/**
 * Architectural risk
 */
export interface ArchitecturalRisk {
  readonly id: string;
  readonly category:
    | 'technical'
    | 'business'
    | 'operational'
    | 'security'
    | 'compliance';
  readonly description: string;
  readonly impact: 'low' | 'medium' | 'high' | 'critical';
  readonly probability: number; // 0-1
  readonly riskScore: number; // calculated: impact × probability
  readonly mitigation: RiskMitigation;
  readonly contingency?: RiskContingency;
  readonly owner: string;
  readonly status:
    | 'identified'
    | 'assessed'
    | 'mitigated'
    | 'accepted'
    | 'transferred'
    | 'avoided';
}

/**
 * Risk mitigation
 */
export interface RiskMitigation {
  readonly strategy: 'mitigate' | 'avoid' | 'transfer' | 'accept';
  readonly actions: string[];
  readonly timeline: string;
  readonly resources: string[];
  readonly successCriteria: string[];
}

/**
 * Risk contingency
 */
export interface RiskContingency {
  readonly trigger: string;
  readonly actions: string[];
  readonly resources: string[];
  readonly timeline: string;
  readonly escalation: string[];
}

/**
 * Architectural decision
 */
export interface ArchitecturalDecision {
  readonly id: string;
  readonly title: string;
  readonly context: string;
  readonly problem: string;
  readonly decision: string;
  readonly alternatives: Alternative[];
  readonly consequences: Consequence[];
  readonly rationale: string;
  readonly assumptions: string[];
  readonly constraints: string[];
  readonly stakeholders: string[];
  readonly status: ArchitectureDecisionStatus;
  readonly decisionDate?: Date;
  readonly reviewDate?: Date;
  readonly supersededBy?: string;
  readonly relatedDecisions: string[];
}

/**
 * Decision alternative
 */
export interface Alternative {
  readonly name: string;
  readonly description: string;
  readonly pros: string[];
  readonly cons: string[];
  readonly cost: number;
  readonly effort: number;
  readonly risk: 'low' | 'medium' | 'high';
  readonly feasibility: number; // 0-10
}

/**
 * Decision consequence
 */
export interface Consequence {
  readonly type: 'positive' | 'negative' | 'neutral';
  readonly description: string;
  readonly impact: 'low' | 'medium' | 'high';
  readonly scope: string;
  readonly timeline: string;
}

/**
 * Technical debt item
 */
export interface TechnicalDebtItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly type: TechnicalDebtType;
  readonly severity: TechnicalDebtSeverity;
  readonly category: string;
  readonly component: string;
  readonly estimatedEffort: number; // hours
  readonly businessImpact: string;
  readonly technicalImpact: string;
  readonly currentCost: number; // $ per month
  readonly growthRate: number; // % per month
  readonly mitigationOptions: DebtMitigationOption[];
  readonly assignedTeam?: string;
  readonly targetResolution?: Date;
  readonly status: TechnicalDebtStatus;
  readonly priority: number; // 1-10
  readonly createdBy: string;
  readonly createdAt: Date;
  readonly lastAssessed: Date;
}

/**
 * Technical debt types
 */
export enum TechnicalDebtType {
  CODE_QUALITY = 'code_quality',
  ARCHITECTURE = 'architecture',
  DESIGN = 'design',
  DOCUMENTATION = 'documentation',
  TESTING = 'testing',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  INFRASTRUCTURE = 'infrastructure',
}

/**
 * Technical debt status
 */
export enum TechnicalDebtStatus {
  IDENTIFIED = 'identified',
  ASSESSED = 'assessed',
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  ACCEPTED = 'accepted',
  DEFERRED = 'deferred',
}

/**
 * Debt mitigation option
 */
export interface DebtMitigationOption {
  readonly name: string;
  readonly description: string;
  readonly effort: number; // hours
  readonly cost: number; // $
  readonly timeline: string;
  readonly benefits: string[];
  readonly risks: string[];
  readonly prerequisites: string[];
}

/**
 * Architecture backlog
 */
export interface ArchitectureBacklog {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly owner: string;
  readonly runwayItems: ArchitectureRunwayItem[];
  readonly technicalDebtItems: TechnicalDebtItem[];
  readonly architecturalDecisions: ArchitecturalDecision[];
  readonly prioritizationCriteria: PrioritizationCriterion[];
  readonly lastPrioritized: Date;
  readonly nextReview: Date;
}

/**
 * Prioritization criterion
 */
export interface PrioritizationCriterion {
  readonly name: string;
  readonly description: string;
  readonly weight: number; // 0-1
  readonly evaluationMethod: string;
}

// ============================================================================
// ARCHITECTURE RUNWAY STATE
// ============================================================================

/**
 * Architecture Runway Manager state
 */
export interface ArchitectureRunwayState {
  readonly architectureBacklogs: Map<string, ArchitectureBacklog>;
  readonly runwayItems: Map<string, ArchitectureRunwayItem>;
  readonly technicalDebtItems: Map<string, TechnicalDebtItem>;
  readonly architecturalDecisions: Map<string, ArchitecturalDecision>;
  readonly runwayPlanning: Map<string, RunwayPlan>; // PI ID -> Plan
  readonly governanceReviews: Map<string, GovernanceReview>;
  readonly lastTracking: Date;
  readonly lastGovernanceReview: Date;
}

/**
 * Runway plan for PI
 */
export interface RunwayPlan {
  readonly piId: string;
  readonly artId: string;
  readonly plannedRunwayItems: string[];
  readonly plannedDebtItems: string[];
  readonly capacityAllocation: CapacityAllocation[];
  readonly dependencies: string[];
  readonly risks: string[];
  readonly success;
  Criteria: string[];
  readonly createdAt: Date;
  readonly approvedBy?: string;
  readonly approvedAt?: Date;
}

/**
 * Capacity allocation for runway work
 */
export interface CapacityAllocation {
  readonly teamId: string;
  readonly teamName: string;
  readonly allocatedCapacity: number; // percentage of team capacity
  readonly runwayItems: string[];
  readonly debtItems: string[];
  readonly skills: string[];
  readonly constraints: string[];
}

/**
 * Governance review
 */
export interface GovernanceReview {
  readonly id: string;
  readonly type: 'architecture' | 'technology' | 'compliance' | 'security';
  readonly scope: string;
  readonly reviewDate: Date;
  readonly reviewers: string[];
  readonly items: ReviewItem[];
  readonly decisions: ReviewDecision[];
  readonly actionItems: ActionItem[];
  readonly nextReview: Date;
  readonly status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

/**
 * Review item
 */
export interface ReviewItem {
  readonly id: string;
  readonly type:
    | 'runway_item'
    | 'technical_debt'
    | 'architecture_decision'
    | 'design_document';
  readonly title: string;
  readonly description: string;
  readonly presenter: string;
  readonly duration: number; // minutes
  readonly materials: string[];
}

/**
 * Review decision
 */
export interface ReviewDecision {
  readonly itemId: string;
  readonly decision: 'approved' | 'rejected' | 'conditional' | 'deferred';
  readonly rationale: string;
  readonly conditions?: string[];
  readonly concerns: string[];
  readonly recommendations: string[];
  readonly followUpRequired: boolean;
  readonly followUpDate?: Date;
}

/**
 * Action item
 */
export interface ActionItem {
  readonly id: string;
  readonly description: string;
  readonly assignee: string;
  readonly dueDate: Date;
  readonly priority: 'low' | 'medium' | 'high' | 'critical';
  readonly dependencies: string[];
  readonly status: 'open' | 'in_progress' | 'completed' | 'cancelled';
}

// ============================================================================
// ARCHITECTURE RUNWAY MANAGER - Main Implementation
// ============================================================================

/**
 * Architecture Runway Manager - SAFe Architecture Runway and technical debt management
 */
export class ArchitectureRunwayManager extends EventEmitter {
  private readonly logger: Logger;
  private readonly eventBus: TypeSafeEventBus;
  private readonly memory: MemorySystem;
  private readonly gatesManager: WorkflowGatesManager;
  private readonly piManager: ProgramIncrementManager;
  private readonly valueStreamMapper: ValueStreamMapper;
  private readonly config: ArchitectureRunwayConfig;

  private state: ArchitectureRunwayState;
  private trackingTimer?: NodeJS.Timeout;
  private reviewTimer?: NodeJS.Timeout;

  constructor(
    eventBus: TypeSafeEventBus,
    memory: MemorySystem,
    gatesManager: WorkflowGatesManager,
    piManager: ProgramIncrementManager,
    valueStreamMapper: ValueStreamMapper,
    config: Partial<ArchitectureRunwayConfig> = {}
  ) {
    super();

    this.logger = getLogger('architecture-runway-manager');
    this.eventBus = eventBus;
    this.memory = memory;
    this.gatesManager = gatesManager;
    this.piManager = piManager;
    this.valueStreamMapper = valueStreamMapper;

    this.config = {
      enableAGUIIntegration: true,
      enableAutomatedTracking: true,
      enableTechnicalDebtManagement: true,
      enableArchitectureGovernance: true,
      enableRunwayPlanning: true,
      runwayPlanningHorizon: 3, // 3 PI cycles
      technicalDebtThreshold: 70, // 70% debt score threshold
      architectureReviewInterval: 604800000, // 1 week
      runwayTrackingInterval: 3600000, // 1 hour
      maxArchitecturalEpics: 20,
      maxRunwayItems: 100,
      governanceApprovalTimeout: 172800000, // 48 hours
      ...config,
    };

    this.state = this.initializeState();
  }

  // ============================================================================
  // LIFECYCLE MANAGEMENT
  // ============================================================================

  /**
   * Initialize the Architecture Runway Manager
   */
  async initialize(): Promise<void> {
    this.logger.info('Initializing Architecture Runway Manager', {
      config: this.config,
    });

    try {
      // Load persisted state
      await this.loadPersistedState();

      // Initialize default architecture backlog
      await this.initializeDefaultBacklog();

      // Start tracking if enabled
      if (this.config.enableAutomatedTracking) {
        this.startRunwayTracking();
      }

      // Start governance reviews if enabled
      if (this.config.enableArchitectureGovernance) {
        this.startGovernanceReviews();
      }

      // Register event handlers
      this.registerEventHandlers();

      this.logger.info('Architecture Runway Manager initialized successfully');
      this.emit('initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Architecture Runway Manager', {
        error,
      });
      throw error;
    }
  }

  /**
   * Shutdown the Architecture Runway Manager
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down Architecture Runway Manager');

    // Stop timers
    if (this.trackingTimer) clearInterval(this.trackingTimer);
    if (this.reviewTimer) clearInterval(this.reviewTimer);

    await this.persistState();
    this.removeAllListeners();

    this.logger.info('Architecture Runway Manager shutdown complete');
  }

  // ============================================================================
  // ARCHITECTURE BACKLOG AND PLANNING - Task 13.1
  // ============================================================================

  /**
   * Create architecture backlog and planning
   */
  async createArchitectureBacklog(
    name: string,
    description: string,
    owner: string
  ): Promise<ArchitectureBacklog> {
    this.logger.info('Creating architecture backlog', { name, owner });

    const backlog: ArchitectureBacklog = {
      id: `backlog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      owner,
      runwayItems: [],
      technicalDebtItems: [],
      architecturalDecisions: [],
      prioritizationCriteria: [
        {
          name: 'Business Value',
          description: 'Impact on business objectives and customer value',
          weight: 0.3,
          evaluationMethod: 'stakeholder_assessment',
        },
        {
          name: 'Technical Risk',
          description: 'Risk to system stability and future development',
          weight: 0.25,
          evaluationMethod: 'technical_assessment',
        },
        {
          name: 'Effort',
          description: 'Development effort required',
          weight: 0.2,
          evaluationMethod: 'estimation',
        },
        {
          name: 'Dependencies',
          description: 'Impact on other work and system components',
          weight: 0.15,
          evaluationMethod: 'dependency_analysis',
        },
        {
          name: 'Strategic Alignment',
          description: 'Alignment with architectural vision and strategy',
          weight: 0.1,
          evaluationMethod: 'strategic_assessment',
        },
      ],
      lastPrioritized: new Date(),
      nextReview: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
    };

    // Store in state
    this.state.architectureBacklogs.set(backlog.id, backlog);

    this.logger.info('Architecture backlog created', { backlogId: backlog.id });
    this.emit('architecture-backlog-created', backlog);
    return backlog;
  }

  /**
   * Add architecture runway item
   */
  async addArchitectureRunwayItem(
    backlogId: string,
    runwayItemData: Partial<ArchitectureRunwayItem>
  ): Promise<ArchitectureRunwayItem> {
    const backlog = this.state.architectureBacklogs.get(backlogId);
    if (!backlog) {
      throw new Error(`Architecture backlog not found: ${backlogId}`);
    }

    this.logger.info('Adding architecture runway item', {
      backlogId,
      itemName: runwayItemData.name,
    });

    const runwayItem: ArchitectureRunwayItem = {
      id: `runway-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: runwayItemData.name || 'Unnamed Runway Item',
      description: runwayItemData.description || '',
      type: runwayItemData.type || RunwayItemType.FOUNDATION,
      category: runwayItemData.category || 'general',
      priority: runwayItemData.priority || 5,
      businessValue: runwayItemData.businessValue || 5,
      effort: runwayItemData.effort || 0,
      complexity: runwayItemData.complexity || 'moderate',
      riskLevel: runwayItemData.riskLevel || 'medium',
      status: RunwayItemStatus.BACKLOG,
      assignedTeams: runwayItemData.assignedTeams || [],
      requiredSkills: runwayItemData.requiredSkills || [],
      dependencies: runwayItemData.dependencies || [],
      blockers: runwayItemData.blockers || [],
      targetPI: runwayItemData.targetPI || '',
      createdBy: runwayItemData.createdBy || 'system',
      createdAt: new Date(),
      lastUpdated: new Date(),
      architecture: runwayItemData.architecture || {
        domain: 'general',
        subdomain: 'general',
        systemBoundaries: [],
        impactedComponents: [],
        architecturalLayers: [],
        integrationPoints: [],
        qualityAttributes: [],
        complianceRequirements: [],
      },
      technicalSpecs: runwayItemData.technicalSpecs || {
        technologies: [],
        frameworks: [],
        patterns: [],
        standards: [],
        tools: [],
        environments: [],
        deployment: {
          strategy: 'rolling',
          automation: true,
          rollbackStrategy: 'previous_version',
          healthChecks: [],
          monitoring: [],
        },
      },
      acceptanceCriteria: runwayItemData.acceptanceCriteria || [],
      risks: runwayItemData.risks || [],
      decisions: runwayItemData.decisions || [],
    };

    // Store in state
    this.state.runwayItems.set(runwayItem.id, runwayItem);

    // Add to backlog
    const updatedBacklog = {
      ...backlog,
      runwayItems: [...backlog.runwayItems, runwayItem],
    };
    this.state.architectureBacklogs.set(backlogId, updatedBacklog);

    // Create AGUI gate for significant runway items
    if (runwayItem.priority >= 8 || runwayItem.riskLevel === 'critical') {
      await this.createRunwayApprovalGate(runwayItem);
    }

    this.logger.info('Architecture runway item added', {
      itemId: runwayItem.id,
      priority: runwayItem.priority,
      complexity: runwayItem.complexity,
    });

    this.emit('runway-item-added', { backlogId, runwayItem });
    return runwayItem;
  }

  /**
   * Plan architecture runway for PI
   */
  async planArchitectureRunwayForPI(
    piId: string,
    artId: string,
    availableCapacity: CapacityAllocation[]
  ): Promise<RunwayPlan> {
    this.logger.info('Planning architecture runway for PI', { piId, artId });

    // Get all runway items eligible for this PI
    const eligibleItems = await this.getEligibleRunwayItems(piId, artId);

    // Prioritize items based on backlog criteria
    const prioritizedItems = await this.prioritizeRunwayItems(
      eligibleItems,
      availableCapacity
    );

    // Select items that fit within capacity
    const selectedItems = await this.selectRunwayItemsForCapacity(
      prioritizedItems,
      availableCapacity
    );

    // Get technical debt items that can be addressed
    const debtItems = await this.selectTechnicalDebtForPI(
      piId,
      availableCapacity
    );

    // Identify dependencies and risks
    const dependencies = await this.identifyRunwayDependencies(selectedItems);
    const risks = await this.assessRunwayPlanRisks(
      selectedItems,
      debtItems,
      availableCapacity
    );

    const runwayPlan: RunwayPlan = {
      piId,
      artId,
      plannedRunwayItems: selectedItems.map((item) => item.id),
      plannedDebtItems: debtItems.map((item) => item.id),
      capacityAllocation: availableCapacity,
      dependencies,
      risks,
      successCriteria: [
        'All planned runway items completed within PI',
        'No critical technical debt items remain',
        'Architecture decisions are documented and approved',
        'Quality attributes meet defined targets',
        'No architectural risks materialize',
      ],
      createdAt: new Date(),
    };

    // Store in state
    this.state.runwayPlanning.set(piId, runwayPlan);

    // Create AGUI gate for plan approval if high risk
    if (
      risks.length > 0 ||
      selectedItems.some((item) => item.riskLevel === 'critical')
    ) {
      await this.createRunwayPlanApprovalGate(runwayPlan, risks);
    }

    this.logger.info('Architecture runway planning completed', {
      piId,
      runwayItems: selectedItems.length,
      debtItems: debtItems.length,
      riskCount: risks.length,
    });

    this.emit('runway-plan-created', runwayPlan);
    return runwayPlan;
  }

  // ============================================================================
  // ARCHITECTURAL EPIC AND CAPABILITY TRACKING - Task 13.1
  // ============================================================================

  /**
   * Track architectural epic implementation
   */
  async trackArchitecturalEpicProgress(
    epicId: string
  ): Promise<EpicProgressReport> {
    this.logger.info('Tracking architectural epic progress', { epicId });

    // Get epic details from program orchestrator
    const epic = await this.getEpicDetails(epicId);
    if (!epic) {
      throw new Error(`Epic not found: ${epicId}`);
    }

    // Collect runway items associated with this epic
    const associatedRunwayItems = Array.from(
      this.state.runwayItems.values()
    ).filter((item) =>
      item.architecture.impactedComponents.some((comp) =>
        epic.components?.includes(comp)
      )
    );

    // Calculate progress metrics
    const progressMetrics = await this.calculateEpicProgress(
      epic,
      associatedRunwayItems
    );

    // Assess architectural compliance
    const complianceAssessment = await this.assessArchitecturalCompliance(
      epic,
      associatedRunwayItems
    );

    // Check quality attributes
    const qualityAssessment = await this.assessQualityAttributes(
      epic,
      associatedRunwayItems
    );

    const progressReport: EpicProgressReport = {
      epicId,
      epicName: epic.name,
      overallProgress: progressMetrics.overallProgress,
      runwayItemsCompleted: progressMetrics.runwayItemsCompleted,
      runwayItemsTotal: progressMetrics.runwayItemsTotal,
      architecturalCompliance: complianceAssessment,
      qualityAttributeStatus: qualityAssessment,
      risks: progressMetrics.risks,
      blockers: progressMetrics.blockers,
      nextMilestones: progressMetrics.nextMilestones,
      lastUpdated: new Date(),
    };

    this.logger.info('Architectural epic progress tracked', {
      epicId,
      progress: progressMetrics.overallProgress,
      compliance: complianceAssessment.overallScore,
    });

    this.emit('epic-progress-tracked', progressReport);
    return progressReport;
  }

  /**
   * Track capability development
   */
  async trackCapabilityDevelopment(
    capabilityId: string
  ): Promise<CapabilityProgressReport> {
    this.logger.info('Tracking capability development', { capabilityId });

    // Get capability details
    const capability = await this.getCapabilityDetails(capabilityId);
    if (!capability) {
      throw new Error(`Capability not found: ${capabilityId}`);
    }

    // Get associated features and epics
    const associatedEpics = await this.getCapabilityEpics(capabilityId);
    const associatedFeatures = await this.getCapabilityFeatures(capabilityId);

    // Track architectural runway items for this capability
    const capabilityRunwayItems = Array.from(
      this.state.runwayItems.values()
    ).filter((item) => item.architecture.domain === capability.domain);

    // Calculate capability progress
    const progressMetrics = await this.calculateCapabilityProgress(
      capability,
      associatedEpics,
      associatedFeatures,
      capabilityRunwayItems
    );

    const progressReport: CapabilityProgressReport = {
      capabilityId,
      capabilityName: capability.name,
      domain: capability.domain,
      overallProgress: progressMetrics.overallProgress,
      epicProgress: progressMetrics.epicProgress,
      featureProgress: progressMetrics.featureProgress,
      runwayProgress: progressMetrics.runwayProgress,
      architecturalReadiness: progressMetrics.architecturalReadiness,
      risks: progressMetrics.risks,
      dependencies: progressMetrics.dependencies,
      lastUpdated: new Date(),
    };

    this.logger.info('Capability development progress tracked', {
      capabilityId,
      progress: progressMetrics.overallProgress,
      readiness: progressMetrics.architecturalReadiness,
    });

    this.emit('capability-progress-tracked', progressReport);
    return progressReport;
  }

  // ============================================================================
  // ARCHITECTURE DECISION WORKFLOW WITH AGUI - Task 13.1
  // ============================================================================

  /**
   * Create architecture decision with AGUI workflow
   */
  async createArchitecturalDecision(
    title: string,
    context: string,
    problem: string,
    alternatives: Alternative[],
    stakeholders: string[]
  ): Promise<ArchitecturalDecision> {
    this.logger.info('Creating architectural decision', { title });

    const decision: ArchitecturalDecision = {
      id: `adr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      context,
      problem,
      decision: '', // To be filled after AGUI workflow
      alternatives,
      consequences: [],
      rationale: '',
      assumptions: [],
      constraints: [],
      stakeholders,
      status: ArchitectureDecisionStatus.PROPOSED,
      relatedDecisions: [],
    };

    // Store in state
    this.state.architecturalDecisions.set(decision.id, decision);

    // Create AGUI gate for decision review
    await this.createArchitectureDecisionGate(decision, alternatives);

    this.logger.info('Architectural decision created', {
      decisionId: decision.id,
      alternativeCount: alternatives.length,
    });

    this.emit('architectural-decision-created', decision);
    return decision;
  }

  /**
   * Execute architecture decision workflow through AGUI
   */
  async executeArchitectureDecisionWorkflow(decisionId: string): Promise<void> {
    const decision = this.state.architecturalDecisions.get(decisionId);
    if (!decision) {
      throw new Error(`Architectural decision not found: ${decisionId}`);
    }

    this.logger.info('Executing architecture decision workflow', {
      decisionId,
    });

    try {
      // Update status to under review
      const updatedDecision = {
        ...decision,
        status: ArchitectureDecisionStatus.UNDER_REVIEW,
      };
      this.state.architecturalDecisions.set(decisionId, updatedDecision);

      // Create AGUI gate for stakeholder review
      const gateResult = await this.createDecisionReviewGate(updatedDecision);

      // Process gate result
      await this.processDecisionGateResult(decisionId, gateResult);

      this.logger.info('Architecture decision workflow executed', {
        decisionId,
        finalStatus: this.state.architecturalDecisions.get(decisionId)?.status,
      });

      this.emit('architecture-decision-workflow-completed', {
        decisionId,
        gateResult,
      });
    } catch (error) {
      this.logger.error('Architecture decision workflow failed', {
        decisionId,
        error,
      });

      // Update status to reflect failure
      const failedDecision = {
        ...decision,
        status: ArchitectureDecisionStatus.REJECTED,
      };
      this.state.architecturalDecisions.set(decisionId, failedDecision);
      throw error;
    }
  }

  // ============================================================================
  // TECHNICAL DEBT MANAGEMENT - Task 13.1
  // ============================================================================

  /**
   * Create technical debt management system
   */
  async createTechnicalDebtManagement(): Promise<void> {
    this.logger.info('Creating technical debt management system');

    // Initialize technical debt categories
    const debtCategories = [
      'Code Quality',
      'Architecture',
      'Design',
      'Documentation',
      'Testing',
      'Security',
      'Performance',
      'Infrastructure',
    ];

    // Set up automated debt detection
    if (this.config.enableAutomatedTracking) {
      await this.setupAutomatedDebtDetection();
    }

    // Initialize debt threshold monitoring
    await this.setupDebtThresholdMonitoring();

    this.logger.info('Technical debt management system created');
    this.emit('technical-debt-management-created');
  }

  /**
   * Add technical debt item
   */
  async addTechnicalDebtItem(
    debtData: Partial<TechnicalDebtItem>
  ): Promise<TechnicalDebtItem> {
    this.logger.info('Adding technical debt item', {
      title: debtData.title,
      severity: debtData.severity,
    });

    const debtItem: TechnicalDebtItem = {
      id: `debt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: debtData.title || 'Unnamed Technical Debt',
      description: debtData.description || '',
      type: debtData.type || TechnicalDebtType.CODE_QUALITY,
      severity: debtData.severity || TechnicalDebtSeverity.MEDIUM,
      category: debtData.category || 'general',
      component: debtData.component || 'unknown',
      estimatedEffort: debtData.estimatedEffort || 0,
      businessImpact: debtData.businessImpact || 'Unknown business impact',
      technicalImpact: debtData.technicalImpact || 'Unknown technical impact',
      currentCost: debtData.currentCost || 0,
      growthRate: debtData.growthRate || 5, // 5% per month default
      mitigationOptions: debtData.mitigationOptions || [],
      assignedTeam: debtData.assignedTeam,
      targetResolution: debtData.targetResolution,
      status: TechnicalDebtStatus.IDENTIFIED,
      priority: debtData.priority || 5,
      createdBy: debtData.createdBy || 'system',
      createdAt: new Date(),
      lastAssessed: new Date(),
    };

    // Store in state
    this.state.technicalDebtItems.set(debtItem.id, debtItem);

    // Create alert for critical debt
    if (debtItem.severity === TechnicalDebtSeverity.CRITICAL) {
      await this.createCriticalDebtAlert(debtItem);
    }

    // Check if debt threshold is exceeded
    await this.checkDebtThreshold();

    this.logger.info('Technical debt item added', {
      debtId: debtItem.id,
      severity: debtItem.severity,
      estimatedCost: debtItem.currentCost,
    });

    this.emit('technical-debt-added', debtItem);
    return debtItem;
  }

  /**
   * Assess technical debt portfolio
   */
  async assessTechnicalDebtPortfolio(): Promise<TechnicalDebtAssessment> {
    this.logger.info('Assessing technical debt portfolio');

    const allDebtItems = Array.from(this.state.technicalDebtItems.values());

    // Calculate debt metrics
    const totalDebt = allDebtItems.length;
    const debtByType = this.groupDebtByType(allDebtItems);
    const debtBySeverity = this.groupDebtBySeverity(allDebtItems);
    const totalCost = allDebtItems.reduce(
      (sum, item) => sum + item.currentCost,
      0
    );
    const averageAge = this.calculateAverageDebtAge(allDebtItems);

    // Calculate debt trends
    const trends = await this.calculateDebtTrends(allDebtItems);

    // Identify high-impact debt
    const highImpactDebt = allDebtItems
      .filter(
        (item) =>
          item.severity === TechnicalDebtSeverity.HIGH ||
          item.severity === TechnicalDebtSeverity.CRITICAL
      )
      .sort((a, b) => b.currentCost - a.currentCost);

    // Generate recommendations
    const recommendations = await this.generateDebtRecommendations(
      allDebtItems,
      trends
    );

    const assessment: TechnicalDebtAssessment = {
      totalItems: totalDebt,
      debtByType,
      debtBySeverity,
      totalMonthlyCost: totalCost,
      averageAge,
      trends,
      highImpactItems: highImpactDebt.slice(0, 10), // Top 10
      recommendations,
      riskLevel: this.calculateDebtRiskLevel(totalCost, highImpactDebt.length),
      lastAssessed: new Date(),
    };

    this.logger.info('Technical debt portfolio assessed', {
      totalItems: totalDebt,
      totalCost,
      riskLevel: assessment.riskLevel,
    });

    this.emit('technical-debt-assessed', assessment);
    return assessment;
  }

  // ============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // ============================================================================

  private initializeState(): ArchitectureRunwayState {
    return {
      architectureBacklogs: new Map(),
      runwayItems: new Map(),
      technicalDebtItems: new Map(),
      architecturalDecisions: new Map(),
      runwayPlanning: new Map(),
      governanceReviews: new Map(),
      lastTracking: new Date(),
      lastGovernanceReview: new Date(),
    };
  }

  private async loadPersistedState(): Promise<void> {
    try {
      const persistedState = await this.memory.retrieve(
        'architecture-runway:state'
      );
      if (persistedState) {
        this.state = {
          ...this.state,
          ...persistedState,
          architectureBacklogs: new Map(
            persistedState.architectureBacklogs || []
          ),
          runwayItems: new Map(persistedState.runwayItems || []),
          technicalDebtItems: new Map(persistedState.technicalDebtItems || []),
          architecturalDecisions: new Map(
            persistedState.architecturalDecisions || []
          ),
          runwayPlanning: new Map(persistedState.runwayPlanning || []),
          governanceReviews: new Map(persistedState.governanceReviews || []),
        };
        this.logger.info('Architecture Runway Manager state loaded');
      }
    } catch (error) {
      this.logger.warn('Failed to load persisted state', { error });
    }
  }

  private async persistState(): Promise<void> {
    try {
      const stateToSerialize = {
        ...this.state,
        architectureBacklogs: Array.from(
          this.state.architectureBacklogs.entries()
        ),
        runwayItems: Array.from(this.state.runwayItems.entries()),
        technicalDebtItems: Array.from(this.state.technicalDebtItems.entries()),
        architecturalDecisions: Array.from(
          this.state.architecturalDecisions.entries()
        ),
        runwayPlanning: Array.from(this.state.runwayPlanning.entries()),
        governanceReviews: Array.from(this.state.governanceReviews.entries()),
      };

      await this.memory.store('architecture-runway:state', stateToSerialize);
    } catch (error) {
      this.logger.error('Failed to persist state', { error });
    }
  }

  private async initializeDefaultBacklog(): Promise<void> {
    // Create default enterprise architecture backlog if none exists
    if (this.state.architectureBacklogs.size === 0) {
      await this.createArchitectureBacklog(
        'Enterprise Architecture Backlog',
        'Main backlog for enterprise architecture runway items and technical debt',
        'system'
      );
    }
  }

  private startRunwayTracking(): void {
    this.trackingTimer = setInterval(async () => {
      try {
        await this.performRunwayTracking();
      } catch (error) {
        this.logger.error('Runway tracking failed', { error });
      }
    }, this.config.runwayTrackingInterval);
  }

  private startGovernanceReviews(): void {
    this.reviewTimer = setInterval(async () => {
      try {
        await this.performGovernanceReview();
      } catch (error) {
        this.logger.error('Governance review failed', { error });
      }
    }, this.config.architectureReviewInterval);
  }

  private registerEventHandlers(): void {
    this.eventBus.registerHandler('pi-planning-started', async (event) => {
      await this.handlePIPlanningStarted(
        event.payload.piId,
        event.payload.artId
      );
    });

    this.eventBus.registerHandler('feature-completed', async (event) => {
      await this.handleFeatureCompletion(event.payload.featureId);
    });

    this.eventBus.registerHandler(
      'technical-debt-threshold-exceeded',
      async (event) => {
        await this.handleDebtThresholdExceeded(event.payload);
      }
    );
  }

  // Many placeholder implementations would follow...

  private async createRunwayApprovalGate(
    runwayItem: ArchitectureRunwayItem
  ): Promise<void> {}
  private async getEligibleRunwayItems(
    piId: string,
    artId: string
  ): Promise<ArchitectureRunwayItem[]> {
    return [];
  }
  private async prioritizeRunwayItems(
    items: ArchitectureRunwayItem[],
    capacity: CapacityAllocation[]
  ): Promise<ArchitectureRunwayItem[]> {
    return items;
  }
  private async selectRunwayItemsForCapacity(
    items: ArchitectureRunwayItem[],
    capacity: CapacityAllocation[]
  ): Promise<ArchitectureRunwayItem[]> {
    return items;
  }
  private async selectTechnicalDebtForPI(
    piId: string,
    capacity: CapacityAllocation[]
  ): Promise<TechnicalDebtItem[]> {
    return [];
  }
  private async identifyRunwayDependencies(
    items: ArchitectureRunwayItem[]
  ): Promise<string[]> {
    return [];
  }
  private async assessRunwayPlanRisks(
    items: ArchitectureRunwayItem[],
    debtItems: TechnicalDebtItem[],
    capacity: CapacityAllocation[]
  ): Promise<string[]> {
    return [];
  }
  private async createRunwayPlanApprovalGate(
    plan: RunwayPlan,
    risks: string[]
  ): Promise<void> {}
  private async getEpicDetails(epicId: string): Promise<unknown> {
    return null;
  }
  private async calculateEpicProgress(
    epic: unknown,
    runwayItems: ArchitectureRunwayItem[]
  ): Promise<unknown> {
    return {};
  }
  private async assessArchitecturalCompliance(
    epic: unknown,
    runwayItems: ArchitectureRunwayItem[]
  ): Promise<unknown> {
    return {};
  }
  private async assessQualityAttributes(
    epic: unknown,
    runwayItems: ArchitectureRunwayItem[]
  ): Promise<unknown> {
    return {};
  }
  private async getCapabilityDetails(capabilityId: string): Promise<unknown> {
    return null;
  }
  private async getCapabilityEpics(capabilityId: string): Promise<any[]> {
    return [];
  }
  private async getCapabilityFeatures(capabilityId: string): Promise<any[]> {
    return [];
  }
  private async calculateCapabilityProgress(
    capability: unknown,
    epics: unknown[],
    features: unknown[],
    runwayItems: ArchitectureRunwayItem[]
  ): Promise<unknown> {
    return {};
  }
  private async createArchitectureDecisionGate(
    decision: ArchitecturalDecision,
    alternatives: Alternative[]
  ): Promise<void> {}
  private async createDecisionReviewGate(
    decision: ArchitecturalDecision
  ): Promise<unknown> {
    return {};
  }
  private async processDecisionGateResult(
    decisionId: string,
    gateResult: unknown
  ): Promise<void> {}
  private async setupAutomatedDebtDetection(): Promise<void> {}
  private async setupDebtThresholdMonitoring(): Promise<void> {}
  private async createCriticalDebtAlert(
    debtItem: TechnicalDebtItem
  ): Promise<void> {}
  private async checkDebtThreshold(): Promise<void> {}
  private groupDebtByType(items: TechnicalDebtItem[]): Record<string, number> {
    return {};
  }
  private groupDebtBySeverity(
    items: TechnicalDebtItem[]
  ): Record<string, number> {
    return {};
  }
  private calculateAverageDebtAge(items: TechnicalDebtItem[]): number {
    return 0;
  }
  private async calculateDebtTrends(
    items: TechnicalDebtItem[]
  ): Promise<unknown> {
    return {};
  }
  private async generateDebtRecommendations(
    items: TechnicalDebtItem[],
    trends: unknown
  ): Promise<string[]> {
    return [];
  }
  private calculateDebtRiskLevel(
    totalCost: number,
    highImpactCount: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    return 'medium';
  }
  private async performRunwayTracking(): Promise<void> {}
  private async performGovernanceReview(): Promise<void> {}
  private async handlePIPlanningStarted(
    piId: string,
    artId: string
  ): Promise<void> {}
  private async handleFeatureCompletion(featureId: string): Promise<void> {}
  private async handleDebtThresholdExceeded(payload: unknown): Promise<void> {}
}

// ============================================================================
// SUPPORTING TYPES
// ============================================================================

export interface EpicProgressReport {
  readonly epicId: string;
  readonly epicName: string;
  readonly overallProgress: number;
  readonly runwayItemsCompleted: number;
  readonly runwayItemsTotal: number;
  readonly architecturalCompliance: unknown;
  readonly qualityAttributeStatus: unknown;
  readonly risks: string[];
  readonly blockers: string[];
  readonly nextMilestones: string[];
  readonly lastUpdated: Date;
}

export interface CapabilityProgressReport {
  readonly capabilityId: string;
  readonly capabilityName: string;
  readonly domain: string;
  readonly overallProgress: number;
  readonly epicProgress: number;
  readonly featureProgress: number;
  readonly runwayProgress: number;
  readonly architecturalReadiness: number;
  readonly risks: string[];
  readonly dependencies: string[];
  readonly lastUpdated: Date;
}

export interface TechnicalDebtAssessment {
  readonly totalItems: number;
  readonly debtByType: Record<string, number>;
  readonly debtBySeverity: Record<string, number>;
  readonly totalMonthlyCost: number;
  readonly averageAge: number;
  readonly trends: unknown;
  readonly highImpactItems: TechnicalDebtItem[];
  readonly recommendations: string[];
  readonly riskLevel: 'low' | 'medium' | 'high' | 'critical';
  readonly lastAssessed: Date;
}

// Additional supporting interfaces for completeness
export interface LicensingInfo {
  readonly type: 'open_source' | 'commercial' | 'proprietary' | 'custom';
  readonly license: string;
  readonly cost: number;
  readonly restrictions: string[];
}

export interface SupportInfo {
  readonly level: 'community' | 'commercial' | 'enterprise';
  readonly provider: string;
  readonly endOfLife?: Date;
  readonly updateFrequency: string;
}

export interface StorageSpec {
  readonly type: 'ssd' | 'hdd' | 'nvme' | 'cloud';
  readonly capacity: string;
  readonly iops: number;
  readonly backup: boolean;
}

export interface NetworkSpec {
  readonly bandwidth: string;
  readonly latency: string;
  readonly security: SecurityProfile;
  readonly loadBalancing: boolean;
}

export interface SecurityProfile {
  readonly authentication: string[];
  readonly authorization: string[];
  readonly encryption: EncryptionSpec;
  readonly compliance: string[];
}

export interface EncryptionSpec {
  readonly inTransit: boolean;
  readonly atRest: boolean;
  readonly algorithm: string;
  readonly keyManagement: string;
}

export interface MonitoringSpec {
  readonly metrics: string[];
  readonly logging: LoggingSpec;
  readonly alerting: AlertingSpec;
  readonly dashboards: string[];
}

export interface LoggingSpec {
  readonly level: 'debug' | 'info' | 'warn' | 'error';
  readonly retention: string;
  readonly aggregation: boolean;
}

export interface AlertingSpec {
  readonly channels: string[];
  readonly thresholds: Record<string, number>;
  readonly escalation: string[];
}

export interface MonitoringRequirement {
  readonly metric: string;
  readonly threshold: number;
  readonly action: string;
  readonly severity: 'info' | 'warning' | 'critical';
}

// ============================================================================
// EXPORTS
// ============================================================================

export default ArchitectureRunwayManager;

export type {
  ArchitectureRunwayConfig,
  ArchitectureRunwayItem,
  ArchitecturalDecision,
  TechnicalDebtItem,
  ArchitectureBacklog,
  RunwayPlan,
  ArchitectureRunwayState,
  EpicProgressReport,
  CapabilityProgressReport,
  TechnicalDebtAssessment,
};
