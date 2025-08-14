import { EventEmitter } from 'node:events';
let MemoryOptimizer = null;
let PATTERN_MEMORY_CONFIG = null;
const COGNITIVE_PATTERNS = {
    CONVERGENT: 'convergent',
    DIVERGENT: 'divergent',
    LATERAL: 'lateral',
    SYSTEMS: 'systems',
    CRITICAL: 'critical',
    ABSTRACT: 'abstract',
};
const AGENT_COGNITIVE_PROFILES = {
    researcher: {
        primary: COGNITIVE_PATTERNS.DIVERGENT,
        secondary: COGNITIVE_PATTERNS.SYSTEMS,
        learningRate: 0.7,
        momentum: 0.3,
        networkLayers: [64, 128, 64, 32],
        activationFunction: 'sigmoid',
        advancedModel: 'transformer_nlp',
    },
    coder: {
        primary: COGNITIVE_PATTERNS.CONVERGENT,
        secondary: COGNITIVE_PATTERNS.LATERAL,
        learningRate: 0.5,
        momentum: 0.2,
        networkLayers: [128, 256, 128, 64],
        activationFunction: 'relu',
        advancedModel: 'gru_sequence',
    },
    analyst: {
        primary: COGNITIVE_PATTERNS.CRITICAL,
        secondary: COGNITIVE_PATTERNS.ABSTRACT,
        learningRate: 0.6,
        momentum: 0.25,
        networkLayers: [96, 192, 96, 48],
        activationFunction: 'tanh',
        advancedModel: 'cnn_vision',
    },
    optimizer: {
        primary: COGNITIVE_PATTERNS.SYSTEMS,
        secondary: COGNITIVE_PATTERNS.CONVERGENT,
        learningRate: 0.4,
        momentum: 0.35,
        networkLayers: [80, 160, 80, 40],
        activationFunction: 'sigmoid',
    },
    coordinator: {
        primary: COGNITIVE_PATTERNS.SYSTEMS,
        secondary: COGNITIVE_PATTERNS.CRITICAL,
        learningRate: 0.55,
        momentum: 0.3,
        networkLayers: [112, 224, 112, 56],
        activationFunction: 'relu',
    },
};
class NeuralNetwork {
    config;
    layers;
    activationFunction;
    learningRate;
    momentum;
    memoryOptimizer;
    weights;
    biases;
    previousWeightDeltas;
    memoryAllocations;
    constructor(config, memoryOptimizer = null) {
        this.config = config;
        this.layers = config?.networkLayers;
        this.activationFunction = config?.activationFunction;
        this.learningRate = config?.learningRate;
        this.momentum = config?.momentum;
        this.memoryOptimizer = memoryOptimizer;
        this.weights = [];
        this.biases = [];
        this.previousWeightDeltas = [];
        this.memoryAllocations = [];
        this._initializeNetwork();
    }
    _initializeNetwork() {
        for (let i = 0; i < this.layers.length - 1; i++) {
            const inputSize = this.layers[i];
            const outputSize = this.layers[i + 1];
            if (inputSize === undefined || outputSize === undefined) {
                continue;
            }
            const limit = Math.sqrt(6 / (inputSize + outputSize));
            if (this.memoryOptimizer?.isPoolInitialized()) {
                const weightSize = outputSize * inputSize * 4;
                const biasSize = outputSize * 4;
                const weightAlloc = this.memoryOptimizer.allocateFromPool('weights', weightSize, this.config.cognitivePattern || 'default');
                const biasAlloc = this.memoryOptimizer.allocateFromPool('weights', biasSize, this.config.cognitivePattern || 'default');
                if (weightAlloc && biasAlloc) {
                    this.memoryAllocations.push(weightAlloc, biasAlloc);
                }
            }
            this.weights[i] = this._createMatrix(outputSize, inputSize, -limit, limit);
            this.biases[i] = this._createVector(outputSize, -0.1, 0.1);
            this.previousWeightDeltas[i] = this._createMatrix(outputSize, inputSize, 0, 0);
        }
    }
    _createMatrix(rows, cols, min, max) {
        const matrix = [];
        for (let i = 0; i < rows; i++) {
            matrix[i] = [];
            for (let j = 0; j < cols; j++) {
                matrix[i][j] = Math.random() * (max - min) + min;
            }
        }
        return matrix;
    }
    _createVector(size, min, max) {
        const vector = [];
        for (let i = 0; i < size; i++) {
            vector[i] = Math.random() * (max - min) + min;
        }
        return vector;
    }
    _activation(x, derivative = false) {
        switch (this.activationFunction) {
            case 'sigmoid':
                if (derivative) {
                    const sig = 1 / (1 + Math.exp(-x));
                    return sig * (1 - sig);
                }
                return 1 / (1 + Math.exp(-x));
            case 'tanh':
                if (derivative) {
                    const tanh = Math.tanh(x);
                    return 1 - tanh * tanh;
                }
                return Math.tanh(x);
            case 'relu':
                if (derivative) {
                    return x > 0 ? 1 : 0;
                }
                return Math.max(0, x);
            default:
                return x;
        }
    }
    forward(input) {
        const activations = [input];
        let currentInput = input;
        for (let i = 0; i < this.weights.length; i++) {
            const weights = this.weights[i];
            const biases = this.biases[i];
            const output = [];
            if (!(weights && biases)) {
                continue;
            }
            for (let j = 0; j < weights.length; j++) {
                let sum = biases[j] || 0;
                for (let k = 0; k < currentInput.length; k++) {
                    const weight = weights[j]?.[k];
                    const input = currentInput[k];
                    if (weight !== undefined && input !== undefined) {
                        sum += weight * input;
                    }
                }
                output[j] = this._activation(sum);
            }
            activations.push(output);
            currentInput = output;
        }
        return {
            output: currentInput,
            activations,
        };
    }
    train(input, target, learningRate) {
        const lr = learningRate || this.learningRate;
        const { activations } = this.forward(input);
        const errors = [];
        const output = activations[activations.length - 1];
        const outputError = [];
        if (!output) {
            return [];
        }
        for (let i = 0; i < output.length; i++) {
            const targetValue = target?.[i] || 0;
            const outputValue = output[i] || 0;
            outputError[i] =
                (targetValue - outputValue) * this._activation(outputValue, true);
        }
        errors.unshift(outputError);
        for (let i = this.weights.length - 1; i > 0; i--) {
            const layerError = [];
            const weights = this.weights[i];
            const prevError = errors[0];
            if (!(weights && prevError && this.weights[i - 1])) {
                continue;
            }
            for (let j = 0; j < (this.weights[i - 1]?.length || 0); j++) {
                let error = 0;
                for (let k = 0; k < weights.length; k++) {
                    const weight = weights[k]?.[j];
                    const prevErr = prevError[k];
                    if (weight !== undefined && prevErr !== undefined) {
                        error += weight * prevErr;
                    }
                }
                const activationValue = activations[i]?.[j] || 0;
                layerError[j] = error * this._activation(activationValue, true);
            }
            errors.unshift(layerError);
        }
        for (let i = 0; i < this.weights.length; i++) {
            const weights = this.weights[i];
            const biases = this.biases[i];
            const layerError = errors[i + 1];
            const layerInput = activations[i];
            if (!(weights && biases && layerError && layerInput)) {
                continue;
            }
            for (let j = 0; j < weights.length; j++) {
                const errorValue = layerError[j];
                if (errorValue !== undefined) {
                    biases[j] = (biases[j] || 0) + lr * errorValue;
                }
                for (let k = 0; k < (weights[j]?.length || 0); k++) {
                    const layerErr = layerError[j];
                    const inputVal = layerInput[k];
                    if (layerErr !== undefined && inputVal !== undefined) {
                        const delta = lr * layerErr * inputVal;
                        const prevDelta = this.previousWeightDeltas[i]?.[j]?.[k] || 0;
                        const momentumDelta = this.momentum * prevDelta;
                        if (weights[j] && weights[j][k] !== undefined) {
                            weights[j][k] += delta + momentumDelta;
                        }
                        if (this.previousWeightDeltas[i]?.[j]) {
                            this.previousWeightDeltas[i][j][k] = delta;
                        }
                    }
                }
            }
        }
        return output || [];
    }
    save() {
        return {
            config: this.config,
            weights: this.weights,
            biases: this.biases,
        };
    }
    load(data) {
        this.weights = data?.weights;
        this.biases = data?.biases;
    }
}
class NeuralAgent extends EventEmitter {
    agent;
    agentType;
    cognitiveProfile;
    memoryOptimizer;
    neuralNetwork;
    learningHistory;
    taskHistory;
    performanceMetrics;
    cognitiveState;
    memoryUsage;
    constructor(agent, agentType, memoryOptimizer = null) {
        super();
        this.agent = agent;
        this.agentType = agentType;
        this.cognitiveProfile = AGENT_COGNITIVE_PROFILES[agentType] || {
            primary: COGNITIVE_PATTERNS.CONVERGENT,
            secondary: COGNITIVE_PATTERNS.LATERAL,
            learningRate: 0.5,
            momentum: 0.2,
            networkLayers: [128, 64, 32],
            activationFunction: 'sigmoid',
        };
        this.memoryOptimizer =
            memoryOptimizer ||
                (MemoryOptimizer ? new MemoryOptimizer() : null);
        const networkConfig = {
            ...this.cognitiveProfile,
            cognitivePattern: this.cognitiveProfile.primary,
        };
        this.neuralNetwork = new NeuralNetwork(networkConfig, this.memoryOptimizer);
        this.learningHistory = [];
        this.taskHistory = [];
        this.performanceMetrics = {
            accuracy: 0,
            speed: 0,
            creativity: 0,
            efficiency: 0,
            memoryEfficiency: 0,
        };
        this.cognitiveState = {
            attention: 1.0,
            fatigue: 0.0,
            confidence: 0.5,
            exploration: 0.5,
        };
        this.memoryUsage = {
            baseline: 0,
            current: 0,
            peak: 0,
        };
        this._initializeMemoryTracking();
    }
    async analyzeTask(task) {
        const inputVector = this._taskToVector(task);
        const { output } = this.neuralNetwork.forward(inputVector);
        const analysis = {
            complexity: output[0],
            urgency: output[1],
            creativity: output[2],
            dataIntensity: output[3],
            collaborationNeeded: output[4],
            confidence: output[5],
        };
        this._applyCognitivePattern(analysis);
        return analysis;
    }
    async executeTask(task) {
        const startTime = Date.now();
        const analysis = await this.analyzeTask(task);
        this._updateCognitiveState(analysis);
        const result = await this.agent.execute({
            ...task,
            neuralAnalysis: analysis,
            cognitiveState: this.cognitiveState,
        });
        const executionTime = Date.now() - startTime;
        const performance = this._calculatePerformance(task, result, executionTime);
        await this._learnFromExecution(task, result, performance);
        this.emit('taskCompleted', {
            task,
            result,
            performance,
            cognitiveState: this.cognitiveState,
        });
        return result;
    }
    _taskToVector(task) {
        const vector = [];
        const description = task.description || '';
        vector.push(description.length / 1000, (description.match(/\b\w+\b/g) || []).length / 100, (description.match(/[A-Z]/g) || []).length / description.length, (description.match(/[0-9]/g) || []).length / description.length);
        const priorityMap = {
            low: 0.2,
            medium: 0.5,
            high: 0.8,
            critical: 1.0,
        };
        vector.push(priorityMap[task.priority || 'medium'] || 0.5);
        vector.push(Math.min(task.dependencies?.length || 0, 10) / 10);
        const similarTasks = this._findSimilarTasks(task);
        if (similarTasks.length > 0) {
            const avgPerformance = similarTasks.reduce((sum, t) => sum + t.performance.overall, 0) /
                similarTasks.length;
            vector.push(avgPerformance);
        }
        else {
            vector.push(0.5);
        }
        vector.push(this.cognitiveState.attention, this.cognitiveState.fatigue, this.cognitiveState.confidence, this.cognitiveState.exploration);
        const inputSize = this.neuralNetwork.layers?.[0] || 10;
        while (vector.length < inputSize) {
            vector.push(0);
        }
        return vector.slice(0, inputSize);
    }
    _applyCognitivePattern(analysis) {
        const primary = this.cognitiveProfile.primary;
        const secondary = this.cognitiveProfile.secondary;
        switch (primary) {
            case COGNITIVE_PATTERNS.CONVERGENT:
                analysis.complexity *= 0.9;
                analysis.confidence *= 1.1;
                break;
            case COGNITIVE_PATTERNS.DIVERGENT:
                analysis.creativity *= 1.2;
                analysis.exploration = 0.8;
                break;
            case COGNITIVE_PATTERNS.LATERAL:
                analysis.creativity *= 1.15;
                analysis.complexity *= 1.05;
                break;
            case COGNITIVE_PATTERNS.SYSTEMS:
                analysis.collaborationNeeded *= 1.2;
                analysis.dataIntensity *= 1.1;
                break;
            case COGNITIVE_PATTERNS.CRITICAL:
                analysis.confidence *= 0.9;
                analysis.complexity *= 1.1;
                break;
            case COGNITIVE_PATTERNS.ABSTRACT:
                analysis.complexity *= 0.95;
                analysis.creativity *= 1.05;
                break;
        }
        this._applySecondaryPattern(analysis, secondary);
    }
    _updateCognitiveState(analysis) {
        this.cognitiveState.fatigue = Math.min(this.cognitiveState.fatigue + analysis.complexity * 0.1, 1.0);
        this.cognitiveState.attention = Math.max(1.0 - this.cognitiveState.fatigue * 0.5, 0.3);
        if (this.learningHistory.length > 0) {
            const recentPerformance = this.learningHistory
                .slice(-5)
                .reduce((sum, h) => sum + h.performance, 0) /
                Math.min(this.learningHistory.length, 5);
            this.cognitiveState.confidence = 0.3 + recentPerformance * 0.7;
        }
        this.cognitiveState.exploration =
            0.2 + (1.0 - this.cognitiveState.confidence) * 0.6;
    }
    _calculatePerformance(_task, result, executionTime) {
        const performance = {
            speed: Math.max(0, 1 - executionTime / 60000),
            accuracy: result?.success ? 0.8 : 0.2,
            creativity: 0.5,
            efficiency: 0.5,
            overall: 0.5,
        };
        if (result?.metrics) {
            if (result?.metrics?.linesOfCode) {
                performance.efficiency = Math.min(1.0, 100 / result?.metrics?.linesOfCode);
            }
            if (result?.metrics?.testsPass) {
                performance.accuracy = result?.metrics?.testsPass;
            }
        }
        performance.overall =
            performance.speed * 0.2 +
                performance.accuracy * 0.4 +
                performance.creativity * 0.2 +
                performance.efficiency * 0.2;
        return performance;
    }
    async _learnFromExecution(task, result, performance) {
        const input = this._taskToVector(task);
        const target = [
            performance.overall,
            performance.speed,
            performance.accuracy,
            performance.creativity,
            performance.efficiency,
            result?.success ? 1.0 : 0.0,
        ];
        this.neuralNetwork.train(input, target);
        this.learningHistory.push({
            timestamp: Date.now(),
            task: task.id || 'unknown',
            performance: performance.overall,
            input,
            target,
        });
        if (this.learningHistory.length > 1000) {
            this.learningHistory = this.learningHistory.slice(-500);
        }
        this._updatePerformanceMetrics(performance);
        this.emit('learning', {
            task: task.id,
            performance,
            networkState: this.neuralNetwork.save(),
        });
    }
    _updatePerformanceMetrics(performance) {
        const alpha = 0.1;
        this.performanceMetrics.accuracy =
            (1 - alpha) * this.performanceMetrics.accuracy +
                alpha * performance.accuracy;
        this.performanceMetrics.speed =
            (1 - alpha) * this.performanceMetrics.speed + alpha * performance.speed;
        this.performanceMetrics.creativity =
            (1 - alpha) * this.performanceMetrics.creativity +
                alpha * performance.creativity;
        this.performanceMetrics.efficiency =
            (1 - alpha) * this.performanceMetrics.efficiency +
                alpha * performance.efficiency;
        const memoryRatio = this.memoryUsage.baseline / this.getCurrentMemoryUsage();
        const taskEfficiency = performance.overall;
        this.performanceMetrics.memoryEfficiency =
            (1 - alpha) * this.performanceMetrics.memoryEfficiency +
                alpha * (memoryRatio * taskEfficiency);
    }
    _findSimilarTasks(task, limit = 5) {
        if (this.taskHistory.length === 0) {
            return [];
        }
        const similarities = this.taskHistory.map((historicalTask) => {
            let similarity = 0;
            if (historicalTask.task.priority === task.priority) {
                similarity += 0.3;
            }
            const currentWords = new Set((task.description || '').toLowerCase().split(/\s+/));
            const historicalWords = new Set((historicalTask.task.description || '').toLowerCase().split(/\s+/));
            const intersection = new Set([...currentWords].filter((x) => historicalWords.has(x)));
            const union = new Set([...currentWords, ...historicalWords]);
            if (union.size > 0) {
                similarity += 0.7 * (intersection.size / union.size);
            }
            return {
                task: historicalTask,
                similarity,
            };
        });
        return similarities
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, limit)
            .filter((s) => s.similarity > 0.3)
            .map((s) => s.task);
    }
    _applySecondaryPattern(analysis, pattern) {
        const influence = 0.5;
        switch (pattern) {
            case COGNITIVE_PATTERNS.CONVERGENT:
                analysis.complexity *= 1 - influence * 0.1;
                analysis.confidence *= 1 + influence * 0.1;
                break;
            case COGNITIVE_PATTERNS.DIVERGENT:
                analysis.creativity *= 1 + influence * 0.2;
                break;
            case COGNITIVE_PATTERNS.LATERAL:
                analysis.creativity *= 1 + influence * 0.15;
                break;
            case COGNITIVE_PATTERNS.SYSTEMS:
                analysis.collaborationNeeded *= 1 + influence * 0.2;
                break;
            case COGNITIVE_PATTERNS.CRITICAL:
                analysis.confidence *= 1 - influence * 0.1;
                break;
            case COGNITIVE_PATTERNS.ABSTRACT:
                analysis.complexity *= 1 - influence * 0.05;
                break;
        }
    }
    rest(duration = 1000) {
        return new Promise((resolve) => {
            setTimeout(async () => {
                this.cognitiveState.fatigue = Math.max(0, this.cognitiveState.fatigue - 0.3);
                this.cognitiveState.attention = Math.min(1.0, this.cognitiveState.attention + 0.2);
                if (this.memoryOptimizer?.isPoolInitialized()) {
                    const collected = await this.memoryOptimizer.garbageCollect();
                    if (collected > 0) {
                        const patternConfig = PATTERN_MEMORY_CONFIG?.[this.cognitiveProfile.primary];
                        this.memoryUsage.current =
                            (patternConfig?.baseMemory || 100) *
                                (1 - (patternConfig?.poolSharing || 0.5) * 0.5);
                    }
                }
                resolve();
            }, duration);
        });
    }
    _initializeMemoryTracking() {
        const patternConfig = PATTERN_MEMORY_CONFIG?.[this.cognitiveProfile.primary] || {
            baseMemory: 100,
            poolSharing: 0.5,
        };
        this.memoryUsage.baseline = patternConfig.baseMemory || 100;
        this.memoryUsage.current = patternConfig.baseMemory || 100;
        if (this.memoryOptimizer && !this.memoryOptimizer.isPoolInitialized()) {
            this.memoryOptimizer.initializePools().then(() => {
                this.memoryUsage.current =
                    (patternConfig.baseMemory || 100) *
                        (1 - (patternConfig.poolSharing || 0.5) * 0.5);
            });
        }
    }
    getCurrentMemoryUsage() {
        let memoryUsage = this.memoryUsage.current;
        if (this.cognitiveState.fatigue > 0.5) {
            memoryUsage *= 1.1;
        }
        if (this.taskHistory.length > 100) {
            memoryUsage *= 1.05;
        }
        if (memoryUsage > this.memoryUsage.peak) {
            this.memoryUsage.peak = memoryUsage;
        }
        return memoryUsage;
    }
    getStatus() {
        return {
            ...this.agent,
            neuralState: {
                cognitiveProfile: this.cognitiveProfile,
                cognitiveState: this.cognitiveState,
                performanceMetrics: this.performanceMetrics,
                learningHistory: this.learningHistory.length,
                taskHistory: this.taskHistory.length,
                memoryUsage: {
                    current: `${this.getCurrentMemoryUsage().toFixed(0)} MB`,
                    baseline: `${this.memoryUsage.baseline.toFixed(0)} MB`,
                    peak: `${this.memoryUsage.peak.toFixed(0)} MB`,
                    efficiency: this.performanceMetrics.memoryEfficiency.toFixed(2),
                },
            },
        };
    }
    saveNeuralState() {
        return {
            agentType: this.agentType,
            neuralNetwork: this.neuralNetwork.save(),
            cognitiveState: this.cognitiveState,
            performanceMetrics: this.performanceMetrics,
            learningHistory: this.learningHistory.slice(-100),
            taskHistory: this.taskHistory.slice(-100),
        };
    }
    loadNeuralState(data) {
        if (data?.neuralNetwork) {
            this.neuralNetwork.load(data?.neuralNetwork);
        }
        if (data?.cognitiveState) {
            this.cognitiveState = data?.cognitiveState;
        }
        if (data?.performanceMetrics) {
            this.performanceMetrics = data?.performanceMetrics;
        }
        if (data?.learningHistory) {
            this.learningHistory = data?.learningHistory;
        }
        if (data?.taskHistory) {
            this.taskHistory = data?.taskHistory;
        }
    }
}
class NeuralAgentFactory {
    static memoryOptimizer = null;
    static async initializeFactory() {
        if (!NeuralAgentFactory.memoryOptimizer) {
            NeuralAgentFactory.memoryOptimizer = MemoryOptimizer
                ? new MemoryOptimizer()
                : null;
            if (NeuralAgentFactory.memoryOptimizer) {
                await NeuralAgentFactory.memoryOptimizer.initializePools();
            }
        }
    }
    static createNeuralAgent(baseAgent, agentType) {
        if (!AGENT_COGNITIVE_PROFILES[agentType]) {
            throw new Error(`Unknown agent type: ${agentType}`);
        }
        return new NeuralAgent(baseAgent, agentType, NeuralAgentFactory.memoryOptimizer);
    }
    static getCognitiveProfiles() {
        return AGENT_COGNITIVE_PROFILES;
    }
    static getCognitivePatterns() {
        return COGNITIVE_PATTERNS;
    }
}
setImmediate(() => {
    import('../core/network.ts')
        .catch(() => import('../core/neural.ts'))
        .catch(() => null)
        .then((neural) => {
        if (neural) {
            MemoryOptimizer = neural.MemoryOptimizer || MemoryOptimizer;
            PATTERN_MEMORY_CONFIG =
                neural.PATTERN_MEMORY_CONFIG || PATTERN_MEMORY_CONFIG;
        }
    })
        .catch(() => {
        MemoryOptimizer = class MockMemoryOptimizer extends EventEmitter {
            static once = EventEmitter.once;
            static on = EventEmitter.on;
            static listenerCount = EventEmitter.listenerCount;
            static getEventListeners = EventEmitter.getEventListeners;
            static getMaxListeners = EventEmitter.getMaxListeners;
            static setMaxListeners = EventEmitter.setMaxListeners;
            static addAbortListener = EventEmitter.addAbortListener;
            static eventNames() {
                return [];
            }
            static emit() {
                return false;
            }
            static removeListener() {
                return MockMemoryOptimizer;
            }
            isPoolInitialized() {
                return false;
            }
            initializePools() {
                return Promise.resolve();
            }
            garbageCollect() {
                return Promise.resolve(0);
            }
        };
        PATTERN_MEMORY_CONFIG = {
            convergent: { baseMemory: 100, poolSharing: 0.5 },
        };
    });
});
export { NeuralAgent, NeuralAgentFactory, NeuralNetwork, COGNITIVE_PATTERNS, AGENT_COGNITIVE_PROFILES, };
//# sourceMappingURL=neural-agent.js.map