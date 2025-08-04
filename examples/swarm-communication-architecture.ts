#!/usr/bin/env node

/**
 * Swarm Communication Architecture
 *
 * Comprehensive demonstration of how swarms communicate:
 * 1. Intra-swarm communication (agents within same swarm)
 * 2. Inter-swarm communication (between different swarms)
 * 3. Cross-project swarm federation
 * 4. Emergency broadcast protocols
 * 5. Knowledge propagation via gossip
 */

import { CommunicationProtocol } from '../src/coordination/protocols/communication/communication-protocols';

/**
 * Example 1: Intra-Swarm Communication
 * How agents communicate within the same swarm
 */
export async function intraSwarmCommunicationExample() {
  const commProtocol = new CommunicationProtocol({
    encryption: { enabled: true, algorithm: 'aes-256-gcm' },
    compression: { enabled: true, algorithm: 'gzip', level: 6 },
  });

  await commProtocol.initialize();

  // Create single swarm with multiple agents
  const swarmId = 'development-swarm-1';
  const agents = [
    { id: 'architect-agent', role: 'architect', swarmId },
    { id: 'coder-agent-1', role: 'coder', swarmId },
    { id: 'coder-agent-2', role: 'coder', swarmId },
    { id: 'tester-agent', role: 'tester', swarmId },
    { id: 'reviewer-agent', role: 'reviewer', swarmId },
  ];

  // Register all agents in the swarm
  for (const agent of agents) {
    await commProtocol.registerNode(agent.id, {
      swarmId: agent.swarmId,
      role: agent.role,
      endpoint: `swarm://${agent.swarmId}/${agent.id}`,
      capabilities: [agent.role, 'messaging', 'coordination'],
    });
  }
  await commProtocol.broadcast({
    type: 'coordination',
    sender: 'architect-agent',
    scope: 'swarm', // Only within this swarm
    payload: {
      data: {
        announcement: 'new-architecture-plan-available',
        plan: {
          components: ['api-service', 'database', 'frontend'],
          timeline: '2-weeks',
          priority: 'high',
        },
      },
    },
    swarmFilter: swarmId, // Only broadcast within this swarm
  });
  await commProtocol.multicast({
    type: 'coordination',
    sender: 'architect-agent',
    recipients: ['coder-agent-1', 'coder-agent-2'], // Specific agents
    payload: {
      data: {
        taskAssignment: {
          'coder-agent-1': { component: 'api-service', deadline: '1 week' },
          'coder-agent-2': { component: 'frontend', deadline: '1 week' },
        },
      },
    },
    priority: 'high',
  });
  await commProtocol.unicast({
    type: 'coordination',
    sender: 'coder-agent-1',
    recipient: 'tester-agent',
    payload: {
      data: {
        request: 'test-plan-needed',
        component: 'api-service',
        readyDate: '2024-12-20',
        testTypes: ['unit', 'integration', 'performance'],
      },
    },
  });
  await commProtocol.initiateGossip({
    initiator: 'coder-agent-1',
    scope: 'swarm', // Within swarm only
    payload: {
      type: 'knowledge_update',
      data: {
        discovery: 'performance-optimization-found',
        technique: 'database-connection-pooling',
        improvement: '40% faster queries',
        confidence: 0.9,
      },
    },
    gossipRounds: 3,
    fanout: 2,
  });

  await commProtocol.shutdown();
}

/**
 * Example 2: Inter-Swarm Communication
 * How different swarms communicate with each other
 */
export async function interSwarmCommunicationExample() {
  const commProtocol = new CommunicationProtocol({
    encryption: { enabled: true, algorithm: 'aes-256-gcm' },
    routing: { strategy: 'adaptive', maxHops: 3 },
  });

  await commProtocol.initialize();

  // Create multiple swarms
  const swarms = [
    {
      id: 'backend-swarm',
      agents: [
        { id: 'backend-architect', role: 'architect' },
        { id: 'api-developer', role: 'coder' },
        { id: 'db-specialist', role: 'database' },
      ],
    },
    {
      id: 'frontend-swarm',
      agents: [
        { id: 'ui-architect', role: 'architect' },
        { id: 'react-developer', role: 'coder' },
        { id: 'ux-specialist', role: 'designer' },
      ],
    },
    {
      id: 'devops-swarm',
      agents: [
        { id: 'infra-architect', role: 'architect' },
        { id: 'k8s-specialist', role: 'devops' },
        { id: 'monitoring-specialist', role: 'monitoring' },
      ],
    },
  ];

  // Register all swarms and agents
  for (const swarm of swarms) {
    await commProtocol.registerSwarm(swarm.id, {
      type: 'project-swarm',
      capabilities: swarm.agents.map((a) => a.role),
      coordinator: swarm.agents[0].id, // First agent is coordinator
    });

    for (const agent of swarm.agents) {
      await commProtocol.registerNode(agent.id, {
        swarmId: swarm.id,
        role: agent.role,
        endpoint: `swarm://${swarm.id}/${agent.id}`,
      });
    }
  }
  await commProtocol.crossSwarmMessage({
    fromSwarm: 'frontend-swarm',
    toSwarm: 'backend-swarm',
    sender: 'ui-architect',
    recipient: 'backend-architect',
    type: 'coordination',
    payload: {
      data: {
        request: 'api-contract-negotiation',
        endpoints: [
          { path: '/api/users', methods: ['GET', 'POST'] },
          { path: '/api/projects', methods: ['GET', 'POST', 'PUT'] },
          { path: '/api/auth', methods: ['POST'] },
        ],
        dataFormats: ['json', 'graphql'],
        authentication: 'jwt',
      },
    },
  });
  await commProtocol.multiSwarmBroadcast({
    sender: 'infra-architect',
    senderSwarm: 'devops-swarm',
    targetSwarms: ['backend-swarm', 'frontend-swarm'], // Specific swarms
    type: 'emergency',
    payload: {
      data: {
        alert: 'security-vulnerability-detected',
        vulnerability: 'CVE-2024-12345',
        severity: 'critical',
        affectedComponents: ['jwt-library', 'database-driver'],
        action: 'immediate-patch-required',
        deadline: '2024-12-20T18:00:00Z',
      },
    },
    priority: 'emergency',
  });
  await commProtocol.crossSwarmMessage({
    fromSwarm: 'backend-swarm',
    toSwarm: 'devops-swarm',
    sender: 'db-specialist',
    recipient: 'k8s-specialist',
    type: 'coordination',
    payload: {
      data: {
        request: 'deployment-assistance',
        component: 'postgresql-cluster',
        requirements: {
          cpu: '4 cores',
          memory: '8GB',
          storage: '100GB SSD',
          replicas: 3,
          backup: 'daily',
        },
        priority: 'high',
      },
    },
  });
  await commProtocol.federateKnowledge({
    initiatorSwarm: 'frontend-swarm',
    targetSwarms: ['backend-swarm', 'devops-swarm'],
    knowledgeType: 'best-practices',
    payload: {
      data: {
        discovery: 'performance-optimization-pattern',
        domain: 'frontend-backend-communication',
        technique: 'request-batching-with-graphql',
        metrics: {
          latencyReduction: '60%',
          bandwidthSaving: '45%',
          userExperienceScore: '+23%',
        },
        implementation: 'proven-in-production',
        applicability: ['api-heavy-apps', 'mobile-apps'],
      },
    },
  });

  await commProtocol.shutdown();
}

/**
 * Example 3: Cross-Project Swarm Federation
 * How swarms from different projects communicate
 */
export async function crossProjectSwarmFederationExample() {
  const federationProtocol = new CommunicationProtocol({
    encryption: { enabled: true, algorithm: 'aes-256-gcm' },
    routing: { strategy: 'adaptive', maxHops: 5 },
    federation: { enabled: true, trustLevel: 'verified' },
  });

  await federationProtocol.initialize();

  // Different projects with their swarms
  const projects = [
    {
      id: 'ecommerce-platform',
      swarms: [
        { id: 'payment-swarm', specialty: 'payments', experience: 'high' },
        { id: 'inventory-swarm', specialty: 'inventory', experience: 'high' },
      ],
    },
    {
      id: 'banking-app',
      swarms: [
        { id: 'security-swarm', specialty: 'security', experience: 'expert' },
        { id: 'compliance-swarm', specialty: 'compliance', experience: 'expert' },
      ],
    },
    {
      id: 'healthcare-system',
      swarms: [
        { id: 'hipaa-swarm', specialty: 'healthcare-compliance', experience: 'expert' },
        { id: 'data-privacy-swarm', specialty: 'privacy', experience: 'high' },
      ],
    },
  ];

  // Register federated projects
  for (const project of projects) {
    await federationProtocol.registerProject(project.id, {
      swarms: project.swarms,
      trustLevel: 'verified',
      sharingPolicy: 'knowledge-only', // Don't share sensitive data
      capabilities: project.swarms.map((s) => s.specialty),
    });
  }
  await federationProtocol.consultationRequest({
    requestorProject: 'ecommerce-platform',
    requestorSwarm: 'payment-swarm',
    expertiseNeeded: 'advanced-security-patterns',
    consultWithProject: 'banking-app',
    consultWithSwarm: 'security-swarm',
    payload: {
      data: {
        challenge: 'secure-payment-tokenization',
        currentApproach: 'basic-encryption',
        requirements: [
          'PCI-DSS compliance',
          'zero-trust architecture',
          'quantum-resistant encryption',
        ],
        timeline: '2 weeks',
        sensitivity: 'high',
      },
    },
  });
  await federationProtocol.knowledgeMarketplace({
    action: 'offer',
    offeringProject: 'healthcare-system',
    offeringSwarm: 'hipaa-swarm',
    knowledgeDomain: 'healthcare-compliance-automation',
    payload: {
      data: {
        expertise: 'automated-hipaa-audit-trails',
        benefits: [
          '90% reduction in compliance work',
          'automated audit preparation',
          'real-time violation detection',
        ],
        applicableTo: ['any-system-handling-pii'],
        exchangeFor: 'frontend-optimization-patterns',
        trustLevel: 'verified',
      },
    },
  });
  await federationProtocol.federationEmergencyBroadcast({
    initiatorProject: 'banking-app',
    initiatorSwarm: 'security-swarm',
    emergencyType: 'zero-day-vulnerability',
    severity: 'critical',
    affectedDomains: ['authentication', 'session-management'],
    payload: {
      data: {
        vulnerability: 'session-hijacking-exploit',
        cve: 'CVE-2024-CRITICAL',
        vector: 'jwt-token-manipulation',
        mitigation: {
          immediate: 'rotate-all-jwt-secrets',
          shortTerm: 'implement-token-binding',
          longTerm: 'migrate-to-oauth2-pkce',
        },
        timeline: 'immediate-action-required',
      },
    },
    broadcastTo: 'all-federation-members',
  });
  await federationProtocol.federatedProblemSolving({
    problem: {
      title: 'scalable-real-time-notifications',
      description: 'Need to send millions of real-time notifications efficiently',
      constraints: ['low-latency', 'high-throughput', 'cost-effective'],
      currentBottleneck: 'websocket-connection-limits',
    },
    requestingProject: 'ecommerce-platform',
    openToProjects: 'all-federation',
    rewardSystem: 'knowledge-credits',
  });

  await federationProtocol.shutdown();
}

/**
 * Example 4: Real-Time Swarm Coordination Dashboard
 * Visual monitoring of all swarm communications
 */
export async function swarmCommunicationDashboardExample() {
  // Mock dashboard visualization of communication flows
  const dashboard = {
    showIntraSwarmActivity() {},

    showInterSwarmActivity() {},

    showFederationActivity() {},

    showPerformanceMetrics() {},
  };

  dashboard.showIntraSwarmActivity();
  dashboard.showInterSwarmActivity();
  dashboard.showFederationActivity();
  dashboard.showPerformanceMetrics();
}

/**
 * Main execution
 */
async function main() {
  try {
    await intraSwarmCommunicationExample();
    await interSwarmCommunicationExample();
    await crossProjectSwarmFederationExample();
    await swarmCommunicationDashboardExample();
  } catch (error) {
    console.error('❌ Example failed:', error);
    process.exit(1);
  }
}

// Run examples if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
