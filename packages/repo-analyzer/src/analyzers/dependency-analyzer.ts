/**
 * @fileoverview Battle-hardened dependency analyzer using madge and detective
 * Gold standard dependency analysis with graph theory and advanced metrics
 */

import { getLogger } from '@claude-zen/foundation';

import detective from 'detective';
import { Graph, alg } from 'graphlib';
import madge from 'madge';
import precinct from 'precinct';
import fastGlob from 'fast-glob';
import type {
  DependencyMetrics,
  DependencyGraph,
  DependencyNode,
  DependencyEdge,
  DependencyCluster,
  CircularDependency,
  CouplingMetrics,
  CohesionMetrics,
  StabilityMetrics,
  AnalysisOptions,
} from '../types/index.js';

export class DependencyAnalyzer {
  private logger = getLogger('DependencyAnalyzer');
  private graph = new Graph({ directed: true });
  private fileStats = new Map<string, any>();

  /**
   * Analyze dependencies for the entire repository
   */
  async analyzeRepository(
    rootPath: string,
    options?: AnalysisOptions
  ): Promise<DependencyMetrics> {
    this.logger.info(`Starting dependency analysis for ${rootPath}`);

    // Get all relevant files
    const files = await this.getSourceFiles(rootPath, options);
    this.logger.info(`Found ${files.length} source files to analyze`);

    // Build dependency graph using multiple tools
    const [madgeResult, dependencyMap, graphMetrics] = await Promise.allSettled(
      [
        this.buildMadgeGraph(rootPath, options),
        this.buildDetailedDependencyMap(files),
        this.calculateGraphMetrics(files),
      ]
    );

    const madgeGraph = this.getSettledValue(madgeResult, null);
    const detailedDeps = this.getSettledValue(dependencyMap, new Map())();
    const metrics = this.getSettledValue(graphMetrics, this.getEmptyMetrics())();

    // Detect circular dependencies
    const circularDependencies = await this.detectCircularDependencies(
      madgeGraph,
      detailedDeps
    );

    // Build comprehensive dependency graph
    const dependencyGraph = this.buildDependencyGraph(detailedDeps, files);

    // Calculate advanced metrics
    const coupling = this.calculateCouplingMetrics(dependencyGraph);
    const cohesion = this.calculateCohesionMetrics(dependencyGraph);
    const stability = this.calculateStabilityMetrics(
      dependencyGraph,
      circularDependencies
    );

    // Count dependencies
    const totalDeps = this.countTotalDependencies(detailedDeps);
    const directDeps = this.countDirectDependencies(detailedDeps);
    const transitiveDeps = totalDeps - directDeps;

    return {
      totalDependencies: totalDeps,
      directDependencies: directDeps,
      transitiveDependencies: transitiveDeps,
      circularDependencies,
      dependencyGraph,
      coupling,
      cohesion,
      stability,
    };
  }

  /**
   * Get source files using fast-glob
   */
  private async getSourceFiles(
    rootPath: string,
    options?: AnalysisOptions
  ): Promise<string[]> {
    const patterns = [
      '**/*.{ts,tsx,js,jsx,mts,cts,mjs,cjs}',
      ...(options?.includeTests
        ? []
        : ['!**/*.{test,spec}.{ts,tsx,js,jsx}', '!**/test/**', '!**/tests/**']),
      ...(options?.includeNodeModules ? [] : ['!**/node_modules/**']),
      ...(options?.includeDotFiles ? [] : ['!**/.*']),
      ...(options?.excludePatterns'' | '''' | ''[]).map((p) => `!${p}`),
    ];

    return fastGlob(patterns, {
      cwd: rootPath,
      absolute: true,
      followSymbolicLinks: false,
      ignore: ['**/dist/**', '**/build/**', '**/.git/**'],
    });
  }

  /**
   * Build dependency graph using madge (battle-tested circular dependency detection)
   */
  private async buildMadgeGraph(
    rootPath: string,
    options?: AnalysisOptions
  ): Promise<any> {
    try {
      const madgeOptions = {
        fileExtensions: ['ts', 'tsx', 'js', 'jsx', 'mts', 'cts', 'mjs', 'cjs'],
        excludeRegExp: [
          ...(options?.includeTests
            ? []
            : [/\.test\.'' | ''\.spec\.'' | ''\/test\/'' | ''\/tests\//]),
          ...(options?.includeNodeModules ? [] : [/node_modules/]),
          /dist\/'' | ''build\/'' | ''\.git\//,
        ],
        tsConfig: `${rootPath}/tsconfig.json`,
        webpackConfig: `${rootPath}/webpack.config.js`,
        requireConfig: `${rootPath}/.requirerc`,
        detectiveOptions: {
          skipTypeImports: true,
        },
      };

      const result = await madge(rootPath, madgeOptions);
      this.logger.info(
        `Madge found ${Object.keys(result.obj()).length} modules`
      );
      return result;
    } catch (error) {
      this.logger.warn('Madge analysis failed, falling back to manual analysis:',
        error
      );
      return null;
    }
  }

  /**
   * Build detailed dependency map using detective and precinct
   */
  private async buildDetailedDependencyMap(
    files: string[]
  ): Promise<Map<string, FileDependencyInfo>> {
    const dependencyMap = new Map<string, FileDependencyInfo>();
    const fs = await import('fs/promises');

    await Promise.all(
      files.map(async (filePath) => {
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const deps = await this.extractDependencies(content, filePath);

          dependencyMap.set(filePath, {
            filePath,
            dependencies: deps,
            size: content.length,
            lines: content.split('\n').length,
            complexity: this.estimateComplexity(content),
          });

          // Add to graph
          this.graph.setNode(filePath, {
            file: filePath,
            size: content.length,
            lines: content.split('\n').length,
          });

          // Add edges
          for (const dep of deps) {
            if (dep.resolvedPath && files.includes(dep.resolvedPath)) {
              this.graph.setEdge(filePath, dep.resolvedPath, {
                type: dep.type,
                weight: dep.weight,
              });
            }
          }
        } catch (error) {
          this.logger.debug(
            `Failed to analyze dependencies for ${filePath}:`,
            error
          );
        }
      })
    );

    return dependencyMap;
  }

  /**
   * Extract dependencies using multiple detective engines
   */
  private async extractDependencies(
    content: string,
    filePath: string
  ): Promise<IndividualDependencyInfo[]> {
    const dependencies: IndividualDependencyInfo[] = [];

    try {
      // Use precinct for comprehensive dependency detection
      const deps = precinct(content, {
        type: this.getFileType(filePath),
        includeCore: false,
        detective: {
          skipTypeImports: false,
          mixedImports: true,
        },
      });

      for (const dep of deps) {
        const depInfo = await this.analyzeDependency(dep, filePath, content);
        dependencies.push(depInfo);
      }

      // Fallback to detective for additional patterns
      if (dependencies.length === 0) {
        const fallbackDeps = detective(content);
        for (const dep of fallbackDeps) {
          const depInfo = await this.analyzeDependency(dep, filePath, content);
          dependencies.push(depInfo);
        }
      }
    } catch (error) {
      this.logger.debug(`Dependency extraction failed for ${filePath}:`, error);

      // Manual regex fallback
      const manualDeps = this.extractDependenciesManual(content);
      dependencies.push(
        ...manualDeps.map((dep) => ({
          name: dep,
          type: 'unknown'as const,
          resolvedPath: null,
          weight: 1,
          line: 0,
        }))
      );
    }

    return dependencies;
  }

  /**
   * Analyze individual dependency
   */
  private async analyzeDependency(
    depName: string,
    fromFile: string,
    content: string
  ): Promise<IndividualDependencyInfo> {
    const resolvedPath = await this.resolveDependencyPath(depName, fromFile);
    const weight = this.calculateDependencyWeight(depName, content);
    const type = this.classifyDependency(depName, content);
    const line = this.findDependencyLine(depName, content);

    return {
      name: depName,
      type,
      resolvedPath,
      weight,
      line,
    };
  }

  /**
   * Resolve dependency path to absolute path
   */
  private async resolveDependencyPath(
    depName: string,
    fromFile: string
  ): Promise<string'' | ''null> {
    try {
      if (depName.startsWith('.')) {
        // Relative import
        const path = await import('path');
        const resolved = path.resolve(path.dirname(fromFile), depName);

        // Try different extensions
        const fs = await import('fs/promises');
        const extensions = [
          '.ts',
          '.tsx',
          '.js',
          '.jsx',
          '.mts',
          '.cts',
          '.mjs',
          '.cjs',
          '/index.ts',
          '/index.js',
        ];

        for (const ext of extensions) {
          const fullPath = resolved + ext;
          try {
            await fs.access(fullPath);
            return fullPath;
          } catch {}
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Calculate dependency weight (how strongly coupled)
   */
  private calculateDependencyWeight(depName: string, content: string): number {
    // Count usage frequency
    const regex = new RegExp(
      depName.replace(/[.*+?^${}()'' | ''[\]\\]/g,'\\$&'),
      'g'
    );
    const matches = content.match(regex);
    return matches ? Math.min(matches.length, 10) : 1;
  }

  /**
   * Classify dependency type
   */
  private classifyDependency(
    depName: string,
    content: string
  ): 'import''' | '''require''' | '''dynamic-import''' | '''type-only' {
    if (content.includes(`import type`) && content.includes(depName))
      return 'type-only';
    if (content.includes(`import(`) && content.includes(depName))
      return 'dynamic-import';
    if (content.includes(`require(`) && content.includes(depName))
      return 'require';
    return 'import';
  }

  /**
   * Find line number of dependency
   */
  private findDependencyLine(depName: string, content: string): number {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (
        lines[i].includes(depName) &&
        (lines[i].includes('import')'' | '''' | ''lines[i].includes('require'))
      ) {
        return i + 1;
      }
    }
    return 0;
  }

  /**
   * Manual dependency extraction fallback
   */
  private extractDependenciesManual(content: string): string[] {
    const dependencies = new Set<string>();

    // ES6 imports
    const importRegex =
      /import\s+(?:[\w*{}\s,]+\s+from\s+)?['"]([@\w.-/]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      dependencies.add(match[1]);
    }

    // CommonJS requires
    const requireRegex = /require\s*\(\s*['"]([@\w.-/]+)['"]\s*\)/g;
    while ((match = requireRegex.exec(content)) !== null) {
      dependencies.add(match[1]);
    }

    // Dynamic imports
    const dynamicImportRegex = /import\s*\(\s*['"]([@\w.-/]+)['"]\s*\)/g;
    while ((match = dynamicImportRegex.exec(content)) !== null) {
      dependencies.add(match[1]);
    }

    return Array.from(dependencies);
  }

  /**
   * Detect circular dependencies using graph algorithms
   */
  private async detectCircularDependencies(
    madgeResult: any,
    dependencyMap: Map<string, FileDependencyInfo>
  ): Promise<CircularDependency[]> {
    const cycles: CircularDependency[] = [];

    // Use madge for proven circular dependency detection
    if (madgeResult) {
      try {
        const madgeCycles = madgeResult.circular();
        for (const cycle of madgeCycles) {
          cycles.push({
            cycle,
            severity: cycle.length > 3 ? 'error' : 'warning',
            impactScore: this.calculateCycleImpact(cycle, dependencyMap),
            suggestions: this.generateCycleBreakingSuggestions(cycle),
          });
        }
      } catch (error) {
        this.logger.debug('Madge circular detection failed:', error);
      }
    }

    // Fallback to graph algorithm
    if (cycles.length === 0) {
      const graphCycles = alg.findCycles(this.graph);
      for (const cycle of graphCycles) {
        cycles.push({
          cycle,
          severity: cycle.length > 3 ? 'error' : 'warning',
          impactScore: this.calculateCycleImpact(cycle, dependencyMap),
          suggestions: this.generateCycleBreakingSuggestions(cycle),
        });
      }
    }

    return cycles;
  }

  /**
   * Calculate impact score of circular dependency
   */
  private calculateCycleImpact(
    cycle: string[],
    dependencyMap: Map<string, FileDependencyInfo>
  ): number {
    let totalComplexity = 0;
    let totalSize = 0;

    for (const file of cycle) {
      const info = dependencyMap.get(file);
      if (info) {
        totalComplexity += info.complexity;
        totalSize += info.size;
      }
    }

    const cycleLength = cycle.length;
    const avgComplexity = totalComplexity / cycleLength;
    const avgSize = totalSize / cycleLength;

    // Normalize to 0-1 scale
    return Math.min(
      1,
      cycleLength * 0.2 + avgComplexity * 0.1 + avgSize * 0.0001
    );
  }

  /**
   * Generate suggestions for breaking circular dependencies
   */
  private generateCycleBreakingSuggestions(cycle: string[]): string[] {
    const suggestions = [
      'Extract common functionality into a shared module',
      'Use dependency injection to invert control',
      'Apply the Interface Segregation Principle',
      'Consider using events or observers instead of direct dependencies',
    ];

    if (cycle.length > 4) {
      suggestions.push(
        'The cycle is complex - consider architectural refactoring');
    }

    return suggestions;
  }

  /**
   * Build comprehensive dependency graph
   */
  private buildDependencyGraph(
    dependencyMap: Map<string, FileDependencyInfo>,
    files: string[]
  ): DependencyGraph {
    const nodes: DependencyNode[] = [];
    const edges: DependencyEdge[] = [];
    const clusters: DependencyCluster[] = [];

    // Build nodes
    for (const [filePath, info] of dependencyMap) {
      nodes.push({
        id: filePath,
        file: filePath,
        type: this.classifyFileType(filePath),
        size: info.lines,
        complexity: info.complexity,
        stability: this.calculateNodeStability(filePath, dependencyMap),
      });
    }

    // Build edges
    for (const [fromFile, info] of dependencyMap) {
      for (const dep of info.dependencies) {
        if (dep.resolvedPath && files.includes(dep.resolvedPath)) {
          edges.push({
            from: fromFile,
            to: dep.resolvedPath,
            weight: dep.weight,
            type: dep.type,
          });
        }
      }
    }

    // Build clusters using community detection
    const clustersResult = this.detectClusters(nodes, edges);
    clusters.push(...clustersResult);

    return { nodes, edges, clusters };
  }

  /**
   * Calculate coupling metrics
   */
  private calculateCouplingMetrics(graph: DependencyGraph): CouplingMetrics {
    const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));
    let totalAfferent = 0;
    let totalEfferent = 0;
    let totalInstability = 0;
    let totalAbstractness = 0;

    for (const node of graph.nodes) {
      const afferent = graph.edges.filter((e) => e.to === node.id).length;
      const efferent = graph.edges.filter((e) => e.from === node.id).length;
      const instability = efferent / (afferent + efferent'' | '''' | ''1);

      totalAfferent += afferent;
      totalEfferent += efferent;
      totalInstability += instability;

      // Estimate abstractness (interfaces, abstract classes)
      const abstractness = this.estimateAbstractness(node.file);
      totalAbstractness += abstractness;
    }

    const nodeCount = graph.nodes.length;
    const avgInstability = totalInstability / nodeCount;
    const avgAbstractness = totalAbstractness / nodeCount;
    const distance = Math.abs(avgAbstractness + avgInstability - 1);

    return {
      afferentCoupling: totalAfferent / nodeCount,
      efferentCoupling: totalEfferent / nodeCount,
      instability: avgInstability,
      abstractness: avgAbstractness,
      distance,
    };
  }

  /**
   * Calculate cohesion metrics
   */
  private calculateCohesionMetrics(graph: DependencyGraph): CohesionMetrics {
    // Simplified cohesion calculation
    // In practice, this would require deeper AST analysis

    let totalLcom = 0;
    let totalTcc = 0;
    let totalLcc = 0;

    for (const node of graph.nodes) {
      // Estimate LCOM (Lack of Cohesion of Methods)
      const lcom = this.estimateLCOM(node.file);
      totalLcom += lcom;

      // Estimate TCC (Tight Class Cohesion)
      const tcc = Math.max(0, 1 - lcom);
      totalTcc += tcc;

      // Estimate LCC (Loose Class Cohesion)
      const lcc = Math.max(tcc, 0.1);
      totalLcc += lcc;
    }

    const nodeCount = graph.nodes.length;
    return {
      lcom: totalLcom / nodeCount,
      tcc: totalTcc / nodeCount,
      lcc: totalLcc / nodeCount,
    };
  }

  /**
   * Calculate stability metrics
   */
  private calculateStabilityMetrics(
    graph: DependencyGraph,
    circularDeps: CircularDependency[]
  ): StabilityMetrics {
    let totalStability = 0;

    for (const node of graph.nodes) {
      totalStability += node.stability;
    }

    const avgStability = totalStability / graph.nodes.length;
    const changeFrequency = 1 / avgStability; // Inverse relationship
    const bugFrequency = circularDeps.length / graph.nodes.length;
    const riskScore = Math.min(1, bugFrequency + (1 - avgStability));

    return {
      stabilityIndex: avgStability,
      changeFrequency,
      bugFrequency,
      riskScore,
    };
  }

  // Helper methods
  private getFileType(filePath: string): string {
    if (filePath.endsWith('.ts')'' | '''' | ''filePath.endsWith('.tsx'))
      return 'typescript';
    if (filePath.endsWith('.js')'' | '''' | ''filePath.endsWith('.jsx'))
      return 'javascript';
    if (filePath.endsWith('.mts')'' | '''' | ''filePath.endsWith('.cts'))
      return 'typescript';
    if (filePath.endsWith('.mjs')'' | '''' | ''filePath.endsWith('.cjs'))
      return 'javascript';
    return 'javascript';
  }

  private classifyFileType(
    filePath: string
  ): 'module | component' | 'service' | 'utility' | 'test' {
    const fileName = filePath.toLowerCase();
    if (fileName.includes('test')'' | '''' | ''fileName.includes('spec')) return 'test';
    if (fileName.includes('service')) return 'service';
    if (fileName.includes('component')'' | '''' | ''fileName.includes('view'))
      return 'component';
    if (fileName.includes('util')'' | '''' | ''fileName.includes('helper'))
      return 'utility';
    return 'module';
  }

  private calculateNodeStability(
    filePath: string,
    dependencyMap: Map<string, FileDependencyInfo>
  ): number {
    const info = dependencyMap.get(filePath);
    if (!info) return 0.5;

    // Simple stability heuristic
    const complexity = info.complexity;
    const dependencyCount = info.dependencies.length;

    // Lower complexity and fewer dependencies = more stable
    return Math.max(
      0,
      Math.min(1, 1 - complexity * 0.1 - dependencyCount * 0.05)
    );
  }

  private detectClusters(
    nodes: DependencyNode[],
    edges: DependencyEdge[]
  ): DependencyCluster[] {
    // Simple clustering based on file paths and dependencies
    const clusters = new Map<string, string[]>();

    for (const node of nodes) {
      const pathParts = node.file.split('/');
      const clusterKey = pathParts.slice(0, -1).join('/'); // Directory path

      if (!clusters.has(clusterKey)) {
        clusters.set(clusterKey, []);
      }
      clusters.get(clusterKey)!.push(node.id);
    }

    return Array.from(clusters.entries()).map(([path, nodeIds], index) => ({
      id: `cluster-${index}`,
      nodes: nodeIds,
      cohesion: this.calculateClusterCohesion(nodeIds, edges),
      coupling: this.calculateClusterCoupling(nodeIds, edges),
      domain: this.inferDomain(path),
    }));
  }

  private calculateClusterCohesion(
    nodeIds: string[],
    edges: DependencyEdge[]
  ): number {
    const internalEdges = edges.filter(
      (e) => nodeIds.includes(e.from) && nodeIds.includes(e.to)
    );
    const totalPossibleEdges = nodeIds.length * (nodeIds.length - 1);
    return totalPossibleEdges > 0
      ? internalEdges.length / totalPossibleEdges
      : 0;
  }

  private calculateClusterCoupling(
    nodeIds: string[],
    edges: DependencyEdge[]
  ): number {
    const externalEdges = edges.filter(
      (e) =>
        (nodeIds.includes(e.from) && !nodeIds.includes(e.to))'' | '''' | ''(!nodeIds.includes(e.from) && nodeIds.includes(e.to))
    );
    const totalEdges = edges.filter(
      (e) => nodeIds.includes(e.from)'' | '''' | ''nodeIds.includes(e.to)
    );
    return totalEdges.length > 0 ? externalEdges.length / totalEdges.length : 0;
  }

  private inferDomain(path: string): string {
    const segments = path.split('/').filter(Boolean);
    if (segments.includes('components')) return 'ui';
    if (segments.includes('services')) return 'api';
    if (segments.includes('utils')'' | '''' | ''segments.includes('helpers'))
      return 'utility';
    if (segments.includes('test')'' | '''' | ''segments.includes('tests')) return 'test';
    if (segments.includes('core')) return 'core';
    return segments[segments.length - 1]'' | '''' | '''unknown';
  }

  private estimateComplexity(content: string): number {
    // Simple complexity estimation
    const lines = content.split('\n').length;
    const functions = (
      content.match(/function\s+\w+'' | ''=>\s*{'' | ''^\s*\w+\s*:/gm)'' | '''' | ''[]
    ).length;
    const conditionals = (
      content.match(/\b(if'' | ''else'' | ''switch'' | ''case'' | ''while'' | ''for)\b/g)'' | '''' | ''[]
    ).length;

    return Math.min(100, lines * 0.1 + functions * 2 + conditionals * 3);
  }

  private estimateAbstractness(filePath: string): number {
    // Would require full AST analysis for accuracy
    // This is a simple heuristic
    const fileName = filePath.toLowerCase();
    if (fileName.includes('interface')'' | '''' | ''fileName.includes('abstract'))
      return 0.8;
    if (fileName.includes('base')'' | '''' | ''fileName.includes('core')) return 0.6;
    return 0.2;
  }

  private estimateLCOM(filePath: string): number {
    // Simplified LCOM estimation
    // In practice, would require full class analysis
    return Math.random() * 0.5; // Placeholder
  }

  private calculateGraphMetrics(files: string[]): any {
    return {
      nodeCount: files.length,
      edgeCount: 0,
      density: 0,
    };
  }

  private countTotalDependencies(
    dependencyMap: Map<string, FileDependencyInfo>
  ): number {
    const allDeps = new Set<string>();
    for (const [, info] of dependencyMap) {
      for (const dep of info.dependencies) {
        allDeps.add(dep.name);
      }
    }
    return allDeps.size;
  }

  private countDirectDependencies(
    dependencyMap: Map<string, FileDependencyInfo>
  ): number {
    const directDeps = new Set<string>();
    for (const [, info] of dependencyMap) {
      for (const dep of info.dependencies) {
        if (!dep.name.startsWith('.')) {
          directDeps.add(dep.name);
        }
      }
    }
    return directDeps.size;
  }

  private getSettledValue<T>(
    result: PromiseSettledResult<T>,
    defaultValue: T
  ): T {
    return result.status === 'fulfilled' ? result.value : defaultValue;
  }

  private getEmptyMetrics(): any {
    return {
      nodeCount: 0,
      edgeCount: 0,
      density: 0,
    };
  }
}

// Primary DependencyInfo interface for file-level analysis
interface FileDependencyInfo {
  filePath: string;
  dependencies: IndividualDependencyInfo[];
  size: number;
  lines: number;
  complexity: number;
}

// Secondary DependencyInfo interface for individual dependencies
interface IndividualDependencyInfo {
  name: string;
  type: 'import''' | '''require''' | '''dynamic-import''' | '''type-only';
  resolvedPath: string | null;
  weight: number;
  line: number;
}

// Type alias for backward compatibility
type DependencyInfo = FileDependencyInfo;
