import { EventEmitter } from 'node:events';
import { getLogger } from '../config/logging-config.ts';
const logger = getLogger('ADRCreationWorkflow');
export class ADRCreationWorkflow extends EventEmitter {
    docProcessor;
    workflowEngine;
    constructor(docProcessor, workflowEngine) {
        super();
        this.docProcessor = docProcessor;
        this.workflowEngine = workflowEngine;
    }
    async createADRFromDecision(context, architect) {
        logger.info(`🏗️ Creating ADR for architectural decision: ${context.problem}`);
        const adrNumber = await this.getNextADRNumber();
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
        const adrContent = this.renderADRTemplate(adrTemplate);
        const adrDocument = {
            type: 'adr',
            path: `./docs/adrs/adr-${adrNumber.toString().padStart(3, '0')}-${this.slugify(context.problem)}.md`,
            content: adrContent,
            metadata: {
                author: architect,
                created: new Date(),
                status: 'proposed',
                priority: 'high',
                relatedDocs: [],
                tags: ['architecture', 'decision', 'governance'],
            },
        };
        await this.docProcessor.processDocument(adrDocument.path, adrDocument.content);
        this.emit('adr:created', {
            adr: adrDocument,
            context: context,
            architect: architect,
            impactedSystems: this.identifyImpactedSystems(context),
        });
        logger.info(`✅ ADR created successfully: ${adrTemplate.title}`);
        return adrDocument;
    }
    async updateADRStatus(adrId, newStatus, architect) {
        logger.info(`📝 Updating ADR ${adrId} status to ${newStatus} by ${architect}`);
        this.emit('adr:status-changed', {
            adrId,
            newStatus,
            changedBy: architect,
            timestamp: new Date(),
        });
    }
    async linkADRToArtifacts(adrId, artifacts) {
        logger.info(`🔗 Linking ADR ${adrId} to implementation artifacts`);
        this.emit('adr:artifacts-linked', {
            adrId,
            artifacts,
            timestamp: new Date(),
        });
    }
    async getNextADRNumber() {
        return Math.floor(Math.random() * 1000) + 1;
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
export function createADRCreationWorkflow(docProcessor, workflowEngine) {
    return new ADRCreationWorkflow(docProcessor, workflowEngine);
}
//# sourceMappingURL=adr-creation-workflow.js.map