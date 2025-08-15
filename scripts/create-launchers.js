#!/usr/bin/env node

/**
 * Create cross-platform launchers for Claude Code Zen Bundle
 */

import { writeFileSync, mkdirSync, existsSync, chmodSync } from 'fs';
import path from 'path';

console.log('🚀 Creating Claude Code Zen Launchers...');

// Ensure bin directory exists
if (!existsSync('bin')) {
  mkdirSync('bin', { recursive: true });
}

// Unix/Linux/macOS launcher
const unixLauncher = `#!/usr/bin/env node

/**
 * Claude Code Zen - Cross-platform AI Development Platform
 * Launcher for bundled distribution
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';
import { existsSync } from 'fs';

// Get the directory of this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const binDir = __dirname;
const bundleDir = join(binDir, 'bundle');
const mainScript = join(bundleDir, 'index.js');

// Pass all arguments to the main script
const args = process.argv.slice(2);

// Ensure bundle directory exists
if (!existsSync(bundleDir)) {
  console.error('❌ Bundle directory not found. Please run: npm run binary:build');
  process.exit(1);
}

// Set environment variables for WASM modules
process.env.CLAUDE_ZEN_BUNDLE_MODE = 'true';
process.env.CLAUDE_ZEN_WASM_PATH = bundleDir;

// Launch the main application
const child = spawn('node', [mainScript, ...args], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: { ...process.env }
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

child.on('error', (error) => {
  console.error('❌ Failed to start Claude Code Zen:', error.message);
  process.exit(1);
});
`;

// Windows launcher
const windowsLauncher = `@echo off
REM Claude Code Zen - Windows Launcher

set "BIN_DIR=%~dp0"
set "BUNDLE_DIR=%BIN_DIR%bundle"
set "MAIN_SCRIPT=%BUNDLE_DIR%\\index.js"

if not exist "%BUNDLE_DIR%" (
    echo ❌ Bundle directory not found. Please run: npm run binary:build
    exit /b 1
)

set "CLAUDE_ZEN_BUNDLE_MODE=true"
set "CLAUDE_ZEN_WASM_PATH=%BUNDLE_DIR%"

node "%MAIN_SCRIPT%" %*
`;

// PowerShell launcher
const powershellLauncher = `#!/usr/bin/env pwsh

# Claude Code Zen - PowerShell Launcher

$BinDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BundleDir = Join-Path $BinDir "bundle"
$MainScript = Join-Path $BundleDir "index.js"

if (-not (Test-Path $BundleDir)) {
    Write-Error "❌ Bundle directory not found. Please run: npm run binary:build"
    exit 1
}

$env:CLAUDE_ZEN_BUNDLE_MODE = "true"
$env:CLAUDE_ZEN_WASM_PATH = $BundleDir

& node $MainScript $args
`;

// Write launchers
const launchers = [
  { name: 'claude-zen', content: unixLauncher, executable: true },
  { name: 'claude-zen.cmd', content: windowsLauncher, executable: false },
  { name: 'claude-zen.ps1', content: powershellLauncher, executable: true },
];

launchers.forEach((launcher) => {
  const filePath = path.join('bin', launcher.name);
  writeFileSync(filePath, launcher.content);

  if (launcher.executable && process.platform !== 'win32') {
    try {
      chmodSync(filePath, '755');
      console.log(`✅ Created executable launcher: ${launcher.name}`);
    } catch (error) {
      console.log(`✅ Created launcher: ${launcher.name} (chmod failed)`);
    }
  } else {
    console.log(`✅ Created launcher: ${launcher.name}`);
  }
});

// Create package.json for distribution
const distributionPackage = {
  name: '@zen-ai/claude-code-zen-bundle',
  version: '1.0.0-alpha.43',
  description: 'Claude Code Zen - Bundled Distribution',
  bin: {
    'claude-zen': 'claude-zen',
    'claude-zen-cmd': 'claude-zen.cmd',
  },
  files: ['claude-zen', 'claude-zen.cmd', 'claude-zen.ps1', 'bundle/'],
  engines: {
    node: '>=18.0.0',
  },
  keywords: ['ai', 'development', 'cli', 'bundle', 'swarm'],
  license: 'MIT',
};

writeFileSync('bin/package.json', JSON.stringify(distributionPackage, null, 2));
console.log('✅ Created distribution package.json');

// Create README for distribution
const readme = `# Claude Code Zen - Bundled Distribution

## Quick Start

\`\`\`bash
# Linux/macOS
./claude-zen --help

# Windows Command Prompt
claude-zen.cmd --help

# Windows PowerShell
.\\claude-zen.ps1 --help
\`\`\`

## Features

- ✅ Complete AI development platform
- ✅ Neural WASM acceleration
- ✅ MCP server capabilities
- ✅ Cross-platform support
- ✅ No Node.js installation required*

*Requires Node.js 18+ for now (standalone binaries coming soon)

## Bundle Contents

- \`bundle/\` - Optimized NCC bundle (7MB+ with WASM modules)
- \`claude-zen\` - Unix/Linux/macOS launcher
- \`claude-zen.cmd\` - Windows batch launcher
- \`claude-zen.ps1\` - PowerShell launcher

## Usage

Same as the regular Claude Code Zen installation:

\`\`\`bash
# Start integrated mode
./claude-zen integrated

# Start MCP server
./claude-zen mcp

# Run swarm operations
./claude-zen swarm init
\`\`\`
`;

writeFileSync('bin/README.md', readme);
console.log('✅ Created distribution README');

console.log('\n🎉 All launchers created successfully!');
console.log('📁 Distribution ready in bin/ directory');
console.log('📦 Bundle size: ~7MB with WASM neural modules');
