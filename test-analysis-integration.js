#!/usr/bin/env node

/**
 * Test the code analysis integration
 */

import { CodeAnalysisService } from './src/services/code-analysis/index.js';

async function testAnalysis() {
  console.log('🧪 Testing code analysis integration...');

  try {
    const service = new CodeAnalysisService({
      projectPath: process.cwd(),
      outputDir: './tmp/test-analysis'
    });

    console.log('🚀 Initializing analysis service...');
    await service.initialize();

    console.log('📁 Testing file analysis...');
    const testFiles = [
      './src/services/code-analysis/ast-parser.js'
    ];
    
    const results = await service.analyzeFiles(testFiles);
    
    console.log('✅ Analysis completed!');
    console.log(`📊 Results:`, {
      files: results.files.length,
      functions: results.functions.length,
      classes: results.classes.length,
      variables: results.variables.length,
      imports: results.imports.length
    });

    // Test stats
    const stats = await service.getStats();
    console.log('📈 Service stats:', stats);

    // Cleanup
    await service.cleanup();
    
    console.log('✅ All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testAnalysis();