#!/usr/bin/env node

/**
 * Quick validation test for neural_train agentId parameter fix
 * Tests the exact issue described in #163
 */

// Import the actual MCP tools module
let mcpTools;
try {
  mcpTools = await import('../src/mcp-tools-enhanced.js');
} catch (error) {
  console.error('Failed to import MCP tools:', error.message);
  process.exit(1);
}

const tools = mcpTools.default || mcpTools;
try {
  await tools.neural_train({ iterations: 15 });
  process.exit(1);
} catch (error) {
  if (error.message.includes('agentId is required')) {
  } else {
    process.exit(1);
  }
}
try {
  await tools.neural_train({ agentId: null, iterations: 15 });
  process.exit(1);
} catch (error) {
  if (
    error.message.includes('agentId is required') &&
    error.message.includes('string')
  ) {
  } else {
    process.exit(1);
  }
}
try {
  await tools.neural_train({ agentId: 'test-agent-001', iterations: 1 });
} catch (error) {
  // We expect this to fail later in the process (agent not found), but not during validation
  if (error.message.includes('agentId is required')) {
    process.exit(1);
  } else {
  }
}
try {
  await tools.neural_train({ agentId: '', iterations: 1 });
  process.exit(1);
} catch (error) {
  if (error.message.includes('agentId is required')) {
  } else {
  }
}
