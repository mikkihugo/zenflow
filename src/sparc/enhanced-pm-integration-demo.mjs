#!/usr/bin/env node

/**
 * Enhanced SPARC Project Management Integration Demo
 *
 * Demonstrates how SPARC methodology integrates with existing Claude-Zen infrastructure:
 * - TaskAPI and EnhancedTaskTool integration
 * - TaskDistributionEngine coordination
 * - Existing ADR template structure
 * - Comprehensive epic and feature management
 * - Full project management artifact generation
 */

import { SPARC } from './index.js';
import { sparcMCPTools } from './integrations/mcp-sparc-tools.js';

async function demonstrateEnhancedIntegration() {
  console.log('🚀 SPARC Enhanced Project Management Integration Demo');
  console.log('='.repeat(60));

  try {
    // 1. Create SPARC project with swarm coordination template
    console.log('\n📋 Step 1: Create SPARC Project');
    const project = await SPARC.createProject(
      'Intelligent Load Balancer',
      'swarm-coordination',
      [
        'Dynamic load distribution across agent swarm',
        'Real-time performance monitoring',
        'Automatic failover and recovery',
        'Scalable architecture for 1000+ agents',
      ],
      'moderate'
    );

    console.log(`✅ Created project: ${project.name} (ID: ${project.id})`);
    console.log(`   Domain: ${project.domain}`);
    console.log(`   Complexity: ${project.complexity}`);

    // 2. Generate comprehensive project management artifacts
    console.log('\n📊 Step 2: Generate Project Management Artifacts');
    console.log('   Integrating with existing Claude-Zen infrastructure...');

    const pmArtifacts = await sparcMCPTools.handleGenerateProjectManagementArtifacts({
      projectId: project.id,
      artifactTypes: ['all'],
    });

    console.log('✅ Generated comprehensive project management suite:');
    console.log(`   Integration: ${pmArtifacts.integration.taskAPI}`);
    console.log(`   Coordination: ${pmArtifacts.integration.coordination}`);
    console.log(`   ADR Template: ${pmArtifacts.integration.adrTemplate}`);

    // Display artifact summary
    if (pmArtifacts.artifactsGenerated) {
      pmArtifacts.artifactsGenerated.forEach((artifact) => {
        if (artifact.type === 'comprehensive') {
          console.log('\n📈 Comprehensive Artifacts Generated:');
          console.log(`   - Tasks: ${artifact.summary.tasks} (with TaskAPI integration)`);
          console.log(`   - ADRs: ${artifact.summary.adrs} (using existing template)`);
          console.log(`   - PRD: ${artifact.summary.prd} (comprehensive)`);
          console.log(`   - Epics: ${artifact.summary.epics} (strategic planning)`);
          console.log(`   - Features: ${artifact.summary.features} (phase breakdown)`);
        } else {
          console.log(
            `   ✓ ${artifact.type}: ${artifact.status} ${artifact.count ? `(${artifact.count} items)` : ''}`
          );
          if (artifact.message) console.log(`     ${artifact.message}`);
        }
      });
    }

    // 3. Create epic and features for strategic planning
    console.log('\n🎯 Step 3: Strategic Planning Integration');
    const epicResult = await sparcMCPTools.handleCreateEpic({
      projectId: project.id,
      includeFeatures: true,
    });

    console.log('✅ Created strategic planning artifacts:');
    console.log(`   Epic: ${epicResult.epic.title}`);
    console.log(`   Business Value: ${epicResult.epic.businessValue}`);
    console.log(`   Features: ${epicResult.features.length} features generated`);

    epicResult.features.forEach((feature) => {
      console.log(`   - ${feature.title} (${feature.status})`);
    });

    // 4. Add to enterprise roadmap
    console.log('\n🗺️ Step 4: Enterprise Roadmap Integration');
    const roadmapResult = await sparcMCPTools.handleAddToRoadmap({
      projectId: project.id,
      targetQuarter: '2024-Q3',
      priority: 'high',
    });

    console.log('✅ Added to enterprise roadmap:');
    console.log(`   Project: ${roadmapResult.projectName}`);
    console.log(`   Quarter: ${roadmapResult.targetQuarter}`);
    console.log(`   Priority: ${roadmapResult.priority}`);

    // 5. Execute SPARC workflow with task coordination
    console.log('\n⚙️ Step 5: Execute SPARC Workflow');
    console.log('   Executing phases with enhanced task coordination...');

    const workflowResult = await sparcMCPTools.handleExecuteFullWorkflow({
      projectId: project.id,
      options: {
        generateArtifacts: true,
        includeDemo: false,
        skipValidation: false,
      },
    });

    console.log('✅ SPARC workflow execution completed:');
    console.log(`   Phases executed: ${workflowResult.executedPhases}`);
    workflowResult.results.forEach((result) => {
      console.log(
        `   - ${result.phase}: ${result.success ? '✓' : '✗'} ${result.duration ? `(${result.duration} min)` : ''}`
      );
    });

    // 6. Generate domain roadmap for swarm coordination
    console.log('\n🌐 Step 6: Domain Strategic Roadmap');
    const domainRoadmap = await sparcMCPTools.handleGenerateDomainRoadmap({
      domain: 'swarm-coordination',
      timeframe: {
        startQuarter: '2024-Q3',
        endQuarter: '2025-Q2',
      },
    });

    console.log('✅ Generated domain roadmap:');
    console.log(`   Domain: ${domainRoadmap.domain}`);
    console.log(`   Items: ${domainRoadmap.items.length} strategic initiatives`);
    domainRoadmap.items.forEach((item) => {
      console.log(
        `   - ${item.title} (${item.businessValue} value, ${item.effortEstimate} points)`
      );
    });

    // Summary
    console.log('\n🎉 Enhanced Integration Summary');
    console.log('='.repeat(60));
    console.log('✅ SPARC methodology successfully integrated with existing infrastructure:');
    console.log('   • TaskAPI and EnhancedTaskTool for task management');
    console.log('   • TaskDistributionEngine for coordination');
    console.log('   • Existing ADR template structure');
    console.log('   • Comprehensive epic and feature management');
    console.log('   • Strategic roadmap planning');
    console.log('   • Full traceability from epic → features → tasks → implementation');
    console.log('\n📁 Files Generated:');
    console.log('   • tasks.json (updated with SPARC tasks)');
    console.log('   • docs/adrs/ (architecture decisions)');
    console.log('   • docs/prds/ (product requirements)');
    console.log('   • docs/epics.json (strategic epics)');
    console.log('   • docs/features.json (feature breakdown)');
    console.log('   • docs/roadmap.json (enterprise roadmap)');
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    process.exit(1);
  }
}

// Run the demo
demonstrateEnhancedIntegration().catch(console.error);
