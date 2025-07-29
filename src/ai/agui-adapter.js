/**
 * 🚀 AG-UI Protocol Integration for Claude Code Zen
 * 
 * Standardizes agent-to-UI communication using the AG-UI protocol
 * Maps Claude Zen events to AG-UI standard event types
 * 
 * @module AGUIAdapter
 */

import { EventEmitter } from 'events';
import pkg from '@ag-ui/core';
const { 
  EventType,
  TextMessageStartEvent,
  TextMessageContentEvent,
  TextMessageEndEvent,
  ToolCallStartEvent,
  ToolCallArgsEvent,
  ToolCallEndEvent,
  ToolCallResultEvent,
  StateSnapshotEvent,
  RunStartedEvent,
  RunFinishedEvent,
  CustomEvent
} = pkg;

/**
 * AG-UI Protocol Adapter for Claude Code Zen
 * Converts internal events to AG-UI standard format
 */
export class AGUIAdapter extends EventEmitter {
  constructor(options = {}) {
    super();
    this.sessionId = options.sessionId || `agui-${Date.now()}`;
    this.threadId = options.threadId || `thread-${Date.now()}`;
    this.runId = options.runId || `run-${Date.now()}`;
    this.currentMessageId = null;
    this.currentToolCallId = null;
    
    // Track active conversations and tool calls
    this.activeMessages = new Map();
    this.activeToolCalls = new Map();
    
    this.stats = {
      messagesCreated: 0,
      toolCallsExecuted: 0,
      eventsEmitted: 0
    };
  }

  /**
   * Start a new text message from an assistant/agent
   */
  startTextMessage(messageId = null, role = 'assistant') {
    const id = messageId || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    this.currentMessageId = id;
    
    const event = {
      type: EventType.TEXT_MESSAGE_START,
      messageId: id,
      role,
      timestamp: Date.now()
    };
    
    this.activeMessages.set(id, { started: Date.now(), content: '' });
    this.stats.messagesCreated++;
    
    this._emitEvent(event);
    return id;
  }

  /**
   * Add content to an ongoing text message
   */
  addTextContent(content, messageId = null) {
    const id = messageId || this.currentMessageId;
    if (!id) {
      throw new Error('No active message. Call startTextMessage first.');
    }

    const event = {
      type: EventType.TEXT_MESSAGE_CONTENT,
      messageId: id,
      delta: content,
      timestamp: Date.now()
    };

    if (this.activeMessages.has(id)) {
      this.activeMessages.get(id).content += content;
    }

    this._emitEvent(event);
  }

  /**
   * End an active text message
   */
  endTextMessage(messageId = null) {
    const id = messageId || this.currentMessageId;
    if (!id) return;

    const event = {
      type: EventType.TEXT_MESSAGE_END,
      messageId: id,
      timestamp: Date.now()
    };

    this.activeMessages.delete(id);
    if (id === this.currentMessageId) {
      this.currentMessageId = null;
    }

    this._emitEvent(event);
  }

  /**
   * Start a tool call execution
   */
  startToolCall(toolName, toolCallId = null, parentMessageId = null) {
    const id = toolCallId || `tool-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    this.currentToolCallId = id;

    const event = {
      type: EventType.TOOL_CALL_START,
      toolCallId: id,
      toolCallName: toolName,
      parentMessageId,
      timestamp: Date.now()
    };

    this.activeToolCalls.set(id, { 
      name: toolName, 
      started: Date.now(), 
      args: '',
      parentMessageId 
    });
    this.stats.toolCallsExecuted++;

    this._emitEvent(event);
    return id;
  }

  /**
   * Add arguments to a tool call (streaming)
   */
  addToolCallArgs(args, toolCallId = null) {
    const id = toolCallId || this.currentToolCallId;
    if (!id) {
      throw new Error('No active tool call. Call startToolCall first.');
    }

    const event = {
      type: EventType.TOOL_CALL_ARGS,
      toolCallId: id,
      delta: args,
      timestamp: Date.now()
    };

    if (this.activeToolCalls.has(id)) {
      this.activeToolCalls.get(id).args += args;
    }

    this._emitEvent(event);
  }

  /**
   * End a tool call
   */
  endToolCall(toolCallId = null) {
    const id = toolCallId || this.currentToolCallId;
    if (!id) return;

    const event = {
      type: EventType.TOOL_CALL_END,
      toolCallId: id,
      timestamp: Date.now()
    };

    if (id === this.currentToolCallId) {
      this.currentToolCallId = null;
    }

    this._emitEvent(event);
  }

  /**
   * Emit tool call result
   */
  emitToolCallResult(result, toolCallId, messageId = null) {
    const resultMessageId = messageId || `result-${toolCallId}`;
    
    const event = {
      type: EventType.TOOL_CALL_RESULT,
      messageId: resultMessageId,
      toolCallId,
      content: typeof result === 'string' ? result : JSON.stringify(result),
      role: 'tool',
      timestamp: Date.now()
    };

    this.activeToolCalls.delete(toolCallId);
    this._emitEvent(event);
  }

  /**
   * Emit state snapshot (for hive mind/swarm state)
   */
  emitStateSnapshot(state) {
    const event = {
      type: EventType.STATE_SNAPSHOT,
      snapshot: state,
      timestamp: Date.now()
    };

    this._emitEvent(event);
  }

  /**
   * Start a run (for swarm execution)
   */
  startRun(runId = null, threadId = null) {
    const rId = runId || this.runId;
    const tId = threadId || this.threadId;

    const event = {
      type: EventType.RUN_STARTED,
      threadId: tId,
      runId: rId,
      timestamp: Date.now()
    };

    this._emitEvent(event);
    return { runId: rId, threadId: tId };
  }

  /**
   * Finish a run
   */
  finishRun(result = null, runId = null, threadId = null) {
    const event = {
      type: EventType.RUN_FINISHED,
      threadId: threadId || this.threadId,
      runId: runId || this.runId,
      result,
      timestamp: Date.now()
    };

    this._emitEvent(event);
  }

  /**
   * Emit custom events for Claude Zen specific functionality
   */
  emitCustomEvent(name, value) {
    const event = {
      type: EventType.CUSTOM,
      name,
      value,
      timestamp: Date.now()
    };

    this._emitEvent(event);
  }

  /**
   * Convenience method for Queen coordination events
   */
  emitQueenEvent(queenId, action, data) {
    this.emitCustomEvent('queen_action', {
      queenId,
      action,
      data,
      sessionId: this.sessionId
    });
  }

  /**
   * Convenience method for swarm coordination events
   */
  emitSwarmEvent(swarmId, action, agents, data) {
    this.emitCustomEvent('swarm_action', {
      swarmId,
      action,
      agents,
      data,
      sessionId: this.sessionId
    });
  }

  /**
   * Convenience method for hive mind events
   */
  emitHiveMindEvent(action, data) {
    this.emitCustomEvent('hive_mind', {
      action,
      data,
      sessionId: this.sessionId,
      timestamp: Date.now()
    });
  }

  /**
   * Get adapter statistics
   */
  getStats() {
    return {
      ...this.stats,
      activeMessages: this.activeMessages.size,
      activeToolCalls: this.activeToolCalls.size,
      sessionId: this.sessionId
    };
  }

  /**
   * Reset adapter state
   */
  reset() {
    this.activeMessages.clear();
    this.activeToolCalls.clear();
    this.currentMessageId = null;
    this.currentToolCallId = null;
    this.stats = {
      messagesCreated: 0,
      toolCallsExecuted: 0,
      eventsEmitted: 0
    };
  }

  /**
   * Internal event emission with validation
   */
  _emitEvent(event) {
    try {
      // Add session context
      event.sessionId = this.sessionId;
      
      // Emit to local listeners
      this.emit('agui:event', event);
      this.emit(`agui:${event.type}`, event);
      
      // Emit to global event bus if available
      if (this.globalEmitter) {
        this.globalEmitter.emit('agui:event', event);
      }
      
      this.stats.eventsEmitted++;
    } catch (error) {
      this.emit('error', new Error(`Failed to emit AG-UI event: ${error.message}`));
    }
  }

  /**
   * Connect to global event emitter (for server-wide events)
   */
  connectGlobalEmitter(emitter) {
    this.globalEmitter = emitter;
    return this;
  }
}

/**
 * Factory function for creating AG-UI adapters
 */
export function createAGUIAdapter(options = {}) {
  return new AGUIAdapter(options);
}

/**
 * Helper to create a message flow (start -> content -> end)
 */
export function createMessageFlow(adapter, content, role = 'assistant') {
  const messageId = adapter.startTextMessage(null, role);
  adapter.addTextContent(content, messageId);
  adapter.endTextMessage(messageId);
  return messageId;
}

/**
 * Helper to create a tool call flow
 */
export function createToolCallFlow(adapter, toolName, args, result, parentMessageId = null) {
  const toolCallId = adapter.startToolCall(toolName, null, parentMessageId);
  adapter.addToolCallArgs(JSON.stringify(args), toolCallId);
  adapter.endToolCall(toolCallId);
  adapter.emitToolCallResult(result, toolCallId);
  return toolCallId;
}

export default AGUIAdapter;