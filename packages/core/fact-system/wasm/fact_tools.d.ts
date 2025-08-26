/**
 * Fact Tools WASM Module Wrapper
 *
 * Wraps the zen_swarm_neural WASM module to provide fact-system specific functionality.
 */
export interface RustFactEngine {
	verify_fact(fact: string): boolean;
	store_fact(fact: string, metadata?: any): void;
	query_facts(query: string): string[];
	analyze_patterns(data: string[]): any;
	process_bulk_facts(facts: string[]): any;
	neural_process?(input: any): any;
	coordinate_swarm?(params: any): any;
}
export declare function init(): Promise<void>;
export declare function create_fact_engine(): RustFactEngine;
export declare function verify_fact(fact: string): boolean;
export declare function store_fact(fact: string, metadata?: any): void;
export declare function query_facts(query: string): string[];
export default init;
//# sourceMappingURL=fact_tools.d.ts.map
