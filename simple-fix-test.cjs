#!/usr/bin/env node
/**
 * Simple test to verify the tool execution fix
 */

const fs = require('fs/promises');

async function testDirectExecution() {
  console.log('🧪 DIRECT EXECUTION TEST');
  
  try {
    // Directly import and test SwarmTools
    const { default: SwarmTools } = await import('./build-quick/swarm-server.js');
    
    const swarmTools = new SwarmTools();
    
    console.log('✅ SwarmTools loaded successfully');
    
    // Test file creation
    const testPath = '/tmp/claude-zen-direct-test.txt';
    
    // Clean up
    try { await fs.unlink(testPath); } catch (e) {}
    
    console.log('📝 Testing file creation...');
    const result = await swarmTools.taskOrchestrate({
      task: `Create a test file at ${testPath} with content "Direct execution test" to verify tool execution`,
      strategy: 'direct-execution'
    });
    
    console.log('📊 RESULTS:');
    console.log('- Status:', result.status);
    console.log('- Actual Work:', result.actualWork);  
    console.log('- Tool Calls:', result.toolCalls);
    console.log('- File Operations:', result.fileOperations);
    console.log('- Trust Score:', result.trustScore);
    
    // Check if file was created
    const fileExists = async (path) => {
      try {
        await fs.access(path);
        return true;
      } catch { return false; }
    };
    
    const exists = await fileExists(testPath);
    console.log('- File exists:', exists);
    
    if (exists) {
      const content = await fs.readFile(testPath, 'utf8');
      console.log('- File content:', content.substring(0, 50));
    }
    
    // Success criteria
    const isFixed = result.actualWork && result.toolCalls.length > 0;
    
    console.log('\n🔍 ANALYSIS:');
    if (isFixed) {
      console.log('✅ SUCCESS: Tool execution is working!');
    } else {
      console.log('❌ ISSUE: Tool execution still broken');
      console.log('- actualWork should be true when files are created');
      console.log('- toolCalls should contain executed tools like ["Write"]');
    }
    
    // Cleanup
    try { await fs.unlink(testPath); } catch (e) {}
    
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack.split('\n').slice(0, 5).join('\n'));
    }
  }
}

testDirectExecution();