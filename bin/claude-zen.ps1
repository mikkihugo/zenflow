#!/usr/bin/env pwsh

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
