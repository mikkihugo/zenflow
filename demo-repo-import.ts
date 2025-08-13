#!/usr/bin/env npx tsx

/**
 * Simple Demo: Import Documents from Existing Repository
 */

import { readdir, readFile } from 'fs/promises';
import { join, basename } from 'path';
import { existsSync } from 'fs';

/**
 * Perform a quick scan of repository for key documentation files.
 * 
 * Scans for common documentation files and provides basic classification.
 * Demonstrates the document detection and analysis capabilities without
 * requiring full system setup.
 * 
 * @param repoPath - Path to repository to scan
 * @returns Promise resolving to array of found document metadata
 */
async function quickScanRepo(repoPath: string) {
  console.log(`📁 Scanning: ${repoPath}\n`);
  
  if (!existsSync(repoPath)) {
    console.error(`❌ Repository not found: ${repoPath}`);
    return;
  }
  
  // Find README and key documentation files
  const importantDocs = [
    'README.md', 'CLAUDE.md', 'TODO.md', 'ARCHITECTURE.md',
    'ROADMAP.md', 'DEVELOPMENT_BACKLOG.md'
  ];
  
  const foundDocs: Array<{ file: string; type: string; size: number }> = [];
  
  for (const doc of importantDocs) {
    const fullPath = join(repoPath, doc);
    if (existsSync(fullPath)) {
      try {
        const content = await readFile(fullPath, 'utf8');
        const type = doc.toLowerCase().includes('readme') ? 'vision' :
                    doc.toLowerCase().includes('todo') ? 'task' :
                    doc.toLowerCase().includes('claude') ? 'spec' :
                    doc.toLowerCase().includes('architecture') ? 'adr' :
                    doc.toLowerCase().includes('roadmap') ? 'epic' : 'feature';
        
        foundDocs.push({
          file: doc,
          type: type,
          size: content.length
        });
        
        console.log(`✅ ${doc} (${type}) - ${content.length} chars`);
      } catch (error) {
        console.warn(`⚠️  Could not read ${doc}:`, error.message);
      }
    } else {
      console.log(`❌ ${doc} - not found`);
    }
  }
  
  console.log(`\n📊 Found ${foundDocs.length} key documents`);
  
  // Show document type distribution
  const typeCount = foundDocs.reduce((acc, doc) => {
    acc[doc.type] = (acc[doc.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('\n📋 Document Types:');
  Object.entries(typeCount).forEach(([type, count]) => {
    console.log(`   ${type}: ${count} files`);
  });
  
  return foundDocs;
}

/**
 * Main execution block for the repository scanning demo.
 * 
 * Demonstrates quick document discovery and classification
 * using the singularity-engine repository as an example.
 */

// Test with singularity-engine
const repoPath = '../singularity-engine';
console.log('🚀 Document Import Demo - Existing Repository\n');

quickScanRepo(repoPath).then(docs => {
  console.log('\n✨ Demo complete!');
  console.log('\n💡 To import these documents into claude-code-zen:');
  console.log('   1. Copy docs to ./docs/[type-directories]/');
  console.log('   2. Run: await documentProcessor.loadWorkspace("./docs")');
  console.log('   3. Use Domain Discovery Bridge for analysis');
});