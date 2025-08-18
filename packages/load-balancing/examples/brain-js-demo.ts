/**
 * @fileoverview Brain.js Load Balancing Demo
 * 
 * Demonstrates real-world brain.js integration for intelligent agent performance prediction.
 * This shows practical benefits of neural networks for load balancing decisions.
 * 
 * Key Benefits:
 * - Learns from historical agent performance data
 * - Predicts both latency and success rates
 * - Adapts to changing workload patterns
 * - Improves routing decisions over time
 * 
 * @author Claude Code Zen Team
 * @since 1.0.0
 */

import { MLPredictiveAlgorithm } from '../src/algorithms/ml-predictive';
import type { Agent, Task, LoadMetrics } from '../src/types';

/**
 * Demo: Brain.js powered load balancing
 */
async function demoBrainJsLoadBalancing(): Promise<void> {
  console.log('🧠 Brain.js Load Balancing Demo Starting...\n');

  // Create the ML algorithm with brain.js
  const mlAlgorithm = new MLPredictiveAlgorithm();

  // Sample agents with different characteristics
  const agents: Agent[] = [
    {
      id: 'agent-fast',
      name: 'Fast Agent',
      capabilities: ['cpu-intensive', 'memory-optimized'],
      maxConcurrentTasks: 5,
      isActive: true,
      metadata: { 
        specialization: 'speed', 
        cpuCores: 8, 
        memory: '16GB' 
      }
    },
    {
      id: 'agent-reliable',
      name: 'Reliable Agent', 
      capabilities: ['data-processing', 'ml-inference'],
      maxConcurrentTasks: 3,
      isActive: true,
      metadata: { 
        specialization: 'reliability', 
        cpuCores: 4, 
        memory: '32GB' 
      }
    },
    {
      id: 'agent-gpu',
      name: 'GPU Agent',
      capabilities: ['gpu-acceleration', 'neural-training'],
      maxConcurrentTasks: 2,
      isActive: true,
      metadata: { 
        specialization: 'gpu', 
        cpuCores: 16, 
        memory: '64GB',
        gpu: 'RTX 4090'
      }
    }
  ];

  // Sample metrics for each agent
  const metrics = new Map<string, LoadMetrics>([
    ['agent-fast', {
      timestamp: new Date(),
      cpuUsage: 0.3,
      memoryUsage: 0.4,
      diskUsage: 0.2,
      networkUsage: 0.1,
      activeTasks: 2,
      queueLength: 1,
      responseTime: 150, // Fast but light
      errorRate: 0.02,
      throughput: 95
    }],
    ['agent-reliable', {
      timestamp: new Date(),
      cpuUsage: 0.6,
      memoryUsage: 0.7,
      diskUsage: 0.3,
      networkUsage: 0.2,
      activeTasks: 2,
      queueLength: 0,
      responseTime: 300, // Slower but reliable
      errorRate: 0.001, // Very reliable
      throughput: 75
    }],
    ['agent-gpu', {
      timestamp: new Date(),
      cpuUsage: 0.8,
      memoryUsage: 0.9,
      diskUsage: 0.1,
      networkUsage: 0.3,
      activeTasks: 1,
      queueLength: 0,
      responseTime: 500, // Slow but powerful
      errorRate: 0.01,
      throughput: 45
    }]
  ]);

  // Sample tasks with different characteristics
  const tasks: Task[] = [
    {
      id: 'task-1',
      type: 'cpu-intensive',
      priority: 3,
      requiredCapabilities: ['cpu-intensive'],
      estimatedDuration: 60000, // 1 minute
      createdAt: new Date(),
      metadata: { workload: 'light' }
    },
    {
      id: 'task-2', 
      type: 'neural-training',
      priority: 5,
      requiredCapabilities: ['gpu-acceleration', 'neural-training'],
      estimatedDuration: 300000, // 5 minutes
      createdAt: new Date(),
      metadata: { workload: 'heavy', modelSize: 'large' }
    },
    {
      id: 'task-3',
      type: 'data-processing',
      priority: 2,
      requiredCapabilities: ['data-processing'],
      estimatedDuration: 120000, // 2 minutes
      createdAt: new Date(),
      metadata: { workload: 'medium', dataSize: '1GB' }
    }
  ];

  console.log('📊 Demo Setup:');
  console.log(`   • ${agents.length} agents available`);
  console.log(`   • ${tasks.length} tasks to route`);
  console.log(`   • Brain.js neural networks for prediction\n`);

  // Simulate historical training data generation
  console.log('🔄 Generating historical training data...');
  
  for (let i = 0; i < 100; i++) {
    const randomAgent = agents[Math.floor(Math.random() * agents.length)];
    const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
    
    // Simulate task completion with realistic patterns
    const duration = Math.random() * 180000 + 30000; // 30s to 3min
    const success = Math.random() > 0.05; // 95% success rate
    
    await mlAlgorithm.onTaskComplete(
      randomAgent.id, 
      randomTask, 
      duration, 
      success
    );
  }
  
  console.log('✅ Training data generated (100 samples)\n');

  // Test routing with brain.js predictions
  console.log('🎯 Testing Brain.js Powered Routing:\n');

  for (const task of tasks) {
    console.log(`📋 Task: ${task.type} (Priority: ${task.priority})`);
    console.log(`   Duration estimate: ${Math.round(task.estimatedDuration / 1000)}s`);
    console.log(`   Capabilities needed: ${task.requiredCapabilities.join(', ')}`);

    try {
      const result = await mlAlgorithm.selectAgent(task, agents, metrics);

      console.log(`   🤖 Brain.js Selected: ${result.selectedAgent.name}`);
      console.log(`   ⚡ Predicted latency: ${Math.round(result.estimatedLatency || 0)}ms`);
      console.log(`   ✅ Expected success rate: ${Math.round((result.expectedQuality || 0) * 100)}%`);
      console.log(`   🎯 Confidence: ${Math.round(result.confidence * 100)}%`);
      console.log(`   💭 Reasoning: ${result.reasoning}`);
      
      if (result.alternativeAgents?.length) {
        console.log(`   🔄 Alternatives: ${result.alternativeAgents.map(a => a.name).join(', ')}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    console.log(); // Empty line for readability
  }

  // Get performance statistics
  const stats = await mlAlgorithm.getPerformanceMetrics();
  
  console.log('📈 Neural Network Performance:');
  console.log(`   • Total models: ${stats.totalModels}`);
  console.log(`   • Average accuracy: ${Math.round(stats.averageAccuracy * 100)}%`);
  console.log(`   • Historical data size: ${stats.historicalDataSize} samples`);
  console.log(`   • Cache hit rate: ${Math.round(stats.predictionCacheHitRate * 100)}%`);
  
  console.log('\n🎉 Brain.js Load Balancing Demo Complete!');
  console.log('\n💡 Key Benefits Demonstrated:');
  console.log('   • Real-time agent performance prediction');
  console.log('   • Learning from historical success/failure patterns');
  console.log('   • Intelligent routing based on task characteristics');
  console.log('   • Confidence scores for decision transparency');
  console.log('   • Fallback strategies when predictions are uncertain');
}

// Self-executing demo
if (import.meta.url === `file://${process.argv[1]}`) {
  demoBrainJsLoadBalancing()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Demo failed:', error);
      process.exit(1);
    });
}

export { demoBrainJsLoadBalancing };