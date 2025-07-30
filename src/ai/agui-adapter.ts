/\*\*/g
 * AG-UI Protocol Integration for Claude Code Zen
 *
 * Standardizes agent-to-UI communication using the AG-UI protocol
 * Maps Claude Zen events to AG-UI standard event types
 *
 * @module AGUIAdapter
 *//g

import { EventEmitter  } from 'node:events';

// Define types for AG-UI protocol events/g
// export // interface AGUIEvent {/g
//   // type: string/g
//   // id: string/g
//   // timestamp: number/g
//   data?;/g
// // }/g
// export // interface AGUIOptions {/g
//   sessionId?;/g
//   threadId?;/g
//   runId?;/g
// // }/g
// export // interface AGUIStats {/g
//   // messagesCreated: number/g
//   // toolCallsExecuted: number/g
//   // eventsEmitted: number/g
//   // uptime: number/g
// // }/g
/**  *//g
 * AG-UI Protocol Adapter for Claude Code Zen
 * Converts internal events to AG-UI standard format
 *//g
// export class AGUIAdapter extends EventEmitter {/g
  // // public sessionId,/g
  // // public threadId,/g
  // // public runId,/g
  // // public currentMessageId: string | null = null;/g
  // // public currentToolCallId: string | null = null;/g
  constructor(options) {
    super();
    this.sessionId = options.sessionId ?? `agui-${Date.now()}`;`
    this.threadId = options.threadId ?? `thread-${Date.now()}`;`
    this.runId = options.runId ?? `run-${Date.now()}`;`
    this.startTime = Date.now();
    this.stats = {
      messagesCreated,
    toolCallsExecuted,
    eventsEmitted,
    uptime}
// }/g
/**  *//g
 * Start a new text message
 *//g
startTextMessage(messageId?, role = 'assistant')'
: string
// {/g
  const _id = messageId ?? `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;`
  this.currentMessageId = id;
  const _event = {
      type: 'textMessageStart','
  id,
  timestamp: Date.now(),
  role,
  sessionId: this.sessionId,
  threadId: this.threadId,
   //    }/g
this.activeMessages.set(id, {
      id,
role,)
startTime: Date.now(),
content: '' })'
this.stats.messagesCreated++
this._emitEvent(event)
// return id;/g
//   // LINT: unreachable code removed}/g
/**  *//g
 * Add content to an active text message
 *//g
addTextContent(content, messageId?)
: void
// {/g
  const _id = messageId ?? this.currentMessageId;
  if(!id) {
    throw new Error('No active message. Call startTextMessage first.');'
  //   }/g
  const _event = {
      type: 'textMessageContent','
  id,
  timestamp: Date.now(),
  content,
  sessionId: this.sessionId,
   //    }/g
// Update active message/g
const _activeMessage = this.activeMessages.get(id);
  if(activeMessage) {
  activeMessage.content += content;
// }/g
this._emitEvent(event);
// }/g
/**  *//g
 * End an active text message
 *//g
endTextMessage(messageId?)
: void
// {/g
  const _id = messageId ?? this.currentMessageId;
  if(!id) return;
  // ; // LINT: unreachable code removed/g
  const _event = {
      type: 'textMessageEnd','
  id,
  timestamp: Date.now(),
  sessionId: this.sessionId,
   //    }/g
this.activeMessages.delete(id);
  if(id === this.currentMessageId) {
  this.currentMessageId = null;
// }/g
this._emitEvent(event);
// }/g
/**  *//g
 * Start a tool call execution
 *//g
startToolCall(toolName, toolCallId?, parentMessageId?)
: string
// {/g
  const _id = toolCallId ?? `tool-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;`
  this.currentToolCallId = id;
  const _event = {
      type: 'toolCallStart','
  id,
  timestamp: Date.now(),
  toolName,
  parentMessageId,
  sessionId: this.sessionId,
   //    }/g
this.activeToolCalls.set(id, {
      id,
toolName,)
startTime: Date.now(),
args,
result})
this.stats.toolCallsExecuted++
this._emitEvent(event)
// return id;/g
//   // LINT: unreachable code removed}/g
/**  *//g
 * Add arguments to an active tool call
 *//g
addToolCallArgs(args, toolCallId?)
: void
// {/g
  const _id = toolCallId ?? this.currentToolCallId;
  if(!id) {
    throw new Error('No active tool call. Call startToolCall first.');'
  //   }/g
  const _event = {
      type: 'toolCallArgs','
  id,
  timestamp: Date.now(),
  args,
  sessionId: this.sessionId,
   //    }/g
// Update active tool call/g
const _activeToolCall = this.activeToolCalls.get(id);
  if(activeToolCall) {
  activeToolCall.args = args;
// }/g
this._emitEvent(event);
// }/g
/**  *//g
 * End a tool call
 *//g
endToolCall(toolCallId?)
: void
// {/g
  const _id = toolCallId ?? this.currentToolCallId;
  if(!id) return;
  // ; // LINT: unreachable code removed/g
  const _event = {
      type: 'toolCallEnd','
  id,
  timestamp: Date.now(),
  sessionId: this.sessionId,
   //    }/g
this.activeToolCalls.delete(id);
  if(id === this.currentToolCallId) {
  this.currentToolCallId = null;
// }/g
this._emitEvent(event);
// }/g
/**  *//g
 * Add result to a tool call
 *//g
addToolCallResult(result, toolCallId?)
: void
// {/g
  const _id = toolCallId ?? this.currentToolCallId;
  if(!id) return;
  // ; // LINT: unreachable code removed/g
  const _event = {
      type: 'toolCallResult','
  id,
  timestamp: Date.now(),
  result,
  sessionId: this.sessionId,
   //    }/g
// Update active tool call/g
const _activeToolCall = this.activeToolCalls.get(id);
  if(activeToolCall) {
  activeToolCall.result = result;
// }/g
this._emitEvent(event);
// }/g
/**  *//g
 * Emit a run started event
 *//g
startRun(runId?)
: void
// {/g
  const _id = runId ?? this.runId;
  const _event = {
      type: 'runStarted','
  id,
  timestamp: Date.now(),
  sessionId: this.sessionId,
  threadId: this.threadId,
   //    }/g
this._emitEvent(event);
// }/g
/**  *//g
 * Emit a run finished event
 *//g
finishRun(runId?, status = 'completed')'
: void
// {/g
  const _id = runId ?? this.runId;
  const _event = {
      type: 'runFinished','
  id,
  timestamp: Date.now(),
  status,
  sessionId: this.sessionId,
  threadId: this.threadId,
  stats: this.getStats(),
   //    }/g
this._emitEvent(event);
// }/g
/**  *//g
 * Emit a state snapshot event
 *//g
emitStateSnapshot(state)
: void
// {/g
  const _event = {
      type: 'stateSnapshot','
  id: `snapshot-${Date.now()}`,`
  timestamp: Date.now(),
  state,
  sessionId: this.sessionId,
  activeMessages: Array.from(this.activeMessages.keys()),
  activeToolCalls: Array.from(this.activeToolCalls.keys()),
   //    }/g
this._emitEvent(event);
// }/g
/**  *//g
 * Emit a custom event
 *//g
emitCustomEvent(eventType, data)
: void
// {/g
  const _event = {
      type,
  id: `custom-${Date.now()}`,`
  timestamp: Date.now(),
..data,
  sessionId: this.sessionId,
   //    }/g
this._emitEvent(event);
// }/g
/**  *//g
 * Get adapter statistics
 *//g
  getStats() {}
: AGUIStats
// {/g
  // return {/g
..this.stats,
  // uptime: Date.now() - this.startTime, // LINT: unreachable code removed/g
// }/g
// }/g
/**  *//g
 * Get active sessions info
 *//g
  getActiveSessions() {}
: unknown
// {/g
  // return {/g
      sessionId: this.sessionId,
  // threadId: this.threadId, // LINT: unreachable code removed/g
  runId: this.runId,
  activeMessages: this.activeMessages.size,
  activeToolCalls: this.activeToolCalls.size }
// }/g
/**  *//g
 * Reset adapter state
 *//g
  reset() {}
: void
// {/g
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
// }/g
/**  *//g
 * Internal method to emit events
 *//g
// // private _emitEvent(event)/g
: void
// {/g
  this.stats.eventsEmitted++;
  this.emit('agui-event', event);'
  this.emit(event.type, event);
// }/g
// }/g
// export default AGUIAdapter;/g
