/**
 * @fileoverview Git repository analyzer using simple-git
 * Advanced git metrics, hotspot detection, and contributor analysis
 */
import type { AnalysisOptions, GitMetrics } from '../types/index.js';
export declare class GitAnalyzer {
    private logger;
    ': any;
    private git;
    constructor(repoPath: string);
    /**
     * Analyze complete git repository metrics
     */
    analyzeRepository(options?: AnalysisOptions): Promise<GitMetrics>;
    /**
     * Get commit history with optional filtering
     */
    private getCommitHistory;
    /**
     * Get repository status
     */
    private getRepositoryStatus;
    /**
     * Analyze branch metrics
     */
    private analyzeBranches;
    /**
     * Analyze contributor statistics
     */
    private analyzeContributors;
    /**
     * Identify hot files (frequently changed files)
     */
    private identifyHotFiles;
    /**
     * Get commit statistics (lines added/deleted, files modified)
     */
    private getCommitStats;
    /**
     * Get files modified in a commit
     */
    private getCommitFiles;
    /**
     * Calculate average commits per day
     */
    private calculateAverageCommitsPerDay;
    /**
     * Calculate file change frequency
     */
    private calculateFileChangeFrequency;
    /**
     * Count active branches (branches with recent commits)
     */
    private countActiveBranches;
    /**
     * Calculate average branch lifetime
     */
    private calculateAverageBranchLifetime;
    /**
     * Calculate merge conflict rate
     */
    private calculateMergeConflictRate;
    /**
     * Estimate file complexity (simple heuristic)
     */
    private estimateFileComplexity;
    /**
     * Calculate risk score for a file
     */
    private calculateRiskScore;
    /**
     * Analyze code churn (lines added/deleted over time)
     */
    analyzeCodeChurn(options?: AnalysisOptions): Promise<{
        totalChurn: number;
        churnByFile: Record<string, number>;
        churnByAuthor: Record<string, number>;
        churnTrend: Array<{
            date: string;
            churn: number;
        }>;
    }>;
    /**
     * Analyze commit patterns (time of day, day of week)
     */
    analyzeCommitPatterns(options?: AnalysisOptions): Promise<{
        hourlyDistribution: Record<number, number>;
        dailyDistribution: Record<string, number>;
        monthlyDistribution: Record<string, number>;
    }>;
    /**
     * Find potential refactoring opportunities based on git history
     */
    findRefactoringOpportunities(options?: AnalysisOptions): Promise<Array<{
        file: string;
        reason: string;
        confidence: number;
        metrics: Record<string, any>;
    }>>;
    private getSettledValue;
    private getEmptyBranchMetrics;
    /**
     * Perform enhanced branch lifetime analysis
     */
    private performBranchLifetimeAnalysis;
    /**
     * Perform enhanced merge conflict analysis
     */
    private performMergeConflictAnalysis;
}
//# sourceMappingURL=git-analyzer.d.ts.map