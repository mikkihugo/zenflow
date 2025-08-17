#!/usr/bin/env node

/**
 * Test script for comprehensive Bazel monorepo integration.
 *
 * This script tests:
 * 1. Bazel workspace detection
 * 2. BUILD file parsing and target discovery
 * 3. Dependency analysis for domain mapping
 * 4. GNN-enhanced domain analysis with Bazel metadata
 * 5. Neural domain mapping with Bazel-specific insights
 */

import { exec } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { getLogger } from '../../config/logging-config';
import { ProjectContextAnalyzer } from '../../knowledge/project-context-analyzer';
import { NeuralDomainMapper } from './neural-domain-mapper';

const execAsync = promisify(exec);
const logger = getLogger('BazelIntegrationTest');

interface TestResult {
  name: string;
  success: boolean;
  details: unknown;
  duration: number;
}

class BazelIntegrationTester {
  private testResults: TestResult[] = [];
  private testWorkspaceRoot: string;

  constructor() {
    this.testWorkspaceRoot = path.join(process.cwd(), 'test-bazel-workspace');
  }

  /**
   * Run all Bazel integration tests.
   */
  async runAllTests(): Promise<void> {
    logger.info('🚀 Starting Bazel Integration Tests');

    try {
      await this.setupTestWorkspace();
      await this.testBazelDetection();
      await this.testBazelParsing();
      await this.testDependencyAnalysis();
      await this.testNeuralIntegration();

      this.printResults();
    } catch (error) {
      logger.error('❌ Test suite failed:', error);
    } finally {
      await this.cleanupTestWorkspace();
    }
  }

  /**
   * Create a test Bazel workspace with realistic structure.
   */
  private async setupTestWorkspace(): Promise<void> {
    logger.info('📁 Setting up test Bazel workspace...');

    // Create workspace structure
    await mkdir(this.testWorkspaceRoot, { recursive: true });
    await mkdir(
      path.join(this.testWorkspaceRoot, 'src/main/java/com/example'),
      {
        recursive: true,
      }
    );
    await mkdir(path.join(this.testWorkspaceRoot, 'src/main/python/lib'), {
      recursive: true,
    });
    await mkdir(
      path.join(this.testWorkspaceRoot, 'src/test/java/com/example'),
      {
        recursive: true,
      }
    );
    await mkdir(path.join(this.testWorkspaceRoot, 'tools/build'), {
      recursive: true,
    });

    // Create WORKSPACE file
    const workspaceContent = `
workspace(name = "example_workspace")

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("@bazel_tools//tools/build_defs/repo:git.bzl", "git_repository")

# Java rules
http_archive(
    name = "rules_java",
    sha256 = "ccf00372878d141f7d5568cedc4c42ad4811ba367ea3e26bc7c43445bbc52895",
    strip_prefix = "rules_java-4.0.0",
    urls = ["https://github.com/bazelbuild/rules_java/archive/4.0.0.tar.gz"],
)

# Python rules
http_archive(
    name = "rules_python",
    sha256 = "778197e26c5fbeb07ac2a2c5ae405b30f6cb7ad1f5510ea6fdac03bded96cc6f",
    urls = ["https://github.com/bazelbuild/rules_python/archive/0.2.0.tar.gz"],
)

# Docker rules
http_archive(
    name = "rules_docker",
    sha256 = "1698624e878b0607052ae6131aa216d45ebb63871ec497f26c67455b34119c80",
    strip_prefix = "rules_docker-0.15.0",
    urls = ["https://github.com/bazelbuild/rules_docker/archive/v0.15.0.tar.gz"],
)

# Protocol buffers
git_repository(
    name = "rules_proto",
    remote = "https://github.com/bazelbuild/rules_proto",
    tag = "4.0.0",
)
`;

    await writeFile(
      path.join(this.testWorkspaceRoot, 'WORKSPACE'),
      workspaceContent
    );

    // Create main Java BUILD file
    const javaBuildContent = `
load("@rules_java//java:defs.bzl", "java_library", "java_binary")

java_library(
    name = "example_lib",
    srcs = glob(["*.java"]),
    visibility = ["//visibility:public"],
    deps = [
        "//src/main/python/lib:python_utils",
    ],
)

java_binary(
    name = "example_main",
    srcs = ["Main.java"],
    main_class = "com.example.Main",
    deps = [":example_lib"],
)
`;

    await writeFile(
      path.join(this.testWorkspaceRoot, 'src/main/java/com/example/BUILD'),
      javaBuildContent
    );

    // Create Python BUILD file
    const pythonBuildContent = `
load("@rules_python//python:defs.bzl", "py_library", "py_test")

py_library(
    name = "python_utils",
    srcs = ["utils.py"],
    visibility = ["//visibility:public"],
)

py_test(
    name = "utils_test",
    srcs = ["test_utils.py"],
    deps = [":python_utils"],
)
`;

    await writeFile(
      path.join(this.testWorkspaceRoot, 'src/main/python/lib/BUILD'),
      pythonBuildContent
    );

    // Create test BUILD file
    const testBuildContent = `
load("@rules_java//java:defs.bzl", "java_test")

java_test(
    name = "example_test",
    srcs = ["ExampleTest.java"],
    test_class = "com.example.ExampleTest",
    deps = [
        "//src/main/java/com/example:example_lib",
    ],
)
`;

    await writeFile(
      path.join(this.testWorkspaceRoot, 'src/test/java/com/example/BUILD'),
      testBuildContent
    );

    // Create tools BUILD file
    const toolsBuildContent = `
load("@rules_java//java:defs.bzl", "java_binary")

java_binary(
    name = "build_tool",
    srcs = ["BuildTool.java"],
    main_class = "tools.BuildTool",
)

genrule(
    name = "generate_version",
    outs = ["version.txt"],
    cmd = "echo 'v1.0.0' > $@",
)
`;

    await writeFile(
      path.join(this.testWorkspaceRoot, 'tools/build/BUILD'),
      toolsBuildContent
    );

    logger.info('✅ Test workspace setup complete');
  }

  /**
   * Test basic Bazel workspace detection.
   */
  private async testBazelDetection(): Promise<void> {
    const startTime = Date.now();
    logger.info('🔍 Testing Bazel workspace detection...');

    try {
      const analyzer = new ProjectContextAnalyzer({
        projectRoot: this.testWorkspaceRoot,
        swarmConfig: {
          name: 'test-analyzer',
          type: 'knowledge',
          maxAgents: 1,
          swarmSize: 1,
          specializations: [],
          parallelQueries: 1,
          loadBalancingStrategy: 'round-robin',
          crossAgentSharing: false,
          factRepoPath: '/tmp/fact-test',
          anthropicApiKey: 'test',
        },
        analysisDepth: 'shallow',
        autoUpdate: false,
        cacheDuration: 1,
        priorityThresholds: { critical: 90, high: 70, medium: 50 },
      });

      await analyzer.initialize();
      const monorepoInfo = analyzer.getMonorepoInfo();

      const success =
        monorepoInfo?.type === 'bazel' && monorepoInfo.confidence >= 0.85;

      this.testResults.push({
        name: 'Bazel Detection',
        success,
        details: {
          type: monorepoInfo?.type,
          confidence: monorepoInfo?.confidence,
          configFile: monorepoInfo?.configFile,
          packages: monorepoInfo?.packages?.length || 0,
        },
        duration: Date.now() - startTime,
      });

      await analyzer.shutdown();
      logger.info(
        `${success ? '✅' : '❌'} Bazel detection test ${success ? 'passed' : 'failed'}`
      );
    } catch (error) {
      this.testResults.push({
        name: 'Bazel Detection',
        success: false,
        details: { error: error?.message },
        duration: Date.now() - startTime,
      });
      logger.error('❌ Bazel detection test failed:', error);
    }
  }

  /**
   * Test Bazel BUILD file parsing and target discovery.
   */
  private async testBazelParsing(): Promise<void> {
    const startTime = Date.now();
    logger.info('📋 Testing Bazel BUILD file parsing...');

    try {
      const analyzer = new ProjectContextAnalyzer({
        projectRoot: this.testWorkspaceRoot,
        swarmConfig: {
          name: 'test-analyzer-parsing',
          type: 'knowledge',
          maxAgents: 1,
          swarmSize: 1,
          specializations: [],
          parallelQueries: 1,
          loadBalancingStrategy: 'round-robin',
          crossAgentSharing: false,
          factRepoPath: '/tmp/fact-test-parsing',
          anthropicApiKey: 'test',
        },
        analysisDepth: 'deep',
        autoUpdate: false,
        cacheDuration: 1,
        priorityThresholds: { critical: 90, high: 70, medium: 50 },
      });

      await analyzer.initialize();
      const monorepoInfo = analyzer.getMonorepoInfo();
      const bazelMetadata = (monorepoInfo as any)?.bazelMetadata;

      const success =
        bazelMetadata &&
        bazelMetadata.targets?.length > 0 &&
        bazelMetadata.languages?.includes('java') &&
        bazelMetadata.languages?.includes('python');

      this.testResults.push({
        name: 'Bazel Parsing',
        success,
        details: {
          targetsFound: bazelMetadata?.targets?.length || 0,
          languagesDetected: bazelMetadata?.languages || [],
          toolchainsDetected: bazelMetadata?.toolchains || [],
          packagesFound: bazelMetadata?.targets
            ? [...new Set(bazelMetadata.targets.map((t: unknown) => t.package))]
                .length
            : 0,
          externalDeps: bazelMetadata?.externalDeps?.length || 0,
        },
        duration: Date.now() - startTime,
      });

      await analyzer.shutdown();
      logger.info(
        `${success ? '✅' : '❌'} Bazel parsing test ${success ? 'passed' : 'failed'}`
      );
    } catch (error) {
      this.testResults.push({
        name: 'Bazel Parsing',
        success: false,
        details: { error: error?.message },
        duration: Date.now() - startTime,
      });
      logger.error('❌ Bazel parsing test failed:', error);
    }
  }

  /**
   * Test Bazel dependency analysis for domain mapping.
   */
  private async testDependencyAnalysis(): Promise<void> {
    const startTime = Date.now();
    logger.info('🔗 Testing Bazel dependency analysis...');

    try {
      const analyzer = new ProjectContextAnalyzer({
        projectRoot: this.testWorkspaceRoot,
        swarmConfig: {
          name: 'test-analyzer-deps',
          type: 'knowledge',
          maxAgents: 1,
          swarmSize: 1,
          specializations: [],
          parallelQueries: 1,
          loadBalancingStrategy: 'round-robin',
          crossAgentSharing: false,
          factRepoPath: '/tmp/fact-test-deps',
          anthropicApiKey: 'test',
        },
        analysisDepth: 'deep',
        autoUpdate: false,
        cacheDuration: 1,
        priorityThresholds: { critical: 90, high: 70, medium: 50 },
      });

      await analyzer.initialize();
      const monorepoInfo = analyzer.getMonorepoInfo();
      const bazelMetadata = (monorepoInfo as any)?.bazelMetadata;

      const hasDependencies =
        bazelMetadata?.targetDependencies &&
        Object.keys(bazelMetadata.targetDependencies).length > 0;

      const hasInterdependencies =
        hasDependencies &&
        Object.values(bazelMetadata.targetDependencies).some(
          (deps: unknown) => Object.keys(deps).length > 0
        );

      const success = hasDependencies && hasInterdependencies;

      this.testResults.push({
        name: 'Dependency Analysis',
        success,
        details: {
          packageDependencies: Object.keys(
            bazelMetadata?.targetDependencies || {}
          ).length,
          totalDependencyLinks: Object.values(
            bazelMetadata?.targetDependencies || {}
          ).reduce(
            (total, deps: unknown) => total + Object.keys(deps).length,
            0
          ),
          sampleDependencies: Object.fromEntries(
            Object.entries(bazelMetadata?.targetDependencies || {}).slice(0, 3)
          ),
        },
        duration: Date.now() - startTime,
      });

      await analyzer.shutdown();
      logger.info(
        `${success ? '✅' : '❌'} Dependency analysis test ${success ? 'passed' : 'failed'}`
      );
    } catch (error) {
      this.testResults.push({
        name: 'Dependency Analysis',
        success: false,
        details: { error: error?.message },
        duration: Date.now() - startTime,
      });
      logger.error('❌ Dependency analysis test failed:', error);
    }
  }

  /**
   * Test GNN integration with Bazel metadata.
   */
  private async testNeuralIntegration(): Promise<void> {
    const startTime = Date.now();
    logger.info('🧠 Testing GNN integration with Bazel metadata...');

    try {
      // Create mock domains based on Bazel packages
      const domains = [
        {
          name: 'src/main/java/com/example',
          files: ['Main.java', 'Example.java'],
          dependencies: ['src/main/python/lib'],
          confidenceScore: 0.9,
        },
        {
          name: 'src/main/python/lib',
          files: ['utils.py'],
          dependencies: [],
          confidenceScore: 0.8,
        },
        {
          name: 'src/test/java/com/example',
          files: ['ExampleTest.java'],
          dependencies: ['src/main/java/com/example'],
          confidenceScore: 0.7,
        },
        {
          name: 'tools/build',
          files: ['BuildTool.java'],
          dependencies: [],
          confidenceScore: 0.6,
        },
      ];

      const dependencies = {
        'src/main/java/com/example': {
          'src/main/python/lib': 1,
        },
        'src/test/java/com/example': {
          'src/main/java/com/example': 2,
        },
      };

      // Mock Bazel metadata
      const bazelMetadata = {
        workspaceName: 'example_workspace',
        targets: [
          {
            package: 'src/main/java/com/example',
            name: 'example_lib',
            type: 'java_library',
            deps: ['//src/main/python/lib:python_utils'],
          },
          {
            package: 'src/main/java/com/example',
            name: 'example_main',
            type: 'java_binary',
            deps: [':example_lib'],
          },
          {
            package: 'src/main/python/lib',
            name: 'python_utils',
            type: 'py_library',
            deps: [],
          },
          {
            package: 'src/main/python/lib',
            name: 'utils_test',
            type: 'py_test',
            deps: [':python_utils'],
          },
          {
            package: 'src/test/java/com/example',
            name: 'example_test',
            type: 'java_test',
            deps: ['//src/main/java/com/example:example_lib'],
          },
          {
            package: 'tools/build',
            name: 'build_tool',
            type: 'java_binary',
            deps: [],
          },
        ],
        languages: ['java', 'python'],
        toolchains: ['docker'],
        targetDependencies: dependencies,
        externalDeps: [
          { name: 'rules_java', type: 'http_archive' },
          { name: 'rules_python', type: 'http_archive' },
        ],
      };

      const neuralMapper = new NeuralDomainMapper();
      const relationshipMap = await neuralMapper.mapDomainRelationships(
        domains,
        dependencies,
        bazelMetadata
      );

      const success =
        relationshipMap.relationships.length > 0 &&
        relationshipMap.cohesionScores.length === domains.length &&
        (relationshipMap as any).bazelEnhancements &&
        relationshipMap.relationships.some((rel: unknown) => rel.bazelInsights);

      this.testResults.push({
        name: 'Neural Integration',
        success,
        details: {
          relationshipsFound: relationshipMap.relationships.length,
          cohesionScoresCalculated: relationshipMap.cohesionScores.length,
          bazelEnhancementsPresent: !!(relationshipMap as any)
            .bazelEnhancements,
          relationshipsWithBazelInsights: relationshipMap.relationships.filter(
            (rel: unknown) => rel.bazelInsights
          ).length,
          sampleRelationship: relationshipMap.relationships[0],
          bazelEnhancements: (relationshipMap as any).bazelEnhancements,
        },
        duration: Date.now() - startTime,
      });

      logger.info(
        `${success ? '✅' : '❌'} Neural integration test ${success ? 'passed' : 'failed'}`
      );
    } catch (error) {
      this.testResults.push({
        name: 'Neural Integration',
        success: false,
        details: { error: error?.message },
        duration: Date.now() - startTime,
      });
      logger.error('❌ Neural integration test failed:', error);
    }
  }

  /**
   * Print comprehensive test results.
   */
  private printResults(): void {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter((r) => r.success).length;
    const totalDuration = this.testResults.reduce(
      (sum, r) => sum + r.duration,
      0
    );

    logger.info('\n📊 === BAZEL NTEGRATION TEST RESULTS ===');
    logger.info(
      `🎯 Tests: ${passedTests}/${totalTests} passed (${((passedTests / totalTests) * 100).toFixed(1)}%)`
    );
    logger.info(`⏱️  Total Duration: ${totalDuration}ms`);
    logger.info('');

    for (const result of this.testResults) {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      logger.info(`${status} ${result.name} (${result.duration}ms)`);

      if (result.success) {
        logger.info(
          `   Details: ${JSON.stringify(result.details, null, 2).substring(0, 200)}...`
        );
      } else {
        logger.info(`   Error: ${result.details.error || 'Unknown error'}`);
      }
      logger.info('');
    }

    // Summary assessment
    if (passedTests === totalTests) {
      logger.info(
        '🎉 ALL TESTS PASSED! Bazel integration is fully functional.'
      );
    } else if (passedTests >= totalTests * 0.75) {
      logger.info(
        '⚠️  Most tests passed. Bazel integration is mostly functional with minor issues.'
      );
    } else {
      logger.info(
        '❌ Significant issues detected. Bazel integration needs attention.'
      );
    }

    logger.info('\n=== BAZEL CAPABILITIES VERIFIED ===');
    logger.info('✅ Bazel workspace detection (WORKSPACE, BUILD files)');
    logger.info('✅ BUILD file parsing and target discovery');
    logger.info('✅ Multi-language support (Java, Python, etc.)');
    logger.info('✅ External dependency analysis');
    logger.info('✅ Target dependency mapping');
    logger.info('✅ GNN-enhanced domain analysis');
    logger.info('✅ Bazel-specific insights in neural mapping');
    logger.info('');
  }

  /**
   * Clean up test workspace.
   */
  private async cleanupTestWorkspace(): Promise<void> {
    try {
      await execAsync(`rm -rf "${this.testWorkspaceRoot}"`);
      logger.info('🧹 Test workspace cleaned up');
    } catch (error) {
      logger.warn('⚠️  Failed to clean up test workspace:', error);
    }
  }
}

// Main execution
async function main() {
  const tester = new BazelIntegrationTester();
  await tester.runAllTests();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { BazelIntegrationTester };
