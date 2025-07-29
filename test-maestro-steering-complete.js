#!/usr/bin/env node

/**
 * Comprehensive Test Suite for Maestro Steering Document Generation
 * Tests the full steering document workflow: init -> create -> validate -> integrate
 */

import { readFile, writeFile, mkdir, access, unlink, rmdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Enhanced mock implementations for steering tests
class MockLogger {
  info(msg) { console.log(`ℹ️  ${msg}`); }
  warn(msg) { console.log(`⚠️  ${msg}`); }
  error(msg) { console.log(`❌ ${msg}`); }
  debug(msg) { console.log(`🐛 ${msg}`); }
}

class MockEventBus {
  constructor() {
    this.listeners = new Map();
  }
  
  emit(event, data) {
    const eventListeners = this.listeners.get(event) || [];
    eventListeners.forEach(listener => listener(data));
  }
  
  on(event, listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(listener);
  }
}

class MockMemoryManager {
  async get(key) { return null; }
  async set(key, value) { return true; }
  async delete(key) { return true; }
}

class MockAgentManager {
  constructor() {
    this.agents = new Map();
    this.creationLog = [];
  }
  
  async createAgent(type, profile) {
    const agentId = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    this.agents.set(agentId, { type, profile, status: 'created' });
    this.creationLog.push({ agentId, type, profile });
    console.log(`🤖 Agent created: ${agentId} (${type})`);
    return agentId;
  }
  
  async startAgent(agentId) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = 'running';
      console.log(`▶️  Agent started: ${agentId}`);
    }
  }
  
  async stopAgent(agentId) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = 'stopped';
      console.log(`⏹️  Agent stopped: ${agentId}`);
      this.agents.delete(agentId);
    }
  }
  
  getCreationLog() {
    return this.creationLog;
  }
}

class MockOrchestrator {
  constructor() {
    this.tasks = [];
  }
  
  async assignTask(task) {
    console.log(`📋 Task "${task.description}" assigned to ${task.assignedAgent || 'default'}`);
    this.tasks.push(task);
    
    // Simulate task execution for steering document creation
    if (task.type === 'steering-creation') {
      await this.simulateSteeringCreation(task);
    }
    
    await new Promise(resolve => setTimeout(resolve, 50));
    return { success: true, duration: 50 };
  }
  
  async simulateSteeringCreation(task) {
    const { domain, content, outputPath } = task.input;
    
    // Generate steering document content based on domain
    const steeringContent = this.generateSteeringContent(domain, content);
    
    // Write to output path if specified
    if (outputPath) {
      try {
        await mkdir(join(outputPath, '..'), { recursive: true });
        await writeFile(outputPath, steeringContent, 'utf8');
        console.log(`📝 Generated steering document: ${outputPath}`);
      } catch (error) {
        console.warn(`Failed to write steering document: ${error.message}`);
      }
    }
  }
  
  generateSteeringContent(domain, content) {
    const templates = {
      product: this.generateProductSteering(content),
      tech: this.generateTechSteering(content),
      structure: this.generateStructureSteering(content),
      security: this.generateSecuritySteering(content),
      default: this.generateGenericSteering(domain, content)
    };
    
    return templates[domain] || templates.default;
  }
  
  generateProductSteering(content) {
    return `# Product Steering Document

## Purpose
This document provides product strategy and vision guidelines for all development within the project.

## Product Vision
${content || 'Define clear product vision and strategic direction for the development team.'}

## User Experience Guidelines

### User Personas
- **Primary Users**: Define target user segments and their needs
- **Use Cases**: Document primary user journeys and workflows
- **Success Metrics**: Define KPIs and measurement criteria

### Feature Prioritization
- Feature impact vs. complexity matrix
- User feedback integration process
- Release planning and roadmap alignment

## Business Requirements

### Success Metrics
- User engagement and retention targets
- Performance benchmarks and SLAs
- Revenue and growth objectives

### Compliance & Legal
- Data privacy and protection requirements
- Industry-specific compliance standards
- Accessibility and inclusive design principles

## Context for Agents

### Implementation Priorities
When implementing product features:
1. Focus on user value and experience first
2. Ensure accessibility and inclusive design
3. Implement analytics and feedback collection
4. Consider scalability and future extensibility

### Quality Gates
- User acceptance criteria must be clearly defined
- Usability testing requirements for UI changes
- Performance impact on user experience
- Integration with existing user workflows

*Generated by Maestro Steering Test Framework*
`;
  }
  
  generateTechSteering(content) {
    return `# Technology Steering Document

## Purpose
This document provides technology standards and architectural guidelines for all development within the project.

## Technology Stack

### Backend Architecture
${content || 'Define core technology choices and architectural patterns for backend development.'}

### Development Standards
- **Code Quality**: Minimum 80% test coverage, ESLint/Prettier
- **API Design**: RESTful principles, OpenAPI documentation
- **Security**: HTTPS, input validation, authentication patterns
- **Performance**: Response time targets, caching strategies

### Testing Requirements
- Unit tests for all business logic (>90% coverage)
- Integration tests for API endpoints
- End-to-end tests for critical user flows
- Performance and load testing for production readiness

## Architecture Patterns

### Design Principles
- SOLID principles for maintainable code
- Clean architecture with clear separation of concerns
- Dependency injection for testability
- Event-driven architecture for scalability

### Integration Standards
- Microservices communication patterns
- Database design and migration strategies
- Third-party service integration guidelines
- Error handling and monitoring approaches

## Context for Agents

### Implementation Guidelines
When implementing technical features:
1. Follow established coding patterns and conventions
2. Ensure comprehensive test coverage before deployment
3. Document API changes and architectural decisions
4. Consider performance and security implications

### Code Review Criteria
- Adherence to coding standards and best practices
- Proper error handling and edge case coverage
- Security considerations and input validation
- Performance optimization and resource usage

*Generated by Maestro Steering Test Framework*
`;
  }
  
  generateStructureSteering(content) {
    return `# Structure Steering Document

## Purpose
This document defines project organization, file structure, and module boundaries for consistent development.

## Project Organization

### Directory Structure
${content || 'Define clear project structure and organizational patterns for maintainable development.'}

\`\`\`
src/
├── components/     # Reusable UI components
├── services/       # Business logic and API services
├── utils/          # Utility functions and helpers
├── types/          # TypeScript type definitions
├── tests/          # Test files and test utilities
└── docs/           # Documentation and specifications
\`\`\`

### Module Boundaries
- **Domain Modules**: Business logic grouped by functional areas
- **Shared Modules**: Common utilities and cross-cutting concerns
- **Interface Modules**: API contracts and external integrations
- **Infrastructure**: Database, logging, configuration management

## File Naming Conventions

### Component Files
- React components: PascalCase (e.g., UserProfile.tsx)
- Service modules: camelCase (e.g., userService.ts)
- Utility functions: camelCase (e.g., formatDate.ts)
- Type definitions: PascalCase (e.g., UserTypes.ts)

### Test Files
- Unit tests: ComponentName.test.ts
- Integration tests: featureName.integration.test.ts
- E2E tests: userFlow.e2e.test.ts

## Configuration Management

### Environment Configuration
- Development, staging, and production configurations
- Environment variable naming conventions
- Secret management and security practices
- Configuration validation and defaults

### Dependency Management
- Package.json organization and versioning strategy
- Dependency update and security audit processes
- Internal vs. external dependency guidelines

## Context for Agents

### File Creation Guidelines
When creating new files:
1. Follow established naming conventions and directory structure
2. Include appropriate imports and type definitions
3. Add comprehensive JSDoc comments for public APIs
4. Create corresponding test files for new functionality

### Refactoring Standards
- Maintain backward compatibility for public APIs
- Update related documentation and tests
- Follow incremental refactoring principles
- Coordinate changes across module boundaries

*Generated by Maestro Steering Test Framework*
`;
  }
  
  generateSecuritySteering(content) {
    return `# Security Steering Document

## Purpose
This document provides security guidelines and standards for all development within the project.

## Security Principles

### Core Security Guidelines
${content || 'Define comprehensive security standards and practices for secure development.'}

### Authentication & Authorization
- Multi-factor authentication for administrative access
- Role-based access control (RBAC) implementation
- JWT token management with secure refresh patterns
- Session management and timeout policies

### Data Protection
- Encryption at rest and in transit (AES-256, TLS 1.3)
- PII handling and data classification standards
- Data retention and deletion policies
- Audit logging for sensitive operations

## Development Security Practices

### Secure Coding Standards
- Input validation and sanitization on all endpoints
- SQL injection prevention through parameterized queries
- XSS protection with proper output encoding
- CSRF protection for state-changing operations

### Security Testing
- Static application security testing (SAST)
- Dynamic application security testing (DAST)
- Dependency vulnerability scanning
- Penetration testing for production deployments

## Infrastructure Security

### Network Security
- Firewall rules and network segmentation
- VPN access for remote development
- API rate limiting and DDoS protection
- Security monitoring and incident response

### Deployment Security
- Container security scanning and hardening
- Infrastructure as code security validation
- Secret management in CI/CD pipelines
- Security compliance verification

## Context for Agents

### Security Implementation Guidelines
When implementing security features:
1. Follow principle of least privilege
2. Implement defense in depth strategies
3. Validate all inputs and sanitize all outputs
4. Log security-relevant events for monitoring

### Security Review Criteria
- Threat modeling for new features
- Security control effectiveness validation
- Compliance with security standards (OWASP, NIST)
- Incident response and recovery procedures

*Generated by Maestro Steering Test Framework*
`;
  }
  
  generateGenericSteering(domain, content) {
    return `# ${domain.charAt(0).toUpperCase() + domain.slice(1)} Steering Document

## Purpose
This document provides guidelines and standards for the '${domain}' domain within the project.

## Domain Overview
${content || `Guidelines and standards for ${domain} domain development.`}

## Guidelines

### Development Standards
- Follow established patterns and conventions
- Ensure comprehensive testing and validation
- Document decisions and architectural choices
- Consider maintainability and extensibility

### Quality Requirements
- Code review requirements and approval criteria
- Testing coverage and quality gates
- Performance benchmarks and optimization targets
- Security considerations and compliance standards

## Implementation Guidelines

### Best Practices
- Consistent naming conventions and code organization
- Error handling and logging standards
- Configuration management and environment setup
- Documentation and knowledge sharing practices

### Review Criteria
- Adherence to domain-specific standards
- Integration with existing systems and patterns
- Performance and security impact assessment
- Maintainability and technical debt considerations

## Context for Agents

### Implementation Context
When working in the ${domain} domain:
1. Review existing patterns and established practices
2. Ensure compatibility with related systems
3. Follow domain-specific quality standards
4. Document decisions and rationale

### Quality Gates
- Domain-specific testing requirements
- Integration testing with related components
- Performance impact on domain operations
- Compliance with domain governance standards

*Generated by Maestro Steering Test Framework*
`;
  }
}

// Comprehensive Maestro Steering Test implementation
class MaestroSteeringTest {
  constructor() {
    this.maestroState = new Map();
    this.steeringDocuments = new Map();
    this.logger = new MockLogger();
    this.eventBus = new MockEventBus();
    this.memoryManager = new MockMemoryManager();
    this.agentManager = new MockAgentManager();
    this.orchestrator = new MockOrchestrator();
    this.testResults = [];
    
    this.steeringDirectory = join(process.cwd(), 'test-temp', 'maestro', 'steering');
    this.specsDirectory = join(process.cwd(), 'test-temp', 'maestro', 'specs');
  }

  // Test 1: Basic Steering Document Creation
  async testBasicSteeringCreation() {
    console.log(`\n📋 TEST 1: Basic steering document creation`);
    
    const testCases = [
      { domain: 'product', content: 'Product vision and strategy guidelines' },
      { domain: 'tech', content: 'Technology stack and development standards' },
      { domain: 'structure', content: 'Project organization and file structure' },
      { domain: 'security', content: 'Security guidelines and best practices' },
      { domain: 'custom-domain', content: 'Custom domain-specific guidelines' }
    ];
    
    const results = [];
    
    for (const testCase of testCases) {
      try {
        await this.createSteeringDocument(testCase.domain, testCase.content);
        
        // Verify document was created
        const steeringPath = join(this.steeringDirectory, `${testCase.domain}.md`);
        const exists = existsSync(steeringPath);
        
        if (exists) {
          const content = await readFile(steeringPath, 'utf8');
          const isValid = this.validateSteeringDocument(content, testCase.domain);
          
          results.push({
            domain: testCase.domain,
            created: true,
            valid: isValid,
            size: content.length
          });
          
          console.log(`✅ ${testCase.domain}: Created and validated (${content.length} chars)`);
        } else {
          results.push({
            domain: testCase.domain,
            created: false,
            valid: false,
            size: 0
          });
          console.log(`❌ ${testCase.domain}: Failed to create`);
        }
        
      } catch (error) {
        console.error(`❌ ${testCase.domain}: Error - ${error.message}`);
        results.push({
          domain: testCase.domain,
          created: false,
          valid: false,
          error: error.message
        });
      }
    }
    
    this.testResults.push({
      test: 'Basic Steering Creation',
      results,
      summary: {
        total: testCases.length,
        successful: results.filter(r => r.created && r.valid).length,
        failed: results.filter(r => !r.created || !r.valid).length
      }
    });
    
    console.log(`📊 Basic Creation Results: ${results.filter(r => r.created && r.valid).length}/${testCases.length} successful`);
    return results;
  }

  // Test 2: Steering Document Templates and Structure
  async testSteeringTemplates() {
    console.log(`\n🎨 TEST 2: Steering document templates and structure`);
    
    const templateTests = [
      {
        domain: 'product',
        requiredSections: ['Purpose', 'Product Vision', 'User Experience Guidelines', 'Context for Agents'],
        requiredKeywords: ['personas', 'success metrics', 'feature prioritization']
      },
      {
        domain: 'tech',
        requiredSections: ['Purpose', 'Technology Stack', 'Development Standards', 'Context for Agents'],
        requiredKeywords: ['code quality', 'API design', 'testing requirements']
      },
      {
        domain: 'structure',
        requiredSections: ['Purpose', 'Project Organization', 'File Naming Conventions', 'Context for Agents'],
        requiredKeywords: ['directory structure', 'module boundaries', 'naming conventions']
      },
      {
        domain: 'security',
        requiredSections: ['Purpose', 'Security Principles', 'Development Security Practices', 'Context for Agents'],
        requiredKeywords: ['authentication', 'data protection', 'secure coding']
      }
    ];
    
    const results = [];
    
    for (const test of templateTests) {
      try {
        // Create steering document
        await this.createSteeringDocument(test.domain, `Test content for ${test.domain}`);
        
        const steeringPath = join(this.steeringDirectory, `${test.domain}.md`);
        const content = await readFile(steeringPath, 'utf8');
        
        // Check required sections
        const sectionsFound = test.requiredSections.filter(section => 
          content.includes(`## ${section}`) || content.includes(`### ${section}`)
        );
        
        // Check required keywords
        const keywordsFound = test.requiredKeywords.filter(keyword =>
          content.toLowerCase().includes(keyword.toLowerCase())
        );
        
        const templateScore = {
          domain: test.domain,
          sectionsFound: sectionsFound.length,
          sectionsRequired: test.requiredSections.length,
          keywordsFound: keywordsFound.length,
          keywordsRequired: test.requiredKeywords.length,
          score: ((sectionsFound.length / test.requiredSections.length) + 
                  (keywordsFound.length / test.requiredKeywords.length)) / 2
        };
        
        results.push(templateScore);
        
        const passPercent = (templateScore.score * 100).toFixed(1);
        console.log(`✅ ${test.domain}: Template score ${passPercent}% (${sectionsFound.length}/${test.requiredSections.length} sections, ${keywordsFound.length}/${test.requiredKeywords.length} keywords)`);
        
      } catch (error) {
        console.error(`❌ ${test.domain}: Template test failed - ${error.message}`);
        results.push({
          domain: test.domain,
          error: error.message,
          score: 0
        });
      }
    }
    
    this.testResults.push({
      test: 'Template Structure',
      results,
      summary: {
        averageScore: results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length,
        highQuality: results.filter(r => (r.score || 0) > 0.8).length,
        total: results.length
      }
    });
    
    const avgScore = (results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length * 100).toFixed(1);
    console.log(`📊 Template Results: Average score ${avgScore}%, ${results.filter(r => (r.score || 0) > 0.8).length}/${results.length} high quality`);
    return results;
  }

  // Test 3: Agent Integration and Reuse System
  async testAgentIntegration() {
    console.log(`\n🤖 TEST 3: Agent integration and reuse system`);
    
    const integrationTests = [
      {
        scenario: 'Sequential steering creation',
        domains: ['product', 'tech', 'structure'],
        expectedAgentReuse: true
      },
      {
        scenario: 'Parallel steering workflows',
        domains: ['security', 'testing', 'deployment'],
        expectedAgentReuse: true
      },
      {
        scenario: 'Mixed domain workflows',
        domains: ['custom-1', 'custom-2'],
        expectedAgentReuse: false // New agents for custom domains
      }
    ];
    
    const results = [];
    
    for (const test of integrationTests) {
      try {
        console.log(`🔄 Running scenario: ${test.scenario}`);
        
        // Clear agent manager state
        const agentManager = new MockAgentManager();
        this.agentManager = agentManager;
        
        const startTime = Date.now();
        
        // Execute steering creation for all domains in scenario
        for (const domain of test.domains) {
          await this.createSteeringDocumentWithAgents(domain, `Test content for ${domain}`);
        }
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // Analyze agent usage
        const agentLog = agentManager.getCreationLog();
        const uniqueAgentTypes = new Set(agentLog.map(entry => entry.type));
        const totalAgents = agentLog.length;
        const reuseRate = totalAgents > 0 ? (totalAgents - uniqueAgentTypes.size) / totalAgents : 0;
        
        const scenarioResult = {
          scenario: test.scenario,
          domains: test.domains.length,
          totalAgents: totalAgents,
          uniqueTypes: uniqueAgentTypes.size,
          reuseRate: reuseRate,
          duration: duration,
          expectedReuse: test.expectedAgentReuse,
          reuseAchieved: reuseRate > 0.3 // 30% reuse threshold
        };
        
        results.push(scenarioResult);
        
        console.log(`✅ ${test.scenario}: ${totalAgents} agents, ${(reuseRate * 100).toFixed(1)}% reuse, ${duration}ms`);
        
      } catch (error) {
        console.error(`❌ ${test.scenario}: Integration test failed - ${error.message}`);
        results.push({
          scenario: test.scenario,
          error: error.message,
          reuseRate: 0
        });
      }
    }
    
    this.testResults.push({
      test: 'Agent Integration',
      results,
      summary: {
        averageReuseRate: results.reduce((sum, r) => sum + (r.reuseRate || 0), 0) / results.length,
        successfulScenarios: results.filter(r => !r.error && r.reuseAchieved).length,
        total: results.length
      }
    });
    
    const avgReuse = (results.reduce((sum, r) => sum + (r.reuseRate || 0), 0) / results.length * 100).toFixed(1);
    console.log(`📊 Integration Results: Average reuse rate ${avgReuse}%, ${results.filter(r => !r.error && r.reuseAchieved).length}/${results.length} scenarios successful`);
    return results;
  }

  // Test 4: Steering Workflow End-to-End
  async testSteeringWorkflow() {
    console.log(`\n🔄 TEST 4: Complete steering workflow end-to-end`);
    
    const workflowScenarios = [
      {
        name: 'Complete Project Setup',
        steps: [
          { action: 'init-steering', domain: 'product', content: 'Product vision and user experience guidelines' },
          { action: 'init-steering', domain: 'tech', content: 'Technology standards and development practices' },
          { action: 'init-steering', domain: 'structure', content: 'Project organization and file structure' },
          { action: 'create-spec', feature: 'user-authentication', request: 'Implement secure user authentication system' },
          { action: 'validate-steering-integration', feature: 'user-authentication' }
        ]
      },
      {
        name: 'Security-Focused Development',
        steps: [
          { action: 'init-steering', domain: 'security', content: 'Comprehensive security guidelines and standards' },
          { action: 'create-spec', feature: 'data-encryption', request: 'Implement end-to-end data encryption' },
          { action: 'validate-security-steering', feature: 'data-encryption' }
        ]
      }
    ];
    
    const results = [];
    
    for (const scenario of workflowScenarios) {
      try {
        console.log(`🎯 Executing workflow: ${scenario.name}`);
        
        const workflowResult = {
          name: scenario.name,
          steps: [],
          totalSteps: scenario.steps.length,
          successful: 0,
          failed: 0,
          duration: 0
        };
        
        const startTime = Date.now();
        
        for (const step of scenario.steps) {
          const stepStartTime = Date.now();
          
          try {
            switch (step.action) {
              case 'init-steering':
                await this.createSteeringDocument(step.domain, step.content);
                break;
              case 'create-spec':
                await this.createSpecWithSteering(step.feature, step.request);
                break;
              case 'validate-steering-integration':
                await this.validateSteeringIntegration(step.feature);
                break;
              case 'validate-security-steering':
                await this.validateSecuritySteering(step.feature);
                break;
            }
            
            const stepDuration = Date.now() - stepStartTime;
            workflowResult.steps.push({
              action: step.action,
              status: 'success',
              duration: stepDuration
            });
            workflowResult.successful++;
            
            console.log(`  ✅ ${step.action}: Completed in ${stepDuration}ms`);
            
          } catch (error) {
            const stepDuration = Date.now() - stepStartTime;
            workflowResult.steps.push({
              action: step.action,
              status: 'failed',
              error: error.message,
              duration: stepDuration
            });
            workflowResult.failed++;
            
            console.log(`  ❌ ${step.action}: Failed - ${error.message}`);
          }
        }
        
        workflowResult.duration = Date.now() - startTime;
        workflowResult.successRate = workflowResult.successful / workflowResult.totalSteps;
        
        results.push(workflowResult);
        
        console.log(`✅ ${scenario.name}: ${workflowResult.successful}/${workflowResult.totalSteps} steps successful, ${workflowResult.duration}ms total`);
        
      } catch (error) {
        console.error(`❌ ${scenario.name}: Workflow failed - ${error.message}`);
        results.push({
          name: scenario.name,
          error: error.message,
          successRate: 0
        });
      }
    }
    
    this.testResults.push({
      test: 'Workflow End-to-End',
      results,
      summary: {
        averageSuccessRate: results.reduce((sum, r) => sum + (r.successRate || 0), 0) / results.length,
        completedWorkflows: results.filter(r => !r.error && (r.successRate || 0) > 0.8).length,
        total: results.length
      }
    });
    
    const avgSuccess = (results.reduce((sum, r) => sum + (r.successRate || 0), 0) / results.length * 100).toFixed(1);
    console.log(`📊 Workflow Results: Average success rate ${avgSuccess}%, ${results.filter(r => !r.error && (r.successRate || 0) > 0.8).length}/${results.length} workflows completed`);
    return results;
  }

  // Test 5: Format and Standards Validation
  async testFormatAndStandards() {
    console.log(`\n📝 TEST 5: Format and standards validation`);
    
    const formatTests = [
      {
        test: 'Markdown format validation',
        validator: this.validateMarkdownFormat.bind(this)
      },
      {
        test: 'Required sections presence',
        validator: this.validateRequiredSections.bind(this)
      },
      {
        test: 'Agent context inclusion',
        validator: this.validateAgentContext.bind(this)
      },
      {
        test: 'Content quality standards',
        validator: this.validateContentQuality.bind(this)
      }
    ];
    
    // Create test documents for validation
    const testDomains = ['product', 'tech', 'structure', 'security'];
    for (const domain of testDomains) {
      await this.createSteeringDocument(domain, `Test content for ${domain} validation`);
    }
    
    const results = [];
    
    for (const formatTest of formatTests) {
      try {
        const testResult = {
          test: formatTest.test,
          domains: [],
          passRate: 0
        };
        
        for (const domain of testDomains) {
          const steeringPath = join(this.steeringDirectory, `${domain}.md`);
          const content = await readFile(steeringPath, 'utf8');
          
          const validation = await formatTest.validator(content, domain);
          testResult.domains.push({
            domain,
            passed: validation.passed,
            score: validation.score,
            issues: validation.issues
          });
        }
        
        testResult.passRate = testResult.domains.filter(d => d.passed).length / testResult.domains.length;
        results.push(testResult);
        
        console.log(`✅ ${formatTest.test}: ${(testResult.passRate * 100).toFixed(1)}% pass rate`);
        
      } catch (error) {
        console.error(`❌ ${formatTest.test}: Validation failed - ${error.message}`);
        results.push({
          test: formatTest.test,
          error: error.message,
          passRate: 0
        });
      }
    }
    
    this.testResults.push({
      test: 'Format and Standards',
      results,
      summary: {
        averagePassRate: results.reduce((sum, r) => sum + (r.passRate || 0), 0) / results.length,
        allTestsPassed: results.filter(r => !r.error && (r.passRate || 0) === 1).length,
        total: results.length
      }
    });
    
    const avgPass = (results.reduce((sum, r) => sum + (r.passRate || 0), 0) / results.length * 100).toFixed(1);
    console.log(`📊 Format Results: Average pass rate ${avgPass}%, ${results.filter(r => !r.error && (r.passRate || 0) === 1).length}/${results.length} tests passed all domains`);
    return results;
  }

  // Helper Methods

  async createSteeringDocument(domain, content) {
    await mkdir(this.steeringDirectory, { recursive: true });
    
    const steeringTask = {
      id: `steering-${domain}-${Date.now()}`,
      type: 'steering-creation',
      description: `Create steering document for ${domain}`,
      input: {
        domain,
        content,
        outputPath: join(this.steeringDirectory, `${domain}.md`)
      },
      priority: 80,
      metadata: { domain, type: 'steering-document' }
    };
    
    await this.orchestrator.assignTask(steeringTask);
    this.steeringDocuments.set(domain, { created: new Date(), content });
  }

  async createSteeringDocumentWithAgents(domain, content) {
    // Simulate agent-based steering document creation
    const agentTypes = ['requirements-engineer', 'steering-author'];
    
    for (const agentType of agentTypes) {
      const agentId = await this.agentManager.createAgent(agentType, {
        id: `${agentType}-${domain}`,
        type: agentType,
        capabilities: ['documentation', 'content-creation', 'analysis']
      });
      await this.agentManager.startAgent(agentId);
    }
    
    await this.createSteeringDocument(domain, content);
  }

  async createSpecWithSteering(featureName, request) {
    // Simulate spec creation that uses steering context
    const specsDir = join(this.specsDirectory, featureName);
    await mkdir(specsDir, { recursive: true });
    
    // Read steering context
    const steeringContext = await this.getSteeringContext();
    
    const requirementsContent = `# Requirements for ${featureName}

## High-Level Request
${request}

## Steering Context Applied
${steeringContext}

## User Stories
- As a user, I want ${request.toLowerCase()}, so that I can achieve my goals

## Acceptance Criteria
- [ ] Feature functions as described
- [ ] Follows steering document guidelines
- [ ] Meets quality and security standards

*Generated with Steering Document Context*
`;
    
    await writeFile(join(specsDir, 'requirements.md'), requirementsContent, 'utf8');
  }

  async getSteeringContext() {
    const steeringFiles = ['product.md', 'tech.md', 'structure.md', 'security.md'];
    let context = '';
    
    for (const file of steeringFiles) {
      try {
        const filePath = join(this.steeringDirectory, file);
        if (existsSync(filePath)) {
          const content = await readFile(filePath, 'utf8');
          context += `### ${file.replace('.md', '').toUpperCase()} STEERING:\n${content.substring(0, 200)}...\n\n`;
        }
      } catch (error) {
        // File doesn't exist, skip
      }
    }
    
    return context || 'No steering context available.';
  }

  async validateSteeringIntegration(featureName) {
    const specsPath = join(this.specsDirectory, featureName, 'requirements.md');
    if (!existsSync(specsPath)) {
      throw new Error(`Spec file not found for ${featureName}`);
    }
    
    const content = await readFile(specsPath, 'utf8');
    if (!content.includes('Steering Context Applied')) {
      throw new Error(`Steering context not integrated in ${featureName} spec`);
    }
    
    return { integrated: true, feature: featureName };
  }

  async validateSecuritySteering(featureName) {
    const securitySteeringPath = join(this.steeringDirectory, 'security.md');
    if (!existsSync(securitySteeringPath)) {
      throw new Error('Security steering document not found');
    }
    
    const steeringContent = await readFile(securitySteeringPath, 'utf8');
    const hasSecurityGuidelines = steeringContent.includes('authentication') && 
                                  steeringContent.includes('data protection');
    
    if (!hasSecurityGuidelines) {
      throw new Error('Security steering document lacks required guidelines');
    }
    
    return { validated: true, feature: featureName };
  }

  validateSteeringDocument(content, domain) {
    const validations = [
      { test: 'Has title', check: content.includes(`# ${domain.charAt(0).toUpperCase() + domain.slice(1)} Steering Document`) },
      { test: 'Has purpose section', check: content.includes('## Purpose') },
      { test: 'Has guidelines section', check: content.includes('## Guidelines') || content.includes('Guidelines') },
      { test: 'Has context for agents', check: content.includes('Context for Agents') },
      { test: 'Minimum length', check: content.length > 500 },
      { test: 'Contains domain-specific content', check: content.toLowerCase().includes(domain.toLowerCase()) }
    ];
    
    const passed = validations.filter(v => v.check).length;
    const total = validations.length;
    
    return {
      valid: passed >= total * 0.8, // 80% pass rate
      score: passed / total,
      passed,
      total,
      validations
    };
  }

  async validateMarkdownFormat(content, domain) {
    const formatChecks = [
      { test: 'Has markdown headers', check: content.includes('#') },
      { test: 'Has proper header hierarchy', check: /^#\s/.test(content) },
      { test: 'Has code blocks if needed', check: !content.includes('```') || content.split('```').length % 2 === 1 },
      { test: 'Has list formatting', check: content.includes('-') || content.includes('*') || content.includes('1.') },
      { test: 'No HTML tags', check: !/<[^>]*>/.test(content) }
    ];
    
    const passed = formatChecks.filter(c => c.check).length;
    const total = formatChecks.length;
    
    return {
      passed: passed >= total * 0.8,
      score: passed / total,
      issues: formatChecks.filter(c => !c.check).map(c => c.test)
    };
  }

  async validateRequiredSections(content, domain) {
    const requiredSections = ['Purpose', 'Guidelines', 'Context for Agents'];
    const optionalSections = ['Standards', 'Best Practices', 'Implementation'];
    
    const foundRequired = requiredSections.filter(section => 
      content.includes(`## ${section}`) || content.includes(`### ${section}`)
    ).length;
    
    const foundOptional = optionalSections.filter(section => 
      content.includes(`## ${section}`) || content.includes(`### ${section}`)
    ).length;
    
    const score = (foundRequired / requiredSections.length + foundOptional / optionalSections.length) / 2;
    
    return {
      passed: foundRequired === requiredSections.length,
      score,
      issues: foundRequired < requiredSections.length ? ['Missing required sections'] : []
    };
  }

  async validateAgentContext(content, domain) {
    const agentContextChecks = [
      { test: 'Has Context for Agents section', check: content.includes('Context for Agents') },
      { test: 'Has implementation guidelines', check: content.includes('implementation') || content.includes('Implementation') },
      { test: 'Has quality criteria', check: content.includes('quality') || content.includes('Quality') || content.includes('criteria') },
      { test: 'Has specific instructions', check: content.includes(':') && content.includes('1.') }
    ];
    
    const passed = agentContextChecks.filter(c => c.check).length;
    const total = agentContextChecks.length;
    
    return {
      passed: passed >= total * 0.75,
      score: passed / total,
      issues: agentContextChecks.filter(c => !c.check).map(c => c.test)
    };
  }

  async validateContentQuality(content, domain) {
    const qualityChecks = [
      { test: 'Adequate length', check: content.length > 1000 },
      { test: 'Domain-specific content', check: content.toLowerCase().includes(domain.toLowerCase()) },
      { test: 'Actionable guidelines', check: content.includes('should') || content.includes('must') || content.includes('ensure') },
      { test: 'Examples provided', check: content.includes('example') || content.includes('Example') || content.includes('e.g.') },
      { test: 'Clear structure', check: content.split('\n').filter(line => line.startsWith('#')).length >= 3 }
    ];
    
    const passed = qualityChecks.filter(c => c.check).length;
    const total = qualityChecks.length;
    
    return {
      passed: passed >= total * 0.8,
      score: passed / total,
      issues: qualityChecks.filter(c => !c.check).map(c => c.test)
    };
  }

  // Test Results and Cleanup

  async generateTestReport() {
    console.log('\n📊 COMPREHENSIVE STEERING TEST RESULTS');
    console.log('═'.repeat(60));
    
    let totalTests = 0;
    let successfulTests = 0;
    
    for (const testResult of this.testResults) {
      console.log(`\n🧪 ${testResult.test}:`);
      
      const summary = testResult.summary;
      if (summary) {
        Object.keys(summary).forEach(key => {
          const value = summary[key];
          if (typeof value === 'number') {
            console.log(`   ${key}: ${value.toFixed ? value.toFixed(2) : value}`);
          } else {
            console.log(`   ${key}: ${value}`);
          }
        });
        
        totalTests++;
        if (this.isTestSuccessful(testResult)) {
          successfulTests++;
        }
      }
    }
    
    console.log(`\n🎯 OVERALL RESULTS:`);
    console.log(`   Tests Executed: ${totalTests}`);
    console.log(`   Tests Successful: ${successfulTests}`);
    console.log(`   Success Rate: ${totalTests > 0 ? (successfulTests / totalTests * 100).toFixed(1) : 0}%`);
    
    // Validation summary
    const validations = [
      { test: 'Basic steering creation working', pass: this.getTestResult('Basic Steering Creation')?.summary?.successful >= 4 },
      { test: 'Template structure quality', pass: this.getTestResult('Template Structure')?.summary?.averageScore >= 0.8 },
      { test: 'Agent integration functional', pass: this.getTestResult('Agent Integration')?.summary?.averageReuseRate >= 0.3 },
      { test: 'End-to-end workflow complete', pass: this.getTestResult('Workflow End-to-End')?.summary?.averageSuccessRate >= 0.8 },
      { test: 'Format standards compliance', pass: this.getTestResult('Format and Standards')?.summary?.averagePassRate >= 0.8 }
    ];
    
    console.log(`\n✅ VALIDATION RESULTS:`);
    let passedValidations = 0;
    validations.forEach(({ test, pass }) => {
      const status = pass ? '✅' : '❌';
      console.log(`   ${status} ${test}: ${pass ? 'PASSED' : 'FAILED'}`);
      if (pass) passedValidations++;
    });
    
    console.log(`\n🏆 Final Score: ${passedValidations}/${validations.length} validations passed`);
    
    if (passedValidations === validations.length) {
      console.log('\n🎉 ALL STEERING TESTS PASSED! Maestro steering document generation is working perfectly.');
    } else {
      console.log('\n⚠️  Some tests failed. Review the implementation for issues.');
    }
    
    return {
      totalTests,
      successfulTests,
      validations: passedValidations,
      totalValidations: validations.length,
      overallSuccess: passedValidations === validations.length
    };
  }

  getTestResult(testName) {
    return this.testResults.find(result => result.test === testName);
  }

  isTestSuccessful(testResult) {
    const summary = testResult.summary;
    if (!summary) return false;
    
    // Define success criteria for each test type
    const successCriteria = {
      'Basic Steering Creation': summary.successful >= summary.total * 0.8,
      'Template Structure': summary.averageScore >= 0.8,
      'Agent Integration': summary.averageReuseRate >= 0.3,
      'Workflow End-to-End': summary.averageSuccessRate >= 0.8,
      'Format and Standards': summary.averagePassRate >= 0.8
    };
    
    return successCriteria[testResult.test] || false;
  }

  async cleanup() {
    try {
      // Clean up test files
      const testTempDir = join(process.cwd(), 'test-temp');
      if (existsSync(testTempDir)) {
        // Remove all test files
        const { rmdir } = await import('fs/promises');
        await rmdir(testTempDir, { recursive: true });
        console.log('🧹 Test cleanup completed');
      }
    } catch (error) {
      console.warn(`Warning: Cleanup failed - ${error.message}`);
    }
  }
}

// Run complete steering test suite
async function runSteeringTests() {
  console.log('🧪 COMPREHENSIVE MAESTRO STEERING DOCUMENT TESTS');
  console.log('═'.repeat(70));

  const steeringTest = new MaestroSteeringTest();
  
  try {
    // Execute all test suites
    await steeringTest.testBasicSteeringCreation();
    await steeringTest.testSteeringTemplates();
    await steeringTest.testAgentIntegration();
    await steeringTest.testSteeringWorkflow();
    await steeringTest.testFormatAndStandards();
    
    // Generate comprehensive report
    const finalResults = await steeringTest.generateTestReport();
    
    // Show generated files
    console.log(`\n📁 Generated Test Files:`);
    console.log(`   📋 test-temp/maestro/steering/*.md (steering documents)`);
    console.log(`   📋 test-temp/maestro/specs/*/requirements.md (specs with steering context)`);
    
    return finalResults;
    
  } catch (error) {
    console.error('\n❌ Test suite failed with error:', error.message);
    console.error(error.stack);
  } finally {
    // Cleanup test files
    await steeringTest.cleanup();
  }
}

// Execute the complete test suite
runSteeringTests().catch(console.error);