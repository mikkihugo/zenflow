#!/usr/bin/env node

/**
 * 🧘 Zen AI ESLint Fixer - TypeScript Compiler API Edition
 *
 * Smart ESLint fixing using TypeScript Compiler API for precise AST parsing:
 * - Official TypeScript AST parsing (most accurate)
 * - Complete import/export declaration analysis
 * - Impact-based file prioritization with precise dependency mapping
 * - Intelligent batching to prevent ENOBUFS
 * - Circular dependency detection
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import * as ts from 'typescript';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * TypeScript Compiler API Graph ESLint Analyzer - Official TypeScript AST parsing
 */
class TypeScriptGraphESLintAnalyzer {
  constructor() {
    this.fileNodes = new Map(); // filePath -> node data
    this.dependencyEdges = new Map(); // filePath -> Set of dependencies
    this.dependentEdges = new Map(); // filePath -> Set of dependents
    this.circularDeps = new Set();
  }

  /**
   * Build comprehensive dependency graph in memory
   */
  async buildDependencyGraph() {
    console.log('🔍 Building dependency graph...');

    const files = await this.getAllTypeScriptFiles();
    console.log(`📁 Found ${files.length} TypeScript files`);

    // Process all files efficiently
    const fileData = await this.extractAllDependencies(files);

    // Build graph structure
    await this.buildGraphStructure(fileData);

    // Detect circular dependencies
    this.detectCircularDependencies();

    console.log(`📊 Dependency graph complete:`);
    console.log(`  • ${this.fileNodes.size} files mapped`);
    console.log(
      `  • ${[...this.dependencyEdges.values()].reduce((sum, deps) => sum + deps.size, 0)} dependencies`
    );
    console.log(`  • ${this.circularDeps.size} circular dependencies detected`);

    return fileData;
  }

  /**
   * Extract dependencies from all files with batching
   */
  async extractAllDependencies(files) {
    const fileData = new Map();
    const batchSize = 50;

    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      console.log(
        `📖 Processing files ${i + 1}-${Math.min(i + batchSize, files.length)}/${files.length}`
      );

      const batchPromises = batch.map(async (filePath) => {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const stats = fs.statSync(filePath);

          const dependencies = this.extractDependencies(content, filePath);
          const complexity = this.calculateComplexity(content);

          return {
            path: filePath,
            name: path.basename(filePath),
            size: stats.size,
            dependencies,
            complexity,
            violations: 0,
            lines: content.split('\n').length,
          };
        } catch (error) {
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);

      for (const result of batchResults) {
        if (result) {
          fileData.set(result.path, result);
        }
      }
    }

    return fileData;
  }

  /**
   * Build graph structure with relationships
   */
  async buildGraphStructure(fileData) {
    // Initialize nodes and edge maps
    for (const [filePath, data] of fileData) {
      this.fileNodes.set(filePath, data);
      this.dependencyEdges.set(filePath, new Set());
      this.dependentEdges.set(filePath, new Set());
    }

    // Build edges with debug output
    let totalImports = 0;
    let resolvedImports = 0;
    const failedResolutions = [];

    for (const [filePath, data] of fileData) {
      for (const importPath of data.dependencies.imports) {
        totalImports++;
        const resolvedPath = this.resolveImportPath(filePath, importPath);

        if (this.fileNodes.has(resolvedPath)) {
          resolvedImports++;
          // Add dependency edge: filePath depends on resolvedPath
          this.dependencyEdges.get(filePath).add(resolvedPath);
          // Add dependent edge: resolvedPath has filePath as dependent
          this.dependentEdges.get(resolvedPath).add(filePath);
        } else {
          // Track failed resolutions for debugging key files
          if (
            resolvedPath.includes('integration-service-adapter') ||
            resolvedPath.includes('mcp-tool-registry') ||
            resolvedPath.includes('monitoring-event-adapter')
          ) {
            // Try to find similar paths in fileNodes for debugging
            const similarPaths = [...this.fileNodes.keys()].filter(
              (p) =>
                path.basename(p) === path.basename(resolvedPath) ||
                p.includes(path.basename(resolvedPath, path.extname(resolvedPath)))
            );

            failedResolutions.push({
              from: path.basename(filePath),
              import: importPath,
              resolved: resolvedPath,
              exists: fs.existsSync(resolvedPath),
              inFileNodes: this.fileNodes.has(resolvedPath),
              similarPaths: similarPaths.slice(0, 2).map((p) => path.basename(p)),
            });
          }
        }
      }
    }

    console.log(
      `🔗 Dependency resolution: ${resolvedImports}/${totalImports} imports resolved to existing files`
    );

    // Show failed resolutions for key files
    if (failedResolutions.length > 0) {
      console.log(`🚨 Debug: Failed resolutions for key adapter files:`);
      failedResolutions.slice(0, 10).forEach((failure) => {
        console.log(`  📁 ${failure.from} → "${failure.import}"`);
        console.log(`    Resolved: ${failure.resolved}`);
        console.log(`    Exists: ${failure.exists}, In fileNodes: ${failure.inFileNodes}`);
        if (failure.similarPaths?.length > 0) {
          console.log(`    Similar files found: ${failure.similarPaths.join(', ')}`);
        }
      });
    }

    // Show some sample file paths in fileNodes for comparison
    const sampleAdapterPaths = [...this.fileNodes.keys()].filter(
      (p) => p.includes('integration-service-adapter') || p.includes('mcp-tool-registry')
    );
    if (sampleAdapterPaths.length > 0) {
      console.log(`🔍 Sample adapter file paths in fileNodes:`);
      sampleAdapterPaths.forEach((p) => console.log(`  📄 ${p}`));
    }

    // Debug specific adapter file dependents
    sampleAdapterPaths.forEach((filePath) => {
      const dependents = this.dependentEdges.get(filePath);
      console.log(`🎯 ${path.basename(filePath)}: ${dependents?.size || 0} dependents`);
      if (dependents && dependents.size > 0) {
        [...dependents].slice(0, 3).forEach((dep) => console.log(`    ← ${path.basename(dep)}`));
      }
    });
  }

  /**
   * Detect circular dependencies using DFS
   */
  detectCircularDependencies() {
    const WHITE = 0,
      GRAY = 1,
      BLACK = 2;
    const colors = new Map();

    // Initialize all nodes as WHITE
    for (const filePath of this.fileNodes.keys()) {
      colors.set(filePath, WHITE);
    }

    const dfs = (filePath, visitPath = []) => {
      if (colors.get(filePath) === GRAY) {
        // Back edge found - circular dependency
        const cycleStart = visitPath.indexOf(filePath);
        const cycle = visitPath.slice(cycleStart);
        cycle.push(filePath);
        this.circularDeps.add(cycle.map((p) => path.basename(p)).join(' -> '));
        return true;
      }

      if (colors.get(filePath) === BLACK) {
        return false;
      }

      colors.set(filePath, GRAY);
      visitPath.push(filePath);

      const dependencies = this.dependencyEdges.get(filePath) || new Set();
      for (const dependency of dependencies) {
        if (dfs(dependency, [...visitPath])) {
          return true;
        }
      }

      colors.set(filePath, BLACK);
      return false;
    };

    for (const filePath of this.fileNodes.keys()) {
      if (colors.get(filePath) === WHITE) {
        dfs(filePath);
      }
    }
  }

  /**
   * Smart file prioritization using graph metrics
   */
  prioritizeFilesByImpact() {
    console.log('🎯 Prioritizing files by impact...');

    const fileScores = new Map();

    for (const [filePath, node] of this.fileNodes) {
      let score = 0;

      // Impact score: files with more dependents have higher impact
      const dependentCount = this.dependentEdges.get(filePath)?.size || 0;
      score += dependentCount * 20; // High weight for impact

      // Complexity score
      score += node.complexity * 3;

      // Size score (larger files might need more attention)
      if (node.size > 5000) {
        score += Math.log(node.size / 1000) * 2;
      }

      // Line count factor
      if (node.lines > 200) {
        score += Math.log(node.lines / 50) * 1;
      }

      // Circular dependency penalty
      const fileName = path.basename(filePath);
      const isInCycle = [...this.circularDeps].some((cycle) => cycle.includes(fileName));
      if (isInCycle) {
        score += 100; // Very high priority for circular deps
      }

      // Path-based priorities
      if (filePath.includes('/core/')) score += 50;
      if (filePath.includes('/interfaces/')) score += 40;
      if (filePath.includes('/index.')) score += 30;
      if (filePath.includes('/main.')) score += 30;
      if (filePath.includes('/app.')) score += 25;

      // Entry point detection
      const dependencyCount = this.dependencyEdges.get(filePath)?.size || 0;
      if (dependencyCount === 0 && dependentCount > 0) {
        score += 60; // Likely an entry point
      }

      fileScores.set(filePath, score);
    }

    // Sort by score (highest first)
    const prioritized = [...fileScores.entries()]
      .sort(([, a], [, b]) => b - a)
      .map(([path, score]) => ({ path, score }));

    // Show top priority files
    console.log('🏆 Top priority files:');
    prioritized.slice(0, 10).forEach((file, i) => {
      const node = this.fileNodes.get(file.path);
      const dependents = this.dependentEdges.get(file.path)?.size || 0;
      console.log(
        `  ${i + 1}. ${path.basename(file.path)} (score: ${file.score.toFixed(1)}, ${dependents} dependents)`
      );
    });

    return prioritized;
  }

  /**
   * Create efficient batches with reasonable sizes to avoid ENOBUFS
   */
  createIntelligentBatches(prioritizedFiles, maxBatchSize = 25) {
    console.log('📦 Creating efficient batches...');

    const batches = [];
    const totalFiles = prioritizedFiles.length;

    // Simple efficient batching: fixed sizes to avoid ENOBUFS
    for (let i = 0; i < totalFiles; i += maxBatchSize) {
      const batch = prioritizedFiles.slice(i, i + maxBatchSize).map((fileInfo) => fileInfo.path);

      if (batch.length > 0) {
        batches.push(batch);
      }
    }

    console.log(
      `📊 Created ${batches.length} efficient batches (avg size: ${(totalFiles / batches.length).toFixed(1)})`
    );
    console.log(
      `🎯 Batch sizes: ${batches
        .slice(0, 5)
        .map((b) => b.length)
        .join(', ')}${batches.length > 5 ? ', ...' : ''}`
    );

    return batches;
  }

  /**
   * Run graph-enhanced ESLint analysis
   */
  async runSmartESLintAnalysis() {
    console.log('🔍 Running smart ESLint analysis...');

    // Build dependency graph
    await this.buildDependencyGraph();

    // Prioritize files
    const prioritizedFiles = this.prioritizeFilesByImpact();

    // Create intelligent batches (smaller to avoid ENOBUFS)
    const batches = this.createIntelligentBatches(prioritizedFiles, 10);

    // Quick mode: only process first 2 batches for testing
    const isQuickMode = process.argv.includes('--quick');
    const batchesToProcess = isQuickMode ? Math.min(2, batches.length) : batches.length;

    if (isQuickMode) {
      console.log(
        `⚡ Quick mode: Processing only first ${batchesToProcess} batches (${batchesToProcess * 10} files) for TypeScript API testing`
      );
    }

    const allViolations = [];
    let processedFiles = 0;

    for (const [index, batch] of batches.entries()) {
      if (index >= batchesToProcess) break; // Stop at the limit for quick mode

      const progress = (((index + 1) / batchesToProcess) * 100).toFixed(1);
      console.log(
        `📊 Batch ${index + 1}/${batchesToProcess} (${batch.length} files, ${progress}% complete)`
      );

      try {
        const violations = await this.runESLintOnBatch(batch);
        allViolations.push(...violations);
        processedFiles += batch.length;

        // Update violation counts in nodes
        const violationCounts = this.countViolationsByFile(violations);
        for (const filePath of batch) {
          const node = this.fileNodes.get(filePath);
          if (node) {
            node.violations = violationCounts.get(filePath) || 0;
          }
        }

        const batchViolationCount = violations.length;
        const totalFiles = isQuickMode ? batchesToProcess * 10 : prioritizedFiles.length;
        console.log(
          `✅ Batch ${index + 1}: ${batchViolationCount} violations found (${processedFiles}/${totalFiles} files processed)`
        );

        // Brief pause to prevent overwhelming the system
        if (index < batchesToProcess - 1) {
          await this.sleep(50);
        }
      } catch (error) {
        console.warn(`⚠️  Batch ${index + 1} failed:`, error.message);
        // Continue with next batch instead of stopping
      }
    }

    return {
      violations: allViolations,
      fileNodes: this.fileNodes,
      circularDeps: this.circularDeps,
      dependencyEdges: this.dependencyEdges,
      dependentEdges: this.dependentEdges,
    };
  }

  /**
   * Count violations by file
   */
  countViolationsByFile(violations) {
    const counts = new Map();
    for (const violation of violations) {
      const current = counts.get(violation.file) || 0;
      counts.set(violation.file, current + 1);
    }
    return counts;
  }

  /**
   * Run ESLint on batch with better error handling
   */
  async runESLintOnBatch(files) {
    return new Promise((resolve, reject) => {
      const eslint = spawn('npx', ['eslint', ...files, '--format', 'json'], {
        stdio: 'pipe',
        cwd: path.resolve(__dirname, '../..'),
        env: {
          ...process.env,
          NODE_OPTIONS: '--max-old-space-size=2048',
          NODE_NO_WARNINGS: '1',
        },
      });

      let stdout = '';
      let stderr = '';

      eslint.stdout.on('data', (chunk) => {
        stdout += chunk.toString();
      });

      eslint.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });

      eslint.on('close', (code) => {
        try {
          const results = JSON.parse(stdout || '[]');
          const violations = results.flatMap((file) =>
            file.messages.map((msg) => ({
              file: file.filePath,
              line: msg.line,
              column: msg.column,
              rule: msg.ruleId,
              message: msg.message,
              severity: msg.severity,
            }))
          );
          resolve(violations);
        } catch (parseError) {
          reject(new Error(`Parse failed: ${parseError.message}`));
        }
      });

      eslint.on('error', reject);

      // Timeout after 2 minutes per batch
      setTimeout(() => {
        eslint.kill();
        reject(new Error('Batch timeout'));
      }, 120000);
    });
  }

  /**
   * Extract dependencies using official TypeScript Compiler API
   */
  extractDependencies(content, filePath) {
    const dependencies = { imports: [], exports: [], dynamicImports: [] };

    try {
      // Create TypeScript source file AST
      const sourceFile = ts.createSourceFile(
        filePath,
        content,
        ts.ScriptTarget.Latest,
        true, // setParentNodes
        path.extname(filePath) === '.tsx' ? ts.ScriptKind.TSX : ts.ScriptKind.TS
      );

      // Traverse AST and extract import/export declarations
      const visitNode = (node) => {
        switch (node.kind) {
          case ts.SyntaxKind.ImportDeclaration:
            this.extractImportDeclaration(node, dependencies);
            break;

          case ts.SyntaxKind.ExportDeclaration:
            this.extractExportDeclaration(node, dependencies);
            break;

          case ts.SyntaxKind.CallExpression:
            this.extractDynamicImport(node, dependencies);
            break;
        }

        // Continue traversing child nodes
        ts.forEachChild(node, visitNode);
      };

      // Start traversal from root
      ts.forEachChild(sourceFile, visitNode);
    } catch (error) {
      // Fallback to regex on TypeScript parsing error
      console.warn(`⚠️  TypeScript parsing failed for ${path.basename(filePath)}: ${error.message}`);
      return this.extractDependenciesRegexFallback(content, filePath);
    }

    return dependencies;
  }

  /**
   * Extract import declaration from TypeScript AST node
   */
  extractImportDeclaration(node, dependencies) {
    if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      const importPath = node.moduleSpecifier.text;
      if (importPath.startsWith('.')) {
        dependencies.imports.push(importPath);
      }
    }
  }

  /**
   * Extract export declaration from TypeScript AST node
   */
  extractExportDeclaration(node, dependencies) {
    if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
      const exportPath = node.moduleSpecifier.text;
      if (exportPath.startsWith('.')) {
        dependencies.exports.push(exportPath);
      }
    }
  }

  /**
   * Extract dynamic import() calls from TypeScript AST
   */
  extractDynamicImport(node, dependencies) {
    // Check if this is an import() call
    if (
      ts.isCallExpression(node) &&
      node.expression &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length > 0
    ) {
      const firstArg = node.arguments[0];
      if (ts.isStringLiteral(firstArg)) {
        const importPath = firstArg.text;
        if (importPath.startsWith('.')) {
          dependencies.dynamicImports.push(importPath);
        }
      }
    }
  }

  /**
   * Regex fallback for when TypeScript parsing fails
   */
  extractDependenciesRegexFallback(content, filePath) {
    const dependencies = { imports: [], exports: [], dynamicImports: [] };

    // Static imports with multiline support
    const importPatterns = [
      /import\s+[\s\S]*?from\s+['"](.*?)['"];?/g,
      /import\s*\(\s*['"](.*?)['"]\s*\)/g,
      /require\s*\(\s*['"](.*?)['"]\s*\)/g,
    ];

    for (const pattern of importPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const importPath = match[1];
        if (importPath.startsWith('.')) {
          dependencies.imports.push(importPath);
        }
      }
    }

    // Re-exports
    const exportPattern = /export\s+[\s\S]*?from\s+['"](.*?)['"];?/g;
    let match;
    while ((match = exportPattern.exec(content)) !== null) {
      if (match[1].startsWith('.')) {
        dependencies.exports.push(match[1]);
      }
    }

    return dependencies;
  }

  /**
   * Calculate complexity score
   */
  calculateComplexity(content) {
    let complexity = 1; // Base complexity

    // Count complexity indicators
    const patterns = [
      /\bif\b/g,
      /\belse\b/g,
      /\bwhile\b/g,
      /\bfor\b/g,
      /\bswitch\b/g,
      /\bcase\b/g,
      /\bcatch\b/g,
      /&&|\|\|/g,
      /\?\s*.*?\s*:/g,
    ];

    for (const pattern of patterns) {
      const matches = content.match(pattern) || [];
      complexity += matches.length;
    }

    return complexity;
  }

  /**
   * Resolve import path to full file path with consistent absolute path normalization
   */
  resolveImportPath(basePath, importPath) {
    if (!importPath.startsWith('.')) {
      return importPath; // External module
    }

    const baseDir = path.dirname(basePath);
    const resolved = path.resolve(baseDir, importPath);

    // Try common extensions
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    for (const ext of extensions) {
      const candidate = resolved + ext;
      if (fs.existsSync(candidate)) {
        // Normalize to absolute path to match fileNodes keys
        return path.normalize(path.resolve(candidate));
      }
    }

    // Try index files
    const indexExtensions = ['/index.ts', '/index.tsx', '/index.js'];
    for (const indexExt of indexExtensions) {
      const candidate = resolved + indexExt;
      if (fs.existsSync(candidate)) {
        // Normalize to absolute path to match fileNodes keys
        return path.normalize(path.resolve(candidate));
      }
    }

    // Default assumption with path normalization
    return path.normalize(path.resolve(resolved + '.ts'));
  }

  /**
   * Get all TypeScript files with consistent absolute path normalization
   */
  async getAllTypeScriptFiles() {
    return new Promise((resolve) => {
      const repoRoot = path.resolve(__dirname, '../..');
      const find = spawn('find', ['src', '-name', '*.ts', '-o', '-name', '*.tsx'], {
        stdio: 'pipe',
        cwd: repoRoot,
      });

      let stdout = '';
      find.stdout.on('data', (data) => (stdout += data.toString()));
      find.on('close', () => {
        const files = stdout
          .trim()
          .split('\n')
          .filter((f) => f && !f.includes('node_modules') && !f.includes('.d.ts'))
          .map((f) => {
            // Ensure consistent absolute path normalization
            const absolutePath = path.resolve(repoRoot, f);
            return path.normalize(absolutePath);
          });
        resolve(files);
      });
    });
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🧘 Claude Code Zen AI ESLint Fixer - TypeScript Compiler API Edition');
  console.log('====================================================================');

  const analyzer = new TypeScriptGraphESLintAnalyzer();

  try {
    const startTime = Date.now();

    // Run smart analysis
    const result = await analyzer.runSmartESLintAnalysis();

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`\n📊 Analysis Complete (${duration}s):`);
    console.log(`  • ${result.violations.length} violations found`);
    console.log(`  • ${result.fileNodes.size} files analyzed`);
    console.log(`  • ${result.circularDeps.size} circular dependencies`);

    // Show circular dependencies
    if (result.circularDeps.size > 0) {
      console.log('\n🔄 Circular Dependencies:');
      [...result.circularDeps].slice(0, 5).forEach((cycle, i) => {
        console.log(`  ${i + 1}. ${cycle}`);
      });
      if (result.circularDeps.size > 5) {
        console.log(`  ... and ${result.circularDeps.size - 5} more`);
      }
    }

    // Show violation breakdown
    const violationGroups = result.violations.reduce((groups, v) => {
      groups[v.rule] = (groups[v.rule] || 0) + 1;
      return groups;
    }, {});

    console.log('\n📋 Top violation types:');
    Object.entries(violationGroups)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .forEach(([rule, count]) => {
        console.log(`  • ${rule}: ${count} violations`);
      });

    // Show most problematic files
    const filesByViolations = [...result.fileNodes.values()]
      .filter((node) => node.violations > 0)
      .sort((a, b) => b.violations - a.violations)
      .slice(0, 10);

    if (filesByViolations.length > 0) {
      console.log('\n🚨 Most problematic files:');
      filesByViolations.forEach((node, i) => {
        const dependents = result.dependentEdges.get(node.path)?.size || 0;
        console.log(
          `  ${i + 1}. ${node.name}: ${node.violations} violations (${dependents} dependents)`
        );
      });
    }

    // Show high-impact files
    const highImpactFiles = [...result.fileNodes.values()]
      .sort((a, b) => {
        const aDeps = result.dependentEdges.get(a.path)?.size || 0;
        const bDeps = result.dependentEdges.get(b.path)?.size || 0;
        return bDeps - aDeps;
      })
      .slice(0, 5);

    console.log('\n🎯 Highest impact files:');
    highImpactFiles.forEach((node, i) => {
      const dependents = result.dependentEdges.get(node.path)?.size || 0;
      console.log(
        `  ${i + 1}. ${node.name}: ${dependents} dependents, ${node.violations} violations`
      );
    });

    return result;
  } catch (error) {
    console.error('❌ Smart analysis failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { TypeScriptGraphESLintAnalyzer };
