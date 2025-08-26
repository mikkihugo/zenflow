/**
 * @fileoverview Documentation Package
 *
 * Provides documentation management and linking for Claude Code Zen.
 * Moved from core to maintain clean separation between generic documentation
 * functionality and SAFe-specific coordination.
 */

export type * from "./documentation-linker";
export { DocumentationLinker } from "./documentation-linker";
export * from "./documentation-manager";
