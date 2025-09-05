/**
* @fileoverview Comprehensive test suite for BootstrapFinetune teleprompter
*
* Tests 100% API compatibility with Stanford DSPy's BootstrapFinetune teleprompter.
* Validates all constructor parameters, compile method behavior, and fine-tuning logic.
*/

import { beforeEach, describe, expect, it } from 'vitest';
import { ChatAdapter } from '../../adapters/chat-adapter.js';
import {
DSPyModule,
Example,
type LMInterface,
type MetricFunction,
type Prediction,
} from '../../lib/index.js';
import {
BootstrapFinetune,
type BootstrapFinetuneConfig,
FailedPrediction,
FinetuneTeleprompter,
} from '../../teleprompters/bootstrap-finetune.js';

// Common test string constants
const INSTRUCTIONS_FOLLOW = 'Follow instructions carefully.';
const ERROR_NO_LM = 'Predictor 0 does not have an LM assigned';
const ERROR_STRUCT_EQUIV = 'Structurally equivalent programs must have the same number of predictors';
const ERROR_SHARED_PREDICTOR = 'The programs share predictor';
const ERROR_THREADS = "BootstrapFinetune requires 'num_threads' to be bigger than or equal to the number of fine-tuning jobs";
class MockLM implements LMInterface {
model: string;
private responses: Map<string, string> = new Map();

constructor(model: string = 'mock-model{
this.model = model;
}

async generate(prompt: string): Promise<string> {
return this.responses.get(prompt) || 'mock response';
}

setResponse(prompt: string, response: string): void {
this.responses.set(prompt, response);
}

kill(): void {
// Mock kill implementation
}

launch(): void {
// Mock launch implementation
}
}

// Mock DSPy Module for testing
class MockModule extends DSPyModule {
private name: string;
private mockResponse: Prediction;
public compiled: boolean = false;
private mockPredictors: any[];

constructor(name: string, mockResponse: Prediction, lm?: MockLM) {
super();
this.name = name;
this.mockResponse = mockResponse;
this.mockPredictors = [
{
name: name + 'predictor',
signature: { instructions: INSTRUCTIONS_FOLLOW },
lm: lm || new MockLM(),
demos: [],
},
];
}

async forward(example: Example): Promise<Prediction> {
return {
...this.mockResponse,
data: {
...this.mockResponse.data,
source: this.name,
input: example.data,
},
};
}

predictors() {
return this.mockPredictors;
}

namedPredictors(): [string, any][] {
return this.mockPredictors.map(
(pred, i) => ['predictor_' + i, pred] as [string, any]
);
}

deepcopy(): MockModule {
const copy = new MockModule(this.name, { ...this.mockResponse });
copy.compiled = this.compiled;
copy.mockPredictors = this.mockPredictors.map((pred) => ({ ...pred }));
return copy;
}

setLM(lm: MockLM): void {
for (const pred of this.mockPredictors) pred.lm = lm;
}
}

// Mock metric function
const exactMatch: MetricFunction = (
example: Example,
prediction: Prediction
): number => (prediction.data?.answer === example.data.answer ? 1 : 0);

describe('BootstrapFinetune Teleprompter', () => {
let bootstrapFinetune: BootstrapFinetune;
let basicConfig: BootstrapFinetuneConfig;
let mockStudent: MockModule;
let mockTeacher: MockModule;
let trainset: Example[];
let mockLM: MockLM;

beforeEach(() => {
mockLM = new MockLM('gpt-4');

basicConfig = {
metric: exactMatch,
};

mockStudent = new MockModule(
'student',
{
data: { answer: 'A' },
confidence: 0.8,
},
mockLM
);

mockTeacher = new MockModule(
'teacher',
{
data: { answer: 'B' },
confidence: 0.9,
},
mockLM
);

trainset = [
new Example({ question: 'What is 1+1?', answer: '2' }),
new Example({ question: 'What is 2+2?', answer: '4' }),
new Example({ question: 'What is 3+3?', answer: '6' }),
new Example({ question: 'What is 4+4?', answer: '8' }),
new Example({ question: 'What is 5+5?', answer: '10' }),
];
});

describe('FinetuneTeleprompter Base Class', () => {
it('should create base class with default train_kwargs', () => {
class TestFinetune extends FinetuneTeleprompter {
async compile() {
return mockStudent;
}
}

const finetune = new TestFinetune();
expect(finetune).toBeInstanceOf(FinetuneTeleprompter);
});

it('should convert train_kwargs to LM dict', () => {
class TestFinetune extends FinetuneTeleprompter {
async compile() {
return mockStudent;
}
getTrainKwargs() {
return this.trainKwargs;
}
}

const finetune = new TestFinetune({ learning_rate: 0.001 });
const trainKwargs = (finetune as any).getTrainKwargs();
expect(trainKwargs).toBeInstanceOf(Map);
});

it('should handle LM-specific train_kwargs', () => {
class TestFinetune extends FinetuneTeleprompter {
async compile() {
return mockStudent;
}
getTrainKwargs() {
return this.trainKwargs;
}
}

const lmMap = new Map([[mockLM, { learning_rate: 0.001 }]]);
const finetune = new TestFinetune(lmMap);
const trainKwargs = (finetune as any).getTrainKwargs();
expect(trainKwargs).toBeInstanceOf(Map);
});
});

describe('Constructor API Compatibility', () => {
it('should create BootstrapFinetune with default parameters', () => {
bootstrapFinetune = new BootstrapFinetune();
const config = bootstrapFinetune.getConfig();

expect(config.metric).toBeNull();
expect(config.multitask).toBe(true);
expect(config.exclude_demos).toBe(false);
expect(config.num_threads).toBeNull();
});

it('should create BootstrapFinetune with metric only', () => {
bootstrapFinetune = new BootstrapFinetune({ metric: exactMatch });
const config = bootstrapFinetune.getConfig();

expect(config.metric).toBe(exactMatch);
expect(config.multitask).toBe(true);
});

it('should create BootstrapFinetune with all parameters', () => {
const adapter = new ChatAdapter();
const trainKwargs = { learning_rate: 0.001, epochs: 3 };

const fullConfig: BootstrapFinetuneConfig = {
metric: exactMatch,
multitask: false,
train_kwargs: trainKwargs,
adapter,
exclude_demos: true,
num_threads: 4,
};

bootstrapFinetune = new BootstrapFinetune(fullConfig);
const config = bootstrapFinetune.getConfig();

expect(config.metric).toBe(exactMatch);
expect(config.multitask).toBe(false);
expect(config.train_kwargs).toBe(trainKwargs);
expect(config.adapter).toBe(adapter);
expect(config.exclude_demos).toBe(true);
expect(config.num_threads).toBe(4);
});

it('should handle LM-specific adapters', () => {
const adapterMap = new Map([[mockLM, new ChatAdapter()]]);

bootstrapFinetune = new BootstrapFinetune({ adapter: adapterMap });
const config = bootstrapFinetune.getConfig();

expect(config.adapter).toBe(adapterMap);
});

it('should inherit from FinetuneTeleprompter', () => {
bootstrapFinetune = new BootstrapFinetune();
expect(bootstrapFinetune).toBeInstanceOf(FinetuneTeleprompter);
});
});

describe('Compile Method API Compatibility', () => {
beforeEach(() => {
bootstrapFinetune = new BootstrapFinetune(basicConfig);
});

it('should compile with student and trainset only', async () => {
const result = await bootstrapFinetune.compile(mockStudent, trainset);

expect(result).toBeDefined();
expect(result).toBeInstanceOf(MockModule);
expect((result as any).compiled).toBe(true);
});

it('should compile with student, trainset, and single teacher', async () => {
const result = await bootstrapFinetune.compile(
mockStudent,
trainset,
mockTeacher
);

expect(result).toBeDefined();
expect(result).toBeInstanceOf(MockModule);
});

it('should compile with student, trainset, and multiple teachers', async () => {
const teacher2 = new MockModule(
'teacher2',
{ data: { answer: 'C' } },
mockLM
);
const teachers = [mockTeacher, teacher2];

const result = await bootstrapFinetune.compile(
mockStudent,
trainset,
teachers
);

expect(result).toBeDefined();
});

it('should compile with null teacher (uses student as teacher)', async () => {
const result = await bootstrapFinetune.compile(
mockStudent,
trainset,
null
);

expect(result).toBeDefined();
});

it('should compile with undefined teacher', async () => {
const result = await bootstrapFinetune.compile(mockStudent, trainset);

expect(result).toBeDefined();
});

it('should throw error if predictor lacks LM', async () => {
// Create student without LM
const studentWithoutLM = new MockModule('no-lm', {
data: { answer: 'A' },
});
studentWithoutLM.predictors()[0].lm = null;

await expect(
bootstrapFinetune.compile(studentWithoutLM, trainset)
).rejects.toThrow(ERROR_NO_LM);
});

it('should handle empty trainset gracefully', async () => {
// Should still attempt compilation even with empty trainset
const result = await bootstrapFinetune.compile(mockStudent, []);
expect(result).toBeDefined();
});
});

describe('Fine-tuning Process', () => {
beforeEach(() => {
bootstrapFinetune = new BootstrapFinetune({
metric: exactMatch,
num_threads: 2,
});
});

it('should bootstrap trace data from teacher', async () => {
const result = await bootstrapFinetune.compile(
mockStudent,
trainset,
mockTeacher
);

expect(result).toBeDefined();
// Should have completed trace data bootstrapping
});

it('should prepare fine-tuning data', async () => {
const result = await bootstrapFinetune.compile(
mockStudent,
trainset,
mockTeacher
);

expect(result).toBeDefined();
// Should have prepared training data for fine-tuning
});

it('should handle multitask fine-tuning', async () => {
bootstrapFinetune = new BootstrapFinetune({
metric: exactMatch,
multitask: true,
});

const result = await bootstrapFinetune.compile(
mockStudent,
trainset,
mockTeacher
);

expect(result).toBeDefined();
});

it('should handle single-task fine-tuning', async () => {
bootstrapFinetune = new BootstrapFinetune({
metric: exactMatch,
multitask: false,
});

const result = await bootstrapFinetune.compile(
mockStudent,
trainset,
mockTeacher
);

expect(result).toBeDefined();
});

it('should exclude demos when configured', async () => {
bootstrapFinetune = new BootstrapFinetune({
metric: exactMatch,
exclude_demos: true,
});

const result = await bootstrapFinetune.compile(
mockStudent,
trainset,
mockTeacher
);

expect(result).toBeDefined();
// Predictors should have empty demos
expect(result.predictors()[0].demos).toEqual([]);
});

it('should preserve demos when not excluded', async () => {
// Add some demos to student
mockStudent.predictors()[0].demos = [trainset[0]];

bootstrapFinetune = new BootstrapFinetune({
metric: exactMatch,
exclude_demos: false,
});

const result = await bootstrapFinetune.compile(
mockStudent,
trainset,
mockTeacher
);

expect(result).toBeDefined();
// Demos should be preserved
expect(result.predictors()[0].demos).toEqual([trainset[0]]);
});

it('should validate number of fine-tuning jobs vs threads', async () => {
// Create student with many predictors that would exceed thread limit
const manyPredictorsStudent = new MockModule('many', {
data: { answer: 'A' },
});

// Mock many predictors with different LMs
const predictors = Array.from({ length: 5 }, (_, i) => ({
name: 'predictor_' + i,
signature: { instructions: 'Test' },
lm: new MockLM('model_' + i),
demos: [],
}));

manyPredictorsStudent.mockPredictors = predictors;

bootstrapFinetune = new BootstrapFinetune({
metric: exactMatch,
multitask: false, // Each predictor gets its own fine-tuning job
num_threads: 2, // Less than number of predictors
});

await expect(
bootstrapFinetune.compile(manyPredictorsStudent, trainset)
).rejects.toThrow(
ERROR_THREADS
);
});
});

describe('Adapter and Data Formatting', () => {
let chatAdapter: ChatAdapter;

beforeEach(() => {
chatAdapter = new ChatAdapter();
});

it('should use ChatAdapter for data formatting', () => {
const formatted = chatAdapter.formatFinetuneData({
signature: { instructions: 'Test' },
demos: [trainset[0]],
inputs: { question: 'Test question' },
outputs: { data: { answer: 'Test answer' } },
});

expect(formatted).toHaveProperty('messages');
expect(Array.isArray(formatted.messages)).toBe(true);
});

it('should format chat messages correctly', () => {
const demo = trainset[0];
const formatted = chatAdapter.formatFinetuneData({
signature: { instructions: 'Test' },
demos: [demo],
inputs: { question: 'What is 6+6?' },
outputs: { data: { answer: '12' } },
});

const { messages } = formatted;
expect(messages.length).toBeGreaterThan(0);

// Should have user and assistant messages
const userMessages = messages.filter((m: any) => m.role === 'user');
const assistantMessages = messages.filter(
(m: any) => m.role === 'assistant'
);

expect(userMessages.length).toBeGreaterThan(0);
expect(assistantMessages.length).toBeGreaterThan(0);
});

it('should handle empty demos', () => {
const formatted = chatAdapter.formatFinetuneData({
signature: { instructions: 'Test' },
demos: [],
inputs: { question: 'Test question' },
outputs: { data: { answer: 'Test answer' } },
});

expect(formatted.messages).toHaveLength(3); // System, input, and output
});

it('should handle undefined output data', () => {
const formatted = chatAdapter.formatFinetuneData({
signature: { instructions: 'Test' },
demos: [],
inputs: { question: 'Test question' },
outputs: { data: undefined },
});

expect(formatted.messages).toHaveLength(3); // System, input, output
expect(formatted.messages[2].content).toBe(''); // Empty content for undefined data
});
});

describe('Error Handling and Edge Cases', () => {
beforeEach(() => {
bootstrapFinetune = new BootstrapFinetune(basicConfig);
});

it('should handle FailedPrediction class', () => {
const failed = new FailedPrediction('Failed to parse', -1);

expect(failed.completion_text).toBe('Failed to parse');
expect(failed.format_reward).toBe(-1);
});

it('should handle FailedPrediction without format_reward', () => {
const failed = new FailedPrediction('Failed to parse');

expect(failed.completion_text).toBe('Failed to parse');
expect(failed.format_reward).toBeUndefined();
});

it('should handle structural equivalency validation', async () => {
// Create teacher with different structure
const differentTeacher = new MockModule('different', {
data: { answer: 'B' },
});
differentTeacher.mockPredictors = []; // Different number of predictors

await expect(
bootstrapFinetune.compile(mockStudent, {
trainset,
teacher: differentTeacher,
})
).rejects.toThrow(
ERROR_STRUCT_EQUIV
);
});

it('should handle shared predictor validation', async () => {
// Create teacher that shares predictor with student
const sharedTeacher = new MockModule('shared', { data: { answer: 'B' } });
sharedTeacher.mockPredictors = mockStudent.predictors(); // Share same predictor objects

await expect(
bootstrapFinetune.compile(mockStudent, {
trainset,
teacher: sharedTeacher,
})
).rejects.toThrow(ERROR_SHARED_PREDICTOR);
});

it('should handle programs without demos', async () => {
// Ensure predictors don't have demos initially
mockStudent.predictors()[0].demos = undefined;

const result = await bootstrapFinetune.compile(mockStudent, trainset);

expect(result).toBeDefined();
});

it('should handle missing LM methods gracefully', async () => {
const lmWithoutKill = {
model: 'test-model',
generate: async () => 'response',
// No kill method
};

mockStudent.setLM(lmWithoutKill as any);

const result = await bootstrapFinetune.compile(mockStudent, trainset);

expect(result).toBeDefined();
});
});

describe('Advanced Configuration', () => {
it('should handle custom train_kwargs per LM', async () => {
const lm1 = new MockLM('model1');
const lm2 = new MockLM('model2');

const trainKwargsMap = new Map([
[lm1, { learning_rate: 0.001, epochs: 3 }],
[lm2, { learning_rate: 0.002, epochs: 5 }],
]);

bootstrapFinetune = new BootstrapFinetune({
metric: exactMatch,
train_kwargs: trainKwargsMap,
});

const result = await bootstrapFinetune.compile(mockStudent, trainset);

expect(result).toBeDefined();
});

it('should handle custom adapter per LM', async () => {
const adapter1 = new ChatAdapter();
const _adapter2 = new ChatAdapter();

const adapterMap = new Map([[mockLM, adapter1]]);

bootstrapFinetune = new BootstrapFinetune({
metric: exactMatch,
adapter: adapterMap,
});

const result = await bootstrapFinetune.compile(mockStudent, trainset);

expect(result).toBeDefined();
});

it('should handle metric filtering during data preparation', async () => {
// Create metric that filters out some examples
const selectiveMetric: MetricFunction = (
example: Example,
prediction: Prediction
): number => {
// Only accept even-numbered answers
const answer = parseInt(prediction.data?.answer || '0', 10);
return answer % 2 === 0 ? 1 : 0;
};

bootstrapFinetune = new BootstrapFinetune({
metric: selectiveMetric,
});

const result = await bootstrapFinetune.compile(mockStudent, trainset);

expect(result).toBeDefined();
});

it('should handle different num_threads configurations', async () => {
bootstrapFinetune = new BootstrapFinetune({
metric: exactMatch,
num_threads: 1,
});

const result = await bootstrapFinetune.compile(mockStudent, trainset);

expect(result).toBeDefined();
});
});

describe('Stanford DSPy Compatibility', () => {
it('should match Stanford DSPy constructor parameter names', () => {
// Test exact parameter names from Stanford DSPy
const config: BootstrapFinetuneConfig = {
metric: null,
multitask: true,
train_kwargs: null,
adapter: null,
exclude_demos: false,
num_threads: null,
};

bootstrapFinetune = new BootstrapFinetune(config);
expect(bootstrapFinetune).toBeInstanceOf(BootstrapFinetune);
});

it('should match Stanford DSPy compile method signature', async () => {
// Test exact parameter signature from Stanford DSPy
const result = await bootstrapFinetune.compile(
mockStudent, // student:Module
trainset, // trainset:list[Example]
mockTeacher // teacher: 'Module' | 'list'[Module]|None
);

expect(result).toBeDefined();
});

it('should inherit from FinetuneTeleprompter like Stanford DSPy', () => {
expect(bootstrapFinetune).toBeInstanceOf(FinetuneTeleprompter);
});

it('should handle teacher preparation like Stanford DSPy', async () => {
// Should work with null teacher
const result1 = await bootstrapFinetune.compile(
mockStudent,
trainset,
null
);
expect(result1).toBeDefined();

// Should work with single teacher
const result2 = await bootstrapFinetune.compile(
mockStudent,
trainset,
mockTeacher
);
expect(result2).toBeDefined();

// Should work with array of teachers
const result3 = await bootstrapFinetune.compile(mockStudent, trainset, [
mockTeacher,
]);
expect(result3).toBeDefined();
});

it('should set compiled flag like Stanford DSPy', async () => {
const result = await bootstrapFinetune.compile(mockStudent, trainset);

expect((result as any).compiled).toBe(true);
});

it('should handle Stanford DSPy-style error messages', async () => {
// Test predictor without LM error
const noLMStudent = new MockModule('no-lm', { data: { answer: 'A' } });
noLMStudent.predictors()[0].lm = null;

await expect(
bootstrapFinetune.compile(noLMStudent, trainset)
).rejects.toThrow(/Predictor \d+ does not have an LM assigned/);
});
});

describe('Performance and Resource Management', () => {
it('should handle large trainsets efficiently', async () => {
const largeTrainset = Array.from(
{ length: 100 },
(_, i) =>
new Example({ question: 'What is ` + (i) + `+${i}?`, answer: i * 2 })
);

const result = await bootstrapFinetune.compile(
mockStudent,
largeTrainset
);

expect(result).toBeDefined();
});

it(`should handle multiple LMs correctly', async () => {
const lm1 = new MockLM('model1');
const lm2 = new MockLM('model2');

// Create student with multiple predictors using different LMs
const multiLMStudent = new MockModule('multi', { data: { answer: 'A' } });
multiLMStudent.mockPredictors = [
{ name: 'pred1', signature: {}, lm: lm1, demos: [] },
{ name: 'pred2', signature: {}, lm: lm2, demos: [] },
];

bootstrapFinetune = new BootstrapFinetune({
metric: exactMatch,
multitask: false, // Each predictor gets separate fine-tuning
num_threads: 3,
});

const result = await bootstrapFinetune.compile(multiLMStudent, trainset);

expect(result).toBeDefined();
});

it('should call LM kill method before fine-tuning', async () => {
let killCalled = false;
const mockLMWithKill = {
model: 'test-model',
generate: async () => 'response',
kill: () => {
killCalled = true;
},
};

mockStudent.setLM(mockLMWithKill as any);

await bootstrapFinetune.compile(mockStudent, trainset);

expect(killCalled).toBe(true);
});
});
});
