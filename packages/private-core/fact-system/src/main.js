/**
 * @fileoverview FACT System Package Main Implementation
 *
 * Central export point for all FACT system functionality including
 * TypeScript coordination, Rust engine integration, and multi-source fact gathering.
 */
// =============================================================================
// CORE FACT SYSTEM - Primary components
// =============================================================================
export { FactClient } from './typescript/fact-client';
export { createFactClient, createSQLiteFactClient, createLanceDBFactClient, createKuzuFactClient } from './typescript/fact-client';
// =============================================================================
// ADVANCED COMPONENTS - Bridge and processing systems
// =============================================================================
export { FactBridge } from './typescript/fact-bridge';
export { IntelligentCache } from './typescript/intelligent-cache';
export { NaturalLanguageQuery } from './typescript/natural-language-query';
// =============================================================================
// CONNECTORS - External data source integration
// =============================================================================
export { LiveAPIConnector } from './typescript/connectors/live-api-connector';
// =============================================================================
// PROCESSORS - Data processing engines
// =============================================================================
export { DocumentationProcessor } from './typescript/processors/documentation-processor';
// =============================================================================
// PROFESSIONAL SYSTEM ACCESS - Production naming patterns
// =============================================================================
export async function getFactSystemAccess(config) {
    const factClient = await createFactClient(config);
    const factBridge = new FactBridge();
    const cache = new IntelligentCache();
    const nlQuery = new NaturalLanguageQuery();
    return {
        createClient: (clientConfig) => createFactClient(clientConfig),
        createSQLiteClient: (path) => createSQLiteFactClient(path),
        createLanceDBClient: (path) => createLanceDBFactClient(path),
        createKuzuClient: (path) => createKuzuFactClient(path),
        createBridge: () => new FactBridge(),
        createCache: () => new IntelligentCache(),
        search: (query) => factClient.search(query),
        searchNaturalLanguage: (query) => nlQuery.processQuery(query),
        gatherFacts: (sources, options) => factClient.gatherFromSources(sources, options),
        processDocumentation: (content) => {
            const processor = new DocumentationProcessor();
            return processor.process(content);
        },
        getStats: () => factClient.getStats(),
        clearCache: () => cache.clear(),
        shutdown: () => factClient.shutdown?.()
    };
}
export async function getFactClient(config) {
    return await createFactClient(config);
}
export async function getFactGathering(config) {
    const system = await getFactSystemAccess(config);
    return {
        gather: (sources, options) => system.gatherFacts(sources, options),
        search: (query) => system.search(query),
        query: (naturalLanguageQuery) => system.searchNaturalLanguage(naturalLanguageQuery),
        fromNPM: (packageName) => system.search({ source: 'npm', query: packageName }),
        fromGitHub: (repository) => system.search({ source: 'github', query: repository }),
        fromDocs: (apiName) => system.search({ source: 'api_docs', query: apiName })
    };
}
export async function getFactProcessing(config) {
    const system = await getFactSystemAccess(config);
    return {
        process: (content) => system.processDocumentation(content),
        cache: (key, data) => {
            const cache = new IntelligentCache();
            return cache.set(key, data);
        },
        retrieve: (key) => {
            const cache = new IntelligentCache();
            return cache.get(key);
        },
        analyze: (facts) => {
            // Analysis implementation
            return {
                totalFacts: facts.length,
                sourceBreakdown: facts.reduce((acc, fact) => {
                    acc[fact.source] = (acc[fact.source] || 0) + 1;
                    return acc;
                }, {}),
                confidence: facts.reduce((sum, fact) => sum + (fact.confidence || 0), 0) / facts.length
            };
        }
    };
}
export async function getFactSources(config) {
    const system = await getFactSystemAccess(config);
    return {
        npm: (packageName) => system.search({ source: 'npm', query: packageName }),
        github: (repository) => system.search({ source: 'github', query: repository }),
        apiDocs: (apiName) => system.search({ source: 'api_docs', query: apiName }),
        security: (cveId) => system.search({ source: 'security', query: cveId }),
        live: async (endpoint) => {
            const connector = new LiveAPIConnector();
            return connector.fetchData(endpoint);
        },
        documentation: (content) => system.processDocumentation(content)
    };
}
export async function getFactIntelligence(config) {
    const system = await getFactSystemAccess(config);
    const nlQuery = new NaturalLanguageQuery();
    return {
        understand: (query) => nlQuery.processQuery(query),
        reason: (facts) => {
            // Reasoning implementation
            return {
                insights: facts.map(fact => `${fact.source}: ${fact.summary || fact.content}`),
                patterns: [], // Pattern detection would be implemented here
                recommendations: [] // Recommendations based on facts
            };
        },
        correlate: (facts) => {
            // Correlation analysis
            const correlations = [];
            for (let i = 0; i < facts.length; i++) {
                for (let j = i + 1; j < facts.length; j++) {
                    // Simple correlation based on common terms
                    const fact1Terms = (facts[i].content || '').toLowerCase().split(' ');
                    const fact2Terms = (facts[j].content || '').toLowerCase().split(' ');
                    const commonTerms = fact1Terms.filter(term => fact2Terms.includes(term));
                    if (commonTerms.length > 3) {
                        correlations.push({
                            fact1: facts[i],
                            fact2: facts[j],
                            commonTerms,
                            strength: commonTerms.length / Math.max(fact1Terms.length, fact2Terms.length)
                        });
                    }
                }
            }
            return correlations;
        }
    };
}
// Professional fact system object with proper naming (matches brainSystem pattern)
export const factSystem = {
    getAccess: getFactSystemAccess,
    getClient: getFactClient,
    getGathering: getFactGathering,
    getProcessing: getFactProcessing,
    getSources: getFactSources,
    getIntelligence: getFactIntelligence,
    createClient: createFactClient,
    createBridge: () => new FactBridge()
};
// =============================================================================
// METADATA
// =============================================================================
export const FACT_MAIN_INFO = {
    version: '1.0.0',
    description: 'FACT system main implementation entry point',
    components: [
        'FactClient - Core fact gathering system',
        'FactBridge - Rust/TypeScript integration',
        'IntelligentCache - Smart caching layer',
        'LiveAPIConnector - External data sources',
        'DocumentationProcessor - Content processing'
    ]
};
