export class ClientError extends Error {
    code;
    client;
    cause;
    constructor(message, code, client, cause) {
        super(message);
        this.code = code;
        this.client = client;
        this.cause = cause;
        this.name = 'ClientError';
    }
}
export class ConnectionError extends ClientError {
    constructor(client, cause) {
        super(`Connection failed for client: ${client}`, 'CONNECTION_ERROR', client, cause);
        this.name = 'ConnectionError';
    }
}
export class AuthenticationError extends ClientError {
    constructor(client, cause) {
        super(`Authentication failed for client: ${client}`, 'AUTH_ERROR', client, cause);
        this.name = 'AuthenticationError';
    }
}
export class TimeoutError extends ClientError {
    constructor(client, timeout, cause) {
        super(`Request timeout (${timeout}ms) for client: ${client}`, 'TIMEOUT_ERROR', client, cause);
        this.name = 'TimeoutError';
    }
}
export class RetryExhaustedError extends ClientError {
    constructor(client, attempts, cause) {
        super(`Retry exhausted (${attempts} attempts) for client: ${client}`, 'RETRY_EXHAUSTED', client, cause);
        this.name = 'RetryExhaustedError';
    }
}
//# sourceMappingURL=interfaces.js.map