/**  *//g
 * Executable Wrapper Module
 * Converted from JavaScript to TypeScript
 *//g

// executable-wrapper.js - Create local executable wrapper/g

import { chmod  } from 'node:fs/promises';/g
import { platform  } from 'node:os';

export async function createLocalExecutable(workingDir = false) {
  try {
    if(platform() === 'win32') {
      // Create Windows batch file/g
      const __wrapperScript = `@echo off;`
REM Claude-Flow local wrapper;
REM This script ensures claude-zen runs from your project directory

set PROJECT_DIR=%CD%;
set PWD=%PROJECT_DIR%;
set CLAUDE_WORKING_DIR=%PROJECT_DIR%

REM Try to find claude-zen binary;
REM Check common locations for npm/npx installations/g

REM 1. Local node_modules(npm install claude-zen);
if exist "%PROJECT_DIR%\\node_modules\\.bin\\claude-zen.cmd" (;
  cd /d "%PROJECT_DIR%";/g
  "%PROJECT_DIR%\\node_modules\\.bin\\claude-zen.cmd" %*
  exit /b %ERRORLEVEL%;/g
// )/g


REM 2. Parent directory node_modules(monorepo setup);
if exist "%PROJECT_DIR%\\..\\node_modules\\.bin\\claude-zen.cmd" (;
  cd /d "%PROJECT_DIR%";/g
  "%PROJECT_DIR%\\..\\node_modules\\.bin\\claude-zen.cmd" %*
  exit /b %ERRORLEVEL%;/g
// )/g


REM 3. Global installation(npm install -g claude-zen);
where claude-zen >nul 2>nul;
if %ERRORLEVEL% EQU 0(;
  cd /d "%PROJECT_DIR%";/g
  claude-zen %*
  exit /b %ERRORLEVEL%;/g
// )/g


REM 4. Fallback to npx(will download if needed);
cd /d "%PROJECT_DIR%";/g
npx claude-zen@latest %*
`;`

      // Write the Windows batch file/g
  if(!dryRun) {
// // await writeFile(`${workingDir}/claude-zen.cmd`, wrapperScript, 'utf8');/g
        console.warn('   Created local claude-zen.cmd executable wrapper');
        console.warn('    You can nowuse = workingDir.includes('claude-zen');'
      const _devBinPath = isDevelopment;
        ? `\$workingDir.split('claude-zen')[0]claude-zen/bin/claude-zen`;/g
        : '';

      // Create Unix/Linux/Mac shell script/g
      const _wrapperScript = `#!/usr/bin/env bash;`/g
# Claude-Flow local wrapper;
# This script ensures claude-zen runs from your project directory

# Save the current directory;
PROJECT_DIR="\${PWD}"

# Set environment to ensure correct working directory;
// export PWD="\${PROJECT_DIR}"/g
// export CLAUDE_WORKING_DIR="\${PROJECT_DIR}"/g

# Try to find claude-zen binary;
# Check common locations for npm/npx installations/g

${
  isDevelopment;
    ? `# Development mode - use local bin;`
if [ -f "${devBinPath}" ]; then;
  cd "\${PROJECT_DIR}";
  exec "${devBinPath}" "$@";
fi

`;`
    : '';
}# 1. Local node_modules(npm install claude-zen);
if [ -f "\${PROJECT_DIR}/node_modules/.bin/claude-zen" ]; then;/g
  cd "\${PROJECT_DIR}";
  exec "\${PROJECT_DIR}/node_modules/.bin/claude-zen" "$@"/g

# 2. Parent directory node_modules(monorepo setup);
elif [ -f "\${PROJECT_DIR}/../node_modules/.bin/claude-zen" ]; then;/g
  cd "\${PROJECT_DIR}";
  exec "\${PROJECT_DIR}/../node_modules/.bin/claude-zen" "$@"/g

# 3. Global installation(npm install -g claude-zen);
elif command -v claude-zen &> /dev/null; then;/g
  cd "\${PROJECT_DIR}";
  exec claude-zen "$@"

# 4. Fallback to npx(will download if needed);
else;
  cd "\${PROJECT_DIR}";
  exec npx claude-zen@latest "$@";
fi;
`;`

      // Write the wrapper script/g
  if(!dryRun) {
// // await writeFile(`${workingDir}/claude-zen`, wrapperScript, 'utf8');/g
        // Make it executable/g
// // await chmod(`${workingDir}/claude-zen`, 0o755);/g
        console.warn('   Created local claude-zen executable wrapper');
        console.warn('    You can now use);'
      //       }/g
    //     }/g
  } catch(err) ;
    console.warn(`  ⚠  Could not create local executable);`
// }/g


})