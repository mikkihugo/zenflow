import { EventEmitter } from 'node:events';
import * as readline from 'node:readline';
import { getLogger } from '../../config/logging-config.ts';
const logger = getLogger('AGUIAdapter');
export class TerminalAGUI extends EventEmitter {
    rl = null;
    getReadline() {
        if (!this.rl) {
            this.rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
                terminal: true,
            });
        }
        return this.rl;
    }
    async askQuestion(question) {
        const rl = this.getReadline();
        if (question.confidence !== undefined) {
        }
        if (question.options && question.options.length > 0) {
            question.options.forEach((_opt, _idx) => { });
            if (question.allowCustom) {
            }
        }
        if (question.context && Object.keys(question.context).length > 0) {
            Object.entries(question.context).forEach(([_key, value]) => {
                if (typeof value === 'object') {
                }
                else {
                }
            });
        }
        return new Promise((resolve) => {
            const prompt = question.options ? '\nYour choice: ' : '\nYour answer: ';
            rl.question(prompt, (answer) => {
                if (question.options && /^\d+$/.test(answer)) {
                    const idx = Number.parseInt(answer) - 1;
                    if (idx >= 0 && idx < question.options.length) {
                        resolve(question.options[idx] || '');
                    }
                    else if (answer === '0' && question.allowCustom) {
                        rl.question('Enter custom response: ', (custom) => {
                            resolve(custom);
                        });
                    }
                    else {
                        resolve(answer);
                    }
                }
                else {
                    resolve(answer);
                }
            });
        });
    }
    async askBatchQuestions(questions) {
        const answers = [];
        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            if (question) {
                const answer = await this.askQuestion(question);
                answers.push(answer);
            }
        }
        return answers;
    }
    async showProgress(progress) {
        if (typeof progress === 'object') {
            Object.entries(progress).forEach(([_key, _value]) => { });
        }
        else {
        }
    }
    async showMessage(_message, _type = 'info') {
        const _icons = {
            info: 'ℹ️ ',
            warning: '⚠️ ',
            error: '❌',
            success: '✅',
        };
    }
    close() {
        if (this.rl) {
            this.rl.close();
            this.rl = null;
        }
    }
}
export class MockAGUI {
    responses = new Map();
    defaultResponse = 'Yes';
    setResponse(questionId, response) {
        this.responses.set(questionId, response);
    }
    setDefaultResponse(response) {
        this.defaultResponse = response;
    }
    async askQuestion(question) {
        logger.debug('Mock AGUI Question:', question);
        const response = this.responses.get(question.id) || this.defaultResponse;
        return response;
    }
    async askBatchQuestions(questions) {
        logger.debug(`Mock AGUI Batch: ${questions.length} questions`);
        return questions.map((q) => this.responses.get(q.id) || this.defaultResponse);
    }
    async showProgress(progress) {
        logger.debug('Mock AGUI Progress:', progress);
    }
    async showMessage(message, type) {
        logger.debug(`Mock AGUI Message [${type || 'info'}]:`, message);
    }
}
export function createAGUI(type = 'terminal') {
    switch (type) {
        case 'mock':
            return new MockAGUI();
        default:
            return new TerminalAGUI();
    }
}
//# sourceMappingURL=agui-adapter.js.map