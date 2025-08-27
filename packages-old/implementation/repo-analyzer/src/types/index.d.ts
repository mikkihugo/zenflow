/**
 * @fileoverview Battle-hardened repository analysis types
 * Professional-grade types for comprehensive repository analysis
 */
export interface RepositoryMetrics {
    id: string;
    name: string;
    path: string;
    totalFiles: number;
    totalLines: number;
    languages: Record<string, number>;
    complexity: ComplexityMetrics;
    dependencies: DependencyMetrics;
    domains: Domain[];
    gitMetrics?: GitMetrics;
    analysisTimestamp: Date;
}
export interface ComplexityMetrics {
    cyclomatic: number;
    halstead: HalsteadMetrics;
    maintainabilityIndex: number;
    technicalDebt: number;
    codeSmells: CodeSmell[];
    hotspots: ComplexityHotspot[];
}
export interface HalsteadMetrics {
    vocabulary: number;
    length: number;
    difficulty: number;
    effort: number;
    time: number;
    bugs: number;
    volume: number;
}
export interface CodeSmell {
    type: 'long-method';
    ': any;
}
export interface ComplexityHotspot {
    file: string;
    function?: string;
    class?: string;
    complexity: number;
    lines: number;
    maintainabilityIndex: number;
    priority: 'low' | 'medium' | 'high' | 'urgent;;
}
export interface DependencyMetrics {
    totalDependencies: number;
    directDependencies: number;
    transitiveDependencies: number;
    circularDependencies: CircularDependency[];
    dependencyGraph: DependencyGraph;
    coupling: CouplingMetrics;
    cohesion: CohesionMetrics;
    stability: StabilityMetrics;
}
export interface CircularDependency {
    cycle: string[];
    severity: 'warning' | 'error;;
    impactScore: number;
    suggestions: string[];
}
export interface DependencyGraph {
    nodes: DependencyNode[];
    edges: DependencyEdge[];
    clusters: DependencyCluster[];
}
export interface DependencyNode {
    id: string;
    file: string;
    type: 'module' | 'component' | 'service' | 'utility' | 'test;;
    size: number;
    complexity: number;
    stability: number;
}
export interface DependencyEdge {
    from: string;
    to: string;
    weight: number;
    type: 'import' | 'require' | 'dynamic-import' | 'type-only;;
}
export interface DependencyCluster {
    id: string;
    nodes: string[];
    cohesion: number;
    coupling: number;
    domain?: string;
}
export interface CouplingMetrics {
    afferentCoupling: number;
    efferentCoupling: number;
    instability: number;
    abstractness: number;
    distance: number;
}
export interface CohesionMetrics {
    lcom: number;
    tcc: number;
    lcc: number;
}
export interface StabilityMetrics {
    stabilityIndex: number;
    changeFrequency: number;
    bugFrequency: number;
    riskScore: number;
}
export interface GitMetrics {
    totalCommits: number;
    contributors: number;
    averageCommitsPerDay: number;
    fileChangeFrequency: Record<string, number>;
    hotFiles: GitHotFile[];
    contributorStats: ContributorStats[];
    branchMetrics: BranchMetrics;
}
export interface GitHotFile {
    file: string;
    changeCount: number;
    lastChanged: Date;
    contributors: number;
    complexity: number;
    riskScore: number;
}
export interface ContributorStats {
    author: string;
    commits: number;
    linesAdded: number;
    linesDeleted: number;
    filesModified: number;
    firstCommit: Date;
    lastCommit: Date;
}
export interface BranchMetrics {
    totalBranches: number;
    activeBranches: number;
    averageBranchLifetime: number;
    mergeConflictRate: number;
}
export interface Domain {
    id: string;
    name: string;
    description: string;
    files: string[];
    dependencies: string[];
    complexity: number;
    cohesion: number;
    coupling: number;
    size: DomainSize;
    type: DomainType;
    splitRecommendation?: SplitRecommendation;
    metadata: Record<string, any>;
}
export interface DomainSize {
    files: number;
    lines: number;
    functions: number;
    classes: number;
    interfaces: number;
}
export type DomainType = 'core' | 'feature' | 'infrastructure' | 'utility' | 'api' | 'ui' | 'data' | 'test';
export interface SplitRecommendation {
    shouldSplit: boolean;
    confidence: number;
    reasons: string[];
    suggestedSplits: SuggestedSplit[];
    estimatedEffort: EffortEstimate;
    benefits: SplitBenefits;
    risks: SplitRisk[];
}
export interface SuggestedSplit {
    newDomainName: string;
    files: string[];
    rationale: string;
    complexity: number;
    dependencies: string[];
}
export interface EffortEstimate {
    hours: number;
    difficulty: 'low' | 'medium' | 'high' | 'very-high;;
    phases: EffortPhase[];
}
export interface EffortPhase {
    name: string;
    description: string;
    estimatedHours: number;
    dependencies: string[];
    risks: string[];
}
export interface SplitBenefits {
    complexityReduction: number;
    maintainabilityImprovement: number;
    testabilityImprovement: number;
    teamVelocityImprovement: number;
    deploymentRiskReduction: number;
}
export interface SplitRisk {
    type: 'data-consistency';
    ': any;
}
export interface AnalysisOptions {
    includeTests?: boolean;
    includeNodeModules?: boolean;
    maxFileSize?: number;
    excludePatterns?: string[];
    includeDotFiles?: boolean;
    analysisDepth?: 'shallow' | 'moderate' | 'deep' | 'comprehensive;;
    enableGitAnalysis?: boolean;
    enableComplexityAnalysis?: boolean;
    enableDependencyAnalysis?: boolean;
    enableDomainAnalysis?: boolean;
    complexityThresholds?: ComplexityThresholds;
    performanceMode?: 'fast' | 'balanced' | 'thorough;;
}
export interface ComplexityThresholds {
    cyclomaticComplexity: number;
    maintainabilityIndex: number;
    linesOfCode: number;
    parameters: number;
    nestingDepth: number;
}
export interface AnalysisResult {
    repository: RepositoryMetrics;
    domains: Domain[];
    recommendations: AnalysisRecommendation[];
    summary: AnalysisSummary;
    exportOptions: ExportFormat[];
}
export interface AnalysisRecommendation {
    type: 'split-domain';
    ': any;
}
export interface ActionItem {
    description: string;
    type: 'code-change';
    ': any;
}
export interface AnalysisSummary {
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    criticalIssues: number;
    highPriorityRecommendations: number;
    estimatedImprovementEffort: number;
    riskAssessment: RiskAssessment;
}
export interface RiskAssessment {
    technicalDebtRisk: 'low' | 'medium' | 'high' | 'critical;;
    maintainabilityRisk: 'low' | 'medium' | 'high' | 'critical;;
    scalabilityRisk: 'low' | 'medium' | 'high' | 'critical;;
    teamVelocityRisk: 'low' | 'medium' | 'high' | 'critical;;
}
export type ExportFormat = 'json';
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    score: number;
}
export interface ValidationError {
    type: string;
    severity: 'error' | 'warning';
    message: string;
    file?: string;
    line?: number;
    suggestion?: string;
}
export interface ValidationWarning extends ValidationError {
    severity: 'warning;;
}
//# sourceMappingURL=index.d.ts.map