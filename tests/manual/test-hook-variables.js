#!/usr/bin/env node

/**
 * Test harness for investigating Claude Code hook variable interpolation
 * Run this to test different variable syntaxes and see what works
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Test configurations with different variable syntaxes
const TEST_SYNTAXES = [
  {
    name: 'Current syntax with escaped quotes',
    syntax: '${file}',
    example: 'echo "File: \\"${file}\\"" >> hook-test.log'
  },
  {
    name: 'Current syntax without escaping',
    syntax: '${file}',
    example: 'echo "File: ${file}" >> hook-test.log'
  },
  {
    name: 'Environment variable syntax',
    syntax: '$CLAUDE_FILE',
    example: 'echo "File: $CLAUDE_FILE" >> hook-test.log'
  },
  {
    name: 'Braced environment variable',
    syntax: '${CLAUDE_FILE}',
    example: 'echo "File: ${CLAUDE_FILE}" >> hook-test.log'
  },
  {
    name: 'Double parentheses',
    syntax: '$((file))',
    example: 'echo "File: $((file))" >> hook-test.log'
  },
  {
    name: 'Backticks',
    syntax: '`file`',
    example: 'echo "File: `file`" >> hook-test.log'
  },
  {
    name: 'No variables - static test',
    syntax: 'none',
    example: 'echo "Hook executed at $(date)" >> hook-test.log'
  }
];

async function setupTest(testCase) {
  console.log(`\n🧪 Testing: ${testCase.name}`);
  console.log(`   Syntax: ${testCase.syntax}`);
  
  // Create test settings.json
  const settings = {
    hooks: {
      PostToolUse: [{
        matcher: "Write|Edit",
        hooks: [{
          type: "command",
          command: testCase.example
        }]
      }]
    }
  };
  
  // Ensure .claude directory exists
  await fs.mkdir('.claude', { recursive: true });
  
  // Write settings
  await fs.writeFile('.claude/settings.json', JSON.stringify(settings, null, 2));
  console.log('   ✅ Created .claude/settings.json');
  
  // Clear previous log
  try {
    await fs.unlink('hook-test.log');
  } catch (e) {
    // File doesn't exist, that's fine
  }
  
  return settings;
}

async function runTest() {
  console.log('🔬 Claude Code Hook Variable Interpolation Test');
  console.log('=' .repeat(50));
  
  // Test if Claude Code is available
  try {
    execSync('which claude', { stdio: 'ignore' });
    console.log('✅ Claude Code CLI found');
  } catch {
    console.log('❌ Claude Code CLI not found. Please install it first.');
    console.log('   npm install -g @anthropic-ai/claude-code');
    return;
  }
  
  // Create results directory
  const resultsDir = path.join(__dirname, 'hook-test-results');
  await fs.mkdir(resultsDir, { recursive: true });
  
  const results = [];
  
  for (const testCase of TEST_SYNTAXES) {
    await setupTest(testCase);
    
    console.log('   📝 Creating test file to trigger hook...');
    
    // Create a simple test file that should trigger the hook
    const testFile = 'test-trigger.txt';
    const testContent = `Test content for ${testCase.name}\nCreated at: ${new Date().toISOString()}`;
    
    // This would need to be done through Claude Code to trigger the hook
    // For now, we'll just document the test procedure
    console.log(`   ⚠️  Manual step required:`);
    console.log(`      1. Open Claude Code`);
    console.log(`      2. Run: claude -c "Create a file ${testFile} with content: ${testContent}"`);
    console.log(`      3. Check if hook-test.log was created`);
    console.log(`      4. Record the results\n`);
    
    // Save test configuration
    const testConfig = {
      testCase,
      settings: await fs.readFile('.claude/settings.json', 'utf8'),
      timestamp: new Date().toISOString()
    };
    
    await fs.writeFile(
      path.join(resultsDir, `test-${testCase.name.replace(/\s+/g, '-')}.json`),
      JSON.stringify(testConfig, null, 2)
    );
    
    results.push({
      name: testCase.name,
      syntax: testCase.syntax,
      command: testCase.example,
      result: 'Pending manual test'
    });
  }
  
  // Generate test report
  console.log('\n📊 Test Summary');
  console.log('=' .repeat(50));
  console.table(results);
  
  // Save summary
  await fs.writeFile(
    path.join(resultsDir, 'test-summary.json'),
    JSON.stringify({
      timestamp: new Date().toISOString(),
      claudeVersion: 'unknown', // Would need to get this from claude --version
      tests: results
    }, null, 2)
  );
  
  console.log(`\n✅ Test configurations saved to: ${resultsDir}`);
  console.log('\n📋 Next Steps:');
  console.log('1. Run each test case manually in Claude Code');
  console.log('2. Record which variable syntaxes work');
  console.log('3. Update the test-summary.json with results');
  console.log('4. Use working syntax in templates');
}

// Additional utility to test environment variables
async function testEnvironmentVariables() {
  console.log('\n🔍 Checking available environment variables in hooks...');
  
  const envTestSettings = {
    hooks: {
      PostToolUse: [{
        matcher: "Write",
        hooks: [{
          type: "command",
          command: "env | grep -i claude >> hook-env.log"
        }]
      }]
    }
  };
  
  await fs.writeFile('.claude/settings.json', JSON.stringify(envTestSettings, null, 2));
  console.log('✅ Created environment variable test hook');
  console.log('   Run: claude -c "Create test-env.txt" to see what env vars are available');
}

// Run tests
if (process.argv.includes('--env')) {
  testEnvironmentVariables();
} else {
  runTest();
}

console.log('\n💡 Tip: Run with --env flag to test environment variables');