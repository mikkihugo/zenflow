export * from './auto-agent-assignment.ts';
export * from './hook-manager.ts';
export { DefaultHookManager } from './hook-manager.ts';
export { DefaultHookSystem, HookSystem, } from './hook-system-core.ts';
export * from './performance-tracker.ts';
export { FileOperationValidator, } from './safety-validator.ts';
import { DefaultHookManager } from './hook-manager.ts';
export function createHookManager() {
    return new DefaultHookManager();
}
export const HOOKS_VERSION = '1.0.0';
export const HOOKS_FEATURES = [
    'safety-validation',
    'auto-agent-assignment',
    'performance-tracking',
    'context-loading',
    'auto-formatting',
];
//# sourceMappingURL=index.js.map