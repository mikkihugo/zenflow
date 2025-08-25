/**
 * @fileoverview Base Teleprompter Class - 100% Stanford DSPy API Compatible
 *
 * Abstract base class for all DSPy teleprompters.
 * Provides the foundation for program optimization and improvement.
 *
 * @version 1.0.0
 * @author Claude Code Zen Team
 */
/**
 * Abstract base class for all DSPy teleprompters
 *
 * This class provides the interface that all teleprompters must implement.
 * It follows the exact API design of Stanford DSPy's Teleprompter class.
 *
 * EXACT Stanford DSPy API:
 * def compile(self, student: Module, *, trainset: list[Example], teacher: Module|None = None, valset: list[Example]|None = None, **kwargs) -> Module:
 *
 * @abstract
 */
export class Teleprompter {
    /**
     * Get teleprompter parameters (matches Stanford get_params())
     * Returns all instance attributes as a dictionary
     */
    getParams() {
        // Return all enumerable properties (matches Python __dict__)
        const params = {};
        for (const key in this) {
            if (this.hasOwnProperty(key) && typeof this[key] !== 'function') {
                params[key] = this[key];
            }
        }
        return params;
    }
}
/**
 * Default export for compatibility
 */
export default Teleprompter;
