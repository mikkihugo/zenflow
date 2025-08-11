/**
 * ADR Proposal System - Human-Driven Architecture Decision Process.
 *
 * System for proposing ADRs to humans for discussion and decision.
 * ADRs are never imported - they must go through proper human review process.
 */
/**
 * @file Database layer: adr-proposal-system.
 */
import type { ADRDocumentEntity } from '../entities/document-entities.ts';
export interface ADRProposal {
    title: string;
    context: string;
    proposed_decision: string;
    expected_consequences: string;
    alternatives?: Array<{
        name: string;
        pros: string[];
        cons: string[];
        why_not_chosen: string;
    }>;
    proposer: string;
    urgency: 'low' | 'medium' | 'high' | 'critical';
    stakeholders: string[];
    impact_areas: string[];
    discussion_points: string[];
    success_criteria?: string[];
    risks?: string[];
    implementation_effort?: 'trivial' | 'small' | 'medium' | 'large' | 'epic';
}
export interface ADRDiscussion {
    adr_id: string;
    participants: string[];
    discussion_notes: string;
    concerns_raised: string[];
    alternatives_suggested: string[];
    consensus_level: 'none' | 'weak' | 'moderate' | 'strong';
    decision_status: 'needs_more_discussion' | 'ready_for_decision' | 'decided' | 'rejected';
    next_steps: string[];
    decision_date?: Date;
    implementation_plan?: string;
}
/**
 * ADR Proposal System for human-driven architecture decisions.
 *
 * @example
 */
export declare class ADRProposalSystem {
    /**
     * Propose a new ADR for human discussion.
     * Creates ADR in 'proposed' status awaiting human review.
     *
     * @param proposal
     */
    proposeADR(proposal: ADRProposal): Promise<ADRDocumentEntity>;
    /**
     * Record human discussion and feedback on ADR.
     *
     * @param adrNumber
     * @param discussion
     */
    recordDiscussion(adrNumber: number, discussion: ADRDiscussion): Promise<ADRDocumentEntity>;
    /**
     * Make final decision on ADR after human discussion.
     *
     * @param adrNumber
     * @param decision
     * @param decision.approved
     * @param decision.final_decision
     * @param decision.rationale
     * @param decision.implementation_plan
     * @param decision.decision_maker
     * @param decision.stakeholder_signoffs
     * @param decision.conditions
     */
    makeDecision(adrNumber: number, decision: {
        approved: boolean;
        final_decision: string;
        rationale: string;
        implementation_plan?: string;
        decision_maker: string;
        stakeholder_signoffs: string[];
        conditions?: string[];
    }): Promise<ADRDocumentEntity>;
    /**
     * List ADRs awaiting human discussion.
     */
    getADRsAwaitingDiscussion(): Promise<ADRDocumentEntity[]>;
    /**
     * List ADRs currently in discussion.
     */
    getADRsInDiscussion(): Promise<ADRDocumentEntity[]>;
    /**
     * Get ADRs ready for decision.
     */
    getADRsReadyForDecision(): Promise<ADRDocumentEntity[]>;
    /**
     * Propose ADR for the document workflow automation system.
     * (ADR number will be automatically assigned by the system).
     */
    proposeDocumentWorkflowADR(): Promise<ADRDocumentEntity>;
    /**
     * Format context section with proposal details.
     *
     * @param proposal
     */
    private formatContext;
    /**
     * Format consequences with expected outcomes.
     *
     * @param proposal
     */
    private formatConsequences;
    /**
     * Map urgency to priority.
     *
     * @param urgency
     */
    private mapUrgencyToPriority;
    /**
     * Log proposal for human review.
     *
     * @param adr
     * @param proposal
     */
    private logProposalForHumanReview;
    /**
     * Update ADR content with final decision.
     *
     * @param content
     * @param decision
     */
    private updateContentWithDecision;
}
export declare const adrProposalSystem: ADRProposalSystem;
export default adrProposalSystem;
//# sourceMappingURL=adr-proposal-system.d.ts.map