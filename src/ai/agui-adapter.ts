/**
 * 🚀 AG-UI Protocol Integration for Claude Code Zen;
 *;
 * Standardizes agent-to-UI communication using the AG-UI protocol;
 * Maps Claude Zen events to AG-UI standard event types;
 *;
 * @module AGUIAdapter;
 */

import { EventEmitter } from 'node:events';

// Define types for AG-UI protocol events
export interface AGUIEvent {
  // type: string
  // id: string
  // timestamp: number
  data?: unknown;
// }
export interface AGUIOptions {
  sessionId?: string;
  threadId?: string;
  runId?: string;
// }
export interface AGUIStats {
  // messagesCreated: number
  // toolCallsExecuted: number
  // eventsEmitted: number
  // uptime: number
// }
/**
 * AG-UI Protocol Adapter for Claude Code Zen;
 * Converts internal events to AG-UI standard format;
 */
export class AGUIAdapter extends EventEmitter {
  public sessionId: string,
  public threadId: string,
  public runId: string,
  public currentMessageId: string | null = null;
  public currentToolCallId: string | null = null;
  constructor(options) {
    super();
    this.sessionId = options.sessionId ?? `agui-${Date.now()}`;
    this.threadId = options.threadId ?? `thread-${Date.now()}`;
    this.runId = options.runId ?? `run-${Date.now()}`;
    this.startTime = Date.now();
    this.stats = {
      messagesCreated,
    toolCallsExecuted,
    eventsEmitted,
    uptime}
// }
/**
 * Start a new text message;
 */
startTextMessage(messageId?, role: string = 'assistant')
: string
// {
  const _id = messageId ?? `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  this.currentMessageId = id;
  const _event = {
      type: 'textMessageStart',
  id,
  timestamp: Date.now(),
  role,
  sessionId: this.sessionId,
  threadId: this.threadId,
   //    }
this.activeMessages.set(id, {
      id,
role,
startTime: Date.now(),
content: '' })
this.stats.messagesCreated++
this._emitEvent(event)
return id;
//   // LINT: unreachable code removed}
/**
 * Add content to an active text message;
 */
addTextContent(content, messageId?: string)
: void
// {
  const _id = messageId ?? this.currentMessageId;
  if (!id) {
    throw new Error('No active message. Call startTextMessage first.');
  //   }
  const _event = {
      type: 'textMessageContent',
  id,
  timestamp: Date.now(),
  content,
  sessionId: this.sessionId,
   //    }
// Update active message
const _activeMessage = this.activeMessages.get(id);
if (activeMessage) {
  activeMessage.content += content;
// }
this._emitEvent(event);
// }
/**
 * End an active text message;
 */
endTextMessage(messageId?)
: void
// {
  const _id = messageId ?? this.currentMessageId;
  if (!id) return;
  // ; // LINT: unreachable code removed
  const _event = {
      type: 'textMessageEnd',
  id,
  timestamp: Date.now(),
  sessionId: this.sessionId,
   //    }
this.activeMessages.delete(id);
if (id === this.currentMessageId) {
  this.currentMessageId = null;
// }
this._emitEvent(event);
// }
/**
 * Start a tool call execution;
 */
startToolCall(toolName, toolCallId?, parentMessageId?: string)
: string
// {
  const _id = toolCallId ?? `tool-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  this.currentToolCallId = id;
  const _event = {
      type: 'toolCallStart',
  id,
  timestamp: Date.now(),
  toolName,
  parentMessageId,
  sessionId: this.sessionId,
   //    }
this.activeToolCalls.set(id, {
      id,
toolName,
startTime: Date.now(),
args,
result})
this.stats.toolCallsExecuted++
this._emitEvent(event)
return id;
//   // LINT: unreachable code removed}
/**
 * Add arguments to an active tool call;
 */
addToolCallArgs(args, toolCallId?: string)
: void
// {
  const _id = toolCallId ?? this.currentToolCallId;
  if (!id) {
    throw new Error('No active tool call. Call startToolCall first.');
  //   }
  const _event = {
      type: 'toolCallArgs',
  id,
  timestamp: Date.now(),
  args,
  sessionId: this.sessionId,
   //    }
// Update active tool call
const _activeToolCall = this.activeToolCalls.get(id);
if (activeToolCall) {
  activeToolCall.args = args;
// }
this._emitEvent(event);
// }
/**
 * End a tool call;
 */
endToolCall(toolCallId?)
: void
// {
  const _id = toolCallId ?? this.currentToolCallId;
  if (!id) return;
  // ; // LINT: unreachable code removed
  const _event = {
      type: 'toolCallEnd',
  id,
  timestamp: Date.now(),
  sessionId: this.sessionId,
   //    }
this.activeToolCalls.delete(id);
if (id === this.currentToolCallId) {
  this.currentToolCallId = null;
// }
this._emitEvent(event);
// }
/**
 * Add result to a tool call;
 */
addToolCallResult(result, toolCallId?: string)
: void
// {
  const _id = toolCallId ?? this.currentToolCallId;
  if (!id) return;
  // ; // LINT: unreachable code removed
  const _event = {
      type: 'toolCallResult',
  id,
  timestamp: Date.now(),
  result,
  sessionId: this.sessionId,
   //    }
// Update active tool call
const _activeToolCall = this.activeToolCalls.get(id);
if (activeToolCall) {
  activeToolCall.result = result;
// }
this._emitEvent(event);
// }
/**
 * Emit a run started event;
 */
startRun(runId?)
: void
// {
  const _id = runId ?? this.runId;
  const _event = {
      type: 'runStarted',
  id,
  timestamp: Date.now(),
  sessionId: this.sessionId,
  threadId: this.threadId,
   //    }
this._emitEvent(event);
// }
/**
 * Emit a run finished event;
 */
finishRun(runId?, status: string = 'completed')
: void
// {
  const _id = runId ?? this.runId;
  const _event = {
      type: 'runFinished',
  id,
  timestamp: Date.now(),
  status,
  sessionId: this.sessionId,
  threadId: this.threadId,
  stats: this.getStats(),
   //    }
this._emitEvent(event);
// }
/**
 * Emit a state snapshot event;
 */
emitStateSnapshot(state)
: void
// {
  const _event = {
      type: 'stateSnapshot',
  id: `snapshot-${Date.now()}`,
  timestamp: Date.now(),
  state,
  sessionId: this.sessionId,
  activeMessages: Array.from(this.activeMessages.keys()),
  activeToolCalls: Array.from(this.activeToolCalls.keys()),
   //    }
this._emitEvent(event);
// }
/**
 * Emit a custom event;
 */
emitCustomEvent(eventType, data: unknown)
: void
// {
  const _event = {
      type,
  id: `custom-${Date.now()}`,
  timestamp: Date.now(),
..data,
  sessionId: this.sessionId,
   //    }
this._emitEvent(event);
// }
/**
 * Get adapter statistics;
 */
getStats()
: AGUIStats
// {
  return {
..this.stats,
  // uptime: Date.now() - this.startTime, // LINT: unreachable code removed
// }
// }
/**
 * Get active sessions info;
 */
getActiveSessions()
: unknown
// {
  return {
      sessionId: this.sessionId,
  // threadId: this.threadId, // LINT: unreachable code removed
  runId: this.runId,
  activeMessages: this.activeMessages.size,
  activeToolCalls: this.activeToolCalls.size }
// }
/**
 * Reset adapter state;
 */
reset()
: void
// {
  this.activeMessages.clear();
  this.activeToolCalls.clear();
  this.currentMessageId = null;
  this.currentToolCallId = null;
  this.stats = {
      messagesCreated,
  toolCallsExecuted,
  eventsEmitted,
  uptime}
this.startTime = Date.now();
// }
/**
 * Internal method to emit events;
 */
private
_emitEvent(event)
: void
// {
  this.stats.eventsEmitted++;
  this.emit('agui-event', event);
  this.emit(event.type, event);
// }
// }
export default AGUIAdapter;
