/**
 * Test Runner Plugin;
 * Multi-framework test execution with coverage reporting;
 */

import { EventEmitter } from 'node:events';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export class TestRunnerPlugin extends EventEmitter {
  constructor(_config = {}) {
    super();
    this.config = {frameworks = new Map();
    this.results = new Map();
    this.activeRuns = new Map();
    this.testQueue = [];
    this.stats = {
      totalRuns,
      passedRuns = {}) => {
        const _args = [];

        if(options.coverage  ?? this.config.coverage.enabled) {
          args.push('--coverage');
          args.push('--coverageDirectory', path.join(this.config.outputDir, 'coverage', 'jest'));
        //         }


        if(options.watch  ?? this.config.watch) {
          args.push('--watch');
        //         }


        if(options.updateSnapshot) {
          args.push('--updateSnapshot');
        //         }


        if(options.pattern) {
          args.push('--testPathPattern', options.pattern);
        //         }


        if(options.testNamePattern) {
          args.push('--testNamePattern', options.testNamePattern);
        //         }


        if(this.config.parallel && !options.runInBand) {
          args.push('--maxWorkers', this.config.maxWorkers);
        } else {
          args.push('--runInBand');
        //         }


        if(this.config.bail) {
          args.push('--bail');
        //         }


        args.push('--json');
        args.push('--outputFile', path.join(this.config.outputDir, 'jest-results.json'));

        // return args;
    //   // LINT: unreachable code removed}

  parseResults;
  =>
        try {
          const _results = JSON.parse(// await readFile(outputFile, 'utf8'));
  return;
    // this; // LINT: unreachable code removed

  normalizeJestResults(results);
// }
catch (error) {
  // return null;
// }
    })

// Mocha runner
this.runners.set('mocha',
  command = {};
  ) =>;
  //   {
    const _args = [];

    if (options.pattern) {
      args.push(options.pattern);
    } else {
      args.push('test/**/*.js');
    //     }


    args.push('--reporter', 'json');
    args.push(;
      '--reporter-options',
      `output=${path.join(this.config.outputDir, 'mocha-results.json')}`;
    );

    if (this.config.timeout) {
      args.push('--timeout', this.config.timeout);
    //     }


    if (options.grep) {
      args.push('--grep', options.grep);
    //     }


    if (this.config.bail) {
      args.push('--bail');
    //     }


    if (options.watch  ?? this.config.watch) {
      args.push('--watch');
    //     }


    // return args;
    //   // LINT: unreachable code removed}

      _parseResults =>;
  try {
    const _results = JSON.parse(// await readFile(outputFile, 'utf8'));
    return this.normalizeMochaResults(results);
    //   // LINT: unreachable code removed} catch (/* _error */) {
    return null;
    //   // LINT: unreachable code removed}
// }
// )


// Vitest runner
this.runners.set('vitest',
  command = {};
  ) =>;
  //   {
    const _args = ['run'];

    if (options.coverage  ?? this.config.coverage.enabled) {
      args.push('--coverage');
      args.push(;
        '--coverage.reportsDirectory',
        path.join(this.config.outputDir, 'coverage', 'vitest');
      );
    //     }


    if (options.watch  ?? this.config.watch) {
      args.pop(); // Remove 'run'
      args.push('watch');
    //     }


    if (options.pattern) {
      args.push(options.pattern);
    //     }


    if (options.testNamePattern) {
      args.push('--testNamePattern', options.testNamePattern);
    //     }


    if (!this.config.parallel  ?? options.runInBand) {
      args.push('--no-threads');
    //     }


    if (this.config.bail) {
      args.push('--bail', '1');
    //     }


    args.push('--reporter=json');
    args.push('--outputFile', path.join(this.config.outputDir, 'vitest-results.json'));

    // return args;
    //   // LINT: unreachable code removed}

      _parseResults =>;
  try {
    const _results = JSON.parse(// await readFile(outputFile, 'utf8'));
    return this.normalizeVitestResults(results);
    //   // LINT: unreachable code removed} catch (/* _error */) {
    return null;
    //   // LINT: unreachable code removed}
// }
// )


// AVA runner
this.runners.set('ava',
  command = {};
  ) =>;
  //   {
    const _args = [];

    if (options.pattern) {
      args.push(options.pattern);
    //     }


    if (options.match) {
      args.push('--match', options.match);
    //     }


    if (options.watch  ?? this.config.watch) {
      args.push('--watch');
    //     }


    if (this.config.parallel && !options.serial) {
      args.push('--concurrency', this.config.maxWorkers);
    } else {
      args.push('--serial');
    //     }


    if (this.config.bail) {
      args.push('--fail-fast');
    //     }


    args.push('--tap');
    args.push('--tap-file', path.join(this.config.outputDir, 'ava-results.tap'));

    // return args;
    //   // LINT: unreachable code removed}

      _parseResults =>;
  try {
// const _tapContent = awaitreadFile(outputFile, 'utf8');
    return this.parseTAPResults(tapContent, 'ava');
    //   // LINT: unreachable code removed} catch (/* _error */) {
    return null;
    //   // LINT: unreachable code removed}
// }
// )


// TAP runner
this.runners.set('tap',
  command = {};
  ) =>;
  //   {
    const _args = [];

    if (options.pattern) {
      args.push(options.pattern);
    } else {
      args.push('test/**/*.js');
    //     }


    if (options.coverage  ?? this.config.coverage.enabled) {
      args.push('--coverage');
      args.push('--coverage-report=lcov');
      args.push('--coverage-report=json');
      args.push(`--coverage-dir=${path.join(this.config.outputDir, 'coverage', 'tap')}`);
    //     }


    if (options.grep) {
      args.push('--grep', options.grep);
    //     }


    if (this.config.bail) {
      args.push('--bail');
    //     }


    if (this.config.parallel && !options.serial) {
      args.push('--jobs', this.config.maxWorkers);
    //     }


    args.push('--reporter=tap');
    args.push(`--output-file=${path.join(this.config.outputDir, 'tap-results.tap')}`);

    // return args;
    //   // LINT: unreachable code removed}

      _parseResults =>;
  try {
// const _tapContent = awaitreadFile(outputFile, 'utf8');
    return this.parseTAPResults(tapContent, 'tap');
    //   // LINT: unreachable code removed} catch (/* _error */) {
    return null;
    //   // LINT: unreachable code removed}
// }
// )


// Tape runner
this.runners.set('tape',
  command = {};
  ) =>;
  //   {
    const _args = [];

    if (options.pattern) {
      args.push(options.pattern);
    } else {
      args.push('test/**/*.js');
    //     }


    // return args;
    //   // LINT: unreachable code removed}

      _parseResults =>;
  // Tape outputs TAP format to stdout
  return this.parseTAPResults(output, 'tape');
// }
// )


console.warn(`✅ Initialized $;`
// {
  this.runners.size;
// }
test;
framework;
runners`);`

  async detectFrameworks();
// {
  const _detected = [];

  for (const [framework, runner] of this.runners) {
    try {
      // Check if framework is installed
// const _result = awaitthis.executeCommand('which', [runner.command]);
      if (result.code === 0) {
        detected.push(framework);
      //       }
    } catch (error) {
      // Framework not available
    //     }
  //   }


  // Check package.json for test scripts
  try {
    const _packageJson = JSON.parse(// await readFile('package.json', 'utf8'));
    const _testScript = packageJson.scripts?.test  ?? '';

    for (const framework of this.config.frameworks) {
      if (testScript.includes(framework) && !detected.includes(framework)) {
        detected.push(framework);
      //       }
    //     }
  } catch (error) {
    // No package.json
  //   }


  console.warn(`;`
� Detected testframeworks = detected

// return detected;
// }


  async loadTestConfig();
// {
  // Load Jest config
  try {
// const _jestConfig = awaitthis.loadJestConfig();
    if (jestConfig) {
      this.testConfigs = this.testConfigs  ?? {};
      this.testConfigs.jest = jestConfig;
    //     }
  } catch (/* _error */) {
    // No Jest config
  //   }


  // Load Vitest config
  try {
// const _vitestConfig = awaitthis.loadVitestConfig();
    if (vitestConfig) {
      this.testConfigs = this.testConfigs  ?? {};
      this.testConfigs.vitest = vitestConfig;
    //     }
  } catch (/* _error */) {
    // No Vitest config
  //   }


  // Load Mocha config
  try {
// const _mochaConfig = awaitthis.loadMochaConfig();
    if (mochaConfig) {
      this.testConfigs = this.testConfigs  ?? {};
      this.testConfigs.mocha = mochaConfig;
    //     }
  } catch (/* _error */) {
    // No Mocha config
  //   }
// }


async;
loadJestConfig();
// {
    const _configPaths = [
      'jest.config.js',
      'jest.config.ts',
      'jest.config.json',
      'package.json';
    ];

    for(const configPath of configPaths) {
      try {
// // await access(configPath);
        if(configPath === 'package.json') {
          const _pkg = JSON.parse(// await readFile(configPath, 'utf8'));
          // return pkg.jest  ?? null;
    //   // LINT: unreachable code removed} else if (configPath.endsWith('.json')) {
          // return JSON.parse(// await readFile(configPath, 'utf8'));
    //   // LINT: unreachable code removed} else {
          // For JS/TS configs, we'd need to dynamically import'
          // return {configFile = [
    // 'vitest.config.js', // LINT: unreachable code removed
      'vitest.config.ts',
      'vite.config.js',
      'vite.config.ts';
    ];

    for(const configPath of configPaths) {
      try {
// // await access(configPath);
        // return {configFile = [
    // '.mocharc.js', // LINT: unreachable code removed
      '.mocharc.json',
      '.mocharc.yaml',
      '.mocharc.yml',
      'package.json';
    ];

    for(const configPath of configPaths) {
      try {
// // await access(configPath);
        if(configPath === 'package.json') {
          const _pkg = JSON.parse(// await readFile(configPath, 'utf8'));
          // return pkg.mocha  ?? null;
    //   // LINT: unreachable code removed} else if (configPath.endsWith('.json')) {
          // return JSON.parse(// await readFile(configPath, 'utf8'));
    //   // LINT: unreachable code removed} else {
          // return { configFile = {}) {
    const {
      framework = this.detectBestFramework(),
    // pattern, // LINT: unreachable code removed
      coverage = this.config.coverage.enabled,
      watch = false,
      updateSnapshot = false,
      testNamePattern,
      grep,
      match,
      bail = this.config.bail,
      parallel = this.config.parallel,
      runInBand = false,
      serial = false;
    } = options;

    if(!framework) {
      throw new Error('No test framework detected. Please install a supported test framework.');
    //     }


    const _runner = this.runners.get(framework);
    if(!runner) {
      throw new Error(`Unsupported testframework = `${framework}-${Date.now()}`;`
  const _runOptions = {
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
    serial };

  console.warn(`🧪 Running tests with ${framework}...`);

  try {
    this.emit('run = Date.now();'
// const _result = awaitthis.executeTestRunner(framework, runner, runOptions);
    const _duration = Date.now() - startTime;

    result.duration = duration;
    result.runId = runId;
    result.framework = framework;

    this.results.set(runId, result);
    this.updateStats(result);

    // Generate reports
// // await this.generateReports(runId, result);
    this.emit('run = {runId = JSON.parse(require('fs').readFileSync('package.json', 'utf8'));'
    const _testScript = pkg.scripts?.test  ?? '';

    for (const framework of this.config.frameworks) {
      if (testScript.includes(framework)) {
        // return framework;
    //   // LINT: unreachable code removed}
    //     }
  } catch (error)

  // Use first detected framework
  if (this.detectedFrameworks?.length > 0) {
    // return this.detectedFrameworks[0];
    //   // LINT: unreachable code removed}

  // Use default
  // return this.config.defaultFramework;
// }


async;
executeTestRunner(framework, runner, options);

// {
  const _args = runner.args(options);
  const _output = '';
  const _errorOutput = '';

  // return new Promise((resolve, _reject) => {
      const _child = spawn(runner.command, args, {
        cwd => {
        output += data.toString();
    // this.emit('output', { framework, type => { // LINT);
        this.emit('output', { framework, type => {
        this.activeRuns.delete(options.runId);

        let results;

        // Parse results based on framework
        if(framework === 'tape') {
          // Tape outputs to stdout
          results = // await runner.parseResults(output);
        } else {
          // Other frameworks write to file
          const _outputFile = path.join(this.config.outputDir, `${framework}-results.\${framework === 'ava'  ?? framework === 'tap' ? 'tap' }`);
          results = // await runner.parseResults(outputFile);
        //         }


        if(!results) {
          //Fallback = this.parseOutputFallback(output, errorOutput, framework);
        //         }


        results.exitCode = code;
        results.success = code === 0;

        // Add coverage data if available
        if(options.coverage) {
          results.coverage = // await this.collectCoverageData(framework);
        //         }


        resolve(results);
      });

  child.on('error', (error) => {
    this.activeRuns.delete(options.runId);
    reject(error);
  });
// }
);
// }


  executeCommand(command, args);
  // return new Promise((resolve, reject) => {
      const _child = spawn(command, args, {shell = '';
    // ; // LINT) => {
        output += data.toString();
      });

      child.on('close', (code) => {
        resolve({ code, output });
      });

      child.on('error', reject);
    });

normalizeJestResults(results);

// {
    const _normalized = {
      success = {file = {title = === 'failed') {
          normalized.failures.push({
            file = {success = === 0,summary = () => {
      const _suiteResult = {
        file = {title = test.duration  ?? 0;

        if(test.state === 'failed' && test.err) {
          normalized.failures.push({file = () => {
      for(const suite of suites  ?? []) {
        if(suite.tests) {
          processTests(suite.tests, suite.file);
        //         }
        if(suite.suites) {
          processSuites(suite.suites);
        //         }
      //       }
    };

    if(results.suites) {
      processSuites(results.suites);
    //     }


    // return normalized;
    //   // LINT: unreachable code removed}

  normalizeVitestResults(results) {
    const _normalized = {
      success = {file = () => {
        for(const test of tests) {
          if(test.type === 'test') {
            const _testResult = {title = === 'fail' && test.result?.error) {
              normalized.failures.push({file = === 'suite' && test.tasks) {
            processTests(_test._tasks);
          //           }
        //         }
      };

      if(file.tasks) {
        processTests(file.tasks);
      //       }


      if(suiteResult.tests.length > 0) {
        normalized.testResults.push(suiteResult);
      //       }
    //     }


    // return normalized;
    //   // LINT: unreachable code removed}

  parseTAPResults(tapContent, framework) {
    const _lines = tapContent.split('\n');
    const _normalized = {success = null;
    const _currentTest = null;
    const _inYAML = false;
    const _yamlContent = '';

    for(const line of lines) {
      // TAP version
      if (line.startsWith('TAP version')) continue;

      // Test plan
      const _planMatch = line.match(/^1\.\.(\d+)/);
      if(planMatch) {
        normalized.summary.total = parseInt(planMatch[1]);
        continue;
      //       }


      // Test result
      const _testMatch = line.match(/^(ok|not ok)\s+(\d+)\s*(.*?)(?:\s*#\s*(.*))?$/);
      if(testMatch) {
        const [ _result, _number, _description, directive] = testMatch;

        if(!currentSuite) {
          currentSuite = {file = {title = === 'ok' ? 'passed' : 'failed',duration = 'skipped';
            normalized.summary.skipped++;
          } else if (directive.toLowerCase().includes('todo')) {
            test.status = 'skipped';
            normalized.summary.skipped++;
          //           }
        } else if(result === 'ok') {
          normalized.summary.passed++;
        } else {
          normalized.summary.failed++;
          normalized.success = false;
        //         }


        currentTest = test;
        currentSuite.tests.push(test);
      //       }


      // YAML diagnostic block
      if (line.trim() === '---') {
        inYAML = true;
        yamlContent = '';
        continue;
      //       }


      if (line.trim() === '...') {
        inYAML = false;
        if(currentTest && currentTest.status === 'failed') {
          // Parse YAML for error details
          currentTest.error = this.parseYAMLDiagnostic(yamlContent);
          normalized.failures.push({file = `${line}\n`;
      //       }


      // Bail out
      if (line.startsWith('Bail out!')) {
        normalized.success = false;
        break;
      //       }
    //     }


    // return normalized;
    //   // LINT: unreachable code removed}

  parseYAMLDiagnostic(yamlContent) {
    // Simple YAML parsing for diagnostic info
    const _lines = yamlContent.split('\n');
    const _diagnostic = {};

    for(const line of lines) {
      const _match = line.match(/^\s*(\w+):\s*(.*)$/);
      if(match) {
        diagnostic[match[1]] = match[2];
      //       }
    //     }


    // return diagnostic.message  ?? diagnostic.error  ?? yamlContent.trim();
    //   // LINT: unreachable code removed}

  parseOutputFallback(output, errorOutput, framework) {
    // Fallback parser for when structured output isn't available'
    const _normalized = {success = output.match(/(\d+)\s*(passing|passed|pass)/i);
    if(passMatch) {
      normalized.summary.passed = parseInt(passMatch[1]);
      normalized.summary.total += normalized.summary.passed;
    //     }


    const _failMatch = output.match(/(\d+)\s*(failing|failed|fail)/i);
    if(failMatch) {
      normalized.summary.failed = parseInt(failMatch[1]);
      normalized.summary.total += normalized.summary.failed;
      normalized.success = false;
    //     }


    const _skipMatch = output.match(/(\d+)\s*(pending|skipped|skip)/i);
    if(skipMatch) {
      normalized.summary.skipped = parseInt(skipMatch[1]);
      normalized.summary.total += normalized.summary.skipped;
    //     }


    // return normalized;
    //   // LINT: unreachable code removed}

  async collectCoverageData(framework) {
    const _coverageDir = path.join(this.config.outputDir, 'coverage', framework);

    try {
      // Look for coverage summary
      const _summaryPath = path.join(coverageDir, 'coverage-summary.json');
      const _summary = JSON.parse(// await readFile(summaryPath, 'utf8'));

      const _coverage = {summary = = 'total') {
          coverage.files[file] = {lines = this.checkCoverageThreshold(coverage.summary);

      // return coverage;
    // ; // LINT: unreachable code removed
    } catch (error) {
      console.warn(`⚠ Could not collect coveragedata = this.config.coverage.threshold.global;`

    // return (;
    // summary.lines >= threshold.lines &&; // LINT);
  //   }


  updateStats(result) ;
    this.stats.totalRuns++;

    if(result.success) {
      this.stats.passedRuns++;
    } else {
      this.stats.failedRuns++;
    //     }


    this.stats.totalTests += result.summary.total;
    this.stats.passedTests += result.summary.passed;
    this.stats.failedTests += result.summary.failed;
    this.stats.skippedTests += result.summary.skipped;

    // Update average duration
    if(result.duration) {
      const _totalDuration = this.stats.averageDuration * (this.stats.totalRuns - 1) + result.duration;
      this.stats.averageDuration = totalDuration / this.stats.totalRuns;
    //     }


    // Track coverage history
    if(result.coverage) {
      this.stats.coverageHistory.push({timestamp = this.stats.coverageHistory.slice(-100);
      //       }
  //   }


  async generateReports(runId, result) {
    const _reportDir = path.join(this.config.outputDir, 'reports', runId);
// await mkdir(reportDir, { recursive = {runId = '# Test Failures Report\n\n';
    content += `Generated = `Total Failures: \$failures.length\n\n`;`

    for(const failure of failures) {
      content += `## ${failure.test}\n`;
      content += `**File = '```\n';
      content += failure.error  ?? 'No error message';
      content += '\n```\n\n';`
    //     }
// // await writeFile(path.join(reportDir, 'failures.md'), content);
  //   }


  async generateHTMLReport(reportDir, result) {
    const _html = `;`
<!DOCTYPE html>;
<html>;
<head>;
    <title>Test Report - ${result.framework}</title>;
    <style>;
        body { font-family, sans-serif;margin = "header">;
        <h1>🧪 Test Report - ${result.framework}</h1>;
        <p><strong>RunID = "\${result.success ? 'passed' }">\${result.success ? 'PASSED' }</span></p>;
    </div>

    <div class="summary">;
        <div class="metric">;
            <div class="value">${result.summary.total}</div>;
            <div>Total Tests</div>;
        </div>;
        <div class="metric">;
            <div class="value passed">${result.summary.passed}</div>;
            <div>Passed</div>;
        </div>;
        <div class="metric">;
            <div class="value failed">${result.summary.failed}</div>;
            <div>Failed</div>;
        </div>;
        <div class="metric">;
            <div class="value skipped">${result.summary.skipped}</div>;
            <div>Skipped</div>;
        </div>;
    </div>

    \${result.coverage ? this.generateCoverageHTML(result.coverage) }

    <h2>Test Results</h2>;
    ${result.testResults.map(suite => `;`
        <div class="test-suite">;
            <h3>${suite.file}</h3>;
            <p><strong>Duration = > `;`
                <div class="test ${test.status}">;
                    <strong>${test.title}</strong>;
                    ${test.error ? `<div class="error">${this.escapeHtml(test.error)}</div>` : ''}
                </div>;
            `).join('')}`
        </div>;
    `).join('')}`
</body>;
</html>`;`
// // await writeFile(path.join(reportDir, 'report.html'), html);
  //   }


  generateCoverageHTML(coverage) {
    const _getCoverageClass = () => {
      if (pct < 50) return 'coverage-low';
    // if (pct < 80) return 'coverage-medium'; // LINT: unreachable code removed
      return '';
    //   // LINT: unreachable code removed};

    // return `;`
    // <div class="coverage">; // LINT: unreachable code removed
        <h2>� Coverage Report</h2>;
        <div>;
            <p><strong>Lines = "coverage-bar">;
                <div class="coverage-fill ${getCoverageClass(coverage.summary.lines)}" style="width = "coverage-bar">;"
                <div class="coverage-fill ${getCoverageClass(coverage.summary.statements)}" style="width = "coverage-bar">;"
                <div class="coverage-fill ${getCoverageClass(coverage.summary.functions)}" style="width = "coverage-bar">;"
                <div class="coverage-fill ${getCoverageClass(coverage.summary.branches)}" style="width = {"
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',"
      "'": '&#039;';'
    };

    // return text.replace(/[&<>"']/g, m => map[m]);"'
    //   // LINT: unreachable code removed}

  async watchTests(options = {}) {
    const _framework = options.framework  ?? this.detectBestFramework();

    console.warn(`� Starting test watcher with ${framework}...`);

    // return this.runTests({
..options,
    // framework,watch = this.activeRuns.get(runId); // LINT: unreachable code removed
    if(child) {
      child.kill('SIGTERM');
      this.activeRuns.delete(runId);
      console.warn('� Test watcher stopped');
    //     }
  //   }


  async getTestFiles(pattern) {
    const { glob } = await import('glob');
    const _patterns = pattern ? [pattern] : this.config.testPatterns;
    const __files = [];

    for(const _p of patterns) {

    const _analysis = {totalFiles = // await readFile(file, 'utf8');
      const _dir = path.dirname(file);

      // Count by directory
      analysis.byDirectory[dir] = (analysis.byDirectory[dir]  ?? 0) + 1;

      // Detect framework
      const _framework = 'unknown';
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
      //       }


      analysis.byFramework[framework] = (analysis.byFramework[framework]  ?? 0) + 1;

      // Count tests (approximate)
      const _testMatches = content.match(/\b(it|test|describe)\s*\(/g);
      if(testMatches) {
        analysis.testCount += testMatches.length;
      //       }
    //     }


    // Check for coverage configuration
    for(const framework of this.config.frameworks) {
      const _config = this.testConfigs?.[framework];
      if(config) {
        analysis.coverage.configured.push(framework);
        if(config.coverage  ?? config.collectCoverage) {
          analysis.coverage.hasConfig = true;
        //         }
      //       }
    //     }


    // return analysis;
    //   // LINT: unreachable code removed}

  getStats() ;
    // return {
..this.stats,activeRuns = 10) {
    const _results = Array.from(this.results.values());
    // .sort((a, b) => (b.timestamp  ?? 0) - (a.timestamp  ?? 0)); // LINT: unreachable code removed
slice(0, limit);

    return results;
    // ; // LINT: unreachable code removed
  getResult(runId) ;
    // return this.results.get(runId);
    // ; // LINT: unreachable code removed
  async cleanup() ;
    // Stop all active test runs
    for(const [_runId, child] of this.activeRuns) {
      child.kill('SIGTERM');
    //     }


    this.activeRuns.clear();
    this.results.clear();
    this.removeAllListeners();

    console.warn('🧪 Test Runner Plugin cleaned up');
// }


// export default TestRunnerPlugin;

}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}})))))