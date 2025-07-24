#!/usr/bin/env node

/**
 * Build script for ruv-swarm Rust bindings
 * Links to the ruv-FANN source and builds JavaScript bindings
 */

const { spawn } = require('child_process');
const { existsSync } = require('fs');
const path = require('path');

const RUVA_FANN_PATH = path.resolve(__dirname, '../../../ruv-FANN');
const RUVA_SWARM_NPM_PATH = path.join(RUVA_FANN_PATH, 'ruv-swarm/npm');

async function buildRustBindings() {
  console.log('🔗 Building ruv-swarm Rust bindings...');
  
  // Check if ruv-FANN source exists
  if (!existsSync(RUVA_FANN_PATH)) {
    console.error('❌ ruv-FANN source not found at:', RUVA_FANN_PATH);
    console.log('💡 Make sure ruv-FANN is cloned at the correct location');
    process.exit(1);
  }

  if (!existsSync(RUVA_SWARM_NPM_PATH)) {
    console.error('❌ ruv-swarm npm package not found at:', RUVA_SWARM_NPM_PATH);
    process.exit(1);
  }

  console.log('✅ ruv-FANN source found at:', RUVA_FANN_PATH);
  
  try {
    // Build the Rust crates first
    console.log('🦀 Building Rust crates...');
    await runCommand('cargo', ['build', '--release'], RUVA_FANN_PATH);
    
    // Build the npm package
    console.log('📦 Building npm package...');
    await runCommand('npm', ['run', 'build'], RUVA_SWARM_NPM_PATH);
    
    console.log('✅ Rust bindings built successfully');
    
    // Link to our workspace
    console.log('🔗 Linking to workspace...');
    await runCommand('npm', ['link'], RUVA_SWARM_NPM_PATH);
    await runCommand('npm', ['link', 'ruv-swarm'], __dirname);
    
    console.log('🎉 ruv-swarm bindings ready!');
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: cwd || process.cwd(),
      stdio: 'inherit',
      shell: true
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    
    child.on('error', reject);
  });
}

// Run if called directly
if (require.main === module) {
  buildRustBindings().catch(console.error);
}

module.exports = { buildRustBindings };