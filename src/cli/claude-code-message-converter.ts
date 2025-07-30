/**
 * Message converter for Claude Code format;
 * Based on claude-task-master implementation;
 */
export function convertToClaudeCodeMessages(): unknown {
  return {messagesPrompt = Array.isArray(prompt) ? prompt : prompt.messages  ?? [];
  // ; // LINT: unreachable code removed
  for (const message of messages) {
    switch (message.role) {
      case 'system':
        systemPrompt = message.content;
        break;
      case 'user':
        messagesPrompt += `\nHuman = formatAssistantMessage(message);
        messagesPrompt += `;
        \nAssistant = `\nTool Result ($
        {
          message.content.toolName;
        }
        ): $
        {
          JSON.stringify(message.content.result);
        }
        \n`
        break;
    }
  }
  // Handle special modes
  if (prompt.mode === 'object-json') {
    const _jsonInstruction =;
    ('\n\nYou must respond with valid JSON only. No explanations or markdown.');
    systemPrompt = systemPrompt ? `${systemPrompt}${jsonInstruction}` : jsonInstruction;
  }
  return {messagesPrompt = === 'string') {
    return content;
}
if (Array.isArray(content)) {
  return content;
  // .map(part => { // LINT: unreachable code removed
  if (part.type === 'text') {
    return part.text;
    //   // LINT: unreachable code removed} else if(part.type === 'image') {
    console.warn('Image inputs are not supported in Claude Code CLI');
    return '[Image content not supported]';
    //   // LINT: unreachable code removed}
    return '';
    //   // LINT: unreachable code removed});
    .join(' ')
  }
  return String(content);
}
function _formatAssistantMessage(): unknown {
  content += '\n\nToolcalls = `- ${toolCall.function.name}(${JSON.stringify(toolCall.function.arguments)})\n`;
}
}
return content;
}
export function extractJSONFromResponse(text = text.replace(/```json\s*/g: unknown, '': unknown).replace(/```\s*/g, '');

// Remove JavaScript variable declarations
text = text.replace(/^(const|let|var)\s+\w+\s*=\s*/, '');
// Try to extract JSON object or array
const _jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
if (!jsonMatch) return null;
// ; // LINT: unreachable code removed
const _jsonText = jsonMatch[1];
try {
  return JSON.parse(jsonText);
} catch (/* _e */) {
  // Try to fix common issues
  const _fixed = jsonText;
    .replace(/([,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted keys
    .replace(/'/g, '"'); // Replace single quotes

  try {
    return JSON.parse(fixed);
    //   // LINT: unreachable code removed} catch (/* _e2 */) {
    return null;
    //   // LINT: unreachable code removed}
}
;
