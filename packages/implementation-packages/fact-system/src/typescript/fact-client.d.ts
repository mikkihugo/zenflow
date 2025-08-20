/**
 * @fileoverview High-level FACT System Client
 *
 * Provides a clean TypeScript API for the FACT (Fast Augmented Context Tools) system.
 * Combines high-performance Rust processing with TypeScript coordination and
 * integrates with the unified database package for storage.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import type { FactSearchQuery, FactSearchResult, FactSystemConfig, GitHubFactResult, NPMFactResult, SecurityFactResult, HexFactResult, APIDocumentationFactResult, RustCrateFactResult, GoModuleFactResult, PerlPackageFactResult, JavaPackageFactResult, GitLabRepoFactResult, BitbucketRepoFactResult } from './types';
/**
 * High-level FACT System client that provides easy access to external facts
 * with high-performance Rust processing and unified database storage.
 */
export declare class FactClient {
    private bridge;
    private database;
    private config;
    constructor(config: FactSystemConfig);
    /**
     * Initialize the FACT system
     */
    initialize(): Promise<void>;
    /**
     * Search for facts - simple SQL query, very fast
     */
    search(query: FactSearchQuery): Promise<FactSearchResult[]>;
    /**
     * Get NPM package - fast query
     */
    getNPMPackage(packageName: string, version?: string): Promise<NPMFactResult>;
    /**
     * Get GitHub repository - fast query
     */
    getGitHubRepository(owner: string, repo: string): Promise<GitHubFactResult>;
    /**
     * Get security advisory - fast query
     */
    getSecurityAdvisory(cveId: string): Promise<SecurityFactResult>;
    /**
     * Get Hex package - fast query
     */
    getHexPackage(packageName: string, version?: string): Promise<HexFactResult>;
    /**
     * Get API documentation - fast query
     */
    getAPIDocumentation(apiName: string, endpoint?: string): Promise<APIDocumentationFactResult>;
    /**
     * Get Rust crate - fast query (with docs.rs integration)
     */
    getRustCrate(crateName: string, version?: string): Promise<RustCrateFactResult>;
    /**
     * Get Go module - fast query
     */
    getGoModule(modulePath: string, version?: string): Promise<GoModuleFactResult>;
    /**
     * Get Perl package - fast query (CPAN)
     */
    getPerlPackage(packageName: string, version?: string): Promise<PerlPackageFactResult>;
    /**
     * Get Java package - fast query (Maven Central)
     */
    getJavaPackage(groupId: string, artifactId: string, version?: string): Promise<JavaPackageFactResult>;
    /**
     * Get GitLab repository - fast query
     */
    getGitLabRepository(projectPath: string): Promise<GitLabRepoFactResult>;
    /**
     * Get Bitbucket repository - fast query
     */
    getBitbucketRepository(workspace: string, repoSlug: string): Promise<BitbucketRepoFactResult>;
    /**
     * Clear cache - simple
     */
    clearCache(): Promise<void>;
    /**
     * Get system statistics
     */
    getStats(): Promise<{
        cacheSize: number;
        totalQueries: number;
        cacheHitRate: number;
        rustEngineActive: boolean;
    }>;
    /**
     * Shutdown the FACT system
     */
    shutdown(): Promise<void>;
}
/**
 * Factory function to create a FACT client with common configurations
 */
export declare const createFactClient: (config: FactSystemConfig) => FactClient;
/**
 * Create a FACT client with SQLite storage (good for development)
 */
export declare const createSQLiteFactClient: () => Promise<FactClient>;
/**
 * Create a FACT client with LanceDB storage (good for vector searches)
 */
export declare const createLanceDBFactClient: () => Promise<FactClient>;
/**
 * Create a FACT client with Kuzu graph storage (good for relationship queries)
 */
export declare const createKuzuFactClient: () => Promise<FactClient>;
//# sourceMappingURL=fact-client.d.ts.map