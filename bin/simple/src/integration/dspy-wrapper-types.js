export { LMError } from 'dspy.ts';
export class DSPyWrapperError extends Error {
    code;
    cause;
    metadata;
    constructor(message, code, cause, metadata) {
        super(message);
        this.code = code;
        this.cause = cause;
        this.metadata = metadata;
        this.name = 'DSPyWrapperError';
    }
}
export default {
    DSPyWrapperError,
};
//# sourceMappingURL=dspy-wrapper-types.js.map