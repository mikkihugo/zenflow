/**
 * AGUI Adapter - Bridges @ag-ui/core with Claude-Zen's human validation needs
 * 
 * The @ag-ui/core package provides the Agent-User Interaction Protocol.
 * This adapter wraps it to provide the interface expected by our discovery system.
 */

import { EventEmitter } from 'node:events';
import { createLogger } from '@core/logger';
import * as readline from 'node:readline';

const logger = createLogger({ prefix: 'AGUIAdapter' });

// Define our own interface since we're adapting @ag-ui/core
export interface ValidationQuestion {
  id: string;
  type: 'relevance' | 'boundary' | 'relationship' | 'naming' | 'priority' | 'confirmation';
  question: string;
  context: any;
  options?: string[];
  allowCustom?: boolean;
  confidence?: number;
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

  constructor() {
    super();
  }

  private getReadline(): readline.Interface {
    if (!this.rl) {
      this.rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true
      });
    }
    return this.rl;
  }

  async askQuestion(question: ValidationQuestion): Promise<string> {
    const rl = this.getReadline();
    
    // Format the question
    console.log('\n' + '='.repeat(80));
    console.log(`📋 ${question.type.toUpperCase()} VALIDATION`);
    if (question.confidence !== undefined) {
      console.log(`   Confidence: ${(question.confidence * 100).toFixed(1)}%`);
    }
    console.log('='.repeat(80));
    console.log();
    console.log(question.question);

    // Show options if available
    if (question.options && question.options.length > 0) {
      console.log('\nOptions:');
      question.options.forEach((opt, idx) => {
        console.log(`  ${idx + 1}. ${opt}`);
      });
      if (question.allowCustom) {
        console.log('  0. Enter custom response');
      }
    }

    // Show context if available
    if (question.context && Object.keys(question.context).length > 0) {
      console.log('\nContext:');
      Object.entries(question.context).forEach(([key, value]) => {
        if (typeof value === 'object') {
          console.log(`  ${key}: ${JSON.stringify(value, null, 2)}`);
        } else {
          console.log(`  ${key}: ${value}`);
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
    console.log(`\n🔄 Batch validation: ${questions.length} questions`);
    const answers: string[] = [];
    
    for (let i = 0; i < questions.length; i++) {
      console.log(`\n[${i + 1}/${questions.length}]`);
      const answer = await this.askQuestion(questions[i]);
      answers.push(answer);
    }
    
    return answers;
  }

  async showProgress(progress: any): Promise<void> {
    console.log('\n📊 Progress Update:');
    if (typeof progress === 'object') {
      Object.entries(progress).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
    } else {
      console.log(`  ${progress}`);
    }
  }

  async showMessage(message: string, type: 'info' | 'warning' | 'error' | 'success' = 'info'): Promise<void> {
    const icons = {
      info: 'ℹ️ ',
      warning: '⚠️ ',
      error: '❌',
      success: '✅'
    };
    console.log(`\n${icons[type]} ${message}`);
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
    return questions.map(q => this.responses.get(q.id) || this.defaultResponse);
  }

  async showProgress(progress: any): Promise<void> {
    logger.debug('Mock AGUI Progress:', progress);
  }

  async showMessage(message: string, type?: 'info' | 'warning' | 'error' | 'success'): Promise<void> {
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
    case 'terminal':
    default:
      return new TerminalAGUI();
  }
}

// Export types
export type { AGUIInterface, ValidationQuestion };