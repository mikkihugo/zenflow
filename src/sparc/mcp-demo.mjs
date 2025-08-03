#!/usr/bin/env node

/**
 * SPARC MCP Tools Demo
 * Tests the MCP integration for SPARC methodology
 */

import { sparcMCPTools } from '../sparc/integrations/mcp-sparc-tools.js';

async function runMCPDemo() {
  console.log('🔌 Starting SPARC MCP Tools Demo...\n');

  try {
    // Test tool definitions
    console.log('📋 Getting available MCP tools...');
    const tools = sparcMCPTools.getTools();
    console.log(`   Available tools: ${tools.length}`);
    tools.forEach((tool) => {
      console.log(`   - ${tool.name}: ${tool.description.substring(0, 50)}...`);
    });

    // Test project creation via MCP
    console.log('\n🚀 Creating project via MCP...');
    const createArgs = {
      name: 'MCP Demo Project',
      domain: 'neural-networks',
      complexity: 'high',
      requirements: [
        'Neural network training with WASM acceleration',
        'Real-time inference capabilities',
        'Model versioning and management',
        'Performance monitoring',
      ],
    };

    const createResult = await sparcMCPTools.handleToolCall('sparc_create_project', createArgs);
    console.log(`   Success: ${createResult.success}`);
    console.log(`   Project ID: ${createResult.projectId}`);
    console.log(`   Domain: ${createResult.project.domain}`);

    // Test phase execution via MCP
    console.log('\n📝 Executing specification phase via MCP...');
    const executeArgs = {
      projectId: createResult.projectId,
      phase: 'specification',
      options: {
        aiAssisted: true,
      },
    };

    const executeResult = await sparcMCPTools.handleToolCall('sparc_execute_phase', executeArgs);
    console.log(`   Phase: ${executeResult.phase}`);
    console.log(`   Duration: ${executeResult.duration}`);
    console.log(`   Quality Score: ${executeResult.qualityScore}`);
    console.log(`   Next Phase: ${executeResult.nextPhase}`);

    // Test project status via MCP
    console.log('\n📊 Getting project status via MCP...');
    const statusArgs = {
      projectId: createResult.projectId,
      includeDetails: true,
    };

    const statusResult = await sparcMCPTools.handleToolCall('sparc_get_project_status', statusArgs);
    console.log(`   Project: ${statusResult.name}`);
    console.log(`   Progress: ${statusResult.overallProgress}`);
    console.log(`   Completed phases: ${statusResult.completedPhases.length}`);

    // Test artifact generation via MCP
    console.log('\n📦 Generating artifacts via MCP...');
    const artifactArgs = {
      projectId: createResult.projectId,
      artifactTypes: ['specification', 'architecture'],
    };

    const artifactResult = await sparcMCPTools.handleToolCall(
      'sparc_generate_artifacts',
      artifactArgs
    );
    console.log(`   Artifacts generated: ${artifactResult.artifactCount}`);
    console.log(`   Total size: ${artifactResult.totalSize}`);

    // Test project listing via MCP
    console.log('\n📋 Listing projects via MCP...');
    const listResult = await sparcMCPTools.handleToolCall('sparc_list_projects', {});
    console.log(`   Total projects: ${listResult.totalProjects}`);

    // Test completion validation via MCP
    console.log('\n🎯 Validating completion via MCP...');
    const validationArgs = {
      projectId: createResult.projectId,
      criteria: {
        minimumScore: 0.8,
        requireAllPhases: false,
      },
    };

    const validationResult = await sparcMCPTools.handleToolCall(
      'sparc_validate_completion',
      validationArgs
    );
    console.log(`   Ready for production: ${validationResult.readyForProduction}`);
    console.log(`   Overall score: ${validationResult.overallScore}`);
    console.log(`   Blockers: ${validationResult.blockers.length}`);

    console.log('\n🎉 SPARC MCP Demo completed successfully!');

    return {
      success: true,
      toolsCount: tools.length,
      projectId: createResult.projectId,
      results: {
        create: createResult,
        execute: executeResult,
        status: statusResult,
        artifacts: artifactResult,
        validation: validationResult,
      },
    };
  } catch (error) {
    console.error('❌ SPARC MCP Demo failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Run the demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMCPDemo()
    .then((result) => {
      if (result.success) {
        console.log('\n📊 MCP Demo Results Summary:');
        console.log(`   MCP tools available: ${result.toolsCount}`);
        console.log(`   Project created: ${result.projectId}`);
        console.log(`   Phase executed: ${result.results.execute.phase}`);
        console.log(`   Artifacts generated: ${result.results.artifacts.artifactCount}`);
        process.exit(0);
      } else {
        console.error('\n💥 MCP Demo failed with error:', result.error);
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('💥 Unexpected error:', error);
      process.exit(1);
    });
}

export { runMCPDemo };
