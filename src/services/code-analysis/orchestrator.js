/**
 * Code Analysis Orchestrator
 * Coordinates AST parsing, dependency analysis, duplicate detection and Kuzu graph storage
 */

import { readFile, mkdir, writeFile } from 'fs/promises';
import path from 'path';
import ASTParser from './ast-parser.js';
import DependencyAnalyzer from './dependency-analyzer.js';
import DuplicateCodeDetector from './duplicate-detector.js';

// Try to import optional Kuzu integration
let KuzuGraphInterface;
try {
  const kuzuModule = await import('../../cli/database/kuzu-graph-interface.js');
  KuzuGraphInterface = kuzuModule.default;
} catch (e) {
  console.warn('Kuzu graph interface not available, graph storage disabled');
  KuzuGraphInterface = null;
}

export class CodeAnalysisOrchestrator {
  constructor(config = {}) {
    this.config = {
      projectPath: process.cwd(),
      outputDir: './analysis-reports',
      filePatterns: ['**/*.{js,jsx,ts,tsx}'],
      ignorePatterns: [
        'node_modules/**',
        '.git/**',
        'dist/**',
        'build/**',
        '**/*.min.js',
        '**/*.test.{js,ts}',
        '**/*.spec.{js,ts}',
        '.hive-mind/**'
      ],
      kuzu: {
        dbPath: './graph-db',
        dbName: 'code-analysis'
      },
      enableRealTimeAnalysis: false,
      batchSize: 50,
      ...config
    };

    // Initialize analyzers
    this.astParser = new ASTParser();
    this.dependencyAnalyzer = new DependencyAnalyzer(this.config);
    this.duplicateDetector = new DuplicateCodeDetector(this.config);
    // Initialize Kuzu graph interface if available
    this.kuzuGraph = KuzuGraphInterface ? new KuzuGraphInterface(this.config.kuzu) : null;
    
    this.isInitialized = false;
  }

  /**
   * Initialize the analysis system
   */
  async initialize() {
    console.log('🚀 Initializing Code Analysis Orchestrator...');
    
    try {
      // Create output directory
      await mkdir(this.config.outputDir, { recursive: true });
      
      // Initialize Kuzu graph database
      // Initialize Kuzu graph if available
      if (this.kuzuGraph) {
        await this.kuzuGraph.initialize();
      } else {
        console.warn('Graph storage disabled - Kuzu interface not available');
      }
      
      this.isInitialized = true;
      console.log('✅ Code analysis system initialized');
      
      return {
        status: 'initialized',
        analyzers: ['ast-parser', 'dependency-analyzer', 'duplicate-detector'],
        database: 'kuzu-graph'
      };
      
    } catch (error) {
      console.error(`❌ Initialization failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Run comprehensive code analysis
   */
  async analyzeCodebase(options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    console.log(`🔍 Starting comprehensive code analysis...`);
    
    const analysisOptions = {
      includeDependencies: true,
      includeDuplicates: true,
      includeComplexity: true,
      storeInGraph: true,
      ...options
    };
    
    const results = {
      summary: {},
      ast: {},
      dependencies: {},
      duplicates: {},
      graph: {},
      timestamp: new Date().toISOString()
    };
    
    try {
      // 1. Discover source files
      console.log('📁 Discovering source files...');
      const sourceFiles = await this.discoverSourceFiles();
      console.log(`Found ${sourceFiles.length} source files`);
      
      // 2. AST Analysis
      console.log('🌳 Performing AST analysis...');
      results.ast = await this.performASTAnalysis(sourceFiles);
      
      // 3. Dependency Analysis
      if (analysisOptions.includeDependencies) {
        console.log('🔗 Analyzing dependencies...');
        results.dependencies = await this.performDependencyAnalysis();
      }
      
      // 4. Duplicate Detection
      if (analysisOptions.includeDuplicates) {
        console.log('👥 Detecting duplicates...');
        results.duplicates = await this.performDuplicateAnalysis();
      }
      
      // 5. Store in Kuzu Graph
      if (analysisOptions.storeInGraph) {
        console.log('📊 Storing in graph database...');
        results.graph = await this.storeInGraph(results);
      }
      
      // 6. Generate summary
      results.summary = await this.generateAnalysisSummary(results);
      
      // 7. Save results
      await this.saveAnalysisResults(results);
      
      console.log('✅ Code analysis complete!');
      return results;
      
    } catch (error) {
      console.error(`❌ Code analysis failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Discover source files for analysis
   */
  async discoverSourceFiles() {
    const files = await this.getAllFiles(this.config.projectPath);
    
    return files.filter(file => {
      // Additional filtering
      const relativePath = path.relative(this.config.projectPath, file);
      return !relativePath.includes('node_modules') && 
             !relativePath.startsWith('.') &&
             ['.js', '.jsx', '.ts', '.tsx'].some(ext => file.endsWith(ext)) &&
             relativePath.length > 0;
    });
  }

  /**
   * Get all files recursively
   */
  async getAllFiles(dirPath) {
    const { readdir, stat } = await import('fs/promises');
    const { join } = await import('path');
    
    const files = [];
    
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
          } else {
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
   * Perform AST analysis on source files
   */
  async performASTAnalysis(sourceFiles) {
    const results = {
      files: [],
      functions: [],
      classes: [],
      variables: [],
      imports: [],
      exports: [],
      types: [],
      metrics: {
        totalFiles: sourceFiles.length,
        totalFunctions: 0,
        totalClasses: 0,
        averageComplexity: 0,
        highComplexityFunctions: []
      }
    };
    
    let totalComplexity = 0;
    let processedFiles = 0;
    
    // Process files in batches
    for (let i = 0; i < sourceFiles.length; i += this.config.batchSize) {
      const batch = sourceFiles.slice(i, i + this.config.batchSize);
      
      const batchPromises = batch.map(async (file) => {
        try {
          const content = await readFile(file, 'utf8');
          const analysis = await this.astParser.parseFile(file, content);
          
          // Store file information
          results.files.push(analysis.file);
          
          // Collect all parsed elements
          results.functions.push(...analysis.functions);
          results.classes.push(...analysis.classes);
          results.variables.push(...analysis.variables);
          results.imports.push(...analysis.imports);
          results.exports.push(...analysis.exports);
          if (analysis.types) {
            results.types.push(...analysis.types);
          }
          
          // Calculate complexity metrics
          for (const func of analysis.functions) {
            totalComplexity += func.cyclomatic_complexity;
            if (func.cyclomatic_complexity > 10) {
              results.metrics.highComplexityFunctions.push({
                name: func.name,
                file: file,
                complexity: func.cyclomatic_complexity
              });
            }
          }
          
          processedFiles++;
          
        } catch (error) {
          console.warn(`⚠️ Failed to parse ${file}: ${error.message}`);
        }
      });
      
      await Promise.all(batchPromises);
      console.log(`📊 Processed ${Math.min(i + this.config.batchSize, sourceFiles.length)}/${sourceFiles.length} files`);
    }
    
    // Calculate final metrics
    results.metrics.totalFunctions = results.functions.length;
    results.metrics.totalClasses = results.classes.length;
    results.metrics.averageComplexity = results.functions.length > 0 ? 
      Math.round((totalComplexity / results.functions.length) * 100) / 100 : 0;
    
    // Sort high complexity functions
    results.metrics.highComplexityFunctions.sort((a, b) => b.complexity - a.complexity);
    results.metrics.highComplexityFunctions = results.metrics.highComplexityFunctions.slice(0, 20);
    
    return results;
  }

  /**
   * Perform dependency analysis
   */
  async performDependencyAnalysis() {
    const dependencyResults = await this.dependencyAnalyzer.analyzeDependencies(this.config.projectPath);
    
    // Find circular dependencies
    const circularResults = await this.dependencyAnalyzer.findCircularDependencies(this.config.projectPath);
    
    // Analyze graph structure
    const graphStructure = await this.dependencyAnalyzer.analyzeGraphStructure(dependencyResults.dependencies);
    
    return {
      ...dependencyResults,
      circular: circularResults,
      structure: graphStructure
    };
  }

  /**
   * Perform duplicate code analysis
   */
  async performDuplicateAnalysis() {
    return await this.duplicateDetector.detectDuplicates(this.config.projectPath);
  }

  /**
   * Store analysis results in Kuzu graph database
   */
  async storeInGraph(results) {
    const graphResults = {
      nodes_inserted: 0,
      relationships_inserted: 0,
      operations: []
    };
    
    try {
      // 1. Insert source files
      if (results.ast.files.length > 0) {
        await this.insertSourceFiles(results.ast.files);
        graphResults.nodes_inserted += results.ast.files.length;
        graphResults.operations.push('source_files');
      }
      
      // 2. Insert functions
      if (results.ast.functions.length > 0) {
        await this.insertFunctions(results.ast.functions);
        graphResults.nodes_inserted += results.ast.functions.length;
        graphResults.operations.push('functions');
      }
      
      // 3. Insert classes
      if (results.ast.classes.length > 0) {
        await this.insertClasses(results.ast.classes);
        graphResults.nodes_inserted += results.ast.classes.length;
        graphResults.operations.push('classes');
      }
      
      // 4. Insert variables
      if (results.ast.variables.length > 0) {
        await this.insertVariables(results.ast.variables);
        graphResults.nodes_inserted += results.ast.variables.length;
        graphResults.operations.push('variables');
      }
      
      // 5. Insert imports
      if (results.ast.imports.length > 0) {
        await this.insertImports(results.ast.imports);
        graphResults.nodes_inserted += results.ast.imports.length;
        graphResults.operations.push('imports');
      }
      
      // 6. Insert types (TypeScript)
      if (results.ast.types && results.ast.types.length > 0) {
        await this.insertTypes(results.ast.types);
        graphResults.nodes_inserted += results.ast.types.length;
        graphResults.operations.push('types');
      }
      
      // 7. Insert duplicate code blocks
      if (results.duplicates.duplicates && results.duplicates.duplicates.length > 0) {
        await this.insertDuplicates(results.duplicates.duplicates);
        graphResults.nodes_inserted += results.duplicates.duplicates.length;
        graphResults.operations.push('duplicates');
      }
      
      // 8. Insert relationships
      const relationships = await this.generateAllRelationships(results);
      if (relationships.length > 0) {
      // Store graph relationships if Kuzu available
      if (this.kuzuGraph && relationships.length > 0) {
        await this.kuzuGraph.insertRelationships(relationships);
      }
        graphResults.relationships_inserted = relationships.length;
      }
      
      console.log(`✅ Stored ${graphResults.nodes_inserted} nodes and ${graphResults.relationships_inserted} relationships in graph`);
      
    } catch (error) {
      console.error(`❌ Graph storage failed: ${error.message}`);
      throw error;
    }
    
    return graphResults;
  }

  /**
   * Insert source files into graph
   */
  async insertSourceFiles(files) {
    if (!this.kuzuGraph) {
      console.warn('Graph storage disabled, skipping source file insertion');
      return { count: 0 };
    }
    
    const nodes = files.map(file => ({
      ...file,
      complexity_score: this.calculateFileComplexity(file, this.ast?.functions || []),
      maintainability_index: this.calculateMaintainabilityIndex(file)
    }));
    
    if (!this.kuzuGraph) { console.warn("Graph storage disabled, skipping insertion"); return { count: 0 }; } return await this.kuzuGraph.insertNodes('SourceFile', nodes);
  }

  /**
   * Insert functions into graph
   */
  async insertFunctions(functions) {
    if (!this.kuzuGraph) {
      console.warn('Graph storage disabled, skipping function insertion');
      return { count: 0 };
    }
    if (!this.kuzuGraph) { console.warn("Graph storage disabled, skipping insertion"); return { count: 0 }; } return await this.kuzuGraph.insertNodes('Function', functions);
  }

  /**
   * Insert classes into graph
   */
  async insertClasses(classes) {
    if (!this.kuzuGraph) { console.warn("Graph storage disabled, skipping insertion"); return { count: 0 }; } return await this.kuzuGraph.insertNodes('Class', classes);
  }

  /**
   * Insert variables into graph
   */
  async insertVariables(variables) {
    if (!this.kuzuGraph) { console.warn("Graph storage disabled, skipping insertion"); return { count: 0 }; } return await this.kuzuGraph.insertNodes('Variable', variables);
  }

  /**
   * Insert imports into graph
   */
  async insertImports(imports) {
    if (!this.kuzuGraph) { console.warn("Graph storage disabled, skipping insertion"); return { count: 0 }; } return await this.kuzuGraph.insertNodes('Import', imports);
  }

  /**
   * Insert TypeScript types into graph
   */
  async insertTypes(types) {
    if (!this.kuzuGraph) { console.warn("Graph storage disabled, skipping insertion"); return { count: 0 }; } return await this.kuzuGraph.insertNodes('TypeDefinition', types);
  }

  /**
   * Insert duplicate code blocks into graph
   */
  async insertDuplicates(duplicates) {
    if (!this.kuzuGraph) { console.warn("Graph storage disabled, skipping insertion"); return { count: 0 }; } return await this.kuzuGraph.insertNodes('DuplicateCode', duplicates);
  }

  /**
   * Generate all relationships for the graph
   */
  async generateAllRelationships(results) {
    const relationships = [];
    
    // File -> Function relationships
    for (const func of results.ast.functions) {
      relationships.push({
        id: `file-func-${func.id}`,
        type: 'DEFINES_FUNCTION',
        from: func.file_id,
        to: func.id,
        properties: {
          visibility: func.is_exported ? 'public' : 'private'
        }
      });
    }
    
    // File -> Class relationships
    for (const cls of results.ast.classes) {
      relationships.push({
        id: `file-class-${cls.id}`,
        type: 'DEFINES_CLASS',
        from: cls.file_id,
        to: cls.id,
        properties: {
          visibility: cls.is_exported ? 'public' : 'private'
        }
      });
    }
    
    // File -> Variable relationships
    for (const variable of results.ast.variables) {
      relationships.push({
        id: `file-var-${variable.id}`,
        type: 'DECLARES_VARIABLE',
        from: variable.file_id,
        to: variable.id,
        properties: {
          scope: variable.scope
        }
      });
    }
    
    // File -> Import relationships
    for (const imp of results.ast.imports) {
      relationships.push({
        id: `file-import-${imp.id}`,
        type: 'HAS_IMPORT',
        from: imp.file_id,
        to: imp.id,
        properties: {
          line_number: imp.line_number
        }
      });
    }
    
    // Dependency relationships
    if (results.dependencies && results.dependencies.dependencies) {
      const depRelationships = this.dependencyAnalyzer.generateGraphRelationships(
        results.dependencies.dependencies
      );
      relationships.push(...depRelationships);
    }
    
    // Duplicate relationships
    if (results.duplicates && results.duplicates.duplicates) {
      const dupRelationships = this.duplicateDetector.generateGraphRelationships(
        results.duplicates.duplicates
      );
      relationships.push(...dupRelationships);
    }
    
    return relationships;
  }

  /**
   * Generate comprehensive analysis summary
   */
  async generateAnalysisSummary(results) {
    const summary = {
      overview: {
        total_files: results.ast.files.length,
        total_functions: results.ast.functions.length,
        total_classes: results.ast.classes.length,
        total_lines: results.ast.files.reduce((sum, f) => sum + f.line_count, 0),
        average_complexity: results.ast.metrics.averageComplexity,
        analysis_timestamp: results.timestamp
      },
      quality_metrics: {
        high_complexity_functions: results.ast.metrics.highComplexityFunctions.length,
        circular_dependencies: results.dependencies?.circular?.count || 0,
        duplicate_blocks: results.duplicates?.duplicates?.length || 0,
        orphan_files: results.dependencies?.orphanFiles?.length || 0
      },
      recommendations: this.generateRecommendations(results),
      top_issues: this.identifyTopIssues(results)
    };
    
    return summary;
  }

  /**
   * Generate refactoring recommendations
   */
  generateRecommendations(results) {
    const recommendations = [];
    
    // High complexity functions
    if (results.ast.metrics.highComplexityFunctions.length > 0) {
      recommendations.push({
        type: 'complexity',
        priority: 'high',
        description: `Refactor ${results.ast.metrics.highComplexityFunctions.length} high-complexity functions`,
        details: results.ast.metrics.highComplexityFunctions.slice(0, 5)
      });
    }
    
    // Circular dependencies
    if (results.dependencies?.circular?.count > 0) {
      recommendations.push({
        type: 'circular_dependency',
        priority: 'high',
        description: `Resolve ${results.dependencies.circular.count} circular dependencies`,
        details: results.dependencies.circular.cycles.slice(0, 3)
      });
    }
    
    // Duplicate code
    if (results.duplicates?.metrics?.severity_breakdown?.critical > 0) {
      recommendations.push({
        type: 'duplication',
        priority: 'medium',
        description: `Extract ${results.duplicates.metrics.severity_breakdown.critical} critical duplicate code blocks`,
        details: results.duplicates.summary?.top_duplicates?.slice(0, 3)
      });
    }
    
    return recommendations;
  }

  /**
   * Identify top issues across all analysis types
   */
  identifyTopIssues(results) {
    const issues = [];
    
    // Add complexity issues
    for (const func of results.ast.metrics.highComplexityFunctions.slice(0, 5)) {
      issues.push({
        type: 'complexity',
        severity: func.complexity > 20 ? 'critical' : 'high',
        description: `High complexity function: ${func.name}`,
        file: func.file,
        metric: func.complexity
      });
    }
    
    // Add circular dependency issues
    if (results.dependencies?.circular?.cycles) {
      for (const cycle of results.dependencies.circular.cycles.slice(0, 3)) {
        issues.push({
          type: 'circular_dependency',
          severity: cycle.severity,
          description: `Circular dependency: ${cycle.files.join(' → ')}`,
          files: cycle.files,
          metric: cycle.length
        });
      }
    }
    
    // Sort by severity and metric
    return issues.sort((a, b) => {
      const severityOrder = { critical: 3, high: 2, medium: 1, low: 0 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return (b.metric || 0) - (a.metric || 0);
    });
  }

  /**
   * Calculate file complexity score
   */
  calculateFileComplexity(file, functions) {
    const fileFunctions = functions.filter(f => f.file_id === file.id);
    if (fileFunctions.length === 0) return 0;
    
    const totalComplexity = fileFunctions.reduce((sum, f) => sum + f.cyclomatic_complexity, 0);
    return Math.round((totalComplexity / fileFunctions.length) * 100) / 100;
  }

  /**
   * Calculate maintainability index (simplified)
   */
  calculateMaintainabilityIndex(file) {
    // Simplified maintainability index based on file size and estimated complexity
    const lineScore = Math.max(0, 100 - (file.line_count / 10));
    const sizeScore = Math.max(0, 100 - (file.size_bytes / 1000));
    
    return Math.round(((lineScore + sizeScore) / 2) * 100) / 100;
  }

  /**
   * Save analysis results to files
   */
  async saveAnalysisResults(results) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Save comprehensive results
    const resultsPath = path.join(this.config.outputDir, `analysis-results-${timestamp}.json`);
    await writeFile(resultsPath, JSON.stringify(results, null, 2));
    
    // Save summary report
    const summaryPath = path.join(this.config.outputDir, `analysis-summary-${timestamp}.json`);
    await writeFile(summaryPath, JSON.stringify(results.summary, null, 2));
    
    // Export for Kuzu
    // Export to Kuzu if available
    if (this.kuzuGraph) {
      await this.kuzuGraph.exportForKuzu();
    }
    
    console.log(`📄 Results saved to: ${resultsPath}`);
    console.log(`📄 Summary saved to: ${summaryPath}`);
  }

  /**
   * Run analysis on specific files (for real-time analysis)
   */
  async analyzeFiles(filePaths, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    const results = {
      files: [],
      functions: [],
      classes: [],
      variables: [],
      imports: [],
      updated_relationships: []
    };
    
    for (const filePath of filePaths) {
      try {
        const content = await readFile(filePath, 'utf8');
        const analysis = await this.astParser.parseFile(filePath, content);
        
        results.files.push(analysis.file);
        results.functions.push(...analysis.functions);
        results.classes.push(...analysis.classes);
        results.variables.push(...analysis.variables);
        results.imports.push(...analysis.imports);
        
      } catch (error) {
        console.warn(`⚠️ Failed to analyze ${filePath}: ${error.message}`);
      }
    }
    
    // Update graph if requested
    if (options.updateGraph) {
      await this.storeInGraph({ ast: results });
    }
    
    return results;
  }

  /**
   * Query the analysis graph
   */
  async queryAnalysis(query) {
    if (!this.kuzuGraph) {
      console.warn('Graph storage disabled, query not available');
      return { error: 'Graph storage not available' };
    }
    // Delegate to Kuzu graph interface
    return await this.kuzuGraph.query(query);
  }

  /**
   * Get analysis statistics
   */
  async getAnalysisStats() {
    if (!this.kuzuGraph) {
      console.warn('Graph storage disabled, stats not available');
      return { error: 'Graph storage not available' };
    }
    return await this.kuzuGraph.getStats();
  }

  /**
   * Clean up resources
   */
  async cleanup() {
    if (this.kuzuGraph) {
      await this.kuzuGraph.close();
    }
    console.log('🧹 Code analysis resources cleaned up');
  }
}

export default CodeAnalysisOrchestrator;