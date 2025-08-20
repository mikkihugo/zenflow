/**
 * @fileoverview Intelligence Package - Simple Delegation
 * 
 * Strategic facade that simply delegates to AI/Neural/ML packages.
 * 
 * Note: neural-ml and dspy are NOT exposed here - they are internal 
 * dependencies of the brain package only. Brain decides when and how to use them.
 */

// Re-export from individual facade files
export * from './brain';
export * from './safety';
export * from './fact-system';
export * from './teamwork';
export * from './workflows';
// LLM routing moved to operations facade (better architectural fit)

// Additional compatibility exports for missing classes
export { ConversationOrchestratorImpl, teamworkSystem } from './teamwork';

// Add memory compatibility classes
export class InMemoryConversationMemory {
  private memory = new Map<string, any>();
  
  async store(key: string, value: any): Promise<void> {
    this.memory.set(key, value);
  }
  
  async retrieve(key: string): Promise<any> {
    return this.memory.get(key);
  }
  
  async clear(): Promise<void> {
    this.memory.clear();
  }
}

// Export compatibility classes needed by server
export type { ServiceCoordinator, McpClientMessageType, ConversationPattern } from './teamwork';
export { AgentType, ServiceCoordinatorImpl } from './teamwork';