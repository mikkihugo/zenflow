/**
 * @fileoverview Live API Connector for FACT System
 *
 * Fetches real-time data from NPM, GitHub, Hex.pm, and security APIs
 * when facts are not cached. Implements the wait-for-fact pattern.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import type { NPMFactResult, GitHubFactResult, HexFactResult, SecurityFactResult, RustCrateFactResult, GoModuleFactResult, PerlPackageFactResult, JavaPackageFactResult, GitLabRepoFactResult, BitbucketRepoFactResult } from '../types';
/**
 * Live API connector that fetches real-time data from external APIs
 */
export declare class LiveAPIConnector {
    private readonly npmRegistryBase;
    private readonly githubApiBase;
    private readonly hexApiBase;
    private readonly nvdApiBase;
    private readonly cratesApiBase;
    private readonly goProxyBase;
    private readonly cpanApiBase;
    private readonly mavenApiBase;
    private readonly gitlabApiBase;
    private readonly bitbucketApiBase;
    /**
     * Get cache TTL based on fact type and version specificity
     * Version-specific facts: 30 days (2592000000ms)
     * Non-version-specific facts: 14 days (1209600000ms)
     */
    getCacheTTL(factType: string, hasVersion: boolean): number;
    /**
     * Fetch live NPM package data from registry
     * @param packageName - NPM package name
     * @param version - Specific version (if not provided, fetches latest stable)
     */
    fetchNPMPackage(packageName: string, version?: string): Promise<NPMFactResult>;
    /**
     * Fetch live GitHub repository data using REST API
     */
    fetchGitHubRepository(owner: string, repo: string): Promise<GitHubFactResult>;
    /**
     * Fetch live Hex package data from Hex.pm API
     */
    fetchHexPackage(packageName: string, version?: string): Promise<HexFactResult>;
    /**
     * Fetch live security advisory data from NVD
     */
    fetchSecurityAdvisory(cveId: string): Promise<SecurityFactResult>;
    /**
     * Extract clean repository URL from NPM repository field
     */
    private extractRepositoryUrl;
    /**
     * Fetch live Rust crate data from crates.io API
     */
    fetchRustCrate(crateName: string, version?: string): Promise<RustCrateFactResult>;
    /**
     * Fetch live Go module data from Go proxy and pkg.go.dev
     */
    fetchGoModule(modulePath: string, version?: string): Promise<GoModuleFactResult>;
    /**
     * Fetch live Perl package data from MetaCPAN API
     */
    fetchPerlPackage(packageName: string, version?: string): Promise<PerlPackageFactResult>;
    /**
     * Fetch live Java package data from Maven Central
     */
    fetchJavaPackage(groupId: string, artifactId: string, version?: string): Promise<JavaPackageFactResult>;
    /**
     * Fetch live GitLab repository data
     */
    fetchGitLabRepository(projectPath: string): Promise<GitLabRepoFactResult>;
    /**
     * Fetch live Bitbucket repository data
     */
    fetchBitbucketRepository(workspace: string, repoSlug: string): Promise<BitbucketRepoFactResult>;
}
/**
 * Export singleton instance
 */
export declare const liveAPIConnector: LiveAPIConnector;
//# sourceMappingURL=live-api-connector.d.ts.map