/**
 * @fileoverview SAFe-SPARC Integration Bridge Types
 *
 * **CORE INTEGRATION FRAMEWORK TYPES**
 *
 * These are the foundational types for integrating SAFe Framework (business coordination)
 * with SPARC Methodology (technical implementation). These types are designed to be: * - Framework-agnostic and reusable across organizations
 * - Extensible for application-specific business logic
 * - Testable in isolation from application dependencies
 *
 * **EXTENSION PATTERN:**
 * Applications should extend these base types for custom business logic:
 * "typescript');"
 * import type { IntegratedAgentProfile } from '../safe/types/integration-bridge.js';
 * interface ClaudeZenAgentProfile extends IntegratedAgentProfile {
 *   claudeSpecificCapabilities: string[];
 *   customWorkflows: CustomWorkflow[];
 *}
 * ');
// Event-driven integration - SPARC types communicated via events, not direct imports
// SPARCPhase and SPARCProject are now event payload types, not direct dependencies
import type { Feature} from '../types')'; 
// EVENT PAYLOAD TYPES (Previously imported from SPARC)
// ============================================================================
/**
 * SPARC phase enumeration - defined locally for event payloads
 */
export enum SPARCPhase {
  SPECIFICATION = 'specification')pseudocode')architecture')refinement')completion')s not exported from teamwork package';
export type AgentType ='researcher' | ' coder'|' analyst' | ' coordinator'|' specialist');
// INTEGRATION BRIDGE TYPES
// ============================================================================
/**
 * Maps SAFe Feature to SPARC Project execution
 */
export interface FeatureToSPARCMapping {
  readonly safeFeature: Feature;
  readonly sparcProjects: SPARCProject[];
  readonly mappingRationale: string;
  readonly businessContext: BusinessToTechnicalContext;
  readonly progressCorrelation: ProgressCorrelation;
}
/**
 * Business context translated to technical requirements
 */
export interface BusinessToTechnicalContext {
  readonly businessValue: number'; 
  readonly technicalComplexity : 'simple' | ' moderate'|' complex' | ' enterprise')low' | ' medium'|' high' | ' critical')component' | ' service'|' system' | ' enterprise')low' | ' medium'|' high' | ' critical')status];
  readonly sparcPhases: SPARCPhaseMapping[];
  readonly overallProgress: number; // 0-1
  readonly blockers: IntegrationBlocker[];];
  readonly predictedCompletion: Date;)};
/**
 * Maps SAFe milestones to SPARC phases
 */
export interface SPARCPhaseMapping {
  readonly phase: SPARCPhase;
  readonly safeMilestone: string;
  readonly completionPercentage: number;
  readonly qualityGates: QualityGate[];
}
/**
 * Quality gates that bridge SAFe acceptance criteria with SPARC deliverables
 */
export interface QualityGate {
  id: string;
}
/**
 * SPARC-specific validation requirements
 */
export interface SPARCValidation {
  readonly phase: SPARCPhase;
  readonly validationType : 'specification' | ' architecture'|' implementation' | ' testing')dependency' | ' resource'|' technical' | ' business')low' | ' medium'|' high' | ' critical')product-owner' | ' scrum-master'|' system-architect' | ' business-analyst'|' compliance-officer');
 * SPARC-specific agent roles
 */
export type SPARCAgentRole ='specification-writer' | ' architect'|' implementer' | ' quality-validator'|' technical-writer');
 * Agent capabilities that span both frameworks
 */
export interface AgentCapability {
  readonly capability: ;
|'novice '   // Basic understanding of both frameworks';
|'competent '// Can work independently in either framework';
|'proficient'// Can coordinate between frameworks';
|'expert '   // Can optimize integration patterns';
|'master';   // Can design new integration approaches';
// ============================================================================
// WORKFLOW COORDINATION TYPES
// ============================================================================
/**
 * Coordinated workflows that span both frameworks
 */
export interface IntegratedWorkflow {
  readonly workflowId: string;
  readonly name: string;
  readonly safePhases: SAFeWorkflowPhase[];
  readonly sparcPhases: SPARCWorkflowPhase[];
  readonly synchronizationPoints: SynchronizationPoint[];
  readonly escalationPaths: EscalationPath[];
}
/**
 * SAFe workflow phases
 */
export interface SAFeWorkflowPhase {
  readonly phase : 'portfolio-kanban' | ' program-backlog'|' pi-planning' | ' development'|' system-demo');
  readonly participants: SAFeAgentRole[];
  readonly deliverables: string[];
  readonly dependencies: string[];
}
/**
 * SPARC workflow phases with SAFe coordination
 */
export interface SPARCWorkflowPhase {
  readonly phase: SPARCPhase;
  readonly safeAlignment: string; // Which SAFe phase this aligns with
  readonly duration: number; // milliseconds
  readonly participants: SPARCAgentRole[];
  readonly deliverables: string[];
  readonly qualityGates: string[];
}
/**
 * Synchronization points between frameworks
 */
export interface SynchronizationPoint {
  id: string;
}
/**
 * Retry policy for failed synchronizations
 */
export interface RetryPolicy {
  readonly maxRetries: number;
  readonly backoffStrategy : 'linear' | ' exponential');
}
/**
 * Escalation settings
 */
export interface EscalationSettings {
  readonly enableAutoEscalation: boolean;
  readonly escalationThresholds: EscalationThreshold[];
  readonly notificationChannels: string[];
  readonly maxEscalationLevels: number;
}
/**
 * Escalation thresholds
 */
export interface EscalationThreshold {
  readonly metric: string;
  readonly threshold: number;
  readonly timeWindow: number; // milliseconds
  readonly severity: low' | ' medium'|' high' | ' critical')block' | ' warn'|' log')};
