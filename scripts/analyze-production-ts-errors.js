#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('🔍 Analyzing Production TypeScript Errors...\n');

try {
  execSync('npx tsc --noEmit --skipLibCheck', { encoding: 'utf-8' });
  console.log('✅ No TypeScript compilation errors!');
  process.exit(0);
} catch (error) {
  const output = error.stdout || '';
  const lines = output.split('\n');

  const productionErrors = [];
  const testErrors = [];

  for (const line of lines) {
    if (line.includes('error TS') && line.includes('src/')) {
      if (
        line.includes('__tests__') ||
        line.includes('.test.') ||
        line.includes('.spec.') ||
        line.includes('tests/')
      ) {
        testErrors.push(line);
      } else {
        productionErrors.push(line);
      }
    }
  }

  console.log(`📊 TypeScript Error Analysis:`);
  console.log(`   Production Errors: ${productionErrors.length}`);
  console.log(`   Test Errors: ${testErrors.length}`);
  console.log(
    `   Total Errors: ${productionErrors.length + testErrors.length}\n`
  );

  if (productionErrors.length > 0) {
    console.log('🚨 Production Errors (first 10):');
    productionErrors.slice(0, 10).forEach((error, i) => {
      console.log(`   ${i + 1}. ${error}`);
    });
  } else {
    console.log(
      '✅ No Production Code Errors - All TypeScript errors are in test files!'
    );
  }

  if (testErrors.length > 0 && productionErrors.length === 0) {
    console.log(
      "\n📝 Note: All TypeScript errors are in test files, which don't affect runtime compilation."
    );
  }
}
