/**
 * Complexity Analyzer
 * Uses escomplex for detailed complexity analysis
 */

import { readFile } from 'node:fs/promises';

// Try to import escomplex with fallback
let escomplex;

try {
  const escomplexModule = await import('escomplex');
  escomplex = escomplexModule.default || escomplexModule;
} catch (_e) {
  console.warn('ESComplex not available, using simplified complexity analysis');
  escomplex = null;
}

export class ComplexityAnalyzer {
  constructor(_config = {}): any {
    this.config = {logicalLOC = {files = await this.analyzeFile(filePath);
        if(fileResult) {
          results.files.push(fileResult);
          results.functions.push(...(fileResult.functions || []));
          results.classes.push(...(fileResult.classes || []));
        }
      }
  catch(error) {
    console.warn(`⚠️ Failed to analyze complexity for ${filePath}: ${error.message}`);
  }
}

// Calculate overall metrics
results.overall = this.calculateOverallMetrics(results);

return results;
}

  /**
   * Analyze complexity for a single file
   */
  async analyzeFile(filePath): any
{
  const content = await readFile(filePath, 'utf8');

  if (escomplex) {
    return await this.analyzeWithESComplex(filePath, content);
  } else {
    return await this.analyzeWithFallback(filePath, content);
  }
}

/**
 * Analyze using ESComplex
 */
async;
analyzeWithESComplex(filePath, content);
: any
{
    try {
      const _analysis = escomplex.analyse(content, {
        logicalor = {id = content.split('\n');
    const fileResult = {id = /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:\([^)]*\)\s*=>|\bfunction\b)|\w+\s*:\s*(?:\([^)]*\)\s*=>|function))/g;
    let match;
    while ((match = functionPattern.exec(content)) !== null) {

      const _lineNumber = content.substring(0, match.index).split('\n').length;
      
      fileResult.functions.push({id = /class\s+(\w+)/g;
    while ((match = classPattern.exec(content)) !== null) {

      const _lineNumber = content.substring(0, match.index).split('\n').length;
      
      fileResult.classes.push({id = 1; // Base complexity
    
    // Count control flow statements
    const patterns = [
      /\bif\s*\(/g,
      /\belse\s+if\s*\(/g,
      /\bwhile\s*\(/g,
      /\bfor\s*\(/g,
      /\bswitch\s*\(/g,
      /\bcase\s+/g,
      /\bcatch\s*\(/g,
      /\?\s*.*?\s*:/g, // ternary operators
      /&&/g,
      /\|\|/g
    ];

    for(const pattern of patterns) {
      const matches = content.match(pattern);
      if(matches) {
        complexity += matches.length;
      }
    }

    return complexity;
  }

  /**
   * Count logical lines (non-empty, non-comment)
   */
  countLogicalLines(lines): any {
    let logicalLines = 0;
    let inBlockComment = false;

    for(const line of lines) {
      const trimmed = line.trim();
      
      // Skip empty lines
      if (!trimmed) continue;
      
      // Handle block comments
      if (trimmed.includes('/*')) {
        inBlockComment = true;
      }
      if (trimmed.includes('*/')) {
        inBlockComment = false;
        continue;
      }
      if (inBlockComment) continue;
      
      // Skip single-line comments
      if (trimmed.startsWith('//')) continue;
      
      // Count as logical line
      logicalLines++;
    }

    return logicalLines;
  }

  /**
   * Calculate basic maintainability index
   */
  calculateBasicMaintainability(content, lines): any {
    const logicalLOC = this.countLogicalLines(lines);
    const complexity = this.calculateBasicComplexity(content);
    
    // Simplified maintainability index calculation
    // Realformula = 100;
    score -= Math.min(complexity * 2, 40); // Complexity penalty (max 40)
    score -= Math.min(logicalLOC / 10, 30); // Size penalty (max 30)
    
    return Math.max(0, Math.round(score));
  }

  /**
   * Calculate function-specific complexity
   */
  calculateFunctionComplexity(content, funcStartIndex): any 
    // Extract function body(simplified = content.substring(funcStartIndex, funcStartIndex + 500); // Limited scope
    return this.calculateBasicComplexity(funcContent);

  /**
   * Count parameters in function signature
   */
  countParameters(funcString): any {
    const paramMatch = funcString.match(/\(([^)]*)\)/);
    if (!paramMatch || !paramMatch[1].trim()) return 0;
    return paramMatch[1].split(',').filter(p => p.trim()).length;
  }

  /**
   * Calculate function maintainability
   */
  calculateFunctionMaintainability(func): any {
    if (!func.halstead || !func.sloc) return 50;
    
    // Simplified maintainability calculation
    const volume = func.halstead.volume || 0;
    const complexity = func.cyclomatic || 1;
    const loc = func.sloc.logical || 1;
    
    const maintainability = Math.max(0, 
      171 - 5.2 * Math.log(volume) - 0.23 * complexity - 16.2 * Math.log(loc)
    );
    
    return Math.round(maintainability);
  }

  /**
   * Calculate overall metrics
   */
  calculateOverallMetrics(results): any {
    const overall = {averageComplexity = === 0) return overall;

    let totalComplexity = 0;
    let totalMaintainability = 0;

    for(const func of results.functions) {
      const complexity = func.complexity.cyclomatic || 0;
      totalComplexity += complexity;
      
      const maintainability = func.maintainabilityIndex || 50;
      totalMaintainability += maintainability;

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

    overall.averageComplexity = Math.round((totalComplexity / results.functions.length) * 100) / 100;
    overall.averageMaintainability = Math.round((totalMaintainability / results.functions.length) * 100) / 100;
    overall.totalLOC = results.files.reduce((sum, file) => 
      sum + (file.complexity.logicalLOC || 0), 0);

    return overall;
  }

  /**
   * Generate nodes for Kuzu graph storage
   */
  generateComplexityNodes(complexityResults): any {
    const nodes = [];

    // Add complexity metrics to existing file nodes
    for(const _file of complexityResults.files) {
      nodes.push({
        id = {summary = results.functions
      .filter(f => (f.complexity.cyclomatic || 0) > 10)
      .sort((a, b) => (b.complexity.cyclomatic || 0) - (a.complexity.cyclomatic || 0))
      .slice(0, 10);

    insights.hotspots = highComplexityFunctions.map(func => ({
      name: func.name,
      file: func.file_id,
      complexity: func.complexity.cyclomatic,
      maintainability: func.maintainabilityIndex,
      recommendation: this.getComplexityRecommendation(func.complexity.cyclomatic)
    }));

    // Generate recommendations
    if(results.overall.complexityDistribution.critical > 0) {
      insights.recommendations.push({
        type: 'critical_complexity',
        priority: 'high',
        description: `${results.overall.complexityDistribution.critical} functions have critical complexity (>20)`,
        action: 'Consider breaking down into smaller functions'
      });
    }

    if(results.overall.averageMaintainability < 50) {
      insights.recommendations.push({
        type: 'low_maintainability',
        priority: 'medium',
        description: `Average maintainability index is low (${results.overall.averageMaintainability})`,
        action: 'Focus on refactoring complex functions and reducing code duplication'
      });
    }

    return insights;
  }

  /**
   * Get recommendation based on complexity level
   */
  getComplexityRecommendation(complexity): any 
    if(complexity > 20) {
      return 'Critical: Break down into smaller functions immediately';
    } else if(complexity > 10) {
      return 'High: Consider refactoring to reduce complexity';
    } else if(complexity > 5) {
      return 'Medium: Monitor and consider simplification';
    } else {
      return 'Good: Complexity is within acceptable range';
    }
}

export default ComplexityAnalyzer;
