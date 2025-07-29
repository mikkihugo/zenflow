#!/usr/bin/env node

/**
 * Comprehensive Test Framework for Steering Document Generation
 * 
 * This standalone test framework validates steering functionality independent 
 * of the main build system, focusing on document generation, quality validation,
 * agent reuse, and error handling.
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFile, writeFile, mkdir, rm, access, stat } from 'fs/promises';
import { createHash } from 'crypto';
import { EventEmitter } from 'events';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test framework configuration
const TEST_CONFIG = {
  testDataDir: join(__dirname, 'test-data'),
  mockSteeringDir: join(__dirname, 'mock-steering'),
  outputDir: join(__dirname, 'test-output'),
  tempDir: join(__dirname, 'temp'),
  maxTestDuration: 30000, // 30 seconds per test
  retryAttempts: 3,
  parallelTests: true
};

// Test result tracking
class TestResults {
  constructor() {
    this.total = 0;
    this.passed = 0;
    this.failed = 0;
    this.skipped = 0;
    this.errors = [];
    this.performance = {};
    this.startTime = Date.now();
  }

  pass(testName, duration = 0) {
    this.total++;
    this.passed++;
    this.performance[testName] = duration;
    console.log(`✅ ${testName} (${duration}ms)`);
  }

  fail(testName, error, duration = 0) {
    this.total++;
    this.failed++;
    this.errors.push({ testName, error: error.message, stack: error.stack });
    this.performance[testName] = duration;
    console.log(`❌ ${testName} (${duration}ms): ${error.message}`);
  }

  skip(testName, reason) {
    this.total++;
    this.skipped++;
    console.log(`⏭️ ${testName}: ${reason}`);
  }

  summary() {
    const totalDuration = Date.now() - this.startTime;
    console.log('\n' + '='.repeat(80));
    console.log('🧪 STEERING TEST FRAMEWORK RESULTS');
    console.log('='.repeat(80));
    console.log(`📊 Summary: ${this.passed}/${this.total} passed (${this.failed} failed, ${this.skipped} skipped)`);
    console.log(`⏱️ Total Duration: ${totalDuration}ms`);
    console.log(`🚀 Success Rate: ${((this.passed / this.total) * 100).toFixed(1)}%`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ Failed Tests:');
      this.errors.forEach(({ testName, error }) => {
        console.log(`   • ${testName}: ${error}`);
      });
    }

    // Performance analysis
    const avgDuration = Object.values(this.performance).reduce((a, b) => a + b, 0) / Object.keys(this.performance).length;
    console.log(`\n⚡ Performance: Average ${avgDuration.toFixed(1)}ms per test`);
    
    return this.failed === 0;
  }
}

// Mock steering document templates
const STEERING_TEMPLATES = {
  'product': {
    title: 'Product Management Steering Document',
    sections: ['Product Vision', 'User Experience Standards', 'Feature Prioritization', 'Quality Gates'],
    content: `# Product Management Steering Document

## Product Vision
Define clear product vision and strategic objectives that guide all development decisions.

## User Experience Standards  
Establish consistent UX patterns and usability requirements across all features.

## Feature Prioritization
Framework for evaluating and prioritizing feature requests based on user value and business impact.

## Quality Gates
Quality criteria that all features must meet before release to ensure user satisfaction.`
  },

  'technical': {
    title: 'Technical Architecture Steering Document',
    sections: ['Architecture Principles', 'Technology Stack', 'Performance Standards', 'Security Requirements'],
    content: `# Technical Architecture Steering Document

## Architecture Principles
Core architectural principles including scalability, maintainability, and modularity.

## Technology Stack
Approved technologies, frameworks, and tools for different types of implementations.

## Performance Standards  
Performance benchmarks and optimization requirements for system components.

## Security Requirements
Comprehensive security standards including authentication, authorization, and data protection.`
  },

  'workflow': {
    title: 'Development Workflow Steering Document',
    sections: ['Development Process', 'Code Review Standards', 'Testing Requirements', 'Deployment Procedures'],
    content: `# Development Workflow Steering Document

## Development Process
Standardized development workflow including planning, implementation, and validation phases.

## Code Review Standards
Requirements and criteria for code reviews including quality gates and approval processes.

## Testing Requirements
Comprehensive testing standards including unit, integration, and end-to-end testing.

## Deployment Procedures
Standardized deployment processes including staging, validation, and rollback procedures.`
  }
};

// Mock scenarios for testing different steering document types
const MOCK_SCENARIOS = [
  {
    id: 'basic-product-steering',
    domain: 'product',
    content: 'Guidelines for product development and user experience standards.',
    expectedSections: ['Product Vision', 'User Experience', 'Feature Planning'],
    complexity: 'low',
    agents: ['product-manager', 'ux-designer']
  },
  {
    id: 'technical-architecture-steering',
    domain: 'technical',
    content: 'Technical architecture principles and implementation standards for scalable systems.',
    expectedSections: ['Architecture', 'Technology Stack', 'Performance', 'Security'],
    complexity: 'high',
    agents: ['system-architect', 'technical-lead', 'security-engineer']
  },
  {
    id: 'workflow-optimization-steering', 
    domain: 'workflow',
    content: 'Development workflow optimization and process improvement guidelines.',
    expectedSections: ['Process Standards', 'Quality Gates', 'Automation'],
    complexity: 'medium',
    agents: ['process-engineer', 'quality-assurance']
  },
  {
    id: 'security-compliance-steering',
    domain: 'security',
    content: 'Security compliance framework and regulatory requirements for enterprise systems.',
    expectedSections: ['Compliance Framework', 'Security Controls', 'Audit Requirements'],
    complexity: 'high',
    agents: ['security-architect', 'compliance-officer', 'audit-specialist']
  },
  {
    id: 'performance-optimization-steering',
    domain: 'performance',
    content: 'Performance optimization strategies and monitoring standards.',
    expectedSections: ['Performance Metrics', 'Optimization Strategies', 'Monitoring'],
    complexity: 'medium',
    agents: ['performance-engineer', 'monitoring-specialist']
  }
];

// Mock MaestroOrchestrator for testing
class MockMaestroOrchestrator extends EventEmitter {
  constructor(options = {}) {
    super();
    this.config = {
      enableHiveMind: options.enableHiveMind ?? true,
      consensusThreshold: options.consensusThreshold ?? 0.66,
      maxAgents: options.maxAgents ?? 8,
      steeringDirectory: options.steeringDirectory ?? TEST_CONFIG.mockSteeringDir
    };
    this.agentPool = new Map();
    this.steeringDocuments = new Map();
    this.performanceMetrics = {
      createSteeringDocument: [],
      agentReuse: [],
      validationTime: []
    };
  }

  async createSteeringDocument(domain, content) {
    const startTime = Date.now();
    
    try {
      // Validate input
      if (!domain || typeof domain !== 'string') {
        throw new Error('Domain must be a non-empty string');
      }
      
      if (!content || typeof content !== 'string') {
        throw new Error('Content must be a non-empty string');
      }

      // Ensure steering directory exists
      await mkdir(this.config.steeringDirectory, { recursive: true });

      // Generate document content with template
      const template = STEERING_TEMPLATES[domain] || {
        title: `${domain.charAt(0).toUpperCase() + domain.slice(1)} Steering Document`,
        sections: ['Guidelines', 'Standards', 'Best Practices'],
        content: content
      };

      const steeringContent = `# ${template.title}

## Overview

${content}

## Guidelines

${template.sections.map(section => `### ${section}

[Provide specific guidelines for ${section.toLowerCase()}]`).join('\n\n')}

## Implementation Standards

- Follow established patterns and conventions
- Ensure consistency with existing documentation
- Maintain quality and completeness standards
- Regular review and updates as needed

## Quality Assurance

- Document review process
- Validation criteria
- Approval workflow
- Version control and change management

---

*Generated by Maestro Steering Document Framework*
*Created: ${new Date().toISOString()}*
*Domain: ${domain}*
*Version: 1.0*
`;

      // Save to file system
      const steeringPath = join(this.config.steeringDirectory, `${domain}.md`);
      await writeFile(steeringPath, steeringContent, 'utf8');

      // Store in memory for validation
      this.steeringDocuments.set(domain, {
        path: steeringPath,
        content: steeringContent,
        created: new Date(),
        domain,
        sections: template.sections,
        metadata: {
          wordCount: steeringContent.split(/\s+/).length,
          sectionCount: template.sections.length,
          checksum: createHash('md5').update(steeringContent).digest('hex')
        }
      });

      const duration = Date.now() - startTime;
      this.performanceMetrics.createSteeringDocument.push(duration);

      // Emit event for testing hooks
      this.emit('steering:document_created', { domain, path: steeringPath, duration });

      return steeringPath;

    } catch (error) {
      const duration = Date.now() - startTime;
      this.performanceMetrics.createSteeringDocument.push(duration);
      throw error;
    }
  }

  async getSteeringContext(agentType, filePath) {
    let context = '';
    const steeringFiles = ['product.md', 'technical.md', 'workflow.md'];
    
    for (const file of steeringFiles) {
      try {
        const content = await readFile(join(this.config.steeringDirectory, file), 'utf8');
        context += content + '\n\n---\n\n';
      } catch (error) {
        // File doesn't exist, continue
      }
    }
    
    return context || 'No steering context available.';
  }

  // Mock agent management for testing agent reuse
  async createAgent(type, profile) {
    const agentId = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.agentPool.set(agentId, {
      id: agentId,
      type,
      profile,
      status: 'available',
      created: Date.now(),
      usageCount: 0
    });

    return agentId;
  }

  async reuseAgent(type, capabilities) {
    const startTime = Date.now();
    
    // Find available agent with matching type and capabilities
    for (const [agentId, agent] of this.agentPool) {
      if (agent.type === type && agent.status === 'available') {
        agent.status = 'busy';
        agent.usageCount++;
        
        const duration = Date.now() - startTime;
        this.performanceMetrics.agentReuse.push(duration);
        
        return agentId;
      }
    }
    
    // No reusable agent found
    return null;
  }

  async releaseAgent(agentId) {
    const agent = this.agentPool.get(agentId);
    if (agent) {
      agent.status = 'available';
    }
  }

  getAgentPoolStats() {
    const agents = Array.from(this.agentPool.values());
    return {
      totalAgents: agents.length,
      availableAgents: agents.filter(a => a.status === 'available').length,
      busyAgents: agents.filter(a => a.status === 'busy').length,
      averageUsage: agents.length > 0 ? agents.reduce((sum, a) => sum + a.usageCount, 0) / agents.length : 0,
      reuseRate: agents.length > 0 ? agents.filter(a => a.usageCount > 1).length / agents.length : 0
    };
  }

  getPerformanceMetrics() {
    return this.performanceMetrics;
  }
}

// Test suite implementation
class SteeringTestFramework {
  constructor() {
    this.results = new TestResults();
    this.orchestrator = null;
    this.setupComplete = false;
  }

  async setup() {
    if (this.setupComplete) return;

    console.log('🔧 Setting up steering test framework...\n');

    try {
      // Create test directories
      await mkdir(TEST_CONFIG.testDataDir, { recursive: true });
      await mkdir(TEST_CONFIG.mockSteeringDir, { recursive: true });
      await mkdir(TEST_CONFIG.outputDir, { recursive: true });
      await mkdir(TEST_CONFIG.tempDir, { recursive: true });

      // Initialize mock orchestrator
      this.orchestrator = new MockMaestroOrchestrator({
        steeringDirectory: TEST_CONFIG.mockSteeringDir
      });

      this.setupComplete = true;
      console.log('✅ Test framework setup complete\n');

    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      throw error;
    }
  }

  async cleanup() {
    try {
      // Clean up test directories
      await rm(TEST_CONFIG.mockSteeringDir, { recursive: true, force: true });
      await rm(TEST_CONFIG.outputDir, { recursive: true, force: true });
      await rm(TEST_CONFIG.tempDir, { recursive: true, force: true });
      
      console.log('\n🧹 Test cleanup complete');
    } catch (error) {
      console.warn('⚠️ Cleanup warning:', error.message);
    }
  }

  async runTest(testName, testFunction) {
    const startTime = Date.now();
    
    try {
      await Promise.race([
        testFunction(),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Test timeout')), TEST_CONFIG.maxTestDuration);
        })
      ]);
      
      const duration = Date.now() - startTime;
      this.results.pass(testName, duration);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.fail(testName, error, duration);
    }
  }

  // Test 1: Basic steering document creation
  async testBasicSteeringCreation() {
    const domain = 'test-basic';
    const content = 'Basic test content for steering document validation.';
    
    const steeringPath = await this.orchestrator.createSteeringDocument(domain, content);
    
    // Validate file exists
    await access(steeringPath);
    
    // Validate content
    const fileContent = await readFile(steeringPath, 'utf8');
    if (!fileContent.includes(content)) {
      throw new Error('Generated content does not include original content');
    }
    
    if (!fileContent.includes('Steering Document')) {
      throw new Error('Generated content missing steering document header');
    }
  }

  // Test 2: Multiple domain steering documents
  async testMultipleDomainSteering() {
    const domains = ['product', 'technical', 'workflow'];
    const results = [];
    
    for (const domain of domains) {
      const content = `Guidelines for ${domain} domain development and best practices.`;
      const steeringPath = await this.orchestrator.createSteeringDocument(domain, content);
      
      // Validate each document
      const fileContent = await readFile(steeringPath, 'utf8');
      results.push({
        domain,
        path: steeringPath,
        wordCount: fileContent.split(/\s+/).length,
        hasGuidelines: fileContent.includes('Guidelines'),
        hasOverview: fileContent.includes('Overview')
      });
    }
    
    // Validate all documents were created with proper structure
    if (results.length !== domains.length) {
      throw new Error(`Expected ${domains.length} documents, got ${results.length}`);
    }
    
    results.forEach(result => {
      if (!result.hasGuidelines || !result.hasOverview) {
        throw new Error(`Document ${result.domain} missing required sections`);
      }
      if (result.wordCount < 50) {
        throw new Error(`Document ${result.domain} too short (${result.wordCount} words)`);
      }
    });
  }

  // Test 3: Steering document quality validation
  async testSteeringDocumentQuality() {
    const testCases = [
      {
        domain: 'quality-test-1',
        content: 'Short content.',
        expectedQuality: 'low'
      },
      {
        domain: 'quality-test-2', 
        content: 'This is a comprehensive steering document with detailed guidelines, best practices, implementation standards, quality assurance procedures, and extensive documentation covering all aspects of the domain with specific examples and actionable recommendations.',
        expectedQuality: 'high'
      },
      {
        domain: 'quality-test-3',
        content: 'Medium length content with some guidelines and standards for development practices including code review processes and testing requirements.',
        expectedQuality: 'medium'
      }
    ];

    for (const testCase of testCases) {
      const steeringPath = await this.orchestrator.createSteeringDocument(testCase.domain, testCase.content);
      const document = this.orchestrator.steeringDocuments.get(testCase.domain);
      
      // Validate quality metrics
      const wordCount = document.metadata.wordCount;
      const sectionCount = document.metadata.sectionCount;
      
      let actualQuality;
      if (wordCount < 100 && sectionCount < 3) {
        actualQuality = 'low';
      } else if (wordCount > 300 && sectionCount >= 4) {
        actualQuality = 'high';
      } else {
        actualQuality = 'medium';
      }
      
      if (actualQuality !== testCase.expectedQuality) {
        throw new Error(`Quality mismatch for ${testCase.domain}: expected ${testCase.expectedQuality}, got ${actualQuality}`);
      }
    }
  }

  // Test 4: Format validation
  async testSteeringDocumentFormat() {
    const domain = 'format-test';
    const content = 'Test content for format validation with specific requirements.';
    
    await this.orchestrator.createSteeringDocument(domain, content);
    const document = this.orchestrator.steeringDocuments.get(domain);
    const fileContent = document.content;
    
    // Validate markdown format
    const requiredElements = [
      /^# .+ Steering Document/m,     // Main heading
      /## Overview/m,                 // Overview section
      /## Guidelines/m,               // Guidelines section
      /## Implementation Standards/m, // Implementation section
      /## Quality Assurance/m,        // Quality section
      /\*Generated by Maestro/m,      // Footer
      /\*Created: \d{4}-\d{2}-\d{2}/m // Timestamp
    ];
    
    requiredElements.forEach((pattern, index) => {
      if (!pattern.test(fileContent)) {
        throw new Error(`Missing required format element ${index + 1}: ${pattern}`);
      }
    });
    
    // Validate structure
    const lines = fileContent.split('\n');
    const headingLines = lines.filter(line => line.match(/^#+\s/));
    
    if (headingLines.length < 4) {
      throw new Error(`Insufficient headings: expected at least 4, got ${headingLines.length}`);
    }
  }

  // Test 5: Agent reuse validation
  async testAgentReuse() {
    const scenarios = MOCK_SCENARIOS.slice(0, 3); // Test with first 3 scenarios
    const agentStats = [];
    
    for (const scenario of scenarios) {
      // Create agents for scenario
      const agentIds = [];
      for (const agentType of scenario.agents) {
        const agentId = await this.orchestrator.createAgent(agentType, { scenario: scenario.id });
        agentIds.push(agentId);
      }
      
      // Test agent reuse
      for (const agentType of scenario.agents) {
        const reusedAgentId = await this.orchestrator.reuseAgent(agentType, []);
        if (!reusedAgentId) {
          throw new Error(`Failed to reuse agent of type ${agentType}`);
        }
        await this.orchestrator.releaseAgent(reusedAgentId);
      }
      
      agentStats.push({
        scenario: scenario.id,
        agentsCreated: agentIds.length,
        agentsReused: scenario.agents.length
      });
    }
    
    // Validate agent pool statistics
    const poolStats = this.orchestrator.getAgentPoolStats();
    
    if (poolStats.totalAgents === 0) {
      throw new Error('No agents in pool after testing');
    }
    
    if (poolStats.reuseRate === 0) {
      throw new Error('Agent reuse rate is 0, indicating no reuse occurred');
    }
    
    // Validate all agents are available after testing
    if (poolStats.availableAgents !== poolStats.totalAgents) {
      throw new Error(`Not all agents available: ${poolStats.availableAgents}/${poolStats.totalAgents}`);
    }
  }

  // Test 6: Error handling validation
  async testErrorHandling() {
    const errorTests = [
      {
        name: 'null domain',
        domain: null,
        content: 'Valid content',
        expectedError: 'Domain must be a non-empty string'
      },
      {
        name: 'empty domain',
        domain: '',
        content: 'Valid content',
        expectedError: 'Domain must be a non-empty string'
      },
      {
        name: 'null content',
        domain: 'valid-domain',
        content: null,
        expectedError: 'Content must be a non-empty string'
      },
      {
        name: 'empty content',
        domain: 'valid-domain',
        content: '',
        expectedError: 'Content must be a non-empty string'
      },
      {
        name: 'invalid domain characters',
        domain: 'invalid/domain\\name',
        content: 'Valid content',
        expectedError: null // Should handle gracefully
      }
    ];

    let errorsHandled = 0;
    
    for (const errorTest of errorTests) {
      try {
        await this.orchestrator.createSteeringDocument(errorTest.domain, errorTest.content);
        
        if (errorTest.expectedError) {
          throw new Error(`Expected error "${errorTest.expectedError}" but operation succeeded for ${errorTest.name}`);
        }
        
      } catch (error) {
        if (!errorTest.expectedError) {
          throw new Error(`Unexpected error for ${errorTest.name}: ${error.message}`);
        }
        
        if (!error.message.includes(errorTest.expectedError)) {
          throw new Error(`Wrong error for ${errorTest.name}: expected "${errorTest.expectedError}", got "${error.message}"`);
        }
        
        errorsHandled++;
      }
    }
    
    if (errorsHandled === 0) {
      throw new Error('No error conditions were properly handled');
    }
  }

  // Test 7: Performance benchmarks
  async testPerformanceBenchmarks() {
    const benchmarkTests = [
      { domain: 'perf-small', content: 'Small content for performance testing.', expectedMaxTime: 100 },
      { domain: 'perf-medium', content: 'Medium content '.repeat(50) + 'for performance testing with more substantial content.', expectedMaxTime: 200 },
      { domain: 'perf-large', content: 'Large content '.repeat(200) + 'for performance testing with extensive content and multiple sections.', expectedMaxTime: 500 }
    ];

    const performanceResults = [];
    
    for (const test of benchmarkTests) {
      const startTime = Date.now();
      await this.orchestrator.createSteeringDocument(test.domain, test.content);
      const duration = Date.now() - startTime;
      
      performanceResults.push({
        test: test.domain,
        duration,
        expectedMaxTime: test.expectedMaxTime,
        passed: duration <= test.expectedMaxTime
      });
      
      if (duration > test.expectedMaxTime) {
        throw new Error(`Performance test ${test.domain} exceeded max time: ${duration}ms > ${test.expectedMaxTime}ms`);
      }
    }
    
    // Validate overall performance metrics
    const metrics = this.orchestrator.getPerformanceMetrics();
    const avgCreateTime = metrics.createSteeringDocument.reduce((a, b) => a + b, 0) / metrics.createSteeringDocument.length;
    
    if (avgCreateTime > 300) {
      throw new Error(`Average creation time too high: ${avgCreateTime}ms`);
    }
  }

  // Test 8: Integration with mock scenarios
  async testMockScenarios() {
    const results = [];
    
    for (const scenario of MOCK_SCENARIOS) {
      const startTime = Date.now();
      
      // Create steering document for scenario
      const steeringPath = await this.orchestrator.createSteeringDocument(scenario.domain, scenario.content);
      
      // Validate scenario-specific requirements
      const document = this.orchestrator.steeringDocuments.get(scenario.domain);
      const fileContent = document.content;
      
      // Check expected sections are present
      const missingSections = scenario.expectedSections.filter(section => 
        !fileContent.toLowerCase().includes(section.toLowerCase())
      );
      
      if (missingSections.length > 0) {
        throw new Error(`Missing expected sections in ${scenario.id}: ${missingSections.join(', ')}`);
      }
      
      // Validate complexity handling
      const wordCount = document.metadata.wordCount;
      let expectedMinWords;
      
      switch (scenario.complexity) {
        case 'low': expectedMinWords = 100; break;
        case 'medium': expectedMinWords = 200; break;
        case 'high': expectedMinWords = 300; break;
        default: expectedMinWords = 150;
      }
      
      if (wordCount < expectedMinWords) {
        throw new Error(`Document ${scenario.id} too short for ${scenario.complexity} complexity: ${wordCount} < ${expectedMinWords} words`);
      }
      
      const duration = Date.now() - startTime;
      results.push({
        scenario: scenario.id,
        domain: scenario.domain,
        complexity: scenario.complexity,
        duration,
        wordCount,
        sectionsFound: scenario.expectedSections.length
      });
    }
    
    // Validate all scenarios processed successfully
    if (results.length !== MOCK_SCENARIOS.length) {
      throw new Error(`Scenario processing incomplete: ${results.length}/${MOCK_SCENARIOS.length}`);
    }
  }

  // Main test execution
  async runAllTests() {
    console.log('🧪 STEERING DOCUMENT GENERATION TEST FRAMEWORK');
    console.log('='.repeat(80));
    console.log(`🔧 Test Configuration:`);
    console.log(`   • Mock scenarios: ${MOCK_SCENARIOS.length}`);
    console.log(`   • Parallel execution: ${TEST_CONFIG.parallelTests}`);
    console.log(`   • Max test duration: ${TEST_CONFIG.maxTestDuration}ms`);
    console.log(`   • Retry attempts: ${TEST_CONFIG.retryAttempts}`);
    console.log('');

    await this.setup();

    const tests = [
      { name: 'Basic Steering Creation', fn: () => this.testBasicSteeringCreation() },
      { name: 'Multiple Domain Steering', fn: () => this.testMultipleDomainSteering() },
      { name: 'Document Quality Validation', fn: () => this.testSteeringDocumentQuality() },
      { name: 'Format Validation', fn: () => this.testSteeringDocumentFormat() },
      { name: 'Agent Reuse Validation', fn: () => this.testAgentReuse() },
      { name: 'Error Handling', fn: () => this.testErrorHandling() },
      { name: 'Performance Benchmarks', fn: () => this.testPerformanceBenchmarks() },
      { name: 'Mock Scenarios Integration', fn: () => this.testMockScenarios() }
    ];

    if (TEST_CONFIG.parallelTests) {
      // Run tests in parallel for better performance
      const testPromises = tests.map(async ({ name, fn }) => {
        return this.runTest(name, fn);
      });
      
      await Promise.all(testPromises);
    } else {
      // Run tests sequentially
      for (const { name, fn } of tests) {
        await this.runTest(name, fn);
      }
    }

    await this.cleanup();
    return this.results.summary();
  }
}

// Export for use in other test files
export { SteeringTestFramework, MockMaestroOrchestrator, MOCK_SCENARIOS, STEERING_TEMPLATES };

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const framework = new SteeringTestFramework();
  
  framework.runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Test framework crashed:', error);
      process.exit(1);
    });
}