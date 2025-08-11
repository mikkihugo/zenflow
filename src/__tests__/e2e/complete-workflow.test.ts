/**
 * Comprehensive End-to-End Workflow Testing Suite
 * 
 * Tests the complete Vision→Code flow with all orchestration levels,
 * parallel execution, AGUI gates, and SAFe process integration.
 */

import { describe, test, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from 'vitest';
import { createLogger } from '../../core/logger.ts';
import { createAdaptiveOptimizer } from '../../config/memory-optimization.ts';
import { handleWorkflowCommand } from '../../interfaces/cli/commands/workflow.ts';
import { handleKanbanCommand } from '../../interfaces/cli/commands/kanban.ts';
import { handleWorkflowToolCall } from '../../interfaces/mcp/workflow-tools.ts';

const logger = createLogger('e2e-workflow-test');

describe('End-to-End Multi-Level Workflow Integration', () => {
  let testSession: string;
  let memoryOptimizer: any;
  
  beforeAll(async () => {
    testSession = `e2e-test-${Date.now()}`;
    memoryOptimizer = createAdaptiveOptimizer();
    logger.info(`🧪 Starting E2E test session: ${testSession}`);
  });

  afterAll(async () => {
    logger.info(`✅ E2E test session completed: ${testSession}`);
  });

  beforeEach(async () => {
    // Initialize clean test environment
    logger.info('🔄 Initializing test environment...');
  });

  afterEach(async () => {
    // Cleanup test environment
    logger.info('🧹 Cleaning up test environment...');
  });

  describe('Complete Vision→Code Flow', () => {
    test('should execute full workflow with all orchestration levels', async () => {
      logger.info('🎯 Testing complete Vision→Code flow...');
      
      // Test workflow initialization
      const initResult = await handleWorkflowToolCall('workflow_initialize', {
        repoPath: './test-workspace',
        topology: 'hierarchical',
        mlLevel: 'enterprise',
        conservative: false
      });
      
      expect(initResult.isError).toBe(false);
      const initData = JSON.parse(initResult.content[0].text);
      expect(initData.success).toBe(true);
      expect(initData.repository.topology).toBe('hierarchical');
      expect(initData.features.advancedKanbanFlow).toBe(true);
      
      // Test workflow monitoring
      const monitorResult = await handleWorkflowToolCall('workflow_monitor', {
        detailed: true,
        includeRecommendations: true
      });
      
      expect(monitorResult.isError).toBe(false);
      const monitorData = JSON.parse(monitorResult.content[0].text);
      expect(monitorData.success).toBe(true);
      expect(monitorData.allocation).toBeDefined();
      expect(monitorData.components.flowManager).toMatch(/✅ ACTIVE/);
      
      logger.info('✅ Complete Vision→Code flow test passed');
    }, 30000);

    test('should handle parallel execution and coordination', async () => {
      logger.info('🔄 Testing parallel execution coordination...');
      
      // Test system performance under parallel load
      const testResult = await handleWorkflowToolCall('workflow_test', {
        testType: 'load',
        duration: 10
      });
      
      expect(testResult.isError).toBe(false);
      const testData = JSON.parse(testResult.content[0].text);
      expect(testData.success).toBe(true);
      expect(testData.test.status).toBe('PASSED');
      expect(testData.components.flowManager).toBe('✅ PASSED');
      expect(testData.components.bottleneckDetector).toBe('✅ PASSED');
      expect(testData.analysis.overall).toBe('OPTIMAL');
      
      logger.info('✅ Parallel execution coordination test passed');
    });

    test('should validate cross-level dependency resolution', async () => {
      logger.info('🔗 Testing cross-level dependency resolution...');
      
      // Test workflow scaling to validate resource coordination
      const scaleResult = await handleWorkflowToolCall('workflow_scale', {
        direction: 'up',
        amount: 25,
        force: false
      });
      
      expect(scaleResult.isError).toBe(false);
      const scaleData = JSON.parse(scaleResult.content[0].text);
      expect(scaleData.success).toBe(true);
      expect(scaleData.operation.direction).toBe('up');
      expect(scaleData.operation.amount).toBe('25%');
      
      // Verify scaling impact through monitoring
      const postScaleMonitor = await handleWorkflowToolCall('workflow_monitor', {
        detailed: false
      });
      
      expect(postScaleMonitor.isError).toBe(false);
      
      logger.info('✅ Cross-level dependency resolution test passed');
    });
  });

  describe('Advanced Kanban Flow Integration', () => {
    test('should validate all flow components are operational', async () => {
      logger.info('🎯 Testing Advanced Kanban Flow components...');
      
      // Mock CLI arguments for kanban monitor command
      const mockArgv = ['node', 'kanban', 'monitor', '--detailed'];
      process.argv = mockArgv;
      
      // Capture console output
      const consoleLogs: string[] = [];
      const originalLog = console.log;
      console.log = vi.fn((...args) => {
        consoleLogs.push(args.join(' '));
        originalLog(...args);
      });
      
      try {
        await handleKanbanCommand(['monitor', '--detailed']);
        
        // Verify component status messages were logged
        const logOutput = consoleLogs.join('\n');
        expect(logOutput).toContain('Flow Manager');
        expect(logOutput).toContain('✅ ACTIVE');
        expect(logOutput).toContain('Bottleneck Detection Engine');
        expect(logOutput).toContain('Advanced Metrics Tracker');
        expect(logOutput).toContain('Dynamic Resource Manager');
        expect(logOutput).toContain('Flow Integration Manager');
        
      } finally {
        console.log = originalLog;
      }
      
      logger.info('✅ Advanced Kanban Flow integration test passed');
    });

    test('should execute component performance testing', async () => {
      logger.info('🧪 Testing Kanban Flow component performance...');
      
      const mockArgv = ['node', 'kanban', 'test', '--all'];
      process.argv = mockArgv;
      
      const consoleLogs: string[] = [];
      const originalLog = console.log;
      console.log = vi.fn((...args) => {
        consoleLogs.push(args.join(' '));
        originalLog(...args);
      });
      
      try {
        await handleKanbanCommand(['test', '--all']);
        
        const logOutput = consoleLogs.join('\n');
        expect(logOutput).toContain('Advanced Kanban Flow Performance Testing');
        expect(logOutput).toContain('Testing Flow Manager');
        expect(logOutput).toContain('Testing Bottleneck Detection Engine');
        expect(logOutput).toContain('All Advanced Kanban Flow tests passed');
        
      } finally {
        console.log = originalLog;
      }
      
      logger.info('✅ Kanban Flow component performance test passed');
    });
  });

  describe('System Performance and Scalability', () => {
    test('should handle stress testing scenarios', async () => {
      logger.info('🔥 Testing system stress scenarios...');
      
      const stressResult = await handleWorkflowToolCall('workflow_test', {
        testType: 'stress',
        duration: 15
      });
      
      expect(stressResult.isError).toBe(false);
      const stressData = JSON.parse(stressResult.content[0].text);
      expect(stressData.success).toBe(true);
      expect(stressData.test.type).toBe('stress');
      expect(stressData.performance.errorRate).toBe('1.000%'); // Expected stress test error rate
      expect(stressData.analysis.recommendations).toContain('System handled stress test well');
      
      logger.info('✅ Stress testing scenario passed');
    });

    test('should validate memory optimization under load', async () => {
      logger.info('🧠 Testing memory optimization under load...');
      
      // Record performance metrics
      memoryOptimizer.recordPerformance({
        memoryUtilization: 0.75,
        cpuUtilization: 0.68,
        throughput: 45,
        errorRate: 0.002,
        activeStreams: 60,
        avgResponseTime: 180
      });
      
      // Get optimization recommendations
      const optimization = memoryOptimizer.optimizeAllocation();
      expect(optimization).toBeDefined();
      expect(typeof optimization.canOptimize).toBe('boolean');
      expect(typeof optimization.potentialGains).toBe('number');
      
      // Test system info retrieval
      const sysInfoResult = await handleWorkflowToolCall('system_info', {
        includeRecommendations: true,
        validateConfig: true
      });
      
      expect(sysInfoResult.isError).toBe(false);
      const sysData = JSON.parse(sysInfoResult.content[0].text);
      expect(sysData.success).toBe(true);
      expect(sysData.system.memory).toBeDefined();
      expect(sysData.recommendations).toBeDefined();
      
      logger.info('✅ Memory optimization under load test passed');
    });
  });

  describe('CLI Integration and Usability', () => {
    test('should validate CLI workflow commands', async () => {
      logger.info('⌨️ Testing CLI workflow commands...');
      
      const mockArgv = ['node', 'workflow', 'init', './test-project', '--topology=mesh'];
      process.argv = mockArgv;
      
      const consoleLogs: string[] = [];
      const originalLog = console.log;
      console.log = vi.fn((...args) => {
        consoleLogs.push(args.join(' '));
        originalLog(...args);
      });
      
      try {
        await handleWorkflowCommand(['init', './test-project']);
        
        const logOutput = consoleLogs.join('\n');
        expect(logOutput).toContain('Initializing Advanced Multi-Level Workflow Architecture');
        expect(logOutput).toContain('Multi-Level Architecture Initialized');
        expect(logOutput).toContain('Advanced Features Enabled');
        
      } finally {
        console.log = originalLog;
      }
      
      logger.info('✅ CLI workflow commands test passed');
    });

    test('should validate CLI monitoring capabilities', async () => {
      logger.info('📊 Testing CLI monitoring capabilities...');
      
      const mockArgv = ['node', 'workflow', 'monitor'];
      process.argv = mockArgv;
      
      const consoleLogs: string[] = [];
      const originalLog = console.log;
      console.log = vi.fn((...args) => {
        consoleLogs.push(args.join(' '));
        originalLog(...args);
      });
      
      try {
        await handleWorkflowCommand(['monitor']);
        
        const logOutput = consoleLogs.join('\n');
        expect(logOutput).toContain('Advanced Workflow Performance Monitor');
        expect(logOutput).toContain('System Information');
        expect(logOutput).toContain('Current Memory Allocation');
        
      } finally {
        console.log = originalLog;
      }
      
      logger.info('✅ CLI monitoring capabilities test passed');
    });
  });

  describe('MCP Tools Integration', () => {
    test('should validate all MCP tools functionality', async () => {
      logger.info('🔌 Testing MCP tools integration...');
      
      const mcpTools = [
        'workflow_initialize',
        'workflow_monitor', 
        'workflow_scale',
        'workflow_test',
        'system_info'
      ];
      
      for (const tool of mcpTools) {
        let result;
        
        switch (tool) {
          case 'workflow_initialize':
            result = await handleWorkflowToolCall(tool, {
              repoPath: './test-mcp',
              topology: 'star'
            });
            break;
          case 'workflow_monitor':
            result = await handleWorkflowToolCall(tool, { detailed: false });
            break;
          case 'workflow_scale':
            result = await handleWorkflowToolCall(tool, {
              direction: 'down',
              amount: 10
            });
            break;
          case 'workflow_test':
            result = await handleWorkflowToolCall(tool, {
              testType: 'health',
              duration: 5
            });
            break;
          case 'system_info':
            result = await handleWorkflowToolCall(tool, {
              includeRecommendations: false
            });
            break;
          default:
            continue;
        }
        
        expect(result.isError).toBe(false);
        const data = JSON.parse(result.content[0].text);
        expect(data.success).toBe(true);
        
        logger.info(`✅ MCP tool ${tool} validated successfully`);
      }
      
      logger.info('✅ All MCP tools integration test passed');
    });
  });

  describe('Error Handling and Recovery', () => {
    test('should handle invalid configurations gracefully', async () => {
      logger.info('❌ Testing error handling scenarios...');
      
      // Test invalid scaling request
      const invalidScaleResult = await handleWorkflowToolCall('workflow_scale', {
        direction: 'up',
        amount: 150, // Invalid: >100%
        force: false
      });
      
      // This should still succeed but with warnings
      expect(invalidScaleResult.isError).toBe(false);
      
      // Test unknown tool
      const unknownToolResult = await handleWorkflowToolCall('unknown_tool', {});
      expect(unknownToolResult.isError).toBe(true);
      
      const errorData = JSON.parse(unknownToolResult.content[0].text);
      expect(errorData.success).toBe(false);
      expect(errorData.error).toContain('Unknown tool');
      
      logger.info('✅ Error handling and recovery test passed');
    });

    test('should validate system resilience under failure scenarios', async () => {
      logger.info('🛡️ Testing system resilience...');
      
      // Test high utilization scenario
      memoryOptimizer.recordPerformance({
        memoryUtilization: 0.95,
        cpuUtilization: 0.90,
        throughput: 15,
        errorRate: 0.05,
        activeStreams: 100,
        avgResponseTime: 500
      });
      
      // System should still provide recommendations
      const optimization = memoryOptimizer.optimizeAllocation();
      expect(optimization).toBeDefined();
      
      // Monitor should still function
      const monitorResult = await handleWorkflowToolCall('workflow_monitor', {
        detailed: true
      });
      
      expect(monitorResult.isError).toBe(false);
      
      logger.info('✅ System resilience test passed');
    });
  });
});