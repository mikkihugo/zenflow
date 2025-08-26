/**
 * @fileoverview Immutable Operations
 *
 * Professional immutable state management using Immer library.
 * Focused on safe state updates and transformations.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 */
import { enableMapSet, produce } from "immer";

// Enable Immer support for Map and Set
enableMapSet();
/**
 * Professional immutable state utilities
 */
export class ImmutableOps {
	/**
	 * Update state immutably with producer function
	 */
	static update(state, updater) {
		return produce(state, updater);
	}
	/**
	 * Deep clone using Immer's produce
	 */
	static clone(state) {
		return produce(state, () => {});
	}
	/**
	 * Merge objects immutably
	 */
	static merge(base, updates) {
		return produce(base, (draft) => {
			Object.assign(draft, updates);
		});
	}
	/**
	 * Update array item by ID immutably
	 */
	static updateArrayItem(array, id, updater) {
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
	static addToArray(array, item) {
		return produce(array, (draft) => {
			draft.push(item);
		});
	}
	/**
	 * Remove item from array immutably
	 */
	static removeFromArray(array, id) {
		return produce(array, (draft) => {
			const index = draft.findIndex((item) => item.id === id);
			if (index >= 0) {
				draft.splice(index, 1);
			}
		});
	}
}
//# sourceMappingURL=immutable-ops.js.map
