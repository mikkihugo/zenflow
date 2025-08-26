/**
 * @fileoverview Events Strategic Facade - Clean Delegation Pattern
 */

import { getLogger } from "@claude-zen/foundation";

const _logger = getLogger("events");

// =============================================================================
// STRATEGIC FACADE DELEGATION - Event Systems
// =============================================================================

export const createEventSystem = async () => {
	try {
		const { createEventBus } = await import("@claude-zen/event-system");
		return createEventBus();
	} catch (_error) {
		throw new Error(
			"Event system not available - @claude-zen/event-system package required",
		);
	}
};

export const getEventSystemAccess = async () => {
	try {
		const { getEventSystem } = await import("@claude-zen/event-system");
		return getEventSystem();
	} catch (_error) {
		throw new Error(
			"Event system not available - @claude-zen/event-system package required",
		);
	}
};

// Type exports for external consumers
export type * from "./types";
