/**
 * @fileoverview @claude-zen/repo-analyzer - Battle-hardened repository analysis toolkit
 *
 * Professional-grade repository analysis with comprehensive metrics:
 * - Code complexity analysis using multiple battle-tested NPM tools
 * - Dependency analysis with circular dependency detection
 * - Workspace analysis supporting Nx, Bazel, Moon, Turbo, Rush, Lerna, and Nix
 * - Git repository analysis with hotspot detection
 * - Domain analysis and splitting recommendations
 * - AI-powered recommendations for improvements
 * - Multiple export formats (JSON, YAML, CSV, HTML, Markdown, PDF, GraphML, DOT)
 */
export { ComplexityAnalyzer} from './analyzers/complexity-analyzer.js';
export { DependencyAnalyzer} from './analyzers/dependency-analyzer.js';
export { GitAnalyzer} from './analyzers/git-analyzer.js';
export { WorkspaceAnalyzer} from './analyzers/workspace-analyzer.js';
export { DomainAnalyzer} from './domain/domain-analyzer.js';
export { RecommendationEngine} from './recommendations/recommendation-engine.js';
export { ReportGenerator} from './reporting/report-generator.js';
export { RepositoryAnalyzer, RepositoryAnalyzer} from './repository-analyzer.js';
export type * from './types/index.js';
export type { AnalysisOptions, AnalysisRecommendation, AnalysisResult, ComplexityMetrics, DependencyMetrics, Domain, ExportFormat, GitMetrics, RepositoryMetrics} from './types/index.js';
/**
 * Quick analysis function for simple use cases
 */
export declare function analyzeRepository(repositoryPath:string, options?:import('./types/index.js').AnalysisOptions, :any): Promise<import('./types/index.js').AnalysisResult>;
/**
 * Quick health score function
 */
export declare function getRepositoryHealthScore(repositoryPath:string, options?:import('./types/index.js').AnalysisOptions, :any): Promise<{
    score:number;
    breakdown:Record<string, number>;
    criticalIssues:string[];
}>;
/**
 * Factory function for creating repository analyzer
 */
export declare function createRepositoryAnalyzer(repositoryPath:string): Promise<import('./repository-analyzer.js').RepositoryAnalyzer>;
/**
 * Version information
 */
export declare const VERSION = "1.0.0";
/**
 * Default analysis options
 */
export declare const DEFAULT_ANALYSIS_OPTIONS:import('./types/index.js').AnalysisOptions;
export default RepositoryAnalyzer;
//# sourceMappingURL=index.d.ts.map