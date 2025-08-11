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
declare class BazelIntegrationTester {
    private testResults;
    private testWorkspaceRoot;
    constructor();
    /**
     * Run all Bazel integration tests.
     */
    runAllTests(): Promise<void>;
    /**
     * Create a test Bazel workspace with realistic structure.
     */
    private setupTestWorkspace;
    /**
     * Test basic Bazel workspace detection.
     */
    private testBazelDetection;
    /**
     * Test Bazel BUILD file parsing and target discovery.
     */
    private testBazelParsing;
    /**
     * Test Bazel dependency analysis for domain mapping.
     */
    private testDependencyAnalysis;
    /**
     * Test GNN integration with Bazel metadata.
     */
    private testNeuralIntegration;
    /**
     * Print comprehensive test results.
     */
    private printResults;
    /**
     * Clean up test workspace.
     */
    private cleanupTestWorkspace;
}
export { BazelIntegrationTester };
//# sourceMappingURL=test-bazel-integration.d.ts.map