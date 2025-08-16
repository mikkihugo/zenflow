/**
 * AGUI Adapter - Bridges @ag-ui/core with Claude-Zen's human validation needs.
 *
 * The @ag-ui/core package provides the Agent-User Interaction Protocol.
 * This adapter wraps it to provide the interface expected by our discovery system.
 */
/**
 * @file Agui adapter implementation.
 */
import { EventEmitter } from 'node:events';
export interface ValidationQuestion {
    id: string;
    type: 'relevance' | 'boundary' | 'relationship' | 'naming' | 'priority' | 'checkpoint' | 'review';
    question: string;
    context: unknown;
    options?: string[];
    allowCustom?: boolean;
    confidence: number;
    priority?: 'critical' | 'high' | 'medium' | 'low';
    validationReason?: string;
    expectedImpact?: number;
}
export interface AGUIInterface {
    askQuestion(question: ValidationQuestion): Promise<string>;
    askBatchQuestions(questions: ValidationQuestion[]): Promise<string[]>;
    showProgress(progress: unknown): Promise<void>;
    showMessage(message: string, type?: 'info' | 'warning' | 'error' | 'success'): Promise<void>;
}
/**
 * Terminal-based AGUI implementation.
 * Since @ag-ui/core is a protocol definition, we implement our own UI.
 *
 * @example
 */
export declare class TerminalAGUI extends EventEmitter implements AGUIInterface {
    private rl;
    private getReadline;
    askQuestion(question: ValidationQuestion): Promise<string>;
    askBatchQuestions(questions: ValidationQuestion[]): Promise<string[]>;
    showProgress(progress: unknown): Promise<void>;
    showMessage(_message: string, _type?: 'info' | 'warning' | 'error' | 'success'): Promise<void>;
    close(): void;
}
/**
 * Mock AGUI for testing - provides automatic responses.
 *
 * @example
 */
export declare class MockAGUI implements AGUIInterface {
    private responses;
    private defaultResponse;
    setResponse(questionId: string, response: string): void;
    setDefaultResponse(response: string): void;
    askQuestion(question: ValidationQuestion): Promise<string>;
    askBatchQuestions(questions: ValidationQuestion[]): Promise<string[]>;
    showProgress(progress: unknown): Promise<void>;
    showMessage(message: string, type?: 'info' | 'warning' | 'error' | 'success'): Promise<void>;
}
/**
 * Factory function to create appropriate AGUI instance.
 *
 * @param type
 * @example
 */
export declare function createAGUI(type?: 'terminal' | 'mock'): AGUIInterface;
//# sourceMappingURL=agui-adapter.d.ts.map