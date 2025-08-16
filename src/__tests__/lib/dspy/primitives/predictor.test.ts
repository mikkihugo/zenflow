/**
 * @fileoverview Tests for DSPy Predictor Implementation
 * 
 * Comprehensive test suite for the Predictor class ensuring proper
 * signature handling, demonstration management, and prediction logic.
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Predictor, type Signature, type LanguageModel } from '../../../../lib/dspy/primitives/predictor';
import { BaseModule } from '../../../../lib/dspy/primitives/module';
import { Example } from '../../../../lib/dspy/primitives/example';

// Mock language model for testing
class MockLanguageModel implements LanguageModel {
  private lastPrompt: string = '';
  private responses: Record<string, string> = {
    '2+2': '4',
    'capital of France': 'Paris',
    'hello': 'Hello! How can I help you?'
  };

  async generate(prompt: string): Promise<string> {
    this.lastPrompt = prompt;
    
    for (const [key, response] of Object.entries(this.responses)) {
      if (prompt.includes(key)) {
        return response;
      }
    }
    
    return 'I need more information to answer that question.';
  }

  getUsage() {
    return {
      prompt_tokens: Math.floor(this.lastPrompt.length / 4),
      completion_tokens: 10,
      total_tokens: Math.floor(this.lastPrompt.length / 4) + 10
    };
  }

  getLastPrompt(): string {
    return this.lastPrompt;
  }
}

describe('Predictor', () => {
  let simpleSignature: Signature;
  let multiSignature: Signature;
  let predictor: Predictor;
  let multiPredictor: Predictor;
  let mockLM: MockLanguageModel;

  beforeEach(() => {
    simpleSignature = {
      inputs: { question: 'string' },
      outputs: { answer: 'string' },
      instruction: 'Answer the question clearly and concisely.'
    };

    multiSignature = {
      inputs: { text: 'string', language: 'string' },
      outputs: { translation: 'string', confidence: 'number' },
      instruction: 'Translate the text to the specified language.'
    };

    predictor = new Predictor(simpleSignature);
    multiPredictor = new Predictor(multiSignature);
    mockLM = new MockLanguageModel();
    
    // Clear static state between tests
    BaseModule['savedStates'].clear();
  });

  describe('Constructor and Initialization', () => {
    it('should initialize with signature', () => {
      expect(predictor.signature).toEqual(simpleSignature);
      expect(predictor.instructions).toBe(simpleSignature.instruction);
      expect(predictor.demos).toEqual([]);
    });

    it('should set up predictor parameters', () => {
      const params = predictor.named_parameters();
      
      expect(params.demos).toEqual({
        name: 'demos',
        value: [],
        trainable: true,
        metadata: { type: 'predictor' }
      });

      expect(params.instructions).toEqual({
        name: 'instructions',
        value: simpleSignature.instruction,
        trainable: true,
        metadata: { type: 'predictor' }
      });

      expect(params.signature).toEqual({
        name: 'signature',
        value: simpleSignature,
        trainable: false,
        metadata: { type: 'predictor' }
      });
    });

    it('should initialize with callbacks', () => {
      const callbacks = [{ pre: () => {} }];
      const predictorWithCallbacks = new Predictor(simpleSignature, callbacks);
      expect(predictorWithCallbacks.callbacks).toBe(callbacks);
    });
  });

  describe('Input Validation', () => {
    it('should validate required inputs', () => {
      predictor.set_lm(mockLM);
      expect(() => {
        predictor.forward({ wrong_field: 'value' });
      }).toThrow('Missing required input: question');
    });

    it('should accept valid inputs', () => {
      predictor.set_lm(mockLM);
      // Should not throw
      expect(() => {
        predictor.forward({ question: 'What is 2+2?' });
      }).not.toThrow();
    });

    it('should warn about extra inputs', () => {
      predictor.set_lm(mockLM);
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      predictor.forward({ 
        question: 'What is 2+2?', 
        extra_field: 'extra_value' 
      });
      
      expect(consoleSpy).toHaveBeenCalledWith('Extra input provided: extra_field');
      consoleSpy.mockRestore();
    });

    it('should validate multiple inputs', () => {
      multiPredictor.set_lm(mockLM);
      expect(() => {
        multiPredictor.forward({ text: 'Hello' }); // Missing language
      }).toThrow('Missing required input: language');

      expect(() => {
        multiPredictor.forward({ text: 'Hello', language: 'Spanish' });
      }).not.toThrow();
    });
  });

  describe('Prompt Formatting', () => {
    it('should format basic prompt with instruction and input', () => {
      const prompt = predictor.formatPrompt({ question: 'What is 2+2?' });
      
      expect(prompt).toContain('Answer the question clearly and concisely.');
      expect(prompt).toContain('question: What is 2+2?');
      expect(prompt).toContain('answer:');
    });

    it('should include demonstrations in prompt', () => {
      const demo = new Example({ question: 'What is 1+1?', answer: '2' }).withInputs('question');
      predictor.addDemo(demo);
      
      const prompt = predictor.formatPrompt({ question: 'What is 2+2?' });
      
      expect(prompt).toContain('Examples:');
      expect(prompt).toContain('question: What is 1+1?');
      expect(prompt).toContain('answer: 2');
    });

    it('should format multiple demonstrations', () => {
      const demo1 = new Example({ question: 'What is 1+1?', answer: '2' }).withInputs('question');
      const demo2 = new Example({ question: 'What is 3+3?', answer: '6' }).withInputs('question');
      
      predictor.updateDemos([demo1, demo2]);
      
      const prompt = predictor.formatPrompt({ question: 'What is 2+2?' });
      
      expect(prompt).toContain('question: What is 1+1?');
      expect(prompt).toContain('answer: 2');
      expect(prompt).toContain('question: What is 3+3?');
      expect(prompt).toContain('answer: 6');
    });

    it('should format multi-output signatures', () => {
      const prompt = multiPredictor.formatPrompt({ 
        text: 'Hello', 
        language: 'Spanish' 
      });
      
      expect(prompt).toContain('text: Hello');
      expect(prompt).toContain('language: Spanish');
      expect(prompt).toContain('translation:');
      expect(prompt).toContain('confidence:');
    });

    it('should work without instruction', () => {
      const noInstructionSignature: Signature = {
        inputs: { question: 'string' },
        outputs: { answer: 'string' }
      };
      
      const noInstructionPredictor = new Predictor(noInstructionSignature);
      const prompt = noInstructionPredictor.formatPrompt({ question: 'Test?' });
      
      expect(prompt).toContain('question: Test?');
      expect(prompt).toContain('answer:');
      expect(prompt).not.toContain('Answer the question');
    });
  });

  describe('Response Parsing', () => {
    it('should parse single output response', () => {
      const response = '4';
      const inputs = { question: 'What is 2+2?' };
      
      const result = predictor.parseResponse(response, inputs);
      
      expect(result.answer).toBe('4');
      expect(result.raw_response).toBe('4');
    });

    it('should parse multi-output response', () => {
      const response = 'translation: Hola\nconfidence: 0.95';
      const inputs = { text: 'Hello', language: 'Spanish' };
      
      const result = multiPredictor.parseResponse(response, inputs);
      
      expect(result.translation).toBe('Hola');
      expect(result.confidence).toBe('0.95');
      expect(result.raw_response).toBe(response);
    });

    it('should handle missing outputs in multi-output response', () => {
      const response = 'translation: Hola';
      const inputs = { text: 'Hello', language: 'Spanish' };
      
      const result = multiPredictor.parseResponse(response, inputs);
      
      expect(result.translation).toBe('Hola');
      expect(result.confidence).toBe(''); // Missing output becomes empty string
    });

    it('should trim whitespace from outputs', () => {
      const response = '  4  ';
      const inputs = { question: 'What is 2+2?' };
      
      const result = predictor.parseResponse(response, inputs);
      
      expect(result.answer).toBe('4');
    });
  });

  describe('Prediction Execution', () => {
    beforeEach(() => {
      predictor.set_lm(mockLM);
      multiPredictor.set_lm(mockLM);
    });

    it('should require language model to be set', () => {
      const noLMPredictor = new Predictor(simpleSignature);
      
      expect(() => {
        noLMPredictor.forward({ question: 'Test?' });
      }).toThrow('Language model not set. Call set_lm() first.');
    });

    it('should execute prediction with simulation', () => {
      const result = predictor.forward({ question: 'What is 2+2?' });
      
      expect(result.answer).toBe('4');
      expect(result.usage).toBeDefined();
      expect(result.usage!.prompt_tokens).toBeGreaterThan(0);
    });

    it('should execute async prediction', async () => {
      const result = await predictor.aforward({ question: 'What is 2+2?' });
      
      expect(result.answer).toBe('4');
      expect(result.usage).toBeDefined();
    });

    it('should track execution in history', () => {
      predictor.__call__({ question: 'What is 2+2?' });
      
      expect(predictor.history).toHaveLength(1);
      expect(predictor.history[0].inputs).toEqual([{ question: 'What is 2+2?' }]);
      expect(predictor.history[0].outputs.answer).toBe('4');
    });
  });

  describe('Demonstration Management', () => {
    it('should add single demonstration', () => {
      const demo = new Example({ question: 'What is 1+1?', answer: '2' }).withInputs('question');
      predictor.addDemo(demo);
      
      expect(predictor.demos).toHaveLength(1);
      expect(predictor.demos[0]).toBe(demo);
    });

    it('should update all demonstrations', () => {
      const demo1 = new Example({ question: 'What is 1+1?', answer: '2' }).withInputs('question');
      const demo2 = new Example({ question: 'What is 3+3?', answer: '6' }).withInputs('question');
      
      predictor.updateDemos([demo1, demo2]);
      
      expect(predictor.demos).toEqual([demo1, demo2]);
      expect(predictor.named_parameters().demos.value).toEqual([demo1, demo2]);
    });

    it('should clear all demonstrations', () => {
      const demo = new Example({ question: 'What is 1+1?', answer: '2' }).withInputs('question');
      predictor.addDemo(demo);
      
      predictor.clearDemos();
      
      expect(predictor.demos).toEqual([]);
      expect(predictor.named_parameters().demos.value).toEqual([]);
    });
  });

  describe('Instruction Management', () => {
    it('should update instructions', () => {
      const newInstructions = 'Provide detailed explanations for all answers.';
      predictor.updateInstructions(newInstructions);
      
      expect(predictor.instructions).toBe(newInstructions);
      expect(predictor.named_parameters().instructions.value).toBe(newInstructions);
    });

    it('should use updated instructions in prompts', () => {
      predictor.updateInstructions('Be very concise.');
      
      const prompt = predictor.formatPrompt({ question: 'What is 2+2?' });
      
      expect(prompt).toContain('Be very concise.');
      expect(prompt).not.toContain('Answer the question clearly');
    });
  });

  describe('Integration with Examples', () => {
    it('should work with Example class instances', () => {
      const example = new Example({ question: 'What is 2+2?' }).withInputs('question');
      const inputs = example.inputs();
      
      predictor.set_lm(mockLM);
      const result = predictor.forward(inputs.data);
      
      expect(result.answer).toBe('4');
    });

    it('should format Example demonstrations correctly', () => {
      const demo = new Example(
        { question: 'What is the capital of France?', answer: 'Paris' }
      ).withInputs('question');
      
      predictor.addDemo(demo);
      const prompt = predictor.formatPrompt({ question: 'What is 2+2?' });
      
      expect(prompt).toContain('question: What is the capital of France?');
      expect(prompt).toContain('answer: Paris');
    });
  });

  describe('State Management', () => {
    it('should save and load predictor state', () => {
      const demo = new Example({ question: 'What is 1+1?', answer: '2' }).withInputs('question');
      predictor.addDemo(demo);
      predictor.updateInstructions('New instructions');
      
      predictor.save('test-predictor');
      
      const newPredictor = new Predictor(simpleSignature);
      newPredictor.load('test-predictor');
      
      const loadedInstructions = newPredictor.named_parameters().instructions.value;
      expect(loadedInstructions).toBe('New instructions');
      // Note: demos are saved as parameters but need special handling for complex objects
    });

    it('should create independent copies', () => {
      // Create fresh signature to avoid interference
      const originalSignature = {
        inputs: { question: 'string' },
        outputs: { answer: 'string' },
        instruction: 'Answer the question clearly and concisely.'
      };
      
      const testPredictor = new Predictor(originalSignature);
      const demo = new Example({ question: 'What is 1+1?', answer: '2' }).withInputs('question');
      testPredictor.addDemo(demo);
      
      const copy = testPredictor.deepcopy() as Predictor;
      
      // Modify original
      testPredictor.updateInstructions('Modified instructions');
      
      // Copy should be unaffected
      const copyInstructions = copy.named_parameters().instructions.value;
      const originalInstructions = originalSignature.instruction;
      
      expect(copyInstructions).toBe(originalInstructions);
      expect(copyInstructions).not.toBe('Modified instructions');
      
      // Also verify the copy's direct property is correct
      expect(copy.instructions).toBe(originalInstructions);
    });
  });
});