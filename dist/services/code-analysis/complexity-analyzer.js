/**
 * Complexity Analyzer
 * Uses escomplex for detailed complexity analysis
 */

import { readFile } from 'fs/promises';
import { createHash } from 'crypto';

// Try to import escomplex with fallback
let escomplex;

try {
  const escomplexModule = await import('escomplex');
  escomplex = escomplexModule.default || escomplexModule;
} catch (e) {
  console.warn('ESComplex not available, using simplified complexity analysis');
  escomplex = null;
}

export class ComplexityAnalyzer {
  constructor(config = {}) {
    this.config = {
      logicalLOC: true,
      cyclomaticComplexity: true,
      maintainabilityIndex: true,
      halsteadMetrics: true,
      dependencies: true,
      ...config
    };
  }

  /**
   * Analyze complexity for source files
   */
  async analyzeComplexity(filePaths) {
    console.log(`🔍 Analyzing complexity for ${filePaths.length} files...`);
    
    const results = {
      files: [],
      functions: [],
      classes: [],
      overall: {
        averageComplexity: 0,
        totalLOC: 0,
        averageMaintainability: 0,
        complexityDistribution: {
          low: 0,      // 1-5
          medium: 0,   // 6-10
          high: 0,     // 11-20
          critical: 0  // 21+
        }
      }
    };

    for (const filePath of filePaths) {
      try {
        const fileResult = await this.analyzeFile(filePath);
        if (fileResult) {
          results.files.push(fileResult);
          results.functions.push(...(fileResult.functions || []));
          results.classes.push(...(fileResult.classes || []));
        }
      } catch (error) {
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
  async analyzeFile(filePath) {
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
  async analyzeWithESComplex(filePath, content) {
    try {
      const analysis = escomplex.analyse(content, {
        logicalor: true,
        switchcase: true,
        forin: false,
        trycatch: true
      });

      const fileResult = {
        id: `file:${this.generateFileId(filePath)}`,
        path: filePath,
        complexity: {
          cyclomatic: analysis.aggregate.cyclomatic,
          cyclomaticDensity: analysis.aggregate.cyclomaticDensity,
          halstead: analysis.aggregate.halstead,
          maintainabilityIndex: analysis.maintainabilityIndex,
          logicalLOC: analysis.aggregate.sloc.logical,
          physicalLOC: analysis.aggregate.sloc.physical
        },
        functions: [],
        classes: []
      };

      // Process functions
      if (analysis.functions) {
        for (const func of analysis.functions) {
          fileResult.functions.push({
            id: `func:${this.generateFileId(filePath)}:${func.name}:${func.line}`,
            name: func.name,
            file_id: fileResult.id,
            line_start: func.line,
            complexity: {
              cyclomatic: func.cyclomatic,
              cyclomaticDensity: func.cyclomaticDensity,
              halstead: func.halstead,
              logicalLOC: func.sloc.logical,
              physicalLOC: func.sloc.physical,
              parameterCount: func.params
            },
            maintainabilityIndex: this.calculateFunctionMaintainability(func)
          });
        }
      }

      // Process classes (if detected)
      if (analysis.classes) {
        for (const cls of analysis.classes) {
          fileResult.classes.push({
            id: `class:${this.generateFileId(filePath)}:${cls.name}:${cls.line}`,
            name: cls.name,
            file_id: fileResult.id,
            line_start: cls.line,
            complexity: {
              cyclomatic: cls.cyclomatic || 0,
              methodCount: cls.methods ? cls.methods.length : 0,
              logicalLOC: cls.sloc ? cls.sloc.logical : 0
            }
          });
        }
      }

      return fileResult;

    } catch (error) {
      console.warn(`⚠️ ESComplex analysis failed for ${filePath}: ${error.message}`);
      return await this.analyzeWithFallback(filePath, content);
    }
  }

  /**
   * Fallback complexity analysis using basic patterns
   */
  async analyzeWithFallback(filePath, content) {
    const lines = content.split('\n');
    const fileResult = {
      id: `file:${this.generateFileId(filePath)}`,
      path: filePath,
      complexity: {
        cyclomatic: this.calculateBasicComplexity(content),
        logicalLOC: this.countLogicalLines(lines),
        physicalLOC: lines.length,
        maintainabilityIndex: this.calculateBasicMaintainability(content, lines)
      },
      functions: [],
      classes: []
    };

    // Extract functions using regex
    const functionPattern = /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:\([^)]*\)\s*=>|\bfunction\b)|\w+\s*:\s*(?:\([^)]*\)\s*=>|function))/g;
    let match;
    while ((match = functionPattern.exec(content)) !== null) {
      const funcName = match[1] || match[2] || 'anonymous';
      const lineNumber = content.substring(0, match.index).split('\n').length;
      
      fileResult.functions.push({
        id: `func:${this.generateFileId(filePath)}:${funcName}:${lineNumber}`,
        name: funcName,
        file_id: fileResult.id,
        line_start: lineNumber,
        complexity: {
          cyclomatic: this.calculateFunctionComplexity(content, match.index),
          logicalLOC: 5, // Estimate
          parameterCount: this.countParameters(match[0])
        }
      });
    }

    // Extract classes using regex
    const classPattern = /class\s+(\w+)/g;
    while ((match = classPattern.exec(content)) !== null) {
      const className = match[1];
      const lineNumber = content.substring(0, match.index).split('\n').length;
      
      fileResult.classes.push({
        id: `class:${this.generateFileId(filePath)}:${className}:${lineNumber}`,
        name: className,
        file_id: fileResult.id,
        line_start: lineNumber,
        complexity: {
          cyclomatic: 1, // Basic estimate
          methodCount: 0, // Would need more complex parsing
          logicalLOC: 10 // Estimate
        }
      });
    }

    return fileResult;
  }

  /**
   * Calculate basic complexity using control flow statements
   */
  calculateBasicComplexity(content) {
    let complexity = 1; // Base complexity
    
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

    for (const pattern of patterns) {
      const matches = content.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }

    return complexity;
  }

  /**
   * Count logical lines (non-empty, non-comment)
   */
  countLogicalLines(lines) {
    let logicalLines = 0;
    let inBlockComment = false;

    for (const line of lines) {
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
  calculateBasicMaintainability(content, lines) {
    const logicalLOC = this.countLogicalLines(lines);
    const complexity = this.calculateBasicComplexity(content);
    
    // Simplified maintainability index calculation
    // Real formula: 171 - 5.2 * ln(Halstead Volume) - 0.23 * (Cyclomatic Complexity) - 16.2 * ln(Lines of Code)
    // Simplified: Base score reduced by complexity and size factors
    
    let score = 100;
    score -= Math.min(complexity * 2, 40); // Complexity penalty (max 40)
    score -= Math.min(logicalLOC / 10, 30); // Size penalty (max 30)
    
    return Math.max(0, Math.round(score));
  }

  /**
   * Calculate function-specific complexity
   */
  calculateFunctionComplexity(content, funcStartIndex) {
    // Extract function body (simplified)
    const funcContent = content.substring(funcStartIndex, funcStartIndex + 500); // Limited scope
    return this.calculateBasicComplexity(funcContent);
  }

  /**
   * Count parameters in function signature
   */
  countParameters(funcString) {
    const paramMatch = funcString.match(/\(([^)]*)\)/);
    if (!paramMatch || !paramMatch[1].trim()) return 0;
    return paramMatch[1].split(',').filter(p => p.trim()).length;
  }

  /**
   * Calculate function maintainability
   */
  calculateFunctionMaintainability(func) {
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
  calculateOverallMetrics(results) {
    const overall = {
      averageComplexity: 0,
      totalLOC: 0,
      averageMaintainability: 0,
      complexityDistribution: {
        low: 0,      // 1-5
        medium: 0,   // 6-10
        high: 0,     // 11-20
        critical: 0  // 21+
      }
    };

    if (results.functions.length === 0) return overall;

    let totalComplexity = 0;
    let totalMaintainability = 0;

    for (const func of results.functions) {
      const complexity = func.complexity.cyclomatic || 0;
      totalComplexity += complexity;
      
      const maintainability = func.maintainabilityIndex || 50;
      totalMaintainability += maintainability;

      // Categorize complexity
      if (complexity <= 5) {
        overall.complexityDistribution.low++;
      } else if (complexity <= 10) {
        overall.complexityDistribution.medium++;
      } else if (complexity <= 20) {
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
  generateComplexityNodes(complexityResults) {
    const nodes = [];

    // Add complexity metrics to existing file nodes
    for (const file of complexityResults.files) {
      nodes.push({
        id: file.id,
        type: 'SourceFile',
        complexity_score: file.complexity.cyclomatic || 0,
        maintainability_index: file.complexity.maintainabilityIndex || 50,
        logical_loc: file.complexity.logicalLOC || 0,
        physical_loc: file.complexity.physicalLOC || 0,
        halstead_volume: file.complexity.halstead?.volume || 0,
        halstead_difficulty: file.complexity.halstead?.difficulty || 0
      });
    }

    return nodes;
  }

  /**
   * Generate file ID consistently
   */
  generateFileId(filePath) {
    return createHash('sha256').update(filePath).digest('hex').substring(0, 16);
  }

  /**
   * Get complexity insights and recommendations
   */
  generateComplexityInsights(results) {
    const insights = {
      summary: {
        totalFiles: results.files.length,
        totalFunctions: results.functions.length,
        averageComplexity: results.overall.averageComplexity,
        averageMaintainability: results.overall.averageMaintainability
      },
      recommendations: [],
      hotspots: []
    };

    // Find complexity hotspots
    const highComplexityFunctions = results.functions
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
    if (results.overall.complexityDistribution.critical > 0) {
      insights.recommendations.push({
        type: 'critical_complexity',
        priority: 'high',
        description: `${results.overall.complexityDistribution.critical} functions have critical complexity (>20)`,
        action: 'Consider breaking down into smaller functions'
      });
    }

    if (results.overall.averageMaintainability < 50) {
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
  getComplexityRecommendation(complexity) {
    if (complexity > 20) {
      return 'Critical: Break down into smaller functions immediately';
    } else if (complexity > 10) {
      return 'High: Consider refactoring to reduce complexity';
    } else if (complexity > 5) {
      return 'Medium: Monitor and consider simplification';
    } else {
      return 'Good: Complexity is within acceptable range';
    }
  }
}

export default ComplexityAnalyzer;