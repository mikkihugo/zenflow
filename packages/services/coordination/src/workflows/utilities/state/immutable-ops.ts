/**
 * @fileoverview Immutable Operations
 *
 * Professional immutable state management using Immer library.
 * Focused on safe state updates and transformations.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 */

import { type Draft, enableMapSet, produce } from 'immer';
// Enable Immer support for Map and Set
enableMapSet();

/**
 * Professional immutable state utilities
 */
export class ImmutableOps {
  /**
   * Update state immutably with producer function
   */
  static update<T>(state: T, updater: (draft: Draft<T>) => void): T {
    return produce(state, updater);
  }

  /**
   * Deep clone using Immer's produce
   */
  static clone<T>(state: T): T {
    return produce(state, () => {});
  }

  /**
   * Merge objects immutably
   */
  static merge<T extends Record<string, any>>(base: T, updates: Partial<T>): T {
    return produce(base, (draft) => {
      Object.assign(draft, updates);
    });
  }

  /**
   * Update array item by ID immutably
   */
  static updateArrayItem<T extends { id: string }>(
    array: T[],
    id: string,
    updater: (item: Draft<T>) => void
  ): T[] {
    return produce(array, (draft) => {
      const index = draft.findIndex((item) => item.id === id);
      if (index >= 0) {
        updater(draft[index]);
      }
    });
  }

  /**
   * Add item to array immutably
   */
  static addToArray<T>(array: T[], item: T): T[] {
    return produce(array, (draft: T[]) => {
      draft.push(item);
    });
  }

  /**
   * Remove item from array immutably
   */
  static removeFromArray<T extends { id: string }>(
    array: T[],
    id: string
  ): T[] {
    return produce(array, (draft) => {
      const index = draft.findIndex((item) => item.id === id);
      if (index >= 0) {
        draft.splice(index, 1);
      }
    });
  }
}
