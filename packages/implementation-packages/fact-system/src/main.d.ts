/**
 * @fileoverview FACT System Package Main Implementation
 *
 * Central export point for all FACT system functionality including
 * TypeScript coordination, Rust engine integration, and multi-source fact gathering.
 */
export { FactClient } from './typescript/fact-client';
export {
  createFactClient,
  createSQLiteFactClient,
  createLanceDBFactClient,
  createKuzuFactClient,
} from './typescript/fact-client';
export { FactBridge } from './typescript/fact-bridge';
export { IntelligentCache } from './typescript/intelligent-cache';
export { NaturalLanguageQuery } from './typescript/natural-language-query';
export { LiveAPIConnector } from './typescript/connectors/live-api-connector';
export { DocumentationProcessor } from './typescript/processors/documentation-processor';
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
export declare function getFactSystemAccess(
  config?: FactSystemConfig
): Promise<any>;
export declare function getFactClient(
  config?: FactSystemConfig
): Promise<FactClient>;
export declare function getFactGathering(
  config?: FactSystemConfig
): Promise<any>;
export declare function getFactProcessing(
  config?: FactSystemConfig
): Promise<any>;
export declare function getFactSources(config?: FactSystemConfig): Promise<any>;
export declare function getFactIntelligence(
  config?: FactSystemConfig
): Promise<any>;
export declare const factSystem: {
  getAccess: typeof getFactSystemAccess;
  getClient: typeof getFactClient;
  getGathering: typeof getFactGathering;
  getProcessing: typeof getFactProcessing;
  getSources: typeof getFactSources;
  getIntelligence: typeof getFactIntelligence;
  createClient: any;
  createBridge: () => any;
};
export declare const FACT_MAIN_INFO: {
  readonly version: '1.0.0';
  readonly description: 'FACT system main implementation entry point';
  readonly components: readonly [
    'FactClient - Core fact gathering system',
    'FactBridge - Rust/TypeScript integration',
    'IntelligentCache - Smart caching layer',
    'LiveAPIConnector - External data sources',
    'DocumentationProcessor - Content processing',
  ];
};
//# sourceMappingURL=main.d.ts.map
