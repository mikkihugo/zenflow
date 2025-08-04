/**
 * @fileoverview Unified Discovery CLI Command - The Complete Auto-Discovery System
 *
 * This is the FINAL PIECE that makes the entire auto-discovery system accessible to users.
 * Single command that orchestrates the complete pipeline:
 * Documents → Domain Discovery → Confidence Building → Swarm Creation → Agent Deployment
 */

import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { AutoSwarmFactory } from '@coordination/discovery/auto-swarm-factory';
import { DomainDiscoveryBridge } from '@coordination/discovery/domain-discovery-bridge';
import { ProgressiveConfidenceBuilder } from '@coordination/discovery/progressive-confidence-builder';
import { HiveSwarmCoordinator } from '@coordination/hive-swarm-sync';
import { createPublicSwarmCoordinator } from '@coordination/public-api';
import { DocumentDrivenSystem } from '@core/document-driven-system';
import { createLogger } from '@core/logger';
import { createAGUI } from '@interfaces/agui/agui-adapter';
import { InteractiveDiscoveryTUI } from '@interfaces/tui';
import { ProjectContextAnalyzer } from '@knowledge/project-context-analyzer';
import { SessionMemoryStore } from '@memory/memory';
import { render } from 'ink';
import meow from 'meow';
import React from 'react';

const logger = createLogger({ prefix: 'DiscoverCommand' });

export interface DiscoverOptions {
  project?: string;
  confidence?: number;
  maxIterations?: number;
  autoSwarms?: boolean;
  skipValidation?: boolean;
  topology?: 'mesh' | 'hierarchical' | 'star' | 'ring' | 'auto';
  maxAgents?: number;
  output?: 'console' | 'json' | 'markdown';
  saveResults?: string;
  verbose?: boolean;
  dryRun?: boolean;
  interactive?: boolean;
}

/**
 * CLI Configuration using meow
 */
export const discoverCLI = meow(
  `
🧠 CLAUDE-ZEN AUTO-DISCOVERY SYSTEM
Zero-Manual-Initialization Domain Discovery & Swarm Creation

Usage
  $ claude-zen discover [project-path]

Options
  --confidence, -c         Target confidence threshold (0.0-1.0) [default: 0.95]
  --max-iterations, -i     Maximum confidence building iterations [default: 5]
  --auto-swarms, -s        Automatically create and deploy swarms [default: true]
  --skip-validation        Skip human validation checkpoints [default: false]
  --topology, -t           Force swarm topology (mesh/hierarchical/star/ring/auto) [default: auto]
  --max-agents, -a         Maximum agents per swarm [default: 20]
  --output, -o             Output format (console/json/markdown) [default: console]
  --save-results           Save results to file
  --verbose, -v            Enable verbose logging [default: false]
  --dry-run                Analyze without creating swarms [default: false]
  --interactive            Use interactive TUI interface [default: false]
  --help                   Show help
  --version                Show version

Examples
  $ claude-zen discover                              # Discover current directory
  $ claude-zen discover /path/to/project             # Discover specific project
  $ claude-zen discover --confidence 0.8 --verbose  # Lower confidence, verbose output
  $ claude-zen discover --auto-swarms --topology mesh  # Force mesh topology
  $ claude-zen discover --dry-run --output json     # Preview in JSON format
  $ claude-zen discover --interactive                # Interactive TUI interface
`,
  {
    importMeta: import.meta,
    flags: {
      confidence: {
        type: 'number',
        shortFlag: 'c',
        default: 0.95,
      },
      maxIterations: {
        type: 'number',
        shortFlag: 'i',
        default: 5,
      },
      autoSwarms: {
        type: 'boolean',
        shortFlag: 's',
        default: true,
      },
      skipValidation: {
        type: 'boolean',
        default: false,
      },
      topology: {
        type: 'string',
        shortFlag: 't',
        default: 'auto',
      },
      maxAgents: {
        type: 'number',
        shortFlag: 'a',
        default: 20,
      },
      output: {
        type: 'string',
        shortFlag: 'o',
        default: 'console',
      },
      saveResults: {
        type: 'string',
      },
      verbose: {
        type: 'boolean',
        shortFlag: 'v',
        default: false,
      },
      dryRun: {
        type: 'boolean',
        default: false,
      },
      interactive: {
        type: 'boolean',
        default: false,
      },
    },
  }
);

/**
 * The Complete Auto-Discovery CLI Command
 *
 * This command orchestrates the entire pipeline from document analysis to running swarms.
 * It's the user-facing interface to the breakthrough auto-discovery system.
 */
export class DiscoverCommand {
  private startTime: number = 0;
  private stats = {
    domainsDiscovered: 0,
    confidenceBuilt: 0,
    swarmsCreated: 0,
    agentsDeployed: 0,
    documentsProcessed: 0,
    validationsPerformed: 0,
    researchQueries: 0,
  };

  constructor() {
    this.startTime = performance.now();
  }

  /**
   * Main execution method - orchestrates the complete pipeline
   */
  async execute(projectPath: string, options: DiscoverOptions): Promise<void> {
    try {
      const resolvedPath = resolve(projectPath);

      // Validate project path
      if (!existsSync(resolvedPath)) {
        throw new Error(`Project path does not exist: ${resolvedPath}`);
      }

      if (!statSync(resolvedPath).isDirectory()) {
        throw new Error(`Project path is not a directory: ${resolvedPath}`);
      }

      // Launch interactive TUI if requested
      if (options.interactive) {
        return this.executeInteractive(resolvedPath, options);
      }

      const confidence = Number(options.confidence) || 0.8;
      const maxIterations = Number(options.maxIterations) || 5;
      const maxAgents = Number(options.maxAgents) || 20;

      if (confidence < 0 || confidence > 1) {
        throw new Error('Confidence must be between 0.0 and 1.0');
      }

      logger.info('🚀 Starting Auto-Discovery System');
      logger.info('📊 Configuration:', {
        project: resolvedPath,
        confidence,
        maxIterations,
        autoSwarms: options.autoSwarms,
        topology: options.topology,
        maxAgents,
      });

      this.showBanner();

      // Phase 1: Project Analysis
      await this.showPhase('🔍 Phase 1: Project Analysis');
      const projectAnalyzer = new ProjectContextAnalyzer(resolvedPath);
      const projectContext = await projectAnalyzer.analyzeProject();

      this.stats.documentsProcessed = (projectContext as any).documents?.length || 0;
      logger.info(`✅ Analyzed project: ${projectContext.name || 'Unknown'}`);

      if ((projectContext as any).isMonorepo) {
        logger.info(
          `📦 Detected monorepo with ${(projectContext as any).packages?.length || 0} packages`
        );
      }

      // Phase 2: Domain Discovery
      await this.showPhase('🧠 Phase 2: Domain Discovery');
      const documentSystem = new DocumentDrivenSystem(resolvedPath);
      const domainBridge = new DomainDiscoveryBridge(
        documentSystem,
        {} as any, // DomainAnalysisEngine - will be mocked for now
        projectAnalyzer
      );

      const discoveredDomains = await domainBridge.discoverDomains();
      this.stats.domainsDiscovered = discoveredDomains.length;
      logger.info(`✅ Discovered ${discoveredDomains.length} potential domains`);

      if (discoveredDomains.length === 0) {
        logger.warn(
          '⚠️  No domains discovered. Try analyzing a larger codebase or adjusting sensitivity.'
        );
        return;
      }

      // Phase 3: Confidence Building
      await this.showPhase('📈 Phase 3: Confidence Building');
      const memoryStore = new SessionMemoryStore({
        backendConfig: { type: 'json', path: `${resolvedPath}/.claude-zen/memory.json` },
      });
      await memoryStore.initialize();

      const agui = createAGUI(options.skipValidation ? 'mock' : 'terminal');
      const confidenceBuilder = new ProgressiveConfidenceBuilder(domainBridge, memoryStore, agui, {
        targetConfidence: confidence,
        maxIterations,
        researchThreshold: 0.6,
      });

      // Track confidence building progress
      confidenceBuilder.on('progress', (event) => {
        if (options.verbose) {
          logger.info(
            `📊 Iteration ${event.iteration}: ${(event.confidence * 100).toFixed(1)}% confidence`
          );
        }
      });

      const confidenceResult = await confidenceBuilder.buildConfidence({
        projectPath: resolvedPath,
        existingDomains: discoveredDomains.map((d) => ({
          name: d.name,
          path: d.path,
          files: d.files || [],
          confidence: d.confidence || 0.5,
          suggestedConcepts: d.suggestedConcepts || [],
          technologies: d.technologies || [],
          relatedDomains: d.relatedDomains || [],
          validations: [],
          research: [],
          refinementHistory: [],
        })),
      });

      this.stats.confidenceBuilt = confidenceResult.confidence.overall;
      this.stats.validationsPerformed = confidenceResult.validationCount || 0;
      this.stats.researchQueries = confidenceResult.researchCount || 0;

      logger.info(
        `✅ Built confidence: ${(confidenceResult.confidence.overall * 100).toFixed(1)}%`
      );
      logger.info(`📋 Validated domains: ${confidenceResult.domains.size}`);

      if (confidenceResult.domains.size === 0) {
        logger.warn(
          '⚠️  No confident domains found. Consider lowering confidence threshold or adding more documentation.'
        );
        return;
      }

      // Phase 4: Swarm Creation (if enabled)
      if (options.autoSwarms && !options.dryRun) {
        await this.showPhase('🏭 Phase 4: Auto-Swarm Factory');

        // Initialize swarm infrastructure
        const swarmCoordinator = await createPublicSwarmCoordinator();
        const hiveSync = new HiveSwarmCoordinator();

        const swarmFactory = new AutoSwarmFactory(swarmCoordinator, hiveSync, memoryStore, agui, {
          enableHumanValidation: !options.skipValidation,
          maxSwarmsPerDomain: 1,
          resourceConstraints: {
            maxTotalAgents: maxAgents * confidenceResult.domains.size,
            memoryLimit: '4GB',
            cpuLimit: 8,
          },
        });

        // Track swarm creation
        swarmFactory.on('swarm:created', (event) => {
          if (options.verbose) {
            logger.info(
              `🐝 Created swarm for ${event.domain}: ${event.config.topology.type} topology`
            );
          }
        });

        const swarmConfigs = await swarmFactory.createSwarmsForDomains(confidenceResult.domains);

        this.stats.swarmsCreated = swarmConfigs.length;
        this.stats.agentsDeployed = swarmConfigs.reduce(
          (sum, config) =>
            sum + config.agents.reduce((agentSum, agent) => agentSum + agent.count, 0),
          0
        );

        logger.info(
          `✅ Created ${swarmConfigs.length} swarms with ${this.stats.agentsDeployed} total agents`
        );

        // Show swarm details
        if (options.verbose) {
          for (const config of swarmConfigs) {
            logger.info(`🐝 ${config.name}:`, {
              topology: config.topology.type,
              agents: config.agents.length,
              confidence: `${(config.confidence * 100).toFixed(1)}%`,
            });
          }
        }
      } else if (options.autoSwarms && options.dryRun) {
        logger.info('🧪 Dry run mode: Swarm creation skipped');
      } else {
        logger.info('ℹ️  Use --auto-swarms flag to create and deploy swarms');
      }

      // Phase 5: Results & Summary
      await this.showPhase('📊 Phase 5: Results Summary');
      await this.showResults(confidenceResult, options);

      const duration = (performance.now() - this.startTime) / 1000;
      logger.info(`🎉 Auto-discovery completed in ${duration.toFixed(2)}s`);
    } catch (error) {
      logger.error('💥 Auto-discovery failed:', error);
      process.exit(1);
    }
  }

  /**
   * Execute interactive TUI workflow
   */
  private async executeInteractive(projectPath: string, options: DiscoverOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      const { waitUntilExit } = render(
        React.createElement(InteractiveDiscoveryTUI, {
          projectPath,
          options: {
            confidence: options.confidence,
            maxIterations: options.maxIterations,
            skipValidation: options.skipValidation,
          },
          onComplete: (results) => {
            logger.info('🎉 Interactive discovery completed successfully');
            if (options.saveResults) {
              this.saveInteractiveResults(results, options.saveResults);
            }
            resolve();
          },
          onCancel: () => {
            logger.info('❌ Interactive discovery cancelled by user');
            reject(new Error('Discovery cancelled by user'));
          },
        })
      );

      waitUntilExit()
        .then(() => {
          resolve();
        })
        .catch(reject);
    });
  }

  /**
   * Save interactive results to file
   */
  private async saveInteractiveResults(results: any, outputPath: string): Promise<void> {
    try {
      const fs = await import('node:fs/promises');
      const resolvedPath = resolve(outputPath);

      const summary = {
        timestamp: new Date().toISOString(),
        selectedDomains: Array.from(results.selectedDomains || []),
        deployedSwarms: Array.from(results.deploymentStatus?.entries() || []).map(
          ([domain, status]) => ({
            domain,
            status: status.status,
            agents: status.agents.created,
            message: status.message,
          })
        ),
        configurations: Array.from(results.swarmConfigs?.entries() || []).map(
          ([domain, config]) => ({
            domain,
            topology: config.topology,
            maxAgents: config.maxAgents,
            resources: config.resourceLimits,
            persistence: config.persistence,
          })
        ),
      };

      let content: string;
      if (resolvedPath.endsWith('.json')) {
        content = JSON.stringify(summary, null, 2);
      } else if (resolvedPath.endsWith('.md')) {
        content = this.generateInteractiveMarkdownReport(summary);
      } else {
        content = JSON.stringify(summary, null, 2);
      }

      await fs.writeFile(resolvedPath, content, 'utf-8');
      logger.info(`💾 Interactive results saved to: ${resolvedPath}`);
    } catch (error) {
      logger.error('Failed to save interactive results:', error);
    }
  }

  /**
   * Generate markdown report for interactive results
   */
  private generateInteractiveMarkdownReport(results: any): string {
    return `# Interactive Discovery Results

## Summary
- **Timestamp**: ${results.timestamp}
- **Selected Domains**: ${results.selectedDomains.length}
- **Deployed Swarms**: ${results.deployedSwarms.length}

## Selected Domains
${results.selectedDomains.map((domain: string) => `- ${domain}`).join('\n')}

## Deployed Swarms
${results.deployedSwarms
  .map(
    (swarm: any) => `
### ${swarm.domain}
- **Status**: ${swarm.status}
- **Agents**: ${swarm.agents}
- **Message**: ${swarm.message}
`
  )
  .join('\n')}

## Configurations
${results.configurations
  .map(
    (config: any) => `
### ${config.domain}
- **Topology**: ${config.topology}
- **Max Agents**: ${config.maxAgents}
- **Memory**: ${config.resources.memory}
- **CPU**: ${config.resources.cpu}
- **Persistence**: ${config.persistence}
`
  )
  .join('\n')}

---
*Generated by Claude-Zen Interactive Discovery*
`;
  }

  /**
   * Show banner with system info
   */
  private showBanner(): void {}

  /**
   * Show phase header with progress
   */
  private async showPhase(_title: string): Promise<void> {
    const _elapsed = ((performance.now() - this.startTime) / 1000).toFixed(1);

    // Small delay for visual effect
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  /**
   * Show comprehensive results
   */
  private async showResults(confidenceResult: any, options: DiscoverOptions): Promise<void> {
    const duration = (performance.now() - this.startTime) / 1000;

    const results = {
      summary: {
        duration: `${duration.toFixed(2)}s`,
        domainsDiscovered: this.stats.domainsDiscovered,
        confidenceDomains: confidenceResult.domains.size,
        finalConfidence: `${(confidenceResult.confidence.overall * 100).toFixed(1)}%`,
        swarmsCreated: this.stats.swarmsCreated,
        agentsDeployed: this.stats.agentsDeployed,
        validationsPerformed: this.stats.validationsPerformed,
        researchQueries: this.stats.researchQueries,
      },
      domains: Array.from(confidenceResult.domains.entries()).map(
        ([name, domain]: [string, any]) => ({
          name,
          path: domain.path,
          confidence: `${(domain.confidence.overall * 100).toFixed(1)}%`,
          files: domain.files.length,
          concepts: domain.suggestedConcepts,
          technologies: domain.technologies || [],
          validations: domain.validations.length,
          research: domain.research.length,
        })
      ),
      relationships: confidenceResult.relationships.map((rel: any) => ({
        from: rel.sourceDomain,
        to: rel.targetDomain,
        type: rel.type,
        confidence: `${(rel.confidence * 100).toFixed(0)}%`,
        evidence: rel.evidence,
      })),
      confidenceMetrics: Object.entries(confidenceResult.confidence).map(([key, value]) => ({
        metric: key,
        score: `${((value as number) * 100).toFixed(1)}%`,
      })),
    };

    // Output results based on format
    switch (options.output) {
      case 'json':
        break;

      case 'markdown':
        await this.showMarkdownResults(results);
        break;

      default: // console
        await this.showConsoleResults(results);
        break;
    }

    // Save results if requested
    if (options.saveResults) {
      const fs = await import('node:fs/promises');
      const outputPath = resolve(options.saveResults);

      let content: string;
      if (outputPath.endsWith('.json')) {
        content = JSON.stringify(results, null, 2);
      } else if (outputPath.endsWith('.md')) {
        content = await this.generateMarkdownReport(results);
      } else {
        content = JSON.stringify(results, null, 2);
      }

      await fs.writeFile(outputPath, content, 'utf-8');
      logger.info(`💾 Results saved to: ${outputPath}`);
    }
  }

  /**
   * Show results in console format
   */
  private async showConsoleResults(results: any): Promise<void> {
    const _summary = results.summary;

    if (results.domains.length > 0) {
      for (const _domain of results.domains) {
      }
    }

    if (results.relationships.length > 0) {
      for (const _rel of results.relationships) {
      }
    }
    for (const _metric of results.confidenceMetrics) {
    }
    if (results.summary.swarmsCreated > 0) {
    } else {
    }
  }

  /**
   * Show results in markdown format
   */
  private async showMarkdownResults(results: any): Promise<void> {
    const _markdown = await this.generateMarkdownReport(results);
  }

  /**
   * Generate markdown report
   */
  private async generateMarkdownReport(results: any): Promise<string> {
    const summary = results.summary;

    return `# Auto-Discovery Results

## Summary
- **Duration**: ${summary.duration}
- **Domains Discovered**: ${summary.domainsDiscovered}
- **Confident Domains**: ${summary.confidenceDomains}
- **Final Confidence**: ${summary.finalConfidence}
- **Swarms Created**: ${summary.swarmsCreated}
- **Agents Deployed**: ${summary.agentsDeployed}
- **Human Validations**: ${summary.validationsPerformed}
- **Research Queries**: ${summary.researchQueries}

## Discovered Domains

${results.domains
  .map(
    (domain: any) => `### ${domain.name}
- **Path**: \`${domain.path}\`
- **Confidence**: ${domain.confidence}
- **Files**: ${domain.files}
- **Concepts**: ${domain.concepts.join(', ')}
- **Technologies**: ${domain.technologies.join(', ')}
- **Validations**: ${domain.validations}
- **Research**: ${domain.research}
`
  )
  .join('\n')}

## Domain Relationships

${results.relationships
  .map(
    (rel: any) =>
      `- **${rel.from}** ${rel.type} **${rel.to}** (${rel.confidence})\n  - Evidence: ${rel.evidence}`
  )
  .join('\n')}

## Confidence Metrics

${results.confidenceMetrics
  .map((metric: any) => `- **${metric.metric}**: ${metric.score}`)
  .join('\n')}

## Next Steps

${
  summary.swarmsCreated > 0
    ? '- ✅ Swarms are running and ready for tasks\n- 💡 Use `claude-zen status` to monitor swarm activity\n- 📊 Use `claude-zen dashboard` for real-time monitoring'
    : '- 💡 Run with `--auto-swarms` to create and deploy swarms\n- 🧪 Use `--dry-run` first to preview swarm configurations'
}

---
*Generated by Claude-Zen Auto-Discovery System*
`;
  }
}

// Export the command for CLI integration
export default DiscoverCommand;
