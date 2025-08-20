@echo off
REM Claude Code Zen - Windows Launcher

set "BIN_DIR=%~dp0"
set "BUNDLE_DIR=%BIN_DIR%bundle"
set "MAIN_SCRIPT=%BUNDLE_DIR%\index.js"

if not exist "%BUNDLE_DIR%" (
    echo ❌ Bundle directory not found. Please run: npm run binary:build
    exit /b 1
)

set "CLAUDE_ZEN_BUNDLE_MODE=true"
set "CLAUDE_ZEN_WASM_PATH=%BUNDLE_DIR%"

node "%MAIN_SCRIPT%" %*
