#!/usr/bin/env node

/**
 * Test code analysis with a simple file
 */

import { CodeAnalysisService } from './src/services/code-analysis/index.js';
import { mkdir } from 'fs/promises';

async function testSimpleAnalysis() {
  console.log('🧪 Testing code analysis with simple file...');

  try {
    // Ensure tmp directory exists
    await mkdir('./tmp/test-analysis', { recursive: true });

    const service = new CodeAnalysisService({
      projectPath: './tmp/test-analysis',
      outputDir: './tmp/analysis-results'
    });

    console.log('🚀 Initializing analysis service...');
    await service.initialize();

    console.log('📁 Running analysis on test file...');
    const results = await service.analyzeFiles(['./tmp/test-analysis/calculator.js']);
    
    console.log('✅ Analysis completed!');
    console.log('📊 Functions found:', results.functions.map(f => ({
      name: f.name,
      complexity: f.cyclomatic_complexity,
      parameters: f.parameter_count
    })));

    console.log('📦 Classes found:', results.classes.map(c => ({
      name: c.name,
      methods: c.method_count
    })));

    console.log('🔗 Imports found:', results.imports.map(i => i.module_name));

    // Test query functionality (will use fallback since Kuzu not available)
    console.log('🔍 Testing queries...');
    const queryResult = await service.query('find_high_complexity');
    console.log('📊 Query result:', queryResult);

    // Cleanup
    await service.cleanup();
    
    console.log('✅ Simple analysis test passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testSimpleAnalysis();