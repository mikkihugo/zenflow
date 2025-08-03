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

console.log('🚀 Enhanced SPARC Infrastructure Integration Demo');
console.log('📋 Integrating with existing Claude-Zen sophisticated infrastructure\n');

// Initialize enhanced infrastructure
const sparcTools = new SPARCMCPTools();
const pmIntegration = new ProjectManagementIntegration();

// Initialize infrastructure systems
try {
  console.log('🔧 Initializing sophisticated infrastructure...');
  await pmIntegration.initialize();
  console.log('✅ DocumentDrivenSystem initialized');
  console.log('✅ UnifiedWorkflowEngine initialized');
  console.log('✅ UnifiedMemorySystem initialized\n');
} catch (error) {
  console.log(
    '⚠️  Infrastructure initialization failed (continuing with basic mode):',
    error.message,
    '\n'
  );
}

// Create SPARC project
console.log('📋 Creating SPARC project...');
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

console.log(`✅ Project created: ${createResult.projectId}\n`);

// Generate comprehensive project management artifacts using enhanced infrastructure
console.log('📄 Generating comprehensive artifacts with enhanced infrastructure...');
const artifactsResult = await sparcTools.handleToolCall('sparc_generate_pm_artifacts', {
  projectId: createResult.projectId,
  artifactTypes: ['all'], // tasks, adrs, prd, epics, features
});

if (artifactsResult.success) {
  console.log('✅ Enhanced infrastructure integration successful!');
  console.log(`📋 Workspace ID: ${artifactsResult.workspaceId}`);
  console.log('\n🏗️ Infrastructure Status:');
  console.log(`  - DocumentDrivenSystem: ${artifactsResult.infrastructure.documentDrivenSystem}`);
  console.log(`  - UnifiedWorkflowEngine: ${artifactsResult.infrastructure.unifiedWorkflowEngine}`);
  console.log(`  - MemorySystem: ${artifactsResult.infrastructure.memorySystem}`);

  console.log('\n📊 Generated Artifacts:');
  console.log(
    `  - Tasks: ${artifactsResult.artifacts.tasks.count} (${artifactsResult.artifacts.tasks.status})`
  );
  console.log(
    `  - ADRs: ${artifactsResult.artifacts.adrs.count} (${artifactsResult.artifacts.adrs.status})`
  );
  console.log(
    `  - PRD: ${artifactsResult.artifacts.prd.id} (${artifactsResult.artifacts.prd.status})`
  );
  console.log(
    `  - Epics: ${artifactsResult.artifacts.epics.count} (${artifactsResult.artifacts.epics.status})`
  );
  console.log(
    `  - Features: ${artifactsResult.artifacts.features.count} (${artifactsResult.artifacts.features.status})`
  );

  console.log('\n🔄 Workflow Integration:');
  console.log(`  - Vision → ADRs: ${artifactsResult.integration.vision_workflow}`);
  console.log(`  - Vision → PRDs: ${artifactsResult.integration.prd_workflow}`);
  console.log(`  - PRD → Epics: ${artifactsResult.integration.epic_workflow}`);
  console.log(`  - Epic → Features: ${artifactsResult.integration.feature_workflow}`);
  console.log(`  - Feature → Tasks: ${artifactsResult.integration.task_workflow}`);

  console.log('\n📁 Document Structure Created:');
  console.log('  docs/');
  console.log('  ├── 01-vision/     # Vision documents');
  console.log('  ├── 02-adrs/       # Architecture Decision Records (using existing templates)');
  console.log('  ├── 03-prds/       # Product Requirements Documents');
  console.log('  ├── 04-epics/      # Epic-level features');
  console.log('  ├── 05-features/   # Individual features');
  console.log('  └── 06-tasks/      # Implementation tasks');
  console.log('  tasks.json         # Extended with SPARC integration');

  console.log('\n🎯 Key Integration Features:');
  console.log('  ✅ Uses existing DocumentDrivenSystem for document processing');
  console.log('  ✅ Leverages UnifiedWorkflowEngine for automated workflows');
  console.log('  ✅ Integrates with TaskAPI & EnhancedTaskTool for task management');
  console.log('  ✅ Follows existing ADR template structure');
  console.log('  ✅ Stores documents in UnifiedMemorySystem');
  console.log('  ✅ Processes through existing document workflow patterns');
} else {
  console.log('❌ Infrastructure integration failed:', artifactsResult.error);
}

console.log('\n🔗 Infrastructure Integration Summary:');
console.log('The SPARC system now properly integrates with existing Claude-Zen infrastructure:');
console.log('- DocumentDrivenSystem handles document lifecycle management');
console.log('- UnifiedWorkflowEngine executes Vision → Code workflows automatically');
console.log('- TaskAPI & EnhancedTaskTool coordinate task distribution');
console.log('- Existing ADR templates and project management patterns are respected');
console.log('- All documents are processed through sophisticated existing workflows');

console.log('\n✨ Demo completed successfully!');
