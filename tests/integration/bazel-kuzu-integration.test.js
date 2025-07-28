/**
 * Integration tests for Bazel-Kuzu graph database integration
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { BazelMonorepoPlugin } from '../../src/plugins/bazel-monorepo/index.js';
import { MemoryBackendPlugin } from '../../src/plugins/memory-backend/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Bazel-Kuzu Integration', () => {
  let plugin;
  let graphBackend;
  let testDir;

  beforeEach(async () => {
    // Create temporary test directory
    testDir = path.join(__dirname, '../../tmp/bazel-test');
    await fs.mkdir(testDir, { recursive: true });
    
    // Initialize graph backend
    graphBackend = new MemoryBackendPlugin({
      backend: 'kuzu',
      kuzuConfig: {
        persistDirectory: path.join(testDir, '.kuzu'),
        enableRelationships: true
      }
    });
    
    // Create test plugin with Kuzu integration
    plugin = new BazelMonorepoPlugin({
      workspaceRoot: testDir,
      enableKuzuIntegration: true,
      hybridMemory: graphBackend
    });
  });

  afterEach(async () => {
    if (plugin) {
      await plugin.cleanup();
    }
    if (graphBackend) {
      await graphBackend.cleanup();
    }
    
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  test('should initialize with Kuzu integration', async () => {
    // Create minimal Bazel workspace
    await createTestBazelWorkspace(testDir);
    
    try {
      await graphBackend.initialize();
      await plugin.initialize();
      
      expect(plugin.config.enableKuzuIntegration).toBe(true);
      expect(plugin.graphBackend).toBeDefined();
      expect(plugin.stats.graphNodesStored).toBeGreaterThanOrEqual(0);
    } catch (error) {
      // Skip test if Kuzu is not available
      if (error.message.includes('Kuzu not available')) {
        console.log('Skipping Kuzu integration test - Kuzu not available');
        return;
      }
      throw error;
    }
  });

  test('should store dependency graph in Kuzu', async () => {
    await createTestBazelWorkspace(testDir);
    
    try {
      await graphBackend.initialize();
      await plugin.initialize();
      
      // Check if graph was stored
      expect(plugin.stats.graphNodesStored).toBeGreaterThan(0);
      
      // Verify data in graph database
      if (plugin.graphBackend?.storage?.conn) {
        const conn = plugin.graphBackend.storage.conn;
        const result = await conn.query(`
          MATCH (t:BazelTarget)
          RETURN count(t) as target_count
        `);
        
        expect(result[0]?.target_count).toBeGreaterThan(0);
      }
    } catch (error) {
      if (error.message.includes('Kuzu not available')) {
        console.log('Skipping graph storage test - Kuzu not available');
        return;
      }
      throw error;
    }
  });

  test('should perform graph-based impact analysis', async () => {
    await createTestBazelWorkspace(testDir);
    
    try {
      await graphBackend.initialize();
      await plugin.initialize();
      
      // Test change impact analysis
      const changedFiles = ['src/lib/utils.js'];
      const impact = await plugin.analyzeChangeImpactGraph(changedFiles);
      
      expect(impact).toBeDefined();
      expect(impact.affectedTargets).toBeDefined();
      expect(impact.analysisMethod).toBeDefined();
    } catch (error) {
      if (error.message.includes('Kuzu not available')) {
        console.log('Skipping impact analysis test - Kuzu not available');
        return;
      }
      throw error;
    }
  });

  test('should generate graph visualizations', async () => {
    await createTestBazelWorkspace(testDir);
    
    try {
      await graphBackend.initialize();
      await plugin.initialize();
      
      // Test different visualization formats
      const jsonViz = await plugin.generateDependencyGraphVisualization('json');
      const graphvizViz = await plugin.generateDependencyGraphVisualization('graphviz');
      const mermaidViz = await plugin.generateDependencyGraphVisualization('mermaid');
      
      expect(jsonViz).toBeDefined();
      expect(jsonViz.nodes).toBeDefined();
      expect(jsonViz.edges).toBeDefined();
      
      expect(graphvizViz.format).toBe('graphviz');
      expect(graphvizViz.content).toContain('digraph');
      
      expect(mermaidViz.format).toBe('mermaid');
      expect(mermaidViz.content).toContain('graph TD');
    } catch (error) {
      if (error.message.includes('Kuzu not available')) {
        console.log('Skipping visualization test - Kuzu not available');
        return;
      }
      throw error;
    }
  });

  test('should fallback gracefully when Kuzu is not available', async () => {
    // Test plugin without Kuzu
    const fallbackPlugin = new BazelMonorepoPlugin({
      workspaceRoot: testDir,
      enableKuzuIntegration: false
    });
    
    await createTestBazelWorkspace(testDir);
    
    try {
      await fallbackPlugin.initialize();
      
      expect(fallbackPlugin.config.enableKuzuIntegration).toBe(false);
      expect(fallbackPlugin.graphBackend).toBeNull();
      
      // Should still work with in-memory analysis
      const changedFiles = ['src/lib/utils.js'];
      const impact = await fallbackPlugin.analyzeChangeImpact(changedFiles);
      
      expect(impact).toBeDefined();
      expect(impact.affectedTargets).toBeDefined();
      
      await fallbackPlugin.cleanup();
    } catch (error) {
      console.error('Fallback test failed:', error);
      throw error;
    }
  });
});

// Helper function to create a minimal Bazel workspace for testing
async function createTestBazelWorkspace(testDir) {
  // Create WORKSPACE file
  const workspaceContent = `
workspace(name = "test_workspace")

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
`;
  await fs.writeFile(path.join(testDir, 'WORKSPACE'), workspaceContent);

  // Create .bazelrc
  const bazelrcContent = `
build --strategy=Javac=worker
build --disk_cache=.bazel-cache
test --test_output=errors
`;
  await fs.writeFile(path.join(testDir, '.bazelrc'), bazelrcContent);

  // Create source directories
  await fs.mkdir(path.join(testDir, 'src/lib'), { recursive: true });
  await fs.mkdir(path.join(testDir, 'src/app'), { recursive: true });

  // Create BUILD files
  const libBuildContent = `
load("@rules_nodejs//nodejs:rules.bzl", "nodejs_library")

nodejs_library(
    name = "utils",
    srcs = ["utils.js"],
    visibility = ["//src/app:__pkg__"],
)
`;
  await fs.writeFile(path.join(testDir, 'src/lib/BUILD'), libBuildContent);

  const appBuildContent = `
load("@rules_nodejs//nodejs:rules.bzl", "nodejs_binary")

nodejs_binary(
    name = "app",
    entry_point = "main.js",
    deps = ["//src/lib:utils"],
)
`;
  await fs.writeFile(path.join(testDir, 'src/app/BUILD'), appBuildContent);

  // Create source files
  await fs.writeFile(path.join(testDir, 'src/lib/utils.js'), 'export function util() { return "test"; }');
  await fs.writeFile(path.join(testDir, 'src/app/main.js'), 'import { util } from "../lib/utils.js"; console.log(util());');

  // Create package.json files
  const libPackageJson = {
    name: "test-lib",
    version: "1.0.0",
    files: ["utils.js"]
  };
  await fs.writeFile(path.join(testDir, 'src/lib/package.json'), JSON.stringify(libPackageJson, null, 2));

  const appPackageJson = {
    name: "test-app",
    version: "1.0.0",
    files: ["main.js"]
  };
  await fs.writeFile(path.join(testDir, 'src/app/package.json'), JSON.stringify(appPackageJson, null, 2));
}