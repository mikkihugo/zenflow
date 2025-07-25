/**
 * Message converter for Claude Code format
 * Based on claude-task-master implementation
 */

export function convertToClaudeCodeMessages(prompt) {
  let systemPrompt = '';
  let messagesPrompt = '';
  
  if (typeof prompt === 'string') {
    return { messagesPrompt: prompt, systemPrompt: '' };
  }
  
  const messages = Array.isArray(prompt) ? prompt : prompt.messages || [];
  
  for (const message of messages) {
    switch (message.role) {
      case 'system':
        systemPrompt = message.content;
        break;
        
      case 'user':
        const userContent = extractTextContent(message.content);
        messagesPrompt += `\nHuman: ${userContent}\n`;
        break;
        
      case 'assistant':
        const assistantContent = formatAssistantMessage(message);
        messagesPrompt += `\nAssistant: ${assistantContent}\n`;
        break;
        
      case 'tool':
        messagesPrompt += `\nTool Result (${message.content.toolName}): ${JSON.stringify(message.content.result)}\n`;
        break;
    }
  }
  
  // Handle special modes
  if (prompt.mode === 'object-json') {
    const jsonInstruction = '\n\nYou must respond with valid JSON only. No explanations or markdown.';
    systemPrompt = systemPrompt ? `${systemPrompt}${jsonInstruction}` : jsonInstruction;
  }
  
  return {
    messagesPrompt: messagesPrompt.trim(),
    systemPrompt
  };
}

function extractTextContent(content) {
  if (typeof content === 'string') {
    return content;
  }
  
  if (Array.isArray(content)) {
    return content
      .map(part => {
        if (part.type === 'text') {
          return part.text;
        } else if (part.type === 'image') {
          console.warn('Image inputs are not supported in Claude Code CLI');
          return '[Image content not supported]';
        }
        return '';
      })
      .join(' ');
  }
  
  return String(content);
}

function formatAssistantMessage(message) {
  let content = message.content || '';
  
  if (message.tool_calls && message.tool_calls.length > 0) {
    content += '\n\nTool calls:\n';
    for (const toolCall of message.tool_calls) {
      content += `- ${toolCall.function.name}(${JSON.stringify(toolCall.function.arguments)})\n`;
    }
  }
  
  return content;
}

export function extractJSONFromResponse(text) {
  if (!text) return null;
  
  // Remove markdown code blocks
  text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  
  // Remove JavaScript variable declarations
  text = text.replace(/^(const|let|var)\s+\w+\s*=\s*/, '');
  
  // Try to extract JSON object or array
  const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (!jsonMatch) return null;
  
  const jsonText = jsonMatch[1];
  
  try {
    return JSON.parse(jsonText);
  } catch (e) {
    // Try to fix common issues
    const fixed = jsonText
      .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted keys
      .replace(/'/g, '"'); // Replace single quotes
      
    try {
      return JSON.parse(fixed);
    } catch (e2) {
      return null;
    }
  }
}