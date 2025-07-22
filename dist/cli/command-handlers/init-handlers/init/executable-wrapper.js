// executable-wrapper.js - Create local executable wrapper

import { writeFile, chmod } from 'fs/promises';
import { platform } from 'os';

export async function createLocalExecutable(workingDir, dryRun = false) {
  try {
    if (platform() === 'win32') {
      // Create Windows batch file
      const wrapperScript = `@echo off
REM Claude-Flow local wrapper
REM This script ensures claude-zen runs from your project directory

set PROJECT_DIR=%CD%
set PWD=%PROJECT_DIR%
set CLAUDE_WORKING_DIR=%PROJECT_DIR%

REM Try to find claude-zen binary
REM Check common locations for npm/npx installations

REM 1. Local node_modules (npm install claude-zen)
if exist "%PROJECT_DIR%\\node_modules\\.bin\\claude-zen.cmd" (
  cd /d "%PROJECT_DIR%"
  "%PROJECT_DIR%\\node_modules\\.bin\\claude-zen.cmd" %*
  exit /b %ERRORLEVEL%
)

REM 2. Parent directory node_modules (monorepo setup)
if exist "%PROJECT_DIR%\\..\\node_modules\\.bin\\claude-zen.cmd" (
  cd /d "%PROJECT_DIR%"
  "%PROJECT_DIR%\\..\\node_modules\\.bin\\claude-zen.cmd" %*
  exit /b %ERRORLEVEL%
)

REM 3. Global installation (npm install -g claude-zen)
where claude-zen >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  cd /d "%PROJECT_DIR%"
  claude-zen %*
  exit /b %ERRORLEVEL%
)

REM 4. Fallback to npx (will download if needed)
cd /d "%PROJECT_DIR%"
npx claude-zen@latest %*
`;

      // Write the Windows batch file
      if (!dryRun) {
        await writeFile(`${workingDir}/claude-zen.cmd`, wrapperScript, 'utf8');
        console.log('  ✓ Created local claude-zen.cmd executable wrapper');
        console.log('    You can now use: claude-zen instead of npx claude-zen');
      }
    } else {
      // Check if we're in development mode (claude-code-flow repo)
      const isDevelopment = workingDir.includes('claude-code-flow');
      const devBinPath = isDevelopment
        ? workingDir.split('claude-code-flow')[0] + 'claude-code-flow/bin/claude-zen'
        : '';

      // Create Unix/Linux/Mac shell script
      const wrapperScript = `#!/usr/bin/env bash
# Claude-Flow local wrapper
# This script ensures claude-zen runs from your project directory

# Save the current directory
PROJECT_DIR="\${PWD}"

# Set environment to ensure correct working directory
export PWD="\${PROJECT_DIR}"
export CLAUDE_WORKING_DIR="\${PROJECT_DIR}"

# Try to find claude-zen binary
# Check common locations for npm/npx installations

${
  isDevelopment
    ? `# Development mode - use local bin
if [ -f "${devBinPath}" ]; then
  cd "\${PROJECT_DIR}"
  exec "${devBinPath}" "$@"
fi

`
    : ''
}# 1. Local node_modules (npm install claude-zen)
if [ -f "\${PROJECT_DIR}/node_modules/.bin/claude-zen" ]; then
  cd "\${PROJECT_DIR}"
  exec "\${PROJECT_DIR}/node_modules/.bin/claude-zen" "$@"

# 2. Parent directory node_modules (monorepo setup)
elif [ -f "\${PROJECT_DIR}/../node_modules/.bin/claude-zen" ]; then
  cd "\${PROJECT_DIR}"
  exec "\${PROJECT_DIR}/../node_modules/.bin/claude-zen" "$@"

# 3. Global installation (npm install -g claude-zen)
elif command -v claude-zen &> /dev/null; then
  cd "\${PROJECT_DIR}"
  exec claude-zen "$@"

# 4. Fallback to npx (will download if needed)
else
  cd "\${PROJECT_DIR}"
  exec npx claude-zen@latest "$@"
fi
`;

      // Write the wrapper script
      if (!dryRun) {
        await writeFile(`${workingDir}/claude-zen`, wrapperScript, 'utf8');

        // Make it executable
        await chmod(`${workingDir}/claude-zen`, 0o755);

        console.log('  ✓ Created local claude-zen executable wrapper');
        console.log('    You can now use: ./claude-zen instead of npx claude-zen');
      }
    }
  } catch (err) {
    console.log(`  ⚠️  Could not create local executable: ${err.message}`);
  }
}
