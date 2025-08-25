/**
 * @fileoverview Chat Adapter - Production Grade
 *
 * Chat-based adapter for formatting DSPy data for chat-based language models.
 * 100% compatible with Stanford DSPy's chat formatting system.
 *
 * @version 1.0.0
 * @author Claude Code Zen Team
 */
import { BaseAdapter, } from '../interfaces/adapter';
/**
 * Chat adapter for formatting data as conversation messages
 * Compatible with OpenAI Chat API, Anthropic Claude, and other chat-based models
 */
export class ChatAdapter extends BaseAdapter {
    chatConfig;
    constructor(config = {}) {
        super(config);
        this.chatConfig = {
            include_system: config.include_system ?? true,
            include_demos: config.include_demos ?? true,
            max_demos: config.max_demos ?? 5,
            role_mapping: {
                system: 'system',
                user: 'user',
                assistant: 'assistant',
                ...config.role_mapping,
            },
        };
    }
    /**
     * Format data for fine-tuning in chat format
     */
    formatFinetuneData(data) {
        this.validateInput(data, ['signature', 'demos', 'inputs', 'outputs']);
        const messages = [];
        // Add system message with instructions
        if (this.chatConfig.include_system && data.signature.instructions) {
            messages.push({
                role: this.chatConfig.role_mapping.system,
                content: this.createSystemMessage(data.signature),
            });
        }
        // Add demonstration examples
        if (this.chatConfig.include_demos && data.demos.length > 0) {
            const maxDemos = Math.min(data.demos.length, this.chatConfig.max_demos);
            const demosToUse = data.demos.slice(0, maxDemos);
            for (const demo of demosToUse) {
                const demoInputs = this.extractInputs(demo, data.signature);
                const demoOutputs = this.extractOutputs(demo, data.signature);
                // User message with demo inputs
                messages.push({
                    role: this.chatConfig.role_mapping.user,
                    content: this.formatInputsAsUserMessage(demoInputs),
                    metadata: { type: 'demonstration', demo_id: demo.get('id') },
                });
                // Assistant message with demo outputs
                messages.push({
                    role: this.chatConfig.role_mapping.assistant,
                    content: this.formatOutputsAsAssistantMessage(demoOutputs),
                    metadata: { type: 'demonstration', demo_id: demo.get('id') },
                });
            }
        }
        // Add the current input as user message
        messages.push({
            role: this.chatConfig.role_mapping.user,
            content: this.formatInputsAsUserMessage(data.inputs),
            metadata: { type: 'current_input' },
        });
        // Add the expected output as assistant message
        const outputContent = this.formatPredictionAsAssistantMessage(data.outputs);
        messages.push({
            role: this.chatConfig.role_mapping.assistant,
            content: outputContent,
            metadata: { type: 'expected_output' },
        });
        return {
            messages,
            metadata: {
                adapter_type: 'chat',
                num_demos: this.chatConfig.include_demos
                    ? Math.min(data.demos.length, this.chatConfig.max_demos)
                    : 0,
                include_system: this.chatConfig.include_system,
                format_version: '1.0',
            },
        };
    }
    /**
     * Format inputs as user message content
     */
    formatInputsAsUserMessage(inputs) {
        const inputPairs = Object.entries(inputs);
        if (inputPairs.length === 0) {
            return '';
        }
        if (inputPairs.length === 1) {
            const pair = inputPairs[0];
            if (pair) {
                const [key, value] = pair;
                // For single inputs, often just the value is sufficient
                if (key === 'question' || key === 'query' || key === 'input' || key === 'prompt') {
                    return String(value);
                }
            }
        }
        // For multiple inputs, format as key-value pairs
        return inputPairs
            .map(([key, value]) => `${this.capitalizeFirst(key)}: ${value}`)
            .join('\n');
    }
    /**
     * Format outputs as assistant message content
     */
    formatOutputsAsAssistantMessage(outputs) {
        const outputPairs = Object.entries(outputs).filter(([_, value]) => value !== undefined);
        if (outputPairs.length === 0) {
            return '';
        }
        if (outputPairs.length === 1) {
            const pair = outputPairs[0];
            if (pair) {
                const [key, value] = pair;
                // For single outputs, often just the value is sufficient
                if (key === 'answer' || key === 'response' || key === 'output' || key === 'completion') {
                    return String(value);
                }
            }
        }
        // For multiple outputs, format as key-value pairs
        return outputPairs
            .map(([key, value]) => `${this.capitalizeFirst(key)}: ${value}`)
            .join('\n');
    }
    /**
     * Format prediction as assistant message content
     */
    formatPredictionAsAssistantMessage(outputs) {
        // Handle Prediction objects
        if ('data' in outputs && outputs.data) {
            return this.formatOutputsAsAssistantMessage(outputs.data);
        }
        // Handle plain objects
        return this.formatOutputsAsAssistantMessage(outputs);
    }
    /**
     * Capitalize first letter of string
     */
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    /**
     * Convert chat messages to OpenAI format
     */
    toOpenAIFormat(messages) {
        return messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
        }));
    }
    /**
     * Convert chat messages to Anthropic format
     */
    toAnthropicFormat(messages) {
        const systemMessages = messages.filter((m) => m.role === 'system');
        const conversationMessages = messages.filter((m) => m.role !== 'system');
        const result = {
            messages: conversationMessages.map((msg) => ({
                role: msg.role,
                content: msg.content,
            })),
        };
        if (systemMessages.length > 0) {
            result.system = systemMessages.map((m) => m.content).join('\n\n');
        }
        return result;
    }
    /**
     * Convert chat messages to plain text format
     */
    toTextFormat(messages) {
        return messages
            .map((msg) => {
            const roleLabel = msg.role.toUpperCase();
            return `${roleLabel}: ${msg.content}`;
        })
            .join('\n\n');
    }
    /**
     * Validate chat message format
     */
    validateMessages(messages) {
        if (!Array.isArray(messages) || messages.length === 0) {
            return false;
        }
        for (const message of messages) {
            if (!message.role || !['system', 'user', 'assistant'].includes(message.role)) {
                return false;
            }
            if (typeof message.content !== 'string') {
                return false;
            }
        }
        return true;
    }
    /**
     * Get adapter configuration
     */
    getConfig() {
        return { ...this.chatConfig };
    }
    /**
     * Update adapter configuration
     */
    updateConfig(config) {
        this.chatConfig = {
            ...this.chatConfig,
            ...config,
            role_mapping: {
                ...this.chatConfig.role_mapping,
                ...config.role_mapping,
            },
        };
    }
}
export default ChatAdapter;
