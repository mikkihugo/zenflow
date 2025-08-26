"use strict";
/**
 * @fileoverview Immutable Operations
 *
 * Professional immutable state management using Immer library.
 * Focused on safe state updates and transformations.
 *
 * @author Claude Code Zen Team
 * @since 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImmutableOps = void 0;
var immer_1 = require("immer");
// Enable Immer support for Map and Set
(0, immer_1.enableMapSet)();
/**
 * Professional immutable state utilities
 */
var ImmutableOps = /** @class */ (function () {
    function ImmutableOps() {
    }
    /**
     * Update state immutably with producer function
     */
    ImmutableOps.update = function (state, updater) {
        return (0, immer_1.produce)(state, updater);
    };
    /**
     * Deep clone using Immer's produce'
     */
    ImmutableOps.clone = function (state) {
        return (0, immer_1.produce)(state, function () { });
    };
    /**
     * Merge objects immutably
     */
    ImmutableOps.merge = function (base, updates) {
        return (0, immer_1.produce)(base, function (draft) {
            Object.assign(draft, updates);
        });
    };
    /**
     * Update array item by ID immutably
     */
    ImmutableOps.updateArrayItem = function (array, id, updater) {
        return (0, immer_1.produce)(array, function (draft) {
            var index = draft.findIndex(function (item) { return item.id === id; });
            if (index >= 0) {
                updater(draft[index]);
            }
        });
    };
    /**
     * Add item to array immutably
     */
    ImmutableOps.addToArray = function (array, item) {
        return (0, immer_1.produce)(array, function (draft) {
            draft.push(item);
        });
    };
    /**
     * Remove item from array immutably
     */
    ImmutableOps.removeFromArray = function (array, id) {
        return (0, immer_1.produce)(array, function (draft) {
            var index = draft.findIndex(function (item) { return item.id === id; });
            if (index >= 0) {
                draft.splice(index, 1);
            }
        });
    };
    return ImmutableOps;
}());
exports.ImmutableOps = ImmutableOps;
