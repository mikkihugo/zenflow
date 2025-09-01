/**
* @fileoverview SPARC Domain - Systematic Development Methodology
*
* 100% Event-driven SPARC implementation for WebSocket + Svelte frontend.
* Provides complete SPARC methodology coordination via pure event orchestration.
* Works independently OR with Teamwork coordination - gracefully degrades when unavailable.
*
* **Event-Driven Architecture: getLogger(): void {
specification, pseudocode, architecture, refinement, completion, fallback : 'SPARC fallback coordination');
// SPARC Phase enumeration
export enum SPARCPhase {
SPECIFICATION : 'specification' PSEUDOCODE : 'pseudocode' ARCHITECTURE : 'architecture' REFINEMENT : 'refinement' COMPLETION = 'completion')architecture' | ' specification'|' implementation' | ' quality')architecture' | ' specification'|' implementation' | ' quality') approved: boolean;
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
