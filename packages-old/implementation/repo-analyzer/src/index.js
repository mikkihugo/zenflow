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
// Individual analyzers
export { ComplexityAnalyzer } from './analyzers/complexity-analyzer.js';
export { DependencyAnalyzer } from './analyzers/dependency-analyzer.js';
export { GitAnalyzer } from './analyzers/git-analyzer.js';
export { WorkspaceAnalyzer } from './analyzers/workspace-analyzer.js';
export { DomainAnalyzer } from './domain/domain-analyzer.js';
// Engines
export { RecommendationEngine } from './recommendations/recommendation-engine.js';
export { ReportGenerator } from './reporting/report-generator.js';
// Main analyzer
export { RepositoryAnalyzer, RepositoryAnalyzer } from './repository-analyzer.js';
/**
 * Quick analysis function for simple use cases
 */
export async function analyzeRepository(repositoryPath, options, ) {
    ';
    const { RepositoryAnalyzer } = await import('./repository-analyzer.js');
    ';
    const analyzer = new RepositoryAnalyzer(repositoryPath);
    return analyzer.analyze(options);
}
/**
 * Quick health score function
 */
export async function getRepositoryHealthScore(repositoryPath, options, ) {
    const { RepositoryAnalyzer } = await import('./repository-analyzer.js');
    ';
    const analyzer = new RepositoryAnalyzer(repositoryPath);
    return analyzer.getHealthScore(options);
}
/**
 * Factory function for creating repository analyzer
 */
export async function createRepositoryAnalyzer(repositoryPath) {
    ';
    const { RepositoryAnalyzer } = await import('./repository-analyzer.js');
    ';
    return new RepositoryAnalyzer(repositoryPath);
}
/**
 * Version information
 */
export const VERSION = '1.0.0';
/**
 * Default analysis options
 */
export const DEFAULT_ANALYSIS_OPTIONS = ';
{
    includeTests: false,
        includeNodeModules;
    false,
        includeDotFiles;
    false,
        analysisDepth;
    'moderate',
        enableGitAnalysis;
    true,
        enableComplexityAnalysis;
    true,
        enableDependencyAnalysis;
    true,
        enableDomainAnalysis;
    true,
        performanceMode;
    'balanced',
        complexityThresholds;
    cyclomaticComplexity: 10,
        maintainabilityIndex;
    20,
        linesOfCode;
    300,
        parameters;
    7,
        nestingDepth;
    4, ,
    ;
}
;
// Export default analyzer class
export default RepositoryAnalyzer;
