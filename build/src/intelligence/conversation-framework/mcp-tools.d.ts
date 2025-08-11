/**
 * Conversation MCP Tools.
 *
 * MCP tools for managing ag2.ai-inspired multi-agent conversations.
 */
/**
 * @file Mcp-tools implementation.
 */
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ConversationOrchestratorImpl } from './orchestrator.ts';
import type { ConversationMCPTools as ConversationMCPToolsInterface } from './types.ts';
/**
 * MCP tools for conversation management.
 *
 * @example
 */
export declare class ConversationMCPTools implements ConversationMCPToolsInterface {
    private orchestrator;
    constructor(orchestrator: ConversationOrchestratorImpl);
    /**
     * Get all conversation MCP tools.
     */
    getTools(): Tool[];
    /**
     * Handle conversation MCP tool calls.
     *
     * @param name
     * @param args
     */
    handleToolCall(name: string, args: any): Promise<any>;
    private createConversation;
    private joinConversation;
    private sendMessage;
    private getHistory;
    private terminateConversation;
    private searchConversations;
    private getPatterns;
    private moderateConversation;
    /**
     * Static method for backward compatibility.
     *
     * @deprecated Use instance method getTools() instead.
     */
    static getToolsStatic(): Tool[];
}
/**
 * Factory for creating conversation MCP tools.
 *
 * @example
 */
export declare class ConversationMCPToolsFactory {
    static create(): Promise<ConversationMCPTools>;
}
//# sourceMappingURL=mcp-tools.d.ts.map