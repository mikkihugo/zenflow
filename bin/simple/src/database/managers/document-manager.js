import { createLogger } from '../../core/logger.ts';
const logger = createLogger('database-managers-document-manager');
import { nanoid } from 'nanoid';
import { createDao, EntityTypeValues as EntityTypes, } from '../core/dao-factory.ts';
export class DocumentManager {
    databaseType;
    documentRepository;
    projectRepository;
    relationshipRepository;
    workflowRepository;
    constructor(databaseType = 'postgresql') {
        this.databaseType = databaseType;
    }
    async initialize() {
        this.documentRepository = await createDao(EntityTypes.Document, this.databaseType);
        this.projectRepository = await createDao('Project', this.databaseType);
        this.relationshipRepository = await createDao('DocumentRelationship', this.databaseType);
        this.workflowRepository = await createDao('DocumentWorkflowState', this.databaseType);
    }
    async createDocument(document, options = {}) {
        const id = nanoid();
        const now = new Date();
        const checksum = this.generateChecksum(document.content);
        const fullDocument = {
            ...document,
            id,
            created_at: now,
            updated_at: now,
            checksum,
        };
        const created = await this.documentRepository.create(fullDocument);
        if (options?.autoGenerateRelationships) {
            await this.generateDocumentRelationships(created);
        }
        if (options?.startWorkflow) {
            await this.startDocumentWorkflow(id, options?.startWorkflow);
        }
        if (options?.generateSearchIndex !== false) {
            await this.generateSearchIndex(created);
        }
        return created;
    }
    async getDocument(id, options = {}) {
        const document = await this.documentRepository.findById(id);
        if (!document) {
            return null;
        }
        if (options?.includeRelationships) {
            document.relationships = await this.getDocumentRelationships(id);
        }
        if (options?.includeWorkflowState) {
            document.workflowState = await this.getDocumentWorkflowState(id);
        }
        return document;
    }
    async updateDocument(id, updates, options = {}) {
        const now = new Date();
        const updatedData = {
            ...updates,
            updated_at: now,
            checksum: updates.content
                ? this.generateChecksum(updates.content)
                : undefined,
        };
        Object.keys(updatedData).forEach((key) => updatedData?.[key] === undefined &&
            delete updatedData?.[key]);
        const updated = await this.documentRepository.update(id, updatedData);
        if (updates.content || updates.title) {
            await this.updateSearchIndex(updated);
        }
        if (options?.autoGenerateRelationships && updates.content) {
            await this.updateDocumentRelationships(updated);
        }
        return updated;
    }
    async deleteDocument(id) {
        await this.deleteDocumentRelationships(id);
        await this.deleteDocumentWorkflowState(id);
        await this.deleteSearchIndex(id);
        await this.documentRepository.delete(id);
    }
    async queryDocuments(filters, options = {}) {
        const queryOptions = {
            limit: options?.limit || 50,
            offset: options?.offset || 0,
        };
        const documents = await this.documentRepository.findAll(queryOptions);
        let filtered = documents;
        if (filters.type) {
            const types = Array.isArray(filters.type) ? filters.type : [filters.type];
            filtered = filtered.filter((doc) => types.includes(doc.type));
        }
        if (filters.projectId) {
            filtered = filtered.filter((doc) => doc.project_id === filters.projectId);
        }
        if (filters.status) {
            const statuses = Array.isArray(filters.status)
                ? filters.status
                : [filters.status];
            filtered = filtered.filter((doc) => statuses.includes(doc.status));
        }
        if (options?.sortBy) {
            filtered.sort((a, b) => {
                const aVal = a[options?.sortBy];
                const bVal = b[options?.sortBy];
                if (options.sortOrder === 'desc') {
                    return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
                }
                return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            });
        }
        return {
            documents: filtered,
            total: filtered.length,
            hasMore: (options?.offset || 0) + filtered.length < filtered.length,
        };
    }
    async searchDocuments(searchOptions) {
        const startTime = Date.now();
        let documents = [];
        let relevanceScores = [];
        const baseFilters = {};
        if (searchOptions?.projectId)
            baseFilters.projectId = searchOptions?.projectId;
        if (searchOptions?.documentTypes)
            baseFilters.type = searchOptions?.documentTypes;
        if (searchOptions?.status)
            baseFilters.status = searchOptions?.status;
        if (searchOptions?.priority)
            baseFilters.priority = searchOptions?.priority;
        const { documents: candidateDocuments } = await this.queryDocuments(baseFilters, {
            includeContent: true,
            includeRelationships: true,
            limit: 1000,
        });
        let filteredCandidates = candidateDocuments;
        if (searchOptions?.dateRange) {
            const { start, end, field } = searchOptions?.dateRange;
            filteredCandidates = filteredCandidates.filter((doc) => {
                const dateValue = doc[field];
                return dateValue >= start && dateValue <= end;
            });
        }
        switch (searchOptions?.searchType) {
            case 'fulltext':
                ({ documents, relevanceScores } = this.performFulltextSearch(filteredCandidates, searchOptions?.query));
                break;
            case 'semantic':
                ({ documents, relevanceScores } = await this.performSemanticSearch(filteredCandidates, searchOptions?.query));
                break;
            case 'keyword':
                ({ documents, relevanceScores } = this.performKeywordSearch(filteredCandidates, searchOptions?.query));
                break;
            case 'combined':
                ({ documents, relevanceScores } = await this.performCombinedSearch(filteredCandidates, searchOptions?.query));
                break;
            default:
                ({ documents, relevanceScores } = this.performFulltextSearch(filteredCandidates, searchOptions?.query));
        }
        const total = documents.length;
        const offset = searchOptions?.offset || 0;
        const limit = searchOptions?.limit || 20;
        const paginatedDocuments = documents.slice(offset, offset + limit);
        const paginatedScores = relevanceScores.slice(offset, offset + limit);
        const hasMore = offset + limit < total;
        const processingTime = Date.now() - startTime;
        return {
            documents: paginatedDocuments,
            total,
            hasMore,
            searchMetadata: {
                searchType: searchOptions?.searchType,
                query: searchOptions?.query,
                processingTime,
                relevanceScores: paginatedScores,
            },
        };
    }
    performFulltextSearch(documents, query) {
        const queryTerms = this.tokenizeText(query.toLowerCase());
        const results = [];
        for (const doc of documents) {
            const docText = `${doc.title} ${doc.content} ${doc.keywords.join(' ')}`.toLowerCase();
            const docTerms = this.tokenizeText(docText);
            let score = 0;
            for (const term of queryTerms) {
                const tf = this.calculateTermFrequency(term, docTerms);
                const idf = this.calculateInverseDocumentFrequency(term, documents);
                score += tf * idf;
            }
            if (doc.title.toLowerCase().includes(query.toLowerCase())) {
                score *= 2;
            }
            if (doc.keywords.some((k) => k.toLowerCase().includes(query.toLowerCase()))) {
                score *= 1.5;
            }
            if (score > 0) {
                results?.push({ document: doc, score });
            }
        }
        results?.sort((a, b) => b.score - a.score);
        return {
            documents: results?.map((r) => r.document),
            relevanceScores: results?.map((r) => r.score),
        };
    }
    async performSemanticSearch(documents, query) {
        const results = [];
        const queryTokens = this.tokenizeText(query.toLowerCase());
        for (const doc of documents) {
            const docTokens = this.tokenizeText(`${doc.title} ${doc.content}`.toLowerCase());
            const expandedQueryTokens = this.expandTokensWithSynonyms(queryTokens);
            const expandedDocTokens = this.expandTokensWithSynonyms(docTokens);
            const similarity = this.calculateJaccardSimilarity(expandedQueryTokens, expandedDocTokens);
            const conceptualScore = this.calculateConceptualSimilarity(query, doc.content);
            const finalScore = similarity * 0.7 + conceptualScore * 0.3;
            if (finalScore > 0.1) {
                results?.push({ document: doc, score: finalScore });
            }
        }
        results?.sort((a, b) => b.score - a.score);
        return {
            documents: results?.map((r) => r.document),
            relevanceScores: results?.map((r) => r.score),
        };
    }
    performKeywordSearch(documents, query) {
        const queryKeywords = query
            .toLowerCase()
            .split(/\s+/)
            .filter((k) => k.length > 2);
        const results = [];
        for (const doc of documents) {
            let score = 0;
            const docKeywords = doc.keywords.map((k) => k.toLowerCase());
            for (const queryKeyword of queryKeywords) {
                if (docKeywords.includes(queryKeyword)) {
                    score += 1.0;
                }
                else if (docKeywords.some((k) => k.includes(queryKeyword) || queryKeyword.includes(k))) {
                    score += 0.5;
                }
                else if (doc.title.toLowerCase().includes(queryKeyword)) {
                    score += 0.3;
                }
            }
            if (score > 0) {
                results?.push({ document: doc, score });
            }
        }
        results?.sort((a, b) => b.score - a.score);
        return {
            documents: results?.map((r) => r.document),
            relevanceScores: results?.map((r) => r.score),
        };
    }
    async performCombinedSearch(documents, query) {
        const fulltextResults = this.performFulltextSearch(documents, query);
        const semanticResults = await this.performSemanticSearch(documents, query);
        const keywordResults = this.performKeywordSearch(documents, query);
        const combinedScores = new Map();
        const allDocuments = new Map();
        fulltextResults?.documents.forEach((doc, index) => {
            const score = (fulltextResults?.relevanceScores?.[index] || 0) * 0.4;
            combinedScores.set(doc.id, (combinedScores.get(doc.id) || 0) + score);
            allDocuments.set(doc.id, doc);
        });
        semanticResults?.documents.forEach((doc, index) => {
            const score = (semanticResults?.relevanceScores?.[index] || 0) * 0.35;
            combinedScores.set(doc.id, (combinedScores.get(doc.id) || 0) + score);
            allDocuments.set(doc.id, doc);
        });
        keywordResults?.documents.forEach((doc, index) => {
            const score = (keywordResults?.relevanceScores?.[index] || 0) * 0.25;
            combinedScores.set(doc.id, (combinedScores.get(doc.id) || 0) + score);
            allDocuments.set(doc.id, doc);
        });
        const sortedResults = Array.from(combinedScores.entries())
            .sort((a, b) => b[1] - a[1])
            .filter(([, score]) => score > 0.1);
        return {
            documents: sortedResults?.map(([docId]) => allDocuments.get(docId)),
            relevanceScores: sortedResults?.map(([, score]) => score),
        };
    }
    async createProject(project) {
        const id = nanoid();
        const now = new Date();
        const fullProject = {
            ...project,
            id,
            created_at: now,
            updated_at: now,
        };
        return await this.projectRepository.create(fullProject);
    }
    async getProjectWithDocuments(projectId) {
        const project = await this.projectRepository.findById(projectId);
        if (!project) {
            return null;
        }
        const { documents } = await this.queryDocuments({ projectId }, { includeContent: true, includeRelationships: true });
        const groupedDocuments = {
            visions: documents.filter((d) => d.type === 'vision'),
            adrs: documents.filter((d) => d.type === 'adr'),
            prds: documents.filter((d) => d.type === 'prd'),
            epics: documents.filter((d) => d.type === 'epic'),
            features: documents.filter((d) => d.type === 'feature'),
            tasks: documents.filter((d) => d.type === 'task'),
        };
        return {
            project,
            documents: groupedDocuments,
        };
    }
    async startDocumentWorkflow(documentId, workflowName, initialStage = 'draft') {
        const id = nanoid();
        const now = new Date();
        const workflowDefinition = this.getWorkflowDefinition(workflowName);
        const workflowState = {
            id,
            document_id: documentId,
            workflow_name: workflowName,
            current_stage: initialStage,
            stages_completed: [],
            next_stages: workflowDefinition.getNextStages(initialStage),
            started_at: now,
            updated_at: now,
            auto_transitions: workflowDefinition.autoTransitions,
            requires_approval: workflowDefinition.requiresApproval(initialStage),
            generated_artifacts: [],
            workflow_results: {},
        };
        const created = await this.workflowRepository.create(workflowState);
        if (workflowState.auto_transitions && !workflowState.requires_approval) {
            await this.checkAndTriggerWorkflowAutomation(documentId);
        }
        return created;
    }
    async advanceDocumentWorkflow(documentId, nextStage, results) {
        const allWorkflows = await this.workflowRepository.findAll();
        const existing = allWorkflows.find((w) => w.document_id === documentId);
        if (!existing) {
            throw new Error(`No workflow state found for document: ${documentId}`);
        }
        const workflowDefinition = this.getWorkflowDefinition(existing.workflow_name);
        if (!workflowDefinition.canTransition(existing.current_stage, nextStage)) {
            throw new Error(`Invalid transition from ${existing.current_stage} to ${nextStage}`);
        }
        const updatedState = {
            current_stage: nextStage,
            stages_completed: [...existing.stages_completed, existing.current_stage],
            next_stages: workflowDefinition.getNextStages(nextStage),
            updated_at: new Date(),
            requires_approval: workflowDefinition.requiresApproval(nextStage),
            workflow_results: results
                ? { ...existing.workflow_results, ...results }
                : existing.workflow_results,
        };
        const updated = await this.workflowRepository.update(existing.id, updatedState);
        await this.checkAndTriggerWorkflowAutomation(documentId);
        return updated;
    }
    async checkAndTriggerWorkflowAutomation(documentId) {
        const document = await this.getDocument(documentId, {
            includeWorkflowState: true,
        });
        if (!(document && document.workflowState))
            return;
        const workflowState = document
            .workflowState;
        const workflowDefinition = this.getWorkflowDefinition(workflowState.workflow_name);
        const automationRules = workflowDefinition.getAutomationRules(workflowState.current_stage);
        for (const rule of automationRules) {
            if (await this.evaluateAutomationRule(document, rule)) {
                await this.executeAutomationAction(document, rule);
            }
        }
    }
    async evaluateAutomationRule(document, rule) {
        switch (rule.condition.type) {
            case 'status_change':
                return document.status === rule.condition.value;
            case 'stage_duration': {
                const workflowState = await this.getDocumentWorkflowState(document.id);
                if (!workflowState)
                    return false;
                const durationMs = Date.now() - workflowState.updated_at.getTime();
                return durationMs >= rule.condition.value;
            }
            case 'document_type':
                return document.type === rule.condition.value;
            case 'priority_level':
                return document.priority === rule.condition.value;
            case 'completion_percentage':
                return ((document.completion_percentage || 0) >=
                    rule.condition.value);
            case 'has_relationships': {
                const relationships = await this.getDocumentRelationships(document.id);
                return relationships.length > 0;
            }
            case 'custom_field': {
                const { field, operator, value } = rule.condition.value;
                const fieldValue = document[field];
                return this.evaluateCondition(fieldValue, operator, value);
            }
            default:
                return false;
        }
    }
    async executeAutomationAction(document, rule) {
        switch (rule.action.type) {
            case 'advance_stage':
                await this.advanceDocumentWorkflow(document.id, rule.action.value);
                break;
            case 'create_document':
                await this.executeCreateDocumentAction(document, rule.action.value);
                break;
            case 'update_status':
                await this.updateDocument(document.id, { status: rule.action.value });
                break;
            case 'assign_reviewer':
                await this.updateDocument(document.id, {
                    metadata: {
                        ...document.metadata,
                        assigned_reviewer: rule.action.value,
                    },
                });
                break;
            case 'generate_artifacts':
                await this.generateWorkflowArtifacts(document, rule.action.value);
                break;
            case 'send_notification':
                await this.sendWorkflowNotification(document, rule.action.value);
                break;
            case 'update_relationships':
                await this.updateDocumentRelationships(document);
                break;
            default:
                logger.warn(`Unknown automation action type: ${rule.action.type}`);
        }
    }
    async executeCreateDocumentAction(sourceDocument, actionConfig) {
        const documentTitle = actionConfig?.title ||
            `${actionConfig?.documentType?.charAt(0).toUpperCase() + actionConfig?.documentType?.slice(1)} for ${sourceDocument.title}`;
        const newDocumentData = {
            type: actionConfig?.documentType,
            title: documentTitle,
            content: actionConfig?.template ||
                this.getDefaultTemplate(actionConfig?.documentType),
            summary: `Auto-generated ${actionConfig?.documentType} from ${sourceDocument.type}: ${sourceDocument.title}`,
            author: actionConfig?.assignTo || sourceDocument.author,
            project_id: sourceDocument.project_id,
            status: actionConfig?.status || 'draft',
            priority: actionConfig?.priority || sourceDocument.priority,
            keywords: actionConfig?.inheritKeywords
                ? [...sourceDocument.keywords]
                : [],
            metadata: {
                source_document_id: sourceDocument.id,
                auto_generated: true,
                generated_by_rule: true,
                generation_timestamp: new Date().toISOString(),
            },
        };
        const createdDocument = await this.createDocument(newDocumentData, {
            autoGenerateRelationships: true,
            startWorkflow: `${actionConfig?.documentType}_workflow`,
            generateSearchIndex: true,
        });
        await this.relationshipRepository.create({
            source_document_id: sourceDocument.id,
            target_document_id: createdDocument.id,
            relationship_type: 'generates',
            created_at: new Date(),
            metadata: {
                auto_generated: true,
                generation_rule: 'workflow_automation',
            },
        });
        return createdDocument;
    }
    async generateWorkflowArtifacts(document, artifactTypes) {
        const workflowState = await this.getDocumentWorkflowState(document.id);
        if (!workflowState)
            return;
        const artifacts = [];
        for (const artifactType of artifactTypes) {
            switch (artifactType) {
                case 'summary_report':
                    artifacts.push(await this.generateSummaryReport(document));
                    break;
                case 'checklist':
                    artifacts.push(await this.generateChecklist(document));
                    break;
                case 'timeline':
                    artifacts.push(await this.generateTimeline(document));
                    break;
                case 'stakeholder_matrix':
                    artifacts.push(await this.generateStakeholderMatrix(document));
                    break;
            }
        }
        await this.workflowRepository.update(workflowState.id, {
            generated_artifacts: [...workflowState.generated_artifacts, ...artifacts],
            updated_at: new Date(),
        });
    }
    async sendWorkflowNotification(_document, _notificationConfig) { }
    getWorkflowDefinition(workflowName) {
        const definitions = {
            vision_workflow: new VisionWorkflowDefinition(),
            adr_workflow: new ADRWorkflowDefinition(),
            prd_workflow: new PRDWorkflowDefinition(),
            epic_workflow: new EpicWorkflowDefinition(),
            feature_workflow: new FeatureWorkflowDefinition(),
            task_workflow: new TaskWorkflowDefinition(),
            default_workflow: new DefaultWorkflowDefinition(),
        };
        return definitions[workflowName] || definitions['default_workflow'];
    }
    evaluateCondition(value, operator, expected) {
        switch (operator) {
            case 'equals':
                return value === expected;
            case 'not_equals':
                return value !== expected;
            case 'greater_than':
                return value > expected;
            case 'less_than':
                return value < expected;
            case 'contains':
                return String(value).includes(String(expected));
            case 'starts_with':
                return String(value).startsWith(String(expected));
            case 'ends_with':
                return String(value).endsWith(String(expected));
            case 'in':
                return Array.isArray(expected) && expected.includes(value);
            case 'not_in':
                return Array.isArray(expected) && !expected.includes(value);
            default:
                return false;
        }
    }
    getDefaultTemplate(documentType) {
        const templates = {
            vision: '# Vision\n\n## Overview\n\n## Goals\n\n## Success Criteria\n\n## Stakeholders\n',
            adr: '# Architecture Decision Record\n\n## Status\n\n## Context\n\n## Decision\n\n## Consequences\n',
            prd: '# Product Requirements Document\n\n## Problem Statement\n\n## Requirements\n\n## Acceptance Criteria\n\n## Dependencies\n',
            epic: '# Epic\n\n## Description\n\n## User Stories\n\n## Definition of Done\n\n## Dependencies\n',
            feature: '# Feature\n\n## Description\n\n## Functional Requirements\n\n## Technical Requirements\n\n## Testing Plan\n',
            task: '# Task\n\n## Description\n\n## Steps\n\n## Acceptance Criteria\n\n## Notes\n',
            code: '# Code\n\n## Implementation\n',
            test: '# Test\n\n## Test Cases\n',
            documentation: '# Documentation\n\n## Content\n',
        };
        return templates[documentType] || '# Document\n\n## Content\n';
    }
    async generateSummaryReport(document) {
        return `Summary report generated for ${document.title} on ${new Date().toISOString()}`;
    }
    async generateChecklist(document) {
        return `Checklist generated for ${document.title} on ${new Date().toISOString()}`;
    }
    async generateTimeline(document) {
        return `Timeline generated for ${document.title} on ${new Date().toISOString()}`;
    }
    async generateStakeholderMatrix(document) {
        return `Stakeholder matrix generated for ${document.title} on ${new Date().toISOString()}`;
    }
    generateChecksum(content) {
        try {
            const crypto = require('crypto');
            const hash = crypto.createHash('sha256');
            hash.update(content, 'utf8');
            const fullHash = hash.digest('hex');
            const shortHash = fullHash.substring(0, 16);
            logger.debug(`Generated checksum for content (${content.length} chars): ${shortHash}`);
            return shortHash;
        }
        catch (error) {
            logger.error('Failed to generate checksum:', error);
            return Buffer.from(content).toString('base64').slice(0, 16);
        }
    }
    async generateDocumentRelationships(document) {
        const relationships = [];
        const parentRelationships = await this.findParentDocuments(document);
        relationships.push(...parentRelationships);
        const semanticRelationships = await this.findSemanticRelationships(document);
        relationships.push(...semanticRelationships);
        const workflowRelationships = await this.findWorkflowRelationships(document);
        relationships.push(...workflowRelationships);
        for (const relationship of relationships) {
            await this.relationshipRepository.create({
                ...relationship,
                created_at: new Date(),
            });
        }
    }
    async findParentDocuments(document) {
        const relationships = [];
        const typeHierarchy = {
            vision: [],
            adr: ['vision'],
            prd: ['vision', 'adr'],
            epic: ['prd', 'vision'],
            feature: ['epic', 'prd'],
            task: ['feature', 'epic'],
            code: ['feature', 'task'],
            test: ['code', 'feature'],
            documentation: ['feature', 'code'],
        };
        const parentTypes = typeHierarchy[document.type] || [];
        if (parentTypes.length > 0) {
            const { documents: potentialParents } = await this.queryDocuments({
                type: parentTypes,
                projectId: document.project_id,
            });
            for (const parent of potentialParents?.slice(0, 3)) {
                const strength = this.calculateRelationshipStrength(document, parent);
                if (strength > 0.3) {
                    relationships.push({
                        source_document_id: document.id,
                        target_document_id: parent?.id,
                        relationship_type: 'relates_to',
                        metadata: {
                            auto_generated: true,
                            generation_method: 'type_hierarchy',
                            parent_type: parent?.type,
                        },
                    });
                }
            }
        }
        return relationships;
    }
    async findSemanticRelationships(document) {
        const relationships = [];
        const { documents: similarDocuments } = await this.queryDocuments({
            projectId: document.project_id,
        });
        for (const other of similarDocuments) {
            if (other.id === document.id)
                continue;
            const keywordOverlap = this.calculateKeywordOverlap(document.keywords, other.keywords);
            if (keywordOverlap > 0.4) {
                relationships.push({
                    source_document_id: document.id,
                    target_document_id: other.id,
                    relationship_type: 'relates_to',
                    metadata: {
                        auto_generated: true,
                        generation_method: 'keyword_analysis',
                        keyword_overlap: keywordOverlap,
                        shared_keywords: document.keywords.filter((k) => other.keywords.includes(k)),
                    },
                });
            }
            if (document.content.toLowerCase().includes(other.title.toLowerCase())) {
                relationships.push({
                    source_document_id: document.id,
                    target_document_id: other.id,
                    relationship_type: 'relates_to',
                    metadata: {
                        auto_generated: true,
                        generation_method: 'content_reference',
                        reference_type: 'title_mention',
                    },
                });
            }
        }
        return relationships;
    }
    async findWorkflowRelationships(document) {
        const relationships = [];
        const generationRules = this.getWorkflowGenerationRules(document.type);
        for (const rule of generationRules) {
            const { documents: existingDocs } = await this.queryDocuments({
                type: rule.targetType,
                projectId: document.project_id,
            });
            for (const target of existingDocs) {
                if (target?.metadata?.['source_document_id'] === document.id) {
                    relationships.push({
                        source_document_id: document.id,
                        target_document_id: target?.id,
                        relationship_type: 'generates',
                        metadata: {
                            auto_generated: true,
                            generation_method: 'workflow_rule',
                            workflow_rule: rule.name,
                        },
                    });
                }
            }
        }
        return relationships;
    }
    calculateRelationshipStrength(doc1, doc2) {
        let strength = 0;
        const keywordSimilarity = this.calculateKeywordOverlap(doc1.keywords, doc2.keywords);
        strength += keywordSimilarity * 0.4;
        if (doc1.priority === doc2.priority) {
            strength += 0.2;
        }
        if (doc1.author === doc2.author) {
            strength += 0.1;
        }
        const timeDiff = Math.abs(doc1.created_at.getTime() - doc2.created_at.getTime());
        const maxDiff = 30 * 24 * 60 * 60 * 1000;
        const recencyFactor = Math.max(0, 1 - timeDiff / maxDiff);
        strength += recencyFactor * 0.3;
        return Math.min(1.0, strength);
    }
    calculateKeywordOverlap(keywords1, keywords2) {
        if (keywords1.length === 0 || keywords2.length === 0)
            return 0;
        const set1 = new Set(keywords1.map((k) => k.toLowerCase()));
        const set2 = new Set(keywords2.map((k) => k.toLowerCase()));
        const intersection = new Set([...set1].filter((k) => set2.has(k)));
        const union = new Set([...set1, ...set2]);
        return intersection.size / union.size;
    }
    getWorkflowGenerationRules(documentType) {
        const rules = [
            {
                name: 'prd_to_epic',
                sourceType: 'prd',
                targetType: 'epic',
            },
            {
                name: 'epic_to_feature',
                sourceType: 'epic',
                targetType: 'feature',
            },
            {
                name: 'feature_to_task',
                sourceType: 'feature',
                targetType: 'task',
            },
        ];
        return rules.filter((rule) => rule.sourceType === documentType);
    }
    async getDocumentRelationships(documentId) {
        const allRelationships = await this.relationshipRepository.findAll();
        return allRelationships.filter((r) => r.source_document_id === documentId ||
            r.target_document_id === documentId);
    }
    async getDocumentWorkflowState(documentId) {
        const allWorkflows = await this.workflowRepository.findAll();
        return allWorkflows.find((w) => w.document_id === documentId) || null;
    }
    async generateSearchIndex(_document) {
    }
    async updateSearchIndex(_document) {
    }
    async updateDocumentRelationships(document) {
        const existingRelationships = await this.getDocumentRelationships(document.id);
        const autoGeneratedRelationships = existingRelationships.filter((r) => r.metadata?.['auto_generated'] === true);
        for (const relationship of autoGeneratedRelationships) {
            await this.relationshipRepository.delete(relationship.id);
        }
        await this.generateDocumentRelationships(document);
    }
    async deleteDocumentRelationships(documentId) {
        const relationships = await this.getDocumentRelationships(documentId);
        for (const relationship of relationships) {
            await this.relationshipRepository.delete(relationship.id);
        }
    }
    async deleteDocumentWorkflowState(documentId) {
        const workflow = await this.getDocumentWorkflowState(documentId);
        if (workflow) {
            await this.workflowRepository.delete(workflow.id);
        }
    }
    async deleteSearchIndex(_documentId) {
    }
    tokenizeText(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter((token) => token.length > 2);
    }
    calculateTermFrequency(term, docTerms) {
        const termCount = docTerms.filter((t) => t === term).length;
        return docTerms.length > 0 ? termCount / docTerms.length : 0;
    }
    calculateInverseDocumentFrequency(term, documents) {
        const docsContainingTerm = documents.filter((doc) => `${doc.title} ${doc.content}`.toLowerCase().includes(term)).length;
        return docsContainingTerm > 0
            ? Math.log(documents.length / docsContainingTerm)
            : 0;
    }
    expandTokensWithSynonyms(tokens) {
        try {
            const expanded = new Set(tokens);
            const synonymMap = {
                user: [
                    'customer',
                    'client',
                    'end-user',
                    'consumer',
                    'stakeholder',
                    'actor',
                ],
                customer: [
                    'user',
                    'client',
                    'end-user',
                    'consumer',
                    'buyer',
                    'purchaser',
                ],
                stakeholder: [
                    'user',
                    'client',
                    'participant',
                    'actor',
                    'interested-party',
                ],
                system: [
                    'platform',
                    'application',
                    'service',
                    'solution',
                    'framework',
                    'infrastructure',
                ],
                platform: [
                    'system',
                    'framework',
                    'infrastructure',
                    'environment',
                    'architecture',
                ],
                application: [
                    'system',
                    'software',
                    'program',
                    'solution',
                    'tool',
                    'app',
                ],
                service: ['system', 'component', 'module', 'utility', 'functionality'],
                feature: [
                    'functionality',
                    'capability',
                    'component',
                    'function',
                    'behavior',
                    'characteristic',
                ],
                functionality: [
                    'feature',
                    'capability',
                    'function',
                    'behavior',
                    'operation',
                ],
                capability: [
                    'feature',
                    'functionality',
                    'ability',
                    'capacity',
                    'function',
                ],
                component: [
                    'module',
                    'element',
                    'part',
                    'unit',
                    'feature',
                    'building-block',
                ],
                requirement: [
                    'specification',
                    'need',
                    'criteria',
                    'constraint',
                    'condition',
                    'rule',
                ],
                specification: [
                    'requirement',
                    'definition',
                    'description',
                    'criteria',
                    'standard',
                ],
                criteria: [
                    'requirement',
                    'condition',
                    'rule',
                    'standard',
                    'measure',
                    'metric',
                ],
                process: [
                    'workflow',
                    'procedure',
                    'method',
                    'approach',
                    'flow',
                    'sequence',
                ],
                workflow: [
                    'process',
                    'procedure',
                    'flow',
                    'sequence',
                    'pipeline',
                    'chain',
                ],
                task: ['activity', 'action', 'step', 'operation', 'job', 'assignment'],
                data: [
                    'information',
                    'content',
                    'details',
                    'facts',
                    'records',
                    'input',
                ],
                information: [
                    'data',
                    'details',
                    'content',
                    'facts',
                    'knowledge',
                    'intelligence',
                ],
                content: ['data', 'information', 'material', 'text', 'details'],
                test: [
                    'validation',
                    'verification',
                    'check',
                    'examination',
                    'assessment',
                ],
                validation: [
                    'verification',
                    'confirmation',
                    'check',
                    'test',
                    'approval',
                ],
                quality: ['standard', 'grade', 'level', 'excellence', 'reliability'],
                manage: [
                    'control',
                    'handle',
                    'coordinate',
                    'oversee',
                    'administer',
                    'govern',
                ],
                control: ['manage', 'regulate', 'govern', 'direct', 'supervise'],
                coordinate: [
                    'manage',
                    'organize',
                    'synchronize',
                    'align',
                    'orchestrate',
                ],
                interface: [
                    'ui',
                    'gui',
                    'frontend',
                    'interaction',
                    'connection',
                    'boundary',
                ],
                ui: ['interface', 'gui', 'frontend', 'user-interface', 'display'],
                api: ['interface', 'endpoint', 'service', 'connection', 'integration'],
            };
            const tokenCounts = new Map();
            tokens.forEach((token) => {
                tokenCounts.set(token, (tokenCounts.get(token) || 0) + 1);
            });
            for (const token of tokens) {
                const lowerToken = token.toLowerCase();
                if (synonymMap[lowerToken]) {
                    synonymMap[lowerToken].forEach((synonym) => expanded.add(synonym));
                    const frequency = tokenCounts.get(token) || 0;
                    if (frequency > 1) {
                        this.getSemanticExpansion(lowerToken).forEach((term) => expanded.add(term));
                    }
                }
                if (lowerToken.includes('-') || lowerToken.includes('_')) {
                    const parts = lowerToken.split(/[-_]/);
                    parts.forEach((part) => {
                        if (synonymMap[part]) {
                            synonymMap[part].forEach((synonym) => expanded.add(synonym));
                        }
                    });
                }
            }
            const filtered = Array.from(expanded).filter((term) => term.length > 2 && !/^\d+$/.test(term));
            logger.debug(`Expanded ${tokens.length} tokens to ${filtered.length} terms with semantic mapping`);
            return filtered;
        }
        catch (error) {
            logger.error('Error in synonym expansion:', error);
            const synonymMap = {
                user: ['customer', 'client', 'end-user'],
                system: ['platform', 'application', 'service'],
                feature: ['functionality', 'capability', 'component'],
                requirement: ['specification', 'need', 'criteria'],
            };
            const expanded = new Set(tokens);
            for (const token of tokens) {
                if (synonymMap[token]) {
                    synonymMap[token]?.forEach((synonym) => expanded.add(synonym));
                }
            }
            return Array.from(expanded);
        }
    }
    getSemanticExpansion(term) {
        const semanticExpansions = {
            user: ['persona', 'profile', 'account', 'member'],
            system: ['ecosystem', 'architecture', 'stack', 'backend'],
            feature: ['enhancement', 'improvement', 'addition', 'extension'],
            requirement: ['business-rule', 'constraint', 'acceptance-criteria'],
            process: ['methodology', 'framework', 'approach', 'strategy'],
            data: ['dataset', 'payload', 'structure', 'model'],
            interface: ['contract', 'protocol', 'specification', 'definition'],
            quality: ['performance', 'reliability', 'maintainability', 'usability'],
        };
        return semanticExpansions[term] || [];
    }
    calculateJaccardSimilarity(tokens1, tokens2) {
        const set1 = new Set(tokens1);
        const set2 = new Set(tokens2);
        const intersection = new Set([...set1].filter((x) => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        return union.size > 0 ? intersection.size / union.size : 0;
    }
    calculateConceptualSimilarity(text1, text2) {
        const phrases1 = this.extractPhrases(text1);
        const phrases2 = this.extractPhrases(text2);
        return this.calculateJaccardSimilarity(phrases1, phrases2);
    }
    extractPhrases(text) {
        const words = this.tokenizeText(text);
        const phrases = [];
        for (let i = 0; i < words.length - 1; i++) {
            phrases.push(`${words[i]} ${words[i + 1]}`);
            if (i < words.length - 2) {
                phrases.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
            }
        }
        return phrases;
    }
}
class WorkflowDefinition {
}
class PRDWorkflowDefinition extends WorkflowDefinition {
    name = 'prd_workflow';
    stages = ['draft', 'review', 'approved', 'implementation', 'completed'];
    autoTransitions = true;
    rules = [
        {
            name: 'auto_create_epics_on_approval',
            condition: { type: 'status_change', value: 'approved' },
            action: {
                type: 'create_document',
                value: {
                    documentType: 'epic',
                    title: undefined,
                    assignTo: undefined,
                    priority: 'high',
                    status: 'draft',
                    inheritKeywords: true,
                },
            },
        },
        {
            name: 'generate_implementation_artifacts',
            condition: { type: 'status_change', value: 'approved' },
            action: {
                type: 'generate_artifacts',
                value: ['summary_report', 'checklist', 'stakeholder_matrix'],
            },
        },
    ];
    getNextStages(currentStage) {
        const stageMap = {
            draft: ['review'],
            review: ['approved', 'draft'],
            approved: ['implementation'],
            implementation: ['completed'],
            completed: [],
        };
        return stageMap[currentStage] || [];
    }
    canTransition(fromStage, toStage) {
        const allowedTransitions = this.getNextStages(fromStage);
        return allowedTransitions.includes(toStage);
    }
    requiresApproval(stage) {
        return ['approved', 'completed'].includes(stage);
    }
    getAutomationRules(stage) {
        return this.rules.filter((rule) => rule.condition.type === 'status_change' &&
            (stage === 'approved' || stage === 'implementation'));
    }
}
class FeatureWorkflowDefinition extends WorkflowDefinition {
    name = 'feature_workflow';
    stages = ['draft', 'approved', 'implementation', 'testing', 'completed'];
    autoTransitions = true;
    rules = [
        {
            name: 'auto_create_tasks_on_approval',
            condition: { type: 'status_change', value: 'approved' },
            action: {
                type: 'create_document',
                value: {
                    documentType: 'task',
                    priority: 'medium',
                    status: 'todo',
                    inheritKeywords: true,
                },
            },
        },
    ];
    getNextStages(currentStage) {
        const stageMap = {
            draft: ['approved'],
            approved: ['implementation'],
            implementation: ['testing'],
            testing: ['completed', 'implementation'],
            completed: [],
        };
        return stageMap[currentStage] || [];
    }
    canTransition(fromStage, toStage) {
        return this.getNextStages(fromStage).includes(toStage);
    }
    requiresApproval(stage) {
        return ['approved', 'completed'].includes(stage);
    }
    getAutomationRules(stage) {
        return this.rules.filter((_rule) => stage === 'approved');
    }
}
class VisionWorkflowDefinition extends WorkflowDefinition {
    name = 'vision_workflow';
    stages = ['draft', 'stakeholder_review', 'approved', 'active'];
    autoTransitions = false;
    rules = [];
    getNextStages(currentStage) {
        const stageMap = {
            draft: ['stakeholder_review'],
            stakeholder_review: ['approved', 'draft'],
            approved: ['active'],
            active: [],
        };
        return stageMap[currentStage] || [];
    }
    canTransition(fromStage, toStage) {
        return this.getNextStages(fromStage).includes(toStage);
    }
    requiresApproval(stage) {
        return ['approved', 'active'].includes(stage);
    }
    getAutomationRules() {
        return [];
    }
}
class ADRWorkflowDefinition extends WorkflowDefinition {
    name = 'adr_workflow';
    stages = ['proposed', 'discussion', 'decided', 'implemented'];
    autoTransitions = false;
    rules = [];
    getNextStages(currentStage) {
        const stageMap = {
            proposed: ['discussion', 'decided'],
            discussion: ['decided', 'proposed'],
            decided: ['implemented'],
            implemented: [],
        };
        return stageMap[currentStage] || [];
    }
    canTransition(fromStage, toStage) {
        return this.getNextStages(fromStage).includes(toStage);
    }
    requiresApproval(stage) {
        return ['decided', 'implemented'].includes(stage);
    }
    getAutomationRules() {
        return [];
    }
}
class EpicWorkflowDefinition extends WorkflowDefinition {
    name = 'epic_workflow';
    stages = ['draft', 'groomed', 'in_progress', 'completed'];
    autoTransitions = true;
    rules = [
        {
            name: 'auto_create_features_on_groom',
            condition: { type: 'status_change', value: 'groomed' },
            action: {
                type: 'create_document',
                value: {
                    documentType: 'feature',
                    priority: 'medium',
                    status: 'draft',
                    inheritKeywords: true,
                },
            },
        },
    ];
    getNextStages(currentStage) {
        const stageMap = {
            draft: ['groomed'],
            groomed: ['in_progress'],
            in_progress: ['completed'],
            completed: [],
        };
        return stageMap[currentStage] || [];
    }
    canTransition(fromStage, toStage) {
        return this.getNextStages(fromStage).includes(toStage);
    }
    requiresApproval(stage) {
        return ['groomed', 'completed'].includes(stage);
    }
    getAutomationRules(stage) {
        return this.rules.filter((_rule) => stage === 'groomed');
    }
}
class TaskWorkflowDefinition extends WorkflowDefinition {
    name = 'task_workflow';
    stages = ['todo', 'in_progress', 'review', 'done'];
    autoTransitions = false;
    rules = [];
    getNextStages(currentStage) {
        const stageMap = {
            todo: ['in_progress'],
            in_progress: ['review', 'done'],
            review: ['done', 'in_progress'],
            done: [],
        };
        return stageMap[currentStage] || [];
    }
    canTransition(fromStage, toStage) {
        return this.getNextStages(fromStage).includes(toStage);
    }
    requiresApproval(stage) {
        return ['done'].includes(stage);
    }
    getAutomationRules() {
        return [];
    }
}
class DefaultWorkflowDefinition extends WorkflowDefinition {
    name = 'default_workflow';
    stages = ['draft', 'review', 'approved', 'completed'];
    autoTransitions = false;
    rules = [];
    getNextStages(currentStage) {
        const stageMap = {
            draft: ['review'],
            review: ['approved', 'draft'],
            approved: ['completed'],
            completed: [],
        };
        return stageMap[currentStage] || [];
    }
    canTransition(fromStage, toStage) {
        return this.getNextStages(fromStage).includes(toStage);
    }
    requiresApproval(stage) {
        return ['approved', 'completed'].includes(stage);
    }
    getAutomationRules() {
        return [];
    }
}
export const documentManager = new DocumentManager();
export default documentManager;
//# sourceMappingURL=document-manager.js.map