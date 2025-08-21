/**
 * @fileoverview Main Repository Analyzer - Orchestrates all analysis components
 * Battle-hardened repository analysis with comprehensive metrics and recommendations
 */

import * as fastGlob from 'fast-glob';
import { getLogger } from '@claude-zen/foundation';
import { ComplexityAnalyzer } from './analyzers/complexity-analyzer.js';
import { DependencyAnalyzer } from './analyzers/dependency-analyzer.js';
import { WorkspaceAnalyzer } from './analyzers/workspace-analyzer.js';
import { GitAnalyzer } from './analyzers/git-analyzer.js';
import { DomainAnalyzer } from './domain/domain-analyzer.js';
import { RecommendationEngine } from './recommendations/recommendation-engine.js';
import { ReportGenerator } from './reporting/report-generator.js';
import type {
  RepositoryMetrics,
  AnalysisOptions,
  AnalysisResult,
  AnalysisRecommendation,
  AnalysisSummary,
  ExportFormat
} from './types/index.js';

export class RepositoryAnalyzer {
  private logger = getLogger('RepositoryAnalyzer');
  private complexityAnalyzer: ComplexityAnalyzer;
  private dependencyAnalyzer: DependencyAnalyzer;
  private workspaceAnalyzer: WorkspaceAnalyzer;
  private gitAnalyzer: GitAnalyzer;
  private domainAnalyzer: DomainAnalyzer;
  private recommendationEngine: RecommendationEngine;
  private reportGenerator: ReportGenerator;

  constructor(private repositoryPath: string) {
    this.complexityAnalyzer = new ComplexityAnalyzer();
    this.dependencyAnalyzer = new DependencyAnalyzer();
    this.workspaceAnalyzer = new WorkspaceAnalyzer();
    this.gitAnalyzer = new GitAnalyzer(repositoryPath);
    this.domainAnalyzer = new DomainAnalyzer();
    this.recommendationEngine = new RecommendationEngine();
    this.reportGenerator = new ReportGenerator();
  }

  /**
   * Perform comprehensive repository analysis
   */
  async analyze(options: AnalysisOptions = {}): Promise<AnalysisResult> {
    this.logger.info(`Starting comprehensive analysis of repository: ${this.repositoryPath}`);
    
    const startTime = Date.now();

    // Set default options
    const analysisOptions: AnalysisOptions = {
      includeTests: false,
      includeNodeModules: false,
      includeDotFiles: false,
      analysisDepth: 'moderate',
      enableGitAnalysis: true,
      enableComplexityAnalysis: true,
      enableDependencyAnalysis: true,
      enableDomainAnalysis: true,
      performanceMode: 'balanced',
      ...options
    };

    try {
      // Initialize complexity analyzer
      if (analysisOptions.enableComplexityAnalysis) {
        await this.complexityAnalyzer.initialize(this.repositoryPath, analysisOptions);
      }

      // Get all source files
      const sourceFiles = await this.getSourceFiles(analysisOptions);
      this.logger.info(`Found ${sourceFiles.length} source files to analyze`);

      // Run all analyses in parallel for maximum performance
      const [
        workspaceInfo,
        complexity,
        dependencies,
        gitMetrics,
        domains
      ] = await Promise.allSettled([
        this.analyzeWorkspace(analysisOptions),
        this.analyzeComplexity(sourceFiles, analysisOptions),
        this.analyzeDependencies(analysisOptions),
        this.analyzeGit(analysisOptions),
        this.analyzeDomains(sourceFiles, analysisOptions)
      ]);

      // Build comprehensive repository metrics
      const repositoryMetrics: RepositoryMetrics = {
        id: this.generateRepositoryId(),
        name: this.getRepositoryName(),
        path: this.repositoryPath,
        totalFiles: sourceFiles.length,
        totalLines: await this.countTotalLines(sourceFiles),
        languages: await this.detectLanguages(sourceFiles),
        complexity: this.getSettledValue(complexity, this.getEmptyComplexity()),
        dependencies: this.getSettledValue(dependencies, this.getEmptyDependencies()),
        domains: this.getSettledValue(domains, []),
        gitMetrics: analysisOptions.enableGitAnalysis ? this.getSettledValue(gitMetrics, undefined) : undefined,
        analysisTimestamp: new Date()
      };

      // Generate recommendations
      const recommendations = await this.generateRecommendations(repositoryMetrics, analysisOptions);

      // Generate summary
      const summary = this.generateSummary(repositoryMetrics, recommendations);

      const analysisTime = Date.now() - startTime;
      this.logger.info(`Repository analysis completed in ${analysisTime}ms`);

      return {
        repository: repositoryMetrics,
        domains: repositoryMetrics.domains,
        recommendations,
        summary,
        exportOptions: ['json', 'yaml', 'csv', 'html', 'markdown', 'pdf', 'graphml', 'dot']
      };

    } catch (error) {
      this.logger.error('Repository analysis failed:', error);
      throw error;
    }
  }

  /**
   * Export analysis results in specified format
   */
  async exportResults(result: AnalysisResult, format: ExportFormat, outputPath?: string): Promise<string> {
    return this.reportGenerator.generateReport(result, format, outputPath);
  }

  /**
   * Get quick health score for repository
   */
  async getHealthScore(options: AnalysisOptions = {}): Promise<{
    score: number;
    breakdown: Record<string, number>;
    criticalIssues: string[];
  }> {
    const quickOptions: AnalysisOptions = {
      ...options,
      performanceMode: 'fast',
      analysisDepth: 'shallow'
    };

    const result = await this.analyze(quickOptions);
    
    return {
      score: result.summary.overallScore,
      breakdown: {
        complexity: this.scoreComplexity(result.repository.complexity),
        dependencies: this.scoreDependencies(result.repository.dependencies),
        maintainability: this.scoreMaintainability(result.repository),
        gitHealth: result.repository.gitMetrics ? this.scoreGitHealth(result.repository.gitMetrics) : 0.8
      },
      criticalIssues: result.recommendations
        .filter(r => r.priority === 'urgent')
        .map(r => r.title)
    };
  }

  /**
   * Analyze workspace configuration
   */
  private async analyzeWorkspace(options: AnalysisOptions): Promise<any> {
    if (!options.enableDependencyAnalysis) return null;
    
    try {
      return await this.workspaceAnalyzer.analyzeWorkspace(this.repositoryPath, options);
    } catch (error) {
      this.logger.warn('Workspace analysis failed:', error);
      return null;
    }
  }

  /**
   * Analyze code complexity
   */
  private async analyzeComplexity(files: string[], options: AnalysisOptions): Promise<any> {
    if (!options.enableComplexityAnalysis) return this.getEmptyComplexity();
    
    try {
      return await this.complexityAnalyzer.analyzeRepository(files, options);
    } catch (error) {
      this.logger.warn('Complexity analysis failed:', error);
      return this.getEmptyComplexity();
    }
  }

  /**
   * Analyze dependencies
   */
  private async analyzeDependencies(options: AnalysisOptions): Promise<any> {
    if (!options.enableDependencyAnalysis) return this.getEmptyDependencies();
    
    try {
      return await this.dependencyAnalyzer.analyzeRepository(this.repositoryPath, options);
    } catch (error) {
      this.logger.warn('Dependency analysis failed:', error);
      return this.getEmptyDependencies();
    }
  }

  /**
   * Analyze git repository
   */
  private async analyzeGit(options: AnalysisOptions): Promise<any> {
    if (!options.enableGitAnalysis) return undefined;
    
    try {
      return await this.gitAnalyzer.analyzeRepository(options);
    } catch (error) {
      this.logger.warn('Git analysis failed:', error);
      return undefined;
    }
  }

  /**
   * Analyze domains
   */
  private async analyzeDomains(files: string[], options: AnalysisOptions): Promise<any> {
    if (!options.enableDomainAnalysis) return [];
    
    try {
      return await this.domainAnalyzer.analyzeRepository(this.repositoryPath, files, options);
    } catch (error) {
      this.logger.warn('Domain analysis failed:', error);
      return [];
    }
  }

  /**
   * Get source files based on analysis options
   */
  private async getSourceFiles(options: AnalysisOptions): Promise<string[]> {
    const patterns = [
      '**/*.{ts,tsx,js,jsx,mts,cts,mjs,cjs,py,go,rs,java,cpp,c,h,hpp}',
      ...(options.includeTests ? [] : [
        '!**/*.{test,spec}.{ts,tsx,js,jsx}',
        '!**/test/**',
        '!**/tests/**',
        '!**/__tests__/**'
      ]),
      ...(options.includeNodeModules ? [] : ['!**/node_modules/**']),
      ...(options.includeDotFiles ? [] : ['!**/.*']),
      ...(options.excludePatterns || []).map(p => `!${p}`),
      '!**/dist/**',
      '!**/build/**',
      '!**/.git/**'
    ];

    const files = await fastGlob(patterns, {
      cwd: this.repositoryPath,
      absolute: true,
      followSymbolicLinks: false
    });

    // Filter by file size if specified
    if (options.maxFileSize) {
      const fs = await import('fs/promises');
      const filteredFiles = [];
      
      for (const file of files) {
        try {
          const stats = await fs.stat(file);
          if (stats.size <= options.maxFileSize) {
            filteredFiles.push(file);
          }
        } catch {
          // Skip files that can't be accessed
        }
      }
      
      return filteredFiles;
    }

    return files;
  }

  /**
   * Count total lines of code
   */
  private async countTotalLines(files: string[]): Promise<number> {
    const fs = await import('fs/promises');
    let totalLines = 0;

    await Promise.all(files.map(async (file) => {
      try {
        const content = await fs.readFile(file, 'utf-8');
        totalLines += content.split('\n').length;
      } catch {
        // Skip files that can't be read
      }
    }));

    return totalLines;
  }

  /**
   * Detect programming languages
   */
  private async detectLanguages(files: string[]): Promise<Record<string, number>> {
    const fs = await import('fs/promises');
    const languages: Record<string, number> = {};

    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const lines = content.split('\n').length;
        const ext = file.split('.').pop()?.toLowerCase();

        let language = 'unknown';
        switch (ext) {
          case 'ts':
          case 'tsx':
          case 'mts':
          case 'cts':
            language = 'typescript';
            break;
          case 'js':
          case 'jsx':
          case 'mjs':
          case 'cjs':
            language = 'javascript';
            break;
          case 'py':
            language = 'python';
            break;
          case 'go':
            language = 'go';
            break;
          case 'rs':
            language = 'rust';
            break;
          case 'java':
            language = 'java';
            break;
          case 'cpp':
          case 'cc':
          case 'cxx':
            language = 'cpp';
            break;
          case 'c':
            language = 'c';
            break;
          case 'h':
          case 'hpp':
            language = 'header';
            break;
        }

        languages[language] = (languages[language] || 0) + lines;
      } catch {
        // Skip files that can't be read
      }
    }

    return languages;
  }

  /**
   * Generate recommendations based on analysis
   */
  private async generateRecommendations(
    repository: RepositoryMetrics, 
    options: AnalysisOptions
  ): Promise<AnalysisRecommendation[]> {
    return this.recommendationEngine.generateRecommendations(repository, options);
  }

  /**
   * Generate analysis summary
   */
  private generateSummary(
    repository: RepositoryMetrics, 
    recommendations: AnalysisRecommendation[]
  ): AnalysisSummary {
    const complexityScore = this.scoreComplexity(repository.complexity);
    const dependencyScore = this.scoreDependencies(repository.dependencies);
    const maintainabilityScore = this.scoreMaintainability(repository);
    const gitScore = repository.gitMetrics ? this.scoreGitHealth(repository.gitMetrics) : 0.8;

    const overallScore = (complexityScore + dependencyScore + maintainabilityScore + gitScore) / 4;

    const criticalIssues = recommendations.filter(r => r.priority === 'urgent').length;
    const highPriorityRecommendations = recommendations.filter(r => r.priority === 'high').length;
    const estimatedImprovementEffort = recommendations.reduce((sum, r) => sum + r.effort.hours, 0);

    const strengths = [];
    const weaknesses = [];

    if (complexityScore > 0.8) strengths.push('Low code complexity');
    else if (complexityScore < 0.5) weaknesses.push('High code complexity');

    if (dependencyScore > 0.8) strengths.push('Well-managed dependencies');
    else if (dependencyScore < 0.5) weaknesses.push('Dependency management issues');

    if (maintainabilityScore > 0.8) strengths.push('High maintainability');
    else if (maintainabilityScore < 0.5) weaknesses.push('Low maintainability');

    if (gitScore > 0.8) strengths.push('Healthy git practices');
    else if (gitScore < 0.5) weaknesses.push('Git workflow issues');

    return {
      overallScore,
      strengths,
      weaknesses,
      criticalIssues,
      highPriorityRecommendations,
      estimatedImprovementEffort,
      riskAssessment: {
        technicalDebtRisk: repository.complexity.technicalDebt > 100 ? 'high' : 'medium',
        maintainabilityRisk: maintainabilityScore < 0.5 ? 'high' : 'medium',
        scalabilityRisk: repository.dependencies.circularDependencies.length > 5 ? 'high' : 'low',
        teamVelocityRisk: criticalIssues > 10 ? 'high' : 'medium'
      }
    };
  }

  // Scoring methods
  private scoreComplexity(complexity: any): number {
    if (!complexity) return 0.5;
    
    const cyclomaticScore = Math.max(0, 1 - (complexity.cyclomatic / 100));
    const maintainabilityScore = complexity.maintainabilityIndex / 100;
    const debtScore = Math.max(0, 1 - (complexity.technicalDebt / 200));
    
    return (cyclomaticScore + maintainabilityScore + debtScore) / 3;
  }

  private scoreDependencies(dependencies: any): number {
    if (!dependencies) return 0.5;
    
    const circularScore = Math.max(0, 1 - (dependencies.circularDependencies.length / 10));
    const couplingScore = Math.max(0, 1 - dependencies.coupling.instability);
    const stabilityScore = dependencies.stability.stabilityIndex;
    
    return (circularScore + couplingScore + stabilityScore) / 3;
  }

  private scoreMaintainability(repository: RepositoryMetrics): number {
    const complexityFactor = this.scoreComplexity(repository.complexity);
    const dependencyFactor = this.scoreDependencies(repository.dependencies);
    const sizeFactor = Math.max(0, 1 - (repository.totalFiles / 1000));
    
    return (complexityFactor + dependencyFactor + sizeFactor) / 3;
  }

  private scoreGitHealth(gitMetrics: any): number {
    if (!gitMetrics) return 0.8;
    
    const contributorScore = Math.min(1, gitMetrics.contributors / 5); // Optimal: 5+ contributors
    const activityScore = Math.min(1, gitMetrics.averageCommitsPerDay / 2); // Optimal: 2+ commits/day
    const hotFileScore = Math.max(0, 1 - (gitMetrics.hotFiles.length / 20)); // Bad: 20+ hot files
    
    return (contributorScore + activityScore + hotFileScore) / 3;
  }

  // Helper methods
  private generateRepositoryId(): string {
    return `repo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getRepositoryName(): string {
    return this.repositoryPath.split('/').pop() || 'unknown';
  }

  private getSettledValue<T>(result: PromiseSettledResult<T>, defaultValue: T): T {
    return result.status === 'fulfilled' ? result.value : defaultValue;
  }

  private getEmptyComplexity(): any {
    return {
      cyclomatic: 1,
      halstead: {
        vocabulary: 0,
        length: 0,
        difficulty: 0,
        effort: 0,
        time: 0,
        bugs: 0,
        volume: 0
      },
      maintainabilityIndex: 100,
      technicalDebt: 0,
      codeSmells: [],
      hotspots: []
    };
  }

  private getEmptyDependencies(): any {
    return {
      totalDependencies: 0,
      directDependencies: 0,
      transitiveDependencies: 0,
      circularDependencies: [],
      dependencyGraph: { nodes: [], edges: [], clusters: [] },
      coupling: {
        afferentCoupling: 0,
        efferentCoupling: 0,
        instability: 0,
        abstractness: 0,
        distance: 0
      },
      cohesion: {
        lcom: 0,
        tcc: 0,
        lcc: 0
      },
      stability: {
        stabilityIndex: 0.5,
        changeFrequency: 0,
        bugFrequency: 0,
        riskScore: 0
      }
    };
  }
}