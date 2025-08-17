/**
 * AGUI Interfaces - Self-contained interface definitions
 * Copied from /src/interfaces/agui/ to make package self-contained
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
    showInfo(title: string, data: Record<string, unknown>): Promise<void>;
    clear?(): Promise<void>;
    close?(): Promise<void>;
}
export interface EventHandlerConfig {
    [key: string]: (...args: any[]) => void;
}
/**
 * Terminal-based AGUI implementation.
 * Since @ag-ui/core is a protocol definition, we implement our own UI.
 */
export declare class TerminalAGUI extends EventEmitter implements AGUIInterface {
    private rl;
    private getReadline;
    askQuestion(question: ValidationQuestion): Promise<string>;
    askBatchQuestions(questions: ValidationQuestion[]): Promise<string[]>;
    showProgress(progress: unknown): Promise<void>;
    private createProgressBar;
    showMessage(message: string, type?: 'info' | 'warning' | 'error' | 'success'): Promise<void>;
    showInfo(title: string, data: Record<string, unknown>): Promise<void>;
    clear(): Promise<void>;
    close(): Promise<void>;
}
/**
 * Mock AGUI for testing - provides automatic responses.
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
    showInfo(title: string, data: Record<string, unknown>): Promise<void>;
    clear(): Promise<void>;
    close(): Promise<void>;
}
/**
 * Factory function to create appropriate AGUI instance.
 */
export declare function createAGUI(type?: 'terminal' | 'mock'): AGUIInterface;
//# sourceMappingURL=interfaces.d.ts.map