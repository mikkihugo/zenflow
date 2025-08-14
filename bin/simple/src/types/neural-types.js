export class NeuralError extends Error {
    code;
    details;
    constructor(message, code = 'NEURAL_ERROR', details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'NeuralError';
    }
}
//# sourceMappingURL=neural-types.js.map