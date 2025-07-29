#!/usr/bin/env node

/**
 * Neural Architecture Advisor Example
 * Demonstrates how the ArchitectAdvisor Queen uses neural networks
 * to provide intelligent architectural recommendations
 */

import { ArchitectAdvisor } from '../src/queens/architect-advisor.js';
import { createQueenCoordinator } from '../src/queens/index.js';
import { Logger } from '../src/utils/logger.js';

const logger = new Logger('ArchitectureExample');

async function demonstrateArchitectureAnalysis() {
    console.log('🏗️  Neural Architecture Advisor Demo\n');
    console.log('This example shows how neural networks enhance architectural decisions.\n');
    
    // Initialize the architect advisor
    const architect = new ArchitectAdvisor();
    
    // Test scenarios with varying complexity
    const scenarios = [
        {
            id: 'scenario-1',
            type: 'architecture-analysis',
            prompt: 'Design architecture for a startup MVP e-commerce platform with 3 developers, needs to launch in 6 weeks, expecting 1000 users initially',
            context: {
                budget: 'limited',
                team: 'small',
                timeline: 'aggressive'
            }
        },
        {
            id: 'scenario-2',
            type: 'architecture-analysis',
            prompt: 'Architecture for a high-traffic social media platform requiring real-time updates, handling 10M daily active users, with features like chat, feed, notifications, and video streaming',
            context: {
                scale: 'massive',
                requirements: {
                    realTime: true,
                    highAvailability: true
                }
            }
        },
        {
            id: 'scenario-3',
            type: 'architecture-analysis',
            prompt: 'Design a secure financial transaction processing system with strict compliance requirements, needs 99.99% uptime, handles sensitive data, integrates with multiple banks',
            context: {
                industry: 'fintech',
                compliance: ['PCI-DSS', 'SOC2'],
                requirements: {
                    security: true,
                    reliability: true
                }
            }
        },
        {
            id: 'scenario-4',
            type: 'architecture-analysis',
            prompt: 'Build an AI-powered content recommendation engine that processes millions of articles daily, requires machine learning pipelines, A/B testing, and real-time personalization',
            context: {
                dataVolume: 'high',
                mlRequired: true,
                requirements: {
                    scalability: true,
                    performance: true
                }
            }
        }
    ];
    
    // Process each scenario
    for (const scenario of scenarios) {
        console.log(`\n${'='.repeat(80)}`);
        console.log(`📋 Scenario: ${scenario.id}`);
        console.log(`   Question: ${scenario.prompt}\n`);
        
        const result = await architect.process(scenario);
        
        console.log(`🏛️  Recommended Architecture: ${result.recommendation.architecture.toUpperCase()}`);
        console.log(`   Confidence: ${(result.confidence * 100).toFixed(1)}%`);
        console.log(`   Neural Contribution: ${(result.metadata.neuralContribution * 100).toFixed(1)}%`);
        
        console.log(`\n📐 Architecture Pattern:`);
        console.log(`   ${result.recommendation.pattern.description}`);
        console.log(`   ✅ Pros: ${result.recommendation.pattern.pros.join(', ')}`);
        console.log(`   ⚠️  Cons: ${result.recommendation.pattern.cons.join(', ')}`);
        
        console.log(`\n🔧 Key Components:`);
        result.recommendation.components.forEach(component => {
            console.log(`   - ${component}`);
        });
        
        console.log(`\n💻 Recommended Technologies:`);
        const tech = result.recommendation.technologies;
        if (tech.languages) console.log(`   Languages: ${tech.languages.join(', ')}`);
        if (tech.databases) console.log(`   Databases: ${tech.databases.join(', ')}`);
        if (tech.deployment) console.log(`   Deployment: ${tech.deployment.join(', ')}`);
        if (tech.suggested) console.log(`   Neural Suggested: ${tech.suggested.join(', ')}`);
        
        console.log(`\n📋 Implementation Plan:`);
        result.recommendation.implementation.slice(0, 3).forEach((step, idx) => {
            console.log(`   ${idx + 1}. ${step}`);
        });
        console.log(`   ... and ${result.recommendation.implementation.length - 3} more steps`);
        
        if (result.recommendation.neuralInsights) {
            console.log(`\n🧠 Neural Insights:`);
            console.log(`   "${result.recommendation.neuralInsights.substring(0, 150)}..."`);
        }
        
        console.log(`\n🎯 Reasoning:`);
        console.log(result.reasoning.split('\n').map(line => `   ${line}`).join('\n'));
        
        if (result.alternatives && result.alternatives.length > 0) {
            console.log(`\n🔄 Alternative Approaches:`);
            result.alternatives.forEach(alt => {
                console.log(`   - ${alt.architecture} (${(alt.suitability * 100).toFixed(0)}% suitable)`);
                console.log(`     ${alt.whenToUse}`);
            });
        }
        
        console.log(`\n⏱️  Processing Time: ${result.processingTime.toFixed(0)}ms`);
    }
}

async function demonstrateQueenCoordination() {
    console.log(`\n\n${'='.repeat(80)}`);
    console.log('👑 Demonstrating Multi-Queen Coordination with Neural Networks\n');
    
    // Create a coordinator with multiple queens including our architect
    const coordinator = await createQueenCoordinator({
        queens: ['CodeQueen', 'ArchitectAdvisor', 'DebugQueen'],
        consensus: 'weighted',
        database: {
            type: 'sqlite',
            path: ':memory:'
        }
    });
    
    // Complex task that benefits from multiple perspectives
    const complexTask = {
        id: 'complex-1',
        type: 'full-stack-development',
        prompt: 'Build a complete real-time collaborative document editing system like Google Docs',
        context: {
            requirements: {
                realTime: true,
                collaboration: true,
                scalability: true,
                security: true
            }
        }
    };
    
    console.log(`📋 Complex Task: ${complexTask.prompt}\n`);
    
    // Let the coordinator handle it
    const coordinatedResult = await coordinator.processTask(complexTask);
    
    console.log('🏆 Coordinated Result:');
    console.log(`   Primary Queen: ${coordinatedResult.primaryQueen}`);
    console.log(`   Overall Confidence: ${(coordinatedResult.confidence * 100).toFixed(1)}%`);
    console.log(`   Queens Involved: ${coordinatedResult.queensInvolved.join(', ')}`);
    
    console.log('\n📊 Individual Queen Contributions:');
    coordinatedResult.allResults.forEach(result => {
        console.log(`\n   ${result.queenName}:`);
        console.log(`   - Confidence: ${(result.confidence * 100).toFixed(1)}%`);
        console.log(`   - Processing Time: ${result.processingTime.toFixed(0)}ms`);
        if (result.metadata?.neuralContribution) {
            console.log(`   - Neural Contribution: ${(result.metadata.neuralContribution * 100).toFixed(1)}%`);
        }
    });
    
    // Shut down coordinator
    await coordinator.stop();
}

async function demonstrateNeuralLearning() {
    console.log(`\n\n${'='.repeat(80)}`);
    console.log('🧠 Demonstrating Neural Network Learning & Adaptation\n');
    
    const architect = new ArchitectAdvisor();
    
    // Simulate multiple similar requests to show cache and learning effects
    const iterations = 3;
    const basePrompt = 'Design a microservices architecture for an e-commerce platform with high scalability needs';
    
    for (let i = 0; i < iterations; i++) {
        console.log(`\n🔄 Iteration ${i + 1}:`);
        
        const task = {
            id: `learning-${i}`,
            type: 'architecture-analysis',
            prompt: basePrompt + (i > 0 ? ` (iteration ${i + 1})` : ''),
            context: {
                requirements: {
                    scalability: true,
                    performance: true
                }
            }
        };
        
        const startTime = Date.now();
        const result = await architect.process(task);
        const totalTime = Date.now() - startTime;
        
        console.log(`   Processing Time: ${totalTime}ms`);
        console.log(`   Neural Engine Time: ${result.processingTime.toFixed(0)}ms`);
        console.log(`   Confidence: ${(result.confidence * 100).toFixed(1)}%`);
        
        // Show if result was cached
        const neuralStats = architect.neuralEngine.getStats();
        console.log(`   Cache Size: ${neuralStats.cacheSize}`);
        console.log(`   Total Inferences: ${neuralStats.totalInferences}`);
        if (neuralStats.totalInferences > 0) {
            const hitRate = (neuralStats.cacheHits / neuralStats.totalInferences * 100).toFixed(1);
            console.log(`   Cache Hit Rate: ${hitRate}%`);
        }
    }
    
    // Show final neural engine statistics
    console.log('\n📊 Final Neural Engine Statistics:');
    const finalStats = architect.neuralEngine.getStats();
    console.log(`   Total Models: ${finalStats.totalModels}`);
    console.log(`   Loaded Models: ${finalStats.loadedModels}`);
    console.log(`   Has Bindings: ${finalStats.hasBindings}`);
    console.log(`   Cache Size: ${finalStats.cacheSize}`);
    console.log(`   Total Inferences: ${finalStats.totalInferences}`);
}

// Run all demonstrations
async function runDemo() {
    try {
        await demonstrateArchitectureAnalysis();
        await demonstrateQueenCoordination();
        await demonstrateNeuralLearning();
        
        console.log(`\n\n${'='.repeat(80)}`);
        console.log('✅ Neural Network Integration Demo Complete!\n');
        console.log('Key Takeaways:');
        console.log('1. Neural networks enhance decision-making with pattern recognition');
        console.log('2. Fallback mechanisms ensure reliability when neural models are unavailable');
        console.log('3. Caching improves performance for repeated queries');
        console.log('4. Multiple queens can coordinate using neural insights');
        console.log('5. The system learns and adapts over time\n');
        
    } catch (error) {
        console.error('❌ Demo failed:', error);
        process.exit(1);
    }
}

// Execute the demo
runDemo().catch(console.error);