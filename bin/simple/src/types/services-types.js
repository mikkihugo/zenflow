export class ServiceOperationError extends Error {
    service;
    operation;
    constructor(message, service, operation) {
        super(message);
        this.service = service;
        this.operation = operation;
        this.name = 'ServiceOperationError';
    }
}
export class ServiceTimeoutError extends Error {
    service;
    operation;
    constructor(message, service, operation) {
        super(message);
        this.service = service;
        this.operation = operation;
        this.name = 'ServiceTimeoutError';
    }
}
//# sourceMappingURL=services-types.js.map