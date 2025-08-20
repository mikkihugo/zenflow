/**
 * @fileoverview FACT System Types
 *
 * TypeScript type definitions for the FACT (Fast Augmented Context Tools) system.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import type { DatabaseAccess } from '@claude-zen/foundation';
/**
 * Configuration for the FACT system
 */
export interface FactSystemConfig {
    /** Database access via foundation package */
    database: DatabaseAccess;
    /** Whether to use the Rust engine for high-performance processing */
    useRustEngine?: boolean;
    /** Cache size for fact storage */
    cacheSize?: number;
    /** Cache TTL in milliseconds */
    cacheTTL?: number;
    /** Enable GitHub GraphQL API integration */
    enableGitHubGraphQL?: boolean;
    /** Enable real-time API calls (vs cache-only mode) */
    enableRealTimeAPIs?: boolean;
    /** Enable Hex.pm (Elixir package manager) integration */
    enableHexPM?: boolean;
    /** Enable rule validation and automated compliance checking */
    enableRuleValidation?: boolean;
    /** Enable AI-powered inference and reasoning capabilities */
    enableInference?: boolean;
}
/**
 * SQL-based fact search query (like ruvnet/FACT)
 * Searches local facts database for valid resources
 */
export interface FactSearchQuery {
    /** SQL-like query against facts database */
    query: string;
    /** Fact types to search within */
    factTypes?: ('npm-package' | 'github-repo' | 'security-advisory' | 'hex-package' | 'api-docs' | 'rust-crate' | 'go-module' | 'perl-package' | 'java-package' | 'gitlab-repo' | 'bitbucket-repo')[];
    /** Data sources to search within */
    sources?: string[];
    /** Maximum results to return */
    limit?: number;
    /** Include cached results */
    includeCached?: boolean;
}
/**
 * Direct fact query for retrieving specific structured data
 */
export interface FactQuery {
    /** Fact type to query (npm-package, github-repo, security-advisory, hex-package, rust-crate, go-module, perl-package, java-package, gitlab-repo, bitbucket-repo) */
    factType: 'npm-package' | 'github-repo' | 'security-advisory' | 'hex-package' | 'api-docs' | 'rust-crate' | 'go-module' | 'perl-package' | 'java-package' | 'gitlab-repo' | 'bitbucket-repo';
    /** Specific identifier (package name, repo name, CVE ID, etc.) */
    identifier: string;
    /** Optional version for packages */
    version?: string;
    /** Additional parameters for specific fact types */
    parameters?: Record<string, any>;
    /** Include cached results */
    includeCached?: boolean;
    /** Cache TTL override in milliseconds */
    cacheTTL?: number;
}
/**
 * SQL search result pointing to valid resources (like ruvnet/FACT)
 * Points to actual NPM packages, GitHub repos, etc. - no summaries
 */
export interface FactSearchResult {
    /** Type of resource this points to */
    factType: 'npm-package' | 'github-repo' | 'security-advisory' | 'hex-package' | 'api-docs' | 'rust-crate' | 'go-module' | 'perl-package' | 'java-package' | 'gitlab-repo' | 'bitbucket-repo';
    /** Resource identifier (package name, repo owner/name, CVE ID) */
    identifier: string;
    /** Optional version for packages */
    version?: string;
    /** Direct link to resource */
    resourceUrl: string;
    /** Match score from SQL query */
    score: number;
    /** When this resource was indexed */
    indexedAt: number;
    /** Quick metadata for display */
    metadata: {
        title: string;
        description?: string;
        [key: string]: any;
    };
}
/**
 * Base fact result from deterministic data sources
 * These are the actual structured facts about resources
 */
export interface FactResult {
    /** Source of the fact (npm-api, github-api, nvd-api, hex-api) */
    source: string;
    /** Type of fact (matches identifier type) */
    factType: string;
    /** Unique identifier for this fact */
    identifier: string;
    /** Structured fact data */
    data: NPMFactResult | GitHubFactResult | SecurityFactResult | HexFactResult | APIDocumentationFactResult | RustCrateFactResult | GoModuleFactResult | PerlPackageFactResult | JavaPackageFactResult | GitLabRepoFactResult | BitbucketRepoFactResult;
    /** Data freshness indicator */
    isCached: boolean;
    /** Cache timestamp */
    cacheTimestamp?: number;
    /** Time-to-live for this fact */
    ttl: number;
    /** Processing timestamp */
    timestamp: number;
}
/**
 * NPM package fact result
 */
export interface NPMFactResult {
    /** Package name */
    name: string;
    /** Package version */
    version: string;
    /** Package description */
    description: string;
    /** Dependencies list */
    dependencies: string[];
    /** Dev dependencies list */
    devDependencies: string[];
    /** Repository URL */
    repository?: string;
    /** Homepage URL */
    homepage?: string;
    /** License */
    license?: string;
    /** Download statistics */
    downloads?: {
        weekly: number;
        monthly: number;
        yearly: number;
    };
    /** Package maintainers */
    maintainers: string[];
    /** Package keywords */
    keywords: string[];
    /** Published date */
    publishedAt: string;
    /** Result confidence */
    confidence: number;
    /** Source of data */
    source: string;
    /** Timestamp */
    timestamp: number;
}
/**
 * GitHub repository fact result
 */
export interface GitHubFactResult {
    /** Repository owner */
    owner: string;
    /** Repository name */
    repo: string;
    /** Full repository name (owner/repo) */
    fullName: string;
    /** Repository description */
    description: string;
    /** Repository URL */
    url: string;
    /** Primary language */
    language: string;
    /** Language breakdown */
    languages: Record<string, number>;
    /** Star count */
    stars: number;
    /** Fork count */
    forks: number;
    /** Open issues count */
    openIssues: number;
    /** License */
    license?: string;
    /** Repository topics */
    topics: string[];
    /** Created date */
    createdAt: string;
    /** Last updated date */
    updatedAt: string;
    /** Last pushed date */
    pushedAt: string;
    /** Whether repository is archived */
    archived: boolean;
    /** Whether repository is private */
    private: boolean;
    /** Default branch */
    defaultBranch: string;
    /** Recent releases */
    releases: Array<{
        name: string;
        tagName: string;
        publishedAt: string;
        prerelease: boolean;
    }>;
    /** Result confidence */
    confidence: number;
    /** Source of data */
    source: string;
    /** Timestamp */
    timestamp: number;
}
/**
 * Security advisory fact result
 */
export interface SecurityFactResult {
    /** CVE ID */
    id: string;
    /** Vulnerability description */
    description: string;
    /** Severity level */
    severity: 'low' | 'medium' | 'high' | 'critical';
    /** CVSS score */
    score: number;
    /** CVSS vector string */
    vector: string;
    /** Published date */
    published: string;
    /** Last modified date */
    lastModified: string;
    /** Reference URLs */
    references: string[];
    /** Affected products */
    affectedProducts: string[];
    /** Mitigation advice */
    mitigation?: string;
    /** Result confidence */
    confidence: number;
    /** Source of data */
    source: string;
    /** Timestamp */
    timestamp: number;
}
/**
 * Hex (Elixir) package fact result
 */
export interface HexFactResult {
    /** Package name */
    name: string;
    /** Package version */
    version: string;
    /** Package description */
    description: string;
    /** Package owner/organization */
    owner: string;
    /** Repository URL */
    repository?: string;
    /** Homepage URL */
    homepage?: string;
    /** License */
    license?: string;
    /** Download statistics */
    downloads?: {
        total: number;
        recent: number;
        day: number;
        week: number;
    };
    /** Package maintainers */
    maintainers: string[];
    /** Elixir version requirement */
    elixirVersion?: string;
    /** OTP version requirement */
    otpVersion?: string;
    /** Dependencies list */
    dependencies: Array<{
        name: string;
        requirement: string;
        optional: boolean;
    }>;
    /** Package documentation URL */
    documentation?: string;
    /** Published date */
    publishedAt: string;
    /** Last updated date */
    updatedAt: string;
    /** Package configuration */
    config?: {
        consolidateProtocols?: boolean;
        buildEmbedded?: boolean;
        startPermanent?: boolean;
    };
    /** Result confidence */
    confidence: number;
    /** Source of data */
    source: string;
    /** Timestamp */
    timestamp: number;
}
/**
 * API documentation fact result
 */
export interface APIDocumentationFactResult {
    /** API name */
    name: string;
    /** Base URL */
    baseUrl: string;
    /** Authentication method */
    authentication: string;
    /** API endpoints */
    endpoints: Array<{
        path: string;
        method: string;
        description: string;
        parameters?: Record<string, any>;
    }>;
    /** Specific endpoint (if requested) */
    endpoint?: string;
    /** Rate limiting info */
    rateLimit?: string;
    /** API documentation URL */
    documentation?: string;
    /** Available SDKs */
    sdks?: string[];
    /** Result confidence */
    confidence: number;
    /** Source of data */
    source: string;
    /** Timestamp */
    timestamp: number;
}
/**
 * FACT system statistics
 */
export interface FactSystemStats {
    /** Cache size */
    cacheSize: number;
    /** Total queries processed */
    totalQueries: number;
    /** Cache hit rate (0-1) */
    cacheHitRate: number;
    /** Whether Rust engine is active */
    rustEngineActive: boolean;
    /** Performance metrics */
    performance?: {
        averageQueryTime: number;
        rustQueryTime?: number;
        typescriptQueryTime?: number;
    };
}
/**
 * Fact cache entry
 */
export interface FactCacheEntry {
    /** Cache key */
    key: string;
    /** Cached data */
    data: any;
    /** Cache timestamp */
    timestamp: number;
    /** Time to live */
    ttl: number;
    /** Access count */
    accessCount: number;
}
/**
 * Rust crate fact result (from crates.io)
 */
export interface RustCrateFactResult {
    /** Crate name */
    name: string;
    /** Crate version */
    version: string;
    /** Crate description */
    description: string;
    /** Authors */
    authors: string[];
    /** Repository URL */
    repository?: string;
    /** Homepage URL */
    homepage?: string;
    /** License */
    license?: string;
    /** Keywords */
    keywords: string[];
    /** Categories */
    categories: string[];
    /** Download statistics */
    downloads?: {
        total: number;
        recent: number;
    };
    /** Dependencies */
    dependencies: Array<{
        name: string;
        version: string;
        kind: 'normal' | 'dev' | 'build';
        optional: boolean;
    }>;
    /** Features */
    features: Record<string, string[]>;
    /** Minimum Rust version */
    rustVersion?: string;
    /** Documentation URL */
    documentation?: string;
    /** Additional documentation sites */
    docsSites?: {
        /** docs.rs URL for Rust crates */
        docsRs?: string;
        /** Repository docs */
        repository?: string;
        /** Homepage docs */
        homepage?: string;
    };
    /** Published date */
    publishedAt: string;
    /** Last updated */
    updatedAt: string;
    /** Result confidence */
    confidence: number;
    /** Source of data */
    source: string;
    /** Timestamp */
    timestamp: number;
}
/**
 * Go module fact result (from pkg.go.dev)
 */
export interface GoModuleFactResult {
    /** Module path */
    path: string;
    /** Module version */
    version: string;
    /** Module description */
    description: string;
    /** License */
    license?: string;
    /** Repository URL */
    repository?: string;
    /** Homepage URL */
    homepage?: string;
    /** Go version requirement */
    goVersion?: string;
    /** Module imports */
    imports: string[];
    /** Packages in module */
    packages: Array<{
        path: string;
        name: string;
        synopsis: string;
    }>;
    /** Additional documentation sites */
    docsSites?: {
        /** pkg.go.dev URL for Go modules */
        pkgGoDev?: string;
        /** Repository docs */
        repository?: string;
        /** Homepage docs */
        homepage?: string;
    };
    /** Published date */
    publishedAt: string;
    /** Result confidence */
    confidence: number;
    /** Source of data */
    source: string;
    /** Timestamp */
    timestamp: number;
}
/**
 * Perl package fact result (from CPAN)
 */
export interface PerlPackageFactResult {
    /** Package name */
    name: string;
    /** Package version */
    version: string;
    /** Package description */
    description: string;
    /** Author */
    author: string;
    /** Author email */
    authorEmail?: string;
    /** License */
    license?: string;
    /** Repository URL */
    repository?: string;
    /** Homepage URL */
    homepage?: string;
    /** Dependencies */
    dependencies: Array<{
        module: string;
        version?: string;
        phase: 'configure' | 'build' | 'test' | 'runtime';
        relationship: 'requires' | 'recommends' | 'suggests';
    }>;
    /** Keywords */
    keywords: string[];
    /** Abstract */
    abstract?: string;
    /** Published date */
    publishedAt: string;
    /** Result confidence */
    confidence: number;
    /** Source of data */
    source: string;
    /** Timestamp */
    timestamp: number;
}
/**
 * Java package fact result (from Maven Central)
 */
export interface JavaPackageFactResult {
    /** Group ID */
    groupId: string;
    /** Artifact ID */
    artifactId: string;
    /** Version */
    version: string;
    /** Package name (groupId:artifactId) */
    name: string;
    /** Description */
    description: string;
    /** License */
    license?: string;
    /** Repository URL */
    repository?: string;
    /** Homepage URL */
    homepage?: string;
    /** Packaging type */
    packaging: string;
    /** Dependencies */
    dependencies: Array<{
        groupId: string;
        artifactId: string;
        version: string;
        scope: 'compile' | 'provided' | 'runtime' | 'test' | 'system';
        optional: boolean;
    }>;
    /** Java version requirement */
    javaVersion?: string;
    /** Additional documentation sites */
    docsSites?: {
        /** Javadoc.io URL for Java packages */
        javadocIo?: string;
        /** Repository docs */
        repository?: string;
        /** Homepage docs */
        homepage?: string;
    };
    /** Published date */
    publishedAt: string;
    /** Last updated */
    updatedAt: string;
    /** Result confidence */
    confidence: number;
    /** Source of data */
    source: string;
    /** Timestamp */
    timestamp: number;
}
/**
 * GitLab repository fact result
 */
export interface GitLabRepoFactResult {
    /** Repository ID */
    id: number;
    /** Repository name */
    name: string;
    /** Repository path */
    path: string;
    /** Full path with namespace */
    pathWithNamespace: string;
    /** Repository description */
    description: string;
    /** Repository URL */
    url: string;
    /** SSH URL */
    sshUrl: string;
    /** HTTP URL */
    httpUrl: string;
    /** Primary language */
    language?: string;
    /** Star count */
    stars: number;
    /** Fork count */
    forks: number;
    /** Open issues count */
    openIssues: number;
    /** Visibility level */
    visibility: 'private' | 'internal' | 'public';
    /** Repository topics */
    topics: string[];
    /** Default branch */
    defaultBranch: string;
    /** Created date */
    createdAt: string;
    /** Last updated date */
    updatedAt: string;
    /** Last activity date */
    lastActivityAt: string;
    /** Archived status */
    archived: boolean;
    /** Avatar URL */
    avatarUrl?: string;
    /** Namespace */
    namespace: {
        id: number;
        name: string;
        path: string;
        kind: string;
        fullPath: string;
    };
    /** Result confidence */
    confidence: number;
    /** Source of data */
    source: string;
    /** Timestamp */
    timestamp: number;
}
/**
 * Bitbucket repository fact result
 */
export interface BitbucketRepoFactResult {
    /** Repository UUID */
    uuid: string;
    /** Repository name */
    name: string;
    /** Full repository name (workspace/name) */
    fullName: string;
    /** Repository description */
    description: string;
    /** Repository URL */
    url: string;
    /** Clone URLs */
    cloneUrls: {
        https: string;
        ssh: string;
    };
    /** Primary language */
    language?: string;
    /** Repository size in bytes */
    size: number;
    /** Whether repository is private */
    private: boolean;
    /** Fork policy */
    forkPolicy: 'allow_forks' | 'no_public_forks' | 'no_forks';
    /** Has issues enabled */
    hasIssues: boolean;
    /** Has wiki enabled */
    hasWiki: boolean;
    /** Project information */
    project?: {
        key: string;
        name: string;
        uuid: string;
    };
    /** Workspace information */
    workspace: {
        uuid: string;
        name: string;
        slug: string;
    };
    /** Main branch */
    mainBranch: {
        name: string;
        type: string;
    };
    /** Created date */
    createdAt: string;
    /** Last updated date */
    updatedAt: string;
    /** Result confidence */
    confidence: number;
    /** Source of data */
    source: string;
    /** Timestamp */
    timestamp: number;
}
export type FactSourceType = 'npm' | 'github' | 'rust' | 'go' | 'api' | 'security';
export interface FactProcessingOptions {
    parallel?: boolean;
    timeout?: number;
    retries?: number;
    cacheResults?: boolean;
}
export interface RustEngineConfig {
    enabled: boolean;
    maxWorkers?: number;
    memoryLimit?: number;
    wasmPath?: string;
}
//# sourceMappingURL=types.d.ts.map