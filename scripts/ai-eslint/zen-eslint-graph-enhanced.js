#!/usr/bin/env node

/**
 * 🧘 Zen AI ESLint Fixer - Graph-Enhanced Edition
 *
 * Smart ESLint fixing using LanceDB + Google embeddings for:
 * - Dependency-aware violation prioritization
 * - Similar pattern detection
 * - Impact analysis for fixes
 * - Intelligent file batching
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Graph-Enhanced ESLint Analyzer with LanceDB
 */
class GraphEnhancedESLintAnalyzer {
  constructor() {
    this.lanceDB = null;
    this.googleEmbeddings = null;
    this.dependencyGraph = new Map();
    this.fileEmbeddings = new Map();
  }

  /**
   * Initialize LanceDB with Google embeddings
   */
  async initializeLanceDB() {
    console.log('🚀 Initializing LanceDB with Google embeddings...');

    try {
      // Use our existing database provider factory
      const { DatabaseProviderFactory } = await import(
        '../../src/database/providers/database-providers.ts'
      );
      const { GoogleGenerativeAI } = await import('@google/generative-ai');

      // Initialize Google AI for embeddings
      this.googleEmbeddings = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

      // Configure LanceDB
      const lanceConfig = {
        type: 'lancedb',
        database: './lance_eslint_embeddings',
        options: {
          vectorSize: 768, // Google embedding size
          metricType: 'cosine',
          indexType: 'HNSW',
          batchSize: 100,
        },
      };

      // Create LanceDB adapter using our factory
      const factory = new DatabaseProviderFactory(console, {});
      this.lanceDB = await factory.createVectorAdapter(lanceConfig);

      console.log('✅ LanceDB initialized with Google embeddings');
      return true;
    } catch (error) {
      console.warn('⚠️  LanceDB initialization failed, falling back to basic mode:', error.message);
      return false;
    }
  }

  /**
   * Smart file analysis using dependency graph + embeddings
   */
  async analyzeFilesIntelligently() {
    console.log('🧠 Building dependency graph and embeddings...');

    const files = await this.getAllTypeScriptFiles();
    console.log(`📁 Found ${files.length} TypeScript files`);

    // Build dependency graph
    await this.buildDependencyGraph(files);

    // Generate embeddings if LanceDB available
    if (this.lanceDB && this.googleEmbeddings) {
      await this.generateFileEmbeddings(files);
    }

    // Smart file prioritization
    const prioritizedFiles = await this.prioritizeFilesByImpact(files);

    return prioritizedFiles;
  }

  /**
   * Build file dependency graph from imports/exports
   */
  async buildDependencyGraph(files) {
    console.log('🕸️  Building dependency graph...');

    for (const filePath of files.slice(0, 50)) {
      // Limit for initial implementation
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const dependencies = this.extractDependencies(content, filePath);
        this.dependencyGraph.set(filePath, dependencies);
      } catch (error) {
        // Skip files with read errors
      }
    }

    console.log(`📊 Dependency graph: ${this.dependencyGraph.size} files mapped`);
  }

  /**
   * Extract import/export dependencies from file content
   */
  extractDependencies(content, filePath) {
    const dependencies = {
      imports: [],
      exports: [],
      references: [],
    };

    // Match imports: import { foo } from './bar'
    const importRegex = /import\s+.*?from\s+['"`]([^'"`]+)['"`]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = this.resolveRelativePath(filePath, match[1]);
      dependencies.imports.push(importPath);
    }

    // Match exports: export { foo }
    const exportRegex = /export\s+.*?(?:from\s+['"`]([^'"`]+)['"`])?/g;
    while ((match = exportRegex.exec(content)) !== null) {
      if (match[1]) {
        const exportPath = this.resolveRelativePath(filePath, match[1]);
        dependencies.exports.push(exportPath);
      }
    }

    return dependencies;
  }

  /**
   * Generate Google embeddings for files
   */
  async generateFileEmbeddings(files) {
    if (!this.googleEmbeddings) return;

    console.log('🤖 Generating Google embeddings...');

    const embeddingModel = this.googleEmbeddings.getGenerativeModel({
      model: 'embedding-001',
    });

    for (const filePath of files.slice(0, 20)) {
      // Batch processing
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const summary = this.createFileSummary(content, filePath);

        const result = await embeddingModel.embedContent(summary);
        const embedding = result.embedding;

        // Store in LanceDB
        await this.lanceDB.addVectors([
          {
            id: filePath,
            vector: embedding.values,
            metadata: {
              path: filePath,
              size: content.length,
              type: path.extname(filePath),
              dependencies: this.dependencyGraph.get(filePath)?.imports?.length || 0,
            },
          },
        ]);

        this.fileEmbeddings.set(filePath, embedding.values);
      } catch (error) {
        console.warn(`⚠️  Embedding failed for ${path.basename(filePath)}:`, error.message);
      }
    }

    console.log(`✨ Generated embeddings for ${this.fileEmbeddings.size} files`);
  }

  /**
   * Create concise file summary for embeddings
   */
  createFileSummary(content, filePath) {
    const lines = content.split('\n');
    const summary = {
      filename: path.basename(filePath),
      directory: path.dirname(filePath).split('/').pop(),
      imports: [],
      exports: [],
      classes: [],
      functions: [],
    };

    // Extract key elements
    for (const line of lines.slice(0, 100)) {
      // First 100 lines
      if (line.includes('import ')) summary.imports.push(line.trim());
      if (line.includes('export ')) summary.exports.push(line.trim());
      if (line.match(/class \w+/)) summary.classes.push(line.trim());
      if (line.match(/function \w+|const \w+ = |=> /)) summary.functions.push(line.trim());
    }

    return `File: ${summary.filename}
Directory: ${summary.directory}
Imports: ${summary.imports.slice(0, 5).join('; ')}
Exports: ${summary.exports.slice(0, 5).join('; ')}
Classes: ${summary.classes.slice(0, 3).join('; ')}
Functions: ${summary.functions.slice(0, 5).join('; ')}`;
  }

  /**
   * Prioritize files by dependency impact
   */
  async prioritizeFilesByImpact(files) {
    console.log('🎯 Prioritizing files by impact...');

    const fileScores = new Map();

    for (const filePath of files) {
      let score = 0;

      // Dependency impact score
      const deps = this.dependencyGraph.get(filePath);
      if (deps) {
        score += deps.imports.length * 0.5; // Files with many imports = complex
        score += this.countDependents(filePath) * 2; // Files many depend on = high impact
      }

      // File size impact (larger = potentially more complex)
      try {
        const stats = fs.statSync(filePath);
        score += Math.log(stats.size) * 0.1;
      } catch (error) {
        // Skip if can't stat
      }

      // Core/interface files get priority
      if (filePath.includes('/core/') || filePath.includes('/interfaces/')) {
        score += 10;
      }

      fileScores.set(filePath, score);
    }

    // Sort by score (highest first)
    const prioritized = [...fileScores.entries()]
      .sort(([, a], [, b]) => b - a)
      .map(([path]) => path);

    console.log(`📈 Prioritized ${prioritized.length} files by impact`);
    return prioritized;
  }

  /**
   * Count how many files depend on this file
   */
  countDependents(filePath) {
    let count = 0;
    for (const [, deps] of this.dependencyGraph) {
      if (deps.imports.includes(filePath)) {
        count++;
      }
    }
    return count;
  }

  /**
   * Smart ESLint analysis with intelligent chunking
   */
  async runSmartESLintAnalysis(prioritizedFiles) {
    console.log('🔍 Running smart ESLint analysis...');

    // Process in dependency-aware batches
    const batches = this.createDependencyAwareBatches(prioritizedFiles, 50);
    const allViolations = [];

    for (const [index, batch] of batches.entries()) {
      console.log(`📊 Processing batch ${index + 1}/${batches.length} (${batch.length} files)`);

      try {
        const violations = await this.runESLintOnBatch(batch);
        allViolations.push(...violations);

        console.log(`✅ Batch ${index + 1}: Found ${violations.length} violations`);
      } catch (error) {
        console.warn(`⚠️  Batch ${index + 1} failed:`, error.message);
      }
    }

    return allViolations;
  }

  /**
   * Create dependency-aware file batches
   */
  createDependencyAwareBatches(files, batchSize) {
    const batches = [];
    const processed = new Set();

    for (const file of files) {
      if (processed.has(file)) continue;

      const batch = [];
      const toProcess = [file];

      // Add file and its immediate dependencies to same batch
      while (toProcess.length > 0 && batch.length < batchSize) {
        const currentFile = toProcess.shift();
        if (processed.has(currentFile)) continue;

        batch.push(currentFile);
        processed.add(currentFile);

        // Add immediate dependencies
        const deps = this.dependencyGraph.get(currentFile);
        if (deps) {
          toProcess.push(...deps.imports.slice(0, 3)); // Limit to prevent explosion
        }
      }

      if (batch.length > 0) {
        batches.push(batch);
      }
    }

    return batches;
  }

  /**
   * Run ESLint on a batch of files with increased buffer
   */
  async runESLintOnBatch(files) {
    const fileArgs = files.map((f) => `"${f}"`).join(' ');
    const command = `npx eslint ${fileArgs} --format json`;

    return new Promise((resolve, reject) => {
      const eslint = spawn('npx', ['eslint', ...files, '--format', 'json'], {
        stdio: 'pipe',
        cwd: path.resolve(__dirname, '../..'),
        env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' },
      });

      let stdout = '';
      let stderr = '';

      eslint.stdout.on('data', (data) => (stdout += data.toString()));
      eslint.stderr.on('data', (data) => (stderr += data.toString()));

      eslint.on('close', (code) => {
        try {
          // ESLint returns non-zero for violations, but still provides JSON
          const violations = JSON.parse(stdout || '[]');
          const flatViolations = violations.flatMap((file) =>
            file.messages.map((msg) => ({
              file: file.filePath,
              line: msg.line,
              column: msg.column,
              rule: msg.ruleId,
              message: msg.message,
              severity: msg.severity,
            }))
          );
          resolve(flatViolations);
        } catch (error) {
          reject(new Error(`ESLint parsing failed: ${error.message}\nStderr: ${stderr}`));
        }
      });

      eslint.on('error', reject);

      // Timeout after 5 minutes
      setTimeout(() => {
        eslint.kill();
        reject(new Error('ESLint timeout after 5 minutes'));
      }, 300000);
    });
  }

  /**
   * Find similar violations using embeddings
   */
  async findSimilarViolations(violation) {
    if (!this.lanceDB || !this.fileEmbeddings.has(violation.file)) {
      return [];
    }

    try {
      const fileEmbedding = this.fileEmbeddings.get(violation.file);
      const similarFiles = await this.lanceDB.vectorSearch(fileEmbedding, 5);

      return similarFiles.map((result) => ({
        file: result.metadata.path,
        similarity: result.score,
        dependencies: result.metadata.dependencies,
      }));
    } catch (error) {
      console.warn('Similar violation search failed:', error.message);
      return [];
    }
  }

  /**
   * Get all TypeScript files in the project
   */
  async getAllTypeScriptFiles() {
    return new Promise((resolve) => {
      const find = spawn('find', ['src', '-name', '*.ts', '-o', '-name', '*.tsx'], {
        stdio: 'pipe',
        cwd: path.resolve(__dirname, '../..'),
      });

      let stdout = '';
      find.stdout.on('data', (data) => (stdout += data.toString()));
      find.on('close', () => {
        const files = stdout
          .trim()
          .split('\n')
          .filter((f) => f && !f.includes('node_modules'));
        resolve(files);
      });
    });
  }

  /**
   * Resolve relative import paths
   */
  resolveRelativePath(basePath, importPath) {
    if (importPath.startsWith('.')) {
      return path.resolve(path.dirname(basePath), importPath);
    }
    return importPath;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🧘 Claude Code Zen AI ESLint Fixer - Graph-Enhanced Edition');
  console.log('================================================================');

  const analyzer = new GraphEnhancedESLintAnalyzer();

  try {
    // Initialize graph analysis
    const lanceInitialized = await analyzer.initializeLanceDB();

    // Analyze files intelligently
    const prioritizedFiles = await analyzer.analyzeFilesIntelligently();

    // Run smart ESLint analysis
    const violations = await analyzer.runSmartESLintAnalysis(prioritizedFiles);

    console.log(
      `\n📊 Analysis Complete: ${violations.length} violations found across ${prioritizedFiles.length} files`
    );

    if (lanceInitialized) {
      console.log('✨ Enhanced with dependency graph analysis and Google embeddings');
    } else {
      console.log('⚠️  Running in basic mode without embeddings');
    }

    // Group violations by type
    const violationGroups = violations.reduce((groups, v) => {
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

    return { violations, prioritizedFiles, analyzer };
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { GraphEnhancedESLintAnalyzer };
