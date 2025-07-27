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
      enableKuzuIntegration: true, // Enable graph database integration
      ...config
    };
    
    this.workspace = null;
    this.modules = new Map();
    this.buildGraph = new Map();
    this.graphBackend = null; // Kuzu graph database backend
    this.hiveMind = null; // Hive-mind integration
    this.stats = {
      modulesFound: 0,
      buildRulesFound: 0,
      dependenciesAnalyzed: 0,
      cacheHitRate: 0,
      graphNodesStored: 0,
      graphRelationshipsStored: 0
    };
  }

  async initialize() {
    console.log('🏗️ Bazel Monorepo Plugin initialized');
    
    // Initialize Kuzu graph database integration if available
    await this.initializeGraphBackend();
    
    // Check if Bazel is available
    await this.checkBazelInstallation();
    
    // Load workspace configuration
    await this.loadWorkspace();
    
    // Discover modules
    await this.discoverModules();
    
    // Build dependency graph
    await this.buildDependencyGraph();

    // Store dependency graph in Kuzu if enabled
    if (this.graphBackend) {
      await this.storeGraphInKuzu();
    }
  }

  async initializeGraphBackend() {
    if (!this.config.enableKuzuIntegration) {
      console.log('📊 Kuzu integration disabled');
      return;
    }

    try {
      // Initialize graph backend through hive-mind if available
      if (this.config.hiveMindIntegration) {
        this.hiveMind = this.config.hiveMindIntegration;
        this.graphBackend = this.config.hybridMemory;
        console.log('✅ Connected to Kuzu graph database via hive-mind');
      } else {
        // Fallback: Initialize Kuzu backend directly
        const { MemoryBackendPlugin } = await import('../memory-backend/index.js');
        this.graphBackend = new MemoryBackendPlugin({
          backend: 'kuzu',
          kuzuConfig: {
            persistDirectory: `${this.config.workspaceRoot}/.bazel-graph`,
            enableRelationships: true
          }
        });
        await this.graphBackend.initialize();
        console.log('✅ Initialized standalone Kuzu graph database');
      }

      // Initialize Bazel-specific schema in Kuzu
      await this.initializeBazelSchema();
      
    } catch (error) {
      console.warn('⚠️ Failed to initialize Kuzu integration:', error.message);
      console.log('📝 Falling back to in-memory dependency graph');
      this.config.enableKuzuIntegration = false;
    }
  }

  async initializeBazelSchema() {
    if (!this.graphBackend?.storage?.conn) {
      return;
    }

    try {
      const conn = this.graphBackend.storage.conn;
      
      // Create node table for Bazel targets
      await conn.query(`
        CREATE NODE TABLE IF NOT EXISTS BazelTarget(
          id STRING,
          workspace STRING,
          package STRING,
          name STRING,
          rule_type STRING,
          module_type STRING,
          source_files STRING,
          metadata STRING,
          timestamp INT64,
          PRIMARY KEY(id)
        )
      `);

      // Create relationship table for dependencies
      await conn.query(`
        CREATE REL TABLE IF NOT EXISTS Depends(FROM BazelTarget TO BazelTarget,
          dependency_type STRING,
          strength DOUBLE,
          is_direct BOOLEAN,
          created_at INT64
        )
      `);

      // Create relationship table for module containment
      await conn.query(`
        CREATE REL TABLE IF NOT EXISTS Contains(FROM BazelTarget TO BazelTarget,
          containment_type STRING,
          created_at INT64
        )
      `);

      console.log('📊 Bazel schema initialized in Kuzu graph database');
    } catch (error) {
      console.warn(`Bazel schema initialization warning: ${error.message}`);
    }
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

  async storeGraphInKuzu() {
    if (!this.graphBackend?.storage?.conn) {
      console.log('📊 No Kuzu connection available for graph storage');
      return;
    }

    console.log('📊 Storing Bazel dependency graph in Kuzu...');
    
    try {
      const conn = this.graphBackend.storage.conn;
      const timestamp = Date.now();
      let nodesStored = 0;
      let relationshipsStored = 0;

      // Store build targets as nodes
      for (const [modulePath, module] of this.modules) {
        for (const target of module.targets) {
          const targetId = target.target || `//${modulePath}:${target.name}`;
          
          await conn.query(`
            MERGE (t:BazelTarget {id: $id})
            SET t.workspace = $workspace,
                t.package = $package,
                t.name = $name,
                t.rule_type = $rule_type,
                t.module_type = $module_type,
                t.source_files = $source_files,
                t.metadata = $metadata,
                t.timestamp = $timestamp
          `, {
            id: targetId,
            workspace: this.workspace?.name || 'unknown',
            package: modulePath,
            name: target.name,
            rule_type: target.type,
            module_type: module.type,
            source_files: JSON.stringify(module.metadata?.packageJson?.files || []),
            metadata: JSON.stringify({
              module: module,
              target: target,
              buildFile: module.buildFile
            }),
            timestamp: timestamp
          });
          
          nodesStored++;
        }
      }

      // Store dependencies as relationships
      for (const [modulePath, node] of this.buildGraph) {
        const sourceTargets = this.modules.get(modulePath)?.targets || [];
        
        for (const dependency of node.dependencies) {
          const depTargets = this.modules.get(dependency)?.targets || [];
          
          // Create relationships between all targets in source module to all targets in dependency module
          for (const sourceTarget of sourceTargets) {
            const sourceId = sourceTarget.target || `//${modulePath}:${sourceTarget.name}`;
            
            for (const depTarget of depTargets) {
              const depId = depTarget.target || `//${dependency}:${depTarget.name}`;
              
              await conn.query(`
                MATCH (source:BazelTarget {id: $sourceId}), (dep:BazelTarget {id: $depId})
                CREATE (source)-[:Depends {
                  dependency_type: 'module_dependency',
                  strength: 1.0,
                  is_direct: true,
                  created_at: $timestamp
                }]->(dep)
              `, {
                sourceId: sourceId,
                depId: depId,
                timestamp: timestamp
              });
              
              relationshipsStored++;
            }
          }
        }
      }

      this.stats.graphNodesStored = nodesStored;
      this.stats.graphRelationshipsStored = relationshipsStored;
      
      console.log(`✅ Stored ${nodesStored} targets and ${relationshipsStored} dependencies in Kuzu`);
      
    } catch (error) {
      console.error('❌ Failed to store graph in Kuzu:', error.message);
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

  // Graph-based Analysis Operations
  async analyzeChangeImpactGraph(changedFiles) {
    if (!this.graphBackend?.storage?.conn) {
      // Fallback to original analysis
      return this.analyzeChangeImpact(changedFiles);
    }

    console.log(`🔍 Analyzing impact of ${changedFiles.length} changed files using graph database`);
    
    try {
      const conn = this.graphBackend.storage.conn;
      const affectedTargets = new Set();
      
      // Find targets that contain or depend on changed files
      for (const file of changedFiles) {
        // Find direct targets affected by file changes
        const directTargets = await conn.query(`
          MATCH (t:BazelTarget)
          WHERE t.source_files CONTAINS $file OR t.package CONTAINS $file
          RETURN t.id
        `, { file: file });
        
        for (const target of directTargets) {
          affectedTargets.add(target['t.id']);
        }
        
        // Find transitive dependencies using graph traversal
        const transitiveTargets = await conn.query(`
          MATCH (changed:BazelTarget)-[:Depends*1..5]-(affected:BazelTarget)
          WHERE changed.source_files CONTAINS $file OR changed.package CONTAINS $file
          RETURN DISTINCT affected.id, length(path) as distance
          ORDER BY distance
        `, { file: file });
        
        for (const target of transitiveTargets) {
          affectedTargets.add(target['affected.id']);
        }
      }

      const result = {
        changedFiles: changedFiles,
        affectedTargets: Array.from(affectedTargets),
        buildRecommendation: this.generateBuildRecommendation(affectedTargets),
        testRecommendation: this.generateTestRecommendation(affectedTargets),
        analysisMethod: 'graph_traversal',
        graphMetrics: {
          directlyAffected: directTargets?.length || 0,
          transitivelyAffected: affectedTargets.size
        }
      };
      
      console.log(`📊 Graph impact analysis: ${result.affectedTargets.length} targets affected`);
      return result;
      
    } catch (error) {
      console.warn('⚠️ Graph impact analysis failed, falling back to basic analysis:', error.message);
      return this.analyzeChangeImpact(changedFiles);
    }
  }

  async findTransitiveDependencies(targetId, maxDepth = 5) {
    if (!this.graphBackend?.storage?.conn) {
      console.warn('Graph backend not available for transitive dependency analysis');
      return [];
    }

    try {
      const conn = this.graphBackend.storage.conn;
      
      const result = await conn.query(`
        MATCH (source:BazelTarget {id: $targetId})-[:Depends*1..${maxDepth}]->(dep:BazelTarget)
        RETURN DISTINCT dep.id, dep.name, dep.package, dep.rule_type, 
               length(path) as distance
        ORDER BY distance, dep.package, dep.name
      `, { targetId: targetId });

      return result.map(row => ({
        id: row['dep.id'],
        name: row['dep.name'],
        package: row['dep.package'],
        ruleType: row['dep.rule_type'],
        distance: row.distance
      }));
      
    } catch (error) {
      console.warn(`Failed to find transitive dependencies: ${error.message}`);
      return [];
    }
  }

  async findDependents(targetId, maxDepth = 3) {
    if (!this.graphBackend?.storage?.conn) {
      console.warn('Graph backend not available for dependent analysis');
      return [];
    }

    try {
      const conn = this.graphBackend.storage.conn;
      
      const result = await conn.query(`
        MATCH (dependent:BazelTarget)-[:Depends*1..${maxDepth}]->(target:BazelTarget {id: $targetId})
        RETURN DISTINCT dependent.id, dependent.name, dependent.package, dependent.rule_type,
               length(path) as distance
        ORDER BY distance, dependent.package, dependent.name
      `, { targetId: targetId });

      return result.map(row => ({
        id: row['dependent.id'],
        name: row['dependent.name'],
        package: row['dependent.package'],
        ruleType: row['dependent.rule_type'],
        distance: row.distance
      }));
      
    } catch (error) {
      console.warn(`Failed to find dependents: ${error.message}`);
      return [];
    }
  }

  async detectCircularDependenciesGraph() {
    if (!this.graphBackend?.storage?.conn) {
      // Fallback to original detection
      return this.detectCircularDependencies();
    }

    try {
      const conn = this.graphBackend.storage.conn;
      
      // Find cycles using graph algorithms
      const cycles = await conn.query(`
        MATCH path = (a:BazelTarget)-[:Depends*2..10]->(a)
        WHERE length(path) >= 2
        RETURN [node in nodes(path) | node.id] as cycle_nodes,
               length(path) as cycle_length
        ORDER BY cycle_length
        LIMIT 50
      `);

      return cycles.map(row => ({
        nodes: row.cycle_nodes,
        length: row.cycle_length,
        severity: row.cycle_length <= 3 ? 'high' : 'medium'
      }));
      
    } catch (error) {
      console.warn('Graph-based cycle detection failed, using fallback:', error.message);
      return this.detectCircularDependencies();
    }
  }

  async analyzeModuleComplexity(packagePath) {
    if (!this.graphBackend?.storage?.conn) {
      console.warn('Graph backend not available for complexity analysis');
      return null;
    }

    try {
      const conn = this.graphBackend.storage.conn;
      
      // Analyze complexity metrics using graph properties
      const complexity = await conn.query(`
        MATCH (pkg:BazelTarget {package: $package})
        OPTIONAL MATCH (pkg)-[:Depends]->(out:BazelTarget)
        OPTIONAL MATCH (in:BazelTarget)-[:Depends]->(pkg)
        RETURN 
          count(DISTINCT pkg) as target_count,
          count(DISTINCT out) as outgoing_deps,
          count(DISTINCT in) as incoming_deps,
          avg(length((pkg)-[:Depends*1..3]->(:BazelTarget))) as avg_dep_depth
      `, { package: packagePath });

      if (complexity.length > 0) {
        const metrics = complexity[0];
        return {
          package: packagePath,
          targetCount: metrics.target_count,
          outgoingDependencies: metrics.outgoing_deps,
          incomingDependencies: metrics.incoming_deps,
          averageDependencyDepth: metrics.avg_dep_depth || 0,
          complexityScore: this.calculateComplexityScore(metrics)
        };
      }
      
      return null;
      
    } catch (error) {
      console.warn(`Failed to analyze module complexity: ${error.message}`);
      return null;
    }
  }

  calculateComplexityScore(metrics) {
    // Simple complexity scoring based on graph metrics
    const targetWeight = metrics.target_count * 2;
    const depWeight = (metrics.outgoing_deps + metrics.incoming_deps) * 1.5;
    const depthWeight = metrics.avg_dep_depth * 3;
    
    return Math.round(targetWeight + depWeight + depthWeight);
  }

  // Time-based tracking methods
  async trackDependencyChanges(changeType = 'build') {
    if (!this.graphBackend?.storage?.conn) {
      console.log('📊 Time-based tracking requires Kuzu integration');
      return;
    }

    try {
      const conn = this.graphBackend.storage.conn;
      const timestamp = Date.now();
      
      // Create snapshot node for this build/analysis
      await conn.query(`
        CREATE (:DependencySnapshot {
          id: $snapshotId,
          workspace: $workspace,
          change_type: $changeType,
          timestamp: $timestamp,
          target_count: $targetCount,
          relationship_count: $relationshipCount
        })
      `, {
        snapshotId: `snapshot_${timestamp}`,
        workspace: this.workspace?.name || 'unknown',
        changeType: changeType,
        timestamp: timestamp,
        targetCount: this.stats.graphNodesStored,
        relationshipCount: this.stats.graphRelationshipsStored
      });
      
      console.log(`📊 Tracked dependency changes at ${new Date(timestamp).toISOString()}`);
      
    } catch (error) {
      console.warn('Failed to track dependency changes:', error.message);
    }
  }

  async getDependencyHistory(targetId, daysBack = 30) {
    if (!this.graphBackend?.storage?.conn) {
      return [];
    }

    try {
      const conn = this.graphBackend.storage.conn;
      const cutoffTime = Date.now() - (daysBack * 24 * 60 * 60 * 1000);
      
      const history = await conn.query(`
        MATCH (snapshot:DependencySnapshot)-[:ANALYZED]->(target:BazelTarget {id: $targetId})
        WHERE snapshot.timestamp >= $cutoffTime
        RETURN snapshot.timestamp, snapshot.change_type, target.name
        ORDER BY snapshot.timestamp DESC
      `, { 
        targetId: targetId,
        cutoffTime: cutoffTime 
      });

      return history.map(row => ({
        timestamp: row['snapshot.timestamp'],
        changeType: row['snapshot.change_type'],
        targetName: row['target.name'],
        date: new Date(row['snapshot.timestamp']).toISOString()
      }));
      
    } catch (error) {
      console.warn(`Failed to get dependency history: ${error.message}`);
      return [];
    }
  }

  // Original analyzeChangeImpact method (fallback)
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

  // Code complexity integration
  async integrateComplexityAnalysis() {
    if (!this.hiveMind) {
      console.log('🔍 Complexity integration requires hive-mind connection');
      return null;
    }

    try {
      // Request complexity analysis from code complexity scanner plugin
      const complexityResults = await this.hiveMind.coordinate({
        type: 'plugin',
        plugin: 'code-complexity-scanner',
        operation: 'scanWorkspace',
        params: {
          workspaceRoot: this.config.workspaceRoot,
          includePatterns: ['**/*.js', '**/*.ts', '**/*.py', '**/*.java'],
          excludePatterns: ['**/node_modules/**', '**/bazel-*/**']
        }
      });

      if (complexityResults?.success && this.graphBackend?.storage?.conn) {
        await this.storeComplexityInGraph(complexityResults.result);
        return complexityResults.result;
      }

      return complexityResults?.result || null;
      
    } catch (error) {
      console.warn('Failed to integrate complexity analysis:', error.message);
      return null;
    }
  }

  async storeComplexityInGraph(complexityData) {
    if (!this.graphBackend?.storage?.conn || !complexityData?.files) {
      return;
    }

    try {
      const conn = this.graphBackend.storage.conn;
      
      // Store complexity metrics for each file and link to Bazel targets
      for (const file of complexityData.files) {
        // Find Bazel targets that include this file
        const targets = await conn.query(`
          MATCH (t:BazelTarget)
          WHERE t.source_files CONTAINS $filePath OR t.package CONTAINS $packagePath
          RETURN t.id
        `, { 
          filePath: file.path,
          packagePath: file.path.split('/').slice(0, -1).join('/')
        });

        // Update targets with complexity metrics
        for (const target of targets) {
          await conn.query(`
            MATCH (t:BazelTarget {id: $targetId})
            SET t.complexity_score = $complexity,
                t.complexity_details = $details,
                t.complexity_updated = $timestamp
          `, {
            targetId: target['t.id'],
            complexity: file.complexity?.score || 0,
            details: JSON.stringify(file.complexity || {}),
            timestamp: Date.now()
          });
        }
      }
      
      console.log(`📊 Stored complexity data for ${complexityData.files.length} files`);
      
    } catch (error) {
      console.warn('Failed to store complexity in graph:', error.message);
    }
  }

  async findComplexityHotspots(complexityThreshold = 50) {
    if (!this.graphBackend?.storage?.conn) {
      console.warn('Graph backend required for hotspot detection');
      return [];
    }

    try {
      const conn = this.graphBackend.storage.conn;
      
      const hotspots = await conn.query(`
        MATCH (t:BazelTarget)
        WHERE t.complexity_score >= $threshold
        OPTIONAL MATCH (t)-[:Depends]->(dep:BazelTarget)
        OPTIONAL MATCH (dependent:BazelTarget)-[:Depends]->(t)
        RETURN t.id, t.name, t.package, t.complexity_score,
               count(DISTINCT dep) as outgoing_deps,
               count(DISTINCT dependent) as incoming_deps
        ORDER BY t.complexity_score DESC, incoming_deps DESC
        LIMIT 20
      `, { threshold: complexityThreshold });

      return hotspots.map(row => ({
        targetId: row['t.id'],
        name: row['t.name'],
        package: row['t.package'],
        complexityScore: row['t.complexity_score'],
        outgoingDeps: row.outgoing_deps,
        incomingDeps: row.incoming_deps,
        riskLevel: this.calculateRiskLevel(row['t.complexity_score'], row.incoming_deps)
      }));
      
    } catch (error) {
      console.warn('Failed to find complexity hotspots:', error.message);
      return [];
    }
  }

  calculateRiskLevel(complexityScore, incomingDeps) {
    const score = complexityScore + (incomingDeps * 5);
    if (score >= 100) return 'critical';
    if (score >= 75) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }

  async generateModuleReport() {
    const report = {
      summary: {
        totalModules: this.modules.size,
        moduleTypes: {},
        totalTargets: this.stats.buildRulesFound,
        totalDependencies: this.stats.dependenciesAnalyzed,
        graphStorage: {
          enabled: this.config.enableKuzuIntegration,
          nodesStored: this.stats.graphNodesStored,
          relationshipsStored: this.stats.graphRelationshipsStored
        }
      },
      modules: [],
      dependencyGraph: {},
      recommendations: [],
      graphAnalysis: {}
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

    // Add graph-based analysis if available
    if (this.config.enableKuzuIntegration && this.graphBackend?.storage?.conn) {
      report.graphAnalysis = await this.generateGraphAnalysis();
    }
    
    // Generate recommendations
    report.recommendations = await this.generateRecommendations();
    
    return report;
  }

  async generateGraphAnalysis() {
    if (!this.graphBackend?.storage?.conn) {
      return {};
    }

    try {
      const conn = this.graphBackend.storage.conn;
      
      // Get graph statistics
      const stats = await conn.query(`
        MATCH (t:BazelTarget)
        OPTIONAL MATCH (t)-[:Depends]->(dep:BazelTarget)
        RETURN 
          count(DISTINCT t) as total_targets,
          count(DISTINCT dep) as total_dependencies,
          avg(count(dep)) as avg_dependencies_per_target
      `);

      // Find most connected targets
      const hubs = await conn.query(`
        MATCH (t:BazelTarget)
        OPTIONAL MATCH (t)-[:Depends]->(out:BazelTarget)
        OPTIONAL MATCH (in:BazelTarget)-[:Depends]->(t)
        RETURN t.id, t.name, t.package,
               count(DISTINCT out) as outgoing,
               count(DISTINCT in) as incoming,
               (count(DISTINCT out) + count(DISTINCT in)) as total_connections
        ORDER BY total_connections DESC
        LIMIT 10
      `);

      // Detect circular dependencies
      const cycles = await this.detectCircularDependenciesGraph();

      return {
        statistics: stats[0] || {},
        topConnectedTargets: hubs.map(row => ({
          id: row['t.id'],
          name: row['t.name'],
          package: row['t.package'],
          outgoing: row.outgoing,
          incoming: row.incoming,
          totalConnections: row.total_connections
        })),
        circularDependencies: cycles,
        analysisTimestamp: Date.now()
      };
      
    } catch (error) {
      console.warn('Failed to generate graph analysis:', error.message);
      return { error: error.message };
    }
  }

  async generateGraphAnalysis() {
    if (!this.graphBackend?.storage?.conn) {
      return {};
    }

    try {
      const conn = this.graphBackend.storage.conn;
      
      // Get graph statistics
      const stats = await conn.query(`
        MATCH (t:BazelTarget)
        OPTIONAL MATCH (t)-[:Depends]->(dep:BazelTarget)
        RETURN 
          count(DISTINCT t) as total_targets,
          count(DISTINCT dep) as total_dependencies,
          avg(count(dep)) as avg_dependencies_per_target
      `);

      // Find most connected targets
      const hubs = await conn.query(`
        MATCH (t:BazelTarget)
        OPTIONAL MATCH (t)-[:Depends]->(out:BazelTarget)
        OPTIONAL MATCH (in:BazelTarget)-[:Depends]->(t)
        RETURN t.id, t.name, t.package,
               count(DISTINCT out) as outgoing,
               count(DISTINCT in) as incoming,
               (count(DISTINCT out) + count(DISTINCT in)) as total_connections
        ORDER BY total_connections DESC
        LIMIT 10
      `);

      // Detect circular dependencies
      const cycles = await this.detectCircularDependenciesGraph();

      return {
        statistics: stats[0] || {},
        topConnectedTargets: hubs.map(row => ({
          id: row['t.id'],
          name: row['t.name'],
          package: row['t.package'],
          outgoing: row.outgoing,
          incoming: row.incoming,
          totalConnections: row.total_connections
        })),
        circularDependencies: cycles,
        analysisTimestamp: Date.now()
      };
      
    } catch (error) {
      console.warn('Failed to generate graph analysis:', error.message);
      return { error: error.message };
    }
  }

  async generateRecommendations() {
    const recommendations = [];
    
    // Use graph-based analysis if available, otherwise fallback to memory-based
    if (this.config.enableKuzuIntegration && this.graphBackend?.storage?.conn) {
      return this.generateGraphRecommendations();
    }
    
    // Fallback to original recommendation logic
    return this.generateBasicRecommendations();
  }

  async generateGraphRecommendations() {
    const recommendations = [];
    
    try {
      // Check for circular dependencies using graph queries
      const cycles = await this.detectCircularDependenciesGraph();
      if (cycles.length > 0) {
        recommendations.push({
          type: 'circular_dependency',
          severity: 'high',
          message: `Found ${cycles.length} circular dependencies using graph analysis`,
          details: cycles,
          analysisMethod: 'graph'
        });
      }

      // Find complexity hotspots
      const hotspots = await this.findComplexityHotspots();
      if (hotspots.length > 0) {
        recommendations.push({
          type: 'complexity_hotspots',
          severity: 'medium',
          message: `Found ${hotspots.length} complexity hotspots`,
          details: hotspots,
          analysisMethod: 'graph'
        });
      }

      // Check for highly connected targets (potential architecture issues)
      const conn = this.graphBackend.storage.conn;
      const hubs = await conn.query(`
        MATCH (t:BazelTarget)
        OPTIONAL MATCH (t)-[:Depends]->(out:BazelTarget)
        OPTIONAL MATCH (in:BazelTarget)-[:Depends]->(t)
        WITH t, count(DISTINCT out) as outgoing, count(DISTINCT in) as incoming
        WHERE outgoing > 15 OR incoming > 20
        RETURN t.id, t.name, t.package, outgoing, incoming
        ORDER BY (outgoing + incoming) DESC
        LIMIT 10
      `);

      if (hubs.length > 0) {
        recommendations.push({
          type: 'architecture_hubs',
          severity: 'medium',
          message: `Found ${hubs.length} highly connected targets that may need refactoring`,
          details: hubs.map(row => ({
            id: row['t.id'],
            name: row['t.name'],
            package: row['t.package'],
            outgoing: row.outgoing,
            incoming: row.incoming
          })),
          analysisMethod: 'graph'
        });
      }

      // Check for isolated components
      const isolated = await conn.query(`
        MATCH (t:BazelTarget)
        WHERE NOT EXISTS((t)-[:Depends]-()) AND NOT EXISTS(()-[:Depends]->(t))
        RETURN t.id, t.name, t.package
        LIMIT 20
      `);

      if (isolated.length > 0) {
        recommendations.push({
          type: 'isolated_targets',
          severity: 'low',
          message: `Found ${isolated.length} isolated targets with no dependencies`,
          details: isolated.map(row => ({
            id: row['t.id'],
            name: row['t.name'],
            package: row['t.package']
          })),
          analysisMethod: 'graph'
        });
      }

    } catch (error) {
      console.warn('Graph recommendations failed, using fallback:', error.message);
      return this.generateBasicRecommendations();
    }
    
    return recommendations;
  }

  generateBasicRecommendations() {
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

  // Visualization capabilities
  async generateDependencyGraphVisualization(format = 'json') {
    if (!this.graphBackend?.storage?.conn) {
      console.warn('Graph visualization requires Kuzu integration');
      return this.generateBasicVisualization(format);
    }

    try {
      const conn = this.graphBackend.storage.conn;
      
      // Get all nodes and relationships for visualization
      const nodes = await conn.query(`
        MATCH (t:BazelTarget)
        RETURN t.id, t.name, t.package, t.rule_type, t.module_type
      `);

      const edges = await conn.query(`
        MATCH (source:BazelTarget)-[r:Depends]->(target:BazelTarget)
        RETURN source.id as source, target.id as target, 
               r.dependency_type as type, r.strength as weight
      `);

      const graphData = {
        nodes: nodes.map(row => ({
          id: row['t.id'],
          name: row['t.name'],
          package: row['t.package'],
          ruleType: row['t.rule_type'],
          moduleType: row['t.module_type']
        })),
        edges: edges.map(row => ({
          source: row.source,
          target: row.target,
          type: row.type,
          weight: row.weight
        })),
        metadata: {
          generated: new Date().toISOString(),
          totalNodes: nodes.length,
          totalEdges: edges.length,
          workspace: this.workspace?.name || 'unknown'
        }
      };

      // Format output based on requested format
      switch (format) {
        case 'graphviz':
          return this.formatGraphviz(graphData);
        case 'cytoscape':
          return this.formatCytoscape(graphData);
        case 'mermaid':
          return this.formatMermaid(graphData);
        default:
          return graphData;
      }
      
    } catch (error) {
      console.warn('Graph visualization failed:', error.message);
      return this.generateBasicVisualization(format);
    }
  }

  formatGraphviz(graphData) {
    let dotContent = 'digraph BazelDependencies {\n';
    dotContent += '  rankdir=TB;\n';
    dotContent += '  node [shape=box];\n\n';
    
    // Add nodes
    for (const node of graphData.nodes) {
      const label = `${node.package}:${node.name}`;
      const color = this.getNodeColor(node.moduleType);
      dotContent += `  "${node.id}" [label="${label}" fillcolor="${color}" style=filled];\n`;
    }
    
    dotContent += '\n';
    
    // Add edges
    for (const edge of graphData.edges) {
      dotContent += `  "${edge.source}" -> "${edge.target}";\n`;
    }
    
    dotContent += '}\n';
    
    return {
      format: 'graphviz',
      content: dotContent,
      metadata: graphData.metadata
    };
  }

  formatMermaid(graphData) {
    let mermaidContent = 'graph TD\n';
    
    // Add nodes and edges
    for (const edge of graphData.edges) {
      const sourceLabel = this.getNodeLabel(edge.source, graphData.nodes);
      const targetLabel = this.getNodeLabel(edge.target, graphData.nodes);
      mermaidContent += `  ${this.sanitizeNodeId(edge.source)}[${sourceLabel}] --> ${this.sanitizeNodeId(edge.target)}[${targetLabel}]\n`;
    }
    
    return {
      format: 'mermaid',
      content: mermaidContent,
      metadata: graphData.metadata
    };
  }

  formatCytoscape(graphData) {
    return {
      format: 'cytoscape',
      elements: [
        ...graphData.nodes.map(node => ({
          data: {
            id: node.id,
            label: `${node.package}:${node.name}`,
            package: node.package,
            ruleType: node.ruleType,
            moduleType: node.moduleType
          }
        })),
        ...graphData.edges.map(edge => ({
          data: {
            source: edge.source,
            target: edge.target,
            type: edge.type,
            weight: edge.weight
          }
        }))
      ],
      metadata: graphData.metadata
    };
  }

  generateBasicVisualization(format) {
    // Fallback visualization using in-memory build graph
    const nodes = [];
    const edges = [];
    
    for (const [modulePath, module] of this.modules) {
      for (const target of module.targets) {
        const targetId = target.target || `//${modulePath}:${target.name}`;
        nodes.push({
          id: targetId,
          name: target.name,
          package: modulePath,
          ruleType: target.type,
          moduleType: module.type
        });
      }
    }
    
    for (const [modulePath, node] of this.buildGraph) {
      for (const dep of node.dependencies) {
        edges.push({
          source: modulePath,
          target: dep,
          type: 'dependency',
          weight: 1.0
        });
      }
    }
    
    const graphData = {
      nodes: nodes,
      edges: edges,
      metadata: {
        generated: new Date().toISOString(),
        totalNodes: nodes.length,
        totalEdges: edges.length,
        workspace: this.workspace?.name || 'unknown',
        method: 'basic'
      }
    };
    
    // Apply same formatting as graph version
    switch (format) {
      case 'graphviz':
        return this.formatGraphviz(graphData);
      case 'mermaid':
        return this.formatMermaid(graphData);
      case 'cytoscape':
        return this.formatCytoscape(graphData);
      default:
        return graphData;
    }
  }

  getNodeColor(moduleType) {
    const colors = {
      'nodejs': '#68CC99',
      'python': '#3776AB',
      'java': '#ED8B00',
      'go': '#00ADD8',
      'docker': '#2496ED',
      'service': '#FF6B6B',
      'library': '#4ECDC4',
      'unknown': '#95A5A6'
    };
    return colors[moduleType] || colors.unknown;
  }

  getNodeLabel(nodeId, nodes) {
    const node = nodes.find(n => n.id === nodeId);
    return node ? `${node.package}:${node.name}` : nodeId;
  }

  sanitizeNodeId(nodeId) {
    return nodeId.replace(/[^a-zA-Z0-9]/g, '_');
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
    const baseStats = {
      ...this.stats,
      workspace: this.workspace?.name || 'unknown',
      modules: this.modules.size,
      buildGraph: this.buildGraph.size,
      bazelVersion: await this.getBazelVersion(),
      graphIntegration: {
        enabled: this.config.enableKuzuIntegration,
        connected: !!this.graphBackend
      }
    };

    // Add graph database statistics if available
    if (this.graphBackend?.storage?.conn) {
      try {
        const conn = this.graphBackend.storage.conn;
        const graphStats = await conn.query(`
          MATCH (t:BazelTarget)
          OPTIONAL MATCH (t)-[:Depends]->(dep:BazelTarget)
          RETURN count(DISTINCT t) as target_count,
                 count(dep) as dependency_count
        `);

        if (graphStats.length > 0) {
          baseStats.graphDatabase = {
            targetsInGraph: graphStats[0].target_count,
            dependenciesInGraph: graphStats[0].dependency_count,
            lastUpdated: new Date().toISOString()
          };
        }
      } catch (error) {
        console.warn('Failed to get graph database stats:', error.message);
      }
    }

    return baseStats;
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
    // Clean up graph backend if it was initialized standalone
    if (this.graphBackend && !this.config.hiveMindIntegration) {
      try {
        await this.graphBackend.cleanup();
      } catch (error) {
        console.warn('Failed to cleanup graph backend:', error.message);
      }
    }

    this.modules.clear();
    this.buildGraph.clear();
    this.graphBackend = null;
    this.hiveMind = null;
    
    console.log('🏗️ Bazel Monorepo Plugin cleaned up');
  }
}

export default BazelMonorepoPlugin;