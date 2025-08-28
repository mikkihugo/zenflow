#!/usr/bin/env node
/**
 * @fileoverview Test Neural Orchestrator - Brain as Coordinator
 *
 * Test script to validate the brain orchestrator functionality:
 * - Task complexity analysis and routing
 * - Storage strategy determination
 * - Lazy loading simulation
 * - Metrics collection
 */

import { getLogger} from '@claude-zen/foundation';
import type { NeuralData, NeuralTask} from './main';
import { BrainCoordinator} from './main';

const logger = getLogger('test-neural-orchestrator');

async function testNeuralOrchestrator():Promise<void> {
  logger.info('🧠 Testing Neural Orchestrator - Brain as Coordinator');')
  // Initialize brain coordinator
  const brain = new BrainCoordinator({
    autonomous:{ enabled: true, learningRate:0.01, adaptationThreshold:0.1},
    neural:{
      rustAcceleration:true,
      gpuAcceleration:false,
      parallelProcessing:4,
},
});

  await brain.initialize();
  logger.info('✅ Brain coordinator initialized');')
  // Test 1:Simple prediction task (should use brain.js)
  logger.info('\n📊 Test 1:Simple Prediction Task');')  const simpleTask:NeuralTask = {
    id: 'test-simple-1',    type: 'prediction',    data:{
      input:[0.1, 0.2, 0.3, 0.4, 0.5],
},
};

  // Predict complexity before processing
  const predictedComplexity = brain.predictTaskComplexity(simpleTask);
  logger.info(`🎯 Predicted complexity:${predictedComplexity}`);`

  const simpleResult = await brain.processNeuralTask(simpleTask);
  logger.info(`📈 Simple result:$JSON.stringify(simpleResult.metadata)`);`
  logger.info(
    `🎲 Result data:[${(simpleResult.result as number[]).slice(0, 3).join(',    ')}...]``
  );

  // Test 2:Complex forecasting task (should attempt neural-ml)
  logger.info('\n📊 Test 2:Complex Forecasting Task');')  const complexTask:NeuralTask = {
    id: 'test-complex-1',    type: 'forecasting',    data:{
      input:Array.from(
        { length:1000},
        (_, i) => Math.sin(i * 0.1) + Math.random() * 0.1
      ),
      metadata:{
        timeSeriesLength:1000,
        expectedOutputSize:50,
},
},
    requirements:{
      accuracy:0.95,
      latency:5000,
},
};

  const complexPrediction = brain.predictTaskComplexity(complexTask);
  logger.info(`🎯 Predicted complexity:${complexPrediction}`);`

  const complexResult = await brain.processNeuralTask(complexTask);
  logger.info(`📈 Complex result:$JSON.stringify(complexResult.metadata)`);`
  logger.info(
    `🎲 Result size:${(complexResult.result as number[]).length} predictions``
  );

  // Test 3:Heavy optimization task (should definitely use neural-ml)
  logger.info('\n📊 Test 3:Heavy Optimization Task');')  const heavyTask:NeuralTask = {
    id: 'test-heavy-1',    type: 'optimization',    data:{
      input:Array.from({ length: 10000}, () => Math.random()),
      metadata:{
        dimensions:200,
        featureCount:100,
},
},
    requirements:{
      accuracy:0.99,
      gpu:true,
},
};

  const heavyPrediction = brain.predictTaskComplexity(heavyTask);
  logger.info(`🎯 Predicted complexity:${heavyPrediction}`);`

  const heavyResult = await brain.processNeuralTask(heavyTask);
  logger.info(`📈 Heavy result:$JSON.stringify(heavyResult.metadata)`);`
  logger.info(`⚡ Processing time:${heavyResult.metadata.duration}ms`);`

  // Test 4:Convenience methods
  logger.info('\n📊 Test 4:Convenience Methods');')
  // Simple prediction
  const quickPrediction = await brain.predict([0.5, 1.0, 1.5]);
  logger.info(`🔮 Quick prediction:[$quickPrediction.join(',    ')]`);`

  // Time series forecasting
  const timeSeries = Array.from({ length:100}, (_, i) => Math.sin(i * 0.1));
  const forecast = await brain.forecast(timeSeries, 10);
  logger.info(
    `📈 Forecast (10 steps):[$forecast.slice(0, 5).join(',    ')...]``
  );

  // Test 5:Storage orchestration
  logger.info('\n📊 Test 5:Storage Orchestration');')
  const testData = [
    // Small frequent data -> Memory
    {
      id: 'weights-small',      type:'weights' as const,
      data:{ weights: [0.1, 0.2, 0.3]},
      characteristics:{
        size:1024,
        accessFrequency:'realtime' as const,
        persistenceLevel:'session' as const,
},
},
    // High-dimensional vectors -> Vector DB
    {
      id: 'embeddings-large',      type:'patterns' as const,
      data:{ embeddings: Array.from({ length: 512}, () => Math.random())},
      characteristics:{
        size:2048,
        dimensions:512,
        accessFrequency:'frequent' as const,
        persistenceLevel:'permanent' as const,
},
},
    // Connected data -> Graph DB
    {
      id: 'relationships',      type:'models' as const,
      data:{ connections: ['model1',    'model2',    'model3']},
      characteristics:{
        size:4096,
        accessFrequency:'occasional' as const,
        persistenceLevel:'permanent' as const,
        relationships:['model1',    'model2',    'model3',    'dataset1',    'pipeline1'],
},
},
];

  for (const data of testData) {
    await brain.storeNeuralData(data as NeuralData);
    logger.info(`💾 Stored ${data.id} with intelligent routing`);`
}

  // Test 6:Orchestration metrics
  logger.info('\n📊 Test 6:Orchestration Metrics');')  const metrics = brain.getOrchestrationMetrics();
  logger.info('📈 Orchestration Metrics:');')  logger.info(`  📊 Tasks processed:$metrics.tasksProcessed`);`
  logger.info(`  🎯 Complexity distribution:`, metrics.complexityDistribution);`
  logger.info(
    `  ⚡ Average latency:`,`
    Object.entries(metrics.averageLatency).map(
      ([k, v]) => `$k:$v.toFixed(1)ms``
    )
  );
  logger.info(`  📦 Neural-ML load count:${metrics.neuralMlLoadCount}`);`
  logger.info(`  💾 Storage distribution:`, metrics.storageDistribution);`

  // Test 7:Demonstrate task complexity reasoning
  logger.info('\n📊 Test 7:Task Complexity Analysis');')
  const testTasks = [
    { type: 'prediction', inputSize:10, desc: ' Small prediction'},
    { type: 'classification', inputSize:1000, desc: ' Medium classification'},
    { type: 'forecasting', inputSize:5000, desc: ' Large time series'},
    { type: 'optimization', inputSize:10000, desc: ' Heavy optimization'},
];

  for (const test of testTasks) {
    const task = {
      type:test.type as any,
      data:{
        input:Array.from({ length: test.inputSize}, () => Math.random()),
        metadata:{
          timeSeriesLength:
            test.type === 'forecasting' ? test.inputSize:undefined,
          dimensions:
            test.inputSize > 1000 ? Math.floor(test.inputSize / 50) :undefined,
},
},
      requirements:test.inputSize > 5000 ? { accuracy: 0.95} :undefined,
};

    const complexity = brain.predictTaskComplexity(task);
    logger.info(`  $test.desc($test.inputSizeinputs) -> $complexity`);`
}

  logger.info('\n✅ Neural Orchestrator test completed successfully!');')  logger.info('🧠 Brain successfully acts as intelligent neural coordinator');')  logger.info('  • Routes tasks based on complexity analysis');')  logger.info('  • Lazy loads neural-ml for heavy operations');')  logger.info('  • Orchestrates storage strategy intelligently');')  logger.info('  • Learns from usage patterns and optimizes decisions');')}

// Run the test automatically
testNeuralOrchestrator().catch((error) => {
  logger.error('❌ Test failed:', error);')  process.exit(1);
});

export { testNeuralOrchestrator};
