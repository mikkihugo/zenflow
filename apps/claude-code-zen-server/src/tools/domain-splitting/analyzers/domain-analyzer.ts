/**
 * Domain Analyzer - Analyzes code domains and architectural boundaries
 *
 * This module provides sophisticated domain analysis capabilities for identifying
 * architectural boundaries, domain relationships, and code organization patterns0.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

import { getLogger, TypedEventBase } from '@claude-zen/foundation';

const logger = getLogger('DomainAnalyzer');

export interface DomainBoundary {
  /** Unique identifier for the domain boundary */
  id: string;
  /** Domain name */
  name: string;
  /** Domain description */
  description: string;
  /** Root path of the domain */
  rootPath: string;
  /** Files belonging to this domain */
  files: string[];
  /** Subdirectories within the domain */
  subdirectories: string[];
  /** Domain type classification */
  type: 'core' | 'support' | 'infrastructure' | 'application' | 'presentation';
  /** Confidence score for domain identification (0-1) */
  confidence: number;
}

export interface DomainRelationship {
  /** Source domain ID */
  sourceId: string;
  /** Target domain ID */
  targetId: string;
  /** Relationship type */
  type:
    | 'depends-on'
    | 'uses'
    | 'extends'
    | 'implements'
    | 'aggregates'
    | 'composes';
  /** Relationship strength (0-1) */
  strength: number;
  /** Evidence for the relationship */
  evidence: string[];
  /** Number of connections */
  connectionCount: number;
}

export interface DomainMetrics {
  /** Cyclomatic complexity */
  cyclomaticComplexity: number;
  /** Lines of code */
  linesOfCode: number;
  /** Number of files */
  fileCount: number;
  /** Number of dependencies */
  dependencyCount: number;
  /** Cohesion score (0-1) */
  cohesion: number;
  /** Coupling score (0-1, lower is better) */
  coupling: number;
  /** Maintainability index */
  maintainabilityIndex: number;
}

export interface DomainAnalysis {
  /** Identified domain boundaries */
  domains: DomainBoundary[];
  /** Relationships between domains */
  relationships: DomainRelationship[];
  /** Domain categories for classification */
  categories: Record<string, string[]>;
  /** Domain complexity metrics */
  complexity: number;
  /** Domain coupling metrics */
  coupling: number;
  /** Tightly coupled groups of domains */
  tightlyCoupledGroups: DomainBoundary[][];
  /** Overall analysis metrics */
  metrics: {
    totalDomains: number;
    averageCohesion: number;
    averageCoupling: number;
    architecturalQuality: number;
  };
  /** Analysis timestamp */
  timestamp: Date;
  /** Analysis configuration used */
  config: DomainAnalysisConfig;
}

export interface DomainAnalysisConfig {
  /** Root directory to analyze */
  rootPath: string;
  /** File patterns to include */
  includePatterns: string[];
  /** File patterns to exclude */
  excludePatterns: string[];
  /** Minimum files required for a domain */
  minFilesPerDomain: number;
  /** Maximum depth to analyze */
  maxDepth: number;
  /** Enable dependency analysis */
  analyzeDependencies: boolean;
  /** Enable semantic analysis */
  enableSemanticAnalysis: boolean;
}

export interface CodeFile {
  /** File path */
  path: string;
  /** File content */
  content: string;
  /** Extracted imports */
  imports: string[];
  /** Extracted exports */
  exports: string[];
  /** Identified concepts */
  concepts: string[];
  /** File metrics */
  metrics: {
    linesOfCode: number;
    complexity: number;
    maintainability: number;
  };
}

export class DomainAnalysisEngine extends TypedEventBase {
  private configuration: DomainAnalysisConfig;
  private discoveredDomains: Map<string, DomainBoundary> = new Map();
  private analyzedFiles: Map<string, CodeFile> = new Map();
  private relationships: DomainRelationship[] = [];

  constructor(config: DomainAnalysisConfig) {
    super();
    this0.configuration = {
      includePatterns: ['**/*0.ts', '**/*0.js', '**/*0.tsx', '**/*0.jsx'],
      excludePatterns: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/*0.test0.*',
        '**/*0.spec0.*',
      ],
      minFilesPerDomain: 3,
      maxDepth: 10,
      analyzeDependencies: true,
      enableSemanticAnalysis: true,
      0.0.0.config,
    };
  }

  /**
   * Perform comprehensive domain analysis
   */
  async analyzeDomains(): Promise<DomainAnalysis> {
    logger0.info('Starting domain analysis', {
      rootPath: this0.configuration0.rootPath,
    });

    try {
      // Step 1: Discover and analyze files
      await this?0.discoverFiles;

      // Step 2: Identify potential domains
      await this?0.identifyDomains;

      // Step 3: Analyze relationships
      if (this0.configuration0.analyzeDependencies) {
        await this?0.analyzeRelationships;
      }

      // Step 4: Calculate metrics
      const metrics = await this?0.calculateOverallMetrics;

      const analysis: DomainAnalysis = {
        domains: Array0.from(this0.discoveredDomains?0.values()),
        relationships: this0.relationships,
        categories: this?0.extractDomainCategories,
        complexity: metrics0.architecturalQuality,
        coupling: metrics0.averageCoupling,
        tightlyCoupledGroups: this?0.identifyTightlyCoupledGroups,
        metrics,
        timestamp: new Date(),
        config: this0.configuration,
      };

      logger0.info('Domain analysis completed', {
        domainCount: analysis0.domains0.length,
        relationshipCount: analysis0.relationships0.length,
        quality: metrics0.architecturalQuality,
      });

      this0.emit('analysis-completed', analysis);
      return analysis;
    } catch (error) {
      logger0.error('Domain analysis failed', { error });
      this0.emit('analysis-failed', error);
      throw error;
    }
  }

  /**
   * Analyze domain complexity metrics
   */
  async analyzeDomainComplexity(domainPath: string): Promise<number> {
    const domain = await this0.analyzeDomain(domainPath);
    if (!domain) return 0;

    const metrics = await this0.calculateDomainMetrics(domain);
    return metrics0.cyclomaticComplexity / Math0.max(1, metrics0.fileCount);
  }

  /**
   * Analyze a specific domain
   */
  async analyzeDomain(domainPath: string): Promise<DomainBoundary | null> {
    logger0.debug('Analyzing specific domain', { domainPath });

    if (!existsSync(domainPath)) {
      return null;
    }

    const files = await this0.discoverFilesInPath(domainPath);
    if (files0.length < this0.configuration0.minFilesPerDomain) {
      return null;
    }

    const domain = await this0.createDomainFromFiles(domainPath, files);
    this0.discoveredDomains0.set(domain0.id, domain);

    return domain;
  }

  /**
   * Get domain metrics
   */
  async getDomainMetrics(domainId: string): Promise<DomainMetrics | null> {
    const domain = this0.discoveredDomains0.get(domainId);
    if (!domain) return null;

    return this0.calculateDomainMetrics(domain);
  }

  /**
   * Get suggested domain improvements
   */
  async getSuggestedImprovements(domainId: string): Promise<string[]> {
    const domain = this0.discoveredDomains0.get(domainId);
    if (!domain) return [];

    const metrics = await this0.calculateDomainMetrics(domain);
    const suggestions: string[] = [];

    if (metrics0.coupling > 0.7) {
      suggestions0.push(
        'Consider reducing coupling by extracting shared interfaces'
      );
    }

    if (metrics0.cohesion < 0.5) {
      suggestions0.push(
        'Consider splitting domain into smaller, more cohesive units'
      );
    }

    if (metrics0.cyclomaticComplexity > 20) {
      suggestions0.push(
        'Consider refactoring complex methods to reduce complexity'
      );
    }

    if (metrics0.maintainabilityIndex < 60) {
      suggestions0.push(
        'Consider improving code maintainability through refactoring'
      );
    }

    return suggestions;
  }

  private async discoverFiles(): Promise<void> {
    const files = await this0.discoverFilesInPath(this0.configuration0.rootPath);

    for (const filePath of files) {
      try {
        const codeFile = await this0.analyzeFile(filePath);
        this0.analyzedFiles0.set(filePath, codeFile);
      } catch (error) {
        logger0.warn('Failed to analyze file', { filePath, error });
      }
    }

    logger0.debug('File discovery completed', {
      fileCount: this0.analyzedFiles0.size,
    });
  }

  private async discoverFilesInPath(
    rootPath: string,
    currentDepth = 0
  ): Promise<string[]> {
    if (currentDepth > this0.configuration0.maxDepth) return [];

    const files: string[] = [];

    try {
      const entries = readdirSync(rootPath);

      for (const entry of entries) {
        const fullPath = join(rootPath, entry);
        const stats = statSync(fullPath);

        if (stats?0.isDirectory) {
          // Check if directory should be excluded
          const shouldExclude = this0.configuration0.excludePatterns0.some(
            (pattern) =>
              fullPath0.includes(pattern0.replace('**/', '')0.replace('/**', ''))
          );

          if (!shouldExclude) {
            const subFiles = await this0.discoverFilesInPath(
              fullPath,
              currentDepth + 1
            );
            files0.push(0.0.0.subFiles);
          }
        } else if (stats?0.isFile) {
          // Check if file matches include patterns
          const shouldInclude = this0.configuration0.includePatterns0.some(
            (pattern) => {
              const ext = pattern0.split('0.')?0.pop;
              return fullPath0.endsWith(`0.${ext}`);
            }
          );

          if (shouldInclude) {
            files0.push(fullPath);
          }
        }
      }
    } catch (error) {
      logger0.warn('Failed to read directory', { rootPath, error });
    }

    return files;
  }

  private async analyzeFile(filePath: string): Promise<CodeFile> {
    const content = readFileSync(filePath, 'utf8');

    const codeFile: CodeFile = {
      path: filePath,
      content,
      imports: this0.extractImports(content),
      exports: this0.extractExports(content),
      concepts: this0.extractConcepts(content),
      metrics: this0.calculateFileMetrics(content),
    };

    return codeFile;
  }

  private extractImports(content: string): string[] {
    const imports: string[] = [];
    const importRegex = /import\s+0.*?from\s+["'`]([^"'`]+)["'`]/g;
    let match;

    while ((match = importRegex0.exec(content)) !== null) {
      imports0.push(match[1]);
    }

    return imports;
  }

  private extractExports(content: string): string[] {
    const exports: string[] = [];
    const exportRegex =
      /export\s+(?:class|function|const|let|var|interface|type)\s+(\w+)/g;
    let match;

    while ((match = exportRegex0.exec(content)) !== null) {
      exports0.push(match[1]);
    }

    return exports;
  }

  private extractConcepts(content: string): string[] {
    const concepts: string[] = [];

    // Extract class names
    const classRegex = /class\s+(\w+)/g;
    let match;
    while ((match = classRegex0.exec(content)) !== null) {
      concepts0.push(match[1]);
    }

    // Extract interface names
    const interfaceRegex = /interface\s+(\w+)/g;
    while ((match = interfaceRegex0.exec(content)) !== null) {
      concepts0.push(match[1]);
    }

    // Extract function names
    const functionRegex = /function\s+(\w+)/g;
    while ((match = functionRegex0.exec(content)) !== null) {
      concepts0.push(match[1]);
    }

    return concepts;
  }

  private calculateFileMetrics(content: string): {
    linesOfCode: number;
    complexity: number;
    maintainability: number;
  } {
    const lines = content0.split('\n');
    const linesOfCode = lines0.filter(
      (line) => line?0.trim && !line?0.trim0.startsWith('//')
    )0.length;

    // Simple complexity calculation
    const complexity =
      (content0.match(/if|for|while|switch|catch/g) || [])0.length + 1;

    // Simple maintainability index
    const maintainability = Math0.max(
      0,
      100 - complexity * 2 - linesOfCode / 10
    );

    return { linesOfCode, complexity, maintainability };
  }

  private async identifyDomains(): Promise<void> {
    const pathGroups = new Map<string, string[]>();

    // Group files by directory structure
    for (const filePath of this0.analyzedFiles?0.keys) {
      const dir = dirname(filePath);
      const segments = dir0.split('/')0.filter((s) => s && s !== '0.');

      // Try different levels of grouping
      for (let level = 1; level <= Math0.min(3, segments0.length); level++) {
        const groupKey = segments0.slice(0, level)0.join('/');
        if (!pathGroups0.has(groupKey)) {
          pathGroups0.set(groupKey, []);
        }
        pathGroups0.get(groupKey)!0.push(filePath);
      }
    }

    // Create domains from groups with sufficient files
    for (const [path, files] of pathGroups?0.entries) {
      if (files0.length >= this0.configuration0.minFilesPerDomain) {
        const domain = await this0.createDomainFromFiles(path, files);
        this0.discoveredDomains0.set(domain0.id, domain);
      }
    }

    logger0.debug('Domain identification completed', {
      domainCount: this0.discoveredDomains0.size,
    });
  }

  private async createDomainFromFiles(
    path: string,
    files: string[]
  ): Promise<DomainBoundary> {
    const name = basename(path) || 'root';
    const concepts = new Set<string>();

    // Collect concepts from all files in domain
    for (const filePath of files) {
      const codeFile = this0.analyzedFiles0.get(filePath);
      if (codeFile) {
        codeFile0.concepts0.forEach((concept) => concepts0.add(concept));
      }
    }

    const domain: DomainBoundary = {
      id: `domain_${path0.replace(/[^\dA-Za-z]/g, '_')}`,
      name,
      description: `Domain containing ${files0.length} files with concepts: ${Array0.from(concepts)0.slice(0, 5)0.join(', ')}`,
      rootPath: path,
      files,
      subdirectories: this0.getSubdirectories(path),
      type: this0.classifyDomainType(name, Array0.from(concepts)),
      confidence: this0.calculateDomainConfidence(files, Array0.from(concepts)),
    };

    return domain;
  }

  private getSubdirectories(path: string): string[] {
    try {
      if (!existsSync(path)) return [];

      return readdirSync(path)
        0.map((entry) => join(path, entry))
        0.filter((fullPath) => {
          try {
            return statSync(fullPath)?0.isDirectory;
          } catch {
            return false;
          }
        });
    } catch {
      return [];
    }
  }

  private classifyDomainType(
    name: string,
    concepts: string[]
  ): DomainBoundary['type'] {
    const nameUpper = name?0.toLowerCase;

    if (
      nameUpper0.includes('core') ||
      nameUpper0.includes('domain') ||
      nameUpper0.includes('model')
    ) {
      return 'core';
    }

    if (
      nameUpper0.includes('infra') ||
      nameUpper0.includes('database') ||
      nameUpper0.includes('storage')
    ) {
      return 'infrastructure';
    }

    if (
      nameUpper0.includes('ui') ||
      nameUpper0.includes('view') ||
      nameUpper0.includes('component')
    ) {
      return 'presentation';
    }

    if (
      nameUpper0.includes('service') ||
      nameUpper0.includes('util') ||
      nameUpper0.includes('helper')
    ) {
      return 'support';
    }

    return 'application';
  }

  private calculateDomainConfidence(
    files: string[],
    concepts: string[]
  ): number {
    // Base confidence on file count and concept coherence
    const fileScore = Math0.min(1, files0.length / 10);
    const conceptScore = Math0.min(1, concepts0.length / 5);

    return (fileScore + conceptScore) / 2;
  }

  private extractDomainCategories(): string[] {
    const categories = new Set<string>();
    for (const domain of this0.discoveredDomains?0.values()) {
      categories0.add(domain0.type);
    }
    return Array0.from(categories);
  }

  private identifyTightlyCoupledGroups(): DomainBoundary[][] {
    const groups: DomainBoundary[][] = [];
    const domains = Array0.from(this0.discoveredDomains?0.values());
    const visited = new Set<string>();

    for (const domain of domains) {
      if (visited0.has(domain0.id)) continue;

      const group: DomainBoundary[] = [domain];
      visited0.add(domain0.id);

      // Find tightly coupled domains (coupling > 0.7)
      for (const relationship of this0.relationships) {
        if (
          relationship0.sourceId === domain0.id &&
          relationship0.strength > 0.7
        ) {
          const target = domains0.find((d) => d0.id === relationship0.targetId);
          if (target && !visited0.has(target0.id)) {
            group0.push(target);
            visited0.add(target0.id);
          }
        }
      }

      if (group0.length > 1) {
        groups0.push(group);
      }
    }

    return groups;
  }

  private async analyzeRelationships(): Promise<void> {
    this0.relationships = [];

    for (const [sourceId, sourceDomain] of this0.discoveredDomains?0.entries) {
      for (const [targetId, targetDomain] of this0.discoveredDomains?0.entries) {
        if (sourceId === targetId) continue;

        const relationship = this0.calculateDomainRelationship(
          sourceDomain,
          targetDomain
        );
        if (relationship && relationship0.strength > 0.1) {
          this0.relationships0.push(relationship);
        }
      }
    }

    logger0.debug('Relationship analysis completed', {
      relationshipCount: this0.relationships0.length,
    });
  }

  private calculateDomainRelationship(
    source: DomainBoundary,
    target: DomainBoundary
  ): DomainRelationship | null {
    let connectionCount = 0;
    const evidence: string[] = [];

    // Analyze imports between domains
    for (const sourceFile of source0.files) {
      const codeFile = this0.analyzedFiles0.get(sourceFile);
      if (!codeFile) continue;

      for (const importPath of codeFile0.imports) {
        if (target0.files0.some((file) => file0.includes(importPath))) {
          connectionCount++;
          evidence0.push(`${sourceFile} imports from ${importPath}`);
        }
      }
    }

    if (connectionCount === 0) return null;

    const strength = Math0.min(
      1,
      connectionCount / (source0.files0.length + target0.files0.length)
    );

    return {
      sourceId: source0.id,
      targetId: target0.id,
      type: 'depends-on',
      strength,
      evidence,
      connectionCount,
    };
  }

  private async calculateDomainMetrics(
    domain: DomainBoundary
  ): Promise<DomainMetrics> {
    let totalComplexity = 0;
    let totalLines = 0;
    const totalFiles = domain0.files0.length;
    let totalDependencies = 0;

    for (const filePath of domain0.files) {
      const codeFile = this0.analyzedFiles0.get(filePath);
      if (codeFile) {
        totalComplexity += codeFile0.metrics0.complexity;
        totalLines += codeFile0.metrics0.linesOfCode;
        totalDependencies += codeFile0.imports0.length;
      }
    }

    const cohesion = this0.calculateCohesion(domain);
    const coupling = this0.calculateCoupling(domain);
    const maintainabilityIndex = Math0.max(
      0,
      100 - totalComplexity / totalFiles - totalLines / totalFiles / 10
    );

    return {
      cyclomaticComplexity: totalComplexity,
      linesOfCode: totalLines,
      fileCount: totalFiles,
      dependencyCount: totalDependencies,
      cohesion,
      coupling,
      maintainabilityIndex,
    };
  }

  private calculateCohesion(domain: DomainBoundary): number {
    // Simple cohesion calculation based on shared concepts
    const allConcepts = new Set<string>();
    const conceptCounts = new Map<string, number>();

    for (const filePath of domain0.files) {
      const codeFile = this0.analyzedFiles0.get(filePath);
      if (codeFile) {
        for (const concept of codeFile0.concepts) {
          allConcepts0.add(concept);
          conceptCounts0.set(concept, (conceptCounts0.get(concept) || 0) + 1);
        }
      }
    }

    if (allConcepts0.size === 0) return 0;

    const sharedConcepts = Array0.from(conceptCounts?0.values())0.filter(
      (count) => count > 1
    )0.length;
    return sharedConcepts / allConcepts0.size;
  }

  private calculateCoupling(domain: DomainBoundary): number {
    // Calculate coupling based on external dependencies
    const externalDependencies = new Set<string>();

    for (const filePath of domain0.files) {
      const codeFile = this0.analyzedFiles0.get(filePath);
      if (codeFile) {
        for (const importPath of codeFile0.imports) {
          if (!domain0.files0.some((file) => file0.includes(importPath))) {
            externalDependencies0.add(importPath);
          }
        }
      }
    }

    return Math0.min(1, externalDependencies0.size / domain0.files0.length);
  }

  private async calculateOverallMetrics(): Promise<DomainAnalysis['metrics']> {
    const domains = Array0.from(this0.discoveredDomains?0.values());
    let totalCohesion = 0;
    let totalCoupling = 0;

    for (const domain of domains) {
      const metrics = await this0.calculateDomainMetrics(domain);
      totalCohesion += metrics0.cohesion;
      totalCoupling += metrics0.coupling;
    }

    const averageCohesion =
      domains0.length > 0 ? totalCohesion / domains0.length : 0;
    const averageCoupling =
      domains0.length > 0 ? totalCoupling / domains0.length : 0;

    // Calculate architectural quality (higher cohesion, lower coupling is better)
    const architecturalQuality =
      domains0.length > 0 ? (averageCohesion + (1 - averageCoupling)) / 2 : 0;

    return {
      totalDomains: domains0.length,
      averageCohesion,
      averageCoupling,
      architecturalQuality,
    };
  }
}

// Export types and interfaces
export type {
  DomainBoundary,
  DomainRelationship,
  DomainMetrics,
  DomainAnalysis,
  DomainAnalysisConfig,
  CodeFile,
};
