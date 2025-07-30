#!/usr/bin/env node
/**
 * Simple test of GitHub Models CLI integration
 */

const { spawn } = require('node:child_process');

// Test function
async function testGHModels() {
  const prompt = `Here is a document to analyze:

"This is a test document for architecture decisions. We need to choose between PostgreSQL and MongoDB for our user service database."

Please analyze this document and respond with ONLY this JSON format (no other text):
{
  "quality_score": 8,
  "summary": "Simple test document",
  "status": "success"
}`;

  try {
    const result = await runGHModel(prompt, 'openai/gpt-4o-mini');

    // Try to parse as JSON
    try {
      const _parsed = JSON.parse(result);
    } catch (_e) {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
      } else {
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
      stdio: ['pipe', 'pipe', 'pipe'],
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
