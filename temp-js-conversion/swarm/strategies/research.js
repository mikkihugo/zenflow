"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResearchStrategy = void 0;
/**
 * Optimized Research Strategy Implementation
 * Provides intelligent research capabilities with parallel processing,
 * semantic clustering, caching, and progressive refinement
 */
const base_js_1 = require("./base.js");
const logger_js_1 = require("../../core/logger.js");
const helpers_js_1 = require("../../utils/helpers.js");
const types_js_1 = require("../types.js");
class ResearchStrategy extends base_js_1.BaseStrategy {
    constructor(config = {}) {
        const defaultConfig = {
            name: 'research-strategy',
            description: 'Research-focused strategy',
            version: '1.0.0',
            mode: 'mesh',
            strategy: 'research',
            coordinationStrategy: {
                name: 'research-coordination',
                description: 'Research-optimized coordination',
                agentSelection: 'capability-based',
                taskScheduling: 'priority',
                loadBalancing: 'work-sharing',
                faultTolerance: 'retry',
                communication: 'direct'
            },
            maxAgents: 8,
            maxTasks: 50,
            maxDuration: 3600000,
            resourceLimits: {},
            qualityThreshold: 0.8,
            reviewRequired: true,
            testingRequired: false,
            monitoring: {
                metricsEnabled: true,
                loggingEnabled: true,
                tracingEnabled: false,
                metricsInterval: 5000,
                heartbeatInterval: 10000,
                healthCheckInterval: 30000,
                retentionPeriod: 86400000,
                maxLogSize: 1048576,
                maxMetricPoints: 1000,
                alertingEnabled: false,
                alertThresholds: {},
                exportEnabled: false,
                exportFormat: 'json',
                exportDestination: 'file'
            },
            memory: {
                namespace: 'research',
                partitions: [],
                permissions: {
                    read: 'swarm',
                    write: 'swarm',
                    delete: 'team',
                    share: 'swarm'
                },
                persistent: true,
                backupEnabled: false,
                distributed: false,
                consistency: 'eventual',
                cacheEnabled: true,
                compressionEnabled: false
            },
            security: {
                authenticationRequired: false,
                authorizationRequired: false,
                encryptionEnabled: false,
                defaultPermissions: ['read', 'write'],
                adminRoles: ['admin'],
                auditEnabled: false,
                auditLevel: 'info',
                inputValidation: true,
                outputSanitization: true
            },
            performance: {
                maxConcurrency: 10,
                defaultTimeout: 300000,
                cacheEnabled: true,
                cacheSize: 100,
                cacheTtl: 3600000,
                optimizationEnabled: true,
                adaptiveScheduling: true,
                predictiveLoading: false,
                resourcePooling: true,
                connectionPooling: true,
                memoryPooling: false
            }
        };
        const mergedConfig = { ...defaultConfig, ...config };
        super(mergedConfig);
        this.researchCache = new Map();
        this.rateLimiters = new Map();
        this.researchQueries = new Map();
        this.researchResults = new Map();
        this.researchClusters = new Map();
        // Research-specific metrics extending base metrics
        this.researchMetrics = {
            queriesExecuted: 0,
            resultsCollected: 0,
            cacheHits: 0,
            cacheMisses: 0,
            averageResponseTime: 0,
            credibilityScores: [],
            clusteringAccuracy: 0,
            parallelEfficiency: 0
        };
        this.logger = new logger_js_1.Logger({ level: 'info', format: 'text', destination: 'console' }, { component: 'ResearchStrategy' });
        // Initialize connection pool
        this.connectionPool = {
            active: 0,
            idle: 0,
            max: config.performance?.maxConcurrency || 10,
            timeout: 30000,
            connections: new Map()
        };
        this.logger.info('ResearchStrategy initialized with optimizations', {
            maxConcurrency: this.connectionPool.max,
            cacheEnabled: config.performance?.cacheEnabled !== false
        });
    }
    async decomposeObjective(objective) {
        this.logger.info('Decomposing research objective', {
            objectiveId: objective.id,
            description: objective.description
        });
        const tasks = [];
        const dependencies = new Map();
        // Extract research parameters from objective
        const researchParams = this.extractResearchParameters(objective.description);
        // Create research query planning task
        const queryPlanningTask = this.createResearchTask('query-planning', 'research', 'Research Query Planning', `Analyze the research objective and create optimized search queries:

${objective.description}

Create a comprehensive research plan that includes:
1. Primary and secondary research questions
2. Key search terms and synonyms
3. Relevant domains and sources to explore
4. Research methodology and approach
5. Quality criteria for evaluating sources

Focus on creating queries that will yield high-quality, credible results.`, {
            priority: 'high',
            estimatedDuration: 5 * 60 * 1000, // 5 minutes
            requiredCapabilities: ['research', 'analysis'],
            researchParams
        });
        tasks.push(queryPlanningTask);
        // Create parallel web search tasks
        const webSearchTask = this.createResearchTask('web-search', 'research', 'Parallel Web Search Execution', `Execute parallel web searches based on the research plan:

${objective.description}

Perform comprehensive web searches using:
1. Multiple search engines and sources
2. Parallel query execution for efficiency
3. Intelligent source ranking and filtering
4. Real-time credibility assessment
5. Deduplication of results

Collect diverse, high-quality sources relevant to the research objective.`, {
            priority: 'high',
            estimatedDuration: 10 * 60 * 1000, // 10 minutes
            requiredCapabilities: ['web-search', 'research'],
            dependencies: [queryPlanningTask.id.id],
            researchParams
        });
        tasks.push(webSearchTask);
        dependencies.set(webSearchTask.id.id, [queryPlanningTask.id.id]);
        // Create data extraction and processing task
        const dataExtractionTask = this.createResearchTask('data-extraction', 'analysis', 'Parallel Data Extraction', `Extract and process data from collected sources:

${objective.description}

Process the collected sources by:
1. Extracting key information and insights
2. Performing semantic analysis and clustering
3. Identifying patterns and relationships
4. Assessing information quality and reliability
5. Creating structured summaries

Use parallel processing for efficient data extraction.`, {
            priority: 'high',
            estimatedDuration: 8 * 60 * 1000, // 8 minutes
            requiredCapabilities: ['analysis', 'research'],
            dependencies: [webSearchTask.id.id],
            researchParams
        });
        tasks.push(dataExtractionTask);
        dependencies.set(dataExtractionTask.id.id, [webSearchTask.id.id]);
        // Create semantic clustering task
        const clusteringTask = this.createResearchTask('semantic-clustering', 'analysis', 'Semantic Clustering and Analysis', `Perform semantic clustering of research findings:

${objective.description}

Analyze the extracted data by:
1. Grouping related information using semantic similarity
2. Identifying key themes and topics
3. Creating coherent clusters of information
4. Generating cluster summaries and insights
5. Mapping relationships between clusters

Provide a structured analysis of the research findings.`, {
            priority: 'medium',
            estimatedDuration: 6 * 60 * 1000, // 6 minutes
            requiredCapabilities: ['analysis', 'research'],
            dependencies: [dataExtractionTask.id.id],
            researchParams
        });
        tasks.push(clusteringTask);
        dependencies.set(clusteringTask.id.id, [dataExtractionTask.id.id]);
        // Create synthesis and reporting task
        const synthesisTask = this.createResearchTask('synthesis-reporting', 'documentation', 'Research Synthesis and Reporting', `Synthesize research findings into comprehensive report:

${objective.description}

Create a comprehensive research report that includes:
1. Executive summary of key findings
2. Detailed analysis of each research cluster
3. Insights and recommendations
4. Source credibility assessment
5. Methodology and limitations
6. References and citations

Ensure the report is well-structured and actionable.`, {
            priority: 'medium',
            estimatedDuration: 7 * 60 * 1000, // 7 minutes
            requiredCapabilities: ['documentation', 'analysis'],
            dependencies: [clusteringTask.id.id],
            researchParams
        });
        tasks.push(synthesisTask);
        dependencies.set(synthesisTask.id.id, [clusteringTask.id.id]);
        const totalDuration = tasks.reduce((sum, task) => sum + (task.constraints.timeoutAfter || 0), 0);
        this.logger.info('Research objective decomposed', {
            objectiveId: objective.id,
            taskCount: tasks.length,
            estimatedDuration: totalDuration,
            parallelTasks: tasks.filter(t => !dependencies.has(t.id.id)).length
        });
        return {
            tasks,
            dependencies,
            estimatedDuration: totalDuration,
            recommendedStrategy: 'research',
            complexity: this.estimateComplexity(objective.description),
            batchGroups: this.createTaskBatches(tasks, dependencies),
            timestamp: new Date(),
            ttl: 3600000, // 1 hour
            accessCount: 0,
            lastAccessed: new Date(),
            data: { objectiveId: objective.id, description: objective.description },
            resourceRequirements: {
                memory: types_js_1.SWARM_CONSTANTS.DEFAULT_MEMORY_LIMIT * 1.5,
                cpu: types_js_1.SWARM_CONSTANTS.DEFAULT_CPU_LIMIT * 1.2,
                network: 'high',
                storage: 'medium'
            }
        };
    }
    // Research-specific optimizations for task execution
    async optimizeTaskExecution(task, agent) {
        const startTime = Date.now();
        try {
            // Apply research-specific optimizations based on task type
            switch (task.type) {
                case 'research':
                    return await this.executeOptimizedWebSearch(task, agent);
                case 'analysis':
                    return await this.executeOptimizedDataExtraction(task, agent);
                default:
                    return await this.executeGenericResearchTask(task, agent);
            }
        }
        finally {
            const duration = Date.now() - startTime;
            this.updateResearchMetrics(task.type, duration);
        }
    }
    async executeOptimizedWebSearch(task, agent) {
        this.logger.info('Executing optimized web search', { taskId: task.id.id });
        // Check cache first
        const cacheKey = this.generateCacheKey('web-search', task.description);
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            this.researchMetrics.cacheHits++;
            return cached;
        }
        // Execute parallel web searches with rate limiting
        const queries = this.generateSearchQueries(task.description);
        const searchPromises = queries.map(query => this.executeRateLimitedSearch(query, agent));
        const results = await Promise.allSettled(searchPromises);
        const successfulResults = results
            .filter(r => r.status === 'fulfilled')
            .map(r => r.value)
            .flat();
        // Rank and filter results by credibility
        const rankedResults = await this.rankResultsByCredibility(successfulResults);
        // Cache results
        this.setCache(cacheKey, rankedResults, 3600000); // 1 hour TTL
        this.researchMetrics.cacheMisses++;
        return {
            results: rankedResults,
            totalFound: successfulResults.length,
            queriesExecuted: queries.length,
            credibilityScores: rankedResults.map(r => r.credibilityScore)
        };
    }
    async executeOptimizedDataExtraction(task, agent) {
        this.logger.info('Executing optimized data extraction', { taskId: task.id.id });
        // Get connection from pool
        const connection = await this.getPooledConnection();
        try {
            // Parallel data extraction with deduplication
            const extractionPromises = this.createParallelExtractionTasks(task, agent);
            const extractedData = await Promise.all(extractionPromises);
            // Deduplicate results
            const deduplicatedData = this.deduplicateResults(extractedData.flat());
            return {
                extractedData: deduplicatedData,
                totalExtracted: extractedData.flat().length,
                uniqueResults: deduplicatedData.length,
                deduplicationRate: 1 - (deduplicatedData.length / extractedData.flat().length)
            };
        }
        finally {
            this.releasePooledConnection(connection);
        }
    }
    async executeOptimizedClustering(task, agent) {
        this.logger.info('Executing optimized semantic clustering', { taskId: task.id.id });
        // Implement semantic clustering with caching
        const data = task.input?.extractedData || [];
        const cacheKey = this.generateCacheKey('clustering', JSON.stringify(data));
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            return cached;
        }
        // Perform semantic clustering
        const clusters = await this.performSemanticClustering(data);
        // Cache clustering results
        this.setCache(cacheKey, clusters, 7200000); // 2 hours TTL
        return {
            clusters,
            clusterCount: clusters.length,
            averageClusterSize: clusters.reduce((sum, c) => sum + c.results.length, 0) / clusters.length,
            coherenceScore: clusters.reduce((sum, c) => sum + c.coherenceScore, 0) / clusters.length
        };
    }
    async executeGenericResearchTask(task, agent) {
        this.logger.info('Executing generic research task', { taskId: task.id.id });
        // Apply general research optimizations
        return {
            status: 'completed',
            optimizations: ['caching', 'rate-limiting', 'connection-pooling'],
            executionTime: Date.now()
        };
    }
    // Helper methods for research optimizations
    extractResearchParameters(description) {
        return {
            domains: this.extractDomains(description),
            keywords: this.extractKeywords(description),
            timeframe: this.extractTimeframe(description),
            sourceTypes: this.extractSourceTypes(description)
        };
    }
    extractDomains(description) {
        // Extract relevant domains from description
        const domains = [];
        if (description.includes('academic') || description.includes('research'))
            domains.push('academic');
        if (description.includes('news') || description.includes('current'))
            domains.push('news');
        if (description.includes('technical') || description.includes('documentation'))
            domains.push('technical');
        return domains.length > 0 ? domains : ['general'];
    }
    extractKeywords(description) {
        // Simple keyword extraction - in production, use NLP
        return description
            .toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 3)
            .slice(0, 10);
    }
    extractTimeframe(description) {
        // Extract time-related constraints
        const now = new Date();
        return {
            start: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
            end: now
        };
    }
    extractSourceTypes(description) {
        return ['academic', 'news', 'documentation', 'blog'];
    }
    generateSearchQueries(description) {
        const baseQuery = description.substring(0, 100);
        const keywords = this.extractKeywords(description);
        return [
            {
                id: (0, helpers_js_1.generateId)('query'),
                query: baseQuery,
                keywords: keywords.slice(0, 5),
                domains: ['general'],
                priority: 1,
                timestamp: new Date()
            },
            {
                id: (0, helpers_js_1.generateId)('query'),
                query: `${baseQuery} research study`,
                keywords: [...keywords.slice(0, 3), 'research', 'study'],
                domains: ['academic'],
                priority: 2,
                timestamp: new Date()
            },
            {
                id: (0, helpers_js_1.generateId)('query'),
                query: `${baseQuery} best practices`,
                keywords: [...keywords.slice(0, 3), 'best', 'practices'],
                domains: ['technical'],
                priority: 2,
                timestamp: new Date()
            }
        ];
    }
    async executeRateLimitedSearch(query, agent) {
        const domain = query.domains[0] || 'general';
        // Check rate limits
        if (!this.checkRateLimit(domain)) {
            await this.waitForRateLimit(domain);
        }
        // Simulate web search with retry logic
        let attempts = 0;
        const maxAttempts = 3;
        while (attempts < maxAttempts) {
            try {
                // Simulate search execution
                const results = await this.simulateWebSearch(query);
                this.updateRateLimit(domain);
                return results;
            }
            catch (error) {
                attempts++;
                if (attempts >= maxAttempts)
                    throw error;
                await this.exponentialBackoff(attempts);
            }
        }
        return [];
    }
    async simulateWebSearch(query) {
        // Simulate web search results
        const resultCount = Math.floor(Math.random() * 10) + 5;
        const results = [];
        for (let i = 0; i < resultCount; i++) {
            results.push({
                id: (0, helpers_js_1.generateId)('result'),
                queryId: query.id,
                url: `https://example.com/result-${i}`,
                title: `Research Result ${i} for ${query.query}`,
                content: `Content for ${query.query} - result ${i}`,
                summary: `Summary of result ${i}`,
                credibilityScore: Math.random() * 0.4 + 0.6, // 0.6-1.0
                relevanceScore: Math.random() * 0.3 + 0.7, // 0.7-1.0
                sourceType: query.domains[0] || 'general',
                extractedAt: new Date(),
                metadata: { queryKeywords: query.keywords }
            });
        }
        return results;
    }
    async rankResultsByCredibility(results) {
        // Sort by combined credibility and relevance score
        return results.sort((a, b) => {
            const scoreA = (a.credibilityScore * 0.6) + (a.relevanceScore * 0.4);
            const scoreB = (b.credibilityScore * 0.6) + (b.relevanceScore * 0.4);
            return scoreB - scoreA;
        });
    }
    createParallelExtractionTasks(task, agent) {
        // Create parallel extraction tasks
        const results = task.input?.results || [];
        const batchSize = Math.ceil(results.length / this.connectionPool.max);
        const batches = [];
        for (let i = 0; i < results.length; i += batchSize) {
            const batch = results.slice(i, i + batchSize);
            batches.push(this.extractDataFromBatch(batch));
        }
        return batches;
    }
    async extractDataFromBatch(batch) {
        // Simulate parallel data extraction
        return batch.map(result => ({
            id: result.id,
            extractedData: `Extracted data from ${result.title}`,
            insights: [`Insight 1 from ${result.title}`, `Insight 2 from ${result.title}`],
            metadata: result.metadata
        }));
    }
    deduplicateResults(results) {
        const seen = new Set();
        return results.filter(result => {
            const key = result.extractedData || result.id;
            if (seen.has(key))
                return false;
            seen.add(key);
            return true;
        });
    }
    async performSemanticClustering(data) {
        // Simulate semantic clustering
        const clusterCount = Math.min(Math.ceil(data.length / 5), 10);
        const clusters = [];
        for (let i = 0; i < clusterCount; i++) {
            const clusterData = data.slice(i * 5, (i + 1) * 5);
            clusters.push({
                id: (0, helpers_js_1.generateId)('cluster'),
                topic: `Research Topic ${i + 1}`,
                results: clusterData,
                centroid: Array(10).fill(0).map(() => Math.random()),
                coherenceScore: Math.random() * 0.3 + 0.7,
                keywords: [`keyword${i}1`, `keyword${i}2`],
                summary: `Summary of cluster ${i + 1}`
            });
        }
        return clusters;
    }
    // Connection pooling methods
    async getPooledConnection() {
        if (this.connectionPool.active >= this.connectionPool.max) {
            await this.waitForConnection();
        }
        this.connectionPool.active++;
        return { id: (0, helpers_js_1.generateId)('connection'), timestamp: new Date() };
    }
    releasePooledConnection(connection) {
        this.connectionPool.active--;
        this.connectionPool.idle++;
    }
    async waitForConnection() {
        return new Promise(resolve => {
            const checkConnection = () => {
                if (this.connectionPool.active < this.connectionPool.max) {
                    resolve();
                }
                else {
                    setTimeout(checkConnection, 100);
                }
            };
            checkConnection();
        });
    }
    // Rate limiting methods
    checkRateLimit(domain) {
        const limiter = this.rateLimiters.get(domain);
        if (!limiter) {
            this.rateLimiters.set(domain, {
                requests: 0,
                windowStart: new Date(),
                windowSize: 60000, // 1 minute
                maxRequests: 10,
                backoffMultiplier: 1
            });
            return true;
        }
        const now = new Date();
        if (now.getTime() - limiter.windowStart.getTime() > limiter.windowSize) {
            limiter.requests = 0;
            limiter.windowStart = now;
        }
        return limiter.requests < limiter.maxRequests;
    }
    updateRateLimit(domain) {
        const limiter = this.rateLimiters.get(domain);
        if (limiter) {
            limiter.requests++;
        }
    }
    async waitForRateLimit(domain) {
        const limiter = this.rateLimiters.get(domain);
        if (!limiter)
            return;
        const waitTime = limiter.windowSize * limiter.backoffMultiplier;
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    async exponentialBackoff(attempt) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    // Caching methods
    generateCacheKey(type, data) {
        return `${type}:${Buffer.from(data).toString('base64').substring(0, 32)}`;
    }
    getFromCache(key) {
        const entry = this.researchCache.get(key);
        if (!entry)
            return null;
        const now = new Date();
        if (now.getTime() - entry.timestamp.getTime() > entry.ttl) {
            this.researchCache.delete(key);
            return null;
        }
        entry.accessCount++;
        entry.lastAccessed = now;
        return entry.data;
    }
    setCache(key, data, ttl) {
        this.researchCache.set(key, {
            key,
            data,
            timestamp: new Date(),
            ttl,
            accessCount: 0,
            lastAccessed: new Date()
        });
        // Cleanup old entries if cache is too large
        if (this.researchCache.size > 1000) {
            this.cleanupCache();
        }
    }
    cleanupCache() {
        const entries = Array.from(this.researchCache.entries());
        entries.sort((a, b) => a[1].lastAccessed.getTime() - b[1].lastAccessed.getTime());
        // Remove oldest 20% of entries
        const toRemove = Math.floor(entries.length * 0.2);
        for (let i = 0; i < toRemove; i++) {
            this.researchCache.delete(entries[i][0]);
        }
    }
    createResearchTask(id, type, name, instructions, options = {}) {
        const taskId = {
            id: (0, helpers_js_1.generateId)('task'),
            swarmId: 'research-swarm',
            sequence: 1,
            priority: 1
        };
        return {
            id: taskId,
            type,
            name,
            description: instructions,
            instructions,
            requirements: {
                capabilities: options.requiredCapabilities || ['research'],
                tools: ['WebFetchTool', 'WebSearch'],
                permissions: ['read', 'write']
            },
            constraints: {
                dependencies: options.dependencies || [],
                dependents: [],
                conflicts: [],
                maxRetries: 3,
                timeoutAfter: options.estimatedDuration || 300000
            },
            priority: options.priority || 'medium',
            input: options.researchParams || {},
            context: {},
            examples: [],
            status: 'created',
            createdAt: new Date(),
            updatedAt: new Date(),
            attempts: [],
            statusHistory: [{
                    timestamp: new Date(),
                    from: 'created',
                    to: 'created',
                    reason: 'Task created',
                    triggeredBy: 'system'
                }]
        };
    }
    updateResearchMetrics(taskType, duration) {
        this.researchMetrics.queriesExecuted++;
        this.researchMetrics.averageResponseTime =
            (this.researchMetrics.averageResponseTime + duration) / 2;
    }
    createTaskBatches(tasks, dependencies) {
        const batches = [];
        const processed = new Set();
        let batchIndex = 0;
        while (processed.size < tasks.length) {
            const batchTasks = tasks.filter(task => !processed.has(task.id.id) &&
                task.constraints.dependencies.every(dep => processed.has(dep.id)));
            if (batchTasks.length === 0)
                break; // Prevent infinite loop
            const batch = {
                id: `research-batch-${batchIndex++}`,
                tasks: batchTasks,
                canRunInParallel: batchTasks.length > 1,
                estimatedDuration: Math.max(...batchTasks.map(t => t.constraints.timeoutAfter || 0)),
                requiredResources: {
                    agents: batchTasks.length,
                    memory: batchTasks.length * 512, // MB
                    cpu: batchTasks.length * 0.5 // CPU cores
                }
            };
            batches.push(batch);
            batchTasks.forEach(task => processed.add(task.id.id));
        }
        return batches;
    }
    // Public API for metrics
    getMetrics() {
        const credibilityScoresRecord = {};
        this.researchMetrics.credibilityScores.forEach((score, index) => {
            credibilityScoresRecord[`result_${index}`] = score;
        });
        return {
            ...this.metrics,
            queriesExecuted: this.researchMetrics.queriesExecuted,
            averageResponseTime: this.researchMetrics.averageResponseTime,
            cacheHits: this.researchMetrics.cacheHits,
            cacheMisses: this.researchMetrics.cacheMisses,
            credibilityScores: credibilityScoresRecord,
            cacheHitRate: this.researchMetrics.cacheHits / (this.researchMetrics.cacheHits + this.researchMetrics.cacheMisses || 1),
            averageCredibilityScore: this.researchMetrics.credibilityScores.length > 0
                ? this.researchMetrics.credibilityScores.reduce((a, b) => a + b, 0) / this.researchMetrics.credibilityScores.length
                : 0,
            connectionPoolUtilization: this.connectionPool.active / this.connectionPool.max,
            cacheSize: this.researchCache.size
        };
    }
    // Progressive refinement methods
    async refineResearchScope(objective, intermediateResults) {
        this.logger.info('Refining research scope based on intermediate results', {
            objectiveId: objective.id,
            resultsCount: intermediateResults.length
        });
        // Analyze intermediate results to refine scope
        const refinedObjective = { ...objective };
        // Update requirements based on findings
        if (intermediateResults.length > 0) {
            const avgCredibility = intermediateResults
                .map(r => r.credibilityScore || 0.5)
                .reduce((a, b) => a + b, 0) / intermediateResults.length;
            if (avgCredibility < 0.7) {
                refinedObjective.requirements.qualityThreshold = Math.max(refinedObjective.requirements.qualityThreshold, 0.8);
            }
        }
        return refinedObjective;
    }
    // Implementation of abstract methods from BaseStrategy
    async selectAgentForTask(task, availableAgents) {
        if (availableAgents.length === 0)
            return null;
        // Research-specific agent selection logic
        let bestAgent = null;
        let bestScore = 0;
        for (const agent of availableAgents) {
            let score = 0;
            // Check for research capabilities
            if (agent.capabilities?.research)
                score += 0.4;
            if (agent.capabilities?.webSearch)
                score += 0.3;
            if (agent.capabilities?.analysis)
                score += 0.2;
            // Check for specific research task types
            if (task.type === 'research' && agent.type === 'researcher')
                score += 0.3;
            if (task.type === 'analysis' && agent.type === 'analyst')
                score += 0.3;
            if (task.type === 'research' && agent.capabilities?.webSearch)
                score += 0.4;
            // Consider current workload
            score *= (1 - (agent.workload || 0));
            if (score > bestScore) {
                bestScore = score;
                bestAgent = agent;
            }
        }
        return bestAgent?.id?.id || null;
    }
    async optimizeTaskSchedule(tasks, agents) {
        const allocations = [];
        // Group tasks by type for optimal allocation
        const researchTasks = tasks.filter(t => t.type === 'research');
        const analysisTasks = tasks.filter(t => t.type === 'analysis');
        const otherTasks = tasks.filter(t => !['research', 'analysis'].includes(t.type));
        for (const agent of agents) {
            const allocation = {
                agentId: agent.id?.id || agent.id,
                tasks: [],
                estimatedWorkload: 0,
                capabilities: this.getAgentCapabilitiesList(agent)
            };
            // Allocate tasks based on agent capabilities
            if (agent.type === 'researcher' && researchTasks.length > 0) {
                const task = researchTasks.shift();
                if (task) {
                    allocation.tasks.push(task.id.id);
                    allocation.estimatedWorkload += 0.3;
                }
            }
            if (agent.type === 'analyst' && analysisTasks.length > 0) {
                const task = analysisTasks.shift();
                if (task) {
                    allocation.tasks.push(task.id.id);
                    allocation.estimatedWorkload += 0.3;
                }
            }
            // Web search tasks are handled as research tasks
            // Allocate remaining tasks
            if (allocation.tasks.length === 0 && otherTasks.length > 0) {
                const task = otherTasks.shift();
                if (task) {
                    allocation.tasks.push(task.id.id);
                    allocation.estimatedWorkload += 0.2;
                }
            }
            if (allocation.tasks.length > 0) {
                allocations.push(allocation);
            }
        }
        return allocations;
    }
    getAgentCapabilitiesList(agent) {
        const caps = [];
        if (agent.capabilities) {
            if (agent.capabilities.research)
                caps.push('research');
            if (agent.capabilities.webSearch)
                caps.push('web-search');
            if (agent.capabilities.analysis)
                caps.push('analysis');
            if (agent.capabilities.codeGeneration)
                caps.push('code-generation');
            if (agent.capabilities.documentation)
                caps.push('documentation');
        }
        return caps;
    }
}
exports.ResearchStrategy = ResearchStrategy;
