#!/usr/bin/env node

/**
 * Agent Gap Analysis CLI Utility
 *
 * Generate comprehensive analysis comparing our agent system to claude-zen
 */

import {
  auditAutoAssignmentCapabilities,
  generateComparisonReport,
  performGapAnalysis,
} from '../coordination/agents/gap-analysis';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'report';

  try {
    switch (command) {
      case 'report':
      case 'compare': {
        const report = generateComparisonReport();
        console.log('📊 Agent Gap Analysis Report:');
        console.log(JSON.stringify(report, null, 2));
        break;
      }

      case 'stats':
      case 'summary': {
        const analysis = performGapAnalysis();

        // Top categories with advantages
        const topAdvantages = Object.entries(analysis.categoryComparison)
          .filter(([_, data]) => data.advantage > 0)
          .sort((a, b) => b[1].advantage - a[1].advantage)
          .slice(0, 5);
        for (const [_category, _data] of topAdvantages) {
        }
        break;
      }

      case 'audit': {
        const audit = auditAutoAssignmentCapabilities();
        console.log('🔍 Auto-Assignment Audit:');
        console.log('\n📋 Capabilities:');
        for (const capability of audit.capabilities) {
          console.log(`  ✅ ${capability.name}: ${capability.description}`);
          console.log(`     Coverage: ${capability.coverage}%`);
        }
        console.log('\n💡 Recommendations:');
        for (const recommendation of audit.recommendations) {
          console.log(`  🔸 ${recommendation.type}: ${recommendation.message}`);
          if (recommendation.priority) {
            console.log(`     Priority: ${recommendation.priority}`);
          }
        }
        break;
      }

      case 'agents': {
        const analysis = performGapAnalysis();
        console.log('🤖 Agent Gap Analysis:');
        console.log(`\n📊 Analysis Summary:`);
        console.log(`   Total Gaps: ${analysis.totalGaps || 0}`);
        console.log(`   Coverage: ${analysis.coverage || 0}%`);
        if (analysis.recommendations) {
          console.log(`   Recommendations: ${analysis.recommendations.length}`);
        }

        // Show our agent categories
        const { OUR_AGENT_CATEGORIES } = await import('../coordination/agents/gap-analysis.js');

        console.log('\n🏷️ Agent Categories:');
        for (const [category, agents] of Object.entries(OUR_AGENT_CATEGORIES)) {
          console.log(`\n  📁 ${category}:`);
          for (const agent of agents) {
            console.log(`     🤖 ${agent.name || agent.type || agent}: ${agent.description || 'No description'}`);
            if (agent.capabilities) {
              console.log(`        Capabilities: ${agent.capabilities.join(', ')}`);
            }
          }
        }
        break;
      }

      case 'benchmark': {
        const startTime = Date.now();
        const analysis = performGapAnalysis();
        const analysisTime = Date.now() - startTime;

        const reportStart = Date.now();
        const report = generateComparisonReport();
        const reportTime = Date.now() - reportStart;

        const auditStart = Date.now();
        const audit = auditAutoAssignmentCapabilities();
        const auditTime = Date.now() - auditStart;

        console.log('⏱️ Performance Benchmark Results:');
        console.log(`  Gap Analysis: ${analysisTime}ms`);
        console.log(`  Report Generation: ${reportTime}ms`);
        console.log(`  Capability Audit: ${auditTime}ms`);
        console.log(`  Total: ${analysisTime + reportTime + auditTime}ms`);
        
        console.log('\n📊 Analysis Summary:');
        console.log(`  Categories analyzed: ${Object.keys(analysis.categoryComparison).length}`);
        console.log(`  Capabilities audited: ${audit.capabilities.length}`);
        console.log(`  Recommendations: ${audit.recommendations.length}`);
        break;
      }
      default: {
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
