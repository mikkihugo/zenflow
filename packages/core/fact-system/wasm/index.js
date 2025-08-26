/**
 * WASM module index for fact-system.
 *
 * Re-exports the zen_swarm_neural WASM module as fact_tools for compatibility.
 */
// Re-export everything from the fact_tools module
export * from "./fact_tools";
export { default } from "./fact_tools";
