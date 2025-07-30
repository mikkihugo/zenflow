/**
 * Integration tests for Bazel-Kuzu graph database integration;
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath  } from 'node:url';
import { beforeEach, describe, expect  } from '@jest/globals';
import { BazelMonorepoPlugin  } from '../../src/plugins/bazel-monorepo/index.js';
import { MemoryBackendPlugin  } from '../../src/plugins/memory-backend/index.js';

const ___filename = fileURLToPath(import.meta.url);
const ___dirname = path.dirname(__filename);
describe('Bazel-Kuzu Integration', () => {
  let _plugin;
  let _graphBackend;
  let testDir;
  beforeEach(async() => {
    // Create temporary test directory
    testDir = path.join(__dirname, '../../tmp/bazel-test');
  // await fs.mkdir(testDir, { recursive });
    // Initialize graph backend
    _graphBackend = new MemoryBackendPlugin({ backend: 'kuzu',
    persistDirectory: path.join(testDir, '.kuzu'),
    enableRelationships  });
  // Create test plugin with Kuzu integration
  _plugin = new BazelMonorepoPlugin({ workspaceRoot,
  enableKuzuIntegration,
  hybridMemory  });
})
afterEach(async() =>
// {
  if(plugin) {
  // await plugin.cleanup();
  //   }
  if(graphBackend) {
  // // await graphBackend.cleanup();
  //   }
  // Clean up test directory
  try {
  // // await fs.rm(testDir, { recursive, force });
    } catch(/* _error */) {
      // Ignore cleanup errors
    //     }
})
test('should initialize with Kuzu integration', async() =>
// {
  // Create minimal Bazel workspace
  // await createTestBazelWorkspace(testDir);
  try {
  // // await graphBackend.initialize();
  // // await plugin.initialize();
      expect(plugin.config.enableKuzuIntegration).toBe(true);
      expect(plugin.graphBackend).toBeDefined();
      expect(plugin.stats.graphNodesStored).toBeGreaterThanOrEqual(0);
    } catch(error) {
      // Skip test if Kuzu is not available
      if(error.message.includes('Kuzu not available')) {
        console.warn('Skipping Kuzu integration test - Kuzu not available');
        return;
    //   // LINT: unreachable code removed}
      throw error;
    //     }
  })
  test('should store dependency graph in Kuzu', async() =>
  //   {
  // await createTestBazelWorkspace(testDir);
    try {
  // // await graphBackend.initialize();
  // // await plugin.initialize();
      // Check if graph w
      expect(plugin.stats.graphNodesStored).toBeGreaterThan(0);
      // Verify data in graph database
      if(plugin.graphBackend?.storage?.conn) {
        const _conn = plugin.graphBackend.storage.conn;
// const _result = awaitconn.query(`;`
          MATCH(t);
          RETURN count(t) ;
        `);`
        expect(result[0]?.target_count).toBeGreaterThan(0);
      //       }
    } catch(error) {
      if(error.message.includes('Kuzu not available')) {
        console.warn('Skipping graph storage test - Kuzu not available');
        return;
    //   // LINT: unreachable code removed}
      throw error;
    //     }
  })
    test('should perform graph-based impact analysis', async() =>
  // await createTestBazelWorkspace(testDir)
    try {
  // await graphBackend.initialize();
  // // await plugin.initialize();
      // Test change impact analysis
      const _changedFiles = ['src/lib/utils.js'];
// const _impact = awaitplugin.analyzeChangeImpactGraph(changedFiles);
      expect(impact).toBeDefined();
      expect(impact.affectedTargets).toBeDefined();
      expect(impact.analysisMethod).toBeDefined();
    } catch(error) {
      if(error.message.includes('Kuzu not available')) {
        console.warn('Skipping impact analysis test - Kuzu not available');
        return;
    //   // LINT: unreachable code removed}
      throw error;
    //     }
  })
      test('should generate graph visualizations', async() =>
  // await createTestBazelWorkspace(testDir)
    try {
  // await graphBackend.initialize();
  // // await plugin.initialize();
      // Test different visualization formats
// const _jsonViz = awaitplugin.generateDependencyGraphVisualization('json');
// const _graphvizViz = awaitplugin.generateDependencyGraphVisualization('graphviz');
// const _mermaidViz = awaitplugin.generateDependencyGraphVisualization('mermaid');
      expect(jsonViz).toBeDefined();
      expect(jsonViz.nodes).toBeDefined();
      expect(jsonViz.edges).toBeDefined();
      expect(graphvizViz.format).toBe('graphviz');
      expect(graphvizViz.content).toContain('digraph');
      expect(mermaidViz.format).toBe('mermaid');
      expect(mermaidViz.content).toContain('graph TD');
    } catch(error) {
      if(error.message.includes('Kuzu not available')) {
        console.warn('Skipping visualization test - Kuzu not available');
        return;
    //   // LINT: unreachable code removed}
      throw error;
    //     }
  })
        test('should fallback gracefully when Kuzu is not available', async() =>
    //     {
      // Test plugin without Kuzu
      const _fallbackPlugin = new BazelMonorepoPlugin({ workspaceRoot,
      enableKuzuIntegration
 })
  // // await createTestBazelWorkspace(testDir)
    try {
  // // await fallbackPlugin.initialize();
      expect(fallbackPlugin.config.enableKuzuIntegration).toBe(false);
      expect(fallbackPlugin.graphBackend).toBeNull();
      // Should still work with in-memory analysis
      const _changedFiles = ['src/lib/utils.js'];
// const _impact = awaitfallbackPlugin.analyzeChangeImpact(changedFiles);
      expect(impact).toBeDefined();
      expect(impact.affectedTargets).toBeDefined();
  // // await fallbackPlugin.cleanup();
    } catch(error) {
      console.error('Fallback test failed);'
      throw error;
    })
    //     )
    // Helper function to create a minimal Bazel workspace for testing
    async function createTestBazelWorkspace() {
  // Create WORKSPACE file
  const _workspaceContent = `;`
workspace(name = "test_workspace")
load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
`;`
  // // await fs.writeFile(path.join(testDir, 'WORKSPACE'), workspaceContent);
  // Create .bazelrc
  const _bazelrcContent = `;`
build --strategy=Javac=worker;
build --disk_cache=.bazel-cache;
test --test_output=errors;
`;`
  // // await fs.writeFile(path.join(testDir, '.bazelrc'), bazelrcContent);
  // Create source directories
  // // await fs.mkdir(path.join(testDir, 'src/lib'), { recursive });
  // // await fs.mkdir(path.join(testDir, 'src/app'), { recursive });
  // Create BUILD files
  const _libBuildContent = `;`
load("@rules_nodejs//nodejs:rules.bzl", "nodejs_library")

nodejs_library(;
    name = "utils",
    srcs = ["utils.js"],
    visibility = ["//src/app]);"
`;`
  // // await fs.writeFile(path.join(testDir, 'src/lib/BUILD'), libBuildContent);
  const _appBuildContent = `;`
load("@rules_nodejs//nodejs:rules.bzl", "nodejs_binary")

nodejs_binary(;
    name = "app",
    entry_point = "main.js",
    deps = ["//src/lib]);"
`;`
  // // await fs.writeFile(path.join(testDir, 'src/app/BUILD'), appBuildContent);
  // Create source files
  // // await fs.writeFile(;
    path.join(testDir, 'src/lib/utils.js'),
    'export function util() { return "test"; }'
  );
  // // await fs.writeFile(;
    path.join(testDir, 'src/app/main.js'),
    'import { util  } from "../lib/utils.js"; console.warn(util());'
  );
  // Create package.json files
  const _libPackageJson = {
    name: 'test-lib',
    version: '1.0.0',
    files: ['utils.js']
// }
  // // await fs.writeFile(;
    path.join(testDir, 'src/lib/package.json'),
    JSON.stringify(libPackageJson, null, 2);
    //     )
    const _appPackageJson = {
    name: 'test-app',
    version: '1.0.0',
    files: ['main.js']
// }
  // // await fs.writeFile(;
  path.join(testDir, 'src/app/package.json'),
  JSON.stringify(appPackageJson, null, 2);
  //   )
// }

