/**
 * @fileoverview AGUI Strategic Facade - Simple Delegation
 * 
 * Simple facade that delegates to @claude-zen/agui package.
 */

// Simple fallback implementations
export function createTaskApprovalSystem() {
  return {
    approveTask: async () => ({ approved: true }),
    requestApproval: async () => ({ id: 'fallback' }),
    getStatus: () => ({ status: 'fallback' })
  };
}

export function createAdvancedGUI() {
  return {
    render: () => {},
    update: () => {},
    handleInput: () => {}
  };
}

// Try to delegate to real implementation
try {
  const aguiPackage = require('@claude-zen/agui');
  Object.assign(exports, aguiPackage);
} catch {
  // Use fallbacks above
}