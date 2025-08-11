/**
 * @file Project-context-analyzer implementation.
 */
import { EventEmitter } from 'node:events';
interface MonorepoInfo {
    type: 'lerna' | 'nx' | 'rush' | 'pnpm' | 'yarn' | 'npm' | 'turbo' | 'bazel' | 'custom' | 'none';
    tool?: string;
    version?: string;
    workspaces?: string[];
    packages?: string[];
    confidence: number;
    configFile?: string;
    hasRootPackageJson: boolean;
    packageManager?: 'npm' | 'yarn' | 'pnpm';
}
interface ProjectContext {
    rootPath: string;
    monorepo: MonorepoInfo;
    dependencies: DependencyInfo[];
    devDependencies: DependencyInfo[];
    frameworks: DetectedFramework[];
    languages: DetectedLanguage[];
    apis: DetectedAPI[];
    currentTasks: string[];
    errorPatterns: string[];
    teamNeeds: string[];
}
interface DependencyInfo {
    name: string;
    version: string;
    type: 'runtime' | 'development' | 'peer';
    ecosystem: 'npm' | 'cargo' | 'pip' | 'go' | 'maven' | 'unknown';
    lastUpdated?: string;
    hasVulnerabilities?: boolean;
}
interface DetectedFramework {
    name: string;
    version?: string;
    confidence: number;
    usage: 'primary' | 'secondary' | 'utility';
    needsDocs: boolean;
}
interface DetectedLanguage {
    name: string;
    version?: string;
    fileCount: number;
    percentage: number;
}
interface DetectedAPI {
    name: string;
    type: 'rest' | 'graphql' | 'websocket' | 'grpc';
    endpoints: string[];
    needsAuth: boolean;
}
interface ProjectAnalyzerConfig {
    projectRoot: string;
    swarmConfig?: any;
    analysisDepth: 'shallow' | 'medium' | 'deep';
    autoUpdate: boolean;
    cacheDuration: number;
    priorityThresholds: {
        critical: number;
        high: number;
        medium: number;
    };
}
/**
 * Project Context Analyzer.
 * Analyzes project context and determines what external knowledge should be gathered.
 *
 * @example
 */
export declare class ProjectContextAnalyzer extends EventEmitter {
    private config;
    private knowledgeSwarm;
    private projectContext?;
    private knowledgeMissions;
    private lastAnalysis?;
    private contextCache;
    constructor(config: ProjectAnalyzerConfig);
    /**
     * Initialize the project context analyzer.
     */
    initialize(): Promise<void>;
    /**
     * Analyze the current project to understand what knowledge is needed.
     */
    analyzeProjectContext(): Promise<ProjectContext>;
    /**
     * Detect if the project is a monorepo and what type.
     *
     * @param context
     */
    private detectMonorepo;
    /**
     * Analyze monorepo structure in detail.
     *
     * @param context
     */
    private analyzeMonorepoStructure;
    /**
     * Analyze Bazel workspace structure for comprehensive monorepo understanding.
     *
     * @param context - Project context to populate with Bazel information.
     */
    private analyzeBazelWorkspace;
    /**
     * Parse WORKSPACE file for external dependencies and configuration.
     * Also supports modern MODULE.bazel files (Bzlmod).
     *
     * @param rootPath
     */
    private parseBazelWorkspace;
    /**
     * Discover all BUILD files and parse targets.
     *
     * @param rootPath
     */
    private discoverBazelTargets;
    /**
     * Parse a BUILD file to extract targets.
     *
     * @param content
     * @param packagePath
     */
    private parseBazelBuildFile;
    /**
     * Extract a Bazel rule block from content starting at a position.
     *
     * @param content
     * @param startPos
     */
    private extractBazelRuleBlock;
    /**
     * Parse target attributes from a rule block.
     *
     * @param ruleBlock
     * @param ruleType
     * @param packagePath
     */
    private parseTargetAttributes;
    /**
     * Extract unique packages from targets.
     *
     * @param targets
     */
    private extractBazelPackages;
    /**
     * Analyze target dependencies for domain mapping.
     *
     * @param rootPath
     * @param targets
     */
    private analyzeBazelDependencies;
    /**
     * Fallback basic package discovery for Bazel workspaces.
     *
     * @param rootPath
     */
    private discoverBazelPackagesBasic;
    /**
     * Run Bazel query for accurate dependency analysis.
     * This provides the ground truth dependency graph compared to BUILD file parsing.
     *
     * @param rootPath
     */
    private runBazelQuery;
    /**
     * Parse targets from Bazel query --output=build.
     *
     * @param buildOutput
     */
    private parseBazelQueryTargets;
    /**
     * Parse dependencies from Bazel query --output=graph.
     *
     * @param graphOutput
     */
    private parseBazelQueryDependencies;
    /**
     * Extract package name from Bazel target label.
     *
     * @param targetLabel
     */
    private extractPackageFromTarget;
    /**
     * Analyze .bzl files for custom rules and macros.
     * This provides insights into custom build logic and architectural patterns.
     *
     * @param rootPath
     */
    private analyzeBzlFiles;
    /**
     * Extract Starlark function block starting from a position.
     *
     * @param content
     * @param startIndex
     */
    private extractStarlarkFunctionBlock;
    /**
     * Extract parameters from Starlark function definition.
     *
     * @param functionBlock
     */
    private extractStarlarkParameters;
    /**
     * Extract rules used within a Starlark macro.
     *
     * @param macroBlock
     */
    private extractUsedRules;
    /**
     * Parse MODULE.bazel file for Bzlmod module system.
     *
     * @param moduleContent
     */
    private parseModuleBazel;
    /**
     * Extract language and toolchain information from Bzlmod dependencies.
     *
     * @param dependencies
     * @param result
     * @param result.languages
     * @param result.toolchains
     */
    private extractLanguagesFromModuleDeps;
    /**
     * Generate knowledge gathering missions based on project context.
     */
    generateKnowledgeMissions(): Promise<void>;
    /**
     * Execute knowledge gathering missions through the swarm.
     *
     * @param priority
     */
    executeMissions(priority?: 'critical' | 'high' | 'medium' | 'low'): Promise<void>;
    /**
     * Execute a single knowledge gathering mission.
     *
     * @param mission
     */
    private executeMission;
    /**
     * Query the knowledge base for specific information.
     *
     * @param query
     * @param context
     */
    queryKnowledge(query: string, context?: string[]): Promise<string>;
    /**
     * Analyze dependencies from package.json, Cargo.toml, etc.
     *
     * @param context
     */
    private analyzeDependencies;
    /**
     * Detect frameworks and libraries being used.
     *
     * @param context
     */
    private detectFrameworks;
    /**
     * Analyze programming languages used in the project.
     *
     * @param context
     */
    private analyzeLanguages;
    /**
     * Analyze Cargo.toml for Rust dependencies.
     *
     * @param context
     */
    private analyzeCargoToml;
    /**
     * Analyze requirements.txt for Python dependencies.
     *
     * @param context
     */
    private analyzeRequirementsTxt;
    /**
     * Detect API usage patterns.
     *
     * @param context
     */
    private detectAPIs;
    /**
     * Analyze current development context (TODOs, issues, etc.).
     *
     * @param context
     */
    private analyzeCurrentContext;
    /**
     * Determine if we should gather knowledge for a dependency.
     *
     * @param dep
     */
    private shouldGatherKnowledge;
    /**
     * Create a dependency-focused knowledge gathering mission.
     *
     * @param dep
     */
    private createDependencyMission;
    /**
     * Create a framework-focused knowledge gathering mission.
     *
     * @param framework
     */
    private createFrameworkMission;
    /**
     * Create an API-focused knowledge gathering mission.
     *
     * @param api
     */
    private createAPIMission;
    /**
     * Create a security-focused knowledge gathering mission.
     *
     * @param vulnDeps
     */
    private createSecurityMission;
    /**
     * Create a performance-focused knowledge gathering mission.
     */
    private createPerformanceMission;
    /**
     * Create a best practices knowledge gathering mission.
     */
    private createBestPracticesMission;
    /**
     * Create an ad-hoc mission for immediate queries.
     *
     * @param query
     * @param context
     */
    private createAdHocMission;
    /**
     * Get priority weight for sorting.
     *
     * @param priority
     */
    private getPriorityWeight;
    /**
     * Search cached knowledge in context cache.
     *
     * @param query
     * @param context
     */
    private searchCachedKnowledge;
    /**
     * Format cached knowledge for presentation.
     *
     * @param knowledge
     */
    private formatCachedKnowledge;
    /**
     * Store knowledge in context cache.
     *
     * @param mission
     * @param result
     */
    private storeKnowledgeInCache;
    /**
     * Start background context monitoring.
     */
    private startContextMonitoring;
    /**
     * Get current system status.
     */
    getStatus(): {
        projectContext: ProjectContext | undefined;
        totalMissions: number;
        pendingMissions: number;
        completedMissions: number;
        failedMissions: number;
        lastAnalysis: Date | undefined;
        swarmStatus: string;
    };
    /**
     * Get monorepo detection results.
     */
    getMonorepoInfo(): MonorepoInfo | null;
    /**
     * Check if project is a monorepo with high confidence.
     *
     * @param confidenceThreshold
     */
    isMonorepo(confidenceThreshold?: number): boolean;
    /**
     * Shutdown the system.
     */
    shutdown(): Promise<void>;
}
export default ProjectContextAnalyzer;
export type { MonorepoInfo, ProjectContext };
//# sourceMappingURL=project-context-analyzer.d.ts.map