/**
 * Claude Code Message Filter
 * 
 * Based on Cline's message-filter.ts implementation
 * Filters out image blocks since Claude Code doesn't support them
 */

import type { Anthropic } from "@anthropic-ai/sdk";

export function filterMessagesForClaudeCode(
    messages: Anthropic.Messages.MessageParam[]
): Anthropic.Messages.MessageParam[] {
    return messages.map(message => {
        if (typeof message.content === "string") {
            return message;
        }

        const filteredContent: Anthropic.Messages.MessageParam["content"] = [];

        if (Array.isArray(message.content)) {
            for (const content of message.content) {
                switch (content.type) {
                    case "text":
                        filteredContent.push(content);
                        break;
                    case "image":
                        // Replace image blocks with text placeholders
                        const placeholder = `[Image (${content.source?.type || 'unknown'}): ${content.source?.media_type || 'unknown media type'} not supported by Claude Code]`;
                        filteredContent.push({
                            type: "text",
                            text: placeholder
                        });
                        break;
                    case "tool_use":
                        // Keep tool use blocks as they might be supported
                        filteredContent.push(content);
                        break;
                    case "tool_result":
                        // Keep tool result blocks
                        filteredContent.push(content);
                        break;
                    default:
                        // For any other content types, convert to text
                        filteredContent.push({
                            type: "text",
                            text: `[Unsupported content type: ${(content as any).type}]`
                        });
                        break;
                }
            }
        }

        return {
            ...message,
            content: filteredContent.length > 0 ? filteredContent : [
                {
                    type: "text" as const,
                    text: "Empty message"
                }
            ]
        };
    });
}