import { getLogger } from '../config/logging-config.ts';
import { DEFAULT_DSPY_CONFIG, DEFAULT_OPTIMIZATION_CONFIG, DSPY_LIMITS, DSPyAPIError, DSPyConfigurationError, DSPyExecutionError, DSPyOptimizationError, isDSPyConfig, isDSPyProgram, } from './types/index.ts';
const logger = getLogger('DSPyWrapper');
export class DSPyWrapperImpl {
    dspyInstance = null;
    currentConfig = null;
    programs = new Map();
    isInitialized = false;
    constructor(initialConfig) {
        if (initialConfig && !isDSPyConfig(initialConfig)) {
            throw new DSPyConfigurationError('Invalid DSPy configuration provided', {
                config: initialConfig,
            });
        }
        if (initialConfig) {
            this.configure(initialConfig);
        }
    }
    async configure(config) {
        try {
            if (!isDSPyConfig(config)) {
                throw new DSPyConfigurationError('Invalid configuration object', {
                    config,
                });
            }
            let DSPy, configureLM;
            try {
                const dspyModule = await import('dspy.ts');
                DSPy =
                    dspyModule.default || dspyModule.DSPy || dspyModule;
                configureLM =
                    dspyModule.configureLM || dspyModule.configure;
            }
            catch (error) {
                throw new DSPyAPIError('Failed to import dspy.ts package', {
                    error: error instanceof Error ? error.message : String(error),
                });
            }
            const finalConfig = { ...DEFAULT_DSPY_CONFIG, ...config };
            if (configureLM) {
                try {
                    await configureLM({
                        model: finalConfig?.model,
                        temperature: finalConfig?.temperature,
                        maxTokens: finalConfig?.maxTokens,
                        ...(finalConfig?.apiKey && { apiKey: finalConfig?.apiKey }),
                        ...(finalConfig?.baseURL && { baseURL: finalConfig?.baseURL }),
                        ...finalConfig?.modelParams,
                    });
                }
                catch (error) {
                    throw new DSPyConfigurationError('Failed to configure language model', {
                        error: error instanceof Error ? error.message : String(error),
                        config: finalConfig,
                    });
                }
            }
            if (DSPy) {
                try {
                    this.dspyInstance = new DSPy(finalConfig);
                }
                catch (error) {
                    logger.warn('Constructor approach failed, using static access', {
                        error,
                    });
                    this.dspyInstance = DSPy;
                }
            }
            else {
                throw new DSPyAPIError('DSPy class not found in dspy.ts module');
            }
            this.currentConfig = finalConfig;
            this.isInitialized = true;
            logger.info('DSPy configured successfully', {
                model: finalConfig?.model,
                temperature: finalConfig?.temperature,
                maxTokens: finalConfig?.maxTokens,
            });
        }
        catch (error) {
            this.isInitialized = false;
            if (error instanceof DSPyConfigurationError ||
                error instanceof DSPyAPIError) {
                throw error;
            }
            throw new DSPyConfigurationError('Unexpected error during configuration', {
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    async createProgram(signature, description) {
        this.ensureInitialized();
        if (!signature || typeof signature !== 'string') {
            throw new DSPyAPIError('Invalid program signature', { signature });
        }
        if (!description || typeof description !== 'string') {
            throw new DSPyAPIError('Invalid program description', { description });
        }
        if (this.programs.size >= DSPY_LIMITS.MAX_PROGRAMS_PER_WRAPPER) {
            throw new DSPyAPIError(`Maximum programs limit reached: ${DSPY_LIMITS.MAX_PROGRAMS_PER_WRAPPER}`);
        }
        try {
            let rawProgram;
            if (this.dspyInstance.createProgram) {
                rawProgram = await this.dspyInstance.createProgram(signature, description);
            }
            else if (this.dspyInstance.Program) {
                rawProgram = new this.dspyInstance.Program(signature, description);
            }
            else {
                logger.warn('Creating mock program structure - dspy.ts API not fully compatible');
                rawProgram = {
                    signature,
                    description,
                    forward: async (_input) => {
                        throw new DSPyAPIError('Program forward method not implemented by dspy.ts');
                    },
                };
            }
            const program = new DSPyProgramWrapper(rawProgram, signature, description, this);
            this.programs.set(program.id, program);
            logger.debug('DSPy program created successfully', {
                id: program.id,
                signature,
                description: description.substring(0, 100),
            });
            return program;
        }
        catch (error) {
            throw new DSPyAPIError('Failed to create DSPy program', {
                signature,
                description,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    async execute(program, input) {
        this.ensureInitialized();
        if (!isDSPyProgram(program)) {
            throw new DSPyAPIError('Invalid DSPy program provided', { program });
        }
        if (!input || typeof input !== 'object') {
            throw new DSPyAPIError('Invalid input provided', { input });
        }
        const startTime = Date.now();
        try {
            const rawResult = await program.forward(input);
            const executionTime = Date.now() - startTime;
            if (program instanceof DSPyProgramWrapper) {
                program.updateExecutionStats(executionTime);
            }
            const result = {
                success: true,
                result: rawResult || {},
                metadata: {
                    executionTime,
                    timestamp: new Date(),
                    model: this.currentConfig?.model,
                    ...(rawResult?.['tokensUsed'] && {
                        tokensUsed: rawResult?.['tokensUsed'],
                    }),
                    confidence: rawResult?.['confidence'] || undefined,
                },
            };
            logger.debug('DSPy program executed successfully', {
                programId: program.id,
                executionTime,
                inputKeys: Object.keys(input),
                outputKeys: Object.keys(rawResult || {}),
            });
            return result;
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            logger.error('DSPy program execution failed', {
                programId: program.id,
                executionTime,
                error: error instanceof Error ? error.message : String(error),
            });
            const metadata = {
                executionTime,
                timestamp: new Date(),
                confidence: 0.0,
            };
            if (this.currentConfig?.model) {
                metadata.model = this.currentConfig.model;
            }
            return {
                success: false,
                result: {},
                metadata,
                error: error instanceof Error ? error : new Error(String(error)),
            };
        }
    }
    async addExamples(program, examples) {
        this.ensureInitialized();
        if (!isDSPyProgram(program)) {
            throw new DSPyAPIError('Invalid DSPy program provided');
        }
        if (!Array.isArray(examples) || examples.length === 0) {
            throw new DSPyAPIError('Invalid examples array provided', { examples });
        }
        if (examples.length > DSPY_LIMITS.MAX_EXAMPLES) {
            throw new DSPyAPIError(`Too many examples provided. Maximum: ${DSPY_LIMITS.MAX_EXAMPLES}`, {
                provided: examples.length,
            });
        }
        for (const example of examples) {
            if (!(example.input && example.output) ||
                typeof example.input !== 'object' ||
                typeof example.output !== 'object') {
                throw new DSPyAPIError('Invalid example structure', { example });
            }
        }
        try {
            const rawProgram = program.rawProgram;
            if (this.dspyInstance.addExamples) {
                await this.dspyInstance.addExamples(rawProgram, examples);
            }
            else if (rawProgram.addExamples) {
                await rawProgram.addExamples(examples);
            }
            else {
                logger.warn('addExamples method not found - examples stored locally only');
                if (program instanceof DSPyProgramWrapper) {
                    program.addExamples(examples);
                }
            }
            logger.debug('Examples added to DSPy program', {
                programId: program.id,
                exampleCount: examples.length,
            });
        }
        catch (error) {
            throw new DSPyAPIError('Failed to add examples to program', {
                programId: program.id,
                exampleCount: examples.length,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    async optimize(program, config) {
        this.ensureInitialized();
        if (!isDSPyProgram(program)) {
            throw new DSPyAPIError('Invalid DSPy program provided');
        }
        const optimizationConfig = { ...DEFAULT_OPTIMIZATION_CONFIG, ...config };
        const startTime = Date.now();
        try {
            const rawProgram = program.rawProgram;
            let optimizationResult;
            if (this.dspyInstance.optimize) {
                optimizationResult = await this.dspyInstance.optimize(rawProgram, {
                    strategy: optimizationConfig?.strategy,
                    maxIterations: optimizationConfig?.maxIterations,
                    ...optimizationConfig?.strategyParams,
                });
            }
            else if (rawProgram.optimize) {
                optimizationResult = await rawProgram.optimize(optimizationConfig);
            }
            else {
                logger.warn('Optimization not available - returning original program');
                optimizationResult = {
                    program: rawProgram,
                    metrics: { improvementPercent: 0 },
                };
            }
            const executionTime = Date.now() - startTime;
            const result = {
                success: true,
                program: optimizationResult?.program
                    ? new DSPyProgramWrapper(optimizationResult?.program, program.signature, program.description, this)
                    : program,
                metrics: {
                    iterationsCompleted: optimizationResult?.iterations || 0,
                    executionTime,
                    initialAccuracy: optimizationResult?.initialAccuracy,
                    finalAccuracy: optimizationResult?.finalAccuracy,
                    improvementPercent: optimizationResult?.improvementPercent || 0,
                },
                issues: optimizationResult?.warnings || [],
            };
            logger.info('DSPy program optimization completed', {
                programId: program.id,
                strategy: optimizationConfig?.strategy,
                executionTime,
                improvement: result?.metrics?.improvementPercent,
            });
            return result;
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            logger.error('DSPy program optimization failed', {
                programId: program.id,
                strategy: optimizationConfig?.strategy,
                executionTime,
                error: error instanceof Error ? error.message : String(error),
            });
            throw new DSPyOptimizationError('Program optimization failed', {
                programId: program.id,
                config: optimizationConfig,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    getConfig() {
        return this.currentConfig;
    }
    async healthCheck() {
        try {
            if (!(this.isInitialized && this.currentConfig)) {
                return false;
            }
            const testProgram = await this.createProgram('test: string -> result: string', 'Simple health check program');
            const result = await this.execute(testProgram, { test: 'health_check' });
            this.programs.delete(testProgram.id);
            return result?.success;
        }
        catch (error) {
            logger.warn('DSPy health check failed', {
                error: error instanceof Error ? error.message : String(error),
            });
            return false;
        }
    }
    getStats() {
        return {
            isInitialized: this.isInitialized,
            currentConfig: this.currentConfig,
            programCount: this.programs.size,
            programs: Array.from(this.programs.values()).map((p) => ({
                id: p.id,
                signature: p.signature,
                description: p.description,
                executionCount: p.getMetadata()?.executionCount || 0,
                averageExecutionTime: p.getMetadata()?.averageExecutionTime || 0,
            })),
        };
    }
    async cleanup() {
        this.programs.clear();
        this.dspyInstance = null;
        this.currentConfig = null;
        this.isInitialized = false;
        logger.info('DSPy wrapper cleaned up');
    }
    ensureInitialized() {
        if (!(this.isInitialized && this.dspyInstance)) {
            throw new DSPyAPIError('DSPy wrapper not initialized. Call configure() first.');
        }
    }
}
class DSPyProgramWrapper {
    id;
    signature;
    description;
    rawProgram;
    metadata;
    examples = [];
    constructor(rawProgram, signature, description, wrapper) {
        this.id = `dspy-program-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        this.signature = signature;
        this.description = description;
        this.rawProgram = rawProgram;
        this.metadata = {
            signature,
            description,
            createdAt: new Date(),
            executionCount: 0,
            averageExecutionTime: 0,
            examples: [],
        };
    }
    async forward(input) {
        if (this.rawProgram.forward) {
            return await this.rawProgram.forward(input);
        }
        if (typeof this.rawProgram === 'function') {
            return await this.rawProgram(input);
        }
        throw new DSPyExecutionError('Program forward method not available', {
            programId: this.id,
            rawProgramType: typeof this.rawProgram,
        });
    }
    getMetadata() {
        return { ...this.metadata, examples: [...this.examples] };
    }
    updateExecutionStats(executionTime) {
        this.metadata.executionCount++;
        this.metadata.lastExecuted = new Date();
        if (this.metadata.executionCount === 1) {
            this.metadata.averageExecutionTime = executionTime;
        }
        else {
            this.metadata.averageExecutionTime =
                (this.metadata.averageExecutionTime *
                    (this.metadata.executionCount - 1) +
                    executionTime) /
                    this.metadata.executionCount;
        }
    }
    addExamples(examples) {
        this.examples.push(...examples);
        this.metadata.examples = [...this.examples];
    }
}
export async function createDSPyWrapper(config) {
    const wrapper = new DSPyWrapperImpl();
    await wrapper.configure(config);
    return wrapper;
}
export async function createDefaultDSPyWrapper() {
    return createDSPyWrapper(DEFAULT_DSPY_CONFIG);
}
let singletonWrapper = null;
export async function getSingletonDSPyWrapper(config) {
    if (!singletonWrapper) {
        singletonWrapper = await createDSPyWrapper(config || DEFAULT_DSPY_CONFIG);
    }
    return singletonWrapper;
}
export default DSPyWrapperImpl;
//# sourceMappingURL=dspy-wrapper.js.map