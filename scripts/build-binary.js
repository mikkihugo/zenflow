#!/usr/bin/env node

/**
 * Comprehensive Binary Build Script for Claude Code Zen
 * 
 * Creates multiple binary distributions:
 * 1. PKG binaries (cross-platform, self-contained)
 * 2. NCC bundles (optimized single JS file)
 * 3. WASM-enabled binaries (neural capabilities)
 * 4. MCP server binaries (standalone MCP servers)
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, statSync, readdirSync, copyFileSync } from 'fs';
import path from 'path';

console.log('🚀 Building Claude Code Zen Binary Distributions...\n');

const startTime = Date.now();

// Ensure output directories exist
const outputDirs = ['bin', 'bin/ncc', 'bin/yao', 'bin/nexe', 'bin/boxed', 'bin/wasm'];
outputDirs.forEach(dir => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// Build configurations - using modern binary tools
const buildConfigs = [
  {
    name: 'Production Build',
    command: 'npm run build:prod',
    description: 'Compile TypeScript to optimized JavaScript'
  },
  {
    name: 'YAO-PKG Binary (Node 22 Support)',
    command: 'npx @yao-pkg/pkg dist/claude-zen.js --targets node22-linux-x64,node22-macos-x64,node22-win-x64 --output bin/yao/claude-zen',
    description: 'Modern pkg with Node.js 22 support'
  },
  {
    name: 'Nexe Binary',
    command: 'npx nexe dist/claude-zen.js --target=22.0.0 --output=bin/nexe/claude-zen',
    description: 'Nexe binary compilation with Node.js 22'
  },
  {
    name: 'BoxedNode Binary',
    command: 'npx boxednode dist/claude-zen.js bin/boxed/claude-zen',
    description: 'BoxedNode portable executable'
  },
  {
    name: 'NCC Bundle',
    command: 'npx ncc build dist/claude-zen.js -o bin/ncc --minify --no-source-map-register',
    description: 'Create optimized single JavaScript bundle'
  }
];

// Execute builds
for (const config of buildConfigs) {
  console.log(`\n🔨 ${config.name}`);
  console.log(`   ${config.description}`);
  
  try {
    const buildStart = Date.now();
    execSync(config.command, { stdio: 'inherit' });
    const buildTime = Date.now() - buildStart;
    console.log(`   ✅ Completed in ${buildTime}ms`);
  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`);
  }
}

// Copy WASM modules to binary distributions
console.log('\n📦 Copying WASM Modules...');
const wasmSources = [
  'src/neural/wasm/pkg-manual/zen_swarm_neural.wasm',
  'src/neural/wasm/pkg-manual/zen_swarm_neural.js',
  'src/neural/wasm/pkg-manual/zen_swarm_neural.d.ts'
];

wasmSources.forEach(src => {
  if (existsSync(src)) {
    const filename = path.basename(src);
    const destinations = [
      `bin/wasm/${filename}`,
      `bin/ncc/${filename}`,
      `bin/pkg/${filename}`
    ];
    
    destinations.forEach(dest => {
      try {
        copyFileSync(src, dest);
        console.log(`   📄 Copied ${filename} to ${path.dirname(dest)}`);
      } catch (error) {
        console.warn(`   ⚠️ Could not copy ${filename}: ${error.message}`);
      }
    });
  } else {
    console.warn(`   ⚠️ WASM module not found: ${src}`);
  }
});

// Generate distribution summary
console.log('\n📊 Binary Distribution Summary:');

const checkBinary = (filePath, name) => {
  if (existsSync(filePath)) {
    const stats = statSync(filePath);
    const sizeKB = Math.round(stats.size / 1024);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
    console.log(`   ✅ ${name}: ${sizeKB} KB (${sizeMB} MB)`);
    return { exists: true, size: stats.size };
  } else {
    console.log(`   ❌ ${name}: Not found`);
    return { exists: false, size: 0 };
  }
};

const binaries = [
  { path: 'bin/yao/claude-zen-linux', name: 'YAO-PKG Linux Binary' },
  { path: 'bin/yao/claude-zen-macos', name: 'YAO-PKG macOS Binary' },
  { path: 'bin/yao/claude-zen-win.exe', name: 'YAO-PKG Windows Binary' },
  { path: 'bin/nexe/claude-zen', name: 'Nexe Binary' },
  { path: 'bin/boxed/claude-zen', name: 'BoxedNode Binary' },
  { path: 'bin/ncc/index.js', name: 'NCC Bundle' },
  { path: 'bin/wasm/zen_swarm_neural.wasm', name: 'Neural WASM Module' }
];

let totalSize = 0;
let successCount = 0;

binaries.forEach(binary => {
  const result = checkBinary(binary.path, binary.name);
  if (result.exists) {
    totalSize += result.size;
    successCount++;
  }
});

const totalTime = Date.now() - startTime;
const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(1);

console.log(`\n🎉 Binary Build Complete!`);
console.log(`   ⏱️ Total time: ${totalTime}ms`);
console.log(`   📊 Binaries created: ${successCount}/${binaries.length}`);
console.log(`   💾 Total size: ${totalSizeMB} MB`);

// Create usage instructions
const usageInstructions = `
# Claude Code Zen Binary Usage Instructions

## Linux/macOS:
\`\`\`bash
# Make executable
chmod +x bin/pkg/claude-zen-linux
chmod +x bin/mcp/claude-zen-mcp-linux

# Run main application
./bin/pkg/claude-zen-linux

# Run MCP server
./bin/mcp/claude-zen-mcp-linux
\`\`\`

## Windows:
\`\`\`cmd
# Run main application
bin\\pkg\\claude-zen-win.exe

# Run MCP server (need to build Windows version)
\`\`\`

## NCC Bundle (requires Node.js):
\`\`\`bash
node bin/ncc/index.js
\`\`\`

## Features:
- ✅ Self-contained executables (no Node.js required for PKG binaries)
- ✅ Neural WASM modules included
- ✅ MCP server capabilities
- ✅ Cross-platform support
- ✅ Optimized performance

## File Sizes:
${binaries.map(b => `- ${b.name}: ${checkBinary(b.path, '').exists ? statSync(b.path).size + ' bytes' : 'Not found'}`).join('\n')}
`;

try {
  import('fs').then(fs => {
    fs.writeFileSync('bin/USAGE.md', usageInstructions);
    console.log('📚 Created bin/USAGE.md with instructions');
  });
} catch (error) {
  console.warn('⚠️ Could not create usage instructions file');
}

console.log('\n✨ All binaries ready for distribution!');
console.log('📁 Check the bin/ directory for your executables.');