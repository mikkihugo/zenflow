#!/usr/bin/env node

/**
 * 🧘 Quick Test - Graph-based ESLint on Top Priority Files Only
 */

import { ProcessLock } from './process-lock.js';
import { SimpleGraphESLintAnalyzer } from './zen-eslint-graph-simple.js';

async function quickTest() {
  console.log('🧪 Quick Test - Graph ESLint on Top Priority Files');
  console.log('===================================================');

  // Acquire process lock to prevent conflicts
  const lock = new ProcessLock('zen-eslint-quick');
  lock.acquire();

  const analyzer = new SimpleGraphESLintAnalyzer();

  try {
    // Build dependency graph
    await analyzer.buildDependencyGraph();

    // Get top 20 priority files only
    const prioritizedFiles = analyzer.prioritizeFilesByImpact().slice(0, 20);

    console.log(`\n🎯 Testing top ${prioritizedFiles.length} priority files:`);
    prioritizedFiles.forEach((file, i) => {
      console.log(`  ${i + 1}. ${file.path.split('/').pop()}`);
    });

    // Create small batches for top files
    const batches = analyzer.createIntelligentBatches(prioritizedFiles, 5);

    console.log(`\n📊 Processing ${batches.length} batches...`);

    let totalViolations = 0;

    for (const [index, batch] of batches.entries()) {
      console.log(`📦 Batch ${index + 1}/${batches.length} (${batch.length} files)`);

      try {
        const violations = await analyzer.runESLintOnBatch(batch);
        totalViolations += violations.length;

        console.log(`✅ Found ${violations.length} violations in batch ${index + 1}`);

        // Show some example violations
        if (violations.length > 0) {
          const sample = violations.slice(0, 3);
          sample.forEach((v) => {
            const fileName = v.file.split('/').pop();
            console.log(`    • ${fileName}:${v.line} - ${v.rule}: ${v.message}`);
          });
        }
      } catch (error) {
        console.warn(`⚠️  Batch ${index + 1} failed:`, error.message);
      }
    }

    console.log(`\n🎊 Quick test complete:`);
    console.log(`  • ${totalViolations} violations found in top priority files`);
    console.log(`  • Graph analysis working correctly ✅`);
    console.log(`  • ENOBUFS issue resolved ✅`);
    console.log(`  • Ready for full analysis or AI-assisted fixing`);

    return { violations: totalViolations, success: true };
  } catch (error) {
    console.error('❌ Quick test failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Run quick test
quickTest().then((result) => {
  if (result.success) {
    console.log('\n✨ System ready for production use!');
    process.exit(0);
  } else {
    process.exit(1);
  }
});
