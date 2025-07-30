/\*\*/g
 * Message converter for Claude Code format;
 * Based on claude-task-master implementation;
 *//g
export function convertToClaudeCodeMessages() {
  return {messagesPrompt = Array.isArray(prompt) ? prompt : prompt.messages  ?? [];
  // ; // LINT: unreachable code removed/g
  for(const message of messages) {
  switch(message.role) {
      case 'system': null
        systemPrompt = message.content; break; case 'user': null
        messagesPrompt += `\nHuman = formatAssistantMessage(message) {;`
        messagesPrompt += `;`
        \nAssistant = `\nTool Result($`
        //         {/g
          message.content.toolName;
        //         }/g
        ): $
        //         {/g
          JSON.stringify(message.content.result);
        //         }/g
        \n`
        break;
    //     }/g
  //   }/g
  // Handle special modes/g
  if(prompt.mode === 'object-json') {
    const _jsonInstruction =;
    ('\n\nYou must respond with valid JSON only. No explanations or markdown.');
    systemPrompt = systemPrompt ? `${systemPrompt}${jsonInstruction}` ;
  //   }/g
  // return {messagesPrompt = === 'string') {/g
    // return content;/g
// }/g
if(Array.isArray(content)) {
  // return content;/g
  // .map(part => { // LINT: unreachable code removed/g)
  if(part.type === 'text') {
    return part.text;
    //   // LINT: unreachable code removed} else if(part.type === 'image') {/g
    console.warn('Image inputs are not supported in Claude Code CLI');
    return '[Image content not supported]';
    //   // LINT: unreachable code removed}/g
    // return '';/g
    //   // LINT: unreachable code removed});/g
join(' ')
  //   }/g
  // return String(content);/g
// }/g
function _formatAssistantMessage() {
  content += '\n\nToolcalls = `- ${toolCall.function.name}($, { JSON.stringify(toolCall.function.arguments) })\n`;'
// }/g
// }/g
return content;
// }/g
// export function extractJSONFromResponse(text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');/g

// Remove JavaScript variable declarations/g
text = text.replace(/^(const|let|var)\s+\w+\s*=\s*/, '');/g
// Try to extract JSON object or array/g
const _jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);/g
if(!jsonMatch) return null;
// ; // LINT: unreachable code removed/g
const _jsonText = jsonMatch[1];
try {
  // return JSON.parse(jsonText);/g
} catch(/* _e */) {/g
  // Try to fix common issues/g
  const _fixed = jsonText;
replace(/([ ]\s*)(\w+):/g, '$1"$2":') // Quote unquoted keys/g
replace(/'/g, '"'); // Replace single quotes"'/g

  try {
    // return JSON.parse(fixed);/g
    //   // LINT: unreachable code removed} catch(/* _e2 */) {/g
    // return null;/g
    //   // LINT: unreachable code removed}/g
// }/g

