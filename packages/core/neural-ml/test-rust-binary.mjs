#!/usr/bin/env node

/**
 * Simple test of Rust neural-ml binary integration
 * Tests the actual Rust binary to ensure the integration works
 */

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function executeRustCommand(args) {
  return new Promise((resolve, reject) => {
    const rustBinaryPath = join(__dirname, 'neural-core/target/debug/neural-ml');
    const process = spawn(rustBinaryPath, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(new Error(`Process exited with code ${code}: ${stderr}`));
      }
    });

    process.on('error', (error) => {
      reject(error);
    });
  });
}

async function testRustBinary() {
  console.log('🧪 Testing Rust Neural ML Binary Integration...');
  
  try {
    // Test version command
    const version = await executeRustCommand(['--version']);
    console.log('✅ Version:', version);
    
    // Test stats command
    const stats = await executeRustCommand(['--stats']);
    const statsObj = JSON.parse(stats);
    console.log('✅ Stats:', {
      backend: statsObj.backend,
      threads: statsObj.threads,
      algorithms: statsObj.algorithms.length
    });
    
    // Test statistical analysis
    const task = JSON.stringify({
      algorithm: 'statistical_analysis',
      parameters: {},
      data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    });
    
    const result = await executeRustCommand(['optimize', '--task', task]);
    const resultObj = JSON.parse(result);
    console.log('✅ Statistical analysis:', {
      algorithm: resultObj.algorithm,
      mean: resultObj.mean,
      std: resultObj.std,
      median: resultObj.median,
      convergence: resultObj.convergence
    });
    
    // Test pattern learning
    const patternTask = JSON.stringify({
      algorithm: 'pattern_learning',
      parameters: { cluster_count: 3 },
      data: [1, 1, 2, 2, 3, 3, 1, 2, 3, 1]
    });
    
    const patternResult = await executeRustCommand(['optimize', '--task', patternTask]);
    const patternObj = JSON.parse(patternResult);
    console.log('✅ Pattern learning:', {
      algorithm: patternObj.algorithm,
      patterns: patternObj.patterns?.length || 0,
      clusters: patternObj.clusters?.length || 0,
      similarity: patternObj.similarity
    });
    
    console.log('\n🎉 All Rust binary tests passed!');
    console.log('🚀 Rust -> TypeScript integration is working correctly');
    console.log('💡 Key benefit: Using actual Rust implementations instead of JavaScript fallbacks');
    
  } catch (error) {
    console.error('❌ Rust binary test failed:', error.message);
    process.exit(1);
  }
}

testRustBinary();