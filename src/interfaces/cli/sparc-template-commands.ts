import { getLogger } from "../../config/logging-config";
const logger = getLogger("interfaces-cli-sparc-template-commands");
/**
 * SPARC Template CLI Commands
 *
 * CLI interface for SPARC template engine integration and specification generation
 */

import { readFile, writeFile } from 'node:fs/promises';
import { Command } from 'commander';
import { TemplateEngine } from '../../coordination/swarm/sparc/core/template-engine';
import { SpecificationPhaseEngine } from '../../coordination/swarm/sparc/phases/specification/specification-engine';

export function createSPARCTemplateCommands(): Command {
  const sparcTemplateCmd = new Command('spec');
  sparcTemplateCmd.description('SPARC specification generation with template engine');

  const templateEngine = new TemplateEngine();
  const specEngine = new SpecificationPhaseEngine();

  // List available templates
  sparcTemplateCmd
    .command('templates')
    .description('List available SPARC templates')
    .action(async () => {
      const templates = specEngine.getAvailableTemplates();
      templates.forEach((template, index) => {});
    });

  // Generate specification from template
  sparcTemplateCmd
    .command('generate')
    .description('Generate specification from project requirements using templates')
    .requiredOption('--name <name>', 'Project name')
    .requiredOption(
      '--domain <domain>',
      'Project domain (memory-systems|neural-networks|rest-api|swarm-coordination)'
    )
    .option('--template <templateId>', 'Specific template ID to use')
    .option(
      '--complexity <level>',
      'Project complexity (simple|moderate|high|complex|enterprise)',
      'moderate'
    )
    .option('--requirements <requirements...>', 'List of project requirements')
    .option('--constraints <constraints...>', 'List of project constraints')
    .option('--output <path>', 'Output file path', 'specification.json')
    .option('--format <format>', 'Output format (json|markdown)', 'json')
    .action(async (options) => {
      try {
        // Create project specification
        const projectSpec: ProjectSpecification = {
          name: options?.name,
          domain: options?.["domain"],
          complexity: options?.["complexity"],
          requirements: options?.["requirements"] || [],
          constraints: options?.["constraints"] || [],
        };

        let specification;
        if (options?.["template"]) {
          // Validate template compatibility first
          const compatibility = specEngine.validateTemplateCompatibility(
            projectSpec,
            options?.["template"]
          );

          if (compatibility.warnings.length > 0) {
            compatibility.warnings.forEach((warning) => {});
          }

          if (!compatibility.compatible) {
            logger.error('❌ Template is not compatible with project specification');
            return;
          }

          // Generate with specific template
          specification = await specEngine.generateSpecificationFromTemplate(
            projectSpec,
            options?.["template"]
          );
        } else {
          // Auto-select best template
          specification = await specEngine.generateSpecificationFromTemplate(projectSpec);
        }

        // Format output
        let output: string;
        if (options?.["format"] === 'markdown') {
          output = formatSpecificationAsMarkdown(specification);
        } else {
          output = JSON.stringify(specification, null, 2);
        }

        // Write output
        await writeFile(options?.["output"], output, 'utf8');
      } catch (error) {
        logger.error('❌ Failed to generate specification:', error);
        process.exit(1);
      }
    });

  // Interactive specification generation
  sparcTemplateCmd
    .command('interactive')
    .description('Interactive specification generation with template selection')
    .option('--output <path>', 'Output file path', 'specification.json')
    .action(async (options) => {
      try {
      } catch (error) {
        logger.error('❌ Interactive mode failed:', error);
        process.exit(1);
      }
    });

  // Validate existing specification
  sparcTemplateCmd
    .command('validate')
    .description('Validate existing specification file')
    .requiredOption('--file <path>', 'Path to specification file')
    .action(async (options) => {
      try {
        const content = await readFile(options?.["file"], 'utf8');
        const specification = JSON.parse(content);

        const validation = await specEngine.validateSpecificationCompleteness(specification);

        if (validation.results.length > 0) {
          validation.results.forEach((result) => {
            const status = result?.passed ? '✅' : '❌';
          });
        }

        if (validation.recommendations.length > 0) {
          validation.recommendations.forEach((rec) => {});
        }

        process.exit(validation.overall ? 0 : 1);
      } catch (error) {
        logger.error('❌ Validation failed:', error);
        process.exit(1);
      }
    });

  // Template statistics
  sparcTemplateCmd
    .command('stats')
    .description('Show template engine statistics and usage')
    .action(async () => {
      const stats = templateEngine.getTemplateStats();
    });

  return sparcTemplateCmd;
}

/**
 * Format specification as Markdown
 *
 * @param specification
 */
function formatSpecificationAsMarkdown(specification: any): string {
  let markdown = `# SPARC Specification: ${specification.id}\n\n`;
  markdown += `**Domain:** ${specification.domain}\n\n`;

  // Functional Requirements
  markdown += `## Functional Requirements (${specification.functionalRequirements.length})\n\n`;
  specification.functionalRequirements.forEach((req: any, index: number) => {
    markdown += `### ${index + 1}. ${req.title}\n`;
    markdown += `**Priority:** ${req.priority}\n`;
    markdown += `**Description:** ${req.description}\n\n`;

    if (req.testCriteria && req.testCriteria.length > 0) {
      markdown += `**Test Criteria:**\n`;
      req.testCriteria.forEach((criteria: string) => {
        markdown += `- ${criteria}\n`;
      });
      markdown += `\n`;
    }
  });

  // Non-Functional Requirements
  if (
    specification.nonFunctionalRequirements &&
    specification.nonFunctionalRequirements.length > 0
  ) {
    markdown += `## Non-Functional Requirements (${specification.nonFunctionalRequirements.length})\n\n`;
    specification.nonFunctionalRequirements.forEach((req: any, index: number) => {
      markdown += `### ${index + 1}. ${req.title}\n`;
      markdown += `**Priority:** ${req.priority}\n`;
      markdown += `**Description:** ${req.description}\n\n`;

      if (req.metrics) {
        markdown += `**Metrics:**\n`;
        Object.entries(req.metrics).forEach(([key, value]) => {
          markdown += `- ${key}: ${value}\n`;
        });
        markdown += `\n`;
      }
    });
  }

  // Constraints
  if (specification.constraints && specification.constraints.length > 0) {
    markdown += `## System Constraints (${specification.constraints.length})\n\n`;
    specification.constraints.forEach((constraint: any, index: number) => {
      markdown += `${index + 1}. **${constraint.type}**: ${constraint.description}\n`;
    });
    markdown += `\n`;
  }

  // Risk Assessment
  if (specification.riskAssessment?.risks?.length > 0) {
    markdown += `## Risk Assessment\n\n`;
    markdown += `**Overall Risk Level:** ${specification.riskAssessment.overallRisk}\n\n`;

    markdown += `### Identified Risks\n`;
    specification.riskAssessment.risks.forEach((risk: any, index: number) => {
      markdown += `${index + 1}. **${risk.category}**: ${risk.description}\n`;
      markdown += `   - Probability: ${risk.probability}\n`;
      markdown += `   - Impact: ${risk.impact}\n\n`;
    });
  }

  // Success Metrics
  if (specification.successMetrics && specification.successMetrics.length > 0) {
    markdown += `## Success Metrics (${specification.successMetrics.length})\n\n`;
    specification.successMetrics.forEach((metric: any, index: number) => {
      markdown += `${index + 1}. **${metric.name}**: ${metric.target}\n`;
      markdown += `   - ${metric.description}\n`;
      markdown += `   - Measurement: ${metric.measurement}\n\n`;
    });
  }

  markdown += `---\n*Generated by SPARC Template Engine on ${new Date().toISOString()}*\n`;

  return markdown;
}
