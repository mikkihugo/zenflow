/**
 * @file Swarm CLI Command - Direct MCP Integration.
 *
 * Simple, direct swarm commands using meow CLI parsing and MCP tool calls.
 * Replaces the complex terminal interface system with straightforward command execution.
 */
export interface SwarmOptions {
    agents?: number;
    topology?: 'mesh' | 'hierarchical' | 'ring' | 'star' | 'auto';
    verbose?: boolean;
    timeout?: number;
    format?: 'json' | 'table' | 'compact';
}
export declare const swarmCLI: import("meow").Result<{
    agents: {
        type: "number";
        shortFlag: string;
        default: number;
    };
    topology: {
        type: "string";
        shortFlag: string;
        default: string;
    };
    verbose: {
        type: "boolean";
        shortFlag: string;
        default: false;
    };
    timeout: {
        type: "number";
        default: number;
    };
    format: {
        type: "string";
        shortFlag: string;
        default: string;
    };
}>;
/**
 * Execute swarm command.
 *
 * @example
 */
export declare function executeSwarmCommand(): Promise<void>;
export default swarmCLI;
//# sourceMappingURL=swarm.d.ts.map