#!/usr/bin/env npx tsx

/**
 * Import Singularity Engine Documents into Claude Code Zen
 * 
 * This demonstrates the ACTUAL workflow for importing documents
 * from existing repositories like singularity-engine
 */

import { copyFile, mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import { DocumentProcessor } from './src/core/document-processor.js';
import { MemorySystem } from './src/core/memory-system.js';

/**
 * Create the expected document directory structure.
 * 
 * Sets up the standard claude-code-zen document organization:
 * - 01-vision: Project vision and overview documents
 * - 02-adrs: Architectural Decision Records
 * - 03-prds: Product Requirements Documents
 * - 04-epics: Epic-level requirements
 * - 05-features: Feature specifications
 * - 06-tasks: Task lists and implementation items
 * - 07-specs: Technical specifications
 * 
 * @returns Promise resolving to the created docs directory path
 */
async function createDocumentStructure() {
  const docsDir = './docs-imported';
  const dirs = [
    '01-vision',
    '02-adrs', 
    '03-prds',
    '04-epics',
    '05-features',
    '06-tasks',
    '07-specs'
  ];
  
  for (const dir of dirs) {
    const fullPath = join(docsDir, dir);
    await mkdir(fullPath, { recursive: true });
  }
  
  return docsDir;
}

/**
 * Import documents from Singularity Engine repository.
 * 
 * Demonstrates the complete workflow for importing documents
 * from an existing repository with intelligent classification:
 * 1. Validate source repository exists
 * 2. Create structured document workspace
 * 3. Copy and classify key documents
 * 4. Process with DocumentProcessor
 * 5. Display results and statistics
 * 
 * @returns Promise that resolves when import is complete
 */
async function importSingularityDocs() {
  console.log('🚀 Importing Singularity Engine Documents');
  console.log('=========================================\n');
  
  const repoPath = '../singularity-engine';
  if (!existsSync(repoPath)) {
    console.error('❌ Singularity Engine repository not found at ../singularity-engine');
    return;
  }
  
  // Create document structure
  console.log('📁 Creating document workspace structure...');
  const docsDir = await createDocumentStructure();
  
  // Define document mappings from singularity-engine
  const documentMappings = [
    { source: 'README.md', target: '01-vision/singularity-engine-vision.md' },
    { source: 'CLAUDE.md', target: '07-specs/singularity-claude-config.md' },
    { source: 'TODO.md', target: '06-tasks/singularity-todo.md' },
    { source: 'DEVELOPMENT_BACKLOG.md', target: '05-features/development-backlog.md' },
    { source: 'BAZEL_MIGRATION_GUIDE.md', target: '06-tasks/bazel-migration.md' },
    { source: 'AI_ANALYSIS_REPORT.md', target: '07-specs/ai-analysis.md' },
    { source: 'SERVICE_INVENTORY_REPORT.md', target: '07-specs/service-inventory.md' },
  ];
  
  console.log(`📋 Importing ${documentMappings.length} key documents...\n`);
  
  let imported = 0;
  for (const mapping of documentMappings) {
    const sourcePath = join(repoPath, mapping.source);
    const targetPath = join(docsDir, mapping.target);
    
    if (existsSync(sourcePath)) {
      try {
        await mkdir(dirname(targetPath), { recursive: true });
        await copyFile(sourcePath, targetPath);
        console.log(`✅ ${mapping.source} → ${mapping.target}`);
        imported++;
      } catch (error) {
        console.error(`❌ Failed to copy ${mapping.source}:`, error.message);
      }
    } else {
      console.warn(`⚠️  Source not found: ${mapping.source}`);
    }
  }
  
  console.log(`\n📊 Successfully imported ${imported} documents\n`);
  
  // Now process with DocumentProcessor
  console.log('🔄 Processing documents with DocumentProcessor...');
  
  try {
    const memory = new MemorySystem({ 
      backend: 'json',
      persistPath: './.claude/cache/singularity-import'
    });
    await memory.initialize();
    
    const processor = new DocumentProcessor(memory, null, {
      workspaceRoot: docsDir,
      autoWatch: false,
      enableWorkflows: false
    });
    
    const workspaceId = await processor.loadWorkspace(docsDir);
    console.log(`✅ Loaded workspace: ${workspaceId}`);
    
    const stats = await processor.getStats();
    console.log('\n📈 Processing Results:');
    console.log(`   Total Documents: ${stats.totalDocuments}`);
    console.log(`   Document Types:`);
    Object.entries(stats.byType).forEach(([type, count]) => {
      if (count > 0) {
        console.log(`      ${type}: ${count}`);
      }
    });
    
    await memory.shutdown();
    console.log('\n🎉 Import complete!');
    
  } catch (error) {
    console.error('❌ Processing failed:', error.message);
  }
}

// For demonstration, also show what the Domain Discovery Bridge would find
/**
 * Demonstrate what Domain Discovery Bridge would find.
 * 
 * Shows the expected domain analysis results that would be
 * generated when the imported documents are processed by
 * the Domain Discovery Bridge system.
 */
async function demonstrateDomainDiscovery() {
  console.log('\n🧠 Domain Discovery Preview');
  console.log('===========================');
  
  console.log('🔍 Based on imported documents, Domain Discovery Bridge would identify:');
  console.log('');
  console.log('📋 Potential Domains:');
  console.log('   1. Service Architecture (from service inventory, AI analysis)');
  console.log('   2. Build System (from Bazel migration docs)'); 
  console.log('   3. AI Integration (from Claude config, AI analysis)');
  console.log('   4. Development Workflow (from TODO, backlog)');
  console.log('');
  console.log('🔗 Document-Code Mappings:');
  console.log('   • Bazel docs → BUILD.bazel files');
  console.log('   • Claude config → CLAUDE.md settings');
  console.log('   • Service specs → apps/ directories');
  console.log('   • TODO items → actual implementation files');
  console.log('');
  console.log('💡 Next Steps:');
  console.log('   1. Run Domain Discovery Bridge on processed docs');
  console.log('   2. Use TUI to review and validate domain mappings');
  console.log('   3. Apply knowledge-enhanced discovery for insights');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  importSingularityDocs()
    .then(() => demonstrateDomainDiscovery())
    .catch(console.error);
}

export { importSingularityDocs };