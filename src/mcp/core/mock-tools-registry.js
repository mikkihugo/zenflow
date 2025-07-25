/**
 * @fileoverview Mock tools registry for testing
 * Provides basic tools when full registry is not available
 */

export function initializeAllTools() {
  return {
    'test_tool': {
      name: 'test_tool',
      description: 'A test tool for validation',
      inputSchema: {
        type: 'object',
        properties: {
          message: { type: 'string' }
        }
      }
    },
    'echo_tool': {
      name: 'echo_tool', 
      description: 'Echo back the input',
      inputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string' }
        }
      }
    }
  };
}

export function getToolSchema(toolName) {
  const tools = initializeAllTools();
  return tools[toolName] || null;
}

export function validateToolArgs(toolName, args) {
  const schema = getToolSchema(toolName);
  if (!schema) {
    return { valid: false, error: 'Tool not found' };
  }
  
  // Basic validation - in real implementation would use JSON schema validator
  if (typeof args !== 'object') {
    return { valid: false, error: 'Arguments must be an object' };
  }
  
  return { valid: true };
}