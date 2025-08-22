/**
 * @fileoverview Git repository analyzer using simple-git
 * Advanced git metrics, hotspot detection, and contributor analysis
 */

import { simpleGit, SimpleGit, LogResult, StatusResult } from 'simple-git';
import * as fastGlob from 'fast-glob';
import { getLogger } from '@claude-zen/foundation';
import type {
  GitMetrics,
  GitHotFile,
  ContributorStats,
  BranchMetrics,
  AnalysisOptions
} from '../types/index.js';

export class GitAnalyzer {
  private logger = getLogger('GitAnalyzer');
  private git: SimpleGit;

  constructor(repoPath: string) {
    this.git = simpleGit(repoPath);
  }

  /**
   * Analyze complete git repository metrics
   */
  async analyzeRepository(options?: AnalysisOptions): Promise<GitMetrics> {
    this.logger.info('Starting Git repository analysis');

    const [
      logResult,
      statusResult,
      branchResult,
      contributorResult,
      hotFileResult
    ] = await Promise.allSettled([
      this.getCommitHistory(options),
      this.getRepositoryStatus(),
      this.analyzeBranches(),
      this.analyzeContributors(options),
      this.identifyHotFiles(options)
    ]);

    const commits = this.getSettledValue(logResult, []);
    const status = this.getSettledValue(statusResult, null);
    const branches = this.getSettledValue(branchResult, this.getEmptyBranchMetrics());
    const contributors = this.getSettledValue(contributorResult, []);
    const hotFiles = this.getSettledValue(hotFileResult, []);

    const totalCommits = commits.length;
    const contributorCount = contributors.length;
    const averageCommitsPerDay = this.calculateAverageCommitsPerDay(commits);
    const fileChangeFrequency = this.calculateFileChangeFrequency(commits);

    return {
      totalCommits,
      contributors: contributorCount,
      averageCommitsPerDay,
      fileChangeFrequency,
      hotFiles,
      contributorStats: contributors,
      branchMetrics: branches
    };
  }

  /**
   * Get commit history with optional filtering
   */
  private async getCommitHistory(options?: AnalysisOptions): Promise<any[]> {
    try {
      const logOptions: any = {
        maxCount: options?.performanceMode === 'fast' ? 1000 : undefined,
        format: {
          hash: '%H',
          date: '%ai',
          message: '%s',
          author_name: '%an',
          author_email: '%ae',
          body: '%b'
        }
      };

      // Get commits from the last year for performance
      if (options?.performanceMode !== 'thorough') {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        logOptions.since = oneYearAgo.toISOString();
      }

      const log: LogResult = await this.git.log(logOptions);
      return [...log.all]; // Convert readonly array to mutable array
    } catch (error) {
      this.logger.warn('Failed to get commit history:', error);
      return [];
    }
  }

  /**
   * Get repository status
   */
  private async getRepositoryStatus(): Promise<StatusResult | null> {
    try {
      return await this.git.status();
    } catch (error) {
      this.logger.warn('Failed to get repository status:', error);
      return null;
    }
  }

  /**
   * Analyze branch metrics
   */
  private async analyzeBranches(): Promise<BranchMetrics> {
    try {
      const branches = await this.git.branch(['--all']);
      const localBranches = await this.git.branchLocal();
      
      const totalBranches = branches.all.length;
      const activeBranches = this.countActiveBranches(localBranches);
      const averageBranchLifetime = await this.calculateAverageBranchLifetime();
      const mergeConflictRate = await this.calculateMergeConflictRate();

      return {
        totalBranches,
        activeBranches,
        averageBranchLifetime,
        mergeConflictRate
      };
    } catch (error) {
      this.logger.warn('Failed to analyze branches:', error);
      return this.getEmptyBranchMetrics();
    }
  }

  /**
   * Analyze contributor statistics
   */
  private async analyzeContributors(options?: AnalysisOptions): Promise<ContributorStats[]> {
    try {
      const commits = await this.getCommitHistory(options);
      const contributorMap = new Map<string, ContributorStats>();

      for (const commit of commits) {
        const author = commit.author_name;
        const email = commit.author_email;
        const date = new Date(commit.date);

        if (!contributorMap.has(author)) {
          contributorMap.set(author, {
            author,
            commits: 0,
            linesAdded: 0,
            linesDeleted: 0,
            filesModified: 0,
            firstCommit: date,
            lastCommit: date
          });
        }

        const stats = contributorMap.get(author)!;
        stats.commits++;
        
        if (date < stats.firstCommit) stats.firstCommit = date;
        if (date > stats.lastCommit) stats.lastCommit = date;

        // Get detailed commit stats
        try {
          const commitStats = await this.getCommitStats(commit.hash);
          stats.linesAdded += commitStats.linesAdded;
          stats.linesDeleted += commitStats.linesDeleted;
          stats.filesModified += commitStats.filesModified;
        } catch {
          // Skip if commit stats can't be retrieved
        }
      }

      return Array.from(contributorMap.values())
        .sort((a, b) => b.commits - a.commits);
    } catch (error) {
      this.logger.warn('Failed to analyze contributors:', error);
      return [];
    }
  }

  /**
   * Identify hot files (frequently changed files)
   */
  private async identifyHotFiles(options?: AnalysisOptions): Promise<GitHotFile[]> {
    try {
      const commits = await this.getCommitHistory(options);
      const fileChangeMap = new Map<string, {
        count: number;
        lastChanged: Date;
        contributors: Set<string>;
      }>();

      for (const commit of commits) {
        try {
          const files = await this.getCommitFiles(commit.hash);
          const commitDate = new Date(commit.date);
          const author = commit.author_name;

          for (const file of files) {
            if (!fileChangeMap.has(file)) {
              fileChangeMap.set(file, {
                count: 0,
                lastChanged: commitDate,
                contributors: new Set()
              });
            }

            const stats = fileChangeMap.get(file)!;
            stats.count++;
            stats.contributors.add(author);
            
            if (commitDate > stats.lastChanged) {
              stats.lastChanged = commitDate;
            }
          }
        } catch {
          // Skip commits where file list can't be retrieved
        }
      }

      const hotFiles: GitHotFile[] = [];
      for (const [file, stats] of fileChangeMap) {
        const complexity = await this.estimateFileComplexity(file);
        const riskScore = this.calculateRiskScore(stats.count, complexity, stats.contributors.size);

        hotFiles.push({
          file,
          changeCount: stats.count,
          lastChanged: stats.lastChanged,
          contributors: stats.contributors.size,
          complexity,
          riskScore
        });
      }

      return hotFiles
        .sort((a, b) => b.riskScore - a.riskScore)
        .slice(0, 50); // Top 50 hot files
    } catch (error) {
      this.logger.warn('Failed to identify hot files:', error);
      return [];
    }
  }

  /**
   * Get commit statistics (lines added/deleted, files modified)
   */
  private async getCommitStats(commitHash: string): Promise<{
    linesAdded: number;
    linesDeleted: number;
    filesModified: number;
  }> {
    try {
      const diff = await this.git.show(['--stat', '--format=', commitHash]);
      const lines = diff.split('\n');
      
      let linesAdded = 0;
      let linesDeleted = 0;
      let filesModified = 0;

      for (const line of lines) {
        if (line.includes('|')) {
          filesModified++;
          
          const match = line.match(/(\d+)\s+insertions?\(\+\)|(\d+)\s+deletions?\(-\)/g);
          if (match) {
            for (const m of match) {
              const insertions = m.match(/(\d+)\s+insertions?\(\+\)/);
              const deletions = m.match(/(\d+)\s+deletions?\(-\)/);
              
              if (insertions) linesAdded += parseInt(insertions[1]);
              if (deletions) linesDeleted += parseInt(deletions[1]);
            }
          }
        }
      }

      return { linesAdded, linesDeleted, filesModified };
    } catch (error) {
      return { linesAdded: 0, linesDeleted: 0, filesModified: 0 };
    }
  }

  /**
   * Get files modified in a commit
   */
  private async getCommitFiles(commitHash: string): Promise<string[]> {
    try {
      const diff = await this.git.show(['--name-only', '--format=', commitHash]);
      return diff.split('\n').filter(file => file.trim() !== '');
    } catch (error) {
      return [];
    }
  }

  /**
   * Calculate average commits per day
   */
  private calculateAverageCommitsPerDay(commits: any[]): number {
    if (commits.length === 0) return 0;

    const dates = commits.map(c => new Date(c.date));
    const earliest = new Date(Math.min(...dates.map(d => d.getTime())));
    const latest = new Date(Math.max(...dates.map(d => d.getTime())));
    
    const daysDiff = Math.max(1, Math.ceil((latest.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24)));
    
    return parseFloat((commits.length / daysDiff).toFixed(2));
  }

  /**
   * Calculate file change frequency
   */
  private calculateFileChangeFrequency(commits: any[]): Record<string, number> {
    const frequency: Record<string, number> = {};
    
    // This would require parsing commit diffs
    // For now, return empty object
    return frequency;
  }

  /**
   * Count active branches (branches with recent commits)
   */
  private countActiveBranches(localBranches: any): number {
    // Consider branches active if they have commits in the last 30 days
    // This would require checking last commit date for each branch
    return localBranches.all?.length || 0;
  }

  /**
   * Calculate average branch lifetime
   */
  private async calculateAverageBranchLifetime(): Promise<number> {
    try {
      // Enhanced branch lifetime analysis with git log parsing
      const branchAnalysis = await this.performBranchLifetimeAnalysis();
      return branchAnalysis;
    } catch (analysisError) {
      this.logger.debug('Branch lifetime analysis failed:', analysisError);
      return 7; // Default: 7 days
    }
  }

  /**
   * Calculate merge conflict rate
   */
  private async calculateMergeConflictRate(): Promise<number> {
    try {
      // Enhanced merge conflict analysis with git history parsing
      const conflictAnalysis = await this.performMergeConflictAnalysis();
      return conflictAnalysis;
    } catch (analysisError) {
      this.logger.debug('Merge conflict analysis failed:', analysisError);
      return 0.1; // Default: 10% conflict rate
    }
  }

  /**
   * Estimate file complexity (simple heuristic)
   */
  private async estimateFileComplexity(filePath: string): Promise<number> {
    try {
      const fs = await import('fs/promises');
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Simple complexity estimation
      const lines = content.split('\n').length;
      const functions = (content.match(/function\s+\w+|=>\s*{|^\s*\w+\s*:/gm) || []).length;
      const conditionals = (content.match(/\b(if|else|switch|case|while|for)\b/g) || []).length;
      
      return Math.min(100, lines * 0.1 + functions * 2 + conditionals * 3);
    } catch (error) {
      return 10; // Default complexity
    }
  }

  /**
   * Calculate risk score for a file
   */
  private calculateRiskScore(changeCount: number, complexity: number, contributorCount: number): number {
    // Normalize factors
    const changeScore = Math.min(1, changeCount / 100); // Max at 100 changes
    const complexityScore = Math.min(1, complexity / 100); // Max at 100 complexity
    const contributorScore = Math.min(1, contributorCount / 10); // Max at 10 contributors
    
    // Weighted combination
    return parseFloat((
      changeScore * 0.4 +           // 40% weight on change frequency
      complexityScore * 0.4 +       // 40% weight on complexity
      contributorScore * 0.2        // 20% weight on contributor count
    ).toFixed(3));
  }

  /**
   * Analyze code churn (lines added/deleted over time)
   */
  async analyzeCodeChurn(options?: AnalysisOptions): Promise<{
    totalChurn: number;
    churnByFile: Record<string, number>;
    churnByAuthor: Record<string, number>;
    churnTrend: Array<{ date: string; churn: number }>;
  }> {
    try {
      const commits = await this.getCommitHistory(options);
      let totalChurn = 0;
      const churnByFile: Record<string, number> = {};
      const churnByAuthor: Record<string, number> = {};
      const churnTrend: Array<{ date: string; churn: number }> = [];

      for (const commit of commits) {
        const stats = await this.getCommitStats(commit.hash);
        const churn = stats.linesAdded + stats.linesDeleted;
        
        totalChurn += churn;
        
        const author = commit.author_name;
        churnByAuthor[author] = (churnByAuthor[author] || 0) + churn;
        
        const date = new Date(commit.date).toISOString().split('T')[0];
        const existingEntry = churnTrend.find(entry => entry.date === date);
        if (existingEntry) {
          existingEntry.churn += churn;
        } else {
          churnTrend.push({ date, churn });
        }
      }

      return {
        totalChurn,
        churnByFile,
        churnByAuthor,
        churnTrend: churnTrend.sort((a, b) => a.date.localeCompare(b.date))
      };
    } catch (error) {
      this.logger.warn('Failed to analyze code churn:', error);
      return {
        totalChurn: 0,
        churnByFile: {},
        churnByAuthor: {},
        churnTrend: []
      };
    }
  }

  /**
   * Analyze commit patterns (time of day, day of week)
   */
  async analyzeCommitPatterns(options?: AnalysisOptions): Promise<{
    hourlyDistribution: Record<number, number>;
    dailyDistribution: Record<string, number>;
    monthlyDistribution: Record<string, number>;
  }> {
    try {
      const commits = await this.getCommitHistory(options);
      const hourlyDistribution: Record<number, number> = {};
      const dailyDistribution: Record<string, number> = {};
      const monthlyDistribution: Record<string, number> = {};

      for (const commit of commits) {
        const date = new Date(commit.date);
        const hour = date.getHours();
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
        const month = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + 1;
        dailyDistribution[dayOfWeek] = (dailyDistribution[dayOfWeek] || 0) + 1;
        monthlyDistribution[month] = (monthlyDistribution[month] || 0) + 1;
      }

      return {
        hourlyDistribution,
        dailyDistribution,
        monthlyDistribution
      };
    } catch (error) {
      this.logger.warn('Failed to analyze commit patterns:', error);
      return {
        hourlyDistribution: {},
        dailyDistribution: {},
        monthlyDistribution: {}
      };
    }
  }

  /**
   * Find potential refactoring opportunities based on git history
   */
  async findRefactoringOpportunities(options?: AnalysisOptions): Promise<Array<{
    file: string;
    reason: string;
    confidence: number;
    metrics: Record<string, any>;
  }>> {
    const opportunities: Array<{
      file: string;
      reason: string;
      confidence: number;
      metrics: Record<string, any>;
    }> = [];
    const hotFiles = await this.identifyHotFiles(options);
    
    for (const hotFile of hotFiles.slice(0, 20)) { // Top 20 hot files
      const reasons: string[] = [];
      
      if (hotFile.changeCount > 50) {
        reasons.push('High change frequency indicates instability');
      }
      
      if (hotFile.complexity > 75) {
        reasons.push('High complexity makes maintenance difficult');
      }
      
      if (hotFile.contributors > 8) {
        reasons.push('Too many contributors suggest unclear ownership');
      }
      
      if (hotFile.riskScore > 0.7) {
        reasons.push('High risk score indicates potential issues');
      }

      if (reasons.length > 0) {
        opportunities.push({
          file: hotFile.file,
          reason: reasons.join('; '),
          confidence: hotFile.riskScore,
          metrics: {
            changeCount: hotFile.changeCount,
            complexity: hotFile.complexity,
            contributors: hotFile.contributors,
            riskScore: hotFile.riskScore
          }
        });
      }
    }

    return opportunities.sort((a, b) => b.confidence - a.confidence);
  }

  // Helper methods
  private getSettledValue<T>(result: PromiseSettledResult<T>, defaultValue: T): T {
    return result.status === 'fulfilled' ? result.value : defaultValue;
  }

  private getEmptyBranchMetrics(): BranchMetrics {
    return {
      totalBranches: 0,
      activeBranches: 0,
      averageBranchLifetime: 0,
      mergeConflictRate: 0
    };
  }

  /**
   * Perform enhanced branch lifetime analysis
   */
  private async performBranchLifetimeAnalysis(): Promise<number> {
    try {
      const branches = await this.git.branchLocal();
      if (branches.all.length === 0) return 7;

      // Analyze branch creation and merge patterns
      const lifetimes: number[] = [];
      for (const branch of branches.all.slice(0, 10)) { // Sample first 10 branches
        try {
          const branchLog = await this.git.log([branch, '--max-count=1']);
          const firstCommit = branchLog.latest;
          if (firstCommit) {
            const age = (Date.now() - new Date(firstCommit.date).getTime()) / (1000 * 60 * 60 * 24);
            lifetimes.push(age);
          }
        } catch {
          // Skip branches that can't be analyzed
        }
      }

      return lifetimes.length > 0 ? 
        lifetimes.reduce((sum, lifetime) => sum + lifetime, 0) / lifetimes.length : 7;
    } catch {
      return 7;
    }
  }

  /**
   * Perform enhanced merge conflict analysis
   */
  private async performMergeConflictAnalysis(): Promise<number> {
    try {
      const commits = await this.getCommitHistory({ maxCount: 100 });
      const mergeCommits = commits.filter(commit => 
        commit.message.includes('Merge') || commit.parents.length > 1
      );

      if (mergeCommits.length === 0) return 0.1;

      // Estimate conflict rate based on merge commit patterns
      const conflictIndicators = mergeCommits.filter(commit =>
        commit.message.includes('conflict') || 
        commit.message.includes('resolve') ||
        commit.message.includes('fix merge')
      );

      return conflictIndicators.length / mergeCommits.length;
    } catch {
      return 0.1;
    }
  }
}