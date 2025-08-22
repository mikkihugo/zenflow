#!/usr/bin/env node

/**
 * AI Linter Self-Repair CLI
 *
 * Fixes systematic syntax corruptions caused by the AI linter's own processing errors.
 * This is a self-healing mechanism to repair bulk replacement mistakes.
 */

import { SelfRepairUtility } from './src/self-repair-utility.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.log('🤖 AI Linter Self-Repair Utility');
  console.log('==================================');

  // Get project root (go up from packages/ai-linter to root)
  const projectRoot = join(__dirname, '..', '..');

  console.log(`📂 Project root: ${projectRoot}`);
  console.log('');

  try {
    const repair = new SelfRepairUtility();
    const stats = await repair.repairProject(projectRoot);

    console.log('');
    console.log('📊 Repair Summary:');
    console.log(`   Files processed: ${stats.filesProcessed}`);
    console.log(`   Errors fixed: ${stats.errorsFixed}`);
    console.log('');

    if (stats.errorsFixed > 0) {
      console.log('🔧 Pattern fixes:');
      Object.entries(stats.patterns).forEach(([pattern, count]) => {
        console.log(`   • ${pattern.replace(/_/g, ' ')}: ${count} fixes`);
      });
      console.log('');
    }

    // Verify repairs
    console.log('🔍 Verifying TypeScript compilation...');
    const success = await repair.verifyRepairs(projectRoot);

    if (success) {
      console.log('✅ All repairs successful! TypeScript compilation passes.');
      process.exit(0);
    } else {
      console.log('⚠️  Some TypeScript errors remain. Additional manual fixes may be needed.');
      console.log('   Run: npx tsc --noEmit | head -20 to see remaining errors');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Self-repair failed:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);