import { vi } from 'vitest';
const __protocolTypesIdentity = (v) => v;
__protocolTypesIdentity(undefined);
beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    setupDefaultMocks();
});
afterEach(() => {
    vi.clearAllMocks();
});
function setupDefaultMocks() {
    vi.spyOn(console, 'log').mockImplementation(() => { });
    vi.spyOn(console, 'warn').mockImplementation(() => { });
    vi.spyOn(console, 'error').mockImplementation(() => { });
    vi.useFakeTimers();
}
createInteractionSpy = (name) => {
    return vi.fn().mockName(name);
};
verifyInteractions = (spy, expectedCalls) => {
    expect(spy).toHaveBeenCalledTimes(expectedCalls.length);
    expectedCalls.forEach((call, index) => {
        expect(spy).toHaveBeenNthCalledWith(index + 1, ...call.args);
    });
};
createMockFactory = (defaults = {}) => {
    return (overrides = {}) => ({
        ...defaults,
        ...overrides,
    });
};
waitForInteraction = async (spy, timeout = 1000) => {
    const start = Date.now();
    while (spy.mock.calls.length === 0 && Date.now() - start < timeout) {
        await new Promise((resolve) => setTimeout(resolve, 10));
    }
    if (spy.mock.calls.length === 0) {
        throw new Error(`Expected interaction did not occur within ${timeout}ms`);
    }
};
simulateProtocolHandshake = (mockProtocol) => {
    mockProtocol.mockImplementation((message) => {
        if (message && message.type === 'handshake') {
            return Promise.resolve({ type: 'handshake_ack', success: true });
        }
        return Promise.resolve({ type: 'response', data: 'mock_response' });
    });
};
//# sourceMappingURL=setup-london.js.map