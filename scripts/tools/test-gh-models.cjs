#!/usr/bin/env node
/**
 * Simple test of GitHub Models CLI integration
 */

const { spawn } = require('child_process');

// Test function
async function testGHModels() {
  console.log('🧪 Testing GitHub Models CLI integration...\n');
  
  const prompt = `Here is a document to analyze:

"This is a test document for architecture decisions. We need to choose between PostgreSQL and MongoDB for our user service database."

Please analyze this document and respond with ONLY this JSON format (no other text):
{
  "quality_score": 8,
  "summary": "Simple test document",
  "status": "success"
}`;

  console.log('📤 Sending prompt to GitHub Models...');
  
  try {
    const result = await runGHModel(prompt, 'openai/gpt-4o-mini');
    console.log('📥 Response received:');
    console.log(result);
    
    // Try to parse as JSON
    try {
      const parsed = JSON.parse(result);
      console.log('\n✅ Successfully parsed JSON:');
      console.log(parsed);
    } catch (e) {
      console.log('\n⚠️ Could not parse as JSON, trying to extract...');
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log('✅ Extracted JSON:');
        console.log(JSON.parse(jsonMatch[0]));
      } else {
        console.log('❌ No JSON found in response');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run GitHub Models CLI
function runGHModel(prompt, model = 'openai/gpt-4o-mini') {
  return new Promise((resolve, reject) => {
    const gh = spawn('gh', ['models', 'run', model], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let output = '';
    let errorOutput = '';
    
    // Set timeout
    const timeout = setTimeout(() => {
      gh.kill();
      reject(new Error('Command timed out'));
    }, 15000);
    
    gh.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    gh.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    gh.on('close', (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        reject(new Error(`gh models run failed: ${errorOutput}`));
      } else {
        resolve(output.trim());
      }
    });
    
    // Send the prompt
    gh.stdin.write(prompt);
    gh.stdin.end();
  });
}

testGHModels();