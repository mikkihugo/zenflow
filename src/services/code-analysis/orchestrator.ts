/**
 * Code Analysis Orchestrator
 * Coordinates AST parsing, dependency analysis, duplicate detection and Kuzu graph storage
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import ASTParser from './ast-parser.js';
import ComplexityAnalyzer from './complexity-analyzer.js';
import DependencyAnalyzer from './dependency-analyzer.js';
import DuplicateCodeDetector from './duplicate-detector.js';
import TreeSitterParser from './tree-sitter-parser.js';

// Try to import optional Kuzu integration
let KuzuGraphInterface;
try {
  const kuzuModule = await import('../../cli/database/kuzu-graph-interface.js');
  KuzuGraphInterface = kuzuModule.default;
} catch (_e) {
  console.warn('Kuzu graph interface not available, graph storage disabled');
  KuzuGraphInterface = null;
}

export class CodeAnalysisOrchestrator {
  constructor(_config = {}): any {
    this.config = {projectPath = new ASTParser();
    this.dependencyAnalyzer = new DependencyAnalyzer(this.config);
    this.duplicateDetector = new DuplicateCodeDetector(this.config);
    this.complexityAnalyzer = new ComplexityAnalyzer(this.config);
    this.treeSitterParser = new TreeSitterParser(this.config);
    // Initialize Kuzu graph interface if available
    this.kuzuGraph = KuzuGraphInterface ? new KuzuGraphInterface(this.config.kuzu) : null;
    
    this.isInitialized = false;
  }

  /**
   * Initialize the analysis system
   */
  async initialize() {
    console.warn('🚀 Initializing Code Analysis Orchestrator...');

    try {
      // Create output directory
      await mkdir(this.config.outputDir, {recursive = true;
      console.warn('✅ Code analysis system initialized');

      return {
        status = {}): any {
    if(!this._isInitialized) {
      await this.initialize();
    }
    
    console.warn(`🔍 Starting comprehensive code analysis...`);

      const analysisOptions = {includeDependencies = {summary = await this.discoverSourceFiles();
      console.warn(`Found ${sourceFiles.length} source files`);

      // 2. AST Analysis
      console.warn('🌳 Performing AST analysis...');
      results.ast = await this.performASTAnalysis(sourceFiles);

      // 3. Dependency Analysis
      if (analysisOptions.includeDependencies) {
        console.warn('🔗 Analyzing dependencies...');
        results.dependencies = await this.performDependencyAnalysis();
      }

      // 4. Duplicate Detection
      if (analysisOptions.includeDuplicates) {
        console.warn('👥 Detecting duplicates...');
        results.duplicates = await this.performDuplicateAnalysis();
      }

      // 5. Complexity Analysis
      if (analysisOptions.includeComplexity) {
        console.warn('📊 Analyzing complexity...');
        results.complexity = await this.performComplexityAnalysis(sourceFiles);
      }

      // 6. Store in Kuzu Graph
      if (analysisOptions.storeInGraph) {
        console.warn('📊 Storing in graph database...');
        results.graph = await this.storeInGraph(results);
      }

      // 7. Generate summary
      results.summary = await this.generateAnalysisSummary(results);

      // 7. Save results
      await this.saveAnalysisResults(results);

      console.warn('✅ Code analysis complete!');
      return results;
    } catch (_error) {
      console.error(`❌ Code analysisfailed = await this.getAllFiles(this.config.projectPath);
    
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
  async getAllFiles(dirPath): any {
    const { readdir, stat } = await import('fs/promises');
    const { join } = await import('path');
    
    const files = [];
    
    async function walk(currentPath): any {
      try {
        const entries = await readdir(currentPath);
        
        for(const entry of entries) {
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
      } catch(error) {
        console.warn(`Skipping directory ${currentPath}: ${error.message}`);
    }
  }

  await;
  walk(dirPath);
  return;
  files;
}

/**
 * Perform AST analysis on source files
 */
async;
performASTAnalysis(sourceFiles);
: any
{
    const results = {files = 0;
    const _processedFiles = 0;
    
    // Process files in batches
    for(let i = 0; i < sourceFiles.length; i += this.config.batchSize) {
      const _batch = sourceFiles.slice(i, i + this.config.batchSize);

          const analysis = await this.astParser.parseFile(file, content);
          
          // Store file information
          results.files.push(analysis.file);
          
          // Collect all parsed elements
          results.functions.push(...analysis.functions);
          results.classes.push(...analysis.classes);
          results.variables.push(...analysis.variables);
          results.imports.push(...analysis.imports);
          results.exports.push(...analysis.exports);
          if(analysis.types) {
            results.types.push(...analysis.types);
          }
          
          // Calculate complexity metrics
          for(const func of analysis.functions) {
            totalComplexity += func.cyclomatic_complexity;
            if(func.cyclomatic_complexity > 10) {
              results.metrics.highComplexityFunctions.push({name = results.functions.length;
    results.metrics.totalClasses = results.classes.length;
    results.metrics.averageComplexity = results.functions.length > 0 ? 
      Math.round((totalComplexity / results.functions.length) * 100) /100 = > b.complexity - a.complexity);
    results.metrics.highComplexityFunctions = results.metrics.highComplexityFunctions.slice(0, 20);
    
    return results;
  }

  /**
   * Perform dependency analysis
   */
  async performDependencyAnalysis() {
    const dependencyResults = await this.dependencyAnalyzer.analyzeDependencies(this.config.projectPath);
    
    // Find circular dependencies

    // Analyze graph structure

    return {
      ...dependencyResults,
      circular = {nodes_inserted = results.ast.files.length;
        graphResults.operations.push('source_files');
      }
      
      // 2. Insert functions
      if(results.ast.functions.length > 0) {
        await this.insertFunctions(results.ast.functions);
        graphResults.nodes_inserted += results.ast.functions.length;
        graphResults.operations.push('functions');
      }
      
      // 3. Insert classes
      if(results.ast.classes.length > 0) {
        await this.insertClasses(results.ast.classes);
        graphResults.nodes_inserted += results.ast.classes.length;
        graphResults.operations.push('classes');
      }
      
      // 4. Insert variables
      if(results.ast.variables.length > 0) {
        await this.insertVariables(results.ast.variables);
        graphResults.nodes_inserted += results.ast.variables.length;
        graphResults.operations.push('variables');
      }
      
      // 5. Insert imports
      if(results.ast.imports.length > 0) {
        await this.insertImports(results.ast.imports);
        graphResults.nodes_inserted += results.ast.imports.length;
        graphResults.operations.push('imports');
      }
      
      // 6. Insert types (TypeScript)
      if(results.ast.types && results.ast.types.length > 0) {
        await this.insertTypes(results.ast.types);
        graphResults.nodes_inserted += results.ast.types.length;
        graphResults.operations.push('types');
      }
      
      // 7. Insert duplicate code blocks
      if(results.duplicates.duplicates && results.duplicates.duplicates.length > 0) {
        await this.insertDuplicates(results.duplicates.duplicates);
        graphResults.nodes_inserted += results.duplicates.duplicates.length;
        graphResults.operations.push('duplicates');
      }
      
      // 8. Insert relationships
      const relationships = await this.generateAllRelationships(results);
      if(relationships.length > 0) {
      // Store graph relationships if Kuzu available
      if(this.kuzuGraph && relationships.length > 0) {
        await this.kuzuGraph.insertRelationships(relationships);
      }
        graphResults.relationships_inserted = relationships.length;
      }
      
      console.warn(`✅ Stored ${graphResults.nodes_inserted} nodes and ${graphResults.relationships_inserted} relationships in graph`);
      
    } catch(error) 
      console.error(`❌ Graph storagefailed = files.map(file => (
      ...file,complexity_score = [];
    
    // File -> Function relationships
    for(const _func of results.ast.functions) {
      relationships.push({id = this.dependencyAnalyzer.generateGraphRelationships(
        results.dependencies.dependencies
      );
      relationships.push(...depRelationships);
    }
    
    // Duplicate relationships
    if(results.duplicates?.duplicates) {
      const dupRelationships = this.duplicateDetector.generateGraphRelationships(
        results.duplicates.duplicates
      );
      relationships.push(...dupRelationships);
    }
    
    return relationships;

  /**
   * Generate comprehensive analysis summary
   */
  async generateAnalysisSummary(results): any {
    const _summary = {overview = > sum + f.line_count, 0),average_complexity = [];
    
    // High complexity functions
    if(results.ast.metrics.highComplexityFunctions.length > 0) {
      recommendations.push({type = [];
    
    // Add complexity issues
    for (const _func of results.ast.metrics.highComplexityFunctions.slice(0, 5)) {
      issues.push({
        type => {
      const severityOrder = {critical = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return (b.metric || 0) - (a.metric || 0);
    });
  }

  /**
   * Calculate file complexity score
   */
  calculateFileComplexity(file, functions): any {
    const fileFunctions = functions.filter(f => f.file_id === file.id);
    if (fileFunctions.length === 0) return 0;
    
    const totalComplexity = fileFunctions.reduce((sum, f) => sum + f.cyclomatic_complexity, 0);
    return Math.round((totalComplexity / fileFunctions.length) * 100) / 100;
  }

  /**
   * Calculate maintainability index (simplified)
   */
  calculateMaintainabilityIndex(file): any {
    // Simplified maintainability index based on file size and estimated complexity
    const lineScore = Math.max(0, 100 - (file.line_count / 10));
    const sizeScore = Math.max(0, 100 - (file.size_bytes / 1000));
    
    return Math.round(((lineScore + sizeScore) / 2) * 100) / 100;
  }

  /**
   * Save analysis results to files
   */
  async saveAnalysisResults(results): any {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Save comprehensive results
    const resultsPath = path.join(this.config.outputDir, `analysis-results-${timestamp}.json`);
    await writeFile(resultsPath, JSON.stringify(results, null, 2));
    
    // Save summary report
    const summaryPath = path.join(this.config.outputDir, `analysis-summary-${timestamp}.json`);
    await writeFile(summaryPath, JSON.stringify(results.summary, null, 2));
    
    // Export for Kuzu
    // Export to Kuzu if available
    if(this.kuzuGraph) {
      await this.kuzuGraph.exportForKuzu();
    }
    
    console.warn(`📄 Results saved to = {}): any {
    if(!this.isInitialized) {
      await this.initialize();
    }
    
    const results = {files = await readFile(filePath, 'utf8');
        const analysis = await this.astParser.parseFile(filePath, content);
        
        results.files.push(analysis.file);
        results.functions.push(...analysis.functions);
        results.classes.push(...analysis.classes);
        results.variables.push(...analysis.variables);
        results.imports.push(...analysis.imports);
        
      } catch(error) 
        console.warn(`⚠️ Failed to analyze ${filePath}: ${error.message}`);
    
    // Update graph if requested
    if(options.updateGraph) {
      await this.storeInGraph({ ast: results });
    }
    
    return results;
  }

  /**
   * Query the analysis graph
   */
  async queryAnalysis(query): any 
    if(!this.kuzuGraph) {
      console.warn('Graph storage disabled, query not available');
      return { error: 'Graph storage not available' };
    }
    // Delegate to Kuzu graph interface
    return await this.kuzuGraph.query(query);

  /**
   * Get analysis statistics
   */
  async getAnalysisStats() 
    if(!this.kuzuGraph) {
      console.warn('Graph storage disabled, stats not available');
      return { error: 'Graph storage not available' };
    }
    return await this.kuzuGraph.getStats();

  /**
   * Clean up resources
   */
  async cleanup() 
    if(this.kuzuGraph) {
      await this.kuzuGraph.close();
    }
    console.warn('🧹 Code analysis resources cleaned up');
}

export default CodeAnalysisOrchestrator;
