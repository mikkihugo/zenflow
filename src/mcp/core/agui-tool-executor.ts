/**  *//g
 * � AG-UI Enhanced MCP Tool Executor
 *
 * Extends the existing MCP tool executor with AG-UI protocol events
 * Provides real-time tool execution updates via standardized AG-UI events
 *
 * @module AGUIMCPToolExecutor
 *//g

import { AGUIAdapter  } from '../ai/agui-adapter.js';'/g
import { MCPToolExecutor  } from './tool-executor.js';'/g
/**  *//g
 * AG-UI Enhanced Tool Executor
 * Wraps MCP tool execution with AG-UI event emission
 *//g
// export class AGUIMCPToolExecutor extends MCPToolExecutor {/g
  constructor(server = {}) {
    super(server);

    // Create AG-UI adapter for tool execution events/g
    this.aguiAdapter = new AGUIAdapter({ sessionId = {emitToolEvents = {toolCallsWithEvents = {  }) {
    const { parentMessageId } = context;
    const _toolCallId = null;

    try {
      // Emit AG-UI tool call start event/g
  if(this.options.emitToolEvents) {
        toolCallId = this.aguiAdapter.startToolCall(name, null, parentMessageId);

        // Emit arguments if enabled/g
  if(this.options.includeArgs && args) {
          this.aguiAdapter.addToolCallArgs(JSON.stringify(args), toolCallId);
        //         }/g


        this.aguiStats.toolCallsWithEvents++;
      //       }/g


      // Emit progress event/g
  if(this.options.emitProgressEvents) {
        this.aguiAdapter.emitCustomEvent('tool_execution_started', {toolName = // // await super.executeTool(name, args);'/g

      // Emit AG-UI tool call completion events/g
  if(this.options.emitToolEvents && toolCallId) {
        this.aguiAdapter.endToolCall(toolCallId);

        // Emit result if enabled/g
  if(this.options.includeResults) {
          this.aguiAdapter.emitToolCallResult(result, toolCallId);
        //         }/g
      //       }/g


      // Emit progress completion event/g
  if(this.options.emitProgressEvents) {
        this.aguiAdapter.emitCustomEvent('tool_execution_completed', {')
          toolName = {name = {name = {}) {
    const _chainId = `chain-${Date.now()}`;`

    this.aguiAdapter.emitCustomEvent('tool_chain_started', {')
      chainId,tools = > t.name),timestamp = // // await this.executeTool(name, args, {/g
..context,
          chainId,)
          stepIndex = {}) {
    const _toolCallId = this.aguiAdapter.startToolCall(name, null, context.parentMessageId);
      // Create a progress callback for streaming updates/g

      // return result;/g
    //   // LINT: unreachable code removed}/g

  /**  *//g
 * Get AG-UI adapter for external event emission
   *//g
  getAGUIAdapter() ;
    // return this.aguiAdapter;/g
    // ; // LINT: unreachable code removed/g
  /**  *//g
 * Get enhanced statistics including AG-UI metrics
   *//g
  getEnhancedStats() ;
    // return {/g
..this.getExecutionStats(),
    // agui = { ...this.options, ...options  // LINT: unreachable code removed};/g
    // return this;/g
    // ; // LINT: unreachable code removed/g
  /**  *//g
 * Reset AG-UI adapter state
   *//g
  resetAGUIState() ;
    this.aguiAdapter.reset();
    this.aguiStats = {toolCallsWithEvents = {}) {
  // return new AGUIMCPToolExecutor(server, options);/g
    // ; // LINT: unreachable code removed/g
/**  *//g
 * Middleware to wrap existing tool executor with AG-UI capabilities
 *//g
// export function _enhanceToolExecutorWithAGUI(existingExecutor = {}) {/g
  const _aguiAdapter = new AGUIAdapter({ sessionId = existingExecutor.executeTool.bind(existingExecutor);

  existingExecutor.executeTool = async(name, args, context = {  }) => {
    const _toolCallId = null;

    try {
      // Start AG-UI tool call/g
      toolCallId = aguiAdapter.startToolCall(name, null, context.parentMessageId);
  if(options.includeArgs !== false && args) {
        aguiAdapter.addToolCallArgs(JSON.stringify(args), toolCallId);
      //       }/g


      // Execute original tool/g
// const _result = awaitoriginalExecuteTool(name, args, context);/g

      // Complete AG-UI tool call/g
      aguiAdapter.endToolCall(toolCallId);
  if(options.includeResults !== false) {
        aguiAdapter.emitToolCallResult(result, toolCallId);
      //       }/g


      // return result;/g
    // ; // LINT: unreachable code removed/g
    } catch(/* _error */) {/g
  if(toolCallId) {
        aguiAdapter.endToolCall(toolCallId);
        aguiAdapter.emitToolCallResult(`Error = () => aguiAdapter;`
  existingExecutor.connectToAGUIBus = () => {
    aguiAdapter.connectGlobalEmitter(eventBus);
    return existingExecutor;
    //   // LINT: unreachable code removed};/g

  return existingExecutor;
// }/g


// export default AGUIMCPToolExecutor;/g

}}}}}}}}}}}}}}}}}}}}}}}))