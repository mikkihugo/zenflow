#!/usr/bin/env node

/**
 * Hive Knowledge System - Data Flow Architecture
 * 
 * Shows how swarms get tools, RAG data, facts, agent definitions, 
 * tasks, features, etc. from the centralized "hive" knowledge repository.
 * 
 * This is the data backbone that feeds all swarm communications.
 */

import { MemoryCoordinator } from '../src/memory/core/memory-coordinator';
import { CommunicationProtocol } from '../src/coordination/protocols/communication/communication-protocols';
import { SwarmCoordinator } from '../src/coordination/swarm/core/swarm-coordinator';

/**
 * Central Hive Knowledge Repository
 * This is where all the data lives that swarms need
 */
export class HiveKnowledgeSystem {
  private memoryCoordinator: MemoryCoordinator;
  private commProtocol: CommunicationProtocol;
  
  constructor() {
    this.memoryCoordinator = new MemoryCoordinator({
      backend: 'lancedb', // Vector database for semantic search
      distributed: { replication: 3, consistency: 'strong' }
    });
    
    this.commProtocol = new CommunicationProtocol({
      encryption: { enabled: true, algorithm: 'aes-256-gcm' }
    });
  }

  async initialize() {
    await Promise.all([
      this.memoryCoordinator.initialize(),
      this.commProtocol.initialize()
    ]);
    
    // Pre-populate the hive with essential knowledge
    await this.seedKnowledgeBase();
  }

  /**
   * Seed the hive with essential knowledge that swarms need
   */
  private async seedKnowledgeBase() {
    console.log('🌱 Seeding Hive Knowledge Base...');

    // 1. Agent Definitions - What types of agents exist and their capabilities
    await this.storeAgentDefinitions();
    
    // 2. Tool Registry - All available tools and their APIs
    await this.storeToolRegistry();
    
    // 3. RAG Knowledge Base - Documents, facts, and contextual information
    await this.storeRAGKnowledge();
    
    // 4. Task Templates - Reusable task patterns
    await this.storeTaskTemplates();
    
    // 5. Feature Specifications - Available features and their requirements
    await this.storeFeatureSpecs();
    
    // 6. Communication Protocols - How to communicate with different systems
    await this.storeProtocolDefinitions();

    console.log('✅ Hive Knowledge Base seeded with essential data');
  }

  /**
   * Store agent definitions and capabilities
   */
  private async storeAgentDefinitions() {
    const agentDefinitions = {
      'architect': {
        role: 'architect',
        capabilities: [
          'system-design', 'architecture-patterns', 'technology-selection',
          'scalability-planning', 'security-architecture', 'api-design'
        ],
        tools: ['diagram-generator', 'architecture-validator', 'pattern-matcher'],
        expertise: 'system-architecture',
        cognitivePattern: 'systems-thinking',
        decisionMaking: 'consensus-based',
        communicationStyle: 'technical-detailed'
      },
      'coder': {
        role: 'coder',
        capabilities: [
          'code-generation', 'debugging', 'refactoring', 'testing',
          'code-review', 'optimization', 'documentation'
        ],
        tools: ['code-analyzer', 'linter', 'formatter', 'test-runner', 'profiler'],
        expertise: 'software-development',
        cognitivePattern: 'problem-solving',
        decisionMaking: 'data-driven',
        communicationStyle: 'concise-technical'
      },
      'analyst': {
        role: 'analyst',
        capabilities: [
          'requirements-analysis', 'data-analysis', 'performance-analysis',
          'risk-assessment', 'cost-benefit-analysis', 'trend-analysis'
        ],
        tools: ['analytics-engine', 'reporting-tool', 'visualization', 'metrics-collector'],
        expertise: 'business-analysis',
        cognitivePattern: 'analytical-thinking',
        decisionMaking: 'evidence-based',
        communicationStyle: 'data-rich'
      },
      'tester': {
        role: 'tester',
        capabilities: [
          'test-planning', 'test-automation', 'performance-testing',
          'security-testing', 'regression-testing', 'bug-reporting'
        ],
        tools: ['test-framework', 'load-tester', 'security-scanner', 'bug-tracker'],
        expertise: 'quality-assurance',
        cognitivePattern: 'critical-thinking',
        decisionMaking: 'risk-based',
        communicationStyle: 'issue-focused'
      }
    };

    for (const [agentType, definition] of Object.entries(agentDefinitions)) {
      await this.memoryCoordinator.store(`hive/agents/${agentType}`, definition);
    }
  }

  /**
   * Store comprehensive tool registry
   */
  private async storeToolRegistry() {
    const toolRegistry = {
      'code-analyzer': {
        name: 'Code Analyzer',
        type: 'static-analysis',
        api: {
          endpoint: '/tools/code-analyzer',
          methods: ['analyze', 'lint', 'complexity'],
          parameters: {
            analyze: { code: 'string', language: 'string', rules: 'array' },
            lint: { files: 'array', config: 'object' },
            complexity: { codebase: 'string', metrics: 'array' }
          }
        },
        capabilities: ['syntax-analysis', 'code-smells', 'security-vulnerabilities'],
        languages: ['typescript', 'javascript', 'python', 'rust', 'go'],
        output: 'analysis-report'
      },
      'rag-search': {
        name: 'RAG Search Engine',
        type: 'knowledge-retrieval',
        api: {
          endpoint: '/tools/rag-search',
          methods: ['search', 'similarity', 'context'],
          parameters: {
            search: { query: 'string', domain: 'string', limit: 'number' },
            similarity: { text: 'string', threshold: 'number' },
            context: { topic: 'string', depth: 'number' }
          }
        },
        capabilities: ['semantic-search', 'contextual-retrieval', 'fact-checking'],
        domains: ['technical', 'business', 'legal', 'scientific'],
        output: 'knowledge-results'
      },
      'task-orchestrator': {
        name: 'Task Orchestrator',
        type: 'workflow-management',
        api: {
          endpoint: '/tools/task-orchestrator',
          methods: ['create', 'assign', 'monitor', 'complete'],
          parameters: {
            create: { task: 'object', priority: 'string', deadline: 'date' },
            assign: { taskId: 'string', agentId: 'string', resources: 'array' },
            monitor: { taskId: 'string', metrics: 'array' },
            complete: { taskId: 'string', results: 'object' }
          }
        },
        capabilities: ['task-decomposition', 'dependency-management', 'progress-tracking'],
        features: ['parallel-execution', 'retry-logic', 'rollback'],
        output: 'task-status'
      }
    };

    for (const [toolName, definition] of Object.entries(toolRegistry)) {
      await this.memoryCoordinator.store(`hive/tools/${toolName}`, definition);
    }
  }

  /**
   * Store RAG knowledge base with facts and documents
   */
  private async storeRAGKnowledge() {
    const ragKnowledge = {
      'technical-patterns': {
        domain: 'software-architecture',
        facts: [
          {
            id: 'microservices-001',
            fact: 'Microservices architecture improves scalability but increases operational complexity',
            confidence: 0.95,
            sources: ['martin-fowler-microservices', 'netflix-experience', 'google-sre'],
            context: 'distributed-systems',
            tags: ['microservices', 'scalability', 'complexity']
          },
          {
            id: 'database-001',
            fact: 'Database connection pooling can improve performance by 40-60% under high load',
            confidence: 0.88,
            sources: ['postgres-docs', 'connection-pool-benchmarks'],
            context: 'database-optimization',
            tags: ['database', 'performance', 'connection-pooling']
          }
        ],
        documents: [
          {
            id: 'system-design-patterns',
            title: 'Comprehensive System Design Patterns',
            content: 'Detailed patterns for scalable system design...',
            embedding: [0.1, 0.2, 0.3], // Vector embedding for similarity search
            metadata: { domain: 'architecture', complexity: 'advanced' }
          }
        ]
      },
      'business-knowledge': {
        domain: 'business-requirements',
        facts: [
          {
            id: 'compliance-001',
            fact: 'GDPR requires explicit consent for data processing and right to deletion',
            confidence: 1.0,
            sources: ['gdpr-regulation', 'legal-interpretation'],
            context: 'data-privacy',
            tags: ['gdpr', 'privacy', 'compliance']
          }
        ]
      }
    };

    for (const [domain, knowledge] of Object.entries(ragKnowledge)) {
      await this.memoryCoordinator.store(`hive/rag/${domain}`, knowledge);
    }
  }

  /**
   * Store reusable task templates
   */
  private async storeTaskTemplates() {
    const taskTemplates = {
      'api-development': {
        name: 'REST API Development',
        description: 'Complete REST API implementation with authentication',
        phases: [
          {
            name: 'design',
            tasks: [
              { name: 'Define API endpoints', assignee: 'architect', duration: '2h' },
              { name: 'Design data models', assignee: 'architect', duration: '1h' },
              { name: 'Security requirements', assignee: 'architect', duration: '1h' }
            ]
          },
          {
            name: 'implementation',
            tasks: [
              { name: 'Implement CRUD operations', assignee: 'coder', duration: '4h' },
              { name: 'Add authentication', assignee: 'coder', duration: '2h' },
              { name: 'Input validation', assignee: 'coder', duration: '1h' }
            ]
          },
          {
            name: 'testing',
            tasks: [
              { name: 'Unit tests', assignee: 'tester', duration: '3h' },
              { name: 'Integration tests', assignee: 'tester', duration: '2h' },
              { name: 'Performance tests', assignee: 'tester', duration: '1h' }
            ]
          }
        ],
        requirements: ['nodejs', 'express', 'postgresql', 'jwt'],
        deliverables: ['api-server', 'documentation', 'test-suite']
      },
      'data-analysis': {
        name: 'Data Analysis Project',
        description: 'Comprehensive data analysis with insights',
        phases: [
          {
            name: 'collection',
            tasks: [
              { name: 'Data source identification', assignee: 'analyst', duration: '1h' },
              { name: 'Data extraction', assignee: 'analyst', duration: '3h' }
            ]
          },
          {
            name: 'analysis',
            tasks: [
              { name: 'Data cleaning', assignee: 'analyst', duration: '2h' },
              { name: 'Statistical analysis', assignee: 'analyst', duration: '4h' },
              { name: 'Visualization', assignee: 'analyst', duration: '2h' }
            ]
          }
        ]
      }
    };

    for (const [templateName, template] of Object.entries(taskTemplates)) {
      await this.memoryCoordinator.store(`hive/tasks/${templateName}`, template);
    }
  }

  /**
   * Store feature specifications
   */
  private async storeFeatureSpecs() {
    const featureSpecs = {
      'user-authentication': {
        name: 'User Authentication System',
        description: 'Complete user authentication with JWT tokens',
        requirements: {
          functional: [
            'User registration with email verification',
            'Login with email/password',
            'JWT token generation and validation',
            'Password reset functionality',
            'Multi-factor authentication support'
          ],
          nonFunctional: [
            'Sub-100ms token validation',
            'Support 10,000 concurrent users',
            'GDPR compliance for user data',
            '99.9% uptime requirement'
          ]
        },
        components: [
          { name: 'auth-service', type: 'microservice', technology: 'nodejs' },
          { name: 'user-database', type: 'database', technology: 'postgresql' },
          { name: 'auth-middleware', type: 'library', technology: 'express' }
        ],
        apis: [
          {
            endpoint: '/auth/register',
            method: 'POST',
            input: { email: 'string', password: 'string' },
            output: { userId: 'string', status: 'string' }
          },
          {
            endpoint: '/auth/login',
            method: 'POST',
            input: { email: 'string', password: 'string' },
            output: { token: 'string', expiresAt: 'date' }
          }
        ],
        testCriteria: [
          'Successful registration creates user account',
          'Invalid credentials return 401 error',
          'JWT tokens expire after configured time',
          'Password reset sends email notification'
        ]
      }
    };

    for (const [featureName, spec] of Object.entries(featureSpecs)) {
      await this.memoryCoordinator.store(`hive/features/${featureName}`, spec);
    }
  }

  /**
   * Store communication protocol definitions
   */
  private async storeProtocolDefinitions() {
    const protocols = {
      'swarm-coordination': {
        name: 'Swarm Coordination Protocol',
        version: '1.0',
        messageTypes: {
          'task-assignment': {
            structure: {
              type: 'task-assignment',
              taskId: 'string',
              assignee: 'string',
              priority: 'high|medium|low',
              deadline: 'date',
              requirements: 'array'
            },
            routing: 'unicast',
            acknowledgment: true
          },
          'status-update': {
            structure: {
              type: 'status-update',
              agentId: 'string',
              status: 'idle|busy|offline',
              currentTask: 'string',
              progress: 'number'
            },
            routing: 'broadcast',
            acknowledgment: false
          }
        }
      }
    };

    for (const [protocolName, protocol] of Object.entries(protocols)) {
      await this.memoryCoordinator.store(`hive/protocols/${protocolName}`, protocol);
    }
  }

  /**
   * API Methods for swarms to query the hive
   */

  async getAgentDefinition(agentType: string) {
    return await this.memoryCoordinator.retrieve(`hive/agents/${agentType}`);
  }

  async getToolDefinition(toolName: string) {
    return await this.memoryCoordinator.retrieve(`hive/tools/${toolName}`);
  }

  async searchRAGKnowledge(query: string, domain?: string) {
    // Use vector similarity search in LanceDB
    const searchKey = domain ? `hive/rag/${domain}` : 'hive/rag/*';
    return await this.memoryCoordinator.similaritySearch(query, searchKey, 5);
  }

  async getTaskTemplate(templateName: string) {
    return await this.memoryCoordinator.retrieve(`hive/tasks/${templateName}`);
  }

  async getFeatureSpec(featureName: string) {
    return await this.memoryCoordinator.retrieve(`hive/features/${featureName}`);
  }

  async getProtocolDefinition(protocolName: string) {
    return await this.memoryCoordinator.retrieve(`hive/protocols/${protocolName}`);
  }

  /**
   * Real-time knowledge distribution to swarms
   */
  async distributeKnowledgeUpdate(updateType: string, data: any) {
    await this.commProtocol.broadcast({
      type: 'knowledge-update',
      sender: 'hive-system',
      payload: {
        data: {
          updateType,
          content: data,
          timestamp: Date.now()
        }
      },
      priority: 'normal'
    });
  }
}

/**
 * Example 1: Swarm Querying the Hive for Agent Definitions
 */
export async function swarmQueryingHiveExample() {
  console.log('🔍 Swarm Querying Hive for Knowledge');
  console.log('===================================');

  const hive = new HiveKnowledgeSystem();
  await hive.initialize();

  const swarmCoordinator = new SwarmCoordinator({
    topology: 'mesh',
    maxAgents: 5,
    knowledgeSource: hive // Connect swarm to hive
  });

  // Swarm needs to spawn a new agent - queries hive for definition
  console.log('🤖 Swarm requesting agent definition...');
  const architectDefinition = await hive.getAgentDefinition('architect');
  
  console.log('📋 Agent Definition Retrieved:');
  console.log(`   Role: ${architectDefinition.role}`);
  console.log(`   Capabilities: ${architectDefinition.capabilities.slice(0, 3).join(', ')}...`);
  console.log(`   Tools: ${architectDefinition.tools.join(', ')}`);
  console.log(`   Cognitive Pattern: ${architectDefinition.cognitivePattern}`);
  console.log();

  // Use the definition to spawn the agent with correct capabilities
  await swarmCoordinator.spawnAgent({
    type: 'architect',
    capabilities: architectDefinition.capabilities,
    tools: architectDefinition.tools,
    cognitivePattern: architectDefinition.cognitivePattern
  });

  console.log('✅ Agent spawned with hive-provided definition');
  console.log();
}

/**
 * Example 2: RAG Knowledge Retrieval During Task Execution
 */
export async function ragKnowledgeRetrievalExample() {
  console.log('📚 RAG Knowledge Retrieval During Task');
  console.log('======================================');

  const hive = new HiveKnowledgeSystem();
  await hive.initialize();

  // Agent encounters a problem and needs knowledge
  console.log('❓ Agent needs knowledge: "How to optimize database performance?"');
  
  const knowledge = await hive.searchRAGKnowledge(
    'database performance optimization',
    'technical-patterns'
  );

  console.log('🧠 RAG Knowledge Retrieved:');
  knowledge.forEach((fact: any, index: number) => {
    console.log(`   ${index + 1}. ${fact.fact}`);
    console.log(`      Confidence: ${(fact.confidence * 100).toFixed(1)}%`);
    console.log(`      Tags: ${fact.tags.join(', ')}`);
  });
  console.log();

  // Agent uses this knowledge to make informed decisions
  console.log('💡 Agent applies knowledge to implement connection pooling');
  console.log('✅ Performance improved by 45% based on hive knowledge');
  console.log();
}

/**
 * Example 3: Tool Discovery and API Integration
 */
export async function toolDiscoveryExample() {
  console.log('🔧 Tool Discovery and API Integration');
  console.log('====================================');

  const hive = new HiveKnowledgeSystem();
  await hive.initialize();

  // Agent needs to analyze code quality
  console.log('🔍 Agent searching for code analysis tools...');
  
  const codeAnalyzer = await hive.getToolDefinition('code-analyzer');
  
  console.log('🛠️ Tool Found:');
  console.log(`   Name: ${codeAnalyzer.name}`);
  console.log(`   Type: ${codeAnalyzer.type}`);
  console.log(`   Endpoint: ${codeAnalyzer.api.endpoint}`);
  console.log(`   Methods: ${codeAnalyzer.api.methods.join(', ')}`);
  console.log(`   Languages: ${codeAnalyzer.languages.join(', ')}`);
  console.log();

  // Agent can now call the tool with correct API
  console.log('📞 Agent calling tool API:');
  console.log(`   POST ${codeAnalyzer.api.endpoint}/analyze`);
  console.log(`   Parameters: ${JSON.stringify(codeAnalyzer.api.parameters.analyze)}`);
  console.log('✅ Code analysis completed with hive-provided tool');
  console.log();
}

/**
 * Example 4: Task Template Instantiation
 */
export async function taskTemplateExample() {
  console.log('📋 Task Template Instantiation');
  console.log('==============================');

  const hive = new HiveKnowledgeSystem();
  await hive.initialize();

  // Project manager needs to create API development tasks
  console.log('👨‍💼 PM requesting API development template...');
  
  const apiTemplate = await hive.getTaskTemplate('api-development');
  
  console.log('📝 Task Template Retrieved:');
  console.log(`   Name: ${apiTemplate.name}`);
  console.log(`   Phases: ${apiTemplate.phases.length}`);
  console.log();

  // Instantiate tasks from template
  apiTemplate.phases.forEach((phase: any, phaseIndex: number) => {
    console.log(`   Phase ${phaseIndex + 1}: ${phase.name}`);
    phase.tasks.forEach((task: any, taskIndex: number) => {
      console.log(`     ${taskIndex + 1}. ${task.name}`);
      console.log(`        Assignee: ${task.assignee}`);
      console.log(`        Duration: ${task.duration}`);
    });
  });

  console.log();
  console.log('✅ 8 tasks created from hive template');
  console.log('🎯 Tasks automatically assigned to appropriate agent types');
  console.log();
}

/**
 * Example 5: Real-Time Knowledge Distribution
 */
export async function realTimeKnowledgeDistributionExample() {
  console.log('📡 Real-Time Knowledge Distribution');
  console.log('==================================');

  const hive = new HiveKnowledgeSystem();
  await hive.initialize();

  // Simulate knowledge update (e.g., new security vulnerability discovered)
  console.log('🚨 New security vulnerability discovered!');
  
  const securityUpdate = {
    vulnerability: 'CVE-2024-NEW',
    severity: 'critical',
    affectedComponents: ['jwt-library', 'session-management'],
    mitigation: 'upgrade-to-version-2.1.4',
    deadline: '2024-12-25T00:00:00Z'
  };

  // Hive broadcasts update to all connected swarms
  await hive.distributeKnowledgeUpdate('security-alert', securityUpdate);
  
  console.log('📢 Knowledge update broadcast to all swarms:');
  console.log(`   Type: security-alert`);
  console.log(`   Vulnerability: ${securityUpdate.vulnerability}`);
  console.log(`   Severity: ${securityUpdate.severity}`);
  console.log(`   Affected: ${securityUpdate.affectedComponents.join(', ')}`);
  console.log();

  console.log('📥 All swarms receive update instantly:');
  console.log('   • Development swarm: Updating dependencies');
  console.log('   • Testing swarm: Adding security tests');
  console.log('   • DevOps swarm: Preparing emergency deployment');
  console.log();

  console.log('✅ Knowledge distributed and actions coordinated');
  console.log();
}

/**
 * Main execution
 */
async function main() {
  console.log('🎯 Complete Hive Knowledge System Architecture');
  console.log('===============================================');
  console.log();
  
  try {
    await swarmQueryingHiveExample();
    await ragKnowledgeRetrievalExample();
    await toolDiscoveryExample();
    await taskTemplateExample();
    await realTimeKnowledgeDistributionExample();
    
    console.log('🎉 All hive knowledge examples completed!');
    console.log();
    console.log('🏗️ Hive Knowledge System Architecture Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 CENTRALIZED KNOWLEDGE:');
    console.log('   • Agent definitions and capabilities');
    console.log('   • Tool registry with APIs and parameters');  
    console.log('   • RAG knowledge base with facts and documents');
    console.log('   • Task templates for common workflows');
    console.log('   • Feature specifications and requirements');
    console.log('   • Communication protocol definitions');
    console.log();
    console.log('🔍 QUERY MECHANISMS:');
    console.log('   • Direct retrieval by key');
    console.log('   • Vector similarity search (RAG)');
    console.log('   • Pattern matching and filtering');
    console.log('   • Real-time knowledge distribution');
    console.log();
    console.log('💾 STORAGE & RETRIEVAL:');
    console.log('   • LanceDB for vector embeddings');
    console.log('   • Distributed memory coordination');
    console.log('   • Strong consistency guarantees');
    console.log('   • Automatic replication and backup');
    console.log();
    console.log('🌐 INTEGRATION:');
    console.log('   • All swarms connect to central hive');
    console.log('   • Knowledge updates broadcast automatically');
    console.log('   • APIs for external system integration');
    console.log('   • GUI dashboards for knowledge management');
    
  } catch (error) {
    console.error('❌ Example failed:', error);
    process.exit(1);
  }
}

// Run examples if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}