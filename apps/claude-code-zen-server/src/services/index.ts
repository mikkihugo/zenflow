/**
 * @fileoverview Services Layer - Foundation Pattern
 *
 * Provides business logic services using foundation patterns.
 * Services delegate to strategic facades when needed.
 */

import { getLogger, createContainer } from "@claude-zen/foundation";

const logger = getLogger("services");

// Re-export service modules using foundation patterns
export * from "./api";
export * from "./web";
export * from "./coordination";

/**
 * Service container using foundation DI
 */
export const serviceContainer = createContainer();

logger.info("Services layer initialized with foundation patterns");
