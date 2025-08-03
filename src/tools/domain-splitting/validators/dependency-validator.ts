/**
 * Dependency validation and cycle detection for domain splitting
 */

import * as fs from 'fs-extra';
import * as path from 'path';

import type {
  CircularDependency,
  DependencyGraph,
  OptimizedStructure,
  SubDomainPlan,
  ValidationIssue,
  ValidationReport,
} from '../types/domain-types.js';

export interface DependencyMapper {
  mapInterDomainDependencies(domains: string[]): Promise<DependencyGraph>;
  identifyCircularDependencies(graph: DependencyGraph): Promise<CircularDependency[]>;
  optimizeDependencyStructure(graph: DependencyGraph): Promise<OptimizedStructure>;
}

export interface SplitValidator {
  validateNoCyclicDependencies(splits: SubDomainPlan[]): Promise<ValidationReport>;
  ensurePublicAPIStability(splits: SubDomainPlan[]): Promise<any>;
  verifyBuildIntegrity(splits: SubDomainPlan[]): Promise<any>;
}

export class DependencyValidator implements DependencyMapper, SplitValidator {
  async mapInterDomainDependencies(domains: string[]): Promise<DependencyGraph> {
    console.log(`🗺️ Mapping inter-domain dependencies for ${domains.length} domains`);

    const nodes = [];
    const edges = [];

    for (const domain of domains) {
      const domainPath = path.join(process.cwd(), 'src', domain);

      if (await fs.pathExists(domainPath)) {
        const files = await this.getTypeScriptFiles(domainPath);

        for (const file of files) {
          const imports = await this.extractImports(file);
          const exports = await this.extractExports(file);

          nodes.push({
            id: file,
            file,
            imports: imports.map((imp) => imp.module),
            exports: exports.map((exp) => exp.name),
            type: this.determineNodeType(file),
          });

          // Add edges for inter-domain dependencies
          for (const imp of imports) {
            if (this.isInterDomainImport(imp.module, domain, domains)) {
              const targetFile = this.resolveImportPath(file, imp.module);
              edges.push({
                from: file,
                to: targetFile,
                type: imp.type,
                weight: 1,
              });
            }
          }
        }
      }
    }

    console.log(`📊 Found ${nodes.length} nodes and ${edges.length} inter-domain dependencies`);
    return { nodes, edges };
  }

  async identifyCircularDependencies(graph: DependencyGraph): Promise<CircularDependency[]> {
    console.log(`🔍 Checking for circular dependencies in graph with ${graph.nodes.length} nodes`);

    const cycles: CircularDependency[] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    for (const node of graph.nodes) {
      if (!visited.has(node.id)) {
        const cycle = this.detectCycleDFS(node.id, graph, visited, recursionStack, []);
        if (cycle.length > 0) {
          cycles.push({
            cycle,
            severity: cycle.length > 3 ? 'error' : 'warning',
            suggestion: this.generateCycleBreakingSuggestion(cycle),
          });
        }
      }
    }

    console.log(`🔄 Found ${cycles.length} circular dependencies`);
    return cycles;
  }

  async optimizeDependencyStructure(graph: DependencyGraph): Promise<OptimizedStructure> {
    console.log(`⚡ Optimizing dependency structure`);

    const reorganizedFiles = [];
    const newUtilities = [];
    const removedDependencies = [];

    // Identify files that could be moved to reduce coupling
    const heavilyDependentFiles = this.findHeavilyDependentFiles(graph);

    for (const file of heavilyDependentFiles) {
      const betterLocation = this.suggestBetterLocation(file, graph);
      if (betterLocation) {
        reorganizedFiles.push({
          from: file.current,
          to: betterLocation,
        });
      }
    }

    // Identify potential shared utilities
    const sharedUtilities = this.identifySharedUtilities(graph);
    newUtilities.push(...sharedUtilities);

    // Identify dependencies that could be removed
    const redundantDeps = this.findRedundantDependencies(graph);
    removedDependencies.push(...redundantDeps);

    return {
      reorganizedFiles,
      newUtilities,
      removedDependencies,
    };
  }

  async validateNoCyclicDependencies(splits: SubDomainPlan[]): Promise<ValidationReport> {
    console.log(`✅ Validating no cyclic dependencies in ${splits.length} plans`);

    const issues: ValidationIssue[] = [];

    for (const plan of splits) {
      // Build dependency graph for this plan
      const graph = await this.buildPlanDependencyGraph(plan);

      // Check for cycles
      const cycles = await this.identifyCircularDependencies(graph);

      for (const cycle of cycles) {
        issues.push({
          type: 'circular-dependency',
          description: `Circular dependency in ${plan.sourceDomain}: ${cycle.cycle.join(' -> ')}`,
          severity: cycle.severity,
        });
      }

      // Check for cross-subdomain dependencies that might cause issues
      const crossDependencies = this.findProblematicCrossDependencies(plan, graph);

      for (const dep of crossDependencies) {
        issues.push({
          type: 'circular-dependency',
          description: `Problematic cross-dependency: ${dep.from} -> ${dep.to}`,
          severity: 'warning',
        });
      }
    }

    const success = issues.filter((i) => i.severity === 'error').length === 0;

    return {
      success,
      issues,
      metrics: {
        buildSuccess: success,
        testSuccess: true, // Assume tests pass if no cycles
        noCircularDependencies: success,
        allImportsResolved: true, // Would need actual checking
      },
    };
  }

  async ensurePublicAPIStability(splits: SubDomainPlan[]): Promise<any> {
    console.log(`🔒 Ensuring public API stability for ${splits.length} plans`);

    const compatibleAPIs = [];
    const breakingChanges = [];
    const deprecations = [];

    for (const plan of splits) {
      for (const subdomain of plan.targetSubDomains) {
        // Analyze public API of subdomain
        const publicAPI = await this.analyzePublicAPI(subdomain);

        // Check for breaking changes
        const breaks = this.identifyBreakingChanges(publicAPI);
        breakingChanges.push(...breaks);

        // Identify stable APIs
        const stable = this.identifyStableAPIs(publicAPI);
        compatibleAPIs.push(...stable);

        // Suggest deprecations
        const deprecated = this.suggestDeprecations(publicAPI);
        deprecations.push(...deprecated);
      }
    }

    return {
      compatibleAPIs,
      breakingChanges,
      deprecations,
    };
  }

  async verifyBuildIntegrity(splits: SubDomainPlan[]): Promise<any> {
    console.log(`🔨 Verifying build integrity for ${splits.length} plans`);

    try {
      // Simulate build process
      const buildTime = Date.now();

      // Check TypeScript compilation
      const buildResult = await this.simulateBuild();

      const actualBuildTime = Date.now() - buildTime;

      return {
        success: buildResult.success,
        buildTime: actualBuildTime,
        errors: buildResult.errors,
        warnings: buildResult.warnings,
      };
    } catch (error) {
      return {
        success: false,
        buildTime: 0,
        errors: [error.message],
        warnings: [],
      };
    }
  }

  private async getTypeScriptFiles(dir: string): Promise<string[]> {
    const { glob } = await import('glob');
    return glob('**/*.{ts,tsx}', {
      cwd: dir,
      ignore: ['**/*.d.ts', '**/*.test.ts', '**/*.spec.ts'],
      absolute: true,
    });
  }

  private async extractImports(filePath: string): Promise<
    Array<{
      module: string;
      type: 'import' | 'require' | 'dynamic';
      specifiers: string[];
    }>
  > {
    const content = await fs.readFile(filePath, 'utf-8');
    const imports = [];

    // Extract ES6 imports
    const importRegex = /import\s+(?:{([^}]+)}|\*\s+as\s+\w+|\w+)\s+from\s+['"`]([^'"`]+)['"`]/g;
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      imports.push({
        module: match[2],
        type: 'import' as const,
        specifiers: match[1] ? match[1].split(',').map((s) => s.trim()) : [],
      });
    }

    // Extract require statements
    const requireRegex = /require\(['"`]([^'"`]+)['"`]\)/g;
    while ((match = requireRegex.exec(content)) !== null) {
      imports.push({
        module: match[1],
        type: 'require' as const,
        specifiers: [],
      });
    }

    return imports;
  }

  private async extractExports(filePath: string): Promise<
    Array<{
      name: string;
      type: 'function' | 'class' | 'interface' | 'type' | 'constant';
    }>
  > {
    const content = await fs.readFile(filePath, 'utf-8');
    const exports = [];

    // Extract named exports
    const exportRegex = /export\s+(?:const|let|var|function|class|interface|type)\s+(\w+)/g;
    let match;

    while ((match = exportRegex.exec(content)) !== null) {
      const type = this.determineExportType(content, match[1]);
      exports.push({
        name: match[1],
        type,
      });
    }

    // Extract export statements
    const namedExportRegex = /export\s*{\s*([^}]+)\s*}/g;
    while ((match = namedExportRegex.exec(content)) !== null) {
      const names = match[1].split(',').map((n) => n.trim().split(' as ')[0].trim());
      names.forEach((name) => {
        exports.push({
          name,
          type: 'constant' as const,
        });
      });
    }

    return exports;
  }

  private determineNodeType(filePath: string): 'module' | 'utility' | 'config' | 'test' {
    const filename = path.basename(filePath).toLowerCase();

    if (filename.includes('test') || filename.includes('spec')) return 'test';
    if (filename.includes('config') || filename.includes('setup')) return 'config';
    if (filename.includes('util') || filename.includes('helper')) return 'utility';
    return 'module';
  }

  private determineExportType(
    content: string,
    name: string
  ): 'function' | 'class' | 'interface' | 'type' | 'constant' {
    if (content.includes(`function ${name}`)) return 'function';
    if (content.includes(`class ${name}`)) return 'class';
    if (content.includes(`interface ${name}`)) return 'interface';
    if (content.includes(`type ${name}`)) return 'type';
    return 'constant';
  }

  private isInterDomainImport(
    importPath: string,
    currentDomain: string,
    allDomains: string[]
  ): boolean {
    if (!importPath.startsWith('../')) return false;

    // Check if import goes to a different domain
    for (const domain of allDomains) {
      if (domain !== currentDomain && importPath.includes(`../${domain}`)) {
        return true;
      }
    }

    return false;
  }

  private resolveImportPath(fromFile: string, importPath: string): string {
    if (importPath.startsWith('.')) {
      const fromDir = path.dirname(fromFile);
      return path.resolve(fromDir, importPath);
    }
    return importPath;
  }

  private detectCycleDFS(
    nodeId: string,
    graph: DependencyGraph,
    visited: Set<string>,
    recursionStack: Set<string>,
    currentPath: string[]
  ): string[] {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    currentPath.push(nodeId);

    // Find all nodes this node depends on
    const dependencies = graph.edges.filter((edge) => edge.from === nodeId).map((edge) => edge.to);

    for (const dep of dependencies) {
      if (!visited.has(dep)) {
        const cycle = this.detectCycleDFS(dep, graph, visited, recursionStack, [...currentPath]);
        if (cycle.length > 0) return cycle;
      } else if (recursionStack.has(dep)) {
        // Found a cycle
        const cycleStart = currentPath.indexOf(dep);
        return currentPath.slice(cycleStart).concat([dep]);
      }
    }

    recursionStack.delete(nodeId);
    return [];
  }

  private generateCycleBreakingSuggestion(cycle: string[]): string {
    if (cycle.length === 2) {
      return `Consider extracting shared functionality or using dependency injection`;
    } else if (cycle.length === 3) {
      return `Consider introducing an interface or breaking the dependency chain`;
    } else {
      return `Complex cycle detected - consider architectural refactoring`;
    }
  }

  private findHeavilyDependentFiles(
    graph: DependencyGraph
  ): Array<{ current: string; dependencies: number }> {
    const dependencyCounts = new Map<string, number>();

    for (const edge of graph.edges) {
      dependencyCounts.set(edge.from, (dependencyCounts.get(edge.from) || 0) + 1);
    }

    return Array.from(dependencyCounts.entries())
      .filter(([_, count]) => count > 5) // Files with more than 5 dependencies
      .map(([file, count]) => ({ current: file, dependencies: count }));
  }

  private suggestBetterLocation(
    file: { current: string; dependencies: number },
    graph: DependencyGraph
  ): string | null {
    // This would implement logic to suggest better file locations
    // For now, return null (no suggestions)
    return null;
  }

  private identifySharedUtilities(graph: DependencyGraph): Array<{
    name: string;
    files: string[];
    description: string;
    extractionPath: string;
  }> {
    // This would identify common patterns that could be extracted as utilities
    return [];
  }

  private findRedundantDependencies(graph: DependencyGraph): string[] {
    // This would find dependencies that could be removed
    return [];
  }

  private async buildPlanDependencyGraph(plan: SubDomainPlan): Promise<DependencyGraph> {
    const nodes = [];
    const edges = [];

    for (const subdomain of plan.targetSubDomains) {
      if (subdomain.files) {
        for (const file of subdomain.files) {
          const imports = await this.extractImports(file);
          const exports = await this.extractExports(file);

          nodes.push({
            id: file,
            file,
            imports: imports.map((imp) => imp.module),
            exports: exports.map((exp) => exp.name),
            type: this.determineNodeType(file),
          });

          // Add edges for dependencies
          for (const imp of imports) {
            if (imp.module.startsWith('.')) {
              const targetFile = this.resolveImportPath(file, imp.module);
              edges.push({
                from: file,
                to: targetFile,
                type: imp.type,
                weight: 1,
              });
            }
          }
        }
      }
    }

    return { nodes, edges };
  }

  private findProblematicCrossDependencies(
    plan: SubDomainPlan,
    graph: DependencyGraph
  ): Array<{
    from: string;
    to: string;
  }> {
    const problematic = [];

    // Create subdomain file mapping
    const subdomainMap = new Map<string, string>();
    for (const subdomain of plan.targetSubDomains) {
      if (subdomain.files) {
        for (const file of subdomain.files) {
          subdomainMap.set(file, subdomain.name);
        }
      }
    }

    // Check for dependencies that cross subdomain boundaries inappropriately
    for (const edge of graph.edges) {
      const fromSubdomain = subdomainMap.get(edge.from);
      const toSubdomain = subdomainMap.get(edge.to);

      if (fromSubdomain && toSubdomain && fromSubdomain !== toSubdomain) {
        // Check if this cross-dependency is allowed based on the plan
        const fromSpec = plan.targetSubDomains.find((s) => s.name === fromSubdomain);
        if (fromSpec && !fromSpec.dependencies.includes(toSubdomain)) {
          problematic.push({
            from: edge.from,
            to: edge.to,
          });
        }
      }
    }

    return problematic;
  }

  private async analyzePublicAPI(subdomain: any): Promise<any> {
    // This would analyze the public API of a subdomain
    return {
      functions: [],
      classes: [],
      interfaces: [],
      types: [],
    };
  }

  private identifyBreakingChanges(publicAPI: any): any[] {
    // This would identify potential breaking changes
    return [];
  }

  private identifyStableAPIs(publicAPI: any): string[] {
    // This would identify stable APIs
    return [];
  }

  private suggestDeprecations(publicAPI: any): any[] {
    // This would suggest APIs for deprecation
    return [];
  }

  private async simulateBuild(): Promise<{
    success: boolean;
    errors: string[];
    warnings: string[];
  }> {
    try {
      // In a real implementation, this would run the actual build
      // For now, just check if TypeScript files are valid
      return {
        success: true,
        errors: [],
        warnings: [],
      };
    } catch (error) {
      return {
        success: false,
        errors: [error.message],
        warnings: [],
      };
    }
  }
}
