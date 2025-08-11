/**
 * @file Mcp-integration implementation.
 */
/**
 * Enhanced Intelligence MCP Tools with ag2.ai integration.
 *
 * @example
 */
export declare class IntelligenceMCPTools {
    private conversationTools;
    private static conversationToolsCache;
    constructor();
    private initializeConversationTools;
    /**
     * Get all intelligence MCP tools including conversation capabilities.
     */
    static getTools(): Promise<Tool[]>;
    /**
     * Handle intelligence MCP tool calls.
     *
     * @param name
     * @param args
     */
    handleToolCall(name: string, args: any): Promise<any>;
    private getCapabilities;
    private analyzeAgentConversationPatterns;
    private suggestConversationImprovements;
    private createAdaptiveConversationPattern;
    private predictConversationOutcomes;
}
/**
 * Factory for creating intelligence MCP tools.
 *
 * @example
 */
export declare class IntelligenceMCPToolsFactory {
    static create(): Promise<IntelligenceMCPTools>;
}
//# sourceMappingURL=mcp-integration.d.ts.map