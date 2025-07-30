/**
 * @fileoverview Test script for MCP stdio optimizations
 * Validates message batching, retry logic, and performance metrics
 */

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Test suite for stdio optimizations
 */
class StdioOptimizationTests {
  constructor() {
    this.testResults = [];
    this.server = null;
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.warn('Starting MCP stdio optimization tests...\n');

    try {
      await this.testServerInitialization();
      await this.testBatchProcessing();
      await this.testErrorHandling();
      await this.testPerformanceMetrics();
      await this.testRetryLogic();
      await this.testConnectionHandling();

      this.printResults();
    } catch (_error) {
      console.error('Test suitefailed = new ClaudeFlowMCPServer({
        batchSize,batchTimeout = this.server.stdioOptimizer !== undefined;
      const hasErrorHandler = this.server.errorHandler !== undefined;
      const hasPerformanceMetrics = this.server.performanceMetrics !== undefined;

      this.addTestResult(
        'Server Initialization',
        hasStdioOptimizer && hasErrorHandler && hasPerformanceMetrics,
        'All optimization components initialized'
      );

      // Check configuration
      const correctBatchSize = this.server.stdioOptimizer.batchSize === 5;
      const correctTimeout = this.server.stdioOptimizer.batchTimeout === 100;

      this.addTestResult(
        'Configuration',
        correctBatchSize && correctTimeout,
        'Batch size and timeout configured correctly'
      );
    }
    catch(error) 
      this.addTestResult('Server Initialization', false, error.message)
  }

  /**
   * Test batch processing functionality
   */
  async testBatchProcessing() {
    console.warn('Testing batch processing...');

    try {
      const _stdioOptimizer = this.server.stdioOptimizer;

      // Mock messages for batch testing

      this.addTestResult('Message Queueing', 
        queueLength === 3,
        `Messagesqueued = stdioOptimizer.getMetrics();
      const hasMetrics = metrics && typeof metrics.queueLength === 'number';
      
      this.addTestResult('Metrics Collection', 
        hasMetrics,
        'Stdio metrics available'
      );
      
    } catch(error) {
      this.addTestResult('Batch Processing', false, error.message);
    }
  }

  /**
   * Test error handling capabilities
   */
  async testErrorHandling() {
    console.warn('Testing error handling...');
    
    try {
      const errorHandler = this.server.errorHandler;
      
      // Test error statistics
      const initialStats = errorHandler.getErrorStats();
      const hasStats = initialStats && typeof initialStats.totalErrors === 'number';
      
      this.addTestResult('Error Statistics', 
        hasStats,
        'Error statistics tracking available'
      );
      
      // Test circuit breaker state
      const circuitState = errorHandler.circuitState;
      const validState = ['CLOSED', 'OPEN', 'HALF_OPEN'].includes(circuitState);
      
      this.addTestResult('Circuit Breaker', 
        validState,
        `Circuit breakerstate = new Error('Test error');
      const errorResponse = errorHandler.createErrorResponse('test-id', testError);
      const validResponse = errorResponse && errorResponse.jsonrpc === '2.0';

      this.addTestResult('Error Response', validResponse, 'Error responses generated correctly');
    } catch (error) {
      this.addTestResult('Error Handling', false, error.message);
    }
  }

  /**
   * Test performance metrics functionality
   */
  async testPerformanceMetrics() {
    console.warn('Testing performance metrics...');

    try {
      const metrics = this.server.performanceMetrics;

      // Test metrics collection
      const currentMetrics = metrics.getMetrics();
      const hasRequestMetrics = currentMetrics?.requests;

      this.addTestResult(
        'Performance Metrics',
        hasRequestMetrics,
        'Performance metrics collection active'
      );

      // Test request tracking
      metrics.recordRequestStart('test-req', {method = metrics.requestTimings.has('test-req');

      this.addTestResult('Request Tracking', hasTimings, 'Request timing tracking works');

      // Complete the request
      metrics.recordRequestEnd('test-req', true, {success = metrics.getPerformanceSummary();
      const hasSummary = summary?.overview;

      this.addTestResult('Performance Summary', hasSummary, 'Performance summary generation works');
    } catch (error) {
      this.addTestResult('Performance Metrics', false, error.message);
    }
  }

  /**
   * Test retry logic
   */
  async testRetryLogic() {
    console.warn('Testing retry logic...');

    try {
      const errorHandler = this.server.errorHandler;
      
      // Test retry delay calculation
      const delay1 = errorHandler.calculateRetryDelay(1);
      const delay2 = errorHandler.calculateRetryDelay(2);
      const hasExponentialBackoff = delay2 > delay1;
      
      this.addTestResult('Exponential Backoff', 
        hasExponentialBackoff,
        `Delays = new Error('Invalid JSON syntax');
      const isNonRetryable = errorHandler.isNonRetryableError(jsonError);
      
      this.addTestResult('Non-retryable Errors', 
        isNonRetryable,
        'JSON errors correctly identified as non-retryable'
      );
      
    } catch(error) {
      this.addTestResult('Retry Logic', false, error.message);
    }
  }

  /**
   * Test connection handling
   */
  async testConnectionHandling() {
    console.warn('Testing connection handling...');
    
    try {
      const stdioOptimizer = this.server.stdioOptimizer;
      
      // Test connection status
      const metrics = stdioOptimizer.getMetrics();
      const isConnected = metrics.isConnected;
      
      this.addTestResult('Connection Status', 
        typeof isConnected === 'boolean',
        `Connectiontracked = metrics.bufferSize;
      const hasBufferTracking = typeof bufferSize === 'number';
      
      this.addTestResult('Buffer Management', 
        hasBufferTracking,
        `Buffersize = passed ? '✅ PASS' : '❌ FAIL';
    console.warn(`  ${status}: ${testName} - ${details}`);
  }

    /**
     * Print final test results
     */
    printResults();
    {
      const _totalTests = this.testResults.length;
      const _passedTests = this.testResults.filter((r) => r.passed).length;

      console.warn(`\n${'='.repeat(50)}`);
      console.warn('MCP STDIO OPTIMIZATION TEST RESULTS');
      console.warn('='.repeat(50));
      console.warn(`TotalTests = > !r.passed)
        .forEach(r => console.warn(`  - ${r.name}: ${r.details}`)
      )
    }

    console.warn('\nOptimizationsValidated = == `file://${__filename}`) {
    const tests = new StdioOptimizationTests();
    tests.runAllTests().catch(console.error);
  }

  export;
  {
  StdioOptimizationTests;
}
