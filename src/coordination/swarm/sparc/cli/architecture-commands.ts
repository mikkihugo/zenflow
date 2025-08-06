/**
 * CLI Commands for SPARC Architecture Management
 *
 * Provides command-line interface for database-driven architecture operations
 */

import chalk from 'chalk';
import { Command } from 'commander';
import { nanoid } from 'nanoid';
import { ArchitectureMCPToolsImpl } from '../mcp/architecture-tools';
import { DatabaseDrivenArchitecturePhaseEngine } from '../phases/architecture/database-driven-architecture-engine';
import type { ArchitectureDesign, PseudocodeStructure } from '../types/sparc-types';

// Mock database for CLI (in production, this would use the actual database)
class CLIDatabaseAdapter {
  private data: Map<string, any> = new Map();

  async execute(sql: string, params?: any[]): Promise<any> {
    // Basic implementation for CLI demo
    return { affectedRows: 1 };
  }

  async query(sql: string, params?: any[]): Promise<any> {
    return { rows: [] };
  }
}

/**
 * Create SPARC Architecture CLI commands
 */
export function createArchitectureCLI(): Command {
  const architectureCmd = new Command('architecture')
    .alias('arch')
    .description('SPARC Architecture Generation and Management');

  // Generate architecture from pseudocode
  architectureCmd
    .command('generate')
    .alias('gen')
    .description('Generate architecture from pseudocode structure')
    .option('-i, --input <file>', 'Input pseudocode JSON file')
    .option('-o, --output <file>', 'Output architecture file')
    .option('-p, --project <id>', 'Project ID')
    .option('-d, --domain <domain>', 'Target domain', 'general')
    .option('--validate', 'Run validation after generation')
    .action(async (options) => {
      try {
        console.log(chalk.blue('🏗️  Generating SPARC Architecture...\n'));

        // Initialize architecture engine
        const db = new CLIDatabaseAdapter();
        const engine = new DatabaseDrivenArchitecturePhaseEngine(db);
        await engine.initialize();

        let pseudocode: PseudocodeStructure;

        if (options.input) {
          // Load from file
          const fs = await import('fs/promises');
          const content = await fs.readFile(options.input, 'utf-8');
          pseudocode = JSON.parse(content);
          console.log(chalk.green(`✅ Loaded pseudocode from ${options.input}`));
        } else {
          // Use sample pseudocode for demo
          pseudocode = createSamplePseudocode();
          console.log(chalk.yellow('ℹ️  Using sample pseudocode (use --input to specify file)'));
        }

        // Generate architecture
        const architecture = await engine.designArchitecture(pseudocode);
        console.log(
          chalk.green(
            `✅ Architecture generated with ${architecture.components?.length || 0} components`
          )
        );

        // Validate if requested
        if (options.validate) {
          console.log(chalk.blue('\n🔍 Validating architecture...'));
          const validation = await engine.validateArchitecturalConsistency(
            architecture.systemArchitecture
          );
          console.log(
            chalk.green(`✅ Validation completed with score: ${validation.overallScore.toFixed(2)}`)
          );

          if (validation.recommendations.length > 0) {
            console.log(chalk.yellow('\n💡 Recommendations:'));
            validation.recommendations.forEach((rec, i) => {
              console.log(chalk.yellow(`   ${i + 1}. ${rec}`));
            });
          }
        }

        // Save output
        if (options.output) {
          const fs = await import('fs/promises');
          await fs.writeFile(options.output, JSON.stringify(architecture, null, 2));
          console.log(chalk.green(`✅ Architecture saved to ${options.output}`));
        } else {
          // Display summary
          displayArchitectureSummary(architecture);
        }
      } catch (error) {
        console.error(chalk.red('❌ Architecture generation failed:'), error);
        process.exit(1);
      }
    });

  // Validate existing architecture
  architectureCmd
    .command('validate')
    .alias('val')
    .description('Validate architecture design')
    .argument('<architecture-id>', 'Architecture ID to validate')
    .option('-t, --type <type>', 'Validation type', 'general')
    .option('--report', 'Generate detailed validation report')
    .action(async (architectureId, options) => {
      try {
        console.log(chalk.blue(`🔍 Validating architecture ${architectureId}...\n`));

        const db = new CLIDatabaseAdapter();
        const mcpTools = new ArchitectureMCPToolsImpl(db);
        await mcpTools.initialize();

        const result = await mcpTools.validateArchitecture({
          architectureId,
          validationType: options.type,
        });

        if (result.success) {
          const validation = result.validation;
          console.log(chalk.green(`✅ Validation completed`));
          console.log(`   Score: ${chalk.bold(validation.overallScore.toFixed(2))}`);
          console.log(
            `   Status: ${validation.approved ? chalk.green('✅ Approved') : chalk.red('❌ Needs Improvement')}`
          );

          if (options.report && validation.validationResults) {
            console.log(chalk.blue('\n📋 Detailed Validation Report:'));
            validation.validationResults.forEach((result, i) => {
              const status = result.passed ? chalk.green('✅') : chalk.red('❌');
              console.log(
                `   ${i + 1}. ${status} ${result.criterion} (Score: ${result.score.toFixed(2)})`
              );
              if (result.feedback) {
                console.log(`      ${chalk.gray(result.feedback)}`);
              }
            });
          }

          if (result.recommendations.length > 0) {
            console.log(chalk.yellow('\n💡 Recommendations:'));
            result.recommendations.forEach((rec, i) => {
              console.log(chalk.yellow(`   ${i + 1}. ${rec}`));
            });
          }
        } else {
          console.error(chalk.red('❌ Validation failed:'), result.message);
          process.exit(1);
        }
      } catch (error) {
        console.error(chalk.red('❌ Validation error:'), error);
        process.exit(1);
      }
    });

  // Search architectures
  architectureCmd
    .command('search')
    .alias('find')
    .description('Search architecture designs')
    .option('-d, --domain <domain>', 'Filter by domain')
    .option('-t, --tags <tags>', 'Filter by tags (comma-separated)')
    .option('-s, --min-score <score>', 'Minimum validation score', '0.0')
    .option('-l, --limit <count>', 'Maximum results', '10')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        console.log(chalk.blue('🔍 Searching architectures...\n'));

        const db = new CLIDatabaseAdapter();
        const mcpTools = new ArchitectureMCPToolsImpl(db);
        await mcpTools.initialize();

        const searchCriteria = {
          domain: options.domain,
          tags: options.tags ? options.tags.split(',') : undefined,
          minScore: parseFloat(options.minScore),
          limit: parseInt(options.limit),
        };

        const result = await mcpTools.searchArchitectures(searchCriteria);

        if (result.success) {
          if (options.json) {
            console.log(JSON.stringify(result.architectures, null, 2));
          } else {
            console.log(chalk.green(`✅ Found ${result.count} architectures`));
            if (result.architectures.length > 0) {
              console.log(chalk.blue('\n📋 Results:'));
              result.architectures.forEach((arch, i) => {
                console.log(`   ${i + 1}. ${arch.id || 'Unknown ID'}`);
                console.log(`      Components: ${arch.components?.length || 0}`);
                console.log(
                  `      Domain: ${arch.systemArchitecture?.technologyStack?.[0]?.category || 'general'}`
                );
                console.log(
                  `      Created: ${arch.createdAt ? new Date(arch.createdAt).toLocaleDateString() : 'Unknown'}`
                );
              });
            }
          }
        } else {
          console.error(chalk.red('❌ Search failed:'), result.message);
          process.exit(1);
        }
      } catch (error) {
        console.error(chalk.red('❌ Search error:'), error);
        process.exit(1);
      }
    });

  // Export architecture
  architectureCmd
    .command('export')
    .description('Export architecture in various formats')
    .argument('<architecture-id>', 'Architecture ID to export')
    .option('-f, --format <format>', 'Export format (json|yaml|mermaid)', 'json')
    .option('-o, --output <file>', 'Output file (defaults to stdout)')
    .action(async (architectureId, options) => {
      try {
        console.log(
          chalk.blue(`📤 Exporting architecture ${architectureId} as ${options.format}...\n`)
        );

        const db = new CLIDatabaseAdapter();
        const mcpTools = new ArchitectureMCPToolsImpl(db);
        await mcpTools.initialize();

        const result = await mcpTools.exportArchitecture({
          architectureId,
          format: options.format,
        });

        if (result.success) {
          if (options.output) {
            const fs = await import('fs/promises');
            await fs.writeFile(options.output, result.content);
            console.log(chalk.green(`✅ Architecture exported to ${options.output}`));
          } else {
            console.log(result.content);
          }
        } else {
          console.error(chalk.red('❌ Export failed:'), result.message);
          process.exit(1);
        }
      } catch (error) {
        console.error(chalk.red('❌ Export error:'), error);
        process.exit(1);
      }
    });

  // Get architecture statistics
  architectureCmd
    .command('stats')
    .description('Get architecture statistics')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        console.log(chalk.blue('📊 Retrieving architecture statistics...\n'));

        const db = new CLIDatabaseAdapter();
        const mcpTools = new ArchitectureMCPToolsImpl(db);
        await mcpTools.initialize();

        const result = await mcpTools.getArchitectureStats();

        if (result.success) {
          if (options.json) {
            console.log(JSON.stringify(result.stats, null, 2));
          } else {
            const stats = result.stats;
            console.log(chalk.green('✅ Architecture Statistics:'));
            console.log(`   Total Architectures: ${chalk.bold(stats.totalArchitectures)}`);
            console.log(`   Average Components: ${chalk.bold(stats.averageComponents.toFixed(1))}`);

            if (Object.keys(stats.byDomain).length > 0) {
              console.log(chalk.blue('\n📊 By Domain:'));
              Object.entries(stats.byDomain).forEach(([domain, count]) => {
                console.log(`   ${domain}: ${count}`);
              });
            }

            const valStats = stats.validationStats;
            console.log(chalk.blue('\n🔍 Validation Statistics:'));
            console.log(`   Total Validated: ${valStats.totalValidated}`);
            console.log(`   Average Score: ${valStats.averageScore.toFixed(2)}`);
            console.log(`   Pass Rate: ${(valStats.passRate * 100).toFixed(1)}%`);
          }
        } else {
          console.error(chalk.red('❌ Failed to get statistics:'), result.message);
          process.exit(1);
        }
      } catch (error) {
        console.error(chalk.red('❌ Statistics error:'), error);
        process.exit(1);
      }
    });

  return architectureCmd;
}
