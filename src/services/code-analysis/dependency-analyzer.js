/**
 * Dependency Analyzer
 * Analyzes module dependencies using madge and dependency-cruiser
 */

import { readFile } from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';

// Try to import optional dependencies with fallbacks
let madge, cruise;

try {
  const madgeModule = await import('madge');
  madge = madgeModule.default;
} catch (e) {
  console.warn('Madge dependency analyzer not available, using fallback');
  madge = null;
}

try {
  const cruiserModule = await import('dependency-cruiser');
  cruise = cruiserModule.cruise;
} catch (e) {
  console.warn('Dependency-cruiser not available, using fallback');
  cruise = null;
}

export class DependencyAnalyzer {
  constructor(config = {}) {
    this.config = {
      filePatterns: ['src/**/*.{js,jsx,ts,tsx}'],
      ignorePatterns: ['node_modules/**', '.git/**', 'dist/**'],
      detectCircular: true,
      includeNpm: false,
      tsConfig: './tsconfig.json',
      webpackConfig: null,
      ...config
    };
  }

  /**
   * Analyze dependencies for a project or directory
   */
  async analyzeDependencies(targetPath = '.') {
    console.log(`🔍 Analyzing dependencies in: ${targetPath}`);
    
    const results = {
      dependencies: [],
      circularDependencies: [],
      orphanFiles: [],
      metrics: {
        totalFiles: 0,
        totalDependencies: 0,
        circularCount: 0,
        orphanCount: 0,
        maxDepth: 0,
        avgDependenciesPerFile: 0
      }
    };

    try {
      // Use madge for dependency analysis
      const madgeResults = await this.analyzeMadge(targetPath);
      
      // Use dependency-cruiser for more detailed analysis
      const cruiserResults = await this.analyzeCruiser(targetPath);
      
      // Merge results
      results.dependencies = this.mergeDependencyResults(madgeResults, cruiserResults);
      results.circularDependencies = madgeResults.circular || [];
      results.orphanFiles = madgeResults.orphans || [];
      
      // Calculate metrics
      results.metrics = this.calculateMetrics(results);
      
      console.log(`✅ Dependency analysis complete: ${results.metrics.totalFiles} files, ${results.metrics.totalDependencies} dependencies`);
      
      return results;
      
    } catch (error) {
      console.error(`❌ Dependency analysis failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Analyze dependencies using madge
   */
  async analyzeMadge(targetPath) {
    if (!madge) {
      console.warn('Madge not available, using fallback dependency analysis');
      return this.createFallbackDependencyAnalysis(targetPath);
    }

    const madgeConfig = {
      fileExtensions: ['js', 'jsx', 'ts', 'tsx'],
      excludeRegExp: this.config.ignorePatterns.map(p => new RegExp(p.replace('**/', '.*/'))),
      tsConfig: this.config.tsConfig,
      webpackConfig: this.config.webpackConfig,
      includeNpm: this.config.includeNpm,
      detectOpenAllCycles: this.config.detectCircular
    };

    const tree = await madge(targetPath, madgeConfig);
    
    return {
      tree: tree.obj(),
      circular: this.config.detectCircular ? tree.circular() : [],
      orphans: tree.orphans(),
      leaves: tree.leaves(),
      summary: tree.summary()
    };
  }

  /**
   * Analyze dependencies using dependency-cruiser
   */
  async analyzeCruiser(targetPath) {
    if (!cruise) {
      console.warn('Dependency-cruiser not available, using fallback analysis');
      return { dependencies: [] };
    }
    const cruiserConfig = {
      validate: true,
      ruleSet: {
        forbidden: [
          {
            name: 'no-circular',
            severity: 'warn',
            from: {},
            to: {
              circular: true
            }
          },
          {
            name: 'no-orphans',
            severity: 'info',
            from: {
              orphan: true,
              pathNot: '^(test|spec)\\.'
            },
            to: {}
          }
        ]
      },
      options: {
        doNotFollow: {
          path: this.config.ignorePatterns.join('|'),
          dependencyTypes: ['npm', 'npm-dev', 'npm-optional', 'npm-peer']
        },
        includeOnly: this.config.filePatterns.join('|'),
        tsPreCompilationDeps: true,
        tsConfig: {
          fileName: this.config.tsConfig
        }
      }
    };

    try {
      const cruiseResult = cruise([targetPath], cruiserConfig);
      return this.processCruiserResults(cruiseResult);
    } catch (error) {
      console.warn(`⚠️ Dependency-cruiser analysis failed: ${error.message}`);
      return { dependencies: [], violations: [] };
    }
  }

  /**
   * Process dependency-cruiser results
   */
  processCruiserResults(cruiseResult) {
    const dependencies = [];
    const violations = [];

    if (cruiseResult.modules) {
      for (const module of cruiseResult.modules) {
        if (module.dependencies) {
          for (const dep of module.dependencies) {
            dependencies.push({
              from: module.source,
              to: dep.resolved,
              type: dep.dependencyType,
              dynamic: dep.dynamic || false,
              valid: dep.valid !== false,
              rules: dep.rules || []
            });
          }
        }
      }
    }

    if (cruiseResult.summary?.violations) {
      violations.push(...cruiseResult.summary.violations);
    }

    return {
      dependencies,
      violations,
      summary: cruiseResult.summary
    };
  }

  /**
   * Merge results from different analyzers
   */
  mergeDependencyResults(madgeResults, cruiserResults) {
    const dependencies = new Map();
    
    // Process madge results
    for (const [file, deps] of Object.entries(madgeResults.tree || {})) {
      for (const dep of deps || []) {
        const key = `${file}->${dep}`;
        dependencies.set(key, {
          id: this.generateDependencyId(file, dep),
          from: file,
          to: dep,
          type: 'static',
          source: 'madge',
          valid: true,
          dynamic: false
        });
      }
    }
    
    // Enhance with cruiser results
    for (const dep of cruiserResults.dependencies || []) {
      const key = `${dep.from}->${dep.to}`;
      if (dependencies.has(key)) {
        const existing = dependencies.get(key);
        dependencies.set(key, {
          ...existing,
          type: dep.type || existing.type,
          dynamic: dep.dynamic || existing.dynamic,
          valid: dep.valid !== false,
          rules: dep.rules || [],
          source: 'both'
        });
      } else {
        dependencies.set(key, {
          id: this.generateDependencyId(dep.from, dep.to),
          from: dep.from,
          to: dep.to,
          type: dep.type || 'unknown',
          source: 'cruiser',
          valid: dep.valid !== false,
          dynamic: dep.dynamic || false,
          rules: dep.rules || []
        });
      }
    }
    
    return Array.from(dependencies.values());
  }

  /**
   * Calculate dependency metrics
   */
  calculateMetrics(results) {
    const files = new Set();
    let totalDeps = 0;
    let maxDepth = 0;
    
    // Collect unique files and count dependencies
    for (const dep of results.dependencies) {
      files.add(dep.from);
      files.add(dep.to);
      totalDeps++;
    }
    
    // Calculate depth (simplified - just count levels in paths)
    for (const file of files) {
      const depth = file.split('/').length;
      maxDepth = Math.max(maxDepth, depth);
    }
    
    return {
      totalFiles: files.size,
      totalDependencies: totalDeps,
      circularCount: results.circularDependencies.length,
      orphanCount: results.orphanFiles.length,
      maxDepth,
      avgDependenciesPerFile: files.size > 0 ? Math.round((totalDeps / files.size) * 100) / 100 : 0
    };
  }

  /**
   * Find circular dependencies
   */
  async findCircularDependencies(targetPath = '.') {
    if (!madge) {
      console.warn('Madge not available, circular dependency detection limited');
      return { cycles: [], count: 0, totalFilesInvolved: 0 };
    }

    try {
      const tree = await madge(targetPath, {
        fileExtensions: ['js', 'jsx', 'ts', 'tsx'],
        detectOpenAllCycles: true
      });
      
      const circular = tree.circular();
      const circularPaths = [];
      
      for (const cycle of circular) {
        circularPaths.push({
          id: this.generateCycleId(cycle),
          files: cycle,
          length: cycle.length,
          severity: this.calculateCycleSeverity(cycle),
          impact: this.calculateCycleImpact(cycle)
        });
      }
      
      return {
        cycles: circularPaths,
        count: circular.length,
        totalFilesInvolved: new Set(circular.flat()).size
      };
      
    } catch (error) {
      console.error(`❌ Circular dependency detection failed: ${error.message}`);
      return { cycles: [], count: 0, totalFilesInvolved: 0 };
    }
  }

  /**
   * Analyze dependency graph structure
   */
  async analyzeGraphStructure(dependencies) {
    const graph = {
      nodes: new Map(),
      edges: new Map(),
      metrics: {
        density: 0,
        clustering: 0,
        diameter: 0,
        centralFiles: []
      }
    };
    
    // Build nodes
    for (const dep of dependencies) {
      if (!graph.nodes.has(dep.from)) {
        graph.nodes.set(dep.from, {
          id: dep.from,
          inDegree: 0,
          outDegree: 0,
          betweenness: 0
        });
      }
      if (!graph.nodes.has(dep.to)) {
        graph.nodes.set(dep.to, {
          id: dep.to,
          inDegree: 0,
          outDegree: 0,
          betweenness: 0
        });
      }
      
      // Update degrees
      graph.nodes.get(dep.from).outDegree++;
      graph.nodes.get(dep.to).inDegree++;
      
      // Add edge
      graph.edges.set(dep.id, dep);
    }
    
    // Calculate graph metrics
    const nodeCount = graph.nodes.size;
    const edgeCount = graph.edges.size;
    
    // Graph density
    graph.metrics.density = nodeCount > 1 ? 
      (2 * edgeCount) / (nodeCount * (nodeCount - 1)) : 0;
    
    // Find central files (high degree)
    const sortedNodes = Array.from(graph.nodes.values())
      .sort((a, b) => (b.inDegree + b.outDegree) - (a.inDegree + a.outDegree));
    
    graph.metrics.centralFiles = sortedNodes.slice(0, 5).map(node => ({
      file: node.id,
      totalDegree: node.inDegree + node.outDegree,
      inDegree: node.inDegree,
      outDegree: node.outDegree
    }));
    
    return graph;
  }

  /**
   * Generate dependency relationships for Kuzu graph
   */
  generateGraphRelationships(dependencies) {
    const relationships = [];
    
    for (const dep of dependencies) {
      relationships.push({
        id: dep.id,
        type: 'IMPORTS_FROM',
        from: `file:${this.generateFileId(dep.from)}`,
        to: `file:${this.generateFileId(dep.to)}`,
        properties: {
          dependency_type: dep.type,
          is_dynamic: dep.dynamic,
          is_valid: dep.valid,
          source_analyzer: dep.source,
          created_at: new Date().toISOString()
        }
      });
    }
    
    return relationships;
  }

  /**
   * Generate unique dependency ID
   */
  generateDependencyId(from, to) {
    return createHash('md5')
      .update(`${from}->${to}`)
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Generate unique cycle ID
   */
  generateCycleId(cycle) {
    return createHash('md5')
      .update(cycle.join('->'))
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Generate consistent file ID
   */
  generateFileId(filePath) {
    return createHash('sha256')
      .update(filePath)
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Calculate cycle severity
   */
  calculateCycleSeverity(cycle) {
    if (cycle.length <= 2) return 'low';
    if (cycle.length <= 4) return 'medium';
    if (cycle.length <= 6) return 'high';
    return 'critical';
  }

  /**
   * Calculate cycle impact
   */
  calculateCycleImpact(cycle) {
    // Simplified impact calculation based on cycle length and file types
    let impact = cycle.length;
    
    // Higher impact for certain file types
    for (const file of cycle) {
      if (file.includes('index.') || file.includes('main.')) {
        impact += 2;
      }
      if (file.includes('.config.') || file.includes('.setup.')) {
        impact += 1;
      }
    }
    
    return Math.min(impact, 10); // Cap at 10
  }

  /**
   * Export dependency data for visualization
   */
  exportForVisualization(dependencies, format = 'json') {
    const nodes = new Set();
    const edges = [];
    
    for (const dep of dependencies) {
      nodes.add({
        id: dep.from,
        label: path.basename(dep.from),
        type: 'file',
        path: dep.from
      });
      nodes.add({
        id: dep.to,
        label: path.basename(dep.to),
        type: 'file',
        path: dep.to
      });
      
      edges.push({
        from: dep.from,
        to: dep.to,
        type: dep.type,
        dynamic: dep.dynamic,
        valid: dep.valid
      });
    }
    
    const visualization = {
      nodes: Array.from(nodes),
      edges,
      metadata: {
        totalNodes: nodes.size,
        totalEdges: edges.length,
        generated: new Date().toISOString()
      }
    };
    
    switch (format) {
      case 'cytoscape':
        return this.toCytoscapeFormat(visualization);
      case 'd3':
        return this.toD3Format(visualization);
      default:
        return visualization;
    }
  }

  /**
   * Convert to Cytoscape format
   */
  toCytoscapeFormat(data) {
    const elements = [];
    
    for (const node of data.nodes) {
      elements.push({
        data: {
          id: node.id,
          label: node.label,
          type: node.type
        }
      });
    }
    
    for (const edge of data.edges) {
      elements.push({
        data: {
          id: `${edge.from}-${edge.to}`,
          source: edge.from,
          target: edge.to,
          type: edge.type
        }
      });
    }
    
    return { elements };
  }

  /**
   * Convert to D3 format
   */
  toD3Format(data) {
    return {
      nodes: data.nodes.map((node, index) => ({
        ...node,
        index
      })),
      links: data.edges.map(edge => ({
        source: edge.from,
        target: edge.to,
        type: edge.type,
        value: 1
      }))
    };
  }

  /**
   * Create fallback dependency analysis when tools aren't available
   */
  async createFallbackDependencyAnalysis(targetPath) {
    console.log('Using fallback dependency analysis with regex patterns');
    
    const { readFile, readdir, stat } = await import('fs/promises');
    const { join } = await import('path');
    
    const files = await this.getAllJSFiles(targetPath);
    
    const dependencies = [];
    const fileMap = new Map();
    
    for (const filePath of files) {
      try {
        const content = await readFile(filePath, 'utf8');
        const imports = this.extractImportsRegex(content, filePath);
        
        fileMap.set(filePath, {
          imports,
          exports: this.extractExportsRegex(content)
        });
        
        // Create dependencies
        for (const imp of imports) {
          dependencies.push({
            id: `dep:${dependencies.length}`,
            from: filePath,
            to: imp.source,
            type: imp.type,
            specifiers: imp.specifiers
          });
        }
      } catch (error) {
        console.warn(`Failed to analyze ${filePath}: ${error.message}`);
      }
    }
    
    return {
      tree: Object.fromEntries(fileMap),
      circular: [], // Simple fallback doesn't detect circular deps
      orphans: this.findOrphanFiles(files, dependencies),
      leaves: this.findLeafFiles(files, dependencies),
      summary: {
        totalFiles: files.length,
        totalDependencies: dependencies.length
      }
    };
  }

  /**
   * Get all JS/TS files recursively
   */
  async getAllJSFiles(dirPath) {
    const { readdir, stat } = await import('fs/promises');
    const { join } = await import('path');
    
    const files = [];
    const extensions = ['.js', '.jsx', '.ts', '.tsx'];
    
    async function walk(currentPath) {
      try {
        const entries = await readdir(currentPath);
        
        for (const entry of entries) {
          const fullPath = join(currentPath, entry);
          const stats = await stat(fullPath);
          
          if (stats.isDirectory()) {
            // Skip common ignored directories
            if (!['node_modules', '.git', 'dist', 'build'].includes(entry)) {
              await walk(fullPath);
            }
          } else if (extensions.some(ext => entry.endsWith(ext))) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        console.warn(`Skipping directory ${currentPath}: ${error.message}`);
      }
    }
    
    await walk(dirPath);
    return files;
  }
  
  /**
   * Extract imports using regex
   */
  extractImportsRegex(content, filePath) {
    const imports = [];
    const importPattern = /import\s+(?:(?:\{[^}]*\}|\w+|\*\s+as\s+\w+)\s+from\s+)?['"`]([^'"`]+)['"`]/g;
    const requirePattern = /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
    
    let match;
    while ((match = importPattern.exec(content)) !== null) {
      imports.push({
        source: match[1],
        type: match[1].startsWith('.') ? 'relative' : 'external',
        specifiers: []
      });
    }
    
    while ((match = requirePattern.exec(content)) !== null) {
      imports.push({
        source: match[1],
        type: match[1].startsWith('.') ? 'relative' : 'external',
        specifiers: []
      });
    }
    
    return imports;
  }
  
  /**
   * Extract exports using regex
   */
  extractExportsRegex(content) {
    const exports = [];
    const exportPattern = /export\s+(?:default\s+)?(?:const|let|var|function|class|interface|type)\s+(\w+)/g;
    
    let match;
    while ((match = exportPattern.exec(content)) !== null) {
      exports.push(match[1]);
    }
    
    return exports;
  }
  
  /**
   * Find orphan files (no imports)
   */
  findOrphanFiles(files, dependencies) {
    const referencedFiles = new Set(dependencies.map(d => d.to));
    return files.filter(file => !referencedFiles.has(file));
  }
  
  /**
   * Find leaf files (no exports used)
   */
  findLeafFiles(files, dependencies) {
    const importingFiles = new Set(dependencies.map(d => d.from));
    return files.filter(file => !importingFiles.has(file));
  }
}

export default DependencyAnalyzer;