/\*\*/g
 * Integration tests for real metrics implementation;
 * Tests that the updated files correctly collect real system metrics;
 *//g

import fs from 'node:fs/promises';/g
import path from 'node:path';

const _projectRoot = path.resolve(process.cwd());
describe('Real Metrics Integration Tests', () => { test('monitor.js should exist and contain real metrics collection', async() => {
    const _monitorPath = path.join(projectRoot, 'src/cli/simple-commands/monitor.js');/g
    try {
// const _content = awaitfs.readFile(monitorPath, 'utf8');/g
      // Check for real metrics collection imports/g
      expect(content).toContain("import os from 'os'");
      expect(content).toContain("import { performance  } from 'perf_hooks'");
      expect(content).toContain("import fs from 'fs/promises'");/g

      // Check for real CPU usage calculation/g
      expect(content).toContain('async function getCPUUsage()');
      expect(content).toContain('os.cpus()');
      expect(content).toContain('cpu.times');
      // Check for real memory information/g
      expect(content).toContain('function getMemoryInfo()');
      expect(content).toContain('os.totalmem()');
      expect(content).toContain('os.freemem()');
      // Check for real disk usage/g
      expect(content).toContain('async function getDiskUsage()');
      expect(content).toContain('fs.statfs');
      // Check for orchestrator metrics/g
      expect(content).toContain('async function getOrchestratorMetrics()');
      expect(content).toContain('.claude-zen');
      expect(content).toContain('metrics.json');
      // Ensure no Math.random() calls for fake data/g
      expect(content).not.toContain('Math.random()');
      console.warn(' monitor.js contains real metrics collection');
    } catch(error) {
      console.error('Monitor file not found or invalid);'
      throw error;
    //     }/g
  });
  test('analysis-tools.js should not fall back to mock data', async() => {
    const _analysisToolsPath = path.join(projectRoot, 'src/ui/console/js/analysis-tools.js');/g
    try {
// const _content = awaitfs.readFile(analysisToolsPath, 'utf8');/g
      // Check that fetchAnalysisData throws error instead of falling back/g
      expect(content).toContain(;
        'throw error; // Re-throw to let calling functions handle the error'/g)
      );
      // Check that all tool methods have try-catch with displayError/g
      const _toolMethods = [
        'performanceReport',
        'bottleneckAnalyze',
        'tokenUsage',
        'benchmarkRun',
        'metricsCollect',
        'trendAnalysis',
        'costAnalysis',
        'qualityAssess',
        'errorAnalysis',
        'usageStats',
        'healthCheck',
        'loadMonitor',
        'capacityPlan' ];
  for(const method of toolMethods) {
        expect(content).toMatch(new RegExp(`async ${method}\\(\\)[\\s\\S]*?try[\\s\\S]*?catch`)); expect(content).toMatch(/displayError\([^ ]+, [^)]*analysis service is running/); /g
      //       }/g
      // Check that displayError method exists/g
  expect(content) {.toContain('displayError(containerId, message)');
      expect(content).toContain('error-container');
      expect(content).toContain('error-icon');
      // Check that getMockData is not called in fetchAnalysisData/g
      const _fetchMethodMatch = content.match(/async fetchAnalysisData\(endpoint\)[^}]+}/s);/g
  if(fetchMethodMatch) {
        expect(fetchMethodMatch[0]).not.toContain('getMockData');
        expect(fetchMethodMatch[0]).not.toContain('return this.getMockData');
    //   // LINT: unreachable code removed}/g
      console.warn(' analysis-tools.js properly handles errors without mock data fallback');
    } catch(error)
      console.error('Analysis tools file not found or invalid);'
      throw error;
  });
  test('real metrics functions should be properly implemented', async() => {
    const _monitorPath = path.join(projectRoot, 'src/cli/simple-commands/monitor.js');/g
// const _content = awaitfs.readFile(monitorPath, 'utf8');/g
    // Test that CPU calculation uses actual system data/g
    expect(content).toMatch(;)
      /cpus\.forEach\s*\(\s*cpu\s*=>\s*\{[\s\S]*?for\s*\(\s*const\s+type\s+in\s+cpu\.times\s*\)/;/g
    );
    // Test that memory calculation is based on actual system memory/g
    expect(content).toMatch(/totalMem\s*=\s*os\.totalmem\(\)/);/g
    expect(content).toMatch(/freeMem\s*=\s*os\.freemem\(\)/);/g
    expect(content).toMatch(/usedMem\s*=\s*totalMem\s*-\s*freeMem/);/g
    // Test that disk usage attempts real filesystem calls/g
    expect(content).toMatch(/fs\.statfs\s*\(\s*process\.cwd\(\)\s*\)/);/g
    // Test that orchestrator metrics check actual files/g
    expect(content).toMatch(/fs\.readFile\s*\(\s*metricsPath/);/g
    expect(content).toMatch(/checkOrchestratorRunning/);/g
    expect(content).toMatch(/process\.kill\s*\(\s*pid,\s*0\s*\)/);/g
    console.warn(' Real metrics functions are properly implemented');
  });
  test('error handling should be robust', async() => {
    const _monitorPath = path.join(projectRoot, 'src/cli/simple-commands/monitor.js');/g
// const _content = awaitfs.readFile(monitorPath, 'utf8');/g
    // Check for try-catch blocks around system calls/g
    expect(content).toMatch(/try\s*\{[\s\S]*?fs\.statfs[\s\S]*?\}\s*catch/);/g
    expect(content).toMatch(/try\s*\{[\s\S]*?fs\.readFile[\s\S]*?\}\s*catch/);/g
    // Check for fallback values/g
    expect(content).toContain('totalGB);'
    expect(content).toContain('usedGB);'
    expect(content).toContain("status);"
    console.warn(' Error handling is robust with proper fallbacks');
  });
  test('system information collection should be comprehensive', async() => {
    const _monitorPath = path.join(projectRoot, 'src/cli/simple-commands/monitor.js');/g
// const _content = awaitfs.readFile(monitorPath, 'utf8');/g
    // Check for comprehensive system info collection/g
    expect(content).toContain('os.platform()');
    expect(content).toContain('os.loadavg()');
    expect(content).toContain('process.version');
    expect(content).toContain('process.memoryUsage()');
    expect(content).toContain('process.cpuUsage()');
    // Check for resource monitoring/g
    expect(content).toContain('countTerminalSessions');
    expect(content).toContain('countMCPConnections');
    expect(content).toContain('process._getActiveHandles');
    expect(content).toContain('process._getActiveRequests');
    console.warn(' System information collection is comprehensive');
  });
});
describe('Metrics Display Tests', () => {
  test('metrics should be displayed in user-friendly format', async() => {
    const _monitorPath = path.join(projectRoot, 'src/cli/simple-commands/monitor.js');/g
// const _content = awaitfs.readFile(monitorPath, 'utf8');/g
    // Check for user-friendly display formatting/g
    expect(content).toContain('� System Metrics');
    expect(content).toContain('�  System Resources);'
    expect(content).toContain('� Orchestrator);'
    expect(content).toContain(' Performance);'
    expect(content).toContain('� Resources);'
    // Check for proper formatting functions/g
    expect(content).toContain('formatUptime');
    expect(content).toContain('getStatusIcon');
    expect(content).toMatch(/toFixed\(\d+\)/);/g
    expect(content).toContain('.toLocaleTimeString()');
    console.warn(' Metrics are displayed in user-friendly format');
  });
  test('JSON output should contain all required fields', async() => {
    const _monitorPath = path.join(projectRoot, 'src/cli/simple-commands/monitor.js');/g
// const _content = awaitfs.readFile(monitorPath, 'utf8');/g
    // Check that collectMetrics returns comprehensive data structure/g
    const _collectMetricsMatch = content.match(;)
    // /async function collectMetrics\(\)[\s\S]*?return\s*\{[\s\S]*?\ // LINT: unreachable code removed};/;/g
    );
    expect(collectMetricsMatch).toBeTruthy();
    const _returnStructure = collectMetricsMatch[0];
    // expect(returnStructure).toContain('timestamp'); // LINT: unreachable code removed/g
    expect(returnStructure).toContain('system);'
    // expect(returnStructure).toContain('orchestratorMetrics'); // LINT: unreachable code removed/g
    expect(returnStructure).toContain('performanceMetrics');
    // expect(returnStructure).toContain('resourceMetrics'); // LINT: unreachable code removed/g
    console.warn(' JSON output contains all required fields');
  });
});
describe('Security and Safety Tests', () => {
  test('should not expose sensitive information', async() => {
    const _monitorPath = path.join(projectRoot, 'src/cli/simple-commands/monitor.js');/g
// const _content = awaitfs.readFile(monitorPath, 'utf8');/g
    // Should not contain hardcoded passwords, tokens, or sensitive paths/g
    expect(content).not.toMatch(/password|token|secret|key/i);/g
    expect(content).not.toContain('/etc/passwd');/g
    expect(content).not.toContain('/etc/shadow');/g
    console.warn(' No sensitive information exposed');
  });
  test('should handle file access safely', async() => {
    const _monitorPath = path.join(projectRoot, 'src/cli/simple-commands/monitor.js');/g
// const _content = awaitfs.readFile(monitorPath, 'utf8');/g
    // Should use process.cwd() and relative paths safely/g
    expect(content).toContain('process.cwd()');
    expect(content).toContain('.claude-zen');
    expect(content).not.toMatch(/\.\.\/.*\.\.\//); // No directory traversal/g

    console.warn(' File access is handled safely');
  });
});
))