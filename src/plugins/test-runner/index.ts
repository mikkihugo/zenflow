/**
 * Test Runner Plugin
 * Runs tests and reports results
 */

import { BasePlugin } from '../base-plugin.js';
import type { PluginManifest, PluginConfig, PluginContext } from '../types.js';

export class TestRunnerPlugin extends BasePlugin {
  private testResults: any[] = [];

  constructor(manifest: PluginManifest, config: PluginConfig, context: PluginContext) {
    super(manifest, config, context);
  }

  async onInitialize(): Promise<void> {
    this.context.logger.info('Test Runner Plugin initialized');
  }

  async onStart(): Promise<void> {
    this.context.logger.info('Test Runner Plugin started');
  }

  async onStop(): Promise<void> {
    this.context.logger.info('Test Runner Plugin stopped');
  }

  async onDestroy(): Promise<void> {
    this.testResults = [];
    this.context.logger.info('Test Runner Plugin cleaned up');
  }

  async runTest(testName: string, testFunction: () => Promise<void>): Promise<any> {
    const startTime = Date.now();
    const result = {
      name: testName,
      status: 'pending' as 'pending' | 'passed' | 'failed',
      duration: 0,
      error: null as Error | null,
      timestamp: new Date()
    };

    try {
      await testFunction();
      result.status = 'passed';
      result.duration = Date.now() - startTime;
      this.context.logger.info(`Test passed: ${testName}`);
    } catch (error) {
      result.status = 'failed';
      result.duration = Date.now() - startTime;
      result.error = error as Error;
      this.context.logger.error(`Test failed: ${testName}`, error);
    }

    this.testResults.push(result);
    this.emit('test-completed', result);
    return result;
  }

  async runTestSuite(tests: Array<{ name: string; fn: () => Promise<void> }>): Promise<any> {
    const suiteResults = {
      total: tests.length,
      passed: 0,
      failed: 0,
      duration: 0,
      results: [] as any[]
    };

    const suiteStartTime = Date.now();

    for (const test of tests) {
      const result = await this.runTest(test.name, test.fn);
      suiteResults.results.push(result);
      
      if (result.status === 'passed') {
        suiteResults.passed++;
      } else {
        suiteResults.failed++;
      }
    }

    suiteResults.duration = Date.now() - suiteStartTime;
    
    this.context.logger.info(`Test suite completed: ${suiteResults.passed}/${suiteResults.total} passed`);
    this.emit('test-suite-completed', suiteResults);
    
    return suiteResults;
  }

  getTestResults(): any[] {
    return [...this.testResults];
  }

  getTestStats(): any {
    const total = this.testResults.length;
    const passed = this.testResults.filter(r => r.status === 'passed').length;
    const failed = this.testResults.filter(r => r.status === 'failed').length;
    const averageDuration = total > 0 ? 
      this.testResults.reduce((sum, r) => sum + r.duration, 0) / total : 0;

    return {
      total,
      passed,
      failed,
      passRate: total > 0 ? (passed / total) * 100 : 0,
      averageDuration
    };
  }

  clearResults(): void {
    this.testResults = [];
  }
}

export default TestRunnerPlugin;