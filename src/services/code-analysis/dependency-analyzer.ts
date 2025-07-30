/**
 * Dependency Analyzer;
 * Analyzes module dependencies using madge and dependency-cruiser;
 */

import { readFile } from 'node:fs/promises';

// Try to import optional dependencies with fallbacks
let _madge, _cruise;
try {
  const _madgeModule = await import('madge');
  _madge = madgeModule.default  ?? madgeModule;
} catch (/* _e */) {
  console.warn('Madge dependency analyzer not available, using fallback');
  _madge = null;
}
try {
  const _cruiserModule = await import('dependency-cruiser');
  _cruise = cruiserModule.cruise  ?? cruiserModule.default;
} catch (/* _e */) {
  console.warn('Dependency-cruiser not available, using fallback');
  _cruise = null;
}
export class DependencyAnalyzer {
  constructor(_config = {}): unknown {
    this.config = {filePatterns = '.'): unknown {
    console.warn(`🔍 Analyzing dependencies in = {dependencies = await this.analyzeMadge(targetPath);
;
      // Use dependency-cruiser for more detailed analysis
      const _cruiserResults = await this.analyzeCruiser(targetPath);
;
      // Merge results
      results.dependencies = this.mergeDependencyResults(madgeResults, cruiserResults);
      results.circularDependencies = madgeResults.circular  ?? [];
      results.orphanFiles = madgeResults.orphans  ?? [];
;
      // Calculate metrics
      results.metrics = this.calculateMetrics(results);
;
      console.warn(`✅ Dependency analysis complete = {fileExtensions = > new RegExp(p.replace('**/', '.*/'))),tsConfig = await madge(targetPath, madgeConfig);
;
    return {
      tree = {validate = cruise([targetPath], cruiserConfig);
    // return this.processCruiserResults(cruiseResult); // LINT: unreachable code removed
    } catch (/* error */) {
      console.warn(`⚠️ Dependency-cruiser analysisfailed = [];
;
    if(cruiseResult.modules) {
      for(const module of cruiseResult.modules) {
        if(module.dependencies) {
          for(const _dep of module.dependencies) {
            dependencies.push({from = = false,rules = new Map();
;
    // Process madge results
    for (const [file, deps] of Object.entries(madgeResults.tree  ?? {})) {
      for(const dep of deps  ?? []) {
        const _key = `${file}->${dep}`;
        dependencies.set(key, {id = `${dep.from}->${dep.to}`;
      if (dependencies.has(key)) {
        const _existing = dependencies.get(key);
        dependencies.set(key, {
          ...existing,type = = false,rules = = false,dynamic = new Set();
    const __totalDeps = 0;
    const _maxDepth = 0;
;
    // Collect unique files and count dependencies
    for(const dep of results.dependencies) {
      files.add(dep.from);
      files.add(dep.to);
      _totalDeps++;
    }
;
    // Calculate depth (simplified - just count levels in paths)
    for(const file of files) {
      const _depth = file.split('/').length;
      maxDepth = Math.max(maxDepth, depth);
    }
;
    return {totalFiles = '.'): unknown {
    if(!_madge) {
      console.warn('Madge not available, circular dependency detection limited');
    // return {cycles = await madge(targetPath, {fileExtensions = tree.circular(); // LINT: unreachable code removed
      const _circularPaths = [];
;
      for(const cycle of circular) {
        circularPaths.push({
          id = {nodes = graph.nodes.size;
    const _edgeCount = graph.edges.size;
;
    // Graph density
    graph.metrics.density = nodeCount > 1 ? ;
      (2 * edgeCount) / (nodeCount * (nodeCount - 1)) : 0;
;
    // Find central files (high degree)
    const _sortedNodes = Array.from(graph.nodes.values());
      .sort((a, b) => (b.inDegree + b.outDegree) - (a.inDegree + a.outDegree));
;
    graph.metrics.centralFiles = sortedNodes.slice(0, 5).map(_node => ({file = [];
;
    for(const _dep of dependencies) {
      relationships.push({id = 2) return 'low';
    // if (cycle.length <= 4) return 'medium'; // LINT: unreachable code removed
    if (cycle.length <= 6) return 'high';
    // return 'critical'; // LINT: unreachable code removed
  }
;
  /**
   * Calculate cycle impact;
   */;
  calculateCycleImpact(cycle): unknown {
    // Simplified impact calculation based on cycle length and file types
    const _impact = cycle.length;
;
    // Higher impact for certain file types
    for(const file of cycle) {
      if (file.includes('index.')  ?? file.includes('main.')) {
        impact += 2;
      }
      if (file.includes('.config.')  ?? file.includes('.setup.')) {
        impact += 1;
      }
    }
;
    return Math.min(impact, 10); // Cap at 10
  }
;
  /**
   * Export dependency data for visualization;
   */;
  exportForVisualization(dependencies, format = 'json'): unknown {
    const _nodes = new Set();
    const __edges = [];
;
    for(const _dep of dependencies) {
      nodes.add({
        id = {nodes = [];
;
    for(const node of data.nodes) {
      elements.push({data = > ({
        ...node,;
        index;
      })),links = > ({source = await import('node:fs/promises');
    const { join } = await import('node:path');
    
    const _files = await this.getAllJSFiles(targetPath);
;
    const __dependencies = [];
    const _fileMap = new Map();
;
    for(const filePath of files) {
      try {
        const _content = await readFile(filePath, 'utf8');
        const _imports = this.extractImportsRegex(content, filePath);
        
        fileMap.set(filePath, {
          imports,
          exports = {};
    for(const [filePath, fileInfo] of fileMap) {
      dependencyTree[filePath] = fileInfo.imports.map(imp => imp.source);
    }
;
    return {tree = await import('node:fs/promises');
    // const { join  // LINT: unreachable code removed} = await import('node:path');
    
    const _files = [];
    const _extensions = ['.js', '.jsx', '.ts', '.tsx'];
;
    async function walk(currentPath = await readdir(currentPath: unknown);
;
        for(const entry of entries) {
          const _fullPath = join(currentPath, entry);
          const _stats = await stat(fullPath);
;
          if (stats.isDirectory()) {
            // Skip common ignored directories
            if (!['node_modules', '.git', 'dist', 'build'].includes(entry)) {
              await walk(fullPath);
            }
          } else if (extensions.some(ext => entry.endsWith(ext))) {
            files.push(fullPath);
          }
        }
      } catch (/* error */) {
        console.warn(`Skipping directory ${currentPath}: ${error.message}`);
      }
    }
;
    await walk(dirPath);
    return files;
    //   // LINT: unreachable code removed}
;
  /**
   * Extract imports using regex
   */;
  extractImportsRegex(content, filePath): unknown {
    const _imports = [];
    const _importPattern = /import\s+(?:(?:\{[^}]*\}|\w+|\*\s+as\s+\w+)\s+from\s+)?['"`]([^'"`]+)['"`]/g;
    const _requirePattern = /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
;
    let match;
    while ((match = importPattern.exec(content)) !== null) {
      imports.push({source = requirePattern.exec(content)) !== null) {
      imports.push({source = [];
    const _exportPattern = /export\s+(?:default\s+)?(?:const|let|var|function|class|interface|type)\s+(\w+)/g;
    
    let match;
    while ((match = exportPattern.exec(content)) !== null) {
      exports.push(match[1]);
    }
;
    return exports;
    //   // LINT: unreachable code removed}
;
  /**
   * Find orphan files (no imports)
   */;
  findOrphanFiles(files, dependencies): unknown {
    const _referencedFiles = new Set(dependencies.map(d => d.to));
    return files.filter(file => !referencedFiles.has(file));
    //   // LINT: unreachable code removed}
;
  /**
   * Find leaf files (no exports used)
   */;
  findLeafFiles(files, dependencies): unknown {
    const _importingFiles = new Set(dependencies.map(d => d.from));
    return files.filter(file => !importingFiles.has(file));
    //   // LINT: unreachable code removed}
}
;
export default DependencyAnalyzer;
