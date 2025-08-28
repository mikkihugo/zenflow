/**
 * Enhanced GitHub Repository Analysis
 * Integrates DeepCode's sophisticated repository intelligence and quality assessment') *
 * Adds advanced capabilities from DeepCode's Reference Intelligence Agent: ')' * - Repository structure understanding
 * - Code quality assessment and metrics
 * - Solution pattern discovery
 * - Integration complexity analysis
 * - Compatibility assessment
 */
import type { RepositoryMetrics} from './types/index.js';
/**
 * Enhanced repository analysis result with DeepCode capabilities
 */
export interface EnhancedRepositoryAnalysis extends RepositoryMetrics {
    repositoryIntelligence:{
        structureComplexity:number;
        domainRelevance:number;
        implementationQuality:number;
        integrationComplexity:number;
        maintenanceHealth:number;
};
    solutionPatterns:{
        architecturalPatterns:string[];
        designPatterns:string[];
        frameworkPatterns:string[];
        integrationPatterns:string[];
        testingPatterns:string[];
};
    qualityMetrics:{
        codeQualityScore:number;
        testCoverage:number;
        documentationQuality:number;
        apiDesignQuality:number;
        performanceIndicators:string[];
};
    compatibilityAssessment:{
        languageVersions:Record<string, string>;
        frameworkVersions:Record<string, string>;
        dependencyCompatibility:number;
        platformSupport:string[];
        migrationComplexity:number;
};
    usageIntelligence:{
        popularityScore:number;
        communityHealth:number;
        lastMaintained:Date;
        activeContributors:number;
        issueResolutionTime:number;
};
}
/**
 * GitHub repository discovery and analysis options
 */
export interface GitHubDiscoveryOptions {
    query:string;
    language?:string;
    minStars?:number;
    maxAge?:number;
    includeArchived?:boolean;
    topic?:string;
    maxResults?:number;
}
/**
 * Repository relevance scoring criteria
 */
export interface RelevanceScoring {
    queryMatch:number;
    codeRelevance:number;
    functionalRelevance:number;
    architecturalRelevance:number;
    recencyBonus:number;
}
/**
 * Enhanced GitHub Repository Analyzer
 * Integrates DeepCode's repository intelligence capabilities') */
export declare class EnhancedGitHubAnalyzer {
    ':any;
    constructor();
    /**
     * Discover relevant repositories based on search criteria
     * Implements DeepCode's intelligent repository discovery')     */
    discoverRelevantRepositories(options:GitHubDiscoveryOptions): Promise<{
        repositories:Array<{
            url:string;
            name:string;
            description:string;
            relevanceScore:RelevanceScoring;
            preliminaryMetrics:Partial<EnhancedRepositoryAnalysis>;
}>;
        totalSearched:number;
        relevantFound:number;
        averageRelevance:number;
        searchTime:number;
}>;
}
/**
 * Factory function for creating Enhanced GitHub Analyzer
 */
export declare function createEnhancedGitHubAnalyzer(githubToken?:string): EnhancedGitHubAnalyzer;
export default EnhancedGitHubAnalyzer;
//# sourceMappingURL=enhanced-github-analysis.d.ts.map