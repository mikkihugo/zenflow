#!/usr/bin/env node
/**
 * Neural Architecture Advisor Example;
 * Demonstrates how the ArchitectAdvisor Queen uses neural networks;
 * to provide intelligent architectural recommendations;
 */

import { ArchitectAdvisor } from '../src/queens/architect-advisor.js';
import { createQueenCoordinator } from '../src/queens/index.js';
import { Logger } from '../src/utils/logger.js';

const __logger = new Logger('ArchitectureExample');
async function demonstrateArchitectureAnalysis(): unknown {
  console.warn('🏗️  Neural Architecture Advisor Demo\n');
  console.warn('This example shows how neural networks enhance architectural decisions.\n');
;
  // Initialize the architect advisor
  const _architect = new ArchitectAdvisor();
;
  // Test scenarios with varying complexity
  const _scenarios = [;
    {
      id: 'scenario-1',;
      type: 'architecture-analysis',;
      prompt:;
        'Design architecture for a startup MVP e-commerce platform with 3 developers, needs to launch in 6 weeks, expecting 1000 users initially',;
      context: {
        budget: 'limited',;
        team: 'small',;
        timeline: 'aggressive',;
      },;
    },;
    {
      id: 'scenario-2',;
      type: 'architecture-analysis',;
      prompt:;
        'Architecture for a high-traffic social media platform requiring real-time updates, handling 10M daily active users, with features like chat, feed, notifications, and video streaming',;
      context: {
        scale: 'massive',;
        requirements: {
          realTime: true,;
          highAvailability: true,;
        },;
      },;
    },;
    {
      id: 'scenario-3',;
      type: 'architecture-analysis',;
      prompt:;
        'Design a secure financial transaction processing system with strict compliance requirements, needs 99.99% uptime, handles sensitive data, integrates with multiple banks',;
      context: {
        industry: 'fintech',;
        compliance: ['PCI-DSS', 'SOC2'],;
        requirements: {
          security: true,;
          reliability: true,;
        },;
      },;
    },;
    {
      id: 'scenario-4',;
      type: 'architecture-analysis',;
      prompt:;
        'Build an AI-powered content recommendation engine that processes millions of articles daily, requires machine learning pipelines, A/B testing, and real-time personalization',;
      context: {
        dataVolume: 'high',;
        mlRequired: true,;
        requirements: {
          scalability: true,;
          performance: true,;
        },;
      },;
    },;
  ];
;
  // Process each scenario
  for (const scenario of scenarios) {
    console.warn(`\n${'='.repeat(80)}`);
    console.warn(`📋 Scenario: ${scenario.id}`);
    console.warn(`   Question: ${scenario.prompt}\n`);
;
    const _result = await architect.process(scenario);
;
    console.warn(;
      `🏛️  Recommended Architecture: ${result.recommendation.architecture.toUpperCase()}`;
    );
    console.warn(`   Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    console.warn(;
      `   Neural Contribution: ${(result.metadata.neuralContribution * 100).toFixed(1)}%`;
    );
;
    console.warn(`\n📐 Architecture Pattern:`);
    console.warn(`   ${result.recommendation.pattern.description}`);
    console.warn(`   ✅ Pros: ${result.recommendation.pattern.pros.join(', ')}`);
    console.warn(`   ⚠️  Cons: ${result.recommendation.pattern.cons.join(', ')}`);
;
    console.warn(`\n🔧 Key Components:`);
    result.recommendation.components.forEach((component) => {
      console.warn(`   - ${component}`);
    });
;
    console.warn(`\n💻 Recommended Technologies:`);
    const _tech = result.recommendation.technologies;
    if (tech.languages) console.warn(`   Languages: ${tech.languages.join(', ')}`);
    if (tech.databases) console.warn(`   Databases: ${tech.databases.join(', ')}`);
    if (tech.deployment) console.warn(`   Deployment: ${tech.deployment.join(', ')}`);
    if (tech.suggested) console.warn(`   Neural Suggested: ${tech.suggested.join(', ')}`);
;
    console.warn(`\n📋 Implementation Plan:`);
    result.recommendation.implementation.slice(0, 3).forEach((step, idx) => {
      console.warn(`   ${idx + 1}. ${step}`);
    });
    console.warn(`   ... and ${result.recommendation.implementation.length - 3} more steps`);
;
    if (result.recommendation.neuralInsights) {
      console.warn(`\n🧠 Neural Insights:`);
      console.warn(`   "${result.recommendation.neuralInsights.substring(0, 150)}..."`);
    }
;
    console.warn(`\n🎯 Reasoning:`);
    console.warn(;
      result.reasoning;
        .split('\n');
        .map((line) => `   $line`);
        .join('\n');
    );
;
    if (result.alternatives && result.alternatives.length > 0) {
      console.warn(`\n🔄 Alternative Approaches:`);
      result.alternatives.forEach((alt) => {
        console.warn(`   - ${alt.architecture} (${(alt.suitability * 100).toFixed(0)}% suitable)`);
        console.warn(`     ${alt.whenToUse}`);
      });
    }
;
    console.warn(`\n⏱️  Processing Time: ${result.processingTime.toFixed(0)}ms`);
  }
}
async function demonstrateQueenCoordination(): unknown {
  console.warn(`\n\n${'='.repeat(80)}`);
  console.warn('👑 Demonstrating Multi-Queen Coordination with Neural Networks\n');
;
  // Create a coordinator with multiple queens including our architect
  const _coordinator = await createQueenCoordinator({
    queens: ['CodeQueen', 'ArchitectAdvisor', 'DebugQueen'],;
    consensus: 'weighted',;
      type: 'sqlite',;
      path: ':memory:',;,;
  }
)
// Complex task that benefits from multiple perspectives
const _complexTask = {
    id: 'complex-1',;
type: 'full-stack-development',;
prompt: 'Build a complete real-time collaborative document editing system like Google Docs',;
{
  realTime: true,;
  collaboration: true,;
  scalability: true,;
  security: true,;
  ,
}
,
}
console.warn(`📋 Complex Task: $
{
  complexTask.prompt;
}
\n`)
// Let the coordinator handle it
const _coordinatedResult = await coordinator.processTask(complexTask);
console.warn('🏆 Coordinated Result:');
console.warn(`   Primary Queen: ${coordinatedResult.primaryQueen}`);
console.warn(`   Overall Confidence: ${(coordinatedResult.confidence * 100).toFixed(1)}%`);
console.warn(`   Queens Involved: ${coordinatedResult.queensInvolved.join(', ')}`);
console.warn('\n📊 Individual Queen Contributions:');
coordinatedResult.allResults.forEach((result) => {
  console.warn(`\n   ${result.queenName}:`);
  console.warn(`   - Confidence: ${(result.confidence * 100).toFixed(1)}%`);
  console.warn(`   - Processing Time: ${result.processingTime.toFixed(0)}ms`);
  if (result.metadata?.neuralContribution) {
    console.warn(;
    `   - Neural Contribution: ${(result.metadata.neuralContribution * 100).toFixed(1)}%`;
    )
  }
});
// Shut down coordinator
await coordinator.stop();
}
async
function demonstrateNeuralLearning(): unknown {
  console.warn(`\n\n${'='.repeat(80)}`);
  console.warn('🧠 Demonstrating Neural Network Learning & Adaptation\n');
;
  const _architect = new ArchitectAdvisor();
;
  // Simulate multiple similar requests to show cache and learning effects
  const _iterations = 3;
  const _basePrompt =;
    'Design a microservices architecture for an e-commerce platform with high scalability needs';
;
  for (let i = 0; i < iterations; i++) {
    console.warn(`\n🔄 Iteration ${i + 1}:`);
;
    const _task = {
      id: `learning-${i}`,;
      type: 'architecture-analysis',;
      prompt: basePrompt + (i > 0 ? ` (iteration ${i + 1})` : ''),;
          scalability: true,;
          performance: true,;,;,;
    };
;
    const _startTime = Date.now();
    const _result = await architect.process(task);
    const _totalTime = Date.now() - startTime;
;
    console.warn(`   Processing Time: ${totalTime}ms`);
    console.warn(`   Neural Engine Time: ${result.processingTime.toFixed(0)}ms`);
    console.warn(`   Confidence: ${(result.confidence * 100).toFixed(1)}%`);
;
    // Show if result was cached
    const _neuralStats = architect.neuralEngine.getStats();
    console.warn(`   Cache Size: ${neuralStats.cacheSize}`);
    console.warn(`   Total Inferences: ${neuralStats.totalInferences}`);
    if (neuralStats.totalInferences > 0) {
      const _hitRate = ((neuralStats.cacheHits / neuralStats.totalInferences) * 100).toFixed(1);
      console.warn(`   Cache Hit Rate: ${hitRate}%`);
    }
  }
// Show final neural engine statistics
console.warn('\n📊 Final Neural Engine Statistics:');
const _finalStats = architect.neuralEngine.getStats();
console.warn(`   Total Models: ${finalStats.totalModels}`);
console.warn(`   Loaded Models: ${finalStats.loadedModels}`);
console.warn(`   Has Bindings: ${finalStats.hasBindings}`);
console.warn(`   Cache Size: ${finalStats.cacheSize}`);
console.warn(`   Total Inferences: ${finalStats.totalInferences}`);
}
// Run all demonstrations
async
function runDemo(): unknown {
  try {
    await demonstrateArchitectureAnalysis();
    await demonstrateQueenCoordination();
    await demonstrateNeuralLearning();
;
    console.warn(`\n\n${'='.repeat(80)}`);
    console.warn('✅ Neural Network Integration Demo Complete!\n');
    console.warn('Key Takeaways:');
    console.warn('1. Neural networks enhance decision-making with pattern recognition');
    console.warn('2. Fallback mechanisms ensure reliability when neural models are unavailable');
    console.warn('3. Caching improves performance for repeated queries');
    console.warn('4. Multiple queens can coordinate using neural insights');
    console.warn('5. The system learns and adapts over time\n');
  } catch (/* error */) {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  }
}
// Execute the demo
runDemo().catch(console.error);
