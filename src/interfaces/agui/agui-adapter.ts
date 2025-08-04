/**
 * AGUI Adapter - Bridges @ag-ui/core with Claude-Zen's human validation needs
 *
 * The @ag-ui/core package provides the Agent-User Interaction Protocol.
 * This adapter wraps it to provide the interface expected by our discovery system.
 */

import { EventEmitter } from 'node:events';
import * as readline from 'node:readline';
import { createLogger } from '@core/logger';

const logger = createLogger({ prefix: 'AGUIAdapter' });

// Define our own interface since we're adapting @ag-ui/core
export interface ValidationQuestion {
  id: string;
  type: 'relevance' | 'boundary' | 'relationship' | 'naming' | 'priority' | 'checkpoint' | 'review';
  question: string;
  context: any;
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
  showProgress(progress: any): Promise<void>;
  showMessage(message: string, type?: 'info' | 'warning' | 'error' | 'success'): Promise<void>;
}

/**
 * Terminal-based AGUI implementation
 * Since @ag-ui/core is a protocol definition, we implement our own UI
 */
export class TerminalAGUI extends EventEmitter implements AGUIInterface {
  private rl: readline.Interface | null = null;

  private getReadline(): readline.Interface {
    if (!this.rl) {
      this.rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true,
      });
    }
    return this.rl;
  }

  async askQuestion(question: ValidationQuestion): Promise<string> {
    const rl = this.getReadline();
    if (question.confidence !== undefined) {
    }

    // Show options if available
    if (question.options && question.options.length > 0) {
      question.options.forEach((_opt, _idx) => {});
      if (question.allowCustom) {
      }
    }

    // Show context if available
    if (question.context && Object.keys(question.context).length > 0) {
      Object.entries(question.context).forEach(([_key, value]) => {
        if (typeof value === 'object') {
        } else {
        }
      });
    }

    // Get user input
    return new Promise((resolve) => {
      const prompt = question.options ? '\nYour choice: ' : '\nYour answer: ';
      rl.question(prompt, (answer) => {
        // Handle numeric choices
        if (question.options && /^\d+$/.test(answer)) {
          const idx = parseInt(answer) - 1;
          if (idx >= 0 && idx < question.options.length) {
            resolve(question.options[idx]);
          } else if (answer === '0' && question.allowCustom) {
            rl.question('Enter custom response: ', (custom) => {
              resolve(custom);
            });
          } else {
            resolve(answer);
          }
        } else {
          resolve(answer);
        }
      });
    });
  }

  async askBatchQuestions(questions: ValidationQuestion[]): Promise<string[]> {
    const answers: string[] = [];

    for (let i = 0; i < questions.length; i++) {
      const answer = await this.askQuestion(questions[i]);
      answers.push(answer);
    }

    return answers;
  }

  async showProgress(progress: any): Promise<void> {
    if (typeof progress === 'object') {
      Object.entries(progress).forEach(([_key, _value]) => {});
    } else {
    }
  }

  async showMessage(
    _message: string,
    _type: 'info' | 'warning' | 'error' | 'success' = 'info',
  ): Promise<void> {
    const _icons = {
      info: 'ℹ️ ',
      warning: '⚠️ ',
      error: '❌',
      success: '✅',
    };
  }

  close(): void {
    if (this.rl) {
      this.rl.close();
      this.rl = null;
    }
  }
}

/**
 * Mock AGUI for testing - provides automatic responses
 */
export class MockAGUI implements AGUIInterface {
  private responses: Map<string, string> = new Map();
  private defaultResponse: string = 'Yes';

  setResponse(questionId: string, response: string): void {
    this.responses.set(questionId, response);
  }

  setDefaultResponse(response: string): void {
    this.defaultResponse = response;
  }

  async askQuestion(question: ValidationQuestion): Promise<string> {
    logger.debug('Mock AGUI Question:', question);
    const response = this.responses.get(question.id) || this.defaultResponse;
    return response;
  }

  async askBatchQuestions(questions: ValidationQuestion[]): Promise<string[]> {
    logger.debug(`Mock AGUI Batch: ${questions.length} questions`);
    return questions.map((q) => this.responses.get(q.id) || this.defaultResponse);
  }

  async showProgress(progress: any): Promise<void> {
    logger.debug('Mock AGUI Progress:', progress);
  }

  async showMessage(
    message: string,
    type?: 'info' | 'warning' | 'error' | 'success',
  ): Promise<void> {
    logger.debug(`Mock AGUI Message [${type || 'info'}]:`, message);
  }
}

/**
 * Factory function to create appropriate AGUI instance
 */
export function createAGUI(type: 'terminal' | 'mock' = 'terminal'): AGUIInterface {
  switch (type) {
    case 'mock':
      return new MockAGUI();
    default:
      return new TerminalAGUI();
  }
}
