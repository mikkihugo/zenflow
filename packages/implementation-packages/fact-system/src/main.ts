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
export {
  createFactClient,
  createSQLiteFactClient,
  createLanceDBFactClient,
  createKuzuFactClient,
} from './typescript/fact-client';

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
// TYPE DEFINITIONS
// =============================================================================
export type {
  FactSystemConfig,
  FactSearchQuery,
  FactSearchResult,
  NPMFactResult,
  GitHubFactResult,
  SecurityFactResult,
  APIDocumentationFactResult,
  FactSystemStats,
  FactCacheEntry,
  FactSourceType,
  FactProcessingOptions,
  RustEngineConfig,
} from './typescript/types';

// =============================================================================
// PROFESSIONAL SYSTEM ACCESS - Production naming patterns
// =============================================================================

export async function getFactSystemAccess(
  config?: FactSystemConfig
): Promise<any> {
  const factClient = await createFactClient(config);
  const factBridge = new FactBridge();
  const cache = new IntelligentCache();
  const nlQuery = new NaturalLanguageQuery();

  return {
    createClient: (clientConfig?: FactSystemConfig) =>
      createFactClient(clientConfig),
    createSQLiteClient: (path?: string) => createSQLiteFactClient(path),
    createLanceDBClient: (path?: string) => createLanceDBFactClient(path),
    createKuzuClient: (path?: string) => createKuzuFactClient(path),
    createBridge: () => new FactBridge(),
    createCache: () => new IntelligentCache(),
    search: (query: FactSearchQuery) => factClient.search(query),
    searchNaturalLanguage: (query: string) => nlQuery.processQuery(query),
    gatherFacts: (sources: FactSourceType[], options?: FactProcessingOptions) =>
      factClient.gatherFromSources(sources, options),
    processDocumentation: (content: string) => {
      const processor = new DocumentationProcessor();
      return processor.process(content);
    },
    getStats: () => factClient.getStats(),
    clearCache: () => cache.clear(),
    shutdown: () => factClient.shutdown?.(),
  };
}

export async function getFactClient(
  config?: FactSystemConfig
): Promise<FactClient> {
  return await createFactClient(config);
}

export async function getFactGathering(
  config?: FactSystemConfig
): Promise<any> {
  const system = await getFactSystemAccess(config);
  return {
    gather: (sources: FactSourceType[], options?: FactProcessingOptions) =>
      system.gatherFacts(sources, options),
    search: (query: FactSearchQuery) => system.search(query),
    query: (naturalLanguageQuery: string) =>
      system.searchNaturalLanguage(naturalLanguageQuery),
    fromNPM: (packageName: string) =>
      system.search({ source: 'npm', query: packageName }),
    fromGitHub: (repository: string) =>
      system.search({ source: 'github', query: repository }),
    fromDocs: (apiName: string) =>
      system.search({ source: 'api_docs', query: apiName }),
  };
}

export async function getFactProcessing(
  config?: FactSystemConfig
): Promise<any> {
  const system = await getFactSystemAccess(config);
  return {
    process: (content: string) => system.processDocumentation(content),
    cache: (key: string, data: any) => {
      const cache = new IntelligentCache();
      return cache.set(key, data);
    },
    retrieve: (key: string) => {
      const cache = new IntelligentCache();
      return cache.get(key);
    },
    analyze: (facts: FactSearchResult[]) => {
      // Analysis implementation
      return {
        totalFacts: facts.length,
        sourceBreakdown: facts.reduce(
          (acc, fact) => {
            acc[fact.source] = (acc[fact.source]||0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ),
        confidence:
          facts.reduce((sum, fact) => sum + (fact.confidence||0), 0) /
          facts.length,
      };
    },
  };
}

export async function getFactSources(config?: FactSystemConfig): Promise<any> {
  const system = await getFactSystemAccess(config);
  return {
    npm: (packageName: string) =>
      system.search({ source:'npm', query: packageName }),
    github: (repository: string) =>
      system.search({ source: 'github', query: repository }),
    apiDocs: (apiName: string) =>
      system.search({ source: 'api_docs', query: apiName }),
    security: (cveId: string) =>
      system.search({ source: 'security', query: cveId }),
    live: async (endpoint: string) => {
      const connector = new LiveAPIConnector();
      return connector.fetchData(endpoint);
    },
    documentation: (content: string) => system.processDocumentation(content),
  };
}

export async function getFactIntelligence(
  config?: FactSystemConfig
): Promise<any> {
  const system = await getFactSystemAccess(config);
  const nlQuery = new NaturalLanguageQuery();

  return {
    understand: (query: string) => nlQuery.processQuery(query),
    reason: (facts: FactSearchResult[]) => {
      // Reasoning implementation
      return {
        insights: facts.map(
          (fact) => `${fact.source}: ${fact.summary||fact.content}`
        ),
        patterns: [], // Pattern detection would be implemented here
        recommendations: [], // Recommendations based on facts
      };
    },
    correlate: (facts: FactSearchResult[]) => {
      // Correlation analysis
      const correlations = [];
      for (let i = 0; i < facts.length; i++) {
        for (let j = i + 1; j < facts.length; j++) {
          // Simple correlation based on common terms
          const fact1Terms = (facts[i].content||'').toLowerCase().split(' ');
          const fact2Terms = (facts[j].content||'').toLowerCase().split(' ');
          const commonTerms = fact1Terms.filter((term) =>
            fact2Terms.includes(term)
          );
          if (commonTerms.length > 3) {
            correlations.push({
              fact1: facts[i],
              fact2: facts[j],
              commonTerms,
              strength:
                commonTerms.length /
                Math.max(fact1Terms.length, fact2Terms.length),
            });
          }
        }
      }
      return correlations;
    },
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
  createBridge: () => new FactBridge(),
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
    'DocumentationProcessor - Content processing',
  ],
} as const;
