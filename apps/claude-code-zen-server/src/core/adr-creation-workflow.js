/**
 * @file ADR (Architecture Decision Record) Creation Workflow.
 *
 * Proper architectural workflow for creating ADRs as independent governance documents.
 * ADRs are NOT auto-generated from business documents but created by architects
 * when specific technical decisions need to be documented and enforced.
 * @module core/adr-creation-workflow
 */
import { EventEmitter } from 'node:events';
import { getLogger } from '../config/logging-config';
const logger = getLogger('ADRCreationWorkflow');
/**
 * ADR Creation Workflow - handles the proper creation of Architecture Decision Records.
 *
 * This workflow ensures ADRs are created as independent architectural governance
 * documents with proper context, rationale, and consequences documented.
 *
 * @example
 */
export class ADRCreationWorkflow extends EventEmitter {
    docProcessor;
    workflowEngine;
    constructor(docProcessor, workflowEngine) {
        super();
        this.docProcessor = docProcessor;
        this.workflowEngine = workflowEngine;
    }
    /**
     * Create new ADR from architectural decision context.
     * This is the proper way to create ADRs - driven by architectural need, not business documents.
     *
     * @param context - The architectural decision context.
     * @param architect - The architect making the decision.
     */
    async createADRFromDecision(context, architect) {
        logger.info(`🏗️ Creating ADR for architectural decision: ${context.problem}`);
        // Generate ADR number (would typically query existing ADRs)
        const adrNumber = await this.getNextADRNumber();
        // Create ADR template
        const adrTemplate = {
            title: `ADR-${adrNumber.toString().padStart(3, '0')}: ${context.problem}`,
            status: 'proposed',
            context: this.formatContext(context),
            decision: context.chosenOption,
            rationale: context.rationale,
            consequences: context.consequences.join('\n\n'),
            relatedADRs: [],
            decisionDate: new Date(),
            architects: [
                architect,
                ...context.stakeholders.filter((s) => s !== architect),
            ],
            reviewDate: this.calculateReviewDate(),
        };
        // Generate ADR content using proper template
        const adrContent = this.renderADRTemplate(adrTemplate);
        // Create ADR document
        const adrDocument = {
            type: 'adr',
            path: `./docs/adrs/adr-${adrNumber.toString().padStart(3, '0')}-${this.slugify(context.problem)}.md`,
            content: adrContent,
            metadata: {
                author: architect,
                created: new Date(),
                status: 'proposed',
                priority: 'high',
                relatedDocs: [], // ADRs are independent, not auto-linked to business docs
                tags: ['architecture', 'decision', 'governance'],
            },
        };
        // Process the ADR document
        await this.docProcessor.processDocument(adrDocument.path, adrDocument.content);
        // Emit ADR created event for governance tracking
        this.emit('adr:created', {
            adr: adrDocument,
            context: context,
            architect: architect,
            impactedSystems: this.identifyImpactedSystems(context),
        });
        logger.info(`✅ ADR created successfully: ${adrTemplate.title}`);
        return adrDocument;
    }
    /**
     * Update existing ADR status (e.g., from proposed to accepted).
     *
     * @param adrId - The ADR identifier.
     * @param newStatus - New status.
     * @param architect - Architect making the change.
     */
    async updateADRStatus(adrId, newStatus, architect) {
        logger.info(`📝 Updating ADR ${adrId} status to ${newStatus} by ${architect}`);
        // This would update the existing ADR document
        // Implementation would read existing ADR, update status section, and save
        this.emit('adr:status-changed', {
            adrId,
            newStatus,
            changedBy: architect,
            timestamp: new Date(),
        });
    }
    /**
     * Link ADR to implementation artifacts (but not auto-generate from them).
     *
     * @param adrId - The ADR identifier.
     * @param artifacts - Related implementation artifacts.
     */
    async linkADRToArtifacts(adrId, artifacts) {
        logger.info(`🔗 Linking ADR ${adrId} to implementation artifacts`);
        // This creates references from ADR to implementation
        // but maintains ADR independence as architectural governance
        this.emit('adr:artifacts-linked', {
            adrId,
            artifacts,
            timestamp: new Date(),
        });
    }
    // Private helper methods
    async getNextADRNumber() {
        // Would typically query existing ADRs to find next number
        return Math.floor(Math.random() * 1000) + 1; // Placeholder
    }
    formatContext(context) {
        return `
## Context

**Problem:** ${context.problem}

**Constraints:**
${context.constraints.map((c) => `- ${c}`).join('\n')}

**Drivers:**
${context.drivers.map((d) => `- ${d}`).join('\n')}

**Stakeholders:**
${context.stakeholders.join(', ')}

## Options Considered

${context.options
            .map((option) => `
### ${option.name}

${option.description}

**Pros:**
${option.pros.map((p) => `- ${p}`).join('\n')}

**Cons:**
${option.cons.map((c) => `- ${c}`).join('\n')}

**Complexity:** ${option.complexity}/5  
**Risk:** ${option.risk}
`)
            .join('\n')}
    `.trim();
    }
    renderADRTemplate(template) {
        return `# ${template.title}

**Status:** ${template.status}  
**Date:** ${template.decisionDate.toISOString().split('T')[0]}  
**Architects:** ${template.architects.join(', ')}  
${template.reviewDate ? `**Review Date:** ${template.reviewDate.toISOString().split('T')[0]}` : ''}

## Context

${template.context}

## Decision

${template.decision}

## Rationale

${template.rationale}

## Consequences

${template.consequences}

${template.relatedADRs.length > 0
            ? `
## Related ADRs

${template.relatedADRs.map((adr) => `- ${adr}`).join('\n')}
`
            : ''}

---

*This ADR was created as independent architectural governance and may reference but is not auto-generated from business requirements.*
    `.trim();
    }
    calculateReviewDate() {
        // Review decisions after 6 months
        const reviewDate = new Date();
        reviewDate.setMonth(reviewDate.getMonth() + 6);
        return reviewDate;
    }
    slugify(text) {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
    identifyImpactedSystems(context) {
        // Analyze decision context to identify which systems will be impacted
        // This helps with governance and communication
        const systems = [];
        const text = `${context.problem} ${context.rationale} ${context.consequences.join(' ')}`.toLowerCase();
        if (text.includes('database') || text.includes('storage'))
            systems.push('data-layer');
        if (text.includes('api') || text.includes('service'))
            systems.push('service-layer');
        if (text.includes('ui') || text.includes('frontend'))
            systems.push('presentation-layer');
        if (text.includes('auth') || text.includes('security'))
            systems.push('security-layer');
        if (text.includes('deploy') || text.includes('infrastructure'))
            systems.push('infrastructure');
        return systems;
    }
}
/**
 * Factory function to create ADR creation workflow.
 *
 * @param docProcessor - Document processor instance.
 * @param workflowEngine - Workflow engine instance.
 * @example
 */
export function createADRCreationWorkflow(docProcessor, workflowEngine) {
    return new ADRCreationWorkflow(docProcessor, workflowEngine);
}
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
//# sourceMappingURL=adr-creation-workflow.js.map