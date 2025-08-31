/**
 * @fileoverview SAFe Framework Types
 *
 * Core type definitions for Scaled Agile Framework (SAFe) integration.
 */
// ============================================================================
// PORTFOLIO TYPES
// ============================================================================
/**
 * Portfolio epic representing strategic initiatives
 */
export interface PortfolioEpic {
  id: string;
}
 * Value stream in the SAFe framework
 */
export interface ValueStream {
  id: string;
}
/**
 * Value flow step in a value stream
 */
export interface ValueFlowStep {
  id: string;
}
/**
 * Value stream metrics
 */
export interface ValueStreamMetrics {
  readonly flowEfficiency: number;
  readonly leadTime: number;
  readonly throughput: number;
  readonly defectRate: number;
  readonly customerSatisfaction: number;
}
/**
 * SAFe integration configuration
 */
export interface SAFeIntegrationConfig {
  readonly enableSAFeWorkflows: boolean;
  readonly enablePIPlanning: boolean;
  readonly enableValueStreamMapping: boolean;
  readonly enableArchitectureRunway: boolean;
  readonly enableLeanPortfolioManagement: boolean;
  // SAFe Timing Configuration
  readonly piLengthWeeks: number; // Default 10 weeks
  readonly iterationLengthWeeks: number; // Default 2 weeks
  readonly ipIterationWeeks: number; // Innovation & Planning iteration - Default 2 weeks
  // SAFe Scaling Configuration
  readonly maxARTsPerValueStream: number;
  readonly maxTeamsPerART: number;
  readonly maxFeaturesPerPI: number;
  // Integration Intervals
  readonly piPlanningInterval: number; // milliseconds
  readonly systemDemoInterval: number; // milliseconds
  readonly inspectAdaptInterval: number; // milliseconds
}
// ============================================================================
// PROGRAM INCREMENT TYPES
// ============================================================================
/**
 * Program Increment (PI) planning and execution
 */
export interface ProgramIncrement {
  id: string;
}
/**
 * PI Objective with business value
 */
export interface PIObjective {
  id: string;
}
// ============================================================================
// MEMORY SYSTEM INTERFACE
// ============================================================================
/**
 * Memory system interface for persisting data
 */
export interface MemorySystem {
  store(): void { getLogger } from '@claude-zen/foundation';
 * Multi-level orchestration manager interface - Production Ready
 */
export interface MultiLevelOrchestrationManager {
  // Placeholder interface;
  id?:string;
}
// ============================================================================
// CONFIGURATION TYPES
// ============================================================================
/**
 * SAFe framework configuration
 */
export interface SafeConfiguration {
  readonly enablePortfolioManagement: boolean;
  readonly enablePIPlanning: boolean;
  readonly enableValueStreams: boolean;
}
/**
 * Portfolio configuration
 */
export interface PortfolioConfiguration {
  readonly horizonWeights: Record<InvestmentHorizon, number>;
  readonly budgetAllocation: number;
}
/**
 * PI configuration
 */
export interface PIConfiguration {
  readonly duration: number; // weeks
  readonly innovationWeeks: number;
  readonly planningDays: number;
}
// ============================================================================
// PROGRAM INCREMENT MANAGER TYPES
// ============================================================================
/**
 * PI Status enumeration
 */
export enum PIStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  RETROSPECTIVE = 'retrospective',
}
/**
 * Feature Status enumeration
 */
export enum FeatureStatus {
  BACKLOG = 'backlog',
  ANALYSIS = 'analysis',
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  DONE = 'done',
}
/**
 * Objective Status enumeration
 */
export enum ObjectiveStatus {
  COMMITTED = 'committed',
  UNCOMMITTED = 'uncommitted',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  MISSED = 'missed',
}
/**
 * Agile Release Train
 */
export interface AgileReleaseTrain {
  id: string;
}
/**
 * Task
 */
export interface Task {
  id: string;
}
/**
 * Risk
 */
export interface Risk {
  id: string;
}
/**
 * System Demo
 */
export interface SystemDemo {
  id: string;
}
/**
 * Demo Feedback
 */
export interface DemoFeedback {
  readonly source: string;
  readonly feedback: string;
  readonly actionItem?:string;
  readonly priority: low' | ' medium'|' high')process' | ' technical'|' organizational')small' | ' medium'|' large')low' | ' medium'|' high')proposed| approved| in_progress' | ' done')approval_required')review_required')sign_off_required')monolithic')microservices')service_oriented')event_driven')layered')hexagonal')clean_architecture'))  TRADITIONAL_3_TIER = 'traditional_3_tier')micro_frontend')serverless')cloud_native')hybrid_cloud')edge_computing'))  DRAFT = 'draft')in_review')approved')rejected')deprecated')implementation_ready'))  SERVICE = 'service')database')gateway')queue')cache')external_system')ui_component')high' | ' medium'|' low')active' | ' consulted'|' informed')functional' | ' quality'|' constraint') | ' low')technical| business| regulatory' | ' organizational')synchronous' | ' asynchronous'|' batch')compliant| non_compliant| partial' | ' not_assessed')peer| formal| compliance' | ' security')pending| in_progress| approved| rejected' | ' conditionally_approved')compliance| design| quality' | ' risk')|' info')./managers/architecture-runway-manager');
 * SAFe Events and Architecture Runway types - re-exported for convenience
 * Full type definitions are in respective manager files
 */
export type {
  ActionItem,
  EventAgendaItem,
  EventDecision,
  EventExecutionContext,
  EventMetrics,
  EventOutcome,
  EventParticipant,
  EventSchedulingPattern,
  ParticipantFeedback,
  SAFeEventConfig,
  SAFeEventsManagerConfig,
} from './managers/safe-events-manager');