#!/usr/bin/env node

/**
 * SPARC MCP Tools Demo
 * Tests the MCP integration for SPARC methodology
 */

import { sparcMCPTools } from '../sparc/integrations/mcp-sparc-tools.js';

async function runMCPDemo() {
  try {
    const tools = sparcMCPTools.getTools();
    tools.forEach((_tool) => {});
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
    const executeArgs = {
      projectId: createResult.projectId,
      phase: 'specification',
      options: {
        aiAssisted: true,
      },
    };

    const executeResult = await sparcMCPTools.handleToolCall('sparc_execute_phase', executeArgs);
    const statusArgs = {
      projectId: createResult.projectId,
      includeDetails: true,
    };

    const statusResult = await sparcMCPTools.handleToolCall('sparc_get_project_status', statusArgs);
    const artifactArgs = {
      projectId: createResult.projectId,
      artifactTypes: ['specification', 'architecture'],
    };

    const artifactResult = await sparcMCPTools.handleToolCall(
      'sparc_generate_artifacts',
      artifactArgs,
    );
    const _listResult = await sparcMCPTools.handleToolCall('sparc_list_projects', {});
    const validationArgs = {
      projectId: createResult.projectId,
      criteria: {
        minimumScore: 0.8,
        requireAllPhases: false,
      },
    };

    const validationResult = await sparcMCPTools.handleToolCall(
      'sparc_validate_completion',
      validationArgs,
    );

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
