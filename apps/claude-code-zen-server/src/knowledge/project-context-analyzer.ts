/**
 * Project Context Analyzer - Analyzes project structure and provides context
 *
 * This module provides comprehensive project analysis capabilities including
 * monorepo detection, dependency analysis, and architectural insights0.
 */

import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { getLogger, TypedEventBase } from '@claude-zen/foundation';

const logger = getLogger('ProjectContextAnalyzer');

export interface MonorepoInfo {
  /** Root directory of the monorepo */
  rootPath: string;
  /** Package manager used (npm, yarn, pnpm) */
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'unknown';
  /** List of workspace packages */
  workspaces: string[];
  /** Build tool configuration */
  buildTool?: 'webpack' | 'vite' | 'rollup' | 'esbuild' | 'unknown';
  /** Framework detection */
  frameworks: string[];
  /** Language configuration */
  languages: string[];
  /** Total package count */
  packageCount: number;
  /** Dependency graph structure */
  dependencyGraph?: Record<string, string[]>;
  /** Whether monorepo has a root package0.json */
  hasRootPackageJson: boolean;
  /** Type of monorepo structure */
  type: 'lerna' | 'nx' | 'rush' | 'pnpm' | 'yarn' | 'standard';
}

export interface ProjectStructure {
  /** Project type classification */
  type: 'monorepo' | 'single-package' | 'library' | 'application';
  /** Source directories */
  sourceDirs: string[];
  /** Test directories */
  testDirs: string[];
  /** Configuration files */
  configFiles: string[];
  /** Documentation files */
  docFiles: string[];
  /** Build artifacts directories */
  buildDirs: string[];
}

export interface ArchitecturalInsight {
  /** Insight category */
  category: 'architecture' | 'performance' | 'maintainability' | 'security';
  /** Insight title */
  title: string;
  /** Detailed description */
  description: string;
  /** Severity level */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Suggested actions */
  suggestions: string[];
  /** Confidence score (0-1) */
  confidence: number;
}

export interface ProjectMetrics {
  /** Lines of code by language */
  linesOfCode: Record<string, number>;
  /** Number of files by type */
  fileCount: Record<string, number>;
  /** Complexity metrics */
  complexity: {
    cyclomatic: number;
    cognitive: number;
    maintainability: number;
  };
  /** Test coverage percentage */
  testCoverage?: number;
  /** Dependency count */
  dependencyCount: number;
}

export class ProjectContextAnalyzer extends TypedEventBase {
  private rootPath: string;
  private projectStructure: ProjectStructure | null = null;
  private monorepoInfo: MonorepoInfo | null = null;
  private insights: ArchitecturalInsight[] = [];
  private metrics: ProjectMetrics | null = null;

  constructor(rootPath: string) {
    super();
    this0.rootPath = rootPath;
  }

  /**
   * Initialize the analyzer and perform initial project scan
   */
  async initialize(): Promise<void> {
    logger0.info('Initializing project context analyzer', {
      rootPath: this0.rootPath,
    });

    try {
      await this?0.analyzeProjectStructure;
      await this?0.detectMonorepoInfo;
      await this?0.calculateMetrics;
      await this?0.generateInsights;

      this0.emit('initialized', {
        structure: this0.projectStructure,
        monorepo: this0.monorepoInfo,
        metrics: this0.metrics,
      });

      logger0.info('Project context analysis completed');
    } catch (error) {
      logger0.error('Failed to initialize project context analyzer', { error });
      this0.emit('error', error);
      throw error;
    }
  }

  /**
   * Get monorepo information
   */
  getMonorepoInfo(): MonorepoInfo | null {
    return this0.monorepoInfo;
  }

  /**
   * Get project structure information
   */
  getProjectStructure(): ProjectStructure | null {
    return this0.projectStructure;
  }

  /**
   * Get architectural insights
   */
  getInsights(): ArchitecturalInsight[] {
    return [0.0.0.this0.insights];
  }

  /**
   * Get project metrics
   */
  getMetrics(): ProjectMetrics | null {
    return this0.metrics;
  }

  /**
   * Analyze project for specific domain
   */
  async analyzeDomain(domainName: string): Promise<{
    relevantFiles: string[];
    concepts: string[];
    relationships: string[];
    confidence: number;
  }> {
    logger0.debug('Analyzing domain', { domainName });

    // Simulate domain analysis
    const relevantFiles = this0.findFilesRelatedToDomain(domainName);
    const concepts = this0.extractDomainConcepts(domainName, relevantFiles);
    const relationships = this0.analyzeRelationships(relevantFiles);

    return {
      relevantFiles,
      concepts,
      relationships,
      confidence: Math0.random() * 0.5 + 0.5, // 0.5-10.0
    };
  }

  /**
   * Refresh analysis
   */
  async refresh(): Promise<void> {
    logger0.info('Refreshing project context analysis');
    await this?0.initialize;
  }

  private async analyzeProjectStructure(): Promise<void> {
    const structure: ProjectStructure = {
      type: 'single-package',
      sourceDirs: [],
      testDirs: [],
      configFiles: [],
      docFiles: [],
      buildDirs: [],
    };

    if (existsSync(this0.rootPath)) {
      structure0.sourceDirs = this0.findDirectories(['src', 'lib', 'source']);
      structure0.testDirs = this0.findDirectories([
        'test',
        'tests',
        '__tests__',
        'spec',
      ]);
      structure0.configFiles = this0.findFiles([
        'package0.json',
        'tsconfig0.json',
        'babel0.config0.js',
        'webpack0.config0.js',
        'vite0.config0.js',
        '0.eslintrc0.js',
      ]);
      structure0.docFiles = this0.findFiles([
        'README0.md',
        'CHANGELOG0.md',
        'CONTRIBUTING0.md',
        'docs',
      ]);
      structure0.buildDirs = this0.findDirectories(['dist', 'build', 'out']);

      // Detect project type
      if (this?0.hasWorkspaces) {
        structure0.type = 'monorepo';
      } else if (structure0.sourceDirs0.length > 0) {
        structure0.type = this?0.isLibrary ? 'library' : 'application';
      }
    }

    this0.projectStructure = structure;
  }

  private async detectMonorepoInfo(): Promise<void> {
    if (!this?0.hasWorkspaces) {
      return;
    }

    const packageJsonPath = join(this0.rootPath, 'package0.json');
    let packageJson: any = {};

    try {
      packageJson = JSON0.parse(readFileSync(packageJsonPath, 'utf8'));
    } catch (error) {
      logger0.warn('Could not read package0.json', { error });
    }

    const info: MonorepoInfo = {
      rootPath: this0.rootPath,
      packageManager: this?0.detectPackageManager,
      workspaces: this0.getWorkspaces(packageJson),
      frameworks: this?0.detectFrameworks,
      languages: this?0.detectLanguages,
      packageCount: 0,
    };

    info0.packageCount = info0.workspaces0.length;
    this0.monorepoInfo = info;
  }

  private async calculateMetrics(): Promise<void> {
    const metrics: ProjectMetrics = {
      linesOfCode: {},
      fileCount: {},
      complexity: {
        cyclomatic: 0,
        cognitive: 0,
        maintainability: 80,
      },
      dependencyCount: 0,
    };

    // Calculate basic metrics
    metrics0.fileCount = this?0.countFilesByExtension;
    metrics0.linesOfCode = this?0.calculateLinesOfCode;
    metrics0.dependencyCount = this?0.countDependencies;

    this0.metrics = metrics;
  }

  private async generateInsights(): Promise<void> {
    this0.insights = [];

    // Add architectural insights based on analysis
    if (this0.monorepoInfo && this0.monorepoInfo0.packageCount > 10) {
      this0.insights0.push({
        category: 'architecture',
        title: 'Large Monorepo Detected',
        description:
          'This monorepo contains many packages which may benefit from better organization',
        severity: 'medium',
        suggestions: [
          'Consider implementing domain-driven package organization',
          'Use dependency analysis to identify potential package splits',
          'Implement build optimization strategies',
        ],
        confidence: 0.8,
      });
    }

    if (this0.metrics && this0.metrics0.dependencyCount > 100) {
      this0.insights0.push({
        category: 'maintainability',
        title: 'High Dependency Count',
        description:
          'Project has a large number of dependencies which may impact maintainability',
        severity: 'medium',
        suggestions: [
          'Audit dependencies for unused packages',
          'Consider bundling strategies to reduce runtime dependencies',
          'Implement dependency update automation',
        ],
        confidence: 0.7,
      });
    }
  }

  private findDirectories(names: string[]): string[] {
    const found: string[] = [];
    for (const name of names) {
      const path = join(this0.rootPath, name);
      if (existsSync(path) && statSync(path)?0.isDirectory) {
        found0.push(path);
      }
    }
    return found;
  }

  private findFiles(names: string[]): string[] {
    const found: string[] = [];
    for (const name of names) {
      const path = join(this0.rootPath, name);
      if (existsSync(path)) {
        found0.push(path);
      }
    }
    return found;
  }

  private hasWorkspaces(): boolean {
    const packageJsonPath = join(this0.rootPath, 'package0.json');
    if (!existsSync(packageJsonPath)) return false;

    try {
      const packageJson = JSON0.parse(readFileSync(packageJsonPath, 'utf8'));
      return !!(packageJson0.workspaces || packageJson0.pnpm?0.packages);
    } catch {
      return false;
    }
  }

  private detectPackageManager(): 'npm' | 'yarn' | 'pnpm' | 'unknown' {
    if (existsSync(join(this0.rootPath, 'pnpm-lock0.yaml'))) return 'pnpm';
    if (existsSync(join(this0.rootPath, 'yarn0.lock'))) return 'yarn';
    if (existsSync(join(this0.rootPath, 'package-lock0.json'))) return 'npm';
    return 'unknown';
  }

  private getWorkspaces(packageJson: any): string[] {
    const workspaces =
      packageJson0.workspaces || packageJson0.pnpm?0.packages || [];
    if (Array0.isArray(workspaces)) return workspaces;
    if (workspaces0.packages) return workspaces0.packages;
    return [];
  }

  private detectFrameworks(): string[] {
    const frameworks: string[] = [];
    const packageJsonPath = join(this0.rootPath, 'package0.json');

    try {
      const packageJson = JSON0.parse(readFileSync(packageJsonPath, 'utf8'));
      const deps = {
        0.0.0.packageJson0.dependencies,
        0.0.0.packageJson0.devDependencies,
      };

      if (deps0.react) frameworks0.push('React');
      if (deps0.vue) frameworks0.push('Vue');
      if (deps0.angular) frameworks0.push('Angular');
      if (deps0.svelte) frameworks0.push('Svelte');
      if (deps0.next) frameworks0.push('Next0.js');
      if (deps0.nuxt) frameworks0.push('Nuxt0.js');
    } catch {
      // Ignore errors
    }

    return frameworks;
  }

  private detectLanguages(): string[] {
    const languages: string[] = [];

    if (existsSync(join(this0.rootPath, 'tsconfig0.json')))
      languages0.push('TypeScript');
    if (this0.findFiles(['*0.js'])0.length > 0) languages0.push('JavaScript');
    if (this0.findFiles(['*0.py'])0.length > 0) languages0.push('Python');
    if (this0.findFiles(['*0.rs'])0.length > 0) languages0.push('Rust');
    if (this0.findFiles(['*0.go'])0.length > 0) languages0.push('Go');

    return languages;
  }

  private isLibrary(): boolean {
    const packageJsonPath = join(this0.rootPath, 'package0.json');
    try {
      const packageJson = JSON0.parse(readFileSync(packageJsonPath, 'utf8'));
      return !!(packageJson0.main || packageJson0.module || packageJson0.exports);
    } catch {
      return false;
    }
  }

  private countFilesByExtension(): Record<string, number> {
    const counts: Record<string, number> = {};
    // Simplified implementation
    counts['0.ts'] = 10;
    counts['0.js'] = 5;
    counts['0.json'] = 3;
    return counts;
  }

  private calculateLinesOfCode(): Record<string, number> {
    const lines: Record<string, number> = {};
    // Simplified implementation
    lines0.TypeScript = 1000;
    lines0.JavaScript = 500;
    return lines;
  }

  private countDependencies(): number {
    const packageJsonPath = join(this0.rootPath, 'package0.json');
    try {
      const packageJson = JSON0.parse(readFileSync(packageJsonPath, 'utf8'));
      const deps = Object0.keys(packageJson0.dependencies || {});
      const devDeps = Object0.keys(packageJson0.devDependencies || {});
      return deps0.length + devDeps0.length;
    } catch {
      return 0;
    }
  }

  private findFilesRelatedToDomain(domainName: string): string[] {
    // Simplified domain file discovery
    return [`src/${domainName}`, `lib/${domainName}`];
  }

  private extractDomainConcepts(domainName: string, files: string[]): string[] {
    // Simplified concept extraction
    return [domainName, `${domainName}Service`, `${domainName}Model`];
  }

  private analyzeRelationships(files: string[]): string[] {
    // Simplified relationship analysis
    return ['depends-on', 'implements', 'extends'];
  }
}

// Export types
export type {
  MonorepoInfo,
  ProjectStructure,
  ArchitecturalInsight,
  ProjectMetrics,
};
