import { documentManager } from './document-manager.ts';
export class ADRManager {
    architectureProject;
    async initialize() {
        await documentManager.initialize();
        const { documents } = await documentManager.queryDocuments({
            type: 'project',
        });
        this.architectureProject = documents.find((p) => p.name === 'Architecture Decisions');
        if (!this.architectureProject) {
            this.architectureProject = await documentManager.createProject({
                name: 'Architecture Decisions',
                description: 'Architecture Decision Records (ADRs) for Claude-Zen system',
                status: 'active',
                metadata: {
                    type: 'architecture',
                    adr_project: true,
                    auto_numbering: true,
                },
            });
        }
    }
    async createADR(options) {
        if (!this.architectureProject) {
            await this.initialize();
        }
        const adrNumber = await this.getNextADRNumber();
        const adrId = `ADR-${adrNumber.toString().padStart(3, '0')}`;
        const keywords = this.generateKeywords(options?.title, options?.decision);
        const adr = await documentManager.createDocument({
            type: 'adr',
            title: `${adrId}: ${options?.title}`,
            content: this.formatADRContent(adrId, options),
            summary: `Architecture decision ${adrId} regarding ${options?.title}`,
            author: options?.author || 'architecture-team',
            project_id: this.architectureProject?.id,
            status: 'draft',
            priority: options?.priority || 'medium',
            keywords,
            metadata: {
                adr_number: adrNumber,
                adr_id: adrId,
                decision_date: new Date().toISOString(),
                stakeholders: options?.stakeholders || [],
                implementation_status: 'pending',
                supersedes: [],
                superseded_by: null,
                related_adrs: [],
                ...options?.metadata,
            },
            status_type: 'proposed',
            decision: options?.decision,
            context: options?.context,
            consequences: [options?.consequences],
            alternatives_considered: (options?.alternatives || []),
            implementation_notes: options?.implementation_notes || '',
            success_criteria: options?.success_criteria || [],
            success_metrics: {},
        }, {
            autoGenerateRelationships: true,
            startWorkflow: 'adr_workflow',
            generateSearchIndex: true,
        });
        return adr;
    }
    async getNextADRNumber() {
        const { documents } = await documentManager.queryDocuments({
            type: 'adr',
            projectId: this.architectureProject?.id || undefined,
        });
        let maxNumber = 0;
        for (const doc of documents) {
            const adrNumber = doc.metadata?.['adr_number'];
            if (typeof adrNumber === 'number' && adrNumber > maxNumber) {
                maxNumber = adrNumber;
            }
        }
        return maxNumber + 1;
    }
    async queryADRs(options = {}) {
        const filters = {
            type: 'adr',
            projectId: this.architectureProject?.id,
        };
        if (options?.status)
            filters.status = options?.status;
        if (options?.priority)
            filters.priority = options?.priority;
        if (options?.author)
            filters.author = options?.author;
        const queryOptions = {
            includeContent: true,
            includeRelationships: true,
            includeWorkflowState: true,
            limit: options?.limit || 50,
            offset: options?.offset || 0,
            sortBy: 'created_at',
            sortOrder: 'desc',
        };
        const result = await documentManager.queryDocuments(filters, queryOptions);
        let filteredADRs = result?.documents;
        if (options?.date_range) {
            filteredADRs = filteredADRs.filter((adr) => {
                const created = new Date(adr.created_at);
                return ((!options?.date_range?.start ||
                    created >= options?.date_range?.start) &&
                    (!options?.date_range?.end || created <= options?.date_range?.end));
            });
        }
        if (options?.tags) {
            filteredADRs = filteredADRs.filter((adr) => options?.tags?.some((tag) => adr.keywords.includes(tag)));
        }
        return {
            adrs: filteredADRs,
            total: filteredADRs.length,
            hasMore: result?.hasMore,
        };
    }
    async searchADRs(query, options = {}) {
        const searchOptions = {
            searchType: options?.searchType || 'combined',
            query,
            projectId: this.architectureProject?.id,
            documentTypes: ['adr'],
            limit: options?.limit || 20,
        };
        if (options?.filters) {
            if (options?.filters?.status)
                searchOptions.status = [options?.filters?.status];
            if (options?.filters?.priority)
                searchOptions.priority = [options?.filters?.priority];
            if (options?.filters?.date_range)
                searchOptions.dateRange = {
                    start: options?.filters?.date_range?.start,
                    end: options?.filters?.date_range?.end,
                    field: 'created_at',
                };
        }
        const result = await documentManager.searchDocuments(searchOptions);
        return {
            adrs: result?.documents,
            total: result?.total,
            searchMetadata: result?.searchMetadata,
        };
    }
    async getADRByNumber(number) {
        const { adrs } = await this.queryADRs();
        return adrs.find((adr) => adr.metadata?.['adr_number'] === number) || null;
    }
    async getADRById(adrId) {
        const { adrs } = await this.queryADRs();
        return adrs.find((adr) => adr.metadata?.['adr_id'] === adrId) || null;
    }
    async updateADRStatus(adrNumber, newStatus, notes) {
        const adr = await this.getADRByNumber(adrNumber);
        if (!adr) {
            throw new Error(`ADR ${adrNumber} not found`);
        }
        const updated = await documentManager.updateDocument(adr.id, {
            status: 'draft',
            metadata: {
                ...adr.metadata,
                status_updated_at: new Date().toISOString(),
                status_notes: notes,
            },
        });
        if ('draft' !== adr.status) {
            await documentManager.advanceDocumentWorkflow(adr.id, 'draft', {
                status_change_reason: notes,
                updated_by: 'adr-manager',
            });
        }
        return updated;
    }
    async supersede(newADRNumber, oldADRNumber, reason) {
        const [newADR, oldADR] = await Promise.all([
            this.getADRByNumber(newADRNumber),
            this.getADRByNumber(oldADRNumber),
        ]);
        if (!newADR)
            throw new Error(`ADR ${newADRNumber} not found`);
        if (!oldADR)
            throw new Error(`ADR ${oldADRNumber} not found`);
        await documentManager.updateDocument(oldADR.id, {
            status: 'archived',
            metadata: {
                ...oldADR.metadata,
                superseded_by: newADR.metadata?.['adr_id'],
                superseded_at: new Date().toISOString(),
                superseded_reason: reason,
            },
        });
        await documentManager.updateDocument(newADR.id, {
            metadata: {
                ...newADR.metadata,
                supersedes: [
                    ...(newADR.metadata?.['supersedes'] || []),
                    oldADR.metadata?.['adr_id'],
                ],
            },
        });
    }
    async getADRStats() {
        const { adrs } = await this.queryADRs({ limit: 1000 });
        const stats = {
            total: adrs.length,
            by_status: {},
            by_priority: {},
            by_author: {},
            recent_decisions: 0,
            implementation_rate: 0,
        };
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const decidedCount = 0;
        const implementedCount = 0;
        for (const adr of adrs) {
            if (adr.status) {
                stats.by_status[adr.status] = (stats.by_status[adr.status] || 0) + 1;
            }
            if (adr.priority) {
                stats.by_priority[adr.priority] =
                    (stats.by_priority[adr.priority] || 0) + 1;
            }
            if (adr.author) {
                stats.by_author[adr.author] = (stats.by_author[adr.author] || 0) + 1;
            }
        }
        stats.implementation_rate =
            decidedCount > 0 ? (implementedCount / decidedCount) * 100 : 0;
        return stats;
    }
    async listADRs() {
        const { adrs } = await this.queryADRs({ limit: 1000 });
        return adrs
            .map((adr) => ({
            number: adr.metadata?.['adr_number'] || 0,
            id: adr.metadata?.['adr_id'] || '',
            title: adr.title.replace(/^ADR-\d+:\s*/, ''),
            status: adr.status || 'unknown',
            priority: adr.priority || 'medium',
            author: adr.author || 'unknown',
            created: new Date(adr.created_at),
            summary: adr.summary || 'No summary available',
        }))
            .sort((a, b) => b.number - a.number);
    }
    formatADRContent(adrId, options) {
        let content = `# ${adrId}: ${options?.title}\n\n`;
        content += `## Status\n**PROPOSED**\n\n`;
        content += `## Context\n${options?.context}\n\n`;
        content += `## Decision\n${options?.decision}\n\n`;
        content += `## Consequences\n${options?.consequences}\n\n`;
        if (options?.alternatives && options?.alternatives.length > 0) {
            content += `## Alternatives Considered\n\n`;
            for (const alt of options?.alternatives) {
                content += `### ${alt.name}\n`;
                content += `**Pros**: ${alt.pros.join(', ')}\n`;
                content += `**Cons**: ${alt.cons.join(', ')}\n`;
                content += `**Rejected because**: ${alt.rejected_reason}\n\n`;
            }
        }
        if (options?.implementation_notes) {
            content += `## Implementation Notes\n${options?.implementation_notes}\n\n`;
        }
        if (options?.success_criteria && options?.success_criteria.length > 0) {
            content += `## Success Criteria\n`;
            for (const criteria of options?.success_criteria) {
                content += `- ${criteria}\n`;
            }
            content += '\n';
        }
        content += `---\n\n`;
        content += `**Decision Date**: ${new Date().toISOString().split('T')[0]}\n`;
        content += `**Author**: ${options?.author || 'architecture-team'}\n`;
        if (options?.stakeholders && options?.stakeholders.length > 0) {
            content += `**Stakeholders**: ${options?.stakeholders?.join(', ')}\n`;
        }
        return content;
    }
    generateKeywords(title, decision) {
        const text = `${title} ${decision}`.toLowerCase();
        const words = text.match(/\b\w{3,}\b/g) || [];
        const stopWords = new Set([
            'the',
            'and',
            'for',
            'are',
            'but',
            'not',
            'you',
            'all',
            'can',
            'had',
            'her',
            'was',
            'one',
            'our',
            'out',
            'day',
            'get',
            'has',
            'him',
            'his',
            'how',
            'its',
            'may',
            'new',
            'now',
            'old',
            'see',
            'two',
            'who',
            'boy',
            'did',
            'man',
            'way',
            'she',
            'they',
            'will',
            'with',
            'have',
            'this',
            'that',
            'from',
            'been',
            'each',
            'word',
            'which',
            'their',
            'said',
            'what',
            'make',
            'water',
            'first',
            'would',
            'could',
            'should',
        ]);
        const keywords = [
            ...new Set(words.filter((word) => !stopWords.has(word) && word.length >= 3 && !/^\d+$/.test(word))),
        ];
        keywords.push('architecture', 'decision', 'adr');
        return keywords.slice(0, 15);
    }
}
export const adrManager = new ADRManager();
export default adrManager;
//# sourceMappingURL=adr-manager.js.map