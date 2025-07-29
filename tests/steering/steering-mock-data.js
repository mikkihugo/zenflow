/**
 * Mock Data Generator for Steering Document Tests
 * 
 * Provides realistic test data for validating steering document generation,
 * including various domain types, complexity levels, and edge cases.
 */

import { createHash, randomBytes } from 'crypto';

// Domain-specific mock content generators
export const DOMAIN_CONTENT_GENERATORS = {
  product: {
    simple: () => `Product vision and user experience guidelines for feature development with clear prioritization criteria.`,
    
    complex: () => `Comprehensive product management framework including:
    
• Product Vision: Define strategic objectives and user value propositions
• Market Analysis: Competitive landscape and user research insights  
• Feature Prioritization: Scoring framework based on user impact, business value, and technical complexity
• User Experience Standards: Consistent UX patterns, accessibility requirements, and usability testing criteria
• Quality Gates: Release criteria including user acceptance, performance benchmarks, and support readiness
• Metrics and KPIs: Success measurements including user engagement, feature adoption, and business impact
• Stakeholder Management: Communication protocols and decision-making processes`,

    edge_cases: [
      '', // Empty content
      'A', // Single character
      'Short content with special chars: !@#$%^&*()',
      'Content with\n\nmultiple\n\n\nline\n\nbreaks',
      'Content with unicode: 🚀 ✅ 📊 🎯 🔧 💡',
      'Very long content: ' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(100)
    ]
  },

  technical: {
    simple: () => `Technical architecture guidelines and development standards for system implementation.`,
    
    complex: () => `Enterprise technical architecture framework including:

• Architecture Principles: Scalability, maintainability, modularity, and performance optimization
• Technology Stack: Approved frameworks, libraries, and tools with version management
• Development Standards: Code quality, testing requirements, and documentation guidelines
• Security Framework: Authentication, authorization, data protection, and vulnerability management
• Performance Standards: Response time requirements, throughput benchmarks, and resource utilization
• Integration Patterns: API design, service communication, and data synchronization protocols
• Deployment Strategy: CI/CD pipelines, infrastructure as code, and environment management
• Monitoring and Observability: Logging, metrics, tracing, and alerting standards`,

    edge_cases: [
      'Technical content with code: `const config = { api: "https://example.com" };`',
      'Content with SQL: SELECT * FROM users WHERE active = 1;',
      'Mixed languages: 技术架构 Technical Architecture Arquitectura Técnica',
      'Special formatting: **bold** *italic* `code` [link](http://example.com)',
      'Nested lists:\n- Item 1\n  - Subitem 1.1\n    - Sub-subitem 1.1.1'
    ]
  },

  workflow: {
    simple: () => `Development workflow standards and process optimization guidelines.`,
    
    complex: () => `Comprehensive development workflow framework including:

• Process Standards: Phase gates, review criteria, and approval workflows
• Code Review Guidelines: Standards, checklists, and quality assurance protocols
• Testing Strategy: Unit, integration, and end-to-end testing requirements
• Documentation Standards: Code comments, API documentation, and user guides
• Quality Assurance: Automated testing, static analysis, and security scanning
• Deployment Procedures: Release management, rollback strategies, and environment promotion
• Performance Monitoring: Metrics collection, alerting, and continuous improvement
• Team Collaboration: Communication protocols, meeting standards, and knowledge sharing`,

    edge_cases: [
      'Workflow with timestamps: Started 2024-01-15T10:30:00Z, Completed 2024-01-15T14:45:00Z',
      'Process with numbered steps:\n1. Initial setup\n2. Development phase\n3. Testing\n4. Deployment',
      'Content with tables:\n| Phase | Duration | Owner |\n|-------|----------|-------|',
      'Mixed case content: MiXeD CaSe CoNtEnT fOr TeStInG'
    ]
  },

  security: {
    simple: () => `Security compliance framework and regulatory requirements.`,
    
    complex: () => `Enterprise security governance framework including:

• Compliance Standards: SOC2, ISO27001, GDPR, and industry-specific regulations
• Security Controls: Access management, encryption, network security, and incident response
• Risk Management: Threat modeling, vulnerability assessment, and risk mitigation strategies
• Audit Requirements: Evidence collection, compliance reporting, and third-party assessments
• Data Protection: Classification, handling procedures, retention policies, and privacy controls
• Security Architecture: Defense in depth, zero trust principles, and security by design
• Incident Response: Detection, containment, eradication, and recovery procedures
• Training and Awareness: Security education, phishing simulation, and compliance training`,

    edge_cases: [
      'Security content with regulations: GDPR Article 32, SOC2 Type II, ISO 27001:2013',
      'Content with IP addresses: 192.168.1.1, 10.0.0.0/8, 2001:db8::1',
      'URLs and domains: https://security.example.com, *.internal.domain',
      'Sensitive patterns: password, API key, token (should be handled carefully)'
    ]
  },

  performance: {
    simple: () => `Performance optimization strategies and monitoring standards.`,
    
    complex: () => `Performance engineering framework including:

• Performance Metrics: Response time, throughput, error rates, and resource utilization
• Optimization Strategies: Code optimization, database tuning, caching, and CDN implementation
• Monitoring Standards: Real-time monitoring, alerting thresholds, and performance dashboards
• Load Testing: Stress testing, capacity planning, and performance regression testing
• Scalability Planning: Horizontal and vertical scaling strategies and auto-scaling policies
• Performance Budgets: Resource constraints, performance benchmarks, and quality gates
• Troubleshooting: Performance profiling, bottleneck identification, and root cause analysis
• Continuous Improvement: Performance reviews, optimization roadmaps, and best practices`,

    edge_cases: [
      'Performance with metrics: 99.9% uptime, <200ms response time, >1000 TPS',
      'Content with percentiles: P50: 100ms, P95: 500ms, P99: 1000ms',
      'Resource measurements: 2GB RAM, 4 CPU cores, 100GB storage',
      'Network metrics: 10Mbps bandwidth, 50ms latency, 0.1% packet loss'
    ]
  }
};

// Generate realistic steering scenarios
export function generateSteeringScenarios(count = 20) {
  const domains = Object.keys(DOMAIN_CONTENT_GENERATORS);
  const complexities = ['simple', 'complex'];
  const scenarios = [];

  for (let i = 0; i < count; i++) {
    const domain = domains[i % domains.length];
    const complexity = complexities[i % complexities.length];
    const generator = DOMAIN_CONTENT_GENERATORS[domain];
    
    let content;
    if (complexity === 'simple') {
      content = generator.simple();
    } else {
      content = generator.complex();
    }

    // Occasionally use edge cases
    if (i % 7 === 0 && generator.edge_cases) {
      content = generator.edge_cases[i % generator.edge_cases.length];
    }

    scenarios.push({
      id: `mock-scenario-${i + 1}`,
      domain: `${domain}-${i + 1}`,
      content,
      complexity,
      metadata: {
        generated: new Date().toISOString(),
        index: i + 1,
        checksum: createHash('md5').update(content).digest('hex'),
        wordCount: content.split(/\s+/).length,
        charCount: content.length
      }
    });
  }

  return scenarios;
}

// Agent capability mapping for different domains
export const AGENT_CAPABILITIES = {
  'product-manager': ['product-strategy', 'user-research', 'feature-prioritization', 'stakeholder-management'],
  'ux-designer': ['user-experience', 'interface-design', 'usability-testing', 'accessibility'],
  'system-architect': ['system-design', 'architecture-patterns', 'scalability', 'integration'],
  'technical-lead': ['technical-strategy', 'code-review', 'mentoring', 'technology-selection'],
  'security-engineer': ['security-assessment', 'compliance', 'threat-modeling', 'incident-response'],
  'process-engineer': ['workflow-optimization', 'automation', 'quality-improvement', 'metrics'],
  'quality-assurance': ['testing-strategy', 'quality-metrics', 'process-validation', 'continuous-improvement'],
  'performance-engineer': ['performance-analysis', 'optimization', 'monitoring', 'capacity-planning'],
  'compliance-officer': ['regulatory-compliance', 'audit-management', 'risk-assessment', 'policy-development'],
  'audit-specialist': ['audit-procedures', 'evidence-collection', 'compliance-reporting', 'risk-analysis'],
  'monitoring-specialist': ['observability', 'alerting', 'dashboard-design', 'troubleshooting']
};

// Generate mock agent profiles for testing
export function generateMockAgents(count = 15) {
  const agentTypes = Object.keys(AGENT_CAPABILITIES);
  const agents = [];

  for (let i = 0; i < count; i++) {
    const agentType = agentTypes[i % agentTypes.length];
    const capabilities = AGENT_CAPABILITIES[agentType];
    
    agents.push({
      id: `mock-agent-${i + 1}`,
      type: agentType,
      capabilities,
      profile: {
        name: `${agentType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} ${i + 1}`,
        experience: ['junior', 'mid', 'senior', 'expert'][i % 4],
        specializations: capabilities.slice(0, 2 + (i % 3)),
        availability: i % 5 !== 0, // 80% availability
        performance: {
          successRate: 0.85 + (Math.random() * 0.15), // 85-100%
          averageTaskTime: 1000 + (Math.random() * 3000), // 1-4 seconds
          qualityScore: 0.8 + (Math.random() * 0.2) // 80-100%
        }
      },
      metadata: {
        created: new Date(Date.now() - (Math.random() * 86400000 * 30)).toISOString(), // Last 30 days
        lastUsed: new Date(Date.now() - (Math.random() * 86400000 * 7)).toISOString(), // Last 7 days
        usageCount: Math.floor(Math.random() * 100),
        tags: [`domain-${agentType.split('-')[0]}`, `level-${i % 4}`, `tier-${Math.floor(i / 5) + 1}`]
      }
    });
  }

  return agents;
}

// Quality validation patterns for different content types
export const QUALITY_PATTERNS = {
  basic: {
    minWordCount: 20,
    maxWordCount: 100,
    requiredSections: ['overview', 'guidelines'],
    optionalSections: ['examples', 'references']
  },
  
  standard: {
    minWordCount: 100,
    maxWordCount: 500,
    requiredSections: ['overview', 'guidelines', 'implementation', 'quality'],
    optionalSections: ['examples', 'best-practices', 'troubleshooting']
  },
  
  comprehensive: {
    minWordCount: 500,
    maxWordCount: 2000,
    requiredSections: ['overview', 'guidelines', 'implementation', 'quality', 'standards', 'procedures'],
    optionalSections: ['examples', 'best-practices', 'troubleshooting', 'metrics', 'automation']
  }
};

// Error scenarios for testing error handling
export const ERROR_SCENARIOS = [
  {
    id: 'invalid-domain-null',
    domain: null,
    content: 'Valid content',
    expectedError: 'Domain must be a non-empty string',
    errorType: 'validation'
  },
  {
    id: 'invalid-domain-empty',
    domain: '',
    content: 'Valid content',
    expectedError: 'Domain must be a non-empty string',
    errorType: 'validation'
  },
  {
    id: 'invalid-domain-whitespace',
    domain: '   ',
    content: 'Valid content',
    expectedError: 'Domain must be a non-empty string',
    errorType: 'validation'
  },
  {
    id: 'invalid-content-null',
    domain: 'valid-domain',
    content: null,
    expectedError: 'Content must be a non-empty string',
    errorType: 'validation'
  },
  {
    id: 'invalid-content-empty',
    domain: 'valid-domain',
    content: '',
    expectedError: 'Content must be a non-empty string',
    errorType: 'validation'
  },
  {
    id: 'invalid-domain-special-chars',
    domain: 'invalid/domain\\name*with:special?chars',
    content: 'Valid content',
    expectedError: null, // Should handle gracefully by sanitizing
    errorType: 'handling'
  },
  {
    id: 'very-long-domain',
    domain: 'a'.repeat(500),
    content: 'Valid content',
    expectedError: null, // Should handle gracefully
    errorType: 'boundary'
  },
  {
    id: 'very-long-content',
    domain: 'valid-domain',
    content: 'Very long content: '.repeat(10000),
    expectedError: null, // Should handle gracefully
    errorType: 'boundary'
  }
];

// Performance test configurations
export const PERFORMANCE_CONFIGS = [
  {
    name: 'lightweight',
    scenarios: 5,
    complexity: 'simple',
    maxExecutionTime: 1000,
    concurrency: 1
  },
  {
    name: 'standard',
    scenarios: 20,
    complexity: 'mixed',
    maxExecutionTime: 5000,
    concurrency: 3
  },
  {
    name: 'stress',
    scenarios: 100,
    complexity: 'complex',
    maxExecutionTime: 30000,
    concurrency: 10
  }
];

// Validation utilities
export function validateSteeringDocument(content, expectedQuality = 'standard') {
  const pattern = QUALITY_PATTERNS[expectedQuality];
  const wordCount = content.split(/\s+/).length;
  const sections = extractSections(content);
  
  const validation = {
    wordCount: {
      actual: wordCount,
      expected: { min: pattern.minWordCount, max: pattern.maxWordCount },
      valid: wordCount >= pattern.minWordCount && wordCount <= pattern.maxWordCount
    },
    sections: {
      found: sections,
      required: pattern.requiredSections,
      missing: pattern.requiredSections.filter(section => 
        !sections.some(found => found.toLowerCase().includes(section))
      ),
      valid: pattern.requiredSections.every(section =>
        sections.some(found => found.toLowerCase().includes(section))
      )
    },
    format: {
      hasTitle: /^#\s+.+Steering Document/m.test(content),
      hasOverview: /##\s+Overview/m.test(content),
      hasFooter: /\*Generated by Maestro/m.test(content),
      valid: /^#\s+.+Steering Document/m.test(content) && 
             /##\s+Overview/m.test(content) && 
             /\*Generated by Maestro/m.test(content)
    }
  };
  
  validation.overall = validation.wordCount.valid && 
                      validation.sections.valid && 
                      validation.format.valid;
  
  return validation;
}

function extractSections(content) {
  const sectionPattern = /^#+\s+(.+)$/gm;
  const sections = [];
  let match;
  
  while ((match = sectionPattern.exec(content)) !== null) {
    sections.push(match[1].trim());
  }
  
  return sections;
}

// Generate random test data
export function generateRandomTestData(seed = Date.now()) {
  // Use seed for reproducible random data
  let random = seed;
  const pseudoRandom = () => {
    random = (random * 9301 + 49297) % 233280;
    return random / 233280;
  };

  const domains = Object.keys(DOMAIN_CONTENT_GENERATORS);
  const randomDomain = domains[Math.floor(pseudoRandom() * domains.length)];
  const complexity = pseudoRandom() > 0.5 ? 'complex' : 'simple';
  
  return {
    domain: `test-${randomDomain}-${Math.floor(pseudoRandom() * 1000)}`,
    content: DOMAIN_CONTENT_GENERATORS[randomDomain][complexity](),
    expectedComplexity: complexity,
    seed
  };
}

export default {
  DOMAIN_CONTENT_GENERATORS,
  AGENT_CAPABILITIES,
  QUALITY_PATTERNS,
  ERROR_SCENARIOS,
  PERFORMANCE_CONFIGS,
  generateSteeringScenarios,
  generateMockAgents,
  validateSteeringDocument,
  generateRandomTestData
};