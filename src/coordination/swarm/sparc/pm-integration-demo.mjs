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
  try {
    const project = await SPARC.createProject(
      'Intelligent Load Balancer',
      'swarm-coordination',
      [
        'Dynamic load distribution across agent swarm',
        'Real-time performance monitoring',
        'Automatic failover and recovery',
        'Scalable architecture for 1000+ agents',
      ],
      'moderate',
    );

    const pmArtifacts = await sparcMCPTools.handleGenerateProjectManagementArtifacts({
      projectId: project.id,
      artifactTypes: ['all'],
    });

    // Display artifact summary
    if (pmArtifacts.artifactsGenerated) {
      pmArtifacts.artifactsGenerated.forEach((artifact) => {
        if (artifact.type === 'comprehensive') {
        } else {
          if (artifact.message) {
          }
        }
      });
    }
    const epicResult = await sparcMCPTools.handleCreateEpic({
      projectId: project.id,
      includeFeatures: true,
    });

    epicResult.features.forEach((_feature) => {});

    const roadmapResult = await sparcMCPTools.handleAddToRoadmap({
      projectId: project.id,
      targetQuarter: '2024-Q3',
      priority: 'high',
    });
    if (roadmapResult.milestones) {
    }

    const workflowResult = await sparcMCPTools.handleExecuteFullWorkflow({
      projectId: project.id,
      options: {
        generateArtifacts: true,
        includeDemo: false,
        skipValidation: false,
      },
    });
    workflowResult.results.forEach((_result) => {});
    const domainRoadmap = await sparcMCPTools.handleGenerateDomainRoadmap({
      domain: 'swarm-coordination',
      timeframe: {
        startQuarter: '2024-Q3',
        endQuarter: '2025-Q2',
      },
    });
    domainRoadmap.items.forEach((_item) => {});
  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    process.exit(1);
  }
}

// Run the demo
demonstrateEnhancedIntegration().catch(console.error);
