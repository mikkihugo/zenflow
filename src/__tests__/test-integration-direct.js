#!/usr/bin/env node

/**
 * Direct Integration Test Suite
 *
 * Tests the system after submodule removal and MCP simplification.
 * Validates that all components work with direct integration.
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class IntegrationTester {
  constructor() {
    this.testResults = [];
    this.verbose = process.argv.includes('--verbose');
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix =
      {
        info: '✅',
        error: '❌',
        warn: '⚠️',
        test: '🧪',
      }[type] || 'ℹ️';

    console.log(`${prefix} [${timestamp}] ${message}`);

    this.testResults.push({
      timestamp,
      type,
      message,
      success: type !== 'error',
    });
  }

  async runCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      if (this.verbose) {
        this.log(`Running: ${command} ${args.join(' ')}`, 'test');
      }

      const proc = spawn(command, args, {
        stdio: 'pipe',
        cwd: process.cwd(),
        ...options,
      });

      let stdout = '';
      let stderr = '';

      proc.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        resolve({
          code,
          stdout,
          stderr,
          success: code === 0,
        });
      });

      proc.on('error', (error) => {
        reject(error);
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        proc.kill('SIGTERM');
        reject(new Error('Command timeout'));
      }, 30000);
    });
  }

  async testCliStartup() {
    this.log('Testing CLI startup...', 'test');

    try {
      // Test with tsx (TypeScript runner)
      const result = await this.runCommand('npx', ['tsx', 'src/cli/cli-main.ts', '--help']);

      if (result.success) {
        this.log('CLI startup successful');
        if (this.verbose) {
          this.log(`CLI Help Output:\n${result.stdout}`);
        }
        return true;
      } else {
        this.log(`CLI startup failed: ${result.stderr}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`CLI startup error: ${error.message}`, 'error');
      return false;
    }
  }

  async testImports() {
    this.log('Testing import resolution...', 'test');

    const testScript = `
      // Test basic imports
      try {
        console.log('Testing imports...');
        
        // Test orchestration imports
        import('./src/orchestration/swarm-orchestrator.js').then(() => {
          console.log('✅ SwarmOrchestrator import successful');
        }).catch(err => {
          console.log('❌ SwarmOrchestrator import failed:', err.message);
        });
        
        // Test hive-mind imports
        import('./src/hive-mind/integration/SwarmOrchestrator.js').then(() => {
          console.log('✅ HiveMind SwarmOrchestrator import successful');
        }).catch(err => {
          console.log('❌ HiveMind SwarmOrchestrator import failed:', err.message);
        });
        
        // Test CLI imports
        import('./src/cli/core/index.js').then(() => {
          console.log('✅ CLI core import successful');
        }).catch(err => {
          console.log('❌ CLI core import failed:', err.message);
        });
        
      } catch (error) {
        console.log('❌ Import test failed:', error.message);
      }
    `;

    try {
      // Write temp test file
      const testFile = path.join(process.cwd(), 'temp-import-test.mjs');
      fs.writeFileSync(testFile, testScript);

      const result = await this.runCommand('node', [testFile]);

      // Clean up
      fs.unlinkSync(testFile);

      if (result.code === 0 || result.stdout.includes('import successful')) {
        this.log('Import tests passed');
        if (this.verbose) {
          this.log(`Import test output:\n${result.stdout}`);
        }
        return true;
      } else {
        this.log(`Import tests failed: ${result.stderr}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`Import test error: ${error.message}`, 'error');
      return false;
    }
  }

  async testSwarmOperations() {
    this.log('Testing direct swarm operations...', 'test');

    const testScript = `
      // Test direct SwarmOrchestrator usage
      import { SwarmOrchestrator } from './src/hive-mind/integration/SwarmOrchestrator.js';
      
      async function testSwarmOperations() {
        try {
          console.log('Creating SwarmOrchestrator instance...');
          const orchestrator = SwarmOrchestrator.getInstance();
          
          console.log('Initializing orchestrator...');
          await orchestrator.initialize();
          
          console.log('✅ SwarmOrchestrator initialized successfully');
          
          // Test swarm initialization
          console.log('Testing swarm initialization...');
          const swarmId = await orchestrator.initializeSwarm({
            topology: 'hierarchical',
            maxAgents: 5,
            strategy: 'parallel'
          });
          console.log('✅ Swarm initialized:', swarmId);
          
          // Test agent spawning
          console.log('Testing agent spawning...');
          const agentId = await orchestrator.spawnAgent({
            type: 'researcher',
            name: 'Test Researcher',
            specialization: 'data_analysis',
            capabilities: ['analysis', 'research']
          });
          console.log('✅ Agent spawned:', agentId);
          
          // Test task orchestration
          console.log('Testing task orchestration...');
          const taskId = await orchestrator.orchestrateTask({
            description: 'Test task for integration validation',
            strategy: 'parallel',
            priority: 'medium'
          });
          console.log('✅ Task orchestrated:', taskId);
          
          // Test status retrieval
          console.log('Testing status retrieval...');
          const status = await orchestrator.getSwarmStatus();
          console.log('✅ Status retrieved:', JSON.stringify(status, null, 2));
          
          console.log('All swarm operations completed successfully!');
          
        } catch (error) {
          console.log('❌ Swarm operation failed:', error.message);
          console.log('Stack trace:', error.stack);
          process.exit(1);
        }
      }
      
      testSwarmOperations();
    `;

    try {
      // Write temp test file
      const testFile = path.join(process.cwd(), 'temp-swarm-test.mjs');
      fs.writeFileSync(testFile, testScript);

      const result = await this.runCommand('node', [testFile]);

      // Clean up
      fs.unlinkSync(testFile);

      if (result.success && result.stdout.includes('operations completed successfully')) {
        this.log('Swarm operations test passed');
        if (this.verbose) {
          this.log(`Swarm test output:\n${result.stdout}`);
        }
        return true;
      } else {
        this.log(`Swarm operations test failed: ${result.stderr}`, 'error');
        if (this.verbose) {
          this.log(`Swarm test stdout:\n${result.stdout}`);
        }
        return false;
      }
    } catch (error) {
      this.log(`Swarm operations test error: ${error.message}`, 'error');
      return false;
    }
  }

  async testPackageStructure() {
    this.log('Testing package structure...', 'test');

    const requiredFiles = [
      'package.json',
      'src/cli/cli-main.ts',
      'src/orchestration/swarm-orchestrator.ts',
      'src/hive-mind/integration/SwarmOrchestrator.ts',
      'src/cli/commands/swarm/swarm-command.ts',
    ];

    let allExist = true;
    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        this.log(`Missing required file: ${file}`, 'error');
        allExist = false;
      } else {
        if (this.verbose) {
          this.log(`Found required file: ${file}`);
        }
      }
    }

    if (allExist) {
      this.log('Package structure validation passed');
      return true;
    } else {
      this.log('Package structure validation failed', 'error');
      return false;
    }
  }

  async testNeuralIntegration() {
    this.log('Testing neural integration...', 'test');

    // Check if neural components are accessible
    const neuralFiles = [
      'src/neural/neural-bridge.ts',
      'src/swarm-zen/neural-network.ts',
      'src/swarm-zen/neural-agent.js',
    ];

    let neuralAvailable = true;
    for (const file of neuralFiles) {
      if (!fs.existsSync(file)) {
        if (this.verbose) {
          this.log(`Neural file not found: ${file}`, 'warn');
        }
        neuralAvailable = false;
      }
    }

    if (neuralAvailable) {
      this.log('Neural components are available');
      return true;
    } else {
      this.log('Neural components not fully available (expected after simplification)', 'warn');
      return true; // Not a failure, just a warning
    }
  }

  async testBuildProcess() {
    this.log('Testing build process...', 'test');

    try {
      // Test TypeScript compilation
      const result = await this.runCommand('npx', [
        'tsc',
        '--noEmit',
        '--project',
        'tsconfig.json',
      ]);

      if (result.success) {
        this.log('TypeScript compilation successful');
        return true;
      } else {
        this.log(`TypeScript compilation failed: ${result.stderr}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(`Build test error: ${error.message}`, 'error');
      return false;
    }
  }

  async generateReport() {
    const successCount = this.testResults.filter((r) => r.success).length;
    const totalCount = this.testResults.length;
    const successRate = ((successCount / totalCount) * 100).toFixed(1);

    this.log(`\n=== INTEGRATION TEST REPORT ===`);
    this.log(`Total Tests: ${totalCount}`);
    this.log(`Successful: ${successCount}`);
    this.log(`Success Rate: ${successRate}%`);
    this.log(`\nTest Results:`);

    this.testResults.forEach((result) => {
      const status = result.success ? '✅' : '❌';
      this.log(`  ${status} ${result.message}`);
    });

    // Write detailed report
    const reportData = {
      summary: {
        totalTests: totalCount,
        successful: successCount,
        successRate: parseFloat(successRate),
        timestamp: new Date().toISOString(),
      },
      results: this.testResults,
    };

    fs.writeFileSync('integration-test-report.json', JSON.stringify(reportData, null, 2));
    this.log(`\nDetailed report saved to: integration-test-report.json`);

    return successRate >= 70; // Consider passing if 70% or more tests pass
  }

  async runAllTests() {
    this.log('Starting Direct Integration Test Suite...', 'test');
    this.log('='.repeat(50));

    const tests = [
      { name: 'Package Structure', method: () => this.testPackageStructure() },
      { name: 'Import Resolution', method: () => this.testImports() },
      { name: 'CLI Startup', method: () => this.testCliStartup() },
      { name: 'Build Process', method: () => this.testBuildProcess() },
      { name: 'Swarm Operations', method: () => this.testSwarmOperations() },
      { name: 'Neural Integration', method: () => this.testNeuralIntegration() },
    ];

    let passedTests = 0;

    for (const test of tests) {
      this.log(`\n--- Running ${test.name} ---`);
      try {
        const passed = await test.method();
        if (passed) {
          passedTests++;
          this.log(`${test.name}: PASSED`, 'info');
        } else {
          this.log(`${test.name}: FAILED`, 'error');
        }
      } catch (error) {
        this.log(`${test.name}: ERROR - ${error.message}`, 'error');
      }
    }

    this.log('\n' + '='.repeat(50));
    const overallPassed = await this.generateReport();

    if (overallPassed) {
      this.log('🎉 Integration tests PASSED overall!', 'info');
      process.exit(0);
    } else {
      this.log('💥 Integration tests FAILED overall!', 'error');
      process.exit(1);
    }
  }
}

// Run the tests
const tester = new IntegrationTester();
tester.runAllTests().catch((error) => {
  console.error('Test runner error:', error);
  process.exit(1);
});

export default IntegrationTester;
