/**
 * @claude-zen/fact-system
 * 
 * High-performance FACT (Fast Augmented Context Tools) system combining TypeScript coordination 
 * with Rust processing engine for external knowledge gathering and processing.
 * 
 * ## Simple Entry Point
 * 
 * ```typescript
 * import { FactSystem } from '@claude-zen/fact-system';
 * 
 * // Quick setup with SQLite
 * const factSystem = await FactSystem.createSQLite();
 * 
 * // Search across multiple sources
 * const facts = await factSystem.search({
 *   query: 'react hooks best practices',
 *   sources: ['github', 'npm', 'docs'],
 *   limit: 10
 * });
 * 
 * // Get specific package information
 * const reactInfo = await factSystem.getNPMPackage('react');
 * 
 * // Get repository insights
 * const repoInfo = await factSystem.getGitHubRepository('facebook', 'react');
 * ```
 * 
 * ## Advanced Setup
 * 
 * ```typescript
 * import { FactSystem, DatabaseProviderFactory } from '@claude-zen/fact-system';
 * 
 * const factSystem = new FactSystem({
 *   database: DatabaseProviderFactory.createLanceDB(), // Vector search capabilities
 *   useRustEngine: true,         // High-performance Rust processing
 *   enableGitHubGraphQL: true,   // Advanced GitHub integration
 *   cacheSize: 50000,            // Large cache
 *   cacheTTL: 7200000            // 2 hour cache
 * });
 * 
 * await factSystem.initialize();
 * ```
 * 
 * ## Available Backends
 * 
 * - **SQLite**: Fast local storage, good for development
 * - **LanceDB**: Vector database, excellent for semantic search
 * - **Kuzu**: Graph database, perfect for relationship queries  
 * - **PostgreSQL**: Production-ready relational database
 * 
 * ## Features
 * 
 * - **🚀 High Performance**: Rust engine for intensive processing
 * - **🔍 Multi-Source**: NPM, GitHub, Security advisories, API docs
 * - **💾 Smart Caching**: Intelligent caching with multiple storage backends
 * - **🔗 GitHub GraphQL**: Advanced repository analysis and insights
 * - **⚡ TypeScript API**: Clean, type-safe integration
 * - **🛠️ CLI Tool**: Command-line interface for fact processing
 */

// ✅ MAIN ENTRY POINT - Use this for everything!
export { FactClient as FactSystem } from './src/typescript/fact-client';
export { FactClient as default } from './src/typescript/fact-client';

// Factory functions for common setups
export {
  createFactClient,
  createSQLiteFactClient,
  createLanceDBFactClient,
  createKuzuFactClient
} from './src/typescript/fact-client';

// Bridge for advanced users
export { FactBridge } from './src/typescript/fact-bridge';

// Complete type definitions
export type {
  FactSystemConfig,
  FactSearchQuery,
  FactSearchResult,
  NPMFactResult,
  GitHubFactResult,
  SecurityFactResult,
  APIDocumentationFactResult,
  FactSystemStats,
  FactCacheEntry
} from './src/typescript/types';

// Database access via foundation package - users should import from @claude-zen/foundation
// export { DatabaseProviderFactory } from '@claude-zen/database'; // ⚠️ DEPRECATED - use foundation

// Metadata
export const FACT_SYSTEM_INFO = {
  name: '@claude-zen/fact-system',
  version: '1.0.0',
  description: 'High-performance FACT system with Rust engine and TypeScript coordination',
  features: [
    'Multi-source fact gathering',
    'High-performance Rust processing',
    'Smart caching with multiple backends', 
    'GitHub GraphQL integration',
    'NPM package analysis',
    'Security advisory lookup',
    'API documentation retrieval',
    'Type-safe TypeScript API',
    'Command-line interface'
  ],
  backends: ['SQLite', 'LanceDB', 'Kuzu', 'PostgreSQL'],
  sources: ['NPM Registry', 'GitHub API', 'NVD Security', 'API Documentation']
} as const;