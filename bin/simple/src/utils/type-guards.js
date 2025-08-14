export function isQuerySuccess(result) {
    return result?.success === true && 'data' in result;
}
export function isQueryError(result) {
    return result?.success === false && 'error' in result;
}
export function isMemorySuccess(result) {
    return result?.found === true && 'data' in result;
}
export function isMemoryNotFound(result) {
    return result?.found === false && 'reason' in result;
}
export function isMemoryError(result) {
    return result?.found === false && 'error' in result;
}
export function isTrainingResult(result) {
    return result?.type === 'training' && result?.success === true;
}
export function isInferenceResult(result) {
    return result?.type === 'inference' && result?.success === true;
}
export function isNeuralError(result) {
    return result?.type === 'error' && result?.success === false;
}
export function isAPISuccess(result) {
    return result?.success === true && 'data' in result;
}
export function isAPIError(result) {
    return result?.success === false && 'error' in result;
}
export function isWasmSuccess(result) {
    return result?.wasmSuccess === true && 'result' in result;
}
export function isWasmError(result) {
    return result?.wasmSuccess === false && 'error' in result;
}
export function isCoordinationSuccess(result) {
    return result?.coordinated === true && 'result' in result;
}
export function isCoordinationError(result) {
    return result?.coordinated === false && 'error' in result;
}
export function isSuccess(result) {
    return result?.ok === true && 'value' in result;
}
export function isFailure(result) {
    return result?.ok === false && 'error' in result;
}
export function extractData(result) {
    if (isQuerySuccess(result)) {
        return result?.data;
    }
    return null;
}
export function extractErrorMessage(result) {
    if ('success' in result && !result?.success && 'error' in result) {
        return result?.error?.message;
    }
    if ('found' in result && !result?.found && 'error' in result) {
        return result?.error?.message;
    }
    if ('wasmSuccess' in result && !result?.wasmSuccess && 'error' in result) {
        return result?.error?.message;
    }
    if ('coordinated' in result && !result?.coordinated && 'error' in result) {
        return result?.error?.message;
    }
    if ('ok' in result && !result?.ok && 'error' in result) {
        return result?.error instanceof Error
            ? result?.error?.message
            : String(result?.error);
    }
    return null;
}
export function hasProperty(obj, prop) {
    return (obj !== null && obj !== undefined && typeof obj === 'object' && prop in obj);
}
export function safePropertyAccess(obj, prop) {
    if (obj !== null &&
        obj !== undefined &&
        typeof obj === 'object' &&
        prop in obj) {
        return obj[prop];
    }
    return undefined;
}
export function isNeuralNetworkConfig(obj) {
    return (typeof obj === 'object' &&
        obj !== null &&
        Array.isArray(obj['layers']) &&
        obj['layers']?.['every']((layer) => typeof layer === 'number') &&
        Array.isArray(obj['activationFunctions']) &&
        obj['activationFunctions']?.['every']((fn) => typeof fn === 'string') &&
        typeof obj['learningRate'] === 'number');
}
export function isActivationFunction(value) {
    const validFunctions = [
        'sigmoid',
        'tanh',
        'relu',
        'leaky_relu',
        'elu',
        'swish',
        'gelu',
        'softmax',
    ];
    return typeof value === 'string' && validFunctions.includes(value);
}
export function isObjectArrayWithProps(arr, requiredProps) {
    if (!Array.isArray(arr)) {
        return false;
    }
    return arr.every((item) => {
        if (typeof item !== 'object' || item === null) {
            return false;
        }
        return requiredProps.every((prop) => prop in item);
    });
}
export function isNonEmptyString(value) {
    return typeof value === 'string' && value.length > 0;
}
export function isValidNumber(value) {
    return (typeof value === 'number' && !Number.isNaN(value) && Number.isFinite(value));
}
export function isPositiveNumber(value) {
    return isValidNumber(value) && value > 0;
}
//# sourceMappingURL=type-guards.js.map