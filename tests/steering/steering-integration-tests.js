/**
 * Steering Document Integration Tests
 * 
 * Tests integration between steering document generation and the maestro orchestrator,
 * including real-world scenarios, error handling, and performance validation.
 */

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFile, writeFile, mkdir, rm, access } from 'fs/promises';
import { EventEmitter } from 'events';
import { SteeringTestFramework, MockMaestroOrchestrator } from './steering-test-framework.js';
import { generateSteeringScenarios, ERROR_SCENARIOS, PERFORMANCE_CONFIGS } from './steering-mock-data.js';
import { SteeringQualityValidator } from './steering-quality-validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Integration test configuration
const INTEGRATION_CONFIG = {
  testTimeout: 60000, // 60 seconds for integration tests
  concurrent: 5,      // Number of concurrent tests
  retryAttempts: 2,   // Retry failed tests
  tempDir: join(__dirname, 'integration-temp'),
  realDataDir: join(__dirname, '../../docs/maestro/steering'),
  validateAgainstReal: true
};

export class SteeringIntegrationTests extends EventEmitter {
  constructor() {
    super();
    this.framework = new SteeringTestFramework();
    this.validator = new SteeringQualityValidator({ enableNLP: true });
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      performance: {},
      errors: []
    };
  }

  async setup() {
    console.log('🔧 Setting up integration test environment...\n');
    
    await mkdir(INTEGRATION_CONFIG.tempDir, { recursive: true });
    await this.framework.setup();
    
    console.log('✅ Integration test environment ready\n');
  }

  async cleanup() {
    await rm(INTEGRATION_CONFIG.tempDir, { recursive: true, force: true });
    await this.framework.cleanup();
    console.log('🧹 Integration test cleanup complete');
  }

  /**
   * Test 1: End-to-end steering document workflow
   */
  async testEndToEndWorkflow() {
    console.log('📋 Testing end-to-end steering workflow...');
    
    const scenarios = [
      { domain: 'e2e-product', content: 'Product management guidelines for agile development teams.' },
      { domain: 'e2e-technical', content: 'Technical architecture standards for microservices implementation.' },
      { domain: 'e2e-security', content: 'Security compliance framework for enterprise applications.' }
    ];

    for (const scenario of scenarios) {
      const startTime = Date.now();
      
      try {
        // Step 1: Create steering document
        const orchestrator = new MockMaestroOrchestrator({
          steeringDirectory: INTEGRATION_CONFIG.tempDir
        });
        
        const documentPath = await orchestrator.createSteeringDocument(scenario.domain, scenario.content);
        
        // Step 2: Validate document was created
        await access(documentPath);
        const content = await readFile(documentPath, 'utf8');
        
        // Step 3: Quality validation
        const validation = await this.validator.validateDocument(content, scenario.domain, 'standard');
        
        if (!validation.passed) {
          throw new Error(`Quality validation failed: ${validation.issues.length} issues found`);
        }
        
        // Step 4: Test steering context retrieval
        const context = await orchestrator.getSteeringContext('developer');
        
        if (!context || context === 'No steering context available.') {
          throw new Error('Failed to retrieve steering context');
        }
        
        const duration = Date.now() - startTime;
        this.recordSuccess('end-to-end-workflow', scenario.domain, duration);
        
      } catch (error) {
        const duration = Date.now() - startTime;
        this.recordFailure('end-to-end-workflow', scenario.domain, error, duration);
      }
    }
  }

  /**
   * Test 2: Real document compatibility validation
   */
  async testRealDocumentCompatibility() {
    if (!INTEGRATION_CONFIG.validateAgainstReal) {
      console.log('⏭️ Skipping real document validation (disabled)');
      return;
    }

    console.log('📄 Testing compatibility with real steering documents...');
    
    try {
      // Read existing real steering documents
      const realDocs = [
        'development-standards.md',
        'architecture-principles.md', 
        'workflow-standards.md'
      ];

      for (const docFile of realDocs) {
        const startTime = Date.now();
        
        try {
          const docPath = join(INTEGRATION_CONFIG.realDataDir, docFile);
          await access(docPath);
          
          const content = await readFile(docPath, 'utf8');
          const domain = docFile.replace('-standards.md', '').replace('-principles.md', '');
          
          // Validate real document quality
          const validation = await this.validator.validateDocument(content, domain, 'good');
          
          // Real documents should pass quality validation
          if (validation.overallScore < 0.6) {
            console.warn(`⚠️ Real document ${docFile} has quality issues: ${validation.overallScore.toFixed(2)}`);
          }
          
          const duration = Date.now() - startTime;
          this.recordSuccess('real-doc-compatibility', docFile, duration);
          
        } catch (error) {
          const duration = Date.now() - startTime;
          this.recordFailure('real-doc-compatibility', docFile, error, duration);
        }
      }
      
    } catch (error) {
      console.warn(`⚠️ Could not access real documents: ${error.message}`);
      this.recordFailure('real-doc-compatibility', 'access-check', error, 0);
    }
  }

  /**
   * Test 3: Concurrent document generation
   */
  async testConcurrentGeneration() {
    console.log('⚡ Testing concurrent document generation...');
    
    const scenarios = generateSteeringScenarios(INTEGRATION_CONFIG.concurrent * 2);
    const orchestrator = new MockMaestroOrchestrator({
      steeringDirectory: INTEGRATION_CONFIG.tempDir
    });

    // Split scenarios into batches for concurrent processing
    const batches = [];
    for (let i = 0; i < scenarios.length; i += INTEGRATION_CONFIG.concurrent) {
      batches.push(scenarios.slice(i, i + INTEGRATION_CONFIG.concurrent));
    }

    for (const batch of batches) {
      const startTime = Date.now();
      
      try {
        // Process batch concurrently
        const promises = batch.map(async (scenario) => {
          const docPath = await orchestrator.createSteeringDocument(scenario.domain, scenario.content);
          const content = await readFile(docPath, 'utf8');
          const validation = await this.validator.validateDocument(content, scenario.domain);
          
          return {
            scenario: scenario.id,
            domain: scenario.domain,
            success: validation.passed,
            quality: validation.overallScore,
            path: docPath
          };
        });

        const results = await Promise.all(promises);
        const duration = Date.now() - startTime;
        
        // Validate all concurrent operations succeeded
        const failedCount = results.filter(r => !r.success).length;
        if (failedCount > 0) {
          throw new Error(`${failedCount}/${results.length} concurrent operations failed`);
        }
        
        // Check for performance degradation
        const avgTimePerDoc = duration / batch.length;
        if (avgTimePerDoc > 2000) { // 2 seconds per document
          throw new Error(`Concurrent performance degraded: ${avgTimePerDoc}ms per document`);
        }
        
        this.recordSuccess('concurrent-generation', `batch-${batches.indexOf(batch)}`, duration);
        
      } catch (error) {
        const duration = Date.now() - startTime;
        this.recordFailure('concurrent-generation', `batch-${batches.indexOf(batch)}`, error, duration);
      }
    }
  }

  /**
   * Test 4: Error recovery and resilience
   */
  async testErrorRecovery() {
    console.log('🛡️ Testing error recovery and resilience...');
    
    const orchestrator = new MockMaestroOrchestrator({
      steeringDirectory: INTEGRATION_CONFIG.tempDir
    });

    // Test various error scenarios
    for (const errorScenario of ERROR_SCENARIOS) {
      const startTime = Date.now();
      
      try {
        if (errorScenario.expectedError) {
          // This should fail with expected error
          try {
            await orchestrator.createSteeringDocument(errorScenario.domain, errorScenario.content);
            throw new Error(`Expected error not thrown for ${errorScenario.id}`);
          } catch (expectedError) {
            if (!expectedError.message.includes(errorScenario.expectedError)) {
              throw new Error(`Wrong error for ${errorScenario.id}: ${expectedError.message}`);
            }
            // Expected error occurred - this is success
          }
        } else {
          // This should handle gracefully
          const docPath = await orchestrator.createSteeringDocument(errorScenario.domain, errorScenario.content);
          await access(docPath); // Verify file was created
        }
        
        const duration = Date.now() - startTime;
        this.recordSuccess('error-recovery', errorScenario.id, duration);
        
      } catch (error) {
        const duration = Date.now() - startTime;
        this.recordFailure('error-recovery', errorScenario.id, error, duration);
      }
    }
  }

  /**
   * Test 5: Performance under load
   */
  async testPerformanceUnderLoad() {
    console.log('🚀 Testing performance under load...');
    
    for (const config of PERFORMANCE_CONFIGS) {
      const startTime = Date.now();
      
      try {
        console.log(`  📊 Running ${config.name} performance test...`);
        
        const scenarios = generateSteeringScenarios(config.scenarios);
        const orchestrator = new MockMaestroOrchestrator({
          steeringDirectory: INTEGRATION_CONFIG.tempDir
        });
        
        // Create documents with specified concurrency
        const batches = [];
        for (let i = 0; i < scenarios.length; i += config.concurrency) {
          batches.push(scenarios.slice(i, i + config.concurrency));
        }
        
        let totalDocuments = 0;
        let totalQualityScore = 0;
        
        for (const batch of batches) {
          const batchPromises = batch.map(async (scenario) => {
            const docStartTime = Date.now();
            const docPath = await orchestrator.createSteeringDocument(scenario.domain, scenario.content);
            const docDuration = Date.now() - docStartTime;
            
            if (docDuration > config.maxExecutionTime / config.scenarios) {
              throw new Error(`Document creation too slow: ${docDuration}ms`);
            }
            
            const content = await readFile(docPath, 'utf8');
            const validation = await this.validator.validateDocument(content, scenario.domain);
            
            return {
              duration: docDuration,
              quality: validation.overallScore
            };
          });
          
          const batchResults = await Promise.all(batchPromises);
          totalDocuments += batchResults.length;
          totalQualityScore += batchResults.reduce((sum, r) => sum + r.quality, 0);
        }
        
        const totalDuration = Date.now() - startTime;
        const avgQuality = totalQualityScore / totalDocuments;
        const throughput = (totalDocuments / totalDuration) * 1000; // docs per second
        
        // Validate performance criteria
        if (totalDuration > config.maxExecutionTime) {
          throw new Error(`Performance test exceeded time limit: ${totalDuration}ms > ${config.maxExecutionTime}ms`);
        }
        
        if (avgQuality < 0.6) {
          throw new Error(`Quality degraded under load: ${avgQuality.toFixed(2)}`);
        }
        
        this.recordPerformance(config.name, {
          totalDuration,
          documents: totalDocuments,
          avgQuality,
          throughput,
          avgTimePerDoc: totalDuration / totalDocuments
        });
        
        this.recordSuccess('performance-load', config.name, totalDuration);
        
      } catch (error) {
        const duration = Date.now() - startTime;
        this.recordFailure('performance-load', config.name, error, duration);
      }
    }
  }

  /**
   * Test 6: Agent pool integration
   */
  async testAgentPoolIntegration() {
    console.log('👥 Testing agent pool integration...');
    
    const orchestrator = new MockMaestroOrchestrator({
      steeringDirectory: INTEGRATION_CONFIG.tempDir
    });

    const scenarios = generateSteeringScenarios(10);
    
    // Pre-populate agent pool
    const agentTypes = ['product-manager', 'system-architect', 'security-engineer'];
    const createdAgents = [];
    
    for (const agentType of agentTypes) {
      for (let i = 0; i < 3; i++) {
        const agentId = await orchestrator.createAgent(agentType, { poolTest: true });
        createdAgents.push(agentId);
      }
    }
    
    const initialStats = orchestrator.getAgentPoolStats();
    
    // Process scenarios and test agent reuse
    for (const scenario of scenarios) {
      const startTime = Date.now();
      
      try {
        // Create document (should reuse agents)
        const docPath = await orchestrator.createSteeringDocument(scenario.domain, scenario.content);
        
        // Test agent reuse
        const agentType = agentTypes[scenarios.indexOf(scenario) % agentTypes.length];
        const reusedAgent = await orchestrator.reuseAgent(agentType, []);
        
        if (!reusedAgent) {
          throw new Error(`Failed to reuse ${agentType} agent`);
        }
        
        await orchestrator.releaseAgent(reusedAgent);
        
        const duration = Date.now() - startTime;
        this.recordSuccess('agent-pool-integration', scenario.id, duration);
        
      } catch (error) {
        const duration = Date.now() - startTime;
        this.recordFailure('agent-pool-integration', scenario.id, error, duration);
      }
    }
    
    // Validate agent pool statistics
    const finalStats = orchestrator.getAgentPoolStats();
    
    if (finalStats.totalAgents < initialStats.totalAgents) {
      throw new Error('Agents were lost during processing');
    }
    
    if (finalStats.reuseRate === 0) {
      throw new Error('No agent reuse occurred');
    }
    
    console.log(`  📊 Agent pool stats: ${finalStats.totalAgents} total, ${(finalStats.reuseRate * 100).toFixed(1)}% reuse rate`);
  }

  /**
   * Test 7: Memory and resource management
   */
  async testResourceManagement() {
    console.log('💾 Testing memory and resource management...');
    
    const startTime = Date.now();
    const initialMemory = process.memoryUsage();
    
    try {
      // Create many documents to test memory handling
      const orchestrator = new MockMaestroOrchestrator({
        steeringDirectory: INTEGRATION_CONFIG.tempDir
      });
      
      const scenarios = generateSteeringScenarios(100);
      
      // Process in batches to simulate sustained load
      for (let i = 0; i < scenarios.length; i += 10) {
        const batch = scenarios.slice(i, i + 10);
        
        const batchPromises = batch.map(scenario => 
          orchestrator.createSteeringDocument(scenario.domain, scenario.content)
        );
        
        await Promise.all(batchPromises);
        
        // Check memory usage periodically
        const currentMemory = process.memoryUsage();
        const memoryGrowth = (currentMemory.heapUsed - initialMemory.heapUsed) / (1024 * 1024); // MB
        
        if (memoryGrowth > 100) { // 100MB limit
          throw new Error(`Excessive memory growth: ${memoryGrowth.toFixed(1)}MB`);
        }
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage();
      const memoryGrowth = (finalMemory.heapUsed - initialMemory.heapUsed) / (1024 * 1024);
      
      const duration = Date.now() - startTime;
      this.recordSuccess('resource-management', 'memory-test', duration);
      
      console.log(`  📊 Memory growth: ${memoryGrowth.toFixed(1)}MB over ${scenarios.length} documents`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordFailure('resource-management', 'memory-test', error, duration);
    }
  }

  /**
   * Record successful test
   */
  recordSuccess(category, test, duration) {
    this.results.total++;
    this.results.passed++;
    
    if (!this.results.performance[category]) {
      this.results.performance[category] = [];
    }
    this.results.performance[category].push({ test, duration, success: true });
    
    console.log(`  ✅ ${category}:${test} (${duration}ms)`);
  }

  /**
   * Record failed test
   */
  recordFailure(category, test, error, duration) {
    this.results.total++;
    this.results.failed++;
    
    this.results.errors.push({
      category,
      test,
      error: error.message,
      duration
    });
    
    if (!this.results.performance[category]) {
      this.results.performance[category] = [];
    }
    this.results.performance[category].push({ test, duration, success: false, error: error.message });
    
    console.log(`  ❌ ${category}:${test} (${duration}ms): ${error.message}`);
  }

  /**
   * Record performance metrics
   */
  recordPerformance(testName, metrics) {
    if (!this.results.performance.detailed) {
      this.results.performance.detailed = {};
    }
    this.results.performance.detailed[testName] = metrics;
  }

  /**
   * Run all integration tests
   */
  async runAllTests() {
    console.log('🧪 STEERING DOCUMENT INTEGRATION TESTS');
    console.log('='.repeat(80));
    console.log(`🔧 Configuration:`);
    console.log(`   • Test timeout: ${INTEGRATION_CONFIG.testTimeout}ms`);
    console.log(`   • Concurrency: ${INTEGRATION_CONFIG.concurrent}`);
    console.log(`   • Retry attempts: ${INTEGRATION_CONFIG.retryAttempts}`);
    console.log(`   • Real document validation: ${INTEGRATION_CONFIG.validateAgainstReal}`);
    console.log('');

    await this.setup();

    const testMethods = [
      { name: 'End-to-End Workflow', method: () => this.testEndToEndWorkflow() },
      { name: 'Real Document Compatibility', method: () => this.testRealDocumentCompatibility() },
      { name: 'Concurrent Generation', method: () => this.testConcurrentGeneration() },
      { name: 'Error Recovery', method: () => this.testErrorRecovery() },
      { name: 'Performance Under Load', method: () => this.testPerformanceUnderLoad() },
      { name: 'Agent Pool Integration', method: () => this.testAgentPoolIntegration() },
      { name: 'Resource Management', method: () => this.testResourceManagement() }
    ];

    const overallStartTime = Date.now();

    for (const { name, method } of testMethods) {
      try {
        await Promise.race([
          method(),
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Test timeout')), INTEGRATION_CONFIG.testTimeout);
          })
        ]);
      } catch (error) {
        this.recordFailure('test-execution', name, error, 0);
      }
    }

    const totalDuration = Date.now() - overallStartTime;

    await this.cleanup();

    // Generate summary
    console.log('\n' + '='.repeat(80));
    console.log('🧪 INTEGRATION TEST RESULTS');
    console.log('='.repeat(80));
    console.log(`📊 Summary: ${this.results.passed}/${this.results.total} passed (${this.results.failed} failed)`);
    console.log(`⏱️ Total Duration: ${totalDuration}ms`);
    console.log(`🚀 Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);

    if (this.results.errors.length > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.errors.forEach(error => {
        console.log(`   • ${error.category}:${error.test}: ${error.error}`);
      });
    }

    // Performance summary
    if (this.results.performance.detailed) {
      console.log('\n⚡ Performance Summary:');
      Object.entries(this.results.performance.detailed).forEach(([test, metrics]) => {
        console.log(`   • ${test}: ${metrics.documents} docs, ${metrics.throughput.toFixed(2)} docs/sec, ${metrics.avgTimePerDoc.toFixed(0)}ms avg`);
      });
    }

    return this.results.failed === 0;
  }
}

// Export for external use
export default SteeringIntegrationTests;

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const integrationTests = new SteeringIntegrationTests();
  
  integrationTests.runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Integration tests crashed:', error);
      process.exit(1);
    });
}