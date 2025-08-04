/**
 * Simple validation script to verify all timeout mechanisms have been removed
 * from ruv-swarm-no-timeout.js while maintaining security and functionality
 */

const fs = require('node:fs');
const path = require('node:path');
const { exec } = require('node:child_process');
const { promisify } = require('node:util');

const execAsync = promisify(exec);

// File paths
const noTimeoutPath = path.join(__dirname, '..', 'bin', 'ruv-swarm-no-timeout.js');
const originalPath = path.join(__dirname, '..', 'bin', 'ruv-swarm-secure.js');

// Read file contents
const noTimeoutCode = fs.readFileSync(noTimeoutPath, 'utf8');
const originalCode = fs.readFileSync(originalPath, 'utf8');

const timeoutPatterns = [
  { name: 'setTimeout', pattern: /setTimeout\s*\(/g },
  { name: 'setInterval', pattern: /setInterval\s*\(/g },
  { name: 'clearTimeout', pattern: /clearTimeout\s*\(/g },
  { name: 'clearInterval', pattern: /clearInterval\s*\(/g },
  { name: 'heartbeat', pattern: /heartbeat/gi },
  { name: 'lastActivity', pattern: /lastActivity/g },
  { name: 'MCP_HEARTBEAT', pattern: /MCP_HEARTBEAT/g },
  { name: 'timeSinceLastActivity', pattern: /timeSinceLastActivity/g },
  { name: 'heartbeatChecker', pattern: /heartbeatChecker/g },
  { name: 'heartbeatCheckInterval', pattern: /heartbeatCheckInterval/g },
];

let removedCount = 0;
for (const { name, pattern } of timeoutPatterns) {
  const noTimeoutMatches = noTimeoutCode.match(pattern);
  const originalMatches = originalCode.match(pattern);

  if (noTimeoutMatches === null && originalMatches !== null) {
    removedCount++;
  } else if (noTimeoutMatches !== null) {
  } else {
  }
}

const securityPatterns = [
  { name: 'CommandSanitizer', pattern: /CommandSanitizer/g },
  { name: 'SecurityError', pattern: /SecurityError/g },
  { name: 'validateArgument', pattern: /validateArgument/g },
  { name: 'validateTopology', pattern: /validateTopology/g },
  { name: 'validateMaxAgents', pattern: /validateMaxAgents/g },
  { name: 'validateAgentType', pattern: /validateAgentType/g },
  { name: 'validateTaskDescription', pattern: /validateTaskDescription/g },
  { name: 'ValidationError', pattern: /ValidationError/g },
];

let preservedCount = 0;
for (const { name, pattern } of securityPatterns) {
  const noTimeoutMatches = noTimeoutCode.match(pattern);
  const originalMatches = originalCode.match(pattern);

  if (noTimeoutMatches !== null && originalMatches !== null) {
    preservedCount++;
  } else if (noTimeoutMatches === null) {
  } else {
  }
}

const corePatterns = [
  { name: 'mcpTools', pattern: /mcpTools/g },
  { name: 'EnhancedMCPTools', pattern: /EnhancedMCPTools/g },
  { name: 'daaMcpTools', pattern: /daaMcpTools/g },
  { name: 'agent_spawn', pattern: /agent_spawn/g },
  { name: 'task_orchestrate', pattern: /task_orchestrate/g },
  { name: 'swarm_init', pattern: /swarm_init/g },
  { name: 'RuvSwarm', pattern: /RuvSwarm/g },
  { name: 'initializeSystem', pattern: /initializeSystem/g },
];

let corePreservedCount = 0;
for (const { name, pattern } of corePatterns) {
  const noTimeoutMatches = noTimeoutCode.match(pattern);
  const originalMatches = originalCode.match(pattern);

  if (noTimeoutMatches !== null && originalMatches !== null) {
    corePreservedCount++;
  } else if (noTimeoutMatches === null) {
  } else {
  }
}

const versionPatterns = [
  { name: 'NO TIMEOUT VERSION', pattern: /NO TIMEOUT VERSION/g },
  { name: 'ruv-swarm-no-timeout', pattern: /ruv-swarm-no-timeout/g },
  { name: 'INFINITE RUNTIME', pattern: /INFINITE RUNTIME/g },
  { name: 'BULLETPROOF OPERATION', pattern: /BULLETPROOF OPERATION/g },
  {
    name: 'TIMEOUT MECHANISMS: COMPLETELY REMOVED',
    pattern: /TIMEOUT MECHANISMS: COMPLETELY REMOVED/g,
  },
];

let versionCount = 0;
for (const { name, pattern } of versionPatterns) {
  const matches = noTimeoutCode.match(pattern);

  if (matches !== null) {
    versionCount++;
  } else {
  }
}

async function testCommand(command, _description) {
  try {
    const { stdout, stderr } = await execAsync(`node ${noTimeoutPath} ${command}`);
    if (stderr && stderr.trim() !== '') {
      return false;
    }
    return true;
  } catch (_error) {
    return false;
  }
}

async function runFunctionalTests() {
  const tests = [
    { command: 'help', description: 'Help command' },
    { command: 'version', description: 'Version command' },
    { command: 'mcp status', description: 'MCP status' },
    { command: 'mcp tools', description: 'MCP tools list' },
    { command: 'mcp help', description: 'MCP help' },
  ];

  let passedTests = 0;
  for (const test of tests) {
    const passed = await testCommand(test.command, test.description);
    if (passed) passedTests++;
  }
  return passedTests === tests.length;
}

const qualityChecks = [
  { name: 'Proper shebang', test: () => noTimeoutCode.startsWith('#!/usr/bin/env node') },
  {
    name: 'ES modules syntax',
    test: () => /import.*from/.test(noTimeoutCode) && /export.*{/.test(noTimeoutCode),
  },
  {
    name: 'Error handling',
    test: () => /try.*catch/.test(noTimeoutCode) && /process\.exit/.test(noTimeoutCode),
  },
  {
    name: 'Async/await usage',
    test: () => /async.*function/.test(noTimeoutCode) && /await/.test(noTimeoutCode),
  },
  {
    name: 'Proper logging',
    test: () => /console\.log/.test(noTimeoutCode) && /logger\./.test(noTimeoutCode),
  },
];

let qualityScore = 0;
for (const { name, test } of qualityChecks) {
  const passed = test();
  if (passed) {
    qualityScore++;
  } else {
  }
}

const overallScore = {
  timeoutRemoval: removedCount / timeoutPatterns.length,
  securityPreservation: preservedCount / securityPatterns.length,
  corePreservation: corePreservedCount / corePatterns.length,
  versionIdentification: versionCount / versionPatterns.length,
  codeQuality: qualityScore / qualityChecks.length,
};

const averageScore =
  Object.values(overallScore).reduce((a, b) => a + b, 0) / Object.keys(overallScore).length;

if (averageScore >= 0.95) {
} else if (averageScore >= 0.85) {
} else if (averageScore >= 0.7) {
} else {
}
runFunctionalTests()
  .then((allPassed) => {
    if (allPassed && averageScore >= 0.95) {
    } else {
    }

    process.exit(allPassed && averageScore >= 0.95 ? 0 : 1);
  })
  .catch((error) => {
    console.error('\n❌ Functional tests failed:', error.message);
    process.exit(1);
  });
