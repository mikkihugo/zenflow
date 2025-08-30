/**
 * @fileoverview SPARC Domain - Systematic Development Methodology
 *
 * 100% Event-driven SPARC implementation for WebSocket + Svelte frontend.
 * Provides complete SPARC methodology coordination via pure event orchestration.
 * Works independently OR with Teamwork coordination - gracefully degrades when unavailable.
 *
 * **Event-Driven Architecture: getLogger('SPARC');
// Constants for duplicate string literals
const SYSTEM_TYPES = {
  claudeCode : 'claude-code'as const,';
  llmPackage : 'llm-package'as const';
} as const;
const SPARC_REASONS = {
  specification,  pseudocode,  architecture,  refinement,  completion,  fallback : 'SPARC fallback coordination')} as const;';
// SPARC Phase enumeration
export enum SPARCPhase {
  SPECIFICATION : 'specification'  PSEUDOCODE : 'pseudocode'  ARCHITECTURE : 'architecture'  REFINEMENT : 'refinement'  COMPLETION = 'completion')};;
// SPARC configuration interface
export interface SparcConfig {
  projectName: string;
  domain: string;
  requirements: string[];
  phases: SPARCPhase[];
}
// SPARC project interface
export interface SparcProject {
  id: string;
  name: string;
  domain: string;
  currentPhase: SPARCPhase;
  requirements: string[];
  artifacts: Record<SPARCPhase, unknown[]>;
  createdAt: Date;
  updatedAt: Date;
}
// SPARC result interface
export interface SparcResult {
  success: boolean;
  phase: SPARCPhase;
  artifacts: unknown[];
  message?:string;
}
// ============================================================================
// EVENT-DRIVEN SPARC TYPES
// ============================================================================
// ============================================================================
// SPECIFIC SPARC EVENT TYPES
// ============================================================================
export interface SPARCPhaseReviewRequest {
  projectId: string;
  phase: SPARCPhase;
  artifacts: unknown[];
  requirements: string[];
  reviewType : 'architecture' | ' specification'|' implementation' | ' quality')  suggestedReviewers: string[];;
  timeout?:number;
}
export interface SPARCArchitectureReviewRequest {
  projectId: string;
  phase: SPARCPhase.ARCHITECTURE;
  designDocuments: unknown[];
  systemRequirements: string[];
  suggestedArchitects: string[];
  timeout?:number;
}
export interface SPARCCodeReviewRequest {
  projectId: string;
  phase: SPARCPhase.REFINEMENT| SPARCPhase.COMPLETION;
  codeArtifacts: unknown[];
  implementationDetails: string[];
  suggestedCodeReviewers: string[];
  timeout?:number;
}
export interface SPARCReviewResponse {
  projectId: string;
  phase: SPARCPhase;
  reviewType : 'architecture' | ' specification'|' implementation' | ' quality')  approved: boolean;;
  feedback: string[];
  actionItems: string[];
  conversationId: string;
}
export interface SPARCArchitectureApproval {
  projectId: string;
  phase: SPARCPhase.ARCHITECTURE;
  approved: boolean;
  architectureNotes: string[];
  implementationGuidance: string[];
  conversationId: string;
}
export interface SPARCCodeApproval {
  projectId: string;
  phase: SPARCPhase.REFINEMENT| SPARCPhase.COMPLETION;
  approved: boolean;
  codeQualityNotes: string[];
  refactoringNeeded: string[];
  conversationId: string;
}
// Teamwork response interface for review completion
export interface TeamworkResponse {
  projectId: string;
  phase: SPARCPhase;
  approved: boolean;
  feedback: string[];
  actionItems: string[];
  conversationId: string;
}
// ============================================================================
// EVENT-DRIVEN SPARC MANAGER
// ============================================================================
/**
 * Event-driven SPARC Manager that works independently or with Teamwork
 */
export declare class SPARCManager extends EventBus {
  private config;
  private collaborationTimeouts;
  private pendingReviews;
}
export default class SPARC extends EventBus {
  private manager?;
  constructor();
  /**
   * Setup event coordination for SPARC system
   */
  private setupEventCoordination;
}
//# sourceMappingURL=index.d.ts.map
