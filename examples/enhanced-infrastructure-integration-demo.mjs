#!/usr/bin/env node

/**
 * Enhanced SPARC Infrastructure Integration Demo
 *
 * Demonstrates SPARC integration with existing Claude-Zen infrastructure:
 * - DocumentDrivenSystem for document workflow management
 * - UnifiedWorkflowEngine for Vision → ADRs → PRDs → Epics → Features → Tasks
 * - TaskAPI & EnhancedTaskTool for task coordination
 * - Existing ADR templates and project management patterns
 */

import { SPARCMCPTools } from '../src/sparc/integrations/mcp-sparc-tools.js';
import { ProjectManagementIntegration } from '../src/sparc/integrations/project-management-integration.js';

// Initialize enhanced infrastructure
const sparcTools = new SPARCMCPTools();
const pmIntegration = new ProjectManagementIntegration();

// Initialize infrastructure systems
try {
  await pmIntegration.initialize();
} catch (_error) {}
const createResult = await sparcTools.handleToolCall('sparc_create_project', {
  name: 'Enhanced Document System',
  domain: 'swarm-coordination',
  complexity: 'moderate',
  requirements: [
    'Integrate with existing DocumentDrivenSystem',
    'Use UnifiedWorkflowEngine for document workflows',
    'Leverage TaskAPI for task coordination',
    'Follow existing ADR template structure',
  ],
});
const artifactsResult = await sparcTools.handleToolCall('sparc_generate_pm_artifacts', {
  projectId: createResult.projectId,
  artifactTypes: ['all'], // tasks, adrs, prd, epics, features
});

if (artifactsResult.success) {
} else {
}
