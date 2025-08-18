/**
 * @fileoverview FACT Bridge - TypeScript to Rust Bridge
 *
 * Bridges TypeScript coordination layer with high-performance Rust fact processing engine.
 * Handles WASM loading, N-API bindings, and fallback to TypeScript implementations.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import { DatabaseAccess } from '@claude-zen/foundation';
import type { FactSearchQuery, FactSearchResult, FactQuery, FactResult, GitHubFactResult, NPMFactResult, SecurityFactResult, HexFactResult, APIDocumentationFactResult, RustCrateFactResult, GoModuleFactResult, PerlPackageFactResult, JavaPackageFactResult, GitLabRepoFactResult, BitbucketRepoFactResult } from './types';
/**
 * Bridge between TypeScript and Rust fact processing engine
 */
export declare class FactBridge {
    private rustEngine?;
    private database;
    private useRustEngine;
    private initialized;
    constructor(config: {
        useRustEngine: boolean;
        database: DatabaseAccess;
    });
    /**
     * Initialize the bridge and load Rust engine if enabled
     */
    initialize(): Promise<void>;
    /**
     * SQL search against facts database (points to valid resources)
     */
    searchFacts(query: FactSearchQuery): Promise<FactSearchResult[]>;
    /**
     * Get a specific fact using deterministic lookup
     */
    getFact(query: FactQuery): Promise<FactResult>;
    /**
     * Get NPM package facts
     */
    getNPMFacts(packageName: string, version?: string): Promise<NPMFactResult>;
    /**
     * Get GitHub repository facts using GraphQL
     */
    getGitHubFacts(owner: string, repo: string): Promise<GitHubFactResult>;
    /**
     * Get security advisory facts
     */
    getSecurityFacts(cveId: string): Promise<SecurityFactResult>;
    /**
     * Get Hex (Elixir package manager) facts
     */
    getHexFacts(packageName: string, version?: string): Promise<HexFactResult>;
    /**
     * Get API documentation facts (TypeScript only for now)
     */
    getAPIDocsFacts(apiName: string, endpoint?: string): Promise<APIDocumentationFactResult>;
    /**
     * Get Rust crate facts
     */
    getRustCrateFacts(crateName: string, version?: string): Promise<RustCrateFactResult>;
    /**
     * Get Go module facts
     */
    getGoModuleFacts(modulePath: string, version?: string): Promise<GoModuleFactResult>;
    /**
     * Get Perl package facts
     */
    getPerlPackageFacts(packageName: string, version?: string): Promise<PerlPackageFactResult>;
    /**
     * Get Java package facts
     */
    getJavaPackageFacts(groupId: string, artifactId: string, version?: string): Promise<JavaPackageFactResult>;
    /**
     * Get GitLab repository facts
     */
    getGitLabRepoFacts(projectPath: string): Promise<GitLabRepoFactResult>;
    /**
     * Get Bitbucket repository facts
     */
    getBitbucketRepoFacts(workspace: string, repoSlug: string): Promise<BitbucketRepoFactResult>;
    /**
     * Get system statistics
     */
    getStats(): Promise<{
        cacheSize: number;
        totalQueries: number;
        cacheHitRate: number;
    }>;
    /**
     * Load Rust engine via WASM or N-API
     */
    private loadRustEngine;
    /**
     * TypeScript SQL search against facts database
     */
    private searchFactsTypeScript;
    /**
     * Simple fact retrieval - fast query
     */
    private getFactTypeScript;
    /**
     * Fast fact collection
     */
    private collectFactData;
    /**
     * NPM facts - direct API call
     */
    private getNPMFactsTypeScript;
    /**
     * GitHub facts - direct API call
     */
    private getGitHubFactsTypeScript;
    /**
     * Security facts - direct API call
     */
    private getSecurityFactsTypeScript;
    /**
     * Hex facts - direct API call
     */
    private getHexFactsTypeScript;
    /**
     * Rust crate facts - direct API call
     */
    private getRustCrateFactsTypeScript;
    /**
     * Go module facts - direct API call
     */
    private getGoModuleFactsTypeScript;
    /**
     * Perl package facts - direct API call
     */
    private getPerlPackageFactsTypeScript;
    /**
     * Java package facts - direct API call
     */
    private getJavaPackageFactsTypeScript;
    /**
     * GitLab repository facts - direct API call
     */
    private getGitLabRepoFactsTypeScript;
    /**
     * Bitbucket repository facts - direct API call
     */
    private getBitbucketRepoFactsTypeScript;
    /**
     * Production OpenAPI/Swagger documentation fetching
     * Fetches and parses actual swagger.json or openapi.yaml endpoints
     */
    private getAPIDocsFactsTypeScript;
    /**
     * Convert Rust search results to TypeScript format
     */
    private convertRustSearchResults;
    /**
     * Convert Rust fact result to TypeScript format
     */
    private convertRustFactResult;
    /**
     * Check if cache entry is still valid
     */
    private isCacheValid;
    /**
     * Shutdown the bridge
     */
    shutdown(): Promise<void>;
}
//# sourceMappingURL=fact-bridge.d.ts.map