/**
 * Bazel Monorepo Plugin
 * Monorepo management with Bazel for modular, incremental builds
 */

import { readFile, writeFile, mkdir, access } from 'fs/promises';
import { spawn } from 'child_process';
import path from 'path';

export class BazelMonorepoPlugin {
  constructor(config = {}) {
    this.config = {
      workspaceRoot: process.cwd(),
      bazelBinary: 'bazel',
      buildTargets: ['//...'],
      testTargets: ['//...'],
      cacheEnabled: true,
      remoteCache: null,
      buildMode: 'opt', // opt, dbg, fastbuild
      platforms: ['//tools/platforms:default'],
      aspectsEnabled: true,
      incrementalEnabled: true,
      parallelJobs: 4,
      ...config
    };
    
    this.workspace = null;
    this.modules = new Map();
    this.buildGraph = new Map();
    this.stats = {
      modulesFound: 0,
      buildRulesFound: 0,
      dependenciesAnalyzed: 0,
      cacheHitRate: 0
    };
  }

  async initialize() {
    console.log('🏗️ Bazel Monorepo Plugin initialized');
    
    // Check if Bazel is available
    await this.checkBazelInstallation();
    
    // Load workspace configuration
    await this.loadWorkspace();
    
    // Discover modules
    await this.discoverModules();
    
    // Build dependency graph
    await this.buildDependencyGraph();
  }

  async checkBazelInstallation() {
    try {
      const version = await this.runBazelCommand(['version']);
      console.log(`✅ Bazel detected: ${version.split('\n')[0]}`);
      return true;
    } catch (error) {
      console.warn('⚠️ Bazel not found. Install from: https://bazel.build/install');
      throw new Error('Bazel is required for monorepo management');
    }
  }

  async loadWorkspace() {
    const workspaceFile = path.join(this.config.workspaceRoot, 'WORKSPACE');
    const workspaceBazelFile = path.join(this.config.workspaceRoot, 'WORKSPACE.bazel');
    
    try {
      // Try WORKSPACE.bazel first, then WORKSPACE
      let workspaceContent = '';
      try {
        workspaceContent = await readFile(workspaceBazelFile, 'utf8');
      } catch {
        workspaceContent = await readFile(workspaceFile, 'utf8');
      }
      
      this.workspace = this.parseWorkspace(workspaceContent);
      console.log(`📦 Loaded workspace: ${this.workspace.name || 'unnamed'}`);
      
      // Load .bazelrc if exists
      await this.loadBazelrc();
      
    } catch (error) {
      console.warn('⚠️ No WORKSPACE file found. Initialize with: bazel init');
      // Create basic workspace structure
      await this.initializeWorkspace();
    }
  }

  async loadBazelrc() {
    const bazelrcFile = path.join(this.config.workspaceRoot, '.bazelrc');
    
    try {
      const content = await readFile(bazelrcFile, 'utf8');
      this.bazelrc = this.parseBazelrc(content);
    } catch (error) {
      // Create default .bazelrc
      await this.createDefaultBazelrc();
    }
  }

  async initializeWorkspace() {
    console.log('🏗️ Initializing Bazel workspace...');
    
    const workspaceContent = `
workspace(name = "claude_zen_monorepo")

# Load rules
load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# Node.js rules
http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "...",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/..."],
)

load("@build_bazel_rules_nodejs//:index.bzl", "node_repositories", "npm_install")
node_repositories()

# Python rules (if needed)
http_archive(
    name = "rules_python",
    sha256 = "...",
    urls = ["https://github.com/bazelbuild/rules_python/releases/..."],
)

# Docker rules (if needed)
http_archive(
    name = "io_bazel_rules_docker",
    sha256 = "...",
    urls = ["https://github.com/bazelbuild/rules_docker/releases/..."],
)
`.trim();

    await writeFile(path.join(this.config.workspaceRoot, 'WORKSPACE.bazel'), workspaceContent);
    await this.createDefaultBazelrc();
    
    console.log('✅ Bazel workspace initialized');
  }

  async createDefaultBazelrc() {
    const bazelrcContent = `
# Build configuration
build --strategy=Javac=worker
build --strategy=TypeScriptCompile=worker
build --disk_cache=.bazel-cache
build --experimental_remote_cache_compression

# Test configuration  
test --test_output=errors
test --test_timeout=300

# Performance optimizations
build --jobs=${this.config.parallelJobs}
build --local_ram_resources=HOST_RAM*0.7
build --local_cpu_resources=HOST_CPUS

# Development mode
build:dev --compilation_mode=fastbuild
build:dev --test_tag_filters=-slow

# Production mode
build:prod --compilation_mode=opt
build:prod --strip=always

# Remote cache (if configured)
${this.config.remoteCache ? `build --remote_cache=${this.config.remoteCache}` : ''}
`.trim();

    await writeFile(path.join(this.config.workspaceRoot, '.bazelrc'), bazelrcContent);
  }

  async discoverModules() {
    console.log('🔍 Discovering Bazel modules...');
    
    try {
      // Find all BUILD files
      const buildFiles = await this.findBuildFiles();
      
      for (const buildFile of buildFiles) {
        const module = await this.parseModule(buildFile);
        if (module) {
          this.modules.set(module.path, module);
        }
      }
      
      this.stats.modulesFound = this.modules.size;
      console.log(`📦 Found ${this.stats.modulesFound} Bazel modules`);
      
    } catch (error) {
      console.error('❌ Module discovery failed:', error.message);
    }
  }

  async findBuildFiles() {
    const { glob } = await import('glob');
    
    const patterns = [
      '**/BUILD',
      '**/BUILD.bazel',
      '!**/node_modules/**',
      '!**/.git/**',
      '!**/bazel-*/**'
    ];
    
    const files = [];
    for (const pattern of patterns) {
      if (pattern.startsWith('!')) {
        continue; // Skip ignore patterns in this simple implementation
      }
      
      const matches = await glob(pattern, {
        cwd: this.config.workspaceRoot,
        absolute: true
      });
      files.push(...matches);
    }
    
    return files;
  }

  async parseModule(buildFilePath) {
    try {
      const content = await readFile(buildFilePath, 'utf8');
      const relativePath = path.relative(this.config.workspaceRoot, path.dirname(buildFilePath));
      
      const module = {
        path: relativePath || '.',
        buildFile: buildFilePath,
        targets: [],
        dependencies: [],
        visibility: [],
        metadata: {}
      };
      
      // Parse Bazel rules (simplified parser)
      const rules = this.parseBuildRules(content);
      module.targets = rules;
      this.stats.buildRulesFound += rules.length;
      
      // Extract dependencies
      module.dependencies = this.extractDependencies(rules);
      this.stats.dependenciesAnalyzed += module.dependencies.length;
      
      // Detect module type
      module.type = this.detectModuleType(rules, relativePath);
      
      // Load package.json if exists (for Node.js modules)
      const packageJsonPath = path.join(path.dirname(buildFilePath), 'package.json');
      try {
        const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
        module.metadata.packageJson = packageJson;
        module.metadata.name = packageJson.name;
        module.metadata.version = packageJson.version;
      } catch {
        // No package.json, that's OK
      }
      
      return module;
    } catch (error) {
      console.warn(`⚠️ Failed to parse ${buildFilePath}: ${error.message}`);
      return null;
    }
  }

  parseBuildRules(content) {
    const rules = [];
    
    // Simple regex-based parser for common Bazel rules
    const rulePatterns = [
      /(\w+)\s*\(\s*name\s*=\s*["']([^"']+)["']/g,
      /load\s*\(\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']/g
    ];
    
    for (const pattern of rulePatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        rules.push({
          type: match[1],
          name: match[2],
          target: `//${this.getPackagePath(content)}:${match[2]}`
        });
      }
    }
    
    return rules;
  }

  getPackagePath(buildFileContent) {
    // Extract package path from BUILD file location
    return '';  // Simplified for now
  }

  extractDependencies(rules) {
    const dependencies = [];
    
    for (const rule of rules) {
      // Look for deps attribute in rule definition
      const depsMatch = rule.content?.match(/deps\s*=\s*\[(.*?)\]/s);
      if (depsMatch) {
        const deps = depsMatch[1]
          .split(',')
          .map(dep => dep.trim().replace(/["']/g, ''))
          .filter(dep => dep.length > 0);
        
        dependencies.push(...deps);
      }
    }
    
    return [...new Set(dependencies)]; // Remove duplicates
  }

  detectModuleType(rules, path) {
    const ruleTypes = rules.map(r => r.type);
    
    if (ruleTypes.includes('nodejs_binary') || ruleTypes.includes('npm_install')) {
      return 'nodejs';
    } else if (ruleTypes.includes('py_binary') || ruleTypes.includes('py_library')) {
      return 'python';
    } else if (ruleTypes.includes('go_binary') || ruleTypes.includes('go_library')) {
      return 'go';
    } else if (ruleTypes.includes('java_binary') || ruleTypes.includes('java_library')) {
      return 'java';
    } else if (ruleTypes.includes('container_image')) {
      return 'docker';
    } else if (path.includes('services/')) {
      return 'service';
    } else if (path.includes('lib/') || path.includes('shared/')) {
      return 'library';
    } else {
      return 'unknown';
    }
  }

  async buildDependencyGraph() {
    console.log('🕸️ Building dependency graph...');
    
    try {
      // Use Bazel query to get accurate dependency information
      const queryOutput = await this.runBazelCommand([
        'query',
        '--output=build',
        'deps(//...)'
      ]);
      
      this.buildGraph = this.parseDependencyGraph(queryOutput);
      console.log(`🔗 Built dependency graph with ${this.buildGraph.size} nodes`);
      
    } catch (error) {
      console.warn('⚠️ Dependency graph building failed, using basic analysis');
      // Fall back to basic dependency analysis from BUILD files
      this.buildBasicDependencyGraph();
    }
  }

  buildBasicDependencyGraph() {
    for (const [modulePath, module] of this.modules) {
      const node = {
        module: modulePath,
        dependencies: module.dependencies,
        dependents: [],
        type: module.type,
        targets: module.targets.length
      };
      
      this.buildGraph.set(modulePath, node);
    }
    
    // Build reverse dependencies
    for (const [modulePath, node] of this.buildGraph) {
      for (const dep of node.dependencies) {
        const depNode = this.buildGraph.get(dep);
        if (depNode) {
          depNode.dependents.push(modulePath);
        }
      }
    }
  }

  // Build Operations
  async build(targets = this.config.buildTargets, options = {}) {
    console.log(`🔨 Building targets: ${targets.join(', ')}`);
    
    const buildArgs = [
      'build',
      ...targets,
      `--compilation_mode=${options.mode || this.config.buildMode}`,
      `--jobs=${options.jobs || this.config.parallelJobs}`
    ];
    
    if (options.config) {
      buildArgs.push(`--config=${options.config}`);
    }
    
    if (this.config.cacheEnabled) {
      buildArgs.push('--disk_cache=.bazel-cache');
    }
    
    try {
      const startTime = Date.now();
      const output = await this.runBazelCommand(buildArgs);
      const duration = Date.now() - startTime;
      
      const result = {
        success: true,
        duration: duration,
        output: output,
        targets: targets,
        cacheStats: this.extractCacheStats(output)
      };
      
      console.log(`✅ Build completed in ${duration}ms`);
      return result;
      
    } catch (error) {
      console.error('❌ Build failed:', error.message);
      throw error;
    }
  }

  async test(targets = this.config.testTargets, options = {}) {
    console.log(`🧪 Testing targets: ${targets.join(', ')}`);
    
    const testArgs = [
      'test',
      ...targets,
      '--test_output=errors',
      '--test_summary=detailed'
    ];
    
    if (options.coverage) {
      testArgs.push('--collect_code_coverage');
    }
    
    try {
      const output = await this.runBazelCommand(testArgs);
      const result = this.parseTestResults(output);
      
      console.log(`✅ Tests completed: ${result.passed} passed, ${result.failed} failed`);
      return result;
      
    } catch (error) {
      console.error('❌ Tests failed:', error.message);
      throw error;
    }
  }

  async clean(options = {}) {
    console.log('🧹 Cleaning Bazel workspace...');
    
    try {
      if (options.expunge) {
        await this.runBazelCommand(['clean', '--expunge']);
      } else {
        await this.runBazelCommand(['clean']);
      }
      
      console.log('✅ Workspace cleaned');
      
    } catch (error) {
      console.error('❌ Clean failed:', error.message);
      throw error;
    }
  }

  // Analysis Operations
  async analyzeChangeImpact(changedFiles) {
    console.log(`🔍 Analyzing impact of ${changedFiles.length} changed files`);
    
    const affectedTargets = new Set();
    
    try {
      // Use Bazel query to find affected targets
      for (const file of changedFiles) {
        const queryOutput = await this.runBazelCommand([
          'query',
          `rdeps(//..., ${file})`
        ]);
        
        const targets = queryOutput.split('\n').filter(line => line.trim());
        targets.forEach(target => affectedTargets.add(target));
      }
      
      const result = {
        changedFiles: changedFiles,
        affectedTargets: Array.from(affectedTargets),
        buildRecommendation: this.generateBuildRecommendation(affectedTargets),
        testRecommendation: this.generateTestRecommendation(affectedTargets)
      };
      
      console.log(`📊 Impact analysis: ${result.affectedTargets.length} targets affected`);
      return result;
      
    } catch (error) {
      console.warn('⚠️ Impact analysis failed, recommending full build');
      return {
        changedFiles: changedFiles,
        affectedTargets: ['//...'],
        buildRecommendation: ['//...'],
        testRecommendation: ['//...']
      };
    }
  }

  async generateModuleReport() {
    const report = {
      summary: {
        totalModules: this.modules.size,
        moduleTypes: {},
        totalTargets: this.stats.buildRulesFound,
        totalDependencies: this.stats.dependenciesAnalyzed
      },
      modules: [],
      dependencyGraph: {},
      recommendations: []
    };
    
    // Count module types
    for (const module of this.modules.values()) {
      report.summary.moduleTypes[module.type] = 
        (report.summary.moduleTypes[module.type] || 0) + 1;
    }
    
    // Module details
    for (const [path, module] of this.modules) {
      report.modules.push({
        path: path,
        type: module.type,
        targets: module.targets.length,
        dependencies: module.dependencies.length,
        name: module.metadata.name || path,
        version: module.metadata.version
      });
    }
    
    // Dependency graph summary
    for (const [path, node] of this.buildGraph) {
      report.dependencyGraph[path] = {
        dependencies: node.dependencies,
        dependents: node.dependents,
        type: node.type
      };
    }
    
    // Generate recommendations
    report.recommendations = this.generateRecommendations();
    
    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Check for circular dependencies
    const cycles = this.detectCircularDependencies();
    if (cycles.length > 0) {
      recommendations.push({
        type: 'circular_dependency',
        severity: 'high',
        message: `Found ${cycles.length} circular dependencies`,
        details: cycles
      });
    }
    
    // Check for modules with too many dependencies
    const heavyModules = Array.from(this.modules.values())
      .filter(module => module.dependencies.length > 10);
    
    if (heavyModules.length > 0) {
      recommendations.push({
        type: 'heavy_dependencies',
        severity: 'medium',
        message: `${heavyModules.length} modules have >10 dependencies`,
        details: heavyModules.map(m => ({ path: m.path, deps: m.dependencies.length }))
      });
    }
    
    // Check for unused modules (no dependents)
    const unusedModules = Array.from(this.buildGraph.values())
      .filter(node => node.dependents.length === 0 && node.dependencies.length > 0);
    
    if (unusedModules.length > 0) {
      recommendations.push({
        type: 'unused_modules',
        severity: 'low',
        message: `${unusedModules.length} modules appear to be unused`,
        details: unusedModules.map(n => n.module)
      });
    }
    
    return recommendations;
  }

  detectCircularDependencies() {
    const cycles = [];
    const visited = new Set();
    const recursionStack = new Set();
    
    const dfs = (node, path = []) => {
      if (recursionStack.has(node)) {
        // Found cycle
        const cycleStart = path.indexOf(node);
        cycles.push(path.slice(cycleStart).concat([node]));
        return;
      }
      
      if (visited.has(node)) return;
      
      visited.add(node);
      recursionStack.add(node);
      path.push(node);
      
      const nodeData = this.buildGraph.get(node);
      if (nodeData) {
        for (const dep of nodeData.dependencies) {
          dfs(dep, [...path]);
        }
      }
      
      recursionStack.delete(node);
    };
    
    for (const node of this.buildGraph.keys()) {
      if (!visited.has(node)) {
        dfs(node);
      }
    }
    
    return cycles;
  }

  // Helper methods
  async runBazelCommand(args) {
    return new Promise((resolve, reject) => {
      const process = spawn(this.config.bazelBinary, args, {
        cwd: this.config.workspaceRoot,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let stdout = '';
      let stderr = '';
      
      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`Bazel command failed: ${stderr}`));
        }
      });
      
      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  parseWorkspace(content) {
    const workspace = {
      name: null,
      rules: [],
      dependencies: []
    };
    
    // Extract workspace name
    const nameMatch = content.match(/workspace\s*\(\s*name\s*=\s*["']([^"']+)["']/);
    if (nameMatch) {
      workspace.name = nameMatch[1];
    }
    
    // Extract loaded rules
    const loadMatches = content.match(/load\s*\([^)]+\)/g) || [];
    workspace.rules = loadMatches;
    
    return workspace;
  }

  parseBazelrc(content) {
    const config = {
      build: [],
      test: [],
      run: []
    };
    
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [command, ...args] = trimmed.split(' ');
        if (config[command]) {
          config[command].push(args.join(' '));
        }
      }
    }
    
    return config;
  }

  parseDependencyGraph(queryOutput) {
    const graph = new Map();
    // Parse Bazel query output (simplified)
    const lines = queryOutput.split('\n');
    
    for (const line of lines) {
      if (line.includes('->')) {
        const [source, target] = line.split('->').map(s => s.trim());
        if (!graph.has(source)) {
          graph.set(source, { dependencies: [], dependents: [] });
        }
        if (!graph.has(target)) {
          graph.set(target, { dependencies: [], dependents: [] });
        }
        
        graph.get(source).dependencies.push(target);
        graph.get(target).dependents.push(source);
      }
    }
    
    return graph;
  }

  extractCacheStats(buildOutput) {
    const stats = {
      cacheHits: 0,
      cacheMisses: 0,
      totalTargets: 0
    };
    
    // Parse cache statistics from build output
    const cacheHitMatch = buildOutput.match(/(\d+) cache hits?/);
    const cacheMissMatch = buildOutput.match(/(\d+) cache misses?/);
    
    if (cacheHitMatch) stats.cacheHits = parseInt(cacheHitMatch[1]);
    if (cacheMissMatch) stats.cacheMisses = parseInt(cacheMissMatch[1]);
    
    stats.totalTargets = stats.cacheHits + stats.cacheMisses;
    stats.hitRate = stats.totalTargets > 0 ? 
      (stats.cacheHits / stats.totalTargets * 100).toFixed(1) : 0;
    
    return stats;
  }

  parseTestResults(testOutput) {
    const result = {
      passed: 0,
      failed: 0,
      skipped: 0,
      total: 0,
      duration: 0,
      coverage: null
    };
    
    // Parse test summary
    const summaryMatch = testOutput.match(/(\d+) test[s]? passed[,]? (\d+) failed/);
    if (summaryMatch) {
      result.passed = parseInt(summaryMatch[1]);
      result.failed = parseInt(summaryMatch[2]);
      result.total = result.passed + result.failed;
    }
    
    return result;
  }

  generateBuildRecommendation(affectedTargets) {
    if (affectedTargets.size > 100) {
      return ['//...'];  // Full build for large changes
    } else {
      return Array.from(affectedTargets);
    }
  }

  generateTestRecommendation(affectedTargets) {
    // Include test targets for affected modules
    const testTargets = Array.from(affectedTargets)
      .filter(target => target.includes('_test') || target.includes('test_'))
      .concat(Array.from(affectedTargets).map(target => `${target}_test`));
    
    return [...new Set(testTargets)];
  }

  async getStats() {
    return {
      ...this.stats,
      workspace: this.workspace?.name || 'unknown',
      modules: this.modules.size,
      buildGraph: this.buildGraph.size,
      bazelVersion: await this.getBazelVersion()
    };
  }

  async getBazelVersion() {
    try {
      const output = await this.runBazelCommand(['version']);
      return output.split('\n')[0].replace('Build label: ', '');
    } catch {
      return 'unknown';
    }
  }

  async cleanup() {
    this.modules.clear();
    this.buildGraph.clear();
    console.log('🏗️ Bazel Monorepo Plugin cleaned up');
  }
}

export default BazelMonorepoPlugin;