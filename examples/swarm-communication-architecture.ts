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

import { EventEmitter } from 'node:events';
import { CommunicationProtocol } from '../src/coordination/protocols/communication/communication-protocols';
import { CoordinationPatterns } from '../src/coordination/protocols/patterns/coordination-patterns';
import { SwarmCoordinator } from '../src/coordination/swarm/core/swarm-coordinator';

/**
 * Example 1: Intra-Swarm Communication
 * How agents communicate within the same swarm
 */
export async function intraSwarmCommunicationExample() {
  console.log('🐝 Intra-Swarm Communication (Agents within same swarm)');
  console.log('========================================================');

  const commProtocol = new CommunicationProtocol({
    encryption: { enabled: true, algorithm: 'aes-256-gcm' },
    compression: { enabled: true, algorithm: 'gzip', level: 6 }
  });

  await commProtocol.initialize();

  // Create single swarm with multiple agents
  const swarmId = 'development-swarm-1';
  const agents = [
    { id: 'architect-agent', role: 'architect', swarmId },
    { id: 'coder-agent-1', role: 'coder', swarmId },
    { id: 'coder-agent-2', role: 'coder', swarmId },
    { id: 'tester-agent', role: 'tester', swarmId },
    { id: 'reviewer-agent', role: 'reviewer', swarmId }
  ];

  // Register all agents in the swarm
  for (const agent of agents) {
    await commProtocol.registerNode(agent.id, {
      swarmId: agent.swarmId,
      role: agent.role,
      endpoint: `swarm://${agent.swarmId}/${agent.id}`,
      capabilities: [agent.role, 'messaging', 'coordination']
    });
  }

  console.log(`✅ Registered ${agents.length} agents in swarm: ${swarmId}`);
  console.log();

  // 1. Broadcast within swarm (architect announces plan)
  console.log('📢 1. Intra-Swarm Broadcast:');
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
          priority: 'high'
        }
      }
    },
    swarmFilter: swarmId // Only broadcast within this swarm
  });
  console.log('   • Architect broadcast architecture plan to all swarm agents');
  console.log();

  // 2. Multicast to specific roles (assign coding tasks)
  console.log('📡 2. Role-Based Multicast:');
  await commProtocol.multicast({
    type: 'coordination',
    sender: 'architect-agent',
    recipients: ['coder-agent-1', 'coder-agent-2'], // Specific agents
    payload: {
      data: {
        taskAssignment: {
          'coder-agent-1': { component: 'api-service', deadline: '1 week' },
          'coder-agent-2': { component: 'frontend', deadline: '1 week' }
        }
      }
    },
    priority: 'high'
  });
  console.log('   • Architect assigned specific tasks to coder agents');
  console.log();

  // 3. Peer-to-peer coordination (coder to tester)
  console.log('🤝 3. Peer-to-Peer Coordination:');
  await commProtocol.unicast({
    type: 'coordination',
    sender: 'coder-agent-1',
    recipient: 'tester-agent',
    payload: {
      data: {
        request: 'test-plan-needed',
        component: 'api-service',
        readyDate: '2024-12-20',
        testTypes: ['unit', 'integration', 'performance']
      }
    }
  });
  console.log('   • Coder-1 requested test plan from tester');
  console.log();

  // 4. Gossip protocol for knowledge sharing
  console.log('🗣️ 4. Gossip Knowledge Propagation:');
  await commProtocol.initiateGossip({
    initiator: 'coder-agent-1',
    scope: 'swarm', // Within swarm only
    payload: {
      type: 'knowledge_update',
      data: {
        discovery: 'performance-optimization-found',
        technique: 'database-connection-pooling',
        improvement: '40% faster queries',
        confidence: 0.9
      }
    },
    gossipRounds: 3,
    fanout: 2
  });
  console.log('   • Coder-1 shared performance optimization via gossip');
  console.log('   • Knowledge spreads to all agents in 3 rounds');
  console.log();

  await commProtocol.shutdown();
  console.log('🛑 Intra-swarm communication demo complete');
  console.log();
}

/**
 * Example 2: Inter-Swarm Communication
 * How different swarms communicate with each other
 */
export async function interSwarmCommunicationExample() {
  console.log('🌐 Inter-Swarm Communication (Between different swarms)');
  console.log('======================================================');

  const commProtocol = new CommunicationProtocol({
    encryption: { enabled: true, algorithm: 'aes-256-gcm' },
    routing: { strategy: 'adaptive', maxHops: 3 }
  });

  await commProtocol.initialize();

  // Create multiple swarms
  const swarms = [
    {
      id: 'backend-swarm',
      agents: [
        { id: 'backend-architect', role: 'architect' },
        { id: 'api-developer', role: 'coder' },
        { id: 'db-specialist', role: 'database' }
      ]
    },
    {
      id: 'frontend-swarm', 
      agents: [
        { id: 'ui-architect', role: 'architect' },
        { id: 'react-developer', role: 'coder' },
        { id: 'ux-specialist', role: 'designer' }
      ]
    },
    {
      id: 'devops-swarm',
      agents: [
        { id: 'infra-architect', role: 'architect' },
        { id: 'k8s-specialist', role: 'devops' },
        { id: 'monitoring-specialist', role: 'monitoring' }
      ]
    }
  ];

  // Register all swarms and agents
  for (const swarm of swarms) {
    await commProtocol.registerSwarm(swarm.id, {
      type: 'project-swarm',
      capabilities: swarm.agents.map(a => a.role),
      coordinator: swarm.agents[0].id // First agent is coordinator
    });

    for (const agent of swarm.agents) {
      await commProtocol.registerNode(agent.id, {
        swarmId: swarm.id,
        role: agent.role,
        endpoint: `swarm://${swarm.id}/${agent.id}`
      });
    }
  }

  console.log(`✅ Registered ${swarms.length} swarms with ${swarms.reduce((total, s) => total + s.agents.length, 0)} total agents`);
  console.log();

  // 1. Cross-swarm coordination (API contract negotiation)
  console.log('🤝 1. Cross-Swarm Coordination:');
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
          { path: '/api/auth', methods: ['POST'] }
        ],
        dataFormats: ['json', 'graphql'],
        authentication: 'jwt'
      }
    }
  });
  console.log('   • Frontend swarm requested API contract from backend swarm');
  console.log();

  // 2. Multi-swarm broadcast (security alert)
  console.log('🚨 2. Multi-Swarm Emergency Broadcast:');
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
        deadline: '2024-12-20T18:00:00Z'
      }
    },
    priority: 'emergency'
  });
  console.log('   • DevOps swarm broadcast security alert to all development swarms');
  console.log();

  // 3. Swarm-to-swarm resource sharing
  console.log('💼 3. Inter-Swarm Resource Sharing:');
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
          backup: 'daily'
        },
        priority: 'high'
      }
    }
  });
  console.log('   • Backend swarm requested deployment help from DevOps swarm');
  console.log();

  // 4. Cross-swarm knowledge federation
  console.log('🧠 4. Cross-Swarm Knowledge Federation:');
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
          userExperienceScore: '+23%'
        },
        implementation: 'proven-in-production',
        applicability: ['api-heavy-apps', 'mobile-apps']
      }
    }
  });
  console.log('   • Frontend swarm shared optimization knowledge with other swarms');
  console.log();

  await commProtocol.shutdown();
  console.log('🛑 Inter-swarm communication demo complete');
  console.log();
}

/**
 * Example 3: Cross-Project Swarm Federation
 * How swarms from different projects communicate
 */
export async function crossProjectSwarmFederationExample() {
  console.log('🌍 Cross-Project Swarm Federation');
  console.log('=================================');

  const federationProtocol = new CommunicationProtocol({
    encryption: { enabled: true, algorithm: 'aes-256-gcm' },
    routing: { strategy: 'adaptive', maxHops: 5 },
    federation: { enabled: true, trustLevel: 'verified' }
  });

  await federationProtocol.initialize();

  // Different projects with their swarms
  const projects = [
    {
      id: 'ecommerce-platform',
      swarms: [
        { id: 'payment-swarm', specialty: 'payments', experience: 'high' },
        { id: 'inventory-swarm', specialty: 'inventory', experience: 'high' }
      ]
    },
    {
      id: 'banking-app', 
      swarms: [
        { id: 'security-swarm', specialty: 'security', experience: 'expert' },
        { id: 'compliance-swarm', specialty: 'compliance', experience: 'expert' }
      ]
    },
    {
      id: 'healthcare-system',
      swarms: [
        { id: 'hipaa-swarm', specialty: 'healthcare-compliance', experience: 'expert' },
        { id: 'data-privacy-swarm', specialty: 'privacy', experience: 'high' }
      ]
    }
  ];

  // Register federated projects
  for (const project of projects) {
    await federationProtocol.registerProject(project.id, {
      swarms: project.swarms,
      trustLevel: 'verified',
      sharingPolicy: 'knowledge-only', // Don't share sensitive data
      capabilities: project.swarms.map(s => s.specialty)
    });
  }

  console.log(`✅ Registered ${projects.length} federated projects`);
  console.log();

  // 1. Cross-project expertise consultation
  console.log('🎓 1. Cross-Project Expertise Consultation:');
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
          'quantum-resistant encryption'
        ],
        timeline: '2 weeks',
        sensitivity: 'high'
      }
    }
  });
  console.log('   • E-commerce payment swarm consulted banking security swarm');
  console.log();

  // 2. Cross-project knowledge marketplace
  console.log('🏪 2. Cross-Project Knowledge Marketplace:');
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
          'real-time violation detection'
        ],
        applicableTo: ['any-system-handling-pii'],
        exchangeFor: 'frontend-optimization-patterns',
        trustLevel: 'verified'
      }
    }
  });
  console.log('   • Healthcare swarm offered compliance expertise to federation');
  console.log();

  // 3. Federated emergency response
  console.log('🚨 3. Federated Emergency Response:');
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
          longTerm: 'migrate-to-oauth2-pkce'
        },
        timeline: 'immediate-action-required'
      }
    },
    broadcastTo: 'all-federation-members'
  });
  console.log('   • Banking security swarm broadcast critical vulnerability to all federation');
  console.log();

  // 4. Distributed problem solving
  console.log('🧩 4. Distributed Federated Problem Solving:');
  await federationProtocol.federatedProblemSolving({
    problem: {
      title: 'scalable-real-time-notifications',
      description: 'Need to send millions of real-time notifications efficiently',
      constraints: ['low-latency', 'high-throughput', 'cost-effective'],
      currentBottleneck: 'websocket-connection-limits'
    },
    requestingProject: 'ecommerce-platform',
    openToProjects: 'all-federation',
    rewardSystem: 'knowledge-credits'
  });
  console.log('   • E-commerce project opened distributed problem-solving session');
  console.log('   • All federation members can contribute solutions');
  console.log();

  await federationProtocol.shutdown();
  console.log('🛑 Cross-project federation demo complete');
  console.log();
}

/**
 * Example 4: Real-Time Swarm Coordination Dashboard
 * Visual monitoring of all swarm communications
 */
export async function swarmCommunicationDashboardExample() {
  console.log('📊 Real-Time Swarm Communication Dashboard');
  console.log('==========================================');

  // Mock dashboard visualization of communication flows
  const dashboard = {
    showIntraSwarmActivity() {
      console.log('┌─ Intra-Swarm Communication ────────────────────────────────┐');
      console.log('│ Development Swarm (5 agents)                               │');
      console.log('│   Architect ←→ Coder-1: 47 msgs (API design)               │');
      console.log('│   Architect ←→ Coder-2: 31 msgs (Frontend tasks)           │');
      console.log('│   Coder-1 ←→ Tester: 12 msgs (Test plans)                  │');
      console.log('│   Gossip Protocol: ACTIVE (knowledge spreading)            │');
      console.log('│   Consensus Status: ✅ HEALTHY                             │');
      console.log('└─────────────────────────────────────────────────────────────┘');
    },

    showInterSwarmActivity() {
      console.log('┌─ Inter-Swarm Communication ────────────────────────────────┐');
      console.log('│ Backend ←→ Frontend: 23 msgs (API contracts)               │');
      console.log('│ DevOps ←→ Backend: 8 msgs (Deployment configs)             │');
      console.log('│ DevOps ←→ Frontend: 4 msgs (CDN setup)                     │');
      console.log('│ Emergency Broadcasts: 1 (Security alert)                   │');
      console.log('│ Knowledge Federation: 3 active exchanges                   │');
      console.log('│ Cross-Swarm Status: ✅ COORDINATED                         │');
      console.log('└─────────────────────────────────────────────────────────────┘');
    },

    showFederationActivity() {
      console.log('┌─ Federation Communication ─────────────────────────────────┐');
      console.log('│ Projects Connected: 3 (E-commerce, Banking, Healthcare)    │');
      console.log('│ Active Consultations: 2                                    │');
      console.log('│   • Payment Security (E-comm ← Banking)                    │');
      console.log('│   • Compliance Automation (Healthcare → All)               │');
      console.log('│ Knowledge Marketplace: 7 active offers                     │');
      console.log('│ Emergency Broadcasts: 1 critical vulnerability             │');
      console.log('│ Federation Status: 🌐 GLOBALLY CONNECTED                   │');
      console.log('└─────────────────────────────────────────────────────────────┘');
    },

    showPerformanceMetrics() {
      console.log('┌─ Communication Performance Metrics ────────────────────────┐');
      console.log('│ Message Throughput: 1,247 msgs/sec                         │');
      console.log('│ Average Latency: 2.3ms (intra), 15ms (inter), 45ms (fed)   │');
      console.log('│ Encryption Overhead: 12% (acceptable)                      │');
      console.log('│ Compression Ratio: 67% size reduction                      │');
      console.log('│ Network Utilization: 34% (healthy)                         │');
      console.log('│ Error Rate: 0.01% (excellent)                              │');
      console.log('│ Consensus Success: 99.8%                                   │');
      console.log('└─────────────────────────────────────────────────────────────┘');
    }
  };

  dashboard.showIntraSwarmActivity();
  console.log();
  dashboard.showInterSwarmActivity();
  console.log();
  dashboard.showFederationActivity();
  console.log();
  dashboard.showPerformanceMetrics();
  console.log();

  console.log('🎛️ Dashboard Controls Available:');
  console.log('   • Real-time message flow visualization');
  console.log('   • Click agents to see communication history');
  console.log('   • Drag to create new communication channels');
  console.log('   • Filter by message type, priority, or time');
  console.log('   • Export communication logs and metrics');
  console.log('   • Configure routing and QoS policies');
}

/**
 * Main execution
 */
async function main() {
  console.log('🎯 Complete Swarm Communication Architecture');
  console.log('=============================================');
  console.log();
  
  try {
    await intraSwarmCommunicationExample();
    await interSwarmCommunicationExample();
    await crossProjectSwarmFederationExample();
    await swarmCommunicationDashboardExample();
    
    console.log('🎉 All swarm communication examples completed!');
    console.log();
    console.log('🔗 Swarm Communication Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 INTRA-SWARM: Agents within same swarm');
    console.log('   • Broadcast, multicast, unicast, gossip');
    console.log('   • Raft consensus for decisions');
    console.log('   • Work-stealing for load balancing');
    console.log();
    console.log('🌐 INTER-SWARM: Different swarms, same project');
    console.log('   • Cross-swarm coordination messages');  
    console.log('   • API contract negotiation');
    console.log('   • Resource sharing and assistance');
    console.log('   • Emergency broadcasts');
    console.log();
    console.log('🌍 FEDERATION: Cross-project swarm networks');
    console.log('   • Expertise consultation marketplace');
    console.log('   • Knowledge sharing and best practices');
    console.log('   • Distributed problem solving');
    console.log('   • Global emergency response');
    console.log();
    console.log('🔒 SECURITY: All communications encrypted');
    console.log('📊 MONITORING: Real-time dashboards and metrics');
    console.log('⚡ PERFORMANCE: Adaptive routing and QoS');
    console.log('🎛️ GUI: Visual management and configuration');
    
  } catch (error) {
    console.error('❌ Example failed:', error);
    process.exit(1);
  }
}

// Run examples if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}