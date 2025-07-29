/**
 * Test Runner Plugin
 * Multi-framework test execution with coverage reporting
 */

import { spawn } from 'child_process';
import { readFile, writeFile, mkdir, access } from 'fs/promises';
import path from 'path';
import { EventEmitter } from 'events';

export class TestRunnerPlugin extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      frameworks: ['jest', 'mocha', 'vitest', 'ava', 'tap', 'tape'],
      defaultFramework: 'jest',
      testPatterns: ['**/*.test.js', '**/*.spec.js', '**/*.test.ts', '**/*.spec.ts'],
      coverage: {
        enabled: true,
        threshold: {
          global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
          }
        },
        reporters: ['text', 'html', 'lcov', 'json']
      },
      parallel: true,
      maxWorkers: 4,
      timeout: 30000,
      bail: false,
      watch: false,
      outputDir: path.join(process.cwd(), '.hive-mind', 'test-reports'),
      ...config
    };
    
    this.runners = new Map();
    this.results = new Map();
    this.activeRuns = new Map();
    this.testQueue = [];
    this.stats = {
      totalRuns: 0,
      passedRuns: 0,
      failedRuns: 0,
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      averageDuration: 0,
      coverageHistory: []
    };
  }

  async initialize() {
    console.log('🧪 Test Runner Plugin initialized');
    
    // Create output directory
    await mkdir(this.config.outputDir, { recursive: true });
    await mkdir(path.join(this.config.outputDir, 'coverage'), { recursive: true });
    
    // Initialize test framework runners
    await this.initializeRunners();
    
    // Detect available frameworks
    await this.detectFrameworks();
    
    // Load test configuration
    await this.loadTestConfig();
  }

  async initializeRunners() {
    // Jest runner
    this.runners.set('jest', {
      command: 'jest',
      args: (options = {}) => {
        const args = [];
        
        if (options.coverage || this.config.coverage.enabled) {
          args.push('--coverage');
          args.push('--coverageDirectory', path.join(this.config.outputDir, 'coverage', 'jest'));
        }
        
        if (options.watch || this.config.watch) {
          args.push('--watch');
        }
        
        if (options.updateSnapshot) {
          args.push('--updateSnapshot');
        }
        
        if (options.pattern) {
          args.push('--testPathPattern', options.pattern);
        }
        
        if (options.testNamePattern) {
          args.push('--testNamePattern', options.testNamePattern);
        }
        
        if (this.config.parallel && !options.runInBand) {
          args.push('--maxWorkers', this.config.maxWorkers);
        } else {
          args.push('--runInBand');
        }
        
        if (this.config.bail) {
          args.push('--bail');
        }
        
        args.push('--json');
        args.push('--outputFile', path.join(this.config.outputDir, 'jest-results.json'));
        
        return args;
      },
      parseResults: async (outputFile) => {
        try {
          const results = JSON.parse(await readFile(outputFile, 'utf8'));
          return this.normalizeJestResults(results);
        } catch (error) {
          return null;
        }
      }
    });

    // Mocha runner
    this.runners.set('mocha', {
      command: 'mocha',
      args: (options = {}) => {
        const args = [];
        
        if (options.pattern) {
          args.push(options.pattern);
        } else {
          args.push('test/**/*.js');
        }
        
        args.push('--reporter', 'json');
        args.push('--reporter-options', `output=${path.join(this.config.outputDir, 'mocha-results.json')}`);
        
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
      },
      parseResults: async (outputFile) => {
        try {
          const results = JSON.parse(await readFile(outputFile, 'utf8'));
          return this.normalizeMochaResults(results);
        } catch (error) {
          return null;
        }
      }
    });

    // Vitest runner
    this.runners.set('vitest', {
      command: 'vitest',
      args: (options = {}) => {
        const args = ['run'];
        
        if (options.coverage || this.config.coverage.enabled) {
          args.push('--coverage');
          args.push('--coverage.reportsDirectory', path.join(this.config.outputDir, 'coverage', 'vitest'));
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
      },
      parseResults: async (outputFile) => {
        try {
          const results = JSON.parse(await readFile(outputFile, 'utf8'));
          return this.normalizeVitestResults(results);
        } catch (error) {
          return null;
        }
      }
    });

    // AVA runner
    this.runners.set('ava', {
      command: 'ava',
      args: (options = {}) => {
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
      },
      parseResults: async (outputFile) => {
        try {
          const tapContent = await readFile(outputFile, 'utf8');
          return this.parseTAPResults(tapContent, 'ava');
        } catch (error) {
          return null;
        }
      }
    });

    // TAP runner
    this.runners.set('tap', {
      command: 'tap',
      args: (options = {}) => {
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
      },
      parseResults: async (outputFile) => {
        try {
          const tapContent = await readFile(outputFile, 'utf8');
          return this.parseTAPResults(tapContent, 'tap');
        } catch (error) {
          return null;
        }
      }
    });

    // Tape runner
    this.runners.set('tape', {
      command: 'tape',
      args: (options = {}) => {
        const args = [];
        
        if (options.pattern) {
          args.push(options.pattern);
        } else {
          args.push('test/**/*.js');
        }
        
        return args;
      },
      parseResults: async (output) => {
        // Tape outputs TAP format to stdout
        return this.parseTAPResults(output, 'tape');
      }
    });

    console.log(`✅ Initialized ${this.runners.size} test framework runners`);
  }

  async detectFrameworks() {
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
    
    console.log(`🔍 Detected test frameworks: ${detected.join(', ') || 'none'}`);
    this.detectedFrameworks = detected;
    
    return detected;
  }

  async loadTestConfig() {
    // Load Jest config
    try {
      const jestConfig = await this.loadJestConfig();
      if (jestConfig) {
        this.testConfigs = this.testConfigs || {};
        this.testConfigs.jest = jestConfig;
      }
    } catch (error) {
      // No Jest config
    }
    
    // Load Vitest config
    try {
      const vitestConfig = await this.loadVitestConfig();
      if (vitestConfig) {
        this.testConfigs = this.testConfigs || {};
        this.testConfigs.vitest = vitestConfig;
      }
    } catch (error) {
      // No Vitest config
    }
    
    // Load Mocha config
    try {
      const mochaConfig = await this.loadMochaConfig();
      if (mochaConfig) {
        this.testConfigs = this.testConfigs || {};
        this.testConfigs.mocha = mochaConfig;
      }
    } catch (error) {
      // No Mocha config
    }
  }

  async loadJestConfig() {
    const configPaths = [
      'jest.config.js',
      'jest.config.ts',
      'jest.config.json',
      'package.json'
    ];
    
    for (const configPath of configPaths) {
      try {
        await access(configPath);
        
        if (configPath === 'package.json') {
          const pkg = JSON.parse(await readFile(configPath, 'utf8'));
          return pkg.jest || null;
        } else if (configPath.endsWith('.json')) {
          return JSON.parse(await readFile(configPath, 'utf8'));
        } else {
          // For JS/TS configs, we'd need to dynamically import
          return { configFile: configPath };
        }
      } catch (error) {
        // Try next config path
      }
    }
    
    return null;
  }

  async loadVitestConfig() {
    const configPaths = [
      'vitest.config.js',
      'vitest.config.ts',
      'vite.config.js',
      'vite.config.ts'
    ];
    
    for (const configPath of configPaths) {
      try {
        await access(configPath);
        return { configFile: configPath };
      } catch (error) {
        // Try next config path
      }
    }
    
    return null;
  }

  async loadMochaConfig() {
    const configPaths = [
      '.mocharc.js',
      '.mocharc.json',
      '.mocharc.yaml',
      '.mocharc.yml',
      'package.json'
    ];
    
    for (const configPath of configPaths) {
      try {
        await access(configPath);
        
        if (configPath === 'package.json') {
          const pkg = JSON.parse(await readFile(configPath, 'utf8'));
          return pkg.mocha || null;
        } else if (configPath.endsWith('.json')) {
          return JSON.parse(await readFile(configPath, 'utf8'));
        } else {
          return { configFile: configPath };
        }
      } catch (error) {
        // Try next config path
      }
    }
    
    return null;
  }

  async runTests(options = {}) {
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
    
    if (!framework) {
      throw new Error('No test framework detected. Please install a supported test framework.');
    }
    
    const runner = this.runners.get(framework);
    if (!runner) {
      throw new Error(`Unsupported test framework: ${framework}`);
    }
    
    const runId = `${framework}-${Date.now()}`;
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
      serial
    };
    
    console.log(`🧪 Running tests with ${framework}...`);
    
    try {
      this.emit('run:start', { runId, framework, options: runOptions });
      
      const startTime = Date.now();
      const result = await this.executeTestRunner(framework, runner, runOptions);
      const duration = Date.now() - startTime;
      
      result.duration = duration;
      result.runId = runId;
      result.framework = framework;
      
      this.results.set(runId, result);
      this.updateStats(result);
      
      // Generate reports
      await this.generateReports(runId, result);
      
      this.emit('run:complete', { runId, result });
      
      console.log(`✅ Test run completed: ${result.summary.total} tests, ${result.summary.passed} passed, ${result.summary.failed} failed`);
      
      return result;
      
    } catch (error) {
      const errorResult = {
        runId,
        framework,
        success: false,
        error: error.message,
        summary: { total: 0, passed: 0, failed: 0, skipped: 0 }
      };
      
      this.results.set(runId, errorResult);
      this.emit('run:error', { runId, error });
      
      throw error;
    }
  }

  detectBestFramework() {
    // Check package.json test script
    try {
      const pkg = JSON.parse(require('fs').readFileSync('package.json', 'utf8'));
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

  async executeTestRunner(framework, runner, options) {
    const args = runner.args(options);
    let output = '';
    let errorOutput = '';
    
    return new Promise((resolve, reject) => {
      const child = spawn(runner.command, args, {
        cwd: process.cwd(),
        env: { ...process.env, NODE_ENV: 'test' },
        shell: true
      });
      
      this.activeRuns.set(options.runId, child);
      
      child.stdout.on('data', (data) => {
        output += data.toString();
        this.emit('output', { framework, type: 'stdout', data: data.toString() });
      });
      
      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
        this.emit('output', { framework, type: 'stderr', data: data.toString() });
      });
      
      child.on('close', async (code) => {
        this.activeRuns.delete(options.runId);
        
        let results;
        
        // Parse results based on framework
        if (framework === 'tape') {
          // Tape outputs to stdout
          results = await runner.parseResults(output);
        } else {
          // Other frameworks write to file
          const outputFile = path.join(this.config.outputDir, `${framework}-results.${framework === 'ava' || framework === 'tap' ? 'tap' : 'json'}`);
          results = await runner.parseResults(outputFile);
        }
        
        if (!results) {
          // Fallback: try to parse from output
          results = this.parseOutputFallback(output, errorOutput, framework);
        }
        
        results.exitCode = code;
        results.success = code === 0;
        
        // Add coverage data if available
        if (options.coverage) {
          results.coverage = await this.collectCoverageData(framework);
        }
        
        resolve(results);
      });
      
      child.on('error', (error) => {
        this.activeRuns.delete(options.runId);
        reject(error);
      });
    });
  }

  executeCommand(command, args) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, { shell: true });
      let output = '';
      
      child.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      child.on('close', (code) => {
        resolve({ code, output });
      });
      
      child.on('error', reject);
    });
  }

  normalizeJestResults(results) {
    const normalized = {
      success: results.success,
      summary: {
        total: results.numTotalTests,
        passed: results.numPassedTests,
        failed: results.numFailedTests,
        skipped: results.numPendingTests + results.numTodoTests
      },
      testResults: [],
      failures: []
    };
    
    for (const suite of results.testResults || []) {
      const suiteResult = {
        file: suite.name,
        duration: suite.endTime - suite.startTime,
        tests: []
      };
      
      for (const test of suite.assertionResults || []) {
        const testResult = {
          title: test.title,
          fullTitle: test.fullName,
          status: test.status,
          duration: test.duration || 0,
          error: test.failureMessages?.join('\n')
        };
        
        suiteResult.tests.push(testResult);
        
        if (test.status === 'failed') {
          normalized.failures.push({
            file: suite.name,
            test: test.fullName,
            error: test.failureMessages?.join('\n')
          });
        }
      }
      
      normalized.testResults.push(suiteResult);
    }
    
    return normalized;
  }

  normalizeMochaResults(results) {
    const normalized = {
      success: results.stats.failures === 0,
      summary: {
        total: results.stats.tests,
        passed: results.stats.passes,
        failed: results.stats.failures,
        skipped: results.stats.pending
      },
      testResults: [],
      failures: []
    };
    
    const processTests = (tests, file) => {
      const suiteResult = {
        file: file || 'unknown',
        duration: 0,
        tests: []
      };
      
      for (const test of tests) {
        const testResult = {
          title: test.title,
          fullTitle: test.fullTitle,
          status: test.state || (test.pending ? 'skipped' : 'unknown'),
          duration: test.duration || 0,
          error: test.err?.message
        };
        
        suiteResult.tests.push(testResult);
        suiteResult.duration += test.duration || 0;
        
        if (test.state === 'failed' && test.err) {
          normalized.failures.push({
            file: test.file || file || 'unknown',
            test: test.fullTitle,
            error: test.err.message + (test.err.stack ? '\n' + test.err.stack : '')
          });
        }
      }
      
      if (suiteResult.tests.length > 0) {
        normalized.testResults.push(suiteResult);
      }
    };
    
    // Process test results
    if (results.tests) {
      processTests(results.tests);
    }
    
    // Process suites recursively
    const processSuites = (suites) => {
      for (const suite of suites || []) {
        if (suite.tests) {
          processTests(suite.tests, suite.file);
        }
        if (suite.suites) {
          processSuites(suite.suites);
        }
      }
    };
    
    if (results.suites) {
      processSuites(results.suites);
    }
    
    return normalized;
  }

  normalizeVitestResults(results) {
    const normalized = {
      success: results.success,
      summary: {
        total: results.numTotalTests || 0,
        passed: results.numPassedTests || 0,
        failed: results.numFailedTests || 0,
        skipped: results.numSkippedTests || 0
      },
      testResults: [],
      failures: []
    };
    
    for (const file of results.testResults || []) {
      const suiteResult = {
        file: file.name,
        duration: file.duration || 0,
        tests: []
      };
      
      const processTests = (tests) => {
        for (const test of tests) {
          if (test.type === 'test') {
            const testResult = {
              title: test.name,
              fullTitle: test.fullName || test.name,
              status: test.result?.state || 'unknown',
              duration: test.result?.duration || 0,
              error: test.result?.error?.message
            };
            
            suiteResult.tests.push(testResult);
            
            if (test.result?.state === 'fail' && test.result?.error) {
              normalized.failures.push({
                file: file.name,
                test: test.fullName || test.name,
                error: test.result.error.message + (test.result.error.stack ? '\n' + test.result.error.stack : '')
              });
            }
          } else if (test.type === 'suite' && test.tasks) {
            processTests(test.tasks);
          }
        }
      };
      
      if (file.tasks) {
        processTests(file.tasks);
      }
      
      if (suiteResult.tests.length > 0) {
        normalized.testResults.push(suiteResult);
      }
    }
    
    return normalized;
  }

  parseTAPResults(tapContent, framework) {
    const lines = tapContent.split('\n');
    const normalized = {
      success: true,
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0
      },
      testResults: [],
      failures: []
    };
    
    let currentSuite = null;
    let currentTest = null;
    let inYAML = false;
    let yamlContent = '';
    
    for (const line of lines) {
      // TAP version
      if (line.startsWith('TAP version')) continue;
      
      // Test plan
      const planMatch = line.match(/^1\.\.(\d+)/);
      if (planMatch) {
        normalized.summary.total = parseInt(planMatch[1]);
        continue;
      }
      
      // Test result
      const testMatch = line.match(/^(ok|not ok)\s+(\d+)\s*(.*?)(?:\s*#\s*(.*))?$/);
      if (testMatch) {
        const [, result, number, description, directive] = testMatch;
        
        if (!currentSuite) {
          currentSuite = {
            file: framework,
            duration: 0,
            tests: []
          };
          normalized.testResults.push(currentSuite);
        }
        
        const test = {
          title: description || `Test ${number}`,
          fullTitle: description || `Test ${number}`,
          status: result === 'ok' ? 'passed' : 'failed',
          duration: 0,
          error: null
        };
        
        if (directive) {
          if (directive.toLowerCase().includes('skip')) {
            test.status = 'skipped';
            normalized.summary.skipped++;
          } else if (directive.toLowerCase().includes('todo')) {
            test.status = 'skipped';
            normalized.summary.skipped++;
          }
        } else if (result === 'ok') {
          normalized.summary.passed++;
        } else {
          normalized.summary.failed++;
          normalized.success = false;
        }
        
        currentTest = test;
        currentSuite.tests.push(test);
        continue;
      }
      
      // YAML diagnostic block
      if (line.trim() === '---') {
        inYAML = true;
        yamlContent = '';
        continue;
      }
      
      if (line.trim() === '...') {
        inYAML = false;
        if (currentTest && currentTest.status === 'failed') {
          // Parse YAML for error details
          currentTest.error = this.parseYAMLDiagnostic(yamlContent);
          normalized.failures.push({
            file: currentSuite.file,
            test: currentTest.fullTitle,
            error: currentTest.error
          });
        }
        continue;
      }
      
      if (inYAML) {
        yamlContent += line + '\n';
      }
      
      // Bail out
      if (line.startsWith('Bail out!')) {
        normalized.success = false;
        break;
      }
    }
    
    return normalized;
  }

  parseYAMLDiagnostic(yamlContent) {
    // Simple YAML parsing for diagnostic info
    const lines = yamlContent.split('\n');
    const diagnostic = {};
    
    for (const line of lines) {
      const match = line.match(/^\s*(\w+):\s*(.*)$/);
      if (match) {
        diagnostic[match[1]] = match[2];
      }
    }
    
    return diagnostic.message || diagnostic.error || yamlContent.trim();
  }

  parseOutputFallback(output, errorOutput, framework) {
    // Fallback parser for when structured output isn't available
    const normalized = {
      success: !errorOutput.includes('FAIL') && !output.includes('FAIL'),
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0
      },
      testResults: [],
      failures: []
    };
    
    // Try to extract test counts from output
    const passMatch = output.match(/(\d+)\s*(passing|passed|pass)/i);
    if (passMatch) {
      normalized.summary.passed = parseInt(passMatch[1]);
      normalized.summary.total += normalized.summary.passed;
    }
    
    const failMatch = output.match(/(\d+)\s*(failing|failed|fail)/i);
    if (failMatch) {
      normalized.summary.failed = parseInt(failMatch[1]);
      normalized.summary.total += normalized.summary.failed;
      normalized.success = false;
    }
    
    const skipMatch = output.match(/(\d+)\s*(pending|skipped|skip)/i);
    if (skipMatch) {
      normalized.summary.skipped = parseInt(skipMatch[1]);
      normalized.summary.total += normalized.summary.skipped;
    }
    
    return normalized;
  }

  async collectCoverageData(framework) {
    const coverageDir = path.join(this.config.outputDir, 'coverage', framework);
    
    try {
      // Look for coverage summary
      const summaryPath = path.join(coverageDir, 'coverage-summary.json');
      const summary = JSON.parse(await readFile(summaryPath, 'utf8'));
      
      const coverage = {
        summary: {
          lines: summary.total.lines.pct,
          statements: summary.total.statements.pct,
          functions: summary.total.functions.pct,
          branches: summary.total.branches.pct
        },
        files: {}
      };
      
      // Add file-level coverage
      for (const [file, data] of Object.entries(summary)) {
        if (file !== 'total') {
          coverage.files[file] = {
            lines: data.lines.pct,
            statements: data.statements.pct,
            functions: data.functions.pct,
            branches: data.branches.pct
          };
        }
      }
      
      // Check thresholds
      coverage.meetsThreshold = this.checkCoverageThreshold(coverage.summary);
      
      return coverage;
      
    } catch (error) {
      console.warn(`⚠️ Could not collect coverage data: ${error.message}`);
      return null;
    }
  }

  checkCoverageThreshold(summary) {
    const threshold = this.config.coverage.threshold.global;
    
    return (
      summary.lines >= threshold.lines &&
      summary.statements >= threshold.statements &&
      summary.functions >= threshold.functions &&
      summary.branches >= threshold.branches
    );
  }

  updateStats(result) {
    this.stats.totalRuns++;
    
    if (result.success) {
      this.stats.passedRuns++;
    } else {
      this.stats.failedRuns++;
    }
    
    this.stats.totalTests += result.summary.total;
    this.stats.passedTests += result.summary.passed;
    this.stats.failedTests += result.summary.failed;
    this.stats.skippedTests += result.summary.skipped;
    
    // Update average duration
    if (result.duration) {
      const totalDuration = this.stats.averageDuration * (this.stats.totalRuns - 1) + result.duration;
      this.stats.averageDuration = totalDuration / this.stats.totalRuns;
    }
    
    // Track coverage history
    if (result.coverage) {
      this.stats.coverageHistory.push({
        timestamp: Date.now(),
        coverage: result.coverage.summary
      });
      
      // Keep only last 100 entries
      if (this.stats.coverageHistory.length > 100) {
        this.stats.coverageHistory = this.stats.coverageHistory.slice(-100);
      }
    }
  }

  async generateReports(runId, result) {
    const reportDir = path.join(this.config.outputDir, 'reports', runId);
    await mkdir(reportDir, { recursive: true });
    
    // Generate summary report
    const summaryReport = {
      runId,
      framework: result.framework,
      timestamp: new Date().toISOString(),
      duration: result.duration,
      success: result.success,
      summary: result.summary,
      coverage: result.coverage?.summary,
      environment: {
        node: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };
    
    await writeFile(
      path.join(reportDir, 'summary.json'),
      JSON.stringify(summaryReport, null, 2)
    );
    
    // Generate detailed test report
    await writeFile(
      path.join(reportDir, 'detailed.json'),
      JSON.stringify(result, null, 2)
    );
    
    // Generate failure report
    if (result.failures.length > 0) {
      await this.generateFailureReport(reportDir, result.failures);
    }
    
    // Generate HTML report
    await this.generateHTMLReport(reportDir, result);
    
    console.log(`📊 Test reports generated in ${reportDir}`);
  }

  async generateFailureReport(reportDir, failures) {
    let content = '# Test Failures Report\n\n';
    content += `Generated: ${new Date().toISOString()}\n`;
    content += `Total Failures: ${failures.length}\n\n`;
    
    for (const failure of failures) {
      content += `## ${failure.test}\n`;
      content += `**File:** ${failure.file}\n\n`;
      content += '```\n';
      content += failure.error || 'No error message';
      content += '\n```\n\n';
    }
    
    await writeFile(path.join(reportDir, 'failures.md'), content);
  }

  async generateHTMLReport(reportDir, result) {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Test Report - ${result.framework}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { border-bottom: 2px solid #333; padding-bottom: 20px; }
        .summary { display: flex; gap: 30px; margin: 20px 0; }
        .metric { text-align: center; }
        .metric .value { font-size: 2em; font-weight: bold; }
        .passed { color: #4CAF50; }
        .failed { color: #f44336; }
        .skipped { color: #ff9800; }
        .test-suite { margin: 20px 0; padding: 20px; background: #f5f5f5; border-radius: 5px; }
        .test { margin: 10px 0; padding: 10px; background: white; border-radius: 3px; }
        .test.passed { border-left: 4px solid #4CAF50; }
        .test.failed { border-left: 4px solid #f44336; }
        .test.skipped { border-left: 4px solid #ff9800; }
        .error { background: #ffebee; padding: 10px; margin: 10px 0; border-radius: 3px; font-family: monospace; white-space: pre-wrap; }
        .coverage { margin: 30px 0; }
        .coverage-bar { width: 100%; height: 20px; background: #e0e0e0; border-radius: 10px; overflow: hidden; }
        .coverage-fill { height: 100%; background: #4CAF50; transition: width 0.3s; }
        .coverage-low { background: #f44336; }
        .coverage-medium { background: #ff9800; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 Test Report - ${result.framework}</h1>
        <p><strong>Run ID:</strong> ${result.runId}</p>
        <p><strong>Duration:</strong> ${(result.duration / 1000).toFixed(2)}s</p>
        <p><strong>Status:</strong> <span class="${result.success ? 'passed' : 'failed'}">${result.success ? 'PASSED' : 'FAILED'}</span></p>
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
            <p><strong>Duration:</strong> ${suite.duration}ms</p>
            ${suite.tests.map(test => `
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

  generateCoverageHTML(coverage) {
    const getCoverageClass = (pct) => {
      if (pct < 50) return 'coverage-low';
      if (pct < 80) return 'coverage-medium';
      return '';
    };
    
    return `
    <div class="coverage">
        <h2>📊 Coverage Report</h2>
        <div>
            <p><strong>Lines:</strong> ${coverage.summary.lines}%</p>
            <div class="coverage-bar">
                <div class="coverage-fill ${getCoverageClass(coverage.summary.lines)}" style="width: ${coverage.summary.lines}%"></div>
            </div>
        </div>
        <div>
            <p><strong>Statements:</strong> ${coverage.summary.statements}%</p>
            <div class="coverage-bar">
                <div class="coverage-fill ${getCoverageClass(coverage.summary.statements)}" style="width: ${coverage.summary.statements}%"></div>
            </div>
        </div>
        <div>
            <p><strong>Functions:</strong> ${coverage.summary.functions}%</p>
            <div class="coverage-bar">
                <div class="coverage-fill ${getCoverageClass(coverage.summary.functions)}" style="width: ${coverage.summary.functions}%"></div>
            </div>
        </div>
        <div>
            <p><strong>Branches:</strong> ${coverage.summary.branches}%</p>
            <div class="coverage-bar">
                <div class="coverage-fill ${getCoverageClass(coverage.summary.branches)}" style="width: ${coverage.summary.branches}%"></div>
            </div>
        </div>
        <p><strong>Meets Threshold:</strong> ${coverage.meetsThreshold ? '✅ Yes' : '❌ No'}</p>
    </div>`;
  }

  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  async watchTests(options = {}) {
    const framework = options.framework || this.detectBestFramework();
    
    console.log(`👁️ Starting test watcher with ${framework}...`);
    
    return this.runTests({
      ...options,
      framework,
      watch: true
    });
  }

  async stopWatch(runId) {
    const child = this.activeRuns.get(runId);
    if (child) {
      child.kill('SIGTERM');
      this.activeRuns.delete(runId);
      console.log('👁️ Test watcher stopped');
    }
  }

  async getTestFiles(pattern) {
    const { glob } = await import('glob');
    const patterns = pattern ? [pattern] : this.config.testPatterns;
    const files = [];
    
    for (const p of patterns) {
      const matches = await glob(p, { 
        ignore: ['node_modules/**', 'coverage/**', 'dist/**'] 
      });
      files.push(...matches);
    }
    
    return [...new Set(files)];
  }

  async analyzeTestStructure() {
    const files = await this.getTestFiles();
    const analysis = {
      totalFiles: files.length,
      byFramework: {},
      byDirectory: {},
      testCount: 0,
      coverage: {
        hasConfig: false,
        configured: []
      }
    };
    
    // Analyze test files
    for (const file of files) {
      const content = await readFile(file, 'utf8');
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
      if (testMatches) {
        analysis.testCount += testMatches.length;
      }
    }
    
    // Check for coverage configuration
    for (const framework of this.config.frameworks) {
      const config = this.testConfigs?.[framework];
      if (config) {
        analysis.coverage.configured.push(framework);
        if (config.coverage || config.collectCoverage) {
          analysis.coverage.hasConfig = true;
        }
      }
    }
    
    return analysis;
  }

  getStats() {
    return {
      ...this.stats,
      activeRuns: this.activeRuns.size,
      totalResults: this.results.size,
      frameworks: {
        detected: this.detectedFrameworks || [],
        configured: Object.keys(this.testConfigs || {})
      }
    };
  }

  getResults(limit = 10) {
    const results = Array.from(this.results.values())
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, limit);
    
    return results;
  }

  getResult(runId) {
    return this.results.get(runId);
  }

  async cleanup() {
    // Stop all active test runs
    for (const [runId, child] of this.activeRuns) {
      child.kill('SIGTERM');
    }
    
    this.activeRuns.clear();
    this.results.clear();
    this.removeAllListeners();
    
    console.log('🧪 Test Runner Plugin cleaned up');
  }
}

export default TestRunnerPlugin;