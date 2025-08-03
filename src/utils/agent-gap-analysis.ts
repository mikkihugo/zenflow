#!/usr/bin/env node

/**
 * Agent Gap Analysis CLI Utility
 *
 * Generate comprehensive analysis comparing our agent system to claude-flow
 */

import {
  auditAutoAssignmentCapabilities,
  generateComparisonReport,
  performGapAnalysis,
} from '../coordination/agents/gap-analysis.ts';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'report';

  try {
    switch (command) {
      case 'report':
      case 'compare': {
        console.log('🔍 Generating Agent System Gap Analysis Report...\n');
        const report = generateComparisonReport();
        console.log(report);
        break;
      }

      case 'stats':
      case 'summary': {
        console.log('📊 Agent System Summary\n');
        const analysis = performGapAnalysis();

        console.log(`✅ Our Agent System: ${analysis.ourTotal} specialized agent types`);
        console.log(`📋 claude-flow System: ${analysis.clauseFlowTotal} agent types`);
        console.log(
          `🚀 Our Advantage: ${analysis.ourAdvantage} additional agents (${analysis.advantageRatio}x more)`
        );
        console.log(
          `\n🏆 Performance Ratio: ${analysis.advantageRatio}x superior agent specialization\n`
        );

        // Top categories with advantages
        const topAdvantages = Object.entries(analysis.categoryComparison)
          .filter(([_, data]) => data.advantage > 0)
          .sort((a, b) => b[1].advantage - a[1].advantage)
          .slice(0, 5);

        console.log('🎯 Top Category Advantages:');
        for (const [category, data] of topAdvantages) {
          console.log(
            `  • ${category}: +${data.advantage} agents (${data.ours} vs ${data.theirs})`
          );
        }
        console.log('');
        break;
      }

      case 'audit': {
        console.log('🔍 Auto-Assignment Intelligence Audit\n');
        const audit = auditAutoAssignmentCapabilities();

        console.log('Current Capabilities:');
        console.log(`  ✅ Intelligent Selection: ${audit.hasIntelligentSelection}`);
        console.log(`  🔄 Workload Balancing: ${audit.hasWorkloadBalancing}`);
        console.log(`  📈 Performance Ranking: ${audit.hasPerformanceRanking}`);
        console.log(`  📁 File Type Matching: ${audit.hasFileTypeMatching}`);
        console.log('');

        console.log('Active Features:');
        for (const capability of audit.capabilities) {
          console.log(`  • ${capability}`);
        }
        console.log('');

        console.log('Enhancement Recommendations:');
        for (const recommendation of audit.recommendations) {
          console.log(`  💡 ${recommendation}`);
        }
        console.log('');
        break;
      }

      case 'agents': {
        console.log('🤖 All Agent Types by Category\n');
        const analysis = performGapAnalysis();

        // Show our agent categories
        const { OUR_AGENT_CATEGORIES } = await import('../coordination/agents/gap-analysis.js');

        for (const [category, agents] of Object.entries(OUR_AGENT_CATEGORIES)) {
          console.log(`\n## ${category} (${agents.length} agents)`);
          for (const agent of agents) {
            console.log(`  • ${agent}`);
          }
        }
        console.log(
          `\n📊 Total: ${analysis.ourTotal} agent types across ${Object.keys(OUR_AGENT_CATEGORIES).length} categories\n`
        );
        break;
      }

      case 'benchmark': {
        console.log('🏃 Performance Benchmark\n');

        const startTime = Date.now();
        const analysis = performGapAnalysis();
        const analysisTime = Date.now() - startTime;

        const reportStart = Date.now();
        const report = generateComparisonReport();
        const reportTime = Date.now() - reportStart;

        const auditStart = Date.now();
        const audit = auditAutoAssignmentCapabilities();
        const auditTime = Date.now() - auditStart;

        console.log('⚡ Performance Metrics:');
        console.log(`  • Gap Analysis: ${analysisTime}ms`);
        console.log(`  • Report Generation: ${reportTime}ms`);
        console.log(`  • Capability Audit: ${auditTime}ms`);
        console.log(`  • Total Analysis Time: ${analysisTime + reportTime + auditTime}ms`);
        console.log('');

        console.log('📊 System Scale:');
        console.log(`  • Agent Types Analyzed: ${analysis.ourTotal}`);
        console.log(`  • Categories Compared: ${Object.keys(analysis.categoryComparison).length}`);
        console.log(`  • Report Length: ${report.length.toLocaleString()} characters`);
        console.log('');
        break;
      }

      case 'help':
      default: {
        console.log('🔍 Agent Gap Analysis CLI\n');
        console.log('Available commands:');
        console.log('  report|compare  - Generate full comparison report');
        console.log('  stats|summary   - Show summary statistics');
        console.log('  audit          - Audit auto-assignment capabilities');
        console.log('  agents         - List all agent types by category');
        console.log('  benchmark      - Run performance benchmarks');
        console.log('  help           - Show this help\n');
        console.log('Usage:');
        console.log('  npx tsx src/utils/agent-gap-analysis.ts [command]\n');
        break;
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
