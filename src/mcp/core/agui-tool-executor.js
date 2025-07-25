/**
 * 🚀 AG-UI Enhanced MCP Tool Executor
 * 
 * Extends the existing MCP tool executor with AG-UI protocol events
 * Provides real-time tool execution updates via standardized AG-UI events
 * 
 * @module AGUIMCPToolExecutor
 */

import { AGUIAdapter } from '../ai/agui-adapter.js';
import { MCPToolExecutor } from './tool-executor.js';

/**
 * AG-UI Enhanced Tool Executor
 * Wraps MCP tool execution with AG-UI event emission
 */
export class AGUIMCPToolExecutor extends MCPToolExecutor {
  constructor(server, options = {}) {
    super(server);
    
    // Create AG-UI adapter for tool execution events
    this.aguiAdapter = new AGUIAdapter({
      sessionId: `mcp-tools-${Date.now()}`,
      threadId: 'mcp-tool-execution'
    });
    
    this.options = {
      emitToolEvents: true,
      emitProgressEvents: true,
      includeArgs: true,
      includeResults: true,
      ...options
    };
    
    // Enhanced statistics
    this.aguiStats = {
      toolCallsWithEvents: 0,
      eventsEmitted: 0,
      lastToolCall: null
    };
  }

  /**
   * Execute tool with AG-UI event emission
   * @param {string} name - Tool name
   * @param {Object} args - Tool arguments
   * @param {Object} context - Additional context (parentMessageId, etc.)
   * @returns {Promise<any>} Tool execution result
   */
  async executeTool(name, args, context = {}) {
    const { parentMessageId } = context;
    let toolCallId = null;
    
    try {
      // Emit AG-UI tool call start event
      if (this.options.emitToolEvents) {
        toolCallId = this.aguiAdapter.startToolCall(name, null, parentMessageId);
        
        // Emit arguments if enabled
        if (this.options.includeArgs && args) {
          this.aguiAdapter.addToolCallArgs(JSON.stringify(args), toolCallId);
        }
        
        this.aguiStats.toolCallsWithEvents++;
      }
      
      // Emit progress event
      if (this.options.emitProgressEvents) {
        this.aguiAdapter.emitCustomEvent('tool_execution_started', {
          toolName: name,
          toolCallId,
          args: this.options.includeArgs ? args : null,
          timestamp: Date.now()
        });
      }
      
      // Execute the actual tool
      const result = await super.executeTool(name, args);
      
      // Emit AG-UI tool call completion events
      if (this.options.emitToolEvents && toolCallId) {
        this.aguiAdapter.endToolCall(toolCallId);
        
        // Emit result if enabled
        if (this.options.includeResults) {
          this.aguiAdapter.emitToolCallResult(result, toolCallId);
        }
      }
      
      // Emit progress completion event
      if (this.options.emitProgressEvents) {
        this.aguiAdapter.emitCustomEvent('tool_execution_completed', {
          toolName: name,
          toolCallId,
          result: this.options.includeResults ? result : null,
          success: true,
          timestamp: Date.now()
        });
      }
      
      this.aguiStats.lastToolCall = { name, success: true, timestamp: Date.now() };
      
      return result;
      
    } catch (error) {
      // Emit error events
      if (toolCallId) {
        this.aguiAdapter.endToolCall(toolCallId);
        this.aguiAdapter.emitToolCallResult(
          `Error: ${error.message}`, 
          toolCallId
        );
      }
      
      if (this.options.emitProgressEvents) {
        this.aguiAdapter.emitCustomEvent('tool_execution_failed', {
          toolName: name,
          toolCallId,
          error: error.message,
          success: false,
          timestamp: Date.now()
        });
      }
      
      this.aguiStats.lastToolCall = { name, success: false, error: error.message, timestamp: Date.now() };
      
      throw error;
    }
  }

  /**
   * Execute multiple tools in sequence with AG-UI events
   */
  async executeToolChain(toolChain, context = {}) {
    const chainId = `chain-${Date.now()}`;
    const results = [];
    
    this.aguiAdapter.emitCustomEvent('tool_chain_started', {
      chainId,
      tools: toolChain.map(t => t.name),
      timestamp: Date.now()
    });
    
    try {
      for (const [index, { name, args }] of toolChain.entries()) {
        this.aguiAdapter.emitCustomEvent('tool_chain_step', {
          chainId,
          step: index + 1,
          totalSteps: toolChain.length,
          toolName: name
        });
        
        const result = await this.executeTool(name, args, {
          ...context,
          chainId,
          stepIndex: index
        });
        
        results.push({ name, result });
      }
      
      this.aguiAdapter.emitCustomEvent('tool_chain_completed', {
        chainId,
        results: this.options.includeResults ? results : null,
        success: true,
        timestamp: Date.now()
      });
      
      return results;
      
    } catch (error) {
      this.aguiAdapter.emitCustomEvent('tool_chain_failed', {
        chainId,
        error: error.message,
        completedSteps: results.length,
        totalSteps: toolChain.length,
        timestamp: Date.now()
      });
      
      throw error;
    }
  }

  /**
   * Execute tool with streaming updates (for long-running tools)
   */
  async executeToolWithStreaming(name, args, context = {}) {
    const toolCallId = this.aguiAdapter.startToolCall(name, null, context.parentMessageId);
    
    try {
      // Create a progress callback for streaming updates
      const progressCallback = (progress) => {
        this.aguiAdapter.emitCustomEvent('tool_execution_progress', {
          toolCallId,
          toolName: name,
          progress,
          timestamp: Date.now()
        });
      };
      
      // Enhanced args with progress callback
      const enhancedArgs = {
        ...args,
        onProgress: progressCallback
      };
      
      const result = await this.executeTool(name, enhancedArgs, context);
      return result;
      
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get AG-UI adapter for external event emission
   */
  getAGUIAdapter() {
    return this.aguiAdapter;
  }

  /**
   * Get enhanced statistics including AG-UI metrics
   */
  getEnhancedStats() {
    return {
      ...this.getExecutionStats(),
      agui: {
        ...this.aguiStats,
        adapterStats: this.aguiAdapter.getStats()
      }
    };
  }

  /**
   * Connect to external AG-UI event bus
   */
  connectToAGUIBus(eventBus) {
    this.aguiAdapter.connectGlobalEmitter(eventBus);
    return this;
  }

  /**
   * Configure AG-UI event options
   */
  configureAGUIEvents(options) {
    this.options = { ...this.options, ...options };
    return this;
  }

  /**
   * Reset AG-UI adapter state
   */
  resetAGUIState() {
    this.aguiAdapter.reset();
    this.aguiStats = {
      toolCallsWithEvents: 0,
      eventsEmitted: 0,
      lastToolCall: null
    };
  }
}

/**
 * Factory function for creating AG-UI enhanced tool executor
 */
export function createAGUIMCPToolExecutor(server, options = {}) {
  return new AGUIMCPToolExecutor(server, options);
}

/**
 * Middleware to wrap existing tool executor with AG-UI capabilities
 */
export function enhanceToolExecutorWithAGUI(existingExecutor, options = {}) {
  const aguiAdapter = new AGUIAdapter({
    sessionId: `enhanced-${Date.now()}`,
    threadId: 'enhanced-tool-execution'
  });
  
  // Wrap the executeTool method
  const originalExecuteTool = existingExecutor.executeTool.bind(existingExecutor);
  
  existingExecutor.executeTool = async function(name, args, context = {}) {
    let toolCallId = null;
    
    try {
      // Start AG-UI tool call
      toolCallId = aguiAdapter.startToolCall(name, null, context.parentMessageId);
      
      if (options.includeArgs !== false && args) {
        aguiAdapter.addToolCallArgs(JSON.stringify(args), toolCallId);
      }
      
      // Execute original tool
      const result = await originalExecuteTool(name, args, context);
      
      // Complete AG-UI tool call
      aguiAdapter.endToolCall(toolCallId);
      
      if (options.includeResults !== false) {
        aguiAdapter.emitToolCallResult(result, toolCallId);
      }
      
      return result;
      
    } catch (error) {
      if (toolCallId) {
        aguiAdapter.endToolCall(toolCallId);
        aguiAdapter.emitToolCallResult(`Error: ${error.message}`, toolCallId);
      }
      throw error;
    }
  };
  
  // Add AG-UI helper methods
  existingExecutor.getAGUIAdapter = () => aguiAdapter;
  existingExecutor.connectToAGUIBus = (eventBus) => {
    aguiAdapter.connectGlobalEmitter(eventBus);
    return existingExecutor;
  };
  
  return existingExecutor;
}

export default AGUIMCPToolExecutor;