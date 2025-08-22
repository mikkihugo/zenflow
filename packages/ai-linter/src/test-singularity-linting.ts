/**
 * @fileoverview Test file to demonstrate Singularity-Coder AI linting capabilities
 *
 * This file contains various code patterns that will be analyzed by both Claude
 * and the singularity-coder's WASM engine to showcase enhanced linting.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 */

import * as fs from 'fs/promises';
import * as path from 'path';

import { getLogger } from '@claude-zen/foundation';

import { createSingularityIntegration } from './singularity-integration';

import { createLinterContext } from './index';

/**
 * Sample code with various patterns for testing AI linting
 */
const SAMPLE_CODE = `
// Complex function that should trigger complexity analysis
function processUserData(users: any[], options: any) {
  const results = [];
  
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    
    if (user.status === 'active') {
      if (user.age >= 18) {
        if (user.verified) {
          if (options.includeMetadata) {
            const processedUser = {
              id: user.id,
              name: user.name,
              email: user.email,
              metadata: {
                processedAt: new Date(),
                version: '1.0',
                source: 'batch-processor'
              }
            };
            
            // Potential performance issue - synchronous operation in loop
            const validationResult = validateUserData(processedUser);
            if (validationResult.isValid) {
              results.push(processedUser);
            }
          } else {
            results.push({
              id: user.id,
              name: user.name,
              email: user.email
            });
          }
        }
      }
    }
  }
  
  return results;
}

// Type safety concern - using 'any'types
function calculateMetrics(data: any): any {
  return {
    total: data.length,
    average: data.reduce((a: any, b: any) => a + b, 0) / data.length
  };
}

// Performance issue - inefficient algorithm
function findDuplicates(arr: number[]): number[] {
  const duplicates = [];
  
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j] && !duplicates.includes(arr[i])) {
        duplicates.push(arr[i]);
      }
    }
  }
  
  return duplicates;
}

// Good practice - well-typed and documented function
/**
 * Validates user data with proper error handling
 * @param user - User object to validate
 * @returns Validation result with details
 */
function validateUserData(user: {
  id: string;
  name: string;
  email: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!user.id'' | '''' | ''user.id.trim().length === 0) {
    errors.push('User ID is required');
  }
  
  if (!user.name'' | '''' | ''user.name.trim().length === 0) {
    errors.push('User name is required');
  }
  
  if (!user.email'' | '''' | ''!user.email.includes('@')) {
    errors.push('Valid email is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
`;

/**
 * Test the singularity-coder AI linting capabilities
 */
export async function testSingularityLinting(): Promise<void> {
  const logger = getLogger('singularity-test');

  logger.info('🚀 Starting Singularity-Coder AI linting test...');

  try {
    // Create singularity integration
    const singularity = createSingularityIntegration({
      enableHardwareOptimization: true,
      enableAgentAnalysis: true,
      maxDepth: 3,
      focusAreas: [
        'complexity',
        'performance',
        'maintainability',
        'type-safety',
      ],
      confidenceThreshold: 0.75,
    });

    // Create linter context
    const context = createLinterContext(
      '/tmp/test-sample.ts',
      'typescript',
      process.cwd(),
      'node'
    );

    logger.info('🔍 Analyzing sample code with Singularity-Coder...');

    // Analyze the sample code
    const analysisResult = await singularity.enhanceClaudeAnalysis(
      '/tmp/test-sample.ts',
      SAMPLE_CODE,
      context
    );

    // Display results
    logger.info('📊 Analysis Results:');
    logger.info(
      `   Confidence: ${(analysisResult.confidence * 100).toFixed(1)}%`
    );
    logger.info(
      `   Analysis time: ${analysisResult.performance.totalTimeMs}ms`
    );

    // Display Singularity insights
    const insights = analysisResult.singularityInsights;

    logger.info('🧠 Singularity-Coder Insights:');

    // Agent analysis results
    if (insights.agentAnalysis.length > 0) {
      logger.info(
        `   🤖 Agent Analysis (${insights.agentAnalysis.length} agents):`
      );
      insights.agentAnalysis.forEach((agent, index) => {
        logger.info(`     ${index + 1}. ${agent.agentType}: ${agent.findings}`);
        logger.info(
          `        Confidence: ${(agent.confidence * 100).toFixed(1)}%`
        );
        logger.info(
          `        Execution: ${agent.performanceMetrics.executionTimeMs}ms`
        );
      });
    }

    // Code mesh analysis
    const codeMesh = insights.codeMeshAnalysis;
    logger.info('   🕸️ Code Mesh Analysis:');
    logger.info(
      `     Complexity Score: ${codeMesh.complexityScore.toFixed(1)}`
    );
    logger.info(
      `     Architecture Quality: ${(codeMesh.architectureQuality * 100).toFixed(1)}%`
    );
    logger.info(
      `     Maintainability Index: ${(codeMesh.maintainabilityIndex * 100).toFixed(1)}%`
    );
    logger.info(
      `     Technical Debt Ratio: ${(codeMesh.technicalDebtRatio * 100).toFixed(1)}%`
    );
    logger.info(`     Health Indicators:`);
    logger.info(
      `       Type Safety: ${(codeMesh.healthIndicators.typesSafety * 100).toFixed(1)}%`
    );
    logger.info(
      `       Test Coverage: ${(codeMesh.healthIndicators.testCoverage * 100).toFixed(1)}%`
    );
    logger.info(
      `       Documentation: ${(codeMesh.healthIndicators.documentation * 100).toFixed(1)}%`
    );
    logger.info(
      `       Consistency: ${(codeMesh.healthIndicators.consistency * 100).toFixed(1)}%`
    );

    // Performance predictions
    if (insights.performancePredictions.length > 0) {
      logger.info(
        `   ⚡ Performance Predictions (${insights.performancePredictions.length} metrics):`
      );
      insights.performancePredictions.forEach((prediction, index) => {
        logger.info(
          `     ${index + 1}. ${prediction.metric}: ${prediction.predictedValue.toFixed(2)}`
        );
        logger.info(
          `        Confidence: ${(prediction.confidence * 100).toFixed(1)}%`
        );
        logger.info(
          `        Optimizations: ${prediction.optimizations.join(', ')}`
        );
      });
    }

    // File-aware context
    if (insights.fileAwareContext) {
      const fileContext = insights.fileAwareContext;
      logger.info('   📁 File-Aware Context:');
      logger.info(`     Related Files: ${fileContext.relatedFiles.length}`);
      logger.info(`     Dependencies: ${fileContext.dependencies.length}`);
      logger.info(
        `     Cross-file Patterns: ${fileContext.crossFilePatterns.length}`
      );
      logger.info(
        `     Project Context Insights: ${fileContext.projectContext.length}`
      );
    }

    // System information
    const systemInfo = await singularity.getSystemInfo();
    logger.info('🖥️ System Information:');
    logger.info(`   Initialized: ${systemInfo.isInitialized}`);
    logger.info(`   Active Agents: ${systemInfo.agentCount}`);

    if (systemInfo.hardware) {
      logger.info(
        `   Hardware Optimization: ${systemInfo.hardware.optimizationStrategy}`
      );
      logger.info(`   CPU Cores: ${systemInfo.hardware.cpuCores}`);
      logger.info(`   Memory: ${systemInfo.hardware.memoryGb}GB`);
      logger.info(`   GPU Available: ${systemInfo.hardware.hasGpu}`);
    }

    logger.info('✅ Singularity-Coder linting test completed successfully!');

    // Cleanup
    singularity.cleanup();
  } catch (error) {
    logger.error('❌ Singularity linting test failed:', error);
    throw error;
  }
}

/**
 * Test with a real file from the project
 */
export async function testRealFileLinting(filePath: string): Promise<void> {
  const logger = getLogger('singularity-real-test');

  logger.info(`🔍 Testing Singularity-Coder linting on real file: ${filePath}`);

  try {
    // Check if file exists
    await fs.access(filePath);

    // Read file content
    const content = await fs.readFile(filePath, 'utf-8');
    const fileExtension = path.extname(filePath).toLowerCase();

    // Determine language
    const languageMap: Record<string, string> = {
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.py': 'python',
      '.rs': 'rust',
      '.go': 'go',
    };

    const language = languageMap[fileExtension]'' | '''' | '''typescript';

    // Create singularity integration
    const singularity = createSingularityIntegration({
      enableHardwareOptimization: true,
      enableAgentAnalysis: true,
      maxDepth: 2, // Reduce depth for real files
      focusAreas: ['complexity', 'maintainability', 'type-safety'],
      confidenceThreshold: 0.7,
    });

    // Create linter context
    const context = createLinterContext(
      filePath,
      language,
      path.dirname(filePath)
    );

    logger.info(
      `📊 File info: ${path.basename(filePath)} (${language}, ${content.length} chars)`
    );

    // Analyze the real file
    const analysisResult = await singularity.enhanceClaudeAnalysis(
      filePath,
      content,
      context
    );

    // Display condensed results
    logger.info('📈 Analysis Summary:');
    logger.info(
      `   Overall Confidence: ${(analysisResult.confidence * 100).toFixed(1)}%`
    );
    logger.info(
      `   Analysis Time: ${analysisResult.performance.totalTimeMs}ms`
    );
    logger.info(
      `   Complexity Score: ${analysisResult.singularityInsights.codeMeshAnalysis.complexityScore.toFixed(1)}`
    );
    logger.info(
      `   Maintainability: ${(analysisResult.singularityInsights.codeMeshAnalysis.maintainabilityIndex * 100).toFixed(1)}%`
    );
    logger.info(
      `   Active Agents: ${analysisResult.singularityInsights.agentAnalysis.length}`
    );
    logger.info(
      `   Performance Predictions: ${analysisResult.singularityInsights.performancePredictions.length}`
    );

    logger.info('✅ Real file linting completed!');

    // Cleanup
    singularity.cleanup();
  } catch (error) {
    logger.error(`❌ Real file linting failed for ${filePath}:`, error);
    throw error;
  }
}

/**
 * CLI entry point for testing
 */
export async function runSingularityTest(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length > 0 && args[0] !== '--sample') {
    // Test with provided file path
    const filePath = args[0];
    await testRealFileLinting(filePath);
  } else {
    // Test with sample code
    await testSingularityLinting();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSingularityTest().catch(console.error);
}
