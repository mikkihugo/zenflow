/**
 * 🚀 AG-UI Protocol Integration for Claude Code Zen
 *
 * Standardizes agent-to-UI communication using the AG-UI protocol
 * Maps Claude Zen events to AG-UI standard event types
 *
 * @module AGUIAdapter
 */

import { EventEmitter } from 'node:events';

// Define types for AG-UI protocol events
export interface AGUIEvent {
  type: string;
  id: string;
  timestamp: number;
  data?: any;
}

export interface AGUIOptions {
  sessionId?: string;
  threadId?: string;
  runId?: string;
}

export interface AGUIStats {
  messagesCreated: number;
  toolCallsExecuted: number;
  eventsEmitted: number;
  uptime: number;
}

/**
 * AG-UI Protocol Adapter for Claude Code Zen
 * Converts internal events to AG-UI standard format
 */
export class AGUIAdapter extends EventEmitter {
  public sessionId: string;
  public threadId: string;
  public runId: string;
  public currentMessageId: string | null = null;
  public currentToolCallId: string | null = null;

  private activeMessages = new Map<string, any>();
  private activeToolCalls = new Map<string, any>();
  private stats: AGUIStats;
  private startTime: number;

  constructor(options: AGUIOptions = {}) {
    super();
    this.sessionId = options.sessionId || `agui-${Date.now()}`;
    this.threadId = options.threadId || `thread-${Date.now()}`;
    this.runId = options.runId || `run-${Date.now()}`;
    this.startTime = Date.now();

    this.stats = {
      messagesCreated: 0,
      toolCallsExecuted: 0,
      eventsEmitted: 0,
      uptime: 0,
    };
  }

  /**
   * Start a new text message
   */
  startTextMessage(messageId?: string, role: string = 'assistant'): string {
    const id = messageId || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    this.currentMessageId = id;

    const event: AGUIEvent = {
      type: 'textMessageStart',
      id,
      timestamp: Date.now(),
      data: {
        role,
        sessionId: this.sessionId,
        threadId: this.threadId,
      },
    };

    this.activeMessages.set(id, {
      id,
      role,
      startTime: Date.now(),
      content: '',
    });

    this.stats.messagesCreated++;
    this._emitEvent(event);
    return id;
  }

  /**
   * Add content to an active text message
   */
  addTextContent(content: string, messageId?: string): void {
    const id = messageId || this.currentMessageId;
    if (!id) {
      throw new Error('No active message. Call startTextMessage first.');
    }

    const event: AGUIEvent = {
      type: 'textMessageContent',
      id,
      timestamp: Date.now(),
      data: {
        content,
        sessionId: this.sessionId,
      },
    };

    // Update active message
    const activeMessage = this.activeMessages.get(id);
    if (activeMessage) {
      activeMessage.content += content;
    }

    this._emitEvent(event);
  }

  /**
   * End an active text message
   */
  endTextMessage(messageId?: string): void {
    const id = messageId || this.currentMessageId;
    if (!id) return;

    const event: AGUIEvent = {
      type: 'textMessageEnd',
      id,
      timestamp: Date.now(),
      data: {
        sessionId: this.sessionId,
      },
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
  startToolCall(toolName: string, toolCallId?: string, parentMessageId?: string): string {
    const id = toolCallId || `tool-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    this.currentToolCallId = id;

    const event: AGUIEvent = {
      type: 'toolCallStart',
      id,
      timestamp: Date.now(),
      data: {
        toolName,
        parentMessageId,
        sessionId: this.sessionId,
      },
    };

    this.activeToolCalls.set(id, {
      id,
      toolName,
      startTime: Date.now(),
      args: null,
      result: null,
    });

    this.stats.toolCallsExecuted++;
    this._emitEvent(event);
    return id;
  }

  /**
   * Add arguments to an active tool call
   */
  addToolCallArgs(args: any, toolCallId?: string): void {
    const id = toolCallId || this.currentToolCallId;
    if (!id) {
      throw new Error('No active tool call. Call startToolCall first.');
    }

    const event: AGUIEvent = {
      type: 'toolCallArgs',
      id,
      timestamp: Date.now(),
      data: {
        args,
        sessionId: this.sessionId,
      },
    };

    // Update active tool call
    const activeToolCall = this.activeToolCalls.get(id);
    if (activeToolCall) {
      activeToolCall.args = args;
    }

    this._emitEvent(event);
  }

  /**
   * End a tool call
   */
  endToolCall(toolCallId?: string): void {
    const id = toolCallId || this.currentToolCallId;
    if (!id) return;

    const event: AGUIEvent = {
      type: 'toolCallEnd',
      id,
      timestamp: Date.now(),
      data: {
        sessionId: this.sessionId,
      },
    };

    this.activeToolCalls.delete(id);
    if (id === this.currentToolCallId) {
      this.currentToolCallId = null;
    }

    this._emitEvent(event);
  }

  /**
   * Add result to a tool call
   */
  addToolCallResult(result: any, toolCallId?: string): void {
    const id = toolCallId || this.currentToolCallId;
    if (!id) return;

    const event: AGUIEvent = {
      type: 'toolCallResult',
      id,
      timestamp: Date.now(),
      data: {
        result,
        sessionId: this.sessionId,
      },
    };

    // Update active tool call
    const activeToolCall = this.activeToolCalls.get(id);
    if (activeToolCall) {
      activeToolCall.result = result;
    }

    this._emitEvent(event);
  }

  /**
   * Emit a run started event
   */
  startRun(runId?: string): void {
    const id = runId || this.runId;

    const event: AGUIEvent = {
      type: 'runStarted',
      id,
      timestamp: Date.now(),
      data: {
        sessionId: this.sessionId,
        threadId: this.threadId,
      },
    };

    this._emitEvent(event);
  }

  /**
   * Emit a run finished event
   */
  finishRun(runId?: string, status: string = 'completed'): void {
    const id = runId || this.runId;

    const event: AGUIEvent = {
      type: 'runFinished',
      id,
      timestamp: Date.now(),
      data: {
        status,
        sessionId: this.sessionId,
        threadId: this.threadId,
        stats: this.getStats(),
      },
    };

    this._emitEvent(event);
  }

  /**
   * Emit a state snapshot event
   */
  emitStateSnapshot(state: any): void {
    const event: AGUIEvent = {
      type: 'stateSnapshot',
      id: `snapshot-${Date.now()}`,
      timestamp: Date.now(),
      data: {
        state,
        sessionId: this.sessionId,
        activeMessages: Array.from(this.activeMessages.keys()),
        activeToolCalls: Array.from(this.activeToolCalls.keys()),
      },
    };

    this._emitEvent(event);
  }

  /**
   * Emit a custom event
   */
  emitCustomEvent(eventType: string, data: any): void {
    const event: AGUIEvent = {
      type: eventType,
      id: `custom-${Date.now()}`,
      timestamp: Date.now(),
      data: {
        ...data,
        sessionId: this.sessionId,
      },
    };

    this._emitEvent(event);
  }

  /**
   * Get adapter statistics
   */
  getStats(): AGUIStats {
    return {
      ...this.stats,
      uptime: Date.now() - this.startTime,
    };
  }

  /**
   * Get active sessions info
   */
  getActiveSessions(): any {
    return {
      sessionId: this.sessionId,
      threadId: this.threadId,
      runId: this.runId,
      activeMessages: this.activeMessages.size,
      activeToolCalls: this.activeToolCalls.size,
    };
  }

  /**
   * Reset adapter state
   */
  reset(): void {
    this.activeMessages.clear();
    this.activeToolCalls.clear();
    this.currentMessageId = null;
    this.currentToolCallId = null;
    this.stats = {
      messagesCreated: 0,
      toolCallsExecuted: 0,
      eventsEmitted: 0,
      uptime: 0,
    };
    this.startTime = Date.now();
  }

  /**
   * Internal method to emit events
   */
  private _emitEvent(event: AGUIEvent): void {
    this.stats.eventsEmitted++;
    this.emit('agui-event', event);
    this.emit(event.type, event);
  }
}

export default AGUIAdapter;
