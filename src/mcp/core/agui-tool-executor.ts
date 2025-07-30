/**  */
 * � AG-UI Enhanced MCP Tool Executor
 *
 * Extends the existing MCP tool executor with AG-UI protocol events
 * Provides real-time tool execution updates via standardized AG-UI events
 *
 * @module AGUIMCPToolExecutor
 */

import { AGUIAdapter  } from '../ai/agui-adapter.js';'
import { MCPToolExecutor  } from './tool-executor.js';'
/**  */
 * AG-UI Enhanced Tool Executor
 * Wraps MCP tool execution with AG-UI event emission
 */
// export class AGUIMCPToolExecutor extends MCPToolExecutor {
  constructor(server = {}) {
    super(server);

    // Create AG-UI adapter for tool execution events
    this.aguiAdapter = new AGUIAdapter({ sessionId = {emitToolEvents = {toolCallsWithEvents = { }) {
    const { parentMessageId } = context;
    const _toolCallId = null;

    try {
      // Emit AG-UI tool call start event
      if(this.options.emitToolEvents) {
        toolCallId = this.aguiAdapter.startToolCall(name, null, parentMessageId);

        // Emit arguments if enabled
        if(this.options.includeArgs && args) {
          this.aguiAdapter.addToolCallArgs(JSON.stringify(args), toolCallId);
        //         }


        this.aguiStats.toolCallsWithEvents++;
      //       }


      // Emit progress event
      if(this.options.emitProgressEvents) {
        this.aguiAdapter.emitCustomEvent('tool_execution_started', {toolName = // // await super.executeTool(name, args);'

      // Emit AG-UI tool call completion events
      if(this.options.emitToolEvents && toolCallId) {
        this.aguiAdapter.endToolCall(toolCallId);

        // Emit result if enabled
        if(this.options.includeResults) {
          this.aguiAdapter.emitToolCallResult(result, toolCallId);
        //         }
      //       }


      // Emit progress completion event
      if(this.options.emitProgressEvents) {
        this.aguiAdapter.emitCustomEvent('tool_execution_completed', {'
          toolName = {name = {name = {}) {
    const _chainId = `chain-${Date.now()}`;`

    this.aguiAdapter.emitCustomEvent('tool_chain_started', {'
      chainId,tools = > t.name),timestamp = // // await this.executeTool(name, args, {
..context,
          chainId,
          stepIndex = {}) {
    const _toolCallId = this.aguiAdapter.startToolCall(name, null, context.parentMessageId);
      // Create a progress callback for streaming updates

      // return result;
    //   // LINT: unreachable code removed}

  /**  */
 * Get AG-UI adapter for external event emission
   */
  getAGUIAdapter() ;
    // return this.aguiAdapter;
    // ; // LINT: unreachable code removed
  /**  */
 * Get enhanced statistics including AG-UI metrics
   */
  getEnhancedStats() ;
    // return {
..this.getExecutionStats(),
    // agui = { ...this.options, ...options  // LINT: unreachable code removed};
    // return this;
    // ; // LINT: unreachable code removed
  /**  */
 * Reset AG-UI adapter state
   */
  resetAGUIState() ;
    this.aguiAdapter.reset();
    this.aguiStats = {toolCallsWithEvents = {}) {
  // return new AGUIMCPToolExecutor(server, options);
    // ; // LINT: unreachable code removed
/**  */
 * Middleware to wrap existing tool executor with AG-UI capabilities
 */
// export function _enhanceToolExecutorWithAGUI(existingExecutor = {}) {
  const _aguiAdapter = new AGUIAdapter({ sessionId = existingExecutor.executeTool.bind(existingExecutor);

  existingExecutor.executeTool = async(name, args, context = { }) => {
    const _toolCallId = null;

    try {
      // Start AG-UI tool call
      toolCallId = aguiAdapter.startToolCall(name, null, context.parentMessageId);

      if(options.includeArgs !== false && args) {
        aguiAdapter.addToolCallArgs(JSON.stringify(args), toolCallId);
      //       }


      // Execute original tool
// const _result = awaitoriginalExecuteTool(name, args, context);

      // Complete AG-UI tool call
      aguiAdapter.endToolCall(toolCallId);

      if(options.includeResults !== false) {
        aguiAdapter.emitToolCallResult(result, toolCallId);
      //       }


      // return result;
    // ; // LINT: unreachable code removed
    } catch(/* _error */) {
      if(toolCallId) {
        aguiAdapter.endToolCall(toolCallId);
        aguiAdapter.emitToolCallResult(`Error = () => aguiAdapter;`
  existingExecutor.connectToAGUIBus = () => {
    aguiAdapter.connectGlobalEmitter(eventBus);
    return existingExecutor;
    //   // LINT: unreachable code removed};

  return existingExecutor;
// }


// export default AGUIMCPToolExecutor;

}}}}}}}}}}}}}}}}}}}}}}}))