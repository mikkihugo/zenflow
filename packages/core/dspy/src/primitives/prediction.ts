/**
* @fileoverview DSPy Prediction - Production Grade
*
* Core Prediction interface for DSPy module outputs.
* 100% compatible with Stanford DSPy's Prediction interface.
*
* @version 1.0.0
* @author Claude Code Zen Team
*/

/**
* DSPy Prediction interface
* Represents the output of a DSPy module execution
*/
export interface Prediction {
/** The main data/result of the prediction */
data?: Record<string, any>;
/** Reasoning or explanation for the prediction */
reasoning?: string;
/** Confidence score (0-1) */
confidence?: number;
/** Metadata about the prediction */
metadata?: Record<string, any>;
/** Raw completion text from LM */
completion_text?: string;
/** Timestamp when prediction was made */
timestamp?: number;
/** Model used for prediction */
model?: string;
/** Cost/tokens used for prediction */
cost?: {
input_tokens?: number;
output_tokens?: number;
total_cost?: number;
};
/** Any additional fields */
[key: string]: any;
}

/**
* Utility functions for working with predictions
*/
export class PredictionUtils {
/**
* Create a new prediction
*/
static create(
data: Record<string, any>,
options: Partial<Prediction> = {}
): Prediction {
return {
data,
timestamp: Date.now(),
confidence: 1.0,
...options,
};
}

/**
* Merge multiple predictions
*/
static merge(predictions: Prediction[]): Prediction {
if (predictions.length === 0) {
return { data: {} };
}

if (predictions.length === 1) {
const firstPred = predictions[0];
if (firstPred) {
return firstPred;
}
}

// Merge data fields
const mergedData: Record<string, any> = {};
for (const pred of predictions) {
if (pred.data) {
Object.assign(mergedData, pred.data);
}
}

// Combine reasoning
const reasoning = predictions
.map((p) => p.reasoning)
.filter(Boolean)
.join(' | ');

// Average confidence
const confidences = predictions
.map((p) => p.confidence)
.filter((c) => typeof c === 'number');
const avgConfidence =
confidences.length > 0
? confidences.reduce((sum, c) => sum + c, 0) / confidences.length
: undefined;

const result: Prediction = {
data: mergedData,
metadata: {
merged_from: predictions.length,
merged_at: Date.now(),
},
};

if (reasoning) {
result.reasoning = reasoning;
}

if (avgConfidence !== undefined) {
result.confidence = avgConfidence;
}

return result;
}

/**
* Extract specific field from prediction
*/
static extract(
prediction: Prediction,
field: string,
defaultValue?: any
): any {
return prediction.data?.[field] ?? prediction[field] ?? defaultValue;
}

/**
* Check if prediction has field
*/
static hasField(prediction: Prediction, field: string): boolean {
return (prediction.data && field in prediction.data) || field in prediction;
}

/**
* Get all fields from prediction
*/
static getFields(prediction: Prediction): string[] {
const fields = new Set<string>();

if (prediction.data) {
for (const key of Object.keys(prediction.data)) fields.add(key);
}

for (const key of Object.keys(prediction)) {
if (key !== 'data{
fields.add(key);
}
}

return Array.from(fields);
}

/**
* Validate prediction structure
*/
static validate(prediction: any): prediction is Prediction {
return prediction && typeof prediction === 'object';
}

/**
* Convert prediction to string
*/
static toString(prediction: Prediction): string {
if (prediction.data) {
return JSON.stringify(prediction.data);
}
return JSON.stringify(prediction);
}

/**
* Deep copy prediction
*/
static deepcopy(prediction: Prediction): Prediction {
return JSON.parse(JSON.stringify(prediction));
}

/**
* Filter predictions by confidence threshold
*/
static filterByConfidence(
predictions: Prediction[],
threshold: number
): Prediction[] {
return predictions.filter((p) => (p.confidence ?? 1.0) >= threshold);
}

/**
* Sort predictions by confidence (descending)
*/
static sortByConfidence(predictions: Prediction[]): Prediction[] {
return [...predictions].sort(
(a, b) => (b.confidence ?? 0) - (a.confidence ?? 0)
);
}

/**
* Get top N predictions by confidence
*/
static topN(predictions: Prediction[], n: number): Prediction[] {
return PredictionUtils.sortByConfidence(predictions).slice(0, n);
}
}

export default Prediction;
