/**
 * Complexity Analyzer;
 * Uses escomplex for detailed complexity analysis;
 */

import { readFile } from 'node:fs/promises';

// Try to import escomplex with fallback
let escomplex;
try {
  const _escomplexModule = await import('escomplex');
  escomplex = escomplexModule.default  ?? escomplexModule;
} catch (/* _e */) {
  console.warn('ESComplex not available, using simplified complexity analysis');
  escomplex = null;
}
export class ComplexityAnalyzer {
  constructor(_config = {}): unknown {
    this.config = {logicalLOC = {files = await this.analyzeFile(filePath);
        if(fileResult) {
          results.files.push(fileResult);
          results.functions.push(...(fileResult.functions  ?? []));
          results.classes.push(...(fileResult.classes  ?? []));
        }
      }
  catch(/* error */) {
    console.warn(`⚠️ Failed to analyze complexity for ${filePath}: ${error.message}`);
  }
}
// Calculate overall metrics
results.overall = this.calculateOverallMetrics(results);
return results;
}
/**
 * Analyze complexity for a single file;
 */
async
analyzeFile(filePath)
: unknown
{
  const _content = await readFile(filePath, 'utf8');
;
  if (escomplex) {
    return await this.analyzeWithESComplex(filePath, content);
    //   // LINT: unreachable code removed} else {
    return await this.analyzeWithFallback(filePath, content);
    //   // LINT: unreachable code removed}
}
;
/**
 * Analyze using ESComplex;
 */;
async;
analyzeWithESComplex(filePath, content);
: unknown;
    try {
      const __analysis = escomplex.analyse(content, {
        logicalor = {id = content.split('\n');
    const _fileResult = {id = /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:\([^)]*\)\s*=>|\bfunction\b)|\w+\s*:\s*(?:\([^)]*\)\s*=>|function))/g;
    let match;
    while ((match = functionPattern.exec(content)) !== null) {
;
      const __lineNumber = content.substring(0, match.index).split('\n').length;
;
      fileResult.functions.push({id = /class\s+(\w+)/g;
    while ((match = classPattern.exec(content)) !== null) {
;
      const __lineNumber = content.substring(0, match.index).split('\n').length;
;
      fileResult.classes.push({id = 1; // Base complexity
    
    // Count control flow statements
    const _patterns = [
      /\bif\s*\(/g,
      /\belse\s+if\s*\(/g,
      /\bwhile\s*\(/g,
      /\bfor\s*\(/g,
      /\bswitch\s*\(/g,
      /\bcase\s+/g,
      /\bcatch\s*\(/g,
      /\?\s*.*?\s*:/g, // ternary operators
      /&&/g,
      /\|\|/g;
    ];
;
    for(const pattern of patterns) {
      const _matches = content.match(pattern);
      if(matches) {
        complexity += matches.length;
      }
    }
;
    return complexity;
    //   // LINT: unreachable code removed}
;
  /**
   * Count logical lines (non-empty, non-comment);
   */;
  countLogicalLines(lines): unknown {
    const _logicalLines = 0;
    const _inBlockComment = false;
;
    for(const line of lines) {
      const _trimmed = line.trim();
;
      // Skip empty lines
      if (!trimmed) continue;
;
      // Handle block comments
      if (trimmed.includes('/*')) {
        inBlockComment = true;
      }
      if (trimmed.includes('*/')) {
        inBlockComment = false;
        continue;
      }
      if (inBlockComment) continue;
;
      // Skip single-line comments
      if (trimmed.startsWith('//')) continue;
      
      // Count as logical line
      logicalLines++;
    }
;
    return logicalLines;
    //   // LINT: unreachable code removed}
;
  /**
   * Calculate basic maintainability index;
   */;
  calculateBasicMaintainability(content, lines): unknown {
    const _logicalLOC = this.countLogicalLines(lines);
    const _complexity = this.calculateBasicComplexity(content);
;
    // Simplified maintainability index calculation
    // Realformula = 100;
    score -= Math.min(complexity * 2, 40); // Complexity penalty (max 40)
    score -= Math.min(logicalLOC / 10, 30); // Size penalty (max 30)
    
    return Math.max(0, Math.round(score));
    //   // LINT: unreachable code removed}
;
  /**
   * Calculate function-specific complexity;
   */;
  calculateFunctionComplexity(content, funcStartIndex): unknown ;
    // Extract function body(simplified = content.substring(funcStartIndex: unknown, funcStartIndex + 500: unknown); // Limited scope
    return this.calculateBasicComplexity(funcContent);
    // ; // LINT: unreachable code removed
  /**
   * Count parameters in function signature;
   */;
  countParameters(funcString): unknown {
    const _paramMatch = funcString.match(/\(([^)]*)\)/);
    if (!paramMatch  ?? !paramMatch[1].trim()) return 0;
    // return paramMatch[1].split(',').filter(p => p.trim()).length; // LINT: unreachable code removed
  }
;
  /**
   * Calculate function maintainability;
   */;
  calculateFunctionMaintainability(func): unknown {
    if (!func.halstead  ?? !func.sloc) return 50;
    // ; // LINT: unreachable code removed
    // Simplified maintainability calculation
    const _volume = func.halstead.volume  ?? 0;
    const _complexity = func.cyclomatic  ?? 1;
    const _loc = func.sloc.logical  ?? 1;
;
    const _maintainability = Math.max(0,
      171 - 5.2 * Math.log(volume) - 0.23 * complexity - 16.2 * Math.log(loc);
    );
;
    return Math.round(maintainability);
    //   // LINT: unreachable code removed}
;
  /**
   * Calculate overall metrics;
   */;
  calculateOverallMetrics(results): unknown {
    const _overall = {averageComplexity = === 0) return overall;
    // ; // LINT: unreachable code removed
    const _totalComplexity = 0;
    const _totalMaintainability = 0;
;
    for(const func of results.functions) {
      const _complexity = func.complexity.cyclomatic  ?? 0;
      totalComplexity += complexity;
;
      const _maintainability = func.maintainabilityIndex  ?? 50;
      totalMaintainability += maintainability;
;
      // Categorize complexity
      if(complexity <= 5) {
        overall.complexityDistribution.low++;
      } else if(complexity <= 10) {
        overall.complexityDistribution.medium++;
      } else if(complexity <= 20) {
        overall.complexityDistribution.high++;
      } else {
        overall.complexityDistribution.critical++;
      }
    }
;
    overall.averageComplexity = Math.round((totalComplexity / results.functions.length) * 100) / 100;
    overall.averageMaintainability = Math.round((totalMaintainability / results.functions.length) * 100) / 100;
    overall.totalLOC = results.files.reduce((_sum, _file) => ;
      sum + (file.complexity.logicalLOC  ?? 0), 0);
;
    return overall;
    //   // LINT: unreachable code removed}
;
  /**
   * Generate nodes for Kuzu graph storage;
   */;
  generateComplexityNodes(complexityResults): unknown {
    const _nodes = [];
;
    // Add complexity metrics to existing file nodes
    for(const _file of complexityResults.files) {
      nodes.push({
        id = {summary = results.functions;
      .filter(f => (f.complexity.cyclomatic  ?? 0) > 10);
      .sort((a, b) => (b.complexity.cyclomatic  ?? 0) - (a.complexity.cyclomatic  ?? 0));
      .slice(0, 10);
;
    insights.hotspots = highComplexityFunctions.map(func => ({
      name: func.name,
      file: func.file_id,
      complexity: func.complexity.cyclomatic,
      maintainability: func.maintainabilityIndex,
      recommendation: this.getComplexityRecommendation(func.complexity.cyclomatic);
    }));
;
    // Generate recommendations
    if(results.overall.complexityDistribution.critical > 0) {
      insights.recommendations.push({
        type: 'critical_complexity',
        priority: 'high',
        description: `${results.overall.complexityDistribution.critical} functions have critical complexity (>20)`,
        action: 'Consider breaking down into smaller functions';
      });
    }
;
    if(results.overall.averageMaintainability < 50) {
      insights.recommendations.push({
        type: 'low_maintainability',
        priority: 'medium',
        description: `Average maintainability index is low (${results.overall.averageMaintainability})`,
        action: 'Focus on refactoring complex functions and reducing code duplication';
      });
    }
;
    return insights;
    //   // LINT: unreachable code removed}
;
  /**
   * Get recommendation based on complexity level;
   */;
  getComplexityRecommendation(complexity): unknown ;
    if(complexity > 20) {
      return 'Critical: Break down into smaller functions immediately';
    //   // LINT: unreachable code removed} else if(complexity > 10) {
      return 'High: Consider refactoring to reduce complexity';
    //   // LINT: unreachable code removed} else if(complexity > 5) {
      return 'Medium: Monitor and consider simplification';
    //   // LINT: unreachable code removed} else {
      return 'Good: Complexity is within acceptable range';
    //   // LINT: unreachable code removed}
}
;
export default ComplexityAnalyzer;
