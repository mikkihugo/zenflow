#!/usr/bin/env tsx
/**
 * @fileoverview Build Script for All Standalone Libraries
 * 
 * Builds all standalone libraries in the correct order with dependency resolution.
 */

import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';

interface LibConfig {
  name: string;
  path: string;
  dependencies: string[];
}

const LIBS: LibConfig[] = [
  {
    name: 'shared',
    path: 'src/lib/shared',
    dependencies: [] // No dependencies
  },
  {
    name: 'dspy-engine',
    path: 'src/lib/dspy',
    dependencies: ['shared'] // Depends on shared LLM provider
  },
  {
    name: 'adaptive-learning',
    path: 'src/lib/adaptive-learning',
    dependencies: ['shared'] // Depends on shared LLM provider
  },
  {
    name: 'conversation-framework',
    path: 'src/lib/conversation',
    dependencies: ['shared'] // Depends on shared LLM provider
  }
];

async function runCommand(command: string, args: string[], cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`📦 Running: ${command} ${args.join(' ')} in ${cwd}`);
    
    const process = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    process.on('error', (error) => {
      reject(error);
    });
  });
}

async function libExists(libPath: string): Promise<boolean> {
  try {
    await fs.access(path.join(libPath, 'package.json'));
    return true;
  } catch {
    return false;
  }
}

async function buildLib(lib: LibConfig): Promise<void> {
  const libPath = path.resolve(lib.path);
  
  if (!(await libExists(libPath))) {
    console.log(`⚠️  Skipping ${lib.name} - package.json not found`);
    return;
  }

  console.log(`\n🚀 Building ${lib.name}...`);
  
  try {
    // Clean previous build
    await runCommand('npm', ['run', 'clean'], libPath);
    
    // Build the library
    await runCommand('npm', ['run', 'build'], libPath);
    
    console.log(`✅ Successfully built ${lib.name}`);
  } catch (error) {
    console.error(`❌ Failed to build ${lib.name}:`, error);
    throw error;
  }
}

async function buildAllLibs(): Promise<void> {
  console.log('🏗️  Building all standalone libraries...\n');
  
  const builtLibs = new Set<string>();
  const totalLibs = LIBS.length;
  
  // Build libraries in dependency order
  while (builtLibs.size < totalLibs) {
    let progressMade = false;
    
    for (const lib of LIBS) {
      if (builtLibs.has(lib.name)) continue;
      
      // Check if all dependencies are built
      const canBuild = lib.dependencies.every(dep => builtLibs.has(dep));
      
      if (canBuild) {
        await buildLib(lib);
        builtLibs.add(lib.name);
        progressMade = true;
      }
    }
    
    if (!progressMade) {
      const remaining = LIBS.filter(lib => !builtLibs.has(lib.name));
      console.error('❌ Circular dependency detected or missing dependencies:');
      remaining.forEach(lib => {
        const missingDeps = lib.dependencies.filter(dep => !builtLibs.has(dep));
        console.error(`  - ${lib.name} waiting for: ${missingDeps.join(', ')}`);
      });
      throw new Error('Build process stuck due to dependency issues');
    }
  }
  
  console.log('\n🎉 All libraries built successfully!');
  console.log('\n📦 Built libraries:');
  LIBS.forEach(lib => {
    if (builtLibs.has(lib.name)) {
      console.log(`  ✅ ${lib.name} (${lib.path}/dist)`);
    }
  });
}

async function main(): Promise<void> {
  try {
    await buildAllLibs();
    process.exit(0);
  } catch (error) {
    console.error('\n💥 Build failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}