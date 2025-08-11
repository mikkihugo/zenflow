/**
 * @file Workflow Gates System - Phase 1, Task 2.1
 *
 * Define workflow gate types and triggers for human-in-the-loop orchestration.
 * Provides comprehensive gate management with persistence, state tracking, and metrics.
 *
 * IMPLEMENTATION:
 * - Strategic, Architectural, Quality, Business, and Ethical gates
 * - Event-driven gate triggers with condition evaluation
 * - Gate persistence and state management with SQLite backend
 * - Pending gates queue with priority handling
 * - Gate resolution tracking and comprehensive metrics
 * - Integration with existing WorkflowGateRequest system
 * - Memory-efficient single-focused implementation
 */

import Database from 'better-sqlite3';
import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import { join } from 'path';
import type { Logger } from '../../config/logging-config.ts';
import { getLogger } from '../../config/logging-config.ts';
import { Domain } from '../../core/domain-boundary-validator.ts';
import {
  type BaseEvent,
  createCorrelationId,
  createEvent,
  EventPriority,
  type TypeSafeEventBus,
} from '../../core/type-safe-event-system.ts';
import type { WorkflowContext as BaseWorkflowContext } from '../../workflows/types.ts';
import {
  createApprovalGate,
  createCheckpointGate,
  createEmergencyGate,
  GateEscalationLevel,
  WorkflowContext,
  type WorkflowGateRequest,
  WorkflowGateResult,
} from '../workflows/workflow-gate-request.ts';

const logger = getLogger('workflow-gates');

// ============================================================================
// WORKFLOW HUMAN GATE INTERFACES - Core gate definitions
// ============================================================================

/**
 * Workflow Human Gate interface defining all gate types and their triggers
 */
export interface WorkflowHumanGate {
  /** Unique gate identifier */
  readonly id: string;

  /** Gate type categorization */
  readonly type: WorkflowHumanGateType;

  /** Gate subtype for specific categorization */
  readonly subtype: string;

  /** Human-readable gate title */
  readonly title: string;

  /** Detailed gate description */
  readonly description: string;

  /** Current gate status */
  status: WorkflowHumanGateStatus;

  /** Gate creation timestamp */
  readonly createdAt: Date;

  /** Gate update timestamp */
  updatedAt: Date;

  /** Workflow context this gate belongs to */
  readonly workflowContext: WorkflowGateContext;

  /** Gate-specific data and parameters */
  readonly gateData: WorkflowGateData;

  /** Trigger conditions for this gate */
  readonly triggers: GateTrigger[];

  /** Priority level for gate processing */
  readonly priority: WorkflowGatePriority;

  /** Required approvals and stakeholders */
  readonly approvalConfig: GateApprovalConfig;

  /** Timeout configuration */
  readonly timeoutConfig?: GateTimeoutConfig;

  /** Resolution data once gate is resolved */
  resolution?: GateResolution;

  /** Metrics and tracking data */
  metrics: GateMetrics;

  /** Associated WorkflowGateRequest for AGUI integration */
  workflowGateRequest?: WorkflowGateRequest;
}

/**
 * Workflow Human Gate Types - Five main categories
 */
export enum WorkflowHumanGateType {
  STRATEGIC = 'strategic', // PRD approval, investment decisions
  ARCHITECTURAL = 'architectural', // System design, tech choices
  QUALITY = 'quality', // Security, performance, code review
  BUSINESS = 'business', // Feature validation, metrics review
  ETHICAL = 'ethical', // AI behavior, data usage
}

/**
 * Gate status enumeration
 */
export enum WorkflowHumanGateStatus {
  PENDING = 'pending',
  TRIGGERED = 'triggered',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  ESCALATED = 'escalated',
}

/**
 * Gate priority levels
 */
export enum WorkflowGatePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency',
}

/**
 * Extended workflow context for gates
 */
export interface WorkflowGateContext extends BaseWorkflowContext {
  /** Gate-specific workflow ID */
  readonly gateWorkflowId: string;

  /** Phase or step name within workflow */
  readonly phaseName: string;

  /** Business domain affected */
  readonly businessDomain: string;

  /** Technical domain affected */
  readonly technicalDomain: string;

  /** Affected stakeholder groups */
  readonly stakeholderGroups: string[];

  /** Impact assessment data */
  readonly impactAssessment: ImpactAssessment;

  /** Historical context */
  readonly historicalContext?: HistoricalContext;
}

/**
 * Impact assessment for gate decisions
 */
export interface ImpactAssessment {
  /** Business impact score (0-1) */
  readonly businessImpact: number;

  /** Technical impact score (0-1) */
  readonly technicalImpact: number;

  /** Risk impact score (0-1) */
  readonly riskImpact: number;

  /** Resource impact (cost, time) */
  readonly resourceImpact: ResourceImpact;

  /** Compliance impact assessment */
  readonly complianceImpact: ComplianceImpact;

  /** User experience impact */
  readonly userExperienceImpact: number;
}

/**
 * Resource impact details
 */
export interface ResourceImpact {
  /** Estimated time impact in hours */
  readonly timeHours: number;

  /** Estimated cost impact */
  readonly costImpact: number;

  /** Required team size */
  readonly teamSize: number;

  /** Resource criticality */
  readonly criticality: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Compliance impact assessment
 */
export interface ComplianceImpact {
  /** Regulatory requirements affected */
  readonly regulations: string[];

  /** Compliance risk level */
  readonly riskLevel: 'low' | 'medium' | 'high' | 'critical';

  /** Required compliance reviews */
  readonly requiredReviews: string[];

  /** Compliance deadlines */
  readonly deadlines: Date[];
}

/**
 * Historical context for decision making
 */
export interface HistoricalContext {
  /** Previous similar decisions */
  readonly previousDecisions: PreviousDecision[];

  /** Success patterns */
  readonly successPatterns: string[];

  /** Failure patterns */
  readonly failurePatterns: string[];

  /** Lessons learned */
  readonly lessonsLearned: string[];
}

/**
 * Previous decision record
 */
export interface PreviousDecision {
  /** Decision timestamp */
  readonly timestamp: Date;

  /** Decision context */
  readonly context: string;

  /** Decision outcome */
  readonly outcome: 'success' | 'failure' | 'partial';

  /** Impact realized */
  readonly impactRealized: number;

  /** Lessons from this decision */
  readonly lessons: string[];
}

/**
 * Gate-specific data container
 */
export interface WorkflowGateData {
  /** Raw data payload */
  readonly payload: Record<string, unknown>;

  /** Structured data for gate type */
  readonly structured: StructuredGateData;

  /** Attachments and references */
  readonly attachments: GateAttachment[];

  /** External references */
  readonly externalReferences: ExternalReference[];
}

/**
 * Structured data based on gate type
 */
export type StructuredGateData =
  | StrategicGateData
  | ArchitecturalGateData
  | QualityGateData
  | BusinessGateData
  | EthicalGateData;

/**
 * Strategic gate data structure
 */
export interface StrategicGateData {
  readonly type: 'strategic';
  readonly prdData?: PRDData;
  readonly investmentData?: InvestmentData;
  readonly strategyData?: StrategyData;
}

/**
 * PRD-specific data
 */
export interface PRDData {
  readonly prdId: string;
  readonly title: string;
  readonly businessObjectives: string[];
  readonly userStories: string[];
  readonly acceptanceCriteria: string[];
  readonly estimatedEffort: number;
  readonly riskFactors: string[];
}

/**
 * Investment decision data
 */
export interface InvestmentData {
  readonly investmentAmount: number;
  readonly expectedRoi: number;
  readonly timeframe: number;
  readonly riskAssessment: string[];
  readonly alternatives: string[];
}

/**
 * Strategy data
 */
export interface StrategyData {
  readonly strategicGoals: string[];
  readonly keyMetrics: string[];
  readonly timeline: string;
  readonly dependencies: string[];
}

/**
 * Architectural gate data structure
 */
export interface ArchitecturalGateData {
  readonly type: 'architectural';
  readonly systemDesign?: SystemDesignData;
  readonly techChoice?: TechChoiceData;
  readonly integrationData?: IntegrationData;
}

/**
 * System design data
 */
export interface SystemDesignData {
  readonly designDocument: string;
  readonly components: string[];
  readonly integrationPoints: string[];
  readonly scalabilityConsiderations: string[];
  readonly securityConsiderations: string[];
}

/**
 * Technology choice data
 */
export interface TechChoiceData {
  readonly technology: string;
  readonly alternatives: string[];
  readonly rationale: string[];
  readonly tradeoffs: string[];
  readonly migrationPlan?: string;
}

/**
 * Integration data
 */
export interface IntegrationData {
  readonly systems: string[];
  readonly protocols: string[];
  readonly dataFlows: string[];
  readonly securityRequirements: string[];
}

/**
 * Quality gate data structure
 */
export interface QualityGateData {
  readonly type: 'quality';
  readonly securityData?: SecurityData;
  readonly performanceData?: PerformanceData;
  readonly codeReviewData?: CodeReviewData;
}

/**
 * Security review data
 */
export interface SecurityData {
  readonly vulnerabilities: SecurityVulnerability[];
  readonly complianceChecks: string[];
  readonly threatModel: string[];
  readonly mitigationStrategies: string[];
}

/**
 * Security vulnerability
 */
export interface SecurityVulnerability {
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly description: string;
  readonly impact: string;
  readonly mitigation: string;
  readonly status: 'open' | 'fixed' | 'acknowledged';
}

/**
 * Performance data
 */
export interface PerformanceData {
  readonly metrics: PerformanceMetric[];
  readonly benchmarks: string[];
  readonly bottlenecks: string[];
  readonly optimizations: string[];
}

/**
 * Performance metric
 */
export interface PerformanceMetric {
  readonly name: string;
  readonly current: number;
  readonly target: number;
  readonly unit: string;
  readonly trend: 'improving' | 'stable' | 'degrading';
}

/**
 * Code review data
 */
export interface CodeReviewData {
  readonly pullRequests: string[];
  readonly codeQualityScore: number;
  readonly testCoverage: number;
  readonly issues: CodeIssue[];
}

/**
 * Code issue
 */
export interface CodeIssue {
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly type: string;
  readonly description: string;
  readonly location: string;
  readonly status: 'open' | 'fixed' | 'deferred';
}

/**
 * Business gate data structure
 */
export interface BusinessGateData {
  readonly type: 'business';
  readonly featureData?: FeatureValidationData;
  readonly metricsData?: MetricsReviewData;
  readonly marketData?: MarketAnalysisData;
}

/**
 * Feature validation data
 */
export interface FeatureValidationData {
  readonly featureId: string;
  readonly userFeedback: UserFeedback[];
  readonly usageMetrics: UsageMetric[];
  readonly businessValue: number;
  readonly competitorAnalysis: string[];
}

/**
 * User feedback
 */
export interface UserFeedback {
  readonly userId: string;
  readonly rating: number;
  readonly feedback: string;
  readonly timestamp: Date;
  readonly category: string;
}

/**
 * Usage metric
 */
export interface UsageMetric {
  readonly name: string;
  readonly value: number;
  readonly unit: string;
  readonly period: string;
  readonly trend: 'up' | 'down' | 'stable';
}

/**
 * Metrics review data
 */
export interface MetricsReviewData {
  readonly kpis: KPI[];
  readonly dashboards: string[];
  readonly alerts: string[];
  readonly insights: string[];
}

/**
 * Key Performance Indicator
 */
export interface KPI {
  readonly name: string;
  readonly current: number;
  readonly target: number;
  readonly unit: string;
  readonly status: 'on_track' | 'at_risk' | 'behind';
}

/**
 * Market analysis data
 */
export interface MarketAnalysisData {
  readonly marketSize: number;
  readonly competitors: string[];
  readonly opportunities: string[];
  readonly threats: string[];
  readonly positioning: string;
}

/**
 * Ethical gate data structure
 */
export interface EthicalGateData {
  readonly type: 'ethical';
  readonly aiBehaviorData?: AIBehaviorData;
  readonly dataUsageData?: DataUsageData;
  readonly biasAssessment?: BiasAssessmentData;
}

/**
 * AI behavior data
 */
export interface AIBehaviorData {
  readonly modelVersion: string;
  readonly behaviorTests: BehaviorTest[];
  readonly ethicalGuidelines: string[];
  readonly safetyMeasures: string[];
}

/**
 * Behavior test
 */
export interface BehaviorTest {
  readonly testName: string;
  readonly result: 'pass' | 'fail' | 'warning';
  readonly description: string;
  readonly recommendation: string;
}

/**
 * Data usage data
 */
export interface DataUsageData {
  readonly dataTypes: string[];
  readonly privacyCompliance: string[];
  readonly consentRequirements: string[];
  readonly retentionPolicies: string[];
}

/**
 * Bias assessment data
 */
export interface BiasAssessmentData {
  readonly biasTests: BiasTest[];
  readonly fairnessMetrics: FairnessMetric[];
  readonly mitigationStrategies: string[];
}

/**
 * Bias test
 */
export interface BiasTest {
  readonly testName: string;
  readonly biasScore: number;
  readonly threshold: number;
  readonly status: 'pass' | 'fail' | 'warning';
  readonly details: string;
}

/**
 * Fairness metric
 */
export interface FairnessMetric {
  readonly name: string;
  readonly score: number;
  readonly benchmark: number;
  readonly groups: string[];
  readonly status: 'fair' | 'biased' | 'unknown';
}

/**
 * Gate attachment
 */
export interface GateAttachment {
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly url: string;
  readonly size: number;
  readonly checksum: string;
}

/**
 * External reference
 */
export interface ExternalReference {
  readonly type: 'document' | 'ticket' | 'pr' | 'issue' | 'wiki' | 'url';
  readonly id: string;
  readonly url: string;
  readonly title: string;
  readonly description?: string;
}

// ============================================================================
// GATE TRIGGER SYSTEM - Event-driven triggers
// ============================================================================

/**
 * Gate trigger configuration
 */
export interface GateTrigger {
  /** Unique trigger identifier */
  readonly id: string;

  /** Event that triggers this gate */
  readonly event: GateTriggerEvent;

  /** Condition evaluation function */
  readonly condition: (context: WorkflowGateContext) => Promise<boolean> | boolean;

  /** Urgency level for triggered gate */
  readonly urgency: GateTriggerUrgency;

  /** Optional delay before triggering */
  readonly delay?: number;

  /** Whether trigger can be triggered multiple times */
  readonly repeatable?: boolean;

  /** Trigger metadata */
  readonly metadata: TriggerMetadata;
}

/**
 * Gate trigger events - Workflow phase completion events
 */
export type GateTriggerEvent =
  | 'prd-generated'
  | 'epic-created'
  | 'feature-designed'
  | 'sparc-phase-complete'
  | 'architecture-defined'
  | 'security-scan-complete'
  | 'performance-test-complete'
  | 'code-review-requested'
  | 'user-feedback-received'
  | 'metrics-threshold-reached'
  | 'compliance-check-required'
  | 'ethical-review-triggered'
  | 'investment-decision-required'
  | 'release-candidate-ready'
  | 'incident-detected'
  | 'custom-event';

/**
 * Gate trigger urgency levels
 */
export enum GateTriggerUrgency {
  IMMEDIATE = 'immediate', // Trigger immediately
  WITHIN_HOUR = 'within-hour', // Trigger within 1 hour
  WITHIN_DAY = 'within-day', // Trigger within 24 hours
  NEXT_REVIEW = 'next-review', // Trigger at next scheduled review
}

/**
 * Trigger metadata
 */
export interface TriggerMetadata {
  /** Trigger name */
  readonly name: string;

  /** Trigger description */
  readonly description: string;

  /** Associated workflow phases */
  readonly phases: string[];

  /** Required stakeholders */
  readonly stakeholders: string[];

  /** Trigger category */
  readonly category: string;

  /** Custom properties */
  readonly properties: Record<string, unknown>;
}

/**
 * Gate approval configuration
 */
export interface GateApprovalConfig {
  /** Required approvers */
  readonly approvers: string[];

  /** Required approvals count */
  readonly requiredApprovals: number;

  /** Approval timeout */
  readonly approvalTimeout?: number;

  /** Escalation chain */
  readonly escalationChain?: GateEscalationLevel[];

  /** Auto-approval conditions */
  readonly autoApprovalConditions?: AutoApprovalCondition[];
}

/**
 * Auto-approval condition
 */
export interface AutoApprovalCondition {
  readonly field: string;
  readonly operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
  readonly value: unknown;
  readonly description: string;
}

/**
 * Gate timeout configuration
 */
export interface GateTimeoutConfig {
  /** Initial timeout in milliseconds */
  readonly initialTimeout: number;

  /** Warning timeout in milliseconds */
  readonly warningTimeout?: number;

  /** Action on timeout */
  readonly onTimeout: 'escalate' | 'auto_approve' | 'auto_reject' | 'extend';

  /** Timeout extensions allowed */
  readonly maxExtensions?: number;
}

/**
 * Gate resolution data
 */
export interface GateResolution {
  /** Resolution timestamp */
  readonly resolvedAt: Date;

  /** Resolution decision */
  readonly decision: 'approved' | 'rejected' | 'deferred';

  /** Who resolved the gate */
  readonly resolvedBy: string;

  /** Resolution rationale */
  readonly rationale?: string;

  /** Resolution data */
  readonly data?: Record<string, unknown>;

  /** Follow-up actions */
  readonly followUpActions?: string[];

  /** Impact of resolution */
  readonly impactAssessment?: ResolvedImpactAssessment;
}

/**
 * Resolved impact assessment
 */
export interface ResolvedImpactAssessment {
  /** Actual time taken */
  readonly actualTime: number;

  /** Actual cost */
  readonly actualCost: number;

  /** Quality impact */
  readonly qualityImpact: number;

  /** Business value delivered */
  readonly businessValue: number;

  /** Lessons learned */
  readonly lessonsLearned: string[];
}

// ============================================================================
// GATE METRICS AND TRACKING - Comprehensive metrics
// ============================================================================

/**
 * Gate metrics tracking
 */
export interface GateMetrics {
  /** Gate creation time */
  readonly createdAt: Date;

  /** Time to first trigger */
  timeToTrigger?: number;

  /** Time to resolution */
  timeToResolution?: number;

  /** Number of escalations */
  escalationCount: number;

  /** Number of modifications */
  modificationCount: number;

  /** Stakeholder interactions */
  readonly stakeholderInteractions: StakeholderInteraction[];

  /** Gate effectiveness score */
  effectivenessScore?: number;

  /** Performance metrics */
  readonly performance: GatePerformanceMetrics;

  /** Quality metrics */
  readonly quality: GateQualityMetrics;
}

/**
 * Stakeholder interaction tracking
 */
export interface StakeholderInteraction {
  readonly stakeholder: string;
  readonly action: 'viewed' | 'commented' | 'approved' | 'rejected' | 'escalated';
  readonly timestamp: Date;
  readonly duration?: number;
  readonly data?: Record<string, unknown>;
}

/**
 * Gate performance metrics
 */
export interface GatePerformanceMetrics {
  /** Average processing time */
  readonly avgProcessingTime: number;

  /** Success rate */
  readonly successRate: number;

  /** Escalation rate */
  readonly escalationRate: number;

  /** Timeout rate */
  readonly timeoutRate: number;

  /** Resource utilization */
  readonly resourceUtilization: number;
}

/**
 * Gate quality metrics
 */
export interface GateQualityMetrics {
  /** Decision accuracy */
  readonly decisionAccuracy: number;

  /** Stakeholder satisfaction */
  readonly stakeholderSatisfaction: number;

  /** Process efficiency */
  readonly processEfficiency: number;

  /** Outcome quality */
  readonly outcomeQuality: number;

  /** Compliance score */
  readonly complianceScore: number;
}

// ============================================================================
// GATE PERSISTENCE MANAGER - SQLite-based persistence
// ============================================================================

/**
 * Gate persistence manager with SQLite backend
 */
export class GatePersistenceManager {
  private readonly logger: Logger;
  private db: Database.Database | null = null;
  private readonly dbPath: string;

  constructor(dbPath: string = './data/workflow-gates.db') {
    this.logger = getLogger('gate-persistence-manager');
    this.dbPath = dbPath;
  }

  async initialize(): Promise<void> {
    try {
      // Ensure data directory exists
      await fs.mkdir(join(this.dbPath, '..'), { recursive: true });

      this.db = new Database(this.dbPath);
      await this.createTables();

      this.logger.info('Gate persistence manager initialized', { dbPath: this.dbPath });
    } catch (error) {
      this.logger.error('Failed to initialize gate persistence manager', { error });
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Create gates table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS workflow_gates (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        subtype TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        workflow_context TEXT NOT NULL,
        gate_data TEXT NOT NULL,
        triggers TEXT NOT NULL,
        priority TEXT NOT NULL,
        approval_config TEXT NOT NULL,
        timeout_config TEXT,
        resolution TEXT,
        metrics TEXT NOT NULL,
        workflow_gate_request TEXT
      )
    `);

    // Create gate_queue table for pending gates
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS gate_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        gate_id TEXT NOT NULL,
        priority INTEGER NOT NULL,
        urgency TEXT NOT NULL,
        scheduled_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        processed BOOLEAN DEFAULT FALSE,
        FOREIGN KEY(gate_id) REFERENCES workflow_gates(id)
      )
    `);

    // Create gate_history table for tracking changes
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS gate_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        gate_id TEXT NOT NULL,
        action TEXT NOT NULL,
        actor TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        data TEXT,
        FOREIGN KEY(gate_id) REFERENCES workflow_gates(id)
      )
    `);

    // Create indexes
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_gates_status ON workflow_gates(status);
      CREATE INDEX IF NOT EXISTS idx_gates_type ON workflow_gates(type);
      CREATE INDEX IF NOT EXISTS idx_gates_created ON workflow_gates(created_at);
      CREATE INDEX IF NOT EXISTS idx_queue_priority ON gate_queue(priority, scheduled_at);
      CREATE INDEX IF NOT EXISTS idx_queue_processed ON gate_queue(processed);
      CREATE INDEX IF NOT EXISTS idx_history_gate ON gate_history(gate_id);
    `);

    this.logger.debug('Database tables created successfully');
  }

  async saveGate(gate: WorkflowHumanGate): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO workflow_gates 
      (id, type, subtype, title, description, status, created_at, updated_at,
       workflow_context, gate_data, triggers, priority, approval_config,
       timeout_config, resolution, metrics, workflow_gate_request)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      gate.id,
      gate.type,
      gate.subtype,
      gate.title,
      gate.description,
      gate.status,
      gate.createdAt.getTime(),
      gate.updatedAt.getTime(),
      JSON.stringify(gate.workflowContext),
      JSON.stringify(gate.gateData),
      JSON.stringify(gate.triggers),
      gate.priority,
      JSON.stringify(gate.approvalConfig),
      gate.timeoutConfig ? JSON.stringify(gate.timeoutConfig) : null,
      gate.resolution ? JSON.stringify(gate.resolution) : null,
      JSON.stringify(gate.metrics),
      gate.workflowGateRequest ? JSON.stringify(gate.workflowGateRequest) : null
    );

    this.logger.debug('Gate saved to database', { gateId: gate.id, status: gate.status });
  }

  async getGate(gateId: string): Promise<WorkflowHumanGate | null> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      SELECT * FROM workflow_gates WHERE id = ?
    `);

    const row = stmt.get(gateId) as any;
    if (!row) return null;

    return this.deserializeGate(row);
  }

  async getGatesByStatus(status: WorkflowHumanGateStatus[]): Promise<WorkflowHumanGate[]> {
    if (!this.db) throw new Error('Database not initialized');

    const placeholders = status.map(() => '?').join(',');
    const stmt = this.db.prepare(`
      SELECT * FROM workflow_gates WHERE status IN (${placeholders})
      ORDER BY created_at DESC
    `);

    const rows = stmt.all(...status) as any[];
    return rows.map((row) => this.deserializeGate(row));
  }

  async getGatesByType(type: WorkflowHumanGateType): Promise<WorkflowHumanGate[]> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      SELECT * FROM workflow_gates WHERE type = ?
      ORDER BY created_at DESC
    `);

    const rows = stmt.all(type) as any[];
    return rows.map((row) => this.deserializeGate(row));
  }

  async updateGateStatus(
    gateId: string,
    status: WorkflowHumanGateStatus,
    resolution?: GateResolution
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      UPDATE workflow_gates 
      SET status = ?, updated_at = ?, resolution = ?
      WHERE id = ?
    `);

    stmt.run(status, Date.now(), resolution ? JSON.stringify(resolution) : null, gateId);

    this.logger.debug('Gate status updated', { gateId, status });
  }

  async addToQueue(
    gateId: string,
    priority: number,
    urgency: GateTriggerUrgency,
    scheduledAt: Date
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      INSERT INTO gate_queue (gate_id, priority, urgency, scheduled_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(gateId, priority, urgency, scheduledAt.getTime(), Date.now());
    this.logger.debug('Gate added to queue', { gateId, priority, urgency });
  }

  async getQueuedGates(
    limit: number = 50
  ): Promise<Array<{ gate: WorkflowHumanGate; queueItem: any }>> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      SELECT 
        g.*,
        q.id as queue_id,
        q.priority as queue_priority,
        q.urgency as queue_urgency,
        q.scheduled_at as queue_scheduled_at
      FROM gate_queue q
      JOIN workflow_gates g ON q.gate_id = g.id
      WHERE q.processed = FALSE AND q.scheduled_at <= ?
      ORDER BY q.priority DESC, q.scheduled_at ASC
      LIMIT ?
    `);

    const rows = stmt.all(Date.now(), limit) as any[];

    return rows.map((row) => ({
      gate: this.deserializeGate(row),
      queueItem: {
        id: row.queue_id,
        priority: row.queue_priority,
        urgency: row.queue_urgency,
        scheduledAt: new Date(row.queue_scheduled_at),
      },
    }));
  }

  async markQueueItemProcessed(queueItemId: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      UPDATE gate_queue SET processed = TRUE WHERE id = ?
    `);

    stmt.run(queueItemId);
  }

  async addHistoryEntry(gateId: string, action: string, actor: string, data?: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      INSERT INTO gate_history (gate_id, action, actor, timestamp, data)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(gateId, action, actor, Date.now(), data ? JSON.stringify(data) : null);
  }

  async getGateHistory(gateId: string): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare(`
      SELECT * FROM gate_history WHERE gate_id = ?
      ORDER BY timestamp DESC
    `);

    const rows = stmt.all(gateId) as any[];
    return rows.map((row) => ({
      id: row.id,
      gateId: row.gate_id,
      action: row.action,
      actor: row.actor,
      timestamp: new Date(row.timestamp),
      data: row.data ? JSON.parse(row.data) : null,
    }));
  }

  async getMetrics(timeRange?: { from: Date; to: Date }): Promise<GatePersistenceMetrics> {
    if (!this.db) throw new Error('Database not initialized');

    let whereClause = '';
    const params: any[] = [];

    if (timeRange) {
      whereClause = 'WHERE created_at BETWEEN ? AND ?';
      params.push(timeRange.from.getTime(), timeRange.to.getTime());
    }

    // Total gates
    const totalStmt = this.db.prepare(
      `SELECT COUNT(*) as count FROM workflow_gates ${whereClause}`
    );
    const totalResult = totalStmt.get(...params) as any;

    // Gates by status
    const statusStmt = this.db.prepare(`
      SELECT status, COUNT(*) as count 
      FROM workflow_gates ${whereClause}
      GROUP BY status
    `);
    const statusResults = statusStmt.all(...params) as any[];

    // Gates by type
    const typeStmt = this.db.prepare(`
      SELECT type, COUNT(*) as count 
      FROM workflow_gates ${whereClause}
      GROUP BY type
    `);
    const typeResults = typeStmt.all(...params) as any[];

    // Average resolution time (for resolved gates)
    const resolutionTimeStmt = this.db.prepare(`
      SELECT AVG(
        json_extract(resolution, '$.resolvedAt') - created_at
      ) as avg_time
      FROM workflow_gates 
      WHERE resolution IS NOT NULL ${whereClause ? 'AND ' + whereClause.replace('WHERE ', '') : ''}
    `);
    const resolutionTimeResult = resolutionTimeStmt.get(...params) as any;

    return {
      totalGates: totalResult.count,
      gatesByStatus: statusResults.reduce((acc, row) => {
        acc[row.status] = row.count;
        return acc;
      }, {}),
      gatesByType: typeResults.reduce((acc, row) => {
        acc[row.type] = row.count;
        return acc;
      }, {}),
      averageResolutionTime: resolutionTimeResult.avg_time || 0,
      timeRange: timeRange || null,
    };
  }

  private deserializeGate(row: any): WorkflowHumanGate {
    return {
      id: row.id,
      type: row.type as WorkflowHumanGateType,
      subtype: row.subtype,
      title: row.title,
      description: row.description,
      status: row.status as WorkflowHumanGateStatus,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      workflowContext: JSON.parse(row.workflow_context),
      gateData: JSON.parse(row.gate_data),
      triggers: JSON.parse(row.triggers),
      priority: row.priority as WorkflowGatePriority,
      approvalConfig: JSON.parse(row.approval_config),
      timeoutConfig: row.timeout_config ? JSON.parse(row.timeout_config) : undefined,
      resolution: row.resolution ? JSON.parse(row.resolution) : undefined,
      metrics: JSON.parse(row.metrics),
      workflowGateRequest: row.workflow_gate_request
        ? JSON.parse(row.workflow_gate_request)
        : undefined,
    };
  }

  async shutdown(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.logger.info('Gate persistence manager shutdown');
    }
  }
}

/**
 * Gate persistence metrics
 */
export interface GatePersistenceMetrics {
  readonly totalGates: number;
  readonly gatesByStatus: Record<string, number>;
  readonly gatesByType: Record<string, number>;
  readonly averageResolutionTime: number;
  readonly timeRange: { from: Date; to: Date } | null;
}

// ============================================================================
// WORKFLOW GATES MANAGER - Main orchestration class
// ============================================================================

/**
 * Workflow Gates Manager - Main orchestration class for gate lifecycle
 */
export class WorkflowGatesManager extends EventEmitter {
  private readonly logger: Logger;
  private readonly persistence: GatePersistenceManager;
  private readonly eventBus: TypeSafeEventBus;
  private readonly gateFactories = new Map<WorkflowHumanGateType, GateFactory>();
  private readonly triggerEvaluators = new Map<GateTriggerEvent, TriggerEvaluator>();
  private queueProcessor: NodeJS.Timeout | null = null;
  private isInitialized = false;

  // Configuration
  private readonly config: WorkflowGatesManagerConfig;

  constructor(eventBus: TypeSafeEventBus, config: WorkflowGatesManagerConfig = {}) {
    super();

    this.logger = getLogger('workflow-gates-manager');
    this.eventBus = eventBus;
    this.config = {
      persistencePath: './data/workflow-gates.db',
      queueProcessingInterval: 30000, // 30 seconds
      maxConcurrentGates: 100,
      enableMetrics: true,
      ...config,
    };

    this.persistence = new GatePersistenceManager(this.config.persistencePath);
  }

  // --------------------------------------------------------------------------
  // LIFECYCLE METHODS
  // --------------------------------------------------------------------------

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.persistence.initialize();
      this.registerGateFactories();
      this.registerTriggerEvaluators();
      this.startQueueProcessor();

      this.isInitialized = true;
      this.logger.info('Workflow Gates Manager initialized');
      this.emit('initialized');
    } catch (error) {
      this.logger.error('Failed to initialize workflow gates manager', { error });
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    if (this.queueProcessor) {
      clearInterval(this.queueProcessor);
      this.queueProcessor = null;
    }

    await this.persistence.shutdown();

    this.isInitialized = false;
    this.removeAllListeners();

    this.logger.info('Workflow Gates Manager shutdown');
  }

  // --------------------------------------------------------------------------
  // GATE MANAGEMENT
  // --------------------------------------------------------------------------

  async createGate(
    type: WorkflowHumanGateType,
    subtype: string,
    workflowContext: WorkflowGateContext,
    gateData: WorkflowGateData,
    options: CreateGateOptions = {}
  ): Promise<WorkflowHumanGate> {
    await this.ensureInitialized();

    const factory = this.gateFactories.get(type);
    if (!factory) {
      throw new Error(`No factory registered for gate type: ${type}`);
    }

    const gate = factory.createGate(subtype, workflowContext, gateData, options);

    // Save to persistence
    await this.persistence.saveGate(gate);

    // Add history entry
    await this.persistence.addHistoryEntry(gate.id, 'created', 'system', {
      type,
      subtype,
      workflowId: workflowContext.gateWorkflowId,
    });

    // Process triggers
    await this.processTriggers(gate);

    this.logger.info('Gate created', {
      gateId: gate.id,
      type,
      subtype,
      workflowId: workflowContext.gateWorkflowId,
    });

    this.emit('gate-created', gate);
    return gate;
  }

  async updateGate(gateId: string, updates: Partial<WorkflowHumanGate>): Promise<void> {
    const gate = await this.persistence.getGate(gateId);
    if (!gate) {
      throw new Error(`Gate not found: ${gateId}`);
    }

    // Apply updates
    const updatedGate: WorkflowHumanGate = {
      ...gate,
      ...updates,
      updatedAt: new Date(),
    };

    await this.persistence.saveGate(updatedGate);
    await this.persistence.addHistoryEntry(gateId, 'updated', 'system', updates);

    this.logger.info('Gate updated', { gateId, updates: Object.keys(updates) });
    this.emit('gate-updated', updatedGate);
  }

  async resolveGate(
    gateId: string,
    decision: 'approved' | 'rejected' | 'deferred',
    resolvedBy: string,
    rationale?: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    const gate = await this.persistence.getGate(gateId);
    if (!gate) {
      throw new Error(`Gate not found: ${gateId}`);
    }

    const resolution: GateResolution = {
      resolvedAt: new Date(),
      decision,
      resolvedBy,
      rationale,
      data,
    };

    const newStatus =
      decision === 'approved'
        ? WorkflowHumanGateStatus.APPROVED
        : decision === 'rejected'
          ? WorkflowHumanGateStatus.REJECTED
          : WorkflowHumanGateStatus.PENDING;

    await this.persistence.updateGateStatus(gateId, newStatus, resolution);
    await this.persistence.addHistoryEntry(gateId, 'resolved', resolvedBy, { decision, rationale });

    // Update metrics
    const updatedGate = await this.persistence.getGate(gateId);
    if (updatedGate) {
      updatedGate.metrics.timeToResolution = Date.now() - gate.createdAt.getTime();
      await this.persistence.saveGate(updatedGate);
    }

    this.logger.info('Gate resolved', { gateId, decision, resolvedBy });
    this.emit('gate-resolved', { gateId, decision, resolvedBy, resolution });
  }

  async cancelGate(gateId: string, reason: string, cancelledBy: string): Promise<void> {
    await this.persistence.updateGateStatus(gateId, WorkflowHumanGateStatus.CANCELLED);
    await this.persistence.addHistoryEntry(gateId, 'cancelled', cancelledBy, { reason });

    this.logger.info('Gate cancelled', { gateId, reason, cancelledBy });
    this.emit('gate-cancelled', { gateId, reason, cancelledBy });
  }

  // --------------------------------------------------------------------------
  // QUEUE MANAGEMENT
  // --------------------------------------------------------------------------

  async addToQueue(
    gateId: string,
    priority: number,
    urgency: GateTriggerUrgency,
    scheduledAt?: Date
  ): Promise<void> {
    const scheduled = scheduledAt || new Date();
    await this.persistence.addToQueue(gateId, priority, urgency, scheduled);

    this.logger.debug('Gate added to queue', { gateId, priority, urgency, scheduledAt: scheduled });
  }

  async getQueuedGates(): Promise<Array<{ gate: WorkflowHumanGate; queueItem: any }>> {
    return this.persistence.getQueuedGates();
  }

  // --------------------------------------------------------------------------
  // QUERY METHODS
  // --------------------------------------------------------------------------

  async getGate(gateId: string): Promise<WorkflowHumanGate | null> {
    return this.persistence.getGate(gateId);
  }

  async getGatesByStatus(status: WorkflowHumanGateStatus[]): Promise<WorkflowHumanGate[]> {
    return this.persistence.getGatesByStatus(status);
  }

  async getGatesByType(type: WorkflowHumanGateType): Promise<WorkflowHumanGate[]> {
    return this.persistence.getGatesByType(type);
  }

  async getPendingGates(): Promise<WorkflowHumanGate[]> {
    return this.persistence.getGatesByStatus([
      WorkflowHumanGateStatus.PENDING,
      WorkflowHumanGateStatus.TRIGGERED,
      WorkflowHumanGateStatus.IN_REVIEW,
    ]);
  }

  async getGateHistory(gateId: string): Promise<any[]> {
    return this.persistence.getGateHistory(gateId);
  }

  // --------------------------------------------------------------------------
  // METRICS AND ANALYTICS
  // --------------------------------------------------------------------------

  async getMetrics(timeRange?: { from: Date; to: Date }): Promise<WorkflowGatesMetrics> {
    const persistenceMetrics = await this.persistence.getMetrics(timeRange);
    const queuedGates = await this.getQueuedGates();

    return {
      ...persistenceMetrics,
      queuedGatesCount: queuedGates.length,
      activeGatesCount: persistenceMetrics.gatesByStatus[WorkflowHumanGateStatus.TRIGGERED] || 0,
      completedGatesCount:
        (persistenceMetrics.gatesByStatus[WorkflowHumanGateStatus.APPROVED] || 0) +
        (persistenceMetrics.gatesByStatus[WorkflowHumanGateStatus.REJECTED] || 0),
    };
  }

  // --------------------------------------------------------------------------
  // TRIGGER PROCESSING
  // --------------------------------------------------------------------------

  async processTriggers(gate: WorkflowHumanGate): Promise<void> {
    for (const trigger of gate.triggers) {
      try {
        const shouldTrigger = await trigger.condition(gate.workflowContext);

        if (shouldTrigger) {
          await this.triggerGate(gate, trigger);
        }
      } catch (error) {
        this.logger.error('Trigger evaluation failed', {
          gateId: gate.id,
          triggerId: trigger.id,
          error,
        });
      }
    }
  }

  async triggerGate(gate: WorkflowHumanGate, trigger: GateTrigger): Promise<void> {
    // Update gate status
    await this.persistence.updateGateStatus(gate.id, WorkflowHumanGateStatus.TRIGGERED);

    // Add to queue based on urgency
    const priority = this.urgencyToPriority(trigger.urgency);
    const scheduledAt = this.calculateScheduledTime(trigger.urgency, trigger.delay);

    await this.addToQueue(gate.id, priority, trigger.urgency, scheduledAt);

    // Add history entry
    await this.persistence.addHistoryEntry(gate.id, 'triggered', 'system', {
      triggerId: trigger.id,
      urgency: trigger.urgency,
    });

    // Create WorkflowGateRequest for AGUI integration if needed
    if (trigger.urgency === GateTriggerUrgency.IMMEDIATE) {
      await this.createWorkflowGateRequest(gate);
    }

    this.logger.info('Gate triggered', {
      gateId: gate.id,
      triggerId: trigger.id,
      urgency: trigger.urgency,
    });

    this.emit('gate-triggered', { gate, trigger });
  }

  // --------------------------------------------------------------------------
  // AGUI INTEGRATION
  // --------------------------------------------------------------------------

  async createWorkflowGateRequest(gate: WorkflowHumanGate): Promise<WorkflowGateRequest> {
    // Convert WorkflowHumanGate to WorkflowGateRequest format
    const workflowGateRequest: WorkflowGateRequest = createApprovalGate(
      gate.workflowContext.gateWorkflowId,
      gate.workflowContext.phaseName,
      `${gate.title}\n\n${gate.description}`,
      gate.workflowContext.stakeholderGroups,
      {
        businessImpact: this.mapImpactToLevel(gate.workflowContext.impactAssessment.businessImpact),
        priority: this.mapGatePriorityToValidationPriority(gate.priority),
      }
    );

    // Update gate with the request
    await this.updateGate(gate.id, { workflowGateRequest });

    return workflowGateRequest;
  }

  // --------------------------------------------------------------------------
  // PRIVATE METHODS
  // --------------------------------------------------------------------------

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  private registerGateFactories(): void {
    this.gateFactories.set(WorkflowHumanGateType.STRATEGIC, new StrategicGateFactory());
    this.gateFactories.set(WorkflowHumanGateType.ARCHITECTURAL, new ArchitecturalGateFactory());
    this.gateFactories.set(WorkflowHumanGateType.QUALITY, new QualityGateFactory());
    this.gateFactories.set(WorkflowHumanGateType.BUSINESS, new BusinessGateFactory());
    this.gateFactories.set(WorkflowHumanGateType.ETHICAL, new EthicalGateFactory());

    this.logger.debug('Gate factories registered');
  }

  private registerTriggerEvaluators(): void {
    // Register trigger evaluators for each event type
    this.triggerEvaluators.set('prd-generated', async (context) => {
      return context.phaseName === 'prd-generation' && context.businessDomain === 'product';
    });

    this.triggerEvaluators.set('epic-created', async (context) => {
      return context.phaseName === 'epic-creation' && context.technicalDomain === 'development';
    });

    this.triggerEvaluators.set('feature-designed', async (context) => {
      return (
        context.phaseName === 'feature-design' && context.impactAssessment.technicalImpact > 0.7
      );
    });

    this.triggerEvaluators.set('sparc-phase-complete', async (context) => {
      return context.phaseName.includes('sparc') && context.impactAssessment.businessImpact > 0.5;
    });

    // Add more trigger evaluators as needed...

    this.logger.debug('Trigger evaluators registered');
  }

  private startQueueProcessor(): void {
    this.queueProcessor = setInterval(async () => {
      try {
        await this.processQueue();
      } catch (error) {
        this.logger.error('Queue processing failed', { error });
      }
    }, this.config.queueProcessingInterval);

    this.logger.debug('Queue processor started', { interval: this.config.queueProcessingInterval });
  }

  private async processQueue(): Promise<void> {
    const queuedItems = await this.getQueuedGates();

    if (queuedItems.length === 0) {
      return;
    }

    this.logger.debug('Processing queue', { itemCount: queuedItems.length });

    for (const { gate, queueItem } of queuedItems) {
      try {
        await this.processQueuedGate(gate, queueItem);
        await this.persistence.markQueueItemProcessed(queueItem.id);
      } catch (error) {
        this.logger.error('Failed to process queued gate', {
          gateId: gate.id,
          queueItemId: queueItem.id,
          error,
        });
      }
    }
  }

  private async processQueuedGate(gate: WorkflowHumanGate, queueItem: any): Promise<void> {
    // Update status to in review
    await this.persistence.updateGateStatus(gate.id, WorkflowHumanGateStatus.IN_REVIEW);

    // Create AGUI request if not already created
    if (!gate.workflowGateRequest) {
      await this.createWorkflowGateRequest(gate);
    }

    // Emit event for external processing
    this.emit('gate-ready-for-review', { gate, queueItem });

    this.logger.info('Gate ready for review', { gateId: gate.id, priority: queueItem.priority });
  }

  private urgencyToPriority(urgency: GateTriggerUrgency): number {
    switch (urgency) {
      case GateTriggerUrgency.EMERGENCY:
        return 1;
      case GateTriggerUrgency.IMMEDIATE:
        return 2;
      case GateTriggerUrgency.WITHIN_HOUR:
        return 3;
      case GateTriggerUrgency.WITHIN_DAY:
        return 4;
      case GateTriggerUrgency.NEXT_REVIEW:
        return 5;
      default:
        return 5;
    }
  }

  private calculateScheduledTime(urgency: GateTriggerUrgency, delay?: number): Date {
    const now = new Date();
    const baseDelay = delay || 0;

    switch (urgency) {
      case GateTriggerUrgency.IMMEDIATE:
        return new Date(now.getTime() + baseDelay);
      case GateTriggerUrgency.WITHIN_HOUR:
        return new Date(now.getTime() + Math.min(3600000, baseDelay + 1800000)); // 30min to 1hr
      case GateTriggerUrgency.WITHIN_DAY:
        return new Date(now.getTime() + Math.min(86400000, baseDelay + 7200000)); // 2hr to 24hr
      case GateTriggerUrgency.NEXT_REVIEW:
        return new Date(now.getTime() + 86400000 + baseDelay); // Next day + delay
      default:
        return new Date(now.getTime() + baseDelay);
    }
  }

  private mapImpactToLevel(impact: number): 'low' | 'medium' | 'high' | 'critical' {
    if (impact >= 0.9) return 'critical';
    if (impact >= 0.7) return 'high';
    if (impact >= 0.4) return 'medium';
    return 'low';
  }

  private mapGatePriorityToValidationPriority(
    priority: WorkflowGatePriority
  ): 'critical' | 'high' | 'medium' | 'low' {
    switch (priority) {
      case WorkflowGatePriority.EMERGENCY:
        return 'critical';
      case WorkflowGatePriority.CRITICAL:
        return 'critical';
      case WorkflowGatePriority.HIGH:
        return 'high';
      case WorkflowGatePriority.MEDIUM:
        return 'medium';
      case WorkflowGatePriority.LOW:
        return 'low';
      default:
        return 'medium';
    }
  }
}

// ============================================================================
// GATE FACTORIES - Factory pattern for gate creation
// ============================================================================

/**
 * Base gate factory interface
 */
export interface GateFactory {
  createGate(
    subtype: string,
    workflowContext: WorkflowGateContext,
    gateData: WorkflowGateData,
    options: CreateGateOptions
  ): WorkflowHumanGate;
}

/**
 * Create gate options
 */
export interface CreateGateOptions {
  readonly title?: string;
  readonly description?: string;
  readonly priority?: WorkflowGatePriority;
  readonly approvers?: string[];
  readonly timeoutConfig?: GateTimeoutConfig;
  readonly triggers?: GateTrigger[];
}

/**
 * Strategic gate factory
 */
export class StrategicGateFactory implements GateFactory {
  createGate(
    subtype: string,
    workflowContext: WorkflowGateContext,
    gateData: WorkflowGateData,
    options: CreateGateOptions
  ): WorkflowHumanGate {
    const gateId = `strategic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
      id: gateId,
      type: WorkflowHumanGateType.STRATEGIC,
      subtype,
      title: options.title || `Strategic Decision: ${subtype}`,
      description:
        options.description ||
        `Strategic gate for ${subtype} in workflow ${workflowContext.gateWorkflowId}`,
      status: WorkflowHumanGateStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
      workflowContext,
      gateData,
      triggers: options.triggers || this.createDefaultStrategicTriggers(subtype),
      priority: options.priority || WorkflowGatePriority.HIGH,
      approvalConfig: {
        approvers: options.approvers || ['product-director', 'cto'],
        requiredApprovals: 1,
        escalationChain: [GateEscalationLevel.DIRECTOR, GateEscalationLevel.EXECUTIVE],
      },
      timeoutConfig: options.timeoutConfig,
      metrics: this.createInitialMetrics(),
    };
  }

  private createDefaultStrategicTriggers(subtype: string): GateTrigger[] {
    return [
      {
        id: `strategic-${subtype}-trigger`,
        event: 'prd-generated',
        condition: async (context) => {
          return context.impactAssessment.businessImpact > 0.7;
        },
        urgency: GateTriggerUrgency.WITHIN_DAY,
        metadata: {
          name: `Strategic ${subtype} trigger`,
          description: `Triggers when strategic decision is needed for ${subtype}`,
          phases: ['planning', 'design'],
          stakeholders: ['product-director', 'business-stakeholder'],
          category: 'strategic',
          properties: {},
        },
      },
    ];
  }

  private createInitialMetrics(): GateMetrics {
    return {
      createdAt: new Date(),
      escalationCount: 0,
      modificationCount: 0,
      stakeholderInteractions: [],
      performance: {
        avgProcessingTime: 0,
        successRate: 0,
        escalationRate: 0,
        timeoutRate: 0,
        resourceUtilization: 0,
      },
      quality: {
        decisionAccuracy: 0,
        stakeholderSatisfaction: 0,
        processEfficiency: 0,
        outcomeQuality: 0,
        complianceScore: 0,
      },
    };
  }
}

/**
 * Architectural gate factory
 */
export class ArchitecturalGateFactory implements GateFactory {
  createGate(
    subtype: string,
    workflowContext: WorkflowGateContext,
    gateData: WorkflowGateData,
    options: CreateGateOptions
  ): WorkflowHumanGate {
    const gateId = `arch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
      id: gateId,
      type: WorkflowHumanGateType.ARCHITECTURAL,
      subtype,
      title: options.title || `Architecture Review: ${subtype}`,
      description: options.description || `Architectural gate for ${subtype} review`,
      status: WorkflowHumanGateStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
      workflowContext,
      gateData,
      triggers: options.triggers || this.createDefaultArchitecturalTriggers(subtype),
      priority: options.priority || WorkflowGatePriority.HIGH,
      approvalConfig: {
        approvers: options.approvers || ['lead-architect', 'engineering-director'],
        requiredApprovals: 1,
        escalationChain: [GateEscalationLevel.MANAGER, GateEscalationLevel.DIRECTOR],
      },
      timeoutConfig: options.timeoutConfig,
      metrics: this.createInitialMetrics(),
    };
  }

  private createDefaultArchitecturalTriggers(subtype: string): GateTrigger[] {
    return [
      {
        id: `arch-${subtype}-trigger`,
        event: 'architecture-defined',
        condition: async (context) => {
          return (
            context.technicalDomain === 'architecture' &&
            context.impactAssessment.technicalImpact > 0.6
          );
        },
        urgency: GateTriggerUrgency.WITHIN_HOUR,
        metadata: {
          name: `Architectural ${subtype} trigger`,
          description: `Triggers when architectural decision is needed for ${subtype}`,
          phases: ['design', 'implementation'],
          stakeholders: ['lead-architect', 'senior-engineer'],
          category: 'architectural',
          properties: {},
        },
      },
    ];
  }

  private createInitialMetrics(): GateMetrics {
    return {
      createdAt: new Date(),
      escalationCount: 0,
      modificationCount: 0,
      stakeholderInteractions: [],
      performance: {
        avgProcessingTime: 0,
        successRate: 0,
        escalationRate: 0,
        timeoutRate: 0,
        resourceUtilization: 0,
      },
      quality: {
        decisionAccuracy: 0,
        stakeholderSatisfaction: 0,
        processEfficiency: 0,
        outcomeQuality: 0,
        complianceScore: 0,
      },
    };
  }
}

/**
 * Quality gate factory
 */
export class QualityGateFactory implements GateFactory {
  createGate(
    subtype: string,
    workflowContext: WorkflowGateContext,
    gateData: WorkflowGateData,
    options: CreateGateOptions
  ): WorkflowHumanGate {
    const gateId = `quality-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
      id: gateId,
      type: WorkflowHumanGateType.QUALITY,
      subtype,
      title: options.title || `Quality Gate: ${subtype}`,
      description: options.description || `Quality assurance gate for ${subtype}`,
      status: WorkflowHumanGateStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
      workflowContext,
      gateData,
      triggers: options.triggers || this.createDefaultQualityTriggers(subtype),
      priority: options.priority || WorkflowGatePriority.MEDIUM,
      approvalConfig: {
        approvers: options.approvers || ['qa-lead', 'security-engineer'],
        requiredApprovals: 1,
        escalationChain: [GateEscalationLevel.TEAM_LEAD, GateEscalationLevel.MANAGER],
      },
      timeoutConfig: options.timeoutConfig,
      metrics: this.createInitialMetrics(),
    };
  }

  private createDefaultQualityTriggers(subtype: string): GateTrigger[] {
    return [
      {
        id: `quality-${subtype}-trigger`,
        event: subtype.includes('security')
          ? 'security-scan-complete'
          : 'performance-test-complete',
        condition: async (context) => {
          return context.impactAssessment.riskImpact > 0.5;
        },
        urgency: GateTriggerUrgency.WITHIN_HOUR,
        metadata: {
          name: `Quality ${subtype} trigger`,
          description: `Triggers when quality review is needed for ${subtype}`,
          phases: ['testing', 'deployment'],
          stakeholders: ['qa-engineer', 'security-engineer'],
          category: 'quality',
          properties: {},
        },
      },
    ];
  }

  private createInitialMetrics(): GateMetrics {
    return {
      createdAt: new Date(),
      escalationCount: 0,
      modificationCount: 0,
      stakeholderInteractions: [],
      performance: {
        avgProcessingTime: 0,
        successRate: 0,
        escalationRate: 0,
        timeoutRate: 0,
        resourceUtilization: 0,
      },
      quality: {
        decisionAccuracy: 0,
        stakeholderSatisfaction: 0,
        processEfficiency: 0,
        outcomeQuality: 0,
        complianceScore: 0,
      },
    };
  }
}

/**
 * Business gate factory
 */
export class BusinessGateFactory implements GateFactory {
  createGate(
    subtype: string,
    workflowContext: WorkflowGateContext,
    gateData: WorkflowGateData,
    options: CreateGateOptions
  ): WorkflowHumanGate {
    const gateId = `business-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
      id: gateId,
      type: WorkflowHumanGateType.BUSINESS,
      subtype,
      title: options.title || `Business Review: ${subtype}`,
      description: options.description || `Business validation gate for ${subtype}`,
      status: WorkflowHumanGateStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
      workflowContext,
      gateData,
      triggers: options.triggers || this.createDefaultBusinessTriggers(subtype),
      priority: options.priority || WorkflowGatePriority.MEDIUM,
      approvalConfig: {
        approvers: options.approvers || ['product-manager', 'business-analyst'],
        requiredApprovals: 1,
        escalationChain: [GateEscalationLevel.MANAGER, GateEscalationLevel.DIRECTOR],
      },
      timeoutConfig: options.timeoutConfig,
      metrics: this.createInitialMetrics(),
    };
  }

  private createDefaultBusinessTriggers(subtype: string): GateTrigger[] {
    return [
      {
        id: `business-${subtype}-trigger`,
        event: 'metrics-threshold-reached',
        condition: async (context) => {
          return (
            context.businessDomain === 'product' && context.impactAssessment.businessImpact > 0.6
          );
        },
        urgency: GateTriggerUrgency.WITHIN_DAY,
        metadata: {
          name: `Business ${subtype} trigger`,
          description: `Triggers when business review is needed for ${subtype}`,
          phases: ['validation', 'launch'],
          stakeholders: ['product-manager', 'business-stakeholder'],
          category: 'business',
          properties: {},
        },
      },
    ];
  }

  private createInitialMetrics(): GateMetrics {
    return {
      createdAt: new Date(),
      escalationCount: 0,
      modificationCount: 0,
      stakeholderInteractions: [],
      performance: {
        avgProcessingTime: 0,
        successRate: 0,
        escalationRate: 0,
        timeoutRate: 0,
        resourceUtilization: 0,
      },
      quality: {
        decisionAccuracy: 0,
        stakeholderSatisfaction: 0,
        processEfficiency: 0,
        outcomeQuality: 0,
        complianceScore: 0,
      },
    };
  }
}

/**
 * Ethical gate factory
 */
export class EthicalGateFactory implements GateFactory {
  createGate(
    subtype: string,
    workflowContext: WorkflowGateContext,
    gateData: WorkflowGateData,
    options: CreateGateOptions
  ): WorkflowHumanGate {
    const gateId = `ethical-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
      id: gateId,
      type: WorkflowHumanGateType.ETHICAL,
      subtype,
      title: options.title || `Ethics Review: ${subtype}`,
      description: options.description || `Ethical compliance gate for ${subtype}`,
      status: WorkflowHumanGateStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
      workflowContext,
      gateData,
      triggers: options.triggers || this.createDefaultEthicalTriggers(subtype),
      priority: options.priority || WorkflowGatePriority.HIGH,
      approvalConfig: {
        approvers: options.approvers || ['ethics-officer', 'legal-counsel'],
        requiredApprovals: 1,
        escalationChain: [GateEscalationLevel.DIRECTOR, GateEscalationLevel.EXECUTIVE],
      },
      timeoutConfig: options.timeoutConfig,
      metrics: this.createInitialMetrics(),
    };
  }

  private createDefaultEthicalTriggers(subtype: string): GateTrigger[] {
    return [
      {
        id: `ethical-${subtype}-trigger`,
        event: 'ethical-review-triggered',
        condition: async (context) => {
          return context.impactAssessment.complianceImpact.riskLevel !== 'low';
        },
        urgency: GateTriggerUrgency.WITHIN_DAY,
        metadata: {
          name: `Ethical ${subtype} trigger`,
          description: `Triggers when ethical review is needed for ${subtype}`,
          phases: ['design', 'deployment'],
          stakeholders: ['ethics-officer', 'legal-counsel'],
          category: 'ethical',
          properties: {},
        },
      },
    ];
  }

  private createInitialMetrics(): GateMetrics {
    return {
      createdAt: new Date(),
      escalationCount: 0,
      modificationCount: 0,
      stakeholderInteractions: [],
      performance: {
        avgProcessingTime: 0,
        successRate: 0,
        escalationRate: 0,
        timeoutRate: 0,
        resourceUtilization: 0,
      },
      quality: {
        decisionAccuracy: 0,
        stakeholderSatisfaction: 0,
        processEfficiency: 0,
        outcomeQuality: 0,
        complianceScore: 0,
      },
    };
  }
}

// ============================================================================
// CONFIGURATION AND SUPPORTING TYPES
// ============================================================================

/**
 * Workflow Gates Manager configuration
 */
export interface WorkflowGatesManagerConfig {
  readonly persistencePath?: string;
  readonly queueProcessingInterval?: number;
  readonly maxConcurrentGates?: number;
  readonly enableMetrics?: boolean;
}

/**
 * Workflow gates metrics
 */
export interface WorkflowGatesMetrics extends GatePersistenceMetrics {
  readonly queuedGatesCount: number;
  readonly activeGatesCount: number;
  readonly completedGatesCount: number;
}

/**
 * Trigger evaluator function type
 */
type TriggerEvaluator = (context: WorkflowGateContext) => Promise<boolean>;

// ============================================================================
// EXPORTS
// ============================================================================

export default WorkflowGatesManager;

export type {
  WorkflowHumanGate,
  WorkflowGateContext,
  WorkflowGateData,
  StructuredGateData,
  GateTrigger,
  GateResolution,
  GateMetrics,
  ImpactAssessment,
  CreateGateOptions,
  GateFactory,
  WorkflowGatesManagerConfig,
  WorkflowGatesMetrics,
  GatePersistenceMetrics,
};

export {
  WorkflowHumanGateType,
  WorkflowHumanGateStatus,
  WorkflowGatePriority,
  GateTriggerUrgency,
  WorkflowGatesManager,
  GatePersistenceManager,
  StrategicGateFactory,
  ArchitecturalGateFactory,
  QualityGateFactory,
  BusinessGateFactory,
  EthicalGateFactory,
};
