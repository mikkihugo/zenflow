export function filterMessagesForClaudeCode(messages) {
    return messages.map((message) => {
        if (typeof message.content === 'string') {
            return message;
        }
        const filteredContent = [];
        if (Array.isArray(message.content)) {
            for (const content of message.content) {
                switch (content.type) {
                    case 'text':
                        filteredContent.push(content);
                        break;
                    case 'image': {
                        const placeholder = `[Image (${content.source?.type || 'unknown'}): ${content.source?.media_type || 'unknown media type'} not supported by Claude Code]`;
                        filteredContent.push({
                            type: 'text',
                            text: placeholder,
                        });
                        break;
                    }
                    case 'tool_use':
                        filteredContent.push(content);
                        break;
                    case 'tool_result':
                        filteredContent.push(content);
                        break;
                    default:
                        filteredContent.push({
                            type: 'text',
                            text: `[Unsupported content type: ${content.type}]`,
                        });
                        break;
                }
            }
        }
        return {
            ...message,
            content: filteredContent.length > 0
                ? filteredContent
                : [
                    {
                        type: 'text',
                        text: 'Empty message',
                    },
                ],
        };
    });
}
//# sourceMappingURL=message-filter.js.map