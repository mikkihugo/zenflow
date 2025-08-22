/**
 * @fileoverview Test the Claude-ESLint bridge integration
 * 
 * Simple test to verify that the AI linter can connect to Claude SDK
 * and analyze code using ESLint + Claude insights.
 */

import { getLogger } from '@claude-zen/foundation';
import { createClaudeESLintBridge, createLinterContext } from './index.js';

// Simple event bus implementation for testing
class TestEventBus {
  private listeners: Map<string, Function[]> = new Map();

  on(event: string, handler: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(handler);
  }

  emit(event: string, ...args: any[]): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(...args));
    }
  }

  off(event: string, handler: Function): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index >= 0) {
        handlers.splice(index, 1);
      }
    }
  }
}

/**
 * Test the AI linter integration
 */
export async function testAILinterIntegration(): Promise<void> {
  const logger = getLogger('ai-linter-test');
  
  try {
    logger.info('🧪 Testing AI Linter integration...');

    // Create event bus and bridge
    const eventBus = new TestEventBus();
    const bridge = createClaudeESLintBridge(eventBus, {
      enableAIRules: true,
      confidenceThreshold: 0.7,
      focusAreas: ['complexity', 'type-safety'],
    });

    // Test code sample with some issues
    const testCode = `
function complexFunction(a: any, b: any): any {
  if (a && b) {
    if (a.type === 'user' && b.type === 'admin') {
      if (a.permissions && b.permissions) {
        if (a.permissions.read && b.permissions.write) {
          if (a.active && b.active) {
            return { success: true, data: a.data + b.data };
          }
        }
      }
    }
  }
  return null;
}

const unusedVariable = 'this will be flagged';
console.log('debugging statement');
`;

    // Create linter context
    const context = createLinterContext(
      '/test/sample.ts',
      'typescript',
      '/test',
      'Node.js'
    );

    logger.info('📝 Analyzing test code...');

    // Analyze the code
    const result = await bridge.analyzeCodeWithAI('/test/sample.ts', testCode, context);

    logger.info('✅ Analysis completed!');
    logger.info(`📊 Found ${result.patterns.length} patterns`);
    logger.info(`🎯 Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    logger.info(`💡 Suggestions: ${result.suggestions.length}`);

    // Log some details
    result.suggestions.forEach((suggestion, index) => {
      logger.info(`  ${index + 1}. ${suggestion}`);
    });

    if (result.claudeInsights.complexity_issues.length > 0) {
      logger.info(`🔍 Complexity issues found: ${result.claudeInsights.complexity_issues.length}`);
      result.claudeInsights.complexity_issues.forEach(issue => {
        logger.info(`  - ${issue.functionName}: complexity ${issue.complexityScore}`);
      });
    }

    logger.info(`📈 Maintainability score: ${result.claudeInsights.maintainability_score}/100`);

    // Test auto-fix
    logger.info('🔧 Testing auto-fix...');
    const fixedCode = await bridge.autoFixCode('/test/sample.ts', testCode, result);
    
    if (fixedCode !== testCode) {
      logger.info('✅ Auto-fix applied changes');
    } else {
      logger.info('ℹ️  No auto-fixes were applied');
    }

    // Get statistics
    const stats = bridge.getStatistics();
    logger.info('📊 Bridge statistics:', stats);

    logger.info('🎉 AI Linter integration test completed successfully!');

  } catch (error) {
    logger.error('❌ AI Linter integration test failed:', error);
    throw error;
  }
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testAILinterIntegration()
    .then(() => {
      console.log('✅ Test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test failed:', error);
      process.exit(1);
    });
}