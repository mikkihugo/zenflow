/**
 * @fileoverview DSPy Primitives Index
 * 
 * Central export point for all DSPy primitive components including
 * core primitives, predictors, modules, and utility functions.
 * 
 * @author Claude Code Zen Team
 * @version 2.0.0
 * @since 1.0.0-alpha.45
 */

// Core Module and Base Classes
export { BaseModule, type Parameter, type UsageStats } from './module.js';

// Examples and Training Data
export type { Example } from '../interfaces/types.js';
export { ExampleImpl, ExamplePair, createExample } from './example.js';

// Predictions and Results
export { 
  type Prediction, 
  PredictionResult, 
  createPrediction, 
  isPrediction, 
  standardizePrediction 
} from './prediction.js';

// Core Predictor
export { 
  Predictor, 
  type Signature, 
  type LanguageModel, 
  type GenerationOptions,
  type PredictionResult as CorePredictionResult,
  type DSPyPredictor 
} from './predictor.js';

// Retrieval
export { 
  Retrieve, 
  type Document, 
  type RetrieverBackend,
  type RetrieveConfig,
  InMemoryRetriever,
  VectorRetriever,
  createInMemoryRetriever,
  createVectorRetriever
} from './retrieve.js';

// Chain of Thought
export { 
  ChainOfThought,
  type ChainOfThoughtConfig,
  createChainOfThought,
  createChainOfThoughtWithField
} from './chain-of-thought.js';

// Program of Thought
export {
  ProgramOfThought,
  type ProgramOfThoughtConfig,
  type CodeExecutionResult,
  type CodeExecutor,
  SafeJavaScriptExecutor,
  PythonPseudoExecutor,
  createProgramOfThought,
  createJavaScriptPoT,
  createPythonPoT
} from './program-of-thought.js';

// Multi-Chain Comparison
export {
  MultiChainComparison,
  createMultiChainComparison,
  type MultiChainComparisonConfig,
  type ReasoningCompletion
} from './multi-chain-comparison.js';

// ReAct (Reasoning and Acting)
export {
  ReAct,
  createReAct,
  type Tool,
  type ReActConfig,
  type TrajectoryEntry,
  type ReActResult,
  ToolExecutionError
} from './react.js';

// BestOfN (Best-of-N Selection)
export {
  BestOfN,
  createBestOfN,
  type BestOfNConfig,
  type BestOfNResult,
  type RewardFunction,
  RewardFunctions
} from './best-of-n.js';

// KNN (K-Nearest Neighbors)
export {
  KNN,
  createKNN,
  type KNNConfig,
  type KNNResult,
  type Embedder,
  SimpleEmbedder,
  createSimpleEmbedder,
  SimilarityFunctions
} from './knn.js';

// Parallel Execution
export {
  Parallel,
  createParallel,
  type ParallelConfig,
  type ParallelResult,
  type ExecutionPair,
  type ProgressTracker,
  ConsoleProgressTracker,
  createExecutionPairs,
  createMultiModuleExecutionPairs
} from './parallel.js';

// Refine (Iterative Refinement)
export {
  Refine,
  createRefine,
  type RefineConfig,
  type RefineResult,
  type RefineRewardFunction,
  RefineRewardFunctions
} from './refine.js';

// CodeAct (Code Action Execution)
export {
  CodeAct,
  createCodeAct,
  type CodeActConfig,
  type CodeActResult,
  type CodeExecutor,
  JavaScriptExecutor
} from './code-act.js';

// Aggregation Functions
export {
  majority,
  weightedMajority,
  consensus,
  defaultNormalize,
  normalizeText,
  AggregationUtils,
  AggregationFactory,
  type AggregationFunction
} from './aggregation.js';

// Utilities
export { SeededRNG } from './seeded-rng.js';

// Re-export commonly used types
export type {
  TraceStep,
  MetricFunction
} from '../interfaces/types.js';

/**
 * All available primitive types
 */
export const PRIMITIVE_TYPES = {
  PREDICTOR: 'predictor',
  RETRIEVE: 'retrieve', 
  CHAIN_OF_THOUGHT: 'chain-of-thought',
  PROGRAM_OF_THOUGHT: 'program-of-thought'
} as const;

/**
 * Create a basic predictor with signature
 * 
 * @param signature - Input/output signature
 * @returns Configured Predictor instance
 */
export function createPredictor(signature: Signature): Predictor {
  return new Predictor(signature);
}

/**
 * Create predictor factory for common patterns
 */
export const PredictorFactory = {
  /**
   * Create a question-answering predictor
   */
  questionAnswering(): Predictor {
    return new Predictor({
      inputs: { question: 'string' },
      outputs: { answer: 'string' },
      instruction: 'Answer the question clearly and accurately.'
    });
  },

  /**
   * Create a text classification predictor
   */
  textClassification(labels: string[]): Predictor {
    return new Predictor({
      inputs: { text: 'string' },
      outputs: { label: `one of: ${labels.join(', ')}` },
      instruction: `Classify the text into one of these categories: ${labels.join(', ')}.`
    });
  },

  /**
   * Create a text summarization predictor
   */
  summarization(): Predictor {
    return new Predictor({
      inputs: { text: 'string' },
      outputs: { summary: 'string' },
      instruction: 'Summarize the given text concisely while preserving key information.'
    });
  },

  /**
   * Create a sentiment analysis predictor
   */
  sentimentAnalysis(): Predictor {
    return new Predictor({
      inputs: { text: 'string' },
      outputs: { sentiment: 'positive, negative, or neutral' },
      instruction: 'Analyze the sentiment of the given text.'
    });
  },

  /**
   * Create a math problem solver predictor
   */
  mathSolver(): Predictor {
    return new Predictor({
      inputs: { problem: 'string' },
      outputs: { answer: 'number', explanation: 'string' },
      instruction: 'Solve the mathematical problem and explain your reasoning.'
    });
  }
};

/**
 * Chain of Thought factory for common patterns
 */
export const CoTFactory = {
  /**
   * Create a reasoning-based question answering predictor
   */
  reasoningQA(): ChainOfThought {
    return new ChainOfThought({
      inputs: { question: 'string' },
      outputs: { answer: 'string' },
      instruction: 'Answer the question by thinking through it step by step.'
    });
  },

  /**
   * Create a mathematical reasoning predictor
   */
  mathReasoning(): ChainOfThought {
    return new ChainOfThought({
      inputs: { problem: 'string' },
      outputs: { answer: 'number' },
      instruction: 'Solve the math problem by working through it step by step.'
    }, { reasoning_field: 'reasoning' });
  },

  /**
   * Create a logical reasoning predictor
   */
  logicalReasoning(): ChainOfThought {
    return new ChainOfThought({
      inputs: { premise: 'string', question: 'string' },
      outputs: { conclusion: 'string' },
      instruction: 'Draw a logical conclusion based on the given premise.'
    }, { reasoning_field: 'logic' });
  }
};

/**
 * Program of Thought factory for computational tasks
 */
export const PoTFactory = {
  /**
   * Create a mathematical computation predictor
   */
  mathComputation(): ProgramOfThought {
    return new ProgramOfThought({
      inputs: { problem: 'string' },
      outputs: { answer: 'number' },
      instruction: 'Write code to solve the mathematical problem.'
    });
  },

  /**
   * Create a data analysis predictor
   */
  dataAnalysis(): ProgramOfThought {
    return new ProgramOfThought({
      inputs: { data: 'array', task: 'string' },
      outputs: { result: 'any', insights: 'string' },
      instruction: 'Write code to analyze the data and provide insights.'
    });
  },

  /**
   * Create an algorithm implementation predictor
   */
  algorithmImplementation(): ProgramOfThought {
    return new ProgramOfThought({
      inputs: { description: 'string', requirements: 'string' },
      outputs: { solution: 'any' },
      instruction: 'Implement the described algorithm in code.'
    });
  }
};

/**
 * Retrieval factory for common patterns
 */
export const RetrievalFactory = {
  /**
   * Create a document search retriever
   */
  documentSearch(documents: Document[], k: number = 5): Retrieve {
    return createInMemoryRetriever(documents, k);
  },

  /**
   * Create a FAQ retriever
   */
  faqRetriever(faqs: Array<{ question: string; answer: string }>, k: number = 3): Retrieve {
    const documents = faqs.map((faq, index) => ({
      id: `faq-${index}`,
      content: `Q: ${faq.question}\nA: ${faq.answer}`,
      title: faq.question,
      metadata: { type: 'faq', answer: faq.answer }
    }));
    
    return createInMemoryRetriever(documents, k);
  },

  /**
   * Create a knowledge base retriever
   */
  knowledgeBase(articles: Array<{ title: string; content: string }>, k: number = 5): Retrieve {
    const documents = articles.map((article, index) => ({
      id: `kb-${index}`,
      content: article.content,
      title: article.title,
      metadata: { type: 'knowledge-base' }
    }));
    
    return createVectorRetriever(documents, k);
  }
};