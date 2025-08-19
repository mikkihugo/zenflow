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
  createKuzuFactClient 
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
  RustEngineConfig
} from './typescript/types';

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
} as const;