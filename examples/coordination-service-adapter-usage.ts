/**
 * Coordination Service Adapter Usage Examples
 * 
 * Demonstrates how to use the CoordinationServiceAdapter for various
 * coordination operations including agent management, session handling,
 * and swarm coordination.
 */

import {
  CoordinationServiceAdapter,
  createDefaultCoordinationServiceAdapterConfig,
  createAgentCoordinationConfig,
  createSessionCoordinationConfig,
  createDAACoordinationConfig,
  CoordinationConfigPresets,
  createIntelligentAgent,
  createAgentBatch,
  createManagedSession,
  coordinateIntelligentSwarm,
  analyzeCoordinationPerformance
} from '../src/interfaces/services/adapters';
import { ServiceType } from '../src/interfaces/services/types';

/**
 * Example 1: Basic Coordination Service Setup
 */
async function basicCoordinationExample() {
  console.log('=== Basic Coordination Service Example ===');
  
  // Create basic coordination configuration
  const config = createDefaultCoordinationServiceAdapterConfig('basic-coordination', {
    type: ServiceType.COORDINATION,
    daaService: { enabled: true },
    sessionService: { enabled: true },
    swarmCoordinator: { enabled: true }
  });
  
  // Create and initialize the adapter
  const adapter = new CoordinationServiceAdapter(config);
  await adapter.initialize();
  await adapter.start();
  
  console.log('✅ Coordination service started successfully');
  console.log('📋 Capabilities:', adapter.getCapabilities());
  
  // Get service status
  const status = await adapter.getStatus();
  console.log('🏥 Service health:', status.health);
  console.log('📊 Active agents:', status.metadata?.activeAgents || 0);
  
  // Cleanup
  await adapter.stop();
  await adapter.destroy();
}

/**
 * Example 2: Agent Management Operations
 */
async function agentManagementExample() {
  console.log('\n=== Agent Management Example ===');
  
  // Create agent-focused configuration
  const config = createAgentCoordinationConfig('agent-manager', {
    maxAgents: 20,
    topology: 'hierarchical',
    enableLearning: true,
    autoSpawn: false
  });
  
  const adapter = new CoordinationServiceAdapter(config);
  await adapter.initialize();
  await adapter.start();
  
  // Create individual intelligent agent
  console.log('🤖 Creating intelligent agents...');
  const researcher = await createIntelligentAgent(adapter, {
    type: 'researcher',
    capabilities: ['search', 'analysis', 'documentation'],
    specialization: 'technical-research',
    learningEnabled: true
  });
  console.log('✅ Created researcher agent:', researcher.id);
  
  // Create batch of agents
  const agentConfigs = [
    { type: 'coder', capabilities: ['programming', 'debugging'] },
    { type: 'analyst', capabilities: ['data-analysis', 'reporting'] },
    { type: 'tester', capabilities: ['testing', 'quality-assurance'] }
  ];
  
  const batchAgents = await createAgentBatch(adapter, agentConfigs, {
    maxConcurrency: 3,
    staggerDelay: 100
  });
  console.log(`✅ Created ${batchAgents.filter(a => a).length} agents in batch`);
  
  // Get agent performance metrics
  const agentMetrics = await adapter.execute('agent-metrics');
  if (agentMetrics.success) {
    console.log('📈 Agent metrics:', agentMetrics.data);
  }
  
  // Adapt an agent for better performance
  const adaptResult = await adapter.execute('agent-adapt', {
    agentId: researcher.id,
    adaptation: {
      learningRate: 0.15,
      errorTolerance: 0.05,
      specializationBoost: 1.2
    }
  });
  
  if (adaptResult.success) {
    console.log('🔧 Agent adapted successfully');
  }
  
  await adapter.stop();
  await adapter.destroy();
}

/**
 * Example 3: Session Management Operations
 */
async function sessionManagementExample() {
  console.log('\n=== Session Management Example ===');
  
  // Create session-focused configuration
  const config = createSessionCoordinationConfig('session-manager', {
    maxSessions: 50,
    checkpointInterval: 180000, // 3 minutes
    autoRecovery: true
  });
  
  const adapter = new CoordinationServiceAdapter(config);
  await adapter.initialize();
  await adapter.start();
  
  // Create managed session with auto-checkpointing
  console.log('📄 Creating managed session...');
  const { sessionId, monitoringId } = await createManagedSession(
    adapter,
    'example-workflow-session',
    {
      autoCheckpoint: true,
      checkpointInterval: 120000, // 2 minutes
      maxDuration: 1800000 // 30 minutes
    }
  );
  
  console.log('✅ Session created:', sessionId);
  console.log('👁️ Monitoring ID:', monitoringId);
  
  // Perform some session operations
  const saveResult = await adapter.execute('session-save', { sessionId });
  console.log('💾 Session saved:', saveResult.success);
  
  const checkpointResult = await adapter.execute('session-checkpoint', {
    sessionId,
    description: 'Manual checkpoint for example'
  });
  console.log('📍 Checkpoint created:', checkpointResult.data);
  
  // Get session statistics
  const statsResult = await adapter.execute('session-stats', { sessionId });
  if (statsResult.success) {
    console.log('📊 Session stats:', statsResult.data);
  }
  
  // List all sessions
  const sessionsResult = await adapter.execute('session-list');
  if (sessionsResult.success) {
    console.log('📋 Total sessions:', sessionsResult.data.length);
  }
  
  await adapter.stop();
  await adapter.destroy();
}

/**
 * Example 4: Advanced Swarm Coordination
 */
async function swarmCoordinationExample() {
  console.log('\n=== Swarm Coordination Example ===');
  
  // Create high-performance coordination configuration
  const config = CoordinationConfigPresets.HIGH_PERFORMANCE('swarm-coordinator');
  
  const adapter = new CoordinationServiceAdapter(config);
  await adapter.initialize();
  await adapter.start();
  
  // Create agents for swarm coordination
  const agents = [
    { id: 'agent-r1', type: 'researcher', status: 'idle', capabilities: ['search', 'analysis'] },
    { id: 'agent-c1', type: 'coder', status: 'idle', capabilities: ['programming', 'debugging'] },
    { id: 'agent-a1', type: 'analyst', status: 'idle', capabilities: ['data-analysis', 'reporting'] },
    { id: 'agent-t1', type: 'tester', status: 'idle', capabilities: ['testing', 'validation'] }
  ];
  
  // Add agents to swarm
  console.log('👥 Adding agents to swarm...');
  for (const agent of agents) {
    await adapter.execute('swarm-add-agent', { agent });
  }
  
  // Perform intelligent swarm coordination
  console.log('🔄 Coordinating swarm with adaptive topology...');
  const coordination = await coordinateIntelligentSwarm(adapter, agents, {
    targetLatency: 100, // 100ms target
    minSuccessRate: 0.9, // 90% minimum success rate
    adaptiveTopology: true
  });
  
  console.log('✅ Swarm coordination completed:');
  console.log('   📈 Performance:', coordination.performance);
  console.log('   🏗️ Best topology:', coordination.topology);
  console.log('   ⚡ Success rate:', coordination.coordination.successRate);
  
  // Create and distribute tasks
  const tasks = [
    { id: 'task-1', type: 'research', requirements: ['search'], priority: 5 },
    { id: 'task-2', type: 'coding', requirements: ['programming'], priority: 4 },
    { id: 'task-3', type: 'analysis', requirements: ['data-analysis'], priority: 3 },
    { id: 'task-4', type: 'testing', requirements: ['testing'], priority: 2 }
  ];
  
  // Note: This would require implementing the distributeSwarmTasks helper
  console.log('📋 Tasks created for distribution:', tasks.length);
  
  await adapter.stop();
  await adapter.destroy();
}

/**
 * Example 5: DAA (Data Accessibility and Analysis) Operations
 */
async function daaOperationsExample() {
  console.log('\n=== DAA Operations Example ===');
  
  // Create DAA-focused configuration
  const config = createDAACoordinationConfig('daa-service', {
    enableMetaLearning: true,
    enableCognitive: true,
    analysisInterval: 600000 // 10 minutes
  });
  
  const adapter = new CoordinationServiceAdapter(config);
  await adapter.initialize();
  await adapter.start();
  
  // Create workflow for data analysis
  console.log('🔬 Creating data analysis workflow...');
  const workflowResult = await adapter.execute('workflow-create', {
    workflow: {
      name: 'data-analysis-pipeline',
      steps: [
        { id: 'data-collection', type: 'research' },
        { id: 'data-processing', type: 'analysis' },
        { id: 'pattern-recognition', type: 'cognitive' },
        { id: 'report-generation', type: 'documentation' }
      ]
    }
  });
  
  if (workflowResult.success) {
    console.log('✅ Workflow created:', workflowResult.data.id);
    
    // Execute the workflow
    const executionResult = await adapter.execute('workflow-execute', {
      workflowId: workflowResult.data.id,
      params: {
        dataSource: 'example-dataset',
        analysisType: 'pattern-recognition',
        outputFormat: 'report'
      }
    });
    
    if (executionResult.success) {
      console.log('⚡ Workflow executed:', executionResult.data.status);
    }
  }
  
  // Perform knowledge sharing between agents
  console.log('🧠 Sharing knowledge across agents...');
  const knowledgeResult = await adapter.execute('knowledge-share', {
    knowledge: {
      type: 'pattern-recognition',
      insights: ['data-correlation-improved', 'analysis-accuracy-increased'],
      confidence: 0.87,
      applicability: ['similar-datasets', 'related-domains']
    }
  });
  
  if (knowledgeResult.success) {
    console.log('✅ Knowledge shared successfully');
  }
  
  // Perform cognitive pattern analysis
  const cognitiveResult = await adapter.execute('cognitive-analyze');
  if (cognitiveResult.success) {
    console.log('🧠 Cognitive patterns:', cognitiveResult.data.patterns);
  }
  
  // Perform meta-learning to improve system performance
  const metaLearningResult = await adapter.execute('meta-learning', {
    operationType: 'system-optimization',
    learningData: {
      recentPerformance: 0.85,
      errorPatterns: ['timeout-errors', 'coordination-delays'],
      improvementAreas: ['response-time', 'accuracy']
    }
  });
  
  if (metaLearningResult.success) {
    console.log('🎯 Meta-learning completed, learning rate:', metaLearningResult.data.learningRate);
  }
  
  await adapter.stop();
  await adapter.destroy();
}

/**
 * Example 6: Performance Monitoring and Analytics
 */
async function performanceMonitoringExample() {
  console.log('\n=== Performance Monitoring Example ===');
  
  const config = CoordinationConfigPresets.ADVANCED('performance-monitor');
  const adapter = new CoordinationServiceAdapter(config);
  await adapter.initialize();
  await adapter.start();
  
  // Perform various operations to generate metrics
  const operations = [
    adapter.execute('agent-create', { config: { type: 'researcher' } }),
    adapter.execute('session-create', { name: 'perf-test' }),
    adapter.execute('swarm-metrics'),
    adapter.execute('performance-metrics')
  ];
  
  await Promise.allSettled(operations);
  
  // Analyze comprehensive performance
  console.log('📊 Analyzing coordination performance...');
  const performanceAnalysis = await analyzeCoordinationPerformance(adapter);
  
  console.log('✅ Performance Analysis Results:');
  console.log('   🎯 Overall Score:', performanceAnalysis.overall.score);
  console.log('   📝 Grade:', performanceAnalysis.overall.grade);
  console.log('   👥 Active Agents:', performanceAnalysis.agents.active);
  console.log('   📄 Healthy Sessions:', performanceAnalysis.sessions.healthy);
  console.log('   ⚡ Avg Latency:', performanceAnalysis.coordination.averageLatency, 'ms');
  
  if (performanceAnalysis.overall.issues.length > 0) {
    console.log('⚠️ Issues Found:');
    performanceAnalysis.overall.issues.forEach(issue => 
      console.log('   -', issue)
    );
  }
  
  if (performanceAnalysis.overall.recommendations.length > 0) {
    console.log('💡 Recommendations:');
    performanceAnalysis.overall.recommendations.forEach(rec => 
      console.log('   -', rec)
    );
  }
  
  // Get detailed service metrics
  const metrics = await adapter.getMetrics();
  console.log('📈 Service Metrics:');
  console.log('   Operations:', metrics.operationCount);
  console.log('   Success Rate:', ((metrics.successCount / metrics.operationCount) * 100).toFixed(1) + '%');
  console.log('   Avg Latency:', metrics.averageLatency.toFixed(1) + 'ms');
  console.log('   Throughput:', metrics.throughput.toFixed(2) + ' ops/sec');
  
  await adapter.stop();
  await adapter.destroy();
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🚀 Starting Coordination Service Adapter Examples\n');
    
    await basicCoordinationExample();
    await agentManagementExample();
    await sessionManagementExample();
    await swarmCoordinationExample();
    await daaOperationsExample();
    await performanceMonitoringExample();
    
    console.log('\n✅ All examples completed successfully!');
  } catch (error) {
    console.error('❌ Example execution failed:', error);
    process.exit(1);
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export {
  basicCoordinationExample,
  agentManagementExample,
  sessionManagementExample,
  swarmCoordinationExample,
  daaOperationsExample,
  performanceMonitoringExample
};