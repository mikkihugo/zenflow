/**
 * Dependency Analyzer
 * Analyzes module dependencies using madge and dependency-cruiser
 */

import { readFile } from 'node:fs/promises';

// Try to import optional dependencies with fallbacks
let _madge, _cruise;

try {
  const madgeModule = await import('madge');
  _madge = madgeModule.default || madgeModule;
} catch (_e) {
  console.warn('Madge dependency analyzer not available, using fallback');
  _madge = null;
}

try {
  const cruiserModule = await import('dependency-cruiser');
  _cruise = cruiserModule.cruise || cruiserModule.default;
} catch (_e) {
  console.warn('Dependency-cruiser not available, using fallback');
  _cruise = null;
}

export class DependencyAnalyzer {
  constructor(_config = {}): any {
    this.config = {filePatterns = '.'): any {
    console.warn(`🔍 Analyzing dependencies in = {dependencies = await this.analyzeMadge(targetPath);
      
      // Use dependency-cruiser for more detailed analysis
      const cruiserResults = await this.analyzeCruiser(targetPath);
      
      // Merge results
      results.dependencies = this.mergeDependencyResults(madgeResults, cruiserResults);
      results.circularDependencies = madgeResults.circular || [];
      results.orphanFiles = madgeResults.orphans || [];
      
      // Calculate metrics
      results.metrics = this.calculateMetrics(results);
      
      console.warn(`✅ Dependency analysis complete = {fileExtensions = > new RegExp(p.replace('**/', '.*/'))),tsConfig = await madge(targetPath, madgeConfig);
    
    return {
      tree = {validate = cruise([targetPath], cruiserConfig);
      return this.processCruiserResults(cruiseResult);
    } catch(error) {
      console.warn(`⚠️ Dependency-cruiser analysisfailed = [];

    if(cruiseResult.modules) {
      for(const module of cruiseResult.modules) {
        if(module.dependencies) {
          for(const _dep of module.dependencies) {
            dependencies.push({from = = false,rules = new Map();
    
    // Process madge results
    for (const [file, deps] of Object.entries(madgeResults.tree || {})) {
      for(const dep of deps || []) {
        const key = `${file}->${dep}`;
        dependencies.set(key, {id = `${dep.from}->${dep.to}`;
      if (dependencies.has(key)) {
        const existing = dependencies.get(key);
        dependencies.set(key, {
          ...existing,type = = false,rules = = false,dynamic = new Set();
    let _totalDeps = 0;
    let maxDepth = 0;
    
    // Collect unique files and count dependencies
    for(const dep of results.dependencies) {
      files.add(dep.from);
      files.add(dep.to);
      _totalDeps++;
    }
    
    // Calculate depth (simplified - just count levels in paths)
    for(const file of files) {
      const depth = file.split('/').length;
      maxDepth = Math.max(maxDepth, depth);
    }
    
    return {totalFiles = '.'): any {
    if(!madge) {
      console.warn('Madge not available, circular dependency detection limited');
      return {cycles = await madge(targetPath, {fileExtensions = tree.circular();
      const circularPaths = [];
      
      for(const cycle of circular) {
        circularPaths.push({
          id = {nodes = graph.nodes.size;
    const edgeCount = graph.edges.size;
    
    // Graph density
    graph.metrics.density = nodeCount > 1 ? 
      (2 * edgeCount) / (nodeCount * (nodeCount - 1)) : 0;
    
    // Find central files (high degree)
    const sortedNodes = Array.from(graph.nodes.values())
      .sort((a, b) => (b.inDegree + b.outDegree) - (a.inDegree + a.outDegree));
    
    graph.metrics.centralFiles = sortedNodes.slice(0, 5).map(_node => ({file = [];
    
    for(const _dep of dependencies) {
      relationships.push({id = 2) return 'low';
    if (cycle.length <= 4) return 'medium';
    if (cycle.length <= 6) return 'high';
    return 'critical';
  }

  /**
   * Calculate cycle impact
   */
  calculateCycleImpact(cycle): any {
    // Simplified impact calculation based on cycle length and file types
    let impact = cycle.length;
    
    // Higher impact for certain file types
    for(const file of cycle) {
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
  exportForVisualization(dependencies, format = 'json'): any {
    const nodes = new Set();
    const _edges = [];
    
    for(const _dep of dependencies) {
      nodes.add({
        id = {nodes = [];
    
    for(const node of data.nodes) {
      elements.push({data = > ({
        ...node,
        index
      })),links = > ({source = await import('node:fs/promises');
    const { join } = await import('node:path');
    
    const files = await this.getAllJSFiles(targetPath);
    
    const _dependencies = [];
    const fileMap = new Map();
    
    for(const filePath of files) {
      try {
        const content = await readFile(filePath, 'utf8');
        const imports = this.extractImportsRegex(content, filePath);
        
        fileMap.set(filePath, {
          imports,
          exports = {};
    for(const [filePath, fileInfo] of fileMap) {
      dependencyTree[filePath] = fileInfo.imports.map(imp => imp.source);
    }
    
    return {tree = await import('node:fs/promises');
    const { join } = await import('node:path');
    
    const files = [];
    const extensions = ['.js', '.jsx', '.ts', '.tsx'];
    
    async function walk(currentPath = await readdir(currentPath);
        
        for(const entry of entries) {
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
      } catch(error) {
        console.warn(`Skipping directory ${currentPath}: ${error.message}`);
      }
    }
    
    await walk(dirPath);
    return files;
  }
  
  /**
   * Extract imports using regex
   */
  extractImportsRegex(content, filePath): any {
    const imports = [];
    const importPattern = /import\s+(?:(?:\{[^}]*\}|\w+|\*\s+as\s+\w+)\s+from\s+)?['"`]([^'"`]+)['"`]/g;
    const requirePattern = /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
    
    let match;
    while ((match = importPattern.exec(content)) !== null) {
      imports.push({source = requirePattern.exec(content)) !== null) {
      imports.push({source = [];
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
  findOrphanFiles(files, dependencies): any {
    const referencedFiles = new Set(dependencies.map(d => d.to));
    return files.filter(file => !referencedFiles.has(file));
  }
  
  /**
   * Find leaf files (no exports used)
   */
  findLeafFiles(files, dependencies): any {
    const importingFiles = new Set(dependencies.map(d => d.from));
    return files.filter(file => !importingFiles.has(file));
  }
}

export default DependencyAnalyzer;
