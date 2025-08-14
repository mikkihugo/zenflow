export { ZenOrchestratorWrapper, } from './zen-orchestrator-wrapper.js';
export const BindingsUtils = {
    isNativeAvailable: () => {
        try {
            require('./build/Release/native');
            return true;
        }
        catch {
            return false;
        }
    },
    getBindingType: () => {
        if (BindingsUtils.isNativeAvailable()) {
            return 'native';
        }
        if (typeof WebAssembly !== 'undefined') {
            return 'wasm';
        }
        return 'fallback';
    },
    loadBinding: async () => {
        const bindingType = BindingsUtils.getBindingType();
        switch (bindingType) {
            case 'native':
                return require('./build/Release/native');
            case 'wasm': {
                const wasmModule = await import('./wasm-binding-interface.js');
                return wasmModule.default;
            }
            default:
                throw new Error('No bindings available');
        }
    },
};
export class BindingFactory {
    static instance = null;
    static async getInstance() {
        if (!BindingFactory.instance) {
            BindingFactory.instance = await BindingsUtils.loadBinding();
        }
        return BindingFactory.instance;
    }
    static clearInstance() {
        BindingFactory.instance = null;
    }
}
export default BindingsUtils;
//# sourceMappingURL=index.js.map