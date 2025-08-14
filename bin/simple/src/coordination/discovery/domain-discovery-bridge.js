import { EventEmitter } from 'node:events';
import { basename } from 'node:path';
import { getLogger } from '../../config/logging-config.ts';
import { NeuralDomainMapper } from './neural-domain-mapper.ts';
const logger = getLogger('DomainDiscoveryBridge');
export class DomainDiscoveryBridge extends EventEmitter {
    docProcessor;
    domainAnalyzer;
    projectAnalyzer;
    config;
    discoveredDomains = new Map();
    documentMappings = new Map();
    conceptCache = new Map();
    initialized = false;
    neuralDomainMapper;
    constructor(docProcessor, domainAnalyzer, projectAnalyzer, _intelligenceCoordinator, config = {}) {
        super();
        this.docProcessor = docProcessor;
        this.domainAnalyzer = domainAnalyzer;
        this.projectAnalyzer = projectAnalyzer;
        this.config = {
            confidenceThreshold: config?.confidenceThreshold ?? 0.7,
            autoDiscovery: config?.autoDiscovery ?? true,
            maxDomainsPerDocument: config?.maxDomainsPerDocument ?? 3,
            useNeuralAnalysis: config?.useNeuralAnalysis ?? true,
            enableCache: config?.enableCache ?? true,
        };
        this.neuralDomainMapper = new NeuralDomainMapper();
        this.setupEventListeners();
    }
    async initialize() {
        if (this.initialized)
            return;
        logger.info('Initializing Domain Discovery Bridge');
        await this.projectAnalyzer.initialize();
        if (this.config.autoDiscovery) {
            const workspaces = this.docProcessor.getWorkspaces();
            if (workspaces.length > 0) {
                await this.discoverDomains();
            }
        }
        this.initialized = true;
        this.emit('initialized');
        logger.info('Domain Discovery Bridge ready');
    }
    async discoverDomains() {
        logger.info('Starting domain discovery process');
        const monorepoInfo = this.projectAnalyzer.getMonorepoInfo();
        logger.debug('Monorepo info:', monorepoInfo);
        const allDocuments = this.getAllWorkspaceDocuments();
        logger.info(`Found ${allDocuments.length} documents across all workspaces`);
        const relevantDocs = await this.askHumanRelevance(allDocuments);
        logger.info(`Human selected ${relevantDocs.length} relevant documents`);
        const projectRoot = monorepoInfo?.hasRootPackageJson ? process.cwd() : '.';
        const domainAnalysis = await this.domainAnalyzer.analyzeDomainComplexity(projectRoot);
        logger.info(`Identified ${Object.keys(domainAnalysis.categories).length} domain categories`);
        const mappings = await this.createDocumentDomainMappings(relevantDocs, domainAnalysis);
        logger.debug(`Created ${mappings.length} document-domain mappings`);
        const validatedMappings = await this.validateMappingsWithHuman(mappings);
        logger.info(`Human validated ${validatedMappings.length} mappings`);
        const domains = await this.generateEnrichedDomains(validatedMappings, domainAnalysis, monorepoInfo);
        domains.forEach((domain) => {
            this.discoveredDomains.set(domain.id, domain);
        });
        this.emit('discovery:complete', {
            domainCount: domains.length,
            documentCount: relevantDocs.length,
            mappingCount: validatedMappings.length,
        });
        logger.info(`Domain discovery complete: ${domains.length} domains discovered`);
        return domains;
    }
    async askHumanRelevance(documents) {
        if (documents.length === 0)
            return [];
        const grouped = this.groupDocumentsByType(documents);
        const relevanceAnalysis = await Promise.all(documents.map((doc) => this.analyzeDocumentRelevance(doc)));
        const validationRequest = {
            type: 'document-relevance',
            question: `Found ${documents.length} documents. Which are relevant for domain discovery?`,
            context: {
                vision: grouped['vision']?.length || 0,
                adrs: grouped['adr']?.length || 0,
                prds: grouped['prd']?.length || 0,
                epics: grouped['epic']?.length || 0,
                features: grouped['feature']?.length || 0,
                tasks: grouped['task']?.length || 0,
                totalDocuments: documents.length,
            },
            options: relevanceAnalysis.map((analysis, index) => ({
                id: documents[index]?.path || '',
                label: `${documents[index]?.type?.toUpperCase() || 'UNKNOWN'}: ${basename(documents[index]?.path || '')}`,
                preview: `${documents[index]?.content?.substring(0, 200) ?? ''}...`,
                metadata: {
                    suggestedRelevance: analysis.suggestedRelevance,
                    concepts: analysis.concepts.slice(0, 5),
                    reason: analysis.relevanceReason,
                },
            })),
        };
        logger.debug('🤖 AGUI validation request prepared', {
            type: validationRequest.type,
            documentsFound: validationRequest.context,
            optionsCount: validationRequest.options?.length || 0,
        });
        const selected = documents.filter((_, index) => {
            const analysis = relevanceAnalysis[index];
            return analysis ? (analysis.suggestedRelevance ?? 0) > 0.6 : false;
        });
        logger.info(`Selected ${selected.length} relevant documents for domain discovery`);
        return selected;
    }
    async validateMappingsWithHuman(mappings) {
        if (mappings.length === 0)
            return [];
        const domainGroups = this.groupMappingsByDomain(mappings);
        const validationRequest = {
            type: 'domain-mapping',
            question: `Please validate ${mappings.length} document-domain mappings`,
            context: {
                totalMappings: mappings.length,
                uniqueDomains: Object.keys(domainGroups).length,
                averageConfidence: this.calculateAverageConfidence(mappings),
            },
            options: mappings.map((mapping) => ({
                id: `${mapping.documentPath}:${mapping.domainIds.join(',')}`,
                label: `${basename(mapping.documentPath)} → ${mapping.domainIds.join(', ')}`,
                preview: `Confidence: ${mapping.confidenceScores.map((s) => `${(s * 100).toFixed(0)}%`).join(', ')}`,
                metadata: {
                    concepts: mapping.matchedConcepts,
                    documentType: mapping.documentType,
                },
            })),
        };
        logger.debug('🤖 AGUI mapping validation request prepared', {
            type: validationRequest.type,
            totalMappings: validationRequest.context['totalMappings'],
            domainGroups: validationRequest.context['domainGroups'],
            optionsCount: validationRequest.options?.length || 0,
        });
        const validated = mappings.filter((mapping) => Math.max(...mapping.confidenceScores) > this.config.confidenceThreshold);
        logger.info(`Human validated ${validated.length} of ${mappings.length} mappings`);
        return validated;
    }
    extractConcepts(content) {
        if (!content)
            return [];
        const cacheKey = content.substring(0, 100);
        if (this.config.enableCache && this.conceptCache.has(cacheKey)) {
            return this.conceptCache.get(cacheKey);
        }
        const concepts = new Set();
        const patterns = [
            /\b(microservices?|monolith|event-driven|serverless|distributed|cloud-native)\b/gi,
            /\b(neural network|machine learning|deep learning|ai|artificial intelligence|nlp|gnn|cnn|rnn|lstm)\b/gi,
            /\b(database|cache|storage|persistence|memory|redis|postgresql|mongodb|elasticsearch)\b/gi,
            /\b(react|vue|angular|node|express|fastify|typescript|javascript|python|rust|go)\b/gi,
            /\b(authentication|authorization|payment|messaging|notification|analytics|monitoring)\b/gi,
            /\b(api|rest|graphql|websocket|grpc|queue|broker|gateway|proxy|load balancer)\b/gi,
            /\b(agile|scrum|tdd|ci\/cd|devops|testing|deployment|docker|kubernetes)\b/gi,
        ];
        patterns.forEach((pattern) => {
            const matches = content.match(pattern);
            if (matches) {
                matches?.forEach((match) => concepts.add(match?.toLowerCase()));
            }
        });
        const headerMatches = content.match(/^#{1,3}\s+(.+)$/gm);
        if (headerMatches) {
            headerMatches?.forEach((header) => {
                const cleanHeader = header.replace(/^#+\s+/, '').toLowerCase();
                if (cleanHeader.length > 3 && cleanHeader.length < 50) {
                    concepts.add(cleanHeader);
                }
            });
        }
        const bulletMatches = content.match(/^[\s-*]+\s*(.+)$/gm);
        if (bulletMatches) {
            bulletMatches?.forEach((bullet) => {
                const cleanBullet = bullet.replace(/^[\s-*]+/, '').toLowerCase();
                patterns.forEach((pattern) => {
                    const matches = cleanBullet.match(pattern);
                    if (matches) {
                        matches?.forEach((match) => concepts.add(match?.toLowerCase()));
                    }
                });
            });
        }
        const conceptArray = Array.from(concepts);
        if (this.config.enableCache) {
            this.conceptCache.set(cacheKey, conceptArray);
        }
        return conceptArray;
    }
    calculateRelevance(concepts, domain) {
        if (concepts.length === 0)
            return 0;
        let relevanceScore = 0;
        let matchCount = 0;
        const categoryKeywords = {
            agents: ['agent', 'coordinator', 'orchestrator', 'swarm', 'multi-agent'],
            coordination: [
                'coordination',
                'orchestration',
                'workflow',
                'synchronization',
            ],
            neural: ['neural', 'network', 'ai', 'machine learning', 'deep learning'],
            memory: ['memory', 'storage', 'cache', 'persistence', 'database'],
            wasm: ['wasm', 'webassembly', 'binary', 'performance', 'acceleration'],
            bridge: ['bridge', 'integration', 'adapter', 'connector', 'interface'],
            models: ['model', 'schema', 'data structure', 'entity', 'preset'],
        };
        Object.entries(domain.categories).forEach(([category, files]) => {
            if (files.length > 0 && categoryKeywords[category]) {
                const keywords = categoryKeywords[category];
                const categoryMatches = concepts.filter((concept) => keywords.some((keyword) => concept.includes(keyword))).length;
                if (categoryMatches > 0) {
                    relevanceScore += (categoryMatches / keywords.length) * 0.3;
                    matchCount += categoryMatches;
                }
            }
        });
        const allFiles = Object.values(domain.categories).flat();
        const fileNameMatches = concepts.filter((concept) => allFiles.some((file) => file.toLowerCase().includes(concept))).length;
        if (fileNameMatches > 0) {
            relevanceScore += (fileNameMatches / concepts.length) * 0.3;
            matchCount += fileNameMatches;
        }
        if (domain.complexity > 50) {
            relevanceScore += 0.1;
        }
        if (domain.coupling?.tightlyCoupledGroups?.length > 0) {
            relevanceScore += 0.1;
        }
        const matchRatio = matchCount / concepts.length;
        relevanceScore += matchRatio * 0.2;
        return Math.min(1, Math.max(0, relevanceScore));
    }
    async analyzeDocumentRelevance(document) {
        const concepts = this.extractConcepts(document.content || '');
        let baseRelevance = 0;
        let relevanceReason = '';
        switch (document.type) {
            case 'vision':
                baseRelevance = 0.9;
                relevanceReason = 'Vision documents define overall system architecture';
                break;
            case 'adr':
                baseRelevance = 0.95;
                relevanceReason = 'ADRs contain critical architectural decisions';
                break;
            case 'prd':
                baseRelevance = 0.85;
                relevanceReason = 'PRDs describe product features and domains';
                break;
            case 'epic':
                baseRelevance = 0.7;
                relevanceReason = 'Epics group related features into domains';
                break;
            case 'feature':
                baseRelevance = 0.6;
                relevanceReason = 'Features may indicate domain boundaries';
                break;
            case 'task':
                baseRelevance = 0.4;
                relevanceReason = 'Tasks are too granular for domain discovery';
                break;
            default:
                baseRelevance = 0.5;
                relevanceReason = 'Unknown document type';
        }
        const conceptScore = Math.min(1, concepts.length / 10);
        const finalRelevance = baseRelevance * 0.7 + conceptScore * 0.3;
        const potentialDomains = this.identifyPotentialDomains(concepts);
        return {
            document,
            suggestedRelevance: finalRelevance,
            concepts: concepts.slice(0, 10),
            potentialDomains,
            relevanceReason,
        };
    }
    async createDocumentDomainMappings(documents, domainAnalysis) {
        const mappings = [];
        for (const doc of documents) {
            const concepts = this.extractConcepts(doc.content || '');
            const relevanceScore = this.calculateRelevance(concepts, domainAnalysis);
            if (relevanceScore > 0.3) {
                const categoryScores = new Map();
                Object.entries(domainAnalysis.categories).forEach(([category, files]) => {
                    if (files.length > 0) {
                        const categoryRelevance = this.calculateCategoryRelevance(concepts, category, files);
                        if (categoryRelevance > 0.3) {
                            categoryScores.set(category, categoryRelevance);
                        }
                    }
                });
                const topCategories = Array.from(categoryScores.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, this.config.maxDomainsPerDocument);
                if (topCategories.length > 0) {
                    const mapping = {
                        documentPath: doc.path,
                        documentType: doc.type,
                        domainIds: topCategories.map(([cat]) => cat),
                        confidenceScores: topCategories.map(([, score]) => score),
                        matchedConcepts: concepts.filter((concept) => topCategories.some(([cat]) => cat.toLowerCase().includes(concept) ||
                            concept.includes(cat.toLowerCase()))),
                        timestamp: Date.now(),
                    };
                    mappings.push(mapping);
                    this.documentMappings.set(doc.path, mapping);
                }
            }
        }
        return mappings;
    }
    async generateEnrichedDomains(mappings, domainAnalysis, monorepoInfo) {
        const domains = new Map();
        for (const mapping of mappings) {
            for (let i = 0; i < mapping.domainIds.length; i++) {
                const domainId = mapping.domainIds[i];
                const confidence = mapping.confidenceScores[i];
                if (!domainId)
                    continue;
                if (confidence === undefined)
                    continue;
                if (!domains.has(domainId)) {
                    const domain = await this.createDomain(domainId, domainAnalysis, monorepoInfo);
                    domains.set(domainId, domain);
                }
                const domain = domains.get(domainId);
                if (!domain.documents.includes(mapping.documentPath)) {
                    domain.documents.push(mapping.documentPath);
                }
                mapping.matchedConcepts.forEach((concept) => {
                    if (!domain.concepts.includes(concept)) {
                        domain.concepts.push(concept);
                    }
                });
                const docCount = domain.documents.length;
                domain.confidence =
                    (domain.confidence * (docCount - 1) + (confidence ?? 0)) / docCount;
            }
        }
        const domainArray = await this.enhanceDomainsWithNeuralAnalysis(Array.from(domains.values()), domainAnalysis, monorepoInfo);
        return domainArray;
    }
    async enhanceDomainsWithNeuralAnalysis(domains, domainAnalysis, monorepoInfo) {
        if (!this.config.useNeuralAnalysis || domains.length < 2) {
            for (const domain of domains) {
                domain.relatedDomains = this.findRelatedDomains(domain, domains);
            }
            return domains;
        }
        try {
            logger.info('🧠 Performing GNN-enhanced domain analysis', {
                domainCount: domains.length,
                hasBazelMetadata: !!(monorepoInfo?.type === 'bazel' && monorepoInfo.bazelMetadata),
            });
            const neuralDomains = domains.map((domain) => ({
                name: domain.name,
                files: domain.codeFiles,
                dependencies: this.extractDomainDependencies(domain, domainAnalysis),
                confidenceScore: domain.confidence,
            }));
            const dependencyGraph = this.buildDomainDependencyGraph(neuralDomains, domainAnalysis);
            const bazelMetadata = monorepoInfo?.type === 'bazel'
                ? monorepoInfo.bazelMetadata
                : null;
            const relationshipMap = await this.neuralDomainMapper.mapDomainRelationships(neuralDomains, dependencyGraph, bazelMetadata);
            const enhancedDomains = this.applyNeuralInsightsToDemons(domains, relationshipMap, bazelMetadata);
            logger.info('✅ Neural domain enhancement complete', {
                relationships: relationshipMap.relationships.length,
                avgCohesion: relationshipMap.cohesionScores &&
                    relationshipMap.cohesionScores.length > 0
                    ? relationshipMap.cohesionScores.reduce((sum, score) => sum + score.score, 0) / relationshipMap.cohesionScores.length
                    : 0,
                bazelEnhanced: !!bazelMetadata,
            });
            return enhancedDomains;
        }
        catch (error) {
            logger.warn('⚠️  Neural domain analysis failed, falling back to basic analysis:', error);
            for (const domain of domains) {
                domain.relatedDomains = this.findRelatedDomains(domain, domains);
            }
            return domains;
        }
    }
    extractDomainDependencies(domain, domainAnalysis) {
        const dependencies = [];
        for (const coupledGroup of domainAnalysis.coupling?.tightlyCoupledGroups ||
            []) {
            const hasFiles = coupledGroup.files.some((file) => domain.codeFiles.includes(file));
            if (hasFiles) {
                const relatedFiles = coupledGroup.files.filter((file) => !domain.codeFiles.includes(file));
                dependencies.push(...relatedFiles);
            }
        }
        return [...new Set(dependencies)];
    }
    buildDomainDependencyGraph(domains, domainAnalysis) {
        const dependencyGraph = {};
        for (const domain of domains) {
            dependencyGraph[domain.name] = {};
            for (const otherDomain of domains) {
                if (domain.name === otherDomain.name)
                    continue;
                let relationshipStrength = 0;
                const sharedDependencies = domain.dependencies.filter((dep) => otherDomain.files.some((file) => file.includes(dep) || dep.includes(file)));
                relationshipStrength += sharedDependencies.length;
                for (const coupledGroup of domainAnalysis.coupling
                    ?.tightlyCoupledGroups || []) {
                    const domainHasFiles = coupledGroup.files.some((file) => domain.files.includes(file));
                    const otherHasFiles = coupledGroup.files.some((file) => otherDomain.files.includes(file));
                    if (domainHasFiles && otherHasFiles) {
                        relationshipStrength += 5;
                    }
                }
                if (relationshipStrength > 0) {
                    dependencyGraph[domain.name][otherDomain.name] =
                        relationshipStrength;
                }
            }
        }
        return dependencyGraph;
    }
    applyNeuralInsightsToDemons(domains, relationshipMap, bazelMetadata) {
        const domainIndexMap = new Map(domains.map((d, i) => [d.name, i]));
        for (const cohesionScore of relationshipMap.cohesionScores) {
            const domainIndex = domainIndexMap.get(cohesionScore.domainName);
            if (domainIndex !== undefined && domains[domainIndex]) {
                const domain = domains[domainIndex];
                const neuralBonus = Math.min(cohesionScore.score * 0.2, 0.3);
                domain.confidence = Math.min(domain.confidence + neuralBonus, 1.0);
            }
        }
        for (const relationship of relationshipMap.relationships) {
            const sourceDomain = domains[relationship.source];
            const targetDomain = domains[relationship.target];
            if (sourceDomain && targetDomain) {
                if (!sourceDomain.relatedDomains.includes(targetDomain.name)) {
                    sourceDomain.relatedDomains.push(targetDomain.name);
                }
                if (!targetDomain.relatedDomains.includes(sourceDomain.name)) {
                    targetDomain.relatedDomains.push(sourceDomain.name);
                }
                if (bazelMetadata && relationship.bazelInsights) {
                    const bazelInsights = relationship.bazelInsights;
                    if (bazelInsights.targetTypes?.length > 0) {
                        sourceDomain.description += ` (Bazel: ${bazelInsights.targetTypes.join(', ')})`;
                    }
                    if (bazelInsights.dependencyStrength > 0.2) {
                        if (sourceDomain.suggestedTopology === 'hierarchical') {
                            sourceDomain.suggestedTopology = 'mesh';
                        }
                        if (targetDomain.suggestedTopology === 'hierarchical') {
                            targetDomain.suggestedTopology = 'mesh';
                        }
                    }
                }
            }
        }
        if (bazelMetadata && relationshipMap.bazelEnhancements) {
            const enhancements = relationshipMap.bazelEnhancements;
            logger.info('📊 Applied Bazel enhancements to domains', {
                totalTargets: enhancements.totalTargets,
                languages: enhancements.languages,
                workspaceName: enhancements.workspaceName,
            });
        }
        return domains;
    }
    async createDomain(domainId, domainAnalysis, _monorepoInfo) {
        const category = domainAnalysis.categories[domainId] || [];
        const description = this.generateDomainDescription(domainId, category.length);
        const topology = this.suggestTopology(domainId, category.length, domainAnalysis);
        return {
            id: `domain-${domainId}-${Date.now()}`,
            name: domainId,
            description,
            confidence: 0.5,
            source: 'auto-discovery',
            documents: [],
            relevantDocuments: [],
            codeFiles: category,
            concepts: [],
            category: domainId,
            suggestedTopology: topology,
            relatedDomains: [],
            suggestedAgents: [],
        };
    }
    generateDomainDescription(domainId, fileCount) {
        const descriptions = {
            agents: `Agent coordination and orchestration domain with ${fileCount} files`,
            coordination: `System coordination and workflow management domain with ${fileCount} files`,
            neural: `Neural network and AI/ML capabilities domain with ${fileCount} files`,
            memory: `Memory management and persistence domain with ${fileCount} files`,
            wasm: `WebAssembly acceleration and performance domain with ${fileCount} files`,
            bridge: `Integration bridges and adapters domain with ${fileCount} files`,
            models: `Data models and neural network presets domain with ${fileCount} files`,
            'core-algorithms': `Core algorithmic implementations with ${fileCount} files`,
            utilities: `Utility functions and helpers with ${fileCount} files`,
        };
        return (descriptions[domainId] || `${domainId} domain with ${fileCount} files`);
    }
    suggestTopology(domainId, fileCount, analysis) {
        if (fileCount > 50)
            return 'hierarchical';
        const domainCoupling = analysis.coupling?.tightlyCoupledGroups?.filter((group) => group.files.some((file) => analysis.categories[domainId]?.includes(file))) || [];
        const firstCoupling = domainCoupling[0];
        if (domainCoupling.length > 0 &&
            firstCoupling &&
            firstCoupling.files.length > 3) {
            return 'mesh';
        }
        if (domainId === 'coordination' || domainId === 'bridge') {
            return 'star';
        }
        if (domainId === 'data-processing' || domainId === 'training-systems') {
            return 'ring';
        }
        return 'hierarchical';
    }
    findRelatedDomains(domain, allDomains) {
        const related = [];
        for (const other of allDomains) {
            if (other.id === domain.id)
                continue;
            const sharedConcepts = domain.concepts.filter((concept) => other.concepts.includes(concept));
            const sharedDocs = domain.documents.filter((doc) => other.documents.includes(doc));
            const conceptScore = sharedConcepts.length / Math.max(domain.concepts.length, 1);
            const docScore = sharedDocs.length / Math.max(domain.documents.length, 1);
            const totalScore = conceptScore * 0.7 + docScore * 0.3;
            if (totalScore > 0.2) {
                related.push({ id: other.id, score: totalScore });
            }
        }
        return related
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map((r) => r.id);
    }
    calculateCategoryRelevance(concepts, category, files) {
        let score = 0;
        if (concepts.some((c) => c.includes(category) || category.includes(c))) {
            score += 0.4;
        }
        const fileMatches = files.filter((file) => concepts.some((concept) => file.toLowerCase().includes(concept))).length;
        score += Math.min(0.3, (fileMatches / files.length) * 0.3);
        const categoryBonuses = {
            neural: ['ai', 'ml', 'neural', 'network', 'deep learning'],
            agents: ['agent', 'swarm', 'coordinator', 'orchestrator'],
            memory: ['storage', 'cache', 'persistence', 'database'],
        };
        const bonusCategory = categoryBonuses[category];
        if (bonusCategory) {
            const bonusMatches = concepts.filter((c) => bonusCategory.some((bonus) => c.includes(bonus))).length;
            score += Math.min(0.3, (bonusMatches / bonusCategory.length) * 0.3);
        }
        return Math.min(1, score);
    }
    identifyPotentialDomains(concepts) {
        const domains = new Set();
        const domainPatterns = {
            authentication: ['auth', 'login', 'jwt', 'oauth', 'security'],
            'neural-processing': ['neural', 'ai', 'ml', 'deep learning', 'network'],
            'data-storage': ['database', 'storage', 'persistence', 'cache', 'memory'],
            'api-gateway': ['api', 'rest', 'graphql', 'gateway', 'endpoint'],
            messaging: ['message', 'queue', 'broker', 'pubsub', 'event'],
            monitoring: [
                'monitor',
                'metrics',
                'logging',
                'telemetry',
                'observability',
            ],
        };
        Object.entries(domainPatterns).forEach(([domain, keywords]) => {
            if (concepts.some((concept) => keywords.some((kw) => concept.includes(kw)))) {
                domains.add(domain);
            }
        });
        return Array.from(domains);
    }
    getAllWorkspaceDocuments() {
        const documents = [];
        const workspaces = this.docProcessor.getWorkspaces();
        for (const workspaceId of workspaces) {
            const workspaceDocs = this.docProcessor.getWorkspaceDocuments(workspaceId);
            documents.push(...Array.from(workspaceDocs.values()));
        }
        return documents;
    }
    groupDocumentsByType(documents) {
        const grouped = {};
        documents.forEach((doc) => {
            if (!grouped[doc.type]) {
                grouped[doc.type] = [];
            }
            grouped[doc.type].push(doc);
        });
        return grouped;
    }
    groupMappingsByDomain(mappings) {
        const grouped = {};
        mappings.forEach((mapping) => {
            mapping.domainIds.forEach((domainId) => {
                if (!grouped[domainId]) {
                    grouped[domainId] = [];
                }
                grouped[domainId]?.push(mapping);
            });
        });
        return grouped;
    }
    calculateAverageConfidence(mappings) {
        if (mappings.length === 0)
            return 0;
        const totalConfidence = mappings.reduce((sum, mapping) => {
            const avgMappingConfidence = mapping.confidenceScores.reduce((a, b) => a + b, 0) /
                mapping.confidenceScores.length;
            return sum + avgMappingConfidence;
        }, 0);
        return totalConfidence / mappings.length;
    }
    setupEventListeners() {
        this.docProcessor.on('document:processed', async (event) => {
            if (this.config.autoDiscovery) {
                logger.debug(`Document processed: ${event.document.path}`);
                await this.onDocumentProcessed(event);
            }
        });
        this.docProcessor.on('workspace:loaded', async (event) => {
            if (this.config.autoDiscovery) {
                logger.debug(`Workspace loaded: ${event.workspaceId}`);
                await this.onWorkspaceLoaded(event);
            }
        });
    }
    async onDocumentProcessed(event) {
        const { document } = event;
        const relevance = await this.analyzeDocumentRelevance(document);
        if (relevance.suggestedRelevance > this.config.confidenceThreshold) {
            logger.info(`Document ${document.path} is relevant for domain discovery`);
            this.emit('document:relevant', relevance);
        }
    }
    async onWorkspaceLoaded(event) {
        const { workspaceId, documentCount } = event;
        if (documentCount > 0) {
            logger.info(`Workspace ${workspaceId} loaded with ${documentCount} documents`);
            setImmediate(() => this.discoverDomains().catch((err) => logger.error('Background domain discovery failed:', err)));
        }
    }
    getDiscoveredDomains() {
        return new Map(this.discoveredDomains);
    }
    getDocumentMappings() {
        return new Map(this.documentMappings);
    }
    clearCache() {
        this.conceptCache.clear();
        logger.debug('Concept cache cleared');
    }
    async shutdown() {
        logger.info('Shutting down Domain Discovery Bridge...');
        this.removeAllListeners();
        this.clearCache();
        this.discoveredDomains.clear();
        this.documentMappings.clear();
        logger.info('Domain Discovery Bridge shutdown complete');
    }
}
export function createDomainDiscoveryBridge(docProcessor, domainAnalyzer, projectAnalyzer, intelligenceCoordinator, config) {
    return new DomainDiscoveryBridge(docProcessor, domainAnalyzer, projectAnalyzer, intelligenceCoordinator, config);
}
//# sourceMappingURL=domain-discovery-bridge.js.map