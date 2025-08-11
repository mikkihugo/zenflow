/**
 * Claude Code Integration Types
 * 
 * Based on Cline's types.ts implementation
 */

import type { Anthropic } from "@anthropic-ai/sdk";

export interface InitMessage {
    type: "init";
    sessionId: string;
    apiKeySource: string;
    tools: string[];
}

export interface AssistantMessage {
    type: "assistant";
    message: Anthropic.Messages.Message;
}

export interface ErrorMessage {
    type: "error";
    error: string;
}

export interface ResultMessage {
    type: "result";
    result: {
        total_cost_usd: number;
        duration_seconds: number;
    };
}

export type ClaudeCodeMessage = InitMessage | AssistantMessage | ErrorMessage | ResultMessage;