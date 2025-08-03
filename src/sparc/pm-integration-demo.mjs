#!/usr/bin/env node

/**
 * SPARC Project Management Integration Demo
 *
 * Demonstrates how SPARC integrates with enterprise project management
 * including ADRs, PRDs, Tasks, Features, Epics, and Roadmaps.
 */

import { SPARC, sparcMCPTools } from '../index.js';

async function demonstrateSPARCProjectManagementIntegration() {
  console.log('🚀 SPARC Project Management Integration Demo\n');

  try {
    // 1. Create a SPARC project
    console.log('1️⃣ Creating SPARC Project with Intelligence Agent Coordination...');
    const project = await SPARC.createProject(
      'Intelligent Agent Coordination System',
      'swarm-coordination',
      [
        'Dynamic agent registration and discovery',
        'Intelligent load balancing with fault tolerance',
        'Real-time consensus protocols',
        'Performance monitoring and optimization',
      ],
      'enterprise'
    );

    console.log(`   ✅ Project created: ${project.name} (${project.id})`);
    console.log(`   📊 Domain: ${project.domain}, Complexity: ${project.specification.complexity}`);
    console.log('');

    // 2. Generate project management artifacts via MCP
    console.log('2️⃣ Generating Project Management Artifacts...');
    const pmResult = await sparcMCPTools.handleToolCall('sparc_generate_pm_artifacts', {
      projectId: project.id,
      artifactTypes: ['all'],
    });

    console.log('   📋 Generated artifacts:');
    pmResult.artifactsGenerated.forEach((artifact) => {
      console.log(`      ${artifact.type}: ${artifact.status}`);
    });
    console.log('');

    // 3. Execute SPARC phases with ADR generation
    console.log('3️⃣ Executing SPARC Phases...');
    const phases = ['specification', 'pseudocode', 'architecture', 'refinement', 'completion'];

    for (const phase of phases) {
      console.log(`   🔄 Executing ${phase} phase...`);
      const phaseResult = await sparcMCPTools.handleToolCall('sparc_execute_phase', {
        projectId: project.id,
        phase: phase,
      });

      if (phaseResult.success) {
        console.log(
          `   ✅ ${phase} completed (${phaseResult.duration.toFixed(1)}min, ${(phaseResult.qualityScore * 100).toFixed(1)}% quality)`
        );
      } else {
        console.log(`   ❌ ${phase} failed: ${phaseResult.error}`);
      }
    }
    console.log('');

    // 4. Create Epic and Features
    console.log('4️⃣ Creating Epic and Features for Strategic Planning...');
    const epicResult = await sparcMCPTools.handleToolCall('sparc_create_epic', {
      projectId: project.id,
      includeFeatures: true,
    });

    console.log(`   📈 Epic Created: ${epicResult.epic.title}`);
    console.log(`   🎯 Business Value: ${epicResult.epic.businessValue}`);
    console.log(
      `   📅 Timeline: ${epicResult.epic.timeline.start_date} to ${epicResult.epic.timeline.end_date}`
    );
    console.log(`   🔢 Features Generated: ${epicResult.features.length}`);
    epicResult.features.forEach((feature) => {
      console.log(`      - ${feature.title} (${feature.status})`);
    });
    console.log('');

    // 5. Add to Roadmap
    console.log('5️⃣ Adding Project to Enterprise Roadmap...');
    const roadmapResult = await sparcMCPTools.handleToolCall('sparc_add_to_roadmap', {
      projectId: project.id,
      targetQuarter: '2024-Q3',
      priority: 'high',
    });

    console.log(`   🗺️ Added to roadmap: ${roadmapResult.targetQuarter}`);
    console.log(`   ⭐ Priority: ${roadmapResult.priority}`);
    console.log('');

    // 6. Generate Domain Roadmap
    console.log('6️⃣ Generating Swarm Coordination Domain Roadmap...');
    const domainRoadmapResult = await sparcMCPTools.handleToolCall(
      'sparc_generate_domain_roadmap',
      {
        domain: 'swarm-coordination',
        timeframe: {
          startQuarter: '2024-Q3',
          endQuarter: '2025-Q2',
        },
      }
    );

    console.log(`   📊 Domain Roadmap: ${domainRoadmapResult.roadmap.title}`);
    console.log(
      `   ⏱️ Timeframe: ${domainRoadmapResult.roadmap.timeframe.start_quarter} to ${domainRoadmapResult.roadmap.timeframe.end_quarter}`
    );
    console.log(`   📋 Strategic Items: ${domainRoadmapResult.itemCount}`);
    domainRoadmapResult.items.forEach((item) => {
      console.log(
        `      - ${item.title} (${item.type}, ${item.businessValue} value, ${item.effortEstimate} pts)`
      );
    });
    console.log('');

    // 7. Show integration overview
    console.log('7️⃣ SPARC ↔️ Project Management Integration Summary:');
    console.log('');
    console.log('   📝 ARTIFACTS GENERATED:');
    console.log('   ├── 📋 Tasks (tasks.json) - SPARC phases as structured tasks');
    console.log('   ├── 📄 PRD (docs/prds/) - Product Requirements Document');
    console.log('   ├── 🏛️ ADRs (docs/adrs/) - Architecture Decision Records');
    console.log('   ├── 📈 Epic (docs/epics.json) - Strategic epic for project');
    console.log('   ├── 🎯 Features (docs/features.json) - Breakdown into features');
    console.log('   └── 🗺️ Roadmap (docs/roadmap.json) - Strategic planning integration');
    console.log('');
    console.log('   🔄 WORKFLOW INTEGRATION:');
    console.log('   ├── Project Creation → Automatic task and PRD generation');
    console.log('   ├── Architecture Phase → ADR generation for decisions');
    console.log('   ├── Epic Creation → Strategic planning alignment');
    console.log('   ├── Feature Breakdown → Development planning');
    console.log('   └── Roadmap Integration → Quarterly planning');
    console.log('');
    console.log('   🎯 BUSINESS VALUE:');
    console.log('   ├── Consistent project management methodology');
    console.log('   ├── Automated documentation generation');
    console.log('   ├── Strategic alignment with business roadmaps');
    console.log('   ├── Traceability from epic to implementation');
    console.log('   └── Enterprise-grade project governance');
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Additional demonstration: Show file structure that would be created
function showProjectManagementFileStructure() {
  console.log('\n📁 PROJECT MANAGEMENT FILE STRUCTURE:');
  console.log('');
  console.log('claude-zen/');
  console.log('├── tasks.json                    # Task management integration');
  console.log('│   └── SPARC-PROJECT-001, 002... # Generated SPARC tasks');
  console.log('├── docs/');
  console.log('│   ├── adrs/                     # Architecture Decision Records');
  console.log('│   │   ├── adr-project-001.md    # Overall architecture ADR');
  console.log('│   │   └── adr-project-002.md    # Component-specific ADRs');
  console.log('│   ├── prds/                     # Product Requirements Documents');
  console.log('│   │   └── prd-project.md        # Generated PRD from SPARC spec');
  console.log('│   ├── epics.json                # Epic definitions for strategic planning');
  console.log('│   ├── features.json             # Feature breakdown and tracking');
  console.log('│   └── roadmap.json              # Enterprise roadmap planning');
  console.log('└── src/sparc/                    # SPARC methodology system');
  console.log('    ├── integrations/             # Project management integrations');
  console.log('    │   ├── project-management-integration.ts');
  console.log('    │   └── roadmap-integration.ts');
  console.log('    └── core/                     # Core SPARC engine with PM integration');
  console.log('');
}

// Run the demonstration
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateSPARCProjectManagementIntegration()
    .then(() => {
      showProjectManagementFileStructure();
      console.log('\n✨ SPARC Project Management Integration Demo Complete!');
    })
    .catch(console.error);
}

export { demonstrateSPARCProjectManagementIntegration };
