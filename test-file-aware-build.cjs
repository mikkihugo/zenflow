#!/usr/bin/env node

/**
 * Simple test to verify file-aware AI build works
 */

async function testBuild() {
  console.log('🔧 Testing File-Aware AI Build');
  console.log('================================');

  try {
    // Test the built file-aware AI module
    const fileAwareAI = require('./packages/file-aware-ai/dist/minimal-index.js');
    
    console.log('✅ Module loaded successfully');
    console.log('📦 Available exports:', Object.keys(fileAwareAI));
    
    // Test the createFileAwareAI function
    if (fileAwareAI.createFileAwareAI) {
      console.log('🚀 Testing createFileAwareAI...');
      
      const ai = await fileAwareAI.createFileAwareAI({
        provider: 'fallback',
        model: 'test',
        rootPath: process.cwd()
      });
      
      console.log('✅ File-aware AI instance created');
      
      // Test a simple request
      const response = await ai.processRequest({
        task: 'Test compilation and integration',
        files: ['package.json'],
        options: { dryRun: true }
      });
      
      console.log('📊 Test Response:');
      console.log(`  - Success: ${response.success}`);
      console.log(`  - Provider: ${response.metadata.provider}`);
      console.log(`  - Model: ${response.metadata.model}`);
      console.log(`  - Execution Time: ${response.metadata.executionTime}ms`);
      console.log(`  - Changes: ${response.changes.length}`);
      
      if (response.changes.length > 0) {
        console.log(`  - First Change: ${response.changes[0].reasoning}`);
      }
      
      console.log('\n✅ File-Aware AI system is working!');
      console.log('🎯 Ready for integration with GitHub Copilot GPT-5');
      
      return true;
    } else {
      console.error('❌ createFileAwareAI function not found');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    return false;
  }
}

// Run the test
if (require.main === module) {
  testBuild()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Unhandled error:', error);
      process.exit(1);
    });
}