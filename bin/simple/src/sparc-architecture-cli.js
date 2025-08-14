#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { Command } from 'commander';
import { getLogger } from './config/logging-config.ts';
const logger = getLogger('sparc-architecture-cli');
const program = new Command();
program
    .name('sparc-architecture-cli')
    .description('SPARC Phase 3: Architecture Generation CLI')
    .version('1.0.0');
program
    .command('generate')
    .description('Generate system architecture from pseudocode')
    .requiredOption('--pseudocode-file <path>', 'Path to pseudocode JSON file')
    .option('--spec-file <path>', 'Path to specification JSON file for additional context')
    .option('--output <path>', 'Output file path for architecture', 'architecture.json')
    .option('--format <format>', 'Output format (json|markdown)', 'json')
    .action(async (options) => {
    try {
        const { ArchitecturePhaseEngine } = await import('./coordination/swarm/sparc/phases/architecture/architecture-engine.ts');
        const engine = new ArchitecturePhaseEngine();
        const pseudocodeContent = await readFile(options?.pseudocodeFile, 'utf8');
        let pseudocodeData = JSON.parse(pseudocodeContent);
        if (Array.isArray(pseudocodeData)) {
            pseudocodeData = {
                id: `generated-${Date.now()}`,
                algorithms: pseudocodeData,
                coreAlgorithms: pseudocodeData,
                dataStructures: [],
                controlFlows: [],
                optimizations: [],
                dependencies: [],
            };
        }
        let specification = null;
        if (options?.specFile) {
            const specContent = await readFile(options?.specFile, 'utf8');
            specification = JSON.parse(specContent);
        }
        let architecture;
        if (specification) {
            const systemArchitecture = await engine.designSystemArchitecture(specification, pseudocodeData?.algorithms);
            architecture = {
                systemArchitecture,
                components: systemArchitecture.components,
                interfaces: systemArchitecture.interfaces,
                dataFlow: systemArchitecture.dataFlow,
                qualityAttributes: systemArchitecture.qualityAttributes,
                architecturalPatterns: systemArchitecture.architecturalPatterns,
            };
        }
        else {
            architecture = await engine.designArchitecture(pseudocodeData);
        }
        let output;
        let outputPath = options?.output;
        if (options.format === 'markdown') {
            output = generateArchitectureMarkdown(architecture);
            outputPath = outputPath.replace(/\.json$/, '.md');
        }
        else {
            output = JSON.stringify(architecture, null, 2);
        }
        await writeFile(outputPath, output, 'utf8');
    }
    catch (error) {
        logger.error('❌ Failed to generate architecture:', error);
        process.exit(1);
    }
});
program
    .command('validate')
    .description('Validate architecture design for consistency and quality')
    .requiredOption('--architecture-file <path>', 'Path to architecture JSON file')
    .option('--detailed', 'Show detailed validation results')
    .action(async (options) => {
    try {
        const { ArchitecturePhaseEngine } = await import('./coordination/swarm/sparc/phases/architecture/architecture-engine.ts');
        const engine = new ArchitecturePhaseEngine();
        const archContent = await readFile(options?.architectureFile, 'utf8');
        const architecture = JSON.parse(archContent);
        const validationResults = await engine.validateArchitecture(architecture);
        const overallScore = validationResults?.reduce((sum, result) => sum + result?.score, 0) /
            validationResults.length;
        if (options?.detailed) {
            validationResults?.forEach((result, index) => {
                const status = result.passed ? '✅' : '❌';
                console.log(`${index + 1}. ${status} ${result.rule}: ${result.message}`);
            });
        }
        process.exit(overallScore >= 0.7 ? 0 : 1);
    }
    catch (error) {
        logger.error('❌ Failed to validate architecture:', error);
        process.exit(1);
    }
});
program
    .command('plan')
    .description('Generate implementation plan from architecture')
    .requiredOption('--architecture-file <path>', 'Path to architecture JSON file')
    .option('--output <path>', 'Output file path for implementation plan', 'implementation-plan.json')
    .option('--format <format>', 'Output format (json|markdown)', 'json')
    .action(async (options) => {
    try {
        const { ArchitecturePhaseEngine } = await import('./coordination/swarm/sparc/phases/architecture/architecture-engine.ts');
        const engine = new ArchitecturePhaseEngine();
        const archContent = await readFile(options?.architectureFile, 'utf8');
        const architecture = JSON.parse(archContent);
        const implementationPlan = await engine.generateImplementationPlan(architecture);
        let output;
        let outputPath = options?.output;
        if (options.format === 'markdown') {
            output = generateImplementationPlanMarkdown(implementationPlan);
            outputPath = outputPath.replace(/\.json$/, '.md');
        }
        else {
            output = JSON.stringify(implementationPlan, null, 2);
        }
        await writeFile(outputPath, output, 'utf8');
    }
    catch (error) {
        logger.error('❌ Failed to generate implementation plan:', error);
        process.exit(1);
    }
});
function generateArchitectureMarkdown(architecture) {
    let markdown = `# System Architecture\n\n`;
    markdown += `Generated on: ${new Date().toISOString()}\n\n`;
    if (architecture.components && architecture.components.length > 0) {
        markdown += `## 🏗️ System Components (${architecture.components.length})\n\n`;
        architecture.components.forEach((component, index) => {
            markdown += `### ${index + 1}. ${component.name}\n\n`;
            markdown += `**Type:** ${component.type}\n\n`;
            markdown += `**Responsibilities:**\n`;
            component.responsibilities.forEach((resp) => {
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
    if (architecture.systemArchitecture?.architecturalPatterns &&
        architecture.systemArchitecture.architecturalPatterns.length > 0) {
        markdown += `## 🎯 Architecture Patterns (${architecture.systemArchitecture.architecturalPatterns.length})\n\n`;
        architecture.systemArchitecture.architecturalPatterns.forEach((pattern, index) => {
            markdown += `### ${index + 1}. ${pattern.name}\n\n`;
            markdown += `${pattern.description}\n\n`;
            markdown += `**Benefits:**\n`;
            pattern.benefits.forEach((benefit) => {
                markdown += `- ${benefit}\n`;
            });
            markdown += `\n`;
            markdown += `**Tradeoffs:**\n`;
            pattern.tradeoffs.forEach((tradeoff) => {
                markdown += `- ${tradeoff}\n`;
            });
            markdown += `\n---\n\n`;
        });
    }
    if (architecture.systemArchitecture?.qualityAttributes &&
        architecture.systemArchitecture.qualityAttributes.length > 0) {
        markdown += `## 📊 Quality Attributes (${architecture.systemArchitecture.qualityAttributes.length})\n\n`;
        architecture.systemArchitecture.qualityAttributes.forEach((qa, index) => {
            markdown += `### ${index + 1}. ${qa.name}\n\n`;
            markdown += `**Target:** ${qa.target}\n\n`;
            markdown += `**Priority:** ${qa.priority}\n\n`;
            markdown += `**Measurement:** ${qa.measurement}\n\n`;
            if (qa.criteria && qa.criteria.length > 0) {
                markdown += `**Criteria:**\n`;
                qa.criteria.forEach((criterion) => {
                    markdown += `- ${criterion}\n`;
                });
                markdown += `\n`;
            }
            markdown += `---\n\n`;
        });
    }
    return markdown;
}
function generateImplementationPlanMarkdown(plan) {
    let markdown = `# Implementation Plan\n\n`;
    markdown += `Generated on: ${new Date().toISOString()}\n\n`;
    markdown += `## 📋 Overview\n\n`;
    markdown += `- **Total Duration:** ${plan.timeline.totalDuration}\n`;
    markdown += `- **Phases:** ${plan.phases.length}\n`;
    markdown += `- **Total Tasks:** ${plan.phases.reduce((sum, phase) => sum + phase.tasks.length, 0)}\n`;
    markdown += `- **Risk Level:** ${plan.riskAssessment.overallRisk}\n\n`;
    if (plan.phases && plan.phases.length > 0) {
        markdown += `## 🎯 Implementation Phases\n\n`;
        plan.phases.forEach((phase, index) => {
            markdown += `### Phase ${index + 1}: ${phase.name}\n\n`;
            markdown += `**Duration:** ${phase.duration}\n\n`;
            markdown += `**Description:** ${phase.description}\n\n`;
            if (phase.prerequisites && phase.prerequisites.length > 0) {
                markdown += `**Prerequisites:** ${phase.prerequisites.join(', ')}\n\n`;
            }
            if (phase.tasks && phase.tasks.length > 0) {
                markdown += `**Tasks (${phase.tasks.length}):**\n\n`;
                phase.tasks.forEach((task, taskIndex) => {
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
    if (plan.resourceRequirements && plan.resourceRequirements.length > 0) {
        markdown += `## 👥 Resource Requirements\n\n`;
        plan.resourceRequirements.forEach((resource, index) => {
            markdown += `${index + 1}. **${resource.type}**: ${resource.quantity} × ${resource.description} for ${resource.duration}\n`;
        });
        markdown += `\n`;
    }
    if (plan.riskAssessment) {
        markdown += `## ⚠️ Risk Assessment\n\n`;
        markdown += `**Overall Risk Level:** ${plan.riskAssessment.overallRisk}\n\n`;
        if (plan.riskAssessment.risks && plan.riskAssessment.risks.length > 0) {
            markdown += `**Identified Risks:**\n`;
            plan.riskAssessment.risks.forEach((risk, index) => {
                markdown += `${index + 1}. **${risk.description}**\n`;
                markdown += `   - Probability: ${risk.probability}\n`;
                markdown += `   - Impact: ${risk.impact}\n`;
                markdown += `   - Category: ${risk.category}\n\n`;
            });
        }
        if (plan.riskAssessment.mitigationPlans &&
            plan.riskAssessment.mitigationPlans.length > 0) {
            markdown += `**Mitigation Strategies:**\n`;
            plan.riskAssessment.mitigationPlans.forEach((mitigation, index) => {
                markdown += `${index + 1}. ${mitigation}\n`;
            });
            markdown += `\n`;
        }
    }
    return markdown;
}
program.parse();
//# sourceMappingURL=sparc-architecture-cli.js.map