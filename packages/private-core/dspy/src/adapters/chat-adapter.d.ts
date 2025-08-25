/**
 * @fileoverview Chat Adapter - Production Grade
 *
 * Chat-based adapter for formatting DSPy data for chat-based language models.
 * 100% compatible with Stanford DSPy's chat formatting system.
 *
 * @version 1.0.0
 * @author Claude Code Zen Team
 */
import { BaseAdapter, type FinetuneDataInput, type FinetuneDataOutput } from '../interfaces/adapter';
/**
 * Chat adapter configuration
 */
export interface ChatAdapterConfig {
    /** Whether to include system messages */
    include_system?: boolean;
    /** Whether to include demonstrations */
    include_demos?: boolean;
    /** Maximum number of demonstrations to include */
    max_demos?: number;
    /** Custom role mapping */
    role_mapping?: {
        system?: string;
        user?: string;
        assistant?: string;
    };
}
/**
 * Chat message interface
 */
export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
    metadata?: Record<string, any>;
}
/**
 * Chat adapter for formatting data as conversation messages
 * Compatible with OpenAI Chat API, Anthropic Claude, and other chat-based models
 */
export declare class ChatAdapter extends BaseAdapter {
    private chatConfig;
    constructor(config?: ChatAdapterConfig);
    /**
     * Format data for fine-tuning in chat format
     */
    formatFinetuneData(data: FinetuneDataInput): FinetuneDataOutput;
    /**
     * Format inputs as user message content
     */
    private formatInputsAsUserMessage;
    /**
     * Format outputs as assistant message content
     */
    private formatOutputsAsAssistantMessage;
    /**
     * Format prediction as assistant message content
     */
    private formatPredictionAsAssistantMessage;
    /**
     * Capitalize first letter of string
     */
    private capitalizeFirst;
    /**
     * Convert chat messages to OpenAI format
     */
    toOpenAIFormat(messages: ChatMessage[]): Array<{
        role: string;
        content: string;
    }>;
    /**
     * Convert chat messages to Anthropic format
     */
    toAnthropicFormat(messages: ChatMessage[]): {
        system?: string;
        messages: Array<{
            role: 'user' | 'assistant';
            content: string;
        }>;
    };
    /**
     * Convert chat messages to plain text format
     */
    toTextFormat(messages: ChatMessage[]): string;
    /**
     * Validate chat message format
     */
    validateMessages(messages: ChatMessage[]): boolean;
    /**
     * Get adapter configuration
     */
    getConfig(): ChatAdapterConfig;
    /**
     * Update adapter configuration
     */
    updateConfig(config: Partial<ChatAdapterConfig>): void;
}
export default ChatAdapter;
//# sourceMappingURL=chat-adapter.d.ts.map