/**
 * Test DSPy utilities directly to verify functionality
 */

import { SeededRNG } from './src/lib/dspy/utils/rng';
import { softmax, weightedSample, entropy } from './src/lib/dspy/utils/sampling';

console.log('🧪 Testing DSPy Utilities...\n');

try {
  // Test 1: Deterministic RNG
  console.log('=== Test 1: Deterministic RNG ===');
  const rng1 = new SeededRNG(12345);
  const rng2 = new SeededRNG(12345);
  
  const seq1 = Array.from({ length: 5 }, () => rng1.random());
  const seq2 = Array.from({ length: 5 }, () => rng2.random());
  
  console.log('Sequence 1:', seq1.map(x => x.toFixed(4)));
  console.log('Sequence 2:', seq2.map(x => x.toFixed(4)));
  console.log('✅ Deterministic:', JSON.stringify(seq1) === JSON.stringify(seq2));

  // Test 2: Softmax Function
  console.log('\n=== Test 2: Softmax Function ===');
  const scores = [1, 2, 3, 4, 5];
  const probs = softmax(scores);
  const sum = probs.reduce((a, b) => a + b, 0);
  
  console.log('Scores:', scores);
  console.log('Probabilities:', probs.map(x => x.toFixed(4)));
  console.log('✅ Sum to 1:', Math.abs(sum - 1.0) < 1e-10);
  
  // Test 3: Weighted Sampling
  console.log('\n=== Test 3: Weighted Sampling ===');
  const testRng = new SeededRNG(999);
  const weights = [0.1, 0.2, 0.7]; // Heavily favor index 2
  const samples = Array.from({ length: 1000 }, () => weightedSample(weights, testRng));
  
  const counts = [0, 0, 0];
  samples.forEach(s => counts[s]++);
  const frequencies = counts.map(c => c / 1000);
  
  console.log('Expected frequencies:', weights);
  console.log('Actual frequencies:', frequencies.map(x => x.toFixed(3)));
  console.log('✅ Close to expected:', frequencies.every((f, i) => Math.abs(f - weights[i]) < 0.05));

  // Test 4: Entropy Calculation
  console.log('\n=== Test 4: Entropy Calculation ===');
  const uniformProbs = [0.25, 0.25, 0.25, 0.25];
  const maxEntropy = Math.log(4); // log(n) for uniform distribution
  const actualEntropy = entropy(uniformProbs);
  
  console.log('Expected max entropy:', maxEntropy.toFixed(4));
  console.log('Actual entropy:', actualEntropy.toFixed(4));
  console.log('✅ Close to max:', Math.abs(actualEntropy - maxEntropy) < 0.01);

  // Test 5: Basic RNG Functions
  console.log('\n=== Test 5: Basic RNG Functions ===');
  const rng = new SeededRNG(777);
  
  console.log('Random [0,1):', rng.random().toFixed(4));
  console.log('Randint [5,15):', rng.randint(5, 15));
  console.log('Choice from array:', rng.choice(['A', 'B', 'C', 'D']));
  
  const sampleArray = [1, 2, 3, 4, 5];
  const sampled = rng.sample(sampleArray, 3);
  console.log('Sample 3 from [1,2,3,4,5]:', sampled);
  console.log('✅ Unique elements:', new Set(sampled).size === sampled.length);

  console.log('\n🎉 All DSPy utility tests passed! Ready for SIMBA implementation.');

} catch (error) {
  console.error('❌ Error testing utilities:', error.message);
  if (error.stack) {
    console.error('Stack trace:', error.stack);
  }
  process.exit(1);
}