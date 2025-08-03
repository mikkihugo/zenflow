/**
 * Domain analyzer for complexity analysis and splitting recommendations
 */

import * as acorn from 'acorn';
import * as escomplex from 'escomplex';
import * as fs from 'fs-extra';
import { glob } from 'glob';
import * as path from 'path';
import type {
  AnalysisConfig,
  ComplexityAnalysis,
  DEFAULT_ANALYSIS_CONFIG,
  DependencyAnalysisResult,
  FileAnalysis,
  SplittingScore,
} from '../types/analysis-types.ts';
import type {
  CouplingAnalysis,
  DependencyGraph,
  DomainAnalysis,
  FileCategoryMap,
  SplittingMetrics,
  SplittingRecommendation,
  SubDomainPlan,
} from '../types/domain-types.ts';

export interface DomainAnalyzer {
  analyzeDomainComplexity(domainPath: string): Promise<DomainAnalysis>;
  identifySubDomains(analysis: DomainAnalysis): Promise<SubDomainPlan[]>;
  calculateSplittingBenefits(plan: SubDomainPlan[]): Promise<SplittingMetrics>;
}

export class DomainAnalysisEngine implements DomainAnalyzer {
  private config: AnalysisConfig;

  constructor(config: AnalysisConfig = DEFAULT_ANALYSIS_CONFIG) {
    this.config = config;
  }

  async analyzeDomainComplexity(domainPath: string): Promise<DomainAnalysis> {
    console.log(`🔍 Analyzing domain complexity for: ${domainPath}`);

    // Scan domain files
    const files = await this.scanDomainFiles(domainPath);
    console.log(`📁 Found ${files.length} files`);

    // Analyze individual files
    const fileAnalyses = await Promise.all(files.map((file) => this.analyzeFile(file)));

    // Categorize files by purpose
    const categories = await this.categorizeFiles(fileAnalyses);
    console.log(
      `📂 Categorized into ${Object.keys(categories).filter((k) => categories[k].length > 0).length} categories`
    );

    // Build dependency graph
    const dependencies = await this.buildDependencyGraph(fileAnalyses);
    console.log(
      `🔗 Built dependency graph with ${dependencies.nodes.length} nodes, ${dependencies.edges.length} edges`
    );

    // Analyze coupling
    const coupling = await this.analyzeCoupling(fileAnalyses, dependencies);
    console.log(`🔄 Coupling analysis complete`);

    // Calculate complexity score
    const complexityScore = this.calculateComplexity(fileAnalyses, dependencies);
    console.log(`📊 Overall complexity score: ${complexityScore.toFixed(2)}`);

    // Generate splitting recommendations
    const splittingRecommendations = await this.generateRecommendations(
      fileAnalyses,
      categories,
      coupling,
      dependencies
    );
    console.log(`💡 Generated ${splittingRecommendations.length} recommendations`);

    return {
      domainPath,
      totalFiles: files.length,
      categories,
      dependencies,
      coupling,
      complexityScore,
      splittingRecommendations,
    };
  }

  async identifySubDomains(analysis: DomainAnalysis): Promise<SubDomainPlan[]> {
    console.log(`🎯 Identifying sub-domains for ${analysis.domainPath}`);

    const plans: SubDomainPlan[] = [];

    // Generate plans based on file categories
    const categoryBasedPlan = this.generateCategoryBasedPlan(analysis);
    if (categoryBasedPlan) {
      plans.push(categoryBasedPlan);
    }

    // Generate plans based on coupling analysis
    const couplingBasedPlan = this.generateCouplingBasedPlan(analysis);
    if (couplingBasedPlan) {
      plans.push(couplingBasedPlan);
    }

    // Generate plans based on dependency clusters
    const dependencyBasedPlan = this.generateDependencyBasedPlan(analysis);
    if (dependencyBasedPlan) {
      plans.push(dependencyBasedPlan);
    }

    console.log(`📋 Generated ${plans.length} potential splitting plans`);
    return plans;
  }

  async calculateSplittingBenefits(plans: SubDomainPlan[]): Promise<SplittingMetrics> {
    console.log(`📈 Calculating splitting benefits for ${plans.length} plans`);

    // For now, return estimated metrics based on plan structure
    // In a real implementation, this would run more sophisticated analysis

    const totalSubDomains = plans.reduce((sum, plan) => sum + plan.targetSubDomains.length, 0);
    const averageFilesPerSubDomain =
      plans.length > 0
        ? plans[0].targetSubDomains.reduce((sum, sub) => sum + sub.estimatedFiles, 0) /
          plans[0].targetSubDomains.length
        : 0;

    return {
      complexityReduction: Math.min(0.4, totalSubDomains * 0.05), // 5% per sub-domain, max 40%
      maintainabilityImprovement: Math.min(0.6, averageFilesPerSubDomain > 30 ? 0.6 : 0.3),
      buildTimeImpact: -0.1, // Slight increase due to more modules
      testTimeImpact: 0.2, // Improvement due to better isolation
      migrationEffort: totalSubDomains * 2, // 2 hours per sub-domain
    };
  }

  private async scanDomainFiles(domainPath: string): Promise<string[]> {
    const pattern = path.join(domainPath, '**/*.{ts,js,tsx,jsx}');
    const files = await glob(pattern, {
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/*.d.ts'],
    });

    return files.filter((file) => {
      if ((!this.config.includeTests && file.includes('.test.')) || file.includes('.spec.')) {
        return false;
      }
      if (!this.config.includeConfig && (file.includes('config') || file.includes('setup'))) {
        return false;
      }
      return true;
    });
  }

  private async analyzeFile(filePath: string): Promise<FileAnalysis> {
    const content = await fs.readFile(filePath, 'utf-8');
    const stats = await fs.stat(filePath);

    const linesOfCode = content
      .split('\n')
      .filter(
        (line) => line.trim() && !line.trim().startsWith('//') && !line.trim().startsWith('*')
      ).length;

    let complexity = 1;
    let imports: any[] = [];
    let exports: any[] = [];

    try {
      // Parse with acorn for syntax tree analysis
      const ast = acorn.parse(content, {
        ecmaVersion: 2022,
        sourceType: 'module',
        allowImportExportEverywhere: true,
      });

      // Extract imports and exports
      imports = this.extractImports(ast);
      exports = this.extractExports(ast);

      // Calculate complexity using escomplex
      try {
        const complexityResult = escomplex.analyse(content);
        complexity = complexityResult.aggregate?.complexity?.cyclomatic || 1;
      } catch (e) {
        // Fallback to simple complexity calculation
        complexity = this.calculateSimpleComplexity(content);
      }
    } catch (e) {
      // If parsing fails, do basic analysis
      imports = this.extractImportsBasic(content);
      exports = this.extractExportsBasic(content);
      complexity = this.calculateSimpleComplexity(content);
    }

    const category = this.categorizeFile(filePath, content, imports, exports);
    const purpose = this.determinePurpose(filePath, content);

    return {
      path: filePath,
      size: stats.size,
      linesOfCode,
      complexity,
      imports,
      exports,
      category,
      purpose,
      quality: {
        maintainabilityIndex: Math.max(0, 100 - complexity * 5),
        technicalDebt: complexity > 10 ? complexity * 2 : 0,
        cyclomaticComplexity: complexity,
        duplicatedCode: 0, // Would need more sophisticated analysis
      },
    };
  }

  private extractImports(ast: any): any[] {
    const imports: any[] = [];

    const walk = (node: any) => {
      if (node.type === 'ImportDeclaration') {
        imports.push({
          module: node.source.value,
          type: 'import',
          specifiers: node.specifiers?.map((s: any) => s.local?.name || s.imported?.name) || [],
          isRelative: node.source.value.startsWith('.'),
          external: !node.source.value.startsWith('.'),
        });
      } else if (node.type === 'CallExpression' && node.callee?.name === 'require') {
        imports.push({
          module: node.arguments?.[0]?.value || '',
          type: 'require',
          specifiers: [],
          isRelative: node.arguments?.[0]?.value?.startsWith('.') || false,
          external: !node.arguments?.[0]?.value?.startsWith('.'),
        });
      }

      for (const key in node) {
        if (typeof node[key] === 'object' && node[key] !== null) {
          if (Array.isArray(node[key])) {
            node[key].forEach(walk);
          } else {
            walk(node[key]);
          }
        }
      }
    };

    walk(ast);
    return imports;
  }

  private extractExports(ast: any): any[] {
    const exports: any[] = [];

    const walk = (node: any) => {
      if (node.type === 'ExportNamedDeclaration') {
        if (node.declaration) {
          if (node.declaration.type === 'FunctionDeclaration') {
            exports.push({
              name: node.declaration.id?.name || 'anonymous',
              type: 'function',
              isPublic: true,
            });
          } else if (node.declaration.type === 'ClassDeclaration') {
            exports.push({
              name: node.declaration.id?.name || 'anonymous',
              type: 'class',
              isPublic: true,
            });
          } else if (node.declaration.type === 'VariableDeclaration') {
            node.declaration.declarations?.forEach((decl: any) => {
              exports.push({
                name: decl.id?.name || 'anonymous',
                type: 'constant',
                isPublic: true,
              });
            });
          }
        }
      } else if (node.type === 'ExportDefaultDeclaration') {
        exports.push({
          name: 'default',
          type: 'default',
          isPublic: true,
        });
      }

      for (const key in node) {
        if (typeof node[key] === 'object' && node[key] !== null) {
          if (Array.isArray(node[key])) {
            node[key].forEach(walk);
          } else {
            walk(node[key]);
          }
        }
      }
    };

    walk(ast);
    return exports;
  }

  private extractImportsBasic(content: string): any[] {
    const imports: any[] = [];
    const importRegex = /import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g;
    const requireRegex = /require\(['"`]([^'"`]+)['"`]\)/g;

    let match;
    while ((match = importRegex.exec(content)) !== null) {
      imports.push({
        module: match[1],
        type: 'import',
        specifiers: [],
        isRelative: match[1].startsWith('.'),
        external: !match[1].startsWith('.'),
      });
    }

    while ((match = requireRegex.exec(content)) !== null) {
      imports.push({
        module: match[1],
        type: 'require',
        specifiers: [],
        isRelative: match[1].startsWith('.'),
        external: !match[1].startsWith('.'),
      });
    }

    return imports;
  }

  private extractExportsBasic(content: string): any[] {
    const exports: any[] = [];
    const exportRegex =
      /export\s+(default\s+)?(function|class|const|let|var|interface|type)\s+(\w+)/g;

    let match;
    while ((match = exportRegex.exec(content)) !== null) {
      exports.push({
        name: match[3],
        type:
          match[2] === 'function'
            ? 'function'
            : match[2] === 'class'
              ? 'class'
              : match[2] === 'interface'
                ? 'interface'
                : match[2] === 'type'
                  ? 'type'
                  : 'constant',
        isPublic: true,
      });
    }

    return exports;
  }

  private calculateSimpleComplexity(content: string): number {
    const complexityKeywords = [
      'if',
      'else',
      'while',
      'for',
      'switch',
      'case',
      'try',
      'catch',
      'forEach',
      'map',
      'filter',
      'reduce',
      '&&',
      '||',
      '?',
    ];

    let complexity = 1;
    for (const keyword of complexityKeywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = content.match(regex);
      if (matches) {
        complexity += matches.length;
      }
    }

    return complexity;
  }

  private categorizeFile(
    filePath: string,
    content: string,
    imports: any[],
    exports: any[]
  ): string {
    const filename = path.basename(filePath).toLowerCase();
    const directory = path.dirname(filePath).toLowerCase();

    // Category patterns based on file location and content
    if (filename.includes('test') || filename.includes('spec')) return 'tests';
    if (filename.includes('config') || filename.includes('setup')) return 'configuration';
    if (directory.includes('wasm') || filename.includes('wasm')) return 'wasm';
    if (directory.includes('agent') || filename.includes('agent')) return 'agents';
    if (directory.includes('coordination') || filename.includes('coordination'))
      return 'coordination';
    if (directory.includes('model') || filename.includes('model') || directory.includes('preset'))
      return 'models';
    if (directory.includes('core') || filename.includes('core')) return 'core-algorithms';
    if (filename.includes('bridge') || content.includes('bridge')) return 'bridge';
    if (directory.includes('util') || filename.includes('util')) return 'utilities';
    if (filename.includes('index')) return 'integration';

    // Analyze content for categorization
    if (content.includes('neural') && content.includes('network')) return 'network-architectures';
    if (content.includes('train') || content.includes('optimizer')) return 'training-systems';
    if (content.includes('data') && content.includes('process')) return 'data-processing';
    if (content.includes('metric') || content.includes('evaluat')) return 'evaluation-metrics';
    if (content.includes('visual') || content.includes('chart')) return 'visualization';

    return 'utilities';
  }

  private determinePurpose(filePath: string, content: string): any {
    const filename = path.basename(filePath).toLowerCase();

    if (filename.includes('test') || filename.includes('spec')) {
      return { primary: 'test', confidence: 0.9 };
    }
    if (filename.includes('config')) {
      return { primary: 'config', confidence: 0.9 };
    }
    if (content.includes('class') && content.includes('extends')) {
      return { primary: 'algorithm', confidence: 0.7 };
    }
    if (content.includes('interface') || content.includes('type')) {
      return { primary: 'data', confidence: 0.8 };
    }
    if (content.includes('render') || content.includes('component')) {
      return { primary: 'ui', confidence: 0.8 };
    }

    return { primary: 'utility', confidence: 0.5 };
  }

  private async categorizeFiles(fileAnalyses: FileAnalysis[]): Promise<FileCategoryMap> {
    const categories: FileCategoryMap = {
      'core-algorithms': [],
      'training-systems': [],
      'network-architectures': [],
      'data-processing': [],
      'evaluation-metrics': [],
      visualization: [],
      integration: [],
      agents: [],
      coordination: [],
      utilities: [],
      tests: [],
      configuration: [],
      bridge: [],
      wasm: [],
      models: [],
    };

    for (const analysis of fileAnalyses) {
      const category = analysis.category as keyof FileCategoryMap;
      if (categories[category]) {
        categories[category].push(analysis.path);
      } else {
        categories.utilities.push(analysis.path);
      }
    }

    return categories;
  }

  private async buildDependencyGraph(fileAnalyses: FileAnalysis[]): Promise<DependencyGraph> {
    const nodes = fileAnalyses.map((analysis) => ({
      id: analysis.path,
      file: analysis.path,
      imports: analysis.imports.map((imp: any) => imp.module),
      exports: analysis.exports.map((exp: any) => exp.name),
      type:
        analysis.purpose.primary === 'test'
          ? ('test' as const)
          : analysis.purpose.primary === 'config'
            ? ('config' as const)
            : analysis.purpose.primary === 'utility'
              ? ('utility' as const)
              : ('module' as const),
    }));

    const edges = [];
    for (const analysis of fileAnalyses) {
      for (const imp of analysis.imports) {
        if (imp.isRelative) {
          const resolvedPath = this.resolveRelativePath(analysis.path, imp.module);
          if (fileAnalyses.some((f) => f.path === resolvedPath)) {
            edges.push({
              from: analysis.path,
              to: resolvedPath,
              type: imp.type as 'import' | 'require' | 'dynamic',
              weight: 1,
            });
          }
        }
      }
    }

    return { nodes, edges };
  }

  private resolveRelativePath(fromFile: string, importPath: string): string {
    const fromDir = path.dirname(fromFile);
    const resolved = path.resolve(fromDir, importPath);

    // Try different extensions
    const extensions = ['.ts', '.js', '.tsx', '.jsx'];
    for (const ext of extensions) {
      const withExt = resolved + ext;
      if (fs.existsSync(withExt)) {
        return withExt;
      }
    }

    // Try as directory with index
    for (const ext of extensions) {
      const indexPath = path.join(resolved, `index${ext}`);
      if (fs.existsSync(indexPath)) {
        return indexPath;
      }
    }

    return resolved;
  }

  private async analyzeCoupling(
    fileAnalyses: FileAnalysis[],
    dependencies: DependencyGraph
  ): Promise<CouplingAnalysis> {
    const tightlyCoupledGroups = this.findTightlyCoupledGroups(dependencies);
    const couplingScores = this.calculateCouplingScores(dependencies);

    return {
      tightlyCoupledGroups,
      averageCoupling: couplingScores.average,
      maxCoupling: couplingScores.max,
      isolatedFiles: couplingScores.isolated,
    };
  }

  private findTightlyCoupledGroups(dependencies: DependencyGraph): any[] {
    const groups = [];
    const visited = new Set<string>();

    for (const node of dependencies.nodes) {
      if (visited.has(node.id)) continue;

      const connectedNodes = this.findConnectedNodes(node.id, dependencies);
      if (connectedNodes.length > 1) {
        const sharedDeps = this.findSharedDependencies(connectedNodes, dependencies);

        groups.push({
          files: connectedNodes,
          couplingScore: this.calculateGroupCoupling(connectedNodes, dependencies),
          sharedDependencies: sharedDeps,
        });

        connectedNodes.forEach((nodeId) => visited.add(nodeId));
      }
    }

    return groups.filter((group) => group.couplingScore > this.config.coupling.threshold);
  }

  private findConnectedNodes(startNode: string, dependencies: DependencyGraph): string[] {
    const connected = new Set([startNode]);
    const queue = [startNode];

    while (queue.length > 0) {
      const current = queue.shift()!;

      // Find nodes that depend on current or current depends on
      for (const edge of dependencies.edges) {
        if (edge.from === current && !connected.has(edge.to)) {
          connected.add(edge.to);
          queue.push(edge.to);
        } else if (edge.to === current && !connected.has(edge.from)) {
          connected.add(edge.from);
          queue.push(edge.from);
        }
      }
    }

    return Array.from(connected);
  }

  private findSharedDependencies(nodes: string[], dependencies: DependencyGraph): string[] {
    const depCounts = new Map<string, number>();

    for (const nodeId of nodes) {
      const node = dependencies.nodes.find((n) => n.id === nodeId);
      if (node) {
        for (const imp of node.imports) {
          depCounts.set(imp, (depCounts.get(imp) || 0) + 1);
        }
      }
    }

    return Array.from(depCounts.entries())
      .filter(([dep, count]) => count > 1)
      .map(([dep]) => dep);
  }

  private calculateGroupCoupling(nodes: string[], dependencies: DependencyGraph): number {
    let totalConnections = 0;
    const possibleConnections = nodes.length * (nodes.length - 1);

    for (const edge of dependencies.edges) {
      if (nodes.includes(edge.from) && nodes.includes(edge.to)) {
        totalConnections++;
      }
    }

    return possibleConnections > 0 ? totalConnections / possibleConnections : 0;
  }

  private calculateCouplingScores(dependencies: DependencyGraph): {
    average: number;
    max: number;
    isolated: string[];
  } {
    const scores = new Map<string, number>();
    const isolated: string[] = [];

    for (const node of dependencies.nodes) {
      const incomingEdges = dependencies.edges.filter((e) => e.to === node.id).length;
      const outgoingEdges = dependencies.edges.filter((e) => e.from === node.id).length;
      const totalEdges = incomingEdges + outgoingEdges;

      scores.set(node.id, totalEdges);

      if (totalEdges === 0) {
        isolated.push(node.id);
      }
    }

    const allScores = Array.from(scores.values());
    const average =
      allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 0;
    const max = allScores.length > 0 ? Math.max(...allScores) : 0;

    return { average, max, isolated };
  }

  private calculateComplexity(fileAnalyses: FileAnalysis[], dependencies: DependencyGraph): number {
    const fileComplexity = Math.log(fileAnalyses.length) / Math.log(10);
    const avgFileComplexity =
      fileAnalyses.reduce((sum, f) => sum + f.complexity, 0) / fileAnalyses.length;
    const dependencyComplexity = dependencies.edges.length / dependencies.nodes.length ** 2;

    return fileComplexity * 0.3 + avgFileComplexity * 0.4 + dependencyComplexity * 100 * 0.3;
  }

  private async generateRecommendations(
    fileAnalyses: FileAnalysis[],
    categories: FileCategoryMap,
    coupling: CouplingAnalysis,
    dependencies: DependencyGraph
  ): Promise<SplittingRecommendation[]> {
    const recommendations: SplittingRecommendation[] = [];

    // Recommend extracting large categories
    for (const [category, files] of Object.entries(categories)) {
      if (files.length >= this.config.minFilesForSplit) {
        recommendations.push({
          type: 'extract-subdomain',
          description: `Extract ${category} into separate sub-domain (${files.length} files)`,
          files,
          estimatedBenefit: Math.min(0.8, files.length * 0.05),
          estimatedEffort: files.length * 0.1,
        });
      }
    }

    // Recommend extracting tightly coupled groups
    for (const group of coupling.tightlyCoupledGroups) {
      if (group.files.length >= 3) {
        recommendations.push({
          type: 'extract-subdomain',
          description: `Extract tightly coupled group (coupling: ${group.couplingScore.toFixed(2)})`,
          files: group.files,
          estimatedBenefit: group.couplingScore,
          estimatedEffort: group.files.length * 0.15,
        });
      }
    }

    // Recommend creating shared utilities
    const utilityFiles = categories.utilities;
    if (utilityFiles.length > 5) {
      recommendations.push({
        type: 'create-shared-utility',
        description: `Consolidate utility functions into shared utility module`,
        files: utilityFiles,
        estimatedBenefit: 0.3,
        estimatedEffort: utilityFiles.length * 0.05,
      });
    }

    return recommendations.sort((a, b) => b.estimatedBenefit - a.estimatedBenefit);
  }

  private generateCategoryBasedPlan(analysis: DomainAnalysis): SubDomainPlan | null {
    const categories = analysis.categories;
    const nonEmptyCategories = Object.entries(categories).filter(([_, files]) => files.length > 0);

    if (nonEmptyCategories.length < 2) {
      return null;
    }

    const targetSubDomains = nonEmptyCategories
      .filter(([_, files]) => files.length >= 2) // Only include categories with multiple files
      .map(([category, files]) => ({
        name: `${path.basename(analysis.domainPath)}-${category}`,
        description: `${category.replace(/-/g, ' ')} functionality`,
        estimatedFiles: files.length,
        dependencies: this.inferDependencies(category),
        files,
      }));

    if (targetSubDomains.length === 0) {
      return null;
    }

    return {
      sourceDomain: path.basename(analysis.domainPath),
      targetSubDomains,
    };
  }

  private generateCouplingBasedPlan(analysis: DomainAnalysis): SubDomainPlan | null {
    const coupling = analysis.coupling;

    if (coupling.tightlyCoupledGroups.length === 0) {
      return null;
    }

    const targetSubDomains = coupling.tightlyCoupledGroups
      .filter((group) => group.files.length >= 3)
      .map((group, index) => ({
        name: `${path.basename(analysis.domainPath)}-cluster-${index + 1}`,
        description: `Tightly coupled component cluster (coupling: ${group.couplingScore.toFixed(2)})`,
        estimatedFiles: group.files.length,
        dependencies: ['utils', 'core'],
        files: group.files,
      }));

    if (targetSubDomains.length === 0) {
      return null;
    }

    return {
      sourceDomain: path.basename(analysis.domainPath),
      targetSubDomains,
    };
  }

  private generateDependencyBasedPlan(analysis: DomainAnalysis): SubDomainPlan | null {
    // This would implement dependency-based clustering
    // For now, return null as it's a complex algorithm
    return null;
  }

  private inferDependencies(category: string): string[] {
    const baseDependencies = ['utils', 'core'];

    switch (category) {
      case 'agents':
        return [...baseDependencies, 'coordination'];
      case 'coordination':
        return [...baseDependencies, 'agents'];
      case 'models':
        return [...baseDependencies, 'core-algorithms'];
      case 'wasm':
        return [...baseDependencies];
      case 'bridge':
        return [...baseDependencies, 'models', 'wasm'];
      default:
        return baseDependencies;
    }
  }
}
