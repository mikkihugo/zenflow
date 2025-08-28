#!/usr/bin/env node
/**
 * Test script for AI linter on memory system
 */

// Direct access for testing (normally would use facade)
import { createAILinter } from '../ai-linter/dist/index.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testAILinter() {
     
    // eslint-disable-next-line no-console
  console.log('🤖 Testing AI Linter on Memory System\n');
  
  try {
    // Get AI linter instance with GPT-4.1 Copilot configuration
    const aiLinter = createAILinter();
    
    // Configure for GPT-4.1 with Copilot
    aiLinter.updateConfig({
      aiMode: 'gpt-4.1',
      temperature: 0.0,
      maxRetries: 3,
      backupEnabled: true,
      processingMode: 'sequential' // More reliable for testing
    });
    
     
    // eslint-disable-next-line no-console
    console.log('✅ AI Linter initialized with GPT-4.1 + Copilot');
     
    // eslint-disable-next-line no-console
    console.log('📋 Configuration:', aiLinter.getConfig());
    
    // Test file discovery
     
    // eslint-disable-next-line no-console
    console.log('\n🔍 Discovering files to lint...');
    const discoveryResult = await aiLinter.discoverFiles({
      scope: 'app-only',
      extensions: ['.ts'],
      includePatterns: ['src/**/*.ts']
    });
    
    if (discoveryResult.success) {
     
    // eslint-disable-next-line no-console
      console.log(`📁 Found ${discoveryResult.data.length} files`);
      if (discoveryResult.data.length > 0) {
     
    // eslint-disable-next-line no-console
        console.log('Files:', discoveryResult.data.slice(0, 5));
      }
    } else {
     
    // eslint-disable-next-line no-console
      console.log('❌ File discovery failed:', discoveryResult.error);
    }
    
    // Test single file processing
    const testFile = join(__dirname, 'src/types.ts');
     
    // eslint-disable-next-line no-console
    console.log(`\n🔧 Testing single file processing: ${testFile}`);
    
    const fileResult = await aiLinter.processFile(testFile);
    
    if (fileResult.success) {
     
    // eslint-disable-next-line no-console
      console.log('✅ File processing result:');
     
    // eslint-disable-next-line no-console
      console.log({
        filePath: fileResult.data.filePath,
        success: fileResult.data.success,
        originalErrors: fileResult.data.originalErrors,
        fixedErrors: fileResult.data.fixedErrors,
        aiModel: fileResult.data.aiModel,
        timeTaken: fileResult.data.timeTaken
      });
    } else {
     
    // eslint-disable-next-line no-console
      console.log('❌ File processing failed:', fileResult.error);
    }
    
    // Test batch processing on a few files
    const batchFiles = [
      join(__dirname, 'src/types.ts'),
      join(__dirname, 'src/index.ts')
    ].filter(Boolean);
    
    if (batchFiles.length > 0) {
     
    // eslint-disable-next-line no-console
      console.log(`\n📦 Testing batch processing on ${batchFiles.length} files...`);
      
      const batchResult = await aiLinter.processBatch(batchFiles);
      
      if (batchResult.success) {
     
    // eslint-disable-next-line no-console
        console.log('✅ Batch processing completed:');
     
    // eslint-disable-next-line no-console
        console.log({
          totalFiles: batchResult.data.totalFiles,
          processedFiles: batchResult.data.processedFiles,
          successCount: batchResult.data.successCount,
          failureCount: batchResult.data.failureCount,
          totalErrors: batchResult.data.totalErrors,
          totalFixed: batchResult.data.totalFixed,
          totalTime: batchResult.data.totalTime
        });
      } else {
     
    // eslint-disable-next-line no-console
        console.log('❌ Batch processing failed:', batchResult.error);
      }
    }
    
  } catch (error) {
     
    // eslint-disable-next-line no-console
    console.error('💥 Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testAILinter().then(() => {
     
    // eslint-disable-next-line no-console
  console.log('\n🎉 AI Linter test completed');
}).catch(error => {
     
    // eslint-disable-next-line no-console
  console.error('💥 Test failed:', error);
  process.exit(1);
});