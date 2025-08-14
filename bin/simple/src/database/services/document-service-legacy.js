import { nanoid } from 'nanoid';
import { createDao } from '../index.ts';
export class DocumentService {
    databaseType;
    documentRepository;
    projectRepository;
    relationshipRepository;
    workflowRepository;
    documentDAO;
    coordinator;
    constructor(databaseType = 'postgresql') {
        this.databaseType = databaseType;
    }
    async initialize() {
        this.documentRepository = await createDao('Document', this.databaseType);
        this.projectRepository = await createDao('Project', this.databaseType);
        this.relationshipRepository = await createDao('DocumentRelationship', this.databaseType);
        this.workflowRepository = await createDao('DocumentWorkflowState', this.databaseType);
        this.documentDAO = await createDao('Document', this.databaseType);
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
        const query = {
            type: 'select',
            operation: 'document_find',
            parameters: {
                collection: 'documents',
                filter: { id },
                includeContent: options?.includeContent !== false,
            },
            requirements: {
                consistency: 'eventual',
                timeout: 10000,
                priority: 'medium',
            },
            routing: {
                loadBalancing: 'performance_based',
            },
            timestamp: Date.now(),
        };
        const result = await this.coordinator.executeQuery(query);
        if (!result?.result?.documents?.length) {
            return null;
        }
        const document = this.deserializeDocument(result?.result?.documents?.[0]);
        if (options?.includeRelationships) {
            document.relationships = await this.getDocumentRelationships(id);
        }
        if (options?.includeWorkflowState) {
            document.workflowState = await this.getDocumentWorkflowState(id);
        }
        return document;
    }
    async updateDocument(id, updates, options = {}) {
        const existing = await this.getDocument(id);
        if (!existing) {
            throw new Error(`Document not found: ${id}`);
        }
        const now = new Date();
        const updatedDocument = {
            ...existing,
            ...updates,
            updated_at: now,
            checksum: updates.content
                ? this.generateChecksum(updates.content)
                : existing.checksum,
        };
        const updateQuery = {
            type: 'update',
            operation: 'document_update',
            parameters: {
                collection: 'documents',
                filter: { id },
                update: this.serializeDocument(updatedDocument),
            },
            requirements: {
                consistency: 'strong',
                timeout: 30000,
                priority: 'high',
            },
            routing: {
                loadBalancing: 'capability_based',
            },
            timestamp: Date.now(),
        };
        await this.coordinator.executeQuery(updateQuery);
        if (updates.content || updates.title) {
            await this.updateSearchIndex(updatedDocument);
        }
        if (options?.autoGenerateRelationships && updates.content) {
            await this.updateDocumentRelationships(updatedDocument);
        }
        return updatedDocument;
    }
    async deleteDocument(id) {
        await this.deleteDocumentRelationships(id);
        await this.deleteDocumentWorkflowState(id);
        await this.deleteSearchIndex(id);
        const deleteQuery = {
            type: 'delete',
            operation: 'document_delete',
            parameters: {
                collection: 'documents',
                filter: { id },
            },
            requirements: {
                consistency: 'strong',
                timeout: 30000,
                priority: 'high',
            },
            routing: {
                loadBalancing: 'capability_based',
            },
            timestamp: Date.now(),
        };
        await this.coordinator.executeQuery(deleteQuery);
    }
    async queryDocuments(filters, options = {}) {
        const query = {
            type: 'select',
            operation: 'document_find',
            parameters: {
                collection: 'documents',
                filter: this.buildQueryFilter(filters),
                options: {
                    limit: options?.limit || 50,
                    offset: options?.offset || 0,
                    sort: {
                        [options?.sortBy || 'updated_at']: options?.sortOrder || 'desc',
                    },
                    includeContent: options?.includeContent !== false,
                },
            },
            requirements: {
                consistency: 'eventual',
                timeout: 15000,
                priority: 'medium',
            },
            routing: {
                loadBalancing: 'performance_based',
            },
            timestamp: Date.now(),
        };
        const result = await this.coordinator.executeQuery(query);
        const documents = result?.result?.documents.map((doc) => this.deserializeDocument(doc)) || [];
        return {
            documents,
            total: result?.result?.total || documents.length,
            hasMore: (options?.offset || 0) + documents.length <
                (result?.result?.total || 0),
        };
    }
    async searchDocuments(searchOptions) {
        const startTime = Date.now();
        let query;
        switch (searchOptions?.searchType) {
            case 'fulltext':
                query = this.buildFullTextSearchQuery(searchOptions);
                break;
            case 'semantic':
                query = this.buildSemanticSearchQuery(searchOptions);
                break;
            case 'keyword':
                query = this.buildKeywordSearchQuery(searchOptions);
                break;
            default:
                query = this.buildCombinedSearchQuery(searchOptions);
        }
        const result = await this.coordinator.executeQuery(query);
        const documents = result?.result?.documents.map((doc) => this.deserializeDocument(doc)) || [];
        const processingTime = Date.now() - startTime;
        return {
            documents,
            total: result?.result?.total || documents.length,
            hasMore: (searchOptions?.offset || 0) + documents.length <
                (result?.result?.total || 0),
            searchMetadata: {
                searchType: searchOptions?.searchType,
                query: searchOptions?.query,
                processingTime,
                relevanceScores: result?.result?.relevanceScores,
            },
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
        const insertQuery = {
            type: 'insert',
            operation: 'document_insert',
            parameters: {
                collection: 'projects',
                document: fullProject,
            },
            requirements: {
                consistency: 'strong',
                timeout: 30000,
                priority: 'high',
            },
            routing: {
                loadBalancing: 'capability_based',
            },
            timestamp: Date.now(),
        };
        await this.coordinator.executeQuery(insertQuery);
        return fullProject;
    }
    async getProjectWithDocuments(projectId) {
        const projectQuery = {
            type: 'select',
            operation: 'document_find',
            parameters: {
                collection: 'projects',
                filter: { id: projectId },
            },
            requirements: {
                consistency: 'eventual',
                timeout: 10000,
                priority: 'medium',
            },
            routing: {
                loadBalancing: 'performance_based',
            },
            timestamp: Date.now(),
        };
        const projectResult = await this.coordinator.executeQuery(projectQuery);
        if (!projectResult?.result?.documents?.length) {
            return null;
        }
        const project = projectResult?.result?.documents?.[0];
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
    async startDocumentWorkflow(documentId, workflowName, initialStage = 'started') {
        const id = nanoid();
        const now = new Date();
        const workflowState = {
            id,
            document_id: documentId,
            workflow_name: workflowName,
            current_stage: initialStage,
            stages_completed: [],
            next_stages: [initialStage],
            started_at: now,
            updated_at: now,
            auto_transitions: true,
            requires_approval: false,
            generated_artifacts: [],
        };
        const insertQuery = {
            type: 'insert',
            operation: 'document_insert',
            parameters: {
                collection: 'document_workflow_states',
                document: workflowState,
            },
            requirements: {
                consistency: 'strong',
                timeout: 30000,
                priority: 'high',
            },
            routing: {
                loadBalancing: 'capability_based',
            },
            timestamp: Date.now(),
        };
        await this.coordinator.executeQuery(insertQuery);
        return workflowState;
    }
    async advanceDocumentWorkflow(documentId, nextStage, results) {
        const existing = await this.getDocumentWorkflowState(documentId);
        if (!existing) {
            throw new Error(`No workflow state found for document: ${documentId}`);
        }
        const updatedState = {
            ...existing,
            current_stage: nextStage,
            stages_completed: [...existing.stages_completed, existing.current_stage],
            updated_at: new Date(),
            workflow_results: results
                ? { ...existing.workflow_results, ...results }
                : existing.workflow_results,
        };
        const updateQuery = {
            type: 'update',
            operation: 'document_update',
            parameters: {
                collection: 'document_workflow_states',
                filter: { document_id: documentId },
                update: updatedState,
            },
            requirements: {
                consistency: 'strong',
                timeout: 30000,
                priority: 'high',
            },
            routing: {
                loadBalancing: 'capability_based',
            },
            timestamp: Date.now(),
        };
        await this.coordinator.executeQuery(updateQuery);
        return updatedState;
    }
    serializeDocument(document) {
        return {
            ...document,
            tags: JSON.stringify(document.tags),
            dependencies: JSON.stringify(document.dependencies),
            related_documents: JSON.stringify(document.related_documents),
            keywords: JSON.stringify(document.keywords),
        };
    }
    deserializeDocument(data) {
        return {
            ...data,
            tags: JSON.parse(data?.tags || '[]'),
            dependencies: JSON.parse(data?.dependencies || '[]'),
            related_documents: JSON.parse(data?.related_documents || '[]'),
            keywords: JSON.parse(data?.keywords || '[]'),
            created_at: new Date(data?.created_at),
            updated_at: new Date(data?.updated_at),
        };
    }
    generateChecksum(content) {
        return Buffer.from(content).toString('base64').slice(0, 16);
    }
    buildQueryFilter(filters) {
        const filter = {};
        if (filters.type) {
            if (Array.isArray(filters.type)) {
                filter.type = { $in: filters.type };
            }
            else {
                filter.type = filters.type;
            }
        }
        if (filters.projectId) {
            filter.project_id = filters.projectId;
        }
        if (filters.status) {
            if (Array.isArray(filters.status)) {
                filter.status = { $in: filters.status };
            }
            else {
                filter.status = filters.status;
            }
        }
        return filter;
    }
    buildFullTextSearchQuery(options) {
        return {
            type: 'select',
            operation: 'fulltext_search',
            parameters: {
                collection: 'documents',
                query: options?.query,
                fields: ['title', 'content', 'searchable_content'],
                filters: this.buildSearchFilters(options),
                limit: options?.limit || 20,
                offset: options?.offset || 0,
            },
            requirements: {
                consistency: 'eventual',
                timeout: 15000,
                priority: 'medium',
                capabilities: ['fulltext_search'],
            },
            routing: {
                loadBalancing: 'capability_based',
            },
            timestamp: Date.now(),
        };
    }
    buildSemanticSearchQuery(options) {
        return {
            type: 'select',
            operation: 'vector_search',
            parameters: {
                collection: 'document_search_index',
                vector: this.encodeSearchQuery(options?.query),
                limit: options?.limit || 20,
                filters: this.buildSearchFilters(options),
            },
            requirements: {
                consistency: 'eventual',
                timeout: 15000,
                priority: 'medium',
                capabilities: ['vector_search'],
            },
            routing: {
                loadBalancing: 'capability_based',
            },
            timestamp: Date.now(),
        };
    }
    buildKeywordSearchQuery(options) {
        return {
            type: 'select',
            operation: 'keyword_search',
            parameters: {
                collection: 'document_search_index',
                keywords: options?.query?.split(' '),
                filters: this.buildSearchFilters(options),
                limit: options?.limit || 20,
                offset: options?.offset || 0,
            },
            requirements: {
                consistency: 'eventual',
                timeout: 10000,
                priority: 'medium',
            },
            routing: {
                loadBalancing: 'performance_based',
            },
            timestamp: Date.now(),
        };
    }
    buildCombinedSearchQuery(options) {
        return {
            type: 'select',
            operation: 'hybrid_search',
            parameters: {
                collection: 'documents',
                textQuery: options?.query,
                vectorQuery: this.encodeSearchQuery(options?.query),
                keywordQuery: options?.query?.split(' '),
                weights: { text: 0.4, vector: 0.4, keyword: 0.2 },
                filters: this.buildSearchFilters(options),
                limit: options?.limit || 20,
                offset: options?.offset || 0,
            },
            requirements: {
                consistency: 'eventual',
                timeout: 20000,
                priority: 'medium',
                capabilities: ['fulltext_search', 'vector_search'],
            },
            routing: {
                loadBalancing: 'capability_based',
            },
            timestamp: Date.now(),
        };
    }
    buildSearchFilters(options) {
        const filters = {};
        if (options?.documentTypes?.length) {
            filters.document_type = { $in: options?.documentTypes };
        }
        if (options?.projectId) {
            filters.project_id = options?.projectId;
        }
        if (options?.status?.length) {
            filters.status = { $in: options?.status };
        }
        if (options?.priority?.length) {
            filters.priority = { $in: options?.priority };
        }
        if (options?.dateRange) {
            filters[options?.dateRange?.field] = {
                $gte: options?.dateRange?.start,
                $lte: options?.dateRange?.end,
            };
        }
        return filters;
    }
    encodeSearchQuery(_query) {
        return new Array(768).fill(0).map(() => Math.random() - 0.5);
    }
    async generateDocumentRelationships(_document) {
    }
    async getDocumentRelationships(_documentId) {
        return [];
    }
    async getDocumentWorkflowState(_documentId) {
        return null;
    }
    async generateSearchIndex(_document) {
    }
    async updateSearchIndex(_document) {
    }
    async updateDocumentRelationships(_document) {
    }
    async deleteDocumentRelationships(_documentId) {
    }
    async deleteDocumentWorkflowState(_documentId) {
    }
    async deleteSearchIndex(_documentId) {
    }
}
//# sourceMappingURL=document-service-legacy.js.map