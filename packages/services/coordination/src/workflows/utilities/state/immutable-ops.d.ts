/**
 * @fileoverview Immutable Operations
 *
 * Professional immutable state management using Immer library.
 * Focused on safe state updates and transformations.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 */
import { type Draft } from 'immer';
/**
 * Professional immutable state utilities
 */
export declare class ImmutableOps {
    /**
     * Update state immutably with producer function
     */
    static update<T>(state: T, updater: (draft: Draft<T>) => void): T;
    /**
     * Deep clone using Immer's produce';
     */
    static clone<T>(state: T): T;
    /**
     * Merge objects immutably
     */
    static merge<T extends Record<string, any>>(base: T, updates: Partial<T>): T;
    /**
     * Update array item by ID immutably
     */
    static updateArrayItem<T extends {
        id: string;
    }>(array: T[], id: string, updater: (item: Draft<T>) => void): T[];
    /**
     * Add item to array immutably
     */
    static addToArray<T>(array: T[], item: T): T[];
    /**
     * Remove item from array immutably
     */
    static removeFromArray<T extends {
        id: string;
    }>(array: T[], id: string): T[];
}
//# sourceMappingURL=immutable-ops.d.ts.map