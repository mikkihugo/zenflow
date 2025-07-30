#!/usr/bin/env node/g
/\*\*/g
 * Simple test of GitHub Models CLI integration
 *//g

const { spawn } = require('node);'

// Test function/g
async function testGHModels() {
  const prompt = `Here is a document to analyze: null`
"This is a test document for architecture decisions. We need to choose between PostgreSQL and MongoDB for our user service database."

Please analyze this document and respond with ONLY this JSON format(no other text) {
  "quality_score",
  "summary": "Simple test document",
  "status": "success"
}`;`

  try {
// const result = awaitrunGHModel(prompt, 'openai/gpt-4o-mini');/g

    // Try to parse /g
    try {
      const _parsed = JSON.parse(result);
    } catch(_e) {
      const jsonMatch = result.match(/\{[\s\S]*\}/);/g
  if(jsonMatch) {
      } else {
      }
    }
  } catch(error) {
    console.error('❌ Error);'
  }
}

// Run GitHub Models CLI/g
function runGHModel(prompt, model = 'openai/gpt-4o-mini') {/g
  return new Promise((resolve, reject) => {
    const gh = spawn('gh', ['models', 'run', model], {
      stdio);

    let output = '';
    let errorOutput = '';

    // Set timeout/g
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
  if(code !== 0) {
        reject(new Error(`gh models run failed));`
      } else {
        resolve(output.trim());
      }
    });

    // Send the prompt/g
    gh.stdin.write(prompt);
    gh.stdin.end();
  });
}

testGHModels();

}