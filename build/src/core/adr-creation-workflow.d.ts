/**
 * @file ADR (Architecture Decision Record) Creation Workflow.
 *
 * Proper architectural workflow for creating ADRs as independent governance documents.
 * ADRs are NOT auto-generated from business documents but created by architects
 * when specific technical decisions need to be documented and enforced.
 * @module core/adr-creation-workflow
 */
import { EventEmitter } from 'node:events';
import type { Document, DocumentProcessor } from './document-processor.ts';
import type { WorkflowEngine } from './workflow-engine.ts';
/**
 * ADR Decision Context - the circumstances requiring an architectural decision.
 *
 * @example
 */
export interface ADRDecisionContext {
    /** The architectural problem or choice that needs to be decided */
    problem: string;
    /** Technical constraints affecting the decision */
    constraints: string[];
    /** Stakeholders involved in the decision */
    stakeholders: string[];
    /** Business or technical drivers for the decision */
    drivers: string[];
    /** Options considered (including the chosen option) */
    options: ADROption[];
    /** The chosen option */
    chosenOption: string;
    /** Rationale for the choice */
    rationale: string;
    /** Consequences and trade-offs of the decision */
    consequences: string[];
}
export interface ADROption {
    /** Option identifier */
    id: string;
    /** Option name/title */
    name: string;
    /** Description of this option */
    description: string;
    /** Pros of this option */
    pros: string[];
    /** Cons of this option */
    cons: string[];
    /** Technical complexity (1-5 scale) */
    complexity: number;
    /** Risk level (low/medium/high) */
    risk: 'low' | 'medium' | 'high';
}
/**
 * ADR Template for consistent architecture decision documentation.
 *
 * @example
 */
export interface ADRTemplate {
    /** ADR title following convention: "ADR-### Title" */
    title: string;
    /** ADR status: proposed, accepted, deprecated, superseded */
    status: 'proposed' | 'accepted' | 'deprecated' | 'superseded';
    /** Decision context and problem statement */
    context: string;
    /** The architectural decision made */
    decision: string;
    /** Rationale for the decision */
    rationale: string;
    /** Consequences of the decision */
    consequences: string;
    /** Related ADRs (supersedes, superseded-by) */
    relatedADRs: string[];
    /** Date of decision */
    decisionDate: Date;
    /** Architects involved in decision */
    architects: string[];
    /** Review date (when to revisit this decision) */
    reviewDate?: Date;
}
/**
 * ADR Creation Workflow - handles the proper creation of Architecture Decision Records.
 *
 * This workflow ensures ADRs are created as independent architectural governance
 * documents with proper context, rationale, and consequences documented.
 *
 * @example
 */
export declare class ADRCreationWorkflow extends EventEmitter {
    private docProcessor;
    private workflowEngine;
    constructor(docProcessor: DocumentProcessor, workflowEngine: WorkflowEngine);
    /**
     * Create new ADR from architectural decision context.
     * This is the proper way to create ADRs - driven by architectural need, not business documents.
     *
     * @param context - The architectural decision context.
     * @param architect - The architect making the decision.
     */
    createADRFromDecision(context: ADRDecisionContext, architect: string): Promise<Document>;
    /**
     * Update existing ADR status (e.g., from proposed to accepted).
     *
     * @param adrId - The ADR identifier.
     * @param newStatus - New status.
     * @param architect - Architect making the change.
     */
    updateADRStatus(adrId: string, newStatus: ADRTemplate['status'], architect: string): Promise<void>;
    /**
     * Link ADR to implementation artifacts (but not auto-generate from them).
     *
     * @param adrId - The ADR identifier.
     * @param artifacts - Related implementation artifacts.
     */
    linkADRToArtifacts(adrId: string, artifacts: string[]): Promise<void>;
    private getNextADRNumber;
    private formatContext;
    private renderADRTemplate;
    private calculateReviewDate;
    private slugify;
    private identifyImpactedSystems;
}
/**
 * Factory function to create ADR creation workflow.
 *
 * @param docProcessor - Document processor instance.
 * @param workflowEngine - Workflow engine instance.
 * @example
 */
export declare function createADRCreationWorkflow(docProcessor: DocumentProcessor, workflowEngine: WorkflowEngine): ADRCreationWorkflow;
/**
 * Example usage for architects:.
 *
 * ```typescript
 * const adrWorkflow = createADRCreationWorkflow(docProcessor, workflowEngine);
 *
 * const decisionContext: ADRDecisionContext = {
 *   problem: "Choose database technology for user data",
 *   constraints: ["Must handle 1M+ users", "ACID compliance required"],
 *   stakeholders: ["john.architect", "jane.engineer"],
 *   drivers: ["Scalability", "Data consistency", "Query performance"],
 *   options: [
 *     {
 *       id: "postgresql",
 *       name: "PostgreSQL",
 *       description: "Mature relational database with strong ACID guarantees",
 *       pros: ["ACID compliance", "Mature ecosystem", "JSON support"],
 *       cons: ["Vertical scaling limits", "Operational complexity"],
 *       complexity: 3,
 *       risk: "low"
 *     }
 *   ],
 *   chosenOption: "PostgreSQL",
 *   rationale: "Best balance of features, maturity, and compliance",
 *   consequences: ["Team needs PostgreSQL expertise", "Database operations overhead"]
 * };
 *
 * const adr = await adrWorkflow.createADRFromDecision(decisionContext, "john.architect");
 * ```
 */
//# sourceMappingURL=adr-creation-workflow.d.ts.map