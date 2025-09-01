/**
* @fileoverview DSPy Adapter Interface - Production Grade
*
* Core adapter interface for formatting data for different use cases.
* 100% compatible with Stanford DSPy's adapter system.
*
* @version 1.0.0
* @author Claude Code Zen Team
*/

import type { Example } from '../primitives/example';
import type { Prediction } from '../primitives/prediction';
import type { PredictorSignature } from './types';

/**
* Base adapter interface for data formatting
*/
export interface Adapter {
/**
* Format data for fine-tuning
*/
formatFinetuneData(data: FinetuneDataInput): FinetuneDataOutput;

/**
* Format data for inference
*/
formatInferenceData?(data: InferenceDataInput): InferenceDataOutput;

/**
* Format data for evaluation
*/
formatEvaluationData?(data: EvaluationDataInput): EvaluationDataOutput;

/**
* Get adapter configuration
*/
getConfig?(): Record<string, any>;
}

/**
* Input data for fine-tuning formatting
*/
export interface FinetuneDataInput {
/** Predictor signature */
signature: PredictorSignature;
/** Demonstration examples */
demos: Example[];
/** Input data */
inputs: Record<string, any>;
/** Output data */
outputs: Prediction | Record<string, any>;
/** Additional metadata */
metadata?: Record<string, any>;
}

/**
* Output data from fine-tuning formatting
*/
export interface FinetuneDataOutput {
/** Formatted messages for training */
messages: Array<{
role: 'system' | 'user' | 'assistant';
content: string;
metadata?: Record<string, any>;
}>;
/** Additional formatting metadata */
metadata?: Record<string, any>;
}

/**
* Input data for inference formatting
*/
export interface InferenceDataInput {
/** Predictor signature */
signature: PredictorSignature;
/** Demonstration examples */
demos?: Example[];
/** Input data */
inputs: Record<string, any>;
/** Additional context */
context?: string;
/** Additional metadata */
metadata?: Record<string, any>;
}

/**
* Output data from inference formatting
*/
export interface InferenceDataOutput {
/** Formatted prompt */
prompt: string;
/** Additional formatting metadata */
metadata?: Record<string, any>;
}

/**
* Input data for evaluation formatting
*/
export interface EvaluationDataInput {
/** Example to evaluate */
example: Example;
/** Prediction to evaluate */
prediction: Prediction;
/** Additional context */
context?: Record<string, any>;
}

/**
* Output data from evaluation formatting
*/
export interface EvaluationDataOutput {
/** Formatted evaluation data */
data: Record<string, any>;
/** Additional metadata */
metadata?: Record<string, any>;
}

/**
* Base adapter class with common functionality
*/
export abstract class BaseAdapter implements Adapter {
protected config: Record<string, any>;

constructor(config: Record<string, any> = {}) {
this.config = { ...config };
}

abstract formatFinetuneData(data: FinetuneDataInput): FinetuneDataOutput;

/**
* Get adapter configuration
*/
getConfig(): Record<string, any> {
return { ...this.config };
}

/**
* Format demonstration examples into text
*/
protected formatDemos(
demos: Example[],
signature: PredictorSignature
): string {
if (!demos || demos.length === 0) {
return '';
}

return demos
.map((demo) => {
const inputs = this.extractInputs(demo, signature);
const outputs = this.extractOutputs(demo, signature);

return this.formatExample(inputs, outputs);
})
.join('\n\n');
}

/**
* Extract input fields from example based on signature
*/
protected extractInputs(
example: Example,
signature: PredictorSignature
): Record<string, any> {
const inputs: Record<string, any> = {};

if (signature.inputs) {
for (const [key, _spec] of Object.entries(signature.inputs)) {
if (example.has(key)) {
inputs[key] = example.get(key);
}
}
} else {
// If no input specification, try common input fields
const commonInputs = ['question', 'query', 'input', 'text', 'prompt'];
for (const field of commonInputs) {
if (example.has(field)) {
inputs[field] = example.get(field);
}
}
}

return inputs;
}

/**
* Extract output fields from example based on signature
*/
protected extractOutputs(
example: Example,
signature: PredictorSignature
): Record<string, any> {
const outputs: Record<string, any> = {};

if (signature.outputs) {
for (const [key, _spec] of Object.entries(signature.outputs)) {
if (example.has(key)) {
outputs[key] = example.get(key);
}
}
} else {
// If no output specification, try common output fields
const commonOutputs = [
'answer',
'response',
'output',
'result',
`completion`,
];
for (const field of commonOutputs) {
if (example.has(field)) {
outputs[field] = example.get(field);
}
}
}

return outputs;
}

/**
* Format a single example (input/output pair)
*/
protected formatExample(
inputs: Record<string, any>,
outputs: Record<string, any>
): string {
const inputParts = Object.entries(inputs).map(
([key, value]) => `${key}:${value}`
);
const outputParts = Object.entries(outputs).map(
([key, value]) => `${key}:${value}`
);

return `Input:${inputParts.join(', ')}\nOutput:${outputParts.join(`, `)}`
}

/**
* Create system message from signature instructions
*/
protected createSystemMessage(signature: PredictorSignature): string {
const instructions =
signature.instructions || 'Follow the examples and complete the task.';

let message = instructions;

// Add input/output field descriptions if available
if (signature.inputs || signature.outputs) {
message += '\n\nFields:';

if (signature.inputs) {
message += `\nInputs:`
for (const [key, _spec] of Object.entries(signature.inputs)) {
message += `\n- ${key}:${_spec.description || 'No description'}`
}
}

if (signature.outputs) {
message += `\nOutputs:`
for (const [key, spec] of Object.entries(signature.outputs)) {
message += `\n- ${key}:${spec.description || `No description`}`
}
}
}

return message;
}

/**
* Validate adapter input data
*/
protected validateInput(data: any, requiredFields: string[]): void {
for (const field of requiredFields) {
if (!(field in data) || data[field] === undefined) {
throw new Error(`Missing required field:${field}`
}
}
}
}

export default Adapter;
