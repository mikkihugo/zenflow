import { vi } from 'vitest';
export const jest = {
    fn: vi.fn.bind(vi),
    spyOn: vi.spyOn.bind(vi),
    mock: vi.fn.bind(vi),
    clearAllMocks: vi.clearAllMocks.bind(vi),
    resetAllMocks: vi.resetAllMocks.bind(vi),
    restoreAllMocks: vi.restoreAllMocks.bind(vi),
};
globalThis.jest = jest;
//# sourceMappingURL=jest-compat-setup.js.map