/**
 * @fileoverview Natural Language Query Interface for FACT System
 *
 * Provides natural language querying capabilities for the FACT system,
 * converting human language into structured API calls for agentic workflows.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import { getLogger } from '@claude-zen/foundation';
const logger = getLogger('NaturalLanguageQuery');
/**
 * Query intent classification
 */
export var QueryIntent;
(function (QueryIntent) {
    QueryIntent["NPM_PACKAGE"] = "npm-package";
    QueryIntent["GITHUB_REPO"] = "github-repo";
    QueryIntent["SECURITY_CHECK"] = "security-check";
    QueryIntent["API_DOCS"] = "api-docs";
    QueryIntent["GENERAL_SEARCH"] = "general-search";
    QueryIntent["COMPARISON"] = "comparison";
    QueryIntent["TRENDING"] = "trending";
    QueryIntent["VULNERABILITY"] = "vulnerability";
})(QueryIntent || (QueryIntent = {}));
/**
 * Natural Language Query processor for FACT system
 */
export class NaturalLanguageQuery {
    patterns;
    constructor() {
        this.patterns = this.initializePatterns();
    }
    /**
     * Process natural language query and convert to structured FACT operations
     */
    async processQuery(query) {
        logger.debug(`Processing natural language query: "${query}"`);
        // Parse the natural language query
        const parsed = await this.parseQuery(query);
        // Convert to structured queries
        const structuredQueries = await this.convertToStructuredQueries(parsed, query);
        // Generate explanation of what we're doing
        const explanation = this.generateExplanation(parsed, structuredQueries);
        return {
            structuredQueries,
            parsedQuery: parsed,
            explanation
        };
    }
    /**
     * Parse natural language query into structured components
     */
    async parseQuery(query) {
        const normalizedQuery = query.toLowerCase().trim();
        // Classify intent
        const intent = this.classifyIntent(normalizedQuery);
        // Extract entities
        const entities = this.extractEntities(normalizedQuery);
        // Extract modifiers
        const modifiers = this.extractModifiers(normalizedQuery);
        // Calculate confidence based on pattern matches
        const confidence = this.calculateConfidence(normalizedQuery, intent, entities);
        return {
            intent,
            entities,
            modifiers,
            confidence
        };
    }
    /**
     * Classify the intent of the query
     */
    classifyIntent(query) {
        // NPM Package queries
        if (this.matchesPatterns(query, this.patterns.get(QueryIntent.NPM_PACKAGE) || [])) {
            return QueryIntent.NPM_PACKAGE;
        }
        // GitHub repository queries
        if (this.matchesPatterns(query, this.patterns.get(QueryIntent.GITHUB_REPO) || [])) {
            return QueryIntent.GITHUB_REPO;
        }
        // Security/vulnerability queries
        if (this.matchesPatterns(query, this.patterns.get(QueryIntent.SECURITY_CHECK) || [])) {
            return QueryIntent.SECURITY_CHECK;
        }
        // API documentation queries
        if (this.matchesPatterns(query, this.patterns.get(QueryIntent.API_DOCS) || [])) {
            return QueryIntent.API_DOCS;
        }
        // Comparison queries
        if (this.matchesPatterns(query, this.patterns.get(QueryIntent.COMPARISON) || [])) {
            return QueryIntent.COMPARISON;
        }
        // Trending queries
        if (this.matchesPatterns(query, this.patterns.get(QueryIntent.TRENDING) || [])) {
            return QueryIntent.TRENDING;
        }
        // Default to general search
        return QueryIntent.GENERAL_SEARCH;
    }
    /**
     * Extract named entities from the query
     */
    extractEntities(query) {
        const entities = {};
        // Extract package names (common npm packages)
        const packagePattern = /(?:package|npm|install|dependency)\s+([a-z0-9-]+(?:\/[a-z0-9-]+)?)/gi;
        const packageMatches = [...query.matchAll(packagePattern)];
        if (packageMatches.length > 0) {
            entities.packageNames = packageMatches.map(match => match[1]);
        }
        // Extract direct package mentions
        const directPackagePattern = /\b(react|vue|angular|express|typescript|next|webpack|vite|jest|eslint|lodash|axios|moment|jquery|bootstrap|tailwind)\b/gi;
        const directPackageMatches = [...query.matchAll(directPackagePattern)];
        if (directPackageMatches.length > 0) {
            entities.packageNames = [...(entities.packageNames || []), ...directPackageMatches.map(match => match[1])];
        }
        // Extract GitHub repository references
        const repoPattern = /(?:github|repo|repository)\s+([a-z0-9-]+)\/([a-z0-9-]+)/gi;
        const repoMatches = [...query.matchAll(repoPattern)];
        if (repoMatches.length > 0) {
            entities.repoOwners = repoMatches.map(match => match[1]);
            entities.repoNames = repoMatches.map(match => match[2]);
        }
        // Extract direct repo mentions (owner/repo format)
        const directRepoPattern = /\b([a-z0-9-]+)\/([a-z0-9-]+)\b/gi;
        const directRepoMatches = [...query.matchAll(directRepoPattern)];
        if (directRepoMatches.length > 0) {
            entities.repoOwners = [...(entities.repoOwners || []), ...directRepoMatches.map(match => match[1])];
            entities.repoNames = [...(entities.repoNames || []), ...directRepoMatches.map(match => match[2])];
        }
        // Extract CVE IDs
        const cvePattern = /cve-\d{4}-\d{4,}/gi;
        const cveMatches = [...query.matchAll(cvePattern)];
        if (cveMatches.length > 0) {
            entities.cveIds = cveMatches.map(match => match[0].toUpperCase());
        }
        // Extract technology keywords
        const techPattern = /\b(javascript|typescript|python|rust|go|java|react|vue|angular|node|deno|bun)\b/gi;
        const techMatches = [...query.matchAll(techPattern)];
        if (techMatches.length > 0) {
            entities.technologies = techMatches.map(match => match[1]);
        }
        return entities;
    }
    /**
     * Extract query modifiers
     */
    extractModifiers(query) {
        const modifiers = {};
        // Time range modifiers
        if (/\b(recent|latest|new|updated|fresh)\b/i.test(query)) {
            modifiers.timeRange = 'recent';
        }
        if (/\b(old|legacy|deprecated|archived)\b/i.test(query)) {
            modifiers.timeRange = 'older';
        }
        // Sorting modifiers
        if (/\b(popular|trending|most used|widely adopted)\b/i.test(query)) {
            modifiers.sortBy = 'popularity';
        }
        if (/\b(performance|fast|speed|benchmarks)\b/i.test(query)) {
            modifiers.sortBy = 'performance';
        }
        // Focus modifiers
        if (/\b(security|vulnerability|safe|secure|cve)\b/i.test(query)) {
            modifiers.securityFocus = true;
        }
        if (/\b(performance|speed|fast|benchmark|optimize)\b/i.test(query)) {
            modifiers.performanceFocus = true;
        }
        if (/\b(stats|metrics|numbers|downloads|stars)\b/i.test(query)) {
            modifiers.includeMetrics = true;
        }
        return modifiers;
    }
    /**
     * Convert parsed query to structured FACT queries
     */
    async convertToStructuredQueries(parsed, originalQuery) {
        const queries = [];
        switch (parsed.intent) {
            case QueryIntent.NPM_PACKAGE:
                if (parsed.entities.packageNames) {
                    for (const pkg of parsed.entities.packageNames) {
                        queries.push({
                            query: `npm package ${pkg}`,
                            sources: ['npm'],
                            limit: 5
                        });
                    }
                }
                break;
            case QueryIntent.GITHUB_REPO:
                if (parsed.entities.repoOwners && parsed.entities.repoNames) {
                    for (let i = 0; i < parsed.entities.repoOwners.length; i++) {
                        const owner = parsed.entities.repoOwners[i];
                        const repo = parsed.entities.repoNames[i];
                        queries.push({
                            query: `github repository ${owner}/${repo}`,
                            sources: ['github'],
                            limit: 5
                        });
                    }
                }
                break;
            case QueryIntent.SECURITY_CHECK:
                if (parsed.entities.cveIds) {
                    for (const cve of parsed.entities.cveIds) {
                        queries.push({
                            query: `security advisory ${cve}`,
                            sources: ['security'],
                            limit: 5
                        });
                    }
                }
                if (parsed.entities.packageNames) {
                    for (const pkg of parsed.entities.packageNames) {
                        queries.push({
                            query: `security vulnerabilities ${pkg}`,
                            sources: ['security', 'npm'],
                            limit: 10
                        });
                    }
                }
                break;
            case QueryIntent.API_DOCS:
                queries.push({
                    query: originalQuery,
                    sources: ['docs'],
                    limit: 10
                });
                break;
            case QueryIntent.COMPARISON:
                // For comparisons, query all mentioned entities
                const allEntities = [
                    ...(parsed.entities.packageNames || []),
                    ...(parsed.entities.technologies || [])
                ];
                for (const entity of allEntities) {
                    queries.push({
                        query: `compare ${entity} alternatives`,
                        sources: ['npm', 'github', 'docs'],
                        limit: 5
                    });
                }
                break;
            case QueryIntent.TRENDING:
                queries.push({
                    query: `trending ${parsed.entities.technologies?.join(' ') || 'repositories'}`,
                    sources: ['github', 'npm'],
                    limit: 20
                });
                break;
            default:
                // General search
                queries.push({
                    query: originalQuery,
                    sources: ['npm', 'github', 'docs', 'security'],
                    limit: 15
                });
        }
        return queries;
    }
    /**
     * Generate human-readable explanation of what the system will do
     */
    generateExplanation(parsed, queries) {
        const parts = [];
        parts.push(`I understand you want information about: ${parsed.intent.replace('-', ' ')}`);
        if (parsed.entities.packageNames?.length) {
            parts.push(`📦 NPM packages: ${parsed.entities.packageNames.join(', ')}`);
        }
        if (parsed.entities.repoOwners?.length && parsed.entities.repoNames?.length) {
            const repos = parsed.entities.repoOwners.map((owner, i) => `${owner}/${parsed.entities.repoNames[i]}`);
            parts.push(`🔗 GitHub repositories: ${repos.join(', ')}`);
        }
        if (parsed.entities.cveIds?.length) {
            parts.push(`🔒 Security advisories: ${parsed.entities.cveIds.join(', ')}`);
        }
        if (parsed.modifiers.securityFocus) {
            parts.push(`🛡️ Focus: Security analysis`);
        }
        if (parsed.modifiers.performanceFocus) {
            parts.push(`⚡ Focus: Performance metrics`);
        }
        parts.push(`🔍 Executing ${queries.length} targeted queries to gather comprehensive information`);
        return parts.join('\n');
    }
    /**
     * Initialize regex patterns for intent classification
     */
    initializePatterns() {
        const patterns = new Map();
        patterns.set(QueryIntent.NPM_PACKAGE, [
            /npm\s+(?:package|install|info|details)/i,
            /package\s+(?:info|details|dependencies)/i,
            /what\s+is\s+(?:the\s+)?(?:npm\s+)?package/i,
            /tell\s+me\s+about\s+(?:the\s+)?(?:npm\s+)?package/i,
            /(?:analyze|check|examine)\s+(?:npm\s+)?package/i,
            /dependencies\s+(?:of|for)/i,
            /(?:download|install)\s+(?:statistics|stats|numbers)/i
        ]);
        patterns.set(QueryIntent.GITHUB_REPO, [
            /github\s+(?:repo|repository)/i,
            /repository\s+(?:info|details|stats)/i,
            /what\s+is\s+(?:the\s+)?(?:github\s+)?(?:repo|repository)/i,
            /tell\s+me\s+about\s+(?:the\s+)?(?:github\s+)?(?:repo|repository)/i,
            /(?:analyze|check|examine)\s+(?:github\s+)?(?:repo|repository)/i,
            /(?:stars|forks|issues|contributors)\s+(?:of|for|in)/i,
            /repository\s+(?:activity|health|status)/i
        ]);
        patterns.set(QueryIntent.SECURITY_CHECK, [
            /security\s+(?:check|scan|audit|analysis)/i,
            /vulnerabilities?\s+(?:in|for|of)/i,
            /cve-?\d{4}-?\d{4,}/i,
            /(?:is|check)\s+.+\s+(?:secure|safe)/i,
            /security\s+(?:issues|problems|concerns)/i,
            /(?:known\s+)?security\s+(?:flaws|bugs)/i,
            /(?:check|scan)\s+for\s+vulnerabilities/i
        ]);
        patterns.set(QueryIntent.API_DOCS, [
            /api\s+(?:docs|documentation|reference)/i,
            /how\s+to\s+use\s+(?:the\s+)?api/i,
            /api\s+(?:endpoints|methods|calls)/i,
            /(?:show|get)\s+api\s+documentation/i,
            /api\s+(?:usage|examples|guide)/i
        ]);
        patterns.set(QueryIntent.COMPARISON, [
            /compare\s+.+\s+(?:with|to|vs|versus)/i,
            /(?:what|which)\s+is\s+better.+(?:or|vs)/i,
            /differences?\s+between/i,
            /alternatives?\s+to/i,
            /(?:pros\s+and\s+cons|advantages\s+and\s+disadvantages)/i,
            /.+\s+vs\s+.+/i
        ]);
        patterns.set(QueryIntent.TRENDING, [
            /trending\s+(?:repos|repositories|packages|projects)/i,
            /popular\s+(?:repos|repositories|packages|projects)/i,
            /most\s+(?:popular|used|starred)/i,
            /(?:hot|trending|popular)\s+(?:in|for)\s+\w+/i,
            /what['\s]s\s+trending/i,
            /top\s+(?:\d+\s+)?(?:repos|repositories|packages)/i
        ]);
        return patterns;
    }
    /**
     * Check if query matches any of the given patterns
     */
    matchesPatterns(query, patterns) {
        return patterns.some(pattern => pattern.test(query));
    }
    /**
     * Calculate confidence score for the parsing
     */
    calculateConfidence(query, intent, entities) {
        let confidence = 0.5; // Base confidence
        // Boost confidence for pattern matches
        const patterns = this.patterns.get(intent);
        if (patterns && this.matchesPatterns(query, patterns)) {
            confidence += 0.3;
        }
        // Boost confidence for extracted entities
        const entityCount = Object.values(entities).reduce((count, entityArray) => count + (entityArray?.length || 0), 0);
        confidence += Math.min(entityCount * 0.1, 0.2);
        return Math.min(confidence, 1.0);
    }
}
