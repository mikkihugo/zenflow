#!/usr/bin/env node
/**
 * SPARC Architecture Engine CLI
 * Standalone CLI for SPARC Phase 3: Architecture Generation
 */

import { Command } from 'commander';
import { writeFile, readFile } from 'fs/promises';

const program = new Command();

program
  .name('sparc-architecture-cli')
  .description('SPARC Phase 3: Architecture Generation CLI')
  .version('1.0.0');

// Generate architecture command
program
  .command('generate')
  .description('Generate system architecture from pseudocode')
  .requiredOption('--pseudocode-file <path>', 'Path to pseudocode JSON file')
  .option('--spec-file <path>', 'Path to specification JSON file for additional context')
  .option('--output <path>', 'Output file path for architecture', 'architecture.json')
  .option('--format <format>', 'Output format (json|markdown)', 'json')
  .action(async (options) => {
    try {
      console.log('🏗️ Generating system architecture from pseudocode...');

      const { ArchitecturePhaseEngine } = await import('./coordination/swarm/sparc/phases/architecture/architecture-engine');

      const engine = new ArchitecturePhaseEngine();

      // Read pseudocode file
      const pseudocodeContent = await readFile(options.pseudocodeFile, 'utf8');
      let pseudocodeData = JSON.parse(pseudocodeContent);

      console.log(`📖 Processing pseudocode: ${pseudocodeData.id || 'Unknown'}`);
      console.log(`🧮 Algorithms: ${pseudocodeData.algorithms?.length || 0}`);

      // Convert to expected format if needed
      if (Array.isArray(pseudocodeData)) {
        pseudocodeData = {
          id: 'generated-' + Date.now(),
          algorithms: pseudocodeData,
          coreAlgorithms: pseudocodeData,
          dataStructures: [],
          controlFlows: [],
          optimizations: [],
          dependencies: []
        };
      }

      // Read specification if provided
      let specification = null;
      if (options.specFile) {
        const specContent = await readFile(options.specFile, 'utf8');
        specification = JSON.parse(specContent);
        console.log(`📋 Using specification: ${specification.id || 'Unknown'}`);
      }

      // Generate architecture
      let architecture;
      if (specification) {
        const systemArchitecture = await engine.designSystemArchitecture(specification, pseudocodeData.algorithms);
        architecture = {
          systemArchitecture,
          components: systemArchitecture.components,
          interfaces: systemArchitecture.interfaces,
          dataFlow: systemArchitecture.dataFlow,
          qualityAttributes: systemArchitecture.qualityAttributes,
          architecturalPatterns: systemArchitecture.architecturalPatterns
        };
      } else {
        // Use internal method when only pseudocode is available
        console.log('⚠️ No specification provided - using pseudocode-only generation');
        architecture = await (engine as any).designArchitecture(pseudocodeData);
      }

      console.log('✅ Architecture generation completed!');
      console.log(`🏗️ Generated ${architecture.components?.length || 0} components`);
      console.log(`🔌 Generated ${architecture.systemArchitecture?.interfaces?.length || 0} interfaces`);
      console.log(`🔄 Generated ${architecture.systemArchitecture?.dataFlow?.length || 0} data flows`);
      console.log(`📊 Defined ${architecture.systemArchitecture?.qualityAttributes?.length || 0} quality attributes`);
      console.log(`🎯 Applied ${architecture.systemArchitecture?.architecturalPatterns?.length || 0} architecture patterns`);

      // Format output
      let output: string;
      let outputPath = options.output;

      if (options.format === 'markdown') {
        output = generateArchitectureMarkdown(architecture);
        outputPath = outputPath.replace(/\.json$/, '.md');
      } else {
        output = JSON.stringify(architecture, null, 2);
      }

      // Write output
      await writeFile(outputPath, output, 'utf8');
      console.log(`💾 Architecture saved to: ${outputPath}`);

    } catch (error) {
      console.error('❌ Failed to generate architecture:', error);
      process.exit(1);
    }
  });

// Validate architecture command
program
  .command('validate')
  .description('Validate architecture design for consistency and quality')
  .requiredOption('--architecture-file <path>', 'Path to architecture JSON file')
  .option('--detailed', 'Show detailed validation results')
  .action(async (options) => {
    try {
      console.log('🔍 Validating architecture design...');

      const { ArchitecturePhaseEngine } = await import('./coordination/swarm/sparc/phases/architecture/architecture-engine');

      const engine = new ArchitecturePhaseEngine();

      // Read architecture file
      const archContent = await readFile(options.architectureFile, 'utf8');
      const architecture = JSON.parse(archContent);

      console.log(`📖 Validating architecture: ${architecture.id || 'Unknown'}`);

      // Validate architecture
      const validationResults = await engine.validateArchitecture(architecture);

      // Calculate overall score
      const overallScore = validationResults.reduce((sum, result) => sum + result.score, 0) / validationResults.length;
      const passed = validationResults.filter(r => r.passed).length;
      const total = validationResults.length;

      console.log('\n📋 Validation Results:');
      console.log(`  Overall Score: ${(overallScore * 100).toFixed(1)}%`);
      console.log(`  Tests Passed: ${passed}/${total}`);
      console.log(`  Status: ${overallScore >= 0.7 ? '✅ APPROVED' : '❌ NEEDS IMPROVEMENT'}`);

      if (options.detailed) {
        console.log('\n📝 Detailed Results:');
        validationResults.forEach((result, index) => {
          const status = result.passed ? '✅' : '❌';
          console.log(`  ${index + 1}. ${status} ${result.criterion}`);
          console.log(`     Score: ${(result.score * 100).toFixed(1)}%`);
          console.log(`     Feedback: ${result.feedback}`);
        });
      }

      // Exit with appropriate code
      process.exit(overallScore >= 0.7 ? 0 : 1);

    } catch (error) {
      console.error('❌ Failed to validate architecture:', error);
      process.exit(1);
    }
  });

// Generate implementation plan command
program
  .command('plan')
  .description('Generate implementation plan from architecture')
  .requiredOption('--architecture-file <path>', 'Path to architecture JSON file')
  .option('--output <path>', 'Output file path for implementation plan', 'implementation-plan.json')
  .option('--format <format>', 'Output format (json|markdown)', 'json')
  .action(async (options) => {
    try {
      console.log('📋 Generating implementation plan from architecture...');

      const { ArchitecturePhaseEngine } = await import('./coordination/swarm/sparc/phases/architecture/architecture-engine');

      const engine = new ArchitecturePhaseEngine();

      // Read architecture file
      const archContent = await readFile(options.architectureFile, 'utf8');
      const architecture = JSON.parse(archContent);

      console.log(`📖 Processing architecture: ${architecture.id || 'Unknown'}`);

      // Generate implementation plan
      const implementationPlan = await engine.generateImplementationPlan(architecture);

      console.log('✅ Implementation plan generation completed!');
      console.log(`📅 Timeline: ${implementationPlan.timeline.totalDuration}`);
      console.log(`🎯 Phases: ${implementationPlan.phases.length}`);
      console.log(`📋 Total Tasks: ${implementationPlan.phases.reduce((sum: number, phase: any) => sum + phase.tasks.length, 0)}`);
      console.log(`👥 Resource Requirements: ${implementationPlan.resourceRequirements.length}`);
      console.log(`⚠️ Risk Level: ${implementationPlan.riskAssessment.overallRisk}`);

      // Format output
      let output: string;
      let outputPath = options.output;

      if (options.format === 'markdown') {
        output = generateImplementationPlanMarkdown(implementationPlan);
        outputPath = outputPath.replace(/\.json$/, '.md');
      } else {
        output = JSON.stringify(implementationPlan, null, 2);
      }

      // Write output
      await writeFile(outputPath, output, 'utf8');
      console.log(`💾 Implementation plan saved to: ${outputPath}`);

    } catch (error) {
      console.error('❌ Failed to generate implementation plan:', error);
      process.exit(1);
    }
  });

// Markdown generation functions
function generateArchitectureMarkdown(architecture: any): string {
  let markdown = `# System Architecture\n\n`;
  markdown += `Generated on: ${new Date().toISOString()}\n\n`;

  // Components section
  if (architecture.components && architecture.components.length > 0) {
    markdown += `## 🏗️ System Components (${architecture.components.length})\n\n`;
    architecture.components.forEach((component: any, index: number) => {
      markdown += `### ${index + 1}. ${component.name}\n\n`;
      markdown += `**Type:** ${component.type}\n\n`;
      markdown += `**Responsibilities:**\n`;
      component.responsibilities.forEach((resp: string) => {
        markdown += `- ${resp}\n`;
      });
      markdown += `\n`;

      if (component.interfaces && component.interfaces.length > 0) {
        markdown += `**Interfaces:** ${component.interfaces.join(', ')}\n\n`;
      }

      if (component.dependencies && component.dependencies.length > 0) {
        markdown += `**Dependencies:** ${component.dependencies.join(', ')}\n\n`;
      }

      if (component.performance) {
        markdown += `**Performance:** Expected latency ${component.performance.expectedLatency}\n\n`;
      }

      markdown += `---\n\n`;
    });
  }

  // Architecture Patterns
  if (architecture.systemArchitecture?.architecturalPatterns && architecture.systemArchitecture.architecturalPatterns.length > 0) {
    markdown += `## 🎯 Architecture Patterns (${architecture.systemArchitecture.architecturalPatterns.length})\n\n`;
    architecture.systemArchitecture.architecturalPatterns.forEach((pattern: any, index: number) => {
      markdown += `### ${index + 1}. ${pattern.name}\n\n`;
      markdown += `${pattern.description}\n\n`;
      
      markdown += `**Benefits:**\n`;
      pattern.benefits.forEach((benefit: string) => {
        markdown += `- ${benefit}\n`;
      });
      markdown += `\n`;

      markdown += `**Tradeoffs:**\n`;
      pattern.tradeoffs.forEach((tradeoff: string) => {
        markdown += `- ${tradeoff}\n`;
      });
      markdown += `\n---\n\n`;
    });
  }

  // Quality Attributes
  if (architecture.systemArchitecture?.qualityAttributes && architecture.systemArchitecture.qualityAttributes.length > 0) {
    markdown += `## 📊 Quality Attributes (${architecture.systemArchitecture.qualityAttributes.length})\n\n`;
    architecture.systemArchitecture.qualityAttributes.forEach((qa: any, index: number) => {
      markdown += `### ${index + 1}. ${qa.name}\n\n`;
      markdown += `**Target:** ${qa.target}\n\n`;
      markdown += `**Priority:** ${qa.priority}\n\n`;
      markdown += `**Measurement:** ${qa.measurement}\n\n`;
      
      if (qa.criteria && qa.criteria.length > 0) {
        markdown += `**Criteria:**\n`;
        qa.criteria.forEach((criterion: string) => {
          markdown += `- ${criterion}\n`;
        });
        markdown += `\n`;
      }
      
      markdown += `---\n\n`;
    });
  }

  return markdown;
}

function generateImplementationPlanMarkdown(plan: any): string {
  let markdown = `# Implementation Plan\n\n`;
  markdown += `Generated on: ${new Date().toISOString()}\n\n`;

  // Overview
  markdown += `## 📋 Overview\n\n`;
  markdown += `- **Total Duration:** ${plan.timeline.totalDuration}\n`;
  markdown += `- **Phases:** ${plan.phases.length}\n`;
  markdown += `- **Total Tasks:** ${plan.phases.reduce((sum: number, phase: any) => sum + phase.tasks.length, 0)}\n`;
  markdown += `- **Risk Level:** ${plan.riskAssessment.overallRisk}\n\n`;

  // Phases
  if (plan.phases && plan.phases.length > 0) {
    markdown += `## 🎯 Implementation Phases\n\n`;
    plan.phases.forEach((phase: any, index: number) => {
      markdown += `### Phase ${index + 1}: ${phase.name}\n\n`;
      markdown += `**Duration:** ${phase.duration}\n\n`;
      markdown += `**Description:** ${phase.description}\n\n`;

      if (phase.prerequisites && phase.prerequisites.length > 0) {
        markdown += `**Prerequisites:** ${phase.prerequisites.join(', ')}\n\n`;
      }

      if (phase.tasks && phase.tasks.length > 0) {
        markdown += `**Tasks (${phase.tasks.length}):**\n\n`;
        phase.tasks.forEach((task: any, taskIndex: number) => {
          markdown += `${taskIndex + 1}. **${task.name}** (${task.priority})\n`;
          markdown += `   - Type: ${task.type}\n`;
          markdown += `   - Effort: ${task.estimatedEffort}\n`;
          markdown += `   - Description: ${task.description}\n`;
          
          if (task.dependencies && task.dependencies.length > 0) {
            markdown += `   - Dependencies: ${task.dependencies.join(', ')}\n`;
          }
          
          markdown += `\n`;
        });
      }

      markdown += `---\n\n`;
    });
  }

  // Resource Requirements
  if (plan.resourceRequirements && plan.resourceRequirements.length > 0) {
    markdown += `## 👥 Resource Requirements\n\n`;
    plan.resourceRequirements.forEach((resource: any, index: number) => {
      markdown += `${index + 1}. **${resource.type}**: ${resource.quantity} × ${resource.description} for ${resource.duration}\n`;
    });
    markdown += `\n`;
  }

  // Risk Assessment
  if (plan.riskAssessment) {
    markdown += `## ⚠️ Risk Assessment\n\n`;
    markdown += `**Overall Risk Level:** ${plan.riskAssessment.overallRisk}\n\n`;

    if (plan.riskAssessment.risks && plan.riskAssessment.risks.length > 0) {
      markdown += `**Identified Risks:**\n`;
      plan.riskAssessment.risks.forEach((risk: any, index: number) => {
        markdown += `${index + 1}. **${risk.description}**\n`;
        markdown += `   - Probability: ${risk.probability}\n`;
        markdown += `   - Impact: ${risk.impact}\n`;
        markdown += `   - Category: ${risk.category}\n\n`;
      });
    }

    if (plan.riskAssessment.mitigationPlans && plan.riskAssessment.mitigationPlans.length > 0) {
      markdown += `**Mitigation Strategies:**\n`;
      plan.riskAssessment.mitigationPlans.forEach((mitigation: string, index: number) => {
        markdown += `${index + 1}. ${mitigation}\n`;
      });
      markdown += `\n`;
    }
  }

  return markdown;
}

// Parse CLI arguments
program.parse();