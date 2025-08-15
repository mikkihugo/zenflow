// Monkey patch to intercept path-to-regexp calls and see what patterns cause issues
const originalModule = require('path-to-regexp');
const originalParse = originalModule.parse;

// Override the parse function to log what patterns are being processed
originalModule.parse = function(str, options) {
  console.log('🔍 path-to-regexp parsing pattern:', JSON.stringify(str));
  
  try {
    return originalParse.call(this, str, options);
  } catch (error) {
    console.error('❌ path-to-regexp parse failed for pattern:', JSON.stringify(str));
    console.error('❌ Error:', error.message);
    throw error;
  }
};

console.log('🚀 path-to-regexp monkey patch applied');

// Now spawn tsx to run the main script
const { spawn } = require('child_process');
const child = spawn('tsx', ['src/main.ts', 'web', '--port', '3000'], { 
  stdio: 'inherit',
  env: { ...process.env }
});

child.on('error', (err) => {
  console.error('Failed to start tsx:', err);
});

child.on('exit', (code) => {
  console.log(`tsx process exited with code ${code}`);
});