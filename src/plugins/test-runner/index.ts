/**
 * Test Runner Plugin
 * Multi-framework test execution with coverage reporting
 */

import { EventEmitter } from 'node:events';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export class TestRunnerPlugin extends EventEmitter {
  constructor(_config = {}): any {
    super();
    this.config = {frameworks = new Map();
    this.results = new Map();
    this.activeRuns = new Map();
    this.testQueue = [];
    this.stats = {
      totalRuns,
      passedRuns = {}) => {
        const args = [];
        
        if(options.coverage || this.config.coverage.enabled) {
          args.push('--coverage');
          args.push('--coverageDirectory', path.join(this.config.outputDir, 'coverage', 'jest'));
        }
        
        if(options.watch || this.config.watch) {
          args.push('--watch');
        }
        
        if(options.updateSnapshot) {
          args.push('--updateSnapshot');
        }
        
        if(options.pattern) {
          args.push('--testPathPattern', options.pattern);
        }
        
        if(options.testNamePattern) {
          args.push('--testNamePattern', options.testNamePattern);
        }
        
        if(this.config.parallel && !options.runInBand) {
          args.push('--maxWorkers', this.config.maxWorkers);
        } else {
          args.push('--runInBand');
        }
        
        if(this.config.bail) {
          args.push('--bail');
        }
        
        args.push('--json');
        args.push('--outputFile', path.join(this.config.outputDir, 'jest-results.json'));
        
        return args;
      }
  ,
  parseResults;
  => {
        try {
          const
  results = JSON.parse(await readFile(outputFile, 'utf8'));
  return;
  this;
  .
  normalizeJestResults(results);
}
catch(error)
{
  return null;
}
}
    })

// Mocha runner
this.runners.set('mocha',
{
  command = {};
  ) =>
  {
    const args = [];

    if (options.pattern) {
      args.push(options.pattern);
    } else {
      args.push('test/**/*.js');
    }

    args.push('--reporter', 'json');
    args.push(
      '--reporter-options',
      `output=${path.join(this.config.outputDir, 'mocha-results.json')}`
    );

    if (this.config.timeout) {
      args.push('--timeout', this.config.timeout);
    }

    if (options.grep) {
      args.push('--grep', options.grep);
    }

    if (this.config.bail) {
      args.push('--bail');
    }

    if (options.watch || this.config.watch) {
      args.push('--watch');
    }

    return args;
  }
  ,
      parseResults =>
  try {
    const results = JSON.parse(await readFile(outputFile, 'utf8'));
    return this.normalizeMochaResults(results);
  } catch (_error) {
    return null;
  }
}
)

// Vitest runner
this.runners.set('vitest',
{
  command = {};
  ) =>
  {
    const args = ['run'];

    if (options.coverage || this.config.coverage.enabled) {
      args.push('--coverage');
      args.push(
        '--coverage.reportsDirectory',
        path.join(this.config.outputDir, 'coverage', 'vitest')
      );
    }

    if (options.watch || this.config.watch) {
      args.pop(); // Remove 'run'
      args.push('watch');
    }

    if (options.pattern) {
      args.push(options.pattern);
    }

    if (options.testNamePattern) {
      args.push('--testNamePattern', options.testNamePattern);
    }

    if (!this.config.parallel || options.runInBand) {
      args.push('--no-threads');
    }

    if (this.config.bail) {
      args.push('--bail', '1');
    }

    args.push('--reporter=json');
    args.push('--outputFile', path.join(this.config.outputDir, 'vitest-results.json'));

    return args;
  }
  ,
      parseResults =>
  try {
    const results = JSON.parse(await readFile(outputFile, 'utf8'));
    return this.normalizeVitestResults(results);
  } catch (_error) {
    return null;
  }
}
)

// AVA runner
this.runners.set('ava',
{
  command = {};
  ) =>
  {
    const args = [];

    if (options.pattern) {
      args.push(options.pattern);
    }

    if (options.match) {
      args.push('--match', options.match);
    }

    if (options.watch || this.config.watch) {
      args.push('--watch');
    }

    if (this.config.parallel && !options.serial) {
      args.push('--concurrency', this.config.maxWorkers);
    } else {
      args.push('--serial');
    }

    if (this.config.bail) {
      args.push('--fail-fast');
    }

    args.push('--tap');
    args.push('--tap-file', path.join(this.config.outputDir, 'ava-results.tap'));

    return args;
  }
  ,
      parseResults =>
  try {
    const tapContent = await readFile(outputFile, 'utf8');
    return this.parseTAPResults(tapContent, 'ava');
  } catch (_error) {
    return null;
  }
}
)

// TAP runner
this.runners.set('tap',
{
  command = {};
  ) =>
  {
    const args = [];

    if (options.pattern) {
      args.push(options.pattern);
    } else {
      args.push('test/**/*.js');
    }

    if (options.coverage || this.config.coverage.enabled) {
      args.push('--coverage');
      args.push('--coverage-report=lcov');
      args.push('--coverage-report=json');
      args.push(`--coverage-dir=${path.join(this.config.outputDir, 'coverage', 'tap')}`);
    }

    if (options.grep) {
      args.push('--grep', options.grep);
    }

    if (this.config.bail) {
      args.push('--bail');
    }

    if (this.config.parallel && !options.serial) {
      args.push('--jobs', this.config.maxWorkers);
    }

    args.push('--reporter=tap');
    args.push(`--output-file=${path.join(this.config.outputDir, 'tap-results.tap')}`);

    return args;
  }
  ,
      parseResults =>
  try {
    const tapContent = await readFile(outputFile, 'utf8');
    return this.parseTAPResults(tapContent, 'tap');
  } catch (_error) {
    return null;
  }
}
)

// Tape runner
this.runners.set('tape',
{
  command = {};
  ) =>
  {
    const args = [];

    if (options.pattern) {
      args.push(options.pattern);
    } else {
      args.push('test/**/*.js');
    }

    return args;
  }
  ,
      parseResults =>
  // Tape outputs TAP format to stdout
  return this.parseTAPResults(output, 'tape');
}
)

console.warn(`✅ Initialized $
{
  this.runners.size;
}
test;
framework;
runners`);
}

  async detectFrameworks()
{
  const detected = [];

  for (const [framework, runner] of this.runners) {
    try {
      // Check if framework is installed
      const result = await this.executeCommand('which', [runner.command]);
      if (result.code === 0) {
        detected.push(framework);
      }
    } catch (error) {
      // Framework not available
    }
  }

  // Check package.json for test scripts
  try {
    const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
    const testScript = packageJson.scripts?.test || '';

    for (const framework of this.config.frameworks) {
      if (testScript.includes(framework) && !detected.includes(framework)) {
        detected.push(framework);
      }
    }
  } catch (error) {
    // No package.json
  }

  console.warn(`;
🔍 Detected testframeworks = detected

return detected;
}

  async loadTestConfig()
{
  // Load Jest config
  try {
    const jestConfig = await this.loadJestConfig();
    if (jestConfig) {
      this.testConfigs = this.testConfigs || {};
      this.testConfigs.jest = jestConfig;
    }
  } catch (_error) {
    // No Jest config
  }

  // Load Vitest config
  try {
    const vitestConfig = await this.loadVitestConfig();
    if (vitestConfig) {
      this.testConfigs = this.testConfigs || {};
      this.testConfigs.vitest = vitestConfig;
    }
  } catch (_error) {
    // No Vitest config
  }

  // Load Mocha config
  try {
    const mochaConfig = await this.loadMochaConfig();
    if (mochaConfig) {
      this.testConfigs = this.testConfigs || {};
      this.testConfigs.mocha = mochaConfig;
    }
  } catch (_error) {
    // No Mocha config
  }
}

async;
loadJestConfig();
{
    const configPaths = [
      'jest.config.js',
      'jest.config.ts',
      'jest.config.json',
      'package.json'
    ];
    
    for(const configPath of configPaths) {
      try {
        await access(configPath);
        
        if(configPath === 'package.json') {
          const pkg = JSON.parse(await readFile(configPath, 'utf8'));
          return pkg.jest || null;
        } else if (configPath.endsWith('.json')) {
          return JSON.parse(await readFile(configPath, 'utf8'));
        } else {
          // For JS/TS configs, we'd need to dynamically import
          return {configFile = [
      'vitest.config.js',
      'vitest.config.ts',
      'vite.config.js',
      'vite.config.ts'
    ];
    
    for(const configPath of configPaths) {
      try {
        await access(configPath);
        return {configFile = [
      '.mocharc.js',
      '.mocharc.json',
      '.mocharc.yaml',
      '.mocharc.yml',
      'package.json'
    ];
    
    for(const configPath of configPaths) {
      try {
        await access(configPath);
        
        if(configPath === 'package.json') {
          const pkg = JSON.parse(await readFile(configPath, 'utf8'));
          return pkg.mocha || null;
        } else if (configPath.endsWith('.json')) {
          return JSON.parse(await readFile(configPath, 'utf8'));
        } else {
          return { configFile = {}): any {
    const {
      framework = this.detectBestFramework(),
      pattern,
      coverage = this.config.coverage.enabled,
      watch = false,
      updateSnapshot = false,
      testNamePattern,
      grep,
      match,
      bail = this.config.bail,
      parallel = this.config.parallel,
      runInBand = false,
      serial = false
    } = options;
    
    if(!framework) {
      throw new Error('No test framework detected. Please install a supported test framework.');
    }
    
    const runner = this.runners.get(framework);
    if(!runner) {
      throw new Error(`Unsupported testframework = `${framework}-${Date.now()}`;
  const runOptions = {
    pattern,
    coverage,
    watch,
    updateSnapshot,
    testNamePattern,
    grep,
    match,
    bail,
    parallel,
    runInBand,
    serial,
  };

  console.warn(`🧪 Running tests with ${framework}...`);

  try {
    this.emit('run = Date.now();
    const result = await this.executeTestRunner(framework, runner, runOptions);
    const duration = Date.now() - startTime;

    result.duration = duration;
    result.runId = runId;
    result.framework = framework;

    this.results.set(runId, result);
    this.updateStats(result);

    // Generate reports
    await this.generateReports(runId, result);

    this.emit('run = {runId = JSON.parse(require('fs').readFileSync('package.json', 'utf8'));
    const testScript = pkg.scripts?.test || '';

    for (const framework of this.config.frameworks) {
      if (testScript.includes(framework)) {
        return framework;
      }
    }
  } catch (error) {
    // No package.json
  }

  // Use first detected framework
  if (this.detectedFrameworks?.length > 0) {
    return this.detectedFrameworks[0];
  }

  // Use default
  return this.config.defaultFramework;
}

async;
executeTestRunner(framework, runner, options);
: any
{
  const args = runner.args(options);
  const output = '';
  const errorOutput = '';

  return new Promise((resolve, reject) => {
      const child = spawn(runner.command, args, {
        cwd => {
        output += data.toString();
        this.emit('output', { framework, type => {
        errorOutput += data.toString();
        this.emit('output', { framework, type => {
        this.activeRuns.delete(options.runId);
        
        let results;
        
        // Parse results based on framework
        if(framework === 'tape') {
          // Tape outputs to stdout
          results = await runner.parseResults(output);
        } else {
          // Other frameworks write to file
          const outputFile = path.join(this.config.outputDir, `${framework}-results.${framework === 'ava' || framework === 'tap' ? 'tap' : 'json'}`);
          results = await runner.parseResults(outputFile);
        }
        
        if(!results) {
          //Fallback = this.parseOutputFallback(output, errorOutput, framework);
        }
        
        results.exitCode = code;
        results.success = code === 0;
        
        // Add coverage data if available
        if(options.coverage) {
          results.coverage = await this.collectCoverageData(framework);
        }
        
        resolve(results);
      });

  child.on('error', (error) => {
    this.activeRuns.delete(options.runId);
    reject(error);
  });
}
)
}

  executeCommand(command, args): any
{
  return new Promise((resolve, reject) => {
      const child = spawn(command, args, {shell = '';
      
      child.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      child.on('close', (code) => {
        resolve({ code, output });
      });
      
      child.on('error', reject);
    });
}

normalizeJestResults(results);
: any
{
    const normalized = {
      success = {file = {title = == 'failed') {
          normalized.failures.push({
            file = {success = == 0,summary = (tests, file) => {
      const suiteResult = {
        file = {title = test.duration || 0;
        
        if(test.state === 'failed' && test.err) {
          normalized.failures.push({file = (suites) => {
      for(const suite of suites || []) {
        if(suite.tests) {
          processTests(suite.tests, suite.file);
        }
        if(suite.suites) {
          processSuites(suite.suites);
        }
      }
    };
    
    if(results.suites) {
      processSuites(results.suites);
    }
    
    return normalized;
  }

  normalizeVitestResults(results): any {
    const normalized = {
      success = {file = (tests) => {
        for(const test of tests) {
          if(test.type === 'test') {
            const testResult = {title = == 'fail' && test.result?.error) {
              normalized.failures.push({file = == 'suite' && test.tasks) {
            processTests(test.tasks);
          }
        }
      };
      
      if(file.tasks) {
        processTests(file.tasks);
      }
      
      if(suiteResult.tests.length > 0) {
        normalized.testResults.push(suiteResult);
      }
    }
    
    return normalized;
  }

  parseTAPResults(tapContent, framework): any {
    const lines = tapContent.split('\n');
    const normalized = {success = null;
    let currentTest = null;
    let inYAML = false;
    let yamlContent = '';
    
    for(const line of lines) {
      // TAP version
      if (line.startsWith('TAP version')) continue;
      
      // Test plan
      const planMatch = line.match(/^1\.\.(\d+)/);
      if(planMatch) {
        normalized.summary.total = parseInt(planMatch[1]);
        continue;
      }
      
      // Test result
      const testMatch = line.match(/^(ok|not ok)\s+(\d+)\s*(.*?)(?:\s*#\s*(.*))?$/);
      if(testMatch) {
        const [, result, number, description, directive] = testMatch;
        
        if(!currentSuite) {
          currentSuite = {file = {title = == 'ok' ? 'passed' : 'failed',duration = 'skipped';
            normalized.summary.skipped++;
          } else if (directive.toLowerCase().includes('todo')) {
            test.status = 'skipped';
            normalized.summary.skipped++;
          }
        } else if(result === 'ok') {
          normalized.summary.passed++;
        } else {
          normalized.summary.failed++;
          normalized.success = false;
        }
        
        currentTest = test;
        currentSuite.tests.push(test);
      }
      
      // YAML diagnostic block
      if (line.trim() === '---') {
        inYAML = true;
        yamlContent = '';
        continue;
      }
      
      if (line.trim() === '...') {
        inYAML = false;
        if(currentTest && currentTest.status === 'failed') {
          // Parse YAML for error details
          currentTest.error = this.parseYAMLDiagnostic(yamlContent);
          normalized.failures.push({file = line + '\n';
      }
      
      // Bail out
      if (line.startsWith('Bail out!')) {
        normalized.success = false;
        break;
      }
    }
    
    return normalized;
  }

  parseYAMLDiagnostic(yamlContent): any {
    // Simple YAML parsing for diagnostic info
    const lines = yamlContent.split('\n');
    const diagnostic = {};
    
    for(const line of lines) {
      const match = line.match(/^\s*(\w+):\s*(.*)$/);
      if(match) {
        diagnostic[match[1]] = match[2];
      }
    }
    
    return diagnostic.message || diagnostic.error || yamlContent.trim();
  }

  parseOutputFallback(output, errorOutput, framework): any {
    // Fallback parser for when structured output isn't available
    const normalized = {success = output.match(/(\d+)\s*(passing|passed|pass)/i);
    if(passMatch) {
      normalized.summary.passed = parseInt(passMatch[1]);
      normalized.summary.total += normalized.summary.passed;
    }
    
    const failMatch = output.match(/(\d+)\s*(failing|failed|fail)/i);
    if(failMatch) {
      normalized.summary.failed = parseInt(failMatch[1]);
      normalized.summary.total += normalized.summary.failed;
      normalized.success = false;
    }
    
    const skipMatch = output.match(/(\d+)\s*(pending|skipped|skip)/i);
    if(skipMatch) {
      normalized.summary.skipped = parseInt(skipMatch[1]);
      normalized.summary.total += normalized.summary.skipped;
    }
    
    return normalized;
  }

  async collectCoverageData(framework): any {
    const coverageDir = path.join(this.config.outputDir, 'coverage', framework);
    
    try {
      // Look for coverage summary
      const summaryPath = path.join(coverageDir, 'coverage-summary.json');
      const summary = JSON.parse(await readFile(summaryPath, 'utf8'));
      
      const coverage = {summary = = 'total') {
          coverage.files[file] = {lines = this.checkCoverageThreshold(coverage.summary);
      
      return coverage;
      
    } catch(error) {
      console.warn(`⚠️ Could not collect coveragedata = this.config.coverage.threshold.global;
    
    return (
      summary.lines >= threshold.lines &&
      summary.statements >= threshold.statements &&
      summary.functions >= threshold.functions &&
      summary.branches >= threshold.branches
    );
  }

  updateStats(result): any 
    this.stats.totalRuns++;
    
    if(result.success) {
      this.stats.passedRuns++;
    } else {
      this.stats.failedRuns++;
    }
    
    this.stats.totalTests += result.summary.total;
    this.stats.passedTests += result.summary.passed;
    this.stats.failedTests += result.summary.failed;
    this.stats.skippedTests += result.summary.skipped;
    
    // Update average duration
    if(result.duration) {
      const totalDuration = this.stats.averageDuration * (this.stats.totalRuns - 1) + result.duration;
      this.stats.averageDuration = totalDuration / this.stats.totalRuns;
    }
    
    // Track coverage history
    if(result.coverage) {
      this.stats.coverageHistory.push({timestamp = this.stats.coverageHistory.slice(-100);
      }
  }

  async generateReports(runId, result): any {
    const reportDir = path.join(this.config.outputDir, 'reports', runId);
    await mkdir(reportDir, { recursive = {runId = '# Test Failures Report\n\n';
    content += `Generated = `Total Failures: $failures.length\n\n`;
    
    for(const failure of failures) {
      content += `## ${failure.test}\n`;
      content += `**File = '```\n';
      content += failure.error || 'No error message';
      content += '\n```\n\n';
    }
    
    await writeFile(path.join(reportDir, 'failures.md'), content);
  }

  async generateHTMLReport(reportDir, result): any {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Test Report - ${result.framework}</title>
    <style>
        body { font-family, sans-serif;margin = "header">
        <h1>🧪 Test Report - ${result.framework}</h1>
        <p><strong>RunID = "${result.success ? 'passed' : 'failed'}">${result.success ? 'PASSED' : 'FAILED'}</span></p>
    </div>
    
    <div class="summary">
        <div class="metric">
            <div class="value">${result.summary.total}</div>
            <div>Total Tests</div>
        </div>
        <div class="metric">
            <div class="value passed">${result.summary.passed}</div>
            <div>Passed</div>
        </div>
        <div class="metric">
            <div class="value failed">${result.summary.failed}</div>
            <div>Failed</div>
        </div>
        <div class="metric">
            <div class="value skipped">${result.summary.skipped}</div>
            <div>Skipped</div>
        </div>
    </div>
    
    ${result.coverage ? this.generateCoverageHTML(result.coverage) : ''}
    
    <h2>Test Results</h2>
    ${result.testResults.map(suite => `
        <div class="test-suite">
            <h3>${suite.file}</h3>
            <p><strong>Duration = > `
                <div class="test ${test.status}">
                    <strong>${test.title}</strong>
                    ${test.error ? `<div class="error">${this.escapeHtml(test.error)}</div>` : ''}
                </div>
            `).join('')}
        </div>
    `).join('')}
</body>
</html>`;
    
    await writeFile(path.join(reportDir, 'report.html'), html);
  }

  generateCoverageHTML(coverage): any {
    const getCoverageClass = (pct) => {
      if (pct < 50) return 'coverage-low';
      if (pct < 80) return 'coverage-medium';
      return '';
    };
    
    return `
    <div class="coverage">
        <h2>📊 Coverage Report</h2>
        <div>
            <p><strong>Lines = "coverage-bar">
                <div class="coverage-fill ${getCoverageClass(coverage.summary.lines)}" style="width = "coverage-bar">
                <div class="coverage-fill ${getCoverageClass(coverage.summary.statements)}" style="width = "coverage-bar">
                <div class="coverage-fill ${getCoverageClass(coverage.summary.functions)}" style="width = "coverage-bar">
                <div class="coverage-fill ${getCoverageClass(coverage.summary.branches)}" style="width = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  async watchTests(options = {}): any {
    const framework = options.framework || this.detectBestFramework();
    
    console.warn(`👁️ Starting test watcher with ${framework}...`);
    
    return this.runTests({
      ...options,
      framework,watch = this.activeRuns.get(runId);
    if(child) {
      child.kill('SIGTERM');
      this.activeRuns.delete(runId);
      console.warn('👁️ Test watcher stopped');
    }
  }

  async getTestFiles(pattern): any {
    const { glob } = await import('glob');
    const patterns = pattern ? [pattern] : this.config.testPatterns;
    const _files = [];
    
    for(const _p of patterns) {

    const analysis = {totalFiles = await readFile(file, 'utf8');
      const dir = path.dirname(file);
      
      // Count by directory
      analysis.byDirectory[dir] = (analysis.byDirectory[dir] || 0) + 1;
      
      // Detect framework
      let framework = 'unknown';
      if (content.includes('describe(') && content.includes('it(')) {
        framework = content.includes('jest') ? 'jest' : 'mocha';
      } else if (content.includes('test(') && content.includes('import { test }')) {
        framework = 'vitest';
      } else if (content.includes('test(') && content.includes('require(\'ava\')')) {
        framework = 'ava';
      } else if (content.includes('test(') && content.includes('require(\'tap\')')) {
        framework = 'tap';
      } else if (content.includes('test(') && content.includes('require(\'tape\')')) {
        framework = 'tape';
      }
      
      analysis.byFramework[framework] = (analysis.byFramework[framework] || 0) + 1;
      
      // Count tests (approximate)
      const testMatches = content.match(/\b(it|test|describe)\s*\(/g);
      if(testMatches) {
        analysis.testCount += testMatches.length;
      }
    }
    
    // Check for coverage configuration
    for(const framework of this.config.frameworks) {
      const config = this.testConfigs?.[framework];
      if(config) {
        analysis.coverage.configured.push(framework);
        if(config.coverage || config.collectCoverage) {
          analysis.coverage.hasConfig = true;
        }
      }
    }
    
    return analysis;
  }

  getStats() 
    return {
      ...this.stats,activeRuns = 10): any {
    const results = Array.from(this.results.values())
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, limit);
    
    return results;

  getResult(runId): any 
    return this.results.get(runId);

  async cleanup() 
    // Stop all active test runs
    for(const [_runId, child] of this.activeRuns) {
      child.kill('SIGTERM');
    }
    
    this.activeRuns.clear();
    this.results.clear();
    this.removeAllListeners();
    
    console.warn('🧪 Test Runner Plugin cleaned up');
}

export default TestRunnerPlugin;
